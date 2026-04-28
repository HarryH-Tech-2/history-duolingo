import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, radii } from '../theme';
import { TIMELINE_EVENTS } from '../data/curriculum';

const ERA_COLORS = {
  ancient: '#E8C974',
};

export default function TimelineScreen() {
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0A1024', '#0B0F1C']} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>THE GREAT TIMELINE</Text>
          <Text style={styles.title}>Moments in Time</Text>
          <Text style={styles.sub}>
            Five millennia of human story, woven into a single thread.
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
        >
          <View style={styles.axis} />
          {TIMELINE_EVENTS.map((ev, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.yearWrap}>
                <Text style={styles.year}>{ev.year}</Text>
              </View>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: ERA_COLORS[ev.era] || colors.gold },
                ]}
              />
              <View style={styles.card}>
                <View
                  style={[
                    styles.tag,
                    {
                      backgroundColor: (ERA_COLORS[ev.era] || colors.gold) + '20',
                      borderColor: ERA_COLORS[ev.era] || colors.gold,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      { color: ERA_COLORS[ev.era] || colors.gold },
                    ]}
                  >
                    {ev.era.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.eventTitle}>{ev.title}</Text>
              </View>
            </View>
          ))}
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
  axis: {
    position: 'absolute',
    left: 100,
    top: 10,
    bottom: 20,
    width: 2,
    backgroundColor: 'rgba(232, 201, 116, 0.2)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  yearWrap: {
    width: 84,
    alignItems: 'flex-end',
    paddingRight: 10,
  },
  year: {
    fontFamily: fonts.serifBold,
    color: colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#0B0F1C',
    marginRight: 14,
    marginLeft: 3,
  },
  card: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    padding: 12,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 4,
  },
  tagText: {
    fontFamily: fonts.serifBold,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  eventTitle: {
    fontFamily: fonts.heading,
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 20,
  },
});
