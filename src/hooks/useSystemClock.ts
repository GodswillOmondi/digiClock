import { useEffect, useState } from 'react';

export interface ClockData {
  hours: string;
  minutes: string;
  seconds: string;
  timeString: string;
  dateString: string;
  period: 'AM' | 'PM';
  rawDate: Date;
}

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

export function formatClockData(now: Date, use24Hour: boolean): ClockData {
  const rawHours = now.getHours();
  const displayHours = use24Hour ? rawHours : rawHours % 12 || 12;
  const hours = String(displayHours).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const period: 'AM' | 'PM' = rawHours >= 12 ? 'PM' : 'AM';

  const dayName = DAYS[now.getDay()];
  const monthName = MONTHS[now.getMonth()];
  const dateNum = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();

  // Matches reference photo: "WED - OCT 21, 2026"
  const dateString = `${dayName} - ${monthName} ${dateNum}, ${year}`;
  const timeString = `${hours}:${minutes}:${seconds}`;

  return {
    hours,
    minutes,
    seconds,
    timeString,
    dateString,
    period,
    rawDate: now,
  };
}

/**
 * Synchronizes automatically with the system clock, aligning each tick
 * to the exact start of the next system second so the display never drifts.
 */
export function useSystemClock(use24Hour: boolean): ClockData {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const scheduleNextTick = () => {
      const current = new Date();
      if (isMounted) {
        setNow(current);
      }
      const msUntilNextSecond = 1000 - current.getMilliseconds();
      timeoutId = setTimeout(scheduleNextTick, msUntilNextSecond);
    };

    scheduleNextTick();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return formatClockData(now, use24Hour);
}
