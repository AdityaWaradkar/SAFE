#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

/* =========================================================
   SELECT THE ROLE OF THIS ESP
   ---------------------------------------------------------
   Uncomment ONLY ONE of the following.
   ========================================================= */

#define USE_ROOMS
// #define USE_CORRIDORS
// #define USE_CONFERENCE_ROOM

const char *ssid     = "BePositive";
const char *password = "Positive24";

unsigned long lastSVGFetch = 0;
const unsigned long SVG_INTERVAL = 15000;

struct ZoneData {
  int flame;
  int smoke;
  float temperature;
};

#ifdef USE_ROOMS
const char *apiUrl = "https://safe-0vvn.onrender.com/data/rooms";
ZoneData rooms[6];
const char* roomKeys[6] = {
  "room1", "room2", "room3", "room4", "room5", "safeRoom"
};
#endif

#ifdef USE_CORRIDORS
const char *apiUrl = "https://safe-0vvn.onrender.com/data/corridors";
ZoneData corridors[6];
const char* corridorKeys[6] = {
  "corridor1", "corridor2", "corridor3",
  "corridor4", "corridor5", "corridor6"
};
#endif

#ifdef USE_CONFERENCE_ROOM
const char *apiUrl = "https://safe-0vvn.onrender.com/data/conferenceRoom";
ZoneData confRoom[2];
const char* confKeys[2] = { "A", "B" };
#endif

void setup()
{
  Serial.begin(9600);
  delay(1000);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    yield();
  }

  Serial.println("\nWiFi connected");
  Serial.println(WiFi.localIP());
}

void fetchSVGData()
{
  if (WiFi.status() != WL_CONNECTED)
    return;

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  if (!http.begin(client, apiUrl)) {
    Serial.println("HTTP begin failed");
    return;
  }

  int httpCode = http.GET();
  if (httpCode != HTTP_CODE_OK) {
    Serial.printf("HTTP error: %d\n", httpCode);
    http.end();
    return;
  }

  String payload = http.getString();
  http.end();

  StaticJsonDocument<1024> doc;
  if (deserializeJson(doc, payload)) {
    Serial.println("JSON parse failed");
    return;
  }


  Serial.print("Timestamp: ");
  Serial.println((const char*)doc["timestamp"]);

  Serial.print("Received At: ");
  Serial.println((const char*)doc["receivedAt"]);

// ROOMS MODE
#ifdef USE_ROOMS
  JsonObject roomsObj = doc["rooms"];

  for (int i = 0; i < 6; i++) {
    rooms[i].flame       = roomsObj[roomKeys[i]]["flame"];
    rooms[i].smoke       = roomsObj[roomKeys[i]]["smoke"];
    rooms[i].temperature = roomsObj[roomKeys[i]]["temperature"];
  }

  Serial.println("Room Data:");
  for (int i = 0; i < 6; i++) {
    Serial.printf("%s -> F:%d S:%d T:%.2f\n",
      roomKeys[i], rooms[i].flame, rooms[i].smoke, rooms[i].temperature);
  }
#endif

// CORRIDOR MODE
#ifdef USE_CORRIDORS
  JsonObject corridorsObj = doc["corridors"];

  for (int i = 0; i < 6; i++) {
    corridors[i].flame       = corridorsObj[corridorKeys[i]]["flame"];
    corridors[i].smoke       = corridorsObj[corridorKeys[i]]["smoke"];
    corridors[i].temperature = corridorsObj[corridorKeys[i]]["temperature"];
  }

  Serial.println("Corridor Data:");
  for (int i = 0; i < 6; i++) {
    Serial.printf("%s -> F:%d S:%d T:%.2f\n",
      corridorKeys[i], corridors[i].flame,
      corridors[i].smoke, corridors[i].temperature);
  }
#endif

// CONFERENCE ROOM MODE
#ifdef USE_CONFERENCE_ROOM
  JsonObject confObj = doc["conferenceRoom"];

  for (int i = 0; i < 2; i++) {
    confRoom[i].flame       = confObj[confKeys[i]]["flame"];
    confRoom[i].smoke       = confObj[confKeys[i]]["smoke"];
    confRoom[i].temperature = confObj[confKeys[i]]["temperature"];
  }

  Serial.println("Conference Room Data:");
  for (int i = 0; i < 2; i++) {
    Serial.printf("Conf %s -> F:%d S:%d T:%.2f\n",
      confKeys[i], confRoom[i].flame,
      confRoom[i].smoke, confRoom[i].temperature);
  }
#endif
}


void handleToFSensor()
{
}

void loop()
{
  unsigned long now = millis();

  handleToFSensor();

  if (now - lastSVGFetch >= SVG_INTERVAL) {
    lastSVGFetch = now;
    fetchSVGData();
  }
}
