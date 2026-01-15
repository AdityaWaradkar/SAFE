#include <Adafruit_NeoPixel.h>

#define LED_PIN   D1        // GPIO5
#define LED_COUNT 32        // 1 buffer + 31 real LEDs

// Tail length (number of fading LEDs behind the head)
#define TAIL_LEN  5

Adafruit_NeoPixel strip(
  LED_COUNT,
  LED_PIN,
  NEO_GRB + NEO_KHZ800
);

void setup() {
  strip.begin();
  strip.setBrightness(100);   // Overall brightness limit
  strip.clear();
  strip.show();
}

void loop() {

  // Move head from LED 1 to LED 31
  for (int head = 1; head < LED_COUNT; head++) {

    // Clear all LEDs first
    strip.clear();

    // Buffer LED always OFF
    strip.setPixelColor(0, 0, 0, 0);

    // Head (bright green)
    strip.setPixelColor(head, 0, 255, 0);

    // Fading tail behind the head
    for (int t = 1; t <= TAIL_LEN; t++) {
      int pos = head - t;
      if (pos >= 1) {
        // Fade factor (simple linear fade)
        uint8_t brightness = 255 / (t + 1);
        strip.setPixelColor(pos, 0, brightness, 0);
      }
    }

    strip.show();
    delay(70);   // Speed control
  }
}
