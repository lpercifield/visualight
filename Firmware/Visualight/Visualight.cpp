/*
* VISUALIGHT ARDUINO LIBRARY
*
*
*
*/
#if (ARDUINO >= 100)
   #include "Arduino.h"
#else
    #include <avr/io.h>
    #include "WProgram.h"
#endif

#include "Visualight.h"

Visualight::Visualight(){
	_red = 255;
	_green = 255;
	_blue = 255;
  _white = 255;
  _blinkType = 0;
  _frequency = 0;
  _duration = 1;
  alerting = false;
  alertBeginTimeStamp = 0;
  blinkState = 100;

	connectTime = 0;
  lastHeartbeat = 0;
	_debug = false;
	resetButtonState = 1;

	isServer = true;
  reconnect = false;
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
  if(_debug) Serial.begin(9600);
  if(_debug){
    while(!Serial){
      ;
    }
  }
  Serial1.begin(9600);
  if (!wifly.begin(&Serial1,&Serial)) {
    if(_debug) Serial.println(F("Failed to start wifly"));
  }
  // FACTORY RESTORE WIFLY UNIT
  if(wifly.factoryRestore()){
    wifly.setDeviceID("WiFly");
    wifly.save();
    if(_debug) Serial.println(F("WiFly Factory Restored. Rebooting.."));
    wifly.reboot();
    //reset visualight eeprom
    EEPROM.write(0, 1); 
    if(_debug) Serial.println(F("Visualight Factory Reset Complete."));
    return true;
  } else {
    if(_debug) Serial.println(F("Failed to factoryRestore wifly"));
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
      if(alerting && (millis() % 5)==0) alert();
  	}
  	processButton(); //TODO: test to see how much blockage this has...
}

void Visualight::setup(uint8_t _MODEL, char* _URL, uint16_t _PORT){
  if(_debug) Serial.println(F("-SETUP-"));
  MODEL = _MODEL;
  URL = _URL;
  PORT = _PORT;
	//colorLED(255,255,255);
	fadeOn();
	pinMode(resetButton, INPUT);
	pinMode(resetPin,OUTPUT);
	digitalWrite(resetButton, HIGH);
	digitalWrite(resetPin, HIGH);  
	//attachInterrupt(4, processButton, CHANGE);
	if(_debug) Serial.begin(9600);
		if(_debug){
		while(!Serial){
		;
		}
	}
	if(_debug) Serial.println(F("Starting"));
	if(_debug) Serial.print(F("Free memory: "));
	if(_debug) Serial.println(wifly.getFreeMemory(),DEC);
	Serial1.begin(9600);
	if (!wifly.begin(&Serial1,&Serial)) {
		if(_debug) Serial.println(F("Failed to start wifly"));
		//RESET WIFI MODULE -- Toggle reset pin
	}

	wifly.getDeviceID(devID,sizeof(devID));
	if(strcmp(devID, "Visualight")==0){
		if(_debug) Serial.println(F("ID SET"));
	}
	else{
		if(_debug) Serial.println(F("ID NOT SET"));
		configureWifi();
	}
	//wifly.terminal();
	isServer = EEPROM.read(0);

	wifly.getMAC(MAC, sizeof(MAC));
	if(_debug) Serial.print(F("MAC: "));
	if(_debug) Serial.println(MAC);
	if(_debug) Serial.print(F("IP: "));
	if(_debug) Serial.println(wifly.getIP(buf, sizeof(buf)));

//	if (wifly.getPort() != 80) {
//		wifly.setPort(80);
		/* local port does not take effect until the WiFly has rebooted (2.32) */
//		wifly.save();
//		if(_debug) Serial.println(F("Set port to 80"));
			//wifly.reboot();
//	}
	if(_debug) Serial.println(F("Ready"));

	if(isServer){
		/* Create AP*/
		if(_debug) Serial.println(F("Creating AP"));
    if (MODEL > 0) colorLED(0,0,255,255);
		else colorLED(0,0,255); // set led to blue for setup
		if(_debug) Serial.println(F("Create server"));
		wifly.setSoftAP();
		EEPROM.write(0, 1);
	}
	else{
		if(_debug) Serial.println(F("Already Configured"));
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
  if(_debug) Serial.println(F("-CONFIGUREWIFI-"));
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
  wifly.save();
  wifly.reboot();
}

void Visualight::wifiReset(){
  wifly.close();
  if(_debug) Serial.println(F("-WIFIRESET-"));
  if(MODEL>0) colorLED(0,0,255,0);
  else colorLED(0,0,255);
  isServer = true;
  EEPROM.write(0, 1);
  wifly.reboot();
  wifly.setSoftAP();
}


void Visualight::joinWifi(){
  if(_debug) Serial.println(F("-JOINWIFI-"));
  /* Setup the WiFly to connect to a wifi network */
  if(_debug) Serial.println(F(" - joinWifi() - "));

  if(_debug) Serial.print("network: ");
  if(_debug) Serial.println(network);
  if(_debug) Serial.print("password: ");
  if(_debug) Serial.println(password);
  if(_debug) Serial.print("security: ");
  if(_debug) Serial.println(security);

  wifly.reboot();
  wifly.setSSID(network);
  wifly.setAuth(0);

  if (security[0] == '1'){ //WPA2
    if(_debug) Serial.println(F("type: WPA2"));
    wifly.setPassphrase(password);
  } 

  else if (security[0] == '2'){
    if(_debug) Serial.println(F("type: WEP-128"));
    wifly.setKey(password);
  }

  else if (security[0] == '3'){
    if(_debug) Serial.println(F("type: OPEN"));
    // no setKey / passphrase
  }
  else if(security[0] == '4'){ //WEP-64
   if(_debug)Serial.print(F("CONFIGURE WEP-64: "));
   Serial.println(wifly.setAuth(8));
   wifly.setKey(password);
 }
  else {
    if(_debug) Serial.print(F("type UNKNOWN: "));
    if(_debug) Serial.println(security[0]);
  }
  
  wifly.setJoin(WIFLY_WLAN_JOIN_AUTO);
  wifly.save();
  //wifly.finishCommand();
  wifly.reboot();

  if(!wifly.isAssociated()){
    if(_debug) Serial.println(F("Joining network"));
    if (wifly.join()) {
      if(_debug) Serial.println(F("Joined wifi network"));
      if(!connectToServer()){
        reconnectCount++;
      }
    } 
    else {
      if(_debug) Serial.println(F("Failed to join wifi network"));
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

      //TODO: Reboot count and reset to AP after count expires
    }
  }
  else{
    //Serial.println(F("Already Joined!"));
    if(MODEL>0)colorLED(255,255,255,255);
    else colorLED(255,255,255);
    if(isServer){
      if(_debug) Serial.println(F("Switch to Client Mode"));
      EEPROM.write(0, 0); 
      isServer = false;
    }
    if(!connectToServer()){
      reconnectCount++;
    }
  }
}

void Visualight::sendHeartbeat(){
  if(_debug) Serial.println(F("-SENDHEARTBEAT-"));
  wifly.print("{\"mac\":\"");
  wifly.print(MAC);
  wifly.println("\",\"h\":\"h\"}");
  lastHeartbeat = millis();
  if(_debug) Serial.print(F("Free memory: "));
  if(_debug) Serial.println(wifly.getFreeMemory(),DEC);
}

boolean Visualight::connectToServer(){
  if(_debug) Serial.println(F("-CONNECTTOSERVER-"));
  // wifly.reboot();
  // delay(1000);
  if(reconnectCount > 4){
    if(_debug) Serial.println(F("rebooting wifly..."));
    wifly.reboot();
    delay(1000);
    reconnectCount = 0;
  }
  wifly.flushRx();
  if(!wifly.isAssociated()) { //
      if(_debug) Serial.println(F("Joining"));
      if(!wifly.join()){
        if(_debug) Serial.println(F("Join Failed"));
        if(_debug) Serial.println(wifly.isAssociated());
        return false;
      }
    }
    else{
      if(_debug) Serial.println(F("Already Assoc"));
    }
  if(_debug) Serial.println(F("Connecting"));

  if (wifly.open(URL, PORT)) {
    if(reconnect){
      if(MODEL>0)colorLED(_red,_green,_blue,_white); // RGBW
      else colorLED(_red,_green,_blue); // RGB
    }else{
      if(MODEL>0)colorLED(255,255,255,255); // white is connected
      else colorLED(255,255,255); // white is connected
    }
    if(_debug) Serial.println(F("Connected"));

    //wifly.write(MAC); //how did this ever work?
    wifly.print("{\"mac\":\"");
    wifly.print(MAC);
    wifly.println("\"}");

    reconnect = false;
    connectTime = millis();
    lastHeartbeat = millis();
    return true;
  } 
  else {
    if(_debug) Serial.println(F("Failed to open"));
    return false;
  }
}

void Visualight::processClient(){
  int available;

  if(millis()-lastHeartbeat > heartBeatInterval && reconnectCount == 0){
    sendHeartbeat();
  }

  if(millis()-connectTime > connectServerInterval){
    if(_debug) Serial.println(F("reconnect from timeout"));
    reconnect = true;
    //connectTime = millis();
    if(!connectToServer()){
      reconnectCount++;
    }
  }
  else {
    available = wifly.available();

    if (available < 0) {
      if(_debug)Serial.println(F("reconnect from available()"));
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
        sscanf(serBuf,"%i,%i,%i,%i,%i,%i,%i",&_red,&_green,&_blue,&_white,&_duration,&_frequency,&_blinkType); // INDIGO v0.1.1
        //sscanf(serBuf,"%i,%i,%i,%i,%i",&_red,&_green,&_blue,&_white,&_blinkMe); // PURPLE v0.1.0
        if(_debug){
          // Serial.print("numBytes: ");
          // Serial.println(numBytes);
          // Serial.print("buf: ");
          Serial.println(serBuf);
          delay(1);
        }
        if(_duration > 0){ //we are BLINKING
          //if(_debug)Serial.print(F("BLINK RECEIVED"));
          //Serial.println(F("BLINK RECEIVED"));
          _durationTime = _duration*1000;
          _frequency = (_frequency+1); //* 100; //get the right freq out //100 - 1000
          //blinkState = 100;
          alertBeginTimeStamp = millis();
          alerting = true;
          alert();
        } 

        else { //simple set color
          if(MODEL > 0) colorLED(_red, _green, _blue, _white); 
          else colorLED(_red,_green,_blue);
          if(_debug) Serial.println(thisChar);
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
  resetButtonState = digitalRead(resetButton);
  if(resetButtonState == LOW){
    if(_debug) Serial.println(F("RESET WIFI"));
    wifiReset();
  }
}

void Visualight::colorLED(int red, int green, int blue){
  // if(sink){ /* keep just in case for future */
  //   red = 255-red;
  //   green = 255-green;
  //   blue = 255-blue;
  //   white = 255-white;
  // }
  analogWrite(redLED, red);
  analogWrite(greenLED, green);
  analogWrite(blueLED, blue);
}

void Visualight::colorLED(int red, int green, int blue, int white){
	//Serial.println(green);
  analogWrite(redLED, red);
  analogWrite(greenLED, green);
  analogWrite(blueLED, blue);
  analogWrite(whiteLED, white);
}

void Visualight::fadeOn(){ // turns all LEDs on to full white
  for(int fadeValue = 1; fadeValue <=100; fadeValue +=5) { 
    // sets the value (range from 0 to 255):
    /*
     (1*255)/100 
    
    */
    if(MODEL > 0) {
      colorLED((fadeValue*_red)/100, (fadeValue*_green)/100, (fadeValue*_blue)/100, (fadeValue*_white)/100);
    } else {
      colorLED(_red/fadeValue, _green/fadeValue, _blue/fadeValue);
    }
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

void Visualight::alert(){

  long elapsedBlinkTime = millis(); 

  if ( elapsedBlinkTime - alertBeginTimeStamp >= _durationTime){
    alerting = false;
    colorLED(_red, _green, _blue, _white);
    blinkState=100;
    //return;
  } 

  else {  // update the current blink
    //Serial.println("BLINKING");
    blinkState -= _frequency;
		if (blinkState <= 1 || blinkState >= 100) _frequency *= -1;
    
    switch(_blinkType){
      case 0: //FADING blink
				//Serial.println(blinkState);
        colorLED( int((blinkState*_red)/100), int((blinkState*_green)/100), int((blinkState*_blue)/100), int((blinkState*_white)/100));
        //blinkState -= _frequency;
				//if (blinkState <= 1 || blinkState >= 100) _frequency *= -1;
				break;

      case 1: //HARD blink
        if(_frequency > 0 ){
          colorLED(_red, _green, _blue, _white);
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
        if(_debug) Serial.println(F("Got GET MAC request"));
        while (wifly.gets(buf, sizeof(buf)) > 0) { /* Skip rest of request */
        }
        //int numNetworks = wifly.getNumNetworks();
        sendMac();
        wifly.flushRx();    // discard rest of input
        if(_debug) Serial.println(F("Sent Mac address"));
        wifly.close();
      } 
      
      else if (strstr_P(buf, PSTR("GET / ")) > 0) { // GET request
        if(_debug) Serial.println(F("Got GET request"));
        while (wifly.gets(buf, sizeof(buf)) > 0) { /* Skip rest of request */
        }
        //int numNetworks = wifly.getNumNetworks();
        wifly.flushRx();    // discard rest of input
        sendIndex();
        if(_debug) Serial.println(F("Sent index page"));
        wifly.close();
      }
      
      else if (strstr_P(buf, PSTR("POST")) > 0) { /* Form POST */
         
        if(_debug) Serial.println(F("Got POST"));

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
          if(_debug) Serial.println(F("Got network: "));
          if(_debug) Serial.println(network);

            if (wifly.match(F("pas="))) {
              wifly.getsTerm(password, sizeof(password),'&');
              replaceAll(password,"+","$");
              //wifly.gets(security, 1); //no need for sizeof() -- it's a 1 or 2
              if(_debug) Serial.println(F("Got password: "));
              if(_debug) Serial.println(password);

            if (wifly.match(F("sec="))) {
              wifly.gets(security, sizeof(security));
              
              if(_debug) Serial.println(F("Got security: "));
              if(_debug) Serial.println(security);

            }
          }
          
          wifly.flushRx();    // discard rest of input
          if(_debug) Serial.print(F("Sending greeting page: "));
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
        if(_debug) Serial.println(F("Sending 404"));
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
/*  wifly.sendChunkln(F("<html>"));
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
  */
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