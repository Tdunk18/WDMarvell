//var diag_volcapacity_intervalId = 0;
function open_diag()
{
	var DiagObj;
		DiagObj = $("#adduserDiag").overlay({
			
			// custom top position
			top: 0,
			
			mask: {
				// you might also consider a "transparent" color for the mask
				color: '#000000',
				// load mask a little faster
				loadSpeed: 200,
				// very transparent
				opacity: 0.9
			},
			
			// disable this for modal dialog-type of overlays
			closeOnClick: false,
			closeOnEsc:false,
			// load it immediately after the construction
		load: true
		});
		DiagObj.load();	
	  	//var Obj=$("#adduserDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});		
		//Obj.load();
		//$( ".WDTooltipIcon" ).tooltip("option", "tooltipClass", "custom-tooltip-styling");
		//$( ".aa" ).tooltip();
		init_tooltip();
		
	    $("#adduserDiag .apply_button").click(function(){
    		//DiagObj.close();
	    	//setTimeout("jAlert('Setup Completed', 'complete' ,'')", 1000 )
		});
}

function diag_smart_info()
{	
	google_analytics_log('Home-Diagnostics','');
	var critical_tpl = "<div style='width:22px;margin:-3px 0px 0px 0px;padding:0px 0px 0px 0px;float:right;border:0px solid red;'><img src='/web/images/icon/critical_alert.png' height='22' width='22' border='0'></div>";
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/home_mgr.cgi",
		data: {cmd:'2'},		
		dataType: "xml",		
		async: true,
		cache:false,
		success: function(xml){
				var board_temperature = parseInt( $(xml).find("board_temperature").text(), 10);
				
				var my_desc = "";
				if (board_temperature == 0)	
					$("#home_diagnosticsSysTemper_value").html(_T('_home','normal'));
				else
				{
					my_desc = ( board_temperature == 2) ? _T('_home','critical'):_T('_home','elevated');
					
					my_desc = "<div style='padding:0px 0px 0px 0px;float:right;border:0px solid red;color:#FF0000'>"+my_desc+"</div>";
					my_desc += critical_tpl;
					$("#home_diagnosticsSysTemper_value").html(my_desc);
				}
				
				var my_fan = $(xml).find("fan").text();
				if (parseInt(my_fan, 10) < parseInt(_MIN_FAN_SPEED,10))
				{
					my_desc = (parseInt(my_fan, 10) == 0)?$(xml).find("fan").text() + " " + _T('_home','RPM'):_T('_raid','unknown');
					my_desc = "<div style='padding:0px 0px 0px 0px;float:right;border:0px solid red;color:#FF0000'>"+my_desc+"</div>";
					my_desc += critical_tpl;
				}
				else
				{	
					my_desc = $(xml).find("fan").text() + " " + _T('_home','RPM');
				}	
				$("#home_diagnosticsFanTemper_value").html(my_desc);
				
				//HD S.M.A.R.T. Test Check
				var hd_status = "";
				$('disk', xml).each(function(idx){
					switch($(this).text())
					{
						case "none":
							if ( hd_status != "healthy") hd_status = $(this).text();
						break;
						
						case "healthy":
							hd_status = $(this).text();
						break;
						
						case "non-healthy":
							hd_status = $(this).text();
							return false;
						break;
					}
				});	
				
				switch(hd_status)
				{
					case "none":
						my_desc = "<div style='padding:0px 0px 0px 0px;float:right;border:0px solid red;color:#FF0000'>"+_T('_disk_mgmt','desc11')+"</div>";
						my_desc += critical_tpl;
					break;
					
					case "healthy":
						my_desc = _T('_home','healthy');
					break;
					
					case "non-healthy":
						my_desc = "<div style='padding:0px 0px 0px 0px;float:right;border:0px solid red;color:#FF0000'>"+_T('_home','fault')+"</div>";
						my_desc += critical_tpl;
					break;
				}
				$("#home_diagnosticsDriveStatus_value").html(my_desc);
				
				var raid_state_html = "", raid_state = "";
				if ($(xml).find("raid > res").text() == 1)
				{
					$('item',xml).each(function(e){
						switch($('state',this).text())
						{
							case "degraded"://Degraded
								raid_state_html = "<div style='padding:0px 0px 0px 0px;float:right;border:0px solid red;color:#FF0000'>"+_T('_raid','desc44')+"</div>";
								raid_state_html += critical_tpl;
								return false;
							break;

							case "damaged"://Damaged
								raid_state_html = "<div style='padding:0px 0px 0px 0px;float:right;border:0px solid red;color:#FF0000'>"+_T('_raid','damaged')+"</div>";
								raid_state_html += critical_tpl;
								return false;
							break;
							
							case "resync":	//Rebuilding
							case "recovery":
								raid_state_html = "<div style='padding:0px 0px 0px 0px;float:right;border:0px solid red;color:#FF0000'>"+_T('_raid','desc79')+"</div>";
								raid_state_html += critical_tpl;
								return false;
							break;
							
							case "resync5"://Verifying RAID parity
								raid_state_html = "<div style='padding:0px 0px 0px 0px;float:right;border:0px solid red;'>"+_T('_raid','desc126')+"</div>";
								//raid_state_html += critical_tpl;
								return false;
							break;
							
							case "migrate"://Migrating
								raid_state_html = "<div style='padding:0px 0px 0px 0px;float:right;border:0px solid red;color:#FF0000'>"+_T('_raid','desc82')+"</div>";
								raid_state_html += critical_tpl;
								return false;
							break;
							
							case "reshape"://Expanding
							case "expansion":
								raid_state_html = "<div style='padding:0px 0px 0px 0px;float:right;border:0px solid red;color:#FF0000'>"+_T('_raid','desc95')+"</div>";
								raid_state_html += critical_tpl;
								return false;
							break;
														
							default:
								raid_state = (raid_state=="")? _T('_raid','desc2'):raid_state;
								raid_state_html = "<div style='padding:0px 0px 0px 0px;float:right;border:0px solid red;'>"+raid_state+"</div>";
								raid_state_html += "<div style='width:22px;margin:0px 0px 0px 0px;padding:0px 0px 0px 0px;float:right;border:0px solid red;display:none'></div>";
							break;
						}	
					});
				}
				else
				{
					raid_state_html = "<div style='padding:0px 0px 0px 0px;float:right;border:0px solid red;color:#FF0000'>"+_T('_raid','desc66')+"</div>";
					raid_state_html += critical_tpl;
				}
			
				$("#home_diagnosticsRaidStatus_value").html(raid_state_html);
		} // end of success 
	});//end of ajax
	var my_drive_name = _T('_home','desc17');
	var my_drive_tpl = "{0}{1} &deg;C{2}";
	$(HOME_XML_SYSINFO).find('disks').find('disk').each(function(idx){
			if ( $('name',this).text().length != 0)
			{
				my_drive_html = "";
				switch(parseInt($(this).attr('id'),10))
				{
					case 1:
						$("#smart_hd_list tr:eq(1)").show();
						var my_title = (parseInt(VOLUME_NUM,10) == 1)?_T('_home','desc16'):my_drive_name.replace(/X/, 1);
						$("#smart_hd_list tr:eq(1) td:eq(0) div").html(my_title);
						if (parseInt($('over_temp',this).text(), 10) == 1) 
						{
							my_drive_html = String.format(my_drive_tpl,
							/*0*/ "<div style='padding:0px 0px 0px 0px;float:right;border:0px solid red;color:#FF0000'>",
							/*1*/	$('temp',this).text(),
							/*2*/	"</div>"+critical_tpl);
						}
						else
						{
							my_drive_html = String.format(my_drive_tpl,
							/*0*/ "",
							/*1*/	$('temp',this).text(),
							/*2*/	"");
						}	
						$("#smart_hd_list tr:eq(1) td:eq(1) div").empty().html(my_drive_html);
					break;
					
					case 2:
						$("#smart_hd_list tr:eq(2)").show();
						$("#smart_hd_list tr:eq(2) td:eq(0) div").html(my_drive_name.replace(/X/, 2));
						if (parseInt($('over_temp',this).text(), 10) == 1) 
						{
							my_drive_html = String.format(my_drive_tpl,
							/*0*/ "<div style='padding:0px 0px 0px 0px;float:right;border:0px solid red;color:#FF0000'>",
							/*1*/	$('temp',this).text(),
							/*2*/	"</div>"+critical_tpl);
						}
						else
						{
							my_drive_html = String.format(my_drive_tpl,
							/*0*/ "",
							/*1*/	$('temp',this).text(),
							/*2*/	"");
						}	
						$("#smart_hd_list tr:eq(2) td:eq(1) div").html(my_drive_html);
					break;
					
					case 3:
						$("#smart_hd_list tr:eq(3)").show();
						$("#smart_hd_list tr:eq(3) td:eq(0) div").html(my_drive_name.replace(/X/, 3));
						if (parseInt($('over_temp',this).text(), 10) == 1) 
						{
							my_drive_html = String.format(my_drive_tpl,
							/*0*/ "<div style='padding:0px 0px 0px 0px;float:right;border:0px solid red;color:#FF0000'>",
							/*1*/	$('temp',this).text(),
							/*2*/	"</div>"+critical_tpl);
						}
						else
						{
							my_drive_html = String.format(my_drive_tpl,
							/*0*/ "",
							/*1*/	$('temp',this).text(),
							/*2*/	"");
						}	
						$("#smart_hd_list tr:eq(3) td:eq(1) div").html(my_drive_html);
					break;
					
					case 4:
						$("#smart_hd_list tr:eq(4)").show();
						$("#smart_hd_list tr:eq(4) td:eq(0) div").html(my_drive_name.replace(/X/, 4));
						if (parseInt($('over_temp',this).text(), 10) == 1) 
						{
							my_drive_html = String.format(my_drive_tpl,
							/*0*/ "<div style='padding:0px 0px 0px 0px;float:right;border:0px solid red;color:#FF0000'>",
							/*1*/	$('temp',this).text(),
							/*2*/	"</div>"+critical_tpl);
						}
						else
						{
							my_drive_html = String.format(my_drive_tpl,
							/*0*/ "",
							/*1*/	$('temp',this).text(),
							/*2*/	"");
						}	
						$("#smart_hd_list tr:eq(4) td:eq(1) div").html(my_drive_html);
					break;
				}
			}
	});	
	
	switch(parseInt(VOLUME_NUM,10))
	{
		case 1:
			$("#smart_hd_list tr:eq(5)").hide();
			$("#smart_hd_list tr:eq(7)").hide();
		break;
		
		default://2-bays and 4-bays
			$("#smart_hd_list tr:eq(5)").show();
			$("#smart_hd_list tr:eq(7)").show();
		break;
	}	
	
	setTimeout(function() {
		var cut = 0;
		$('#home_diagnosticsFlexigrid .bDiv table tr').each(function(idx) {
				
				if ( $(this).css('display') != 'none')
				{		
						(cut%2==0)?$(this).css('background','#F0F0F0'):$(this).css('background','#DCDCDC');
						cut++;			
				}
				
		});
		
		$("#smartDiag_wait").hide();
		$("#home_diagnosticsFlexigrid").show();
		$('.home_diagnostics_scroll').jScrollPane();
	}, 500);		
		
	var SMARTObj = $("#smartDiag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});
	SMARTObj.load();
		
	init_button();
	init_tooltip();
	language();
	
	$("#smartDiag .close").click(function(){
		$("#smartDiag_wait").show();
		$("#home_diagnosticsFlexigrid").hide();
		$("#smartDiag .close").unbind('click');
		
		$("#home_diagnosticsSysTemper_value").empty();
		$("#home_diagnosticsFanTemper_value").empty();
		$("#home_diagnosticsDriveStatus_value").empty();
		$("#home_diagnosticsRaidStatus_value").empty();
		
		
		SMARTObj.close();
	});	
} 
function home_pie_api_storage_usage()
{
	var my_info = new Array();
	/*
		my_info:
		my_info[0], size;
		my_info[1], usage;
		my_info[2], video;
		my_info[3], photos;
		my_info[4], music;
		my_info[5], other;
	*/
	wd_ajax({
		type: "GET",
		url: "/api/2.1/rest/storage_usage",	
		//url: "/xml/storage_usage.xml",
		data: {},		
		dataType: "xml",		
		async:false,
		cache:false,
		success: function(xml){
			var my_size = (parseInt($(xml).find('size').text(),10) < 0)?0:$(xml).find('size').text();
			var my_videos = (parseInt($(xml).find('video').text(),10) < 0)?0:$(xml).find('video').text();
			var my_music = (parseInt($(xml).find('music').text(),10) < 0)?0:$(xml).find('music').text();
			var my_photo = (parseInt($(xml).find('photos').text(),10) < 0)?0:$(xml).find('photos').text();
			
			if (parseInt(my_size, 10) == 0)
			{
				var tmp = new Array();
				tmp = home_pie_cgi_storage_usage();
				my_size = tmp[0].toString();
			}
			
			my_info.push(my_size);
			my_info.push($(xml).find('usage').text());
			my_info.push(my_videos);
			my_info.push(my_photo);
			my_info.push(my_music);
			my_info.push($(xml).find('other').text());
			
		}, // end of success 
		error:function( jqXHR, textStatus ) {
		}
	});//end of ajax
	
	return my_info;
}
function home_pie_cgi_storage_usage()
{
	var my_info = new Array();
	/*
		my_info:
		my_info[0], size;
		my_info[1], usage;
		my_info[2], video;
		my_info[3], photos;
		my_info[4], music;
		my_info[5], other;
	*/
	
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/hd_config.cgi",
		data: {cmd:'cgi_Status_CapacityUsage'},		
		dataType: "xml",		
		async:false,
		cache:false,
		success: function(xml){
			
			var total_free_blocks_size = 0;
			var total_use_blocks_size = 0;
			var my_videos = 0;
			var my_music = 0;
			var my_photo = 0;
			$('item',xml).each(function(idx){
				total_free_blocks_size += ( parseInt($('free_size',this).text(),10) * 1024);
				total_use_blocks_size += (parseInt($('use_size',this).text(),10) * 1024);
				
				if ( 1 == parseInt($('volume',this).text(),10))
				{
					my_videos = $('Shared_Videos',this).text();
					my_photo = $('Shared_Pictures',this).text();
					my_music = $('Shared_Music',this).text();
					
					my_info[2] = my_videos;
					my_info[3] = my_photo;
					my_info[4] = my_music;
				}
			});
			
			my_info[0] = total_free_blocks_size;
			my_info[1] = total_use_blocks_size;
			var my_others = (parseInt(total_use_blocks_size,10) - 
							(parseInt(my_videos,10) + parseInt(my_music,10) + parseInt(my_photo,10)));
			
			my_info[5] = my_others;
			
  		} // end of success 
	});//end of ajax
	
	return my_info;
	
}
function home_volcapacity_pie()
{		
//		var home_storage_info = home_pie_cgi_storage_usage();
		var home_storage_info = home_pie_api_storage_usage();
	
		if (home_storage_info.length == 0)
		{
			home_show_volume_info("home");
			return;
		}
		
		$("#home_volcapity_pei").show();
		$("#VolCapity_pei").show();

		/*
		home_storage_info:
		home_storage_info[0], size;
		home_storage_info[1], usage;
		home_storage_info[2], video;
		home_storage_info[3], photos;
		home_storage_info[4], music;
		home_storage_info[5], other;
		*/
		var total_free_blocks_size = ( parseInt(home_storage_info[0], 10) - parseInt(home_storage_info[1], 10));
		var total_use_blocks_size = home_storage_info[1];
		var my_videos = Math.max(0, parseInt(home_storage_info[2],10));
		var my_music = Math.max(0, parseInt(home_storage_info[4],10));
		var my_photo = Math.max(0, parseInt(home_storage_info[3],10));
		var my_others = Math.max(0, parseInt(home_storage_info[5],10));
		
		var show_my_free_size = (parseInt(total_free_blocks_size, 10) == 0)? "0 MB":size2str(total_free_blocks_size,"",true,3);
		var show_my_videos = (parseInt(my_videos,10) == 0) ? "0 MB":size2str(my_videos);
		var show_my_music = (parseInt(my_music,10) == 0)? "0 MB":size2str(my_music);
		var show_my_photo = (parseInt(my_photo,10) == 0)? "0 MB":size2str(my_photo);
		var show_my_other = (parseInt(my_others,10) == 0)? "0 MB":size2str(my_others);	
		
		var _tmp = show_my_free_size.replace(" ", "<br>");
		$("#home_b4_free").html(_tmp).contents().filter(function () { return this.nodeType === 3; }).wrap("<span></span>").end().filter("br").remove();
		
		var data = [
			{ label: _T("_home","desc12")+" <span class='legendLabel_size'>" + show_my_videos + "</span>",  data:parseInt(my_videos,10)},
			{ label: _T("_home","desc14")+" <span class='legendLabel_size'>" + show_my_photo + "</span>",  data: parseInt(my_photo,10)},
			{ label: _T("_home","desc13")+" <span class='legendLabel_size'>" + show_my_music + "</span>",  data: parseInt(my_music,10)},
			{ label: _T("_home","desc15")+" <span class='legendLabel_size'>" + show_my_other + "</span>",  data: parseInt(my_others,10)},
			{ label: _T("_home","desc11")+" <span class='legendLabel_size'>" + show_my_free_size+ "</span>",  data:parseInt(total_free_blocks_size,10)}
		];
			
		$.plot($("#VolCapity_pei"), data, 
		{
			series: {
				pie: { 
					innerRadius:0.6,
					show: true,
                    stroke: {color:'#A7AFAE'},
//						tilt: 0.5,
					label:{
						formatter: function(label, series){
							return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'+label+'<br/>'+Math.round(series.percent)+'%</div>';
	                    }
					}//end of label
					
				}//end of pie
			},//end of series
			legend: {
				 margin:[-200,30],//[-150,70],/*[x margin, y margin]*/
				 backgroundColor: "null"
			},//end of legend
			colors: ["#CC505F", "#EDD058", "#3CA570", "#599DC6", "#A7AFAE"] 
		});//end of $.plot...	
			
		$('#VolCapity_pei .legend table').css({
            'right': '-219px',
            'width': '198px',
            'height': '242px',
            'top': '0'
        });
		//$('#VolCapity_pei .legend .legendLabel').css('width', '240px');
		$('#VolCapity_pei .legend .legendColorBox').each(function(n) {
				switch(n) {
					case 0:
						$(this).empty().append("<img src='/web/images/icon/dashboard/NAS_icn_capacity_videos.png'/>");
					break;
					case 1:
						$(this).empty().append("<img src='/web/images/icon/dashboard/NAS_icn_capacity_photos.png'/>");
					break;
					case 2:
						$(this).empty().append("<img src='/web/images/icon/dashboard/NAS_icn_capacity_music.png'/>");
					break;
					case 3:
						$(this).empty().append("<img src='/web/images/icon/dashboard/NAS_icn_capacity_others.png'/>");
					break;
					case 4:
						$(this).empty().append("<img src='/web/images/icon/dashboard/NAS_icn_capacity_free-space.png'/>");
					break;
				}
		});
		
		$('#VolCapacityDiag .legend .legendLabel').each(function(n) 
		{
			$(this).attr("id","home_legendLabel"+(n+1)+"_value");
		});
}
//function home_pie_storage_usage_state()
//{
//	wd_ajax({
//		type: "POST",
//		url: "/cgi-bin/home_mgr.cgi",
//		data: {cmd:'6'},		
//		dataType: "xml",		
//		async:true,
//		cache:false,
//		success: function(xml){
//			
//			if ( parseInt($(xml).find('res').text(), 10) == 1 )
//			{
//				if (parseInt(diag_volcapacity_intervalId,10) != 0) 	clearInterval(diag_volcapacity_intervalId);
//				
//				home_volcapacity_pie();
//			}
//			
//		} // end of success 
//	});//end of ajax
//}
//function diag_volcapacity_info()
//{
//		wd_ajax({
//			type: "POST",
//			url: "/cgi-bin/home_mgr.cgi",
//			data: {cmd:'5'},		
//			dataType: "xml",		
//			cache:false,
//			success: function(xml){
//				
//				if (parseInt(diag_volcapacity_intervalId,10) != 0) 	clearInterval(diag_volcapacity_intervalId);
//				
//				diag_volcapacity_intervalId = setInterval(function(){
//					home_pie_storage_usage_state();
//				} ,200);
//				
//			} // end of success 
//		});//end of ajax
//}
function diag_active()
{
	if(_g_bond=="0" && LAN_PORT_NUM==2 || MULTI_LANGUAGE == 8)
	{		
		adjust_dialog_size("#active_Diag","845","420")
		$(".device_active li").css("width","720");
		$(".device_active li .div4_no").css("width","400");
	}	
	else
	{		
		adjust_dialog_size("#active_Diag","660","420")
	}	
	
	var Obj=$("#active_Diag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,
		 	onBeforeClose: function() {
						hide('id_cpu');
						hide('active_set');
						hide('id_process')
						hide('id_network')
						hide('id_memory')		
						clearTimeout(loop_process);	
						clearTimeout(loop_memory);	
						clearTimeout(loop_network);	
						clearTimeout(loop_cpu);						
        }		 	
		 	});		
	
	Obj.load();

		
	show('active_set');	
	init_button();
	language();
	
//	for (var i=0;i<11;i++)
//	{
//		$("#id_cpu_level_icon").removeClass("div3_"+i)
//		$("#id_memory_level_icon").removeClass("div3_"+i)
//		$("#id_process_level_icon").removeClass("div3_"+i)
//	}
//		
//		
//	$("#id_cpu_level_icon").addClass("div3_"+_g_cpu_level)
//	$("#id_memory_level_icon").addClass("div3_"+_g_memory_level)
//	$("#id_process_level_icon").addClass("div3_"+_g_memory_level)
//	
//	$("#id_cpu_level").text(parseInt(_g_cpu_level,10)*10);		
//	$("#id_memory_level").text(parseInt(_g_memory_level,10)*10);
//	$("#id_process_level").text(parseInt(_g_memory_level,10)*10);
//	$("#id_network_level").text(_g_tx+"MB Tx,"+_g_rx+"MB Rx");		
					
	
//	$("#active_Diag .close").click(function(){
//		
//		$('#active_Diag .close').unbind('click');
//		
//		Obj.close();
//	});	
}

function diag_active_open(id)
{
	if (MULTI_LANGUAGE == "6" || MULTI_LANGUAGE == "5")
	{					
		$(".placeholder_left").css("top","50px");
	}	
	
	if (id == "id_cpu")
	{
		adjust_dialog_size("#active_Diag","660","480")
		show('id_cpu');
		hide('active_set');
		hide('id_process')
		hide('id_network')
		hide('id_memory');
		init_cpu();
	}
	else if (id == "id_memory")
	{
		adjust_dialog_size("#active_Diag","660","480")
		show('id_memory');
		hide('id_cpu')
		hide('id_network')
		hide('active_set');
		hide('id_process')
		init_memory();
	}
	else if (id == "id_network")
	{
		if(_g_bond=="0" && LAN_PORT_NUM==2)
		{
			adjust_dialog_size("#active_Diag","660","510");
			$("#network_detail").css("margin-bottom","30px").css("margin-top","40px");			
			$("#placeholder_network").prev().css("top","360px");
			$("#placeholder_network").prev().prev().css("top","105px");
			if (MULTI_LANGUAGE == "6" || MULTI_LANGUAGE == "5")
			{
				$("#placeholder_network").prev().prev().css("top","95px");
				$("#network_detail").css("margin-top","50px");			
			}
		}	
		else
		{	
			adjust_dialog_size("#active_Diag","660","480");			
			$("#network_detail").css("margin-bottom","20px").css("margin-top","10px");
			$("#placeholder_network").prev().css("top","320px");
			$("#placeholder_network").prev().prev().css("top","65px");
			if (MULTI_LANGUAGE == "6" || MULTI_LANGUAGE == "5")
			{
				$("#placeholder_network").prev().prev().css("top","50px");
			}	
		}	
		show('id_network');
		hide('id_memory')		
		hide('id_cpu')
		hide('active_set');
		hide('id_process')
		init_network();
	}	
	else if (id == "id_device_active")
	{
		if(_g_bond=="0" && LAN_PORT_NUM==2 || MULTI_LANGUAGE == 8)
			adjust_dialog_size("#active_Diag","820","420")
		else
		{				
		adjust_dialog_size("#active_Diag","660","420")
		}	
				
		show('active_set')
		hide('id_cpu')
		hide('id_process')
		hide('id_memory');		
		hide('id_network')
		
	}
	else if (id="id_process")
	{
		adjust_dialog_size("#active_Diag","820","480")
		show('id_process')
		hide('active_set')
		hide('id_cpu')
		hide('id_memory');		
		hide('id_network')
		init_process();							
		$('#scrollbar_active').jScrollPane();				
	}	
}

function open_fw()
{
	location.replace("/web/setting/firmware.html");	
}

function diag_apps_details(idx)
{
	wd_ajax({
		url: "/xml/apkg_all.xml",
		type: "GET",
		async:false,
		cache:false,
		dataType:"xml",
		success: function(xml){
		
			$(xml).find('item').each(function(){
					
					if ( $(this).find('name').text() == idx )
					{
						//Show Name
						$("#apps_details_name").html($(this).find('show').text());
						
						//Version
						$("#apps_details_verison").html($(this).find("version").text());
						
						//Install on
						var tmp = $(this).find("inst_date").text();//Text: MM/DD/YYYY
						if (tmp.indexOf(" ") == -1)
						{
						  	 var my_date = dateFormat(
								new Date(
								tmp.slice(6,10),
								(parseInt(tmp.slice(0,2),10)-1),
								tmp.slice(3,5),
								'',
								'',
								''), 
								"dddd, mmmm dS, yyyy");
						}
						else
						{
						  	  //inst_date:01/07/2014 19:18:56
						  	  var dt = new Date(tmp.slice(6,10), (parseInt(tmp.slice(0,2),10)-1), tmp.slice(3,5), tmp.slice(11,13), tmp.slice(14,16), tmp.slice(17,19)).valueOf();
							  var my_date = multi_lang_format_time(dt);
						} 
						$("#apps_details_installon").html(my_date);
						  
						 //URL
						  var my_html = "";
						  if ($(this).find("url").text() != "")
						  {
						  	if ($(this).find("enable").text() == "1")
						  	{
							  	var xurl = document.URL.substr(0, 5);
							  	var my_port = "";
							  	switch(idx)
							  	{
							  		case "aMule":
							  		case "IceCast":
							  		case "Joomla":
							  		case "phpBB":
							  		case "phpMyAdmin":	
							  		case "SqueezeCenter":
							  		case "WordPress":
							  			var my_port = window.location.port;
							  		break;
							  		
							  		default:
							  			my_port = $(this).find("url_port").text();
							  		break;
							  	}
							  	my_port = (my_port.length <= 0)? "":":"+my_port;
							  	
								
							  	if ( (parseInt($(this).find("center_type").text() ,10)) != 1)
							  	{
							  		var my_url_tpl = "{0}://{1}{2}/{3}/";
							  		var my_url =  String.format( my_url_tpl,
							  		/*0*/ (xurl == "https")? "https":"http",
							  		/*1*/	document.domain,
							  		/*2*/	my_port,
							  		/*3*/	$(this).find("name").text(),
							  		/*4*/	$(this).find("url").text());
							  		
							  		//window.open(URL,name,specs,replace)
							  		var _tpl = '<button type="button" id="home_AppsConfig_Button" onclick="window.open(\'{0}\',\'{1}\')">' + _T("_p2p","config") + '</button>';
							  		my_html = String.format(_tpl, 
							  		/*0*/ my_url,
							  		/*1*/ $(this).find("name").text());
								 }
								 else
								 {
								 	my_html = "";
								 	//go_page('/web/addons/app.php', 'nav_addons')
//								 	my_html = String.format("<span class='edit_detail_x1' onclick=diag_apps_list_close();go_page('/web/addons/app.php?apps={0}','nav_addons');>{1}//{2}/{3}/{4}</span>",
//												$(this).find("name").text(),
//												window.location.protocol,
//												window.location.hostname,
//												$(this).find("name").text(),
//												$(this).find("url").text()
//									);
								 }	 		
						  	}
						  	else
						  		my_html = _T('_module','desc4');
						  }		
						  else
						  	my_html = _T('_module','desc4');
						 
						 if (my_html == "")
						 	$("#TR_AppsDiag_detail_URL").hide();	
						 else
						 {
						 	$("#TR_AppsDiag_detail_URL").show();	
						 	$("#home_appsConfig_link").html(my_html); 
						 }	
					}	 
			});
		}
	});	
	
	$("#AppsDiag_list").hide();
    $("#AppsDiag_detail").show();
}
function home_apps_list(callback)
{
	var idx = 0;
	var _SRC_tpl = "<img src=\"/{0}/{1}\" border=\"0\" width=\"30\">";	
	var scr_html = String.format(_SRC_tpl,
							/*0*/ "web/images",
							/*1*/	"logo.png");
	var _Detail_tpl = "<div class=\"edit_detail\" style=\"text-align: right; width: 100px;\" onclick=\"diag_apps_details('{0}')\">{1}</div>";
	var _tpl =	"<tr id=\"row{0}\">" + 
						"<td align=\"center\"><div style=\"text-align: center; width: 40px; padding: 8px 0px 0px;\">{1}</div></td>" + 
						"<td align=\"left\"><div style=\"text-align: left; width: 190px;\">{2}</div></td>" + 
						"<td align=\"left\"><div style=\"text-align: left; width: 140px;\">{3}</div></td>" + 
						"<td align=\"right\">{4}</td>" + 
						"</tr>";
	var my_html = String.format(_tpl,
	/*0*/ idx++,
	/*1*/ scr_html,
	/*2*/ _T("_menu", "http_downloads"),
	/*3*/ _T("_module","desc9"),
	/*4*/	"");
	$("#Home_APPList_tbody").empty().append(my_html);
	if (FTP_DOWNLOADS_FUNCTION == 1)
	{
			my_html = String.format(_tpl,
			/*0*/ idx++,
			/*1*/ scr_html,
			/*2*/ _T("_menu", "ftp_downloads"),
			/*3*/ _T("_module","desc9"),
			/*4*/	"");
			$("#Home_APPList_tbody").append(my_html);
	}
	
	if (P2P_DOWNLOADS_FUNCTION == 1)
	{
		my_html = String.format(_tpl,
			/*0*/ idx++,
			/*1*/ scr_html,
			/*2*/ _T("_menu", "p2p_downloads"),
			/*3*/ _T("_module","desc9"),
			/*4*/	"");
			$("#Home_APPList_tbody").append(my_html);
	}
	if (WEB_FILE_VIEWER_FUNCTION == 1)
	{
		my_html = String.format(_tpl,
			/*0*/ idx++,
			/*1*/ scr_html,
			/*2*/ _T("_menu", "web_file_server"),
			/*3*/ _T("_module","desc9"),
			/*4*/	"");
			$("#Home_APPList_tbody").append(my_html);
	}
	
	if (SAFEPOINTS_FUNCTION == 1)
	{
		my_html = String.format(_tpl,
			/*0*/ idx++,
			/*1*/ scr_html,
			/*2*/ _T("_menu", "safepoints"),
			/*3*/ _T("_module","desc9"),
			/*4*/	"");
			$("#Home_APPList_tbody").append(my_html);
	}
	
	wd_ajax({
		url: '/xml/apkg_all.xml',	
		type: "GET",
		async: false,
		cache: false,
		dataType: "xml",
		success: function(xml){
				
				$(xml).find('apkg').find('item').each(function(){
							var scr_html = String.format(_SRC_tpl,
							/*0*/ $(this).find('name').text(),
							/*1*/	$(this).find('icon').text());
							
							var detail_html = String.format(_Detail_tpl,
							/*0*/ $(this).find('name').text(),
							/*1*/ _T('_module','desc2'));
							
							my_html = String.format(_tpl,
							/*0*/ idx++,
							/*1*/ scr_html,
							/*2*/ $(this).find('show').text(),
							/*3*/ ($(this).find('enable').text()==1)?_T("_module","desc9"):_T('_module','desc8'),
							/*4*/	detail_html);
							
							$("#Home_APPList_tbody").append(my_html);
				});
				
				if(callback) 
				{
					callback(1);
				} 
		}
	});	
	
}
function diag_apps_list()
{	
	home_apps_list(function(MyRes){
			var AppsObj = $("#AppsDiag").overlay({left: 'center', expose:'#000', api:true, closeOnClick:false, closeOnEsc:false});
			INTERNAL_DIADLOG_DIV_HIDE('AppsDiag');
			
			init_button();
			$("#AppsDiag_list").show();
			language();
			
			AppsObj.load();
			
			$('.scrollbar_home_applist').jScrollPane();
			
			$("#AppsDiag .close").click(function(){
				AppsObj.close();
			
				$('#AppsDiag .close').unbind('click');
				INTERNAL_DIADLOG_DIV_HIDE('AppsDiag');
			});	
			
			$("#home_appsBack2_button").click(function(){
				$("#apps_details_verison").empty();
				$("#apps_details_installon").empty();
				$("#home_appsConfig_link").empty();
				
				$("#AppsDiag_detail").hide();
				$("#AppsDiag_list").show();
			});	
		
	});
		
}