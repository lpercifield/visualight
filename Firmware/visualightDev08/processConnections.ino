void processClient(){
  ////Serial.println("Process Client");
  //delay(100);
  int available;


//  if((millis() - wifiTimer) > wifiCheckInterval){
//    if(!wifly.isAssociated()) { //|| 
//      Serial.println(F("Joining"));
//      //Serial.println(wifly.isAssociated());
//      if(!wifly.join()){
//        Serial.println("Join Failed");
//        Serial.println(wifly.isAssociated());
//      }
//      //else{
//      //wifiTimer = millis();
//      //}
//    }
//    else{
//      Serial.println("Already Assoc");
//    }
//  }

  if (wifly.isConnected() == false) {
    //if(DEBUG) Serial.println("Not Connected to Server");
    if(millis()-connectTime > connectServerInterval){
      if(DEBUG) Serial.println("reconnect");
      connectTime = millis();
      connectToServer();
    }
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
        connectTime = millis();
        _red = wifly.parseInt();
        _green = wifly.parseInt();
        _blue = wifly.parseInt();
        _blinkMe = wifly.parseInt();
        colorLED(_red,_green,_blue);
      }
//      if(wifly.read() == 104 && sentHeartBeat){
//       if(DEBUG) Serial.println("Heartbeat TRUE");
//        sentHeartBeat = false;
//      }
    } 
    else {
      //This sends a checkin to the server to ensure the connection is live
      if ((millis()-connectTime)>heartBeatInterval) {
        if(DEBUG) Serial.println("heartBeat");
        sentHeartBeat=true;
        wifly.write(MAC);
        connectTime = millis();
      }
      if (wifly.isConnected() == false) {
        if(DEBUG) Serial.println("Not Connected in loop");
        // go white
        connectToServer();
      } 
    }

    /* Send data from the //Serial monitor to the TCP server */
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
        if(DEBUG) Serial.println(F("Got GET MAC request"));
        while (wifly.gets(buf, sizeof(buf)) > 0) {
          /* Skip rest of request */
        }
        //int numNetworks = wifly.getNumNetworks();

        sendMac();
        wifly.flushRx();		// discard rest of input
        if(DEBUG) Serial.println(F("Sent Mac address"));
        //wifly.flush();
        wifly.close();
      } 
      else if (strstr_P(buf, PSTR("GET / ")) > 0) {
        /* GET request */
        if(DEBUG) Serial.println(F("Got GET request"));
        while (wifly.gets(buf, sizeof(buf)) > 0) {
          /* Skip rest of request */
        }
        //int numNetworks = wifly.getNumNetworks();
        wifly.flushRx();		// discard rest of input
        sendIndex();

        if(DEBUG) Serial.println(F("Sent index page"));
        //wifly.flush();
        wifly.close();
      } 
      //else if (strncmp_P(buf, PSTR("POST"), 4) == 0) {
      else if (strstr_P(buf, PSTR("POST")) > 0) {
        /* Form POST */

        if(DEBUG) Serial.println(F("Got POST"));

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
          if(DEBUG) Serial.print(F("Sent greeting page - Network: "));
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
        if(DEBUG) Serial.println(F("Sending 404"));
        send404();
      }
    }
  }
}





