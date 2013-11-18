$(document).ready( function (){

  var eyedropper=false;
  var bulbNumber, beatNumber;

  var f=$.farbtastic('#color-picker');
  f.linkTo(function(){
    updateColor();
  });

	$.getJSON('/json/sequencer.json', function(data){
		var grid = [];
    var i=0;
    beatNumber=data.bulbs[0].beats.length;
    bulbNumber=data.bulbs.length;
    $('#beat-count').html(beatNumber+' Beats');

    //setup initial form and grid of colors loaded from JSON
    //input items store data formatted 65000, 255, 255 - css background formatted 360, 100%, 100% - data on div formatted 1, 1, 1
		
		$.each(data.bulbs, function() {
    		var html='<li class="bulb"><input type="hidden" name="bulbs['+i+'][id]" value="'+this.id+'"><input type="hidden" name="bulbs['+i+'][name]" value="'+this.name+'"><h1 class="name">' + this.name + '</h1><ul class="beats">';
    		console.log(this.name);
        var j=0;
    		$.each(this.beats, function(){
          html+='<li class="beat"><div class="color-button" data-hue="'+(parseInt(this.hue/182.04))/360+'" data-sat="'+(this.sat/255)+'" data-level="'+(this.level/255)+'"style="background-color: hsl('+(parseInt(this.hue/182.04))+','+(this.sat/255)*100+'%,'+(this.level/255)*100+'%)">';
    			html+='<input type="hidden" name="bulbs['+i+'][beats]['+j+'][hue]" value="'+parseInt(this.hue)+'" data-value="hue">';
          html+='<input type="hidden" name="bulbs['+i+'][beats]['+j+'][sat]" value="'+parseInt(this.sat)+'" data-value="sat">';
          html+='<input type="hidden" name="bulbs['+i+'][beats]['+j+'][level]" value="'+parseInt(this.level)+'" data-value="level"></div></li>';
          
    		j++;
        });
    		html+='</ul> </li>';
    		grid.push(html);
        i++;
  		});
  		
      $( "<ul>", {
   			 "class": "bulbs",
   			 html: grid.join( "" )
  		}).appendTo( "#grid");


      //listener for click on color buttons
  		$('body').delegate(".color-button","click",function(){
        if(eyedropper==false){
          console.log('click');
          if($(this).hasClass('active')){
  			   	$(this).removeClass('active');
          }
  			  else{
  			   	$(this).addClass('active');
            var newColor=[parseFloat($(this).attr('data-hue')),parseFloat($(this).attr('data-sat')),parseFloat($(this).attr('data-level'))];
            f.setHSL(newColor);
            console.log(newColor);
            console.log(f.hsl);
  			  }
        }
        else{
          var newColor=[parseFloat($(this).attr('data-hue')),parseFloat($(this).attr('data-sat')),parseFloat($(this).attr('data-level'))];
          f.setHSL(newColor);
          updateColor(); 
        }
		});
	});

//listener for click on eyedropper selector
$('#eyedropper').click(function(){
  if(eyedropper==false){
      eyedropperOn();
  }
  else{
    eyedropperOff();
  }
});


//deselect all listener
$('#deselect').click(function(){
  $('.active').removeClass('active');
});

//deselect all listener
$('#select').click(function(){
  $('.color-button').addClass('active');
});

//save button listener
$('#sequencer-data').submit(function(e){
  $.post(
      'php/saveSequence.php',
       $(this).serialize(),
          function(data){
              alert('You have saved your sequence');
                }
              );
              return false;

});

$('#add-bulb').submit(function(event){
    event.preventDefault();
    var bulbName=$(this).find('select').val();
    bulbID=$(this).find('option[value="'+bulbName+'"]').attr("data-id");
    console.log(bulbID);
    var html='<li class="bulb"><input type="hidden" name="bulbs['+bulbNumber+'][id]" value="'+bulbID+'"><input type="hidden" name="bulbs['+bulbNumber+'][name]" value="'+bulbName+'"><h1 class="name">' + bulbName + '</h1><ul class="beats">';
      var j=0;
      for(var i=0;i<beatNumber;i++){
        html+='<li class="beat"><div class="color-button" data-hue="0" data-sat="0" data-level="0"style="background-color: hsl(0,0%,0%)">';
        html+='<input type="hidden" name="bulbs['+bulbNumber+'][beats]['+i+'][hue]" value="0" data-value="hue">';
        html+='<input type="hidden" name="bulbs['+bulbNumber+'][beats]['+i+'][sat]" value="0" data-value="sat">';
        html+='<input type="hidden" name="bulbs['+bulbNumber+'][beats]['+i+'][level]" value="0" data-value="level"></div></li>';
      }
      html+='</ul> </li>';
      $('.bulbs').append(html);
});

$('#add-beat').click(function(){
  var i=0;
  $('.beats').each( function(){ 
    var html='<li class="beat"><div class="color-button" data-hue="0" data-sat="0" data-level="0"style="background-color: hsl(0,0%,0%)">';
    html+='<input type="hidden" name="bulbs['+i+'][beats]['+beatNumber+'][hue]" value="0" data-value="hue">';
    html+='<input type="hidden" name="bulbs['+i+'][beats]['+beatNumber+'][sat]" value="0" data-value="sat">';
    html+='<input type="hidden" name="bulbs['+i+'][beats]['+beatNumber+'][level]" value="0" data-value="level"></div></li>'; 
    i++;
    $(this).append(html);
  });
  beatNumber++;
  $('#beat-count').html(beatNumber+' Beats');
});

$('#remove-beat').click(function(){
  $('.beat:last-child').remove();
  beatNumber--;
  $('#beat-count').html(beatNumber+' Beats');
});


  function updateColor(){
    $('.active').each(function(){
      $(this).css('background-color','hsl('+f.hsl[0]*360+','+f.hsl[1]*100+'%,'+f.hsl[2]*100+'%)').attr('data-hue',f.hsl[0]).attr('data-sat',f.hsl[1]).attr('data-level',f.hsl[2]);
      $(this).find('input[data-value="hue"]').attr('value',f.hsl[0]*360*182.04);
      $(this).find('input[data-value="sat"]').attr('value',f.hsl[1]*255);
      $(this).find('input[data-value="level"]').attr('value',f.hsl[2]*255);
    });
  }

  function eyedropperOn(){
    eyedropper=true;
    $('#eyedropper').css('background-color','#ff0').css('color','black');
    $('.color-button').css('cursor','url("/img/cursor.cur"), auto');
  }

  function eyedropperOff(){
    eyedropper=false;
    $('#eyedropper').css('background-color','black').css('color','white');
    $('.color-button').css('cursor','auto');
  }

});
