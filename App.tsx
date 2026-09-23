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
import { sampleWeek } from './lib/demo';

type Tab = 'tonight' | 'history';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>('tonight');
  const [storageError, setStorageError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    loadSessions().then(stored => {
      setSessions(stored);
      setLoaded(true);
    }).catch(() => {
      setLoadFailed(true);
      setStorageError('Your saved history could not be loaded. Reload to retry; existing data has not been changed.');
      setLoaded(true);
    });
  }, []);

  const update = useCallback((next: SleepSession[]) => {
    setSessions(next);
    setStorageError('');
    saveSessions(next).catch(() => setStorageError('Changes are visible but could not be saved. Keep this page open and retry.'));
  }, []);

  const activeSession = sessions.find(s => s.wakeTime == null) ?? null;
  const completed = sessions.filter(s => s.wakeTime != null);
  const lastCompleted =
    completed.length > 0
      ? completed.reduce((a, b) => (a.wakeTime! > b.wakeTime! ? a : b))
      : null;

  const goToSleep = () => {
    if (activeSession) return;
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

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: palette.night0 }} />;
  }

  return (
    <SafeAreaProvider>
      <LinearGradient colors={gradients.backdrop} style={styles.backdrop}>
        <SafeAreaView style={styles.root}>
          <StatusBar style="light" />

          <View style={{ paddingHorizontal: 24, paddingTop: 12, gap: 8 }}>
            <Text style={{ color: colors.text, fontFamily: type.semibold, fontSize: 18 }}>Sleepify</Text>
            <Text style={{ color: colors.textDim, fontSize: 12 }}>A quiet place to understand your nights. Stored only on this device.</Text>
            <Pressable accessibilityRole="button" onPress={() => { setDemo(!demo); setTab('history'); }}>
              <Text style={{ color: colors.accent, fontSize: 13 }}>{demo ? 'Exit sample week' : 'Explore a sample week'}</Text>
            </Pressable>
            {storageError ? <Text accessibilityRole="alert" style={{ color: colors.danger }}>{storageError}</Text> : null}
            {storageError && !loadFailed ? <Pressable accessibilityRole="button" onPress={() => update(sessions)}><Text style={{ color: colors.accent }}>Retry saving</Text></Pressable> : null}
          </View>
          <View style={styles.content}>
            {!loaded || loadFailed ? null : tab === 'tonight' ? (
              <TonightScreen
                activeSession={activeSession}
                lastCompleted={lastCompleted}
                onGoToSleep={goToSleep}
                onStillAwake={stillAwake}
                onWakeUp={wakeUp}
                onCancelNight={cancelNight}
              />
            ) : (
              <HistoryScreen sessions={demo ? sampleWeek() : sessions} demo={demo} />
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
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
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
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
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
