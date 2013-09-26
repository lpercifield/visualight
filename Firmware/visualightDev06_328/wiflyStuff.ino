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
    //Serial1.flush();
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
