#include <Adafruit_NeoPixel.h>

#define LED_PIN   D1        // GPIO5
#define LED_COUNT 2         // LED 0 = regenerator, LED 1 = test LED

Adafruit_NeoPixel strip(
  LED_COUNT,
  LED_PIN,
  NEO_GRB + NEO_KHZ800
);

void setup() {
  strip.begin();
  strip.setBrightness(80);   // Conservative brightness
  strip.clear();
  strip.show();
}

void loop() {

  // -------- RED --------
  strip.setPixelColor(0, 0, 0, 0);       // Regenerator LED OFF
  strip.setPixelColor(1, 255, 0, 0);     // Test LED RED
  strip.show();
  delay(1000);

  // -------- GREEN --------
  strip.setPixelColor(0, 0, 0, 0);
  strip.setPixelColor(1, 0, 255, 0);     // Test LED GREEN
  strip.show();
  delay(1000);

  // -------- BLUE --------
  strip.setPixelColor(0, 0, 0, 0);
  strip.setPixelColor(1, 0, 0, 255);     // Test LED BLUE
  strip.show();
  delay(1000);
}
