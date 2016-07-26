var FMT_REMAIN_DATA_INIT = 0;
var FREE_REMAIN_HD_INFO = new Array();	
function INTERNAL_Remain_Physical_Disk_List(my_scsi)
{
	var result_have_bad = false;

	if ($('#remaindsk_hd_info > tbody > tr').length == 0)
	{
		$("#remaindsk_hd_info").flexigrid({
			url: '/cgi-bin/smart.cgi',
			dataType: 'xml',
			cmd: 'cgi_RAID_HD_Info',
			colModel : [
				{display: "--", name :'my_icon', width :40, align: 'center'},				//Text:icon
				{display: "Drive", name : 'my_drive', width :150, align: 'left'},			//Text:Drive 1(2-4)
				{display: "Size", name : 'my_size', width :190, align: 'left'},				//Text:HD Size
				{display: "Status", name : 'my_status', width :120, align: 'right'}			//Text:Status:Good/Bad
				],
			usepager: false,       //啟用分頁器
			useRp: true,
			rp: 10,               //預設的分頁大小(筆數)
			showTableToggleBtn: true,
			width:  500,
			height: 'auto',
			errormsg: _T('_common','connection_error'),		//Text:Connection Error
			nomsg: _T('_common','no_items'),				//Text:No items
			singleSelect:true,
			f_field:my_scsi,
			striped:true,   //資料列雙色交差
			resizable: false,
			noSelect:true,
			onSuccess:function(){
				$('#remaindsk_hd_info > tbody > tr td:nth-child(1) div').each(function(n){
					$(this).css('padding-top','5px');
				});

				if (!result_have_bad)
					$("#storage_raidRemainNext1_button").removeClass("grayout");
			},//end of success
			preProcess: function(r) {
				$(r).find('row').each(function(idx){
					//disk
					var my_disk = $(this).find('cell').eq(1).text().replace(/Disk/,_T('_disk_mgmt','desc1'));
					$(this).find('cell').eq(1).text(my_disk);
					
					//size
					var my_size = size2str((parseInt($(this).find('cell').eq(2).text(), 10) * 1024));
					$(this).find('cell').eq(2).text(my_size);

					//status
					if ($(this).find('cell').eq(3).text().indexOf("Bad") != -1 && !result_have_bad)
						result_have_bad = true;

					var my_status = $(this).find('cell').eq(3).text()
					.replace(/Good/,_T('_disk_mgmt','desc8')).replace(/Bad/,_T('_disk_mgmt','desc9'));
					$(this).find('cell').eq(3).text(my_status);
   	 	 		});//end of each 
	   	 	 		
	   	 	 	$("#remain_icon_loading").hide();
				$("#remaindsk_hd_info").show();
				
	   	 	 	return r;
	   	 	}	
		});  //ens of ajax
	}
	else
	{
		$("#formatdsk_hd_info").flexOptions({ f_field: my_scsi }).flexReload();
	}		
}
function INTERNAL_Free_Remain_HD_Info(dev,free_size)
{
	var my_len = 0;
	
	for (var i=0;i<FMT_HD_INFO.length;i++)
	{
			if ( FMT_HD_INFO[i][0].toString() == dev )
			{
				my_len = FREE_REMAIN_HD_INFO.length;
				
				FREE_REMAIN_HD_INFO[my_len] = new Array();
				FREE_REMAIN_HD_INFO[my_len][0] = FMT_HD_INFO[i][0];		//device_name
				FREE_REMAIN_HD_INFO[my_len][1] = FMT_HD_INFO[i][1];		//scsi
				FREE_REMAIN_HD_INFO[my_len][2] = FMT_HD_INFO[i][2];		//vendor
				FREE_REMAIN_HD_INFO[my_len][3] = FMT_HD_INFO[i][3];		//model
				FREE_REMAIN_HD_INFO[my_len][4] = FMT_HD_INFO[i][4];		//hd_serial
				FREE_REMAIN_HD_INFO[my_len][5] = FMT_HD_INFO[i][5];		//hd_size
				FREE_REMAIN_HD_INFO[my_len][6] = free_size;				//free size
				FREE_REMAIN_HD_INFO[my_len][7] = 0;						//status
			}
	}
}

function INTERNAL_Update_Free_Remain_HD_Info(dev)
{
	for (var i=0;i<FREE_REMAIN_HD_INFO.length;i++)
	{
		if ( FREE_REMAIN_HD_INFO[i][0] == dev)
		{
			FREE_REMAIN_HD_INFO[i][7] = 1;
			break;
		}
	}
}

function INTERNAL_Check_Free_Remain_HD_Info(dev)
{
	for (var i=0;i<FREE_REMAIN_HD_INFO.length;i++)
	{
		if ( FREE_REMAIN_HD_INFO[i][0] == dev)
		{
			return 1;
		}
	}
	
	return 0;
}

function INTERNAL_Check_Unuse_Device(str)
{
	var j = 3;
	var tmp="";
	
	for (var i=0;i<str.length;i=i+3)
	{
		tmp = str.slice(i,j);
		
		if (INTERNAL_Check_Free_Remain_HD_Info(tmp) == 0)
		{
			return 0;
		}
		
		j = j+3;
	}
	
	//Update Unuse device
	j=3;i=0;
	for (var i=0;i<str.length;i=i+3)
	{
		tmp = str.slice(i,j);
		INTERNAL_Update_Free_Remain_HD_Info(tmp);
		j = j+3;
	}
	return 1;	
}

function INTERNAL_Check_Use_Device(str1,str2)
{
	var j = 3;
	var tmp="";
	
	for (var i=0;i<str1.length;i=i+3)
	{
		tmp = str1.slice(i,j);
		
		if (tmp == str2)
		{
			return 1;
		}
		
		j = j+3;
	}
	
	return 0;
}

function INTERNAL_Get_Device_Free_Size(dev)
{
	var my_dev_free_size = 0;
	for(var i=0;i<FREE_REMAIN_HD_INFO.length;i++)
	{
		if( FREE_REMAIN_HD_INFO[i][0] == dev )
		{
			my_dev_free_size = FREE_REMAIN_HD_INFO[i][6];
			break;
		}
	}

	return my_dev_free_size;
}

function INTERNAL_Get_Linear_Size(dev)
{
	var j = 3;
	var my_sum = 0;
	var tmp="";
	
	for (var i=0;i<dev.length;i=i+3)
	{
		tmp = dev.slice(i,j);
		
		my_sum = parseInt(my_sum) + parseInt(INTERNAL_Get_Device_Free_Size(tmp));
		
		j = j+3;
	}
	
	return my_sum;	
}

function INTERNAL_Pair_Dev_To_Linear(dev)
{
	var my_len = CREATE_VOLUME_INFO.length;
	var my_device = "",my_vol = "",my_filesystem="",my_size="",my_mode="";
	
	for(var i=0;i<CREATE_VOLUME_INFO.length;i++)
	{
		if (CREATE_VOLUME_INFO[i][4] == 0)
		{
				my_device = CREATE_VOLUME_INFO[i][3];
			
				if ( (INTERNAL_Check_Use_Device(my_device,dev) == 1) && 
					 (INTERNAL_Check_Unuse_Device(my_device) == 1))
				{
					my_vol = INTERNAL_Get_Free_SharedName();
					my_mode = CREATE_VOLUME_INFO[i][1];
					
					if (parseInt(my_vol) != 0 &&  my_mode != "standard")
					{
						my_filesystem = CREATE_VOLUME_INFO[i][2];
						my_size = INTERNAL_Get_Linear_Size(my_device);
						
						CREATE_VOLUME_INFO[my_len] = new Array();
						CREATE_VOLUME_INFO[my_len][0] = my_vol;
						CREATE_VOLUME_INFO[my_len][1] = "linear";
						CREATE_VOLUME_INFO[my_len][2] = my_filesystem;
						CREATE_VOLUME_INFO[my_len][3] = my_device;
						CREATE_VOLUME_INFO[my_len][4] = my_size;
						CREATE_VOLUME_INFO[my_len][5] = 1;
						
						INTERNAL_Update_Free_SharedName(my_vol);
					}
					
					break;	
				}
		}
	}
}

function INTERNAL_Free_SharedName_Init()
{	
	var my_sharedname_tmp = new Array(0,0,0,0);
	var my_sharedname = new Array();
	
	if(typeof USED_VOLUME_INFO == 'undefined')  INTERNAL_FMT_Load_USED_VOLUME_INFO();
				
	$('item', USED_VOLUME_INFO).each(function(e){
		
		var my_volume = $('volume',this).text();
		var my_idx = parseInt(my_volume) - 1;
		my_sharedname_tmp[my_idx] = 1 ;
		
	});	//end of each
	
	for(var i=0;i<my_sharedname_tmp.length;i++)
	{
		var my_volume_state = my_sharedname_tmp[i].toString();
		var my_len = my_sharedname.length;
		if (parseInt(my_volume_state) == 0)
		{
			my_sharedname[my_len] = new Array();
			my_sharedname[my_len][0] = (i+1);	//Volume Name,ex:1,2,3,4
			my_sharedname[my_len][1] = 0;		//Volume Name State,ex:0 -> unuse;1-> used
		}	
			
	}
	
	return my_sharedname;
}

function INTERNAL_Get_Free_SharedName()
{	
	var my_volume = 0;
	
	for(var i=0;i<FMT_Free_SHAREDNAME.length;i++)
	{
		if (FMT_Free_SHAREDNAME[i][1] == 0)
		{
			my_volume = FMT_Free_SHAREDNAME[i][0];
			break;
		}
	}
	
	return my_volume;
}

function INTERNAL_Update_Free_SharedName(vol)
{	
	var my_volume = 0;
	
	for(var i=0;i<FMT_Free_SHAREDNAME.length;i++)
	{
		if (FMT_Free_SHAREDNAME[i][0] == vol)
		{
			FMT_Free_SHAREDNAME[i][1] = 1;
			break;
		}
	}
	
	return my_volume;
}

function INTERNAL_Remain_Summary_List()
{
	var html_tr = "";
	var j=0;
	
	for(var i=0;i<CREATE_VOLUME_INFO.length;i++)
	{	
		if ((j%2)==0)
			html_tr += "<tr id=\"row"+j+"\">";
		else
			html_tr += "<tr id=\"row"+j+"\" class=\"erow\">";
		
		if ( FUN_VOLUME_ENCRYPTION == 1 )
		{
			//Volume Encryption icon
			if (CREATE_VOLUME_INFO[i][6].toString() == "1")
				html_tr += "<td><div class=\"tip tip_ve_enable\" style=\"text-align: left; width: 22px;\"><IMG width=\"22px;\" src='/web/images/RAID/raidstatusicon_encrypted_selected.png'></div></td>";	
			else
				html_tr += "<td><div class=\"tip tip_ve_disable\" style=\"text-align: left; width: 22px;\"><IMG width=\"22px;\" src='/web/images/RAID/raidstatusicon_encrypted_normal.png'></div></td>";
			
			//Volume Encryption / Auto-mount icon
			if ( (CREATE_VOLUME_INFO[i][6].toString() == "1") && ( CREATE_VOLUME_INFO[i][7].toString() == "1"))
				html_tr += "<td><div class=\"tip tip_am_enable\" style=\"text-align: left; width: 22px;\"><IMG width=\"22px;\" src='/web/images/RAID/raidstatusicon_automount_selected.png'></div></div></td>";	
	 		else  
				html_tr += "<td><div class=\"tip tip_am_disable\" style=\"text-align: left; width: 22px;\"><IMG width=\"22px;\" src='/web/images/RAID/raidstatusicon_automount_normal.png'></div></td>";		
		}	
		var my_volume_name = CREATE_VOLUME_INFO[i][0].toString().replace(/1/g,"Volume_1").replace(/2/g,"Volume_2").replace(/3/g,"Volume_3").replace(/4/g,"Volume_4");
		var my_raidlevel = INTERNAL_RaidLeve_HTML(CREATE_VOLUME_INFO[i][1].toString());	
		var my_file_system = INTERNAL_File_System_HTML(CREATE_VOLUME_INFO[i][2].toString());	
		
		html_tr += "<td><div style=\"text-align: left; width: 90px;\">" + my_volume_name + "</div></td>";
		html_tr += "<td><div style=\"text-align: left; width: 110px;\">" + my_raidlevel + "</div></td>";
		html_tr += "<td><div style=\"text-align: left; width: 72px;\">" + my_file_system + "</div></td>";
		html_tr += "<td><div style=\"text-align: left; width: 80px;\">" + CREATE_VOLUME_INFO[i][4] + " GB</div></td>";	
		html_tr += "<td><div style=\"text-align: left; width: 200px;\">" + INTERNAL_FMT_Convert_Device_Name(1,CREATE_VOLUME_INFO[i][3]) + "</div></td>";
		html_tr  += "</tr>";
		j++;
	}	
	
	return html_tr;
}

function INTERNAL_Remain_VE_Selected(my_volume,my_input_name)
{
	var my_ve = $("input[name='"+my_input_name+"']:checked").val();
	var my_ve_selected = 0;
	
	if (parseInt(my_ve) == 1) 
	{
		jAlert( _T('_format','msg16'), _T('_common','info'));	//Text:Enabling this option may impact the throughput of the device significantly.
		my_ve_selected = 1;
	}	
	else
		my_ve_selected = 0;
	
	for(var i=0;i<CREATE_VOLUME_INFO.length;i++)
	{
		if ( parseInt(CREATE_VOLUME_INFO[i][0]) == parseInt(my_volume))
		{
			CREATE_VOLUME_INFO[i][6] = my_ve_selected;
			break;
		}
	}
}

function INTERNAL_Remain_VE_Switch_Click(vol, val)
{
	if (vol.length == 0 || val.length ==0) return;
	
	var my_button_id_l = "#Remian_RAIDEncrytionVol_" + vol + "_l";
	var my_button_id_r = "#Remian_RAIDEncrytionVol_" + vol + "_r";
	
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
			CREATE_VOLUME_INFO[i][6] = val;
			break;
		}
	}	
}
function INTERNAL_Remain_VE_Switch(n)
{
	var html_tr = "";
	
	html_tr += "<div style=\"padding:7px 0px 0px 0px;\">";
	html_tr += "<button class=\"left_button tip\" id=\"Remian_RAIDEncrytionVol_"+n+"_l\" onclick=\"INTERNAL_Remain_VE_Switch_Click('"+n+"','1')\"><img src=\"/web/images/RAID/lock.png\" width=\"26px\"></button>";
	html_tr += "<button class=\"sel right_button tip\" id=\"Remian_RAIDEncrytionVol_"+n+"_r\"  onclick=\"INTERNAL_Remain_VE_Switch_Click('"+n+"','0')\"><img src=\"/web/images/RAID/unlock.png\" width=\"26px\"></button>";
	html_tr += "</div>";
	
	return html_tr;
}
function INTERNAL_Remain_VE_List()
{
	var html_tr = "";
	var j=0;
	
	for (var i=0;i<CREATE_VOLUME_INFO.length;i++)
	{
 		if ( parseInt(CREATE_VOLUME_INFO[i][5], 10) == 1)
 		{
 			if ((j%2)==0)
 				html_tr += "<tr id=\"row"+j+"\">";
 			else
 				html_tr += "<tr id=\"row"+j+"\" class=\"erow\">";
 			
 			var my_volume_name = CREATE_VOLUME_INFO[i][0].toString().replace(/1/g,"Volume_1").replace(/2/g,"Volume_2").replace(/3/g,"Volume_3").replace(/4/g,"Volume_4");
			html_tr += "<td><div style=\"text-align: left; width: 40px;\"><img width=\"20px\" border=\"0\" src=\"/web/images/LightningIcon_Volumes_NORM40X36.png\"></div></td>";
			
			var my_raidlevel = INTERNAL_RaidLeve_HTML(CREATE_VOLUME_INFO[i][1].toString());	
			var my_file_system = INTERNAL_File_System_HTML(CREATE_VOLUME_INFO[i][2].toString());	
 			html_tr += "<td><div style=\"text-align: left; width: 98px;\">" + my_volume_name + "</div></td>";	
 			
 			if ( (CREATE_VOLUME_INFO[i][1].toString() == "raid5") && (CREATE_VOLUME_INFO[i][5].toString() != "none"))
 				html_tr += "<td><div style=\"text-align: left; width: 80px;\">" + my_raidlevel + "<font color=\"#FF0000\">+ Spare</font></div></td>";
 			else
 				html_tr += "<td><div style=\"text-align: left; width: 80px;\">" + my_raidlevel + "</div></td>";
 				
 			html_tr += "<td><div style=\"text-align: left; width: 80px;\">" + CREATE_VOLUME_INFO[i][4] + " GB</div></td>";
 			
 			html_tr += "<td>"+ INTERNAL_Remain_VE_Switch(parseInt(CREATE_VOLUME_INFO[i][0].toString(),10))+"</td>";
 			
 			html_tr  += "</tr>";
 			j++;
 		}
 	}
 	
 	return html_tr;	
}

function INTERNAL_Remain_VE_Num()
{
	var num = 0;
	
	for (var i=0;i<CREATE_VOLUME_INFO.length;i++)
	{
		if (parseInt(CREATE_VOLUME_INFO[i][5].toString()) == 1)
		{
			if (parseInt(CREATE_VOLUME_INFO[i][6].toString()) == 1 ) num++;
		}	
	}
	
	return num;
}

function INTERNAL_Remain_VE_Get_Info(my_no)
{
	var ve_list = new Array();
	var j=0;
	for (var i=0;i<CREATE_VOLUME_INFO.length;i++)
	{
		if (parseInt(CREATE_VOLUME_INFO[i][5].toString(), 10) == 1)
		{
			if (parseInt(CREATE_VOLUME_INFO[i][6].toString(), 10) == 1 ) 
			{
				ve_list[j] = new Array();
				ve_list[j][0] = CREATE_VOLUME_INFO[i][0].toString();
				ve_list[j][1] = CREATE_VOLUME_INFO[i][6].toString();
				ve_list[j][2] = CREATE_VOLUME_INFO[i][7].toString();
				ve_list[j][3] = CREATE_VOLUME_INFO[i][8].toString();
				j++;
			}
		}	
	}
	
	return ve_list[parseInt(my_no, 10)];
}

function INTERNAL_Remain_VE_Set_Info(my_vol,my_encryption,my_auto_mount,my_pwd)
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
			CREATE_VOLUME_INFO[i][6] = my_encryption;
			CREATE_VOLUME_INFO[i][7] = my_auto_mount;
			CREATE_VOLUME_INFO[i][8] = my_pwd;
			break;
		}
	}
}

function INTERNAL_FMT_Remain_DiskMGR()
{
	wd_ajax({
	type: "POST",
	url: "/cgi-bin/hd_config.cgi",
	data:{cmd:'cgi_FMT_Remain_DiskMGR',f_create_volume_info:CREATE_VOLUME_INFO.toString()},
	dataType: "xml",
	success: function(xml) {	  	  	
	    
	    var res =  $(xml).find("res").text(); 
	    
	    if (res == 1)
	    {
	    	$("#Remain_Dsk_Diag_Wait").hide();
	    	$("#Remain_Dsk_Diag_Bar").show();
			
			INTERNAL_FMT_ProgressBar_INIT(0,"remain");
			if (intervalId != 0) clearInterval(intervalId);
			intervalId = setInterval("INTERNAL_FMT_Show_Bar('remain')",3000);
	    }         
	                                   
	 }//end of success
	 
	});	//end of ajax  
}
function FMT_Remain_Data_Init(fmt_step)
{	
	/*
		fmt_step:
		0 -> remain diag init
		1 -> remain diag init ok
		2 -> check remain 
	*/
	
	switch(parseInt(fmt_step, 10))
	{
		case 0:
			if ( RAID_VolList_timeoutId != 0 ) clearTimeout(RAID_VolList_timeoutId);	//stop auto refresh in RAID List
		break;
		
		case 1:
			FMT_REMAIN_DATA_INIT = 1;
			return;
		break;
	}
	FMT_HD_INFO = INTERNAL_Get_HD_Info();

	FMT_Free_SHAREDNAME = new Array();	
	FMT_Free_SHAREDNAME = INTERNAL_Free_SharedName_Init();

	FREE_REMAIN_HD_INFO = new Array();
	
	if(typeof UNUSED_VOLUME_INFO == 'undefined')  INTERNAL_FMT_Load_UNUSED_VOLUME_INFO();
	if(typeof USED_VOLUME_INFO == 'undefined')  INTERNAL_FMT_Load_USED_VOLUME_INFO();
	
	//Physical Disk Info
	$('unused_volume_info > item', UNUSED_VOLUME_INFO).each(function(e){
		var my_partition = $('partition',this).text(); 
		var my_size = INTERNAL_FMT_Get_Gibytes($('size',this).text(),1); 
		var my_dev = "";
		
		if (my_partition.length == 4)
		{
			my_dev  =  my_partition.slice(0,3);
			INTERNAL_Free_Remain_HD_Info(my_dev,my_size);
		}
		
	});	//end od each	
		
	//Physical Disk info
	var my_hd_info = new Array();
	hd_info = FREE_REMAIN_HD_INFO;
	var my_scsi = "";
	for (var i=0;i<hd_info.length;i++)
	{
		my_scsi += hd_info[i][1];
	}
	var html_tr = INTERNAL_Remain_Physical_Disk_List(my_scsi);
	$("#remain_physical_dsk_list").append(html_tr);
	
	CREATE_VOLUME_INFO = new Array();
	//remain volume info
	$('volume_info > item', USED_VOLUME_INFO).each(function(e){
		
		var my_raid_mode = $('raid_mode',this).text();
		var my_len = CREATE_VOLUME_INFO.length;
		var my_volume = $('volume',this).text();
		var my_file_type = $('file_type',this).text();
		var my_dev = $('device',this).text();
		
		CREATE_VOLUME_INFO[my_len] = new Array();
		CREATE_VOLUME_INFO[my_len][0] = my_volume;		//Volume Name,ex:1,2,3,4
		CREATE_VOLUME_INFO[my_len][1] = my_raid_mode;	//RAID mode,ex:linear
		CREATE_VOLUME_INFO[my_len][2] = my_file_type;	//File Tyle,ex:ext3,ext4
		CREATE_VOLUME_INFO[my_len][3] = my_dev;			//device,ex:sda,sdasdb,sdasdbsdc,sdasdnsdcsdd
		CREATE_VOLUME_INFO[my_len][4] = 0;				//free size,unit is block
		CREATE_VOLUME_INFO[my_len][5] = (parseInt(fmt_step,10) == 2)?1:0;				//state,0:don't create,1:create
		
	});	//end od each	
	var my_dev = "";
	for (var i=0;i<FREE_REMAIN_HD_INFO.length;i++)
	{
		if (FREE_REMAIN_HD_INFO[i][7] == 0)
		{
			my_dev = FREE_REMAIN_HD_INFO[i][0];
			INTERNAL_Pair_Dev_To_Linear(my_dev);
		}	
	}
	
	//restort CREATE_VOLUME_INFO[x][y],remove don't create volume
	var my_create_info = new Array();
	var my_len = 0;
	for(i=0;i<CREATE_VOLUME_INFO.length;i++)
	{
		if (CREATE_VOLUME_INFO[i][5] == 1)
		{
			my_len = my_create_info.length;
		
			my_create_info[my_len] = new Array();
			my_create_info[my_len][0] = CREATE_VOLUME_INFO[i][0].toString();	//Volume Name,ex:1,2,3,4	
			my_create_info[my_len][1] = CREATE_VOLUME_INFO[i][1].toString();	//RAID mode,ex:linear
			my_create_info[my_len][2] = CREATE_VOLUME_INFO[i][2].toString();	//File Tyle,ex:ext3,ext4
			my_create_info[my_len][3] = CREATE_VOLUME_INFO[i][3].toString();	//device,ex:sda,sdasdb,sdasdbsdc,sdasdnsdcsdd
			my_create_info[my_len][4] = CREATE_VOLUME_INFO[i][4].toString();	//free size,unit is block
			my_create_info[my_len][5] = CREATE_VOLUME_INFO[i][5].toString();	//state,0:don'r create,1:create
			my_create_info[my_len][6] = "0";									//Volume Encryption State,ex:0->no,1->yes
			my_create_info[my_len][7] = "0";									//Volume Encryption Auto-Mount,ex:0->no,1->yes
			my_create_info[my_len][8] = "none";									//Volume Encryption pwd
		}
	}
	
	CREATE_VOLUME_INFO = my_create_info;
	
	setSwitch("#storage_raidRemainVE1stAutoMount7_switch",0);
	setSwitch("#storage_raidRemainVE2ndAutoMount8_switch",0);
	
	FMT_REMAIN_DATA_INIT = 1;
}

function init_remaindsk_dialog(fmt_step)
{
	$("#storage_raidRemainNext1_button").removeClass("grayout").addClass("grayout");
	$("#remaindsk_hd_info").hide();
	$("#remain_icon_loading").show();
	$("#remaindsk_hd_info").flexReload();
	if (parseInt(FMT_REMAIN_DATA_INIT, 10) != 1)
	{
		window.setTimeout("init_remaindsk_dialog()",500);
		return false;
	}
	
	adjust_dialog_size("#Remain_Dsk_Diag",750,450);
	var FMTObj = $("#Remain_Dsk_Diag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	switch(parseInt(fmt_step, 10))
	{
		case 1:
			INTERNAL_FMT_ProgressBar_INIT(0,"remain");
			if (intervalId != 0) clearInterval(intervalId);
			intervalId = setInterval("INTERNAL_FMT_Show_Bar('remain')",3000);
			
			INTERNAL_DIADLOG_DIV_HIDE('Remain_Dsk_Diag');
			$("#Remain_Dsk_Diag_Bar").show();
		break;
		
		case 2:
			INTERNAL_DIADLOG_DIV_HIDE('Remain_Dsk_Diag');
			var my_xml = INTERNAL_FMT_Load_DM_READ_STATE();
			if (my_xml != "")
			{
				var my_errcode = $(my_xml).find("dm_state").find("errcode").text();
				RAID_FormatResInfo("remain", "none", "Remain_Dsk_Diag_Res", my_errcode);
			}
		break;
		
		default:
			INTERNAL_DIADLOG_DIV_HIDE('Remain_Dsk_Diag');
			$("#Remain_Dsk_Diag_Physical_Info").show();
		break;
	}
	
	init_button();
	$("input:checkbox").checkboxStyle();
	$("input:password").inputReset();
	init_switch();
	init_tooltip();
	language();
	FMTObj.load();
	
	$("#Remain_Dsk_Diag .close").click(function(){
		if (intervalId != 0) clearInterval(intervalId);
		if (RAID_VolList_timeoutId != 0 ) clearTimeout(RAID_VolList_timeoutId);
		
		$("#vol_list").flexReload();
		
		INTERNAL_DIADLOG_DIV_HIDE('Remain_Dsk_Diag');
		INTERNAL_DIADLOG_BUT_UNBIND('Remain_Dsk_Diag');
		
		FMTObj.close();
	});
	
	//Re-main HD Diag - Physical Disk Info
	$("#storage_raidRemainNext1_button").click(function(){
		if ($(this).hasClass('grayout')) return;

		$("#Remain_Dsk_Diag_Physical_Info").hide();
		
		if ( FUN_VOLUME_ENCRYPTION == 1 )
		{ 
			var my_html_tr = INTERNAL_Remain_VE_List();
			$("#remain_volume_encryption_list").empty();
			$("#remain_volume_encryption_list").append(my_html_tr);
			
			$("#Remain_Dsk_Diag .left_button").attr('title',_T('_raid','desc72'));
			$("#Remain_Dsk_Diag .right_button").attr('title',_T('_raid','desc73'));
			init_tooltip(".tip");
			
			$("#Remain_Dsk_Diag_volume_encrpty_list").show();
		}
		else
		{
			var my_html_tr = INTERNAL_Remain_Summary_List();
			$("#remain_summary_list").empty();
			$("#remain_summary_list").append(my_html_tr);
			$("#Remain_Dsk_Diag_Summary").show();
		}		
	});
	
	//Re-main HD Diag Volume Encryption List
	$("#storage_raidRemainBack6_button").click(function(){ 
		$("#Remain_Dsk_Diag_volume_encrpty_list").hide();
		$("#Remain_Dsk_Diag_Physical_Info").show();
		
		for (var i=0;i<CREATE_VOLUME_INFO.length;i++)
		{
			CREATE_VOLUME_INFO[i][6] = "0";
			CREATE_VOLUME_INFO[i][7] = "0";
			CREATE_VOLUME_INFO[i][8] = "none";
		}	
	});
	
	$("#storage_raidRemainNext6_button").click(function(){
		$("#Remain_Dsk_Diag_volume_encrpty_list").hide();
		  
		var ve_num = INTERNAL_Remain_VE_Num();
		if (parseInt(ve_num, 10) == 0)
		{
			var my_html_tr = INTERNAL_Remain_Summary_List();
			$("#remain_summary_list").empty();
			$("#remain_summary_list").append(my_html_tr);
			
			$("#Remain_Dsk_Diag .tip_ve_enable").attr('title', _T('_raid','desc74'));
			$("#Remain_Dsk_Diag .tip_ve_disable").attr('title', _T('_raid','desc75'));
			$("#Remain_Dsk_Diag .tip_am_enable").attr('title', _T('_raid','desc76'));
			$("#Remain_Dsk_Diag .tip_am_disable").attr('title', _T('_raid','desc77'));
			init_tooltip(".tip");
			
			$("#Remain_Dsk_Diag_Summary").show();
		}
		else
		{
			var my_ve_1st_info = new Array();
			my_ve_1st_info = INTERNAL_Remain_VE_Get_Info(0);
			var my_vol = "Volume_"+ my_ve_1st_info[0];
			
			var my_desc = _T('_raid','desc52').replace('xxx', my_vol);
			$("#span_remain_1st_vol_desc").html(my_desc);
			$("#Remain_Dsk_Diag_volume_encrpty_1st").show();
		}		
	});		
	
	//Re-main HD Diag 1st Volume Encryption
	$("#storage_raidRemainBack7_button").click(function(){  
		$("#Remain_Dsk_Diag_volume_encrpty_1st").hide();
		$("#Remain_Dsk_Diag_volume_encrpty_list").show();
	});
	
	$("#storage_raidRemainNext7_button").click(function(){  
		var my_pwd = $("#storage_raidRemainVE1stPWD7_password").val();
		var my_confirm_pwd = $("#storage_raidRemainVE1stConfirmPWD7_password").val();
		if ( INTERNAL_FMT_VE_Check_Info(my_pwd,my_confirm_pwd) == 0) 
			return;
		else 
		{	
			var my_ve_1st_info = new Array();
			my_ve_1st_info = INTERNAL_Remain_VE_Get_Info(0);
			var my_auto_mount = getSwitch("#storage_raidRemainVE1stAutoMount7_switch");
			
			if ( my_auto_mount == "1")
				INTERNAL_Remain_VE_Set_Info(my_ve_1st_info[0].toString(),my_ve_1st_info[1].toString(),"1",my_pwd);
			else	
				INTERNAL_Remain_VE_Set_Info(my_ve_1st_info[0].toString(),my_ve_1st_info[1].toString(),"0",my_pwd);
					
			$("#Remain_Dsk_Diag_volume_encrpty_1st").hide();
			
			var ve_num = INTERNAL_Remain_VE_Num();
			if (parseInt(ve_num) == 2)
			{
				$("#Remain_Dsk_Diag_volume_encrpty_2nd").show();
				
				var my_ve_2nd_info = new Array();
				my_ve_2nd_info = INTERNAL_Remain_VE_Get_Info(1);
				var my_vol = "Volume_"+ my_ve_2nd_info[0];
				
				var my_desc = _T('_raid','desc52').replace("xxx", my_vol);
				$("#span_remain_2nd_vol_desc").html(my_desc);
				$("#Remain_Dsk_Diag_volume_encrpty_2nd").show();
			}
			else
			{
				var my_html_tr = INTERNAL_Remain_Summary_List();
				$("#remain_summary_list").empty();
				$("#remain_summary_list").append(my_html_tr);
				
				$("#Remain_Dsk_Diag .tip_ve_enable").attr('title', _T('_raid','desc74'));
				$("#Remain_Dsk_Diag .tip_ve_disable").attr('title', _T('_raid','desc75'));
				$("#Remain_Dsk_Diag .tip_am_enable").attr('title', _T('_raid','desc76'));
				$("#Remain_Dsk_Diag .tip_am_disable").attr('title', _T('_raid','desc77'));
				init_tooltip(".tip");
				
				$("#Remain_Dsk_Diag_Summary").show();
			}
		}		
	});		
	
	//Re-main HD Diag 2nd Volume Encryption
	$("#storage_raidRemainBack8_button").click(function(){  
		$("#Remain_Dsk_Diag_volume_encrpty_2nd").hide();
		$("#Remain_Dsk_Diag_volume_encrpty_1st").show();
		
		var my_ve_1st_info = new Array();
		my_ve_1st_info = INTERNAL_Remain_VE_Get_Info(0);
		var my_vol = "Volume_"+ my_ve_1st_info[0];
	});
	
	$("#storage_raidRemainNext8_button").click(function(){
		var my_pwd = $("#storage_raidRemainVE2ndPWD8_password").val();
		var my_confirm_pwd = $("#storage_raidRemainVE2ndConfirmPWD8_password").val();
		if ( INTERNAL_FMT_VE_Check_Info(my_pwd,my_confirm_pwd) == 0) 
			return;
		else 
		{
			var my_ve_2nd_info = new Array();
			my_ve_2nd_info = INTERNAL_Remain_VE_Get_Info(1);
			var my_auto_mount = getSwitch("#storage_raidRemainVE2ndAutoMount8_switch");
			
			if ( my_auto_mount == "1")
				INTERNAL_Remain_VE_Set_Info(my_ve_2nd_info[0].toString(),my_ve_2nd_info[1].toString(),"1",my_pwd);
			else	
				INTERNAL_Remain_VE_Set_Info(my_ve_2nd_info[0].toString(),my_ve_2nd_info[1].toString(),"0",my_pwd);
				
				 
			$("#Remain_Dsk_Diag_volume_encrpty_2nd").hide();
			 
			var my_html_tr = INTERNAL_Remain_Summary_List();
			$("#remain_summary_list").empty();
			$("#remain_summary_list").append(my_html_tr);
			
			$("#Remain_Dsk_Diag .tip_ve_enable").attr('title', _T('_raid','desc74'));
			$("#Remain_Dsk_Diag .tip_ve_disable").attr('title', _T('_raid','desc75'));
			$("#Remain_Dsk_Diag .tip_am_enable").attr('title', _T('_raid','desc76'));
			$("#Remain_Dsk_Diag .tip_am_disable").attr('title', _T('_raid','desc77'));
			init_tooltip(".tip");
			
			$("#Remain_Dsk_Diag_Summary").show();
		}
	});	
	
	//Re-main HD Diag Summary's button
	$("#storage_raidRemainBack2_button").click(function(){  
		$("#Remain_Dsk_Diag_Summary").hide();
		
		if ( FUN_VOLUME_ENCRYPTION == 1 )
		{
			var ve_num = INTERNAL_Remain_VE_Num();
			switch(parseInt(ve_num))
			{
				case 1:
					$("#Remain_Dsk_Diag_volume_encrpty_1st").show();
					
					var my_ve_1st_info = new Array();
					my_ve_1st_info = INTERNAL_Remain_VE_Get_Info(0);
					var my_vol = "Volume_"+ my_ve_1st_info[0];
					var re = /xxx/;
				break;
				
				case 2:
					$("#Remain_Dsk_Diag_volume_encrpty_2nd").show();
					
					var my_ve_2nd_info = new Array();
					my_ve_2nd_info = INTERNAL_Remain_VE_Get_Info(1);
					var my_vol = "Volume_"+ my_ve_2nd_info[0];
					var re = /xxx/;
				break;
				
				default:
					$("#Remain_Dsk_Diag_volume_encrpty_list").show();
				break;
			}
		}
		else
		{
			$("#Remain_Dsk_Diag_Physical_Info").show();		
		}	
	});		
	
	$("#storage_raidRemainNext2_button").click(function(){  
		
		stop_web_timeout(true);
		
		$("#Remain_Dsk_Diag_Summary").hide();
		$("#Remain_Dsk_Diag_Wait").show();
		
		INTERNAL_FMT_Remain_DiskMGR();
	});	
	
	$("#storage_raidRemainFinish5_button").click(function(){ 
		
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
					
					INTERNAL_DIADLOG_DIV_HIDE('Remain_Dsk_Diag');
					INTERNAL_DIADLOG_BUT_UNBIND('Remain_Dsk_Diag');
					
					INTERNAL_FMT_Load_USED_VOLUME_INFO();
					INTERNAL_FMT_Load_UNUSED_VOLUME_INFO();		
					go_sub_page('/web/storage/raid.php', 'raid');
				}
			}
		});	// end of ajax
	});		
		
	$("#storage_raidRemainShutDown10_button").click(function(){  	
			if (intervalId != 0) clearInterval(intervalId);
			if (RAID_VolList_timeoutId != 0 ) clearTimeout(RAID_VolList_timeoutId);
			
			jAlert( _T('_system','msg4'), "note", null, function(){
				$("#storage_raidRemainShutDown10_button").hide();
				$("#Storage_RAIDRemainShutdown1_Span").hide();
				$("#Storage_RAIDRemainShutdown1_Div").empty().html(_T("_utilities","msg3"));
				
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