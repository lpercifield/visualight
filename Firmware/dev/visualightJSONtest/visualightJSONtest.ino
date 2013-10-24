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


//#include <AltSoftSerial.h>
//AltSoftSerial wifiSerial(8,9);

WiFly wifly;

/* Change these to match your WiFi network */
const char mySSID[] = "867";
const char myPassword[] = "thisisthebestspace";

void send404();

char buf[80];
const int resetPin = 11;

void setup()
{
  pinMode(resetPin,OUTPUT);
  digitalWrite(resetPin, HIGH); 
  Serial.begin(115200);
  while(!Serial){
    ;
  }
  Serial.println(F("Starting"));
  Serial.print(F("Free memory: "));
  Serial.println(wifly.getFreeMemory(),DEC);

  Serial1.begin(9600);
  if (!wifly.begin(&Serial1, &Serial)) {
    Serial.println(F("Failed to start wifly"));
    wifly.terminal();
  }

  /* Join wifi network if not already associated */
  if (!wifly.isAssociated()) {
    /* Setup the WiFly to connect to a wifi network */
    Serial.println(F("Joining network"));
    wifly.setSSID(mySSID);
    wifly.setPassphrase(myPassword);
    wifly.enableDHCP();
    wifly.save();

    if (wifly.join()) {
      Serial.println(F("Joined wifi network"));
    } 
    else {
      Serial.println(F("Failed to join wifi network"));
      wifly.terminal();
    }
  } 
  else {
    Serial.println(F("Already joined network"));
  }

  wifly.setBroadcastInterval(0);	// Turn off UPD broadcast

  //wifly.terminal();

  Serial.print(F("MAC: "));
  Serial.println(wifly.getMAC(buf, sizeof(buf)));
  Serial.print(F("IP: "));
  Serial.println(wifly.getIP(buf, sizeof(buf)));

  wifly.setDeviceID("Wifly-WebServer");

  if (wifly.isConnected()) {
    Serial.println(F("Old connection active. Closing"));
    wifly.close();
  }

  wifly.setProtocol(WIFLY_PROTOCOL_TCP);
  if (wifly.getPort() != 80) {
    wifly.setPort(80);
    /* local port does not take effect until the WiFly has rebooted (2.32) */
    wifly.save();
    Serial.println(F("Set port to 80, rebooting to make it work"));
    wifly.reboot();
    delay(3000);
  }
  Serial.println(F("Ready"));
}

void loop()
{
  if (wifly.available() > 0) {

    /* See if there is a request */
    if (wifly.gets(buf, sizeof(buf))) {
      if (strncmp_P(buf, PSTR("PUT"), 3) == 0) {
        /* Form PUT */
        char on[6];
        int hue;
        int bri;
        Serial.println(F("Got PUT"));

        /* Get posted field value */
        if (wifly.match(F("\"hue\":"))) {
          hue = wifly.parseInt();
        }
        if (wifly.match(F("\"on\":"))) {
          wifly.getsTerm(on, sizeof(on),',');
        }
        if(wifly.match(F("\"bri\":"))){
          bri = wifly.parseInt();
        }
        wifly.flushRx();		// discard rest of input
        sendResponse(hue,on,bri);
        Serial.println(F("Sent response page"));
      }
    } 
    else {
      /* Unexpected request */
      Serial.print(F("Unexpected: "));
      Serial.println(buf);
      wifly.flushRx();		// discard rest of input
      Serial.println(F("Sending 404"));
      send404();
    }
  }

}


void sendResponse(int hue, char *on, int bri){
  /* Send the header directly with print */
  wifly.println(F("HTTP/1.1 200 OK"));
  //wifly.println(F("Connection: close"));
  wifly.println(F("Content-Type: text/html"));
  wifly.println(F("Transfer-Encoding: chunked"));
  wifly.println(F("Access-Control-Allow-Origin: *"));
  wifly.println();
  wifly.sendChunk(F("[{\"success\":{\"hue\":"));
  wifly.println(hue);
  wifly.sendChunk(F("}},"));
  wifly.sendChunk(F("{\"success\":{\"on\":"));
  wifly.sendChunk(on);
  wifly.sendChunk(F("}},"));
  wifly.sendChunk(F("{\"success\":{\"bri\":"));
  wifly.println(bri);
  wifly.sendChunk(F("}}]"));
  wifly.sendChunkln();
  wifly.sendChunkln();
}


/** Send a 404 error */
void send404()
{
  wifly.println(F("HTTP/1.1 404 Not Found"));
  wifly.println(F("Content-Type: text/html"));
  wifly.println(F("Transfer-Encoding: chunked"));
  wifly.println();
  wifly.sendChunkln(F("<html><head>"));
  wifly.sendChunkln(F("<title>404 Not Found</title>"));
  wifly.sendChunkln(F("</head><body>"));
  wifly.sendChunkln(F("<h1>Not Found</h1>"));
  wifly.sendChunkln(F("<hr>"));
  wifly.sendChunkln(F("</body></html>"));
  wifly.sendChunkln();
}


