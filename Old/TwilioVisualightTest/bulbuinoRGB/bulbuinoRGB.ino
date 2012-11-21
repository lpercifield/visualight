/*
 * *********XBee Internet Gateway Light Example********
 * by Rob Faludi http://faludi.com
 * rewritten for St. Ann's http://saintannsny.org
 */

#define NAME "XIG Light Example"
#define VERSION "1.10"
#define RED_PIN 9
#define GREEN_PIN 10
#define BLUE_PIN 11

//int outputLight = 12;
int lightState;

void setup() {
  pinMode(13,OUTPUT);
  pinMode(RED_PIN,OUTPUT);
  pinMode(GREEN_PIN,OUTPUT);
  pinMode(BLUE_PIN,OUTPUT);
  blinkLED(RED_PIN,2,100);
  delay(100);
  blinkLED(GREEN_PIN,2,100);
  delay(100);
  blinkLED(BLUE_PIN,2,100);
  delay(100);
  //  digitalWrite(RED_PIN, HIGH);
  //  digitalWrite(GREEN_PIN, HIGH);
  //  digitalWrite(BLUE_PIN, HIGH);
  analogWrite(RED_PIN, 160);
  analogWrite(GREEN_PIN, 255);
  analogWrite(BLUE_PIN, 220);
  Serial.begin(115200); // faster is better for XIG
  delay(2000);
}


void loop() {
  if (millis() % 1000 == 0) {  // wait a second before sending the next request
    // request the current light state, set with zig_light_form_example.php
    Serial.println("http://leifp.com/pachube_php/bulb.txt");
  }
  if (Serial.available() > 0) { // if there's a byte waiting
    lightState = Serial.read(); // read the ASCII numeral byte
    lightState=lightState-48;
    // turn on the light if the response is 1, or off if the response is zero
    switch (lightState) {
    case 1:    // your hand is close to the sensor
      //Serial.println("dim");
      digitalWrite(RED_PIN, HIGH);
      digitalWrite(GREEN_PIN, LOW);
      digitalWrite(BLUE_PIN, LOW);
      break;
    case 2:    // your hand is a few inches from the sensor
      //Serial.println("medium");
      //digitalWrite(13, LOW);
      digitalWrite(RED_PIN, LOW);
      digitalWrite(GREEN_PIN, HIGH);
      digitalWrite(BLUE_PIN, LOW);
      break;
    case 3:    // your hand is nowhere near the sensor
      //Serial.println("bright");
      digitalWrite(RED_PIN, LOW);
      digitalWrite(GREEN_PIN, LOW);
      digitalWrite(BLUE_PIN, HIGH);
      break;
    case 4:    // your hand is nowhere near the sensor
      //Serial.println("bright");
      analogWrite(RED_PIN, 160);
      analogWrite(GREEN_PIN, 255);
      analogWrite(BLUE_PIN, 220);
      break;
    case 5:    // your hand is nowhere near the sensor
      //Serial.println("bright");
      digitalWrite(RED_PIN, LOW);
      digitalWrite(GREEN_PIN, LOW);
      digitalWrite(BLUE_PIN, LOW);
      break;
    } 
  }
}


////////////////// UTILITIES //////////////////
// this function blinks the an LED light as many times as requested, at the requested blinking rate
void blinkLED(byte targetPin, int numBlinks, int blinkRate) {
  for (int i=0; i<numBlinks; i++) {
    digitalWrite(targetPin, HIGH);   // sets the LED on
    delay(blinkRate);                     // waits for blinkRate milliseconds
    digitalWrite(targetPin, LOW);    // sets the LED off
    delay(blinkRate);
  }
}


