import React, { useRef, useEffect, useState } from 'react';
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

import { colors, fonts, radii, shadows } from '../theme';
import { MODULES, REGIONS } from '../data/curriculum';
import { Check, Lock } from './LessonIcon';
import { useUser } from '../state/UserContext';

const { width: SCREEN_W } = Dimensions.get('window');

// Native source resolution of the painted maps (Gemini returns 1024×1024).
// We render the Image at this logical size inside the gesture-scaled view
// so that zooming reveals real native pixels instead of upscaling a
// screen-sized bitmap.
const NATIVE_W = 1024;
const NATIVE_H = 1024;
// Frame viewport width (what the user actually sees).
const FRAME_W = SCREEN_W;
const FRAME_H = SCREEN_W;
// Base (fit-to-frame) scale — 1024 → screen width.
const FIT_SCALE = FRAME_W / NATIVE_W;
const MIN_SCALE = FIT_SCALE;
// Cap zoom at 1:1 with the source bitmap (scale = 1) so the painted map
// stays crisp instead of upscaling beyond its native resolution. We aim
// for ~6x the fit scale, but never beyond native pixels.
const MAX_SCALE = Math.min(FIT_SCALE * 6, 1);

export default function WorldMap({ onSelect, onZoomChange }) {
  // Subscribing to the user context here makes this component re-render
  // when lesson statuses mutate (active / locked / completed) elsewhere.
  useUser();
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

  // Find which module this region belongs to (for tab grouping).
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
                          color={colors.textMuted}
                          style={{ marginRight: 4 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.tabName,
                          isActive && { color: m.accent },
                          locked && !isActive && { color: colors.textLocked },
                        ]}
                        numberOfLines={1}
                      >
                        {r.name}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.tabEra,
                        isActive && { color: colors.textSecondary },
                        locked && !isActive && { color: colors.textLocked },
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
          <Text style={[styles.eyebrow, { color: regionModule?.accent || colors.gold }]}>
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
        <Ionicons name="scan-outline" size={12} color={colors.textMuted} />
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
                    lesson.status === 'locked' ? 'rgba(30, 35, 50, 0.85)' : lesson.color,
                },
              ]}
            >
              {lesson.status === 'completed' ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : lesson.status === 'active' ? (
                <Text style={styles.stripNum}>{i + 1}</Text>
              ) : (
                <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
              )}
            </View>
            <Text
              style={[
                styles.stripTitle,
                lesson.status === 'locked' && { color: colors.textLocked },
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
          <Ionicons name="star" size={18} color={colors.gold} />
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
            <Ionicons name="chevron-forward" size={14} color="#0B0F1C" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

function ZoomableMap({ region, pulseScale, pulseOpacity, onSelect, onZoomChange }) {
  // Notify parent so it can disable its outer ScrollView while the user is
  // panning the zoomed map. Otherwise the parent intercepts vertical drags.
  const notifyZoom = (zoomed) => {
    if (onZoomChange) onZoomChange(zoomed);
  };
  // Reanimated shared values for pan + pinch. Start at fit-to-frame scale
  // so the full 1024px image fills the screen-width viewport.
  const scale = useSharedValue(FIT_SCALE);
  const savedScale = useSharedValue(FIT_SCALE);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  // Track pinch focal point (in gesture-local coords) so zoom anchors on
  // the user's fingers instead of the image center.
  const pinchFocalX = useSharedValue(0);
  const pinchFocalY = useSharedValue(0);

  const clamp = (val, limit) => {
    'worklet';
    return Math.max(-limit, Math.min(limit, val));
  };

  // At a given scale, how far off-center can we pan before an edge shows?
  const maxPanFor = (s) => {
    'worklet';
    const rendered = NATIVE_W * s;
    return Math.max(0, (rendered - FRAME_W) / 2);
  };

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      // The pinch focal point is reported in the gesture handler's local
      // (un-transformed) coordinate space. Convert to a delta from the
      // frame center so we can anchor zoom on the fingers.
      pinchFocalX.value = e.focalX - FRAME_W / 2;
      pinchFocalY.value = e.focalY - FRAME_H / 2;
    })
    .onUpdate((e) => {
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, savedScale.value * e.scale));
      const ratio = next / savedScale.value;
      // Translate so the focal point stays under the user's fingers as
      // the image scales: new = focal + ratio * (saved - focal).
      const newTx = pinchFocalX.value + ratio * (savedTx.value - pinchFocalX.value);
      const newTy = pinchFocalY.value + ratio * (savedTy.value - pinchFocalY.value);
      const lim = maxPanFor(next);
      scale.value = next;
      tx.value = clamp(newTx, lim);
      ty.value = clamp(newTy, lim);
      // Tell parent we're zoomed so it can disable outer scrolling.
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

  // Pan uses manual activation: it only claims the touch when the map is
  // zoomed past the fit scale. At fit, vertical drags fall through to the
  // parent ScrollView so the page can scroll as expected.
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

  // Double-tap zooms toward the tap location (or zooms back out if already
  // zoomed in).
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

  // Pinch and pan can run simultaneously; double-tap wins over pan when
  // the user is tapping rather than dragging.
  const composed = Gesture.Simultaneous(pinch, Gesture.Exclusive(doubleTap, pan));

  // Transform origin is the center of the NATIVE_W square, so translation
  // is applied in screen space (not scaled space).
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

// Draws a smooth dashed "route" connecting the lesson hotspots in order so
// the player can see which quiz comes next. Rendered inside the native-sized
// 1024×1024 map so it pans & zooms with the image.
function LessonPath({ lessons }) {
  if (!lessons || lessons.length < 2) return null;

  const pts = lessons.map((l) => ({
    x: l.x * NATIVE_W,
    y: l.y * NATIVE_H,
    status: l.status,
  }));

  // Build a smooth cardinal-like path using quadratic bezier midpoints
  // so the line arcs gently between pins instead of zig-zagging.
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const mx = (prev.x + cur.x) / 2;
    const my = (prev.y + cur.y) / 2;
    // Offset control point perpendicular to the segment for a subtle arc.
    const dx = cur.x - prev.x;
    const dy = cur.y - prev.y;
    const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const bend = Math.min(len * 0.18, 80);
    const cx = mx + (-dy / len) * bend;
    const cy = my + (dx / len) * bend;
    d += ` Q ${cx} ${cy} ${cur.x} ${cur.y}`;
  }

  // Find the furthest completed index so we can draw the "traveled" part
  // solid and the rest dashed.
  let lastDone = -1;
  lessons.forEach((l, i) => {
    if (l.status === 'completed') lastDone = i;
  });

  // Solid path through completed pins
  let solidD = '';
  if (lastDone > 0) {
    solidD = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i <= lastDone; i++) {
      const prev = pts[i - 1];
      const cur = pts[i];
      const mx = (prev.x + cur.x) / 2;
      const my = (prev.y + cur.y) / 2;
      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const bend = Math.min(len * 0.18, 80);
      const cx = mx + (-dy / len) * bend;
      const cy = my + (dx / len) * bend;
      solidD += ` Q ${cx} ${cy} ${cur.x} ${cur.y}`;
    }
  }

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
          <Stop offset="0" stopColor="#F5D98A" stopOpacity="0.95" />
          <Stop offset="1" stopColor="#B88F3E" stopOpacity="0.95" />
        </SvgLinearGradient>
      </Defs>
      {/* Shadow underlay for legibility on bright map areas */}
      <SvgPath
        d={d}
        stroke="rgba(11, 15, 28, 0.55)"
        strokeWidth={16}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Upcoming/locked portion — dashed */}
      <SvgPath
        d={d}
        stroke="url(#pathGold)"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="14, 18"
        opacity={0.85}
      />
      {/* Traveled portion — solid, drawn on top */}
      {solidD !== '' && (
        <SvgPath
          d={solidD}
          stroke="url(#pathGold)"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}

function Hotspot({ lesson, number, pulseScale, pulseOpacity, onPress }) {
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

      <View style={[styles.label, disabled && { opacity: 0.55 }]}>
        <Text style={styles.labelName} numberOfLines={1}>
          {lesson.hotspot}
        </Text>
      </View>
    </View>
  );
}

const PIN_SIZE = 54;

const styles = StyleSheet.create({
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
    borderColor: colors.borderSubtle,
    backgroundColor: 'rgba(11, 15, 28, 0.55)',
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
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 17,
    flexShrink: 1,
  },
  tabEra: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
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
    color: colors.textPrimary,
    fontSize: 22,
    lineHeight: 26,
    marginTop: 2,
  },
  progressChip: {
    alignItems: 'flex-end',
  },
  progressNum: {
    fontFamily: fonts.heading,
    color: colors.gold,
    fontSize: 20,
    lineHeight: 22,
  },
  progressLbl: {
    fontFamily: fonts.serif,
    color: colors.textMuted,
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
    color: colors.textMuted,
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
    borderWidth: 2.5,
    overflow: 'hidden',
  },
  pinIcon: {
    width: PIN_SIZE - 6,
    height: PIN_SIZE - 6,
    borderRadius: (PIN_SIZE - 6) / 2,
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
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3E8256',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0B0F1C',
  },
  numberBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0B0F1C',
  },
  numberText: {
    fontFamily: fonts.serifBold,
    color: '#0B0F1C',
    fontSize: 10,
  },
  label: {
    position: 'absolute',
    top: PIN_SIZE + 2,
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 28, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 54,
  },
  labelName: {
    fontFamily: fonts.serifBold,
    color: colors.textPrimary,
    fontSize: 9,
    letterSpacing: 0.2,
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
    color: colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 13,
  },

  unlock: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: radii.md,
    backgroundColor: 'rgba(232, 201, 116, 0.1)',
    borderWidth: 1.5,
    borderColor: colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unlockText: {
    flex: 1,
    fontFamily: fonts.serifBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gold,
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
