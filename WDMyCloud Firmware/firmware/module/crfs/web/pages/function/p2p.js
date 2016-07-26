function p2p_config_format_port(str)
{
	if (str == "")
	{
		jAlert( _T('_mail','msg7'),  "warning");	//Text:Please enter a port.
		return 0;
	}
	
	if (str.indexOf(" ") != -1) 
 	{
 		jAlert( _T('_mail','msg8'),  "warning");	//Text:Port can not contain spaces.
 		return 0;
 	}
	
 	if (isNaN(str))
 	{
		jAlert( _T('_ftp','msg6'),  "warning");	//Text:Port must be a number.
 		return 0;
 	}	
	
	if (parseInt(str,10) < 1) 
	{
		jAlert( _T('_ftp','msg7'),  "warning");	//Text:The port number must be between 1~65535.
 		return 0;
	}
	
 	if (parseInt(str,10) > 65535) 
	{
		jAlert( _T('_ftp','msg7'),  "warning");	//Text:The port number must be between 1~65535.
 		return 0;
	}
	
	if (port_used_check("transmission",str) != 0)
	{
		jAlert( _T('_p2p','msg30'),  "warning");	//Text:This port number is already being used or reserved. Please enter a different port number.
 		return 0;
	}
	
	return 1;
}
function p2p_config_format_seeding(str)
{
	var my_seeding = $('input[name=apps_p2pdownloadsConfigureSeeding_chkbox]:checked').val();
		
	switch(parseInt(my_seeding,10))
	{
		case 1://seed minutes.
			var my_str = $("#apps_p2pdownloadsConfigureSeedingMin_text").val();
			
			if( isNaN(my_str) || my_str == "")
			{
	     		jAlert( _T('_p2p','msg1'), "warning");	//Text: Not a valid value.
		  		return 0;
	    	}
	    	
	    	if( parseInt(my_str, 10) <= 0 || parseInt(my_str,10) >1440)
			{
				jAlert( _T('_p2p','msg3'), "warning");	//Text: The value must be between 1-1440 minutes.
		  		return 0;
			}
		break;
		
		case 2://seed ratio
			var my_str = $("#apps_p2pdownloadsConfigureSeedingRatio_text").val();
			
			if( isNaN(my_str) || my_str == "")
			{
	     		jAlert( _T('_p2p','msg1'), "warning");	//Text: Not a valid value.
		  		return 0;
	    	}
	    	
	    	if( parseInt(my_str, 10) <=0 || parseInt(my_str, 10) >100)	//1-100%
			{
				jAlert( _T('_p2p','msg4'), "warning");	//Text: The value must be between 1-100.
		  		return 0;
			}
		break;
	}
	
	return 1;
}
function p2p_config_format_Bandwidth_Control(str)
{
	if( isNaN(str))
	{
	     jAlert( _T('_p2p','msg1'), "warning");	//Text: Not a valid value.
		 return 0;
	}
	
	if(	(parseInt(str, 10) <= 0 ) || (parseInt(str, 10) > 100000) )
    {
       jAlert( _T('_p2p','msg14'), "warning");	//Text: The value must be between 1-100000.
       return 0;
    }
	
	return 1;
}
function p2p_config_get_state()
{	
	wd_ajax({
			url:"/cgi-bin/p2p.cgi",
			type: "POST",
			data:{cmd:'cgi_p2p_config_get_state'},
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml){
				var res = $(xml).find("p2p").text();				
				
				setSwitch('#apps_p2pdownloads_switch',	parseInt(res,10));
				
				(parseInt(res,10) == 1) ? $("#DIV_P2P_Downloads").show():$("#DIV_P2P_Downloads").hide();
				
				if (parseInt(res,10) == 1) 
				{
					 $("#TD_P2P_Config_Set").show()
					 $("#apps_p2pconfig_schedule_tr").show();
				}
				else	 
				{
					$("#TD_P2P_Config_Set").hide();
					$("#apps_p2pconfig_schedule_tr").hide();
				}	
			}
	});//end of ajax...
}
function p2p_config_set_state(strP2P)
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
	
	if (timeoutId != 0) clearTimeout(timeoutId);
	
	wd_ajax({
			url:"/cgi-bin/p2p.cgi",
			type: "POST",
			data:{cmd:'cgi_p2p_config_set_state',f_P2P:strP2P},
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml){
				
				jLoadingClose();
				
				setSwitch('#apps_p2pdownloads_switch',	parseInt(strP2P));
				
				if (parseInt(strP2P,10) == 1)
				{
					$("#DIV_P2P_Downloads").show();
					$("#TD_P2P_Config_Set").show();
					$("#apps_p2pconfig_schedule_tr").show();
					
					if ($("#p2p_downloads_list").parent().parent().hasClass('flexigrid') == true)
						$("#p2p_downloads_list").flexReload();
					else
						p2p_downloads_list();
				}
				else
				{
					$("#DIV_P2P_Downloads").hide();
					$("#TD_P2P_Config_Set").hide();
					$("#apps_p2pconfig_schedule_tr").hide();
				}	
					
			}
	});//end of ajax...
}
/* Very crude detection of valid URLs */
function isValidUrl(txt) {
	
	if (txt.length < 8) return -1;
	// if (-1 == txt.indexOf("://") || -1 != txt.indexOf("ftp://")) return -1;
	
	if( 0 == txt.indexOf("magnet:?xt=urn:btih:")){	// begin with magnet
		return 1;	// magnet url
	}
	else if( txt.match(/^[0-9a-fA-F]{40}$/i) ){
		return 2;	// pure hash, need add magnet protocal
	}
	else if (-1 == txt.indexOf("://") || -1 != txt.indexOf("ftp://")){
		return -1;
	}
	else{
		return 0;	// normal url
	}
}
function P2P_tooltip()
{
	$(".tip_backup_success").attr('title',_T('_backup','desc12'));
	$(".tip_backup_fail").attr('title',_T('_backup','desc13'));
	$(".tip_backup_downloading").attr('title',_T('_backup','desc14'));
	$(".tip_backup_stop").attr('title',_T('_backup','desc16'));
	$(".tip_backup_wait").attr('title',_T('_backup','desc15'));
	
	init_tooltip('.tip');
	init_tooltip();
}
function p2p_download_format_AddURL()
{
	var f_torrent_url = $.trim($("#f_torrent_url").val());
	
	if ( f_torrent_url == "")
	{
		jAlert( _T('_p2p','msg7'), _T('_common','error'));	//Text: Please enter a URL.
		return false;
	}
	if ( f_torrent_url.length > 512)
	{
		jAlert( _T('_p2p','msg29'), _T('_common','error'));	//Text: The max length of URL is 191 characters.
		return false;
	}
	
	var res = isValidUrl(f_torrent_url);
	switch( parseInt(res,10) )
	{
		case 0:
			if (!$("#apps_p2pdownloadsAddURL_button").hasClass("gray_out"))
			{
				$("#apps_p2pdownloadsAddURL_button").addClass("gray_out");
			}
			p2p_download_add_url_diag(f_torrent_url);
			setTimeout(function(){
				return  true;
			}, 500);	
		break;
		
		case 1:
		case 2:
			if (!$("#apps_p2pdownloadsAddURL_button").hasClass("gray_out"))
			{
				$("#apps_p2pdownloadsAddURL_button").addClass("gray_out");
			}
		  f_torrent_url = (parseInt(res,10) == 2)?'magnet:?xt=urn:btih:' + f_torrent_url:f_torrent_url;
			p2p_download_add_magnet_diag(f_torrent_url);
			
			setTimeout(function(){
				return  true;
			},500);	
		break;	
	
		default:
			jAlert( _T('_p2p','msg8'), _T('_common','error'));	//Text: Please enter a valid URL.
			return false;
		break;
	}
}
function p2p_download_active_scheduing()
{	
	if (parseInt(P2P_CURRENT_CONFIG[10],10) == 1)
		$("#td_but_p2p_download_scheduling").hide();
	else	
		$("#td_but_p2p_download_scheduling").show();
}
var jobs_list = new Array();		
function p2p_downloads_list()
{    
    var f_auto_download = 0;
    var f_current_ses_state = 0;
    			
    $("#p2p_downloads_list").flexigrid({	
    		url: '/cgi-bin/p2p.cgi',	
    		dataType: 'json',
    		cmd: 'p2p_get_list_by_priority',	
    		colModel : [
    		    /* 0 */{display: 'name', name : 'f_name', width :250, align: 'left'},
    		    /* 1 */{display: 'size', name : 'f_size', width : 80, align: 'left'},
    			/* 2 */{display: 'state', name : 'f_progress', width : 70,  align: 'left'},	//state:downloading/seeding/finish
    			/* 3 */{display: 'idx', name : 'f_idx', width : 0, align: 'left', hide:true},
    			/* 4 */{display: 'speed', name : 'f_speed', width :145,  align: 'left'},
    			/* 5 */{display: 'icon_start', name : 'f_icon_start', width :32,  align: 'center'},
    			/* 6 */{display: 'icon_del', name : 'f_icon_del', width :32,  align: 'center'},
    			/* 6 */{display: 'icon_detail', name : 'f_icon_detail', width :32,  align: 'center'},
    			],
    		usepager: true,
    		useRp:true,
    		page:1, 
    		rp: 30,
    		rpOptions:[10],
    		showTableToggleBtn: false,
    		width:650,
    		height:'auto',
    		errormsg: _T('_common','connection_error'),		//Text:Connection Error
    		nomsg: _T('_common','no_items'),				//Text:No items
    		singleSelect:false,
    		resizable: false,
    		f_field:"0",
    		singleSelect:true,
    		onSuccess:function(){
    			$('#p2p_downloads_list > tbody > tr td:nth-child(1) div').each(function(){
    				$(this).addClass('tip').attr('title',$(this).text()).children("span").removeAttr("title").removeAttr("alt");
    			});
            	
          $('#p2p_downloads_list > tbody > tr td:nth-child(5) div').each(function(){
    				$(this).addClass('tip').attr('title',$(this).text()).children("span").removeAttr("title").removeAttr("alt");
    			});
    			
            P2P_tooltip();
    		},//end of onSuccess..
    		preProcess: function(r) {
    			
    			var r_data = r;
				jobs_list.length = 0;
				
    			if (r_data.total > 0)
				{
					var r = r_data.rows;
					for(var key in r)
					{
						var c = r[key]['cell'];
						var my_state;
						
						//torrent state:downloading/seeding/finish
						my_state = c[2];
						switch(my_state)
						{
							case "finished":
								r_data.rows[key]['cell'][2] = _T('_p2p', 'finished');
							break;
							
							case "seeding":
								r_data.rows[key]['cell'][2] = _T('_p2p', 'seeding');
							break;
							
							case "stop":
								r_data.rows[key]['cell'][2] = _T('_ftp', 'stopped');
							break;
							
							default:
							break;
						}
						
						//start or stop
						my_state = c[5];
						r_data.rows[key]['cell'][5] = '<div class="list_icon">';
						switch(my_state)
						{
							case "1"://show stop
								r_data.rows[key]['cell'][5] += String.format('<div class="stop TooltipIcon" onClick="p2p_download_stop({0});" title="{1}"></div>', c[3], _T('_common','stop'));
							break;
							
							case "0"://show start
								r_data.rows[key]['cell'][5] += String.format('<div class="start TooltipIcon" onClick="p2p_download_start({0});" title="{1}"></div>', c[3], _T('_common','start'));
							break;
							
							default:
								r_data.rows[key]['cell'][5] += "";
							break;
						}
						r_data.rows[key]['cell'][5] += '</div>';
						
						//del
						r_data.rows[key]['cell'][6] = '<div class="list_icon">';
						r_data.rows[key]['cell'][6] += String.format('<div class="del TooltipIcon" onClick="p2p_download_del({0});" title="{1}"></div>', c[3], _T("_usb_backups", "del_job"));
						r_data.rows[key]['cell'][6] += '</div>';
						
						//detail
						r_data.rows[key]['cell'][7] = '<div class="list_icon">';
						r_data.rows[key]['cell'][7] += String.format('<div class="detail TooltipIcon" onClick="p2p_downloads_detail_diag({0});" title="{1}"></div>', c[3], _T("_usb_backups", "details"));
						r_data.rows[key]['cell'][7] += '</div>';
					}
				}
    			
    			
    		if (parseInt(r_data.total, 10) == 0)
				{
						$("#div_p2p_download_button").hide();
						if (timeoutId != 0) clearTimeout(timeoutId);
				}		
				else
				{
						$("#div_p2p_download_button").show();
						timeoutId = setTimeout('$("#p2p_downloads_list").flexReload()', 10000);
				}		
				
				if (parseInt(r_data.total, 10) == 25)
				{
					if (!$("#apps_p2pdownloadsAddURL_button").hasClass("gray_out")) $("#apps_p2pdownloadsAddURL_button").addClass("gray_out");
					if (!$("#apps_p2pdownloadsAddFile_button").hasClass("gray_out")) $("#apps_p2pdownloadsAddFile_button").addClass("gray_out");
				}
				else
				{
					if ($("#apps_p2pdownloadsAddURL_button").hasClass("gray_out")) $("#apps_p2pdownloadsAddURL_button").removeClass("gray_out");
					if ($("#apps_p2pdownloadsAddFile_button").hasClass("gray_out")) $("#apps_p2pdownloadsAddFile_button").removeClass("gray_out");
				}	
					
				return r_data;
    		}
   	 }); 
}

function p2p_download_add_magnet_diag(magnetlink)
{   
	wd_ajax({
		url:"/cgi-bin/p2p.cgi",
		type:"POST",
		data:{cmd:'p2p_add_torrent_magnet',f_torrent_url:magnetlink},
		async:false,
		cache:false,
		dataType:"xml",
		success:function(xml){
			var my_res = $(xml).find('res').text();
			var _html = "";
			///////////////////////////
			switch(parseInt(my_res))
			{
				case 0:	//Success
				case 1:	//Success
					_html = _T('_p2p','desc9'); //Text:Successfully added.
				break;
				
				case 101://Failed to add this torrent file. The torrent file is invalid or duplicate.
				case 104:
					_html = _T('_p2p','msg21');
				break;
					
				case 102://Failed to add this torrent file. The My Cloud system does not have enough free space.
				case 103:
					_html = _T('_p2p','msg22');
				break;
				
				default://Upload Torrent Error(Error Code:xxx).
					_html = _T('_p2p','msg24')+"("+_T('_format','error_code')+":"+my_res+")";
				break;
			}
			
			$("#tr_p2p_download_get_url_status_wait").hide();
			$("#tr_p2p_download_get_url_status_desc").show();
			$("#tr_p2p_download_get_url_status_url").show();
			
			$("#p2p_download_get_url_status_url").html(magnetlink);
			$("#p2p_download_get_url_status_desc").html(_html);
			
			$("#f_torrent_url").attr('value','');
	
		}
			////////////
	});
		
	$("#P2PDiag_title").html(_T('_p2p','status'));	
	adjust_dialog_size("#P2PDiag", 650, "");
	var P2PDiag_obj=$("#P2PDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	INTERNAL_DIADLOG_DIV_HIDE('P2PDiag');
	$('#P2P_Downloads_Add_URL').show();
	
	language();
	
	P2PDiag_obj.load();
	
	$("#P2PDiag .close").click(function(){
		
		P2PDiag_obj.close();
		
		$("#tr_p2p_download_get_url_status_wait").show();
		$("#tr_p2p_download_get_url_status_url").hide();
		$("#tr_p2p_download_get_url_status_desc").hide();
		
		$("#p2p_download_get_url_status_url").empty();
		$("#p2p_download_get_url_status_desc").empty();
				
		INTERNAL_DIADLOG_BUT_UNBIND("P2PDiag");
		INTERNAL_DIADLOG_DIV_HIDE("P2PDiag");
		
		$("#p2p_downloads_list").flexReload();
	});
}
function p2p_downloads_format_file(str)
{
	/*
			1	-->	xxx.torrent or aaaa.bbb.torrent 
			0	-->	xxx.mp4 or xxx. or xxx
	*/
	var msg = "";
	
	if (str.indexOf(".") == -1)
	{
		//var msg = _T('_p2p','msg24')+"("+_T('_format','error_code')+":104)";
		var msg = _T('_p2p','msg21');
		jAlert( msg, "warning");
		return 0;
	}
	else
	{
		var tmp = str.split(".");
		
		if (tmp.length == 0)
		{
			//var msg = _T('_p2p','msg24')+"("+_T('_format','error_code')+":104)";
			var msg = _T('_p2p','msg21');
			jAlert( msg, "warning");
			return 0;
		}
		else
		{
			if (tmp[tmp.length-1].toUpperCase() != "TORRENT") 
			{
				//var msg = _T('_p2p','msg24')+"("+_T('_format','error_code')+":104)";
				var msg = _T('_p2p','msg21');
				jAlert( msg, "warning");
				return 0;
			}
		}	
	}	
	
	return 1;
}
function p2p_downloads_add_file()
{   
	
	if (p2p_downloads_format_file($("#f_torrent_file").val()) != 1)	return;
	
	stop_web_timeout(true);

	jLoading(_T('_common','set'), 'loading' ,'s',""); 

	$.ajaxFileUpload
	(
		{								
			url:'/cgi-bin/p2p_upload.cgi',
			secureuri:false,
			fileElementId:'f_torrent_file',		
			cmd:'p2p_add_torrent_file_new',		
			filePath:'',
			success: function (data, status)
			{
				restart_web_timeout();
				
				var my_res = $(data).find('res').text();
				var msg = "";
				
				switch(parseInt(my_res))
				{
					case 0:	//Success
					case 1:	
						go_sub_page('/web/addons/p2p.html', 'p2p');
						jLoadingClose();
					break;
					
					case 101://Failed to add this torrent file. The torrent file is invalid or duplicate.
					case 104:
						msg = _T('_p2p','msg21');
					break;
					
					case 102://Failed to add this torrent file. The My Cloud system does not have enough free space.
					case 103:
						msg = _T('_p2p','msg22');
					break;
					
					default://Upload Torrent Error(Error Code:xxx).
						msg = _T('_p2p','msg24')+"("+_T('_format','error_code')+":"+my_res+")";
					break;
				}
				
				if (msg != "") 
				{
					jLoadingClose();
					jAlert( msg, "warning");
				}	
					
				
				$("#f_torrent_file").attr('value','');
		
			},
			error: function (data, status, e)
			{
				jLoadingClose();
			}
		}
	)//end of $.ajaxFileUpload
		
}
function p2p_download_remove_completed()
{
    wd_ajax({
			url: "/cgi-bin/p2p.cgi",
			type: "POST",
			data: {cmd:'p2p_del_all_completed'},
			async: false,
			cache:false,
			dataType:"xml",
			success: function(xml)
			{
			   var my_state = $(xml).find('result').text();
			    if (parseInt(my_state) == 1)
			    {
				    $("#p2p_downloads_list").flexReload();
                }    
			}
	}); 
}
function p2p_download_del(idx)
{
	jConfirm( 'M',_T('_p2p','msg26'), _T('_menu','p2p_downloads_queue'),"p2p",function(r){	//Text:Are you sure want to delete?
	if(r)
    { 	
    	jLoading(_T('_common','set'), 'loading' ,'s',""); 
    	
		wd_ajax({
    			url: "/cgi-bin/p2p.cgi",
    			type: "POST",
    			data: {cmd:'p2p_del_torrent',f_torrent_index:idx},
    			cache:false,
    			dataType:"xml",
    			success: function(xml)
    			{
    			    var my_state = $(xml).find('result').text();
    			    if (parseInt(my_state) == 1)
    			    {
    			       jLoadingClose();
    			    	
    				   $("#p2p_downloads_list").flexReload();
                    }    
    			}
     });
		
	}//end of if(r)
	});//enf of jConfirm...
}
function p2p_download_priority_set(idx,act)
{
	 jLoading(_T('_common','set'), 'loading' ,'s',""); 
	 wd_ajax({
			url:"/cgi-bin/p2p.cgi",
			type:"POST",
			data:{cmd:'p2p_priority_set',f_torrent_index:idx,f_priority:act},
			async:false,
			cache:false, 
			dataType:"xml",
			success: function(xml)
			{
			    jLoadingClose();
			    var my_state = $(xml).find('result').text();
			    if (parseInt(my_state) == 1)
			    {
				   $("#p2p_downloads_list").flexReload();
                }    
			}
	});
}
function p2p_download_start(idx)
{		
	if (timeoutId != 0) clearTimeout(timeoutId);
	
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
	wd_ajax({
    			url:"/cgi-bin/p2p.cgi",
    			type:"POST",
    			data:{cmd:'p2p_start_torrent',f_torrent_index:idx},
    			async:false,
    			cache:false,
    			dataType:"xml",
    			success: function(xml){
    				
    				setTimeout(function() {
    					jLoadingClose();
		    			$("#p2p_downloads_list").flexReload();
					}, 1000);
    				
    			}
    	});
}
function p2p_download_stop(idx)
{
	if (timeoutId != 0) clearTimeout(timeoutId);
	
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
	wd_ajax({
			url:"/cgi-bin/p2p.cgi",
			type:"POST",
			data:{cmd:'p2p_pause_torrent',f_torrent_index:idx},
			async:false,
			cache:false, 
			dataType:"xml",
			success: function(xml)
			{
				setTimeout(function() {
				jLoadingClose();
    			$("#p2p_downloads_list").flexReload();
				}, 1000);
			}
		});
}
