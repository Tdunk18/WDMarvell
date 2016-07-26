var _INIT_S3_DIAG_FLAG=0;	
var S3_MODIFY = 0;
var __RUN_WIZARD  = false;
var _FINISH = false;
var _MAX_TOTAL_JOB=16;
var TASK_PERCENT = new Array();
var SELECTED_TASK = ""
var loop_percent = "";
var detail_job_name = "";
function init_s3_dialog()
{

	language();
	if (_INIT_S3_DIAG_FLAG == 1) return;
	
	_INIT_S3_DIAG_FLAG=1;
	
	//s3_show_schedule_div(1);		
	init_switch();	
	
	$("#tip_autoupdate").attr('title',_T('_tip','s3_auto'));
	$("#tip_b_path").attr('title',_T('_tip','s3_backup'));	
	
	
	init_tooltip();	
	
	$("#backups_s3Save_button").click(function(){		
		if (_FINISH == true) return;
		_FINISH = true;															
		var str;
		if (S3_MODIFY == 1)
					str="cmd=cgi_s3_modify";
		else 			
				str="cmd=cgi_s3";
				
			str += "&f_job_name=" + $("#backups_s3JobName_text").val();
			str += "&f_username=" + $("#f_username").val();			
			//str += "&f_dir=" + $("#f_dir").val();
			str += "&f_dir=" + $("#id_dir").attr('rel'); //amymodify
			str += "&f_a_key=" + encodeURIComponent($("#backups_s3AccessKey_text").val());
			str += "&f_p_key=" + encodeURIComponent($("#backups_s3SecretKey_text").val());
			
			var path = $("#backups_s3RemotePath_text").val();
			path=path.replace(/&nbsp;/g,' ');
			path=path.replace(/&amp;/g,'&');
			
			str += "&f_b_path=" + encodeURIComponent(path);
			
			
			str += "&f_location=" +$("#id_location").attr('rel');
			str += "&f_backuptype=" +$("#id_backuptype").attr('rel');
			
			var path =translate_path_to_really($("#backups_s3LocalPath_text").val());
			//path=path.replace(/&nbsp;/g,' ');
			//path=path.replace(/&amp;/g,'&');
			str += "&f_local_path=" +encodeURIComponent(path);		
			
			//var schedule_type=$('#s3Diag input[name=f_s3_schedule_type]:checked').val()		
			
					var j = getSwitch('#backups_s3Auto_switch');
					var schedule_type;
					if (j == 0 )
					{
						schedule_type = 1;
			 		}
			 		else
			 		{
			 			schedule_type = 3;
			 		}	
			
			str += "&f_schedule_type=" + schedule_type;
			
			if (schedule_type == "1") //manual
			{
				str += "&f_backup_now=" + $('#f_backup_now').attr('rel');								
				str += "&s_type=4";
			}
			else if (schedule_type == "3")
			{
					str += "&s_type=" + $("#s_type").attr('rel');
					str += "&f_hour=" + $("#id_sch_hour").attr('rel');
					str += "&f_min=0";
					str += "&f_week=" + $("#id_sch_week").attr('rel');
					str += "&f_day=" + $("#id_sch_day").attr('rel');
			}	
															
		var s3Obj=$("#s3Diag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});			
			s3Obj.close();
			
			//var overlayObj=$("#overlay").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
			//overlayObj.load();		
			jLoading(_T('_common','set') ,'loading' ,'s',"");
				
			__RUN_WIZARD = true;
			
//alert(str);
//return;			
			
			if (S3_MODIFY == 0)
			{
				var total = $("#s3_tb").flexTotal();
				if (total == 0)
						google_analytics_log('amazon-s3-en', 1);	
			}				
			
			wd_ajax({
			type:"POST",
			url:"/cgi-bin/s3.cgi",
			data:str,
			cache:false,
			async:true,
			success:function(data){			
				setTimeout(function(){				
					//overlayObj.close();											
					jLoadingClose();
					
//					if (data == "OK" )
//						jAlert(_T('_common','update_success'), _T('_common','success'));						
//					else if (data == "62")
//					{							
//						jAlert(_T('_s3','time_error'), _T('_common','error'));	
//					}	
//					else if (data == "64")
//					{							
//						jAlert(_T('_s3','key_error'), _T('_common','error'));	 //accesskey error
//					}	
//					else if (data == "103")
//						jAlert(_T('_s3','private_key_error'), _T('_common','error'));		
//					else	if (data == "6")
//					{
//						jAlert(_T('_s3','bucket_error'), _T('_common','error'));								
//					}	
//					else	if (data == "48")
//					{
//						jAlert(_T('_s3','bucket_error1'), _T('_common','error'));								
//					}	
//					else
//					{						
//						jAlert(_T('_common','connection_error'), _T('_common','error'));
//					}	
					
					},2000);	
					$("#s3_tb").flexReload();
					__RUN_WIZARD = false;					
			},
			error:function(){
			}
		});				
		
		S3_MODIFY = 0;
		_FINISH = false;
			//alert(str);
				
	});
	
	$("#backups_s3Auto_switch").click(function(){			
		var v = getSwitch('#backups_s3Auto_switch');
		if( v==1 )
		{
			$("#schedule_tr").show();
			$("#schedule_div").show();
			$("#backup_now_div").hide();
	
			show_schedule_type_div($("#s_type").attr('rel'));
		}
		else
		{
			$("#schedule_tr").hide();
			$("#schedule_div").hide();	
			$("#backup_now_div").show();
		}
	});
	$("#s_next_button_0").click(function(){				
		$("#s3_wizard_step1").show();
		$("#s3_wizard_step0").hide();
	});
	
	$("#backups_s3Next1_button").click(function(){
		if (check_step1() == 1) return;		
		$("#s3_wizard_step1").hide();
		$("#s3_wizard_step2").show();
			ui_tab("#s3Diag","#backups_s3Region_select","#backups_s3Next2_button");
	});
		
	$("#backups_s3Next2_button").click(function(){
		if (check_step2() == 1) return;		
		$("#s3_wizard_step2").hide();
		$("#s3_wizard_step3").show();
		ui_tab("#s3Diag","#backups_s3Type_select","#backups_s3Next3_button");
		
	});
	$("#backups_s3Next3_button").click(function(){		
		
		$("#s3_wizard_step3").hide();
		$("#s3_wizard_step4").show();
		ui_tab("#s3Diag","#backups_s3LocalPath_button","#backups_s3Next4_button");
	});
	
	$("#backups_s3Next4_button").click(function(){
		
		if (check_step3() == 1) return;
		$("#s3_wizard_step4").hide();
		ui_tab("#s3Diag","#auto_update_tr .checkbox_container","#backups_s3Next5_button");
		$("#auto_update_tr .checkbox_container").focus();
		$("#s3_wizard_step5").show();
		
	});
	
	$("#backups_s3Next5_button").click(function(){
		
		view();	
				
		$("#s3_wizard_step5").hide();
		$("#s3_wizard_finish").show();
		ui_tab("#s3Diag","#backups_s3Back6_button","#backups_s3Save_button");
	});
	
	$("#backups_s3Back2_button").click(function(){
		$("#s3_wizard_step2").hide();
		$("#s3_wizard_step1").show();
		ui_tab("#s3Diag","#backups_s3JobName_text","#backups_s3Next1_button");
	});
		$("#backups_s3Back3_button").click(function(){
			
		$("#s3_wizard_step3").hide();
		$("#s3_wizard_step2").show();
		ui_tab("#s3Diag","#backups_s3Region_select","#backups_s3Next2_button");
	});					
	
	$("#backups_s3Back4_button").click(function(){
		
		$("#s3_wizard_step4").hide();
		$("#s3_wizard_step3").show();
		ui_tab("#s3Diag","#backups_s3Type_select","#backups_s3Next3_button");
	});
	$("#backups_s3Back5_button").click(function(){
		
		$("#s3_wizard_step5").hide();
		$("#s3_wizard_step4").show();
		ui_tab("#s3Diag","#backups_s3LocalPath_button","#backups_s3Next4_button");
	});
		
		$("#backups_s3Back6_button").click(function(){
		
		$("#s3_wizard_finish").hide();
		$("#s3_wizard_step5").show();
	});
		
	
}

function s3_open(v)
{

	
if(v == "-") v = detail_job_name;	
	$('#s3_percent_info').html('<img src="/web/images/SpinnerSun.gif" border=0>');
	get_open_info(v);
	
	
//	setTimeout("show_percent('"+v+"')",1000);
			
		
	init_button();	
	language();	
	
	var Obj=$("#s3DetailDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:'fast'});			
	Obj.close();
	

	adjust_dialog_size("#s3Diag_percent",750,470)
	var s3Obj=$("#s3Diag_percent").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,
		
		onBeforeClose: function() {					
						clearTimeout(loop_percent);
						__RUN_WIZARD = false;
        }		 	
		
		});
	s3Obj.load();

	__RUN_WIZARD = true;	
	
	
	$("#s3Diag_percent .close").click(function(){							
							$('#s3Diag_percent .close').unbind('click');
							clearTimeout(loop_percent);
							s3Obj.close();		
							__RUN_WIZARD = false;
							$('#s3_percent_info').html('<img src="/web/images/SpinnerSun.gif" border=0>');
							$("#s3_tb").flexReload();							
		});
	
	
	
	
	$("#s_percent_clear").click(function(){		
    	s3Obj.close();
    	__RUN_WIZARD = false;
    		$('#s3_reload_info').html('<img src="/web/images/SpinnerSun.gif" border=0>');
    		   
    				wd_ajax({
						type:"POST",
						url:"/cgi-bin/s3.cgi",
						data:"cmd=clear_percent&name="+SELECTED_TASK,
						cache:false,
						async:true,
						success:function(data){			
							$("#s3_tb").flexReload();						
						},
						error:function(){
						}
		});		
    		
    		
    	
	});  
}

function show_percent(v)
{
	clearTimeout(loop_percent);
	var seq = 0;
	var s3Obj=$("#s3Diag_percent").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	if (s3Obj.isOpened())
	{
				                                        var url_data = "/xml/"+v+".xml";												
									wd_ajax({
										type:"POST",
										async:true,
										cache:false,
										dataType: 'xml',	
										url:url_data,					
										success:function(xml){										
							$(xml).find('item').each(function(index){
											seq = index+1;						
											var percent = $(this).find('percent').text();																						
														//$("#"+v+"_"+seq).progressBar(parseInt(percent,10));														
														$("#"+v+"_"+seq).text(percent+"%");														
								});																		
					}
				});	
		
		if (show_percent_count == 5)
		{			
			show_percent_count = 0;
			loop_percent = setTimeout("get_open_info('"+v+"')",7000);
		}	
		else	
		{				
			show_percent_count++;		
			loop_percent = setTimeout("show_percent('"+v+"')",7000);						
						}	
	}		
}

function s3_reload(v)
{
	//job name
	//date

	
	if(v == "-") v = detail_job_name;
	
	$('#s3_reload_info').html('<img src="/web/images/SpinnerSun.gif" border=0>');
	get_recovery_info(v);
	
	adjust_dialog_size("#s3Diag_reload","","")	
	var s3Obj=$("#s3Diag_reload").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,
			onBeforeClose: function() {					
						clearTimeout(loop_percent);
						__RUN_WIZARD = false;
        }		 	
		});
	s3Obj.load();
	__RUN_WIZARD = true;
	
	
	
	
	$("#s3_reload_info .close").click(function(){							
							$('#s3_reload_info .close').unbind('click');							
							s3Obj.close();		
							__RUN_WIZARD = false;
							$('#s3_reload_info').html('<img src="/web/images/SpinnerSun.gif" border=0>');							
		});
	
	
	
}
function s3_create_job()
{
	
	
	//check tm share's max number
	var total = $("#s3_tb").flexTotal();

	if(total==_MAX_TOTAL_JOB)
	{
		jAlert(_T('_remote_backup','msg17'), _T('_common','error'));
		return;
	}
	S3_MODIFY = 0; 
	init_button();
	language();
	draw_select();
	init_select();		
	hide_select();
	

	s3_clear_table();
	//check_dir(0);
	$("#backups_s3JobName_text").attr("disabled",false);          
	
	
	//$("#s_wizard_des").html("The wizard helps you create a Amazon S3 job. Enter the name of the remote replication and click <b>Next</b>.");
//	$("#s_wizard_des").html(_T('_s3','msg13'));
	//adjust_dialog_size("#s3Diag",700,"")
	var s3Obj=$("#s3Diag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,
				onBeforeClose: function() {																
						__RUN_WIZARD = false;
        }
		});	
	_DIALOG = s3Obj;
	s3Obj.load();
		
	__RUN_WIZARD = true;
	
	$(".exit").click(function(){
   	s3Obj.close();
   	__RUN_WIZARD = false;
	});
	
	
	$("#s3_wizard_step0").hide();	
	$("#s3_wizard_step1").show();
	$("#s3_wizard_step2").hide();
	$("#s3_wizard_step3").hide();
	$("#s3_wizard_step4").hide();		
	$("#s3_wizard_step5").hide();	
	$("#s3_wizard_finish").hide();	
	$("input:text").inputReset();
	$("input:password").inputReset();
	ui_tab("#s3Diag","#backups_s3JobName_text","#backups_s3Next1_button");
}
function s3_edit_job(jobname)
{
	
	S3_MODIFY = 1;     
	language();
	
	$("#backups_s3JobName_text").attr("disabled",true);

		var str = "cmd=cgi_s3_get_modify&f_job_name=" + jobname;
			
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/s3.cgi",
			data:str,
			cache:false,
			async:false,
			success:function(xml){	

					var dir = $(xml).find("dir").text();						
					var backuptype = $(xml).find("backuptype").text();	
					var a_key = $(xml).find("a_key").text();	
					var p_key = $(xml).find("p_key").text();	
					var b_path = $(xml).find("b_path").text();						
					var location = $(xml).find("location").text();	
					var n_path = $(xml).find("n_path").text();	
					var schedule = $(xml).find("schedule").text();						
					var mday = $(xml).find("mday").text();	
					var hour = $(xml).find("hour").text();	
					var min = $(xml).find("min").text();	
					var date = $(xml).find("date").text();						
		
					setSwitch('#backups_s3Auto_switch',0);
					$("#backups_s3JobName_text").val(jobname);

_g_dir = dir;
					
					$("#backups_s3AccessKey_text").val(a_key);
					$("#backups_s3SecretKey_text").val(p_key);
					$("#backups_s3RemotePath_text").val(b_path);
			
					//$("#f_location").val(location);
					_g_location  = location;
					//$("#f_backuptype").val(backuptype);
					_g_backuptype = backuptype;
					$("#backups_s3LocalPath_text").val(translate_path_to_display(n_path));
					
					
					SetScheduleMode('#s_type',schedule,"");	//3:daily				
					SetCreateNow('#f_backup_now','1',"");	//1:backup now
					SetCreateNow('#f_backup_now2','1',"");	//1:backup now 2:later
					show_schedule_type_div($("#s_type").attr('rel'));		
					setSwitch('#backups_s3Auto_switch',1);
					$("#schedule_tr").show();
					$("#schedule_div").show();
					$("#backup_now_div").hide();
	
												

					if (schedule == 1) //schedule: daily
					{														
						_g_sch_hour = hour;
						_g_sch_min = min;
					}	
					else if (schedule == 2) //schedule : weekly
					{				
						_g_sch_week = mday;
						_g_sch_hour = hour;
						_g_sch_min = min;
						
					}
					else if (schedule == 3) //schedule : monthly
					{						
						_g_sch_day = mday;
						_g_sch_hour = hour;
						_g_sch_min = min;
					}					
					else  //manual
					{
						setSwitch('#backups_s3Auto_switch',0);
						SetScheduleMode('#s_type',"1","");	//3:daily			
						show_schedule_type_div($("#s_type").attr('rel'));		
						$("#backup_now_div").show();	
						$("#schedule_tr").hide();
						$("#schedule_div").hide();								
					}					
					
									
			},
			error:function(){
			}
		});		
	
	draw_select();
	init_select();		
	hide_select();
	
	
	var s3Obj=$("#s3Diag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	_DIALOG = s3Obj;
	s3Obj.load();	
		
	__RUN_WIZARD = true;
	
	$(".exit").click(function(){
    	s3Obj.close();
    	__RUN_WIZARD = false;
	});
	
	
	$("#s3_wizard_step1").show();
	$("#s3_wizard_step2").hide();
	$("#s3_wizard_step3").hide();
	$("#s3_wizard_step4").hide();		
	$("#s3_wizard_step5").hide();	
	$("#s3_wizard_finish").hide();	
	$("input:text").inputReset();
	$("input:password").inputReset();
}






var __file = 0;
var	__chkflag = 0;	//for show check box	1:show	0:not
function s3_create_tree_dialog()
{	
		open_folder_selecter({
			title: _T('_remote_backup', 'msg22'),
			device: "HDD", //HDD, USB, ..., ALL
			root: '/mnt/HD',
			cmd: 'cgi_read_open_tree',
			script: '/cgi-bin/folder_tree.cgi',
			effect: 'no_son',
			formname: 'generic',
			textname: null,
			filetype: 'all',
			checkbox_all: 2,					
			chkflag: 1, //for show check box, 1:show, 0:not
			chk:1,		
			single_select: true,			
			afterOK: function() {
				$("#backups_s3LocalPath_text").val(translate_path_to_display($("#SelectPathDiag input:checkbox:checked[name=folder_name]").val()));
                         	__RUN_WIZARD = true;
				$("#backups_s3LocalPath_button").focus();
			},
			afterCancel: function() {
		var Diag_obj=$("#s3Diag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
		_DIALOG = Diag_obj;
		Diag_obj.load();	
		__RUN_WIZARD = true;
		$("#backups_s3LocalPath_button").focus();
			}
	});
}


function s3_delete_job(name)
{
	__RUN_WIZARD = true;
	
		
	jConfirm('M',_T('_s3','del_msg'),_T('_common','del'),'s3',function(r){
		if(r)
		{
			//delete	
				//var grid = $("#s3_tb");
				//var index=$('.trSelected td:nth-child(1) span:eq(0)',grid).text()	
				//var jobname=$('.trSelected td:nth-child(1) div span:eq(1)',grid).text() ;
				//var str = "cmd=cgi_s3_del&f_job_name=" + jobname + "&index="+index;
				var jobname = $("#detail_job_name").text();
				if (name != "")		
					jobname = name;
				var str = "cmd=cgi_s3_del&f_job_name=" + jobname;
			//	$("#s3DetailDiag").overlay().close();							
								
				jLoading(_T('_common','set') ,'loading' ,'s',""); 
				
				if ($("#s3_tb").flexTotal() == 1 )
						google_analytics_log('amazon-s3-en', 0);
				
					wd_ajax({
						type:"POST",
						url:"/cgi-bin/s3.cgi",
						data:str,
						cache:false,
						async:true,
						success:function(data){			
								jLoadingClose();
							$("#s3_tb").flexReload();
							__RUN_WIZARD = false;
						},
						error:function(){
						}
		});		
		}
		else
				__RUN_WIZARD = false;
  });								
}

function s3_show_schedule_div(type)
{	
	if(type==1)		//Manual
	{	
		$("#id_s3_sch").hide()
		$("#backup_now_div").show()
		$("#s3_once_div").hide()
	}
	if(type==2)	//once
	{
		$("#s3_schedule_type2").addClass("buttonSel");
		$("#id_s3_sch").hide()
		$("#backup_now_div").hide()
		$("#s3_once_div").show()
	}
	if(type==3)	//schedule :day
	{
		$("#s3_schedule_type3").addClass("buttonSel");
		$("#id_s3_sch").show()
		$("#backup_now_div").hide()
		$("#s3_once_div").hide()	
		
		$("#s3_week_div").hide()				
		$("#s3_month_div").hide()							
	}
	if (type == 4) //schedule :weekly
	{	
		$("#id_s3_sch").show()
		$("#backup_now_div").hide()
		$("#s3_once_div").hide()				
		
		$("#s3_week_div").show()				
		$("#s3_month_div").hide()								
	}
	if (type == 5) //schedule :monthly
	{	
		$("#id_s3_sch").show()
		$("#backup_now_div").hide()
		$("#s3_once_div").hide()				
		
		$("#s3_week_div").hide()				
		$("#s3_month_div").show()								
	}
}

function action_stop(v)
{	
		
		//var overlayObj=$("#overlay").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
		//overlayObj.load();
		jLoading(_T('_common','set') ,'loading' ,'s',"");
		
		__RUN_WIZARD = true;
		var str = "cmd=cgi_s3_stop&f_job_name=" + v;
				
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/s3.cgi",
			data:str,
			cache:false,
			async:true,
			success:function(data){			
				//setTimeout(function(){overlayObj.close();jAlert(_T('_common','update_success'), _T('_common','success'));},2000);	
				setTimeout(function(){jLoadingClose();},2000);	
					$("#s3_tb").flexReload();
					__RUN_WIZARD = false;
			},
			error:function(){
			}
		});		
}


function action_start(v)
{			
	//var overlayObj=$("#overlay").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	//overlayObj.load();
	jLoading(_T('_common','set') ,'loading' ,'s',""); 
	
	__RUN_WIZARD = true;		
		var str = "cmd=cgi_s3_start&f_job_name=" + v;
				
			
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/s3.cgi",
			data:str,
			cache:false,
			async:true,
			success:function(data){											
					setTimeout(function(){				
						jLoadingClose();
						
//						if (data == "OK")	
//							jAlert(_T('_common','update_success'), _T('_common','success'));
//						else if (data == "62")
//						{							
//							jAlert(_T('_s3','time_error'), _T('_common','error'));	
//						}	
//						else if (data == "64")
//						{							
//							jAlert(_T('_s3','key_error'), _T('_common','error'));	 //accesskey error
//						}	
//						else if (data == "103")
//							jAlert(_T('_s3','private_key_error'), _T('_common','error'));		
//						else	if (data == "6")
//						{
//							jAlert(_T('_s3','bucket_error'), _T('_common','error'));								
//						}	
//						else	if (data == "48")
//						{
//							jAlert(_T('_s3','bucket_error1'), _T('_common','error'));								
//						}	
//						else
//						{						
//							jAlert(_T('_common','connection_error'), _T('_common','error'));
//						}	
						
						},2000);	
				$("#s3_tb").flexReload();
				__RUN_WIZARD = false;
			},
			error:function(){
			}
		});		
}

//function backup_now(v)
//{		
//	__RUN_WIZARD = true;		
//						
//	jConfirm('M',_T('_remote_backup','msg25'),_T('_common','del'),function(r){
//		if(r)
//		{		
//			//var overlayObj=$("#overlay").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
//			//overlayObj.load();
//			jLoading(_T('_common','set') ,'loading' ,'s',"");
//				if(v == "-") v = detail_job_name;
//				var str = "cmd=cgi_s3_backup&f_job_name=" + v;
//		
//				wd_ajax({
//			type:"POST",
//			url:"/cgi-bin/s3.cgi",
//			data:str,
//			cache:false,
//			async:true,
//			success:function(data){						
//					setTimeout(function(){
//					//overlayObj.close();					
//					jLoadingClose();
//					
//					},2000);	
//				$("#s3_tb").flexReload();
//				__RUN_WIZARD = false;
//			},
//			error:function(){
//			}
//		});			
//		
//		}		
//	});
//	 		
//	__RUN_WIZARD = false;	
//}
var show_percent_count = 0;
function get_open_info(v)
{
	show_percent_count = 0;
	clearTimeout(loop_percent);
	SELECTED_TASK = v;
	TASK_PERCENT = new Array();
	do_query_HD_Mapping_Info();
	var name,time,percentage;
	
	var seq;
	var cmd = "cmd=get_precent&name="+v;		
	
	var path = "";
	var cmd = "cmd=get_precent&name="+v;	
	wd_ajax({
	type:"POST",
	async:false,
	cache:false,	
	dataType: 'html',	
	url:"/cgi-bin/s3.cgi",	
	data:cmd,
	success:function(data){														
		path = data;
		}
	});	
	
	wd_ajax({
	type:"POST",
	async:true,
	cache:false,	
	dataType: 'xml',	
	url:path,	
	data:path,
	success:function(xml){				
			var table ="<table><tr><td width=120 height=30>"+ _T('_p2p','start_time')+ "</td><td height=30>"+$(xml).find('info>time').eq(0).text() +"</td></tr>";
			table += "<tr><td width=120 height=30>"+_T('_p2p','total')+ "</td><td height=30> "+$(xml).find('total').text() +"</td></tr></table>";						
			table +=	'<div id="scrollbar_s3_percent">'
			table +=	'<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>'
			table +=	'<div class="viewport">'
      table +=	'<div class="overview">'
		
			
			
			table += "<table  id='id_per' border='0' cellspacing='0' cellpadding='0' width='100%' >";
			table += "<tbody>";
			
			$(xml).find('item').each(function(index){
							seq = index+1;
							name = $(this).find('fileName').text();
							time = $(this).find('time').text();
							percent = $(this).find('percent').text();
							$('#id_len').text("")
							$('#id_len').append(chg_path(name))
							var j = $('#id_len').width()
							table += "<tr>"
							table += "<td><div class='word_overflow no_img TooltipIcon' title='"+chg_path(name)+"'>"+chg_path(name)+"</div></td>";							
							table += "<td>" + time +"</td>"							
							table += "<td><span id='"+v+"_"+seq+"'>"+percent+"%</span></td>"													
							TASK_PERCENT.push(percent);								
				});									
					table += "</tbody></table>";	
					table += "</div></div></div><!--scroll bar end -->";
						$('#s3_percent_info').html(table);
						
			$(".list_overflow").addClass("word_overflow");
						$('#id_per').flexigrid({							
								noSelect:true,
								resizable : false,
								width:'auto',
								height:'auto',						
								colModel : [
			    		  {display: "filename", name : 'filename', width :320,  align: 'left'},
			    			{display: "time", name : 'time', width : 200, align: 'left'},	
			    			{display: "percent", name : 'percent', width : 100, align: 'left'}
			    	
			    			]
							});	
				$("#scrollbar_s3_percent").jScrollPane();		
	}
});
	loop_percent = setTimeout("show_percent('"+v+"')",5000);
}

function get_recovery_info(v)
{
	var str = "cmd=get_recovery&f_job_name=" + v;
	
	//var table =	'<div id="scrollbar_s3_reload">'
	var table = "";
		  table +=	'<div id="scrollbar_s3_reload">'
			table +=	'<div class="scrollbar"><div class="track"><div class="thumb"><div class="end"></div></div></div></div>'
			table +=	'<div class="viewport">'
      table +=	'<div class="overview">'
	table += "<table id='id_re' border=\"0\" cellspacing=\"0\" cellpadding=\"0\" width='100%' >"
	table += "<thead><tr><th width='280'>"+_T('_s3','backup_date')+"</th><th width='120'>"+_T('_s3','action')+"</th></tr></thead><tbody>"
	var table1= "";
	var i =0;
		wd_ajax({
			type:"POST",
			url:"/cgi-bin/s3.cgi",
			data:str,
			cache:false,
			async:true,
			success:function(xml){			
				$(xml).find('backup').each(function(){	
									i++;
									var job_date = $(this).find('jobname').text();
									var time = $(this).find('time').text();														
									var str = "";													
									//table += "<tr><td>" + i+ "</td>"
									str += "<tr><td><span style='width:280px;display:block'>" + time +"</span></td>"
									str += "<td><div><button type='button' onclick='backup_action(\""+v+"\",\""+job_date+"\")'>"+_T('_s3','recovery')+"</button></div></td></tr>"							
									table1=str+table1;
																	
				 			});		
				 			
				 			
				 			
				 		//if (i == 0)				 			
							//table += "No Data.";
						
						table += table1;	
						table += "</tbody></table></div></div></div>"								
						$('#s3_reload_info').html(table);
						
						$('#id_re').flexigrid({							
								noSelect:true,
								resizable : false,	
								height:'auto'						
							});
			},
			error:function(){
			}
		});		
		
		
}
function backup_action(jobname,job_date)
{	
		
	var s3Obj=$("#s3Diag_reload").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	s3Obj.close();
		
	//var overlayObj=$("#overlay").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	//overlayObj.load();
	jLoading(_T('_common','set') ,'loading' ,'s',"");
	
	__RUN_WIZARD = true;
	var str = "cmd=cgi_recovery&f_date=" + job_date +"&f_job_name=" + jobname;

	wd_ajax({
			type:"POST",
			url:"/cgi-bin/s3.cgi",
			data:str,
			cache:false,
			async:true,
			success:function(data){			
					setTimeout(function(){
					//overlayObj.close();				
					jLoadingClose();
					//jAlert(_T('_common','update_success'), _T('_common','success'));
					
					},2000);	
				$("#s3_tb").flexReload();
				__RUN_WIZARD = false;
			},
			error:function(){
			}
		});		
}


function s3_clear_table()
{
			$("#backups_s3JobName_text").val("");
			$("#f_username").val("");
			$("#f_dir").val("");
			$("#backups_s3AccessKey_text").val("");
			$("#backups_s3SecretKey_text").val("");
			$("#backups_s3RemotePath_text").val("");
			//$("#f_location").val("");
			//$("#f_backuptype").val("");
			$("#backups_s3LocalPath_text").val("");		
			//s3_show_schedule_div(1);   
			  
			setSwitch('#backups_s3Auto_switch',0);
			SetScheduleMode('#s_type','1',"");	//3:daily
			SetCreateNow('#f_backup_now','1',"");	//1:backup now
			SetCreateNow('#f_backup_now2','1',"");	//1:backup now 2:later
			show_schedule_type_div($("#s_type").attr('rel'));	
										
			$("#backup_now_div").show();	
			$("#schedule_tr").hide();												
			$("#schedule_div").hide();				
			//$("#f_location").val("0");
			$("#f_dir").val("0");
			//$("#f_backuptype").val("0");
			
	
}
function check_step1()
{
		//check function
		if ($("#backups_s3JobName_text").val()	== "")
		{
				//Please input job name
				jAlert(_T('_s3','msg1'), _T('_common','error'),"",function(){$("#backups_s3JobName_text").focus();});				
				return 1;
		}
		if (S3_MODIFY == 0)
		{
			if (check_name($("#backups_s3JobName_text").val()) == 1)
			{
				
					jAlert(_T('_s3','msg12'), _T('_common','error'),"",function(){$("#backups_s3JobName_text").focus();});
					return 1;
			}	
			if (name_check1($("#backups_s3JobName_text").val()) == 1)
			{
				//jAlert('This job name does not accepted . Please try again.', 'Error');
				jAlert(_T('_s3','msg17'), _T('_common','error'),"",function(){$("#backups_s3JobName_text").focus();});
				return 1;
			}
			if ($("#backups_s3JobName_text").val().indexOf(" ") != -1) //find the blank space
			{			
				jAlert(_T('_s3','msg26'), _T('_common','error'),"",function(){$("#backups_s3JobName_text").focus();});
				return 1;
			}	
		}	
		return 0;
}
function check_step2()
{
		if ($("#backups_s3AccessKey_text").val()	== "")
		{				
				jAlert(_T('_s3','msg3'), _T('_common','error'),"",function(){$("#backups_s3AccessKey_text").focus();});
				return 1;
		}
				
		if ($("#backups_s3AccessKey_text").val().indexOf(" ") != -1) //find the blank space
		{		
			jAlert(_T('_s3','msg4'), _T('_common','error'),"",function(){$("#backups_s3AccessKey_text").focus();});
			return 1;
		}	
		if ($("#backups_s3SecretKey_text").val()	== "")
		{		
				jAlert(_T('_s3','msg5'), _T('_common','error'),"",function(){$("#backups_s3SecretKey_text").focus();});
				return 1;
		}
				
		if ($("#backups_s3SecretKey_text").val().indexOf(" ") != -1) //find the blank space
		{			
			jAlert(_T('_s3','msg6'), _T('_common','error'),"",function(){$("#backups_s3SecretKey_text").focus();});
			return 1;
		}	
		if ($("#backups_s3RemotePath_text").val()	== "")
		{		
				jAlert(_T('_s3','msg7'), _T('_common','error'),"",function(){$("#backups_s3RemotePath_text").focus();});
				return 1;
		}
				
		
		if ($("#backups_s3RemotePath_text").val().length < 3) 
		{			
			jAlert(_T('_s3','msg9'), _T('_common','error'),"",function(){$("#backups_s3RemotePath_text").focus();});
			return 1;
		}		
		if ($("#backups_s3RemotePath_text").val().indexOf("_") != -1) //find the blank space
		{			
			jAlert(_T('_s3','msg11'), _T('_common','error'),"",function(){$("#backups_s3RemotePath_text").focus();});
			return 1;
		}		
		
		var v = $("#backups_s3RemotePath_text").val().substr($("#backups_s3RemotePath_text").val().length-1,1);
		if (v == "-")
		{
		//	jAlert("Bucket names should not end with a dash.", _T('_common','error'));
			jAlert(_T('_s3','msg19'), _T('_common','error'),"",function(){$("#backups_s3RemotePath_text").focus();});
			return 1;
		}
		if ($("#backups_s3RemotePath_text").val().indexOf("..") != -1) //find the blank space
		{			
			//jAlert("Bucket names cannot contain two, adjacent periods.", _T('_common','error'));
			jAlert(_T('_s3','msg20'), _T('_common','error'),"",function(){$("#backups_s3RemotePath_text").focus();});
			return 1;
		}		
		if ($("#backups_s3RemotePath_text").val().indexOf(".-") != -1) //find the blank space
		{			
			//jAlert("Bucket names cannot contain dashes next to periods.", _T('_common','error'));
			jAlert(_T('_s3','msg21'), _T('_common','error'),"",function(){$("#backups_s3RemotePath_text").focus();});
			return 1;
		}		
		if ($("#backups_s3RemotePath_text").val().indexOf("-.") != -1) //find the blank space
		{			
			//jAlert("Bucket names cannot contain dashes next to periods.", _T('_common','error'));
			jAlert(_T('_s3','msg22'), _T('_common','error'),"",function(){$("#backups_s3RemotePath_text").focus();});
			return 1;
		}		
		if ($("#backups_s3RemotePath_text").val().substr(0,5) == "test_")
		{
			//jAlert("The beginning of the backet name must not contain 'test_'.", _T('_common','error'));
			jAlert(_T('_s3','msg23'), _T('_common','error'),"",function(){$("#backups_s3RemotePath_text").focus();});
			return 1;
		}
		if ($("#backups_s3RemotePath_text").val().substr(0,4) == "test" || $("#backups_s3RemotePath_text").val().substr(0,4) == "TEST" )
		{
			//jAlert("The beginning of the backet name must not contain 'test' or 'TEST'.", _T('_common','error'));
			jAlert(_T('_s3','msg24'), _T('_common','error'),"",function(){$("#backups_s3RemotePath_text").focus();});
			return 1;
		}
		if ($("#backups_s3RemotePath_text").val().indexOf("\\") != -1) //find the blank space
		{			
			//jAlert("Bucket names cannot contain backslash.", _T('_common','error'));
			jAlert(_T('_s3','msg27'), _T('_common','error'),"",function(){$("#backups_s3RemotePath_text").focus();});
			return 1;
		}		
		
		
		if(chk_first_char($("#backups_s3RemotePath_text").val()))
		{
			jAlert(_T('_s3','msg25'), _T('_common','error'),"",function(){$("#backups_s3RemotePath_text").focus();});
			return 1;
		}
		
		return 0;
}
function check_step3()
{
	
		if ($("#backups_s3LocalPath_text").val()	== "")
		{		
				jAlert(_T('_s3','msg10'), _T('_common','error'),"",function(){$("#backups_s3LocalPath_button").focus();});
				return 1;
		}		
		if ($("#backups_s3LocalPath_text").val().length	> 235)
		{
			jAlert(_T('_itunes','msg2'), _T('_common','error'),"",function(){$("#backups_s3LocalPath_button").focus();});
				return 1;
		}
	
		return 0;
}


function check_name(v)
{
	var v;
	var str = "cmd=cgi_s3_all_name&f_job_name="+v;

		wd_ajax({
			type:"POST",
			url:"/cgi-bin/s3.cgi",
			data:str,
			cache:false,
			async:false,
			success:function(data){			
				v = data;
			},
			error:function(){
			}
		});
		
		return v;		
}

function check_dir(v)
{
		if (v == 1)
		{			
			//$("#f_backuptype").val("0");
			//$("#f_backuptype").attr("disabled",true);								
			$("#id_backuptype").attr('rel','0');			
			$("#backups_s3BackupType_select").addClass('gray_out');									
			
		}
		else
		{	
			
			//$("#f_dir").attr("disabled",false);	
			//$("#f_backuptype").attr("disabled",false);											
			$("#backups_s3Type_select").removeClass('gray_out');							
			$("#backups_s3BackupType_select").removeClass('gray_out');						
			
		}	
}
function check_backup_type()
{
	if (S3_MODIFY == 1)
	{	
		//$("#f_dir").attr("disabled",true);	
		//$("#f_backuptype").attr("disabled",true);			
		$("#backups_s3Type_select").addClass('gray_out');		
		$("#backups_s3BackupType_select").addClass('gray_out');				
	}	
	else	
	{	
		//$("#f_dir").attr("disabled",false);	
		//$("#f_backuptype").attr("disabled",false);	
		$("#backups_s3Type_select").removeClass('gray_out');		
		$("#backups_s3BackupType_select").removeClass('gray_out');		
	}	
}


function view()
{
$("#show_jobname").html($("#backups_s3JobName_text").val());
$("#show_b_path").html($("#backups_s3RemotePath_text").val());
$("#show_region").html($("#id_location").text())
$("#show_type").html($("#id_dir").text());
$("#show_backup_type").html($("#id_backuptype").text());
$("#show_local_path").html($("#backups_s3LocalPath_text").val());
			


var j = getSwitch('#backups_s3Auto_switch');
if (j == 0 )
{
	if ($('#f_backup_now').attr('rel') == "1")
		$("#show_backup_now").html(_T('_button','yes'))//Yes
	else
		$("#show_backup_now").html(_T('_button','no'))//No

	hide("id_show_backup_sch");
	show("id_show_backup_now");	
	return;
}
	

{
	show("id_show_backup_sch");
	hide("id_show_backup_now");


	var type = $('#s_type').attr('rel')
	var mon = $("#id_sch_month").text();
	var day = $("#id_sch_day").text();
	var hour = $("#id_sch_hour").text();
	var min = "00";


	if (type == 1) //daily
	{
		if (TIME_FORMAT == 12)
			$("#show_backup_sch").html(hour+" / "+ _T('_mail','daily'));//Daily
		else
		$("#show_backup_sch").html(hour+" :  "+ min +" / "+ _T('_mail','daily'));//Daily

	}
	if (type == 2) //weekly
	{
		
		//week = $("#id_s3_sch select[name='f_week'] option:selected").html();
		week = $("#id_sch_week").text();
		if (TIME_FORMAT == 12)
			$("#show_backup_sch").html(week+" "+hour+" / "+_T('_mail','weekly'));//Weekly
		else
		$("#show_backup_sch").html(week+" "+hour+" :  "+ min +" / "+_T('_mail','weekly'));//Weekly

	}
	if (type == 3) //monthly
	{
		//var d= $("#id_s3_sch select[name='f_day']").val()
		var d = $("#id_sch_day").attr('rel');
		var s;
		if(day==1 || day==21 || day==31)
			s=d + "st" ;
		else if(day==2 || day==22)
			s=d + "nd" ;
		else if(day==3 || day==23)
			s=d + "rd" ;
		else 
			s=d + "th" ;
		
		if (TIME_FORMAT == 12)
			$("#show_backup_sch").html(s+" "+hour +" / "+_T('_mail','monthly'));//Monthly
		else	
		$("#show_backup_sch").html(s+" "+hour+" :  "+ min +" / "+_T('_mail','monthly'));//Monthly
	}
}

}


function demo_detail()
	{
		var Obj=$("#s3DemoDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:'fast'});			
	Obj.load();		
	init_button();
	language();
	_DIALOG = Obj;
			
	}
		
	function open_detail(v,restore,progress)
	{		
		adjust_dialog_size("#s3DetailDiag",400,350);
		detail_job_name = v;
			var Obj=$("#s3DetailDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:'fast'			
				});			
	Obj.load();		
	
	if (restore != "--")	
		$("#detail_restore").html('<a class=\'edit_detail_x1\'  href=\'javascript:close_window("s3DetailDiag");s3_reload("-")\'>'+_T('_common','list')+'</a>')
	else
		$("#detail_restore").html('--');			
		
	if (progress != "--")	
		$("#detail_progress").html('<a class=\'edit_detail_x1\' href=\'javascript:s3_open("-")\'>'+_T('_common','list')+'</a>')
	else
		$("#detail_progress").html('--');			
	
	init_button();
	language();
	_DIALOG = Obj;
	$("#detail_job_name").text(v);
		
	}
	
	function open_s3_detail()
	{		
		adjust_dialog_size("#s3DetailDiag",400,350);
			var Obj=$("#s3DetailDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:'fast'			
				});			
			Obj.load();		
	}
	
	function close_window(obj)
	{
		var Obj=$("#"+obj).overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:'fast'});			
		Obj.close();		
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


function show_schedule_type_div(s_type)
{	
	switch(s_type)
	{
		case '1':	//daily
			$("#id_week_div").hide()
			$("#id_month_div").hide()
			$("#id_sch_word").text(_T('_remote_backup','time'));
			
			break;
		case '2':	//weekly	
		$("#id_sch_word").text(_T('_remote_backup','date_time'));				
			$("#id_week_div").show()
			$("#id_month_div").hide()
			break;
		case '3':	//monthly
			$("#id_sch_word").text(_T('_remote_backup','date_time'));
			$("#id_week_div").hide()
			$("#id_month_div").show()
			break;
	}
}