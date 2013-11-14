volatile int resetButtonState = HIGH;
volatile int resetTime;
int resetButtonTime = 2000;
void processButtonPress(){
  resetButtonState = digitalRead(resetButton);
}
void processButton(){
    if(resetButtonState == LOW){
    if(DEBUG) Serial.println("RESET WIFI");
    wifiReset();
  }
}



