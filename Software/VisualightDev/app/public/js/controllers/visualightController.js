
function VisualightController(mainCallback)
{

// bind event listeners to button clicks //
	var that = this;
	console.log("from VC");
	var timer;
	var getRequest;
	var newBulb;
// handle user logout //
	$('#btn-logout').click(function(){ 
	console.log("logout?");
	that.attemptLogout(); 
	});
	
	//that.getBulbs;
/*
// handle bulb button change

$('div.btn-group .btn').click(function(){
  $(this).find('input:radio').attr('checked', true);
  alert($('input[name=bulb-button]:checked').val());
});
*/
// handle adding first visualight //
	$('.modal-confirm .submit').click(function(){
		that.addVisualight(); 
		$('.modal-confirm').modal('hide');
	});
	$('.modal-bulb-setup .cancel').click(function(){
		//that.postNetwork();
		console.log("Aborting")
		getRequest.abort();
		clearTimeout(timer);
		$('.modal-bulb-setup').modal('hide');
	});
	$('.modal-bulb-network #set-network-form').submit(function(e){
		e.preventDefault();
		that.postNetwork();
	});
	
	$('#btn-add').click(function(){that.addVisualight();})
	//$('#btn-add').click(function(){addBulb({"mac":"00:06:66:71:cb:cd"});})
	$('.modal-bulb-network #showpass').change(function(){
		console.log("checked");
		if($('.modal-bulb-network #showpass').checked){
			$('.modal-bulb-network #showpass').attr("type","text");
		}else{
			$('.modal-bulb-network #showpass').attr("type","password");
		}
	});

	//group crap

	$('#btn-group-add').click(function(){
		that.addBulbGroup();
	})
	
	this.addBulbGroup = function () {
		// body...
		var that = this;
		//$('.modal-group-setup').modal({show:false,keyboard:false,backdrop:'static'});
		$('.modal-group-setup').modal('show');
	}
	
	this.addVisualight = function()
	{
		var that = this;
		$('.modal-bulb-setup').modal({ show : false, keyboard : false, backdrop : 'static' });
		$('.modal-bulb-setup .modal-header h3').text('Add A Visualight');
		$('.modal-bulb-setup .modal-body h4').html("Ensure that you Visualight is turned on and is glowing red - Then join the 'Visualight' wifi network");
		$(".modal-bulb-setup .modal-body img").attr("src", 'img/joinvisualight.png');
		$('.modal-bulb-setup .cancel').html('Cancel');
		$('.modal-bulb-setup .cancel').addClass('btn-danger');
		$('.modal-bulb-setup .modal-body #searching').css('display','block');
		$('.modal-bulb-setup .modal-body #success').css('display','none');
		//$('.modal-confirm .submit').html('Continue');
		$('.modal-bulb-setup').modal('show');
		getVisualight();
	}
	this.networkInput = function(){
		var that = this;
		$('.modal-bulb-setup').modal('hide');
		
		$('.modal-bulb-network').modal({ show : false, keyboard : false, backdrop : 'static' });
		$('.modal-bulb-network .modal-header h3').text('Add A Visualight');
		$('.modal-bulb-network .modal-body h4').html("Enter you Wifi network name and password - Capitalization Counts");
		$('.modal-bulb-network .modal-body #set-network-form').css('display','block');
		$('.modal-bulb-network .modal-body #searching').css('display','none');
		$('.modal-bulb-network .modal-footer .cancel').css('display','inline');
	 	$('.modal-bulb-network .modal-footer .submit').css('display','none');
		$('.modal-bulb-network .cancel').addClass('btn-danger');
		$('.modal-bulb-network').modal('show');
		
	}
	this.postNetwork = function(){
		var that = this;
		$.ajax({
			url: "http://1.2.3.4",
			type: "POST",
			timeout: 5000,
			data: {network : $('.modal-bulb-network #network').val(), password : $('.modal-bulb-network #password').val()},
			success: function(data){
	 			//that.showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
	 			console.log("posted");
	 			//addBulb(newBulb)
	 			$('.modal-bulb-network .modal-body h4').html("Success! Now switch you wifi back to " + $('.modal-bulb-network #network').val());
	 			$('.modal-bulb-network .modal-body #searching').css('display','block');
	 			$('.modal-bulb-network .modal-body #set-network-form').css('display','none');
	 			$('.modal-bulb-network .cancel').click(function(){
		 			//that.postNetwork();
		 			console.log("Aborting")
		 			clearTimeout(timer);
	}			);
	 			getNetworkConnection();
	 			//$('.modal-bulb-setup .modal-body #searching').html("Success!");
	 			//setTimeout(that.networkInput, 1000);
			},
			error: function(request,error){
				console.log(arguments);
				 //$.ajax(this);
                //return;
			}
		});
	}
	//this.getVisualight = function(){
	function getVisualight(){
		//var that = this;
		console.log("Getting visualight...")
		getRequest = $.ajax({
			url: "http://1.2.3.4/mac",
			type: "GET",
			dataType: 'json',
			timeout: 8000,
			success: function(data){
				clearTimeout(timer);
				console.log(data)
				//addBulb(data);
				newBulb = data;
	 			//that.showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
	 			$('.modal-bulb-setup .modal-body #searching').css('display','none');
	 			$('.modal-bulb-setup .modal-body #success').css('display','block');
	 			timer = setTimeout(that.networkInput, 1000);
			},
			error: function(request,error){
				console.log(arguments);
				timer = setTimeout(getVisualight, 2000);
				 //$.ajax(this);
                //return;
			}
		});
	}
	function getNetworkConnection(){
		//var that = this;
		console.log("Getting network...")
		getRequest = $.ajax({
			url: "/myvisualight",
			type: "GET",
			timeout: 2000,
			cache: false,
			success: function(data){
				clearTimeout(timer);
				addBulb(newBulb);
	 			//that.showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
	 			

	 			//setTimeout(that.networkInput, 1000);
	 	},
			error: function(request,error){
				console.log(arguments);
				timer = setTimeout(getNetworkConnection, 2000);
				 //$.ajax(this);
                //return;
			}
		});
	}
	
	this.attemptLogout = function()
	{
		var that = this;
		$.ajax({
			url: "/home",
			type: "POST",
			data: {logout : true},
			success: function(data){
	 			that.showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}
	function addBulb(bulbMac)
	{
		var that = this;
		$.ajax({
			url: "/add-bulb",
			type: "POST",
			data: {bulb : bulbMac},
			success: function(data){
	 			//that.showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
	 			$('.modal-bulb-network .modal-body h4').html("YAY We're Finally Done!!");
	 			$('.modal-bulb-network .modal-body #searching').css('display','none');
	 			$('.modal-bulb-network .modal-footer .cancel').css('display','none');
	 			//$('.modal-bulb-network .modal-footer .cancel').html("WTF??");
	 			$('.modal-bulb-network .modal-footer .submit').addClass('btn-success');
	 			$('.modal-bulb-network .modal-footer .submit').css('display','block');
	 			$('.modal-bulb-network .modal-footer .submit').click(function(){
	 				$('.modal-bulb-network').modal('hide');
	 				mainCallback();
	 			});
	 			console.log(data)
	 			
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}
	this.showLockedAlert = function(msg){
		$('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
		$('.modal-alert .modal-header h3').text('Success!');
		$('.modal-alert .modal-body p').html(msg);
		$('.modal-alert').modal('show');
		$('.modal-alert button').click(function(){window.location.href = '/';})
		setTimeout(function(){window.location.href = '/';}, 3000);
	}
	
	this.getBulbs = function(callback)
	{
		//$('.modal-confirm').modal('hide');
		//var that = this;
		$.ajax({
			url: '/get-bulbs',
			type: 'get',
			success: function(data){
				console.log(data);
				console.log(data.length);
				addBulbButtons(data,callback);
				addBulbGroupList(data);
				$('#account-form-container #main').css("display", "block");
				$('#account-form-container #nobulbs').css("display","none");
	 			//that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
				$('#account-form-container #main').css("display", "none");
				$('#account-form-container #nobulbs').css("display","inline");
				$('.modal-confirm').modal({ show : false, keyboard : false, backdrop : 'static' });
				$('.modal-confirm .modal-header h3').text('Add A Visualight');
				$('.modal-confirm .modal-body p').html("You don't have any Visualights setup - click continue to add one");
				$('.modal-confirm .cancel').html('Cancel');
				$('.modal-confirm .submit').html('Continue');
				$('.modal-confirm').modal('show');
				$('.modal-confirm .cancel').addClass('btn-danger');
			}
		});
	}
	//http://stackoverflow.com/questions/118693/how-do-you-dynamically-create-a-radio-button-in-javascript-that-works-in-all-bro
/*
	function createRadioElement( name, val, checked ) {
    var radioInput;
    try {
        var radioHtml = '<button class="btn btn-primary';
    	if ( checked ) {
        	radioHtml += ' active';
        }
        radioHtml += '" value="'+val+'">'+name+'</button>';
        radioInput = document.createElement(radioHtml);
    } catch( err ) {
        radioInput = document.createElement('button');
        var t=document.createTextNode(name);
        radioInput.setAttribute('class', 'btn btn-primary');
        radioInput.appendChild(t)
        //radioInput.html(name);
        /*
if ( checked ) {
            radioInput.setAttribute('checked', 'checked');
        }

    //}
*/

    //return radioInput;
//	}
	function createRadioElement(name, val, checked) {
	//<button type="button" class="btn btn-primary">
    	var radioHtml = '<button type="Button" data-toggle="button" class="btn btn-primary';
    	if ( checked ) {
        	radioHtml += ' active';
        }
        radioHtml += '">'+name+'<input type="radio" bulbname="'+name+'" name="bulb-button" value="'+val+'" /></button>';

        var radioFragment = document.createElement('div');
        radioFragment.innerHTML = radioHtml;

        return radioFragment.firstChild;
    }
    
    function addBulbButtons(bulbData, callback){
    	var checked = true;
    	var buttonDiv = document.getElementById('blub-buttons');
	    for(var i =0;i<bulbData.length;i++){
	    	if(i>0){
		    	checked = false
	    	}
	    	buttonDiv.appendChild(createRadioElement(bulbData[i].name,bulbData[i].id,checked));
		}
		callback(buttonDiv);
    }

    function addBulbGroupList(bulbData){

    	//$('.modal-group-setup form');
    	for(var i=0; i<bulbData.length; i++){

    		var html = '<p>'+bulbData[i].name+'<input type="checkbox" name="'+bulbData[i].name+'" value="'+bulbData[i].id+'"/></p>';
    		$('.modal-group-setup form').append(html);
    	}
    }


	
}
