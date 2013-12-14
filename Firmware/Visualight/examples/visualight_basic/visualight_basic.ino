/*

visualight_basic.ino
 
This sketch is for normal visualight operation with the visualight server.

visualight.setup() will set the server address and port to which the bulb will
  connect to oncce successfully associated with a wifi network and
  connected to the internet. 

visualight.setWiFlyLeds() enables and disables the red and green WiFly LEDs.
  These LEDs show various connection statuses and routines.
  They are disabled in Visualights by default, but have no 
   effect on the behavior of the WiFly module. 
  

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
  
  // visualight.setup("server_address", PORT); 
  visualight.setup("visualight.org", 5001);  
  
  // visualight.setWiFlyLeds( int mode ) 
  // 0 = disable   ||   1 = enable
  visualight.setWiFlyLeds(1);
}

void loop(){

  visualight.update(); 
}


