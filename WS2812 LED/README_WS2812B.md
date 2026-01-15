# SAFE – LED Directional Guidance Experiments

This folder contains the LED-side experiments and validation work for the SAFE (Smart Adaptive Fire Evacuation) system.

The work in this folder focuses on reliably driving WS2812B LED strips using a 3.3 V microcontroller, validating directional evacuation patterns, and handling logic-level constraints under time and hardware limitations.

---

## Goals of This Phase

- Reliably drive WS2812B LED strips from a 3.3 V logic microcontroller (ESP8266)
- Validate human-readable directional evacuation patterns
- Explore and document safe temporary solutions for logic-level mismatch
- Characterize power and brightness behavior of the LED strip

---

## Background: Logic Level Issue

WS2812B LEDs are powered at 5 V and ideally require a 5 V logic-level data signal on DIN.  
However, microcontrollers such as the ESP8266 output only 3.3 V logic.

The standard solution is to use a proper logic-level converter (for example, **74AHCT125**).  
Due to component availability and project deadline constraints, an alternative signal-regeneration technique was implemented and validated.

---

## Logic-Level Signal Regeneration Technique (Temporary Workaround)

### Concept

Instead of a dedicated logic-level converter, the first WS2812B LED in the chain is used as a signal regenerator.

Internally, each WS2812B:

- Interprets incoming data using its internal controller
- Re-times and re-drives the signal
- Outputs the regenerated data at its own VCC level (~5 V) on the DOUT pin

This regenerated data signal is then used to reliably drive the rest of the LED strip.

### Implementation Steps

1. One WS2812B LED was physically cut from the strip
2. This LED is permanently placed first in the chain
3. This LED is always kept OFF (BLACK) in software
4. All functional LEDs start from index 1 onward

**Important:**  
This is a validated workaround and should **NOT** be considered a replacement for a proper logic-level converter.  
For production and long-term reliability, a dedicated level shifter (such as 74AHCT125) must be used.

---

## Folder Structure and Purpose

Default folders in this directory:

```
test_single_led_regenerator/
directional_comet_green/
brightness_ramp_white/
brightness_ramp_orange/
```

---

## test_single_led_regenerator

### Purpose

Verify that the signal-regeneration LED works correctly before connecting the full strip.

### Description

- Only two LEDs are connected:
  - **LED 0:** Regenerator LED (always BLACK)
  - **LED 1:** Test LED
- LED 1 cycles through basic colors (RED, GREEN, BLUE)

This confirms:

- Correct wiring
- Data integrity
- Stable signal regeneration

This test must be performed before running any other LED pattern.

---

## directional_comet_green

### Purpose

Implement a directional evacuation guidance pattern using GREEN light.

### Pattern Behavior

- LED 0 remains BLACK (signal regenerator)
- LEDs 1 to N form the evacuation path
- A moving GREEN comet with a fading tail travels along the strip
- Motion provides a strong and intuitive direction cue

### Reason for Choosing This Pattern

- Humans instinctively follow motion, especially under stress
- Directional movement is effective in peripheral vision
- Suitable for normal evacuation guidance scenarios

---

## brightness_ramp_white

### Purpose

Characterize power stability and brightness limits using WHITE light.

### Pattern Behavior

- LED 0 remains BLACK
- All other LEDs are set to WHITE
- Brightness is controlled via a variable
- In testing versions, brightness is smoothly increased and decreased

### Why This Test Is Important

- WHITE draws the maximum current
- Reveals voltage drops, brownouts, or weak solder joints
- Helps determine safe maximum operating brightness

---

## brightness_ramp_orange

### Purpose

Test value-based brightness control using ORANGE light.

### Color Used

RGB (255, 50, 0)

### Pattern Behavior

- LED 0 remains BLACK
- All other LEDs light ORANGE
- Brightness is controlled via a single variable
- This variable is currently hardcoded and will later be driven by system logic or input

### Use in SAFE System

- ORANGE represents caution or rerouting
- Less aggressive than RED
- More attention-grabbing than GREEN

---

## Color Semantics Used in SAFE

- **Green** – Safe path / proceed
- **Orange** – Caution / reroute
- **Red** – Blocked / danger
- **Blue** – Idle / maintenance
- **Black** – Off / buffer / inactive

---

## Important Notes

- LED 0 must always remain OFF
- Never hot-plug the data line
- Always power LEDs before sending data
- Keep brightness conservative during testing
- The regenerator LED technique is temporary and used due to constraints

---

## Planned Next Steps

- Replace regenerator LED with a proper logic-level converter (74AHCT125)
- Segment LED strips by zones and exits
- Integrate LED logic with SAFE sensor and decision engine
- Add failsafe static guidance modes
- Finalize power architecture for production use

---

## Summary

This work documents:

- A validated workaround for driving WS2812B LEDs from 3.3 V logic
- Directional LED patterns suitable for evacuation guidance
- Power and brightness characterization experiments
- A clear migration path toward a production-ready SAFE LED subsystem
