// =====================================
// ESP8266 + LM393 IR Sensors
// Bidirectional People Counter
// State Machine Version
// =====================================

#define IR1_PIN D1   // GPIO5
#define IR2_PIN D2   // GPIO4

// -------------------------------
// State machine definition
// -------------------------------
enum PassageState
{
    IDLE,
    IR1_TRIGGERED,
    IR2_TRIGGERED
};

PassageState currentState = IDLE;

// -------------------------------
// Timing configuration
// -------------------------------
const unsigned long PASSAGE_TIMEOUT_MS = 1500;  // adjust if needed
unsigned long stateStartTime = 0;

// -------------------------------
// Sensor states
// -------------------------------
int ir1State = HIGH;
int ir2State = HIGH;

// -------------------------------
// People counter
// -------------------------------
int peopleCount = 0;

void setup()
{
    Serial.begin(115200);

    pinMode(IR1_PIN, INPUT);
    pinMode(IR2_PIN, INPUT);

    Serial.println("\nESP8266 IR State Machine Ready");
}
void loop()
{
    ir1State = digitalRead(IR1_PIN);
    ir2State = digitalRead(IR2_PIN);

    switch (currentState)
    {
        case IDLE:
            if (ir1State == LOW)
            {
                currentState = IR1_TRIGGERED;
                stateStartTime = millis();   // start timer
                Serial.println("IR1 triggered → waiting for IR2");
            }
            else if (ir2State == LOW)
            {
                currentState = IR2_TRIGGERED;
                stateStartTime = millis();   // start timer
                Serial.println("IR2 triggered → waiting for IR1");
            }
            break;

        case IR1_TRIGGERED:
            if (ir2State == LOW)
            {
                peopleCount++;
                Serial.println("ENTRY detected");
                Serial.print("People count: ");
                Serial.println(peopleCount);

                currentState = IDLE;
                stateStartTime = 0;   // 🔧 invalidate timer
            }
            else if (stateStartTime != 0 &&
                     millis() - stateStartTime > PASSAGE_TIMEOUT_MS)
            {
                Serial.println("IR1 timeout → reset");
                currentState = IDLE;
                stateStartTime = 0;   // 🔧 invalidate timer
            }
            break;

        case IR2_TRIGGERED:
            if (ir1State == LOW)
            {
                if (peopleCount > 0)
                {
                    peopleCount--;
                }

                Serial.println("EXIT detected");
                Serial.print("People count: ");
                Serial.println(peopleCount);

                currentState = IDLE;
                stateStartTime = 0;   // 🔧 invalidate timer
            }
            else if (stateStartTime != 0 &&
                     millis() - stateStartTime > PASSAGE_TIMEOUT_MS)
            {
                Serial.println("IR2 timeout → reset");
                currentState = IDLE;
                stateStartTime = 0;   // 🔧 invalidate timer
            }
            break;
    }
}
