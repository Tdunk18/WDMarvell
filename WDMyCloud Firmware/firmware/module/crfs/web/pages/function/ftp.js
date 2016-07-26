var FTP_CREATE_INFO = new Array();
/*
FTP_CREATE_INFO[0] = $(xml).find('maxclientsnumber').text();	//maxclientsnumber
FTP_CREATE_INFO[1] = $(xml).find('maxidletime').text();			//maxidletime
FTP_CREATE_INFO[2] = $(xml).find('port').text();				//port
FTP_CREATE_INFO[3] = $(xml).find('flowcontrol').text();			//flowcontrol
FTP_CREATE_INFO[4] = $(xml).find('filesystemcharset').text();	//filesystemcharset
FTP_CREATE_INFO[5] = $(xml).find('clientcharset').text();		//clientcharset
FTP_CREATE_INFO[6] = $(xml).find('passiveportrange').text();	//passiveportrange
FTP_CREATE_INFO[7] = $(xml).find('exip').text();				//exip
FTP_CREATE_INFO[8] = $(xml).find('externalip').text();			//externalip
FTP_CREATE_INFO[9] = $(xml).find('state').text();				//state
FTP_CREATE_INFO[10] = $(xml).find('').text();					//tlsencryption
FTP_CREATE_INFO[11] = $(xml).find('').text();					//forcepasvmode
FTP_CREATE_INFO[12] = $(xml).find('').text();					//connect_per_ip
FTP_CREATE_INFO[13] = $(xml).find('fxpaccess').text();			//fxpaccess
FTP_CREATE_INFO[14] =  $(xml).find('port').text();				//current ftp port
FTP_CREATE_INFO[15] = Current P2P Port
FTP_CREATE_INFO[16] = SSH for SFTP use
*/

var FTPBlockIP_CREATE_INFO = new Array();
/*
FTPBlockIP_CREATE_INFO[0] = ip type: 0->IPV4; 1->IPV6,	
FTPBlockIP_CREATE_INFO[1] = ip,	
FTPBlockIP_CREATE_INFO[2] = f_permanent,
FTPBlockIP_CREATE_INFO[3] = f_release_day
*/
var _jScrollPane = "";
function ftp_init()
{
	FTP_CREATE_INFO.length = 0;
	
	wd_ajax({
		url: "/cgi-bin/app_mgr.cgi",
		type: "POST",
		async: false,
		cache: false,
		data:{cmd:'FTP_Server_Get_Config'},
		dataType:"xml",
			success: function(xml)
			{	
				FTP_CREATE_INFO[0] = $(xml).find('maxclientsnumber').text();	//maxclientsnumber
				FTP_CREATE_INFO[1] = $(xml).find('maxidletime').text();			//maxidletime
				FTP_CREATE_INFO[2] = $(xml).find('port').text();				//port
				FTP_CREATE_INFO[3] = $(xml).find('flowcontrol').text();			//flowcontrol
				FTP_CREATE_INFO[4] = $(xml).find('filesystemcharset').text();	//filesystemcharset
				FTP_CREATE_INFO[5] = $(xml).find('clientcharset').text();		//clientcharset
				FTP_CREATE_INFO[6] = $(xml).find('passiveportrange').text();	//passiveportrange
				FTP_CREATE_INFO[7] = $(xml).find('exip').text();				//exip
				FTP_CREATE_INFO[8] = $(xml).find('externalip').text();			//externalip
				FTP_CREATE_INFO[9] = $(xml).find('state').text();				//state
				FTP_CREATE_INFO[10] = $(xml).find('tlsencryption').text();		//tlsencryption, SFTP
				FTP_CREATE_INFO[11] = $(xml).find('forcepasvmode').text();		//forcepasvmode
				FTP_CREATE_INFO[12] = $(xml).find('connect_per_ip').text();		//connect_per_ip
				FTP_CREATE_INFO[13] = $(xml).find('fxpaccess').text();			//fxpaccess
				FTP_CREATE_INFO[14] = $(xml).find('port').text();				//FTP current port
				FTP_CREATE_INFO[16] = $(xml).find('ssh').text();				//SSH for SFTP
			}
	});
}
function ftp_set_state_command(str)//enable or disable
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
	
	
	setTimeout(function(){
			wd_ajax({
			url: "/cgi-bin/app_mgr.cgi",
			type: "POST",
			data:{cmd:"FTP_Server_Enable",f_state:str},
			async: false,
			cache:false,
			dataType:"xml",
			success: function(xml)
			{  
				google_analytics_log('FTP_access_enabled', str);
			   var res = $(xml).find('result').text();
			   if (parseInt(res,10) == 1)
			   {
			   		(parseInt(str,10) == 1)? $("#settings_networkFTPAccessConfig_link").show():$("#settings_networkFTPAccessConfig_link").hide();
					ftp_init();
               }
               
               jLoadingClose();
			}
		});	//end of ajax...		
	}//end of settimeout function(){...
	, 300);
}
function ftp_set_state(str)
{
	if (str == 1)
	{
		jAlert(_T('_ftp','msg37'),  "note","",function(){
				ftp_set_state_command(str);
		});
	}
	else
	{
		ftp_set_state_command(str);
	}	
	
					
	
}
function ftp_active_passive(typ)
{
	if (parseInt(typ,10) == 0) //default
	{
		FTP_CREATE_INFO[6] = "55536:55663";
		
		if (!$("#settings_networkFTPAccessPMDefault_button").hasClass("sel")) $("#settings_networkFTPAccessPMDefault_button").addClass('sel');
		if ($("#settings_networkFTPAccessPMCustomize_button").hasClass("sel")) $("#settings_networkFTPAccessPMCustomize_button").removeClass("sel");
		$("#tr_FTPSet_Passive_Mode_Customize").hide();
		
		if (!$("#settings_networkFTPAccessPMStart_text").hasClass("gray_out")) $("#settings_networkFTPAccessPMStart_text").addClass("gray_out");
		if (!$("#settings_networkFTPAccessPMEnd_text").hasClass("gray_out")) $("#settings_networkFTPAccessPMEnd_text").addClass("gray_out");
	}
	else
	{
		FTP_CREATE_INFO[6] = "";
		if ($("#settings_networkFTPAccessPMDefault_button").hasClass("sel")) $("#settings_networkFTPAccessPMDefault_button").removeClass('sel');
		if (!$("#settings_networkFTPAccessPMCustomize_button").hasClass("sel")) $("#settings_networkFTPAccessPMCustomize_button").addClass("sel");
		$("#tr_FTPSet_Passive_Mode_Customize").show();
		
		if ($("#settings_networkFTPAccessPMStart_text").hasClass("gray_out")) $("#settings_networkFTPAccessPMStart_text").removeClass("gray_out");
		if ($("#settings_networkFTPAccessPMEnd_text").hasClass("gray_out")) $("#settings_networkFTPAccessPMEnd_text").removeClass("gray_out");
	}	
}
function ftp_codepage(str)
{	
	if (str == "0")
	{
		$("#f_default_lang").attr('none');
		$("#f_default_lang").html(_T('_common','add'));
	}
	else
		$("#settings_networkFTPAccessClientChar_text").val(str);
}
function ftp_format_idle(str)
{
    //idle time
	if ( str == "")
	{
		jAlert( _T('_ftp','msg13'),  "warning");	//Text:Please enter an idle time.
		return 0;
	}
	
	if (isNaN(str))
	{
		jAlert( _T('_ftp','msg14'),  "warning");	//Text:The idle time must be between 1~10 minutes.
		return 0;
	}
	
	if (str < 1 || str >10)
	{
		jAlert( _T('_ftp','msg14'),  "warning");	//The idle time must be between 1~10 minutes.
		return 0;
	}

	if (str.indexOf(" ") != -1) 
 	{
 		jAlert( _T('_ftp','msg15'),  "warning");	//Text:Idle time must not contain spaces.
 		return 0;
 	}
 	    
	return 1;
}
function ftp_check_p2p_port(ftp_port)
{	
	var flag=1;
	
	wd_ajax({
    			url: "/cgi-bin/p2p.cgi",
    			type: "POST",
    			data: {cmd:'p2p_get_port'},
    			async:false,
    			cache:false,
    //			error:function(xhr, ajaxOptions, thrownError){},
    //			timeout:1000, 
    			dataType:"xml",
    			success: function(xml){
    			      
    			      if ( parseInt($(xml).find('res').text()) == 1)   
    			      {
    			      	var p2p_port = parseInt($(xml).find('port_number').text());
    			      	if ( ftp_port == p2p_port) flag=0;
    			      	
    			      	FTP_CREATE_INFO[15] = parseInt($(xml).find('port_number').text());
    			   	  }
    			         
    			}//end of success
     });
	
	return flag;
}
function ftp_format_port(port)
{
	//port
	if (port == "")
	{
		jAlert( _T('_mail','msg7'),  "warning");	//Text:Please enter a port.
		return 0;
	}
	
	if (port.indexOf(" ") != -1) 
 	{
 		jAlert( _T('_mail','msg8'),  "warning");	//Text:Port can not contain spaces.
 		return 0;
 	}
	
 	if (isNaN(port))
 	{
		jAlert( _T('_ftp','msg6'),  "warning");	//Text:Port must be a number.
 		return 0;
 	}	

	if (port <= 0 || port >65535)
	{
		jAlert( _T('_ftp','msg7'),  "warning");	//Text:Please enter a port.
		return 0;
	}
	
	if( 1024 >= parseInt(port,10) && 21 != parseInt(port) && 990 != parseInt(port))
	{
		jAlert( _T('_mail','msg9'), "warning");	//Text:Invalid port number.
		return 0;	
	}
	
	if( 67 == parseInt(port,10) || 68 == parseInt(port,10))
	{
		jAlert( _T('_ftp','msg5'), "warning");	//Text: The port 67,68 has used for DHCP Server.
		return 0;
	}
	
	if( 3689 == parseInt(port) )
	{
		jAlert( _T('_ftp','msg3'),  "warning");	//Text:The port 3689 has used for iTunes Server.
		return 0;
	}
	
	if( 50000 <= parseInt(port,10) && 65500 >= parseInt(port,10))
	{
		jAlert( _T('_ftp','msg4'), "warning");	//Text:The port 50000-65500 has used for UPnP Server.
		return 0;
	}
	
	if( 8080 == parseInt(port,10) )
	{
		jAlert( _T('_ftp','msg1'), "warning");	//Text:The port 80 has used for HTTP Server.
		return 0;
	}
	
	if ( ftp_check_p2p_port(port) == 0)
	{
		var re=/xxx/;
		var tmp = _T('_ftp','msg23');	//Text:The port xxx has used for P2P Server.
		var msg = tmp.replace(re, port);
		
		jAlert(msg, "warning");
		return 0;
	}
	
	if( 4711 == parseInt(port,10))
	{
		jAlert( _T('_ftp','msg28'), "warning");	//Text: The port 4711 has used for aMule.
		return 0;
	}
	
	if( 8000 == parseInt(port,10))
	{
		jAlert( _T('_ftp','msg32'), "warning");	//Text: The port 8000 has used for IceStation.
		return 0;
	}
	
	if( 9000 == parseInt(port,10))
	{
		jAlert( _T('_ftp','msg29'), "warning");	//Text: The port 9000 has used for Squeeze Center.
		return 0;
	}
	
	return 1;
}
function ftp_format_flowcontrol(flow)
{
	if ( flow == "" )	
	{
		jAlert( _T('_ftp','msg9'), "warning");	//Text:Please enter a Flow.
		return 0;
	}
	
	if (flow.indexOf(" ") != -1) 
	{
		jAlert( _T('_ftp','msg10'), "warning");	//Text:Flow can not contain space.
		return 0;
	}
	
	if( flow <= 0 || parseInt(flow)-flow != 0 )	
	{
		jAlert( _T('_ftp','msg8'), "warning");	//Text:Not a valid flow control.
		return 0;
	}	
	
	if (isNaN(flow))	
	{
		jAlert( _T('_ftp','msg11'), "warning");	//Text:Flow control must be a number.
		return 0;
	}	
	
	if(flow>16384)	
	{
		jAlert( _T('_ftp','msg12'), "warning");	//Text:Flow control cannot exceed 16384.
		return 0;
	}	
			 		
	return 1;
}
function ftp_format_passiveport(start_port, end_port)
{
	
	if( ((((parseInt(end_port) - parseInt(start_port)) + 1) % 2) == 1) || (start_port == end_port))
	{
			jAlert( _T('_ftp','msg24'), "warning");	//Text:Please use a port range that is of an even number.
			return 0;
	}
	
	if(start_port>=end_port)
	{
		jAlert( _T('_mail','msg9'), "warning");	//Text:Invalid port number.
  		return 0;
	}
    	
	if(isNaN(start_port) || start_port<=0 || parseInt(start_port)-start_port!=0)
	{
		jAlert( _T('_mail','msg9'), "warning");	//Text:Invalid port number.
  		return 0;
	}
	
	if(isNaN(end_port) || end_port<=0 || parseInt(end_port)-end_port!=0)
	{
		jAlert( _T('_mail','msg9'), "warning");	//Text:Invalid port number.
  		return 0;
	}
	
	if(start_port<=1024 ||start_port>65535 || end_port>65535)
	{
		jAlert( _T('_mail','msg9'), "warning");	//Text:Invalid port number.
  		return 0;
	}
	
	if(start_port <= 80 && 80 <= end_port || start_port <= 80 && 80 <= end_port) 
	{
		jAlert( _T('_ftp','msg1'), "warning");	//Text: The port 80 has used for HTTP Server.
  		return 0;
	}
	
	//if(start <= 25 && 25 <= end)
	if(start_port <= 25 && 25 <= end_port || start_port <= 25 && 25 <= end_port) 
	{
		jAlert( _T('_ftp','msg2'), "warning");	//Text: The port 25 has used for Mail Server.
  		return 0;
	}
	
    if(start_port <= 3689 && 3689 <= end_port || start_port <= 3689 && 3689 <= end_port) 
	{
    	jAlert( _T('_ftp','msg20'), "warning");	//Text:The port 3689 has used for iTunes Server.
  		return 0;
	}
	
	if(start_port <= 67 && 67 <= end_port || start_port <= 68 && 68 <= end_port) 
	{
		jAlert( _T('_ftp','msg5'), "warning");	//Text:The port 67,68 has used for DHCP Server.
    	return 0;
	}
	
	if(
		start_port <= parseInt(FTP_CREATE_INFO[15],10) && parseInt(FTP_CREATE_INFO[15],10) <= end_port || 
		start_port <= parseInt(FTP_CREATE_INFO[15],10) && parseInt(FTP_CREATE_INFO[15],10) <= end_port) 
	{
		var re=/xxx/;
		var tmp= _T('_ftp','msg23');	//Text : The port xxx has used for P2P Server.
		var msg = tmp.replace(re,FTP_CREATE_INFO[15]);
		
		jAlert(msg, "warning");	
		return 0;
	}
	
	if( start_port <= parseInt(FTP_CREATE_INFO[14],10) && parseInt(FTP_CREATE_INFO[14],10) <= end_port  )
	{
		jAlert( _T('_mail','msg9'), "warning");	//Text:Invalid port number.
		return 0;
	}
	
	if(start_port <= 4711 && 4711 == end_port || start_port <= 4711 && 4711 <= end_port) 
	{
		jAlert( _T('_ftp','msg28'), "warning");	//Text: The port 4711 has used for aMule.
    	return 0;
	}
	
	if(start_port <= 8000 && 8000 == end_port || start_port <= 8000 && 8000 <= end_port) 
	{
		jAlert( _T('_ftp','msg32'), "warning");	//Text: The port 8000 has used for IceStation.
    	return 0;
	}
	
	if(start_port <= 9000 && 9000 == end_port || start_port <= 9000 && 9000 <= end_port) 
	{
		jAlert( _T('_ftp','msg29'), "warning");	//Text: The port 9000 has used for Squeeze Center.
    	return 0;
	}
	
	return 1;
}
function ftp_format_clientlang(str)
{
	if ( str == "" )
	{
			jAlert( _T('_ftp','msg25'), "warning");	//Text:Please enter a Client Language.
			return 0;
	}
	
	if ( str.length > 31 )
	{
			jAlert( _T('_ftp','msg26'), "warning");	//Text:The "Client Language" length cannot exceed 32 characters. Please try again.
			return 0;
	}
	
	return 1;
}
function ftp_format_extip(ext_ip)
{
	//check ip addr
	if(ext_ip =="")
	{
		jAlert( _T('_ftp','msg21'), "warning");	//Text:Not a valid external IP address.
		return 0;
	}
	if ( validateKey( ext_ip ) == 0 )
	{
		jAlert( _T('_ip','msg3'), "warning");	//Text:Only numbers can be used as IP address values.
		return 0;
	}
	if ( !checkDigitRange(ext_ip, 1, 1, 223) )
	{																															   
		jAlert( _T('_ip','msg4'), "warning");	//Text:Invalid IP address. The first set of numbers must range between 1 and 223.
		return 0;
	}
	if ( !checkDigitRange(ext_ip, 2, 0, 255) )
	{
		jAlert( _T('_ip','msg5'), "warning");//Text:Invalid IP address. The second set of numbers must range between 0 and 255
		return 0;
	}
	if ( !checkDigitRange(ext_ip, 3, 0, 255) )
	{
		jAlert( _T('_ip','msg6'), "warning");	//Text:Invalid IP address. The third set of numbers must range between 0 and 255.
		return 0;
	}
	if ( !checkDigitRange(ext_ip, 4, 1, 254) )
	{
		jAlert( _T('_ip','msg7'), "warning");	//Text:Invalid IP address. The fourth set of numbers must range between 0 and 254.
		return 0;
	}
	
	return 1;
}
function ftp_flow_control(val)
{
	if (parseInt(val,10) == 1)
	{
		FTP_CREATE_INFO[3] = "0";
		
		if (!$("#settings_networkFTPAccessFlowControlUnlimited_button").hasClass('sel')) $("#settings_networkFTPAccessFlowControlUnlimited_button").addClass('sel');
		if ($("#settings_networkFTPAccessFlowControlCustomize_button").hasClass('sel')) $("#settings_networkFTPAccessFlowControlCustomize_button").removeClass('sel');
		$("#tr_FTPSet_Flow_Control_Customize").hide();
	}
	else
	{
		FTP_CREATE_INFO[3] = "";
		
		if ($("#settings_networkFTPAccessFlowControlUnlimited_button").hasClass('sel')) $("#settings_networkFTPAccessFlowControlUnlimited_button").removeClass('sel');
		if (!$("#settings_networkFTPAccessFlowControlCustomize_button").hasClass('sel')) $("#settings_networkFTPAccessFlowControlCustomize_button").addClass('sel');
		$("#tr_FTPSet_Flow_Control_Customize").show();
	}	
		
}
function ftp_set()
{
	wd_ajax({
					url:"/cgi-bin/app_mgr.cgi",
					type:"POST",
			        data:{cmd:"FTP_Server_Set_Config",
			        	f_maxuser:FTP_CREATE_INFO[0],
			        	f_idle_time:FTP_CREATE_INFO[1],
			        	f_port:FTP_CREATE_INFO[2],
			        	f_flow_value:FTP_CREATE_INFO[3],
			        	f_client_char:FTP_CREATE_INFO[5],
			        	f_tls_status:FTP_CREATE_INFO[10],
			        	f_passive_port:FTP_CREATE_INFO[6],
			        	f_forcepasvmod:FTP_CREATE_INFO[11],
			        	f_external_ip:FTP_CREATE_INFO[8],
			        	f_connect_per_ip:FTP_CREATE_INFO[12],
			        	f_fxp:FTP_CREATE_INFO[13]
			        	},
//					async:false,
					cache:false,
					dataType:"xml",
					success: function(xml)
					{
						jLoadingClose();
						$("#FTPSetDiag").overlay().close();

						ftp_init();
						INTERNAL_DIADLOG_BUT_UNBIND("FTPSetDiag");
						INTERNAL_DIADLOG_DIV_HIDE("FTPSetDiag");
					}//end of success
			 }); //end of ajax
			 
}
/*
FTPBlockIP_CREATE_INFO:
FTPBlockIP_CREATE_INFO[0] = ip type: 0->IPV4; 1->IPV6,	
FTPBlockIP_CREATE_INFO[1] = ip,	
FTPBlockIP_CREATE_INFO[2] = block type:0->Temporary, 1->permanent,
FTPBlockIP_CREATE_INFO[3] = f_release_day
*/
function ftp_blockip_active_blocktype(typ)
{
	if (parseInt(typ,10) == 1) //permanent
	{
		$("#td_blockip_release_date").hide();
		FTPBlockIP_CREATE_INFO[2] = 1;
		
		$("#FTPBlockIP_Set_Type").html(_T('_ftp','permanent'));
		$("#FTPBlockIP_Set_Type").attr('rel',1);
		
	}
	else	//Temporary
	{
		$("#td_blockip_release_date").show();
		FTPBlockIP_CREATE_INFO[2] = 0;
		
		$("#FTPBlockIP_Set_Type").html(_T('_ftp','temporary'));
		$("#FTPBlockIP_Set_Type").attr('rel',0);
	}	
}
function ftp_blockip_del(my_ip)
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
	
	wd_ajax({
			url:"/cgi-bin/app_mgr.cgi",
			type:"POST",
			data:{cmd:"FTP_Server_BlockIP_Del",f_ip:my_ip},
			async:true,
			cache:false,
			dataType:"xml",
			success: function(xml)
			{
			   jLoadingClose();
				
			   var str = $(xml).find('result').text();
			    if (parseInt(str) == 1)
			    {
					 $("#FTPBlockIP_List").flexReload();
                }
			}
	}); 
}
function ftp_blockip_list()
{
	if ($("#FTPBlockIP_List").parent().parent().hasClass('flexigrid') == true)
	{
		$("#FTPBlockIP_List").flexReload();
	}
	else
	{	
		$("#FTPBlockIP_List").flexigrid({						
			url: '/cgi-bin/app_mgr.cgi',		
			dataType: 'xml',
			cmd: 'FTP_Server_BlockIP_List',	
			colModel : [
				{display: "IP", name : 'my_ip', width : '165', align: 'left'},	
				{display: "Permanent", name : 'my_permanent', width : '320', align: 'left'},
				{display: "Release Day", name : 'my_releasedate', width : '0', align: 'left',hide: true},
				{display: "Auto Ban", name : 'my_autoban', width : '160', align: 'left'},
				{display: "Del", name : 'my_del', width : '35', align: 'center'},
				],
			usepager: false,       //啟用分頁器
			useRp: true,
			rp: 10,               //預設的分頁大小(筆數)
			showTableToggleBtn: true,
			width: 'auto',//550,
			height: 'auto',
			errormsg: _T('_common','connection_error'),		//Text:Connection Error
			nomsg: _T('_common','no_items'),				//Text:No items
			singleSelect:true,
		    striped:true,   //資料列雙色交差
		    resizable: false,
		    onSuccess:function(){
		    
		    	if (_jScrollPane != "")
					{
						var api = _jScrollPane.data('jsp');
						api.destroy();
						_jScrollPane = "";
					}
					
					_jScrollPane = $('#Setting_networkFTPDiagBlockIPList_div').jScrollPane();
		    },
		    preProcess: function(r) {
		    	
		    	$(r).find('row').each(function(idx){
		    		//Block type:permanent or temporary
		    		var my_block_type = $(this).find('cell').eq(1).text();
		    		var my_desc = "";
		    		if (my_block_type == "Permanent")
		    		{
		    				my_desc = $(this).find('cell').eq(1).text()
		    						.replace(/Permanent/g,_T('_ftp','permanent'));
		    		}
		    		else	//Temporary, ex:MM/DD/YY hh:mm
		    		{
		    			var my_date = $(this).find('cell').eq(2).text();
		    			var dt = new Date(
								'20'+my_date.slice(6,8),				//Year
								(parseInt(my_date.slice(0,2),10)-1),	//Month
								my_date.slice(3,5),						//Day
								my_date.slice(9,11),					//Hours
								my_date.slice(12,15)).valueOf();		//minutes
						my_desc = multi_lang_format_time(dt);
		    		}	
		    		
					$(this).find('cell').eq(1).text(my_desc);	
					
					//Auto-Blocked
					 my_desc = $(this).find('cell').eq(3).text()
					 				.replace(/-/g,"")
		    						.replace(/Auto-Blocked/g,_T('_ftp','auto_blcoked'))
					$(this).find('cell').eq(3).text(my_desc);	
					
					//Delete icon
					var my_html = "<a class='del' onclick=\"ftp_blockip_del('"+$(this).find('cell').eq(0).text()+"');return false;\"></a>";
					$(this).find('cell').eq(4).text(my_html);
					
		    	});//end of each 
		    	
		    	return r;
	    	}	
		}); 
	}	
}
function ftpblockip_format_ipv4(my_ip)
{
	//check ip addr
	if ( validateKey( my_ip ) == 0 )
	{
		jAlert( _T('_ip','msg3'), "warning");	//Text:Only numbers can be used as IP address values.
		return 0;
	}
	if ( !checkDigitRange(my_ip, 1, 1, 223) )
	{		
		jAlert( _T('_ip','msg4'), "warning");	//Text:Invalid IP address. The first set of numbers must range between 1 and 223.
		return 0;
	}
	if ( !checkDigitRange(my_ip, 2, 0, 255) )
	{
		jAlert( _T('_ip','msg5'), "warning");//Text:Invalid IP address. The second set of numbers must range between 0 and 255
		return 0;
	}
	if ( !checkDigitRange(my_ip, 3, 0, 255) )
	{
		jAlert( _T('_ip','msg6'), "warning");	//Text:Invalid IP address. The third set of numbers must range between 0 and 255.
		return 0;
	}
	if ( !checkDigitRange(my_ip, 4, 1, 254) )
	{
		jAlert( _T('_ip','msg7'), "warning");	//Text:Invalid IP address. The fourth set of numbers must range between 0 and 254.
		return 0;
	}
	
	return 1;
}
function ftpblockip_format_ipv6(my_ip)
{
	//check ip addr
	if( chk_ipv6_format(my_ip,0) == -1 ) return 0;	//in ipv6Diag.js
	
	return 1;
}
function ftp_config_diag()
{	
	adjust_dialog_size("#FTPSetDiag", 800, 0);
	
	codepage_list('f_default_lang','ftp_codepage');
	
	switch(parseInt(MULTI_LANGUAGE, 10))
	{
		case 9:
			$("#FTP_Set1 .tdfield").css('width','300px');
		break;
		
		case 17:
			$("#FTP_Set1 .tdfield").css('width','200px');
		break;
		
		default:
			$("#FTP_Set1 .tdfield").css('width','170px');
		break;
	}
	
	//ftp_init();
	var FTPSetDiag = $("#FTPSetDiag").overlay({expose: '#000', api:true, closeOnClick:false, closeOnEsc:false, oneInstance:false});	
	
	INTERNAL_DIADLOG_DIV_HIDE('FTPSetDiag');
	$('#FTP_Set1').show();
	init_switch();
	init_select();
	hide_select();
	init_button();
	
	$("input:text").inputReset();
	$("input:checkbox").checkboxStyle();
	language();
	
	$("#FTPSet_f_maxuser").attr('rel',FTP_CREATE_INFO[0]).html(FTP_CREATE_INFO[0]);
	setSwitch('#settings_networkFTPAccessFXP_chkbox', parseInt(FTP_CREATE_INFO[13],10));
	
	//idle time
	$("#settings_networkFTPAccessIdleTime_text").val(FTP_CREATE_INFO[1]);
	
	$("#settings_networkFTPAccessPort_text").val(FTP_CREATE_INFO[2]);
	
	if (parseInt(FTP_CREATE_INFO[3],10) == 0)
	{
		if (!$("#settings_networkFTPAccessFlowControlUnlimited_button").hasClass('sel')) $("#settings_networkFTPAccessFlowControlUnlimited_button").addClass('sel');
		if ($("#settings_networkFTPAccessFlowControlCustomize_button").hasClass('sel')) $("#settings_networkFTPAccessFlowControlCustomize_button").removeClass('sel');
	}
	else
	{
		if ($("#settings_networkFTPAccessFlowControlUnlimited_button").hasClass('sel')) $("#settings_networkFTPAccessFlowControlUnlimited_button").removeClass('sel');
		if (!$("#settings_networkFTPAccessFlowControlCustomize_button").hasClass('sel')) $("#settings_networkFTPAccessFlowControlCustomize_button").addClass('sel');
		$("#tr_settings_networkFTPAccessFlowControlCustomize_button").show();
		$("#settings_networkFTPAccessFlowK_text").val( (parseInt(FTP_CREATE_INFO[3],10) / 10));
	}	
	
	if( (FTP_CREATE_INFO[6] =="55536:55663") || FTP_CREATE_INFO[6] == ":")
	{
		if (!$("#settings_networkFTPAccessPMDefault_button").hasClass("sel")) $("#settings_networkFTPAccessPMDefault_button").addClass('sel');
		if ($("#settings_networkFTPAccessPMCustomize_button").hasClass("sel")) $("#settings_networkFTPAccessPMCustomize_button").removeClass("sel");
		$("#tr_FTPSet_Passive_Mode_Customize").hide();
		if (!$("#settings_networkFTPAccessPMStart_text").hasClass("gray_out")) $("#settings_networkFTPAccessPMStart_text").addClass("gray_out");
		if (!$("#settings_networkFTPAccessPMEnd_text").hasClass("gray_out")) $("#settings_networkFTPAccessPMEnd_text").addClass("gray_out");
	}
	else
	{
		if ($("#settings_networkFTPAccessPMDefault_button").hasClass("sel")) $("#settings_networkFTPAccessPMDefault_button").removeClass('sel');
		if (!$("#settings_networkFTPAccessPMCustomize_button").hasClass("sel")) $("#settings_networkFTPAccessPMCustomize_button").addClass("sel")
		$("#tr_FTPSet_Passive_Mode_Customize").show();
		if ($("#settings_networkFTPAccessPMStart_text").hasClass("gray_out")) $("#settings_networkFTPAccessPMStart_text").removeClass("gray_out");
		if ($("#settings_networkFTPAccessPMEnd_text").hasClass("gray_out")) $("#settings_networkFTPAccessPMEnd_text").removeClass("gray_out");
	}	
	var tmp = FTP_CREATE_INFO[6].toString().split(":");
	$("#settings_networkFTPAccessPMStart_text").val(tmp[0]);
	$("#settings_networkFTPAccessPMEnd_text").val(tmp[1]);
	
	if (parseInt(FTP_CREATE_INFO[11],10) == 1)
	{
		$("#settings_networkFTPAccessMode_chkbox").prop("checked",true);
		$("#settings_networkFTPAccessExternalIP_text").val(FTP_CREATE_INFO[8]);
		
		$("#tr_ftp_external_ip").show();
		if ($("#settings_networkFTPAccessExternalIP_text").hasClass("gray_out")) $("#settings_networkFTPAccessExternalIP_text").removeClass("gray_out");
		if ($("#settings_networkFTPAccessExternalIP_button").hasClass("gray_out")) $("#settings_networkFTPAccessExternalIP_button").removeClass("gray_out");
	}
	else
	{	
		$("#settings_networkFTPAccessMode_chkbox").prop("checked",false);
		
		if (!$("#settings_networkFTPAccessExternalIP_text").hasClass("gray_out")) $("#settings_networkFTPAccessExternalIP_text").addClass("gray_out");
		if (!$("#settings_networkFTPAccessExternalIP_button").hasClass("gray_out")) $("#settings_networkFTPAccessExternalIP_button").addClass("gray_out");
		$("#tr_ftp_external_ip").hide();
	}	
	
	//$("#settings_networkFTPAccessClientChar_text").val(FTP_CREATE_INFO[5]);
	if ( check_codepage_list(FTP_CREATE_INFO[5]) == 1) 
	{
			$("#f_default_lang").html(FTP_CREATE_INFO[5]);
			$("#f_default_lang").attr('rel',FTP_CREATE_INFO[5]);
			
			$("#codepage_li li").each(function( index ) {
				if ($(this).attr('rel') == FTP_CREATE_INFO[5])
				$("#f_default_lang").html($(this).text());
				$("#f_default_lang").attr('rel',FTP_CREATE_INFO[5]);
			});	
	}		
    else	
    {	
		$("#codepage_li li").each(function( index ) {
			if ($(this).attr('rel') == 'none')
			$("#f_default_lang").html($(this).text());
			$("#f_default_lang").attr('rel',FTP_CREATE_INFO[5]);
		});
		
    }
    
    //SSL/TLS
    //(FTP_CREATE_INFO[10]==2)?$("#f_tls").attr("checked",true):$("#f_tls").attr("checked",false);
    switch(parseInt(FTP_CREATE_INFO[10],10))
    {
    	case 2:
    		$('input[name=f_tls]').eq(0).prop('checked', false);	//Implicit SSL
    		$('input[name=f_tls]').eq(1).prop('checked', true);		//Explicit SSL
    	break;
    	
    	case 3:
    		$('input[name=f_tls]').eq(0).prop('checked', true);		//Implicit SSL
    		$('input[name=f_tls]').eq(1).prop('checked', false);	//Explicit SSL
    	break;
    	
    	default:
    		$('input[name=f_tls]').eq(0).prop('checked', false);	//Implicit SSL
    		$('input[name=f_tls]').eq(1).prop('checked', false);	//Explicit SSL
    	break;
    }
	
	FTPSetDiag.load();						
	
	$("#FTPSetDiag .close").click(function(){
	   ftp_init();

	   ftp_blockip_active_blocktype(1);
	   $("#settings_networkFTPAccessBlockIP_text").val("");
	   $("#FTPBlockIP_Set_releaseday").attr("rel","5");
	   $("#FTPBlockIP_Set_releaseday").html(_T('_itunes','auto_refresh1'));
	   $("#td_blockip_release_date").hide();
	   
	   FTPBlockIP_CREATE_INFO[0] = 0;	
	   FTPBlockIP_CREATE_INFO[1] = "",	
	   FTPBlockIP_CREATE_INFO[2] = 1;
	   FTPBlockIP_CREATE_INFO[3] = "";
		
	   FTPSetDiag.close();
		
	   INTERNAL_DIADLOG_BUT_UNBIND("FTPSetDiag");
	   INTERNAL_DIADLOG_DIV_HIDE("FTPSetDiag");
	});
	
	$("#FTP_Set3 input[type=checkbox]").click(function(idx){
		
		if ( $(this).prop("checked") )
		{
			$("#FTP_Set3 input[type=checkbox]").prop('checked',false);
			$(this).prop('checked',true);
		}
	});
	
	//Set 1
	$("#settings_networkFTPAccessNext1_button").click(function(){
		
		FTP_CREATE_INFO[0] = $("#FTPSet_f_maxuser").attr('rel');
		
		if (ftp_format_idle($("#settings_networkFTPAccessIdleTime_text").val()) == 0)	return;
		if (ftp_format_port($("#settings_networkFTPAccessPort_text").val()) == 0)	return;
		
		if( parseInt(FTP_CREATE_INFO[3],10) != 0)
		{
			if (ftp_format_flowcontrol($("#settings_networkFTPAccessFlowK_text").val()) == 0) return;
			FTP_CREATE_INFO[3] = parseInt($("#settings_networkFTPAccessFlowK_text").val(),10) * 10;
		}
		
		FTP_CREATE_INFO[1] = $("#settings_networkFTPAccessIdleTime_text").val();
		FTP_CREATE_INFO[2] = $("#settings_networkFTPAccessPort_text").val();
		$("#FTP_Set1").hide();
		$("#FTP_Set2").show();
	});	
	
	//Set 2
	$("#settings_networkFTPAccessExternalIP_button").click(function(){
		
		jLoading(_T('_common','set'), 'loading' ,'s',""); 
		
		setTimeout(function(){
			
			wd_ajax({
				type: "POST",
				url: "/cgi-bin/app_mgr.cgi",
				data:{cmd:'FTP_Server_EXIP_Renew'},
				dataType: "xml",
				success: function(xml) {	  	  	
				    
				    var res =  $(xml).find("res").text(); 
				   
				    jLoadingClose();
				    
				    setTimeout(function(){
				    	
					    if (parseInt(res) == 0)	//sucees
					    	$("#settings_networkFTPAccessExternalIP_text").val($(xml).find("exip").text());
					    else
					    	jAlert( _T('_ftp','msg35'), _T('_common','error'));
					 },500);   	
				    
				 }//end of sucess...
			});	//end of ajax   
			
		}, 500);//end of setTimeout..		
		
	});	
	
	$("#FTP_Set2 .LightningCheckbox input[type=checkbox]").change(function(){
		if($(this).prop("checked"))
		{	
			if ($("#settings_networkFTPAccessExternalIP_text").hasClass("gray_out")) $("#settings_networkFTPAccessExternalIP_text").removeClass("gray_out");
			if ($("#settings_networkFTPAccessExternalIP_button").hasClass("gray_out")) $("#settings_networkFTPAccessExternalIP_button").removeClass("gray_out");
			
			$("#tr_ftp_external_ip").show();
		}
		else
		{
			if (!$("#settings_networkFTPAccessExternalIP_text").hasClass("gray_out")) $("#settings_networkFTPAccessExternalIP_text").addClass("gray_out");
			if (!$("#settings_networkFTPAccessExternalIP_button").hasClass("gray_out")) $("#settings_networkFTPAccessExternalIP_button").addClass("gray_out");
			
			$("#tr_ftp_external_ip").hide();
		}
	});	
	$("#settings_networkFTPAccessBack2_button").click(function(){
		$("#FTP_Set2").hide();
		$("#FTP_Set1").show();
	});
	$("#settings_networkFTPAccessNext2_button").click(function(){
		/*
		FTP_CREATE_INFO[0] = $(xml).find('maxclientsnumber').text();	//maxclientsnumber
		FTP_CREATE_INFO[1] = $(xml).find('maxidletime').text();			//maxidletime
		FTP_CREATE_INFO[2] = $(xml).find('port').text();				//port
		FTP_CREATE_INFO[3] = $(xml).find('flowcontrol').text();			//flowcontrol
		FTP_CREATE_INFO[4] = $(xml).find('filesystemcharset').text();	//filesystemcharset
		FTP_CREATE_INFO[5] = $(xml).find('clientcharset').text();		//clientcharset
		FTP_CREATE_INFO[6] = $(xml).find('passiveportrange').text();	//passiveportrange
		FTP_CREATE_INFO[7] = $(xml).find('exip').text();				//exip
		FTP_CREATE_INFO[8] = $(xml).find('externalip').text();			//externalip
		FTP_CREATE_INFO[9] = $(xml).find('state').text();				//state
		FTP_CREATE_INFO[10] = $(xml).find('tlsencryption').text();		//tlsencryption
		FTP_CREATE_INFO[11] = $(xml).find('forcepasvmode').text();		//forcepasvmode
		FTP_CREATE_INFO[12] = $(xml).find('connect_per_ip').text();		//connect_per_ip
		FTP_CREATE_INFO[13] = $(xml).find('fxpaccess').text();			//fxpaccess
		*/	
		
		if ( FTP_CREATE_INFO[6] != "55536:55663")
		{
			if ( ftp_format_passiveport($("#settings_networkFTPAccessPMStart_text").val(),$("#settings_networkFTPAccessPMEnd_text").val()) == 0)	return;
			
			FTP_CREATE_INFO[6] = $("#settings_networkFTPAccessPMStart_text").val()+":"+$("#settings_networkFTPAccessPMEnd_text").val();
		}	
		
		if($("#settings_networkFTPAccessMode_chkbox").prop("checked") == true)
		{
			FTP_CREATE_INFO[11] = "1";
			
			if (ftp_format_extip($("#settings_networkFTPAccessExternalIP_text").val()) == 0) return;
			FTP_CREATE_INFO[7] = $("#settings_networkFTPAccessExternalIP_text").val();
			FTP_CREATE_INFO[8] = $("#settings_networkFTPAccessExternalIP_text").val();
		}
		else
		{
			FTP_CREATE_INFO[11] = "0";
		}	
		
		$("#FTP_Set2").hide();
		$("#FTP_Set3").show();
	});	
	
	//Set 3
	$("#settings_networkFTPAccessBack3_button").click(function(){
		$("#FTP_Set3").hide();
		$("#FTP_Set2").show();
	});
	$("#settings_networkFTPAccessNext3_button").click(function(){
		//if (ftp_format_clientlang($("#settings_networkFTPAccessClientChar_text").val()) == 0) return;
		//FTP_CREATE_INFO[5] = $("#settings_networkFTPAccessClientChar_text").val();
		FTP_CREATE_INFO[5] = $("#f_default_lang").attr("rel");
		
		//SSL/TLS
		//FTP_CREATE_INFO[10] = ($("#f_tls").is(":checked") == true)?"2":"1";
		switch (parseInt($('input[name=f_tls]:checked').val(),10))
		{
			case 2://Explicit SSL
				FTP_CREATE_INFO[2] = "21";
				FTP_CREATE_INFO[10] = "2";
			break;
			
			case 3://Implicit SSL
				FTP_CREATE_INFO[2] = "990";
				FTP_CREATE_INFO[10] = "3";
			break;
			
			default:
				FTP_CREATE_INFO[2] = (parseInt($("#settings_networkFTPAccessPort_text").val(),10) == 990)? "21":$("#settings_networkFTPAccessPort_text").val();
				FTP_CREATE_INFO[10] = "1";
			break;
		}
		
		FTP_CREATE_INFO[13] = getSwitch('#settings_networkFTPAccessFXP_chkbox');
		
		/*
		FTP_CREATE_INFO[0] = $(xml).find('maxclientsnumber').text();	//maxclientsnumber
		FTP_CREATE_INFO[1] = $(xml).find('maxidletime').text();			//maxidletime
		FTP_CREATE_INFO[2] = $(xml).find('port').text();				//port
		FTP_CREATE_INFO[3] = $(xml).find('flowcontrol').text();			//flowcontrol
		FTP_CREATE_INFO[4] = $(xml).find('filesystemcharset').text();	//filesystemcharset
		FTP_CREATE_INFO[5] = $(xml).find('clientcharset').text();		//clientcharset
		FTP_CREATE_INFO[6] = $(xml).find('passiveportrange').text();	//passiveportrange
		FTP_CREATE_INFO[7] = $(xml).find('exip').text();				//exip
		FTP_CREATE_INFO[8] = $(xml).find('externalip').text();			//externalip
		FTP_CREATE_INFO[9] = $(xml).find('state').text();				//state
		FTP_CREATE_INFO[10] = $(xml).find('tlsencryption').text();		//tlsencryption
		FTP_CREATE_INFO[11] = $(xml).find('forcepasvmode').text();		//forcepasvmode
		FTP_CREATE_INFO[12] = $(xml).find('connect_per_ip').text();		//connect_per_ip
		FTP_CREATE_INFO[13] = $(xml).find('fxpaccess').text();			//fxpaccess
		*/	
		
		FTPBlockIP_CREATE_INFO[0] = 0;
		FTPBlockIP_CREATE_INFO[1] = "";
		FTPBlockIP_CREATE_INFO[2] = 1;
		FTPBlockIP_CREATE_INFO[3] = "";
						
		$("#td_blockip_release_date").hide();
		ftp_blockip_list();
		
		$("#FTP_Set3").hide();
		$("#FTP_Set4").show();
	
	});	//end of $("#settings_networkFTPAccessNext3_button").click(function(){...
	
	$("#settings_networkFTPAccessBlockIPSave_button").click(function(){
		/*
		FTPBlockIP_CREATE_INFO:
		FTPBlockIP_CREATE_INFO[0] = ip type: 0->IPV4; 1->IPV6,	
		FTPBlockIP_CREATE_INFO[1] = ip,	
		FTPBlockIP_CREATE_INFO[2] = block type:0->Temporary, 1->permanent,
		FTPBlockIP_CREATE_INFO[3] = f_release_day
		*/
		var my_ip = $("#settings_networkFTPAccessBlockIP_text").val();
		
		if (my_ip.indexOf(".") != -1)
		{	
			FTPBlockIP_CREATE_INFO[0] = 0;
			if (ftpblockip_format_ipv4($("#settings_networkFTPAccessBlockIP_text").val()) == 0)	return;
		}
		else //IPV6
		{	
			FTPBlockIP_CREATE_INFO[0] = 1;
			if (ftpblockip_format_ipv6($("#settings_networkFTPAccessBlockIP_text").val()) == 0)	return;	
		}
		
		jLoading(_T('_common','set'), 'loading' ,'s', ""); 
		
		FTPBlockIP_CREATE_INFO[1] = $("#settings_networkFTPAccessBlockIP_text").val();
		if (parseInt(FTPBlockIP_CREATE_INFO[2],10) == 1)
			FTPBlockIP_CREATE_INFO[3]="";
		else
			FTPBlockIP_CREATE_INFO[3]=$("#FTPBlockIP_Set_releaseday").attr('rel');
		 
		wd_ajax({
			url:"/cgi-bin/app_mgr.cgi",
			type:"POST",
			data:{cmd:"FTP_Server_BlockIP_Add",
	        	f_ip:FTPBlockIP_CREATE_INFO[1],
	        	f_permanent:FTPBlockIP_CREATE_INFO[2],
	        	f_release_day:FTPBlockIP_CREATE_INFO[3]
			},
			cache:false,
			dataType:"xml",
			success: function(xml)
			{
			   ftp_blockip_active_blocktype(1);
			   $("#settings_networkFTPAccessBlockIP_text").val("");
			   $("#FTPBlockIP_Set_releaseday").attr("rel","5");
			   $("#FTPBlockIP_Set_releaseday").html(_T('_itunes','auto_refresh1'));
			   $("#td_blockip_release_date").hide();
			   
			   FTPBlockIP_CREATE_INFO[0] = 0;	
			   FTPBlockIP_CREATE_INFO[1] = "",	
			   FTPBlockIP_CREATE_INFO[2] = 1;
			   FTPBlockIP_CREATE_INFO[3] = "";
			
			   $("#FTPBlockIP_List").flexReload();
			   jLoadingClose();
			}
		}); 
	});		
	
	$("#settings_networkFTPAccessBack4_button").click(function(){
		
		$("#FTP_Set4").hide();
		$("#FTP_Set3").show();
		
	});	
	$("#settings_networkFTPAccessNext4_button").click(function(){
		
		jLoading(_T('_common','set'), 'loading' ,'s', ""); 
		setTimeout(function(){
			//codepage_add('ftp',$("#settings_networkFTPAccessClientChar_text").val());
			ftp_set();
		}, 300);//end of setTimeout...
	});		
}

