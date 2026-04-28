# Audio

Drop `.mp3` files in this folder, then register them in
`src/data/audioTracks.js` so the bundler picks them up.

## How to add a new track

1. Copy your file here, e.g. `assets/audio/forum-theme.mp3`.
2. Open `src/data/audioTracks.js` and add an entry:

```js
{ id: 'forum-theme', title: 'The Forum', source: require('../../assets/audio/forum-theme.mp3') },
```

3. The track will appear in the Profile → Settings → Background music picker.

## Why a manifest?

React Native's bundler (Metro) resolves `require()` paths at build time and
cannot scan a folder at runtime, so each file has to be listed explicitly.

## Playback dependency

Background music playback uses `expo-av`. If you haven't already, install it:

```
npx expo install expo-av
```

Without `expo-av` the picker still works but no audio will play.
