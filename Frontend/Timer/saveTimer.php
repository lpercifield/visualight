<?php

$data = json_decode($_POST['data']);

$toWrite = json_encode($data);

$fp = fopen('data/timer.json', 'w');
fwrite($fp, $toWrite);
fclose($fp);

?>