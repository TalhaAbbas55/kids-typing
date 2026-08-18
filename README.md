# Bubble Typing Game 🎈

A fun, browser-based typing practice game built with React. Colorful bubbles float up the screen, each labeled with a letter or number, and you pop them by pressing the matching key before they reach the top. It's a lightweight way to build typing speed and keyboard accuracy while having a bit of fun.

🔗 **Live URL:** [https://kids-typing-omega.vercel.app/]

## How It Works

- Bubbles spawn from the bottom of the screen and float upward, each showing a key you need to press.
- Press the matching key on your keyboard to pop the bubble and earn a point.
- Pressing the wrong key costs you half a life and triggers a screen shake.
- Letting a bubble reach the top of the screen costs you a full life.
- You start with 3 lives. The game ends when you run out.
- Your best score is tracked for the session as a high score.

## Features

- 🎯 **Customizable key sets** — practice the top row (QWERTY), middle row (ASDFG), bottom row (ZXCV), and/or numbers, individually or combined.
- 🔠 **Uppercase mode** — toggle uppercase letters for extra practice.
- ⚡ **Adjustable speed** — a 14-step slider from ultra slow to super fast bubble speed.
- 🎨 **Animated visuals** — smooth bubble animations, pop effects, celebration emojis, and shifting background gradients powered by Framer Motion.
- 🔊 **Sound feedback** — pleasant tones for correct key presses and distinct error tones for mistakes, generated with the Web Audio API.
- ❤️ **Lives and scoring** — a heart-based life system with partial losses for wrong keys.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- npm (comes bundled with Node.js)

### Installation

```bash
npm install
```

### Running the App

```bash
npm start
```

This runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) in your browser to play.

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

This bundles the app for production into the `build` folder, optimized and ready to deploy.

## Tech Stack

- [React](https://react.dev/) 19
- [Framer Motion](https://www.framer.com/motion/) for animations
- Create React App (`react-scripts`) for tooling and build configuration
- Web Audio API for sound effects

## Project Structure

```
src/
├── TypingGame.js     # Core game logic and UI
├── TypingGame.css     # Game styling
├── App.js             # App entry component
└── index.js           # React DOM entry point
```
