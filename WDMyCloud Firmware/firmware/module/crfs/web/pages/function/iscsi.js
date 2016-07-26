var _INIT_ISCSI_DIAG_FLAG=0;	
var _g_hostname;
var _g_iqn_prefix;
var MAX_ISCSI = 64;
var timeoutId_iscsi = "";
var prealloc_flag = 0;
function init_iscsi_dialog()
{	
	$("#f_iqn").text(_g_iqn_prefix+_g_hostname+":")
	language();
	$("input:text").inputReset();
	$("input:password").inputReset();
	if(_INIT_ISCSI_DIAG_FLAG==1)
		return;
	_INIT_ISCSI_DIAG_FLAG=1;
	
	$("#storage_iscsiTargetNext1_button").click(function(){				
			if (chk_name() == 0 )
			{
			$("#iscsi_step2").show();
			$("#iscsi_step1").hide();				
			ui_tab("#iscsiDiag","#storage_iscsiTargetSecurityNone_button","#storage_iscsiTargetSave2_button");	
			}	
		});
	$("#storage_iscsiTargetBack2_button").click(function(){			
			$("#iscsi_step2").hide();
			$("#iscsi_step1").show();				
			ui_tab("#iscsiDiag","#storage_iscsiTargetAlias_text","#storage_iscsiTargetNext1_button");
		});		
		
		
	$("#s3_ok_button").click(function(){
		if(chk_file_size() == 1) return;						
		$("#s3treeDiag").overlay().close();	
		var Diag_obj=$("#iscsiDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
		Diag_obj.load();	
		__RUN_WIZARD = true;
		set_img_file();	
		//$("#rDiag_task").show();
	});
	
	$("#s3_back_button").click(function(){				
		$("#s3treeDiag").overlay().close();	
		var Diag_obj=$("#iscsiDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
		Diag_obj.load();	

		});	
}	

function set_iqn()
{
	$("#f_iqn").text(_g_iqn_prefix+_g_hostname+":"+$("#storage_iscsiTargetAlias_text").val());
}
function volume_select()
{
	do_query_HD_Mapping_Info();

	$('#id_volume_top_main').empty();
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
			html_select_open += '<div class="sBody text wd_select_m" id="id_volume" rel="' + volume_path + '" >'+volume_name+'</div>';
			html_select_open += '<div class="sRight wd_select_r"></div>	';
			html_select_open += '</div>';
			html_select_open += '<ul class="ul_obj" style="width:130px;">'; 
			html_select_open += '<li rel="' + volume_path + '" class="li_start li_end" style="width:120px;"><a href=\"#\" onclick=\"show_volume_info_iscsi();get_iscsi_volume_size(\''+volume_name+'\');\">' + volume_name + '</a></li>';
			
		}
		else if(i==0) 
		{
			html_select_open += '<div class="sBody text wd_select_m" id="id_volume" rel="' + volume_path + '" >'+volume_name+'</div>';
			html_select_open += '<div class="sRight wd_select_r"></div>	';
			html_select_open += '</div>';
			html_select_open += '<ul class="ul_obj" style="width:130px;"><div>';
			html_select_open += '<li rel="' + volume_path + '" class="li_start" style="width:120px;"><a href=\"#\" onclick=\"show_volume_info_iscsi();get_iscsi_volume_size(\''+volume_name+'\');\">' + volume_name + '</a></li>';
		}
		else if(i==HDD_INFO_ARRAY.length-1) 
			html_select_open += '<li rel="' + volume_path + '" class="li_end" style="width:120px;"><a href=\"#\" onclick="show_volume_info_iscsi();get_iscsi_volume_size(\''+volume_name+'\');\">' + volume_name + '</a></li>';
		else
		{
			html_select_open += '<li rel="' + volume_path + '" style="width:120px;"><a href=\"#\" onclick=\"show_volume_info_iscsi();get_iscsi_volume_size(\''+volume_name+'\');\">' + volume_name + '</a></li>';
		}
	}

	html_select_open += '</div></ul>';
	html_select_open += '</li>';
	html_select_open += '</ul>';
	
	$("#id_volume_top_main").append(html_select_open);
	
	hide_select();
	init_select();
}

function get_iscsi_volume_size(v)
{
var HOME_XML_CURRENT_ISCSI_INFO;
var my_free_size;
		wd_ajax({
		type:"POST",
		async:false,
		cache:false,
		url:"/cgi-bin/iscsi_mgr.cgi",
		data:"cmd=get_volume_size",
		dataType: "html",	
		success:function(){
			
						wd_ajax({
							url: "/xml/iscsi.xml",
							type: "POST",
							async:false,
							cache:false,
							dataType:"xml",
							success: function(xml){
								HOME_XML_CURRENT_ISCSI_INFO = xml;
								
								var my_uuid = "";
								
								$(HOME_XML_SYSINFO).find("vols").find("vol").each(function(index){
									if($('name',this).text() == v)
									{
									my_uuid = $('uuid',this).text();
										return false;
									}	
								});
																	
									$(HOME_XML_CURRENT_ISCSI_INFO).find("iscsi").find("lun").find("total_size").find("id").each(function(idx){	
										if ($('uuid',this).text() == my_uuid)
										{
												my_free_size = $('vol_claim_free_size',this).text();
												$("#id_volume_size").text(size2str(my_free_size));
					 	 						$("#id_volume_size_byte").text(my_free_size);
												return false; 
										}
								});									
						},
			      error:function (xhr, ajaxOptions, thrownError){}  
				});										
			}
	});	
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
				//my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_size\" rel='"+_g_oled_time+"'>"+oled_table(_g_oled_time)+"</div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_size\" rel='1'>1</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_size_li'><div>"
				my_html_options+="<li class=\"li_start\" rel=\""+sleep_v_array[0]+"\"><a href='#'>"+sleep_array[0]+"</a>";
					
				
				for (var i = 1;i<sleep_array.length -1;i++)
				{		
					my_html_options+="<li rel=\""+sleep_v_array[i]+"\"><a href='#'>"+sleep_array[i]+"</a>";		
				}
				var j = sleep_array.length-1;
				my_html_options+="<li class=\"li_end\" rel='"+sleep_v_array[j]+"'><a href='#'>"+sleep_array[sleep_array.length-1]+"</a>";
				my_html_options+="</div></ul>";
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

function unit_select()
{
	var sleep_array = new Array(
			"TB","GB"
			);



	var sleep_v_array = new Array(
			0,1
			);

			SIZE = 2;
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




			$('#id_unit_top_main').empty();
				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"storage_iscsiTargetUnit_select\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_unit\" rel='0'>TB</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_unit_li'><div>"
				my_html_options+="<li id=\"storage_iscsiTargetUnitLi1_select\" class=\"li_start\" rel=\""+sleep_v_array[0]+"\" ><a href='#'>"+sleep_array[0]+"</a>";
					
				
				for (var i = 1;i<sleep_array.length -1;i++)
				{		
					my_html_options+="<li id=\"storage_iscsiTargetUnitLi"+(i+1)+"_select\" rel=\""+sleep_v_array[i]+"\" ><a href='#'>"+sleep_array[i]+"</a>";		
				}
				var j = sleep_array.length-1;
				my_html_options+="<li id=\"storage_iscsiTargetUnitLi"+(j+1)+"_select\"  class=\"li_end\" rel='"+sleep_v_array[j]+"'><a href='#'>"+sleep_array[sleep_array.length-1]+"</a>";
				my_html_options+="</div></ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				
			
				
				$("#id_unit_top_main").append(my_html_options);	
				
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
function unit_modify_select(unit)
{
//	if (unit == "TB")
//	{
//		var sleep_array = new Array("TB");
//		var sleep_v_array = new Array(0);
//		SIZE = 1;
//		SIZE2 = 1;		
//	}
//	else
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




			$('#id_unit_modify_top_main').empty();								
				var my_html_options="";				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				//if (sleep_array.length == 1)
				//	my_html_options+="<div id=\"storage_iscsiTargetEditUnit_select\" class=\"gray_out wd_select option_selected\">";
				//else
				my_html_options+="<div id=\"storage_iscsiTargetEditUnit_select\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";				
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_unit_modify\" rel='"+map_table(unit)+"'>"+unit+"</div>";
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				
				//if (unit == "GB")
				{
					my_html_options+="<ul class='ul_obj' id='id_unit_modify_li' >"
					my_html_options+="<div>";
					my_html_options+="<li id='storage_iscsiTargetEditUnitLi1_select' class=\"li_start\" rel=\""+sleep_v_array[0]+"\" style='width:80px'><a href='#'>"+sleep_array[0]+"</a>";
						
					
					for (var i = 1;i<sleep_array.length -1;i++)
					{		
						my_html_options+="<li id='storage_iscsiTargetEditUnitLi"+(i+1)+"_select' rel=\""+sleep_v_array[i]+"\" style='width:80px' ><a href='#'>"+sleep_array[i]+"</a>";		
					}
					var j = sleep_array.length-1;
					my_html_options+="<li id='storage_iscsiTargetEditUnitLi"+(j+1)+"_select' class=\"li_end\" rel='"+sleep_v_array[j]+"' style='width:80px'><a href='#'>"+sleep_array[sleep_array.length-1]+"</a>";
					my_html_options+="</div>";
					my_html_options+="</ul>";
				}	
				my_html_options+="</li>";
				my_html_options+="</ul>";
											
				$("#id_unit_modify_top_main").append(my_html_options);					
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
			//{display: _T('_common','enable'), name : 'icon', width : 30, sortable : true, align: 'left'},
			{display: _T('_common','enable'), name : 'name', width : 100, sortable : true, align: 'left'},
			{display: _T('_module','status'), name : 'connect', width : 250, sortable : true, align: 'left'},
			{display: _T('_portforwarding','service'), name : 'size', width : 100, sortable : true, align: 'left'},
			{display: _T('_portforwarding','protocol'), name : 'detail', width : 90, sortable : true, align: 'left'}										
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
		singleSelect:true,
		resizable:false,
		preProcess:function(r)
		{		
			prealloc_flag = 0;
			$(r).find('row').each(function(index){
				var name = $(this).find('cell').eq(0).text();			
				$(this).find('cell').eq(0).text("<span id='storage_iscsiTargetName"+(index+1)+"_value' style='padding-left:10px;'>"+name+"</span>");
			
				var size = $(this).find('cell').eq(2).text();			
				$(this).find('cell').eq(2).text("<span id='storage_iscsiTargetSize"+(index+1)+"_value'>"+parseFloat(size) + size.substr(size.length-2,2)+"</span>");
			
				if ($(this).find('cell').eq(1).text().indexOf("prealloc=")!= -1)
				{
						var p = $(this).find('cell').eq(1).text().substring(9,$(this).find('cell').eq(1).text().length)
						if (p == "") p = 0;
						var bar_p = parseInt(p, 10);
							var bar = '<div class="list_icon_bar" syle="">' +
										'<div class="bar_p" style="float: left; width: {0}%;"></div>' +
										'</div>' +
										'<div class="list_bar_text">'+_T('_iscsi','creating')+' {1}%</div>';
							prealloc_flag = 1;
							$(this).find('cell').eq(1).text(String.format(bar, bar_p, bar_p));
				}
				else if ($(this).find('cell').eq(1).text().indexOf("No Initiators connected")!= -1)
				{
					$(this).find('cell').eq(1).text(_T('_iscsi','no_connect'))
				}		
				else
				{
					$(this).find('cell').eq(1).text($(this).find('cell').eq(1).text().replace('Initiators connected',_T('_iscsi','connect')))				
				}		
			$(this).find('cell').eq(3).text($(this).find('cell').eq(3).text().replace('Details',_T('_module','desc2')))				
			});
			
			var j = -1;	
			$(r).find('rows').each(function(){
			
				//var size = $(this).find('cell').eq(3).text();			
				//$(this).find('cell').eq(3).text(size2str(size));
				
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
                        if (prealloc_flag == 0 ) 
				$("#storage_iscsiCreateTarget_button").removeClass("gray_out");
			else
				$("#storage_iscsiCreateTarget_button").addClass("gray_out");
				
			return r;			
		},
		onSuccess:function(){
			clearTimeout(timeoutId_iscsi);
			timeoutId_iscsi = setTimeout(function(){
				jQuery("#iscsi_tb").flexReload();
				},6000)
		
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
										$("#storage_iscsiTargetEditUsername_text").val(chap_name);
										$("#storage_iscsiTargetEditPwd_text").val(chap_pwd);
										$("#storage_iscsiTargetEditConfirmPwd_text").val(chap_pwd);
									}	
									else
									{
										$("#storage_iscsiTargetEditUsername_text").val("");
										$("#storage_iscsiTargetEditPwd_text").val("");
										$("#storage_iscsiTargetEditConfirmPwd_text").val("");
									}	
									$("#storage_iscsiDetailEnable_button").removeClass("i_disable").removeClass("i_enable");
									if (enable == 1)
									{
										$("#storage_iscsiDetailEnable_button").text(_T('_common','disable'))
										$("#storage_iscsiDetailEnable_button").addClass("i_disable");
									}	
									else
									{	
										$("#storage_iscsiDetailEnable_button").text(_T('_common','enable'))
										$("#storage_iscsiDetailEnable_button").addClass("i_enable");
									}	
										
									document.getElementById("id_iscsi_name").innerHTML = name;
									document.getElementById("id_iscsi_iqn").innerHTML = iqn;
									document.getElementById("id_iscsi_ip").innerHTML = ip;								
									var unit = size.substr(size.length-2,2);
									modify_size = size.substr(0,size.length-2);									
									if (modify_size.substr(modify_size.length-4,4) == ".000")
									{
											modify_size = parseInt(modify_size, 10);
									}
									else 
									{
										if(unit=="TB")
										{
											unit="GB";
											modify_size = modify_size*1000;
										}
									}
									$("#storage_iscsiTargetEditSize_text").val(modify_size);							
									//$("#id_unit_modify").text(unit);
									unit_modify_select(unit);
									init_select();
									
									if (unit == "TB")
										modify_size = modify_size*1000;
									
									
									hide('id_detail_location')										
									show('id_detail_img')	
									$("#id_iscsi_img").html(chg_path(file));											
								
								
									if (prealloc_flag == 1)
									{
										$("#storage_iscsiTargetEditSize_text").addClass("gray_out");
										$("#storage_iscsiTargetEditSize_text").prop("readonly","readonly");
										$("#id_volume_detail_size_byte").text("");
										ui_tab("#iscsiDetailDiag","#storage_iscsiDetailCancel_button","#storage_iscsiDetailSave_button");
									}
									else
									{										
										$("#storage_iscsiTargetEditSize_text").prop("readonly",false);
										$("#storage_iscsiTargetEditSize_text").removeClass("gray_out");
										$("#id_volume_detail_size_desc").text("()");
									        get_iscsi_volume_size($("#id_iscsi_img").text().substring(0,8))											
									        var byte_size = modify_size*1000*1000*1000;																
										size2str(parseInt($("#id_volume_size_byte").text(),10)+byte_size);										
										$("#id_volume_detail_size_byte").text("("+size2str(parseInt($("#id_volume_size_byte").text(),10)+byte_size)+")");
										ui_tab("#iscsiDetailDiag","#storage_iscsiTargetEditSize_text","#storage_iscsiDetailSave_button");
									}	
									
									if (iqn_num >= 1)
									{
										$("#storage_iscsiDetailEnable_button").addClass("gray_out").css("top","15px");
										$("#storage_iscsiDetailDelete_button").addClass("gray_out").css("top","15px");
										$("#storage_iscsiDetailSave_button").addClass("gray_out").css("top","15px");
									}
									else
									{
										$("#storage_iscsiDetailEnable_button").removeClass("gray_out").css("top","15px");
										$("#storage_iscsiDetailDelete_button").removeClass("gray_out").css("top","15px");
										$("#storage_iscsiDetailSave_button").removeClass("gray_out").css("top","15px");
									}	
								});							
							}  
					});	
		$("input:text").inputReset();		
		$("#iscsiDetailDiag.WDLabelDiag").css("top","20px").css("margin-top","50px"); 			
		adjust_dialog_size("#iscsiDetailDiag","","490");	
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
				var str = "<ul class='ListDiv device_active' style='margin-left:-30px;'>"
				$(xml).find('root').each(function(){
					 	 var ini = $(this).find('ini').text();
					 	 
					 	 str = str+"<li>"
					 	 str = str+"<div>&nbsp;&nbsp;"+ ini+"</div>"					 	 
					 	 str = str+"</li>"
					 	 
				 });
			str = str+"</ul>"
				document.getElementById("id_ini_list").innerHTML  = str
			
			}
	});	
	
		$("#iscsiInitiatorsDiag_title").html(name+" "+_T('_iscsi','initi_title'));
	
		var obj=$("#iscsiInitiatorsDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
		obj.load();	
		language();
	
}
function open_diag()
{
		if ($("#storage_iscsiCreateTarget_button").hasClass("gray_out")) return;
		if ($("#iscsi_list_tb tbody:eq(1) tr").length >= MAX_ISCSI){jAlert(_T('_iscsi','msg3'), _T('_common','error')); return;}
		var obj=$("#iscsiDiag").overlay({fixed:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
		obj.load();
		$("#iscsiDiag.WDLabelDiag").css("left","210px").css("margin-top","-50px");
		$("input:text").inputReset();	
		$("input:password").inputReset();	
		init_button();	
		volume_select();
		size_select();
		unit_select();	
		init_select();		
		hide_select();
	
		SetChapMode("#ChapMode",'0','click');		
		language();
		init_iscsi_dialog();
		$("#iscsi_step2").hide();
		$("#iscsi_step1").show();				
		$("#storage_iscsiTargetAlias_text").val("");
		//$("#f_iqn").val("iqn.2013-01.com.wdc:wd-000001:test2"); /*by amy demo*/
		//$("#f_iqn").text("iqn.2013-01.com.wdc:wd-000001:test2");
		$("#storage_iscsiTargetSize_text").val("");
		$("#id_set_img").val("");
		$("#storage_iscsiTargetUsername_text").val("");
		$("#storage_iscsiTargetPwd_text").val("");
		$("#storage_iscsiTargetConfirmPwd_text").val("");
		ui_tab("#iscsiDiag","#storage_iscsiTargetAlias_text","#storage_iscsiTargetCancel1_button");
		
		cancel_img_file();
							
}
function chk_name()
{
		var alias = $("#storage_iscsiTargetAlias_text").val();
		if (alias == "")
		{			
			jAlert(_T('_iscsi','msg9'), _T('_common','error'),"",function(){$("#storage_iscsiTargetAlias_text").focus()});
			return 1;
		}
		if (alias.charAt(0) == " ")
		{
			jAlert(_T('_iscsi','msg23'), _T('_common','error'),"",function(){$("#storage_iscsiTargetAlias_text").focus()});			
			return 1;
		}
		
		var mt = alias.charAt(0).match(/[^\sa-z0-9]/);
		if (mt)
		{
			//var msg = 'The first character allow characters : "a-z"  , "0-9"'					
			jAlert(_T('_iscsi','msg1'), _T('_common','error'),"",function(){$("#storage_iscsiTargetAlias_text").focus()});			
			return 1;
		}				
		var mt = alias.match(/[^\sa-z0-9:.-]/);
		if (alias.indexOf(" ") != -1 && !mt)
		{
			jAlert(_T('_iscsi','msg23'), _T('_common','error'),"",function(){$("#storage_iscsiTargetAlias_text").focus()});			
			return 1;
		}				
				
		
		if (mt && alias.indexOf(" ") == -1 )
	 	{	 		
		//	var msg = 'The Target name allow characters : "a-z"  , "0-9" , "-" , "." and ":"'					
			jAlert(_T('_iscsi','msg2'), _T('_common','error'),"",function(){$("#storage_iscsiTargetAlias_text").focus()});			
			return 1;
	 	}		
		if (alias.indexOf(" ") != -1 || mt)
	 		{
			jAlert(_T('_iscsi','msg24'), _T('_common','error'),"",function(){$("#storage_iscsiTargetAlias_text").focus()});			
	 			return 1;
	 		}
	 	
	 	
	 	var error = 0;	 	
 		$('#iscsi_tb > tbody > tr').each(function (index) {
			var j = $('#iscsi_tb > tbody > tr:eq(' + index + ') >  td:eq(1)').text();		
			if (j == alias)
			{
				jAlert(_T('_iscsi','msg4'), _T('_common','error'),"",function(){$("#storage_iscsiTargetAlias_text").focus()});
				error = 1;
				return false;
			}
		});	 		 	
		if (error == 1)
			return 1;
			
		if ($("#id_set_img").css("display")	 == "none")
		//if ($("#s3_tree").val()== "")
		{
			if(isNaN($("#storage_iscsiTargetSize_text").val()) || $("#storage_iscsiTargetSize_text").val().indexOf(".")!= -1 || parseInt($("#storage_iscsiTargetSize_text").val(),10)<=0)
			{
				jAlert(_T('_ip','msg3'), _T('_common','error'),"",function(){$("#storage_iscsiTargetSize_text").focus()});
				return 1;
			}			
			var unit = $("#id_unit").text();
			var size = $("#storage_iscsiTargetSize_text").val();				
			/*				
			if (size >= 1000)
			{
				jAlert(_T('_iscsi','msg22'), _T('_common','error'));
				return 1;
			}*/			
			if (unit == "TB")
			{
				size = size*1000
			}
			if (size == "")
			{
				jAlert(_T('_iscsi','msg12'), _T('_common','error'),"",function(){$("#storage_iscsiTargetSize_text").focus()});
				return 1;
			}
			if (size > 16*1000)
			{
				jAlert(_T('_iscsi','msg8'), _T('_common','error'),"",function(){$("#storage_iscsiTargetSize_text").focus()});
				return 1;
			}						
			if (size*1000*1000*1000 > $("#id_volume_size_byte").text())
			{
					jAlert(_T('_iscsi','msg11')+$("#id_volume_size").text(), _T('_common','error'),"",function(){$("#storage_iscsiTargetSize_text").focus()});
					return 1;
			}								
		}	
		else
		{
			if($("#s3_tree").val()== "")
			{
				jAlert(_T('_iscsi','msg8'), _T('_common','error'));
				return 1;
			}
		}	
		return 0;
}
function clear_path()
{
	$("#s3_tree").val("")
}
function create_iscsi()
{	
	var alias = $("#storage_iscsiTargetAlias_text").val();
	var iqn = $("#f_iqn").val();
	var volume_location = $("#id_volume").text();
	var size = $("#storage_iscsiTargetSize_text").val();
	var unit = $("#id_unit").text();
	var security = $("#ChapMode").attr('rel');
	var username = $("#storage_iscsiTargetUsername_text").val();
	var password = $("#storage_iscsiTargetPwd_text").val();
	var password2 = $("#storage_iscsiTargetConfirmPwd_text").val();
	var img_file = $("#s3_tree").val();
		
	if (unit == "TB")
	{
		size = size*1000
	}
	do_query_HD_Mapping_Info();
	volume_location = volume_location.replace(/&nbsp;/g, ' ');
	volume_location = volume_location.replace(/&amp;/g, '&');
	var j = chg_path1(img_file);
	j = j.replace(/&nbsp;/g, ' ');
	j = j.replace(/&amp;/g, '&');	
	var str = "alias="+alias;
	//str+=",iqn="+iqn;
	str+="&volume_location="+encodeURIComponent(volume_location);
	str+="&size="+size;	
	str+="&security="+security;
	str+="&username="+username;
	str+="&password="+password;
	str+="&img_file="+encodeURIComponent(j);
	//var v = chg_path(img_file);
	//alert(v);
	//alert(str);	
	
	if (size > 16*1000)
	{
		jAlert(_T('_iscsi','msg8'), _T('_common','error'),"",function(){$("#storage_iscsiTargetSize_text").focus()});
		return 1;
	}
		
	if (security == 1)
	{				
		if (name_check(username) == 1)
		{			
			jAlert(_T('_iscsi','msg5'), _T('_common','error'),"",function(){$("#storage_iscsiTargetUsername_text").focus()});
			return 1;
		}			
		if (password.length < 12)
		{			
			jAlert(_T('_iscsi','msg6'), _T('_common','error'),"",function(){$("#storage_iscsiTargetPwd_text").focus()});		
			return 1;
		}
		
		if(name_check(password)==1)
		{
			jAlert(_T('_iscsi','msg7'), _T('_common','error'),"",function(){$("#storage_iscsiTargetPwd_text").focus()});			
			return 1;
		}
		if (password != password2)
		{
			jAlert(_T('_wizard','msg1'), _T('_common','error'),"",function(){$("#storage_iscsiTargetPwd_text").focus()});			
			return 1;
		}
	}
	
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
									jAlert(_T('_iscsi','msg4'), 'warning')
								}
								else
								{	
									google_analytics_log('iscsi-target-num',$('#iscsi_tb > tbody > tr').length+1);
									var Diag_obj=$("#iscsiDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});							
									Diag_obj.close();								
									$("#iscsi_tb").flexReload()
								}	
							}  
					});	
}

function modify_iscsi()
{	
	if ($("#storage_iscsiDetailSave_button").hasClass("gray_out")) return;
	var alias = $("#id_iscsi_name").text();	
	var security = $("#ChapMode_detail").attr('rel');;
	var username = $("#storage_iscsiTargetEditUsername_text").val();;
	var password = $("#storage_iscsiTargetEditPwd_text").val();
	var unit = $("#id_unit_modify").text();
	var size = $("#storage_iscsiTargetEditSize_text").val();
	if(isNaN($("#storage_iscsiTargetEditSize_text").val()) || $("#storage_iscsiTargetEditSize_text").val().indexOf(".")!= -1 || parseInt($("#storage_iscsiTargetEditSize_text").val(),10)<=0 )
	{
		$("#storage_iscsiTargetEditSize_text").focus();		
		jAlert(_T('_ip','msg3'), _T('_common','error'));
		return;
	}
	/*
	if (size >= 1000)
	{
		jAlert(_T('_iscsi','msg22'), _T('_common','error'));
		return;
	}*/
	if (unit == "TB")
	{
		size = size*1000
	}
	if (parseInt(size,10) < parseInt(modify_size,10))
	{
		jAlert(_T('_iscsi','msg10'), _T('_common','error'));
		return;
	}
	if (size > 16*1000)
	{
		jAlert(_T('_iscsi','msg8'), _T('_common','error'),"",function(){$("#storage_iscsiTargetSize_text").focus()});
		return 1;
	}	
	var k = (parseInt($("#id_volume_size_byte").text(),10)+parseInt(modify_size,10)*1000*1000*1000);
	if (size*1000*1000*1000 > k)
	{
			jAlert(_T('_iscsi','msg11')+$("#id_volume_detail_size_byte").text().substr(1,$("#id_volume_detail_size_byte").text().length-2), _T('_common','error'));
			return;
	}											
	
	if (security == 1)
	{
		if (name_check($("#storage_iscsiTargetEditUsername_text").val()) == 1)
		{			
			jAlert(_T('_iscsi','msg5'), _T('_common','error'));
			return 1;
		}	
		if ( $("#storage_iscsiTargetEditPwd_text").val().length < 12)
		{
			jAlert(_T('_iscsi','msg6'), _T('_common','error'));
			$("#storage_iscsiTargetEditPwd_text").select();
			$("#storage_iscsiTargetEditPwd_text").focus();
			return 1;
		}	
		if(name_check($("#storage_iscsiTargetEditPwd_text").val())==1)
		{
			jAlert(_T('_iscsi','msg7'), _T('_common','error'));
			$("#storage_iscsiTargetEditPwd_text").select();
			$("#storage_iscsiTargetEditPwd_text").focus();
			return 1;
		}
		if ( $("#storage_iscsiTargetEditPwd_text").val() != $("#storage_iscsiTargetEditConfirmPwd_text").val())
		{
			jAlert(_T('_wizard','msg1'), _T('_common','error'));			
			return 1;
		}
	}	
	
		
	var str = "alias="+alias;
	//str+=",iqn="+iqn;
	str+="&security="+security;
	str+="&username="+username;	
	str+="&password="+password;
	str+="&size="+size;
	
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
										$("#iscsi_tb").flexReload()
									}													
							}  
					});	
}
function delete_iscsi()
{
	if ($("#storage_iscsiDetailDelete_button").hasClass("gray_out")) return;
	jConfirm('M',_T('_iscsi','msg13'),_T('_iscsi','iscsi'),function(flag){
	if (flag == true)
	{                			        			
   	var str = "cmd=cgi_del_iscsi&del_file=1&alias="+$("#id_iscsi_name").text();
	//alert(str);
	//return;
	jLoading(_T('_common','set') ,'loading' ,'s',""); 
	stop_web_timeout(true);
	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: true,
						cache: false,
						success: function(data){
								google_analytics_log('iscsi-target-num',$('#iscsi_tb > tbody > tr').length-1);
								jLoadingClose();
								var Diag_obj=$("#iscsiDetailDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
								Diag_obj.close();													
								$("#iscsi_tb").flexReload();
								restart_web_timeout();
						}  
				});	
}
});//end of jConfirm		
}
function on_off_iscsi()
{
		if ($("#storage_iscsiDetailEnable_button").hasClass("gray_out")) return;		
		if ($("#storage_iscsiDetailEnable_button").hasClass("i_enable"))
			enable_iscsi();
		else
			disable_iscsi();	
			
}

function disable_iscsi()
{
	var str = "cmd=cgi_disable_iscsi&alias="+$("#id_iscsi_name").text();
	//alert(str);
	//return;
	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: false,
						cache: false,
						success: function(data){																
								var Diag_obj=$("#iscsiDetailDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});							
								Diag_obj.close();								
								//$("#iscsi_tb").flexReload()								
						}  
				});	
}
function enable_iscsi()
{
	var str = "cmd=cgi_enable_iscsi&alias="+$("#id_iscsi_name").text();
	//alert(str);
	//return;
	wd_ajax({			
						type: "POST",
						url: "/cgi-bin/iscsi_mgr.cgi",
						data:str,
						async: false,
						cache: false,
						success: function(data){																
								var Diag_obj=$("#iscsiDetailDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});							
								Diag_obj.close();								
								//$("#iscsi_tb").flexReload()								
						}  
				});	
}
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
	});

	$(obj).show();
}

function show_volume_info_iscsi()    
{		
	var v = $("#id_volume").text();
	var num = v.substr(v.length-1,1);		  
}


var __file = 1;
var	__chkflag = 0;	//for show check box	1:show	0:not
function i_create_tree_dialog(form,text_id)
{
	do_query_HD_Mapping_Info();

//$('#Backups_tree_div').fileTree({ root: '/mnt/HD' ,cmd: 'cgi_read_open_tree', script:'/cgi-bin/folder_tree.cgi', effect:'no_son',formname:form,textname:text_id,function_id:'ices',filetype:'all',checkbox_all:'3'}, function(file) { }); 
	
	$('#s3tree_div').fileTree({ root: '/mnt/HD' ,cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',formname:form,textname:text_id,function_id:'iscsi',filetype:'all',checkbox_all:'3'}, function(file) {        
    });

	var treeDiag_obj=$("#s3treeDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	treeDiag_obj.load();
	language();
	__RUN_WIZARD = true;
//	
//	$("#s3_ok_button").click(function(){
//		if(chk_file_size() == 1) return;						
//		$("#s3treeDiag").overlay().close();	
//		var Diag_obj=$("#iscsiDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
//		Diag_obj.load();	
//		__RUN_WIZARD = true;
//		set_img_file();	
//		//$("#rDiag_task").show();
//	});
//	
//	$("#s3_back_button").click(function(){				
//		$("#s3treeDiag").overlay().close();	
//		var Diag_obj=$("#iscsiDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
//		Diag_obj.load();	
//
//		});

}
function chk_file_size()
{
	var img_file = $("#s3_tree").val();
	var j = chg_path1(img_file);
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
			if (data == "size_error")
			{
				jAlert(_T('_iscsi','msg8'), _T('_common','error'));
				flag =1;
			}
			else if(data == "file_exist")
			{
				jAlert(_T('_iscsi','msg15'), _T('_common','error'));
				flag =1;
			}
			else if(data == "error")
			{
				jAlert(_T('_iscsi','msg8'), _T('_common','error'));
				flag =1;
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
	$("input:text").inputReset();
	$("input:password").inputReset();

	var obj=$("#iscsiServerDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
	obj.load();			
	init_button();			
	language();
	
		wd_ajax({			
			type: "POST",
			url: "/cgi-bin/iscsi_mgr.cgi",
			data:"cmd=cgi_get_iscsi_v",
			async: false,
			cache: false,
			success: function(xml){																
					$(xml).find('iscsi').each(function(index){							
									if ($(this).find('server').text() == "0.0.0.0")
										$("#storage_iscsiServer_text").val("");
									else	
									$("#storage_iscsiServer_text").val($(this).find('server').text());	
						});
			}  
	});	
	
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
								google_analytics_log('iscsi-isns-en','1');														
								var Diag_obj=$("#iscsiServerDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});							
								Diag_obj.close();												
								show("storage_iscsiClient_link");
								setSwitch('#storage_iscsiClient_switch','1');										
						}  
				});	
}
function enable_iscsi_server()
{
	var name = "";
	wd_ajax({			
			type: "POST",
			url: "/cgi-bin/iscsi_mgr.cgi",
			data:"cmd=cgi_get_iscsi_v",
			async: false,
			cache: false,
			success: function(xml){																
					$(xml).find('iscsi').each(function(index){							
									name = $(this).find('server').text()
									return false;
						});
			}  
	});	
	
	if (name == "" || name== "0.0.0.0")	
	{
		hide("storage_iscsiClient_link");
		setSwitch('#storage_iscsiClient_switch','0');
		set_iscsi_server();
		return;
	}
	jLoading(_T('_common','set') ,'loading' ,'s',""); 
	var str = "cmd=cgi_iscsi_server&ip="+name;
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
								hide("storage_iscsiClient_link");
								google_analytics_log('iscsi-isns-en','0');
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


