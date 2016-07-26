var _INIT_DIAG_FLAG=0,_INIT_REMOTE_DIAG_FLAG=0;
var _INIT_TYPE="";
function init_remote_server_dialog()
{
	var pwObj = $("#rServerDiag input[name='settings_networkRemoteServerPW_password']");
	
	$("#backups_rlink").attr("href","http://wdc.custhelp.com/app/answers/detail/a_id/10649");
	/*var v = pwObj.val();
	if( v.length >0 )
	{
		Set_Server(1,'auto');
		return;
	}*/

	$("#rServerDiag").show();
	$("#rsDetailDiag_title").html( _T('_remote_backup','server'));
	
	$("#remoteServerDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,
						onClose: function() {
							setSwitch('#settings_networkRemoteServer_switch',_SERVER);
							show_pw();
						}}
	).load();

	
	pwObj.focus();
	
	ui_tab("#remoteServerDiag","#rServerDiag #settings_networkRemoteServerPW_password","#settings_networkRemoteServerSave_button");
	
	if(_INIT_REMOTE_DIAG_FLAG==1) return;
		_INIT_REMOTE_DIAG_FLAG=1;
}
var _H;
function init_remote_dialog()
{
	write_server_option();
	write_bandwidth_option();
	write_type_option(1);
	write_schedule_option();
	init_select();

	$("#source_td .source_listDiv").css("height",32);
	$("#backups_rForgotPassword_link a").attr("href",FORGOT_PW_URL);
	
	$("#input:text").val("");
	$("#input:password").val("");
	SetScheduleMode('#s_type','3',"");	//3:daily
	setSwitch('#backups_rAutoupdate_switch',0);
	setSwitch('#backups_rEncryption_switch',0);
	setSwitch('#backups_rBackupWithSSH_switch',1);
	
	show_schedule_type_div($("#s_type").attr('rel'));
	
	var table_ele = $("#backups_rSourceMulti_div.source_listDiv ul");
	var t = "<li>";
	t += String.format('<div class="select_text" title="{0}">{1}</div>', "", "");
	t += "</li>";
	table_ele.html(t);
	$("#backups_source_label, #backups_browse_label").css("vertical-align","");
		
	$("#backups_rAutoupdate_switch").unbind("click");
	$("#backups_rAutoupdate_switch").click(function(){
		var v = getSwitch('#backups_rAutoupdate_switch');
		if( v==1 )
		{
			$("#schedule_tr").show();
			$("#schedule_div").show();
			
			show_schedule_type_div($("#s_type").attr('rel'));

			var h = $("#remoteDiag").height()+100;
						
			adjust_dialog_size("#remoteDiag","",h);
		}
		else
		{
			$("#schedule_tr").hide();
			$("#schedule_div").hide();
			var h = $("#remoteDiag").height()-100;
						
			adjust_dialog_size("#remoteDiag","",h);
		}
	});
	
	$("#backups_rBrowseSource_button").unbind("click");
	$("#backups_rBrowseSource_button").click(function(){
		_H = $("#remoteDiag").height();
		
		$("#rDiag_mainPage").hide();
		$("#rDiag_folder").show();
		__file = 1;
		$('#rsync_tree_div').fileTree({ root: '/mnt/HD/' ,
										cmd: 'cgi_open_tree', 
										script:'/cgi-bin/folder_tree.cgi',
										over_select_msg:_T("_usb_backups", "over_select_msg"),
										multi_select:1,
										max_select:10,
										chk:1,
										filetype:'all',
										checkbox_all:'2',
										checkbox_click_callback: remote_open_folder_selecter_checkbox_click_callback_fn,
										function_id:''}, function(file) {});
		
		adjust_dialog_size("#remoteDiag","",480);
		$('#backups_rNext2_button').removeClass('gray_out').addClass('gray_out');
	});
	
	//rDiag_folder's button
	$("#backups_rNext2_button").unbind("click");
	$("#backups_rNext2_button").click(function(){
		
		var flag=0;
		var li = $("#backups_rSourceMulti_div.source_listDiv ul li");
		if(li.length >=2)
		{
			flag=1;
		}
		
		var selFolder = $("#rsync_tree_div input:checkbox:checked:not([disabled])");
		var count = selFolder.length;
		if(count==0)
		{
			jAlert(_T('_remote_backup','select_one'), _T('_common','error'));
			return;
		}
		else if(count >10)
		{
			jAlert(_T('_remote_backup','msg33'), _T('_common','error'));
			return;
		}
	
		adjust_dialog_size("#remoteDiag","",_H +50);
		
		$("#rDiag_folder").hide();
		$("#rDiag_mainPage").show();
		
		//display path to rDiag_mainPage
		_LOCAL_PATH_ARRAY = new Array();
		var table_ele = $("#backups_rSourceMulti_div.source_listDiv ul");
		table_ele.empty();
		selFolder.each(function(){
			_LOCAL_PATH_ARRAY.push($(this).val());
			var t = "<li>";
			var _path = translate_path_to_display($(this).val());
			t += String.format('<div class="select_text TooltipIcon" style="width:240px" title="{0}">{1}</div>', _path, _path);
			t += "</li>";
			table_ele.append(t);
		});
		
		init_tooltip();
		
		$("#source_td .source_listDiv").css("height",32);
		
		if(count >=3)
		{
			var list_height = count * 30;
			$("#source_td .source_listDiv").height((list_height < 110) ? list_height+10 : 110);
			$("#source_td .source_listDiv").jScrollPane({contentWidth:247, autoReinitialise: true});
		}

		if(count >=2)
		{
			$("#backups_source_label, #backups_browse_label").css("vertical-align","top");
			if(flag==0)
			{
				var h = $("#remoteDiag").height()+50;
				adjust_dialog_size("#remoteDiag","",h);
			}
		}
		else
		{
			$("#backups_source_label, #backups_browse_label").css("vertical-align","");
			var h = $("#remoteDiag").height()-50;
			adjust_dialog_size("#remoteDiag","",h);
		}
	});

	$("#backups_rCancel2_button").unbind("click");
	$("#backups_rCancel2_button").click(function(){
		$("#rDiag_folder").hide();
		$("#rDiag_mainPage").show();
		adjust_dialog_size("#remoteDiag","",_H);
	});
	
	$("#backups_rBrowseDest_button").unbind("click");
	$("#backups_rBrowseDest_button").click(function(){
		if(chk_remote_addr()==-1) return;
		
		_H = $("#remoteDiag").height();
		adjust_dialog_size("#remoteDiag","",480);
		check_server();
	});

	//rDiag_share_set's button
	$("#backups_rNext5_button").unbind("click");
	$("#backups_rNext5_button").click(function(){
		var sel = $("#f_share_name input:checkbox:checked:not([disabled])");
		if(_NEWFOLDER!=1)
		{
			if($("#remote_shareinfo").hasClass("noshare"))
			{
				$("#rDiag_folder").hide();
				$("#rDiag_mainPage").show();
				return;
			}
			
			if(sel.length==0)
			{
				new_folder=0;
				jAlert(_T('_remote_backup','msg28'), _T('_common','error'));
				return;
			}
			else
			{
				_REMOTE_SHARE = $(sel).val()
				_NEWFOLDER=0;
			}
		}
		
		check_rsync_rw();
		
		/*
		var rel_path="";
		var new_folder=0;
		if($("#create_info_div input:checkbox").length!=0)
		{
			rel_path=$('#create_info_div input:checked').val();
			new_folder=1;
		}
		else
		{
			var sel = $("#f_share_name input:checkbox:checked").length;
			rel_path=$('#f_share_name input:checked').val();
			if(sel==0)
			{
				jAlert(_T('_remote_backup','msg28'), _T('_common','error'));
				return;
			}
		}
		
		if ($('#size_info').hasClass('error1'))
		{
			//There is not enough spaces on the remote hard drive.
			jAlert(_T('_remote_backup','msg13'), _T('_common','error'));
			return;
		}
		if ($('#size_info').hasClass('error2'))
		{
			//There is not enough spaces on the local hard drive.
			jAlert(_T('_remote_backup','msg14'), _T('_common','error'));
			return;
		}

		if(!$('#size_info').hasClass('OK'))
		{
			chk_hdd_free_size(rel_path);
			
			if ($('#size_info').hasClass('error1'))
			{
				//There is not enough spaces on the remote hard drive.
				jAlert(_T('_remote_backup','msg13'), _T('_common','error'));
				return;
			}
			if ($('#size_info').hasClass('error2'))
			{
				//There is not enough spaces on the local hard drive.
				jAlert(_T('_remote_backup','msg14'), _T('_common','error'));
				return;
			}
		}
					
		//$("#rsync_test_info").html(_T('_remote_backup','test'));
		
		check_rsync_rw(new_folder);
		*/
	});
	$("#backups_rCancel5_button").unbind("click");
	$("#backups_rCancel5_button").click(function(){
		$("#rDiag_share_set").hide();
		$("#rDiag_mainPage").show();
		adjust_dialog_size("#remoteDiag","",_H);
	});

	//rDiag_mycloud's button 
	$("#backups_rNext10_button").unbind("click");
	$("#backups_rNext10_button").click(function(){
		var email = $("#backups_rCloudMail_text").val();
		var pw = $("#backups_rCloudPw_password").val();
		
		show_mycloud_nas(email,pw);
	});
	
	$("#backups_rBack10_button").unbind("click");
	$("#backups_rBack10_button").click(function(){
		$("#rDiag_mainPage").show();
		$("#rDiag_mycloud").hide();
		adjust_dialog_size("#remoteDiag","",_H);
	});
	
	//rDiag_mycloud_list's button
	$("#backups_rNext12_button").unbind("click");
	$("#backups_rNext12_button").click(function(){
		
		var sel = $(".cloud_container_ul li.dev_sel").length;
		var idx = $(".cloud_container_ul li.dev_sel").attr('rel');
		if(sel==0)
		{
			jAlert( _T('_user','msg2'), _T('_common','error'));	//Please enter a user name.
			return;
		}
		
		var sdomain = _Cloud_Device_Info[idx].local_ip;
		var sdomain="";
		if(_Cloud_Device_Info[idx].connection =="2")
			sdomain = _Cloud_Device_Info[idx].local_ip;
		else
			sdomain = _Cloud_Device_Info[idx].name+"." + _Cloud_Device_Info[idx].user_sub_domain + "." + _Cloud_Device_Info[idx].server_domain;
			
		adjust_dialog_size("#remoteDiag","",_H);
		$("#rDiag_mainPage input[name='backups_rIP_text']").val(sdomain);
		$("#rDiag_mainPage input[name='backups_rpw_password']").val("");
		$("#rDiag_mainPage").show();
		$("#rDiag_mycloud_list").hide();
		$("#rDiag_mainPage input[name='backups_rpw_password']").focus();
		
	});
	
	$("#backups_rBack12_button").unbind("click");
	$("#backups_rBack12_button").click(function(){
		$("#rDiag_mycloud").show();
		$("#rDiag_mycloud_list").hide();
	});
	
	//rDiag_mycloud_list_error's button 
	$("#backups_rBack11_button").unbind("click");
	$("#backups_rBack11_button").click(function(){
		$("#rDiag_mycloud").show();
		$("#rDiag_mycloud_list_error").hide();
	});
		
	$("#backups_rCreateJobSave_button").unbind("click");
	$("#backups_rCreateJobSave_button").click(function(){
		
		_TASK_NAME = $('#rDiag_mainPage input[name=backups_rJobName_text]').val();
		_IP=$("#rDiag_mainPage input[name='backups_rIP_text']").val();
		_RSYNC_PW=$("#rDiag_mainPage input[name='backups_rpw_password']").val();
		_RSYNC_USER = $("#rDiag_mainPage input[name='backups_rsyncName_text']").val();
		
		_S_TYPE = $('#backups_rServer_select').attr('rel');
		_KEEP_EXIST_FILE = $('#backups_rType_select').attr('rel');
		_BANDWIDTH = $('#backups_rBandwidth_select').attr('rel');
		
		_SSH_USER = $("#rDiag_mainPage input[name='backups_rSSHAccount_text']").val();
		_SSH_PW = $("#rDiag_mainPage input[name='backups_rSSHPW_password']").val();
		
		if(_S_TYPE=="1")
			_ENCRYPTION = 1;
		else
			_ENCRYPTION = getSwitch("#backups_rEncryption_switch");

		if(_KEEP_EXIST_FILE=="1") //incremental 
		{
			_KEEP_EXIST_FILE=0;
			_INCREMENTAL=1;
		}
		else
			_INCREMENTAL=0;

		if(_TASK_NAME=="")
		{
			//Enter the Job Name.
			jAlert(_T('_usb_backups','msg7'), _T('_common','error'),"",function(){
				$('#rDiag_mainPage input[name=backups_rJobName_text]').focus();
			});
			return;
		}
		for(var i=0;i < TASK.length;i++)
		{
			if(TASK[i]==_TASK_NAME)
			{
				//The task name entered already exists. Please choose a different name.
				jAlert(_T('_remote_backup','msg4'), _T('_common','error'),"",function(){
					$('#rDiag_mainPage input[name=backups_rJobName_text]').focus();
				});
				return;
			}
		}
		if(rsync_chk_name(_TASK_NAME)==1)
		{
			//The Task allow characters : "a-z" , "A-Z" , "0-9" , "-" and "_"
			jAlert(_T('_remote_backup','msg5'), _T('_common','error'),"",function(){
				$('#rDiag_mainPage input[name=backups_rJobName_text]').focus();
			});
			return;
		}


		if(_IP=="")
		{
			jAlert(_T('_remote_backup','msg24'), _T('_common','error'),"",function(){
				$('#rDiag_mainPage input[name=backups_rIP_text]').focus();
			});
			return;
		}
		
		if(chk_remote_addr()==-1) return;
		
		/*
		if(_IP.indexOf(".")!=-1)
		{
			var str=_IP.split(".");
			var j=0;
			for(i in str)
			{
				if( !isNaN(str[i])) j++;
			}
			
			if( j >3){
				if(CheckIPAddress(_IP)== -1)
					return;
			}
		}
		else if(_IP.indexOf(":")!=-1)
		{
			if(!CheckIPAddress_v6(_IP))
				return;
		}
		else
		{
			jAlert(_T('_ip','msg8'), _T('_common','error'),"",function(){
				$('#rDiag_mainPage input[name=backups_rIP_text]').focus();
			});
			return;
		}*/
			
		if(_RSYNC_PW=="")
		{
			//Please input password.
			jAlert(_T('_remote_backup','msg8'), _T('_common','error'),"",function(){
				$('#rDiag_mainPage input[name=backups_rpw_password]').focus();
			});
			return;
		}
		if (_RSYNC_PW.indexOf(" ") != -1) //find the blank space
	 	{
	 		jAlert(_T('_wizard','msg3'), _T('_common','error'),"",function(){
	 			$('#rDiag_mainPage input[name=backups_rpw_password]').focus();
	 		});
	 		return;
	 	}

		if(rsync_chk_pw(_RSYNC_PW)==1)
		{
			//The password can not include the following characters: " ' \\ ? # ` : & + \;
			jAlert(_T('_remote_backup','msg21'), _T('_common','error'),"",function(){
				$('#rDiag_mainPage input[name=backups_rpw_password]').focus();
			});
			return;
		}
		
		if(_ENCRYPTION==1)
		{
			if(_SSH_USER=="")
			{
	 			jAlert(_T('_remote_backup','msg11'), _T('_common','error'),null,function(){
	 				$("#rDiag_mainPage input[name='backups_rSSHAccount_text']").focus();
	 			});
				return;
			}
			
			if(_SSH_PW=="")
			{
				jAlert(_T('_remote_backup','msg12'), _T('_common','error'),null,function(){
					$("#rDiag_mainPage input[name='backups_rSSHPW_password']").focus();
				});
				return;
			}
		}
		
		if(_LOCAL_PATH_ARRAY.length==0)
		{
			jAlert(_T('_usb_backups','msg2'), _T('_common','error'));
			return;
		}
		
		if(_REMOTE_SHARE.length==0)
		{
			jAlert(_T('_usb_backups','msg3'), _T('_common','error'));
			return;
		}
		
		create_backup_scheudle();
		
	});
}

function rsync_chk_name_symbol(name)
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

function delete_job(idx)
{	
	var name = _Safepoints_info_array[idx].name;
	jConfirm('M',_T('_remote_backup','msg16'),_T('_remote_backup','remote_title4'),'remote',function(r){
		if(r)
		{
			jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
			
			wd_ajax({	 			   
				type: "POST",
				async: true,
				cache: false,
				url: "/cgi-bin/remote_backup.cgi",
				data:{cmd:"cgi_del_schedule",name:name},
		
			   	success: function()
			   	{
			   		get_remote_backup_list();
			   		jLoadingClose();
			   	}
			 });
		}
    });
}
function clear_item()
{
	SHARE_NODE_NAME = new Array();
	DU_SIZE = new Array();
	SHARE_PATH = new Array();
	_LOCAL_PATH_ARRAY = new Array();
	_REMOTE_VOLUME_INFO_ARRAY = new Array();
	_REMOTE_SHARE="";
		
	$("#rsync_tree_div").empty();
	$("input:text").val("");
	$("input:password").val("");
	$("input:text").inputReset();
	$("input:password").inputReset();
	$("#rDiag_mainPage").show();
	$("#rDiag_folder").hide();
	$("#rDiag_share_set").hide();
	$("#schedule_div").hide();
	$("#schedule_tr").hide();
	$("#daily_div").hide();
	$("#weekly_div").hide();
	$("#monthly_div").hide();
	$("#rDiag_mycloud").hide();
	$("#rDiag_mycloud_list").hide();
	$("#backups_rDesc_text").html("");
	$("#backups_rDesc_text").attr("title","");
	$("#backups_userName").hide();
	$("#enc1_tr,#enc2_tr").hide();
}

var ADD_JOB=1;
var EDIT_JOB=2;
var _ACTION="";
var _MAX_TOTAL_JOB=10;
function create_job()
{
	var total = _Safepoints_info_array.length;
	if(total >=_MAX_TOTAL_JOB)
	{
		jAlert(_T('_usb_backups','msg12'), _T('_common','error'));
		return;
	}
	
	clear_item();
	init_remote_dialog();

	_ACTION=ADD_JOB;	
	
	get_all_task_name();

	do_query_HD_Mapping_Info();
	
	adjust_dialog_size("#remoteDiag",750,680);
	var remoteObj=$("#remoteDiag").overlay({fixed:false,oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,
  		        		onBeforeLoad: function() {
            				setTimeout("$('#rDiag_mainPage input[name=backups_rJobName_text]').focus()",100);
            			},
						onBeforeClose: function() {	
            			}
            		});
	remoteObj.load();
	$("#remoteDiag").center();
	
	_DIALOG = remoteObj;
	
	$("#exposeMask").css("height","1500px");
}

//var SHARE_NAME = new Array();
//var DU_SIZE = new Array();
var SSH_STATUS,RSYNC_STATUS;
var S_SSH_TEST_DONE=1
var S_SSH_TEST_FAIL=2
var S_SSH_TEST_FAIL_NO_HOST=3
var S_SSH_TEST_FAIL_REFUSED=4
var S_SSH_TEST_FAIL_DENY=5
var S_SSH_KEY_CHANGE=6
 
var S_RSYNC_TEST_DONE=101
var S_RSYNC_TEST_FAIL=102
var S_RSYNC_TEST_FAIL_NO_HOST=103
var S_RSYNC_TEST_FAIL_REFUSED=104
var S_RSYNC_REMOTE_PATH_NOT_EXIST=105
var S_RSYNC_REMOTE_SHARE_READONLY=106
var S_RSYNC_MODULE_NOT_EXIST=107
var S_RSYNC_PASSWD_FAIL=108
var S_RSYNC_NO_SPACE = 111

var _S_TYPE=""; //1:nas to nas 2:Nas to Linux
var _DIRECTION="";
var _TASK_NAME="";
var _REMOTE_SHARE="",_REMOTE_SHARE_PATH ="";
var _KEEP_EXIST_FILE="";
var _RSYNC_USER="",_RSYNC_PW="";
var _INCREMENTAL="",_INC_NUM="";
var _SSH_USER="",_SSH_PW="";
var _ENCRYPTION="";
var _IP="",_PW="";
var _LOCAL_HD_FREE_SIZE="";
var _REMOTE_HD_A2_FREE_SIZE="",_REMOTE_HD_B2_FREE_SIZE="";
var _REMOTE_HD_C2_FREE_SIZE="",_REMOTE_HD_D2_FREE_SIZE="";
var _LOCAL_DIR_USED_SIZE="";
var _BANDWIDTH="";
var SHARE_NODE_NAME = new Array();
var DU_SIZE = new Array();
var SHARE_PATH = new Array();
var _LOCAL_PATH_ARRAY = new Array();
var _LOCAL_SHARE_ARRAY = new Array();
var _REMOTE_VOLUME_INFO_ARRAY = new Array();
function check_server()
{
	$("#remote_shareinfo").hide();
	_TASK_NAME = $('#rDiag_mainPage input[name=backups_rJobName_text]').val();
	_IP=$("#rDiag_mainPage input[name='backups_rIP_text']").val();
	_RSYNC_PW=$("#rDiag_mainPage input[name='backups_rpw_password']").val();
	_RSYNC_USER = $("#rDiag_mainPage input[name='backups_rsyncName_text']").val();
	
	_S_TYPE = $('#backups_rServer_select').attr('rel');
	_KEEP_EXIST_FILE = $('#backups_rType_select').attr('rel');
	_BANDWIDTH = $('#backups_rBandwidth_select').attr('rel');
	
	_SSH_USER = $("#rDiag_mainPage input[name='backups_rSSHAccount_text']").val();
	_SSH_PW = $("#rDiag_mainPage input[name='backups_rSSHPW_password']").val();
	
	if(_S_TYPE=="1")
		_ENCRYPTION = 1;
	else
		_ENCRYPTION = getSwitch("#backups_rEncryption_switch");
			

	_DIRECTION = 1;//default: local to remote

	if(_KEEP_EXIST_FILE=="1") //incremental 
	{
		_KEEP_EXIST_FILE=0;
		_INCREMENTAL=1;
	}
	else
		_INCREMENTAL=0;
	
	/*var s = "ip=" + _IP + "\npw=" + _PW + "\ns_type=" + _S_TYPE;
		s += "\ndirection=" + _DIRECTION +"\ntask_name="  + _TASK_NAME;
		s += "\npath=" + _LOCAL_PATH + "\nkeep_exist_file="+_KEEP_EXIST_FILE 
		s += "\nincremental=" + _INCREMENTAL +"\nencryption=" + _ENCRYPTION
		s += "\nrsync_user=" + _RSYNC_USER + "\nrsync_pw" + _RSYNC_PW 
		s += "\nssh_user=" + _SSH_USER + "\nssh_pw=" +  _SSH_PW 
		s += "\ninc_num=" + _INC_NUM*/
	//alert(s)
		
	SHARE_NODE_NAME = new Array();
	DU_SIZE = new Array();
	SHARE_PATH = new Array();
	_LOCAL_PATH_ARRAY = new Array();
	_REMOTE_VOLUME_INFO_ARRAY = new Array();
	
	var obj_id = "#rsync_tree_div";
	
	$( obj_id ).find("input:checkbox:checked:not([disabled])").each(function(index){
		_LOCAL_PATH_ARRAY.push($(this).val());
	});

	$("#rDiag_share_set").show();
	$("#rDiag_mainPage").hide();
	var str = "<img border='0' src='/web/images/SpinnerSun.gif' width='18' height='18'>" + "&nbsp;&nbsp;" + _T('_remote_backup','wait');
	$("#rsync_test_info").show();
	$("#rsync_test_info").html(str);
	$("#backups_rNext5_button").hide();
	$("#f_share_name").html("");
	
 	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/remote_backup.cgi",
		data:{cmd:"cgi_server_test",ip:_IP,s_type:_S_TYPE,direction:_DIRECTION,
			task:_TASK_NAME,keep_exist_file:_KEEP_EXIST_FILE,local_path:_LOCAL_PATH_ARRAY.toString().replace(/,/g,':'),
			incremental:_INCREMENTAL,encryption:_ENCRYPTION,rsync_user:_RSYNC_USER,
			rsync_pw:_RSYNC_PW,ssh_user:_SSH_USER,ssh_pw:_SSH_PW,inc_num:_INC_NUM,bandwidth:_BANDWIDTH
			},
		dataType: "xml",
		success: function(xml){
			
				SSH_STATUS = $(xml).find('ssh_test_status').text();
				RSYNC_STATUS = $(xml).find('rsync_test_status').text();
				
				if(_S_TYPE==1)//nas to nas
				{
					_LOCAL_HD_FREE_SIZE = $(xml).find('local_free_size').text();
	
					_REMOTE_HD_A2_FREE_SIZE = $(xml).find('remote_hd_a2_free_size').text();
					_REMOTE_HD_B2_FREE_SIZE = $(xml).find('remote_hd_b2_free_size').text();
					_REMOTE_HD_C2_FREE_SIZE = $(xml).find('remote_hd_c2_free_size').text();
					_REMOTE_HD_D2_FREE_SIZE = $(xml).find('remote_hd_d2_free_size').text();
					_LOCAL_DIR_USED_SIZE=$(xml).find('local_directory_used_size').text();
					_REMOTE_VOLUME_INFO_ARRAY.push ($(xml).find('v1_info').text());
					_REMOTE_VOLUME_INFO_ARRAY.push ($(xml).find('v2_info').text());
					_REMOTE_VOLUME_INFO_ARRAY.push ($(xml).find('v3_info').text());
					_REMOTE_VOLUME_INFO_ARRAY.push ($(xml).find('v4_info').text());
					
					//alert("rsync="+RSYNC_STATUS+"\nssh="+SSH_STATUS +"\nlocal="+_LOCAL_HD_FREE_SIZE + "\nremote_a=" + _REMOTE_HD_A2_FREE_SIZE + "\nremote_b2=" + _REMOTE_HD_B2_FREE_SIZE)
					$(xml).find('share_node').each(function(){
						SHARE_NODE_NAME.push($(this).find('name').text());
						DU_SIZE.push($(this).find('du_size').text());
						SHARE_PATH.push($(this).find('path').text());
					});
				}
				else
				{
					//alert("rsync="+RSYNC_STATUS+"\nssh="+SSH_STATUS)
					$(xml).find('share_node').each(function(){
						SHARE_NODE_NAME.push($(this).find('name').text());
					});
					_LOCAL_HD_FREE_SIZE = $(xml).find('local_free_size').text();
					_LOCAL_DIR_USED_SIZE=$(xml).find('local_directory_used_size').text();
					//alert("_LOCAL_HD_FREE_SIZE="+_LOCAL_HD_FREE_SIZE+"_LOCAL_DIR_USED_SIZE=" + _LOCAL_DIR_USED_SIZE)
				}
				if(SSH_STATUS==0)
					SSH_STATUS=S_SSH_TEST_DONE;
					
				if(SSH_STATUS!=S_SSH_TEST_DONE || RSYNC_STATUS!=S_RSYNC_TEST_DONE)
				{
					var s="",str="";
					var msg=""
					if(_S_TYPE==2) //nas to Linux
					{
						if(RSYNC_STATUS!=S_RSYNC_TEST_DONE)
						{
							//RSYNC Test Result : Failed
							msg = get_result_text(RSYNC_STATUS);
							//msg = _T('_remote_backup','msg34');
						}
					}
					else	//nas to nas
					{
						if(SSH_STATUS==S_SSH_TEST_DONE)
						{
							//SSH Test Result: Successfully
						}
						else
						{
							//SSH Test Result : Failed
							msg = get_result_text(SSH_STATUS)+"<br><br>";
						}
						
						//RSYNC Test Result : Failed
						msg += get_result_text(RSYNC_STATUS);
						
						/*if(SSH_STATUS!=S_SSH_TEST_DONE || RSYNC_STATUS!=S_RSYNC_TEST_DONE)
						{
							msg = _T('_remote_backup','msg34');
						}*/
					}
					
					$("#test_info").html("");
					jAlert( msg , _T('_common','error'));

					$("#rDiag_share_set").hide();
					$("#rDiag_mainPage").show();
					$("#backups_rNext5_button").show();
					adjust_dialog_size("#remoteDiag","",_H);
				}
				else
				{
					show_remote_smb_list()
					$("#rsync_test_info").html("");
					$("#backups_rNext5_button").show();
					$("#backups_rNext5_button").removeClass('gray_out').addClass('gray_out');
				}
		}

	});
	if(SSH_STATUS!=S_SSH_TEST_DONE || RSYNC_STATUS!=S_RSYNC_TEST_DONE)
		return -1;
}

function chk_hdd_free_size(value)
{	
	$("#size_info").css("color","#cccccc");
	$("#size_info").removeClass("OK").removeClass("error1").removeClass("error2");
	$("#backups_rNext5_button").show();
	document.getElementById("rsync_test_info").innerHTML = "";

	if(value=="null")
	{
		document.getElementById("size_info").innerHTML = "";
		return;
	}

		//local to remote
		//ÀË¬dremoteºÝ,hdd size°÷¤£°÷¦s
		var path=value;
		
		var size=_LOCAL_DIR_USED_SIZE;

		var folder_size="";
		if(size.indexOf("k") != -1)
		{
			folder_size=size.split("k")[0];
		}
							
		if(size.indexOf("M") != -1)
		{
			folder_size=size.split("M")[0] * 1024;
		}
	
		if(size.indexOf("G") != -1)
		{
			folder_size=size.split("G")[0] * 1024 * 1024;
		}
		
		var hdd_free="";
		var remote_free="";remote_size="";
		if(path.indexOf("HD_a2")!=-1)
		{
			remote_free =_REMOTE_HD_A2_FREE_SIZE;
			remote_size = _REMOTE_HD_A2_FREE_SIZE;
		}
		else if(path.indexOf("HD_b2")!=-1)
		{
			remote_free =_REMOTE_HD_B2_FREE_SIZE;
			remote_size = _REMOTE_HD_B2_FREE_SIZE;
		}
		else if(path.indexOf("HD_c2")!=-1)
		{
			remote_free =_REMOTE_HD_C2_FREE_SIZE;
			remote_size = _REMOTE_HD_C2_FREE_SIZE;
		}	
		else if(path.indexOf("HD_d2")!=-1)
		{
			remote_free =_REMOTE_HD_D2_FREE_SIZE;
			remote_size = _REMOTE_HD_D2_FREE_SIZE;
		}	
		if(remote_free.indexOf("k") != -1)
		{
			hdd_free=remote_free.split("k")[0];
		}
							
		if(remote_free.indexOf("M") != -1)
		{
			hdd_free=remote_free.split("M")[0] * 1024;
		}
	
		if(remote_free.indexOf("G") != -1)
		{
			hdd_free=remote_free.split("G")[0] * 1024 * 1024;
		}

		var source =_T('_remote_backup','msg19')	//Source used size
		var dest = _T('_remote_backup','msg20')
		var s = source + " : "  + _LOCAL_DIR_USED_SIZE + "<br>";
			s += dest+ " : " + remote_size;
		
		//$("#size_info").html(s);
		
		if(parseInt(hdd_free,10)< parseInt(folder_size,10))
		{
			jAlert(_T('_remote_backup','msg14'), _T('_common','error'));
			$("#size_info").css('color','#FF0000');
			$("#size_info").addClass("error2");
			$("#backups_rNext5_button").hide();
		}
		else
			$("#size_info").addClass("OK");
}
function check_rsync_rw()	//new_folder: 0 or 1
{
	//console.log("check_rsync_rw : remote_path=[%s]",remote_path);
	adjust_dialog_size("#remoteDiag","",_H);
	jLoading(_T('_common','wait'), 'Wait' ,'s',""); //msg,title,size,callback
	wd_ajax({ 
		type: "POST",
		cache: false,
		url: "/cgi-bin/remote_backup.cgi",
		data:{cmd:"cgi_check_rsync_rw",ip:_IP,s_type:_S_TYPE,direction:_DIRECTION,
			task:"TEST",keep_exist_file:_KEEP_EXIST_FILE,local_path:_LOCAL_PATH_ARRAY.toString().replace(/,/g,":"),
			incremental:_INCREMENTAL,encryption:_ENCRYPTION,rsync_user:_RSYNC_USER,
			rsync_pw:_RSYNC_PW,ssh_user:_SSH_USER,ssh_pw:_SSH_PW,inc_num:_INC_NUM,
			remote_path:_REMOTE_SHARE,new_folder:_NEWFOLDER,remote_new_path:_REMOTE_SHARE_PATH
			},
		dataType: "xml",
	   	success: function(xml)
	   	{
	   		jLoadingClose(function(){
				rsync_ret = $(xml).find('rsync_ret').text();
				if(rsync_ret!=S_RSYNC_TEST_DONE)
				{
					jAlert(_T('_remote_backup','msg23'), _T('_common','error'));
					$("#backups_rDesc_text").html("");
					$("#backups_rDesc_text").removeClass("TooltipIcon");
					$("#backups_rDesc_text").attr("title" , "");
					//init_tooltip();
					return;
	   			}
	   			else
	   			{
				$("#backups_rDesc_text").html(_REMOTE_SHARE);
					$("#backups_rDesc_text").removeClass("TooltipIcon").addClass("TooltipIcon");
				$("#backups_rDesc_text").attr("title" , _REMOTE_SHARE);
				init_tooltip();
				$("#rDiag_mainPage").show();
				$("#rDiag_share_set").hide();
				}
	 		});
	   	}
	 });
}

function show_schedule_type_div(s_type)
{
	$("#daily_div").hide();
	$("#week_div").hide();
	$("#month_div").hide();
	
	switch(s_type)
	{
		case '3':	//daily
			$("#daily_div").show();
			break;
		case '2':	//weekly
			$("#week_div").show();
			break;
		case '1':	//monthly
			$("#month_div").show();
			break;
	}
}
_SELECT_ITEMS  = new Array("f_month_div","f_hour_div","f_hour_div2");
function write_schedule_option()
{
	write_am_pm_select("backups_rDailyAMPM_select","#daily_am_pm_select");
	write_am_pm_select("backups_rWeeklyAMPM_select","#weekly_am_pm_select");
	write_am_pm_select("backups_rMonthlyAMPM_select","#monthly_am_pm_select");
	
	//month
	var option = "";
	option += '<ul>';
	option += '<li class="option_list">';          
	option += '<div id="f_month_div" class="wd_select option_selected">';
	option += '<div class="sLeft wd_select_l"></div>';
	option += '<div class="sBody text wd_select_m" id="f_month" rel="0">'+ "00" +'</div>';
	option += '<div class="sRight wd_select_r"></div>';
	option += '</div>';
	option += '<ul class="ul_obj">';
	option += "<div class='scrollbar_time'>";
	
	for(var i=1 ;i<=12;i++)
	{
		var s = i;
		if(i<=9) s ="0" + i;

		if(i==1)
			option += "<li rel='" + s + "' class='li_start'> <a href='#'>" + s + "</a></li>";
		else if(i==12)
			option += "<li rel='" + s + "' class='li_end'> <a href='#'>" + s + "</a></li>";
		else
			option += "<li rel='" + s + "'> <a href='#'>" + s + "</a></li>";
	}
	option += "</div>";
	option += "</ul>";
	option += "</li>";
	option += "</ul>";
				
	$("#month_select").html(option);

	$("#month_select .option_list ul").css("width","90px");
	$("#month_select .option_list ul li").css("width","80px");
				

	var AM = "&nbsp;"+_T('_backup','desc10');
	var PM = "&nbsp;"+_T('_backup','desc11');
	var start;
	var end;
	if(_SCHEDULE_TIME_FORMAT==12)
	{
		start = 1;
		end = 12;
	}
	else
	{
		start = 0;
		end = 23;
	}
				
	//hour
	option = "";
	option += '<ul>';
	option += '<li class="option_list">';          
	option += '<div id="f_hour_div" class="wd_select option_selected">';
	option += '<div class="sLeft wd_select_l"></div>';
	option += '<div class="sBody text wd_select_m" id="backups_rHour_select" rel="' + start + '">'+ start +":00" +'</div>';
	option += '<div class="sRight wd_select_r"></div>';
	option += '</div>';
	option += '<ul class="ul_obj">';	
	option += "<div class='scrollbar_time'>";

	write_li(start,end);
	
	option += "</div>";
	option += "</ul>";
	option += "</li>";
	option += "</ul>";	
	$("#hour_select").html(option);
	$("#hour_select .option_list ul").css("width","90px");
	$("#hour_select .option_list ul li").css("width","80px");
	//hour
	option = "";
	option += '<ul>';
	option += '<li class="option_list">';          
	option += '<div id="f_hour_div2" class="wd_select option_selected">';
	option += '<div class="sLeft wd_select_l"></div>';
	option += '<div class="sBody text wd_select_m" id="backups_rHour2_select" rel="' + start + '">'+ start +":00" +'</div>';
	option += '<div class="sRight wd_select_r"></div>';
	option += '</div>';
	option += '<ul class="ul_obj">';
	option += "<div class='scrollbar_time'>";
	write_li(start,end);

	option += "</div>";
	option += "</ul>";
	option += "</li>";
	option += "</ul>";	
	$("#hour_select2").html(option);
	$("#hour_select2 .option_list ul").css("width","90px");
	$("#hour_select2 .option_list ul li").css("width","80px");
	//hour
	option = "";
	option += '<ul>';
	option += '<li class="option_list">';          
	option += '<div id="f_hour_div3" class="wd_select option_selected">';
	option += '<div class="sLeft wd_select_l"></div>';
	option += '<div class="sBody text wd_select_m" id="backups_rHour3_select" rel="' + start + '">'+ start +":00" +'</div>';
	option += '<div class="sRight wd_select_r"></div>';
	option += '</div>';
	option += '<ul class="ul_obj">';
	option += "<div class='scrollbar_time'>";
	write_li(start,end);

	option += "</div>";
	option += "</ul>";
	option += "</li>";
	option += "</ul>";	
	$("#hour_select3").html(option);
	$("#hour_select3 .option_list ul").css("width","90px");
	$("#hour_select3 .option_list ul li").css("width","80px");
	
	//min
	option = "";
	option += '<ul>';
	option += '<li class="option_list">';          
	option += '<div id="f_min_div" class="wd_select option_selected">';
	option += '<div class="sLeft wd_select_l"></div>';
	option += '<div class="sBody text wd_select_m" id="f_min" rel="0">'+ "00" +'</div>';
	option += '<div class="sRight wd_select_r"></div>';
	option += '</div>';
	option += '<ul class="ul_obj">';
	
	for(var i=0 ;i<=59;i++)
	{
		var s = i;
		if(i<=9) s ="0" + i

		if(i==0)
			option += "<li rel='" + s + "' class='li_start'> <a href='#'>" + s + "</a></li>";
		else if(i==59)
			option += "<li rel='" + s + "' class='li_end'> <a href='#'>" + s + "</a></li>";
		else
			option += "<li rel='" + s + "'> <a href='#'>" + s + "</a></li>";
	}
	$("#min_select").html(option);

	//weekly
	option = "";
	option += '<ul>';
	option += '<li class="option_list">';          
	option += '<div id="f_week_div" class="wd_select option_selected">';
	option += '<div class="sLeft wd_select_l"></div>';
	option += '<div class="sBody text wd_select_m" id="backups_rWeek_select" rel="1">'+ _T('_mail','mon') +'</div>';
	option += '<div class="sRight wd_select_r"></div>';
	option += '</div>';
	option += '<ul class="ul_obj">';
	option += "<div>";
	option += "<li rel='1' class='li_start'> <a href='#'>" + _T('_mail','mon') + "</a></li>";
	option += "<li rel='2'> <a href='#'>" + _T('_mail','tue') + "</a></li>";
	option += "<li rel='3'> <a href='#'>" + _T('_mail','wed') + "</a></li>";
	option += "<li rel='4'> <a href='#'>" + _T('_mail','thu') + "</a></li>";
	option += "<li rel='5'> <a href='#'>" + _T('_mail','fri') + "</a></li>";
	option += "<li rel='6'> <a href='#'>" + _T('_mail','sat') + "</a></li>";
	option += "<li rel='0' class='li_end'> <a href='#'>" + _T('_mail','sun') + "</a></li>";
	option += "</div>";
	option += "</ul>";
	option += "</li>";
	option += "</ul>";	
  	$("#weekly_select").html(option);
  	
  	//day
	option = "";
	option += '<ul>';
	option += '<li class="option_list">';          
	option += '<div id="f_day_div" class="wd_select option_selected">';
	option += '<div class="sLeft wd_select_l"></div>';
	option += '<div class="sBody text wd_select_m" id="backups_rDay_select" rel="1">'+ "1" +'</div>';
	option += '<div class="sRight wd_select_r"></div>';
	option += '</div>';
	option += '<ul class="ul_obj">';
	option += "<div class='scrollbar_time'>";
	for(var i=1 ;i<=28;i++)
	{
		var s = i;

		if(i==1)
			option += "<li rel='" + s + "' class='li_start'> <a href='#'>" + s + "</a></li>";
		else if(i==28)
			option += "<li rel='" + s + "' class='li_end'> <a href='#'>" + s + "</a></li>";
		else
			option += "<li rel='" + s + "'> <a href='#'>" + s + "</a></li>";
	}  	
	option += "</div>";
	option += "</ul>";
	option += "</li>";
	option += "</ul>";	
  	$("#day_select").html(option);
	$("#day_select .option_list ul").css("width","90px");
	$("#day_select .option_list ul li").css("width","80px");  		
	init_select();								
	hide_select(); 
	
	function write_li(start,end)
	{
		for (var i = start;i<= end ;i++)
		{
			if(i==start)
				option+="<li class=\"li_start\" rel=\""+i+"\"><a href='#'>"+i+":00</a>";		
			else if(i==end)
				option+="<li class=\"li_end\" rel=\""+i+"\"><a href='#'>"+i+":00</a>";
			else
				option+="<li rel=\""+i+"\"><a href='#'>"+i+":00</a>";	
		}		
	} 	
}

function create_backup_scheudle()
{
	//jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
	var backup_now =1; //default: always backup now 
	var schedule_type = getSwitch('#backups_rAutoupdate_switch');
	var backup_with_ssh = getSwitch('#backups_rBackupWithSSH_switch');
	
	if(schedule_type==0)
	{
		schedule_type =1;	//Manual
	}
	else
	{
		schedule_type = 3;	//schedule
	}

	var crond_type=$('#s_type').attr('rel');
	
	var minute="",hour="",weekly="",day="",month="";
	if(schedule_type==2)	//once
	{
		day=$("#once_div select[name='backups_rDay_select']").val();
		minute=$("#once_div select[name='f_min']").val();
		hour=$("#once_div select[name='f_hour']").val();
		month=$("#once_div select[name='f_month']").val();
	}
	else
	{
		/*day=$("#schedule_div select[name='backups_rDay_select']").val();
		minute=$("#schedule_div select[name='f_min']").val();
		hour=$("#schedule_div select[name='f_hour']").val();
		weekly=$("#schedule_div select[name='backups_rWeek_select']").val();	*/
		
		if(crond_type==3)
		{
			//daily
			hour = $("#backups_rHour_select").attr('rel');
			minute=0;
		}
		else if(crond_type==2)
		{
			//weekly
			weekly=$("#backups_rWeek_select").attr('rel');
			hour = $("#backups_rHour2_select").attr('rel');
			minute=0;
			
		}
		else if(crond_type==1)
		{
			//monthly
			day = $("#backups_rDay_select").attr('rel');
			hour = $("#backups_rHour3_select").attr('rel');
			minute=0;
		}
	}
	
	hour = map_h(hour,crond_type);
	
 	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/remote_backup.cgi",
		data:{cmd:"cgi_set_schedule",ip:_IP,s_type:_S_TYPE,direction:_DIRECTION,
			task:_TASK_NAME,keep_exist_file:_KEEP_EXIST_FILE,local_path:_LOCAL_PATH_ARRAY.toString().replace(/,/g,":"),
			incremental:_INCREMENTAL,encryption:_ENCRYPTION,rsync_user:_RSYNC_USER,
			rsync_pw:_RSYNC_PW,ssh_user:_SSH_USER,ssh_pw:_SSH_PW,inc_num:_INC_NUM,
			backup_now:backup_now,remote_path:_REMOTE_SHARE,schedule_type:schedule_type,
			crond_type:crond_type,minute:minute,hour:hour,weekly:weekly,day:day,
			month:month,type:_ACTION,bandwidth:_BANDWIDTH,backup_with_ssh:backup_with_ssh
			},
		success: function(data){
			_DIALOG.close();
			_DIALOG="";
			setTimeout("get_remote_backup_list()",5000);
			setTimeout("jLoadingClose()",6000);
			
			var s = $("#backups_rServer_select").attr('src');
			if(s=="1")
			{
				google_analytics_log('rmt-ip-created-num');
			}
			else
			{
				google_analytics_log('rmt-mycloud-created-num');
			}
			
		}
	});
}

var _MODIFY_ARRAY={job_name:"",remote_ip:"",server_type:"",direction:"",
					use_ssh:"",keep_exist_file:"",inc_backup:"",
					inc_number:"",local_path:"",rsync_user:"",rsync_pw:"",
					ssh_user:"",ssh_pw:""}

function get_modify_info(name)
{	
	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/remote_backup.cgi",
		data:{cmd:"cgi_get_modify_info",name:name},
		dataType: "xml",
	   	success: function(xml)
	   	{
	   		var job_name = $(xml).find('job_name').text();
	   		var remote_ip = $(xml).find('remote_ip').text();
	   		var server_type = $(xml).find('server_type').text();	//1:nas to nas 2:nas to linux
	   		var direction = $(xml).find('backup_type').text();	//direction 1:local to remote 2:remote to local
	   		var schedule_mode = $(xml).find('schedule_mode').text();	//1:Manual 2:once 3:scheduler
	   		var use_ssh = $(xml).find('use_ssh').text();
	   		var keep_exist_file = $(xml).find('keep_exist_file').text();
	   		var inc_backup = $(xml).find('inc_backup').text();
	   		var inc_number = $(xml).find('inc_number').text();
	   		var schedule = $(xml).find('schedule').text();
	   		var local_path = $(xml).find('local_path').text();
	   		var rsync_user = $(xml).find('rsync_user').text();
	   		var rsync_pw = $(xml).find('rsync_pw').text();
	   		var ssh_user = $(xml).find('ssh_user').text();
	   		var ssh_pw = $(xml).find('ssh_pw').text();
	   		//var folder_size = $(xml).find('folder_size').text();
	   		var last_update = $(xml).find('last_updated').text();
	   		var real_local_path = $(xml).find('real_local_path').text();
	   		var remote_path = $(xml).find('remote_path').text();
	   		var backup_status = $(xml).find('backup_status').text();
	   		var recover_last_update = $(xml).find('recover_last_updated').text();
	   		var recover_status = $(xml).find('recover_status').text();
	   		_MODIFY_ARRAY.job_name = job_name;
	   		_MODIFY_ARRAY.remote_ip = remote_ip;
	   		_MODIFY_ARRAY.server_type = server_type;
	   		_MODIFY_ARRAY.direction = direction;
	   		_MODIFY_ARRAY.use_ssh = use_ssh;
	   		_MODIFY_ARRAY.keep_exist_file = keep_exist_file;
	   		_MODIFY_ARRAY.inc_backup = inc_backup;
	   		_MODIFY_ARRAY.inc_number = inc_number;
	   		_MODIFY_ARRAY.local_path = real_local_path;
	   		_MODIFY_ARRAY.rsync_user = rsync_user;
	   		_MODIFY_ARRAY.rsync_pw = rsync_pw;
	   		_MODIFY_ARRAY.ssh_user = ssh_user;
	   		_MODIFY_ARRAY.ssh_pw = ssh_pw;
	   		_MODIFY_ARRAY.remote_path = remote_path;
	   		_MODIFY_ARRAY.last_update = last_update;
	   		_MODIFY_ARRAY.backup_status = backup_status;
	   		_MODIFY_ARRAY.recover_last_update = recover_last_update;
	   		_MODIFY_ARRAY.recover_status = recover_status;
	   		//_MODIFY_ARRAY.folder_size = folder_size;
	   	}
	});
}

var _RECOVER_NAME="";
function get_recovery_info(jobName)
{		
	_RECOVER_NAME = jobName;
	
	wd_ajax({
		type: "POST",
		cache: false,
		url: "/web/php/remoteBackups.php",
		data:{cmd:"getRecoverItems",jobName:jobName},
		dataType: "xml",
	   	success: function(xml)
	   	{
	   		var sRecover = _T('_remote_backup','recover');
	   		var num,date_time,full_path,str="";
			var ul_obj = document.createElement("ul");
			if($(xml).find('backup').length==0)
			{
				$("#restore_listDiv").html(_T('_common','no_items'));
			}
			else
			{
				$(xml).find('backup').each(function(idx){
					var task_name = $(this).find('task_name').text();
					var seconds = $(this).find('time').text();
					// multiply by 1000 because Date() requires miliseconds
					var date = new Date(seconds * 1000);
					date = multi_lang_format_time(date);
					
					var li_obj = document.createElement("li");
					var _id = 'backups_rRecover'+idx + "_button";
					var buttonObj = String.format('<input type="button" name="{0}" id="{1}" onclick="do_recover(\'{2}\',\'{3}\')" value="{4}">',
						 			_id , _id , jobName , task_name ,sRecover);
					
					$(li_obj).append('<div class="dateTime">' + date +'</div>');
					$(li_obj).append('<div class="btn">' + buttonObj +'</div>');
					
					$(ul_obj).append($(li_obj));
				});
				
				$("#restore_listDiv").html($(ul_obj));
			}
						
			adjust_dialog_size("#recoverDiag", 670, 530);
			var rObj=$("#recoverDiag").overlay({fixed:false,oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
			rObj.load();
			$("#recoverDiag").center();
			_DIALOG = rObj;
			$("#rDiag .dialog_content").height(360);
			$("#rDiag .dialog_content").jScrollPane({autoReinitialise: true});
		}
	});		
}

function rsync_chk_name(name)
{
	//return 1:	not a valid name
	var re=/[^a-zA-Z0-9_-]/;
	if(re.test(name))
		return 1;
	else
		return 0;
}
function substr_count (haystack, needle, offset, length)
{
    var pos = 0, cnt = 0;

    haystack += '';
    needle += '';
    if (isNaN(offset)) {offset = 0;}
    if (isNaN(length)) {length = 0;}
    offset--;

    while ((offset = haystack.indexOf(needle, offset+1)) != -1){
        if (length > 0 && (offset+needle.length) > length){
            return false;
        } else{
            cnt++;
        }
    }

    return cnt;
}

// test_ipv4
// Test for a valid dotted IPv4 address
// Ported from: http://www.dijksterhuis.org/regular-expressions-csharp-practical-use/

function test_ipv4(ip)
{
   var match = ip.match(/(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|255[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/);
   return match != null;
}
function CheckIPAddress_v6(ip)
{
	// test_ipv6
	// Test if the input is a valid ipv6 address. Javascript version of an original PHP function.
	// Ported from: http://crisp.tweakblogs.net/blog/2031

	// Test for empty address
	if (ip.length<3)
	{
		//return ip == "::";
		jAlert(_T('_remote_backup','msg24'), _T('_common','error'),"",function(){
			$('#rDiag_mainPage input[name=backups_rIP_text]').focus();
		});
		return false;
	}
	
	// Check if part is in IPv4 format
	if (ip.indexOf('.')>0)
	{
	    lastcolon = ip.lastIndexOf(':');
	
	    if (!(lastcolon && test_ipv4(ip.substr(lastcolon + 1))))
	    {
	    	jAlert(_T('_ip','msg8'), _T('_common','error'),"",function(){
	    		$('#rDiag_mainPage input[name=backups_rIP_text]').focus();
	    	});
	        return false;
	    }
	
	    // replace IPv4 part with dummy
	    ip = ip.substr(0, lastcolon) + ':0:0';
	}
	
	// Check uncompressed
	if (ip.indexOf('::')<0)
	{
		var match = ip.match(/^(?:[a-f0-9]{1,4}:){7}[a-f0-9]{1,4}$/i);
		
		if(match==null)
		{
			jAlert(_T('_ip','msg8'), _T('_common','error'),"",function(){
				$('#rDiag_mainPage input[name=backups_rIP_text]').focus();
			});
		}	
		return match != null;
	}
	
	// Check colon-count for compressed format
	if (substr_count(ip, ':'))
	{
		var match = ip.match(/^(?::|(?:[a-f0-9]{1,4}:)+):(?:(?:[a-f0-9]{1,4}:)*[a-f0-9]{1,4})?$/i);
		
		if(match==null)
		{
			jAlert(_T('_ip','msg8'), _T('_common','error'),"",function(){
				$('#rDiag_mainPage input[name=backups_rIP_text]').focus();
			});
		}
			
		return match != null;
	}
	
	// Not a valid IPv6 address
	return false;
}
function CheckIPAddress(ipaddr)
{

	if ( validKey( ipaddr ) == 0 )
	{
		jAlert(_T('_ip','msg3'), _T('_common','error'),"",function(){
			$('#rDiag_mainPage input[name=backups_rIP_text]').focus();
		});
		return -1;
	}		
	
	if(ipaddr==_LOCAL_IP)
	{
		jAlert(_T('_remote_backup','msg24'), _T('_common','error'),"",function(){
			$('#rDiag_mainPage input[name=backups_rIP_text]').focus();
		});
		return -1;
	}
		
	var tmp = ipaddr.split(".").length;
	if(tmp!=4)
	{
		jAlert(_T('_ip','msg8'), _T('_common','error'),"",function(){
			$('#rDiag_mainPage input[name=backups_rIP_text]').focus();
		});
		return -1;
	}
	var addr_tmp = ipaddr.split(".")
	if(addr_tmp[0]=="127")
	{
		jAlert(_T('_ip','msg8'), _T('_common','error'),"",function(){
			$('#rDiag_mainPage input[name=backups_rIP_text]').focus();
		});
		return -1;
	}
	if ( !checkIP(ipaddr, 1, 1, 223) )
	{
		jAlert( _T('_ip','msg4'), _T('_common','error'),"",function(){
			$('#rDiag_mainPage input[name=backups_rIP_text]').focus();
		});
		return -1;
	}
	if ( !checkIP(ipaddr, 2, 0, 255) )
	{
		jAlert(_T('_ip','msg5'), _T('_common','error'),"",function(){
			$('#rDiag_mainPage input[name=backups_rIP_text]').focus();
		});
		return -1;
	}
	if ( !checkIP(ipaddr, 3, 0, 255) )
	{
		jAlert(_T('_ip','msg6'), _T('_common','error'),"",function(){
			$('#rDiag_mainPage input[name=backups_rIP_text]').focus();
		});
		return -1;
	}
	if ( !checkIP(ipaddr, 4, 1, 254) )
	{
		jAlert(_T('_ip','msg7'), _T('_common','error'),"",function(){
			$('#rDiag_mainPage input[name=backups_rIP_text]').focus();
		});
		return -1;
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
var TASK = new Array();

function get_all_task_name()
{
	TASK = new Array();
	
	wd_ajax({ 
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/remote_backup.cgi",
		data:{cmd:"cgi_get_all_task_name"},
		dataType: "xml",
	   	success: function(xml)
	   	{
			$(xml).find('task').each(function(){
				TASK.push($(this).find('name').text());
			});
	   	}
	 });	
}
function rsync_chk_pw(pw)
{
	//return 1:	not a valid pw
	var re=/["'\\?#`:&+\;]/;

	if(re.test(pw))
 		return 1;
 	else
		return 0;
}

function get_result_text(val)
{ 
	var str="";
	switch(parseInt(val,10))
	{
		case S_SSH_TEST_FAIL:
			str =  _T('_remote_backup','f1')//'SSH Test Failed'
			break;
		case S_SSH_TEST_FAIL_NO_HOST:
			str = _T('_remote_backup','f2')//'Unknown SSH Host'
			break;
		case S_RSYNC_TEST_FAIL_REFUSED:
			str = _T('_remote_backup','f3')//'SSH Refused'
			break;
		case S_SSH_TEST_FAIL_DENY:
			str = _T('_remote_backup','f4')//'SSH Deny Access'
			break;
		case S_SSH_KEY_CHANGE:
			str = _T('_remote_backup','f5')//'SSH Key Change Failed'
			break;
		case S_RSYNC_TEST_FAIL:
			str = _T('_remote_backup','f6')//'RSYNC Test Failed'
			break;
		case S_RSYNC_TEST_FAIL_NO_HOST:
			str = _T('_remote_backup','f7')//'RSYNC Server Refused'
			break;
		case S_RSYNC_REMOTE_PATH_NOT_EXIST:
			str = _T('_remote_backup','f8')//'Remote Path Not Exist'
			break;
		case S_RSYNC_REMOTE_SHARE_READONLY:
			str = _T('_remote_backup','f9')//'Remote Share Read Only'
			break;
		case S_RSYNC_MODULE_NOT_EXIST:
			str = _T('_remote_backup','f10')//'RSYNC Module Not Exist'
			break;
		case S_RSYNC_PASSWD_FAIL:
			str = _T('_remote_backup','f11')//'Password Failed'
			break;
		default:
			str = _T('_remote_backup','f12')//'Unknown Reason Failed'
			break;
	}

	return str;
}

function SetScheduleMode(obj,val,ftype)
{
	$(obj).attr('rel',val);	//init rel value
	$( obj + " > button").each(function(index){
		if($(this).val()==val) 
			$(this).addClass('buttonSel');
		else
			$(this).removeClass('buttonSel');
	});
	
	$( obj + " > button").unbind("click");
	$( obj + " > button").click(function(index){
		$($(obj+ " > button").removeClass('buttonSel'))
			
		$(this).addClass('buttonSel');
		$(obj).attr('rel',$(this).val());
		show_schedule_type_div($(this).val());
	});
	
	$(obj).show();
	
}
function SetCreateNow(obj,val,ftype)
{
	$(obj).attr('rel',val);	//init rel value
	$( obj + " > button").each(function(index){
		if($(this).val()==val) 
			$(this).addClass('buttonSel');
		else
			$(this).removeClass('buttonSel');
	});
	
	$( obj + " > button").unbind("click");
	$( obj + " > button").click(function(index){
		$($(obj+ " > button").removeClass('buttonSel'))
			
		$(this).addClass('buttonSel');
		$(obj).attr('rel',$(this).val());
	});
	
	$(obj).show();
}

//function get_smb_share()
//{
//	var smb_info=new Array();
//	wd_ajax({
//		type: "POST",
//		async: false,
//		cache: false,
//		url: "/cgi-bin/account_mgr.cgi",
//		data: "cmd=cgi_get_all_session",
//		dataType: "xml",
//		success: function(xml){
//			
//			var total = $(xml).find('total').text();
//			
//			$(xml).find('share').each(function(index){
//				var sname = $(this).find('name').text();
//				var path = $(this).find('path').text();
//				smb_info[index] = new Array();
//				smb_info[index].sname = sname;
//				smb_info[index].path = path;
//			});
//			r_show_smb_list(smb_info);
//		},	
//		error:function(xmlHttpRequest,error){   
//			//alert("do_query_user_info->Error: " +error);   
//		}
//	});
//}
function show_remote_smb_list()
{
	_DIRECTION=1;//aloways nas to nas
	
	if(SHARE_NODE_NAME.length==0)
	{
		$("#remote_shareinfo").show().addClass("noshare");
		$("#remote_shareinfo").html(_T('_remote_backup','no_share'));
		$("#backups_rNext5_button").hide();
		return;
	}
	else
	{
		$("#remote_shareinfo").hide().removeClass("noshare");
		$("#backups_rNext5_button").show();
	}
	
	var tree = '<ul class="jqueryFileTree" style="">';
	for(i in SHARE_NODE_NAME)
	{
		tree +='<li class="directory collapsed">';
		tree +='<input name="folder_name" value="' + SHARE_NODE_NAME[i] + '" type="checkbox">';
		tree +='<a href="#" rel="' + SHARE_NODE_NAME[i] + '">' + SHARE_NODE_NAME[i] + '</a></li>'
	}
	
	if(_S_TYPE==1)
	{
		tree +='<li class="directory collapsed add" id="new_folder_li">';
		tree +='<a href="javascript:Remote_Create_Folder();" rel="' + _T('_common','new') + '">' + _T('_common','new') + '</a></li>';		
	}
	
	tree += "</ul>";
	$("#f_share_name").html(tree);
	$("input:checkbox").checkboxStyle();
	setTimeout("init_scroll('.remote_scrollbar')",10);
	
	var obj_id = "#f_share_name";
	$( obj_id +" input:checkbox").unbind('click');
	$( obj_id ).find("input:checkbox").each(function(index){
		$this=$(this);
		$this.attr('id',"backups_rSelShare" + index + "_chkbox");
		_click("backups_rSelShare" + index + "_chkbox");
	});	

	function _click(chkObjID)
	{
		$("#" + chkObjID).unbind('click');
		$("#" + chkObjID).click(function(){
			var chkFlag=0;

			if (jQuery.browser.msie == true && jQuery.browser.version < 9.0)
			{
				if ($(this).next('span').hasClass("checked")) chkFlag=1;
			}
			else
			{
				if ($(this).prop("checked"))
				{
					chkFlag=1;
				}
			}
			_uncheck(obj_id,"#backups_rSelShare");
			
			if(chkFlag==1) 
			{
				if (jQuery.browser.msie == true && jQuery.browser.version < 9.0)
				{
					$(this).next('span').addClass("checked")
				}
				else
					$(this).attr("checked",true);
					
				$("#backups_rNext5_button").removeClass('gray_out');
			}
			else
			{
				$("#backups_rNext5_button").removeClass('gray_out').addClass('gray_out');
			}
		});
	}
}
function r_show_smb_list(smb_info)
{
	$("#sharelist").empty();
	
	var ul_obj = document.createElement("ul"); 
	$(ul_obj).addClass('sListDiv');
	
	if( smb_info.length==0 )
	{
		$("#shareinfo").show();
		//$('#scrollbar2').hide();
		$("#shareinfo").html(_T('_remote_backup','no_share'));
		$('#backups_rNext2_button').hide();
		return;
	}
	else
	{
		$("#shareinfo").hide();
	}

	for(var i=0 ; i < smb_info.length; i++)
	{
		var li_obj = document.createElement("li"); 
		$(li_obj).append('<div class="sel"><input type="checkbox" name="' + smb_info[i].path + '" value="'+ smb_info[i].path + '" ></div>');
		$(li_obj).append('<div class="name">' + smb_info[i].sname + '</div>');
		
		$(ul_obj).append($(li_obj));
	}
	
	$("#sharelist").html($(ul_obj));

	$("input:checkbox").checkboxStyle();
	
	var obj_id = "#sharelist";
	$( obj_id +" input:checkbox").unbind('click');

	$( obj_id ).find("input:checkbox").each(function(index){
		$this=$(this);
		$this.attr('id',"chk_" + index);
		_click("chk_" + index);
	});
	
	function _click(chkObjID)
	{
		$("#" + chkObjID).unbind('click');
		$("#" + chkObjID).click(function(){
			var chkFlag=0;

			if (jQuery.browser.msie == true && jQuery.browser.version < 9.0)
			{
				if ($(this).next('span').hasClass("checked")) chkFlag=1;
			}
			else
			{
				if ($(this).prop("checked"))
				{
					chkFlag=1;
				}
			}
			
			if(chkFlag==1) 
			{
				//$(obj_id + " .name").css("color","#898989");
				if (jQuery.browser.msie == true && jQuery.browser.version < 9.0)
				{
					$(this).next('span').addClass("checked")
				}
				else
					$(this).attr("checked",true);
		 		//_LOCAL_PATH= $(this).val();
		 		//_LOCAL_SHARE= $(this).parent().parent().parent().find('.name').html();				
				$(this).parent().parent().parent().find('.name').css('color','#0067A6');
			}
			else
			{
				$(this).parent().parent().parent().find('.name').css('color','#898989');
			}
		});
	}

	setTimeout("init_scroll('.local_share_scrollbar')",10);
}
function _uncheck(obj_id,prefix_id)
{
	var n = $( obj_id +" input:checkbox").length;
	for(i =0;i< n;i++)
	{
		if (jQuery.browser.msie == true && jQuery.browser.version < 9.0)
		{
			$(prefix_id + i + "_chkbox").next('span').removeClass("checked");
		}
		else
			$(prefix_id + i + "_chkbox").attr("checked",false);
	}
}
function onoff_job(job_name,enable)
{	
	var overlayObj=$("#overlay").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	overlayObj.load();
	
	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/remote_backup.cgi",
		data:{cmd:"cgi_enable_disable_schedule",name:job_name,enable:enable},
	   	success: function(data)
	   	{
	   		$("#schedule_tb").flexReload();
	   		overlayObj.close();
	   	}
	 });
}
function recover_now(idx,recoverFlag)
{		
	if(recoverFlag==-1)
	{
		jAlert(_T('_remote_backup','msg32'), _T('_common','error'));
		return;
	}
	
	//-1: can't do recover function 0:do recover 1:can select one item
	if(recoverFlag==1)
	{
		get_recovery_info(_Safepoints_info_array[idx].name);
	}
	else
	{
		jConfirm('M',_T('_remote_backup','msg29'),_T('_remote_backup','recover'),"remote",function(r){
			if(r)
			{
				clearTimeout(RemoteTimeoutId);
				jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
				var job_name = _remote_list_array[idx].name;
				var path = _remote_list_array[idx].local_path;
	
				wd_ajax({
					type: "POST",
					async: true,
					cache: false,
					url: "/cgi-bin/remote_backup.cgi",
					data:{cmd:"cgi_recovery",name:job_name,path:path},
				   	success: function(data)
				   	{
						setTimeout("jLoadingClose()",2000);
						get_remote_backup_list();
						//setTimeout('get_percent("' + job_name + '","' + idx + '")',3000);
				   	}
				 });
			}
	    });
	}
}
function stop_task(idx)
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	var job_name = _remote_list_array[idx].name;
	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/remote_backup.cgi",
		data:{cmd:"cgi_stop_job",name:job_name},
	   	success: function(data)
	   	{
			setTimeout("jLoadingClose()",5000);
	   	}
	 });
}
function backup_now(idx)
{
	//var overlayObj=$("#overlay").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	jConfirm('M',_T('_remote_backup','msg25'),_T('_remote_backup','remote_title4'),"remote",function(r){
		if(r)
		{
			//overlayObj.load();
			//setTimeout(function(){overlayObj.close();$("#schedule_tb").flexReload();},1500);
			clearTimeout(RemoteTimeoutId);
			jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
			var job_name = _remote_list_array[idx].name;
			
			//$("#r" + idx).hide();
			//$("#rc" + idx).hide();
			//$("#rs" + idx).show();
			
			wd_ajax({
				type: "POST",
				async: true,
				cache: false,
				url: "/cgi-bin/remote_backup.cgi",
				data:{cmd:"cgi_backup_now",name:job_name},
			   	success: function(data)
			   	{
					setTimeout("jLoadingClose()",2000);
					get_remote_backup_list();
					//$("#rs" + idx).progressbar();
					//setTimeout('get_percent("' + job_name + '","' + idx + '")',3000);
			   	}
			 });
		}
    });
}

var _SERVER="";
function Set_Server(onoff ,flag)
{
	_SERVER = onoff;
	//server
	var pw=$("#rServerDiag input[name='settings_networkRemoteServerPW_password']").val();
	//if ($('#server_enable').prop('checked'))
	//if(getSwitch('#settings_networkRemoteServer_switch')=="1")
	if(onoff==1)
	{
		if(_SSH_PW_STATUS==0)
		{
			if(pw=="")
			{
				jAlert(_T('_remote_backup','msg8'), _T('_common','error'));
		 		$("#rServerDiag input[name='settings_networkRemoteServerPW_password']").select();
				$("#rServerDiag input[name='settings_networkRemoteServerPW_password']").focus();
				return -1;
			}
		
			if (pw.indexOf(" ") != -1) //find the blank space
		 	{
		 		jAlert(_T('_wizard','msg3'), _T('_common','error'));
		 		$("#rServerDiag input[name='settings_networkRemoteServerPW_password']").select();
				$("#rServerDiag input[name='settings_networkRemoteServerPW_password']").focus();
		 		return -1;
		 	}
			if (pw.length < 5) 
			{
				jAlert(_T('_wizard','msg2'), _T('_common','error'));
		 		$("#rServerDiag input[name='settings_networkRemoteServerPW_password']").select();
				$("#rServerDiag input[name='settings_networkRemoteServerPW_password']").focus();
				return -1;
			}
	
			if(rsync_chk_pw(pw)==1)
			{
				//The password can not include the following characters: " ' \\ ? # ` : & + \;
				jAlert(_T('_remote_backup','msg21'), _T('_common','error'));
		 		$("#rServerDiag input[name='settings_networkRemoteServerPW_password']").select();
				$("#rServerDiag input[name='settings_networkRemoteServerPW_password']").focus();
				return -1;
			}
		}
	
		var str="";
		var chkBox="";
		var ssh_enable= getSwitch('#settings_networkSSH_switch');
		var msg="";
		var ssh = getSSH_pw_status();	//1:changed 0:default pw
		
		if(ssh_enable==0)
		{
			var desc = _T("_ssh","desc3");
			str = _T('_ssh','enable_desc4');
			str +="<br><br>"
			chkBox = '<input type="checkbox" name="ssh_accept" id="ssh_accept" onclick="ssh_accept(this)">';
			
			msg = str + "<table><tr><td>" + chkBox + "</td><td>" + _T('_ssh','accept') + "</td></tr></table>";

			var tipclass1 = "SaveButton",tipclass2 = "SaveButton";
			if(_SSH_PW_STATUS!=-6 && _SSH_PW_STATUS!=0) tipclass1="";
			if(_SSH_PW_STATUS==-6) tipclass2="";
			var pw_tb = "<table id='ssh_pw_tb' class='ssh_pw_tb' style='display:none;' width='480'>";
				pw_tb += "<tr><td colspan='3' style='padding-top:15px;'>" + desc + "</td><td></td></tr>";
				pw_tb += "<tr><td class='tdfield'>" + _T('_admin','new_pwd') + " *</td><td class='tdfield_padding'><input id='settings_SSHPW_password' type='password' name='settings_SSHPW_password' value=''></input></td><td class='tdfield_padding'><div class='TooltipIconError tip_pw_error " + tipclass1 + "'></div></td></tr>";
				pw_tb += "<tr><td class='tdfield'>" + _T('_admin','confirm_pwd') + "</td><td class='tdfield_padding'><input id='settings_SSHConfirmPW_password' type='password' name='settings_SSHConfirmPW_password' value=''></input></td><td class='tdfield_padding'><div class='TooltipIconError tip_pw2_error " + tipclass2 + "'></div></td></tr>";
				pw_tb += "</table>";
				pw_tb += "<br><br>";
			if(ssh.status==1) pw_tb="";
			jConfirm('M',msg + pw_tb ,_T('_ssh','ssh'),"ssh",function(r){
				if(r)
				{
					var pw="";
					if(ssh.status==0)
					{
						//check ssh pw
						var chk_flag = chk_ssh_pw('#ssh_pw_tb');
						if(chk_flag!=0)
						{
							_SSH_PW_STATUS=chk_flag;
							Set_Server(1)
							return;
						}
						pw=$("#ssh_pw_tb input[name='settings_SSHPW_password']").val();
						_SSH_PW_STATUS=0;
					}
					f_callback(pw);
				}
				else
				{
					_SERVER= 0;
					setSwitch('#settings_networkRemoteServer_switch',_SERVER);
					show_pw();
				}
		    });
		}
		else
			f_callback("",flag);
	}
	else
	{
		var off_msg = _T('_remote_backup','msg30')
		jConfirm('M',off_msg,_T('_remote_backup','server'),"remote",function(r){
			if(r)
			{
				f_callback("");
			}
			else
			{
				setSwitch('#settings_networkRemoteServer_switch',1);
				_SERVER = 1;
				show_pw();
			}
	    });
	}
}
function f_callback(sshd_pw,flag)
{
	var pw=$("#rServerDiag input[name='settings_networkRemoteServerPW_password']").val();
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
 	wd_ajax({
		type: "POST",
		cache: false,
		url: "/cgi-bin/remote_backup.cgi",
		data:{cmd:"cgi_set_rsync_server",f_onoff:_SERVER,f_password:pw},
		success: function(){
			$("input").hidden_inputReset();

			if(_SERVER==1) 
			{
				if(sshd_pw!="")_post_ssh(1,sshd_pw);
				$("#ssh_conf_div").show();
			}

			jLoadingClose();

			//hide2('id_pw_save');
			if(_SERVER=="1" && flag!="auto")
				$("#remoteServerDiag").overlay().close();
			
			google_analytics_log('rmt-server-en',_SERVER);
			
			//jAlert(_T('_common','update_success'), "complete");
		}
	});
	
	function _post_ssh(onoff,sshd_pw)
	{
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/system_mgr.cgi",
			data:{cmd:"cgi_ssh",ssh:onoff,pw:Base64.encode( sshd_pw )},
			cache:false,
			success:function(){
				setSwitch('#settings_networkSSH_switch',onoff);
				init_switch();
				google_analytics_log('ssh-en', onoff);
			}
		});	
	}
	
}
function show_pw()
{
	if(getSwitch('#settings_networkRemoteServer_switch')=="1")
		$('#settings_networkEditServer_link').show();
	else
		$('#settings_networkEditServer_links').hide();
}

var _SCHEDULE_TIME_FORMAT = 24;
var _LOCAL_IP="";
function show_info()
{
	wd_ajax({
		type: "POST",
		//async: false,
		cache: false,
		url: "/cgi-bin/remote_backup.cgi",
		data: "cmd=cgi_get_rsync_info",	
		dataType: "xml",
		success: function(xml){
			$(xml).find('rsync_info').each(function(){
			
				var s_pw = $(this).find('server_pw').text();
				var s_enable = $(this).find('server_enable').text();
				var time_format = $(this).find('time_format').text();
				_LOCAL_IP = $(xml).find('local_ip').text();
				_SERVER = s_enable;
				_SCHEDULE_TIME_FORMAT = parseInt(time_format,10);
				
				/*
				if(s_enable==1)
					document.form_server.server_enable.checked=true
				else
					document.form_server.server_enable.checked=false
				*/
				
				setSwitch('#settings_networkRemoteServer_switch',s_enable);
				init_switch();
				
				show_pw();

				$("#rServerDiag input[name='settings_networkRemoteServerPW_password']").val(s_pw);
			});
		},
		 error:function(xmlHttpRequest,error){   
        		//alert("Error: " +error);   
  		 }
	});
}
var _INIT_MDIAG_FLAG=0;
function map_h(h,crond_type)
{
	var am_pm="";
	if(_SCHEDULE_TIME_FORMAT==12)
	{
		if(crond_type==3)
		{
			//daily
			am_pm = $("#backups_rDailyAMPM_select").attr('rel');
		}
		else if(crond_type==2)
		{
			//weekly
			am_pm = $("#backups_rWeeklyAMPM_select").attr('rel');
		}
		else if(crond_type==1)
		{
			//monthly
			am_pm = $("#backups_rMonthlyAMPM_select").attr('rel');
		}

		if(am_pm=='1')	//pm
		{
			if (h!=12)
				h = parseInt(h,10)+12;
		}
		else
		{
			if (h==12)
				h = 0;
		}
	}	
	return h;
}
function get_schedule_str()
{
	var crond_type=$('#s_type').attr('rel');	//3:daily 2:weekly 1:monthly 

	var s;
	if(crond_type==1)
	{//monthly
		var day = $("#backups_rDay_select").attr('rel');
		var h = $("#backups_rHour3_select").attr('rel');
		var d = $("#backups_rDay_select").html();
		
		if(day==1 || day==21 || day==31)
			s=d + "st" ;
		else if(day==2 || day==22)
			s=d + "nd" ;
		else if(day==3 || day==23)
			s=d + "rd" ;
		else 
			s=d + "th" ;
			
		h = map_h(h,crond_type);
		s=s+"&nbsp;" + h + " / " + _T('_mail','monthly');
	}
	else if(crond_type==2)
	{//weekly
		var weekly=$("#backups_rWeek_select").attr('rel');
		var h = $("#backups_rHour2_select").attr('rel');
		var w = new Array(_T('_mail','sun'), _T('_mail','mon'), _T('_mail','tue'), _T('_mail','wed'), _T('_mail','thu'), _T('_mail','fri'), _T('_mail','sat'));
		
		h = map_h(h,crond_type);
		s=w[weekly] + "&nbsp;" +  h + " / " + _T('_mail','weekly');
	}
	else
	{//daily
		var h = $("#backups_rHour_select").attr('rel');
		
		h = map_h(h,crond_type);
		s= h + " / " + _T('_mail','daily') ;
	}
	
	return s;
}

function ssh_accept(obj)
{
	if($(obj).prop("checked"))
	{
		$("#popup_apply_button").removeClass("gray_out");
		$("#ssh_pw_tb").show();
		$('#ssh_pw_tb input[name=settings_SSHPW_password]').focus();
	}
	else
	{
		$("#popup_apply_button").addClass("gray_out");
		$("#ssh_pw_tb").hide();
	}
}

function display_volume_select()
{
    var html_select_open = "";
    
    //if(_REMOTE_VOLUME_INFO_ARRAY.length >1)
    {
		html_select_open += '<ul>';
		html_select_open += '<li class="option_list">';          
		html_select_open += '<div class="wd_select option_selected">';
		html_select_open += '<div class="sLeft wd_select_l"></div>';
		for( var i=0 in _REMOTE_VOLUME_INFO_ARRAY)
		{
			if(_REMOTE_VOLUME_INFO_ARRAY[i]==0) continue;
			var info = _REMOTE_VOLUME_INFO_ARRAY[i].split(":");
			var volume_name = info[0];
			var volume_path = info[1];
			if(i==0 && _REMOTE_VOLUME_INFO_ARRAY.length==1)
			{
				html_select_open += '<div class="sBody text wd_select_m" id="backups_rVolume_select" rel="' + volume_path + '">'+volume_name+'</div>';
				html_select_open += '<div class="sRight wd_select_r"></div>	';
				html_select_open += '</div>';
				html_select_open += '<ul class="ul_obj"><div>'; 
				html_select_open += '<li rel="' + volume_path + '" class="li_start li_end"><a href=\"#\">' + volume_name + '</a></li>';
			}
			else if(i==0) 
			{
				html_select_open += '<div class="sBody text wd_select_m" id="backups_rVolume_select" rel="' + volume_path + '">'+volume_name+'</div>';
				html_select_open += '<div class="sRight wd_select_r"></div>	';
				html_select_open += '</div>';
				html_select_open += '<ul class="ul_obj"><div>';
				html_select_open += '<li rel="' + volume_path + '" class="li_start"><a href=\"#\">' + volume_name + '</a></li>';
			}
			else if(i==_REMOTE_VOLUME_INFO_ARRAY.length-1) 
				html_select_open += '<li rel="' + volume_path + '" class="li_end"><a href=\"#\">' + volume_name + '</a></li>';
			else
			{
				html_select_open += '<li rel="' + volume_path + '"><a href=\"#\">' + volume_name + '</a></li>';
			}
		}
	
		html_select_open += '</div></ul>';
		html_select_open += '</li>';
		html_select_open += '</ul>';
	}
//	else if(_REMOTE_VOLUME_INFO_ARRAY.length==1)
//	{
//		var info = HDD_INFO_ARRAY[0].split(":");
//		var volume_name = info[0];
//		var volume_path = info[1];
//		html_select_open += '<div id="volume2_f_dev" rel="' + volume_path + '">'+volume_name+'</div>';
//		$("#volume_select").hide();
//	}
	
	//$("#r_select_volume").append(html_select_open);
	return html_select_open;
}
var _NEWFOLDER = 0;
function Remote_Create_Folder()
{
	var v_info = "<div id='' class='select_menu'>" + display_volume_select() + "</div>";
	
	var c_tb = "<table id='create_folder_tb'>";
		c_tb += "<tr><td class='tdfield'>" + _T('_scandsk','volume') + "</td><td class='tdfield_padding'>" + v_info + "</td></tr>";
		c_tb += "<tr><td class='tdfield'>" + _T('_network_access','share_name') + "</td><td class='tdfield_padding'><input id='backups_rNewFolder_text' type='text' name='backups_rNewFolder_text' value=''></input></td></tr>";
		c_tb += "</table>";
		c_tb += "<br><br>";
			
	jConfirm('M',c_tb,_T('_network_access', 'create_folder_name'),'r_share',function(r){
		hide_select();
		init_select();
		if(r)
		{
			var remote_free;
			var rpath = $("#backups_rVolume_select").attr('rel');
			var fname = $('#create_folder_tb input[name=backups_rNewFolder_text]').val();
			if(rpath.indexOf("HD_a2")!=-1)
			{
				remote_free =_REMOTE_HD_A2_FREE_SIZE;
			}
			else if(rpath.indexOf("HD_b2")!=-1)
			{
				remote_free =_REMOTE_HD_B2_FREE_SIZE;
			}
			else if(rpath.indexOf("HD_c2")!=-1)
			{
				remote_free =_REMOTE_HD_C2_FREE_SIZE;
			}	
			else if(rpath.indexOf("HD_d2")!=-1)
			{
				remote_free =_REMOTE_HD_D2_FREE_SIZE;
			}
			
			_NEWFOLDER = 1;
			_REMOTE_SHARE = fname;
			_REMOTE_SHARE_PATH = $("#backups_rVolume_select").attr('rel') + "/" +fname;
			
			$("#backups_rDesc_text").html(fname);
			$("#backups_rDesc_text").addClass("TooltipIcon").attr("title" , fname);
			init_tooltip();
			$("#rDiag_mainPage").show();
			$("#rDiag_share_set").hide();
			
			check_rsync_rw();
			/*
			$("#new_folder_li").remove();
			
			var tree ='<li class="directory collapsed">';
			tree +='<input name="folder_name" src="new" value="' + $("#backups_rVolume_select").html() + "/" + fname + '" type="checkbox">';
			tree +='<a href="#" rel="' + fname + '">' + fname + '</a></li>'
			tree +='<li class="directory collapsed add" id="new_folder_li">';
			tree +='<a href="javascript:Remote_Create_Folder();" rel="' + _T('_common','new') + '">' + _T('_common','new') + '</a></li>';	
			$("#f_share_name .jqueryFileTree").append(tree);
			$("input:checkbox").checkboxStyle();*/
			
			
			/*
			var ul_obj = document.createElement("ul"); 
			$(ul_obj).addClass('rsListDiv');
				
			var li_obj = document.createElement("li"); 
			
			$(li_obj).append('<div class="sel visibility_hidden"><input id="backups_rSelShare0_chkbox" type="checkbox" checked name="' + fname + '" value="' + $("#backups_rVolume_select").attr('rel') + "/" +fname  + '"></div>');
			$(li_obj).append('<div class="name overflow_hidden_nowrap_ellipsis">' + "/"+$("#backups_rVolume_select").html() + "/" + fname + '</div>');
			$(li_obj).append('<div class="size overflow_hidden_nowrap_ellipsis">' + _T('_remote_backup','a_space') + " : " + remote_free + 'B</div>');
			
			$(ul_obj).append(li_obj);
			
			_REMOTE_SHARE = fname;
			_REMOTE_SHARE_PATH = $("#backups_rVolume_select").attr('rel') + "/" +fname;
			*/
			//$("#create_info_div").html(ul_obj);
			
		}
		else
		{
			_NEWFOLDER = 0;
			$("#r_share_info").show();
		}
    });
}

function write_am_pm_select(obj_id,output_id)
{
	if(_SCHEDULE_TIME_FORMAT==24)
	{
		$(output_id).hide();
		$(".am_pm_td").hide();
		return;
	}
	
	var select_array = new Array("AM", "PM");
	var select_v_array = new Array(0, 1);

	var my_html_options = "";

	my_html_options += "<ul>";
	my_html_options += "<li class='option_list'>";
	my_html_options += "<div class=\"wd_select option_selected\">";
	my_html_options += "<div class=\"sLeft wd_select_l\"></div>";
	my_html_options += "<div class=\"sBody text wd_select_m\" id='" + obj_id + "' rel='" + select_v_array[0] + "'>" + select_array[0] + "</div>";

	my_html_options += "<div class=\"sRight wd_select_r\"></div>";
	my_html_options += "</div>";
	my_html_options += "<ul class='ul_obj'><div>"
	my_html_options += "<li class=\"li_start\" rel=\"" + select_v_array[0] + "\" style='width:80px;' ><a href='#'>" + select_array[0] + "</a>";

	my_html_options += "<li class=\"li_end\" rel='" + select_v_array[1] + "' style='width:80px;'><a href='#'>" + select_array[1] + "</a>";
	my_html_options += "</div></ul>";
	my_html_options += "</li>";
	my_html_options += "</ul>";

	$(output_id).show();
	$(output_id).html(my_html_options);
	$(".am_pm_td").show();
}
function SetServerMode(obj,val)
{	
	$(obj).attr('rel',val);	//init rel value
	
	$( obj + " > button").each(function(index){
		if($(this).val()==val) 
			$(this).addClass('buttonSel');
		else
			$(this).removeClass('buttonSel');
	});
	
	$( obj + " > button").unbind("click");
	$( obj + " > button").click(function(index){
		$($(obj+ " > button").removeClass('buttonSel'))
		
		$(this).addClass('buttonSel');
		$(obj).attr('rel',$(this).val());
	});
}
var _Cloud_Device_Info = new Array();
function show_mycloud_nas(email,pw)
{
	jLoading(_T('_common','set'), 'loading' ,'s',""); //msg,title,size,callback
	
	_Cloud_Device_Info = new Array();
	
	$(".cloud_container_ul").html("");
	
	wd_ajax({
		type:"GET",
		cache: false,
		url: "/web/php/phpWD.php",
		data: "email=" + email + "&password=" + pw,
		dataType: "xml",	
		success: function(xml){
			$("#rDiag_mycloud").hide();
			var v = $(xml).find("info > status").text();	
			if(v =="ng")
			{
				$("#rDiag_mycloud_list").hide();
				$("#rDiag_mycloud_list_error").show();
			}
			else
			{
				if($(xml).find('device_user').length==0)
				{
					$("#rDiag_mycloud_list").hide();
					$("#rDiag_mycloud_list_error").show();
					jLoadingClose();
					return;
				}
				$("#rDiag_mycloud_list").show();
				$("#rDiag_mycloud_list_error").hide();
				
				var i=0;
				$(xml).find('device_user').each(function(){
					var _this = $(this).find('device');
					var status =  _this.find('status').text();
					var name =  _this.find('name').text();
					var user_sub_domain =  _this.find('user_sub_domain').text();
					var server_domain =  _this.find('server_domain').text();
					var local_ip =  _this.find('local_ip').text();
					var connection =  _this.find('connection').text();
					var type_name =  _this.find('type_name').text();

					_Cloud_Device_Info[i] = new Array();
					_Cloud_Device_Info[i].status = status;
					_Cloud_Device_Info[i].name = name;
					_Cloud_Device_Info[i].user_sub_domain = user_sub_domain;
					_Cloud_Device_Info[i].server_domain = server_domain;
					_Cloud_Device_Info[i].local_ip = local_ip;
					_Cloud_Device_Info[i].connection = connection;
					_Cloud_Device_Info[i].type_name = type_name;
					
					if(local_ip == _LOCAL_IP) return true;
					if(type_name.indexOf("EX4")==-1 
						&& type_name.indexOf("EX2")==-1 
						&& type_name.indexOf("MIRROR")==-1
						&& type_name.indexOf("DL4100")==-1
						&& type_name.indexOf("DL2100")==-1
						&& type_name.indexOf("Ex4100")==-1
						&& type_name.indexOf("EX2100")==-1
						&& type_name.indexOf("GEN2")==-1
						&& type_name.indexOf("EX1100")==-1
						&& type_name.indexOf("G2")==-1
						&& type_name.indexOf("PR_4100")==-1
						&& type_name.indexOf("PR_2100")==-1
						&& type_name.indexOf("WD_CLOUD")==-1) return true;
					
					var li_obj = document.createElement("li");
					$(li_obj).attr('rel',i);
					$(li_obj).attr('id',"backups_rCloudDevice"+i+"_link");
					if(type_name.indexOf("EX4")!=-1)
						$(li_obj).addClass('ex4');
					else if(type_name.indexOf("EX2")!=-1)
						$(li_obj).addClass('ex2');
					else if(type_name.indexOf("MIRROR")!=-1)
						$(li_obj).addClass('mirror');
					else if(type_name.indexOf("GEN2")!=-1 || type_name.indexOf("WD_CLOUD")!=-1)
						$(li_obj).addClass('gen2');		
					else if(type_name.indexOf("DL4100")!=-1)
						$(li_obj).addClass('dl4100');
					else if(type_name.indexOf("EX4100")!=-1)
						$(li_obj).addClass('ex4100');
					else if(type_name.indexOf("DL2100")!=-1)
						$(li_obj).addClass('dl2100');
					else if(type_name.indexOf("EX2100")!=-1)
						$(li_obj).addClass('ex2100');
					else if(type_name.indexOf("EX1100")!=-1)
						$(li_obj).addClass('ex1100');
					else if(type_name.indexOf("G2")!=-1)	//Mirrorman
						$(li_obj).addClass('g2');
					else if(type_name.indexOf("PR_4100")!=-1)
						$(li_obj).addClass('pr4100');
					else if(type_name.indexOf("PR_2100")!=-1)
						$(li_obj).addClass('pr2100');
					else
						$(li_obj).addClass('ex4');
				
					var s = '<div><span class="dev_name">' + name + '</span></div>';
					
					$(li_obj).append(s);
					
					$(".cloud_container_ul").append($(li_obj));
					
					i++;
				});
				
				
				$(".cloud_container_ul li").unbind('click');
				$(".cloud_container_ul li").click(function(){
					$(".cloud_container_ul li").css('background-color','');
					$(".cloud_container_ul li div span").css('color','#4B5A68');
					
					$(".cloud_container_ul li").removeClass('dev_sel');
					$(this).css('background-color',"#15ABFF");
					$(this).addClass('dev_sel');
					$(this).find(".dev_name").css('color',"#FAFAFA");
				});
			}
			
			jLoadingClose();
		}
	});
}

function write_server_option()
{
	$("#backups_rSSHAccount_text").prop("readonly",true);
	$("#backups_rSSHAccount_text").val("sshd");
	$("#backups_encryption").hide();
	$("#enc1_tr,#enc2_tr").show();
	
	//1:nas to nas 2:nas to linux
	var option = "";
		option += '<ul>';
		option += '<li class="option_list">';          
		option += '<div id="backups_rServerType_select" class="wd_select option_selected">';
		option += '<div class="sLeft wd_select_l"></div>';
		option += '<div class="sBody text wd_select_m" id="backups_rServer_select" rel="' + "1" + '">'+ _T('_remote_backup','nas_server') +'</div>';
		option += '<div class="sRight wd_select_r"></div>';
		option += '</div>';						
		option += '<ul class="ul_obj"><div>';
		option += '<li rel="1" src="1"> <a href="#">' + _T('_remote_backup','nas_server') + '</a></li>';
		option += '<li rel="1" src="3"> <a href="#">' + _T('_remote_backup','mycloud') + '</a></li>';
		//option += '<li rel="2" src="2"> <a href="#">' + _T('_remote_backup','linux_server') + '</a></li>';
		option += '</div></ul>';
		option += '</li>';
		option += '</ul>';
	
	$("#backups_rServerType").html(option);
	
	$("#backups_rServerType .option_list ul li a").click(function(){
		var src = $(this).parent().attr("src");
		$("#backups_rServerType").attr('src',src);
		switch(src)
		{
			case "1": //nas server
				$("#backups_rSSHAccount_text").prop("readonly",true);
				$("#backups_rSSHAccount_text").val("sshd");
				$("#backups_encryption").hide();
				$("#enc1_tr,#enc2_tr").show();
				$("#backups_rTypeOptionsLi2_select").show();
				$("#backups_userName").hide();
				write_type_option(1);
				break;
			case "2": //linux server
				$("#backups_rSSHAccount_text").prop("readonly",false);
				$("#backups_rSSHAccount_text").val("");
				$("#backups_encryption").show();
				var v = getSwitch('#backups_rEncryption_switch');
				if(v==1)
				{
					$("#enc1_tr,#enc2_tr").show();
				}
				else
				{
					$("#enc1_tr,#enc2_tr").hide();
				}
				
				$("#backups_rTypeOptionsLi2_select").hide();
				$("#backups_userName").show();
				write_type_option(0);
				break;
			case "3": //my cloud
				$("#backups_rSSHAccount_text").prop("readonly",true);
				$("#backups_rSSHAccount_text").val("sshd");
				$("#backups_encryption").hide();
				$("#enc1_tr,#enc2_tr").show();
				
				$("#rDiag_mainPage").hide();
				$("#rDiag_mycloud").show();
				$("#backups_userName").hide();
				write_type_option(1);
				_H = $("#remoteDiag").height();
				adjust_dialog_size("#remoteDiag","",450);
				break;
		}

	});
}

function write_bandwidth_option()
{
	var na = _T('_module','desc4');
	var option = "";
		option += '<ul>';
		option += '<li class="option_list">';          
		option += '<div id="backups_rBandwidthOptions_select" class="wd_select option_selected">';
		option += '<div class="sLeft wd_select_l"></div>';
		option += '<div class="sBody text wd_select_m" id="backups_rBandwidth_select" rel="' + "0" + '">'+ na +'</div>';
		option += '<div class="sRight wd_select_r"></div>';
		option += '</div>';
		option += '<ul class="ul_obj" style="height:200px">'; 
		option += '<li rel="100"> <a href="#">' + na + '</a></li>';
		option += '<li rel="100"> <a href="#">' + "100 KB/s" + '</a></li>';
		option += '<li rel="200"> <a href="#">' + "200 KB/s" + '</a></li>';
		option += '<li rel="500"> <a href="#">' + "500 KB/s" + '</a></li>';
		option += '<li rel="1000"> <a href="#">' + "1 MB/s" + '</a></li>';
		option += '<li rel="5000"> <a href="#">' + "5 MB/s" + '</a></li>';
		option += '</ul>';
		option += '</li>';
		option += '</ul>';
	
	$("#backups_rBandwidth").html(option);
	$("#backups_rBandwidth .option_list ul").css("width","180px");
	$("#backups_rBandwidth .option_list ul li").css("width","170px");
}

function write_type_option(inc)
{
	var option = "";
		option += '<ul>';
		option += '<li class="option_list">';          
		option += '<div id="backups_rTypeOptions_select" class="wd_select option_selected">';
		option += '<div class="sLeft wd_select_l"></div>';
		option += '<div class="sBody text wd_select_m" id="backups_rType_select" rel="' + "2" + '">'+ _T('_usb_backups','copy') +'</div>';
		option += '<div class="sRight wd_select_r"></div>';
		option += '</div>';
		option += '<ul class="ul_obj"><div>'; 
		option += '<li rel="2" id="backups_rTypeOptionsLi0_select"> <a href="#">' + _T('_usb_backups','copy') + '</a></li>';
		option += '<li rel="0" id="backups_rTypeOptionsLi1_select"> <a href="#">' + _T('_usb_backups','sync') + '</a></li>';
		
		/*
		if(inc==1)
		{
			option += '<li rel="1" id="backups_rTypeOptionsLi2_select"> <a href="#">' + _T('_usb_backups','incremental') + '</a></li>';
		}*/
		
		option += '</div></ul>';
		option += '</li>';
		option += '</ul>';
	
	$("#backups_rType").html(option);
	
	init_select();
}

function do_recover(jobName,date)
{
	jConfirm('M',_T('_remote_backup','msg29'),_T('_remote_backup','recover'),"remote",function(r){
		if(r)
		{
			clearTimeout(RemoteTimeoutId);
			_DIALOG.close();
			_DIALOG="";
			wd_ajax({
				type: "POST",
				async: true,
				cache: false,
				url: "/cgi-bin/remote_backup.cgi",
				data:{cmd:"cgi_recovery",name:jobName,date:date,type:1},
			   	success: function(data)
			   	{
					get_remote_backup_list();
					//setTimeout('get_percent("' + job_name + '","' + idx + '")',3000);
			   	}
			 });
		}
    });
}
function remote_open_folder_selecter_checkbox_click_callback_fn(o)
{
	var chk_sel_ele = $("input:checkbox:checked[name=folder_name]", $("#" + o.ID));

	var ele = $("#backups_rNext2_button");
	if (chk_sel_ele.length > 0)
		ele.removeClass('gray_out');
	else
		ele.removeClass('gray_out').addClass('gray_out');
}
function chk_remote_addr()
{
	_IP=$("#rDiag_mainPage input[name='backups_rIP_text']").val();
	if(_IP.indexOf(".")!=-1)
	{
		var str=_IP.split(".");
		var j=0;
		for(i in str)
		{
			if( !isNaN(str[i])) j++;
		}

		if( j >=3){
			if(CheckIPAddress(_IP)== -1)
				return -1;
		}
	}
	else if(_IP.indexOf(":")!=-1)
	{
		if(!CheckIPAddress_v6(_IP))
			return -1;
	}
	else
	{
		jAlert(_T('_ip','msg8') , _T('_common','error'),"",function(){
			$('#rDiag_mainPage input[name=backups_rIP_text]').focus();
		});
		return -1;
	}
	
	return 0;
}
