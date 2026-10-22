import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { ClockData } from '@/hooks/useSystemClock';

interface DigitalClockDisplayProps {
  clock: ClockData;
  color: string;
  use24Hour: boolean;
  isFullscreen: boolean;
  controlsVisible: boolean;
  onScreenInteract: () => void;
  onOpenSettings: () => void;
  onToggle24Hour: () => void;
  onCycleColor: () => void;
  onToggleFullscreen: () => void;
}

export function DigitalClockDisplay({
  clock,
  color,
  use24Hour,
  isFullscreen,
  controlsVisible,
  onScreenInteract,
  onOpenSettings,
  onToggle24Hour,
  onCycleColor,
  onToggleFullscreen,
}: DigitalClockDisplayProps) {
  const { width, height } = useWindowDimensions();

  // Target 75% of the screen width for the full 8-character HH:MM:SS display.
  // In DSEG7Classic-BoldItalic (unitsPerEm = 1000):
  // - 6 digits ('0'-'9') have an advance width of 0.816em each (6 * 0.816 = 4.896em)
  // - 2 colons (':') have an advance width of 0.364em each (2 * 0.364 = 0.728em)
  // - Total base advance = 5.624em, plus italic overhang and letterSpacing (~5.95em total).
  // Dividing targetTimeWidth by 6.0 ensures all 6 digits and both colons fit within 75% screen width.
  const targetTimeWidth = width * 0.75;
  const widthBasedFontSize = targetTimeWidth / 6.0;
  const heightCapFontSize = height * 0.36;
  const timeFontSize = Math.max(20, Math.min(widthBasedFontSize, heightCapFontSize));

  // Bottom center date ("WED - OCT 21, 2026") is 18 characters.
  const dateFontSize = Math.max(12, Math.min(timeFontSize * 0.22, width * 0.036));

  return (
    <Pressable
      onPress={onScreenInteract}
      // @ts-expect-error onMouseMove is supported on React Native Web for desktop hover wake
      onMouseMove={onScreenInteract}
      style={styles.container}
    >
      {/* Top-right subtle icon bar (matching the top-right status icons in reference photo) */}
      {controlsVisible && (
        <View style={styles.topRightBar}>
          <Pressable
            onPress={onCycleColor}
            style={({ pressed }) => [
              styles.controlChip,
              pressed && styles.chipPressed,
            ]}
          >
            <View style={[styles.colorDot, { backgroundColor: color }]} />
            <Text style={styles.controlText}>COLOUR</Text>
          </Pressable>

          <Pressable
            onPress={onToggle24Hour}
            style={({ pressed }) => [
              styles.controlChip,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={styles.controlText}>{use24Hour ? '24H' : '12H'}</Text>
          </Pressable>

          {Platform.OS === 'web' && (
            <Pressable
              onPress={onToggleFullscreen}
              style={({ pressed }) => [
                styles.controlChip,
                pressed && styles.chipPressed,
              ]}
            >
              <Text style={styles.controlText}>
                {isFullscreen ? 'EXIT FULL' : 'FULLSCREEN'}
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={onOpenSettings}
            style={({ pressed }) => [
              styles.controlChip,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={styles.controlText}>CONFIG</Text>
          </Pressable>
        </View>
      )}

      {/* Center Main Clock Display (HH:MM:SS covering 75% screen width) */}
      <View style={styles.centerTimeWrapper}>
        <View style={styles.timeBox}>
          <Text
            numberOfLines={1}
            style={[
              styles.timeText,
              {
                color,
                fontSize: timeFontSize,
                textShadowColor: color,
              },
            ]}
          >
            {clock.timeString}
          </Text>
        </View>
      </View>

      {/* Bottom Center Date Display: DAY - MONTH DATE, YEAR (e.g., WED - OCT 21, 2026) */}
      <View style={styles.bottomDateWrapper}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.dateText,
            {
              color,
              fontSize: dateFontSize,
              textShadowColor: color,
            },
          ]}
        >
          {clock.dateString}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
  },
  topRightBar: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 18 : 44,
    right: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  controlChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipPressed: {
    opacity: 0.6,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  controlText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  centerTimeWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '4%',
  },
  timeBox: {
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontFamily: 'DSEG7Classic-BoldItalic',
    textAlign: 'center',
    letterSpacing: 1,
    paddingHorizontal: 12,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
    includeFontPadding: false,
  },
  bottomDateWrapper: {
    position: 'absolute',
    bottom: '10%',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontFamily: 'DSEG14Classic-Italic',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    includeFontPadding: false,
  },
});
