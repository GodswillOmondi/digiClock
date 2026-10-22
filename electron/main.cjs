const { app, BrowserWindow, ipcMain, powerSaveBlocker } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

let mainWindow = null;
let powerBlockerId = null;
let staticServer = null;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function resolveDistDir() {
  const unpackedCandidate = path.join(
    __dirname.replace('app.asar', 'app.asar.unpacked'),
    '..',
    'dist'
  );
  if (fs.existsSync(unpackedCandidate)) {
    return unpackedCandidate;
  }
  return path.join(__dirname, '..', 'dist');
}

function startLocalStaticServer(distDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const parsedUrl = new URL(req.url || '/', 'http://127.0.0.1');
        let pathname = decodeURIComponent(parsedUrl.pathname);
        if (pathname === '/') {
          pathname = '/index.html';
        }

        let filePath = path.join(distDir, pathname);
        // Prevent path traversal outside distDir
        if (!filePath.startsWith(distDir)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          filePath = path.join(distDir, 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, content) => {
          if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
          }
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        });
      } catch {
        res.writeHead(500);
        res.end('Server error');
      }
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, port: address.port });
    });

    server.on('error', reject);
  });
}

async function createWindow() {
  const distDir = resolveDistDir();
  const { server, port } = await startLocalStaticServer(distDir);
  staticServer = server;

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    fullscreen: true,
    autoHideMenuBar: true,
    title: 'DigiClock',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  // Keyboard shortcuts for desktop ergonomics:
  // F11 toggles fullscreen, Escape exits fullscreen so user can drag window across monitors
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown') {
      if (input.key === 'F11') {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
        event.preventDefault();
      } else if (input.key === 'Escape' && mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(false);
        event.preventDefault();
      }
    }
  });

  mainWindow.on('enter-full-screen', () => {
    mainWindow?.webContents.send('fullscreen-changed', true);
  });

  mainWindow.on('leave-full-screen', () => {
    mainWindow?.webContents.send('fullscreen-changed', false);
  });

  await mainWindow.loadURL(`http://127.0.0.1:${port}`);
}

ipcMain.handle('toggle-fullscreen', () => {
  if (!mainWindow) return false;
  const nextState = !mainWindow.isFullScreen();
  mainWindow.setFullScreen(nextState);
  return nextState;
});

ipcMain.handle('set-fullscreen', (_event, value) => {
  if (!mainWindow) return false;
  mainWindow.setFullScreen(Boolean(value));
  return mainWindow.isFullScreen();
});

ipcMain.handle('is-fullscreen', () => {
  return mainWindow ? mainWindow.isFullScreen() : false;
});

app.whenReady().then(async () => {
  // Prevent the desktop monitor from going to sleep while DigiClock is running
  powerBlockerId = powerSaveBlocker.start('prevent-display-sleep');
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (powerBlockerId !== null && powerSaveBlocker.isStarted(powerBlockerId)) {
    powerSaveBlocker.stop(powerBlockerId);
  }
  if (staticServer) {
    staticServer.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
