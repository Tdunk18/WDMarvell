var timeoutId = 0;
function itunes_cleatinterval()
{
	clearInterval(MyVariTunes);
	MyVariTunes=0;
}
function iTunes_set_on(my_ituens)
{
		jLoading(_T('_common','set'), 'loading' ,'s',""); 
		
		wd_ajax({
			url: "/cgi-bin/app_mgr.cgi",
			type: "POST",
			async: false,
			cache: false,
			data:{cmd:'cgi_itunes',
				f_iTunesServer:my_ituens
			},	
			dataType:"xml",
			success: function(xml){
				google_analytics_log('iTunes_enabled', my_ituens);
				 
				if (parseInt(my_ituens,10) == 1)
				{
					MyVariTunes = setInterval("iTunes_check_ps('3')",2000);
				}
				else
				{
					iTunes_disable_item(0);
					jLoadingClose();
				}	
				
			}//end of success: function(xml){
		}); //end of wd_ajax({	
}
function iTunes_format_pwd(str)
{
// alpha ibuki modify on 2014 08 04
//Text:	Password supports 1 character
//	if ( str.length < 2 && str.length != 0)
//	{
//		jAlert( _T('_itunes','msg3'), "warning");		//Text:	Password must be at least 2 characters in length. Please try again.
// 		return 0;
//	}
// alpha ibuki modify on 2014 08 04 end

	if (str.length >16)
	{
		jAlert( _T('_itunes','msg4'), "warning");	//Text:	The Password length must not exceed 16 characters.
 		return 0;
	}

	if( str.length != 0 )
	{
	    if( (pw_check(str) == 1) ||  str.indexOf("#")!= -1)
		{
			jAlert(_T('_itunes','msg7'), "warning"); 	//Text: The password must not include the following character:  @ : / \ % ' #
			return  0;
		}
		if(str.indexOf(" ")!= -1)
		{
			jAlert(_T('_pwd','msg3'), "warning"); 	//Text: Password cannot contain spaces.
			return  0;
		}


	}

	return 1;
}
function iTunes_autorefresh_show(idx)
{
	var str="";

	switch(parseInt(idx, 10))
	{
		case 0:
			str = _T("_network_access","none");
		break;

		case 300:
			str = _T("_itunes","auto_refresh1");
		break;

		case 900:
			str = _T("_itunes","auto_refresh2");
		break;

		case 1800:
			str = _T("_itunes","auto_refresh3");
		break;

		case 3600:
			str = _T("_itunes","auto_refresh4");
		break;

		case 7200:
			str = _T("_itunes","auto_refresh5");
		break;

		case 21600:
			str = _T("_itunes","auto_refresh6");
		break;

		case 43200:
			str = _T("_itunes","auto_refresh7");
		break;

		case 86400:
			str = _T("_itunes","auto_refresh8");
		break;
	}

	return str;
}
function iTunes_get_info()
{
		wd_ajax({
    			url:"/cgi-bin/app_mgr.cgi",
    			type:"POST",
    			async:false,
    			cache:false,
    			data:{cmd:'iTunes_Server_Get_XML'},
    			dataType:"xml",
    			success: function(xml)
    			{
    				var my_enable = $(xml).find("enable").text();
    				if (parseInt(my_enable) == 1)   // iTunes Server is enable
    				{
    				   setSwitch('#settings_mediaiTunes_switch',1);
                       iTunes_disable_item(1);
    				}
   			}
    	});//end of wd_ajax({....
}

function iTunes_check_ps(my_type)
{
	wd_ajax({
			url: "/cgi-bin/app_mgr.cgi",
			type: "POST",
			async: false,
			cache: false,
			data:{cmd:'iTunes_Server_Check_PS',f_type:my_type},
			dataType:"xml",
			success: function(xml){
				 var my_res = $(xml).find("res").text();
				 var my_type = $(xml).find("type").text();

				 if (parseInt(my_res) == 1)
				 {
				 	itunes_cleatinterval();
				 	jLoadingClose();

				 	if (parseInt(my_type,10) == 2)
				 	{
				 		$("#tr_itunes_db").hide();
						$("#tr_itunes_db_state").show();
						iTunes_show_state();
				 	}
				 	else
				 		iTunes_disable_item(1);

				 }
			}//end of success: function(xml){

		}); //end of wd_ajax({
}
function iTunes_check_ready()
{
	if (parseInt(MyVariTunes) == 0)
    {
    	MyVariTunes = setInterval("iTunes_check_ready()",2000);
    }

	wd_ajax({
			url: "/cgi-bin/app_mgr.cgi",
			type: "POST",
			async: false,
			cache: false,
			data:{cmd:'iTunes_Server_Ready'},
			dataType:"xml",
			success: function(xml)
			{
				itunes_cleatinterval();

				var my_state = $(xml).find("config > state").text();

				switch(parseInt(my_state))
				{
					case 0://itunes diable
						setSwitch('#settings_mediaiTunes_switch',0);
    			        iTunes_disable_item(0);
					break;
					case 1://itunes enable and ready
						 iTunes_get_info();
					break;

					case 2://no ready
					break;

					case 3://refresh,show progress bar
						 iTunes_get_info();

						 $("#tr_itunes_db").hide();
						 $("#tr_itunes_db_state").show();

						 $("#itunes_progressbar").progressbar({value: 0});
				 		 $("#itunes_percent").html("0 %");

						 iTunes_show_state();
					break;
				}//end of switch
			}//end of success
	});//end of ajax
}
//function iTunes_check()
//{
//	var my_dir = $("#f_itunes_dir").val();
//	var my_passwd = $("#f_passwd").val();
//
//	if ( getSwitch('#itunes_switch') == 1) //itunes enable
//	{
//
//		//check passwd
//		if ( my_passwd.length < 2 && my_passwd.length != 0)
//    	{
//    		jAlert( _T('_itunes','msg3'), "warning");		//Text:	Password must be at least 2 characters in length. Please try again.
//     		return;
//    	}
//
//    	if (my_passwd.length >16)
//    	{
//    		jAlert( _T('_itunes','msg4'), "warning");	//Text:	The Password length must not exceed 16 characters.
//     		return;
//    	}
//
//    	if( my_passwd.length != 0 )
//    	{
//		    if( (pw_check(my_passwd) == 1) ||  my_passwd.indexOf("#")!= -1)
//			{
//				jAlert(_T('_itunes','msg7'), "warning"); 	//Text: The password must not include the following character:  @ : / \ % ' #
//				return 1;
//			}
//    	}
//
//	}
//	var my_itunes_root = ( $("input[name='f_itunes_root']:checked").val() == 1) ? 1:0;
//	var my_lang = $("#f_lang").val();
//	var my_rescan_interval = $("#f_itunes_rescan_interval").attr('rel');
//
////	var msg = "my_itunes_root = " + my_itunes_root + "\n";
////		msg += "my_dir = " + my_dir + "\n";
////		msg += "my_passwd = " + my_passwd + "\n";
////		msg += "my_lang = " + my_lang + "\n";
////		msg += "my_rescan_interval = " + my_rescan_interval + "\n";
////	alert(msg);
//
//	jLoading(_T('_common','set'), 'loading' ,'s',"");
//
//	wd_ajax({
//			url: "/cgi-bin/app_mgr.cgi",
//			type: "POST",
//			async: false,
//			cache: false,
//			data:{cmd:'iTunes_Server_Setting',
//				f_root:my_itunes_root,
//				f_dir:my_dir,
//				f_passwd:my_passwd,
//				f_lang:my_lang,
//				f_rescan_interval:my_rescan_interval},
//			dataType:"xml",
//			success: function(xml){
//				 var my_res = $(xml).find("res").text();
//				 var my_state = $(xml).find("state").text();
//
//				switch(parseInt(my_res))
//				{
//					case 2:	//update db
//					case 3:
//						MyVariTunes = setInterval("iTunes_check_ps('"+my_res+"')",2000);
//					break;
//
//					default:
//						jLoadingClose();
//
//						iTunes_get_info();
//					break;
//				}
//
//			}//end of success: function(xml){
//
//	}); //end of wd_ajax({
//}

function iTunes_refresh()
{
	iTunes_disable_item(2);

 	$("#itunes_desc").html(_T('_itunes','desc5'));
 	$("#itunes_progressbar").progressbar({value: 0});
 	$("#itunes_percent").html("0 %");

	wd_ajax({
			url: "/cgi-bin/app_mgr.cgi",
			type: "POST",
			async: false,
			cache: false,
			data:{cmd:'iTunes_Server_Refresh'},
			dataType:"xml",
			success: function(xml){
				 var my_res = $(xml).find("res").text();

				 itunes_cleatinterval();
				 iTunes_show_state();
			}//end of success: function(xml){

		}); //end of wd_ajax({
}

function iTunes_disable_item(flag)
{
	/*
		flag:
			0 -> disable
			1 -> enable
			2 -> enable, update db
	*/
	switch(parseInt(flag))
    {
        case 0: //iTunes disable
        	$("#TD_itunes_advanced_options").hide();

        	$("#tr_itunes_db").hide();
        	$("#tr_itunes_db_state").hide();
        break;

        case 1: //iTunes enable
        	$("#TD_itunes_advanced_options").show();

        	$("#tr_itunes_db").show();
        	$("#tr_itunes_db_state").hide();

        	//button
        	$("#settings_mediaiTunesRefresh_button").removeClass("gray_out");
        break;

        case 2: //iTunes enable / update db
        	$("#TD_itunes_advanced_options").hide();

        	$("#tr_itunes_db").hide();
        	$("#tr_itunes_db_state").show();

        	//button
        	$("#settings_mediaiTunesRefresh_button").removeClass("gray_out");
        break;
    }
}
function iTunes_show_state()
{
    if (parseInt(MyVariTunes) == 0)
    {
    	MyVariTunes = setInterval("iTunes_show_state()",1000);
    }

    wd_ajax({
			url: "/cgi-bin/app_mgr.cgi",
			type: "POST",
			async: false,
			cache: false,
			data:{cmd:'iTunes_Server_Refresh_State'},
			dataType:"xml",
			success: function(xml){
				 var bar_state = $(xml).find("state").text();
				 var bar_amount = parseInt($(xml).find("bar").text(), 10);

				 if ( parseInt(bar_state) == 1 )  // refresh done
				 {
				 	itunes_cleatinterval();
					$("#itunes_progressbar").progressbar({value: 100});
					$("#itunes_percent").html("&nbsp;100 %");

					iTunes_disable_item(1);
				 }
				 else
				 {
					var desc = (parseInt(bar_amount,10) == 0) ? _T('_itunes','desc5'):_T('_upnp','msg5'); // Text:System is building up your media library.

						bar_amount = Math.max(0,bar_amount);
						bar_amount = Math.min(100,bar_amount);
						
					$("#itunes_desc").html(desc);
					$("#itunes_progressbar").progressbar({value: bar_amount});
					$("#itunes_percent").html("&nbsp;" + bar_amount +"%");
				}
			}//end of success: function(xml){

		}); //end of wd_ajax({
}