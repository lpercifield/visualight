var sanitize	= require('validator').sanitize;
var AM = require('./account-manager');

exports.setup = function(AM){
	
}


/*Callback parameters -- (bulbobject,errormessage);
	bulbobject: json containing bulb status and details
	errormessage: verbose error string
*/
exports.parseMessage = function(message,callback){

	
	//DEAL WITH API KEY
	//build response json?
	
	try{
        var parsed = JSON.parse(message);
        console.log("INCOMING MESSAGE: " + message);
        if(parsed.id != null){
	        AM.getBulbInfo(parsed.id, function(o){
		        if(!o){
			        callback(null,"BULB ID LOOKUP FAILED");
		        }else{
			        //Check which api method is called and execute on that
					switch(parsed.method){
						case 'put':
							putAPICall(parsed, o, callback);
							break;
						case 'get':
							callback(o);
							break;
						default:
							callback(null,"NO API TYPE DEFINED");
						//issue API error: NO TYPE DEFINED
					}
		        }
	        });
        }
        
    }catch(e){
    	console.log("PARSE ERROR: " + e);
        callback(null,"INVALID JSON: " + message);
    }
}

var getAPICall = function(bulbObject, callback){
	//callback(bulbObject);
}

var putAPICall = function(parsed, bulbObject, callback){
	// Loop through all the keys provided in the api call json object
	for(var keyname in parsed){
    	//console.log(keyname+": "+parsed[keyname]);
    	switch(keyname){
			case 'on':
				if(parsed.on == false || bulbObject.on == false){
					continue;
				}
				break;
			case 'hue':
				bulbObject.hue = parseInt(parsed.hue);
				break;
			case 'sat':
				bulbObject.sat = parseInt(parsed.sat);
				break;
			case 'alert':
				bulbObject.alert = parsed.alert;
				break;
			case 'bri':
				bulbObject.bri = parseInt(parsed.bri);
				break;
			default:
				callback(null,"PARAMETER IGNORED: " + parsed[keyname]);
		}
	}
	var rgb = processBulbColors(bulbObject);
	console.log(rgb);
	bulbObject.r = parseInt(rgb.r);
	bulbObject.g = parseInt(rgb.g);
	bulbObject.b = parseInt(rgb.b);
	console.log(bulbObject);
	//process color details and send to bulb
	//write bulbobject to db
	
}

var processBulbColors = function(bulbObject){
	      //function hslToRgb(h, s, l){
	var h = parseInt(bulbObject.hue)/182.04;
	var s = parseInt(bulbObject.sat); // check this value range // set defaults here??
	var l = parseInt(bulbObject.bri); // check this value range // set defaults here??
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
	
    return {r:r*255, g:parseInt(g*255), b:parseInt(b*255)};
  //}
}