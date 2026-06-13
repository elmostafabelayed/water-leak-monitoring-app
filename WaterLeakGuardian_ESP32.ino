#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // ⚠️ T2AKED T-INSTALLI HAD L'LIBRARY F ARDUINO IDE ⚠️

// ============================================================
// CONFIGURATION
// ============================================================

// --- WIFI ---
#define WIFI_SSID "CAFE AUSTIN 3"
#define WIFI_PASSWORD "60606060"

// --- API ---
// Badl l'IP b l'IP dyal pc dyalk, w t2kd bli rak mdemarri l'backend b: 
// php artisan serve --host=0.0.0.0 --port=8000
String serverName = "http://192.168.0.239:8000/api/water-data";

// --- GPIO ---
#define PIN_FLOW_SENSOR 14
#define PIN_RELAY 23

// --- RELAY TYPE: ACTIVE-LOW ---
#define RELAY_ON  HIGH
#define RELAY_OFF LOW

// ============================================================
// FLOW SENSOR
// ============================================================
volatile int pulseCount = 0;
float flowRate = 0;
float totalLiters = 0;
#define FLOW_CALIBRATION 7.5
#define MEASURE_INTERVAL_MS 1000
unsigned long lastMeasure = 0;

// ============================================================
// MODES
// ============================================================
enum SystemMode { MODE_AUTO, MODE_MANUAL };
SystemMode currentMode = MODE_AUTO;

// ============================================================
// LEAK DETECTION
// ============================================================
#define LEAK_SMALL_THRESHOLD     1.0
#define LEAK_CRITICAL_THRESHOLD  15.0
#define LEAK_SMALL_CONFIRM_MS    60000
#define LEAK_CRITICAL_CONFIRM_MS 500
#define CONTINUOUS_USAGE_MS      1200000

enum LeakStatus {
  STATUS_NORMAL,
  STATUS_LEAK_SUSPECTED,
  STATUS_CRITICAL_LEAK,
  STATUS_CONTINUOUS_USAGE
};

LeakStatus currentStatus = STATUS_NORMAL;
bool leakDetected = false;
bool valveOpen = true;

unsigned long flowStartTime = 0;
unsigned long smallLeakStart = 0;
unsigned long lastNotification = 0;
#define NOTIFICATION_COOLDOWN_MS 30000

// ============================================================
// INTERRUPT
// ============================================================
void IRAM_ATTR flowPulse() {
  pulseCount++;
}

// ============================================================
// VALVE CONTROL — مصلح
// ============================================================
void openValve() {
  digitalWrite(PIN_RELAY, RELAY_OFF);  // active-low: OFF = HIGH = فتح
  valveOpen = true;
  Serial.println("[VALVE] OPENED ✅");
}

void closeValve() {
  digitalWrite(PIN_RELAY, RELAY_ON);   // active-low: ON = LOW = غلق
  valveOpen = false;
  Serial.println("[VALVE] CLOSED 🔒");
}

// ============================================================
// WIFI
// ============================================================
void connectWiFi() {
  Serial.print("Connecting WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected ✅");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi FAILED - continuing offline");
  }
}

// ============================================================
// MODE
// ============================================================
void setMode(SystemMode mode) {
  currentMode = mode;
  Serial.print("[MODE] ");
  Serial.println(mode == MODE_AUTO ? "AUTO 🤖" : "MANUAL 👤");
}

// ============================================================
// SEND TO API & CHECK FOR APP COMMANDS
// ============================================================
void sendToAPI(bool forceNotification = false) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[API] WiFi not connected");
    return;
  }

  HTTPClient http;
  http.setTimeout(3000);
  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");

  String statusStr;
  switch(currentStatus) {
    case STATUS_NORMAL:           statusStr = "normal"; break;
    case STATUS_LEAK_SUSPECTED:   statusStr = "leak_suspected"; break;
    case STATUS_CRITICAL_LEAK:    statusStr = "critical_leak"; break;
    case STATUS_CONTINUOUS_USAGE: statusStr = "continuous_usage"; break;
    default:                      statusStr = "unknown";
  }

  String modeStr = (currentMode == MODE_AUTO) ? "auto" : "manual";

  String json = "{";
  json += "\"flow_rate\":"    + String(flowRate, 2);
  json += ",\"total_liters\":" + String(totalLiters, 3);
  json += ",\"status\":\""    + statusStr + "\"";
  json += ",\"valve_open\":"  + String(valveOpen ? "true" : "false");
  json += ",\"mode\":\""      + modeStr + "\"";
  json += ",\"leak_detected\":" + String(leakDetected ? "true" : "false");
  json += ",\"force_notify\":" + String(forceNotification ? "true" : "false");
  json += ",\"device_id\":\"WLG_001\"";
  json += "}";

  int code = http.POST(json);
  Serial.print("[API] HTTP: ");
  Serial.println(code);

  // --- MODIFICATION ICI : Lire la reponse de Laravel ---
  if (code == 200 || code == 201) {
    String response = http.getString();
    
    // Parse JSON
    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error) {
      // Vérifier wach l'application mobile saftat chi command dyal vanne (open/close)
      if (doc.containsKey("command") && !doc["command"].isNull()) {
        String cmd = doc["command"].as<String>();
        Serial.print("[API] Command received from App: ");
        Serial.println(cmd);
        
        if (cmd == "open" && !valveOpen) {
          openValve();
          // Reset leak status because user forced open via app
          leakDetected = false; 
          currentStatus = STATUS_NORMAL;
          flowStartTime = 0;
          smallLeakStart = 0;
        } 
        else if (cmd == "close" && valveOpen) {
          closeValve();
        }
      }
    } else {
      Serial.println("[API] JSON parsing failed");
    }
  }

  http.end();
}

// ============================================================
// LEAK DETECTION
// ============================================================
void detectLeak(unsigned long now) {

  // لا يوجد تدفق
  if (flowRate < 0.1) {
    if (currentStatus != STATUS_NORMAL) {
      currentStatus = STATUS_NORMAL;
      leakDetected = false;
      flowStartTime = 0;
      smallLeakStart = 0;
    }
    return;
  }

  // تسرب حرج
  if (flowRate > LEAK_CRITICAL_THRESHOLD) {
    if (flowStartTime == 0) flowStartTime = now;

    if (now - flowStartTime >= LEAK_CRITICAL_CONFIRM_MS) {
      currentStatus = STATUS_CRITICAL_LEAK;
      leakDetected = true;
      Serial.println("🚨 CRITICAL LEAK!");

      if (currentMode == MODE_AUTO) {
        closeValve();
        Serial.println("   → [AUTO] Valve CLOSED");
      } else {
        Serial.println("   → [MANUAL] NOTIFY ONLY");
      }

      if (now - lastNotification >= NOTIFICATION_COOLDOWN_MS || lastNotification == 0) {
        sendToAPI(true);
        lastNotification = now;
      }
    }
    return;
  }

  // تسرب صامت
  if (flowRate > 0.1 && flowRate < LEAK_SMALL_THRESHOLD) {
    if (smallLeakStart == 0) smallLeakStart = now;

    if (now - smallLeakStart >= LEAK_SMALL_CONFIRM_MS) {
      currentStatus = STATUS_LEAK_SUSPECTED;
      leakDetected = true;
      Serial.println("⚠️ SUSPECTED LEAK");

      if (currentMode == MODE_AUTO) {
        closeValve();
        Serial.println("   → [AUTO] Valve CLOSED");
      } else {
        Serial.println("   → [MANUAL] NOTIFY ONLY");
      }

      if (now - lastNotification >= NOTIFICATION_COOLDOWN_MS || lastNotification == 0) {
        sendToAPI(true);
        lastNotification = now;
      }
    }
    return;
  }

  // استخدام مستمر
  if (flowRate >= LEAK_SMALL_THRESHOLD && flowRate <= LEAK_CRITICAL_THRESHOLD) {
    if (flowStartTime == 0) flowStartTime = now;

    if (now - flowStartTime >= CONTINUOUS_USAGE_MS) {
      currentStatus = STATUS_CONTINUOUS_USAGE;
      Serial.println("⏰ CONTINUOUS USAGE");

      if (now - lastNotification >= NOTIFICATION_COOLDOWN_MS || lastNotification == 0) {
        sendToAPI(true);
        lastNotification = now;
      }
    }
  }
}

// ============================================================
// SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(PIN_RELAY, OUTPUT);
  pinMode(PIN_FLOW_SENSOR, INPUT_PULLUP);

  // اختبار الـ relay عند البداية
  Serial.println("\n========================================");
  Serial.println("   🔧 RELAY TEST");
  Serial.println("========================================");
  Serial.println("Testing CLOSE...");
  closeValve();
  delay(2000);
  Serial.println("Testing OPEN...");
  openValve();
  delay(2000);
  Serial.println("========================================\n");

  // الصمام مفتوح بالبداية
  openValve();

  connectWiFi();

  attachInterrupt(digitalPinToInterrupt(PIN_FLOW_SENSOR), flowPulse, RISING);

  setMode(MODE_AUTO);

  Serial.println("========================================");
  Serial.println("   💧 WATER LEAK GUARDIAN READY");
  Serial.println("========================================");
  Serial.println("  M → Toggle Mode (AUTO/MANUAL)");
  Serial.println("  O → Open Valve");
  Serial.println("  C → Close Valve");
  Serial.println("  R → Reset System");
  Serial.println("  T → Test Valve (toggle)");
  Serial.println("========================================");
}

// ============================================================
// LOOP
// ============================================================
void loop() {
  unsigned long now = millis();

  // حساب التدفق
  if (now - lastMeasure >= MEASURE_INTERVAL_MS) {
    detachInterrupt(digitalPinToInterrupt(PIN_FLOW_SENSOR));

    float elapsed = (now - lastMeasure) / 1000.0;
    flowRate = (pulseCount / FLOW_CALIBRATION) / elapsed * 60.0;
    totalLiters += (pulseCount / FLOW_CALIBRATION);

    if (flowRate > 50.0) flowRate = 0;
    if (pulseCount > 2000) pulseCount = 0;

    Serial.print("Flow: ");
    Serial.print(flowRate);
    Serial.print(" L/min | Total: ");
    Serial.print(totalLiters);
    Serial.print(" L | Valve: ");
    Serial.print(valveOpen ? "OPEN ✅" : "CLOSED 🔒");
    Serial.print(" | Mode: ");
    Serial.println(currentMode == MODE_AUTO ? "AUTO 🤖" : "MANUAL 👤");

    pulseCount = 0;
    lastMeasure = now;

    attachInterrupt(digitalPinToInterrupt(PIN_FLOW_SENSOR), flowPulse, RISING);
  }

  // كشف التسرب
  detectLeak(now);

  // إرسال البيانات كل 5 ثواني
  static unsigned long lastSend = 0;
  if (now - lastSend >= 5000) {
    sendToAPI();
    lastSend = now;
  }

  // أوامر Serial
  if (Serial.available()) {
    char cmd = Serial.read();
    switch (cmd) {
      case 'M': case 'm':
        setMode(currentMode == MODE_AUTO ? MODE_MANUAL : MODE_AUTO);
        break;

      case 'O': case 'o':
        leakDetected = false;
        currentStatus = STATUS_NORMAL;
        flowStartTime = 0;
        smallLeakStart = 0;
        openValve();
        Serial.println("[CMD] Valve OPENED by user");
        break;

      case 'C': case 'c':
        closeValve();
        Serial.println("[CMD] Valve CLOSED by user");
        break;

      case 'R': case 'r':
        leakDetected = false;
        currentStatus = STATUS_NORMAL;
        totalLiters = 0;
        flowStartTime = 0;
        smallLeakStart = 0;
        openValve();
        Serial.println("[CMD] System RESET");
        break;

      case 'T': case 't':
        Serial.println("[TEST] Toggling valve...");
        if (valveOpen) {
          closeValve();
        } else {
          openValve();
        }
        break;
    }
  }

  delay(50);
}
