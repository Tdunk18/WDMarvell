var HTTP_Downloads = new Array(
"0",					//HTTP_Downloads[0]:Category,ex:0->HTTP Downloads, 1->FTP Downloads
"1",					//HTTP_Downloads[1]:Login Method,ex:0->Account,1->Anonymous
getCookie("username"),	//HTTP_Downloads[2]:Login User
"",						//HTTP_Downloads[3]:User
"",						//HTTP_Downloads[4]:PWD
"0",					//HTTP_Downloads[5]:Type, 0->File,1->Folder
"",						//HTTP_Downloads[6]:URL
"",						//HTTP_Downloads[7]:Save To
"",						//HTTP_Downloads[8]:Date
"none",					//HTTP_Downloads[9]:f_period:$("#f_period").attr('rel'),
"",						//HTTP_Downloads[10]:f_period_week:$("#f_period_week").attr('rel'),
"",						//HTTP_Downloads[11]:f_period_month:$("#f_period_month").attr('rel'),
"",						//HTTP_Downloads[12]:Incremental Backup
"",						//HTTP_Downloads[13]:Rename
""						//HTTP_Downloads[14]:CodePage
)
function HDownloads_hour_show(idx)
{
	
	var val = idx;
	
	if(TIME_FORMAT == "12")
	{
		var AM = _T('_backup','desc10');
		var PM = _T('_backup','desc11');
		
		var hour_info = new Array();	
		hour_info.push("12" + AM);		//0
		hour_info.push("1" + AM);		//1
		hour_info.push("2" + AM);		//2
		hour_info.push("3" + AM);		//3
		hour_info.push("4" + AM);		//4
		hour_info.push("5" + AM);		//5
		hour_info.push("6" + AM);		//6
		hour_info.push("7" + AM);		//7
		hour_info.push("8" + AM);		//8
		hour_info.push("9" + AM);		//9
		hour_info.push("10" + AM);		//10
		hour_info.push("11" + AM);		//11
		hour_info.push("12" + PM);		//12
		hour_info.push("1" + PM);		//13
		hour_info.push("2" + PM);		//14
		hour_info.push("3" + PM);		//15
		hour_info.push("4" + PM);		//16
		hour_info.push("5" + PM);		//17
		hour_info.push("6" + PM); 		//18
		hour_info.push("7" + PM);		//19
		hour_info.push("8" + PM);		//20	
		hour_info.push("9" + PM);		//21
		hour_info.push("10" + PM);		//22
		hour_info.push("11" + PM);		//23
		
		val = hour_info[parseInt(idx,10)].toString();
	}
	else
	{
		val = (parseInt(idx,10) < 10)?"0"+idx:idx;
	}	
			
	return val;
}
function HDownloads_html_hour(my_id)
{	
	if(TIME_FORMAT == "12")
	{
		var select_array = new Array(
			//0,1,2,3,4
		"12AM","1AM","2AM","3AM","4AM","5AM","6AM","7AM","8AM","9AM","10AM","11AM","12PM","1PM","2PM","3PM","4PM","5PM","6PM"
		,"7PM","8PM","9PM","10PM","11PM"
			);
	}
	else
	{
			var select_array = new Array(
			//0,1,2,3,4
		"00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18"
		,"19","20","21","22","23"
			);		
	}	


	var select_v_array = new Array(
			0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23
			);
			
			SIZE = 24;
			SIZE2 = 2;


			var a = new Array(SIZE);
			
			for(var i=0;i<SIZE;i++)
			{
				a[i] = new Array(SIZE2);
			}



			for(var i = 0; i < SIZE; i++)
				for(var j = 0; j < SIZE2; j++)
				{
					a[i][0] = select_array[i];
					a[i][1] = select_v_array[i];
				}

			$(my_id).empty();								
			var my_html_options="";			
			my_html_options+="<div class='scrollbar_time'>";
			my_html_options+="<li class=\"li_start\" rel=\""+select_v_array[0]+"\"><a href='#'>"+select_array[0]+"</a>";									
			for (var i = 1;i<select_array.length -1;i++)
			{		
				my_html_options+="<li rel=\""+select_v_array[i]+"\"><a href='#'>"+select_array[i]+"</a>";		
			}
			var j = select_array.length-1;
			my_html_options+="<li class=\"li_end\" rel='"+select_v_array[j]+"'><a href='#'>"+select_array[select_array.length-1]+"</a>";
			my_html_options+="</div>";
			my_html_options+="</ul>";
			my_html_options+="</li>";
			my_html_options+="</ul>";
			$(my_id).append(my_html_options);	
		
			$(my_id+" .option_list ul").css("width","90px");
			$(my_id+" .option_list ul li").css("width","80px");			
}
function HDownloads_login_method(val)
{
	if ( HTTP_Modify[15].length == 0)
	{
		HTTP_Downloads[1] = val;
		HTTP_Downloads[3] = "";
		HTTP_Downloads[4] = "";
	}	
	else
	{
		HTTP_Modify[1] = val;
		HTTP_Modify[3] = "";
		HTTP_Modify[4] = "";
	}	
	
	if ( val == "1")	//Anonymous
	{
		$("#tr_user_name").hide();
		$("#tr_pwd").hide();
		
		if($("#apps_httpdownloadsLoginMethodAccount_button").hasClass('buttonSel'))	$("#apps_httpdownloadsLoginMethodAccount_button").removeClass('buttonSel');
		if(!$("#apps_httpdownloadsLoginMethodAnonymous_button").hasClass('buttonSel'))	$("#apps_httpdownloadsLoginMethodAnonymous_button").addClass('buttonSel');
	}
	else	//Account
	{
		$("#tr_user_name").show();
		$("#tr_pwd").show();
		
		if(!$("#apps_httpdownloadsLoginMethodAccount_button").hasClass('buttonSel'))	$("#apps_httpdownloadsLoginMethodAccount_button").addClass('buttonSel');
		if($("#apps_httpdownloadsLoginMethodAnonymous_button").hasClass('buttonSel'))	$("#apps_httpdownloadsLoginMethodAnonymous_button").removeClass('buttonSel');
	}
}
function HDownloads_datepicker_date_format()
{
	var str = "";
	
	switch(DATE_FORMAT)
	{
		case "YYYY-MM-DD":
			str = "yy-mm-dd";
		break;
		
		case "MM-DD-YYYY":
			str = "mm-dd-yy";
		break;
		
		case "DD-MM-YYYY":
			str = "dd-mm-yy";
		break;
	}
	
	return str;
}

function HDownloads_date_format_show(str)
{
	/*
		1. MM/DD/YYYYY --> YYYY-MM-DD or MM-DD-YYYY or DD-MM-YYYY
		2. YYYY-MM-DD or MM-DD-YYYY or DD-MM-YYYY --> MM/DD/YYYYY
	*/
	
	if ( str.indexOf("/") != -1)	//MM/DD/YYYYY --> YYYY-MM-DD or MM-DD-YYYY or DD-MM-YYYY
	{
		var tmp = str.split("/");	//text: MM/DD/YYYY
		switch(DATE_FORMAT)
		{
			case "YYYY-MM-DD":
				str = tmp[2]+"-"+tmp[0]+"-"+tmp[1];
			break;
			
			case "MM-DD-YYYY":
				str = tmp[0]+"-"+tmp[1]+"-"+tmp[2];
			break;
			
			case "DD-MM-YYYY":
				str = tmp[1]+"-"+tmp[0]+"-"+tmp[2];
			break;
		}
	}
	else	//YYYY-MM-DD or MM-DD-YYYY or DD-MM-YYYY --> MM/DD/YYYYY
	{
		var tmp = str.split("-");	//text: YYYY-MM-DD or MM-DD-YYYY or DD-MM-YYYY
		switch(DATE_FORMAT)
		{
			case "YYYY-MM-DD":
				str = tmp[1]+"-"+tmp[2]+"-"+tmp[0];
			break;
			
			case "MM-DD-YYYY":
				str = tmp[0]+"-"+tmp[1]+"-"+tmp[2];
			break;
			
			case "DD-MM-YYYY":
				str = tmp[1]+"-"+tmp[0]+"-"+tmp[2];
			break;
		}
	}	
	return str;
}
function HDownloads_show_now()
{
	var datepicker_id = "#apps_httpdownloadsDatepicker_text";
	var hour_id = "#f_hour";
	var min_id = "#f_min";
	
    wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: '/cgi-bin/download_mgr.cgi',
		data:{cmd:'cgi_downloads_now'},	
		dataType:"xml",
		success: function(xml){				
				var my_date = HDownloads_date_format_show($(xml).find('date').text());
				$(datepicker_id).attr("value",my_date);
				
				var my_hour = $(xml).find('hour').text();
				$(hour_id).html(HDownloads_hour_show(parseInt(my_hour, 10)));
				$(hour_id).attr('rel',my_hour);
				
				var my_mins = $(xml).find('mins').text();
				$(min_id).html(my_mins);
				$(min_id).attr('rel',my_mins);
		}
	});	
}
function HDownloads_active_period(str)
{	
	var datepicker_id = "#apps_httpdownloadsDatepicker_text";
	var hour_sel_id = "#apps_httpdownloadsTimeHour_select";
	var hour_val_id = "#f_hour";
	var min_sel_id = "#apps_httpdownloadsTimeMins_select";
	var min_val_id = "#f_min";
	
	switch(str)
	{
		case "day":	//every day
			$("#tr_period_but").show();
			$("#tr_period_detail").show();
			if(!$("#apps_httpdownloadsPeriodDay_button").hasClass('buttonSel')) $("#apps_httpdownloadsPeriodDay_button").addClass('buttonSel');
			if($("#apps_httpdownloadsPeriodWeek_button").hasClass('buttonSel')) $("#apps_httpdownloadsPeriodWeek_button").removeClass('buttonSel');
			if($("#apps_httpdownloadsPeriodMonth_button").hasClass('buttonSel')) $("#apps_httpdownloadsPeriodMonth_button").removeClass('buttonSel');
			
			if (HTTP_Modify[15] == '')
				HTTP_Downloads[9] = "day";
			else
				HTTP_Modify[9] = "day";
			
			$(datepicker_id).attr("value","");
			$(hour_val_id).attr("rel","00");
			$(hour_val_id).html("00");
			$(min_val_id).attr("rel","00");
			$(min_val_id).html("00");
			
			if (!$(datepicker_id).hasClass("gray_out")) $(datepicker_id).addClass("gray_out");
			if (!$(hour_sel_id).hasClass("gray_out")) $(hour_sel_id).addClass("gray_out");
			if (!$(min_sel_id).hasClass("gray_out")) $(min_sel_id).addClass("gray_out");
			
			$("#HDownloads_tr_when_date").hide();
			$("#HDownloads_tr_when_time").hide();
			$("#DIV_Period_Hour").show();
			$("#DIV_Period_MIN").show();
			$("#DIV_Period_Month").hide();
			$("#DIV_Period_Week").hide();
		break;
		
		case "week":	//every week
			$("#tr_period_but").show();
			$("#tr_period_detail").show();
			if($("#apps_httpdownloadsPeriodDay_button").hasClass('buttonSel')) $("#apps_httpdownloadsPeriodDay_button").removeClass('buttonSel');
			if(!$("#apps_httpdownloadsPeriodWeek_button").hasClass('buttonSel')) $("#apps_httpdownloadsPeriodWeek_button").addClass('buttonSel');
			if($("#apps_httpdownloadsPeriodMonth_button").hasClass('buttonSel')) $("#apps_httpdownloadsPeriodMonth_button").removeClass('buttonSel');
			
			if (HTTP_Modify[15] == '')
				HTTP_Downloads[9] = "week";
			else
				HTTP_Modify[9] = "week";
			
			$(datepicker_id).attr("value","");
			$(hour_val_id).attr("rel","00");
			$(hour_val_id).html("00");
			$(min_val_id).attr("rel","00");
			$(min_val_id).html("00");
			
			if (!$(datepicker_id).hasClass("gray_out")) $(datepicker_id).addClass("gray_out");
			if (!$(hour_sel_id).hasClass("gray_out")) $(hour_sel_id).addClass("gray_out");
			if (!$(min_sel_id).hasClass("gray_out")) $(min_sel_id).addClass("gray_out");
			
			$("#HDownloads_tr_when_date").hide();
			$("#HDownloads_tr_when_time").hide();
			$("#DIV_Period_Hour").show();
			$("#DIV_Period_MIN").show();
			$("#DIV_Period_Month").hide();
			$("#DIV_Period_Week").show();
		break;
		
		case "month":	//every month
			$("#tr_period_but").show();
			$("#tr_period_detail").show();
			if($("#apps_httpdownloadsPeriodDay_button").hasClass('buttonSel')) $("#apps_httpdownloadsPeriodDay_button").removeClass('buttonSel');
			if($("#apps_httpdownloadsPeriodWeek_button").hasClass('buttonSel')) $("#apps_httpdownloadsPeriodWeek_button").removeClass('buttonSel');
			if(!$("#apps_httpdownloadsPeriodMonth_button").hasClass('buttonSel')) $("#apps_httpdownloadsPeriodMonth_button").addClass('buttonSel');
			
			if (HTTP_Modify[15] == '')
				HTTP_Downloads[9] = "month";
			else
				HTTP_Modify[9] = "month";
			
			$(datepicker_id).attr("value","");
			$(hour_val_id).attr("rel","00");
			$(hour_val_id).html("00");
			$(min_val_id).attr("rel","00");
			$(min_val_id).html("00");
			
			if (!$(datepicker_id).hasClass("gray_out")) $(datepicker_id).addClass("gray_out");
			if (!$(hour_sel_id).hasClass("gray_out")) $(hour_sel_id).addClass("gray_out");
			if (!$(min_sel_id).hasClass("gray_out")) $(min_sel_id).addClass("gray_out");
			
			$("#HDownloads_tr_when_date").hide();
			$("#HDownloads_tr_when_time").hide();
			$("#DIV_Period_Hour").show();
			$("#DIV_Period_MIN").show();
			$("#DIV_Period_Month").show();
			$("#DIV_Period_Week").hide();
		break;
		
		default:	//None
			$("#tr_period_but").hide();
			$("#tr_period_detail").hide();
			
			if (typeof HTTP_Modify[15] == 'undefined')
				HTTP_Downloads[9] = "none";
			else
				HTTP_Modify[9] = "none";
			
			if ($(datepicker_id).val() == "")	HDownloads_show_now();
		
			if ($(datepicker_id).hasClass("gray_out")) $(datepicker_id).removeClass("gray_out");
			if ($(hour_sel_id).hasClass("gray_out")) $(hour_sel_id).removeClass("gray_out");
			if ($(min_sel_id).hasClass("gray_out")) $(min_sel_id).removeClass("gray_out");
			
			$("#HDownloads_tr_when_date").show();
			$("#HDownloads_tr_when_time").show();
			
			$("#DIV_Period_Hour").hide();
			$("#DIV_Period_MIN").hide();
			$("#DIV_Period_Month").hide();
			$("#DIV_Period_Week").hide();
		break;
	}
}
function HDownloads_format_user(str)
{
	if ( str == "" )
    {
        jAlert( _T('_user','msg5'), "warning");	//Text:Please enter a user name.
		return 0;
    }
    
    if(	str.length > 15)
    {
       jAlert( _T('_download','msg1'), "warning");	//Text:The user name length cannot exceed 15 characters. Please try again.
      
	   return 0;
    }
        
	return 1;
}
function HDownloads_format_pwd(str)
{
	if( str == "")
	{
		jAlert( _T('_mail','msg11'), "warning");	//Text:Please enter a password.
		return 0;
	}
	
	if(	str.length > 128)
    {
       jAlert( _T('_download','msg8'), "warning");	//Text:The password length cannot exceed 128 characters. Please try again.
      
	   return 0;
    }
	
	return 1;
}
function HDownloads_format_URL(str)
{
	if (str == "" )
	{
		jAlert( _T('_p2p','msg7'), "warning");	//Text:Please enter a URL.
		return 0;
	}
	
	if (str.length > 1024)
	{
		jAlert( _T('_download','msg2'), "warning");	//Text:URL length should be 1-1024!
		return 0;
	}
	
	/*check the URL's format correct or not 
			  http://aaa/		   (x)
			  http://aaa		   (x)
			  http://aaa/aaa	   (o)			  
			  http://aaa/aaa/      (x)  ->(o)
	*/
	
	if (str.indexOf("http://") != -1)
	{		
			if (str.charAt(0)!="h")
			{
				jAlert( _T('_download','msg5'), "warning");	//Text:The URL format is not correct. Please try again.
				return 0 ;
			}
			
			var url_path=str.substring(7,str.length);
			var aa=url_path.indexOf("/",0);
			var bb=url_path.lastIndexOf("/",url_path.length);

			var tmp=url_path.split("/");
			
			if (aa==-1)
			{
    				jAlert( _T('_download','msg5'), "warning");	//Text:The URL format is not correct. Please try again.
    				return 0;
			}

			if ((tmp.length-1)==1 && (bb==url_path.length-1))
			{
					jAlert( _T('_download','msg5'), "warning");	//Text:The URL format is not correct. Please try again.
					return 0;
			}				
	}
	else
	{	
		jAlert( _T('_http_downloads','msg1'), "warning");	//Text:The URL format is not correct, the correct format is :  http://192.168.0.32/test.txt. Please try again.
		return 0;
	}	
	
	return 1;
}

function HDownloads_format_saveto(str)
{
	if (str == "")
	{			
		jAlert( _T('_download','msg3'), "warning");	//Text:Please enter a Save To.
		return 0;
	}
	
	if (str.length > 226)
	{
		jAlert( _T('_download','msg4'), "warning");	//Text:Save to length should be 1-226!
		return 0;		
	}
	return 1;
}
function HDownloads_format_rename(str_dir,str_rename)
{	
	var total_len = str_dir.length;
	var f_rename = str_rename;
		
		if( (total_len + f_rename.length) > 226)
		{
			var msg = _T('_backup','msg2') + ( 226 - parseInt(total_len))+"."; 	//Text:File name length should be 1-
			jAlert(msg,"warning");
			return 0;
		}
						
		var flag = Chk_Folder_Name(f_rename);
		switch (flag)
		{
			case 1:
				jAlert( _T('_backup','msg4'), "warning");	//Text: The folder name must not include the following characters: \\ / : * ? " < > | 
				return 0;
			break;
			
			case 2:
				jAlert( _T('_backup','msg5'), "warning");	//Text:Not a valid folder name.
				return 0;
			break;
			
			case 3:
				jAlert(_T('_network_access', 'msg4'), _T('_common', 'error'));
				return 0;
			break;
		}
	
	return 1;
}
function HDownloads_at_and_period()
{
	var at_tmp;
	var date_tmp;
	
	var my_period = (HTTP_Modify[15] == '')?HTTP_Downloads[9]:HTTP_Modify[9];

	if( my_period == "none")//None
	{
		date_tmp = HDownloads_date_format_show($("#apps_httpdownloadsDatepicker_text").val());
		
		var hour_tmp = parseInt($('#f_hour').attr('rel'),10);
		hour_tmp = (hour_tmp < 10)? "0"+hour_tmp:hour_tmp;
		
		var mins_tmp = parseInt($('#f_min').attr('rel'),10);
		mins_tmp = (mins_tmp < 10)? "0"+mins_tmp:mins_tmp;
		
		at_tmp	 =	date_tmp.slice(6,10)+date_tmp.slice(0,2)+date_tmp.slice(3,5)+hour_tmp+mins_tmp;	
	}
	else	//Daily,weekly,monthly
	{
		var hour_tmp = parseInt($('#f_period_hour').attr('rel'),10);
		hour_tmp = (hour_tmp < 10)? "0"+hour_tmp:hour_tmp;
		
		var mins_tmp = parseInt($('#f_period_min').attr('rel'),10);
		mins_tmp = (mins_tmp < 10)? "0"+mins_tmp:mins_tmp;
		
		at_tmp = "00000000"+hour_tmp+mins_tmp;
	}
	
	return at_tmp;	
}
function HDownloads_create()
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
	
	if ( timeoutId != 0 ) clearTimeout(timeoutId);
	
	wd_ajax({
				url:"/cgi-bin/download_mgr.cgi",
				type:"POST",
		        data:{cmd:"Downloads_Schedule_Add",
		        	f_downloadtype:HTTP_Downloads[0],
		        	f_login_method:HTTP_Downloads[1],
		        	f_login_user:HTTP_Downloads[2],
		        	f_user:HTTP_Downloads[3],
		        	f_pwd:HTTP_Downloads[4],
		        	f_URL:HTTP_Downloads[6],
		        	f_dir:HTTP_Downloads[7],
		        	f_period:HTTP_Downloads[9],
		        	f_period_week:HTTP_Downloads[10],
		        	f_period_month:HTTP_Downloads[11],
		        	f_at:HTTP_Downloads[8],
		        	f_rename:HTTP_Downloads[13],
		        	f_type:HTTP_Downloads[5],
		        	f_lang:HTTP_Downloads[14]
		        	},
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml)
				{
					jLoadingClose();
					go_sub_page('/web/addons/http_downloads.html', 'http_downloads');
					
				}
		 }); //end of ajax
}
function HDownloads_tooltip()
{
	$(".tip_backup_success").attr('title',_T('_backup','desc12'));
	$(".tip_backup_fail").attr('title',_T('_backup','desc13'));
	$(".tip_backup_downloading").attr('title',_T('_backup','desc14'));
	$(".tip_backup_stop").attr('title',_T('_backup','desc16'));
	$(".tip_backup_wait").attr('title',_T('_backup','desc15'));
	
	init_tooltip('.tip');
}
function http_download_list()
{
   $("#downloads_status").flexigrid({	
    		url:'/cgi-bin/download_mgr.cgi',		
    		dataType: 'xml',
    		cmd:'cgi_downloads_http_list',	
    		colModel : [
    		/* 0 */{display: "--", name : 'f_url', width : 150, align: 'left'},					//Text:Download Path
    		/* 1 */{display: "--", name : 'f_dest', width : 150,  align: 'left'},					//Text:Save Path
    		/* 2 */{display: "--", name : 'f_progressbar', width :50,  align: 'center'},			//Text:Progress
    		/* 3 */{display: "--", name : 'f_speed', width : 80, align: 'left'},					//Text:Speed
    		/* 4 */{display: "--", name : 'f_time', width : 100, align: 'center'},					//Text:Time
    		/* 5 */{display: "--", name : 'f_idx', width : 0, align: 'center',hide: true},			//Text:Time
    		/* 6 */{display: "--", name : 'but_start_stop', width : 55, align: 'center'},	
    			],
    		usepager: true,
    		useRp:true,
    		page: 1, 
    		rp: 10,
    		showTableToggleBtn: false,
    		width:650,
    		height:'auto',
    		errormsg: _T('_common','connection_error'),		//Text:Connection Error
    		nomsg: _T('_common','no_items'),				//Text:No items
    		singleSelect:true,
    		f_field:getCookie("username"),
    		resizable: false,
    		rpOptions: [10],
    		onSuccess:function(){ 
    			
    			$('#downloads_status > tbody > tr td:nth-child(1) div').each(function(n){
    		   		$(this).addClass('tip').attr('title',$(this).text());
    			});
    			
    			$('#downloads_status > tbody > tr td:nth-child(2) div').each(function(n){
    		   		$(this).addClass('tip').attr('title',$(this).text());
    			});	
    				
            	$('#downloads_status > tbody > tr td:nth-child(3) div img').each(function(n){
    				var my_img_fname = $(this).attr('src').split("/");
    				var my_img_name = my_img_fname[(my_img_fname.length)-1].split(".");
    				if (my_img_name.length == 2)
    				{
    					switch(my_img_name[0])
    					{
    						case "status_ok":
    							$(this).parent().css('padding','10px 0px 0px 0px').addClass('tip').addClass('tip_backup_success');
    						break;
    						
    						case "status_fail":
    							$(this).parent().css('padding','10px 0px 0px 0px').addClass('tip').addClass('tip_backup_fail');
    						break;
    						
    						case "status_download":
    							$(this).parent().css('padding','10px 0px 0px 0px').addClass('tip').addClass('tip_backup_downloading');
    						break;
    						
    						case "icon_stop":
    							$(this).parent().css('padding','10px 0px 0px 0px').addClass('tip').addClass('tip_backup_stop');
    						break;
    						
    						case "status_queue":
    							$(this).parent().css('padding','10px 0px 0px 0px').addClass('tip').addClass('tip_backup_wait');
    						break;
    					}
    				}
    			});	 
            	    
            	$('#downloads_status > tbody > tr td:nth-child(4) div').each(function(n){
            		if ($.trim($(this).text()).length != 0)
    		   		$(this).addClass('tip').attr('title',$(this).text());
    			});
    			
            	$('#downloads_status > tbody > tr td:nth-child(5) div').each(function(n){
    			
					$(this).addClass('tip').attr('title', $(this).text()).html($(this).text());
    			});
    			
    			HDownloads_tooltip();
    			
    		 },//end of onSuccess..
    		preProcess: function(r) {
				
				if (parseInt($(r).find('total').text(), 10) == 0)
				{
					$("#downloads_status_button").hide();
					if (timeoutId != 0) clearTimeout(timeoutId);
				}		
				else
				{
					$("#downloads_status_button").show();
					timeoutId = setTimeout('$("#downloads_status").flexReload()', 5000);
				}		

				(parseInt($(r).find('total').text(), 10) == 10)? $("#tr_create_button").hide():$("#tr_create_button").show();
				
				$(r).find('row').each(function(idx){
					
					//Date
					var my_date = $(this).find('cell').eq(4).text(); //MM/DD/YY hh:mm
					var dt = new Date('20'+my_date.slice(6,8), (parseInt(my_date.slice(0,2),10)-1), my_date.slice(3,5), my_date.slice(9,11), my_date.slice(12,15)).valueOf();
					$(this).find('cell').eq(4).text(multi_lang_format_time(dt));
					
				})	
				
				return r;
    		}
    });
}
function downloads_stop(idx)
{
  	if ( timeoutId != 0 ) clearTimeout(timeoutId);
	
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
	
	wd_ajax({
			url: "/cgi-bin/download_mgr.cgi",
			type: "POST",
			data:{
				cmd:"Downloads_Schedule_Stop",
				f_idx:idx,
				f_field:getCookie("username")},
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml)
			{
			    var my_state = $(xml).find('result').text();
			    
			    if (parseInt(my_state) == 0)
			    {
			    	$("#downloads_status").flexReload();
                } 
                
                jLoadingClose(); 
			}
	});
}

function downloads_start(idx)
{
	if ( timeoutId != 0 ) clearTimeout(timeoutId);
	
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
	
    wd_ajax({
			url: "/cgi-bin/download_mgr.cgi",
			type: "POST",
			data:{cmd:"Downloads_Schedule_Start",
				f_idx:idx,
				f_field:getCookie("username")},
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml)
			{
			 	var my_state = $(xml).find('result').text();
			    if (parseInt(my_state) == 0)
			    {
			      $("#downloads_status").flexReload();
                }   
                
                jLoadingClose();
			}
	});
}

function downloads_del(idx)
{
	jConfirm( 'M', _T('_http_downloads','msg2'), _T('_http_downloads','title1'),"HDownloads",function(r){	  
        if(r)
    	{
    		if ( timeoutId != 0 ) clearTimeout(timeoutId);
    		jLoading(_T('_common','set'), 'loading' ,'s',"");
        	wd_ajax({
        			url: "/cgi-bin/download_mgr.cgi",
        			type: "POST",
        			data:{cmd:"Downloads_Schedule_Del",f_idx:idx,f_field:getCookie("username")},
        			cache:false,
        			dataType:"xml",
        			success: function(xml)
        			{
        				jLoadingClose();
						$("#downloads_status").flexReload();
        			}
        	});
        }
    });
}

function downloads_modify(idx)
{
	HDownload_get_detail_info(idx);
	
	$("#tr_create_button").hide();
	$("#tr_modify_button").show();
	
	/*
	HTTP_Modify = new Array(
	"0",					//HTTP_Modify[0]:Category,ex:0->HTTP Downloads, 1->FTP Downloads
	"1",					//HTTP_Modify[1]:Login Method,ex:0->Account,1->Anonymous
	getCookie("username"),	//HTTP_Modify[2]:Login User
	"",						//HTTP_Modify[3]:User
	"",						//HTTP_Modify[4]:PWD
	"0",					//HTTP_Modify[5]:Type, 0->File,1->Folder
	"",						//HTTP_Modify[6]:URL
	"",						//HTTP_Modify[7]:Save To
	"",						//HTTP_Modify[8]:Date
	"none",					//HTTP_Modify[9]:f_period:$("#f_period").attr('rel'),
	"",						//HTTP_Modify[10]:f_period_week:$("#f_period_week").attr('rel'),
	"",						//HTTP_Modify[11]:f_period_month:$("#f_period_month").attr('rel'),
	"",						//HTTP_Modify[12]:Incremental Backup
	"",						//HTTP_Modify[13]:Rename
	"",						//HTTP_Modify[14]:CodePage
	""						//HTTP_Modify[15]:idx
	)
	*/
	
	//Login Method
	if (HTTP_Modify[1] == 0)	//Account
	{
		if(!$("#apps_httpdownloadsLoginMethodAccount_button").hasClass('buttonSel'))	$("#apps_httpdownloadsLoginMethodAccount_button").addClass('buttonSel');
		if($("#apps_httpdownloadsLoginMethodAnonymous_button").hasClass('buttonSel'))	$("#apps_httpdownloadsLoginMethodAnonymous_button").removeClass('buttonSel');
		
		$("#apps_httpdownloadsUser_text").val(HTTP_Modify[3]);
		$("#apps_httpdownloadsPWD_password").val(HTTP_Modify[4]);
		
		$("#tr_user_name").show();
		$("#tr_pwd").show();
	}
	else	//Anonymous
	{
		if($("#apps_httpdownloadsLoginMethodAccount_button").hasClass('buttonSel'))	$("#apps_httpdownloadsLoginMethodAccount_button").removeClass('buttonSel');
		if(!$("#apps_httpdownloadsLoginMethodAnonymous_button").hasClass('buttonSel'))	$("#apps_httpdownloadsLoginMethodAnonymous_button").addClass('buttonSel');
		
		$("#tr_user_name").hide();
		$("#tr_pwd").hide();
	}	
	
	$("#apps_httpdownloadsURL_text").val(HTTP_Modify[6]);
	$("#apps_httpdownloadsSaveTo_text").val(HTTP_Modify[7]);
	$("#apps_httpdownloadsRename_text").val(HTTP_Modify[13]);
	
	HDownloads_active_period(HTTP_Modify[9]);
	var at = HTTP_Modify[8];
	switch(HTTP_Modify[9])
	{
		case "day":
			setSwitch('#apps_httpdownloadsPeriod_switch', 1);
			$("#f_period").html(_T('_backup','desc8'));
			$("#f_period").attr('rel', 'day');
			
			var my_hour = HDownloads_hour_show(parseInt(at.slice(8,10),10))
			$("#f_period_hour").html(my_hour);
			$("#f_period_hour").attr('rel',at.slice(8,10));
			
			$("#f_period_min").html(at.slice(10,12));
			$("#f_period_min").attr('rel',at.slice(10,12));
		break;
		
		case "week":
			setSwitch('#apps_httpdownloadsPeriod_switch', 1);
			$("#f_period").html(_T('_backup','desc7'));
			$("#f_period").attr('rel', 'week');
			
			var my_hour = HDownloads_hour_show(parseInt(at.slice(8,10),10))
			$("#f_period_hour").html(my_hour);
			$("#f_period_hour").attr('rel',at.slice(8,10));
			
			$("#f_period_min").html(at.slice(10,12));
			$("#f_period_min").attr('rel',at.slice(10,12));
			
			var my_week = HTTP_Modify[10].toString()
					.replace(/0/g, _T('_p2p','sun'))
					.replace(/1/g, _T('_p2p','mon'))
					.replace(/2/g, _T('_p2p','tue'))
					.replace(/3/g, _T('_p2p','wed'))
					.replace(/4/g, _T('_p2p','thu'))
					.replace(/5/g, _T('_p2p','fri'))
					.replace(/6/g, _T('_p2p','sat')); 
					
			$("#f_period_week").html(my_week);
			//$("#f_period_week").attr('rel',at.slice(7,8));
			$("#f_period_week").attr('rel',HTTP_Modify[10]);
		break;
		
		case "month":
			setSwitch('#apps_httpdownloadsPeriod_switch', 1);
			$("#f_period").html(_T('_backup','desc6'));
			$("#f_period").attr('rel', 'month');
			
			var my_hour = HDownloads_hour_show(parseInt(at.slice(8,10),10))
			$("#f_period_hour").html(my_hour);
			$("#f_period_hour").attr('rel',at.slice(8,10));
			
			$("#f_period_min").html(at.slice(10,12));
			$("#f_period_min").attr('rel',at.slice(10,12));
			
			var tmp = HTTP_Modify[11].toString();
			var my_month = (parseInt(tmp,10) < 10) ? "0"+tmp:tmp;
			
			$("#f_period_month").html(my_month);
			$("#f_period_month").attr('rel',tmp);
		break;
		
		default://none
			setSwitch('#apps_httpdownloadsPeriod_switch', 0);
			$("#f_period").html(_T('_backup','none'));
			$("#f_period").attr('rel', 'none');
			
			var my_date = at.slice(4,6) + "/" + at.slice(6,8)+"/"+at.slice(0,4);
			$("#apps_httpdownloadsDatepicker_text").val(HDownloads_date_format_show(my_date));
			
			var my_time_hh = at.slice(8,10);
			var my_time_mm = at.slice(10,12);
			$("#f_hour").html(HDownloads_hour_show(parseInt(my_time_hh,10)));
			$("#f_hour").val('rel',my_time_hh);
			
			$("#f_min").html(my_time_mm);
			$("#f_min").val('rel',my_time_mm);
		break;
	}
}
function HDownloads_renew()
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
	
	wd_ajax({
				url:"/cgi-bin/download_mgr.cgi",
				type:"POST",
		        data:{cmd:"Downloads_Schedule_Renew",
		        	f_idx:HTTP_Modify[15],
		        	f_downloadtype:HTTP_Modify[0],
		        	f_login_method:HTTP_Modify[1],
		        	f_login_user:HTTP_Modify[2],
		        	f_user:HTTP_Modify[3],
		        	f_pwd:HTTP_Modify[4],
		        	f_URL:HTTP_Modify[6],
		        	f_dir:HTTP_Modify[7],
		        	f_period:HTTP_Modify[9],
		        	f_period_week:HTTP_Modify[10],
		        	f_period_month:HTTP_Modify[11],
		        	f_at:HTTP_Modify[8],
		        	f_rename:HTTP_Modify[13],
		        	f_type:HTTP_Modify[5],
		        	f_lang:HTTP_Modify[14]
		        	},
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml)
				{
					timeoutId = setTimeout(function(){
						$("#downloads_status").flexReload();
						page_init();
						jLoadingClose();
					}
					, 2000);
				}
		 }); //end of ajax
}
function HDownloads_open_date()
{		
	 $.datepicker._showDatepicker($('#apps_httpdownloadsDatepicker_text')[0]);
}