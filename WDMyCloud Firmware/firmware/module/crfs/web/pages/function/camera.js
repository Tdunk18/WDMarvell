var _g_camera_folder = "";
var __file = 1;
var	__chkflag = 0;	//for show check box	1:show	0:not
var camera_status_timeout = -1;
var gopro_status_timeout = -1;
var today_str = "";
var _g_camera_used = 0;
var _g_gopro_used = 0;
var _g_folder_name = ""
var	_g_camera_path = "";
var camera_info_timer = -1;
var gopro_found = 0;
var mtp_found = 0;
var gopro_path = new Array();
var gopro_manufacturer = new Array();
var gopro_model_number = new Array();
var gopro_sn = new Array();
var gopro_rev = new Array();
var gopro_len = 0;

function camera_create_tree_dialog(form,text_id)
{
	$("#CameraDiag").overlay().close();
//	var obj=$("#CtreeDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
//	obj.load();				
//		
//	do_query_HD_Mapping_Info();
//
//	$('#Ctree_div').fileTree({ root: '/mnt/HD' ,cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',formname:form,textname:text_id,function_id:'iscsi',filetype:'all',checkbox_all:'3',share:'1'}, function(file) {        
//    });
  ui_tab("#CtreeDiag","#Ctree_div ul li:eq(0) a","#backups_mediaCameraTreeOk_button"); 
  
  
  open_folder_selecter({
		title: _T('_media','select_destination'),
		device: "HDD", //HDD, USB, ..., ALL -> for get HDD/USB mapping
		root: '/mnt/HD',
		cmd: 'cgi_read_open_tree',
		script: '/cgi-bin/folder_tree.cgi',
		effect: 'no_son',
		formname: form,
		textname: text_id,		
		filetype: 'all',
		checkbox_all: 2,
		showfile: 0,
		chkflag: 1, //for show check box, 1:show, 0:not		
		callback: null,
		single_select: true,
		afterOK: function() {						
			var _path = translate_path_to_display($("#folder_selector input:checkbox:checked[name=folder_name]").val());
			$("#backups_mediaCameraFolder_text").val(_path);						
			select_folder_close();
			$("#CameraDiag").overlay({fixed: false, oneInstance:false, expose: '#000', api:true, closeOnClick:false, closeOnEsc:false}).load();
			$("#CameraDiag").center();	
		},
		afterCancel: function() {
			clear_path();
			$("#CameraDiag").overlay({fixed: false, oneInstance:false, expose: '#000', api:true, closeOnClick:false, closeOnEsc:false}).load();
			$("#CameraDiag").center();	
		}
	});
}
function clear_path()
{	
	$("#backups_mediaCameraFolder_text").val(_g_camera_path);	
	//var obj=$("#CameraDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	//obj.load();		
	ui_tab("#CameraDiag","#backups_mediaCameraFolder_text","#backups_mediaCameraSave_button");	
}

function select_folder_close()
{
//	var obj=$("#CameraDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
//	obj.load();				
	ui_tab("#CameraDiag","#backups_mediaCameraFolder_text","#backups_mediaCameraSave_button");
}

function open_folder_option()
{	
	if (_g_camera_used == 1) return;
	//var obj=$("#CameraDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	//obj.load();	
	$("#CameraDiag").overlay({fixed: false, oneInstance:false, expose: '#000', api:true, closeOnClick:false, closeOnEsc:false}).load();
	$("#CameraDiag").center();	
	chk_folder(_g_camera_folder);	
	$("#backups_mediaCameraFolder_text").val(_g_camera_path);		
	$("#backups_mediaCameraCustomFolder_text").val(_g_folder_name);	
	ui_tab("#CameraDiag","#backups_mediaCameraFolder_text","#backups_mediaCameraSave_button");	
	$("input:text").inputReset();			
	folder_select();
	init_select();	
}
function chk_folder(v)
{		
	if (v == 2)
	{
		$("#id_folder_name").show();
	}
	else
	{
		$("#id_folder_name").hide();
	}	
}
function folder_option_cancel()
{	
	$("#backups_mediaCameraCustomFolder_text").val(_g_folder_name);	
	$("#backups_mediaCameraFolder_text").val(_g_camera_path);	
	$("#id_camera_option").text(get_option_value(_g_camera_folder));
	$("#id_camera_option").attr('rel',_g_camera_folder);
	
	if (_g_camera_folder == 2)
		$("#id_folder_name").show();
	else
		$("#id_folder_name").hide();	

}
function folder_option_save()
{
	if (camera_save() == 1) return;
	$("#CameraDiag").overlay().close();	
}
function camera_save()
{
	if (_g_camera_used == 1) return;
			
	var option = $("#id_camera_option").attr("rel");				
	if (typeof(option) != "undefined")
	{
		if (option == "2") //custom
		{
			var ret = $("#backups_mediaCameraCustomFolder_text").val().trim();
			var flag=Chk_Folder_Name(ret);
			if(flag==1)	//function.js
			{
				//alert('The folder name must not include the following characters: \\ / : * ? " < > | ')				
				jAlert(_T('_network_access', 'msg3'), _T('_common', 'error'));		 
				return 1;
			}
			else if(flag==2)
			{
				//alert("Not a valid folder name.")		
				jAlert(_T('_network_access', 'msg4'), _T('_common', 'error'));
				return 1;	
			}
			else if(flag==3)
			{
				jAlert(_T('_wfs', 'msg4'), _T('_common', 'error')); //Cannot input blank characters
				return 1;	
			}
			if(ret.length > 226)
			{
				//alert("folder name length should be 1-226.");		
				jAlert(_T('_network_access', 'msg5'), _T('_common', 'error'));
				return 1;
			}
		}
		else
		{
			$("#backups_mediaCameraCustomFolder_text").val('');
		}
	}
	var auto = getSwitch('#backups_mediaCameraAutoTransfer_switch');
	var mode = $('#TransferMode').attr('rel');

	var transfer_folder = $("#backups_mediaCameraFolder_text").val();
	var option = $("#id_camera_option").attr("rel");		
	var folder = $("#backups_mediaCameraCustomFolder_text").val().trim();
	if (typeof(option) == "undefined")
	{
		transfer_folder = _g_camera_path
		option = _g_camera_folder
		folder = _g_folder_name
	}
	else
	{
		_g_camera_path = $("#backups_mediaCameraFolder_text").val();
		_g_folder_name = $("#backups_mediaCameraCustomFolder_text").val();
		_g_camera_folder = $("#id_camera_option").attr("rel");
	}	
	
	transfer_folder = transfer_folder.replace(/&nbsp;/g, ' ');
	transfer_folder = transfer_folder.replace(/&amp;/g, '&');	
	if (transfer_folder.substring(0,1) != "/")
	{
		transfer_folder = "/"+transfer_folder;
	}
		
	if (option =="2" && folder == "")
	{		
		jAlert(_T('_media','msg1'), _T('_common','error'));
		return 1;	
	}
	

	
	//return;		
	jLoading(_T('_common','set'), 'loading' ,'s',""); 
	
	var str = "auto="+auto
	str+=",mode="+mode
	str+=",transfer_folder="+transfer_folder
	str+=",option="+option
	str+=",folder="+folder;	
	switch_copy_move(mode);
	//return;

		wd_ajax({
			url: "/cgi-bin/app_mgr.cgi",
			type: "POST",
			async: false,
			cache: false,
			data:{cmd:'cgi_camera',
				automatic:auto,
				mode:mode,
				transfer_folder:transfer_folder,
				option:option,				
				folder:folder
			},	
			dataType:"html",
			success: function(data){					 				
					jLoadingClose();			
					
			}//end of success: function(xml){
		}); //end of wd_ajax({	
}

function camera_info()
{		
//	/*
//	if mtp/gopro is backuping, not get device information.
//	*/
//	if (_g_gopro_used == 1 || _g_camera_used == 1) 
//	{
//		camera_info_timer = setTimeout(camera_info,5000); 
//		return;
//	}
		mtp_found = 0;
		wd_ajax({
			url: "/xml/mtp_info.xml",
			type: "POST",
			async: true,
			cache: false,		
			dataType:"xml",
			success: function(xml){					 				
				var device_name = new Array();
				var mtp_info = new Array();
			
				$(xml).find('mtp').each(function(index){	
						device_name[index] = $(this).find('device_name').text();
						mtp_info[index] = $(this).find('bus').text()+"-"+$(this).find('port').text()+","+$(this).find('devnum').text();			
						mtp_found = 1;											
			
					});	
				
					if (device_name.length == 0) //usb remove.
					{
							$("#backups_mediaCameraInfo_value").removeClass("select_menu");
							$("#backups_mediaCameraInfo_value").html(_T('_common','none'));
							$("#backups_mediaCameraCopy_button").addClass("gray_out");
							$("#backups_mediaCameraMove_button").addClass("gray_out");
							$("#backups_mediaCameraPercent_bar").text(_T('_common','none'));														
					}							
					else
					{																	
							var name = $("#id_backups_mediaCameraInfoSelect_value").text();
							var rel = $("#id_backups_mediaCameraInfoSelect_value").attr("rel");
							$("#backups_mediaCameraInfo_value").removeClass("select_menu").addClass("select_menu");
							
							var my_html_options = "";
							my_html_options+="<ul>";
							my_html_options+="<li class='option_list'>";
							my_html_options+="<div id=\"backups_mediaCameraInfo_select\" class=\"wd_select option_selected\">";
							my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
							var name_found = 0;
							for (var i = 0;i<device_name.length;i++)
							{
								if (name == device_name[i])
								{
									rel = mtp_info[i];
								 	name_found = 1;								
							        }
							}
							if (name != "" && name_found == 1)
								my_html_options+="<div class=\"sBody text wd_select_m\" rel=\""+rel+"\" id=\"id_backups_mediaCameraInfoSelect_value\">"+name+"</div>";
							else
							{		
								my_html_options+="<div class=\"sBody text wd_select_m\" rel=\""+mtp_info[0]+"\" id=\"id_backups_mediaCameraInfoSelect_value\">"+device_name[0]+"</div>";
								camera_status();
							}
								
							my_html_options+="<div class=\"sRight wd_select_r\"></div>";
							my_html_options+="</div>";
							my_html_options+="<ul class='ul_obj' id='id_sch_hour_li'>"
							my_html_options+="<div>";																																					
							for (var i = 0;i<device_name.length;i++)
							{		
								my_html_options+="<li rel=\""+mtp_info[i]+"\"><a onclick='camera_status();' href='#'>"+device_name[i]+"</a>";		
							}						
							my_html_options+="</div>";
							my_html_options+="</ul>";
							my_html_options+="</li>";
							my_html_options+="</ul>";
							$("#backups_mediaCameraInfo_value").html(my_html_options);
							init_select();
																										
							$("#backups_mediaCameraCopy_button").removeClass("gray_out");
							$("#backups_mediaCameraMove_button").removeClass("gray_out");	
							
					
					}	
					camera_info_timer = setTimeout(camera_info,5000);
			},//end of success: function(xml){
			error:function()
			{
				$("#backups_mediaCameraInfo_value").html(_T('_common','none'));
				$("#backups_mediaCameraCopy_button").addClass("gray_out");
				$("#backups_mediaCameraMove_button").addClass("gray_out");
				$("#backups_mediaCameraPercent_bar").text(_T('_common','none'));								
				camera_info_timer = setTimeout(camera_info,5000);
			}
		}); //end of wd_ajax({	
}
function init_camera()
{	
		wd_ajax({
			url: "/cgi-bin/app_mgr.cgi",
			type: "POST",
			async: false,
			cache: false,
			data:{cmd:'cgi_get_camera'		
			},	
			dataType:"html",
			success: function(xml){					 				
				var auto = $(xml).find('automatic').text();				
				var mode = $(xml).find('mode').text();
				var trans = $(xml).find('transfer_folder').text();				
				var option = $(xml).find('option').text();
				var folder = $(xml).find('folder_name').text();												
				SetMapping('#TransferMode',parseInt(mode,10));	
				setSwitch('#backups_mediaCameraAutoTransfer_switch', parseInt(auto,10)); 
				if (trans.charAt(0) == "/")
					trans = trans.substring(1);
				$("#backups_mediaCameraFolder_text").val(trans);
				$("#backups_mediaCameraCustomFolder_text").val(folder);
				_g_camera_folder = parseInt(option,10);						
				_g_folder_name = 	folder;
				_g_camera_path = trans;										
				get_option_value(_g_camera_folder);
				//mode:0 ->copy
				switch_copy_move(mode);
				
			}//end of success: function(xml){
		}); //end of wd_ajax({	
/*
	$("#id_copy_file").progressbar({value:0});
	$("#id_move_file").progressbar({value:0});
*/	
			
}
function camera_cancel()
{
//	clearTimeout(camera_status_timeout);
//	clearTimeout(gopro_status_timeout);
	gopro_len = gopro_path.length;
	clearTimeout(camera_status_timeout);
	
	var mode = $('#TransferMode').attr('rel');			
	$("#backups_mediaCameraAutoTransfer_switch").attr("disabled",false);
	$("#backups_mediaCameraAutoTransfer_switch").removeClass("gray_out");
										
	$("#TransferMode").removeClass("gray_out");
										
	$("#backups_mediaCameraMove_button").hide();										
	$("#backups_mediaCameraCopy_button").hide();
	if (mode == 0)
	    $("#backups_mediaCameraCopy_button").show();
	else	
	    $("#backups_mediaCameraMove_button").show();					
						
	$("#backups_cameraCancel_button").hide();
					
	$("#backups_mediaCameraPercent_bar").text(_T('_button','Cancel')+"...")
	
	wd_ajax({
			url: "/cgi-bin/app_mgr.cgi",
			type: "POST",
			async: true,
			cache: false,
			data:{cmd:'cgi_camera_cancel',gopro_used:_g_gopro_used		
			},	
			dataType:"html",
			success: function(data){					 				
					_g_camera_used = 0;					
					_g_gopro_used = 0;																
					camera_status_timeout = setTimeout(function(){camera_status();},2000);
										
			}//end of success: function(xml){
		}); //end of wd_ajax({	
}
function switch_copy_move(mode)
{
	if (mode == "0")
	{
		$("#tip_move").hide();
		$("#id_move_file").hide();
		$("#backups_mediaCameraMove_button").hide();
		$("#tip_copy").show();
		$("#id_copy_file").show();
		$("#backups_mediaCameraCopy_button").show();
		
		$("#backups_cameraCancel_button").hide();;	
	}	
	else	
	{	
		$("#tip_copy").hide();
		$("#id_copy_file").hide();
		$("#backups_mediaCameraCopy_button").hide();
		$("#tip_move").show();
		$("#id_move_file").show();
		$("#backups_mediaCameraMove_button").show();		
		$("#backups_cameraCancel_button").hide();;									
	}	
}
function action_now(id)
{
//	console.log("_g_camera_used = %s",_g_camera_used);
//	console.log("mtp_found = %s",mtp_found);
//	console.log("gopro_found = %s",gopro_found);
		
	if (_g_camera_used == 1 || _g_gopro_used == 1) return;
	if ($("#"+id).hasClass("gray_out")) return;
		
	_g_gopro_used = 0;
	

	if (mtp_found == 1)
	{		
		_g_camera_used = 1;	
		
		var command = $("#id_backups_mediaCameraInfoSelect_value").attr("rel");
		var mode = $('#TransferMode').attr('rel');
		
		if (mode == "0")
			mode = "copy"
		else if (mode == "1")
			mode = "move"
		clearTimeout(camera_status_timeout);
		
		
		$("#backups_mediaCameraPercent_bar").html('<img src="/web/images/WD-Anim-barber-fast.gif" border="0" height="13" class="list_icon_bar_anim">');
		$("#backups_mediaCameraAutoTransfer_switch").attr("disabled",true);
		$("#backups_mediaCameraAutoTransfer_switch").addClass("gray_out");
		$("#TransferMode").addClass("gray_out");
		$("#backups_mediaCameraMove_button").hide();
		$("#backups_mediaCameraCopy_button").hide();
		$("#backups_cameraCancel_button").show();;		
		
	
		wd_ajax({
				url: "/cgi-bin/app_mgr.cgi",
				type: "POST",
				async: true,
				cache: false,
				data:{cmd:'cgi_camera_action',command:command,mode:mode},					
				dataType:"html",
				success: function(data){		
					camera_status_timeout = setTimeout(function(){
						camera_status();					
						},6000);					
				}//end of success: function(xml){
			}); //end of wd_ajax({	
	}
	else if (gopro_found == 1)		
	{				
		action_now_gopro();
	}			
}
function action_now_gopro()
{	
	if (gopro_len != 0 )
	{	
		gopro_len = gopro_len -1;
		_g_camera_used = 1;
		_g_gopro_used = 1;	
		wd_ajax({
					url: "/cgi-bin/app_mgr.cgi",
					type: "POST",
					async: true,
					cache: false,
					data:{cmd:'cgi_gopro_action',path:gopro_path[gopro_len],manufacturer:gopro_manufacturer[gopro_len],model:gopro_model_number[gopro_len],sn:gopro_sn[gopro_len],rev:gopro_rev[gopro_len]	
					},	
					dataType:"html",
					success: function(data){	
						setTimeout(function(){							
						gopro_status();				
						},4000);
					}//end of success: function(xml){
				}); //end of wd_ajax({	
	}
}
function gopro_status(flag)
{	
		wd_ajax({
					url: "/xml/gopro/gopro_camera.xml",
					type: "POST",
					async: false,
					cache: false,		
					dataType:"xml",
					success: function(xml){							
							$(xml).find('config').each(function(index){	
									var status = $(this).find('status').text();
									var p = $(this).find('percent').text();								
									var time = $(this).find('time').text();
									var file_count = $(this).find('file_count').text();
									var camera_name = $(this).find('device_name').text();
									var success_mode = $(this).find('transfer_mode').text();
									var date = new Date(time * 1000);	
//console.log("p = %s",p);
//console.log("status = %s",status);
									clearTimeout(gopro_status_timeout);		
									if (p == "" && status == "init")
									{
										_g_camera_used = 0
										_g_gopro_used = 0;
										gopro_len = gopro_path.length;										
										return;
									}
									else if (status == "success" || status == "fail" )
									{																			
										var mode = $('#TransferMode').attr('rel');
										var path = _g_camera_path;
										var option = _g_camera_folder;	
										var success_mode;	
										if (option == "0")
										{						
											path = path +today_str+"/";
										}
										else if (option == "2")
										{
											path = path + _g_folder_name+"/";
										}	
							
										$("#backups_mediaCameraPercent_bar").text(_T('_remote_backup','ready'));
										$("#TransferMode").removeClass("gray_out");
						
										$("#backups_mediaCameraAutoTransfer_switch").attr("disabled",false);
										$("#backups_mediaCameraAutoTransfer_switch").removeClass("gray_out");
														
										if (mode == 0)
										{
											$("#backups_mediaCameraCopy_button").show();
											$("#backups_mediaCameraMove_button").hide();
										}	
										else	
										{	
											$("#backups_mediaCameraCopy_button").hide();
											$("#backups_mediaCameraMove_button").show();
										}	
											
										$("#backups_cameraCancel_button").hide();;	
					
										if (status == "success")
										{											
											if (success_mode == 0)
												var str = _T('_media','msg2')
											else	
												var str = _T('_media','msg3')
											
											str = str.replace(/%s3/g,multi_lang_format_time(date)).replace(/%s2/g,path).replace(/%s1/g,camera_name).replace(/%s/g,file_count);																						
										}
										else
										{
											//camera_name = "camera";
											//file_count = "0";																								
											//jAlert( _T('_download','fail'), _T('_common','error'));
											if (success_mode == 0)
												var str = _T('_media','msg4'); 												
											else
												var str = _T('_media','msg5');	
											  
											  str = str.replace(/%s1/g,path).replace(/%s/g,file_count);											 	
										}																														
															
										$("#backups_mediaCameraPercent_bar").text(str)
											
//console.log("str = %s",str);											
//console.log("gopro_len = %s",gopro_len);
//console.log("flag = %s",flag);
										if (flag == 0 ||  gopro_len == 0)
										{
											_g_camera_used = 0;
											_g_gopro_used = 0;	
											gopro_len = gopro_path.length;												
										} 
										else if (_g_camera_used == 0 && _g_gopro_used == 0)
										{
											//user push [cancel] button											
											return;
										}	
										else if (gopro_len != 0 )
												setTimeout(action_now_gopro,3000);																												
									}
									else
									{
											_g_camera_used = 1;
											gopro_status_timeout = setTimeout(gopro_status,5000);
																		
											$("#TransferMode").removeClass("gray_out");
									
											$("#backups_mediaCameraAutoTransfer_switch").attr("disabled",true);
											$("#backups_mediaCameraAutoTransfer_switch").addClass("gray_out");
											
											$("#TransferMode").addClass("gray_out");
											$("#backups_mediaCameraMove_button").hide();
											$("#backups_mediaCameraCopy_button").hide();	
											$("#backups_cameraCancel_button").show();
											
											if($("#id_move_file").text().indexOf(".....")!= -1)
											{
												var j = $("#id_move_file").text().replace(".....", "...");
												$("#id_move_file").text(j)
												
												var j = $("#id_copy_file").text().replace(".....", "...");
												$("#id_copy_file").text(j)
											}
											else if($("#id_move_file").text().indexOf("...")!= -1)
											{
												var j = $("#id_move_file").text().replace("...", ".....");
												$("#id_move_file").text(j)
												
												var j = $("#id_copy_file").text().replace("...", ".....");
												$("#id_copy_file").text(j)
											}
											else
											{
												$("#id_move_file").text($("#id_move_file").text()+" .....")
												$("#id_copy_file").text($("#id_copy_file").text()+" .....")
											}		
														
									}	
						});	
								
					},
					error:function(){
						//_g_camera_used = 1;									
						//gopro_status_timeout = setTimeout(gopro_status,5000);
						clearTimeout(gopro_status_timeout);
						_g_camera_used = 0
						_g_gopro_used = 0;
						gopro_len = gopro_path.length;						
						return;
					}					
				});				
}
function camera_status(flag)
{			
	wd_ajax({
			url: "/cgi-bin/app_mgr.cgi",
			type: "POST",
			async: true,
			cache: false,
			data:{cmd:'cgi_get_camera_status'		
			},	
			dataType:"xml",
			success: function(xml){									
				var data = $(xml).find('status').text();		
				var p = $(xml).find('percent').text();	
				if (p == "")p = 0;			
				clearTimeout(camera_status_timeout);
				camera_status_timeout = setTimeout(camera_status,5000);			
					
				if (mtp_found	== 0) return false;
				if (data == "")
				{				
						$("#backups_mediaCameraPercent_bar").text(_T('_remote_backup','ready'));
						//do nothing;system reboot.
				}	
				else if (data == "2")
				{																														
					_g_camera_used = 1;
					$("#TransferMode").removeClass("gray_out");			
					$("#backups_mediaCameraAutoTransfer_switch").attr("disabled",true);
					$("#backups_mediaCameraAutoTransfer_switch").addClass("gray_out");					
					$("#TransferMode").addClass("gray_out");
					$("#backups_mediaCameraMove_button").hide();
					$("#backups_mediaCameraCopy_button").hide();					
					$("#backups_cameraCancel_button").show();;						
			    
			    var mode = $('#TransferMode').attr('rel');
			    wd_ajax({
								url: "/xml/mtp_download.xml",
								type: "POST",
								async: true,
								cache: false,							
								dataType:"xml",
								success: function(xml){		
									var index = $(xml).find('index').text();
									var total = $(xml).find('total').text();
									var percent = $(xml).find('percentage').text();
									var fname = $(xml).find('fname').text();
									var camera_name = $(xml).find('device_name').text();				
									var command = $(xml).find('bus').text()+"-"+$(xml).find('port').text()+","+$(xml).find('devnum').text();	
										
									$("#id_backups_mediaCameraInfoSelect_value").text(camera_name);
									$("#id_backups_mediaCameraInfoSelect_value").attr("rel",command);
									
									var str = "";
									if (mode == 0 )																
										str = _T('_media','copy_f')+" ";
									else
											str = _T('_media','move_f')+" ";			
											
									var bar = '<div class="list_icon_bar" style="">' +
										'<div class="bar_p" style="float: left; width: {0}%;"></div>' +
									  '</div>' +
									  '<div class="list_bar_text TooltipIcon" title="{2}">{3}/{4}, {5} {1}</div>';
			
						if (percent == "") percent = 0;
						$("#backups_mediaCameraPercent_bar").html(String.format(bar, percent, fname,fname,index,total,str))   			
						init_tooltip();
						
								},//end of success: function(xml){
								error:function(){								
												$("#backups_mediaCameraPercent_bar").html('<img src="/web/images/WD-Anim-barber-fast.gif" height="13" border="0" class="list_icon_bar_anim">');	
												
								}
							}); //end of wd_ajax({	
	
	
				}		
				else
				{

  					var mode = $('#TransferMode').attr('rel');
					$("#TransferMode").removeClass("gray_out");
	
					$("#backups_mediaCameraAutoTransfer_switch").attr("disabled",false);
					$("#backups_mediaCameraAutoTransfer_switch").removeClass("gray_out");
									
					if (mode == 0)
					{
						$("#backups_mediaCameraCopy_button").show();
						$("#backups_mediaCameraMove_button").hide();
					}	
					else	
					{
						$("#backups_mediaCameraCopy_button").hide();	
						$("#backups_mediaCameraMove_button").show();
					}	
					
					$("#backups_cameraCancel_button").hide();
					
					var camra_name,file_count,time,data = "";					
					 var camera_found = 0;
						wd_ajax({
								url: "/xml/mtp_status.xml",
								type: "POST",
								async: true,
								cache: false,							
								dataType:"xml",
								success: function(xml){		
										var name = $("#id_backups_mediaCameraInfoSelect_value").text();
										var rel = $("#id_backups_mediaCameraInfoSelect_value").attr("rel");																		
										$(xml).find('mtp').each(function(index){		
										camera_name = $(this).find('device_name').text();				
										var command = $(this).find('bus').text()+"-"+$(this).find('port').text()+","+$(this).find('devnum').text();	

										if (name == camera_name && command == rel)
										{											
											file_count = $(this).find('file_count').text();
											time = $(this).find('time').text();
											success_mode = $(this).find('transfer_mode').text();
											data = $(this).find('status').text();
											date = new Date(time * 1000);	
											camera_found = 1;
											return false;
										}										
									});																			
									var str = "";		
									if (camera_found == 0) data = 1;	
									if (data == "1") //ready
									{
										str = _T('_remote_backup','ready');
									}																		
									if (data == "0") //success
									{																																				
										//str = "Backup completed successfully from "+camera_name+" on "+multi_lang_format_time(date);								
										str =  _T('_media','status_success');
										str = str.replace(/%s1/g,multi_lang_format_time(date)).replace(/%s/g,camera_name);			
									}
									else if (data == "-1")//fail		
									{
										//str = "Backup failed. Please check the connected USB device.";
										str =  _T('_media','status_fail1');
									}	
									else if (data == "-3")//fail		
									{
										//str = "Backup failed. The backup destination path is invalid. Please correct the backup settings and try again.";
										str =  _T('_media','status_fail2');
									}	
									else if (data == "-6")//fail		
									{																														
										//str = "Backup failed due to system error. Please reboot the My Cloud system.";
										str =  _T('_media','status_fail3');
									}	
									else if (data == "-9")//fail		
									{
										//str = "The backup destination is read-only. Please correct the backup settings.";	
										str =  _T('_media','status_fail4');
									}
									else if (data == "-10")//cancel
									{
										str =  _T('_media','status_fail6');
										str = str.replace(/%s/g,multi_lang_format_time(date))
									}	
									else if (data == "-11")//fail		
									{										
										//str = "Storage space is full at the backup destination. Move files off the destination to create free space.";
										str =  _T('_media','status_fail5');
									}	
									else if (data == "-31")//Unable to delete files from [device name].
									{																
										str =  _T('_media','status_fail7');
										str = str.replace(/%s/g,camera_name);			
									}	
				
										
				
									if ($("#backups_mediaCameraPercent_bar").text()!=_T('_common','none'))													
											$("#backups_mediaCameraPercent_bar").text(str)
									_g_camera_used = 0;

								},//end of success: function(xml){
								error:function(){								
								}
							}); //end of wd_ajax({	
																							
				

				}
					
			}//end of success: function(xml){		
		}); //end of wd_ajax({	
	
}
function num_transform_string(num)	// 9 -> 09
{
	if (parseInt(num) < 10)
		var str = "0"+num;
	else
		var str = num;	
	return str;
}

function SetMapping(obj,val,ftype)
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

function get_option_value(rel)
{
	var now = new Date();
	
	today_str = "";
	
	if (DATE_FORMAT == "YYYY-MM-DD")
	{
		today_str = now.getFullYear()+"-"+num_transform_string(now.getMonth()+1)+"-"+now.getDate();
	}
	else if (DATE_FORMAT == "MM-DD-YYYY")
		today_str = now.getMonth()+1+"-"+now.getDate()+"-"+now.getFullYear()
	else if (DATE_FORMAT == "DD-MM-YYYY")	
		today_str = now.getDate()+1+"-"+num_transform_string(now.getMonth()+1)+"-"+now.getFullYear()
	
	var select_array = new Array(
			//0,1,2
			//_T('_media','today_date')+"&nbsp;("+today_str+")",_T('_media','date_taken')+"&nbsp;("+DATE_FORMAT+")",_T('_media','custom_folder_name')
			_T('_media','today_date'),_T('_media','date_taken'),_T('_media','custom_folder_name')
			);



	var select_v_array = new Array(
			0,1,2
			);

			SIZE = 3;
			SIZE2 = 2;
			
			var a = new Array(SIZE);
			
			for(var i=0;i<SIZE;i++)
			{
				a[i] = new Array(SIZE2);
			}



			for(var i = 0; i < SIZE; i++)
				for(var j = 0; j < SIZE2; j++)
				{
					a[i][0] = select_array[i];
					a[i][1] = select_v_array[i];
				}
				
	
					for(var i = 0; i < SIZE; i++)
							for(var j = 0; j < SIZE2; j++)
							{
								a[i][0] = select_array[i];
								a[i][1] = select_v_array[i];
								if (a[i][1] == rel)
								{									
								 return a[i][0];
								}
							}					
}
function folder_select()
{
	var now = new Date();
	
	today_str = "";
	
	if (DATE_FORMAT == "YYYY-MM-DD")
	{
		today_str = now.getFullYear()+"-"+num_transform_string(now.getMonth()+1)+"-"+now.getDate();
	}
	else if (DATE_FORMAT == "MM-DD-YYYY")
		today_str = now.getMonth()+1+"-"+now.getDate()+"-"+now.getFullYear()
	else if (DATE_FORMAT == "DD-MM-YYYY")	
		today_str = now.getDate()+1+"-"+num_transform_string(now.getMonth()+1)+"-"+now.getFullYear()
	
	var select_array = new Array(
			//0,1,2
			//_T('_media','today_date')+"&nbsp;("+today_str+")",_T('_media','date_taken')+"&nbsp;("+DATE_FORMAT+")",_T('_media','custom_folder_name')
			_T('_media','today_date'),_T('_media','date_taken'),_T('_media','custom_folder_name')
			);



	var select_v_array = new Array(
			0,1,2
			);

			SIZE = 3;
			SIZE2 = 2;
			
			var a = new Array(SIZE);
			
			for(var i=0;i<SIZE;i++)
			{
				a[i] = new Array(SIZE2);
			}



			for(var i = 0; i < SIZE; i++)
				for(var j = 0; j < SIZE2; j++)
				{
					a[i][0] = select_array[i];
					a[i][1] = select_v_array[i];
				}




			$('#id_camera_option_top_main').empty();
				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";								
				my_html_options+="<div id=\"backups_mediaCameraFolder_select\" class=\"wd_select option_selected\">";					
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_camera_option\" rel='"+_g_camera_folder+"'>"+map_table(_g_camera_folder)+"</div>";				
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_camera_option_li'><div>"
				my_html_options+="<li id=\"backups_mediaCameraFolderLi1_select\"  class=\"li_start\" rel=\""+select_v_array[0]+"\"><a href='#' onclick='chk_folder(\""+select_v_array[0]+"\")'>"+select_array[0]+"</a>";
					
				
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li id=\"backups_mediaCameraFolderLi"+(i+1)+"_select\" rel=\""+select_v_array[i]+"\"><a href='#' onclick='chk_folder(\""+select_v_array[i]+"\")'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li id=\"backups_mediaCameraFolderLi"+(j+1)+"_select\" class=\"li_end\" rel='"+select_v_array[j]+"'><a href='#' onclick='chk_folder(\""+select_v_array[j]+"\")'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div></ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				
			
				
				$("#id_camera_option_top_main").append(my_html_options);	
				
				function map_table(rel)
				{
					for(var i = 0; i < SIZE; i++)
							for(var j = 0; j < SIZE2; j++)
							{
								a[i][0] = select_array[i];
								a[i][1] = select_v_array[i];
								if (a[i][1] == rel)
								{									
								 return a[i][0];
								}
							}					
				}
	
}

