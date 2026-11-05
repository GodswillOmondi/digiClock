import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AndroidImportance, SchedulableTriggerInputTypes } from 'expo-notifications';

const TIMER_CHANNEL_ID = 'digiclock-timer';
let requestedExactAlarmAccess = false;

export interface TimerAlertResult {
  notificationId: string | null;
  message?: string;
}

interface ElectronTimerBridge {
  scheduleTimerNotification?: (delayMs: number) => Promise<string | null>;
  cancelTimerNotification?: (id: string) => void;
}

function getElectronTimerBridge(): ElectronTimerBridge | undefined {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;
  return (window as Window & { electronAPI?: ElectronTimerBridge }).electronAPI;
}

export async function scheduleTimerAlert(targetTimeMs: number): Promise<TimerAlertResult> {
  if (Platform.OS === 'web') {
    const id = await getElectronTimerBridge()?.scheduleTimerNotification?.(targetTimeMs);
    return { notificationId: id ?? null };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(TIMER_CHANNEL_ID, {
      name: 'Timer alerts',
      importance: AndroidImportance.HIGH,
      vibrationPattern: [0, 300, 200, 300],
    });
  }

  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    return { notificationId: null, message: 'Allow notifications to receive a timer alert outside DigiClock.' };
  }

  let exactAlarmGranted = true;
  if (Platform.OS === 'android') {
    try {
      let exact = await Notifications.getExactAlarmPermissionsAsync();
      if (!exact.granted && !requestedExactAlarmAccess) {
        requestedExactAlarmAccess = true;
        exact = await Notifications.requestExactAlarmPermissionsAsync();
      }
      exactAlarmGranted = exact.granted;
    } catch {
      exactAlarmGranted = false;
    }
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time's up",
      body: 'Your DigiClock timer has finished.',
      sound: true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.ceil((targetTimeMs - Date.now()) / 1000)),
      ...(Platform.OS === 'android' ? { channelId: TIMER_CHANNEL_ID } : {}),
    },
  });

  return {
    notificationId,
    message: exactAlarmGranted ? undefined : 'Exact alarm access was declined; Android may deliver the alert late.',
  };
}

export async function cancelTimerAlert(notificationId: string | null) {
  if (!notificationId) return;
  if (Platform.OS === 'web') {
    getElectronTimerBridge()?.cancelTimerNotification?.(notificationId);
    return;
  }
  await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {});
}
