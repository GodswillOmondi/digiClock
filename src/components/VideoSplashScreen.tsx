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
    instance.muted = Platform.OS === 'web' && !isElectronEnvironment();
    instance.play();
  });

  useEventListener(player, 'playToEnd', () => {
    finishSplash();
  });

  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'error') {
      finishSplash();
    } else if (status === 'readyToPlay' && !player.playing && !hasFinishedRef.current) {
      player.play();
    }
  });

  useEffect(() => {
    // On Web, VideoView mounts the underlying <video> element in its own useEffect
    // before this parent effect runs, so calling player.play() here starts web playback reliably.
    try {
      player.play();
    } catch {
      // Ignore if already playing
    }

    const timer = setTimeout(() => {
      finishSplash();
    }, FALLBACK_TIMEOUT_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [finishSplash, player]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
        allowsPictureInPicture={false}
        fullscreenOptions={{ enable: false }}
        playsInline
      />

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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  skipButtonPressed: {
    opacity: 0.6,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
