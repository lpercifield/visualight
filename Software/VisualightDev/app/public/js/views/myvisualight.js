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
      var update = document.getElementById("update");
      var socket;
      var currBulb = 0;
      var currBulbId = null;
      var currBulbName = null;
      var currBulbType = 'bulb';
      var poweron = true;
      var bulbArray = null;
      var reconnect = false;
      var state; //this is bad.
      
	$('#demo').hide();
	setupVisualightButtons();
	connectSocket();


	function setupVisualightButtons(){
		vc.getBulbs(function(r){
		//console.log("getting complete");
			$('#bulbs.dropdown-menu li a').click(function(){
				//alert($(this).data('name'));
				currBulbId = $(this).data('id');
				currBulbName = $(this).data('name');
				currBulbType = 'bulb';
				$('h1.intro').hide()
				//set header to bulb name
				$('div#options form :text').val(currBulbName);
				//$('div#title').show();
				$('.current h1').html(currBulbName).parent().show();
				$('div#options form').attr('action','/bulb/'+currBulbId+'/update')
				$('div#options form input.id').val(currBulbId)
				$('button#delete').attr('data-url','/bulb/'+currBulbId);
				//$('button#delete').data('url', '/bulb/'+currBulbId)
				$('div#options form.update table').remove() 
				
    		});
		});
    vc.getGroups(function(r){
      $('#groups.dropdown-menu li a').click(function(){

        currBulbName = $(this).data('name');
		var group=$(this).data('id');
        var inputs = $(this).find(':hidden');
        
        currBulbId = group;
        currBulbType = 'group';

		$('h1.intro').hide()
		//options menu
		$('div#options form :text').val(currBulbName);
		$('div#options form').attr('action','/group/'+group+'/update')
		$('div#options form input.id').val(group);
		//$('div#options').show();
		$('button#delete').attr('data-url','/group/'+group);
		
		$('.current h1').html(currBulbName).parent().show();
		$('div#options form.update table').remove() //clear out old table
		
		var clone = $('.modal-group-setup .modal-body form table').clone();
		$('div#options form.update').append(clone);
		
		inputs.each(function(i){
			$('div#options form.update table input[value="'+$(this).val()+'"]').attr('checked',true);
		})
		//console.log($('.modal-group-setup .modal-body form table'))
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
        //currBulbId = $('div.btn-group .btn').find('input:radio').attr('checked', true).val();
        //console.log("currBulbID " + currBulbId);
        //if(currBulbId!=null) socket.emit('current-bulb', currBulbId);
        //console.log($('div.btn-group .btn').find('input:radio').attr('checked', true).val());
	});
	socket.on('disconnect',function(){
		status.textContent = "Not Connected";
		open.disabled = false;
		close.disabled = true;
		reconnect = true;
	});
	socket.on('bulb-offline',function(){
		console.log(currBulbName +" is currently offline");
	});
	
	function sendAPICall(state){

      state.id = currBulbId;
      state.type = currBulbType;
      //convert it to json:
      var jsonObj = JSON.stringify(state);
      console.log(jsonObj);
      socket.send(jsonObj);

	}


  function updateHTML5LogoColor( color1, color2 ){
    darkshade.setProperty("fill", color1, "");
    lightshade.setProperty("fill", color2, "");
  };

  $('#picker').farbtastic(function(e){
    var c   = hexToRgb(e)
      , h   = rgbToHsl(c.r,c.g,c.b)
      , r   = hslToRgb(h.h,h.s,h.l)
      , rgb = +c.r+','+c.g+','+c.b+',0';
    
    //$('#color').css({backgroundColor:e}).val(e);
    $('body').css({background:e});
    $('#color').css({backgroundColor:e});
	//console.log(rgb);
	//socket.send(rgb);
	state =
	{
	    on:true,
	    method:'put',
	    hue:((h.h *360)* 182.04), //we convert the hue value into degrees then convert to scaled hue by multiplying the value by 182.04
	    sat:(h.s * 254),
	    bri:(h.l * 254),
	    alert: {duration: 0, frequency: 0, type: 0}
	};
	
/*
	if(state.hasOwnProperty('alert')){
		delete state.alert;
	}
*/
	sendAPICall(state);
    //updateHTML5LogoColor(rgb, e);
  });
      status.textContent = "Not Connected";
      close.disabled = true;
      //send.disabled = true;
      
      // Create a new connection when the Connect button is clicked
      open.addEventListener("click", function(event) {
      	console.log("click");
      	connectSocket();
      });
      

      // Close the connection when the Disconnect button is clicked
      close.addEventListener("click", function(event) {
        close.disabled = true;
        //send.disabled = true;
        //message.textContent = "";
        socket.disconnect();
      });
      
      $('button#settings').click(function(e){
	      $('#options').toggle()
	      if($(this).html() == 'SETTINGS') $(this).html('HIDE');
	      else $(this).html('SETTINGS');
      })
      $('button#delete').click(function(e){
	      if(!confirm('Are you sure you want to delete this item')) return;
		  

	      $.ajax({
		      type:'DELETE',
		      url: $(this).attr('data-url'),
		      success: function(data){
			      console.log('DELETE SUCCESS RECEIVED:')
			      console.log(data);
			      },
			  error: function(jqXHR){
				  console.log('AJAX ERROR: ')
				  console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			  }
		
	      })

	      
      })
      
      $('button#update').click(function(e){
	      
	      var $parents = $(this).parents('form');
	      var $form = $($parents[0]);
	      console.log($form);
	      //make ajax call 

	      $.ajax({
		      	type:'POST',
		      	url: $form.attr( 'action' ),
			  	data: $form.serialize(),
			  	success: function(data){
				  	var Name = $form.find('input.name').val();
				  	var id = $form.find('input.id').val()
				  	$('a[data-id='+id+']').html(Name)
				  	$('.current h1').html(Name)
				  	//console.log(data);
			  	},
			  	error:function(jqXHR){
					console.log('AJAX ERROR: ')
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				}
	      })

      })
      
      $('button#sendAlert').click(function(e){
	      if(!state.hasOwnProperty('on')){
		      alert('Change Color first!');
	      }else{
		      state.alert = {duration: 1, frequency: 0, type: 0}
		      sendAPICall(state);
		  }
      })
  
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
