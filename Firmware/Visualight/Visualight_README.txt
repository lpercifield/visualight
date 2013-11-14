//***** Visualight Arduino Library *****//

Library for the Visualight Networked Lighting System

http://visualight.org
http://incrediblemachin.es

The library provides functions for setting up and managing the Visualight module and
communicating with the Visualight server.

Example code to setup and use the hardware serial interface:
	
	#include <EEPROM.h>
	#include "Visualight.h"
	visualight.setVerbose(bool);
	Visualight.setup(int TYPE, "server address", port);
	Visualight.update(); 






//***** LICENSE *****//
