import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedPreferences {
  color?: unknown;
  use24Hour?: unknown;
}

export function useClockPreferences() {
  const [color, setColor] = useState('#E6E600');
  const [use24Hour, setUse24Hour] = useState(true);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('digiclock.preferences').then((raw) => {
      if (!active || !raw) return;
      const preferences = JSON.parse(raw) as SavedPreferences;
      if (typeof preferences.color === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(preferences.color)) {
        setColor(preferences.color.toUpperCase());
      }
      if (typeof preferences.use24Hour === 'boolean') setUse24Hour(preferences.use24Hour);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  return { color, use24Hour };
}
