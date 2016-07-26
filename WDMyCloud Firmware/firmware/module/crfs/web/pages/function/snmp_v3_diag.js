function init_snmp_dialog(enabled_level)	
{
	init_button();
	language();
	
	SNMP_MODE = enabled_level;
	switch (enabled_level) {
		case "v3":
				$("#snmpMainDiag_v2_field").hide();
				$("#snmpMainDiag_v3_field").show();
				get_snmp_diag_v2_info();
				v2DiagHighSize = v2DiagHighSize1;
				break;
		case "v2":
				$("#snmpMainDiag_v2_field").show();
				$("#snmpMainDiag_v3_field").hide();
				get_snmp_diag_v2_info();
				
				v2DiagHighSize = v2DiagHighSize1;
				break;
		default:	// for all
				$("#snmpMainDiag_v2_field").show();
				$("#snmpMainDiag_v3_field").show();
				get_snmp_diag_v2_info();
				
				v2DiagHighSize = v2DiagHighSize2;
	}

	setSnmpSwitchSelectButton("#settings_networkSNMPv3_switch",SNMP_ORG_MODE);
}

function set_notification_switch(r) 
{
	var v = getSwitch('#settings_networkSnmpNote_switch');

	if (r != null)
		v = r;

	if( v==1) {
		show_item(1);	// set switch obj
		v2DiagHighSize = v2DiagHighSize + (v2FieldHighSize * 2);	// set dialog high size
	} else if ( v==0 ){
		show_item(0);	// set switch obj
		v2DiagHighSize = v2DiagHighSize - (v2FieldHighSize * 2);	// set dialog high size
	}
}

function save_snmp_v2()
{
	var community= $("#settings_networkSnmpCommunity_text").val().trim();
	var syslocation= $("#settings_networkSnmpSysLocation_text").val().trim();
	var syscontact= $("#settings_networkSnmpSysContact_text").val().trim();
	var notification_comm= $("#settings_networkSnmpNoteCommunity_text").val().trim();
	var ip = $('#snmp_tb input[name="settings_networkSnmpNoteIP_text"]').val().trim();
	var notification_enable =getSwitch('#settings_networkSnmpNote_switch');
	
	var snmp_level;
	if (SNMP_MODE == "v2")
		snmp_level = 2;
	else if (SNMP_MODE == "v3")
		snmp_level = 3;
	else
		snmp_level = 4;

	var url = "/cgi-bin/snmp_mgr.cgi?cmd=cgi_set_SNMP_v2" +
				"&f_enable=1" + 
				"&snmp_enabled_level=" + snmp_level +
				"&snmp_syslocation=" + encodeURIComponent(syslocation) +
				"&snmp_syscontact=" + encodeURIComponent(syscontact) +
				"&f_community=" + encodeURIComponent(community) +
				"&notification_community=" + encodeURIComponent(notification_comm)+
				"&notification_enable=" + notification_enable +
				"&ip=" + ip;
	//alert(url);

	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback			
	wd_ajax({
		type:"GET",
		url:url,
		cache:false,
		success: function(){
			snmpObj.close();
			jLoadingClose();
		}
	});
}


function get_snmp_diag_v2_info()
{
	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/snmp_mgr.cgi",
		data:"cmd=cgi_get_SNMP_v2_info",	
		dataType: "xml",
		success: function(xml){	
			get_snmp_diag_v2_info_xml();
		}
		,
		 error:function(xmlHttpRequest,error){   
        		//alert("Get_User_Info->Error: " +error);   
  		 }  
	});		
}

function get_snmp_diag_v2_info_xml()
{
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/xml/snmp.xml",
		dataType: "xml",
		success: function(xml){
			
			var v2_comm = $(xml).find('comm').text();
			var syslocation = $(xml).find('syslocation').text();
			var syscontact = $(xml).find('syscontact').text();
			var trap_enable = $(xml).find('trap_enable').text();
			var trap_comm = $(xml).find('trap_comm').text();
			var trap_server = $(xml).find('trap_server').text();
			
			// v2 community
			$("#settings_networkSnmpCommunity_text").val(v2_comm);
			
			// syslocation
			$("#settings_networkSnmpSysLocation_text").val(syslocation);
			
			// syscontact
			$("#settings_networkSnmpSysContact_text").val(syscontact);
			
			// set trap community
			$("#settings_networkSnmpNoteCommunity_text").val(trap_comm);
			
			// set notificatiion switch
			setSwitch('#settings_networkSnmpNote_switch',trap_enable);
			init_switch();
			show_item(trap_enable);		// show field by notification switch
			if ( trap_enable == 0)
				v2DiagHighSize = v2DiagHighSize - (v2FieldHighSize * 2);
			
			// notification IP
			var lan_tb = "#snmp_tb";
			$(lan_tb + " input[name='settings_networkSnmpNoteIP_text']").val(trap_server)
		
			// show main diag
			snmpObj.load();
			show_main_diag();		
		},
		error:function(xmlHttpRequest,error){
			//alert("Error: " +error);
		}
	});
}


function init_snmp_v3_diag()
{
	$("#settings_networkSnmpV3DetailUserName_text").val('');
	
	disp_snmp_v3_security_sel_level("noauth");
	reset_sel_item("#snmp_v3_security_level", security_level_1, "noauth"); //"NoAuthNoPriv"
	
	SetSnmpv3AuthBtm("#settings_networkSnmpV3DetailAuth_switch", auth_type_md5);
	$("#settings_networkSnmpV3DetailAuthPwd_text").val('');
	$("#settings_networkSnmpV3DetailAuthConfirmPwd_text").val('');
	
	SetSnmpv3AuthBtm("#settings_networkSnmpV3DetailEncry_switch", encry_type_des);
	$("#settings_networkSnmpV3DetailEncryPwd_text").val('');
	$("#settings_networkSnmpV3DetailEncryConfirmPwd_text").val('');

	reset_sel_item("#snmp_v3_view", view_system, "system");
	
	hide('settings_networkSnmpV3DetailDel_button');
}


function snmp_v3_diag_show()
{
	$("#snmpDiag_set_v3").hide();
	init_snmp_v3_diag();
	show_v3_detail_diag();
}

function get_snmpv3_one_record(uid, userName)
{
	// get one record by uid
	var url = "/cgi-bin/snmp_mgr.cgi?cmd=cgi_get_SNMPv3_one_record" +
				"&uid=" + uid;

	//jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback			
	wd_ajax({
		type:"GET",
		url:url,
		cache:false,
		success: function(){
			get_snmpv3_one_record_xml(userName);
		}
	});	
}

function get_snmpv3_one_record_xml(userName)
{
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/xml/snmp.xml",
		dataType: "xml",
		success: function(xml){
			
			var userid = $(xml).find('userid').text();
			var username = $(xml).find('username').text();
			var security_level = $(xml).find('security_level').text();
			var auth_type = $(xml).find('auth_type').text();
			var auth_pwd = $(xml).find('auth_pwd').text();
			var encry_type = $(xml).find('encry_type').text();
			var encry_pwd = $(xml).find('encry_pwd').text();
			var read_view_name = $(xml).find('read_view_name').text();
			
			
			//alert(userid);
			//alert(username);
			//alert(security_level);
			//alert(auth_type);
			//alert(auth_pwd);
			//alert(encry_type);
			//alert(encry_pwd);
			//alert(read_view_name);*/
			
			SNMP_V3_MODIFY_MODE="EDIT";
			get_v3_user_list(userName);
	
			// show v3 detail dialog
			snmp_v3_diag_show();
			// fill in detail diag
			$("#settings_networkSnmpV3DetailUserName_text").val(username);		// user name
			
			disp_snmp_v3_security_sel_level(security_level);	// security level
			reset_sel_item("#snmp_v3_security_level", get_snmp_v3_text(security_level), security_level);
			
			if (auth_type.trim() == '')
				auth_type = auth_type_md5;
			SetSnmpv3AuthBtm("#settings_networkSnmpV3DetailAuth_switch", auth_type);		// auth
			$("#settings_networkSnmpV3DetailAuthPwd_text").val(auth_pwd);								// auth pwd
			$("#settings_networkSnmpV3DetailAuthConfirmPwd_text").val(auth_pwd);								// auth pwd
			
			if (encry_type.trim() == '')
				encry_type = encry_type_des;
			SetSnmpv3AuthBtm("#settings_networkSnmpV3DetailEncry_switch", encry_type);	// encry
			$("#settings_networkSnmpV3DetailEncryPwd_text").val(encry_pwd);							// encry pwd
			$("#settings_networkSnmpV3DetailEncryConfirmPwd_text").val(encry_pwd);							// encry pwd
			

			reset_sel_item("#snmp_v3_view", get_snmp_v3_text(read_view_name), read_view_name);		// view
				
			// show delete button
			SNMP_V3_UID = userid;
			show('settings_networkSnmpV3DetailDel_button');
		},
		error:function(xmlHttpRequest,error){
			//alert("Error: " +error);
		}
	});
	
}

function snmp_v3_detail_del()
{
	jConfirm('M',_T('_snmp','msg15'),_T('_user','del_user_title'),"snmp",function(r){
		if(r)
		{
			// get one record by uid
			var url = "/cgi-bin/snmp_mgr.cgi?cmd=cgi_SNMPv3_delete_one_record" +
						"&uid=" + SNMP_V3_UID;

			wd_ajax({
				type:"GET",
				url:url,
				cache:false,
				success: function(){
					get_snmp_diag_v3_info();
					$("#snmpDiag_set_v3_detail").hide();
						show_v3_lists_diag();
				}
			});	
		}
    });
}

function update_snmp_v3_item()
{
	var data_len=0, row_count=0;
	var v3_data="";

	var uid = SNMP_V3_UID;
	var username = $("#settings_networkSnmpV3DetailUserName_text").val();
	var security_level = $("#snmp_v3_security_level_val").attr('rel');
	var auth = $("#settings_networkSnmpV3DetailAuth_switch").attr("rel");
	var auth_pwd = $("#settings_networkSnmpV3DetailAuthPwd_text").val();
	var encry = $("#settings_networkSnmpV3DetailEncry_switch").attr("rel");
	var encry_pwd = $("#settings_networkSnmpV3DetailEncryPwd_text").val();
	var view = $("#snmp_v3_view_val").attr('rel');
	
	switch (security_level) {
		case 'noauth':
			auth = "";
			auth_pwd = "";
			encry = "";
			encry_pwd = "";
			break;
		case 'auth':
			encry = "";
			encry_pwd = "";
			break;
	}

	v3_data = "<item id=0>";
	v3_data = v3_data + "<cell>" + username.trim() + "</cell>";
	v3_data = v3_data + "<cell>" + security_level.trim() + "</cell>";
	v3_data = v3_data + "<cell>" + auth.trim() + "</cell>";
	v3_data = v3_data + "<cell>" + auth_pwd.trim() + "</cell>";
	v3_data = v3_data + "<cell>" + encry.trim() + "</cell>";
	v3_data = v3_data + "<cell>" + encry_pwd.trim() + "</cell>";
	v3_data = v3_data + "<cell>" + view.trim() + "</cell>";
	v3_data = v3_data + "<cell>" + uid.trim() + "</cell>";
	v3_data = v3_data + "</item>";
		
	//alert(v3_data);
	var url = "/cgi-bin/snmp_mgr.cgi";

	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback			
	wd_ajax({
		type:"POST",
		url:url,
			data:{cmd:'cgi_SNMPv3_modify_one_record',row_count:row_count,data_len:v3_data.length,data:v3_data},
			async:false,
			cache:false,
			dataType:"text",
			success: function(){
				jLoadingClose();
		}
	});

}

function get_snmp_v3_text(find_text)
{
	var get_text="";
	
	switch (find_text) {
		case "noauth":
			get_text = security_level_1; // "NoAuthNoPriv"
			break;
		case "auth":
			get_text = security_level_2; //"AuthNoPriv";	
			break;
		case "priv":
			get_text = security_level_3; //"AuthPriv";	
			break;
		case "system":
			get_text = view_system; // "System"; 
			break;
		case "network":
			get_text = view_network; //"Network"; 
			break;
		case "all":
			get_text = view_all; // "All"
			break;
		default:
			get_text = find_text;
	}

	return get_text;
}

function write_snmp_v3_security_level()
{
	//var sel_text = 'NoAuthNoPriv'; //_T('_lan','auto');
	var option = "";
		option += '<ul>';
		option += '	<li class="option_list">';          
		option += '		<div id="snmp_v3_security_level" class="wd_select option_selected">';
		option += '			<div class="sLeft wd_select_l"></div>';
		option += '			<div class="sBody text wd_select_m" id="snmp_v3_security_level_val"></div>';			// set default
		option += '			<div class="sRight wd_select_r"></div>';
		option += '		</div>';						
		option += '		<ul class="ul_obj">'; 
		option += '			<li rel="noauth" class="li_start"> <a href="#" onclick=\'disp_snmp_v3_security_sel_level("noauth");\'>' + security_level_1 + "</a></li>";
		option += '			<li rel="auth"> <a href="#" onclick=\'disp_snmp_v3_security_sel_level("auth");\'>' + security_level_2 + "</a></li>";
		option += '			<li rel="priv" class="li_end"> <a href="#" onclick=\'disp_snmp_v3_security_sel_level("priv");\'>' + security_level_3 + "</a></li>";
		option += '		</ul>';
		option += '	</li>';
		option += '</ul>';

		$("#settings_networkSnmpV3DetailSecLevel_select").html(option);	
		
		reset_sel_item("#snmp_v3_security_level", security_level_1, "noauth");
}

function disp_snmp_v3_security_sel_level(rel)
{
	switch(rel) {
		case "noauth":
			// hide auth and priv
			$("#auth_tr").hide();
			$("#auth_pw_tr").hide();
			$("#auth_confirm_pw_tr").hide();
			
			$("#encry_tr").hide();
			$("#encry_pw_tr").hide();
			$("#encry_confirm_pw_tr").hide();
			
			adjust_dialog_size("#snmpDiag_v3", v3DiagWidthSize, v3DiagHighSize1);
			break;
		case "auth":
			// show auth and hide priv
			$("#auth_tr").show();
			$("#auth_pw_tr").show();
			$("#auth_confirm_pw_tr").show();
			
			$("#encry_tr").hide();
			$("#encry_pw_tr").hide();
			$("#encry_confirm_pw_tr").hide();
			
			adjust_dialog_size("#snmpDiag_v3", v3DiagWidthSize, v3DiagHighSize2);
			break;
		case "priv":
			// show auth and priv
			$("#auth_tr").show();
			$("#auth_pw_tr").show();
			$("#auth_confirm_pw_tr").show();
			
			$("#encry_tr").show();
			$("#encry_pw_tr").show();
			$("#encry_confirm_pw_tr").show();
			
			adjust_dialog_size("#snmpDiag_v3", v3DiagWidthSize, v3DiagHighSize3);
			break;
		default:
	}
}

function write_snmp_v3_view_level()
{
	//var sel_text = 'System'; //_T('_lan','auto');

	var option = "";
		option += '<ul>';
		option += '<li class="option_list">';          
		option += '<div id="snmp_v3_view" class="wd_select option_selected">';
		option += '<div class="sLeft wd_select_l"></div>';
		option += '<div class="sBody text wd_select_m" id="snmp_v3_view_val"></div>';
		option += '<div class="sRight wd_select_r"></div>';
		option += '</div>';						
		option += '<ul class="ul_obj">'; 
		option += '<li rel="system"> <a href="#" onclick=\'\'>' + view_system + "</a></li>";
		option += '<li rel="network"> <a href="#" onclick=\'\'>' + view_network + "</a></li>";
		option += '<li rel="all"> <a href="#" onclick=\'\'>' + view_all + "</a></li>";
		option += '</ul>';
		option += '</li>';
		option += '</ul>';
		
		$("#settings_networkSnmpV3DetailView_select").html(option);	
			
		reset_sel_item("#snmp_v3_view", view_system, "system");
}

function get_snmp_diag_v3_info()
{
	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/snmp_mgr.cgi",
		data:"cmd=cgi_get_SNMP_v3_info",	
		dataType: "xml",
		success: function(xml){	
			get_snmp_diag_v3_info_xml();
		}
		,
		 error:function(xmlHttpRequest,error){   
        		//alert("Get_User_Info->Error: " +error);   
  		 }  
	});		
}

function get_snmp_diag_v3_info_xml()
{
	$("#snmp_v3_tb").flexReload();  // dBase reload
	//show('snmp_v3_list_tb');

	$("#snmp_v3_tb").flexigrid({				
		url: '/xml/snmp.xml',		
		dataType: 'xml',
		colModel : [		
			{display: 'uid_hide', name : 'uid_hide', width : GRID_COL1, sortable : true, align: 'center'},																
			{display: _T('_snmp','username'), name : 'username', width : GRID_COL2, sortable : true, align: 'left'},
			{display: _T('_snmp','security_level'), name : 'security_level', width : GRID_COL3, sortable : true, align: 'center'},
			{display: 'auth_type', name : 'auth_type', width : GRID_COL4, sortable : true, align: 'center', hide : true},
			{display: 'encry_type', name : 'encry_type', width : GRID_COL5, sortable : true, align: 'center', hide : true},
			{display: _T('_snmp','read_view_name'), name : 'read_view_name', width :  GRID_COL6, sortable : true, align: 'center'},																
			{display: 'edit', name : 'edit', width :  GRID_COL7, sortable : true, align: 'center'}															
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
		noSelect:true,
		resizable:false,
		rpOptions: [40],
		preProcess:function(r)  // return xml and preProcess, r:retrun's xml, process result send to colModel
		{		
			return r;
		},
		
        onSuccess:function(){
			SNMP_V3_USERS = "";
        	$('#snmp_v3_tb > tbody > tr').each(function(index){		

				// tooptip for user name
        		$('#snmp_v3_tb > tbody > tr:eq('+index+') td:eq(1) div').addClass('tip').attr('title',$('#snmp_v3_tb > tbody > tr:eq('+index+') td:eq(1) div').text());;

				// move 'read_view_name' to 'hide_view' for multi-language, 'read_view_name' put multi-language text, 'hide_view' put in dBase value.
        		$('#snmp_v3_tb > tbody > tr:eq('+index+') td:eq(5) div').text(get_snmp_v3_text($('#snmp_v3_tb > tbody > tr:eq('+index+') td:eq(5) div').text()));
 
				// move 'security_level' to 'hide_security_level' for multi-language, 'security_level' put multi-language text, 'hide_security_level' put in dBase value.
        		$('#snmp_v3_tb > tbody > tr:eq('+index+') td:eq(2) div').text(get_snmp_v3_text($('#snmp_v3_tb > tbody > tr:eq('+index+') td:eq(2) div').text()));

				// Edit
				$('#snmp_v3_tb > tbody > tr:eq('+index+') td:eq(6) div').html("<a class='edit_detail_x1' href='javascript:get_snmpv3_one_record(\"" + $('#snmp_v3_tb > tbody > tr:eq('+index+') td:eq(0) div').text() + "\", \"" + $('#snmp_v3_tb > tbody > tr:eq('+index+') td:eq(1) div').text() + "\" );'>" + _T('_snmp','edit') + "</a>");

				// clear field uid_hide data 
				$('#snmp_v3_tb > tbody > tr:eq('+index+') td:eq(0)').html("<div style='text-align: center; width: 15px;'><span style='display:none'></div>");

			});      
			init_tooltip('.tip');
        }
	});
	
}

function get_v3_user_list(ignoreUser)
{
	var	userName;
	
	SNMP_V3_USERS="";
	
	$('#snmp_v3_tb > tbody > tr').each(function(index){		
		userName = $('#snmp_v3_tb > tbody > tr:eq('+index+') td:eq(1) div').text();
		if (userName != ignoreUser)
		{
			// collect user name for check repeate
			SNMP_V3_USERS = SNMP_V3_USERS + userName + ',';
		}
	});  
	//alert(SNMP_V3_USERS);
}


// for save lists(more items)
function add_snmp_v3_one_record()
{
	var data_len=0, row_count=0;
	var v3_data="";

	var username = $("#settings_networkSnmpV3DetailUserName_text").val();
	var security_level = $("#snmp_v3_security_level_val").attr('rel');
	var auth = $("#settings_networkSnmpV3DetailAuth_switch").attr("rel");
	var auth_pwd = $("#settings_networkSnmpV3DetailAuthPwd_text").val();
	var encry = $("#settings_networkSnmpV3DetailEncry_switch").attr("rel");
	var encry_pwd = $("#settings_networkSnmpV3DetailEncryPwd_text").val();
	var view = $("#snmp_v3_view_val").attr('rel');
	
	switch (security_level) {
		case 'noauth':
			auth = "";
			auth_pwd = "";
			encry = "";
			encry_pwd = "";
			break;
		case 'auth':
			encry = "";
			encry_pwd = "";
			break;
	}


	v3_data = "<item id=0>";
	v3_data = v3_data + "<cell>" + username.trim() + "</cell>";
	v3_data = v3_data + "<cell>" + security_level.trim() + "</cell>";
	v3_data = v3_data + "<cell>" + auth.trim() + "</cell>";
	v3_data = v3_data + "<cell>" + auth_pwd.trim() + "</cell>";
	v3_data = v3_data + "<cell>" + encry.trim() + "</cell>";
	v3_data = v3_data + "<cell>" + encry_pwd.trim() + "</cell>";
	v3_data = v3_data + "<cell>" + view.trim() + "</cell>";
	v3_data = v3_data + "</item>";
		
	//alert(v3_data);
	var url = "/cgi-bin/snmp_mgr.cgi";

	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback			
	wd_ajax({
		type:"POST",
		url:url,
			data:{cmd:'cgi_set_SNMPv3_one_record',row_count:row_count,data_len:v3_data.length,data:v3_data},
			async:false,
			cache:false,
			dataType:"text",
			success: function(){
			//snmpObj.close();
			//_DIALOG="";
			jLoadingClose();
			//jAlert(_T('_common','update_success'), _T('_common','success'));
			
			//$("#snmp_v3_tb").flexReload();  // dBase reload
		}
	});

}

// set switch button
function SetSnmpv3AuthBtm(obj,val) //  + jacky
{	
	setSnmpSwitchSelectButton(obj,val);
	
	$( obj + " > button").unbind("click");
	$( obj + " > button").click(function(index){
		$($(obj+ " > button").removeClass('buttonSel'))
	
		$(this).addClass('buttonSel');
		$(obj).attr('rel',$(this).val());
	});
	
	$(obj).show();
}

function setSnmpSwitchSelectButton(obj,val) //  + jacky
{
	$(obj).attr('rel',val);	//init rel value
	$( obj + " > button").each(function(index){
		if($(this).val()==val) 
			$(this).addClass('buttonSel');
		else
			$(this).removeClass('buttonSel');
	});
}

function show_main_diag()
{
	adjust_dialog_size("#snmpDiag_v3",v3DiagWidthSize, v2DiagHighSize);
	$("#snmpDiag_v3").center();	
	
	$("#snmpDiag_title_v3").html(SNMP_TITLE);	// set title
	$("#snmpDiag_set_main").show();
}

function show_v3_lists_diag()
{
	setTimeout("init_scroll('.scrollbar_snmp')", 500);
	adjust_dialog_size("#snmpDiag_v3",v3ListDiagWidthSize, v3ListDiagHighSize);
	$("#snmpDiag_v3").center();	
	
	$("#snmpDiag_title_v3").html(SNMPv3_TITLE);
	$("#snmpDiag_set_v3").show();
}

function show_v3_detail_diag()
{
	adjust_dialog_size("#snmpDiag_v3", v3DiagWidthSize, v3DiagHighSize1);
	$("#snmpDiag_v3").center();	
	
	$("#snmpDiag_title_v3").html(SNMPv3_DETAIL_TITLE);
	$("#snmpDiag_set_v3_detail").show();
}

function check_main_field()
{
	// Location
	var val = $("#settings_networkSnmpSysLocation_text").val();

	/*if (val.indexOf(" ") != -1) //find the  blank space
 	{
 		jAlert(_T('_snmp','msg6'), _T('_common','error'),"",function(){$("#settings_networkSnmpSysLocation_text").focus()});	// The Location cannot contain spaces.
 		return false;
 	}*/

	if((val.indexOf("`") != -1)/* || (val.indexOf("\\") != -1)*/)
	{
		jAlert(_T('_snmp','msg6'), _T('_common','error'),"",function(){$("#settings_networkSnmpSysLocation_text").focus()});	/* The Location cannot include the following characters:  ` \ */
		return false;
	}

	// Contact Information
	val = $("#settings_networkSnmpSysContact_text").val();

	/*if (val.indexOf(" ") != -1) //find the  blank space
 	{
 		
 		jAlert(_T('_snmp','msg7'), _T('_common','error'),"",function(){$("#settings_networkSnmpSysContact_text").focus()}); // Contact Information must not contain spaces.
 		return false;
 	}*/
	//if((val.indexOf("@") != -1) || (val.indexOf(":") != -1) || (val.indexOf("/") != -1) || (val.indexOf("\\") != -1) || (val.indexOf("%") != -1))
	if((val.indexOf("`") != -1) /*|| (val.indexOf("\\") != -1)*/)
	{
		jAlert(_T('_snmp','msg7'), _T('_common','error'),"",function(){$("#settings_networkSnmpSysContact_text").focus()}); /* The Contact Information must not include the following characters:  ` \  */
		return false;
	}

	var notification_enable = getSwitch('#settings_networkSnmpNote_switch');
	if(notification_enable=="1")
	{
		// Notification Community
		val = $("#settings_networkSnmpNoteCommunity_text").val();
		if (val.length==0)
	 	{
			jAlert(_T('_snmp','msg8'), _T('_common','error'),"",function(){$("#settings_networkSnmpNoteCommunity_text").focus()});	// Notification Community length should be 1-255.
	 		return false;
	 	}
		if (val.indexOf(" ") != -1) //find the  blank space
	 	{
	 		//SNMP community must not contain spaces.
	 		jAlert(_T('_snmp','msg8'), _T('_common','error'),"",function(){$("#settings_networkSnmpNoteCommunity_text").focus()});	// Notification Community must not contain spaces.
	 		return false;
	 	}
		//if((val.indexOf("@") != -1) || (val.indexOf(":") != -1) || (val.indexOf("/") != -1) || (val.indexOf("\\") != -1) || (val.indexOf("%") != -1))
		if((val.indexOf("`") != -1) || (val.indexOf("\\") != -1))
		{
			jAlert(_T('_snmp','msg8'), _T('_common','error'),"",function(){$("#settings_networkSnmpNoteCommunity_text").focus()});	/* The Notification Community must not include the following characters:  ` \  */
			return false;
		}
		
		// check Notification IP Address
		if (check_ip_field() == false)
			return false;
	}
	
	// Community (SNMPv2c)
	val = $("#settings_networkSnmpCommunity_text").val();
	if (val.length==0)
 	{
		jAlert(_T('_snmp','msg9'), _T('_common','error'),"",function(){$("#settings_networkSnmpCommunity_text").focus()});	// Community (SNMPv2c) length should be 1-255.
 		return false;
 	}
	if (val.indexOf(" ") != -1) 
 	{
 		jAlert(_T('_snmp','msg9'), _T('_common','error'),"",function(){$("#settings_networkSnmpCommunity_text").focus()});	// Community (SNMPv2c) must not contain spaces.
 		return false;
 	}
	//if((val.indexOf("@") != -1) || (val.indexOf(":") != -1) || (val.indexOf("/") != -1) || (val.indexOf("\\") != -1) || (val.indexOf("%") != -1))
	if((val.indexOf("`") != -1) || (val.indexOf("\\") != -1))
	{
		jAlert(_T('_snmp','msg9'), _T('_common','error'),"",function(){$("#settings_networkSnmpCommunity_text").focus()});	/* The Community (SNMPv2c) must not include the following characters:  ` \  */
		return false;
	}
		
	return true;
}

function check_ip_field()
{
	var ip = $('#snmp_tb input[name="settings_networkSnmpNoteIP_text"]').val();
	var notification_enable = getSwitch('#settings_networkSnmpNote_switch');
	if(notification_enable=="1")
	{
		if( ip == "" )
		{
			//Please enter an IP address
			jAlert(_T('_snmp','msg4'), _T('_common','error'),"",function(){$("#settings_networkSnmpNoteIP_text").focus()});
			return false;
		}
		if ( validateKey( ip ) == 0 )
		{
			//Only numbers can be used as IP address values.
			jAlert(_T('_snmp','msg5'), _T('_common','error'),"",function(){$("#settings_networkSnmpNoteIP_text").focus()});
			return false;
		}
		if ( !checkDigitRange(ip, 1, 1, 254) )
		{
			//Invalid IP address. The first set of numbers must range between 1 and 254.
			jAlert(_T('_ip','msg4'), _T('_common','error'),"",function(){$("#settings_networkSnmpNoteIP_text").focus()});
			return false;
		}
		if ( !checkDigitRange(ip, 2, 0, 255) )
		{
			//Invalid IP address. The second set of numbers must range between 0 and 255.
			jAlert(_T('_ip','msg5'), _T('_common','error'),"",function(){$("#settings_networkSnmpNoteIP_text").focus()});
			return false;
		}
		if ( !checkDigitRange(ip, 3, 0, 255) )
		{
			//Invalid IP address. The third set of numbers must range between 0 and 255.
			jAlert(_T('_ip','msg6'), _T('_common','error'),"",function(){$("#settings_networkSnmpNoteIP_text").focus()});
			return false;
		}
		if ( !checkDigitRange(ip, 4, 1, 254) )
		{
			//Invalid IP address. The fourth set of numbers must range between 1 and 254.
			jAlert(_T('_ip','msg7'), _T('_common','error'),"",function(){$("#settings_networkSnmpNoteIP_text").focus()});
			return false;
		}
	}
	
	return true;
}

function check_v3_detail_field()
{
	// User Name
	var val = $("#settings_networkSnmpV3DetailUserName_text").val();
	if (val.length == 0)
	{
		jAlert(_T('_snmp','msg10'), _T('_common','error'),"",function(){$("#settings_networkSnmpV3DetailUserName_text").focus()});	// User name must be an alphanumeric value between 1 to 32 characters and cannot contain spaces.
		return false;
	}
	if(name_check(val))
	{
		jAlert(_T('_snmp','msg10'), _T('_common','error'),"",function(){$("#settings_networkSnmpV3DetailUserName_text").focus()});	
		return false;
	}
	if (SNMP_V3_USERS.indexOf(val+',') != -1)
	{
		jAlert(_T('_snmp','msg10'), _T('_common','error'),"",function(){$("#settings_networkSnmpV3DetailUserName_text").focus()});	
		return false;
	}

	// Auth pwd
	var val_1 = $("#settings_networkSnmpV3DetailAuthPwd_text").val();
	var val_2 = $("#settings_networkSnmpV3DetailAuthConfirmPwd_text").val();
	var security_level = $("#snmp_v3_security_level_val").attr('rel');
	if(security_level=="auth" || security_level=="priv")
	{
		if (val_1 != val_2)
		{
			jAlert(_T('_snmp','msg11'), _T('_common','error'),"",function(){$("#settings_networkSnmpV3DetailAuthPwd_text").focus()});	// The authentication password and confirmation password does not match. Try again.
			return false;
		}
		if (val_1.length < 8)
		{
			jAlert(_T('_snmp','msg12'), _T('_common','error'),"",function(){$("#settings_networkSnmpV3DetailAuthPwd_text").focus()}); //	The authentication password must be at least 8 characters in length. Try again.
			return false;
		}
		if (val_1.indexOf(" ") != -1) //find the  blank space
		{
			jAlert(_T('_snmp','msg12'), _T('_common','error'),"",function(){$("#settings_networkSnmpV3DetailAuthPwd_text").focus()});	// // The authentication password must not contain spaces.
			return false;
		}
		//if((val.indexOf("@") != -1) || (val.indexOf(":") != -1) || (val.indexOf("/") != -1) || (val.indexOf("\\") != -1) || (val.indexOf("%") != -1))
		if((val_1.indexOf("`") != -1) || (val_1.indexOf("\\") != -1))
		{
			jAlert(_T('_snmp','msg12'), _T('_common','error'),"",function(){$("#settings_networkSnmpV3DetailAuthPwd_text").focus()});	// /* The authentication password must not include the following characters:  ` \  */
			return false;
		}
	}

	// Encry pwd
	val_1 = $("#settings_networkSnmpV3DetailEncryPwd_text").val();
	val_2 = $("#settings_networkSnmpV3DetailEncryConfirmPwd_text").val();
	if(security_level=="priv")
	{
		if (val_1 != val_2)
		{
			jAlert(_T('_snmp','msg13'), _T('_common','error'),"",function(){$("#settings_networkSnmpV3DetailEncryPwd_text").focus()});	// The encryption password and confirmation password does not match. Try again.
			return false;
		}
		if (val_1.length < 8)
		{
			jAlert(_T('_snmp','msg14'), _T('_common','error'),"",function(){$("#settings_networkSnmpV3DetailEncryPwd_text").focus()});	//	The encryption password must be at least 8 characters in length. Try again.
			return false;
		}
		if (val_1.indexOf(" ") != -1) //find the  blank space
		{
			jAlert(_T('_snmp','msg14'), _T('_common','error'),"",function(){$("#settings_networkSnmpV3DetailEncryPwd_text").focus()});	// The encryption password must not contain spaces.
			return false;
		}
		//if((val.indexOf("@") != -1) || (val.indexOf(":") != -1) || (val.indexOf("/") != -1) || (val.indexOf("\\") != -1) || (val.indexOf("%") != -1))
		if((val_1.indexOf("`") != -1) || (val_1.indexOf("\\") != -1))
		{
			//The community must not include the following characters:  @ : / \\ %
			jAlert(_T('_snmp','msg14'), _T('_common','error'),"",function(){$("#settings_networkSnmpV3DetailEncryPwd_text").focus()});		/* The encryption password must not include the following characters:  ` \  */
			return false;
		}
	}
	return true;
}
