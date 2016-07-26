var MAX_ISCSI = 64;
var MAX_ACL = 256;
var MAX_LUN = 256;
var _INIT_ISCSI_DIAG_FLAG=0;	
var _g_hostname;
var _g_iqn_prefix;
var timeoutId_iscsi = -1;
var timeoutId_snap = -1;
var _g_target = "";
var _g_lun = "";

function close_create_dialog()
{
	$("#iscsi_step1").show();
	$("#iscsi_step2").hide();
	$("#iscsi_step3").hide();		
	$("#iscsi_lun_step1").show();
	$("#iscsi_lun_step2").hide();	
	$("#iscsi_lun_step3").hide();									
}
function init_iscsi_dialog()
{	
	$("#f_iqn").text(_g_iqn_prefix+_g_hostname+":")
	$("#f_lun_target_iqn").text(_g_iqn_prefix+_g_hostname+":")
	language();
	$("input:text").inputReset();
	$("input:password").inputReset();
	init_switch();
	if(_INIT_ISCSI_DIAG_FLAG==1)
		return;
	_INIT_ISCSI_DIAG_FLAG=1;
	$("#tip_autoupdate").attr('title',_T('_tip','s3_auto'));
	$("#storage_iscsiTargetNext1_button").click(function(){			
			if (create_iscsi_chk_chap() == 1) return;	
			if (chk_name() == 0 )
			{									
					if ($('#i_lun_mapping').attr('rel') == 2)
					{
							$("#iscsi_step3").show();
							$("#iscsi_step2").hide();
							$("#iscsi_step1").hide();
					}
					else if ($('#i_lun_mapping').attr('rel') == 3)
					{
							var num = write_lun();
							if (num == 0 )
							{								
								jAlert(_T('_iscsi','msg23'), _T('_common','error'));
								return;
							}											
							$("#iscsi_step2").show();
							$("#iscsi_step3").hide();
							$("#iscsi_step1").hide();																																								
							setTimeout(
							function()
							{
								
								if (num >= 5)
								{
									$("#id_lun_mapping_scroll").addClass("scrollbar_iscsi_lun_list")
									$(".scrollbar_iscsi_lun_list").jScrollPane();	
								}	
								else
								{									
									if ($("#id_lun_mapping_scroll").hasClass("scrollbar_iscsi_lun_list"))
									{										
										var element = $('.scrollbar_iscsi_lun_list').jScrollPane({/*params*/});				
										var api = element.data('jsp');				
										api.destroy();					
										$("#id_lun_mapping_scroll").removeClass("scrollbar_iscsi_lun_list");									
									}	
									
								}	
							},500);
					}							
			}	
	});
		
		
	$("#i_back_button_1").click(function(){			
					$("#iscsi_step3").hide();
					$("#iscsi_step2").hide();
					$("#iscsi_step1").show();		
					if ($('#i_lun_mapping').attr('rel') == 2 || $('#i_lun_mapping').attr('rel') == 3)
					{
						$("#storage_iscsiTargetSave1_button").hide();
						$("#storage_iscsiTargetNext1_button").show();												
					}
					else
					{
						$("#storage_iscsiTargetSave1_button").show();
						$("#storage_iscsiTargetNext1_button").hide();												
					}			
		});		
		
		$("#storage_iscsiTargetBack2_button").click(function(){			
					$("#iscsi_step3").hide();
					$("#iscsi_step2").hide();
					$("#iscsi_step1").show();	
		});						

	//lun dialog	
		$("#storage_iscsiLunNext1_button").click(function(){			
			if (chk_lun_name() == 0 )
			{			
					if ($('#i_target_mapping').attr('rel') == 2)
					{
							$("#storage_iscsiLunAlias_text").val("");
							$("#iscsi_lun_step2").hide();
							$("#iscsi_lun_step1").hide();				
							$("#iscsi_lun_step3").show();	

					}
					else if ($('#i_target_mapping').attr('rel') == 3)
					{	
						adjust_dialog_size("#iscsi_lun_step2","750","");									
						write_iqn();													
						$("#iscsi_lun_step2").show();
						$("#iscsi_lun_step1").hide();				
						$("#iscsi_lun_step3").hide();										
						$("#i_lun_create").show();
						$("#i_lun_next_button_2").hide();
						
						$(".scrollbar_iscsi_target_list").jScrollPane();

					}					
			}	
		});
		
		$("#i_lun_next_button_2").click(function(){
				$("#iscsi_lun_step3").show();
				$("#iscsi_lun_step1").hide();
				$("#iscsi_lun_step2").hide();	
		});
		
		$("#i_lun_back_button_1").click(function(){				
				$("#iscsi_lun_step3").hide();
				$("#iscsi_lun_step1").show();
				$("#iscsi_lun_step2").hide();	
		});
		
		$("#storage_iscsiLunBack2_button").click(function(){				
				$("#iscsi_lun_step3").hide();
				$("#iscsi_lun_step2").hide();
				$("#iscsi_lun_step1").show();	
		});		
		//backup

		$("#i_next_snap_button_1").click(function(){					
					var find = 0;			
					$('#id_lun_snap_tb ul li').each(function(index){			
					if($("#id_lun_snap_tb ul li:eq("+index+") div:eq(0) input ").prop('checked'))
					{
							find = 1;
					}
					if (find == 0 )
					{
						alert("Please choise LUN.");
						return;
					}
					
					$("#iscsi_schedule").show();									
					$("#iscsi_snap_step1").hide();					
					$("#iscsi_backup_path").hide();
					$("#iscsi_finish").hide();
					$("#iscsi_snap_finish").hide();
					SetChapMode("#s_type",'1','click');		
					SetChapMode("#f_backup_now",'1','click');									
				});				
		});
	
		$("#storage_iscsiLunBackupBack2_button").click(function(){	
					if (_use_function == "backup" || _use_function == "backup_detail")
					{
						$("#iscsi_backup_path").show();
						$("#iscsi_schedule").hide();
						$("#iscsi_finish").hide();
						$("#iscsi_snap_finish").hide();
						$("#iscsi_snap_step1").hide();
					}	
					else
					{
						$("#iscsi_schedule").hide();									
						$("#iscsi_snap_step1").show();					
						$("#iscsi_backup_path").hide();
						$("#iscsi_finish").hide();
						$("#iscsi_snap_finish").hide();
					}	
		});
		
		$("#storage_iscsiLunBackupNext1_button").click(function(){	
					if ($("#storage_iscsiLunPath_text").val() == "")
					{
						jAlert( _T('_iso_create','msg3'),_T('_common','error'));	
						return;
					}
					$("#iscsi_backup_path").hide();
					$("#iscsi_schedule").show();
					$("#iscsi_hide").hide();
					if (_use_function == "backup")
					{
						SetChapMode("#s_type",'1','click');
						SetChapMode("#f_backup_now",'1','click');
					}	
		});
		$("#storage_iscsiLunBackupNext2_button").click(function(){
				if (_use_function == "backup" || _use_function == "backup_detail")
					{	
						view();	
						$("#iscsi_backup_path").hide();
						$("#iscsi_schedule").hide();		
						$("#iscsi_finish").show();
					}
					else
					{
						snap_view();	
						$("#iscsi_snap_step1").hide();
						$("#iscsi_backup_path").hide();
						$("#iscsi_schedule").hide();		
						$("#iscsi_finish").hide();
						$("#iscsi_snap_finish").show();
					}		
		});	
		$("#storage_iscsiLunBackupBack3_button").click(function(){
							
					$("#iscsi_backup_path").hide();
					$("#iscsi_schedule").show();		
					$("#iscsi_finish").hide();														
		});		
		$("#storage_iscsiLunSnapBack_button").click(function(){							
					$("#iscsi_snap_step1").hide();							
					$("#iscsi_schedule").show();																			
					$("#iscsi_snap_finish").hide();
		});		
		
		
			$("#storage_iscsiLunAuto_switch").click(function(){			
		var v = getSwitch('#storage_iscsiLunAuto_switch');
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
	
			$("#i_lun_mapping").unbind("click");
			$("#i_lun_mapping").click(function(index){			
					if ($('#i_lun_mapping').attr('rel') == 2 || $('#i_lun_mapping').attr('rel') == 3)
					{
						$("#storage_iscsiTargetSave1_button").hide();
						$("#storage_iscsiTargetNext1_button").show();												
					}
					else
					{
						$("#storage_iscsiTargetSave1_button").show();
						$("#storage_iscsiTargetNext1_button").hide();												
					}	
			});
			
			$("#i_target_mapping").unbind("click");
			$("#i_target_mapping").click(function(index){			
					if ($('#i_target_mapping').attr('rel') == 2 || $('#i_target_mapping').attr('rel') == 3)
					{
						$("#storage_iscsiLunSave1_button").hide();
						$("#storage_iscsiLunNext1_button").show();												
					}
					else
					{
						$("#storage_iscsiLunSave1_button").show();
						$("#storage_iscsiLunNext1_button").hide();												
					}	
			});
}	
function write_iqn()
{
	var str = "";
	
	wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:"cmd=cgi_get_iscsi_iqn",
		dataType: "xml",	
		success:function(xml){																				
				str = str+ '<ul class="iscsiListDiv">';			
				$(xml).find('row').each(function(index){					
					 	 var iqn = $(this).find('cell').eq(0).text();	
					 	 var status = $(this).find('cell').eq(1).text();	
					 	  str = str+ '<li>';
					 	  str = str+ '<div class="chkbox"><input type="checkbox" value='+index+' ></div>';
					 	 	str = str+ '<div class="iqn">'+iqn+'</div>';
							str = str+ '<div class="status">'+status+'</div>';		
								str	= str+'</li>';			
				 });				 
				 str = str + '</ul>'
			}
	});			
	
	$("#id_target_mapping_tb").html(str);
	$("input:checkbox").checkboxStyle();
	$("#id_target_mapping_tb").show();
	
		
	var obj_id = "#id_target_mapping_tb";
	$( obj_id +" input:checkbox").unbind('click');
	
	$( obj_id ).find("input:checkbox").each(function(index){		
		$this=$(this);
		$this.attr('id',"storage_iscsiLunDetailTarget"+index+"_chkbox");
		_click("storage_iscsiLunDetailTarget"+index+"_chkbox");
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
			_uncheck(obj_id,"#storage_iscsiLunDetailTarget");
			
			if(chkFlag==1) 
			{
				//$(obj_id + " .name").css("color","#898989");
				if (jQuery.browser.msie == true && jQuery.browser.version < 9.0)
				{
					$(this).next('span').addClass("checked")
				}
				else
					$(this).attr("checked",true);

		 		//chk_hdd_free_size($(this).val())
		 		$(obj_id).find('.name').css('color','#898989');
		 		$(obj_id).find('.size').css('color','#898989');					
				$(this).parent().parent().parent().find('.name').css('color','#0067A6');
				$(this).parent().parent().parent().find('.size').css('color','#0067A6');
				//_REMOTE_SHARE = $(this).parent().parent().parent().find('.name').html();
			}
			else
			{
				//$("#size_info").empty();
				$(this).parent().parent().parent().find('.name').css('color','#898989');
				$(this).parent().parent().parent().find('.size').css('color','#898989');
			}
		});
	}
}

function set_iqn(iqn_id,name_id)
{
	$("#"+iqn_id).text(_g_iqn_prefix+_g_hostname+":"+$("#"+name_id).val());
}
function volume_select()
{
	do_query_HD_Mapping_Info();

	$('#id_volume_top_main').empty();
    html_select_open = "";
	html_select_open += '<ul>';
	html_select_open += '<li class="option_list">';          
	html_select_open += '<div id="id_volume_main" class="wd_select option_selected">';
	html_select_open += '<div class="sLeft wd_select_l"></div>';
	for( var i=0 in HDD_INFO_ARRAY)
	{
		var info = HDD_INFO_ARRAY[i].split(":");
		var volume_name = info[0];
		var volume_path = info[1];		
		if ( i== 0)
			get_iscsi_volume_size(volume_name);
		if(i==0 && HDD_INFO_ARRAY.length==1)
		{
			html_select_open += '<div class="sBody text wd_select_m" id="id_volume" rel="' + volume_path + '" >'+volume_name+'</div>';
			html_select_open += '<div class="sRight wd_select_r"></div>	';
			html_select_open += '</div>';
			html_select_open += '<ul class="ul_obj" style="width:130px;">'; 
			html_select_open += '<li rel="' + volume_path + '" class="li_start li_end" style="width:120px;"><a href=\"#\" onclick=\"show_volume_info_iscsi(\'id_volume\');get_iscsi_volume_size(\''+volume_name+'\');\">' + volume_name + '</a></li>';
			
		}
		else if(i==0) 
		{
			html_select_open += '<div class="sBody text wd_select_m" id="id_volume" rel="' + volume_path + '" >'+volume_name+'</div>';
			html_select_open += '<div class="sRight wd_select_r"></div>	';
			html_select_open += '</div>';
			html_select_open += '<ul class="ul_obj" style="width:130px;">';
			html_select_open += '<li rel="' + volume_path + '" class="li_start" style="width:120px;"><a href=\"#\" onclick=\"show_volume_info_iscsi(\'id_volume\');get_iscsi_volume_size(\''+volume_name+'\');\">' + volume_name + '</a></li>';
		}
		else if(i==HDD_INFO_ARRAY.length-1) 
			html_select_open += '<li rel="' + volume_path + '" class="li_end" style="width:120px;"><a href=\"#\" onclick="show_volume_info_iscsi(\'id_volume\');get_iscsi_volume_size(\''+volume_name+'\');\">' + volume_name + '</a></li>';
		else
		{
			html_select_open += '<li rel="' + volume_path + '" style="width:120px;"><a href=\"#\" onclick=\"show_volume_info_iscsi(\'id_volume\');get_iscsi_volume_size(\''+volume_name+'\');\">' + volume_name + '</a></li>';
		}
	}

	html_select_open += '</ul>';
	html_select_open += '</li>';
	html_select_open += '</ul>';

	
	$("#id_volume_top_main").append(html_select_open);
	
	hide_select();
	init_select();
}

function get_iscsi_volume_size(v)
{	
	var str = "cmd=cgi_Status_CapacityUsage&share=0"
	
	wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/hd_config.cgi",
		data:str,
		dataType: "xml",	
		success:function(xml){													
			//alert("v="+v);												
			//alert("v="+v.substr(7,1))		
				$(xml).find('item').each(function(){					
					 	 var volume = $(this).find('volume').text();									 	 
					 	 //alert("volume="+volume)
					 	 //console.log("v = %s,volume=%s",v,volume);
					 	 if (volume == v.substr(7,1))
					 	 {
					 	 	var size = $(this).find('free_size').text();					 					
					 	 	var k = size2str(size*1024);
					 	 	$("#id_volume_size").text(k);
					 	 	$("#id_volume_size_byte").text(size*1024);					 	 	
					 	 	
					 	 	$("#id_volume_lun_size").text(k);
					 	 	$("#id_volume_lun_size_byte").text(size*1024);
					 	 	
					 	 	$("#id_volume_target_lun_size").text(k);
					 	 	$("#id_volume_target_lun_size_byte").text(size*1024);
					 	 	
					 	 	$("#id_lun_edit_size").text(k);
					 	 	$("#id_lun_edit_size_byte").text(size*1024);
					 	 						 	 	
					 	 	return false;
					 	 }
				 });
			}
	});	
}


function iscsi_volume_size(v)
{		
	var str = "cmd=cgi_Status_CapacityUsage&share=0"
	var volume_size = 0;
	wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/hd_config.cgi",
		data:str,
		dataType: "xml",	
		success:function(xml){														
				$(xml).find('item').each(function(){					
					 	 var volume = $(this).find('volume').text();									 	 
					 	 if (volume == v.substr(7,1))
					 	 {
						 	 	var size = $(this).find('free_size').text();						 	 			 					
						 	 	volume_size = size;						 	
					 	 		return false;
					 	 }
				 });
			}
	});	
	return volume_size;
}

function size_select()
{
	var sleep_array = new Array(
			0,1,2,3,4,5
			);



	var sleep_v_array = new Array(
			0,1,2,3,4,5
			);

			SIZE = 6;
			SIZE2 = 2;
			
			var a = new Array(SIZE);
			
			for(var i=0;i<SIZE;i++)
			{
				a[i] = new Array(SIZE2);
			}



			for(var i = 0; i < SIZE; i++)
				for(var j = 0; j < SIZE2; j++)
				{
					a[i][0] = sleep_array[i];
					a[i][1] = sleep_v_array[i];
				}




			$('#id_size_top_main').empty();
				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"id_size_main\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_size\" rel='1'>1</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_size_li' style='height:160px;'>"
				my_html_options+="<li class=\"li_start\" rel=\""+sleep_v_array[0]+"\"><a href='#'>"+sleep_array[0]+"</a>";
					
				
				for (var i = 1;i<sleep_array.length -1;i++)
				{		
					my_html_options+="<li rel=\""+sleep_v_array[i]+"\"><a href='#'>"+sleep_array[i]+"</a>";		
				}
				var j = sleep_array.length-1;
				my_html_options+="<li class=\"li_end\" rel='"+sleep_v_array[j]+"'><a href='#'>"+sleep_array[sleep_array.length-1]+"</a>";
				my_html_options+="</ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				
			
				
				$("#id_size_top_main").append(my_html_options);	
				
				function oled_table(rel)
				{
					for(var i = 0; i < SIZE; i++)
							for(var j = 0; j < SIZE2; j++)
							{
								a[i][0] = sleep_array[i];
								a[i][1] = sleep_v_array[i];
								if (a[i][1] == rel)
								{									
								 return a[i][0];
								}
							}					
				}
	
}

function unit_select(id)
{
	var sleep_array = new Array(
			"TB","GB"
			);



	var sleep_v_array = new Array(
			0,1
			);

			SIZE = 2;
			SIZE2 = 3;
			
			var a = new Array(SIZE);
			
			for(var i=0;i<SIZE;i++)
			{
				a[i] = new Array(SIZE2);
			}



			for(var i = 0; i < SIZE; i++)
				for(var j = 0; j < SIZE2; j++)
				{
					a[i][0] = sleep_array[i];
					a[i][1] = sleep_v_array[i];
				}




			$('#'+id+'_top_main').empty();
				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\""+id+"_main\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\""+id+"\" rel='1'>GB</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='"+id+"_li'><div>"
				my_html_options+="<li class=\"li_start\" rel=\""+sleep_v_array[0]+"\"><a href='#'>"+sleep_array[0]+"</a>";
					
				
				for (var i = 1;i<sleep_array.length -1;i++)
				{		
					my_html_options+="<li rel=\""+sleep_v_array[i]+"\" ><a href='#'>"+sleep_array[i]+"</a>";		
				}
				var j = sleep_array.length-1;
				my_html_options+="<li class=\"li_end\" rel='"+sleep_v_array[j]+"'><a href='#'>"+sleep_array[sleep_array.length-1]+"</a>";
				my_html_options+="</div></ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				
							
				$("#"+id+"_top_main").append(my_html_options);	
				
				function oled_table(rel)
				{
					for(var i = 0; i < SIZE; i++)
							for(var j = 0; j < SIZE2; j++)
							{
								a[i][0] = sleep_array[i];
								a[i][1] = sleep_v_array[i];
								if (a[i][1] == rel)
								{									
								 return a[i][0];
								}
							}					
				}
	
}
function unit_modify_select(id,unit)
{
	if (unit == "TB")
	{
		var sleep_array = new Array("TB");
		var sleep_v_array = new Array(0);
		SIZE = 1;
		SIZE2 = 1;		
	}
	else
	{			
		var sleep_array = new Array("TB","GB");
		var sleep_v_array = new Array(0,1);
		SIZE = 2;
		SIZE2 = 2;		
	}		
	var a = new Array(SIZE);
	
	for(var i=0;i<SIZE;i++)
	{
		a[i] = new Array(SIZE2);
	}



			for(var i = 0; i < SIZE; i++)
				for(var j = 0; j < SIZE2; j++)
				{
					a[i][0] = sleep_array[i];
					a[i][1] = sleep_v_array[i];
				}




			$('#'+id+'_top_main').empty();								
				var my_html_options="";				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\""+id+"_main\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";				
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\""+id+"\" rel='"+map_table(unit)+"'>"+unit+"</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				
				if (unit == "GB")
				{
					my_html_options+="<ul class='ul_obj' id='"+id+"_li'><div>"
					my_html_options+="<li class=\"li_start\" rel=\""+sleep_v_array[0]+"\" ><a href='#'>"+sleep_array[0]+"</a>";
						
					
					for (var i = 1;i<sleep_array.length -1;i++)
					{		
						my_html_options+="<li rel=\""+sleep_v_array[i]+"\"  ><a href='#'>"+sleep_array[i]+"</a>";		
					}
					var j = sleep_array.length-1;
					my_html_options+="<li class=\"li_end\" rel='"+sleep_v_array[j]+"'><a href='#'>"+sleep_array[sleep_array.length-1]+"</a>";
					my_html_options+="</div></ul>";
				}	
				my_html_options+="</li>";
				my_html_options+="</ul>";
											
				$("#"+id+"_top_main").append(my_html_options);					
				function map_table(rel)
				{
					for(var i = 0; i < SIZE; i++)
							for(var j = 0; j < SIZE2; j++)
							{
								a[i][0] = sleep_array[i];
								a[i][1] = sleep_v_array[i];
								if (a[i][0] == rel)
								{									
								 return a[i][1];
								}
							}					
				}
	
}
function ready_iscsi()
{
	
	do_query_HD_Mapping_Info();
		//port forwarding
	$("#iscsi_tb").flexigrid({				
		url: '/cgi-bin/iscsi_mgr.cgi',		
		dataType: 'xml',
		cmd: 'cgi_get_iscsi',
		colModel : [		
			{display: _T('_common','enable'), name : 'icon', width : 30, sortable : true, align: 'left'},
			{display: _T('_common','enable'), name : 'name', width : 200, sortable : true, align: 'left'},
			{display: _T('_module','status'), name : 'connect', width : 200, sortable : true, align: 'left'},
			{display: _T('_portforwarding','service'), name : 'size', width : 120, sortable : true, align: 'left'}
			//{display: _T('_portforwarding','protocol'), name : 'detail', width : 100, sortable : true, align: 'left'}										
			],
		sortname: "id",
		sortorder: "asc",
		usepager: true,
		useRp: true,
		rp: 100,
		showTableToggleBtn: true,
		width: FLEXIGRID_WIDTH,
		height: 'auto',
		errormsg: _T('_common','connection_error'),
		nomsg: _T('_common','no_items'),		
		resizable:false,
		noSelect:true,
		preProcess:function(r)
		{		
			var num = 0;
			$(r).find('row').each(function(index){
				num = index;
				var connect_num = 0;
				var name = $(this).find('cell').eq(1).text();
				$(this).find('cell').eq(0).text("<img src='/web/images/icon/LightningIcon_iSCSITarget_NORM.png' class='iscsi_icon' border=0 width=24 height=24>");
				
				if ($(this).find('cell').eq(2).text().indexOf("No Initiators connected")!= -1)
				{
					$(this).find('cell').eq(2).text(_T('_iscsi','no_connect'));
					connect_num = 0;
				}		
				else
				{
					connect_num = $(this).find('cell').eq(2).text();
					var str = "<span style='cursor: pointer;' id='storage_iscsiTargetInitiators"+(index+1)+"_link' onclick='open_initiators(\""+name+"\");'>"+connect_num+" "+_T('_iscsi','connect')+"</span>";				
					$(this).find('cell').eq(2).text(str);
				}		
				var j = $(this).find('cell').eq(3).text();
				
				
				var detail ='<div class="list_icon"><div id="storage_iscsiTargetLunMap'+(num+1)+'_link" class="edit TooltipIcon" title="'+_T("_usb_backups", "edit_job")+'" onclick="show_lun_mapping(\''+name+'\',\''+connect_num+'\')"; rel="'+_T("_usb_backups", "edit_job")+'"></div>';
						detail += '<div id="storage_iscsiTargetDelete'+(num+1)+'_link" class="del TooltipIcon" title="'+_T("_usb_backups", "del_job")+'" onclick="delete_iscsi(\''+name+'\')" rel="'+_T("_usb_backups", "del_job")+'"></div>';
						detail += '<div id="storage_iscsiTargetDetail'+(num+1)+'_link" class="detail TooltipIcon" title="'+_T("_usb_backups", "details")+'" onclick="show_detail(\''+j+'\',\''+connect_num+'\')" rel="'+_T("_usb_backups", "details")+'"></div>';
						detail += '</div>';				
				$(this).find('cell').eq(3).text(detail);			
					
			});
						
			if (num >= 5 )
			{				
				$("#iscsi_list_scroll").addClass("scrollbar_iscsi");				
				$(".scrollbar_iscsi").css("height","250px");
			}
			else
			{
				if ($("#iscsi_list_scroll").hasClass("scrollbar_iscsi"))
				{										
					var element = $('.scrollbar_iscsi').jScrollPane({/*params*/});				
					var api = element.data('jsp');				
					api.destroy();					
					$("#iscsi_list_scroll").removeClass("scrollbar_iscsi");					
				}	
			}	
			
			var j = -1;	
			$(r).find('rows').each(function(){			
				if ( $(this).find('cell').text())
				j =0;				
			});
			if (j == -1)
			{
					show('iscsi_list_info');
					hide('iscsi_list_tb')
			}						
			else
			{	
					hide('iscsi_list_info');
					show('iscsi_list_tb')
			}			
			return r;
		},
		onSuccess:function(){
			init_tooltip();
			$(".scrollbar_iscsi").jScrollPane();
		//	timeoutId_iscsi = setTimeout(function(){$(".scrollbar_iscsi").jScrollPane();},1000);
			clearTimeout(timeoutId_iscsi);
			timeoutId = setTimeout('$("#iscsi_tb").flexReload()', 5000);			
      }		      
	});
	
	//get LUN	
		$("#iscsi_lun_tb").flexigrid({				
		url: '/cgi-bin/iscsi_mgr.cgi',		
		dataType: 'xml',
		cmd: 'cgi_get_iscsi_lun',
		colModel : [		
			{display: _T('_common','enable'), name : 'name', width : 400, sortable : true, align: 'left'},
			{display: _T('_common','enable'), name : 'size', width : 150, sortable : true, align: 'left'},
			{display: _T('_portforwarding','protocol'), name : 'snap', width : 100, sortable : true, align: 'left'}			
			],
		sortname: "id",
		sortorder: "asc",
		usepager: true,
		useRp: true,
		rp: 100,
		showTableToggleBtn: true,
		width: FLEXIGRID_WIDTH,
		height: 'auto',
		errormsg: _T('_common','connection_error'),
		nomsg: _T('_common','no_items'),		
		resizable:false,
		noSelect:true,
		preProcess:function(r)
		{		
			var num = 0;
							
			$(r).find('row').each(function(index){							
				var name = $(this).find('cell').eq(0).text();				
				var size = $(this).find('cell').eq(1).text();
				$(this).find('cell').eq(1).text(size2str(size,"GB"));				
				var percent = $(this).find('cell').eq(2).text();				
				var detail = 	'<div class="list_icon"><div id="storage_iscsiLunDetail'+(num+1)+'_link" class="edit TooltipIcon" title="'+_T("_usb_backups", "edit_job")+'" onclick="show_lun_detail(\''+name+'\')" rel="'+_T("_usb_backups", "edit_job")+'"></div>';
						detail += '<div id="storage_iscsiLunDetail'+(num+1)+'_link" class="del TooltipIcon" title="'+_T("_usb_backups", "del_job")+'" onclick="delete_lun(\''+name+'\')" rel="'+_T("_usb_backups", "del_job")+'"></div>';
						detail += '</div>';				
				$(this).find('cell').eq(2).text(detail);				
				num = index;				
			});
			
			if (num >= 5 )
			{				
				$("#iscsi_lun_scroll").addClass("scrollbar_iscsi_lun");
				$(".scrollbar_iscsi_lun").css("height","250px");
			}
			else
			{
				if ($("#iscsi_lun_scroll").hasClass("scrollbar_iscsi_lun"))
				{										
					var element = $('.scrollbar_iscsi_lun').jScrollPane({/*params*/});				
					var api = element.data('jsp');				
					api.destroy();			
					$("#iscsi_lun_scroll").removeClass("scrollbar_iscsi_lun");
					//$(".scrollbar_iscsi_lun").css("height","auto");		
				}	
			}	
			
			var j = -1;	
			$(r).find('rows').each(function(){													
				if ( $(this).find('cell').text())
				 j =0;
				
			});
			if (j == -1)
			{
					show('iscsi_lun_info');
					hide('iscsi_lun_list_tb')
			}						
			else
			{	
					hide('iscsi_lun_info');
					show('iscsi_lun_list_tb')
			}			
			return r;
		},
		onSuccess:function(){			
							init_tooltip();
							$(".scrollbar_iscsi_lun").jScrollPane();
							setTimeout(function(){$(".scrollbar_iscsi_lun").jScrollPane();},1000);		
        }		      
	});

	//get acl
		$("#iscsi_acl_tb").flexigrid({				
		url: '/cgi-bin/iscsi_mgr.cgi',		
		dataType: 'xml',
		cmd: 'cgi_get_acl',
		colModel : [		
			{display: _T('_common','enable'), name : 'icon', width : 140, sortable : true, align: 'left'},
			{display: _T('_common','enable'), name : 'name', width : 300, sortable : true, align: 'left'},		
			{display: _T('_common','enable'), name : 'name', width : 80, sortable : true, align: 'left'}			
			],
		sortname: "id",
		sortorder: "asc",
		usepager: true,
		useRp: true,
		rp: 100,
		showTableToggleBtn: true,
		width: FLEXIGRID_WIDTH,
		height: 'auto',
		errormsg: _T('_common','connection_error'),
		nomsg: _T('_common','no_items'),		
		resizable:false,
		noSelect:true,
		preProcess:function(r)
		{		
			var num = 0;
			$(r).find('row').each(function(index){

				var name = $(this).find('cell').eq(0).text();
				var iqn = $(this).find('cell').eq(1).text();
				
				$(this).find('cell').eq(1).after("<cell></cell>");					

				//var detail = "<div class='list_icon'><div class='s3_detail TooltipIcon' id='storage_iscsiAclDetail"+(index+1)+"_link' title='"+ _T("_usb_backups", "details")+"' href='javascript:show_acl_detail(\""+name+"\",\""+iqn+"\")'></a></div>";	
				if (name == "Default")
					var detail = '<div class="list_icon"><div id="storage_iscsiAclEdit'+(index+1)+'_link" class="edit TooltipIcon" title="'+_T("_usb_backups", "edit_job")+'" onclick="show_acl_detail(\''+name+'\',\''+iqn+'\')" rel="'+_T("_usb_backups", "edit_job")+'"></div><div></div></div>';
				else				
					var detail = '<div class="list_icon"><div id="storage_iscsiAclEdit'+(index+1)+'_link" class="edit TooltipIcon" title="'+_T("_usb_backups", "edit_job")+'" onclick="show_acl_detail(\''+name+'\',\''+iqn+'\')" rel="'+_T("_usb_backups", "edit_job")+'"></div><div id="storage_iscsiAclDel'+(index+1)+'_link" class="del TooltipIcon" title="'+_T("_usb_backups", "del_job")+'" onclick="delete_acl(\''+name+'\',\''+iqn+'\')" rel="'+_T("_usb_backups", "del_job")+'"></div></div>';
										
				$(this).find('cell').eq(2).text(detail)
				num = index;
				if ( $(this).find('cell').text())
				 j =0;
				
			});
			if (num >= 5 )
			{				
				$("#iscsi_acl_scroll").addClass("scrollbar_iscsi_acl");
				$(".scrollbar_iscsi_acl").css("height","250px");
			}
			else
			{
				if ($("#iscsi_acl_scroll").hasClass("scrollbar_iscsi_acl"))
				{										
					var element = $('.scrollbar_iscsi_acl').jScrollPane({/*params*/});				
					var api = element.data('jsp');				
					api.destroy();			
					$("#iscsi_acl_scroll").removeClass("scrollbar_iscsi_acl");
					//$(".scrollbar_iscsi_acl").css("height","auto");		
				}	
			}	
				var j = -1;	
			$(r).find('rows').each(function(){													
				if ( $(this).find('cell').text())
				 j =0;
				
			});
			
			if (j == -1)
			{
					show('iscsi_acl_info');
					hide('iscsi_acl_list_tb')
			}						
			else
			{					
					hide('iscsi_acl_info');
					show('iscsi_acl_list_tb')
			}			
			return r;
		},
		onSuccess:function(){	
			init_tooltip();		
			$(".scrollbar_iscsi_acl").jScrollPane();
							setTimeout(function(){$(".scrollbar_iscsi_acl").jScrollPane();},1000);					
        }		      
	});		
}

var modify_size;
function show_detail(index,iqn_num)
{			
	$("input:text").inputReset();
	$("input:password").inputReset();

	var str = "cmd=cgi_detail&id="+index;
	var name;
	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: false,
						cache: false,
						success: function(xml){	
							
							$(xml).find('rows').each(function(){
									var ip = $(this).find('ip').text();
											name = $(this).find('name').text();
									var iqn = $(this).find('iqn').text();														
									var size = $(this).find('size').text();																		
									var file = $(this).find('file').text();
									var enable = $(this).find('enable').text();
									var chap_enable = $(this).find('chap_enable').text();
									var chap_name = $(this).find('chap_name').text();
									var chap_pwd = $(this).find('chap_pwd').text();
									
									SetChapMode("#ChapMode_detail",chap_enable,'click');		
									if (chap_enable == "1")
									{																			
										$("#storage_iscsiDetailusername_text").val(chap_name);
										$("#storage_iscsiDetailpwd_text").val(chap_pwd);
										$("#storage_iscsiDetailConfirmPwd_text").val(chap_pwd);
									}	
									else
									{
										$("#storage_iscsiDetailusername_text").val("");
										$("#storage_iscsiDetailpwd_text").val("");
										$("#storage_iscsiDetailConfirmPwd_text").val("");
									}	
									setSwitch('#storage_iscsiEnable_switch',enable);
//									$("#storage_iscsiDetailEnable_button").removeClass("i_disable").removeClass("i_enable");
//									if (enable == 1)
//									{
//										$("#storage_iscsiDetailEnable_button").text(_T('_common','disable'))
//										$("#storage_iscsiDetailEnable_button").addClass("i_disable");
//									}	
//									else
//									{	
//										$("#storage_iscsiDetailEnable_button").text(_T('_common','enable'))
//										$("#storage_iscsiDetailEnable_button").addClass("i_enable");
//									}	
										
									document.getElementById("id_iscsi_name").innerHTML = name;
									document.getElementById("id_iscsi_iqn").innerHTML = iqn;
									document.getElementById("id_iscsi_ip").innerHTML = ip;
									var unit = size.substr(size.length-2,2);
									modify_size = size.substr(0,size.length-2);
									$("#f_modify_size").val(modify_size);
									//$("#id_unit_modify").text(unit);
									unit_modify_select("id_unit_modify",unit);
									init_select();
									
									if (unit == "TB")
										modify_size = modify_size*1000;
									
									
													//user select voluem
/*													
									if(file.indexOf(".systemfile")!=-1)																							
									{
										///mnt/HD/HD_a2/
										var v = file.substring(0,14);
										//alert(v);
										
											show('id_detail_location')
											$("#id_iscsi_location").text(chg_path(v));
										//	show('id_detail_size')
											hide('id_detail_img')	
																						
										//	$("#id_iscsi_size").text(size);
									}
									else
*/									
									{
											hide('id_detail_location')
										//	hide('id_detail_size')
											show('id_detail_img')	
											$("#id_iscsi_img").html(chg_path(file));											
											get_iscsi_volume_size($("#id_iscsi_img").text().substring(0,8))		
											//modify_size->G
											var byte_size = modify_size*1000*1000*1000;											
											size2str(parseInt($("#id_volume_size_byte").text(),10)+byte_size)											
											$("#id_volume_detail_size_byte").text(size2str(parseInt($("#id_volume_size_byte").text(),10)+byte_size));
									}	
									if (iqn_num >= 1)
									{
										$("#id_iscsi_enable").addClass("gray_out").css("top","15px");
										$("#storage_iscsiDetailDelete_button").addClass("gray_out").css("top","15px");
										$("#storage_iscsiDetailSave_button").addClass("gray_out").css("top","15px");
									}
									else
									{
										$("#id_iscsi_enable").removeClass("gray_out").css("top","15px");
										$("#storage_iscsiDetailDelete_button").removeClass("gray_out").css("top","15px");
										$("#storage_iscsiDetailSave_button").removeClass("gray_out").css("top","15px");
									}	
																
								});							
					
							}  
					});	
			
		$("input:text").inputReset();		
		$("#iscsiDetailDiag.WDLabelDiag").css("top","20px").css("margin-top","50px"); 					
		var obj=$("#iscsiDetailDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
		obj.load();		
		$("#iscsiDetailDiag_title").html(name+" "+_T('_p2p','detail'));								
		init_button();			
		language();													
}
function open_initiators(name)
{	
	var str = "cmd=cgi_get_initiators&name="+name;
	
	wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:str,
		dataType: "xml",	
		success:function(xml){									
				var str = "<ul class='device_active' style='margin-left:-30px;'>"
				$(xml).find('root').each(function(){
					 	 var ini = $(this).find('ini').text();
					 	 
					 	 str = str+"<li>"
					 	 str = str+"<div>&nbsp;&nbsp;"+ ini+"</div>"					 	 
					 	 str = str+"</li>"
					 	 
				 });
			str = str+"</ul>"
				document.getElementById("id_ini_list").innerHTML  = str
				//alert(str);
				//$('#scrollbar1').tinyscrollbar({ sizethumb: 20 });									
				
			}
	});	
	
		$("#iscsiInitiatorsDiag_title").html(name+" "+_T('_iscsi','initi_title'));
	
		var obj=$("#iscsiInitiatorsDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
		obj.load();
		_DIALOG = obj;	
		language();
		
		setTimeout(function(){
		$(".scrollbar_iscsi_dialog").jScrollPane();	
		},200);
	
}
function open_diag()
{
		if ($("#iscsi_list_tb tbody:eq(1) tr").length >= MAX_ISCSI){jAlert(_T('_iscsi','msg3'), _T('_common','error')); return;}
		//adjust_dialog_size("#iscsiDiag","550","");	
		var obj=$("#iscsiDiag").overlay({fixed:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});				
		obj.load();
		$("#iscsiDiag").center();				
		$("input:text").inputReset();	
		$("input:password").inputReset();
		_DIALOG = obj;
		init_button();	
		volume_select();
		volume_target_lun_select();
		size_select();
		unit_select("id_unit");	
		unit_select("id_unit_target_lun");		
		init_select();		
		hide_select();
		//SetChapMode('#ChapMode','0','click')
		SetChapMode("#ChapMode",'0','click');		
		language();
		init_iscsi_dialog();
		$("#iscsi_step2").hide();
		$("#iscsi_step3").hide();
		$("#iscsi_step1").show();				
		$("#storage_iscsiTargetAlias_text").val("");		
		$("#storage_iscsiTargetSize_text").val("");
//		$("#id_set_img").val("");
		$("#storage_iscsiTargetUsername_text").val("");
		$("#storage_iscsiTargetPwd_text").val("");
		$("#storage_iscsiTargetConfirmPwd_text").val("");
		
		$("#storage_iscsiTargetLunName_text").val("");
		$("#storage_iscsiTargetSize_text").val("");
		setSwitch('#storage_iscsiTargetPreAllocate_switch',0);
		
		$("#storage_iscsiTargetNext1_button").hide();	
		$("#storage_iscsiTargetSave1_button").show();
		cancel_img_file();
		SetMapping('#i_lun_mapping','1',"");		
							
}
function chk_name()
{
		var alias = $("#storage_iscsiTargetAlias_text").val();
		if (alias.substr(0,9) == "snapshots")
		{
			jAlert(_T('_iscsi','msg16'), _T('_common','error'));
			return 1;
		}
		if (alias == "")
		{			
			jAlert(_T('_iscsi','msg9'), _T('_common','error'));
			return 1;
		}
		var mt = alias.charAt(0).match(/[^\sa-zA-Z0-9]/);
		if (mt)
		{
			//var msg = 'The first character allow characters : "a-z" , "A-Z" , "0-9"'					
			jAlert(_T('_iscsi','msg1'), _T('_common','error'));
			$("#storage_iscsiTargetAlias_text").select();
			$("#storage_iscsiTargetAlias_text").focus();		
			return 1;
		}				
		var mt = alias.match(/[^\sa-zA-Z0-9:.-]/);
		if (mt)
		{
		//	var msg = 'The Target name allow characters : "a-z" , "A-Z" , "0-9" , "-" , "." and ":"'					
			jAlert(_T('_iscsi','msg2'), _T('_common','error'));
			$("#storage_iscsiTargetAlias_text").select();
			$("#storage_iscsiTargetAlias_text").focus();		
			return 1;
		}				
		if (alias.indexOf(" ") != -1)
	 	{	 		
			jAlert(_T('_iscsi','msg2'), _T('_common','error'));
			$("#storage_iscsiTargetAlias_text").select();
			$("#storage_iscsiTargetAlias_text").focus();		
			return 1;
	 	}		
	 	//limit small
	 	for(var t = 0;t<alias.length;t++)
	 	{	
	 		if((alias.charCodeAt(t)>=65)&&(alias.charCodeAt(t)<=90))
	 		{
	 			jAlert(_T('_iscsi','msg14'), _T('_common','error'));
				$("#storage_iscsiTargetAlias_text").select();
				$("#storage_iscsiTargetAlias_text").focus();		
	 			return 1;
	 		}
	 	}
	 	
	 	var error = 0;	 	
 		$('#iscsi_tb > tbody > tr').each(function (index) {
			var j = $('#iscsi_tb > tbody > tr:eq(' + index + ') >  td:eq(1)').text();
			if (j == alias)
			{
				jAlert(_T('_iscsi','msg4'), _T('_common','error'));
				error = 1;
				return false;
			}
		});	 		 	
		if (error == 1)
			return 1;
			
			
//		if(isNaN($("#storage_iscsiTargetSize_text").val()) || $("#storage_iscsiTargetSize_text").val().indexOf(".")!= -1 || parseInt($("#storage_iscsiTargetSize_text").val(),10)<=0)
//		{
//			jAlert(_T('_ip','msg3'), _T('_common','error'),"",function(){$("#storage_iscsiTargetSize_text").focus()});
//			return 1;
//		}			
//		var unit = $("#id_unit").text();
//		var size = $("#storage_iscsiTargetSize_text").val();				
//		if (size >= 1000)
//		{
//			jAlert(_T('_iscsi','msg22'), _T('_common','error'));
//			return 1;
//		}			
//		if (unit == "TB")
//		{
//			size = size*1000
//		}
//		if (size == "")
//		{
//			jAlert(_T('_iscsi','msg12'), _T('_common','error'),"",function(){$("#storage_iscsiTargetSize_text").focus()});
//			return 1;
//		}
//		if (size > 8*1000)
//		{
//			jAlert(_T('_iscsi','msg8'), _T('_common','error'),"",function(){$("#storage_iscsiTargetSize_text").focus()});
//			return 1;
//		}						
//		if (size*1000*1000*1000 > $("#id_volume_size_byte").text())
//		{
//				jAlert(_T('_iscsi','msg11')+$("#id_volume_size").text(), _T('_common','error'),"",function(){$("#storage_iscsiTargetSize_text").focus()});
//				return 1;
//		}															
		return 0;
}
function chk_name_bylun()
{
		var alias = $("#storage_iscsiLunAlias_text").val();
		if (alias.substr(0,9) == "snapshots")
		{
			jAlert(_T('_iscsi','msg16'), _T('_common','error'));
			return 1;
		}
		if (alias == "")
		{			
			jAlert(_T('_iscsi','msg9'), _T('_common','error'));
			return 1;
		}
		var mt = alias.charAt(0).match(/[^\sa-zA-Z0-9]/);
		if (mt)
		{
			//var msg = 'The first character allow characters : "a-z" , "A-Z" , "0-9"'					
			jAlert(_T('_iscsi','msg1'), _T('_common','error'));
			$("#storage_iscsiTargetAlias_text").select();
			$("#storage_iscsiTargetAlias_text").focus();		
			return 1;
		}				
		var mt = alias.match(/[^\sa-zA-Z0-9:.-]/);
		if (mt)
		{
		//	var msg = 'The Target name allow characters : "a-z" , "A-Z" , "0-9" , "-" , "." and ":"'					
			jAlert(_T('_iscsi','msg2'), _T('_common','error'));
			$("#storage_iscsiTargetAlias_text").select();
			$("#storage_iscsiTargetAlias_text").focus();		
			return 1;
		}				
		if (alias.indexOf(" ") != -1)
	 	{	 		
			jAlert(_T('_iscsi','msg2'), _T('_common','error'));
			$("#storage_iscsiTargetAlias_text").select();
			$("#storage_iscsiTargetAlias_text").focus();		
			return 1;
	 	}		
	 	//limit small
	 	for(var t = 0;t<alias.length;t++)
	 	{	
	 		if((alias.charCodeAt(t)>=65)&&(alias.charCodeAt(t)<=90))
	 		{
	 			jAlert(_T('_iscsi','msg14'), _T('_common','error'));
				$("#storage_iscsiTargetAlias_text").select();
				$("#storage_iscsiTargetAlias_text").focus();		
	 			return 1;
	 		}
	 	}
	 	
	 	var error = 0;	 	
 		$('#iscsi_tb > tbody > tr').each(function (index) {
			var j = $('#iscsi_tb > tbody > tr:eq(' + index + ') >  td:eq(1)').text();
			if (j == alias)
			{
				jAlert(_T('_iscsi','msg4'), _T('_common','error'));
				error = 1;
				return false;
			}
		});	 		 	
		if (error == 1)
			return 1;					
		return 0;
}
function chk_lun_name()
{
		var alias = $("#storage_iscsiLunName_text").val();
		if (alias.substr(0,5) == "shap-")
		{
			jAlert(_T('_iscsi','msg17'), _T('_common','error'));
			return 1;
		}
		if (alias == "")
		{			
			jAlert(_T('_iscsi','msg20'), _T('_common','error'));
			return 1;
		}
		var mt = alias.charAt(0).match(/[^\sa-zA-Z0-9]/);
		if (mt)
		{
			//var msg = 'The first character allow characters : "a-z" , "A-Z" , "0-9"'					
			jAlert(_T('_iscsi','msg1'), _T('_common','error'));
			$("#storage_iscsiTargetAlias_text").select();
			$("#storage_iscsiTargetAlias_text").focus();		
			return 1;
		}				
		var mt = alias.match(/[^\sa-zA-Z0-9:.-]/);
		if (mt)
		{
		//	var msg = 'The Target name allow characters : "a-z" , "A-Z" , "0-9" , "-" , "." and ":"'					
			jAlert(_T('_iscsi','msg2'), _T('_common','error'));
			$("#storage_iscsiTargetAlias_text").select();
			$("#storage_iscsiTargetAlias_text").focus();		
			return 1;
		}				
		if (alias.indexOf(" ") != -1)
	 	{	 		
			jAlert(_T('_iscsi','msg2'), _T('_common','error'));
			$("#storage_iscsiTargetAlias_text").select();
			$("#storage_iscsiTargetAlias_text").focus();		
			return 1;
	 	}		
	 	//limit small
	 	for(var t = 0;t<alias.length;t++)
	 	{	
	 		if((alias.charCodeAt(t)>=65)&&(alias.charCodeAt(t)<=90))
	 		{
	 			jAlert(_T('_iscsi','msg14'), _T('_common','error'));
				$("#storage_iscsiTargetAlias_text").select();
				$("#storage_iscsiTargetAlias_text").focus();		
	 			return 1;
	 		}
	 	}
	 	
	 	var error = 0;	 	
 		$('#iscsi_lun_tb > tbody > tr').each(function (index) {
			var j = $('#iscsi_lun_tb > tbody > tr:eq(' + index + ') >  td:eq(0)').text();
			if (j == alias)
			{
				jAlert(_T('_iscsi','msg4'), _T('_common','error'));
				error = 1;
				return false;
			}
		});	 		 	
		if (error == 1)
			return 1;
				
		if(isNaN($("#storage_iscsiLunSize_text").val()) || $("#storage_iscsiLunSize_text").val().indexOf(".")!= -1 || parseInt($("#storage_iscsiLunSize_text").val(),10)<=0)
		{
			$("#storage_iscsiLunSize_text").focus();		
			jAlert(_T('_ip','msg3'), _T('_common','error'));
			return 1;
		}
		var unit = $("#id_unit_lun").text();
		var size = $("#storage_iscsiLunSize_text").val();	
		
		if (size >= 1000)
		{
			jAlert(_T('_iscsi','msg22'), _T('_common','error'));
			return 1;
		}			
		if (unit == "TB")
		{
			size = size*1000
		}
		if (size == "")
		{
			jAlert(_T('_iscsi','msg12'), _T('_common','error'));
			return 1;
		}
		if (size > 8*1000)
		{
			jAlert(_T('_iscsi','msg8'), _T('_common','error'));
			return 1;
		}						
		if (size*1000*1000*1000 > $("#id_volume_lun_size_byte").text())
		{
				jAlert(_T('_iscsi','msg11')+$("#id_volume_lun_size").text(), _T('_common','error'));
				return 1;
		}								
			
	return 0;		
}
function chk_target_lun_name()
{
		var alias = $("#storage_iscsiTargetLunName_text").val();
		if (alias.substr(0,5) == "shap-")
		{
			jAlert(_T('_iscsi','msg17'), _T('_common','error'));
			return 1;
		}
		if (alias == "")
		{			
			jAlert(_T('_iscsi','msg20'), _T('_common','error'));
			return 1;
		}
		var mt = alias.charAt(0).match(/[^\sa-zA-Z0-9]/);
		if (mt)
		{
			//var msg = 'The first character allow characters : "a-z" , "A-Z" , "0-9"'					
			jAlert(_T('_iscsi','msg1'), _T('_common','error'));
			$("#storage_iscsiTargetAlias_text").select();
			$("#storage_iscsiTargetAlias_text").focus();		
			return 1;
		}				
		var mt = alias.match(/[^\sa-zA-Z0-9:.-]/);
		if (mt)
		{
		//	var msg = 'The Target name allow characters : "a-z" , "A-Z" , "0-9" , "-" , "." and ":"'					
			jAlert(_T('_iscsi','msg2'), _T('_common','error'));
			$("#storage_iscsiTargetAlias_text").select();
			$("#storage_iscsiTargetAlias_text").focus();		
			return 1;
		}				
		if (alias.indexOf(" ") != -1)
	 	{	 		
			jAlert(_T('_iscsi','msg2'), _T('_common','error'));
			$("#storage_iscsiTargetAlias_text").select();
			$("#storage_iscsiTargetAlias_text").focus();		
			return 1;
	 	}		
	 	//limit small
	 	for(var t = 0;t<alias.length;t++)
	 	{	
	 		if((alias.charCodeAt(t)>=65)&&(alias.charCodeAt(t)<=90))
	 		{
	 			jAlert(_T('_iscsi','msg14'), _T('_common','error'));
				$("#storage_iscsiTargetAlias_text").select();
				$("#storage_iscsiTargetAlias_text").focus();		
	 			return 1;
	 		}
	 	}
	 	
	 	var error = 0;	 	
 		$('#iscsi_lun_tb > tbody > tr').each(function (index) {
			var j = $('#iscsi_lun_tb > tbody > tr:eq(' + index + ') >  td:eq(0)').text();
			if (j == alias)
			{
				jAlert(_T('_iscsi','msg4'), _T('_common','error'));
				error = 1;
				return false;
			}
		});	 		 	
		if (error == 1)
			return 1;
				
		if(isNaN($("#storage_iscsiTargetSize_text").val()) || $("#storage_iscsiTargetSize_text").val().indexOf(".")!= -1 || parseInt($("#storage_iscsiTargetSize_text").val(),10)<=0)
		{
			$("#storage_iscsiTargetSize_text").focus();		
			jAlert(_T('_ip','msg3'), _T('_common','error'));
			return 1;
		}
		var unit = $("#id_unit_target_lun").text();
		var size = $("#storage_iscsiTargetSize_text").val();	
		if (unit == "TB")
		{
			size = size*1000
		}
		if (size == "")
		{
			jAlert(_T('_iscsi','msg12'), _T('_common','error'));
			return 1;
		}
		if (size > 8*1000)
		{
			jAlert(_T('_iscsi','msg8'), _T('_common','error'));
			return 1;
		}						
		if (size*1000*1000*1000 > $("#id_volume_lun_size_byte").text())
		{																				
				jAlert(_T('_iscsi','msg11')+$("#id_volume_target_lun_size").text(), _T('_common','error'));
				return 1;
		}								
			
	return 0;		
}
function chk_acl_name()
{
		var alias = $("#storage_iscsiAclName_text").val();
		var iqn = $("#storage_iscsiAclIqn_text").val();	
		
		if (alias == "")
		{			
			jAlert(_T('_iscsi','msg19'), _T('_common','error'));
			return 1;
		}
		var mt = alias.charAt(0).match(/[^\sa-zA-Z0-9]/);
		if (mt)
		{
			//var msg = 'The first character allow characters : "a-z" , "A-Z" , "0-9"'					
			jAlert(_T('_iscsi','msg1'), _T('_common','error'));
			$("#storage_iscsiTargetAlias_text").select();
			$("#storage_iscsiTargetAlias_text").focus();		
			return 1;
		}				
		var mt = alias.match(/[^\sa-zA-Z0-9:.-]/);
		if (mt)
		{
		//	var msg = 'The Target name allow characters : "a-z" , "A-Z" , "0-9" , "-" , "." and ":"'					
			jAlert(_T('_iscsi','msg2'), _T('_common','error'));
			$("#storage_iscsiTargetAlias_text").select();
			$("#storage_iscsiTargetAlias_text").focus();		
			return 1;
		}				
		if (alias.indexOf(" ") != -1)
	 	{	 		
			jAlert(_T('_iscsi','msg2'), _T('_common','error'));
			$("#storage_iscsiTargetAlias_text").select();
			$("#storage_iscsiTargetAlias_text").focus();		
			return 1;
	 	}		
	 	//limit small
	 	for(var t = 0;t<alias.length;t++)
	 	{	
	 		if((alias.charCodeAt(t)>=65)&&(alias.charCodeAt(t)<=90))
	 		{
	 			jAlert(_T('_iscsi','msg14'), _T('_common','error'));
				$("#storage_iscsiTargetAlias_text").select();
				$("#storage_iscsiTargetAlias_text").focus();		
	 			return 1;
	 		}
	 	}
	 	if (iqn == "")
		{			
			jAlert(_T('_iscsi','msg18'), _T('_common','error'));
			return 1;
		}
		var mt = iqn.match(/[^\sa-z0-9:.-]/);
		if (mt)
		{
		//	var msg = 'The IQN allow characters : "a-z" , "0-9" , "-" , "." and ":"'					
			jAlert(_T('_iscsi','msg22'), _T('_common','error'));
			$("#storage_iscsiTargetAlias_text").select();
			$("#storage_iscsiTargetAlias_text").focus();		
			return 1;
		}				
	 	var error = 0;	 	
 		$('#iscsi_acl_tb > tbody > tr').each(function (index) {
			var j = $('#iscsi_acl_tb > tbody > tr:eq(' + index + ') >  td:eq(0)').text();
			if (j == alias)
			{
				jAlert(_T('_iscsi','msg4'), _T('_common','error'));
				error = 1;
				return false;
			}
		});	 		 	
		if (error == 1)
			return 1;
				
		return 0;
}
function clear_path()
{
	$("#s3_tree").val("")
}
function create_iscsi_chk_chap()
{
	var security = $("#ChapMode").attr('rel');
	var username = $("#storage_iscsiTargetUsername_text").val();
	var password = $("#storage_iscsiTargetPwd_text").val();
	var password2 = $("#storage_iscsiTargetConfirmPwd_text").val();
	if (security == 1)
	{				
		if (name_check(username) == 1)
		{			
			jAlert(_T('_iscsi','msg5'), _T('_common','error'));
			return 1;
		}			
		if ( password.length < 12)
		{			
			jAlert(_T('_iscsi','msg6'), _T('_common','error'));		
			return 1;
		}
		
		if(name_check(password)==1)
		{
			jAlert(_T('_iscsi','msg7'), _T('_common','error'));			
			return 1;
		}
		if (password != password2)
		{
			jAlert(_T('_wizard','msg1'), _T('_common','error'));			
			return 1;
		}
	}
	return 0;
}
function create_iscsi_chk_chap_bylun()
{
	var security = $("#ChapMode_lun").attr('rel');
	var username = $("#storage_iscsiLunUsername_text").val();
	var password = $("#storage_iscsiLunPwd_text").val();
	var password2 = $("#storage_iscsiLunConfirmPwd_text").val();
	if (security == 1)
	{				
		if (name_check(username) == 1)
		{			
			jAlert(_T('_iscsi','msg5'), _T('_common','error'));
			return 1;
		}			
		if ( password.length < 12)
		{			
			jAlert(_T('_iscsi','msg6'), _T('_common','error'));		
			return 1;
		}
		
		if(name_check(password)==1)
		{
			jAlert(_T('_iscsi','msg7'), _T('_common','error'));			
			return 1;
		}
		if (password != password2)
		{
			jAlert(_T('_wizard','msg1'), _T('_common','error'));			
			return 1;
		}
	}
	return 0;
}
function create_iscsi()
{				
	var alias = $("#storage_iscsiTargetAlias_text").val();
	var security = $("#ChapMode").attr('rel');
	var username = $("#storage_iscsiTargetUsername_text").val();
	var password = $("#storage_iscsiTargetPwd_text").val();
	var password2 = $("#storage_iscsiTargetConfirmPwd_text").val();

	var str = "alias="+alias;
	str+="&security="+security;
	str+="&username="+username;
	str+="&password="+password;
	str+="&method="+$("#i_lun_mapping").attr('rel');
	
	if (chk_name() != 0 )	 return;		
	if (create_iscsi_chk_chap() == 1) return;	
		
	//lun none
	if ($("#i_lun_mapping").attr('rel') == 1)
	{
	}
	else if ($("#i_lun_mapping").attr('rel') == 2)
	{
		//create lun mapping
		if (chk_target_lun_name() == 1) return;
		var lun_name = $("#storage_iscsiTargetLunName_text").val();											 
		var allocate = getSwitch('#storage_iscsiTargetPreAllocate_switch');
		var volume_location = $("#id_volume_target_lun").text();
		var size = $("#storage_iscsiTargetSize_text").val();
		var unit = $("#id_unit_target_lun").text();
						
		//check size
		if (unit == "TB")
		{
			size = size*1000
		}
		if (size > 8*1000)
		{
			jAlert(_T('_iscsi','msg8'), _T('_common','error'));
			return 1;
		}
		//check volume
		do_query_HD_Mapping_Info();
		volume_location = volume_location.replace(/&nbsp;/g, ' ');
		volume_location = volume_location.replace(/&amp;/g, '&');
		
		
		str+="&lun_name="+lun_name;
		str+="&lun_allocate="+allocate;
		str+="&lun_volume="+encodeURIComponent(volume_location);
		str+="&lun_size="+size;
		str+="&lun_unit="+unit;
	}
	else		
	{		
		var lun_mapping = ""
		var num=0;
				$('#id_lun_mapping_tb ul li').each(function(index){			
					if($("#id_lun_mapping_tb ul li:eq("+index+") div:eq(0) input ").prop('checked'))
					{
						var v = $("#id_lun_mapping_tb ul li:eq("+index+") div:eq(1)").text();
						if (num != 0 )
							lun_mapping = lun_mapping+","+v;
						else
						{		
							lun_mapping = v;
							num++;
						}	
					}
				});		
				
		str+="&lun_mapping="+lun_mapping;							
	}
	
	//alert(str);
	//return;
		

	var str = "cmd=cgi_add_iscsi&"+str;
	stop_web_timeout(true);
	jLoading(_T('_common','set') ,'loading' ,'s',""); 
		


	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: false,
						cache: false,
						success: function(data){	
							restart_web_timeout();	
							jLoadingClose();					
							if (data == "exist")
							{
								jAlert("The target is exist.", 'warning')
							}
							else
							{	
								var Diag_obj=$("#iscsiDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});							
								Diag_obj.close();								
								$("#iscsi_tb").flexReload()
								$("#iscsi_lun_tb").flexReload()
							}								
						}  
				});	
}
function create_lun()
{
	var lun_name = $("#storage_iscsiLunName_text").val();
	var allocate = getSwitch('#storage_iscsiLunPreAllocate_switch');			
	var volume_location = $("#id_volume_lun").text();
	var size = $("#storage_iscsiLunSize_text").val();
	var unit = $("#id_unit_lun").text();
	
	if (chk_lun_name() != 0 )	 return;	
	
	//check size
	if (unit == "TB")
	{
		size = size*1000
	}
	if (size > 8*1000)
	{
		jAlert(_T('_iscsi','msg8'), _T('_common','error'));
		return 1;
	}
	//check volume
	do_query_HD_Mapping_Info();
	volume_location = volume_location.replace(/&nbsp;/g, ' ');
	volume_location = volume_location.replace(/&amp;/g, '&');
	
	var method = $("#i_target_mapping").attr('rel');
	
	var str = "cmd=cgi_add_lun";
	str += "&lun_name="+lun_name;
	str += "&allocate="+allocate;
	str += "&volume_location="+volume_location;
	str += "&size="+size;
	str += "&method="+method;
		
	
	if (method == 1)
	{
	}
	else if (method == 2)
	{
		//create
		var target_name = $("#storage_iscsiLunAlias_text").val();
		var security = $("#ChapMode_lun").attr('rel');
		var username = $("#storage_iscsiLunUsername_text").val();
		var password = $("#storage_iscsiLunPwd_text").val();
				
		str += "&target_name="+target_name;
		str += "&security="+security;
		str += "&username="+username;
		str += "&password="+password;
		
		if (chk_name_bylun() != 0 )	 return;		
		if (create_iscsi_chk_chap_bylun() == 1) return;	
		
				
	}	
	else if (method == 3)
	{
				var mapping = ""
				var num = 0;
				$('#id_target_mapping_tb ul li').each(function(index){			
					if($("#id_target_mapping_tb ul li:eq("+index+") div:eq(0) input ").prop('checked'))
					{
						var v = $("#id_target_mapping_tb ul li:eq("+index+") div:eq(1)").text();
						//alert(v);
						var t = v.split(":");
						if (num != 0 )
							mapping = mapping+","+t[2];
						else	
						{	
							mapping = t[2];
							num++;
						}	
					}
				});		
				
		str+="&target_mapping="+mapping;		
	}
	
	stop_web_timeout(true);
	jLoading(_T('_common','set') ,'loading' ,'s',""); 
	
	wd_ajax({			
			type: "POST",
			url: "/cgi-bin/iscsi_mgr.cgi",
			data:str,
			async: false,
			cache: false,
			success: function(data){	
					restart_web_timeout();	
					jLoadingClose();					
					if (data == "exist")
					{
						jAlert(_T('_iscsi','msg4'), 'warning')
					}
					else
					{	
						var Diag_obj=$("#iscsiLunDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});							
						Diag_obj.close();								
						$("#iscsi_lun_tb").flexReload()
					}	
				}  
		});	
}
function create_acl()
{
	var acl_name = $("#storage_iscsiAclName_text").val();
	var iqn = $("#storage_iscsiAclIqn_text").val();	
	var lun = "";
	var access = "";	
	if (chk_acl_name()!= 0) return;
				$('#id_acl_create ul li').each(function(index){			
			
						var v = $("#id_acl_create ul li:eq("+index+") div:eq(0)").text();
						var t = $("#id_acl_create ul li:eq("+index+") div:eq(2)").text();
						if (t == _T('_network_access','read_write'))
							t = "RW"
						else if (t == _T('_network_access','read_only'))
						{
							t = "RO"
						}	
						else if (t == _T('_network_access','decline'))
						{
							t = "DENY"
						}	
							
						if (index != 0 )
						{
							lun = lun+","+v;
							access = access+","+t;
						}	
						else	
						{	
							lun = lun+v;
							access = access+t;
						}	
					
				});		
				
	var str = "cmd=cgi_add_acl";
	str += "&acl_name="+acl_name;			
	str += "&iqn="+iqn;
	str += "&lun_mapping="+lun;
	str += "&lun_access="+access;
	//alert(str);

	jLoading(_T('_common','set') ,'loading' ,'s',""); 
	
	wd_ajax({			
			type: "POST",
			url: "/cgi-bin/iscsi_mgr.cgi",
			data:str,
			async: false,
			cache: false,
			success: function(data){						
					jLoadingClose();					
					
					var Diag_obj=$("#iscsiAclDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});							
					Diag_obj.close();								
					$("#iscsi_acl_tb").flexReload()						
				}  
		});	
	
}
function modify_iscsi()
{	
	if ($("#storage_iscsiDetailSave_button").hasClass("gray_out")) return;
	var alias = $("#id_iscsi_name").text();	
	var security = $("#ChapMode_detail").attr('rel');;
	var username = $("#storage_iscsiDetailusername_text").val();;
	var password = $("#storage_iscsiDetailpwd_text").val();
	var enable = getSwitch('#storage_iscsiEnable_switch');
			
	if (security == 1)
	{
		if (name_check($("#storage_iscsiDetailusername_text").val()) == 1)
		{			
			jAlert(_T('_iscsi','msg5'), _T('_common','error'));
			return 1;
		}	
		if ( $("#storage_iscsiDetailpwd_text").val().length < 12)
		{
			jAlert(_T('_iscsi','msg6'), _T('_common','error'));
			$("#storage_iscsiDetailpwd_text").select();
			$("#storage_iscsiDetailpwd_text").focus();
			return 1;
		}	
		if(name_check($("#storage_iscsiDetailpwd_text").val())==1)
		{
			jAlert(_T('_iscsi','msg7'), _T('_common','error'));
			$("#storage_iscsiDetailpwd_text").select();
			$("#storage_iscsiDetailpwd_text").focus();
			return 1;
		}
		if ( $("#storage_iscsiDetailpwd_text").val() != $("#storage_iscsiDetailConfirmPwd_text").val())
		{
			jAlert(_T('_wizard','msg1'), _T('_common','error'));			
			return 1;
		}
	}	
	
		
	var str = "alias="+alias;
	//str+=",iqn="+iqn;
	str+="&security="+security;
	str+="&username="+username;
	//str+=",unit="+unit;
	str+="&password="+password;
	str+="&enable="+enable;
	
	//alert(str);
	//return;
	
	
	
	jLoading(_T('_common','set') ,'loading' ,'s',"");
	stop_web_timeout(true);
	var str = "cmd=cgi_modify_iscsi&"+str;
	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: false,
						cache: false,
						success: function(data){
									jLoadingClose();	
									restart_web_timeout();					
									if (data == "error")
									{
										jAlert("The target modify fail.", 'warning')
									}
									else
									{	
										var Diag_obj=$("#iscsiDetailDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
										Diag_obj.close();						
										clearTimeout(timeoutId_iscsi);		
										$("#iscsi_tb").flexReload();
									}													
							}  
					});	
}
function modify_lun()
{
	var lun_name = $("#f_lun_name_edit").val();											 
	var unit = $("#id_unit_lun_edit").text();
	var size = $("#storage_iscsiLunDetailSize_text").val();
	if(isNaN(size) || size.indexOf(".")!= -1 || parseInt(size,10)<=0 )
	{
		$("#storage_iscsiLunDetailSize_text").focus();		
		jAlert(_T('_ip','msg3'), _T('_common','error'));
		return;
	}
	if (size >= 1000)
	{
		jAlert(_T('_iscsi','msg22'), _T('_common','error'));
		return;
	}
	if (unit == "TB")
	{
		size = size*1000
	}
	if (parseInt(size,10) < parseInt(modify_size,10))
	{
		jAlert(_T('_iscsi','msg10'), _T('_common','error'));
		return;
	}
	var k = (parseInt($("#id_lun_edit_size_byte").text(),10)+parseInt(modify_size,10)*1000*1000*1000);
	if (size*1000*1000*1000 > k)
	{
			jAlert(_T('_iscsi','msg11')+$("#id_lun_edit_size_byte").text(), _T('_common','error'));
			return;
	}											
	
	
		
	var str = "lun_name="+lun_name;	
	str+="&size="+size;
	
//alert(str);	
	jLoading(_T('_common','set') ,'loading' ,'s',"");
	stop_web_timeout(true);
	var str = "cmd=cgi_modify_lun&"+str;
	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: false,
						cache: false,
						success: function(data){
									jLoadingClose();	
									restart_web_timeout();					
									if (data == "error")
									{
										jAlert("The target modify fail.", 'warning')
									}
									else
									{	
										var Diag_obj=$("#iscsiLUNDetailDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});							
										Diag_obj.close();								
										$("#iscsi_lun_tb").flexReload()
									}													
							}  
					});	
}
function delete_iscsi(name)
{             			        			
  var str = "cmd=cgi_del_iscsi&del_file=1&alias="+name;
	jLoading(_T('_common','set') ,'loading' ,'s',""); 
	stop_web_timeout(true);
	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: true,
						cache: false,
						success: function(data){
								jLoadingClose();
								clearTimeout(timeoutId_iscsi);
								$("#iscsi_tb").flexReload()								
								restart_web_timeout();
						}  
				});	

}
//function on_off_iscsi()
//{
//		if ($("#storage_iscsiDetailEnable_button").hasClass("gray_out")) return;		
//		if ($("#storage_iscsiDetailEnable_button").hasClass("i_enable"))
//			enable_iscsi();
//		else
//			disable_iscsi();				
//}
//
//function disable_iscsi()
//{
//	var str = "cmd=cgi_disable_iscsi&alias="+$("#id_iscsi_name").text();
//	//alert(str);
//	//return;
//	wd_ajax({			
//						type: "POST",
//						url: "/cgi-bin/iscsi_mgr.cgi",
//						data:str,
//						async: false,
//						cache: false,
//						success: function(data){																
//								var Diag_obj=$("#iscsiDetailDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});							
//								Diag_obj.close();								
//								//$("#iscsi_tb").flexReload()								
//						}  
//				});	
//}
//function enable_iscsi()
//{
//	var str = "cmd=cgi_enable_iscsi&alias="+$("#id_iscsi_name").text();
//	//alert(str);
//	//return;
//	wd_ajax({			
//						type: "POST",
//						url: "/cgi-bin/iscsi_mgr.cgi",
//						data:str,
//						async: false,
//						cache: false,
//						success: function(data){																
//								var Diag_obj=$("#iscsiDetailDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});							
//								Diag_obj.close();								
//								//$("#iscsi_tb").flexReload()								
//						}  
//				});	
//}
function SetChapMode(obj,val,ftype)
{	
	$(obj).attr('rel',val);	//init rel value
		
	if (obj == "#ChapMode")
	{
		if (val ==1)
		{
			show('id_b_username');
			show('id_b_pwd');
			show('id_confirm_b_pwd')
		}
		else if (val ==0)
		{
			hide('id_b_username');
			hide('id_b_pwd');
			hide('id_confirm_b_pwd')
		}
	}	
	else if (obj == "#ChapMode_detail")
	{		
		if (val ==1)
		{
			show('id_detail_username');
			show('id_detail_pwd');
			show('id_detail_confirm_pwd');
		}
		else if (val ==0)
		{
			hide('id_detail_username');
			hide('id_detail_pwd');
			hide('id_detail_confirm_pwd');
		}
	}	
	else if (obj == "#ChapMode_lun")
	{		
		if (val ==1)
		{
			show('id_lun_username');
			show('id_lun_pwd');
			show('id_lun_confirm_pwd');
		}
		else if (val ==0)
		{
			hide('id_lun_username');
			hide('id_lun_pwd');
			hide('id_lun_confirm_pwd');
		}
	}				
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
		
		if (obj == "#ChapMode")
		{
			if ($(this).val() ==1)
			{
				show('id_confirm_b_pwd')
				show('id_b_username');
				show('id_b_pwd');
			}
			else if ($(this).val() ==0)
			{
				hide('id_confirm_b_pwd')
				hide('id_b_username');
				hide('id_b_pwd');
}
		}	
		else if (obj == "#ChapMode_detail")
		{		
			if ($(this).val() ==1)
			{
				show('id_detail_confirm_pwd');
				show('id_detail_username');
				show('id_detail_pwd');
			}
			else if ($(this).val() ==0)
			{
				hide('id_detail_confirm_pwd');
				hide('id_detail_username');
				hide('id_detail_pwd');
			}
		}
		else if (obj == "#ChapMode_lun")
		{		
			if ($(this).val() ==1)
			{
				show('id_lun_confirm_pwd');
				show('id_lun_username');
				show('id_lun_pwd');
			}
			else if ($(this).val() ==0)
			{
				hide('id_lun_confirm_pwd');
				hide('id_lun_username');
				hide('id_lun_pwd');
			}
		}
		else if (obj == "#s_type")
			show_schedule_type_div($(this).val());
	});

	$(obj).show();
}

function show_volume_info_iscsi(id)    
{		
	var v = $("#"+id).text();
	var num = v.substr(v.length-1,1);		  
}


//var __file = 1;
//var	__chkflag = 0;	//for show check box	1:show	0:not
//function i_create_tree_dialog(form,text_id)
//{
//	do_query_HD_Mapping_Info();
//
////$('#Backups_tree_div').fileTree({ root: '/mnt/HD' ,cmd: 'cgi_read_open_tree', script:'/cgi-bin/folder_tree.cgi', effect:'no_son',formname:form,textname:text_id,function_id:'ices',filetype:'all',checkbox_all:'3'}, function(file) { }); 
//	
//	$('#s3tree_div').fileTree({ root: '/mnt/HD' ,cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',formname:form,textname:text_id,function_id:'iscsi',filetype:'all',checkbox_all:'3'}, function(file) {        
//    });
//
//	var treeDiag_obj=$("#s3treeDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
//	treeDiag_obj.load();
//	language();
//	__RUN_WIZARD = true;
//
//
//}
var _use_lun;
var _use_size;
var _use_function;
function chk_file_size()
{
	var img_file = $("#storage_iscsiLunRestoreLocalPath_text").val();
	var j = translate_path_to_really(img_file);
	j = j.replace(/&nbsp;/g, ' ');
	j = j.replace(/&amp;/g, '&');	
	
	var flag = 0;
	var str = "cmd=cgi_file_size&path="+encodeURIComponent(j);
	wd_ajax({			
		type: "POST",
		url: "/cgi-bin/iscsi_mgr.cgi",
		data:str,
		async: false,
		cache: false,
		success: function(data){	
			
//console.log("data = %s \n",data);			
//console.log("_use_size = %s \n",_use_size);
			if (data != _use_size)
			{
				jAlert("The file size error.", _T('_common','error'));
				flag =1;
			}
			else
			{
				create_restore(_use_lun,j);
			}	
												
		}
	});		
	
	return flag;	
	//$("#s3_tree").val();	
}
function set_img_file()
{
	hide('id_set_location')
	hide('id_set_size')
	show('id_set_img');
}

function cancel_img_file()
{
	show('id_set_location')
	show('id_set_size')
	hide('id_set_img')
	$("#s3_tree").val("");
}


function info()
{
	var str = "cmd=cgi_iscsi_info";
				wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: false,
						cache: false,
						success: function(xml){								
							$(xml).find('rows').each(function(){
									_g_hostname = $(this).find('hostname').text();
									_g_iqn_prefix = $(this).find('iqn_prefix').text();									
							});
						}
					});		
	
}

function set_iscsi_server()
{	
		wd_ajax({			
			type: "POST",
			url: "/cgi-bin/iscsi_mgr.cgi",
			data:"cmd=cgi_get_iscsi_v",
			async: false,
			cache: false,
			success: function(xml){																
					$(xml).find('iscsi').each(function(index){							
									$("#storage_iscsiServer_text").val($(this).find('server').text());	
						});
			}  
	});	
	
	
	$("input:text").inputReset();
	$("input:password").inputReset();

	var obj=$("#iscsiServerDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
	obj.load();	
	init_button();			
	language();

	ui_tab("#iscsiServerDiag","#storage_iscsiServer_text","#storage_iscsiServerSave_button");
	
}



function save_iscsi_server()
{
	if (IP2V($("#storage_iscsiServer_text").val()) == false) {
				jAlert(_T('_ip', 'msg8'), "warning");
				return 1;
	}
	
	var str = "cmd=cgi_iscsi_server&ip="+$("#storage_iscsiServer_text").val();
	//alert(str);
	
	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: false,
						cache: false,
						success: function(data){																
								var Diag_obj=$("#iscsiServerDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});							
								Diag_obj.close();												
						}  
				});	
}
function enable_iscsi_server()
{
	if ($("#storage_iscsiServer_text").val() == "") 
	{
		show("storage_iscsiClient_link")
		jLoadingClose();
		return;
	}
	var str = "cmd=cgi_iscsi_server&ip="+$("#storage_iscsiServer_text").val();
	//alert(str);
	
	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: true,
						cache: false,
						success: function(data){																
									show("storage_iscsiClient_link")
									jLoadingClose();
						}  
				});	
}
function disable_iscsi_server()
{
		var str = "cmd=cgi_disable_iscsi_server"
	//alert(str);
	//return;
	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: true,
						cache: false,
						success: function(data){																
								jLoadingClose();
								hide("storage_iscsiClient_link")	
						}  
				});	

}

function m_disable_iscsi()
{
	var str = "cmd=cgi_disable"
	//alert(str);
	//return;
	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: false,
						cache: false,
						success: function(data){																
								jLoadingClose();
						}  
				});	
}
function m_enable_iscsi()
{
	var str = "cmd=cgi_enable"
	//alert(str);
	//return;
	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: false,
						cache: false,
						success: function(data){																							
							jLoadingClose();			
							info();																		
						}  
				});	
}


/**LUN************************************/

function open_lun_diag()
{
			
		if ($("#iscsi_lun_tb tbody:eq(1) tr").length >= MAX_LUN){jAlert(_T('_iscsi','msg3'), _T('_common','error')); return;}
		var obj=$("#iscsiLunDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
		obj.load();		
		$("input:text").inputReset();			
		_DIALOG = obj;
		init_button();	
		volume_lun_select();				
		unit_select("id_unit_lun");		
		init_select();		
		hide_select();
		//SetChapMode('#ChapMode','0','click')
		SetChapMode("#ChapMode_lun",'0','click');		
		language();
		init_iscsi_dialog();
		$("#iscsi_lun_step2").hide();
		$("#iscsi_lun_step1").show();				
		$("#iscsi_lun_step3").hide();	
		$("#storage_iscsiLunName_text").val("");
		$("#storage_iscsiLunSize_text").val("");
		SetMapping('#i_target_mapping','1',"");	
		setSwitch('#storage_iscsiLunPreAllocate_switch',1);
		$("#storage_iscsiLunSave1_button").show();
		$("#storage_iscsiLunNext1_button").hide();
		
		//$("#f_iqn").val("iqn.2013-01.com.wdc:wd-000001:test2"); /*by amy demo*/
		//$("#f_iqn").text("iqn.2013-01.com.wdc:wd-000001:test2");		
				
}
//function open_snap_diag(name,sch)
//{		
//	$("#iscsiBackupDiag_title").text("Create iSCSI Snapshot")
//	
//	_use_lun = name;
//	_use_function = "snap";
//	init_iscsi_dialog();
//	SetChapMode("#s_type",'1','click');		
//	SetChapMode("#f_backup_now",'1','click');		
//	
//		if (sch!="")
//		{			
//			$("#backup_now_div").hide();
//			$("#schedule_tr").show();
//			$("#schedule_tr").show();
//			setSwitch('#storage_iscsiLunAuto_switch',1);								
//			var sch_array = sch.split(",");										
//			if (sch_array[0] == "daily")
//			{
//				SetMapping('#s_type','1',"");													
//				_g_sch_hour = sch_array[1];		
//				show_schedule_type_div("1");												
//			}
//			else if (sch_array[0] == "weekly")
//			{
//				SetMapping('#s_type','2',"");
//				_g_sch_week = sch_array[1]; //ww
//				_g_sch_hour = sch_array[2]; //hh
//				show_schedule_type_div("2");										
//			}
//			else if (sch_array[0] == "monthly")
//			{
//				SetMapping('#s_type','3',"");
//				_g_sch_day = sch_array[1]; //dd
//				_g_sch_hour = sch_array[2]; //hh
//				show_schedule_type_div("3");
//			}
//		}
//		else
//		{
//			setSwitch('#storage_iscsiLunAuto_switch',0);
//			//SetMapping('#i_method_backup','1',"");	
//			$("#backup_now_div").show();
//			$("#schedule_div").hide();
//			$("#schedule_tr").hide();
//			$("#schedule_tr").hide();	
//		
//		}
//	
//	$("#storage_iscsiLunBackupBack2_button").hide();
//	$("#storage_iscsiLunBackupCancel2_button").removeClass("ButtonMarginLeft_20px").addClass("ButtonMarginLeft_40px");
//	
////	sch_hour_select();
////	sch_day_select();
////	sch_week_select();
//	init_select();	
//	//SetMapping('#i_method_backup','1',"");		
//	var obj=$("#iscsiBackupDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
//	obj.load();	
//									
//	$("#id_take_snap_span").show();
//	$("#id_backup_now_span").hide();
//									
//	$("#iscsi_snap_step1").hide();
//	$("#iscsi_schedule").hide();
//	$("#iscsi_finish").hide();
//	$("#iscsi_snap_finish").hide();
//	$("#iscsi_backup_path").hide();
//
//	$("#iscsi_schedule").show();
//}

function volume_lun_select()
{
	do_query_HD_Mapping_Info();
		
	$('#id_volume_lun_top_main').empty();
    html_select_open = "";
	html_select_open += '<ul>';
	html_select_open += '<li class="option_list">';          
	html_select_open += '<div id="storage_iscsiLunVolume_select" class="wd_select option_selected">';
	html_select_open += '<div class="sLeft wd_select_l"></div>';
	for( var i=0 in HDD_INFO_ARRAY)
	{
		var info = HDD_INFO_ARRAY[i].split(":");
		var volume_name = info[0];
		var volume_path = info[1];		
		if ( i== 0)
			get_iscsi_volume_size(volume_name);
		if(i==0 && HDD_INFO_ARRAY.length==1)
		{
			html_select_open += '<div class="sBody text wd_select_m" id="id_volume_lun" rel="' + volume_path + '" >'+volume_name+'</div>';
			html_select_open += '<div class="sRight wd_select_r"></div>	';
			html_select_open += '</div>';
			html_select_open += '<ul class="ul_obj" style="width:130px;">'; 
			html_select_open += '<li rel="' + volume_path + '" class="li_start li_end" style="width:120px;"><a href=\"#\" onclick=\"show_volume_info_iscsi(\'id_volume_lun\');get_iscsi_volume_size(\''+volume_name+'\');\">' + volume_name + '</a></li>';
			
		}
		else if(i==0) 
		{
			html_select_open += '<div class="sBody text wd_select_m" id="id_volume_lun" rel="' + volume_path + '" >'+volume_name+'</div>';
			html_select_open += '<div class="sRight wd_select_r"></div>	';
			html_select_open += '</div>';
			html_select_open += '<ul class="ul_obj" style="width:130px;">';
			html_select_open += '<li rel="' + volume_path + '" class="li_start" style="width:120px;"><a href=\"#\" onclick=\"show_volume_info_iscsi(\'id_volume_lun\');get_iscsi_volume_size(\''+volume_name+'\');\">' + volume_name + '</a></li>';
		}
		else if(i==HDD_INFO_ARRAY.length-1) 
			html_select_open += '<li rel="' + volume_path + '" class="li_end" style="width:120px;"><a href=\"#\" onclick="show_volume_info_iscsi(\'id_volume_lun\');get_iscsi_volume_size(\''+volume_name+'\');\">' + volume_name + '</a></li>';
		else
		{
			html_select_open += '<li rel="' + volume_path + '" style="width:120px;"><a href=\"#\" onclick=\"show_volume_info_iscsi(\'id_volume_lun\');get_iscsi_volume_size(\''+volume_name+'\');\">' + volume_name + '</a></li>';
		}
	}

	html_select_open += '</ul>';
	html_select_open += '</li>';
	html_select_open += '</ul>';
	
	$("#id_volume_lun_top_main").append(html_select_open);
	
	hide_select();
	init_select();
}
function volume_target_lun_select()
{
	do_query_HD_Mapping_Info();
		
	$('#id_volume_target_lun_top_main').empty();
    html_select_open = "";
	html_select_open += '<ul>';
	html_select_open += '<li class="option_list">';          
	html_select_open += '<div id="storage_iscsiTargetVolume_select" class="wd_select option_selected">';
	html_select_open += '<div class="sLeft wd_select_l"></div>';
	for( var i=0 in HDD_INFO_ARRAY)
	{
		var info = HDD_INFO_ARRAY[i].split(":");
		var volume_name = info[0];
		var volume_path = info[1];		
		if ( i== 0)
			get_iscsi_volume_size(volume_name);
		if(i==0 && HDD_INFO_ARRAY.length==1)
		{
			html_select_open += '<div class="sBody text wd_select_m" id="id_volume_target_lun" rel="' + volume_path + '" >'+volume_name+'</div>';
			html_select_open += '<div class="sRight wd_select_r"></div>	';
			html_select_open += '</div>';
			html_select_open += '<ul class="ul_obj" style="width:130px;">'; 
			html_select_open += '<li rel="' + volume_path + '" class="li_start li_end" style="width:120px;"><a href=\"#\" onclick=\"show_volume_info_iscsi(\'id_volume_target_lun\');get_iscsi_volume_size(\''+volume_name+'\');\">' + volume_name + '</a></li>';
			
		}
		else if(i==0) 
		{
			html_select_open += '<div class="sBody text wd_select_m" id="id_volume_target_lun" rel="' + volume_path + '" >'+volume_name+'</div>';
			html_select_open += '<div class="sRight wd_select_r"></div>	';
			html_select_open += '</div>';
			html_select_open += '<ul class="ul_obj" style="width:130px;">';
			html_select_open += '<li rel="' + volume_path + '" class="li_start" style="width:120px;"><a href=\"#\" onclick=\"show_volume_info_iscsi(\'id_volume_target_lun\');get_iscsi_volume_size(\''+volume_name+'\');\">' + volume_name + '</a></li>';
		}
		else if(i==HDD_INFO_ARRAY.length-1) 
			html_select_open += '<li rel="' + volume_path + '" class="li_end" style="width:120px;"><a href=\"#\" onclick="show_volume_info_iscsi(\'id_volume_target_lun\');get_iscsi_volume_size(\''+volume_name+'\');\">' + volume_name + '</a></li>';
		else
		{
			html_select_open += '<li rel="' + volume_path + '" style="width:120px;"><a href=\"#\" onclick=\"show_volume_info_iscsi(\'id_volume_target_lun\');get_iscsi_volume_size(\''+volume_name+'\');\">' + volume_name + '</a></li>';
		}
	}

	html_select_open += '</ul>';
	html_select_open += '</li>';
	html_select_open += '</ul>';
	
	$("#id_volume_target_lun_top_main").append(html_select_open);
	
	hide_select();
	init_select();
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
function write_lun_snap()
{	
	var str = "";
		wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:"cmd=cgi_get_iscsi_lun_info",
		dataType: "xml",	
		success:function(xml){																							
				str = str+ '<ul class="iscsiLUNListDiv">';			
				$(xml).find('row').each(function(index){					
					 	 var name = $(this).find('cell').eq(0).text();					 	 					 	 
					 	 var image_file = $(this).find('cell').eq(2).text();
					 	 var size = $(this).find('cell').eq(3).text();					 	 
					 	 var j = chg_path(image_file.substr(0,13));
					 	 					 	
					 	  str = str+ '<li>';					 	  
					 	  str = str+ '<div class="chkbox"><input type="checkbox" value='+index+' ></div>';					 	  
					 	  str = str+ '<div class="name">'+name+'</div>';
					 	 	str = str+ '<div class="volume">'+j+'</div>';
							str = str+ '<div class="size">'+size2str(size)+'</div>';		
							str	= str+'</li>';																
				 });				 
				 str = str + '</ul>'
			}			
	});			
		
	$("#id_lun_snap_tb").html(str);
	$("input:checkbox").checkboxStyle();	
	setTimeout(function(){
		$(".scrollbar_iscsi_dialog").jScrollPane();	
		},200);
}
function write_lun()
{
	var str = "";
	var j = 0;
	
	//cell (0) -> name
	//cell (1) -> target name
	//cell (2) -> image 
	//cell (2) -> size
	wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:"cmd=cgi_get_iscsi_lun_info",
		dataType: "xml",	
		success:function(xml){																				
				str = str+ '<ul class="iscsiLUNListDiv">';			
				$(xml).find('row').each(function(index){					
					 	 var name = $(this).find('cell').eq(0).text();
					 	 var target_name = $(this).find('cell').eq(1).text();
					 	 var image_file = $(this).find('cell').eq(2).text();
					 	 var size = $(this).find('cell').eq(3).text();
					 	 
					 	 j = chg_path(image_file.substr(0,13));				
					 	 if (target_name == "")
					 	 {					 	 
					 	 	j = 1;
					 	  str = str+ '<li>';					 	  
					 	  str = str+ '<div class="chkbox"><input type="checkbox" value='+index+' ></div>';					 	  
					 	  str = str+ '<div class="name">'+name+'</div>';
					 	 	str = str+ '<div class="volume">'+j+'</div>';
							str = str+ '<div class="size">'+size2str(size)+'</div>';		
							str	= str+'</li>';																
						}	
				 });
				 
				 str = str + '</ul>'
			}			
	});			
	
	
	$("#id_lun_mapping_tb").html(str);
	$("#id_lun_mapping_tb").show();			
	$("input:checkbox").checkboxStyle();
	return j;
}
function show_lun_mapping(target,iqn_num)
{
	_g_target = target;
	var str = "";
	var num = 0;
	wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:"cmd=cgi_get_iscsi_lun_info",
		dataType: "xml",	
		success:function(xml){																				
				str = str+ '<ul class="ListDiv iscsiLUNListDiv">';			
				$(xml).find('row').each(function(index){					
					num++;	
					 	 var name = $(this).find('cell').eq(0).text();
					 	 var target_name = $(this).find('cell').eq(1).text();
					 	 var image_file = $(this).find('cell').eq(2).text();
					 	 var size = $(this).find('cell').eq(3).text();
					 	 
					 	 var j = chg_path(image_file.substr(0,13));					 	 
					 	 
					 	  					 	  
					 	  if (target == target_name)
					 	  {
					 	  	str = str+ '<li>';			
					 	  	str = str+ '<div class="chkbox"><input type="checkbox" id="storage_iscsiTargetLunMap'+index+'_chkbox"	value='+index+' checked ></div>';					 	  	
					 	  	str = str+ '<div class="name">'+name+'</div>';
					 	 		str = str+ '<div class="volume">'+j+'</div>';
								str = str+ '<div class="size">'+size2str(size)+'</div>';		
								str	= str+'</li>';										
					 	  }	
					 	  else
					 	  {
					 	  	if (target_name == "")
					 	  	{					 	  		
					 	  		str = str+ '<li>';				
					 	  		str = str+ '<div class="chkbox"><input type="checkbox" id="storage_iscsiTargetLunMap'+index+'_chkbox"	 value='+index+' ></div>';	
							 	  str = str+ '<div class="name">'+name+'</div>';
							 	 	str = str+ '<div class="volume">'+j+'</div>';
									str = str+ '<div class="size">'+size2str(size)+'</div>';		
									str	= str+'</li>';																
					 	  	}
					 	  }	
					 	 						
				 });
				 
				 str = str + '</ul>'
			}			
	});				
	$("#id_lun_mapping_edit").html(str);
	$("input:checkbox").checkboxStyle();
	//adjust_dialog_size("#iscsiLUNMappingDiag","800","");		
	$("#iscsiLUNMappingDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false}).load();		
		
//	$(".scrollbar_iscsi_lun_list").jScrollPane();	

	if (num >= 5)
	{
		$("#id_lun_mapping_list").addClass("scrollbar_iscsi_lun_list");
	$(".scrollbar_iscsi_lun_list").jScrollPane();	
	}
	else
	{
			if ($("#id_lun_mapping_list").hasClass("scrollbar_iscsi_lun_list"))
			{								
				var element = $('.scrollbar_iscsi_lun_list').jScrollPane({/*params*/});				
				var api = element.data('jsp');				
				api.destroy();
				$("#id_lun_mapping_list").removeClass("scrollbar_iscsi_lun_list");
			}	
	}	

	
	if (iqn_num >= 1)
	{
		$("#lun_mapping_edit_button").addClass("gray_out").css("top","15px");		
	}
	else
	{
		$("#lun_mapping_edit_button").removeClass("gray_out").css("top","15px");			
	}	
}


function show_lun_detail(name)
{
	$("#f_lun_name_edit").val(name);
	wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:"cmd=cgi_lun_detail&name="+name,
		dataType: "xml",	
		success:function(xml){																							
				$(xml).find('row').each(function(index){					
					 	 	var prealloc = $(this).find('prealloc').text();	
					 	 	var img_file = $(this).find('img_file').text();	
					 	 	var size = $(this).find('size').text();												
							var unit = size.substr(size.length-2,2);
							modify_size = size.substr(0,size.length-2);														
							if (modify_size.substr(modify_size.length-2,2) == ".0")
							{
									modify_size = modify_size.substr(0,modify_size.length-2);
							}
							$("#storage_iscsiLunDetailSize_text").val(modify_size);
							unit_modify_select("id_unit_lun_edit",unit);
							init_select();
					 	 					 
					 	 setSwitch('#lun_detail_allocate_switch',prealloc)
					 	 
					 	 var j = chg_path(img_file.substr(0,13));
					 	 $("#lun_detail_volume").text(j);
					 	 
					 	 var byte_size = modify_size*1000*1000*1000;
					 	 var volume_size = iscsi_volume_size(j);
					 	 					 	 
					 	 $("#id_lun_edit_size").text(size2str(parseInt(volume_size*1024,10)+parseInt(byte_size,10)));
					 	 $("#id_lun_edit_size_byte").text(parseInt(volume_size*1024,10)+parseInt(byte_size,10));					 	 
				 });					 				 				 			 
			}
	});					
	$("#iscsiLUNDetailDiag_title").html(name+" "+_T('_p2p','detail'));	
	var obj=$("#iscsiLUNDetailDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
	obj.load();
	init_switch();
}
function show_lun_snap()
{
	adjust_dialog_size("#iscsiSnapDiag","750","");
	$("#iscsiSnapDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false}).load();			
	$("#iscsiSnapDiag_title").text($("#f_lun_name_edit").val()+" Snapshot");
	write_snap($("#f_lun_name_edit").val());
}
function write_snap(lun_name)
{
	clearTimeout(timeoutId_snap);
			_g_lun = lun_name;
		var str = "";
		wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:"cmd=cgi_get_snap",
		dataType: "xml",	
		success:function(xml){																				
				str = str+ '<ul class="iscsiLUNListDiv nowidth">';			
				$(xml).find('row').each(function(index){					
					 	 var name = $(this).find('cell').eq(0).text();
					 	 var state = $(this).find('cell').eq(1).text(); //0:ready 1:creae 2:restore
					 	 var snap_percent = $(this).find('cell').eq(2).text();
					 	 var restore_percent = $(this).find('cell').eq(3).text();
					 	 					 	 
					 	 var name_array = name.split('_');
					 	 if (name_array[1] == lun_name)
					 	 {							 	 	 	 	
					 	  str = str+ '<li>';					 	  
					 	  str = str+ '<div class="name">'+name+'</div>';							 	
					 	  if (state == 0)	 	  
					 	  	str = str+ '<div class="status">'+'Ready'+'</div>';
					 	  else
					 	  {
					 	  	var bar = '<div class="list_icon_bar" style="">' +
										'<div class="bar_p" style="float: left; width: {0}%;"></div>' +
										'</div>' +
										'<div class="list_bar_text TooltipIcon" title="{1}%">{2}... {1}%</div>';
								var bar_p;
								var src_text;										
					 	  	if (state == 1)
					 	  	{
					 	  		bar_p = snap_percent;
					 	  		src_text = "Create";
					 	  	}
					 	  	else if (state == 2)
					 	  	{
					 	  		bar_p = restore_percent;
					 	  		src_text = "Restore"
					 	  	}
					 	  	str += "<div class='status'>";
								str += String.format(bar, bar_p, bar_p, src_text);
								str += "</div>";
					 	  }		
					 	  str = str+ '<div class="icon"><div class="list_icon"><div class="restore TooltipIcon" onclick="snap_restore(\''+name+'\');"></div><div class="del TooltipIcon" onclick="snap_del(\''+name+'\');"></div></div></div>';					 	  					 	  
							str	= str+'</li>';																						
						}	
				 });
				 
				 str = str + '</ul>'
			}			
	});		
		
	$("#id_snap").html(str);	
	$(".scrollbar_iscsi_dialog").jScrollPane();	
	timeoutId_snap = setTimeout(function(){
			write_snap(lun_name);
			},5000);
	
}
function show_acl_detail(name,iqn)
{
	var use_lun = new Array();
	var str = "";
	$("#f_acl_name_edit").val(name);
	$("#f_acl_iqn_edit").val(iqn);
	var gray_flag = 0;
	var acl_index = 0;
	wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:"cmd=cgi_acl_detail&name="+name,
		dataType: "xml",	
		success:function(xml){																							
					str = str+ '<ul class="iscsiListDiv">';			
					$(xml).find('row').each(function(index){					
							acl_index = index;				
					 	 var lun_name = $(this).find('lun_name').text();					 	
					 	 var access = $(this).find('access_right').text();		
					 	
					 	 	use_lun[index] = lun_name; 	 					 	 
					 	 if (lun_name.indexOf("SNAP_")!= -1)						 	 
					 	 	gray_flag = 1;
					 	 if (access == "RW")
					 	 {
					 	 		var rw = _T('_network_access','read_write');					 	 		
						 	 	if (gray_flag == 1)
						 	 	{
						 	 		var tmp = '<a class="rwDown gray_out" id="storage_iscsiAclWrite'+index+'_link"></a>'
						 	 	}
					 	 		else
					 	 		{	
					 	 			var tmp = '<a class="rwDown" id="storage_iscsiAclWrite'+index+'_link" onclick="set_access_iscsi(this,\'rw\',\''+gray_flag+'\')"></a>'
					 	 		}	
					 	 		
					 	 		tmp = tmp + '<a class="rUp" id="storage_iscsiAclRead'+index+'_link" onclick="set_access_iscsi(this,\'r\',\''+gray_flag+'\')"></a>';
					 	 		tmp = tmp + '<a class="dUp" id="storage_iscsiAclDeny'+index+'_link" onclick="set_access_iscsi(this,\'d\',\''+gray_flag+'\')"></a>';
					 	 }
					 	 else if (access == "RO")
					 	 {
					 	 		var rw = _T('_network_access','read_only');
					 	 		var tmp = '<a class="rwUp" id="storage_iscsiAclWrite'+index+'_link" onclick="set_access_iscsi(this,\'rw\',\''+gray_flag+'\')"></a>'
					 	 		tmp = tmp + '<a class="rDown" id="storage_iscsiAclRead'+index+'_link" onclick="set_access_iscsi(this,\'r\',\''+gray_flag+'\')"></a>';
					 	 		tmp = tmp + '<a class="dUp" id="storage_iscsiAclDeny'+index+'_link" onclick="set_access_iscsi(this,\'d\',\''+gray_flag+'\')"></a>';
					 	 }	
					 	 else if (access == "DENY")
					 	 {
					 	 		var rw = _T('_network_access','decline');
					 	 		var tmp = '<a class="rwUp" id="storage_iscsiAclWrite'+index+'_link" onclick="set_access_iscsi(this,\'rw\',\''+gray_flag+'\')"></a>'
					 	 		tmp = tmp + '<a class="rUp" id="storage_iscsiAclRead'+index+'_link" onclick="set_access_iscsi(this,\'r\',\''+gray_flag+'\')"></a>';
					 	 		tmp = tmp + '<a class="dDown" id="storage_iscsiAclDeny'+index+'_link" onclick="set_access_iscsi(this,\'d\',\''+gray_flag+'\')"></a>';
					 	 }							 	 					 	 
					 	  str = str+ '<li>';
					 	  str = str+ '<div class="name">'+lun_name+'</div>';					 	
					 	 	str = str+ '<div class="img">'+tmp+'</div>';
					 	 	
					 	 	
							 str = str+ '<div class="access">'+rw+'</div>';		
							str	= str+'</li>';			
				 });
				 
				// str = str + '</ul>' 				 			 
			}
	});		
	var all_lun =  new Array();
	//get all lun
		wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:"cmd=cgi_get_iscsi_lun_info",
		dataType: "xml",	
		success:function(xml){	
			 				$(xml).find('row').each(function(index){					 								 
			 								 all_lun[index] = $(this).find('cell').eq(0).text();
			 				});
			
				}
	});	
			
	for (var i = 0;i<all_lun.length;i++)
	{
		find = 0;
		for (j = 0;j<use_lun.length;j++)
		{			
			if (all_lun[i] == use_lun[j])
			{
				find = 1;
				break;
			}						
		}
		if (find == 0 )
		{
				acl_index = acl_index+1;
			var rw = _T('_network_access','decline');
				var tmp = '<a class="rwUp" id="storage_iscsiAclWrite'+acl_index+'_link" onclick="set_access_iscsi(this,\'rw\',\''+gray_flag+'\')"></a>'
				tmp = tmp + '<a class="rUp" id="storage_iscsiAclRead'+acl_index+'_link" onclick="set_access_iscsi(this,\'r\',\''+gray_flag+'\')"></a>';
				tmp = tmp + '<a class="dDown" id="storage_iscsiAclDeny'+acl_index+'_link" onclick="set_access_iscsi(this,\'d\',\''+gray_flag+'\')"></a>';
		  str = str+ '<li>';
			 	  str = str+ '<div class="name">'+all_lun[i]+'</div>';					 	
			 	 	str = str+ '<div class="img">'+tmp+'</div>';
			 	 	
			 	 	
					 str = str+ '<div class="access">'+rw+'</div>';		
					str	= str+'</li>';			
		}
	}		
	str = str + '</ul>' 		
						
	$("#id_acl_edit").html(str);	
	$("#iscsiAclDetailDiag_title").html(name+" "+_T('_p2p','detail'));
	$("#iscsiAclDetailDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false}).load();	
	adjust_dialog_size("#iscsiAclDetailDiag","650","");
	if (name == "Default")
	{		
		$("#storage_iscsiAclDetailDel_button").addClass("gray_out").css("top","15px");
	}	
	else
	{		
		$("#storage_iscsiAclDetailDel_button").removeClass("gray_out").css("top","15px");
	}	
	$(".scrollbar_iscsi_dialog").jScrollPane();			
}
function show_target_mapping(name)
{	
	name = $("#f_lun_name_edit").val();
	_g_lun = name;
	var str = "";
	
	wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:"cmd=cgi_get_iscsi_iqn",
		dataType: "xml",	
		success:function(xml){																				
				str = str+ '<ul class="iscsiListDiv">';			
				$(xml).find('row').each(function(index){					
					 	 var iqn = $(this).find('cell').eq(0).text();	
					 	 var status = $(this).find('cell').eq(1).text();	
					 	 var find = 0;
					 	 $(this).find('cell').eq(2).find('cell').each(function(j){
					 	 		if( $(this).text() == name)
					 	 		{
					 	 			find = 1;					 	 			
					 	 		}
					 	});
					 	
					 	  str = str+ '<li>';					 	  					 	  
					 	  if (find == 1)					 	  					 	  	
					 	  	str = str+ '<div class="chkbox"><input type="checkbox" value='+index+' checked></div>';	
					 	  else	
					 	  	str = str+ '<div class="chkbox"><input type="checkbox" value='+index+' ></div>';
					 	 	str = str+ '<div class="iqn">'+iqn+'</div>';
							str = str+ '<div class="status">'+status+'</div>';		
								str	= str+'</li>';			
				 });
				 
				 str = str + '</ul>'
			}
	});			
	$("#id_target_mapping_edit").html(str);
	$("input:checkbox").checkboxStyle();
	
	setTimeout(function(){
		$(".scrollbar_iscsi_dialog").jScrollPane();	
		},200);	
	var obj_id = "#id_target_mapping_edit";
	$( obj_id +" input:checkbox").unbind('click');
	
	$( obj_id ).find("input:checkbox").each(function(index){		
		$this=$(this);
		$this.attr('id',"storage_iscsiLunDetailTarget"+index+"_chkbox");		
		_click("storage_iscsiLunDetailTarget"+index+"_chkbox");
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
			_uncheck(obj_id,"#storage_iscsiLunDetailTarget");
			
			if(chkFlag==1) 
			{
				//$(obj_id + " .name").css("color","#898989");
				if (jQuery.browser.msie == true && jQuery.browser.version < 9.0)
				{
					$(this).next('span').addClass("checked")
				}
				else
					$(this).attr("checked",true);

		 		//chk_hdd_free_size($(this).val())
		 		$(obj_id).find('.name').css('color','#898989');
		 		$(obj_id).find('.size').css('color','#898989');					
				$(this).parent().parent().parent().find('.name').css('color','#0067A6');
				$(this).parent().parent().parent().find('.size').css('color','#0067A6');
				//_REMOTE_SHARE = $(this).parent().parent().parent().find('.name').html();
			}
			else
			{
				//$("#size_info").empty();
				$(this).parent().parent().parent().find('.name').css('color','#898989');
				$(this).parent().parent().parent().find('.size').css('color','#898989');
			}
		});
	}
	adjust_dialog_size("#iscsiTargetMappingDiag","750","");	
	var obj=$("#iscsiTargetMappingDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
	obj.load();
}
function show_acl()
{
	name = $("#f_lun_name_edit").val();
	
	var str = "";
	
	wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:"cmd=cgi_lun_acl&name="+name,
		dataType: "xml",	
		success:function(xml){																				
				str = str+ '<ul class="iscsiListDiv">';			
				$(xml).find('row').each(function(index){					
					 	 var acl_name = $(this).find('cell').eq(0).text();	
					 	 var initiator_name = $(this).find('cell').eq(1).text();	
					 	 var rw = $(this).find('cell').eq(2).text();	
					 	 
					 	 if (rw == "RW") rw = _T('_network_access','read_write');
					 	 else if (rw == "RO") rw = _T('_network_access','read_only');
					 	 else if (rw == "DENY") rw = _T('_network_access','decline');
					 	 		
					 	  str = str+ '<li>';
					 	  str = str+ '<div class="acl">'+acl_name+'</div>';
					 	 	str = str+ '<div class="initiator">'+initiator_name+'</div>';
					 	 	
					 	 	
							str = str+ '<div class="rw">'+rw+'</div>';		
							str	= str+'</li>';			
				 });
				 
				 str = str + '</ul>'
			}
	});			
	$("#id_lun_acl").html(str);
	
	adjust_dialog_size("#iscsiLUNAclDiag","750","");
	var obj=$("#iscsiLUNAclDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
	obj.load();
	$(".scrollbar_iscsi_dialog").jScrollPane()
}

function open_acl_diag()
{
	if ($("#iscsi_acl_tb tbody:eq(1) tr").length >= MAX_ACL){jAlert(_T('_iscsi','msg3'), _T('_common','error')); return;}		
	var str = "";
	$("#storage_iscsiAclName_text").val("");
	$("#storage_iscsiAclIqn_text").val("");
	
	wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:"cmd=cgi_get_iscsi_lun_info",
		dataType: "xml",	
		success:function(xml){																				
				str = str+ '<ul class="iscsiListDiv">';			
				$(xml).find('row').each(function(index){					
					 	 var name = $(this).find('cell').eq(0).text();	
					 	 var rw = _T('_network_access','decline');
					 	 var tmp = '<a class="rwUp" id="storage_iscsiAclWrite'+index+'_link" onclick="set_access_iscsi(this,\'rw\')"></a>'
					 	 		tmp = tmp + '<a class="rUp" id="storage_iscsiAclRead'+index+'_link" onclick="set_access_iscsi(this,\'r\')"></a>';
					 	 		tmp = tmp + '<a class="dDown" id="storage_iscsiAclDeny'+index+'_link" onclick="set_access_iscsi(this,\'d\')"></a>';					 	 
					 	  str = str+ '<li>';
					 	  str = str+ '<div class="name">'+name+'</div>';					 	
					 	 	str = str+ '<div class="img">'+tmp+'</div>';					 	 						 	 	
							str = str+ '<div class="access">'+rw+'</div>';		
							str	= str+'</li>';																								
				 });
				 
				 str = str + '</ul>'
			}
	});			
	$("#id_acl_create").html(str);		
	$("#iscsiAclDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false}).load();			
	adjust_dialog_size("#iscsiAclDiag","650","");
	$(".scrollbar_iscsi_dialog").jScrollPane()

}
function set_access_iscsi(obj,flag,gray_flag)
{
	if (gray_flag == 0)
	$(obj).parent().find('a:eq(0)').removeClass();
	$(obj).parent().find('a:eq(1)').removeClass();
	$(obj).parent().find('a:eq(2)').removeClass();
			
	switch(flag)
	{
		case 'rw':
			$(obj).parent().find('a:eq(0)').addClass('rwDown');
			$(obj).parent().find('a:eq(1)').addClass('rUp');
			$(obj).parent().find('a:eq(2)').addClass('dUp');
			$(obj).parent().next().html(_T('_network_access','read_write')	);
			flag=2;
			break;
		case 'r':
			$(obj).parent().find('a:eq(0)').addClass('rwUp');
			$(obj).parent().find('a:eq(1)').addClass('rDown');
			$(obj).parent().find('a:eq(2)').addClass('dUp');
			$(obj).parent().next().html(_T('_network_access','read_only') );
			flag=1;
			break;
		case 'd':
			$(obj).parent().find('a:eq(0)').addClass('rwUp');
			$(obj).parent().find('a:eq(1)').addClass('rUp');
			$(obj).parent().find('a:eq(2)').addClass('dDown');
			$(obj).parent().next().html(_T('_network_access','decline'));
			flag=3;
			break;
	}
}
function delete_snap(name)
{
	var str = "cmd=cgi_del_lun&name="+name;
		wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:str,
		dataType: "html",	
		success:function(data){																				
								var Diag_obj=$("#iscsiLUNDetailDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});							
								Diag_obj.close();								
								$("#iscsi_lun_tb").flexReload()
			}
	});			
}
function delete_lun(name)
{
	var str = "cmd=cgi_del_lun&name="+name;
		wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:str,
		dataType: "html",	
		success:function(data){										
					$("#iscsi_lun_tb").flexReload()							
			}
	});			
}

function lun_mapping_edit()
{
		if ($("#lun_mapping_edit_button").hasClass("gray_out")) return;
		var lun_mapping = "";	
		var num = 0;
		$('#id_lun_mapping_edit ul li').each(function(index){			
					if($("#id_lun_mapping_edit ul li:eq("+index+") div:eq(0) input ").prop('checked'))
					{						
						var v = $("#id_lun_mapping_edit ul li:eq("+index+") div:eq(1)").text();
						if (num != 0 )
						{
							lun_mapping = lun_mapping+","+v
						}	
						else	
						{	
							num++;
							lun_mapping = v
						}									
					}
				});
				
		var str = "cmd=cgi_modify_target_mapping&name="+_g_target+"&lun_mapping="+lun_mapping;		
		
		wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:str,
		dataType: "html",	
		success:function(data){																				
								var Diag_obj=$("#iscsiLUNMappingDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});							
								Diag_obj.close();																
			}
	});										
}
function target_mapping_edit()
{		
		var target_mapping = "";
					
		$('#id_target_mapping_edit ul li').each(function(index){			
					if($("#id_target_mapping_edit ul li:eq("+index+") div:eq(0) input ").prop('checked'))
					{
						var v = $("#id_target_mapping_edit ul li:eq("+index+") div:eq(1)").text();										
						var t = v.split(":");						
						target_mapping = t[2];						
					}
				});		
		
		var str = "cmd=cgi_modify_lun_mapping&name="+_g_lun+"&new_name="+target_mapping;
//alert(str);		
		wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:str,
		dataType: "html",	
		success:function(data){																				
								var Diag_obj=$("#iscsiTargetMappingDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});							
								Diag_obj.close();																
			}
	});						
}
/************************************************
ACL function
*/
function modify_acl()
{
	var acl_name = $("#f_acl_name_edit").val();
	var iqn = $("#f_acl_iqn_edit").val();	
	var lun = "";
	var access = "";
	
				$('#id_acl_edit ul li').each(function(index){			
			
						var v = $("#id_acl_edit ul li:eq("+index+") div:eq(0)").text();
						var t = $("#id_acl_edit ul li:eq("+index+") div:eq(2)").text();
						if (t == _T('_network_access','read_write'))
							t = "RW"
						else if (t == _T('_network_access','read_only'))
						{
							t = "RO"
						}	
						else if (t == _T('_network_access','decline'))
						{
							t = "DENY"
						}	
							
						if (index != 0 )
						{
							lun = lun+","+v;
							access = access+","+t;
						}	
						else	
						{	
							lun = lun+v;
							access = access+t;
						}	
					
				});		
				
	var str = "cmd=cgi_modify_acl";
	str += "&acl_name="+acl_name;			
	str += "&iqn="+iqn;
	str += "&lun_mapping="+lun;
	str += "&lun_access="+access;
//	alert(str);
//return;
	jLoading(_T('_common','set') ,'loading' ,'s',""); 
	
	wd_ajax({			
			type: "POST",
			url: "/cgi-bin/iscsi_mgr.cgi",
			data:str,
			async: false,
			cache: false,
			success: function(data){						
					jLoadingClose();					
					
					var Diag_obj=$("#iscsiAclDetailDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});							
					Diag_obj.close();								
					$("#iscsi_acl_tb").flexReload();						
				}  
		});	
}
function delete_acl()
{
	if ($("#storage_iscsiAclDetailDel_button").hasClass("gray_out")) return;
	var name = $("#f_acl_name_edit").val();
	var iqn = $("#f_acl_iqn_edit").val();
	var str = "cmd=cgi_delete_acl&acl_name="+name+"&iqn="+iqn;	
	wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:str,
		dataType: "html",	
		success:function(data){																				
								var Diag_obj=$("#iscsiAclDetailDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});							
								Diag_obj.close();								
								$("#iscsi_acl_tb").flexReload();
			}
	});			
	
}

function _uncheck(obj_id,prefix_id)
{
	var n = $( obj_id +" input:checkbox").length;
	for(i =0;i< n;i++)
	{
		if (jQuery.browser.msie == true && jQuery.browser.version < 9.0)
		{
			$(prefix_id + i+"_chkbox").next('span').removeClass("checked");
		}
		else
			$(prefix_id + i+"_chkbox").attr("checked",false);
	}
}

/*
select
*/
//var _g_sch_hour = 1;
//var _g_sch_day = 1;
//var _g_sch_week = 1;
//function sch_week_select()
//{
//	var select_array = new Array(
//			//0,1,2,3,4
//			
//			_T('_mail','mon'),
//_T('_mail','tue'),
//_T('_mail','wed'),
//_T('_mail','thu'),
//_T('_mail','fri'),
//_T('_mail','sat'),
//_T('_mail','sun')
//
//			);
//
//
//
//	var select_v_array = new Array(
//			1,2,3,4,5,6,0
//			);
//
//			SIZE = 7;
//			SIZE2 = 2;
//			
//			var a = new Array(SIZE);
//			
//			for(var i=0;i<SIZE;i++)
//			{
//				a[i] = new Array(SIZE2);
//			}
//
//
//
//			for(var i = 0; i < SIZE; i++)
//				for(var j = 0; j < SIZE2; j++)
//				{
//					a[i][0] = select_array[i];
//					a[i][1] = select_v_array[i];
//				}
//
//
//
//
//			$('#id_sch_week_top_main').empty();
//				
//				
//				var my_html_options="";
//				
//				my_html_options+="<ul>";
//				my_html_options+="<li class='option_list'>";
//				my_html_options+="<div id=\"storage_iscsiWeek_select\" class=\"wd_select option_selected\">";
//				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
//				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_sch_week\" rel='"+_g_sch_week+"'>"+map_table(_g_sch_week)+"</div>";
//				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
//				my_html_options+="</div>";
//				my_html_options+="<ul class='ul_obj' id='id_sch_week_li'>"
//				my_html_options+="<div class='scrollbar_time'>";
//				my_html_options+="<li class=\"li_start\" rel=\""+select_v_array[0]+"\"><a href='#'>"+select_array[0]+"</a>";									
//				for (var i = 1;i<select_array.length -1;i++)
//				{		
//					my_html_options+="<li rel=\""+select_v_array[i]+"\"><a href='#'>"+select_array[i]+"</a>";		
//				}
//				var j = select_array.length-1;
//				my_html_options+="<li class=\"li_end\" rel='"+select_v_array[j]+"'><a href='#'>"+select_array[select_array.length-1]+"</a>";
//				my_html_options+="</div>";
//				my_html_options+="</ul>";
//				my_html_options+="</li>";
//				my_html_options+="</ul>";
//				$("#id_sch_week_top_main").append(my_html_options);	
//				$("#id_sch_week_top_main .option_list ul").css("width","90px");
//				$("#id_sch_week_top_main .option_list ul li").css("width","80px");				
//				function map_table(rel)
//				{
//					for(var i = 0; i < SIZE; i++)
//							for(var j = 0; j < SIZE2; j++)
//							{
//								a[i][0] = select_array[i];
//								a[i][1] = select_v_array[i];
//								if (a[i][1] == rel)
//								{									
//								 return a[i][0];
//								}
//							}					
//				}
//	
//}
//
///*
//day
//*/
//function sch_day_select()
//{
//	var select_array = new Array(			
//			);
//
//
//
//	var select_v_array = new Array(			
//			);
//
//			SIZE = 31;
//			SIZE2 = 2;
//			
//			for (var i=0;i<SIZE;i++)
//			{
//				var j= i+1;
//				select_v_array[i] = j;
//			}
//			for (var i=0;i<SIZE;i++)
//			{
//				var j = i+1;
//				if (i<=9)				
//					select_array[i] = "0"+ j;
//				else 	
//					select_array[i] = j;
//			}
//			
//			var a = new Array(SIZE);
//			
//			for(var i=0;i<SIZE;i++)
//			{
//				a[i] = new Array(SIZE2);
//			}
//
//
//
//			for(var i = 0; i < SIZE; i++)
//				for(var j = 0; j < SIZE2; j++)
//				{
//					a[i][0] = select_array[i];
//					a[i][1] = select_v_array[i];
//				}
//
//
//
//
//			$('#id_sch_day_top_main').empty();
//				var my_html_options="";
//				my_html_options+="<ul>";
//				my_html_options+="<li class='option_list'>";
//				my_html_options+="<div id=\"storage_iscsiDay_select\" class=\"wd_select option_selected\">";
//				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
//				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_sch_day\" rel='"+_g_sch_day+"'>"+map_table(_g_sch_day)+"</div>";
//				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
//				my_html_options+="</div>";
//				my_html_options+="<ul class='ul_obj' id='id_sch_day_li'>"
//				my_html_options+="<div class='scrollbar_time'>";
//				my_html_options+="<li class=\"li_start\" rel=\""+select_v_array[0]+"\"><a href='#'>"+select_array[0]+"</a>";									
//				for (var i = 1;i<select_array.length -1;i++)
//				{		
//					my_html_options+="<li rel=\""+select_v_array[i]+"\"><a href='#'>"+select_array[i]+"</a>";		
//				}
//				var j = select_array.length-1;
//				my_html_options+="<li class=\"li_end\" rel='"+select_v_array[j]+"'><a href='#'>"+select_array[select_array.length-1]+"</a>";
//				my_html_options+="</div>";
//				my_html_options+="</ul>";
//				my_html_options+="</li>";
//				my_html_options+="</ul>";
//				$("#id_sch_day_top_main").append(my_html_options);	
//				$("#id_sch_day_top_main .option_list ul").css("width","90px");
//				$("#id_sch_day_top_main .option_list ul li").css("width","80px");				
//				function map_table(rel)
//				{
//					for(var i = 0; i < SIZE; i++)
//							for(var j = 0; j < SIZE2; j++)
//							{
//								a[i][0] = select_array[i];
//								a[i][1] = select_v_array[i];
//								if (a[i][1] == rel)
//								{									
//								 return a[i][0];
//								}
//							}					
//				}
//	
//}

//function sch_hour_select()
//{
//	var select_array = new Array(
//			//0,1,2,3,4
//		"12AM","1AM","2AM","3AM","4AM","5AM","6AM","7AM","8AM","9AM","10AM","11AM","12PM","1PM","2PM","3PM","4PM","5PM","6PM"
//		,"7PM","8PM","9PM","10PM","11PM"
//			);
//
//
//
//	var select_v_array = new Array(
//			0,1,2,3,4,5,6,7,8,9,0,11,12,13,14,15,16,17,18,19,20,21,22,23
//			);
//			
//			SIZE = 24;
//			SIZE2 = 2;
//					
//			var a = new Array(SIZE);
//			
//			for(var i=0;i<SIZE;i++)
//			{
//				a[i] = new Array(SIZE2);
//			}
//
//
//
//			for(var i = 0; i < SIZE; i++)
//				for(var j = 0; j < SIZE2; j++)
//				{
//					a[i][0] = select_array[i];
//					a[i][1] = select_v_array[i];
//				}
//
//
//
//			$('#id_sch_hour_top_main').empty();								
//				var my_html_options="";				
//				my_html_options+="<ul>";
//				my_html_options+="<li class='option_list'>";
//				my_html_options+="<div id=\"storage_iscsiHour_select\" class=\"wd_select option_selected\">";
//				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
//				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_sch_hour\" rel='"+_g_sch_hour+"'>"+map_table(_g_sch_hour)+"</div>";
//				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
//				my_html_options+="</div>";
//				my_html_options+="<ul class='ul_obj' id='id_sch_hour_li'>"
//				my_html_options+="<div class='scrollbar_time'>";
//				my_html_options+="<li class=\"li_start\" rel=\""+select_v_array[0]+"\"><a href='#'>"+select_array[0]+"</a>";									
//				for (var i = 1;i<select_array.length -1;i++)
//				{		
//					my_html_options+="<li rel=\""+select_v_array[i]+"\"><a href='#'>"+select_array[i]+"</a>";		
//				}
//				var j = select_array.length-1;
//				my_html_options+="<li class=\"li_end\" rel='"+select_v_array[j]+"'><a href='#'>"+select_array[select_array.length-1]+"</a>";
//				my_html_options+="</div>";
//				my_html_options+="</ul>";
//				my_html_options+="</li>";
//				my_html_options+="</ul>";
//				$("#id_sch_hour_top_main").append(my_html_options);	
//				$("#id_sch_hour_top_main .option_list ul").css("width","90px");
//				$("#id_sch_hour_top_main .option_list ul li").css("width","80px");				
//				function map_table(rel)
//				{
//					for(var i = 0; i < SIZE; i++)
//							for(var j = 0; j < SIZE2; j++)
//							{
//								a[i][0] = select_array[i];
//								a[i][1] = select_v_array[i];
//								if (a[i][1] == rel)
//								{									
//								 return a[i][0];
//								}
//							}					
//				}
//	
//}
//function show_schedule_type_div(s_type)
//{		
//	$("#week_div").show()	
//	switch(s_type)
//	{
//		case '1':	//daily
//			$("#id_week_div").hide()
//			$("#id_month_div").hide()
//			$("#id_sch_word").text(_T('_remote_backup','time'));
//			
//			break;
//		case '2':	//weekly	
//			$("#id_sch_word").text(_T('_remote_backup','date_time'));				
//			$("#id_week_div").show()
//			$("#id_month_div").hide()
//			break;
//		case '3':	//monthly
//			$("#id_sch_word").text(_T('_remote_backup','date_time'));
//			$("#id_week_div").hide()
//			$("#id_month_div").show()
//			break;
//	}
//}
//var __file = 1;
//var	__chkflag = 0;	//for show check box	1:show	0:not
//function create_tree_dialog(form,text_id)
//{			
//	do_query_HD_Mapping_Info();
//	if (form == "form_backup")
//		__file = 0;
//	else	
//		__file = 1;
//	
//$('#backup_tree_div').fileTree({ root: '/mnt/HD' ,cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',formname:form,textname:text_id,checkbox_all:'3'}, function(file) {        
//    });
//
//		var treeDiag_obj=$("#treeDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
//		treeDiag_obj.load();
//		language();
//		
//		$("#storage_iscsiLunPathSelectOk_button").click(function(){
//			treeDiag_obj.close();
//			
//			
//				if (form == "form_backup")
//				{
//						var obj=$("#iscsiBackupDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
//						obj.load();
//						$("#id_take_snap_span").hide();
//						$("#id_backup_now_span").show();
//						
//						$("#iscsiBackupDiag_title").text("Create iSCSI Backup");
//							$("#iscsi_snap_step1").hide();
//							$("#iscsi_schedule").hide();
//							$("#iscsi_finish").hide();
//							$("#iscsi_snap_finish").hide();
//							$("#iscsi_backup_path").hide();
//						$("#iscsi_backup_path").show();						
//						$("#storage_iscsiLunPathSelect_button").focus();
//				}
//				else
//				{
//						var obj=$("#iscsiRestoreDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
//						obj.load();
//				}	
//						
//		
//		});
//		
//		
//
//}
function show_lun_window()
{	
	show_lun_detail($("#f_lun_name_edit").val());
}


//function view()
//{
//	$("#show_local_path").html($("#storage_iscsiLunPath_text").val());						
//	var j = getSwitch('#storage_iscsiLunAuto_switch');
//	if (j == 0 )
//	{
//		if ($('#f_backup_now').attr('rel') == "1")
//			$("#show_backup_now").html(_T('_button','yes'))//Yes
//		else
//			$("#show_backup_now").html(_T('_button','no'))//No
//	
//		hide("id_show_backup_sch");
//		show("id_show_backup_now");	
//		return;
//	}
//	show("id_show_backup_sch");
//	hide("id_show_backup_now");
//
//	var type = $('#s_type').attr('rel')
//	var mon = $("#id_sch_month").text();
//	var day = $("#id_sch_day").text();
//	var hour = $("#id_sch_hour").text();
//	var min = "0";
//
//	if (type == 1) //daily
//	{
//		$("#show_backup_sch").html(hour+" :  "+ min +" / "+ _T('_mail','daily'));//Daily
//	}
//	else if (type == 2) //weekly
//	{				
//		week = $("#id_sch_week").text();
//		$("#show_backup_sch").html(week+" "+hour+" / "+_T('_mail','weekly'));//Weekly
//	}
//	else if (type == 3) //monthly
//	{
//		//var d= $("#id_s3_sch select[name='f_day']").val()
//		var d = $("#id_sch_day").attr('rel');
//		var s;
//		if(day==1 || day==21 || day==31)
//			s=d + "st" ;
//		else if(day==2 || day==22)
//			s=d + "nd" ;
//		else if(day==3 || day==23)
//			s=d + "rd" ;
//		else 
//			s=d + "th" ;		
//		$("#show_backup_sch").html(s+" "+hour+" / "+_T('_mail','monthly'));//Monthly
//	}
//}
//function snap_view()
//{
//	var j = getSwitch('#storage_iscsiLunAuto_switch');
//	if (j == 0 )
//	{
//		if ($('#f_backup_now').attr('rel') == "1")
//			$("#show_snap_now").html(_T('_button','yes'))//Yes
//		else
//			$("#show_snap_now").html(_T('_button','no'))//No
//	
//		hide("id_show_snap_sch");
//		show("id_show_snap_now");	
//		return;
//	}
//	show("id_show_snap_sch");
//	hide("id_show_snap_now");
//
//	var type = $('#s_type').attr('rel')
//	var mon = $("#id_sch_month").text();
//	var day = $("#id_sch_day").text();
//	var hour = $("#id_sch_hour").text();
//	var min = "0";
//
//	if (type == 1) //daily
//	{
//		$("#show_snap_sch").html(hour+" :  "+ min +" / "+ _T('_mail','daily'));//Daily
//	}
//	else if (type == 2) //weekly
//	{				
//		week = $("#id_sch_week").text();
//		$("#show_snap_sch").html(week+" "+hour+" / "+_T('_mail','weekly'));//Weekly
//	}
//	else if (type == 3) //monthly
//	{
//		//var d= $("#id_s3_sch select[name='f_day']").val()
//		var d = $("#id_sch_day").attr('rel');
//		var s;
//		if(day==1 || day==21 || day==31)
//			s=d + "st" ;
//		else if(day==2 || day==22)
//			s=d + "nd" ;
//		else if(day==3 || day==23)
//			s=d + "rd" ;
//		else 
//			s=d + "th" ;		
//		$("#show_snap_sch").html(s+" "+hour+" / "+_T('_mail','monthly'));//Monthly
//	}
//}
//function finish()
//{										
//	$("#auto_update_tr").show();
//	jLoading(_T('_common','set') ,'loading' ,'s',""); 
//	
//	var str = "cmd=cgi_create_backup";	
//	var name = _use_lun;
//	var path = translate_path_to_really($("#storage_iscsiLunPath_text").val());
//	
//	str +=	"&name="+name;
//	str +=	"&path="+path;
//		
//	var j = getSwitch('#storage_iscsiLunAuto_switch');
//	if (j == 0 )//schedule none
//	{
//		str += "&schedule=none";
//		str += "&backup_now="+$('#f_backup_now').attr('rel');
//	}
//	else
//	{
//		var type = $('#s_type').attr('rel')
//		var week = $("#id_sch_week").attr('rel');
//		var day = $("#id_sch_day").attr('rel');
//		var hour = $("#id_sch_hour").attr('rel');
//		var min = "0";
//				
//		str += "&schedule="+type;
//		str += "&week="+week;
//		str += "&day="+day;
//		str += "&hour="+hour;
//		str += "&min="+min;
//		str += "&backup_now=0";
//	}		
////console.log("str = %s",str);		
//	wd_ajax({			
//						type: "POST",
//						url: "/cgi-bin/iscsi_mgr.cgi",
//						data:str,
//						async: false,
//						cache: false,
//						success: function(data){							
//								jLoadingClose();							
//								
//									var obj=$("#iscsiBackupDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
//									obj.close();
//									$("#id_take_snap_span").hide();
//									$("#id_backup_now_span").show();
//								
//								$("#iscsi_lun_tb").flexReload()															
//						}  
//				});	
//}





/***********************************
	snap function:
	1:create
	2:restore
	3:delete
************************************/
function snap_create()
{
	
	var str = "cmd=cgi_create_snap&name="+_g_lun;
	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: false,
						cache: false,
						success: function(data){								
									write_snap(_g_lun);				
						}  
				});			
}
function snap_close()
{
	clearTimeout(timeoutId_snap);
}

function snap_restore(name)
{
	var str = "cmd=cgi_restore&name="+name;
	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: false,
						cache: false,
						success: function(data){								
									write_snap(_g_lun);				
						}  
				});			
}

function snap_del(name)
{
		var str = "cmd=cgi_del_snap&name="+name;
		wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: false,
						cache: false,
						success: function(data){								
									write_snap(_g_lun);				
						}  
				});			
}