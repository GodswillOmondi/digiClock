import React, { useMemo, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance, type ViewStyle } from 'react-native';
import { ClockToolLayout, toolColors, toolStyles } from '@/components/ClockToolLayout';
import { useTimer } from '@/providers/TimerProvider';
import { useSystemClock } from '@/hooks/useSystemClock';
import { useClockPreferences } from '@/hooks/useClockPreferences';

const WHEEL_ITEM_HEIGHT = 44;
const WHEEL_VIEWPORT_HEIGHT = 176;
const WHEEL_EDGE_PADDING = (WHEEL_VIEWPORT_HEIGHT - WHEEL_ITEM_HEIGHT) / 2;
const webScrollSnapStyle = {
  scrollSnapType: 'y mandatory',
  overscrollBehaviorY: 'contain',
} as ViewStyle;
const webSnapItemStyle = { scrollSnapAlign: 'center' } as ViewStyle;

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.ceil(Math.max(milliseconds, 0) / 1000);
  const values = [Math.floor(totalSeconds / 3600), Math.floor((totalSeconds % 3600) / 60), totalSeconds % 60];
  return values.map((value) => String(value).padStart(2, '0')).join(':');
}

export default function TimerScreen() {
  const { width } = useWindowDimensions();
  const { remainingMs, status, alertMessage, start, pause, reset } = useTimer();
  const initialSeconds = status === 'idle' ? 300 : Math.ceil(remainingMs / 1000);
  const [hours, setHours] = useState(() => Math.floor(initialSeconds / 3600));
  const [minutes, setMinutes] = useState(() => Math.floor((initialSeconds % 3600) / 60));
  const [seconds, setSeconds] = useState(() => initialSeconds % 60);
  const [configurationVisible, setConfigurationVisible] = useState(status === 'idle');
  const { color, use24Hour } = useClockPreferences();
  const durationMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
  const systemClock = useSystemClock(use24Hour);

  const startTimer = () => {
    if (durationMs <= 0) return;
    reset(durationMs);
    start(durationMs);
    setConfigurationVisible(false);
  };

  const footerFontSize = Math.max(10, Math.min(15, width * 0.018));

  return (
    <ClockToolLayout
      title="TIMER"
      subtitle="COUNTDOWN"
      footer={(
        <View style={styles.footerContent}>
          <Text style={[styles.systemTime, { fontSize: footerFontSize, color, textShadowColor: color }]}>{systemClock.timeString}</Text>
          <Text style={[styles.date, { fontSize: footerFontSize * 0.82, color, textShadowColor: color }]}>{systemClock.dateString}</Text>
        </View>
      )}
      actions={(
        <Pressable onPress={() => setConfigurationVisible(true)} accessibilityRole="button" accessibilityLabel="Configure timer" style={styles.headerAction}>
          <Text style={styles.headerActionText}>SET</Text>
        </Pressable>
      )}
      renderFace={({ fontSize, controlsVisible }) => (
        <View style={styles.faceContent}>
          <Text adjustsFontSizeToFit numberOfLines={1} style={[toolStyles.time, { fontSize, color, textShadowColor: color }]}>{formatDuration(status === 'idle' ? durationMs : remainingMs)}</Text>
          {status === 'finished' && <Text style={styles.finished}>TIME&apos;S UP</Text>}
          {alertMessage ? <Text style={styles.alertMessage}>{alertMessage}</Text> : null}
          {controlsVisible && (
            <View style={toolStyles.buttonRow}>
              {status === 'running' ? (
                <ToolButton label="PAUSE" onPress={pause} />
              ) : status === 'paused' ? (
                <ToolButton label="RESUME" onPress={() => start(remainingMs)} />
              ) : (
                <ToolButton label={status === 'finished' ? 'NEW TIMER' : 'CONFIGURE'} onPress={() => setConfigurationVisible(true)} />
              )}
              {status !== 'idle' && status !== 'finished' ? (
                <ToolButton label="RESET" secondary onPress={() => reset(durationMs)} />
              ) : null}
            </View>
          )}
        </View>
      )}
    >
      <TimerConfigurationDialog
        visible={configurationVisible}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
        onHoursChange={setHours}
        onMinutesChange={setMinutes}
        onSecondsChange={setSeconds}
        onStart={startTimer}
        onCancel={() => setConfigurationVisible(false)}
      />
    </ClockToolLayout>
  );
}

function TimerConfigurationDialog({
  visible, hours, minutes, seconds, onHoursChange, onMinutesChange, onSecondsChange, onStart, onCancel,
}: {
  visible: boolean;
  hours: number;
  minutes: number;
  seconds: number;
  onHoursChange: (value: number) => void;
  onMinutesChange: (value: number) => void;
  onSecondsChange: (value: number) => void;
  onStart: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.dialog}>
          <Text style={styles.dialogTitle}>SET TIMER</Text>
          <Text style={styles.dialogSubtitle}>SCROLL TO CHOOSE A DURATION</Text>
          <View style={styles.wheels}>
            <WheelColumn value={hours} maximum={99} label="HOURS" onChange={onHoursChange} />
            <Text style={styles.colon}>:</Text>
            <WheelColumn value={minutes} maximum={59} label="MINUTES" onChange={onMinutesChange} />
            <Text style={styles.colon}>:</Text>
            <WheelColumn value={seconds} maximum={59} label="SECONDS" onChange={onSecondsChange} />
          </View>
          <View style={styles.dialogButtons}>
            <ToolButton label="CANCEL" secondary onPress={onCancel} />
            <ToolButton label="START" onPress={onStart} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function WheelColumn({ value, maximum, label, onChange }: { value: number; maximum: number; label: string; onChange: (value: number) => void }) {
  const values = useMemo(() => Array.from({ length: maximum + 1 }, (_, index) => index), [maximum]);
  const [activeIndex, setActiveIndex] = useState(value);
  const lastReportedIndexRef = useRef(value);
  const scrollRef = useRef<ScrollViewInstance>(null);
  const reportCenteredValue = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    const nextIndex = Math.max(0, Math.min(maximum, Math.round(offset / WHEEL_ITEM_HEIGHT)));
    if (nextIndex === lastReportedIndexRef.current) return;
    lastReportedIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    onChange(nextIndex);
  };

  return (
    <View style={styles.wheelColumn}>
      <View style={styles.wheelViewport}>
      <ScrollView
        ref={scrollRef}
        style={[styles.wheelScroll, Platform.OS === 'web' && webScrollSnapStyle]}
        onLayout={() => scrollRef.current?.scrollTo({ x: 0, y: value * WHEEL_ITEM_HEIGHT, animated: false })}
        onContentSizeChange={() => scrollRef.current?.scrollTo({ x: 0, y: value * WHEEL_ITEM_HEIGHT, animated: false })}
        contentContainerStyle={styles.wheelPadding}
        snapToInterval={Platform.OS === 'web' ? undefined : WHEEL_ITEM_HEIGHT}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={reportCenteredValue}
        onMomentumScrollEnd={reportCenteredValue}
        onScrollEndDrag={reportCenteredValue}
      >
        {values.map((item) => {
          const distance = Math.abs(item - activeIndex);
          const opacity = Math.max(0.16, 1 - distance * 0.27);
          const fontSize = item === activeIndex ? 27 : Math.max(14, 22 - distance * 3);
          return (
            <View key={item} style={[styles.wheelItem, Platform.OS === 'web' && webSnapItemStyle]}>
              <Text style={[styles.wheelNumber, { opacity, fontSize }, item === activeIndex && styles.wheelNumberSelected]}>
                {String(item).padStart(2, '0')}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <View pointerEvents="none" style={styles.wheelSelectionBand} />
      </View>
      <Text style={styles.wheelLabel}>{label}</Text>
    </View>
  );
}

function ToolButton({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.button, secondary && styles.secondaryButton]}>
      <Text style={toolStyles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  faceContent: { width: '100%', alignItems: 'center', paddingHorizontal: 8 },
  finished: { color: toolColors.accent, fontSize: 11, letterSpacing: 2, marginTop: 14 },
  alertMessage: { color: '#FFC857', fontSize: 10, textAlign: 'center', marginTop: 12 },
  footerContent: { alignItems: 'center', gap: 8 },
  systemTime: { color: toolColors.accent, fontFamily: 'DSEG7Classic-Italic', letterSpacing: 1, textShadowColor: toolColors.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  date: { color: toolColors.accent, fontFamily: 'DSEG14Classic-Italic', letterSpacing: 1, textAlign: 'center', textShadowColor: toolColors.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  headerAction: { minWidth: 72, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: toolColors.line },
  headerActionText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18, backgroundColor: 'rgba(0,0,0,0.86)' },
  dialog: { width: '100%', maxWidth: 540, padding: 22, borderWidth: 1, borderColor: 'rgba(230,230,0,0.52)', backgroundColor: '#090909', alignItems: 'center' },
  dialogTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 2 },
  dialogSubtitle: { color: toolColors.muted, fontSize: 9, letterSpacing: 1.1, marginTop: 6 },
  wheels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 18, marginBottom: 12 },
  wheelColumn: { width: 76, alignItems: 'center' },
  wheelViewport: { height: WHEEL_VIEWPORT_HEIGHT, width: 76, position: 'relative', overflow: 'hidden' },
  wheelScroll: { height: WHEEL_VIEWPORT_HEIGHT, width: 76 },
  wheelPadding: { paddingVertical: WHEEL_EDGE_PADDING },
  wheelItem: { height: WHEEL_ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center', width: 76 },
  wheelSelectionBand: { position: 'absolute', top: WHEEL_EDGE_PADDING, left: 0, right: 0, height: WHEEL_ITEM_HEIGHT, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(230,230,0,0.34)' },
  wheelNumber: { color: '#FFFFFF', fontFamily: 'DSEG7Classic-Italic', textAlign: 'center' },
  wheelNumberSelected: { color: toolColors.accent, textShadowColor: toolColors.accent, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 9 },
  wheelLabel: { color: toolColors.muted, fontSize: 7, letterSpacing: 0.8, marginTop: 2 },
  colon: { color: toolColors.accent, fontSize: 22, marginHorizontal: 3, marginBottom: 20 },
  dialogButtons: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 12 },
  button: { minWidth: 112, minHeight: 44, borderWidth: 1, borderColor: toolColors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  secondaryButton: { borderColor: toolColors.line },
});
