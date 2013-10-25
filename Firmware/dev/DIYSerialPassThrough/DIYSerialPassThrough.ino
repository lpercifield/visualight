const int resetPin = 11;
void setup()  
{
 // Open serial communications and wait for port to open:
  Serial.begin(9600);
  pinMode(resetPin,OUTPUT);
  digitalWrite(resetPin, HIGH);
   while (!Serial) {
    ; // wait for serial port to connect. Needed for Leonardo only
  }

  
  //Serial.println("Goodnight moon!");

  // set the data rate for the SoftwareSerial port
  Serial1.begin(9600);
  //mySerial.println("Hello, world?");
}

void loop() // run over and over
{
  if (Serial1.available())
    Serial.write(Serial1.read());
  if (Serial.available())
    Serial1.write(Serial.read());
}
