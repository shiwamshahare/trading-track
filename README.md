# 📈 Trading Track

> **A 100% offline-first, private trading journal designed for disciplined financial market traders.**

[![Expo SDK 58](https://img.shields.io/badge/Expo-SDK_58-black.svg?style=flat&logo=expo)](https://expo.dev)
[![React Native 0.84](https://img.shields.io/badge/React_Native-0.84-blue.svg?style=flat&logo=react)](https://reactnative.dev)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict_Mode-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Offline First](https://img.shields.io/badge/Storage-100%25_On--Device-10B981.svg?style=flat)](#zero-knowledge-privacy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Overview

**Trading Track** is a mobile application built with **React Native** and **Expo SDK 58** that enables stock, options, futures, forex, and crypto traders to track daily P&L, maintain trade consistency, and analyze monthly and annual performance metrics with absolute privacy.

All data is stored directly on your physical device using `@react-native-async-storage/async-storage`. There are **no cloud databases**, **no external APIs**, and **no user accounts required**. Your financial trade history never leaves your device.

---

## 🚀 Key Features

* **🛡️ Biometric Security & App Lock**:
  * Enforces Face ID, Touch ID, Fingerprint, or a 4-digit numeric in-app PIN on cold start and background resume.
  * Native tactile keypad modal for setting and updating in-app security credentials.

* **📅 Interactive Daily Breakdown Calendar**:
  * Real-time monthly view with day-of-week alignment and weekend distinction.
  * Pure Emerald Green (`#10B981`) for profit days and Crimson Red (`#EF4444`) for loss days.
  * Dynamic loss formatting standard (`-₹K`) and dedicated indicator for the current trading day.

* **📊 12-Month Performance Heatmap**:
  * Overview of all 12 calendar months with quarterly aggregators (Q1–Q4).
  * Best month badges, annual win-rate calculations, and green month consistency streaks.
  * 44×44px tactile switchers with high-visibility typography for swift archive navigation.

* **💾 Data Vault & Automation**:
  * Scheduled **2:00 AM local time daily auto-backup** that preserves your journal snapshot automatically.
  * Instant JSON backup export and import with multi-device migration support.
  * Event-driven storage subscriptions for instant UI updates on data changes.

* **✨ Over-The-Air (OTA) Updates**:
  * Powered by EAS Update (`expo-updates`) to receive instant bug fixes and features over Wi-Fi/cellular without reinstalling the binary.

* **💱 Global Currency Support**:
  * Instant one-tap currency switching across `₹ INR`, `$ USD`, `€ EUR`, and `£ GBP`.

---

## 🛠️ Tech Stack

* **Framework**: [Expo SDK 58](https://expo.dev) (React Native 0.84, React 19)
* **Language**: TypeScript (Strict Mode)
* **Storage**: `@react-native-async-storage/async-storage`
* **Security & Auth**: `expo-local-authentication`
* **Over-The-Air Updates**: `expo-updates` / EAS Update
* **Typography**: Google Fonts Poppins (`@expo-google-fonts/poppins`)
* **Icons**: `lucide-react-native`
* **Haptics**: `expo-haptics`
* **File Sharing**: `expo-sharing` & `expo-file-system`

---

## 📱 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or later)
* [Expo Go](https://expo.dev/go) on your physical Android or iOS device, or a configured Android/iOS simulator.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shiwamshahare/trading-track.git
   cd trading-track
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start
   ```

4. **Run on Android / iOS development builds**:
   ```bash
   # Android
   npx expo run:android

   # iOS
   npx expo run:ios
   ```

---

## 📦 Building with EAS

To generate standalone APKs or iOS builds using EAS Build:

```bash
# Preview build (Standalone Installable Android APK)
npx eas-cli@latest build --profile preview --platform android

# Production App Bundle
npx eas-cli@latest build --profile production --platform android
```

To publish an over-the-air update:

```bash
npx eas-cli@latest update --branch preview --message "Bug fixes and improvements"
```

---

## 🔒 Zero-Knowledge Privacy

Trading Track adheres to a strict offline-first architectural model:
* **No Telemetry**: No third-party tracking scripts, Firebase analytics, or telemetry SDKs.
* **Local Persistence**: All trading entries, notes, and preferences reside solely on the device filesystem.
* **Full Ownership**: You can export, backup, or wipe your entire journal at any time with a single tap in Settings.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
