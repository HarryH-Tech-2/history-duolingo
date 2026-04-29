// Background-music player. Mounted once in App.js.
//
// Toggle music + pick a track in Profile → Settings → Background music.
// Tracks are registered in src/data/audioTracks.js.

import { useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { useUser } from '../state/UserContext';

export default function MusicPlayer() {
  const { settings, audioTracks } = useUser();

  const track = audioTracks.find((t) => t.id === settings.musicTrackId);
  const shouldPlay = settings.music && !!track && !!track.source;

  const player = useAudioPlayer(shouldPlay ? track.source : null);

  useEffect(() => {
    if (!player) return;
    try {
      player.loop = true;
      player.volume = 0.6;
      if (shouldPlay) {
        player.play();
      } else {
        player.pause();
      }
    } catch (e) {
      console.warn('MusicPlayer: failed to control track', e);
    }
  }, [player, shouldPlay, track && track.id]);

  return null;
}
