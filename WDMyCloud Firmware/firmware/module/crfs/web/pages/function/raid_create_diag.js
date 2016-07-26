var hd_slot_map = new Array('a', 'b', 'c', 'd');
var INTERNAL_FMT_Physical_Disk_List_timeout = -1;

function INTERNAL_FMT_Physical_Disk_List(my_id, my_dev, my_setTimeout_flag)
{
	var ele = $("#"+my_id);
	var tmp = "<tr id='row{0}'>";
	if (my_id == "formatdsk_hd_info")
	{
		tmp += "<td align='center'><div style='text-align: center; width: 40px; padding-top: 5px;'><img src='/web/images/flexigrid/IconsDiagnosticsDrive.png' border='0' height='30px'></div></td>";
		tmp += "<td align='left'><div style='text-align: left; width: 150px;'>"+_T('_disk_mgmt','desc1')+"{1}</div></td>";
		tmp += "<td align='left'><div style='text-align: left; width: 110px;'>{2}</div></td>";
		tmp += "<td align='left'>{3}</td>";
	}
	else
	{
		tmp += "<td align='center'><div style='text-align: center; width: 40px; padding-top: 5px;'><img src='/web/images/flexigrid/IconsDiagnosticsDrive.png' border='0' height='30px'></div></td>";
		tmp += "<td align='left'><div style='text-align: left; width: 150px;'>"+_T('_disk_mgmt','desc1')+"{1}</div></td>";
		tmp += "<td align='left'><div style='text-align: left; width: 110px;'>{2}</div></td>";
		tmp += "<td align='left'>{3}</td>";
	}
	tmp += "</tr>";
	
	var my_state_tmp = '<div style="text-align: left; width: 280px;">' + 
						'<div class="list_icon_bar" style="width:260px;">' +
					  '<div class="bar_p" style="float: left; width: {0}%;"></div>' +
					  '</div>'+
					  '<div class="list_bar_text" style="width:260px;border: 0px solid red;">{1} {2}% </div>' + 
					  '</div>';

	ele.empty();

	var my_html = "", my_state="";
	var my_state_flag = 1;
	var ret_idx = new Array();
		
		$(SYSINFO).find('disks').find('disk').each(function(idx) {
		if (my_dev.indexOf($('name',this).text()) != -1)
		{
			if ($('name',this).text().length != 0)
			{
				ret_idx.push(idx);
				var my_smart_res = $('smart>result',this).text();

			 	if (my_smart_res.indexOf("Pass") != -1)	
				{
					my_state =  '<div style="text-align: right; width: 280px;">' + 
											_T('_disk_mgmt','desc8') + "&nbsp;&nbsp;&nbsp;" +	//Good
											'</div>';	
				}
				else if ( (my_smart_res.indexOf("Fail") != -1) || (my_smart_res.indexOf("Abort") != -1))	//Bad
				{
					my_state =  '<div style="text-align: right; width: 280px;">' + 
											_T('_disk_mgmt','desc9') + "&nbsp;&nbsp;&nbsp;" +
											'</div>';
					my_state_flag = 0;
				}
				else	//progress bar
				{
					my_state = 	String.format(my_state_tmp,
						/*0*/  $('smart>percent',this).text(),
						/*1*/  _T('_raid','desc114'),
						/*2*/  $('smart>percent',this).text(),
						/*3*/  $('smart>percent',this).text()
					);

					my_state_flag = 0;

					my_setTimeout_flag = (my_setTimeout_flag == 0) ? 1 : my_setTimeout_flag;
				}

				my_html = String.format(tmp,
					/*0*/ $(this).attr('id'),
					/*1*/ $(this).attr('id'),
					/*2*/ size2str($('size',this).text()),
					/*3*/ my_state
				);
				
				ele.append(my_html);
			}
		}
	});

	$("#formatdsk_hd_info").show();

	if (my_id == "formatdsk_hd_info")
	{	
			if (my_state_flag == 1)
			{
				if ($("#storage_raidFormatNext2_button").hasClass("grayout"))	$("#storage_raidFormatNext2_button").removeClass("grayout");
			}
			else
			{
				if (!$("#storage_raidFormatNext2_button").hasClass("grayout"))  $("#storage_raidFormatNext2_button").addClass("grayout");
			}
	}
	else
	{
		if (my_state_flag == 1)
		{
			if ($("#storage_raidManuallyRebuildNext2_button").hasClass("grayout"))	$("#storage_raidManuallyRebuildNext2_button").removeClass("grayout");
		}
		else
		{
			if (!$("#storage_raidManuallyRebuildNext2_button").hasClass("grayout"))  $("#storage_raidManuallyRebuildNext2_button").addClass("grayout");
		}
	}

	if (my_setTimeout_flag == 1)
	{
		INTERNAL_FMT_Physical_Disk_List_timeout = setTimeout(function() {
			INTERNAL_FMT_Physical_Disk_List(my_id,my_dev, my_setTimeout_flag);
		}, 2000);
	}

	return ret_idx;
}
function INTERNAL_FMT_VE_Switch_Click(vol, val)
{
	var my_button_id_l = "#RAIDEncrytionVol_" + vol + "_l";
	var my_button_id_r = "#RAIDEncrytionVol_" + vol + "_r";
	
	if (parseInt(val, 10) == 1) //lock
	{
		if(!$(my_button_id_l).hasClass('sel')) {$(my_button_id_l).addClass('sel');}	
		if($(my_button_id_r).hasClass('sel')) {	$(my_button_id_r).removeClass('sel');}	
	}
	else	//unlock
	{
		if($(my_button_id_l).hasClass('sel')) $(my_button_id_l).removeClass('sel');
		if(!$(my_button_id_r).hasClass('sel')) $(my_button_id_r).addClass('sel');
	}	
	
	for (var i=0;i<CREATE_VOLUME_INFO.length;i++)
	{
		if (CREATE_VOLUME_INFO[i][0] == parseInt(vol,10))
		{
			CREATE_VOLUME_INFO[i][12] = val;
			break;
		}
	}
}
function INTERNAL_FMT_VE_Switch(n)
{
	var html_tr = "";
	html_tr += "<div style=\"padding:7px 0px 0px 0px;\">";
	html_tr += "<button class=\"left_button tip\" id=\"RAIDEncrytionVol_"+n+"_l\" onclick=\"INTERNAL_FMT_VE_Switch_Click('"+n+"','1')\"><img src=\"/web/images/RAID/lock.png\" width=\"26px\"></button>";
	html_tr += "<button class=\"sel right_button tip\" id=\"RAIDEncrytionVol_"+n+"_r\"  onclick=\"INTERNAL_FMT_VE_Switch_Click('"+n+"','0')\"><img src=\"/web/images/RAID/unlock.png\" width=\"26px\"></button>";
	html_tr += "</div>";
	
	return html_tr;
}
function INTERNAL_FMT_VE_List()
{
	var html_tr = "";
	var j=0;
	
	for (var i=0;i<CREATE_VOLUME_INFO.length;i++)
	{	
		if ( parseInt(CREATE_VOLUME_INFO[i][7],10) == 1)
 		{
 			if ((j%2)==0)
 				html_tr += "<tr id=\"row"+j+"\">";
 			else
 				html_tr += "<tr id=\"row"+j+"\" class=\"erow\">";
 			html_tr += "<td><div style=\"text-align: left; width: 40px;\"><img width=\"20px\" border=\"0\" src=\"/web/images/LightningIcon_Volumes_NORM40X36.png\"></div></td>";
 			var my_volume_name = CREATE_VOLUME_INFO[i][0].toString().replace(/1/g,"Volume_1").replace(/2/g,"Volume_2").replace(/3/g,"Volume_3").replace(/4/g,"Volume_4");
			var my_raidlevel = INTERNAL_RaidLeve_HTML(CREATE_VOLUME_INFO[i][1].toString());	
			var my_file_system = INTERNAL_File_System_HTML(CREATE_VOLUME_INFO[i][2].toString());	
 			html_tr += "<td><div style=\"text-align: left; width: 98px;\">" + my_volume_name + "</div></td>";	
 			
 			if ( (CREATE_VOLUME_INFO[i][1].toString() == "raid5") && (CREATE_VOLUME_INFO[i][5].toString() != "none"))
 				html_tr += "<td><div style=\"text-align: left; width: 125px;\">" + my_raidlevel +"+"+ _T('_format','spare') + "</div></td>";
 			else
 				html_tr += "<td><div style=\"text-align: left; width: 125px;\">" + my_raidlevel + "</div></td>";
 				
 			html_tr += "<td><div style=\"text-align: left; width: 80px;\">" + CREATE_VOLUME_INFO[i][8] + " GB</div></td>";
 			
			html_tr += "<td>" + INTERNAL_FMT_VE_Switch(CREATE_VOLUME_INFO[i][0]) + "</td>";
 			
 			html_tr  += "</tr>";
 			j++;
 		}
 	}
 	return html_tr;	
}
function INTERNAL_FMT_VE_Num()
{
	var num = 0;
	
	for (var i=0;i<CREATE_VOLUME_INFO.length;i++)
	{
		if (parseInt(CREATE_VOLUME_INFO[i][9].toString()) == 0)
		{
			if (parseInt(CREATE_VOLUME_INFO[i][12].toString()) == 1 ) num++;
		}	
	}
	
	return num;
}

function INTERNAL_FMT_VE_Get_Info(my_no)
{
	var ve_list = new Array();
	var j=0;
	for (var i=0;i<CREATE_VOLUME_INFO.length;i++)
	{
		if (parseInt(CREATE_VOLUME_INFO[i][9].toString()) == 0)
		{
			if (parseInt(CREATE_VOLUME_INFO[i][12].toString()) == 1 ) 
			{
				ve_list[j] = new Array();
				ve_list[j][0] = CREATE_VOLUME_INFO[i][0].toString();
				ve_list[j][1] = CREATE_VOLUME_INFO[i][12].toString();
				ve_list[j][2] = CREATE_VOLUME_INFO[i][13].toString();
				ve_list[j][3] = CREATE_VOLUME_INFO[i][14].toString();
				j++;
			}
		}	
	}
	
	return ve_list[parseInt(my_no)];
}

function INTERNAL_FMT_VE_Set_Info(my_vol,my_encryption,my_auto_mount,my_pwd)
{
//	var msg = "my_vol=" + my_vol + "\n";
//	msg += "my_encryption=" + my_encryption + "\n";
//	msg += "my_auto_mount=" + my_auto_mount + "\n";
//	msg += "my_pwd=" + my_pwd + "\n";
//	alert(msg);
	
	for (var i=0;i<CREATE_VOLUME_INFO.length;i++)
	{
		if( parseInt(CREATE_VOLUME_INFO[i][0]) == my_vol)
		{
			CREATE_VOLUME_INFO[i][12] = my_encryption;
			CREATE_VOLUME_INFO[i][13] = my_auto_mount;
			CREATE_VOLUME_INFO[i][14] = my_pwd;
			break;
		}
	}
}

function INTERNAL_FMT_VE_Check_Info(pwd,confirm_pwd)
{
	var flag = 1;
	
	if ( pwd == "")
	{
		jAlert( _T('_format','msg9'), "warning");	//Text:Please enter a password.
		flag = 0;
	}
	else if ( confirm_pwd == "" )
	{
		jAlert( _T('_format','msg10'), "warning");	//Text:Please enter a confirm password.
		flag = 0;
	}
	else if (pwd.length < 4)
	{
		jAlert( _T('_format','msg14'), "warning");	//Text:Password must be at least 4 characters in length. Please try again.
		flag = 0;
	}	
	else if (pwd.length > 32)
	{
		jAlert( _T('_format','msg11'), "warning");	//Text:The password length cannot exceed 32 characters. Please try again.
		flag = 0;
	}
	else if ( pwd != confirm_pwd)
	{
		jAlert( _T('_format','msg12'), "warning");	//Text:The new password and confirmation password does not match. Please try again.
		flag = 0;
	}
	else if(name_check(pwd) == 1 || pwd.indexOf(" ") != -1)				
	{
		jAlert( _T('_format','msg13'), "warning");	//Text:The new password must not include the following characters:  @ : / \ % '
		flag = 0;
	}	
		
	return flag;
}

function INTERNAL_FMT_Summary_List()
{
	var html_tr = "";
	var j=0;
	
	for (var i=0;i<CREATE_VOLUME_INFO.length;i++)
	{
 		if ( parseInt(CREATE_VOLUME_INFO[i][7]) == 1)
 		{
 			if ((j%2)==0)
 				html_tr += "<tr id=\"row"+j+"\">";
 			else
 				html_tr += "<tr id=\"row"+j+"\" class=\"erow\">";
 			
 			if ( FUN_VOLUME_ENCRYPTION == 1 )
 			{
	 			//Volume Encryption icon
				html_tr += '<td><div style=\"text-align: left; width: 28px;\"><div class="list_icon">';
	 			//if (( CREATE_VOLUME_INFO[i][12].toString() == "1") && (CREATE_VOLUME_INFO[i][13].toString() == "1") )
	 			if (( CREATE_VOLUME_INFO[i][12].toString() == "1"))
	 				html_tr += String.format('<div class="ve_enable TooltipIcon" title="{0}"></div>', _T('_raid','desc74'));	//Text:Encryption enabled.
				else
					html_tr += String.format('<div class="ve_disable TooltipIcon" title="{0}"></div>', _T('_raid','desc75'));
				html_tr += '</div></div></td>';
			
	 			//Volume Encryption / Auto-mount icon
				html_tr += '<td><div style=\"text-align: left; width: 28px;\"><div class="list_icon">';
	 			if (( CREATE_VOLUME_INFO[i][12].toString() == "1") && (CREATE_VOLUME_INFO[i][13].toString() == "1") )
	 				html_tr += String.format('<div class="ve_automount_enable TooltipIcon" title="{0}"></div>', _T('_raid','desc76'));
				else
					html_tr += String.format('<div class="ve_automount_disable TooltipIcon" title="{0}"></div>', _T('_raid','desc77'));
				html_tr += '</div></div></td>';
			}
			
			var my_volume_name = CREATE_VOLUME_INFO[i][0].toString().replace(/1/g,"Volume_1").replace(/2/g,"Volume_2").replace(/3/g,"Volume_3").replace(/4/g,"Volume_4");
			var my_raidlevel = INTERNAL_RaidLeve_HTML(CREATE_VOLUME_INFO[i][1].toString());	
			var my_file_system = INTERNAL_File_System_HTML(CREATE_VOLUME_INFO[i][2].toString());	
 			html_tr += "<td><div style=\"text-align: left; width: 90px;\">" + my_volume_name + "</div></td>";	
 			
 			if ( (CREATE_VOLUME_INFO[i][1].toString() == "raid5") && (CREATE_VOLUME_INFO[i][5].toString() != "none"))
 				html_tr += "<td><div style=\"text-align: left; width: 164px;\"> " + my_raidlevel +"+"+ _T("_format","spare") + "</div></td>";
 			else
 				html_tr += "<td><div style=\"text-align: left; width: 164px;\">" + my_raidlevel + "</div></td>";
				
 			html_tr += "<td><div style=\"text-align: left; width: 72px;\">" + my_file_system + "</div></td>";
 			html_tr += "<td><div style=\"text-align: left; width: 80px;\">" + CREATE_VOLUME_INFO[i][8] + " GB</div></td>";
 			
 			if (CREATE_VOLUME_INFO[i][5].toString() != "none")
 			{	
 				var my_dev = CREATE_VOLUME_INFO[i][4].toString()+CREATE_VOLUME_INFO[i][5].toString();
 				html_tr += "<td><div style=\"text-align: left; width: 150px;\">" + INTERNAL_FMT_Convert_Device_Name(1,my_dev)+"</div></td>";
 			}
 			else
 				html_tr += "<td><div style=\"text-align: left; width: 150px;\">" + INTERNAL_FMT_Convert_Device_Name(1,CREATE_VOLUME_INFO[i][4]) + "</div></td>";
 			html_tr  += "</tr>";
 			j++;
 		}
 	}
 	return html_tr;	
}

function INTERNAL_FMT_Linear_Size(flag,vol_size)
{
	/*
		flag: 0 -> linear for 1st raid 
			  1 -> linear for 2nd raid 
	*/
	
	if (CREATE_VOLUME_INFO.length == 4) //raid1+raid1+jbod+jbod
	{
		if (parseInt(flag) == 0)
		{
			for(var i=0;i<CREATE_VOLUME_INFO.length;i++)
			{
				if (CREATE_VOLUME_INFO[i][1] == "linear")
				{
					CREATE_VOLUME_INFO[i][8] = vol_size;
					break;
				}
			}
		}
		else
		{
			var j = 0;
			for(var i=0;i<CREATE_VOLUME_INFO.length;i++)
			{
				if (CREATE_VOLUME_INFO[i][1] == "linear" )
				{
					if (j == 1)
					{
						CREATE_VOLUME_INFO[i][8] = vol_size;
						break;
					}	
					
					j++;
				}
			}
		}	
	}
	else
	{
		for(var i=0;i<CREATE_VOLUME_INFO.length;i++)
		{
			if (CREATE_VOLUME_INFO[i][1] == "linear")
			{
				CREATE_VOLUME_INFO[i][8] = vol_size;
				break;
			}
		}
	}	
}

function INTERNAL_FMT_Create_RAID_Size_Init()
{	
	var my_desc1 = "",my_desc3="",my_desc4="";
	var my_volume_info_len = CREATE_VOLUME_INFO.length;
	var tmp = "",my_html="";
	var hd_info = new Array();
	hd_info = FMT_HD_INFO;	
	
	//raid0,raid1,raid5,raid10
	switch(CREATE_VOLUME_INFO[0][1].toString())
	{
		case "raid0":
		case "raid10":
		
			if (parseInt(CREATE_VOLUME_INFO[1][8],10) != 0) $("#storage_raidFormat1stSpanning4_chkbox").prop('checked',true);
			
		break;
		
		case "raid1":
		case "raid5":
			$("#storage_raidFormat1stSpanning4_chkbox").prop('checked',false);
		break;
	}
	tmp = "Volume_{0} ({1})";
	my_html = String.format(tmp,
	/*0*/	CREATE_VOLUME_INFO[0][0],
	/*1*/	INTERNAL_FMT_Convert_Device_Name(1,CREATE_VOLUME_INFO[0][4]));
	$("#slider_desc_volume1").html(my_html);
	
	if (CREATE_VOLUME_INFO.length > 1)
	{
		tmp = _T('_format','raid_description10')+" : {0} GB";	//Text:Remaining space : xx GB
		switch(CREATE_VOLUME_INFO[1][1].toString())
		{
			case "raid1":
				my_html = String.format(tmp,
				/* 0 */	CREATE_VOLUME_INFO[2][3]);				
				$("#Get_RemainSize").html(my_html);
				
				if ( parseInt(CREATE_VOLUME_INFO[2][3].toString()) == 0)	$("#tr_1st_create_jbod").hide();//$("#storage_raidFormat1stSpanning4_chkbox").attr("disabled","disabled");
			break;
						
			default:
					if ( parseInt(CREATE_VOLUME_INFO[1][3].toString()) == 0) $("#tr_1st_create_jbod").hide(); //$("#storage_raidFormat1stSpanning4_chkbox").attr("disabled","disabled");
			
					my_html = String.format(tmp,
					/* 0 */	CREATE_VOLUME_INFO[1][3]);		
					$("#Get_RemainSize").html(my_html);
			break;
		}//end switch
	}
	
	/* Slider function init. */	
	var my_slider_value = parseInt(CREATE_VOLUME_INFO[0][3].toString(),10);
	var my_slider_max_value = parseInt(CREATE_VOLUME_INFO[0][3].toString(),10);
	//var my_slider_min_value = (CREATE_VOLUME_INFO[0][1] == "raid1")?1:parseInt((CREATE_VOLUME_INFO[0][4].length) / 3, 10);
	
	var my_slider_min_value = 10;
	$("#slider_volume1").slider({
			range: "min",
			value: my_slider_value,
			min: my_slider_min_value,
			max: my_slider_max_value,
			slide: function(event, ui) {
				
				var my_raid_size_by_custom = (CREATE_VOLUME_INFO[0][1] == "raid6")?parseInt(ui.value, 10) * 2:ui.value;
				CREATE_VOLUME_INFO[0][8] = ui.value;	//Update RAID Volume(R0 ,R1, R5, R10) 
				var tmp = "{0} GB";
				var my_html = String.format(tmp,
				/* 0 */	my_raid_size_by_custom);
				$("#amount_right").html(my_html);
				var linear_volume_size = INTERNAL_FMT_HD_Resize(0,1,ui.value);
				var my_desc = _T('_format','raid_description10') + " : "+ linear_volume_size +" GB";	//Text:Remaining space : xx GB
				$("#Get_RemainSize").html(my_desc);
				
				//Checkbox	
				(parseInt(linear_volume_size) != 0)?$("#tr_1st_create_jbod").show():$("#tr_1st_create_jbod").hide();
				
				//Update Linear Volume(R0 ,R1, R5, R10)
				INTERNAL_FMT_Linear_Size(0,linear_volume_size);
	}});
	tmp = "{0} GB";
	my_html = String.format(tmp,
	/* 0 */	(CREATE_VOLUME_INFO[0][1] == "raid6")?(parseInt(my_slider_max_value, 10) * 2):my_slider_max_value);
	$("#amount_right").html(my_html);
	
	if ( ($('input[name=storage_raidFormatType_chkbox]:checked').val() == 1) &&
		 (CREATE_VOLUME_INFO[0][1].toString() == "raid5") && 
		 (hd_info.length == 4))
	{
		$("#tr_spare_dsk").show();
	}		
	else
		$("#tr_spare_dsk").hide();	
		
	if (CREATE_VOLUME_INFO.length == 4) 
	{	
		$("#storage_raidFormat2ndSpanning5_chkbox").attr('checked',false);
		
		if (CREATE_VOLUME_INFO[3][1].toString() == "linear")
		{
			my_desc3 = _T('_format','raid_description10') + " : "+ CREATE_VOLUME_INFO[3][3] +" GB";	//Text:Remaining space : xx GB
			$("#Get_RemainSize_volume2").html(my_desc3);
			
			if ( parseInt(CREATE_VOLUME_INFO[3][3].toString()) == 0)	$("#tr_2nd_create_jbod").hide(); //$("#storage_raidFormat2ndSpanning5_chkbox").attr("disabled","disabled");
		}
		
		my_desc4 = "Volume_" + CREATE_VOLUME_INFO[1][0] + " (" + INTERNAL_FMT_Convert_Device_Name(1,CREATE_VOLUME_INFO[1][4]) + ")";
		$("#slider_desc_volume2").html(my_desc4);
		
		/* Slider function init. */
		/*
		var my_raid1_slider_max = $("#slider_volume2").slider( "option", "max");
		if ( my_raid1_slider_max != undefined) $("#slider_volume2").slider("destroy");
		*/
		var my_raid1_slider_value = parseInt(CREATE_VOLUME_INFO[1][3].toString(),10);
		var my_raid1_slider_max_value = parseInt(CREATE_VOLUME_INFO[1][3].toString(),10);
		//var my_slider_min_value = (CREATE_VOLUME_INFO[0][1] == "raid1")?1:parseInt((CREATE_VOLUME_INFO[1][4].length) / 3,10);		
		var my_slider_min_value = 10;
		$("#Volume2_Sel_RaidLevel").html(_T('_format','raid_description1'));	//Text:Enter the desired capacity of Raid 1 volume
		$("#slider_volume2").slider({
			range: "min",
			value: my_raid1_slider_value,
			min: my_slider_min_value,
			max: my_raid1_slider_max_value,
			slide: function(event, ui) {
				CREATE_VOLUME_INFO[1][8] = ui.value;	
				$("#amount_right_volume2").html(ui.value+" GB");
				var linear_volume_size = INTERNAL_FMT_HD_Resize(0,2,ui.value);
				var my_desc = _T('_format','raid_description10') + " : "+ linear_volume_size +" GB";	//Text:Remaining space : xx GB
				
				$("#Get_RemainSize_volume2").html(my_desc);
				
				//Checkbox	
				(parseInt(linear_volume_size) != 0)?$("#tr_2nd_create_jbod").show():$("#tr_2nd_create_jbod").hide();
				
				//Update Linear Volume(R0 ,R1, R5, R10)
				INTERNAL_FMT_Linear_Size(1,linear_volume_size);
				
		}});//enf of slider
		
		my_amount_right = my_raid1_slider_max_value +" GB";
		$("#amount_right_volume2").html(my_amount_right);
	} 
	
}

function INTERNAL_FMT_Spare_Dsk_Resize()
{	
	var hd_info = new Array();
	hd_info = FMT_HD_INFO;	
	
	var dev_1 = (parseInt(hd_info[0][6]) - HD_BLOCKS_KEEP);
	var dev_2 = (parseInt(hd_info[1][6]) - HD_BLOCKS_KEEP);
	var dev_3 = (parseInt(hd_info[2][6]) - HD_BLOCKS_KEEP);
	var dev_4 = (parseInt(hd_info[3][6]) - HD_BLOCKS_KEEP);
	var volume_size = new Array();
	var raid5_volume_size = Math.min(parseInt(dev_1),parseInt(dev_2),parseInt(dev_3),parseInt(dev_4));
	var linear_volume_size = 0,raid5_volume_size_tmp = 0;
	
	var my_spare_dsk =  $("input[name='storage_raidFormatSpareDsk4_chkbox']:checked").val();
	if ( my_spare_dsk == "1" )	//Spare Disk
	{	
		CREATE_VOLUME_INFO[0][4] = hd_info[0][0] + hd_info[1][0] + hd_info[2][0];
		CREATE_VOLUME_INFO[1][4] = hd_info[0][0] + hd_info[1][0] + hd_info[2][0];
		CREATE_VOLUME_INFO[0][5] = hd_info[3][0];
		
		raid5_volume_size_tmp = parseInt(raid5_volume_size) * 3;
		raid5_volume_size = parseInt(raid5_volume_size) * 2;
		linear_volume_size = parseInt(dev_1) + parseInt(dev_2) + parseInt(dev_3);
	}		
	else	//Don't need to Spare Disk
	{
		CREATE_VOLUME_INFO[0][4] = hd_info[0][0] + hd_info[1][0] + hd_info[2][0] + hd_info[3][0];
		CREATE_VOLUME_INFO[1][4] = hd_info[0][0] + hd_info[1][0] + hd_info[2][0] + hd_info[3][0];
		CREATE_VOLUME_INFO[0][5] = "none";
		
		raid5_volume_size_tmp = parseInt(raid5_volume_size) * 4;
		raid5_volume_size = parseInt(raid5_volume_size) * 3;
		linear_volume_size =  parseInt(dev_1) + parseInt(dev_2) + parseInt(dev_3) + parseInt(dev_4);
	}
	
	CREATE_VOLUME_INFO[0][3] = raid5_volume_size;	
	CREATE_VOLUME_INFO[0][8] = raid5_volume_size;	 
	
	if ( (parseInt(hd_info[0][5]) != parseInt(hd_info[1][5])) ||  
		 (parseInt(hd_info[0][5]) != parseInt(hd_info[2][5])) || 
		 (parseInt(hd_info[0][5]) != parseInt(hd_info[3][5])) )
	{
		linear_volume_size = parseInt(linear_volume_size) - parseInt(raid5_volume_size_tmp);
		CREATE_VOLUME_INFO[1][3] = linear_volume_size;	
	}
	else
		CREATE_VOLUME_INFO[1][3] = 0;	
	
	INTERNAL_FMT_Create_RAID_Size_Init();
}

function INTERNAL_FMT_diskmgr_create(my_volume_info,auto_sync)
{	
	wd_ajax({
	type:"POST",
	url: "/cgi-bin/hd_config.cgi",
	data:{cmd:'cgi_FMT_Create_DiskMGR',
		f_create_type:'0',
		f_create_volume_info:my_volume_info.toString(),
		f_auto_sync:auto_sync},
	dataType: "xml",
	success: function(xml) {	  	  	
	    var res = $(xml).find("res").text(); 
	    
	    if (parseInt(res, 10) == 1)
	    {
	    	for (var idx=0; idx < my_volume_info.length; idx++)
	    	{
	    		if ( parseInt(my_volume_info[idx][7],10) == 1)
	    		{
	    			 google_analytics_log('RAID_Auto_Rebuild', auto_sync);
	    			 //google_analytics_log(my_volume_info[idx][1].toString(),'1');
	    			 google_analytics_log('Volume_Encryption', my_volume_info[idx][12].toString());
	    		}
	    	}
	    	
				if (intervalId != 0) clearInterval(intervalId);
				intervalId = setInterval(function(){
					INTERNAL_FMT_Create_Partitioning('formatdsk');
				} ,3000);
	    }                                        
	 }
	});	//end of ajax        	
}

function INTERNAL_FMT_Create_Partitioning(id_name)
{		
		/* ajax and xml parser start*/
		wd_ajax({
			url:FILE_DM_READ_STATE,
			type:"GET",
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml){
						 
						 var my_flag = $(xml).find("dm_state>describe").text();
						 var my_finished = $(xml).find("dm_state>finished").text();
						 var my_error = $(xml).find("dm_state>errcode").text();
						 
						 if ( parseInt(my_flag) != 1 && parseInt(my_flag) != 2 )
						 {
						 	if (intervalId != 0) clearInterval(intervalId);
							
							switch(id_name)
							{
								case "formatdsk":
									$("#dskDiag_partitioning_wait").hide();
			    					$("#dskDiag_bar").show();
			    
									INTERNAL_FMT_ProgressBar_INIT(0,"formatdsk");
									intervalId = setInterval("INTERNAL_FMT_Show_Bar('formatdsk')",3000);
								break;
								
								case "reformat":
									$("#Reformat_Dsk_Diag_Partitioning_Wait").hide();
								    $("#Reformat_Dsk_Diag_Bar").show();
								    
									INTERNAL_FMT_ProgressBar_INIT(0,"reformat");
									intervalId = setInterval("INTERNAL_FMT_Show_Bar('reformat')",3000);
								break;
								
								case "rebuild":
									$("#Rebuild_Dsk_Diag_Bar").show();
									$("#Rebuild_Dsk_Diag_Partitioning_Wait").hide();
									
									INTERNAL_FMT_ProgressBar_INIT(0,"rebuild");
									intervalId = setInterval("INTERNAL_FMT_Show_Bar('rebuild')",3000);
								break;
							}
							
						 }
						 else if ((id_name == "reformat_std2r1") ||		// no jbod,only raid1/raid5/raid10
						 		  (id_name == "reformat_std2r5") || 
						 		  (id_name == "reformat_r12r5_1st"))	
						 {
							 if ( parseInt(my_finished) == 1 || parseInt(my_error) != 1)
							 {
							 			if (intervalId != 0) clearInterval(intervalId);
										restart_web_timeout();
							 			
							 			switch(id_name)
									 {
										 case "reformat_std2r1":
											 	RAID_FormatResInfo("reformat_std2r1", "Reformat_Dsk_Diag_Std2R1_Partitioning", "Reformat_Dsk_Diag_Res", my_error);
										 break;
										 
										 case "reformat_std2r5":
							  				RAID_FormatResInfo("migrate_resize_sync", "Reformat_Dsk_Diag_Std2R5_Partitioning", "Reformat_Dsk_Diag_Res", my_error);
										 break;
										 
										 case "reformat_r12r5_1st":
							  				RAID_FormatResInfo("migrate_resize_sync", "Reformat_Dsk_Diag_R12R5_Partitioning", "Reformat_Dsk_Diag_Res", my_error);
										 break;
									}	 		
							 	
							 }
							 
						}
			}//end of success: function(xml){
				
		}); //end of wd_ajax({	
		
}
function INTERNAL_RaidExtend_diskmgr(my_volume_info)
{	
	var newly_dev = "";
	$('unused_volume_info>item', UNUSED_VOLUME_INFO).each(function(e){
		
		if ( $('partition',this).text().length == 3) 
		{
			newly_dev = $('partition',this).text();
		}
	});	//end of each
	
	wd_ajax({
		type:"POST",
		url: "/cgi-bin/hd_config.cgi",
		data:{cmd:'cgi_FMT_Extend_DiskMGR',
			f_expan_volume_info:my_volume_info,
			f_expan_dev:newly_dev},
		dataType: "xml",
		success: function(xml) {
			 	   
			       jLoadingClose();       
			       
			     if (intervalId != 0) clearInterval(intervalId);
				   if (RAID_VolList_timeoutId != 0 ) clearTimeout(RAID_VolList_timeoutId);
					
				   $("#vol_list").flexReload();
					
				   INTERNAL_DIADLOG_DIV_HIDE('formatdsk_Diag');
				   INTERNAL_DIADLOG_BUT_UNBIND('formatdsk_Diag');
				
				   $("#formatdsk_Diag").overlay().close(); 
				   
				   if (parseInt($(xml).find('res').text(),10) != 0)
			       {
			       		for(var idx=0;idx<FMT_RAIDEXPAN_VOLUME_INFO.length;idx++)
						{
							if (parseInt(FMT_RAIDEXPAN_VOLUME_INFO[idx][7],10) == 1)
							{
								var my_volume_name = FMT_RAIDEXPAN_VOLUME_INFO[idx][0].toString().replace(/1/g,"Volume_1").replace(/2/g,"Volume_2").replace(/3/g,"Volume_3").replace(/4/g,"Volume_4");
							}	
						}
						
			       		var msg = _T('_raid','msg10').replace(/xxx/,my_volume_name).replace(/yyy/, $(xml).find('res').text());	
			       		jAlert( msg, "warning");	//Text:Hard Drive(s) Formatting Failure(Error Code:xxx).
			       }              
		 }
	});	//end of ajax        	
}
function INTERNAL_RaidExpan_newlydev_isroaming(str)
{
	var val = 1;
	var msg = "";
	$('item', USED_VOLUME_INFO).each(function(e){
		
		var my_dev = $('device',this).text();
		if ( (my_dev.indexOf(str) != -1) && 
			 (parseInt($('is_roaming_volume',this).text(),10) == 1))
		{
				val = 0;
				return false;
		}
		
	});	//end of each
	
	return val;
}
function INTERNAL_RaidExpan_diskmgr(my_volume_info)
{	
	wd_ajax({
		type:"POST",
		url: "/cgi-bin/hd_config.cgi",
		data:{cmd:'cgi_FMT_Expan_DiskMGR',
			f_expan_volume_info:my_volume_info},
		dataType: "xml",
		success: function(xml) {	
			 	   
			       jLoadingClose();       
			       
			     if (intervalId != 0) clearInterval(intervalId);
				   if (RAID_VolList_timeoutId != 0 ) clearTimeout(RAID_VolList_timeoutId);
					
				   $("#vol_list").flexReload();
					
				   INTERNAL_DIADLOG_DIV_HIDE('formatdsk_Diag');
				   INTERNAL_DIADLOG_BUT_UNBIND('formatdsk_Diag');
				
				   $("#formatdsk_Diag").overlay().close(); 
				   
				   if (parseInt($(xml).find('res').text(),10) != 0)
			       {
			       		for(var idx=0;idx<FMT_RAIDEXPAN_VOLUME_INFO.length;idx++)
						{
							if (parseInt(FMT_RAIDEXPAN_VOLUME_INFO[idx][7],10) == 1)
							{
								var my_volume_name = FMT_RAIDEXPAN_VOLUME_INFO[idx][0].toString().replace(/1/g,"Volume_1").replace(/2/g,"Volume_2").replace(/3/g,"Volume_3").replace(/4/g,"Volume_4");
							}	
						}
						
			       		var msg = _T('_raid','msg10').replace(/xxx/,my_volume_name).replace(/yyy/, $(xml).find('res').text());	
			       		jAlert( msg, "warning");	//Text:Hard Drive(s) Formatting Failure(Error Code:xxx).
			       }              
		 }
	});	//end of ajax        	
}
function INTERNAL_RaidExpan_Summary_List()
{
	var html_tr = "";
	
	for(var idx=0;idx<FMT_RAIDEXPAN_VOLUME_INFO.length;idx++)
	{
		if (parseInt(FMT_RAIDEXPAN_VOLUME_INFO[idx][7],10) == 1)
		{
			if ((idx%2)==0)
 				html_tr += "<tr id=\"row"+idx+"\">";
 			else
 				html_tr += "<tr id=\"row"+idx+"\" class=\"erow\">";
 				
 			var my_volume_name = FMT_RAIDEXPAN_VOLUME_INFO[idx][0].toString().replace(/1/g,"Volume_1").replace(/2/g,"Volume_2").replace(/3/g,"Volume_3").replace(/4/g,"Volume_4");
			var my_raidlevel = INTERNAL_RaidLeve_HTML(FMT_RAIDEXPAN_VOLUME_INFO[idx][1].toString());	
			var my_file_system = INTERNAL_File_System_HTML(FMT_RAIDEXPAN_VOLUME_INFO[idx][10].toString());
 			
 			html_tr += "<td><div style=\"text-align: left; width: 90px;\">&nbsp;&nbsp;" + my_volume_name + "</div></td>";	
 			html_tr += "<td><div style=\"text-align: left; width: 164px;\">" + my_raidlevel + "</div></td>";
 			html_tr += "<td><div style=\"text-align: left; width: 72px;\">" + my_file_system + "</div></td>";
 			html_tr += "<td><div style=\"text-align: left; width: 80px;\">" + FMT_RAIDEXPAN_VOLUME_INFO[idx][9] + " GB</div></td>";
 			html_tr += "<td><div style=\"text-align: left; width: 200px;\">" + INTERNAL_FMT_Convert_Device_Name(1,FMT_RAIDEXPAN_VOLUME_INFO[idx][3]) + "</div></td>";	
			html_tr += "</tr>"
			
			break;
		}
	}
	
	return html_tr;
}
function INTERNAL_RaidExpan_HDSize(dev)
{
	var dev_size = 0;
	
	if (FMT_HD_INFO.length == 0) FMT_HD_INFO = INTERNAL_Get_HD_Info();
	
	for(var i=0;i<FMT_HD_INFO.length;i++)
	{
		if (FMT_HD_INFO[i][0] == dev)
		{
			dev_size = FMT_HD_INFO[i][6];
			break;
		}
	}
	
	return dev_size;
}
function INTERNAL_RaidExpan_HDSize_Block(dev)
{
	var dev_size = 0;
	
	if (FMT_HD_INFO.length == 0) FMT_HD_INFO = INTERNAL_Get_HD_Info();
	
	for(var i=0;i<FMT_HD_INFO.length;i++)
	{
		if (FMT_HD_INFO[i][0] == dev)
		{
			dev_size = FMT_HD_INFO[i][5];
			break;
		}
	}
	
	return dev_size;
}
function INTERNAL_RaidExpan_RAIDSize(dev)//dev: device name, ex:sdasdb, sdasdbsdc
{
	var dev_lst = INTERNAL_FMT_Convert_Device_Name(0,dev).split(",");	//sdasdb -> sda,sdb
	var hd_info = new Array();
	var raid_size = 0;
	
	for(var idx=0;idx<dev_lst.length;idx++)
	{
		hd_info[idx] = new Array();
		hd_info[idx][0] = dev_lst[idx];
		hd_info[idx][1] = INTERNAL_RaidExpan_HDSize(dev_lst[0]);
	}
	
	switch(dev_lst.length)
	{
		case 2:	//RAID 1
			var dev_1 = parseInt(hd_info[0][1],10) - HD_BLOCKS_KEEP;
			var dev_2 = parseInt(hd_info[1][1],10) - HD_BLOCKS_KEEP;
			
			raid_size = Math.min(dev_1, dev_2);
		break;
		
		case 3://RAID 5
			var dev_1 = parseInt(hd_info[0][1],10) - HD_BLOCKS_KEEP;
			var dev_2 = parseInt(hd_info[1][1],10) - HD_BLOCKS_KEEP;
			var dev_3 = parseInt(hd_info[2][1],10) - HD_BLOCKS_KEEP;
			
			raid_size = (Math.min(dev_1, dev_2, dev_3) * 2);
		break;
		
		case 4: //RAID 5
			var dev_1 = parseInt(hd_info[0][1],10) - HD_BLOCKS_KEEP;
			var dev_2 = parseInt(hd_info[1][1],10) - HD_BLOCKS_KEEP;
			var dev_3 = parseInt(hd_info[2][1],10) - HD_BLOCKS_KEEP;
			var dev_4 = parseInt(hd_info[3][1],10) - HD_BLOCKS_KEEP;
			
			raid_size = (Math.min(dev_1, dev_2, dev_3, dev_4) * 3);
		break;
	}
	
	return raid_size;
}
function INTERNAL_RaidExpan_SpanningSize(dev)
{
	var dev_lst = INTERNAL_FMT_Convert_Device_Name(0,dev).split(",");	//sdasdb -> sda,sdb
	var hd_info = new Array();
	var raid_size = 0;
	
	for(var idx=0;idx<dev_lst.length;idx++)
	{
		hd_info[idx] = new Array();
		hd_info[idx][0] = dev_lst[idx];
		hd_info[idx][1] = INTERNAL_RaidExpan_HDSize(dev_lst[idx]);
	}
	
	switch(dev_lst.length)
	{
		case 2:	//RAID 1
			var dev_1 = parseInt(hd_info[0][1],10) - HD_BLOCKS_KEEP;
			var dev_2 = parseInt(hd_info[1][1],10) - HD_BLOCKS_KEEP;
			
			raid_size = dev_1 + dev_2;
		break;
		
		case 3://RAID 5
			var dev_1 = parseInt(hd_info[0][1],10) - HD_BLOCKS_KEEP;
			var dev_2 = parseInt(hd_info[1][1],10) - HD_BLOCKS_KEEP;
			var dev_3 = parseInt(hd_info[2][1],10) - HD_BLOCKS_KEEP;
			
			raid_size = dev_1 + dev_2 + dev_3;
		break;
		
		case 4: //RAID 5
			var dev_1 = parseInt(hd_info[0][1],10) - HD_BLOCKS_KEEP;
			var dev_2 = parseInt(hd_info[1][1],10) - HD_BLOCKS_KEEP;
			var dev_3 = parseInt(hd_info[2][1],10) - HD_BLOCKS_KEEP;
			var dev_4 = parseInt(hd_info[3][1],10) - HD_BLOCKS_KEEP;
			
			raid_size = raid_size = dev_1 + dev_2 + dev_3 + dev_4;
		break;
	}
	
	return raid_size;
}
function INTERNAL_RaidExpan_ReplaceHD(str)
{
	/*
			str: 1-> replace HD; 0 -> no replace HD;
	*/
	var btn_flag = 1,flag = 0;;
	
	for(var i=0;i<FMT_RAIDEXPAN_VOLUME_INFO.length;i++)
	{
		if ( parseInt(FMT_RAIDEXPAN_VOLUME_INFO[i][7],10) == 1)
		{
			var my_dev = INTERNAL_FMT_Convert_Device_Name(0,FMT_RAIDEXPAN_VOLUME_INFO[i][3]).split(",");
			var my_dev_size=0, req_mini_size=0, reserve_size=2*1024*1024*1024;
			for(var idx=0; idx<my_dev.length; idx++)
			{
				 my_dev_size = parseInt(INTERNAL_RaidExpan_HDSize_Block(my_dev[idx]),10)*1024;
				 req_mini_size = parseInt(FMT_RAIDEXPAN_VOLUME_INFO[i][12],10) + reserve_size;
				 
				 //if (INTERNAL_FMT_RaidExpan_Minimal_Required_Size_Check(1,my_dev_size) == 0)	
				 if(parseInt(req_mini_size,10) >= parseInt(my_dev_size,10))	
				 {
				 	  btn_flag = 0;
				 		break;
				 }	
			}
			
			if (parseInt(str,10) == 1)//Replace HD
			{ 
				FMT_RAIDEXPAN_VOLUME_INFO[i][6] = str;
			}
			else	// no replace HD
			{
				if (btn_flag == 1)	FMT_RAIDEXPAN_VOLUME_INFO[i][6] = str;
			}	
			break;
		}
	}
		
		if ( str == "1")	//Replace HD
		{
			if(!$("#storage_raidFormatExpandReplacehdYes_button").hasClass('buttonSel'))	$("#storage_raidFormatExpandReplacehdYes_button").addClass('buttonSel');
		
				if (btn_flag == 1)
				{
						if($("#storage_raidFormatExpandReplacehdNo_button").hasClass('gray_out')) $("#storage_raidFormatExpandReplacehdNo_button").removeClass('gray_out');
						if($("#storage_raidFormatExpandReplacehdNo_button").hasClass('buttonSel'))	$("#storage_raidFormatExpandReplacehdNo_button").removeClass('buttonSel');
				}		
				else
				{
						if(!$("#storage_raidFormatExpandReplacehdNo_button").hasClass('gray_out')) $("#storage_raidFormatExpandReplacehdNo_button").addClass('gray_out');
						if($("#storage_raidFormatExpandReplacehdNo_button").hasClass('buttonSel'))	$("#storage_raidFormatExpandReplacehdNo_button").removeClass('buttonSel');
				}			

		}
		else	//No Replace HD
		{
			if (btn_flag == 1)
			{
					if($("#storage_raidFormatExpandReplacehdYes_button").hasClass('buttonSel'))	$("#storage_raidFormatExpandReplacehdYes_button").removeClass('buttonSel');
//					if($("#storage_raidFormatExpandReplacehdNo_button").hasClass('gray_out')) $("#storage_raidFormatExpandReplacehdNo_button").removeClass('gray_out');
//					if(!$("#storage_raidFormatExpandReplacehdNo_button").hasClass('buttonSel'))	$("#storage_raidFormatExpandReplacehdNo_button").addClass('buttonSel');
					
					if( ($("#storage_raidFormatExpandReplacehdNo_button").hasClass('gray_out')) && (!$("#storage_raidFormatExpandReplacehdNo_button").hasClass('buttonSel')))  flag = 1;
					else if ($("#storage_raidFormatExpandReplacehdNo_button").hasClass('gray_out'))	flag = 2;
					else if (!$("#storage_raidFormatExpandReplacehdNo_button").hasClass('buttonSel')) flag = 3;
						
					switch(flag)
					{
						case 1:
							$("#storage_raidFormatExpandReplacehdNo_button").removeClass('gray_out').addClass('buttonSel');
						break;
						
						case 2:
							$("#storage_raidFormatExpandReplacehdNo_button").removeClass('gray_out');
						break;
						
						case 3:
							$("#storage_raidFormatExpandReplacehdNo_button").addClass('buttonSel');
						break;
					}	

			}		
			else
			{
					if(!$("#storage_raidFormatExpandReplacehdYes_button").hasClass('buttonSel'))	$("#storage_raidFormatExpandReplacehdYes_button").addClass('buttonSel');
					if(!$("#storage_raidFormatExpandReplacehdNo_button").hasClass('gray_out')) $("#storage_raidFormatExpandReplacehdNo_button").addClass('gray_out');
					if($("#storage_raidFormatExpandReplacehdNo_button").hasClass('buttonSel'))	$("#storage_raidFormatExpandReplacehdNo_button").removeClass('buttonSel');
			}	
		}
}
function INTERNAL_RaidExpan_2R1_Vol_Set(idx)
{
	$("#RAIDExpansion_2R1_List input[type=checkbox]").prop('checked',false);
	$("#RAIDExpansion_2R1_List input[type=checkbox]:eq("+parseInt(idx,10)+")").prop('checked',true);
	
	for(var i=0;i<FMT_RAIDEXPAN_VOLUME_INFO.length;i++)
	{
			FMT_RAIDEXPAN_VOLUME_INFO[i][7] = (parseInt(idx, 10) == i)?1:0;
	}
}
function INTERNAL_RaidExpan_2R1_List()
{
	var html_tr = "";
				  
	for(var i=0;i<FMT_RAIDEXPAN_VOLUME_INFO.length;i++)
	{
		if ((i % 2) == 0)
				html_tr += "<tr id=\"row" + j + "\">";
		else
				html_tr += "<tr id=\"row" + j + "\" class=\"erow\">";
		
		html_tr += "<td><div style=\"text-align: left; width: 30px;\">";
		html_tr += "<input type=\"checkbox\" value=\"" + i + "\" name=\"f_expan_2r1_vol\" id=\"f_expan_2r1_vol\" onclick=\"INTERNAL_RaidExpan_2R1_Vol_Set('" + i + "');\"";
		html_tr += 	(parseInt(FMT_RAIDEXPAN_VOLUME_INFO[i][7],10) == 0)? " >":" checked >";
		html_tr += "</div></td>";
		
		var my_volume_name = FMT_RAIDEXPAN_VOLUME_INFO[i][0].toString().replace(/1/g, "Volume_1").replace(/2/g, "Volume_2").replace(/3/g, "Volume_3").replace(/4/g, "Volume_4");		
		html_tr += "<td><div style=\"text-align: left; width: 90px;\">" + my_volume_name + "</div></td>";
		html_tr += "<td><div style=\"text-align: left; width: 200px;\">" + INTERNAL_FMT_Convert_Device_Name(1, FMT_RAIDEXPAN_VOLUME_INFO[i][3]) + "</div></td>";		
		html_tr += "</tr>";		
	}
	
	return html_tr;
}
function INTERNAL_RaidExpan_init()
{
	FMT_RAIDEXPAN_VOLUME_INFO.length = 0;
	var idx = 0;
	var msg = "";
	
	$('item', USED_VOLUME_INFO).each(function(n){
		if (($('raid_mode',this).text() == "raid1") || ($('raid_mode',this).text() == "raid5"))
		{
			FMT_RAIDEXPAN_VOLUME_INFO[idx] =  new Array();
			FMT_RAIDEXPAN_VOLUME_INFO[idx][0] = $('volume',this).text();
			FMT_RAIDEXPAN_VOLUME_INFO[idx][1] = $('raid_mode',this).text();
			var my_raid_size = size2str((parseInt($('size',this).text(),10)*1024),"GB").split(" ");
			FMT_RAIDEXPAN_VOLUME_INFO[idx][2] = (Math.round(my_raid_size[0]));
			FMT_RAIDEXPAN_VOLUME_INFO[idx][3] = $('device',this).text();
			FMT_RAIDEXPAN_VOLUME_INFO[idx][4] = $('mount',this).text();
			var my_uuid_tmp = $('raid_uuid',this).text().split("=");
			var my_uuid = (my_uuid_tmp.length != 0)?my_uuid_tmp[1]:$('raid_uuid',this).text();
			FMT_RAIDEXPAN_VOLUME_INFO[idx][5] = my_uuid;
			FMT_RAIDEXPAN_VOLUME_INFO[idx][6] = 1;
			FMT_RAIDEXPAN_VOLUME_INFO[idx][7] = (parseInt(idx,10) == 0)?1:0;
			my_raid_size = INTERNAL_RaidExpan_RAIDSize($('device',this).text());
			FMT_RAIDEXPAN_VOLUME_INFO[idx][8] = my_raid_size;
			FMT_RAIDEXPAN_VOLUME_INFO[idx][9] = my_raid_size;
			FMT_RAIDEXPAN_VOLUME_INFO[idx][10] = $('file_type',this).text();
			FMT_RAIDEXPAN_VOLUME_INFO[idx][11] = INTERNAL_RaidExpan_SpanningSize($('device',this).text());
			var my_min_req_size = INTERNAL_FMT_RaidExpan_Minimal_Required_Size(my_uuid);			
			FMT_RAIDEXPAN_VOLUME_INFO[idx][12] = my_min_req_size;
			FMT_RAIDEXPAN_VOLUME_INFO[idx][13] = 0; //expand size is max
			idx++;
		}	
	});	//end of each

//	for(idx=0;idx<FMT_RAIDEXPAN_VOLUME_INFO.length;idx++)
//	{
//		msg += FMT_RAIDEXPAN_VOLUME_INFO[idx].toString() + "\n";
//	}
//	alert(msg);
}

function INTERNAL_FMT_RaidExpan_Check(str)
{
	/*
		val : 0 -> don't support raid expansion
			  1 -> support raid expansion
	*/
	var val = 1;
	var my_raid_mode ="";
	
	$('item', USED_VOLUME_INFO).each(function(e){
		
		my_raid_mode = $('raid_mode',this).text();
		if (my_raid_mode == "linear")
		{
			var my_dev = $('device',this).text();
			if (my_dev.indexOf(str) != -1)
			{
				val = 0;
				return false;
			}
		}
		
	});	//end of each
	
	return val;
}
function INTERNAL_FMT_RaidExpan_Minimal_Required_Size(my_uuid)
{
	var min_req_size = 0;
	
	wd_ajax({
		type:"POST",
		url: "/cgi-bin/hd_config.cgi",
		data:{cmd:'cgi_Expan_Minimal_Required_Size'},
		async: false,
		dataType: "xml",
		success: function(xml) {			
			
			$('item',xml).each(function(e){
						if ( $('uuid',this).text() == my_uuid)
						{
							min_req_size = $('min_req_size',this).text();
						}
			});	//end of each	
	 	}//success
	});	//end of ajax 
	
	return min_req_size;
}
function INTERNAL_FMT_RaidExpan_Minimal_Required_Size_Check(flag,str)
{
	/*
			flag: 0 -> extend; 1 -> expan;
	*/
	var val = 0;
//	var msg = "str = " + str +"\n";	
	wd_ajax({
		type:"POST",
		url: "/cgi-bin/hd_config.cgi",
		data:{cmd:'cgi_Expan_Minimal_Required_Size'},
		async: false,
		dataType: "xml",
		success: function(xml) {			
			var reserve_size = (flag == 0)?0:(2*1024*1024*1024);
			var min_req_size = parseInt($(xml).find("min_req_size").text(),10) + reserve_size;
//			msg += "min_req_size = " + min_req_size + "\n";
			val = (parseInt(str,10) >= parseInt(min_req_size,10))?1:0;			
//			msg += "val = " + val + "\n";			
//			alert(msg);
	 }
	});	//end of ajax 
	
	return val;
}
function INTERNAL_R12STD_diskmgr(my_volume_info)
{
	wd_ajax({
		type:"POST",
		url: "/cgi-bin/hd_config.cgi",
		data:{cmd:'cgi_FMT_R12STD_DiskMGR',
			f_r12std_volume_info:my_volume_info},
		dataType: "xml",
		success: function(xml) {	
			 	   
			     jLoadingClose();       
			       
			     if (intervalId != 0) clearInterval(intervalId);
				   if (RAID_VolList_timeoutId != 0 ) clearTimeout(RAID_VolList_timeoutId);
					
				   $("#vol_list").flexReload();
					
				   INTERNAL_DIADLOG_DIV_HIDE('formatdsk_Diag');
				   INTERNAL_DIADLOG_BUT_UNBIND('formatdsk_Diag');
				
				   $("#formatdsk_Diag").overlay().close(); 
				   
				   if (parseInt($(xml).find('res').text(),10) != 0)
			       {
			       		for(var idx=0;idx<FMT_R12STD_VOLUME_INFO.length;idx++)
						{
							if (parseInt(FMT_R12STD_VOLUME_INFO[idx][3],10) == 1)
							{
								var my_volume_name = FMT_R12STD_VOLUME_INFO[idx][0].toString().replace(/1/g,"Volume_1").replace(/2/g,"Volume_2").replace(/3/g,"Volume_3").replace(/4/g,"Volume_4");
							}	
						}
						
			       		var msg = _T('_raid','msg10').replace(/xxx/,my_volume_name).replace(/yyy/, $(xml).find('res').text());	
			       		jAlert( msg, "warning");	//Text:Hard Drive(s) Formatting Failure(Error Code:xxx).
			       }              
		 }
	});	//end of ajax 
}

function INTERNAL_R12STD_PrimaryHD_Set(idx, str)
{
	$("#R12STD_primaary_hd_list input[type=checkbox]").prop('checked',false);
	$("#R12STD_primaary_hd_list input[type=checkbox]:eq("+parseInt(idx,10)+")").prop('checked',true);
	
	for(var i=0;i<FMT_R12STD_VOLUME_INFO.length;i++)
	{
		if ( parseInt(FMT_R12STD_VOLUME_INFO[i][3],10) == 1)
		{
			var my_dev = str + FMT_R12STD_VOLUME_INFO[i][2].toString().replace(str,"");
			FMT_R12STD_VOLUME_INFO[i][2] = my_dev;
			FMT_R12STD_VOLUME_INFO[i][4] = str;			
			break;
		}
	}
}

function INTERNAL_R12STD_HD_Set(str)
{
	var html_tr = "";
	var idx = 0;
	
	for(var i=0;i<CURRENT_HD_INFO.length;i++)
	{
		if (str.indexOf(CURRENT_HD_INFO[i][0]) != -1)
		{
			if ((idx % 2) == 0)
				html_tr += "<tr id=\"row" + idx + "\">";
			else
				html_tr += "<tr id=\"row" + idx + "\" class=\"erow\">";
			
			html_tr += "<td><div style=\"text-align: center; width: 20px;\">";
			html_tr += "<input type=\"checkbox\" value=\"" + i + "\" name=\"f_r12std_primaary_hd\" id=\"f_r12std_primaary_hd\" onclick=\"INTERNAL_R12STD_PrimaryHD_Set('"+idx+"','" + CURRENT_HD_INFO[i][0] + "');\"";
			
			for(var idx=0; idx<FMT_R12STD_VOLUME_INFO.length;idx++)
			{
				if (FMT_R12STD_VOLUME_INFO[idx][4] == CURRENT_HD_INFO[i][0])
				{
					html_tr += " checked >";
					break;
				}
				else
				{
					html_tr += " >";	
					break;
				}
			}
			html_tr += "</div></td>";
			html_tr += "<td><div style=\"text-align: left; width: 25px; padding: 8px 0px 0px;\"><img src=\"/web/images/icon/IconsDiagnosticsDrive.png\" border=\"0\" width=\"30\"></div></td>";
			html_tr += "<td><div style=\"text-align: left; width: 250px;\">"+INTERNAL_FMT_Get_Device_Slot(CURRENT_HD_INFO[i][0])+"</div></td>";
			html_tr += "<td><div style=\"text-align: right; width: 100px;\">"+size2str(parseInt(CURRENT_HD_INFO[i][5],10)*1024)+"</div></td>";	
			html_tr += "</tr>";				
			idx++;
		}
	}
	
	return html_tr;
}
function INTERNAL_R12STD_Vol_Set(idx)
{
	$("#R12STD_list input[type=checkbox]").prop('checked',false);
	$("#R12STD_list input[type=checkbox]:eq("+parseInt(idx,10)+")").prop('checked',true);
	
	for(var i=0;i<FMT_R12STD_VOLUME_INFO.length;i++)
	{
		FMT_R12STD_VOLUME_INFO[i][3] = (parseInt(idx, 10) == i)?1:0;
	}
}
function INTERNAL_R12STD_List()
{
	var html_tr = "";
				  
	for(var i=0;i<FMT_R12STD_VOLUME_INFO.length;i++)
	{
		if ((i % 2) == 0)
				html_tr += "<tr id=\"row" + j + "\">";
		else
				html_tr += "<tr id=\"row" + j + "\" class=\"erow\">";
		
		html_tr += "<td><div style=\"text-align: left; width: 30px;\">";
		html_tr += "<input type=\"checkbox\" value=\"" + i + "\" name=\"f_r12std_2r1_vol\" id=\"f_r12std_2r1_vol\" onclick=\"INTERNAL_R12STD_Vol_Set('" + i + "');\"";
		html_tr += 	(parseInt(FMT_R12STD_VOLUME_INFO[i][3],10) == 0)? " >":" checked >";
		html_tr += "</div></td>";
		
		var my_volume_name = FMT_R12STD_VOLUME_INFO[i][0].toString().replace(/1/g, "Volume_1").replace(/2/g, "Volume_2").replace(/3/g, "Volume_3").replace(/4/g, "Volume_4");		
		html_tr += "<td><div style=\"text-align: left; width: 90px;\">" + my_volume_name + "</div></td>";
		html_tr += "<td><div style=\"text-align: left; width: 200px;\">" + INTERNAL_FMT_Convert_Device_Name(1, FMT_R12STD_VOLUME_INFO[i][2]) + "</div></td>";		
		html_tr += "</tr>";		
	}
	
	return html_tr;
}
function INTERNAL_R12STD_init()
{
	FMT_R12STD_VOLUME_INFO.length = 0;
	var idx = 0;
	
	$('item', USED_VOLUME_INFO).each(function(n){
		
		if (($('raid_mode',this).text() == "raid1") && 
			($('raid_status',this).text() == "0") &&
			($('is_roaming_volume',this).text() == "0") )
		{
			FMT_R12STD_VOLUME_INFO[idx] =  new Array();
			FMT_R12STD_VOLUME_INFO[idx][0] = $('volume',this).text();
			FMT_R12STD_VOLUME_INFO[idx][1] = $('raid_mode',this).text();
			FMT_R12STD_VOLUME_INFO[idx][2] = $('device',this).text();
			FMT_R12STD_VOLUME_INFO[idx][3] = (parseInt(idx,10) == 0)?1:0;
			FMT_R12STD_VOLUME_INFO[idx][4] = $('device',this).text().slice(0,3);
			idx++;
		}	
		
	});	//end of each
	
//	var msg = "";
//	for(var idx=0;idx<FMT_R12STD_VOLUME_INFO.length;idx++)
//	{
//		msg += FMT_R12STD_VOLUME_INFO[idx].toString()+"\n";
//	}
//	alert(msg);
}
function INTERNAL_FMT_R12STD_Check(str)
{
	/*
		val : 0 -> don't support RAID1 to JBOD
			  1 -> support RAID1 to JBOD
	*/
	var val = 1;
	var my_raid_mode ="";
	
	$('item', USED_VOLUME_INFO).each(function(e){
		
		my_raid_mode = $('raid_mode',this).text();
		if (my_raid_mode == "linear")
		{
			var my_dev = $('device',this).text();
			if (my_dev.indexOf(str) != -1)
			{
				val = 0;
				return false;
			}
		}
		
	});	//end of each
	
	return val;
}
function INTERNAL_Migration_Continue_diskmgr()
{
	wd_ajax({
		type:"POST",
		url: "/cgi-bin/hd_config.cgi",
		data:{cmd:'cgi_FMT_Migration_Continue_DiskMGR',
			f_uuid:Migration_Continue_INFO[0].toString(),
			f_dev:Migration_Continue_INFO[1].toString()},
		dataType: "xml",
		success: function(xml) {	
			 	   
			       jLoadingClose();       
			       
			       if (intervalId != 0) clearInterval(intervalId);
				   if (RAID_VolList_timeoutId != 0 ) clearTimeout(RAID_VolList_timeoutId);
					
				   $("#vol_list").flexReload();
					
				   INTERNAL_DIADLOG_DIV_HIDE('formatdsk_Diag');
				   INTERNAL_DIADLOG_BUT_UNBIND('formatdsk_Diag');
				
				   $("#formatdsk_Diag").overlay().close(); 
				   
				   if (parseInt($(xml).find('res').text(),10) != 0)
			       {
			       		var msg = _T('_raid','msg11').replace(/yyy/, $(xml).find('res').text());	
			       		jAlert( msg, "warning");	//Text:Hard Drive(s) Formatting Failure(Error Code:xxx).
			       }              
		 }
	});	//end of ajax 
}
function INTERNAL_Migration_Continue_init(vol_info)
{
	Migration_Continue_INFO.length = 0;
	Migration_Continue_INFO = vol_info;
}
function INTERNAL_Migration_Continue()
{
	var val_info = new Array();	
	
	wd_ajax({
	type:"POST",
	url: "/cgi-bin/hd_config.cgi",
	data:{cmd:'cgi_Migration_R5_Continue'},
	dataType: "xml",
	async: false,
	success: function(xml) {	  	  	
	    var my_uuid = $(xml).find("uuid").text(); 
	    if (my_uuid != "")
	    {
	    	val_info.length = 0;
	    	val_info.push(my_uuid);
	    	val_info.push($(xml).find("valid_disks").text());
	    }                                      
	 }//end of success
	});	//end of ajax     
	
	return val_info;
}
function INTERNAL_FMT_Button()
{
	//Newly Insert HD
	REFMT_HD_INFO = new Array();	
	$('unused_volume_info > item', UNUSED_VOLUME_INFO).each(function(e){
			
		var my_partition = $('partition',this).text();
		var my_size = $('size',this).text();
	   
		if (my_partition.length == 3)
			INTERNAL_Reformat_Volume_List(my_partition);
		else if (my_partition.length == 4)
		{	
			var my_partition_num = my_partition.substr(3,4);
			if (my_partition_num == 2)
			{
				INTERNAL_Reformat_Volume_List(my_partition);
			}
		}	
			
	});	//end od each

	if ( (REFMT_HD_INFO.length != 0) && (FMT_HD_INFO.length != REFMT_HD_INFO.length)) return 1;	//format newly insert hd
	
	return 0;	//format all
}
function INTERNAL_FMT_Button_status(my_mode)
{
	var my_status = new Array();	
	my_status[0] = new Array("1");	//Create all
	my_status[1] = new Array("0");	//Newly HD
	my_status[2] = new Array("0");	//Rebuild
	my_status[3] = new Array("0");	//STD2R1
	my_status[4] = new Array("0");	//STD2R5
	my_status[5] = new Array("0");	//R12R5
	my_status[6] = new Array("0");	//Spare Disk
	my_status[7] = new Array("0");	//RAID1 expansion
	my_status[8] = new Array("0");	//RAID5 expansion
	my_status[9] = new Array("0");	//RAID5 extendsion
	my_status[10] = new Array("0");	//R12STD 
	my_status[11] = new Array("0");	//STD12R5,Migration Continue
	
	var button_status = INTERNAL_FMT_Button();
//	alert("button_status = " + button_status);
	
	switch(parseInt(button_status,10))
	{
		case 0://Create All
			
			my_status[0][0] = ((FMT_HD_INFO.length == 3) && (my_mode == "raid1"))?0:1;
			
			//RAID Expansion info or R12STD
			if ( my_mode == "raid1" || my_mode == "raid5" || my_mode == "standard")
			{
				var r1_expansion = 0, r5_expansion = 0;
				
				$('item', USED_VOLUME_INFO).each(function(e){
					var is_roaming = parseInt($('is_roaming_volume',this).text(),10);
					var mounted = parseInt($('mount_status',this).text(), 10);
					var encrypted = parseInt($('volume_encrypt',this).text(), 10);
					
					if ( is_roaming==0 && encrypted==0 )
					{
						my_raid_mode = $('raid_mode',this).text();
												
						if ( (my_raid_mode == "raid1") && (my_mode == "standard"))	//RAID1 to STD
						{
							if ( parseInt($('raid_status',this).text(),10) == 0)
							{
								if (INTERNAL_FMT_R12STD_Check($('device',this).text()) == 1) my_status[10] = new Array("1");
							}	
						}
						else if ( (my_raid_mode == "raid1") && (my_raid_mode == my_mode))	//RAID1 expansion 
						{
							if ( parseInt($('raid_status',this).text(),10) == 0)
							{
								if (INTERNAL_FMT_RaidExpan_Check($('device',this).text()) == 1) my_status[7] = new Array("1");
							}	
						}
						else if ( (my_raid_mode == "raid5") && (my_raid_mode == my_mode))//RAID5 expansion
						{
							var migrate_val_info = new Array();	
							migrate_val_info = INTERNAL_Migration_Continue();
							
							if ( migrate_val_info.length != 0)//STD2R5, migration continue
							{
								if ( (migrate_val_info[0].length != 0) && (migrate_val_info[1].length != 0))//STD2R5, migration continue
								{
									INTERNAL_Migration_Continue_init(migrate_val_info);
									
									my_status[11] = new Array("1");
								}	
							}
							else
							{
								 /* raid status: 0:Normal 1:Rebuilding 2:Degraded 3:Crashed 4:Lock 5:Resyncing
    							 	6:Formatting 7:Resizing 8:Expand 9:Migrate */
    							 	
    							if ( parseInt($('raid_status',this).text(),10) == 0)
								{
									if (INTERNAL_FMT_RaidExpan_Check($('device',this).text()) == 1) 
									{
									    my_status[8] = new Array("1");	
										
										if (($('device',this).text().length == 9) && (REFMT_HD_INFO.length == 1)) my_status[9] = new Array("1");										
									}
								}		
							}	
						}
					}
				});	//end of each
			}
		break;
		
		case 1://Newly HD
			switch(my_mode)
			{
				case "linear":
				case "raid0":
					switch(REFMT_HD_INFO.length)
					{
						case 1://insert 1 HDD
							my_status[0] = new Array("1");	//Create all
						break;
						
						default://insert 2 or 3 HDD
							my_status[0] = new Array("1");	//Create all
							my_status[1] = new Array("1");	//Newly HD
						break;
					}
				break;
				
				case "raid1":
					my_status[0][0] = (FMT_HD_INFO.length == 3)? 0:1;	//Create all
					
					var my_current_volume_info = new Array();	
					my_current_volume_info = INTERNAL_FMT_Get_CurrentVOL();
					if (INTERNAL_FMT_AllowOf_STD2R1(my_current_volume_info) == 1) my_status[3] = "1";
					
					if (REFMT_HD_INFO.length == 2) my_status[1][0] = 1;
					
				break;
				
				case "raid5":
					
					my_status[0] = new Array("1");	//Create all
					
					var my_current_volume_info = new Array();	
					my_current_volume_info = INTERNAL_FMT_Get_CurrentVOL();
					
					if (INTERNAL_FMT_AllowOf_RAID5_SpareDsk(my_current_volume_info) == 1) my_status[6] = "1";
					
					switch(REFMT_HD_INFO.length)
					{
						case 1:
							if (INTERNAL_FMT_AllowOf_R12R5(my_current_volume_info) == 1) my_status[5] = "1";
							
							if (( INTERNAL_RaidExpan_newlydev_isroaming(REFMT_HD_INFO[0][0].toString()) == 1) && 
								(INTERNAL_FMT_RaidExpan_Minimal_Required_Size_Check(0,parseInt(REFMT_HD_INFO[0][5],10)*1024) == 1))
							{
								$('item', USED_VOLUME_INFO).each(function(e){
									if($('raid_mode',this).text() == "raid5" )
									{
										if (INTERNAL_FMT_RaidExpan_Check($('device',this).text()) == 1) 
										{
										   if ($('device',this).text().length == 9) my_status[9] = new Array("1");
										}
									}
								});	//end of each	
							}	
						break;
						
						case 2:
							if (INTERNAL_FMT_AllowOf_STD2R5(my_current_volume_info) == 1) my_status[4][0] = "1";
							if (INTERNAL_FMT_AllowOf_R12R5(my_current_volume_info) == 1) my_status[5][0] = "1";
						break;
						
						case 3:
							my_status[1] = new Array("1");	//Newly HD
							if (INTERNAL_FMT_AllowOf_STD2R5(my_current_volume_info) == 1) my_status[4][0] = "1";
						break;
					}	
				break;
				
				case "raid10":
					my_status[0] = new Array("1");	//Create all
				break;
				
				default:
					my_status[0] = new Array("1");	//Create all
					my_status[1] = new Array("1");	//Newly HD
					
					$('item', USED_VOLUME_INFO).each(function(e){
						if ( (parseInt($('raid_status',this).text(),10) == 0) && 
							 (parseInt($('is_roaming_volume',this).text(),10) == 0) &&
							 ($('raid_mode',this).text() == "raid1") &&
							 (parseInt($('volume_encrypt',this).text(), 10) == 0)
							)
						{
							if (INTERNAL_FMT_R12STD_Check($('device',this).text()) == 1) my_status[10] = new Array("1"); //R12STD
						}
					});	//end of each
				break;
			}
			
			
		break; //end of //Newly HD	
	}
	
	for(var i=0;i<my_status.length;i++)
	{
		switch(i)
		{
			case 0://Create All:
				(parseInt(my_status[i][0], 10) == 1)? $("#tr_create_all_format").show():$("#tr_create_all_format").hide();
			break;
			case 1://Newly HD
				(parseInt(my_status[i][0], 10) == 1)? $("#tr_newly_insert_format").show():$("#tr_newly_insert_format").hide();
			break;	
			
			case 3://STD2R1
				(parseInt(my_status[i][0], 10) == 1)?$("#tr_std2r1_format").show():$("#tr_std2r1_format").hide();
			break;
			
			case 4://STD2R5
				(parseInt(my_status[i][0], 10) == 1)?$("#tr_std2r5_format").show():$("#tr_std2r5_format").hide();
			break;
			
			case 5://R12R5
				(parseInt(my_status[i][0], 10) == 1)?$("#tr_r12r5_format").show():$("#tr_r12r5_format").hide();
			break;
			
			case 6://Spare Disk
				(parseInt(my_status[i][0], 10) == 1)?$("#tr_spare_disk_format").show():$("#tr_spare_disk_format").hide();
			break;	
			
			case 7://RAID 1 expansion
//				if (parseInt(my_status[i][0], 10) == 1)
//				{
//					$("#raid_main_menu_r1").show();
//					$("#tr_r1_expan").show()
//				}
//				else
//			
//					$("#tr_r1_expan").hide();
					
				(parseInt(my_status[i][0], 10) == 1)?$("#tr_r1_expan").show():$("#tr_r1_expan").hide();	
			break;	
			
			case 8://RAID 5 expansion
				(parseInt(my_status[i][0], 10) == 1)?$("#tr_r5_expan").show():$("#tr_r5_expan").hide();
			break;	
			
			case 9://RAID 5 extendsion
				(parseInt(my_status[i][0], 10) == 1)?$("#tr_r5_extend").show():$("#tr_r5_extend").hide();
			break;	
			
			case 10://R12STD
//				if (parseInt(my_status[i][0], 10) == 1)
//				{
//					$("#raid_main_menu_r1").show();
//					$("#tr_r5_r12std").show();
//				}
//				else	
//					$("#tr_r5_r12std").hide();

				(parseInt(my_status[i][0], 10) == 1)?$("#tr_r5_r12std").show():$("#tr_r5_r12std").hide();		
			break;	
			
			case 11://Migration contiune
				(parseInt(my_status[i][0], 10) == 1)?$("#tr_migration_continue").show():$("#tr_migration_continue").hide();	
			break;	
		}
	}
}

function HD_Show_Result_List(id_name)
{
	if (id_name == "formatdsk")
	{
		$("#dskDiag_wait").hide();
		$("#dskDiag_res").show();
	}
}

function HD_Result_List(flag,id_name)
{
    /* flag 0: format result list
            1: Raid Exapn /Physical Disk Info
    */
    wd_ajax({
				url: FILE_USED_VOLUME_INFO,
				type: "POST",
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml){
			  
					$('volume_info > item',xml).each(function(e){
						
					     var my_file_type = "";
					     var my_dskmode = "";
					     var tmp_my_volume = "";
					     var tmp_file_type = "";
					     var my_device = "";
					     var tmp_device = "";				  
					    
					     my_dskmode = "<div style=\"text-align: left; width: 125px;\">" + INTERNAL_RaidLeve_HTML($('raid_mode',this).text()) + "</div>";
					     tmp_my_volume = "<div style=\"text-align: left; width: 98px;\">Volume_" + $('volume',this).text() + "</div>";
				     	 my_file_type = $('file_type',this).text();
				     	 tmp_file_type = "<div style=\"text-align: left; width: 80px;\">" + my_file_type.toUpperCase() + "</div>";
				     	 my_device = $('device',this).text();
				     	 tmp_device = "<div style=\"text-align: left; width: 280px;\">" + INTERNAL_FMT_Convert_Device_Name(1,my_device) + "</div>";
						 
						 var f=e+1;
						 switch(id_name)
						 {
						 	case "formatdsk":
						 		if ( parseInt(f%2) == 1)
		    				    	$('#dskDiag_res_hdlst').append('<tr id='+e+'></tr>');
		    				    else
		    				    	$('#dskDiag_res_hdlst').append('<tr id='+e+' class=\"erow\"></tr>');
		    				    
		    				    $('<td></td>').append(tmp_my_volume).appendTo('#dskDiag_res_hdlst tr[id='+e+']');
		    				    $('<td></td>').append(tmp_file_type).appendTo('#dskDiag_res_hdlst tr[id='+e+']');
		    				    $('<td></td>').append(my_dskmode).appendTo('#dskDiag_res_hdlst tr[id='+e+']');
		    				    $('<td></td>').append(tmp_device).appendTo('#dskDiag_res_hdlst tr[id='+e+']');
						 	break;
						 	
						 	case "reformat":
						 	case "reformat_std2r1":
						 	case "reformat_r5spare":
						 	case "reformat_std2r5":
						 	case "reformat_r12r5":
						 	case "migrate_resize_sync":
						 		if ( parseInt(f%2) == 1)
		    				    	$('#Reformat_Dsk_Diag_res_hdlst').append('<tr id='+e+'></tr>');
		    				    else
		    				    	$('#Reformat_Dsk_Diag_res_hdlst').append('<tr id='+e+' class=\"erow\"></tr>');
		    				    
		    				    $('<td></td>').append(tmp_my_volume).appendTo('#Reformat_Dsk_Diag_res_hdlst tr[id='+e+']');
		    				    $('<td></td>').append(tmp_file_type).appendTo('#Reformat_Dsk_Diag_res_hdlst tr[id='+e+']');
		    				    $('<td></td>').append(my_dskmode).appendTo('#Reformat_Dsk_Diag_res_hdlst tr[id='+e+']');
		    				     $('<td></td>').append(tmp_device).appendTo('#Reformat_Dsk_Diag_res_hdlst tr[id='+e+']');
						 	break;
						 	
						 	case "remain":
						 		if ( parseInt(f%2) == 1)
		    				    	$('#Remain_Dsk_Diag_res_hdlst').append('<tr id='+e+'></tr>');
		    				    else
		    				    	$('#Remain_Dsk_Diag_res_hdlst').append('<tr id='+e+' class=\"erow\"></tr>');
		    				    
		    				    $('<td></td>').append(tmp_my_volume).appendTo('#Remain_Dsk_Diag_res_hdlst tr[id='+e+']');
		    				    $('<td></td>').append(tmp_file_type).appendTo('#Remain_Dsk_Diag_res_hdlst tr[id='+e+']');
		    				    $('<td></td>').append(my_dskmode).appendTo('#Remain_Dsk_Diag_res_hdlst tr[id='+e+']');
		    				     $('<td></td>').append(tmp_device).appendTo('#Remain_Dsk_Diag_res_hdlst tr[id='+e+']');
						 	break;
						 }//end of switch
					});	//end od each
				
			},//end of success: function(xml){
            error:function (xhr, ajaxOptions, thrownError){}  
	});	//end of wd_ajax({	
}

function FMT_CreateAll_Data_Init(fmt_step)
{	
	if ( parseInt(fmt_step) != 0) 
	{
		FMT_CREATEALL_DATA_INIT = 1;
		return;
	}	
	
	FMT_SHAREDNAME = INTERNAL_FMT_Get_Free_SharedName();
	HOME_XML_CURRENT_HD_INFO = "";
	CURRENT_HD_INFO = INTERNAL_Get_HD_Info();
	
	if ( RAID_VolList_timeoutId != 0 ) clearTimeout(RAID_VolList_timeoutId);
	
	//menu_l:Clear all style
	$(".raid_left ul li").each(function(idx) {
        $(this).css('background-color','#F0F0F0').css('color', '#4B5A68');
		$(this).children(".img").hide();
    });
    
    //menu_r:Clear all style
	$(".raid_right table").each(function(idx) {
		$("#"+$(this).attr('id')).hide();
    });
    $("#raid_main_menu_std").css('background-color','#15abff').css('color', '#FAFAFA').children(".img").show();
    $("#raid_r_std").show();
    $("#DIV_CHECKBOX_RAIDMODE_HTML").html(_T('_raid','desc20'));
	
	//Create Menu for Step 3: Select A RAID Type
	FMT_HD_INFO = INTERNAL_Get_HD_Info();
	INTERNAL_FMT_Get_RAID_List(FMT_HD_INFO.length,0);
	INTERNAL_RAID_Menu_Click();
	
	INTERNAL_FMT_Button_status('standard');
	
	setSwitch("#storage_raidFormatVE1stAutoMount12_switch",0);
	setSwitch("#storage_raidFormatVE2ndAutoMount13_switch",0);
	setSwitch("#storage_raidFormatVE3rdAutoMount14_switch",0);
	setSwitch("#storage_raidFormatVE4thAutoMount15_switch",0);
	
	$("#tip_create_alldisk").attr('title',_T('_raid','desc70'));
	$("#tip_create_newlydisk").attr('title',_T('_raid','desc56'));
	$("#tip_STD2R1").attr('title',_T('_raid','desc58'));
	$("#tip_STD2R5").attr('title',_T('_raid','desc62'));
	$("#tip_R12R5").attr('title',_T('_raid','desc62'));
	$("#tip_SPAREDisk").attr('title', _T('_raid','desc78'));
	$("#tip_R1Expan").attr('title', _T('_raid','desc118'));
	$("#tip_R5Expan").attr('title', _T('_raid','desc118'));
	$("#tip_R5Extend").attr('title', _T('_raid','desc120'));
	
	FMT_CREATEALL_DATA_INIT = 1;
}

//ret_idx, hide_element_id, show_slement_id
function send_smart_cmd(ret_idx, hide_element_id, show_slement_id)
{
	var run_cmd = "smart_test -s";
	for(var idx in ret_idx)
		run_cmd += String.format(" -{0}", hd_slot_map[ret_idx[idx]]);
	
	jLoading(_T('_common','set'), 'loading' ,'s', '');
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/hd_config.cgi",
		data:{
			cmd:'cgi_Run_Smart_Test',
			run_cmd: run_cmd
		},
		dataType: "xml",
		success: function(r) {
			
			stop_web_timeout(true);
			
			$("#" + hide_element_id).hide();
			$("#" + show_slement_id).show();
		},
		complete: function() {
			jLoadingClose();
		}
	});
}

function get_dev_name(HD_INFO, idx)
{
	var my_dev = "";
	var i = 0;
	var hd_info_len = HD_INFO.length;

	for (i = 0; i < hd_info_len; i++)
	{
		my_dev += HD_INFO[i][idx];
	}

	return my_dev;
}

function init_formatdsk_dialog(fmt_step)
{ 
	/*
		fmt_type:
			0 -> start
			1 -> bar
			2 -> result list
	*/
	
	if (parseInt(FMT_CREATEALL_DATA_INIT, 10) != 1)
	{
		window.setTimeout("init_formatdsk_dialog('"+fmt_step+"')",500);
		return false;
	}
	
	adjust_dialog_size("#formatdsk_Diag",750,535);
	var FMTObj = $("#formatdsk_Diag").overlay({fixed: false, expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});

	$("#formatdsk_Diag").find(":password").each(function() {
          $(this).val("");
  });
	
	$("input:checkbox").checkboxStyle();
	$("input:password").inputReset();
	init_tooltip();
	init_select();
	init_button();
	init_switch();
	language();
 	
 	$("#dskDiag_raidmode_set input[type=checkbox]").prop('checked',false);
 	switch(parseInt(fmt_step, 10))
	{
		case 1:
			INTERNAL_FMT_ProgressBar_INIT(0,"formatdsk");
			
			if (intervalId != 0) clearInterval(intervalId);
			intervalId = setInterval("INTERNAL_FMT_Show_Bar('formatdsk')",3000);
			
		  	INTERNAL_DIADLOG_DIV_HIDE('formatdsk_Diag');
		  	$("#dskDiag_bar").show();
		break;
		
		case 2:
			if (RAID_VolList_timeoutId != 0 ) clearTimeout(RAID_VolList_timeoutId);
		  INTERNAL_DIADLOG_DIV_HIDE('formatdsk_Diag');
		  
		  var my_xml = INTERNAL_FMT_Load_DM_READ_STATE();
			if (my_xml != "")
			{
				var my_errcode = $(my_xml).find("dm_state").find("errcode").text();
				RAID_FormatResInfo("formatdsk", "none", "dskDiag_res", my_errcode);
			}
		break;
		
		default:
			if (intervalId != 0) clearInterval(intervalId);
			if (RAID_VolList_timeoutId != 0 ) clearTimeout(RAID_VolList_timeoutId);
			
		  	INTERNAL_DIADLOG_DIV_HIDE('formatdsk_Diag');
		  	$("#dskDiag_raidmode_set").show();
		break;
	}
	FMTObj.load();
	$("#formatdsk_Diag").center();
	
	$("#formatdsk_Diag .close").click(function(){
		if (intervalId != 0) clearInterval(intervalId);
		if (RAID_VolList_timeoutId != 0 ) clearTimeout(RAID_VolList_timeoutId);
		
		$("#vol_list").flexReload();
		
		INTERNAL_DIADLOG_DIV_HIDE('formatdsk_Diag');
		INTERNAL_DIADLOG_BUT_UNBIND('formatdsk_Diag');
	
		if (!$("#storage_raidFormatNext1_button").hasClass("grayout"))  $("#storage_raidFormatNext1_button").addClass("grayout");
		if (!$("#storage_raidFormatNext2_button").hasClass("grayout"))  $("#storage_raidFormatNext2_button").addClass("grayout");
		
		FMTObj.close();
	});
	
	$("#dskDiag_raidmode_set .LightningCheckbox input[type=checkbox]").click(function(idx){
		
		switch(parseInt($(this).val(), 10))
		{
			case 1://create all disk
				FMT_HD_INFO = INTERNAL_Get_HD_Info();
				
				$(".raid_left ul li").each(function(idx) {
		
					//if ($(this).css('backgroundColor') == 'rgb(0, 103, 166)')	
					if ($(this).css('backgroundColor') == 'rgb(21, 171, 255)')	
					{
						var my_mode = $(this).attr('id').replace('raid_main_menu_std', 'standard')
						.replace(/raid_main_menu_jbod/, 'linear')
						.replace(/raid_main_menu_r0/, 'raid0')
						.replace(/raid_main_menu_r1/, 'raid1')
						.replace(/raid_main_menu_r5/, 'raid5')
						.replace(/raid_main_menu_r10/, 'raid10');
						
						INTERNAL_Create_Volume_Init(my_mode,0);
						return false;
					}	
				});
			break;
			
			case 2://newly hd
				REFMT_HD_INFO = new Array();	
				$('unused_volume_info > item', UNUSED_VOLUME_INFO).each(function(e){
						
					var my_partition = $('partition',this).text();
					var my_size = $('size',this).text();
				   
					if (my_partition.length == 3)
						INTERNAL_Reformat_Volume_List(my_partition);
					else if (my_partition.length == 4)
					{	
						var my_partition_num = my_partition.substr(3,4);
						if (my_partition_num == 2)
						{
							INTERNAL_Reformat_Volume_List(my_partition);
						}
					}	
				});	
				
				$(".raid_left ul li").each(function(idx) {
		
					//if ($(this).css('backgroundColor') == 'rgb(0, 103, 166)')	//#1e1e1e
					if ($(this).css('backgroundColor') == 'rgb(21, 171, 255)')	
					{
						var my_mode = $(this).attr('id').replace('raid_main_menu_std', 'standard')
						.replace(/raid_main_menu_jbod/, 'linear')
						.replace(/raid_main_menu_r0/, 'raid0')
						.replace(/raid_main_menu_r1/, 'raid1')
						.replace(/raid_main_menu_r5/, 'raid5')
						.replace(/raid_main_menu_r10/, 'raid10');
						
						INTERNAL_Create_Volume_Init(my_mode,1);
						return false;
					}	
				});	
			break;
			
			case 4://STD2R1
    	case 5://STD2R5
    	case 6://R12R5
    	case 7://Create Spare Disk
    			CURRENT_HD_INFO = INTERNAL_Get_HD_Info();
				REFMT_HD_INFO = new Array();	
				$('unused_volume_info > item', UNUSED_VOLUME_INFO).each(function(e){
						
					var my_partition = $('partition',this).text();
					var my_size = $('size',this).text();
				  	
					if (my_partition.length == 3)
						INTERNAL_Reformat_Volume_List(my_partition);
					else if (my_partition.length == 4)
					{	
						var my_partition_num = my_partition.substr(3,4);
						if (my_partition_num == 2)
						{
							INTERNAL_Reformat_Volume_List(my_partition);
						}
					}	
				});	
				
				INTERNAL_Create_Volume_Init('standard',1);
				
				var my_current_volume_info = new Array();	
				my_current_volume_info = INTERNAL_FMT_Get_CurrentVOL();
				switch(parseInt($(this).val(), 10))
				{
					case 4://STD2R1
						$("#reformat_std2r1_source_list").empty();
						var html_tr = INTERNAL_FMT_Std2R1_Get_Source_Dev(my_current_volume_info);
						$("#reformat_std2r1_source_list").append(html_tr);
					break;
		    		case 5://STD2R5
		    			$("#tr_newly_hd_std2r5").show();
						$("#reformat_std2r5_source_list").empty();
						var html_tr = INTERNAL_FMT_Std2R5_Get_Source_Dev(my_current_volume_info);
						$("#reformat_std2r5_source_list").append(html_tr);
		    		break;
		    		case 6://R12R5
		    			$("#reformat_r12r5_source_list").empty();
						var html_tr = INTERNAL_FMT_R12R5_Get_Source_Dev(my_current_volume_info);
						$("#reformat_r12r5_source_list").append(html_tr);
		    		break;
		    		case 7://Create Spare Disk
		    			INTERNAL_FMT_R5_Add_Spare_Dsk(my_current_volume_info);
		    		break;
				}
			break;
			
			case 8://RAID 1 Expansion
			case 9://RAID 5 Expansion
			case 10://RAID 5 Extand
				INTERNAL_RaidExpan_init();				
			break;
			case 11://RAID 1 to STD
				INTERNAL_R12STD_init();				
			break;
		}
		
		if ( $(this).prop("checked") )
		{
			$("#dskDiag_raidmode_set input[type=checkbox]").prop('checked',false);
			$(this).prop('checked',true);
      
			if ( $("#storage_raidFormatNext1_button").hasClass("grayout"))  $("#storage_raidFormatNext1_button").removeClass("grayout");
			return;
		}
		
		if (!$("#storage_raidFormatNext1_button").hasClass("grayout"))  $("#storage_raidFormatNext1_button").addClass("grayout");
	});
		
	//Step1 - RAID Mode
    $("#storage_raidFormatNext1_button").click(function(){   
    	
    	if ($(this).hasClass('grayout')) return;
    	/*
    		storage_raidFormatType_chkbox:
    			1 -> Create All
    			2 -> inset newly hd
    			3 -> rebuild
    	*/
    	switch (parseInt($('input[name=storage_raidFormatType_chkbox]:checked').val(),10))
    	{
    		case 2://newly hd
    		case 4://STD2R1
    		case 7://Create Spare Disk
    			var my_dev = get_dev_name(REFMT_HD_INFO, 0);
    			clearTimeout(INTERNAL_FMT_Physical_Disk_List_timeout);
    			send_smart_cmd(INTERNAL_FMT_Physical_Disk_List("formatdsk_hd_info",my_dev, 1), "dskDiag_raidmode_set", "dskDiag_physical_info");
    			init_select();
    			hide_select();

    		break;
    		case 5://STD2R5
    		case 6://R12R5
    			jConfirm('M', _T('_raid','msg7'), _T('_common','warning') ,"warning" ,function(r){
				if(r)
				{
					var my_dev = get_dev_name(REFMT_HD_INFO, 0);
		    		clearTimeout(INTERNAL_FMT_Physical_Disk_List_timeout);
		    		send_smart_cmd(INTERNAL_FMT_Physical_Disk_List("formatdsk_hd_info",my_dev, 1), "dskDiag_raidmode_set", "dskDiag_physical_info");
	    			init_select();
	    			hide_select();
				}
				});	//end of jConfirm
    		break;
    		
				case 8://RAID 1 Expansion
				case 9://RAID 5 Expansion
					if (FMT_RAIDEXPAN_VOLUME_INFO.length == 1)
					{
						for(var i=0;i<FMT_RAIDEXPAN_VOLUME_INFO.length;i++)
						{
							if (parseInt(FMT_RAIDEXPAN_VOLUME_INFO[i][7], 10) == 1)
							{
								INTERNAL_RaidExpan_ReplaceHD(parseInt(FMT_RAIDEXPAN_VOLUME_INFO[i][6],10));
								break;
							}
						}
			
						$("#dskDiag_raidmode_set").hide();
						$("#RAIDExpansion_ReplaceHD").show();
					}
					else	//2 RAID 1
					{
						var html_tr = INTERNAL_RaidExpan_2R1_List();
						$("#expandsk_2r1_list").html(html_tr);
						$("input:checkbox").checkboxStyle();
						
						$("#dskDiag_raidmode_set").hide();
						$("#RAIDExpansion_2R1_List").show();
					}	
				break;
			
				case 10://RAID 5 Extend
					if (!$("#storage_raidFormatNext1_button").hasClass("grayout"))  $("#storage_raidFormatNext1_button").addClass("grayout");

					var my_dev = get_dev_name(REFMT_HD_INFO, 0);
    				clearTimeout(INTERNAL_FMT_Physical_Disk_List_timeout);
    				send_smart_cmd(INTERNAL_FMT_Physical_Disk_List("formatdsk_hd_info",my_dev, 1), "dskDiag_raidmode_set", "dskDiag_physical_info");
	    	
					/*
					jLoading(_T('_common','set'), 'loading' ,'s', ''); 
					
					window.setTimeout(function() {
						INTERNAL_RaidExtend_diskmgr(FMT_RAIDEXPAN_VOLUME_INFO.toString());
					},500);
					*/
				break;
    		
    		case 11://RAID 1 to STD
    			if (FMT_R12STD_VOLUME_INFO.length == 2)
    			{
    				var html_tr = INTERNAL_R12STD_List();
    				$("#r12std_list").empty().html(html_tr);
					$("input:checkbox").checkboxStyle();    				    				

    				$("#dskDiag_raidmode_set").hide();
    				$("#R12STD_list").show();
    			}
    			else
    			{
    				var str = "";
    				for(var i=0;i<FMT_R12STD_VOLUME_INFO.length;i++)
					{
						if ( parseInt(FMT_R12STD_VOLUME_INFO[i][3],10) == 1)
						{
							str = FMT_R12STD_VOLUME_INFO[i][2].toString();
						}
					}
    				var html_tr = INTERNAL_R12STD_HD_Set(str);
    				$("#r12std_primaary_hd_list").empty().html(html_tr);
    				$("input:checkbox").checkboxStyle();
    				
    				$("#R12STD_primaary_hd_list").show();
					$("#dskDiag_raidmode_set").hide();
    			}
    		break;
    		
    		case 12:
    			jLoading(_T('_common','set'), 'loading' ,'s', ''); 
				
				window.setTimeout(function() {
					INTERNAL_Migration_Continue_diskmgr();
				},500);
    		break;
    		
    		default://create all
    			var my_dev = get_dev_name(FMT_HD_INFO, 0);
				clearTimeout(INTERNAL_FMT_Physical_Disk_List_timeout);
    			send_smart_cmd(INTERNAL_FMT_Physical_Disk_List("formatdsk_hd_info",my_dev, 1), "dskDiag_raidmode_set", "dskDiag_physical_info");
    		break;
    	}
	});
	
	//format HD Diag - physical disk info's button
	$("#storage_raidFormatBack2_button").click(function(){
		restart_web_timeout();
		
		$("#div_msg").hide();
		$("#dskDiag_raidmode_set").show();
		$("#dskDiag_physical_info").hide();
	});
	
	$("#storage_raidFormatNext2_button").click(function(){   
		
		if ($("#storage_raidFormatNext2_button").hasClass('grayout')) return;
		restart_web_timeout();
		$("#dskDiag_physical_info").hide();
		
		switch (parseInt($('input[name=storage_raidFormatType_chkbox]:checked').val(),10))
		{
			case 4://STD2R1
    			INTERNAL_FMT_Create_State(1);
				$("#dskDiag_raidmode_set").hide();
				$("#Reformat_Dsk_Diag_Std2R1").show();
				
				$("input:checkbox").checkboxStyle();
				return;
    		break;
    		
    		case 5://STD2R5
	    		INTERNAL_FMT_Create_State(2);
				
				$("#Reformat_Dsk_Diag_Physical_Info").hide();
				$("#Reformat_Dsk_Diag_Std2R5").show();
				
				$("input:checkbox").checkboxStyle();
				return;
    		break;
    		
    		case 6://R12R5
    			INTERNAL_FMT_Create_State(4);
			
				$("#Reformat_Dsk_Diag_Physical_Info").hide();
				$("#Reformat_Dsk_Diag_R12R5").show();
				
				$("input:checkbox").checkboxStyle();
				return;
    		break;
    		
    		case 7://Spare Disk
    			INTERNAL_FMT_Create_State(3);
    			
    			$("#reformat_r5spare_summary_list").empty();
    			
				var html_tr = INTERNAL_FMT_Std2R1_Summary_List();
				$("#reformat_r5spare_summary_list").append(html_tr);
				$("#Reformat_Dsk_Diag_R5Spare_Summary").show();	
				
				return;
    		break;

    		case 10: //RAID 5 Extension
    			$("#RAIDExpansion_R5Expand_Summary").show();
				$("#reformat_r5expand_summary_list").html(INTERNAL_FMT_R5Extend_Summary_List());
    			return;
    		break;

			default:// format all or newly hd
							
					var my_raidtype = CREATE_VOLUME_INFO[0][1];
					switch(my_raidtype)
					{
						case "raid0":
						case "raid1":
						case "raid5":
						case "raid10":
							var my_desc = (my_raidtype == "raid5")?_T('_raid','desc33'):_T('_raid','desc32');
							$("#dskDiag_raidsize_1st_desc1").html(my_desc);
							
							var my_desc = _T('_raid','desc34');
							$("#dskDiag_raidsize_1st_desc2").html("<b>"+my_desc.replace('xxx',INTERNAL_RaidLeve_HTML(my_raidtype))+"</b>");
							$("#dskDiag_raidsize_2nd_desc2").html("<b>"+my_desc.replace('xxx',INTERNAL_RaidLeve_HTML(my_raidtype))+"</b>");
							INTERNAL_FMT_Create_RAID_Size_Init();
								
							$("#dskDiag_raidsize_volume1_set").show();
							
						break;
						
						case "standard":
						case "linear":
								if ( FUN_VOLUME_ENCRYPTION == 1 )
								{
									$("#create_volume_encryption_list").empty();
									var html_tr = INTERNAL_FMT_VE_List();
									$("#create_volume_encryption_list").append(html_tr);
									
									$("#formatdsk_Diag .left_button").attr('title',_T('_raid','desc72'));
									$("#formatdsk_Diag .right_button").attr('title',_T('_raid','desc73'));
									init_tooltip('.tip');	
									$("#dskDiag_volume_encrpty_list").show();
								}
								else
								{
									var html_tr = INTERNAL_FMT_Summary_List();
									$("#create_summary_list").empty().append(html_tr);
									
									$("#dskDiag_summary").show();	
								}		
						break;
					}//end of switch(my_raidtype)...
			break;
		}
	});
	
	//format HD Diag - RAID Size Setting 1
	$("#storage_raidFormatSpareDsk4_chkbox").change(function() {
		INTERNAL_FMT_Spare_Dsk_Resize();
	})
	
	$("#storage_raidFormat1stSpanning4_chkbox").change(function() {
		INTERNAL_FMT_1st_Create_JBOD(0);
		
		if (parseInt(VOLUME_NUM, 10) > 3)
		{
			if ( ($("input[name='storage_raidFormat1stSpanning4_chkbox']:checked").val() == 1) && (CREATE_VOLUME_INFO[0][1] == "raid1"))
				$("#tr_1st_create_jbod_msg").show();
			else 
				$("#tr_1st_create_jbod_msg").hide();
		}		
	})
	
	$("#storage_raidFormatBack4_button").click(function(){	
		$("#dskDiag_raidsize_volume1_set").hide();
		$("#dskDiag_physical_info").show();
	});	
	
	$("#storage_raidFormatNext4_button").click(function(){	
		
			var my_raidtype = CREATE_VOLUME_INFO[0][1];
			switch(my_raidtype)
			{
				case "raid0":
					$("#dskDiag_raidsize_volume1_set").hide();
					
					if ( FUN_VOLUME_ENCRYPTION == 1 )
					{
						$("#create_volume_encryption_list").empty();
						var html_tr = INTERNAL_FMT_VE_List();
						$("#create_volume_encryption_list").append(html_tr);
						$("#formatdsk_Diag .left_button").attr('title',_T('_raid','desc72'));
						$("#formatdsk_Diag .right_button").attr('title',_T('_raid','desc73'));
						init_tooltip('.tip');
						$("#dskDiag_volume_encrpty_list").show();
					}
					else
					{
						$("#create_summary_list").empty();
						var html_tr = INTERNAL_FMT_Summary_List();
						$("#create_summary_list").append(html_tr);
						
						$("#dskDiag_summary").show();	
					}	
				
				break;
				
				case "raid1":
					if (CREATE_VOLUME_INFO.length == 4)
					{
						$("#dskDiag_raidsize_volume1_set").hide();
						$("#dskDiag_raidsize_volume2_set").show();
					}
					else 
					{
						setSwitch('#storage_raidFormatAutoRebuild3_switch',0);
						
						$("#dskDiag_raidsize_volume1_set").hide();
						$("#dskDiag_rebuild_set").show();	
					}
				break;	
				
				case "raid5":
					$("#dskDiag_raidsize_volume1_set").hide();
					var my_spare_dsk =  $("input[name='storage_raidFormatSpareDsk4_chkbox']:checked").val();
					if (parseInt(my_spare_dsk) == 1)
					{	
						$("#dskDiag_raidsize_volume1_set").hide();
						
						if ( FUN_VOLUME_ENCRYPTION == 1 )
						{
							$("#create_volume_encryption_list").empty();
							var html_tr = INTERNAL_FMT_VE_List();
							$("#create_volume_encryption_list").append(html_tr);
							$("#formatdsk_Diag .left_button").attr('title',_T('_raid','desc72'));
							$("#formatdsk_Diag .right_button").attr('title',_T('_raid','desc73'));
							init_tooltip('.tip');
							$("#dskDiag_volume_encrpty_list").show();
						}
						else
						{
							$("#create_summary_list").empty();
							var html_tr = INTERNAL_FMT_Summary_List();
							$("#create_summary_list").append(html_tr);
							
							$("#dskDiag_summary").show();	
						}	
					}
					else
					{	
						setSwitch('#storage_raidFormatAutoRebuild3_switch',0);
						
						$("#dskDiag_rebuild_set").show();	
					}	
				break;
				
				case "raid10":
					setSwitch('#storage_raidFormatAutoRebuild3_switch',0);
					
					$("#dskDiag_raidsize_volume1_set").hide();
					$("#dskDiag_rebuild_set").show();	
				break;
			}//end of switch
	});		
	
	//format HD Diag - RAID Size Setting 2
	$("#storage_raidFormat2ndSpanning5_chkbox").change(function() {
		INTERNAL_FMT_2nd_Create_JBOD();
	})
	$("#storage_raidFormatBack5_button").click(function(){	
		$("#dskDiag_raidsize_volume2_set").hide();
		$("#dskDiag_raidsize_volume1_set").show();
	});		
	
	$("#storage_raidFormatNext5_button").click(function(){	
		
		setSwitch('#storage_raidFormatAutoRebuild3_switch',0);
		
		$("#dskDiag_raidsize_volume2_set").hide();
		$("#dskDiag_rebuild_set").show();	
	});	
	
	//format HD Diag - Auto Rebuild setting
	$("#storage_raidFormatBack3_button").click(function(){
		
		$("#dskDiag_rebuild_set").hide();
		
		if (CREATE_VOLUME_INFO.length == 1)
		{
			$("#dskDiag_raidsize_volume1_set").show();
		}
		else
		{	 
			var my_raidtype = CREATE_VOLUME_INFO[1][1];
			if (my_raidtype == "raid1" && CREATE_VOLUME_INFO.length == 4)
			{	
				$("#dskDiag_raidsize_volume2_set").show();
			}
			else	//raid1,raid5,raid10
			{	
				$("#dskDiag_raidsize_volume1_set").show();
			}
		}
	});
	
	$("#storage_raidFormatNext3_button").click(function(){
		
		$("#dskDiag_rebuild_set").hide();
		
		if ( FUN_VOLUME_ENCRYPTION == 1 )
		{
			$("#create_volume_encryption_list").empty();
			var html_tr = INTERNAL_FMT_VE_List();
			$("#create_volume_encryption_list").append(html_tr);
			$("#formatdsk_Diag .left_button").attr('title',_T('_raid','desc72'));
			$("#formatdsk_Diag .right_button").attr('title',_T('_raid','desc73'));
			init_tooltip('.tip');
			$("#dskDiag_volume_encrpty_list").show();
		}	
		else
		{
			$("#create_summary_list").empty();
			var html_tr = INTERNAL_FMT_Summary_List();
			$("#create_summary_list").append(html_tr);
			
			$("#dskDiag_summary").show();	
		}
	});	
	
	//format HD Diag - Volume Encryption List
	$("#storage_raidFormatBack11_button").click(function(){
		$("#dskDiag_volume_encrpty_list").hide();
		
		for(var i=0;i<CREATE_VOLUME_INFO.length;i++)
		{
			CREATE_VOLUME_INFO[i][12] = "0";
			CREATE_VOLUME_INFO[i][13] = "0";
			CREATE_VOLUME_INFO[i][14] = "none";
		}
		
		var my_raidtype = CREATE_VOLUME_INFO[0][1];
		switch(my_raidtype)
		{
			case "raid0":
				$("#dskDiag_raidsize_volume1_set").show();
			break;
			
			case "raid1":
			case "raid10":
				$("#dskDiag_rebuild_set").show();	
			break;
			
			case "raid5":
				var my_spare_dsk =  $("input[name='storage_raidFormatSpareDsk4_chkbox']:checked").val();
				if (parseInt(my_spare_dsk) == 1)
					$("#dskDiag_raidsize_volume1_set").show();
				else 
					$("#dskDiag_rebuild_set").show();	
			break;
			
			default:
				$("#dskDiag_physical_info").show();
			break;
		}
			
	});
	
	$("#storage_raidFormatNext11_button").click(function(){
		
		$("#dskDiag_volume_encrpty_list").hide();
		
		for(var i=0;i<CREATE_VOLUME_INFO.length;i++)
		{
			if (CREATE_VOLUME_INFO[i][12] == "1")
			{
				switch(parseInt(CREATE_VOLUME_INFO[i][0],10))
				{
					case 1: //Volume_1
						$("#dskDiag_volume_encrpty_1st").show();
					break;
					
					case 2: //Volume_2
						$("#dskDiag_volume_encrpty_2nd").show();
					break;
					
					case 3: //Volume_3
						$("#dskDiag_volume_encrpty_3rd").show();
					break;
					
					case 4: //Volume_4
						$("#dskDiag_volume_encrpty_4th").show();
					break;
				}//end of switch
				
				return;
				
			}//end of if...
		}//end of for...
		
		$("#create_summary_list").empty();
		var html_tr = INTERNAL_FMT_Summary_List();
		$("#create_summary_list").append(html_tr);		
		init_tooltip();
		
		$("#dskDiag_summary").show();	
					
	});	
	
	//format HD Diag - 1st Volume Encryption
	$("#storage_raidFormatBack12_button").click(function(){
		$("#dskDiag_volume_encrpty_1st").hide();
		$("#dskDiag_volume_encrpty_list").show();
	});
	
	$("#storage_raidFormatNext12_button").click(function(){
		var my_pwd = $("#storage_raidFormatVE1stPWD12_password").val();
		var my_confirm_pwd = $("#storage_raidFormatVE1stConfirmPWD12_password").val();
		if ( INTERNAL_FMT_VE_Check_Info(my_pwd,my_confirm_pwd) == 0) 
			return;
		else
		{
			var my_auto_mount = getSwitch("#storage_raidFormatVE1stAutoMount12_switch");
			
			if ( my_auto_mount == "1")
				INTERNAL_FMT_VE_Set_Info("1","1","1",my_pwd);
			else	
				INTERNAL_FMT_VE_Set_Info("1","1","0",my_pwd);
		}		
		
		$("#dskDiag_volume_encrpty_1st").hide();
		for(var i=1;i<CREATE_VOLUME_INFO.length;i++)
		{
			var msg = CREATE_VOLUME_INFO[i] + "\n";
			if (CREATE_VOLUME_INFO[i][12] == "1")
			{
				switch(parseInt(CREATE_VOLUME_INFO[i][0],10))
				{
					case 1: //Volume_1
						$("#dskDiag_volume_encrpty_1st").show();
					break;
					
					case 2: //Volume_2
						$("#dskDiag_volume_encrpty_2nd").show();
					break;
					
					case 3: //Volume_3
						$("#dskDiag_volume_encrpty_3rd").show();
					break;
					
					case 4: //Volume_4
						$("#dskDiag_volume_encrpty_4th").show();
					break;
				}//end of switch
				
				return;
			}//end of if...
		}//end of for...
		
		$("#create_summary_list").empty();
		var html_tr = INTERNAL_FMT_Summary_List();
		$("#create_summary_list").append(html_tr);
		init_tooltip();
		
		$("#dskDiag_summary").show();
	});
	
	//format HD Diag - 2nd Volume Encryption
	$("#storage_raidFormatBack13_button").click(function(){
		$("#dskDiag_volume_encrpty_2nd").hide();
		var my_id = "";
		for(var i=0;i< CREATE_VOLUME_INFO.length;i++)
		{
			if (CREATE_VOLUME_INFO[i][12] == "1")
			{
				switch(parseInt(CREATE_VOLUME_INFO[i][0],10))
				{
					case 1: //Volume_1
						my_id = "#dskDiag_volume_encrpty_1st";
					break;
				}//end of switch
				
				if (my_id != "") 
				{
					$(my_id).show();				
					return;
				}
			}//end of if...
		}//end of for...
		
		$("#dskDiag_volume_encrpty_list").show();
	});
	
	$("#storage_raidFormatNext13_button").click(function(){
		var my_pwd = $("#storage_raidFormatVE2ndPWD13_password").val();
		var my_confirm_pwd = $("#storage_raidFormatVE2ndConfirmPWD13_password").val();
		if ( INTERNAL_FMT_VE_Check_Info(my_pwd,my_confirm_pwd) == 0) 
			return;
		else
		{
			var my_ve_1st_info = new Array();
			my_ve_2nd_info = INTERNAL_FMT_VE_Get_Info(1);
			var my_auto_mount = getSwitch("#storage_raidFormatVE2ndAutoMount13_switch");
			if ( my_auto_mount == "1")
				INTERNAL_FMT_VE_Set_Info("2","1","1",my_pwd);
			else	
				INTERNAL_FMT_VE_Set_Info("2","1","0",my_pwd);
		}
		
		$("#dskDiag_volume_encrpty_2nd").hide();
		
		for(var i=2;i<CREATE_VOLUME_INFO.length;i++)
		{
			if (CREATE_VOLUME_INFO[i][12] == "1")
			{
				switch(parseInt(CREATE_VOLUME_INFO[i][0],10))
				{
					case 1: //Volume_1
						$("#dskDiag_volume_encrpty_1st").show();
					break;
					
					case 2: //Volume_2
						$("#dskDiag_volume_encrpty_2nd").show();
					break;
					
					case 3: //Volume_3
						$("#dskDiag_volume_encrpty_3rd").show();
					break;
					
					case 4: //Volume_4
						$("#dskDiag_volume_encrpty_4th").show();
					break;
				}//end of switch
				
				return;
			}//end of if...
		}//end of for...
		
		$("#create_summary_list").empty();
		var html_tr = INTERNAL_FMT_Summary_List();
		$("#create_summary_list").append(html_tr);
		init_tooltip();
		
		$("#dskDiag_summary").show();	
	});
	
	//format HD Diag - 3rd Volume Encryption
	$("#storage_raidFormatBack14_button").click(function(){
		$("#dskDiag_volume_encrpty_3rd").hide();
		
		var my_id = "";
		for(var i=0;i< CREATE_VOLUME_INFO.length;i++)
		{
			if (CREATE_VOLUME_INFO[i][12] == "1")
			{
				switch(parseInt(CREATE_VOLUME_INFO[i][0],10))
				{
					case 1: //Volume_1
						my_id = "#dskDiag_volume_encrpty_1st";
					break;
					
					case 2: //Volume_2
						my_id = "#dskDiag_volume_encrpty_2nd";
					break;
					
				}//end of switch
				
				
			}//end of if...
		}//end of for...
		
		if (my_id != "") 
		{
			$(my_id).show();				
			return;
		}
		
		$("#dskDiag_volume_encrpty_list").show();
	});	
	
	$("#storage_raidFormatNext14_button").click(function(){
		var my_pwd = $("#storage_raidFormatVE3rdPWD14_password").val();
		var my_confirm_pwd = $("#storage_raidFormatVE3rdConfirmPWD14_password").val();
		if ( INTERNAL_FMT_VE_Check_Info(my_pwd,my_confirm_pwd) == 0) 
			return;
		else
		{
			var my_ve_3rd_info = new Array();
			my_ve_3rd_info = INTERNAL_FMT_VE_Get_Info(2);
			var my_auto_mount = getSwitch("#storage_raidFormatVE3rdAutoMount14_switch");
			
			if ( my_auto_mount == "1")
				INTERNAL_FMT_VE_Set_Info("3","1","1",my_pwd);
			else	
				INTERNAL_FMT_VE_Set_Info("3","1","0",my_pwd);
		}
		
		$("#dskDiag_volume_encrpty_3rd").hide();
		for(var i=3;i<CREATE_VOLUME_INFO.length;i++)
		{
			var msg = CREATE_VOLUME_INFO[i] + "\n";
			if (CREATE_VOLUME_INFO[i][12] == "1")
			{
				switch(parseInt(CREATE_VOLUME_INFO[i][0],10))
				{
					case 1: //Volume_1
						$("#dskDiag_volume_encrpty_1st").show();
					break;
					
					case 2: //Volume_2
						$("#dskDiag_volume_encrpty_2nd").show();
					break;
					
					case 3: //Volume_3
						$("#dskDiag_volume_encrpty_3rd").show();
					break;
					
					case 4: //Volume_4
						$("#dskDiag_volume_encrpty_4th").show();
					break;
				}//end of switch
				
				return;
			}//end of if...
		}//end of for...
		
		$("#create_summary_list").empty();
		var html_tr = INTERNAL_FMT_Summary_List();
		$("#create_summary_list").append(html_tr);
		init_tooltip();
		
		$("#dskDiag_summary").show();	
	});
		
	//format HD Diag - 4th Volume Encryption
	$("#storage_raidFormatBack15_button").click(function(){
		$("#dskDiag_volume_encrpty_4th").hide();
		
		var my_id = "";
		for(var i=0;i< CREATE_VOLUME_INFO.length;i++)
		{
			if (CREATE_VOLUME_INFO[i][12] == "1")
			{
				switch(parseInt(CREATE_VOLUME_INFO[i][0],10))
				{
					case 1: //Volume_1
						my_id = "#dskDiag_volume_encrpty_1st";
					break;
					
					case 2: //Volume_2
						my_id = "#dskDiag_volume_encrpty_2nd";
					break;
					
					case 3: //Volume_3
						my_id = "#dskDiag_volume_encrpty_3rd";
					break;
				}//end of switch
				
			}//end of if...
		}//end of for...
		
		if (my_id != "") 
		{
			$(my_id).show();				
			return;
		}
		
		$("#dskDiag_volume_encrpty_list").show();
	});
	
	$("#storage_raidFormatNext15_button").click(function(){	
		var my_pwd = $("#storage_raidFormatVE4thPWD15_password").val();
		var my_confirm_pwd = $("#storage_raidFormatVE4thConfirmPWD15_password").val();
		if ( INTERNAL_FMT_VE_Check_Info(my_pwd,my_confirm_pwd) == 0) 
			return;
		else
		{
			var my_ve_4th_info = new Array();
			my_ve_4th_info = INTERNAL_FMT_VE_Get_Info(3);
			var my_auto_mount = getSwitch("#storage_raidFormatVE4thAutoMount15_switch");
			
			if ( my_auto_mount == "1")
				INTERNAL_FMT_VE_Set_Info("4","1","1",my_pwd);
			else	
				INTERNAL_FMT_VE_Set_Info("4","1","0",my_pwd);
		}
		
		$("#dskDiag_volume_encrpty_4th").hide();
		
		$("#create_summary_list").empty();
		var html_tr = INTERNAL_FMT_Summary_List();
		$("#create_summary_list").append(html_tr);
		init_tooltip();
		
		$("#dskDiag_summary").show();	
	});
		
	//format HD Diag - Summary
	$("#storage_raidFormatBack6_button").click(function(){	
		
		if(!$("#storage_raidFormatBack6_button").hasClass("gray_out"))
		{
				$("#dskDiag_summary").hide();	
				if ( FUN_VOLUME_ENCRYPTION == 1 )
				{
					var my_id = "";
					for(var i=0;i< CREATE_VOLUME_INFO.length;i++)
					{
						if (CREATE_VOLUME_INFO[i][12] == "1")
						{
							switch(parseInt(CREATE_VOLUME_INFO[i][0],10))
							{
								case 1: //Volume_1
									my_id = "#dskDiag_volume_encrpty_1st";
								break;
								
								case 2: //Volume_2
									my_id = "#dskDiag_volume_encrpty_2nd";
								break;
								
								case 3: //Volume_3
									 my_id = "#dskDiag_volume_encrpty_3rd";
								break;
								
								case 4: //Volume_4
									my_id = "#dskDiag_volume_encrpty_4th";
								break;
							}//end of switch
							
							
						}//end of if...
					}//end of for...
					
					if (my_id != "")
					{
						$(my_id).show();
						return;
					}
					
					$("#create_volume_encryption_list").empty();
					var html_tr = INTERNAL_FMT_VE_List();
					$("#create_volume_encryption_list").append(html_tr);
					$("#formatdsk_Diag .left_button").attr('title',_T('_raid','desc72'));
					$("#formatdsk_Diag .right_button").attr('title',_T('_raid','desc73'));
					init_tooltip('.tip');
					$("#dskDiag_volume_encrpty_list").show();
					
				}
				else
				{
					var my_raidtype = CREATE_VOLUME_INFO[0][1];
					switch(my_raidtype)
					{
						case "raid0":
							$("#dskDiag_raidsize_volume1_set").show();
						break;
						
						case "raid1":
						case "raid5":
						case "raid10":
							$("#dskDiag_rebuild_set").show();
						break;
						
						default://linear or standard
							$("#dskDiag_physical_info").show();
						break;
					}
				}		
		}	
	});	
	
	$("#storage_raidFormatNext6_button").click(function(){	
			var my_desc = (parseInt($('input[name=storage_raidFormatType_chkbox]:checked').val(),10) == 1)?$("#DIV_CHECKBOX_RAIDMODE_HTML").text():$("#DIV_CHECKBOX_REFORMART_RAIDMODE_HTML").text();
			$("#create_confirm_title").html(my_desc);
			
			$("#dskDiag_summary").hide();
			$("#dskDiag_create_confirm").show();
	});	
	
	$("#storage_raidFormatFinish9_button").click(function(){	
		
		wd_ajax({
			url:"/cgi-bin/hd_config.cgi",
			type:"POST",
			data:{cmd:'cgi_FMT_Disk_Finish'},
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml)
			{
				if ( $(xml).find("res").text() == "1")
				{
				    $("#dskDiag_res").hide();
					FMTObj.close();
					
					INTERNAL_DIADLOG_BUT_UNBIND("formatdsk_Diag");
					INTERNAL_DIADLOG_DIV_HIDE("formatdsk_Diag");
					
					INTERNAL_FMT_Load_USED_VOLUME_INFO();
					INTERNAL_FMT_Load_UNUSED_VOLUME_INFO();		
					go_sub_page('/web/storage/raid.php', 'raid');
				}
			}
		});	// end of ajax
		
	});
	
	$("#storage_raidFormatBack16_button").click(function(){	
			$("#dskDiag_create_confirm").hide();
			$("#dskDiag_summary").show();
	});		
	
	$("#storage_raidFormatNext16_button").click(function(){	
		
		stop_web_timeout(true);
			
		$("#dskDiag_create_confirm").hide();
		$("#dskDiag_partitioning_wait").show();
		$("#div_reamin").hide();
		
		INTERNAL_FMT_Diskmgr_Info();	 
	});	
	
	$("#dsk_back_button_20").click(function(){
		$("#Rebuild_Dsk_Diag_confirm").hide();
		$("#dskDiag_physical_info").show();
	});	
	$("#dsk_next_button_20").click(function(){  
		stop_web_timeout(true);
			
		$("#Rebuild_Dsk_Diag_confirm").hide();
		$("#Rebuild_Dsk_Diag_Partitioning_Wait").show();
		$("#div_reamin").hide();
			
		var my_raid_mode = CREATE_VOLUME_INFO[0][3];
			
		if (my_raid_mode == "raid10")
			INTERNAL_FMT_RAID10_Rebuild_DiskMGR();
		else
	    	INTERNAL_FMT_Rebuild_DiskMGR();	
	});	
	
	//STD2R1 - Step1
	$("#storage_raidFormatBack17_button").click(function(){
		$("#Reformat_Dsk_Diag_Std2R1").hide();
		$("#dskDiag_physical_info").show();
	});	
	$("#storage_raidFormatNext17_button").click(function(){
		setSwitch('#storage_raidFormatSTD2R1AutoRebuild18_switch',0);
		
		$("#Reformat_Dsk_Diag_Std2R1").hide();
		$("#Reformat_Dsk_Diag_Std2R1_Rebuild").show();
	});	
	
	//STD2R1 - Step2
	$("#storage_raidFormatBack18_button").click(function(){
		$("#Reformat_Dsk_Diag_Std2R1_Rebuild").hide();
		$("#Reformat_Dsk_Diag_Std2R1").show();
	});
	$("#storage_raidFormatNext18_button").click(function(){	
		
		$("#Reformat_Dsk_Diag_Std2R1_Rebuild").hide();
		$("#Reformat_Dsk_Diag_Std2R1_Summary").show();
		
		$("#reformat_std2r1_summary_list").empty();
		var html_tr = INTERNAL_FMT_Std2R1_Summary_List();
		$("#reformat_std2r1_summary_list").append(html_tr);
	});	
	
	//STD2R1 - Step3
	$("#storage_raidFormatBack19_button").click(function(){
		$("#Reformat_Dsk_Diag_Std2R1_Summary").hide();
		$("#Reformat_Dsk_Diag_Std2R1_Rebuild").show();
	});	
	$("#storage_raidFormatNext19_button").click(function(){	
		$("#Reformat_Dsk_Diag_Std2R1_Summary").hide();
		$("#Std2R1_Diag_confirm").show();
	});			
	
	//STD2R1 - Step4 - confirm dialog
	$("#storage_raidFormatBack20_button").click(function(){
		$("#Reformat_Dsk_Diag_Std2R1_Summary").show();
		$("#Std2R1_Diag_confirm").hide();
	});	
	$("#storage_raidFormatNext20_button").click(function(){
		stop_web_timeout(true);
			
		$("#Std2R1_Diag_confirm").hide();
		$("#Reformat_Dsk_Diag_Wait").show();
		$("#div_reamin").hide();
		
		INTERNAL_FMT_DiskMGR_Std2R1();	
	});		
	
	$("#storage_raidFormatFinish23_button").click(function(){
		
		wd_ajax({
			url:"/cgi-bin/hd_config.cgi",
			type:"POST",
			data:{cmd:'cgi_FMT_Disk_Finish'},
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml)
			{
				if ( $(xml).find("res").text() == "1")
				{
					$("#Reformat_Dsk_Diag_Res").hide();
					FMTObj.close();
					
					INTERNAL_DIADLOG_BUT_UNBIND("formatdsk_Diag");
					INTERNAL_DIADLOG_DIV_HIDE("formatdsk_Diag");
					
					INTERNAL_FMT_Load_USED_VOLUME_INFO();
					INTERNAL_FMT_Load_UNUSED_VOLUME_INFO();		
					go_sub_page('/web/storage/raid.php', 'raid');
				}
			}
		});	// end of ajax
		
	});		
	//SpareDisk:Step 1
	$("#storage_raidFormatBack24_button").click(function(){
		$("#dskDiag_physical_info").show();
		$("#Reformat_Dsk_Diag_R5Spare_Summary").hide();
	});	
	$("#storage_raidFormatNext24_button").click(function(){
		$("#Reformat_Dsk_Diag_R5Spare_Summary").hide();
		$("#R5SpareDisk_Diag_confirm").show();
	});
	
	//SpareDisk:Step 2
	$("#storage_raidFormatBack25_button").click(function(){
		$("#R5SpareDisk_Diag_confirm").hide();
		$("#Reformat_Dsk_Diag_R5Spare_Summary").show();
	});		
	$("#storage_raidFormatNext25_button").click(function(){
		stop_web_timeout(true);
		
		$("#R5SpareDisk_Diag_confirm").hide();
		$("#Reformat_Dsk_Diag_Wait").show();
		
		$("#div_reamin").hide();
		
		INTERNAL_FMT_DiskMGR_R5Spare();
	});	
	
	//Std2RAID5:Step1
	$("#storage_raidFormatBack27_button").click(function(){
		$("#Reformat_Dsk_Diag_Std2R5").hide();
		$("#dskDiag_physical_info").show();
	});	
	
	$("#storage_raidFormatNext27_button").click(function(){
		setSwitch('#storage_raidFormatSTD2R5AutoRebuild28_switch',0);
		
		$("#Reformat_Dsk_Diag_Std2R5").hide();
		$("#Reformat_Dsk_Diag_Std2R5_Rebuild").show();
	});		
	
	//Std2RAID5:Step2
	$("#storage_raidFormatBack28_button").click(function(){
		$("#Reformat_Dsk_Diag_Std2R5_Rebuild").hide();
		$("#Reformat_Dsk_Diag_Std2R5").show();
	});	
	
	$("#storage_raidFormatNext28_button").click(function(){
		$("#Reformat_Dsk_Diag_Std2R5_Rebuild").hide();
		$("#Reformat_Dsk_Diag_Std2R5_Summary").show();
			
		$("#reformat_std2r5_summary_list").empty();
		var html_tr = INTERNAL_FMT_Std2R5_Summary_List();
		$("#reformat_std2r5_summary_list").append(html_tr);
	});	
	
	//Std2RAID5:Step3
	$("#storage_raidFormatBack29_button").click(function(){
		$("#Reformat_Dsk_Diag_Std2R5_Rebuild").show();
		$("#Reformat_Dsk_Diag_Std2R5_Summary").hide();
	});	
	
	$("#storage_raidFormatNext29_button").click(function(){
		$("#Reformat_Dsk_Diag_Std2R5_Summary").hide();
		$("#STD2R5Disk_Diag_confirm").show();
	});				
	
	//Std2RAID5:Step4
	$("#storage_raidFormatBack30_button").click(function(){
		$("#Reformat_Dsk_Diag_Std2R5_Summary").show();
		$("#STD2R5Disk_Diag_confirm").hide();
	});	
	$("#storage_raidFormatNext30_button").click(function(){
		stop_web_timeout(true);
		
		$("#STD2R5Disk_Diag_confirm").hide();
		$("#Reformat_Dsk_Diag_Wait").show();
		$("#div_reamin").hide();
		
		INTERNAL_FMT_DiskMGR_Std2R5();	
	});		
	
	//R12R5:Step 1
	$("#storage_raidFormatBack31_button").click(function(){
		$("#Reformat_Dsk_Diag_R12R5").hide();
		$("#dskDiag_physical_info").show();
	});	
	$("#storage_raidFormatNext31_button").click(function(){
		setSwitch('#storage_raidFormatR12R5AutoRebuild32_switch',0);
		
		$("#Reformat_Dsk_Diag_R12R5").hide();
		$("#Reformat_Dsk_Diag_R12R5_Rebuild").show();
	});	
	
	//R12R5:Step 2
	$("#storage_raidFormatBack32_button").click(function(){
		$("#Reformat_Dsk_Diag_R12R5_Rebuild").hide();
		$("#Reformat_Dsk_Diag_R12R5").show();
	});	
	$("#storage_raidFormatNext32_button").click(function(){
		$("#Reformat_Dsk_Diag_R12R5_Rebuild").hide();
		$("#Reformat_Dsk_Diag_R12R5_Summary").show();
			
		$("#reformat_r12r5_summary_list").empty();
		var html_tr = INTERNAL_FMT_R12R5_Summary_List();
		$("#reformat_r12r5_summary_list").append(html_tr);
	});		
	
	//R12R5:Step 3
	$("#storage_raidFormatBack33_button").click(function(){
		$("#Reformat_Dsk_Diag_R12R5_Summary").hide();
		$("#Reformat_Dsk_Diag_R12R5_Rebuild").show();
	});	
	$("#storage_raidFormatNext33_button").click(function(){
		$("#Reformat_Dsk_Diag_R12R5_Summary").hide();
		$("#R12R5Disk_Diag_confirm").show();
	});
	
	//R12R5:Step 4
	$("#storage_raidFormatBack34_button").click(function(){
		$("#R12R5Disk_Diag_confirm").hide();
		$("#Reformat_Dsk_Diag_R12R5_Summary").show();
	});	
	$("#storage_raidFormatFinish34_button").click(function(){
		stop_web_timeout(true);
		
		$("#R12R5Disk_Diag_confirm").hide();
		$("#Reformat_Dsk_Diag_Wait").show();
		$("#div_reamin").hide();
		
		INTERNAL_FMT_DiskMGR_R12R5();	 
	});		
	
	//RAID Expansion : Expansion 2R1 List
	$("#storage_raidFormatBack40_button").click(function(){
		$("#dskDiag_raidmode_set").show();
		$("#RAIDExpansion_2R1_List").hide();
	});		
	
	$("#storage_raidFormatNext40_button").click(function(){
		for(var i=0;i<FMT_RAIDEXPAN_VOLUME_INFO.length;i++)
		{
			if (parseInt(FMT_RAIDEXPAN_VOLUME_INFO[i][7], 10) == 1)
			{
				INTERNAL_RaidExpan_ReplaceHD(parseInt(FMT_RAIDEXPAN_VOLUME_INFO[i][6],10));
				break;
			}
		}
		
		$("#RAIDExpansion_2R1_List").hide();
		$("#RAIDExpansion_ReplaceHD").show();
	});	
	
	//RAID Expansion : Replace HD
	$("#storage_raidFormatBack41_button").click(function(){
		
		if (FMT_RAIDEXPAN_VOLUME_INFO.length == 1)
			$("#dskDiag_raidmode_set").show();
		else
			$("#RAIDExpansion_2R1_List").show();			
			
		$("#RAIDExpansion_ReplaceHD").hide();
	});	
	$("#storage_raidFormatNext41_button").click(function(){
		
		var my_replaceHD = 0;
		var my_raidlevel = "";
		for(var i=0;i<FMT_RAIDEXPAN_VOLUME_INFO.length;i++)
		{
			if (parseInt(FMT_RAIDEXPAN_VOLUME_INFO[i][7], 10) == 1)
			{
				my_raidlevel = FMT_RAIDEXPAN_VOLUME_INFO[i][1];
				my_replaceHD = FMT_RAIDEXPAN_VOLUME_INFO[i][6];
				break;
			}
		}
		
		if ( parseInt(my_replaceHD, 10) == 1)//replace HD
		{
			var _tpl = "{0}{1}<br><br>";
			var my_desc = String.format(_tpl,
			/*0*/	(my_raidlevel == "raid1")? _T('_raid','desc83'):_T('_raid','desc48'), 
			/*1*/	_T('_raid','desc109'));
			$("#RAIDExpansion_ReplaceHD_confirm_desc").html(my_desc);
			
			$("#RAIDExpansion_ReplaceHD").hide();
			$("#RAIDExpansion_ReplaceHD_confirm").show();
		}
		else
		{
			for(var i=0;i<FMT_RAIDEXPAN_VOLUME_INFO.length;i++)
			{
				if (parseInt(FMT_RAIDEXPAN_VOLUME_INFO[i][7], 10) == 1)
				{
					var silder_desc = "Volume_"+ FMT_RAIDEXPAN_VOLUME_INFO[i][0]+"("+INTERNAL_FMT_Convert_Device_Name(1,FMT_RAIDEXPAN_VOLUME_INFO[i][3])+")";
					$("#expan_desc_slider").empty().html(silder_desc);

					var min_hd_size_info = raid_get_min_hd_size_info(FMT_RAIDEXPAN_VOLUME_INFO[i][3]);
					var my_dev_hd_count = min_hd_size_info[0];
					var my_dev_min_hd_size = min_hd_size_info[1];
					var my_dev_total_size = min_hd_size_info[2];

					var my_slider_min_value = parseInt(FMT_RAIDEXPAN_VOLUME_INFO[i][12], 10) + (5*Math.pow(1024, 3)); // set min = min_req_size + 5GiB. at lease expand 5GiB for each disk
					var my_slider_max_value = my_dev_min_hd_size - (5*Math.pow(1024, 3)); // set max = disk_size - 5GiB

					$("#RAIDExpansion_raidsize_set table").show();
					$("#RAIDExpansion_raidsize_set .vol_no_enough_space_text").hide();
					$("#storage_raidFormatNext42_button").removeClass("grayout");
					if (my_slider_min_value > my_slider_max_value)
					{
						$("#RAIDExpansion_raidsize_set table").hide();
						$("#RAIDExpansion_raidsize_set .vol_no_enough_space_text").show();
						$("#storage_raidFormatNext42_button").removeClass("grayout").addClass("grayout");
					}
					
					function slider_fn(val)
					{
						var expand_size = 0;
						var reminder_size = 0;

						FMT_RAIDEXPAN_VOLUME_INFO[i][13] = 0;
						if (val == my_slider_max_value){
							FMT_RAIDEXPAN_VOLUME_INFO[i][13] = 1;
							reminder_size = my_dev_total_size - (my_dev_min_hd_size * my_dev_hd_count);
						}else{
							reminder_size = my_dev_total_size - (val * my_dev_hd_count);
						}

						val -= (3*Math.pow(1024, 3)); // size = size - swap(2Gib) - hidden(1GiB)
						if (FMT_RAIDEXPAN_VOLUME_INFO[i][1] == "raid1")
							expand_size = val;
						else if (FMT_RAIDEXPAN_VOLUME_INFO[i][1] == "raid5")
							expand_size = val * (my_dev_hd_count-1);
						//else if (FMT_RAIDEXPAN_VOLUME_INFO[i][1] == "raid6")
						//	expand_size = val * (my_dev_hd_count-2);
						expand_size = parseInt(size2str(expand_size, "GB", false), 10);
						FMT_RAIDEXPAN_VOLUME_INFO[i][9] = expand_size;

						var spanning_desc = String.format("{0} : {1} GB", _T('_format','raid_description10'), parseInt(size2str(reminder_size, "GB", false), 10));
						$("#RAIDExpansion_RemainSize").html(spanning_desc);
						$("#expan_silder_right").html(expand_size + " GB");
					}
					slider_fn(my_slider_min_value);

					$("#expan_slider").slider({
						range: "min",
						value: my_slider_min_value,
						min: my_slider_min_value,
						max: my_slider_max_value,
						slide: function(event, ui) {
							slider_fn(ui.value);
						}
					});

					break;
				}
			}
			
			$("#RAIDExpansion_ReplaceHD").hide()
			$("#RAIDExpansion_raidsize_set").show();
		}		
	});	
	
	//RAID Expansion : No Replace HD / RAID Size Set
	$("#storage_raidFormatBack42_button").click(function(){
		$("#RAIDExpansion_raidsize_set").hide();
		$("#RAIDExpansion_ReplaceHD").show()
	});		
	
	$("#storage_raidFormatNext42_button").click(function(){	
		if ($(this).hasClass('grayout')) return;

		var html_tr = INTERNAL_RaidExpan_Summary_List();
		$("#expan_summary_list").empty().html(html_tr);
		
		$("#RAIDExpansion_raidsize_set").hide();
		$("#RAIDExpansion_Summary").show();
	});	
	
	//RAID Expansion : No Replace HD / Summary 
	$("#storage_raidFormatBack43_button").click(function(){
		$("#RAIDExpansion_Summary").hide();
		$("#RAIDExpansion_raidsize_set").show();
	});		
	
	$("#storage_raidFormatNext43_button").click(function(){	
		
		var my_raidecpan_info = new Array();	
		for (var idx=0; idx<FMT_RAIDEXPAN_VOLUME_INFO.length; idx++ )
		{
					if ( parseInt(FMT_RAIDEXPAN_VOLUME_INFO[idx][7],10) == 1)	 my_raidecpan_info = FMT_RAIDEXPAN_VOLUME_INFO[idx];
		}
		
		jLoading(_T('_common','set'), 'loading' ,'s', ''); 
		
		window.setTimeout(function() {
				INTERNAL_RaidExpan_diskmgr(my_raidecpan_info.toString());
		},500);
		
	});
	
	//R12STD: 2 RAID1 List 
	$("#storage_raidFormatBack44_button").click(function(){
		$("#R12STD_list").hide();
		$("#dskDiag_raidmode_set").show();
	});		
	
	$("#storage_raidFormatNext44_button").click(function(){	
		var str = "";
		for(var i=0;i<FMT_R12STD_VOLUME_INFO.length;i++)
		{
			if ( parseInt(FMT_R12STD_VOLUME_INFO[i][3],10) == 1)
			{
				str = FMT_R12STD_VOLUME_INFO[i][2].toString();
			}
		}
		var html_tr = INTERNAL_R12STD_HD_Set(str);
		$("#r12std_primaary_hd_list").empty().html(html_tr);
		
		$("input:checkbox").checkboxStyle();
		
		$("#R12STD_list").hide();
		$("#R12STD_primaary_hd_list").show();
	});
	
	
	//R12STD: primary drive list to select
	$("#storage_raidFormatBack45_button").click(function(){
		$("#R12STD_primaary_hd_list").hide();
		$("#dskDiag_raidmode_set").show();
	});		
	
	$("#storage_raidFormatNext45_button").click(function(){	
		jLoading(_T('_common','set'), 'loading' ,'s', ''); 
		
		window.setTimeout(function() {
						
			for(var i=0;i<FMT_R12STD_VOLUME_INFO.length;i++)
			{
				if ( parseInt(FMT_R12STD_VOLUME_INFO[i][3],10) == 1)
				{
					INTERNAL_R12STD_diskmgr(FMT_R12STD_VOLUME_INFO[i].toString());
				}
			}
			
		},500);
	});	
	
	$("#storage_raidFormatBack46_button").click(function(){
		$("#RAIDExpansion_ReplaceHD_confirm").hide();
		$("#RAIDExpansion_ReplaceHD").show();
	});	
	$("#storage_raidFormatFinish46_button").click(function(){
			
		var my_raidecpan_info = new Array();	
		for (var idx=0; idx<FMT_RAIDEXPAN_VOLUME_INFO.length; idx++ )
		{
					if ( parseInt(FMT_RAIDEXPAN_VOLUME_INFO[idx][7],10) == 1)	 my_raidecpan_info = FMT_RAIDEXPAN_VOLUME_INFO[idx];
		}
			
		jLoading(_T('_common','set'), 'loading' ,'s', ''); 
		
		window.setTimeout(function() {
				INTERNAL_RaidExpan_diskmgr(my_raidecpan_info.toString());
		},500);
	});
	
	//R5Expand: Summary -> DST
	$("#storage_raidFormatBack35_button").click(function(){
		$("#RAIDExpansion_R5Expand_Summary").hide();
		$("#dskDiag_physical_info").show();
	});

	//R5Expand: Confirm -> Summary
	$("#storage_raidFormatBack36_button").click(function(){
		$("#RAIDExpansion_R5Expand_confirm").hide();
		$("#RAIDExpansion_R5Expand_Summary").show();
	});
	
	//R5Expand: Confirm -> Summary
	$("#storage_raidFormatNext46_button").click(function(){
		$("#RAIDExpansion_R5Expand_Summary").hide();
		$("#RAIDExpansion_R5Expand_confirm").show();
	});

	$("#storage_raidFormatFinish47_button").click(function(){
		jLoading(_T('_common','set'), 'loading' ,'s', ''); 
		window.setTimeout(function() {
			INTERNAL_RaidExtend_diskmgr(FMT_RAIDEXPAN_VOLUME_INFO.toString());
		},500);
	});

	$("#storage_raidFormatShutDown49_button").click(function(){
		if (intervalId != 0) clearInterval(intervalId);
		if (RAID_VolList_timeoutId != 0 ) clearTimeout(RAID_VolList_timeoutId);
		FMTObj.close();
		
		jAlert( _T('_system','msg4'), "note", null, function(){
				$("#storage_raidFormatShutDown49_button").hide();
				$("#Storage_RAIDFormatShutdown1_Span").hide();
				$('#Storage_RAIDFormatShutdown1_Div').empty().html(_T('_utilities','msg3'));
				
				FMTObj.load();
				$("#formatdsk_Diag").center();
				wd_ajax({
					type:"POST",
					async: false,
					cache: false,
					url: "/cgi-bin/system_mgr.cgi",
					data: "cmd=cgi_shutdown"
				});//end of .ajax...
					
		});
	});	
}
