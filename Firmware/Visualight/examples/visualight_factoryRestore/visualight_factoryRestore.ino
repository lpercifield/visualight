/*
visualight_factoryRestore.ino

This sketch resets your Visualight to factory settings. 
WiFi network credentials will be wiped, as will all EEPROM settings.
After upload, your light will be RED until restore is complete, and 
will pulse GREEN when it is complete.

**AFTER UPLOADING AND RUNNING THIS SKETCH, BE SURE TO  
UPLOAD THE visualight_basic.ino sketch FOR NORMAL OPERATION

http://visualight.org

*/

#include <EEPROM.h>
#include "Visualight.h"

Visualight visualight;

void setup(){
  
  // resets EEPROM flags on the Visualight, 
  // wipes all WiFly flash memory, settings
  visualight.factoryRestore();  
  
}

void loop(){
  
  // update the LED, will pulse green when process is finished.
  visualight.update();
}


