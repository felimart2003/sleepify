import type { SleepSession } from './types';

/** Stored data is untrusted: validate before it reaches charts or arithmetic. */
export function isSession(value: unknown): value is SleepSession {
  if (!value || typeof value !== 'object') return false;
  const s = value as SleepSession;
  const time = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
  return typeof s.id === 'string' && s.id.length > 0 && time(s.bedTime) &&
    time(s.sleepTime) && s.sleepTime >= s.bedTime &&
    (s.wakeTime === null || (time(s.wakeTime) && s.wakeTime >= s.sleepTime)) &&
    Array.isArray(s.awakeGaps) && s.awakeGaps.every((g, i) =>
      g && time(g.start) && time(g.end) && g.start >= s.bedTime &&
      g.end >= g.start && g.end <= s.sleepTime &&
      (i === 0 || g.start >= s.awakeGaps[i - 1].end));
}

export function parseSessions(raw: string): SleepSession[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(isSession)) throw new Error('Saved sleep data is invalid.');
  if (new Set(parsed.map(s => s.id)).size !== parsed.length || parsed.filter(s => s.wakeTime === null).length > 1) {
    throw new Error('Saved sleep data contains duplicate sessions.');
  }
  return parsed;
}
