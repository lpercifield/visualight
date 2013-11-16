#include <EEPROM.h>
#include "Visualight.h"

Visualight visualight;

void setup(){
  
  // if set true, board will wait for serial  
  // monitor to be opened before executing any code
  visualight.setVerbose(false); 
  
  visualight.setStartColor(0,255,0,0);
  
  // resets EEPROM flags on the Visualight, 
  // wipes all WiFly flash memory, settings
  visualight.factoryRestore();  
}

void loop(){
  
  visualight.update();
}


