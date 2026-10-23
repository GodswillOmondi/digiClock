import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as Device from 'expo-device';
import * as ScreenOrientation from 'expo-screen-orientation';

// Keep native OS splash screen visible until custom fonts and video splash mount
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [orientationReady, setOrientationReady] = useState(
    Platform.OS !== 'android' && Platform.OS !== 'ios'
  );
  const [fontsLoaded] = useFonts({
    'DSEG7Classic-Italic': require('../../assets/fonts/DSEG7Classic-Italic.ttf'),
    'DSEG7Classic-BoldItalic': require('../../assets/fonts/DSEG7Classic-BoldItalic.ttf'),
    'DSEG14Classic-Italic': require('../../assets/fonts/DSEG14Classic-Italic.ttf'),
    'DSEG14Classic-BoldItalic': require('../../assets/fonts/DSEG14Classic-BoldItalic.ttf'),
  });

  useEffect(() => {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') return;

    let active = true;
    const configureOrientation = async () => {
      try {
        const deviceType = await Device.getDeviceTypeAsync();
        if (!active) return;

        if (deviceType === Device.DeviceType.PHONE) {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE
          );
        } else {
          await ScreenOrientation.unlockAsync();
        }
      } catch {
        // Keep the current system orientation if the platform cannot set a lock.
      } finally {
        if (active) setOrientationReady(true);
      }
    };

    void configureOrientation();
    return () => {
      active = false;
      void ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'DigiClock';
      document.body.style.backgroundColor = '#000000';
      document.body.style.margin = '0';
      document.body.style.overflow = 'hidden';
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded && orientationReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, orientationReady]);

  if (!fontsLoaded) {
    return <View style={styles.loadingContainer} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
