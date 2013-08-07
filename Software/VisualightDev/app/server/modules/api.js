var sanitize	= require('validator').sanitize;

exports.parseAPI = function(message,callback){
	
	var parsed = JSON.parse(message);
	
	for(var keyname in parsed){
    	console.log(keyname+": "+parsed[attributename]);
    	switch(keyname){
			case 'type':
				break;
			case 'on':
				break;
			case 'hue':
				break;
			case 'sat':
				break;
			case 'id':
				break;
			case 'alert':
				break;
			case 'bri':
				break;
			default:
				;
		}
	}
}

var getAPICall = function(){
	
}

var putAPICall = function(){
	
}