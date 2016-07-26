var usbexfatFlag=0;
var usb_info_list = new Array();
var _content_temple = '<div style="padding: 5px">' + 
						'<div style="float: left; width: 30px; display: {0}">' +
							'<img src="/web/images/IconListDropdownUSBWD.png" border="0">' +
						'</div>' +
						'<div style="padding-left: {1}px;">' +
							'{2}' +
						'</div>' +
						'<div style="clear: both;">' +
							'<div class="usb_size_bar">' +
								'<div class="used_size" style="width: {10}%"></div>' +
							'</div>' +
						'</div>' +
						'<div style="color: #85939C; font-weight: bold;">' +
							'{3}' +
						'</div>' +
						'<div style="padding: 5px 0 20px 0;">' +
							'<div class="WDlabelUSBEjectIconSmall TooltipIcon" onClick="usb_eject({4}, \'storage\');" style="{5}" title="{6}" id="home_USBAlertStorageEject{11}_button"></div>' +
							'<div style="float: left;"> &nbsp; </div>' +
							'<div class="WDlabelUSBLockIconSmall" onClick="usb_unlock({7});" style="{8}" id="home_USBAlertStorageUnlock{12}_button"></div>' +
							'<div class="WDlabelUSBArrowIconSmall USBArrowIconSmall" onClick="diag_usb_info({9});" id="home_USBAlertStorageInfo{13}_button"></div>' +
						'</div>' +
					'</div>' +
					'';

var _ups_content_temple = '<div style="padding: 5px">' + 
						'<div>' +
							'{0}' +
						'</div>' +
						'<div style="clear: both;">' +
							'<div class="usb_size_bar">' +
								'<div class="used_size" style="width: {1}%"></div>' +
							'</div>' +
						'</div>' +
						'<div style="color: #85939C; font-weight: bold;">' +
							'{2}' +
						'</div>' +
						'<div style="padding: 5px 0 20px 0;">' +
							'<div class="WDlabelUSBArrowIconSmall USBArrowIconSmall" onClick="diag_usb_ups_info({3});" id="home_USBAlertUPSInfo{4}_button"></div>' +
						'</div>' +
					'</div>' +
					'';

var _mtp_content_temple = '<div style="padding: 5px">' + 
						'<div>' +
							'{0}' +
						'</div>' +
						'<div style="padding: 5px 0 20px 0;">' +
							'<div class="WDlabelUSBArrowIconSmall USBArrowIconSmall" onClick="diag_usb_mtp_info({1});" id="home_USBAlertMTPInfo{2}_button"></div>' +
						'</div>' +
					'</div>' +
					'';

var timeout_get_ust_list = -1;
function get_usb_list()
{
	var _usb_info_list = new Array();
	usbexfatFlag=0;
	$.ajax({
		type: "GET",
		//url: "/xml/usb_info.xml",
		url: "/web/get_usb_info.php",
		data: {},
		cache: false,
		dataType: "json",
		success: function(r){
			if (r.success == true)
			{
				var usb_info = r.usb
				for(var key in usb_info){
					var _usb_info = new Array();
					_usb_info['usb_type'] = usb_info[key].type;
					_usb_info['device_name'] = usb_info[key].device_name;
					
					if (usb_info[key].type == "storage") //USB Storage
					{
						_usb_info['model'] = usb_info[key].model;
						_usb_info['vendor'] = usb_info[key].vendor;
						_usb_info['manufacturer'] = usb_info[key].manufacturer;
						_usb_info['revision'] = usb_info[key].revision;
						_usb_info['lock_state'] = usb_info[key].lock_state;
						_usb_info['password_hint'] = usb_info[key].password_hint;
						_usb_info['vendor_id'] = usb_info[key].vendor_id;
						_usb_info['product_id'] = usb_info[key].product_id;
						_usb_info['usb_port'] = usb_info[key].usb_port;
						_usb_info['revision'] = usb_info[key].revision;
						_usb_info['usb_speed'] = usb_info[key].usb_speed;
						_usb_info['is_connected'] = usb_info[key].is_connected;
						_usb_info['sn'] = usb_info[key].SN;
						_usb_info['map_dev'] = usb_info[key].map_dev;
						_usb_info['total_size'] = usb_info[key].total_size;
						_usb_info['used_size'] = usb_info[key].used_size;
						_usb_info['unused_size'] = usb_info[key].unused_size;
						_usb_info['ui_port_info'] = usb_info[key].ui_port_info;
						_usb_info['partition'] = new Array();
		
						var _partition = usb_info[key].partition;
						for(var par in _partition) {
							if (_usb_info['lock_state'] == "locked" || _usb_info['lock_state'] == "unlocks exceeded")
								continue;
							var _partition_info = new Array();
							_partition_info['share_name'] = _partition[par].share_name;
							_partition_info['base_path'] = _partition[par].base_path;
							_partition_info['mounted_date'] = _partition[par].mounted_date;
							_partition_info['size'] = _partition[par].size;
							
							var fs_type = _partition[par].fs_type;
							_partition_info['fs_type'] = fs_type.toLowerCase();
							if(fs_type=='exfat') usbexfatFlag=1;
							
							_usb_info['partition'].push(_partition_info);
						}
					}
					else if (usb_info[key].type == "ups") //UPS
					{
						_usb_info['sn'] = usb_info[key].sn;
						_usb_info['manufacturer'] = usb_info[key].manufacturer;
						_usb_info['barrery_charge'] = usb_info[key].barrery_charge;
						_usb_info['status'] = usb_info[key].status;
					}
					else if (usb_info[key].type == "mtp") //MTP
					{
						_usb_info['manufacturer'] = usb_info[key].manufacturer;
						_usb_info['model'] = usb_info[key].model;
						_usb_info['sn'] = usb_info[key].sn;
						_usb_info['revision'] = usb_info[key].revision;
					}
	
					_usb_info_list.push(_usb_info);
				}
			}

			usb_info_list.length = 0;
			usb_info_list = _usb_info_list;

			update_usb_alert_info();

			clear_get_usb_list_Timer();
			timeout_get_ust_list = setTimeout('get_usb_list()', 5000);
		},
		error:function(xmlHttpRequest,error) {
			usb_info_list.length = 0;
			update_usb_alert_info();
			clear_get_usb_list_Timer();
			timeout_get_ust_list = setTimeout('get_usb_list()', 5000);
		}
	});
}

function clear_get_usb_list_Timer()
{
	clearTimeout(timeout_get_ust_list);
	timeout_get_ust_list = -1;
}

var _StrNoUSB = "";
function update_usb_alert_info()
{
	var ul_obj = $('.ul_obj_usb');
	var usb_len = usb_info_list.length;
	
	ul_obj.empty();
	if(_StrNoUSB.length==0) _StrNoUSB = _T('_home','msg2');

	if (usb_len == 0)
	{
		var li_obj = document.createElement("li");
		$(li_obj).empty().html("<div style=\"padding: 5px\">"+_StrNoUSB+"</div>"); //Text:There are no USB devices found.
		ul_obj.append($(li_obj));
		return;
	}

	var id_store = 1; //USB Storeage
	var id_ups = 1; //UPS
	var id_mtp = 1; //MTP

	for (var i = 0; i < usb_len; i++)
	{
		var li_obj = document.createElement("li");
		var _content = "";
		if (usb_info_list[i]['usb_type'] == "storage") //USB Stroage
		{
			/*
			if (usb_info_list[i]['vendor'] == "GoPro")
			{
				_content = String.format(_mtp_content_temple,
					usb_info_list[i]['device_name'],
					i,
					id_mtp
				);
				id_mtp++;
			}
			else
			*/
			{
				_content = String.format(_content_temple,
					(usb_info_list[i]['vendor'] == "Western Digital") ? "inline" : "none",
					(usb_info_list[i]['vendor'] == "Western Digital") ? "35" : "0",
					usb_info_list[i]['device_name'],
					String.format(_T("_home", "usb_size"), size2str(usb_info_list[i]['unused_size'], ""), size2str(usb_info_list[i]['total_size'], "")),
					i, //For unmount
					(usb_info_list[i]['partition'].length > 0) ? "" : "display: none", //For unmount icno
					_T('_home', 'umount_usb_drive'), //For unmount tooltip
					i, //For unlock
					(usb_info_list[i]['lock_state'] == "locked" || usb_info_list[i]['lock_state'] == "unlocks exceeded") ? "" : "display: none", //For unlock icno
					i, //For detail
					((usb_info_list[i]['used_size']/usb_info_list[i]['total_size'])*100),//For size bar
					id_store,
					id_store,
					id_store
				);
				id_store++;
			}
		}
		else if (usb_info_list[i]['usb_type'] == "ups") //UPS
		{
			var b_c = $.isNumeric(usb_info_list[i]['barrery_charge']) ? usb_info_list[i]['barrery_charge'] : 0;
			_content = String.format(_ups_content_temple,
					usb_info_list[i]['manufacturer'],
					($.isNumeric(b_c)) ? ((b_c/100)*100) : 0, //For size bar
					String.format(_T("_home", "ups_barrery_charge_bar"), usb_info_list[i]['barrery_charge'], ($.isNumeric(usb_info_list[i]['barrery_charge']) ? "%" : "")),
					i,
					id_ups
			);
			id_ups++;
		}
		else if (usb_info_list[i]['usb_type'] == "mtp") //MTP
		{
			_content = String.format(_mtp_content_temple,
				usb_info_list[i]['device_name'],
				i,
				id_mtp
			);
			id_mtp++
		}
		$(li_obj).empty().html(_content);
		ul_obj.append($(li_obj));
	}

	if (usb_len > 0)
		init_tooltip();
}

function diag_usb_info(usb_id)
{
	var USBObj = $("#USBDetailDiag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});
	USBObj.load();

	init_button();
	language();

	$('#usb_device_name').html(usb_info_list[usb_id]['device_name']);
	$('#usb_vendor').html(usb_info_list[usb_id]['vendor']);
	$('#usb_model').html(usb_info_list[usb_id]['model']);
	$('#usb_sn').html(usb_info_list[usb_id]['sn']);
	$('#usb_version').html(usb_info_list[usb_id]['revision']);
	$('#usb_size').html(size2str(usb_info_list[usb_id]['total_size'], ""));

	var _usb_port = _T('_home','usb_port_front');
	if (isNaN(usb_info_list[usb_id]['ui_port_info']) == false)
	{
		_usb_port = String.format(_T('_home','usb_port_num'),
		/*0*/ usb_info_list[usb_id]['ui_port_info']);
	}
	$('#usb_Port').html(_usb_port);

	$("#USBDetailDiag .close").click(function(){
		$('#USBDetailDiag .LightningButton').unbind('click');
		USBObj.close();
	});	
}

function diag_usb_ups_info(usb_id)
{
	adjust_dialog_size("#USB_UPSDetailDiag", 600, 350);
	$("#USB_UPSDetailDiag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false}).load();

	init_button();
	language();

	$('#ups_manufacturer').html(usb_info_list[usb_id]['manufacturer']);
	$('#ups_barrery_charge').html(usb_info_list[usb_id]['barrery_charge'] + ($.isNumeric(usb_info_list[usb_id]['barrery_charge']) ? "%" : ""));
	$('#ups_status').html(_T('_home', 'ups_barrery_charge_'+usb_info_list[usb_id]['status']));

	$("#USB_UPSDetailDiag .close").click(function(){
		$('#USBDetailDiag .LightningButton').unbind('click');
		$("#USB_UPSDetailDiag").overlay().close();
	});	
}

function diag_usb_mtp_info(usb_id)
{
	adjust_dialog_size("#USB_MTPDetailDiag", 600, 350);
	$("#USB_MTPDetailDiag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false}).load();

	init_button();
	//language();

	$('#mtp_device_name').html(usb_info_list[usb_id]['device_name']);
	$('#mtp_vendor').html(usb_info_list[usb_id]['manufacturer']);
	$('#mtp_model').html(usb_info_list[usb_id]['model']);
	$('#mtp_sn').html(usb_info_list[usb_id]['sn']);

	$("#USBDetailDiag .close").click(function(){
		$('#USBDetailDiag .LightningButton').unbind('click');
		$("#USB_MTPDetailDiag").overlay().close();
	});	
}

function usb_send_unlock(usb_id)
{
	jLoading(_T('_common','set'), 'loading', 's', ""); 

	$.ajax({
		url:"/cgi-bin/usb_device.cgi",
		type: "POST",
		data: {
			cmd: "cgi_usb_storage_unlock",
			f_dev: usb_info_list[usb_id]['map_dev'],
			f_sn: usb_info_list[usb_id]['sn'] ,
			f_auto: "auto",
			f_password: $("#usb_unlock_password").val(),
			f_save_flag: ($("#usb_unlock_save_password").prop('checked') == true) ? "1" : "0"
		},
		cache: false,
		dataType: "xml",
		success: function(xml) {
			jLoadingClose();
			get_usb_list();
			$("#usb_unlock_form").get(0).reset();
			var unlock_status = $(xml).find("unlock_status").text();
			if (unlock_status == "-2") //Password error
				jAlert(_T('_home', 'usb_unlock_password_error'), _T('_common', 'error'));
			else if (unlock_status == "-3") //Unlocks Exceeded
				jAlert(_T('_home', 'usb_unlock_exceeded'), 'usb_unlock_exceeded_title');
		}
	});
}

function usb_unlock(usb_id)
{
	if (usb_info_list[usb_id]['lock_state'] == "unlocks exceeded")
	{
		jAlert(_T('_home', 'usb_unlock_exceeded'), "usb_unlock_exceeded_title");
		return;
	}

	$("#USBUnlockDiag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false}).load();

	init_button();
	language();

	$("#USBUnlockDiag input:text, #USBUnlockDiag input:password").inputReset();

	$('#usb_unlock_device_name').html(usb_info_list[usb_id]['device_name']);
	$('#usb_unlock_password_hint').html(usb_info_list[usb_id]['password_hint']);

	$("#USBUnlockDiag .close").click(function(){
		$("#USBUnlockDiag").overlay().close();
		$('#USBUnlockDiag *').unbind('click');
	});

	$("#USBUnlockDiag .save").click(function(){
		clear_get_usb_list_Timer();
		$("#USBUnlockDiag").overlay().close();
		usb_send_unlock(usb_id);
		$('#USBUnlockDiag *').unbind('click');
	});
}

function usb_eject(usb_id, usb_type)
{
	$(".Tooltip").remove();
	$("#USBUnmountDiag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false}).load();

	init_button();

	$("#USBUnmountDiag .close").click(function(){
		$("#USBUnmountDiag").overlay().close();
		$('#USBUnmountDiag *').unbind('click');
	});

	$("#USBUnmountDiag .OK").click(function(){
		$("#USBUnmountDiag").overlay().close();
		clear_get_usb_list_Timer();
		jLoading(_T('_common', 'set'), 'loading', 's', ""); 
		$.ajax({
			url: "/cgi-bin/usb_device.cgi",
			type: "POST",
			data: {
				cmd: (usb_type == "storage") ? "cgi_usb_Storage_umount" : "cgi_usb_mtp_umount",
				f_dev: (usb_type == "storage") ? usb_info_list[usb_id]['map_dev'] : usb_info_list[usb_id]['interface']
			},
			cache: false,
			dataType: "xml",
			success: function(xml) {},
			complete: function() {
				jLoadingClose();
				get_usb_list();
			}
		});

		$('#USBUnmountDiag *').unbind('click');
	});
}

function usb_check_eject()
{
	clear_get_usb_list_Timer();
	$.ajax({
		url:"/cgi-bin/usb_device.cgi",
		type: "POST",
		data: {
			cmd: "cgi_usb_check_eject"
		},
		cache: false,
		dataType: "xml",
		success: function(xml) {
			jLoadingClose();
			get_usb_list();
		}
	});
}
