# Habit Tracker 📅🔥

A modern **Habit Tracker mobile app** built with **React Native (Expo)** and **Appwrite** that helps users build and maintain positive habits through streak tracking and progress insights.

The app allows users to create habits, track daily progress, view streak statistics, and stay consistent with their goals.

---

## 🚀 Features

- 🔐 **User Authentication**
  - Secure signup and login using Appwrite Auth

- 📝 **Create Habits**
  - Add habits with title, description, and frequency

- ✅ **Habit Completion**
  - Mark habits as completed with swipe gestures

- 🗑 **Delete Habits**
  - Swipe to remove habits easily

- 🔥 **Streak Tracking**
  - Automatic calculation of:
    - Current streak
    - Best streak
    - Total completions

- 🏆 **Leaderboard**
  - View top streaks across your habits

- ⚡ **Realtime Updates**
  - Appwrite realtime subscriptions keep UI instantly synced

- 📱 **Modern UI**
  - Built with React Native Paper and smooth gesture interactions

---

## 📱 Download APK

You can download and install the latest APK here:

➡️ **[Download APK](https://expo.dev/accounts/abhi912001/projects/habit-tracker/builds/8f65aefc-9b7c-4310-917c-971631701b6a)**

> Enable **Install from unknown sources** on Android before installing.

---

## 🛠 Tech Stack

### Frontend

- React Native
- Expo
- Expo Router
- React Native Paper
- React Native Gesture Handler

### Backend

- Appwrite (Authentication, Database, Realtime)

### Build & Deployment

- Expo EAS Build
- Android APK / AAB

---

## 📊 Core Functionalities

- Habit creation and management
- Swipe gestures for quick actions
- Realtime database updates
- Habit streak analytics
- Leaderboard for best streaks
- Clean and responsive mobile UI

---

## ⚙️ Local Development

Clone the repository:

````bash
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker

Install dependencies:
npm install

Start the development server:
npx expo start

🔧 Environment Variables
Create a .env file and add the following variables:

EXPO_PUBLIC_APPWRITE_ENDPOINT=
EXPO_PUBLIC_APPWRITE_PROJECT_ID=
EXPO_PUBLIC_APPWRITE_PLATFORM=
EXPO_PUBLIC_DB_ID=
EXPO_PUBLIC_COLLECTION_ID=
EXPO_PUBLIC_COMPLETION_COLLECTION_ID=

📦 Build
Generate APK for testing:
eas build --platform android --profile preview

Generate AAB for Play Store:
eas build --platform android --profile production
