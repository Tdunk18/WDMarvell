function translate_status_code_detail(status_code)
{
	var str = "";
	switch(status_code)
	{
		case "0": //Finish
			str = _T('_ftp_downloads', 'status0');
			break;
		case "1": //Ready
			str = _T('_ftp_downloads', 'status1');
			break;
		case "2": //Backup in Progress
			str = _T('_ftp_downloads', 'status2');
			break;
		case "-1": //Backup Failed
			str = _T('_ftp_downloads', 'status_1_d');
			break;
		case "-2": //Invalid Source Folder
			str = _T('_ftp_downloads', 'status_2');
			break;
		case "-3": //Invalid Destination Folder
			str = _T('_ftp_downloads', 'status_3');
			break;
		case "-4": //Duplicate Backup
			str = _T('_ftp_downloads', 'status_4');
			break;
		case "-5": //Additional Backups not allowed
			str = _T('_ftp_downloads', 'status_5');
			break;
		case "-6": //Memory Allocation Error
			str = _T('_ftp_downloads', 'status_6');
			break;
		case "-7": //Invalid Backup
			str = _T('_ftp_downloads', 'status_7');
			break;
		case "-8": //Invalid Backup Path
			str = _T('_ftp_downloads', 'status_8');			
			break;
		case "-9":
			str = _T('_ftp_downloads', 'status_9');
			break;
		case "-10": //Cancel
			str = _T('_ftp_downloads', 'status_10');
			break;
		case "-11": //Destination Full
			str = _T('_ftp_downloads', 'status_11');
			break;
	}
	return str
}

function translate_status_code(status_code)
{
	var str = "";
	switch(status_code)
	{
		case "0": //Finish
			str = _T('_ftp_downloads', 'status0');
			break;
		case "1": //Ready
			str = _T('_ftp_downloads', 'status1');
			break;
		case "2": //Backup in Progress
			str = _T('_ftp_downloads', 'status2');
			break;
		case "-10": //Cancel
			str = _T('_backup', 'desc16');
		break;	
		
		default:
			str = _T('_ftp_downloads', 'status_1');
		break;
	}
	return str
}

function jobs_create()
{
	create_init();		
	init_button();
	language();
	
	$("#apps_ftpdownloadsSave3_button").hide();	
	$("#apps_ftpdownloadsCreate3_button").show();
	$("#apps_ftpdownloadsCancel3_button").show();
	
	$("#FTPDownloadDiag_title").html(_T("_backup","create"));
	$("#FTPDownloadDiag").overlay({fixed: false, oneInstance:false, expose: '#000', api:true, closeOnClick:false, closeOnEsc:false}).load();
	$("#FTPDownloadDiag").center();
	$("#Ftp_Download_Create").show();
	
	$("#apps_ftpdownloadsCreate3_button").click(function(){
	
		if (!check_data())
			return;
	
		clearTimeout(timeoutId);
		save_job("create");
	});
	
	$("#apps_ftpdownloadsCancel3_button").click(function(){
		create_init();	
		$("#FTPDownloadDiag").overlay().close();
	});
	
}	
function show_jobs_detail(idx)
{	
//	$("#internal_revocer_div").hide();
//	if (jobs_list[idx][7] == 3) //Incremental mode
//	{
//		$("#internal_revocer_div").show();
//		$("#apps_ftpdownloadsRecover_button").attr("onClick", String.format('show_recover_diag({0});', idx));
//	}
	
	$("#FTPDownloadDiag_title").html(_T('_download','detail_job'));
	$("#FTPDownloadDiag").overlay({fixed: false, oneInstance:false, expose: '#000', api:true, closeOnClick:false, closeOnEsc:false}).load();
	$("#FTPDownloadDiag").center();
	$('#Ftp_Download_Create').hide();
	$('#Ftp_Download_Detail').show();

	init_button();
	language();

	$("#ftp_task_name").html(jobs_list[idx][0]);
	$("#ftp_host").html(jobs_list[idx][17]);	
//	$("#internal_category").html(jobs_list[idx][6].replace(/1/g, _T('_usb_backups', 'usb_to_nas'))
//											 .replace(/2/g, _T('_usb_backups', 'nas_to_usb')));
	
	/* [+] Source path */
	var table_ele = $("#Ftp_Download_Detail .source_listDiv ul");
	table_ele.empty();
	for(var k in jobs_list[idx][2])
	{
		var t = "<li>";
		var _path = jobs_list[idx][2][k];
		t += String.format('<div class="select_text TooltipIcon" title="{0}">{1}</div>', _path, translate_path_to_display(_path));
		t += "</li>";
		table_ele.append(t);
	}

	var list_height = jobs_list[idx][2].length * 32;
	$("#Ftp_Download_Detail .source_listDiv").height((list_height < 96) ? list_height : 96);
	$("#Ftp_Download_Detail .source_listDiv").jScrollPane({autoReinitialise: true});
	/* [-] Source path */

	/* [+] Dest path */
	table_ele = $("#Ftp_Download_Detail .dest_listDiv ul");
	table_ele.empty();
	var _path = jobs_list[idx][4];
	table_ele.append(String.format('<li><div class="select_text TooltipIcon" title="{0}">{1}</div></li>', _path, translate_path_to_display(_path)));
	/* [-] Dest path */

	init_tooltip();

	$("#internal_dest_dir div").html(translate_path_to_display(jobs_list[idx][4]));
	$("#internal_dest_dir div").attr("title", translate_path_to_display(jobs_list[idx][4]));

	$("#ftp_download_type").html(jobs_list[idx][7].replace(/1/g, _T('_usb_backups', 'copy'))
												.replace(/2/g, _T('_usb_backups', 'sync'))
												.replace(/3/g, _T('_usb_backups', 'incremental')));
	/*Status*/
	var _status = "";
	switch(parseInt(jobs_list[idx][10],10))
	{
		case 0:	//finish or success
			if (jobs_list[idx][9] != "")
			{
				_status = String.format(_T("_ftp_downloads", "status0_1"), 
				/*0:host*/	jobs_list[idx][17], 
				/*1:Date + Time*/multi_lang_format_time(parseInt(jobs_list[idx][9], 10) * 1000));
			}
		break;
		
		case 550:
			_status = _T('_ftp_downloads','status_550');
		break;
		
		case 451:
			_status = _T('_ftp_downloads','status_451');
		break;
		
		case 452:
			_status = _T('_ftp_downloads','status_11');
		break;
		
		case 430:
			_status = _T('_ftp_downloads','status_430');
		break;
		
		case 10061:
			_status = _T('_ftp_downloads','status_10061');
		break;
		
		case 10064:
			_status = _T('_ftp_downloads','status_10064');
		break;
		
		case 11001:
			_status = _T('_ftp_downloads','status_11001');
		break;
		
		case 10060:
			_status = _T('_ftp_downloads','status_10060');
		break;
					
		case 10057:
			_status = _T('_ftp_downloads','status_10057');
		break;		
		
		case -10:
			if (jobs_list[idx][9] != "")
			{
				_status = String.format(_T("_ftp_downloads", "status_10"), multi_lang_format_time(parseInt(jobs_list[idx][9], 10) * 1000));
			}
		break;		
					
		default://Ready or Backup in Progress
			_status = translate_status_code_detail(jobs_list[idx][10]);
			if (jobs_list[idx][9] != "" && jobs_list[idx][10] == "0") //hvae timestamp
			_status = String.format(_T("_ftp_downloads", "status0_1"), multi_lang_format_time(parseInt(jobs_list[idx][9], 10) * 1000));
		break;
	}
	$("#internal_status").html(_status);
	
	//Language
	var _tmp_desc = codepage_get_mtui_lang("",jobs_list[idx][20])+"("+jobs_list[idx][20]+")";
	$("#ftp_codepage").html(_tmp_desc);

	$("#Ftp_Download_Detail .close").click(function(){
		$("#FTPDownloadDiag").overlay().close();
		$('#Ftp_Download_Detail').hide();	
	});
	show_schedule("ftp_download_sch_status",jobs_list[idx][14],jobs_list[idx][15],jobs_list[idx][16]);

	$("#jobs_list tr").removeClass("trSelected");
}


function go_jobs(idx)
{
	jLoading(_T('_common','set'), 'loading', 's', "");
	clearTimeout(timeoutId);
	$("#jobs_list").flexAjaxID().abort();

	wd_ajax({
		url: "/web/addons/ftp_download.php",
		type: "POST",
		data: {
			action: "go_jobs",
			taskname: jobs_list[idx][0]
		},
		cache: false,
		dataType: "json",
		complete: function(r) {
			jLoadingClose();
			$("#jobs_list").flexReload();
		}
	});
}

function stop_jobs(idx)
{
	jLoading(_T('_common','set'), 'loading', 's', "");
	clearTimeout(timeoutId);
	$("#jobs_list").flexAjaxID().abort();

	wd_ajax({
		url: "/web/addons/ftp_download.php",
		type: "POST",
		data: {
			action: "stop_jobs",
			taskname: jobs_list[idx][0]
		},
		cache: false,
		dataType: "json",
		success: function(r) {
			jLoadingClose();
			$("#jobs_list").flexReload();
		}
	});
}

function pre_del_jobs(idx)
{
	jConfirm("", _T('_ftp_downloads', 'msg11'), jobs_list[idx][0], "", function(r) {
		if (r)
			del_jobs(idx);
	});
}

function del_jobs(idx)
{
	jLoading(_T('_common','set'), 'loading', 's', "");
	clearTimeout(timeoutId);
	$("#jobs_list").flexAjaxID().abort();

	wd_ajax({
		url: "/web/addons/ftp_download.php",
		type: "POST",
		data: {
			action: "del",
			taskname: jobs_list[idx][0]
		},
		cache: false,
		dataType: "json",
		success: function(r) {
			jLoadingClose();
			$("#jobs_list").flexReload();
		}
	});
}

function load_jobs_list()
{
	$("#jobs_list").flexigrid({	
			url: "/web/addons/ftp_download.php?action=get_list",
			dataType: 'json',
			colModel : [
			/* 0 */{display: "Task_name", name : 'f_task_name', width: 145, align: 'left'},
			/* 1 */{display: "id", name : 'id', hide: true},
			/* 2 */{display: "Source Dir", name : 'f_source_dir', hide: true},
			/* 3 */{display: "Source Percent", name : 'f_source_percent', hide: true},
			/* 4 */{display: "Dest Dir", name : 'f_dest_dir', hide: true},
			/* 5 */{display: "Status", name : 'f_status', width: 350, align: 'left'},
			/* 6 */{display: "category", name : 'f_category', width: 0, hide: true},
			/* 7 */{display: "backup_type", name : 'f_backup_type', width: 0,hide: true},
			/* 8 */{display: "Action", name : 'f_action', width: 160, align: 'right'}
			],
			usepager: true,
			useRp:true,
			page: 1, 
			rp: 30,
			showTableToggleBtn: false,
			width: 'auto',
			height: 'auto',
			errormsg: _T('_common','connection_error'), //Text:Connection Error
			nomsg: _T('_common','no_items'), //Text:No items
			singleSelect:true,
			f_field: getCookie("username"),
			resizable: false,
			rpOptions: [10],
			onSuccess:function(){
				$('.Tooltip').remove();
				
				init_tooltip();
				clearTimeout(timeoutId);
				timeoutId = setTimeout('$("#jobs_list").flexReload()', 3000);

				if (jobs_list.length > 0)
					$("#jobs_list_div").show();
				else
					$("#jobs_list_div").hide();

				if (now_idx != -1)
					$("#jobs_list #row" + now_idx).toggleClass("trSelected");

				if (action_type == "create") //select and focus
				{
					$("#jobs_list tr").removeClass("trSelected");
					$("#jobs_list tr:last").toggleClass("trSelected");
					$("#jobs_list tr:last a").focus();
					action_type = "";
				}
			},
			preProcess: function(r) {
				var r_data = r;
				jobs_list.length = 0;

				if (r.success)
				{
					var _r = r_data.rows;
					var i = 1;
					for(var key in _r)
					{
						var c = _r[key]['cell'];

						r_data.rows[key]['cell'][8] = '<div class="list_icon">';
						//Action
						if (c[5] == "2") //Backuping
							r_data.rows[key]['cell'][8] += String.format('<div class="stop TooltipIcon" onClick="stop_jobs({0});" title="{1}" id="apps_ftpdownloadsStopJob{2}_button"></div>', key, _T("_ftp_downloads", "download_cancel"), i);
						else
							r_data.rows[key]['cell'][8] += String.format('<div class="start TooltipIcon" onClick="go_jobs({0});" title="{1}" id="apps_ftpdownloadsGoJob{2}_button"></div>', key, _T("_ftp_downloads", "download_now"), i);
						//Edit
						if (c[5] == "2") //Backuping
							r_data.rows[key]['cell'][8] += String.format('<div class="edit TooltipIcon gray_out" title="{1}" id="apps_ftpdownloadsModifyJob{2}_button"></div>', key, _T("_usb_backups", "edit_job"), i);
						else
						r_data.rows[key]['cell'][8] += String.format('<div class="edit TooltipIcon" onClick="modify_job({0});" title="{1}" id="apps_ftpdownloadsModifyJob{2}_button"></div>', key, _T("_usb_backups", "edit_job"), i);
						//Del
						r_data.rows[key]['cell'][8] += String.format('<div class="del TooltipIcon" onClick="pre_del_jobs({0});" title="{1}" id="apps_ftpdownloadsDelJob{2}_button"></div>', key, _T("_usb_backups", "del_job"), i);
						//Details
						r_data.rows[key]['cell'][8] += String.format('<div class="detail TooltipIcon" onClick="show_jobs_detail({0});" title="{1}" id="apps_ftpdownloadsShowJob{2}_button"></div>', key, _T("_usb_backups", "details"), i);

						r_data.rows[key]['cell'][8] += '</div>';

						//Status
						if (c[5] == "2" || c[5] == "3") //Backup in process and Recover
						{
							var src_len = c[2].length;

							var now_idx = $.inArray(c[12], c[2])+1;
							var now_backup_path = translate_path_to_display(c[12]);
							if (now_idx <= 0 && last_jobs_list.length > 0)
							{
								now_idx = last_jobs_list.rows[key]['now_idx'];
								now_backup_path = last_jobs_list.rows[key]['now_backup_path'];
							}
							r_data.rows[key]['now_idx'] = now_idx;
							r_data.rows[key]['now_backup_path'] = now_backup_path;

							var bar_p = parseInt(c[11], 10);
							var bar_speed = c[21].toString();
							if (isNaN(bar_p)) bar_p = parseInt(r_data.rows[key]['cell'][11], 10);
							var bar = '<div class="list_icon_bar" syle="">' +
												'<div class="bar_p" style="float: left; width: {0}%;"></div>'+
												'</div>' +
												'<div class="list_bar_text TooltipIcon" title="{1}" style="width:220px">{2}</div>' + 
												'<div class="list_bar_text TooltipIcon" title="{3}" style="display:{4};width:140px;display:inline;text-align:right">{5}</div>';

							if (c[5] == "2" && bar_p >= 0 )
							{	
								r_data.rows[key]['cell'][5] = String.format(bar, 
																							/*0*/	bar_p, 
																							/*1*/	now_backup_path, 
																							/*2*/	now_backup_path,
																							/*3*/	bar_speed,
																							/*4*/	(bar_speed.length == 0)?"none":"",
																							/*5*/	bar_speed);
							}
							else
								r_data.rows[key]['cell'][5] = '<img src="/web/images/WD-Anim-barber-fast.gif" border="0" class="list_icon_bar_anim">';	
						}
						else
							r_data.rows[key]['cell'][5] = translate_status_code(c[5].toString());

						jobs_list.push(r_data.rows[key]['cell']);
						i++;
					}
				}

				//get now selected row index;
				var list_ele = $("#jobs_list");
				var selected_count = $('.trSelected', list_ele).length;
				if(selected_count > 0)
					now_idx = $('.trSelected td:nth-child(2) div', list_ele).text();
				else
					now_idx = -1;

				last_jobs_list = $.extend({}, r_data);
				return r_data;
			},
			onError: function() {
				clearTimeout(timeoutId);
				timeoutId = setTimeout('$("#jobs_list").flexReload()', 1000);
			}
	});
}
function modify_job(idx)
{
	modify_id = idx;
	//Task Name
	$("#apps_ftpdownloadsTaskName_text").val(jobs_list[idx][0]);
  $("#old_taskname").val(jobs_list[idx][0]);
  $("#apps_ftpdownloadsTaskName_Div").hide();
	$("#apps_ftpdownloadsModifyTaskName_text").html(jobs_list[idx][0]).show();
	//ID
	$("#f_task_id").val(jobs_list[idx][1]);
	//Host Name
	var my_host = jobs_list[idx][17].toString();
	if (my_host.indexOf(":") == "-1")
	{
			$("#apps_ftpdownloadsHost_text").val(jobs_list[idx][17]);	
			$("#apps_ftpdownloadsHostPort_text").val("21");
	}		
	else
	{
		var _tmp = my_host.split(":");
		$("#apps_ftpdownloadsHost_text").val(_tmp[0]);
		$("#apps_ftpdownloadsHostPort_text").val(_tmp[1])
	}	
	$("#apps_ftpdownloadsHost_Div").hide();
  $("#apps_ftpdownloadsModifyHost_text").html(jobs_list[idx][17]).show();
  //Login Method
  if (jobs_list[idx][18]!= "")//Account
	{	
		set_mode('#ftp_login_method',"0",function(){show_login_method_div();});
		$("#apps_ftpdownloadsUsername_text").val(jobs_list[idx][18]);
		$("#apps_ftpdownloadsPassword_text").val(jobs_list[idx][19]);
		$("#apps_ftpdownloadsLoginMethod_Div").hide();
			
		$("#apps_ftpdownloadsModifyLoginMethod_text").html(_T("_mail","account")).show();
		//User Name
		$("#apps_ftpdownloadsLoginMethodUserName_Div").hide();
		$("#apps_ftpdownloadsModifyLoginMethodUserName_text").html(jobs_list[idx][18]).show();
		//PWD
		$("#apps_ftpdownloadsLoginMethodPWD_Div").hide();
		$("#apps_ftpdownloadsModifyLoginMethodPWD_text").html(jobs_list[idx][19]).show();
	}
	else
	{
		set_mode('#ftp_login_method',"1",function(){show_login_method_div();});
		$("#apps_ftpdownloadsLoginMethod_Div").hide();
		
		$("#apps_ftpdownloadsModifyLoginMethod_text").html(_T("_mail","anonymous")).show();
		$("#apps_ftpdownloadsLoginMethodUserName_tr").hide();
		$("#apps_ftpdownloadsLoginMethodPWD_tr").hide();
	}	
	/* [+] Source path */
	var table_ele = $("#Ftp_Download_Create .source_listDiv ul");
	table_ele.empty();
	for(var k in jobs_list[idx][2])
	{
		var t = "<li>";
		var _path = jobs_list[idx][2][k];
		t += String.format('<div class="select_text TooltipIcon" title="{0}">{1}</div>', _path, translate_path_to_display(_path));
		t += "</li>";
		table_ele.append(t);
	}

	var list_height = jobs_list[idx][2].length * 32;
	$("#Ftp_Download_Create .source_listDiv").height((list_height < 96) ? list_height : 96);
	$("#Ftp_Download_Create .source_listDiv").jScrollPane({autoReinitialise: true});
	$(".source_listDiv_empty").hide();
	$("#apps_ftpdownloadsSourcepath_button").hide();
	/* [-] Source path */

	/* [+] Dest path */
	table_ele = $("#Ftp_Download_Create .dest_listDiv ul");
	table_ele.empty();
	var _path = jobs_list[idx][4];
	table_ele.append(String.format('<li><div class="select_text TooltipIcon" title="{0}">{1}</div></li>', _path, translate_path_to_display(_path)));
	$(".dest_listDiv_empty").hide();
	$("#apps_ftpdownloadsDestpath_button").hide();
	/* [-] Dest path */
	//Language
//	$("#apps_ftpdownloadsLang_text").val(jobs_list[idx][20]);
//	var _tmp_desc = codepage_get_mtui_lang("",jobs_list[idx][20])+"("+jobs_list[idx][20]+")";
//	$("#apps_ftpdownloadsLang").html(_tmp_desc);
//	$("#apps_ftpdownloadsLang").attr('rel',jobs_list[idx][20]);		
	
	FDownloads_codepage(jobs_list[idx][20]);
	
	if (jobs_list[idx][14] == "0")
	{
		setSwitch('#apps_ftpdownloadsRecurring_switch', "0");
		set_mode('#s_type',"3",function(){show_schedule_type_div()});		
		sch_hour_select("apps_ftpdownloadsHour",1);	
		sch_day_select("apps_ftpdownloadsDay",1);
		sch_week_select("apps_ftpdownloadsWeek",1);
    sch_pm_select("apps_ftpdownloadsPM",0);
		init_select();
		$(".backup_schedule_tr").hide();
	}	
	else
	{				
		setSwitch('#apps_ftpdownloadsRecurring_switch', "1");
		set_mode('#s_type',jobs_list[idx][14],function(){show_schedule_type_div()});		
		sch_hour_select("apps_ftpdownloadsHour",jobs_list[idx][16]);	
		sch_day_select("apps_ftpdownloadsDay",jobs_list[idx][15]);
		sch_week_select("apps_ftpdownloadsWeek",jobs_list[idx][15]);
	  if (jobs_list[idx][16]<=11)
			sch_pm_select("apps_ftpdownloadsPM",0);
		else	
			sch_pm_select("apps_ftpdownloadsPM",1);
		init_select();
		$(".backup_schedule_tr").show();		
	}
	$("#jobs_list tr").removeClass("trSelected");
		
	$("#apps_ftpdownloadsCreate3_button").hide();	
	$("#apps_ftpdownloadsSave3_button").show();
	$("#apps_ftpdownloadsCancel3_button").show();
	
	$("#FTPDownloadDiag_title").html(_T("_backup","edit_job"));
	$("#FTPDownloadDiag").overlay({fixed: false, oneInstance:false, expose: '#000', api:true, closeOnClick:false, closeOnEsc:false}).load();
	$("#FTPDownloadDiag").center();
	$("#Ftp_Download_Create").show();
	
	$("#apps_ftpdownloadsSave3_button").click(function(){
		if (!check_data())
			return;

		clearTimeout(timeoutId);
		save_job("modify");
	});

	$("#apps_ftpdownloadsCancel3_button").click(function(){
		create_init();	
		$("#FTPDownloadDiag").overlay().close();
	});
}
function save_job(do_action)
{
	jLoading(_T('_common','set'), 'loading', 's', "");
	clearTimeout(timeoutId);
	$("#jobs_list").flexAjaxID().abort();

	var _source_dir = new Array();
	$("#Ftp_Download_Create .source_listDiv li div").each(function(){
		if ($(this).html().substr(0,1) != "/")
		     _source_dir.push("/"+$(this).html());		
		else	
		     _source_dir.push($(this).html());
	});
	var _dest_dir = "";
	$("#Ftp_Download_Create .dest_listDiv li div").each(function(){
		if ($(this).html().substr(0,1) != "/")
			_dest_dir = "/" + $(this).html();
		else	
			_dest_dir = $(this).html();
	});

	/*
	var user = "", pwd = "";
	if ($("#ftp_login_method").attr("rel") == 0)
	{
		user = $("#apps_ftpdownloadsUsername_text").val(),
		pwd = $("#apps_ftpdownloadsPassword_text").val()
	}
	var msg = "user = " + user + "\n";
	*/
	var res = $("#apps_ftpdownloadsLoginMethod_Div").find(".buttonSel").attr("value");
	var user = (parseInt(res,10) == 0)?$("#apps_ftpdownloadsUsername_text").val():"";
	var pwd = (parseInt(res,10) == 0)?$("#apps_ftpdownloadsPassword_text").val():"";
	
	wd_ajax({
		url: "/web/addons/ftp_download.php",
		type: "POST",
		data: {
			action: do_action,
			taskid: $("#f_task_id").val(),
			taskname: $("#apps_ftpdownloadsTaskName_text").val(),
			old_taskname: (do_action == "modify") ? $("#old_taskname").val() : "" ,			
			source_dir: _source_dir,
			dest_dir: _dest_dir,
			//backup_type: $("#f_type").attr('rel'), //1:copy, 2:sync
			schedule: getSwitch('#apps_ftpdownloadsRecurring_switch'),
			backup_sch_type: $("#s_type").attr('rel'),
			hour: $("#id_sch_hour").attr('rel'),
			week: $("#id_sch_week").attr('rel'),
			day: $("#id_sch_day").attr('rel'),
			host: $("#apps_ftpdownloadsHost_text").val()+":"+$("#apps_ftpdownloadsHostPort_text").val(),
			user: user,
			pwd: pwd,
			lang: $("#apps_ftpdownloadsLang").attr('rel')
		},
		cache: false,
		dataType: "json",
		success: function(r) {
			
			jLoadingClose();
			//reload Jobs list
			$("#jobs_list").flexReload();

			$("#apps_ftpdownloadsCancel3_button").click();
		}
	});

	action_type = do_action;
}

function select_change(sel_val)
{
	$("#f_source_path").empty();
	$(".source_listDiv ul").empty();
	$(".source_listDiv").height(0);
	$(".source_listDiv_empty").show();
	$(".dest_listDiv ul").empty();
	$(".dest_listDiv_empty").show();
	$("#apps_ftpdownloadsDestpath_text").val('');
}

function reset_setting()
{
	$("#apps_ftpdownloadsTaskName_text").val('');
	$("#apps_ftpdownloadsHost_text").val('');
	$("#apps_ftpdownloadsHostPort_text").val("21");
	$("#apps_ftpdownloadsUsername_text").val('');
	$("#apps_ftpdownloadsPassword_text").val('');
	$(".source_listDiv ul").empty();
	$(".source_listDiv_empty").show();
	$(".dest_listDiv ul").empty;
	$(".dest_listDiv_empty").show();
	$("#apps_ftpdownloadsDestpath_text").val('');
	$("#f_taskid").val('');
	$("#f_type_select").show();
	$("#f_type_text").hide();
	$("#apps_ftpdownloadsSourcepath_button").show();
	$("#apps_ftpdownloadsDestpath_button").show();
	setSwitch('#apps_ftpdownloadsRecurring_switch', 0);
	select_change(1);

	modify_id = -1;
	//clearTimeout(timeoutId);
	//timeoutId = setTimeout('$("#jobs_list").flexReload()', 3000);
}
function backup_chk_name(name)
{
	//return 1:	not a valid name
	var re=/[^a-zA-Z0-9_-]/;
	if(re.test(name))
		return 1;
	else
		return 0;
}
function check_data()
{
	if ($("#apps_ftpdownloadsTaskName_text").val() == "")
	{
		jAlert( _T('_usb_backups', 'msg7'), "warning","",function(){$("#apps_ftpdownloadsTaskName_text").focus();});					
		return false;
	}		
        if(backup_chk_name($("#apps_ftpdownloadsTaskName_text").val())==1)
	{
		jAlert(_T('_remote_backup','msg5'), _T('_common','error'),"",function(){
			$('#apps_ftpdownloadsTaskName_text').focus();
		});
		return false;
	}		
	if ($("#apps_ftpdownloadsHost_text").val() == "")
	{
		jAlert( _T('_ddns', 'msg11'), "warning","",function(){$("#apps_ftpdownloadsHost_text").focus()});
		return false;
	}
	//Check Port
	var my_port = $("#apps_ftpdownloadsHostPort_text").val();
	if (my_port == "")
	{
		jAlert( _T('_mail','msg7'),  "warning");	//Text:Please enter a port.
		return false;
	}
	if (isNaN(my_port))
 	{
		jAlert( _T('_ftp','msg6'),  "warning");	//Text:Port must be a number.
 		return 0;
 	}	

	if (my_port <= 0 || my_port >65535)
	{
		jAlert( _T('_ftp','msg7'),  "warning");	//Text:Please enter a port.
		return 0;
	}
	if ($("#apps_ftpdownloadsLoginMethod_Div").attr("rel") == 0) //check account
	{
		if ($("#apps_ftpdownloadsUsername_text").val() == "")
		{
			jAlert( _T('_ddns', 'msg7'), "warning","",function(){$("#apps_ftpdownloadsUsername_text").focus()});
			return false;
		}
		
		/*if ($("#apps_ftpdownloadsPassword_text").val() == "")
		{
			jAlert( _T('_ddns', 'msg9'), "warning","",function(){$("#apps_ftpdownloadsPassword_text").focus()});
			return false;
		}*/
	}			
	if ($("#Ftp_Download_Create .source_listDiv ul li").length == 0)
	{
		jAlert( _T('_usb_backups', 'msg2'), "warning");
		return false;
	}

	if ($("#Ftp_Download_Create .dest_listDiv ul li").length == 0)
	{
		jAlert( _T('_usb_backups', 'msg3'), "warning");
		return false;
	}

	var task_name = $("#apps_ftpdownloadsTaskName_text").val();
	for (var idx in jobs_list)
	{
		if (idx == modify_id)
			continue;

		if (jobs_list[idx][0].toLowerCase() == task_name.toLowerCase())
		{
			jAlert( _T('_usb_backups', 'msg8'), "warning","",function(){$("#apps_ftpdownloadsTaskName_text").focus();});
			return false;
		}
	}
	return true;
}

function unbind_dialog_buttons()
{
	$("#FTPDownloadDiag *").unbind('click');
}
function create_init()
{
	$("#apps_ftpdownloadsCancel3_button").unbind('click');
	$("#apps_ftpdownloadsCreate3_button").unbind('click');
	
	//$("#tip_FDownload_lang").attr('title',_T('_tip','fdownload_lang'));
	
	//Hide Modify elements
	$("#apps_ftpdownloadsModifyTaskName_text").hide();
	$("#apps_ftpdownloadsModifyHost_text").hide();
	$("#apps_ftpdownloadsModifyLoginMethod_text").hide();
	$("#apps_ftpdownloadsModifyLoginMethodUserName_text").hide();
	$("#apps_ftpdownloadsModifyLoginMethodPWD_text").hide();
	
	reset_setting();
	$("#apps_ftpdownloadsTaskName_Div").show();
	$("#apps_ftpdownloadsHost_Div").show();
	$("#apps_ftpdownloadsCreate2_button").show();
	$("#apps_ftpdownloadsCancel1_button").hide();
	$("#apps_ftpdownloadsSave1_button").hide();
	
	set_mode('#apps_ftpdownloadsLoginMethod_Div',"1",function(){show_login_method_div();});
	set_mode('#s_type',"3",function(){show_schedule_type_div()});	
	sch_hour_select("apps_ftpdownloadsHour",1);	
	sch_day_select("apps_ftpdownloadsDay",1);
	sch_week_select("apps_ftpdownloadsWeek",1);
  sch_pm_select("apps_ftpdownloadsPM",0);
	//codepage
	codepage_list('apps_ftpdownloadsLang','FDownloads_codepage');
	//$("#apps_ftpdownloadsLang").html("UTF-8").attr('rel','UTF-8');	
	FDownloads_codepage("UTF-8");
	//codepage end
	
	init_select();
	//init_tooltip();		
	$(".backup_schedule_tr").hide();
	
	$('#Ftp_Download_Create').show();
}

function show_schedule_type_div()
{		
	var type = $("#s_type").find(".buttonSel").attr("value");
	switch(type)
	{
		case '3':	//daily
			$("#id_week_div").hide()
			$("#id_month_div").hide()		
			$("#id_hour_div").show();
			if (TIME_FORMAT == "12")
				$("#id_pm_div").show();
			break;
		case '2':	//weekly			
			$("#id_week_div").show()
			$("#id_month_div").hide()
			$("#id_hour_div").show();
			if (TIME_FORMAT == "12")
				$("#id_pm_div").show();
			break;
		case '1':	//monthly			
			$("#id_week_div").hide()
			$("#id_month_div").show()
			$("#id_hour_div").show();
                        if (TIME_FORMAT == "12")
				$("#id_pm_div").show();
			break;
	}
}
function show_login_method_div()
{
	var res = $("#apps_ftpdownloadsLoginMethod_Div").find(".buttonSel").attr("value");
	switch(res)
	{
		case '0':	//account
			$("#apps_ftpdownloadsLoginMethodUserName_tr").show();		
			$("#apps_ftpdownloadsLoginMethodPWD_tr").show();	
			break;
		case '1':	//anonymous
			$("#apps_ftpdownloadsLoginMethodUserName_tr").hide();
			$("#apps_ftpdownloadsLoginMethodPWD_tr").hide();
			break;
	}
}
/* fish20150519mark, move to function.js
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
		$("#"+div).html(_T('_common','none'));
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
*/
function FDownloads_codepage(str)
{
	var my_desc = codepage_get_mtui_lang("",str)+"("+str+")"; 
	$("#apps_ftpdownloadsLang").attr('rel',str).html(my_desc);
}