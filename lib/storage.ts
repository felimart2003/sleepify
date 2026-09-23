import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepSession } from './types';
import { parseSessions } from './validation';

const STORAGE_KEY = 'sleepify.sessions.v1';

export async function loadSessions(): Promise<SleepSession[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? parseSessions(raw) : [];
}

let pending: Promise<void> = Promise.resolve();
export async function saveSessions(sessions: SleepSession[]): Promise<void> {
  const snapshot = JSON.stringify(sessions);
  pending = pending.catch(() => {}).then(() => AsyncStorage.setItem(STORAGE_KEY, snapshot));
  return pending;
}
