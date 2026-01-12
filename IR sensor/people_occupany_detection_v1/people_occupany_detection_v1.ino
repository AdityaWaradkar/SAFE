// ESP8266 + LM393 IR Sensor Test

#define IR1_PIN D1
#define IR2_PIN D2

int ir1State = HIGH;
int prevState1 = HIGH;

int ir2State = HIGH;
int prevState2 = HIGH;

unsigned long stateStartTime; // if the person does not cross within 5s, then the flag is to be lost

enum PassageState {
    IDLE,
    IR1_TRIGGERED,
    IR2_TRIGGERED
};


int people_cnt = 0;

void setup()
{
    Serial.begin(115200);   // ESP8266 standard baud rate

    pinMode(IR1_PIN, INPUT);  // LM393 already has pull-up
    pinMode(IR2_PIN, INPUT);  // LM393 already has pull-up

    Serial.println("\nESP8266 IR Sensor Ready");
    delay(1000);
}

void loop()
{
    ir1State = digitalRead(IR1_PIN);
    ir2State = digitalRead(IR2_PIN);

    if (ir1State == LOW)
    {
        if(ir1State != prevState1)
        {
            prevState1 = ir1State;
            Serial.println("OBJECT DETECTED at IR1");
            // flag1 = true;
            if(flag2 == true)
            {
                //object has come from IR2;
                Serial.println("Object entered!\n");
                people_cnt++;
                Serial.print("People count: ");
                Serial.print(people_cnt);


                flag1 = false;
                flag2 = false;
            }
            else 
            {
                // flag1 = true;
                IR1_TRIGGERED = true;
            }
        }
    }
    else
    {
        if(ir1State != prevState1)
        {
            prevState1 = ir1State;
        }
    }


    if (ir2State == LOW)
    {
        if(ir2State != prevState2)
        {
            prevState2 = ir2State;
            Serial.println("OBJECT DETECTED at IR2");

            if(flag1 == true)
            {
                Serial.println("Object exited!\n");
                people_cnt--;
                Serial.print("People count: \n");
                Serial.print(people_cnt);


                flag1 = false;
                flag2 = false;
            }
            else 
            {
                flag2 = true;
            }
        }
    }
    else
    {
        if(ir2State != prevState2)
        {
            prevState2 = ir2State;
        }
    }

}
