int resetPressedTime;
boolean resetPressed = false;
void processButton(int pin){
  if(digitalRead(pin) == LOW && resetPressed == false){
    resetPressedTime = millis();
    resetPressed = true;
  }
  else if(digitalRead(pin) == LOW && resetPressed == true){
    if((millis() - resetPressedTime)> 5000){
      Serial.println(F("RESET"));
      //resetPressedTime = millis();
      wifiReset();
      resetPressed = false;
    }
  }
  else{
    resetPressed = false;
  }


}



