var _INIT_PORT_DIAG_FLAG=0;	
var _NEW = true; // [true] ->create new port forwarding settings; [false] ->modify
var _PORT_TABLE_CHECKED = false;
var	_P_PROTOCOL;
var _P_PORT;
var _P_SERVICE;
var _MAX_TOTAL_PORTFORWARDING = 32;
var _NOW_NUM = 0;
var _MODIFY_INDEX = 0;
var E_PORT_SELECTED;
var PROTOCOL_SELECTED;

/*
___________��l�]�w________________()

*/
function init_port()
{
	if(_INIT_PORT_DIAG_FLAG==1)
		return;
	
	language();
		
	_INIT_PORT_DIAG_FLAG=1;
	
		// when finish [new] or [modiyf] settings
	$("#settings_networkPortForDefaultSave_button").click(function(){
					set_tb_value();								
					var service_array = new Array();						
					var protocol_array = new Array();										
					var p_port_array = new Array();
					var e_port_array = new Array();
					
					var flag = true;
					var return_v = "ok"
					$('#id_port_tb tbody tr').each(function(index){			
					if($("#id_port_tb tbody tr:eq("+index+") td:eq(0) input ").prop('checked'))
					{																								
						var service = $("#id_port_tb tbody tr:eq("+index+") td:eq(1)").text();
						var protocol = $("#id_port_tb tbody tr:eq("+index+") td:eq(2)").text();
						var p_port = $("#id_port_tb tbody tr:eq("+index+") td:eq(3)").text();
						var e_port = $("#id_port_tb tbody tr:eq("+index+") td:eq(4) span:eq(1)").text();
						
						return_v = check_external_port_scan(service,protocol,p_port,e_port)
						
						if (e_port == "")
						{
							flag = false;
						}
//						alert(e_port);	
					
						service_array.push(service);
						protocol_array.push(protocol);
						p_port_array.push(p_port);
						e_port_array.push(e_port);
						
						
					}
						
				});	
				if (return_v == "") return;
																			
				if (flag == false)
				{
					jAlert( _T('_portforwarding','msg7'), _T('_common','error'));
					return;
				}																					
        if (service_array.length == 0)
        {
					 	jAlert( _T('_portforwarding','msg4'), _T('_common','error'));
						return;
				}						
																					
				if (parseInt(service_array.length,10) + parseInt(_NOW_NUM,10) > _MAX_TOTAL_PORTFORWARDING)
				{
					jAlert(_T('_portforwarding','msg5'), _T('_common','error'));
					return;
				}
				$("#portDiag").overlay().close();										
				jLoading(_T('_common','set'), 'loading' ,'s',"");
				var result = new Array();
				set_scan(0,service_array,protocol_array,p_port_array,e_port_array,result);
		});		
		
		
	
		// when finish [new] or [modiyf] settings
		$("#settings_networkPortForCustomSave_button").click(function(){
		
//				//check internal port 				
				if (check_external_port() == "error")
				{
					jAlert( _T('_portforwarding','msg2'), _T('_common','error'));
					return;
				}						
				
				if ($("#settings_networkPortForService_text").val() == "")
				{
					jAlert( _T('_portforwarding','msg6'), _T('_common','error'));
					return;
				}
				if ($("#e_port").val() == "")
				{
					jAlert( _T('_portforwarding','msg7'), _T('_common','error'));
					return;
				}
				if ($("#settings_networkPortForIntPort_text").val() == "")
				{
					jAlert( _T('_portforwarding','msg8'), _T('_common','error'));
					return;
				}	
								
				var over = $("#portDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});
				over.close();				
				//var overlayObj=$("#overlay").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
				//overlayObj.load();				
				jLoading("Setting...", 'loading' ,'s',"");		
				setTimeout(function(){					
					set();
				},200);	
				//setTimeout("set()",200);					    
		});					
		
	
		
		//
		$("#p_next_button_1").click(function(){			

			$("#port_step2").show();
			$("#port_step1").hide();				
		});
		
		$("#settings_networkPortForNext1_button").click(function(){			
			adjust_dialog_size("#portDiag",650,"");	
		
			$("#port_step2").hide();		
			if ($("#settings_networkPortForDefault_button").hasClass("buttonSel"))
			{				
				$("#port_scan_dialog").show();
				$("#scrollbar_portforward").jScrollPane();
				ui_tab("#portDiag","#id_port_tb .chkbox:first","#settings_networkPortForDefaultSave_button")
			}	
			else
			{
				$("#port_custom_dialog").show();										
				ui_tab("#portDiag","#settings_networkPortForService_text","#settings_networkPortForCustomSave_button")				
			}
		});
		
		$("#p_skip_button_2").click(function(){	
			if (_NEW == true)
					init_field();			
			else
					set_moodify_field();
							
			$("#port_step3_custom").show();
			$("#port_step2").hide();		
		});
		
		$("#p_back_button_2").click(function(){			
			$("#port_step1").show();
			$("#port_step2").hide();				
		});
		
	$("#p_back_button_3").click(function(){		
			$("#port_step2").show();
			$("#port_step3_custom").hide();		
		});

$("#settings_networkPortForCustomBack1_button").click(function(){		
			if (MULTI_LANGUAGE == 1 || MULTI_LANGUAGE == 2 ||  MULTI_LANGUAGE == 3 ||  MULTI_LANGUAGE == 8 || MULTI_LANGUAGE == 9 || MULTI_LANGUAGE == 10 || MULTI_LANGUAGE == 11 || MULTI_LANGUAGE == 12 || MULTI_LANGUAGE == 13 ||  MULTI_LANGUAGE == 14  || MULTI_LANGUAGE == 15  || MULTI_LANGUAGE == 17)
			{		
				adjust_dialog_size("#portDiag",850,"");	
			}
			else if (MULTI_LANGUAGE == 4 )
			{
				adjust_dialog_size("#portDiag",900,"");	
			}
			else 
				adjust_dialog_size("#portDiag",650,"");		
			$("#port_step2").show();
			$("#port_custom_dialog").hide();		
			ui_tab("#portDiag","#settings_networkPortForCustom_button","#settings_networkPortForNext1_button");
				
		});

$("#settings_networkPortForDefaultBack1_button").click(function(){		
			if (MULTI_LANGUAGE == 1 || MULTI_LANGUAGE == 2 || MULTI_LANGUAGE == 3  || MULTI_LANGUAGE == 8 || MULTI_LANGUAGE == 9 || MULTI_LANGUAGE == 10 || MULTI_LANGUAGE == 11 || MULTI_LANGUAGE == 12 || MULTI_LANGUAGE == 13 || MULTI_LANGUAGE == 14 || MULTI_LANGUAGE == 15  || MULTI_LANGUAGE == 17)
			{		
				adjust_dialog_size("#portDiag",850,"");	
			}
			else if (MULTI_LANGUAGE == 4 )
			{
				adjust_dialog_size("#portDiag",900,"");	
			}
			else
				adjust_dialog_size("#portDiag",650,"");		
			$("#port_step2").show();
			$("#port_scan_dialog").hide();		
			ui_tab("#portDiag","#settings_networkPortForDefault_button","#settings_networkPortForNext1_button");		
		});
		
	$(".exit").click(function(){					
			var portObj=$("#portDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:'fast'});			
    	portObj.close();

	});
		
	$("#settings_networkPortForDefault_button").click(function(){
		
		$("#settings_networkPortForDefault_button").addClass("buttonSel")
		$("#settings_networkPortForCustom_button").removeClass("buttonSel")
	});
		
		
	$("#settings_networkPortForCustom_button").click(function(){
			$("#settings_networkPortForCustom_button").addClass("buttonSel")
			$("#settings_networkPortForDefault_button").removeClass("buttonSel")
	});
		
}
function get_total()
{	
	var num;
		wd_ajax({			
						type: "POST",
						url: "/cgi-bin/network_mgr.cgi",
						data:{cmd:"cgi_portforwarding_total"},
						async: false,
						cache: false,
						success: function(data){		
							num = data;
							}  
					});	
					
	return num;
}
function scan_port_dialog()
{
		
	_NOW_NUM = $("#port_tb tbody tr").length;
	if(_NOW_NUM >=_MAX_TOTAL_PORTFORWARDING)
	{
		jAlert(_T('_portforwarding','msg5'), _T('_common','error'));
		return;
	}
	
	_NEW = true;
	
	//clear	
	init_field();
		
	if (MULTI_LANGUAGE == 1 || MULTI_LANGUAGE == 2 ||  MULTI_LANGUAGE == 3 || MULTI_LANGUAGE == 8 || MULTI_LANGUAGE == 9 || MULTI_LANGUAGE == 11 || MULTI_LANGUAGE == 12 || MULTI_LANGUAGE == 13 || MULTI_LANGUAGE == 14 || MULTI_LANGUAGE == 15 || MULTI_LANGUAGE == 17)
	{		
		adjust_dialog_size("#portDiag",850,"");	
	}		
	else if (MULTI_LANGUAGE == 10 )
	{
		adjust_dialog_size("#portDiag",790,"");	
	}	
	else if (MULTI_LANGUAGE == 4 )
	{
		adjust_dialog_size("#portDiag",900,"");	
	}	
		
	//var portObj=$("#portDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:'fast'});			
	//portObj.load();	
	$("#portDiag").overlay({oneInstance:false, expose: '#000', api:true, closeOnClick:false, closeOnEsc:false}).load();
	//$("#portDiag").center();

//	if (MULTI_LANGUAGE == 10)
//		$("#portDiag.WDLabelDiag").css("left","105px").css("margin-top","-50px");				
//	else	
//		$("#portDiag.WDLabelDiag").css("left","210px").css("margin-top","-50px");		
		
	$("input:text").inputReset();
	//_DIALOG = portObj;
	hide('port_step1');
	show('port_step2');
	hide('port_step3_custom');
	hide('port_custom_dialog');
	hide('port_scan_dialog');
	hide('port_custom_dialog')
	
	ui_tab("#portDiag","#settings_networkPortForDefault_button","#settings_networkPortForNext1_button");
	
	get_port_table();
	 $(".exit").click(function(){
	 	$("#portDiag").overlay().close();
				//portObj.close();
	});			
}

/*
	open create new port forwarding dialog
*/
function open_port_dialog()
{
	_NEW = true;
	
	//clear	
	init_field();
	//$("#port_custom_dialog").show();		
	//$("#port_scan_dialog").hide();		
	
show('port_step1');
hide('port_step2');
hide('port_step3_custom');
hide('port_custom_dialog');
hide('port_scan_dialog');
show('port_custom_dialog')
	
//	dialog_init();
//	get_port_table();	
	var portObj=$("#portDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:'fast'});			
	portObj.load();	
	_DIALOG = portObj;	
	 $(".exit").click(function(){
				portObj.close();
	});			
}	

 
/*
	open modify port forwarding dialog
*/
function open_port_modify_dialog()
{	
		_NEW = false;
	//init_field();	
	//get_port_table();
	set_moodify_field();
	dialog_init();
	update_portforwarding_status();
	$("#settings_networkPortForProtocol_select").addClass("gray_out");
	$("#settings_networkPortForIntPort_text").addClass("gray_out");	
				
	//$("#portDiag").overlay({fixed: false, oneInstance:false, expose: '#000', api:true, closeOnClick:false, closeOnEsc:false}).load();
	//$("#portDiag").center();
	var portObj=$("#portDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:'fast'});		
	portObj.load();	
	$("input:text").inputReset();
	//_DIALOG = portObj;
	ui_tab("#portDiag","#settings_networkPortForService_text","#settings_networkPortForCustomSave_button");
						
	$("#portDiag .close").click(function(){
				//portObj.close();								
				$("#portDiag").overlay().close();
				$("#settings_networkPortForProtocol_select").removeClass("gray_out");					
				$("#settings_networkPortForIntPort_text").removeClass("gray_out");					
	});			
		
}
function update_portforwarding_status()
{			
	var service  = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(2) div').text();
	var protocol = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(3) div').text();
	var e_port   = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(4) div').text();
	var p_port   = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(5) div').text();
	var scan   = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(0) input:checkbox').hasClass('scan');
	var old_e_port   = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(4) div').text();
		
	wd_ajax({
		type:"POST",
		url:"/cgi-bin/network_mgr.cgi",
		data:{cmd:"cgi_portforwarding_update",
					e_port:e_port,
					p_port:p_port,
					protocol:protocol,
					service:service,
					scan:scan,
					old_e_port:old_e_port
					},
		cache:false,
		async:true,
		success:function(data){							
			if (data == "Error")
				$("#settings_networkPortForStatus_value").text(_T('_cloud','failed'));
			else
				$("#settings_networkPortForStatus_value").text(_T('_button','Ok'));
		}			
	});	
}
function set_moodify_field()
{
	$("#settings_networkPortForCustomCancel1_button").removeClass('ButtonMarginLeft_40px').removeClass('ButtonMarginLeft_20px').addClass('ButtonMarginLeft_40px');
	hide('settings_networkPortForCustomBack1_button');
	
	var status  = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(1) div').text();
	var service  = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(2) div').text();
	var protocol = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(3) div').text();
	var e_port   = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(4) div').text();
	var p_port   = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(5) div').text();
	var scan   = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(0) input:checkbox').hasClass('scan');
	var enable = true;	
	
	E_PORT_SELECTED = e_port;
	PROTOCOL_SELECTED = protocol;
	//set modify value	
//	var service  = $('.trSelected td:eq(2) div',"#port_tb").text() 
//	var protocol = $('.trSelected td:eq(3) div',"#port_tb").text() 
//	var e_port   = $('.trSelected td:eq(4) div',"#port_tb").text() 
//	var p_port   = $('.trSelected td:eq(5) div',"#port_tb").text() 	
//	var enable   = $('.trSelected td:eq(0) input:checkbox ',"#port_tb").prop("checked") 
//	var scan     = $('.trSelected td:eq(0) input:checkbox ',"#port_tb").hasClass('scan');
	
	//scan:true -> scan settings
	//scan:false ->manual settings
//	if (status == "Error")
//		$("#settings_networkPortForStatus_value").text(_T('_cloud','failed'));
//	else	
//		$("#settings_networkPortForStatus_value").text(_T('_button','Ok'));
		
	$("#settings_networkPortForStatus_value").text(_T('_common','checking'));	
	show('settings_networkPortForCustomDel_button')
	show('settings_networkPortForStatus_tr');	
	
	

	if (enable == true)	
		$("#f_port_enable").attr("checked",true);	
	else
		$("#f_port_enable").attr("checked",false);
		
	$("#f_protocol").text(protocol)			
	//$("#protocol").val(protocol);
	$("#settings_networkPortForExtPort_text").val(e_port);
	$("#settings_networkPortForIntPort_text").val(p_port);
	$("#settings_networkPortForService_text").val(service);	
	
	
	$("#settings_networkPortForService_text").attr("disabled",false);
	$("#f_protocol").attr("disabled",true);
	$("#settings_networkPortForIntPort_text").attr("disabled",true);	
}
/*
	when modify port woarding, get value and set to field.
*/

function set_field(p_protocol,p_port,service)
{
	_PORT_TABLE_CHECKED = true;
	$("#f_port_enable").attr("checked",true);
	//$("#protocol").val(p_protocol);
	$("#f_protocol").text(protocol)	
	$("#settings_networkPortForExtPort_text").val(p_port);
	$("#settings_networkPortForIntPort_text").val(p_port);
	$("#settings_networkPortForService_text").val(service);
	$("#settings_networkPortForIntPort_text").attr("disabled",true);	
	
	_P_PROTOCOL = p_protocol;
	_P_PORT = p_port;
}
function set_field1()
{
	_PORT_TABLE_CHECKED = true;
	$("#f_port_enable").attr("checked",true);
	//$("#protocol").val(_P_PROTOCOL);
	$("#f_protocol").text(_P_PROTOCOL)	
	$("#settings_networkPortForExtPort_text").val(_P_PORT);
	$("#settings_networkPortForIntPort_text").val(_P_PORT);
	$("#settings_networkPortForService_text").val(_P_SERVICE);
	$("#settings_networkPortForIntPort_text").attr("disabled",true);	
	
}
/*
	clear all field value
*/
function init_field()
{
	hide('settings_networkPortForStatus_tr');
	hide('settings_networkPortForCustomDel_button')
	show('settings_networkPortForCustomBack1_button');
	$("#settings_networkPortForCustomCancel1_button").removeClass('ButtonMarginLeft_40px').removeClass('ButtonMarginLeft_20px').addClass('ButtonMarginLeft_20px');
	
	$("#f_port_enable").attr("checked",true);
	$("#settings_networkPortForService_text").attr("disabled",false);
	//$("#protocol").attr("disabled",false);
	$("#f_protocol").attr("disabled",false);
	$("#settings_networkPortForIntPort_text").attr("disabled",false);
		
	$("#settings_networkPortForProtocol_select").removeClass("gray_out");
	$("#settings_networkPortForIntPort_text").removeClass("gray_out");			
		
	$("#settings_networkPortForExtPort_text").val("");
	$("#settings_networkPortForIntPort_text").val("");
	$("#settings_networkPortForService_text").val("");
}


/*
	get built-in application port information
*/
function get_port_table()
{	
	_PORT_TABLE_CHECKED = false;
	
	var table = "";
	table +=	'<div id="scrollbar_portforward">'
	//table +=	'<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>'
	//table +=	'<div class="viewport">'
 	//table +=	'<div class="overview">'			
	table += "<table id='id_port_tb' border=\"0\" cellspacing=\"0\" cellpadding=\"0\" >"
	table += "<thead><tr><th width='50'><input type='checkbox' onclick='check_all(this.checked);'></th><th width='160'>"+_T('_portforwarding','service')+"</th><th width='100'>"+_T('_portforwarding','protocol')+"</th><th width='100'>"+_T('_portforwarding','p_port')+"</th><th width='100'>"+_T('_portforwarding','e_port')+"</th></tr></thead><tbody>"
	var i =1;
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/network_mgr.cgi",
			data:"cmd=get_port_table",
			cache:false,
			async:true,
			success:function(xml){			
				$(xml).find('port').each(function(){										
									var service = $(this).find('service').text();
									var port_protocol = $(this).find('protocol').text();														
									var local_port = $(this).find('local_port').text();																		
									var service = $(this).find('service').text();
									
									table += "<tr><td width='50' style='padding-left:15px;'><input type='checkbox' value="+i+" name='port_index' id='settings_networkPortForService"+i+"_chkox' class='port_table_check' onclick=change(this.checked,'"+i+"')></td>"
									table += "<td width='160'>" + service+ "</td>"
									table += "<td width='100'>" + port_protocol +"</td>"
									table += "<td width='100'>"+local_port+"</td>"							
									table += "<td width='100'><span id='input_"+i+"' style='display:none' class='tb_input'><input id='manual_input_"+i+"' type='text' size=7 class='input_x50' maxlength=5 value='"+local_port+"' onkeyup=\"this.value=this.value.replace(/[^0-9]/g,'');\" onblur=\";check_external_port_scan('"+service+"','"+port_protocol+"','"+local_port+"',this.value);\"></span><span id='text_"+i+"'  class='tb_text'>"+local_port+"</span></td></tr>"
									i++;
																	
				 			});		
				 			
				 			
				 			
				 		//if (i == 1)
						//	table += "No Data.";
						
							
						table += "</tbody></table>"	
						//table += "</div></div></div><!--scroll bar end -->";	
															
						$('#port_scan_info').html(table);
						
						
											
							//$('#scrollbar_s3_percent .scrollbar').hide();			

							//setTimeout(draw_scroll,1000);
							
							//setTimeout(draw_scroll,3000);
							//setTimeout(draw_scroll,4000);
						
											$('#id_port_tb').flexigrid({							
									width: 530,
									height: 'auto',				
								noSelect:true,
								resizable : false,
								 onSuccess:function(){		
								   //	setTimeout(draw_scroll,500);
        					}
							});
		
							
							$("input:checkbox").checkboxStyle();
					
			},
			error:function(){
			}
		});						
}

function check_all(v)
{
	set_tb_value();
				
	if (v == true)
	{
	 	$(".port_table_check").attr("checked",true);
	 	$(".tb_input").show();	 	
	 	$(".tb_text").hide();	 		 		
	}
	else
	{	
		$(".port_table_check").attr("checked",false);
		$(".tb_text").show();
		$(".tb_input").hide();
	}	
}
/*
	get all internal port number.
*/
function check_external_port()
{
	var result = "ok";
	//var e_port  = $('.trSelected td:eq(4) div',"#port_tb").text() 
	//var protocol  = $('.trSelected td:eq(3) div',"#port_tb").html() 
	var e_port  = E_PORT_SELECTED;
	var protocol  = PROTOCOL_SELECTED;
	
	
	if ($("#settings_networkPortForExtPort_text").val() == e_port )
	{
			return result;
	}

		wd_ajax({
			type:"POST",
			url:"/cgi-bin/network_mgr.cgi",
			data:"cmd=cgi_portforwarding_get_port",
			cache:false,
			async:false,
			success:function(xml){					
				$(xml).find('row').each(function(){										
									var xml_e_port = $(this).find('e_port').text();
									var xml_protocol = $(this).find('protocol').text();
									if (xml_e_port == $("#settings_networkPortForExtPort_text").val() && xml_protocol == $("#f_protocol").text())
									{	
											result = "error";																	
									}																			
				 			});						 							 	
			},
			error:function(){
			}
		});						
		return result;
}

function check_external_port_scan(service,protocl,internal_port,v)
{
	var result = v;
	
			wd_ajax({
			type:"POST",
			url:"/cgi-bin/network_mgr.cgi",
			data:"cmd=cgi_portforwarding_get_port",
			cache:false,
			async:false,
			success:function(xml){					
				$(xml).find('row').each(function(){										
									var xml_e_port = $(this).find('e_port').text();
									var xml_protocol = $(this).find('protocol').text();
									var xml_service = $(this).find('service').text();
									var xml_inter_port = $(this).find('local_port').text();
									if (service == xml_service && protocl == xml_protocol && internal_port == xml_inter_port)
									{
										//
									}
									else if (xml_e_port == v && xml_protocol == $("#f_protocol").text())
									{	
											jAlert( _T('_portforwarding','msg2'), _T('_common','error'));
											result = "";
											return false;															
									}																			
				 			});						 							 	
			},
			error:function(){
			}
		});			
	return result;		
}
/*
	set information by [new] or [modify]
*/
function set()
{
//				if ($("input[name='f_port_enable']").prop("checked") == true)				
//					enable = 1;
//				else
//					enable = 0;
				enable = 1;
					
				var _data;
				if (_NEW == true) //add
				{					
						_data = "cmd=cgi_portforwarding_add&enable="+ enable + "&protocol="+ $("#f_protocol").text() + "&e_port="+ $("#settings_networkPortForExtPort_text").val() + "&p_port="+$("#settings_networkPortForIntPort_text").val()+ "&service="+$("#settings_networkPortForService_text").val();				
				}
				else if (_NEW == false) //modify
				{
										
						//var scan =  $('.trSelected td:eq(0) input:checkbox ',"#port_tb").hasClass('scan');						         
						var scan   = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(0) input:checkbox').hasClass('scan');
						if (scan == true)
							scan = 1;
						else
							scan = 0;	
							
						var old_e_port   = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(4) div').text();
						//var old_e_port =  $('.trSelected td:eq(4)',"#port_tb").text();			
							
						_data = "cmd=cgi_portforwarding_modify&enable="+ enable + "&protocol="+ $("#f_protocol").text() + "&e_port="+ $("#settings_networkPortForExtPort_text").val() + "&p_port="+$("#settings_networkPortForIntPort_text").val() +"&service="+$("#settings_networkPortForService_text").val()+"&scan="+scan+"&old_e_port="+old_e_port;	
				}
									
	wd_ajax({
					type:"POST",
					async:true,
					cache:false,
					dataType: 'html',
					url:"/cgi-bin/network_mgr.cgi",
					data:_data,
					success:function(data){		
						//var over = $("#portDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});
						//over.close();								
						jLoadingClose();
						jQuery("#port_tb").flexReload();  				
						//var portObj=$("#portDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:'fast'});		
						//portObj.close();	
//							
//						if (data == "ERROR1")
//							jAlert(_T('_portforwarding',"error1"), _T('_common','error'));		
//						else if (data == "ERROR2")
//							jAlert(_T('_portforwarding',"error2"), _T('_common','error'));		
//						else if (data == "OK1")								
//							jAlert(_T('_portforwarding',"ok1"), _T('_common','success'));		
//						else if (data == "OK2")								
//							jAlert(_T('_portforwarding',"ok2"), _T('_common','success'));		//Save to configuration, but don't set to route table
//								
//							
						
					}
				});					
				  
}

function dialog_init()
{
//	$("#portDiag_title").html(_T('_portforwarding','title'));
	
	//$("#port_custom_dialog").show();		
	//$("#port_scan_dialog").hide();		
	hide('port_step1');
	hide('port_step2');
	hide('port_step3_custom');
	hide('port_custom_dialog');
	hide('port_scan_dialog');
	show('port_custom_dialog')

	

}	

function change(check,v)
{
	if (check == true)
	{
		var name = "input_"+v;
		var text_name = "text_"+v;		
		show(name)		
		hide(text_name);
	
	}
	else
	{		
		var name = "input_"+v;
		var text_name = "text_"+v;
		
		hide(name)		
		show(text_name);	
	}
	set_tb_value();		
}

/*
 when use auto scan, set external port value when user input value.
*/
function set_tb_value()
{
	//set value
	$('#id_port_tb tbody tr').each(function(index){		
			var t = parseInt(index,10) +parseInt(1,10);
			var id_name = "#manual_input_"+t;
			var id_text_name = "#text_"+ t;			
			$(id_text_name).html($(id_name).val());											
	});	
}
		
function 	set_scan(index,service_array,protocol_array,p_port_array,e_port_array,result)
{									
					var _data = "cmd=cgi_portforwarding_add_scan&service="+ service_array[index] + "&enable=1&protocol="+protocol_array[index]+"&p_port="+p_port_array[index]+"&e_port="+e_port_array[index];
					//alert(_data);
						
					wd_ajax({
						type:"POST",
						async:true,
						cache:false,
						url:"/cgi-bin/network_mgr.cgi",
						data:_data,
						success:function(data){															
							result.push(data);		
							index++;													
							if (index <service_array.length)
								set_scan(index,service_array,protocol_array,p_port_array,e_port_array,result);
							else
							{
								var str = "";
								for (var i=0;i<result.length;i++)
								{
									if (result[i] == "error")
									{
										if (str.length == 0)
											str = str + service_array[i];
										else	
											str = str + ","+ service_array[i];
									}
								}
								
								
								//var overlayObj=$("#overlay").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
								//overlayObj.close();				
									
								jLoadingClose();
	
								setTimeout('add_msg("'+str+'")',500);
								
								

								
							}		
						}
					});									
}

function upnp_test(index)
{
		//var overlayObj=$("#overlay").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
		//						overlayObj.load();	
		jLoading("Setting...", 'loading' ,'s',"");
		wd_ajax({			
						type: "POST",
						url: "/cgi-bin/network_mgr.cgi",
						data:{cmd:"upnp_test"},
						async: true,
						cache: false,
						success: function(){		
							//overlayObj.close();																																	
							jLoadingClose();
							upnp_test_result(index);	
							var portObj=$("#portDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:'fast'});		
							portObj.close();	
							 		        				
							}  
					});	
}
function upnp_test_result(index)
{
	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/network_mgr.cgi",
						data:{cmd:"upnp_test_result"},
						async: false,
						cache: false,
						success: function(data){																																									
							if (data == "Found")
							{
								if (index == 1)
									jAlert(_T('_portforwarding','found'), _T('_common','success'));	
								$("#settings_networkPortForStatus_value").text(_T('_portforwarding','found'))			
							}	
							else	
							{	
								if (index == 1)
									jAlert(_T('_portforwarding','not_found'), _T('_common','error'));	
								$("#settings_networkPortForStatus_value").text(_T('_portforwarding','not_found'))			
							}  
						}  
					});	
}

function upnp()
{
	$("#settings_networkPortForStatus_value").html("<img src='/web/images/spinner.gif'>")		
	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/network_mgr.cgi",
						data:{cmd:"upnp_test"},
						async: true,
						cache: false,
						success: function(){		
								 		   upnp_test_result()     				
							}  
					});	
}

function ready_portforwarding()
{
	
		//port forwarding
	$("#port_tb").flexigrid({				
		url: '/cgi-bin/network_mgr.cgi',		
		dataType: 'xml',
		cmd: 'cgi_portforwarding_get',
		colModel : [		
			{display: _T('_common','enable'), name : 'date', width : 1, sortable : true, align: 'center'},
			{display: _T('_module','status'), name : 'status', width : 1, sortable : true, align: 'center'},
			{display: _T('_portforwarding','service'), name : 'date', width : 550, sortable : true, align: 'left'},
			{display: _T('_portforwarding','protocol'), name : 'time', width : 1, sortable : true, align: 'left'},
			{display: _T('_portforwarding','e_port'), name : 'info', width : 1, sortable : true, align: 'left'},
			{display: _T('_portforwarding','p_port'), name : 'info', width :  1, sortable : true, align: 'left'},
			{display: _T('_portforwarding','p_port'), name : 'info', width :  100, sortable : true, align: 'left'}																
			],
		sortname: "id",
		sortorder: "asc",
		usepager: true,
		useRp: true,
		rp: 40,
		showTableToggleBtn: true,
		width: FLEXIGRID_WIDTH,		
		height: 'auto',
		errormsg: _T('_common','connection_error'),
		nomsg: _T('_common','no_items'),
		singleSelect:true,
		resizable:false,
		rpOptions: [40],
		noSelect:true,
		preProcess:function(r)
		{		
			var j = -1;	
			$(r).find('rows').each(function(){
			
				var info = $(this).find('cell').text();			
				if ( $(this).find('cell').text())
				 j =0;
				
			});
			if (j == -1)
			{
					show('portforwarding_list_info');
					hide('portforwarding_list_tb')
			}		
			else
			{
					hide('portforwarding_list_info');
					show('portforwarding_list_tb')
			}				
			return r;
		},
		
        onSuccess:function(){
        	var len = -1;
        	$('#port_tb > tbody > tr').each(function(index){		
        		len = index;						
        	//	 var v = $('#port_tb > tbody > tr:eq('+index+') td:eq(0) div').html();		
        		 var v = $('#port_tb > tbody > tr:eq('+index+') td:eq(0) div').html();
        		 $('#port_tb > tbody > tr:eq('+index+') td:eq(0) div').html("<span style='display:none'>"+v+"</span>");        		 
        		 
        		 var v = $('#port_tb > tbody > tr:eq('+index+') td:eq(1) div').html();
        		 $('#port_tb > tbody > tr:eq('+index+') td:eq(1) div').html("<span style='display:none'>"+v+"</span>");        		 
        		 
        		 
        		 var v = $('#port_tb > tbody > tr:eq('+index+') td:eq(3) div').html();        		
        		 $('#port_tb > tbody > tr:eq('+index+') td:eq(3) div').html("<span style='display:none'>"+v+"</span>");        		 
        		 
        		 var v = $('#port_tb > tbody > tr:eq('+index+') td:eq(4) div').html();
        		 $('#port_tb > tbody > tr:eq('+index+') td:eq(4) div').html("<span style='display:none'>"+v+"</span>");        		 
        		 
        		 var v = $('#port_tb > tbody > tr:eq('+index+') td:eq(5) div').html();
        		 $('#port_tb > tbody > tr:eq('+index+') td:eq(5) div').html("<span style='display:none'>"+v+"</span>");        		 
        		 
        		var v = $('#port_tb > tbody > tr:eq('+index+') td:eq(2) div').html();
        		 $('#port_tb > tbody > tr:eq('+index+') td:eq(2) div').html("<span id='settings_networkPortForName"+(index+1)+"_value' >"+v+"</span>");        		 
        		
						$('#port_tb > tbody > tr:eq('+index+') td:eq(6) div').html("<a class='edit_detail_x1' id='settings_networkPortForDetails"+(index+1)+"_link' href='javascript:port_detail("+index+");'>"+_T('_module','desc2')+"</a>");
        		});      
        	if (len != -1)
        	{        		
        		show('id_port_br')
        	}	
        	else
        	{        		
        		hide('id_port_br')
        	}	
//			$('#port_tb > tbody > tr').each(function(index){								
//				var my_str=  $('#port_tb > tbody > tr:eq('+index+') td:eq(1) div').text();
//				my_str = my_str.replace(/Error/g,_T('_common','error'))
//				my_str = my_str.replace(/OK/g,_T('_button','Ok'))
//				$('#port_tb > tbody > tr:eq('+index+') td:eq(0) div').html("");		
//				$('#port_tb > tbody > tr:eq('+index+') td:eq(1) div').html("");		
//				//$('#port_tb > tbody > tr:eq('+index+') td:eq(1) div').html(my_str);		
//				
//				$('#port_tb > tbody > tr:eq('+index+') td:eq(3) div').html("<span class='edit_detail' onclick='demo_detail();'>Detail>></span>");		
//				$('#port_tb > tbody > tr:eq('+index+') td:eq(4) div').html("<img src='/web/images/icon/IconListDropdownNotificationsDeleteUp.png' border=0>");		
//				
//				
//			});		
        }
	});

		
	
	$("#settings_networkPortForAdd_button").click(function(){	 					
			E_PORT_SELECTED = "";
			PROTOCOL_SELECTED = "";
		$("#port_tb").flexReload(); //for special case:  no show select item for check external port
		
			$("#settings_networkPortForCustomBack1_button").show()
			$("#settings_networkPortForCustomSave_button").text(_T('_button','finish'));
			
			$("#p_back_san").show()
			$("#settings_networkPortForDefaultSave_button").text(_T('_button','finish'));
			
		//if(!chk_timeout()) return;	 			
    	scan_port_dialog();      	
    	init_button();  	    	   	   	  
    	init_port(); 
    	language();
	});
	
	$("#port_modify").click(function(){	 					
	//	$("#port_tb").flexReload(); //for special case:  no show select item for check external port
		
		
    	open_port_modify_dialog();      	
    	init_button();  	    	   	   	  
    	init_port(); 
    	language();
	});
		
	//delete
}

function del(){
			
						jLoading(_T('_common','set') ,'loading' ,'s',""); 
						var service_array = new Array();						
						var protocol_array = new Array();										
						var p_port_array = new Array();
						var e_port_array = new Array();
						var scan_array = new Array();	
						var service  = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(2) div').text();
						var protocol = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(3) div').text();
						var e_port   = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(4) div').text();
						var p_port   = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(5) div').text();
						var scan   = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(0) input:checkbox').hasClass('scan');					
						if (scan == true)
							scan = 1;
						else
							scan = 0;	
									
						service_array.push(service);
						protocol_array.push(protocol);
						p_port_array.push(p_port);
						e_port_array.push(e_port);
						scan_array.push(scan);		
					
									
						portforwarding_del(0,service_array,protocol_array,p_port_array,e_port_array,scan_array);	
}

function port_detail(index)
	{
//		var portObj=$("#portDemoDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:'fast'});			
//	portObj.load();		
//	init_button();
//	language();
//	_DIALOG = portObj;
//			
//				$("#port_tb").flexReload(); //for special case:  no show select item for check external port
		
			_MODIFY_INDEX = index;
    	open_port_modify_dialog();      	
    	init_button();  	    	   	   	  
    	init_port(); 
    	language();

	}
	

function del()
{				
			var portObj=$("#portDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:'fast'});		
			portObj.close();	
			
			
			jLoading(_T('_common','set') ,'loading' ,'s',""); 												
			
			var service_array = new Array();						
			var protocol_array = new Array();										
			var p_port_array = new Array();
			var e_port_array = new Array();
			var scan_array = new Array();
            			
			var service  = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(2) div').text();
			var protocol = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(3) div').text();
			var e_port   = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(4) div').text();
			var p_port   = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(5) div').text();
			var scan   = $('#port_tb > tbody > tr:eq('+_MODIFY_INDEX+') td:eq(0) input:checkbox').hasClass('scan');
		
			if (scan == true)
				scan = 1;
			else
				scan = 0;	
						
			service_array.push(service);
			protocol_array.push(protocol); 
			p_port_array.push(p_port);
			e_port_array.push(e_port);
			scan_array.push(scan);		
		
						
			portforwarding_del(0,service_array,protocol_array,p_port_array,e_port_array,scan_array);	
			
			$("#portDiag").overlay().close();
	
}

function portforwarding_del(index,service_array,protocol_array,p_port_array,e_port_array,scan_array)
{	
	var _data = "cmd=cgi_portforwarding_del&protocol="+ protocol_array[index] + "&e_port="+e_port_array[index] + "&p_port="+ p_port_array[index] + "&service="+service_array[index]+"&scan="+scan_array[index]; 	
						wd_ajax({
							type:"POST",
			        async:true,
							cache:false,
							url:"/cgi-bin/network_mgr.cgi",
							data:_data,
							success:function(data){		
					index++;													
					if (index <service_array.length)	
						portforwarding_del(index,service_array,protocol_array,p_port_array,e_port_array,scan_array)	
					else																
					{								
						//var overlayObj=$("#overlay").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});	
						//overlayObj.close();	
						_DIALOG = "";						
						
						jLoadingClose();
						jQuery("#port_tb").flexReload();  
		
						setTimeout(new_tb,500);
	
					//	setTimeout(del_msg,500);
					//	jAlert(_T('_portforwarding',"del_ok"), _T('_common','success'),"",tb_reload);		
					//	jQuery("#port_tb").flexReload();    											
		
					}											   											
								}	
										});	  		
            			
}
function new_tb()
{
		if ($("#port_tb tbody tr").length == 0 )
					hide('id_port_br')
}
function add_msg(str)
{
	tb_reload()
	return;
	
	if (str.length == 0)
		jAlert(_T('_portforwarding',"ok1"), _T('_common','success'),"",tb_reload);		
	else
	{
		str = str + "&nbsp;"+ _T('_portforwarding',"error3");	
		jAlert("<div style='width:300px;height:50px;overflow-x:auto'>"+str + "</div>", _T('_common','error'),"",tb_reload);																			
	}	
								
//								jQuery("#port_tb").flexReload();  	
}
function del_msg()
{
	tb_reload()
	return;
	
	jAlert(_T('_portforwarding',"del_ok"), _T('_common','success'),"",tb_reload);		
}
function tb_reload()
{			
	jQuery("#port_tb").flexReload();    	
}