# Water Leak Guardian 💧🛡️

Water Leak Guardian is a complete IoT-based water monitoring and leak detection system. It seamlessly integrates hardware (ESP32 WROOM 32), a robust backend (Laravel 11), and a modern cross-platform frontend app (Expo / React Native) to provide real-time water telemetry, leak alerts, and remote valve control.

## 🚀 System Architecture

1. **Hardware (ESP32)**: Collects data from flow sensors, detects leaks, and controls the main water supply valve. It sends data to the backend via Wi-Fi.
2. **Backend (Laravel 11 + MySQL)**: Exposes secure REST APIs to receive telemetry from the ESP32 and serve data to the mobile app.
3. **Frontend (Expo React Native)**: An operator dashboard allowing users to monitor live flow rates, view daily consumption, acknowledge critical alerts, and manually toggle the water valve.

---

## 🛠️ Tech Stack

- **Backend**: Laravel 11, PHP 8+, MySQL (Sanctum for Auth)
- **Frontend**: React Native, Expo Router, NativeWind (TailwindCSS), Lucide Icons
- **Hardware Component**: ESP32 WROOM 32 (C++, HTTPClient)

---

## 📂 Project Structure

```
water-leak-monitoring-app/
├── backend/                  # Laravel API
│   ├── app/Models/           # WaterData, User models
│   ├── app/Http/Controllers/ # WaterDataController, AuthController
│   ├── routes/api.php        # API Endpoints
│   └── database/migrations/  # Database schemas
├── app/                      # Expo Router Frontend Pages
│   ├── (tabs)/               # Main App Dashboard (Live Stats, Alerts)
│   ├── login.tsx             # Auth
│   └── register.tsx          # Auth
├── context/                  # React Contexts (AuthContext, WaterContext)
└── constants/                # Configuration (API_URL)
```

---

## 🔧 Installation & Setup

### 1. Backend Setup (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```
**Configure your `.env` Database connection:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=water
DB_USERNAME=root
DB_PASSWORD=your_password
```
**Run Migrations & Start Server:**
```bash
php artisan migrate
php artisan serve --host=0.0.0.0
```
*(Note: `--host=0.0.0.0` allows the ESP32 and mobile emulators to access the API locally).*

### 2. Frontend Setup (React Native / Expo)
```bash
# Return to the root folder
npm install
npm start
```
- Open `constants/Config.ts` and ensure the `API_URL` points to your backend IP address (e.g., `127.0.0.1:8000` for web, or `10.0.2.2:8000` for Android emulator).

---

## 📡 API Endpoints (ESP32)

The ESP32 communicates with the system via the following endpoint:

**Endpoint**: `POST /api/water-data`

**JSON Payload Example**:
```json
{
  "flow_rate": 15.5,
  "total_liters": 120.3,
  "leak_detected": 0,
  "valve_status": "open"
}
```

**C++ ESP32 Snippet**:
```cpp
HTTPClient http;
http.begin("http://<YOUR_LARAVEL_IP>:8000/api/water-data");
http.addHeader("Content-Type", "application/json");
http.addHeader("Accept", "application/json");

String jsonPayload = "{\"flow_rate\":15.5,\"total_liters\":120.3,\"leak_detected\":0,\"valve_status\":\"open\"}";
int httpResponseCode = http.POST(jsonPayload);
http.end();
```

---

## ✨ Features

- **Real-Time Flow Telemetry**: See exactly how much water is flowing.
- **Daily Usage Tracking**: Monitors total liters consumed daily.
- **Automated Alerts**: Generates Critical alerts if a continuous leak is detected.
- **Remote Valve Control**: Shut off the main water supply directly from the app dashboard.
- **Secure Authentication**: Built-in authentication (Sanctum) for municipal operators.

## 📄 License
Private use only. All rights reserved.
