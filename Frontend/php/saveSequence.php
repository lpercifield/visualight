<?php
    $myFile = "../json/sequencer.json";
    $fh = fopen($myFile, 'w') or die("can't open file");
    $string="test";
    fwrite($fh,json_encode($_POST));
    fclose($fh);
?>