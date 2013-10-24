export.getWeather = function(weatherZipcode){
//clearDataCalls();
request('http://api.wunderground.com/api/e9e74e882dede7ed/conditions/q/'+weatherZipcode+'.json', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    //console.log(body) // Print the google web page.
    var obj = JSON.parse(body);
    var temp = obj.current_observation.temp_f;
    console.log( obj.current_observation.temp_f );
    var normalized = normF(temp, 30,90);
	console.log("Normalized: "+normalized);
	var hue = map_range(normalized,0,255,(359*0.5),359);
	setLedColorHSV(hue,1,1);
	console.log("red: "+Math.round(r*255)+"green: "+Math.round(g*255)+"blue: "+Math.round(b*255));
    //if(lights.length > 0){
		if(temp != null){
			//for(var i = 0; i < lights.length; i++){
				//var normalized = normF(temp, 30,90);
				//console.log("Normalized: "+normalized);
				//var red = map_range(temp, 32,100,0,255);
				//var blue = map_range(temp,32,100,255,0);
				var tempColor = Math.round(r*255)+","+Math.round(g*255)+","+Math.round(b*255)+",0";
				sendToVisualight(tempColor);
				timer = setTimeout(getWeather,300000);
				//console.log(tempColor);
				//lights[i].write(tempColor);
				//lights[i].write("x");
			//}
		}
	//}else{
	//	console.log("NO ARDUINO CONNECTED");
	//}
  }
})
};
function map_range(value, low1, high1, low2, high2) {
	if(value < low1){
		value = low1;
	}else if(value > high1){
		value = high1;
	}
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}