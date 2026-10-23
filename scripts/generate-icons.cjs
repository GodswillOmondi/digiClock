const fs = require('fs');
const path = require('path');
const Jimp = require('jimp-compact');

const svgPath = path.join(__dirname, '..', 'assets', 'digiclock-1.svg');
const svg = fs.readFileSync(svgPath, 'utf8');
const pathRegex =
  /<path d="([^"]+)" fill="([^"]+)" transform="translate\(([^,]+),([^)]+)\)"\/>/g;

function parsePath(d, tx, ty) {
  const tokens = d.match(/[MCZ]|-?\d+(?:\.\d+)?/g) || [];
  const polys = [];
  let current = [];
  let i = 0;
  let cx = 0;
  let cy = 0;
  while (i < tokens.length) {
    const t = tokens[i++];
    if (t === 'M') {
      if (current.length > 0) polys.push(current);
      cx = parseFloat(tokens[i++]) + tx;
      cy = parseFloat(tokens[i++]) + ty;
      current = [[cx, cy]];
    } else if (t === 'C') {
      const x1 = parseFloat(tokens[i++]) + tx;
      const y1 = parseFloat(tokens[i++]) + ty;
      const x2 = parseFloat(tokens[i++]) + tx;
      const y2 = parseFloat(tokens[i++]) + ty;
      const x3 = parseFloat(tokens[i++]) + tx;
      const y3 = parseFloat(tokens[i++]) + ty;
      const steps = 12;
      for (let s = 1; s <= steps; s++) {
        const u = s / steps;
        const inv = 1 - u;
        const px =
          inv * inv * inv * cx +
          3 * inv * inv * u * x1 +
          3 * inv * u * u * x2 +
          u * u * u * x3;
        const py =
          inv * inv * inv * cy +
          3 * inv * inv * u * y1 +
          3 * inv * u * u * y2 +
          u * u * u * y3;
        current.push([px, py]);
      }
      cx = x3;
      cy = y3;
    } else if (t === 'Z') {
      if (current.length > 0) {
        polys.push(current);
        current = [];
      }
    }
  }
  if (current.length > 0) polys.push(current);
  return polys;
}

const shapes = [];
let idx = 0;
for (const m of svg.matchAll(pathRegex)) {
  const d = m[1];
  const hex = m[2].toUpperCase();
  const tx = parseFloat(m[3]);
  const ty = parseFloat(m[4]);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const isOuterCornerCutout =
    idx === 3 || idx === 5 || idx === 6 || idx === 90;
  shapes.push({
    polys: parsePath(d, tx, ty),
    r,
    g,
    b,
    hex,
    isOuterCornerCutout,
    idx,
  });
  idx++;
}

function renderSVGToBuffer(width, height, opts = {}) {
  const {
    scale = 1.0,
    cutoutCorners = true,
    monochrome = false,
    onlyEmblem = false,
    bgColor = null,
  } = opts;

  const ss = 2;
  const sw = width * ss;
  const sh = height * ss;
  const buf = new Uint8Array(sw * sh * 4);

  if (bgColor) {
    for (let i = 0; i < sw * sh * 4; i += 4) {
      buf[i] = bgColor[0];
      buf[i + 1] = bgColor[1];
      buf[i + 2] = bgColor[2];
      buf[i + 3] = bgColor[3];
    }
  }

  const svgW = 688;
  const svgH = 679;
  const baseScale = Math.min(sw / svgW, sh / svgH) * scale;
  const offsetX = (sw - svgW * baseScale) / 2;
  const offsetY = (sh - svgH * baseScale) / 2;

  for (const shape of shapes) {
    let minY = Infinity;
    let maxY = -Infinity;
    let minX = Infinity;
    let maxX = -Infinity;
    const edges = [];
    for (const poly of shape.polys) {
      const n = poly.length;
      if (n < 3) continue;
      for (let i = 0; i < n; i++) {
        const x1 = poly[i][0] * baseScale + offsetX;
        const y1 = poly[i][1] * baseScale + offsetY;
        const x2 = poly[(i + 1) % n][0] * baseScale + offsetX;
        const y2 = poly[(i + 1) % n][1] * baseScale + offsetY;
        if (y1 < minY) minY = y1;
        if (y1 > maxY) maxY = y1;
        if (x1 < minX) minX = x1;
        if (x1 > maxX) maxX = x1;
        if (y1 === y2) continue;
        edges.push(
          y1 < y2 ? { x1, y1, x2, y2 } : { x1: x2, y1: y2, x2: x1, y2: y1 }
        );
      }
    }

    if (onlyEmblem) {
      if (shape.idx < 7) continue;
      const origMinX = (minX - offsetX) / baseScale;
      const origMaxX = (maxX - offsetX) / baseScale;
      const origMinY = (minY - offsetY) / baseScale;
      const origMaxY = (maxY - offsetY) / baseScale;
      if (
        origMinX < 80 ||
        origMaxX > 605 ||
        origMinY < 120 ||
        origMaxY > 520
      ) {
        continue;
      }
    }

    const yStart = Math.max(0, Math.floor(minY));
    const yEnd = Math.min(sh - 1, Math.ceil(maxY));

    for (let y = yStart; y <= yEnd; y++) {
      const scanY = y + 0.5;
      const xs = [];
      for (let e = 0; e < edges.length; e++) {
        const edge = edges[e];
        if (scanY >= edge.y1 && scanY < edge.y2) {
          const x =
            edge.x1 +
            ((scanY - edge.y1) * (edge.x2 - edge.x1)) / (edge.y2 - edge.y1);
          xs.push(x);
        }
      }
      if (xs.length < 2) continue;
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const xStart = Math.max(0, Math.floor(xs[k] + 0.5));
        const xEnd = Math.min(sw - 1, Math.floor(xs[k + 1] - 0.5));
        for (let x = xStart; x <= xEnd; x++) {
          const p = (y * sw + x) * 4;
          if (cutoutCorners && shape.isOuterCornerCutout) {
            if (bgColor) {
              buf[p] = bgColor[0];
              buf[p + 1] = bgColor[1];
              buf[p + 2] = bgColor[2];
              buf[p + 3] = bgColor[3];
            } else {
              buf[p] = 0;
              buf[p + 1] = 0;
              buf[p + 2] = 0;
              buf[p + 3] = 0;
            }
          } else if (onlyEmblem) {
            const lum =
              0.299 * shape.r + 0.587 * shape.g + 0.114 * shape.b;
            if (lum < 95) {
              if (bgColor) {
                buf[p] = bgColor[0];
                buf[p + 1] = bgColor[1];
                buf[p + 2] = bgColor[2];
                buf[p + 3] = bgColor[3];
              } else {
                buf[p] = 0;
                buf[p + 1] = 0;
                buf[p + 2] = 0;
                buf[p + 3] = 0;
              }
            } else if (monochrome) {
              buf[p] = 255;
              buf[p + 1] = 255;
              buf[p + 2] = 255;
              buf[p + 3] = 255;
            } else {
              buf[p] = shape.r;
              buf[p + 1] = shape.g;
              buf[p + 2] = shape.b;
              buf[p + 3] = 255;
            }
          } else {
            buf[p] = shape.r;
            buf[p + 1] = shape.g;
            buf[p + 2] = shape.b;
            buf[p + 3] = 255;
          }
        }
      }
    }
  }

  if (cutoutCorners && !onlyEmblem) {
    const rCorner = 165 * baseScale;
    const left = offsetX + 2 * baseScale;
    const right = offsetX + (svgW - 2) * baseScale;
    const top = offsetY + 2 * baseScale;
    const bottom = offsetY + (svgH - 2) * baseScale;
    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        let outOfBounds = x < left || x > right || y < top || y > bottom;
        if (!outOfBounds) {
          let dx = 0;
          let dy = 0;
          if (x < left + rCorner && y < top + rCorner) {
            dx = left + rCorner - x;
            dy = top + rCorner - y;
          } else if (x > right - rCorner && y < top + rCorner) {
            dx = x - (right - rCorner);
            dy = top + rCorner - y;
          } else if (x < left + rCorner && y > bottom - rCorner) {
            dx = left + rCorner - x;
            dy = y - (bottom - rCorner);
          } else if (x > right - rCorner && y > bottom - rCorner) {
            dx = x - (right - rCorner);
            dy = y - (bottom - rCorner);
          }
          if (dx * dx + dy * dy > rCorner * rCorner) outOfBounds = true;
        }
        if (outOfBounds) {
          const p = (y * sw + x) * 4;
          if (bgColor) {
            buf[p] = bgColor[0];
            buf[p + 1] = bgColor[1];
            buf[p + 2] = bgColor[2];
            buf[p + 3] = bgColor[3];
          } else {
            buf[p] = 0;
            buf[p + 1] = 0;
            buf[p + 2] = 0;
            buf[p + 3] = 0;
          }
        }
      }
    }
  }

  const out = Buffer.alloc(width * height * 4);
  const inv = 1 / (ss * ss);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let dy = 0; dy < ss; dy++) {
        for (let dx = 0; dx < ss; dx++) {
          const sp = ((y * ss + dy) * sw + (x * ss + dx)) * 4;
          const sa = buf[sp + 3];
          r += buf[sp] * sa;
          g += buf[sp + 1] * sa;
          b += buf[sp + 2] * sa;
          a += sa;
        }
      }
      const dp = (y * width + x) * 4;
      const finalA = Math.round(a * inv);
      if (finalA > 0) {
        out[dp] = Math.round(r / a);
        out[dp + 1] = Math.round(g / a);
        out[dp + 2] = Math.round(b / a);
        out[dp + 3] = finalA;
      }
    }
  }
  return out;
}

async function generateAll() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  await new Jimp({
    data: renderSVGToBuffer(1024, 1024, { scale: 1.0, cutoutCorners: true }),
    width: 1024,
    height: 1024,
  }).writeAsync(path.join(assetsDir, 'icon.png'));

  await new Jimp({
    data: renderSVGToBuffer(1024, 1024, { scale: 1.0, cutoutCorners: true }),
    width: 1024,
    height: 1024,
  }).writeAsync(path.join(assetsDir, 'splash-icon.png'));

  await new Jimp({
    data: renderSVGToBuffer(48, 48, { scale: 1.0, cutoutCorners: true }),
    width: 48,
    height: 48,
  }).writeAsync(path.join(assetsDir, 'favicon.png'));

  await new Jimp({
    data: renderSVGToBuffer(512, 512, { scale: 0.74, cutoutCorners: true }),
    width: 512,
    height: 512,
  }).writeAsync(path.join(assetsDir, 'android-icon-foreground.png'));

  await new Jimp({
    data: renderSVGToBuffer(512, 512, {
      bgColor: [0x17, 0x18, 0x1b, 255],
      onlyEmblem: true,
      scale: 0,
    }),
    width: 512,
    height: 512,
  }).writeAsync(path.join(assetsDir, 'android-icon-background.png'));

  await new Jimp({
    data: renderSVGToBuffer(432, 432, {
      scale: 0.82,
      onlyEmblem: true,
      monochrome: true,
    }),
    width: 432,
    height: 432,
  }).writeAsync(path.join(assetsDir, 'android-icon-monochrome.png'));

  console.log('Generated all DigiClock icons from assets/digiclock-1.svg');
}

generateAll();
