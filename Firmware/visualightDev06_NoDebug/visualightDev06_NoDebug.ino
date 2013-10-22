/*
 * VISUALIGHT by LEIF PERCIFILED
 * Exctracted from: WiFlyHQ Example httpserver.ino
 *
 * This sketch is released to the public domain.
 *
 */

/* Notes:
 */

/* Work around a bug with PROGMEM and PSTR where the compiler always
 * generates warnings.
 */
#undef PROGMEM 
#define PROGMEM __attribute__(( section(".progmem.data") )) 
#undef PSTR 
#define PSTR(s) (__extension__({static prog_char __c[] PROGMEM = (s); &__c[0];})) 

#include <WiFlyHQ.h>
#include <EEPROM.h>
#include <Button.h>

#define heartBeatInterval = 5000;

WiFly wifly;

/* Change these to match your WiFi network */
//const char mySSID[] = "myssid";
//const char myPassword[] = "my-wpa-password";

//Function Prototypes
void sendIndex();
void sendGreeting(char *name);
void send404();
void joinWifi();
void processServer();
void processClient();
void connectToSever();

char buf[80];
//char scanList[350];
char network[25];
char password[25];
boolean isServer = true;
char MAC[18];

int _red = 255;
int _green = 255;
int _blue = 255;
int _blinkMe = 0;
//without transistors
//const int redLED = 11;
//const int greenLED = 10;
//const int blueLED = 9;
//with transistors
const int redLED = 9;
const int greenLED = 13;
const int blueLED = 10;

boolean sink = false;

//Button button = Button(8, BUTTON_PULLUP_INTERNAL, true, 50);
const int resetButton = 7;
const int resetPin = 11;

void setup()
{
  //colorLED(255,255,255);
  fadeOn();
  pinMode(resetButton, INPUT);
  pinMode(resetPin,OUTPUT);
  digitalWrite(resetButton, HIGH);
  digitalWrite(resetPin, HIGH);  
//  //Serial.begin(115200);
//  while(!//Serial){
//    ;
//  }
//  //Serial.println(F("Starting"));
//  //Serial.print(F("Free memory: "));
//  //Serial.println(wifly.getFreeMemory(),DEC);
  Serial1.begin(9600);
  if (!wifly.begin(&Serial1)) {
    ////Serial.println(F("Failed to start wifly"));
    wifly.terminal();
  }

  wifly.setBroadcastInterval(0);	// Turn off UPD broadcast


  //wifly.terminal();
  if(digitalRead(resetButton) == LOW){
    //Serial.println("RESET");
    isServer = true;
  } else{
    //EEPROM.write(0, 1);
    isServer = EEPROM.read(0);
    //isServer = true;
  }
  //Serial.print(F("MAC: "));
  //wifly.flush();
  //wifly.flushRx();
  wifly.getMAC(MAC, sizeof(MAC));
  //Serial.println(wifly.getMAC(MAC, sizeof(MAC)));
  ////Serial.print(F("IP: "));
  ////Serial.println(wifly.getIP(buf, sizeof(buf)));

  wifly.setDeviceID("Visualight");

  if (wifly.isConnected()) {
    //Serial.println(F("Old connection active. Closing"));
    wifly.close();
  }


  wifly.setProtocol(WIFLY_PROTOCOL_TCP);
  if (wifly.getPort() != 80) {
    wifly.setPort(80);
    /* local port does not take effect until the WiFly has rebooted (2.32) */
    wifly.save();
    //Serial.println(F("Set port to 80, rebooting to make it work"));
    //wifly.reboot();
    //delay(3000);
  }
  //Serial.println(F("Ready"));
  

  if(isServer){
    /* Create AP*/
    //Serial.println(F("Creating AP"));
    wifly.createAP("Visualight", "10 i");
    EEPROM.write(0, 1);
    colorLED(255,0,0);
    //    while(wifly.getNumNetworks()== 0){
    //      delay(1500);
    //    }
    ////Serial.print(F("Networks: "));
    ////Serial.println(wifly.getNumNetworks());

    //scanList = wifly.getScanNew(buf,sizeof(buf));
    ////Serial.println(wifly.getScanNew(scanList,sizeof(scanList)));
  }
  else{
    //Serial.println(F("Already Configured"));
    while (!wifly.isAssociated()) {
      //Serial.println(F("Joining"));
      wifly.join();
      delay(1000);
    }
    isServer = false;
    connectToServer();
    //Already Joined
  }
}
uint32_t connectTime = 0;
void loop()
{
  processButton(resetButton, 5000);
  //button.process();
  if(isServer){
    processServer();
  }
  else{
    processClient();
  }
}











