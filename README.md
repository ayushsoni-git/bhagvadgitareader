# श्रीमद्भगवद्गीता • Bhagavad Gita Reader

A high-fidelity, premium, and fully open-source (FOSS) Android application designed for deep contemplation, reading, and reflections on the sacred verses of the **Bhagavad Gita**. 

Built with an elegant hybrid architecture (Kotlin + modern Web technologies), the app features immersive glassmorphism aesthetics, responsive Devanagari typography, robust multi-language translations, and offline-first performance.

---

## 🌟 Key Features

* **Pristine Multi-Language Support**: Read verses in their original Sanskrit Shlokas, Devanagari Hindi translations (optimized with Google's `'Mukta'` font), and clean English translations.
* **Ergonomic Reading Controls**: Customize your spiritual study with interactive font-size scaling and individual language toggle switches. A built-in validation mechanism ensures you always have at least one translation active.
* **Cohesive Premium Design System**: Experience an ultra-premium interface crafted with smooth gradients, glassmorphism card layouts, fluid custom scrollbars, and warm amber-saffron active indicators.
* **Spiritual Diary & Bookmarks**: Save your favorite verses and write down your personal reflections, modern applications, and daily spiritual contemplations.
* **Home Screen Wisdom Widget**: Display a beautiful, frosted-glass "Quote of the Day" directly on your Android home screen, complete with automatic daily updates.
* **Meditation & Quiet Hours**: Schedule offline daily alerts to prompt quiet contemplation times.
* **100% Private & Offline-First**: No trackers, no ads, and no internet required. Your bookmarks, settings, and diary entries reside entirely on your device.

---

## 🛠 Tech Stack

* **Frontend WebView core**: HTML5, Vanilla CSS3 (Custom Grid/Flex system, Backdrop blur filters, smooth transitions), Modern Javascript (ES6).
* **Native Android Wrapper**: Kotlin, Jetpack Compose, WebKit WebView, AppWidgets API, BroadcastReceiver, and AlarmManager.
* **Typography**: `'Mukta'` (Devanagari legibility-optimized) and standard spiritual titles.

---

## 🚀 Local Installation & Build Guide

### Prerequisites
* **JDK 17** or higher
* **Android SDK** (API Level 36 compile targets, backward compatible to API 24)

### Building the Project
1. **Clone the repository**:
   ```bash
   git clone https://github.com/ayushsoni/bhagvadgitareader.git
   cd bhagvadgitareader
   ```

2. **Sync the WebView Assets**:
   Web assets inside the root directory (`index.html`, `index.css`, `app.js`, `gita_data.js`) are located under the Android assets:
   `android-app/app/src/main/assets/`

3. **Build the Debug APK**:
   Navigate to the `android-app` folder and run the Gradle wrapper:
   ```bash
   cd android-app
   ./gradlew assembleDebug
   ```

4. **Install on an emulator or device**:
   ```bash
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

---

## 📄 License

This project is open-source and licensed under the **[GNU General Public License v3.0 (GPL v3)](LICENSE)**. Anyone who copies, uses, or modifies this code must also release their project under the same copyleft GPL license.

---

## 🤖 AI Disclosure & Pair Programming

This project was built, designed, and optimized in a collaborative pair-programming partnership between **Ayush Soni** and **Antigravity**, a powerful agentic AI coding assistant developed by the **Google DeepMind** team. 

From refactoring native Kotlin WebView bridges and widget update receivers to designing premium glassmorphic UI systems and implementing robust language constraints, this application stands as a beautiful showcase of human-AI software co-creation.


