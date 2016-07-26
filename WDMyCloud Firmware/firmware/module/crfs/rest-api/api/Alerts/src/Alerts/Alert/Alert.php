<?php

namespace Alerts\Alert;

/*
 * Container class for alerts. To create an alert instance you need to supply a line
 * of text from the alert log file to the constructor which will parse the alert log
 * line and set the member variables: $timestamp, $severity, $code, $message.
 *
 * @author Sapsford_J
 *
 * Expected Alert Format:
 * Sep  9 14:58:33 localhost wdnas3g: CRITICAL: 06: Network Interface Card failure
 * OR
 * Sep  9 14:58:33 localhost wdnas3g: CRITICAL: 16: With subst values. +;sp1;share;device;-
 */

class Alert {

	//private static  $months = array("Jan","Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");

    public  $timestamp;
    public  $severity;
    public  $id;
    public  $code;
    public  $message;
    public  $subst_values;
    public  $acknowledged;

    function __construct($row) {
        if(preg_match('/^(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)$/', $row['timestamp'], $alertTime)) {
			$this->timestamp = mktime($alertTime[4], $alertTime[5], $alertTime[6], $alertTime[2], $alertTime[3], $alertTime[1]);
		}
		else {
			$this->timestamp = $row['timestamp'];
		}
		$this->id = $row['id'];
		$this->code = $row['code'];
		$this->severity = $row['value'];
		$this->message = $row['description'];
		$this->acknowledged = $row['acknowledged'];

        if(preg_match('/\+;(.*);\-/', $row['desc'], $matches)) {
            $this->subst_values = explode(";", $matches[1]);
        } else {
            $this->subst_values = NULL;
        }
	}
}