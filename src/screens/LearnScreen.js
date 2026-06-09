import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { fonts, radii } from '../theme';
import { MODULES } from '../data/curriculum';
import { useUser, useThemeColors } from '../state/UserContext';
import ProgressRing from '../components/ProgressRing';

export default function LearnScreen({ navigation }) {
  // Subscribe so progress recomputes on lesson completion.
  const { version } = useUser();
  const c = useThemeColors();
  const styles = React.useMemo(() => makeStyles(c), [c]);

  // Build live "units" from MODULES using current lesson statuses.
  const units = React.useMemo(
    () =>
      MODULES.map((m) => {
        const lessons = m.regions.flatMap((r) => r.lessons);
        const completed = lessons.filter((l) => l.status === 'completed').length;
        return {
          id: m.id,
          title: m.title,
          era: m.era,
          accent: m.accent,
          progress: lessons.length === 0 ? 0 : completed / lessons.length,
          lessons,
        };
      }),
    [version]
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[c.gradient[0], c.bg]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>CURRICULUM</Text>
          <Text style={styles.title}>Learning Path</Text>
          <Text style={styles.sub}>
            Journey through the great eras of humanity.
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {units.map((unit, i) => (
            <UnitBlock
              key={unit.id}
              unit={unit}
              index={i}
              navigation={navigation}
              c={c}
              styles={styles}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function UnitBlock({ unit, index, navigation, c, styles }) {
  const isLocked = unit.progress === 0 && index > 0;
  return (
    <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
      <View style={styles.unitHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.unitEyebrow}>
            UNIT {index + 1} — {unit.era}
          </Text>
          <Text style={[styles.unitTitle, isLocked && styles.locked]}>
            {unit.title}
          </Text>
        </View>
        <View style={styles.ringWrap}>
          <ProgressRing size={48} strokeWidth={4} progress={unit.progress} color={unit.accent} />
          <Text style={[styles.ringText, { color: unit.accent }]}>
            {Math.round(unit.progress * 100)}%
          </Text>
        </View>
      </View>

      {unit.lessons.length === 0 ? (
        <View style={styles.emptyLessons}>
          <Ionicons name="lock-closed" size={18} color={c.textMuted} />
          <Text style={styles.emptyText}>
            Complete the previous era to unlock these lessons.
          </Text>
        </View>
      ) : (
        unit.lessons.map((lesson) => {
          const total = lesson.questions?.length || 0;
          const done = lesson.status === 'completed' ? total : 0;
          return (
            <Pressable
              key={lesson.id}
              onPress={() =>
                lesson.status !== 'locked' &&
                navigation.navigate('Lesson', { lessonId: lesson.id })
              }
              style={({ pressed }) => [
                styles.lessonRow,
                pressed && lesson.status !== 'locked' && {
                  transform: [{ scale: 0.99 }],
                },
              ]}
            >
              <View
                style={[
                  styles.lessonDot,
                  {
                    backgroundColor:
                      lesson.status === 'locked' ? 'rgba(245, 232, 208, 0.1)' : lesson.color,
                  },
                ]}
              >
                {lesson.status === 'completed' ? (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                ) : lesson.status === 'active' ? (
                  <Ionicons name="play" size={14} color="#0B0F1C" />
                ) : (
                  <Ionicons name="lock-closed" size={14} color={c.textMuted} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.lessonTitle,
                    lesson.status === 'locked' && styles.locked,
                  ]}
                >
                  {lesson.title}
                </Text>
                <Text
                  style={[
                    styles.lessonSub,
                    lesson.status === 'locked' && styles.locked,
                  ]}
                >
                  {lesson.subtitle}
                </Text>
              </View>
              {lesson.status !== 'locked' && total > 0 && (
                <View style={styles.progressChip}>
                  <Text style={styles.progressChipText}>
                    {done}/{total}
                  </Text>
                </View>
              )}
              <Ionicons
                name="chevron-forward"
                size={18}
                color={
                  lesson.status === 'locked' ? c.textLocked : c.textSecondary
                }
                style={{ marginLeft: 8 }}
              />
            </Pressable>
          );
        })
      )}
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
  unitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  unitEyebrow: {
    fontFamily: fonts.serifBold,
    color: c.textMuted,
    fontSize: 10,
    letterSpacing: 1.8,
    marginBottom: 2,
  },
  unitTitle: {
    fontFamily: fonts.heading,
    color: c.textPrimary,
    fontSize: 22,
    lineHeight: 26,
  },
  locked: { color: c.textLocked },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  ringText: {
    position: 'absolute',
    fontFamily: fonts.serifBold,
    fontSize: 11,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.bgCard,
    borderWidth: 1,
    borderColor: c.borderSubtle,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 8,
    gap: 14,
  },
  lessonDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonTitle: {
    fontFamily: fonts.heading,
    color: c.textPrimary,
    fontSize: 16,
  },
  lessonSub: {
    fontFamily: fonts.serif,
    color: c.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  progressChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(138, 107, 199, 0.2)',
    borderWidth: 1,
    borderColor: c.royal,
  },
  progressChipText: {
    fontFamily: fonts.serifBold,
    color: c.royal,
    fontSize: 11,
  },
  emptyLessons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: radii.md,
    backgroundColor: c.bgGlass,
    borderWidth: 1,
    borderColor: c.borderSubtle,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontFamily: fonts.serifItalic,
    color: c.textMuted,
    fontSize: 13,
    flex: 1,
  },
});
