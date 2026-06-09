import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  Image,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer } from 'expo-audio';

import { fonts, radii, spacing } from '../theme';

const correctSfx = require('../../assets/correct-answer-sound.mp3');
const wrongSfx = require('../../assets/wrong-answer-sound.mp3');
const founderPhoto = require('../../assets/founder-harry.png');

// TODO: replace with the real store URLs once History Hero is published.
// iOS: itms-apps://apps.apple.com/app/id<APP_ID>?action=write-review
// Android: market://details?id=com.historyhero.app
const REVIEW_URL_IOS = 'itms-apps://apps.apple.com/app/id0000000000?action=write-review';
const REVIEW_URL_ANDROID = 'market://details?id=com.historyhero.app';
const REVIEW_URL_WEB_FALLBACK = 'https://play.google.com/store/apps/details?id=com.historyhero.app';
const FEEDBACK_EMAIL = 'feedback@historyhero.app';
import { UNITS } from '../data/curriculum';
import { Heart } from '../components/Stats';
import Owl from '../components/Owl';
import { useUser, useThemeColors } from '../state/UserContext';

const { width: SCREEN_W } = Dimensions.get('window');

const QUESTIONS_PER_LESSON = 8;
const STARTING_HEARTS = 3;

function useThemed() {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return { c, styles };
}

export default function LessonScreen({ route, navigation }) {
  const { recordAnswer, completeLesson, settings } = useUser();
  const { c, styles } = useThemed();
  const insets = useSafeAreaInsets();
  const { lessonId } = route.params || {};
  const lesson = useMemo(() => {
    for (const u of UNITS) {
      const l = u.lessons.find((x) => x.id === lessonId);
      if (l) return l;
    }
    return UNITS[0].lessons.find((l) => l.questions && l.questions.length > 0);
  }, [lessonId]);

  const sessionQuestions = useMemo(() => {
    const pool = lesson?.questions || [];
    if (pool.length === 0) return [];
    // Shuffle the pool so each session feels fresh.
    const shuffle = (arr) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    const shuffled = shuffle(pool);
    const out = [];
    let i = 0;
    while (out.length < QUESTIONS_PER_LESSON) {
      // Reshuffle when cycling so back-to-back repeats are less likely.
      if (i > 0 && i % shuffled.length === 0) {
        const next = shuffle(pool);
        // Avoid placing the same question twice in a row when wrapping.
        if (next[0] === out[out.length - 1] && next.length > 1) {
          [next[0], next[1]] = [next[1], next[0]];
        }
        for (const q of next) {
          if (out.length >= QUESTIONS_PER_LESSON) break;
          out.push(q);
        }
        i = out.length;
      } else {
        out.push(shuffled[i % shuffled.length]);
        i++;
      }
    }
    return out.slice(0, QUESTIONS_PER_LESSON);
  }, [lesson]);

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [hearts, setHearts] = useState(STARTING_HEARTS);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  // Pre-loaded answer SFX. expo-audio keeps the buffer hot so the cue fires
  // the instant the player taps CHECK rather than after a load delay.
  const correctPlayer = useAudioPlayer(correctSfx);
  const wrongPlayer = useAudioPlayer(wrongSfx);

  const total = sessionQuestions.length;
  const progress = total ? (qIndex + (checked ? 1 : 0)) / total : 0;

  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Out of lives: bounce back to the map after a short pause so the
  // player can see the heart hit zero.
  useEffect(() => {
    if (hearts > 0 || finished) return;
    const t = setTimeout(() => {
      navigation.goBack();
    }, 900);
    return () => clearTimeout(t);
  }, [hearts, finished, navigation]);

  if (!lesson || sessionQuestions.length === 0) {
    return (
      <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <LinearGradient colors={[c.gradient[0], c.bg]} style={StyleSheet.absoluteFill} />
        <Text style={styles.bigTitle}>This lesson is locked.</Text>
        <Pressable style={styles.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryBtnText}>Return to map</Text>
        </Pressable>
      </View>
    );
  }

  if (finished) {
    return (
      <CompletionScreen
        lesson={lesson}
        correctCount={correctCount}
        total={total}
        onDone={() => {
          if (lesson?.id) completeLesson(lesson.id);
          navigation.goBack();
        }}
      />
    );
  }

  const q = sessionQuestions[qIndex];
  const isCorrect =
    q.type === 'truefalse' ? selected === q.correct : selected === q.correct;

  const onCheck = () => {
    if (selected === null) return;
    setChecked(true);
    recordAnswer(isCorrect);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      if (settings?.haptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      if (settings?.soundEffects) {
        try {
          correctPlayer.seekTo(0);
          correctPlayer.play();
        } catch (e) {
          // SFX failures should never block answer flow.
        }
      }
    } else {
      setHearts((h) => Math.max(0, h - 1));
      if (settings?.haptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      }
      if (settings?.soundEffects) {
        try {
          wrongPlayer.seekTo(0);
          wrongPlayer.play();
        } catch (e) {
          // SFX failures should never block answer flow.
        }
      }
    }
  };

  const onNext = () => {
    if (qIndex + 1 >= total) {
      setFinished(true);
      return;
    }
    setQIndex((i) => i + 1);
    setSelected(null);
    setChecked(false);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={c.gradient}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Header: close, progress bar, hearts */}
        <View style={styles.header}>
          <Pressable
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={24} color={c.textSecondary} />
          </Pressable>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={['#F5D98A', '#E8C974', '#B88F3E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
          <View style={styles.heartsCluster}>
            <Heart size={22} />
            <Text style={styles.heartCount}>{hearts}</Text>
          </View>
        </View>

        {/* Question area */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.kicker}>
            {q.type === 'truefalse' ? 'TRUE OR FALSE' : 'SELECT THE ANSWER'}
          </Text>
          {q.image && (
            <View style={styles.qImageWrap}>
              <Image source={q.image} style={styles.qImage} resizeMode="cover" />
              <LinearGradient
                colors={['rgba(11,15,28,0)', 'rgba(11,15,28,0.55)']}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
            </View>
          )}
          <Text style={styles.question}>{q.prompt}</Text>

          {/* Answer list */}
          {q.type === 'choice' && (
            <View style={styles.answers}>
              {q.answers.map((a, i) => {
                const state = getAnswerState({
                  i,
                  selected,
                  checked,
                  correct: q.correct,
                });
                return (
                  <AnswerOption
                    key={i}
                    index={i}
                    label={a}
                    state={state}
                    disabled={checked}
                    onPress={() => {
                      if (!checked) setSelected(i);
                      if (settings?.haptics) {
                        Haptics.selectionAsync().catch(() => {});
                      }
                    }}
                  />
                );
              })}
            </View>
          )}

          {q.type === 'truefalse' && (
            <View style={styles.tfRow}>
              {[true, false].map((val) => {
                const state = getTFState({
                  val,
                  selected,
                  checked,
                  correct: q.correct,
                });
                return (
                  <AnswerTF
                    key={String(val)}
                    label={val ? 'True' : 'False'}
                    state={state}
                    disabled={checked}
                    onPress={() => {
                      if (!checked) setSelected(val);
                      if (settings?.haptics) {
                        Haptics.selectionAsync().catch(() => {});
                      }
                    }}
                  />
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Footer: check / continue */}
        <View
          style={[
            styles.footer,
            { paddingBottom: 20 + Math.max(insets.bottom, 8) },
            checked && (isCorrect ? styles.footerCorrect : styles.footerWrong),
          ]}
        >
          {checked && (
            <View style={styles.feedbackRow}>
              <View style={styles.feedbackHeader}>
                <Ionicons
                  name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                  size={22}
                  color={isCorrect ? c.emerald : c.crimson}
                />
                <Text
                  style={[
                    styles.feedbackTitle,
                    { color: isCorrect ? c.emerald : c.crimson },
                  ]}
                >
                  {isCorrect ? 'Magnificent!' : 'Not quite.'}
                </Text>
              </View>
              <Text style={styles.feedbackFact}>{q.fact}</Text>
            </View>
          )}

          {!checked ? (
            <Pressable
              onPress={onCheck}
              disabled={selected === null}
              style={({ pressed }) => [
                styles.primaryBtn,
                selected === null && styles.primaryBtnDisabled,
                pressed && selected !== null && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text
                style={[
                  styles.primaryBtnText,
                  selected === null && { color: c.textLocked },
                ]}
              >
                CHECK
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={onNext}
              style={({ pressed }) => [
                styles.primaryBtn,
                isCorrect ? styles.btnGreen : styles.btnRed,
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={[styles.primaryBtnText, { color: '#0B0F1C' }]}>
                {qIndex + 1 >= total ? 'FINISH' : 'CONTINUE'}
              </Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function getAnswerState({ i, selected, checked, correct }) {
  if (!checked) return selected === i ? 'selected' : 'idle';
  if (i === correct) return 'correct';
  if (selected === i) return 'wrong';
  return 'idle';
}
function getTFState({ val, selected, checked, correct }) {
  if (!checked) return selected === val ? 'selected' : 'idle';
  if (val === correct) return 'correct';
  if (selected === val) return 'wrong';
  return 'idle';
}

function AnswerOption({ index, label, state, disabled, onPress }) {
  const { styles } = useThemed();
  const prefix = String.fromCharCode(65 + index);
  const styleMap = {
    idle: styles.answerIdle,
    selected: styles.answerSelected,
    correct: styles.answerCorrect,
    wrong: styles.answerWrong,
  };
  const prefixMap = {
    idle: styles.prefixIdle,
    selected: styles.prefixSelected,
    correct: styles.prefixCorrect,
    wrong: styles.prefixWrong,
  };
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.answerBtn,
        styleMap[state],
        pressed && !disabled && { transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={[styles.prefixBubble, prefixMap[state]]}>
        <Text style={styles.prefixText}>{prefix}</Text>
      </View>
      <Text style={styles.answerText}>{label}</Text>
    </Pressable>
  );
}

function AnswerTF({ label, state, disabled, onPress }) {
  const { styles } = useThemed();
  const styleMap = {
    idle: styles.answerIdle,
    selected: styles.answerSelected,
    correct: styles.answerCorrect,
    wrong: styles.answerWrong,
  };
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.tfBtn,
        styleMap[state],
        pressed && !disabled && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={styles.tfText}>{label}</Text>
    </Pressable>
  );
}

function CompletionScreen({ lesson, correctCount, total, onDone }) {
  const { c, styles } = useThemed();
  const { settings, updateSetting } = useUser();
  const xp = correctCount * 10;
  const percent = Math.round((correctCount / total) * 100);

  // Session-only dismissal so "Maybe later" hides the card until the next
  // app launch, without permanently silencing the prompt.
  const [dismissedThisSession, setDismissedThisSession] = useState(false);
  const showReview = !settings?.hasReviewed && !dismissedThisSession;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={c.gradient}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.completion}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ marginVertical: 24 }}>
            <Owl size={180} />
          </View>
          <Text style={styles.completionEyebrow}>Lesson Complete</Text>
          <Text style={styles.completionTitle}>{lesson.title}</Text>

          <View style={styles.completionStats}>
            <StatBlock label="XP" value={xp} tint={c.gold} />
            <StatBlock label="Accuracy" value={`${percent}%`} tint={c.emerald} />
            <StatBlock label="Correct" value={`${correctCount}/${total}`} tint={c.royal} />
          </View>

          {showReview && (
            <ReviewPrompt
              onReviewed={() => updateSetting('hasReviewed', true)}
              onDismiss={() => setDismissedThisSession(true)}
            />
          )}

          <Text style={styles.completionQuote}>
            "The past is never dead. It's not even past." — Faulkner
          </Text>

          <Pressable
            onPress={onDone}
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                marginTop: 20,
                backgroundColor: c.gold,
                paddingVertical: 20,
                paddingHorizontal: 32,
                alignSelf: 'stretch',
              },
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={[styles.primaryBtnText, { color: '#0B0F1C' }]}>
              CONTINUE
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Friendly, founder-fronted review nudge. Shown on the completion screen until
// the user taps "Leave a review" (persisted) or "Maybe later" (session only).
// Feedback is intentionally surfaced alongside the review CTA so unhappy users
// have a low-friction path that doesn't go through the public stores.
function ReviewPrompt({ onReviewed, onDismiss }) {
  const { c, styles } = useThemed();

  const openReview = async () => {
    const primary = Platform.OS === 'ios' ? REVIEW_URL_IOS : REVIEW_URL_ANDROID;
    try {
      const supported = await Linking.canOpenURL(primary);
      if (supported) {
        await Linking.openURL(primary);
      } else {
        await Linking.openURL(REVIEW_URL_WEB_FALLBACK);
      }
    } catch (e) {
      // Last-ditch: try the web fallback so the tap is never a dead end.
      try {
        await Linking.openURL(REVIEW_URL_WEB_FALLBACK);
      } catch {}
    } finally {
      onReviewed && onReviewed();
    }
  };

  const sendFeedback = async () => {
    const subject = encodeURIComponent('History Hero — feedback');
    const body = encodeURIComponent(
      "Hey Harry,\n\nHere's what I think of History Hero so far:\n\n"
    );
    const url = `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
    try {
      await Linking.openURL(url);
    } catch {}
  };

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTopRow}>
        <Image source={founderPhoto} style={styles.reviewPhoto} />
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewEyebrow}>A NOTE FROM HARRY</Text>
          <Text style={styles.reviewTitle}>Enjoying History Hero?</Text>
        </View>
      </View>

      <Text style={styles.reviewBody}>
        I built this app on my own and every rating helps it reach more curious
        minds. If you've got a minute, a quick review would mean the world — and
        if something isn't working for you, tell me directly and I'll fix it.
      </Text>

      <View style={styles.reviewStarsRow}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Ionicons key={i} name="star" size={20} color={c.gold} />
        ))}
      </View>

      <Pressable
        onPress={openReview}
        style={({ pressed }) => [
          styles.reviewPrimaryBtn,
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        <Ionicons name="star" size={16} color="#0B0F1C" />
        <Text style={styles.reviewPrimaryText}>LEAVE A REVIEW</Text>
      </Pressable>

      <Pressable
        onPress={sendFeedback}
        style={({ pressed }) => [
          styles.reviewSecondaryBtn,
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        <Ionicons name="mail-outline" size={16} color={c.textPrimary} />
        <Text style={styles.reviewSecondaryText}>SEND FEEDBACK</Text>
      </Pressable>

      <Pressable onPress={onDismiss} hitSlop={8}>
        <Text style={styles.reviewDismiss}>Maybe later</Text>
      </Pressable>
    </View>
  );
}

function StatBlock({ label, value, tint }) {
  const { styles } = useThemed();
  return (
    <View style={styles.statBlock}>
      <Text style={[styles.statValue, { color: tint }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: c.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    paddingTop: 4,
  },
  closeBtn: {
    padding: 4,
  },
  progressTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: c.goldSoft,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: c.borderSubtle,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  heartsCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heartCount: {
    fontFamily: fonts.serifBold,
    color: c.textPrimary,
    fontSize: 16,
    marginLeft: 4,
  },
  body: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  qImageWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.bgCardSolid,
  },
  qImage: {
    width: '100%',
    height: '100%',
  },
  kicker: {
    fontFamily: fonts.serifBold,
    color: c.gold,
    fontSize: 11,
    letterSpacing: 2.5,
    marginBottom: 14,
  },
  question: {
    fontFamily: fonts.heading,
    color: c.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.2,
    marginBottom: 22,
    fontWeight: '700',
  },
  answers: {
    gap: 10,
  },
  answerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    borderWidth: 1.5,
    gap: 14,
  },
  answerIdle: {
    backgroundColor: c.bgCardSolid,
    borderColor: c.borderSubtle,
  },
  answerSelected: {
    backgroundColor: c.goldSoft,
    borderColor: c.gold,
  },
  answerCorrect: {
    backgroundColor: 'rgba(95, 179, 122, 0.18)',
    borderColor: c.emerald,
  },
  answerWrong: {
    backgroundColor: 'rgba(216, 84, 102, 0.18)',
    borderColor: c.crimson,
  },
  prefixBubble: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  prefixIdle: {
    borderColor: c.borderSubtle,
    backgroundColor: c.bgGlass,
  },
  prefixSelected: {
    borderColor: c.gold,
    backgroundColor: c.goldSoft,
  },
  prefixCorrect: {
    borderColor: c.emerald,
    backgroundColor: 'rgba(95, 179, 122, 0.25)',
  },
  prefixWrong: {
    borderColor: c.crimson,
    backgroundColor: 'rgba(216, 84, 102, 0.25)',
  },
  prefixText: {
    fontFamily: fonts.serifBold,
    color: c.textPrimary,
    fontSize: 14,
  },
  answerText: {
    flex: 1,
    fontFamily: fonts.serif,
    color: c.textPrimary,
    fontSize: 17,
    lineHeight: 22,
  },
  tfRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  tfBtn: {
    flex: 1,
    paddingVertical: 32,
    borderRadius: radii.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tfText: {
    fontFamily: fonts.heading,
    color: c.textPrimary,
    fontSize: 22,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: c.borderSubtle,
    backgroundColor: c.overlay,
  },
  footerCorrect: {
    backgroundColor: 'rgba(95, 179, 122, 0.08)',
    borderTopColor: c.emerald,
  },
  footerWrong: {
    backgroundColor: 'rgba(216, 84, 102, 0.08)',
    borderTopColor: c.crimson,
  },
  feedbackRow: {
    marginBottom: 14,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  feedbackTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
  },
  feedbackFact: {
    fontFamily: fonts.serifItalic,
    color: c.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: radii.md,
    backgroundColor: c.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: c.bgGlass,
    borderWidth: 1,
    borderColor: c.borderSubtle,
  },
  primaryBtnText: {
    fontFamily: fonts.serifBold,
    color: '#0B0F1C',
    fontSize: 16,
    letterSpacing: 2,
  },
  btnGreen: {
    backgroundColor: c.emerald,
  },
  btnRed: {
    backgroundColor: c.crimson,
  },
  bigTitle: {
    fontFamily: fonts.heading,
    color: c.textPrimary,
    fontSize: 28,
    marginBottom: 20,
  },
  completion: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  reviewCard: {
    width: '100%',
    backgroundColor: c.bgCard,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radii.lg,
    padding: 18,
    marginBottom: 18,
    alignItems: 'stretch',
    gap: 12,
  },
  reviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  reviewPhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: c.gold,
    backgroundColor: c.bgCardSolid,
  },
  reviewEyebrow: {
    fontFamily: fonts.serifBold,
    color: c.gold,
    fontSize: 10,
    letterSpacing: 2.2,
    marginBottom: 4,
  },
  reviewTitle: {
    fontFamily: fonts.heading,
    color: c.textPrimary,
    fontSize: 19,
    lineHeight: 22,
  },
  reviewBody: {
    fontFamily: fonts.serif,
    color: c.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  reviewStarsRow: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    paddingVertical: 2,
  },
  reviewPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: c.gold,
    paddingVertical: 14,
    borderRadius: radii.md,
  },
  reviewPrimaryText: {
    fontFamily: fonts.serifBold,
    color: '#0B0F1C',
    fontSize: 14,
    letterSpacing: 1.6,
  },
  reviewSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: c.bgGlass,
    borderWidth: 1,
    borderColor: c.borderSubtle,
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  reviewSecondaryText: {
    fontFamily: fonts.serifBold,
    color: c.textPrimary,
    fontSize: 13,
    letterSpacing: 1.4,
  },
  reviewDismiss: {
    fontFamily: fonts.serifItalic,
    color: c.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 4,
  },
  completionEyebrow: {
    fontFamily: fonts.serifBold,
    color: c.gold,
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 8,
  },
  completionTitle: {
    fontFamily: fonts.heading,
    color: c.textPrimary,
    fontSize: 32,
    lineHeight: 36,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  completionStats: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 24,
  },
  statBlock: {
    flex: 1,
    backgroundColor: c.bgCard,
    borderWidth: 1,
    borderColor: c.borderSubtle,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.heading,
    fontSize: 24,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: fonts.serif,
    color: c.textMuted,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  completionQuote: {
    fontFamily: fonts.serifItalic,
    color: c.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
