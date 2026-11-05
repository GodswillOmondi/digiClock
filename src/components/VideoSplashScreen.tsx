import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

const SPLASH_VIDEO_SOURCE = require('../../assets/digiclock-splash.mp4');

// Video duration is ~10.0s; fallback ensures the app never hangs if playback is blocked
const FALLBACK_TIMEOUT_MS = 11500;

interface VideoSplashScreenProps {
  onFinish: () => void;
}

function isElectronEnvironment(): boolean {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return Boolean((window as unknown as { electronAPI?: unknown }).electronAPI);
  }
  return false;
}

export function VideoSplashScreen({ onFinish }: VideoSplashScreenProps) {
  const [opacity] = useState(() => new Animated.Value(1));
  const hasFinishedRef = useRef(false);

  const finishSplash = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    Animated.timing(opacity, {
      toValue: 0,
      duration: 450,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      onFinish();
    });
  }, [onFinish, opacity]);

  const player = useVideoPlayer(SPLASH_VIDEO_SOURCE, (instance) => {
    instance.loop = false;
    // Standard web browsers block unmuted autoplay without prior user gesture;
    // Electron desktop and native Android/iOS allow unmuted playback on launch.
    const isWebBrowser = Platform.OS === 'web' && !isElectronEnvironment();
    if (isWebBrowser) {
      instance.muted = true;
      instance.volume = 0;
    }
    try {
      instance.play();
    } catch {
      // Ignore initial play error if DOM isn't ready
    }
  });

  useEventListener(player, 'playToEnd', () => {
    finishSplash();
  });

  useEventListener(player, 'statusChange', ({ status, error }) => {
    if (status === 'error') {
      const msg = error?.message || '';
      // On Web, React dev mode (StrictMode) or fast refresh unmounts/remounts the video DOM element,
      // which causes browsers to reject the pending play() promise with AbortError.
      // This is non-fatal: do not prematurely destroy the splash screen.
      if (msg.includes('AbortError') || msg.includes('interrupted')) {
        setTimeout(() => {
          if (!hasFinishedRef.current) {
            try {
              player.play();
            } catch {
              // Ignore
            }
          }
        }, 150);
        return;
      }
      finishSplash();
    } else if (status === 'readyToPlay' && !player.playing && !hasFinishedRef.current) {
      try {
        player.play();
      } catch {
        // Ignore
      }
    }
  });

  useEffect(() => {
    let isMounted = true;

    // Small delay allows VideoView's DOM element on web to be fully attached
    const playTimer = setTimeout(() => {
      if (isMounted && !hasFinishedRef.current) {
        try {
          player.play();
        } catch {
          // Ignore
        }
      }
    }, 50);

    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        finishSplash();
      }
    }, FALLBACK_TIMEOUT_MS);

    return () => {
      isMounted = false;
      clearTimeout(playTimer);
      clearTimeout(fallbackTimer);
    };
  }, [finishSplash, player]);

  const handleContainerPress = () => {
    if (!player.playing && !hasFinishedRef.current) {
      try {
        player.play();
      } catch {
        // Ignore
      }
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Pressable onPress={handleContainerPress} style={styles.videoTouchable}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls={false}
          allowsPictureInPicture={false}
          fullscreenOptions={{ enable: false }}
          playsInline
        />
      </Pressable>

      <View style={styles.bottomBar}>
        <Pressable
          onPress={finishSplash}
          style={({ pressed }) => [
            styles.skipButton,
            pressed && styles.skipButtonPressed,
          ]}
        >
          <Text style={styles.skipText}>SKIP</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  videoTouchable: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  bottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 28 : 44,
    right: 28,
    zIndex: 1000,
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    borderRadius: 0,
    paddingHorizontal: 14,
    paddingVertical: 7,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      } as Record<string, unknown>,
    }),
  },
  skipButtonPressed: {
    opacity: 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
