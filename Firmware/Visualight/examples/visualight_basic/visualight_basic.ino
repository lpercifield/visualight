/*
visualight_basic.ino

This sketch is for normal visualight operation with the visualight server.

http://visualight.org

*/

#include <EEPROM.h>
#include "Visualight.h"

Visualight visualight;

void setup(){  
  
  // visualight.setup("server_address", PORT); 
  visualight.setup("54.204.16.233", 5001);  
}

void loop(){

  visualight.update(); 
}


