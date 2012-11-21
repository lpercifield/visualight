Visualight:

These files allow you to use twilio to update a Pachube feed

This application uses Arduino, Xbee, PHP, Twilio, and Digi ConnectPort Xbee gateway with XIG (http://code.google.com/p/xig/)

Arduino:

Connected to the arduino is an RGB LED and a XBEE



Twilio:

This reads prompts to someone calling in on the phone and takes the DTMF input and sends the values to pachube.



Pachube:
The pachube feed has a trigger set to POST the values when they change.


PHP:
The value POSTed from PHP is then writen to a text file. This makes it faster for the arduino and xbee to process the data.