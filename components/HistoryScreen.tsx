import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { averageMs, formatDuration, recentNights } from '../lib/stats';
import { colors } from '../lib/theme';
import { SleepSession } from '../lib/types';
import NightCard from './NightCard';
import WeeklyChart from './WeeklyChart';

export default function HistoryScreen({ sessions }: { sessions: SleepSession[] }) {
  const week = recentNights(sessions, 7);

  if (week.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🛌</Text>
        <Text style={styles.emptyTitle}>No nights tracked yet</Text>
        <Text style={styles.emptyText}>
          Your sleep history and weekly analysis will show up here after your first night.
        </Text>
      </View>
    );
  }

  const avgSleep = averageMs(week.map(n => n.sleepMs));
  const avgAwake = averageMs(week.map(n => n.awakeMs));
  const nightsWithGaps = week.filter(n => n.awakeMs > 0).length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.summaryRow}>
        <SummaryCard label="Avg sleep" value={formatDuration(avgSleep)} />
        <SummaryCard label="Avg awake in bed" value={formatDuration(avgAwake)} />
        <SummaryCard label="Restless nights" value={`${nightsWithGaps}/${week.length}`} />
      </View>

      <WeeklyChart nights={week} />

      <Text style={styles.sectionTitle}>Night by night</Text>
      {[...week].reverse().map(night => (
        <NightCard key={night.session.id} night={night} />
      ))}
    </ScrollView>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  summaryLabel: {
    color: colors.textDim,
    fontSize: 11,
    textAlign: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textDim,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
