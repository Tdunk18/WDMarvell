<?
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
if (isset($_POST['username']) && $_POST['username'] != "")
{
	$username = $_POST['username'];
	$oldName = $_POST['oldName'];
	$ip = $_SERVER['REMOTE_ADDR'];

	if (isset($_SESSION['username']))
	{
		$sname = $_SESSION['username'];
		$debugCmd="echo old:$sname >/tmp/debug";
		exec($debugCmd, $ret);
		
	unset($_SESSION['username']);
	$_SESSION['username'] = $username;
	
		$sname = $_SESSION['username'];
		$debugCmd="echo new:$sname >>/tmp/debug";
		exec($debugCmd, $ret);
		
	session_write_close();
	
		//echo $_SESSION['username'];
	}
	else
	{
		$debugCmd="echo 'no session' >>/tmp/debug";
		exec($debugCmd, $ret);
	}
	
	//wto delete 
	$cmd = "wto -n \"$oldName\" -d ";
	system($cmd,$retval);
	
	//wto add
	$cmd = "wto -n \"$username\" -i \"$ip\" -s";
	system($cmd,$retval);
	
	header("Status: 200");
}
?>