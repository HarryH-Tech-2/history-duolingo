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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { colors, fonts, radii, spacing } from '../theme';
import { UNITS } from '../data/curriculum';
import { Heart } from '../components/Stats';
import Owl from '../components/Owl';
import { useUser } from '../state/UserContext';

const { width: SCREEN_W } = Dimensions.get('window');

const QUESTIONS_PER_LESSON = 8;
const STARTING_HEARTS = 3;

export default function LessonScreen({ route, navigation }) {
  const { recordAnswer, completeLesson, settings } = useUser();
  const { lessonId } = route.params || {};
  const lesson = useMemo(() => {
    for (const u of UNITS) {
      const l = u.lessons.find((x) => x.id === lessonId);
      if (l) return l;
    }
    // fallback to first lesson with questions
    return UNITS[0].lessons.find((l) => l.questions && l.questions.length > 0);
  }, [lessonId]);

  // Build the session question list: cycle through the lesson's question
  // pool until we have QUESTIONS_PER_LESSON questions for this run.
  const sessionQuestions = useMemo(() => {
    const pool = lesson?.questions || [];
    if (pool.length === 0) return [];
    const out = [];
    for (let i = 0; i < QUESTIONS_PER_LESSON; i++) {
      out.push(pool[i % pool.length]);
    }
    return out;
  }, [lesson]);

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [hearts, setHearts] = useState(STARTING_HEARTS);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

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

  if (!lesson || sessionQuestions.length === 0) {
    return (
      <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <LinearGradient colors={['#0A1024', '#0B0F1C']} style={StyleSheet.absoluteFill} />
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
    } else {
      setHearts((h) => Math.max(0, h - 1));
      if (settings?.haptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
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
        colors={['#0A1024', '#131827', '#0B0F1C']}
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
            <Ionicons name="close" size={24} color={colors.textSecondary} />
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
        <View style={[styles.footer, checked && (isCorrect ? styles.footerCorrect : styles.footerWrong)]}>
          {checked && (
            <View style={styles.feedbackRow}>
              <View style={styles.feedbackHeader}>
                <Ionicons
                  name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                  size={22}
                  color={isCorrect ? colors.emerald : colors.crimson}
                />
                <Text
                  style={[
                    styles.feedbackTitle,
                    { color: isCorrect ? colors.emerald : colors.crimson },
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
                  selected === null && { color: 'rgba(245, 232, 208, 0.35)' },
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
  const xp = correctCount * 10;
  const percent = Math.round((correctCount / total) * 100);
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0A1024', '#1A2A3A', '#0B0F1C']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <View style={styles.completion}>
          <View style={{ marginVertical: 24 }}>
            <Owl size={180} />
          </View>
          <Text style={styles.completionEyebrow}>Lesson Complete</Text>
          <Text style={styles.completionTitle}>{lesson.title}</Text>

          <View style={styles.completionStats}>
            <StatBlock label="XP" value={xp} tint={colors.gold} />
            <StatBlock label="Accuracy" value={`${percent}%`} tint={colors.emerald} />
            <StatBlock label="Correct" value={`${correctCount}/${total}`} tint={colors.royal} />
          </View>

          <Text style={styles.completionQuote}>
            "The past is never dead. It's not even past." — Faulkner
          </Text>

          <Pressable
            onPress={onDone}
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                marginTop: 20,
                backgroundColor: colors.gold,
                paddingVertical: 20,
                paddingHorizontal: 32,
              },
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={[styles.primaryBtnText, { color: '#0B0F1C' }]}>
              CONTINUE
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function StatBlock({ label, value, tint }) {
  return (
    <View style={styles.statBlock}>
      <Text style={[styles.statValue, { color: tint }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
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
    backgroundColor: 'rgba(232, 201, 116, 0.12)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
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
    color: colors.textPrimary,
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
    borderColor: colors.border,
    backgroundColor: colors.bgCardSolid,
  },
  qImage: {
    width: '100%',
    height: '100%',
  },
  kicker: {
    fontFamily: fonts.serifBold,
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 2.5,
    marginBottom: 14,
  },
  question: {
    fontFamily: fonts.heading,
    color: colors.textPrimary,
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
    backgroundColor: colors.bgCardSolid,
    borderColor: colors.borderSubtle,
  },
  answerSelected: {
    backgroundColor: 'rgba(232, 201, 116, 0.12)',
    borderColor: colors.gold,
  },
  answerCorrect: {
    backgroundColor: 'rgba(95, 179, 122, 0.18)',
    borderColor: colors.emerald,
  },
  answerWrong: {
    backgroundColor: 'rgba(216, 84, 102, 0.18)',
    borderColor: colors.crimson,
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
    borderColor: colors.borderSubtle,
    backgroundColor: 'rgba(245, 232, 208, 0.05)',
  },
  prefixSelected: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(232, 201, 116, 0.18)',
  },
  prefixCorrect: {
    borderColor: colors.emerald,
    backgroundColor: 'rgba(95, 179, 122, 0.25)',
  },
  prefixWrong: {
    borderColor: colors.crimson,
    backgroundColor: 'rgba(216, 84, 102, 0.25)',
  },
  prefixText: {
    fontFamily: fonts.serifBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  answerText: {
    flex: 1,
    fontFamily: fonts.serif,
    color: colors.textPrimary,
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
    color: colors.textPrimary,
    fontSize: 22,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: 'rgba(11, 15, 28, 0.8)',
  },
  footerCorrect: {
    backgroundColor: 'rgba(95, 179, 122, 0.08)',
    borderTopColor: colors.emerald,
  },
  footerWrong: {
    backgroundColor: 'rgba(216, 84, 102, 0.08)',
    borderTopColor: colors.crimson,
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
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: radii.md,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    backgroundColor: 'rgba(245, 232, 208, 0.08)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  primaryBtnText: {
    fontFamily: fonts.serifBold,
    color: '#0B0F1C',
    fontSize: 16,
    letterSpacing: 2,
  },
  btnGreen: {
    backgroundColor: colors.emerald,
  },
  btnRed: {
    backgroundColor: colors.crimson,
  },
  bigTitle: {
    fontFamily: fonts.heading,
    color: colors.textPrimary,
    fontSize: 28,
    marginBottom: 20,
  },
  completion: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  completionEyebrow: {
    fontFamily: fonts.serifBold,
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 8,
  },
  completionTitle: {
    fontFamily: fonts.heading,
    color: colors.textPrimary,
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
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
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
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  completionQuote: {
    fontFamily: fonts.serifItalic,
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
