import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { cancelTimerAlert, scheduleTimerAlert } from '@/lib/timerAlerts';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

interface TimerContextValue {
  remainingMs: number;
  status: TimerStatus;
  alertMessage: string;
  start: (durationMs: number) => void;
  pause: () => void;
  reset: (durationMs: number) => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: PropsWithChildren) {
  const [remainingMs, setRemainingMs] = useState(0);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [alertMessage, setAlertMessage] = useState('');
  const targetRef = useRef<number | null>(null);
  const notificationIdRef = useRef<string | null>(null);
  const generationRef = useRef(0);
  const statusRef = useRef<TimerStatus>('idle');

  const updateStatus = useCallback((value: TimerStatus) => {
    statusRef.current = value;
    setStatus(value);
  }, []);

  useEffect(() => {
    if (status !== 'running') return;
    const tick = () => {
      const remaining = Math.max(0, (targetRef.current ?? Date.now()) - Date.now());
      setRemainingMs(remaining);
      if (remaining <= 0 && statusRef.current === 'running') {
        updateStatus('finished');
      }
    };
    tick();
    const interval = setInterval(tick, 200);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    return () => { clearInterval(interval); subscription.remove(); };
  }, [status, updateStatus]);

  const start = useCallback((durationMs: number) => {
    if (statusRef.current === 'paused') {
      if (remainingMs <= 0) return;
      targetRef.current = Date.now() + remainingMs;
      updateStatus('running');
      setAlertMessage('');
      const generation = ++generationRef.current;
      void scheduleTimerAlert(targetRef.current ?? Date.now()).then(async (result) => {
        if (generation !== generationRef.current || statusRef.current !== 'running') {
          await cancelTimerAlert(result.notificationId);
          return;
        }
        notificationIdRef.current = result.notificationId;
        if (result.message) setAlertMessage(result.message);
      }).catch(() => setAlertMessage('Timer resumed, but its background alert could not be scheduled.'));
      return;
    }

    if (durationMs <= 0) {
      setAlertMessage('Set a duration greater than zero.');
      return;
    }
    void cancelTimerAlert(notificationIdRef.current);
    notificationIdRef.current = null;
    const generation = ++generationRef.current;
    targetRef.current = Date.now() + durationMs;
    setRemainingMs(durationMs);
    setAlertMessage('');
    updateStatus('running');
    void scheduleTimerAlert(targetRef.current ?? Date.now()).then(async (result) => {
      if (generation !== generationRef.current || statusRef.current !== 'running') {
        await cancelTimerAlert(result.notificationId);
        return;
      }
      notificationIdRef.current = result.notificationId;
      if (result.message) setAlertMessage(result.message);
    }).catch(() => setAlertMessage('Timer is running, but its background alert could not be scheduled.'));
  }, [remainingMs, updateStatus]);

  const pause = useCallback(() => {
    const remaining = Math.max(0, (targetRef.current ?? Date.now()) - Date.now());
    setRemainingMs(remaining);
    targetRef.current = null;
    generationRef.current += 1;
    updateStatus('paused');
    void cancelTimerAlert(notificationIdRef.current);
    notificationIdRef.current = null;
  }, [updateStatus]);

  const reset = useCallback((durationMs: number) => {
    generationRef.current += 1;
    void cancelTimerAlert(notificationIdRef.current);
    notificationIdRef.current = null;
    targetRef.current = null;
    setRemainingMs(durationMs);
    setAlertMessage('');
    updateStatus('idle');
  }, [updateStatus]);

  return (
    <TimerContext.Provider value={{ remainingMs, status, alertMessage, start, pause, reset }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const value = useContext(TimerContext);
  if (!value) throw new Error('useTimer must be used inside TimerProvider');
  return value;
}
