import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HistoryScreen from './components/HistoryScreen';
import TonightScreen from './components/TonightScreen';
import { loadSessions, saveSessions } from './lib/storage';
import { colors, gradients, palette, radius, space, type } from './lib/theme';
import { SleepSession } from './lib/types';

type Tab = 'tonight' | 'history';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

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

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: palette.night0 }} />;
  }

  return (
    <SafeAreaProvider>
      <LinearGradient colors={gradients.backdrop} style={styles.backdrop}>
        <SafeAreaView style={styles.root}>
          <StatusBar style="light" />

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

          <View style={styles.tabBarWrap} pointerEvents="box-none">
            <View style={styles.tabBar}>
              <TabButton
                icon="moon"
                label="Tonight"
                active={tab === 'tonight'}
                onPress={() => setTab('tonight')}
              />
              <TabButton
                icon="bar-chart-2"
                label="History"
                active={tab === 'history'}
                onPress={() => setTab('history')}
              />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

function TabButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
    >
      <Feather name={icon} size={15} color={active ? palette.night1 : colors.textDim} />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBarWrap: {
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
    paddingTop: space.xs,
  },
  tabBar: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.hairline,
    borderWidth: 1,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: radius.pill,
  },
  tabButtonActive: {
    backgroundColor: colors.accent,
  },
  tabLabel: {
    fontFamily: type.medium,
    fontSize: 13.5,
    color: colors.textDim,
  },
  tabLabelActive: {
    color: palette.night1,
    fontFamily: type.semibold,
  },
});
