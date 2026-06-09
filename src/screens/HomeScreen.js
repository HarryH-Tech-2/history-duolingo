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

import { fonts, radii, shadows } from '../theme';
import { MODULES } from '../data/curriculum';
import { Check } from '../components/LessonIcon';
import ProgressRing from '../components/ProgressRing';
import WorldMap from '../components/WorldMap';
import { useUser, useThemeColors } from '../state/UserContext';

export default function HomeScreen({ navigation }) {
  const { avatar, stats } = useUser();
  const c = useThemeColors();
  const styles = React.useMemo(() => makeStyles(c), [c]);
  // When the world map is zoomed in, the page must stop scrolling so the
  // user can pan freely on the map. WorldMap toggles this via onZoomChange.
  const [mapZoomed, setMapZoomed] = React.useState(false);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={c.gradient}
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

const makeStyles = (c) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg },
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
    color: c.gold,
    fontSize: 22,
    letterSpacing: 0.5,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: c.gold,
  },

  moduleList: {
    marginTop: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  moduleCard: {
    borderRadius: radii.lg,
    backgroundColor: c.bgCard,
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
    color: c.textPrimary,
    fontSize: 20,
    lineHeight: 24,
    marginTop: 2,
  },
  moduleSub: {
    fontFamily: fonts.serifItalic,
    color: c.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  moduleMeta: {
    fontFamily: fonts.serif,
    color: c.textMuted,
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
});
