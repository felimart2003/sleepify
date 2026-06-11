# Sleepify 🌙

A simple sleep tracker for Android and iOS, built with Expo (React Native).

## How it works

- **Going to sleep** — press the big moon button when you lie down.
- **Still can't sleep?** — if you've been lying awake (30 min, an hour, whatever), press this to restart your sleep time from now. The time you spent awake is logged as an "awake in bed" gap for that night.
- **I'm awake** — press when you wake up to complete the night.
- **History tab** — last-7-days bar chart (sleep vs. time awake in bed), weekly averages, and a night-by-night breakdown: when you got into bed, when you actually fell asleep, when you woke up, and every period you couldn't sleep.

All data is stored locally on the device (AsyncStorage) — no account, no server.

## Running it

```bash
npm install
npx expo start
```

Then scan the QR code with the **Expo Go** app ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)). The same codebase runs on both platforms.

### Building a standalone Android APK

```bash
npm install -g eas-cli
eas build --platform android --profile preview
```

(Requires a free Expo account. For iOS, `eas build --platform ios` — needs an Apple Developer account.)

## Project structure

- `App.tsx` — root: state, persistence wiring, tab bar
- `components/TonightScreen.tsx` — sleep / still-awake / wake buttons
- `components/HistoryScreen.tsx` — weekly summary + night list
- `components/WeeklyChart.tsx` — dependency-free bar chart
- `components/NightCard.tsx` — per-night breakdown
- `lib/types.ts` — `SleepSession` / `AwakeGap` data model
- `lib/storage.ts` — AsyncStorage load/save
- `lib/stats.ts` — durations, averages, formatting
