# Building .aab File Locally

To build an Android App Bundle (.aab) locally for your LexTax-BD project, you have two main options. The first (EAS) is recommended for Expo projects, while the second (Manual) gives you more control over the native code.

## Option 1: Using EAS Build (Recommended)

This method uses the Expo Application Services CLI to run the build process on your own machine.

### 1. Install EAS CLI
If you haven't already, install the EAS CLI globally:
```bash
npm install -g eas-cli
```

### 2. Run the Local Build
Run the following command in your project root:
```bash
eas build --platform android --local --profile production
```
*Note: The `production` profile in your `eas.json` is already configured for `app-bundle` (AAB).*

### 3. Prerequisites
For this to work locally, you must have the following installed on your Mac:
- **JDK**: Expo 52 requires **JDK 17**. You currently have JDK 11.
  ```bash
  brew install openjdk@17
  # Then link it:
  sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
  # Add to your ~/.zshrc or ~/.bash_profile:
  export JAVA_HOME=$(/usr/libexec/java_home -v 17)
  ```
- **Android SDK**: Correctly configured with `ANDROID_HOME`.
  ```bash
  # Common path for Android Studio installs:
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/emulator
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```
- **Node.js**: Versions compatible with Expo 52 (v24 detected).

---

## Option 2: Manual Gradle Build

If you want to build using the standard Android build tools:

### 1. Generate Native Files
First, generate the `android` directory:
```bash
npx expo prebuild
```

### 2. Run Gradle Bundle Command
Navigate to the android folder and run the bundle command:
```bash
cd android
./gradlew bundleRelease
```

### 3. Locate the File
After the build completes, your `.aab` file will be located at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## Important Tips
- **Signing**: Ensure you have your `keystore` configured. EAS will ask to download it if it's already on the Expo servers.
- **Environment Variables**: If your app depends on `.env` files, make sure they are present during the build.
