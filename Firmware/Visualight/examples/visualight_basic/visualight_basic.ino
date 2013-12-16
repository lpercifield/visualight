/*

visualight_basic.ino
 
This sketch is for normal visualight operation with the visualight server.

visualight.setup() will set the server address and port to which the bulb will
  connect to oncce successfully associated with a wifi network and
  connected to the internet. When WiFly LEDs are enabled, the WiFly will blink
  status changes when there it is connecting or any error has occurred. This is for debugging.
  
  Argument 0 = "server_address" (string)
  Argument 1 = PORT number (int) 
  Argument 2 = Disable or Enable WiFly LEDs (0 or 1, respectively)
  
NOTE: To enable verbose/Serial debug mode, locate the Visualight.cpp file located at:
[Arduino sketch folder] > libraries > Visualight > Visualight.cpp
set #define DEBUG to 1. Save the file, then uploa d this sketch. Visualight will
wait for the Serial Monitor to be on @115200 baud before executing any code.

http://visualight.org

*/

#include <EEPROM.h>
#include "Visualight.h"

Visualight visualight;

void setup(){  
  
  // visualight.setup("server_address", PORT, ENABLE/DISABLE WiFly LEDs); 
  visualight.setup("visualight.org", 5001, 1);  
}

void loop(){

  visualight.update(); 
}


