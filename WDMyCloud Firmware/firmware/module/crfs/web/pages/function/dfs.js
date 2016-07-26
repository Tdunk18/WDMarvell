var _GET_FLAG=0;
//var _MAX_DFS_SHARE = 64;
var _MAX_DFS_SHARE = 10;
var _MAX_DFS_GROUP = 10;
var _DFS_FORM_ACTION ="";
var _DFS_ADD=1;
var _DFS_MODIFY =2;
var _DFS_GROUP_ADD =3;
var _DFS_GROUP_MODIFY =4;
var _MODIFY_DFS_SHARENAME="";
var dfsObj="";

function get_host_folder(old_share)
{
	_GET_FLAG=1;
	
	var host = $("#dfs_set input[name=settings_networkDFSHost_text]").val();
	
	if(Checkhost(host)== -1)
		return;
	
	var connect_str = "<span>" + _T('_ddns','connect') +"</span>"
	var str = "<img border='0' src='/web/images/SpinnerSun.gif' width='18' height='18'>" + "&nbsp;&nbsp;" + connect_str;
	
	$("#wait_span").show();
	$("#wait_span").html(str);
	$("#dfs_input").hide();
	$("#remote_folder_td").hide();
	
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:"cgi_get_host_folder" ,host:host},
		cache: false,
		dataType: "xml",
		success: function(xml){
			
			$("#wait_span").hide();

			var folder = new Array();
			var count = parseInt($(xml).find('count').text(),10);
			var status = parseInt($(xml).find('status').text(),10);
			if(status==1)
			{
				if(count!=0)
			{
				$("#remote_folder_td").show();
				$("#settings_networkDFSRemoteFolder_text").val("");
				setTimeout("$('#dfs_set input[name=settings_networkDFSRemoteFolder_text]').focus()",100);
				$("#dfs_input").show();
				
				var folder_array = new Array();
				$(xml).find('folder').each(function(){
					folder_array.push($(this).text());
				});
				write_remote_share_options(folder_array);
				
				if(_DFS_FORM_ACTION == _DFS_MODIFY)
				{
					$("#dfs_set select[name=settings_networkDFSFolder_select]").val(old_share);
					sel_folder(old_share);
				}
			}
			else
			{
				_GET_FLAG=0;
				$("#remote_folder_td").hide();
				$("#dfs_input").show();
					jAlert(_T('_share_aggregation','msg2'), _T('_common','error')); //No shares available on remote host.
				}
			}
			else
			{
				_GET_FLAG=0;
				$("#remote_folder_td").hide();
				$("#dfs_input").show();
				jAlert(_T('_dfs','msg1'), _T('_common','error')); //Unable to retrieve the remote share folder.
			}
		}
		,
		 error:function(xmlHttpRequest,error){   
  		 }
	});		
}
function dfs_create_group()
{
	var groupname = $("#dfs_group input[name=settings_networkDFSRootFolder_text]").val();
	if(groupname=="")
	{
		jAlert(_T('_dfs','msg9'), _T('_common','error'));
		return;
	}
	if (groupname.length > 80 )
	{
		jAlert(_T('_dfs','msg12'), _T('_common','error')); //The share name length cannot exceed 80 characters
		return;
	}
	var flag=Chk_Folder_Name(groupname);
	switch (flag)
	{
		case 1:
			jAlert( _T('_network_access','msg3'), _T('_common','error'));	//Text:The folder name must not include the following characters: \\ / : * ? " < > | 
			return 0;
		break;
		
		case 2:
			jAlert( _T('_backup','msg5'),_T('_common','error'));	//Text:Not a valid folder name.
			return 0;
		break;
	}
	if(check_dfs_groupname(groupname)==1)
	{
		//The portal folder name entered already exists. Please select a different name.
		jAlert(_T('_dfs','msg11'), _T('_common','error'));
		return;
	}
	
	var old_group=_DFS_GROUP;
	
	var flag="1";	//1:add	2:modify
	if(_DFS_GROUP.length==0)
	{
		flag=1;
		$("#settings_networkDFSShareLink_tr").show();
	}
	else if(_DFS_GROUP!=groupname) 
		flag=2;
	
//	if(_DFS_FORM_ACTION==_DFS_GROUP_MODIFY)
//	{
//		var grid = mainFrame.$("#dfs_group_tb");
//		old_group=$('.trSelected td:nth-child(1) div',grid).html();
//		old_group=old_group.replace(/&nbsp;/g,' ');
//		old_group=old_group.replace(/&amp;/g,'&');
//		flag=2;
//	}
	
	var str = "cmd=cgi_set_dfs_group" + "&group=" + encodeURIComponent(groupname)+
				"&old_group=" + encodeURIComponent(old_group) + "&flag=" + flag
	
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
				
	//alert(str)
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/account_mgr.cgi",
		data: str,
		cache: false,
		success: function(){
			//_DIALOG = dfsObj;
			//alert(_DIALOG)
			_DFS_GROUP = groupname;
			setTimeout("jLoadingClose()",1000);
			$("input").hidden_inputReset();
			
			get_dfs_info();
			
			//$("#settings_networkDFSConfigSave_button").show();
		  	//var dfsObj1=$("#dfsDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});
			//dfsObj1.load();				
			//alert(dfsObj1)
			
			//setTimeout("aa()",1000);
			
			//jAlert(_T('_dfs','msg11'), _T('_common','error'));
			
//			dfsObj.close();
//			mainFrame.$("#dfs_group_tb").flexReload();
//			
//			if(_DFS_FORM_ACTION==_DFS_GROUP_MODIFY)
//			{
//				if(mainFrame.$("#dfs_set_data").hasClass("enable"))
//					mainFrame.show_dfs_group_info(groupname);
//			}
		}
		,
		 error:function(xmlHttpRequest,error){
  		 }
	});
}

function dfs_set()
{
	var sharename = $("#dfs_set input[name=settings_networkDFSShareName_text]").val();
	var host = $("#dfs_set input[name=settings_networkDFSHost_text]").val();
	var path = $("#dfs_set input[name=settings_networkDFSRemoteFolder_text]").val();
	
	if(sharename=="")
	{
		jAlert(_T('_dfs','msg6'), _T('_common','error')); //Please input a Local Share Name.
		return;
	}
	if (sharename.length > 80 )
	{
		jAlert(_T('_dfs','msg12'), _T('_common','error')); //The share name length cannot exceed 80 characters
		return;
	}
	var flag=Chk_Folder_Name(sharename);
	switch (flag)
	{
		case 1:
			jAlert( _T('_network_access','msg3'), _T('_common','error'));	//Text:The folder name must not include the following characters: \\ / : * ? " < > | 
			return 0;
		break;
		
		case 2:
			jAlert( _T('_backup','msg5'),_T('_common','error'));	//Text:Not a valid folder name.
			return 0;
		break;
	}
	if(host=="")
	{
		jAlert(_T('_dfs','msg7'), _T('_common','error'));	//Please input a Host
		return;
	}
	if(chk_host(host)==1)
	{
		jAlert(_T('_dfs','msg13'), _T('_common','error'));
		return;
	}
	if(path=="")
	{
		jAlert(_T('_dfs','msg8'), _T('_common','error'));	//Please select a Remote Share Folder.
		return;
	}
	
	if(path=="")
	{
		jAlert(_T('_dfs','msg8'), _T('_common','error'));	//Please select a Remote Share Folder.
		return;
	}
	var flag=Chk_Folder_Name(path);
	switch (flag)
	{
		case 1:
			jAlert( _T('_share_aggregation','msg1'), _T('_common','error'));	//Text:Remote share name cannot include the following characters: \/:*?"<>|
			return 0;
		break;
		
		case 2:
			jAlert( _T('_backup','msg5'),_T('_common','error'));	//Text:Not a valid folder name.
			return 0;
		break;
	}
	
	var group = _DFS_GROUP;
	
	if(_MODIFY_DFS_SHARENAME == sharename)
		do_dfs_set();	//不用檢查
	else
	{
		var str = "cmd=cgi_chk_dfs" + "&sharename=" + encodeURIComponent(sharename) + 
					"&host=" + host + "&remote_share=" + encodeURIComponent(path) + 
					"&group=" + encodeURIComponent(group)
					
		//檢查 sharename 是否存在
		wd_ajax({
			type: "POST",
			url: "/cgi-bin/account_mgr.cgi",
				data: str,
			cache: false,
			async: false,
			dataType: "xml",
			success: function(xml){
					if($(xml).find('status').text()!=1)
						do_dfs_set();
					else
						jAlert(_T('_dfs','msg2'), _T('_common','error')); //The share already exists. Please choose a different.
			}
			,
			 error:function(xmlHttpRequest,error){
	  		 }
		});
	}
	
	function do_dfs_set()
	{
		if(_DFS_FORM_ACTION == _DFS_MODIFY)
		{
			var gname = _DFS_GROUP;
			
			var old_host=_DFS_LIST[_CURRENT_MODIFY_INDEX].host;
			var old_sharename=_DFS_LIST[_CURRENT_MODIFY_INDEX].local_sharename;
			//var s = "host=" + old_host + "\nsharename=" + sharename + "\npath=" + path + "\ngroup=" + group
			//	s+= "\nold_share=" + old_sharename + "\nold_group=" + group
			//alert(s)
			
			var str = "cmd=cgi_modify_dfs" + "&host=" + host + "&sharename=" + encodeURIComponent(sharename) +
						"&path=" + encodeURIComponent(path) + "&group=" + encodeURIComponent(group) + 
						"&old_share=" + encodeURIComponent(old_sharename) + 
						"&old_group=" + encodeURIComponent(gname);
						
			wd_ajax({
				type: "POST",
				url: "/cgi-bin/account_mgr.cgi",
				data: str,
				cache: false,
				async: false,
				success: function(){
					//dfsObj.close();
					//mainFrame.$("#dfs_tb").flexReload();
					get_dfs_group_info()
					$("#dDiag_create_group").show();
					$("#dDiag_set").hide();
				}
				,
				 error:function(xmlHttpRequest,error){   
		        		//alert("Get_quota_Info->Error: " +error);   
		  		 }
			});
		}
		else
		{
			//alert("host=" + host + "\nsharename=" + sharename + "\npath=" + path + "\ngroup=" + group)
			var str = "cmd=cgi_set_dfs" + "&host=" + host + "&sharename=" + encodeURIComponent(sharename) + 
						"&path=" + encodeURIComponent(path) + "&group=" + encodeURIComponent(group)
			wd_ajax({
				type: "POST",
				url: "/cgi-bin/account_mgr.cgi",
				data: str,
				cache: false,
				async: false,
				success: function(){
					//dfsObj.close();
					//mainFrame.$("#dfs_tb").flexReload();
					get_dfs_group_info()
					$("#dDiag_create_group").show();
					$("#dDiag_set").hide();
				}
				,
				 error:function(xmlHttpRequest,error){   
		  		 }
			});
		}
	}
}

function check_dfs_groupname(gname)
{
	var dfs_group_flag="";
	
	var str = "cmd=cgi_chk_dfs_group" + "&group=" + encodeURIComponent(gname);
	
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/account_mgr.cgi",
		data: str,
		cache: false,
		async: false,
		dataType: "xml",
		success: function(xml){
			dfs_group_flag=$(xml).find('status').text();
		}
		,
		 error:function(xmlHttpRequest,error){   
  		 }
	});
	
	return dfs_group_flag;
}

function Checkhost(host)
{
	if(host=="")
	{
		jAlert(_T('_dfs','msg4'), _T('_common','error'));//Please enter host.
		return -1;
	}
	
	if(chk_host(host)==1)
	{
		jAlert(_T('_dfs','msg13'), _T('_common','error'));
		return -1;
	}
		
	var value=host.split(".");
	if(value.length==4)
	{
		if(!isNaN(value[0]) && !isNaN(value[1]) && !isNaN(value[2]) && !isNaN(value[3]))
		{
			if ( validKey( host ) == 0 )
			{
				//Only numbers can be used in an IP address.
				jAlert(_T('_dfs','msg5'), _T('_common','error'));
				return -1;
			}
			
			if ( !checkIP(host, 1, 1, 223) )
			{
				jAlert(_T('_ip','msg4'), _T('_common','error'));
				return -1;
			}
			if ( !checkIP(host, 2, 0, 255) )
			{
				jAlert(_T('_ip','msg5'), _T('_common','error'));
				return -1;
			}
			if ( !checkIP(host, 3, 0, 255) )
			{
				jAlert(_T('_ip','msg6'), _T('_common','error'));
				return -1;
			}
			if ( !checkIP(host, 4, 0, 255) )
			{
				jAlert(_T('_ip','msg7'), _T('_common','error'));
				return -1;
			}
		}
	}
}
function getNum(str, num)
{
	i=1;
	if ( num != 1 )
	{
		while (i!=num && str.length!=0)
		{
			if ( str.charAt(0) == '.' )
			{
				i++;
			}
			str = str.substring(1);
		}
		if ( i!=num )
			return -1;
	}
	for (i=0; i<str.length; i++)
	{
		if ( str.charAt(i) == '.' )
		{
			str = str.substring(0, i);
			break;
		}
	}
	if ( str.length == 0)
		return -1;
	d = parseInt(str, 10);
	return d;
}
function checkIP(str, num, min, max)
{
	d = getNum(str,num);
	if ( d > max || d < min )
		return false;
	return true;
}
function validKey(str)
{
	for (var i=0; i<str.length; i++)
	{
		if ( (str.charAt(i) >= '0' && str.charAt(i) <= '9') ||(str.charAt(i) == '.' ) )
			continue;
		return 0;
	}
	return 1;
}

function sel_folder(v)
{
	//console.log("v=[%s]",v)
	$("#settings_networkDFSRemoteFolder_text").val(v);
}

function chk_host(host)
{
	var flag=0;
	wd_ajax({
		type:"GET",
		url:"/cgi-bin/network_mgr.cgi?cmd=cgi_get_lan_xml",
		cache:false,
		async:false,
		dataType: "xml",
		success: function(xml) {								
			$(xml).find('lan').each(function(index){
				var ip = $(this).find('ip').text();
				if(ip==host)
					flag=1;
			});
		}
	});
	
	return flag;
}

var _DFS_GROUP="";
function get_dfs_group_info()
{
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/account_mgr.cgi",
		data:"cmd=cgi_get_dfs_gorup_list&page=1&rp=100",
		cache: false,
		dataType: "xml",
		success: function(xml){
			$(xml).find('row').each(function(index){
				_DFS_GROUP = $(this).find('cell').eq(0).text();
				
				$("#settings_networkDFSRootFolder_text").val(_DFS_GROUP);
			});
			
			get_dfs_list(_DFS_GROUP);
			
			if(_DFS_GROUP.length==0)
			{
				$("#cfg_link").hide();
				$("#settings_networkDFSShareLink_tr").hide();
			}
			else
			{
				$("#settings_networkDFSShareLink_tr").show();
				$("#cfg_link").show();
			}
		}
	});

}
function get_dfs_info()
{
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/account_mgr.cgi",
		data:"cmd=cgi_get_dfs_info",
		cache: false,
		dataType: "xml",		
		success: function(xml){		
				var enable = $(xml).find('enable').text();
				var groupname = $(xml).find('groupname').text();
				
				$("#settings_networkDFSRootFolder_text").val(groupname);
				
				setSwitch('#settings_networkDFS_switch',enable);
				if(enable==1)
					$("#settings_networkDFS_link").show();
				else
					$("#settings_networkDFS_link").hide();
				
				init_switch();
				$("#settings_networkDFS_switch").unbind("click");
			    $("#settings_networkDFS_switch").click(function(){
					var v = getSwitch('#settings_networkDFS_switch');
					if( v==1)
					{
						$("#settings_networkDFS_link").show();
						
						if(enable==0)
						{
							if(groupname.length!=0)
						Set_DFS_Enable(1);
							else
								init_dfs_diag();
						}
					}
					else
					{
						$("#settings_networkDFS_link").hide();
						Set_DFS_Enable(0);
					}
				});
		}
	});	
}

function Set_DFS_Enable(dfs)
{
	_DIALOG="";
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:"cgi_set_dfs_enable" ,dfs:dfs},
		cache: false,
		success: function(){
			get_dfs_info();
			google_analytics_log('dfs-en', dfs);
			jLoadingClose();
		}
		,
		 error:function(xmlHttpRequest,error){   
        		//alert("Set_DFS_Enable->Error: " +error);
  		 }
	});
	
	
}
var _init_flag=0;

function init_dfs_diag()
{
	$("#dDiag_set").hide();
	$("#dDiag_create_group").show();
	$("input:text").hidden_inputReset();
	
	//clear
	$("#settings_networkDFSRemoteFolder_text").val("");
	$("#dfs_set input[name=settings_networkDFSShareName_text]").val("");
	$("#dfs_set input[name=settings_networkDFSHost_text]").val("");
	$("#dfsDiag_title").html(_T('_dfs','set_title'));

	$("#remote_folder_td").hide();
	
	get_dfs_group_info();
	
	
  	var dfsObj1=$("#dfsDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});
	dfsObj1.load();	
	_DIALOG = dfsObj1;
	
	language();
	
	ui_tab("#dfsDiag","#settings_networkDFSRootFolder_text","#settings_networkDFSConfigSave_button");
	
	if(_init_flag==1) return;
	_init_flag=1;
	
	$("#settings_networkDSFRootFolderSave_button").click(function(){
		dfs_create_group();
	});
	
   $("#settings_networkDFSConfigSave_button").click(function(){
		$("#remote_folder_td").hide();
		$("#tip_dfs_remote_share").show();
		
		_DFS_FORM_ACTION = _DFS_ADD;
		//console.log("_DSF_TOTAL=%s",_DSF_TOTAL)
		if(_DSF_TOTAL==_MAX_DFS_SHARE)
		{
			//The maximum number of share has been reached.
			jAlert(_T('_dfs','msg3'), _T('_common','error'))
			return;
		}
		
		_MODIFY_DFS_SHARENAME = "";
		$("#settings_networkDFSRemoteFolder_text").val("");
		$("#dfs_set input[name=settings_networkDFSShareName_text]").val("");
		$("#dfs_set input[name=settings_networkDFSHost_text]").val("");
		
		$("#dDiag_set").show();
		$("#dDiag_create_group").hide();
		$("#settings_networkDFSDel_button").hide();
		
	});

   $("#settings_networkDFSBack_button").click(function(){
		$("#dDiag_set").hide();
		$("#dDiag_create_group").show();		
	});

/*
   $("#settings_networkDFSDel_button").click(function(){
		_DIALOG.close();
		
		jConfirm('M',_T('_dfs','msg14'),_T('_dfs','set_title'),function(r){
			if(r)
			{
				//alert("name"+ encodeURIComponent(sharename) + "\npath=" + encodeURIComponent(path) + "\nhost=" + encodeURIComponent(hostname) + "\nsmb_path=" + encodeURIComponent(path))
				//jLoading(_T('_common','set') ,'loading' ,'s',"");
				var group = _DFS_GROUP;
				var local = _DFS_LIST[_CURRENT_MODIFY_INDEX].local_sharename;

				wd_ajax({
					type: "POST",
					url: "/cgi-bin/account_mgr.cgi",
					data: { cmd:"cgi_del_dfs" ,group:group,local:local},
					cache: false,
					async: false,
					success: function(){
						//$("#dfs_tb").flexReload();
						get_dfs_group_info();
						_DIALOG.load();
						
						$("#dDiag_create_group").show();
						$("#dDiag_set").hide();
					}
					,
					 error:function(xmlHttpRequest,error){   
			        		//alert("Get_quota_Info->Error: " +error);   
			  		 }
				});
			}
			else
			{
				_DIALOG.load();
			}
	    });		
		
	});
*/		
	
}

var _DFS_LIST = new Array();
var _DSF_TOTAL="";
function get_dfs_list(groupname)
{
	$("#dfs_list").empty();
	
	var ul_obj = document.createElement("ul"); 
	$(ul_obj).addClass('dListDiv');
	
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data:"cmd=cgi_get_dfs_list&page=1&rp=100&f_field=" + encodeURIComponent(groupname),
		dataType: "xml",
		success: function(xml){
			
			_DSF_TOTAL=0;
			$(xml).find('row').each(function(index){
				
				var li_obj = document.createElement("li");
				
				var local_sharename = $(this).find('cell').eq(0).text();
				var host = $(this).find('cell').eq(1).text();
				var remote_folder = $(this).find('cell').eq(2).text();
				
				_DFS_LIST[index] = new Array()
				_DFS_LIST[index].local_sharename = local_sharename;
				_DFS_LIST[index].host = host;
				_DFS_LIST[index].remote_folder = remote_folder;
				_DFS_LIST[index].groupname = groupname;
				
				$(li_obj).append("<div class='local_name overflow_hidden_nowrap_ellipsis'>" + local_sharename + "</div>");
				$(li_obj).append("<div class='host overflow_hidden_nowrap_ellipsis'>" + host + "\\"+ remote_folder+  "</div>");
				$(li_obj).append("<a class='edit_icon' id='settings_networkDFSEdit" + index + "_link' href=\"javascript:goto_list('" + index + "')\"></a>");
				$(li_obj).append("<a class='del_icon' id='settings_networkDFSDel" + index + "_link' href=\"javascript:del_dfs_share('" + index + "')\"></a>");
				$(ul_obj).append($(li_obj));
				_DSF_TOTAL++;
			});
			
			$("#dfs_list").append($(ul_obj));
		}
		,
		error:function(xmlHttpRequest,error){   
		}  
	});
}

function write_remote_share_options(share_array)
{
	var option = "";
	option += '<ul>';
	option += '<li class="option_list">';          
	option += '<div id="remote_f_dev_main" class="wd_select option_selected">';
	option += '<div class="sLeft wd_select_l"></div>';
	option += '<div class="sBody text wd_select_m overflow_hidden_nowrap_ellipsis" id="settings_networkDFSFolder_select" rel="" style="width:110px;">'+ _T('_dfs','sel') +'</div>';
	option += '<div class="sRight wd_select_r"></div>';
	option += '</div>';						
	option += '<ul class="ul_obj">';
		
	if(share_array.length>=7)
		{
		option += '<div class="cloud_time_machine_scroll">';
		}
	else
		{
		option += '<div>';
		}
		
	for( i in share_array)
		{
			option += '<li id="settings_networkDFSLi'+ i + '_select" rel="' + share_array[i] +'"> <a href="#" onclick=\'sel_folder("' + share_array[i] + '")\'>' + share_array[i] + '</a></li>';
		}

	option += '</div>';
	option += '</ul>';
	option += '</li>';
	option += '</ul>';
	
	$("#remote_folder_td").show();
	$("#remote_folder_list").html(option);
	$("#remote_folder_list .option_list ul li").css("width","190px");
	$("#remote_folder_list .option_list ul li a").addClass("overflow_hidden_nowrap_ellipsis");
		
	hide_select();
	init_select();
	$("#tip_dfs_remote_share").hide();
}

var _CURRENT_MODIFY_INDEX="";
function goto_list(index)
{
	$("input:text").hidden_inputReset();
	$("#dDiag_create_group").hide();
	$("#dDiag_set").show();
	$("#settings_networkDFSDel_button").show();

	_MODIFY_DFS_SHARENAME = _DFS_LIST[index].local_sharename;
	_DFS_FORM_ACTION = _DFS_MODIFY;
	_CURRENT_MODIFY_INDEX = index;
	
	$("#settings_networkDFSRemoteFolder_text").val(_DFS_LIST[index].remote_folder);
	$("#dfs_set input[name=settings_networkDFSShareName_text]").val(_DFS_LIST[index].local_sharename);
	$("#dfs_set input[name=settings_networkDFSHost_text]").val(_DFS_LIST[index].host);
	
	ui_tab("#dfsDiag","#settings_networkDFSShareName_text","#settings_networkDFSSave_button");
	
	//console.log("localshare=[%s]  host=[%s]  remote_folder=[%s]",_DFS_LIST[index].local_sharename,_DFS_LIST[index].host ,_DFS_LIST[index].remote_folder)
}
function del_dfs_share(index)
{
	jConfirm('M',_T('_dfs','msg14'),_T('_dfs','set_title'),function(r){
		if(r)
		{
			var group = _DFS_LIST[index].groupname;
			var local = _DFS_LIST[index].local_sharename;
				
			wd_ajax({
				type: "POST",
				url: "/cgi-bin/account_mgr.cgi",
				data: { cmd:"cgi_del_dfs" ,group:group,local:local},
				cache: false,
				async: false,
				success: function(){
					get_dfs_group_info();
				}
				,
				 error:function(xmlHttpRequest,error){   
		        		//alert("Get_quota_Info->Error: " +error);   
		  		 }
			});
		}
    });	
}

function dfs_test()
{
	var host = $("#dfs_set input[name=settings_networkDFSHost_text]").val();
	
	if(Checkhost(host)== -1)
		return;
		
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:"cgi_get_host_folder" ,host:host},
		cache: false,
		dataType: "xml",
		success: function(xml){

			var folder = new Array();
			var count = parseInt($(xml).find('count').text(),10);
			var status = parseInt($(xml).find('status').text(),10);
			if(status==1)
			{
				var findFlag=0;
				if(count!=0)
				{
					$(xml).find('folder').each(function(){
						
						var remoteFolder=$("#settings_networkDFSRemoteFolder_text").val();
						if(remoteFolder==$(this).text())
						{
							findFlag++;
							jAlert(_T('_ads','msg8'), _T('_common','completed')); //Successful
						}
					});
					
					if(findFlag==0)
					{
						jAlert(_T('_share_aggregation','msg3'), _T('_common','error')); //The remote share name does not exist.
					}
				}
				else
				{
					_GET_FLAG=0;
					$("#remote_folder_td").hide();
					$("#dfs_input").show();
					jAlert(_T('_share_aggregation','msg2'), _T('_common','error')); //No shares available on remote host.
				}
			}
			else
			{
				_GET_FLAG=0;
				$("#remote_folder_td").hide();
				$("#dfs_input").show();
				jAlert(_T('_dfs','msg1'), _T('_common','error')); //Unable to retrieve the remote share folder.
			}
		}
		,
		 error:function(xmlHttpRequest,error){   
  		 }
	});	
}