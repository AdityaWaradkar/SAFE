// This is the code to test WiFi and on connection display the IP Address.
#include <ESP8266WiFi.h>

const char *ssid = "Aditya_ESP";     // this is the WiFi name
const char *password = "aditya1243"; // this is the WiFi password

void setup()
{
  Serial.begin(9600);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Connecting");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
    yield();
  }

  Serial.println("\nConnected!");
  Serial.println(WiFi.localIP());
}

void loop() {}
