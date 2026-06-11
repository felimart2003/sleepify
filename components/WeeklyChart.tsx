import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatDayShort, formatDuration } from '../lib/stats';
import { colors } from '../lib/theme';
import { NightStats } from '../lib/types';

const CHART_HEIGHT = 140;

/** Bar chart of sleep duration per night. Pure Views — no chart library needed. */
export default function WeeklyChart({ nights }: { nights: NightStats[] }) {
  if (nights.length === 0) return null;

  const maxMs = Math.max(...nights.map(n => n.sleepMs + n.awakeMs), 1);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Last 7 days</Text>
      <View style={styles.chartRow}>
        {nights.map(night => {
          const sleepH = Math.max(4, (night.sleepMs / maxMs) * CHART_HEIGHT);
          const awakeH = (night.awakeMs / maxMs) * CHART_HEIGHT;
          return (
            <View key={night.session.id} style={styles.barColumn}>
              <Text style={styles.barValue}>{formatDuration(night.sleepMs)}</Text>
              <View style={styles.barStack}>
                {awakeH > 0 && (
                  <View style={[styles.bar, styles.awakeBar, { height: awakeH }]} />
                )}
                <View style={[styles.bar, styles.sleepBar, { height: sleepH }]} />
              </View>
              <Text style={styles.barLabel}>{formatDayShort(night.session.wakeTime!)}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.legendRow}>
        <View style={[styles.legendDot, { backgroundColor: colors.sleep }]} />
        <Text style={styles.legendText}>Asleep</Text>
        <View style={[styles.legendDot, { backgroundColor: colors.awake }]} />
        <Text style={styles.legendText}>Awake in bed</Text>
      </View>
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
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: CHART_HEIGHT + 40,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  barStack: {
    width: 22,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
  },
  sleepBar: {
    backgroundColor: colors.sleep,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  awakeBar: {
    backgroundColor: colors.awake,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barValue: {
    color: colors.textDim,
    fontSize: 10,
    marginBottom: 4,
  },
  barLabel: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  legendText: {
    color: colors.textDim,
    fontSize: 12,
  },
});
