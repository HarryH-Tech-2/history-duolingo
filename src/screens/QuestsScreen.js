import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts, radii } from '../theme';
import { QUESTS } from '../data/curriculum';
import { Gem } from '../components/Stats';

const ICONS = {
  scroll: 'document-text',
  star: 'star',
  flame: 'flame',
  book: 'book',
  target: 'locate',
  hourglass: 'hourglass',
  trophy: 'trophy',
  medal: 'ribbon',
  shield: 'shield',
  map: 'map',
  person: 'person',
};

function QuestCard({ q }) {
  const pct = Math.min(1, q.progress / q.total);
  const done = q.progress >= q.total;
  return (
    <View style={[styles.quest, done && styles.questDone]}>
      <View
        style={[
          styles.questIcon,
          { backgroundColor: done ? colors.emerald : colors.goldSoft },
        ]}
      >
        <Ionicons
          name={ICONS[q.icon] || 'trophy'}
          size={22}
          color={done ? '#fff' : colors.gold}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.questTitle}>{q.title}</Text>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              {
                width: `${pct * 100}%`,
                backgroundColor: done ? colors.emerald : colors.gold,
              },
            ]}
          />
        </View>
        <Text style={styles.questProgress}>
          {q.progress} / {q.total}
        </Text>
      </View>
      <View style={styles.reward}>
        <Gem size={18} />
        <Text style={styles.rewardText}>{q.reward}</Text>
      </View>
    </View>
  );
}

export default function QuestsScreen() {
  const daily = QUESTS.filter((q) => (q.group || 'daily') === 'daily');
  const weekly = QUESTS.filter((q) => q.group === 'weekly');
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0A1024', '#0B0F1C']} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>QUESTS</Text>
          <Text style={styles.title}>The Oracle's Tasks</Text>
          <Text style={styles.sub}>
            Complete these to earn gems and keep your streak alive.
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
        >
          <Text style={styles.groupLabel}>DAILY</Text>
          {daily.map((q) => <QuestCard key={q.id} q={q} />)}

          {weekly.length > 0 && (
            <>
              <Text style={[styles.groupLabel, { marginTop: 18 }]}>WEEKLY</Text>
              {weekly.map((q) => <QuestCard key={q.id} q={q} />)}
            </>
          )}

          <View style={styles.chest}>
            <View style={styles.chestIcon}>
              <Ionicons name="gift" size={28} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.chestTitle}>Legendary Chest</Text>
              <Text style={styles.chestSub}>
                Complete all quests to unlock a bonus of 500 gems.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  eyebrow: {
    fontFamily: fonts.serifBold,
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 2.5,
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.heading,
    color: colors.textPrimary,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  sub: {
    fontFamily: fonts.serifItalic,
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
  groupLabel: {
    fontFamily: fonts.serifBold,
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 2.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  quest: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    marginBottom: 10,
  },
  questDone: {
    borderColor: colors.emerald,
    backgroundColor: 'rgba(95, 179, 122, 0.08)',
  },
  questIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questTitle: {
    fontFamily: fonts.heading,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: 8,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(232, 201, 116, 0.12)',
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },
  questProgress: {
    fontFamily: fonts.serif,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  reward: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
  },
  rewardText: {
    fontFamily: fonts.serifBold,
    color: colors.emerald,
    fontSize: 13,
  },
  chest: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    padding: 16,
    gap: 14,
    backgroundColor: 'rgba(232, 201, 116, 0.08)',
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderStyle: 'dashed',
  },
  chestIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(232, 201, 116, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chestTitle: {
    fontFamily: fonts.heading,
    color: colors.gold,
    fontSize: 18,
  },
  chestSub: {
    fontFamily: fonts.serif,
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
});
