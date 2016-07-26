<!doctype html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="PRAGMA" content="no-cache"> 
<meta http-equiv="Expires" content="-1">
<meta http-equiv="Cache-Control" content="no-cache">
<style>
.sel{
	background-color: #0067A6;
/*	border: 2px solid #0067A6;*/
}
</style>
</head>
<script type="text/javascript" src="/web/function/ftp.js"></script>
<script type="text/javascript" src="/web/function/ip.js?v=2.01"></script>
<script type="text/javascript" src="/web/function/ipDiag.js"></script>
<script type="text/javascript" src="/web/function/ipv6.js"></script>
<script type="text/javascript" src="/web/function/ipv6Diag.js"></script>
<script type="text/javascript" src="/web/function/lltd.js"></script>
<script type="text/javascript" src="/web/function/afp.js"></script>
<script type="text/javascript" src="/web/function/nfs_service.js"></script>
<script type="text/javascript" src="/web/function/ddns.js"></script>
<script type="text/javascript" src="/web/function/device.js"></script>
<script type="text/javascript" src="/web/function/portforwarding.js"></script>
<script type="text/javascript" src="/web/function/remote.js"></script>
<!--<script type="text/javascript" src="/web/function/snmp.js"></script>-->
<script type="text/javascript">
	if (SNMP_FUNCTION == 2) {
		$.getScript("/web/function/snmp_v3.js");
		$.getScript("/web/function/snmp_v3_diag.js");
	} else {
		$.getScript("/web/function/snmp.js");
	}
</script>
<script type="text/javascript" src="/web/function/codepage.js"></script>
<script type="text/javascript" src="/web/function/network_ups.js"></script>
<script type="text/javascript" src="/web/function/dfs.js"></script>
<script type="text/javascript" src="/web/function/active_directory.js"></script>

<script type="text/javascript">
var _SELECT_ITEMS  = new Array("speed_f_dev_main","bonding_f_dev_main","settings_networkFTPAccessMaxUsers_select","f_default_lang_main","settings_networkFTPAccessBlockIPType_select","settings_networkFTPAccessBlockIPReleaseDay_select");
function page_load()
{
	page_unload();
	
	ready_device();
	
	//get lan info
	get_ipv4_info();
	
	//ipv6
	if(IPV6_FUNCTION ==1)
	{
		$("#ipv6_lan0").show();
		$("#ipv6_addr_tr").show();
		$("#ipv6_DNS_addr_tr").show();
		get_ipv6_info();
	}

	//snmp
	//if(SNMP_FUNCTION==1){$("#snmp_tr").show();}
	
	//dfs	
	if(DFS_FUNCTION==1)
	{
		get_dfs_info();
		$("#dfs_tr").show();
	}

	//ads
	if(ADS_FUNCTION==1)
	{
		get_ads_info();
		//$("#domain_tr").show();
		$("#ads_tr").show();
	}
	
	//SAMBA
	if(SAMBA_FUNCTION==1)
	{
		$("#smb_tr").show();
	}
	
	if(NFS_FUNCTION==1)
	{
		$("#nfs_tr").show();
		ready_nfs_service();
	}
		
	/*
	if(LINK_SPEED_FUNCTION==1)
	{
		$("#lan0_speed").show();
	}*/
	
	if(JUMBO_FUNCTION==1)
	{
		$("#lan0_jumbo").show();
	}
	
	if(AFP_FUNCTION==1)
	{
		$("#afp_tr").show();
	}
	
	if(WEBDAV_FUNCTION==1)
	{
		$("#webdav_tr").show();
	}
	
	if(LLTD_FUNCTION==1)
	{
		$("#lltd_tr").show();
	}
	
	if(REMOTE_SERVER_FUNCTION==1)
	{
		$("#rserver_div").show();
	}
	
	if(DDNS_FUNCTION!=0)
	{
		$("#ddns_tr").show();
	}
	
	if(PORTFORWARDING_FUNCTION!=0)
	{
		$("#portforwarding_div").show();
	}
	
	if(NETWORK_UPS_FUNCTION==1)
	{
		$("#settings_networkUPS_div").show();
	}
	
    $("#settings_networkADS_switch").click(function(){
		var v = getSwitch('#settings_networkADS_switch');
		if( v==1)
		{
			$("#settings_networkADS_link").show();
			init_ads_dialog();
		}
		else
		{
			$("#settings_networkADS_link").hide();
			set_ads(0);
		}
	});
		
	ready_afp();
	
	// init snmp
	if (SNMP_FUNCTION == 2) {
		$("#snmp_tr_v2v3").show();
	} else if (SNMP_FUNCTION == 1) {
		$("#snmp_tr").show();
		$("#snmpDiag_set").show();
	}
	ready_snmp();

	ready_portforwarding();
	
	ftp_init();
	setSwitch('#settings_networkFTPAccess_switch', parseInt(FTP_CREATE_INFO[9],10));
	(parseInt(FTP_CREATE_INFO[9],10) == 1)? $("#settings_networkFTPAccessConfig_link").show():$("#settings_networkFTPAccessConfig_link").hide();
	init_select();
	
	//tooltip
	$("#tip_afp").attr('title',_T('_tip','afp'));
	$("#tip_nfs").attr('title',_T('_tip','nfs'));
	$("#tip_lltd").attr('title',_T('_tip','lltd'));	
	$("#tip_snmp").attr('title',_T('_tip','snmp'));	
	$("#tip_snmp_1").attr('title',_T('_tip','snmp_1'));	
	$("#tip_snmp_3_level").attr('title',_T('_tip','snmp_2'));
	$("#tip_snmp_3_view").attr('title',_T('_tip','snmp_3'));
	$("#tip_ssh").attr('title',_T('_tip','ssh'));	
	$("#tip_ddns").attr('title',_T('_tip','ddns'));
	$("#tip_remote").attr('title',_T('_tip','remote'));
	$("#tip_bonding").attr('title',_T('_tip','bonding'));
	$("#tip_jumbo").attr('title',_T('_tip','jumbo'));
	$("#tip_jumbo_lan1").attr('title',_T('_tip','jumbo'));
	$("#tip_smb").attr('title',_T('_tip','smb'));
	$("#tip_smb2").attr('title',_T('_tip','smb2'));
	$("#tip_ipv4").attr('title',_T('_tip','ipv4'));
	$("#tip_ipv4_2").attr('title',_T('_tip','ipv4'));
	$("#tip_ipv6").attr('title',_T('_tip','ipv6'));
	$("#tip_ipv6_2").attr('title',_T('_tip','ipv6'));
	$("#tip_ftp").attr('title',_T('_tip','ftp'));
	$("#tip_workgroup").attr('title',_T('_tip','workgroup'));
	$("#tip_lmb").attr('title',_T('_tip','lmb'));
	$("#tip_speed").attr('title',_T('_tip','speed'));
	$("#tip_speed_lan1").attr('title',_T('_tip','speed'));
	$("#tip_port_forwarding").attr('title',_T('_tip','port_forwarding'));
	$("#tip_webdav").attr('title',_T('_tip','webdav_enable'));
	$("#tip_ups").attr('title',_T('_tip','ups'));
	$("#tip_dfs").attr('title',_T('_tip','gen_dfs'));//Enable/Disable Distributed File System services for improved data availability.
	$("#tip_ads").attr('title',_T('_tip','gen_ads'));	//Enable/Disable Active Directory service to allow your My Cloud EX4 to join an existing Windows domain.
	$("#tip_domain").attr('title',_T('_tip','gen_ads'));
	$("#tip_dfs_root").attr('title',_T('_share_aggregation','tip1'));
	$("#tip_dfs_link").attr('title',_T('_share_aggregation','tip2'));
	$("#tip_dfs_local_folder").attr('title',_T('_share_aggregation','tip3'));
	$("#tip_dfs_host").attr('title',_T('_share_aggregation','tip4'));
	$("#tip_dfs_remote_share").attr('title',_T('_share_aggregation','tip5'));

	$("#tip_internet").attr('title',dictionary['InternetAccessTip']);
	
	init_tooltip();	
			
	//bonding
	$("#settings_networkBondingSave_button").click(function() {
		set_bonding();
	});	
	
	//speed
	$("#settings_networkSpeedSave0_button").click(function() {
		set_speed('0');
	});

	//speed
	$("#settings_networkSpeedSave1_button").click(function() {
		set_speed('1');
	});
	
	//jumbo frame
	$("#settings_networkJumboSave0_button").click(function() {
		set_jumbo('0');
	});
	$("#settings_networkJumboSave1_button").click(function() {
		set_jumbo('1');
	});

	//ftp config set
	$("#ftp_config_diag").click(function(){	
    	ftp_config_diag();
    });
    
	init_switch();
	
    //FTP
    $("#settings_networkFTPAccess_switch").click(function(){
			ftp_set_state(getSwitch('#settings_networkFTPAccess_switch'));
    });
	
	if(SNMP_FUNCTION == 1){
    $("#settings_networkSNMP_switch").click(function(){
		var v = getSwitch('#settings_networkSNMP_switch');
		if( v==1 )
		{
			$("#settings_networkSNMP_link").show();
		}
		else
		{
			$("#settings_networkSNMP_link").hide();
			set_snmp(0);
		}
	});
	}

	
    $("#settings_networkAFP_switch").click(function(){
		set_afp();
	});

    $("#settings_networkNFS_switch").click(function(){
		set_nfs();
	});
		
    $("#settings_networkLLTD_switch").click(function(){
    	set_lltd();
	});		
	
    $("#settings_networkLMB_switch").click(function(){
		set_lmb();
	});

    $("#smb2_switch").click(function(){
    	var smb2_enable = getSwitch('#smb2_switch');
		set_smb2(smb2_enable);
	});

    $("#smb_switch").click(function(){
    	var smb_enable = getSwitch('#smb_switch');
    	if(smb_enable==1)
    		$("#wins_service").show();
    	else
    		$("#wins_service").hide();
		set_smb(smb_enable);
	});
		
    $("#settings_networkWebdav_switch").click(function(){
		set_webdav();
	});

    $("#settings_networkSSH_switch").click(function(){
    	if (!$("#settings_networkSSH_switch").hasClass('gray_out'))
    	{
			var v = getSwitch('#settings_networkSSH_switch');
			if( v==1 )
			{
				set_ssh(1);
				//$("#ssh_conf_div").show();
			}
			else
			{
				$("#ssh_conf_div").hide();
				set_ssh(0);
			}
		}
	});
	//Network UPS Setting
	networkups_device_info();
	$("#settings_networkUPS_switch").click(function(){
		
		if ($("#settings_networkUPS_switch").hasClass("gray_out")) return;
		
		if ( getSwitch('#settings_networkUPS_switch') == 0 )
			networkups_slave_off();
		else
			networkups_slave_diag();
	});	
	$("#TD_networkups_config").click(function(){
		networkups_slave_diag();
	});		

	show_info();//show server info
    $("#settings_networkRemoteServer_switch").click(function(){
		var v = getSwitch('#settings_networkRemoteServer_switch');
		if( v==1 )
		{
			$("#settings_networkEditServer_link").show();
			var pw = $("#rServerDiag input[name='settings_networkRemoteServerPW_password']").val();
			
			if(pw.length >1)
			{
				Set_Server(1,"auto");
			}
			else
			{
				init_remote_server_dialog();
			}
		}
		else
		{
			$("#settings_networkEditServer_link").hide();
			Set_Server(0);
		}
	});
			
    $("#settings_networkVLAN_switch").click(function(){
		var v = getSwitch('#settings_networkVLAN_switch');
		if( v==1 )
		{
			show_vlan_id("1");
		}
		else
		{
			show_vlan_id("0");
		}
	});
			
	$("input:text").inputReset();	
	$("input:password").inputReset();
	
	xml_load_ddns();		       
	Internet_StatusID = setInterval(_REST_Get_Internet_Access, 3000);
    if (gInternetAccess == 'false')
    {
    	$("#setttings_networkInternet_value").html(dictionary['noInternetAccess']);
        commStatusTxt = dictionary['noInternetAccess'];
    }
    else
    {
    	$("#setttings_networkInternet_value").html(dictionary['InternetAccess']);
    }
}

function page_unload()
{
	clearTimeout(IPV6_TimeID);
	clearInterval(Internet_StatusID);
	if (UPS_intervalId != 0) clearInterval(UPS_intervalId);
}

function show_button(obj,flag)
{
	if(flag=="1")
		$(obj).show();
	else
		$(obj).hide();
}
</script>

<body>
<!-- Network Profile -->
<div class="h1_content header_2 _text" lang="_lan" datafld="title3">Network Profile</div>
	<table border="0" cellspacing="0" cellpadding="0" height="0">
		<tr>
			<td class="tdfield"><span class="_text" lang="_home" datafld="ups_status"></span></td>
			<td class="tdfield_padding">
				<span id="setttings_networkInternet_value"></span>&nbsp;&nbsp;<span class="TooltipIcon" id="tip_internet"></span>
			</td>
		</tr>
		<tr>
			<td class="tdfield"><span class="_text" lang="_lan" datafld="mac"></span></td>
			<td class="tdfield_padding"><div id="mac_div"></div></td>
		</tr>
		<tr>
			<td class="tdfield">IPv4 <span class="_text" lang="_lan" datafld="ip_address"></span></td>
			<td class="tdfield_padding"><div id="ipv4_address_div"></div></td>
		</tr>
		<tr id="ipv4_DNS_addr_tr">
			<td class="tdfield">IPv4 <span class="_text" lang="_lan" datafld="dns"></span></td>
			<td class="tdfield_padding"><div id="ipv4_DNS_address_div"></div></td>
		</tr>
		<tr id="ipv6_addr_tr" style="display:none">
			<td class="tdfield">IPv6 <span class="_text" lang="_lan" datafld="ip_address"></span></td>
			<td class="tdfield_padding"><div id="ipv6_address_div"></div></td>
		</tr>
		<tr id="ipv6_DNS_addr_tr" style="display:none">
			<td class="tdfield">IPv6 <span class="_text" lang="_lan" datafld="dns"></span></td>
			<td class="tdfield_padding"><div id="ipv6_DNS_address_div"></div></td>
		</tr>
	</table>
	
	<!-- Network Service-->
	<div class="hr_0_content"><div class="hr_1"></div></div>
	<span class="h1_content header_2 _text" lang="_menu" datafld="network_services">Network Service</span>
	<table border="0" cellspacing="0" cellpadding="0" height="0" width="750">
		<tr id="ipv4_lan0">
			<td class="tdfield"><div id="ipv4_lan0_title"></div></td>
			<td class="tdfield_padding">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
		<tr>
						<td>
							<div id="IPv4Mode_0" style="display:none"><button id="settings_networkLAN0IPv4Static_button" class="left_button" value="0"><span class="_text" lang="_ipv6" datafld="static">Static</span></button><button id="settings_networkLAN0IPv4DHCP_button" class="right_button" value="1"><span class="_text" lang="_ipv6" datafld="dhcp">DHCP</span></button></div>
						</td>
						<td style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_ipv4"></div>
						</td>
						<td style="display:none">
							<a id="ip_conf_div" class="edit_detail" style="margin-left:10px;" href="javascript:open_ip_diag(0);">
							    <span class="_text" lang="_p2p" datafld="config"></span>>>
							</a>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<tr id="ipv4_lan1" style="display:none">
			<td class="tdfield"><div id="ipv4_lan1_title"></div></td>
			<td class="tdfield_padding">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td>
							<div id="IPv4Mode_1" style="display:none"><button id="settings_networkLAN1IPv4Static_button" class="left_button" value="0"><span class="_text" lang="_ipv6" datafld="static">Static</span></button><button id="settings_networkLAN1IPv4DHCP_button" class="right_button" value="1"><span class="_text" lang="_ipv6" datafld="dhcp">DHCP</span></button></div>
						</td>
						<td style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_ipv4_2"></div>
						</td>
						<td style="display:none">
							<a id="ip_conf_div2" class="edit_detail" style="margin-left:10px;" href="javascript:open_ip_diag(1);">
							    <span class="_text" lang="_p2p" datafld="config"></span>>>
							</a>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<tr id="ipv6_lan0" style="display:none">
			<td class="tdfield"><div id="ipv6_lan0_title"></div></td>
			<td class="tdfield_padding">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td>
							<div id="IPv6Mode_0" style="display:none"><button id="settings_networkLAN0IPv6Auto_button" class="left_button" value="auto"><span class="_text" lang="_ipv6" datafld="auto">Auto</span></button><button id="settings_networkLAN0IPv6DHCP_button" class="middle_button" value="dhcp"><span class="_text" lang="_ipv6" datafld="dhcp">DHCP</span></button><button id="settings_networkLAN0IPv6Static_button" class="middle_button" value="static"><span class="_text" lang="_ipv6" datafld="static">Static</span></button><button id="settings_networkLAN0IPv6Off_button" class="right_button" value="off"><span class="_text" lang="_ipv6" datafld="off">Off</span></button></div>			
						</td>
						<td style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_ipv6"></div>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<tr id="ipv6_lan1" style="display:none">
			<td class="tdfield"><div id="ipv6_lan1_title"></div></td>
			<td class="tdfield_padding">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td>
							<div id="IPv6Mode_1" style="display:none"><button id="settings_networkLAN1IPv6Auto_button" class="left_button" value="auto"><span class="_text" lang="_ipv6" datafld="auto">Auto</span></button><button id="settings_networkLAN1IPv6DHCP_button" class="middle_button" value="dhcp"><span class="_text" lang="_ipv6" datafld="dhcp">DHCP</span></button><button id="settings_networkLAN1IPv6Static_button" class="middle_button" value="static"><span class="_text" lang="_ipv6" datafld="static">Static</span></button><button id="settings_networkLAN1IPv6Off_button" class="right_button" value="off"><span class="_text" lang="_ipv6" datafld="off">Off</span></button></div>			
						</td>
						<td style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_ipv6_2"></div>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<tr id="gw_tr" style="display:none">
			<td colspan="2">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td class="tdfield"><span class="_text" lang="_ipv6" datafld="def_gw"></span></td>
						<td class="tdfield_padding">
							<div class="select_menu">
								<ul>
									<li class="option_list">
										<div id="default_gw_main" class="wd_select option_selected">
											<div class="sLeft wd_select_l"></div>
											<div class="sBody text wd_select_m" id="gw_select" rel="lan0"><span class="_text" lang="_lan" datafld="lan1"></span></div>
											<div class="sRight wd_select_r"></div>
										</div>
										<ul class="ul_obj" style="width:120px;">
											<div>
												<li rel="12" style="width:110px"><a href="#" onclick="set_default_gw('lan0');"><span class="_text" lang="_lan" datafld="lan1"></span></a></li>
												<li rel="24" style="width:110px"><a href="#" onclick="set_default_gw('lan1');"><span class="_text" lang="_lan" datafld="lan2"></span></a></li>
											</div>
										</ul>
									</li>
								</ul>
							</div>
						</td>
						<td class="tdfield_padding" style="padding-left:10px;">
						</td>
						<td class="tdfield_padding" style="padding-left:20px">
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<tr id="bonding_tr" style="display:none">
			<td colspan="2">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td class="tdfield"><span class="_text" lang="_bonding" datafld="title"></span></td>
						<td class="tdfield_padding">
							<div id="bonding_mode" class="select_menu"></div>
						</td>
						<td class="tdfield_padding" style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_bonding"></div>
						</td>
						<td class="tdfield_padding" style="padding-left:20px">
							<button id="settings_networkBondingSave_button" style="display:none"><span class="_text" lang="_button" datafld="apply"></span></button>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<tr id="lan0_speed" style="display:none">
			<td colspan="2">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td class="tdfield"><span id="speed_title_lan0"></span></td>
						<td class="tdfield_padding">
							<div id="speed_div_lan0" class="select_menu"></div>
						</td>
						<td class="tdfield_padding" style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_speed"></div>
						</td>
						<td class="tdfield_padding" style="padding-left:10px">
							<button id="settings_networkSpeedSave0_button" style="display:none"><span class="_text" lang="_button" datafld="apply"></span></button>
						</td>	
					</tr>
				</table>
			</td>
		</tr>
		<tr id="lan1_speed" style="display:none">
			<td colspan="2">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
		<tr>
						<td class="tdfield"><span id="speed_title_lan1"></span></td>
						<td class="tdfield_padding">
							<div id="speed_div_lan1" class="select_menu"></div>
						</td>
						<td class="tdfield_padding" style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_speed_lan1"></div>
						</td>
						<td class="tdfield_padding" style="padding-left:10px">
							<button id="settings_networkSpeedSave1_button" style="display:none"><span class="_text" lang="_button" datafld="apply"></span></button>
						</td>	
					</tr>
				</table>
			</td>
		</tr>
		<tr id="lan0_jumbo" style="display:none">
			<td colspan="2">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td class="tdfield"><span id="jumbo_title_lan0"></span></td>
						<td class="tdfield_padding">
							<div id="jumbo_div_lan0" class="select_menu"></div>
						</td>
						<td class="tdfield_padding" style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_jumbo"></div>
						</td>
						<td class="tdfield_padding" style="padding-left:10px">
							<button id="settings_networkJumboSave0_button" style="display:none"><span class="_text" lang="_button" datafld="apply"></span></button>
						</td>	
					</tr>
				</table>
			</td>
		</tr>
		<tr id="lan1_jumbo" style="display:none">
			<td colspan="2">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td class="tdfield"><span id="jumbo_title_lan1"></span></td>
						<td class="tdfield_padding">
							<div id="jumbo_div_lan1" class="select_menu"></div>
						</td>
						<td class="tdfield_padding" style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_jumbo_lan1"></div>
						</td>
						<td class="tdfield_padding" style="padding-left:10px">
							<button id="settings_networkJumboSave1_button" style="display:none"><span class="_text" lang="_button" datafld="apply"></span></button>
						</td>	
					</tr>
				</table>
			</td>
		</tr>
		<tr><!-- FTP Server Setting -->
			<td colspan="2">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td class="tdfield"><span class="_text" lang="_lan" datafld="ftp_access">FTP Access</span></td>
						<td class="tdfield_padding">
							<input id="settings_networkFTPAccess_switch" name="settings_networkFTPAccess_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
						</td>
						<td class="tdfield_padding" style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_ftp"></div>
						</td>
						<td class="tdfield_padding" style="padding-left:20px">
							<a id="settings_networkFTPAccessConfig_link" class="edit_detail" href="javascript:ftp_config_diag();">
							    <span class="_text" lang="_p2p" datafld="config"></span>>>
							</a>
						</td>	
					</tr>
				</table>
			</td>
		</tr>
		<tr id="afp_tr" style="display:none">
			<td class="tdfield"><span class="_text" lang="_network_services" datafld="afp_service"></span></td>
			<td class="tdfield_padding">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td>
							<input id="settings_networkAFP_switch" name="settings_networkAFP_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
						</td>
						<td style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_afp"></div>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<tr id="nfs_tr" style="display:none">
			<td class="tdfield"><span class="_text" lang="_network_services" datafld="nfs_service"></span></td>
			<td class="tdfield_padding">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td>
							<input id="settings_networkNFS_switch" name="settings_networkNFS_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
						</td>
						<td style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_nfs"></div>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<tr id="webdav_tr" style="display:none">
			<td class="tdfield"><span class="_text" lang="_network_services" datafld="webdav_service"></span></td>
			<td class="tdfield_padding">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td>
							<input id="settings_networkWebdav_switch" name="settings_networkWebdav_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;" >
						</td>
						<td style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_webdav"></div>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<tr id="snmp_tr" style="display:none">
			<td class="tdfield"><span class="_text" lang="_snmp" datafld="enable">SNMP</span></td>
			<td class="tdfield_padding">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td>
							<input id="settings_networkSNMP_switch" name="settings_networkSNMP_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
						</td>
						<td style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_snmp"></div>
						</td>
						<td style="padding-left:20px;">
							<a id="settings_networkSNMP_link" class="edit_detail" href="javascript:init_snmp_dialog();" style="display:none">
							    <span class="_text" lang="_p2p" datafld="config"></span>>>
							</a>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<!-- SNMP v2v3 Setting -->
		<tr id="snmp_tr_v2v3" style="display:none">
			<td class="tdfield"><span class="_text" lang="_snmp" datafld="enable"></span></td>
			<td class="tdfield_padding">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td>
							<div id="settings_networkSNMPv3_switch" ><button id="settings_networkSnmpAll_button" class="left_button" value="all"><span class="_text" lang="_notification" datafld="all">All</span></button><button id="settings_networkSnmpV2c_button" class="middle_button" value="v2"><span class="_text" lang="_snmp" datafld="v2">v2c</span></button><button id="settings_networkSnmpV3_button" class="middle_button" value="v3"><span class="_text" lang="_snmp" datafld="v3">v3</span></button><button id="settings_networkSnmpOff_button" class="right_button" value="off"><span class="_text" lang="_ipv6" datafld="off">Off</span></button></div> 
						</td>
						<td style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_snmp_1"></div>
						</td>
						<td id="snmp_downloadMIB_tr" style="padding-left:20px;"  style="display:none">
							<a id="settings_networkSNMPv3_link" class="edit_detail" href="javascript:document.form_snmp_download.submit();">
								<button type="button" class="ButtonMarginLeft" id="settings_networkSNMPv3DownloadMIB_button"><span class="_text" lang="_wfs" datafld="download"></span></button>
							    <!-- <span class="_text" id="settings_networkSNMPv3DownloadMID_text"></span>-->
							</a>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<tr>
			<td class="tdfield"><span class="_text" lang="_ssh" datafld="enable">SSH</span></td>
			<td class="tdfield_padding">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td>
							<input id="settings_networkSSH_switch" name="settings_networkSSH_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
						</td>
						<td style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_ssh"></div>
						</td>
						<td style="padding-left:20px;">
							<a id="ssh_conf_div" class="edit_detail" href="javascript:init_ssh_dialog();" style="display:none">
							    <span class="_text" lang="_p2p" datafld="config"></span>>>
							</a>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<tr id="ddns_tr" style="display:none">
			<td class="tdfield"><span class="_text" lang="_ddns" datafld="ddns"></span></td>
			<td class="tdfield_padding">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td>
							<input id="settings_networkDdns_switch" name="settings_networkDdns_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
						</td>
						<td style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_ddns"></div>
						</td>
						<td style="padding-left:20px;">
							<a id="settings_networkDdns_link" class="edit_detail" href="javascript:set_ddns_diag();" style="display:none">
							    <span class="_text" lang="_p2p" datafld="config"></span>>>
							</a>
						</td>
					</tr>
				</table>
			</td>
		</tr>					
	</table>
	
	<!-- network UPS -->
	<div id="settings_networkUPS_div" style="display:none">
	<div class="hr_0_content"><div class="hr_1"></div></div>
	<span class="h1_content header_2 _text" lang="_network_ups" datafld="title1"></span>
	<table border="0" cellspacing="0" cellpadding="0" height="0">
		<tr>
			<td class="tdfield"><span class="_text" lang="_network_ups" datafld="desc1"></span></td>
			<td class="tdfield_padding">
				<input id="settings_networkUPS_switch" name="settings_networkUPS_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
			</td>
			<td class="tdfield_padding" style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_ups"></div>
			</td>
			<td class="tdfield_padding" style="padding-left:10px" style="display:none;">
				<div id="TD_networkups_config" class="edit_detail" style="display:none;">
					<span class="_text" lang="_lan" datafld="ftp_config" id="ftp_config_diag"></span> >> 
				</div>
			</td>	
		</tr>
		<tr id="tr_networkups_device_info" style="display:none;">
			<td class="tdfield"><span class="_text" lang="_network_ups" datafld="device_info"></span></td>
			<td class="tdfield_padding" colspan="2"><span id="ups_show_device_info"></span></td>
		</tr>	
		<tr id="tr_networkups_manu" style="display:none;">
			<td class="tdfield"><span class="_text" lang="_usb_device" datafld="manufacturer">Manufacturer</span></td>
			<td class="tdfield_padding" colspan="2"><span id="ups_show_manu"></span></td>
		</tr>
		<tr id="tr_networkups_product" style="display:none;">
			<td class="tdfield"><span class="_text" lang="_usb_device" datafld="product">Product</span></td>
			<td class="tdfield_padding" colspan="2"><span id="ups_show_product"></span></td>
		</tr>
		<tr id="tr_networkups_battery" style="display:none;">
			<td class="tdfield"><span class="_text" lang="_home" datafld="ups_barrery_charge">Battery Charge</span></td>
			<td class="tdfield_padding" colspan="2"><span id="ups_show_battery"></span></td>
		</tr>
		<tr id="tr_networkups_status" style="display:none;">
			<td class="tdfield"><span class="_text" lang="_home" datafld="ups_status">Status</span></td>
			<td class="tdfield_padding" colspan="2"><span id="ups_show_status"></span></td>
		</tr>
	</table>
	</div>
	
	<!-- network gorup-->
	<div class="hr_0_content"><div class="hr_1"></div></div>
	<span class="h1_content header_2 _text" lang="_device" datafld="title3"></span>
	<table border="0" cellspacing="0" cellpadding="0" height="0">
		<tr style="display:none" id="smb_tr"><!-- smb enable -->
			<td class="tdfield"><span id="smb_title2">SAMBA</span></td>
			<td class="tdfield_padding">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td>
							<input id="smb_switch" name="smb_switch" class="onoffswitch" type="checkbox" value="true">
						</td>
						<td style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_smb"></div>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
	<table border="0" cellspacing="0" cellpadding="0" height="0">
		<tr>
			<td >
				<table id="wins_service" border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td class="tdfield"> <span class="_text" lang="_device" datafld="workgroup"></span></td>
						<td class="tdfield_padding">
							<table border="0" cellspacing="0" cellpadding="0" height="0">
								<tr>
									<td>
										<input maxLength="15" type="text" name="settings_networkWorkgroup_text" id="settings_networkWorkgroup_text" class="upper" onkeyup="show_save_button(event,'settings_networkWorkgroupSave_button');">
										<input maxLength="15" type="hidden" name="settings_generalDeviceName_text" id="settings_generalDeviceName_text">
										<input maxLength="15" type="hidden" name="settings_generalDesc_text" id="settings_generalDesc_text">
									</td>
									<td style="padding-left:10px;">
										<div class="TooltipIcon" id="tip_workgroup"></div>
									</td>
									<td style="padding-left:10px;">
										<button id="settings_networkWorkgroupSave_button" onclick="set_device('workgroup');" class="SaveButton"><span class="_text" lang="_button" datafld="apply"></span></button>
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<tr>
						<td class="tdfield"> <span class="_text" lang="_device" datafld="lmb"></span></td>
						<td class="tdfield_padding">
							<table border="0" cellspacing="0" cellpadding="0" height="0">
								<tr>
									<td>
										<input id="settings_networkLMB_switch" name="settings_networkLMB_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
									</td>
									<td style="padding-left:10px;">
										<div class="TooltipIcon" id="tip_lmb"></div>
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<tr><!-- smb 2 -->
						<td class="tdfield"><span id="smb_title">SMB Protocol</span><!--<span class="_text" lang="_lan" datafld="smb2"></span>--></td>
						<td class="tdfield_padding">
							<table border="0" cellspacing="0" cellpadding="0" height="0">
								<tr>
									<td>
										<div id="smb_switch" style="display:none"> <input id="smb2_switch" name="smb2_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;"></div>
										<div id="smb_select" class="select_menu" style="display:none"></div>
									</td>
									<td style="padding-left:10px;">
										<div class="TooltipIcon" id="tip_smb2"></div>
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<tr id="dfs_tr" style="display:none">
						<td class="tdfield_170">
							<span class="_text" lang="_menu" datafld="dfs"></span>
						</td>
						<td class="tdfield_padding">
							<table border="0" cellspacing="0" cellpadding="0" height="0">
								<tr>
									<td>
										<input id="settings_networkDFS_switch" name="settings_networkDFS_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
									</td>
									<td style="padding-left:10px;">
										<div class="TooltipIcon" id="tip_dfs"></div>
									</td>
									<td style="padding-left:20px;">
										<a id="settings_networkDFS_link" class="edit_detail" href="javascript:init_dfs_diag();" style="display:none">
										    <span class="_text" lang="_p2p" datafld="config"></span>>>
										</a>
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<tr id="domain_tr" style="display:none">
						<td class="tdfield_170">
							<span class="_text" lang="_domain" datafld="security_domain"></span>
						</td>
						<td class="tdfield_padding">
							<table border="0" cellspacing="0" cellpadding="0" height="0">
								<tr>
									<td>
										<div id="settings_networkDomain_div"><button id="settings_networkAD_button" class="left_button" value="1"><span class="_text" lang="_menu" datafld="ads"></span></button><button id="settings_networkLDAP_button" class="middle_button" value="2">LDAP</button><button id="settings_networkOff_button" class="right_button" value="0"><span class="_text" lang="_ipv6" datafld="off"></span></button></div>			
									</td>
									<td style="padding-left:10px;">
										<div class="TooltipIcon" id="tip_domain"></div>
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<tr id="ads_tr" style="display:none">
						<td class="tdfield_170">
							<span class="_text" lang="_menu" datafld="ads"></span>
						</td>
						<td class="tdfield_padding">
							<table border="0" cellspacing="0" cellpadding="0" height="0">
								<tr>
									<td>
										<input id="settings_networkADS_switch" name="settings_networkADS_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
									</td>
									<td style="padding-left:10px;">
										<div class="TooltipIcon" id="tip_ads"></div>
									</td>
									<td style="padding-left:20px;">
										<a id="settings_networkADS_link" class="edit_detail" href="javascript:init_ads_dialog();" style="display:none">
										    <span class="_text" lang="_p2p" datafld="config"></span>>>
										</a>
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<tr id="settings_networkDomain_tr" style="display:none">
						<td class="tdfield_170"><span class="_text" lang="_domain" datafld="ad_status"></span></td>
						<td class="tdfield_padding">
							<div id="settings_networkDomainStatus_val"></div>
						</td>
					</tr>
					<tr id="lltd_tr" style="display:none">
						<td class="tdfield"><span class="_text" lang="_lan" datafld="lltd"></span></td>
						<td class="tdfield_padding">
							<table border="0" cellspacing="0" cellpadding="0" height="0">
								<tr>
									<td>
										<input id="settings_networkLLTD_switch" name="settings_networkLLTD_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
									</td>
									<td style="padding-left:10px;">
										<div class="TooltipIcon" id="tip_lltd"></div>
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
	
	<!-- remote backup server-->
	<div id="rserver_div" style="display:none">
	<div class="hr_0_content"><div class="hr_1"></div></div>
	<span class="h1_content header_2 _text" lang="_remote_backup" datafld="server">Remote Server</span>				
	<table border="0" cellspacing="0" cellpadding="0" height="0" >	
		<tr>
			<td class="tdfield"><span class="_text" lang="_remote_backup" datafld="server">Remote Server</span></td>
			<td class="tdfield_padding">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td>
							<input id="settings_networkRemoteServer_switch" name="settings_networkRemoteServer_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
						</td>
						<td style="padding-left:10px;">
							<div class="TooltipIcon" id="tip_remote"></div>
						</td>
						<td style="padding-left:20px;">
							<a id="settings_networkEditServer_link" class="edit_detail" href="javascript:init_remote_server_dialog();" style="display:none">
							    <span class="_text" lang="_p2p" datafld="config"></span>>>
							</a>
						</td>
					</tr>
				</table>

			</td>
			<td class="tdfield_padding"></td>
		</tr>
	</table>
<!-- network gorup-->
</div>

<span id="portforwarding_div" style="display:none">
	<div class="hr_0_content"><div class="hr_1"></div></div>
	<span class="h1_content header_2 _text" lang="_menu" datafld="forwarding"></span>

	<div class="tdfield_padding" id="portforwarding_list_info" style="display:none"><span class="_text" lang="_portforwarding" datafld="no_list"></span></div>					
	<div class="field_top" id="portforwarding_list_tb" style="display:none">
			<table id="port_tb" style="display:"></table>		
	</div>	
<table border="0" cellspacing="0" cellpadding="0" height="0">
<tr>
<td class="tdfield_padding">					
<button type="button" id="settings_networkPortForAdd_button"><span class="_text" lang="_button" datafld="add">Add</span></button>
</td>				
<td class="tdfield_padding_left_10 tdfield_padding">
<div class="TooltipIcon" id="tip_port_forwarding"></div>
</td>	
		<td style="padding-left:20px;" class="tdfield_padding">
				<a id="settings_networkPortForLearn_link" class="edit_detail" href="http://wdc.custhelp.com/app/answers/detail/a_id/8526/session/L3RpbWUvMTQwNDI3OTc2OC9zaWQvOTU4VHNmWWw%3D" target="_blank">
				    <span class="_text" lang="_app_center" datafld="desc10"></span>
				</a>
			</td>
</tr>
</table>	
<br>	
</span>
<!-- portforwarding -->
<!-- ipv6 dialog -->
<div id="ipv6Diag" class="WDLabelDiag" style="display:none">
	<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueIPv6Icon" id="ipv6Diag_title"></div>
	<div align="center"><div class="hr"><hr/></div></div>
	
		<!-- ipv6Diag_ip -->
		<div id="ipv6Diag_ip">	
			<div id="ipv6_set_tb" class="WDLabelBodyDialogue">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td><span class="_text TD field" lang="_lan" datafld="ip_address"></span></td>
						<td>
							<input type="text" name="settings_networkIPv6Addr_text" id="settings_networkIPv6Addr_text">
						</td>
						<td></td>
					</tr>
					<tr>
						<td class="tdfield"><span class="_text TD field" lang="_ipv6" datafld="prefix"></span></td>
						<td class="tdfield_padding">
							<input type="text" name="settings_networkIPv6Prefix_text" id="settings_networkIPv6Prefix_text" maxlength="3">
						</td>
						<td class="tdfield_padding">
							
						</td>										
					</tr>
					<tr>
						<td class="tdfield"><span class="_text TD field" lang="_ipv6" datafld="def_gw"></span></td>
						<td class="tdfield_padding">
							<input type="text" name="settings_networkIPv6GW_text" id="settings_networkIPv6GW_text">
						</td>
						<td class="tdfield_padding">
							
						</td>										
					</tr>
					<tr>
						<td class="tdfield"><span class="_text TD field" lang="_lan" datafld="dns1"></span></td>
						<td class="tdfield_padding">
							
							<input type="text" name="settings_networkIPv6DNS1_text" id="settings_networkIPv6DNS1_text">
						</td>
						<td class="tdfield_padding">
							
						</td>										
					</tr>
					<tr>
						<td class="tdfield"><span class="_text TD field" lang="_lan" datafld="dns2"></span></td>
						<td class="tdfield_padding">
							<input type="text" name="settings_networkIPv6DNS2_text" id="settings_networkIPv6DNS2_text">
						</td>
						<td class="tdfield_padding">
							
						</td>										
					</tr>
				</table>
			</div> <!-- body end -->
			<div class="hrBottom2"><hr/></div>
			<button type="button" class="ButtonMarginLeft_40px close" id="settings_networkIPv6Cancel_button"><span class="_text" lang="_button" datafld="Cancel"></span></button>
			<button type="button" class="ButtonRightPos2" id="settings_networkIPv6Save_button" onclick="set_ipv6_addr();"><span class="_text" lang="_button" datafld="apply"></span></button>
		</div> <!-- ipv6Diag_ip end -->
</div> <!-- ipv6Diag end -->


<div id="ipv4Diag" class="WDLabelDiag" style="display:none">
	<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueIPv4Icon" id="ipv4Diag_title"></div>
	<div align="center"><div class="hr"><hr/></div></div>
		<!-- ipv4Diag_desc -->
		<div id="ipv4Diag_desc" style="display:none">	
			<div class="WDLabelBodyDialogue">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td class="tdfield_padding">
							<span class="_text" lang="_lan" datafld="wizard_description"></span><br><br>
							<span class="_text" lang="_lan" datafld="wizard_description2"></span>
						</td>
					</tr>
				</table>
			</div>
			<div class="hrBottom2"><hr/></div>
			<button type="button" class="ButtonMarginLeft_40px close" id="settings_networkIPv4Cancel1_button"><span class="_text" lang="_button" datafld="Cancel"></span></button>
			<button type="button" class="ButtonRightPos2" id="settings_networkIPv4Next1_button"><span class="_text" lang="_button" datafld="Next"></span></button>
		
		</div> <!-- ipv4Diag_desc end -->
		
		<!-- ipv4Diag_ip -->
		<div id="ipv4Diag_ip" style="display:none">	
			<div class="WDLabelBodyDialogue" id="lan_tb">
				<input type="hidden" name="cmd" value="cgi_ip">
				<table id="dhcp_tr" border="0" cellspacing="0" cellpadding="0" height="0" width="620">
					<tr>
						<td class="tdfield_padding" colspan="2"><span class="_text" lang="_lan" datafld="choose_dhcp"></span></td>
					</tr>
					<tr>
						<td style="padding-top:20px;" >
							<input type="radio" value="0" name="f_dns_auto" id="settings_networkDNS1_radio" onclick="init_dns('#lan_tb');"><label for="settings_networkDNS1_radio"><span class="_text" lang="_lan" datafld="dns_auto1"></span></label>
						</td>
						<td style="padding-top:20px;">
							<input type="radio" value="1" name="f_dns_auto" id="settings_networkDNS2_radio" onclick="init_dns('#lan_tb');"><label for="settings_networkDNS2_radio"><span class="_text" lang="_lan" datafld="dns_auto2"></span></label>
						</td>
					</tr>
				</table>
				<table border="0" border="0" cellspacing="0" cellpadding="0">
					<tr>
						<td class="tdfield"><span class="_text" lang="_lan" datafld="ip_address"></span></td>
						<td class="tdfield_padding">
							<input type="text" name="settings_networkIP_text" id="settings_networkIP_text">
						</td>
					</tr>
					<tr>
						<td class="tdfield"><span class="_text" lang="_lan" datafld="subnet_mask"></span></td>
						<td class="tdfield_padding">
							<input type="text" name="settings_networkMask_text" id="settings_networkMask_text">
						</td>
					</tr>
					<tr>
						<td class="tdfield"><span class="_text" lang="_lan" datafld="gateway"></span></td>
						<td class="tdfield_padding">
							<input type="text" name="settings_networkGW_text" id="settings_networkGW_text">
						</td>
					</tr>
					<tr>
						<td class="tdfield"><span class="_text" lang="_lan" datafld="dns1"></span></td>
						<td class="tdfield_padding">
							<input type="text" name="settings_networkDNS1_text" id="settings_networkDNS1_text">
						</td>
					</tr>
					<tr>
						<td colspan="2">
							<a id="settings_networkGoogleDNS_link" class="edit_detail"style="float:right;margin-top:10px;margin-bottom:10px;" href="javascript:auto_fill_dns();">
							    <span class="_text" lang="_lan" datafld="auto_fill"></span> * >>
							</a>
						</td>
					</tr>
					<tr>
						<td><span class="_text field" lang="_lan" datafld="dns2"></span></td>
						<td>
							<input type="text" name="settings_networkDNS2_text" id="settings_networkDNS2_text">
						</td>
					</tr>
					<tr>
						<td class="tdfield"><span class="_text" lang="_lan" datafld="dns3"></span></td>
						<td class="tdfield_padding">
							<input type="text" name="settings_networkDNS3_text" id="settings_networkDNS3_text">
						</td>
					</tr>
				</table>
				<table border="0" border="0" cellspacing="0" cellpadding="0">
					<tr><td colspan="2" class="tdfield_padding_top_10">*<span class="_text" lang="_lan" datafld="google_dns"></span></td></tr>
				</table>
			</div>
			<div class="hrBottom2"><hr/></div>
			<button type="button" class="ButtonMarginLeft_40px" id="settings_networkIPv4Back2_button"><span class="_text" lang="_button" datafld="back"></span></button>
			<button type="button" class="ButtonMarginLeft_20px close" id="settings_networkIPv4Cancel2_button" ><span class="_text" lang="_button" datafld="Cancel"></span></button>
			<button type="button" class="ButtonRightPos2" id="settings_networkIPv4Next2_butotn"><span class="_text" lang="_button" datafld="Next"></span></button>
		</div> <!-- ipv4Diag_ip end -->
		
		<!-- ipv4Diag_vlan -->
		<div id="ipv4Diag_vlan" style="display:none">	
			<div class="WDLabelBodyDialogue">
				<table border="0" cellspacing="0" cellpadding="0" height="0">
					<tr>
						<td class="tdfield_padding">
							<span class="_text" lang="_lan" datafld="vlan_description"></span>
						</td>
					</tr>
				</table>
				<span id="tab_span" tabindex="0"></span>
				<table id="vlan_tb" border="0" cellspacing="0" cellpadding="0">
					<tr>
						<td id="vlan_td1" class="tdfield_80" ><span class="_text field" lang="_lan" datafld="vlan"></span></td>							
						<td class="tdfield_padding">
							<span id="vlan_span"><input id="settings_networkVLAN_switch" name="settings_networkVLAN_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;"></span>
						</td>
					</tr>
					<tr>
						<table id="vlan_tr" border="0" cellspacing="0" cellpadding="0">
							<tr>
								<td id="vlan_td2" class="tdfield_80"><span class="_text field" lang="_lan" datafld="vlan_id"></span></td>							
								<td class="tdfield_padding">
									<input size="15" type="text" name="settings_networkVLANID_text" id="settings_networkVLANID_text" maxlength="4" class="input_x2">
								</td>
								<td class="tdfield_padding" style="padding-left:10px">
									( <span class="_text" lang="_lan" datafld="vlan_id_info"></span> )
								</td>
							</tr>
						</table>

					</tr>
				</table>
			</div>
			<div class="hrBottom2"><hr/></div>
			<button type="button" class="ButtonMarginLeft_40px" id="settings_networkIPv4Back3_button"><span class="_text" lang="_button" datafld="back"></span></button>
			<button type="button" class="ButtonMarginLeft_20px close" id="settings_networkIPv4Cancel3_button"><span class="_text" lang="_button" datafld="Cancel"></span></button>
			<button type="button" class="ButtonRightPos2" id="settings_networkIPv4Next3_button"><span class="_text" lang="_button" datafld="Next"></span></button>
		</div> <!-- ipv4Diag_vlan end -->

		<!-- ipv4Diag_complited -->
		<div id="ipv4Diag_complited" style="display:none">	
			<div class="WDLabelBodyDialogue" style="overflow:hidden">
				<div class="dialog_content" style="overflow:hidden">
					<span class="_text" lang="_user" datafld="user_finish">
					The setting is complete. Click Previous to review and make more changes.<br>
					Click Completed to save the current settings.</span>
					<br><br>
					<div id="ipv4_confirm" style="width:450px;height:280px;overflow:hidden"></div>				
				</div>
			</div>
			<div class="hrBottom2"><hr/></div>
			<button type="button" class="ButtonMarginLeft_40px" id="settings_networkIPv4Back4_button"><span class="_text" lang="_button" datafld="back"></span></button>
			<button type="button" class="ButtonMarginLeft_20px close" id="settings_networkIPv4Cancel4_button"><span class="_text" lang="_button" datafld="Cancel"></span></button>
			<button type="button" class="ButtonRightPos2" id="settings_networkIPv4Next4_button"><span></span></button>
		</div> <!-- ipv4Diag_complited end -->
</div> <!-- ipv4Diag end -->
	
<!-- snmp dialog -->
<div id="snmpDiag" class="WDLabelDiag" style="display:none">
	<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueSNMPIcon" id="snmpDiag_title"></div>
	<div align="center"><div class="hr"><hr/></div></div>
		
	<!-- snmpDiag_set for 1.05 & 1.06 -->
	<div id="snmpDiag_set" style="display:none">	
		<div class="WDLabelBodyDialogue">
			<table id="snmp_tb" border="0" width="466" cellspacing="0" cellpadding="0" height="0">
						<tr>
							<td class="tdfield">
								<span class="TD field _text" lang="_snmp" datafld="community"></span>
							</td>
							<td class="tdfield_padding">
								<input type="text" name="settings_networkSNMPCommunity_text" id="settings_networkSNMPCommunity_text" maxLength="64" >
							</td>
						</tr>
						<tr>
							<td class="tdfield">
								<span class="TD field _text" lang="_snmp" datafld="notification"></span>
							</td>
							<td class="tdfield_padding">
								<input id="settings_networkSNMPNotification_switch" name="settings_networkSNMPNotification_switch" class="onoffswitch" type="checkbox" value="true" style="position: absolute; z-index: -1; visibility: hidden;">
							</td>
						</tr>
						<tr id="snmp_ip_tr">
							<td class="tdfield">
								<span class="TD field _text" lang="_snmp" datafld="notification_ip"></span>
							</td>
							<td class="tdfield_padding">
								<input type="text" name="settings_networkSNMPIP_text" id="settings_networkSNMPIP_text">
							</td>
						</tr>
					</table>								
		</div> <!-- body end -->
		<div class="hrBottom2"><hr/></div>
		<button type="button" class="ButtonMarginLeft_40px close" id="settings_networkSNMPCancel_button"><span class="_text" lang="_button" datafld="Cancel"></span></button>
		<button type="button" class="ButtonRightPos2" id="settings_networkSNMPSave_button"><span class="_text" lang="_button" datafld="save"></span></button>
	</div> <!-- snmpDiag_set end -->

</div> <!-- snmpDiag end -->

<!-- portforwarding dialog -->
<div id="portDiag" class="WDLabelDiag" style="display:">
<div id="portDiag_title" class="WDLabelHeaderDialogue WDLabelHeaderDialoguePortforIcon">
<span class="_text" lang="_portforwarding" datafld="title"></span></div>
<div align="center"><div class="hr"><hr></div></div>
	
<!-- step1 -->
<div id="port_step1" style="display:none;" >
<div class="WDLabelBodyDialogue">
<div class="dialog_content">

		<span class="_text" lang="_portforwarding" datafld="wizard_desc"></span>	
</div>	
</div>		
	
	<div class="hrBottom2"><hr/></div>	
	<div class="LightningButton ButtonMarginLeft_40px close" lang="_button" datafld="Cancel"></div>
	<div class="LightningButton ButtonRightPos2" id="p_next_button_1" lang="_button" datafld="Next"></div>	
</div>
<!-- step 2-->	
<div id="port_step2" style="display:none;" >
<div class="WDLabelBodyDialogue">
<div class="dialog_content">
		
<button id="settings_networkPortForDefault_button" class="left_button buttonSel"><span class="_text" lang="_portforwarding" datafld="built_desc"></span></button><button id="settings_networkPortForCustom_button" class="right_button"><span class="_text" lang="_portforwarding" datafld="custom_desc"></span></button>	
</div>	
</div>		
		
		
			<div class="hrBottom2"><hr/></div>			
			<button type="button" class="ButtonMarginLeft_40px close" id="settings_networkPortForCancel1_button"><span class="_text" lang="_button" datafld="Cancel"></span></button>
			<button type="button" class="ButtonRightPos2" id="settings_networkPortForNext1_button" ><span class="_text" lang="_button" datafld="Next"></span></button>						
									
</div>
<!-- step 3-->	
<div id="port_step3_custom" style="display:none">
	
</div>


<!--  custom -->
<div id="port_custom_dialog" style="display:none">
<div class="WDLabelBodyDialogue">
<div class="dialog_content" style="overflow:hidden;">
	
			<table border="0"  cellspacing="0" cellpadding="0" height="0">
					<tr style="display:none">
							<td width="150" height="40"><span class="_text field_top" lang="_common" datafld="enable">Enable</span></td>
							<td>								
								<input type="checkbox" id="f_port_enable" name="f_port_enable" checked>
						</td>							
					</tr>
					<tr> 
							<td width="150" height="40"><span class="_text field" lang="_portforwarding" datafld="service">Service</span></td>
						<td><input type="text" name="settings_networkPortForService_text" id="settings_networkPortForService_text" maxlength="32"  onkeyup="this.value=this.value.replace(/[^0-9a-zA-Z ]/g,'');">		</td>													
					</tr>
					<tr>
						<td height="40" width="150"> <span class="_text field" lang="_portforwarding" datafld="protocol">Protocol</span></td>
						<td>
		
						<div class="select_menu" style="height:25px" >
				      <ul>
				        <li class="option_list">
				                  				                  
				            	<div id="settings_networkPortForProtocol_select" class="wd_select option_selected">
															<div class="sLeft wd_select_l"></div>
															<div class="sBody text wd_select_m" id="f_protocol" rel="tcp">TCP</div>
															<div class="sRight wd_select_r"></div>																																								
															
											</div>						
											<ul class="ul_obj">
												<div> 							            	
				                <li id="settings_networkPortForProtocolLi1_select" class="li_start" rel="tcp"><a href="#">TCP</a></li>  
				                <li id="settings_networkPortForProtocolLi2_select" class="li_end" rel="udp"><a href="#">UDP</a></li>
				              	</div>
				            	</ul>
				        </li>
				      </ul>
							</div>
						</td>
					</tr>	
					<tr>
						<td width="150" height="40"><span class="_text field" lang="_portforwarding" datafld="e_port">External Port</span></td>
						<td>							
								<input type="text" class="input_x55" name="settings_networkPortForExtPort_text" id="settings_networkPortForExtPort_text" maxlength="5" length="5" onkeyup="this.value=this.value.replace(/[^0-9]/g,'');">										
						</td>
					</tr>	
						<tr>
						<td width="150" height="40"><span class="_text field" lang="_portforwarding" datafld="p_port">Internal Port</span></td>
						<td>
								<input type="text" class="input_x55" name="settings_networkPortForIntPort_text" id="settings_networkPortForIntPort_text" maxlength="5" length="5" onkeyup="this.value=this.value.replace(/[^0-9]/g,'');">
						</td>
					</tr>
					<tr style="display:none" id="settings_networkPortForStatus_tr">
							<td width="150" height="40"><span class="_text field" lang="_home" datafld="ups_status"></span></td>
							<td><div id="settings_networkPortForStatus_value"></div></td>
					</tr>		
			</table>
	</div>	
</div>	
			<div class="hrBottom2"><hr/></div>
			<button type="button" class="ButtonMarginLeft_40px" id="settings_networkPortForCustomBack1_button"><span class="_text" lang="_button" datafld="back"></span></button>
			<button type="button" class="close" id="settings_networkPortForCustomCancel1_button"><span class="_text" lang="_button" datafld="Cancel"></span></button>
			<button type="button" class="ButtonMarginLeft_20px" id="settings_networkPortForCustomDel_button" onclick="del();"><span class="_text" lang="_common" datafld="del"></span></button>
			<button type="button" class="ButtonRightPos2"	 id="settings_networkPortForCustomSave_button"><span class="_text" lang="_button" datafld="save"></span></button>
</div>
<!--  custom table -->

<!-- scan table -->
<div id="port_scan_dialog" style="display:none;" >

<div class="WDLabelBodyDialogue">
<div class="dialog_content">


		<span class="_text" lang="_portforwarding" datafld="built_desc"></span>		
		<br><br>
		<div id="port_scan_info"></div>

</div>	
</div>		
		
	<div class="hrBottom2"><hr/></div>
			<button type="button" class="ButtonMarginLeft_40px" id="settings_networkPortForDefaultBack1_button"><span class="_text" lang="_button" datafld="back"></span></button>
			<button type="button" class="ButtonMarginLeft_20px close" id="settings_networkPortForDefaultCancel1_button" ><span class="_text" lang="_button" datafld="Cancel"></span></button>
			<button type="button" class="ButtonRightPos2" id="settings_networkPortForDefaultSave_button"><span class="_text" lang="_button" datafld="save"></span></button>
						
</div>
<!-- scan table end-->
</div>

<!-- ddns dialog -->
<div id="ddns_Diag" class="WDLabelDiag" style="display:none;">
<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueDDNSIcon" id="ddns_title"><span class="_text" lang="_ddns" datafld="title"></span></div>
<div align="center"><div class="hr"><hr></div></div>
		
	<div id="hd_sleep_set">
		<div class="WDLabelBodyDialogue" >
			<div class="dialog_content">
				
				<table border="0"  cellspacing="0" cellpadding="0" height="0">
				<tr>
					<td height="40">
						<span class="TD field"><span class="_text" lang="_ddns" datafld="server_address"></span></span>						
					</td>
					<td>
							<div class="select_menu" id="id_ddns_server_top_main">								
					</td>	
				</tr>
				<tr>
					<td height="40">
						<span class="TD field"><span class="_text" lang="_ddns" datafld="host_name"></span></span>						
					</td>
					<td>
						<input type="text" name="settings_networkDdnsDomain_text" id="settings_networkDdnsDomain_text"> 						
					</td>	
				</tr>
				<tr>
					<td height="40">
						<span class="TD field"><span class="_text" lang="_ddns" datafld="username">Username or Key</span></span>						
					</td>
					<td>
						<input type="text" name="settings_networkDdnsUsername_text" id="settings_networkDdnsUsername_text">
					</td>	
				</tr>
				<tr>
					<td height="40">
						<span class="TD field"><span class="_text" lang="_ddns" datafld="pwd">Password or Key</span></span>						
					</td>
					<td>
						<input type="password" name="settings_networkDdnsPwd_text" id="settings_networkDdnsPwd_text">
					</td>	
				</tr>
					<tr>
					<td height="40">
						<span class="TD field"><span class="_text" lang="_ddns" datafld="verify">Verify Password or Key</span></span>						
					</td>
					<td>
							<input type="password" name="settings_networkDdnsVerifyPwd_text" id="settings_networkDdnsVerifyPwd_text">
					</td>	
				</tr>
				</tr>
					<tr>
					<td height="40">
						<span class="TD field"><span class="_text" lang="_ddns" datafld="status">Status</span></span>						
					</td>
					<td>
							<div id="settings_networkDdnsStatus_value"></div>
					</td>	
				</tr>
				</table>  
			</div>	
		</div>
		
		<div class="hrBottom2"><hr></div>
		
		<button type="button" class="ButtonMarginLeft_40px close" id="settings_networkDdnsCancel_button"><span class="_text" lang="_button" datafld="Cancel"></span></button> 	
		<button type="button" onclick="delete_ddns();" id="settings_networkDdnsClear_button" class="ButtonMarginLeft_20px"><span class="_text" lang="_button" datafld="clear"></span></button> 	
  		<button type="button" class="ButtonRightPos2" id="settings_networkDdnsSave_button" onclick="set_ddns(1);"><span class="_text" lang="_button" datafld="save"></span></button>
	</div>
</div>

<!-- remote server dialog -->
<div id="remoteServerDiag" class="WDLabelDiag">
	<div class="WDLabelHeaderDialogue WDLabelHeaderDialogueBackupIcon" id="rsDetailDiag_title"></div>
	<div align="center"><div class="hr"><hr/></div></div>
	
	<!-- rServerDiag -->
	<div id="rServerDiag" style="display:none">
		<div class="WDLabelBodyDialogue">
			<div class="_text maxwidth" lang="_remote_backup" datafld="server_desc"></div>
			<div class="_text maxwidth tdfield_padding_top_10" lang="_remote_backup" datafld="pw_desc"></div>
			<div class="_text maxwidth tdfield_padding_top_10" lang="_remote_backup" datafld="msg35" id="settings_networkBackups_rlink"></div>
			<table border="0" cellspacing="0" cellpadding="0" height="0" >	
				<tr>
					<td class="tdfield"><span class="_text" lang="_remote_backup" datafld="pw"></span></td>
					<td class="tdfield_padding">
						<input type="password" name="settings_networkRemoteServerPW_password" id="settings_networkRemoteServerPW_password" maxlength="16">
					</td>
				</tr>
			</table>
		</div>
		<div class="hrBottom2"><hr/></div>
		<button type="button" class="ButtonMarginLeft_40px close" id="backups_rCancel13_button"><span class="_text" lang="_button" datafld="Cancel"></span></button>
		<button type="button" class="ButtonRightPos2" id="settings_networkRemoteServerSave_button" onclick="Set_Server(1)"><span class="_text" lang="_button" datafld="apply"></span></button>
	</div>
</div>
<?php
include("./ftp_Diag.html");
include("./ups_Diag.html");
include("./sshDiag.html");
include("./adsDiag.html");
include("./dfsDiag.html");
//include("./ldap_clientDiag.html");
include("./snmpDiag.html");
?>
</body>
</html>
