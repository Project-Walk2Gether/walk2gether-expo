# Walk2Gether Mobile App

Walk2Gether is a mobile application that helps people organize walks with friends or their local community.

## Project Overview

This repository contains the Expo/React Native mobile application for Walk2Gether. The app is built with TypeScript and uses Firebase for backend services.

## Tech Stack

- **Framework**: [Expo](https://expo.dev/) (v53) with [React Native](https://reactnative.dev/) (v0.79)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing
- **UI Library**: [Tamagui](https://tamagui.dev/) for cross-platform UI components
- **State Management**: React Context API with custom hooks
- **Backend**: Firebase (Authentication, Firestore, Storage, Functions, Analytics, Crashlytics)
- **Form Handling**: Formik with Yup validation
- **Maps & Location**: Expo Location, React Native Maps, Google Places Autocomplete
- **Testing**: Maestro for end-to-end testing

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS: Xcode (for iOS development)
- Android: Android Studio (for Android development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env` if available)
4. Start the development server:
   ```bash
   npm start
   ```

### Running on Devices

- **iOS**: `npm run ios`
- **Android**: `npm run android`

## Project Structure

- `/app`: Main application code using Expo Router file-based navigation
  - `/(app)`: Authenticated app screens
    - `/(tabs)`: Main tab navigation (Walks, Friends, Profile)
    - `/(modals)`: Modal screens
  - `/auth`: Authentication screens
- `/components`: Reusable UI components
- `/context`: React Context providers
- `/hooks`: Custom React hooks
- `/utils`: Utility functions
- `/services`: Service layer for API interactions
- `/styles`: Global styles and theme configuration
- `/assets`: Static assets like images and fonts

## Key Features

- User authentication with phone number verification
- Create and join walks with friends or community
- Location sharing and mapping
- Walk scheduling and management
- Friend connections
- Real-time updates using Firebase
- Different walk types including meetups with topics

## Development Guidelines

- Use Tamagui styles instead of StyleSheet
- Extract new components from screens or large components
- Use TypeScript interfaces named `Props` for component props
- Prefer one component per file with pattern: `components/MyComponent/index.ts`
- Use custom hooks `useQuery` and `useDoc` from `utils/firestore.ts` for Firebase queries

## Testing

The project uses Maestro for end-to-end testing:

```bash
npm run test:e2e:ios
```

A test API is available in the Firebase Functions project for testing utilities.

## Building for Production

- iOS: `npm run build:ios:production`
- Android: `npm run build:android:production`
- Publish updates: `npm run publish:production`

## Related Projects

- [walk2gether-functions](https://github.com/Project-Walk2Gether/walk2gether-functions): Firebase Functions backend
- [walk2gether-shared](https://github.com/Project-Walk2Gether/walk2gether-shared): Shared types and schemas
- [walk2gether-admin](https://github.com/Project-Walk2Gether/walk2gether-admin): Admin dashboard
- [walk2gether-website](https://github.com/Project-Walk2Gether/walk2gether-website): Marketing website
