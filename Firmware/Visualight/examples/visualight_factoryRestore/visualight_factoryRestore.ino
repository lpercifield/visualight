#include <EEPROM.h>
#include "Visualight.h"

Visualight visualight;

void setup(){

  visualight.setVerbose(true); // leave on true, open serial monitor to run
  visualight.factoryRestore();  
}

void loop(){

}


