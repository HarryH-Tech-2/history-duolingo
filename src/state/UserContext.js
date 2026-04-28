// Holds the user's chosen historical-character avatar and derives live stats
// from the curriculum lesson statuses.
import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { REGIONS, CHARACTERS } from '../data/curriculum';
import { AUDIO_TRACKS, NO_TRACK } from '../data/audioTracks';

const UserContext = createContext(null);

const LANGUAGES = ['English', 'Latin', 'Greek', 'Italian', 'Français'];
const THEMES = ['Parchment Dark', 'Parchment Light', 'Imperial Purple'];

export function UserProvider({ children }) {
  // Default avatar: Caesar (first character).
  const [avatarId, setAvatarId] = useState('caesar');
  // Onboarding gate — false until the user finishes the 3-step intro flow.
  const [hasOnboarded, setHasOnboarded] = useState(false);
  // In-session counters that persist between lesson runs.
  const [sessionXp, setSessionXp] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAnswered, setSessionAnswered] = useState(0);
  // Bumped whenever curriculum lesson statuses mutate so consumers re-render.
  const [version, setVersion] = useState(0);

  // ---- Settings state ----
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    haptics: true,
    music: false,
    musicTrackId: NO_TRACK.id,
    language: 'English',
    theme: 'Parchment Dark',
  });

  const updateSetting = useCallback((key, value) => {
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  const toggleSetting = useCallback((key) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }, []);

  const cycleSetting = useCallback((key, options) => {
    setSettings((s) => {
      const current = s[key];
      const idx = options.indexOf(current);
      const next = options[(idx + 1) % options.length];
      return { ...s, [key]: next };
    });
  }, []);

  const avatar = useMemo(
    () => CHARACTERS.find((c) => c.id === avatarId) || CHARACTERS[0],
    [avatarId]
  );

  // Compute stats from current curriculum state + session counters.
  const stats = useMemo(() => {
    const allLessons = REGIONS.flatMap((r) => r.lessons);
    const completed = allLessons.filter((l) => l.status === 'completed');
    const active = allLessons.filter((l) => l.status === 'active');
    const locked = allLessons.filter((l) => l.status === 'locked');

    const completedQuestions = completed.reduce(
      (acc, l) => acc + (l.questions?.length || 0),
      0
    );
    const totalQuestions = allLessons.reduce(
      (acc, l) => acc + (l.questions?.length || 0),
      0
    );
    const totalLessons = allLessons.length;

    // XP: 10 per completed question + live session XP.
    const xp = completedQuestions * 10 + sessionXp;

    // Gems scale with XP (5 gems per completed lesson + session bonus).
    const gems = completed.length * 50 + Math.floor(sessionXp / 2);

    // "Accuracy" across completed lessons — assume 92% for completed (they passed)
    // plus the actual session ratio if any.
    const baseCorrect = completedQuestions;
    const baseAnswered = completedQuestions;
    const totalCorrect = baseCorrect + sessionCorrect;
    const totalAnswered = baseAnswered + sessionAnswered;
    const accuracy =
      totalAnswered === 0 ? 0 : Math.round((totalCorrect / totalAnswered) * 100);

    // Streak: count consecutive completed lessons from the start.
    let streak = 0;
    for (const l of allLessons) {
      if (l.status === 'completed') streak++;
      else break;
    }

    // Regions mastered
    const regionsMastered = REGIONS.filter((r) =>
      r.lessons.every((l) => l.status === 'completed')
    ).length;

    return {
      xp,
      gems,
      hearts: 5, // max hearts default
      accuracy,
      streak,
      lessonsCompleted: completed.length,
      lessonsActive: active.length,
      lessonsLocked: locked.length,
      totalLessons,
      questionsAnswered: completedQuestions + sessionAnswered,
      totalQuestions,
      regionsMastered,
      totalRegions: REGIONS.length,
    };
  }, [sessionXp, sessionCorrect, sessionAnswered, version]);

  const recordAnswer = (correct) => {
    setSessionAnswered((a) => a + 1);
    if (correct) {
      setSessionCorrect((c) => c + 1);
      setSessionXp((x) => x + 10);
    }
  };

  // Mark a lesson complete and unlock the next one in its region. We mutate
  // the in-memory curriculum and bump `version` so consumers re-render.
  const completeLesson = useCallback((lessonId) => {
    for (const region of REGIONS) {
      const idx = region.lessons.findIndex((l) => l.id === lessonId);
      if (idx === -1) continue;
      region.lessons[idx].status = 'completed';
      const next = region.lessons[idx + 1];
      if (next && next.status === 'locked') {
        next.status = 'active';
      }
      // If the whole region is mastered, unlock the next region's first lesson.
      const allDone = region.lessons.every((l) => l.status === 'completed');
      if (allDone) {
        const rIdx = REGIONS.findIndex((r) => r.id === region.id);
        const nextRegion = REGIONS[rIdx + 1];
        if (nextRegion && nextRegion.status === 'locked') {
          nextRegion.status = 'active';
          if (nextRegion.lessons[0] && nextRegion.lessons[0].status === 'locked') {
            nextRegion.lessons[0].status = 'active';
          }
        }
      }
      break;
    }
    setVersion((v) => v + 1);
  }, []);

  const value = useMemo(
    () => ({
      avatar,
      avatarId,
      setAvatarId,
      stats,
      recordAnswer,
      completeLesson,
      version,
      characters: CHARACTERS,
      hasOnboarded,
      completeOnboarding: () => setHasOnboarded(true),
      // Settings
      settings,
      updateSetting,
      toggleSetting,
      cycleSetting,
      languages: LANGUAGES,
      themes: THEMES,
      audioTracks: AUDIO_TRACKS,
    }),
    [avatar, avatarId, stats, hasOnboarded, version, completeLesson, settings, updateSetting, toggleSetting, cycleSetting]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
