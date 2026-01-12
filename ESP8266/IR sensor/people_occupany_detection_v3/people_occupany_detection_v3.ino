// =====================================
// ESP8266 + LM393 IR Sensors
// Bidirectional People Counter
// Robust State Machine Version
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
    IR2_TRIGGERED,
    WAIT_FOR_CLEAR
};

PassageState currentState = IDLE;

// -------------------------------
// Timing configuration
// -------------------------------
const unsigned long PASSAGE_TIMEOUT_MS = 2000;
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
                stateStartTime = millis();
                Serial.println("IR1 triggered → waiting for IR2");
            }
            else if (ir2State == LOW)
            {
                currentState = IR2_TRIGGERED;
                stateStartTime = millis();
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

                currentState = WAIT_FOR_CLEAR;
                stateStartTime = 0;
            }
            else if (millis() - stateStartTime > PASSAGE_TIMEOUT_MS)
            {
                Serial.println("IR1 timeout → reset");
                currentState = IDLE;
                stateStartTime = 0;
            }
            break;

        case IR2_TRIGGERED:
            if (ir1State == LOW)
            {
                if (peopleCount > 0)
                    peopleCount--;

                Serial.println("EXIT detected");
                Serial.print("People count: ");
                Serial.println(peopleCount);

                currentState = WAIT_FOR_CLEAR;
                stateStartTime = 0;
            }
            else if (millis() - stateStartTime > PASSAGE_TIMEOUT_MS)
            {
                Serial.println("IR2 timeout → reset");
                currentState = IDLE;
                stateStartTime = 0;
            }
            break;

        case WAIT_FOR_CLEAR:
            if (ir1State == HIGH && ir2State == HIGH)
            {
                Serial.println("Sensors cleared → ready for next event");
                currentState = IDLE;
            }
            break;
    }
}
