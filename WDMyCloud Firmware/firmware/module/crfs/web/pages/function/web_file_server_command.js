var HDD_INFO_ARRAY = new Array();
var __file = 0;
var __chkflag = 0; //for show check box  1:show  0:not
var __read;
var _INIT_UPLOAD = 0;
var _ERROR_FLAG = 0;
var _NO_TIMEOUT = 0;
var COPY_MOVE_MODE = 0;
function copy() {		
		__read = mainFrame.get_read();
		if (__read == "yes") {
			jAlert(_T('_wfs', 'msg7'), _T('_common', 'error'));
			return;
		}	
		stop_web_timeout(true);
		open_folder_selecter({
		title: _T('_remote_backup', 'msg22'),
		device: "HDD", //HDD, USB, ..., ALL -> for get HDD/USB mapping
		root: '/mnt/HD',
		cmd: 'cgi_generic_open_tree',
		script: '/cgi-bin/folder_tree.cgi',
		function_id: 'webfile',
		effect: 'no_son',
		formname: 'generic',
		textname: null,
		filetype: 'all',
		checkbox_all: 2,
		showfile: 0,
		chkflag: 1, //for show check box, 1:show, 0:not		
		single_select: true,
		afterOK: function() {
			COPY_MOVE_MODE = $('#f_file_method').attr('rel');
			dialog_copy_init();
			$("#folder_selector_option").empty();			
			google_analytics_log('webfile-edit-num','');
		},
		afterCancel: function() {
			$("#folder_selector_option").empty();			
		},
		callback:function(){
			var html = _T('_wfs','file_desc')+'<br><br>';
			html += '	<div id="f_file_method"><button id="Apps_webfileviewerOverwrite_button" class="left_button" value="0">'+_T('_iso_create','overwrite')+'</button><button id="Apps_webfileviewerSkip_button" class="left_button" value="1">'+_T('_button','Skip')+'</button><button id="Apps_webfileviewerKeep_button" class="right_button" value="2">'+_T('_wfs','msg18')+'</div>';
			html += '<div style="margin-top:30px;margin-bottom:15px">'+_T('_wfs','destination')+':</div>';
			
			$("#folder_selector_option").html(html);
			SetFileMode('#f_file_method',0,"");
		}
	});		
	$("#sDiag_rename").hide();	
	$("#sDiag_upload").hide();
	$("#sDiag_properties").hide();
	$("#sDiag_create_dir").hide();
	$("#sDiag_zip_tree").hide();
	$("#sDiag_tree").show();	
}

function move() {
	__read = mainFrame.get_read();
	if (__read == "yes") {
		jAlert(_T('_wfs', 'msg7'), _T('_common', 'error'));
		return;
	}
	stop_web_timeout(true);
	open_folder_selecter({
		title: _T('_remote_backup', 'msg22'),
		device: "HDD", //HDD, USB, ..., ALL -> for get HDD/USB mapping
		root: '/mnt/HD',
		cmd: 'cgi_generic_open_tree',
		script: '/cgi-bin/folder_tree.cgi',
		function_id: 'webfile',
		effect: 'no_son',
		formname: 'generic',
		textname: null,
		filetype: 'all',
		checkbox_all: 2,
		showfile: 0,
		chkflag: 1, //for show check box, 1:show, 0:not		
		single_select: true,
		afterOK: function() {
			COPY_MOVE_MODE = $('#f_file_method').attr('rel');
			dialog_move_init();
			$("#folder_selector_option").empty();				
			google_analytics_log('webfile-edit-num','');		
		},
		afterCancel: function() {
			$("#folder_selector_option").empty();
		},
		callback:function(){
			var html = _T('_wfs','file_desc')+'<br><br>';
			html += '	<div id="f_file_method"><button id="Apps_webfileviewerOverwrite_button" class="left_button" value="0">'+_T('_iso_create','overwrite')+'</button><button id="Apps_webfileviewerSkip_button" class="left_button" value="1">'+_T('_button','Skip')+'</button><button id="Apps_webfileviewerKeep_button" class="right_button" value="2">'+_T('_wfs','msg18')+'</div>';
			html += '<div style="margin-top:30px;margin-bottom:15px">'+_T('_wfs','destination')+':</div>';
			
			$("#folder_selector_option").html(html);
			SetFileMode('#f_file_method',0,"");
		}
	});
	$("#sDiag_rename").hide();
	$("#sDiag_tree").hide();
	$("#sDiag_upload").hide();
	$("#sDiag_properties").hide();
	$("#sDiag_create_dir").hide();	
	$("#sDiag_zip_tree").hide();	
}

function rename() {
	__read = mainFrame.get_read();
	if (__read == "yes") {
		jAlert(_T('_wfs', 'msg7'), _T('_common', 'error'));
		return;
	}

	var len = mainFrame.$('.trSelected', "#flex1").length;
	if (len == 0) {
		jAlert(_T('_wfs', 'msg6'), _T('_common', 'error'));
		return;
	}

	var name = mainFrame.$('.trSelected td:eq(0) span:eq(2)', "#flex1").html();
	name = name.replace(/&nbsp;/g, ' ');
	name = name.replace(/&amp;/g, '&');

	$("#Apps_webfileviewerRename_text").val(name);
	$("input:text").inputReset();		
	

	var over = $("#shareDiag").overlay({
		oneInstance: false,
		expose: '#000',
		api: true,
		closeOnClick: false,
		closeOnEsc: false,
		speed: 0
	});
	over.load();
	//$("#shareDiag_title").removeClass("WDLabelHeaderDialogueHDDIcon").addClass("WDLabelHeaderDialogueModifyIcon")

	$("#sDiag_rename").show();	
	$("#sDiag_upload").hide();	
	$("#sDiag_properties").hide();
	$("#sDiag_create_dir").hide();
	$("#sDiag_zip_tree").hide();
	$("#shareDiag_title").html(_T('_wfs', 'rename'));
	
	ui_tab("#shareDiag","#Apps_webfileviewerRename_text","#Apps_webfileviewerRenameSave_button");
}

function create() {
	__read = mainFrame.get_read();
	if (__read == "yes") {
		jAlert(_T('_wfs', 'msg7'), _T('_common', 'error'));
		return;
	}
	
	$("#Apps_webfileviewerCreate_text").val("");
		$("input:text").inputReset();		
	

	var over = $("#shareDiag").overlay({
		oneInstance: false,
		expose: '#000',
		api: true,
		closeOnClick: false,
		closeOnEsc: false,
		speed: 0
	});
	over.load();
	//$("#shareDiag_title").removeClass("WDLabelHeaderDialogueHDDIcon").addClass("WDLabelHeaderDialogueModifyIcon")

	$("#sDiag_rename").hide();	
	$("#sDiag_upload").hide();	
	$("#sDiag_properties").hide();
	$("#sDiag_create_dir").show();
	$("#sDiag_zip_tree").hide();
	$("#shareDiag_title").html(_T('_button', 'create'));
	
	ui_tab("#shareDiag","#Apps_webfileviewerCreate_text","#Apps_webfileviewerCreateSave_button");
	google_analytics_log('webfile-edit-num','');
}
function add_zip() {
	__read = mainFrame.get_read();
	if (__read == "yes") {
		jAlert(_T('_wfs', 'msg7'), _T('_common', 'error'));
		return;
	}


	var name = mainFrame.$('.trSelected td:eq(0) span:eq(2)', "#flex1").html();
	var path = mainFrame.$('.trSelected span', "#flex1").html();
	var type = mainFrame.$('.trSelected td:eq(2) div', "#flex1").html();
	var index = path.lastIndexOf("/");
	var path1 = path.substr(0, index);


	var over = $("#shareDiag").overlay({
		oneInstance: false,
		expose: '#000',
		api: true,
		closeOnClick: false,
		closeOnEsc: false,
		speed: 0
	});
	over.load();

	do_query_HD_Mapping_Info();
	__file = 1;
	__chkflag = 1; //for show check box	1:show	0:not

	$('#tree_container_zip').fileTree({
		function_id: 'webfile',
		root: '/mnt/HD',
		checkbox_all: 3,
		cmd: 'cgi_generic_open_tree',
		script: '/cgi-bin/folder_tree.cgi',
		effect: 'no_son',
		formname: 'form',
		textname: 'text_id',
		function_id: 'zip',
		filetype: 'zip',
		checkbox_all: '3'
	}, function (file) {});


	$("#sDiag_rename").hide();	
	$("#sDiag_upload").hide();
	$("#sDiag_properties").hide();
	$("#sDiag_create_dir").hide();	
	$("#sDiag_zip_tree").show();

	$("#shareDiag_title").html(_T('_wfs', 'select_zip_file'));
}


function upload() {
	__read = mainFrame.get_read();
	if (__read == "yes") {
		jAlert(_T('_wfs', 'msg7'), _T('_common', 'error'));
		return;
	}


	var over = $("#shareDiag").overlay({
		oneInstance: false,
		expose: '#000',
		api: true,
		closeOnClick: false,
		closeOnEsc: false,
		speed: 0,
		onBeforeClose: function () {
			$("#shareDiag_title").removeClass("WDLabelHeaderDialogueWebFileViewerIcon").addClass("WDLabelHeaderDialogueFolderIcon")

		}
	});
	over.load();

	stop_web_timeout(true);
	//	document.form_upload.fileToUpload.value = "";

	$("#shareDiag_title").addClass("WDLabelHeaderDialogueWebFileViewerIcon").removeClass("WDLabelHeaderDialogueFolderIcon")

	$("#sDiag_upload").show();
	$("#sDiag_rename").hide();	
	$("#sDiag_properties").hide();
	$("#sDiag_create_dir").hide();
	$("#sDiag_zip_tree").hide();
	$("#shareDiag_title").html(_T('_wfs', 'upload'));

	init_upload();

	$('#upload_scroll').jScrollPane();

	if (_ERROR_FLAG == 0) {
		$("#error_msg").html(_T('_wfs', 'msg9')); //Can't use this function, the browser does not support Flash Player.
		$("#Apps_webfileviewerUploadUpload_button").hide();
		$("#a_upload_cancel").hide();
		$("#i_wfs").hide();
	}
}

function rename_cancel() {
	//init_dialog_style();
}

function properties() {
	
	var over = $("#shareDiag").overlay({
		oneInstance: false,
		expose: '#000',
		api: true,
		closeOnClick: false,
		closeOnEsc: false,
		speed: 0
	});
	over.load();
	$("#sDiag_properties").show();
	$("#sDiag_upload").hide();
	$("#sDiag_rename").hide();		
	$("#sDiag_create_dir").hide();
	$("#sDiag_zip_tree").hide();

	$("#shareDiag_title").html(_T('_wfs', 'properties'));

	var name = mainFrame.$('.trSelected td:eq(0) span:eq(2)', "#flex1").html();
	var path = mainFrame.$('.trSelected span', "#flex1").html();
	var type = mainFrame.$('.trSelected td:eq(2) div', "#flex1").html();

	path = path.replace(/&nbsp;/g, ' ');
	path = path.replace(/&amp;/g, '&');

	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/webfile_mgr.cgi",
		data: "cmd=cgi_get_properties&path=" + encodeURIComponent(path),
		dataType: "xml",
		success: function (xml) {
			var r = _T('_wfs', 'read');
			var w = _T('_wfs', 'write');
			var e = _T('_wfs', 'execute');
			$(xml).find('status').each(function () {

				var change_time = $(this).find('change_time').text();
				var modify_time = $(this).find('modify_time').text();
				var access_time = $(this).find('access_time').text();
				var owner = $(this).find('owner').text();
				var group = $(this).find('group').text();
				var permission = $(this).find('permission').text();
				$("#p_name").html(name);
				$("#p_path").html(translate_path_to_display(path));
				$("#p_type").html(type);

				$("#p_change_time").html(change_time);
				$("#p_modify_time").html(modify_time);
				$("#p_access_time").html(access_time);

				//rwx
				var owner_r = permission.substr(0, 1);
				var owner_w = permission.substr(1, 1);
				var owner_x = permission.substr(2, 1);


				if (owner_r == "r") {owner_r = "<input id='owner_r' type='checkbox'  checked='checked' disabled='' >" +"</td><td>" + r} else {owner_r = "<input id='owner_r' type='checkbox' disabled='' >" +"</td><td>" + r} ;
				if (owner_w == "w") {owner_w = "<input id='owner_w' type='checkbox' checked='checked' disabled=''>" +"</td><td>" + w} else {owner_w = "<input id='owner_w' type='checkbox' disabled='' >" +"</td><td>" + w};
				if (owner_x == "x") {owner_x = "<input id='owner_x' type='checkbox' checked='checked' disabled=''>" +"</td><td>" + e} else {owner_x = "<input id='owner_x' type='checkbox' disabled='' >" +"</td><td>" + e};

				$("#p_permission_owner").html("<table><tr><td>" + owner_r + "</td><td>" + owner_w + "</td><td>" + owner_x + "</td></tr></table>");

				var owner_r = permission.substr(3, 1);
				var owner_w = permission.substr(4, 1);
				var owner_x = permission.substr(5, 1);

				if (owner_r == "r") {owner_r = "<input id='user_r' type='checkbox' checked='checked' disabled=''>" +"</td><td>" +r} else {owner_r = "<input id='user_r' type='checkbox' disabled='' >" +"</td><td>" + r} ;
				if (owner_w == "w") {owner_w = "<input id='user_w' type='checkbox' checked='checked' disabled=''>" + "</td><td>"+w} else {owner_w = "<input id='user_w' type='checkbox' disabled='' >" +"</td><td>" + w};
				if (owner_x == "x") {owner_x = "<input id='user_x' type='checkbox' checked='checked' disabled=''>" +"</td><td>" +e} else {owner_x = "<input id='user_x' type='checkbox' disabled='' >" +"</td><td>" + e};	

				$("#p_permission_user_group").html("<table><tr><td>" + owner_r + "</td><td>" + owner_w + "</td><td>" + owner_x + "</td></tr></table>");
				//$("#p_permission_owner").html(permission.substr(0,3));

				var owner_r = permission.substr(6, 1);
				var owner_w = permission.substr(7, 1);
				var owner_x = permission.substr(8, 1);

				if (owner_r == "r") {owner_r = "<input id='other_r' type='checkbox' checked='checked' disabled='' >" + "</td><td>"+r} else {owner_r = "<input id='other_r' type='checkbox' disabled='' >" + "</td><td>"+r} ;
				if (owner_w == "w") {owner_w = "<input id='other_w' type='checkbox' checked='checked' disabled='' >" + "</td><td>"+w} else {owner_w = "<input id='other_w' type='checkbox' disabled='' >" + "</td><td>"+w};
				if (owner_x == "x") {owner_x = "<input id='other_x' type='checkbox' checked='checked' disabled='' >" + "</td><td>"+e} else {owner_x = "<input id='other_x' type='checkbox' disabled='' >" + "</td><td>"+e};	
				$("#p_permission_others").html("<table><tr><td>" + owner_r + "</td><td>" + owner_w + "</td><td>" + owner_x + "</td></tr></table>");

				$("#p_owner").html(owner);
				$("#p_group").html(group);

				$("input:checkbox").checkboxStyle();

			});
		},
		error: function (xmlHttpRequest, error) {}
	});


}

function do_query_HD_Mapping_Info() {
	HDD_INFO_ARRAY = new Array();

	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/remote_backup.cgi",
		data: "cmd=cgi_get_HD_Mapping_Info&fun=myfiles", //fish20120727+ for usb
		dataType: "xml",
		success: function (xml) {
			$(xml).find('item').each(function () {

				var info = $(this).find('data').text(); //Volume_1:/mnt/HD/HD_a2 

				HDD_INFO_ARRAY.push(info);

			});
		},
		error: function (xmlHttpRequest, error) {}
	});
}

function dialog_copy_init()
{
		jLoading(_T('_common','set') ,'loading' ,'s',""); 
		setTimeout(function(){
			if (copy_file_main() == 1 )
			{
				jLoadingClose();
			 	return;
			}		
		},500);			
										
}
function dialog_move_init()
{
			jLoading(_T('_common','set') ,'loading' ,'s',""); 
			setTimeout(function(){
				if (move_file_main() == 1 )
				{
					jLoadingClose();
				 	return;
				}					
			},500);											
}
function dialog_rename_init()
{
	$("#Apps_webfileviewerRenameSave_button").click(function(){
		
			if (rename_file_main() == 1) return;
			$("#sDiag_rename").hide();
				$("#shareDiag").hide();
	});
	
	$("#Apps_webfileviewerCreateSave_button").click(function(){
		
			if (create_dir_main() == 1) return;
			$("#sDiag_create_dir").hide();
				$("#shareDiag").hide();
	});
	
	$(".exit").click(function(){							
		var over = parent.$("#shareDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});
    	over.close();    	    	    	    
	});		
}
function dialog_addzip_init() {
	$("#a_zip_ok").click(function () {
		if (addzip_main() == 1) return;
		$("#shareDiag").hide();
	});
}


function copy_file_main() {

	var len = mainFrame.$('.trSelected', "#flex1").length;
	if (len >= 1) {	
		mainFrame.$('.trSelected').each(function (index) {
			var path = $(this).find("span").html();
			var type = $(this).find("td:eq(2) div").html();
			var name = $(this).find("span:eq(2) ").html();
			copy_file(path, type,name);
		});
	}

	jLoadingClose();
	restart_web_timeout();
}

function copy_file(path, type, name) {
	path = path.replace(/&nbsp;/g, ' ');
	path = path.replace(/&amp;/g, '&');
	name = name.replace(/&nbsp;/g, ' ');
	name = name.replace(/&amp;/g, '&');
	
	var sel_ele = $("#folder_selector input:checkbox:checked[name=folder_name]");
	var target_path;
		sel_ele.each(function(){				
					target_path = $(this).val()+"/";
				});
		
	//var mode = $('#f_file_method').attr('rel')	
	var _data = "cmd=cgi_cp&local=0&path=" + encodeURIComponent(target_path) + "&source_path=" + encodeURIComponent(path) + "&type=" + type +"&mode="+COPY_MOVE_MODE+"&name="+encodeURIComponent(name);


	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/webfile_mgr.cgi",
		data: _data,
		success: function (data) {
				//alert(data);													
		}
	});

}

function move_file_main() 
{
	var len = mainFrame.$('.trSelected', "#flex1").length;

	if (len >= 1) {		
		mainFrame.$('.trSelected').each(function (index) {
			var path = $(this).find("span").html();
			var type = $(this).find("td:eq(2) div").html();
			var name = $(this).find("span:eq(2) ").html();
			move_file(path, type, name);
		});
	}
	jLoadingClose();
	restart_web_timeout();
	//mainFrame.jQuery("#flex1").flexReload();		
	parent.table_reload_totop();
}

function move_file(path, type, name) {
	path = path.replace(/&nbsp;/g, ' ');
	path = path.replace(/&amp;/g, '&');
	name = name.replace(/&nbsp;/g, ' ');
	name = name.replace(/&amp;/g, '&');
		
	var sel_ele = $("#folder_selector input:checkbox:checked[name=folder_name]");
	var target_path;
		sel_ele.each(function(){				
					target_path = $(this).val()+"/";
				});
		
	//var mode = $('#f_file_method').attr('rel')	
	var _data = "cmd=cgi_move&path=" + encodeURIComponent(target_path) + "&source_path=" + encodeURIComponent(path) + "&type=" + type+"&mode="+COPY_MOVE_MODE+"&name="+encodeURIComponent(name);
	//	alert(_data);

	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/webfile_mgr.cgi",
		data: _data,
		success: function (data) {}
	});
}

function download_file_main() {
	google_analytics_log('webfile-edit-num','');
	var len = mainFrame.$('.trSelected', "#flex1").length;

	if (len == 1) {		
		mainFrame.$('.trSelected',"#flex1").each(function (index) {
			var path = $(this).find("span").html();
			var type = $(this).find("td:eq(2) div").html();
			var name = $(this).find("span:eq(2) ").html();
			var size = $(this).find("td:eq(1) div").html();
			      jLoading(_T('_common', 'set'), 'loading', 's', "");
			setTimeout("download_file(\"" + path + "\",\"" + type + "\",\"" + name + "\")", 500);
		});
	}
	else if (len > 1)
	{
		stop_web_timeout(true);
		var len = mainFrame.$('.trSelected', "#flex1").length;
		var path;
		if (len >= 1) {	
			mainFrame.$('.trSelected',"#flex1").each(function (index) {
				path = $(this).find("span").html();
				var type = $(this).find("td:eq(2) div").html();
				var name = $(this).find("span:eq(2) ").html();
				name = name.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
				wd_ajax({
						type: "POST",
						async: false,
						cache: false,
						url: "/cgi-bin/webfile_mgr.cgi",
						data: "cmd=record_select_file&name="+encodeURIComponent(name),
						success: function (data) {							
						},
						error: function (xmlHttpRequest, error) {}
					});								
			});
}

		var a1 = path.lastIndexOf("/");
		var save_path = path.substring(0, a1);
		save_path = save_path.replace(/&nbsp;/g, ' ');
		save_path = save_path.replace(/&amp;/g, '&');

                var zip_name;
//		var zip_name = mainFrame.$("#id_add_zip").text();
//		zip_name = zip_name.replace(/&nbsp;/g, ' ');
//		zip_name = zip_name.replace(/&amp;/g, '&');
		
	 	var t = mainFrame.$("#id_now_path").html();
		if (t.substr(t.length-1,1) == "/")
				t = t.substr(0, t.length-1);												
		if (t.lastIndexOf("/") == -1)
		{
			zip_name = t+".zip"
		}		
		else
		{
			var b = t.lastIndexOf("/");
			zip_name = t.substr(b+1,t.length) + ".zip";
		}	
		zip_name = zip_name.replace(/&nbsp;/g, ' ');
		zip_name = zip_name.replace(/&amp;/g, '&');
	
//		var d = mainFrame.$("#id_zip").css("display");
//		if (d != "none")
//			zip_name += ".zip"
	
		var command = '/usr/bin/zip -r ';
	

		jLoading(_T('_common', 'set'), 'loading', 's', "");

		var d = "cmd=cgi_add_zip&type=for_download&path=" + encodeURIComponent(save_path) + '&name=' + encodeURIComponent(zip_name) + "&command=" + encodeURIComponent(command);
		setTimeout(function () {
			wd_ajax({
				type: "POST",
				async: true,
				cache: false,
				url: "/cgi-bin/webfile_mgr.cgi",
				data: d,
				success: function (data) {					
					restart_web_timeout();				
					setTimeout("download_multi_file(\"" + save_path+"/"+zip_name + "\",\"zip\",\"" + zip_name + "\")", 1000);
				},
				error: function (xmlHttpRequest, error) {}
			});	
		}, 500);
	}	
}
function download_file(path, type, name) {
	var oBrowser = new detectBrowser();
	var browser;

	if (oBrowser.isIE) {
		browser = "ie"
	} else
		browser = "f"

		var v = name;
	v = v.replace(/&nbsp;/g, ' ');
	v = v.replace(/&amp;/g, '&');

	var t = path;
	t = t.replace(/&nbsp;/g, ' ');
	t = t.replace(/&amp;/g, '&');

	var tt = t;
	var index = t.lastIndexOf("/");
	t = t.substr(0, index);

	if(mainFrame.isiPhone())
		OSName = "MacOS";
	else
		OSName = "W";	
	var _data = "cmd=cgi_compress&path=" + encodeURIComponent(t) + "&type=" + type + "&name=" + encodeURIComponent(v) + "&os=" + OSName;

	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/webfile_mgr.cgi",
		data: _data,
		dataType: "xml",
		success: function (xml) {
					jLoadingClose();

			var status = $(xml).find("status").text();
			var my_url = $(xml).find("url").text();
				
			if (status == 1)
			{	
				jAlert(_T('_network_ups', 'fail'), _T('_common', 'error'));
				return;
			}	
				
			if ( OSName == "MacOS")
			{
				window.location = my_url;				
				return;
			}
					

				var p = "/cgi-bin/webfile_mgr.cgi";
				mainFrame.document.form_download.action = p;
				mainFrame.document.form_download.path1.value = tt;
				if (type == "Folder")
					mainFrame.document.form_download.path.value = t;
				else
					mainFrame.document.form_download.path.value = tt;
				mainFrame.document.form_download.type.value = type;
				if (browser == "ie")
					mainFrame.document.form_download.name.value = encodeURIComponent(v);
				else
					mainFrame.document.form_download.name.value = v;
	
				mainFrame.document.form_download.os.value = OSName;
				mainFrame.document.form_download.browser.value = browser;
				mainFrame.document.form_download.cmd.value = "cgi_download";
					mainFrame.document.form_download.submit();		

		}
	});
}

function download_multi_file(path, type, name) {
	var oBrowser = new detectBrowser();
	var browser;

	if (oBrowser.isIE) {
		browser = "ie"
	} else
		browser = "f"

		var v = name;
	v = v.replace(/&nbsp;/g, ' ');
	v = v.replace(/&amp;/g, '&');

	var t = path;
	t = t.replace(/&nbsp;/g, ' ');
	t = t.replace(/&amp;/g, '&');

	var tt = t;
	var index = t.lastIndexOf("/");
	t = t.substr(0, index);

	if(mainFrame.isiPhone())
		OSName = "MacOS";
	else
		OSName = "W";	
	var _data = "cmd=cgi_compress&path=" + encodeURIComponent(t) + "&type=" + type + "&name=" + encodeURIComponent(v) + "&os=" + OSName;

	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/webfile_mgr.cgi",
		data: _data,
		dataType: "xml",
		success: function (xml) {
			var status = $(xml).find("status").text();
			var my_url = $(xml).find("url").text();
				
			if (status == 1)
			{	
				jAlert(_T('_network_ups', 'fail'), _T('_common', 'error'));
				return;
			}	
				
			if ( OSName == "MacOS")
			{
				window.location = my_url;				
				return;
			}
			
			jLoadingClose();
			
		
				var p = "/cgi-bin/webfile_mgr.cgi";
				mainFrame.document.form_download.action = p;
			mainFrame.document.form_download.path1.value = tt;
			if (type == "Folder")
				mainFrame.document.form_download.path.value = t;
			else
				mainFrame.document.form_download.path.value = tt;
			mainFrame.document.form_download.type.value = type;
			if (browser == "ie")
				mainFrame.document.form_download.name.value = encodeURIComponent(v);
			else
				mainFrame.document.form_download.name.value = v;

			mainFrame.document.form_download.os.value = OSName;
			mainFrame.document.form_download.browser.value = browser;
				mainFrame.document.form_download.cmd.value = "cgi_multi_download"

				mainFrame.document.form_download.submit();

		}
	});
}

function file_link(_url) {
	location.href = _url;
}

function clear_link(_url) {
	var _data = "cmd=rm_link&url=" + _url.substr(1, _url.length);
	wd_ajax({
		type: "POST",
		async: true,
		cache: false,
		url: "/cgi-bin/webfile_mgr.cgi",
		data: _data,
		success: function (data) {}
	});

	return;
}


function detectBrowser() {
	var sAgent = navigator.userAgent.toLowerCase();
	this.isIE = (sAgent.indexOf("msie") != -1); //IE6.0-7
	this.isFF = (sAgent.indexOf("firefox") != -1); //firefox
	this.isSa = (sAgent.indexOf("safari") != -1); //safari
	this.isOp = (sAgent.indexOf("opera") != -1); //opera
	this.isNN = (sAgent.indexOf("netscape") != -1); //netscape
	this.isMa = this.isIE; //marthon
	this.isOther = (!this.isIE && !this.isFF && !this.isSa && !this.isOp && !this.isNN && !this.isSa); //unknown Browser
}

function rename_file_main() {

	var name = mainFrame.$('.trSelected td:eq(0) span:eq(2)', "#flex1").html();
	var path = mainFrame.$('.trSelected span', "#flex1").html();
	var type = mainFrame.$('.trSelected td:eq(2) div', "#flex1").html();

//	var new_name = $("#Apps_webfileviewerRename_text").val();
//	var new_name = new_name.replace(/ /g, '');
//
//
//	if (new_name == "" && $("#Apps_webfileviewerRename_text").val().length != 0) {
//		//	jAlert("Can't input blank characters.",_T('_common','error'));		
//		jAlert(_T('_wfs', 'msg4'), _T('_common', 'error'));
//		return 1;
//	}

	if ($("#Apps_webfileviewerRename_text").val() == "") {
		//jAlert("Please input name.",_T('_common','error'));	
		jAlert(_T('_wfs', 'msg5'), _T('_common', 'error'));
		return 1;
	}
	var ret = $("#Apps_webfileviewerRename_text").val().trim();
	var flag = Chk_Folder_Name(ret);
	if (flag == 1) //function.js
	{
		//alert('The file name must not include the following characters: \\ / : * ? " < > | ')		
		jAlert(_T('_backup', 'msg4'), _T('_common', 'error'));

		return 1;
	} else if (flag == 2) {
		//alert("Not a valid file name.")		
		jAlert(_T('_backup', 'msg5'), _T('_common', 'error'));
		return 1;
	}
	else if (flag == 3)
	{
		jAlert(_T('_wfs', 'msg4'), _T('_common', 'error')); //Cannot input blank characters
		return 1;
	}	

	if (ret.length > 226) {
		//alert("file name length should be 1-226.");		
		jAlert(_T('_backup', 'msg2') + "226", _T('_common', 'error'));
		return 1;
	}

	var num = path.lastIndexOf("/");
	var new_path = path.substr(0, num + 1) + $("#Apps_webfileviewerRename_text").val().trim();


	path = path.replace(/&nbsp;/g, ' ');
	path = path.replace(/&amp;/g, '&');

	new_path = new_path.replace(/&nbsp;/g, ' ');
	new_path = new_path.replace(/&amp;/g, '&');

	var _data = "cmd=cgi_rename&path=" + encodeURIComponent(new_path) + "&source_path=" + encodeURIComponent(path) + "&type=" + type;
	//		alert(_data);

	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/webfile_mgr.cgi",
		data: _data,
		success: function (data) {
			//alert(data);	
			mainFrame.table_reload_totop();
			google_analytics_log('webfile-edit-num','');
		}
	});
	$("#shareDiag").overlay().close();	
}

function chg_path_web(path) {
	var new_path = "";
	for (k = 0; k < HDD_INFO_ARRAY.length; k++) {
		var str = HDD_INFO_ARRAY[k].split(":"); //Volume_1:/mnt/HD/HD_a2d

		if (path.indexOf(str[1]) != -1) {
			if (path == str[1])
				new_path = str[0];
			else {
				if (path.indexOf("/mnt/USB/") != -1) //fish20120727+ for usb
					new_path = str[0] + path.substring(16, path.length);
				else
					new_path = str[0] + path.substring(13, path.length);
			}
		}
	}

	new_path = new_path.replace(/\s/g, '&nbsp;');
	return new_path;
}
function unzip() {

	var name = mainFrame.$('.trSelected td:eq(0) span:eq(2)', "#flex1").html();
	var path = mainFrame.$('.trSelected span', "#flex1").html();
	var type = mainFrame.$('.trSelected td:eq(2) div', "#flex1").html();

	var index = path.lastIndexOf("/");
	path = path.substr(0, index);

	path = path.replace(/&nbsp;/g, ' ');
	path = path.replace(/&amp;/g, '&');

	name = name.replace(/&nbsp;/g, ' ');
	name = name.replace(/&amp;/g, '&');

	jLoading(_T('_common', 'set'), 'loading', 's', "");
	stop_web_timeout(true);

	setTimeout(function () {
		$.ajax({
			type: "POST",
			async: true,
			cache: false,
			url: "/cgi-bin/webfile_mgr.cgi",
			data: "cmd=cgi_unzip&path=" + encodeURIComponent(path) + "&name=" + encodeURIComponent(name),
			success: function (xml) {
				var s = $(xml).find('status').text();
				jLoadingClose();
				//mainFrame.jQuery("#flex1").flexReload();
				mainFrame.table_reload_totop();
				restart_web_timeout();
			},
			error: function (xmlHttpRequest, error) {}
		});
	}, 500);
}

function untar() {
	var name = mainFrame.$('.trSelected td:eq(0) span:eq(2)', "#flex1").html();
	var path = mainFrame.$('.trSelected span', "#flex1").html();
	var type = mainFrame.$('.trSelected td:eq(2) div', "#flex1").html();

	var index = path.lastIndexOf("/");
	path = path.substr(0, index);

	path = path.replace(/&nbsp;/g, ' ');
	path = path.replace(/&amp;/g, '&');

	name = name.replace(/&nbsp;/g, ' ');
	name = name.replace(/&amp;/g, '&');


	jLoading(_T('_common', 'set'), 'loading', 's', "");
	stop_web_timeout(true);
	setTimeout(function () {
		var _data = "cmd=cgi_untar&path=" + encodeURIComponent(path) + "&name=" + encodeURIComponent(name);

		$.ajax({
			type: "POST",
			async: true,
			cache: false,
			url: "/cgi-bin/webfile_mgr.cgi",
			data: _data,
			success: function (xml) {

				jLoadingClose();

				//fish20120719+
				var s = $(xml).find('status').text();
				if (s == 'error') {
					jAlert(_T('_wfs', 'msg16'), _T('_common', 'error'));
					return;
				}
				//end							
				//mainFrame.jQuery("#flex1").flexReload();
				mainFrame.table_reload_totop();
				restart_web_timeout();

			},
			error: function (xmlHttpRequest, error) {}
		});
	}, 500);

}


function upload_action() {
	if (_ERROR_FLAG == 0) {
		//jAlert( _T('_wfs','msg9'),_T('_common','error'));	  
		return;
	}

	_NO_TIMEOUT = 1;
	var p = mainFrame.__str;
	var oBrowser = new detectBrowser();

	var login_name = getCookie("username");
	if ((oBrowser.isFF || oBrowser.isSa)) 
	{
		var t = mainFrame.__str.substr(0, 13) + "/.systemfile";
		
		if (p.indexOf("/mnt/USB/")!= -1)
				t = get_save_path_usb()+"/.systemfile";

		$('#Apps_webfileviewerUploadSelect_link').uploadifySettings('folder', t);
//		if (user_login=='1')
			$("#Apps_webfileviewerUploadSelect_link").uploadifySettings("scriptData", {
				'username': login_name
			}); //fish+ for change owner
		$('#Apps_webfileviewerUploadSelect_link').uploadifyUpload();
	} else {
		$('#Apps_webfileviewerUploadSelect_link').uploadifySettings('folder', p);
//		if (user_login=='1')
			$("#Apps_webfileviewerUploadSelect_link").uploadifySettings("scriptData", {
				'username': login_name
			});
		$('#Apps_webfileviewerUploadSelect_link').uploadifyUpload();
	}
        $('.uploadifyProgress').show();
	google_analytics_log('webfile-edit-num','');        
}

var __go = 0;

function init_upload() {
	var FileObj_array = new Array();
        var j = new Date().getTime();
	if (_INIT_UPLOAD == 0) {
				var size = 4241280205; //3.95G
//				var size = 2093796556; //1.95G
//				var oBrowser = new detectBrowser();
//				if (oBrowser.isGoogle || oBrowser.isOp) {					
//					size = 0; //no limit
//				}			
		
		$("#Apps_webfileviewerUploadSelect_link").uploadify({
			'hideButton': false,
//      'buttonImg': "/web/images/wfs/icon_webfileviewer_upload_n.png",
      'buttonImg': " ",
			'width': '100%',
			'height': 32,
			'wmode': 'transparent',
			'buttonText': _T('_button', 'browse'), //Browse	*/
			'uploader': '/web/jquery/uploader/uploadify.swf?'+j,
			'script': '/web/jquery/uploader/uploadify.php?'+j,
			'scriptData' : { 'PHPSESSID': parent.s_id},
			'cancelImg': '/web/jquery/uploader/cancel.png?'+j,
			'folder': '/mnt/HD_a4/.systemfile',			
			'sizeLimit': size, //limit size
			'queueID': 'fileQueue',
			'auto': false,
			'multi': true,
			'queueSizeLimit': 500,
			'removeCompleted': true,
			'onAllComplete': function (event, data) {
				FileObj_array = new Array();
			},
			'onComplete': function (event, ID, fileObj, response, data) {
				$('#' + $(event.target).attr('id') + ID).find('.percentage1').text("");

				var oBrowser = new detectBrowser();
				if (oBrowser.isFF || oBrowser.isSa) {
					var path = mainFrame.__str
					path = path.replace(/&nbsp;/g, ' ');
					path = path.replace(/&amp;/g, '&');

					var name = fileObj.name;
					name = name.replace(/&nbsp;/g, ' ');
					name = name.replace(/&amp;/g, '&');
					var str = "cmd=chk_file&path=" + encodeURIComponent(path) + "&name=" + encodeURIComponent(name);
					var t = $(event.target).attr('id') + ID
					//setTimeout("chk_file(\"" + str + "\",\"" + t + "\",'0')", 2000);
					chk_file(str, t ,0);
				}
			},
			'onProgress': function (event, ID, fileObj, data) {
				$('#' + $(event.target).attr('id') + ID).find('.percentage1').show("");
				var v = $('#' + $(event.target).attr('id') + ID).find('.percentage').text();

				//	$('#' + $(event.target).attr('id') + ID).find('.percentage1').text(' -  v ='+v )

				var oBrowser = new detectBrowser();
				if (fileObj.size >= 267000000) {
					if (v.indexOf("99") != -1 && oBrowser.isFF || v.indexOf("99") != -1 && oBrowser.isSa) {
						if (__go == 1) return;
						__go = 1;
						var path = mainFrame.__str
						path = path.replace(/&nbsp;/g, ' ');
						path = path.replace(/&amp;/g, '&');

						var name = fileObj.name;
						name = name.replace(/&nbsp;/g, ' ');
						name = name.replace(/&amp;/g, '&');

						var str = "cmd=chk_file&path=" + path + "&name=" + name;
						var t = $(event.target).attr('id') + ID
						setTimeout("chk_file(\"" + str + "\",\"" + t + "\",'1')", 2000);
						return;
					}
				}
			},
			'onSelectOnce': function (event, data) {

				var ng_file = new Array();
				var current_free = get_current_free_size();
				var s = 0;
				for (var i = 0 in FileObj_array) {
					if (FileObj_array[i] == "") continue;

					var file_size = FileObj_array[i].size / 1024;
					var total_size = data.allBytesTotal / 1024;

					s += file_size;
					//alert("_size="+s + "\ntotal_size=" + total_size +"\nfile_name="+FileObj_array[i].name)
					if (current_free == 0 || current_free < file_size || current_free < s) {
						ng_file.push(FileObj_array[i].name);
						$('#Apps_webfileviewerUploadSelect_link').uploadifyCancel(FileObj_array[i].id);
					}
				}

				if (ng_file.length > 0) {
					var msg = "Your personal data has exceeded the quota." + " <br>( File name: " + ng_file.toString() + " )"
					jAlert(msg, _T('_common', 'error'));
				}

				ng_file = new Array();
			},
			'onSelect': function (e, queueId, fileObj) {
				var file = {
					id: queueId,
					name: fileObj.name,
					size: fileObj.size
				}
				FileObj_array.push(file);

				setTimeout(function(){
				$('#upload_scroll').jScrollPane();
							},100);

			},
			'onCancel': function (event, queueId, fileObj, data) {
				for (var i = 0 in FileObj_array) {
					if (FileObj_array[i].id == queueId) {
						FileObj_array[i] = "";
					}
				}
			},
			'onError': function (event, ID, fileObj, data) {},
			'onSWFReady': function () {
				$("#Apps_webfileviewerUploadSelect_linkUploader").css("position","absolute");
				_ERROR_FLAG = 1;
						$("#upload_desc").show();																		
				//		alert('The flash button has been loaded.');
			}
		});

		//setTimeout(chk_upload,1500);
	} else {
		$("error_msg").text("");	
	}
	_INIT_UPLOAD = 1;
}

function chk_upload() {
	try {
		$("error_msg").text("");
		$('#Apps_webfileviewerUploadSelect_link').uploadifyCancel()
	} catch (err) {
		//alert("The browser does not support Flash Player");														
		//$("#error_msg").html(_T('_wfs','msg9'));			
	}
}

function upload_cancel_b()
{
	var v = $("#fileQueue .uploadifyQueueItem").length;
	if (v >= 1)
	{
			jConfirm('M',_T('_wfs','msg17'),_T('_wfs','upload'),function(flag){
        		
        		if (flag == true)
	        	{                			        			
	        		try {
		              $("#shareDiag_title").removeClass("WDLabelHeaderDialogueWebFileViewerIcon").addClass("WDLabelHeaderDialogueFolderIcon")  		      				
		      					$('#Apps_webfileviewerUploadSelect_link').uploadifyClearQueue();		
	      					$("#shareDiag").overlay().close();
	      					//mainFrame.jQuery("#flex1").flexReload(); 	
	      					mainFrame.table_reload_totop();

								} catch (err) {
										$("#shareDiag_title").removeClass("WDLabelHeaderDialogueWebFileViewerIcon").addClass("WDLabelHeaderDialogueFolderIcon")	      					
	      						$("#shareDiag").overlay().close();
	      						//mainFrame.jQuery("#flex1").flexReload(); 	
	      						mainFrame.table_reload_totop();
								}
		              
	        	}        		
			  	});//end of jConfirm
	}
	else
	{
		$("#shareDiag").overlay().close();
		restart_web_timeout();
		setTimeout(function(){
			mainFrame.table_reload_totop(); },500);
	}		
}

function upload_cancel() {
	$('#Apps_webfileviewerUploadSelect_link').uploadifyCancel($('.uploadifyQueueItem').first().attr('id').replace('Apps_webfileviewerUploadSelect_link', ''))
}

function chk_file(str, event, big) {
	if (big == 1) 
		async_flag = true;
	else
		async_flag = false;	
	wd_ajax({
		type: "POST",
		async: async_flag,
		cache: false,
		url: "/cgi-bin/webfile_mgr.cgi",
		data: str,
		success: function (data) {
			if (big == 1) {
				if (data == 0) {
					__go = 0
					$('#' + event).find('.uploadifyProgress').hide();
					$('#' + event).find('.percentage1').text('- ' + _T('_button', 'Completed'));
					$('#' + event).find('.uploadifyProgress').hide();

					setTimeout(upload_cancel, 1000);
				} else {
					setTimeout("chk_file('" + str + "','" + event + "','1')", 5000);
					return false;
				}
			} else {
				//  mainFrame.jQuery("#flex1").flexReload();
			}
		}
	});
}

function doc_open() {
	//open a file
	if (mainFrame.$('.trSelected', "#flex1").length != 1) {
		jAlert(_T('_upnp', 'msg3'), _T('_common', 'error')); //Text:Please select one item.
		return;
	}

	var my_file = mainFrame.$('.trSelected td:eq(0) span:eq(0)', "#flex1").html();
	var my_type = mainFrame.$('.trSelected td:eq(2) div', "#flex1").html();

	my_file = my_file.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/webfile_mgr.cgi",
		data: {
			cmd: 'cgi_get_secdownload_url',
			f_path: my_file
		},
		dataType: "xml",
		success: function (xml) {

			var res = $(xml).find("res").text();
			if (parseInt(res) == 1) {
				var my_url = "http://" + document.domain + $(xml).find("my_url").text();

//				if (my_type.indexOf("Image") != -1)
//				{
//					window.open("/view.html", 'myfile_open', 'resizable,scrollbars', '_blank');
//				}			
//				else
//				{									
					window.open(my_url, 'myfile_open', 'resizable,scrollbars', '_blank');					
				//}	
			}

		} //end of success
	}); //end of ajax  
}

function preview() {
	if (mainFrame.$('.trSelected', "#flex1").length != 1) {
		jAlert(_T('_upnp', 'msg3'), _T('_common', 'error')); //Text:Please select one item.
		return;
	}

	var name = mainFrame.$('.trSelected td:eq(0) span:eq(2)', "#flex1").html();
	var path = mainFrame.$('.trSelected span', "#flex1").html();
	var type = mainFrame.$('.trSelected td:eq(2) div', "#flex1").html();

	var index = path.lastIndexOf("/");
	path = path.substr(0, index);

	path = path.replace(/&nbsp;/g, ' ');
	path = path.replace(/&amp;/g, '&');

	name = name.replace(/&nbsp;/g, ' ');
	name = name.replace(/&amp;/g, '&');


	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/webfile_mgr.cgi",
		data: {
			cmd: 'get_cooliris_rss',
			name: name,
			path: path
		},
		success: function (data) {

			$("#overlay_img_src").attr("src", data);

			$("#id_img").dialog({
				title: name,
				bgiframe: true,
				height: 300,
				width: 350,
				modal: true,
				open: function () {
					__drop = 1;
					_NO_TIMEOUT = 1;
				},
				close: function (e) {
					__drop = 0;
					_NO_TIMEOUT = 0;
				}
			});

		} //end of success
	}); //end of ajax  
}

function get_current_free_size() {
	var login_name = getCookie("username");
	var size_info = get_user_quota_info(login_name, mainFrame.__str);

	var path = mainFrame.__str;
	var usb = 0;
	if (path.indexOf("/mnt/USB/") != -1)
		usb = 1;

	if (size_info.quota_enable == 0 || usb == 1) {
		current_free = size_info.hdd_free_size;
	} else if (size_info.u_limit_size == 0 && size_info.g_limit_size == 0) {
		current_free = size_info.hdd_free_size;
	} else if (size_info.u_limit_size == 0 && size_info.g_limit_size > 0) {
		current_free = size_info.g_limit_size - size_info.g_used_size;
	} else if (size_info.g_limit_size == 0 && size_info.u_limit_size > 0) {
		current_free = size_info.u_limit_size - size_info.u_used_size;
	} else {
		var g_free = size_info.g_limit_size - size_info.g_used_size;
		var u_free = size_info.u_limit_size - size_info.u_used_size;
		if (g_free <= 0 || u_free <= 0)
			current_free = 0;
		else if (u_free < g_free)
			current_free = u_free;
		else
			current_free = g_free;
	}
	return current_free;
}

function get_user_quota_info(username, path) {
	var size_info = {};
	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/webfile_mgr.cgi",
		data: "cmd=cgi_get_user_quota&username=" + username + "&path=" + encodeURIComponent(path),
		dataType: "xml",
		success: function (xml) {
			var used_size = $(xml).find("used_size").text();
			var limit_size = $(xml).find("limit_size").text();
			var g_used_size = $(xml).find("g_used_size").text();
			var g_limit_size = $(xml).find("g_limit_size").text();
			var hdd_free_size = $(xml).find("hdd_free_size").text();
			var quota_enable = $(xml).find("enable").text();
			//alert("used_size="+used_size+"\nlimit_size=" + limit_size +"\nhdd_free_size=" + hdd_free_size)
			size_info.u_used_size = used_size;
			size_info.u_limit_size = limit_size;
			size_info.hdd_free_size = hdd_free_size;
			size_info.g_used_size = g_used_size;
			size_info.g_limit_size = g_limit_size;
			size_info.quota_enable = quota_enable;
		},
		error: function (xmlHttpRequest, error) {}
	});

	return size_info;
}

function create_zip() {

	google_analytics_log('webfile-edit-num','');
	if (document.form_web.text_id.value == "undefined") {
		jAlert(_T('_wfs', 'msg6'), _T('_common', 'error'));
		return 1;
	}
	var len = mainFrame.$('.trSelected', "#flex1").length;	
	var path;
	if (len >= 1) {
	
		mainFrame.$('.trSelected',"#flex1").each(function (index) {
			path = $(this).find("span").html();
			var type = $(this).find("td:eq(2) div").html();
			var name = $(this).find("span:eq(2) ").html();
			
			name = name.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
			wd_ajax({
					type: "POST",
					async: false,
					cache: false,
					url: "/cgi-bin/webfile_mgr.cgi",
					data: "cmd=record_select_file&name="+encodeURIComponent(name),
					success: function (data) {							
					},
					error: function (xmlHttpRequest, error) {}
				});											
		});
	}

	var a1 = path.lastIndexOf("/");
	var save_path = path.substring(0, a1);


	save_path = save_path.replace(/&nbsp;/g, ' ');
	save_path = save_path.replace(/&amp;/g, '&');

	var zip_name = mainFrame.$("#id_add_zip").text();
	zip_name = zip_name.replace(/&nbsp;/g, ' ');
	zip_name = zip_name.replace(/&amp;/g, '&');

	var d = mainFrame.$("#id_zip").css("display");
	if (d != "none")
		zip_name += ".zip"

	var command = '/usr/bin/zip -r ';
	
	jLoading(_T('_common', 'set'), 'loading', 's', "");
	stop_web_timeout(true);
	var d = "cmd=cgi_add_zip&path=" + encodeURIComponent(save_path) + '&name=' + encodeURIComponent(zip_name) + "&command=" + encodeURIComponent(command);

	setTimeout(function () {
		wd_ajax({
			type: "POST",
			async: true,
			cache: false,
			url: "/cgi-bin/webfile_mgr.cgi",
			data: d,
			success: function (data) {
				jLoadingClose();
				//mainFrame.jQuery("#flex1").flexReload();
				mainFrame.table_reload_totop();
				restart_web_timeout();
			},
			error: function (xmlHttpRequest, error) {}
		});

	}, 500);
}



function addzip_main() {
	var len = $("#sDiag_zip_tree input:checkbox:checked[name=folder_name]").length;
	if (len == 0 )
	{
		jAlert( _T('_wfs','msg6'),_T('_common','error'));							
		return 1;
	}
	var len = mainFrame.$('.trSelected', "#flex1").length;	
	var path;
	google_analytics_log('webfile-edit-num','');
	if (len >= 1) {
		mainFrame.$('.trSelected',"#flex1").each(function (index) {
			path = $(this).find("span").html();
			var type = $(this).find("td:eq(2) div").html();
			var name = $(this).find("span:eq(2) ").html();			
			
			name = name.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
			wd_ajax({
					type: "POST",
					async: false,
					cache: false,
					url: "/cgi-bin/webfile_mgr.cgi",
					data: "cmd=record_select_file&name="+encodeURIComponent(name),
					success: function (data) {							
					},
					error: function (xmlHttpRequest, error) {}
				});														
		});
	}

	var a1 = path.lastIndexOf("/");
	var save_path = path.substring(0, a1); //copy_file(path,type);
	var save_path_really = path.substring(0, a1);

	save_path = save_path.replace(/&nbsp;/g, ' ');
	save_path = save_path.replace(/&amp;/g, '&');

	//list user selected path
	$("#tree_container_zip input:checkbox:checked[name=folder_name]").each(function (index) {
		var flag = 0;
		//var path = $(this).val();
		var sharename = $(this).attr('rel');

		var zip_name = $(this).val();
		zip_name = zip_name.replace(/&nbsp;/g, ' ');
		zip_name = zip_name.replace(/&amp;/g, '&');

		var last_index = zip_name.lastIndexOf("/");
		save_name = zip_name.substr(last_index+1,zip_name.length);

		var command = "/usr/bin/zip -u "
		var d = "cmd=cgi_zip&path=" + encodeURIComponent(save_path)  + '&name=' + encodeURIComponent(zip_name) + "&command=" + encodeURIComponent(command)+"&save_name="+encodeURIComponent(save_name);
		stop_web_timeout(true);
		//alert(d);					

		wd_ajax({
			type: "POST",
			async: true,
			cache: false,
			url: "/cgi-bin/webfile_mgr.cgi",
			//data: "cmd=cgi_add_zip&path="+encodeURIComponent(save_path)+"&command="+encodeURIComponent(command),
			data: d,
			success: function (data) {
				restart_web_timeout();
				// over.close();
			},
			error: function (xmlHttpRequest, error) {}
		});

	});
	$("#shareDiag").overlay().close();	
}

function create_dir_main()
{
	var path = parent.translate_path_to_really(mainFrame.$("#id_now_path").text());
	
	if ($("#Apps_webfileviewerCreate_text").val() == "" ) 
	{
		jAlert(_T('_network_access', 'msg4'), _T('_common', 'error'));
		return 1;
	}
//	var new_name = $("#Apps_webfileviewerCreate_text").val().trim();
//	var new_name = new_name.replace(/ /g, '');
//	if (new_name == "" && $("#Apps_webfileviewerCreate_text").val().length != 0) {		
//		jAlert(_T('_wfs', 'msg4'), _T('_common', 'error'));
//		return 1;
//	}
	
	var ret = $("#Apps_webfileviewerCreate_text").val().trim();
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
	else if (flag == 3)
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
	

	path=path.replace(/&nbsp;/g,' ');
	path=path.replace(/&amp;/g,'&');

	var _data = "cmd=cgi_open_new_folder&dir="+encodeURIComponent(path)+"&filename="+$("#Apps_webfileviewerCreate_text").val().trim();
	
	//alert(_data);		
	//return;
	
		wd_ajax({
					type:"POST",
					async:false,
					cache:false,
					url:"/cgi-bin/folder_tree.cgi",
					data:_data,
					success:function(data){			
						//alert(data);	
						//mainFrame.jQuery("#flex1").flexReload();  											
						mainFrame.table_reload_totop();
					}
				});
			
		
		var over = $("#shareDiag").overlay({oneInstance:false,expose: '#000',api:true,closeOnClick:false,closeOnEsc:false,speed:0});
		over.close();	
}
function get_save_path_usb()
{	
	var path = "";

	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/remote_backup.cgi",
		data: "cmd=cgi_get_HD_Mapping_Info&fun=myfiles", //fish20120727+ for usb
		dataType: "xml",
		success: function (xml) {
			$(xml).find('item').each(function () {

				var p = $(this).find('data').text().split(":"); //Volume_1:/mnt/HD/HD_a2 
				path = p[1];
				return false;
			});
		},
		error: function (xmlHttpRequest, error) {}
	});
	return path;
}
function clear_chkbox(v,id)
{	
	$("#Apps_webfileviewerOverwrite_chkbox").attr("checked",false);
	$("#Apps_webfileviewerSkip_chkbox").attr("checked",false);
	$("#Apps_webfileviewerKeep_chkbox").attr("checked",false);		
	$("#"+id).attr("checked",v);
}
function clear_chkbox_move(v,id)
{	
	$("#Apps_webfileviewerMoveOverwrite_chkbox").attr("checked",false);
	$("#Apps_webfileviewerMoveSkip_chkbox").attr("checked",false);
	$("#Apps_webfileviewerMoveKeep_chkbox").attr("checked",false);		
	$("#"+id).attr("checked",v);
}
function SetFileMode(obj,val,ftype)
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