// Background-music manifest. Add an entry per mp3 you drop into
// `assets/audio/`. Metro requires static `require()` calls so we can't scan
// the folder at runtime.

export const AUDIO_TRACKS = [
  {
    id: 'iron-on-the-standard',
    title: 'Iron on the Standard',
    source: require('../../assets/audio/Iron on the Standard.mp3'),
  },
  {
    id: 'jade-river-dream',
    title: 'Jade River Dream',
    source: require('../../assets/audio/Jade River Dream.mp3'),
  },
  {
    id: 'marble-and-ember',
    title: 'Marble And Ember',
    source: require('../../assets/audio/Marble And Ember.mp3'),
  },
];

export const NO_TRACK = { id: 'none', title: 'Off', source: null };
