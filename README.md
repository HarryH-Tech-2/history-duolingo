# Chronos — Duolingo for History

A gamified history-learning app built with Expo / React Native.

## Stack

- Expo SDK 52 + React Native 0.76
- React Navigation (native-stack + bottom-tabs)
- expo-linear-gradient, react-native-svg for illustrations
- expo-google-fonts (Cinzel, Cormorant Garamond, Lora)
- expo-haptics for answer feedback

## Run

```
cd history-duolingo
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android, `w` for web, or scan the QR code with the Expo Go app.

## Features

- **Map-style lesson path** — stylized ancient-world map backdrop with lesson nodes (completed, active, locked)
- **Real history content** — 5-question lessons across The First Civilizations, Greece & the Polis, The Rise of Rome
- **Quiz engine** — multiple choice + true/false with scaffolded feedback, hearts, progress, XP, and a completion screen
- **Unit progression** — ring progress, streak tracking, daily quests, full timeline view
- **Mascot** — Athena's owl as your history guide
- **Typography** — Cinzel (classical) display, Lora body, Cormorant Garamond italic accents

## Structure

```
App.js                — nav + font loading
src/
  theme.js            — colors, fonts, radii
  data/curriculum.js  — units, lessons, questions, user state, timeline
  components/
    MapBackdrop.js    — SVG ancient-world map
    Owl.js            — mascot
    LessonIcon.js     — amphora, helmet, laurel, dragon, sword icons
    ProgressRing.js
    Stats.js          — flame, gem, heart pills
  screens/
    HomeScreen.js
    LessonScreen.js
    LearnScreen.js
    QuestsScreen.js
    TimelineScreen.js
    ProfileScreen.js
```
