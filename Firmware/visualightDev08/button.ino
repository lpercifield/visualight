volatile int resetButtonState = HIGH;
volatile int resetTime;
int resetButtonTime = 2000;
void processButtonPress(){
  resetButtonState = digitalRead(resetButton);
  if(resetButtonState == LOW){
    if(DEBUG) Serial.println("RESET WIFI");
    wifiReset();
  }
}
void processButton(){
  
}



