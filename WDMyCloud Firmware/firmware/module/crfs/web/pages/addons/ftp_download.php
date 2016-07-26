<?php
//session_start();
//$r = new stdClass();
//$r->success = false;
//
//include ("../lib/login_checker.php");
//
///* login_check() return 0: no login, 1: login, admin, 2: login, normal user */
//if (login_check() == 0)
//{
//	echo json_encode($r);
//	exit;
//}

define('FTP_DOWNLOAD_CONF', '/var/www/xml/ftp_download.xml');

$action = $_POST['action'];
if ($action == "")
	$action = $_GET['action'];

function get_list()
{
	$r = new stdClass();
	$i = 0;
	if (file_exists(FTP_DOWNLOAD_CONF))
	{
		$xml = simplexml_load_file(FTP_DOWNLOAD_CONF);
		foreach ($xml->ftp_download->item as $item) {
			$pname = sprintf("/tmp/r_%s!_ftpdl", (string)$item->task_name);
			$bar_percent = "";
			$bar_running_sour = "";
			$bar_speed = "";
			if (file_exists($pname))
			{
				$_backup_info = file_get_contents($pname);
				$_backup_info_arr = explode("\n", $_backup_info);
				$bar_percent = $_backup_info_arr[0];
				if (count($_backup_info_arr) == 4)
				{					
				   $bar_running_sour = $_backup_info_arr[1];
				   $bar_speed = $_backup_info_arr[2];
				}
				else if (count($_backup_info_arr) == 3)
				{
					$bar_running_sour = $_backup_info_arr[1];
				}
				else
				{
					$bar_running_sour = "";
				}	
				//$bar_running_sour = rtrim($_backup_info_arr[1], "/");
				
				if ((string)$item->status == "0" && $bar_percent == "100") @unlink($pname);
			}
			if ((string)$item->status == "0") $bar_percent = "100";

			//Source dir
			$sour_list = array();
			foreach ($item->sour as $sitem)
				$sour_list[] = (string)$sitem;

			//Incremental List
			$incremental_list = array();
			if ((string)$item->backup_mode == "3") //Incremental mode
			{
				/*Get Backup list */
				$list_xml_file = sprintf("/tmp/r_%s!_ftpdl_imcremental.xml", (string)$item->task_name);
				$cmd = sprintf("ftp_download -a '%s' -o '%s' -c jobrs_list", (string)$item->task_name, $list_xml_file);
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
					/* 14 */(string)$item->update_routine,
					/* 15 */(string)$item->week_day,
					/* 16 */(string)$item->hour,
					/* 17 */(string)$item->host,
					/* 18 */(string)$item->host_user,
					/* 19 */(string)$item->host_passwd,
					/* 20 */(string)$item->lang,
					/* 21 */$bar_speed,
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
	$cmd = sprintf("ftp_download -a '%s' -c jobstop >/dev/null 2>&1", $taskname);
	pclose(popen($cmd, 'r'));
	sleep(2);

	$pname = sprintf("/tmp/r_%s!_ftpdl", $taskname);
	file_put_contents($pname, "-10"); //Cancel
}


$r = new stdClass();
switch ($action)
{
	case "create":
	{
		$taskname = $_POST['taskname'];		
		$source_dir = $_POST['source_dir'];
		$dest_dir = $_POST['dest_dir'];		
		$schedule = $_POST['schedule'];
		$schedule_type = $_POST['backup_sch_type'];
		$hour = $_POST['hour'];
		$week = $_POST['week'];
		$day = $_POST['day'];
		
		$host = $_POST['host'];
		$user = $_POST['user'];
		$pwd = $_POST['pwd'];
		$lang = $_POST['lang'];
							
		$sch_command = "";
		if ($schedule  == "0")$sch_command = "0,1,1";
		else if ($schedule_type  == "3")$sch_command = "3,1,".$hour; //daily
		else if ($schedule_type  == "2")$sch_command = "2,".$week.",".$hour; //weekly
		else if ($schedule_type  == "1")$sch_command = "1,".$day.",".$hour; //monthly
		

		$cmd = sprintf("ftp_download -a \"%s\" -i \"%s\" -u \"%s\" -p \"%s\" -l \"%s\" -d \"%s\" -r %s -c jobadd",
						$taskname, $host, $user, $pwd, $lang, $dest_dir, $sch_command);
																								
		foreach ($source_dir as $val)
			$cmd .= sprintf(" -s \"%s\"", $val);

               $cmd .= " >/dev/null 2>&1";
		system($cmd);
		//pclose(popen($cmd, 'r'));
		$pname = sprintf("/tmp/r_ftpdl!_%s", $taskname);
		@unlink($pname);
		
		stop_job($taskname);

		//Start job
		//$cmd = sprintf("(ftp_download -a '%s' -c jobrun >/dev/null 2>&1)&", $taskname);
		$cmd = sprintf("ftp_download -a '%s' -c jobrun > /dev/null 2>&1 &", $taskname);
                system($cmd);
//		pclose(popen($cmd, 'r'));
//		sleep(2);


		$r = get_list();
		$r->success = true;		
		echo json_encode($r);
	}
		break;

	case "modify":
	{
		$taskname = $_POST['taskname'];		
		$source_dir = $_POST['source_dir'];
		$dest_dir = $_POST['dest_dir'];
		//$backup_type = $_POST['backup_type'];
		$old_taskname = $_POST['old_taskname'];		
	
		$schedule = $_POST['schedule'];
		$schedule_type = $_POST['backup_sch_type'];
		$hour = $_POST['hour'];
		$week = $_POST['week'];
		$day = $_POST['day'];
		
		$host = $_POST['host'];
		$user = $_POST['user'];
		$pwd = $_POST['pwd'];
		$lang = $_POST['lang'];
	
		$sch_command = "";
		if ($schedule  == "0")$sch_command = "0,1,1";
		else if ($schedule_type  == "3")$sch_command = "3,1,".$hour; //daily
		else if ($schedule_type  == "2")$sch_command = "2,".$week.",".$hour; //weekly
		else if ($schedule_type  == "1")$sch_command = "1,".$day.",".$hour; //monthly
		
		stop_job($taskname);
				
		$cmd = sprintf("ftp_download -a \"%s\" -x \"%s\" -i \"%s\" -u \"%s\" -p \"%s\" -l \"%s\" -d \"%s\" -r %s -c jobedit",
						$taskname, $old_taskname, $host, $user, $pwd, $lang, $dest_dir, $sch_command);

		foreach ($source_dir as $val)
			$cmd .= sprintf(" -s \"%s\"", $val);
	        $cmd .= " >/dev/null 2>&1";
		system($cmd);	
		//pclose(popen($cmd, 'r'));

		//Start job
		//$cmdS = sprintf("ftp_download -a '%s' -c jobrun &", $taskname); 
		$cmdS = sprintf("ftp_download -a '%s' -c jobrun > /dev/null 2>&1 &", $taskname); 
	        system($cmdS);	
		//pclose(popen($cmdS, 'r'));
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

		$cmd = sprintf("ftp_download -a '%s' -c jobdel >/dev/null 2>&1", $taskname);
                system($cmd);
		//pclose(popen($cmd, 'r'));

		$pname = sprintf("/tmp/r_%s!_ftpdl", $taskname);
		@unlink($pname);

		$r = get_list();
		$r->success = true;
		echo json_encode($r);
	}
		break;

	case "go_jobs":
	{
		$taskname = $_POST['taskname'];

		$pname = sprintf("/tmp/r_%s!_ftpdl", $taskname);
		@unlink($pname);

		$cmd = sprintf("ftp_download -a '%s' -c jobrun &", $taskname);
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

		$pname = sprintf("/tmp/r_%s!_ftpdl", $taskname);
		@unlink($pname);
		
		$r = get_list();
		$r->success = true;
		echo json_encode($r);
	}
		break;

	case "go_restore":
	{
		$taskname = $_POST['taskname'];

		stop_job($taskname);

		$pname = sprintf("/tmp/r_%s!_ftpdl", $taskname);
		file_put_contents($pname, "0"); //Cancel

		$list_xml_file = sprintf("/tmp/r_ftpdl!_restore_imcremental_%s.xml", $taskname);
		$cmd = sprintf("ftp_download -a '%s' -o '%s' -F %s -c jobrs &", $taskname, $list_xml_file, $_POST['restore_source']);
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
