const int redLED = 13;
const int greenLED = 10;
const int blueLED = 9;
void setup(){
  fadeOn();
  //colorLED(255,255,255);
}
void loop(){
  
}

void colorLED(int red,int green,int blue){
//  if(sink){
//    red = 255-red;
//    green = 255-green;
//    blue = 255-blue;
//  }
  analogWrite(redLED, red);
  analogWrite(greenLED, green);
  analogWrite(blueLED, blue);
}
void fadeOn(){
    for(int fadeValue = 0 ; fadeValue <= 255; fadeValue +=5) { 
    // sets the value (range from 0 to 255):
    colorLED(fadeValue,fadeValue,fadeValue);         
    // wait for 30 milliseconds to see the dimming effect    
    delay(10);                            
  }
}
