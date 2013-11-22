/*

visualight_basic.ino

This sketch is for normal visualight operation with the visualight server.

visualight.setup will set the server address and port to which the bulb will
connect to once successfully associated with a wifi network and connected
to the internet.

NOTE: To enable verbose/debug mode, locate the Visualight.cpp file located at:
[Arduino sketch folder] > libraries > Visualight > Visualight.cpp
set #define DEBUG to 1. Save the file, then upload this sketch. Visualight will
wait for the Serial Monitor to be on @115200 baud before executing any code.

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


