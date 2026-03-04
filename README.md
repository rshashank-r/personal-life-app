<p align="center">
  <h1 align="center">🧠 Personal Life App</h1>
  <p align="center">
    <strong>Your life, organized.</strong><br/>
    A premium, all-in-one personal life management mobile app built with React Native & Expo.
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Expo-SDK_52-000020?style=for-the-badge&logo=expo&logoColor=white" />
    <img src="https://img.shields.io/badge/React_Native-0.76-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
    <img src="https://img.shields.io/badge/Platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" />
    <img src="https://img.shields.io/badge/License-Private-red?style=for-the-badge" />
  </p>
</p>

---

## 📖 Overview

**Personal Life** is a beautifully crafted, dark-themed mobile application designed to help you take control of every aspect of your life — from daily tasks and habits to long-term goals, memories, and self-improvement. It combines a sleek, modern UI with powerful features like an AI companion, knowledge graph, focus timer, and smart scheduling — all running locally with offline-first SQLite storage.

---

## ✨ Key Features

### 📊 Dashboard
- Personalized greeting with your profile avatar
- At-a-glance daily progress across all life areas
- Quick-access cards to jump into any feature
- **Yearly Report** — a comprehensive annual summary of your productivity, mood, and habits

### ✅ Task Management
- Create, organize, and prioritize tasks (High / Medium / Low priority)
- **Smart Scheduler** — intelligently suggests optimal times for your tasks
- Task detail view with notes, due dates, and completion tracking
- Category and life-area tagging for holistic life organization

### ⏰ Reminders
- Set one-time or recurring reminders
- Push notifications powered by `expo-notifications`
- Detail view for editing reminder properties

### 📈 Habit & Tracker System
- Track any custom habit or metric over time
- **Habit Heatmap** — GitHub-style contribution heatmap visualization of your consistency
- **Screen Time Tracker** — monitor your device usage with `react-native-usage-stats-manager`
- Detailed tracker view with historical data

### 🎯 Goals
- Define short-term and long-term goals
- Track progress and milestones
- Organized by life areas for balanced life planning

### 📓 Journal
- Daily journaling with rich text entries
- Capture thoughts, reflections, and moods
- Searchable journal history

### 🧘 Focus Mode
- **Pomodoro Timer** — 25-minute focused work sessions with animated circular progress
- Session counter to track daily focus streaks
- Beautiful SVG-animated timer with play/pause/reset controls

### 🗂️ Memory Vault
- Store important memories, documents, and notes securely
- **Knowledge Graph** — visualize connections between your memories and ideas
- Detail view for each vault entry

### 🪣 Bucket List
- Curate your life goals and dream experiences
- Track completion status for each bucket list item
- Detailed view with notes and progress

### 🚫 Forget Rules
- Define things you want to intentionally let go of
- A unique mindfulness feature for mental decluttering

### 🤖 AI Companion
- Built-in AI assistant for personal insights and guidance
- Chat-style interface for interactive conversations

### 🔍 Universal Search
- Search across all features — tasks, reminders, journal entries, vault items, and more
- Instant, unified search results

### 📅 Timeline
- Chronological view of all your activities and milestones
- See your life events laid out on a visual timeline

### 🏠 Android Home Screen Widget
- Native Android widget showing today's progress at a glance
- Powered by `react-native-android-widget`
- Configurable widget with adaptive sizing

### 🔒 Privacy & Security
- **Biometric Authentication** via `expo-local-authentication`
- **Privacy Shield** — automatically hides content when the app goes to background
- Secure storage with `expo-secure-store`

### ⚙️ Settings
- Customize app behavior and preferences
- Profile management
- Theme and notification preferences

### 🚀 Onboarding
- Guided first-time setup experience
- Profile creation with personalized configuration

---

## 🏗️ Architecture

```
src/
├── core/                    # Core infrastructure
│   ├── database/            # SQLite database service (expo-sqlite)
│   ├── notifications/       # Push notification service
│   ├── services/            # Shared business logic
│   ├── store/               # Zustand global state (profile, etc.)
│   └── theme/               # Design system (colors, typography, spacing)
│
├── features/                # Feature modules (screen + service + store)
│   ├── ai/                  # AI Companion
│   ├── bucketList/          # Bucket List
│   ├── dashboard/           # Dashboard + Yearly Report + Widgets
│   ├── focus/               # Focus Mode (Pomodoro)
│   ├── forgetRules/         # Forget Rules
│   ├── goals/               # Goals
│   ├── journal/             # Journal
│   ├── memoryVault/         # Memory Vault + Knowledge Graph
│   ├── more/                # More menu hub
│   ├── onboarding/          # First-time onboarding
│   ├── reminders/           # Reminders
│   ├── search/              # Universal Search
│   ├── settings/            # App Settings
│   ├── tasks/               # Task Manager + Smart Scheduler
│   ├── timeline/            # Timeline view
│   └── trackers/            # Habits, Trackers & Screen Time
│
├── navigation/              # React Navigation setup (Tabs + Stacks)
└── shared/                  # Reusable components & constants
    ├── components/          # Header, Card, Button, PrivacyShield, etc.
    └── constants/           # Life areas, enums
```

### Design Principles
- **Feature-based architecture** — each feature is a self-contained module with its own screens, services, and stores
- **Offline-first** — all data stored locally using SQLite via `expo-sqlite`
- **Dark theme by default** — premium dark UI with cyan (`#06B6D4`) and violet (`#8B5CF6`) accents
- **State management** — lightweight global state with Zustand
- **Smooth animations** — powered by `react-native-reanimated` and SVG animations

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Expo SDK 52](https://expo.dev/) + [React Native 0.76](https://reactnative.dev/) |
| **Navigation** | React Navigation 7 (Bottom Tabs + Native Stack) |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Database** | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) |
| **Animations** | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) |
| **Icons** | [Lucide React Native](https://lucide.dev/) + Expo Vector Icons |
| **Notifications** | [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) |
| **Security** | expo-local-authentication, expo-secure-store |
| **Media** | expo-image-picker, expo-file-system |
| **Charts/SVG** | react-native-svg |
| **Widgets** | react-native-android-widget |
| **Gestures** | react-native-gesture-handler |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Android Studio](https://developer.android.com/studio) (for Android development)
- An Android device or emulator

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rshashank-r/personal-life-app.git
cd personal-life-app

# 2. Install dependencies
npm install

# 3. Start the Expo dev server
npx expo start

# 4. Run on Android
npx expo run:android
```

### Building APK (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo
eas login

# Build APK
eas build --platform android --profile preview
```

---

## 📱 Navigation Structure

The app uses a **bottom tab navigator** with 5 primary tabs, each containing its own stack navigator:

| Tab | Icon | Screens |
|---|---|---|
| **Dashboard** | 📊 | Dashboard Home → Timeline, Journal, Smart Scheduler |
| **Tasks** | ✅ | Task List → Task Detail |
| **Reminders** | 🔔 | Reminder List → Reminder Detail |
| **Trackers** | 📈 | Tracker List → Tracker Detail |
| **More** | ⋯ | Memory Vault, Bucket List, Goals, Focus Mode, AI Companion, Knowledge Graph, Yearly Report, Settings, and more |

---

## 🎨 Design System

The app features a carefully crafted dark-theme design system:

| Token | Value | Usage |
|---|---|---|
| `background` | `#0F172A` | Main app background |
| `surface` | `#1E293B` | Cards, bottom bar |
| `accent` | `#06B6D4` | Primary actions, highlights (Cyan) |
| `secondary` | `#8B5CF6` | Secondary accent (Violet) |
| `textPrimary` | `#F8FAFC` | Main text color |
| `success` | `#22C55E` | Positive states |
| `warning` | `#F59E0B` | Caution indicators |
| `error` | `#EF4444` | Destructive actions |

---

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome! Feel free to open an issue or reach out.

---

## 📄 License

This project is private and not licensed for redistribution.

---

<p align="center">
  Built with ❤️ using React Native & Expo
</p>
