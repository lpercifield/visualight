/** Send an index HTML page with an input box for a network name and password */
void sendIndex()
{
  /* Send the header direclty with print */
  wifly.println(F("HTTP/1.1 200 OK"));
  wifly.println(F("Content-Type: text/html"));
  wifly.println(F("Transfer-Encoding: chunked"));
  wifly.println();

  /* Send the body using the chunked protocol so the client knows when
   * the message is finished.
   * Note: we're not simply doing a close() because in version 2.32
   * firmware the close() does not work for client TCP streams.
   */
  wifly.sendChunkln(F("<html>"));
  wifly.sendChunkln(F("<title>WiFly HTTP Server Example</title>"));
  wifly.sendChunkln(F("<h1>"));
  wifly.sendChunkln(F("<p>Hello</p>"));
  wifly.sendChunkln(F("</h1>"));
  wifly.sendChunkln(F("<form name=\"input\" action=\"/\" method=\"post\">"));
  wifly.sendChunkln(F("Network:"));
  wifly.sendChunkln(F("<input type=\"text\" name=\"network\" />"));
  wifly.sendChunkln(F("Password:"));
  wifly.sendChunkln(F("<input type=\"text\" name=\"password\" />"));
  wifly.sendChunkln(F("<input type=\"submit\" value=\"Submit\" />"));
  wifly.sendChunkln(F("</form>")); 
  wifly.sendChunkln(F("</html>"));
  wifly.sendChunkln();
  // enctype=\"text/plain\"
}

/** Send a greeting HTML page with the user's name and an analog reading */
void sendGreeting(char *name)
{
  /* Send the header directly with print */
  wifly.println(F("HTTP/1.1 200 OK"));
  wifly.println(F("Content-Type: text/html"));
  wifly.println(F("Transfer-Encoding: chunked"));
  wifly.println();

  /* Send the body using the chunked protocol so the client knows when
   * the message is finished.
   */
  wifly.sendChunkln(F("<html>"));
  wifly.sendChunkln(F("<title>WiFly HTTP Server Example</title>"));
  /* No newlines on the next parts */
  wifly.sendChunk(F("<h1><p>Hello "));
  wifly.sendChunk(name);
  /* Finish the paragraph and heading */
  wifly.sendChunkln(F("</p></h1>"));

  /* Include a reading from Analog pin 0 */
  //  snprintf_P(buf, sizeof(buf), PSTR("<p>Analog0=%d</p>"), analogRead(A0));
  //  wifly.sendChunkln(buf);

  wifly.sendChunkln(F("</html>"));
  wifly.sendChunkln();
}

/** Send a 404 error */
void send404()
{
  wifly.println(F("HTTP/1.1 404 Not Found"));
  wifly.println(F("Content-Type: text/html"));
  wifly.println(F("Transfer-Encoding: chunked"));
  wifly.println();
  wifly.sendChunkln(F("<html><head>"));
  wifly.sendChunkln(F("<title>404 Not Found</title>"));
  wifly.sendChunkln(F("</head><body>"));
  wifly.sendChunkln(F("<h1>Not Found</h1>"));
  wifly.sendChunkln(F("<hr>"));
  wifly.sendChunkln(F("</body></html>"));
  wifly.sendChunkln();
}
