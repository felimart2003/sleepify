import { NightStats, SleepSession } from './types';

export function nightStats(session: SleepSession): NightStats | null {
  if (session.wakeTime == null) return null;
  const awakeMs = session.awakeGaps.reduce((sum, g) => sum + (g.end - g.start), 0);
  return {
    session,
    sleepMs: session.wakeTime - session.sleepTime,
    inBedMs: session.wakeTime - session.bedTime,
    awakeMs,
  };
}

/** Completed nights whose wake time falls within the last `days` days, oldest first. */
export function recentNights(sessions: SleepSession[], days: number): NightStats[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return sessions
    .map(nightStats)
    .filter((s): s is NightStats => s !== null && s.session.wakeTime! >= cutoff)
    .sort((a, b) => a.session.wakeTime! - b.session.wakeTime!);
}

export function averageMs(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** "7h 23m" style duration formatting. */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function formatTime(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** Label a night by the evening it started, e.g. "Tue, Jun 9". */
export function formatNightLabel(session: SleepSession): string {
  return new Date(session.bedTime).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Short weekday label for chart axis, based on wake time. */
export function formatDayShort(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString([], { weekday: 'narrow' });
}
