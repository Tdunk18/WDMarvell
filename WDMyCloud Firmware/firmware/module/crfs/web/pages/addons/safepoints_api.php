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

define('SAFEPOINTS_NETWORK_DISCOVER', '/var/www/xml/discover_remote_nas_devices.xml');
define('SAFEPOINTS_LIST', '/var/www/xml/safepoint_list.xml');
define('SAFEPOINTS_SHARE_LIST', '/var/www/xml/discover_local_nas_share_%s.xml');
define('SAFEPOINTS_RESTORE', '/var/www/xml/sprb.xml');
define('SAFEPOINTS_PASSWORD', '/tmp/_safepoints_pwd.xml');

$action = $_POST['action'];
if ($action == "") $action = $_GET['action'];

function get_safepoint_list()
{
	$r = new stdClass();
	$cnt = 0;

	if (file_exists(SAFEPOINTS_LIST))
	{
		$xml = simplexml_load_file(SAFEPOINTS_LIST);
		$r->status = (string)$xml->status;
		$r->description = (string)$xml->description;

		foreach ($xml->safepoints->safepoint as $item)
		{
			$r->lists[] = array(
				'name' => (string)$item->name,
				'handle' => (string)$item->handle,
				'source_device_name' => (string)$item->source_device_name,
				'total_size' => (string)$item->total_size,
				'last_updated_time' => (string)$item->last_updated_time,
				'path' => (string)$item->path
			);
			$cnt++;
		} 
	}

	$r->total = $cnt;
	return $r;
}

function htmlstr_encode($str)
{
	return htmlspecialchars($str, ENT_QUOTES);
}

function htmlstr_decode($str)
{
	return htmlspecialchars_decode($str, ENT_QUOTES);
}

switch ($action)
{
	case "usb_get_safepoints":
	{
		$sp_path = $_POST['sp_path'];

		$cmd = "killall -SIGKILL discover_dev";
		pclose(popen($cmd, 'r'));

		@unlink(SAFEPOINTS_LIST);
		$cmd = sprintf("discover_dev -l usb -n '%s'", $sp_path);
		pclose(popen($cmd, 'r'));

		$r = get_safepoint_list();
		$r->success = true;
		echo json_encode($r);
	}
		break;

	case "usb_do_recover":
	{
		$_path = $_POST['path'];
		$usb_sharename = $_POST['usb_sharename'];
		$sp_name = $_POST['sp_name'];
		$hotname = str_replace("\n", "", file_get_contents('/etc/hostname'));

		@unlink(SAFEPOINTS_RESTORE);
		$cmd = sprintf("sprb -r '%s' -s '%s' -n '%s' -m '%s' &", $_path, $usb_sharename, $sp_name, $hotname);
		pclose(popen($cmd, 'r'));

		$r->success = true;
		//$r->cmd = $cmd;
		echo json_encode($r);
	}
		break;

	case "do_recover_get_status":
	{
		$r->success = false;
		if (file_exists(SAFEPOINTS_RESTORE))
		{
			$xml = simplexml_load_file(SAFEPOINTS_RESTORE);

			$r->result = (string)$xml->result;
			$r->status = (string)$xml->status;
			$r->abortable = (string)$xml->abortable;
			$r->progress = (int)(string)$xml->progress;
			$r->error_code = (string)$xml->error_code;
			//$r->processing = (string)$xml->processing;

			$r->success = true;
		}

		echo json_encode($r);
	}
		break;

	case "recover_cancel":
	{
		$cmd = "sprb -k";
		pclose(popen($cmd, 'r'));

		$r->success = true;
		echo json_encode($r);
	}
		break;

	case "network_get_device":
	{
		$cmd = "killall -SIGKILL discover_dev";
		pclose(popen($cmd, 'r'));

		@unlink(SAFEPOINTS_NETWORK_DISCOVER);
		$cmd = "discover_dev -s network &";
		pclose(popen($cmd, 'r'));

		$r->success = true;
		echo json_encode($r);
	}
		break;

	case "network_wait_get_device":
	{
		$r->status = -1;
		$r->success = false;

		if (file_exists(SAFEPOINTS_NETWORK_DISCOVER))
		{
			$xml = simplexml_load_file(SAFEPOINTS_NETWORK_DISCOVER);

			$cnt = 0;
			foreach ($xml->NAS_device as $item)
			{
				$r->lists[] = array(
					'ip' => (string)$item->ip,
					'name' => (string)$item->name,
					'model_name' => strtolower((string)$item->model_name),
					'need_login' => ((string)$item->login_device == "false") ? false : true,
					'auth_status' => ((string)$item->login_device == "false") ? true : false,
					'user' => '',
					'pwd' => '',
					'share_list' => array()
				);
				$cnt++;
			}
			$r->total = $cnt;
			$r->status = 0;
			$r->success = true;
		}

		echo json_encode($r);
	}
		break;

	case "network_get_sharefolder":
	{
		$r->status = -1;
		$cnt = 0;

		$ip = $_POST['ip'];
		$user = $_POST['user'];
		$pwd = $_POST['pwd'];

		$cmd = "killall -SIGKILL discover_dev";
		pclose(popen($cmd, 'r'));

		$_filename = sprintf(SAFEPOINTS_SHARE_LIST, $ip);
		@unlink($_filename);
		$cmd = sprintf("discover_dev -q %s -u '%s' -p '%s'", $ip, $user, $pwd);
		pclose(popen($cmd, 'r'));

		if (file_exists($_filename))
		{
			$xml = simplexml_load_file($_filename);

			foreach ($xml->NAS_share as $item)
			{
				$r->lists[] = array(
					'name' => (string)$item->name,
					'public' => ((string)$item->public == "true") ? true : false,
					'user' => '',
					'pwd' => ''
				);
				$cnt++;
			}
			$r->total = $cnt;
			$r->status = (string)$xml->login_status;
			@unlink($_filename);
		}

		$r->success = true;
		echo json_encode($r);
	}
		break;

	case "network_share_auth":
	{
		$r->success = false;

		$ip = $_POST['ip'];
		$username = $_POST['username'];
		$password = $_POST['password'];
		$sharename = $_POST['sharename'];

		@unlink(SAFEPOINTS_LIST);
		$cmd = sprintf("discover_dev -l network -i '%s' -n '%s' -u '%s' -p '%s'", $ip, $sharename, $username, $password);
		pclose(popen($cmd, 'r'));

		if (file_exists(SAFEPOINTS_LIST))
		{
			$xml = simplexml_load_file(SAFEPOINTS_LIST);
			$r->status = (string)$xml->status;
			$r->success = true;
		}

		//$r->cmd = $cmd;
		echo json_encode($r);
	}
		break;

	case "network_get_safepoints":
	{
		$ip = $_POST['ip'];
		$username = $_POST['username'];
		$password = $_POST['password'];
		$sp_sharename = $_POST['sp_sharename'];

		$cmd = "killall -SIGKILL discover_dev";
		pclose(popen($cmd, 'r'));

		@unlink(SAFEPOINTS_LIST);
		$cmd = sprintf("discover_dev -l network -i '%s' -n '%s' -u '%s' -p '%s'", $ip, $sp_sharename, $username, $password);
		pclose(popen($cmd, 'r'));

		$r = get_safepoint_list();
		$r->success = true;
		echo json_encode($r);
	}
		break;

	case "network_do_recover":
	{
		$ip = $_POST['ip'];
		$share_name  = $_POST['share_name'];
		$username = $_POST['username'];
		$password = $_POST['password'];
		$sp_name = $_POST['sp_name'];
		$hostname = $_POST['hostname'];

		@unlink(SAFEPOINTS_PASSWORD);
		file_put_contents(SAFEPOINTS_PASSWORD, $password);

		@unlink(SAFEPOINTS_RESTORE);
		$cmd = sprintf("sprb -i %s -s '%s' -u '%s' -p '%s' -n '%s' -m '%s' &", $ip, $share_name, $username, SAFEPOINTS_PASSWORD, $sp_name, $hostname);
		pclose(popen($cmd, 'r'));

		$r->success = true;
		//$r->cmd = $cmd;
		echo json_encode($r);
	}
		break;

	case "cancel_recover":
	{
		$cmd = "sprb -k";
		pclose(popen($cmd, 'r'));

		$r->success = true;
		echo json_encode($r);
	}
	break;
}
?>
