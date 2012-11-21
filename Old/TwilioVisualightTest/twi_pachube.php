<?php
require_once( 'pachube_functions.php' );


# *****************************************************************
#
# Create a Pachube object and pass your API key
#
# *****************************************************************


$api_key = "YOURAPIKEYHERE";
$feed = "YOURFEED";

//echo "<hr>";
//echo "<li><b>Create a Pachube object with your API key: </b>";
//echo '<code>$pachube = new Pachube($api_key); </code>';

$pachube = new Pachube($api_key);
#/*
# *****************************************************************
#
# update manual feed: CSV
#
# *****************************************************************

$stringData = $_REQUEST['Digits'];
$url = "http://www.pachube.com/api/$feed.csv";
$update_status = $pachube->updatePachube ( $url, $stringData );	
//$pachube->debugStatusCode($update_status);
echo '<?xml version="1.0" encoding="UTF-8"?>';

switch($stringData){
case 7:
echo "<Response>";
echo "<Say> Thank you, Good bye.</Say>";
echo "<hangup/>";
echo "</Response>";
break;

case 6:
echo "<Response>";
echo "<Redirect>";
echo "http://leifp.com/pachube_php/twi_visualight.php";
echo "</Redirect>";
echo "</Response>";
break;

case 5:
echo "<Response>";
echo "<Say> You have turned the light off</Say>";
echo "<Redirect>";
echo "http://leifp.com/pachube_php/twi_visualight.php";
echo "</Redirect>";
echo "</Response>";
break;

case 4:
echo "<Response>";
echo "<Say> You have turned the light white...</Say>";
echo "<Redirect>";
echo "http://leifp.com/pachube_php/twi_visualight.php";
echo "</Redirect>";
echo "</Response>";
break;

case 3:
echo "<Response>";
echo "<Say> You have turned the light blue...</Say>";
echo "<Redirect>";
echo "http://leifp.com/pachube_php/twi_visualight.php";
echo "</Redirect>";
echo "</Response>";
break;

case 2:
echo "<Response>";
echo "<Say> You have turned the light green...</Say>";
echo "<Redirect>";
echo "http://leifp.com/pachube_php/twi_visualight.php";
echo "</Redirect>";
echo "</Response>";
break;

case 1:
echo "<Response>";
echo "<Say> You have turned the light red...</Say>";
echo "<Redirect>";
echo "http://leifp.com/pachube_php/twi_visualight.php";
echo "</Redirect>";
echo "</Response>";
}

?>