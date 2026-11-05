import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ClockToolLayout, toolColors, toolStyles } from '@/components/ClockToolLayout';
import { useTimer } from '@/providers/TimerProvider';

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.ceil(Math.max(milliseconds, 0) / 1000);
  const values = [Math.floor(totalSeconds / 3600), Math.floor((totalSeconds % 3600) / 60), totalSeconds % 60];
  return values.map((value) => String(value).padStart(2, '0')).join(':');
}

export default function TimerScreen() {
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('05');
  const [seconds, setSeconds] = useState('00');
  const [inputError, setInputError] = useState('');
  const { remainingMs, status, alertMessage, start, pause, reset } = useTimer();
  const durationMs = ((Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60 + (Number(seconds) || 0)) * 1000;

  useEffect(() => {
    if (status === 'idle') reset(durationMs);
  }, [durationMs, status, reset]);

  const update = (setter: (value: string) => void) => (value: string) => setter(value.replace(/\D/g, '').slice(-3));

  const startOrResume = () => {
    setInputError('');
    if (status === 'idle' && durationMs <= 0) {
      setInputError('Set a duration greater than zero.');
      return;
    }
    start(durationMs);
  };

  return (
    <ClockToolLayout title="TIMER" subtitle="COUNT DOWN · ALERT WHEN COMPLETE">
      <View style={styles.body}>
        <Text style={[toolStyles.time, styles.time]}>{formatDuration(remainingMs)}</Text>
        <Text style={styles.status}>{status === 'finished' ? 'TIMER COMPLETE' : status.toUpperCase()}</Text>
        {status === 'idle' && (
          <View style={styles.inputs}>
            <TimeField label="HOURS" value={hours} onChangeText={update(setHours)} />
            <Text style={styles.separator}>:</Text>
            <TimeField label="MINUTES" value={minutes} onChangeText={update(setMinutes)} />
            <Text style={styles.separator}>:</Text>
            <TimeField label="SECONDS" value={seconds} onChangeText={update(setSeconds)} />
          </View>
        )}
        <View style={toolStyles.buttonRow}>
          {status === 'running' ? (
            <ToolButton label="PAUSE" onPress={pause} />
          ) : (
            <ToolButton label={status === 'paused' ? 'RESUME' : 'START'} onPress={startOrResume} />
          )}
          <ToolButton label="RESET" secondary onPress={() => { setInputError(''); reset(durationMs); }} />
        </View>
        {inputError || alertMessage ? <Text style={styles.alertMessage}>{inputError || alertMessage}</Text> : null}
      </View>
    </ClockToolLayout>
  );
}

function TimeField({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return (
    <View style={styles.field}>
      <TextInput value={value} onChangeText={onChangeText} keyboardType="number-pad" maxLength={3} selectTextOnFocus style={styles.input} accessibilityLabel={label} />
      <Text style={styles.fieldLabel}>{label}</Text>
    </View>
  );
}

function ToolButton({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[toolStyles.button, secondary && toolStyles.secondaryButton]}>
      <Text style={toolStyles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { width: '100%', alignItems: 'center' },
  time: { fontSize: 58 },
  status: { color: toolColors.muted, fontSize: 10, letterSpacing: 2, marginTop: 10 },
  inputs: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22 },
  field: { alignItems: 'center' },
  input: { width: 74, height: 42, borderWidth: 1, borderColor: toolColors.line, color: '#FFFFFF', textAlign: 'center', fontSize: 17, fontVariant: ['tabular-nums'], backgroundColor: toolColors.panel },
  fieldLabel: { color: toolColors.muted, fontSize: 8, letterSpacing: 1, marginTop: 6 },
  separator: { color: toolColors.accent, fontSize: 20, marginTop: -14 },
  alertMessage: { color: '#FFC857', fontSize: 11, textAlign: 'center', marginTop: 14 },
});
