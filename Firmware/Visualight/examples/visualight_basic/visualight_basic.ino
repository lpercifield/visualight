#include <EEPROM.h>
#include "Visualight.h"

Visualight visualight;

void setup(){
  
  // set the initial color of bulb when turned on 
  // and waiting for server instruction (0,0,0) for off
  visualight.setStartColor(0, 255, 255, 0); //r,g,b,w
  
  // bulb type, server address, port
  // visualight.setup(TYPE_RGB, "dev.visualight.org", 5001);  // setup(TYPE, "URL", PORT)
  visualight.setup("54.204.16.233", 5001);  // setup(TYPE, "URL", PORT)
}

void loop(){

  visualight.update(); 
}


