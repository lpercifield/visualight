/*
visualight_LED.ino

Example sketch for how to control the visualight LEDs manually.
R,G,B,W LEDs are on PWM-enabled pins 9, 13, 10, and 13 respectively.
NOTE: White LED pin is available only on non-DIY Visualight bulbs.

LEDs are common-ground, so use analogWrite 0(off) - 255(full brightness).

http://visualight.org

*/

#define redPin 9
#define greenPin 13
#define bluePin 10
#define whitePin 5
#define resetButtonPin 7

int maxFade = 255;
float fadeSpeed = 10;

void setup()  { 
  Serial.begin(9600);
  Serial.println("hello from Visualight");

  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  digitalWrite(redPin, LOW);
  digitalWrite(greenPin, LOW);
  digitalWrite(bluePin, LOW);

  pinMode(resetButtonPin, INPUT);
  //attachInterrupt(resetButtonPin, resetNow, CHANGE);
} 

void loop()  { 

  flashLED(greenPin, 500);
  flashLED(bluePin, 500);
  flashLED(redPin, 500);
  flashLED(whitePin, 500); //only on production models
  
  fadeLED(greenPin);
  fadeLED(bluePin);
  fadeLED(redPin);
  fadeLED(whitePin); //only on production models

  fadeAll();
}

void fadeLED(int ledPin){
  for(int fadeValue = 0 ; fadeValue <= maxFade; fadeValue +=5) { 
    analogWrite(ledPin, fadeValue);         
    delay(fadeSpeed);                            
  } 
  for(int fadeValue = maxFade ; fadeValue >= 0; fadeValue -=5) { 
    analogWrite(ledPin, fadeValue);         
    delay(fadeSpeed);                            
  }
}

void flashLED(int ledPin, int duration){
  digitalWrite(ledPin, HIGH);
  delay(duration);
  digitalWrite(ledPin, LOW);
}

void fadeAll(){
  //white
  for(int fadeValue = 0 ; fadeValue <= maxFade; fadeValue +=5) { 
    analogWrite(redPin, fadeValue);  
    analogWrite(greenPin, fadeValue);
    analogWrite(bluePin, fadeValue);      
    delay(fadeSpeed);                            
  } 
  for(int fadeValue = maxFade ; fadeValue >= 0; fadeValue -=5) { 
    analogWrite(redPin, fadeValue);  
    analogWrite(greenPin, fadeValue);
    analogWrite(bluePin, fadeValue);
    delay(fadeSpeed);                            
  }
}

//void resetNow(){
//  Serial.println("hit reset button!!");
//}





