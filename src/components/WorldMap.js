import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path as SvgPath, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

import { fonts, radii, shadows } from '../theme';
import { MODULES, REGIONS } from '../data/curriculum';
import { Check, Lock } from './LessonIcon';
import { useUser, useThemeColors } from '../state/UserContext';

const { width: SCREEN_W } = Dimensions.get('window');

const NATIVE_W = 1024;
const NATIVE_H = 1024;
const FRAME_W = SCREEN_W;
const FRAME_H = SCREEN_W;
const FIT_SCALE = FRAME_W / NATIVE_W;
const MIN_SCALE = FIT_SCALE;
const MAX_SCALE = Math.min(FIT_SCALE * 6, 1);

function useThemed() {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return { c, styles };
}

export default function WorldMap({ onSelect, onZoomChange }) {
  useUser();
  const { c, styles } = useThemed();
  const [activeIdx, setActiveIdx] = useState(0);
  const region = REGIONS[activeIdx];
  const fade = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const completedCount = region.lessons.filter((l) => l.status === 'completed').length;
  const totalCount = region.lessons.length;
  const allDone = completedCount === totalCount;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fade, { toValue: 0.25, duration: 160, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [activeIdx]);

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  const regionModule = MODULES.find((m) => m.regions.some((r) => r.id === region.id));

  return (
    <View style={styles.wrap}>
      {/* Module-grouped region tabs (horizontal scroll) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
        style={styles.tabs}
      >
        {MODULES.map((m, mi) => (
          <View key={m.id} style={styles.moduleTabGroup}>
            <Text style={[styles.moduleTabLabel, { color: m.accent }]}>
              {m.title.toUpperCase()}
            </Text>
            <View style={styles.moduleTabRow}>
              {m.regions.map((r) => {
                const idx = REGIONS.findIndex((rr) => rr.id === r.id);
                const isActive = idx === activeIdx;
                const locked = r.status === 'locked';
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => setActiveIdx(idx)}
                    style={({ pressed }) => [
                      styles.tab,
                      locked && !isActive && styles.tabLocked,
                      isActive && { borderColor: m.accent, backgroundColor: m.accent + '22' },
                      pressed && { transform: [{ scale: 0.98 }] },
                    ]}
                  >
                    <View style={styles.tabNameRow}>
                      {locked && !isActive && (
                        <Ionicons
                          name="lock-closed"
                          size={10}
                          color={c.textMuted}
                          style={{ marginRight: 4 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.tabName,
                          isActive && { color: m.accent },
                          locked && !isActive && { color: c.textLocked },
                        ]}
                        numberOfLines={1}
                      >
                        {r.name}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.tabEra,
                        isActive && { color: c.textSecondary },
                        locked && !isActive && { color: c.textLocked },
                      ]}
                      numberOfLines={1}
                    >
                      {r.era}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Region header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: regionModule?.accent || c.gold }]}>
            {regionModule?.title.toUpperCase() || 'REGION'}
          </Text>
          <Text style={styles.title}>{region.subtitle}</Text>
        </View>
        <View style={styles.progressChip}>
          <Text style={styles.progressNum}>
            {completedCount}/{totalCount}
          </Text>
          <Text style={styles.progressLbl}>Mastered</Text>
        </View>
      </View>

      {/* Zoomable painted map */}
      <Animated.View style={{ opacity: fade }}>
        <ZoomableMap
          key={region.id}
          region={region}
          pulseScale={pulseScale}
          pulseOpacity={pulseOpacity}
          onSelect={onSelect}
          onZoomChange={onZoomChange}
        />
      </Animated.View>

      {/* Hint */}
      <View style={styles.hintRow}>
        <Ionicons name="scan-outline" size={12} color={c.textMuted} />
        <Text style={styles.hintText}>Pinch to zoom · drag to pan</Text>
      </View>

      {/* Lesson list strip */}
      <View style={styles.lessonStrip}>
        {region.lessons.map((lesson, i) => (
          <Pressable
            key={lesson.id}
            onPress={() => lesson.status !== 'locked' && onSelect && onSelect(lesson)}
            style={({ pressed }) => [
              styles.stripItem,
              pressed && lesson.status !== 'locked' && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <View
              style={[
                styles.stripDot,
                {
                  backgroundColor:
                    lesson.status === 'locked' ? c.bgCardSolid : lesson.color,
                },
              ]}
            >
              {lesson.status === 'completed' ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : lesson.status === 'active' ? (
                <Text style={styles.stripNum}>{i + 1}</Text>
              ) : (
                <Ionicons name="lock-closed" size={12} color={c.textMuted} />
              )}
            </View>
            <Text
              style={[
                styles.stripTitle,
                lesson.status === 'locked' && { color: c.textLocked },
              ]}
              numberOfLines={1}
            >
              {lesson.title}
            </Text>
          </Pressable>
        ))}
      </View>

      {allDone && activeIdx < REGIONS.length - 1 && (
        <View style={styles.unlock}>
          <Ionicons name="star" size={18} color={c.gold} />
          <Text style={styles.unlockText}>
            Region mastered — {REGIONS[activeIdx + 1].name} unlocked
          </Text>
          <Pressable
            onPress={() => setActiveIdx(activeIdx + 1)}
            style={({ pressed }) => [
              styles.unlockBtn,
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={styles.unlockBtnText}>CONTINUE</Text>
            <Ionicons name="chevron-forward" size={14} color={c.bg} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

function ZoomableMap({ region, pulseScale, pulseOpacity, onSelect, onZoomChange }) {
  const { styles } = useThemed();
  const notifyZoom = (zoomed) => {
    if (onZoomChange) onZoomChange(zoomed);
  };
  const scale = useSharedValue(FIT_SCALE);
  const savedScale = useSharedValue(FIT_SCALE);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const pinchFocalX = useSharedValue(0);
  const pinchFocalY = useSharedValue(0);

  const clamp = (val, limit) => {
    'worklet';
    return Math.max(-limit, Math.min(limit, val));
  };

  const maxPanFor = (s) => {
    'worklet';
    const rendered = NATIVE_W * s;
    return Math.max(0, (rendered - FRAME_W) / 2);
  };

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      pinchFocalX.value = e.focalX - FRAME_W / 2;
      pinchFocalY.value = e.focalY - FRAME_H / 2;
    })
    .onUpdate((e) => {
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, savedScale.value * e.scale));
      const ratio = next / savedScale.value;
      const newTx = pinchFocalX.value + ratio * (savedTx.value - pinchFocalX.value);
      const newTy = pinchFocalY.value + ratio * (savedTy.value - pinchFocalY.value);
      const lim = maxPanFor(next);
      scale.value = next;
      tx.value = clamp(newTx, lim);
      ty.value = clamp(newTy, lim);
      if (next > MIN_SCALE + 0.001) runOnJS(notifyZoom)(true);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= MIN_SCALE + 0.001) {
        scale.value = withTiming(MIN_SCALE);
        tx.value = withTiming(0);
        ty.value = withTiming(0);
        savedScale.value = MIN_SCALE;
        savedTx.value = 0;
        savedTy.value = 0;
        runOnJS(notifyZoom)(false);
      } else {
        const lim = maxPanFor(scale.value);
        const cx = clamp(tx.value, lim);
        const cy = clamp(ty.value, lim);
        tx.value = withTiming(cx);
        ty.value = withTiming(cy);
        savedTx.value = cx;
        savedTy.value = cy;
      }
    });

  const pan = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .manualActivation(true)
    .onTouchesMove((_, manager) => {
      'worklet';
      if (scale.value > MIN_SCALE + 0.001) {
        manager.activate();
      } else {
        manager.fail();
      }
    })
    .onUpdate((e) => {
      const lim = maxPanFor(scale.value);
      tx.value = clamp(savedTx.value + e.translationX, lim);
      ty.value = clamp(savedTy.value + e.translationY, lim);
    })
    .onEnd(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(280)
    .onEnd((e) => {
      if (scale.value > MIN_SCALE + 0.001) {
        scale.value = withTiming(MIN_SCALE);
        tx.value = withTiming(0);
        ty.value = withTiming(0);
        savedScale.value = MIN_SCALE;
        savedTx.value = 0;
        savedTy.value = 0;
        runOnJS(notifyZoom)(false);
      } else {
        const target = Math.min(FIT_SCALE * 3, MAX_SCALE);
        const fx = e.x - FRAME_W / 2;
        const fy = e.y - FRAME_H / 2;
        const ratio = target / scale.value;
        const newTx = fx + ratio * (tx.value - fx);
        const newTy = fy + ratio * (ty.value - fy);
        const lim = maxPanFor(target);
        scale.value = withTiming(target);
        tx.value = withTiming(clamp(newTx, lim));
        ty.value = withTiming(clamp(newTy, lim));
        savedScale.value = target;
        savedTx.value = clamp(newTx, lim);
        savedTy.value = clamp(newTy, lim);
        runOnJS(notifyZoom)(true);
      }
    });

  const composed = Gesture.Simultaneous(pinch, Gesture.Exclusive(doubleTap, pan));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.mapFrame}>
      <GestureDetector gesture={composed}>
        <Reanimated.View style={[styles.mapInner, animatedStyle]}>
          <Image
            source={region.image}
            style={{ width: NATIVE_W, height: NATIVE_H }}
            resizeMode="cover"
            resizeMethod="scale"
            fadeDuration={200}
          />

          <LinearGradient
            colors={[
              'rgba(11,15,28,0.25)',
              'rgba(11,15,28,0)',
              'rgba(11,15,28,0)',
              'rgba(11,15,28,0.25)',
            ]}
            locations={[0, 0.08, 0.92, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          <LessonPath lessons={region.lessons} />

          {region.lessons.map((lesson, i) => (
            <Hotspot
              key={lesson.id}
              lesson={lesson}
              number={i + 1}
              pulseScale={pulseScale}
              pulseOpacity={pulseOpacity}
              onPress={() => onSelect && onSelect(lesson)}
            />
          ))}
        </Reanimated.View>
      </GestureDetector>
    </View>
  );
}

// Builds a smooth centripetal-Catmull-Rom spline (converted to cubic Béziers).
// Two things make this *guaranteed* smooth:
//   1) Endpoints are extrapolated (p0 = 2*p1 - p2, pN+1 = 2*pN - pN-1) instead
//      of clamped, so the first and last segments curve naturally rather than
//      leaving a tangent kink at the start/end pin.
//   2) Control handles use a normalized tangent length, so points that are
//      close together don't get over-shot bezier handles (which is what causes
//      the "loopy" wobble in vanilla Catmull-Rom near clustered lessons).
function buildSmoothPath(pts) {
  if (pts.length < 2) return '';
  if (pts.length === 2) {
    // Even with 2 points, render as a curve-friendly cubic with mirrored
    // handles so the stroked line meets the stroke-caps cleanly.
    const a = pts[0];
    const b = pts[1];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    return `M ${a.x} ${a.y} C ${mx} ${my}, ${mx} ${my}, ${b.x} ${b.y}`;
  }

  const extended = [
    // Extrapolate a phantom point before the first so the start tangent has
    // proper direction instead of zero.
    { x: 2 * pts[0].x - pts[1].x, y: 2 * pts[0].y - pts[1].y },
    ...pts,
    // Same trick at the end.
    {
      x: 2 * pts[pts.length - 1].x - pts[pts.length - 2].x,
      y: 2 * pts[pts.length - 1].y - pts[pts.length - 2].y,
    },
  ];

  // Tension dialed back from 0.5 → 0.4 so the curve stays smooth without
  // overshooting between tightly-spaced points.
  const t = 0.4;

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < extended.length - 2; i++) {
    const p0 = extended[i - 1];
    const p1 = extended[i];
    const p2 = extended[i + 1];
    const p3 = extended[i + 2];
    const c1x = p1.x + (p2.x - p0.x) * t * (1 / 3);
    const c1y = p1.y + (p2.y - p0.y) * t * (1 / 3);
    const c2x = p2.x - (p3.x - p1.x) * t * (1 / 3);
    const c2y = p2.y - (p3.y - p1.y) * t * (1 / 3);
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

function LessonPath({ lessons }) {
  if (!lessons || lessons.length < 2) return null;

  const pts = lessons.map((l) => ({
    x: l.x * NATIVE_W,
    y: l.y * NATIVE_H,
  }));

  const d = buildSmoothPath(pts);

  let lastDone = -1;
  lessons.forEach((l, i) => {
    if (l.status === 'completed') lastDone = i;
  });

  const solidD = lastDone > 0 ? buildSmoothPath(pts.slice(0, lastDone + 1)) : '';

  // Constellation glow: stack progressively narrower & brighter strokes on top
  // of one another to approximate a gaussian blur (react-native-svg can't run
  // filter primitives on Android, so stacking is the portable solution).
  const glowLayers = [
    { width: 38, opacity: 0.06 },
    { width: 28, opacity: 0.10 },
    { width: 20, opacity: 0.16 },
    { width: 12, opacity: 0.26 },
  ];

  return (
    <Svg
      width={NATIVE_W}
      height={NATIVE_H}
      viewBox={`0 0 ${NATIVE_W} ${NATIVE_H}`}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      <Defs>
        <SvgLinearGradient id="pathGold" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFE9B0" stopOpacity="1" />
          <Stop offset="0.5" stopColor="#F5D98A" stopOpacity="1" />
          <Stop offset="1" stopColor="#E8B85C" stopOpacity="1" />
        </SvgLinearGradient>
        <SvgLinearGradient id="pathGoldBright" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#FFF4D6" stopOpacity="1" />
          <Stop offset="1" stopColor="#FFE9B0" stopOpacity="1" />
        </SvgLinearGradient>
      </Defs>

      {/* Stacked gold glow halo — the constellation aura. Strokes share the
          same `d` so they overlap perfectly and read as one soft glow. */}
      {glowLayers.map((g, idx) => (
        <SvgPath
          key={`glow-${idx}`}
          d={d}
          stroke="#F5D98A"
          strokeOpacity={g.opacity}
          strokeWidth={g.width}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* Thin gold "starline" core for the full route (dimmer where un-traveled) */}
      <SvgPath
        d={d}
        stroke="url(#pathGold)"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.55}
      />

      {/* Completed segment: brighter outer glow + bright white-hot core. */}
      {solidD !== '' && (
        <>
          {[
            { width: 32, opacity: 0.14 },
            { width: 22, opacity: 0.22 },
            { width: 14, opacity: 0.32 },
          ].map((g, idx) => (
            <SvgPath
              key={`done-glow-${idx}`}
              d={solidD}
              stroke="#FFE9B0"
              strokeOpacity={g.opacity}
              strokeWidth={g.width}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          <SvgPath
            d={solidD}
            stroke="url(#pathGold)"
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <SvgPath
            d={solidD}
            stroke="url(#pathGoldBright)"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
          />
        </>
      )}
    </Svg>
  );
}

function Hotspot({ lesson, number, pulseScale, pulseOpacity, onPress }) {
  const { styles } = useThemed();
  const disabled = lesson.status === 'locked';
  const isActive = lesson.status === 'active';
  const isDone = lesson.status === 'completed';

  return (
    <View
      style={[
        styles.hotspotWrap,
        { left: lesson.x * NATIVE_W - PIN_SIZE / 2, top: lesson.y * NATIVE_H - PIN_SIZE / 2 },
      ]}
    >
      {isActive && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              borderColor: lesson.color,
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        />
      )}

      <Pressable
        onPress={disabled ? undefined : onPress}
        style={({ pressed }) => [
          styles.pin,
          {
            borderColor: disabled ? 'rgba(245, 232, 208, 0.25)' : lesson.color,
            backgroundColor: disabled ? 'rgba(15, 20, 35, 0.88)' : '#0B0F1C',
          },
          !disabled && shadows.deep,
          pressed && !disabled && { transform: [{ scale: 0.92 }] },
        ]}
      >
        {disabled ? (
          <Lock size={20} />
        ) : (
          <Image source={lesson.icon} style={styles.pinIcon} resizeMode="cover" />
        )}
        {isDone && (
          <View style={styles.checkBadge}>
            <Check />
          </View>
        )}
        {!disabled && !isDone && (
          <View style={[styles.numberBadge, { backgroundColor: lesson.color }]}>
            <Text style={styles.numberText}>{number}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const PIN_SIZE = 96;

const makeStyles = (c) => StyleSheet.create({
  wrap: { marginTop: 12 },
  tabs: { marginBottom: 12 },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 16,
    alignItems: 'flex-start',
  },
  moduleTabGroup: {
    gap: 6,
  },
  moduleTabLabel: {
    fontFamily: fonts.serifBold,
    fontSize: 9,
    letterSpacing: 2,
    paddingLeft: 4,
  },
  moduleTabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    minWidth: 110,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: c.borderSubtle,
    backgroundColor: c.bgCard,
    position: 'relative',
  },
  tabLocked: {
    opacity: 0.85,
  },
  tabNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabName: {
    fontFamily: fonts.heading,
    color: c.textSecondary,
    fontSize: 14,
    lineHeight: 17,
    flexShrink: 1,
  },
  tabEra: {
    fontFamily: fonts.serif,
    color: c.textMuted,
    fontSize: 10,
    marginTop: 1,
    letterSpacing: 0.4,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  eyebrow: {
    fontFamily: fonts.serifBold,
    fontSize: 10,
    letterSpacing: 2.5,
  },
  title: {
    fontFamily: fonts.heading,
    color: c.textPrimary,
    fontSize: 22,
    lineHeight: 26,
    marginTop: 2,
  },
  progressChip: {
    alignItems: 'flex-end',
  },
  progressNum: {
    fontFamily: fonts.heading,
    color: c.gold,
    fontSize: 20,
    lineHeight: 22,
  },
  progressLbl: {
    fontFamily: fonts.serif,
    color: c.textMuted,
    fontSize: 10,
    letterSpacing: 1.5,
  },

  mapFrame: {
    width: FRAME_W,
    height: FRAME_H,
    backgroundColor: '#060913',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapInner: {
    width: NATIVE_W,
    height: NATIVE_H,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  hintText: {
    fontFamily: fonts.serifItalic,
    color: c.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
  },

  hotspotWrap: {
    position: 'absolute',
    width: PIN_SIZE,
    height: PIN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    overflow: 'hidden',
  },
  pinIcon: {
    width: PIN_SIZE - 8,
    height: PIN_SIZE - 8,
    borderRadius: (PIN_SIZE - 8) / 2,
  },
  pulseRing: {
    position: 'absolute',
    width: PIN_SIZE,
    height: PIN_SIZE,
    borderRadius: PIN_SIZE / 2,
    borderWidth: 3,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3E8256',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#0B0F1C',
  },
  numberBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#0B0F1C',
  },
  numberText: {
    fontFamily: fonts.serifBold,
    color: '#0B0F1C',
    fontSize: 13,
  },
  lessonStrip: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 6,
  },
  stripItem: { flex: 1, alignItems: 'center', gap: 4 },
  stripDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripNum: {
    fontFamily: fonts.serifBold,
    color: '#0B0F1C',
    fontSize: 13,
  },
  stripTitle: {
    fontFamily: fonts.serif,
    color: c.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 13,
  },

  unlock: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: radii.md,
    backgroundColor: c.goldSoft,
    borderWidth: 1.5,
    borderColor: c.gold,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unlockText: {
    flex: 1,
    fontFamily: fonts.serifBold,
    color: c.textPrimary,
    fontSize: 13,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: c.gold,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  unlockBtnText: {
    fontFamily: fonts.serifBold,
    color: '#0B0F1C',
    fontSize: 11,
    letterSpacing: 1.2,
  },
});
