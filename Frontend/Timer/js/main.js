// var socket = io.connect('http://localhost:9001'); // connect client to the server
// this app is using pickatime.js library

var chk_one = $('.chkOne');
var chk_everyday = $('.chkEvery');
var sum = $('.summary_time');
var input_time = $('#inputTime');
var input_name = $('#inputName');
var option = {
	name: '',
	time: '',
	day: ''
};

// when add new timer

$('#btnAddTimer').click(function() {
	// clone template
	cloneTmp();
	input_time.pickatime();
});

// load timer.json
// I know it's not gonna look like this ...
// hide template
$('#formTmp').hide();
var timerArray = [];
$.getJSON('data/timer.json', function(data) {
	console.log('making ajax call');
	timerArray = data;
	$.each(data, function(k, v) {
		console.log(v);
		showListTimer(v.id, v.name, v.time, v.group, v.repeat);
	});
});

// When new timer
function cloneTmp() {
	var id = 'n#' + Math.floor(Math.random() * 10000);
	timerArray.push({
		id: id
	});
	$('#formTmp')
		.clone()
		.attr('id', id)
		.addClass('timer')
		.appendTo('#container')
		.show()
		.children('#inline')
		.children('.inputName')
		.parent()
		.children('.inputTime')
	// inject pickatime
	.pickatime({});
}

// When show list
function showListTimer(id, name, time, group, repeat) {
	// put repeat in an array
	// console.log(repeat);
	// clone form
	$('#formTmp')
		.clone()
		.attr('id', id)
		.addClass('timer')
		.appendTo('#container')
		.show()
		.children('#inline')
		.children('.inputName').val(name)
		.parent()
		.children('.inputTime').val(time)
	// inject pickatime
	.pickatime()
	// check repeat checkbox if selected
	.parent()
		.children('#' + repeat[0]).prop('checked', true)
		.parent()
		.children('#' + repeat[1]).prop('checked', true)
		.parent()
		.children('#' + repeat[2]).prop('checked', true)
		.parent()
		.children('#' + repeat[3]).prop('checked', true)
		.parent()
		.children('#' + repeat[4]).prop('checked', true)
		.parent()
		.children('#' + repeat[5]).prop('checked', true)
		.parent()
		.children('#' + repeat[6]).prop('checked', true)
		.parent()
		.children('#' + repeat[7]).prop('checked', true);
}

// When submit
$('#submit').on('click', function(e) {
	e.preventDefault();
	var tmpArray = [];
	$('form.timer').each(function(i, v) {
		var id = v.id;
		// console.log(id);
		var repeat = [];
		$(this).children('#inline').children('input[type="checkbox"]').each(function(i, v) {
			if (this.checked) {
				repeat.push(v.id);
				console.log(v);
			}
		});
		tmpArray.push({
			id: id,
			name: $('.inputName')[i + 1].value,
			time: $('.inputTime')[i + 1].value,
			repeat: repeat
		});
	});
	timerArray = tmpArray;
	// check if any form is blank
	if(JSON.stringify(timerArray).indexOf('""') > 0) {
		alert('Please fill all the forms!');
	} else {
		$.post('saveTimer.php', {
		data: JSON.stringify(timerArray)
	}, function() {
		alert('json updated!');
		console.log('post done!');
	});
	}
});