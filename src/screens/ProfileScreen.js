import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { fonts, radii } from '../theme';
import { Flame, Gem, Heart } from '../components/Stats';
import { useUser, useThemeColors } from '../state/UserContext';

const { width: SCREEN_W } = Dimensions.get('window');

// Hook used by every sub-component in this file so they all re-render when
// the active theme changes.
function useThemed() {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return { c, styles };
}

export default function ProfileScreen() {
  const {
    avatar,
    avatarId,
    setAvatarId,
    stats,
    characters,
    settings,
    toggleSetting,
    cycleSetting,
    updateSetting,
    themes,
    audioTracks,
  } = useUser();
  const { c, styles } = useThemed();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [musicPickerOpen, setMusicPickerOpen] = useState(false);

  const currentTrack =
    audioTracks.find((t) => t.id === settings.musicTrackId) || null;

  const badges = useMemo(
    () => [
      {
        name: 'First Steps',
        emoji: '🏛️',
        achieved: stats.lessonsCompleted >= 1,
        desc: 'Complete your first lesson',
      },
      {
        name: 'Scribe',
        emoji: '📜',
        achieved: stats.questionsAnswered >= 10,
        desc: 'Answer 10 questions',
      },
      {
        name: 'Week Warrior',
        emoji: '🔥',
        achieved: stats.streak >= 7,
        desc: '7-lesson streak',
      },
      {
        name: 'Centurion',
        emoji: '🛡️',
        achieved: stats.lessonsCompleted >= 5,
        desc: 'Complete 5 lessons',
      },
      {
        name: 'Cartographer',
        emoji: '🗺️',
        achieved: stats.regionsMastered >= 1,
        desc: 'Master a region',
      },
      {
        name: 'Historian',
        emoji: '⌛',
        achieved: stats.regionsMastered >= stats.totalRegions,
        desc: 'Master every region',
      },
    ],
    [stats]
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={[c.gradient[0], c.bg]} style={StyleSheet.absoluteFill} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          <View style={styles.topHero}>
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={({ pressed }) => [
                styles.avatarLarge,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <Image
                source={avatar.image}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
              <View style={styles.avatarEditBadge}>
                <Ionicons name="pencil" size={12} color={c.bg} />
              </View>
            </Pressable>
            <Text style={styles.name}>{avatar.name}</Text>
            <Text style={styles.handle}>{avatar.era}</Text>
          </View>

          <View style={styles.statsRow}>
            <StatCard icon={<Flame size={22} />} value={stats.streak} label="Streak" />
            <StatCard icon={<Gem size={22} />} value={stats.gems} label="Gems" />
            <StatCard icon={<Heart size={22} />} value={stats.hearts} label="Hearts" />
          </View>

          <Section title="Achievements">
            <View style={styles.badgeGrid}>
              {badges.map((b, i) => (
                <View
                  key={i}
                  style={[styles.badge, !b.achieved && styles.badgeLocked]}
                >
                  <Text style={[styles.badgeEmoji, !b.achieved && { opacity: 0.3 }]}>
                    {b.emoji}
                  </Text>
                  <Text
                    style={[
                      styles.badgeName,
                      !b.achieved && { color: c.textLocked },
                    ]}
                  >
                    {b.name}
                  </Text>
                  <Text
                    style={[
                      styles.badgeDesc,
                      !b.achieved && { color: c.textLocked },
                    ]}
                    numberOfLines={2}
                  >
                    {b.desc}
                  </Text>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Stats">
            <Row
              label="Lessons completed"
              value={`${stats.lessonsCompleted} / ${stats.totalLessons}`}
            />
            <Row
              label="Questions answered"
              value={`${stats.questionsAnswered} / ${stats.totalQuestions}`}
            />
            <Row label="Accuracy" value={`${stats.accuracy}%`} />
            <Row label="Total XP" value={stats.xp} />
            <Row
              label="Regions mastered"
              value={`${stats.regionsMastered} / ${stats.totalRegions}`}
            />
            <Row label="Current streak" value={`${stats.streak} lessons`} />
          </Section>

          <Section title="Settings">
            <View style={styles.settingsGroup}>
              <SettingRow
                icon="person-circle"
                tint="#E8C974"
                label="Change character"
                onPress={() => setPickerOpen(true)}
                value={avatar.name}
              />
              <SettingRow
                icon="volume-high"
                tint="#8A6BC7"
                label="Sound effects"
                value={settings.soundEffects ? 'On' : 'Off'}
                onPress={() => toggleSetting('soundEffects')}
              />
              <SettingRow
                icon="phone-portrait"
                tint="#E89C5F"
                label="Haptics"
                value={settings.haptics ? 'On' : 'Off'}
                onPress={() => toggleSetting('haptics')}
              />
              <SettingRow
                icon="musical-notes"
                tint="#6EA3D6"
                label="Background music"
                value={
                  settings.music
                    ? currentTrack
                      ? currentTrack.title
                      : 'On (no track)'
                    : 'Off'
                }
                onPress={() => setMusicPickerOpen(true)}
              />
              <SettingRow
                icon="moon"
                tint="#6EA3D6"
                label="Theme"
                value={settings.theme}
                onPress={() => cycleSetting('theme', themes)}
                isLast
              />
            </View>
          </Section>
        </ScrollView>
      </SafeAreaView>

      <CharacterPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        characters={characters}
        activeId={avatarId}
        onPick={(id) => {
          setAvatarId(id);
          setPickerOpen(false);
        }}
      />

      <MusicPicker
        open={musicPickerOpen}
        onClose={() => setMusicPickerOpen(false)}
        tracks={audioTracks}
        musicEnabled={settings.music}
        activeTrackId={settings.musicTrackId}
        onToggle={() => toggleSetting('music')}
        onPick={(id) => {
          updateSetting('musicTrackId', id);
          if (id !== 'none' && !settings.music) updateSetting('music', true);
          setMusicPickerOpen(false);
        }}
      />
    </View>
  );
}

function MusicPicker({ open, onClose, tracks, musicEnabled, activeTrackId, onToggle, onPick }) {
  const { c, styles } = useThemed();
  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalSheet}>
          <LinearGradient
            colors={[c.bgElevated, c.bg]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Background music</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={c.textSecondary} />
            </Pressable>
          </View>
          <Text style={styles.modalSub}>
            Drop mp3s into assets/audio/ and register them in src/data/audioTracks.js.
          </Text>

          <Pressable
            onPress={onToggle}
            style={({ pressed }) => [
              styles.musicToggle,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons
              name={musicEnabled ? 'volume-high' : 'volume-mute'}
              size={18}
              color={musicEnabled ? c.gold : c.textMuted}
            />
            <Text style={styles.musicToggleLabel}>
              Music {musicEnabled ? 'enabled' : 'disabled'}
            </Text>
            <View
              style={[
                styles.toggleSwitch,
                musicEnabled && styles.toggleSwitchOn,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  musicEnabled && styles.toggleKnobOn,
                ]}
              />
            </View>
          </Pressable>

          <ScrollView
            style={{ marginTop: 12 }}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <TrackRow
              title="Off"
              subtitle="No background music"
              active={activeTrackId === 'none'}
              onPress={() => onPick('none')}
            />
            {tracks.length === 0 ? (
              <View style={styles.emptyTracks}>
                <Ionicons name="folder-open" size={28} color={c.textMuted} />
                <Text style={styles.emptyTracksTitle}>No tracks registered</Text>
                <Text style={styles.emptyTracksDesc}>
                  See assets/audio/README.md for setup instructions.
                </Text>
              </View>
            ) : (
              tracks.map((t) => (
                <TrackRow
                  key={t.id}
                  title={t.title}
                  subtitle={t.id}
                  active={activeTrackId === t.id}
                  onPress={() => onPick(t.id)}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function TrackRow({ title, subtitle, active, onPress }) {
  const { c, styles } = useThemed();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.trackRow,
        active && styles.trackRowActive,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Ionicons
        name={active ? 'radio-button-on' : 'radio-button-off'}
        size={20}
        color={active ? c.gold : c.textMuted}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.trackTitle, active && { color: c.gold }]}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.trackSubtitle}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

function CharacterPicker({ open, onClose, characters, activeId, onPick }) {
  const { c, styles } = useThemed();
  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalSheet}>
          <LinearGradient
            colors={[c.bgElevated, c.bg]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose your avatar</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={c.textSecondary} />
            </Pressable>
          </View>
          <Text style={styles.modalSub}>
            Pick a hero to learn alongside.
          </Text>
          <ScrollView
            contentContainerStyle={styles.pickerGrid}
            showsVerticalScrollIndicator={false}
          >
            {characters.map((ch) => {
              const active = ch.id === activeId;
              return (
                <Pressable
                  key={ch.id}
                  onPress={() => onPick(ch.id)}
                  style={({ pressed }) => [
                    styles.pickerCard,
                    active && styles.pickerCardActive,
                    pressed && { transform: [{ scale: 0.97 }] },
                  ]}
                >
                  <View style={styles.pickerPortrait}>
                    <Image
                      source={ch.image}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                    {active && (
                      <View style={styles.pickerCheck}>
                        <Ionicons name="checkmark" size={14} color={c.bg} />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.pickerName,
                      active && { color: c.gold },
                    ]}
                    numberOfLines={1}
                  >
                    {ch.name}
                  </Text>
                  <Text style={styles.pickerEra} numberOfLines={1}>
                    {ch.era}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function StatCard({ icon, value, label }) {
  const { styles } = useThemed();
  return (
    <View style={styles.statCard}>
      {icon}
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

function Section({ title, children }) {
  const { styles } = useThemed();
  return (
    <View style={{ marginTop: 28, paddingHorizontal: 16 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value }) {
  const { styles } = useThemed();
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function SettingRow({ icon, label, value, onPress, tint, isLast }) {
  const { c, styles } = useThemed();
  const iconTint = tint || c.gold;
  // Always use Pressable so the function-style works whether or not the row
  // has an onPress handler. Using `<View style={fn}>` silently drops styles.
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        isLast && { borderBottomWidth: 0 },
        pressed && onPress && { opacity: 0.7 },
      ]}
    >
      <View style={[styles.settingIconChip, { backgroundColor: iconTint + '22', borderColor: iconTint + '55' }]}>
        <Ionicons name={icon} size={16} color={iconTint} />
      </View>
      <Text style={styles.settingLabel} numberOfLines={1}>{label}</Text>
      <View style={styles.settingValueWrap}>
        {value ? (
          <Text style={styles.settingValue} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
      </View>
    </Pressable>
  );
}

const makeStyles = (c) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg },
  topHero: { alignItems: 'center', paddingTop: 20, paddingBottom: 12 },
  avatarLarge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: c.gold,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: c.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: c.bg,
  },
  name: {
    fontFamily: fonts.heading,
    color: c.textPrimary,
    fontSize: 28,
    marginTop: 12,
    letterSpacing: -0.5,
  },
  handle: {
    fontFamily: fonts.serifItalic,
    color: c.gold,
    fontSize: 14,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: c.bgCard,
    borderWidth: 1,
    borderColor: c.borderSubtle,
    borderRadius: radii.md,
    paddingVertical: 14,
    gap: 4,
  },
  statVal: {
    fontFamily: fonts.heading,
    color: c.textPrimary,
    fontSize: 22,
  },
  statLbl: {
    fontFamily: fonts.serif,
    color: c.textMuted,
    fontSize: 11,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontFamily: fonts.serifBold,
    color: c.gold,
    fontSize: 12,
    letterSpacing: 2.5,
    marginBottom: 10,
  },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    width: '31.5%',
    aspectRatio: 0.95,
    backgroundColor: c.bgCard,
    borderWidth: 1,
    borderColor: c.borderSubtle,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  badgeLocked: { backgroundColor: c.bgGlass, borderStyle: 'dashed' },
  badgeEmoji: { fontSize: 32, marginBottom: 4 },
  badgeName: {
    fontFamily: fonts.serifBold,
    color: c.textPrimary,
    fontSize: 12,
    textAlign: 'center',
  },
  badgeDesc: {
    fontFamily: fonts.serif,
    color: c.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: c.borderSubtle,
  },
  rowLabel: { fontFamily: fonts.serif, color: c.textSecondary, fontSize: 14 },
  rowValue: { fontFamily: fonts.serifBold, color: c.gold, fontSize: 14 },
  settingsGroup: {
    backgroundColor: c.bgCard,
    borderWidth: 1,
    borderColor: c.borderSubtle,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.borderSubtle,
  },
  settingIconChip: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
    fontFamily: fonts.serif,
    color: c.textPrimary,
    fontSize: 15,
  },
  settingValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '50%',
  },
  settingValue: {
    fontFamily: fonts.serifBold,
    color: c.gold,
    fontSize: 13,
    letterSpacing: 0.2,
    textAlign: 'right',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    height: '82%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderColor: c.borderSubtle,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: fonts.heading,
    color: c.textPrimary,
    fontSize: 22,
  },
  modalSub: {
    fontFamily: fonts.serifItalic,
    color: c.textSecondary,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 12,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  pickerCard: {
    width: (SCREEN_W - 32 - 20) / 3,
    backgroundColor: c.bgCard,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: c.borderSubtle,
    padding: 8,
    alignItems: 'center',
  },
  pickerCardActive: {
    borderColor: c.gold,
    backgroundColor: c.goldSoft,
  },
  pickerPortrait: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.sm,
    overflow: 'hidden',
    backgroundColor: c.bgDeep,
  },
  pickerCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: c.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: c.bg,
  },
  pickerName: {
    fontFamily: fonts.serifBold,
    color: c.textPrimary,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  pickerEra: {
    fontFamily: fonts.serifItalic,
    color: c.textMuted,
    fontSize: 9,
    marginTop: 1,
    textAlign: 'center',
  },
  musicToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: c.bgCard,
    borderWidth: 1,
    borderColor: c.borderSubtle,
    borderRadius: radii.md,
    marginTop: 4,
  },
  musicToggleLabel: {
    flex: 1,
    fontFamily: fonts.serifBold,
    color: c.textPrimary,
    fontSize: 14,
  },
  toggleSwitch: {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: c.borderSubtle,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchOn: {
    backgroundColor: c.gold,
  },
  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: c.bg,
  },
  toggleKnobOn: {
    transform: [{ translateX: 18 }],
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.borderSubtle,
  },
  trackRowActive: {
    backgroundColor: c.goldSoft,
  },
  trackTitle: {
    fontFamily: fonts.serifBold,
    color: c.textPrimary,
    fontSize: 15,
  },
  trackSubtitle: {
    fontFamily: fonts.serif,
    color: c.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  emptyTracks: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 6,
  },
  emptyTracksTitle: {
    fontFamily: fonts.serifBold,
    color: c.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
  emptyTracksDesc: {
    fontFamily: fonts.serifItalic,
    color: c.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});
