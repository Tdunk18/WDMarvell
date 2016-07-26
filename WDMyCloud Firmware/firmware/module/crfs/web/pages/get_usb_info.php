<?php
session_start();
$r = new stdClass();

include ("lib/login_checker.php");

/* login_check() return 0: no login, 1: login, admin, 2: login, normal user */
if (login_check() != 1)
{
	$r->success = false;
	goto __exit;
}

exec("xmldbc -S /var/run/xmldb_sock_sysinfo -g /usb/usb#", $usb_count);
$usb_count = (int)$usb_count[0];

$usb_info_path = "/var/www/xml/usb_info.xml";
$usb_ups_info_path = "/var/www/xml/usb_ups.xml";
$usb_mtp_info_path = "/var/www/xml/mtp_info.xml";
if (!file_exists($usb_info_path) && !file_exists($usb_ups_info_path) && !file_exists($usb_mtp_info_path))
{
	$r->success = false;
	goto __exit;
}

$i = 0;

//USB Storage
if (file_exists($usb_info_path))
{
	if (file_get_contents($usb_info_path) != "")
	{
		$xml = simplexml_load_file($usb_info_path);
		foreach($xml->usb as $key => $val)
		{
			if ((string)$val->web_no_display == "1") continue;

			$r->usb[$i] = new stdClass();
			$r->usb[$i]->type = "storage";
			$r->usb[$i]->device_name = (string)$val->device_name;
			$r->usb[$i]->model = (string)$val->model;
			$r->usb[$i]->vendor = (string)$val->vendor;
			$r->usb[$i]->manufacturer = (string)$val->vendor;
			$r->usb[$i]->revision = (string)$val->revision;
			$r->usb[$i]->lock_state = (string)$val->lock_state;
			$r->usb[$i]->password_hint = (string)$val->password_hint;
			$r->usb[$i]->vendor_id = (string)$val->vendor_id;
			$r->usb[$i]->product_id = (string)$val->product_id;
			$r->usb[$i]->usb_port = (string)$val->usb_port;
			$r->usb[$i]->usb_version = (string)$val->usb_version;
			$r->usb[$i]->is_connected = (string)$val->is_connected;
			$r->usb[$i]->SN = (string)$val->SN;
			$r->usb[$i]->map_dev = (string)$val->map_dev;
			$r->usb[$i]->ui_port_info = (string)$val->ui_port_info;
	
			//Partition info
			$j = 0;
			$par = $val->partitions;
			foreach($par->partition as $p => $valP)
			{
				$r->usb[$i]->partition[$j] = new stdClass();
				$r->usb[$i]->partition[$j]->share_name = (string)$valP->share_name;
				$r->usb[$i]->partition[$j]->base_path = (string)$valP->base_path;
				$r->usb[$i]->partition[$j]->mounted_date = (string) $valP->mounted_date;
				$r->usb[$i]->partition[$j]->size = (string)$valP->size;
				$r->usb[$i]->partition[$j]->fs_type = (string)$valP->fs_type;
				$j++;
			}
	
			//Get total size
			$total_size = 0;
			$xml_cmd = sprintf("xmldbc -S /var/run/xmldb_sock_sysinfo -g /usb/usb:%d/size", $i+1);
			exec($xml_cmd, $total_size);
			if (strlen($total_size[0]) > 0)
				$r->usb[$i]->total_size = $total_size[0];
			else
			{
				$total_size = 0;
				$xml_cmd = sprintf("xmldbc -S /var/run/xmldb_sock_sysinfo -g /usb/usb:%d/total_size", $i+1);
				exec($xml_cmd, $total_size);
				$r->usb[$i]->total_size = $total_size[0];
			}
		
			//Get used size
			$used_size = 0;
			$xml_cmd = sprintf("xmldbc -S /var/run/xmldb_sock_sysinfo -g /usb/usb:%d/used_size", $i+1);
			exec($xml_cmd, $used_size);
			$r->usb[$i]->used_size = 0;
			if ($used_size[0] != "")
				$r->usb[$i]->used_size = $used_size[0];
		
			//Get unused size
			$r->usb[$i]->unused_size = $r->usb[$i]->total_size - $r->usb[$i]->used_size;
	
			$i++;
		}
	}
}

//USB UPS
if (file_exists($usb_ups_info_path))
{
	if (file_get_contents($usb_ups_info_path) != "")
	{
	$xml = simplexml_load_file($usb_ups_info_path);
	foreach($xml->ups as $key => $val)
	{
		$r->usb[$i] = new stdClass();
		$r->usb[$i]->type = "ups";
		$r->usb[$i]->device_name = (string)$val->device_name;
		$r->usb[$i]->sn = (string)$val->sn;
		$r->usb[$i]->manufacturer = (string)$val->manufacturer;
		$r->usb[$i]->vendor = (string)$val->manufacturer;
		$r->usb[$i]->barrery_charge = (string)$val->barrery_charge;
		$r->usb[$i]->status = (string)$val->status;
		$i++;
	}
}
}

//USB MTP
if (file_exists($usb_mtp_info_path))
{
	if (file_get_contents($usb_mtp_info_path) != "")
	{
	$xml = simplexml_load_file($usb_mtp_info_path);
	foreach($xml->mtp as $key => $val)
	{
		$r->usb[$i] = new stdClass();
		$r->usb[$i]->type = "mtp";
		$r->usb[$i]->device_name = (string)$val->device_name;
		$r->usb[$i]->manufacturer = (string)$val->manufacturer;
		$r->usb[$i]->vendor = (string)$val->manufacturer;
		$r->usb[$i]->model = (string)$val->model;
		$r->usb[$i]->sn = (string)$val->serial_number;
		$r->usb[$i]->revision = (string)$val->revision;
		$i++;
	}
}
}
$r->success = true;

__exit:
echo json_encode($r);
?>
