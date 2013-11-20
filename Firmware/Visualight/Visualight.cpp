/*
* VISUALIGHT ARDUINO LIBRARY
*
*
*
*/

/* SET TO 1 TO DEBUG OVER SERIAL MONITOR
 if set to 1, board will wait for serial  
 monitor to be opened before executing any code */
#define DEBUG 1 //SET TO 0 for normal operation

#if DEBUG
  #define VPRINT(item) Serial.print(item)
  #define VPRINTLN(item) Serial.println(item)
#else
  #define VPRINT(item)
  #define VPRINTLN(item)
#endif

#if (ARDUINO >= 100)
   #include "Arduino.h"
#else
    #include <avr/io.h>
    #include "WProgram.h"
#endif

#include "Visualight.h"

void* pt2Object; //

Visualight::Visualight(){

	_red = 255;
	_green = 255;
	_blue = 255;
  _white = 255;
  _blinkType = 0;
  _frequency = 0;
  alerting = false;
  alertBeginTimeStamp = 0;
  blinkState = 100;

	connectTime = 0;
  lastHeartbeat = 0;
	_debug = false;
	resetButtonState = 1;

	isServer = true;
  reconnectCount = 0;

  password[0] = '0';
  network[0] = '0';
  security[0] = '0';  
}

void Visualight::setVerbose(boolean set){
	if(set) _debug = true;
	else _debug = false;
  delay(50);
}

boolean Visualight::factoryRestore(){ 
  pinMode(resetButton, INPUT);
  pinMode(resetPin,OUTPUT);
  digitalWrite(resetButton, HIGH);
  digitalWrite(resetPin, HIGH);  
  pinMode(_red,OUTPUT);
  pinMode(_green, OUTPUT);
  pinMode(_blue, OUTPUT);
  
  #ifdef DEBUG
    Serial.begin(9600);
    while(!Serial){
      ;
    }
  #endif
  colorLED(255, 0, 0,0);

  Serial1.begin(9600);
  if (!wifly.begin(&Serial1,&Serial)) {
    VPRINTLN(F("Failed to start wifly"));
  }

  // FACTORY RESTORE WIFLY UNIT
  if(wifly.factoryRestore()){
    wifly.setDeviceID("WiFly");
    wifly.save();
    VPRINTLN(F("WiFly Factory Restored. Rebooting.."));
    wifly.reboot();
    //reset visualight eeprom
    EEPROM.write(0, 1); 
    VPRINTLN(F("Visualight Factory Reset Complete !"));

    setAlert(0, 10000, 1, 0, 255, 0, 0);

    // alertBeginTimeStamp = millis();
    // _blinkType = 0;
    // _frequency = 1;
    // _red = _blue = 0;
    // _green = 255;
    // _durationTime = 10000;
    // alerting = true;
    return true;
  } else {
    VPRINTLN(F("Failed to factoryRestore wifly"));
    return false;
  }
}

/**********************************************************************************/
//--------------------------------- SETUP & UPDATE -------------------------------//
/**********************************************************************************/

void Visualight::update(){
	if(isServer){
    	processServer();
  	}
  	else{
    	processClient();
  	}
  	processButton(); //TODO: test to see how much blockage this has...
    if(alerting && (millis() % 5)==0) alert();
}

void Visualight::setup(char* _URL, uint16_t _PORT){
  VPRINTLN(F("-SETUP-"));
  URL = _URL;
  PORT = _PORT;
	//colorLED(255,255,255);
	fadeOn();
	pinMode(resetButton, INPUT);
	pinMode(resetPin,OUTPUT);
	digitalWrite(resetButton, HIGH);
	digitalWrite(resetPin, HIGH);  
	attachInterrupt(4, processButton, CHANGE);
  #ifdef DEBUG
    Serial.begin(9600);
    while(!Serial){
      ;
    }
  #endif
	VPRINTLN(F("Starting"));
	VPRINT(F("Free memory: "));
  int freeMem = wifly.getFreeMemory();
	VPRINTLN(freeMem);
	Serial1.begin(9600);
	if (!wifly.begin(&Serial1,&Serial)) {
		VPRINTLN(F("Failed to start wifly"));
		//RESET WIFI MODULE -- Toggle reset pin
	}

	wifly.getDeviceID(devID,sizeof(devID));
	if(strcmp(devID, "Visualight")==0){
		VPRINTLN(F("ID SET"));
	}
	else{
		VPRINTLN(F("ID NOT SET"));
    EEPROM.write(0,1);
		configureWifi();
	}
	//wifly.terminal();
	isServer = EEPROM.read(0);

	wifly.getMAC(MAC, sizeof(MAC));
	VPRINT(F("MAC: "));
	VPRINTLN(MAC);
	VPRINT(F("IP: "));
	VPRINTLN(wifly.getIP(buf, sizeof(buf)));

//	if (wifly.getPort() != 80) {
//		wifly.setPort(80);
		/* local port does not take effect until the WiFly has rebooted (2.32) */
//		wifly.save();
//		VPRINTLN(F("Set port to 80"));
			//wifly.reboot();
//	}
	VPRINTLN(F("Ready"));

	if(isServer){
		/* Create AP*/
		VPRINTLN(F("Creating AP"));
    //colorLED(0,0,255,255);
    setAlert(0, 999999, 1, 0, 0, 255, 0);
		VPRINTLN(F("Create server"));
		wifly.setSoftAP();
		EEPROM.write(0, 1);
	}
	else{
		VPRINTLN(F("Already Configured"));
		//isServer = false;
		if(!connectToServer()){
      reconnectCount++;
    }
	}
}

/**********************************************************************************/
//-------------------------- VISUALIGHT-AS-CLIENT METHODS ------------------------//
/**********************************************************************************/

void Visualight::configureWifi(){
  VPRINTLN(F("-CONFIGUREWIFI-"));
  wifly.factoryRestore();
  wifly.reboot();
  delay(500);
  wifly.init();
  wifly.setBroadcastInterval(0);  // Turn off UPD broadcast
  wifly.setDeviceID("Visualight");
  wifly.setProtocol(WIFLY_PROTOCOL_TCP);
  wifly.enableDHCP();
  wifly.setChannel("0");
  wifly.setPort(80);
  /*** disables WiFly GREEN and RED LEDs ***/
  //wifly.setIOFunc(5); // requires a save and reboot after.
  wifly.save();
  wifly.reboot();
}

void Visualight::wifiReset(){
  wifly.close();
  VPRINTLN(F("-WIFIRESET-"));
  //colorLED(0,0,255,0);
  setAlert(0, 10000, 1, 0, 0, 255, 0);
  isServer = true;
  EEPROM.write(0, 1);
  wifly.reboot();
  wifly.setSoftAP();
}


void Visualight::joinWifi(){
  VPRINTLN(F("-JOINWIFI-"));
  /* Setup the WiFly to connect to a wifi network */

  VPRINT("network: ");
  VPRINTLN(network);
  VPRINT("password: ");
  VPRINTLN(password);
  VPRINT("security: ");
  VPRINTLN(security);

  wifly.reboot();
  wifly.setSSID(network);
  wifly.setAuth(0);

  if (security[0] == '1'){ //WPA2
    VPRINTLN(F("type: WPA2"));
    wifly.setPassphrase(password);
  } 

  else if (security[0] == '2'){
    VPRINTLN(F("type: WEP-128"));
    wifly.setKey(password);
  }

  else if (security[0] == '3'){
    VPRINTLN(F("type: OPEN"));
    // no setKey / passphrase
  }
  else if(security[0] == '4'){ //WEP-64
   VPRINTLN(F("CONFIGURE WEP-64"));
   wifly.setAuth(8);
   wifly.setKey(password);
 }
  else {
    VPRINT(F("type UNKNOWN: "));
    VPRINTLN(security[0]);
  }
  
  wifly.setJoin(WIFLY_WLAN_JOIN_AUTO);
  wifly.save();
  //wifly.finishCommand();
  wifly.reboot();

  if(!wifly.isAssociated()){ //-- not currently on a wifi network
    VPRINTLN(F("Joining network"));
    if (wifly.join()) { //-- joined
      VPRINTLN(F("Joined wifi network"));
      if(!connectToServer()){
        reconnectCount++;
      }
    } 
    else { //-- not able to join wifi network
      VPRINTLN(F("Failed to join wifi network"));
      delay(1000);
      for (int i=0; i<5; i++){
        digitalWrite(_red, HIGH);
        delay(100);
        digitalWrite(_red, LOW);
        delay(100);
      }
      reconnectCount++;
      if(reconnectCount > 2){
        update();
      }
      else joinWifi();
    }
  }
  else{  //-- associated  with wifi network, continue on as normal
    if(isServer){
      VPRINTLN(F("Switching to Client Mode"));
      EEPROM.write(0, 0); 
      alerting = false;
      isServer = false;
    }
    if(!connectToServer()){
      reconnectCount++;
    }
  }
}

void Visualight::sendHeartbeat(){
  VPRINTLN(F("-SENDHEARTBEAT-"));
  wifly.print("{\"mac\":\"");
  wifly.print(MAC);
  wifly.println("\",\"h\":\"h\"}");
  lastHeartbeat = millis();
  VPRINT(F("Free memory: "));
  int freeMem = wifly.getFreeMemory();
  VPRINTLN(freeMem);
}

boolean Visualight::connectToServer(){
  VPRINTLN(F("-CONNECTTOSERVER-"));
  // wifly.reboot();
  // delay(1000);
  if(reconnectCount > 4){
    VPRINTLN(F("rebooting wifly..."));
    wifly.reboot();
    delay(1000);
    reconnectCount = 0;
  }
  wifly.flushRx();
  if(!wifly.isAssociated()) { //
      VPRINTLN(F("Joining"));
      if(!wifly.join()){
        VPRINTLN(F("Join Failed"));
        VPRINTLN(wifly.isAssociated());
        return false;
      }
    }
    else{
      VPRINTLN(F("Already Assoc"));
    }
  VPRINTLN(F("Connecting"));

  if (wifly.open(URL, PORT)) {

    VPRINTLN(F("Connected"));

    //wifly.write(MAC); //how did this ever work?
    wifly.print("{\"mac\":\"");
    wifly.print(MAC);
    wifly.println("\"}");

    //reconnect = false;
    connectTime = millis();
    lastHeartbeat = millis();
    return true;
  } 
  else {
    VPRINTLN(F("Failed to open"));
    return false;
  }
}

void Visualight::processClient(){
  int available;

  if(millis()-lastHeartbeat > heartBeatInterval && reconnectCount == 0){
    sendHeartbeat();
  }

  if(millis()-connectTime > connectServerInterval){
    VPRINTLN(F("reconnect from timeout"));
    //reconnect = true;
    //connectTime = millis();
    if(!connectToServer()){
      reconnectCount++;
    }
  }
  else {
    available = wifly.available();

    if (available < 0) {
      //if(_debug)Serial.println(F("reconnect from available()"));
      if(!connectToServer()){
        reconnectCount++;
      }
    }
    else if(available > 0){
      connectTime = millis();
      char thisChar;
      thisChar = wifly.read();
      if( thisChar == 97){
        wifly.readBytesUntil('x', serBuf, 31);
        int duration;
        int red, green, blue, white;

        sscanf(serBuf,"%i,%i,%i,%i,%i,%i,%i",&red,&green,&blue,&white,&duration,&_frequency,&_blinkType); // INDIGO v0.1.1
        //sscanf(serBuf,"%i,%i,%i,%i,%i",&_red,&_green,&_blue,&_white,&_blinkMe); // PURPLE v0.1.0
        //if(_debug){
          // Serial.print("numBytes: ");
          // Serial.println(numBytes);
          // Serial.print("buf: ");
          //Serial.println(serBuf);
          //delay(1);
        //}
        if(duration > 0){ //we are STARTING AN ALERT
          _Ared = red; //"Alertred"
          _Agreen = green;
          _Ablue = blue;
          _Awhite = white;

          _durationTime = duration*1000; 
          _frequency = (_frequency+1); //* 100; //get the right freq out //100 - 1000
          //blinkState = 100;
          alertBeginTimeStamp = millis();
          alerting = true;
          alert();
        } 

        else { //simple set color
          colorLED(red, green, blue, white); 
          setStartColor(red, green, blue, white); 
          VPRINTLN(thisChar);
          delay(5);
        } 
        memset(serBuf,0,31);
      }
    }
  }
}

/**********************************************************************************/
//------------------------------ BUTTON & LED METHODS ----------------------------//
/**********************************************************************************/

void Visualight::processButton(){
  //resetButtonState = digitalRead(resetButton);
  if(digitalRead(resetButton) == LOW){
    Visualight* mySelf = (Visualight*) pt2Object;
    mySelf->wifiReset();
  }
}

void Visualight::colorLED(int red, int green, int blue, int white){
  analogWrite(redLED, red);
  analogWrite(greenLED, green);
  analogWrite(blueLED, blue);
  analogWrite(whiteLED, white);
}

void Visualight::fadeOn(){ // turns all LEDs on to full white
  for(int fadeValue = 1; fadeValue <=100; fadeValue +=5) { 
    colorLED((fadeValue*_red)/100, (fadeValue*_green)/100, (fadeValue*_blue)/100, (fadeValue*_white)/100);
    delay(10);            
  }
}

// color of LED on start up, while waiting for instruction from server
void Visualight::setStartColor(uint8_t _r, uint8_t _g, uint8_t _b, uint8_t _w){ 
  _red = _r;
  _green = _g;
  _blue = _b;
  _white = _w;
}

void Visualight::setAlert(int blinkType, long durationTime, int frequency, int r, int g, int b, int w){
  _Ared = r;
  _Agreen = g;
  _Ablue = b;
  _Awhite = w;
  _blinkType = blinkType;
  _durationTime = durationTime;
  _frequency = frequency;
  alertBeginTimeStamp = millis();
  alerting = true;
  alert();
}

void Visualight::alert(){

  long elapsedBlinkTime = millis(); 

  if ( elapsedBlinkTime - alertBeginTimeStamp >= _durationTime){
    alerting = false;
    colorLED(_red, _green, _blue, _white);
    blinkState=100;
    //return;
  } 

  else {  // update the current blink
    blinkState -= _frequency;
		if (blinkState <= 1 || blinkState >= 100) _frequency *= -1;
    
    switch(_blinkType){
      case 0: //FADING blink
        colorLED( int((blinkState*_Ared)/100), int((blinkState*_Agreen)/100), int((blinkState*_Ablue)/100), int((blinkState*_Awhite)/100));
				break;

      case 1: //HARD blink
        if(_frequency > 0 ){
          colorLED(_Ared, _Agreen, _Ablue, _Awhite);
        } else {
          colorLED(0, 0, 0, 0);
        }
				break;

      default:
      	break;
    }
  }
  delay(1);
}


/**********************************************************************************/
//------------------------- VISUALIGHT-AS-SERVER METHODS -------------------------//
/**********************************************************************************/

void Visualight::processServer() {
  if (wifly.available() > 0) { // check for data from wifly


    if (wifly.gets(buf, sizeof(buf))) { /* See if there is a request */

      if (strstr_P(buf, PSTR("GET /mac")) > 0) { /* GET request */
        VPRINTLN(F("Got GET MAC request"));
        while (wifly.gets(buf, sizeof(buf)) > 0) { /* Skip rest of request */
        }
        //int numNetworks = wifly.getNumNetworks();
        sendMac();
        wifly.flushRx();    // discard rest of input
        VPRINTLN(F("Sent Mac address"));
        wifly.close();
      } 
      
      else if (strstr_P(buf, PSTR("GET / ")) > 0) { // GET request
        VPRINTLN(F("Got GET request"));
        while (wifly.gets(buf, sizeof(buf)) > 0) { /* Skip rest of request */
        }
        //int numNetworks = wifly.getNumNetworks();
        wifly.flushRx();    // discard rest of input
        sendIndex();
        VPRINTLN(F("Sent index page"));
        wifly.close();
      }
      
      else if (strstr_P(buf, PSTR("POST")) > 0) { /* Form POST */
         
        VPRINTLN(F("Got POST"));

        // while(1) {
        //     Serial.print(wifly.read());
        // }
        // while (wifly.gets(buf, sizeof(buf)) > 0) { /* Skip rest of request */
        //   Serial.println(buf);
        //   while (wifly.gets(buf, sizeof(buf)) > 0) { /* Skip rest of request */
        //     Serial.println(buf);
        //   }
        // }

        if (wifly.match(F("net="))) { /* Get posted field value */
          //Serial.println(buf);

          wifly.getsTerm(network, sizeof(network),'&');
          replaceAll(network,"+","$");
          VPRINTLN(F("Got network: "));
          VPRINTLN(network);

            if (wifly.match(F("pas="))) {
              wifly.getsTerm(password, sizeof(password),'&');
              replaceAll(password,"+","$");
              //wifly.gets(security, 1); //no need for sizeof() -- it's a 1 or 2
              VPRINTLN(F("Got password: "));
              VPRINTLN(password);

            if (wifly.match(F("sec="))) {
              wifly.gets(security, sizeof(security));
              
              VPRINTLN(F("Got security: "));
              VPRINTLN(security);

            }
          }
          
          wifly.flushRx();    // discard rest of input
          VPRINT(F("Sending greeting page: "));
          sendGreeting(network); //send greeting back
          delay(500);
          sendGreeting(network); //send a second time *just in case*
          delay(500);
          wifly.flushRx();
          joinWifi();
        }
      } 
      else { /* Unexpected request */
        delay(100);
        wifly.flushRx();    // discard rest of input
        VPRINTLN(F("Sending 404"));
        send404();
      }
    }
  }
}

void Visualight::sendMac() {
  /* Send the header direclty with print */
  wifly.println(F("HTTP/1.1 200 OK"));
  wifly.println(F("Connection: close"));
  wifly.println(F("Content-Type: application/json"));
  wifly.println(F("Transfer-Encoding: chunked"));
  wifly.println(F("Access-Control-Allow-Origin: *"));
  wifly.println();

  /* Send the body using the chunked protocol so the client knows when
   * the message is finished.
   * Note: we're not simply doing a close() because in version 2.32
   * firmware the close() does not work for client TCP streams.
   */
  wifly.sendChunk(F("{\"mac\":\""));
  wifly.sendChunk(MAC);
  wifly.sendChunk(F("\"}"));
  wifly.sendChunkln();
  wifly.sendChunkln();
  // enctype=\"text/plain\"
}
/** Send an index HTML page with an input box for a network name and password */
void Visualight::sendIndex() {
  /* Send the header direclty with print */
  wifly.println(F("HTTP/1.1 200 OK"));
  wifly.println(F("Connection: close"));
  wifly.println(F("Content-Type: text/html"));
  wifly.println(F("Transfer-Encoding: chunked"));
  wifly.println(F("Access-Control-Allow-Origin: *"));
  wifly.println();

  /* Send the body using the chunked protocol so the client knows when
   * the message is finished.
   * Note: we're not simply doing a close() because in version 2.32
   * firmware the close() does not work for client TCP streams.
   */
  wifly.sendChunkln(F("<html>"));
  wifly.sendChunkln(F("<head><title>Visualight Setup</title>"));
  wifly.sendChunkln(F("<style>body{width:100%;margin:0;padding:0;background:#999;}"));
  wifly.sendChunkln(F("h1,h3{margin:2% auto;width:80%;}div{margin: 10% auto 0;width:60%;padding:4%;background:#f9f9f9;}"));
  wifly.sendChunkln(F("input{display:block;width:80%;margin:4% auto;font-size:1.2em;padding:1%;background:#fff;}"));
  wifly.sendChunkln(F("input[type='radio']{display:inline; width:30px}"));
  wifly.sendChunkln(F("select{display:block;width:80%;margin:4% auto;height:40px;font-size:1em;background:#fff;}"));
  wifly.sendChunkln(F("input[type=\"submit\"]{width:30%;padding:1%;background:#222;color:#ddd;}form{width:90%;margin:0 auto;}"));
  wifly.sendChunkln(F("</style></head>"));
  wifly.sendChunkln(F("<body><div>"));
  wifly.sendChunkln(F("<form name=\"input\" action=\"/\" method=\"post\">"));
  wifly.sendChunkln(F("<h1>Visualight</h1>"));
  wifly.sendChunkln(F("<h3>We&rsquo;ll need a little data to get started</h3>"));
  wifly.sendChunkln(F("<input type=\"text\" name=\"net\" placeholder=\"YOUR WIFI SSID\" />"));
  wifly.sendChunkln(F("<input type=\"text\" name=\"pas\" placeholder=\"YOUR WIFI PASS\" />"));
  wifly.sendChunkln(F("<label style='margin-left: 80px;'> WPA/WPA2 <input type=\"radio\" name=\"sec\" value=\"1\" checked /></label>"));
  wifly.sendChunkln(F("<label> WEP-128 <input type=\"radio\" name=\"sec\" value=\"2\" /></label>"));
  wifly.sendChunkln(F("<label> WEP-64 <input type=\"radio\" name=\"sec\" value=\"4\" /></label>"));
  wifly.sendChunkln(F("<label> Open <input type=\"radio\" name=\"sec\" value=\"3\" /></label>"));

  wifly.sendChunkln(F("<input type=\"submit\" value=\"Submit\" />"));
  wifly.sendChunkln(F("</form></div>")); 
  wifly.sendChunkln(F("</body></html>"));
  wifly.sendChunkln();
  wifly.sendChunkln();
  
}

/** Send a greeting HTML page with the user's name and an analog reading */
void Visualight::sendGreeting(char *name) {
  /* Send the header directly with print */
  wifly.println(F("HTTP/1.1 200 OK"));
  wifly.println(F("Connection: close"));
  wifly.println(F("Content-Type: text/html"));
  wifly.println(F("Transfer-Encoding: chunked"));
  wifly.println(F("Access-Control-Allow-Origin: *"));
  // wifly.println("OK");
  // wifly.println();
  wifly.println();



  /* Send the body using the chunked protocol so the client knows when
   * the message is finished.
   */
  wifly.sendChunkln(F("<html>"));
  wifly.sendChunkln(F("<title>Visualight Setup</title>"));
  // No newlines on the next parts 
  wifly.sendChunk(F("<h1><p>Hello "));
  wifly.sendChunk(name);
  /* Finish the paragraph and heading */
  wifly.sendChunkln(F("</p></h1>"));
  wifly.sendChunkln(F("</html>"));
  wifly.sendChunkln();
  wifly.sendChunkln();
}

void Visualight::send404() { /** Send a 404 error */
  wifly.println(F("HTTP/1.1 404 Not Found"));
  wifly.println(F("Connection: close"));
  wifly.println(F("Content-Type: text/html"));
  wifly.println(F("Transfer-Encoding: chunked"));
  wifly.println(F("Access-Control-Allow-Origin: *"));
  wifly.println();
  wifly.sendChunkln(F("<html><head>"));
  wifly.sendChunkln(F("<title>404 Not Found</title>"));
  wifly.sendChunkln(F("</head><body>"));
  wifly.sendChunkln(F("<h1>Not Found</h1>"));
  wifly.sendChunkln(F("<hr>"));
  wifly.sendChunkln(F("</body></html>"));
  wifly.sendChunkln();
  wifly.sendChunkln();
}

void Visualight::replaceAll(char *buf_,const char *find_,const char *replace_) {
  char *pos;
  int replen,findlen;

  findlen=strlen(find_);
  replen=strlen(replace_);

  while((pos=strstr(buf_,find_))) {
    strncpy(pos,replace_,replen);
    strcpy(pos+replen,pos+findlen);
  }
}