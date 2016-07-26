var RAID_ROAMING = 0;
var RAID_ROAMING_Diag = 0;
var Disk_Sequence = 0, Disk_Sequence_Skip=0;
var _jScrollPane;
var vol_status = new Array();

function INTERNAL_FMT_Get_sdx2_Raid_Mode(dev)
{
	var raid_mode = "";
	
	if(typeof USED_VOLUME_INFO == 'undefined')  INTERNAL_FMT_Load_USED_VOLUME_INFO();
				
	$('item', USED_VOLUME_INFO).each(function(e){
		
		var my_raid_mode = $('raid_mode',this).text();
		var my_dev = $('device',this).text();
		
		if (my_dev.indexOf(dev) != -1)
		{
			raid_mode = my_raid_mode;
			return false;
		}
		
	});	//end of each
	
	return raid_mode;
}
function HD_Config_Check_RAID_SYNC_Now(my_vol)
{
	/*
		my_vol: 0 -> any volume
				1(or 2,3,4) -> only check volume_1(or volume_2,volume_3,volume_4)
		flag: 0 -> No Sync
			  1 -> Sync Now or Wait Sync
	*/
	var flag = 0;
	
	wd_ajax({
	type: "POST",
	async:false,
	cache:false,
	url: "/cgi-bin/hd_config.cgi",
	data:{cmd:'cgi_FMT_Get_Sync_State'},
	dataType: "xml",
	success: function(xml) {	  	  	
	    
	    var my_wait_sync = $(xml).find("wait_sync").text();
	   
	    if ( parseInt(my_wait_sync) == 1) 
	    	flag = 1;
	    else	
	    {
		    /* ajax and xml parser start*/
			wd_ajax({
				url:FILE_DM_READ_PROGRESS,
				type:"POST",
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml){
					
				    if (parseInt(my_vol) == 0 )
				    {
						var bar_amount = $(xml).find("dm_progress > item > progress").text();
						if ( bar_amount != "") flag = 1;
					}
					else	
					{
						$('dm_progress>item',xml).each(function(e){
							var vol = $('volume',this).text();
							if (parseInt(vol) == parseInt(my_vol))
							{
								flag = ($('progress',this).text() != "")?1:0;
								return false;
							}
							
						});	//end of $('dm_progress>item',xml).each(function(e){
					}
				}//end of success
			});	//end of ajax  	
		}
	                                         
	 }//end of success
	});	//end of ajax  
	
	return flag;
}
function HD_Config_Disk_Sequence()
{
	Disk_Sequence = 0;
	var all_hd_info = new Array();	
	all_hd_info.length = 0;
	
	wd_ajax({
				url: "/xml/hd_right_position.xml",
				type: "POST",
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml){
				var idx = 0;
				$('item',xml).each(function(e){
					
//					all_hd_info.length = 0;
					//if ($('allowed',this).text() == "1")
					{
						all_hd_info[idx] = new Array();
						all_hd_info[idx][0] = $('device_name',this).text();
						all_hd_info[idx][1] = $('scsi',this).text();
						all_hd_info[idx][2] = $('vendor',this).text();
						all_hd_info[idx][3] = $('model',this).text();
						all_hd_info[idx][4] = $('hd_serial',this).text();
						all_hd_info[idx][5] = $('hd_size',this).text();
						var my_GBytes = size2str((parseInt($('hd_size',this).text(), 10)*1024), "GB").split(" ");
						all_hd_info[idx][6] = parseInt(my_GBytes[0], 10);
						all_hd_info[idx][7] = $('sdx2_size',this).text();
						idx++;
					}	
				});	//end of each
				
			},
            error:function (xhr, ajaxOptions, thrownError){}  
	});
	
	if (all_hd_info.length != 0 )
	{
		Disk_Sequence = 1;
		
		if ( RAID_VolList_timeoutId != 0 ) clearTimeout(RAID_VolList_timeoutId);
		setTimeout(function(){
				
				var hd_info = FMT_HD_INFO;
				var html_tr = "";
				$("#Seq_Current_Disk_Info").empty();
				for (var i=0;i<hd_info.length;i++)
				{
					if ((i%2) == 1)
						html_tr += "<tr id='row " + i + "' class='erow'>";
					else
						html_tr += "<tr id='row " + i + "'>";
					html_tr += "<td align=\"left\"><div style=\"text-align: left; width: 100px;\">"+INTERNAL_FMT_Convert_Device_Name(1,hd_info[i][0])+"</div></td>";
					html_tr += "<td align=\"left\"><div style=\"text-align: left; width: 100px;\">"+hd_info[i][6]+" GB</div></td>";
					html_tr += "<td align=\"left\"><div style=\"text-align: left; width: 300px;\">"+hd_info[i][4]+"</div></td>";
					html_tr += "</tr>";
				}
				$("#Seq_Current_Disk_Info").append(html_tr);
				
				var corrent_hd_info = all_hd_info;
				html_tr = "";
				$("#Seq_Corrent_Disk_Info").empty();
				for (i=0;i<corrent_hd_info.length;i++)
				{
					if ((i%2) == 1)
						html_tr += "<tr id='row " + i + "' class='erow'>";
					else
						html_tr += "<tr id='row " + i + "'>";
					
					html_tr += "<td align=\"left\"><div style=\"text-align: left; width: 100px;\">"+INTERNAL_Disk_Get_Slot_Info(corrent_hd_info[i][1])+"</div></td>";
					if (corrent_hd_info[i][2].toString() == "--")
						html_tr += "<td align=\"left\"><div style=\"text-align: left; width: 100px;\">"+corrent_hd_info[i][6]+"&nbsp;</div></td>";
					else
						html_tr += "<td align=\"left\"><div style=\"text-align: left; width: 100px;\">"+corrent_hd_info[i][6]+"&nbsp;GB</div></td>";
					html_tr += "<td align=\"left\"><div style=\"text-align: left; width: 300px;\">"+corrent_hd_info[i][4]+"</div></td>";
					html_tr += "</tr>";
				}
				$("#Seq_Corrent_Disk_Info").append(html_tr);
				$("#RAID_Diag_title").html(_T('_raid','desc89'));	
				
				var RAIDObj = $("#RAID_Diag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});
				
				init_button();
				language();
				
				INTERNAL_DIADLOG_DIV_HIDE("RAID_Diag");
				$("#RAID_Disk_Sequence").show();
				
				$("#RAID_Diag").width("650px").height("600px");
				RAIDObj.load();
			 
			 	$("#RAID_Diag .close").click(function(){
					
					RAIDObj.close();
					$("#RAID_Diag").width("650px").height("350px");
					
					Disk_Sequence_Skip = 1;
					
					INTERNAL_DIADLOG_BUT_UNBIND("RAID_Diag");
					INTERNAL_DIADLOG_DIV_HIDE("RAID_Diag");
				});
		},500);
	}//end of if (all_hd_info.length != 0 )	
}
function HD_Config_CheckIsRoaming(my_dev)
{
	var flag = 0;
	
	$(USED_VOLUME_INFO).find('volume_info').find('item').each(function(idx){
		var used_device = $.trim($('used_device',this).text());
				
		if (used_device.indexOf(my_dev) != -1)
		{
			flag = 1;
			return;
		}	
	});//end of each
	
	return flag;
}
function HD_Config_Show_Button(my_state)
{
	/*
		my_state[0], Volume Name, ex:Volume_1
		my_state[1], RAID Mode, ex:raid1/raid5
		my_state[2], Volume State, ex:degraded		
	*/
	var msg = "";
	var raid_status = "",	raid_autorebuild_switch = 0;
	for(var idx=0; idx < my_state.length; idx++)
	{
		msg += my_state[idx].toString() + "\n";
		if( (my_state[idx][1].toString() == "raid1") ||
			  (my_state[idx][1].toString() == "raid5") ||
			  (my_state[idx][1].toString() == "raid10") )
		{
			raid_autorebuild_switch = 1;
		}
		raid_status = (raid_status == "" ||　raid_status == "clean")?my_state[idx][2].toString():raid_status;
	}
	msg += "raid_status = " + raid_status + "\n";
	//alert(msg);
	
	/*Auto-Rebuild Switch*/
	if (parseInt(raid_autorebuild_switch,10) == 1)
	{
		$("#storage_RAIDAutoRebuild_tr").show();
		$("#storage_RAIDAutoRebuildswitch_td").show();
		$("#storage_RAIDAutoRebuildtip_td").show();
	}
	else
	{
		$("#storage_RAIDAutoRebuild_tr").hide();
		$("#storage_RAIDAutoRebuildswitch_td").hide();
		$("#storage_RAIDAutoRebuildtip_td").hide();
		$("#storage_RAIDManuallyRebuildbutton_td").hide();
	}	
	
	//Volume Status
	switch(raid_status){
	case "degraded":	
			//Check disks sequence are not valid.
			if (Disk_Sequence_Skip == 0 && HD_STATE == 6)
			{
				HD_Config_Disk_Sequence();
			}
			else
			{		
				var msg = "";
				var isRebuild = 0;
				$('rebuild_node > item', UNUSED_VOLUME_INFO).each(function(e){
					var rebuild_device = $.trim($('rebuild_device',this).text());
					if(rebuild_device.length != 0){
					
						msg += "rebuild_device = " + rebuild_device + "\n";
						msg += "HD_Config_CheckIsRoaming("+rebuild_device+") = " + HD_Config_CheckIsRoaming(rebuild_device) + "\n";
						//alert(msg);
						
						isRebuild = HD_Config_CheckIsRoaming(rebuild_device);
						if (isRebuild == 0)
						{
							$("#storage_RAIDManuallyRebuildbutton_td").show();
							$("#storage_raidManuallyRebuild_button").show().removeClass("gray_out");
						}
					}
				});//end of each
				
				
				
			}	
			
			$("#storage_raidSetupRAIDMode_button").hide();
			$("#storage_raidChangeRAIDMode_button").show();
			$("#div_reamin").hide();
	break;
	
	case "resync":
			$("#storage_raidSetupRAIDMode_button").hide();
			$("#storage_raidChangeRAIDMode_button").show();
			$("#storage_raidManuallyRebuild_button").hide();
			$("#div_reamin").hide();
	break;
	
	case "rebuilding":
			$("#storage_raidSetupRAIDMode_button").hide();
			$("#storage_raidChangeRAIDMode_button").show();
			$("#storage_raidManuallyRebuild_button").hide();
			$("#div_reamin").hide();
	break;
	
	case "resize":
	case "resize_wait":
			$("#storage_raidSetupRAIDMode_button").hide();
			$("#storage_raidChangeRAIDMode_button").hide();
			$("#div_reamin").hide();
	break;
	
	case "unplugHD":
	case "plugHD":
			$("#storage_raidSetupRAIDMode_button").hide();
			$("#storage_raidChangeRAIDMode_button").show();
			$("#div_reamin").hide();
	break;
	
	case "none":
	case "unknown":
			$("#storage_raidSetupRAIDMode_button").show();
			$("#storage_raidChangeRAIDMode_button").hide();
			$("#div_reamin").hide();
	break;
	
	case "expansion":
			 $("#storage_raidChangeRAIDMode_button").show();
			 $("#storage_raidSetupRAIDMode_button").hide();
       $("#storage_raidManuallyRebuild_button").hide();
       $("#div_reamin").hide();
	break;
	
	case "clean":
			$("#storage_raidSetupRAIDMode_button").hide();
			$("#storage_raidChangeRAIDMode_button").show();
			RAID_AllowToRemain();			
	break;
	
	case "damaged":
			$("#storage_raidSetupRAIDMode_button").hide();
			$("#storage_raidChangeRAIDMode_button").show();
			$("#storage_raidManuallyRebuild_button").hide();
      $("#div_reamin").hide();
	break;
	}	
	
//	FMT_HD_INFO = INTERNAL_Get_HD_Info();
//			
//	if (FMT_HD_INFO.length == 0) return;
//	
//	//create all button
//	var newlyhd_num = 0;
//	$('unused_volume_info > item > partition', UNUSED_VOLUME_INFO).each(function(e){
//		if ($(this).text().length == 3) newlyhd_num++;
//	});		
//	
//	if(FMT_HD_INFO.length == newlyhd_num)
//	{
//		$("#storage_raidSetupRAIDMode_button").show();
//		$("#storage_raidChangeRAIDMode_button").hide();
//	}
	

	//remain to linear
	function RAID_AllowToRemain(){	
		
		var my_remain_dev = new Array();	
		var my_creat_dev = new Array();	
				
		//Newly Insert HD or Remain to Linear
		$('unused_volume_info > item', UNUSED_VOLUME_INFO).each(function(e){
				
			var my_partition = $('partition',this).text();
			var my_size = $('size',this).text();
		   	
			if (my_partition.length == 3)
				my_creat_dev.push(my_partition);
			else if (my_partition.length == 4)
			{	
				var my_partition_num = my_partition.substr(3,4);
				if (my_partition_num == 2)
				{
					my_creat_dev.push(my_partition);
				}
				else if (my_partition_num == 3)
				{
					var my_dev = my_partition.substr(0,3);
					var my_raid_mode = INTERNAL_FMT_Get_sdx2_Raid_Mode(my_dev);
					
					if ( (my_raid_mode != "standard") && 
						 (my_raid_mode != "linear"))	
					{	
						my_remain_dev.push(my_partition);
					}
				}	
			}	
				
		});	//end od each
		if (my_remain_dev.length > 1 ) 
		{
			FMT_Remain_Data_Init(2);
			var total_size = 0;	//unit is GB
			for(var i=0; i< CREATE_VOLUME_INFO.length; i++)
			{
				var my_devlist = INTERNAL_FMT_Convert_Device_Name(0,CREATE_VOLUME_INFO[i][3]).split(",");
				total_size = 0;	
				for (var j=0; j<my_devlist.length; j++)
				{
					total_size += parseInt(INTERNAL_Get_Device_Free_Size(my_devlist[j]),10);
				}
				var remain_min_size = 1.5 * my_devlist.length;
				
				if ( parseInt(total_size,10) > remain_min_size )
				{
					$("#div_reamin").show();
					break;
				}
			}
		}
		//alert(msg)
	}
}
function INTERNAL_FMT_Check_Offl_Chk()
{
	wd_ajax({
		type: "POST",
		async:false,
		cache:false,
		url: "/cgi-bin/hd_config.cgi",
		data:{cmd:'cgi_Offl_Chk_running'},
		dataType: "xml",
		success: function(xml) {},
	    error:function (xhr, ajaxOptions, thrownError){}  
	});	
}

function HD_Config_FMT_CGI_Log()
{
	wd_ajax({
		url: FILE_CGI_FMT_GUI_LOG,
		type: "POST",
		async:false,
		cache:false,
		dataType:"xml",
		success: function(xml){
			
			var my_fmt_type = $(xml).find("my_type").text();
			var my_fmt_step = $(xml).find("my_step").text();
			var my_fmt_note = $(xml).find("my_note").text();
			
			switch(parseInt(my_fmt_type))
			{
				case 1:	//create all disk(s)
					FMT_CREATEALL_DATA_INIT = 0;
					FMT_CreateAll_Data_Init();
    				window.setTimeout("init_formatdsk_dialog('"+my_fmt_step+"')",1500);
				break;
				
				case 4:	//remain to linear
					FMT_REMAIN_DATA_INIT = 0;
					FMT_Remain_Data_Init(my_fmt_step);
					FMT_HD_INFO = INTERNAL_Get_HD_Info();
					window.setTimeout("init_remaindsk_dialog('"+my_fmt_step+"')",1500);
				break;
			}
			
			window.setTimeout(function() {
				stop_web_timeout(true);
			},5000);
			
		},
        error:function (xhr, ajaxOptions, thrownError){}  
	});
}

function HD_Config_AutoRebuild_Get_Info()
{
	wd_ajax({
	type: "POST",
	url: "/cgi-bin/hd_config.cgi",
	data:{cmd:'cgi_FMT_Get_Auto_Rebuild_Info'},
	dataType: "xml",
	success: function(xml) {
			  	  	
	    var my_auto_sync = $(xml).find("auto_sync").text(); 
	    setSwitch('#storage_raidAutoRebuild_switch', parseInt(my_auto_sync,10));
	   
	 }//end of success
	 
	});	//end of ajax    
}

function HD_Config_Set_Auto_Rebuild_Info()
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
	
	var my_auto_sync = getSwitch('#storage_raidAutoRebuild_switch');
	
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/hd_config.cgi",
		data:{cmd:'cgi_FMT_Set_Auto_Rebuild_Info',f_auto_sync:my_auto_sync},
		dataType: "xml",
		success: function(xml) {
			google_analytics_log('RAID_Auto_Rebuild', my_auto_sync);
			jLoadingClose();
			
		}//end of success
	});	//end of ajax  	
}
function HD_Config_Manually_Rebuild(all_rebuild_info)
{	
	if ( all_rebuild_info.toString() != "")
	{
		wd_ajax({
			type: "POST",
			async:false,
			cache:false,
			url: "/cgi-bin/hd_config.cgi",
			data:{cmd:'cgi_FMT_Manually_Rebuild_Now',f_rebuild_volume_info:all_rebuild_info.toString()},
			dataType: "xml",
			success: function(xml) {
			   		if ( RAID_VolList_timeoutId != 0 ) clearTimeout(RAID_VolList_timeoutId);
			    	$("#vol_list").flexReload();
				
			   $("#storage_raidManuallyRebuild_button").hide();
				 $("#storage_raidChangeRAIDMode_button").hide();
				 $("#storage_raidSetupRAIDMode_button").hide();
				 $("#div_reamin").hide();
					
					jLoadingClose();
						                                         
			 }//end of success
		});	//end of ajax  
	}
}
function RAID_Status_AutoRefresh()
{
	$("#vol_list").flexReload();
	
	INTERNAL_FMT_Load_USED_VOLUME_INFO();
	INTERNAL_FMT_Load_UNUSED_VOLUME_INFO();
	INTERNAL_FMT_Load_SYSINFO();
}
function RAID_Volume_list()
{
	$("#vol_list").flexigrid({						
		url: '/cgi-bin/hd_config.cgi',		
		dataType: 'xml',
		cmd: 'cgi_RAID_Volume_Info',	
		colModel : [
			/*0*/{display: "Volume", name : 'my_vol', width : '100', sortable : true, align: 'left'},			//Text:Volume 1(2,3,4)
			/*1*/{display: "Mode", name : 'my_mode', width : '150', sortable : true, align: 'left'},				//Text:RAID Mode, ex:JBOD/Spanning/RAID0/RAID1/RAID5/RAID10
			/*2*/{display: "size", name : 'my_size', width : '100', sortable : true, align: 'left'},			//Text:Volume Size
			/*3*/{display: "status", name : 'my_status', width : '290', sortable : true, align: 'right'}	//Text:Status:Good/Bad
			],
		usepager: false,       //啟用分頁器
		useRp: true,
		rp: 10,               //預設的分頁大小(筆數)
		showTableToggleBtn: true,
		width:  650,
		height: 'auto',
		errormsg: _T('_common','connection_error'),		//Text:Connection Error
		nomsg: _T('_common','no_items'),				//Text:No items
//		singleSelect:true,
	    striped:true,   //資料列雙色交差
	    resizable: false,
	    noSelect:true,
	    onSuccess:function(){
	    	if ( RAID_VolList_timeoutId != 0 ) {
	    	clearTimeout(RAID_VolList_timeoutId);
	    	}
	    	RAID_VolList_timeoutId = setTimeout("RAID_Status_AutoRefresh()", 6000);

				HD_Config_Show_Button(vol_status);
				vol_status.length = 0;
				
	    },//end of onSuccess..
	    onError:function(r) {
	    	
	    }	,	
    	preProcess: function(r) {
    		var my_raid_state = 0; 
    		var my_raid_sync = 0;
    		var raid_damaged = false;

    		$(r).find('row').each(function(idx){
    			vol_status[idx] = new Array();
    			
    			vol_status[idx].push($(this).find('cell').eq(0).text());
    			
    			//RAID Mode
    			var my_mode = $(this).find('cell').eq(1).text();
    			vol_status[idx].push($(this).find('cell').eq(1).text());
    			var my_mode_tmp = $(this).find('cell').eq(1).text().replace(/standard/g,_T('_raid','desc5'))
	    									.replace(/linear/g,_T('_raid','desc6'))
	    									.replace(/raid0/g,_T('_raid','desc7'))
	    									.replace(/raid1/g,_T('_raid','desc8'))
	    									.replace(/raid5/g,_T('_raid','desc9'))
	    									.replace(/spare/g,_T('_raid','desc10'))
	    									.replace(/raid10/g,_T('_raid','desc11'));
    			$(this).find('cell').eq(1).text(my_mode_tmp);
    			
    			//Size
    			var my_size_tmp = $(this).find('cell').eq(2).text();
    			var my_size = (my_size_tmp == "--")? _T("_raid","unknown"):size2str(my_size_tmp);
    			$(this).find('cell').eq(2).text(my_size);
    			
    			//RAID State
    			var my_status = $(this).find('cell').eq(3).text();    			
    			//vol_status.push(my_status);
    			switch(my_status)
            		{		  
            			case "degraded"://Degraded
            				vol_status[idx].push("degraded");
            				
            				$(this).find('cell').eq(3).text(_T('_raid','desc44'));
            				my_raid_state = (my_raid_state == 0)?1:my_raid_state;
            			break;
            			
            			case "clean"://Complete
            				vol_status[idx].push("clean");
            				$(this).find('cell').eq(3).text(_T('_raid','desc45'));
            			break;

            			case "damaged"://damaged
            				vol_status[idx].push("damaged");
										raid_damaged = true;
            				$(this).find('cell').eq(3).text(_T('_raid','damaged')); //Damaged
            			break;

            			case "resize":
            				vol_status[idx].push("resize");
            				$(this).find('cell').eq(3).text(_T('_raid','desc86'));
            				$("#storage_raidManuallyRebuild_button").hide();
            			break;
            			
            			case "resize_wait":
            				vol_status[idx].push("resize_wait");
            				$(this).find('cell').eq(3).text(_T("_raid","desc91"));
            			break;
            			
            			case "expansion":
            				vol_status[idx].push("expansion");
            				$(this).find('cell').eq(3).text(_T('_raid','desc95'));
            			break;
            			
            			case 'migrate':
            				vol_status[idx].push("migrate");
            				$(this).find('cell').eq(3).text(_T('_raid','desc105'));
            			break;
            			
            			default:
            				var my_status = $(this).find('cell').eq(3).text().split(" ");
										my_raid_state = (my_raid_state == 0)?1:my_raid_state;
										
										switch(my_status.length)
										{
											case 2://unplug Disk1
												vol_status[idx].push("unplugHD");
												var my_dev = my_status[1].replace(/Disk/,_T('_raid','desc12'));
												var my_desc = _T('_raid','desc97').replace(/drive/, my_dev);
												$(this).find('cell').eq(3).text(my_desc);
											break;
											
											case 4://plug a blank disk
												vol_status[idx].push("plugHD");
												$(this).find('cell').eq(3).text(_T('_raid','desc98'));
											break;
											
											case 6://resync or reshaping
												vol_status[idx].push("resync");
												/*
													<row id="1">
														<cell>Volume_1</cell>
														<cell>raid5+spare</cell>
														<cell>7929940942848</cell>
														<cell>resync5 3 1432 mins 43856 KB</cell>
													</row>
												*/
												var my_precent = my_status[1].toString().replace(/\%/,"");
												if (my_status[0].toString() == "resync5")
												{
													var tpl = "{0} ({1}%)";
													var my_desc = String.format(tpl,
													/*0*/	_T('_raid','desc126'),
													/*1*/	my_precent);
												}	
												else
												{	
													var tpl = "{0}, {1}%, {2} mins";
													var my_VolState = my_status[0].toString()
															.replace(/resync1/,_T('_raid','desc79')) 	
															.replace(/recovery/,_T('_raid','desc79'))
															.replace(/expansion/,_T('_raid','desc95'))
															.replace(/migrate/,_T('_raid','desc82'))
															.replace(/resize/,_T('_raid','desc84'))
															.replace(/reshape/,_T('_raid','desc95'));
													var my_desc = String.format(tpl,
													/*0*/	my_VolState,
													/*1*/	my_precent,
													/*2*/	my_status[2]);		
												}			
												
												var bar = '<div class="list_icon_bar" style="width:340px;">' +
												  '<div class="bar_p" style="width: {0}%"></div>' +
												  '</div>' +	
												  '<span class="list_icon_bar_text" style="float: left;">{1}</span>';
												var my_html = String.format(bar, my_precent, my_desc);
												$(this).find('cell').eq(3).text(my_html);
											break;
											
											case 7://Rebuilding or Migration
												vol_status[idx].push("rebuilding");
												var my_precent = parseInt(my_status[2].toString().replace(/\%/,""),10);
												
												/* format :
													Rebuilding, 0%, 542 mins, my_raid_state[0] = "resync" or  "recovery", rebuilding/recovery,sdb,53,1,mins,67922,KB
													Migration, 0%, 542 mins,  my_raid_state[0] = "migrate", migrate 30 8 mins 12416 KB
												*/
												FMT_HD_INFO.length = 0;
												FMT_HD_INFO = INTERNAL_Get_HD_Info();
												
												var my_desc = my_status[0].toString()
															.replace(/resync/,_T('_raid','desc79'))
															.replace(/recovery/,_T('_raid','desc79'))
															.replace(/expansion/,_T('_raid','desc95'))
															.replace(/migrate/,_T('_raid','desc82'))
															.replace(/resize/,_T('_raid','desc84'))
												my_desc += "("+INTERNAL_FMT_Convert_Device_Name(1,my_status[1])+"), "+ my_precent+"%, "+my_status[3]+" "+_T('_raid','desc107');
												
												var bar = '<div class="list_icon_bar" style="border:0px solid red;width:340px;">' +
																	'<div class="bar_p" style="width:{0}%"></div>' + 
												  				'</div>'+
												  				'<span class="list_icon_bar_text">{1}</span>';
												var my_html = String.format(bar, my_precent, my_desc);
												$(this).find('cell').eq(3).text(my_html);
											break;
											
											default:
												vol_status[idx].push("unknown");
												$(this).find('cell').eq(3).text(_T("_raid","desc64"));
											break;
										}	
            			break;
            		}
    			
    		});	
    		
    		if (parseInt($(r).find('total').text(), 10) == 0)
    		{
    			vol_status[0] = new Array("none","none","none");
    			$("#storage_RAIDAutoRebuild_tr").hide();
    		
					FMT_HD_INFO.length=0;
					FMT_HD_INFO = INTERNAL_Get_HD_Info();
					if (FMT_HD_INFO.length == 0)
					{
						$("#storage_raidChangeRAIDMode_button").hide();
						$("#storage_raidSetupRAIDMode_button").hide();
					}
					else
						HD_Config_Show_Button(vol_status);
    		}
    		Storage_RAID_Profile();
    		
    		return r;
    	}	
	});  
}
function Remain_Linear_Format()
{ 
	jConfirm('M', _T('_raid','desc90'), _T('_common','warning') ,"warning" ,function(r){
		if(r)
		{
			FMT_REMAIN_DATA_INIT = 0;
			FMT_Remain_Data_Init('0');
	
			window.setTimeout("init_remaindsk_dialog('0')",500);
		}
	});	//end of jConfirm
}

function Storage_RAID_Profile()
{ 
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/home_mgr.cgi",
		data: {cmd:'9'},		
		dataType: "xml",		
		async: true,
		cache:false,
		success: function(xml){
				var CntVol = parseInt($(xml).find("cntVol").text(),10);
				var CntDisk = parseInt($(xml).find("cntDisk").text(),10);
				var isDegraded = 0, isDamaged = 0, isResync = 0, isMigrate = 0, isReshape = 0, isResync5 =0;
				var Vol  = new Array();
				
				$('item',xml).each(function(idx){
					
						switch($('state',this).text())
						{
								case "degraded"://Degraded
									if($('vol',this).text() == "recovery")
									{
										Vol.push($('vol',this).text());
									}
																	  isDegraded = (isDegraded == 0)? 1:isDegraded;
								break;
	
								case "damaged"://Damaged
									Vol.push($('vol',this).text());
									isDamaged = (isDamaged == 0)? 1:isDamaged;
								break;
								
								case "resync5":	//Verifying RAID parity
									Vol.push($('vol',this).text());
									isResync5 = (isResync5 == 0)? 1:isResync5;
								break;
								
								case "resync":	//Rebuilding
								case "recovery":
									Vol.push($('vol',this).text());
									isResync = (isResync == 0)?1:isResync;
								break;
								
								case "migrate":// Migrating
									Vol.push($('vol',this).text());
									isMigrate = (isMigrate == 0)?1:isMigrate;
								break;
								
								case "reshape"://Expanding
								case "expansion":
									Vol.push($('vol',this).text());
									isReshape = (isReshape == 0)? 1:isReshape;
								break;
						}	

				});	
				var storage_raid_healthy = _T("_raid","desc2");				//Healthy
				var storage_raid_healthy_desc = _T("_raid","desc3");	//All RAID Volumes are active and healthy.
				
				if (CntDisk == 0 || CntVol == 0)	//No Disk or No Volume
				{
					storage_raid_healthy = _T('_raid','desc66');
					storage_raid_healthy_desc = _T('_raid','desc67');
				}
				else if (parseInt(isDamaged,10) == 1)
				{
					storage_raid_healthy = _T("_raid", "damaged");
	    		storage_raid_healthy_desc = _T("_raid","damaged_desc");
				}
				else if (parseInt(isResync,10) == 1)
				{
					storage_raid_healthy = _T('_raid','desc79');
					storage_raid_healthy_desc = _T("_raid","desc122")	//Volume_X is rebuilding 
					storage_raid_healthy_desc = storage_raid_healthy_desc.replace(/xxx/,Vol.toString()).replace(/,/, ", ");
				}	
				else if (parseInt(isReshape,10) == 1)
				{
					storage_raid_healthy = _T('_raid','desc95');
					storage_raid_healthy_desc  = _T("_raid","desc123")//Volume_X  is expanding.
					storage_raid_healthy_desc = storage_raid_healthy_desc.replace(/xxx/,Vol.toString()).replace(/,/, ", ");
				}
				else if (parseInt(isMigrate,10) == 1)
				{
					storage_raid_healthy = _T('_raid','desc82');
					storage_raid_healthy_desc  = _T("_raid","desc124")//Volume_X  is migrating.
					storage_raid_healthy_desc = storage_raid_healthy_desc.replace(/xxx/,Vol.toString()).replace(/,/, ", ");
				}
				else if (parseInt(isDegraded,10) == 1)
				{
						storage_raid_healthy = _T('_raid','desc68');
						storage_raid_healthy_desc = _T('_raid','desc69');
				}
				else if (parseInt(isResync5,10) == 1)
				{
					storage_raid_healthy = _T('_raid','desc126');
					storage_raid_healthy_desc = _T("_raid","desc127")	//Checking parity consistency in the background. System performance may be affected during this process.
				}
				$("#raid_healthy").html(storage_raid_healthy);
				$("#raid_healthy_desc").html(storage_raid_healthy_desc);
				
			} // end of success 
	});//end of ajax
}
