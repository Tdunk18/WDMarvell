function INTERNAL_FMT_Get_CurrentVOL() {
	if (typeof USED_VOLUME_INFO == 'undefined') INTERNAL_FMT_Load_USED_VOLUME_INFO();
	var my_current_volume_info = new Array();

	$('item', USED_VOLUME_INFO).each(function (e) {
			my_current_volume_info[e] = new Array();
			my_current_volume_info[e][0] = $('volume', this).text();
			my_current_volume_info[e][1] = $('raid_mode', this).text();
			my_current_volume_info[e][2] = $('device', this).text();
			my_current_volume_info[e][3] = $('file_type', this).text();
			my_current_volume_info[e][4] = $('size', this).text();
			my_current_volume_info[e][5] = $('raid_status', this).text();
			my_current_volume_info[e][6] = $('volume_encrypt', this).text();
			my_current_volume_info[e][7] = $('is_roaming_volume', this).text();
	}); //end od each

	return my_current_volume_info;
}

function INTERNAL_Reformat_Volume_List(dev) {
	var my_len = 0;
	for (var i = 0; i < FMT_HD_INFO.length; i++) {
		if (FMT_HD_INFO[i][0].toString() == dev) {
			my_len = REFMT_HD_INFO.length;

			REFMT_HD_INFO[my_len] = new Array();
			REFMT_HD_INFO[my_len][0] = FMT_HD_INFO[i][0];
			REFMT_HD_INFO[my_len][1] = FMT_HD_INFO[i][1];
			REFMT_HD_INFO[my_len][2] = FMT_HD_INFO[i][2];
			REFMT_HD_INFO[my_len][3] = FMT_HD_INFO[i][3];
			REFMT_HD_INFO[my_len][4] = FMT_HD_INFO[i][4];
			REFMT_HD_INFO[my_len][5] = FMT_HD_INFO[i][5];
			REFMT_HD_INFO[my_len][6] = FMT_HD_INFO[i][6];
			REFMT_HD_INFO[my_len][7] = FMT_HD_INFO[i][7];
			REFMT_HD_INFO[my_len][8] = FMT_HD_INFO[i][8];
		}
	}
}

function INTERNAL_FMT_RAID_Auto_SYNC_Set() {
	var current_volume = 0,create_volume = 0;
	var flag = 0;

	//Check Current existed Volume		
	wd_ajax({
		url: FILE_USED_VOLUME_INFO,
		type: "POST",
		async: false,
		cache: false,
		dataType: "xml",
		success: function (xml) {

			var my_current_volume_info = new Array();

			$('item', xml).each(function (e) {
				var my_mode = $('raid_mode', this).text();

				if ((my_mode == "raid1") || (my_mode == "raid5") || (my_mode == "raid10")) current_volume = 1;

			}); //end od each
		},
		error: function (xhr, ajaxOptions, thrownError) {}
	});

	//Check will be to Create Volume
	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		if (CREATE_VOLUME_INFO[i][7] == 1) {
			if ((CREATE_VOLUME_INFO[i][1] == "raid1") ||
				(CREATE_VOLUME_INFO[i][1] == "raid5") ||
				(CREATE_VOLUME_INFO[i][1] == "raid10")) {
				create_volume = 1;
				flag = $("input[name='f_reformat_auto_sync']:checked").val();
			}
		}
	}

	if (parseInt(create_volume) == 0) {
		if (parseInt(current_volume) == 1)
			flag = 3;
		else
			flag = 0;

	}

	return flag;
}

function INTERNAL_FMT_AllowOf_RAID5_SpareDsk(current_volume_info) {
	var flag = 0;
	var all_volume_info = new Array();
	all_volume_info = current_volume_info;

	for (var i = 0; i < all_volume_info.length; i++) {
		//if ( all_volume_info[i][1] == "raid5")
		if ((all_volume_info[i][1] == "raid5") && (parseInt(all_volume_info[i][5], 10) != 2)) {
			flag = 1;
			break;
		}
	}

	return flag;
}

function INTERNAL_FMT_AllowOf_STD2R1(current_volume_info) {
	var flag = 0;
	var all_volume_info = new Array();
	all_volume_info = current_volume_info;
	
	for (var i = 0; i < all_volume_info.length; i++) {
		if ((all_volume_info[i][1] == "standard") && 
			(all_volume_info[i][6] == "0") &&
			(all_volume_info[i][7] == "0")) {
			
			var my_html = INTERNAL_FMT_Std2R1_Get_Source_Dev(current_volume_info);
			if (my_html != "") flag = 1;
			
			break;
		}
	}

	return flag;
}

function INTERNAL_FMT_AllowOf_STD2R5(current_volume_info) {
	var flag = 0;
	var all_volume_info = new Array();
	all_volume_info = current_volume_info;
	
	for (var i = 0; i < all_volume_info.length; i++) {
		if ((all_volume_info[i][1] == "standard") && 
			(REFMT_HD_INFO.length > 1) && 
			(all_volume_info[i][6] == "0") &&
			(all_volume_info[i][7] == "0") ) 
		{
			var my_html = INTERNAL_FMT_Std2R5_Get_Source_Dev(current_volume_info);
			if (my_html != "") {
				flag = 1;
			}
			break;
		}
	}
	return flag;
}
function INTERNAL_FMT_Reamin_Exist(dev, current_volume_info) {

	var flag = 0;
	var all_volume_info = new Array();
	all_volume_info = current_volume_info;
	
	for (var i = 0; i < all_volume_info.length; i++) {
			if ( (all_volume_info[i][1] == "linear") && ( all_volume_info[i][2] == dev)) 
			{
				flag = 1;
				break;
			}	
	}	
	
	return flag;
}
function INTERNAL_FMT_AllowOf_R12R5(current_volume_info) {
	
	var flag = 0;
	var all_volume_info = new Array();
	all_volume_info = current_volume_info;

	for (var i = 0; i < all_volume_info.length; i++) {
		
		if ((all_volume_info[i][1] == "raid1") &&
			(all_volume_info[i][5] == "0") &&
			(REFMT_HD_INFO.length >= 1) &&
			(all_volume_info[i][6] == "0") &&
			INTERNAL_FMT_Reamin_Exist(all_volume_info[i][2], current_volume_info) == 0) {
				
				var my_html = INTERNAL_FMT_R12R5_Get_Source_Dev(current_volume_info);
					if (my_html != "") {
					flag = 1;
				}
			break;
		}
	}
	return flag;
}

function INTERNAL_FMT_Std2R1_Get_Source_Dev(current_volume_info) {
	var my_html_tr = "";
	var all_volume_info = new Array(),
		all_hd_info = new Array();
	var my_create_volume = new Array();
	var my_source_dev_info = new Array();
	all_volume_info = current_volume_info;
	all_hd_info = CURRENT_HD_INFO;
	var my_dev = "";
	var init_flag = 0;
	var my_hd_min_size = 0;
	var m = 0;
	var idx = 0;
	for (var i = 0; i < all_volume_info.length; i++) {
		
		for (var j = 0; j < all_hd_info.length; j++) {
			if (all_volume_info[i][2].toString() == all_hd_info[j][0].toString()) {
				my_hd_min_size = parseInt(all_hd_info[j][5].toString(),10);
				break;
			}
		}
		
		if ((all_volume_info[i][1] == "standard") && 
				(all_volume_info[i][6] == "0") && //volume encryption don't support STD to RAID1
				(all_volume_info[i][7] == "0")) 
		{
			my_dev = all_volume_info[i][2];

			for (var j = 0; j < all_hd_info.length; j++) {
				if (all_hd_info[j][0] == my_dev) {
					var my_newly_hd_info = new Array();
					for (var k = 0; k < REFMT_HD_INFO.length; k++) {
						if (parseInt(REFMT_HD_INFO[k][5]) >= my_hd_min_size) {
							my_newly_hd_info.push(REFMT_HD_INFO[k]);
						}
					}
					if (my_newly_hd_info.length != 0) {
						if ((idx % 2) == 1)
							my_html_tr += "<tr id='row " + i + "' class='erow'>";
						else
							my_html_tr += "<tr id='row " + i + "'>";

						var my_size = size2str(parseInt(all_volume_info[i][4].toString(),10)*1024);
						
						my_html_tr += "<td class='tdfield_40'>";
						if(idx == 0)
							my_html_tr += "<input type=\"checkbox\" value=\"" + my_dev + "\" name=\"f_source_dev\" id=\"f_source_dev\" onclick=\"INTERNAL_FMT_Std2R1_Source_Set('" + i + "');\" checked>";
						else
							my_html_tr += "<input type=\"checkbox\" value=\"" + my_dev + "\" name=\"f_source_dev\" id=\"f_source_dev\" onclick=\"INTERNAL_FMT_Std2R1_Source_Set('" + i + "');\">";
						my_html_tr += "</td>";
						my_html_tr += "<td class='tdfield_padding' style='width:100px'>Volume_" + all_volume_info[i][0] + "</td>";
						my_html_tr += "<td class='tdfield_padding' style='width:100px'>" + INTERNAL_File_System_HTML(all_volume_info[i][3].toString()) + "</td>";
						my_html_tr += "<td class='tdfield_padding' style='width:150px'>" + my_size + "</td>";
						my_html_tr += "<td class='tdfield_padding'><div style=\"text-align: left; width: 110px;\">" + INTERNAL_FMT_Convert_Device_Name(1, all_hd_info[j][0]) + "</div></td>";
						my_html_tr += "<td class='tdfield_padding'>";
						_SELECT_ITEMS.push("f_newly_dev" + i + "_main");
						my_html_tr += "<div class='select_menu' style='height:25px;border: 0px solid red;'>";
						my_html_tr += "<ul><li class='option_list' style='border: 0px solid red;'>";
						my_html_tr += "<div id='f_newly_dev" + i + "_main'";
						my_html_tr += (idx == 0) ? " class='wd_select option_selected'>" : " class='wd_select option_selected gray_out'>";
						my_html_tr += "<div class='sLeft wd_select_l'></div>";
						my_html_tr += "<div class='sBody text wd_select_m' id='f_newly_dev" + i + "' rel='" + my_newly_hd_info[0][0] + "'>" + INTERNAL_FMT_Convert_Device_Name(1, my_newly_hd_info[0][0]) + "</div>";
						my_html_tr += "<div class='sRight wd_select_r'></div>";
						my_html_tr += "</div>";

						my_html_tr += "<ul class='ul_obj' id='f_newly_dev" + i + "_li' style='height:100px;width:100px;'>";
						for (var k = 0; k < my_newly_hd_info.length; k++) {
							my_html_tr += "<li class='";
							if (parseInt(k, 10) == 0) my_html_tr += "li_start";
							if (parseInt(k, 10) == (my_newly_hd_info.length - 1)) my_html_tr += " li_end";
							my_html_tr += "' rel='" + my_newly_hd_info[k][0] + "' style='width:90px;'> <a href=\"#\" onclick=\"INTERNAL_FMT_Std2R1_Get_newly_Dev('"+all_volume_info[i][0]+"','"+my_newly_hd_info[k][0]+"')\">" + INTERNAL_FMT_Convert_Device_Name(1, my_newly_hd_info[k][0].toString()) + "</a></li>";
						}
						my_html_tr += "</ul>";
						my_html_tr += "</li></ul>";
						my_html_tr += "</div>";
						my_html_tr += "</td>";
						my_html_tr += "</tr>";
						
						idx++;

						//Std to R1 init for create volume
						if ((init_flag == 0) && (my_newly_hd_info.length > 0)) {
							
//							var msg = "[raid_reformat_daig.js][INTERNAL_FMT_Std2R1_Get_Source_Dev]\n";
//							for(var idx=0; idx <	all_volume_info.length; idx++)
//							{
//								msg += all_volume_info[idx].toString() + "\n";
//							}
//							alert(msg);
							
							my_create_volume[0] = all_volume_info[i][0];
							my_create_volume[1] = all_volume_info[i][3];
							my_create_volume[2] = my_size;
							my_create_volume[3] = my_dev;
							my_create_volume[4] = my_newly_hd_info[0][0];
							my_create_volume[5] = all_volume_info[0][4];

							INTERNAL_FMT_Std2R1_init(my_create_volume);
							init_flag = 1;
						}

						/* source dev info:			
							0 -> volume_name,
							1 -> file_system,
							2 -> volume_size,
							3 -> source_dev,
							4 -> newly_dev,
							5 -> volume_size, unit is block,
						*/
						my_source_dev_info[m] = new Array();
						my_source_dev_info[m][0] = all_volume_info[i][0]; //volume name
						my_source_dev_info[m][1] = all_volume_info[i][3]; //file system
						my_source_dev_info[m][2] = my_size; //volume size
						my_source_dev_info[m][3] = my_dev; //source dev
						m++;
					}
					break;
				}
			}
		}
	}
	
	STD2R1_SOURCE_INFO = my_source_dev_info;
	//	var msg="";
	//	for(i=0;i<STD2R1_SOURCE_INFO.length;i++)
	//	{
	//		msg += STD2R1_SOURCE_INFO[i].toString()+"\n";
	//	}
	//	alert(msg);
	return my_html_tr;
}

function INTERNAL_FMT_Std2R1_init(create_volume_info) {
	var my_len = 99;
	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		if (CREATE_VOLUME_INFO[i][9] == 0) CREATE_VOLUME_INFO[i][7] = 0;
		if (CREATE_VOLUME_INFO[i][9] == 1) my_len = i;
		if (CREATE_VOLUME_INFO[i][9] == 2) CREATE_VOLUME_INFO[i][7] = 0;
		if (CREATE_VOLUME_INFO[i][9] == 3) CREATE_VOLUME_INFO[i][7] = 0;
	}

	if (parseInt(my_len) == 99) {
		my_len = CREATE_VOLUME_INFO.length;
		CREATE_VOLUME_INFO[my_len] = new Array();
	}

	CREATE_VOLUME_INFO[my_len][0] = create_volume_info[0];
	CREATE_VOLUME_INFO[my_len][1] = "raid1";
	CREATE_VOLUME_INFO[my_len][2] = create_volume_info[1];
	CREATE_VOLUME_INFO[my_len][3] = "none";
	CREATE_VOLUME_INFO[my_len][4] = create_volume_info[4];
	CREATE_VOLUME_INFO[my_len][5] = "none";
	CREATE_VOLUME_INFO[my_len][6] = "0";
	CREATE_VOLUME_INFO[my_len][7] = "1";
	//CREATE_VOLUME_INFO[my_len][8] = create_volume_info[2];
	CREATE_VOLUME_INFO[my_len][8] = size2str(parseInt(create_volume_info[5].toString()*1024));
	CREATE_VOLUME_INFO[my_len][9] = "1";
	CREATE_VOLUME_INFO[my_len][10] = create_volume_info[3];

//		var msg = "[raid_reformat_diag.js][INTERNAL_FMT_Std2R1_init]\n";
//		for(var i=0;i<CREATE_VOLUME_INFO.length;i++)
//		{
//			msg += CREATE_VOLUME_INFO[i].toString() + "\n";
//		}
//		msg += "------------------------------\n";
//		for(i=0;i<create_volume_info.length;i++)
//		{
//			msg += create_volume_info[i].toString()+"\n";
//		}
//		alert(msg);
}

function INTERNAL_FMT_Std2R1_Source_Set(id_name) {
	
	$("#Reformat_Dsk_Diag_Std2R1 input[type=checkbox]").prop('checked',false);
	$("#Reformat_Dsk_Diag_Std2R1 input[type=checkbox]:eq("+parseInt(id_name, 10)+")").prop('checked',true);
	
	var my_source_dev = "";
	var my_len = 99;
	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		if (CREATE_VOLUME_INFO[i][9] == 0) CREATE_VOLUME_INFO[i][7] = 0;
		if (CREATE_VOLUME_INFO[i][9] == 1) my_len = i;
		if (CREATE_VOLUME_INFO[i][9] == 2) CREATE_VOLUME_INFO[i][7] = 0;
		if (CREATE_VOLUME_INFO[i][9] == 3) CREATE_VOLUME_INFO[i][7] = 0;
	}

	if (parseInt(my_len) == 99) {
		my_len = CREATE_VOLUME_INFO.length;
		CREATE_VOLUME_INFO[my_len] = new Array();
	}

	my_source_dev = $("input[name='f_source_dev']:checked").val();
	
	var my_volume_name = "";
	var my_volume_size = "";
	for (var i = 0; i < STD2R1_SOURCE_INFO.length; i++) {
		if (STD2R1_SOURCE_INFO[i][3].toString() == my_source_dev) {
			my_volume_name = STD2R1_SOURCE_INFO[i][0].toString();
			my_volume_size = STD2R1_SOURCE_INFO[i][2].toString();
			break;
		}
	}
	CREATE_VOLUME_INFO[my_len][0] = my_volume_name;
	CREATE_VOLUME_INFO[my_len][8] = my_volume_size;
	CREATE_VOLUME_INFO[my_len][10] = my_source_dev;

	if (STD2R1_SOURCE_INFO.length > 1) {
		var my_disable_item_id = "";
		for (i = 0; i < STD2R1_SOURCE_INFO.length; i++) {
			if (!$("#f_newly_dev" + i + "_main").hasClass('gray_out')) $("#f_newly_dev" + i + "_main").addClass('gray_out');
		}
		if ($("#f_newly_dev" + id_name + "_main").hasClass('gray_out')) $("#f_newly_dev" + id_name + "_main").removeClass('gray_out');
	} //end of if (STD2R1_SOURCE_INFO.length > 1)
}

function INTERNAL_FMT_Std2R1_Get_newly_Dev(volume_name, my_newly_dev) {
	var my_len = 0;
	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		if (CREATE_VOLUME_INFO[i][9] == 1) {
			my_len = i;
			break;
		}
	}
	
	var my_source_dev = $("input[name='f_source_dev']:checked").val();
	var my_volume_size = "";
	for (i = 0; i < STD2R1_SOURCE_INFO.length; i++) {
		if (STD2R1_SOURCE_INFO[i][3].toString() == my_source_dev) {
			my_volume_size = STD2R1_SOURCE_INFO[i][2].toString();
		}
	}
	CREATE_VOLUME_INFO[my_len][0] = volume_name;
	CREATE_VOLUME_INFO[my_len][4] = my_newly_dev;
	CREATE_VOLUME_INFO[my_len][8] = my_volume_size;
	CREATE_VOLUME_INFO[my_len][10] = my_source_dev;

//	var msg = "my_newly_dev = "+ my_newly_dev + "\n";
//	for(var i=0;i<CREATE_VOLUME_INFO.length;i++)
//	{
//		msg += CREATE_VOLUME_INFO[i].toString()+"\n";
//	}
//	alert(msg);
}

function INTERNAL_FMT_Std2R1_Summary_List() {
	var html_tr = "";
	var j = 0;
	
	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		//if ( parseInt(CREATE_VOLUME_INFO[i][7]) == 1 && parseInt(CREATE_VOLUME_INFO[i][9]) == 1)
		if (parseInt(CREATE_VOLUME_INFO[i][7]) == 1) {
			if ((j % 2) == 0)
				html_tr += "<tr id=\"row" + j + "\">";
			else
				html_tr += "<tr id=\"row" + j + "\" class=\"erow\">";

			var my_volume_name = CREATE_VOLUME_INFO[i][0].toString().replace(/1/g, "Volume_1").replace(/2/g, "Volume_2").replace(/3/g, "Volume_3").replace(/4/g, "Volume_4");
			var my_raidlevel = INTERNAL_RaidLeve_HTML(CREATE_VOLUME_INFO[i][1].toString());
			var my_file_system = INTERNAL_File_System_HTML(CREATE_VOLUME_INFO[i][2].toString());
			
			html_tr += "<td><div style=\"text-align: left; width: 90px;\">" + my_volume_name + "</div></td>";
			html_tr += "<td><div style=\"text-align: left; width: 80px;\">" + my_raidlevel + "</div></td>";
			html_tr += "<td><div style=\"text-align: left; width: 72px;\">" + my_file_system + "</div></td>";
			html_tr += "<td><div style=\"text-align: left; width: 90px;\">" + CREATE_VOLUME_INFO[i][8] + "</div></td>";
			
			if (CREATE_VOLUME_INFO[i][1].toString() == "raid5")//RAID5(3 Disks)+Spare
					var my_dev = (CREATE_VOLUME_INFO[i][10].toString() != "none")?CREATE_VOLUME_INFO[i][4].toString()+CREATE_VOLUME_INFO[i][5].toString():CREATE_VOLUME_INFO[i][4].toString();
			else 	//STD to RAID 1			
					var my_dev = (CREATE_VOLUME_INFO[i][10].toString() != "none")?CREATE_VOLUME_INFO[i][10].toString()+CREATE_VOLUME_INFO[i][4].toString():CREATE_VOLUME_INFO[i][4].toString();
			
			html_tr += "<td><div style=\"text-align: left; width: 200px;\">" + INTERNAL_FMT_Convert_Device_Name(1, my_dev) + "</div></td>";
			html_tr += "</tr>";
			j++;
		}
	}
	
//	var msg = "[raid_reformat_diag.js][INTERNAL_FMT_Std2R1_Summary_List]\n";
//	msg += "my_dev=" + my_dev + "\n";
//	for (i=0; i<CREATE_VOLUME_INFO.length; i++)
//	{
//		msg += 	CREATE_VOLUME_INFO[i].toString()+"\n";
//	}
//	alert(msg);
	return html_tr;
}

function INTERNAL_FMT_DiskMGR_Std2R1() {
	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		if (CREATE_VOLUME_INFO[i][7].toString() == "1" && CREATE_VOLUME_INFO[i][9].toString() == "1") {
			var f_volume_name = CREATE_VOLUME_INFO[i][0];
			var f_source_dev = CREATE_VOLUME_INFO[i][10];
			var f_newly_dev = CREATE_VOLUME_INFO[i][4];
			var f_file_system = CREATE_VOLUME_INFO[i][2];
			var f_auto_sync = getSwitch("#storage_raidFormatSTD2R1AutoRebuild18_switch");

			wd_ajax({
				type: "POST",
				url: "/cgi-bin/hd_config.cgi",
				data: {
					cmd: 'cgi_FMT_Std2R1_DiskMGR',
					f_volume_name: f_volume_name,
					f_source_dev: f_source_dev,
					f_newly_dev: f_newly_dev,
					f_file_system: f_file_system,
					f_auto_sync: f_auto_sync
				},
				dataType: "xml",
				success: function (xml) {

					var res = $(xml).find("res").text();

					if (res == 1) {
						$("#Reformat_Dsk_Diag_Wait").hide();
						$("#Reformat_Dsk_Diag_Std2R1_Partitioning").show();

						if (intervalId != 0) clearInterval(intervalId);
						intervalId = setInterval("INTERNAL_FMT_Create_Partitioning('reformat_std2r1')", 3000);
					}
				} //end of success

			}); //end of ajax 

			break;
		}
	}
}
//function INTERNAL_FMT_DiskMGR_Std2R1_Sync_Init() {
//	
//	INTERNAL_FMT_ProgressBar_INIT(0, "std2r1_sync");
//	
//	$("#Reformat_Dsk_Diag_Std2R1_Partitioning").hide();
//	$("#Reformat_Dsk_Diag_Std2R1_Sync").show();
//	
//	if (intervalId != 0) clearInterval(intervalId);	
//	intervalId = setInterval("INTERNAL_FMT_DiskMGR_Std2R1_Sync_Bar()", 5000);
//}
//function INTERNAL_FMT_DiskMGR_Std2R1_Sync_Bar() {
//	
//	wd_ajax({
//		type: "POST",
//		url: "/cgi-bin/hd_config.cgi",
//		data: {
//			cmd: 'cgi_FMT_Get_Sync_State'
//		},
//		dataType: "xml",
//		success: function (xml) {
//
//			var my_wait_sync = $(xml).find("wait_sync").text();
//
//			/* ajax and xml parser start*/
//			wd_ajax({
//				url: FILE_DM_READ_PROGRESS,
//				type: "POST",
//				async: false,
//				cache: false,
//				dataType: "xml",
//				success: function (xml) {
//					var bar_amount = $(xml).find("dm_progress > item > progress").text();
//					var bar_desc = "";
//
//					var progress_bar = "#std2r1_sync_parogressbar";
//					var progress_state = "#std2r1_sync_state";
//					var progress_desc = "#std2r1_sync_desc";
//					
//					if (bar_amount == "" && parseInt(my_wait_sync) == 0) {
//						
//						if (intervalId != 0) clearInterval(intervalId);	
//						$(progress_bar).progressbar('option', 'value', 100);
//						
//						INTERNAL_FMT_HD_Remount("reformat_std2r1");
//						
//					} else {
//						if (parseInt(bar_amount) < 1) bar_amount = 0;
//
//						if ((parseInt(bar_amount) > 1) && (parseInt(my_wait_sync) == 1)) INTERNAL_FMT_DiskMGR_Std2R1_Sync_Now();
//
//						bar_desc = "Volume_" + $(xml).find("dm_progress > item > volume").text() + " " + _T('_raid', 'desc82');
//						$(progress_state).html("&nbsp;" + bar_desc);
//						$(progress_bar).progressbar('option', 'value', parseInt(bar_amount, 10));
//						$(progress_desc).html("&nbsp;" + bar_amount + "%");
//					}
//
//				}//end of success: function(xml){
//			}); //end of wd_ajax({	
//
//		} //end of success
//	}); //end of ajax 	
//}
function INTERNAL_FMT_DiskMGR_Std2R1_Sync_Now() {
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/hd_config.cgi",
		data: {
			cmd: 'cgi_FMT_STD2R1_Sync_Now'
		},
		dataType: "xml",
		success: function (xml) {} //end of success: function(xml){
	}); //end of wd_ajax({	
}
function INTERNAL_FMT_R5_Add_Spare_Dsk(current_volume_info) {
	var all_volume_info = new Array();
	all_volume_info = current_volume_info;
	
	var my_len = 99;
	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		if (CREATE_VOLUME_INFO[i][9] == 0) CREATE_VOLUME_INFO[i][7] = 0;
		if (CREATE_VOLUME_INFO[i][9] == 1) CREATE_VOLUME_INFO[i][7] = 0;
		if (CREATE_VOLUME_INFO[i][9] == 2) CREATE_VOLUME_INFO[i][7] = 0;
		if (CREATE_VOLUME_INFO[i][9] == 3) my_len = i;
	}

	if (parseInt(my_len) == 99) {
		my_len = CREATE_VOLUME_INFO.length;
		CREATE_VOLUME_INFO[my_len] = new Array();
	}

	CREATE_VOLUME_INFO[my_len][0] = all_volume_info[0][0];
	CREATE_VOLUME_INFO[my_len][1] = "raid5";
	CREATE_VOLUME_INFO[my_len][2] = all_volume_info[0][3];
	CREATE_VOLUME_INFO[my_len][3] = "none";
	CREATE_VOLUME_INFO[my_len][4] = all_volume_info[0][2];
	CREATE_VOLUME_INFO[my_len][5] = REFMT_HD_INFO[0][0];
	CREATE_VOLUME_INFO[my_len][6] = "0";
	CREATE_VOLUME_INFO[my_len][7] = "1";
	//CREATE_VOLUME_INFO[my_len][8] = volcapacity(parseInt(all_volume_info[0][4], 10));
	CREATE_VOLUME_INFO[my_len][8] = size2str(parseInt(all_volume_info[0][4].toString(), 10)*1024);
	CREATE_VOLUME_INFO[my_len][9] = "3";
	CREATE_VOLUME_INFO[my_len][10] = "1";
	
//	var msg = "[riad_reformat_disg.js][INTERNAL_FMT_R5_Add_Spare_Dsk]\n";
//	for(var idx=0; idx<current_volume_info.length; idx++)
//	{
//		msg += current_volume_info[idx]+"\n";
//	}
//	msg+= "------\n";
//	for(idx=0; idx<CREATE_VOLUME_INFO.length; idx++)
//	{
//		msg += CREATE_VOLUME_INFO[idx]+"\n";
//	}
//	alert(msg);
}

function INTERNAL_FMT_DiskMGR_R5Spare() {
	
	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		if (CREATE_VOLUME_INFO[i][7].toString() == "1" && CREATE_VOLUME_INFO[i][9].toString() == "3") {
			var f_volume_name = CREATE_VOLUME_INFO[i][0];
			var f_source_dev = CREATE_VOLUME_INFO[i][4];
			var f_spare_dev = CREATE_VOLUME_INFO[i][5];

			wd_ajax({
				type: "POST",
				url: "/cgi-bin/hd_config.cgi",
				data: {
					cmd: 'cgi_FMT_R5_SpareDsk_DiskMGR',
					f_volume_name: f_volume_name,
					f_source_dev: f_source_dev,
					f_spare_dev: f_spare_dev
				},
				dataType: "xml",
				success: function (xml) {

					var res = $(xml).find("res").text();

					if (res == 1) {
						$("#Reformat_Dsk_Diag_Wait").hide();
						$("#Reformat_Dsk_Diag_R5Spare_Bar").show();

						INTERNAL_FMT_ProgressBar_INIT(0, "reformat_r5spare");
						if (intervalId != 0) clearInterval(intervalId);
						intervalId = setInterval("INTERNAL_FMT_Show_Bar('reformat_r5spare')", 3000);
					}

				} //end of success

			}); //end of ajax 

		} //end of if(CREATE_VOLUME_INFO[i][7].toString ...

	} //end of for(var i...	
}

function INTERNAL_FMT_Std2R5_Get_Source_Dev(current_volume_info) {
	var my_html_tr = "";
	var all_volume_info = new Array(),
		all_hd_info = new Array(),
		my_create_volume = new Array();
	var my_source_dev_info = new Array();
	all_volume_info = current_volume_info;
	all_hd_info = CURRENT_HD_INFO;
	var my_dev = "",
		my_newly_hd = "";
	var init_flag = 0;
	var my_hd_min_size = 0;
	var m = 0;
	
//	var msg = "[raid_reformat_diag.js][INTERNAL_FMT_Std2R5_Get_Source_Dev]\n";
//	for(var idx=0; idx<current_volume_info.length;idx++)
//	{
//		msg += current_volume_info[idx].toString()+"\n";
//	}
//	alert(msg);
	
	/*
		all_volume_info[e][0] = my_volume;
		all_volume_info[e][1] = my_mode;
		all_volume_info[e][2] = my_device;
		all_volume_info[e][3] = my_file_type;
		all_volume_info[e][4] = my_size;
		all_volume_info[e][5] = my_raid_status;
		all_volume_info[e][6] = my_ve;
		all_volume_info[e][7] = is_roaming_volume;
	*/
	for (var i = 0; i < all_volume_info.length; i++) {
		for (var j = 0; j < all_hd_info.length; j++) {
			if (all_volume_info[i][2].toString() == all_hd_info[j][0].toString()) {
				my_hd_min_size = parseInt(all_hd_info[j][7].toString(),10);
				break;
			}
		}
		my_hd_min_size += parseInt(PARTITION_SWAP,10) + parseInt(PARTITION_HIDDEN,10);
	
		if ((all_volume_info[i][1] == "standard") && 
				(all_volume_info[i][6] == "0") && //Volume Encryption don't support STD 2 RAID5.
				(all_volume_info[i][7] == "0")) 
		{
			my_dev = all_volume_info[i][2];

			for (var j = 0; j < all_hd_info.length; j++) {
				if (all_hd_info[j][0] == my_dev) {
					
					var my_newly_hd_info = new Array();
					for (var k = 0; k < REFMT_HD_INFO.length; k++) {
						if ( parseInt(REFMT_HD_INFO[k][5],10) >= parseInt(my_hd_min_size, 10)) {
							my_newly_hd_info.push(REFMT_HD_INFO[k]);
						}
					}
					
					if (my_newly_hd_info.length > 1) {
						if ((i % 2) == 1)
							my_html_tr += "<tr id='row " + i + "' class='erow'>";
						else
							my_html_tr += "<tr id='row " + i + "'>";

						//var my_size = INTERNAL_FMT_Get_Gibytes(all_volume_info[i][4].toString(), 1);
						var my_size = all_volume_info[i][4].toString();
						
						my_html_tr += "<td align='center'><div style='text-align:center; width: 30px; border:0px solid red;'>";
						my_newly_hd = "";
						for (var k = 0; k < my_newly_hd_info.length; k++) {
							if ((k < 2))
								my_newly_hd += my_newly_hd_info[k][0].toString();
							else
								break;
						}

						if (i == 0)
							my_html_tr += "<input type=\"checkbox\" value=\"" + my_dev + "\" name=\"f_std2r5_source_dev\" id=\"f_std2r5_source_dev\" checked onclick=\"INTERNAL_FMT_Std2R5_Source_Set('" + i + "');\">";
						else
							my_html_tr += "<input type=\"checkbox\" value=\"" + my_dev + "\" name=\"f_std2r5_source_dev\" id=\"f_std2r5_source_dev\" onclick=\"INTERNAL_FMT_Std2R5_Source_Set('" + i + "');\">";
						
						my_html_tr += "</div></td>";
						my_html_tr += "<td align=\"left\"><div style=\"text-align: left; width: 98px;\">Volume_" + all_volume_info[i][0] + "</div></td>";
						my_html_tr += "<td align=\"left\"><div style=\"text-align: left; width: 77px;\">" + INTERNAL_File_System_HTML(all_volume_info[i][3].toString()) + "</div></td>";
						my_html_tr += "<td><div style=\"text-align: left; width: 100px;\">" + size2str(parseInt(all_volume_info[i][4].toString(), 10)*1024) + "</div></td>";
						my_html_tr += "<td align=\"left\"><div style=\"text-align: left; width: 65px;\">" + INTERNAL_FMT_Convert_Device_Name(1, all_hd_info[j][0]) + "</div></td>";
						my_html_tr += "<td align=\"left\"><div style=\"text-align: left; width: 150px;\">";

						var my_newly_hd_lst = "";
						for (var k = 0; k < my_newly_hd_info.length; k++) {
							my_newly_hd_lst += my_newly_hd_info[k][0];
						}
						
						my_html_tr += INTERNAL_FMT_Convert_Device_Name(1, my_newly_hd_lst);
						my_html_tr += "</div></td>";
						my_html_tr += "</tr>";
						
						//Std to R1 init for create volume
						if ((init_flag == 0) && (my_newly_hd_info.length > 0)) {
							my_create_volume[0] = all_volume_info[i][0];
							my_create_volume[1] = all_volume_info[i][3];
							my_create_volume[2] = my_size;
							my_create_volume[3] = my_dev;
							my_create_volume[4] = my_newly_hd_lst;
	
							INTERNAL_FMT_Std2R5_init(my_create_volume);
							init_flag = 1;
						}
	
						/* source dev info:
							0 -> volume_name,
							1 -> file_system,
							2 -> volume_size,
							3 -> source_dev,
							4 -> newly_dev
						*/
						my_source_dev_info[m] = new Array();
						my_source_dev_info[m][0] = all_volume_info[i][0]; //volume name
						my_source_dev_info[m][1] = all_volume_info[i][3]; //file system
						my_source_dev_info[m][2] = my_size; //volume size
						my_source_dev_info[m][3] = my_dev; //source dev
	
						m++;
					}

					break;
				}
			}
		}
	}

	STD2R5_SOURCE_INFO = my_source_dev_info;
	return my_html_tr;
}

function INTERNAL_FMT_Std2R5_init(create_volume_info) {
	/*
		0 -> volume_name,
		1 -> file_system,
		2 -> volume_size,
		3 -> source_dev,
		4 -> newly_dev
	*/

	var my_len = 99;
	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		if (CREATE_VOLUME_INFO[i][9] == 0) CREATE_VOLUME_INFO[i][7] = 0;
		if (CREATE_VOLUME_INFO[i][9] == 1) CREATE_VOLUME_INFO[i][7] = 0;
		if (CREATE_VOLUME_INFO[i][9] == 2) my_len = i;
		if (CREATE_VOLUME_INFO[i][9] == 3) CREATE_VOLUME_INFO[i][7] = 0;
	}

	if (parseInt(my_len) == 99) {
		my_len = CREATE_VOLUME_INFO.length;
		CREATE_VOLUME_INFO[my_len] = new Array();
	}

	CREATE_VOLUME_INFO[my_len][0] = create_volume_info[0].toString();
	CREATE_VOLUME_INFO[my_len][1] = "raid5";
	CREATE_VOLUME_INFO[my_len][2] = create_volume_info[1].toString();
	CREATE_VOLUME_INFO[my_len][3] = create_volume_info[2].toString();
	CREATE_VOLUME_INFO[my_len][4] = create_volume_info[4].toString();
	CREATE_VOLUME_INFO[my_len][5] = "none";
	CREATE_VOLUME_INFO[my_len][6] = "0";
	CREATE_VOLUME_INFO[my_len][7] = "1";
	CREATE_VOLUME_INFO[my_len][8] = create_volume_info[2].toString();
	CREATE_VOLUME_INFO[my_len][9] = "2";
	CREATE_VOLUME_INFO[my_len][10] = create_volume_info[3].toString();
}

function INTERNAL_FMT_Std2R5_Source_Set(id_name) {
	var my_len = 99;
	var my_source_dev = "";

	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		if (CREATE_VOLUME_INFO[i][9] == 0) CREATE_VOLUME_INFO[i][7] = 0;
		if (CREATE_VOLUME_INFO[i][9] == 1) CREATE_VOLUME_INFO[i][7] = 0;
		if (CREATE_VOLUME_INFO[i][9] == 2) my_len = i;
		if (CREATE_VOLUME_INFO[i][9] == 3) CREATE_VOLUME_INFO[i][7] = 0;
	}

	if (parseInt(my_len) == 99) {
		my_len = CREATE_VOLUME_INFO.length;
		CREATE_VOLUME_INFO[my_len] = new Array();
	}

	my_source_dev = $("input[name='f_std2r5_source_dev']:checked").val();
	var my_volume_name = "";
	var my_volume_size = "";
	for (var i = 0; i < STD2R5_SOURCE_INFO.length; i++) {
		if (STD2R5_SOURCE_INFO[i][3].toString() == my_source_dev) {
			my_volume_name = STD2R5_SOURCE_INFO[i][0].toString();
			my_volume_size = STD2R5_SOURCE_INFO[i][2].toString();
			break;
		}
	}
	CREATE_VOLUME_INFO[my_len][0] = my_volume_name;
	CREATE_VOLUME_INFO[my_len][8] = my_volume_size;
	CREATE_VOLUME_INFO[my_len][10] = my_source_dev;

//		var msg = "";
//		for(var i=0;i<CREATE_VOLUME_INFO.length;i++)
//		{
//			msg += CREATE_VOLUME_INFO[i].toString()+ "\n";
//		}
//		alert(msg);

	if (STD2R5_SOURCE_INFO.length > 1) {
		var my_disable_item_id = "";
		var my_select_id = "";

		for (i = 0; i < STD2R5_SOURCE_INFO.length; i++) {
			my_disable_item_id = "#f_std2r5_newly_dev" + i;

			if (parseInt(i) != parseInt(id_name)) {
				$(my_disable_item_id).attr("disabled", "disabled");

				my_select_id = "select[name='f_std2r5_newly_dev" + i + "'] option:selected";
				$(my_select_id).each(function () {
					$(this).attr("selected", false);
				});
			} else {
				$(my_disable_item_id).removeAttr("disabled");
				my_select_id = "select[name='f_std2r5_newly_dev" + i + "'] option";
				$(my_select_id).each(function () {
					$(this).attr("selected", true);
				});
			}

		}
	} //end of if (STD2R1_SOURCE_INFO.length > 1)
}

function INTERNAL_FMT_Std2R5_Get_newly_Dev(id_num) {
	var my_len = 0,
		my_newly_dev = "";
	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		if (CREATE_VOLUME_INFO[i][9] == 2) {
			my_len = i;
			break;
		}
	}

	var my_select_id = "select[name='f_std2r5_newly_dev" + id_num + "'] option:selected";
	$(my_select_id).each(function () {
		my_newly_dev += $(this).val();
	});

	//newly hd
	CREATE_VOLUME_INFO[my_len][4] = my_newly_dev;

	//r5's size
	var my_raid5_size = 0;
	if (my_newly_dev.length == 9)
		my_raid5_size = parseInt(CREATE_VOLUME_INFO[my_len][3]) * 3;
	else
		my_raid5_size = parseInt(CREATE_VOLUME_INFO[my_len][3]) * 2;
	CREATE_VOLUME_INFO[my_len][8] = my_raid5_size;

	//	var msg = "my_newly_dev =" + my_newly_dev+"\n";
	//	for(var i=0;i<CREATE_VOLUME_INFO.length;i++)
	//	{
	//		msg += CREATE_VOLUME_INFO[i].toString()+"\n";
	//	}
	//	alert(msg);
}

function INTERNAL_FMT_Std2R5_Summary_List() {
	var html_tr = "";
	var j = 0;
	
	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		if (parseInt(CREATE_VOLUME_INFO[i][7], 10) == 1) {
			if ((j % 2) == 0)
				html_tr += "<tr id=\"row" + j + "\">";
			else
				html_tr += "<tr id=\"row" + j + "\" class=\"erow\">";

			var my_volume_name = CREATE_VOLUME_INFO[i][0].toString().replace(/1/g,"Volume_1").replace(/2/g,"Volume_2").replace(/3/g,"Volume_3").replace(/4/g,"Volume_4");
			var my_raidlevel = INTERNAL_RaidLeve_HTML(CREATE_VOLUME_INFO[i][1].toString());
			var my_file_system = INTERNAL_File_System_HTML(CREATE_VOLUME_INFO[i][2].toString());
			
			html_tr += "<td><div style=\"text-align: left; width: 98px;\">" + my_volume_name + "</div></td>";
			html_tr += "<td><div style=\"text-align: left; width: 80px;\">" + my_raidlevel + "</div></td>";
			html_tr += "<td><div style=\"text-align: left; width: 70px;\">" + my_file_system + "</div></td>";
			
			if (CREATE_VOLUME_INFO[i][10].toString() != "none")
				var my_dev = CREATE_VOLUME_INFO[i][10].toString() + CREATE_VOLUME_INFO[i][4].toString();
			else
				var my_dev = CREATE_VOLUME_INFO[i][4].toString();
			
			var my_volume_size = CREATE_VOLUME_INFO[i][8]*((my_dev.length/3)-1);
			//my_volume_size = Math.round(my_volume_size*Math.pow(10, 2))/Math.pow(10, 2);
			
			html_tr += "<td><div style=\"text-align: left; width: 100px;\">" + size2str(parseInt(my_volume_size,10)*1024) + "</div></td>";
			html_tr += "<td><div style=\"text-align: left; width: 200px;\">" + INTERNAL_FMT_Convert_Device_Name(1, my_dev) + "</div></td>";
			html_tr += "</tr>";
			j++;
		}
	}
	
//	var msg = "[raid_reformat_diag.js][INTERNAL_FMT_Std2R5_Summary_List]\n";
//	msg += "my_dev = " + my_dev + "\n";
//	for (i=0; i< CREATE_VOLUME_INFO.length; i++)
//	{
//		msg += CREATE_VOLUME_INFO[i].toString()+"\n";
//	}
//	alert(msg);
	
	return html_tr;
}

function INTERNAL_FMT_DiskMGR_Std2R5() {
	
	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		if (CREATE_VOLUME_INFO[i][7].toString() == "1" && CREATE_VOLUME_INFO[i][9].toString() == "2") {
			var f_volume_name = CREATE_VOLUME_INFO[i][0];
			var f_source_dev = CREATE_VOLUME_INFO[i][10];
			var f_newly_dev = CREATE_VOLUME_INFO[i][4];
			var f_file_system = CREATE_VOLUME_INFO[i][2];
			var f_auto_sync = getSwitch("#storage_raidFormatSTD2R5AutoRebuild28_switch");
		
			wd_ajax({
				type: "POST",
				url: "/cgi-bin/hd_config.cgi",
				data: {
					cmd: 'cgi_FMT_Std2R5_DiskMGR',
					f_volume_name: f_volume_name,
					f_source_dev: f_source_dev,
					f_newly_dev: f_newly_dev,
					f_file_system: f_file_system,
					f_auto_sync: f_auto_sync
				},
				dataType: "xml",
				success: function (xml) {

					var res = $(xml).find("res").text();

					if (res == 1) {
						$("#Reformat_Dsk_Diag_Wait").hide();
						$("#Reformat_Dsk_Diag_Std2R5_Partitioning").show();
						
//						$("#Reformat_Dsk_Diag_Std2R5_Bar").show();
//						INTERNAL_FMT_ProgressBar_INIT(0, "reformat_std2r5");
//						if (intervalId != 0) clearInterval(intervalId);
//						intervalId = setInterval("INTERNAL_FMT_Show_Bar('reformat_std2r5')", 3000);
						
						if (intervalId != 0) clearInterval(intervalId);
						intervalId = setInterval("INTERNAL_FMT_Create_Partitioning('reformat_std2r5')", 3000);
						
					}

				} //end of success

			}); //end of ajax 

		}
	}
}
//function INTERNAL_FMT_DiskMGR_Migrate_Resize_Bar() {
//	
//	/* ajax and xml parser start*/
//	wd_ajax({
//		url: FILE_DM_READ_STATE,
//		type: "GET",
//		async: false,
//		cache: false,
//		dataType: "xml",
//		success: function (xml) {
//			var bar_amount = $(xml).find("dm_state > percent").text();
//			var bar_state = $(xml).find("dm_state>finished").text();
//		
//			var progress_bar = "#migrate_resize_sync_parogressbar";
//			var progress_state = "#migrate_resize_sync_state";
//			var progress_desc = "#migrate_resize_sync_desc";
//
//			if (parseInt(bar_state,10) == 1) {
//				
//				if (intervalId != 0) clearInterval(intervalId);	
//				INTERNAL_FMT_HD_Remount('migrate_resize_sync');
//				
//			} else {
//				if (parseInt(bar_amount) < 1) bar_amount = 0;
//
//				var bar_desc = _T('_raid','desc81');
//				$(progress_state).html("&nbsp;" + bar_desc);
//				$(progress_bar).progressbar('option', 'value', parseInt(bar_amount));
//				$(progress_desc).html("&nbsp;" + bar_amount + "%");
//			}
//
//		} //end of success: function(xml){
//
//	}); //end of wd_ajax({	
//
//}
function INTERNAL_FMT_Check_DiskMGR_finish() {
	var flag = 0;
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/hd_config.cgi",
		data: {
			cmd: 'cgi_FMT_Disk_DiskMGR_ps'
		},
		dataType: "xml",
		success: function (xml) {
			var res = $(xml).find("res").text();
			flag = res;

		} //end of success

	}); //end of ajax    

	return flag;
}

function INTERNAL_FMT_R12R5_Get_Source_Dev(current_volume_info) {
	var my_html_tr = "";
	var all_volume_info = new Array(),
		my_newly_hd_info = new Array(),
		my_create_volume = new Array(),
		my_newly_hd = new Array();
	var my_source_dev_info = new Array();
	var all_hd_info = CURRENT_HD_INFO;
	all_volume_info = current_volume_info;
	my_newly_hd_info = REFMT_HD_INFO;
	var my_dev = "";
	var init_flag = 0;
	var my_hd_min_size = 0;
	var m = 0;

	for (var i = 0; i < all_volume_info.length; i++) {
		for (var j = 0; j < all_hd_info.length; j++) {
			if (all_volume_info[i][2].toString().slice(0, 3) == all_hd_info[j][0].toString()) {
				my_hd_min_size = parseInt(all_hd_info[j][7].toString(),10);
				break;
			}
		}
		my_hd_min_size += parseInt(PARTITION_SWAP,10) + parseInt(PARTITION_HIDDEN,10);

		if ((all_volume_info[i][1] == "raid1") && 
				(all_volume_info[i][6] == "0") && //volume encryption don't support RAID1 to RAID5
				(all_volume_info[i][7] == "0")) 
		{
			my_newly_hd.length = 0;
			for (var k = 0; k < my_newly_hd_info.length; k++) {
				if ((k < 2) && (parseInt(my_newly_hd_info[k][5], 10) >= my_hd_min_size))
				{
					my_newly_hd.push(my_newly_hd_info[k][0].toString());
				}	
			}
			
			if (my_newly_hd.length != 0)
			{
				var _tmp_disk_cnt =  1 + (my_newly_hd.toString().replace(",", "").length / 3);
				var my_raid5_size = size2str((parseInt(all_volume_info[i][4].toString() ,10)*1024) * _tmp_disk_cnt);
				var my_size = all_volume_info[i][4].toString();
				if ((i % 2) == 1)
					my_html_tr += "<tr id='row " + i + "' class='erow'>";
				else
					my_html_tr += "<tr id='row " + i + "'>";
	
				my_html_tr += "<td align='center'><div style='text-align:center; width: 30px; border:0px solid red;'>";
				
				my_dev = all_volume_info[i][2];
				//var my_size = Math.round((parseInt(all_volume_info[i][4].toString()) * 1024) / 1000000000);
				//my_size = all_volume_info[i][4].toString();
				my_html_tr += "<input type=\"checkbox\" value=\"" + my_dev + "\" name=\"f_r12r5_source_dev\" id=\"f_r12r5_source_dev\" checked >";
				my_html_tr += "</div></td>";
				my_html_tr += "<td align=\"left\"><div style=\"text-align: left; width: 98px;\">Volume_" + all_volume_info[i][0] + "</div></td>";
				my_html_tr += "<td align=\"left\"><div style=\"text-align: left; width: 77px;\">" + INTERNAL_File_System_HTML(all_volume_info[i][3].toString()) + "</div></td>";
				my_html_tr += "<td><div style=\"text-align: left; width: 65px;\">" + my_raid5_size + "</div></td>";
				my_html_tr += "<td align=\"left\"><div style=\"text-align: left; width: 110px;\">" + INTERNAL_FMT_Convert_Device_Name(1, all_volume_info[i][2]) + "</div></td>";
				my_html_tr += "<td align=\"left\"><div style=\"text-align: left; width: 105px;\">";
				var tmp = my_newly_hd.toString().replace(",", "");
				my_html_tr += INTERNAL_FMT_Convert_Device_Name(1, tmp);
				my_html_tr += "</div></td>";
				my_html_tr += "</tr>";
			}
			/*
			R5 to R1 init for create volume
					0 -> volume_name,
					1 -> file_system,
					2 -> raid 1 volume_size,
					3 -> source_dev,
					4 -> newly_dev,
					5 -> raid 5 volume size
			*/
			if (init_flag == 0 && my_newly_hd != "") {
				
				
				my_create_volume[0] = all_volume_info[i][0];
				my_create_volume[1] = all_volume_info[i][3];
				my_create_volume[2] = my_size;
				my_create_volume[3] = my_dev;
				my_create_volume[4] = my_newly_hd.toString().replace(",", "");
				my_create_volume[5] = my_raid5_size;
				INTERNAL_FMT_R12R5_init(my_create_volume);
				init_flag = 1;
			}

			/* source dev info:
						0 -> volume_name,
						1 -> file_system,
						2 -> volume_size,
						3 -> source_dev,
						4 -> newly_dev
			*/
			my_source_dev_info[m] = new Array();
			my_source_dev_info[m][0] = all_volume_info[i][0]; //volume name
			my_source_dev_info[m][1] = all_volume_info[i][3]; //file system
			my_source_dev_info[m][2] = my_size; //volume size
			my_source_dev_info[m][3] = my_dev; //source dev

			m++;

			break;
		}
	}

	R12R5_SOURCE_INFO = my_source_dev_info;

	return my_html_tr;
}

function INTERNAL_FMT_R12R5_init(create_volume_info) {
	/*
		0 -> volume_name,
		1 -> file_system,
		2 -> raid 1 volume_size,
		3 -> source_dev,
		4 -> newly_dev
		5 -> raid 5 volume_size,
	*/
	var my_len = 99;
	var my_newly_hd = "";
	var my_raid5_size = 0;
	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		if (CREATE_VOLUME_INFO[i][9] == 0) CREATE_VOLUME_INFO[i][7] = 0;
		if (CREATE_VOLUME_INFO[i][9] == 1) CREATE_VOLUME_INFO[i][7] = 0;
		if (CREATE_VOLUME_INFO[i][9] == 2) CREATE_VOLUME_INFO[i][7] = 0;
		if (CREATE_VOLUME_INFO[i][9] == 3) CREATE_VOLUME_INFO[i][7] = 0;
		if (CREATE_VOLUME_INFO[i][9] == 4) my_len = i;
	}

	if (parseInt(my_len) == 99) {
		my_len = CREATE_VOLUME_INFO.length;
		CREATE_VOLUME_INFO[my_len] = new Array();
	}

	CREATE_VOLUME_INFO[my_len][0] = create_volume_info[0].toString();
	CREATE_VOLUME_INFO[my_len][1] = "raid5";
	CREATE_VOLUME_INFO[my_len][2] = create_volume_info[1].toString();
	CREATE_VOLUME_INFO[my_len][3] = create_volume_info[2].toString();
	CREATE_VOLUME_INFO[my_len][4] = create_volume_info[4].toString();
	CREATE_VOLUME_INFO[my_len][5] = "none";
	CREATE_VOLUME_INFO[my_len][6] = "0";
	CREATE_VOLUME_INFO[my_len][7] = "1";
	my_newly_hd = create_volume_info[4].toString();

//	if (my_newly_hd.length == 3)
//		my_raid5_size = parseInt(create_volume_info[2].toString()) * 2;
//	else
//		my_raid5_size = parseInt(create_volume_info[2].toString()) * 3;
//	CREATE_VOLUME_INFO[my_len][8] = my_raid5_size;
	CREATE_VOLUME_INFO[my_len][8] = create_volume_info[5].toString()//my_raid5_size;
	CREATE_VOLUME_INFO[my_len][9] = "4";
	CREATE_VOLUME_INFO[my_len][10] = create_volume_info[3].toString();

//		//debug
//		var msg = "[raid_reformat_diag.js][INTERNAL_FMT_R12R5_init]\n";
//		for(i=0;i<create_volume_info.length;i++)
//		{
//			msg += create_volume_info[i].toString()+ "\n";
//		}
//		msg += "-----------------\n"
//		for(i=0;i<CREATE_VOLUME_INFO.length;i++)
//		{
//			msg += CREATE_VOLUME_INFO[i].toString()+ "\n";
//		}
//		alert(msg);
}

function INTERNAL_FMT_R12R5_Get_newly_Dev(id_num) {
	var my_len = 0,
		my_newly_dev = "";
	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		if (CREATE_VOLUME_INFO[i][9] == 4) {
			my_len = i;
			break;
		}
	}

	var my_select_id = "select[name='f_r12r5_newly_dev'] option:selected";
	$(my_select_id).each(function () {
		my_newly_dev += $(this).val();
	});

	//newly hd
	CREATE_VOLUME_INFO[my_len][4] = my_newly_dev;

	//r5's size
	var my_raid5_size = 0;
	if (my_newly_dev.length == 6)
		my_raid5_size = parseInt(CREATE_VOLUME_INFO[my_len][3]) * 3;
	else
		my_raid5_size = parseInt(CREATE_VOLUME_INFO[my_len][3]) * 2;
	CREATE_VOLUME_INFO[my_len][8] = my_raid5_size;

//		var msg = "my_newly_dev =" + my_newly_dev+"\n";
//		for(var i=0;i<CREATE_VOLUME_INFO.length;i++)
//		{
//			msg += CREATE_VOLUME_INFO[i].toString()+"\n";
//		}
//		alert(msg);
}

function INTERNAL_FMT_R12R5_Summary_List() {
	var html_tr = "";
	var j = 0;
	
	var msg = "";
	for (var i=0;i<CREATE_VOLUME_INFO.length;i++)
	{
 		msg += CREATE_VOLUME_INFO[i].toString()+"\n";
 		if ( parseInt(CREATE_VOLUME_INFO[i][7]) == 1)
 		{ 			
 			if ((j%2)==0)
 				html_tr += "<tr id=\"row"+j+"\">";
 			else
 				html_tr += "<tr id=\"row"+j+"\" class=\"erow\">";
 			
 			var my_volume_name = CREATE_VOLUME_INFO[i][0].toString().replace(/1/g,"Volume_1").replace(/2/g,"Volume_2").replace(/3/g,"Volume_3").replace(/4/g,"Volume_4");	
			var my_raidlevel = INTERNAL_RaidLeve_HTML(CREATE_VOLUME_INFO[i][1].toString());	
			var my_file_system = INTERNAL_File_System_HTML(CREATE_VOLUME_INFO[i][2].toString());	
 			html_tr += "<td><div style=\"text-align: left; width: 98px;\">" + my_volume_name + "</div></td>";	
 			html_tr += "<td><div style=\"text-align: left; width: 80px;\">" + my_raidlevel + "</div></td>";
 			html_tr += "<td><div style=\"text-align: left; width: 80px;\">" + my_file_system + "</div></td>";
 			html_tr += "<td><div style=\"text-align: left; width: 85px;\">" + CREATE_VOLUME_INFO[i][8] + "</div></td>";
 			
 			if (CREATE_VOLUME_INFO[i][10].toString() != "none")
 				var my_dev = CREATE_VOLUME_INFO[i][10].toString() + CREATE_VOLUME_INFO[i][4].toString();
 			else
 				var my_dev = CREATE_VOLUME_INFO[i][4].toString();	
 			
 			html_tr += "<td><div style=\"text-align: left; width: 180px;\">" + INTERNAL_FMT_Convert_Device_Name(1,my_dev) + "</div></td>";
 			html_tr  += "</tr>";
 			j++;
 		}
 	}
 	
// 	var msg = "[raid_reformat_diag.js][INTERNAL_FMT_R12R5_Summary_List]\n";
// 	for (var i=0; i < CREATE_VOLUME_INFO.length; i++)
// 	{
// 		msg += 	CREATE_VOLUME_INFO[i].toString()+"\n";
// 	}
// 	alert(msg);
 		
	return html_tr;
}

function INTERNAL_FMT_DiskMGR_R12R5() {
	
	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		if (CREATE_VOLUME_INFO[i][7].toString() == "1" && CREATE_VOLUME_INFO[i][9].toString() == "4") {
			var f_volume_name = CREATE_VOLUME_INFO[i][0];
			var f_source_dev = CREATE_VOLUME_INFO[i][10];
			var f_newly_dev = CREATE_VOLUME_INFO[i][4];
			var f_file_system = CREATE_VOLUME_INFO[i][2];
			var f_auto_sync = getSwitch("#storage_raidFormatR12R5AutoRebuild32_switch");

			wd_ajax({
				type: "POST",
				url: "/cgi-bin/hd_config.cgi",
				data: {
					cmd: 'cgi_FMT_R12R5_DiskMGR',
					f_volume_name: f_volume_name,
					f_source_dev: f_source_dev,
					f_newly_dev: f_newly_dev,
					f_file_system: f_file_system,
					f_auto_sync: f_auto_sync
				},
				dataType: "xml",
				success: function (xml) {

					var res = $(xml).find("res").text();

					if (res == 1) {
						$("#Reformat_Dsk_Diag_Wait").hide();
						$("#Reformat_Dsk_Diag_R12R5_Partitioning").show();

//						if (intervalId != 0) clearInterval(intervalId);
//						intervalId = setInterval("INTERNAL_FMT_Check_Partitioning_Finish('reformat_r12r5_1st')", 3000);
						
						if (intervalId != 0) clearInterval(intervalId);
						intervalId = setInterval("INTERNAL_FMT_Create_Partitioning('reformat_r12r5_1st')", 3000);
					}

				} //end of success

			}); //end of ajax 

		}
	}
}

function INTERNAL_FMT_Create_State(my_type) {
	switch (parseInt(my_type)) {
	case 1: //STD to RAID1
		for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
			CREATE_VOLUME_INFO[i][7] = (parseInt(CREATE_VOLUME_INFO[i][9].toString()) == 1)?1:0;
		}
		break;

	case 2: //STD to RAID5
		for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
			if (parseInt(CREATE_VOLUME_INFO[i][9].toString()) == 2)
				CREATE_VOLUME_INFO[i][7] = 1;
			else
				CREATE_VOLUME_INFO[i][7] = 0;
		}
		break;

	case 3: //RAID5 Spare Disk

	break;

	case 4: //RAID1 to RAID5

		for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
			if (parseInt(CREATE_VOLUME_INFO[i][9].toString()) == 4)
				CREATE_VOLUME_INFO[i][7] = 1;
			else
				CREATE_VOLUME_INFO[i][7] = 0;
		}
		break;

	default: //newly insert hd
		for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
			if (parseInt(CREATE_VOLUME_INFO[i][9].toString()) == 0)
				CREATE_VOLUME_INFO[i][7] = 1;
			else
				CREATE_VOLUME_INFO[i][7] = 0;
		}
		break;
	}
}

function FMT_Reformat_Data_Init(fmt_step) {
	FMT_SHAREDNAME = INTERNAL_FMT_Get_Free_SharedName(); //Support Hot Plug
	CURRENT_HD_INFO = INTERNAL_Get_HD_Info();
	
	if (parseInt(fmt_step) != 0) {
		FMT_REFORMAT_DATA_INIT = 1
		return;
	}

	REFMT_HD_INFO = new Array();
	
	var my_current_volume_info = new Array();	
	my_current_volume_info = INTERNAL_FMT_Get_CurrentVOL();
	
	var flag = INTERNAL_FMT_AllowOf_RAID5_SpareDsk(my_current_volume_info);
	if (parseInt(flag) == 1) {
		$("#tr_newly_hd_spare_disk").show();
		INTERNAL_FMT_R5_Add_Spare_Dsk(my_current_volume_info);
	}

	flag = INTERNAL_FMT_AllowOf_STD2R1(my_current_volume_info);
	if (parseInt(flag) == 1) {
		$("#tr_newly_hd_std2r1").show();

		$("#reformat_std2r1_source_list").empty();
		var html_tr = INTERNAL_FMT_Std2R1_Get_Source_Dev(my_current_volume_info);
		$("#reformat_std2r1_source_list").append(html_tr);
		
		$("input[name='f_source_dev']").each(function (e) {
			if ($(this).attr("disabled") != "disabled") {
				var my_dev = $(this).val();
				$(this).prop('checked', true);
				return false;
			}
		})
	}

	flag = INTERNAL_FMT_AllowOf_STD2R5(my_current_volume_info);
	if (parseInt(flag) == 1) {
		$("#tr_newly_hd_std2r5").show();
		$("#reformat_std2r5_source_list").empty();
		var html_tr = INTERNAL_FMT_Std2R5_Get_Source_Dev(my_current_volume_info);
		$("#reformat_std2r5_source_list").append(html_tr);
	}

	flag = INTERNAL_FMT_AllowOf_R12R5(my_current_volume_info);
	if (parseInt(flag) == 1) {
		$("#tr_newly_hd_r12r5").show();
		$("#reformat_r12r5_source_list").empty();
		var html_tr = INTERNAL_FMT_R12R5_Get_Source_Dev(my_current_volume_info);
		$("#reformat_r12r5_source_list").append(html_tr);
	}

	FMT_REFORMAT_DATA_INIT = 1;
}

function INTERNAL_FMT_R5Extend_Summary_List() {
	var html_tr = "";
	var j = 0;
	var current_volume_info = INTERNAL_FMT_Get_CurrentVOL();
	
	for (var i = 0; i < CREATE_VOLUME_INFO.length; i++) {
		if (parseInt(CREATE_VOLUME_INFO[i][7], 10) == 1) {
			if ((j % 2) == 0)
				html_tr += "<tr id=\"row" + j + "\">";
			else
				html_tr += "<tr id=\"row" + j + "\" class=\"erow\">";

			var my_volume_name = CREATE_VOLUME_INFO[i][0].toString().replace(/1/g,"Volume_1").replace(/2/g,"Volume_2").replace(/3/g,"Volume_3").replace(/4/g,"Volume_4");
			var my_raidlevel = INTERNAL_RaidLeve_HTML(CREATE_VOLUME_INFO[i][1].toString());
			var my_file_system = INTERNAL_File_System_HTML(CREATE_VOLUME_INFO[i][2].toString());
			
			html_tr += "<td><div style=\"text-align: left; width: 100px;\">&nbsp;&nbsp;" + my_volume_name + "</div></td>";
			html_tr += "<td><div style=\"text-align: left; width: 100px;\">" + my_raidlevel + "</div></td>";
			html_tr += "<td><div style=\"text-align: left; width: 100px;\">" + my_file_system + "</div></td>";
			
			if (CREATE_VOLUME_INFO[i][10].toString() != "none")
				var my_dev = CREATE_VOLUME_INFO[i][10].toString() + CREATE_VOLUME_INFO[i][4].toString();
			else
				var my_dev = CREATE_VOLUME_INFO[i][4].toString();
			
			var my_volume_size = 0;
			for(var k in current_volume_info)
			{
				if (current_volume_info[k][0] != CREATE_VOLUME_INFO[i][0]) coninue;

				my_volume_size = current_volume_info[k][4] * 1024;
				break;
			}
			my_volume_size *= 1.5;
			my_volume_size = size2str(my_volume_size, "GB");

			html_tr += "<td><div style=\"text-align: left; ;\">" + my_volume_size + "</div></td>";
			html_tr += "<td><div style=\"text-align: right; margin-right: 10px;\">" + INTERNAL_FMT_Convert_Device_Name(1, my_dev) + "</div></td>";
			html_tr += "</tr>";
			j++;
		}
	}

	return html_tr;
}
