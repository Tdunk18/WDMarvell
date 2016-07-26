var DiagnosticsSetTimeOutId = 0;

function show_volsize_str(str)    
{
	if (str.indexOf(".") != -1)
	{
		//1.2 --> 1.20
		var tmp = str.split(".");
		if (tmp.length == 2)	str = (tmp[0].length ==1)? str+"0":str;
	}
	else
	{
		str = str + ".00";
	}	
	
	/*
		1.23456 => 1.23
		12.3456 => 12.3
		123.456 => 123
		12345.6 => 1234
	*/
	
	var idx = str.lastIndexOf(".");
	
	switch(idx)
	{
		case 3:
			var val = str.toString().substring(0,3);
		break;
		default:
			var val = str.toString().substring(0,4);
		break;	
	}
	
	return val;
}
function home_show_volume_info(str)    
{
	$("#home_volcapity_pei").hide();
	$("#home_volcapity_info").show();
	
	wd_ajax({
				url: "/xml/sysinfo.xml",
				type: "GET",
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml){
					
					var total_free_blocks_size = parseInt($(xml).find('vols').find('total_size').text(),10) - parseInt($(xml).find('vols').find("total_used_size").text() ,10);
					if (total_free_blocks_size < 1) total_free_blocks_size = 0;
	
					var vol_size = size2str(total_free_blocks_size);
					vol_size = (parseInt(vol_size,10) == 0)?"0.00 MB":vol_size;
					var tmp = vol_size.split(" ");
					if (tmp.length ==2)
					{
						var show_vol_size = show_volsize_str(tmp[0].substring(0,4));
						$("#"+str+"_b4_capacity_info").html(show_vol_size);
						$("#"+str+"_b4_capacity_size").html(tmp[1]);
					}
					else
					{
						$("#"+str+"_b4_capacity_info").html("0");
						$("#"+str+"_b4_capacity_size").html("KB");
					}	
				},
        error:function (xhr, ajaxOptions, thrownError){}  
	});	
}
function home_show_user_quota_info()    
{
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/home_mgr.cgi",
		data: {
					cmd:'7',
					f_user:getCookie("username")},		
		dataType: "xml",		
		async: true,
		cache:false,
		success: function(xml){
			var user_quota_free_size = parseInt($(xml).find('user_quota_size').text(),10) * 1024;
			var vol_size = size2str(user_quota_free_size);
			vol_size = (parseInt(vol_size,10) == 0)?"0.00 MB":vol_size;
			var tmp = vol_size.split(" ");
			
			var show_vol_size = show_volsize_str(tmp[0].substring(0,4));
			$("#myhome_b4_capacity_info").html(show_vol_size);
			$("#myhome_b4_capacity_size").html(tmp[1]);
  		} // end of success 
	});//end of ajax
}
function show_user_info()
{
	var local_total=0;
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/xml/account.xml",
		dataType: "xml",
		success: function(xml){
			var cloudholderMember= new Array();
			$(xml).find('groups > item').each(function(index){
				var gname = $(this).find('name').text();

				if(gname==_Filter_Default_Group[0])	//0:cloudholders
				{
					$(this).find('users > user').each(function(){
						cloudholderMember.push($(this).text());
					});
				}
			});
			
			$(xml).find('users > item').each(function(index){
				var user_name = $(this).find('name').text();
				if(api_filter_user(user_name,cloudholderMember) ==0 ) local_total++;	//non-cloudholders users cannot show on GUI
			});
			
			_ad();
		},
		error:function(xmlHttpRequest,error){
			//alert("Error: " +error);
		}
	});

	function _ad()
	{
		wd_ajax({
			type: "GET",
			cache: false,
			url: "/web/php/getADInfo.php?type=users",
			dataType: "xml",
			success: function(xml){
				var ad_total = $(xml).find("users > item").length;
				if(ad_total >_MAX_TOTAL_AD_ACCOUNT) ad_total=_MAX_TOTAL_AD_ACCOUNT;
				//$(".uTotal_title").html(_T('_menu_title','users'));
				var total = ad_total + local_total;
				$("#home_user_value").empty().html(total);
				$("#home_user_link").show();
			},
			error:function(xmlHttpRequest,error){
				//alert("Error: " +error);
			}
		});
	}	
}
function show_module_info(callback)
{
	var total = 1;		//HTTP Download support all nas
	
	if (FTP_DOWNLOADS_FUNCTION == 1) total++;
	if (P2P_DOWNLOADS_FUNCTION ==1) total++;
	if (WEB_FILE_VIEWER_FUNCTION ==1)	total++;
	if(typeof(SAFEPOINTS_FUNCTION) !== 'undefined') if (SAFEPOINTS_FUNCTION==1)	total++;
	
	wd_ajax({
		url: "/xml/apkg_all.xml",
		type: "GET",
		async:false,
		cache:false,
		dataType:"xml",
		success: function(xml){
			var login_user = getCookie("username");
			if (user_login!='1')
				total = parseInt(total,10) + $(xml).find('procudt_id').length;
			else
			{	
				$('item',xml).each(function(e){
					if ($('user_control',this).text() == "0")
					{
						total ++;
					}
				});	//end of each
			}
			
			if(callback) 
			{
				callback(total);
			}
		},
		error:function(xmlHttpRequest,error){
			if(callback) 
			{
				callback(total);
			}
		}
	});	
}
function Home_apps_count()
{
	show_module_info(function(HomeAppCnt){		
		$("#home_apps_count").empty().html(HomeAppCnt);
		var login_user = getCookie("username");
		
		if (parseInt(HomeAppCnt,10) == 0)
		{
			if (user_login!='1')//admin
				$("#home_apps_link").removeClass("WDlabelArrowIconSmall").addClass("WDlabelArrowIconSmallGlay");
			else //non-admin
				$("#user_home_apps_link").removeClass("WDlabelArrowIconSmall").addClass("WDlabelArrowIconSmallGlay");
		}
		else
		{
			if (user_login!='1')//admin
			{
				$("#home_apps_link").click(function(){
					google_analytics_log('Home-Apps','');
					diag_apps_list();
				}).removeClass("WDlabelArrowIconSmallGlay").addClass("WDlabelArrowIconSmall");	
			}
			else //non-admin
			{
				$("#user_home_apps_link").click(function(){
						go_page('/web/myHome/apps.html', 'nav_app');
				});	
			}	
		}
		
	}	);
	
}
function show_ftp_download_count()
{
	wd_ajax({
		type: "POST",
		url: '/web/addons/ftp_download.php?action=get_list',
		dataType: "json",	
		cache:false,
		success: function(r){
			var ftp_download_count = r.total;
			$("#ftp_download_div").html(ftp_download_count);
			$("#total_ftp_downloads").html();
		}
	});
}

function show_http_download_count()
{
	wd_ajax({
		type: "POST",
		url:  '/cgi-bin/download_mgr.cgi',
		data: {
			cmd:'cgi_downloads_http_list',
			f_field:getCookie("username"),
			page: 1,
			rp: 1
		},
		dataType: "xml",		
		cache:false,
		success: function(xml){
			$("#http_download_div").html($(xml).find('total').text());
			$("#total_http_downloads").html($(xml).find('total').text());
		}
	});
}

function show_p2p_download_count()
{
	wd_ajax({
		type: "POST",
		url: '/cgi-bin/p2p.cgi',
		data: {
			cmd:'p2p_get_list_by_priority',
			page: 1,
			rp: 1
		},
		dataType: "json",		
		cache:false,
		success: function(r){
			if (r)
			{
				$("#p2p_download_div").html(r.total);
				$("#total_p2p_downloads").html(r.total);
			}
		},
		error: function () {
			$("#p2p_download_div").html(0);
			$("#total_p2p_downloads").html(0);
		}
	});
}

function open_fw()
{
	location.replace("/web/settings/firmware.html");
}
var _StrHealthy = "";
var _StrCaution ="";
function get_diagnostics_state()
{
	if(_StrHealthy.length==0) _StrHealthy = _T('_home','healthy');
	if(_StrCaution.length==0) _StrCaution = _T('_home','desc10');
	
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/home_mgr.cgi",
		data: {cmd:'2'},		
		dataType: "xml",		
		async: true,
		cache:false,
		success: function(xml){
				/*
				State:
				0,Healthy
				1,Caution ¡V Critical, but not severe alerts ¡V like RAID degraded
				2,Warning ¡V Critical and severe ¡V RAID crashed.
				*/
				var my_state = 0;
				
				//fan 
				if (parseInt($(xml).find("fan").text(),10) == -1)
				{	
					my_state = ( my_state == 0) ? 1:my_state;
				}	
				
				//board temperature check:
				if (parseInt( $(xml).find("board_temperature").text(), 10) != 0)
				{
					my_state = ( my_state == 0) ? 1:my_state;
				}
				//drive temperature check:
				$(HOME_XML_SYSINFO).find('disks').find('disk').each(function(idx){
					if ( $('name',this).text().length != 0)
					{
						if (parseInt($('over_temp',this).text(), 10) == 1)
						{
								my_state = ( my_state == 0) ? 1:my_state;
						}	
					}
				});	
					
				//HD S.M.A.R.T. Test Check
				var hd_status = "";
				$('disk', xml).each(function(idx){
					switch($(this).text())
					{
						case "none":
							if ( hd_status != "healthy") hd_status =$(this).text();
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
				my_state = ( hd_status == "non-healthy") ? 1:my_state;
				
				//RAID Status Check
				if ($(xml).find("raid > res").text() == 1)
				{
					$('item',xml).each(function(e){
						
						switch($('state',this).text())
						{
							case "degraded"://Degraded
							case "damaged"://Damaged
							case "resync":
							case "recovery":
							case "migrate":
							case "reshape"://Expanding
							case "expansion":
								my_state = ( my_state == 0) ? 1:my_state;
							break;
						}	
					})	
				}
				else
				{
					my_state = ( my_state == 0) ? 1:my_state;
				}
				
				if (my_state == 0)
				{
					show_state =_StrHealthy;
					if (!$("#diagnostics_icon").hasClass('WDlabelOkIcon')) $("#diagnostics_icon").addClass('WDlabelOkIcon');
				}
				else
				{
					show_state = _StrCaution;
					if (!$("#diagnostics_icon").hasClass('WDlabelCautionIcon')) $("#diagnostics_icon").addClass('WDlabelCautionIcon');
				}	
				
				$("#diagnostics_state").empty().html(show_state);
				
				if ( DiagnosticsSetTimeOutId != 0 ) clearTimeout(DiagnosticsSetTimeOutId);
				DiagnosticsSetTimeOutId = setTimeout("get_diagnostics_state()", 5000);
				
		} // end of success 
	});//end of ajax
}

function Home_RAIDRoaming_Diag()
{
	var HomeRAIDObj = $("#HomeRAID_Diag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});
	init_button();
	language();
	
	INTERNAL_DIADLOG_DIV_HIDE("HomeRAID_Diag");
	$("#HomeRAID_Roaming").show();
	
	HomeRAIDObj.load();
 	
 	$("#HomeRAID_Diag .close").click(function(){
		wd_ajax({
				url:"/cgi-bin/hd_config.cgi",
				type:"POST",
				data:{cmd:'cgi_RAID_Roaming_Skip'},
				cache:false,
				dataType:"xml",
				success: function(xml){
					HomeRAIDObj.close();
					
					INTERNAL_DIADLOG_BUT_UNBIND("HomeRAID_Diag");
					INTERNAL_DIADLOG_DIV_HIDE("HomeRAID_Diag");
					
					web_raidroaming_settimeout = 	setTimeout(function(){
						Home_Load_SYSINFO();
						Home_RAIDRoaming_Check();
					}, 2000);	
					
					go_page('/web/storage/storage.html', 'nav_storage');
				}//end of success
		});	// end of ajax	
	});
		
	$("#home_RAIDRoamingNext1_button").click(function(){
		
			$(this).unbind('click');
			
			if ($(this).hasClass('grayout')) return;
			
			$(this).addClass('grayout');
			
			jLoading(_T('_common','set'), 'loading' ,'s', ''); 
			
			window.clearTimeout(web_raidroaming_settimeout);
			web_raidroaming_settimeout = -1;
			
			wd_ajax({
				url:"/cgi-bin/hd_config.cgi",
				type:"POST",
				data:{cmd:'cgi_RAID_Roaming'},
				cache:false,
				dataType:"xml",
				success: function(xml){
						
						$("#home_RAIDRoamingNext1_button").removeClass('grayout');
						
						HomeRAIDObj.close();
						jLoadingClose();
						
						web_raidroaming_settimeout = 	setTimeout(function(){
							Home_Load_SYSINFO();
							Home_RAIDRoaming_Check();
						}, 15000);	
						
				}//end of success
			});	// end of ajax	
	});	
}
function Home_RAIDRoaming_Check()
{	
	var my_roaming = $(HOME_XML_SYSINFO).find('vols').find('roaming').text();
	var my_roaming_skip = $(HOME_XML_SYSINFO).find('vols').find('skip_roaming').text();
	
	if ( my_roaming.indexOf("1") != -1 && my_roaming_skip != "1")//is roaming
	{
		var my_raid_state = 0;
		$(HOME_XML_SYSINFO).find('vols').find('vol').each(function(idx){
			
				if ($('raid_state',this).text() != "clean")
				{
						my_raid_state = 1;
				}
		});
		
		if ( parseInt(my_raid_state,10) == 0)	Home_RAIDRoaming_Diag();
	}
	else
	{
		window.clearTimeout(web_raidroaming_settimeout);
		web_raidroaming_settimeout = -1;
		web_raidroaming_settimeout = setTimeout("Home_RAIDRoaming_Check()", 5000);
	}
}
