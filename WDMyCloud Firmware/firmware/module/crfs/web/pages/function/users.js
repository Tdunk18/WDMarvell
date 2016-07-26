var __USER_LIST_INFO = new Array();
var share_read_list = new Array();
var share_write_list = new Array();
var share_decline_list = new Array();
var _DIALOG="";
var _LOCAL_ADMIN_NAME="";
var AllUserList = new Array();
var _SEL_USER_INDEX=0;
function get_user_list(c_user,entry)
{
	if(c_user=="")
	{
		$("#users_removeUser_link").addClass("gray_out");
		//$(".userMenuList").html('<div class="waiting_msg"><img src="/web/images/SpinnerSun.gif" border=0>'+'</br></br>'+_T('_user','wait_uesrs')+"</div>");
	}
	
	__USER_LIST_INFO = new Array();
	var __USER_LIST_TMP = new Array();
	//local user
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/xml/account.xml",
		dataType: "xml",
		success: function(xml){
			
			var aIndex=0;
			
			var admin_array = new Array();
			var j=0;
			
			var cloudholderMember= new Array();
			$(xml).find('groups > item').each(function(index){
				var gname = $(this).find('name').text();

				if(gname==_Filter_Default_Group[0])	//0:cloudholders
				{
					$(this).find('users > user').each(function(){
						cloudholderMember.push($(this).text());
					});
				}
			});
			
			$(xml).find('users > item').each(function(index){
				var user_name = $(this).find('name').text();
				var uid = $(this).find('uid').text();
				var gid = $(this).find('gid').text();
				var first_name = $(this).find('first_name').text();
				var last_name = $(this).find('last_name').text();
				var email = $(this).find('email').text();
				var pwd = $(this).find('pwd').text();
				var hint = $(this).find('hint').text();
				var expires = parseInt($(this).find('expired').text(),10);
				
				//if(gid==_ADMIN_GID || uid==_ADMIN_UID)	//1001
				if(uid==_ADMIN_UID)	//1001
				{
					if(uid==_ADMIN_UID)
					{
						_LOCAL_ADMIN_NAME = user_name;
					}
					admin_array[j] = new Array();
					admin_array[j].username = user_name;
					admin_array[j].type = "local";
					admin_array[j].uid = uid;
					admin_array[j].gid = gid;
					admin_array[j].first_name = first_name;
					admin_array[j].last_name = last_name;
					admin_array[j].email = email;
					admin_array[j].pwd = pwd;
					admin_array[j].hint = hint;
					admin_array[j].groups = "";
					admin_array[j].expires = -1;
					admin_array[j].isAdmin = 1;
					j++;
					return true;
				}
					
				//check user in cloudholders 
				if( api_filter_user(user_name,cloudholderMember) == 1 ) return true; //non-cloudholders users cannot show on GUI
				
				__USER_LIST_INFO[aIndex] = new Array();		
				__USER_LIST_INFO[aIndex].username = user_name;
				__USER_LIST_INFO[aIndex].uid = uid;
				__USER_LIST_INFO[aIndex].gid = gid;
				__USER_LIST_INFO[aIndex].type = "local";
				__USER_LIST_INFO[aIndex].first_name = first_name;
				__USER_LIST_INFO[aIndex].last_name = last_name;
				__USER_LIST_INFO[aIndex].email = email;
				__USER_LIST_INFO[aIndex].pwd = pwd;
				__USER_LIST_INFO[aIndex].hint = hint;
				__USER_LIST_INFO[aIndex].expires = expires;
				__USER_LIST_INFO[aIndex].isAdmin = 0;

				var groups = new Array();
				$(this).find('groups > group').each(function(){
					groups.push($(this).text());
				});
				
				groups = groups.toString().replace(/,/g,'#');
				__USER_LIST_INFO[aIndex].groups = groups;
								
				aIndex++;
			});
			
			_ALL_GROUP="";
			$(xml).find('groups > item').each(function(index){
				var gname = $(this).find('name').text();
				if( api_filter_default_group(gname) ==0) return true;
				_ALL_GROUP +="#"+ gname;
			});
			_ALL_GROUP = _ALL_GROUP.slice(1,_ALL_GROUP.length); 

			_TOTAL_ACCOUNT_NUM = __USER_LIST_INFO.length;
			
			__USER_LIST_INFO.sort(function(a, b){
			    var a1= a.username, b1= b.username;
			    if(!b1) b1=a1;
			    if(a1== b1) return 0;
			    return a1> b1? 1: -1;
			});
			
			__USER_LIST_TMP = admin_array.concat(__USER_LIST_INFO);
			
			_get_ad();
			
		},
		error:function(xmlHttpRequest,error){
			//alert("Error: " +error);
		}
	});
	
	//ads account
	var ADUList = new Array();
	var ADAdmin_array = new Array();
	var j=0;
	function _get_ad()
	{
		wd_ajax({
			type: "GET",
			cache: false,
			url: "/web/php/getADInfo.php?type=users",
			dataType: "xml",
			success: function(xml){
				var workgroup= $(xml).find('ads_workgroup').text();
				var domain_enable= $(xml).find('domain_enable').text();//0:off 1:AD 2:LDAP 
				var count = $(xml).find('users > item').length;
				var dType = "ad";
				var domainAdmin_member;
				
				if(domain_enable=='2') dType="ldap";
				
				if(domain_enable!="0" && count!=0)
				{
					if(domain_enable=='1')
					{
						domainAdmin_member = $(xml).find('domain_admin_member').text().split(":");
						domainAdmin_member = domainAdmin_member[3].split(",");
					}
					
					var idx=0;
					ADUList[idx] = new Array();
					ADUList[idx].username = "";
					ADUList[idx].uid = "";
					ADUList[idx].gid = "";
					ADUList[idx].type = "";
					ADUList[idx].groups="";
					ADUList[idx].isAdmin=0;
					
					idx++;
					$(xml).find('users > item').each(function(index){
						var user_name = $(this).find('name').text();
						
						var userName = workgroup + "\\" + user_name.toLowerCase();
						if($.inArray(userName, domainAdmin_member )!=-1 && dType=="ad")
						{
							var n = workgroup + "\\" + user_name;
							
							ADAdmin_array[j] = new Array();
							ADAdmin_array[j].username = n;
							ADAdmin_array[j].uid = "";
							ADAdmin_array[j].gid = "";
							ADAdmin_array[j].type = dType;
							ADAdmin_array[j].groups="";
							ADAdmin_array[j].isAdmin=1;
							j++;
							return true;
						}
//						if(user_name=="Administrator" && dType=="ad") 
//						{
//							_AD_ADMIN_NAME = workgroup + "\\" + user_name;
//							return true;
//						}
						else if(user_name=="admin" && dType=="ldap")
						{
							_AD_ADMIN_NAME = user_name;
							return true;
						}
						
						if(idx==_MAX_TOTAL_AD_ACCOUNT) return false;
						
						ADUList[idx] = new Array();
						if(dType=="ad")
						ADUList[idx].username =  workgroup + "\\"+ user_name;
						else
							ADUList[idx].username =  user_name;
							
						ADUList[idx].uid = "";
						ADUList[idx].gid = "";
						ADUList[idx].type = dType;
						ADUList[idx].groups="";
						ADUList[idx].isAdmin=0;
						idx++;
					});
					
					ADUList.sort(function(a, b){
					    var a1= a.username.toLowerCase() , b1= b.username.toLowerCase() ;
					    if(!b1) b1=a1;
					    if(a1== b1) return 0;
					    return a1> b1? 1: -1;
					});
					
					__AD_LIST_TMP = ADAdmin_array.concat(ADUList);
					
					if(_AD_ADMIN_NAME.length!=0 && dType=="ldap")
					{					
					ADUList[0].username = _AD_ADMIN_NAME;
					ADUList[0].uid = "";
					ADUList[0].gid = "";
						ADUList[0].type = dType;
					ADUList[0].groups="";
						ADUList[0].isAdmin=1;
					}
													
					AllUserList = __AD_LIST_TMP.concat(__USER_LIST_TMP);
				}
				else
				{
					AllUserList = __USER_LIST_TMP;
				}
				
				//display all user to page
				$(".userMenuList").empty();
				for(var i=0 in AllUserList)
				{
					var user_name = AllUserList[i].username;
					if(user_name.length==0)
					{
						continue;
					}
										
					var li_obj = document.createElement("li");
					var type = AllUserList[i].type;
					var gid = AllUserList[i].gid;
					var uid = AllUserList[i].uid;
					var isAdmin = AllUserList[i].isAdmin;
					
					$(li_obj).attr("src",type);
					$(li_obj).attr("id","users_user_"+user_name);
					$(li_obj).attr("title",user_name);
					$(li_obj).addClass("uTooltip");
					
					//if( ((type=="local" && (gid == _ADMIN_GID || uid==_ADMIN_UID))) || 
					if( ((type=="local" && uid==_ADMIN_UID)) || 
						(type=="ad" && isAdmin==1) ||
						(type=="ldap" && user_name==_AD_ADMIN_NAME))
						$(li_obj).html( "<div class='adminicon' rel='" + i +"'></div><div class='uName'>" + user_name + "</div>");
					else
						$(li_obj).html( "<div class='uicon' rel='" + i +"'></div><div class='uName'>" + user_name + "</div>");

					if(c_user!="" && user_name==c_user)
					{
						$(li_obj).addClass('LightningSubMenuOn');
						do_query_user_info(AllUserList[i].username,type);
						
						var p = Math.ceil(i/moveItem);
						currentIndex = p;
					}
					
					$(li_obj).attr('tabindex','0');
					$(".userMenuList").append($(li_obj));
				}
				
				init_tooltip2(".uTooltip");
				
				if(entry!="home")
				{
					if(currentIndex <=1)
					{
						$(".ButtonArrowTop").removeClass('gray_out').addClass('gray_out');
						$(".ButtonArrowBottom").removeClass('gray_out');
						scrollDivTop_User('SubMenuDiv');
						
						if( AllUserList.length > 6)
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
					}
					else
					{
						$(".ButtonArrowTop").addClass('enable').removeClass('disable').removeClass('gray_out');
						$(".ButtonArrowBottom").addClass('enable').removeClass('disable').removeClass('gray_out');
						
						scrollDivTop_User('SubMenuDiv');
						
						for(j=1;j<= currentIndex;j++)
						{
							currentIndex = j;
							scrollDivUp('SubMenuDiv');
						}
					}
							
					init_item_click();
				}
			},
			error:function(xmlHttpRequest,error){
				//alert("Error: " +error);
			}
		});
	}
}
var _U_INIT_FLAG=0;
var _ENTRY = "";
var Create_user_Obj="";
function init_create_user_dialog(entry_page)
{
	_ENTRY = entry_page;
	var _TITLE = _T('_user','user_title');
	$("#createUserDiag_title").html(_TITLE);
	$("#create_user_tb input[name='users_userName_text']").val("");
	$("#create_user_tb input[name='users_firstName_text']").val("");
	$("#create_user_tb input[name='users_lastName_text']").val("");
	$("#create_user_tb input[name='users_mail_text']").val("");
	$("#create_user_tb input[name='users_newPW_password']").val("");
	$("#create_user_tb input[name='users_comfirmPW_password']").val("");
	
	$("#create_pw_tb").hide();
	$('#create_required').hide();
	$("#group_list_div input[name=users_joinGroup_chkbox]").attr("checked", false);
	$("#group_list_div .username").css("color","#898989");
 		
	$("#createUserDiag .TooltipIconError").removeClass('SaveButton');
	$("#createUserDiag .TooltipIconError").addClass('SaveButton');
	
	setSwitch('#users_addUserExpires_switch',0);
	init_switch();
	display_expires(0);
	
	ui_tab("#userDiag","#users_userName_text","#users_addUserSave_button");
		
	//Get_User_Info();
	var aTotal = api_get_local_user_count(entry_page);

    //console.log("aTotal=[%d] _MAX_TOTAL_ACCOUNT=[%d]",aTotal,_MAX_TOTAL_ACCOUNT)		
	if( aTotal >=_MAX_TOTAL_ACCOUNT )
	{
		jAlert(_T('_user','msg1'), _T('_common','error'));
		return;
	}
	
	language();
	
	$("#userDiag").show();
	$("#pwDiag").hide();
	$("#groupDiag").hide();
	$("#quotaDiag").hide();
	
  	Create_user_Obj=$("#createUserDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
  		        		onBeforeLoad: function() {
            				setTimeout("$('#create_user_tb input[name=users_userName_text]').focus()",100);
            			},
						onBeforeClose: function() {            			
            			}
        			});
	Create_user_Obj.load();
	
	var q_size_array = new Array();
	for (var i=0 ;i < _HDD_NUM ;i++)
	{
		q_size_array.push("");
	}
	
	fill_info('u',"",q_size_array,_HDD_SIZE,'#create_quota_tb');

	$("input:text").inputReset();
	$("input:password").inputReset();

	$(".tip_mail").attr('title',_T('_tip','account_mail'));
	init_tooltip();	
		
	//userDiag
	$("#users_addUserSave_button").unbind("click");
	$("#users_addUserSave_button").click(function(){
		
		//check account
		var name = $("#create_user_tb input[name='users_userName_text']").val().toLowerCase();
		var firstName = $("#users_firstName_text").val();
		var lastName = $("#users_lastName_text").val();
		var v = check_account_value(name);
		//var name = firstName;
		if(v !=0)
		{
//			if(v==-3)
//			{
//				name = api_get_correct_name(firstName);
//			}
//			else
			{
				$('#create_user_tb input[name=users_userName_text]').focus();
				return -1;
			}
		}
		
		//check first name
		if(check_first_value(firstName,1)==-1)
		{
			$('#create_user_tb input[name=users_firstName_text]').focus();
			return -1;
		}
		
		//check last name
		if(check_last_value(lastName,1)==-1)
		{
			$('#create_user_tb input[name=users_lastName_text]').focus();
			return -1;
		}
				
		//check mail address
		var mail = $('#create_user_tb input[name=users_mail_text]').val();
		if(mail.length!=0 && _LOCAL_LOGIN==0)
		{
			jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
			return -1;
		}
		if(checkmail(mail))
		{
			if(mail.length!=0)
			{
				show_error_tip(".tip_mail_error",_T('_user','msg49'));
				$('#create_user_tb input[name=users_mail_text]').focus();
				return -1;
			}
		}
		else if(mail.length >48)
		{
			show_error_tip(".tip_mail_error",_T('_user','msg49'));
			$('#create_user_tb input[name=users_mail_text]').focus();
			return -1;
		}
		
		$("#create_user_tb .TooltipIconError").removeClass('SaveButton');
		$("#create_user_tb .TooltipIconError").addClass('SaveButton');
		
		//check password
		var pw = $("#users_newPW_password").val();
		var pw2 = $("#users_comfirmPW_password").val();
		if(pw.length!=0)
		{
			var chk_flag = chk_pw("#create_user_tb",pw,pw2);
			if(chk_flag==-1)
			{
				$('#create_user_tb input[name=users_newPW_password]').focus();
				return;
			}
			else if(chk_flag==-2)
			{
				$('#create_user_tb input[name=users_comfirmPW_password]').focus();
				return;
			}
		}
		Create_User_And_Share(name);
	});
}
var	_ALL_ACCOUNT="";
var _ALL_GROUP=""
var _TOTAL_ACCOUNT_NUM="";
var _HDD_NUM="";
var _HDD_SIZE ="";
function Get_User_Info()
{
	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data:"cmd=cgi_get_user_info",	
		dataType: "xml",
		success: function(xml){
			$(xml).find('v_name').each(function(index){
				_VOLUME_NAME[index] = $(this).text();	//for batch_user.js
			});

			//_ALL_ACCOUNT = $(xml).find('all_user').text();
			//_ALL_GROUP = $(xml).find('all_group').text();
			//_TOTAL_ACCOUNT_NUM = $(xml).find('total').text();
			//_TOTAL_ACCOUNT_NUM = parseInt(_TOTAL_ACCOUNT_NUM,10)+1; //+1 (admin)
			_HDD_NUM = $(xml).find('hddnum').text();
			_HDD_SIZE = $(xml).find('hddsize').text();
			_HDD_SIZE = _HDD_SIZE.split(",");
		}
		,
		 error:function(xmlHttpRequest,error){   
        		//alert("Get_User_Info->Error: " +error);   
  		 }  
	});
}
function show_error_tip(tipID,msg)
{
	$(tipID).attr('title',msg);
	//$(tipID).show();
	$(tipID).removeClass('SaveButton');
	$(tipID).show();
	init_tooltip(".TooltipIconError");
}
function check_first_value(firstName,entry)
{
	if(firstName_lastName_check(firstName) || firstName.length >16 || firstName.indexOf(" ")!=-1)
	{
		//First name must be an alphanumeric value between 1 and 256 characters and cannot contain spaces.
		if(entry==1)
			show_error_tip(".tip_first_name_error",_T('_user','msg39'));
		else
			jAlert(_T('_user','msg39'), _T('_common','error'));
		return -1;
	}
}
function check_last_value(lastName,entry)
{
	if(firstName_lastName_check(lastName) || lastName.length >16)
	{
		if(entry==1)
			show_error_tip(".tip_last_name_error",_T('_user','msg48'));
		else
			jAlert(_T('_user','msg48'), _T('_common','error'));
		return -1;
	}
}
function check_account_value(name)
{
	if( name == "" )
	{
		//First name must be an alphanumeric value between 1 and 16 characters and cannot contain spaces.
		show_error_tip(".tip_user_error",_T('_user','msg47'));
		return -1;
	}
	
	var local_account ="";
	for(i in AllUserList)
	{
		if(AllUserList[i].type=="local")
	{
			local_account +="#" + AllUserList[i].username;
		}
	}
	
	local_account = local_account.slice(1,local_account.length);
	var flag = checkID(name,local_account);

	if(flag==0)
	{
		//This first name does not accepted . Please try again.
		show_error_tip(".tip_user_error",_T('_user','msg7').replace(/%s/g,name));
		return -2;
	}

	if(flag==1)
	{
		//The first name entered already exists. Please select a different first name.
		show_error_tip(".tip_user_error",_T('_user','msg12'));
		return -3;
	}
		
	if(Chk_account(name) || name.indexOf(" ") != -1 || name.length >16)
	{
		//First name must be an alphanumeric value between 1 and 16 characters and cannot contain spaces.
		show_error_tip(".tip_user_error",_T('_user','msg47'));
		return -4;
	}

	if(chk_first_char(name))
	{
		//The first name must begin with a-z,A-Z,0-9
		show_error_tip(".tip_user_error",_T('_user','msg25'));
		return -5;
	}
	
 	var group=_ALL_GROUP.split("#");
 	for(i=0;i<group.length;i++)
 	{
 		if(group[i]==name)
 		{
 			show_error_tip(".tip_user_error",_T('_user','msg11'));
 			return -6;
 			break;
 		}
 	}
 	
 	return 0;
}
function chk_name_symbol(name)
{
	//return 1:	not a valid value
	
	//	/:*?"<>|.;+=~'[]{}@#()!'^$%&,`\
	
	var re=/[/:*?\"<>|.;+=~'\[\]{}@#()!'^$%&,`\\]/;

	if(re.test(name))
	{
 		return 1;
	}
	return 0;
}

function chk_pw(tableID,pw,pw2)
{
	$(tableID+" .tip_pw_error").hide();
	$(tableID+" .tip_pw2_error").hide();
	$(tableID+" .tip_admin_pw_error").hide();
	
	//set password
	if( pw == "" )
	{
		//Please enter a password.
		show_error_tip(tableID+" .tip_pw_error",_T('_mail','msg11'));
		return -1;
	}
	
	if(pw_check(pw)==1)
	{
		//The password must not include the following characters:  @ : / \ % '
		show_error_tip(tableID+" .tip_pw_error",_T('_pwd','msg8'));
		return -1;	
	}

	if (pw.indexOf(" ") != -1) //find the blank space
 	{
 		//Password must not contain space.
 		show_error_tip(tableID+" .tip_pw_error",_T('_pwd','msg9'));
 		return -1;
 	}

	if (pw.length < 5) 
	{
		//jAlert('Password must be at least 5 characters in length. Please try again.', 'Error');
		show_error_tip(tableID+" .tip_pw_error",_T('_pwd','msg10'));
 		return -1;	
	}
	
	if (pw.length > 16)
	{
		//jAlert('The password length cannot exceed 16 characters. Please try again.', 'Error');
		show_error_tip(tableID+" .tip_pw_error",_T('_pwd','msg11'));
 		return -1;			
	}
			
	if( pw != pw2 )
	{
		//jAlert('The new password and confirmation password does not match. Please try again.', 'Error');
		//jAlert(_T('_pwd','msg7'), _T('_common','error'));
		show_error_tip(tableID+" .tip_pw_error",_T('_pwd','msg7'));
		return -2;
	}
}

function Check_user_quota(available_val,chkboxID,available_array)
{
	var maxsize;
	var str;
	var g_name = new Array();
	var MB = " MB" ;
	var CHECK_QUOTA_FLAG=0;
	var num=0;
	var g_name_list="";
	
	if(_USER_MODIFY_INFO.type=="local")
	{
	    $("input:checkbox:checked[name='" + chkboxID + "']").each(function(i){  
			g_name.push($(this).val());
			num++;
	    });
	    
	    g_name_list = g_name[0];
	}
	else
	{
		g_name_list = $("#ads_name").text();
	}
    
	if(num==0)
	{
		return CHECK_QUOTA_FLAG;
	}

	wd_ajax({
		type: "POST",
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:"cgi_adduser_get_user_quota_maxsize" ,name:g_name_list},
		cache: false,
		dataType: "xml",
		async: false,
		success: function(xml){
			$(xml).find('quota_info').each(function(){
				maxsize=$(this).find('max_size').text();
				var tmp_maxsize=maxsize.split(":");
				
				for(var i=0;i<tmp_maxsize.length;i++)
				{
					var available = available_val[i];
					
					if(available!="null" && available!=0)
					{
						var m_size=parseInt(tmp_maxsize[i],10)/1024 ;
						if( parseInt(available,10) > m_size && tmp_maxsize[i]!=0)
						{
							//str="The user quota amount cannot larger than the group quota amount." 
							str = _T('_quota','msg1');
							m_size = map_quota_size(m_size);
							str = str + "(" + m_size + ")" ;
							jAlert(str, _T('_common','error'));
							
							$("#popup_ok_button").click( function (){
								$("#popup_ok_button").unbind("click");
								available_array[i].focus()	
							});
							CHECK_QUOTA_FLAG=-1;
							break;
						}
					}
				}
			});
		}
		,
		 error:function(xmlHttpRequest,error){   
        		//alert("cgi_adduser_get_user_quota_maxsize->Error: " +error);   
  		 }
	});
	
	return CHECK_QUOTA_FLAG;  
}
function Create_User_And_Share(name)
{
	$("#users_removeUser_link").removeClass("gray_out");
	var first_name = $("#create_user_tb input[name='users_firstName_text']").val();
	var last_name = $("#create_user_tb input[name='users_lastName_text']").val();
	var pw_onoff = 0;
	var mail =  $("#create_user_tb input[name='users_mail_text']").val();
	var u_pw = $("#create_user_tb input[name='users_newPW_password']").val();
	
	if(u_pw.length!=0)
	{
		pw_onoff = 1;
		u_pw = Base64.encode(u_pw);
	}

	Create_user_Obj.close();
	
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
    
	 wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:"cgi_user_add" ,name:name, pw:u_pw,
					group:"",first_name:first_name,
					last_name:last_name,
					pw_onoff:pw_onoff,
					mail:mail,expires_time:""},
		dataType: "xml",
		success: function(xml){
			_REST_Register_User(name,mail,'user');
			
			reload_user_data(name,first_name,last_name,mail,pw_onoff);
			//do_restart_service(); move to cgi
		}
	});
}
function reload_user_data(u_name,first_name,last_name,mail,pw_onoff)
{
	if(_ENTRY=="users")
	{
		$('.LightningSubMenu li').each(function() {
			$(this).removeClass('LightningSubMenuOn');
    	});
		var idx = $(".userMenuList li").length;
		var li_obj = document.createElement("li");
		$(li_obj).attr('src','local');
		$(li_obj).html( "<div class='uicon' rel='" + idx +"'></div><div class='uName'>" + u_name + "</div>");
		$(".userMenuList").append($(li_obj));
		$(li_obj).addClass('LightningSubMenuOn');
		
		$(li_obj).attr("id","users_user_"+u_name);
		$(li_obj).attr("title",u_name);
		$(li_obj).addClass("uTooltip");
					
		init_tooltip2(".uTooltip");
		
		AllUserList[idx] = new Array();
		AllUserList[idx].username= u_name;
		AllUserList[idx].last_name = last_name;
		AllUserList[idx].first_name = first_name;
		AllUserList[idx].email = mail;
		AllUserList[idx].hint ="";
		AllUserList[idx].pwd = pw_onoff;
		AllUserList[idx].type = "local";
		
		var v = getSwitch('#users_addUserExpires_switch');
		var exps="-1";
		if(v!=0)
		{
			var e = expires_time.replace(/-/g,'/');
			var minutes=1000*60;
			var hours=minutes*60;
			var days=hours*24;
			var years=days*365;
			var date=new Date(e);
			var t=date.getTime();
			
			var dd=Math.round(t/days);
			exps = dd;
		}
		
		AllUserList[idx].expires = exps;
		
		AllUserList[idx].groups = "";
		_SEL_USER_INDEX = idx;
		Get_SMB_Info(function(){
		do_query_user_info(u_name,"local");
		$("#edit_user_tb").show();
		$("#edit_ads_user_tb").hide();
					
		init_item_click();
		if(idx > 5 )
		{
			$(".ButtonArrowTop").removeClass('disable').addClass('enable');
			$(".ButtonArrowBottom").removeClass('disable').addClass('enable');
			currentIndex = Math.ceil($(".userMenuList li").length/moveItem);
			$(".ButtonArrowTop").removeClass('gray_out');
			$(".ButtonArrowBottom").addClass('gray_out');
			scrollDivBottom_User('SubMenuDiv');
		}	
		});

		_TOTAL_ACCOUNT_NUM++;
	}
	else
		show_user_info();
}
function write_group_table()
{
	if(_ALL_GROUP=="")
	{
		$("#g_desc").hide();
		$("#tip_group").show();
		$("#tip_group").attr('title',_T('_tip','group'));
		init_tooltip();
		document.getElementById("group_list_div").innerHTML =_T('_user','none_group');	//None group.
		return;
	}
	else
	{
		$("#g_desc").show();
	}

	$("#group_list_div").empty();
	
	var ul_obj = document.createElement("ul"); 
	$(ul_obj).addClass('uListDiv');
	
	var group=_ALL_GROUP.split("#");
	
	j=1;
	for(var i=0 in group)
	{
		var li_obj = document.createElement("li"); 
		var chkbox="<input type='Checkbox' id='users_joinGroup_chkbox' name='users_joinGroup_chkbox' value='" + group[i] + "'>"
		$(li_obj).append('<div class="chkbox" tabindex="' + j + '" onkeypress="chkboxEvent(event,this)">' + chkbox + '</div>');
		$(li_obj).append('<div class="username">' + group[i] + '</div>');
		$(ul_obj).append($(li_obj));
		j++;
	}
	$("#group_list_div").append($(ul_obj));

	$("#group_list_div input[name=users_joinGroup_chkbox]").click(function() {
		
		if($(this).prop('checked'))
		{
			$(this).parent().parent().parent().find('.username').css("color","#0067A6");
		}
		else
		{
			$(this).parent().parent().parent().find('.username').css("color","#898989");
		}
 	});
		
	$("input:checkbox").checkboxStyle(); 		
	$("#users_addUserBack3_button").attr('tabindex',j);
	j++;
	$("#users_addUserCancel3_button").attr('tabindex',j);
	j++;
	$("#users_addUserNext3_button").attr('tabindex',j);
}

function get_group_info()
{
	var group=_ALL_GROUP.split("#");
	var data="";
	for(i=0;i<group.length;i++)
	{
		var chkbox="<input type='Checkbox' id='users_joinGroup_chkbox' name='users_joinGroup_chkbox' value='" + group[i] + "'>"
		data=data+"<tr><td>" + group[i] + "</td><td>" + chkbox + "</td></tr>";
	}
	return data;	
}

function do_restart_service()
{
	//smb,afp
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:"cgi_restart_service"},
		success: function(data){
		}
	});
}
var user_of_group="";
var user_of_quoga="";
var HDD_NUM="";
var HDD_SIZE="";
var MAIN_GROUPNAME="";
var MAX_QUOTA= new Array();
var __WEBDAV_READ_LIST = new Array();
var __WEBDAV_WRITE_LIST = new Array();
var _USER_SHARE_FOLDER= new Array();
var _USER_MODIFY_INFO={name:"",firstname:"",lastname:"",mail:"",pw:"",pw_hit:""};
var _EXPIRES_ENABLE="";
function hide_button(eid)
{
	var obj = "#" + eid;
	if($(obj).length!=0)
	{
	document.getElementById(eid).style.visibility = 'hidden'; 
}
}
function do_query_user_info(username,type)//type:local or ad
{
	$("#edit_user_tb input[name='users_editUserName_text']").val("");
	$("#edit_user_tb input[name='users_editLastName_text']").val("");
	$("#edit_user_tb input[name='users_editLastName_text']").val("");
	$("#edit_user_tb input[name='users_editMail_text']").val("");
	
	var gid = AllUserList[_SEL_USER_INDEX].gid;
	var uid = AllUserList[_SEL_USER_INDEX].uid;
    if(type=="local" && (gid!=_ADMIN_GID || uid!=_ADMIN_UID))
    {
		m_write_group_tab();
	}
	
	$("#user_desc").hide();
	$("#user_detail").show();
	
	$("#edit_name_td #users_editUserName_text").focus();
	
	if( ((type=="local" && (gid==_ADMIN_GID || uid==_ADMIN_UID))) || (type=="ad" && username==_AD_ADMIN_NAME))
	{
		$("#ushare_div").show();
		$("#group_tr").hide();
		$("#quota_tr").hide();
		$("#account_expires_tr").hide();
		
		/*
		if((type=="ad" && username==_AD_ADMIN_NAME))
		{
			if(!$("#share_mask_id").hasClass('gray_out'))
				$("#share_mask_id").addClass('gray_out')
		}*/
		
		if(type=="local")
		{
			setSwitch('#users_isAdmin_switch',1);
		}
	}
	else
	{
		$("#share_mask_id").removeClass('gray_out')
		$("#ushare_div").show();
		if(GROUP_FUNCTION==1)
		{
		$("#group_tr").show();
		}
		if(QUOTA_FUNCTION==1)
		{
		$("#quota_tr").show();
		}
		$("#account_expires_tr").show();
		setSwitch('#users_isAdmin_switch',0);
	}
	hide_button("users_editFirstNameSave_button");
	hide_button("users_editLastNameSave_button");
	hide_button("users_editMailSave_button");
	hide_button("users_editNameSave_button");
	var smb_info=new Array();
	var show_name =username;
	
	/*if(type=="ad")
	{
		if(username.indexOf("\\")!=-1)
		{
			username = username.split("\\")[1];
		}
	}*/
	
	smb_info = api_get_smb_privileges('u',type,username);	//in quota.js
	show_smb_list(smb_info);
	api_display_groups();
	
	if(type=="local")
	{
		$("#edit_user_tb").show();
		$("#edit_ads_user_tb").hide();
		
		var last_name = AllUserList[_SEL_USER_INDEX].last_name;
		var first_name = AllUserList[_SEL_USER_INDEX].first_name;
		var mail = AllUserList[_SEL_USER_INDEX].email;
		var hint = AllUserList[_SEL_USER_INDEX].hint;
		var pwd = AllUserList[_SEL_USER_INDEX].pwd;
		var expires = AllUserList[_SEL_USER_INDEX].expires;
		var gid = AllUserList[_SEL_USER_INDEX].gid;
		var uid = AllUserList[_SEL_USER_INDEX].uid;

		$("#edit_user_tb input[name='users_editUserName_text']").val(username);
		$("#edit_user_tb input[name='users_editFirstName_text']").val(first_name);
		$("#edit_user_tb input[name='users_editLastName_text']").val(last_name);
		$("#edit_user_tb input[name='users_editMail_text']").val(mail);
		_USER_MODIFY_INFO.name = username;
		_USER_MODIFY_INFO.lastname = last_name;
		_USER_MODIFY_INFO.firstname = first_name;
		_USER_MODIFY_INFO.mail = mail;
		_USER_MODIFY_INFO.hint = hint;
		_USER_MODIFY_INFO.type = 'local';
			
		//$("#edit_pw_tb input[name='users_newPW_password']").val("");
		//$("#edit_pw_tb input[name='users_comfirmPW_password']").val("");
		
		if(pwd==0)
		{
			setSwitch('#users_editPW_switch',0);
			_PW_FLAG=0;
			$("#users_editPW_link").hide();
			$("#admin_pw_tr").hide();
		}
		else
		{
			if(gid==_ADMIN_GID || uid==_ADMIN_UID)
			{
				$("#admin_pw_tr").show();
			}
			else
			{
				$("#admin_pw_tr").hide();
			}
			setSwitch('#users_editPW_switch',1);
			_PW_FLAG=1;
			$("#users_editPW_link").show();
		}
		
		//account expires
		if(expires==-1)
		{
			_EXPIRES_ENABLE=0;
			setSwitch('#users_editUserExpires_switch',0);
			$("#users_editExpires_link").hide();
			$("#users_editDatepicker_text").val(_DateToday);
		}
		else
		{
			_EXPIRES_ENABLE=1;
			setSwitch('#users_editUserExpires_switch',1);
			$("#users_editExpires_link").show();
			var year="",mon="",day="";
			expires = expires *24*60*60*1000;
			
			var date = new Date(expires);
			var y = date.getFullYear();
			var m = date.getMonth() + 1;
			var d = date.getDate();			
			
			//console.log("%s-%s-%s",y,m,d)
			var dStr="";
			if (DATE_FORMAT == "YYYY-MM-DD")
			{
				dStr = y+"-"+m+"-"+d;				
			}
			else if (DATE_FORMAT == "MM-DD-YYYY")
			{
				dStr = m+"-"+d+"-"+y;
			}
			else if (DATE_FORMAT == "DD-MM-YYYY")
			{
				dStr = d+"-"+m+"-"+y;
			}
			
			$("#users_editDatepicker_text").val(dStr);
		}
		
		$("input:text").inputReset();
		$("input:password").inputReset();
		init_switch();

		$("#users_editPW_switch").unbind('click');
	    $("#users_editPW_switch").click(function(){
			var v = getSwitch('#users_editPW_switch');
			if( v==1)
			{
				//on
				init_modify_pw_dialog();
				$("#users_editPW_link").show();
			}
			else
			{
				//off
				modify_user('pw',0);
				$("#users_editPW_link").hide();
			}
		});
		
		$("#users_isAdmin_switch").unbind("click");
	    $("#users_isAdmin_switch").click(function(){
			var v = getSwitch('#users_isAdmin_switch');
			modify_user("admin",v);
		});
			
		$("#users_editUserExpires_switch").unbind('click');
	    $("#users_editUserExpires_switch").click(function(){
			var v = getSwitch('#users_editUserExpires_switch');
			if( v==1)
			{
				//on
				init_modify_expires_dialog();
				$("#users_editExpires_link").show();
			}
			else
			{
				//off
				modify_user('expires',0);
				$("#users_editExpires_link").hide();
			}
		});		
		
	}
	else
	{
		$("#edit_user_tb").hide();
		$("#edit_ads_user_tb").show();
		
		//ads
		_USER_MODIFY_INFO.name = username;
		_USER_MODIFY_INFO.type = type;
		
		$("#ads_name").html(show_name);
	}
	
	$("input:text").inputReset();
	$("input:password").inputReset();
	
}//end do_query_user_info(username)
var init_modify_group_dialog_flag=0;
function init_modify_group_dialog()
{
	var _TITLE = _T('_user','modify_group_title');
	$("#editDiag_title").html(_TITLE);
	
	var username = get_current_item(".userMenuList");
	//Get_User_Info();
	//do_query_user_info(username,'local');
	
  	var modify_Obj=$("#editUserDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});		
	modify_Obj.load();
	_DIALOG = modify_Obj;
	
	$("#m_pwDiag").hide();
	$("#m_groupDiag").show();
	$("#m_quotaDiag").hide();
	language();	
	
	if(init_modify_group_dialog_flag==1) return;
	init_modify_group_dialog_flag=1;
	
	setTimeout("init_scroll('.scroll-pane-group2')",50);
}

var init_modify_pw_dialog_flag=0;
var _PW_FLAG="";
function init_modify_pw_dialog()
{
	$("input:password").inputReset();
	
	var _TITLE = _T('_user','modify_pw_title');
	$("#editDiag_title").html(_TITLE);

	$("#edit_pw_tb .TooltipIconError").removeClass('SaveButton');
	$("#edit_pw_tb .TooltipIconError").addClass('SaveButton');
		
  	var modify_Obj=$("#editUserDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
	 					onClose: function() {
							setSwitch('#users_editPW_switch',_PW_FLAG);
					
							if( _PW_FLAG==1)
							{
								$("#users_editPW_link").show();
							}
							else
							{
								$("#users_editPW_link").hide();
							}
						},
  		        		onBeforeLoad: function() {
  		        			if(AllUserList[_SEL_USER_INDEX].gid==_ADMIN_GID || AllUserList[_SEL_USER_INDEX].uid==_ADMIN_UID)
  		        			{
  		        				if(_PW_FLAG==1)
  		        				{
  		        					$("#admin_pw_tr").show();
            						setTimeout("$('#edit_pw_tb input[name=users_oldPW_password]').focus()",100);
            						ui_tab("#editUserDiag","#users_oldPW_password","#users_editPW_cancel_button");
            						grayout_input(0);
	            				}
	            				else
	            				{
            						$("#admin_pw_tr").hide();
            						setTimeout("$('#edit_pw_tb input[name=users_editPW_password]').focus()",100);
            						ui_tab("#editUserDiag","#users_editPW_password","#users_editPW_cancel_button");
            						grayout_input(1);
	            				}
            				}
            				else
            				{
            					$("#admin_pw_tr").hide();
            					setTimeout("$('#edit_pw_tb input[name=users_editPW_password]').focus()",100);
            					ui_tab("#editUserDiag","#users_editPW_password","#users_editPW_cancel_button");
            					grayout_input(1);
            				}
            				
            			}});
	modify_Obj.load();
	_DIALOG = modify_Obj;

	$("#m_pwDiag").show();
	$("#m_quotaDiag").hide();
	$("#m_groupDiag").hide();
	
	$('#m_pwDiag input[name=users_editPW_password]').val("");
	$('#m_pwDiag input[name=users_editComfirmPW_password]').val("");
	$('#m_pwDiag input[name=users_oldPW_password]').val("");
	
	if(init_modify_pw_dialog_flag==1) return;
	init_modify_pw_dialog_flag=1;

	$("#users_editPW_cancel_button").click(function() {
		setSwitch('#users_editPW_switch',_PW_FLAG);

		if( _PW_FLAG==1)
		{
			$("#users_editPW_link").show();
		}
		else
		{
			$("#users_editPW_link").hide();
		}
	});
		
	
}
function init_modify_expires_dialog()
{
	$("#expiresDiag").show();
	$("#editExpiresDiag_title").html(_T('_user','account_expires'));
	
  	var modify_Obj=$("#editExpiresDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
  					onClose: function() {
						setSwitch('#users_editUserExpires_switch',_EXPIRES_ENABLE);
						if(_EXPIRES_ENABLE==1)
							$("#users_editExpires_link").show();
						else
							$("#users_editExpires_link").hide();
					}
					});		
	modify_Obj.load();
	_DIALOG = modify_Obj;
}
var init_modify_quota_dialog_flag=0;
function init_modify_quota_dialog(type)//type:local or ad
{
	$("input:text").inputReset();
	
	var _TITLE = _T('_user','modify_quota_title');
	$("#editDiag_title").html(_TITLE);
	
	var username = get_current_item(".userMenuList");
	//Get_User_Info();
	//do_query_user_info(username,type);
	api_get_user_quota_info(username,type,function(){
	  	var modify_Obj=$("#editUserDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});		
		modify_Obj.load();
		_DIALOG = modify_Obj;
		
		$("#m_pwDiag").hide();
		$("#m_quotaDiag").show();
		$("#m_groupDiag").hide();
		
		$('#edit_quota_tb input[name=users_v1Size_text]').focus();
		
		if(init_modify_quota_dialog_flag==1) return;
		init_modify_quota_dialog_flag=1;
		
		language();
	});
	
}
function init_share_array()
{
	share_read_list = new Array();
	share_write_list = new Array();
	share_decline_list = new Array();
	_USER_SHARE_FOLDER = new Array();
}

function m_write_group_tab()
{
	var list_div = "#m_group_div";
	$(list_div).empty();
	
	if(_ALL_GROUP=="")
	{
		$("#m_group_div").html(_T('_user','none_group'));	//None group.
		return;
	}

	var ul_obj = document.createElement("ul"); 
	$(ul_obj).addClass('uListDiv');
	
	var group=_ALL_GROUP.split("#");
	for(var i in group)
	{
		var li_obj = document.createElement("li"); 
		var chkbox="<input type='Checkbox' name='users_modGroup_chkbox' id='users_modGroup" + i + "_chkbox' value='" + group[i] + "'>"
		
		$(li_obj).append('<div class="chkbox">' + chkbox + '</div>');
		$(li_obj).append('<div class="username">' + group[i] + '</div>');
		$(ul_obj).append($(li_obj));
	}
	$(list_div).append($(ul_obj));

	$( list_div+ " input[name='users_modGroup_chkbox']").click(function() {
		
		if($(this).prop('checked'))
		{
			$(this).parent().parent().parent().find('.username').css('color','#0067A6');
		}
		else
		{
			$(this).parent().parent().parent().find('.username').css('color','#898989');
		}
 	});
	
 	$("input:checkbox").checkboxStyle();
	init_scroll('.scroll-pane-group');
}
function Select_all_group(obj)
{
	if($(obj).prop("checked"))
	{
		$("input[name=users_joinGroup_chkbox]").each(function() {
		 $(this).prop("checked", true);
		});
	}
	else
	{
		$("input[name=users_joinGroup_chkbox]").each(function() {
		 $(this).attr("checked", false);
		});
	}	
}
function m_Select_all_group(obj)
{
	if($(obj).prop("checked"))
	{
		$("input[name='users_modGroup_chkbox']").each(function() {
		 $(this).prop("checked", true);
		});
	}
	else
	{
		$("input[name='users_modGroup_chkbox']").each(function() {
		 $(this).attr("checked", false);
		});
	}	
}
function show_smb_list(smb_info)
{
	var ul_obj = document.createElement("ul"); 
	$(ul_obj).addClass('ListDiv');

	var decline = _T('_network_access','decline');
	var read_only = _T('_network_access','read_only');
	var read_write = _T('_network_access','read_write');
	var public = _T('_network_access','public');
	var no_access = _T('_network_access','no_access');
	
	for(var i=0 ; i < smb_info.length; i++)
	{
		var li_obj = document.createElement("li"); 
		//if(smb_info[i].public=='1' && smb_info[i].username!=_ADMIN_NAME) $(li_obj).addClass('gray_out');
		if(smb_info[i].public=='1') $(li_obj).addClass('gray_out');
		$(li_obj).append('<div class="icon"></div>');
		$(li_obj).append('<div class="name">' + smb_info[i].sname + '</div>');
	
		var access_flag = smb_info[i].privileges;
		var imgdiv_obj = document.createElement("div");
		$(imgdiv_obj).addClass('img');
		switch(access_flag)
		{
			case 'n':
				$(imgdiv_obj).append('<a class="rwUp" onKeyPress="set_access2(this,\'rw\',1,event)" onclick="set_access(this,\'rw\',1)"></a><a class="rUp" onKeyPress="set_access2(this,\'r\',1,event)" onclick="set_access(this,\'r\',1)"></a><a class="dUp" onKeyPress="set_access2(this,\'d\',1,event)" onclick="set_access(this,\'d\',1)"></a>');
				$(li_obj).append($(imgdiv_obj));
				$(li_obj).append('<div class="access">'+ no_access + '</div>');				
				break;
			case 'd':
				$(imgdiv_obj).append('<a class="rwUp" onKeyPress="set_access2(this,\'rw\',1,event)" onclick="set_access(this,\'rw\',1)"></a><a class="rUp" onKeyPress="set_access2(this,\'r\',1,event)" onclick="set_access(this,\'r\',1)"></a><a class="dDown" onKeyPress="set_access2(this,\'d\',1,event)" onclick="set_access(this,\'d\',1)"></a>');
				$(li_obj).append($(imgdiv_obj));
				$(li_obj).append('<div class="access">'+ decline + '</div>');
				break;
			case 'r':
				$(imgdiv_obj).append('<a class="rwUp" onKeyPress="set_access2(this,\'rw\',1,event)" onclick="set_access(this,\'rw\',1)"></a><a class="rDown" onKeyPress="set_access2(this,\'r\',1,event)" onclick="set_access(this,\'r\',1)"></a><a class="dUp" onKeyPress="set_access2(this,\'d\',1,event)" onclick="set_access(this,\'d\',1)"></a>');
					
				$(li_obj).append($(imgdiv_obj));
				$(li_obj).append('<div class="access">'+ read_only + '</div>');
				break;
			case 'w':
				$(imgdiv_obj).append('<a class="rwDown" onKeyPress="set_access2(this,\'rw\',1,event)" onclick="set_access(this,\'rw\',1)"></a><a class="rUp" onKeyPress="set_access2(this,\'r\',1,event)" onclick="set_access(this,\'r\',1)"></a><a class="dUp" onKeyPress="set_access2(this,\'d\',1,event)" onclick="set_access(this,\'d\',1)"></a>');
				$(li_obj).append($(imgdiv_obj));
				$(li_obj).append('<div class="access">'+ read_write + '</div>');
	
				break;
		}
		
		$(ul_obj).append($(li_obj));
	}
	
	$("#user_sharelist").html($(ul_obj));
	
    $("#user_sharelist a").each(function(idx){
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

function set_access2(obj,flag,type,e)
{
	if (e.keyCode=='13')
		set_access(obj,flag,type);
}
function set_access(obj,flag,type)	//type  1:user 2:group
{
	if ($("#share_mask_id").hasClass('gray_out')) return;
	if ($(obj).parent().parent().hasClass('gray_out')) return;
	
	if(_LOCAL_LOGIN==0)
	{
		jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
		return;
	}
			
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	(type==1) ?list=".userMenuList" :list=".groupMenuList";
	
	var username="",permission="",cName="";
	var uType=0;  // uType: 0 (local), 1(AD), 2(LDAP)
	if(type==1) 
	{
		cName = ".uName";
	}
	else
	{
		cName = ".gName";
	}

    $( list +' li').each(function() {
		if($(this).hasClass('LightningSubMenuOn'))
		{
			uType = $(this).attr("src");
			if(uType=="ad")
				uType=1;
			else if(uType=="ldap")
				uType=2;
			else
				uType=0;
				
			username = $(this).find(cName).html();
			if(type==2) //group
			{
				username = username.replace(/&nbsp;/g,'');
				if(username.indexOf("\\")==-1)
				{
					username = "@"+username;
				}
			}
			
			return false;
		}
    });
    
	$(obj).parent().find('a:eq(0)').removeClass();
	$(obj).parent().find('a:eq(1)').removeClass();
	$(obj).parent().find('a:eq(2)').removeClass();
			
	switch(flag)
	{
		case 'rw':
			$(obj).parent().find('a:eq(0)').addClass('rwDown');
			$(obj).parent().find('a:eq(1)').addClass('rUp');
			$(obj).parent().find('a:eq(2)').addClass('dUp');
			$(obj).parent().next().html(_T('_network_access','read_write'));
			flag=2;
			permission="RW";
			break;
		case 'r':
			$(obj).parent().find('a:eq(0)').addClass('rwUp');
			$(obj).parent().find('a:eq(1)').addClass('rDown');
			$(obj).parent().find('a:eq(2)').addClass('dUp');
			$(obj).parent().next().html(_T('_network_access','read_only'));
			flag=1;
			permission="RO";
			break;
		case 'd':
			$(obj).parent().find('a:eq(0)').addClass('rwUp');
			$(obj).parent().find('a:eq(1)').addClass('rUp');
			$(obj).parent().find('a:eq(2)').addClass('dDown');
			$(obj).parent().next().html(_T('_network_access','decline'));
			flag=3;
			permission="DENY";
			break;
	}
	
	var sharename=$(obj).parent().prev().text();
	//console.log("access=[%d], username=[%s], sharename[%s]",flag,username,sharename)
	if(username.indexOf("\\")!=-1)
	{
		//username = username.replace(/\\/g,'+');
		if(type==2)
			username = "@" + username;
			//username = "+" + username;
	}
	
	if(uType==1 || uType==2 || type==2)
	{
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/share.cgi",
			data:{cmd:"cgi_set_share_access",access:flag,sharename:sharename,username:username,uType:uType},
		dataType: "xml",
		success:function(xml)
		{
			Get_SMB_Info();
		  	jLoadingClose();
		}
	});
}
	else
	{
		//local account
		_REST_Set_User_Permission(sharename,username,permission);
	}
}
var _adminFlag=0;
function modify_user(mtype,val,obj)
{
	var mflag;
	var username=_USER_MODIFY_INFO.name;
	var first_name = _USER_MODIFY_INFO.firstname;
	var last_name =	_USER_MODIFY_INFO.lastname;
	var pw = "";
	var pw_hit =_USER_MODIFY_INFO.hint;
	var mail=_USER_MODIFY_INFO.mail;
	var oldMail=_USER_MODIFY_INFO.mail;
	var group="";
	var available = new Array("","","","");
	var resend_mail=0;
	var oldName = _USER_MODIFY_INFO.name;
	var expires_time = "";
	var admin ="";
	
	for (var i=0 ;i < _HDD_NUM ;i++)
	{
		var idx = i+1;
		var qsize = $("#edit_quota_tb input[name='users_v" + idx + "Size_text']").val();
		available[i] = qsize;
		
		var unit_x = $("#edit_quota_tb").find("#quota_unit_" + idx).attr("rel");
		var unit = get_unit(unit_x);
		available[i] = available[i]*unit;
	}
	var available1 = available[0];
	var available2 = available[1];
	var available3 = available[2];
	var available4 = available[3];

	switch(mtype)
	{
		case 'first_name':
			mflag=1;
			first_name = $("#edit_user_tb input[name='users_editFirstName_text']").val();
			//check first name
			if(check_first_value(first_name,2)==-1)
			{
				$("#popup_ok_button").click( function (){
					$("#popup_ok_button").unbind("click");
					$("#edit_user_tb input[name='users_editFirstName_text']").focus();
				});
				return;
			}
			
			_USER_MODIFY_INFO.firstname = first_name;
			hide_button("users_editFirstNameSave_button");
			//$("input").hidden_inputReset();
			break;
		case 'mail':
			if(_LOCAL_LOGIN==0)
			{
				jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
				return;
			}
			
			var orgEmail = AllUserList[_SEL_USER_INDEX].email;
			mail=$("#edit_user_tb input[name='users_editMail_text']").val();
				
			mflag=2;
			var device_user_info = _REST_Get_Device_User_info(username);
			var uid=$(device_user_info).find('device_user_id').text();
			
			if(mail.length==0 && orgEmail.length!=0)
			{
				//remove email address
				jLoading(_T('_common','set'), 'loading' ,'s',''); //msg,title,size,callback
				_REST_Change_Mail(1,username,device_user_info,mail,function(res){
					jLoadingClose();
					if(res==-1) 
					{
						AllUserList[_SEL_USER_INDEX].email=orgEmail;
						$("#edit_user_tb input[name='users_editMail_text']").val(orgEmail);
					}
					else
					{
						hide_button("users_editMailSave_button");
						AllUserList[_SEL_USER_INDEX].email="";
					}
				});
			}
			else if(checkmail(mail))
			{
				jAlert(_T('_user','msg49'), _T('_common','error'));
				$("#popup_ok_button").click( function (){
					$("#popup_ok_button").unbind("click");
					$("#edit_user_tb input[name='users_editMail_text']").focus();
				});
				
				return;
			}
			else
			{
			hide_button("users_editMailSave_button");
			if(uid.length==0)
			{
				jLoading(_T('_common','set'), 'loading' ,'s',''); //msg,title,size,callback
				_REST_Create_User(username,mail,"true",function(res){
					jLoadingClose();
						if(res==-1)
						{
							return;
						}
				});
			}
			else
			{
				jLoading(_T('_common','set'), 'loading' ,'s',''); //msg,title,size,callback
					_REST_Change_Mail(2,username,device_user_info,mail,function(res){
				if(res==-1) 
				{
					jLoadingClose();
						  	get_account_xml('noLoading',function(){});
					return;
				}
				});
			}

				AllUserList[_SEL_USER_INDEX].email=mail;
			}

			break;
		case 'pw':
			mflag=3;
			var pw_off="";
			if(getSwitch('#users_editPW_switch'))
			{
				pw = $("#users_editPW_password").val();
				var _pw2 = $("#users_editComfirmPW_password").val();
				
				var chk_flag = chk_pw("#edit_pw_tb",pw,_pw2);
				if(chk_flag==-1)
				{
					$("#users_editPW_password").focus();
					return;
				}
				else if(chk_flag==-2)
				{
					$("#users_editComfirmPW_password").focus();
					return;
				}
				
				
				_PW_FLAG=1;
			}
			
			if(val==0)
			{
				pw="",pw_hit="";
				_PW_FLAG=0;
				pw_off="off";
			}
			var admin_old_pw ="";
			
			if(AllUserList[_SEL_USER_INDEX].uid==_ADMIN_UID || AllUserList[_SEL_USER_INDEX].gid==_ADMIN_GID)
			{
				pw_off = "on";
				if(val==0) 
				{
					pw_off="off";
				}
				else
				{
					admin_old_pw = Base64.encode( $("#edit_pw_tb input[name='users_oldPW_password']").val());
				}
			}
			
			pw = Base64.encode( pw );
			
			break;
		case 'group':
			mflag=4;
			var group_array = new Array();
			$("input[name='users_modGroup_chkbox']:checked").each(function() {
				
				group_array.push($(this).val())
	     	});
			group = group_array.toString()
			break;
		case 'quota':
			mflag=5;
			//check quota
			var hdd_num = parseInt(_HDD_NUM,10);
			var available_array = new Array($("#edit_quota_tb input[name='users_v1Size_text']"),$("#edit_quota_tb input[name='users_v2Size_text']"),
											$("#edit_quota_tb input[name='users_v3Size_text']"),$("#edit_quota_tb input[name='users_v4Size_text']"));
			var available_val = new Array("null","null","null","null");
			
			for(var i=0;i<hdd_num;i++)
			{	
				var val = available_array[i].val();
				if(val=="") val = 0;
				
				var idx=i+1;
				var unit_x = $("#edit_quota_tb").find("#quota_unit_" + idx).attr("rel");
				var unit = get_unit(unit_x)
				val = val * unit;
				if(chk_quota_value(val,_HDD_SIZE[i])!=0)
				{
					$("#popup_ok_button").click( function (){
						$("#popup_ok_button").unbind("click");
						available_array[i].focus()	
					});
					return -1;
				}
				
				available_val[i]=val;
			}
		
			if(Check_user_quota(available_val,"users_modGroup_chkbox",available_array)==-1)
				return;
			
			if(_USER_MODIFY_INFO.type=='ad')
			{
				username = $("#ads_name").text().split("\\")[0];
			}
			
			break;
		case 'last_name':
			mflag=6;
			last_name = $("#edit_user_tb input[name='users_editLastName_text']").val();
			//check last name
			if(check_last_value(last_name,2)==-1)
			{
				$("#popup_ok_button").click( function (){
					$("#popup_ok_button").unbind("click");
					$("#edit_user_tb input[name='users_editLastName_text']").focus();
				});
				
				return;
			}
			_USER_MODIFY_INFO.lastname = last_name;
			hide_button("users_editLastNameSave_button");
			//$("input").hidden_inputReset();
			break;
		case 'name':
			if(_LOCAL_LOGIN==0)
			{
				jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
				return;
			}
			
			var create_status = api_do_query_create_status2("iUser");
			if(create_status==-1)
			{
				jAlert(_T('_user','msg45'), 'warning2');
				return;
			}
				
			mflag=7;
			username = $("#edit_user_tb input[name='users_editUserName_text']").val();
			//Get_User_Info();
			
			_adminFlag=0;
			var tmpFlag=0;
			if ($(".userMenuList .LightningSubMenuOn div:eq(0)").hasClass("adminicon"))
			{
				_adminFlag=1;
				tmpFlag=1;
			}
			var v = check_account_value(username);
			
			if(v!=0)
			{
				switch(v)
				{
					case -1:
					case -4:
					case -7:
						jAlert(_T('_user','msg47'), _T('_common','error'));
						break;
					case -2:
						jAlert(_T('_user','msg7').replace(/%s/g,username), _T('_common','error'));
						break;
					case -3:
						jAlert(_T('_user','msg12'), _T('_common','error'));
						break;
					case -5:
						jAlert(_T('_user','msg25'), _T('_common','error'));
						break;
					case -6:
						jAlert(_T('_user','msg11'), _T('_common','error'));
						break;
				}

				$("#edit_user_tb input[name='users_editUserName_text']").focus();			
				return;
			}
			
			if(tmpFlag==1)
			{
				stop_web_timeout();
				
				$.cookie('username', username , { expires: 365 ,path: '/'});
				$("#login_name").text(username);
				//set session
				wd_ajax({
					type: "post",
					cache: false,
					url: "/web/php/modUserName.php",
					data:{username:username,oldName:oldName},
					dataType: "html",
					success:function()
					{
						restart_web_timeout();
					},
				    error: function (request, status, error) {

				    }
				});
			}
			AllUserList[_SEL_USER_INDEX].username = username;
			_USER_MODIFY_INFO.name = username;
			$(".LightningSubMenuOn .uName").html(username);
			//$(".LightningSubMenuOn .adminicon").html(username);
			hide_button("users_editNameSave_button");
			break;
		case 'expires':
			mflag=8;
			
			if(val==1)
			{
				var expires_time = $("#expiresDiag input[name='users_editDatepicker_text']").val();
				if(expires_time.length==0)
				{
					$("#expiresDiag input[name='users_editDatepicker_text']").focus();
					return;
				}
				
				expires_time = expires_time.replace(/-/g,'/');

				var date = new Date(expires_time);
				var y = date.getFullYear();
				var m = date.getMonth() + 1;
				var d = date.getDate();
				
				expires_time = y + "-" + m + "-" + d;
			}
			
			_EXPIRES_ENABLE = val;
			break;
		case 'admin':
			mflag=9;
			admin = val;
			group="";
			if(val==1)
			{
				group = "administrators";
			}
			break;
	}

	if(mtype=="name")
	{
		var is_admin="false";
		if(AllUserList[_SEL_USER_INDEX].gid==_ADMIN_GID || AllUserList[_SEL_USER_INDEX].uid==_ADMIN_UID)
		{
			is_admin="true";
			_LOCAL_ADMIN_NAME = username;
		}

		_REST_Mod_User(oldName,username,is_admin,function(){
			get_smb_xml(function(){
				Get_SMB_Info();
			});
		});
		return;
	}
	else if(mtype=="admin")
	{
		var is_admin="false";
		if(val==1){is_admin="true"};
		_REST_Mod_User(username,username,is_admin,function(){
			
			//reload user info
			get_account_xml("noLoading",function(){
				get_user_list(username);
			});
			
		});
		return;
	}
		
	//console.log("mflag[%s]  username[%s]  full_name[%s]  pw[%s]  pw_hit[%s]  mail[%s]\n",mflag,username,full_name,pw,pw_hit,mail)
	
	if(mtype!="mail")
	{
		jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	}
	
	/* Remove, cancel auto login method		
	if(mtype=="pw")
	{
		// if no password ,hide logout link
		if (_LOCAL_ADMIN_NAME == username && _LOCAL_ADMIN_NAME == "admin")
		{
			if(pw_off == "off")
			{
				$("#home_logout_li").hide();
			}
			else
			{
				$("#home_logout_li").show();
			}
		}
		else if (_LOCAL_ADMIN_NAME == username)
		{		
				$("#home_logout_li").show();
		
		}
	}
	*/
	
	if(mtype=="mail") return;
	
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		dataType: "xml",
		data:{cmd:"cgi_modify_account",mtype:mflag,username:username,
					first_name:first_name,last_name:last_name,
					pw:pw,old_pw:admin_old_pw,mail:mail,group:group,
					available1:available1,available2:available2,
					available3:available3,available4:available4,
					pw_off:pw_off,oldMail:oldMail,oldName:oldName,type:_USER_MODIFY_INFO.type,
					expires_time:expires_time,admin:admin},
		success:function(xml)
		{
			var status = $(xml).find("status").text();
			if(mtype=="group" || mtype=="quota")
			{
				do_query_user_info(username,_USER_MODIFY_INFO.type);
				_DIALOG.close();
			}
			else if(mtype=="expires")
			{
				_DIALOG.close();
			}
			else if(mtype=="pw" && val==1)
			{
				if(AllUserList[_SEL_USER_INDEX].gid==_ADMIN_GID || AllUserList[_SEL_USER_INDEX].uid==_ADMIN_UID)
				{
					if(status=="0")
					{
						_DIALOG.close();
						$("#admin_pw_tr").hide();
					}
					else
					{
						$(".tip_pw_error").hide();
						$(".tip_pw2_error").hide();
						show_error_tip(".tip_admin_pw_error",_T('_pwd','msg1'));
						$("#edit_pw_tb input[name='users_oldPW_password']").focus();
					}
				}
				else
				{
					_DIALOG.close();
				}
			}
//			else if(mtype=="mail")
//			{
//				if(status!="0" && status.length!=0)
//				{
//					var msg = _T('_user','msg40') + "<br><br>"
//					jAlert( msg , _T('_common','error'));
//				}
//			}
			
		  	jLoadingClose();
		  	get_account_xml("noLoading",function(){
		  		get_user_list(username);//reload user info	
		  	});
		  	
		}
	});
}
function Delete_User()
{
	if(_LOCAL_LOGIN==0)
	{
		jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
		return;
	}
	
	var username="";
    $('.LightningSubMenu li').each(function() {
		if($(this).hasClass('LightningSubMenuOn'))
		{
			username = $(this).find(".uName").html();
			return false;
		}
    });
    
    if(username=="")
	{
		jAlert( _T('_user','msg2'), _T('_common','error'));
		return;
	}

	jConfirm('M',_T('_user','msg35'),_T('_user','del_user_title'),"user",function(r){
		if(r)
		{
	    	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	   		
	   		//todo: call rest api to delete user
	   		//var device_user_info = _REST_Get_Device_User_info(username);
	   		//var res = _REST_User_Delete(username,device_user_info);
			wd_ajax({
				type: "POST",
				cache: false,
				//url: "/api/" + REST_VERSION + "/rest/users/" + username,
				url: "/web/restAPI/restAPI_action.php?action=users",
				dataType: "xml",
				data: {
					send_type: "DELETE",
					username: username
				},
				success:function(xml)
				{
					api_cp2flash();
			
			   		Get_User_Info();
			   		
			   		_SEL_USER_INDEX = 0;
			   		
			   		get_account_xml("Loading",function(){
						currentIndex=1;
						Get_SMB_Info();
			   			get_user_list(AllUserList[0].username);
			   			if(AllUserList[0].gid==_ADMIN_GID || AllUserList[0].uid==_ADMIN_UID || AllUserList[0].type!="local")
			   			{
							$("#users_removeUser_link").removeClass('gray_out').addClass('gray_out');
			   			}
			   			else
			   			{
			   				$("#users_removeUser_link").removeClass('gray_out');
			   			}
			   			
				   		jLoadingClose();
						//$(".ButtonArrowTop").removeClass('gray_out').addClass('gray_out');
						//$(".ButtonArrowBottom").removeClass('gray_out');
						scrollDivTop_User('SubMenuDiv');
			   		});
				},
			    error: function (request, status, error) {
					var $xml = $(request.responseText);
					var err = $xml.find('error_message').text();
					//jAlert( err, _T('_common','error'));
					jLoadingClose();
					jAlert( _T('_cloud','msg1'), _T('_common','error'));
			    }
			});
		}
    });
}

function u_Write_Quota_Table(v_name,q_size,max_quota_size,tb_obj)
{	
	$(tb_obj).empty();
	
	if(parseInt(_HDD_NUM,10)==0)
	{
		var str = _T('_user','no_hdd');//None Hard Drives.
		$(tb_obj).append(str);
		return;
	}
	
	var ul_obj = document.createElement("ul"); 
	$(ul_obj).addClass('qListDiv');
	var s = "&nbsp;"+_T('_quota','quota_amount');
	var MB = " MB" ;
	for(var i=0;i< parseInt(_HDD_NUM,10);i++)
	{
		var num=i+1;
		var li_obj = document.createElement("li"); 
		$(li_obj).append('<div class="vinfo">' + v_name[i] +s + '</div>');
		
		var tb='<table border="1" cellspacing="0" cellpadding="0">'
			tb+='<tr>'
			tb+='<td>' + '<div class="v' + num + '_unit select_menu"></div>' + '</td>';
			tb+='</tr></table>'
			
		var text_obj='<input type="text" class="input_x2" name="u_f_available' +num + '" id="u_f_available' + num + '" value="'+ q_size[i] + '">';
		$(li_obj).append('<div class="quota">' + text_obj + '</div>');
		//$(li_obj).append('<div class="unit select_menu v' + num + '_unit">' + '</div>');
		$(li_obj).append('<div class="unit">'+tb + '</div>');
		$(ul_obj).append($(li_obj));
	}
			
	$(tb_obj).append($(ul_obj));	
	
	for(var i=0;i< parseInt(_HDD_NUM,10);i++)
	{
		var num=i+1;
		var unit_obj = ".v" + num + "_unit";
		show_quota_unit(unit_obj,max_quota_size[i],num)
	}
}

function get_unit(unit_x)
{
	var unit=1;
	switch(unit_x)
	{
		case 'GB':
			unit=1024;
			break;
		case 'MB':
			unit=1;
			break;
		case 'TB':
			unit=1024*1024;
			break;
		default:
			unit=1;
			break;
	}
	
	return unit;
}
function init_item_click()
{
	$('.userMenuList li').unbind('click');
    $('.userMenuList li').click(function() {
	    $('.LightningSubMenu li').each(function() {
			$(this).removeClass('LightningSubMenuOn');
	    });
	    
	    $(this).addClass('LightningSubMenuOn');
	    
	    var i = $(this).children().attr('rel');
	    var type = $(this).attr('src');
	    
	    if(type=="local")
	    {
			if(AllUserList[i].gid==_ADMIN_GID || AllUserList[i].uid==_ADMIN_UID)
			{
				$("#group_tr").hide();
				$("#quota_tr").hide();
				
				if(AllUserList[i].uid==_ADMIN_UID)
				{
					$("#users_removeUser_link").addClass("gray_out");
					$("#users_admin_tr").hide();
				}	
				else
				{
					$("#users_admin_tr").show();
					if(AllUserList[i].username==getCookie("username"))
						$("#users_removeUser_link").addClass("gray_out");
					else
						$("#users_removeUser_link").removeClass("gray_out");
				}
			}
			else
			{					
				m_write_group_tab();
				if(GROUP_FUNCTION==1)
				{
				$("#group_tr").show();
				}
				
				if(QUOTA_FUNCTION==1)
				{
				$("#quota_tr").show();
				}
				$("#users_removeUser_link").removeClass("gray_out");
				$("#users_admin_tr").show();
			}
			
			$("#edit_user_tb").show();
			$("#edit_ads_user_tb").hide();
		}
		else
		{
			//ad mode
			$("#edit_ads_user_tb").show();
			$("#edit_user_tb").hide();
			$("#users_removeUser_link").addClass("gray_out");
		}

		_SEL_USER_INDEX = i;
		do_query_user_info(AllUserList[i].username,type);		    
    });
	
	$('.LightningSubMenu li').unbind('keypress');
	$('.LightningSubMenu li').keypress(function(e) {
		if (e.keyCode=='13')
			$(this).click();
	});
}

function chkboxEvent(e,obj)
{
	if (e.keyCode=='13')
	{
		$(obj).find('input:Checkbox').click();
		
		if($(obj).find('input:Checkbox').prop('checked'))
		{
			$(obj).find('input:Checkbox').parent().parent().parent().find('.username').css("color","#0067A6");
		}
		else
		{
			$(obj).find('input:Checkbox').parent().parent().parent().find('.username').css("color","#898989");
		}
	}
}

function overwriteEvent(e)
{
	if (e.keyCode=='13') $("#b_overwrite").click();
}
function grayout_input(e)
{
	if(e==1)
	{
		var old_pw = $('#m_pwDiag input[name=users_oldPW_password]').val();

		if(AllUserList[_SEL_USER_INDEX].gid==_ADMIN_GID || AllUserList[_SEL_USER_INDEX].uid==_ADMIN_UID)
		{
			if(old_pw.length==0 && _PW_FLAG==1)
		{
			$('#m_pwDiag input[name=users_editPW_password]').addClass("gray_out");
			$('#m_pwDiag input[name=users_editComfirmPW_password]').addClass("gray_out");
			$('#m_pwDiag input[name=users_editPW_password]').prop("readonly",true);
			$('#m_pwDiag input[name=users_editComfirmPW_password]').prop("readonly",true);			
		}
		else
		{
			$('#m_pwDiag input[name=users_editPW_password]').removeClass("gray_out");
			$('#m_pwDiag input[name=users_editComfirmPW_password]').removeClass("gray_out");
			$('#m_pwDiag input[name=users_editPW_password]').prop("readonly",false);
			$('#m_pwDiag input[name=users_editComfirmPW_password]').prop("readonly",false);
		}
	}
	else
	{
			$('#m_pwDiag input[name=users_editPW_password]').removeClass("gray_out");
			$('#m_pwDiag input[name=users_editComfirmPW_password]').removeClass("gray_out");
			$('#m_pwDiag input[name=users_editPW_password]').prop("readonly",false);
			$('#m_pwDiag input[name=users_editComfirmPW_password]').prop("readonly",false);
		}
	}
	else
	{
		$('#m_pwDiag input[name=users_editPW_password]').addClass("gray_out");
		$('#m_pwDiag input[name=users_editComfirmPW_password]').addClass("gray_out");
		$('#m_pwDiag input[name=users_editPW_password]').prop("readonly",true);
		$('#m_pwDiag input[name=users_editComfirmPW_password]').prop("readonly",true);
	}
}

var _SMBInfo = new Array();
function Get_SMB_Info(callback)
{
	_SMBInfo = new Array();
	var idx=0;
	wd_ajax({
		type: "POST",
		url: "/xml/smb.xml",
		dataType: "xml",	
		cache:false,
		success: function(xml){			
			$(xml).find('samba > item').each(function(index){
				var s_name = $(this).find('name').text();
				var read_list = $(this).find('read_list').text();
				var write_list = $(this).find('write_list').text();
				var invalid_users = $(this).find('invalid_users').text();
				var path = $(this).find('path').text();
				var publicFlag = parseInt($(this).find('web_public').text(),10);
				
				if(api_filter_share(path)==1)
				{
					return true;
				}
				_SMBInfo[idx] = new Array();
				_SMBInfo[idx].sname = s_name;
				_SMBInfo[idx].public = publicFlag;
				
				if(publicFlag==0)
				{
					_SMBInfo[idx].read_list = read_list;
					_SMBInfo[idx].write_list = write_list;
					_SMBInfo[idx].invalid_users = invalid_users;
				}
				else
				{
					_SMBInfo[idx].read_list = "";
					_SMBInfo[idx].write_list = "";
					_SMBInfo[idx].invalid_users = "";
				}
				
				idx++;
			 });
			 if(callback)callback();
		},
		error:function(xmlHttpRequest,error){   
		} 
	});	
}

function api_get_user_quota_info(username,type,callback)
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data: { cmd:"cgi_get_modify_user_info" ,name:username},
		dataType: "xml",
		success: function(xml){
			
			var q_size_array = new Array("","","","");	
			var max_quota = new Array();
			$(xml).find('quota_info').each(function(index){
				q_size_array[index] = $(this).find('quota').text();
				max_quota.push($(this).find('max_quota').text());
			});
				
			if(type=="local")
			{
				//user_of_group = $(xml).find('group').text();
				HDD_NUM = $(xml).find('hddnum').text();
				HDD_SIZE = $(xml).find('hddsize').text();
				MAIN_GROUPNAME = $(xml).find('main_group').text();
	
				fill_info('u',username,q_size_array,max_quota,'#edit_quota_tb');			
				
			}
			else
			{
				//ads
				HDD_NUM = $(xml).find('hddnum').text();
				HDD_SIZE = $(xml).find('hddsize').text();
				fill_info('u',username,q_size_array,max_quota,'#edit_quota_tb');
			}
			
			jLoadingClose();
			
			if(callback) {callback();}
		},
		 error:function(xmlHttpRequest,error){   
        		//alert("do_query_user_info->Error: " +error);   
  		 }
	});
}

function api_display_groups()
{
	var user_of_group = AllUserList[_SEL_USER_INDEX].groups;
	
	$("#m_group_div .username").css('color','#898989');
	
	//show user's gorup to webpage
	if(user_of_group!="")
	{
		user_of_group=user_of_group.split("#");
		
		for(i=0;i<user_of_group.length;i++)
		{
			$("input[name='users_modGroup_chkbox']").each(function() {
				
				if ($(this).val()==user_of_group[i])
				{
					$(this).attr("checked", true);
					$(this).parent().parent().parent().find('.username').css('color','#0067A6');
				}
	     	});
	    }
	}
	
	$("#show_group_div").html( user_of_group.length + "&nbsp;"+ _T('_user','group') +"&nbsp;&nbsp;");	
}
function open_expires_date(obj)
{		
	 $.datepicker._showDatepicker($(obj)[0]);
}

function display_expires(v)
{
	if( v==1)
	{
		//on
		$('#expires_tr').show();
	}
	else
	{
		//off
		$('#expires_tr').hide();
	}
}
var _DateToday="";
function init_datepicker()
{
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/system_mgr.cgi",
		data: "cmd=cgi_get_time",	
		cache:false,
		async:true,
		dataType: "xml",	
		success: function(xml){			
			$(xml).find('time').each(function(){			
				var year = $(this).find('year').text();
				var mon = $(this).find('mon').text();
				var day = $(this).find('day').text();
				DATE_FORMAT = $(this).find('date_format').text();
				
				$(".datepicker_img").mouseover(function() {
					$(this).attr("src","/web/images/icon/Icon_Calendar_blue_32x32.png");
				});
			
				$(".datepicker_img").mouseout(function() {
					$(this).attr("src","/web/images/icon/Icon_Calendar_DrkGray_32x32.png");
				});
				
				var datepicker_date_format = "yy-mm-dd";				
				if (DATE_FORMAT == "YYYY-MM-DD")
				{						
					datepicker_date_format = "yy-mm-dd";
				}			
				else if (DATE_FORMAT == "MM-DD-YYYY")
				{										
					datepicker_date_format = "mm-dd-yy";	
				}			
				else if (DATE_FORMAT == "DD-MM-YYYY")
				{						
					datepicker_date_format = "dd-mm-yy";					
				}
				
				var dateToday = new Date(year+"/"+mon+"/"+day);
				
				$('#users_addDatapicker_text , #users_editDatepicker_text').datepicker({
					changeMonth: false,
					changeYear: false,
					gotoCurrent: false,
					dateFormat:datepicker_date_format,
					minDate: dateToday
				});
				
				var dStr="";
				if (DATE_FORMAT == "YYYY-MM-DD")
				{
					dStr = year+"-"+mon+"-"+day;
				}
				if (DATE_FORMAT == "MM-DD-YYYY")
				{
					dStr = mon+"-"+day+"-"+year;
				}
				else if (DATE_FORMAT == "DD-MM-YYYY")
				{
					dStr = day+"-"+mon+"-"+year;
				}
				_DateToday = dStr;
				$("#users_addDatapicker_text").val(dStr);
			 });
			},
		 error:function(xmlHttpRequest,error){   
        		//alert("Error: " +error);   
  		 }
	});
}
function api_get_number(nameArray,name)
{
	var newArray = new Array();
	for(i in nameArray)
	{
		newArray[i]=new Array();
		newArray[i].c = nameArray[i];
		newArray[i].nflag = "";
	}
	
	var num = new Array();
	for(i in newArray)
	{
		if(isNaN(newArray[i].c))
			newArray[i].nflag = 0;
		else
			newArray[i].nflag = 1;
		
		num.push(newArray[i].nflag);
	}
	
	var num2 = num.reverse();
	var count=0;
	for(i in num2)
	{
		if(num2[i]==1)
			count++;
		else
			break;
	}
	
	var last_num=name.slice(name.length - count);
	
	return last_num;
}
function api_get_correct_name(name)
{
	var currentName=name;
	var flag=2;
	var accountList = new Array();

	for(var i=0 in AllUserList)
	{
		if(AllUserList[i].type=="local")
	{
			var u = AllUserList[i].username;
			
			if(u.slice(0,name.length)==name)
			{
				flag++;
				accountList.push(u);
			}
		}
	}
	
	if(accountList.length!=0)
	{
		for(j=1;j<=flag;j++)
		{
			if(j==1)
				tmpName = name;
		else
				tmpName = name+j;
				
			currentName = tmpName;
			if($.inArray(tmpName,accountList)==-1)
		{
				currentName = tmpName;
				break;
			}
		}
	}
	return currentName;
	
}
function api_get_local_user_count(entry_page)
{
	var aTotal=-1; //not include "admin"
	if(entry_page=="users")
	{
	$('.userMenuList li').each(function() {
		if($(this).attr("src")=="local")
		{
			aTotal++;
		}
	});
	}
	else
	{
		wd_ajax({
			type: "POST",
			async: false,
			cache: false,
			url: "/xml/account.xml",
			dataType: "xml",
			success: function(xml){
				aTotal = $(xml).find('users > item').length;
			},
			error:function(xmlHttpRequest,error){
				//alert("Error: " +error);
			}
		});
	}
	return aTotal;
}
function api_filter_share(path)
{
	var filter = ["/mnt/isoMount/","/mnt/VV/"];
	
	for(i in filter)
	{
		if(path.slice(0,filter[i].length)==filter[i])
			return 1;
	}
	
	return 0;
}
function api_do_query_create_status2(ftype)
{
	var create_status ="";
	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data:"cmd=cgi_get_create_status&ftype=" + ftype,
		dataType: "xml",
		success: function(xml){
			create_status = $(xml).find('status').text();	//create_status:-1  still adding multiple users 
		}
		,
		 error:function(xmlHttpRequest,error){   
  		 }
	});
	
	return create_status;
}

function api_filter_user(user,cloudholderMember)
{
	if($.inArray(user, cloudholderMember )==-1)
	{
		return 1;	//not found
	}
	else
	{
		return 0;
	}
}
var _Filter_Default_Group =["cloudholders"];
function api_filter_default_group(gname)
{
	if($.inArray(gname, _Filter_Default_Group )==-1)
	{
		return 1;	//not found
	}
	else
	{
		return 0;
	}
}
