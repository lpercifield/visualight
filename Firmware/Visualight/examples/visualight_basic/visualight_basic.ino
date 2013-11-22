/*
visualight_basic.ino

This sketch is for normal visualight operation with the visualight server.

visualight.saveStartColor will save an RGBW color of your choice to the
EEPROM of the visualight. Every subsequent power-on of your light will
begin with this color (unless re-saved via the visualight web interface). It
will remain this color until successful server connection and new color
command is received from the server.

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
  
  // visualight.saveStartColor(R, G, B, W);
  visualight.saveStartColor(0, 0, 255, 0);
  
  // visualight.setup("server_address", PORT); 
  visualight.setup("54.204.16.233", 5001);  
}

void loop(){

  visualight.update(); 
}


