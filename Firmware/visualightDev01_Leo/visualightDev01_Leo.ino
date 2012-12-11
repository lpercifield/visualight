
// required https://github.com/lpercifield/WiFly

#include <SPI.h>
#include <WiFly.h>

#include "Credentials.h"


int _red = 255;
int _green = 255;
int _blue = 255;
int _blinkMe = 0;

long previousMillis = 0;        // will store last time LED was updated
long interval = 100;           // interval at which to blink (milliseconds)
int ledState = HIGH;

WiFlyClient client;

void setup() {
  analogWrite(11, _red);
  analogWrite(10, _green);
  analogWrite(9, _blue);
  Serial1.begin(9600);
  delay(2000); // wait for the wifly to join the network
  WiFly.setUart(&Serial1); //Use the hardware serial port with the wifly library
  WiFly.begin();
  
  //If the wifly is not programmed use this
//  if (!WiFly.join(ssid, passphrase)) {
//    //Serial.println("Association failed.");
//    while (1) {
//      // Hang on failure.
//    }
//  }  

  delay(1000);
  if (client.connect("leifp.com", 5001)) {
    client.println("hello from visualight!");
    //TODO: 
  } else {
  }
  
}

void loop() {
  if (client.available()>1) {
    _red = client.parseInt();
    _green = client.parseInt();
    _blue = client.parseInt();
    _blinkMe = client.parseInt();
    analogWrite(11, _green);
    analogWrite(10, _red);
    analogWrite(9, _blue);
  }
  if(_blinkMe == 1){
      blinkLED();
    }
//if we got disconnected reconnect
  if (!client.connected()) {
    client.stop();
    client.connect("leifp.com", 5001);
    delay(3000);
  }
}
void blinkLED(){
  unsigned long currentMillis = millis();
  if(currentMillis - previousMillis > interval) {
    previousMillis = currentMillis;
    if (ledState == LOW){
      analogWrite(11, _green);
      analogWrite(10, _red);
      analogWrite(9, _blue);
      ledState = HIGH;
    }
    else{
      analogWrite(11, 0);
      analogWrite(10, 0);
      analogWrite(9, 0);
      ledState = LOW;
    }
      
  }
}


