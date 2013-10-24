#include <EEPROM.h>
#include "Visualight.h"

Visualight visualight;

#define TYPE_RGB 0
#define TYPE_RGBW 1

void setup(){

  visualight.setVerbose(false); // only set true if you know what's up
  visualight.setup(TYPE_RGBW, "dev.visualight.org", 5001);  // setup(TYPE, "URL", PORT)
}

void loop(){

  visualight.update(); 
}


