Install the package: $ARGUMENTS

Follow these steps exactly:

## 1. Parse the package name

Extract the package name from the arguments above. If no package name is provided, ask the user what package they want to install and stop.

## 2. Check if the package is safe to install

This environment uses Expo's OTA (Over-The-Air) updates. Packages with native code (iOS/Android) can only be installed if they are **already compiled into the host app binary**. Pure JavaScript packages are always safe.

### Pre-installed native packages (safe to install)

These packages have native code but are already compiled into the host app. You can safely `bun add` them — Metro will resolve the JS source without requiring a native rebuild.

**Expo modules:**
expo, expo-apple-authentication, expo-application, expo-asset, expo-audio, expo-auth-session, expo-av, expo-background-fetch, expo-background-task, expo-battery, expo-blur, expo-brightness, expo-calendar, expo-camera, expo-cellular, expo-checkbox, expo-clipboard, expo-constants, expo-contacts, expo-crypto, expo-device, expo-document-picker, expo-file-system, expo-font, expo-gl, expo-haptics, expo-image, expo-image-manipulator, expo-image-picker, expo-intent-launcher, expo-keep-awake, expo-linear-gradient, expo-linking, expo-live-photo, expo-local-authentication, expo-localization, expo-location, expo-mail-composer, expo-maps, expo-media-library, expo-navigation-bar, expo-network, expo-notifications, expo-print, expo-screen-capture, expo-screen-orientation, expo-secure-store, expo-sensors, expo-sharing, expo-sms, expo-speech, expo-splash-screen, expo-sqlite, expo-status-bar, expo-store-review, expo-symbols, expo-system-ui, expo-task-manager, expo-tracking-transparency, expo-video, expo-video-thumbnails, expo-web-browser

**React Native community & third-party native packages:**
react-native-gesture-handler, react-native-get-random-values, react-native-maps, react-native-pager-view, react-native-reanimated, react-native-safe-area-context, react-native-screens, react-native-svg, react-native-view-shot, react-native-webview, react-native-worklets, lottie-react-native, @shopify/flash-list, @shopify/react-native-skia, @react-native-async-storage/async-storage, @react-native-community/datetimepicker, @react-native-community/netinfo, @react-native-community/slider, @react-native-masked-view/masked-view, @react-native-picker/picker, @react-native-segmented-control/segmented-control, @expo/vector-icons, nativewind, tailwindcss, tailwindcss-animate

### Decision rules

1. **On the allowlist above** → Safe. Proceed to install.
2. **Pure JS package** (no native modules — e.g. lodash, axios, date-fns, zod, @tanstack/react-query, class-variance-authority, clsx, tailwind-merge, zustand, jotai, etc.) → Safe. Proceed to install.
3. **Has native code AND not on the allowlist** → **REFUSE**. Tell the user: "This package contains native code that is not pre-compiled in the host app. Installing it would require a full native rebuild, which is not supported in this environment. Consider using a JS-only alternative."

If you are unsure whether a package has native code, err on the side of caution and refuse, explaining your uncertainty.

## 3. Install the package

Run:
```
bun add $ARGUMENTS
```

If the install fails, report the error to the user and stop.

## 4. Restart Metro

After a successful install, restart the Metro bundler so it picks up the new dependency:

Call the `mcp__cli-tools__restart_metro` tool.

## 5. Verify

Read the Metro log file (`.expo-air-metro.log` in the project root) to check for errors after the restart. If there are errors related to the newly installed package, report them to the user.

If everything looks good, confirm the package was installed successfully.
