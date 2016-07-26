var APPS_INSTALL_APPS_INFO = new Array();
var APPS_INSTALL_CANCEL = 0;
function apps_detail_get_info(idx)
{
	wd_ajax({
			url: "/cgi-bin/apkg_mgr.cgi",
			type: "POST",
			cache: false,
			async: false,		
			data: {cmd:"cgi_apps_get_info",f_module_name:idx},	
			dataType:"xml",
			success: function(xml)
			{	
				  $("#apps_install_details_name").html(idx);
				  $("#apps_install_details_verison").html($(xml).find("version").text());
				  
				  var my_version = $(xml).find("version").text()
				  $("#apps_install_details_verison").html(my_version);
				   
				  var my_date = $(xml).find("date").text();//Text: MM/DD/YYYY
				  var my_date = dateFormat(
						new Date(
						my_date.slice(6,10),
						(parseInt(my_date.slice(0,2),10)-1),
						my_date.slice(3,5),
						'',
						'',
						''), 
						"dddd, mmmm dS, yyyy");
						
				  $("#apps_install_details_installon").html(my_date);
				  				  
				  if ($(xml).find("url").text() != "")
				  {
					  	
					  	if ($(xml).find("apkg_status").text() == "1")
					  	{
						  	var xurl = document.URL.substr(0, 5);
						  	if (xurl == "https")
						  		my_html = '<a href=\'https://'+document.domain+'/'+$(xml).find("module").text()+'/'+$(xml).find("url").text()+'\' target=\'_blank\'>https://'+document.domain+'/'+$(xml).find("module").text()+'/'+$(xml).find("url").text()+'</a>';
						  	else
						  		my_html = '<a href=\'http://'+document.domain+'/'+$(xml).find("module").text()+'/'+$(xml).find("url").text()+'\' target=\'_blank\'>http://'+document.domain+'/'+$(xml).find("module").text()+'/'+$(xml).find("url").text()+'</a>';
						 }
						 else
						 	 my_html = _T('_module','desc4');		
				  }		
				  else
				  	my_html = _T('_module','desc4');
				  	
				  $("#apps_install_details_config").html(my_html);
				  
				  
				  if( $(xml).find("apkg_status").text() == 1)	
				  {	
				  	$('#But_Apps_Disable').show();
					$('#But_Apps_Enable').hide();
				  }	
				  else	
				  {
				  	$("#But_Apps_Enable").show();
				  	$('#But_Apps_Disable').hide();
				  }		
			}
	});
}
function apps_detail_diag(idx)
{
	apps_detail_get_info(idx);
	
	$("#AppsDiag_title").html(_T('_module','desc22'));
	var AppsObj = $("#Apps_Diag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	INTERNAL_DIADLOG_DIV_HIDE("Apps_Diag");
	$("#AppsDiag_details").show();
	
	init_button();
	language();	
	
	AppsObj.load();
	
	$("#Apps_Diag .close").click(function(){
		$("#Apps_Diag").overlay().close();
		
		INTERNAL_DIADLOG_BUT_UNBIND("Apps_Diag");
		INTERNAL_DIADLOG_DIV_HIDE("Apps_Diag");
		
		$("#But_Apps_Enable").unbind('click');
		$("#But_Apps_Disable").unbind('click');
		$("#But_Apps_Del").unbind('click');
	});
	
	$("#But_Apps_Enable").click(function(){
		jLoading(_T('_common','set'), 'loading' ,'s',""); 
		
		wd_ajax({
			url: "/cgi-bin/apkg_mgr.cgi",
			type: "POST",
			cache: false,		
			data: {cmd:"cgi_apps_set",f_module_name:idx,f_enable:1},	
			dataType:"xml",
			success: function(xml)
			{	
				apps_detail_get_info(idx);
				
				$('#But_Apps_Enable').hide();
				$('#But_Apps_Disable').show();
				$("#Module_List").flexReload();
				
				jLoadingClose();
			}
		});
	});	
	
	$("#But_Apps_Disable").click(function(){
		jLoading(_T('_common','set'), 'loading' ,'s',""); 
		
		wd_ajax({
			url: "/cgi-bin/apkg_mgr.cgi",
			type: "POST",
			cache: false,		
			data: {cmd:"cgi_apps_set",f_module_name:idx,f_enable:0},	
			dataType:"xml",
			success: function(xml){	
				
				apps_detail_get_info(idx);
				
				$('#But_Apps_Enable').show();
				$('#But_Apps_Disable').hide();
				$("#Module_List").flexReload();
				
				jLoadingClose();
			}
		});
	});	
	
	$("#But_Apps_Del").click(function(){
		jLoading(_T('_common','set'), 'loading' ,'s',""); 
		
		wd_ajax({
			url: "/cgi-bin/apkg_mgr.cgi",
			type: "POST",
			cache: false,		
			data: {cmd:"cgi_apps_del",f_module_name:idx},	
			dataType:"xml",
			success: function(xml)
			{
				AppsObj.close();
				
				$("#But_Apps_Enable").unbind('click');
				$("#But_Apps_Disable").unbind('click');
				$("#But_Apps_Del").unbind('click');
				
				$("#Module_List").flexReload();
				
				jLoadingClose();
			}
		});
	});	
}
function apps_browse_install_info(my_id,my_name)
{
	var my_state = ($("#"+my_id).attr("checked") == "checked")?1:0;
	for (var i=0;i<APPS_INSTALL_APPS_INFO.length;i++)
	{
		if (APPS_INSTALL_APPS_INFO[i][0] == my_name )
		{
			APPS_INSTALL_APPS_INFO[i][1] = my_state;
		}
	}
}
function apps_browse_state(my_name)
{
	wd_ajax({
		url:"/xml/app_status.xml",
		type:"POST",
		async:false,
		cache:false,
		dataType:"xml",
		success: function(xml)
		{
			var my_status = $(xml).find("Status").text();
			switch(parseInt(my_status,10))
			{
				case 0://Downloading
					var my_bar = parseInt($(xml).find("Progress").text(), 10);
					var my_desc = my_name + " ";
					my_desc += (parseInt(my_status,10) == 0)? _T('_module','desc15'):_T('_module','desc16');
					
					my_bar = (my_bar == 100)? 98:my_bar;
					
					$("#Apps_InstallApps_State").html(my_desc);
					$("#Apps_InstallApps_parogressbar").progressbar('option', 'value', my_bar);
					$("#Apps_InstallApps_Desc").html(my_bar+" %");
				break;
				
				case 1:	//installing
					$("#Apps_InstallApps_State").html(my_name + " " + _T('_module','desc16'));
					$("#Apps_InstallApps_parogressbar").progressbar('option', 'value', 99);
					$("#Apps_InstallApps_Desc").html("99 %");
				break;
				
				case 2://finish
					
					$("#Apps_InstallApps_parogressbar").progressbar('option', 'value', 100);
					$("#Apps_InstallApps_Desc").html("100 %");
					
					if (timeoutId != 0) clearInterval(timeoutId);
					 
					$("#Apps_InstallApps_State").val(_T('_module','desc13'));
					$("#Apps_InstallApps_Desc").val(''); 
					
					apps_browse_auto_install();
				break;
				
				default://fail
					apps_browse_auto_install();
				break;
			}
				
		}
	})
}

function apps_browse_install(my_name)
{
	wd_ajax({
			url: "/cgi-bin/apkg_mgr.cgi",
			type: "POST",
			async: false,
			cache: false,		
			data: {cmd:"cgi_apps_auto_install",f_module_name:my_name},	
			dataType:"xml",
			success: function(xml)
			{
				if (timeoutId != 0) clearInterval(timeoutId);
				
				timeoutId = setInterval(function(){
						apps_browse_state(my_name);
					}
					, 1500);
			}
	});
}
function apps_browse_auto_install_cancel()
{
	for (var i=0;i<APPS_INSTALL_APPS_INFO.length;i++)
	{
		if (APPS_INSTALL_APPS_INFO[i][1] == 1)
		{
			APPS_INSTALL_APPS_INFO[i][2] = 1;
		}	
	}
}
function apps_browse_auto_install()
{
	var flag = 0;
	for(var i=0;i<APPS_INSTALL_APPS_INFO.length;i++)
	{
		if ( (parseInt(APPS_INSTALL_APPS_INFO[i][1],10) == 1) &&  (parseInt(APPS_INSTALL_APPS_INFO[i][2],10) == 0))
		{
			APPS_INSTALL_APPS_INFO[i][2] = 1;
			flag = 1;
			
			$("#AppsDiag_InstallApps_parogressbar").progressbar( "destroy" );
			apps_browse_install(APPS_INSTALL_APPS_INFO[i][0]);
			
			break;
		}
	}
	
	if (flag == 0)
	{
		if (APPS_INSTALL_CANCEL == 1) jLoadingClose();
		
		INTERNAL_DIADLOG_BUT_UNBIND("Apps_Diag");
		INTERNAL_DIADLOG_DIV_HIDE("Apps_Diag");
		$("#Module_List").flexReload();	
		$("#Apps_Diag").overlay().close();
	}
}
function apps_install_list(my_apkg_name)
{
	var flag = 1;
	
	 $("#Module_List > tbody > tr td:nth-child(2) div").each(function(n){	
	 		if ($(this).text() == my_apkg_name) 
	 		{ 
	 			flag = 0;
	 			return false;
	 		}	
	 });
	 
	 
	 return flag;	
}
function apps_browse_get_info()
{
	wd_ajax({
		url: "/xml/app_info.xml",
		type: "POST",
		async:false,
		cache:false,
		dataType:"xml",
		success: function(xml){
			
			var my_html_tr = "";
			var idx = 0;
			$('App',xml).each(function(n){
				if (1 == apps_install_list($('Name',this).text()))
				{
					APPS_INSTALL_APPS_INFO[idx] = new Array();
					APPS_INSTALL_APPS_INFO[idx][0] = $('Name',this).text();
					APPS_INSTALL_APPS_INFO[idx][1] = "0";
					APPS_INSTALL_APPS_INFO[idx][2] = "0";
					
					if ((n%2) == 1)
						my_html_tr += "<tr id='row " + n + "' class='erow'>";
					else
						my_html_tr += "<tr id='row " + n + "'>";
					
					my_html_tr += "<td><div style=\"padding:10px 0px 0px 0px;text-align: left; width: 40px;\">";	
					my_html_tr += "<input type=\"checkbox\" value=\""+$('Name',this).text()+"\" name=\"f_apps_install_"+n+"\" id=\"f_apps_install_"+n+"\" onclick=\"apps_browse_install_info('f_apps_install_"+n+"','"+$('Name',this).text()+"');\">";	
					my_html_tr += "</div></td>";	
					
					my_html_tr += "<td><div style=\"text-align: left; width: 40px; padding:10px 0px 0px 0px\">";	
					my_html_tr += "<img border='0' src='"+$('Icon',this).text()+"' width='30'>";
					my_html_tr += "</div></td>";	
					
					my_html_tr += "<td><div style=\"text-align: left; width: 200px;\">";	
					my_html_tr += $('Name',this).text();
					my_html_tr += "</div></td>";	
					
					my_html_tr += "<td><div style=\"text-align: right; width: 200px;\"><a href=\""+$('AppDescription',this).text()+"\" target=\'_blank\'>";	
					my_html_tr += _T("_module","desc2");	
					my_html_tr += "</a></div></td>";	
					
					my_html_tr +=  "</tr>";
					
					idx++;
				 }	
			});		
			
			$("#Apps_Browse_List").html(my_html_tr);
		},
        error:function (xhr, ajaxOptions, thrownError){}  
	});
}

function apps_borwse_diag()
{
	APPS_INSTALL_APPS_INFO = new Array();
	APPS_INSTALL_CANCEL = 0;
	apps_browse_get_info();
	
	$("#AppsDiag_title").html(_T('_module','desc6'));
	$("#Apps_InstallApps_State").val(_T('_module','desc13'));
	$("#Apps_InstallApps_Desc").val('');
	
	var AppsObj = $("#Apps_Diag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	INTERNAL_DIADLOG_DIV_HIDE("Apps_Diag");
	$("#AppsDiag_Browse_List").show();
	
	init_button();
	$("input:checkbox").checkboxStyle();
	language();	
	AppsObj.load();
	
	$('.scroll-pane').jScrollPane();
	
	$("#Apps_Diag .close").click(function(){
		AppsObj.close();
		
		INTERNAL_DIADLOG_BUT_UNBIND("Apps_Diag");
		INTERNAL_DIADLOG_DIV_HIDE("Apps_Diag");
	});
	
	$("#apps_next_button_3").click(function(){
		if ($("#apps_next_button_3").hasClass('gray_out')) return;
		
		$("#AppsDiag_Browse_List").hide();
		$("#AppsDiag_InstallApps_State").show();
		
		$("#Apps_InstallApps_parogressbar").progressbar({value: 0});
		$("#Apps_InstallApps_Desc").html("&nbsp;" + 0 +"%");
		
		apps_browse_auto_install();
	});	
	
	$("#apps_cancel_button_4").click(function(){
		
		jLoading(_T('_common','set'), 'loading' ,'s',""); 
		APPS_INSTALL_CANCEL = 1;
		apps_browse_auto_install_cancel();
		
	});		
}
function apps_upgraed_get_info(idx)
{
	wd_ajax({
		url: "/xml/app_info.xml",
		type: "POST",
		async:false,
		cache:false,
		dataType:"xml",
		success: function(xml){
			
			$('App',xml).each(function(n){
				
				if ($('Name',this).text() == idx)
				{
					$("#apps_upgrade_apps").html(idx);
					$("#apps_upgrade_version").html($('Version',this).text()); 
					
					//$("#apps_upgrade_iframe").attr("src",$('ReleaseNotes',this).text());
				}
			});	
		},
        error:function (xhr, ajaxOptions, thrownError){}  
	});
	
	
	$.ajax({
			url:"/cgi-bin/apkg_mgr.cgi",
			type:"POST",
			data:{cmd:'cgi_apps_releasenote', f_module_name:idx},
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml){
				var str = $(xml).find("desc").text();
				str = (str.length == 0)?_T('_module','desc4'):str;
            	$("#apps_upgrade_releasenote").html(str);
			}//end of ajax success
			
	}); //end of ajax
	
}
function apps_upgraed_diag(idx)
{
	apps_upgraed_get_info(idx);
	
	
	$("#AppsDiag_title").html(_T('_module','desc14'));
	var my_desc = _T('_module','desc23').replace(/xxx/g,idx);
	$("#app_update_desc").html(my_desc);
	var AppsObj = $("#Apps_Diag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	INTERNAL_DIADLOG_DIV_HIDE("Apps_Diag");
	$("#AppsDiag_Upgrade").show();
	
	init_button();
	language();	
	AppsObj.load();
	
	$('.scroll-pane').jScrollPane();
	
	$("#apps_next_button_5").click(function(){
		APPS_INSTALL_APPS_INFO = new Array();
		APPS_INSTALL_APPS_INFO[0] = new Array();
		APPS_INSTALL_APPS_INFO[0][0] = idx;
		APPS_INSTALL_APPS_INFO[0][1] = "1";
		APPS_INSTALL_APPS_INFO[0][2] = "0";
		
		$("#AppsDiag_Upgrade").hide();
		$("#AppsDiag_InstallApps_State").show();
		
		$("#Apps_InstallApps_parogressbar").progressbar( "destroy" );
		$("#Apps_InstallApps_parogressbar").progressbar({value: 0});
		$("#Apps_InstallApps_Desc").html("&nbsp;" + 0 +"%");
		
		apps_browse_auto_install();
		
	});		
}
