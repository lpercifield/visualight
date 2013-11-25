/*

visualight_factoryRestore.ino
 
This sketch resets your Visualight to factory settings. 
WiFi network credentials will be wiped, as will all EEPROM settings.
After upload, your light will be RED until restore is complete, and 
will pulse GREEN when it is complete.

visualight.saveStartColor will save an RGBW color of your choice to the
EEPROM of the visualight. Every subsequent power-on of your light will
begin with this color (unless re-saved via the visualight web interface). It
will remain this color until successful server connection and new color
command is received from the server.

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
  
  // rest for 1 second
  delay(1000);
  
  // visualight.saveStartColor(R, G, B, W);
  visualight.saveStartColor(255, 255, 255, 255); 
}

void loop(){
  
  // update the LED, will pulse green when process is finished.
  visualight.update();
}


