import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatDuration, formatNightLabel, formatTime } from '../lib/stats';
import { colors } from '../lib/theme';
import { NightStats } from '../lib/types';

/** Detailed breakdown of a single night. */
export default function NightCard({ night }: { night: NightStats }) {
  const { session } = night;
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.nightLabel}>Night of {formatNightLabel(session)}</Text>
        <Text style={styles.sleepTotal}>{formatDuration(night.sleepMs)}</Text>
      </View>

      <View style={styles.row}>
        <Stat label="To bed" value={formatTime(session.bedTime)} />
        <Stat label="Fell asleep" value={formatTime(session.sleepTime)} />
        <Stat label="Woke up" value={formatTime(session.wakeTime!)} />
      </View>

      <View style={styles.row}>
        <Stat label="In bed" value={formatDuration(night.inBedMs)} />
        <Stat label="Asleep" value={formatDuration(night.sleepMs)} />
        <Stat
          label="Awake in bed"
          value={night.awakeMs > 0 ? formatDuration(night.awakeMs) : '—'}
          highlight={night.awakeMs > 0}
        />
      </View>

      {session.awakeGaps.length > 0 && (
        <View style={styles.gaps}>
          <Text style={styles.gapsTitle}>Couldn't fall asleep:</Text>
          {session.awakeGaps.map((gap, i) => (
            <Text key={i} style={styles.gapText}>
              • {formatTime(gap.start)} – {formatTime(gap.end)} ({formatDuration(gap.end - gap.start)} awake)
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && { color: colors.awake }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nightLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  sleepTotal: {
    color: colors.sleep,
    fontSize: 17,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  statLabel: {
    color: colors.textDim,
    fontSize: 12,
  },
  statValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  gaps: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 10,
    gap: 4,
  },
  gapsTitle: {
    color: colors.awake,
    fontSize: 13,
    fontWeight: '600',
  },
  gapText: {
    color: colors.textDim,
    fontSize: 13,
  },
});
