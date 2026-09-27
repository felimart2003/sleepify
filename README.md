# Sleepify

A private sleep journal for web, iOS, and Android. Track when you go to bed, restart the sleep clock when you are still awake, and review your weekly rhythm.

**[Live demo](https://felimart2003.github.io/sleepify/)** · [Source](https://github.com/felimart2003/sleepify)

## Try it

Choose **Explore a sample week** to see charts and seven fictional nights immediately. Sample data is temporary and never replaces your own history. Choose **Tonight → Begin sleep → Wake up** to record a real session. The history list retains older nights while summary statistics use the last seven days.

## Features

- One-tap bedtime and wake logging, with confirmation before discarding a night.
- Explicit awake intervals and sleep/time-in-bed breakdowns.
- Weekly duration chart, averages, and complete session history.
- Local persistence with schema validation, ordered saves, visible failures, and retry.
- Dark responsive interface, bundled fonts, keyboard-accessible controls.
- No accounts, analytics, API keys, backend, or subscriptions.

## Local setup

Requires Node.js 22 and npm.

```sh
npm ci
npm run web
```

For native development use `npm start`, `npm run android`, or `npm run ios` with an Expo SDK 57-compatible environment. iOS native builds require macOS. Native builds were not exercised in this web deployment.

```sh
npm run typecheck
npm test
npm run build
```

The web export is in `dist/`. `app.json` sets `experiments.baseUrl` to `/sleepify` for GitHub Pages. When hosting at a domain root, remove that setting and rebuild. To preview the Pages export locally, serve `dist` mounted at `/sleepify/`.

## Architecture

Expo SDK 57, React Native 0.86, React 19, TypeScript, AsyncStorage, Expo LinearGradient, and Inter.

- `App.tsx`: session actions, persistence status, sample mode, navigation.
- `components/`: tonight state, confirmation sheet, history, chart, night details.
- `lib/storage.ts` / `validation.ts`: ordered writes and runtime data validation.
- `lib/stats.ts`: pure duration and date calculations.
- `lib/demo.ts`: clearly identified sample sessions.
- `test/run.cjs`: regression checks for calculations and malformed stored data.

## Deployment and privacy

GitHub Actions checks types, runs tests, exports the web app, and deploys to **GitHub Pages** on each push to `master`. This static hosting path is free for this public repository. No environment variables are needed.

Data belongs to the current browser/device; clearing browser data removes it. There is no cloud sync or automatic sleep sensing. Durations are estimates based on button presses. Corrupt or inaccessible saved data is not silently overwritten: the app displays an error and asks you to reload.

