import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatDuration, formatTime } from '../lib/stats';
import { colors, gradients, microLabel, palette, radius, space, type } from '../lib/theme';
import { SleepSession } from '../lib/types';
import { ConfirmSheet, GlassCard } from './ui';

interface Props {
  activeSession: SleepSession | null;
  lastCompleted: SleepSession | null;
  onGoToSleep: () => void;
  onStillAwake: () => void;
  onWakeUp: () => void;
  onCancelNight: () => void;
}

type SheetKind = 'none' | 'restart' | 'discard';

export default function TonightScreen(props: Props) {
  const { activeSession } = props;
  return activeSession ? (
    <SleepingView {...props} activeSession={activeSession} />
  ) : (
    <IdleView {...props} />
  );
}

/* ----------------------------- Idle (awake) ----------------------------- */

function IdleView({ lastCompleted, onGoToSleep }: Props) {
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [breathe]);

  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const glow = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });

  const now = new Date();
  const dateLabel = now
    .toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
    .toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.topBlock}>
        <Text style={microLabel}>{dateLabel}</Text>
        <Text style={styles.greeting}>{greetingFor(now)}</Text>
      </View>

      <View style={styles.orbWrap}>
        <Animated.View style={[styles.orbGlow, { opacity: glow }]} />
        <Animated.View style={{ transform: [{ scale }] }}>
          <Pressable accessibilityRole="button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
              onGoToSleep();
            }}
            style={({ pressed }) => pressed && styles.orbPressed}
          >
            <LinearGradient
              colors={gradients.orb}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.8, y: 1 }}
              style={styles.orb}
            >
              <Feather name="moon" size={34} color={palette.lavender} />
              <Text style={styles.orbText}>Begin sleep</Text>
              <Text style={styles.orbHint}>Tap when you lie down</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>

      <View style={styles.bottomBlock}>
        {lastCompleted && lastCompleted.wakeTime != null ? (
          <GlassCard style={styles.lastNightCard}>
            <Text style={microLabel}>Last night</Text>
            <View style={styles.lastNightRow}>
              <Text style={styles.lastNightDuration}>
                {formatDuration(lastCompleted.wakeTime - lastCompleted.sleepTime)}
              </Text>
              <Text style={styles.lastNightTimes}>
                {formatTime(lastCompleted.sleepTime)}  –  {formatTime(lastCompleted.wakeTime)}
              </Text>
            </View>
          </GlassCard>
        ) : (
          <Text style={styles.firstNightHint}>Your first tracked night starts here.</Text>
        )}
      </View>
    </View>
  );
}

function greetingFor(now: Date): string {
  const h = now.getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 18) return 'Good afternoon';
  return 'Time to wind down';
}

/* ------------------------------- Sleeping ------------------------------- */

function SleepingView({
  activeSession,
  onStillAwake,
  onWakeUp,
  onCancelNight,
}: Props & { activeSession: SleepSession }) {
  const [sheet, setSheet] = useState<SheetKind>('none');

  // Refresh the elapsed counter every 30 seconds.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const elapsedMs = Date.now() - activeSession.sleepTime;
  const restarts = activeSession.awakeGaps.length;

  return (
    <View style={styles.container}>
      <View style={styles.topBlock}>
        <Text style={microLabel}>Asleep since {formatTime(activeSession.sleepTime)}</Text>
        <Text style={styles.elapsed}>{formatDuration(elapsedMs)}</Text>
        {restarts > 0 && (
          <Text style={styles.restartNote}>
            Sleep time restarted {restarts === 1 ? 'once' : `${restarts} times`} tonight
          </Text>
        )}
      </View>

      <View style={styles.sleepActions}>
        <Pressable accessibilityRole="button"
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            onWakeUp();
          }}
          style={({ pressed }) => [styles.wakeWrap, pressed && styles.orbPressed]}
        >
          <LinearGradient
            colors={gradients.wake}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wakePill}
          >
            <Feather name="sun" size={20} color="#3A2A14" />
            <Text style={styles.wakeText}>Wake up</Text>
          </LinearGradient>
        </Pressable>

        <Pressable accessibilityRole="button"
          onPress={() => setSheet('restart')}
          style={({ pressed }) => [styles.ghostButton, pressed && styles.orbPressed]}
        >
          <Text style={styles.ghostText}>I'm still awake</Text>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={() => setSheet('discard')} hitSlop={12}>
          <Text style={styles.discardText}>Discard this night</Text>
        </Pressable>
      </View>

      <ConfirmSheet
        visible={sheet === 'restart'}
        title="Still awake?"
        message={`The last ${formatDuration(elapsedMs)} will be saved as time lying awake, and your sleep time will restart from now.`}
        confirmLabel="Restart sleep time"
        onConfirm={() => {
          setSheet('none');
          onStillAwake();
        }}
        onClose={() => setSheet('none')}
      />
      <ConfirmSheet
        visible={sheet === 'discard'}
        title="Discard this night?"
        message="Nothing will be saved. This can't be undone."
        confirmLabel="Discard night"
        destructive
        onConfirm={() => {
          setSheet('none');
          onCancelNight();
        }}
        onClose={() => setSheet('none')}
      />
    </View>
  );
}

/* -------------------------------- Styles -------------------------------- */

const ORB_SIZE = 232;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: space.lg,
    paddingVertical: space.xl,
    justifyContent: 'space-between',
  },
  topBlock: {
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.lg,
  },
  greeting: {
    fontFamily: type.light,
    fontSize: 32,
    color: colors.text,
    letterSpacing: 0.2,
  },
  orbWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbGlow: {
    position: 'absolute',
    width: ORB_SIZE + 56,
    height: ORB_SIZE + 56,
    borderRadius: (ORB_SIZE + 56) / 2,
    backgroundColor: palette.violet,
    shadowColor: palette.periwinkle,
    shadowOpacity: 1,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    elevation: 24,
    transform: [{ scale: 0.92 }],
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    borderWidth: 1,
    borderColor: 'rgba(165,180,255,0.28)',
  },
  orbPressed: {
    opacity: 0.85,
  },
  orbText: {
    fontFamily: type.medium,
    fontSize: 19,
    color: colors.text,
    letterSpacing: 0.3,
  },
  orbHint: {
    fontFamily: type.regular,
    fontSize: 12.5,
    color: colors.textDim,
  },
  bottomBlock: {
    minHeight: 96,
    justifyContent: 'flex-end',
  },
  lastNightCard: {
    gap: space.sm,
  },
  lastNightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  lastNightDuration: {
    fontFamily: type.light,
    fontSize: 30,
    color: colors.text,
  },
  lastNightTimes: {
    fontFamily: type.regular,
    fontSize: 13.5,
    color: colors.textDim,
  },
  firstNightHint: {
    fontFamily: type.regular,
    fontSize: 13.5,
    color: colors.textFaint,
    textAlign: 'center',
  },
  elapsed: {
    fontFamily: type.light,
    fontSize: 64,
    color: colors.text,
    letterSpacing: -1,
  },
  restartNote: {
    fontFamily: type.regular,
    fontSize: 13,
    color: colors.awake,
  },
  sleepActions: {
    alignItems: 'center',
    gap: space.md,
  },
  wakeWrap: {
    width: '100%',
    shadowColor: palette.amber,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  wakePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    borderRadius: radius.pill,
    paddingVertical: 18,
  },
  wakeText: {
    fontFamily: type.semibold,
    fontSize: 17,
    color: '#3A2A14',
    letterSpacing: 0.2,
  },
  ghostButton: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.glass,
  },
  ghostText: {
    fontFamily: type.medium,
    fontSize: 15,
    color: colors.textDim,
  },
  discardText: {
    fontFamily: type.regular,
    fontSize: 13,
    color: colors.textFaint,
  },
});
