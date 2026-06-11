import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HistoryScreen from './components/HistoryScreen';
import TonightScreen from './components/TonightScreen';
import { loadSessions, saveSessions } from './lib/storage';
import { colors } from './lib/theme';
import { SleepSession } from './lib/types';

type Tab = 'tonight' | 'history';

export default function App() {
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>('tonight');

  useEffect(() => {
    loadSessions().then(stored => {
      setSessions(stored);
      setLoaded(true);
    });
  }, []);

  const update = useCallback((next: SleepSession[]) => {
    setSessions(next);
    saveSessions(next); // fire-and-forget; state is the source of truth in-session
  }, []);

  const activeSession = sessions.find(s => s.wakeTime == null) ?? null;
  const completed = sessions.filter(s => s.wakeTime != null);
  const lastCompleted =
    completed.length > 0
      ? completed.reduce((a, b) => (a.wakeTime! > b.wakeTime! ? a : b))
      : null;

  const goToSleep = () => {
    const now = Date.now();
    update([
      ...sessions,
      { id: `${now}`, bedTime: now, sleepTime: now, wakeTime: null, awakeGaps: [] },
    ]);
  };

  const stillAwake = () => {
    if (!activeSession) return;
    const now = Date.now();
    update(
      sessions.map(s =>
        s.id === activeSession.id
          ? {
              ...s,
              awakeGaps: [...s.awakeGaps, { start: s.sleepTime, end: now }],
              sleepTime: now,
            }
          : s,
      ),
    );
  };

  const wakeUp = () => {
    if (!activeSession) return;
    update(
      sessions.map(s => (s.id === activeSession.id ? { ...s, wakeTime: Date.now() } : s)),
    );
  };

  const cancelNight = () => {
    if (!activeSession) return;
    update(sessions.filter(s => s.id !== activeSession.id));
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sleepify</Text>
        </View>

        <View style={styles.content}>
          {!loaded ? null : tab === 'tonight' ? (
            <TonightScreen
              activeSession={activeSession}
              lastCompleted={lastCompleted}
              onGoToSleep={goToSleep}
              onStillAwake={stillAwake}
              onWakeUp={wakeUp}
              onCancelNight={cancelNight}
            />
          ) : (
            <HistoryScreen sessions={sessions} />
          )}
        </View>

        <View style={styles.tabBar}>
          <TabButton
            label="🌙 Tonight"
            active={tab === 'tonight'}
            onPress={() => setTab('tonight')}
          />
          <TabButton
            label="📊 History"
            active={tab === 'history'}
            onPress={() => setTab('history')}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.tabButton, active && styles.tabButtonActive]} onPress={onPress}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderTopWidth: 2,
    borderTopColor: colors.accent,
  },
  tabLabel: {
    color: colors.textDim,
    fontSize: 15,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.text,
  },
});
