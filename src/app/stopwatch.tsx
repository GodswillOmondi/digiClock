import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ClockToolLayout, toolColors, toolStyles } from '@/components/ClockToolLayout';

type StopwatchStatus = 'idle' | 'running' | 'paused';
interface Lap { id: number; elapsed: number; split: number }

function formatElapsed(milliseconds: number, includeHours = false) {
  const centiseconds = Math.floor(milliseconds / 10);
  const minutes = Math.floor(centiseconds / 6000);
  const seconds = Math.floor((centiseconds % 6000) / 100);
  const hundredths = centiseconds % 100;
  const hours = Math.floor(minutes / 60);
  const visibleMinutes = includeHours ? minutes % 60 : minutes;
  const main = [visibleMinutes, seconds, hundredths].map((value) => String(value).padStart(2, '0')).join(':');
  return includeHours ? `${String(hours).padStart(2, '0')}:${main}` : main;
}

export default function StopwatchScreen() {
  const [status, setStatus] = useState<StopwatchStatus>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const accumulatedRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== 'running') return;
    const tick = () => setElapsed(accumulatedRef.current + Date.now() - (startedAtRef.current ?? Date.now()));
    tick();
    const interval = setInterval(tick, 30);
    return () => clearInterval(interval);
  }, [status]);

  const clockText = useMemo(() => formatElapsed(elapsed, elapsed >= 3_600_000), [elapsed]);

  const start = () => {
    startedAtRef.current = Date.now();
    setStatus('running');
  };

  const pause = () => {
    accumulatedRef.current += Date.now() - (startedAtRef.current ?? Date.now());
    startedAtRef.current = null;
    setElapsed(accumulatedRef.current);
    setStatus('paused');
  };

  const reset = () => {
    accumulatedRef.current = 0;
    startedAtRef.current = null;
    setElapsed(0);
    setLaps([]);
    setStatus('idle');
  };

  const recordLap = () => {
    const lapElapsed = status === 'running'
      ? accumulatedRef.current + Date.now() - (startedAtRef.current ?? Date.now())
      : elapsed;
    const previous = laps[0]?.elapsed ?? 0;
    setLaps((items) => [{ id: Date.now(), elapsed: lapElapsed, split: lapElapsed - previous }, ...items]);
  };

  return (
    <ClockToolLayout title="STOPWATCH" subtitle="ELAPSED TIME · LAP RECORDING">
      <View style={styles.body}>
        <Text style={[toolStyles.time, styles.time]}>{clockText}</Text>
        <Text style={styles.status}>{status.toUpperCase()}</Text>
        <View style={toolStyles.buttonRow}>
          {status === 'running' ? (
            <ToolButton label="PAUSE" onPress={pause} />
          ) : (
            <ToolButton label={status === 'paused' ? 'RESUME' : 'START'} onPress={start} />
          )}
          {status !== 'idle' && <ToolButton label="LAP" secondary onPress={recordLap} />}
          <ToolButton label="RESET" secondary onPress={reset} />
        </View>
        <View style={styles.lapList}>
          {laps.length === 0 ? (
            <Text style={styles.empty}>LAPS WILL APPEAR HERE</Text>
          ) : (
            <FlatList
              data={laps}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item, index }) => (
                <View style={styles.lapRow}>
                  <Text style={styles.lapLabel}>LAP {laps.length - index}</Text>
                  <Text style={styles.split}>{formatElapsed(item.split, item.split >= 3_600_000)}</Text>
                  <Text style={styles.lapTime}>{formatElapsed(item.elapsed, item.elapsed >= 3_600_000)}</Text>
                </View>
              )}
              initialNumToRender={5}
              windowSize={5}
            />
          )}
        </View>
      </View>
    </ClockToolLayout>
  );
}

function ToolButton({ label, onPress, secondary = false, disabled = false }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[toolStyles.button, secondary && toolStyles.secondaryButton, disabled && styles.disabled]}>
      <Text style={toolStyles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { width: '100%', alignItems: 'center', flex: 1 },
  time: { fontSize: 52 },
  status: { color: toolColors.muted, fontSize: 10, letterSpacing: 2, marginTop: 10 },
  lapList: { width: '100%', maxWidth: 520, flex: 1, marginTop: 20, borderTopWidth: 1, borderTopColor: toolColors.line },
  empty: { color: 'rgba(255,255,255,0.34)', fontSize: 9, textAlign: 'center', letterSpacing: 1.5, marginTop: 18 },
  lapRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  lapLabel: { color: toolColors.muted, flex: 1, fontSize: 10, letterSpacing: 1 },
  split: { color: toolColors.muted, fontSize: 12, marginRight: 24, fontVariant: ['tabular-nums'] },
  lapTime: { color: '#FFFFFF', fontSize: 12, fontVariant: ['tabular-nums'] },
  disabled: { opacity: 0.35 },
});
