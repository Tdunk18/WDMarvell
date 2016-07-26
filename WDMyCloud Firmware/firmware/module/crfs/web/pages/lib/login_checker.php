<?php
/* ret: 0: no login, 1: login, admin, 2: login, normal user */

function login_check()
{
	$ret = 0;
	
	if (isset($_SESSION['username']))
	{
		if (isset($_SESSION['username']) && $_SESSION['username'] != "")
		$ret = 2; //login, normal user

		if ($_SESSION['isAdmin'] == 1)
			$ret = 1; //login, admin
	}
	else if (isset($_COOKIE['username']))
	{
		if (isset($_COOKIE['username']) && $_COOKIE['username'] != "")
		$ret = 2; //login, normal user

		if ($_COOKIE['isAdmin'] == 1)
			$ret = 1; //login, admin
	}
	
	

	return $ret;
}
?>