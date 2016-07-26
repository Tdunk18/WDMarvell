var FLOW_CONTROL_SCHEDULE_LIST = new Array();
var P2P_FLOW_CONTROL_SCHEDULE = new Array();
var P2P_CURRENT_CONFIG = new Array();
var P2P_MODIFY_CONFIG = new Array();
/*
P2P_CURRENT_CONFIG[0] = save_path,ex:"HD_a2/P2P/incomplete"
P2P_CURRENT_CONFIG[1] = port, ex: true->automatic; false->custom
P2P_CURRENT_CONFIG[2] = port_number,
P2P_CURRENT_CONFIG[3] = bandwidth,
P2P_CURRENT_CONFIG[4] = bandwidth_upload_rate,
P2P_CURRENT_CONFIG[5] = bandwidth_downlaod_rate,
P2P_CURRENT_CONFIG[6] = seeding,0->none;1->mins;2->percent
P2P_CURRENT_CONFIG[7] = seeding_percent,
P2P_CURRENT_CONFIG[8] = seeding_mins,
P2P_CURRENT_CONFIG[9] = encryption,
P2P_CURRENT_CONFIG[10] = autodownload,
P2P_CURRENT_CONFIG[11] = current_ses_state,
P2P_CURRENT_CONFIG[12] = flow_control_download_rate
P2P_CURRENT_CONFIG[13] = flow_control_upload_rate
P2P_CURRENT_CONFIG[14] = flow_control
P2P_CURRENT_CONFIG[15] = show_path,ex:"Volume_1"
*/
function p2p_config_get_config()
{
	wd_ajax({
			url:"/cgi-bin/p2p.cgi",
			type: "POST",
			data:{cmd:'p2p_get_setting_info'},
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml){
				P2P_CURRENT_CONFIG = new Array();
				P2P_CURRENT_CONFIG[0] = $(xml).find('save_path').text();
				P2P_CURRENT_CONFIG[1] = $(xml).find('port').text();
				P2P_CURRENT_CONFIG[2] = $(xml).find('port_number').text();
				P2P_CURRENT_CONFIG[3] = "false";
				P2P_CURRENT_CONFIG[4] = $(xml).find('bandwidth_upload_rate').text();
				P2P_CURRENT_CONFIG[5] = $(xml).find('bandwidth_downlaod_rate').text();
				P2P_CURRENT_CONFIG[6] = $(xml).find('seeding').text();
				P2P_CURRENT_CONFIG[7] = $(xml).find('seeding_percent').text();
				P2P_CURRENT_CONFIG[8] = $(xml).find('seeding_mins').text();
				P2P_CURRENT_CONFIG[9] = $(xml).find('encryption').text();
				P2P_CURRENT_CONFIG[10] = $(xml).find('autodownload').text();
				P2P_CURRENT_CONFIG[11] = $(xml).find('current_ses_state').text();
				P2P_CURRENT_CONFIG[12] = $(xml).find('flow_control_download_rate').text();
				P2P_CURRENT_CONFIG[13] = $(xml).find('flow_control_upload_rate').text();
//				P2P_CURRENT_CONFIG[14] = $(xml).find('flow_control').text();
				P2P_CURRENT_CONFIG[15] = $(xml).find('show_path').text();
				//P2P_MODIFY_CONFIG = P2P_CURRENT_CONFIG;
				P2P_MODIFY_CONFIG = P2P_CURRENT_CONFIG.slice();
			}
			
	});//end of ajax...
}

function p2p_config_path_selector()
{
	$("#f_p2p_config_path_li").empty();
	var my_html = "";
	wd_ajax({
			url:"/cgi-bin/p2p.cgi",
			type: "POST",
			data:{cmd:'cgi_p2p_config_get_hd'},
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml){		
				
				if ($(xml).find("item").length == 1)
					$("#apps_p2pconfi_savepath_tr").hide();
				else
					$("#apps_p2pconfi_savepath_tr").show();	
											
				$('item',xml).each(function(n){
					my_html += "<li class='";
					if (parseInt(n,10) == 0) my_html += "li_start";
					if (parseInt(n,10) == ($('item',xml).length - 1)) my_html += " li_end";
					my_html += "' rel='"+ $('val',this).text() +"'> <a href=\"#\">" + $('show_name',this).text() + "</a></li>";
				});	//end of each	
				$("#f_p2p_config_path_li").append(my_html);	
			}
	});//end of ajax...
}
function p2p_config_schedule_diag()
{
	var my_schedule = "";
	wd_ajax({
			url:"/cgi-bin/p2p.cgi",
			type: "POST",
			data:{cmd:'cgi_session_scheduling_get'},
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml){
					my_schedule = $(xml).find("session_schedule").text();
			}
	});//end of ajax...
	
	adjust_dialog_size("#P2PDiag", 750, 450);
	
	$("#P2PDiag_title").html(_T("_p2p","title4"));
	var P2PScheduleDiag_obj = $("#P2PDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	INTERNAL_DIADLOG_DIV_HIDE('P2PDiag');
	$('#P2P_Config_Schedule_Set0').show();
	
	P2PScheduleDiag_obj.load();
	
	var oBrowser = new detectBrowser();
	if (oBrowser.isIE8)
	{
		$("#P2P_Config_Schedule_Set0 .jslider").css("top", "-5px");
	}
	
	//Scheduling Set
	p2p_config_scheduling(my_schedule);
	
	$("#apps_p2pdownloadsConfigureCancel0_button").click(function(){
		INTERNAL_DIADLOG_DIV_HIDE('P2PDiag');
		INTERNAL_DIADLOG_BUT_UNBIND('P2PDiag');
		$("#P2PDiag").overlay().close();
	});
	$("#apps_p2pdownloadsConfigureNext0_button").click(function(){		
		
		jLoading(_T('_common','set'), 'loading' ,'s',""); 
		
		var index_array = new Array('7','1','2','3','4','5','6');	
		var flow_control_schedule = new Array();
		var msg = "";
		for(var i=0;i<P2P_FLOW_CONTROL_SCHEDULE.length;i++)
		{
			if (P2P_FLOW_CONTROL_SCHEDULE[i][2] == "OFF")
			{
				tmp = p2p_config_scheduling_format(1,"OFF");
			}
			else
			{
				var tmp = $("#P2P_Slider"+index_array[i]).jslider("value").replace(/;/,",");	
				msg += "tmp["+i+"] = " + tmp+"->";
				tmp = p2p_config_scheduling_format(1, tmp);
				msg += "tmp["+i+"] = " + tmp + "\n";
			}	
			flow_control_schedule.push(tmp);
		}
		var my_schedule = flow_control_schedule.toString().replace(/,/g,"");
		wd_ajax({
				url:"/cgi-bin/p2p.cgi",
				type: "POST",
				data:{cmd:'cgi_session_scheduling_set', f_session_schedule:my_schedule},
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml){
						INTERNAL_DIADLOG_DIV_HIDE('P2PDiag');
						INTERNAL_DIADLOG_BUT_UNBIND('P2PDiag');
						P2PScheduleDiag_obj.close();
						
						setTimeout(function(){
							jLoadingClose();
						}, 200);
				}
		});//end of ajax...
	});	
}
function p2p_config_seeding(my_seeding)
{
	$('#P2P_Config_Set2 .LightningCheckbox input[type=checkbox]').prop('checked',false);
	
	switch(parseInt(my_seeding,10))
	{
		case 1:
			$('#P2P_Config_Set2 .LightningCheckbox input[type=checkbox]:eq(1)').prop('checked',true);
			
			if ($("#apps_p2pdownloadsConfigureSeedingMin_text").hasClass("gray_out")) 
			{
				$("#apps_p2pdownloadsConfigureSeedingMin_text").removeClass("gray_out");
				$("#apps_p2pdownloadsConfigureSeedingMin_text").removeAttr("disabled"); 
			}
			
			if (!$("#apps_p2pdownloadsConfigureSeedingRatio_text").hasClass("gray_out")) 
			{
				$("#apps_p2pdownloadsConfigureSeedingRatio_text").addClass("gray_out");
				$("#apps_p2pdownloadsConfigureSeedingRatio_text").attr("disabled", true); 
			}
		break;
		
		case 2:
			$('#P2P_Config_Set2 .LightningCheckbox input[type=checkbox]:eq(2)').prop('checked',true);
			if (!$("#apps_p2pdownloadsConfigureSeedingMin_text").hasClass("gray_out")) 
			{
				$("#apps_p2pdownloadsConfigureSeedingMin_text").addClass("gray_out");
				$("#apps_p2pdownloadsConfigureSeedingMin_text").attr("disabled", true); 
			}
			
			if ($("#apps_p2pdownloadsConfigureSeedingRatio_text").hasClass("gray_out")) 
			{
				$("#apps_p2pdownloadsConfigureSeedingRatio_text").removeClass("gray_out");
				$("#apps_p2pdownloadsConfigureSeedingRatio_text").removeAttr("disabled"); 
			}
		break;
		
		default:
			$('#P2P_Config_Set2 .LightningCheckbox input[type=checkbox]:eq(0)').prop('checked',true);
			if (!$("#apps_p2pdownloadsConfigureSeedingMin_text").hasClass("gray_out")) 
			{
				$("#apps_p2pdownloadsConfigureSeedingMin_text").addClass("gray_out");
				$("#apps_p2pdownloadsConfigureSeedingMin_text").attr("disabled", true); 
			}	
			if (!$("#apps_p2pdownloadsConfigureSeedingRatio_text").hasClass("gray_out")) 
			{
				$("#apps_p2pdownloadsConfigureSeedingRatio_text").addClass("gray_out");
				$("#apps_p2pdownloadsConfigureSeedingRatio_text").attr("disabled", true); 
			}	
		break;
	}
}
function p2p_config_scheduling_format(typ,str)
{
	/* typ:
			0 -> 
				ex1: "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1" -> "ON"
				ex2: "2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2" -> "0,24"
				ex3: "2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1" -> "0,7"
				----------------------------------------------------------------
			1 -> ex1: "OFF" -> "2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2"
				 ex2: "ON" -> "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
				 ex3: "0,7" -> "2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
	*/
	var val = "";
	if (parseInt(typ, 10) == 0)
	{
		str = str.replace(/,/g, "");
		if ( (str.indexOf('1') != -1) && (str.indexOf('2') != -1))
		{
			val = str.indexOf('1')+","+ (str.lastIndexOf('1') + 1);
		}
		else if ( str.indexOf('1') == -1)	val="OFF";
		else if ( str.indexOf('2') == -1)	val="0,24";	
	}
	else
	{
		switch(str)
		{
			case "OFF":
				val = "2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2";
			break;
			
			case "ON":
				val = "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1";
			break;
			
			default:
				var my_data = new Array('2','2','2','2','2','2','2','2','2','2','2','2','2','2','2','2','2','2','2','2','2','2','2','2');	
				var n=str.split(",");
				if (n.length == 2)
				{
					for (var idx = parseInt(n[0],10); idx < parseInt(n[1], 10); idx++)
					{
						my_data[idx] = 1;
					}
				}
				
				val = my_data.toString();
			break;
		}
	}	
	
	return val;
}
function p2p_config_scheduling_power(idx, typ)
{
	if ( typ == "on")
	{
		show('img_on_'+idx);
		hide('img_off_'+idx);
	   
    	hide("Slider_desc"+idx);
		show("SliderMain"+idx);
		$("#P2P_Slider"+idx).jslider("value", 0, 24);	
		
		idx = (parseInt(idx, 10) == 7)?0:idx;
		P2P_FLOW_CONTROL_SCHEDULE[idx][2] = "ON";
	}
	else
	{
		hide('img_on_'+idx);
		show('img_off_'+idx);
		$("#Slider"+idx).jslider("value", 0, 0);
		hide("SliderMain"+idx);
		show("Slider_desc"+idx);
		
		idx = (parseInt(idx, 10) == 7)?0:idx;
		P2P_FLOW_CONTROL_SCHEDULE[idx][2] = "OFF";
	}	
}

function p2p_config_scheduling(my_data)
{	
	//Step1: "11111111...1111", total 168	
	var my_day = new Array();
	var msg = "";
	
	/*Step2: Array,EX:
		sun: [0]-> "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
		mon: [1]-> "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
		....
		sat: [6]-> "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1"
	*/
	for (var i=0;i<my_data.length;i++)
	{
		var week = parseInt((i/24) ,10);
		
		if ((i % 24) == 0)
		{
			var idx = week;
			var my_hour = 0;
			my_day[week] = new Array();
		}
		my_day[week][my_hour]= my_data.charAt(i);
		my_hour++;
	}
	
	/*Step3:Array,EX:
		sun: [0]-> "0,24,on/off" ,on-> 1, off->0
		mon: [1]-> "0,24,on/off" ,on-> 1, off->0
		....
		sat: [6]-> "0,24,on/off" ,on-> 1, off->0
	*/
	var my_rdata = new Array();
	for (i=0;i<my_day.length;i++)
	{
		var tmp = p2p_config_scheduling_format(0,my_day[i].toString()).split(",");
		my_rdata[i] = new Array();
		if (tmp.length == 2)
		{
			my_rdata[i][0]= tmp[0];
			my_rdata[i][1]= tmp[1];
			my_rdata[i][2]= "ON";
		}
		else if (tmp == "OFF")	
		{
			my_rdata[i][0]= "0";
			my_rdata[i][1]= "0";
			my_rdata[i][2]= "OFF";
		}
	}
	
	P2P_FLOW_CONTROL_SCHEDULE.length = 0;
	P2P_FLOW_CONTROL_SCHEDULE = my_rdata;
	
	var index_array = new Array('7','1','2','3','4','5','6');	
	for (var i = 0;i< 7;i++)
    {	
    		jQuery("#P2P_Slider"+index_array[i]).jslider({ from: 0, to: 24, 
	    	scale: [0,'|', '|','|','|' ,'|','|','|','|','|','|','|','|','|','|','|','|','|','|','|','|','|','|','|',24], 
	    	limits: false, step: 1, dimension: '', skin: "round",callback: function( value ){ console.dir( this ); } });
		    	
		    if (my_rdata[i][2] == "OFF")
		    {
		    	p2p_config_scheduling_power(index_array[i], "off");
		    }
		    else
		    {
		    	var my_jslider_min = parseInt(my_rdata[i][0], 10);	
    			var my_jslider_max = parseInt(my_rdata[i][1], 10);		
		    	$("#P2P_Slider"+index_array[i]).jslider("value", my_jslider_min, my_jslider_max);
		    }
    }
}
function p2p_config_diag()
{
	$("#P2PDiag_title").html(_T('_p2p','title3'));	
	$("#tip_p2pset_autodownlaod").attr('title',_T('_p2p','tip2'));
	$("#tip_p2pset_port_number").attr('title',_T('_tip','p2p_port'));
	$("#tip_p2pset_torrent_save_path").attr('title',_T('_p2p','desc3'));
	$("#tip_p2pset_encrypt").attr('title',_T('_p2p','desc4'));
	$("#tip_p2pset_Bandwidth_Control_1").attr('title',_T('_p2p','desc5'));
	$("#tip_p2pset_Bandwidth_Control_2").attr('title',_T('_p2p','desc7'));
	
	FLOW_CONTROL_SCHEDULE_LIST = new Array();
	P2P_CURRENT_CONFIG = new Array();
	P2P_MODIFY_CONFIG = new Array();

	p2p_config_get_config();
//	p2p_config_selectable_init();
	
	setSwitch('#apps_p2pdownloadsConfigureAutoDownload_switch',	parseInt(P2P_CURRENT_CONFIG[10],10));
	//Incoming Connection Port
	if ( P2P_CURRENT_CONFIG[1] == "true")//Auto
	{
		setSwitch('#apps_p2pdownloadsConfigurePort_switch',1);
		$("#tr_p2p_config_portnumber").hide();
		$("#apps_p2pdownloadsConfigurePort_text").val("");
	}	
	else	//Custom
	{
		setSwitch('#apps_p2pdownloadsConfigurePort_switch',0);
		$("#tr_p2p_config_portnumber").show();
		$("#apps_p2pdownloadsConfigurePort_text").val(P2P_CURRENT_CONFIG[2]);
	}		
	
	//Seeding
	$("input[name=apps_p2pdownloadsConfigureSeeding_chkbox]").prop('checked',false);
	var seed_type =parseInt(P2P_CURRENT_CONFIG[6],10);
	if ( seed_type == 1)
	{
		$('input[name=apps_p2pdownloadsConfigureSeeding_chkbox]:eq(1)').prop('checked',true);
		$('input[name=apps_p2pdownloadsConfigureSeedingMin_text]').val(P2P_CURRENT_CONFIG[8])
	}
	else if (seed_type == 2)	
	{
		$('input[name=apps_p2pdownloadsConfigureSeeding_chkbox]:eq(2)').prop('checked',true);
		$('input[name=apps_p2pdownloadsConfigureSeedingRatio_text]').val(P2P_CURRENT_CONFIG[7])
	}
	else
		$('input[name=apps_p2pdownloadsConfigureSeeding_chkbox]:eq(0)').prop('checked',true);	
	
	p2p_config_seeding(seed_type);
	
	//Path
	$("#f_p2p_config_path").html(P2P_CURRENT_CONFIG[15].toString().replace(/\/P2P\/incomplete/g,""));
	$("#f_p2p_config_path").attr('rel',P2P_CURRENT_CONFIG[0].toString().replace(/\/P2P\/incomplete/g,""));
	
	//Encryption 
	(P2P_CURRENT_CONFIG[9] == "1")?setSwitch('#apps_p2pdownloadsConfigureEncryption_switch',1):setSwitch('#apps_p2pdownloadsConfigureEncryption_switch',0);
	
	//Flow Control
	var my_p2p_config_flow_control_schedule_max_download_rate = (P2P_CURRENT_CONFIG[12]=="-1")?"":P2P_CURRENT_CONFIG[12];
	var my_p2p_config_flow_control_schedule_max_upload_rate = (P2P_CURRENT_CONFIG[13]=="-1")?"":P2P_CURRENT_CONFIG[13];
	$("#apps_p2pdownloadsConfigureDownloadRate_text").val(my_p2p_config_flow_control_schedule_max_download_rate);
	$("#apps_p2pdownloadsConfigureUploadRate_text").val(my_p2p_config_flow_control_schedule_max_upload_rate);
	
	adjust_dialog_size("#P2PDiag", 750, 450);
	var P2PDiag_obj=$("#P2PDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	INTERNAL_DIADLOG_DIV_HIDE('P2PDiag');
	$('#P2P_Config_Set1').show();
	
	p2p_config_path_selector();
	
	init_select();
	hide_select();
	init_button();
	init_switch();
	$("input:text").inputReset();
	$("input:checkbox").checkboxStyle();
	init_tooltip();
	language();
	
	P2PDiag_obj.load();
	
	$("#P2PDiag .close").click(function(){
		INTERNAL_DIADLOG_DIV_HIDE('P2PDiag');
		INTERNAL_DIADLOG_BUT_UNBIND('P2PDiag');
		P2PDiag_obj.close();
	});
	
	$("#apps_p2pdownloadsConfigurePort_switch").click(function(){	
		if ( getSwitch('#apps_p2pdownloadsConfigurePort_switch') == 1) //Auto
		{
			$("#tr_p2p_config_portnumber").hide();
		}
		else//Custom
		{
			$("#tr_p2p_config_portnumber").show();
		}	
	});	
	
	$("#apps_p2pdownloadsConfigureNext1_button").click(function(){
		
		P2P_MODIFY_CONFIG[10] = getSwitch('#apps_p2pdownloadsConfigureAutoDownload_switch');
		if ( getSwitch('#apps_p2pdownloadsConfigurePort_switch') == 1) //Auto
		{
			P2P_MODIFY_CONFIG[1] = "true";
			P2P_MODIFY_CONFIG[2] = "";	
		}
		else	//Custom
		{
			if (p2p_config_format_port($("#apps_p2pdownloadsConfigurePort_text").val()) == 0) return;
			
			P2P_MODIFY_CONFIG[1] = "false";
			P2P_MODIFY_CONFIG[2] = $("#apps_p2pdownloadsConfigurePort_text").val();
		}
		
		$('#P2P_Config_Set1').hide();
		$('#P2P_Config_Set2').show();
	});	
	
	$("#apps_p2pdownloadsConfigureBack2_button").click(function(){
		$('#P2P_Config_Set2').hide();
		$('#P2P_Config_Set1').show();
	});	
	
	$("#apps_p2pdownloadsConfigureNext2_button").click(function(){
		var my_seeding = $('input[name=apps_p2pdownloadsConfigureSeeding_chkbox]:checked').val();
		switch(parseInt(my_seeding,10))
		{
			case 1:
				if ( p2p_config_format_seeding(1) == 0) return;
				
				P2P_MODIFY_CONFIG[6] = "1";
				P2P_MODIFY_CONFIG[7] = "";
				P2P_MODIFY_CONFIG[8] = $("#apps_p2pdownloadsConfigureSeedingMin_text").val();;
			break;
			
			case 2:
				if ( p2p_config_format_seeding(2) == 0) return;
				
				P2P_MODIFY_CONFIG[6] = "2";
				P2P_MODIFY_CONFIG[7] = $("#apps_p2pdownloadsConfigureSeedingRatio_text").val();
				P2P_MODIFY_CONFIG[8] = "";
			break;
			
			default:
				P2P_MODIFY_CONFIG[6] = "0";
				P2P_MODIFY_CONFIG[7] = "";
				P2P_MODIFY_CONFIG[8] = "";
			break;
		}
		
		$("#P2P_Config_Set2").hide();
		$("#P2P_Config_Set3").show();
	});	
	
	$("#apps_p2pdownloadsConfigureBack3_button").click(function(){
		$('#P2P_Config_Set3').hide();
		$('#P2P_Config_Set2').show();
	});	
	
	$("#apps_p2pdownloadsConfigureNext3_button").click(function(){
		
		if ($("#apps_p2pdownloadsConfigureDownloadRate_text").val() != "")
		{
			if ( p2p_config_format_Bandwidth_Control($("#apps_p2pdownloadsConfigureDownloadRate_text").val()) == 0) return;
		}
		
		if ($("#apps_p2pdownloadsConfigureUploadRate_text").val() != "")
		{
			if ( p2p_config_format_Bandwidth_Control($("#apps_p2pdownloadsConfigureUploadRate_text").val()) == 0) return;
		}
		
		P2P_MODIFY_CONFIG[0] = $("#f_p2p_config_path").attr('rel');
		P2P_MODIFY_CONFIG[9] = getSwitch('#apps_p2pdownloadsConfigureEncryption_switch');
		P2P_MODIFY_CONFIG[12] = ($("#apps_p2pdownloadsConfigureDownloadRate_text").val() == "")? "-1":$("#apps_p2pdownloadsConfigureDownloadRate_text").val();
		P2P_MODIFY_CONFIG[13] = ($("#apps_p2pdownloadsConfigureUploadRate_text").val() == "")? "-1":$("#apps_p2pdownloadsConfigureUploadRate_text").val();
		
		var curnt_hd_index = P2P_CURRENT_CONFIG[0].toString().replace(/\/P2P\/incomplete/g,"");
		var change_path = (P2P_MODIFY_CONFIG[0].toString() == curnt_hd_index)? 0:1;
		if (change_path == 1)
		{
			jConfirm('M', _T('_p2p','desc8'), _T('_common','warning') ,"warning" ,function(r){
				if(r)
				{
					setTimeout(function(){
						p2p_config_save(change_path);
					},200);
				}
    	});	//end of jConfirm
		}
		else
		{
			p2p_config_save(change_path);
		}	
	});	
}
function p2p_config_save(change_path)
{
	wd_ajax({
			url:"/cgi-bin/p2p.cgi",
			type:"POST",
			data:{cmd:'p2p_set_config',
				f_auto_download:P2P_MODIFY_CONFIG[10],
				f_port_custom:P2P_MODIFY_CONFIG[1],
				f_port:P2P_MODIFY_CONFIG[2],
				f_bandwidth_auto:P2P_MODIFY_CONFIG[3],
				f_bandwidth_upload_rate:P2P_MODIFY_CONFIG[12],
				f_bandwidth_download_rate:P2P_MODIFY_CONFIG[13],
				f_seed_type:P2P_MODIFY_CONFIG[6],
				f_stop_seed_min:P2P_MODIFY_CONFIG[8],
				f_stop_seed_ratio:P2P_MODIFY_CONFIG[7],
				f_hdd_list:P2P_MODIFY_CONFIG[0],
				f_encryption:P2P_MODIFY_CONFIG[9],
				f_flow_control_schedule_max_download_rate:P2P_MODIFY_CONFIG[12],
				f_flow_control_schedule_max_upload_rate:P2P_MODIFY_CONFIG[13],
				//f_flow_control_schedule:P2P_MODIFY_CONFIG[14],
				f_hdd_list_flag:change_path
			},
			async:false,
			cache:false,
			dataType:"xml",
			success:function(xml){
				
					$("#P2PDiag").overlay().close();
					
//					INTERNAL_DIADLOG_BUT_UNBIND("P2PDiag");
//					INTERNAL_DIADLOG_DIV_HIDE("P2PDiag");
					
					p2p_config_get_config();
					p2p_download_active_scheduing();
		
			}//end of success
		});	
}
function p2p_downloads_get_url_status(idx)
{
	//0->ok,2->error,4->url server,6->dns timeout,
	wd_ajax({
			url:"/cgi-bin/p2p.cgi",
			type:"POST",
			data:{cmd:'p2p_get_url_state',f_temp_key:idx},
			async:false,
			cache:false,
			dataType:"xml",
			success:function(xml){
				var my_res = $(xml).find('res').text();
				var _html = "";
				
				if (parseInt(my_res) != 1)	
				{
					clearInterval(refreshId);
					 
					switch(parseInt(my_res))
					{
						case 0:// ok
							_html = _T('_p2p','desc9'); //Text:Successfully added.
						break;
						
						case 4://url server
						case 6://dns timeout
							_html = _T('_download','fail')+"("+_T('_format','error_code')+":"+my_res+")"; //Text:Fail(Error Code:xx).
						break;
						
						case 101://Failed to add this torrent file. The torrent file is invalid or duplicate.
						case 104:
							_html = _T('_p2p','msg21');
						break;
							
						case 102://Failed to add this torrent file. The My Cloud system does not have enough free space.
						case 103:
							_html = _T('_p2p','msg22');
						break;
						
						default://error
							_html = _T('_download','fail')+"."; //Text:Fail
						break;
					}
					
					$("#tr_p2p_download_get_url_status_wait").hide();
					$("#tr_p2p_download_get_url_status_desc").show();
					$("#tr_p2p_download_get_url_status_url").show();
					
					$("#p2p_download_get_url_status_url").html($("#f_torrent_url").val());
					$("#p2p_download_get_url_status_desc").html(_html);
					
					$("#f_torrent_url").attr('value','');
				}	
			}
		});
	
}
var refreshId = -1;
function p2p_download_add_url_diag(f_torrent_url)
{
	wd_ajax({
			url:"/cgi-bin/p2p.cgi",
			type:"POST",
			data:{cmd:'p2p_add_torrent_url',f_torrent_url:f_torrent_url},
			async:false,
			cache:false,
			dataType:"xml",
			success:function(xml){
				var my_res = $(xml).find('res').text();
				if (parseInt(my_res) == 1)
				{
					var my_id = $(xml).find('key_number').text();
					refreshId = setInterval("p2p_downloads_get_url_status('"+my_id+"')", 5000);
				}
			}
		});
		
	$("#P2PDiag_title").html(_T('_p2p','status'));	
	adjust_dialog_size("#P2PDiag", 650, "");
	var P2PDiag_obj=$("#P2PDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	INTERNAL_DIADLOG_DIV_HIDE('P2PDiag');
	$('#P2P_Downloads_Add_URL').show();
	
	init_button();
	$("input:text").inputReset();
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
var _jScrollPane = "";
function p2p_downloads_detail_diag(idx)
{
	if (timeoutId != 0) clearTimeout(timeoutId);
	$("#P2PDiag_title").html(_T('_p2p','p2p_detail'));
	
	wd_ajax({
			url:"/cgi-bin/p2p.cgi",
			type:"POST",
			data:{cmd:"p2p_detail_torrent",f_torrent_index:idx},
			async:false,
			cache:false, 
			dataType:"json",
            success: function(r)
			{   
			   $('#p2p_torrent_detail_text').empty();	
			   
			   if (parseInt(r.result) == 1)
			   {  
				    var my_html = "<table border='0'>";
				    my_html += "<tr><td>" + "<b>" + _T('_p2p','torrent') +"</b> : "+ r.name + "</td></tr>";  
				    var str = r.detail;
				    var my_str = str.split("<br>");
				  
				    for(var i=0;i<my_str.length;i++)
				    {
				    	my_html += "<tr><td>"+my_str[i].toString()+"</td></tr>";
				    }
				    my_html += "<tr><td height='50px'>&nbsp;</td></tr>";
				    my_html += "</table>";
				    $('#p2p_torrent_detail_text').html( my_html);
				   
				    setTimeout(function() {
		    			 _jScrollPane = $("#P2P_Downloads_Detail .scroll-pane").jScrollPane();
					}, 50);
               }  
			}
	});
	
	var P2PDiag_obj=$("#P2PDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	INTERNAL_DIADLOG_DIV_HIDE('P2PDiag');
	$('#P2P_Downloads_Detail').show();
	
	init_button();
	$("input:text").inputReset();
	language();
	P2PDiag_obj.load();
	
	$("#P2PDiag .close").click(function(){
		var api = _jScrollPane.data('jsp');
		api.destroy();
		
		P2PDiag_obj.close();
		$("#p2p_downloads_list").flexReload();
		
		INTERNAL_DIADLOG_BUT_UNBIND("P2PDiag");
		INTERNAL_DIADLOG_DIV_HIDE("P2PDiag");
		
	});
}
function p2p_downloads_torrent_schedule_type(typ)
{
   (typ ==  "daily")? $('#tr_torrent_schedule_stop_time').show():$('#tr_torrent_schedule_stop_time').hide();
}
function num_transform_string(num)	// 9 -> 09
{
	if (parseInt(num) < 10)
		var str = "0"+num;
	
	return str;
}
function p2p_downloads_torrent_schedule_check()
{
	var tmp="";
	var tmp_type = $("#p2p_download_scheduling_type").attr('rel');
	var now = new Date();
	var tmp_start_year = now.getFullYear();
	var tmp_start_month = num_transform_string(now.getMonth() + 1);
	var tmp_start_day = now.getDate();
	var tmp_start_hour = $("#p2p_download_scheduling_start_hour").attr('rel');
	var tmp_start_min = $("#p2p_download_scheduling_start_min").attr('rel');
	
	var today = new Date();
	var scheduling = new Date();
	scheduling.setHours(tmp_start_hour);
	scheduling.setMinutes(tmp_start_min);
	
	tmp = tmp_start_hour + tmp_start_min;
	$("#scheduling_f_start_time").attr('value',tmp);    
	
      if ( tmp_type == "daily")
      {                     
        	wd_ajax({
				url: "/cgi-bin/download_mgr.cgi",
				type: "POST",
	      data:{cmd:'cgi_downloads_now'},
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml)
				{    
				    var sys_hour = parseInt($(xml).find('hour').text());
				    var sys_mins = parseInt($(xml).find('mins').text());
				    
				    today.setHours(sys_hour);
				    today.setMinutes(sys_mins);
				}
		});
        
        if ( (scheduling.getTime() - today.getTime()) < 0)
        {
        	jAlert( _T('_p2p','msg20'), "warning");	//Text: The start time have to behind current time.
            return 1;
        }
       
        var tmp_stop_year = now.getFullYear();
        var tmp_stop_month = num_transform_string(now.getMonth() + 1);
        var tmp_stop_day = now.getDate();
        var tmp_stop_hour = $("#scheduling_f_stop_hour").find(":selected").val();
        var tmp_stop_min  = $("#scheduling_f_stop_min").find(":selected").val();
        
        if ( (tmp_start_hour == tmp_stop_hour) && ( tmp_start_min == tmp_stop_min))
        {
                jAlert( _T('_p2p','msg12'), _T('_common','error'));	//Text: Daily download duration must limit in 23:59.
                return 1;
        } 
         
        tmp = tmp_stop_hour + tmp_stop_min ;	
		$("#scheduling_f_stop_time").attr('value',tmp); 
		return 0; 
    }
    else
        return 0;        
}
function p2p_downloads_torrent_scheduing(idx)
{
	$("#P2PDiag_title").html(_T('_p2p','torrent_scheduling'))
	adjust_dialog_size("#P2PDiag",500,"");
	
	wd_ajax({
			url: "/cgi-bin/p2p.cgi",
			type: "POST",
			data: {cmd:"p2p_get_torrent_scheduling",f_torrent_index:idx},
			async: false,
			cache:false,
			dataType:"xml",
			success: function(xml)
			{
			    var my_state = $(xml).find('result').text();
			    
			    if (parseInt(my_state) == 1)
			    {
				       var str =  "<b>" + _T('_p2p','torrent') + "</b> : " + $(xml).find('name').text();
                       $("#scheduling_torrent_name").html(str);
                       
                        //type
                        var f_type = $(xml).find('f_type').text();
                        
                        if ( f_type == "none" )// not setting
                        {
                            $("#p2p_download_scheduling_type").html(_T("_common","none"));
                            $("#p2p_download_scheduling_type").attr("rel","none");
                            
                            //start time - hh
                            $("#p2p_download_scheduling_start_hour").html("00");
                            $("#p2p_download_scheduling_start_hour").attr("rel","00")
                            
                            //start time - mm
                            $("#p2p_download_scheduling_start_min").html("00");
                            $("#p2p_download_scheduling_start_min").attr("rel","00");
                            
                            //stop time - hh
                            $("#p2p_download_scheduling_stop_hour").html("00");
                            $("#p2p_download_scheduling_stop_hour").attr("rel","00");
                            
                            //stop time - mm
                            $("#p2p_download_scheduling_stop_min").html("00");
                            $("#p2p_download_scheduling_stop_min").attr("rel","00");
                            
                            $('#tr_torrent_schedule_stop_time').hide();	
                        }
                        else    
                        { 
                            if (parseInt(f_type) == 0)// none
                            {
                                $("#p2p_download_scheduling_type").html(_T("_common","none"));
                            	$("#p2p_download_scheduling_type").attr('rel','none');	
                                $('#tr_torrent_schedule_stop_time').hide();	
                            }
                            else    //daily
                            {
                            	$("#p2p_download_scheduling_type").html(_T("_p2p","daily"));
                            	$("#p2p_download_scheduling_type").attr('rel','daily');
                                $('#tr_torrent_schedule_stop_time').show();	
                            }
    				            
    				        //start time - hours
    				        str = $(xml).find('st_hours').text();
    				        $("#p2p_download_scheduling_start_hour").html(str);
    				        $("#p2p_download_scheduling_start_hour").attr('rel',str);
    				         
    				        //start time - min
    				        str = $(xml).find('st_min').text();
    				        $("#p2p_download_scheduling_start_min").html(str);
    				        $("#p2p_download_scheduling_start_min").attr('rel',str);
    				        
    				        //stop time
    				        if (parseInt(f_type) == 1)
    				        {
    				        	//stop time - hh
    				        	str = $(xml).find('stp_hours').text();
	                            $("#p2p_download_scheduling_stop_hour").html(str);
	                            $("#p2p_download_scheduling_stop_hour").attr("rel",str);
	                            
	                            //stop time - mm
	                            str = $(xml).find('stp_min').text();
	                            $("#p2p_download_scheduling_stop_min").html(str);
	                            $("#p2p_download_scheduling_stop_min").attr("rel",str);
    				        }
    				    }
                }    
			}
	});
	
	var P2PDiag_obj=$("#P2PDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	INTERNAL_DIADLOG_DIV_HIDE('P2PDiag');
	$('#P2P_Downloads_Tottent_Scheduling').show();
	
	init_select();
	init_button();
	$("input:text").inputReset();
	hide_select();
	
	language();
	
	P2PDiag_obj.load();
	
	$("#P2PDiag .close").click(function(){
		adjust_dialog_size("#P2PDiag",750,"");
		INTERNAL_DIADLOG_BUT_UNBIND("P2PDiag");
		INTERNAL_DIADLOG_DIV_HIDE("P2PDiag");
		P2PDiag_obj.close();
	});
	
	$("#apps_p2pdownloadsQueueSchedulingSave_button").click(function(){
		
		if(p2p_downloads_torrent_schedule_check() == 1) return;
		
		var f_type = $("#p2p_download_scheduling_type").attr('rel');
		var start_time = $("#p2p_download_scheduling_start_hour").attr('rel')+$("#p2p_download_scheduling_start_min").attr('rel');
		var stop_time = $("#p2p_download_scheduling_stop_hour").attr('rel')+$("#p2p_download_scheduling_stop_min").attr('rel');
	
		wd_ajax({
				url: "/cgi-bin/p2p.cgi",
				type: "POST",
	            data:{cmd:'p2p_torrent_scheduling_set',f_torrent_index:idx,f_type:f_type,f_start_time:start_time,f_stop_time:stop_time},
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml)
				{    
				    
				    var my_state = $(xml).find('result').text();
				    if (parseInt(my_state) == 1)
				    {
				      INTERNAL_DIADLOG_BUT_UNBIND("P2PDiag");
					  INTERNAL_DIADLOG_DIV_HIDE("P2PDiag");
					  _DIALOG = "";
					  	
				      P2PDiag_obj.close();	
					  $("#p2p_downloads_list").flexReload();
	                }    
				}
		});
	});
}