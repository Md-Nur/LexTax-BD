### **Short Description (Max 80 characters)**
Comprehensive legal reference for Bangladesh Income Tax, VAT, and Customs laws.

---

### **Long Description (Max 4000 characters)**
LexTax BD is the most comprehensive and user-friendly legal reference application designed specifically for navigating the complexities of Bangladesh’s tax landscape. Whether you are a tax professional, a business owner, or a concerned citizen, LexTax BD puts the entire library of Bangladesh Income Tax, VAT, and Customs regulations right in your pocket.

Our mission is to democratize access to legal information, ensuring that understanding tax law in Bangladesh no longer requires expensive consultations. With an intuitive interface, multi-language support (English and Bengali), and regular updates, LexTax BD is your essential companion for legal compliance and research.

**Key Features:**

*   **Complete Legal Database:** Gain instant access to the full text of the Income Tax Act, Value Added Tax (VAT) and Supplementary Duty Act, and the Customs Act of Bangladesh.
*   **Up-to-Date Amendments:** Stay ahead of the curve with regular updates reflecting the latest government gazettes, statutory regulatory orders (SROs), and amendments.
*   **Powerful Search Engine:** Quickly find specific sections, rules, or keywords across our entire database with our high-speed, intelligent search feature.
*   **Bookmarks & Organization:** Save important sections and documents for quick reference later. Organize your legal research with ease.
*   **Dual Language Support:** Seamlessly switch between English and Bengali to view laws in the language you are most comfortable with.
*   **Modern User Experience:** Enjoy a premium design with both Light and Dark mode options, optimized for readability during long research sessions.
*   **Print and Share:** Easily print documents or share specific sections with colleagues and clients directly from the app.

**Why LexTax BD?**

In a rapidly changing regulatory environment, having accurate information is crucial. LexTax BD removes the barrier of heavy law books and complex websites, providing a streamlined, digital-first approach to legal reference. Our content is curated and updated regularly to ensure you are always looking at the most current version of the law.

**Who is this for?**

*   **Tax Practitioners & Accountants:** Enhance your research efficiency and verify sections on the go.
*   **Business Owners & Entrepreneurs:** Understand your tax obligations and stay compliant with ease.
*   **Law Students & Educators:** A portable, searchable library for academic research and study.
*   **Individual Taxpayers:** Empower yourself with direct access to the laws that affect your finances.

**Disclaimer:**
LexTax BD provides legal documents for informational purposes only. The content within this app does not constitute legal or professional advice. While we strive for accuracy, users should always consult with a qualified legal professional or refer to the official government gazette for specific legal matters.

---
**What's New in Version 1.0.0 (Build 3):**
*   **Search & Filters**: Added comprehensive search and filter functionality for legal documents in the admin panel.
*   **Theme Support**: Fully integrated dynamic styling for seamless Light and Dark mode transitions.
*   **Stability**: Resolved critical startup crashes and "keeps stopping" errors on Android.
*   **UI Polish**: Fixed duplicate loading indicators and optimized animations.
*   **Tech Stack**: Migrated to Expo public environment variables and updated target SDK to 35.
*   **Initial Core**: Access to Income Tax, VAT, and Customs databases.

Download LexTax BD today and simplify your professional life with the best tax law reference tool in Bangladesh!

---

## 🛠 Technical Overview

This mobile application is built using a modern, performant cross-platform stack:

*   **Framework:** [React Native](https://reactnative.dev/) powered by [Expo](https://expo.dev/) (SDK 52)
*   **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
*   **Backend & Database:** [Supabase](https://supabase.com/) for authentication, database, and storage
*   **State Management:** [TanStack React Query](https://tanstack.com/query/latest) for efficient data fetching and caching
*   **UI & Icons:** Custom React Native components with Lucide React Native icons and Reanimated for smooth transitions
*   **Types:** Fully strongly-typed with TypeScript

### 🚀 Getting Started Locally

1. **Clone the repository and install dependencies:**
   We recommend using `bun` or `npm`:
   ```bash
   bun install
   # or
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

3. **Start the Development Server:**
   ```bash
   npx expo start
   ```
   Press `i` to open in an iOS Simulator, `a` to open in an Android Emulator, or scan the QR code with the Expo Go app on your physical device.

### 📦 Building for Production

To build a standalone Android application (`.aab` or `.apk`) or an iOS app (`.ipa`), this project is configured for **EAS Build**.

Please refer to the detailed [Build Instructions (`build_instructions.md`)](./build_instructions.md) for step-by-step guidance on how to generate the release binaries locally or through Expo Application Services.