// Background-music player. Mounted once in App.js.
//
// Toggle music + pick a track in Profile → Settings → Background music.
// Tracks are registered in src/data/audioTracks.js.

import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useUser } from '../state/UserContext';

export default function MusicPlayer() {
  const { settings, audioTracks } = useUser();
  const soundRef = useRef(null);

  const track = audioTracks.find((t) => t.id === settings.musicTrackId);
  const shouldPlay = settings.music && !!track && !!track.source;

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      if (!shouldPlay) return;
      try {
        const { sound } = await Audio.Sound.createAsync(track.source, {
          isLooping: true,
          volume: 0.6,
          shouldPlay: true,
        });
        if (cancelled) {
          await sound.unloadAsync().catch(() => {});
          return;
        }
        soundRef.current = sound;
      } catch (e) {
        console.warn('MusicPlayer: failed to load track', e);
      }
    }

    sync();
    return () => {
      cancelled = true;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, [shouldPlay, track && track.id]);

  return null;
}
