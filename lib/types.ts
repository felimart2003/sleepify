/** A period where the user was in bed but couldn't fall asleep. */
export interface AwakeGap {
  /** When the user previously marked themselves as going to sleep (epoch ms). */
  start: number;
  /** When the user pressed "still can't sleep", restarting the clock (epoch ms). */
  end: number;
}

/** One night of sleep, from pressing "going to sleep" to pressing "I'm awake". */
export interface SleepSession {
  id: string;
  /** First press of the sleep button — when the user got into bed (epoch ms). */
  bedTime: number;
  /** Effective sleep start — the most recent press of the sleep button (epoch ms). */
  sleepTime: number;
  /** When the user pressed the wake button. Null while the night is in progress. */
  wakeTime: number | null;
  /** Logged periods of lying awake before falling asleep. */
  awakeGaps: AwakeGap[];
}

export interface NightStats {
  session: SleepSession;
  /** wakeTime - sleepTime: the actual sleep duration (ms). */
  sleepMs: number;
  /** wakeTime - bedTime: total time in bed (ms). */
  inBedMs: number;
  /** Sum of awake gaps: time spent failing to fall asleep (ms). */
  awakeMs: number;
}
