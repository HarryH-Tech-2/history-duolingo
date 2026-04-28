import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Circle as SvgCircle,
  Path,
  G,
} from 'react-native-svg';

import { colors, fonts, radii } from '../theme';
import { useUser } from '../state/UserContext';

const { width: SCREEN_W } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const { characters, avatarId, setAvatarId, completeOnboarding } = useUser();
  const [step, setStep] = useState(0);
  const listRef = useRef(null);

  const goTo = (i) => {
    setStep(i);
    listRef.current?.scrollToOffset({ offset: i * SCREEN_W, animated: true });
  };

  const next = () => {
    if (step < 2) goTo(step + 1);
    else {
      completeOnboarding();
      navigation.replace('Tabs');
    }
  };

  const pages = [
    <WelcomePage key="welcome" />,
    <PickCharacterPage
      key="pick"
      characters={characters}
      activeId={avatarId}
      onPick={setAvatarId}
    />,
    <ReadyPage key="ready" />,
  ];

  return (
    <View style={styles.root}>
      <Image
        source={require('../../assets/onboarding/bg.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        {/* Top bar: just skip (progress moved to footer) */}
        <View style={styles.topBar}>
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() => {
              completeOnboarding();
              navigation.replace('Tabs');
            }}
            hitSlop={12}
          >
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={pages}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => <View style={{ width: SCREEN_W }}>{item}</View>}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={{ flex: 1 }}
        />

        <View style={styles.footer}>
          <View style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === step && styles.dotActive,
                  i < step && styles.dotDone,
                ]}
              />
            ))}
          </View>
          <Pressable
            onPress={next}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <LinearGradient
              colors={['#F5D98A', '#E8C974', '#B88F3E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.primaryBtnText}>
              {step === 2 ? 'Begin your journey' : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#0B0F1C" />
          </Pressable>

          {step > 0 && (
            <Pressable onPress={() => goTo(step - 1)} hitSlop={10}>
              <Text style={styles.backLink}>Back</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function WelcomePage() {
  return (
    <View style={styles.page}>
      <View style={styles.heroArt}>
        <Svg width={220} height={220} viewBox="0 0 200 200">
          <Defs>
            <SvgLinearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#F5D98A" />
              <Stop offset="1" stopColor="#B88F3E" />
            </SvgLinearGradient>
            <SvgLinearGradient id="col" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#F0E3C4" />
              <Stop offset="1" stopColor="#8B7044" />
            </SvgLinearGradient>
          </Defs>
          <SvgCircle cx="100" cy="92" r="64" fill="url(#sun)" opacity="0.22" />
          <SvgCircle cx="100" cy="92" r="44" fill="url(#sun)" opacity="0.5" />
          {/* Temple silhouette */}
          <Path d="M50 120 L150 120 L135 100 L65 100 Z" fill="url(#col)" />
          <Path d="M52 120 L148 120 L148 126 L52 126 Z" fill="#6B5535" />
          <G>
            <Path
              d="M60 126 L60 170 M75 126 L75 170 M90 126 L90 170 M110 126 L110 170 M125 126 L125 170 M140 126 L140 170"
              stroke="url(#col)"
              strokeWidth="6"
            />
          </G>
          <Path d="M48 170 L152 170 L152 178 L48 178 Z" fill="#6B5535" />
          <Path d="M42 178 L158 178 L158 186 L42 186 Z" fill="#3E2F18" />
        </Svg>
      </View>

      <Text style={styles.eyebrow}>WELCOME TO</Text>
      <Text style={styles.title}>History Hero</Text>
      <Text style={styles.body}>
        Bite-sized lessons through the great eras of humanity.
      </Text>
    </View>
  );
}

function PickCharacterPage({ characters, activeId, onPick }) {
  const featured = characters.slice(0, 6);
  return (
    <View style={styles.page}>
      <Text style={styles.eyebrow}>STEP 2</Text>
      <Text style={styles.title}>Choose your{'\n'}companion.</Text>
      <Text style={[styles.body, { marginBottom: 22 }]}>
        Pick a figure of antiquity to guide you. You can change this later.
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.charGrid}
      >
        {featured.map((c) => {
          const active = c.id === activeId;
          return (
            <Pressable
              key={c.id}
              onPress={() => onPick(c.id)}
              style={({ pressed }) => [
                styles.charCard,
                active && styles.charCardActive,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <View style={styles.charPortrait}>
                <Image
                  source={c.image}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                {active && (
                  <View style={styles.charCheck}>
                    <Ionicons name="checkmark" size={14} color="#0B0F1C" />
                  </View>
                )}
              </View>
              <Text
                style={[styles.charName, active && { color: colors.gold }]}
                numberOfLines={1}
              >
                {c.name}
              </Text>
              <Text style={styles.charEra} numberOfLines={1}>
                {c.era}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function ReadyPage() {
  const bullets = [
    {
      icon: 'book',
      tint: '#E8C974',
      title: 'Bite-sized lessons',
      desc: 'Five minutes a day is enough.',
    },
    {
      icon: 'map',
      tint: '#5FB37A',
      title: 'Explore regions',
      desc: 'Seven worlds, from Nile to Rome.',
    },
    {
      icon: 'flame',
      tint: '#D85466',
      title: 'Earn streaks & gems',
      desc: 'Keep your streak alive daily.',
    },
  ];
  return (
    <View style={styles.page}>
      <Text style={styles.eyebrow}>STEP 3</Text>
      <Text style={styles.title}>You're ready,{'\n'}hero.</Text>
      <Text style={[styles.body, { marginBottom: 22 }]}>
        Here's how your journey will unfold.
      </Text>

      <View style={{ gap: 12 }}>
        {bullets.map((b) => (
          <View key={b.icon} style={styles.bullet}>
            <View
              style={[
                styles.bulletIcon,
                {
                  backgroundColor: b.tint + '22',
                  borderColor: b.tint + '55',
                },
              ]}
            >
              <Ionicons name={b.icon} size={18} color={b.tint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bulletTitle}>{b.title}</Text>
              <Text style={styles.bulletDesc}>{b.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(245, 232, 208, 0.15)',
  },
  dotActive: { backgroundColor: colors.gold, width: 40 },
  dotDone: { backgroundColor: 'rgba(232, 201, 116, 0.55)' },
  skip: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 13,
    letterSpacing: 1,
  },

  page: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  heroArt: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  eyebrow: {
    fontFamily: fonts.serifBold,
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.heading,
    color: colors.textPrimary,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.8,
    marginBottom: 14,
  },
  body: {
    fontFamily: fonts.serifItalic,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 340,
  },

  charGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  charCard: {
    width: (SCREEN_W - 48 - 12) / 2,
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 10,
    alignItems: 'center',
  },
  charCardActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(232, 201, 116, 0.12)',
  },
  charPortrait: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.sm,
    overflow: 'hidden',
    backgroundColor: '#0B0F1C',
  },
  charCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0B0F1C',
  },
  charName: {
    fontFamily: fonts.serifBold,
    color: colors.textPrimary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  charEra: {
    fontFamily: fonts.serifItalic,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },

  bullet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
  },
  bulletIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletTitle: {
    fontFamily: fonts.heading,
    color: colors.textPrimary,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  bulletDesc: {
    fontFamily: fonts.serif,
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },

  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 8,
    alignItems: 'center',
    gap: 10,
  },
  primaryBtn: {
    width: '100%',
    height: 56,
    borderRadius: radii.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtnText: {
    fontFamily: fonts.serifBold,
    color: '#0B0F1C',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  backLink: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
    fontSize: 13,
    letterSpacing: 1,
  },
});
