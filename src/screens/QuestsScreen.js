import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { fonts, radii } from '../theme';
import { QUESTS } from '../data/curriculum';
import { Gem } from '../components/Stats';
import { useThemeColors } from '../state/UserContext';

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

function QuestCard({ q, c, styles }) {
  const pct = Math.min(1, q.progress / q.total);
  const done = q.progress >= q.total;
  return (
    <View style={[styles.quest, done && styles.questDone]}>
      <View
        style={[
          styles.questIcon,
          { backgroundColor: done ? c.emerald : c.goldSoft },
        ]}
      >
        <Ionicons
          name={ICONS[q.icon] || 'trophy'}
          size={22}
          color={done ? '#fff' : c.gold}
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
                backgroundColor: done ? c.emerald : c.gold,
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
  const c = useThemeColors();
  const styles = React.useMemo(() => makeStyles(c), [c]);
  const daily = QUESTS.filter((q) => (q.group || 'daily') === 'daily');
  const weekly = QUESTS.filter((q) => q.group === 'weekly');
  return (
    <View style={styles.root}>
      <LinearGradient colors={[c.gradient[0], c.bg]} style={StyleSheet.absoluteFill} />
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
          {daily.map((q) => <QuestCard key={q.id} q={q} c={c} styles={styles} />)}

          {weekly.length > 0 && (
            <>
              <Text style={[styles.groupLabel, { marginTop: 18 }]}>WEEKLY</Text>
              {weekly.map((q) => <QuestCard key={q.id} q={q} c={c} styles={styles} />)}
            </>
          )}

          <View style={styles.chest}>
            <View style={styles.chestIcon}>
              <Ionicons name="gift" size={28} color={c.gold} />
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

const makeStyles = (c) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  eyebrow: {
    fontFamily: fonts.serifBold,
    color: c.gold,
    fontSize: 11,
    letterSpacing: 2.5,
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.heading,
    color: c.textPrimary,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  sub: {
    fontFamily: fonts.serifItalic,
    color: c.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
  groupLabel: {
    fontFamily: fonts.serifBold,
    color: c.gold,
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
    backgroundColor: c.bgCard,
    borderWidth: 1,
    borderColor: c.borderSubtle,
    borderRadius: radii.md,
    marginBottom: 10,
  },
  questDone: {
    borderColor: c.emerald,
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
    color: c.textPrimary,
    fontSize: 16,
    marginBottom: 8,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: c.goldSoft,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },
  questProgress: {
    fontFamily: fonts.serif,
    color: c.textSecondary,
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
    color: c.emerald,
    fontSize: 13,
  },
  chest: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    padding: 16,
    gap: 14,
    backgroundColor: c.goldSoft,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: c.gold,
    borderStyle: 'dashed',
  },
  chestIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: c.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chestTitle: {
    fontFamily: fonts.heading,
    color: c.gold,
    fontSize: 18,
  },
  chestSub: {
    fontFamily: fonts.serif,
    color: c.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
});
