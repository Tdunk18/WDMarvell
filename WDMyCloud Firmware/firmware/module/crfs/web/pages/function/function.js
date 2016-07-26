var OSName = "Unknown OS";
if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
if (navigator.appVersion.indexOf("X11") != -1) OSName = "UNIX";
if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";

var _g_admin = "";
var _g_admin_pwd = "";

function init() {
	return "";
}

/*
 *	check user login yet?
 */
function Chk_Description(description)
{
	var desc = description.val();
	
	//1.	長度不能超過42個字
	//2.	可以為空值
	//3.	只允許英文字,數字,空格組成
	//Device description must begin with alphanumeric and be no more that 42 characters long.
	var re = /^[a-zA-Z0-9]/i;
	if ( !re.test(desc) || desc.length >42)
	{
		jAlert(_T('_device', 'msg12'), "warning");
		return 0;
	}
	
	if (desc.substr(0, 1) == " " || desc.substr(desc.length - 1, 1) == " ") {
		jAlert(_T('_device', 'msg13'), "warning");
		return 0;
	}
	
	return 1;
}
function Chk_Server_Name(servername) {

	var sname = servername.val();

	//1.	長度不能超過15個字和為空值
	//2.	不允許全部數字
	//3.	需要英文和數字或”-” 組成
	if(sname.length < 2)
	{
		jAlert(_T('_device', 'msg10'), "warning");
		return 0;
	}
	
	var re = /^[0-9]+$/;
	if ( re.test(sname) )
	{
				jAlert(_T('_device', 'msg10'), "warning");
				return 0;
			}

	re = /^[a-z0-9\-]+$/i;
	if ( !re.test(sname) )
	{
		jAlert(_T('_device', 'msg10'), "warning");
		return 0;
	}

	var mt = sname.charAt(0).match(/[^\sa-zA-Z]/);
	if (mt || sname.charAt(0)=='-')
  	{
  		jAlert(_T('_device', 'msg10'), "warning");
  		return 0;
	}
	return 1;
}

function ChkSymbol2(groupname) {
	var symbol = "*+=|[]/\\:\";<>?,"

	var i, j;

	for (i = 0; i < groupname.val().length; i++) {
		for (j = 0; j < symbol.length; j++) {
			if (groupname.val().charAt(i) == symbol.charAt(j)) {
				groupname.select();
				groupname.focus();
				jAlert(_T('_device', 'msg8'), "warning")
				return 0;
			}
		}
	}
	return 1;
}

function value_check(v) {
	//v[0] :group
	//v[1] :server name
	//v[2] :description

	if (v[0].val().indexOf(" ") != -1) //find the blank space
	{
		v[0].select();
		v[0].focus();
		//jAlert("Workgroup must not contain spaces.","Error")
		jAlert(_T('_device', 'msg1'), "warning");
		return 1;
	}

	if (!ChkSymbol2(v[0])) //group
		return 1;

	if (!Chk_Server_Name(v[1])) //server name
		return 1;

	if(!Chk_Description(v[2])) //desc
		return 1;

	if (v[0].val() == "") {
		v[0].select();
		v[0].focus();
		//jAlert("Please enter a workgroup.","Error")
		jAlert(_T('_device', 'msg2'), "warning");
		return 1;
	} else if (v[0].val().length > 16) {
		v[0].select();
		v[0].focus();
		//jAlert("The workgroup must not exceed 15 characters.","Error")
		jAlert(_T('_device', 'msg3'), "warning");
		return 1;

	}



	return 0
}

function Chk_Samba_Share_Name(sharename) {
	//return 1:	not a valid name

	var re = /[%<>*?|/\\+=;:"@#!~\[\]]/;	//wd case add @ # ! ~ (ITR No.: 78120) , add [] (MWARE-1252)
	if (re.test(sharename)) {
		return 1;
	}

	if (sharename.charAt(sharename.length - 1) == "$" || sharename.charAt(sharename.length - 1) == ".")
		return 2;

	return 0;
}

function Chk_Folder_Name(FolderName) {
	//return 1:	not a valid name

	var re = /[\\/:*?"<>|]/;
	if (re.test(FolderName)) {
		return 1;
	}

	if (FolderName.charAt(0) == "." || FolderName.charAt(FolderName.length - 1) == ".")
		return 2;

        if (FolderName.replace(/^\s+|\s+$/g,"") == "")
	{	
		return 3;
	}

	return 0;
}
function Chk_account(string)
{
	var re1 = /^[a-zA-Z_]/;
	if (!re1.test(string))
	{
		return 1;
	}

	var re2 = /[^\sa-zA-Z0-9_-]/;
	if (!re2.test(string))
	{
		return 0;
	}
	else
	{
		return 1;
	}
}
function firstName_lastName_check(str) {
	var mt = str.match(/[~!@#$%^&*()_+`=:;"'<>,?\\/{}\[\]|]/);
	if (mt)
		return 1;
	else
		return 0;
}

function name_check(str) {
	var mt = str.match(/[^\sa-zA-Z0-9_-]/);
	if (mt)
		return 1;
	else
		return 0;
}

function name_check1(str) {
	var mt = str.match(/[^\sa-zA-Z0-9]/);
	if (mt)
		return 1;
	else
		return 0;
}

function name_check3(str) {
	//for nfs host name

	var mt = str.match(/[^a-zA-Z0-9-./]/);
	if (mt)
		return 1;
	else
		return 0;
}

function pw_check(pw) {
	//return 1:	not a valid value

	// @:/\% '

	var re = /[@:/\\%']/;

	if (re.test(pw)) {
		return 1;
	}
	return 0;
}
var reject_account = ["daemon","bin","sys","sync","games","man","lp","mail","news","uucp","proxy","backup","list","irc","gnats","libuuid","ntp",
					"CON","PRN","AUX","NUL","COM1","COM2","COM3","COM4","COM5","COM6","COM7","COM8","COM9",
					"LPT1","LPT2","LPT3","LPT4","LPT5","LPT6","LPT7","LPT8","LPT9",
					"root","anonymous","nobody","administrator","admin","ftp","allaccount","squeezecenter","sshd","messagebus","netdev","share","ssh",
					"cloudholders","remote_access","media_serving","share_access_locked","target_path","guest","Public","SmartWare","TimeMachineBackup"]; 
//ITR No.: 102130 [User] Can not delete user "guest"
//ITR No.: 77776Can't create a username "Guest"
//ITR No.: 104420 Default share is change to private after create username same as default share name.
function checkID(name,allaccount)
{
	//daemon, bin, sys, sync, games, man, lp, mail, news, uucp, proxy, backup, list, irc, gnats, libuuid, ntp, 
	//CON, PRN, AUX, NUL, COM1, COM2, COM3, COM4, COM5, COM6, COM7, COM8, COM9, 
	//LPT1, LPT2, LPT3, LPT4, LPT5, LPT6, LPT7, LPT8 and LPT9
	//var account=_ALL_ACCOUNT.split("#");
	//var all_arrays=reject_account.concat(account);

	reject_account=$.map(reject_account, function(n)
	{
		return(n.toUpperCase());
	});
	
	//if(reject_account.indexOf(name.toUpperCase())!=-1)	//ie8 not work
	if($.inArray(name.toUpperCase(),reject_account )!=-1)
	{
		if(_adminFlag==1 && name.toUpperCase()=="ADMIN") 
		{
			_adminFlag=0;
			return 2;
		}
		
		return 0;
	}
	else
	{
		_adminFlag=0;
		var account=allaccount.split("#");
		for(i=0;i<account.length;i++)
		{
			if(account[i]==name)
			{
				return 1;
		}
		}
		
		return 2;
	}
}
function getCookie(name) {
	var arg = escape(name) + "=";
	var nameLen = arg.length;
	var cookieLen = document.cookie.length;
	var i = 0;

	while (i < cookieLen) {
		var j = i + nameLen;
		if (document.cookie.substring(i, j) == arg)
			return getCookieValueByIndex(j);
		i = document.cookie.indexOf(" ", i) + 1;
		if (i == 0) break;
	}
	return null;

}

function getCookieValueByIndex(startIndex) {
	var endIndex = document.cookie.indexOf(";", startIndex);
	if (endIndex == -1)
		endIndex = document.cookie.length;
	return unescape(document.cookie.substring(startIndex, endIndex));
}

function Home_Load_CURRENT_HD_INFO()
{
	var my_xml_file = "/xml/current_hd_info.xml?id="+ (new Date()).getTime();
	wd_ajax({
				url: my_xml_file,
				type: "POST",
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml){
					HOME_XML_CURRENT_HD_INFO = xml;
			},
      error:function (xhr, ajaxOptions, thrownError){}  
	});
}
function Home_Load_SYSINFO()
{
	var my_xml_file = "/xml/sysinfo.xml?id="+ (new Date()).getTime();
	wd_ajax({
		url: my_xml_file, 
		type: "POST",
		async:false,
		cache:false,
		dataType:"xml",
		success: function(xml){
			HOME_XML_SYSINFO = xml;
		},
		error: function (xhr, ajaxOptions, thrownError){},
		complete: function() {
			clearTimeout(home_sysinfo_timeout);
			home_sysinfo_timeout = -1;
			home_sysinfo_timeout = setTimeout(function() { Home_Load_SYSINFO(); }, 30000);
		}
	});	
}
function HD_Status(flag,callback) {
	/*
		flag : 0 -> itunes / scan disk, check volume
			   1 -> Format Disk / S.M.A.R.T. Test ...
	*/
	if (HOME_XML_CURRENT_HD_INFO == "")//re-load current_hd_info.xml
	{
		Home_Load_CURRENT_HD_INFO();
	}
	
	var msg = (parseInt(flag) == 0) ? 0 : 5;
	var my_hd_num = 0;
	$('item', HOME_XML_CURRENT_HD_INFO).each(function(e){
		if ($('allowed',this).text() == "1") my_hd_num++;
	});
	if ( (my_hd_num == 0) && parseInt(flag,10) == 1) 
	{
		if(callback) 
		{
			callback(msg);
		}
		else		
		return msg;
	}
	
	wd_ajax({
			type: "POST",
			cache: false,
			url: "/cgi-bin/hd_config.cgi",
			data: {
				cmd: 'cgi_Volume_Status',
				f_flag: flag
			},
			dataType: "xml",
			success: function (xml) {
				msg = $(xml).find('state').text();
				
				if(callback) 
				{
					callback(msg);
				}
				else
					return msg;
			} //end of success
	}); //end of //end of wd_ajax({
			
	/*	msg:
		0 -> no volume 
		1 -> volume is ok
		2 -> S.M.A.R.T. Test now		
		3 -> Formating now
		4 -> Scaning Disk 
		5 -> no disk 
		6 -> disks sequence are not valid.
	*/

	
}

function detectBrowser() {
	var sAgent = navigator.userAgent.toLowerCase();

	this.isGoogle = (sAgent.indexOf("chrome") != -1);
	this.isIE = (sAgent.indexOf("msie") != -1); //IE6.0-7
	this.isIE7 = (sAgent.indexOf("msie 7") != -1); //IE7
	this.isIE8 = (sAgent.indexOf("msie 8") != -1); //IE8
	this.isIE9 = (sAgent.indexOf("msie 9") != -1); //IE9
	this.isIE10 = (sAgent.indexOf("msie 10") != -1); //IE10
	this.isFF = (sAgent.indexOf("firefox") != -1); //firefox
	if (!this.isGoogle)
		this.isSa = (sAgent.indexOf("safari") != -1); //safari
	this.isOp = (sAgent.indexOf("opera") != -1); //opera
	this.isNN = (sAgent.indexOf("netscape") != -1); //netscape
	this.isMa = this.isIE; //marthon
	this.isOther = (!this.isIE && !this.isFF && !this.isSa && !this.isOp && !this.isNN && !this.isSa && !this.isGoogle); //unknown Browser
}

function hide(eid) {
	if (document.getElementById(eid) == null) return;
	document.getElementById(eid).style.display = 'none';
}

function hide2(eid) {
	if (document.getElementById(eid) == null) return;
	document.getElementById(eid).style.visibility = 'hidden';
}

function show(eid) {
	if (document.getElementById(eid) == null) return;
	document.getElementById(eid).style.display = '';
}

function show1(eid) {
	if (document.getElementById(eid) == null) return;
	// 	document.getElementById(eid).style.display = '';  
	document.getElementById(eid).style.visibility = 'visible';
}
//check ip

function IP2V(ip) {
	var re = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/;
	if (re.test(ip)) {
		return true;
	} else {
		return false;
	}
}

function ChkIPAddress(ip) {
	var mt1 = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);

	if (mt1 == null) return 1;

	if (127 == parseInt(mt1[1])) {
		return 1;
	} else
		return 0;

}

function validateKey(str) {
	for (var i = 0; i < str.length; i++) {
		if ((str.charAt(i) >= '0' && str.charAt(i) <= '9') || (str.charAt(i) == '.'))
			continue;
		return 0;
	}
	return 1;
}

function getDigit(str, num) {
	i = 1;
	if (num != 1) {
		while (i != num && str.length != 0) {
			if (str.charAt(0) == '.') {
				i++;
			}
			str = str.substring(1);
		}
		if (i != num)
			return -1;
	}
	for (i = 0; i < str.length; i++) {
		if (str.charAt(i) == '.') {
			str = str.substring(0, i);
			break;
		}
	}
	if (str.length == 0)
		return -1;
	d = parseInt(str, 10);
	return d;
}

function checkDigitRange(str, num, min, max) {
	d = getDigit(str, num);
	if (d > max || d < min)
		return false;
	return true;
}
var subnet_mask = new Array(0, 128, 192, 224, 240, 248, 252, 254, 255);

function check_mask(my_mask) {
	//var temp_mask = my_mask.addr;	
	//var temp_mask = my_mask;						
	var temp_mask = my_mask.split(".") // my_mask.addr;	
	var in_range = false;
	var error;

	for (var i = 0; i < temp_mask.length; i++) {
		var mask = parseInt(temp_mask[i], 10);

		for (var j = 0; j < subnet_mask.length; j++) {
			if (mask == subnet_mask[j]) {

				in_range = true;
				break;
			} else {

				in_range = false;
			}
		}

		if (!in_range) { // when not in the subnet mask range

			//error = "The subnetmask you input is incorrect.The subnetmask should be continuous."
			error = _T('_ip', 'msg1');
			jAlert(error, "warning");
			return false;
		}

	}
	return true;
}

function check_2LAN_mask(function_id, lan_tb, lan_flag, lan_array, netmask_array) {
	if (function_id == "wizard") {
		var ip1 = new Array($("#w_lan1_tb input[name='f_ip1']").val(), $("#w_lan1_tb input[name='f_ip2']").val(), $("#w_lan1_tb input[name='f_ip3']").val(), $("#w_lan1_tb input[name='f_ip4']").val());
		var ip2 = new Array($("#w_lan2_tb input[name='f_ip1']").val(), $("#w_lan2_tb input[name='f_ip2']").val(), $("#w_lan2_tb input[name='f_ip3']").val(), $("#w_lan2_tb input[name='f_ip4']").val());
		var netmask1 = new Array($("#w_lan1_tb input[name='f_netmask1']").val(), $("#w_lan1_tb input[name='f_netmask2']").val(), $("#w_lan1_tb input[name='f_netmask3']").val(), $("#w_lan1_tb input[name='f_netmask4']").val());
		var netmask2 = new Array($("#w_lan2_tb input[name='f_netmask1']").val(), $("#w_lan2_tb input[name='f_netmask2']").val(), $("#w_lan2_tb input[name='f_netmask3']").val(), $("#w_lan2_tb input[name='f_netmask4']").val());
	} else {
		var ip1 = new Array($(lan_tb + " input[name='f_ip1']").val(), $(lan_tb + " input[name='f_ip2']").val(), $(lan_tb + " input[name='f_ip3']").val(), $(lan_tb + " input[name='f_ip4']").val());
		var netmask1 = new Array($(lan_tb + " input[name='f_netmask1']").val(), $(lan_tb + " input[name='f_netmask2']").val(), $(lan_tb + " input[name='f_netmask3']").val(), $(lan_tb + " input[name='f_netmask4']").val());
		if (lan_flag == 0) {
			var ip_tmp = lan_array[1].split(".");
			var ip2 = new Array(ip_tmp[0], ip_tmp[1], ip_tmp[2], ip_tmp[3]);
			var netmask_tmp = netmask_array[1].split(".");
			var netmask2 = new Array(netmask_tmp[0], netmask_tmp[1], netmask_tmp[2], netmask_tmp[3]);
		} else {
			var ip_tmp = lan_array[0].split(".");
			var ip2 = new Array(ip_tmp[0], ip_tmp[1], ip_tmp[2], ip_tmp[3]);
			var netmask_tmp = netmask_array[0].split(".");
			var netmask2 = new Array(netmask_tmp[0], netmask_tmp[1], netmask_tmp[2], netmask_tmp[3]);
		}
	}
}

function check_field_lan(function_id, lan_tb) {
	var _ip = $(lan_tb + " input[name='settings_networkIP_text']").val();
	_ip = _ip.split(".");

	var _netmask = $(lan_tb + " input[name='settings_networkMask_text']").val();
	_netmask = _netmask.split(".");

	var _gateway = $(lan_tb + " input[name='settings_networkGW_text']").val();
	_gateway = _gateway.split(".");

	var _dns1 = $(lan_tb + " input[name='settings_networkDNS1_text']").val();
	_dns1 = _dns1.split(".");

	var _dns2 = $(lan_tb + " input[name='settings_networkDNS2_text']").val();
	_dns2 = _dns2.split(".");

	var _dns3 = $(lan_tb + " input[name='settings_networkDNS3_text']").val();
	_dns3 = _dns3.split(".");

	var network_value = new Array($(lan_tb + " input[name='settings_networkIP_text']"), $(lan_tb + " input[name='settings_networkMask_text']"), $(lan_tb + " input[name='settings_networkGW_text']"));
	var dns_value = new Array($(lan_tb + " input[name='settings_networkDNS1_text']"), $(lan_tb + " input[name='settings_networkDNS2_text']"), $(lan_tb + " input[name='settings_networkDNS3_text']"));
	var field_ip = new Array($(lan_tb + " input[name='settings_networkIP_text']"), $(lan_tb + " input[name='settings_networkMask_text']"),
		$(lan_tb + " input[name='settings_networkGW_text']"), $(lan_tb + " input[name='settings_networkDNS1_text']"),
		$(lan_tb + " input[name='settings_networkDNS2_text']"), $(lan_tb + " input[name='settings_networkDNS3_text']"));

	var msg_ip = new Array(_T('_ip', 'msg2'), //"Please enter an IP address",
		_T('_ip', 'msg3'), //"Only numbers can be used as IP address values.",
		_T('_ip', 'msg4'), //"Invalid IP address. The first set of numbers must range between 1 and 254.",
		_T('_ip', 'msg5'), //"Invalid IP address. The second set of numbers must range between 0 and 254.",
		_T('_ip', 'msg6'), //"Invalid IP address. The third set of numbers must range between 0 and 254.",
		_T('_ip', 'msg7'), //"Invalid IP address. The fourth set of numbers must range between 1 and 254.",
		_T('_ip', 'msg8'), //"Not a valid IP address.",
		_T('_ip', 'msg9') //"Invalid IP Address. Please try again."
	);

	var msg_submask = new Array(_T('_ip', 'msg10'), //"Please enter an subnet mask address",
		_T('_ip', 'msg3'), //"Only numbers can be used as subnet mask address values.",
		_T('_ip', 'msg12'), //"Invalid subnet mask address. The first set of numbers must range between 1 and 254.",
		_T('_ip', 'msg13'), //"Invalid subnet mask address. The second set of numbers must range between 0 and 254.",
		_T('_ip', 'msg14'), //"Invalid subnet mask address. The third set of numbers must range between 0 and 254.",
		_T('_ip', 'msg15'), //"Invalid subnet mask address. The fourth set of numbers must range between 1 and 254.",
		_T('_ip', 'msg16'), //"Not a valid subnet mask address.",
		_T('_ip', 'msg17') //"Invalid subnet mask Address. Please try again."
	);

	var msg_gateway = new Array(_T('_ip', 'msg18'), //"Please enter an gateway address",
		_T('_ip', 'msg3'), //"Only numbers can be used as gateway address values.",
		_T('_ip', 'msg20'), //"Invalid gateway address. The first set of numbers must range between 1 and 254.",
		_T('_ip', 'msg21'), //"Invalid gateway address. The second set of numbers must range between 0 and 254.",
		_T('_ip', 'msg22'), //"Invalid gateway address. The third set of numbers must range between 0 and 254.",
		_T('_ip', 'msg23'), //"Invalid gateway address. The fourth set of numbers must range between 1 and 254.",
		_T('_ip', 'msg24'), //"Not a valid gateway address.",
		_T('_ip', 'msg25') //"Invalid gateway Address. Please try again."
	);

	var msg_dns = new Array(
		_T('_ip', 'msg3'), //"Only numbers can be used as DNS IP addresses.",
		_T('_ip', 'msg27'), //"Invalid DNS IP address. The first set of numbers must range between 1 and 255.",
		_T('_ip', 'msg28'), //"Invalid DNS IP address. The second set of numbers must range between 0 and 255.",
		_T('_ip', 'msg29'), //"Invalid DNS IP address. The third set of numbers must range between 0 and 255.",
		_T('_ip', 'msg30'), //"Invalid DNS IP address. The fourth set of numbers must range between 1 and 254.",
		_T('_ip', 'msg8') //"Not a valid IP address!"
	);

	var s_range_ip = new Array(1, 0, 0, 1);
	var e_range_ip = new Array(223, 255, 255, 254);
	var s_range_submask = new Array(1, 0, 0, 0);
	var e_range_submask = new Array(255, 255, 255, 255);
	var s_range_gateway = new Array(1, 0, 0, 0);
	var e_range_gateway = new Array(223, 255, 255, 255);

	var msg = new Array(msg_ip, msg_submask, msg_gateway);
	var s_range = new Array(s_range_ip, s_range_submask, s_range_gateway);
	var e_range = new Array(e_range_ip, e_range_submask, e_range_gateway);

	/*
	var v="";
	if (function_id == "set_route")
		v = 0;
	else
		v = $(lan_tb + " input:checked[name='f_dhcp_enable']").val()
	*/
	var v = $("#IPv4Mode_" + _LANPort).attr('rel');
	if (v == "0") {
		for (var i = 0; i < network_value.length; i++) {
			if (i == 2) {
				if (network_value[2].val() == "")
					continue;
			}

			for (k = 0; k < _ip.length; k++) {
				if (!validateKey(_ip[k])) {
					jAlert(msg[i][1], "warning");
					return 1;
				}
			}

			if (!checkDigitRange(network_value[i].val(), 1, s_range[i][0], e_range[i][0])) {
				jAlert(msg[i][2], "warning");
				field_ip[i][0].select();
				field_ip[i][0].focus();
				return 1;
			}

			if (!checkDigitRange(network_value[i].val(), 2, s_range[i][1], e_range[i][1])) {
				jAlert(msg[i][3], "warning");
				return 1;
			}

			if (!checkDigitRange(network_value[i].val(), 3, s_range[i][2], e_range[i][2])) {
				jAlert(msg[i][4], "warning");
				return 1;
			}

			if (!checkDigitRange(network_value[i].val(), 4, s_range[i][3], e_range[i][3])) {
				jAlert(msg[i][5], "warning");
				return 1;
			}

			if (ChkIPAddress(network_value[i].val())) {
				jAlert(msg[i][7], "warning");
				return 1;
			}
		}


		var mask = $(lan_tb + " input[name='settings_networkMask_text']").val()

		if (check_mask(mask) == false) {
			return 1;
		}

		if (function_id == "set_route")
			return 0;

		var tmp_ip = network_value[0].val();
		var tmp_netmask = network_value[1].val();
		var tmp_gateway = network_value[2].val();
		var tmp_dns1 = dns_value[0].val();
		var tmp_dns2 = dns_value[1].val();
		var tmp_dns3 = dns_value[2].val();
		var tmp_flag = ip_same_net(tmp_ip, tmp_netmask, tmp_gateway, tmp_dns1, tmp_dns2, tmp_dns3);

		var tcp_msg = _T('_ip', 'msg31'); //"You enter incorrect TCP/IP configuration. Please try again."
		if (tmp_flag == 2) {
			jAlert(tcp_msg, "warning");
			return 1;
		} else if (tmp_flag == 3) {
			jAlert(msg_ip[7], "warning");
			return 1;
		} else if (tmp_flag == 4) {
			jAlert(tcp_msg, "warning");
			return 1;
		} else if (tmp_flag == 5) {
			jAlert(tcp_msg, "warning");
			return 1;
		} else if (tmp_flag == 6) {
			jAlert(tcp_msg, "warning");
			return 1;
		} else if (tmp_flag == 7) {
			jAlert(tcp_msg, "warning");
			return 1;
		}
	}

	for (var i = 0; i < dns_value.length; i++) {
		if (dns_value[i].val() != "") {
			if (validateKey(dns_value[i].val()) == 0) {
				jAlert(msg_dns[0], "warning");
				return 1;
			}
			if (!checkDigitRange(dns_value[i].val(), 1, 1, 223)) {
				jAlert(msg_dns[1], "warning");
				return 1;
			}
			if (!checkDigitRange(dns_value[i].val(), 2, 0, 255)) {
				jAlert(msg_dns[2], "warning");
				return 1;
			}

			if (!checkDigitRange(dns_value[i].val(), 3, 0, 255)) {
				jAlert(msg_dns[3], "warning");
				return 1;
			}
			if (!checkDigitRange(dns_value[i].val(), 4, 0, 255)) {
				jAlert(msg_dns[4], "warning");
				return 1;
			}
			if (IP2V(dns_value[i].val()) == false) {
				jAlert(msg_dns[5], "warning");
				return 1;
			}

			if (dns_chechk_loopback(dns_value[i].val()) == 1) {
				jAlert(tcp_msg, "warning");
				return 1;
			}
		}
	}
	return 0;
}

function Check_DHCP_range(device_ip, device_mask, s_ip) {
	var v1 = device_ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	var v2 = device_mask.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	var v3 = s_ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);

	if (v1 == null || v2 == null || v3 == null) return 1;
	if (((v1[1] & v2[1]) == (v3[1] & v2[1])) && ((v1[2] & v2[2]) == (v3[2] & v2[2])) && ((v1[3] & v2[3]) == (v3[3] & v2[3])))
		return 1;
	else
		return 0;
}

function ip_same_net(ip, netmask, gateway, dns1, dns2) {
	var mt1 = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	var mt2 = netmask.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	var mt3 = gateway.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);

	if (mt1 == null || mt2 == null || mt3 == null) return 1;

	var loopback_flag = ip_chechk_loopback(ip) // check loopback address,ex:127.x.x.x
	var broadcast_flag = ip_check_broadcast(ip, netmask, gateway); // check broadcast address	
	var gw_flag = gw_chechk_loopback(gateway)
	//	var dns_flag1 = dns_chechk_loopback(dns1)
	//	var dns_flag2 = dns_chechk_loopback(dns2)
	var subnet_flag = subnet_chechk_loopback(netmask)

	/*
		0 -> no error,
		1 -> IP address error
		2 -> broadcast address	error 
		3 -> loopback address error
		4 -> gw address error
	*/

	if (
		(gateway.length == 0) &&
		(loopback_flag == 0) &&
		(broadcast_flag == 0) && (gw_flag == 0) &&
		(subnet_flag == 0))
		return 0
	else if (
		(gateway.length != 0) &&
		((mt1[1] & mt2[1]) == (mt2[1] & mt3[1])) &&
		((mt1[2] & mt2[2]) == (mt2[2] & mt3[2])) &&
		((mt1[3] & mt2[3]) == (mt2[3] & mt3[3])) &&
		((mt1[4] & mt2[4]) == (mt2[4] & mt3[4])) &&
		(loopback_flag == 0) &&
		(broadcast_flag == 0) && (gw_flag == 0) &&
		(subnet_flag == 0))
		return 0
	else if (broadcast_flag == 1)
		return 2
	else if (loopback_flag == 1)
		return 3
	else if (gw_flag == 1)
		return 4;
	//	else if(dns_flag1==1)
	//		return 5;
	//	else if(dns_flag2==1)
	//		return 6;
	else if (subnet_flag == 1)
		return 7;
	else
		return 2;
}

function ip_check_broadcast(ip, netmask, gateway) {
	var n = parseInt(255, 10);

	var mt1 = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	var mt2 = netmask.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	var mt3 = gateway.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);

	if (mt1 == null || mt2 == null || mt3 == null) return 1;

	var ip_broadcast = ((n - mt2[1]) | mt1[1]) + "." + ((n - mt2[2]) | mt1[2]) + "." + ((n - mt2[3]) | mt1[3]) + "." + ((n - mt2[4]) | mt1[4]);

	/*
	var netmask_not=(n-mt2[1])+"."+(n-mt2[2])+"."+(n-mt2[3])+"."+(n-mt2[4]);
	var mesg = "IP:"+mt1[1]+"."+mt1[2]+"."+mt1[3]+"."+mt1[4]+"\n";
		mesg += "NetMask:"+mt2[1]+"."+mt2[2]+"."+mt2[3]+"."+mt2[4]+"\n";
		mesg += "Gateway:"+mt3[1]+"."+mt3[2]+"."+mt3[3]+"."+mt3[4]+"\n";
		mesg += "------------------------------------------\n"
		mesg += "NetMask(Not):"+netmask_not+"\n";
		mesg += "Broadcast:"+ip_broadcast+"\n";
	*/

	if ((ip == ip_broadcast) || (netmask == ip_broadcast) || (gateway == ip_broadcast)) {
		return 1;
	} else
		return 0;
}

function ip_chechk_loopback(ip) {
	var mt1 = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);

	if (mt1 == null) return 1;

	if (127 == parseInt(mt1[1])) {
		return 1;
	} else
		return 0;
}

function subnet_chechk_loopback(subnet) {
	var mt1 = subnet.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);

	if (mt1 == null) return 1;

	if (127 == parseInt(mt1[1])) {
		return 1;
	} else
		return 0;
}

function gw_chechk_loopback(gw) {
	if (gw.length == 0)
		return 0;

	var mt1 = gw.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);

	if (mt1 == null) return 1;

	if (127 == parseInt(mt1[1])) {
		return 1;
	} else
		return 0;
}

function dns_chechk_loopback(dns) {
	if (dns.length == 0)
		return 0;

	var mt1 = dns.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);

	if (mt1 == null) return 1;

	if (127 == parseInt(mt1[1])) {
		return 1;
	} else
		return 0;
}
var HDD_INFO_ARRAY = new Array();

function do_query_HD_Mapping_Info() {
	HDD_INFO_ARRAY = new Array();

	wd_ajax({
			type: "POST",
			async: false,
			cache: false,
			url: "/cgi-bin/remote_backup.cgi",
			data: "cmd=cgi_get_HD_Mapping_Info",
			dataType: "xml",
			success: function (xml) {
				//alert(xml)	
				$(xml).find('item').each(function () {

						var info = $(this).find('data').text(); //Volume_1:/mnt/HD/HD_a2 

						HDD_INFO_ARRAY.push(info);

					});
			},
			error: function (xmlHttpRequest, error) {
				//alert("Error: " +error);   
			}

		});
}

function do_query_USB_Mapping_Info() {
	HDD_INFO_ARRAY = new Array();

	wd_ajax({
			type: "POST",
			async: false,
			cache: false,
			url: "/cgi-bin/folder_tree.cgi",
			data: "cmd=cgi_get_USB_Mapping_Info",
			dataType: "xml",
			success: function (xml) {
				$(xml).find('item').each(function () {
						var info = $(this).find('data').text();
						HDD_INFO_ARRAY.push(info);
					});
			},
			error: function (xmlHttpRequest, error) {}
		});
}

var HDD_NANE_INFO = new Array();
var USB_NANE_INFO = new Array();

function get_Name_Mapping_Hame(_type) {
	var _HDD_NANE_INFO = new Array();
	var _USB_NANE_INFO = new Array();

	$.ajax({
			type: "POST",
			cache: false,
			url: "/web/get_share_name_list.php",
			data: _type, //HDD or USB
			dataType: "json",
			success: function (r) {
				if (!r.success) return;

				var items = r.item;
				for (var k in items)
				{
					if (items[k]['path'].indexOf("/mnt/HD/") != -1) //HDD
						_HDD_NANE_INFO[items[k]['share_name']] = items[k]['path'];  //HDD_NANE_INFO['Public'] = /mnt/HD/HD_a2/Public;
					else if (items[k]['path'].indexOf("/mnt/USB/") != -1) //USB
						_USB_NANE_INFO[items[k]['share_name']] = items[k]['path'];  //USB_NANE_INFO['Drive_3S_USB20-1'] = /mnt/USB/USB1_a1;
				}

				HDD_NANE_INFO.length = 0;
				HDD_NANE_INFO = _HDD_NANE_INFO;

				USB_NANE_INFO.length = 0;
				USB_NANE_INFO = _USB_NANE_INFO;
			},
			error: function (xmlHttpRequest, error) {
				//alert("Error: " +error);
			},
			complete: function() {
				get_name_mapping_interval_hdd = setTimeout('get_Name_Mapping_Hame("")', 5000);
			}
		});
}
function translate_path_to_display(_path) // input: /mnt/HD/HD_a2/XXX or /mnt/USB/USB1_a1/YYY, Output: XXX or Drive_3S_USB20-1/YYY
{
	var display_path = "";
	var del_slash_flag = 0;
	var done = 0;

	if (_path.length == 0) return display_path;

	if (_path.substring(0, 5) != "/mnt/") return _path.substring(1);

	if (_path.charAt(_path.length-1) != "/") {
		_path += "/";
		del_slash_flag = 1;
	}

	for (var key in HDD_NANE_INFO) //Try HDD
	{
		if (_path.indexOf(HDD_NANE_INFO[key]) != 0)
			continue;

		display_path = _path.replace(HDD_NANE_INFO[key], key);
		done = 1;
	}

	if (done == 0) //Try USB
	{
		for (var key in USB_NANE_INFO) //Try USB
		{
			if (_path.indexOf(USB_NANE_INFO[key]) != 0)
				continue;

			display_path = _path.replace(USB_NANE_INFO[key], key);
			done = 1;
		}
	}

	if (del_slash_flag == 1)
		display_path = display_path.substring(0, display_path.length - 1);

	return display_path;
}

function translate_path_to_really(_path) //input: XXX or Drive_3S_USB20-1/YYY, Output: /mnt/HD/HD_a2/XXX or /mnt/USB/USB1_a1/YYY
{
	var really_path = "";
	var del_slash_flag = 0;
	var done = 0;

	if (_path.length == 0) return really_path;
	if (_path.charAt(_path.length-1) != "/") {
		_path += "/";
		del_slash_flag = 1;
	}

	for (var key in HDD_NANE_INFO) //Try HDD
	{
		if (_path.indexOf(key + "/") != 0)
			continue;

		really_path = _path.replace(key, HDD_NANE_INFO[key]);
		done = 1;
	}

	if (done == 0) //Try USB
	{
		for (var key in USB_NANE_INFO) //Try HDD
		{
			if (_path.indexOf(key + "/") != 0)
				continue;

			really_path = _path.replace(key, USB_NANE_INFO[key]);
			done = 1;
		}
	}

	if (del_slash_flag == 1)
		really_path = really_path.substring(0, really_path.length - 1);

	return really_path;
}

var old_path = "";

function open_folder_selecter_checkbox_click_callback_fn(o)
{
	var chk_sel_ele = $("input:checkbox:checked[name=folder_name]", $("#" + o.ID));

	var ele = $("#SelectPathDiag .OK");
	if (chk_sel_ele.length > 0)
		ele.removeClass('gray_out');
	else
		ele.removeClass('gray_out').addClass('gray_out');
}

function open_folder_selecter(o) //diag_title, target_text_id, show_file, chkflag)
{
	$("#SelectPathDiag").hide();
	$("#SelectPathDiag #SelectPathDiag_title").html(o.title);

	__file = o.showfile;
	__chkflag = o.chkflag; //for show check box	1:show, 0:not

	if (o.device == undefined || o.device == "ALL") {
		do_query_HD_Mapping_Info();
		do_query_USB_Mapping_Info();
	} else if (o.device == "HDD")
		do_query_HD_Mapping_Info();
	else if (o.device == "USB")
		do_query_USB_Mapping_Info();

	$('#folder_selector').fileTree({
			root: o.root,
			cmd: o.cmd,
			script: o.script,
			effect: o.effect,
			formname: o.formname,
			textname: o.textname,
			filetype: o.filetype,
			function_id: o.function_id,
			checkbox_all: o.checkbox_all,
			chk: o.chk,
			share: o.share,
			multi_select: o.multi_select,
			max_select: o.max_select,
			over_select_msg: o.over_select_msg,
			single_select: o.single_select,
			host: o.host,
			user: o.user,
			pwd: o.pwd,
			lang: o.lang,
			checkbox_click_callback: open_folder_selecter_checkbox_click_callback_fn,
		}, function (file) {
			if (typeof (o.callback) == "function")
				o.callback(file);
		}
	);

	old_path = $("#" + o.textname).val(); //record last select path

	var select_folder_diag = $("#SelectPathDiag").overlay({
			oneInstance: false,
			expose: '#000',
			api: true,
			closeOnClick: false,
			closeOnEsc: false
		});
	select_folder_diag.load();
	_DIALOG = select_folder_diag;
	init_button();
	language();
	ui_tab("#SelectPathDiag","#folder_selector ul li:eq(0) a","#home_treeOk_button"); 

	$("#SelectPathDiag .close").click(function () { //Cancel Button
		$("#" + o.textname).val(old_path);
		old_path = "";
		select_folder_diag.close();
		$("#SelectPathDiag *").unbind();
		if (typeof (o.afterCancel) == "function")
			o.afterCancel();
	});

	$("#SelectPathDiag .OK").click(function () { //OK Button
		if ($(this).hasClass("gray_out")) return;

		old_path = "";
		select_folder_diag.close();
		$("#SelectPathDiag *").unbind();
		if (typeof (o.afterOK) == "function")
			o.afterOK();
	})
	.removeClass('gray_out')
	.addClass('gray_out');
}

var t_size = 1000;

function numberFormat(number, maxLength){
  if (typeof(maxLength) !== 'undefined' && maxLength > 0){
    var numStr = number + "";
    if (numStr.length > maxLength){
      var decPos = numStr.indexOf('.');
      if (decPos >=0 &&  numStr.length - 1 > maxLength){
        if (decPos >= maxLength){
          number = Math.floor(number);
        }else{
          var decimal_digits = maxLength - decPos;
          number = Math.floor(number*decimal_digits*10)/(decimal_digits*10);
        }
      }
    }
  }
  return number;
}

//add_type_str: ture/false
function size2str(size_str, t_type, add_type_str, maxLength) {
	var size = parseInt(size_str);
	var strSize = "";
	var return_type_str = true;

	if (t_type == undefined)
		t_type = "";
	
	if (add_type_str === false)
		return_type_str = false;

	var strSizeFloat = '';
	switch (t_type) {
	case "TB":
		strSize = String.format("{0}{1}", numberFormat(Math.floor(size / Math.pow(t_size, 4) * 100) / 100, maxLength), (return_type_str) ? " TB": "");
		break;
	case "GB":
		strSize = String.format("{0}{1}", numberFormat(Math.floor(size / Math.pow(t_size, 3) * 100) / 100, maxLength), (return_type_str) ? " GB": "");
		break;
	case "MB":
		strSize = String.format("{0}{1}", numberFormat(Math.floor(size / Math.pow(t_size, 2) * 100) / 100, maxLength), (return_type_str) ? " MB": "");
		break;
	case "KB":
		strSize = String.format("{0}{1}", numberFormat(Math.floor(size / Math.pow(t_size, 1) * 100) / 100, maxLength), (return_type_str) ? " KB": "");
		break;
	default:
		if (size >= Math.pow(t_size, 4) || (Math.round(numberFormat(Math.round(size / Math.pow(t_size, 3) * 100) / 100, maxLength))+"").length > maxLength )
			strSize = String.format("{0}{1}", numberFormat(Math.floor(size / Math.pow(t_size, 4) * 100) / 100, maxLength), (return_type_str) ? " TB" : "");
		else if (size >= Math.pow(1000, 3) || (Math.round(numberFormat(Math.round(size / Math.pow(t_size, 2) * 100) / 100, maxLength))+"").length > maxLength )
			strSize = String.format("{0}{1}", numberFormat(Math.floor(size / Math.pow(t_size, 3) * 100) / 100, maxLength), (return_type_str) ? " GB": "");
		else if (size >= Math.pow(1000, 2) || (Math.round(numberFormat(Math.round(size / Math.pow(t_size, 1) * 100) / 100, maxLength))+"").length > maxLength)
			strSize = String.format("{0}{1}", numberFormat(Math.floor(size / Math.pow(t_size, 2) * 100) / 100, maxLength), (return_type_str) ? " MB": "");
		else if (size >= Math.pow(1000, 1))
			strSize = String.format("{0}{1}", numberFormat(Math.floor(size / Math.pow(t_size, 1) * 100) / 100, maxLength), (return_type_str) ? " KB": "");
		else
			strSize = "0";
		break;
	}

	try {
		return strSize;
	} finally {
		strSize = null;
	}
}

String.format = function () {
	if (arguments.length == 0)
		return null;
	if (arguments.length == 1)
		return arguments[0];
	var str = arguments[0];
	var i, j;
	var re_idx = 0;
	var re = '';
	for (i = 1; i < arguments.length; i++) {
		arguments[i] = escape(arguments[i]);
		re = new RegExp('\\{' + (re_idx) + '\\}', 'gm');
		str = str.replace(re, arguments[i]);
		re = null;
		re_idx++;
	}

	str = unescape(str);

	try {
		return str;
	} finally {
		str = null;
	}
}


var _ADS_ENABLE = "";

function get_ads_enable() {
	var ads_enable = "";

	wd_ajax({
			type: "POST",
			url: "/cgi-bin/account_mgr.cgi",
			data: "cmd=cgi_get_ads_info",
			cache: false,
			async: false,
			dataType: "xml",
			success: function (xml) {
				ads_enable = $(xml).find('enable').text();
			}
		});
	_ADS_ENABLE = ads_enable;
	return ads_enable;
}



function chk_first_char(str) {
	//0-9 a-z A-Z
	str = str.charAt(0);

	var mt = str.match(/[^\sa-zA-Z0-9]/);
	if (mt)
		return 1;
	else
		return 0;
}



function chg_path(path) {
	var new_path = "";
	for (k = 0; k < HDD_INFO_ARRAY.length; k++) {
		var str = HDD_INFO_ARRAY[k].split(":"); //Volume_1:/mnt/HD/HD_a2

		if (path.indexOf(str[1]) != -1) {
			if (path == str[1])
				new_path = str[0];
			else
				new_path = str[0] + path.substring(13, path.length);
		}
	}
	new_path = new_path.replace(/\s/g, '&nbsp;');
	return new_path;
}

function chg_path1(path) {	
	var new_path = "";
	for (k = 0; k < HDD_INFO_ARRAY.length; k++) {
		var str = HDD_INFO_ARRAY[k].split(":"); //Volume_1:/mnt/HD/HD_a2
		if (path.indexOf(str[0]) != -1) {
			if (path == str[0])
				new_path = str[1];
			else {

				new_path = str[1] + path.substring(str[0].length, path.length);

			}
		}
	}

	new_path = new_path.replace(/\s/g, '&nbsp;');	
	return new_path;
}

function INTERNAL_DIADLOG_BUT_UNBIND(idx) {
//	var my_id = "#" + idx + " .LightningButton";
//	$(my_id).each(function (i) {
//
//			if (typeof $(this).attr('id') != "undefined") {
//				$("#" + $(this).attr('id')).unbind('click');
//			}
//		});
//	my_id = "#" + idx + " *";

	$("#" + idx + " *").unbind('click');
	
	$("#"+idx+" input[type=checkbox]").parents('label').removeClass('LightningCheckbox');
}

function INTERNAL_DIADLOG_DIV_HIDE(idx) {
	var my_id = "#" + idx + " .WDLabelBodyDialogue";
	$(my_id).each(function (n) {
			$("#" + $(this).parent().attr('id')).hide();
		});

}

function volcapacity(my_size) {
	var val = "";
	if (parseInt(my_size, 10) < BLOCKS_1G_GIBYTES) //MB
	{
		val = INTERNAL_FMT_Get_Mbytes(my_size, 2) + " MB";
	} else {
		var val = INTERNAL_FMT_Get_Gibytes(my_size, 2) + " GB";

		if (parseInt(val) > 1024)
			val = INTERNAL_FMT_Get_Tibytes(my_size, 2) + " TB";
	}

	return val;
}

function checkmail(mail) {
	
	//emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
	
	emailRule = /^([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9\-])+$/; //SKY-4200
	
	//validate ok or not
	if(mail.search(emailRule)!= -1)
	{		
		return 0;
	}	
	else
	{		
		return 1;
	} 
}

function ui_tab(obj,first,last) {
	$(obj + " " +first).focus();
	$(obj + " " +last).keydown(function (e) {
				if (e.keyCode == 9) {
						$(obj + " " +first).focus();
					return false;
				}
			});
}	


function init_scroll(scrollbar) {
	$(scrollbar).jScrollPane();
}

function adjust_dialog_size(obj, w, h) {
	if (w != 0) {
		if (w < 534) w = 534; //SPEC, v12, min-width
		$(obj).width(w + "px");
		$(obj + " .WDLabelBodyDialogue").each(function (i) {
			$(this).width((w - 80) + "px");
		});

		$(obj + " .hr").each(function (i) {
			$(this).width((w - 50) + "px");
		});
	}

	if (h != 0) {
		if (h < 264) h = 264; //SPEC, v12, min-height
		$(obj + ".WDLabelDiag").height(h + "px");
		$(obj + " .WDLabelBodyDialogue").each(function (i) {
				$(this).height((h - 160) + "px");
			});
	}
}
if (MODEL_NAME == "GLCR" || MODEL_NAME =="BAGX")
{
	var count_num = 40;
	var reboot_count_num = 40;
}
else
{
        var count_num = 100;
	var reboot_count_num = 100;
}		
var directory_ip = "";
var reboot_timeout = -1;
var rebootTimeOutMax =      360000; // 6 minutes
var rebootTimeOutLongMax = 1200000; // 20 minutes
var rebootStartTimeStamp = 0;
var rebootCurrentTimeStamp = 0;
var rebootTimeout = rebootTimeOutMax;
var rebootFinishTimeout = -1;
function count() {	
	var v = parseInt(count_num,10);
	if (v == reboot_count_num)
	{
		get_config_ip();
	}
	if (v !=0)
	{		
		if (v == 1)
			rebootStartTimeStamp = new Date().getTime();
			
		reboot_timeout = setTimeout("count()",1000);
		count_num=count_num-1;
		return;
	}

	if (directory_ip != "" && directory_ip != window.location.hostname)
			setTimeout("goto_directory()",rebootTimeOutMax);
	else
	{	
	var v = ping();
	if (v != 0) {
		reboot_timeout = setTimeout("count()",1000);
	} else {
		clearTimeout(reboot_timeout);
		goto_login();
	}
}
}
function goto_login() {
	var str = "/";
	var sys_time = (new Date()).getTime();	
	setTimeout(function(){
		//location.href = str;
		window.location.reload(true);
	},1000);
}
function goto_directory()
{	 	
	location.href="http://"+directory_ip+"/";
}

var ping_status = -1;
function ping(){ 
    // avoid infinitely calling pingServer() by checking timeout
       rebootCurrentTimeStamp = new Date().getTime(); // in milliseconds
        if ((rebootCurrentTimeStamp - rebootStartTimeStamp) > rebootTimeout)
					 return 0;
       wd_ajax({
       	  type:"GET",
          url: '/system_ready.html?v='+new Date().getTime(),
          success: function(result){
            ping_status = 0;
            return false;
          },     
          error: function(result){
          	 ping_status = 1;
             return false;
          }
       });       
      return ping_status; 
}
function get_config_ip()
{
	wd_ajax({
			type: "POST",
			async: false,
			cache: false,
			url: "/xml/ip.xml",			
			dataType: "xml",
			success: function (xml) {
				$(xml).find('lan').each(function(){								
					directory_ip = $(this).find('ip').text();													
				});				
			},
			error: function (xmlHttpRequest, error) {				
			}
		});
	
}
function reboot_finish()
{
       clearTimeout(rebootFinishTimeout);		
       wd_ajax({
       	  type:"GET",
       	  async: true,
	  cache: false,
          url: '/system_boot.html?v='+new Date().getTime(),
          dataType: "html",
          success: function(result){
            count();
          },     
          error: function(result){
          	rebootFinishTimeout = setTimeout(reboot_finish,3000);
          }
       });				
}
function load_date_lang(language)
{
	var obj="";
	if (language == 0) obj = "en_US";
	else if (language == 1) obj = "fr_FR";
	else if (language == 2) obj = "it_IT";
	else if (language == 3) obj = "de_DE";
	else if (language == 4) obj = "es_ES";
	else if (language == 5) obj = "zh_CN";
	else if (language == 6) obj = "zh_TW";	
	else if (language == 7) obj = "ko_KR";
	else if (language == 8) obj = "ja_JP";
	else if (language == 9) obj = "ru_RU";
	else if (language == 10) obj = "pt_BR";
	else if (language == 11) obj = "cs_CZ";
	else if (language == 12) obj = "nl_NL";	
	else if (language == 13) obj = "hu_HU";
	else if (language == 14) obj = "nb_NO";
	else if (language == 15) obj = "pl_PL";
	else if (language == 16) obj = "sv_SE";
	else if (language == 17) obj = "tr_TR";
	loadScript("/web/jquery/locale/date-"+obj+".js?r=WDV1.01", null);
	loadScript("/web/jquery/locale/jquery.ui.datepicker-"+obj+".min.js?r=WDV1.01", null);
}

function loadScript(url, callback)
{
    // adding the script tag to the head as suggested before
   var head = document.getElementsByTagName('head')[0];
   var script = document.createElement('script');
   script.type = 'text/javascript';
   script.src = url;

   // then bind the event to the callback function 
   // there are several events for cross browser compatibility
   script.onreadystatechange = callback;
   script.onload = callback;
   // fire the loading
   head.appendChild(script);
}
function multi_lang_format_time(v)
{	
	var time = new Date(v);	
	var str="";
	
	if(TIME_FORMAT==12)
	{
		str = time.toString(Date.CultureInfo.formatPatterns.fullDateTime.replace(/H/g,"h"));
	}
	else
	{
		str = time.toString(Date.CultureInfo.formatPatterns.fullDateTime.replace(/tt/g,"").replace(/h/g,"H"));
	}
	
	str = str.replace(/\'/g, '');	
	return str;
}
function dev_reboot()
{
		wd_ajax({
				type:"POST",
				async:false,
				cache:false,
				url:"/cgi-bin/hd_config.cgi",
				data:{cmd:'cgi_Detect_Dangerous'},
				dataType: "xml",
				success: function(xml){		
					google_analytics_log('Manual_Reboot_Times','');
								
					var res = $(xml).find('res').text();
				
					if ( parseInt(res) != 0)	//volume format now,don't support restart and reboot
						jAlert( _T('_format','msg17'), _T('_common','error'));	//Text:Device shutdown or restarted is prohibited when disk formatting/firmware uploading is in progress.
					else
					{					
						jConfirm('M',_T('_system','msg2'),_T('_utilities','reboot'),'i',function(r){	//Text:Please wait a minute while the Lightning 4a is restarted before logging in again.					
						if(r)
						{							
								//document.form_restart.submit();
								setTimeout('stop_web_timeout();', 1000);	
	
								var overlayObj=$("#rebootDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
								overlayObj.load();	
								count();
								wd_ajax({
										type:"POST",
										async: true,
										cache: false,
										url: "/cgi-bin/system_mgr.cgi",
										data: "cmd=cgi_restart",
										success: function(data){				
														}			
									});//end of .ajax...
								
								
						}
					    });
					 }   
				}//end of success
			});	// end of ajax			 
}
function dev_shutdown()
{
	wd_ajax({
				type:"POST",
				async:false,
				cache:false,
				url:"/cgi-bin/hd_config.cgi",
				data:{cmd:'cgi_Detect_Dangerous'},
				dataType: "xml",
				success: function(xml){		
								
				google_analytics_log('Manual_Shutdown_Times','');
								
				var res = $(xml).find('res').text();
				
				if ( parseInt(res) != 0)	//volume format now,don't support restart and reboot
					jAlert( _T('_format','msg17'), _T('_common','error'));	//Text:Device shutdown or restarted is prohibited when disk formatting/firmware uploading is in progress.
				else
				{	
					jConfirm('M', _T('_system','msg4'),_T('_utilities','shutdown'),'i',function(r){
						if(r)
						{
								setTimeout('stop_web_timeout();', 1000);	
								var overlayObj=$("#shutdownDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
									overlayObj.load();										
							wd_ajax({
								type:"POST",
								async: false,
								cache: false,
								url: "/cgi-bin/system_mgr.cgi",
								data: "cmd=cgi_shutdown"
							});//end of .ajax...
						
						}//end of if(r)
					
					});//end of parent.jConfirm(...
				}	
				
				}//end of success
			});	// end of ajax
}
function show_save_button(e,objID,obj)
{
	if(obj && $(obj).hasClass('gray_out'))
{
		return;
	}
	
	if (e.keyCode!='9') show1(objID);
}

function get_admin_name()
{
	var name=""
	wd_ajax({
		type: "get",
		url: "/cgi-bin/login_mgr.cgi?cmd=cgi_get_language",		
		cache: false,
		async: false,
		dataType: "xml",
		success: function (xml) {
			name = $(xml).find('admin').text();
		}
	});

	return name;
}

jQuery.fn.center = function () {
	this.css("position","absolute").css("margin", "0");
	//this.css("top", Math.max(0, (($("#main_content").height() - $(this).outerHeight()) / 2) + 
	//                                            $("#main_content").scrollTop()) + "px");
    this.css("left", Math.max(0, (($("#main_content").width() - $(this).outerWidth()) / 2) + 
                                                $("#main_content").scrollLeft()) + "px");
    return this;
}

function set_mode(obj,val,afterOK)
{	    		
	$(obj).attr('rel',val);	//init rel value
	$( obj + " > button").each(function(index){
		if($(this).val()==val) 
			$(this).addClass('buttonSel');
		else
			$(this).removeClass('buttonSel');
	});
	if (typeof (afterOK) == "function")
	{		
		afterOK();
	}		
	$( obj + " > button").unbind("click");
	$( obj + " > button").click(function(index){
		$($(obj+ " > button").removeClass('buttonSel'))			
		$(this).addClass('buttonSel');
		$(obj).attr('rel',$(this).val());
		if (typeof (afterOK) == "function")
		{		
			afterOK();
		}		
	});	
	$(obj).show();	
}
var FW_VERSION="";
function get_fw_version()
{
	wd_ajax({
		type: "POST",
		async:false,
		cache:false,
		url: "/cgi-bin/system_mgr.cgi",
		data: "cmd=get_firm_v_xml",			
		success: function(xml){					
			var fw_text = $(xml).find("fw").text();				
			var v = fw_text.split(".",3);
			v = v.toString().replace(/,/gi, ".");
			FW_VERSION = v;
			$.cookie("fw_version", null);
			$.cookie('fw_version', FW_VERSION, { expires: 365 ,path: '/'});
		},
		error:function(xmlHttpRequest,error){   
			//alert("Error: " +error);   
		}
	});	
}
function get_smb_xml(callback)
{
	wd_ajax({
		type: "GET",
		cache: false,
		url: "/web/php/users.php",
		data:"cmd=getSmbXml",
		dataType: "xml",
		success: function(xml){
			if(callback) callback();
		}
		,
		 error:function(xmlHttpRequest,error){   
        		//alert("Get_User_Info->Error: " +error);   
  		 } 
	});	
}
function get_account_xml(loading,callback)
{
	if(loading=="Loading")
	{
		$(".userMenuList").html('<div class="waiting_msg"><img src="/web/images/SpinnerSun.gif?r=20150204" border=0>'+'</br></br>'+_T('_user','wait_uesrs')+"</div>");
	}
	wd_ajax({
		type: "GET",
		cache: false,
		url: "/web/php/users.php",
		data:"cmd=getAccountXml",
		dataType: "xml",
		success: function(xml){
			if(callback) callback();
		}
		,
		 error:function(xmlHttpRequest,error){   
        		//alert("Get_User_Info->Error: " +error);   
  		 } 
	});
}
function help_link()
{
	$('.bumper_help_link').unbind('click');
  $('.bumper_help_link').click(function () {
    adjust_dialog_size("#HelpDiag", 800, 604);
		$("#HelpDiag").overlay({fixed:false, left:110,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0}).load();
		$("#HelpDiag").css("top", "20px");
		
		var sys_time = (new Date()).getTime();
		var help_url = "";
		var WebHelp_update = "";
		
		var help_url = String.format("/web/WebHelp/{0}/{1}/index.htm?r={2}#", WEBHELP_UPDATE, lanagage_list[parseInt(MULTI_LANGUAGE, 10)],sys_time);
        
        if ($(this).hasClass('about_users')) {
            help_url = help_url + "user_about.htm";
        }
        else if ($(this).hasClass('adding_users')) {
            help_url = help_url + "user_add.htm";        
        }
        else if ($(this).hasClass('user_change_access')) {
            help_url = help_url + "user_change_access.htm";            
        }
        else if ($(this).hasClass('about_shares')) {
            help_url = help_url + "shares_about.htm";                
        }  
        else if ($(this).hasClass('share_add')) {
            help_url = help_url + "share_add.htm";                
        }
        else if ($(this).hasClass('about_cloud_access')) {
            help_url = help_url + "cloud_access_about.htm";                
        }  
        else if ($(this).hasClass('cloud_access_basics')) {
            help_url = help_url + "remote_basics.htm";                
        }  
        else if ($(this).hasClass('setting_up_cloud_access')) {
            help_url = help_url + "remote_access_setup_general.htm";                
        }
        else if ($(this).hasClass('about_groups')) {
            help_url = help_url + "what_are_user_groups_.htm";                
        }
        else if ($(this).hasClass('adding_groups')) {
            help_url = help_url + "creating_a_user_group.htm";                
        }       
        else if ($(this).hasClass('group_change_access')) {
            help_url = help_url + "assigning_share_access_for_a_group.htm";                
        }
        
        $("#help_iframe").attr('src', help_url);
    });
}

var HOME_GOOGLE_ANALYTICS = new Array();
//Home
HOME_GOOGLE_ANALYTICS['nav_dashboard'] = 'pv-home';
HOME_GOOGLE_ANALYTICS['nav_users'] = 'pv-users';
HOME_GOOGLE_ANALYTICS['nav_shares'] = 'pv-shares';
HOME_GOOGLE_ANALYTICS['nav_remoteaccess'] = 'pv-cloud-access';
HOME_GOOGLE_ANALYTICS['nav_safepoints'] = 'pv-backups';
HOME_GOOGLE_ANALYTICS['nav_storage'] = 'pv-storage';
HOME_GOOGLE_ANALYTICS['nav_addons'] = 'pv-app';
HOME_GOOGLE_ANALYTICS['nav_settings'] = 'pv-setting';
HOME_GOOGLE_ANALYTICS['Home-Capacity'] = 'pv-home-capacity';
HOME_GOOGLE_ANALYTICS['Home-Diagnostics'] = 'pv-home-diagnostic';
HOME_GOOGLE_ANALYTICS['Home-Firmware'] = 'pv-home-fw';
HOME_GOOGLE_ANALYTICS['Home-Cloud_Devices'] = 'cloud-device-num';
HOME_GOOGLE_ANALYTICS['Home-Users'] = 'pv-home-user';
HOME_GOOGLE_ANALYTICS['Home-Apps'] = 'pv-home-app';
HOME_GOOGLE_ANALYTICS['Help'] = 'pv-help';
HOME_GOOGLE_ANALYTICS['Manual_Shutdown_Times'] = 'shutdown-num';
HOME_GOOGLE_ANALYTICS['Manual_Reboot_Times'] = 'reboot-num';
HOME_GOOGLE_ANALYTICS['Manual_Logout_Times'] = 'logout-num';
//Storage
//HOME_GOOGLE_ANALYTICS['standard'] = 'raid-mode-jbod';
//HOME_GOOGLE_ANALYTICS['linear'] = 'raid-mode-spanning';
//HOME_GOOGLE_ANALYTICS['raid0'] = 'raid-mode0';
//HOME_GOOGLE_ANALYTICS['raid1'] = 'raid-mode1';
//HOME_GOOGLE_ANALYTICS['raid5'] = 'raid-mode5';
//HOME_GOOGLE_ANALYTICS['raid10'] = 'raid-mode10';
HOME_GOOGLE_ANALYTICS['RAID_Auto_Rebuild'] = 'raid-auto-rebuild-en';
HOME_GOOGLE_ANALYTICS['Storage-Disk_Status'] = 'pv-storage-disk';
HOME_GOOGLE_ANALYTICS['Volume_Virtualization_created'] = 'vv-created';
HOME_GOOGLE_ANALYTICS['Volume_Encryption'] = 'volume-encrypt-en';
HOME_GOOGLE_ANALYTICS['iscsi-en'] = 'iscsi-en';
HOME_GOOGLE_ANALYTICS['iscsi-isns-en'] = 'iscsi-isns-en';
HOME_GOOGLE_ANALYTICS['iscsi-target-num'] = 'iscsi-target-num';
//Apps
HOME_GOOGLE_ANALYTICS['P2P_Enabled'] = 'p2p-en';
HOME_GOOGLE_ANALYTICS['Apps_Installed_Svr_Num'] = 'app-instl-svr-num';
HOME_GOOGLE_ANALYTICS['Apps_Installed_Manul_Num'] = 'app-instl-manul-num';
HOME_GOOGLE_ANALYTICS['webfile-visit-num'] = 'webfile-visit-num';
HOME_GOOGLE_ANALYTICS['webfile-edit-num'] = 'webfile-edit-num';
//Settings - General
HOME_GOOGLE_ANALYTICS['time-format'] = 'time-format';
HOME_GOOGLE_ANALYTICS['date-format-ymd'] = 'date-format-ymd';
HOME_GOOGLE_ANALYTICS['date-format-mdy'] = 'date-format-mdy';
HOME_GOOGLE_ANALYTICS['date-format-dmy'] = 'date-format-dmy';
HOME_GOOGLE_ANALYTICS['cloudaccess-en'] = 'cloudaccess-en';
HOME_GOOGLE_ANALYTICS['cloudaccess-mode-auto'] = 'cloudaccess-mode-auto';
HOME_GOOGLE_ANALYTICS['cloudaccess-mode-manual'] = 'cloudaccess-mode-manual';
HOME_GOOGLE_ANALYTICS['cloudaccess-mode-winxp'] = 'cloudaccess-mode-winxp';
HOME_GOOGLE_ANALYTICS['dashboard-cloud-en'] = 'dashboard-cloud-en';
HOME_GOOGLE_ANALYTICS['tm-en'] = 'tm-en';
HOME_GOOGLE_ANALYTICS['autoclear-recycle-en'] = 'autoclear-recycle-en';
HOME_GOOGLE_ANALYTICS['power-sched-en'] = 'power-sched-en';
HOME_GOOGLE_ANALYTICS['auto-fw-en'] = 'auto-fw-en';

//Settings - network
HOME_GOOGLE_ANALYTICS['FTP_access_enabled'] = 'ftp-en';
HOME_GOOGLE_ANALYTICS['ddns-en'] = 'ddns-en';
HOME_GOOGLE_ANALYTICS['ipv6-en'] = 'ipv6-en';
HOME_GOOGLE_ANALYTICS['jumbo-frame-en'] = 'jumbo-frame-en';
HOME_GOOGLE_ANALYTICS['afp-en'] = 'afp-en';
HOME_GOOGLE_ANALYTICS['webdav-en'] = 'webdav-en';
HOME_GOOGLE_ANALYTICS['lltd-en'] = 'lltd-en';
HOME_GOOGLE_ANALYTICS['snmp-en'] = 'snmp-en';
HOME_GOOGLE_ANALYTICS['ssh-en'] = 'ssh-en';
HOME_GOOGLE_ANALYTICS['dfs-en'] = 'dfs-en';
HOME_GOOGLE_ANALYTICS['ads-en'] = 'ads-en';
HOME_GOOGLE_ANALYTICS['rmt-server-en'] = 'rmt-server-en';

//Settings - Media
HOME_GOOGLE_ANALYTICS['Media_Streaming_enabled'] = 'media-en';
HOME_GOOGLE_ANALYTICS['iTunes_enabled'] = 'itunes-en';
HOME_GOOGLE_ANALYTICS['camera-transfer-en'] = 'camera-transfer-en';
HOME_GOOGLE_ANALYTICS['camera-transfer-mode'] = 'camera-transfer-mode';
//Settings - notification
HOME_GOOGLE_ANALYTICS['alert-email-en'] = 'alert-email-en';
HOME_GOOGLE_ANALYTICS['sms-en'] = 'sms-en';
HOME_GOOGLE_ANALYTICS['alert-mode-all'] = 'alert-mode-all';
HOME_GOOGLE_ANALYTICS['alert-mode-crit-warn'] = 'alert-mode-crit-warn';
HOME_GOOGLE_ANALYTICS['alert-mode-crit'] = 'alert-mode-crit';
//Setting - UPS
HOME_GOOGLE_ANALYTICS['network-ups-en'] = 'network-ups-en';

//Remote backups
HOME_GOOGLE_ANALYTICS['rmt-ip-created-num'] = 'rmt-ip-created-num';
HOME_GOOGLE_ANALYTICS['rmt-mycloud-created-num'] = 'rmt-mycloud-created-num';

//Backup
HOME_GOOGLE_ANALYTICS['amazon-s3-en'] = 'amazon-s3-en';

function google_analytics_log(my_opt, my_arg) {
				
		wd_ajax({
		url: '/web/google_analytics.php',
		type: "POST",
		async:false,
		cache:false,
		dataType:"xml",
		data: {cmd: 'set', opt:HOME_GOOGLE_ANALYTICS[my_opt].toString(), arg:my_arg},
		success: function(xml){
		},
		error: function (xhr, ajaxOptions, thrownError){},
		complete: function() {
		}
	});	

}

function port_used_check(app_name, port_num)
{
	var res = 0;
	
	wd_ajax({
			url:"/cgi-bin/p2p.cgi",
			type: "POST",
			data:{cmd:'cgi_port_test',f_app_name:app_name,f_port:port_num},
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml){
					res = (parseInt($(xml).find("port_used").text(),10) != 0)?1:0;
			},
			error: function (xhr, ajaxOptions, thrownError){},
			complete: function() {
			}
	});	
	
	return res;
}
function chk_nfs_host(host)
{
	//for nfs check host format
	var space_count = host.split(" ");
	if(host.length==0 || (space_count.length == host.length+1))
		return 6;
		
	if(host=="*")
		return 0;
	
	if(host.indexOf("\\") != -1)
		return 1;

	var value=host.split(".");
	if(value.length==4)
	{
		if(!isNaN(value[0]) && !isNaN(value[1]) && !isNaN(value[2]) && !isNaN(value[3]))
		{
			if(value[3].length<1)
				return 0;
				
			if ( !checkDigitRange(host, 1, 1, 223) )
			{
				return 2;
			}
			if ( !checkDigitRange(host, 2, 0, 255) )
			{
				return 3;
			}
			if ( !checkDigitRange(host, 3, 0, 255) )
			{
				return 4;
			}
			if ( !checkDigitRange(host, 4, 0, 255) )
			{
				return 5;
			}
		}
		else
		{
			if( name_check3(host) ) 
				return 7;
		}
	}
	else
	{
		if( name_check3(host) ) 
			return 7;
	}
	return 0;
}
function show_schedule(div,type,week_day,hour)
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
		"0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18"
		,"19","20","21","22","23"
			);		
	}	
	var week_array = new Array(		
			_T('_mail','sun'),
			_T('_mail','mon'),
			_T('_mail','tue'),
			_T('_mail','wed'),
			_T('_mail','thu'),
			_T('_mail','fri'),
			_T('_mail','sat')		
	);	
	var min = "00";
	
	if (type == 0)
	{
		$("#"+div).html(_T('_ipv6','off'));
	}
	else if (type == 3) //daily
	{
		if (TIME_FORMAT == 12)
			$("#"+div).html(select_array[hour]+" / "+ _T('_mail','daily'));//Daily
		else
		$("#"+div).html(select_array[hour]+" :  "+ min +" / "+ _T('_mail','daily'));//Daily

	}
	else if (type == 2) //weekly
	{					
		if (TIME_FORMAT == 12)
			$("#"+div).html(week_array[week_day]+" "+select_array[hour]+" / "+_T('_mail','weekly'));//Weekly
		else
		$("#"+div).html(week_array[week_day]+" "+select_array[hour]+" :  "+ min +" / "+_T('_mail','weekly'));//Weekly

	}
	else if (type == 1) //monthly
	{		
		var s="";
		if(week_day==1 || week_day==21 || week_day==31)
			s=week_day + "st" ;
		else if(week_day==2 || week_day==22)
			s=week_day + "nd" ;
		else if(week_day==3 || week_day==23)
			s=week_day + "rd" ;
		else 
			s=week_day + "th" ;
		
		if (TIME_FORMAT == 12)
			$("#"+div).html(s+" "+select_array[hour] +" / "+_T('_mail','monthly'));//Monthly
		else	
			$("#"+div).html(s+" "+select_array[hour]+" :  "+ min +" / "+_T('_mail','monthly'));//Monthly
	}
}