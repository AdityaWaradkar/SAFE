// ESP8266 + LM393 IR Sensor Test

#define IR1_PIN D1

int ir1State = HIGH;
int prevState1 = HIGH;

int people_cnt = 0;

void setup()
{
    Serial.begin(115200);   // ESP8266 standard baud rate

    pinMode(IR1_PIN, INPUT);  // LM393 already has pull-up

    Serial.println("\nESP8266 IR Sensor Ready");
    delay(1000);
}

void loop()
{
    ir1State = digitalRead(IR1_PIN);

    if (ir1State == LOW)
    {
        if(ir1State != prevState1)
        {
            prevState1 = ir1State;
            Serial.println("OBJECT DETECTED at IR1");
        }
        else 
        {
            // flag1 = true;
        }
    }
    else
    {
        if(ir1State != prevState1)
        {
            prevState1 = ir1State;
        }
    }
}
