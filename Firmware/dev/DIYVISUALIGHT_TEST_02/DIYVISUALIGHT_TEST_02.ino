/*
Test WiFly and LED connections


 */
#include <WiFlyHQ.h>

WiFly wifly;

int redPin = 9;
int greenPin = 13;
int bluePin = 10;

int maxFade = 255;
float redScale = 1;
const int resetButton = 7;
const int resetPin = 11; //WiFly reset pin
volatile int resetButtonState = HIGH;

boolean wiflyFailed = false;

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

  Serial1.begin(9600);
  if (!wifly.begin(&Serial1,&Serial)) {
    Serial.println(F("Failed to start wifly"));
    wiflyFailed = true;
  }

  while(wiflyFailed){
    digitalWrite(redPin, HIGH);
    delay(250);
    digitalWrite(redPin, LOW);
    delay(250); 
  }
} 

void loop()  { 

  fadeLED(greenPin);
  fadeLED(bluePin);
  fadeLED(redPin);

  //white
  for(int fadeValue = 0 ; fadeValue <= maxFade; fadeValue +=5) { 
    analogWrite(redPin, fadeValue);  
    analogWrite(greenPin, fadeValue);
    analogWrite(bluePin, fadeValue);      
    delay(30);                            
  } 
  for(int fadeValue = maxFade ; fadeValue >= 0; fadeValue -=5) { 
    analogWrite(redPin, fadeValue);  
    analogWrite(greenPin, fadeValue);
    analogWrite(bluePin, fadeValue);
    delay(30);                            
  }
}

void fadeLED(int ledPin){
    // red 
  for(int fadeValue = 0 ; fadeValue <= maxFade; fadeValue +=5) { 
    analogWrite(ledPin, fadeValue);         
    delay(30);                            
  } 
  for(int fadeValue = maxFade ; fadeValue >= 0; fadeValue -=5) { 
    analogWrite(ledPin, fadeValue);         
    delay(30);                            
  }
}

void resetWifi() {
  resetButtonState = digitalRead(resetButton);
  digitalWrite(resetPin, resetButtonState);
  
  digitalWrite(redPin, LOW);
  digitalWrite(greenPin, LOW);
  digitalWrite(bluePin, LOW);
  delay(2500);
}




