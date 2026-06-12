import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatDayShort, formatDuration } from '../lib/stats';
import { colors, gradients, microLabel, palette, space, type } from '../lib/theme';
import { NightStats } from '../lib/types';
import { GlassCard } from './ui';

const CHART_HEIGHT = 132;

/** Last-7-days chart: gradient sleep bars with amber awake caps. */
export default function WeeklyChart({ nights }: { nights: NightStats[] }) {
  if (nights.length === 0) return null;

  const maxMs = Math.max(...nights.map(n => n.sleepMs + n.awakeMs), 1);

  return (
    <GlassCard>
      <Text style={microLabel}>This week</Text>
      <View style={styles.chartRow}>
        {nights.map(night => {
          const sleepH = Math.max(6, (night.sleepMs / maxMs) * CHART_HEIGHT);
          const awakeH = (night.awakeMs / maxMs) * CHART_HEIGHT;
          return (
            <View key={night.session.id} style={styles.barColumn}>
              <Text style={styles.barValue}>{formatDuration(night.sleepMs)}</Text>
              <View style={styles.barStack}>
                {awakeH > 1 && <View style={[styles.awakeBar, { height: Math.max(4, awakeH) }]} />}
                <LinearGradient
                  colors={gradients.sleepBar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[styles.sleepBar, { height: sleepH }]}
                />
              </View>
              <Text style={styles.barLabel}>{formatDayShort(night.session.wakeTime!)}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.legendRow}>
        <View style={[styles.legendDot, { backgroundColor: palette.periwinkle }]} />
        <Text style={styles.legendText}>Asleep</Text>
        <View style={[styles.legendDot, { backgroundColor: palette.amber, marginLeft: space.md }]} />
        <Text style={styles.legendText}>Awake in bed</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: CHART_HEIGHT + 44,
    marginTop: space.md,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  barStack: {
    width: 18,
    justifyContent: 'flex-end',
    gap: 3,
  },
  sleepBar: {
    width: '100%',
    borderRadius: 9,
  },
  awakeBar: {
    width: '100%',
    borderRadius: 9,
    backgroundColor: 'rgba(242,201,138,0.75)',
  },
  barValue: {
    fontFamily: type.regular,
    fontSize: 10,
    color: colors.textFaint,
    marginBottom: 6,
  },
  barLabel: {
    fontFamily: type.medium,
    fontSize: 12,
    color: colors.textDim,
    marginTop: space.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.md,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontFamily: type.regular,
    fontSize: 12,
    color: colors.textDim,
  },
});
