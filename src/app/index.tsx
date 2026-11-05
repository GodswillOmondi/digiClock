import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';
import {
  COLOR_PRESETS,
  DEFAULT_COLOR_HEX,
  isValidHexColor,
} from '@/constants/colors';
import { useSystemClock } from '@/hooks/useSystemClock';
import { DigitalClockDisplay } from '@/components/DigitalClockDisplay';
import { StartupConfigModal } from '@/components/StartupConfigModal';
import { VideoSplashScreen } from '@/components/VideoSplashScreen';
import { ToolPickerModal } from '@/components/ToolPickerModal';

interface ElectronBridge {
  toggleFullscreen: () => Promise<boolean>;
  setFullscreen: (value: boolean) => Promise<boolean>;
  isFullscreen: () => Promise<boolean>;
  onFullscreenChanged: (callback: (state: boolean) => void) => () => void;
}

function getElectronAPI(): ElectronBridge | undefined {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return (window as unknown as { electronAPI?: ElectronBridge }).electronAPI;
  }
  return undefined;
}

export default function ClockScreen() {
  // Keep phone/desktop screen awake while clock is open
  useKeepAwake();

  const params = useLocalSearchParams<{ color?: string; format?: string }>();

  const initialColor = (() => {
    if (params.color) {
      const normalized = params.color.startsWith('#')
        ? params.color
        : `#${params.color}`;
      if (isValidHexColor(normalized)) {
        return normalized.toUpperCase();
      }
      const matchedPreset = COLOR_PRESETS.find(
        (p) => p.id.toLowerCase() === params.color?.toLowerCase()
      );
      if (matchedPreset) {
        return matchedPreset.hex;
      }
    }
    return DEFAULT_COLOR_HEX;
  })();

  const [selectedColor, setSelectedColor] = useState<string>(initialColor);
  const [use24Hour, setUse24Hour] = useState<boolean>(
    params.format === '12' ? false : true
  );
  const [splashVisible, setSplashVisible] = useState<boolean>(true);
  const [configModalVisible, setConfigModalVisible] = useState<boolean>(true);
  const [isInitialStartup, setIsInitialStartup] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [toolPickerVisible, setToolPickerVisible] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const clock = useSystemClock(use24Hour);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('digiclock.preferences')
      .then((raw) => {
        if (!active || !raw) return;
        const saved = JSON.parse(raw) as { color?: unknown; use24Hour?: unknown };
        if (!params.color && typeof saved.color === 'string' && isValidHexColor(saved.color)) {
          setSelectedColor(saved.color.toUpperCase());
        }
        if (!params.format && typeof saved.use24Hour === 'boolean') {
          setUse24Hour(saved.use24Hour);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setPreferencesLoaded(true);
      });
    return () => { active = false; };
  }, [params.color, params.format]);

  useEffect(() => {
    if (!preferencesLoaded) return;
    AsyncStorage.setItem(
      'digiclock.preferences',
      JSON.stringify({ color: selectedColor, use24Hour })
    ).catch(() => {});
  }, [preferencesLoaded, selectedColor, use24Hour]);

  const resetAutoHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3500);
  }, []);

  useEffect(() => {
    hideControlsTimeout.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3500);
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  // Listen to fullscreen state changes on Desktop Electron or Web Browser
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const electronAPI = getElectronAPI();
    if (electronAPI) {
      electronAPI.isFullscreen().then(setIsFullscreen).catch(() => {});
      const unsubscribe = electronAPI.onFullscreenChanged((state) => {
        setIsFullscreen(state);
      });
      return unsubscribe;
    }

    if (typeof document === 'undefined') return;
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const requestBrowserFullscreen = useCallback(async () => {
    const electronAPI = getElectronAPI();
    if (electronAPI) {
      try {
        const nextState = await electronAPI.setFullscreen(true);
        setIsFullscreen(nextState);
      } catch {
        // Ignore
      }
      return;
    }

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        // Ignore if browser blocks fullscreen without direct gesture
      }
    }
  }, []);

  const toggleBrowserFullscreen = useCallback(async () => {
    const electronAPI = getElectronAPI();
    if (electronAPI) {
      try {
        const nextState = await electronAPI.toggleFullscreen();
        setIsFullscreen(nextState);
      } catch {
        // Ignore
      }
      resetAutoHideTimer();
      return;
    }

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch {
        // Ignore fullscreen errors
      }
    }
    resetAutoHideTimer();
  }, [resetAutoHideTimer]);

  const handleStartClock = useCallback(() => {
    setConfigModalVisible(false);
    if (isInitialStartup) {
      setIsInitialStartup(false);
      requestBrowserFullscreen();
    }
    resetAutoHideTimer();
  }, [isInitialStartup, requestBrowserFullscreen, resetAutoHideTimer]);

  const handleCycleColor = useCallback(() => {
    const currentIndex = COLOR_PRESETS.findIndex(
      (p) => p.hex.toUpperCase() === selectedColor.toUpperCase()
    );
    const nextIndex = (currentIndex + 1) % COLOR_PRESETS.length;
    setSelectedColor(COLOR_PRESETS[nextIndex].hex);
    resetAutoHideTimer();
  }, [selectedColor, resetAutoHideTimer]);

  const handleToggle24Hour = useCallback(() => {
    setUse24Hour((prev) => !prev);
    resetAutoHideTimer();
  }, [resetAutoHideTimer]);

  return (
    <View style={styles.screen}>
      <DigitalClockDisplay
        clock={clock}
        color={selectedColor}
        use24Hour={use24Hour}
        isFullscreen={isFullscreen}
        controlsVisible={controlsVisible}
        onScreenInteract={resetAutoHideTimer}
        onOpenSettings={() => setConfigModalVisible(true)}
        onOpenTools={() => setToolPickerVisible(true)}
        onToggle24Hour={handleToggle24Hour}
        onCycleColor={handleCycleColor}
        onToggleFullscreen={toggleBrowserFullscreen}
      />

      <ToolPickerModal
        visible={toolPickerVisible}
        onClose={() => setToolPickerVisible(false)}
        onSelect={(path) => {
          setToolPickerVisible(false);
          router.push(path as Href);
        }}
      />

      <StartupConfigModal
        visible={!splashVisible && configModalVisible}
        selectedColor={selectedColor}
        use24Hour={use24Hour}
        onSelectColor={setSelectedColor}
        onToggle24Hour={setUse24Hour}
        onStartClock={handleStartClock}
        isInitialStartup={isInitialStartup}
      />

      {splashVisible && (
        <VideoSplashScreen onFinish={() => setSplashVisible(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
