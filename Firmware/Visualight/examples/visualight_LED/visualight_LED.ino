/*
visualight_LED.ino
 
 Example sketch for how to control the visualight LEDs manually.
 R,G,B,W LEDs are on PWM-enabled pins 9, 13, 10, and 13 respectively.
 NOTE: White LED pin is available only on non-DIY (black) Visualight bulbs.
 
 LEDs are common-ground, so use analogWrite 0(off) - 255(full brightness).
 
 http://visualight.org
 
 */

#define buttonPin 7
/* Visualight comes with a button on the PCB, regardless of model (strip, DIY, etc).
 It is used to hard reset the WiFi Network settings in the "visualight_basic"
 firmware. However, it is a simple digitalPin input and can be used to trigger
 anything you can think up! Note: Button is on Pin 7 on all Visualight models. */

#define redPin 9
#define greenPin 13
#define bluePin 10
#define whitePin 5 
/* whitePin should be defined as 5 for black/production bulbs.
 whitePin should be defined as 6 for white/DIY bulbs. */

float duration = 1000; // duration of your fade in milliseconds

void setup() { 
  /* start up Serial communication for fun */
  Serial.begin(9600);
  Serial.println("hello from Visualight");

  /* pin modes for LED pins */
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  pinMode(whitePin, OUTPUT);
  pinMode(buttonPin, INPUT);

  /* setup interrupt for the button */
  attachInterrupt(buttonPin, buttonGo, CHANGE);
} 

void loop() {   

  /* turn LED on then off in the duration speed */
  flashLED(redPin);
  flashLED(greenPin);
  flashLED(bluePin);
  flashLED(whitePin); //only on production (black bulb) models

  /* fade LED up then down in the duration speed */
  fadeLED(redPin);
  fadeLED(greenPin);
  fadeLED(bluePin);
  fadeLED(whitePin); //only on production (black bulb) models

  fadeAll(); //brightest white light any Visualightcan create
}


void flashLED(int ledPin){
  digitalWrite(ledPin, HIGH);
  delay(duration/2);
  digitalWrite(ledPin, LOW);
  delay(duration/2);
}


void fadeLED(int ledPin){
  for(int fadeValue = 0 ; fadeValue <= 255; fadeValue +=1) { 
    analogWrite(ledPin, fadeValue);         
    delay(duration/255);                            
  } 
  for(int fadeValue = 255 ; fadeValue >= 0; fadeValue -=1) { 
    analogWrite(ledPin, fadeValue);         
    delay(duration/255);                            
  }
}


void fadeAll(){
  //white
  for(int fadeValue = 0 ; fadeValue <= 255; fadeValue +=1) { 
    analogWrite(redPin, fadeValue);  
    analogWrite(greenPin, fadeValue);
    analogWrite(bluePin, fadeValue);      
    delay(duration/255);                            
  } 
  for(int fadeValue = 255 ; fadeValue >= 0; fadeValue -=1) { 
    analogWrite(redPin, fadeValue);  
    analogWrite(greenPin, fadeValue);
    analogWrite(bluePin, fadeValue);
    delay(duration/255);                            
  }
}



void buttonGo(){
  Serial.println("hit reset button!!");
}






