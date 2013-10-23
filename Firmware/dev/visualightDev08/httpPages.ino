
void sendMac()
{
  /* Send the header direclty with print */
  wifly.println(F("HTTP/1.1 200 OK"));
  wifly.println(F("Connection: close"));
  wifly.println(F("Content-Type: application/json"));
  wifly.println(F("Transfer-Encoding: chunked"));
  wifly.println(F("Access-Control-Allow-Origin: *"));
  wifly.println();

  /* Send the body using the chunked protocol so the client knows when
   * the message is finished.
   * Note: we're not simply doing a close() because in version 2.32
   * firmware the close() does not work for client TCP streams.
   */
  wifly.sendChunk(F("{\"mac\":\""));
  wifly.sendChunk(MAC);
  wifly.sendChunk(F("\"}"));
  wifly.sendChunkln();
  wifly.sendChunkln();
  // enctype=\"text/plain\"
}
/** Send an index HTML page with an input box for a network name and password */
void sendIndex()
{
  /* Send the header direclty with print */
  wifly.println(F("HTTP/1.1 200 OK"));
  wifly.println(F("Connection: close"));
  wifly.println(F("Content-Type: text/html"));
  wifly.println(F("Transfer-Encoding: chunked"));
  wifly.println(F("Access-Control-Allow-Origin: *"));
  wifly.println();

  /* Send the body using the chunked protocol so the client knows when
   * the message is finished.
   * Note: we're not simply doing a close() because in version 2.32
   * firmware the close() does not work for client TCP streams.
   */
    wifly.sendChunkln(F("<html>"));
    wifly.sendChunkln(F("<head><title>Visualight Setup</title>"));
    wifly.sendChunkln(F("<style>body{width:100%;margin:0;padding:0;background:#999;font-family:sans-serif;}"));
    wifly.sendChunkln(F("h1,h3{margin:2% auto;width:80%;}div{margin: 10% auto 0;width:60%;padding:4%;background:#f9f9f9;border-radius:15px;}"));
    wifly.sendChunkln(F("input{display:block;width:80%;margin:4% auto;font-size:1.2em;padding:1%;background:#fff;}"));
    wifly.sendChunkln(F("select{display:block;width:80%;margin:4% auto;height:40px;font-size:1em;background:#fff;}"));
    wifly.sendChunkln(F("input[type=\"submit\"]{width:30%;padding:1%;background:#222;color:#ddd;border-radius:15px;}form{width:90%;margin:0 auto;}"));
    wifly.sendChunkln(F("</style></head>"));
    wifly.sendChunkln(F("<body><div>"));
    wifly.sendChunkln(F("<form name=\"input\" action=\"/\" method=\"post\">"));
    wifly.sendChunkln(F("<h1>Visualight</h1>"));
    wifly.sendChunkln(F("<h3>We&rsquo;ll need a little data to get started</h3>"));
    wifly.sendChunkln(F("<input type=\"text\" name=\"network\" placeholder=\"YOUR WIFI SSID\" />"));
    wifly.sendChunkln(F("<input type=\"text\" name=\"password\" placeholder=\"YOUR WIFI PASS\" />"));
    wifly.sendChunkln(F("<input type=\"submit\" value=\"Submit\" />"));
    wifly.sendChunkln(F("</form></div>")); 
    wifly.sendChunkln(F("</body></html>"));
    wifly.sendChunkln();
    wifly.sendChunkln();
  // enctype=\"text/plain\"
}

/** Send a greeting HTML page with the user's name and an analog reading */
void sendGreeting(char *name)
{
  /* Send the header directly with print */
  wifly.println(F("HTTP/1.1 200 OK"));
  wifly.println(F("Connection: close"));
  wifly.println(F("Content-Type: text/html"));
  wifly.println(F("Transfer-Encoding: chunked"));
  wifly.println(F("Access-Control-Allow-Origin: *"));
  wifly.println();

  /* Send the body using the chunked protocol so the client knows when
   * the message is finished.
   */
  wifly.sendChunkln(F("<html>"));
  wifly.sendChunkln(F("<title>Visualight Setup</title>"));
  /* No newlines on the next parts */
  wifly.sendChunk(F("<h1><p>Hello "));
  wifly.sendChunk(name);
  /* Finish the paragraph and heading */
  wifly.sendChunkln(F("</p></h1>"));
  wifly.sendChunkln(F("</html>"));
  wifly.sendChunkln();
  wifly.sendChunkln();
}

/** Send a 404 error */
void send404()
{
  wifly.println(F("HTTP/1.1 404 Not Found"));
  wifly.println(F("Connection: close"));
  wifly.println(F("Content-Type: text/html"));
  wifly.println(F("Transfer-Encoding: chunked"));
  wifly.println(F("Access-Control-Allow-Origin: *"));
  wifly.println();
  wifly.sendChunkln(F("<html><head>"));
  wifly.sendChunkln(F("<title>404 Not Found</title>"));
  wifly.sendChunkln(F("</head><body>"));
  wifly.sendChunkln(F("<h1>Not Found</h1>"));
  wifly.sendChunkln(F("<hr>"));
  wifly.sendChunkln(F("</body></html>"));
  wifly.sendChunkln();
  wifly.sendChunkln();
}
