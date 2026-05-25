# Project Summary: Water Leak Monitoring App

## 1. Project Overview
The **Water Leak Monitoring App** is a mobile application developed using **React Native** and **Expo**. It is designed to help users monitor water usage, detect leaks in real-time, and manage alerts and system controls (like valves).

## 2. Technology Stack
- **Framework:** [Expo](https://expo.dev/) (SDK 54)
- **Language:** TypeScript
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Icons:** [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native) & Expo Vector Icons
- **State Management:** React Context API (`AuthContext`, `WaterContext`)
- **Animation:** React Native Reanimated

## 3. Directory Structure
- `app/`: Contains the main screens and routing logic.
  - `(tabs)/`: Tab-based navigation (Dashboard, Alerts, Stats, Settings).
  - `login.tsx` & `register.tsx`: Authentication screens.
- `components/`: Reusable UI components.
- `context/`: State management for authentication and water monitoring logic.
- `assets/`: Images and fonts used in the app.
- `constants/`: Theme colors and configuration constants.

## 4. Key Features & Screens
- **Dashboard (Home):** Shows real-time water flow status, valve control (Open/Closed), and quick stats.
- **Alerts Screen:** Displays a history of detected leaks and system warnings with the ability to clear them.
- **Statistics Screen:** Visual representation of water consumption over time (Daily/Weekly/Monthly).
- **Settings Screen:** User profile management, notification settings, and system configuration.
- **Authentication:** Secure login and registration flow.

## 5. Implementation Details
- **Leak Detection:** Managed through `WaterContext.tsx`, which likely simulates or fetches data from water sensors.
- **Responsive Design:** Uses Tailwind CSS via NativeWind for a modern and consistent UI across devices.
- **Storage:** Uses `@react-native-async-storage/async-storage` for persisting user sessions and settings.

---
*This file was generated to provide an overview of the project structure and functionality.*
