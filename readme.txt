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

SERVER:

	In Progress:
		Heartbeat timeout and DB state
	
	Todo:
		MONGO - Check out local server vs remote
		Create API for both socket and REST (json -- based on HUE)
		Apply API to apps:
			Weather
			Tides (Wunderground? NOAA?)
			Transit (NYC Bustime and Nextbus)
			Twitter
			Facebook?
			Gmail?

INTERFACE:

	In Progress:
		Tweeks to Visualight action bar to collapse on small screens
		
	TODO:
		Impliment "apps" sidebar
		Impliment icon for each bulb to show state(online/offline) and color
	
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





