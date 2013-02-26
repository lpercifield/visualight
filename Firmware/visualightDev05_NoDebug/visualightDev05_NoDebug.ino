/*
 * WiFlyHQ Example httpserver.ino
 *
 * This sketch implements a simple Web server that waits for requests
 * and serves up a small form asking for a username, then when the
 * client posts that form the server sends a greeting page with the
 * user's name and an analog reading.
 *
 * This sketch is released to the public domain.
 *
 */

/* Notes:
 * Uses chunked message bodies to work around a problem where
 * the WiFly will not handle the close() of a client initiated
 * TCP connection. It fails to send the FIN to the client.
 * (WiFly RN-XV Firmware version 2.32).
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

//#include <Software//Serial.h>
//SoftwareSerial wifiSerial(8,9);

//#include <AltSoft//Serial.h>
//AltSoftSerial wifiSerial(8,9);

WiFly wifly;

/* Change these to match your WiFi network */
//const char mySSID[] = "myssid";
//const char myPassword[] = "my-wpa-password";

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
const int redLED = 13;
const int greenLED = 9;
const int blueLED = 10;

boolean sink = false;

//Button button = Button(8, BUTTON_PULLUP_INTERNAL, true, 50);
const int resetButton = 7;

void setup()
{
  //colorLED(255,255,255);
  fadeOn();
  pinMode(resetButton, INPUT);
  digitalWrite(resetButton, HIGH);
  //Serial.begin(115200);
//  while(!Serial){
//    ;
//  }
  //Serial.println(F("Starting"));
  //Serial.print(F("Free memory: "));
  //Serial.println(wifly.getFreeMemory(),DEC);
  Serial1.begin(9600);
  if (!wifly.begin(&Serial1, &Serial)) {
    //Serial.println(F("Failed to start wifly"));
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
  //MAC = wifly.getMAC(buf, sizeof(buf));
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

void processClient(){
  ////Serial.println("Process Client");
  //delay(100);
  int available;

  if (wifly.isConnected() == false) {
    //Serial.println("Not Connected in loop");
    connectToServer();
  } 
  else {
    available = wifly.available();
    if (available < 0) {
      //Serial.println(F("Disconnected"));
      wifly.close();
    } 
    else if (available > 1) {
      //Print incoming data...
      if(wifly.read() == 120){
        ////Serial.print(wifly.read());
        connectTime = millis();
        _red = wifly.parseInt();
        _green = wifly.parseInt();
        _blue = wifly.parseInt();
        _blinkMe = wifly.parseInt();
        colorLED(_red,_green,_blue);
        //wifly.write('x');
        ////Serial.println("data");
      }
      //      //Serial.print(_red);
      //      //Serial.print(",");
      //      //Serial.print(_green);
      //      //Serial.print(",");
      //      //Serial.print(_blue);
      //      //Serial.print(",");
      //      //Serial.println(_blinkMe);
      ////Serial.write(wifly.read());
    } 
    else {
      //DO Other Stuff HERE
      ////Serial.println("Here");
      //delay(50);
      //      if ((millis() - connectTime) > 30000) {
      //        //Serial.println("Disconnecting");
      //        wifly.close();
      //      }
      if (wifly.isConnected() == false) {
        //Serial.println("Not Connected in loop");
        connectToServer();
      } 
    }

    /* Send data from the serial monitor to the TCP server */
    //    if (//Serial.available()) {
    //      wifly.write(//Serial.read());
    //    }
  }
}

void processServer(){
  if (wifly.available() > 0) {

    /* See if there is a request */
    if (wifly.gets(buf, sizeof(buf))) {
      //if (strncmp_P(buf, PSTR("GET / "), 6) == 0) {
      if (strstr_P(buf, PSTR("GET /mac")) > 0) {
        /* GET request */
        //Serial.println(F("Got GET request"));
        while (wifly.gets(buf, sizeof(buf)) > 0) {
          /* Skip rest of request */
        }
        //int numNetworks = wifly.getNumNetworks();

        sendMac();
        wifly.flushRx();		// discard rest of input
        //Serial.println(F("Sent Mac address"));
        //wifly.flush();
        wifly.close();
      } 
      else if (strstr_P(buf, PSTR("GET / ")) > 0) {
        /* GET request */
        //Serial.println(F("Got GET request"));
        while (wifly.gets(buf, sizeof(buf)) > 0) {
          /* Skip rest of request */
        }
        //int numNetworks = wifly.getNumNetworks();

        sendIndex();
        wifly.flushRx();		// discard rest of input
        //Serial.println(F("Sent index page"));
        //wifly.flush();
        wifly.close();
      } 
      //else if (strncmp_P(buf, PSTR("POST"), 4) == 0) {
      else if (strstr_P(buf, PSTR("POST")) > 0) {
        /* Form POST */

        //Serial.println(F("Got POST"));

        /* Get posted field value */
        if (wifly.match(F("network="))) {
          wifly.getsTerm(network, sizeof(network),'&');
          replaceAll(network,"+","$");
          if (wifly.match(F("password="))) {
            wifly.gets(password, sizeof(password));
            replaceAll(password,"+","$");
          }
          wifly.flushRx();		// discard rest of input
          sendGreeting(network);
          //Serial.print(F("Sent greeting page - Network: "));
          //Serial.print(network);
          //Serial.print(F(" Password: "));
          //Serial.println(password);
          wifly.flushRx();
          //wifly.flush();
          //wifly.close(); 
          joinWifi();

        }
      } 
      else {
        /* Unexpected request */
        //Serial.print(F("Unexpected: "));
        //Serial.println(buf);
        delay(100);
        wifly.flushRx();		// discard rest of input
        //Serial.println(F("Sending 404"));
        send404();
      }
    }
  }
}

void joinWifi(){
  /* Setup the WiFly to connect to a wifi network */
  wifly.leave();
  //if (!wifly.isAssociated()) {

  //wifly.startCommand();
  //wifly.setSpaceReplace('+');
  wifly.enableDHCP();
  //wifly.setDHCP(WIFLY_DHCP_MODE_ON);
  wifly.setJoin(WIFLY_WLAN_JOIN_AUTO);
  wifly.setChannel("0");
  wifly.setSSID(network);
  wifly.setPassphrase(password);
  //wifly.join();


  //wifly.setIpProtocol(WIFLY_PROTOCOL_TCP);
  wifly.save();
  //wifly.finishCommand();
  wifly.reboot();
  delay(3000);

  //}

  if(!wifly.isAssociated()){
    //Serial.println(F("Joining network"));
    if (wifly.join()) {
      //Serial.println(F("Joined wifi network"));
      connectToServer();
    } 
    else {
      //Serial.println(F("Failed to join wifi network"));
      delay(1000);
      joinWifi();
      //TODO: Reboot count and reset to AP after count expires
    }
  }
  else{
    //Serial.println(F("Already Joined!"));
    connectToServer();
  }
}

void connectToServer(){
  wifly.flushRx();
  //MAC = wifly.getMAC(buf, sizeof(buf));
  if (wifly.isConnected()) {
    //Serial.println("Old connection active. Closing");
    wifly.close();
  }
  //Serial.println("Connecting");
  if (wifly.open("dev.visualight.org",5001)) {
    colorLED(255,255,255);
    //Serial.println("Connected: ");
    //Serial.print(F("Free memory: "));
    //Serial.println(wifly.getFreeMemory(),DEC);
    //Serial.flush();
    Serial1.flush();
    //Serial.println(MAC);
    //wifly.flush();
    wifly.write(MAC);
    connectTime = millis();
  } 
  else {
    //Serial.println("Failed to open");
    delay(1000);
    connectToServer();
  }
  if(isServer){
    //Serial.println(F("Client Mode"));
    EEPROM.write(0, 0); 
    isServer = false;
    colorLED(0,0,255);
  }

}

void colorLED(int red,int green,int blue){
  if(sink){
    red = 200-red;
    green = 200-green;
    blue = 200-blue;
  }
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










