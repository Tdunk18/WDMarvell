function DLNA_set_on(my_dlna)
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
	wd_ajax({
			type: "POST",
			url: "/cgi-bin/app_mgr.cgi",
			cache:false,
			data:{cmd:'cgi_dlna_set', f_UPNPAVServer:my_dlna},
			dataType: "xml",
			success: function(xml) {	
				google_analytics_log('Media_Streaming_enabled', my_dlna);
				jLoadingClose();
				$(".exposeMask").remove();
				DLNA_get_info();
				
			}//end of success
	});	//end of ajax
}
function DLNA_get_info()
{
	wd_ajax({
		type: "POST",
		async:false,
		cache:false,
		url: "/cgi-bin/app_mgr.cgi",
		data:{cmd:'cgi_dlna_get'},
		dataType: "xml",
		success: function(xml) {
			var my_res = parseInt($(xml).find("res").text(),10);	
			
			//Twonky ON/OFF
			setSwitch('#settings_mediaDLNA_switch', my_res);
			
			if( my_res == 1)
			{	
				if (parseInt($(xml).find("rpcinfo_res").text(),10) ==  0) 
				{
					if (MyVarDLNA != 0 ) clearTimeout(MyVarDLNA);
					
					MyVarDLNA = setTimeout(function(){
							DLNA_get_info();}
							,2000);
					return;		
				}
				
				$("#TD_dlan_view_player").show();
				$("#tr_dlna_version").show();
				$("#tr_dlna_media").show();
				
				$("#tr_dlna_button").show();
				
				//Version
				var my_versioin = $(xml).find("Version").text()
				if ( my_versioin != "")
				{
					$("#DIV_RPC_Version").html(my_versioin);
				}	
				
				//Media
				var my_Music = ($(xml).find("Music").text() == "")? 0:$(xml).find("Music").text();
				var my_Pictures = ($(xml).find("Pictures").text() == "") ? 0:$(xml).find("Pictures").text();
				var my_Vedio = ($(xml).find("Vedio").text() == "")?0:$(xml).find("Vedio").text();
				var my_html = _T('_media','desc9') + ":" + my_Music + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
				my_html +=_T('_media','desc10') + ":" + my_Pictures + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
				my_html +=_T('_media','desc11') + ":" + my_Vedio;
				$("#DIV_RPC_Media").html(my_html);
				
				//Last Update
				if ($(xml).find("isRebuild").text() == "1")
				{
					if (!$("#settings_mediaDLNARescan_button").hasClass('gray_out'))	$("#settings_mediaDLNARescan_button").addClass('gray_out');
					if (!$("#settings_mediaDLNARebuild_button").hasClass('gray_out'))	$("#settings_mediaDLNARebuild_button").addClass('gray_out');
					
					DLNA_Rebuild_Status();
				}
				else
				{	
						$("#tr_dlna_lastupdate").show();
						if ($(xml).find("LastUpdate").text() == "--")
						{
								$("#DIV_RPC_LastUpdate").html(_T('_media','desc12'));
								MyVarDLNA = setTimeout(function(){
									DLNA_get_info();}
									,2000);
						}		
						else	
						{
							if($("#settings_mediaDLNARescan_button").hasClass('gray_out')) $("#settings_mediaDLNARescan_button").removeClass('gray_out');
							if($("#settings_mediaDLNARebuild_button").hasClass('gray_out')) $("#settings_mediaDLNARebuild_button").removeClass('gray_out');
							
							var my_date = $(xml).find("LastUpdate").text();//Date and Time Format: 2000-02-19 10:52
							var dt = new Date(my_date.slice(0,4), (parseInt(my_date.slice(5,7),10)-1), my_date.slice(8,10), my_date.slice(11,13), my_date.slice(14,16)).valueOf();
							$("#DIV_RPC_LastUpdate").html(multi_lang_format_time(dt));
						}
						
						if (MyVarDLNA != 0 ) clearTimeout(MyVarDLNA);
						MyVarDLNA = setTimeout(function(){
							DLNA_get_info();
						},10000);
				}
			}
			else
			{
				if (MyVarDLNA != 0 ) clearTimeout(MyVarDLNA);
				
				$("#TD_dlan_view_player").hide();
				$("#tr_dlna_version").hide();
				$("#tr_dlna_media").hide();
				$("#tr_dlna_lastupdate").hide();
				$("#tr_dlna_button").hide();
			}	
			
		}//end of success
	});	//end of ajax	
}

function DLNA_Rescan()
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
		
	wd_ajax({
			type: "POST",
			url: "/cgi-bin/app_mgr.cgi",
			cache:false,
			data:{cmd:'cgi_dlna_rescan'},
			dataType: "xml",
			success: function(xml) {	
				
				MyVarDLNA_Ready = setTimeout(function(){
					DLNA_get_info();
					jLoadingClose();
				}, 2000);
					
			}//end of success
	});	//end of ajax
}
function DLNA_Rebuild_Finish()
{
	wd_ajax({
			type: "POST",
			url: "/cgi-bin/app_mgr.cgi",
			cache:false,
			data:{cmd:'cgi_dlna_rebuild_finish'},
			dataType: "xml",
			success: function(xml) {	
			}//end of success
	});	//end of ajax
}
function DLNA_Rebuild_Status()
{
	wd_ajax({
		url: "/xml/rebuild_status.xml", 
		type: "GET",
		async:false,
		cache:false,
		dataType:"xml",
		success: function(xml){
				//Media
				var my_Music = ($(xml).find("musictracks").text() == "")? 0:$(xml).find("musictracks").text();
				var my_Pictures = ($(xml).find("pictures").text() == "") ? 0:$(xml).find("pictures").text();
				var my_Vedio = ($(xml).find("videos").text() == "")?0:$(xml).find("videos").text();
				var my_html = _T('_media','desc9') + ":" + my_Music + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
				my_html +=_T('_media','desc10') + ":" + my_Pictures + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
				my_html +=_T('_media','desc11') + ":" + my_Vedio;
				$("#DIV_RPC_Media").html(my_html);
				
				var my_finish = parseInt($(xml).find("finished").text(),10);
				if (my_finish == 1)
				{
					DLNA_Rebuild_Finish();
					
					$("#settings_mediaDLNARebuildProgressbar_div").progressbar('option', 'value', 100);
					
					MyVarDLNA_Ready = setTimeout(function(){
						$("#tr_dlna_lastupdate_rebuild_ready").hide();
						$("#tr_dlna_lastupdate_rebuild_progress").hide();
						$("#tr_dlna_lastupdate").show();
						
						DLNA_get_info();
					}, 2000);
				}
				else
				{	
					$("#tr_dlna_lastupdate_rebuild_ready").hide();
					$("#tr_dlna_lastupdate_rebuild_progress").show();
					var my_progress = Math.min(parseInt($(xml).find("percentage").text(),10),99);
					
					if (my_progress != 0)
					{
						var my_obj = $("#settings_mediaDLNARebuildProgressbar_div").data("progressbar");
						if ( my_obj == null ) {// handle case when no progressbar is setup for my selector
						    $("#settings_mediaDLNARebuildProgressbar_div").progressbar({value: my_progress});
						} else {
						    $("#settings_mediaDLNARebuildProgressbar_div").progressbar('option', 'value', my_progress);
						}
					}
									
					MyVarDLNA_Ready = setTimeout(function(){
						DLNA_Rebuild_Status();
					}, 2000);
				}	
		},
		error: function (xhr, ajaxOptions, thrownError){
				MyVarDLNA_Ready = setTimeout(function(){
					DLNA_Rebuild_Status();
				}, 2000);
		},
		complete: function() {}
	});	
}

function DLNA_Rebuild()
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
	wd_ajax({
			type: "POST",
			url: "/cgi-bin/app_mgr.cgi",
			cache:false,
			data:{cmd:'cgi_dlna_rebuild'},
			dataType: "xml",
			success: function(xml) {	
				jLoadingClose();
				
				MyVarDLNA_Ready = setTimeout(function(){
					DLNA_Rebuild_Status();
				}, 2000);
					
			}//end of success
	});	//end of ajax
}


