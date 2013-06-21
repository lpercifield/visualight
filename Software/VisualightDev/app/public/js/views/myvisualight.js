 // Initialize everything when the window finishes loading
$(document).ready(function(){
	  var vc = new VisualightController(function(){
		  console.log("gotNewBulbs");
		  setupVisualightButtons();
		  connectSocket();
	  });
	  
      var status = document.getElementById("status");
      var url = document.getElementById("url");
      var open = document.getElementById("open");
      var close = document.getElementById("close");
      var send = document.getElementById("send");
      var text = document.getElementById("text");
      var message = document.getElementById("message");
      var socket;
      var currBulb = 0;
      var poweron = true;
      var bulbArray = null;
      var reconnect = false;
      
	$('#demo').hide();
	setupVisualightButtons();
	connectSocket();


	function setupVisualightButtons(){
		vc.getBulbs(function(r){
		//console.log("getting complete");
			$('div.btn-group .btn').click(function(){
				//console.log($(this).find('input:radio').attr('checked', true).val());
				alert($('input[name=bulb-button]:checked').val());
				});
		});
		//connectSocket();
		console.log("connect");
	}
	function connectSocket(){
		console.log("connect socket");
		var session = getCookie('sessionID');
		console.log(document.cookie);
		if(reconnect){
			socket.socket.reconnect();
		}else{
			socket = io.connect('/?session='+encodeURIComponent(session));
		}
	}
	
	
	socket.on('connect', function() {
		status.textContent = "Connected";
		close.disabled = false;
        open.disabled = true;
        var currBulbId = $('div.btn-group .btn').find('input:radio').attr('checked', true).val();
        console.log("currBulbID " + currBulbId);
        if(currBulbId!=null) socket.emit('current-bulb', currBulbId);
        console.log($('div.btn-group .btn').find('input:radio').attr('checked', true).val());
	});
	socket.on('disconnect',function(){
		status.textContent = "Not Connected";
		open.disabled = false;
		close.disabled = true;
		reconnect = true;
	});
// handle bulb button change
		

/*
	bulbArray = vc.getBulbs();
	if(bulbArray!=null){
		
	}else{
		$('#main').style.display = "none";
	}
*/
	
  //var svgDoc, darkshade, lightshade;

  function updateHTML5LogoColor( color1, color2 ){
    darkshade.setProperty("fill", color1, "");
    lightshade.setProperty("fill", color2, "");
  };

  //var svglogo = document.getElementById("html5svg");

  /*svglogo.addEventListener("load",function(){
    svgDoc = svglogo.contentDocument;
    darkshade = svgDoc.getElementById('darkshade').style;
    lightshade = svgDoc.getElementById('lightshade').style;
  },false);*/
  
  $('#picker').farbtastic(function(e){
    var c   = hexToRgb(e)
      , h   = rgbToHsl(c.r,c.g,c.b)
      , r   = hslToRgb(h.h,h.s,h.l)
      , rgb = +c.r+','+c.g+','+c.b+',0'
      ;
    
    //$('#color').css({backgroundColor:e}).val(e);
    $('#color').css({backgroundColor:e});
	console.log(rgb);
	socket.send(rgb);
    //updateHTML5LogoColor(rgb, e);
  });
      status.textContent = "Not Connected";
      //url.value = "ws://leifp.com:8080";
      close.disabled = true;
      //send.disabled = true;
      
      // Create a new connection when the Connect button is clicked
      open.addEventListener("click", function(event) {
      	console.log("click");
      	connectSocket();
      });
/*
      function connectSocket(){
      		console.log("here");
	      socket = new WebSocket("ws://leifp.com:8080", "echo-protocol");
      socket.addEventListener("open", function(event) {
          close.disabled = false;
          open.disabled = true;
          //send.disabled = false;
          status.textContent = "Connected";
        });

        // Display messages received from the server
        socket.addEventListener("message", function(event) {
         // message.textContent = "Server Says: " + event.data;
         	console.log(event.data);
         	alert(event.data);
        });

        // Display any errors that occur
        socket.addEventListener("error", function(event) {
          //message.textContent = "Error: " + event;
        });

        socket.addEventListener("close", function(event) {
          open.disabled = false;
          status.textContent = "Not Connected";
        });
      }
*/
      

      // Close the connection when the Disconnect button is clicked
      close.addEventListener("click", function(event) {
        close.disabled = true;
        //send.disabled = true;
        //message.textContent = "";
        socket.disconnect();
      });
      
     /*
 one.addEventListener("click", function(event){
      	//socket.send("weather,"+$('#zip').val());
      	currBulb = 0;
      	console.log("one");
      });
      two.addEventListener("click", function(event){
      	//socket.send("weather,"+$('#zip').val());
      	currBulb = 1;
      	console.log("two");
      });
      three.addEventListener("click", function(event){
      	//socket.send("weather,"+$('#zip').val());
      	currBulb = 2;
      	console.log("three");
      });
*/
      weather.addEventListener("click", function(event){
      	socket.send("weather,"+$('#zip').val()+","+currBulb);
      });
      bustime.addEventListener("click", function(event){
      if($('#stopid').val() == ""){
      	alert("Please enter both a Stop ID - See bustime.mta.info for details");
      }else{
      	socket.send("bustime,"+$('#stopid').val()+","+currBulb);
      	}
      });
      cosm.addEventListener("click", function(event){
      	if($('#feed').val() =="" || $('#datastream').val() ==""){
      		alert("Please enter both a Feed ID and Datastream");
      	}else{
      		var min = 0;
      		var max = 100;
      		if($('#min').val() != ""){
      			var min = $('#min').val();
      		}
      		if($('#max').val() != ""){
      			var max = $('#max').val();
      		}
      		socket.send("cosm,"+$('#feed').val()+","+$('#datastream').val()+","+min+","+max+","+currBulb);
      	}
      });
      
      /*
power.addEventListener("click", function(event) {
        //close.disabled = true;
        if(poweron == false){
        	$('#slider-red').val(255);
        	$('#slider-red').slider('refresh');
        	$('#slider-green').val(255);
        	$('#slider-green').slider('refresh');
        	$('#slider-blue').val(255);
        	$('#slider-blue').slider('refresh');
        	poweron = true;
        }else{
        	$('#slider-red').val(0);
        	$('#slider-red').slider('refresh');
        	$('#slider-green').val(0);
        	$('#slider-green').slider('refresh');
        	$('#slider-blue').val(0);
        	$('#slider-blue').slider('refresh');
        	poweron = false;
        }

        //console.log("Power");
        //send.disabled = true;
        //message.textContent = "";
        //socket.close();
      });*/

      // Send text to the server when the Send button is clicked
      //send.addEventListener("click", function(event) {
        //socket.send(text.value);
        //text.value = "";
      //});
      $('#slider-red').change(function(){
    		var slider_value = $(this).val();
    		console.log(slider_value +","+ $('#slider-green').val() + "," +$('#slider-blue').val());
    		socket.send(slider_value +","+ $('#slider-green').val() + "," +$('#slider-blue').val()+",0"+","+currBulb);
		});
		$('#slider-green').change(function(){
    		var slider_value = $(this).val();
    		console.log($('#slider-red').val() +","+ slider_value + "," +$('#slider-blue').val());
    		socket.send($('#slider-red').val() +","+ slider_value + "," +$('#slider-blue').val()+",0"+","+currBulb);
		});
		$('#slider-blue').change(function(){
    		var slider_value = $(this).val();
    		console.log($('#slider-red').val() +","+ $('#slider-green').val() + "," +slider_value);
    		socket.send($('#slider-red').val() +","+ $('#slider-green').val() + "," +slider_value+",0"+","+currBulb);
		});
    });
      function hslToRgb(h, s, l){
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

    return {r:parseInt(r*255), g:parseInt(g*255), b:parseInt(b*255)};
  }

  function rgbToHsl(r, g, b){
      r /= 255, g /= 255, b /= 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;

      if(max == min){
          h = s = 0; // achromatic
      }else{
          var d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch(max){
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
      }

      //return [h*100, s*100, l*70];
      //return {h:parseFloat(h*360), s:parseInt(s*100), l:parseInt(l*80)};
      return {h:h, s:s, l:l*.8};
  }
  

  function hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
      } : null;
      

  }
  
  // all this stuff is to get the cookie from the browser
  if (typeof String.prototype.trimLeft !== "function") {
    String.prototype.trimLeft = function() {
        return this.replace(/^\s+/, "");
    };
}
if (typeof String.prototype.trimRight !== "function") {
    String.prototype.trimRight = function() {
        return this.replace(/\s+$/, "");
    };
}
if (typeof Array.prototype.map !== "function") {
    Array.prototype.map = function(callback, thisArg) {
        for (var i=0, n=this.length, a=[]; i<n; i++) {
            if (i in this) a[i] = callback.call(thisArg, this[i]);
        }
        return a;
    };
}
function getCookies() {
    var c = document.cookie, v = 0, cookies = {};
    if (document.cookie.match(/^\s*\$Version=(?:"1"|1);\s*(.*)/)) {
        c = RegExp.$1;
        v = 1;
    }
    if (v === 0) {
        c.split(/[,;]/).map(function(cookie) {
            var parts = cookie.split(/=/, 2),
                name = decodeURIComponent(parts[0].trimLeft()),
                value = parts.length > 1 ? decodeURIComponent(parts[1].trimRight()) : null;
            cookies[name] = value;
        });
    } else {
        c.match(/(?:^|\s+)([!#$%&'*+\-.0-9A-Z^`a-z|~]+)=([!#$%&'*+\-.0-9A-Z^`a-z|~]*|"(?:[\x20-\x7E\x80\xFF]|\\[\x00-\x7F])*")(?=\s*[,;]|$)/g).map(function($0, $1) {
            var name = $0,
                value = $1.charAt(0) === '"'
                          ? $1.substr(1, -1).replace(/\\(.)/g, "$1")
                          : $1;
            cookies[name] = value;
        });
    }
    return cookies;
}
function getCookie(name) {
    return getCookies()[name];
}
