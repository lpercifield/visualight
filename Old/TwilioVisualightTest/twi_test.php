<?php
header("content-type: text/xml");
echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
?>
<Response>
<Say>Hello</Say>
<Gather action="twi_pachube.php" numDigits ="1" method="POST">
    <Say>Press 1 to turn the light red...... Press 2 to turn the light green...... Press 3 to turn the light blue...... Press 4 to to turn the light white...... Press 5 to turn the light off...... Press 6 to repeat this menu and press 7 to hang up.</Say>
</Gather>
</Response>
