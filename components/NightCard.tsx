import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatDuration, formatNightLabel, formatTime } from '../lib/stats';
import { colors, microLabel, space, type } from '../lib/theme';
import { NightStats } from '../lib/types';
import { GlassCard } from './ui';

/** Detailed breakdown of a single night. */
export default function NightCard({ night }: { night: NightStats }) {
  const { session } = night;
  return (
    <GlassCard style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={microLabel}>{formatNightLabel(session)}</Text>
        <Text style={styles.duration}>{formatDuration(night.sleepMs)}</Text>
      </View>

      <View style={styles.timelineRow}>
        <Feather name="moon" size={13} color={colors.textDim} />
        <Text style={styles.timelineText}>{formatTime(session.sleepTime)}</Text>
        <View style={styles.timelineLine} />
        <Text style={styles.timelineText}>{formatTime(session.wakeTime!)}</Text>
        <Feather name="sun" size={13} color={colors.textDim} />
      </View>

      <View style={styles.statsRow}>
        <Stat label="In bed" value={formatDuration(night.inBedMs)} />
        <View style={styles.divider} />
        <Stat label="To bed at" value={formatTime(session.bedTime)} />
        <View style={styles.divider} />
        <Stat
          label="Awake in bed"
          value={night.awakeMs > 0 ? formatDuration(night.awakeMs) : '—'}
          highlight={night.awakeMs > 0}
        />
      </View>

      {session.awakeGaps.length > 0 && (
        <View style={styles.gaps}>
          {session.awakeGaps.map((gap, i) => (
            <Text key={i} style={styles.gapText}>
              Lay awake {formatTime(gap.start)} – {formatTime(gap.end)} ·{' '}
              {formatDuration(gap.end - gap.start)}
            </Text>
          ))}
        </View>
      )}
    </GlassCard>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, highlight && { color: colors.awake }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: space.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    fontFamily: type.light,
    fontSize: 26,
    color: colors.text,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  timelineText: {
    fontFamily: type.medium,
    fontSize: 13.5,
    color: colors.textDim,
  },
  timelineLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.hairline,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    gap: 3,
  },
  statValue: {
    fontFamily: type.semibold,
    fontSize: 15,
    color: colors.text,
  },
  statLabel: {
    fontFamily: type.regular,
    fontSize: 11.5,
    color: colors.textFaint,
  },
  divider: {
    width: 1,
    height: 26,
    backgroundColor: colors.hairline,
    marginRight: space.md,
  },
  gaps: {
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingTop: space.sm,
    gap: 4,
  },
  gapText: {
    fontFamily: type.regular,
    fontSize: 12.5,
    color: colors.awake,
    opacity: 0.85,
  },
});
