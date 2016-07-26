<?php
session_start();
$r = new stdClass();
$r->success = false;

include ("../lib/login_checker.php");

/* login_check() return 0: no login, 1: login, admin, 2: login, normal user */
if (login_check() != 1)
{
	echo json_encode($r);
	exit;
}

$username = $_COOKIE['username'];
exec("wto -n \"$username\" -g", $ret);
sscanf($ret[0], "timeout : %d", $timeout_val);
$res = array();
exec("xmldbc -g /system_mgr/idle/time", $res);
$web_timeout = $res[0]*60;

if ($timeout_val == -1 || strlen($username)==0 || $timeout_val >= $web_timeout)
{
	header('Content-type: text/xml');
	echo "<info><status>timeout</status><timeout>$timeout_val</timeout><u>$username</u></info>";
	return;
}

$cmd = $_REQUEST['cmd'];
$dev = $_REQUEST['dev'];
switch ($cmd) {
	case "send_log":
		send_log($dev);
		break;
}

$default_serial_num = "WXF1A61E2119";
function send_log($dev)
{
	$serial_num = get_serial_number();
	$time_stamp = time();
	
	if(strlen($serial_num)==0) 
	{
		//echo "<info><status>ng</status></info>";
		//return;
		
		$serial_num = "WXF1A61E2119";
	}
	$logFilename = "systemLog_".$dev."_".$serial_num."_".$time_stamp;
	$logFilePath="/tmp/$logFilename.zip";	//systemLog_LT4A_WCAZA0470171_1338507712.zip

	$accountPw = "lt4a_user:4lt4a_u!";
	$folderName = "";
	switch($dev)
	{
		case 'BZVM':	//zion
			$accountPw = "bzvm_user:4bzvm_u!";
			break;
		case 'KC2A':	//kc
			$accountPw = "kc2a_user:4kc2a_u!";
			break;
		case 'LT4A':	//lt4a
			$accountPw = "lt4a_user:4lt4a_u!";
			break;
		case 'GLCR':	//glacier
			$accountPw = "glcr_user:4glcr_u!";
			$folderName = "glcr";
			break;
		case 'BWZE':	//yellowstone
			$accountPw = "bwze_user:4bwze_u!";
			$folderName = "bwze";
			break;
		case 'BWAZ':	//yosemite
			$accountPw = "bwaz_user:4bwaz_u!";
			$folderName = "bwaz";
			break;
		case 'BNEZ':	//sprite
			$accountPw = "bnez_user:4bnez_u!";
			$folderName = "bnez";
			break;
		case 'BBAZ':	//aurora
			$accountPw = "bbaz_user:4bbaz_u!";
			$folderName = "bbaz";
			break;
		case 'BG2Y':	//black ice
			$accountPw = "bg2y_user:4bg2y_u!";
			$folderName = "bg2y";
			break;
		case 'BAGX':	//Mirrorman
			$accountPw = "bagx_user:4bagx_u!";
			$folderName = "bagx";
			break;
		case 'BWVZ':	//GrandTeton
			$accountPw = "bwvz_user:4bwvz_u!";
			$folderName = "bwvz";
			break;
		case 'BVBZ':	//Ranger Peak 
			$accountPw = "bvbz_user:4bvbz_u!";
			$folderName = "bvbz";
			break;
		case 'BNFA':	//Black Canyon
			$accountPw = "bnfa_user:4bnfa_u!";
			$folderName = "bnfa";
			break;
		case 'BBCL':	//Bryce Canyon
			$accountPw = "bbcl_user:4bbcl_u!";
			$folderName = "bbcl";
			break;
	}
	
	if(get_system_log($logFilePath,$logFilename))
	{
		//curl -4 -T $logFilePath ftp://ftpext2.wdc.com --user ${supportFTPLogin} 2> /dev/null
		$curlCmd = "curl --silent -4 -T \"$logFilePath\" \"ftp://ftpext2.wdc.com\" --user \"$accountPw\" ; echo $?";
		
		//CURLE_LOGIN_DENIED (67)
		
		$output = shell_exec($curlCmd);
		unlink($logFilePath);
		$output = trim($output, "\n");
		header('Content-type: text/xml');
		echo "<info><status>ok</status><logfile>$logFilename.zip</logfile><serial_num>$serial_num</serial_num><code>$output</code></info>";
	}
	else
	{
		header('Content-type: text/xml');
		echo "<info><status>ng</status><code>-1</code><msg>Error in generating system log.</msg><path>$logFilePath</path><file>$logFilename</file></info>";
	}
}
function get_serial_number()
{
	$serial_number ="";
	
	if(file_exists("/tmp/wd_serial.txt"))
	{
		$fp = fopen("/tmp/wd_serial.txt","r");
	if ( $fp )
	{
		$serial_number = fgets($fp, 512);
		fclose($fp);
	}
	}
	
	return trim($serial_number) ;
}
function get_system_log($logFilePath,$fileName)
{
	$cmd = "zip_system_log.sh \"$fileName\"";
	system($cmd);

	if (file_exists($logFilePath))
	{
		return true;
	}
	else
	{
		 return false;
	}
}
?>