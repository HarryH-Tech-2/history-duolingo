import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle as SvgCircle } from 'react-native-svg';

import { colors, fonts, radii, shadows } from '../theme';
import { MODULES } from '../data/curriculum';
import { Check } from '../components/LessonIcon';
import ProgressRing from '../components/ProgressRing';
import WorldMap from '../components/WorldMap';
import { useUser } from '../state/UserContext';

export default function HomeScreen({ navigation }) {
  const { avatar, stats } = useUser();
  // When the world map is zoomed in, the page must stop scrolling so the
  // user can pan freely on the map. WorldMap toggles this via onZoomChange.
  const [mapZoomed, setMapZoomed] = React.useState(false);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0A1024', '#141B30', '#1F2238', '#2A2633']}
        locations={[0, 0.25, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={!mapZoomed}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* Top bar: "History Hero" wordmark + avatar */}
        <SafeAreaView edges={['top']} style={styles.topBarWrap}>
          <View style={styles.topBar}>
            <Text style={styles.brand}>History Hero</Text>
            <Pressable
              onPress={() => navigation.navigate('Profile')}
              style={styles.avatar}
            >
              <Image
                source={avatar.image}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </Pressable>
          </View>
        </SafeAreaView>

        {/* Module cards */}
        <View style={styles.moduleList}>
          {MODULES.map((m) => {
            const totalLessons = m.regions.reduce((acc, r) => acc + r.lessons.length, 0);
            const doneLessons = m.regions.reduce(
              (acc, r) => acc + r.lessons.filter((l) => l.status === 'completed').length,
              0
            );
            const progress = totalLessons ? doneLessons / totalLessons : 0;
            return (
              <View
                key={m.id}
                style={[styles.moduleCard, { borderColor: m.accent + '55' }]}
              >
                <LinearGradient
                  colors={[m.accent + '22', 'rgba(11,15,28,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={[styles.moduleThumb, { borderColor: m.accent + '66' }]}>
                  <Image
                    source={m.regions[0].lessons[0].icon}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['rgba(11,15,28,0)', 'rgba(11,15,28,0.45)']}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                  />
                </View>
                <View style={{ flex: 1, paddingHorizontal: 14 }}>
                  <Text style={[styles.moduleEyebrow, { color: m.accent }]}>
                    {m.era}
                  </Text>
                  <Text style={styles.moduleTitle}>{m.title}</Text>
                  <Text style={styles.moduleSub}>{m.tagline}</Text>
                  <Text style={styles.moduleMeta}>
                    {m.regions.length} regions · {totalLessons} lessons
                  </Text>
                </View>
                <View style={styles.ringWrap}>
                  <ProgressRing size={56} strokeWidth={4} progress={progress} />
                  <Text style={[styles.ringText, { color: m.accent }]}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Interactive region maps */}
        <WorldMap
          onSelect={(lesson) => {
            if (lesson.status !== 'locked') {
              navigation.navigate('Lesson', { lessonId: lesson.id });
            }
          }}
          onZoomChange={setMapZoomed}
        />
      </ScrollView>
    </View>
  );
}

function TempleIllustration({ tint = '#E8D6B0' }) {
  return (
    <Svg width={80} height={64} viewBox="0 0 100 80">
      <Defs>
        <SvgLinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#2A4A7A" />
          <Stop offset="1" stopColor="#1A2A44" />
        </SvgLinearGradient>
        <SvgLinearGradient id="temple" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tint} />
          <Stop offset="1" stopColor="#8B7044" />
        </SvgLinearGradient>
      </Defs>
      <Path d="M0 0 L100 0 L100 80 L0 80 Z" fill="url(#sky)" />
      <SvgCircle cx="18" cy="18" r="8" fill="#F5E8C0" opacity="0.8" />
      <Path d="M25 40 L75 40 L65 30 L35 30 Z" fill="url(#temple)" />
      <Path d="M27 40 L73 40 L73 44 L27 44 Z" fill="#6B5535" />
      <Path d="M32 44 L32 68 M40 44 L40 68 M48 44 L48 68 M56 44 L56 68 M64 44 L64 68" stroke="url(#temple)" strokeWidth="4" />
      <Path d="M25 68 L75 68 L75 73 L25 73 Z" fill="#6B5535" />
      <Path d="M82 55 L82 75 M86 55 L86 75" stroke="#2A3E1A" strokeWidth="3" />
      <Path d="M80 68 Q82 50 84 68 Z" fill="#3E5A28" />
      <Path d="M84 70 Q86 52 88 70 Z" fill="#3E5A28" />
      <Path d="M0 73 L100 73 L100 80 L0 80 Z" fill="#2A1E10" />
    </Svg>
  );
}

function StreakCard({ streak }) {
  return (
    <View style={styles.streakCard}>
      <LinearGradient
        colors={['#4A2410', '#2A140A']}
        style={StyleSheet.absoluteFill}
      />
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 200 160"
        style={{ position: 'absolute', right: 0, bottom: 0 }}
        preserveAspectRatio="xMaxYMax slice"
      >
        <Defs>
          <SvgLinearGradient id="sunset" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F28A3B" />
            <Stop offset="0.5" stopColor="#B94418" />
            <Stop offset="1" stopColor="#3A1810" />
          </SvgLinearGradient>
        </Defs>
        <SvgCircle cx="140" cy="60" r="30" fill="url(#sunset)" opacity="0.6" />
        <Path
          d="M70 160 L70 120 L75 115 L80 120 L80 90 L90 85 L100 90 L100 125 L110 130 L110 100 L120 95 L130 100 L130 135 L140 140 L145 130 L150 140 L150 160 Z"
          fill="#1A0806"
        />
      </Svg>

      <Text style={styles.streakDays}>{streak} lesson streak</Text>
      <Text style={styles.streakSub}>
        {streak > 0 ? "You're on fire!" : 'Start your first lesson.'}
      </Text>
    </View>
  );
}

function DailyPracticeCard({ onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.practiceCard,
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <LinearGradient
        colors={['#1E3A28', '#0F2116']}
        style={StyleSheet.absoluteFill}
      />
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        style={{ position: 'absolute', right: -30, bottom: -20 }}
        preserveAspectRatio="xMaxYMax slice"
      >
        <Defs>
          <SvgLinearGradient id="cream" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F0E3C4" />
            <Stop offset="1" stopColor="#8B7044" />
          </SvgLinearGradient>
        </Defs>
        <Path d="M120 60 L180 60 L180 70 L120 70 Z" fill="url(#cream)" />
        <Path d="M125 70 L175 70 L175 75 L125 75 Z" fill="#A88858" />
        <Path d="M130 75 L130 170 L140 170 L140 75 M155 75 L155 170 L165 170 L165 75" fill="url(#cream)" />
        <Path d="M115 170 L185 170 L185 180 L115 180 Z" fill="#8B7044" />
        <Path d="M110 180 L190 180 L190 200 L110 200 Z" fill="#5A4028" />
      </Svg>

      <Text style={styles.practiceTitle}>Daily Practice</Text>
      <Text style={styles.practiceSub}>Keep your knowledge sharp!</Text>
      <View style={styles.practiceArrow}>
        <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBarWrap: { paddingHorizontal: 16 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 6,
  },
  brand: {
    fontFamily: fonts.heading,
    color: colors.gold,
    fontSize: 22,
    letterSpacing: 0.5,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.gold,
  },

  moduleList: {
    marginTop: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  moduleCard: {
    borderRadius: radii.lg,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    overflow: 'hidden',
  },
  moduleThumb: {
    width: 72,
    height: 64,
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#060913',
  },
  moduleEyebrow: {
    fontFamily: fonts.serifBold,
    fontSize: 10,
    letterSpacing: 1.8,
  },
  moduleTitle: {
    fontFamily: fonts.heading,
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 24,
    marginTop: 2,
  },
  moduleSub: {
    fontFamily: fonts.serifItalic,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  moduleMeta: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  ringWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    position: 'absolute',
    fontFamily: fonts.serifBold,
    fontSize: 13,
  },

  bottomCards: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  streakCard: {
    flex: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    padding: 16,
    minHeight: 130,
    borderWidth: 1,
    borderColor: 'rgba(232, 138, 59, 0.3)',
  },
  streakDays: {
    fontFamily: fonts.heading,
    color: '#F5D98A',
    fontSize: 22,
    lineHeight: 24,
  },
  streakSub: {
    fontFamily: fonts.serif,
    color: '#E89C5F',
    fontSize: 13,
    marginTop: 2,
  },
  practiceCard: {
    flex: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    padding: 16,
    minHeight: 130,
    borderWidth: 1,
    borderColor: 'rgba(95, 179, 122, 0.3)',
  },
  practiceTitle: {
    fontFamily: fonts.heading,
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 22,
  },
  practiceSub: {
    fontFamily: fonts.serif,
    color: 'rgba(245, 232, 208, 0.82)',
    fontSize: 13,
    marginTop: 4,
    maxWidth: '62%',
  },
  practiceArrow: {
    marginTop: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 232, 208, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
