<?php

// create socket and keep it open for 30 seconds
$timeout =30;
$host = "127.0.0.1";
$port = 5489;

////$stream  = fsockopen($host, $port, $errno, $errstr,$timeout);

if (!$stream ) {
  syslog(LOG_ERR, $errstr);
}

?>