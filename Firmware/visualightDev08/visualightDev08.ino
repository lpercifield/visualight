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

#define heartBeatInterval 25000
#define wifiCheckInterval 30000
#define connectServerInterval 10000

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
void processButton(int pin);

char buf[80];
//char scanList[350];
char network[25];
char password[25];
boolean isServer = true;
char MAC[18];
char devID[] = "Visualight";
long wifiTimer;
boolean sentHeartBeat;

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
const int blueComp = 1.2;

boolean sink = false;

//Button button = Button(8, BUTTON_PULLUP_INTERNAL, true, 50);
const int resetButton = 7;
const int resetPin = 11;

const boolean DEBUG = true;

void setup()
{
  //colorLED(255,255,255);
  fadeOn();
  pinMode(resetButton, INPUT);
  pinMode(resetPin,OUTPUT);
  digitalWrite(resetButton, HIGH);
  digitalWrite(resetPin, HIGH);  
  attachInterrupt(4, processButtonPress, CHANGE);
  if(DEBUG) Serial.begin(9600);
  if(DEBUG){
    while(!Serial){
      ;
    }
  }
  if(DEBUG) Serial.println(F("Starting"));
  if(DEBUG) Serial.print(F("Free memory: "));
  if(DEBUG) Serial.println(wifly.getFreeMemory(),DEC);
  Serial1.begin(9600);
  if (!wifly.begin(&Serial1,&Serial)) {
    if(DEBUG) Serial.println(F("Failed to start wifly"));
    //RESET WIFI MODULE -- Toggle reset pin
  }
  wifly.getDeviceID(devID,sizeof(devID));
  if(strcmp(devID, "Visualight")==0){
    if(DEBUG) if(DEBUG) Serial.println("SAME");
  }
  else{
    if(DEBUG) Serial.println("DIFF");
    configureWifi();
  }



  //wifly.terminal();
  if(digitalRead(resetButton) == LOW){ //TAKE OUT??
    //if(DEBUG) Serial.println("RESET");
    colorLED(255,0,0);
    isServer = true;
  } 
  else{
    //EEPROM.write(0, 1);

    isServer = EEPROM.read(0);
    //isServer = true;
  }
  
  //wifly.flush();
  //wifly.flushRx();
  wifly.getMAC(MAC, sizeof(MAC));
  if(DEBUG) Serial.print(F("MAC: "));
  if(DEBUG) Serial.println(MAC);
  if(DEBUG) Serial.print(F("IP: "));
  if(DEBUG) Serial.println(wifly.getIP(buf, sizeof(buf)));



  if (wifly.isConnected()) {// isConnected is a little wonky
    if(DEBUG) Serial.println(F("Old connection active. Closing"));
    wifly.close();
  }



  if (wifly.getPort() != 80) {
    wifly.setPort(80);
    /* local port does not take effect until the WiFly has rebooted (2.32) */
    wifly.save();
    if(DEBUG) Serial.println(F("Set port to 80"));
    //wifly.reboot();
    //delay(3000);
  }
  if(DEBUG) Serial.println(F("Ready"));


  if(isServer){
    /* Create AP*/
    if(DEBUG) Serial.println(F("Creating AP"));
    colorLED(0,0,255); // set led to blue for setup
    if(DEBUG) Serial.println("Create server");
    wifly.setSoftAP();
    EEPROM.write(0, 1);
    //    while(wifly.getNumNetworks()== 0){
    //      delay(1500);
    //    }
    ////if(DEBUG) Serial.print(F("Networks: "));
    ////if(DEBUG) Serial.println(wifly.getNumNetworks());

    //scanList = wifly.getScanNew(buf,sizeof(buf));
    ////if(DEBUG) Serial.println(wifly.getScanNew(scanList,sizeof(scanList)));
  }
  else{
    if(DEBUG) Serial.println(F("Already Configured"));

    //isServer = false;
    connectToServer();
    //Already Joined
  }
}
uint32_t connectTime = 0;
void loop()
{
  
  if(isServer){
    processServer();
  }
  else{
    processClient();
  }
  processButton(); // test to see if this is getting blocked somewhere...
}















