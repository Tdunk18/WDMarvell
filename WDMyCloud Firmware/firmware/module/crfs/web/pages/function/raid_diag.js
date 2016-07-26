function INTERNAL_FMT_Load_UNUSED_VOLUME_INFO()
{
	var my_xml_file = FILE_UNUSED_VOLUME_INFO + "?id="+ (new Date()).getTime();
	wd_ajax({
				url: my_xml_file,
				type: "GET",
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml){
					
					UNUSED_VOLUME_INFO = xml;
				},
            error:function (xhr, ajaxOptions, thrownError){}  
	});	
}
function INTERNAL_FMT_Load_USED_VOLUME_INFO()
{
	var sys_time = (new Date()).getTime();
	var my_xml_file = FILE_USED_VOLUME_INFO + "?id="+(new Date()).getTime();
	
	wd_ajax({
				url: my_xml_file,
				type: "GET",
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml){
					USED_VOLUME_INFO = xml;
				},
            error:function (xhr, ajaxOptions, thrownError){}  
	});	
}
function INTERNAL_FMT_Load_VOLUME_ENCRYPTION()
{
	wd_ajax({
				url: FILE_HIDDEN_ENCRYPTION,
				type: "GET",
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml){
					FUN_VOLUME_ENCRYPTION = 0;
				},
            error:function (xhr, ajaxOptions, thrownError){}  
	});	
}

function INTERNAL_FMT_Load_DM_READ_STATE()
{		
		var my_xml = "";
		
		wd_ajax({
				url:FILE_DM_READ_STATE,
				type:"GET",
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml){
					my_xml = xml;
				},
	      error:function (xhr, ajaxOptions, thrownError){}  
		});	
		
		return my_xml;
}

var internal_fmt_load_sysinfo_timeout = -1;
function INTERNAL_FMT_Load_SYSINFO()
{
	wd_ajax({
		url: '/web/storage/raid_cgi.php', //FILE_SYSINFO,
		type: "POST",
		async:false,
		cache:false,
		dataType:"xml",
		data: {cmd: 'cgi_Get_SysInfo'},
		success: function(xml){
			SYSINFO = xml;
		},
		error: function (xhr, ajaxOptions, thrownError){},
		complete: function() {
			clearTimeout(internal_fmt_load_sysinfo_timeout);
			internal_fmt_load_sysinfo_timeout = -1;
			internal_fmt_load_sysinfo_timeout = setTimeout(function() { INTERNAL_FMT_Load_SYSINFO(); }, 2000);
		}
	});	
}
function INTERNAL_RaidLeve_HTML(str)
{	
	var my_pkey = str.toLowerCase();
	var str_html;
	
	switch(my_pkey)
	{
		case "standard":
			str_html = _T('_raid','desc5');	//Text:	Standard
		break;
		
		case "linear":
			str_html = _T('_raid','desc6');		//Text: JBOD
		break;
		
		case "raid0":
			str_html = _T('_raid','desc7');		//Text: Raid 0
		break;
		
		case "raid1":
			str_html = _T('_raid','desc8'); 		//Text: Raid 1
		break;

		case "raid5+spare":
			str_html = _T('_raid','desc9') + " + " + _T("_raid","desc10"); 		//Text: Raid 5 + spare
		break;
		
		case "raid5":
			str_html = _T('_raid','desc9'); 		//Text: Raid 5
		break;
		
		case "raid10":
			str_html = _T('_raid','desc11'); 		//Text: Raid 10	
		break;
		
		default:
			str_html = "None"; 	
		break;
	}	
		
	return 	str_html;
}

function INTERNAL_File_System_HTML(str)
{
	var str_html;
	
	if ( str.toLowerCase() == "ext3")
		str_html = _T('_raid','desc59'); 		//Text:EXT	3
	else if ( str.toLowerCase() == "ext4")
		str_html = _T('_raid','desc60'); 		//Text:EXT	4
	else	
		str_html = "None"; 	
		
	return 	str_html;
}

function INTERNAL_Disk_Get_Slot_Info(my_slot)	//0 -> Disk1 
{
	switch(parseInt(my_slot))
	{
		case 0:
			my_slot = _T('_raid','desc12')+"1";
		break;
		
		case 1:
			my_slot =  _T('_raid','desc12')+"2";
		break;
		
		case 2:
			my_slot =  _T('_raid','desc12')+"3";
		break;
		
		case 3:
			my_slot =  _T('_raid','desc12')+"4";
		break;
	}
	
	return my_slot;
}

function INTERNAL_FMT_Get_Device_Slot(dev) // sda -> Disk1
{
	var my_slot="";
	var hd_info = new Array();
	hd_info = FMT_HD_INFO;
	
	if (hd_info.length == 0)
	{
		hd_info = INTERNAL_Get_HD_Info();
	}
	
	for (var i=0;i<hd_info.length;i++)
	{
		if ( hd_info[i][0].toString() == dev)
		{
			my_slot = hd_info[i][1];
			break;
		}
	}
	
	my_slot = INTERNAL_Disk_Get_Slot_Info(my_slot);
	
	return my_slot;
}

function INTERNAL_FMT_Convert_Device_Name(flag,dev) 
{
	/*
		flag -> 0: sdasdbsdcsdd -> sda,sdb,sdc,sdd
				1: sdasdbsdcsdd -> Disk1,2,3,4
	*/
	
	var j = 3;
	var tmp,my_dev;
	var str = dev;
	var dev_list = new Array();
	
	//alert("dev ="+dev + "\nstr="+str);
	for (var i=0;i<str.length;i=i+3)
	{
		tmp = str.slice(i,j);
		
		if (parseInt(flag) == 1)
		{
			my_dev = INTERNAL_FMT_Get_Device_Slot(tmp);
			
			if (i != 0) my_dev = my_dev.slice( (my_dev.length-1), my_dev.length);
		}		
		else
			my_dev = tmp;
		
		dev_list.push(my_dev);
		
		j = j+3;
	}
	
	return dev_list.toString();
}

function INTERNAL_Get_HD_Info()
{	
	if (HOME_XML_CURRENT_HD_INFO == "")//re-load current_hd_info.xml
	{
		Home_Load_CURRENT_HD_INFO();// in function.js
	}
	
	var all_hd_info = new Array();	
	var idx = 0;
	$('item', HOME_XML_CURRENT_HD_INFO).each(function(e){
		if ($('allowed',this).text() == "1")
		{
			all_hd_info[idx] = new Array();
			all_hd_info[idx][0] = $('device_name',this).text();
			all_hd_info[idx][1] = $('scsi',this).text();
			all_hd_info[idx][2] = $('vendor',this).text();
			all_hd_info[idx][3] = $('model',this).text();
			all_hd_info[idx][4] = $('hd_serial',this).text();
			all_hd_info[idx][5] = $('hd_size',this).text();
//		all_hd_info[idx][6] = $('hd_GiB_size',this).text();
			var my_GBytes = size2str((parseInt($('hd_size',this).text(), 10)*1024), "GB").split(" ");
			all_hd_info[idx][6] = parseInt(my_GBytes[0], 10);
			all_hd_info[idx][7] = $('sdx2_size',this).text();
			all_hd_info[idx][8] = $('part_cnt',this).text();
			idx++;
		}	
	});	//end of each
	
	return all_hd_info;
	
}

function INTERNAL_Get_Used_Volume_Info()
{
	var used_volume_info = new Array();	
	
	$('volume_info > item', USED_VOLUME_INFO).each(function(e){
		
		used_volume_info[e] = new Array();
		used_volume_info[e][0] = $('volume',this).text();
		used_volume_info[e][1] = $('raid_mode',this).text();
		used_volume_info[e][2] = $('file_type',this).text();  
		used_volume_info[e][3] = $('is_roaming_volume',this).text();  
		
	});//end of each
	
	return used_volume_info;
}

function INTERNAL_Volume_Size_Init(mode,flag)
{
	/*
	flag -> 0:create all disk(s); 1 -> re-format disk(s)
	*/
	var hd_info = new Array();
	var volume_size = new Array();
	var volume_size_tmp;
	
	hd_info = (parseInt(flag) == 0)?FMT_HD_INFO:REFMT_HD_INFO;
	
	switch(hd_info.length)
	{
		case 2:	//2 Disk(s)
			switch(mode)
			{
				case "standard":
					for (var i=0;i<hd_info.length;i++)
					{
						volume_size_tmp = Math.floor(parseInt(hd_info[i][6])) - HD_BLOCKS_KEEP ;
						volume_size[i]= volume_size_tmp;
					}
				break;
				
				case "linear":
					volume_size_tmp = 0;
					for (var i=0;i<hd_info.length;i++)
					{
						volume_size_tmp = volume_size_tmp + (Math.floor(parseInt(hd_info[i][6])) - HD_BLOCKS_KEEP);
					}
					
					volume_size[0]= volume_size_tmp;
				break;
				
				case "raid0":
					var dev_1 = ( Math.floor(hd_info[0][6]) - HD_BLOCKS_KEEP);
					var dev_2 = ( Math.floor(hd_info[1][6]) - HD_BLOCKS_KEEP);
					
					var raid0_volume_size = Math.min(parseInt(dev_1),parseInt(dev_2));
					raid0_volume_size = parseInt(raid0_volume_size) * 2;
					volume_size[0] = raid0_volume_size;
					
					if (parseInt(hd_info[0][5]) != parseInt(hd_info[1][5]))
					{
						var linear_volume_size =  parseInt(dev_1) + parseInt(dev_2);
						linear_volume_size = parseInt(linear_volume_size) - parseInt(raid0_volume_size);
						volume_size[1] = linear_volume_size;
					}
					else 
						volume_size[1] = 0;
				break;
				
				case "raid1":
					var dev_1 = ( Math.floor(parseInt(hd_info[0][6])) - HD_BLOCKS_KEEP);
					var dev_2 = ( Math.floor(parseInt(hd_info[1][6])) - HD_BLOCKS_KEEP);
					
					var raid1_volume_size = Math.min(parseInt(dev_1),parseInt(dev_2));
					volume_size[0] = raid1_volume_size;
					
					if (parseInt(hd_info[0][5]) != parseInt(hd_info[1][5]))
					{
						var linear_volume_size =  parseInt(dev_1) + parseInt(dev_2);
						linear_volume_size = parseInt(linear_volume_size) - parseInt(parseInt(raid1_volume_size)*2);
						volume_size[1] = linear_volume_size;
					}
					else 
						volume_size[1] = 0;
				break;
			}//end switch(mode)
		break;
		
		case 3:
			if (mode == "standard")
			{
				for (var i=0;i<hd_info.length;i++)
				{
					volume_size_tmp = Math.floor(parseInt(hd_info[i][6])) - HD_BLOCKS_KEEP ;
					volume_size[i]= volume_size_tmp;
				}
			}
			else if (mode == "linear")
			{
				volume_size_tmp = 0;
				for (var i=0;i<hd_info.length;i++)
				{
					volume_size_tmp = volume_size_tmp + (Math.floor(parseInt(hd_info[i][6])) - HD_BLOCKS_KEEP);
				}
				
				volume_size[0]= volume_size_tmp;
			}
			else if (mode == "raid0")
			{
				var dev_1 = ( Math.floor(parseInt(hd_info[0][6])) - HD_BLOCKS_KEEP);
				var dev_2 = ( Math.floor(parseInt(hd_info[1][6])) - HD_BLOCKS_KEEP);
				var dev_3 = ( Math.floor(parseInt(hd_info[2][6])) - HD_BLOCKS_KEEP);
				
				var raid0_volume_size = Math.min(parseInt(dev_1),parseInt(dev_2),parseInt(dev_3)); 
				raid0_volume_size = parseInt(raid0_volume_size) * 3;
				volume_size[0] = raid0_volume_size;	
				
				if ( (parseInt(hd_info[0][5]) != parseInt(hd_info[1][5])) ||  
					 (parseInt(hd_info[0][5]) != parseInt(hd_info[2][5])) )
				{
					var linear_volume_size =  parseInt(dev_1) + parseInt(dev_2) + parseInt(dev_3);
					linear_volume_size = parseInt(linear_volume_size) - parseInt(raid0_volume_size);
					volume_size[1] = linear_volume_size;	
				}
				else 
					volume_size[1] = 0;			
			}				
			else if (mode == "raid5")
			{
				var dev_1 = ( Math.floor(parseInt(hd_info[0][6])) - HD_BLOCKS_KEEP);
				var dev_2 = ( Math.floor(parseInt(hd_info[1][6])) - HD_BLOCKS_KEEP);
				var dev_3 = ( Math.floor(parseInt(hd_info[2][6])) - HD_BLOCKS_KEEP);
				
				var raid5_volume_size = Math.min(parseInt(dev_1),parseInt(dev_2),parseInt(dev_3));
				raid5_volume_size = parseInt(raid5_volume_size) * 2;
				volume_size[0] = raid5_volume_size;	 
				
				if ( (parseInt(hd_info[0][5]) != parseInt(hd_info[1][5])) ||  
					 (parseInt(hd_info[0][5]) != parseInt(hd_info[2][5]))	)
				{
					var linear_volume_size =  parseInt(dev_1) + parseInt(dev_2) + parseInt(dev_3);
					var raid5_volume_size_tmp = Math.min(parseInt(dev_1),parseInt(dev_2),parseInt(dev_3));
					raid5_volume_size_tmp = parseInt(raid5_volume_size_tmp) * 3;
					linear_volume_size = parseInt(linear_volume_size) - parseInt(raid5_volume_size_tmp);
					volume_size[1] = linear_volume_size;	
				}
				else 
					volume_size[1] = 0;
			}	
		break;
		
		case 4:	//4 Disk(s)
		
			switch(mode)
			{
				case "standard":
					for (var i=0;i<hd_info.length;i++)
					{
						volume_size_tmp = Math.floor(parseInt(hd_info[i][6])) - HD_BLOCKS_KEEP ;
						volume_size[i]= volume_size_tmp;
					}
				break;
				
				case "linear":
					volume_size_tmp = 0;
					for (var i=0;i<hd_info.length;i++)
					{
						volume_size_tmp = volume_size_tmp + (Math.floor(parseInt(hd_info[i][6])) - HD_BLOCKS_KEEP);
					}
					
					volume_size[0]= volume_size_tmp;	
				break;
				
				case "raid0":
					var dev_1 = ( Math.floor(parseInt(hd_info[0][6])) - HD_BLOCKS_KEEP);
					var dev_2 = ( Math.floor(parseInt(hd_info[1][6])) - HD_BLOCKS_KEEP);
					var dev_3 = ( Math.floor(parseInt(hd_info[2][6])) - HD_BLOCKS_KEEP);
					var dev_4 = ( Math.floor(parseInt(hd_info[3][6])) - HD_BLOCKS_KEEP);
					
					var raid0_volume_size = Math.min(parseInt(dev_1),parseInt(dev_2),parseInt(dev_3),parseInt(dev_4)); 
					raid0_volume_size = Math.round(parseInt(raid0_volume_size)*4);
					volume_size[0] = raid0_volume_size;	
					
					if ( (parseInt(hd_info[0][5]) != parseInt(hd_info[1][5])) ||  
						 (parseInt(hd_info[0][5]) != parseInt(hd_info[2][5])) || 
						 (parseInt(hd_info[0][5]) != parseInt(hd_info[3][5])) )
					{
						var linear_volume_size =  parseInt(dev_1) + parseInt(dev_2) + parseInt(dev_3) + parseInt(dev_4);
						linear_volume_size = parseInt(linear_volume_size) - parseInt(raid0_volume_size);
						volume_size[1] = linear_volume_size;	
					}
					else 
						volume_size[1] = 0;
				break;
				
				case "raid1":
					var dev_1 = ( Math.floor(parseInt(hd_info[0][6])) - HD_BLOCKS_KEEP);
					var dev_2 = ( Math.floor(parseInt(hd_info[1][6])) - HD_BLOCKS_KEEP);
					var dev_3 = ( Math.floor(parseInt(hd_info[2][6])) - HD_BLOCKS_KEEP);
					var dev_4 = ( Math.floor(parseInt(hd_info[3][6])) - HD_BLOCKS_KEEP);
					
					// Volume_1: Disk1 + Disk2 : RAID1
					var raid1_volume_size = Math.min(parseInt(dev_1),parseInt(dev_2)); 
					volume_size.push(raid1_volume_size);
					
					// Volume_2: Disk3 + Disk4 : RAID1
					raid1_volume_size = Math.min(parseInt(dev_3),parseInt(dev_4)); 
					volume_size.push(raid1_volume_size);
					
					// Volume_3: Disk1 + Disk2 : JBOD
					if ( parseInt(hd_info[0][5]) !=  parseInt(hd_info[1][5]) )
					{
						var linear_volume_size =  parseInt(dev_1) + parseInt(dev_2);
						var raid1_volume_size_tmp = parseInt(volume_size[0]) * 2 ;
						linear_volume_size = parseInt(linear_volume_size) - parseInt(raid1_volume_size_tmp);
						volume_size.push(linear_volume_size);
					}
					else
						volume_size.push("0");
					
					// Volume_4: Disk3 + Disk4 : JBOD
					if ( parseInt(hd_info[2][5]) !=  parseInt(hd_info[3][5]) )
					{
						var linear_volume_size =  parseInt(dev_3) + parseInt(dev_4);
						var raid1_volume_size_tmp = parseInt(volume_size[1]) * 2 ;
						linear_volume_size = parseInt(linear_volume_size) - parseInt(raid1_volume_size_tmp);
						volume_size.push(linear_volume_size);
					}
					else
						volume_size.push("0");
				break;
				
				case "raid5":
					var dev_1 = ( Math.floor(parseInt(hd_info[0][6])) - HD_BLOCKS_KEEP);
					var dev_2 = ( Math.floor(parseInt(hd_info[1][6])) - HD_BLOCKS_KEEP);
					var dev_3 = ( Math.floor(parseInt(hd_info[2][6])) - HD_BLOCKS_KEEP);
					var dev_4 = ( Math.floor(parseInt(hd_info[3][6])) - HD_BLOCKS_KEEP);
					
					var raid5_volume_size = Math.min(parseInt(dev_1),parseInt(dev_2),parseInt(dev_3),parseInt(dev_4));
					raid5_volume_size = parseInt(raid5_volume_size) * 3;
					volume_size[0] = raid5_volume_size;	 
					
					if ( (parseInt(hd_info[0][5]) != parseInt(hd_info[1][5])) ||  
						 (parseInt(hd_info[0][5]) != parseInt(hd_info[2][5])) || 
						 (parseInt(hd_info[0][5]) != parseInt(hd_info[3][5])) )
					{
						var linear_volume_size =  parseInt(dev_1) + parseInt(dev_2) + parseInt(dev_3) + parseInt(dev_4);
						var raid5_volume_size_tmp = Math.min(parseInt(dev_1),parseInt(dev_2),parseInt(dev_3),parseInt(dev_4));
						raid5_volume_size_tmp = parseInt(raid5_volume_size_tmp) * 4;
						linear_volume_size = parseInt(linear_volume_size) - parseInt(raid5_volume_size_tmp);
						volume_size[1] = linear_volume_size;	
					}
					else 
						volume_size[1] = 0;
				break;
				
				case "raid10":
						var dev_1 = ( Math.floor(parseInt(hd_info[0][6])) - HD_BLOCKS_KEEP);
						var dev_2 = ( Math.floor(parseInt(hd_info[1][6])) - HD_BLOCKS_KEEP);
						var dev_3 = ( Math.floor(parseInt(hd_info[2][6])) - HD_BLOCKS_KEEP);
						var dev_4 = ( Math.floor(parseInt(hd_info[3][6])) - HD_BLOCKS_KEEP);
						
						var raid10_volume_size = Math.min(parseInt(dev_1),parseInt(dev_2),parseInt(dev_3),parseInt(dev_4));
						raid10_volume_size = parseInt(raid10_volume_size) * 2;
						volume_size[0] = raid10_volume_size;
						
						if ( (parseInt(hd_info[0][5]) != parseInt(hd_info[1][5])) ||  
							 (parseInt(hd_info[0][5]) != parseInt(hd_info[2][5])) || 
							 (parseInt(hd_info[0][5]) != parseInt(hd_info[3][5])) )
						{
							var linear_volume_size =  parseInt(dev_1) + parseInt(dev_2) + parseInt(dev_3) + parseInt(dev_4);
							linear_volume_size = parseInt(linear_volume_size) - (parseInt(raid10_volume_size)*2);
							volume_size[1] = linear_volume_size;	
						}
						else 
							volume_size[1] = 0;
				break;
			}//end of switch(mode)
			
		break;
		
		default:
			if (mode == "standard")
			{
				volume_size[0] = ( Math.floor(parseInt(hd_info[0][6])) - HD_BLOCKS_KEEP);
			}
		break;
	}
	
	return volume_size;
}

function INTERNAL_Create_Volume_Init(mode,flag)
{
	/*
		mode -> standard,linear,raid0,raid1,raid5,raid10
		flag -> 0:create all disk(s); 1 -> re-format disk(s)
	*/
	var volume_size = new Array();
	var hd_info = new Array();
	var disk_size="",disk_same_size_flag = 1;
	
	volume_size = INTERNAL_Volume_Size_Init(mode,flag);
	hd_info = (parseInt(flag) == 0)?FMT_HD_INFO:REFMT_HD_INFO;
	CREATE_VOLUME_INFO.length = 0;	
	
	for (var i=0;i<volume_size.length;i++)
	{
 		
 		CREATE_VOLUME_INFO[i] = new Array();
 		
 		if (parseInt(flag) == 0)
 			CREATE_VOLUME_INFO[i][0] = (i+1);
 		else
 			CREATE_VOLUME_INFO[i][0] = FMT_SHAREDNAME[i];
 			
		if (parseInt(i) == 0)
 			CREATE_VOLUME_INFO[i][1] = mode;
 		else
 		{	
 			if (mode == "standard")
 			{
 				CREATE_VOLUME_INFO[i][1] = mode;
 			}
 			else if ( (mode == "raid1") && (parseInt(i) == 1) )
 			{	
 				if (volume_size.length == 2)
 					CREATE_VOLUME_INFO[i][1] = "linear";
 				else
 					CREATE_VOLUME_INFO[i][1] = mode;
 			}
 			else
 				CREATE_VOLUME_INFO[i][1] = "linear";
 		}		
 		
 		CREATE_VOLUME_INFO[i][2] = FILE_SYSTEM;
 		CREATE_VOLUME_INFO[i][3] = volume_size[i];
 		
 		if (mode == "standard")
 		{
 			CREATE_VOLUME_INFO[i][4] = hd_info[i][0].toString();
 		}
 		else if (mode == "raid1")
 		{
 			switch(parseInt(i))
 			{
 				case 0:// 1st RAID1
 					CREATE_VOLUME_INFO[i][4] = hd_info[0][0].toString()+hd_info[1][0].toString();
 					
 					if ( parseInt(hd_info[0][5].toString()) != parseInt(hd_info[1][5].toString()))	disk_same_size_flag = 0;
 				break;
 				
 				case 1:// 2nd RAID1 or JBOD
 					if (volume_size.length == 2)
 						CREATE_VOLUME_INFO[i][4] = hd_info[0][0].toString()+hd_info[1][0].toString();
 					else
 					{
 						CREATE_VOLUME_INFO[i][4] = hd_info[2][0].toString()+hd_info[3][0].toString();
 						if ( parseInt(hd_info[2][5].toString()) != parseInt(hd_info[3][5].toString()))	disk_same_size_flag = 0;
 					}	
 				break;
 				
 				case 2://3st JBOD
 					CREATE_VOLUME_INFO[i][4] = hd_info[0][0].toString()+hd_info[1][0].toString();
 				break;
 				
 				case 3://4th JBOD
 					CREATE_VOLUME_INFO[i][4] = hd_info[2][0].toString()+hd_info[3][0].toString();
 				break;
 			}
 		}	
 		else	//jbod/raid0/raid5/raid10
 		{	
 			switch(hd_info.length)
 			{
 				case 2:
 					if ( (parseInt(hd_info[0][5],10)) != (parseInt(hd_info[1][5],10)))	disk_same_size_flag = 0;
 					
 					CREATE_VOLUME_INFO[i][4] = hd_info[0][0].toString()+hd_info[1][0].toString();	
 				break;
 				
 				case 3:
 					if ( (parseInt(hd_info[0][5],10) != parseInt(hd_info[1][5],10)) ||
 						 (parseInt(hd_info[0][5],10) != parseInt(hd_info[2][5],10)) )	
 					{	 
 						disk_same_size_flag = 0;
 					}	
 					CREATE_VOLUME_INFO[i][4] = hd_info[0][0].toString()+hd_info[1][0].toString()+hd_info[2][0].toString();	
 				break;
 				
 				case 4:
 					if ( (parseInt(hd_info[0][5],10) != parseInt(hd_info[1][5],10)) ||
 						 (parseInt(hd_info[0][5],10) != parseInt(hd_info[2][5],10)) ||
 						 (parseInt(hd_info[0][5],10) != parseInt(hd_info[3][5],10)) )
 					{	 
 						disk_same_size_flag = 0;
 					}	 
 					CREATE_VOLUME_INFO[i][4] = hd_info[0][0].toString()+hd_info[1][0].toString()+hd_info[2][0].toString()+hd_info[3][0].toString();	
 				break;
 			}
 		}
 			
 		CREATE_VOLUME_INFO[i][5] = "none";
 		
 		if ( parseInt(i) != 0 && CREATE_VOLUME_INFO[i][1] == "linear")
 			CREATE_VOLUME_INFO[i][6] = 1;
 		else
 			CREATE_VOLUME_INFO[i][6] = 0;	
 			
 		if ( parseInt(i) != 0 && CREATE_VOLUME_INFO[i][1] == "linear")
 		{	
 			if  ( (mode == "raid1") || (mode == "raid5") || disk_same_size_flag == "1") //don't create jbod
 				CREATE_VOLUME_INFO[i][7] = 0;
 			else 
 				CREATE_VOLUME_INFO[i][7] = 1;
 		}
 		else 
 			CREATE_VOLUME_INFO[i][7] = 1;
 			
 		CREATE_VOLUME_INFO[i][8] = volume_size[i];	
 		
 		CREATE_VOLUME_INFO[i][9] = 0;
 		CREATE_VOLUME_INFO[i][10] = "none";
 		
 		CREATE_VOLUME_INFO[i][11] = disk_same_size_flag;
 		
 		//volume encryption
 		CREATE_VOLUME_INFO[i][12] = "0";
 		CREATE_VOLUME_INFO[i][13] = "0";
 		CREATE_VOLUME_INFO[i][14] = "null";
 		CREATE_VOLUME_INFO[i][15] = flag; 		
 	}
 	
// 	var msg = "";
// 	for(i=0;i<CREATE_VOLUME_INFO.length;i++)
// 	{
// 		msg += "["+i+"]"+CREATE_VOLUME_INFO[i].toString() + "\n";
// 	}
// 	alert(msg);
}
function INTERNAL_RAID_Menu_Click()
{	
	$(".raid_left ul li").click(function() { 
			var my_raidlevel = $(this).attr('id');
			
			//menu_l:Clear all style
			$(".raid_left ul li").each(function(idx) {
                $(this).css('background-color','#F0F0F0').css('color', '#4B5A68');
				$(this).children(".img").hide();
		    });
		    
		    //menu_r:Clear all style
			$(".raid_right table").each(function(idx) {
				$("#"+$(this).attr('id')).hide();
		    });
		    
		    $("#dskDiag_raidmode_set input[type=checkbox]").prop('checked',false);
		    if (!$("#storage_raidFormatNext1_button").hasClass("grayout"))  $("#storage_raidFormatNext1_button").addClass("grayout");

		  	switch(my_raidlevel)
			{
				case "raid_main_menu_jbod":
					var my_mode = "linear";
					$("#DIV_CHECKBOX_RAIDMODE_HTML").html(_T('_raid','desc21'));
				break;
				
				case "raid_main_menu_r0":
					var my_mode = "raid0";
					$("#DIV_CHECKBOX_RAIDMODE_HTML").html(_T('_raid','desc22'));
				break;
				
				case "raid_main_menu_r1":
					var my_mode = "raid1";
					$("#DIV_CHECKBOX_RAIDMODE_HTML").html(_T('_raid','desc23'));
				break;
				
				case "raid_main_menu_r5":
					var my_mode = "raid5";
					$("#DIV_CHECKBOX_RAIDMODE_HTML").html(_T('_raid','desc24'));
				break;
				
				case "raid_main_menu_r10":
					var my_mode = "raid10";		
					$("#DIV_CHECKBOX_RAIDMODE_HTML").html(_T('_raid','desc25'));
				break;
				
				default:
					var my_mode = "standard";
					$("#DIV_CHECKBOX_RAIDMODE_HTML").html(_T('_raid','desc20'));
				break;
			}	
				
			INTERNAL_FMT_Button_status(my_mode);
		
			switch(parseInt($('input[name=storage_raidFormatType_chkbox]:checked').val() ,10))
			{
				case 2://newly hd
				case 4://STD2R1
	    	case 5://STD2R5
	    	case 6://R12R5
	    	case 7://Create Spare Disk
	    			INTERNAL_Create_Volume_Init(my_mode, 1);
				break;
				
				default://format all
					 INTERNAL_Create_Volume_Init(my_mode, 0);
				break;
			}	
		    
            $("#"+$(this).attr('id')).css('background-color','#15abff').css('color', '#FAFAFA').children(".img").show();
 		    $("#"+$(this).attr('rel')).show();
 			
	});//end of $("#raid_main_menu li").click
}

function FMT_GUI_Log(my_type,my_step,my_note)
{
	wd_ajax({
			url:"/cgi-bin/hd_config.cgi",
			type:"POST",
			data:{cmd:'cgi_FMT_GUI_Log',f_my_type:my_type,f_my_step:my_step,f_my_note:my_note},
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml)
			{
			}
		});	// end of ajax
}

function INTERNAL_FMT_ProgressBar_INIT(bar,id_name)
{			
	var progress_bar = "#"+id_name+"_parogressbar";
	var progress_state = "#"+id_name+"_state";
	var progress_desc = "#"+id_name+"_desc";
	
	$(progress_bar).progressbar({value: bar});
	
	var msg = _T('_format','initializing') + "...";	//Text:Initializing
	
	if ( 0 == parseInt(bar))
		$(progress_state).html(msg);
		
	$(progress_desc).html("&nbsp;" + bar +"%");
}

function INTERNAL_FMT_Show_Bar(id_name)
{		
		/* ajax and xml parser start*/
		wd_ajax({
			url:FILE_DM_READ_STATE,
			type:"GET",
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml){
						 var progress_bar = "#"+id_name+"_parogressbar";
						 var progress_state = "#"+id_name+"_state";
						 var progress_desc = "#"+id_name+"_desc";
						 
						 var bar_amount=$(xml).find("dm_state>percent").text();
						 var bar_state=$(xml).find("dm_state>finished").text();
						 var bar_desc=$(xml).find("dm_state>describe").text();
						 var bar_errcode=$(xml).find("dm_state>errcode").text();
						 
						 if ( parseInt(bar_state) == 1 || parseInt(bar_errcode) != 1 )
						 {
							 	if (intervalId != 0) clearInterval(intervalId);
							 	
								$(progress_bar).progressbar('option', 'value', 100);
								if (parseInt(bar_state) == 1)
								{
									$(progress_desc).html("&nbsp;100%");
								}
								
								switch(id_name)
								{
									case "formatdsk":
										FMT_GUI_Log("1","2","none");
										RAID_FormatResInfo("formatdsk",	"dskDiag_bar", "dskDiag_res",	bar_errcode);
									break;
									
									case "remain":
										FMT_GUI_Log("4","2","none");
										RAID_FormatResInfo("remain",	"Remain_Dsk_Diag_Bar", "Remain_Dsk_Diag_Res",	bar_errcode);
									break;
								}
						 }
						 else
						 {
							bar_amount = parseInt(bar_amount, 10);
						
							switch(parseInt(bar_desc))	
							{
								case 2:
									bar_desc = _T('_format','initializing') + "...";	//Text:Initializing
								break;
								
								case 3:
									bar_desc = "Volume_1 " + _T('_format','formatting'); //Text:Volume_1 Formatting
								break;
								
								case 4:
									bar_desc = "Volume_2 " + _T('_format','formatting'); //Text:Volume_2 Formatting
								break;
								
								case 5:
									bar_desc = "Volume_3 " + _T('_format','formatting'); //Text:Volume_3 Formatting	
								break;
								
								case 6:
									bar_desc = "Volume_4 " + _T('_format','formatting'); //Text:Volume_4 Formatting	
								break;
								
								case 7://std to raid1,resize
									bar_desc = "&nbsp;";
								break;
								
								case 8://std to raid1,resize
									bar_desc = "&nbsp;";
								break;
								
								default:	
									bar_desc = "&nbsp;";
								break;
							}
							
							$(progress_state).html("&nbsp;" + bar_desc);
							$(progress_bar).progressbar('option', 'value', bar_amount);
							$(progress_desc).html("&nbsp;" + bar_amount + "%");
						}	
				
			}//end of success: function(xml){
				
		}); //end of wd_ajax({	
}

function RAID_FormatResInfo(my_id, close_id, open_id, my_errcode)
{
	if(parseInt(my_errcode,10) == 1) //format successfuly
	{
		switch(my_id)
    {
    	case "formatdsk":
    		$('#dskDiag_res_hdlst').empty();
    	break;
    	
    	case "remaindsk":
    		$('#dsk_remain_res_hdlst').empty();
    	break;
    	
    	case "rebuilddsk":
    		$('#dsk_rebuild_res_hdlst').empty();
    	break;
    	
    	case "remain":
    		$('#Remain_Dsk_Diag_res_hdlst').empty();
    	break;
    	
    	case "reformat":
    	case "reformat_std2r1":
    	case "reformat_r5spare":
    		$('#Reformat_Dsk_Diag_res_hdlst').empty();
    	break;
    	
    	case "migrate_resize_sync":
    			$("#Reformat_Dsk_Diag_R12R5_Partitioning").hide();
					$("#Reformat_Dsk_Diag_Res").show();
    	break;
    }	
    
		HD_Result_List(0,my_id);
	}
	else	//format fail need to shutdown
	{
		var _tpl = "<b>&nbsp;{0}({1}:{2}).</b>";	//Text:Hard Drive(s) Formatting Failure(Error Code:xxx).
		var my_html = String.format(_tpl,
		/*0*/ _T('_format','msg7'),
		/*1*/	_T('_format','error_code'),
		/*2*/ my_errcode);
		
		if (my_id == "remain")
		{
			$('#Storage_RAIDRemainShutdown1_Div').html(my_html);
				open_id = "RAID_Remain_Shutdown";
		}
		else
		{	
			$('#Storage_RAIDFormatShutdown1_Div').html(my_html);
			open_id = "RAID_FormatShutdown";
		}	
	}	
	
	if (close_id != "none")	$("#"+close_id).hide();
	if (open_id != "none")	$("#"+open_id).show();
}

function INTERNAL_FMT_HD_Resize(flag,volume,raidsize)
{
	/*
		flag -> 0:create all disk(s); 1 -> re-format disk(s)
		volume -> 1: 1st raid volume; 2:2nd raid volume
		raidsize -> 1 to n, unit:GB
	*/	
	
	var hd_info = new Array();
	hd_info = (parseInt($('input[name=storage_raidFormatType_chkbox]:checked').val(),10) == 1)?FMT_HD_INFO:REFMT_HD_INFO;
	switch(hd_info.length)
	{
		case 2:
			var dev_1 =  Math.floor(hd_info[0][6]) - HD_BLOCKS_KEEP;
			var dev_2 =  Math.floor(hd_info[1][6]) - HD_BLOCKS_KEEP;
			
			var linear_volume_size =  parseInt(dev_1) + parseInt(dev_2);
			var my_raid_mode = CREATE_VOLUME_INFO[0][1];
			switch(my_raid_mode)
			{
				case "raid0":
					linear_volume_size = parseInt(linear_volume_size,10) - parseInt(raidsize,10);
					
					if (linear_volume_size == 0) 
						CREATE_VOLUME_INFO[1][7] = 0;	
					else
						INTERNAL_FMT_1st_Create_JBOD(flag);
				break;
				
				case "raid1":
					linear_volume_size = parseInt(linear_volume_size) - ( parseInt(raidsize,10) * 2 ) ;
					
					if (linear_volume_size == 0) 
						CREATE_VOLUME_INFO[1][7] = 0;	
					else
						INTERNAL_FMT_1st_Create_JBOD(flag);
				break;
			}	
		break;
		
		case 3:
			var dev_1 =  Math.floor(hd_info[0][6]) - HD_BLOCKS_KEEP;
			var dev_2 =  Math.floor(hd_info[1][6]) - HD_BLOCKS_KEEP;
			var dev_3 =  Math.floor(hd_info[2][6]) - HD_BLOCKS_KEEP;
			
			var linear_volume_size =  parseInt(dev_1) + parseInt(dev_2) + parseInt(dev_3);
			var my_raid_mode = CREATE_VOLUME_INFO[0][1];
			
			switch(my_raid_mode)
			{
				case "raid0":
					linear_volume_size = parseInt(linear_volume_size,10) - parseInt(raidsize,10);
					CREATE_VOLUME_INFO[1][8] = linear_volume_size;
					
					if (linear_volume_size == 0) 
						CREATE_VOLUME_INFO[1][7] = 0;	
					else
						INTERNAL_FMT_1st_Create_JBOD(flag);
				break;
				
				case "raid5":
					var raid5_volume_size = Math.round(parseInt(parseInt(raidsize,10) / 2) * 3);
					linear_volume_size = parseInt(linear_volume_size) - parseInt(raid5_volume_size);
					
					if (linear_volume_size == 0) 
						CREATE_VOLUME_INFO[1][7] = 0;	
					else
						INTERNAL_FMT_1st_Create_JBOD(flag);
				break;
			}	
		break;
		
		case 4:
			var dev_1 =  Math.floor(hd_info[0][6]) - HD_BLOCKS_KEEP;
			var dev_2 =  Math.floor(hd_info[1][6]) - HD_BLOCKS_KEEP;
			var dev_3 =  Math.floor(hd_info[2][6]) - HD_BLOCKS_KEEP;
			var dev_4 =  Math.floor(hd_info[3][6]) - HD_BLOCKS_KEEP;
			
			var linear_volume_size =  parseInt(dev_1) + parseInt(dev_2) + parseInt(dev_3) + parseInt(dev_4);
			var my_raid_mode = CREATE_VOLUME_INFO[0][1];
			
			switch(my_raid_mode)
			{
				case "raid0":
					linear_volume_size = parseInt(linear_volume_size,10) - parseInt(raidsize,10);
					
					if (linear_volume_size == 0) 
						CREATE_VOLUME_INFO[1][7] = 0;	
					else
						INTERNAL_FMT_1st_Create_JBOD(flag);	
				break;
				
				case "raid1":
					
					if (parseInt(volume) == 1)	// Disk1 + Disk2
					{	
						linear_volume_size =  parseInt(dev_1) + parseInt(dev_2);
						linear_volume_size = parseInt(linear_volume_size,10) - (parseInt(CREATE_VOLUME_INFO[0][8],10) * 2);	
						
						CREATE_VOLUME_INFO[2][8] = linear_volume_size;
						
						if (linear_volume_size == 0) 
							CREATE_VOLUME_INFO[2][7] = 0;	
						else
							INTERNAL_FMT_1st_Create_JBOD(flag);	
					}
					else 	// Disk3 + Disk4
					{
						linear_volume_size =  parseInt(dev_3) + parseInt(dev_4);
						linear_volume_size = parseInt(linear_volume_size,10) - (parseInt(CREATE_VOLUME_INFO[1][8],10) * 2);	
						
						CREATE_VOLUME_INFO[3][8] = linear_volume_size;
						
						if (linear_volume_size == 0) 
							CREATE_VOLUME_INFO[3][7] = 0;	
						else
							INTERNAL_FMT_2nd_Create_JBOD();	
					}	
					
				break;
				
				case "raid5":
					var my_spare_dsk = $("input[name='storage_raidFormatSpareDsk4_chkbox']:checked").val();
					if (my_spare_dsk == 1)
					{
						var raid5_volume_size = Math.round(parseInt(parseInt(raidsize,10) / 2) * 4);
						linear_volume_size = parseInt(linear_volume_size) - parseInt(raid5_volume_size);
					}
					else
					{	
						var raid5_volume_size = Math.round(parseInt(parseInt(raidsize,10) / 3) * 4);
						linear_volume_size = parseInt(linear_volume_size) - parseInt(raid5_volume_size);
					}	
					
					if (linear_volume_size == 0) 
						CREATE_VOLUME_INFO[1][7] = 0;	
					else
						INTERNAL_FMT_1st_Create_JBOD(flag);
				break;
				
				case "raid10":
					var raid10_volume_size = Math.round((parseInt(raidsize,10) / 2) * 4);
					linear_volume_size = parseInt(linear_volume_size) - parseInt(raid10_volume_size,10);
					
					if (linear_volume_size == 0) 
						CREATE_VOLUME_INFO[1][7] = 0;	
					else
						INTERNAL_FMT_1st_Create_JBOD(flag);
				break;
			}
		break;
	}
	
	return linear_volume_size;
}

function INTERNAL_FMT_Get_RAID_List(n,flag)
{
	switch(parseInt(n, 10))
	{
		case 2:
				INTERNAL_Create_Volume_Init('standard',flag);
				$("#raid_main_menu_jbod").show();
				$("#raid_main_menu_r0").show();
				$("#raid_main_menu_r1").show();
				$("#raid_main_menu_r5").hide();
				$("#raid_main_menu_r10").hide();
		break;
		
		case 3:
				INTERNAL_Create_Volume_Init('standard',flag);
				$("#raid_main_menu_jbod").show();
				$("#raid_main_menu_r0").show();
				
				var my_res = 0;
				$('item', USED_VOLUME_INFO).each(function(e){
					if ( (parseInt($('raid_status',this).text(),10) == 0) && 
						 (parseInt($('is_roaming_volume',this).text(),10) == 0) &&
						 ($('raid_mode',this).text() == "raid1") &&
						 (parseInt($('volume_encrypt',this).text(), 10) == 0)
						 )
					{
						my_res = 1;
					}
				});	//end of each
				
				var DiskCnt = 0;	
				$('unused_volume_info > item', UNUSED_VOLUME_INFO).each(function(e){
					if ($('partition',this).text().length == 3) DiskCnt++;
				});	//end of each	
				(my_res == 1 || DiskCnt==2)?$("#raid_main_menu_r1").show():$("#raid_main_menu_r1").hide();
				
				$("#raid_main_menu_r5").show();
				$("#raid_main_menu_r10").hide();
		break;
		
		case 4:
				INTERNAL_Create_Volume_Init('standard',flag);
				$("#raid_main_menu_jbod").show();
				$("#raid_main_menu_r0").show();
				$("#raid_main_menu_r1").show();
				$("#raid_main_menu_r5").show();
				$("#raid_main_menu_r10").show();
		break;
		
		default:
			INTERNAL_Create_Volume_Init('standard',flag);
			
			$("#raid_main_menu_jbod").hide();
			$("#raid_main_menu_r0").hide();
			$("#raid_main_menu_r1").hide();
			$("#raid_main_menu_r5").hide();
			$("#raid_main_menu_r10").hide();
		break;
	}
}

function INTERNAL_FMT_1st_Create_JBOD(flag)
{
	/*
	flag -> 0:create all disk(s); 1 -> re-format disk(s)
	*/
	if (parseInt(flag) == 0)
		var my_create_jbod_1st_tmp = $("input[name='storage_raidFormat1stSpanning4_chkbox']:checked").val();
	else
		var my_create_jbod_1st_tmp = $("input[name='diag_reformat_1st_jbod']:checked").val();
	
	var my_create_1st_jbod = 0;
	var my_raid_mode = CREATE_VOLUME_INFO[0][1];
	
	if ( my_create_jbod_1st_tmp == 1 )	
		my_create_1st_jbod = 1;
	else
		my_create_1st_jbod = 0;
		
	
	for (var i=0;i<CREATE_VOLUME_INFO.length;i++)
	{
		if ( CREATE_VOLUME_INFO[i][1] == "linear")
		{
			CREATE_VOLUME_INFO[i][7] = my_create_1st_jbod;
			break;
		}
	}
}

function INTERNAL_FMT_2nd_Create_JBOD()
{
	var my_create_jbod_2nd_tmp = $("input[name='storage_raidFormat2ndSpanning5_chkbox']:checked").val();
	
	if (CREATE_VOLUME_INFO.length == 4)
	{
		CREATE_VOLUME_INFO[3][7] = ( my_create_jbod_2nd_tmp == 1 )?1:0;	
	}
}

function INTERNAL_FMT_Diskmgr_Info()
{	
	var my_volume_info = new Array();	
		
	my_volume_info = CREATE_VOLUME_INFO;
	var my_mode = "";
	var f_auto_sync = getSwitch('#storage_raidFormatAutoRebuild3_switch');
	
	if ( ( my_mode == "standard") || ( my_mode == "linear") || ( my_mode == "raid0"))	f_auto_sync = 0;
	
	INTERNAL_FMT_diskmgr_create(my_volume_info,f_auto_sync);
}

//function Check_SYS_Finish_State(id_name)
//{
//   wd_ajax({
//			url:"/cgi-bin/hd_config.cgi",
//			type:"POST",
//			data:{cmd:'cgi_Check_Disk_Remount_State'},
//			async:false,
//			cache:false,
//			dataType:"xml",
//			success: function(xml)
//			{
//				if ( $(xml).find("res").text() == "1")
//				{
//				   if (intervalId != 0) clearInterval(intervalId);
//				   Show_result_info(id_name);
//				    
//				   switch(id_name)
//				   { 	
//					   	case "reformat":
//							$("#Reformat_Dsk_Diag_Wait").hide();
//							$("#Reformat_Dsk_Diag_Res").show();
//					   	break;
//					   	
//					   	case "reformat_r5spare":
//							$("#Reformat_Dsk_Diag_Wait").hide();
//							$("#Reformat_Dsk_Diag_Res").show();
//					   	break;
//					   	
//						case "migrate_resize_sync":
//							$("#Reformat_Dsk_Diag_Wait").hide();
//							$("#Reformat_Dsk_Diag_Res").show();
//						break;
//				   }
//			    }
//			}
//	});	
//}

function INTERNAL_FMT_HD_Remount(id_name)
{	
	restart_web_timeout();
	
	wd_ajax({
			url:"/cgi-bin/hd_config.cgi",
			type:"POST",
			data:{cmd:'cgi_Disk_Remount'},
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml)
			{
				if ( $(xml).find("res").text() == "1")
				{
					if (intervalId != 0) clearInterval(intervalId);
					intervalId = setInterval("Check_SYS_Finish_State('"+id_name+"')",3000);
					
					switch(id_name)
					{
//						case "formatdsk":
//							FMT_GUI_Log("1","2","none");
//							$("#dskDiag_bar").hide();
//							$("#dskDiag_wait").show();
//						break;
						
						case "reformat":
							FMT_GUI_Log("2","2","none");
							$("#Reformat_Dsk_Diag_Bar").hide();
							$("#Reformat_Dsk_Diag_Wait").show();
						break;
						
//						case "remain":
//							FMT_GUI_Log("4","2","none");
//							$("#Remain_Dsk_Diag_Bar").hide();
//							$("#Remain_Dsk_Diag_Wait").show();
//						break;
						
//						case "reformat_r5spare":
//							FMT_GUI_Log("5","2","none");
//							$("#Reformat_Dsk_Diag_R5Spare_Bar").hide();
//							$("#Reformat_Dsk_Diag_Wait").show();
//						break;
						
						case "migrate_resize_sync":
							FMT_GUI_Log("16","2","none");
							$("#Reformat_Dsk_Diag_Migrate_Resize_Sync").hide();
							$("#Reformat_Dsk_Diag_Wait").show();
						break;
//						
//						case "reformat_std2r1":
//							FMT_GUI_Log("2","2","none");
//							$("#Reformat_Dsk_Diag_Std2R1_Sync").hide();
//							$("#Reformat_Dsk_Diag_Wait").show();
//						break;
					}
				}
			}
		});	// end of ajax
}

function INTERNAL_FMT_Check_Partitioning_Finish(id_name)
{		
		/* ajax and xml parser start*/
		wd_ajax({
			url:FILE_DM_READ_STATE,
			type:"POST",
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml){
					
						 var bar_amount= $(xml).find("dm_state>percent").text();
						 var bar_state=$(xml).find("dm_state>finished").text();
						 var bar_desc=$(xml).find("dm_state>describe").text();
						 var bar_errcode=$(xml).find("dm_state>errcode").text();
						 
						 if ( parseInt(bar_state) == 1 || parseInt(bar_errcode) != 1 )
						 {
						 	if (intervalId != 0) clearInterval(intervalId);
							
							switch(id_name)
							{
								case "reformat_r12r5_1st":
									INTERNAL_FMT_DiskMGR_2ND_R12R5();
								break;
								
								case "reformat_r12r5_2nd":
									INTERNAL_FMT_DiskMGR_R12R5_Sync_Init();	
								break;
								
								default:
									INTERNAL_FMT_HD_Remount(id_name);
								break;
							}	
						 }
				
			}//end of success: function(xml){
		}); //end of wd_ajax({	
}

function INTERNAL_FMT_Check_Is_Unues(my_dev)
{
	var flag = 1;
	
	if(typeof UNUSED_VOLUME_INFO == 'undefined')  INTERNAL_FMT_Load_UNUSED_VOLUME_INFO();
	
	var ori_dev="";
	$('unused_volume_info>item', UNUSED_VOLUME_INFO).each(function(e){
		
		ori_dev = $('partition',this).text();
		if ( my_dev.indexOf(ori_dev) != -1 ) 
		{
			flag = 0; 
			return false;
		}
	});	//end of each
	
	return flag;
}

function INTERNAL_FMT_Get_Free_SharedName()
{	
	var my_sharedname_tmp = new Array(0,0,0,0);
	var my_sharedname = new Array();
	
	if(typeof USED_VOLUME_INFO == 'undefined')  INTERNAL_FMT_Load_USED_VOLUME_INFO();

	$('item', USED_VOLUME_INFO).each(function(e){
		var my_volume = $('volume',this).text();
		var my_dev = $('device',this).text();
		
		if ( INTERNAL_FMT_Check_Is_Unues(my_dev) != 0 )
		{
			var my_idx = parseInt(my_volume) - 1;
			my_sharedname_tmp[my_idx] = 1 ;
		}	
	});	//end of each
	
	for(var i=0;i<my_sharedname_tmp.length;i++)
	{
		var my_volume_state = my_sharedname_tmp[i].toString();
		if (parseInt(my_volume_state) == 0)
			my_sharedname.push(i+1);
	}
	
	return my_sharedname;
}
function INTERNAL_FMT_Get_Mbytes(my_blocks_size,pos)
{
	var my_Mbytes = 0;
	var _tmp_blocks_size = parseInt(my_blocks_size);
	
	var _blocks_gibytes = _tmp_blocks_size / 1024;
	my_Mbytes = Math.round(_blocks_gibytes*Math.pow(10, pos))/Math.pow(10, pos);
	
	return my_Mbytes;
}
function INTERNAL_FMT_Get_Gibytes(my_blocks_size,pos)
{
	var my_Gibytes = 0;
	var _tmp_blocks_size = parseInt(my_blocks_size);
	
	var _blocks_gibytes = _tmp_blocks_size / BLOCKS_1G_GIBYTES;
	my_Gibytes = Math.round(_blocks_gibytes*Math.pow(10, pos))/Math.pow(10, pos);
	
	return my_Gibytes;
}

function INTERNAL_FMT_Get_Tibytes(my_blocks_size,pos)
{
	var my_Gibytes = 0;
	var _tmp_blocks_size = parseInt(my_blocks_size);
	
	var _blocks_gibytes =( _tmp_blocks_size / BLOCKS_1G_GIBYTES) /1024;
	my_Gibytes = Math.round(_blocks_gibytes*Math.pow(10, pos))/Math.pow(10, pos);
	
	return my_Gibytes;
}
function INTERNAL_HD_Gibytes(my_blocks_size,my_pos)
{
	var my_hd_info = new Array();
	var my_Gibytes = 0;
	
	if ( parseInt(BLOCKS_1T_GIBYTES) < parseInt(my_blocks_size))
	{
		var _tmp_blocks_size = parseInt(my_blocks_size);
		var _blocks_gibytes = _tmp_blocks_size / BLOCKS_1T_GIBYTES;
		my_Gibytes = Math.round(_blocks_gibytes*Math.pow(10, my_pos))/Math.pow(10, my_pos);
		
		my_hd_info[0]= my_Gibytes;
		my_hd_info[1]="TB ";
	}
	else
	{	
		var _tmp_blocks_size = parseInt(my_blocks_size);
		var _blocks_gibytes = _tmp_blocks_size / BLOCKS_1G_GIBYTES;
		my_Gibytes = Math.round(_blocks_gibytes*Math.pow(10, my_pos))/Math.pow(10, my_pos);
		
		my_hd_info[0]= my_Gibytes;
		my_hd_info[1]= "GB ";
	}	
	
	return my_hd_info;
}

function diskmgr_restart()
{
	 wd_ajax({
		url:"/cgi-bin/hd_config.cgi",
		type:"POST",
		data:{cmd:'cgi_Restart'},
		async:false,
		cache:false,
		dataType:"xml",
		success: function(xml)
		{	
		}
	});	// end of ajax
}

function INTERNAL_Check_Diskmgr_ps()
{
	var flag = 0;
	
	wd_ajax({
		url:"/cgi-bin/hd_config.cgi",
		type:"POST",
		data:{cmd:'cgi_FMT_Disk_DiskMGR_ps'},
		async:false,
		cache:false,
		dataType:"xml",
		success: function(xml)
		{	
			flag =  $(xml).find("res").text();
		}
	});	// end of ajax
	
	return flag;
}
function INTERNAL_Check_Rebuild_MinReqSize(source_dev, newly_dev)
{		
		var source_dev_min_req_size = parseInt(PARTITION_HIDDEN,10) + parseInt(PARTITION_SWAP,10);
		var nely_dev_min_req_size = 0;
		var all_hd_info = INTERNAL_Get_HD_Info();
		
		//source dev
		for (var idx=0;idx<all_hd_info.length; idx++)
		{
			if (source_dev == all_hd_info[idx][0])
			{
				source_dev_min_req_size += parseInt(all_hd_info[idx][7],10);
				break;
			}
		}
		
		//newly dev
		for (idx=0;idx<all_hd_info.length; idx++)
		{
			if (newly_dev == all_hd_info[idx][0])
			{
					nely_dev_min_req_size = all_hd_info[idx][5];
					break;
			}		
		}
		
		var res = (parseInt(source_dev_min_req_size,10) < parseInt(nely_dev_min_req_size,10))?1:0;
		return res;
}
function INTERNAL_Rebuild_Get_UUID(my_mount)
{
	if(typeof SYSINFO == 'undefined')  INTERNAL_FMT_Load_SYSINFO();
	
	var my_uuid = "";
	$('raids>raid', SYSINFO).each(function(idx){	
			if ($('dev',this).text() == my_mount)
			{
					my_uuid = $('uuid',this).text();
					return false; 
			}
	});	
	return my_uuid;
}
function RAID_Manually_Rebuild_dialog()
{
	if ( RAID_VolList_timeoutId != 0 ) clearTimeout(RAID_VolList_timeoutId);
	RAID_VolList_timeoutId = setTimeout("RAID_Status_AutoRefresh()", 6000);
	    	
	var all_rebuild_info = new Array();	
	
	if(typeof UNUSED_VOLUME_INFO == 'undefined')  INTERNAL_FMT_Load_UNUSED_VOLUME_INFO();
	var msg = "";			
	$('rebuild_node > item', UNUSED_VOLUME_INFO).each(function(e){
		var idx = all_rebuild_info.length;
		
		switch($('raid_mode',this).text())
		{
			case 'raid10':
				var my_source_dev = $('device',this).text().slice(0,3);		
				var my_newly_dev = INTERNAL_FMT_Convert_Device_Name(0,$(UNUSED_VOLUME_INFO).find('rebuild_node > item > partition').text());
				var _tmp = my_newly_dev.split(",");
				var hd_min_req_size_chk = 1;
				for(var i=0; i<_tmp.length;i++)
				{
					if (INTERNAL_Check_Rebuild_MinReqSize(my_source_dev, _tmp[i].toString()) == 0)
					{
							hd_min_req_size_chk = 0;									
							break;
					}
				}
				if (hd_min_req_size_chk == 1)
				{
					$("#RAID_Manually_Rebuild_desc1").show();
					$("#RAID_Manually_Rebuild_desc2").hide();
					
					if ($("#storage_raidManuallyRebuildNext1_button").hasClass('grayout')) $("#storage_raidManuallyRebuildNext1_button").removeClass('grayout');
				}
				else
				{
					var my_desc = _T('_raid','desc113').replace(/RAID 1/,_T('_raid','desc11'));
					$("#RAID_Manually_Rebuild_desc2").html(my_desc);
					
					$("#RAID_Manually_Rebuild_desc1").hide();
					$("#RAID_Manually_Rebuild_desc2").show();
					
					if (!$("#storage_raidManuallyRebuildNext1_button").hasClass('grayout')) $("#storage_raidManuallyRebuildNext1_button").addClass('grayout');
				}
						
				all_rebuild_info[idx] = new Array();
				all_rebuild_info[idx][0] = $('volume',this).text();				//Volume Name,ex:1,2,3,4
				all_rebuild_info[idx][1] = $('raid_mode',this).text();		//RAID Mode,ex:raid1,raid5,raid5+spare,raid10
				all_rebuild_info[idx][2] = $('mount',this).text();				//Mount,ex:/dev/md1,/dev/md2,/dev/md3,/dev/md4
				all_rebuild_info[idx][3] = $('device',this).text();				//Source Dev,ex:sda,sdasdb,sdc
				all_rebuild_info[idx][4] = $(UNUSED_VOLUME_INFO).find('rebuild_node > item > partition').text(); //Newly Dev,ex:sda
				all_rebuild_info[idx][5] = ($('volume_encrypt',this).text() == "")?0:$('volume_encrypt',this).text();											//Volume Encryption State,ex:1->enable,0->disable
				all_rebuild_info[idx][6] = ($('volume_encrypt_automount',this).text() == "")?0:$('volume_encrypt_automount',this).text();	//Volume Encryption/Auto-Mount,ex:1->enable,0->disable
				all_rebuild_info[idx][7] = ($('volume_encrypt_pwd',this).text() == "")?0:$('volume_encrypt_pwd',this).text();							//Volume Encryption/password
				all_rebuild_info[idx][8] = $('file_type',this).text();		//Filetype,ex:ext3,ext4
				all_rebuild_info[idx][9] = INTERNAL_Rebuild_Get_UUID($('mount',this).text());	//UUID
				return false;
			break;
			
			case 'raid1':
			case 'raid5':
				var _tmp = $('rebuild_device',this).text();						//Newly Dev,ex:/dev/sda2
				my_newly_dev = _tmp.slice(5,8) ;				
				
				var my_source_dev = $('device',this).text().slice(0,3);	
				var hd_min_req_size_chk = INTERNAL_Check_Rebuild_MinReqSize(my_source_dev, my_newly_dev);
				
				if (hd_min_req_size_chk == 1)
				{
					$("#RAID_Manually_Rebuild_desc1").show();
					$("#RAID_Manually_Rebuild_desc2").hide();
					
						if ($("#storage_raidManuallyRebuildNext1_button").hasClass('grayout')) $("#storage_raidManuallyRebuildNext1_button").removeClass('grayout');
				}
				else
				{
					if ($('raid_mode',this).text() == "raid5") 
					{
						var my_desc = $("#RAID_Manually_Rebuild_desc2").text().replace(/RAID 1/,_T('_raid','desc9'));
						$("#RAID_Manually_Rebuild_desc2").html(my_desc);
					}	
					
					$("#RAID_Manually_Rebuild_desc1").hide();
					$("#RAID_Manually_Rebuild_desc2").show();
					
						if (!$("#storage_raidManuallyRebuildNext1_button").hasClass('grayout')) $("#storage_raidManuallyRebuildNext1_button").addClass('grayout');
				}
				var rebuild_device = $.trim($('rebuild_device',this).text());
				var isRebuild = HD_Config_CheckIsRoaming(rebuild_device);
				msg += "rebuild_device = " + rebuild_device + "\n";
				msg += "HD_Config_CheckIsRoaming("+rebuild_device+") = " + HD_Config_CheckIsRoaming(rebuild_device) + "\n";
				if (isRebuild == 0){
					
					all_rebuild_info[idx] = new Array();
					all_rebuild_info[idx][0] = $('volume',this).text();			//Volume Name,ex:1,2,3,4
					all_rebuild_info[idx][1] = $('raid_mode',this).text();	//RAID Mode,ex:raid1,raid5,raid5+spare,raid10
					all_rebuild_info[idx][2] = $('mount',this).text();			//Mount,ex:/dev/md1,/dev/md2,/dev/md3,/dev/md4
					all_rebuild_info[idx][3] = $('device',this).text();			//Source Dev,ex:sda,sdasdb,sdc
					all_rebuild_info[idx][4] = my_newly_dev;								//Newly Dev,ex:sda
					all_rebuild_info[idx][5] = ($('volume_encrypt',this).text() == "")?0:$('volume_encrypt',this).text();											//Volume Encryption State,ex:1->enable,0->disable
					all_rebuild_info[idx][6] = ($('volume_encrypt_automount',this).text() == "")?0:$('volume_encrypt_automount',this).text();	//Volume Encryption/Auto-Mount,ex:1->enable,0->disable
					all_rebuild_info[idx][7] = ($('volume_encrypt_pwd',this).text() == "")?0:$('volume_encrypt_pwd',this).text();							//Volume Encryption/password
					all_rebuild_info[idx][8] = $('file_type',this).text();	//Filetype,ex:ext3,ext4
					all_rebuild_info[idx][9] = INTERNAL_Rebuild_Get_UUID($('mount',this).text());	//UUID
					
					msg += all_rebuild_info[idx].toString() + "\n";
//					alert(msg);
				}
			break;	
		}		
	});	//end of each
	
	$("#RAID_Diag_title").html(_T('_raid','button1'));
	
	//adjust_dialog_size("#RAID_Diag",650,345);
	adjust_dialog_size("#RAID_Diag",750,345);
	var RAIDObj = $("#RAID_Diag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});
	init_button();
	language();
		
	INTERNAL_DIADLOG_DIV_HIDE("RAID_Diag");
	$("#RAID_Manually_Rebuild_Set1").show();
	$("#RAID_Manually_Rebuild_Set2").hide();
		
	RAIDObj.load();
	 	
 	$("#RAID_Diag .close").click(function(){
		
		RAIDObj.close();
		
		INTERNAL_DIADLOG_BUT_UNBIND("RAID_Diag");
		INTERNAL_DIADLOG_DIV_HIDE("RAID_Diag");
		
		if ( $("#storage_raidManuallyRebuild_button").hasClass("gray_out") )  $("#storage_raidManuallyRebuild_button").removeClass("gray_out");
		RAID_VolList_timeoutId = setTimeout("RAID_Status_AutoRefresh()", 6000);
	});	
	
	$("#storage_raidManuallyRebuildNext1_button").click(function(){
		if ($(this).hasClass('grayout')) return;

		var my_dev = get_dev_name(all_rebuild_info, 4);
		clearTimeout(INTERNAL_FMT_Physical_Disk_List_timeout);
		send_smart_cmd(INTERNAL_FMT_Physical_Disk_List("manually_rebuild_hd_info",my_dev, 1), "RAID_Manually_Rebuild_Set1", "RAID_Manually_Rebuild_Set2");
	});	
	
	$("#storage_raidManuallyRebuildBack2_button").click(function(){
			$("#RAID_Manually_Rebuild_Set1").show();
			$("#RAID_Manually_Rebuild_Set2").hide();
	});		
	
	$("#storage_raidManuallyRebuildNext2_button").click(function(){	
		if ($(this).hasClass('grayout')) return;
		
		jLoading(_T('_common','set'), 'loading' ,'s', ''); 
		
		setTimeout(function() {
			HD_Config_Manually_Rebuild(all_rebuild_info);
		}, 500);
		
		RAIDObj.close();
		INTERNAL_DIADLOG_BUT_UNBIND("RAID_Diag");
		INTERNAL_DIADLOG_DIV_HIDE("RAID_Diag");		
	});		
}