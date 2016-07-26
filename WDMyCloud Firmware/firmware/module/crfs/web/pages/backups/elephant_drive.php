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

$action = $_POST['attion'];
$_email = $_POST['e_email'];
$_password = $_POST['e_password'];

$toURL = "https://vault.elephantdrive.com/partners/vaultservices/genacct.aspx";
$check_agg = array(
	"a" => "check",
	"u" => $_email
);

$reg_agg = array(
	"a" => "reg",
	"u" => $_email,
	"t" => "",
	"c" => "1039",
	"p" => "57"
);

$config_NAS_path = "/etc/NAS_CFG/elephant_drive.xml";
$config_NAS_xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" .
				"<config>" .
					"<enable>%s</enable>" .
					"<email>%s</email>" .
					"<password>%s</password>" .
				"</config>\n";

$status_file = "/etc/elephantdrive/elephantdrive.status";
$config_etc_path = "/etc/elephantdrive/elephantdrive.config";
$config_etc_xml = "username %s\n" .
				"hashedpassword %s\n" .
				"partnername westerndigital\n".
				"folderpath /tmp";


$i = 0;
define("ERR_NONE", $i++);

//For check
define("ERR_EMAIL_USED", $i++);
define("ERR_CHECK_FAIL", $i++); //Check E-Mail fail

//For reg
define("ERR_EMAIL_EXISTS", $i++); //Email already exists in the DB
define("ERR_REG_FAIL", $i++); //Reg E-Mail fail

//For Login
define("ERR_LOCIN_FAIL", $i++); //Login fail
define("ERROR_VAULT_LOGIN_USER_NOT_FOUND", $i++);
define("ERROR_VAULT_LOGIN_INCORRECT_PASSWORD", $i++);

function _strpos($_source, $_search)
{
	$pos = strpos($_source, $_search);
	if ($pos === false)
		return false;
	return true;
}

function delfile($_filename)
{
	if (file_exists($_filename))
		unlink($_filename);
}

function check_account($toURL, $_agg)
{
	$ret = ERR_NONE;

	$curl = curl_init();
	$options = array(
		CURLOPT_URL => sprintf("%s?%s", $toURL, http_build_query($_agg)),
		CURLOPT_HEADER => 0,
		CURLOPT_VERBOSE => 0,
		CURLOPT_RETURNTRANSFER => true,
		//CURLOPT_POST => true,
		//CURLOPT_POSTFIELDS => http_build_query($post),
		CURLOPT_SSL_VERIFYPEER => false,
		CURLOPT_SSL_VERIFYHOST => false
	);

	curl_setopt_array($curl, $options);
	$r = curl_exec($curl);

	if(!curl_errno($curl))
	{
		$info = curl_getinfo($curl); 
		$pos = _strpos($r, '<span id="lblResult">False</span>'); //E-Mail unused
		if ($pos)
			$ret = ERR_NONE;
		else
			$ret = ERR_EMAIL_USED;
	}
	else
	{
		$ret = ERR_CHECK_FAIL;
	}
	curl_close($curl);

	return $ret;
}

function create_account($toURL, $_agg)
{
	$ret = ERR_NONE;

	$curl = curl_init();
	$options = array(
		CURLOPT_URL => sprintf("%s?%s", $toURL, http_build_query($_agg)),
		CURLOPT_HEADER => 0,
		CURLOPT_VERBOSE => 0,
		CURLOPT_RETURNTRANSFER => true,
		//CURLOPT_POST => true,
		//CURLOPT_POSTFIELDS => http_build_query($post),
		CURLOPT_SSL_VERIFYPEER => false,
		CURLOPT_SSL_VERIFYHOST => false
	);

	curl_setopt_array($curl, $options);
	$r = curl_exec($curl);

	if(!curl_errno($curl))
	{
		$info = curl_getinfo($curl); 

		if (_strpos($r, '<span id="lblResult">Email already exists in the DB.</span>'))
			$ret = ERR_EMAIL_EXISTS;
		else if (_strpos($r, '<span id="lblResult">True</span>')) //Find True -> reg OK;
			$ret = ERR_NONE;
	}
	else
	{
		$ret = ERR_REG_FAIL;
	}
	curl_close($curl);

	return $ret;
}

switch ($action)
{
	case "get_conig":
	{
		if (file_exists($config_NAS_path))
			$_status = file_get_contents($config_NAS_path);
		else
			$_status = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><config></config>";

		echo $_status;
	}
		break;

	case "check":
	{
		$ret = check_account($toURL, $check_agg);
		$r->errcode = $ret;
		$r->success = false;
		echo json_encode($r);
	}
		break;

	case "create":
	{
		$ret = check_account($toURL, $check_agg);
		if ($ret == ERR_NONE) //The email not used
		{
			$reg_agg['t'] = exec("elephant_drive -p " . $_password); //get hash password
			$ret = create_account($toURL, $reg_agg);
			$r->errcode = $ret;

			if ($ret == ERR_NONE)
				$r->success = true;
			else
				$r->success = false;
		}
		else
		{
			$r->errcode = $ret;
			$r->success = false;
		}

		echo json_encode($r);
	}
		break;

	case "apply":
	{
		$r->errcode = ERR_NONE;

		$enable = $_POST['e_enable'];

		//save to config
		delfile($config_NAS_path);
		$fp = fopen($config_NAS_path, 'x');
		$_content = sprintf($config_NAS_xml, $enable, $_email, $_password);
		fwrite($fp, $_content);
		fclose($fp);

		//Save NAS elephant conf to mtd
		$cmd = sprintf("access_mtd \"cp -f %s /usr/local/config\"", $config_NAS_path);
		pclose(popen($cmd, 'r'));

		if ($enable == "1")
		{
			$ret = check_account($toURL, $check_agg);
			if ($ret == ERR_NONE) //The email not used
			{
				$r->errcode = ERROR_VAULT_LOGIN_USER_NOT_FOUND;
			}

			//write etc config
			delfile($config_etc_path);
			$fp = fopen($config_etc_path, 'x');
			$_content = sprintf($config_etc_xml, $_email, exec("elephant_drive -p '" . $_password . "'"));
			fwrite($fp, $_content);
			fclose($fp);

			//Save elephant conf to mtd
			$cmd = sprintf("access_mtd \"cp -f %s /usr/local/config\"", $config_etc_path);
			pclose(popen($cmd, 'r'));

			//Run daemon
			delfile($status_file);
			pclose(popen("elephant_drive --restart-daemon", 'r'));
			sleep(3);
			pclose(popen("ganalytics --elephant-drive-en 1", 'r'));
		}
		else
		{
			//Stop daemon
			pclose(popen("elephant_drive --stop-daemon", 'r'));
			pclose(popen("ganalytics --elephant-drive-en 0", 'r'));

			//delete /etc config
			delfile($config_etc_path);
			delfile($status_file);
		}

		$r->success = true;
		echo json_encode($r);
	}
		break;

	case "check_login":
	{
		if (file_exists($status_file))
		{
			$_status = file_get_contents($status_file);

			if (_strpos($_status, 'ERROR_VAULT_LOGIN_USER_NOT_FOUND'))
				$r->errcode = ERROR_VAULT_LOGIN_USER_NOT_FOUND;
			else if (_strpos($_status, 'ERROR_VAULT_LOGIN_INCORRECT_PASSWORD'))
				$r->errcode = ERROR_VAULT_LOGIN_INCORRECT_PASSWORD;
			else if (_strpos($_status, "login failed"))
				$r->errcode = ERR_LOCIN_FAIL;
			else
			{
				$xml = simplexml_load_file($config_NAS_path);
				$user = (string)$xml->email;
				$password = (string)$xml->password;
				$r->user = rawurlencode($user);
				$r->password = $password;

				$pwd = $password; //Plain password
				$hash = md5($pwd);
				$len = strlen($hash);

				for( $i = 0; $i < $len; $i = $i+2 ) {
					$byte .= intval( substr($hash, $i, 2), 16 );
				}

				$email = $user; //user's login
				$key = $byte; //user's hashed password

				date_default_timezone_set("UTC");

				$date = date("Y/m/d  H:i:s");
				$data = $email . "|" . $key ."|" . $date;
				$payload = hash_hmac("sha1", $data, $key, true);
				$payload = rawurlencode(base64_encode($payload));
				$payload = strtoupper($payload);

				$r->session = $payload;
				$r->date = rawurlencode($date);
				$r->tab = rawurlencode("naswizard");

				$r->errcode = ERR_NONE;
			}
		}
		else
			$r->errcode = ERR_LOCIN_FAIL;

		$r->success = true;
		echo json_encode($r);
	}
		break;

	case "logout":
	{
		$r->errcode = ERR_NONE;
		$enable = $_POST['e_enable'];

		//save to config
		delfile($config_NAS_path);
		$fp = fopen($config_NAS_path, 'x');
		$_content = sprintf($config_NAS_xml, $enable, "", "");
		fwrite($fp, $_content);
		fclose($fp);

		//Save NAS elephant conf to mtd
		$cmd = sprintf("access_mtd \"cp -f %s /usr/local/config\"", $config_NAS_path);
		pclose(popen($cmd, 'r'));
		
		//Stop daemon
		pclose(popen("elephant_drive --stop-daemon", 'r'));

		//remove config
		unlink($config_etc_path);

		$r->success = true;
		echo json_encode($r);
	}
		break;
}
?>
