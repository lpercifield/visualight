$(document).ready( function (){
	$.getJSON('/json/sequencer.json', function(data){
		var grid = [];
		
		$.each(data.lights, function() {
    		var html="<li id='" + this.name  + "' class='bulb'><h1 class='name'>" + this.name + "</h1><ul class='beats'>";
    		console.log(this.name);
    		$.each(this.beats, function(){
    			html+='<li class="beat"><div class="color-button" style="background-color: hsl('+(parseInt(this[0]/182.04))+','+(this[1]/255)*100+'%,'+(this[2]/255)*100+'%)"></div></li>';
    		});
    		html+='</ul> </li>';
    		grid.push(html);
  		});
  		$( "<ul>", {
   			 "class": "bulbs",
   			 html: grid.join( "" )
  		}).appendTo( "#grid" ,function(){

  		});
  		$('.color-button').click(function(){
			console.log('click');
			if($(this).hasClass('active')){
				$(this).removeClass('active');
			}
			else{
				$(this).addClass('active');
			}
		});
	});

});
