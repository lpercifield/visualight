#include <EEPROM.h>
#include "Visualight.h"

Visualight visualight;

void setup(){  
  // server address, port
  // visualight.setup("dev.visualight.org", 5001);  // setup(TYPE, "URL", PORT)
  visualight.setup("54.204.16.233", 5001);  // setup(TYPE, "URL", PORT)
}

void loop(){

  visualight.update(); 
}


