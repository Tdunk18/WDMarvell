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

define('USB_BACKUPS_CONF', '/var/www/xml/usb_backup.xml');

$action = $_POST['action'];
if ($action == "") $action = $_GET['action'];

function get_list()
{
	$r = new stdClass();
	$i = 0;
	$get_incremental_list_flag = false;
	if ($_POST['get_incremental_list_flag'] == "1") $get_incremental_list_flag = true;

	if (file_exists(USB_BACKUPS_CONF))
	{
		$xml = simplexml_load_file(USB_BACKUPS_CONF);
		foreach ($xml->usb_backup->item as $item) {
			//Source dir
			$sour_list = array();
			foreach ($item->sour as $sitem)
				$sour_list[] = (string)$sitem;

			$pname = sprintf("/tmp/r_%s!_usb", (string)$item->task_name);
			$bar_percent = "";
			$bar_running_sour = "";

			if (file_exists($pname))
			{
				$_backup_info = file_get_contents($pname);
				$_backup_info_arr = explode("\n", $_backup_info);
				$bar_percent = $_backup_info_arr[0];
				$bar_running_sour = rtrim($_backup_info_arr[1], "/");
				if ((string)$item->status == "0" && $bar_percent == "100") @unlink($pname);

				if ((string)$item->status == "3") //Incremental mode Recovering
				{
					$bar_running_sour .= "/";
					foreach ($sour_list as $val)
					{
						if (!strstr($bar_running_sour, $val)) continue;
						$bar_running_sour = $val;
						break;
					}
				}
			}
			if ((string)$item->status == "0") $bar_percent = "100";

			//Incremental List
			$incremental_list = array();
			if ((string)$item->backup_mode == "3" && $get_incremental_list_flag) //Incremental mode
			{
				/* Get Backup list */
				$list_xml_file = sprintf("/tmp/r_%s!_usb_imcremental.xml", (string)$item->task_name);
				$cmd = sprintf("usb_backup -a '%s' -o '%s' -c jobrs_list", (string)$item->task_name, $list_xml_file);
				pclose(popen($cmd, 'r'));

				if (file_exists($list_xml_file))
				{
					$list_xml = simplexml_load_file($list_xml_file);
					foreach ($list_xml->backup as $im_item)
						$incremental_list[] = array((string)$im_item->task_name, (string)$im_item->time);
					@unlink($list_xml_file);
				}
			}

			$r->rows[] = array(
				'id' => $i,
				'cell' => array(
					/* 0 */	(string)$item->task_name,
					/* 1 */	'',
					/* 2 */	$sour_list,
					/* 3 */	$percent_list,
					/* 4 */	(string)$item->dest,
					/* 5 */	(string)$item->status,
					/* 6 */	(string)$item->backup_direction,
					/* 7 */	(string)$item->backup_mode,
					/* 8 */	'', //Action: Start/Stop, Edit, Del, Detail
					/* 9 */(string)$item->finished_time,
					/* 10 */(string)$item->status,
					/* 11 */$bar_percent,
					/* 12 */$bar_running_sour,
					/* 13 */$incremental_list,
					/* 14 */((string)$item->auto_backup == "0") ? 1 : 0,
					/* 15 */((string)$item->system == "1") ? 1 : 0
				)
			);
			$i++;
		} 
	}

	$r->page = 1;
	$r->total = $i;
	return $r;
}

function stop_job($taskname)
{
	//Stop job
	$cmd = sprintf("usb_backup -a '%s' -c jobstop", $taskname);
	pclose(popen($cmd, 'r'));
	sleep(2);

	$pname = sprintf("/tmp/r_%s!_usb", $taskname);
	file_put_contents($pname, "-10"); //Cancel
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
	case "create":
	{
		$taskname = $_POST['taskname'];
		$category = $_POST['category']; //1:USB->NAS,2:NAS->USB
		$source_dir = $_POST['source_dir'];
		$dest_dir = $_POST['dest_dir'];
		$backup_type = $_POST['backup_type'];
		$auto_start = $_POST['auto_start'];

		$cmd = sprintf("usb_backup -a '%s' -m %s -t %s -d %s -A %s -c jobadd",
						$taskname, $backup_type, $category, escapeshellarg(htmlstr_decode($dest_dir)), $auto_start);

		foreach ($source_dir as $val)
			$cmd .= sprintf(" -s %s", escapeshellarg(htmlstr_decode($val)));

		pclose(popen($cmd, 'r'));
		$pname = sprintf("/tmp/r_usb!_%s", $taskname);
		@unlink($pname);

		stop_job($taskname);

		//Start job
		$cmd = sprintf("usb_backup -a '%s' -c jobrun &", $taskname);
		pclose(popen($cmd, 'r'));
		sleep(2);

		$r = get_list();
		$r->success = true;
		echo json_encode($r);
	}
		break;

	case "modify":
	{
		$taskname = $_POST['taskname'];
		$category = $_POST['category']; //1:USB->NAS,2:NAS->USB
		$source_dir = $_POST['source_dir'];
		$dest_dir = $_POST['dest_dir'];
		$backup_type = $_POST['backup_type'];
		$auto_start = $_POST['auto_start'];
		$old_taskname = $_POST['old_taskname'];

		stop_job($taskname);

		$cmd = sprintf("usb_backup -a '%s' -x '%s' -m %s -t %s -d %s -A %s -c jobedit",
						$taskname, $old_taskname, $backup_type, $category, escapeshellarg(htmlstr_decode($dest_dir)), $auto_start);

		foreach ($source_dir as $val)
			$cmd .= sprintf(" -s %s", escapeshellarg(htmlstr_decode($val)));

		pclose(popen($cmd, 'r'));

		//Start job
		$cmdS = sprintf("usb_backup -a '%s' -c jobrun &", $taskname);
		pclose(popen($cmdS, 'r'));
		sleep(2);

		$r = get_list();
		$r->cmd = $cmd;
		$r->success = true;
		echo json_encode($r);
	}
		break;

	case "del":
	{
		$taskname = $_POST['taskname'];

		stop_job($taskname);

		$cmd = sprintf("usb_backup -a '%s' -c jobdel", $taskname);
		pclose(popen($cmd, 'r'));

		$pname = sprintf("/tmp/r_%s!_usb", $taskname);
		@unlink($pname);

		$r = get_list();
		$r->success = true;
		echo json_encode($r);
	}
		break;

	case "go_jobs":
	{
		$taskname = $_POST['taskname'];

		$pname = sprintf("/tmp/r_%s!_usb", $taskname);
		@unlink($pname);

		$cmd = sprintf("usb_backup -a '%s' -c jobrun &", $taskname);
		pclose(popen($cmd, 'r'));
		sleep(2);

		$r = get_list();
		$r->success = true;
		echo json_encode($r);
	}
		break;

	case "stop_jobs":
	{
		$taskname = $_POST['taskname'];
		stop_job($taskname);

		$r = get_list();
		$r->success = true;
		echo json_encode($r);
	}
		break;

	case "go_restore":
	{
		$taskname = $_POST['taskname'];
		$restore_source = $_POST['restore_source'];
		
		stop_job($taskname);

		$pname = sprintf("/tmp/r_%s!_usb", $taskname);
		file_put_contents($pname, "0"); //Cancel

		$list_xml_file = sprintf("/tmp/r_usb!_restore_imcremental_%s.xml", $taskname);
		if ($restore_source == "")//Sync and Copy
			$cmd = sprintf("usb_backup -a '%s' -o '%s' -c jobrs &", $taskname, $list_xml_file);
		else
			$cmd = sprintf("usb_backup -a '%s' -o '%s' -F %s -c jobrs &", $taskname, $list_xml_file, $_POST['restore_source']);
		pclose(popen($cmd, 'r'));
		sleep(2);

		$r = get_list();
		$r->success = true;
		echo json_encode($r);
	}
		break;

	case "get_list":
	{
		$r = get_list();
		$r->success = true;
		echo json_encode($r);
	}
		break;

}
?>
