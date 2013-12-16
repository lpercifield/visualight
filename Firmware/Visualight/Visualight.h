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

#define blueComp 1.2
#define redLED 9
#define greenLED 13
#define blueLED 10
/* whiteLED is digitalPin 5 on the PRODUCT Version.
if you are converting a DIY bulb to RGBW, change this to digitalPin 6 */
 #define whiteLED 5 // DIY = 6 // PRODUCT = 5 //

#define resetButton 7
#define resetPin 11
//#define resetButtonTime 2000

class Visualight {

	public:
		Visualight();
		WiFly wifly; //just in case we want to access this from the sketch...
		void update();
		void setup(char* _URL, uint16_t _PORT, uint8_t _wiflyLedFlag);
		void setVerbose(boolean set);
		void saveStartColor(uint8_t _r, uint8_t _g, uint8_t _b, uint8_t _w);
		void setColor(uint8_t _r, uint8_t _g, uint8_t _b, uint8_t _w);
		void setWiFlyLeds(int mode, boolean reboot);
		boolean factoryRestore();

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
		void wiflyHardReset();
		void configureWifi();
		void processServer();
		void urldecode(char *dst, char *src);
		void processClient();
		boolean connectToServer();
		void processButton(); //needs to be static for attachInterrupt()
		void replaceAll(char *buf_,const char *find_,const char *replace_);
		void colorLED(int red, int green, int blue);
		void colorLED(int red, int green, int blue, int white);
		void fadeOn();
		void sendHeartbeat();
		void alert();
		void setAlert(int blinkType, long durationTime, int frequency, int r, int g, int b, int w);

		boolean alerting;
		long alertBeginTimeStamp;
		uint16_t blinkState; //counts from 0 - 100

		char buf[80];
		char serBuf[31];//21 for blink
		
		char network[64];
		char password[64];
		char decodeBuffer[65];
		
		char security[2];
		boolean isServer;
		char MAC[18];
		char devID[11];
		long wifiTimer;
		boolean sentHeartBeat;

		char * URL;
		uint16_t PORT;

		int _red;
		int _green;
		int _blue;
		int _white;

		int _Ared;
		int _Agreen;
		int _Ablue;
		int _Awhite;

		int _frequency;
		int _blinkType;
		long _durationTime;

		boolean _debug;
		uint8_t wiflyLedFlag;

		volatile uint8_t resetButtonState;
		int resetTime;
		uint8_t reconnectCount;

		uint32_t connectTime;
		uint32_t lastHeartbeat;
};

#endif
