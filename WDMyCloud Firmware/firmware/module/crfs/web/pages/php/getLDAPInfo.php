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

	$type="";
	$res="";
	if(isset($_GET['type']))
	{
		$type = $_GET['type'];
	}
	else
	{
		$res = "Error: type should be 'users' or 'gorups'";
	}
	
	//get ads info
	$cmd = "xmldbc -g /system_mgr/samba/ads_enable";
	$ads_enable = trim(shell_exec($cmd));
	
	$cmd = "xmldbc -g /system_mgr/ldap_client/base_dn";
	$base_dn = trim(shell_exec($cmd));

	$cmd = "xmldbc -g /system_mgr/ldap_client/bind_dn";
	$bind_dn = trim(shell_exec($cmd));

	$cmd = "xmldbc -g /system_mgr/ldap_client/server_address";
	$server_address = trim(shell_exec($cmd));

	$cmd = "xmldbc -g /system_mgr/ldap_client/password";
	$password = trim(shell_exec($cmd));
	
	//$cmd = "xmldbc -g /system_mgr/samba/ads_workgroup";
	//$ads_workgroup = trim(shell_exec($cmd));	
	
	header('Content-Type: text/xml');
	echo "<config><info>";
	echo "<ads_enable>$ads_enable</ads_enable>";
	echo "<ads_workgroup>$ads_workgroup</ads_workgroup>";
	echo "<list_type>$type</list_type>";
	echo "<res>$res</res>";
	echo "</info>";
	
	if($ads_enable=="2")
	{
		//get LDAP user or group
		switch($type)
		{
			case 'users':
				$cmd = sprintf("ldapsearch -x -LLL -h '%s' -b '%s' -D '%s' -w '%s' '(objectClass=posixAccount)' cn | grep cn: | sed 's/cn: //g'",
						$server_address, $base_dn, $bind_dn, $password);
				break;
			case 'groups':
				$cmd = sprintf("ldapsearch -x -LLL -h '%s' -b '%s' -D '%s' -w '%s' '(objectClass=posixGroup)' cn | grep cn: | sed 's/cn: //g'",
						$server_address, $base_dn, $bind_dn, $password);
				break;
			default:
				$cmd="";
				break;
		}
		
		if($cmd !="" )
		{
			echo "<$type>";
			
			$cmd_status = sprintf("ldapsearch -x -b '' -s base '(objectclass=*)' namingContexts  -h '%s' | grep '%s'", $server_address, $base_dn);
			exec($cmd_status, $ret);//check ldap server online
			
			if (($p = stripos(strtolower($ret[0]), $base_dn)) === false) //search Base DN
			{
				echo "<res>$ret[0]</res><res>$ret[1]</res></$type></config>";
				exit;
			}

			$fp = popen($cmd, "r"); 
			$i=0;
			while(!feof($fp)) 
			{
				$account = fgets($fp, 512);
				if(strlen($account)==0) continue;
				
				$account = trim($account);
				echo "<item><name>$account</name></item>";
				$i++;
			}
			fclose($fp);
			
			echo "</$type>";
		}
	}
	
	echo "</config>";
?>