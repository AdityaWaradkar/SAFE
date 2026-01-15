#include <Adafruit_NeoPixel.h>

#define LED_PIN   D1
#define LED_COUNT 32   // 1 buffer + 31 real LEDs

// -------- Brightness limits --------
#define BRIGHTNESS_MIN  0
#define BRIGHTNESS_MAX  255

// SAFE recommended range
#define BRIGHTNESS_MIN_SAFE  10
#define BRIGHTNESS_MAX_SAFE  150

// -------- CONTROL VARIABLE --------
// Change ONLY this value for testing
uint8_t brightnessLevel = 80;  
// Range: 0–255
// SAFE range: 10–150

Adafruit_NeoPixel strip(
  LED_COUNT,
  LED_PIN,
  NEO_GRB + NEO_KHZ800
);

void setup() {
  strip.begin();

  strip.setBrightness(brightnessLevel);

  // Buffer LED OFF
  strip.setPixelColor(0, 0, 0, 0);

  // White on all usable LEDs
  for (int i = 1; i < LED_COUNT; i++) {
    strip.setPixelColor(i, 255, 255, 255);
  }

  strip.show();
}

void loop() {
  // Intentionally empty
  // Brightness will later be updated from IP / logic
}
