# Streaks - Habit Tracker App

## Overview

Streaks is a local-first, minimalist habit tracker mobile application built with React Native and Expo. The app focuses on user honesty and accountability through a unique "streak" mechanic that tracks daily habit completion. It operates entirely offline with no backend authentication, storing all data locally on the device using AsyncStorage.

The core concept revolves around visual habit tracking using a color-coded calendar system where users can mark days as completed (green), failed (red), or exempt (orange). The app implements a distinctive "24-hour rule" for exemptions, requiring users to plan breaks at least 24 hours in advance to maintain streak integrity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React Native with Expo SDK 54+ using TypeScript with strict mode enabled.

**Navigation Pattern**: Custom stack navigation implementing a "List-to-Hero" pattern:
- Dashboard (list view) showing all habits with mini 7-day history previews
- Infinite Grid (detail view) with full calendar history, swipeable between habits
- Day Detail modal for notes and exemption management

**State Management**: React Context API (`HabitsContext`) for global habit and settings state, avoiding external state libraries for simplicity.

**Component Architecture**:
- Functional components with React hooks
- Centralized theme provider via `useTheme` hook
- Domain logic isolated in custom hooks (`useStreakEngine`)
- Repository pattern for storage operations (UI never calls storage directly)

**Animation**: React Native Reanimated for performant animations and gesture handling.

**Haptic Feedback**: Expo Haptics for tactile feedback on interactions.

### Data Storage Solution

**Technology**: AsyncStorage for JSON-serialized local persistence.

**Data Model**:
- `Habit`: Contains id, name, createdAt, activeDays (array of DayOfWeek 0-6), entries record (date → DayEntry), and optional notifications settings
- `DayEntry`: Contains date, state (success/failure/exemption/blank), and optional notes
- `DayOfWeek`: Enum 0-6 representing Sunday through Saturday
- `UserSettings`: Contains displayName, avatarIndex, and hapticsEnabled

**Day Scheduling**: Users can specify which days a habit applies to:
- Every day (default), Weekdays only, Weekends only, or Custom selection
- Inactive days are grayed out in the calendar and cannot be tapped or long-pressed
- Streak calculations skip inactive days entirely

**Storage Service**: Repository pattern implementation in `StorageService.ts` that handles all CRUD operations for habits and settings.

### Domain Logic - The Streak Engine

Located in `useStreakEngine.ts`, this hook implements the core business logic:

**Day State Cycle** (past/present days):
1. Tap 1: Blank → Success (green checkmark)
2. Tap 2: Success → Failure (red X)
3. Tap 3: Failure → Blank (cleared)

**Streak Calculation Rules**:
- Failure ("X") resets current streak to 0
- Exemption ("!") acts as a bridge - doesn't increment but prevents reset
- Blank days don't reset total streak but current streak only counts consecutive successes

**24-Hour Exemption Rule**: Exemptions can only be set for dates more than 24 hours in the future, enforcing planned breaks rather than retroactive excuses.

### Design System

**Color Palette**:
- Primary: `#007AFF` (iOS Blue)
- Success: `#00FF41` (Webwork Green)
- Failure: `#FF3B30` (iOS destructive red)
- Exemption: `#FF9500` (iOS warning orange)

**Spacing**: 8pt grid system defined in `constants/theme.ts`.

**Typography**: SF Pro Rounded (or system default rounded font).

## External Dependencies

### Core Framework
- **Expo SDK 54+**: Managed workflow for React Native development
- **React Native 0.81.5**: Mobile framework
- **React 19.1.0**: UI library

### Navigation
- **@react-navigation/native-stack**: Native stack navigation
- **@react-navigation/native**: Navigation container

### Data & Storage
- **@react-native-async-storage/async-storage**: Local data persistence
- **@tanstack/react-query**: Data fetching utilities (available but app is local-first)

### UI & Animation
- **react-native-reanimated**: High-performance animations
- **react-native-gesture-handler**: Touch gesture handling
- **expo-haptics**: Tactile feedback
- **expo-blur**: Blur effects
- **@expo/vector-icons**: Icon library (Feather icons)

### Utilities
- **zod**: Schema validation
- **drizzle-orm/drizzle-zod**: ORM utilities (for type definitions, not active database)

### Server (Minimal)
- **Express**: Basic server for web build serving (not used for app data)
- **PostgreSQL/pg**: Database driver available but not actively used (local-first architecture)

**Note**: While Drizzle and PostgreSQL dependencies exist in the project, the application follows a local-first architecture where all user data is stored on-device via AsyncStorage. The server components are primarily for serving the web build, not for data persistence.