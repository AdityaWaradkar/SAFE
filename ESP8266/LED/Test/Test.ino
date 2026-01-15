#include <Adafruit_NeoPixel.h>

#define LED_PIN   D1        // GPIO5
#define LED_COUNT 32        // 1 buffer + 31 real LEDs

// ORANGE color
#define COL_R 255
#define COL_G 50
#define COL_B 0

// Comet length
#define COMET_LEN 5
#define SPEED_DELAY 100   // ms

Adafruit_NeoPixel strip(
  LED_COUNT,
  LED_PIN,
  NEO_GRB + NEO_KHZ800
);

void setup() {
  strip.begin();
  strip.setBrightness(120);   // Safe brightness
  strip.clear();
  strip.show();
}

void loop() {

  // Move comet head from LED 1 to LED 31
  for (int head = 1; head < LED_COUNT; head++) {

    strip.clear();

    // Buffer LED always OFF
    strip.setPixelColor(0, 0, 0, 0);

    // Draw comet (head + fading tail)
    for (int t = 0; t < COMET_LEN; t++) {
      int pos = head - t;
      if (pos >= 1) {
        // Fade factor (head brightest)
        uint8_t fade = 255 / (t + 1);

        uint8_t r = (COL_R * fade) / 255;
        uint8_t g = (COL_G * fade) / 255;

        strip.setPixelColor(pos, r, g, 0);
      }
    }

    strip.show();
    delay(SPEED_DELAY);
  }
}
