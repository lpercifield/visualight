/*
 * VISUALIGHT by LEIF PERCIFILED
 * Exctracted from: WiFlyHQ Example httpserver.ino
 *
 * This sketch is released to the public domain.
 *
 */

/* Notes:
 */

/* Work around a bug with PROGMEM and PSTR where the compiler always
 * generates warnings.
 */

// current sketch size: 24,926


#ifndef Visualight_h
#define Visualight_h

#if (ARDUINO >= 100)
    #include "Arduino.h"
#else
    #include <avr/io.h>
    #include "WProgram.h"
#endif
 
#include <WiFlyVisualight.h>
#include "../EEPROM/EEPROM.h"

#undef PROGMEM 
#define PROGMEM __attribute__(( section(".progmem.data") )) 
#undef PSTR 
#define PSTR(s) (__extension__({static prog_char __c[] PROGMEM = (s); &__c[0];})) 

#define heartBeatInterval 25000
#define connectServerInterval 60000 //

#define redLED 9
#define greenLED 13
#define blueLED 10
#define whiteLED 5 //only for PROD version!
#define blueComp 1.2

#define resetButton 7
#define resetPin 11
#define resetButtonTime 2000

class Visualight {

	public:
		Visualight();
		WiFly wifly; //just in case we want to access this from the sketch...
		void update();
		void setup(uint8_t _MODEL, char* _URL, uint16_t _PORT);
		void setVerbose(boolean set);

		/* Change these to match your WiFi network */
		//const char mySSID[] = "myssid";
		//const char myPassword[] = "my-wpa-password";

	private:
		//Function Prototypes
		void sendIndex();
		void sendGreeting(char *name);
		void send404();
		void sendMac();
		void joinWifi();
		void wifiReset();
		void configureWifi();
		void processServer();
		void processClient();
		boolean connectToServer();
		void processButton(); //needs to be static for attachInterrupt()
		void replaceAll(char *buf_,const char *find_,const char *replace_);
		void colorLED(int red, int green, int blue);
		void colorLED(int red, int green, int blue, int white);
		void fadeOn();
		void sendHeartbeat();

		char buf[80];
		char serBuf[16];
		
		char network[64];
		char password[64];
		boolean isServer;
		boolean	reconnect;
		char MAC[18];
		char devID[11];
		long wifiTimer;
		boolean sentHeartBeat;

		char * URL;
		uint16_t PORT;
		uint8_t MODEL; // 0 = RGB // 1 = RGBW //

		uint16_t _red;
		uint16_t _green;
		uint16_t _blue;
		uint16_t _white;
		uint16_t _blinkMe;

		boolean _debug;

		//const int resetButtonTime = 2000;
		uint8_t resetButtonState;
		int resetTime;
		uint8_t reconnectCount;

		uint32_t connectTime;
		uint32_t lastHeartbeat;
};

#endif
