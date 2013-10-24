/*
 Fading
 
 This example shows how to fade an LED using the analogWrite() function.
 
 The circuit:
 * LED attached from digital pin 9 to ground.
 
 Created 1 Nov 2008
 By David A. Mellis
 modified 30 Aug 2011
 By Tom Igoe
 
 http://arduino.cc/en/Tutorial/Fading
 
 This example code is in the public domain.
 
 */


int redPin = 9;
int greenPin = 13;
int bluePin = 10;

int maxFade = 255;
float redScale = 1;
const int resetButton = 7;
const int resetPin = 11;
volatile int resetButtonState = HIGH;

void setup()  { 
  // nothing happens in setup 
  pinMode(resetButton, INPUT);
  pinMode(resetPin,OUTPUT);
  digitalWrite(resetButton, HIGH);
  digitalWrite(resetPin, HIGH);  
  Serial.println("HELLO");
  pinMode(redPin,OUTPUT);
  pinMode(greenPin,OUTPUT);
  pinMode(bluePin,OUTPUT);
  digitalWrite(redPin,LOW);
  digitalWrite(greenPin,LOW);
  digitalWrite(bluePin,LOW);
  attachInterrupt(4, resetWifi, CHANGE);
  
} 

void loop()  { 
   for(int fadeValue = 0 ; fadeValue <= maxFade; fadeValue +=5) { 
    // sets the value (range from 0 to maxFade):
    analogWrite(redPin, fadeValue/redScale);         
    // wait for 30 milliseconds to see the dimming effect    
    delay(30);                            
  } 
   for(int fadeValue = maxFade ; fadeValue >= 0; fadeValue -=5) { 
    // sets the value (range from 0 to maxFade):
    analogWrite(redPin, fadeValue/redScale);         
    // wait for 30 milliseconds to see the dimming effect    
    delay(30);                            
  }
  // fade in from min to max in increments of 5 points:
 

  // fade out from max to min in increments of 5 points:
  for(int fadeValue = 0 ; fadeValue <= maxFade; fadeValue +=5) { 
    // sets the value (range from 0 to maxFade):
    analogWrite(greenPin, fadeValue);         
    // wait for 30 milliseconds to see the dimming effect    
    delay(30);                            
  } 
  for(int fadeValue = maxFade ; fadeValue >= 0; fadeValue -=5) { 
    // sets the value (range from 0 to maxFade):
    analogWrite(greenPin, fadeValue);         
    // wait for 30 milliseconds to see the dimming effect    
    delay(30);                            
  }
  
  
for(int fadeValue = 0 ; fadeValue <= maxFade; fadeValue +=5) { 
    // sets the value (range from 0 to maxFade):
    analogWrite(bluePin, fadeValue);         
    // wait for 30 milliseconds to see the dimming effect    
    delay(30);                            
  }
  // fade out from max to min in increments of 5 points:
  for(int fadeValue = maxFade ; fadeValue >= 0; fadeValue -=5) { 
    // sets the value (range from 0 to maxFade):
    analogWrite(bluePin, fadeValue);         
    // wait for 30 milliseconds to see the dimming effect    
    delay(30);                            
  }
  
  for(int fadeValue = 0 ; fadeValue <= maxFade; fadeValue +=5) { 
    // sets the value (range from 0 to maxFade):
       analogWrite(redPin, fadeValue/redScale);  
analogWrite(greenPin, fadeValue);
analogWrite(bluePin, fadeValue);      
    // wait for 30 milliseconds to see the dimming effect    
    delay(30);                            
  } 
  for(int fadeValue = maxFade ; fadeValue >= 0; fadeValue -=5) { 
    // sets the value (range from 0 to maxFade):
    analogWrite(redPin, fadeValue/redScale);  
analogWrite(greenPin, fadeValue);
analogWrite(bluePin, fadeValue);
    // wait for 30 milliseconds to see the dimming effect    
    delay(30);                            
  }
  
  // fade out =9=from max to min in increments of 5 points:
  
}
void resetWifi()
{
  resetButtonState = digitalRead(resetButton);
  digitalWrite(resetPin, resetButtonState);
  
  
}


