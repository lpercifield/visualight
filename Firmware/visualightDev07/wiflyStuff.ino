void joinWifi(){
  /* Setup the WiFly to connect to a wifi network */
  Serial.println("From joinWifi");
  wifly.reboot();
  //if (!wifly.isAssociated()) {

  //wifly.startCommand();
  //wifly.setSpaceReplace('+');

  wifly.setSSID(network);
  wifly.setPassphrase(password);
  wifly.setJoin(WIFLY_WLAN_JOIN_AUTO);
  //wifly.join();


  //wifly.setIpProtocol(WIFLY_PROTOCOL_TCP);
  wifly.save();
  //wifly.finishCommand();
  wifly.reboot();
  delay(1000);

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
    colorLED(255,255,255);
    if(isServer){
      Serial.println(F("Client Mode"));
      EEPROM.write(0, 0); 
      isServer = false;
      //colorLED(0,0,255);
    }
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
  Serial.println("Connecting");
  if (wifly.open("dev.visualight.org",5001)) {
    colorLED(255,255,255);
    //Serial.println("Connected: ");
    //Serial.print(F("Free memory: "));
    //Serial.println(wifly.getFreeMemory(),DEC);
    //Serial.flush();
    //Serial1.flush();
    //Serial.println(MAC);
    //wifly.flush();
    wifly.write(MAC);
    connectTime = millis();
  } 
  else {
    Serial.println("Failed to open");
    //delay(1000);

  }


}
void wifiReset(){
  colorLED(255,0,0);
  isServer = true;
  wifly.setSoftAP();
  EEPROM.write(0, 1);
}
void configureWifi(){
  Serial.println("From Config");
  wifly.setBroadcastInterval(0);	// Turn off UPD broadcast
  wifly.setDeviceID("Visualight");
  wifly.setProtocol(WIFLY_PROTOCOL_TCP);
  wifly.enableDHCP();
  wifly.setChannel("0");
  wifly.save();
  wifly.reboot();
}

