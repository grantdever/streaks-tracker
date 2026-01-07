# Streaks — Design Guidelines

## Architecture Decisions

### Authentication
**No Auth Required**
- This is a local-first, single-user utility app with data stored entirely on-device
- Include a **Settings/Profile screen** with:
  - User-customizable avatar (generate 3-5 minimalist avatar presets matching the app aesthetic)
  - Display name field
  - App preferences: notification settings, theme toggle (if applicable)

### Navigation Architecture
**List-to-Hero Pattern** (Custom Stack Navigation)

**Root Screen: Dashboard (List View)**
- Purpose: Overview of all habits with quick status visibility
- Layout: Scrollable list of habit cards
- Each habit card displays:
  - Habit name (left-aligned)
  - "Mini-Chain": 7-day color-coded history preview (right-aligned)
  - Subtle tap feedback

**Detail Screen: Infinite Grid**
- Purpose: Full habit tracking interface with complete history
- Transition: Tap a habit card to open full-screen modal
- Layout: 
  - Large-box calendar grid, vertically scrollable
  - Swipe left/right to cycle between habits (sorted by streak length)
  - Swipe down to dismiss modal
- Header: Habit name + current streak count

**Day Detail View (Modal)**
- Triggered by: Long-press on any calendar cell
- Contains:
  - Date header
  - Notes text field
  - Exemption toggle (conditional visibility based on 24-hour rule)
  - Dismiss via overlay tap or close button

---

## Design System

### Color Palette
**Primary Colors:**
- Primary Blue: `#007AFF` (iOS system blue, for interactive elements)
- Success Green: `#00FF41` ("Webwork Green", for completed days)
- Failure Red: `#FF3B30` (iOS destructive red, for missed days)
- Exemption Orange: `#FF9500` (iOS warning orange, for planned exemptions)
- Neutral Gray: `#8E8E93` (for future/disabled days)

**Surface Colors:**
- Background: `#FFFFFF` (light mode) / `#000000` (dark mode)
- Card/Cell Background: Off-white `#F9F9F9` (light) / `#1C1C1E` (dark)
- Text Primary: `#000000` (light) / `#FFFFFF` (dark)
- Text Secondary: `#8E8E93`

### Typography
- Font Family: SF Pro Rounded (iOS system default rounded)
- Dashboard Habit Name: 18pt semibold
- Streak Count: 24pt bold
- Calendar Day Number: 16pt medium
- Notes/Body Text: 15pt regular

### Spacing & Layout
- Grid System: Strict 8pt spacing grid
- Card Padding: 16pt
- Mini-Chain Gaps: 4pt between day indicators
- Infinite Grid Cell Size: 60x60pt with 8pt gaps
- Screen Margins: 16pt horizontal

### Icons & Symbols
- Success (Checkmark): Use SF Symbols `checkmark` or Feather `check`
- Failure (X): Use SF Symbols `xmark` or Feather `x`
- Exemption (!): Use SF Symbols `exclamationmark` or Feather `alert-circle`
- No custom emoji usage

---

## Screen Specifications

### Dashboard (List View)
- **Header**: Default navigation header
  - Title: "Streaks"
  - Right button: Settings icon
  - Transparent background
- **Layout**:
  - Root view: Scrollable list (FlatList/ScrollView)
  - Top inset: `headerHeight + 24pt`
  - Bottom inset: `insets.bottom + 24pt`
  - No tab bar
- **Components**:
  - Habit cards with rounded corners (12pt radius)
  - Subtle shadow on cards: `shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 2`
  - Floating "+" button (bottom-right, 16pt from edges):
    - Circular, 56x56pt
    - Primary blue background
    - Drop shadow: `shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2`

### Infinite Grid (Full-Screen Modal)
- **Header**: Custom header
  - Habit name (center)
  - Current streak count (subtitle, gray)
  - Close button (top-left)
  - Non-transparent background with subtle border-bottom
- **Layout**:
  - Root view: Vertically scrollable grid
  - Horizontally swipeable between habits
  - Top inset: `headerHeight + 16pt`
  - Bottom inset: `insets.bottom + 16pt`
- **Components**:
  - Calendar cells: 60x60pt rounded squares (8pt radius)
  - Cell states (visual hierarchy):
    - **Default/Future**: Gray background, no icon
    - **Success**: Webwork green background, white checkmark
    - **Failure**: Red background, white X
    - **Exemption**: Orange background, white !
    - **Blank/Unchecked**: Off-white background, light gray border
  - Press feedback: Scale animation (0.95) + haptic

### Day Detail View (Modal)
- **Layout**: Bottom sheet modal (slides up from bottom)
- **Components**:
  - Date header (16pt semibold)
  - Notes field: Multiline text input, 120pt min-height
  - Exemption toggle with label
  - Conditional message for 24-hour rule violations (red text, 13pt)
- **Insets**: Standard modal padding (16pt all sides)

### Settings Screen
- **Header**: Default navigation header with back button
- **Layout**: Scrollable form
- **Components**:
  - Avatar picker (horizontal scroll of preset options)
  - Display name text field
  - Notification settings section
  - About/App version footer

---

## Interaction Design

### Haptic Feedback
- **Light Impact**: Standard taps (cycle through Success → Failure → Clear)
- **Heavy/Success**: Locking in an exemption (valid 24+ hour future date)
- **Error/Warning**: Attempting invalid exemption

### Gesture Patterns
- **Tap (Calendar Cell)**: Cycle day state (Success → Failure → Clear)
- **Long-Press (Calendar Cell)**: Open Day Detail modal
- **Swipe Down (Infinite Grid)**: Dismiss modal
- **Swipe Left/Right (Infinite Grid)**: Navigate between habits
- **Pull-to-Refresh (Dashboard)**: Refresh/recalculate streaks (subtle animation)

### Animations
- Modal transitions: Spring animation (iOS native feel)
- Cell state changes: 200ms ease
- Button press: Scale 0.95 with 100ms duration
- Streak count update: Number count-up animation (500ms)

---

## Visual States

### Calendar Cell State Matrix
| State | Background | Icon | Border | Use Case |
|-------|-----------|------|--------|----------|
| Future | `#8E8E93` (20% opacity) | None | None | Dates beyond today |
| Unchecked | Off-white | None | 1pt light gray | Available to track |
| Success | `#00FF41` | White ✓ | None | Completed |
| Failure | `#FF3B30` | White ✗ | None | Missed |
| Exemption | `#FF9500` | White ! | None | Planned skip |

### Accessibility Requirements
- All interactive elements minimum 44x44pt touch target
- Color-blind safe: Icons reinforce color states (never color alone)
- VoiceOver labels for all calendar cells with date and state
- Dynamic Type support for all text elements
- Haptics can be disabled in Settings

---

## Assets to Generate
1. **Avatar Presets** (3-5 minimalist options):
   - Geometric shapes in brand colors
   - Abstract patterns
   - Clean, modern aesthetic matching minimalism
2. **App Icon**:
   - Minimalist design featuring a "streak flame" or checkmark
   - Primary blue with Webwork green accent
3. **Empty State Illustrations** (optional):
   - Dashboard empty state: "Start your first habit"
   - Simple line art or text-only