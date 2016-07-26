var snmpObj="";
var SNMP_ORG_MODE;
var SNMP_MODE;
var SNMP_V3_MODIFY_MODE;			// "ADD" or "EDIT"
var SNMP_V3_UID;					// for Edit
var SNMP_V3_USERS;					// for check user name repeate

// for grid field width
var GRID_COL1="0";
var GRID_COL2="300";
var GRID_COL3="110";
var GRID_COL4="0";
var GRID_COL5="0";
var GRID_COL6="80";
var GRID_COL7="80";

// title
var SNMP_TITLE=_T('_snmp','title_1');//"SNMP Settings";//_T('_snmp','enable')+" "+_T('_menu_title','settings');
var SNMPv3_TITLE=_T('_snmp','title_2');//"User Management (SNMPv3)";
var SNMPv3_DETAIL_TITLE=_T('_snmp','title_3');//"SNMPv3 User Details";

// dialog size
var v2DiagHighSize;
var v2DiagHighSize1=430;
var v2DiagHighSize2=480;
var v2FieldHighSize=46;

var v3ListDiagWidthSize=730;
var v3ListDiagHighSize=415;
var v3DiagWidthSize=730;
var v3DiagHighSize1=300;
var v3DiagHighSize2=435;
var v3DiagHighSize3=570;

// security level
var security_level_1="NoAuthNoPriv";
var security_level_2="AuthNoPriv";
var security_level_3="AuthPriv";

// Auth type
var auth_type_md5="MD5";
var auth_type_sha="SHA";

// Encry type
var encry_type_des="DES";
var encry_type_aes="AES";

// View
var view_system=_T('_snmp','view_system');//"System";
var view_network=_T('_snmp','view_network');//"Network";
var view_all=_T('_snmp','view_all');//"All";

function ready_snmp()		// jacky
{
	// get overlay obj
	snmpObj=$("#snmpDiag_v3").overlay({fixed:false,oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
					onClose: function() {
			}});
			
	// set main switch button
	get_snmp_switch();
	
	$("#settings_networkSNMPv3DownloadMID_text").text(_T('_wfs','download')+" MIB");
	
	// init button
	$("#settings_networkSnmpUserManagement_button").click(function(){	
		get_snmp_diag_v3_info();
		$("#snmpDiag_set_main").hide();
		show_v3_lists_diag();
	});
	$("#settings_snmpV3CancelPhase2_button").click(function(){
		show_main_diag();
		$("#snmpDiag_set_v3").hide();
	});
	$("#settings_networkSnmpV3Close_button").click(function(){	
		//save_snmp_v3();
		show_main_diag();
		$("#snmpDiag_set_v3").hide();
	});
	$("#settings_networkSnmpV3Add_button").click(function(){	
		SNMP_V3_MODIFY_MODE="ADD";
		get_v3_user_list();
		snmp_v3_diag_show();
	});	
	$("#settings_networkSnmpV3DetailCancel_button").click(function(){				
		$("#snmpDiag_set_v3_detail").hide();
		show_v3_lists_diag();
	});		
	$("#settings_networkSnmpV3DetailApply_button").click(function(){	
		if (check_v3_detail_field() == false)
			return;
		if (SNMP_V3_MODIFY_MODE == "ADD")	{
			add_snmp_v3_one_record();
		} else {
			update_snmp_v3_item();
		}
		get_snmp_diag_v3_info();
		$("#snmpDiag_set_v3_detail").hide();
		show_v3_lists_diag();
	});		
	$("#settings_networkSnmpMainApply_button").click(function(){
		// check notification fields
		if (check_main_field() == false)
			return;
			
		save_snmp_v2();

		setTimeout("get_snmp_switch()", 500);
		
		var over = $("#snmpDiag_v3").overlay({fixed:false,oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});
		over.close();				
			
		//show_snmb_link(1);
	});						
	$("#settings_networkSnmpNote_switch").click(function(){
		set_notification_switch();
		adjust_dialog_size("#snmpDiag_v3",v3DiagWidthSize, v2DiagHighSize);
	});
	

	// v3 dialog init
	write_snmp_v3_security_level();	
	write_snmp_v3_view_level();
}

function get_snmp_switch_xml()
{
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/xml/snmp.xml",
		dataType: "xml",
		success: function(xml){
			
			var snmp_enable = $(xml).find('snmp_enable').text();
			var snmp_enabled_level;
			
			if (snmp_enable == "0" || snmp_enable == "") {
				snmp_enabled_level = "off";
				$("#snmp_downloadMIB_tr").hide();
				//show_snmb_link(0);
			} else {
				$("#snmp_downloadMIB_tr").show();
				switch ($(xml).find('snmp_enable_level').text())	{
					case '3':
							snmp_enabled_level = "v3";
							break;
					case '4':
							snmp_enabled_level = "all";
							break;
					default:
							snmp_enabled_level = "v2";
				}
				//show_snmb_link(1);
			}
			
			SNMP_ORG_MODE = snmp_enabled_level;
			//alert(SNMP_ORG_MODE);
			
			// set button obj
			SetSnmpMode("#settings_networkSNMPv3_switch", snmp_enabled_level); 		
		},
		error:function(xmlHttpRequest,error){
			//alert("Error: " +error);
		}
	});
}

function get_snmp_switch()   // get NAS config fieled jacky
{
	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/snmp_mgr.cgi",
		data:"cmd=cgi_get_SNMP_switch",	
		dataType: "xml",
		success: function(xml){	
			// get snmp info
			get_snmp_switch_xml();
		}
		,
		 error:function(xmlHttpRequest,error){   
        		//alert("Get_User_Info->Error: " +error);   
  		 }  
	});		
}

// set switch button
function SetSnmpMode(obj,val)  // obj="#settings_networkSNMPv3_switch", val="off", "v2", "v3", "all"  + jacky
{	
	var snmp_mode;
	
	setSnmpSwitchSelectButton(obj,val);
	
	$( obj + " > button").unbind("click");
	
	$( obj + " > button").click(function(index){
		$($(obj+ " > button").removeClass('buttonSel'))
	
		$(this).addClass('buttonSel');
		$(obj).attr('rel',$(this).val());
	
		snmp_mode = $(this).val();
		if (snmp_mode != "off") {
			init_snmp_dialog(snmp_mode);
		} else if (snmp_mode != SNMP_ORG_MODE) { 
			save_snmp_off();
		}
	});
	
	$(obj).show();
}


function show_item(item)
{
	if (item  == 0)
	{
		$("#snmp_note_comm_tr").hide();
		$("#snmp_note_ip_tr").hide();
	}
	else
	{	
		$("#snmp_note_comm_tr").show();	
		$("#snmp_note_ip_tr").show();	
	}
}

function save_snmp_off()
{
	var url = "/cgi-bin/snmp_mgr.cgi?cmd=cgi_set_SNMP_off";

	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback			
	wd_ajax({
		type:"GET",
		url:url,
		cache:false,
		success: function(){
			setTimeout("get_snmp_switch()", 500);
			snmpObj.close();
			jLoadingClose();
		}
	});
}

function config_snmp()
{
	var snmpSel = $("#settings_networkSNMPv3_switch").attr("rel");
	init_snmp_dialog(snmpSel);
}

/*
function show_snmb_link(enable)
{
	if(enable=="1")
		$("#settings_networkSNMPPhase2_link").show();
	else
		$("#settings_networkSNMPPhase2_link").hide();
}
*/
