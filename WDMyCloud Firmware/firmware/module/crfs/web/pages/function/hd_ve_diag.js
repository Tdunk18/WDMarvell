var FILE_VOLUME_ENCRYPT = "/xml/volume_encrypt.xml";
var DIAD_VE_MOUNT_FLAG = 0;//,DIAD_VE_MODIFY_FLAG=0;
var VE_MOUNT_INFO = new Array();	
var timeoutId = 0;

function Internal_VE_clearMyTimer()
{
	if (timeoutId != 0) clearInterval(timeoutId);
}

function Internal_VE_Mount_Info_Get(my_vol)
{
	var my_mount_info = new Array();	
	
	wd_ajax({
		url:FILE_VOLUME_ENCRYPT,
		type:"POST",
		async:false,
		cache:false,
		dataType:"xml",
		success: function(xml){
			
			$('volume_encrypt_info > item',xml).each(function(e){
				
				if ( my_vol == $('volume',this).text())
				{
					my_mount_info[0] = $('volume',this).text();
					my_mount_info[1] = $('mount',this).text();
					my_mount_info[2] = $('file_type',this).text();
					my_mount_info[3] = $('raid_uuid',this).text();
					my_mount_info[4] = $('volume_encrypt_automount',this).text();
					my_mount_info[5] = $('mount_status',this).text();
					return false;
				}
			});				
			
		}//end of success: function(xml){
			
	}); //end of wd_ajax({		
	
	VE_MOUNT_INFO = my_mount_info;
	return my_mount_info;
}

function Internal_VE_PWD_Check(my_dev,my_pwd)
{
	var res = 0;
	
	wd_ajax({
	type: "POST",
	async:false,
	cache:false,
	url: "/cgi-bin/ve_mgr.cgi",
	data:{cmd:'cgi_VE_PWD_Check',f_dev:my_dev,f_pwd:my_pwd},
	dataType: "xml",
	success: function(xml) {	  	  	
	    
	    res =  $(xml).find("res").text(); 
	    if (res == "1")
	    {
	    	jAlert( _T('_ve','msg4'), "warning");	//Text:You have entered an incorrect original password. Please try again.
	    }                                      
	 }
	});	//end of ajax 
	
	return res;
}

function Internal_Load_Module(flag)
{
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/ve_mgr.cgi",
		data:{cmd:'cgi_VE_Load_Module'},
		dataType: "xml",
		success: function(xml) {	  	  	
		    
		    if (timeoutId != 0) Internal_VE_clearMyTimer();
			timeoutId = setInterval("Internal_Load_Module_State("+flag+")",3000);
		    
		                                          
		 }
	});	//end of ajax 
}

function Internal_Load_Module_State(flag)
{
	/*
		flag : 0 -> finish this dialog
			   1 -> open other dialog
	*/
	
	wd_ajax({
		type: "POST",
		url: "/cgi-bin/ve_mgr.cgi",
		data:{cmd:'cgi_VE_Load_Module_State'},
		dataType: "xml",
		success: function(xml) {	  	  	
		    
		 	if ( $(xml).find("res").text() == "1")
		    {
		    	if (timeoutId != 0) Internal_VE_clearMyTimer();
		    	
		    	switch(parseInt(flag))
		    	{
		    		case 1:
		    			$("#VE_Diag_Wait").hide();
		    			$("#VE_Diag_Save_Key").show();
		    			
		    			var my_title = _T('_format','step') + " 3 :" + _T('_common','modify');	//Text: Step 3:Modify
		    			$("#VE_Diag_title").html(my_title);
		    			
		    			setTimeout(function(){
					        $("#VE_List").flexReload();
					    }, 1000);
		    		break;
		    		
		    		default:
		    			$("#VE_Diag_Wait").hide();
				
						setTimeout(function(){
					        $("#VE_List").flexReload();
					        $("#VE_Diag").overlay().close();
					        
					        INTERNAL_DIADLOG_DIV_HIDE("VE_Diag");
							INTERNAL_DIADLOG_BUT_UNBIND("VE_Diag");
					    }, 1000);
		    		break;
		    	}//end of switch
				
		    }//end of if ( $(xml).find("res").text() == "1")...
		 }//end of ajax/success
	});	//end of ajax 
}

function Internal_VE_Original_PWD_Check(my_pwd)
{
	var flag = 0;
	
	if (my_pwd == "")
	{
		jAlert( _T('_ve','msg1'), "warning");	//Text:Please enter a original password.
		flag = 1;
	}
	else if ( my_pwd.length > 32)
	{
		jAlert( _T('_ve','msg2'), "warning");	//Text:The original password length cannot exceed 32 characters. Please try again.
		flag = 1;
	}
	else if(pw_check(my_pwd) == 1)				
	{
		jAlert( _T('_format','msg13'), "warning");	//Text:The original password must not include the following characters:  @ : / \ % '
		flag = 1;
	}		
	
	return flag;
}

function Internal_VE_New_PWD_Check(pwd,confirm_pwd)
{
	var flag = 1;
	
	if ( (pwd != "") && (confirm_pwd != "") )
	{	
		if ( pwd == "")
		{
			jAlert( _T('_format','msg9'), "warning");	//Text:Please enter a password.
			flag = 1;
		}
		else if ( confirm_pwd == "" )
		{
			jAlert( _T('_format','msg10'), "warning");	//Text:Please enter a confirm password.
			flag = 1;
		}
		else if (pwd.length > 32)
		{
			jAlert( _T('_format','msg11'), "warning");	//Text:The password length cannot exceed 32 characters. Please try again.
			flag = 1;
		}
		else if ( pwd != confirm_pwd)
		{
			jAlert( _T('_format','msg12'), "warning");	//Text:The new password and confirmation password does not match. Please try again.
			flag = 1;
		}	
		else if(name_check(pwd) == 1)			
		{
			jAlert( _T('_format','msg13'), "warning");	//Text:The new password must not include the following characters:  @ : / \ % '
			flag = 1;
		}
		else 	
			flag = 0;
	}
	else if ( (pwd != "") && (confirm_pwd == "") )
	{
		jAlert( _T('_format','msg10'), "warning");	//Text:Please enter a confirm password.
		flag = 1;
	}
	else if ( (pwd == "") && (confirm_pwd != "") )
	{
		jAlert( _T('_format','msg9'), "warning");	//Text:Please enter a password.
		flag = 1;
	}	
	else 
		flag = 0;
	
	return flag;
}

function Internal_VE_Mount_Upload_File()
{
	$.ajaxFileUpload
		(
			{
				url:'/cgi-bin/ve_mgr.cgi',
				secureuri:false,
				fileElementId:'f_ve_file',		
				cmd:'cgi_VE_Mount_Upload_File',		
				filePath:VE_MOUNT_INFO.toString(),
				success: function (data, status)
				{
					var my_res = $(data).find('res').text();
					
					if (parseInt(my_res) == 1)
					{
						Internal_Load_Module(0);
				    	
				    	$("#VE_Diag_Mount").hide();
						$("#VE_Diag_Wait").show();
					}
					else 
					{
						var msg = _T("_ve","desc8");
						msg = msg.replace(/xxx/,VE_MOUNT_INFO[0].toString());

						$("#Error_Msg").html(msg);

						$("#VE_Diag_Mount").hide();
						$("#VE_Diag_Wait").hide();
						$("#VE_Diag_Error").show();
					}	
					
					$("#f_ve_file").attr('value','');
			
				},
				error: function (data, status, e){}
			}
		)
}

function Internal_VE_Verify_KeyFile()
{
	$.ajaxFileUpload
		(
			{								
				url:'/cgi-bin/ve_mgr.cgi',
				secureuri:false,
				fileElementId:'f_modify_ve_file',		
				cmd:'cgi_VE_Verify_KeyFile',		
				filePath:VE_MOUNT_INFO.toString(),
				success: function (data, status)
				{
					var my_res = $(data).find('res').text();
					
					$("#f_modify_ve_file").attr('value','');
					
					if (parseInt(my_res) == 0)
					{
						$("#VE_Diag_Modify_Check_PWD").hide();
						$("#VE_Diag_Modify").show();	
						
						var my_title = _T('_format','step') + " 2 :" + _T('_common','modify');	//Text: Step 2:Modify
						$("#VE_Diag_title").html(my_title);
					}
					else 
					{
						jAlert( _T('_ve','msg4'), "warning");	//Text:You have entered an incorrect original password. Please try again.
					}	
				},
				error: function (data, status, e){}
			}
		)
}
function ve_mount_pwd_type(idx)
{
	if( idx == parseInt(1, 10) == 0)
	{
		$("#tr_diag_ve_mount_input").show();
		$("#tr_diag_ve_mount_upload").hide();
		
		if (!$("#VE_Mount_Input").hasClass('sel')) $("#VE_Mount_Input").addClass('sel');
		if ($("#VE_Mount_UploadFile").hasClass('sel')) $("#VE_Mount_UploadFile").removeClass('sel');
		if ($("#ve_apply_button_1").hasClass('grayout')) $("#ve_apply_button_1").removeClass('grayout');
	}
	else
	{
		$("#tr_diag_ve_mount_input").hide();
		$("#tr_diag_ve_mount_upload").show();
		
		if ($("#VE_Mount_Input").hasClass('sel')) $("#VE_Mount_Input").removeClass('sel');
		if (!$("#VE_Mount_UploadFile").hasClass('sel')) $("#VE_Mount_UploadFile").addClass('sel');
		if (!$("#ve_apply_button_1").hasClass('grayout')) $("#ve_apply_button_1").addClass('grayout');
	}	
}
function ve_mount_diag(my_vol)
{
	if ($("#ve_apply_button_1").hasClass('grayout')) $("#ve_apply_button_1").removeClass('grayout');
	
	Internal_VE_Mount_Info_Get(my_vol);
	
	var VEObj = $("#VE_Diag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	$("#VE_Diag").find(":password").each(function() {
          $(this).val("");
     });
     
	INTERNAL_DIADLOG_DIV_HIDE("VE_Diag");
	$("#VE_Diag_Mount").show();
	
	$("#VE_Diag_title").html(_T('_ve','mount'));
	
	init_button();
	$("input:text").inputReset();
	language();
	
	VEObj.load();
	
	$("#VE_Diag .close").click(function(){
		if ($("#ve_apply_button_1").hasClass('grayout')) $("#ve_apply_button_1").removeClass("grayout");
		
		INTERNAL_DIADLOG_DIV_HIDE("VE_Diag");
		INTERNAL_DIADLOG_BUT_UNBIND("VE_Diag");
		
		VEObj.close();
	});
		
	$("#VE_Mount_PwdChk").click(function(){
				$("#f_ve_file").click();
  });			
		
	$("#ve_apply_button_1").click(function(){   
		if ($(this).hasClass('grayout')) return;
		if (!$(this).hasClass('grayout')) $(this).addClass('grayout');
		
		var my_pwd = $("#f_ve_mount_1st_pwd").val();
		if (my_pwd.length == 0)
		{
			VEObj.close();
			jAlert(_T('_format','msg9'), "warning", null, function(){		//Text:Please enter a password.
				    			VEObj.load();
			});
			$(this).removeClass('grayout');
			return;
		}
		
		var my_mount = VE_MOUNT_INFO[0].toString();
		var my_dev = VE_MOUNT_INFO[1].toString();
		var my_file_system = VE_MOUNT_INFO[2].toString();
		
		if ($("#VE_Mount_Input").hasClass('sel'))//Key pwd
		{
				wd_ajax({
				type: "POST",
				url: "/cgi-bin/ve_mgr.cgi",
				data:{cmd:'cgi_VE_Mount_Volume',f_dev:my_dev,f_mount:my_mount,f_file_system:my_file_system,f_pwd:my_pwd},
				dataType: "xml",
				success: function(xml) {	  	  	
				    
				    var res = $(xml).find("res").text(); 
				    if (parseInt(res) == 0)
				    {
				    	Internal_Load_Module(0);
				    	
				    	$("#f_ve_mount_1st_pwd").attr('value','');
				    	
				    	$("#VE_Diag_Mount").hide();
							$("#VE_Diag_Wait").show();
				    }
				    else
				    {	 
				    		jAlert( _T('_ve','msg4'), "warning", null, function(){	//Text:You have entered an incorrect original password. Please try again.
				    			if ($("#ve_apply_button_1").hasClass('grayout')) $("#ve_apply_button_1").removeClass('grayout');
				    		});
				  	}	
				                                          
				 }
				});	//end of ajax 	
		}
	});				
}
function ve_modify_pwd_type(idx)
{
	if( idx == parseInt(1, 10) == 0)
	{
		$("#tr_diag_ve_modify_input").show();
		$("#tr_diag_ve_modify_upload").hide();
		
		if (!$("#VE_Modify_Input").hasClass('sel')) $("#VE_Modify_Input").addClass('sel');
		if ($("#VE_Modify_UploadFile").hasClass('sel')) $("#VE_Modify_UploadFile").removeClass('sel');
		
		if ($("#ve_apply_button_3").hasClass('grayout')) $("#ve_apply_button_3").removeClass('grayout');
	}
	else
	{
		$("#tr_diag_ve_modify_input").hide();
		$("#tr_diag_ve_modify_upload").show();
		
		if ($("#VE_Modify_Input").hasClass('sel')) $("#VE_Modify_Input").removeClass('sel');
		if (!$("#VE_Modify_UploadFile").hasClass('sel')) $("#VE_Modify_UploadFile").addClass('sel');
		
		if (!$("#ve_apply_button_3").hasClass('grayout')) $("#ve_apply_button_3").addClass('grayout');
	}	
}

function ve_modify_diag(my_vol)
{
	var my_mount_info = new Array();	
	if (my_vol == "Volume_1")		my_mount_info = Internal_VE_Mount_Info_Get(1);
	else if (my_vol == "Volume_2")	my_mount_info = Internal_VE_Mount_Info_Get(2);
	else if(my_vol == "Volume_3")	my_mount_info = Internal_VE_Mount_Info_Get(3);
	else if(my_vol == "Volume_4")	my_mount_info = Internal_VE_Mount_Info_Get(4);
	
	//auto-mount
	if (my_mount_info[4].toString() == "1")
		$("#f_modify_ve_auto_mount").attr('checked',true);
	else
		$("#f_modify_ve_auto_mount").attr('checked',false);	
	
	var my_title = _T('_format','step') + " 1 :" + _T('_common','modify');	//Text: Step 1:Modify
	$("#VE_Diag_title").html(my_title);	
	
	var VEObj = $("#VE_Diag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});
	
	$("#VE_Diag").find(":password").each(function() {
          $(this).val("");
     });
	
	INTERNAL_DIADLOG_DIV_HIDE("VE_Diag");
	$("#VE_Diag_Modify_Check_PWD").show();		
	
	init_button();
	$("input:text").inputReset();
	$("input:password").inputReset();
	$("input:checkbox").checkboxStyle();
	language();
	VEObj.load();
	
	$("#VE_Diag .close").click(function(){
		INTERNAL_DIADLOG_DIV_HIDE("VE_Diag");
		INTERNAL_DIADLOG_BUT_UNBIND("VE_Diag");
		
		$("#f_modify_ve_pwd").attr('value','');
		$("#f_modify_ve_new_pwd").attr('value','');
		$("#f_modify_confirm_pwd").attr('value','');
		
		VEObj.close();
	});
	
	$("#f_modify_ve_file").mouseover(function(){		
			$("#VE_Moidy_PwdChk").css("border","2px solid #0067A6").css("background","#212121");
	});
	
	$("#f_modify_ve_file").mouseout(function(){
			$("#VE_Moidy_PwdChk").css("border","2px solid #464646").css("background","#212121");		
	});
	
	$("#VE_Diag_Modify_Check_PWD .LightningCheckbox input[type=checkbox]").click(function(){	 
		$('.LightningCheckbox input[type=checkbox]').prop('checked',false);
      	$(this).prop('checked',true);
	});
	
	$("#VE_Moidy_PwdChk").click(function(){
				$("#f_modify_ve_file").click();
  });		
	
	//Step1 - Original Password 
	$("#ve_apply_button_3").click(function(){  
		
		if ($("#VE_Modify_Input").hasClass('sel'))//Key pwd
		{	 
			var my_old_pwd = $("#f_modify_ve_pwd").val();
			
			if ( Internal_VE_Original_PWD_Check(my_old_pwd) == 0 )
			{	
				var my_dev = VE_MOUNT_INFO[1].toString();
				
				if ( Internal_VE_PWD_Check(my_dev,my_old_pwd) == 0 )
				{
					$("#VE_Diag_Modify_Check_PWD").hide();
					$("#VE_Diag_Modify").show();	
					
					var my_title = _T('_format','step') + " 2 :" + _T('_common','modify');	//Text: Step 2:Modify
					$("#VE_Diag_title").html(my_title);
				}	
			}
		}	
	});	
	
	$("#ve_apply_button_4").click(function(){  
		
				var my_dev = VE_MOUNT_INFO[1].toString();
				var my_old_pwd = $("#f_modify_ve_pwd").val();
				var my_new_pwd = $("#f_modify_ve_new_pwd").val();
				var my_confirm_pwd = $("#f_modify_confirm_pwd").val();
				
				if ( Internal_VE_New_PWD_Check(my_new_pwd,my_confirm_pwd) == 0 )
				{
					$("#VE_Diag_Modify").hide();
					$("#VE_Diag_Wait").show();

					var my_auto_mount = ($("input[name='f_modify_ve_auto_mount']:checked").val() == 1)?	1:0;
						
					wd_ajax({
						type: "POST",
						url: "/cgi-bin/ve_mgr.cgi",
						data:{cmd:'cgi_VE_Mofify',
								f_dev:my_dev,
								f_auto_mount:my_auto_mount,
								f_old_pwd:my_old_pwd,
								f_new_pwd:my_new_pwd,
								f_mount:my_mount_info[0].toString(),
								f_file_system:my_mount_info[2].toString(),
								f_mount_status:my_mount_info[5].toString()},
						dataType: "xml",
						success: function(xml) {	  	  	
						    
						    var res = $(xml).find("res").text(); 
						    
						    $("#f_modify_ve_pwd").attr('value','');
						    $("#f_modify_ve_new_pwd").attr('value','');
						    $("#f_modify_confirm_pwd").attr('value','');
								     
						    switch(parseInt(res))
						    {
						    	case 2:
						    		Internal_Load_Module(0);//Close this dialog
						    	break;
						    	
						    	case 4:
						    		Internal_Load_Module(1);//Open Save Key dialog
						    	break;
						    	
						    	case 5:
						    		$("#VE_Diag_Wait").hide();
					    			$("#VE_Diag_Save_Key").show();
					    			
					    			var my_title = _T('_format','step') + " 3 :" + _T('_common','modify');	//Text: Step 3:Modify
					    			$("#VE_Diag_title").html(my_title);
					    			
					    			setTimeout(function(){
								        $("#VE_List").flexReload();
								     }, 1000); 
						    	break;
						    	
						    	default:
								      $("#VE_Diag_Wait").hide();
									 		VEObj.close();
						    	break;
						    }                                     
						 }//end of wd_ajax({../success
					});	//end of ajax 
				}//end of if ( Internal_VE_New_PWD_Check(my_new_pwd,my_confirm_pwd) == 0 )
	});	//end of $("#ve_apply_button_4").click(function(){  	
	
	//Download Key File
	$("#ve_download_button_6").click(function(){  
		var my_volume = my_mount_info[0].toString();
		ve_save_key(my_volume);
	});	
}
