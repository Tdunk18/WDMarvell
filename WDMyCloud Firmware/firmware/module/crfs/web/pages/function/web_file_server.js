var __file = 0;
var __chkflag = 0; //for show check box	1:show	0:not
var __str = "";
var __str_parent = "";

var __move = 0; /* if move  1:true 0: false */
var __source_path = 0; /* move source path*/
var __source_type = 0; /* move type   */

var __contextmenu = 0; /*push right button -> file path*/
var __contextmenu_type = 0 /*push right button-> file type*/
var __path = 0;
var __read;
var __level = 0;

var __first = 0;
var HDD_INFO_ARRAY = "";

function get_path() {
	return __str + "/";
}

function get_read() {
	return __read;
}

var _T = parent._T;

function ready_web_file_server() {
	$("#Apps_webfileviewerCopy_link").attr('rel',_T('_wfs','copy'));
	$("#Apps_webfileviewerMove_link").attr('rel',_T('_wfs','move'));
	$("#Apps_webfileviewerUpload_link").attr('rel',_T('_wfs','upload'));
	$("#Apps_webfileviewerDownload_link").attr('rel',_T('_wfs','download'));
	$("#Apps_webfileviewerRename_link").attr('rel',_T('_wfs','rename'));
	$("#Apps_webfileviewerDelete_link").attr('rel',_T('_common','del'));
	$("#Apps_webfileviewerRefresh_link").attr('rel',_T('_wfs','refresh'));
	$("#Apps_webfileviewerCreate_link").attr('rel',_T('_button','create'));
	
	
	$("input:text").inputReset();
	init_icon_action();
	$("#Apps_webfileviewerCopy_link").addClass("gray_icon");
	$("#Apps_webfileviewerMove_link").addClass("gray_icon");
	$("#Apps_webfileviewerUpload_link").addClass("gray_icon");
	$("#Apps_webfileviewerDownload_link").addClass("gray_icon");
	$("#Apps_webfileviewerRename_link").addClass("gray_icon");
	$("#Apps_webfileviewerDelete_link").addClass("gray_icon");
	$("#Apps_webfileviewerRefresh_link").addClass("gray_icon");
	$("#Apps_webfileviewerCreate_link").addClass("gray_icon");


	parent.HD_Status(0,function(hd_state){
			if (hd_state == 0)
			{
				parent.$("#mainbody").html("<br><br><br>" + _T('_user', 'no_hdd'))				
			}
			else
			{
					init_table();
					parent.language_for_iframe();
				
					$("#Apps_webfileviewerUpload_link").click(function () {
						if (!$("#Apps_webfileviewerUpload_link").hasClass("gray_icon")) {
							if ($("#id_now_path").text() == "") {
								parent.jAlert(_T('_wfs', 'msg3'), _T('_common', 'error'));
							} else
								parent.upload();
						}
					});
				
					$("#Apps_webfileviewerDownload_link").click(function () {
						if (!$("#Apps_webfileviewerDownload_link").hasClass("gray_icon")) {
							var path = $('.trSelected td:eq(0) span', "#flex1").html()
							var name = $('.trSelected span:eq(2)', "#flex1").html()
							var type = $('.trSelected td:eq(2) div', "#flex1").html()
							if (path == null) {			
								parent.jAlert(_T('_wfs', 'msg6'), _T('_common', 'error'));
								return;
							}
							parent.download_file_main();
						}
					});
				
				
					$("#Apps_webfileviewerRename_link").click(function () {
						if ($("#Apps_webfileviewerMove_link").hasClass("gray_icon")) return;
						parent.rename();
					});
				
					$("#Apps_webfileviewerCreate_link").click(function(){
						if ($("#Apps_webfileviewerCreate_link").hasClass("gray_icon")) return;		
						parent.create();
					});
				
					$("#Apps_webfileviewerRefresh_link").click(function () {					
						if (!$("#Apps_webfileviewerRefresh_link").hasClass("gray_icon")) {
				
							if ($("#id_now_path").text() == "")
								click_path('root');
							else
							{	
					                      table_reload_totop();
							}	
						}
					});
				
					$("#Apps_webfileviewerCopy_link").click(function () {		
						if (!$("#Apps_webfileviewerCopy_link").hasClass("gray_icon")) {			
							var len = $('.trSelected', "#flex1").length;
							if (len == 0) {
								parent.jAlert(_T('_wfs', 'msg6'), _T('_common', 'error'));
								return;
							}
							parent.document.form_web.text_id.value = "";
							parent.copy();
						}
					});
					$("#Apps_webfileviewerMove_link").click(function () {
						if (!$("#Apps_webfileviewerMove_link").hasClass("gray_icon")) {
							var len = $('.trSelected', "#flex1").length;
							if (len == 0) {
								parent.jAlert(_T('_wfs', 'msg6'), _T('_common', 'error'));
								return;
							}
							parent.document.form_web.text_id.value = "";
							parent.move();
						}
					});
					$("#Apps_webfileviewerDelete_link").click(function () {
						if ($("#Apps_webfileviewerDelete_link").hasClass("gray_icon")) return;	
						var len = $('.trSelected', "#flex1").length;
						if (len == 0) {
							parent.jAlert(_T('_wfs', 'msg6'), _T('_common', 'error'));
							return;
						}
						contextMenuWork('Delete');			     
					});
				
				
					$(".customerRow").contextMenu({
						menu: 'myMenu'
					},
					function (action, el, pos) {
						contextMenuWork(action, el, pos);
					});
			}	
		});		
}

function init_icon_action() {
	$(".icon").mouseover(function (event) {
		var _src = $(this).attr("src").replace("_n.png", "_f.png")
		$(this).attr("src", _src);
		 $("#tooltip").remove();		 			
	         showTooltip(event.pageX,event.pageY+26,$(this).attr('rel'));
	});

	$(".icon").mouseout(function () {
		var _src = $(this).attr("src").replace("_f.png", "_n.png")
		$(this).attr("src", _src);
		  $("#tooltip").remove();
	});
}
function isiPhone()
{
	return ((navigator.platform.indexOf("iPhone") != -1) ||(navigator.platform.indexOf("iPad") != -1) || (navigator.platform.indexOf("Android") != -1) ||  (navigator.platform.indexOf("Linux") != -1));
}
							
function init_table() {
					
	if(!parent.user_login)
	{
		$("#scrollbar_wfs").css('width','700px').css("height","500px").css("overflow","auto");
		$("#id_wfs_page_location").css('margin-left','650px')
	}
	else
	{		
		$("#my_scroll_main").css("margin-top","30px");				
		$("#scrollbar_wfs").css('width','960px').css("height","500px").css("overflow","auto");					
		$("#id_wfs_page_location").css('margin-left','930px')
	}	
		
	//var h = $(document).height() - 165;
	var h = $(document).height() - 205;
	var w;
	w = $(window).width() - 670;

	if (w < 100) {
		w = 100;
	}
	var ww;
	ww = $(window).width() - 240;
	if (ww < 0) ww = 100;

	//get share list		 
	if(isiPhone())
	{	 		
	$("#flex1").flexigrid({
		url: '/cgi-bin/webfile_mgr.cgi',
		dataType: 'xml',
		cmd: 'cgi_folder_content_first',
		colModel: [{
				display: _T('_device', 'name'),
				name: 'name',
					width: 200,
				sortable: false,
				align: 'left'
			}, {
				display: _T('_wfs', 'size'),
				name: 'size',
				width: 80,
				sortable: false,
				align: 'left'
			}, {
				display: _T('_wfs', 'type'),
				name: 'type',
				width: 100,
				sortable: false,
				align: 'left'
			}, {
				display: _T('_wfs', 'modified'),
				name: 'modify_time',
				width: 150,
				sortable: false,
				align: 'left'
				},
				 {
					display: _T('_wfs', 'modified'),
					name: 'modify_time',
						width: 20,
					sortable: false,
					align: 'left'
			}
		],
		usepager: true,
		useRp: true,
		rp: 10,
		rpOptions: [10],
		showTableToggleBtn: true,
		//width: $(window).width() - 240,
		width: 'auto',
		height: 'auto',
		errormsg: _T('_common', 'connection_error'),
		nomsg: _T('_common', 'no_items'),
		singleSelect: true,
		async: true,
		used_dir: '',
		id: 'id1',
		beforeLoadData: function (r) {
			if ($("#id_now_path").text() == "") {
				$("#Apps_webfileviewerCopy_link").addClass("gray_icon");
				$("#Apps_webfileviewerMove_link").addClass("gray_icon");
				$("#Apps_webfileviewerUpload_link").addClass("gray_icon");
				$("#Apps_webfileviewerDownload_link").addClass("gray_icon");
				$("#Apps_webfileviewerRename_link").addClass("gray_icon");
				$("#Apps_webfileviewerDelete_link").addClass("gray_icon");
				$("#Apps_webfileviewerRefresh_link").addClass("gray_icon");
				$("#Apps_webfileviewerCreate_link").addClass("gray_icon");

			} else {
				$("#Apps_webfileviewerCopy_link").removeClass("gray_icon");
				$("#Apps_webfileviewerMove_link").removeClass("gray_icon");
				$("#Apps_webfileviewerUpload_link").removeClass("gray_icon");
				$("#Apps_webfileviewerDownload_link").removeClass("gray_icon");
				$("#Apps_webfileviewerRename_link").removeClass("gray_icon");
				$("#Apps_webfileviewerDelete_link").removeClass("gray_icon");
				$("#Apps_webfileviewerRefresh_link").removeClass("gray_icon");
				$("#Apps_webfileviewerCreate_link").removeClass("gray_icon");
			}
			if (parent.$(".LightningUpdating").css('display') == "block") {
				parent.jLoadingClose();
			}
			return r;

		},
		onSuccess: function () {			

			jQuery('#flex1').flexOptions({
				cmd: "cgi_folder_content"
			});
			var len = $("#flex1 tbody tr").length;
				$("#id_wfs_now").text(len);
				$("#id_wfs_total").text(jQuery('#flex1').flexTotal());
			
			if(!parent.user_login)
			{
				$("#scrollbar_wfs").css('width','700px').css("height","500px").css("overflow","auto");
				$("#id_wfs_page_location").css('margin-left','650px')
			}
			else
			{					
				$("#my_scroll_main").css("margin-top","30px");
				$("#scrollbar_wfs").css('width','960px').css("height","500px").css("overflow","auto");
				$("#id_wfs_page_location").css('margin-left','930px')
			}		
				
				
			$("#scrollbar_wfs").jScrollPane();



			}
	});
	}
	else
	{		
		$("#flex1").flexigrid({
			url: '/cgi-bin/webfile_mgr.cgi',
			dataType: 'xml',
			cmd: 'cgi_folder_content_first',
			colModel: [{
					display: _T('_device', 'name'),
					name: 'name',
					width: 250,
					sortable: false,
					align: 'left'
				}, {
					display: _T('_wfs', 'size'),
					name: 'size',
					width: 80,
					sortable: false,
					align: 'left'
				}, {
					display: _T('_wfs', 'type'),
					name: 'type',
					width: 100,
					sortable: false,
					align: 'left'
				}, {
					display: _T('_wfs', 'modified'),
					name: 'modify_time',
					width: 150,
					sortable: false,
					align: 'left'
				}
			],
			usepager: true,
			useRp: true,
			rp: 10,
			rpOptions: [10],
			showTableToggleBtn: true,
			//width: $(window).width() - 240,
			width: 'auto',
			height: 'auto',
			errormsg: _T('_common', 'connection_error'),
			nomsg: _T('_common', 'no_items'),
			singleSelect: true,
			async: true,
			used_dir: '',
			id: 'id1',
			beforeLoadData: function (r) {
				if ($("#id_now_path").text() == "") {
					$("#Apps_webfileviewerCopy_link").addClass("gray_icon");
					$("#Apps_webfileviewerMove_link").addClass("gray_icon");
					$("#Apps_webfileviewerUpload_link").addClass("gray_icon");
					$("#Apps_webfileviewerDownload_link").addClass("gray_icon");
					$("#Apps_webfileviewerRename_link").addClass("gray_icon");
					$("#Apps_webfileviewerDelete_link").addClass("gray_icon");
					$("#Apps_webfileviewerRefresh_link").addClass("gray_icon");
					$("#Apps_webfileviewerCreate_link").addClass("gray_icon");

				} else {
					$("#Apps_webfileviewerCopy_link").removeClass("gray_icon");
					$("#Apps_webfileviewerMove_link").removeClass("gray_icon");
					$("#Apps_webfileviewerUpload_link").removeClass("gray_icon");
					$("#Apps_webfileviewerDownload_link").removeClass("gray_icon");
					$("#Apps_webfileviewerRename_link").removeClass("gray_icon");
					$("#Apps_webfileviewerDelete_link").removeClass("gray_icon");
					$("#Apps_webfileviewerRefresh_link").removeClass("gray_icon");
					$("#Apps_webfileviewerCreate_link").removeClass("gray_icon");
				}
				if (parent.$(".LightningUpdating").css('display') == "block") {
					parent.jLoadingClose();
				}
	
				$(r).find('row').each(function(idx){	
														
					var t = $(this).find("cell:eq(0)").text();				
					var start = t.indexOf("<span>");
					var end = t.indexOf("</span></span>")
					t = t.substring(start+6,end);									
						$('#id_test').empty();					
						$('#id_test').append(t);
						
						var element = $('#id_test');
						if (element.width() > 250) {	
							var my_str
							if ($(this).find('cell').eq(0).text().indexOf("table_folder")!= -1)													
								my_str = $(this).find('cell').eq(0).text().replace(/table_folder/,'table_folder" onmouseover=\'over("'+t+'",event);\' onmouseout=\'out();\'');
							else	
								my_str = $(this).find('cell').eq(0).text().replace(/table_file/,'table_file" onmouseover=\'over("'+t+'",event);\' onmouseout=\'out();\'');
						$(this).find("cell:eq(0)").text(my_str);											
						}
					//console.log("k = %s \n",k);
					
				});//end of each 	
	
				$('#id_test').empty();					
				return r;
	
			},
			onSuccess: function () {			
	
				jQuery('#flex1').flexOptions({
					cmd: "cgi_folder_content"
				});
				var len = $("#flex1 tbody tr").length;
				$("#id_wfs_now").text(len);
				$("#id_wfs_total").text(jQuery('#flex1').flexTotal());
				if(!parent.user_login)
				{
					$("#scrollbar_wfs").css('width','700px').css("height","370px").css("overflow","auto");
					$("#id_wfs_page_location").css('margin-left','650px')
					
				}
				else
				{					
					$("#my_scroll_main").css("margin-top","30px");
					$("#scrollbar_wfs").css('width','960px').css("height","370px").css("overflow","auto");				
					$("#id_wfs_page_location").css('margin-left','930px')
				}		
				parent.google_analytics_log('webfile-visit-num','');					
										
					if (jQuery('#flex1').flexCmd() == "cgi_folder_content")
						$("#scrollbar_wfs").jScrollPane({isbottom:readView,mouseWheelSpeed: 30});
					else	
				$("#scrollbar_wfs").jScrollPane();
	
	

	
			}
		});
	}	

	
 parent.dialog_rename_init();
	parent.dialog_addzip_init();



	if ($(window).height() - 50 > 100) {

		$("#tree_container").css('overflow', 'auto');
		$("#tree_container").css('height', $(window).height() - 20 + "px");
		$("#tree_container").css('width', "200px");
	}

	$("#tree_container").css('display', '');
	$("#my_scroll_main").css('display', '');

	

}
function over(t,event)
{	
	$("#tooltip").remove();	
	event = window.event || event; 
	showTooltip(event.clientX, event.clientY, t);	
}
function out()
{
	$("#tooltip").remove();
}
function readView()
{
	//fix bug:When browsing file, if click the vertical scroll bar faster, the whole browser page get to dark.		
	if (parent.$(".LightningUpdating").css('display') == "block") 
	{			
	   return;
	} 
	
	var total = jQuery('#flex1').flexTotal();
			
	var cmd_str;
	if ($("#id_now_path").text() == "")
	{
		cmd_str = "cgi_folder_content_first";
	}	
	else
		cmd_str = "cgi_folder_content";	
	
	var l = $('#flex1 tbody tr').length;	
	if (total == l) return;	
	var p = Math.floor(l/10)+1;					
	
		jQuery('#flex1').flexOptions({
			cmd: cmd_str,
			newp: p,
			page:p,
			query: ""
		});
		jQuery("#flex1").flexAppend();						
}
function contextMenuWork(action, el, pos) {

	switch (action) {
	case "Download":
		{
			parent.download_file_main();
			break;
		}
	case "Copy":
		{
			parent.copy();
			break;
		}

	case "Move":
		{
			parent.move();
			break;
		}
	case "Delete":
		{
			if (__read == "yes") {
				parent.jAlert(_T('_wfs', 'msg7'), _T('_common', 'error'));
				return;
			}

			var len = $('.trSelected', "#flex1").length;
			//	var flag = confirm(_T('_wfs','msg8'))	//Are you sure you want to delete the selected file(s)?

			parent.jConfirm('M', _T('_wfs', 'msg8'), _T('_common', 'warning'), function (flag) {

				if (flag == true) {
					if (len >= 1) {
						$('.trSelected').each(function (index) {
							var path = $(this).find("span").html();
							var type = $(this).find("td:eq(2) div").html();
							var name = $(this).find("span:eq(1)").html();
							del_file(path, type);
						});				
				        }
					//jQuery("#flex1").flexReload();
					table_reload_totop();
					parent.google_analytics_log('webfile-edit-num','');
				}

			});


			break;
		}
	case "Rename":
		{
			parent.rename();
			break;
		}
	case "Properties":
		{
			parent.properties();
			break;
		}
	case "Facebook":
		{
			facebook(__contextmenu);
			break;
		}
	case "Flickr":
		{
			flickr(__contextmenu);
			break;
		}
	case "Picasa":
		{
			picasa(__contextmenu);
			break;
		}
	case "Unzip":
		{
			parent.unzip();
			break;
		}
	case "Untar":
		{
			parent.untar();
			break;
		}
	case "Dropbox":
		{
			dropbox();
			break;
		}
	case "Open":
		{
			parent.doc_open();
			break;
		}
	case "Preview":
		{
			parent.preview();
			break;
		}
	case "Create_Zip":
		{
			if (__read == "yes") {
				parent.jAlert(_T('_wfs', 'msg7'), _T('_common', 'error'));
				return;
			}
			parent.create_zip();
			break;
		}
	case "Add_Zip":
		{
			//	parent.add_zip();
			if (__read == "yes") {
				parent.jAlert(_T('_wfs', 'msg7'), _T('_common', 'error'));
				return;
			}
			parent.add_zip();
			break;
		}
	}

}


function del_file(path, type) {
	if (__read == "yes") {
		parent.jAlert(_T('_wfs', 'msg7'), _T('_common', 'error'));
		return;
	}

	path = path.replace(/&nbsp;/g, ' ');
	path = path.replace(/&amp;/g, '&');

	var _data = "cmd=cgi_del&path=" + encodeURIComponent(path) + "&type=" + type;

	wd_ajax({
		type: "POST",
		async: false,
		cache: false,
		url: "/cgi-bin/webfile_mgr.cgi",
		data: _data,
		success: function (data) {		
		}
	});
}
function click_path(level) {
	if (level == "root") {
		var t = $("#id_now_path").text()
		var tt = t.split("/")
		var buf = "";
		for (var i = 0; i <= level; i++) {
			if(i == level)
				buf += tt[i];
			else
			buf += tt[i] + "/";
		}
		$("#id_now_path").text(buf);
		chg_location_path("/"+buf);

		jQuery('#flex1').flexOptions({
			cmd: 'cgi_folder_content_first',
			newp: 1,
			query: ""
		});
		jQuery("#flex1").flexReload();
		return;
	} else {

		var t = $("#id_now_path").text()
		var tt = t.split("/")
		var buf = "";
		for (var i = 0; i <= level; i++) {
			if (i == level)
				buf += tt[i];
			else	
			buf += tt[i] + "/";
		}
//console.log("buf = %s \n",buf);

		$("#id_now_path").text(buf);
		chg_location_path("/"+buf);

		new_dir = parent.translate_path_to_really(buf);
//		var j = buf.indexOf("/");
//		if (j != -1)
//		{
//			/*
//			path include share name -> real path
//			*/
//		var p = buf.substring(j,buf.length);
//		var p1 = buf.substring(0,j);
//console.log("p = %s ,p1 = %s\n",p,p1);
//		
//		var n  = parent.translate_path_to_really(p1);
//		new_dir = n+p;
//		}
//		else
//		{
//			new_dir = parent.translate_path_to_really(buf);
//		}	
//		
//console.log("n = %s ,new_dir = %s \n",n,new_dir);

		/*HDD_INFO_ARRAY = get_mapping_tb();


		var new_dir = parent.chg_path1(buf);

		new_dir = new_dir.replace(/&nbsp;/g, ' ');
		new_dir = new_dir.replace(/&amp;/g, '&');
*/

		__str = new_dir;

		jQuery('#flex1').flexOptions({
			cmd: 'cgi_folder_content',
			used_dir: new_dir,
			newp: 1,
			query: ""
		});
		//	jQuery('#flex1').flexOptions({dir: "/mnt/HD/HD_a2/"});      
		jQuery("#flex1").flexReload();

	}

}

function get_mapping_tb() {
	return parent.HDD_INFO_ARRAY;
}

function chg_location_path(kk) {
	$("#tooltip").remove();
	if (kk.substr(kk.length - 1, 1) == "/")
		kk = kk.substr(0, kk.length - 1);


	var buf = "";
	//console.log("level = %s ",__level)	
	var k = kk.split("/")
	//alert(k.length);

	if (kk == "")
	{
		buf +="<span style='font-size:15px;'>Shares</span>"
		$("#id_path").css("margin-top","-3px")

	}
	else
	{		
		buf +="<a href='javascript:click_path(\"root\")' style='font-size:15px;'>Shares</a><span style='font-size:18px'> > </span>"
		$("#id_path").css("margin-top","-3px")
	}	
	
	for (var i = 0;i<k.length;i++)
	{

		if (i == 0 && k[i] == "") {
			//buf +="<a href='javascript:#'></a>\\\\"
		} else {
			if (__level == 1 && i == 0)
				continue;

			if (i == k.length - 1)
				buf += k[i];
			else
				buf += "<a href='javascript:click_path(\"" + parseInt(i-1,10) + "\")' style='font-size:15px;' >" + k[i] + "</a>"


			if (i < k.length - 1)
				buf += " <span style='font-size:18px'>></span> "
		}
	}
	$("#id_path").html(buf);

	parent.$('#id_test1').text("")
	parent.$('#id_test1').append(buf)
	var j = parent.$('#id_test1').width()


	//		console.log("j = %s ",j);
	//		console.log("j = %s ",$('#id_path').width());

	if (j > 630) {
		var a_num = -1;
		$("#id_path a").each(function (index) {
			a_num = index;

			var str = $(this).text();


			$(this).bind({
				mouseout: function () { // do something on click 
					$("#tooltip").remove();
				},
				mouseover: function (event) {
					// do something on mouseenter 


					$("#tooltip").remove();
					showTooltip(event.pageX + 10, event.pageY - 20, str);
				}
			});

			$(this).text(".....")

			parent.$('#id_test1').text($("#id_path").text())
			var j = parent.$('#id_test1').width()
			if (j <= $('#id_path').width())
				return false;
		});

		if (a_num != -1) {
			$("#id_path a").each(function (index) {
				if ($(this).text() == ".....") {
					if (index != a_num) {
						$(this).css('display', 'none');
						$(this).next().text('');
						$(this).next().css('display', 'none')
					}
				}
			});
		}

	}
}

function showTooltip(x, y, contents) {
	$('<div id="tooltip">' + contents + '</div>').css({
		position: 'absolute',
		display: 'none',
        top: y - 5,
        left: x+3,
       border: '1px solid #F0F0F0',
        padding: '10px',
        'font-size':'10px',
         'background-color': '#15abff',
		opacity: 0.80,
        'z-index':99999,
        color:'#EAEAEA'    
	}).appendTo("body").fadeIn(200);
}

function table_reload_totop()
{
			jQuery('#flex1').flexOptions({			
								newp: "1",			
								query: ""
							});
								
			var element = $("#scrollbar_wfs").jScrollPane({autoReinitialise: true});
			var api = element.data('jsp');
			api.scrollTo(0,0);
			jQuery("#flex1").flexReload();
}