# IR Sensor – People Occupancy Detection (ESP8266)

This folder contains multiple iterations of a bidirectional people counting system built using an ESP8266 and LM393 IR sensors.  
Each version represents an improvement in logic, robustness, and real-world reliability.

The final and currently used implementation is **people_occupany_detection_v3**.

---

## Hardware Used

- ESP8266 (NodeMCU / ESP-12 based board)
- 2 × LM393 IR Obstacle Sensors
- GPIO connections:
  - IR1 → D1 (GPIO5)
  - IR2 → D2 (GPIO4)

LM393 modules provide a digital output (LOW when an object is detected).

---

## Folder Structure

```
IR sensor/
├── test/
├── people_occupany_detection_v1/
├── people_occupany_detection_v2/
└── people_occupany_detection_v3/
```

---

## Version History

### 1. test (Initial Sensor Validation)

**Purpose**

- Verify IR sensor wiring and digital behavior
- Validate ESP8266 GPIO input
- Serial output testing

**Description**

- Uses a single IR sensor
- Detects object presence only
- No people counting logic
- Edge detection using previous state

**Status**

- Experimental / diagnostic only

---

### 2. people_occupany_detection_v1 (First Counting Attempt)

**Purpose**

- First attempt at bidirectional people counting

**Approach**

- Two IR sensors
- Flag-based logic
- Order of trigger determines entry or exit

**Limitations**

- No timeout handling
- Flags not robustly managed
- Miscounts if a person stops midway
- Sensitive to noise

**Status**

- Proof of concept

---

### 3. people_occupany_detection_v2 (State Machine Based)

**Purpose**

- Improve reliability using a finite state machine

**Key Features**

- States:
  - IDLE
  - IR1_TRIGGERED
  - IR2_TRIGGERED
- Entry and exit detected using trigger sequence
- Timeout-based reset for incomplete crossings
- Prevents accidental multiple counts

**Limitations**

- No explicit sensor-clear waiting
- Rapid movements may still cause edge issues

**Status**

- Stable but not fully robust

---

### 4. people_occupany_detection_v3 (Final & Used Version)

**Purpose**

- Robust and reliable people occupancy detection

**Key Improvements**

- Extended state machine
- Added WAIT_FOR_CLEAR state
- Ensures both sensors return to HIGH before next detection
- Timeout protection for partial crossings
- Prevents double counting and false triggers
- Safe decrement (count never goes negative)

**States Used**

- IDLE
- IR1_TRIGGERED
- IR2_TRIGGERED
- WAIT_FOR_CLEAR

**Status**

- Final version
- Used in the project

---

## Serial Output

- Baud rate: **115200**
- Prints:
  - Sensor triggers
  - Entry / exit detection
  - Current people count

Useful for debugging and validation.

---

## Notes

- Folder names preserve development history intentionally.
- Recommended to use only **people_occupany_detection_v3** for deployment.
- Earlier versions are kept for learning and reference.

---

## Current Recommendation

Use **people_occupany_detection_v3** for:

- Accurate people counting
- Demonstrations
- Final project integration
