/*
 * Bitponics Controller
 * 
 * Ted Hayes / Limina.Studio 2012
 * ted.hayes@liminastudio.com
 * 
 * [License]
 * 
 */

#include <SPI.h>
#include <WiFly.h>
#include <EEPROM.h>
#include <Button.h>

#define PIN_LED_STATUS          10
#define PIN_BUTTON_RESET        9    // Used to 'factory reset' the system
#define RESET_BUTTON_TIME       8000  // ms, time to hold down button

#define ADHOC_SSID "Visualight"
#define maxLength 50
/////// Globals ////////
String inString = String(maxLength);
char network[20];
char password[20];
int controlNum = 0;
char controlBuff[4];

int _red = 255;
int _green = 255;
int _blue = 255;
int _blinkMe = 0;

long previousMillis = 0;        // will store last time LED was updated
long interval = 100;           // interval at which to blink (milliseconds)
int ledState = HIGH;

const char* MAC;



WiFlyServer server(80);
WiFlyClient bulbClient;
Button resetButton = Button(PIN_BUTTON_RESET,BUTTON_PULLUP_INTERNAL);
String scanlist;
boolean wifiSet;

void setup() {
  // Serial ports
  Serial.begin(9600);
  //  while (!Serial) {
  //    ; // wait for serial port to connect. Needed for Leonardo only
  //  }
  Serial.println("SETUP");
  Serial1.begin(9600);
  WiFly.setUart(&Serial1);
  MAC = WiFly.getMac();


  // Serial.print("IP: ");
  // Serial.println(WiFly.ip());

  //server.begin();

  // set up factory reset button
  resetButton.holdHandler(factoryReset, RESET_BUTTON_TIME);
  if(resetButton.isPressed()){
    factoryReset(resetButton);
  }

  // Is the unit in Setup or Normal mode?
  wifiSet = EEPROM.read(0);
  //wifiSet = 0;
  if(wifiSet == 1 || wifiSet == true){
    // The WiFi module is set up for wifi, so try to connect to the Bitponics server
    Serial.println("WiFi Mode");
    WiFly.begin();
    delay(1000);
    //This is where we connect to the server
  } 
  else {
    // The WiFi module is NOT set up for wifi and should already be in Adhoc mode, so start web server
    Serial.println("Adhoc Mode");
    setAdhocMode();
  }

  // Misc
  pinMode(PIN_LED_STATUS, OUTPUT);
}

void factoryReset(Button& b){
  // Serial.print("Held for at least 1 second: ");
  // Serial.println(b.pin);
  Serial.print("factoryReset... ");
  bulbClient.stop();
  boolean adhocOK = setAdhocMode();
  //Serial.println(adhocOK);
  //restart();
}

void restart(){
  // wifi.reboot();
  delay(1000); // wait for reboot to continue
  // setup();    // will this do?

}

boolean setAdhocMode(){
  // sets up the wifi module for Adhoc mode
  // only called by the "Factory Reset" function or first run
  boolean sendOK = false;
  WiFly.begin(true);
  if(!WiFly.createAdHocNetwork(ADHOC_SSID)) {
    // set EEPROM value & reboot trigger
    //ERROR
  } 
  else {
    //    Serial.println(F("*** setAdhocMode error"));
    EEPROM.write(0, 0); // means that the device is NOT configured for WiFi, so upon start, perform the correct actions
    wifiSet = 0; // because loop will continue running
    server.begin();
    sendOK = true;
  }
  return sendOK;
}


//void returnScanlist(WiFlyClient client){
//  //client.println(scanlist);
//  Serial.println("scanlist");
//}

void configWifi(){
  WiFly.begin();

  if (!WiFly.join(network, password)) {
    Serial.println("Association failed.");
    setAdhocMode();
  }
  else{
    Serial.println("JOINED");
    EEPROM.write(0, 1);
    wifiSet = 1;
    //Serial.println("Connect");
    //    if (bulbClient.connect("leifp.com", 5001)) {
    //      bulbClient.print(MAC);
    //
    //      //TODO: 
    //    } 
    //    else {
    //    }
  }


}

void visualight(){
  if (bulbClient.available()>1) {
    _red = bulbClient.parseInt();
    _green = bulbClient.parseInt();
    _blue = bulbClient.parseInt();
    _blinkMe = bulbClient.parseInt();
    analogWrite(11, _green);
    analogWrite(10, _red);
    analogWrite(9, _blue);
  }
  if(_blinkMe == 1){
    blinkLED();
  }
  //if we got disconnected reconnect
  if (!bulbClient.connected()) {
    Serial.println("connecting");
    bulbClient.stop();
    delay(100);
    bulbClient.connect("leifp.com", 5001);
    bulbClient.print(MAC);
    delay(5000);
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

void processServer(){
  WiFlyClient client = server.available();
  if (client) {
    boolean current_line_is_blank = true;
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        if (inString.length() < maxLength) {
          //inString.append(c);
          inString += c;
        }        
        if (c == '\n' && current_line_is_blank) {
          if (inString.indexOf("?") > -1) {
            int Pos_1 = inString.indexOf("?");
            int commandEnd = inString.indexOf("**");
            inString.substring((Pos_1+1), (Pos_1+2)).toCharArray(controlBuff, 4);
            controlNum = atoi(controlBuff);
            //Serial.println(inString);
            //Serial.println(controlNum);
            if(controlNum == 1){
              //Serial.println("scanlist");
            }
            else if(controlNum == 2){
              // Serial.println("config");
              int comma = inString.lastIndexOf(",");
              inString.substring((Pos_1+3),comma).toCharArray(network, 20);
              inString.substring(comma+1,commandEnd).toCharArray(password, 20);
              Serial.print(network);
              Serial.print('\t');
              Serial.println(password);
              configWifi();
              //int passwordStart
              //= inString.substring((Pos_1+2),
              //int pos_n = inString.indexOf
            }

          }
          if(wifiSet!=1){
            client.println("HTTP/1.1 200 OK");
            client.println("Content-Type: text/html");
            client.println();
            client.println("<html><head></head><body>");
            client.println("Visualight");
            client.println(MAC);
            //          client.println("<form method=get><input name=1&& type=submit value=scan></form><br>");
            //          client.print("<form method=get>SSID:<input type=text size=20 name=n value=");
            //          client.print("Network");
            //          client.print(">Password:<input type=text size=20 name=p value=");
            //          client.print("Password");
            //          client.println(">&nbsp;<input name=2&& type=submit value=config></form>");
            client.println("</body></html>");
          }
          break;
        }
        if (c == '\n') {
          current_line_is_blank = true;
        }
        else if (c != '\r') {
          current_line_is_blank = false;
        }
      }
    }
    delay(1);
    inString = "";
    client.stop();
  }
}

void loop() {
  resetButton.process();
  if(wifiSet == 1){
    //DO STUFF
    visualight();
  } 
  else {
    processServer();
  }
}


