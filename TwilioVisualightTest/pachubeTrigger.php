<?php
    

// retrieve the POST variable 'body' and stripslashes
// since PHP escapes strings in POST variables

$trigger = rawurldecode(substr(stripslashes(file_get_contents('php://input')),5));

// decode the JSON

$json = json_decode($trigger);

// extract the variables

$environment_id = $json->{'environment'}->{'id'};
$datastream_id = $json->{'triggering_datastream'}->{'id'};
$value = $json->{'triggering_datastream'}->{'value'}->{'value'};
$timestamp = $json->{'timestamp'};

// build the message

$message = "Trigger activated by feed $environment_id, datastream $datastream_id, with a value of $value at $timestamp.\n\n";
$message .= "Complete trigger message: \n $trigger";

// use wordwrap in case lines are too long for email
$message = wordwrap($message, 70);

// then send the email -- be sure to enter your email address below!

$myFile = "bulb.txt";
$fh = fopen($myFile, 'w') or die("can't open file");
fwrite($fh, $value);
fclose($fh);
   
?>