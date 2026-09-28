import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { averageMs, formatDuration, recentNights, nightStats } from '../lib/stats';
import { colors, microLabel, space, type } from '../lib/theme';
import { SleepSession } from '../lib/types';
import NightCard from './NightCard';
import WeeklyChart from './WeeklyChart';
import { GlassCard } from './ui';

export default function HistoryScreen({ sessions, demo = false }: { sessions: SleepSession[]; demo?: boolean }) {
  const week = recentNights(sessions, 7);

  const allNights = sessions.map(nightStats).filter(n => n !== null).sort((a, b) => b.session.wakeTime! - a.session.wakeTime!);

  if (allNights.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Feather name="bar-chart-2" size={26} color={colors.textDim} />
        </View>
        <Text style={styles.emptyTitle}>Nothing here yet</Text>
        <Text style={styles.emptyText}>
          After your first night, your weekly rhythm and night-by-night details appear here.
        </Text>
      </View>
    );
  }

  const avgSleep = averageMs(week.map(n => n.sleepMs));
  const avgAwake = averageMs(week.map(n => n.awakeMs));
  const nightsWithGaps = week.filter(n => n.awakeMs > 0).length;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={{ color: colors.textDim }}>{demo ? 'Sample week: fictional data, never saved to your history' : 'Your last 7 days'}</Text>
      <View style={styles.summaryRow}>
        <SummaryTile label="Avg sleep" value={formatDuration(avgSleep)} />
        <SummaryTile label="Avg awake" value={formatDuration(avgAwake)} />
        <SummaryTile label="Restless" value={`${nightsWithGaps} of ${week.length}`} />
      </View>

      <WeeklyChart nights={week} />

      <Text style={[microLabel, styles.sectionLabel]}>Night by night</Text>
      {allNights.map(night => (
        <NightCard key={night.session.id} night={night} />
      ))}
    </ScrollView>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard style={styles.summaryTile}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: space.lg,
    gap: space.md,
    paddingBottom: space.xxl,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  summaryTile: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
  },
  summaryValue: {
    fontFamily: type.light,
    fontSize: 21,
    color: colors.text,
  },
  summaryLabel: {
    fontFamily: type.regular,
    fontSize: 11.5,
    color: colors.textFaint,
  },
  sectionLabel: {
    marginTop: space.md,
    marginLeft: 2,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    gap: space.sm,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.glass,
    borderColor: colors.hairline,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  emptyTitle: {
    fontFamily: type.semibold,
    fontSize: 18,
    color: colors.text,
  },
  emptyText: {
    fontFamily: type.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textDim,
    textAlign: 'center',
  },
});
