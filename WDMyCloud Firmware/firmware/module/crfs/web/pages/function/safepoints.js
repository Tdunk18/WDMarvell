

var _Safepoints_info_array=new Array();
var s_backupNow = _T('_safepoints','backup_now');
var s_recover = _T('_remote_backup','recover');
var s_del = _T("_usb_backups", "del_job");
var s_detail = _T("_usb_backups", "details");
var s_cancel = _T('_remote_backup','cancel');
var s_completed = _T('_remote_backup','completed');
var s_status = _T('_usb_backups', 'status1');
var s_incomplete = _T('_remote_backup','incomplete');
var _remote_list_array = new Array();
function get_remote_backup_list()
{
	clearTimeout(RemoteTimeoutId);
	_Safepoints_info_array = new Array();
	wd_ajax({	 			   
		type: "POST",
		cache: false,
		url: "/cgi-bin/remote_backup.cgi",
		data:{cmd:"cgi_get_backup_list"},
		dataType: "xml",
	   	success: function(xml)
	   	{
	   		var total = $(xml).find('total').text();
	   		
			$(xml).find('row').each(function(index){
				var name = $(this).find('cell').eq(0).text();
				var remote_ip = $(this).find('cell').eq(1).text();
				var local_size = $(this).find('cell').eq(2).text();
				var schedule = $(this).find('schedule').text();
				var schedule_mode = $(this).find('schedule_mode').text();
				var schedule_text = $(this).find('schedule_text').text();
				var backup_status = $(this).find('status').text();
				var recover_status = $(this).find('recover_status').text();
				var local_path = $(this).find('local_path').text();
				var last_updated = $(this).find('last_updated').text();
				var recover_last_updated = $(this).find('recover_last_updated').text();
				var last_time = $(this).find('last_time').text();
				var backup_folder = $(this).find('backup_folder').text();
				var incremental = $(this).find('incremental').text();
				var bandwidth = $(this).find('bandwidth').text();
				var keep_exist_file = $(this).find('keep_exist_file').text();
				var backup_folder_path = $(this).find('backup_folder_path').text();
				var last_backup_type = $(this).find('last_backup_type').text();
				var ecode = $(this).find('ecode').text();

				//console.log("schedule_mode={%s}",schedule_mode)
				
				_Safepoints_info_array[index] = new Array();
				_Safepoints_info_array[index].name = name;
				_Safepoints_info_array[index].index=index;
				_Safepoints_info_array[index].remote_ip=remote_ip;
				_Safepoints_info_array[index].schedule=schedule;
				_Safepoints_info_array[index].schedule_mode=schedule_mode;
				_Safepoints_info_array[index].status=backup_status;
				_Safepoints_info_array[index].local_path = local_path;
				_Safepoints_info_array[index].schedule_text = schedule_text;
				_Safepoints_info_array[index].recover_status = recover_status;
				_Safepoints_info_array[index].last_time = last_time;
				_Safepoints_info_array[index].last_updated = last_updated;
				_Safepoints_info_array[index].recover_last_updated = recover_last_updated;
				_Safepoints_info_array[index].backup_folder = backup_folder;
				_Safepoints_info_array[index].incremental = incremental;
				_Safepoints_info_array[index].bandwidth = bandwidth;
				_Safepoints_info_array[index].keep_exist_file = keep_exist_file;
				_Safepoints_info_array[index].backup_folder_path = backup_folder_path;
				_Safepoints_info_array[index].last_backup_type = last_backup_type;
				_Safepoints_info_array[index].ecode = ecode;
				_Safepoints_info_array[index].method = $(this).find('method').text();
				_Safepoints_info_array[index].day = $(this).find('day').text();
				_Safepoints_info_array[index].hour = $(this).find('hour').text();
				_Safepoints_info_array[index].minute = $(this).find('minute').text();
				_Safepoints_info_array[index].month = $(this).find('month').text();
				_Safepoints_info_array[index].week = $(this).find('week').text();
				_Safepoints_info_array[index].backup_with_ssh = $(this).find('backup_with_ssh').text();
				_Safepoints_info_array[index].type="remote";
			});
			
			_remote_list_array = _Safepoints_info_array;
			
			if(total==0)
			{
				//$("#remote_list_info").show();
				//$("#remote_list_info").html(_T("_remote_backup","des3"))
				$("#remote_list").html("");
				$("#backups_rList_value").hide();
				return;
			}
			else
			{
				$("#backups_rList_value").show();
				$("#remote_list_info").hide();
			}
		
			var ul_obj = document.createElement("ul"); 
			$(ul_obj).addClass('remoteListDiv');
		
			var backup_flag=0;
			for(var i=0 ; i < _Safepoints_info_array.length; i++)
			{
				var li_obj = document.createElement("li"); 
				//$(li_obj).append('<div class="ricon"></div>');
				$(li_obj).append('<div class="rname" id="backups_rName'+i + '_value">'+ _Safepoints_info_array[i].name +'</div>');
				$(li_obj).append('<div class="rip" id="backups_rIP' + i + '_value">' + _Safepoints_info_array[i].remote_ip + '</div>');
				
				var s = _Safepoints_info_array[i].status.split(":");
				var recover = _Safepoints_info_array[i].recover_status.split(":");
				var lastTime = _Safepoints_info_array[i].last_time;
				var last_updated = _Safepoints_info_array[i].last_updated;
				var recover_last_updated = _Safepoints_info_array[i].recover_last_updated;
				var ratio = _Safepoints_info_array[i].backup_folder.split("/");
				var incremental = _Safepoints_info_array[i].incremental;
				var backup_folder="";
				var tmp_backup_folder = ratio[ratio.length-1];
					if(tmp_backup_folder.length >0)
						backup_folder = ratio[0] + "/" + ratio[1]+"," + tmp_backup_folder;
				var last_backup_type = _Safepoints_info_array[i].last_backup_type
				var backup_flag=0;
				var percent="0";
				if(s[0]=="Prepare" || recover[0]=="Prepare")
				{
					percent="0";
					backup_flag=1;
				}
				else if(s[0]=='Backup Now')
				{
					percent = s[1];
					backup_flag=1;
				}
				else if(recover[0]=='Backup Now')
				{
					percent = recover[1];
					backup_flag=1;
				}
				else if(s[0]=="Failed" || recover[0]=="Failed")
				{
					backup_flag = -1;
				}
				else if(s[0]=="Cancel" || recover[0]=="Cancel")
				{
					backup_flag = 3;
				}
				else
				{
					if(last_updated!="" || recover_last_updated!="")
						backup_flag=0;
					else
						backup_flag=2;
				}
				
				var do_recover_flag=0; 
				if(s[0]=="Failed" || s[0]=="Cancel")
				{
					do_recover_flag=-1;	
				}
				else
				{
					if(last_updated!="")
					{
						if(incremental=="1")
						{
							do_recover_flag = 1;
						}
						else
						{
							do_recover_flag=0;
						}
					}
					else
						do_recover_flag=-1;
				}
				
				if(backup_flag==1)
				{
					if(last_backup_type=="2")
					{
						backup_folder = _T('_usb_backups','recovering') + backup_folder;
					}
					var bar = '<div class="list_icon_bar">' +
							  '<div class="bar_p" style="width: '+ percent + '%"></div>' +
							  '</div>' +
							  '<div class="list_icon_bar_text overflow_hidden_nowrap_ellipsis tip" rel="" title="' + backup_folder + '"+ >' + backup_folder + " " + percent +'%</div>';
							  //'<span class="bar_text">' + percent + '%</span>';
											  
					$(li_obj).append('<div class="rstate" id="backups_rState' + i + '_value">' + bar + '</div>');
					$(li_obj).append('<a tabindex="0" id="backups_rStop' + i + '_link" class="rstopIcon tip" href="javascript:stop_task(\'' + i + '\')" rel="" title="' + s_cancel +'"></a>');
					$(li_obj).append('<a tabindex="0" id="backups_rInfo' + i + '_link" class="rdetailIcon tip" href="javascript:show_task_detail(\'' + i + '\')" rel="" title="' + s_detail + '"></a>');
				}
				else
				{
					var state_str="";
					var lupdate="";
					if(lastTime=="1")
					{
						state_str = s[0];
						lupdate=last_updated;
					}
					else
					{
						state_str = recover[0];
						lupdate=recover_last_updated;
					}
					
					if(state_str=="Failed")
						s = s_incomplete;
					else if(state_str=="Cancel")
						s = s_cancel;
//					else if(state_str=="Ready")
//					{
//						s = s_status
//					}
					else
					{
						//alert(_Safepoints_info_array[i].name +" "+lupdate)
						if(lupdate!="") 
							s = s_completed;
						else
							s = s_status; //Ready
					}
					
					$(li_obj).append('<div class="rstate" id="backups_rState' + i + '_value">' + s + '</div>');
						
					$(li_obj).append('<a tabindex="0" id="backups_rBackupNow' + i + '_link" class="rbackupIcon tip" href="javascript:backup_now(\'' + i + '\')" rel="" title="' + s_backupNow +'"></a>');
					$(li_obj).append('<a tabindex="0" id="backups_rRecoverNow' + i + '_link" class="rrecoverIcon tip" href="javascript:recover_now(\'' + i + '\',\'' + do_recover_flag + '\')" rel="" title="' +s_recover +'"></a>');
					$(li_obj).append('<a tabindex="0" id="backups_rDel' + i + '_link" class="rdelIcon tip" href="javascript:delete_job(\'' + i + '\')" rel="" title="' + s_del+'"></a>');
					$(li_obj).append('<a tabindex="0" id="backups_rInfo' + i + '_link" class="rdetailIcon tip" href="javascript:show_task_detail(\'' + i + '\')" rel="" title="' + s_detail + '"></a>');
				}
				$(ul_obj).append($(li_obj));
			}
			$("#remote_list").html($(ul_obj));
			init_tooltip('.tip');
			
			RemoteTimeoutId = setTimeout(get_remote_backup_list,6000);
	   	}
	 });
}

var _init_detail_falg=0;
function show_task_detail(idx)
{
	adjust_dialog_size("#rDetailDiag","",480);
	_INIT_TYPE = "detail"
	var remoteObj=$("#rDetailDiag").overlay({fixed:false,oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	remoteObj.load();
	$("#rDetailDiag").center();
	_DIALOG = remoteObj;
	
	INTERNAL_DIADLOG_DIV_HIDE('safeDiag');
	
	var detail_str = _T("_remote_backup","x_detail");
	
	detail_str = detail_str.replace(/%s/g,_Safepoints_info_array[idx].name);
	$("#rDetailDiag_title").html(_T("_remote_backup","remote_title10"));
	$("#rDiag_schedule").show();
	$("#schedule_tr").show();
	$("#schedule_div").show();
	$("#schedule_button1").hide();
	$("#schedule_button2").show();
	
	$("#job_name").html(_Safepoints_info_array[idx].name);
	//get_modify_info(_Safepoints_info_array[idx].name);
	//get_folder_size(_Safepoints_info_array[idx].local_path);
	
	//show last update info
	$("#detailDiag").show();
	
	var last_updated="";
	if(_Safepoints_info_array[idx].last_backup_type=="1")
		last_updated = _Safepoints_info_array[idx].last_updated;
	else
		last_updated = _Safepoints_info_array[idx].recover_last_updated;
	var str="";
	if(last_updated.length==0)
		$("#last_update").html("-");
	else
	{
		if (!isNaN(last_updated))
		{
			var seconds = last_updated;
			// multiply by 1000 because Date() requires miliseconds
			var date = new Date(seconds * 1000);
			last_updated = multi_lang_format_time(date);
		}
		else
		{
			last_updated = multi_lang_format_time(last_updated);
		}
		
		var status="";
		if(_Safepoints_info_array[idx].last_backup_type=="1")
		{
			status = _Safepoints_info_array[idx].status;
		}
		else
		{
			status = _Safepoints_info_array[idx].recover_status;
		}
		switch(status)
		{
			case 'Ready':
			case 'Finish':
				str = _T('_remote_backup','backup_complete_on').replace(/%s/g,last_updated);
				break;
			default:
				if(_Safepoints_info_array[idx].status.indexOf(":")!=-1)
				{
					str = _Safepoints_info_array[idx].status.split(":");
					str = str[0];
					if(str.indexOf("Backup Now")!=-1)
					{
						str = _T('_usb_backups','status2');
					}
					$("#del_job").hide();
				}
				else
				{
					switch(status)
					{
						case 'Cancel':
							str = _T('_remote_backup','cancel_on').replace(/%s/g,last_updated);
							break;
						case 'Failed':
							str = _T('_remote_backup','failed_on').replace(/%s/g,last_updated);
							if(_Safepoints_info_array[idx].ecode==S_RSYNC_NO_SPACE)
							{
								str = _T('_media','status_fail5');
							}
							break;
					}
					//str = _MODIFY_ARRAY.backup_status + " on " + _MODIFY_ARRAY.last_update;
					$("#del_job").show();
				}
				break;
		}
		$("#last_updated").html(str);
	}
	
	//recover 
	var recover_last_update = _Safepoints_info_array[idx].recover_last_updated;
	var str="";
	
	if(recover_last_update.length==0)
		$("#recover_last_update").html("-");
	else
	{
		//console.log(_MODIFY_ARRAY.recover_status)
		switch(_Safepoints_info_array[idx].recover_status)
		{
			case 'Ready':
			case 'Finish':
				str = _T('_remote_backup','recover_complete_on').replace(/%s/g,recover_last_update);
				break;
			default:
				if(_Safepoints_info_array[idx].recover_status.indexOf(":")!=-1)
				{
					str = _Safepoints_info_array[idx].status.split(":");
					str = str[0];
					
					$("#del_job").hide();
				}
				else
				{
					switch(_Safepoints_info_array[idx].recover_status)
					{
						case 'Cancel':
							str = _T('_remote_backup','cancel_on').replace(/%s/g,recover_last_update);
							break;
						case 'Failed':
							str = _T('_remote_backup','failed_on').replace(/%s/g,recover_last_update);
							break;
					}
					//str = _MODIFY_ARRAY.recover_status + " on " + _MODIFY_ARRAY.recover_last_update;
					$("#del_job").show();
				}
				break;
		}
		$("#recover_last_update").html(str);
	}
	var my_str = _Safepoints_info_array[idx].schedule_text;
	/*
	my_str = my_str.replace(/Daily/g,_T('_mail','daily'));
	my_str = my_str.replace(/Weekly/g,_T('_mail','weekly'));
	my_str = my_str.replace(/Monthly/g,_T('_mail','monthly'));
	my_str = my_str.replace(/MON/g,_T('_p2p','mon'));
	my_str = my_str.replace(/TUE/g,_T('_p2p','tue'));
	my_str = my_str.replace(/WED/g,_T('_p2p','wed'));
	my_str = my_str.replace(/THU/g,_T('_p2p','thu'));
	my_str = my_str.replace(/FRI/g,_T('_p2p','fri'));
	my_str = my_str.replace(/SAT/g,_T('_p2p','sat'));
	my_str = my_str.replace(/SUN/g,_T('_p2p','sun'));
	*/
	
	if(my_str.indexOf("Manual")!=-1)
	{
	my_str = my_str.replace(/Manual/g,_T('_ipv6','off')); //_T('_remote_backup','manual')
	$("#detail_schedule").html(my_str);
	}
	else
	{
		var method = _Safepoints_info_array[idx].method;
		var week_day = _Safepoints_info_array[idx].day;
		if(method==2)//weekly
		{
			week_day = _Safepoints_info_array[idx].week;
		}
		show_schedule("detail_schedule",method,week_day,_Safepoints_info_array[idx].hour);
	}
	
	
	//$("#detail_schedule").html(my_str);
	$("#detail_remote_ip").html(_Safepoints_info_array[idx].remote_ip);
	$("#detail_remote_share").html(_Safepoints_info_array[idx].backup_folder_path);

	var backup_with_ssh = [_T('_ipv6','off'),_T('_common','on')];
	var ssh_flag = _Safepoints_info_array[idx].backup_with_ssh;
	$("#detail_remote_backup_with_ssh").html(backup_with_ssh[ssh_flag]);
	
	//show local share
	//get_Name_Mapping_Hame("HDD");

	setTimeout(function(){
		
		var local_path = _Safepoints_info_array[idx].local_path;
		
		local_path = local_path.split(":");
		var new_path_array = new Array();

		var s = '<div id="detail_local_share" class="source_listDiv" style="width:247px"><ul></ul></div>';
		$("#detail_local_share_div").html(s);
		
		var table_ele = $("#detail_local_share.source_listDiv ul");
		table_ele.empty();
		
		for(i=0;i < local_path.length;i++)
		{
			var new_path = translate_path_to_display(local_path[i]);
			//new_path = local_path[i];
			//new_path = new_path.split("/");
			//new_path = new_path[new_path.length-1];
			
			var t = "<li>";
			t += String.format('<div class="select_text TooltipIcon" title="{0}">{1}</div>', new_path, new_path);
			t += "</li>";
			
			if(local_path.length==1)
			{
				$("#detail_local_share_div").html(new_path);
			}
			else
			{
				table_ele.append(t);
			}
		}
		var count = local_path.length;

		if(count >=3)
		{
			var list_height = count * 30;
			$("#detail_local_share.source_listDiv").height((list_height < 110) ? list_height+10 : 110);
			$("#detail_local_share.source_listDiv").jScrollPane({contentWidth:247, autoReinitialise: true});
		}
		
		setTimeout(function(){
			if(count >=2)
			{
				$("#detail_source_label").css("vertical-align","top");
				var h = $("#rDetailDiag").height()+100;
				
				adjust_dialog_size("#rDetailDiag","",h);
			}
			else
			{
				$("#detail_source_label").css("vertical-align","");
				adjust_dialog_size("#rDetailDiag","",480);
		}
			
			init_tooltip();
		},200);
	},500);
					
	var bandwidth = _T('_network_ups','unknown'); //N/A
	if(_Safepoints_info_array[idx].bandwidth!=0)
		bandwidth = _Safepoints_info_array[idx].bandwidth + " KB/s";
		
	$("#detail_bandwidth").html(bandwidth);
	
	var schedule = _Safepoints_info_array[idx].schedule;
	var schedule_mode = _Safepoints_info_array[idx].schedule_mode;
	
	var type_str = [_T('_usb_backups','sync'),_T('_usb_backups','incremental'),_T('_usb_backups','copy')];
	
	var incremental = _Safepoints_info_array[idx].incremental;
	if(incremental=="1")
		$("#detail_type").html(type_str[1]);
	else
	$("#detail_type").html(type_str[_Safepoints_info_array[idx].keep_exist_file]);
}
var RemoteBackup_ID="",RecoverBackup_ID="";
var RemoteIntervalId="";
function get_percent(job_name,idx)
{
	clearTimeout(RemoteBackup_ID);
	clearTimeout(RecoverBackup_ID);
 	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/remote_backup.cgi",
		data:{cmd:"cgi_get_percent",job_name:job_name
			},
		dataType: "xml",
		success: function(xml){
			
			var percent = $(xml).find('status').text();
			var recover_percent = $(xml).find('recover_status').text();
			percent = percent.split(":");
			recover_percent = recover_percent.split(":");
			var flag=0;
			switch (percent[0])
			{
				case "Ready":
				case "Finish":
				case "Failed":
				case "Disabled":
					$("#r" + idx).show();
					$("#rc" + idx).show();
					$("#rs" + idx).hide();
					$("#rpercent" + idx).hide();
					break;
				case "Backup Now":
				case "Recovery Now":
					percent = percent[1];
					percent = percent.split("%")[0];
					
					//console.log("percent=[%s]",percent)
					
					if(percent=='0')
					{
						$("#rs" + idx).progressbar();
					}
					else
					{
						$("#rs" + idx).progressbar('option', 'value', parseInt(percent,10));
						$("#rpercent" + idx).show();
						$("#rpercent" + idx).html(percent + " %");
					}
					flag=1;
					RemoteBackup_ID = setTimeout('get_percent("' + job_name + '","' + idx + '")',6000);
					break;
			}
			
			if(flag==0)
			{
				switch (recover_percent[0])
				{
					case "Ready":
					case "Finish":
					case "Failed":
					case "Disabled":
						$("#r" + idx).show();
						$("#rc" + idx).show();
						$("#rs" + idx).hide();
						$("#rpercent" + idx).hide();
						
						break;
					case "Backup Now":
					case "Recovery Now":
						$("#r" + idx).hide();
						$("#rc" + idx).hide();
						$("#rs" + idx).show();
						$("#rpercent" + idx).show();
						recover_percent = recover_percent[1];
						recover_percent = recover_percent.split("%")[0];
						
						//console.log("recover percent=[%s]",recover_percent)
						
						if(recover_percent=='0')
						{
							$("#rs" + idx).progressbar();
						}
						else
						{
							$("#rs" + idx).progressbar('option', 'value', parseInt(recover_percent,10));
							$("#rpercent" + idx).show();
							$("#rpercent" + idx).html(recover_percent + " %");
						}
					
					RecoverBackup_ID = setTimeout('get_percent("' + job_name + '","' + idx + '")',6000);
					break;
				}
			}
		}
	});
}
function get_folder_size(path)
{
 	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/remote_backup.cgi",
		data:{cmd:"cgi_get_folder_size",path:path},
		dataType: "xml",
		success: function(xml){
			var folder_size = $(xml).find('folder_size').text();
			
			if(folder_size!="N/A") folder_size = folder_size+"B";
			$("#detail_size").html(folder_size);
		}	
	});
}