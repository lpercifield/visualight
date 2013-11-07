var sanitize	= require('validator').sanitize;
var AM = require('./account-manager');
var IO = require('./handle-sockets');

exports.setup = function(AM){
	
}


/*Callback parameters -- (bulbobject,errormessage);
	bulbobject: json containing bulb status and details
	errormessage: verbose error string
*/
exports.parseMessage = function(message,Bulbs,callback){

	
	//DEAL WITH API KEY
	//build response json?
	//console.log(Bulbs)

	try{
        var parsed = JSON.parse(message);
        //console.log("INCOMING MESSAGE: " + message);
        if(parsed.id != null){
				if( Bulbs.hasOwnProperty(parsed.id) == false ){ //check if Bulbs[] exists
					callback(null,"BULB LOOKUP FAILED Bulb.id:"+parsed.id);
				}else{
					switch(parsed.method){
						case 'put':
							putAPICall(parsed,Bulbs[parsed.id],callback);
							break;
						case 'get':
							callback(Bulbs[parsed.id]); //must ensure the rgbw gets set before sending back this object
							break;
						default:
							callback(null,"API TYPE NOT DEFINED");
							break;
					}
				}
				//     old way of orienting with db call
				//     AM.getBulbInfo(parsed.id, function(o){
				//      if(!o){
				//       callback(null,"BULB ID LOOKUP FAILED");
				//      }else{
				//       //Check which api method is called and execute on that
				// 			switch(parsed.method){
				// 				case 'put':
				// 					putAPICall(parsed, o, callback);
				// 					break;
				// 				case 'get':
				// 					callback(o);
				// 					break;
				// 				default:
				// 					callback(null,"NO API TYPE DEFINED");
				// 					//issue API error: NO TYPE DEFINED
				// 			}
				//      }
	        	//});
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
	console.log('PUT BULB OBJECT')
	console.log(bulbObject);
	for(var keyname in parsed){
    	//console.log(keyname+": "+parsed[keyname]);
    	switch(keyname){
			case 'on':
				if(parsed.on == false || bulbObject.on == false){
					continue;
				}
				break;
			case 'hue':
				bulbObject.hue = parseFloat(parsed.hue);
				break;
			case 'sat':
				bulbObject.sat = parseFloat(parsed.sat);
				break;
			case 'alert':
				bulbObject.alert = parsed.alert;
				break;
			case 'bri':
				bulbObject.bri = parseFloat(parsed.bri);
				break;
			case 'method':
				break;
			case 'id':
				break;
			default:
				callback(null,"PARAMETER IGNORED: " + parsed[keyname]);
		}
	}
	var rgb = processBulbColors(bulbObject);
	//console.log(rgb);
	bulbObject.color.r = parseInt(rgb.r);
	bulbObject.color.g = parseInt(rgb.g);
	bulbObject.color.b = parseInt(rgb.b);
	bulbObject.color.w = parseInt(rgb.w);

	/*
if(bulbObject.hue == 0){
  	bulbObkect.w = bulbObject.bri;
	}
*/

  //console.log("callingback with bulb");

	callback(bulbObject);
	
	//process color details and send to bulb
	//write bulbobject to db
	
}

var processBulbColors = function(bulbObject){
	      //function hslToRgb(h, s, l){
	var h = (bulbObject.hue/360)/182.04;
	var s = bulbObject.sat/254; // check this value range // set defaults here??
	var l = bulbObject.bri/254; // check this value range // set defaults here??
	//var hsl = h+s+l
	//console.log("HSL: "+h + " " + s + " " + l + " " +hsl );
    var r,g,b,w;

    if(s == 0){
        r = g = b = w = l; // achromatic
    }else{
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + (1/3));
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - (1/3));
        w = l-s;
        if(w <= 0){
          w=0
        }
    }
    var rgbTotal = r+g+b;
	//console.log("RGB: " +r + " " + g + " " + b + " " +rgbTotal);
    return {r:r*255, g:g*255, b:b*255, w:w*255};
  //}
}
 var hue2rgb = function (p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < (1/6)) return p + (q - p) * 6 * t;
            if(t < (1/2)) return q;
            if(t < (2/3)) return p + (q - p) * ((2/3) - t) * 6;
            return p;
        }