#include <EEPROM.h>
#include "Visualight.h"

Visualight visualight;


#define TYPE_RGB 0
#define TYPE_RGBW 1

void setup(){
  // if set true, board will wait for serial  
  // monitor to be opened before executing any code
  visualight.setVerbose(false); 
  
  // set the initial color of bulb when turned on 
  // and waiting for server instruction (0,0,0) for off
  visualight.setStartColor(80, 0, 130, 0); //r,g,b,w -- INDIGO!!
  
  // bulb type, server address, port
  // visualight.setup(TYPE_RGB, "dev.visualight.org", 5001);  // setup(TYPE, "URL", PORT)
  visualight.setup(TYPE_RGBW, "54.204.16.233", 5001);  // setup(TYPE, "URL", PORT)
}

void loop(){

  visualight.update(); 
}


