import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepSession } from './types';

const STORAGE_KEY = 'sleepify.sessions.v1';

export async function loadSessions(): Promise<SleepSession[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveSessions(sessions: SleepSession[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}
