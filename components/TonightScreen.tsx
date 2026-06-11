import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatDuration, formatTime } from '../lib/stats';
import { colors } from '../lib/theme';
import { SleepSession } from '../lib/types';

interface Props {
  activeSession: SleepSession | null;
  lastCompleted: SleepSession | null;
  onGoToSleep: () => void;
  onStillAwake: () => void;
  onWakeUp: () => void;
  onCancelNight: () => void;
}

export default function TonightScreen({
  activeSession,
  lastCompleted,
  onGoToSleep,
  onStillAwake,
  onWakeUp,
  onCancelNight,
}: Props) {
  // Re-render every 30s so the "sleeping for X" counter stays fresh.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!activeSession) return;
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, [activeSession]);

  const confirmStillAwake = () => {
    const sinceMs = Date.now() - activeSession!.sleepTime;
    Alert.alert(
      "Still can't sleep?",
      `This logs the last ${formatDuration(sinceMs)} as time you were lying awake, and restarts your sleep time from now.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restart sleep time', onPress: onStillAwake },
      ],
    );
  };

  const confirmCancel = () => {
    Alert.alert('Cancel this night?', 'This removes the night without saving anything.', [
      { text: 'Keep tracking', style: 'cancel' },
      { text: 'Cancel night', style: 'destructive', onPress: onCancelNight },
    ]);
  };

  if (!activeSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Ready for bed?</Text>
        <Text style={styles.subtitle}>
          Press the button when you lie down. Sleepify will track your night.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.bigButton, styles.sleepButton, pressed && styles.pressed]}
          onPress={onGoToSleep}
        >
          <Text style={styles.bigButtonEmoji}>🌙</Text>
          <Text style={styles.bigButtonText}>Going to sleep</Text>
        </Pressable>
        {lastCompleted && lastCompleted.wakeTime != null && (
          <View style={styles.lastNight}>
            <Text style={styles.lastNightTitle}>Last night</Text>
            <Text style={styles.lastNightText}>
              {formatTime(lastCompleted.sleepTime)} → {formatTime(lastCompleted.wakeTime)} ·{' '}
              {formatDuration(lastCompleted.wakeTime - lastCompleted.sleepTime)} of sleep
            </Text>
          </View>
        )}
      </View>
    );
  }

  const sleepingForMs = Date.now() - activeSession.sleepTime;
  const restarted = activeSession.awakeGaps.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Good night 😴</Text>
      <Text style={styles.subtitle}>
        Sleep time registered at {formatTime(activeSession.sleepTime)}
        {restarted ? ` (restarted ${activeSession.awakeGaps.length}×)` : ''} —{' '}
        {formatDuration(sleepingForMs)} ago.
      </Text>

      <Pressable
        style={({ pressed }) => [styles.bigButton, styles.wakeButton, pressed && styles.pressed]}
        onPress={onWakeUp}
      >
        <Text style={styles.bigButtonEmoji}>☀️</Text>
        <Text style={[styles.bigButtonText, styles.wakeButtonText]}>I'm awake</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        onPress={confirmStillAwake}
      >
        <Text style={styles.secondaryButtonText}>😶 Still can't sleep — restart sleep time</Text>
      </Pressable>

      <Pressable onPress={confirmCancel} hitSlop={12}>
        <Text style={styles.cancelText}>Cancel this night</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  bigButton: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  sleepButton: {
    backgroundColor: colors.accentDark,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  wakeButton: {
    backgroundColor: '#5a4a1f',
    borderWidth: 2,
    borderColor: colors.wake,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  bigButtonEmoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  bigButtonText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  wakeButtonText: {
    color: colors.wake,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: colors.awake,
    fontSize: 15,
    fontWeight: '600',
  },
  cancelText: {
    color: colors.textDim,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  lastNight: {
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  lastNightTitle: {
    color: colors.textDim,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  lastNightText: {
    color: colors.text,
    fontSize: 15,
  },
});
