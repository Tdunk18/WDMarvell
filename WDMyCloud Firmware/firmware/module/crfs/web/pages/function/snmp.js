function ready_snmp()
{
	get_snmp_info();
}

function show_item(item)
{
	if (item  == 0)
	{
		$("#snmp_ip_tr").hide();
	}
	else
	{	
		$("#snmp_ip_tr").show();	
	}
}
function show_snmb_tb(enable)
{
	if(enable=="1")
		$("#settings_networkSNMP_link").show();
	else
		$("#settings_networkSNMP_link").hide();
}
function set_snmp(snmp_enable)
{
	//var snmp_enable = getSwitch('#snmp_switch');
	if(snmp_enable==1)
	{
		var community= $("#settings_networkSNMPCommunity_text").val();
		if (community.length==0)
	 	{
	 		//Please enter SNMP community.
			jAlert(_T('_snmp','msg1'), _T('_common','error'));
	 		return;
	 	}
		if (community.indexOf(" ") != -1) //find the  blank space
	 	{
	 		//SNMP community must not contain spaces.
	 		jAlert(_T('_snmp','msg2'), _T('_common','error'));
	 		return;
	 	}
	
	   	if((community.indexOf("@") != -1) || (community.indexOf(":") != -1) || (community.indexOf("/") != -1) || (community.indexOf("\\") != -1) || (community.indexOf("%") != -1))
		{
			//The community must not include the following characters:  @ : / \\ %
			jAlert(_T('_snmp','msg3'), _T('_common','error'));
			return;
		}
	
		//var ip=$("#f_ip1").val()+"." + $("#f_ip2").val()+"."+$("#f_ip3").val()+"." +$("#f_ip4").val()
		var ip = $('#snmp_tb input[name="settings_networkSNMPIP_text"]').val();
		//var notification_enable = $('#snmp_tb input:checked[name="f_notification"]').val();
		var notification_enable =getSwitch('#settings_networkSNMPNotification_switch');
		if(notification_enable=="1")
		{
			if( ip == "" )
			{
				//Please enter an IP address
				jAlert(_T('_snmp','msg4'), _T('_common','error'));
				return;
			}
			if ( validateKey( ip ) == 0 )
			{
				//Only numbers can be used as IP address values.
				jAlert(_T('_snmp','msg5'), _T('_common','error'));
				return;
			}
			if ( !checkDigitRange(ip, 1, 1, 254) )
			{
				//Invalid IP address. The first set of numbers must range between 1 and 254.
				jAlert(_T('_ip','msg4'), _T('_common','error'));
				return;
			}
			if ( !checkDigitRange(ip, 2, 0, 255) )
			{
				//Invalid IP address. The second set of numbers must range between 0 and 255.
				jAlert(_T('_ip','msg5'), _T('_common','error'));
				return;
			}
			if ( !checkDigitRange(ip, 3, 0, 255) )
			{
				//Invalid IP address. The third set of numbers must range between 0 and 255.
				jAlert(_T('_ip','msg6'), _T('_common','error'));
				return;
			}
			if ( !checkDigitRange(ip, 4, 1, 254) )
			{
				//Invalid IP address. The fourth set of numbers must range between 1 and 254.
				jAlert(_T('_ip','msg7'), _T('_common','error'));
				return;
			}
		}
		else
			ip="";
	}
	
	var url = "/cgi-bin/system_mgr.cgi?cmd=cgi_set_SNMP&f_enable=" + snmp_enable +
				"&f_community=" + encodeURIComponent(community) +
				"&notification_enable=" + notification_enable+
				"&ip=" + ip;
	SNMP_ENABLE = snmp_enable;
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback			
	wd_ajax({
		type:"GET",
		url:url,
		cache:false,
		success: function(){
			if(snmp_enable) 
			{
				snmpObj.close();
				_DIALOG="";
			}
			
			google_analytics_log('snmp-en',snmp_enable);
			jLoadingClose();
			//jAlert(_T('_common','update_success'), _T('_common','success'));
		}
	});
}
var snmp_diag_flag="";
var snmpObj="";
function init_snmp_dialog()
{
	get_snmp_info();
	
	var _TITLE = _T('_snmp','enable');
	$("#snmpDiag_title").html(_TITLE);

	init_button();
	language();
	
  	snmpObj=$("#snmpDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
					onClose: function() {
						setSwitch('#settings_networkSNMP_switch',SNMP_ENABLE);
						show_snmb_tb(SNMP_ENABLE);
			}});		
	snmpObj.load();
	_DIALOG=snmpObj;
	
	ui_tab("#snmpDiag","#settings_networkSNMPCommunity_text","#settings_networkSNMPSave_button");
	
	if(snmp_diag_flag==1) return;
	snmp_diag_flag =1;

	$("input:text").inputReset();
	
	$("#settings_networkSNMPNotification_switch").click(function(){
		var v = getSwitch('#settings_networkSNMPNotification_switch');
		if( v==1)
		{
			show_item(1)
		}
		else
		{
			show_item(0)
		}
	});
		
    $("#settings_networkSNMPSave_button").click(function(){				
		set_snmp(1);
	});	
	
}
var SNMP_ENABLE="";
function get_snmp_info()
{
	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/system_mgr.cgi",
		data:"cmd=cgi_get_SNMP",	
		dataType: "xml",
		success: function(xml){		
			
			var snmp_enable = $(xml).find('snmp_enable').text();
			var community = $(xml).find('community').text();
			var notification_enable = $(xml).find('notification_enable').text();
			var ip = $(xml).find('ip').text();
			SNMP_ENABLE = snmp_enable;
			
			if(snmp_enable=='1') 
			{
				$("#settings_networkSNMP_link").show();
			}
			
			setSwitch('#settings_networkSNMP_switch',snmp_enable);			
			setSwitch('#settings_networkSNMPNotification_switch',notification_enable);
	
			init_switch();
			
			var lan_tb = "#snmp_tb";
			
			$(lan_tb + " input[name='settings_networkSNMPIP_text']").val(ip)
			
			//community
			$("#settings_networkSNMPCommunity_text").val(community);
			
			show_snmb_tb(snmp_enable);
			show_item(notification_enable);
		}
		,
		 error:function(xmlHttpRequest,error){   
        		//alert("Get_User_Info->Error: " +error);   
  		 }  
	});		
}