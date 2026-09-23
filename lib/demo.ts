import type { SleepSession } from './types';

/** Explicit, temporary sample data; never mixed into personal history. */
export function sampleWeek(now = Date.now()): SleepSession[] {
  return [7.5, 6.8, 8.1, 7.2, 8, 6.5, 7.8].map((hours, i) => {
    const wake = new Date(now);
    wake.setDate(wake.getDate() - (6 - i));
    wake.setHours(7, 30, 0, 0);
    if (wake.getTime() > now) wake.setDate(wake.getDate() - 1);
    const sleepTime = wake.getTime() - hours * 3600000;
    const bedTime = sleepTime - (i % 3) * 15 * 60000;
    return { id: `sample-${i}`, bedTime, sleepTime, wakeTime: wake.getTime(),
      awakeGaps: bedTime === sleepTime ? [] : [{ start: bedTime, end: sleepTime }] };
  });
}
