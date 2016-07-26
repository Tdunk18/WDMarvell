var UPS_intervalId = 0;	//for setInterval

function networkups_device_info()
{
	wd_ajax({
			url:"/cgi-bin/usb_device.cgi",
			type:"POST",
			data:{cmd:'GUI_ups_info'},
			async:false,
			cache:false,
			dataType:"xml",
			success:function(xml){
					
				var my_ups_plugmode = $(xml).find('ups_plugmode').text();
				
				if ( parseInt(my_ups_plugmode,10) == 1)	//Master or Standalone
				{	
			  		setSwitch('#settings_networkUPS_switch' , 0);
							
					if (!$("#settings_networkUPS_switch").hasClass("gray_out")) $("#settings_networkUPS_switch").addClass("gray_out").attr('disabled', false);
					
					networkups_device_status();
							
			  		$("#tr_networkups_device_info").show();
			  		$("#tr_networkups_manu").hide();
			  		$("#tr_networkups_product").hide();
			  		$("#tr_networkups_battery").hide();
			  		$("#tr_networkups_status").hide();
			  		
			  		$("#TD_networkups_config").hide();
				}
				else	//no UPS in
				{	
					var my_ups_mode = $(xml).find('ups_mode').text();
					//ups mode: 0 -> NoUPS, 1 -> Master, 2 -> Standalone, 3 -> Slave
			  		switch(parseInt(my_ups_mode, 10))
			  		{
			  			case 0:	//NoUPS
			  				setSwitch('#settings_networkUPS_switch' , 0);
			  				
			  				$("#tr_networkups_device_info").hide();
			  				$("#tr_networkups_manu").hide();
			  				$("#tr_networkups_product").hide();
			  				$("#tr_networkups_battery").hide();
			  				$("#tr_networkups_status").hide();
			  				$("#TD_networkups_config").hide();
			  			break;
			  			
			  			case 3:	//Slave
			  				setSwitch('#settings_networkUPS_switch', 1);
			  				
			  				$("#ups_show_device_info").html(_T('_network_ups','msg4'));	//Text:Slave Mode.
			  				
			  				var str = "";
			  				//Battery Charge
			  				var str = (!isNaN($(xml).find('master_battery').text()))?$(xml).find('master_battery').text():0;
								str = (parseInt(str, 10) == 0)?_T('_network_ups','fail'):str+" %";
								$("#ups_show_battery").text(str);
			  				
			  				//Status
			  				str = $(xml).find('master_status').text();
			  				str = str.replace("0", _T('_network_ups','fail'))
			  				.replace("1", _T('_network_ups','on_line'))
			  				.replace("2", _T('_network_ups','on_battery'))
			  				.replace("3", _T('_network_ups','low_battery'))
			  				$("#ups_show_status").html(str);
			  				
			  				$("#tr_networkups_device_info").show();
			  				$("#tr_networkups_manu").hide();
			  				$("#tr_networkups_product").hide();
			  				$("#tr_networkups_battery").show();
			  				$("#tr_networkups_status").show();
			  				$("#TD_networkups_config").show();
			  			break;
			  		}//end of switch
			  	}
			}
	});
}

function networkups_device_status()
{
	wd_ajax({
			url:"/cgi-bin/usb_device.cgi",
			type:"POST",
			data:{cmd:'GUI_ups_status_info'},
			async:false,
			cache:false,
			dataType:"xml",
			success:function(xml){
				var my_res = $(xml).find('res').text();	
				var my_menu = "--";
				var my_product = "--";
				var my_battery = "--";
				var my_status = "--";
				
				if (my_res == "1")
				{
					my_menu = $(xml).find('manufacturer').text();	
					my_product = $(xml).find('product').text();	
					
					if ( ($(xml).find('battery').text() == "Unknown") || ($(xml).find('battery').text() == "N/A"))
						my_battery = _T('_network_ups','unknown');	
					else 
						my_battery = $(xml).find('battery').text() + " %";	
						
					my_status = $(xml).find('ups_status').text();
				}	
				$("#ups_show_device_info").html(_T('_network_ups','msg2'));   //Text:Master Mode.		
				$("#ups_show_manu").text(my_menu);
				$("#ups_show_product").text(my_product);
				$("#ups_show_battery").text(my_battery);
				
				my_status = my_status.replace(/Fail/,	_T('_network_ups','fail'))
							.replace(/On Line/,	_T('_network_ups','on_line'))
							.replace(/On Battery/,	_T('_network_ups','on_battery'))
							.replace(/Low Battery/,	_T('_network_ups','low_battery'));
				$("#ups_show_status").text(my_status);
			}
	});
}
function networkups_format_ipv4(my_ip)
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
function networkups_slave_off()
{
	$("#NetworkUPSDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	INTERNAL_DIADLOG_DIV_HIDE('NetworkUPSDiag');
	$("#NetworkUPS_Wait").show();
	
	$("#NetworkUPSDiag").overlay().load();
	
	wd_ajax({
			url:"/cgi-bin/usb_device.cgi",
			type:"POST",
			data:{cmd:'GUI_ups_slave_setting',
				f_flag:"1",
				f_ups_ip:""},
			async:false,
			cache:false,
			dataType:"xml",
			success:function(xml){
				google_analytics_log('network-ups-en','0');
				
				$("#TD_networkups_config").hide();
				if (UPS_intervalId != 0) clearInterval(UPS_intervalId);
				UPS_intervalId = setInterval("networkups_slave_state('del')",2000);
			}
		});//end of ajax	
}
function networkups_slave_state(typ)
{	
	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/usb_device.cgi",
		data: {cmd:"GUI_ups_ps"},	
		dataType: "xml",
		success: function(xml){
			 if ( parseInt( $(xml).find('finish').text(), 10) == 1 )
			 {	
			 	clearInterval(UPS_intervalId);
			 	restart_web_timeout();
		   		
		   		if (typ == "add")
			 	{
			 		if ( parseInt( $(xml).find('res').text(), 10) == 0 )
			 		{
			 			jAlert( _T('_network_ups','msg5'), "warning");	//Text:It is fail to connect to UPS Master.
			 			$("#NetworkUPS_IPSet").show();
						$("#NetworkUPS_Wait").hide();
			 		}
			 		else
			 		{
			 			google_analytics_log('network-ups-en','1');
			 			
			 			$("#NetworkUPSDiag").overlay().close();
			 	
						INTERNAL_DIADLOG_BUT_UNBIND("NetworkUPSDiag");
					   	INTERNAL_DIADLOG_DIV_HIDE("NetworkUPSDiag");
					   		
					   	networkups_device_info();
			 		}		
			 	}
			 	else
			 	{
			 		$("#NetworkUPSDiag").overlay().close();
			 	
					INTERNAL_DIADLOG_BUT_UNBIND("NetworkUPSDiag");
				   	INTERNAL_DIADLOG_DIV_HIDE("NetworkUPSDiag");
				   		
				   	networkups_device_info();
			 	}	
			 	
			 	
			 }
		}//end of success
	});//end of ajax
}

function networkups_slave_diag()
{
	switch(parseInt(MULTI_LANGUAGE, 10))
	{
		case 11:
			$("#NetworkUPSDiag_title").css('font-size','16px');
		break;
		
		default:
			$("#NetworkUPSDiag_title").css('font-size','20px');
		break;
	}
	$("#NetworkUPSDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	INTERNAL_DIADLOG_DIV_HIDE('NetworkUPSDiag');
	$("#NetworkUPS_IPSet").show();
	
	$("#settings_networkUPSIP_text").val("");
	
	init_button();
	$("input:text").inputReset();
	language();
	
	wd_ajax({
			url:"/cgi-bin/usb_device.cgi",
			type:"POST",
			data:{cmd:'GUI_ups_info'},
			async:false,
			cache:false,
			dataType:"xml",
			success:function(xml){
					
				var my_ups_plugmode = $(xml).find('ups_plugmode').text();
				var my_ups_mode = $(xml).find('ups_mode').text();
				
				if ( parseInt(my_ups_plugmode) == 0)	//USP in
				{	
					//ups mode: 0 -> NoUPS, 1 -> Master, 2 -> Standalone, 3 -> Slave
			  		switch(parseInt(my_ups_mode, 10))
			  		{
			  			case 3:	//Slave
			  				$("#settings_networkUPSIP_text").val($(xml).find('master_ip').text());
			  			break;
			  			
			  			case 0:	//NoUPS
			  			case 1:	//Master
			  			case 2:	//Standalone
			  			break;
			  			
			  		}//end of switch
			  	}//end of if ( parseInt(my_ups_plugmode) == 0)	
			}//end of success
	});//end of ajax....
	
	$("#NetworkUPSDiag").overlay().load();
	
	$("#NetworkUPSDiag .close").click(function(){
	   networkups_device_info();
		
	   $("#NetworkUPSDiag").overlay().close();
		
	   INTERNAL_DIADLOG_BUT_UNBIND("NetworkUPSDiag");
	   INTERNAL_DIADLOG_DIV_HIDE("NetworkUPSDiag");
	});
	
	$("#settings_networkUPSNext1_button").click(function(){
		if (networkups_format_ipv4($("#settings_networkUPSIP_text").val()) != 1) return;
		
		stop_web_timeout(true);
		wd_ajax({
			url:"/cgi-bin/usb_device.cgi",
			type:"POST",
			data:{cmd:'GUI_ups_slave_setting',
				f_flag:"0",
				f_ups_ip:$("#settings_networkUPSIP_text").val()},
			async:false,
			cache:false,
			dataType:"xml",
			success:function(xml){
				$("#NetworkUPS_IPSet").hide();
				$("#NetworkUPS_Wait").show();
				
				$("#TD_networkups_config").show();
				
				if (UPS_intervalId != 0) clearInterval(UPS_intervalId);
				UPS_intervalId = setInterval("networkups_slave_state('add')",2000);
			}
		});//end of ajax	
		
	});	
}