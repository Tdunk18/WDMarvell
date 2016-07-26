var VV_CREATE_INFO = new Array();	
var VV_xhr = "";
/*
	VV_CREATE_INFO[0]:IP
	VV_CREATE_INFO[1]:Port
	VV_CREATE_INFO[2]:Targets
	VV_CREATE_INFO[3]:Authentication
	VV_CREATE_INFO[4]:User Name
	VV_CREATE_INFO[5]:Password
	VV_CREATE_INFO[6]:LUN 
	VV_CREATE_INFO[7]:ShareFolder
*/
function INTERNAL_VirtualVol_BUT_UNBIND()
{
	$("#VV_Diag :button").unbind('click');//fish20140805+ for unbind button event
	$("#VV_Diag .close").unbind('click');
}
function INTERNAL_VirtualVol_Create_Get_LUN(idx,lun)
{
	$('#VV_Create_LUN_List .LightningCheckbox input[type=checkbox]').prop('checked',false);
	var my_id = "#VV_Create_LUN_List .LightningCheckbox input[type=checkbox]:eq("+parseInt(idx,10)+")";
	$(my_id).prop('checked',true);
	
	VV_CREATE_INFO[6] = lun;
}

function INTERNAL_VirtualVol_Create_Get_Target(idx,target_name)
{
	VV_CREATE_INFO[2] = target_name;
	
	$("#VV_Search_List tr").each( function(col) {
		if ( $(this).hasClass("trSelected") ) $(this).removeClass("trSelected");
		if (parseInt(col) == idx)
		{
			if (!$(this).hasClass("trSelected") ) $(this).addClass("trSelected");
		}
	});
}
function INTERNAL_VirtualVol_format_user(str)
{
		if ( str == "" )
    {
        jAlert( _T('_user','msg5'), "warning");	//Text:Please enter a user name.
				return 0;
    }
    
    if(	str.length > 16)
    {
       jAlert( _T('_download','msg1'), "warning");	//Text:The user name length cannot exceed 16 characters. Please try again.
       return 0;
    }
    
    if (name_check(str) == 1)
		{			
			jAlert(_T('_iscsi','msg5'), _T('_common','error'));
			return 1;
		}
        
	return 1;
}
function INTERNAL_VirtualVol_format_pwd(str)
{
	if( str == "")
	{
		jAlert( _T('_mail','msg11'), "warning");	//Text:Please enter a password.
		return 0;
	}
	
	if(	str.length <= 11)
	{
		jAlert( _T('_vv','msg7'), "warning");	//Text:The new password must be at least 12 characters in length. Please try again.
		return 0;
	}
	
	if(	str.length > 128)
	{
		jAlert( _T('_download','msg8'), "warning");	//Text:The password length cannot exceed 128 characters. Please try again.
	   return 0;
	}
	
	if(name_check(str)==1)
	{
		jAlert(_T('_iscsi','msg7'), _T('_common','error'));	//Text:The password allow characters : "a-z" , "A-Z" , "0-9" , "-" , "_"
		return 0;
	}

	return 1;
}
function INTERNAL_VirtualVol_format_sharename(str)
{
	if( str == "")
	{
		jAlert( _T('_vv','msg6'), "warning");
		return 0;
	}
	
	if(	str.length > 80)
	{
		jAlert( _T('_network_access','msg1'), "warning");
		return 0;
	}
	
	var re=/[\\/:*?"<>|]/;
	if(re.test(str))
	{
		jAlert(_T('_network_access','msg23'), 'warning',"");
 		return 0;
	}
	
	if(str.indexOf(" ")!=-1)
	{
		jAlert(_T('_network_access','msg25'), 'warning',"");
		return 0;
	}
		
	return 1;
}
function VirtualVol_Create()
{
	VV_xhr = wd_ajax({
		url:"/cgi-bin/virtual_vol.cgi",
		type: "POST",
		data:{cmd:'cgi_VirtalVol_Create',
				f_ip:VV_CREATE_INFO[0],
				f_port:VV_CREATE_INFO[1],
				f_target:VV_CREATE_INFO[2],
				f_auth:VV_CREATE_INFO[3],
				f_user:VV_CREATE_INFO[4],
				f_pwd:VV_CREATE_INFO[5],
				f_lun:VV_CREATE_INFO[6],
				f_name:VV_CREATE_INFO[7]},
		async:false,
		cache:false,
		dataType:"xml",
		success: function(xml){
			google_analytics_log('Volume_Virtualization_created', 1);
			$("#VV_List").flexReload();
		}
	});
}
function VirtualVol_LUN_List()
{
	wd_ajax({
				url: "/xml/vv_search.xml",
				type: "POST",
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml){
					
				var res = $(xml).find("err_code").text();
					
				if 	(parseInt(res) == 0)
				{
					var my_html_tr = "";
					var idx = 0;
					$("#Create_LUN_Target").html(VV_CREATE_INFO[2]);
				
					$('id',xml).each(function(n){
						if ($('avaliable',this).text() == '1')
						{	
							if ((n%2) == 1)
								my_html_tr += "<tr id='row " + n + "' class='erow'>";
							else
								my_html_tr += "<tr id='row " + n + "'>";
							
							if (parseInt(idx,10) == 0)
							{
								VV_CREATE_INFO[6] = $('lun',this).text();
								my_html_tr += "<td><div style=\"text-align: left; width: 40px;\">";	
								my_html_tr += "<input type=\"checkbox\" value=\"1\" name=\"f_lun\" checked onclick=\"INTERNAL_VirtualVol_Create_Get_LUN('"+idx+"',"+$('lun',this).text()+")\">";	
								my_html_tr += "</div><td>";	
							}
							else
							{
								my_html_tr += "<td><div style=\"text-align: left; width: 40px;\">";	
								my_html_tr += "<input type=\"checkbox\" value=\"1\" name=\"f_lun\" onclick=\"INTERNAL_VirtualVol_Create_Get_LUN('"+idx+"',"+$('lun',this).text()+")\"></div>";	
								my_html_tr += "</div><td>";	
							}	
							my_html_tr +=  "<td><div style=\"text-align: left; width: 280px;\">LUN:" + $('lun',this).text() + "</div></td>";
							my_html_tr +=  "<td><div style=\"text-align: right; width: 200px;\">" + size2str($('size',this).text()) + "&nbsp;</div></td>";
							my_html_tr +=  "</tr>";
							
							idx++;
						}	
					});	//end of each
					
					if (idx == 0)
					{
						//$("#create_lun_search_fail").show();
						//if (!$("#storage_volumevirtualCreateNext4_button").hasClass('gray_out')) $("#storage_volumevirtualCreateNext4_button").addClass('gray_out');	

						_DIALOG.close();
						jAlert( _T('_vv','desc9'), "warning", null, function(){
							_DIALOG.load();
							$("#VV_Create_LUN_List").hide();
							$("#VV_Create_Target_Set").show();
							$("#create_lun_waiting").show();
						});
					}
					
					$("#VV_LUN_List").html(my_html_tr);
					$("#VV_Create_LUN_List .scroll-pane").jScrollPane();
					
					if ($("#storage_volumevirtualCreateNext4_button").hasClass("gray_out"))  $("#storage_volumevirtualCreateNext4_button").removeClass("gray_out");
				}
				else
				{
					//$("#create_lun_search_fail").show();
					//if (!$("#storage_volumevirtualCreateNext4_button").hasClass("gray_out")) $("#storage_volumevirtualCreateNext4_button").addClass("gray_out");

					_DIALOG.close();
					jAlert( _T('_vv','desc9'), "warning", null, function(){
						_DIALOG.load();
						$("#VV_Create_LUN_List").hide();
						$("#VV_Create_Target_Set").show();
						$("#create_lun_waiting").show();
					});
				}		
			},
            error:function (xhr, ajaxOptions, thrownError){}  
	});
}
function VirtualVol_Search_LUN()
{
	VV_xhr = wd_ajax({
		url:"/cgi-bin/virtual_vol.cgi",
		type:"POST",
		data:{cmd:'cgi_VirtalVol_LUN_Search',
				f_ip:VV_CREATE_INFO[0],
				f_port:VV_CREATE_INFO[1],
				f_target:VV_CREATE_INFO[2],
				f_auth:VV_CREATE_INFO[3],
				f_user:VV_CREATE_INFO[4],
				f_pwd:VV_CREATE_INFO[5]},
		async:true,
		cache:false,
		dataType:"xml",
		success: function(xml)
		{
			if( $(xml).find("res").text() == "1")
			{
				$("#create_lun_waiting").hide();
				VirtualVol_LUN_List();
				$("input:checkbox").checkboxStyle();
			}
		}
	});	// end of ajax
}
function VirtualVol_Target_List()
{
	$("#VV_Search_List").empty().html("");
	wd_ajax({
				url: "/xml/vv_search.xml",
				type: "POST",
				async:false,
				cache:false,
				dataType:"xml",
				success: function(xml){
					
				var my_html_tr = "";
				
				$('id',xml).each(function(n){
					
					if (n == 0)	VV_CREATE_INFO[2] = $('name',this).text();
					
					if ((n%2) == 1)
						my_html_tr += "<tr id='row " + n + "' class='erow'>";
					else
						my_html_tr += (n==0)? "<tr id='row " + n + "' class='trSelected'>":"<tr id='row " + n + "'>";
						
					my_html_tr +=  "<td><div style=\"text-align: left; width: 535px;\" onclick=\"INTERNAL_VirtualVol_Create_Get_Target('"+n+"','"+$('name',this).text()+"')\">" + $('name',this).text() + "</div></td>";
					my_html_tr +=  "</tr>";
						
				});	//end of each
				
				if (my_html_tr != "")
				{
						if( $("#storage_volumevirtualCreateNext2_button").hasClass('gray_out')) $("#storage_volumevirtualCreateNext2_button").removeClass('gray_out');
						
						$("#VV_Search_List").html(my_html_tr);
				}		
				else
				{
					_DIALOG.close();
					jAlert( _T('_vv','msg5'), "warning", null, function(){
						_DIALOG.load();

						$("#VV_Create_Info").show();
						$("#VV_Create_Search").hide();
						$("#create_target_waiting").show();
					});
				}
				$('#VV_Create_Search .scroll-pane').jScrollPane();
			},
            error:function (xhr, ajaxOptions, thrownError){}  
	});
}
function VirtualVol_Target_Search()
{	
		VV_xhr = wd_ajax({
		url:"/cgi-bin/virtual_vol.cgi",
		type:"POST",
		data:{cmd:'cgi_VirtalVol_Target_Search',f_ip:$("#storage_volumevirtualCreateIP_text").val(),f_port:$("#storage_volumevirtualCreatePort_text").val()},
		async:true,
		cache:false,
		dataType:"xml",
		success: function(xml)
		{
			if( $(xml).find("res").text() == "1")
			{
				$("#create_target_waiting").hide();
				
				VirtualVol_Target_List();

			}
		}
	});	// end of ajax
}
function VirtualVol_Create_Diag()
{
	$("#storage_volumevirtualCreateIP_text").val('');
	$("#storage_volumevirtualCreateUser_text").val('');
	$("#storage_volumevirtualCreatePWD_password").val('');
	$("#storage_volumevirtualCreateShareFolder_text").val('');
	$("#VV_Search_List").empty();
	$("#create_target_waiting").show();
	$("#VV_Create_User_tr,#VV_Create_PWD_tr").hide();
	
	VV_CREATE_INFO = new Array();
	
	var VVObj = $("#VV_Diag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});
	VVObj.load();
	_DIALOG = VVObj;	
	
	INTERNAL_DIADLOG_DIV_HIDE("VV_Diag");
	$("#VV_Create_Info").show();
	
	init_button();
	init_switch();
    $("input:text").inputReset();
    $("input:password").inputReset();
	language();
	
	setSwitch('#storage_volumevirtualCreateAuth_switch',0);
	
	$("#VV_Diag_title").html(_T("_vv","title2"));
	
	wd_ajax({
		url:"/cgi-bin/virtual_vol.cgi",
		type:"POST",
		data:{cmd:'cgi_VirtalVol_Get_IQN'},
		async:false,
		cache:false,
		dataType:"xml",
		success: function(xml)
		{
			var my_iqn = $(xml).find("IQN").text();
			if (my_iqn != "none")
			{	
				$("#CreateDiag_IQN").html(my_iqn);
				if( $("#storage_volumevirtualCreateNext1_button").hasClass('gray_out')) $("#storage_volumevirtualCreateNext1_button").removeClass('gray_out');
			}
			else
			{
				if( !$("#storage_volumevirtualCreateNext1_button").hasClass('gray_out')) $("#storage_volumevirtualCreateNext1_button").addClass('gray_out');
			}		
		}
	});	// end of ajax
	
	$("#VV_Diag .close").click(function(){	
		
		if(VV_xhr && VV_xhr.readystate != 4){
            VV_xhr.abort();
    }
        
		VVObj.close();
		_DIALOG = "";
		
		INTERNAL_VirtualVol_BUT_UNBIND();
		INTERNAL_DIADLOG_DIV_HIDE("VV_Diag");

		go_sub_page('/web/storage/virtual_vol.html', 'virtual_vol');
		
	});	
	
	$('#storage_volumevirtualCreateAuth_switch').click(function() {	

		if (getSwitch('#storage_volumevirtualCreateAuth_switch') == 1)
		{
			$("#VV_Create_User_tr").show();
			$("#VV_Create_PWD_tr").show();
		}
		else
		{
			$("#VV_Create_User_tr").hide();
			$("#VV_Create_PWD_tr").hide();
		}
	});	
		
	$("#storage_volumevirtualCreateNext1_button").click(function() {	
		
		if( !$("#storage_volumevirtualCreateNext1_button").hasClass('gray_out'))
		{
			if ( $("#storage_volumevirtualCreateIP_text").val() == "")
			{
				jAlert( _T('_vv','msg3'), "warning");
				return;
			}
			
			if ( $("#storage_volumevirtualCreatePort_text").val() == "")
			{
				jAlert( _T('_vv','msg4'), "warning");
				return;
			}
			
			VV_CREATE_INFO[0] = $("#storage_volumevirtualCreateIP_text").val();
			VV_CREATE_INFO[1] = $("#storage_volumevirtualCreatePort_text").val();
			
			
			VirtualVol_Target_Search();
			
			$("#VV_Create_Info").hide();
			$("#VV_Create_Search").show();
		}	
	});		
	
	$("#storage_volumevirtualCreateBack2_button").click(function() {	
		if(VV_xhr && VV_xhr.readystate != 4){
    	        	VV_xhr.abort();
    		}
		$("#create_target_waiting").show();
		$("#VV_Search_List").empty();
		
		$("#VV_Create_Info").show();
		$("#VV_Create_Search").hide();
	});	
	
	$("#storage_volumevirtualCreateNext2_button").click(function() {
		if(!$("#storage_volumevirtualCreateNext2_button").hasClass("gray_out"))
		{
			$("#Create_Target").html(VV_CREATE_INFO[2]);
			
			$("#VV_Create_Search").hide();
			$("#VV_Create_Target_Set").show();
		}	
	});	
	
	$("#storage_volumevirtualCreateBack3_button").click(function() {	
		$("#VV_Create_Search").show();
		$("#VV_Create_Target_Set").hide();
	});	
	
	$("#storage_volumevirtualCreateNext3_button").click(function() {		
		VV_CREATE_INFO[3] = getSwitch('#storage_volumevirtualCreateAuth_switch');
		
		if (VV_CREATE_INFO[3] == "1")
		{
			if ( INTERNAL_VirtualVol_format_user($("#storage_volumevirtualCreateUser_text").val()) == 0) return;
			if ( INTERNAL_VirtualVol_format_pwd($("#storage_volumevirtualCreatePWD_password").val()) == 0) return;
		}
		
		VV_CREATE_INFO[4] = $("#storage_volumevirtualCreateUser_text").val();
		VV_CREATE_INFO[5] = $("#storage_volumevirtualCreatePWD_password").val();
		
		$("#VV_LUN_List").empty();
		$("#create_lun_waiting").show();
		
		VirtualVol_Search_LUN();	
		
		$("#VV_Create_LUN_List").show();
		$("#VV_Create_Target_Set").hide();
	});
	
	$("#storage_volumevirtualCreateBack4_button").click(function() {
		if(VV_xhr && VV_xhr.readystate != 4){
			VV_xhr.abort();
		}
		
		$("#create_lun_search_fail").hide();
		if (!$("#storage_volumevirtualCreateNext4_button").hasClass("gray_out"))  $("#storage_volumevirtualCreateNext4_button").addClass("gray_out");
			
		$("#VV_Create_Target_Set").show();
		$("#VV_Create_LUN_List").hide();
	});	
	
	$("#storage_volumevirtualCreateNext4_button").click(function() {
		if (!$("#storage_volumevirtualCreateNext4_button").hasClass("gray_out"))
		{
			$("#VV_Create_LUN_List").hide();
			$("#VV_Create_ShareName_Set").show();
		}	
	});	
	
	//Share Name Set
	$("#storage_volumevirtualCreateBack5_button").click(function() {	
		$("#VV_Create_LUN_List").show();
		$("#VV_Create_ShareName_Set").hide();
	});	
	
	$("#storage_volumevirtualCreateNext5_button").click(function() {
		
		if ( INTERNAL_VirtualVol_format_sharename($("#storage_volumevirtualCreateShareFolder_text").val()) != 1) return 0;
		
		VV_xhr = wd_ajax({
			url:"/cgi-bin/virtual_vol.cgi",
			type:"POST",
			data:{cmd:'cgi_VirtalVol_ShareName_Exist',f_sharename:$("#storage_volumevirtualCreateShareFolder_text").val()},
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml)
			{	
				if ( $(xml).find('res').text() == "1")
				{
					jAlert( _T('_vv','msg1'), "warning");
				}
				else
				{
					VV_CREATE_INFO[7] = $("#storage_volumevirtualCreateShareFolder_text").val();
					
					$("#Create_Summary_IQN").html();
					$("#Create_Summary_IP").html(VV_CREATE_INFO[0]);
					$("#Create_Summary_Port").html(VV_CREATE_INFO[1]);
					$("#Create_Summary_Target").html(VV_CREATE_INFO[2]);
					
					//setSwitch('#Create_Summary_Auth', parseInt(VV_CREATE_INFO[3],10));
					var str = (parseInt(VV_CREATE_INFO[3],10) == 0)? _T('_common','off'):_T('_common','on');
					$("#Create_Summary_Auth").html(str);
					
					if (parseInt(VV_CREATE_INFO[3],10) == 1)
					{
						$("#Create_Summary_User").html(VV_CREATE_INFO[4]);
						$("#Create_Summary_PWD").html(VV_CREATE_INFO[5]);
						
						$("#VV_Create_Summary_User_tr").show();
						$("#VV_Create_Summary_PWD_tr").show();
					}
					else
					{
						$("#VV_Create_Summary_User_tr").hide();
						$("#VV_Create_Summary_PWD_tr").hide();
					}	
					$("#Create_Summary_ShareName").html(VV_CREATE_INFO[7]);
					
					$("#VV_Create_ShareName_Set").hide();
					$("#VV_Create_Summary").show();
					
					$("#VV_Create_Summary .scroll-pane").jScrollPane();
				}
			}
		});	// end of ajax
	});
	
	//Summary	
	$("#storage_volumevirtualCreateBack6_button").click(function() {
		$("#VV_Create_ShareName_Set").show();	
		$("#VV_Create_Summary").hide();
	});	
	
	$("#storage_volumevirtualCreateNext6_button").click(function() {	
		 VirtualVol_Create();
		 VVObj.close();
		 _DIALOG = "";
		 
		 INTERNAL_VirtualVol_BUT_UNBIND();
		 INTERNAL_DIADLOG_DIV_HIDE("VV_Diag");
	});	
}
function VirtualVol_View_LUN_List(idx)
{
	$("#View_LUN_List").flexigrid({
    		url: '/cgi-bin/virtual_vol.cgi',
    		dataType: 'xml',
    		cmd: 'cgi_VirtalVol_Target_View',	
    		colModel : [
    			{display: "LUN", name : 'f_lun', width : 60, align: 'left'},
    		    {display: "Share Name", name : 'f_sharename', width : 90, align: 'left'},
    		    {display: "Size", name : 'f_size', width : 150,  align: 'left'}, 		
    			{display: "Status", name : 'f_status', width : 120,  align: 'left'}, 
    			{display: "isconnect", name : 'f_conn_status', width : 0,  align: 'center',hide:true}, 
    			{display: "format", name : 'f_status', width : 80,  align: 'center'}, 
    			{display: "Del", name : 'f_del', width : 40,  align: 'center'}, 
    			],
    		usepager:true,
    		useRp: true,
    		page: 1, 
    		rp: 10,
    		showTableToggleBtn: false,
    		width: 580,
    		height: 'auto',
    		errormsg: _T('_common','connection_error'),		//Text:Connection Error
			nomsg: _T('_common','no_items'),				//Text:No items
    		noSelect:false,
    		singleSelect:true,
    		resizable: false,
    		rpOptions: [20],
    		f_field:idx,
    		onSuccess:function(){
    			$('#View_LUN_List > tbody > tr td:nth-child(2) div').each(function(){  
    					$(this).addClass('tip').attr('title', $(this).text());
    			});
    			
    			$('#View_LUN_List > tbody > tr td:nth-child(3) div').each(function(){  
    					
    					var my_str = $(this).text().split('/');
    					var my_html = (size2str(my_str[0])+ "/" + size2str(my_str[1]));
    					$(this).html(my_html);
    					$(this).addClass('tip').attr('title',my_html);
    			});
    			
    			$('#View_LUN_List > tbody > tr td:nth-child(4) div').each(function(){  
    					$(this).addClass('tip').attr('title',$(this).text());
    			});
    			$('#View_LUN_List > tbody > tr td:nth-child(5) div').each(function(){  
    				
    				if($(this).text() == "Connect")
    				{
    					$("#storage_volumevirtualDetailsDisconnect_button").show();
    					$("#storage_volumevirtualDetailsConnect_button").hide();
    				}
    				else
    				{
    					$("#storage_volumevirtualDetailsDisconnect_button").hide();
    					$("#storage_volumevirtualDetailsConnect_button").show();
    				}	
    			});	
    			
    			init_tooltip('.tip');
    		},//end of onSuccess..
    		preProcess: function(r) {
    			
    			$(r).find('row').each(function(idx){
						var my_state = $(this).find('cell').eq(3).text()
						.replace(/Running/g,_T('_vv','desc18'))
						.replace(/Formatting/g,_T('_vv','desc20'))
    					.replace(/Creating Volume/g,_T('_vv','desc22'))
						.replace(/Offline/g,_T('_vv','desc23'));
    					$(this).find('cell').eq(3).text(my_state);
				});	
    			
				if (timeoutId != 0 ) clearTimeout(timeoutId);
    			timeoutId = setTimeout(function() {
		    			VirtualVol_List_Refresh(0);
				}, 5000);
					
				return r;
    		}	
    });
}
function VirtualVol_View_LUN_Del(idx)
{
	$("#View_LUN_List tr").removeClass("trSelected");
	$("#View_LUN_List #row" + parseInt(idx, 10) + 1).addClass("trSelected");

    jConfirm( 'M',_T('_vv','msg2'), _T('_vv','title3'),"vv",function(r){	//Text:Are you sure want to delete?
		
		if(r)
	    {
	    	if (timeoutId != 0 ) window.clearTimeout(timeoutId);
		
			jLoading(_T('_common','set'), 'loading' ,'s',""); 
	    	
	    	var f_target = $("#VV_Diag_title").text();
			var f_lun = idx;
			
			wd_ajax({
				url:"/cgi-bin/virtual_vol.cgi",
				type: "POST",
				data:{cmd:'cgi_VirtalVol_LUN_Del',
						f_target:f_target,
						f_lun:f_lun},
				cache:false,
				dataType:"xml",
				success: function(xml){
					$("#View_LUN_List").flexReload();
					$("#VV_List").flexReload();
				
					setTimeout(function() {
		    			if($('#View_LUN_List > tbody > tr').length == 0)
						{
							_DIALOG.close();
							INTERNAL_VirtualVol_BUT_UNBIND();
							INTERNAL_DIADLOG_DIV_HIDE("VV_Diag");
							
							if($('#VV_List > tbody > tr').length == 0)
							{
								$("#TD_VV_Modify_Button").hide();
							}
						}
						}, 500);
						
					jLoadingClose();
				}
			});//end of ajax...
			
	    }//end of if(r)...
	    
	});//end of jConfirm
}
function VirtualVol_View_LUN_Format(f_target,idx)
{
	if (timeoutId != 0 ) window.clearTimeout(timeoutId);
	
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
	
	wd_ajax({
			url:"/cgi-bin/virtual_vol.cgi",
			type: "POST",
			data:{cmd:'cgi_VirtalVol_Format',
					f_target:f_target,
					f_lun:idx},
			cache:false,
			dataType:"xml",
			success: function(xml){
				jLoadingClose();	
				
				$("#View_LUN_List").flexReload();
			}
		});//end of ajax...
}	
function VirtualVol_View_Diag(idx)
{
	if (timeoutId != 0)  window.clearTimeout(timeoutId);
	
	$("#VV_View_LUN_List .WDLabelBodyDialogue .dialog_content .flexigrid").remove();
	$("#VV_View_LUN_List .WDLabelBodyDialogue .dialog_content").append("<table id='View_LUN_List'></table>");
	
	VirtualVol_View_LUN_List(idx);
	
	var VVObj = $("#VV_Diag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});
	VVObj.load();
	_DIALOG = VVObj;	
	
	 INTERNAL_DIADLOG_DIV_HIDE("VV_Diag");
	$("#VV_View_LUN_List").show();
	
	init_button();
	init_switch();
    $("input:text").inputReset();
	language();
	
	if (idx.length > 45)
	{
			$("#VV_Diag_title").css({
			'font-size':'15px',
			'word-wrap':'break-word',
			'word-break':'break-all'
		});
	}	
	else
		$("#VV_Diag_title").css('font-size','22px');
		
	$("#VV_Diag_title").html(idx);
	
	$("#VV_Diag .close").click(function(){
		if (timeoutId != 0)  window.clearTimeout(timeoutId);
		
		VirtualVol_List_Refresh(1);
		
		VVObj.close();
		
		INTERNAL_VirtualVol_BUT_UNBIND();
		INTERNAL_DIADLOG_DIV_HIDE("VV_Diag");
	});	
	
	$("#storage_volumevirtualDetailsDel_button").click(function(){
		jConfirm( 'M',_T('_vv','msg2'), _T('_vv','title3'), "vv", function(r){	//Text:Are you sure want to delete?	
			if (timeoutId != 0)  window.clearTimeout(timeoutId);
			if(r)
		    {
				jLoading(_T('_common','set'), 'loading' ,'s',""); 
				
				wd_ajax({
					url:"/cgi-bin/virtual_vol.cgi",
					type: "POST",
					data:{cmd:'cgi_VirtalVol_Target_Del',
					f_target:idx},
					cache:false,
					dataType:"xml",
					success: function(xml){
						$("#VV_List").flexReload();
						
						VVObj.close();
						INTERNAL_VirtualVol_BUT_UNBIND();
						INTERNAL_DIADLOG_DIV_HIDE("VV_Diag");
						
						setTimeout(function() {
							if($('#VV_List > tbody > tr').length == 0)
							{
								$("#TD_VV_Modify_Button").hide();
							}
						},500);
						
						jLoadingClose();	
					}
				});//end of ajax...
				
		    }//end of if(r)...
	    
		});//end of jConfirm
	});	
	
	$("#storage_volumevirtualDetailsDisconnect_button").click(function(){
		
		if (timeoutId != 0)  window.clearTimeout(timeoutId);
		
		jLoading(_T('_common','set'), 'loading' ,'s',""); 
		
		$("#storage_volumevirtualDetailsDisconnect_button").hide();
			
			wd_ajax({
				url:"/cgi-bin/virtual_vol.cgi",
				type: "POST",
				data:{cmd:'cgi_VirtalVol_Target_Disconnect',
					f_target:idx},
				cache:false,
				dataType:"xml",
				success: function(xml){
					jLoadingClose();
					
					$("#storage_volumevirtualDetailsConnect_button").show();
					$("#VV_LUN_List").flexReload();
					$("#View_LUN_List").flexReload();
				}
			});//end of ajax...
		
	});	
	
	$("#storage_volumevirtualDetailsConnect_button").click(function(){
		
		if (timeoutId != 0)  window.clearTimeout(timeoutId);
		
		jLoading(_T('_common','set'), 'loading' ,'s', ""); 
		$("#storage_volumevirtualDetailsConnect_button").hide();
		
		wd_ajax({
					url:"/cgi-bin/virtual_vol.cgi",
					type: "POST",
					data:{cmd:'cgi_VirtalVol_Target_Connected',
						f_target:idx},
					cache:false,
					dataType:"xml",
					success: function(xml){
						jLoadingClose();
						
						$("#VV_LUN_List").flexReload();
						$("#View_LUN_List").flexReload();
						$("#storage_volumevirtualDetailsDisconnect_button").show();
					}
		});//end of ajax...
		
	});		
}
function VirtualVol_Modify_Info(idx)
{
	wd_ajax({
		url:"/cgi-bin/virtual_vol.cgi",
		type: "POST",
		data:{cmd:'cgi_VirtalVol_Modify_Info',
			  f_target:idx},
		async:false,
		cache:false,
		dataType:"xml",
		success: function(xml){
			$("#Modify_Target").html(idx);
			$("#Modify_IP").html($(xml).find("ip").text());
			$("#Modify_Port").html($(xml).find("port").text());
			setSwitch('#storage_volumevirtualModifyAuth_switch', parseInt($(xml).find("auth").text(),10));
			if (parseInt($(xml).find("auth").text(),10) == 1)
			{
				$("#VV_Modify_User_tr").show();
				$("#VV_Modify_PWD_tr").show();
				$("#storage_volumevirtualModifyUser_text").val($(xml).find("user").text());
				$("#storage_volumevirtualModifyPWD_password").val($(xml).find("pwd").text());
			}
			else
			{	
				$("#VV_Modify_User_tr").hide();
				$("#VV_Modify_PWD_tr").hide();
				
				$("#storage_volumevirtualModifyUser_text").val("");
				$("#storage_volumevirtualModifyPWD_password").val("");
			}
		}
	});//end of ajax...
}

function VirtualVol_Modify_Diag()
{
	var grid = $("#VV_List");
	var selected_count = $('.trSelected', grid).length;
	if(selected_count==0)
	{
		jAlert( _T('_user','msg2'), "warning");	//Text:Please select one item.
		return;
	}
	
	var idx=$('.trSelected td:nth-child(1) div',grid).text()
	VirtualVol_Modify_Info(idx);
	
	var VVObj = $("#VV_Diag").overlay({expose:'#000',api:true,closeOnClick:false,closeOnEsc:false});
	VVObj.load();
	_DIALOG = VVObj;
	
	INTERNAL_DIADLOG_DIV_HIDE("VV_Diag");
	$("#VV_Modify_Target").show();
	
	init_button();
	init_switch();
    $("input:text").inputReset();
    $("input:password").inputReset();
	language();
	
	$("#VV_Diag_title").html(_T("_common","modify"));
	
	$("#VV_Diag .close").click(function(){
		VVObj.close();
		_DIALOG = "";
		INTERNAL_DIADLOG_DIV_HIDE("VV_Diag");
		INTERNAL_VirtualVol_BUT_UNBIND();
	});	
	
	$("#storage_volumevirtualModifyAuth_switch").click(function(){
		if ( getSwitch('#storage_volumevirtualModifyAuth_switch') == 0)
		{
			$("#VV_Modify_User_tr").hide();
			$("#VV_Modify_PWD_tr").hide();
		}
		else
		{
			$("#VV_Modify_User_tr").show();
			$("#VV_Modify_PWD_tr").show();
		}	
	});		
	
	$("#storage_volumevirtualModifyNext8_button").click(function(){
		var f_target = $("#Modify_Target").text();
		var f_auth = getSwitch('#storage_volumevirtualModifyAuth_switch');
		
		if ( f_auth == "1")
		{
			if ( INTERNAL_VirtualVol_format_user($("#storage_volumevirtualModifyUser_text").val()) == 0) return;
			if ( INTERNAL_VirtualVol_format_pwd($("#storage_volumevirtualModifyPWD_password").val()) == 0) return;
		}
		else
		{
					 $("#storage_volumevirtualModifyUser_text").val("");
					 $("#storage_volumevirtualModifyPWD_password").val("");
		}	
		
		var f_user = $("#storage_volumevirtualModifyUser_text").val();
		var f_pwd = $("#storage_volumevirtualModifyPWD_password").val();
		
		wd_ajax({
			url:"/cgi-bin/virtual_vol.cgi",
			type: "POST",
			data:{cmd:'cgi_VirtalVol_Modify',
				  f_target:f_target,
				  f_auth:f_auth,
				  f_user:f_user,
				  f_pwd:f_pwd},
			async:false,
			cache:false,
			dataType:"xml",
			success: function(xml){
				VVObj.close();
				_DIALOG = "";
				
				INTERNAL_VirtualVol_BUT_UNBIND();
				INTERNAL_DIADLOG_DIV_HIDE("VV_Diag");
				
				$("#VV_List").flexReload();
			}
		});//end of ajax...
	});
}