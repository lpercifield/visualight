Visualight Wifi Lightbulb

More information: Visualight.org

Dev Blog: blog.visualight.org

DIY SHIPPING MILESTONE:
	device->server connection finalized
	Server stability tested
	Server load tested

FIRMWARE:

Current Firmware Dev: 08

	In Progress:
		double check Wifi and server reconnect
		heartbeat acknowledgement 
	
	Notes:
		Consolidated debug
	
	Feature Request:
		Look at hueValues
		Customize web_config app
		Refactor bulb configuration to use web_config app
		
		
  KNOW BUGS:
    reconnect after inital setup fails

SERVER:

	In Progress:
		Heartbeat timeout and DB state
	
	Todo:
		MONGO - Check out local server vs remote
		Create API for both socket and REST (json -- based on HUE)
		Create API key setup
		Apply API to apps:
			Weather
			Tides (Wunderground? NOAA?)
			Transit (NYC Bustime and Nextbus)
			Twitter
			Facebook?
			Gmail?
			
    App rules:

      Color picker always sets the color
  
      Two type of apps:
      - subscribe: this app can change the color of your bulb at any time
      - alert: this app can send a colored alert to your bulb at any time
  
      only one subscribe app can be active
      multiple alert apps can be active

INTERFACE:

	In Progress:
		Tweeks to Visualight action bar to collapse on small screens
		
	TODO:
		Impliment "apps" sidebar
		Impliment icon for each bulb to show state(online/offline) and color
		Impliment API key interface
	
	KNOW BUGS:
		Collapsed State dropdown button fails on mobile
		
		
HARDWARE:

	DIY:
		Order white plug adapters
		Assembly and boxing
	
	
	STRIP:
		Order final panels and stencil
		Finalize LEDs and connectors
		Finalize Enclosure
	
	PRODUCTION:
		Order LED boards with new circuit and connector
		Order Controller boards with new connector
		Testing power supplies





