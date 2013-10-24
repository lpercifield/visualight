int resetPressedTime;
boolean resetPressed = false;
void processButton(int pin, int holdTime){
  if(digitalRead(pin) == LOW && resetPressed == false){
    resetPressedTime = millis();
    resetPressed = true;
  }else{
    resetPressed = false;
  }
  if((millis() - resetPressedTime)> holdTime && resetPressed){
    //Serial.println(F("RESET"));
    resetPressedTime = millis();
  }
}


