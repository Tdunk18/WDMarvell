var _INIT_ISO_DIAG_FLAG = 0;


var _fileName = "";
var _upIsoRootPath = "";

var ISO_CREATE = 0;
var ISO_MODIFY = 1;
var ISO_LOAD = 2;


var ISO_SET_TYPE = ISO_CREATE;
var ISO_NAME = new Array();
var _init = 0;
var MAX_NUM = 20;
var NOW_MAX_NUM = 0;


_SELECT_ITEMS  = new Array("id_iso_size_main");


var __str="";



function iso_size_select()
{
	var select_array = new Array(
			//1,2,3
			"CDROM(650MB/74MIN)","DVD5(4.7GB)","DVD9(8.5GB)"
			);



	var select_v_array = new Array(
			1,2,3
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

			$('#id_iso_size_top_main').empty();
				
				
				var my_html_options="";
				
				my_html_options+="<ul>";
				my_html_options+="<li class='option_list'>";
				my_html_options+="<div id=\"settings_utilitiesIsoSize_select\" class=\"wd_select option_selected\">";
				my_html_options+="<div class=\"sLeft wd_select_l\"></div>";
				my_html_options+="<div class=\"sBody text wd_select_m\" id=\"id_iso_size\" rel='1'>"+map_table(1)+"</div>";
				
				
				my_html_options+="<div class=\"sRight wd_select_r\"></div>";
				my_html_options+="</div>";
				my_html_options+="<ul class='ul_obj' id='id_iso_size_li'><div>"
				my_html_options+="<li id=\"settings_utilitiesIsoSizeLi1_select\" class=\"li_start\" rel=\""+select_v_array[0]+"\"><a href='#'>"+select_array[0]+"</a>";
					
				
				for (var i = 1;i<select_array.length -1;i++)
				{		
					my_html_options+="<li id=\"settings_utilitiesIsoSizeLi"+(i+1)+"_select\" rel=\""+select_v_array[i]+"\"><a href='#'>"+select_array[i]+"</a>";		
				}
				var j = select_array.length-1;
				my_html_options+="<li id=\"settings_utilitiesIsoSizeLi"+(j+1)+"_select\" class=\"li_end\" rel='"+select_v_array[j]+"'><a href='#'>"+select_array[select_array.length-1]+"</a>";
				my_html_options+="</div></ul>";
				my_html_options+="</li>";
				my_html_options+="</ul>";
				
			
				
				$("#id_iso_size_top_main").append(my_html_options);	
				
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

function iso_create_job()
{
	$("#id_iso_wait").hide();
	clear_iso_create_info();
	$("#settings_utilitiesIsoSave_button").hide();
	$("#id_chk_mount").hide();
	$("#iso_exit_button_3").hide();
	$("#iso_next_button_3").hide();	
	$('#iso_create_wizard_step3 input:checkbox[name=id_iso_mount]').attr('checked',false);
		
	_fileName = "";
	_upIsoRootPath = "";
	ISO_SET_TYPE = ISO_CREATE;
	init_iso_create_dialog();

	init_iso();

	language();				

	$("input:text").inputReset();
	adjust_dialog_size("#isoCreateDiag","700","400")
	adjust_dialog_size("#isotreeDiag","","400")
	
	var Obj=$("#isoCreateDiag").overlay({fixed:false,oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});			
	Obj.load();
	$("#isoCreateDiag.WDLabelDiag").css("left","70px").css("margin-top","-50px");		


		
		
	$("#tip_iso").attr('title',_T('_tip','iso_overwrite'));		
		init_tooltip();	
  $("#iso_create_wizard_step0").hide();	
	$("#iso_create_wizard_step1").hide();
	$("#iso_create_wizard_step2").hide();
	$("#iso_create_wizard_step3").hide();
	
	$("#iso_create_wizard_step1").show();
		
		__file = 1; 	
	//__chkflag = 1;  //for show check box  1:show  0:not

	do_query_HD_Mapping_Info();	
	$('#img_tree_div').fileTree({ root: '/mnt/HD/' ,cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',chk:1,filetype:'all',checkbox_all:'2',function_id:'iso_create'}, function(file) { });   			
//        setTimeout(tree_open,1000);
        
        
        
   iso_size_select();
   init_select();	    
   SetCreateNow("#f_type","1","")
   
   ui_tab("#isoCreateDiag","#settings_utilitiesIsoSize_select","#settings_utilitiesIsoNext1_button");
}


function iso_modify_job()
{	
	if ($("#iso_img_modify").hasClass("button_display"))
		return;
		
	ISO_SET_TYPE = ISO_MODIFY
	init_iso();
	init_iso_create_dialog();
	
//	if (NOW_MAX_NUM >= MAX_NUM) 
//	{
//		alert("The limit is 20 item.")
//		return;
//	}	
	
	
	var grid = $("#iso_img_tb");
	var selected_count =$('.trSelected',grid).length;
	if(selected_count==0)
	{
		jAlert( _T('_upnp','msg3'), _T('_common','error'));	//Text:Please select one item.
		return;
	}
 			 					
 	var iso_index = parseInt($('.trSelected td:eq(0) div',grid).html(),10) - 1;
 	
	var str = "cmd=cgi_iso_get_modify&index="+iso_index;
	
//alert("str"+ str);	
	wd_ajax({
				type:"POST",
				url:"/cgi-bin/isomount_mgr.cgi",
				data:str,
				cache:false,
				async:true,
				success:function(xml){	
											//do_query_HD_Mapping_Info();
											var size = $(xml).find("size").text();		  	
											var save_path = $(xml).find("save_path").text();											 																        													
											_fileName = $(xml).find("name").text();	
								  	  _upIsoRootPath = $(xml).find("path").text();										  	  
						  	  							  	  								 								  	  								  	
								  	  $("#f_size").val(size);									  	  
								  	  $("#settings_utilitiesIsoPath_text").val(translate_path_to_display(save_path));
								  	  $("#settings_utilitiesIsoName_text").val(_fileName);
								  	  
								  	  language();		
											__file = 1; 																						
											$('#img_tree_div').fileTree({ root: '/mnt/HD/' ,cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',chk:1,filetype:'all',checkbox_all:'2',function_id:'iso_create'}, function(file) { });   	
											var Obj=$("#isoCreateDiag").overlay({fixed:false,oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
											Obj.load();	
											$("#isoCreateDiag.WDLabelDiag").css("left","70px").css("margin-top","-50px");		
																		
											$(".exit").click(function(){
	                                                                                Obj.close();   
											});
																									
										  $("#iso_create_wizard_step0").hide();	
											$("#iso_create_wizard_step1").hide();
											$("#iso_create_wizard_step2").hide();
											$("#iso_create_wizard_step3").hide();
											$("#iso_create_wizard_step0").show();																				  	  								  	  
				},
				error:function(){
				}
		});					
}

function iso_load_job()
{	
	if ($("#iso_img_load").hasClass("button_display"))
	return;
		
	ISO_SET_TYPE = ISO_LOAD;
	init_iso();
	init_iso_create_dialog();
	
//	if (NOW_MAX_NUM >= MAX_NUM) 
//	{
//		alert("The limit is 20 item.")
//		return;
//	}	
	
	var grid = $("#iso_img_tb");
	var selected_count =$('.trSelected',grid).length;
	if(selected_count==0)
	{
		jAlert( _T('_upnp','msg3'), _T('_common','error'));	//Text:Please select one item.
		return;
	}
 			 					
 	var iso_index = parseInt($('.trSelected td:eq(0) div',grid).html(),10) - 1;
 	
	var str = "cmd=cgi_iso_get_modify&index="+iso_index;
	
//alert("str"+ str);	
	wd_ajax({
				type:"POST",
				url:"/cgi-bin/isomount_mgr.cgi",
				data:str,
				cache:false,
				async:true,
				success:function(xml){	
											do_query_HD_Mapping_Info();
											var size = $(xml).find("size").text();		  	
											var save_path = $(xml).find("save_path").text();		  																        													
											_fileName = $(xml).find("name").text();	
								  	  _upIsoRootPath = $(xml).find("path").text();										  	  
						  	  							  	  								 								  	  								  	
								  	  $("#f_size").val(size);	
								  	  $("#settings_utilitiesIsoPath_text").val(translate_path_to_display(save_path));
								  	  $("#settings_utilitiesIsoName_text").val(_fileName);
								  	  
								  	  language();		
											__file = 1; 												
											//do_query_HD_Mapping_Info();	
											$('#img_tree_div').fileTree({ root: '/mnt/HD/' ,cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',chk:1,filetype:'all',checkbox_all:'2',function_id:'iso_create'}, function(file) { });   	
                      var Obj=$("#isoCreateDiag").overlay({fixed:false,oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
											Obj.load();	
											$("#isoCreateDiag.WDLabelDiag").css("left","70px").css("margin-top","-50px");
											
											$(".exit").click(function(){
	                                                                                 Obj.close();   	
											});
																									
										  $("#iso_create_wizard_step0").hide();	
											$("#iso_create_wizard_step1").hide();
											$("#iso_create_wizard_step2").hide();
											$("#iso_create_wizard_step3").hide();
											$("#iso_create_wizard_step0").show();								  	  								  	  
				},
				error:function(){
				}
		});		
}

function iso_delete_job()
{
		if ($("#iso_img_delete").hasClass("button_display"))
		return;
		
		var grid = $("#iso_img_tb");
		var selected_count =$('.trSelected',grid).length;
		if(selected_count==0)
		{
			jAlert( _T('_upnp','msg3'), _T('_common','error'));	//Text:Please select one item.
			return;
		}
	 			 					
	 	var iso_index = $('.trSelected td:eq(0) div',grid).html();
	 	
		str = "cmd=cgi_iso_del&index="+iso_index;
		
		wd_ajax({
					type:"POST",
					url:"/cgi-bin/isomount_mgr.cgi",
					data:str,
					cache:false,
					async:true,
					success:function(data){
						jQuery("#iso_img_tb").flexReload();
					},
					error:function(){
					}
		});		
}


function init_iso_create_dialog()
{		
	$("#isoCreateDiag .close").show();
	
	
	$(".exit").click(function(){
		jQuery("#iso_img_tb").flexReload();  
		$("#isoCreateDiag").overlay().close();		
	});
			
	$(".close").click(function(){
		jQuery("#iso_img_tb").flexReload();       			
	});	
		
	
	if (_INIT_ISO_DIAG_FLAG == 1) return;
	
	_INIT_ISO_DIAG_FLAG=1;
	
	$("#iso_next_button_0").click(function(){								
		$("#iso_create_wizard_step1").show();
		$("#iso_create_wizard_step0").hide();
		$("#iso_create_wizard_step2").hide();							
	});
	
	$("#settings_utilitiesIsoNext1_button").click(function(){			

						
			if (ISO_SET_TYPE == ISO_CREATE)
			{
					if (chk_step1() != 0 ) return;		
					if (chk_hd_size() !=0 ) return;
							iso_img_config();																	
							$('.isoCreate_scroll_pane').jScrollPane();					
			
					 ui_tab("#isoCreateDiag","#settings_utilitiesIsoOverwrite_button","#settings_utilitiesIsoNext2_button");
			}
			else if(ISO_SET_TYPE == ISO_MODIFY)
			{
				if (chk_hd_size() !=0 ) return;
				iso_img_config_modify();				
//				$("#isoCD_title").html(ISO_STEP2);		
			}		
			else if(ISO_SET_TYPE == ISO_LOAD)
			{		
				if (chk_step1() != 0 ) return;		
				if (chk_hd_size() !=0 ) return;
				jConfirm('M',_T('_iso_create','msg7'),_T('_common','message'),function(r){
					if(r)
					{
							iso_img_config_load();	
//							$("#isoCD_title").html(ISO_STEP2);		
					}
				});							
			}			
			//$("#isoCD_title").html(ISO_STEP2);		
  });	
	$("#iso_back_button_1").click(function(){				
		$("#iso_create_wizard_step0").show();
		$("#iso_create_wizard_step1").hide();
		$("#iso_create_wizard_step2").hide();
//		$("#isoCD_title").html(ISO_TITLE);
		
		
	});
	
	$("#settings_utilitiesIsoNext2_button").click(function(){			
		
			if ($("#settings_utilitiesIsoNext2_button").hasClass("button_gray"))
			return;						
//			$("#isoCreateDiag").css("height","350px");
			
			if (chk_step2() != 0 ) return;
					
			iso_img_settings();
			$("#isoCreateDiag.WDLabelDiag").css("left","70px").css("margin-top","-50px");
			
			$("#iso_create_wizard_step3").show();
			$("#iso_create_wizard_step0").hide();
			$("#iso_create_wizard_step1").hide();
			$("#iso_create_wizard_step2").hide();
//			$("#isoCD_title").html(ISO_STEP3);	
			
			$("#isoCreateDiag .close").hide();
	});
	
	$("#iso_back_button_2").click(function(){				
		$("#iso_create_wizard_step1").show();
		$("#iso_create_wizard_step0").hide();
		$("#iso_create_wizard_step2").hide();
		$("#iso_create_wizard_step3").hide();
//		$("#isoCD_title").html(ISO_STEP1);	
	});
	
		$("#iso_back_button_3").click(function(){			
			//$(".dialog_content").height("320px");	
			//$(".WDLabelBodyDialogue").height("300px");			
			//$(".WDLabelDiag").height("480px");
								
		$("#iso_create_wizard_step2").show();			
		$("#iso_create_wizard_step0").hide();
		$("#iso_create_wizard_step1").hide();
		$("#iso_create_wizard_step3").hide();
//		$("#isoCD_title").html(ISO_STEP2);	
	});			
	
	$("#iso_next_button_3").click(function(){		

			iso_create("img");

		  var Obj=$("#isoCreateDiag").overlay({fixed:false,oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
			Obj.close();
			$("#isoCreateDiag.WDLabelDiag").css("left","70px").css("margin-top","-50px");		
//			$("#iso_create_wizard_step3").hide();
//			$("#iso_create_wizard_step0").hide();
//			$("#iso_create_wizard_step1").hide();
//			$("#iso_create_wizard_step2").hide();
			//$("#isoCD_title").html(_T('_iso_create','step3'));	
			
			$("#isoCreateDiag .close").hide();
			
			clear_iso_create_info();
		
	});
	
}



function open_tree2(path)
{	 
	//re-open tree
//			var t = $("#text_id").val();
//			var str = "";
//			var new_path = "";
//			var hdd_num=HDD_INFO_ARRAY.length;
//			
//			for(i=0;i<hdd_num;i++)
//			{
//				var hdd_info=HDD_INFO_ARRAY[i].split(":");
//				if(t.indexOf(hdd_info[0])!=-1)
//				{
//					str=t;
//					str=str.split(hdd_info[0]);
//					new_path=hdd_info[1] + str[1];				
//							
//				}
//			}											
			
			//__str = translate_path_to_really($("#text_id").val());								 				
			__str = $("#text_id").val();
			if (__str.substr(__str.length-1,1) == "/")
				__str = __str.substr(0,__str.length-1);
	
	
	//__file = 0;
	__file = 1; 			
	 $('#img_tree_div2').fileTree({ root: path ,cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',formname:"form_iso_create",textname:"text_id",chk:0,filetype:'all',checkbox_all:'3',function_id:'iso_create',filter:_fileName,root_path:_upIsoRootPath}, function(file) { }); 	 
         setTimeout(tree_open_2,1000);
 		//$('#img_tree_div2').fileTree_webfile({ root: '/mnt/HD' ,cmd: 'cgi_read_open_tree', script:'/cgi-bin/folder_tree.cgi',function_id:'iso_create',formname:"form_iso_create",textname:"text_id"}, function(file) { });        
}

function tree_open()
{
	//$('#img_tree_div').fileTree({ w:'open', cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',chk:1,checkbox_all:'2',function_id:'iso_create',filetype:'all',formname:"form_iso_create",textname:"text_id"}, function(file) { }); 		
	$('#img_tree_div').fileTree({ w:'open', cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',chk:1,checkbox_all:'2',function_id:'iso_create',filetype:'all'}, function(file) { }); 		
}

function tree_open_2()
{
	$('#img_tree_div2').fileTree({ w:'open', cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',chk:0,function_id:'iso_create',filetype:'all',checkbox_all:'3',formname:"form_iso_create",textname:"text_id"}, function(file) { }); 		
}

function iso_add()
{		
			//re-open tree
//			var t = $("#text_id").val();
//			var str = "";
//			var hdd_num=HDD_INFO_ARRAY.length;
//			var new_path = "";							
//			for(i=0;i<hdd_num;i++)
//			{
//				var hdd_info=HDD_INFO_ARRAY[i].split(":");
//				
//				if(t.indexOf(hdd_info[0])!=-1)
//				{
//					var str=t;
//					str=str.split(hdd_info[0]);
//					new_path=hdd_info[1] + str[1];						
//				}
//			}				
//alert("t ="+t+",new_path="+new_path);					
			var t = $("#text_id").val();
			if (t.substr(t.length-1,1) != "/")
			{				
				var index = t.lastIndexOf("/");
				if (index != -1)
				{					
					t= t.substr(0,index);
					$("#text_id").val(t);
				}			
			}
			var t = $("#settings_utilitiesIsoSelectPath_text").val();
			if (t.substr(t.length-1,1) != "/")
			{				
				var index = t.lastIndexOf("/");
				if (index != -1)
				{					
					t= t.substr(0,index);
					$("#settings_utilitiesIsoSelectPath_text").val(t);
				}			
			}

			
			__str = $("#text_id").val();
			if (__str.substr(__str.length-1,1) == "/")
				__str = __str.substr(0,__str.length-1);    
			
			$("#id_iso_wait").show();
			$("#settings_utilitiesIsoNext2_button").addClass('button_gray').css("cursor","text");										
			$("#settings_utilitiesIsoAdd_button").hide();  
			$("#settings_utilitiesIsoRemove_button").hide();  
			
				//list user selected path
			 $("#img_tree_div input:checkbox:checked[name=folder_name]").each(function(index){      	
					var flag = 0;    	    	
					var path = $(this).val();
					var sharename = $(this).attr('rel');	
					var type = $("#f_type").attr('rel');					
				
					path=path.replace(/&nbsp;/g,' ');
					path=path.replace(/&amp;/g,'&');
				
					str = "cmd=cgi_iso_create_path&source_path="+encodeURIComponent(path)+"&destination_path="+encodeURIComponent(__str)+"&type="+type;
//					alert(str);	
			//				alert(path);	
									wd_ajax({
												type:"POST",
												url:"/cgi-bin/isomount_mgr.cgi",
												data:str,
												cache:false,
												async:false,
												success:function(data){																		  					        													
//													alert("ok")
												},
												error:function(){
												}
									});		
			
							
			 });	
		 
		 
	
			iso_get_use_size();
			$("#id_iso_wait").hide();
			
			__file = 1         		
			$('#img_tree_div2').fileTree({ cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',chk:0,function_id:'iso_create',filetype:'all',checkbox_all:'3',formname:"form_iso_create",textname:"text_id"}, function(file) { }); 
			$('#img_tree_div2').fileTree({ cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',chk:0,function_id:'iso_create',filetype:'all',checkbox_all:'3',formname:"form_iso_create",textname:"text_id"}, function(file) { }); 		
			
						
			$("#img_tree_div input:checkbox:checked[name=folder_name]").each(function(index){
							$(this).attr('checked',false);				
				});
}

function del_folder()
{
				var iso_type = "Folder"
				var v = $("#settings_utilitiesIsoSelectPath_text").val();
				
				
				if (_fileName == v.substr(0,v.length-1))
				{
					jAlert( _T('_iso_create','msg12'), _T('_common','error'),"",function(){$("#settings_utilitiesIsoRemove_button").focus()});
					//alert("This folder is root, can't delete.");
					return;
				}
				

				var last_char = v.substr(v.length-1,1);
				if (last_char != "/")
				{
						iso_type = "file"
						var t = $("#text_id").val(); 										
				}
				else
				{
						var t = $("#text_id").val().substr(0,$("#text_id").val().length-1);   ////re-open tree 												
				}		
				var index = t.lastIndexOf("/");
				if (index != -1)
				{					
					t= t.substr(0,index);
				}				
											
				__str = t;			
        var str = "cmd=cgi_del&type="+iso_type+"&path="+encodeURIComponent($("#text_id").val());    

				wd_ajax({
					type:"POST",
					url:"/cgi-bin/webfile_mgr.cgi",
					data:str,
					cache:false,
					async:true,
					success:function(data){			
								
								__file = 1         		
								$('#img_tree_div2').fileTree({ cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',chk:0,function_id:'iso_create',filetype:'all',checkbox_all:'3',formname:"form_iso_create",textname:"text_id"}, function(file) { }); 
								$('#img_tree_div2').fileTree({ cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',chk:0,function_id:'iso_create',filetype:'all',checkbox_all:'3',formname:"form_iso_create",textname:"text_id"}, function(file) { }); 
								iso_get_use_size();		
					},
					error:function(){
					}
		});		
 																		
}

function iso_create_tree_dialog(form,text_id)
{
	//do_query_HD_Mapping_Info();	  
  $('#isotree_div').fileTree({ root: '/mnt/HD/' ,cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',formname:form,textname:text_id,chk:0,filetype:'all',checkbox_all:'3'}, function(file) { }); 	 

	var treeDiag_obj=$("#isotreeDiag").overlay({expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});
	treeDiag_obj.load();
	language();
	
	ui_tab("#isotreeDiag","#isotree_div ul li:eq(0) a","#settings_utilitiesIsoPathTreeOk_button");
	
	$("#settings_utilitiesIsoPathTreeOk_button").click(function(){
		treeDiag_obj.close();
		var Obj=$("#isoCreateDiag").overlay({fixed:false,oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
		Obj.load();		
		$("#isoCreateDiag.WDLabelDiag").css("left","70px").css("margin-top","-50px");		
		$("#settings_utilitiesIsoPath_button").focus();
	});
}

function iso_img_config()
{
						
    new_path=translate_path_to_really($("#settings_utilitiesIsoPath_text").val());	  
	  var str = "cmd=cgi_iso_config&f_size="+$("#id_iso_size").attr('rel')+"&f_image_name="+$("#settings_utilitiesIsoName_text").val()+"&f_image_path="+encodeURIComponent(new_path);
//  alert(str);
	  //return;
				wd_ajax({
					type:"POST",
					url:"/cgi-bin/isomount_mgr.cgi",
					data:str,
					cache:false,
					async:true,
					success:function(xml){			
								  	   var status = $(xml).find("status").text();	
								  	   if (status == "ok")
								  	   {
								  	   	
								  	   			_fileName = $(xml).find("name").text();	
								  	   			_upIsoRootPath = $(xml).find("path").text();		
								 					open_tree2(_upIsoRootPath);
								 					
								 					//$(".dialog_content").height("320px");	
			//$(".WDLabelBodyDialogue").height("300px");			
			//$(".WDLabelDiag").height("480px");
													
								  	   		$("#iso_create_wizard_step2").show();
													$("#iso_create_wizard_step0").hide();
													$("#iso_create_wizard_step1").hide();	
														adjust_dialog_size("#isoCreateDiag","870","580")												
													$("#isoCreateDiag.WDLabelDiag").css("left","70px").css("margin-top","-100px");												
													iso_get_use_size();	
													setTimeout(tree_open,2000);
													
													//show default path
													setTimeout(set_path,1000);				
													//$("#isoCreateDiag").css("height","400px");
								  	   		return 0;
								  	   }	
								  	   else if (status == "error")
								  	   {	
	                                                                                jAlert(_T('_iso_create','msg11'), _T('_common','error'));					
													$("#iso_create_wizard_step1").show();
													$("#iso_create_wizard_step0").hide();
													$("#iso_create_wizard_step2").hide();		   
														adjust_dialog_size("#isoCreateDiag","","500")	   
								  	   		return -1;
								  	   }	
								  	   else
								  	   {
								  	   	//  jAlert("Hard disk space not enough.", _T('_common','error'));													
								  	   		jAlert(_T('_iso_create','msg10'), _T('_common','error'));
													$("#iso_create_wizard_step1").show();
													$("#iso_create_wizard_step0").hide();
													$("#iso_create_wizard_step2").hide();		   
														adjust_dialog_size("#isoCreateDiag","","500")	   
								  	   		return -1;
								  	  }		
									
					},
					error:function(){
					}
		});		
}
function iso_img_config_modify()
{
	var str = "cmd=cgi_iso_modify_untar&fileName="+_fileName+"&upIsoRootPath="+_upIsoRootPath;
//	alert(str);
		wd_ajax({
												type:"POST",
												url:"/cgi-bin/isomount_mgr.cgi",
												data:str,
												cache:false,
												async:true,
												success:function(xml){														
//														  var status = $(xml).find("status").text();	
//														  alert(status);
//														  if (status == "ok")
														  {														  														  															  		
														  			open_tree2(_upIsoRootPath);
														  			
														  			//$(".dialog_content").height("320px");	
			//$(".WDLabelBodyDialogue").height("300px");			
			//$(".WDLabelDiag").height("480px");
																		
													  	   		$("#iso_create_wizard_step2").show();
																		$("#iso_create_wizard_step0").hide();
																		$("#iso_create_wizard_step1").hide();	
																		iso_get_use_size();	        				
																		//show default path																				
																		setTimeout(set_path,1000);																												
																		//$("#isoCreateDiag").css("height","400px");																							
														  			
														  	
														  }
//														  else
//												  	  {	
//												  	  		jAlert("Create iso configuration fail.", _T('_common','error'));													
//																	$("#iso_create_wizard_step1").show();
//																	$("#iso_create_wizard_step0").hide();
//																	$("#iso_create_wizard_step2").hide();		   
//												  	   		return -1;
//												  	   }		
												},
												error:function(){
												}
									});		
}
function set_path()
{
	$("#settings_utilitiesIsoSelectPath_text").val(_fileName+"/");
	//$("#text_id").val($("#text_id").val()+"/"+_fileName+"/");		
}
function iso_img_config_load()
{

	var t = $("#settings_utilitiesIsoPath_text").val();
		
		var str = "";
		var hdd_num=HDD_INFO_ARRAY.length;
			
		for(i=0;i<hdd_num;i++)
		{
			var hdd_info=HDD_INFO_ARRAY[i].split(":");
			
			if(t.indexOf(hdd_info[0])!=-1)
			{
				var str=t;
				str=str.split(hdd_info[0]);
				var new_path=hdd_info[1] + str[1];						
			}												
		}
						
	  new_path=new_path.replace(/&nbsp;/g,' ');     
    new_path=new_path.replace(/&amp;/g,'&');      
	
	var grid = $("#iso_img_tb");
	var iso_index = parseInt($('.trSelected td:eq(0) div',grid).html(),10) - 1;				
				
	//var str = "cmd=cgi_iso_load_untar&index="+iso_index+"&size="+$("#f_size").val()+"&path="+new_path+"&name="+$("#f_image_name").val();
	var str = "cmd=cgi_iso_load_untar&index="+iso_index+"&size="+$("#id_iso_size").attr('rel')+"&path="+new_path+"&name="+$("#settings_utilitiesIsoName_text").val();
//alert(str);	
		wd_ajax({
												type:"POST",
												url:"/cgi-bin/isomount_mgr.cgi",
												data:str,
												cache:false,
												async:true,
												success:function(xml){														
														  var status = $(xml).find("status").text();	
														  if (status == "ok")
														  {														  	
														  			_fileName = $(xml).find("name").text();	
								  	   							_upIsoRootPath = $(xml).find("path").text();		
														  															  		
														  			open_tree2(_upIsoRootPath);
														  			//$(".dialog_content").height("320px");	
			//$(".WDLabelBodyDialogue").height("300px");			
			//$(".WDLabelDiag").height("480px");	
													  	   		$("#iso_create_wizard_step2").show();
																		$("#iso_create_wizard_step0").hide();
																		$("#iso_create_wizard_step1").hide();		
																		iso_get_use_size();  
																		
																		//show default path
																		setTimeout(set_path,1000);				    
																		//$("#isoCreateDiag").css("height","400px");  
														  }
														  else
											  	   {	
											  	  	//	jAlert("Create iso configuration fail.", _T('_common','error'));													
											  	  		jAlert(_T('_iso_create','msg11'), _T('_common','error'));													
																$("#iso_create_wizard_step1").show();
																$("#iso_create_wizard_step0").hide();
																$("#iso_create_wizard_step2").hide();		   
											  	   		return -1;
											  	   }		
												},
												error:function(){
												}
									});		
}
function iso_img_settings()
{					
						//$("#iso_next_button_3").addClass('button_gray').css("cursor","text");
						$("#settings_utilitiesIsoSave_button").hide();
													
					  var str = "cmd=cgi_iso_create_image&fileName="+_fileName+"&upIsoRootPath="+_upIsoRootPath;
//					  alert(str)
//					  return;
						wd_ajax({
												type:"POST",
												url:"/cgi-bin/isomount_mgr.cgi",
												data:str,
												cache:false,
												async:true,
												success:function(data){	
//													if (data == "0")
//													{			
//															$("#iso_parogressbar").progressbar({
//															value: 0
//														});
//														INTERNAL_FMT_ProgressBar_INIT(0,"iso");														
//														iso_get_percentage();																							
//													}
//													else
//													{
//														alert("Error. Please check hard disk size.");
//														$("#iso_next_button_3").removeClass('button_gray').css("cursor","text");
//													}		
												},
												error:function(){
												}
									});	
									
									
										$("#iso_parogressbar").progressbar({
															value: 0
														});
														INTERNAL_FMT_ProgressBar_INIT(0,"iso");														
														setTimeout(iso_get_percentage,3000);							
											
}

function iso_img_del()
{
		wd_ajax({
					type:"POST",
					url:"/cgi-bin/webfile_mgr.cgi",
					data:str,
					cache:false,
					async:true,
					success:function(data){			
								  					        
								__file = 0         		
								$('#img_tree_div2').fileTree({ cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',chk:0}, function(file) { }); 		
								$('#img_tree_div2').fileTree({ cmd: 'cgi_open_tree', script:'/cgi-bin/folder_tree.cgi',chk:0}, function(file) { }); 		
					},
					error:function(){
						
												}
									});		
}
function iso_get_use_size()
{
	var str = "cmd=cgi_iso_size&fileName="+_fileName+"&upIsoRootPath="+_upIsoRootPath;
	//alert("get size = "+str);
	//return;
		wd_ajax({
					type:"POST",
					url:"/cgi-bin/isomount_mgr.cgi",
					data:str,
					cache:false,
					async:true,
					success:function(data){											  					     								  					        								
								$("#settings_utilitiesIsoUsedSpace_value").html(data);
								var v = data;
								var v_total = $("#settings_utilitiesIsoTotalSpace_value").html()
								var new_v,new_v_total
								v = v.substr(0,v.length-1)
							
								var last_char_v = data.substr(data.length-1,1);
								if (last_char_v == "T") 
									{new_v = v*1000*1000*1000*1000}
								if (last_char_v == "G") 
									{new_v = v*1000*1000*1000}
								else if (last_char_v == "M") 
									{new_v = v*1000*1000}
								else
									{new_v  = v*1000}
								
								
								var last_char_v_total = v_total.substr(v_total.length-1,1);
								
								v_total = v_total.substr(0,v_total.length-1) 
								
								
								if (last_char_v_total == "G")
								{new_v_total = v_total*1000*1000*1000;}																	
								else if (last_char_v_total == "M")
									{new_v_total = v_total*1000*1000;}
								else
									new_v_total = v_total*1000;
									
var msg = "new_v = "+new_v;
msg = msg+ "\nnew_v_total = "+new_v_total;
msg = msg+ "\nv_total = "+v_total;
msg = msg+ "\nv = "+v;


//alert(msg);
								
								if (new_v > new_v_total)
								{
									//alert("over limit size");				
									jAlert(_T('_iso_create','msg9'), _T('_common','error'));														
									$("#settings_utilitiesIsoUsedSpace_value").addClass('iso_warning');										
									$("#settings_utilitiesIsoNext2_button").addClass('button_gray').css("cursor","text");										
									$("#settings_utilitiesIsoAdd_button").hide();
									$("#settings_utilitiesIsoRemove_button").show();    
								}	
								else 
								{
									$("#settings_utilitiesIsoUsedSpace_value").removeClass('iso_warning');										
									$("#settings_utilitiesIsoNext2_button").removeClass('button_gray').css("cursor","pointer");
									$("#settings_utilitiesIsoAdd_button").show();    
									$("#settings_utilitiesIsoRemove_button").show();
								}																	
					},
					error:function(){
						
												}
	});		
}
function iso_get_name()
{
	ISO_NAME = new Array();
	var str = "cmd=cgi_iso_name"
		wd_ajax({
					type:"POST",
					url:"/cgi-bin/isomount_mgr.cgi",
					data:str,
					cache:false,
					async:false,
					success:function(xml){	
								
									$(xml).find('item').each(function(){
											NOW_MAX_NUM = $(this).find('num').text();																				
									});		
									if (NOW_MAX_NUM >=MAX_NUM)
									{				
														//$("#iso_msg").html("The maximum number of iso image been reached. Only use delete or modify function.");
														$("#iso_msg").html(_T('_iso_create','msg15'));
														$("#iso_img_load").removeClass("button").addClass("button_display");														
									}
									else
									{
														$("#iso_msg").html("");
														$("#iso_img_modify").removeClass("button_display").addClass("button");
														$("#iso_img_load").removeClass("button_display").addClass("button");
														$("#iso_img_delete").removeClass("button_display").addClass("button");	
									}	
									
																									  					     								  					        								
									$(xml).find('iso').each(function(){
										var v = $(this).find('name').text();												
											ISO_NAME.push(v);
									});		
																			
																			
									
					},
					error:function(){
						
												}
	});		
}

function iso_get_percentage(flag)
{	
//	if (flag == 1) _init = 0;  //�������������D
	  				var str = "cmd=cgi_iso_percentage&fileName="+_fileName+"&upIsoRootPath="+_upIsoRootPath;	  				  						
						wd_ajax({
												type:"POST",
												url:"/cgi-bin/isomount_mgr.cgi",
												data:str,
												cache:false,
												async:true,
												success:function(data){																																		
													if (flag == 1 && (parseInt(data,10) == -1 ||  data == -1)) 
													{
														clear_iso_create_info();										
														return ;				
													}
													
													if (flag == 1 && _init == 0)
													{						
														__com = SHARE_ISO_IMG_NEW;
														init_iso_create_dialog();																											
														  var Obj=$("#isoCreateDiag").overlay({fixed:false,oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false});		
															Obj.load();	
															$("#isoCreateDiag.WDLabelDiag").css("left","70px").css("margin-top","-50px");		
															$(".exit").click(function(){
                                                                                                                            Obj.close();  
															});
																													
														  $("#iso_create_wizard_step0").hide();	
															$("#iso_create_wizard_step1").hide();
															$("#iso_create_wizard_step2").hide();
															$("#iso_create_wizard_step3").show();		
														
//															$("#isoCD_title").html(ISO_STEP3);
															$("#iso_parogressbar").progressbar({
															value: 0
														});
														INTERNAL_FMT_ProgressBar_INIT(0,"iso");														
														iso_get_percentage();			
														
															//$("#iso_next_button_3").addClass('button_gray').css("cursor","text");		
															$("#iso_next_button_3").hide();
															
																		
															$("#iso_data").removeClass("disable").addClass("enable");
															$("#iso_icon").removeClass("arrow_right").addClass("arrow_down");				
															$("#share_data").removeClass("enable").addClass("disable");
															$("#share_icon").removeClass("arrow_down").addClass("arrow_right");									
															$('#my_scroll').jScrollPane({showArrows:true, scrollbarWidth: 15, arrowSize: 16});	

	
//																$("#iso_msg").html("Creating ISO image, this may take a new minutes, please wait.");
//																$("#iso_img_modify").removeClass("button").addClass("button_display");
//																$("#iso_img_load").removeClass("button").addClass("button_display");
//																$("#iso_img_delete").removeClass("button").addClass("button_display");		
																get_iso_create_info();
																_init = 1;	
																$("#isoCreateDiag .close").hide();
													}																		
												
													
													if (isNaN(parseInt(data,10)) == true)
													{
														//alert("Create ISO image fail.");
														jAlert(_T('_iso_create','msg6'), _T('_common','error'));	
														//jAlert("Create ISO image fail.", _T('_common','error'));																	
														$("#settings_utilitiesIsoSave_button").show();
														$("#settings_utilitiesIsoSave_button").focus();
														$("#settings_utilitiesIsoSave_button").text( _T('_button','close'));
														
														//$("#iso_exit_button_3").show();
														return;
													}
													
													if (parseInt(data,10) < 0  || data == -1)
													{
														//alert("Create ISO image fail.");
															jAlert(_T('_iso_create','msg6'), _T('_common','error'));	
														//	jAlert("Create ISO image fail."), _T('_common','error'));			
														//$("#iso_next_button_3").removeClass('button_gray').css("cursor","text");	
														$("#settings_utilitiesIsoSave_button").show();
														$("#settings_utilitiesIsoSave_button").focus();
														$("#settings_utilitiesIsoSave_button").text(_T('_button','close'));
														//$("#iso_exit_button_3").show();														
														return;
													}										
															
													//var bar_desc = "Creating ISO images, please wait some minutes."
													var bar_desc = _T('_iso_create','msg8')
													$("#iso_state").html("&nbsp;" + bar_desc);
													$("#settings_utilitiesIsoPercentage_value").html("&nbsp;" + data + "%");
													
													$("#iso_parogressbar").progressbar('option', 'value', parseInt(data,10));
													//$("#iso_parogressbar").progressBar(parseInt(data,10));													
													//$("#"+v+"_"+seq).progressBar(parseInt(percent,10));														
																															
													if (parseInt(data,10)<100)
														setTimeout(iso_get_percentage,2000);
														
													else if (parseInt(data,10) == 100)
													{
														//alert("100")
														//$("#iso_next_button_3").removeClass('button_gray').css("cursor","text");														
														$("#settings_utilitiesIsoSave_button").show();
														$("#settings_utilitiesIsoSave_button").focus();
														$("#id_chk_mount").show();
														//$("#iso_exit_button_3").show();
														$("#isoCreateDiag .close").show();														
														$("#iso_msg").html("");
														$("#iso_img_modify").removeClass("button_display").addClass("button");
														$("#iso_img_load").removeClass("button_display").addClass("button");
														$("#iso_img_delete").removeClass("button_display").addClass("button");
														return;	
													}		
										
												},
												error:function(){
												}
									});		
}

function chk_step1()
{
		if ($("#settings_utilitiesIsoPath_text").val() == "")
		{ 
			//Pleae input path.
			jAlert(_T('_p2p','msg9'), _T('_common','error'),"",function(){$("#settings_utilitiesIsoPath_button").focus()});			
			return 1
		}

		if (name_check($("#settings_utilitiesIsoName_text").val()) == 1)
		{
			//jAlert('This job name does not accepted . Please try again.', 'Error');
			jAlert(_T('_iso_create','msg13'), _T('_common','error'),"",function(){$("#settings_utilitiesIsoName_text").focus()});
			return 1;
		}
		if ($("#settings_utilitiesIsoName_text").val()=="") //please input image name
		{			
			jAlert(_T('_iso_create','msg4'), _T('_common','error'),"",function(){$("#settings_utilitiesIsoName_text").focus()});
			return 1;
		}	
		if ($("#settings_utilitiesIsoName_text").val().indexOf(" ") != -1) //find the blank space
		{			
			jAlert(_T('_iso_create','msg2'), _T('_common','error'),"",function(){$("#settings_utilitiesIsoName_text").focus()});
			return 1;
		}	
		
		if (ISO_SET_TYPE == ISO_CREATE || ISO_SET_TYPE == ISO_LOAD)
		{			
			for (var i = 0;i<ISO_NAME.length;i++)
			{
				if( ISO_NAME[i] == $("#settings_utilitiesIsoName_text").val())
				{
					//alert("The iso name is repeat, please modify it.")
					jAlert(_T('_iso_create','msg5'), _T('_common','error'),"",function(){$("#settings_utilitiesIsoName_text").focus()});
					return 1;
				}
				
			}		
		}				
		
		if (chk_img_name() == 1)
		{
				jAlert(_T('_iso_create','msg5'), _T('_common','error'),"",function(){$("#settings_utilitiesIsoName_text").focus()});
					return 1;
		}
		
		//var v = $("#f_size").val();			
		var v = $("#id_iso_size").attr('rel');		
		
		if (v == 1)
		{
			$("#settings_utilitiesIsoTotalSpace_value").html("650M")
		}
		else if (v == 2)
		{
			$("#settings_utilitiesIsoTotalSpace_value").html("4.7G")
		}	
		else if (v == 3)
		{
			$("#settings_utilitiesIsoTotalSpace_value").html("8.5G")
		}	
	
		return 0;
}

function chk_step2()
{
	var v = $("#settings_utilitiesIsoSelectPath_text").val();
	if (v == "")
	{
	 //alert("Please choice folder.");
	 jAlert(_T('_iso_create','msg3'), _T('_common','error'),"",function(){$("#settings_utilitiesIsoPath_button").focus()});
	 return -1;
	} 
	var last_char = v.substr(v.length-1,1);

	if (last_char != "/")
	{
		//alert("Please choice folder.");
		jAlert(_T('_iso_create','msg3'), _T('_common','error'),"",function(){$("#settings_utilitiesIsoPath_button").focus()});
		return -1;
	}
	return 0;
	
}

function chk_img_name()
{
	var flag = 0;
	$("#settings_utilitiesIsoPath_text").val()
	$("#settings_utilitiesIsoName_text").val()
	
  var new_path = translate_path_to_really($("#settings_utilitiesIsoPath_text").val());
    
	var str = "cmd=cgi_chk_img_name&path="+ encodeURIComponent(new_path) +"&name="+$("#settings_utilitiesIsoName_text").val()
	wd_ajax({
					type:"POST",
					url:"/cgi-bin/isomount_mgr.cgi",
					data:str,
					cache:false,
					async:false,
					success:function(data){	
						//alert(data);		
								if (data == "1")
								{								
									 flag = 1;									 
								}											  					        																												
					},
					error:function(){
					}
		});		
		
	return flag;
}

function init_iso()
{
	$("#settings_utilitiesIsoPath_text").val("");
	$("#settings_utilitiesIsoName_text").val("");
	$("#text_id").val("");
	$("#settings_utilitiesIsoSelectPath_text").val("");
	
	//var v = $("#f_size").val();		
	var v = $("#id_iso_size").attr('rel');			
	if (v == 1)
	{
		$("#settings_utilitiesIsoTotalSpace_value").html("650M")
	}
	else if (v == 2)
	{
		$("#settings_utilitiesIsoTotalSpace_value").html("4.7G")
	}	
	else if (v == 3)
	{
		$("#settings_utilitiesIsoTotalSpace_value").html("8.5G")
	}	
	
	if (ISO_SET_TYPE == ISO_CREATE)
	{					
			$("#f_size").attr("disabled",false);    										
			$("#settings_utilitiesIsoPath_text").attr("disabled",false);  
			$("#settings_utilitiesIsoName_text").attr("disabled",false);    
			$("#settings_utilitiesIsoPath_button").attr("disabled",false);    
			 
	}
	else if (ISO_SET_TYPE == ISO_MODIFY)
	{
			$("#f_size").attr("disabled",true);    
			$("#settings_utilitiesIsoPath_text").attr("disabled",true);  
			$("#settings_utilitiesIsoName_text").attr("disabled",true);  
			$("#settings_utilitiesIsoPath_button").attr("disabled",true);
	}
	else if (ISO_SET_TYPE == ISO_LOAD)
	{
			$("#f_size").attr("disabled",false);    
			$("#settings_utilitiesIsoPath_text").attr("disabled",false);  
			$("#settings_utilitiesIsoName_text").attr("disabled",false);   
			$("#settings_utilitiesIsoPath_button").attr("disabled",false);
	}
}

function chk_hd_size()
{
	var flag = 0;
		
	var new_path = translate_path_to_really($("#settings_utilitiesIsoPath_text").val());  
			
    var v = $("#id_iso_size").attr('rel');		
	var str = "cmd=cgi_chk_hd_size&path="+ encodeURIComponent(new_path) +"&size="+v
	wd_ajax({
					type:"POST",
					url:"/cgi-bin/isomount_mgr.cgi",
					data:str,
					cache:false,
					async:false,
					success:function(data){	
						//alert(data);		
								if (data == "error")
								{
									 jAlert(_T('_iso_create','msg10'), _T('_common','error'));	
									 flag = 1;									 
								}											  					        																												
					},
					error:function(){
					}
		});		
		
		return flag;
}

function chk_iso_mount(v)
{
	

	
	if (v == true)
	{ 
			$("#iso_exit_button_3").show();
			$("#iso_next_button_3").show();
			$("#settings_utilitiesIsoSave_button").hide();
			
	}	
	else	
		{ 
			$("#iso_exit_button_3").hide();
			$("#iso_next_button_3").hide();
			$("#settings_utilitiesIsoSave_button").show();
		}
}

function get_iso_create_info()
{
		wd_ajax({
				type:"POST",
				url:"/cgi-bin/isomount_mgr.cgi",
				data:"cmd=get_iso_create_info",
				cache:false,
				async:true,
				success:function(xml){																		  					        													
					var name = $(xml).find("name").text();
					var path = $(xml).find("path").text();											
					var save_path = $(xml).find("save_path").text();
						_fileName = $(xml).find("name").text();	
						_upIsoRootPath = $(xml).find("path").text();										  	  						  	  							  	  								 								  	  								  							
						$("#settings_utilitiesIsoPath_text").val(chg_path(save_path));
						$("#settings_utilitiesIsoName_text").val(_fileName);
																  	  		
					},
					error:function(){
					}
		});		
}

function clear_iso_create_info()
{ 
	var str = "cmd=cgi_clear_iso_create&fileName="+_fileName+"&upIsoRootPath="+_upIsoRootPath;
	
		wd_ajax({
				type:"POST",
				url:"/cgi-bin/isomount_mgr.cgi",
				data:str,
				cache:false,
				async:true,
				success:function(data){																		  					        																	
					},
					error:function(){
					}
		});		
}

function INTERNAL_FMT_ProgressBar_INIT(bar,id_name)
{			
	var progress_bar = "#"+id_name+"_parogressbar";
	var progress_state = "#"+id_name+"_state";
	var progress_desc = "#"+id_name+"_desc";
	
	$(progress_bar).progressbar( "destroy" );
	$(progress_bar).progressbar({value: bar});
		
	var msg = _T('_format','initializing') + "...";	//Text:Initializing
	
	if ( 0 == parseInt(bar))
		$(progress_state).html(msg);
		
	$(progress_desc).html("&nbsp;" + bar +"%");
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