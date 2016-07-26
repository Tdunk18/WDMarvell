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
function getMember($ads_workgroup)
{
	$cmd = "getent group '$ads_workgroup\domain admins'";
	$retval = trim(shell_exec($cmd));

	return $retval;
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
	$domain_enable = trim(shell_exec($cmd));
	
	$cmd = "xmldbc -g /system_mgr/samba/ads_workgroup";
	$ads_workgroup = trim(shell_exec($cmd));	
	
	$domain_admin_member="";
	if($domain_enable==1)	//0:off 1:AD 2:LDAP 
	{
		$domain_admin_member = getMember($ads_workgroup);
	}
	
	header('Content-Type: text/xml');
	echo "<config><info>";
	echo "<domain_enable>$domain_enable</domain_enable>";
	echo "<ads_workgroup><![CDATA[$ads_workgroup]]></ads_workgroup>";
	echo "<list_type>$type</list_type>";
	echo "<res>$res</res>";
	echo "<domain_admin_member><![CDATA[$domain_admin_member]]></domain_admin_member>";
	echo "</info>";
	
	switch($domain_enable)	//0:off 1:AD 2:LDAP 
	{
		case '1':	//AD
		//get ads user or group
		switch($type)
		{
			case 'users':
				//$cmd = "net ads search -P '(&(objectClass=user)(|(userAccountControl=66048)(userAccountControl=66080)(userAccountControl=512)(userAccountControl=544)))' sAMAccountName | sed '1d' | sed 's/sAMAccountName: //g' | grep -v '^$'";
				//$cmd = "net ads search -P '(&(objectClass=user)(!(objectClass=computer))(!(showInAdvancedViewOnly=TRUE)))' sAMAccountName | sed '1d' | sed 's/sAMAccountName: //g' | grep -v '^$'";
				$cmd = "net ads search -P '(&(objectCategory=person)(objectClass=user) (!(userAccountControl:1.2.840.113556.1.4.803:=2)))' sAMAccountName | sed '1d' | sed 's/sAMAccountName: //g' | grep -v '^$'"; //ITR:106028
				break;
			case 'groups':
				$cmd = "net ads search -P '(&(objectClass=group)(!(groupType=2)))' name | sed '1d' | sed 's/name: //g' | grep -v '^$'";
				break;
			default:
				$cmd="";
				break;
		}
		
		if($cmd!="")
		{
			echo "<$type>";
			
			exec("wbinfo -t",$ret);//check ad server online
			
			if(strstr($ret[0],"could not") || strstr($ret[0],"Could not") || strstr($ret[0],"failed") )
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
				echo "<item><name><![CDATA[$account]]></name></item>";
				$i++;
			}
			fclose($fp);
			
			echo "</$type>";
		}
			
			break;
		case '2':
			$cmd = "xmldbc -g /system_mgr/ldap_client/base_dn";
			$base_dn = trim(shell_exec($cmd));
		
			$cmd = "xmldbc -g /system_mgr/ldap_client/bind_dn";
			$bind_dn = trim(shell_exec($cmd));
		
			$cmd = "xmldbc -g /system_mgr/ldap_client/server_address";
			$server_address = trim(shell_exec($cmd));
		
			$cmd = "xmldbc -g /system_mgr/ldap_client/password";
			$password = trim(shell_exec($cmd));
			
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
					echo "<item><name><![CDATA[$account]]></name></item>";
					$i++;
				}
				fclose($fp);
				
				echo "</$type>";
			}
			break;
	}
	
	echo "</config>";
?>