#include <EEPROM.h>
#include "Visualight.h"

Visualight visualight;

void setup(){
  
  visualight.saveStartColor(0,0,255,0); // THIS SAVES TO THE EEPROM, DON'T RUN THIS CODE OVER AND OVER AND OVER AND OVER...
  
  // resets EEPROM flags on the Visualight, 
  // wipes all WiFly flash memory, settings
  visualight.factoryRestore();  
}

void loop(){
  
  visualight.update();
}


