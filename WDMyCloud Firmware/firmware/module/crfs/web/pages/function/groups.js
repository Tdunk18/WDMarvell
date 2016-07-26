var __GROUP_LIST_INFO = new Array();
var _ADS_Filter_Default_Group = [
"Incoming Forest Trust Builders",
"DnsAdmins",
"IIS_IUSRS",
"Cryptographic Operators",
"Event Log Readers",
"Certificate Service DCOM Access",
"RDS Remote Access Servers",
"RDS Endpoint Servers",
"RDS Management Servers",
"Access Control Assistance Operators",
"Domain Computers",
"Domain Controllers",
"Cert Publishers",
"Performance Log Users",
"Performance Monitor Users",
"Distributed COM Users",
"Group Policy Creator Owners",
"RAS and IAS Servers",
"Server Operators",
"Network Configuration Operators",
"Hyper-V Administrators",
"Access Control Assistance Operators",
"Account Operators",
"Pre-Windows 2000 Compatible Access",
"Print Operators",
"Windows Authorization Access Group",
"Terminal Server License Servers",
"Allowed RODC Password Replication Group",
"Denied RODC Password Replication Group",
"Read-only Domain Controllers",
"Enterprise Read-only Domain Controllers",
"Cloneable Domain Controllers",
"Protected Users",
"DnsAdmins",
"DnsUpdateProxy",
"WseRemoteWebAccessUsers",
"WseAllowShareAccess",
"WseAllowComputerAccess",
"WseAllowMediaAccess",
"WseAllowAddInAccess",
"WseAllowDashboardAccess",
"WseAllowHomePageLinks",
"WseAlertAdministrators",
"WseRemoteAccessUsers",
"WseInvisibleToDashboard",
"WseManagedGroups",
"RA_AllowAddInAccess",
"RA_AllowComputerAccess",
"RA_AllowDashboardAccess",
"RA_AllowHomePageLinks",
"RA_AllowMediaAccess",
"RA_AllowNetworkAlertAccess",
"RA_AllowRemoteAccess",
"RA_AllowShareAccess",
"RA_AllowVPNAccess",
"Remote Desktop Users",
"Remote Management Users",
"Replicator",
"WSSUsers",
"WinRMRemoteWMIUsers__",
"Administrators",
"Guests",
"Backup Operators",
"Users" //ITR No.: 101564
];
var AllGroupList = new Array();

function get_group_list(get_type,c_group)
{
	if(c_group=="" && get_type=="")
	{
		$("#users_removeGroup_button").addClass("gray_out");
		$(".groupMenuList").html('<div class="waiting_msg"><img src="/web/images/SpinnerSun.gif?r=20150204" border=0>'+'</br></br>'+_T('_user','wait_groups')+"</div>");
	}

	__GROUP_LIST_INFO = new Array();
	
	//local group
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/xml/account.xml?r="+new Date().getTime(),
		dataType: "xml",
		success: function(xml){

			var idx=0;
			$(xml).find('groups > item').each(function(index){
				var group_name = $(this).find('name').text();
				
				if( api_filter_default_group(group_name) ==0) return true;
				
				__GROUP_LIST_INFO[idx] = new Array();
				__GROUP_LIST_INFO[idx].groupname = group_name;
				__GROUP_LIST_INFO[idx].type = "local";
				
				var member = new Array();
				$(this).find('users > user').each(function(){
					member.push($(this).text());
				});
				
				member = member.toString().replace(/,/g,'#');
					
				__GROUP_LIST_INFO[idx].member = member;
				idx++;
			});
		
				__GROUP_LIST_INFO.sort(function(a, b){
				    var a1= a.groupname, b1= b.groupname;
				    if(!b1) b1=a1;
				    if(a1== b1) return 0;
				    return a1> b1? 1: -1;
				});
			_get_ad_group();
		},
		error:function(xmlHttpRequest,error){
			//alert("Error: " +error);
		}
	});
	
	//ad group
	var ADGList = new Array();
	AllGroupList = new Array();
	function _get_ad_group()
	{
		wd_ajax({
			type: "GET",
			cache: false,
			url: "/web/php/getADInfo.php?type=groups",
			dataType: "xml",
			success: function(xml){
				var workgroup= $(xml).find('ads_workgroup').text();
				var domain_enable= $(xml).find('domain_enable').text();//0:off 1:AD 2:LDAP 
				var dType = "ad";
				if(domain_enable=='2') dType="ldap";
								
				if(domain_enable!="0")
				{
					var idx=0;
					$(xml).find('groups > item').each(function(index){
						var group_name = $(this).find('name').text();

						var new_group = group_name;
						var upperCasedArray =$.map(_ADS_Filter_Default_Group, function(n)
						{
							return(n.toUpperCase());
						});
						
						if($.inArray(new_group.toUpperCase(), upperCasedArray )!=-1)
						{
							return true;
						}

						if(idx==_MAX_TOTAL_AD_GROUP) return false;
						
						ADGList[idx] = new Array();
						if(dType=="ad")
						{
						ADGList[idx].groupname = workgroup +"\\"+ group_name;
						}
						else
						{
							ADGList[idx].groupname = group_name;
						}
						ADGList[idx].type = dType;
						ADGList[idx].member= "";
						idx++;
					});
					ADGList.sort(function(a, b){
					    var a1= a.groupname.toLowerCase() , b1= b.groupname.toLowerCase() ;
					    if(!b1) b1=a1;
					    if(a1== b1) return 0;
					    return a1> b1? 1: -1;
					});
														
					//AllGroupList = __GROUP_LIST_INFO.concat(ADGList);
					AllGroupList = ADGList.concat(__GROUP_LIST_INFO);
				}
				else
				{
					AllGroupList = __GROUP_LIST_INFO;
				}
				
				if(AllGroupList.length==0)
				{
					$("#group_detail").hide();
					$("#group_desc").show();
					$("#users_removeGroup_button").addClass("gray_out");
				}
				else
				{
					if(get_type=="")
					{
						$("#group_detail").hide();
						$("#group_desc").show();					
					}
					else
					{
						$("#group_detail").show();
						$("#group_desc").hide();
					}
				}
				//display all user to page
				$(".groupMenuList").empty();
				for(i in AllGroupList)
				{
					var li_obj = document.createElement("li");
					var type = AllGroupList[i].type;
					var group_name = AllGroupList[i].groupname;
					$(li_obj).attr("src",type);
					$(li_obj).attr("id","users_group_"+group_name);
					$(li_obj).attr("title",group_name);
					$(li_obj).addClass("uTooltip");
					$(li_obj).html( "<div class='gicon' rel='" + i +"'></div><div class='gName'>" + group_name +"</div>");
					
					if(get_type=="new" && c_group == group_name)
					{
						$(li_obj).addClass('LightningSubMenuOn');
						do_query_group_info(c_group,"local");
					}
					
					if(i==0)
					{
						if(get_type=="del")
						{
							$(li_obj).addClass('LightningSubMenuOn');
							do_query_group_info(AllGroupList[i].groupname,"local")
						}
					}
					
					$(li_obj).attr('tabindex','0');
					$(".groupMenuList").append($(li_obj));
				}
				
				init_tooltip2(".uTooltip");
				
				if( AllGroupList.length > 6)
				{
					$(".ButtonArrowTop").removeClass('disable');
					$(".ButtonArrowTop").addClass('enable');
	
					$(".ButtonArrowBottom").removeClass('disable');
					$(".ButtonArrowBottom").addClass('enable');
				}
				else
				{
					$(".ButtonArrowTop").addClass('disable');
					$(".ButtonArrowTop").removeClass('enable');
	
					$(".ButtonArrowBottom").addClass('disable');
					$(".ButtonArrowBottom").removeClass('enable');				
				}
							
				init_group_item_click();
			
			},
			error:function(xmlHttpRequest,error){
				//alert("Error: " +error);
			}
		});
	}
}

var init_modify_group_quota_dialog_flag=0;
function init_modify_group_quota_dialog(type)
{
    var groupname = get_current_item(".groupMenuList");
    
    var x_quota = _T('_quota','x_quota').replace(/%s/g,groupname);
	var edit_title = x_quota;
	$("#editDiag_title").html( edit_title );

	api_get_group_quota_info(groupname,type,function(){
		
	  	var modify_Obj=$("#editGroupDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});		
		modify_Obj.load();
		_DIALOG = modify_Obj;
		
		$("#m_quotaDiag").show();
		$("#m_memberDiag").hide();
		
		setTimeout(function(){
			$('#editGroupDiag input[name=users_v1Size_text]').focus();
		},30);
		
		ui_tab("#editGroupDiag","#users_v1Size_text","#users_editQuotaSave_button");
		
		if(init_modify_group_quota_dialog_flag==1) return;
		init_modify_group_quota_dialog_flag=1;
		
		$("input:text").inputReset();
		
		language();
	});
}
var _INIT_M_MEMBER_FLAG=0;
function init_modify_group_member_dialog()
{
    var groupname = get_current_item(".groupMenuList");
	var edit_title = groupname + "&nbsp;"+_T('_user','member');
	
	$("#editDiag_title").html( edit_title );

	$("#m_quotaDiag").hide();
	$("#m_memberDiag").show();

	setTimeout("init_scroll('.scroll-pane-group')",10);
	
  	var Create_Obj=$("#editGroupDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});		
	Create_Obj.load();
	_DIALOG = Create_Obj;
	
	ui_tab("#editGroupDiag",".chkbox:first","#users_editGroupMemberSave_button");
	
	if(_INIT_M_MEMBER_FLAG==1) return;
	_INIT_M_MEMBER_FLAG=1;

	language();
}
var _G_INIT_FLAG=0;
function init_create_group_dialog()
{
	var _TITLE = _T('_user','add_group');
	$("#createGroupDiag_title").html(_TITLE);
	
	$("#create_group_tb input[name='users_groupName_text']").val("");
	$("input:text").hidden_inputReset();
	
	$("#gDiag_group").show();
	$("#quotaDiag").hide();
	
	get_account_xml('noLoading',function(){
		Get_Group_Info('#g_quota_tb','#user_list_div');
	
		if(_TOTAL_GROUP_NUM >=_MAX_TOTAL_GROUP)
		{
			jAlert(_T('_user','msg13'), _T('_common','error'));
			return;
		}
			
	  	var Create_Obj=$("#createGroupDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
	  						onBeforeLoad: function() {
	            				setTimeout("$('#create_group_tb input[name=users_groupName_text]').focus()",100);
	            				ui_tab("#gDiag_group","#users_groupName_text","#users_addGroupNext1_button");
	            			}
	  					});		
		Create_Obj.load();
		_DIALOG = Create_Obj;
	
		var q_size_array = new Array();
	
		for (var i=0 ;i < _HDD_NUM ;i++)
		{
			q_size_array.push("");
		}
		
		fill_info('g',"",q_size_array,_HDD_SIZE,'#create_group_quota_tb');
			
		if(_G_INIT_FLAG==1) return;
		_G_INIT_FLAG=1;
			
		$("input:text").inputReset();
		language();
		
		//quotaDiag
		$("#users_addGroupBack2_button").click(function(){
			$("#gDiag_group").show();
			$("#quotaDiag").hide();
		});
		
		$("#users_addGroupSave_button").click(function(){
			//check group
			if(check_group_value("#create_group_tb","users_groupName_text")==-1)
			{
				$("#popup_ok_button").click( function (){
					$("#popup_ok_button").unbind("click");
					$("#create_group_tb input[name='users_groupName_text']").focus();
				});
				return -1;
			}	
			add_group();
		});	
	});
}

var	_ALL_ACCOUNT="";
var _ALL_GROUP="";
var _TOTAL_GROUP_NUM="";
var _HDD_NUM="";
var _HDD_SIZE ="";
var _USER_INFO_ARRAY = new Array();
function Get_Group_Info(quota_tb,user_tb)
{
	wd_ajax({
		type: "GET",
		async: false,
		cache: false,
		url: "/xml/account.xml",
		dataType: "xml",
		success: function(xml){
			var _uArray = new Array();
			$(xml).find('users > item').each(function(index){
				var uname = $(this).find('name').text();
				var uid = $(this).find('uid').text();
				if(uid=="500") return true;
				var mail = $(this).find('email').text();
				
				_USER_INFO_ARRAY[index]=new Array()
				_USER_INFO_ARRAY[index].name = uname;
				_USER_INFO_ARRAY[index].email = mail;
				_uArray.push(uname);
			});
			
			var gArray = new Array();
			var gCount = 0;
			$(xml).find('groups > item').each(function(index){
				var gname = $(this).find('name').text();
				if( api_filter_default_group(gname) ==0) return true;
				gArray.push(gname);
				gCount++;
			});	
			_ALL_ACCOUNT = _uArray.toString().replace(/,/g,'#');
			_ALL_GROUP = gArray.toString().replace(/,/g,'#');
			_TOTAL_GROUP_NUM = gCount;
			
			//write user list to table
			write_user_table(user_tb);
			_get_g_info();
		},
		error:function(xmlHttpRequest,error){
			//alert("cgi_get_group_info->Error: " +error);   
		}
	});
	
	function _get_g_info()
	{
		wd_ajax({
			type: "GET",
			async: false,
			cache: false,
			url: "/cgi-bin/account_mgr.cgi",
			data: "cmd=cgi_get_group_info",	
			dataType: "xml",
			success: function(xml){
				$(xml).find('v_name').each(function(i){
					_VOLUME_NAME[i] = $(this).text();
				});
	
				$(xml).find('group_info').each(function(){
					_HDD_NUM = $(this).find('hddnum').text();
					_HDD_SIZE = $(this).find('hddsize').text();
					_HDD_SIZE = _HDD_SIZE.split(",");
				});
			},
			error:function(xmlHttpRequest,error){   
				//alert("cgi_get_group_info->Error: " +error);   
			}
		});
	}
}

function write_user_table(list_div)
{
	var _id = "";
	var _name ="";
	if(list_div=="#user_list_div")
	{
		_id= "users_groupMember";
		_name = "users_groupMember_chkbox";
	}
	else
	{
		_id="users_editGroupMember"
		_name = "users_editGroupMember_chkbox";
	}
	
	if(_ALL_ACCOUNT=="")
	{
		//document.getElementById("user_list_div").innerHTML =_T('_user','none_user') 
		$(list_div).html(_T('_user','none_user'))
		$('#add_info').html("");
		return;
	}

	$(list_div).empty();
	
	var ul_obj = document.createElement("ul"); 
	$(ul_obj).addClass('uListDiv');

	//var user=_ALL_ACCOUNT.split("#");
	
	for(var i in _USER_INFO_ARRAY)
	{
		var li_obj = document.createElement("li"); 
		var chkbox="<input type='Checkbox' id='" + _id + i + "_chkbox' name='" + _name + "' value='" + _USER_INFO_ARRAY[i].name + "'>"
		
		$(li_obj).append('<div class="chkbox" tabindex="0" onkeypress="g_chkboxEvent(event,this)">' + chkbox + '</div>');
		$(li_obj).append('<div class="username">' + _USER_INFO_ARRAY[i].name + '</div>');
		$(li_obj).append('<div class="email">' + _USER_INFO_ARRAY[i].email + '</div>');
		$(ul_obj).append($(li_obj));
	}
	
	$(list_div).html($(ul_obj));
	
	setTimeout("init_scroll('.scroll-pane-group')",10);

	$( list_div+ " input[name='" + _name + "']").unbind('click');
	$( list_div+ " input[name='" + _name + "']").click(function() {
		if($(this).prop('checked'))
		{
			$(this).parent().parent().parent().find('.username').css('color','#0067A6');
			$(this).parent().parent().parent().find('.email').css('color','#0067A6');
		}
		else
		{
			$(this).parent().parent().parent().find('.username').css('color','#898989');
			$(this).parent().parent().parent().find('.email').css('color','#898989');
		}
 	});
	$("[type='checkbox']").checkboxStyle();
}

function check_group_value(tb_obj,gID)
{
	var group_obj=$( tb_obj +" input[name='" + gID + "']");
	
	var group=group_obj.val();
	if( group == "" )
	{
		//Please enter a group name.
		jAlert(_T('_user','msg18'), _T('_common','error'));
		group_obj.select();
		group_obj.focus();
		return -1;
	}
	
	var flag = checkGroup(group);

	if(flag==0)
	{
		//This group name does not accepted . Please try again.
		jAlert(_T('_user','msg16'), _T('_common','error'));
		return -1;
	}
	if(flag==1)
	{
		//The group name entered already exists. Please select a different group name.
		jAlert(_T('_user','msg17'), _T('_common','error'));
		group_obj.select();
		group_obj.focus();		
		return -1;
	}

	
	if(name_check(group))
	{
		//Group name must be an alphanumeric value between 1 and 16 characters and cannot contain spaces.
		jAlert(_T('_user','msg19'), _T('_common','error'));
		group_obj.select();
		group_obj.focus();
		return -1;
	}
		
	if (group.indexOf(" ") != -1) //find the blank space
 	{
 		//Group name must be an alphanumeric value between 1 and 16 characters and cannot contain spaces.
 		jAlert(_T('_user','msg19'), _T('_common','error'));
 		group_obj.select();
		group_obj.focus();
 		return -1;
 	}
 	
	if (group.length >16)
	{
		//The group name length cannot exceed 16 characters. Please try again
		jAlert(_T('_user','msg20'), _T('_common','error'));
 		group_obj.select();
		group_obj.focus();
 		return -1;
	}

	if(chk_first_char(group))
	{
		jAlert(_T('_user','msg26'), _T('_common','error'));
		group_obj.select();
		group_obj.focus();
		return -1;
	}

	if(chk_group_symbol("#create_group_tb")==1)
	{
		//jAlert("The group name format is not correct.\r\nCan not include / : * ? \" < > | . ; + = ~ ' [ ] { } @ # ( ) ! ^ $ % & , ` \\", _T('_common','error'));
		jAlert(_T('_user','msg21'), _T('_common','error'));
 		group_obj.select();
		group_obj.focus();
 		return -1;
 	}
 	
 	var account=_ALL_ACCOUNT.split("#");
 	for(i=0;i<account.length;i++)
 	{
 		if(account[i]==group)
 		{
 			//jAlert("Group names must not be the same as user names.", _T('_common','error'));
 			jAlert(_T('_user','msg22'), _T('_common','error'));
 			group_obj.select();
			group_obj.focus();
 			return -1;
 			break;
 		}
 	}
}
function chk_group_symbol(obj_tb,val)
{
	//return 1:	not a valid value
	//	/:*?"<>|.;+=~'[]{}@#()!'^$%&,`\
	
	//var name=$("#users_groupName_text").val();
	
	var name="";
	if(obj_tb!="")
	{
		name = $( obj_tb + " input[name='users_groupName_text']").val();
	}
	else
	{
		name = val;
	}
	
	var re=/[/:*?\"<>|.;+=~'\[\]{}@#()!'^$%&,`\\]/;

	if(re.test(name))
	{
 		return 1;
	}
	return 0;
}
function checkGroup(name)
{
	var re=/root|anonymous|nobody|administrators|administrator|admin|ftp|allaccount|squeezecenter|sshd|messagebus|netdev|share|ssh|remote_access|media_serving|share_access_locked|target_path|cloudholders/i;
	var y=name.split(re);

	if(y.length==0 || y==",")	//for ie,firefox
		return 0;
	else
	{
		var group=_ALL_GROUP.split("#");
		for(i=0;i<group.length;i++)
		{
			if(group[i]==name)
				return 1;
		}
		return 2;
	}
}
function Check_group_quoga(available_val,divID)
{
	var minsize;
	var str;
	var u_name = new Array();
	var MB = " MB" ;
	var CHECK_QUOTA_FLAG=0;
	var num=0;

    $("#" + divID +" input:checkbox:checked[name='users_editGroupMember_chkbox']").each(function(i){  
		u_name.push($(this).val());
		num++;
    });
	
	if(num==0)
	{
		return CHECK_QUOTA_FLAG;
	}
	
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:"cgi_addgroup_get_group_quota_minsize" ,name:u_name.toString()},
		async: false,
		cache: false,
		dataType: "xml",
		//async: false,
		success: function(xml){		
			$(xml).find('quota_info').each(function(){
				minsize=$(this).find('min_size').text() ;
				var tmp_minsize=minsize.split(":");
				
				for(var i=0;i<tmp_minsize.length;i++)
				{
					var available = available_val[i];
					
					if(available!="null" && available!=0)
					{
						var min_size=parseInt(tmp_minsize[i],10)/1024 ;
						if(parseInt(available,10)<min_size && tmp_minsize[i]!=0)
						{
							//str="The quota amount cannot smaller than the user quota amount." 
							str = _T('_quota','msg2');
							min_size = map_quota_size(min_size);
							str = str + "(" + min_size + ")" ;
							
							jAlert(str, _T('_common','error'));
							CHECK_QUOTA_FLAG=-1;
							return -1;
						}
					}
									
				}
			});
		},
		 error:function(xmlHttpRequest,error){   
        		//alert("cgi_adduser_get_user_quota_maxsize->Error: " +error);   
  		 }
	});
	
	return CHECK_QUOTA_FLAG;  
}
function add_group()
{
	_DIALOG.close();
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
	$("#users_removeGroup_button").removeClass("gray_out");
	Create_Group(function(){
		var username = new Array();
		$("#user_list_div input:checkbox:checked[name='users_groupMember_chkbox']").each(function(){  
			username.push($(this).val());
		});
		
		get_account_xml('noLoading',function(){
			Get_Group_Info('#g_quota_tb','#user_list_div');
			Get_User_Info();//users.js
			
			var g_name=$("#create_group_tb input[name='users_groupName_text']").val();
			$('.LightningSubMenu li').each(function() {
				$(this).removeClass('LightningSubMenuOn');
			});
			var idx = $(".groupMenuList li").length;
			var li_obj = document.createElement("li");
			$(li_obj).attr('src','local');
			$(li_obj).html( "<div class='gicon' rel='" + idx +"'></div><div class='gName'>" + g_name + "</div>");
			$(".groupMenuList").append($(li_obj));
			$(li_obj).addClass('LightningSubMenuOn');
			$(li_obj).attr("title",g_name);
			$(li_obj).addClass("uTooltip");
			init_tooltip2(".uTooltip");
			
			AllGroupList[idx] = new Array();
			AllGroupList[idx].groupname= g_name;
			AllGroupList[idx].member = username.toString().replace(/,/g,'#');
			_SEL_GROUP_INDEX = idx;
			do_query_group_info(g_name,"local");
			
			init_group_item_click();
			if(idx > 5 )
			{
				$(".ButtonArrowTop").removeClass('disable').addClass('enable');
				$(".ButtonArrowBottom").removeClass('disable').addClass('enable');
				
				currentIndex = Math.ceil($(".groupMenuList li").length/moveItem);
				$(".ButtonArrowTop").removeClass('gray_out');
				$(".ButtonArrowBottom").addClass('gray_out');
				scrollDivBottom_User('SubMenuDiv');			
			}
			$("#group_detail").show();
			$("#group_desc").hide();
			$("#edit_group_tb").show();
			$("#edit_ads_group_tb").hide();
						
			jLoadingClose();		
		});
	});
}
function Delete_Group()
{
	var groupname="";
    $('.LightningSubMenu li').each(function() {
		if($(this).hasClass('LightningSubMenuOn'))
		{
			groupname = $(this).find(".gName").html();
			return false;
		}
    });
    
    if(groupname=="")
    {
    	jAlert( _T('_user','msg2'), _T('_common','error'));
    	return;
    }

    groupname = groupname.replace(/&nbsp;/g,'');
	jConfirm('M',_T('_user','del_group_desc'),_T('_user','del_group_title'),'group',function(r){
		if(r)
		{
	    	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
			wd_ajax({			 			   
				type: "POST",
				cache: false,
				url: "/cgi-bin/account_mgr.cgi",
				data:{cmd:"cgi_group_del",group:groupname},
			   	success: function()
			   	{
			   		get_account_xml('noLoading',function(){
			   			_SEL_GROUP_INDEX=0;
			   			get_group_list("del","");
			   			Get_Group_Info('#g_quota_tb','#user_list_div');
						Get_User_Info();
						jLoadingClose();
						
						currentIndex=1;
						$(".ButtonArrowTop").addClass('gray_out');
						$(".ButtonArrowBottom").removeClass('gray_out');
						scrollDivTop_User('SubMenuDiv');
			   		});
			   	}
			});
		}
    });
    	

}
function Create_Group(callback)
{	
	//do_add_group
	var g_name=$("#create_group_tb input[name='users_groupName_text']").val();
	var username = new Array();
	$("#user_list_div input:checkbox:checked[name='users_groupMember_chkbox']").each(function(i){  
		username.push("#"+$(this).val()+"#");
	});
    
	 wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:"cgi_group_add" ,group:g_name,member:username.toString()},
		success: function(data){
			if(callback) callback();
		}
	});
}
var group_of_member="";
var group_of_quota="";
var HDD_NUM="";
var HDD_SIZE="";
function do_query_group_info(groupname,type)
{
	$("#group_detail").show();
	$("#group_desc").hide();
	
	get_account_xml('noLoading',function(){
		Get_Group_Info('#m_g_quota_tb','#m_user_list_div');
		if(_ALL_ACCOUNT.length==0)
			$("#users_editGroupMember_link").hide();
		else
			$("#users_editGroupMember_link").show();
		
		var show_name = groupname;
		if(type!="local")
		{
			//groupname = groupname.split("\\")[1];
			$("#ads_groupname").html(show_name);
		}
		else
		{
			$("#edit_group_tb input[name='users_editGroupName_text']").val(groupname);
		}
	
		$("input:text").inputReset();
			
		var smb_info=new Array();
		smb_info = api_get_smb_privileges('g',type,groupname);	//in quota.js
		show_group_smb_list(smb_info);
		api_display_member();
	});
	

	
}//end do_query_user_info(username)

function show_group_smb_list(smb_info)
{
	var ul_obj = document.createElement("ul"); 
	$(ul_obj).addClass('ListDiv');

	for(var i=0 ; i < smb_info.length; i++)
	{
		var li_obj = document.createElement("li"); 
		if(smb_info[i].public=='1') $(li_obj).addClass('gray_out');
		$(li_obj).append('<div class="icon"></div>');
		$(li_obj).append('<div class="name">' + smb_info[i].sname + '</div>');
	
		var access_flag = smb_info[i].privileges;
		var imgdiv_obj = document.createElement("div");
		$(imgdiv_obj).addClass('img');
		
		switch(access_flag)
		{
			case 'n':
				$(imgdiv_obj).append('<a class="rwUp" onKeyPress="set_access2(this,\'rw\',2,event)" onclick="set_access(this,\'rw\',2)"></a><a class="rUp" onKeyPress="set_access2(this,\'r\',2,event)" onclick="set_access(this,\'r\',2)"></a><a class="dUp" onKeyPress="set_access2(this,\'d\',2,event)" onclick="set_access(this,\'d\',2)"></a>');
				$(li_obj).append($(imgdiv_obj));
				$(li_obj).append('<div class="access">'+ _T('_network_access','no_access') + '</div>');
	
				break;
			case 'd':
				$(imgdiv_obj).append('<a class="rwUp" onKeyPress="set_access2(this,\'rw\',2,event)" onclick="set_access(this,\'rw\',2)"></a><a class="rUp" onKeyPress="set_access2(this,\'r\',2,event)" onclick="set_access(this,\'r\',2)"></a><a class="dDown" onKeyPress="set_access2(this,\'d\',2,event)" onclick="set_access(this,\'d\',2)"></a>');
				$(li_obj).append($(imgdiv_obj));
				$(li_obj).append('<div class="access">'+ _T('_network_access','decline') + '</div>');
	
				break;
			case 'r':
				$(imgdiv_obj).append('<a class="rwUp" onKeyPress="set_access2(this,\'rw\',2,event)" onclick="set_access(this,\'rw\',2)"></a><a class="rDown" onKeyPress="set_access2(this,\'r\',2,event)" onclick="set_access(this,\'r\',2)"></a><a class="dUp" onKeyPress="set_access2(this,\'d\',2,event)" onclick="set_access(this,\'d\',2)"></a>');
					
				$(li_obj).append($(imgdiv_obj));
				$(li_obj).append('<div class="access">'+ _T('_network_access','read_only') + '</div>');
				break;
			case 'w':
				$(imgdiv_obj).append('<a class="rwDown" onKeyPress="set_access2(this,\'rw\',2,event)" onclick="set_access(this,\'rw\',2)"></a><a class="rUp" onKeyPress="set_access2(this,\'r\',2,event)" onclick="set_access(this,\'r\',2)"></a><a class="dUp" onKeyPress="set_access2(this,\'d\',2,event)" onclick="set_access(this,\'d\',2)"></a>');
				$(li_obj).append($(imgdiv_obj));
				$(li_obj).append('<div class="access">'+ _T('_network_access','read_write') + '</div>');
	
				break;
		}
		
		$(ul_obj).append($(li_obj));
	}
	
	$("#group_sharelist").html($(ul_obj));

    $("#group_sharelist a").each(function(idx){
    	if (!$(this).parent().parent().hasClass('gray_out'))
    		$(this).attr('tabindex','0');

    	var i = Math.floor(idx/3);
    	
    	if($(this).hasClass('rwUp') || $(this).hasClass('rwDown'))
    	{
    		$(this).attr("id","users_rw" + i + "_link");
    	}
    	else if($(this).hasClass('rUp') || $(this).hasClass('rDown'))
    	{
    		$(this).attr("id","users_r" + i + "_link");
    	}
    	else if($(this).hasClass('dUp') || $(this).hasClass('dDown'))
    	{
    		$(this).attr("id","users_d" + i + "_link");
    	}
    	    		
    });
}

function modify_group(mtype,val,obj)
{
	var mflag;
	var username = new Array();
	var num=0;
	var groupname = get_current_item(".groupMenuList");
	var oldGroup  = groupname;
	switch(mtype)
	{
		case 'quota':
			mflag=1;
			//check quota
			var hdd_num = parseInt(_HDD_NUM,10);
			var available_array = new Array($("#m_g_quota_tb input[name='users_v1Size_text']"),$("#m_g_quota_tb input[name='users_v2Size_text']"),
											$("#m_g_quota_tb input[name='users_v3Size_text']"),$("#m_g_quota_tb input[name='users_v4Size_text']"));
			var available_val = new Array("null","null","null","null");
			
			for(var i=0;i<hdd_num;i++)
			{
				var val = available_array[i].val();
				if(val=="") val = 0;
				
				var idx=i+1;
				var unit_x = $("#m_g_quota_tb").find("#quota_unit_" + idx).attr("rel");
				var unit = get_unit(unit_x);
				val = val * unit;
				if(chk_quota_value(val,_HDD_SIZE[i])!=0)
				{
					$("#popup_ok_button").click( function (){
						$("#popup_ok_button").unbind("click");
						available_array[i].focus();	
					});
					return -1;
				}
				
				available_val[i]=val;
			}
			
			if(Check_group_quoga(available_val,"m_user_list_div")==-1) return;
			
			break;
		case 'member':
		
		    $("#m_user_list_div input:checkbox:checked[name='users_editGroupMember_chkbox']").each(function(i){  
				username.push($(this).val());
				num++;
		    });
		    var member = username.toString().replace(/,/g,'#');
    		AllGroupList[_SEL_GROUP_INDEX].member = member;
			mflag=2;
			break;
		case 'gname':
			var create_status = api_do_query_create_status2("iGroup");
			if(create_status==-1)
			{
				jAlert(_T('_user','msg46'), 'warning2');
				return;
			}
			if(check_group_value("#edit_group_tb","users_editGroupName_text")==-1)
			{
				$("#popup_ok_button").click( function (){
					$("#popup_ok_button").unbind("click");
					$("#edit_group_tb input[name='users_editGroupName_text']").focus();
				});
				return -1;
			}
		
			hide_button("users_editGroupSave_button");
			groupname = $("#edit_group_tb input[name='users_editGroupName_text']").val();
			mflag=3;
			
			AllGroupList[_SEL_GROUP_INDEX].groupname = groupname;
			$(".LightningSubMenuOn .gName").html(groupname);			
			break;
	}

	var available = new Array("","","","");
	for (var i=0 ;i < _HDD_NUM ;i++)
	{
		var idx = i+1;
		
		var qsize = $("#m_g_quota_tb input[name='users_v" + idx + "Size_text']").val();
		if(qsize=="") qsize=0;
		available[i] = qsize;
		
		var unit_x = $("#m_g_quota_tb").find("#quota_unit_" + idx).attr("rel");
		var unit = get_unit(unit_x);		
		available[i] = available[i]*unit;
	}
	var available1 = available[0];
	var available2 = available[1];
	var available3 = available[2];
	var available4 = available[3];
	
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback	
 	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data:{cmd:"cgi_modify_group",group:groupname,member:username.toString(),
				available1:available1,available2:available2,
				available3:available3,available4:available4,
				mtype:mflag,oldGroup:oldGroup
			},
		success: function(){
			
			if(mtype=="member")
			{
				do_query_group_info(groupname,'local');
			}
			if(mtype!="gname")
			{
				_DIALOG.close();
			}
			jLoadingClose();
		}
//		,
//		 error:function(xmlHttpRequest,error){   
//        		alert("Error: " +error);   
//  		 }  
	}); 
}
function init_group_item_click()
{
	$('.groupMenuList li').unbind('click');
    $('.groupMenuList li').click(function() {
	    $('.LightningSubMenu li').each(function() {
			$(this).removeClass('LightningSubMenuOn');
	    });
	    
	    $(this).addClass('LightningSubMenuOn');
	    
	    var i = $(this).children().attr('rel');
	    var type = $(this).attr('src');
	    
	    $("#users_removeGroup_button").removeClass("gray_out");
	    
	    if(type=="local")
	    {
			$("#edit_group_tb").show();
			$("#create_tb").show();
			$("#edit_ads_group_tb").hide();
	    }
	    else
	    {
	    	$("#users_removeGroup_button").addClass("gray_out");
	    	$("#edit_ads_group_tb").show();
	    	$("#edit_group_tb").hide();
	    }
	    
	    _SEL_GROUP_INDEX = i;
	    do_query_group_info(AllGroupList[i].groupname,type);
    });
    
    $('.LightningSubMenu li').unbind('keypress');
    $('.LightningSubMenu li').keypress(function(e){
    	if (e.keyCode=='13')
    		$(this).click();
    });
}
function g_chkboxEvent(e,obj)
{
	if (e.keyCode=='13')
	{
		$(obj).find('input:Checkbox').click();
		
		if($(obj).find('input:Checkbox').prop('checked'))
		{
			$(obj).find('input:Checkbox').parent().parent().parent().find('.username').css('color','#0067A6');
			$(obj).find('input:Checkbox').parent().parent().parent().find('.email').css('color','#0067A6');
		}
		else
		{
			$(obj).find('input:Checkbox').parent().parent().parent().find('.username').css('color','#898989');
			$(obj).find('input:Checkbox').parent().parent().parent().find('.email').css('color','#898989');
		}
	}
}
function api_get_group_quota_info(groupname,type,callback)
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
				
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:"cgi_get_modify_group_info" ,group:groupname},
		dataType: "xml",
		async: false,
		success: function(xml){
			
			//show group's quota to webpage
			var v_name = new Array("","","","");
			var size = new Array("","","","");
			var q_size_array = new Array("","","","");
			$(xml).find('quota').each(function(index){
				v_name[index] = $(this).find('v_name').text();
				size[index] = $(this).find('size').text();
				q_size_array[index]=$(this).find('size').text();
			});
			
			fill_info('g',"",q_size_array,_HDD_SIZE,'#m_g_quota_tb');
			
			jLoadingClose();
			
			if(callback) {callback();}			

		},
		error:function(xmlHttpRequest,error){   
			//alert("Error: " +error);   
		}  
	});
}

function api_display_member()
{
	//show gruop's member to webpage
	var group_of_member=AllGroupList[_SEL_GROUP_INDEX].member;

	var g_number=0;
	if(group_of_member!="")
	{
		//show user's gorup to webpage
		group_of_member=group_of_member.split("#");

		$("#m_user_list_div").find('.username').css('color','#898989');
		$("#m_user_list_div").find('.email').css('color','#898989');
			
		for(i=0;i<group_of_member.length;i++)
		{
			$("#m_user_list_div input[name='users_editGroupMember_chkbox']").each(function() {
				if ($(this).val()==group_of_member[i])
				{
					$(this).attr("checked", true);
					$(this).parent().parent().parent().find('.username').css('color','#0067A6');
					$(this).parent().parent().parent().find('.email').css('color','#0067A6');
				}
	     	});
		}
		g_number = group_of_member.length ;
	}
	$("#show_group_div").html( g_number + "&nbsp;" + _T('_user','user') + "&nbsp;&nbsp;");
	
	
		if($(this).prop('checked'))
		{
			$(this).parent().parent().parent().find('.username').css('color','#0067A6');
			$(this).parent().parent().parent().find('.email').css('color','#0067A6');
		}
		else
		{
			$(this).parent().parent().parent().find('.username').css('color','#898989');
			$(this).parent().parent().parent().find('.email').css('color','#898989');
		}
}