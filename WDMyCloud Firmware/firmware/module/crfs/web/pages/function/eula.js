//var _SELECT_ITEMS  = new Array("id_language_main");
var _AD_ADMIN_NAME="";
function run_wizard(type,noHDDFlag)	//type: eula,toolbar
{	
	$("#chgPWDiag .TooltipIconError").removeClass('SaveButton').addClass('SaveButton');
		
	$(".LightningUpdating").remove();
	$(".exposeMask").css('z-index',"9998");
		
	_RUN_WIZZRD_TYPE = type;

	if(	noHDDFlag==1)
	{
		//sata power on
		jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
		$.ajax({
			type: "POST",
			cache: false,
			dataType:"xml",
			url: "/web/php/noHDD.php",
			data: {cmd:'setSataPower',enable:"enable"},
			success:function(xml){
				
				noHDD_timeoutId = setInterval(function(){
					chk_hdd_status(function(cntDisk,res,eula){
						if(res==0 && cntDisk!=0)
						{
							clearInterval(noHDD_timeoutId);
							noHDDDiagObj.close();
							jLoadingClose();
							_eula();
						}
						else if(res==0 && cntDisk==0)
						{
							clearInterval(noHDD_timeoutId);
							sata_power_off();
							jLoadingClose();
						}
					});	
				}, 4000);
			}
		});
	}
	else
	{
		_eula();
	}
	
	function _eula()
	{
		$.ajax({
			type:"GET",
			async: false,
			cache:false,
			url:"/cgi-bin/login_mgr.cgi?cmd=cgi_get_language",
			dataType: "xml",
			success:function(xml){
				logd_eula = $(xml).find('eula').text();
			},
			error:function(xml){
  			}
		});	
		
	if(type=="eula" && logd_eula=="2")	//sky4715
	{
		//set_eula(type);
		open_wizard_dialog(type);
		return;
	}
	
	var chgAdmin = $("#chgAdminPWDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
					onClose: function() {

					}
			});

	ChgAdminObj = chgAdmin;
	
	if(type=="eula")
	{
		$("input:password").inputReset();
		chgAdmin.load();
		adjust_dialog_size("#chgAdminPWDiag",980,580);
		$("#chgAdminPWDiag").center();
		
		$("#gettingstarted_chgPWSave_button").unbind('click');
		$("#gettingstarted_chgPWSave_button").click(function(){	
			var pw = $("#gettingstarted_newPW_password").val();
			var pw2 = $("#gettingstarted_comfirmPW_password").val();
			var chk_flag = eula_chk_pw(pw,pw2);
			if(chk_flag==-1)
			{
				$('#gettingstarted_newPW_password').focus();
				return;
			}
			else if(chk_flag==-2)
			{
				$('#gettingstarted_comfirmPW_password').focus();
				return;
			}
			
						chgAdmin.close();
						open_wizard_dialog(type);
		});
	}
	else
	{
		open_wizard_dialog(type);
	}
}
}
var WObj="";
function open_wizard_dialog(type)
{
	get_language();
	var dialogID="",_w="",_h="";
	if(_Regist_Info.eula!=2)
	{
	//show
	show_device_user(type);
		$("#w_step1").show();
		$("#w_step2").hide();
		$("#w_step3").hide();
		dialogID = "#wDiag";
		_w = 980;_h=580;
		$("#gettingstarted_back2_button").show();
	}
	else
	{
		$("#w_step1").hide();
		$("#w_step2").show();
		$("#w_step3").hide();
		dialogID = "#w3Diag";
		_w = 740;_h=485;
		
		$("#gettingstarted_back2_button").hide();
		$("#gettingstarted_cancel2_button").hide();
		$("#gettingstarted_next2_button").html(_T('_button','finish'));
	}
	
	
	init_wizard_tb_sch_info(type);
	getImprovement(type);
	var wobj=$(dialogID).overlay({fixed:false,oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
					onClose: function() {
					}
			});
	wobj.load();
	adjust_dialog_size(dialogID,_w,_h);
	$(dialogID).center();

	_DIALOG = wobj;
	
	if(_Regist_Info.eula==2) W3Obj = wobj;
	init_wizard_dialog(type);
	
	$("#gettingstarted_registerDev_chkbox").attr("checked",true).attr("disabled",false);
	$("#register_td").removeClass('gray_out_50');
	
	$("input:checkbox").checkboxStyle();
	$(":input[placeholder]").placeholder();
	
	//set url
	var remote_access = _REST_Get_Cloud_Info(); //ITR No.: 103197 

	if(remote_access=="false")
	{
		$("#gettingstarted_update_link").attr('href',D_UPDATE_URL);
		$("#gettingstarted_backup_link").attr('href',D_BACKUP_URL);
		$("#gettingstarted_mobile_link").attr('href',D_MOBILE_URL);
		
		$("#w3Diag_desc").hide();
	}
	else
	{
		$("#gettingstarted_update_link").attr('href',A_UPDATE_URL);
		$("#gettingstarted_backup_link").attr('href',A_BACKUP_URL);
		$("#gettingstarted_mobile_link").attr('href',A_MOBILE_URL);
		$("#w3Diag_desc").show();
	}
}
var W3Obj="";
var ChgAdminObj="";
function init_wizard_dialog(type)
{
	if(type=="eula")
	{
		$("#gettingstarted_back1_button").show();
	}
	else
	{
		$("#gettingstarted_back1_button").hide();
	}
	
	//$("#tip_autofw").attr('title',_T('getting_start','auto_tip'));
	//$("#tip_imp_info").attr('title',_T('getting_start','imp_tip'));
	$("#tip_autofw").attr('title',_T('_tip','autofw'));
	$("#tip_imp_info").attr('title',_T('_tip','improvement'));
	init_tooltip();
	init_switch();
			
	$("#gettingstarted_rFirstName_text").val("");
	$("#gettingstarted_rLastName_text").val("");
	$("#gettingstarted_rMail_text").val("");
							
	$("#gettingstarted_rFirstName_text").attr("placeholder",_T('getting_start','first_name')+"*");
	$("#gettingstarted_rLastName_text").attr("placeholder",_T('getting_start','last_name')+"*");
	$("#gettingstarted_rMail_text").attr("placeholder",_T('getting_start','email')+"*");
	$(":input[placeholder]").placeholder();
	$("#gettingstarted_register_status").empty();
	
	//_INIT_DIAG_FLAG_W=1;
	
	$("#wDiag_title").html(_T('_cloud','started'));
	$("#wDiag_title2").html(_T('_cloud','started'));
	
	$("input:text").inputReset();
	$("input:checkbox").checkboxStyle();

	$("#gettingstarted_cancel1_button").unbind("click");
	$("#gettingstarted_cancel1_button").click(function(){
			_DIALOG.close();
					});
	
	$("#gettingstarted_back1_button").unbind("click");
	$("#gettingstarted_back1_button").click(function(){
			_DIALOG.close();
		ChgAdminObj.load();
		$("#chgAdminPWDiag").center();
	});	
	
	$("#gettingstarted_next1_button").unbind("click");
	$("#gettingstarted_next1_button").click(function(){	
			//if($(this).hasClass('gray_out_50')) return;
			/*
			if(_Regist_Info.mail=="-" || _Regist_Info.mail=="")
			{
				$("#gettingstarted_registerDev_chkbox").attr("checked",false).attr("disabled",true);
				$("#register_td").addClass('gray_out_50');
			}
			else
			{
				$("#gettingstarted_registerDev_chkbox").attr("checked",false).attr("disabled",false); //ITR No.: 98968  Diskless process v1.00 (2).docx(Register box is UNCHECK)
				$("#register_td").removeClass('gray_out_50');
			}*/

			$("#w_step2").show();
			$("#w_step1 , #w_step3").hide();				
			
			_DIALOG.close();		
			W3Obj = $("#w3Diag").overlay({fixed:false,oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0,
							onClose: function() {
							}
					});
			W3Obj.load();
			$("#w3Diag").center();
			
			adjust_dialog_size("#w3Diag",740,485);
	});
	
	if(_Regist_Info.eula==2)
	{
		$("#gettingstarted_next2_button").unbind("click");
		$("#gettingstarted_next2_button").click(function(){	
			$("#gettingstarted_save_button").click();
		});	
	}
	else
	{
	$("#gettingstarted_next2_button").unbind("click");
	$("#gettingstarted_next2_button").click(function(){	
		
		var v = _REST_Registered_Device();
		if(v==0) //no need to register
		{
		$("#w_step3").show();
		$("#w_step2").hide();
			$("#gettingstarted_register_status").empty();
		}
	});
	}


	$("#gettingstarted_back2_button").unbind("click");
	$("#gettingstarted_back2_button").click(function(){
		$("#w_step2").hide();
		$("#w_step1").show();
		adjust_dialog_size("#wDiag",980,580);
		W3Obj.close();
		_DIALOG.load();
		$("#wDiag").center();
	});
			
	$("#gettingstarted_back3_button").unbind("click");
	$("#gettingstarted_back3_button").click(function(){	
			$("#w_step2").show();
			$("#w_step3").hide();
	});
		
	$("#gettingstarted_save_button").unbind("click");
	$("#gettingstarted_save_button").click(function(){		
		W3Obj.close();
		jLoading(_T('_common','set'), 'loading' ,'s',""); 
		auto_update_fw();
		
		var enable = $("#gettingstarted_imp_switch").val();
		setImprovement(enable);
		
		if(type=="eula")
		{
			set_eula(type);
			if(_Regist_Info.eula!=2)
			{
			eula_chg_pw();
		}
		}
		else
		{
			$("#w_step1").hide();
			$("#w_step2").hide();
			$("#w_step3").hide();
			W3Obj.close();
		}
		
		jLoadingClose();
	});
}

var _Regist_Info = {account_name:"",first_name:"",last_name:"",mail:"",lang:"",country:"",eula:0};
var _RegistMailFlag=0;
function show_device_user(entry)
{
	var eulaAllUserList = new Array();
	var userInfo = new Array();
	var userInfo_tmp = new Array();
	
	get_account_xml("noLoading",function(){
		_get_user_list(entry);
	});

	function _get_user_list(entry)
	{
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
						j++;
						return true;
					}
						
					//check user in cloudholders 
					if( api_filter_user(user_name,cloudholderMember) == 1 ) return true; //non-cloudholders users cannot show on GUI
										
					userInfo[aIndex] = new Array();		
					userInfo[aIndex].username = user_name;
					userInfo[aIndex].uid = uid;
					userInfo[aIndex].gid = gid;
					userInfo[aIndex].type = "local";
					userInfo[aIndex].first_name = first_name;
					userInfo[aIndex].last_name = last_name;
					userInfo[aIndex].email = email;
					userInfo[aIndex].pwd = pwd;
									
					aIndex++;
				});
				
				userInfo.sort(function(a, b){
				    var a1= a.username, b1= b.username;
				    if(!b1) b1=a1;
				    if(a1== b1) return 0;
				    return a1> b1? 1: -1;
				});
				
				userInfo_tmp = admin_array.concat(userInfo);
				
				//_get_ad();
				eulaAllUserList = userInfo_tmp;
				_display_user(entry);
			},
			error:function(xmlHttpRequest,error){
				//alert("Error: " +error);
			}
		});		
	}
	function _display_user(entry)
	{
		_RegistMailFlag=0;
		//display all user to page
		var uname = _T('_user','user_name') + "*";
		var fname = _T('getting_start','first_name');
		var lname = _T('getting_start','last_name');
		var smail = _T('getting_start','email');
		var save = _T('_button','save');
		var flag=0;
		var ul_obj = document.createElement("ul"); 
		$(ul_obj).addClass('devListDiv');
		for(var i=0 in eulaAllUserList)
		{
			var mail=eulaAllUserList[i].email;
			var first_name = eulaAllUserList[i].first_name;
			var last_name = eulaAllUserList[i].last_name;
			var full_name ="";
			var uid = eulaAllUserList[i].uid;
			var username = eulaAllUserList[i].username;
			if(eulaAllUserList[i].type=="ad")
			{
				full_name = eulaAllUserList[i].username;
			}
			
			if(first_name.length!=0 && last_name.length!=0)
			{
				full_name = first_name + " " +last_name;
			}
			else
			{
				full_name = username;
			}
			
			if(uid=="500")
			{
				if(first_name.length==0 && last_name.length==0)
				{
					first_name="admin";
					full_name = username;
				}
				
				_Regist_Info.account_name=username;
				_Regist_Info.mail=mail;
				//_Regist_Info.first_name=first_name;
				_Regist_Info.first_name=eulaAllUserList[i].first_name;
				var new_last_name=last_name;
				if(last_name==" ") new_last_name="";
				_Regist_Info.last_name=new_last_name;
				
				if(_RUN_WIZZRD_TYPE=="eula")
				{
					_Regist_Info.lang=$("#f_language").attr("rel");
				}
				else
				{
					get_language();
				}
			}
			
			var li_obj = document.createElement("li"); 
			//console.log("_Regist_Info.eula=[%s]",_Regist_Info.eula)
			//console.log("full_name=[%s]",full_name)
			//console.log("mail.length=[%d]",mail.length)
			//console.log("eulaAllUserList.length=[%d]",eulaAllUserList.length)
			
			if(full_name=="admin" && eulaAllUserList.length==1 && mail.length==0 && _Regist_Info.eula==0)
			{
				$(li_obj).append('<div class="accountName">' + '<input id="gettingstarted_userName_text" class="input_x4 gray_out_80" type="text" value="admin" name="gettingstarted_userName_text" readonly >' + '</div>');
				$(li_obj).append('<div class="firstName">' + '<input id="gettingstarted_firstName_text" class="personal_v input_x4" placeholder="' + fname + '" type="text" value="" name="gettingstarted_firstName_text" onkeyup="show(\'add_user_button\')">' + '</div>');
				$(li_obj).append('<div class="lastName">' + '<input id="gettingstarted_lastName_text" class="personal_v input_x4" placeholder="' + lname + '" type="text" value="' + last_name + '" name="gettingstarted_lastName_text" onkeyup="show(\'add_user_button\')">' + '</div>');
				$(li_obj).append('<div class="email">' + '<input id="gettingstarted_email_text" class="personal_v input_x4" type="text" placeholder="' + smail + '" value="' + ""+ '" name="gettingstarted_email_text" onkeyup="show(\'add_user_button\')">' + '</div>');
				$(li_obj).append('<div class="saveButton" id="add_user_button" style="display:none">' + '<button id="gettingstarted_addUserSave_button" onclick="gettting_start_add_user(1)">' + save + '</button>'+ '</div>');
				flag=1;
			}
			else
			{
				if(mail.length==0)
				{
					mail = "-";
				}
				else
				{
					_RegistMailFlag++;
				}
				$(li_obj).append('<div class="fullName">' + full_name + '</div>');
				$(li_obj).append('<div class="emailInfo">' + mail + '</div>');
			}
			$(ul_obj).append($(li_obj));
		}
		
		//console.log("flag=%d",flag)
		if(flag==0)
		{
			//input line
			var li_obj = document.createElement("li");
			$(li_obj).append('<div class="accountName">' + '<input id="gettingstarted_userName_text" class="personal_v input_x4 lower" placeholder="' + uname + '" type="text" value="" name="gettingstarted_userName_text" onkeyup="show(\'add_user_button\')">' + '</div>');
			$(li_obj).append('<div class="firstName">' + '<input id="gettingstarted_firstName_text" class="personal_v input_x4" placeholder="' + fname + '" type="text" value="" name="gettingstarted_firstName_text" onkeyup="show(\'add_user_button\')">' + '</div>');
			$(li_obj).append('<div class="lastName">' + '<input id="gettingstarted_lastName_text" class="personal_v input_x4" placeholder="' + lname + '" type="text" value="" name="gettingstarted_lastName_text" onkeyup="show(\'add_user_button\')">' + '</div>');
			$(li_obj).append('<div class="email">' + '<input id="gettingstarted_email_text" class="personal_v input_x4" type="text" placeholder="' + smail + '" value="" name="gettingstarted_email_text" onkeyup="show(\'add_user_button\')">' + '</div>');
			$(li_obj).append('<div class="saveButton" id="add_user_button" style="display:none">' + '<button id="gettingstarted_addUserSave_button" onclick="gettting_start_add_user(0)">' + save + '</button>' + '</div>');
			
			$(ul_obj).append($(li_obj));
			
			//$("#wd2go_header").html(_T('_cloud','invite'));
		}
		
		$("#wd2go_header").html(_T('getting_start','login'));
		
		$("#gettingstarted_rFirstName_text").val("");
		$("#gettingstarted_rLastName_text").val("");
		$("#gettingstarted_rMail_text").val("");
			
		$("#create_device_user_list").html($(ul_obj));
		$("input:text").inputReset();
		$(":input[placeholder]").placeholder();
		
		$("#gettingstarted_rFirstName_text").val(_Regist_Info.first_name);
		$("#gettingstarted_rLastName_text").val(_Regist_Info.last_name);
		$("#gettingstarted_rMail_text").val(_Regist_Info.mail);
				
		if(_Regist_Info.first_name.length!=0)
		{
			$("#gettingstarted_rFirstName_text").next().next().css("display","inline");
		}
		if(_Regist_Info.last_name.length!=0)
		{
			$("#gettingstarted_rLastName_text").next().next().css("display","inline");
		}
		if(_Regist_Info.mail.length!=0)
		{
			$("#gettingstarted_rMail_text").next().next().css("display","inline");
		}
						
		//fish20140212+ for 86521 "Undefined" error message if Cloud Access is disabled when generating code 
		var remote_access = _REST_Get_Cloud_Info();	//true,false
		//if(remote_access=="false" && entry=="toolbar")
		/*if(remote_access=="false")
		{
			$(".email input[name='gettingstarted_email_text']").addClass("gray_out").attr('readonly','true');
		}*/
				
		setTimeout(function(){
			var sObj = $(".cloud_user_scroll").jScrollPane();
			$('.cloud_user_scroll').jScrollPane().data('jsp').scrollToBottom();
		},10);
	}	
	//ads account
	var ADUList = new Array();
	function _get_ad()
	{
		wd_ajax({
			type: "GET",
			cache: false,
			url: "/web/php/getADInfo.php?type=users",
			dataType: "xml",
			success: function(xml){
				var workgroup= $(xml).find('ads_workgroup').text();
				var ads= $(xml).find('ads_enable').text();
				if(ads=="1")
				{
					var idx=0;
					ADUList[idx] = new Array();
					ADUList[idx].username = "";
					ADUList[idx].uid = "";
					ADUList[idx].gid = "";
					ADUList[idx].type = "";
					ADUList[idx].first_name = "";
					ADUList[idx].last_name = "";
					ADUList[idx].email = "-";
					
					idx++;
					$(xml).find('users > item').each(function(index){
						var user_name = $(this).find('name').text();
						if(user_name=="Administrator") 
						{
							_AD_ADMIN_NAME = workgroup + "\\" + user_name;
							return true;
						}
						if(idx==_MAX_TOTAL_AD_ACCOUNT) return false;
						
						ADUList[idx] = new Array();
						ADUList[idx].username =  workgroup + "\\"+ user_name;
						ADUList[idx].uid = "";
						ADUList[idx].gid = "";
						ADUList[idx].type = "ad";
						ADUList[idx].first_name = "";
						ADUList[idx].last_name = "";
						ADUList[idx].email = "-";
						idx++;
					});
					ADUList.sort(function(a, b){
					    var a1= a.username.toLowerCase() , b1= b.username.toLowerCase() ;
					    if(!b1) b1=a1;
					    if(a1== b1) return 0;
					    return a1> b1? 1: -1;
					});
					
					ADUList[0].username = _AD_ADMIN_NAME;
					ADUList[0].uid = "";
					ADUList[0].gid = "";
					ADUList[0].type = "ad";
					ADUList[0].first_name = "";
					ADUList[0].last_name = "";
					ADUList[0].email = "-";
																		
					eulaAllUserList = userInfo_tmp.concat(ADUList);
				}
				else
				{
					eulaAllUserList = userInfo_tmp;
				}
				
				_display_user();
				
			},
			error:function(xmlHttpRequest,error){
				//alert("Error: " +error);
			}
		});
	}
	
	
}
			
function gettting_start_add_user(createFlag)	//createFlag 1:admin 2:normal user
{
	var create_status = api_do_query_create_status2("iUser");
	if(create_status==-1)
	{
		jAlert(_T('_user','msg45'), 'warning2');
		return;
	}
			
	var accountName = $("#gettingstarted_userName_text").val();
	var firstName = $("#gettingstarted_firstName_text").val();
	var lastName = $("#gettingstarted_lastName_text").val();
	var email = $("#create_device_user_list input[name='gettingstarted_email_text']").val();
	
//	if(accountName=="")
//	{
//		jAlert(_T('_user','msg5'), _T('_common','error'));
//		return ;
//	}
	
	eula_Get_User_Info();
	if(_ACCOUNT_TOTAL >=_MAX_TOTAL_ACCOUNT) 
	{
		jAlert(_T('_user','msg1'), _T('_common','error'));
		return;
	}
	
	var fname = _T('getting_start','first_name');
	if(fname!=firstName && firstName.length!=0)
	{
		if(eula_check_first_value(firstName)==-1)
		{
			jAlert(_T('_user','msg39'), _T('_common','error'));
			return;
		}
	}
	else
	{
		firstName="";
	}
	
	var lname = _T('getting_start','last_name');
	if(lname!=lastName && lastName.length!=0)
	{
		if(eula_check_last_value(lastName)==-1) 
		{
			jAlert(_T('_user','msg48'), _T('_common','error'));
			return;
		}
	}
	else
	{
		lastName="";
	}
	
	if(createFlag==0)
	{
	if(eula_check_account_value(accountName)==-1) return;
	}
	
	var name = accountName;
	if(lastName.length!=0)
	{
		name+=" " +lastName;
	}
		
	var smail = _T('getting_start','email');
	if(smail!=email)
	{
		if(_LOCAL_LOGIN==0)
		{
			jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
			return;
		}
		
	if(checkmail(email))
	{
			if(email.length!=0)
		{
				jAlert(_T('_user','msg49'), _T('_common','error'));
			return;
		}
	}
		else if(email.length >48)
		{
				jAlert(_T('_user','msg49'), _T('_common','error'));
			return;
		}
	}
	else
	{
		email="";
	}
		
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
		
	if(createFlag==1)
	{
		stop_web_timeout();
		_postAdd(function(){
			//$.cookie('username', firstName , { expires: 365 ,path: '/'});
		$("#login_name").text(firstName);
		//set session
		wd_ajax({
			type: "post",
			cache: false,
			url: "/web/php/modUserName.php",
			data:{username:accountName,oldName:"admin"},
			dataType: "html",
			success:function()
			{
				restart_web_timeout();
			},
		    error: function (request, status, error) {

		    }
		});
		});
		
		return;
	}
	
	_postAdd();
	function _postAdd(callback)
	{
	 wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
			data: { cmd:"cgi_user_add" ,name:accountName, pw:"",
					group:"",first_name:firstName,last_name:lastName,pw_onoff:0,
						mail:email,pw_hit:"",type:"wizard" ,isAdmin:createFlag},
		success: function(data){
			//$("#gettingstarted_next1_button").removeClass('gray_out_80');
				_REST_Register_User(accountName,email,'wizard');
				if(callback)callback();
			}
	});
	}
}

function check_eula(obj)
{			
	if ($(obj).prop('checked'))
	{
		$('#eula_continue_button').removeClass("gray_out");
	}
	else
	{
		$('#eula_continue_button').addClass("gray_out");
	}
}



function auto_update_fw()
{
	var hour = $("#wizard_time").attr('rel');
	var t = $("#wizard_pm").text();		
	if (t == "PM")
	{
		if (hour!=12)
			hour = parseInt(hour,10)+12;		
	}
	else
	{
		if (hour==12)
			hour = 0;
	}
	
	var enable = $("#gettingstarted_autofw_switch").val();
	var str = "cmd=set_auto_fw_sch";
	str+="&hour="+"3";
	str+="&week="+"7";
	str+="&enable="+ enable;
	
	wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/system_mgr.cgi",
		data:str,
		success:function(data){
		}
	});	
}

function _REST_Registered_Device()
{
	var email = $("#gettingstarted_rMail_text").val().trim();
	var first = $("#gettingstarted_rFirstName_text").val().trim();
	var last= $("#gettingstarted_rLastName_text").val().trim();

	if(first.length==0 && last.length==0 && email.length==0)
	{
		return 0;
	}
	
	if(_LOCAL_LOGIN==0)
	{
		jAlert(_T('_cloud','not_allow_desc'), "not_allowed_title");
		return 1;
	}
		
	if(eula_check_first_value(first)==-1)
	{
		$("#gettingstarted_register_status").html(_T('_user','msg39'));
		return 1;
	}
			
	if(eula_check_last_value(last)==-1)
	{
		$("#gettingstarted_register_status").html(_T('_user','msg48'));
		return 1;
	}
	
	if(checkmail(email) || email.length==0 || email.length > 48)
	{
		$("#gettingstarted_register_status").html(_T('_user','msg49'));
		return 1;
	}
	
	jLoading(_T('_common','set'), 'loading' ,'s',"");
	
	//todo: check cloud service on/off
	_REST_Device(function(_CloudDeviceInfo){
		if(_CloudDeviceInfo.remote_access=="false")
		{
			var manual_port_forward = _CloudDeviceInfo.manual_port_forward;
			var manual_external_http_port = _CloudDeviceInfo.manual_external_http_port;
			var manual_external_https_port = _CloudDeviceInfo.manual_external_https_port;
			var parameter="";
			if(manual_port_forward=='true')
			{
				parameter = "&manual_port_forward=TRUE&manual_external_http_port="+
							 manual_external_http_port + "&manual_external_https_port=" + manual_external_https_port;
			}
		
			_REST_Set_Cloud_Access("true",parameter,function(){
				google_analytics_log('cloudaccess-en',1);
				_post_regiestr();
			});
		}
		else
		{
			_post_regiestr();
		}
	});
	
	function _post_regiestr()
	{
		var L_array = $.map(lang_array, function(element,index) {return index});
		var lang=L_array[MULTI_LANGUAGE];
		var country=country_array[lang];
		$.ajax({
			type:"POST",
			cache:false,
			url:"/api/" + REST_VERSION + "/rest/device_registration",
			data:{option:"yes",email:email,first:first,last:last,
				country:country,lang:lang
				},
			dataType: "xml",
			success:function(xml){
				jLoadingClose();
				
				if($("#gettingstarted_rFirstName_text").val()!=_Regist_Info.first_name)
				{
					api_change_account("first_name");
					_Regist_Info.first_name = $("#gettingstarted_rFirstName_text").val();
				}

				if($("#gettingstarted_rLastName_text").val()!=_Regist_Info.last_name)
				{
					api_change_account("last_name");
					_Regist_Info.last_name = $("#gettingstarted_rLastName_text").val();
				}
								
				if($("#gettingstarted_rMail_text").val()!=_Regist_Info.mail)
				{
					api_change_account("mail");
					_Regist_Info.mail = $("#gettingstarted_rMail_text").val();
				}
				
				$("#w_step3").show();
				$("#w_step2").hide();
				$("#gettingstarted_register_status").empty();
			},
			error:function(request, status, error){
				jLoadingClose();
				var $xml = $(request.responseText);
				var err = $xml.find('error_message').text();
				var err_id = $xml.find('error_id').text();
				/*	262 - 'DEVICE_ALREADY_REGISTERED' - 'Device already registered'
					263 - 'DEVICE_REGISTRATION_PENDING' - 'Device registration Pending'
					264 - 'DEVICE_REGISTRATION_NO_SUCCESS' - 'Device registration no success'*/
				var errID = "error_id_" + $xml.find('error_id').text();	
				
				if(err_id=="262")
				{
					$("#gettingstarted_register_status").html(_T('eula','regiest_fail_1'));
				}
				else
				{
					$("#gettingstarted_register_status").html(_T('eula','regiest_fail_2'));
				}
				
				$("#gettingstarted_rMail_text").val("");
				$("#gettingstarted_rFirstName_text").val("");
				$("#gettingstarted_rLastName_text").val("");
				
				$("#gettingstarted_rFirstName_text").next().next().css("display","none");
				$("#gettingstarted_rLastName_text").next().next().css("display","none");
				$("#gettingstarted_rMail_text").next().next().css("display","none");
	  		},
			complete: function (jqXHR, textStatus) {
			}
		});
	}
}

function api_change_account(mtype)
{	
	var mflag;
	var username=_Regist_Info.account_name;
	var first_name = $("#gettingstarted_rFirstName_text").val();
	var last_name =	$("#gettingstarted_rLastName_text").val();
	var mail = $("#gettingstarted_rMail_text").val();
	var oldMail="";
	var resend_mail=0;
	var admin_old_pw ="";
	var available = new Array("","","","");
	var available1 = available[0];
	var available2 = available[1];
	var available3 = available[2];
	var available4 = available[3];
	var pw_off="";
	var pw = "";
	var group="";
	var oldName = _Regist_Info.account_name;
	var expires_time = "";
	var admin ="";
		
	switch(mtype)
	{
		case 'first_name':
			mflag=1;
			break;
		case 'last_name':
			mflag=6;
			break;
		case 'mail':
			mflag=2;
			var orgEmail = _Regist_Info.mail;
				
			var device_user_info = _REST_Get_Device_User_info(username);
			var uid=$(device_user_info).find('device_user_id').text();
			
			if(uid.length==0)
			{
				_REST_Create_User(username,mail,"true",function(res){
					if(res==-1)
					{
						return;
					}
				});
			}
			else
			{
				_REST_Change_Mail(3,username,device_user_info,mail,function(res){
					show_device_user("wizard");
					if(res==-1) 
					{
						return;
					}
				});
			}
			break;
	}
	
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
		  	jLoadingClose();
		}
	});	
	
}
function _REST_Eula()
{
	$.ajax({
		type:"POST",
		cache:false,
		async:false,
		url:"/api/" + REST_VERSION + "/rest/eula_acceptance",
		data:{accepted:"yes"},
		dataType: "xml",
		success:function(xml){
			
		},
		error:function(xml){

  		}
	});
}
function _REST_Language(lang)
{
	$.ajax({
		type:"POST",
		cache:false,
		//url:"/api/" + REST_VERSION + "/rest/language_configuration",
		url: "/web/restAPI/restAPI_action.php?action=language_configuration",
		data:{
			send_type: 'PUT',
			language: lang
		},
		dataType: "xml",
		success:function(xml){
			
			//reload msg
			var sys_time = (new Date()).getTime();
			$.getScript("/web/lib/msg.php?r=" + sys_time, function(){
			   // Here you can use anything you defined in the loaded script
			});
		},
		error:function(xml){

  		}
	});
}
function init_wizard_tb_sch_info(entry_type)
{
	$.ajax({
		type:"POST",
		cache:false,
		url:"/cgi-bin/system_mgr.cgi",
		data:"cmd=get_auto_fw_sch",
		success:function(xml){	
			$(xml).find('fw').each(function(index){		
				var enable = $(this).find('enable').text();
				setSwitch('#gettingstarted_autofw_switch',enable);
			});
		}																																
	});							
}

function show_wizard_schedule(obj)
{
	if($(obj).prop("checked"))
	{
		show('wizard_tb_sch');
	}
	else
		hide('wizard_tb_sch');
}
var lang_array = {	"ENG":"0",
					"FRA":"1",
					"ITA":"2",
					"DEU":"3",
					"ESN":"4",
					"CHS":"5",
					"CHT":"6",
					"KOR":"7",
					"JPN":"8",
					"RUS":"9",
					"POR":"10",
					"CZE":"11",
					"DUT":"12",
					"HUN":"13",
					"NOR":"14",
					"PLK":"15",
					"SWE":"16",
					"TUR":"17"
				};
var country_array = {
						"ENG":"US",
						"FRA":"FR",
						"ITA":"IT",
						"DEU":"DE",
						"ESN":"ES",
						"CHS":"CN",
						"CHT":"TW",
						"KOR":"KR",
						"JPN":"JP",
						"RUS":"RU",
						"POR":"PT",
						"CZE":"CZ",
						"DUT":"SX",
						"HUN":"HU",
						"NOR":"NO",
						"PLK":"PL",
						"SWE":"SE",
						"TUR":"TR"
					};
var language_array = {
						"ENG":"en_US",
						"FRA":"fr_FR",
						"ITA":"it_IT",
						"DEU":"de_DE",
						"ESN":"es_ES",
						"CHS":"zh_CN",
						"CHT":"zh_TW",
						"KOR":"ko_KR",
						"JPN":"ja_JP",
						"RUS":"ru_RU",
						"POR":"pt_BR",
						"CZE":"cs_CZ",
						"DUT":"nl_NL",
						"HUN":"hu_HU",
						"NOR":"nb_NO",
						"PLK":"pl_PL",
						"SWE":"sv_SE",
						"TUR":"tr_TR"
					};
var language_array2 = {
						"0":"en_US",
						"1":"fr_FR",
						"2":"it_IT",
						"3":"de_DE",
						"4":"es_ES",
						"5":"zh_CN",
						"6":"zh_TW",
						"7":"ko_KR",
						"8":"ja_JP",
						"9":"ru_RU",
						"10":"pt_BR",
						"11":"cs_CZ",
						"12":"nl_NL",
						"13":"hu_HU",
						"14":"nb_NO",
						"15":"pl_PL",
						"16":"sv_SE",
						"17":"tr_TR"
					};

function get_language(entry)
{
	var lang="",eula="";
	$.ajax({
		type:"GET",
		async: false,
		cache:false,
		url:"/cgi-bin/login_mgr.cgi?cmd=cgi_get_language",
		dataType: "xml",
		success:function(xml){
			lang = $(xml).find('lang').text();
			eula = $(xml).find('eula').text();
			_Regist_Info.lang = lang;
			_Regist_Info.eula = parseInt(eula,10);
			MULTI_LANGUAGE = lang;
			
			if(entry!="myhome")
			{
				country_mapping(MULTI_LANGUAGE);
			}
			//console.log("eula=%s",_Regist_Info.eula)
		},
		error:function(xml){

  		}
	});	
	
	return lang;
}

function _REST_Register_User(username,email,entry)	//entry:wizard,user
{
	
	if(email.length==0) 
	{	
		rewrite_pem();
		if(entry=='wizard')show_device_user(entry);
		jLoadingClose();
		return;
	}
	
	if(entry=='wizard')
	{
		_REST_Device(function(_CloudDeviceInfo){
			if(_CloudDeviceInfo.remote_access=="false")
			{
				var manual_port_forward = _CloudDeviceInfo.manual_port_forward;
				var manual_external_http_port = _CloudDeviceInfo.manual_external_http_port;
				var manual_external_https_port = _CloudDeviceInfo.manual_external_https_port;
				var parameter="";
				if(manual_port_forward=='true')
				{
					parameter = "&manual_port_forward=TRUE&manual_external_http_port="+
								 manual_external_http_port + "&manual_external_https_port=" + manual_external_https_port;
				}
			
				_REST_Set_Cloud_Access("true",parameter,function(){
					google_analytics_log('cloudaccess-en',1);
					_post_mail(username,email,entry);
				});
			}
			else
			{
				_post_mail(username,email,entry);
			}
		});
	}
	else
	{
		_post_mail(username,email,entry);
	}
	
	function _post_mail(username,email,entry)
	{
	//http://2.66.69.244/api/2.1/rest/device_user?email=xx&username=xx
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/api/" + REST_VERSION + "/rest/device_user",
		data:{username:username,email:email,send_email:"true"},
		dataType: "xml",
		success:function(xml)
		{
			rewrite_pem();
				if(entry=='wizard')show_device_user(entry);
			api_cp2flash();
			jLoadingClose();
		},
	    error: function (request, status, error) {
	    	_post_remove_mail(function(){
	    		jLoadingClose();
		    	if(entry=='wizard') show_device_user(entry);
			var $xml = $(request.responseText);
			var err = $xml.find('error_message').text();
			var errID = "error_id_" + $xml.find('error_id').text();
			jAlert( errorsList[errID], _T('_common','error'));
	    	});
	    }
	});
	}
	
	function _post_remove_mail(callback)
	{
		wd_ajax({
			type: "POST",
			cache: false,
			url: "/cgi-bin/account_mgr.cgi",
			data:{cmd:"cgi_remove_email",username:username},
			success: function(){
				if(callback)callback();
		}
	});
}
	
}
function rewrite_pem()
{
	$.ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/network_mgr.cgi",
		data:{cmd:'cgi_rewrite_pem'},		
		success: function(){
		}
	});		
}
function eula_check_first_value(firstName)
{
	//console.log(firstName)
	if(firstName_lastName_check(firstName) || firstName.indexOf(" ") != -1 || firstName.length >16 || firstName.length==0)
	{
		//First name must be an alphanumeric value between 1 and 256 characters and cannot contain spaces.
		//jAlert(_T('_user','msg39'), _T('_common','error'));
		return -1;
	}
}
function eula_check_last_value(lastName)
{
	if(firstName_lastName_check(lastName) || lastName.length >16 || lastName.length==0)
	{
		return -1;
	}
}
function eula_check_account_value(name)
{
	var uname = _T('_user','user_name') + "*";
		
	if( name == "" || name==uname)
	{
		//First name must be an alphanumeric value between 1 and 16 characters and cannot contain spaces.
		jAlert(_T('_user','msg47'), _T('_common','error'));
		return -1;
	}
	
	var flag = checkID(name,_ALL_ACCOUNT);
		
	if(flag==0)
	{
		//This first name does not accepted . Please try again.
		jAlert(_T('_user','msg7').replace(/%s/g,name), _T('_common','error'));
		return -1;
	}
	
	if(flag==1)
	{
		//The first name entered already exists. Please select a different first name.
		jAlert(_T('_user','msg12'), _T('_common','error'));
		return -1;
	}

	if(Chk_account(name) || name.indexOf(" ") != -1 || name.length >16)
	{
		//First name must be an alphanumeric value between 1 and 16 characters and cannot contain spaces.
		jAlert(_T('_user','msg47'), _T('_common','error'));
		return -1;
	}

	if(chk_first_char(name))
	{
		jAlert(_T('_user','msg25'), _T('_common','error'));
		return -1;
	}
	
 	var group=_ALL_GROUP.split("#");
 	for(i=0;i<group.length;i++)
 	{
 		if(group[i]==name)
 		{
 			jAlert(_T('_user','msg11'), _T('_common','error'));
 			return -1;
 			break;
 		}
 	}
}
var _ALL_ACCOUNT = "";
var _ALL_GROUP = "";
var _ACCOUNT_TOTAL = "";
function eula_Get_User_Info()
{
	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/xml/account.xml",
		dataType: "xml",
		success: function(xml){
			var userArray = new Array();
			var groupArray = new Array();
			$(xml).find('users > item').each(function(index){
				var user_name = $(this).find('name').text();
				userArray.push(user_name);
			});

			$(xml).find('groups > item').each(function(index){
				var g_name = $(this).find('name').text();
				groupArray.push(g_name);
			});
						
			_ALL_ACCOUNT= userArray.toString().replace(/,/g,'#');
			_ACCOUNT_TOTAL = userArray.length;
			_ALL_GROUP = groupArray.toString().replace(/,/g,'#');
		}
		,
		 error:function(xmlHttpRequest,error){   
        		//alert("Get_User_Info->Error: " +error);   
  		 }  
	});
	/*
	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		data:"cmd=cgi_get_user_info",	
		dataType: "xml",
		success: function(xml){
			_ACCOUNT_TOTAL = $(xml).find('total').text();
			_ALL_ACCOUNT = $(xml).find('all_user').text();
			_ALL_GROUP = $(xml).find('all_group').text();
		}
		,
		 error:function(xmlHttpRequest,error){   
        		//alert("Get_User_Info->Error: " +error);   
  		 }  
	});
	*/
}
function eula_logout()
{
	$(".exposeMask").each(function() { $(this).remove(); });
	$(".LightningStatusPanel").each(function() { $(this).remove(); });

	var login_name = getCookie("username");

	$.ajax({
		type: "POST",
		url: '/cgi-bin/login_mgr.cgi',
		dataType: "xml",
		cache: false,
		async: false,
		data: {
			cmd: 'wd_logout',
			name: login_name
		},
		success: function(r) {
			
			$(document).unbind("click");

			$("#pages").fadeOut('fast', function() {
				$("#form").fadeIn('fast');
				$("#form").get(0).reset();
				check_cookie();
				$("#pages *").unbind();
				$("#pages").empty();
			});
		}
	});
}

function set_eula(type)
{
	_REST_Eula();
	//_REST_Language(language_array2[$("#f_language").attr("rel")]);
	
	$.ajax({
		type:"POST",
		cache:false,
		url:"/cgi-bin/login_mgr.cgi",
		data:{cmd:'cgi_eula'},
		success:function(data){											
			$("#w_step1").hide();
			$("#w_step2").hide();
			$("#w_step3").hide();
			if(type=='eula')	
			{
				$("#pages").fadeOut('fast', function() {
					load_page("/web/home.php");
					restart_web_timeout();
				});
			}		
		}
	});	
}
function download_log()
{
	//document.form_report.project_name.value=PROJECT_NAME;
	
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback

	$.ajax({
		type:"POST",
		cache:false,
		dataType: "xml",
		url:"/cgi-bin/system_mgr.cgi",
		data:{cmd:'cgi_create_sys_log',project_name:PROJECT_NAME},
		success:function(xml){
			
			jLoadingClose();
			
			var res = $(xml).find('res').text();
			if(res=="ok")
			{
				$("#form_report input[name='project_name']").val(PROJECT_NAME);
				document.form_report.submit();
			}
		}
	});
}
function eula_show_error_tip(tipID,msg)
{
	$(tipID).attr('title',msg);
	//$(tipID).show();
	$(tipID).removeClass('SaveButton');
	init_tooltip(".TooltipIconError");
}
function eula_chg_pw()
{
	var pw = $("#gettingstarted_newPW_password").val();
	var adminPW = Base64.encode( pw );
	
	$.ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/account_mgr.cgi",
		dataType: "xml",
		data:{cmd:"cgi_modify_account",mtype:3,username:"admin",
					pw:adminPW,pw_off:"on",old_pw:""},
		success:function(xml)
		{
		}
	});
}
function eula_chk_pw(pw,pw2)
{
	//set password
	if( pw == "" && pw2=="")
	{
		//Please enter a password.
		//$(".tip_pw2_error").hide();
		//eula_show_error_tip(".tip_pw_error",_T('_mail','msg11'));
		return 0;
	}
	
	if(pw_check(pw)==1)
	{
		//The password must not include the following characters:  @ : / \ % '
		$(".tip_pw2_error").hide();
		eula_show_error_tip(".tip_pw_error",_T('_pwd','msg8'));
		return -1;	
	}

	if (pw.indexOf(" ") != -1) //find the blank space
 	{
 		//Password must not contain space.
 		$(".tip_pw2_error").hide();
 		eula_show_error_tip(".tip_pw_error",_T('_pwd','msg9'));
 		return -1;
 	}

	if (pw.length < 5) 
	{
		//jAlert('Password must be at least 5 characters in length. Please try again.', 'Error');
		$(".tip_pw2_error").hide();
		eula_show_error_tip(".tip_pw_error",_T('_pwd','msg10'));
 		return -1;	
	}
	
	if (pw.length > 16)
	{
		//jAlert('The password length cannot exceed 16 characters. Please try again.', 'Error');
		$(".tip_pw2_error").hide();
		eula_show_error_tip(".tip_pw_error",_T('_pwd','msg11'));
 		return -1;			
	}
			
	if( pw != pw2 )
	{
		//jAlert('The new password and confirmation password does not match. Please try again.', 'Error');
		//jAlert(_T('_pwd','msg7'), _T('_common','error'));
		$(".tip_pw_error").hide();
		eula_show_error_tip(".tip_pw2_error",_T('_pwd','msg7'));
		return -2;
	}
	
	return 0;
}
