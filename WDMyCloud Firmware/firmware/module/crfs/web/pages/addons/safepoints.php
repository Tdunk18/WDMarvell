<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="no-cache">
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>

<link rel="stylesheet" type="text/css" href="/web/css/css_custom/safepoints.css?v=WDV1.02">

<script type="text/javascript">
$.safepoint_ajax_pool = [];
var _recover_type = "";
var _li_tpl_str = "";
var _safepoint_usb_info_list = usb_info_list;
var _safepoint_info_list;
var _safepoint_network_info_list = new Array();

var do_recover_get_status_timeout = -1;
var network_get_device_timeout = -1;
var get_share_show_idx = -1;
var now_list_scroll_idx = 3; //start idx = 3

$.safepoint_ajax_pool.abortAll = function() {
	clearInterval(safepoint_ajax_Interval_num);
	$(this).each(function(id, xhr) {
		xhr.abort();
	});
	$.safepoint_ajax_pool.length = 0;
	safepoint_ajax_Interval_num = setInterval('$.safepoint_ajax_pool.check()', 2000);
};

$.safepoint_ajax_pool.check = function() {
	var len = $.safepoint_ajax_pool.length;
	var i = len - 1;
	for (i; i >= 0; i--)
	{
		if ($.safepoint_ajax_pool[i].readyState == 4)
			$.safepoint_ajax_pool.splice(i, 1);
	} 	
	len = null;
	i = null;
};

var safepoint_ajax_Interval_num = setInterval('$.safepoint_ajax_pool.check()', 2000);

function safepoints_status_code(error_code)
{
	var str = "";
	switch(error_code)
	{
		case "1": //
			str = _T('_safepoints', 'error_code_1');
			break;
		case "2": //
			str = _T('_safepoints', 'error_code_2');
			break;
		case "3": //
			str = _T('_safepoints', 'error_code_3');
			break;
		case "4": //
			str = _T('_safepoints', 'error_code_4');
			break;
		case "5": //
			str = _T('_safepoints', 'error_code_5');
			break;
		case "6": //
			str = _T('_safepoints', 'error_code_6');
			break;
		case "7": //
			str = _T('_safepoints', 'error_code_7');
			break;
		case "8": //
			str = _T('_safepoints', 'error_code_8');
			break;
	}

	return str;
}

function safepoints_usb_get_safepoints_list()
{
	var sp_path = $("li.safepoint_share_list_item.sp_selected").attr('rel');
	var _list_ele = $('.safepoint_device_safepoints_list');
	var _wait_ele = $('#safepoint_restore_list_please_wait');
	var _no_sp_ele = $('#safepoint_restore_list_no_safepoints');

	_list_ele.empty();
	_list_ele.hide();
	_list_ele.css('top', '0px').attr('rel', 0);

	_no_sp_ele.hide();
	_wait_ele.show();

	$('#apps_safepointsNext2_button').removeClass('gray_out').addClass('gray_out');
	$('#safepoints_userUp_link').removeClass('gray_out').addClass('gray_out').hide();
	$('#safepoints_userDown_link').removeClass('gray_out').hide();

	$.safepoint_ajax_pool.push(wd_ajax({
		url: "/web/addons/safepoints_api.php",
		type: "POST",
		data: {
			action: "usb_get_safepoints",
			sp_path: sp_path
		},
		cache: false,
		dataType: "json",
		success: function(r) {
			if (r.success)
			{
				if (r.total == 0)
				{
					_no_sp_ele.show();
					_wait_ele.hide();
				}
				else
				{
					var _lists = r.lists;
					for(var l in _lists) {
						var _list_str = String.format("<li class='safepoint_restore_safepoint_list_item' rel='{1}'>{0}</li>", _lists[l].name, l)
						_list_ele.append(_list_str);
					}
					_list_ele.show();
				}
				_safepoint_info_list = r.lists;

				if (_safepoint_info_list.length > 3)
				{
					$('#safepoints_userUp_link').show();
					$('#safepoints_userDown_link').show();
				}

				//Add click event
				$('li.safepoint_restore_safepoint_list_item', _list_ele).click(function(){
					$("li.safepoint_restore_safepoint_list_item.sp_selected").removeClass('sp_selected');
					$(this).addClass('sp_selected');
					$('#apps_safepointsNext2_button').removeClass('gray_out');
					var idx = $(this).index();
					$("#safepoint_restore_details_last_update").html(multi_lang_format_time(parseInt(_safepoint_info_list[idx].last_updated_time, 10) * 1000));
					$("#safepoint_restore_details_created_for").html(_safepoint_info_list[idx].source_device_name);
				});

				_wait_ele.hide();
			}
		}
	}));
}

function safepoints_usb_send_recover()
{
	var idx = $('li.safepoint_restore_safepoint_list_item.sp_selected').attr('rel');

	adjust_dialog_size("#safepointsDiag", 600, 250);
	$("#safepointsDiag_title").html(_T('_safepoints', 'restore_progress'));
	$("#safepointsDiag").center();
	$("#safepointsSafepointRestore").show();
	$(".safepoints_process_text").html(_T("_safepoints", "preparing_data"));
	$("#safepoint_restore_progress_percentage").html(String.format(_T("_safepoints", "copied"), 0));
	$('#safepointsSafepointList').hide();

	$.safepoint_ajax_pool.push(wd_ajax({
		url: "/web/addons/safepoints_api.php",
		type: "POST",
		data: {
			action: "usb_do_recover",
			path: _safepoint_info_list[idx].path,
			usb_sharename: $("li.safepoint_share_list_item.sp_selected").html(),
			sp_name: _safepoint_info_list[idx].name
		},
		cache: false,
		dataType: "json",
		success: function(r) {
			if (r.success)
			{
				clearTimeout(do_recover_get_status_timeout);
				stop_web_timeout();
				safepoints_restore_get_status();
			}
		},
		error: function() {
		},
		complete: function() {
		}
	}));
}

function safepoints_network_get_safepoints_list()
{
	var sp_sharename = $("li.safepoint_share_list_item.sp_selected").attr('rel');
	var _list_ele = $('.safepoint_device_safepoints_list');
	var _wait_ele = $('#safepoint_restore_list_please_wait');
	var _no_sp_ele = $('#safepoint_restore_list_no_safepoints');

	var _share_ele = $("li.safepoint_share_list_item.sp_selected");
	var s_idx = _share_ele.index(); //share index

	_list_ele.hide().empty();
	_list_ele.css('top', '0px').attr('rel', 0);
	_no_sp_ele.hide();
	_wait_ele.show();

	$('#apps_safepointsNext2_button').removeClass('gray_out').addClass('gray_out');
	$('#safepoints_userUp_link').removeClass('gray_out').addClass('gray_out').hide();
	$('#safepoints_userDown_link').removeClass('gray_out').hide();

	var username = _safepoint_network_info_list[get_share_show_idx].user;
	var password = _safepoint_network_info_list[get_share_show_idx].pwd;

	if (_safepoint_network_info_list[get_share_show_idx]['share_list'][s_idx].user != "")
		username = _safepoint_network_info_list[get_share_show_idx]['share_list'][s_idx].user;

	if (_safepoint_network_info_list[get_share_show_idx]['share_list'][s_idx].pwd != "")
		password = _safepoint_network_info_list[get_share_show_idx]['share_list'][s_idx].pwd;

	$.safepoint_ajax_pool.push(wd_ajax({
		url: "/web/addons/safepoints_api.php",
		type: "POST",
		data: {
			action: "network_get_safepoints",
			ip: _safepoint_network_info_list[get_share_show_idx].ip,
			username: username,
			password: password,
			sp_sharename: sp_sharename
		},
		cache: false,
		dataType: "json",
		success: function(r) {
			if (r.success)
			{
				if (r.total == 0)
				{
					_list_ele.hide();
					_no_sp_ele.show();
				}
				else
				{
					var _lists = r.lists;
					for(var l in _lists) {
						var _list_str = String.format("<li class='safepoint_restore_safepoint_list_item' rel='{1}'>{0}</li>", _lists[l].name, l)
						_list_ele.append(_list_str);
					}
					_list_ele.show();
					_safepoint_info_list = r.lists;

					if (_safepoint_info_list.length > 3)
					{
						$('#safepoints_userUp_link').show();
						$('#safepoints_userDown_link').show();
					}
				}

				//Add click event
				$('li.safepoint_restore_safepoint_list_item', _list_ele).click(function(){
					$("li.safepoint_restore_safepoint_list_item.sp_selected").removeClass('sp_selected');
					$(this).addClass('sp_selected');
					$('#apps_safepointsNext2_button').removeClass('gray_out');
					var idx = $(this).index();
					$("#safepoint_restore_details_last_update").html(multi_lang_format_time(parseInt(_safepoint_info_list[idx].last_updated_time, 10) * 1000));
					$("#safepoint_restore_details_created_for").html(_safepoint_info_list[idx].source_device_name);
				});

				_wait_ele.hide();
				$('#apps_safepointsNext2_button').removeClass('gray_out').addClass('gray_out');
			}
		}
	}));
}

function safepoints_network_send_recover()
{
	var idx = $('li.safepoint_restore_safepoint_list_item.sp_selected').attr('rel'); //safepoint index
	var s_idx = $("li.safepoint_share_list_item.sp_selected").index(); //share index

	adjust_dialog_size("#safepointsDiag", 600, 250);
	$("#safepointsDiag_title").html(_T('_safepoints', 'restore_progress'));
	$("#safepointsDiag").center();
	$("#safepointsSafepointRestore").show();
	$(".safepoints_process_text").html(_T("_safepoints", "preparing_data"));
	$("#safepoint_restore_progress_percentage").html(String.format(_T("_safepoints", "copied"), 0));
	$('#safepointsSafepointList').hide();

	var username = _safepoint_network_info_list[get_share_show_idx].user;
	var password = _safepoint_network_info_list[get_share_show_idx].pwd;

	if (_safepoint_network_info_list[get_share_show_idx]['share_list'][s_idx].user != "")
		username = _safepoint_network_info_list[get_share_show_idx]['share_list'][s_idx].user;

	if (_safepoint_network_info_list[get_share_show_idx]['share_list'][s_idx].pwd != "")
		password = _safepoint_network_info_list[get_share_show_idx]['share_list'][s_idx].pwd;

	$.safepoint_ajax_pool.push(wd_ajax({
		url: "/web/addons/safepoints_api.php",
		type: "POST",
		data: {
			action: "network_do_recover",
			ip: _safepoint_network_info_list[get_share_show_idx].ip,
			share_name: $("li.safepoint_share_list_item.sp_selected").attr('rel'),
			username: username,
			password: password,
			sp_name: _safepoint_info_list[idx].name,
			hostname: _safepoint_network_info_list[get_share_show_idx].name
		},
		cache: false,
		dataType: "json",
		success: function(r) {
			if (r.success)
			{
				clearTimeout(do_recover_get_status_timeout);
				stop_web_timeout();
				safepoints_restore_get_status();
			}
		},
		error: function() {
		},
		complete: function() {
		}
	}));
}

function safepoints_restore_get_status()
{
	clearTimeout(do_recover_get_status_timeout);
	$.safepoint_ajax_pool.push(wd_ajax({
		url: "/web/addons/safepoints_api.php",
		type: "POST",
		data: {
			action: "do_recover_get_status"
		},
		cache: false,
		dataType: "json",
		success: function(r) {
			if (r.success)
			{
				if (parseInt(r.status, 10) <= 2)
					$(".safepoints_process_text").html(_T("_safepoints", "preparing_data"));
				else
					$(".safepoints_process_text").html(_T("_safepoints", "currently_copying"));

				$("#safepoint_restore_progress_percentage").html(String.format(_T("_safepoints", "copied"), r.progress));
				$("#safepoint_restore_progressbar").width(r.progress + '%');

				if (r.abortable == "1") //Can cancel
					$("#apps_safepointsCancel5_button").removeClass('gray_out');
				else
					$("#apps_safepointsCancel5_button").removeClass('gray_out').addClass('gray_out');

				if (r.result == "1") //Success, restore finish
				{
					$("#apps_safepointsCancel1_button").click(); //Clear all timeout and ajax request
					jAlert(_T('_safepoints', 'restore_done'), _T('_common', 'success'), "", null);
					return;
				}
				else if (r.result == "2") //Error/Cancel
				{
					restart_web_timeout();
					$("#apps_safepointsCancel1_button").click();
					jAlert(safepoints_status_code(r.error_code), _T('_common','error'), "", null);
					return;
				}
			}
			else
			{
			}

			do_recover_get_status_timeout = setTimeout('safepoints_restore_get_status()', 1000);
		},
		error: function() {
			restart_web_timeout();
		},
		complete: function() {
		}
	}));
}

function safepoints_scan_usb()
{
	get_share_show_idx = -1;
	$(".safepoint_nav .safepoint_nav_ul").css('margin-left', '0px');
	$("#safepoints_nav_left_link.ButtonArrowLeft").removeClass('gray_out').addClass('gray_out');
	$("#safepoints_nav_right_link.ButtonArrowRight").removeClass('gray_out');
	now_list_scroll_idx = 3;

	_safepoint_usb_info_list = usb_info_list;
	var usb_len = _safepoint_usb_info_list.length;
	var _list_ul_ele = $(".safepoint_nav_ul");
	_list_ul_ele.empty();

	for (var i = 0; i < usb_len; i++)
	{
		if (usb_info_list[i]['usb_type'] != "storage") //Not USB Stroage
			continue;

		var _li_str = String.format(_li_tpl_str, "safepoint_usb", "safepoint_device_usb_" + (i+1), _safepoint_usb_info_list[i]['device_name'], _safepoint_usb_info_list[i]['device_name']);
		_list_ul_ele.append(_li_str);
	}

	//Make partition list
	$("li", _list_ul_ele).each(function(idx) {
		$('.safepoint_device_name_link', $(this)).each(function(){
			var _this_parent = $(this).parent();
			var _partition_ul_ele = $(".safepoint_device_shares_list", _this_parent);
			_partition_ul_ele.empty();

			//List USB partition info
			var _partition = _safepoint_usb_info_list[idx].partition;
			for(var par in _partition) {
				var _share_list_str = String.format("<li class='safepoint_share_list_item' rel='{1}'>{0}</li>", _partition[par].share_name, _partition[par].base_path)
				_partition_ul_ele.append(_share_list_str);
			}
		});
	});

	$("li.safepoint_share_list_item.sp_selected").removeClass('sp_selected');
	$('#apps_safepointsNext1_button').removeClass('gray_out').addClass('gray_out');

	//Add click event
	$('.safepoint_device_name_link', _list_ul_ele).click(function(){
		var _this_parent = $(this).parent();
		$(".safepoint_device_wait_for_shares", _this_parent).show();
		$(".safepoint_device_shares", _this_parent).hide();
		var _partition_ul_ele = $(".safepoint_device_shares_list", _this_parent);

		$("li.safepoint_share_list_item.sp_selected").removeClass('sp_selected');
		$('#apps_safepointsNext1_button').removeClass('gray_out').addClass('gray_out');
		$("li.safepoint_share_list_item", _this_parent).click(function() {
			$(this).addClass('sp_selected');
			$('#apps_safepointsNext1_button').removeClass('gray_out');
		});

		$(".safepoint_device_wait_for_shares", _this_parent).hide();
		$(".safepoint_device_shares", _this_parent).show();
	});

	if (usb_len > 4)
		$("#safepoints_nav_left_link, #safepoints_nav_right_link").show();
	else
		$("#safepoints_nav_left_link, #safepoints_nav_right_link").hide();

	$('#apps_safepointsNext1_button').removeClass('gray_out').addClass('gray_out');
	$('#safepointsSearch').hide();
	$('#safepointsList').show();
}

function safepoints_scan_network()
{
	get_share_show_idx = -1;
	$(".safepoint_nav .safepoint_nav_ul").css('margin-left', '0px');
	$("#safepoints_nav_left_link.ButtonArrowLeft").removeClass('gray_out').addClass('gray_out');
	$("#safepoints_nav_right_link.ButtonArrowRight").removeClass('gray_out');
	now_list_scroll_idx = 3;

	if ($.isArray(_safepoint_network_info_list))
		_safepoint_network_info_list.length = 0;

	$.safepoint_ajax_pool.push(wd_ajax({
		url: "/web/addons/safepoints_api.php",
		type: "POST",
		data: {
			action: "network_get_device"
		},
		cache: false,
		dataType: "json",
		success: function(r) {
			if (r.success)
			{
				safepoints_wait_scan_network();
			}
		},
		error: function() {
		},
		complete: function() {
		}
	}));
}

function safepoints_wait_scan_network()
{
	$.safepoint_ajax_pool.push(wd_ajax({
		url: "/web/addons/safepoints_api.php",
		type: "POST",
		data: {
			action: "network_wait_get_device"
		},
		cache: false,
		dataType: "json",
		success: function(r) {
			if (!r.success)
			{
				clearTimeout(network_get_device_timeout);
				network_get_device_timeout = setTimeout('safepoints_wait_scan_network()', 3000);
				return;
			}

			var _list_ul_ele = $(".safepoint_nav_ul");
			_list_ul_ele.empty();

			var _lists = r.lists;
			for(var i in _lists)
			{
				var _li_str = String.format(_li_tpl_str, "safepoint_" + _lists[i]['model_name'], "safepoint_network" + (i+1), _lists[i]['name'], _lists[i]['name']);
				_list_ul_ele.append(_li_str);
			}
			_safepoint_network_info_list = r.lists;
			$("input:text, input:password").inputReset();
			$(".safepoint_share_authenticate_content_row input:text").attr('placeholder', _T('_safepoints', 'username'));
			$(".safepoint_share_authenticate_content_row input:password").attr('placeholder', _T('_safepoints', 'password'));
			language();

			//Add click event
			$('.safepoint_device_name_link', _list_ul_ele).click(function(){
				var _this_parent = $(this).parent();
				var idx = _this_parent.index();

				$("li.safepoint_share_list_item.sp_selected").removeClass('sp_selected');
				$(".safepoint_device_wait_for_shares").hide();
				$(".safepoint_device_authentication").hide();
				$(".safepoint_device_shares").hide();
				$(".safepoint_device_authenticate_remote_share_container").hide();

				if (_safepoint_network_info_list[idx].need_login && !_safepoint_network_info_list[idx].auth_status)
				{
					$(".safepoint_device_authentication", _this_parent).show();
				}
				else
				{
					$('.safepoint_device_shares', _this_parent).show();
					if (get_share_show_idx != idx)
						safepoints_network_get_share_list(_this_parent, idx);
				}

				$('#apps_safepointsNext1_button').removeClass('gray_out').addClass('gray_out');
			});

			if (r.total > 4)
				$("#safepoints_nav_left_link, #safepoints_nav_right_link").show();
			else
				$("#safepoints_nav_left_link, #safepoints_nav_right_link").hide();

			init_tooltip();

			$("li.safepoint_share_list_item.sp_selected").removeClass('sp_selected');
			$('#apps_safepointsNext1_button').removeClass('gray_out').addClass('gray_out');
			$('#safepointsSearch').hide();
			$('#safepointsList').show();
		},
		error: function() {
		},
		complete: function() {
		}
	}));
}

function safepoint_device_auth(ele)
{
	var _parent_ele = $(ele).parent().parent();
	var idx = _parent_ele.index();

	_safepoint_network_info_list[idx].user = $(".safepoint_share_authenticate_content_row input:text", ele).val();
	_safepoint_network_info_list[idx].pwd = $(".safepoint_share_authenticate_content_row input:password", ele).val();

	jLoading(_T('_common','set'), 'loading', 's', "");
	safepoints_network_get_share_list(_parent_ele, idx );
}

function safepoint_share_auth(ele)
{
	var _share_ele = $(".safepoint_share_list_item.sp_selected", $(ele).parent().parent());
	var idx = _share_ele.index();

	_safepoint_network_info_list[get_share_show_idx]['share_list'][idx].user = $(".safepoint_share_authenticate_content_row input:text", ele).val();
	_safepoint_network_info_list[get_share_show_idx]['share_list'][idx].pwd = $(".safepoint_share_authenticate_content_row input:password", ele).val();

	$('#apps_safepointsNext1_button').removeClass('gray_out').addClass('gray_out');

	jLoading(_T('_common','set'), 'loading', 's', "");
	safepoints_network_share_auth($(ele).parent().parent(), idx);
}

function safepoints_network_share_auth(ele, idx)
{
	$.safepoint_ajax_pool.push(wd_ajax({
		url: "/web/addons/safepoints_api.php",
		type: "POST",
		data: {
			action: "network_share_auth",
			ip: _safepoint_network_info_list[get_share_show_idx].ip,
			username: _safepoint_network_info_list[get_share_show_idx]['share_list'][idx].user,
			password: _safepoint_network_info_list[get_share_show_idx]['share_list'][idx].pwd,
			sharename: _safepoint_network_info_list[get_share_show_idx]['share_list'][idx].name
		},
		cache: false,
		dataType: "json",
		success: function(r) {
			if (r.status == "0")
			{
				$('#apps_safepointsNext1_button').removeClass('gray_out');
				_safepoint_network_info_list[get_share_show_idx]['share_list'][idx].public = true;
			}

			$(".safepoint_device_authenticate_remote_share_container", ele).hide();
			$(".safepoint_device_shares", ele).show();

		},
		error: function() {
		},
		complete: function() {
			jLoadingClose();
		}
	}));
}

function safepoints_network_get_share_list(ele, idx)
{
	if (get_share_show_idx == idx) return;

	get_share_show_idx = idx;
	$(".safepoint_device_wait_for_shares").hide();
	$(".safepoint_device_shares").hide();
	if (_safepoint_network_info_list[idx]['share_list'].length > 0)
	{
		$(".safepoint_device_authentication").hide();
		$(".safepoint_device_wait_for_shares", ele).hide();
		$(".safepoint_device_shares", ele).show();
		return;
	}

	if (_safepoint_network_info_list[idx]['auth_status'])
		$(".safepoint_device_wait_for_shares", ele).show();

	$.safepoint_ajax_pool.push(wd_ajax({
		url: "/web/addons/safepoints_api.php",
		type: "POST",
		data: {
			action: "network_get_sharefolder",
			ip: _safepoint_network_info_list[idx].ip,
			user: _safepoint_network_info_list[idx].user,
			pwd: _safepoint_network_info_list[idx].pwd
		},
		cache: false,
		dataType: "json",
		success: function(r) {
			$(".safepoint_device_authentication").hide();

			if (r.success)
			{
				if (r.status === "1") //Login fail
				{
					$("> div", ele).hide();
					$(".safepoint_share_authenticate_content_row input:text", ele).val('');
					$(".safepoint_share_authenticate_content_row input:password", ele).val('');
					get_share_show_idx = -1;
					return;
				}

				//Make share list
				var _this_parent = ele;
				var _share_ul_ele = $(".safepoint_device_shares_list", _this_parent);
				_share_ul_ele.empty();
	
				//List share info
				var _list = r.lists;
				for(var i in _list) {
					var _share_list_str = String.format("<li class='safepoint_share_list_item' rel='{1}'>{0}</li>", _list[i].name, _list[i].name)
					_share_ul_ele.append(_share_list_str);
					_safepoint_network_info_list[idx]['share_list'].push(_list[i]);
				}

				$("li.safepoint_share_list_item", _this_parent).click(function() {
					$("li.safepoint_share_list_item.sp_selected").removeClass('sp_selected');
					$(this).addClass('sp_selected');
					if (!_safepoint_network_info_list[get_share_show_idx]['share_list'][$(this).index()].public)
					{
						$(".safepoint_device_shares", _this_parent).hide();
						$(".safepoint_device_authenticate_remote_share_container", _this_parent).show();
						$(".safepoint_share_authenticate_content_row input", _this_parent).val('');
					}
					else
						$('#apps_safepointsNext1_button').removeClass('gray_out');
				});

				$(".safepoint_device_wait_for_shares", ele).hide();

				if (_safepoint_network_info_list[idx]['share_list'].length > 3)
				{
					$(".ButtonArrowTop", ele).removeClass('gray_out').addClass('gray_out').show();
					$(".ButtonArrowBottom", ele).removeClass('gray_out').show();
				}
				else
				{
					$(".ButtonArrowTop", ele).hide();
					$(".ButtonArrowBottom", ele).hide();
				}

				if (get_share_show_idx == idx)
					$(".safepoint_device_shares", ele).show();

				_safepoint_network_info_list[idx]['auth_status'] = true;
			}
		},
		error: function() {
		},
		complete: function() {
			jLoadingClose();
		}
	}));
}

function safepoints_scrollDivRight(id)
{ 
	var ele = $("#safepoints_nav_right_link.ButtonArrowRight");
	if (ele.hasClass('gray_out')) return;
	var margin_left_pos = 151;
	var now_margin_left_pos = parseInt($(".safepoint_nav .safepoint_nav_ul").css('margin-left'), 10);
	$(".safepoint_nav .safepoint_nav_ul").css('margin-left', (now_margin_left_pos - margin_left_pos) + "px");
	now_list_scroll_idx++;

	$("#safepoints_nav_left_link.ButtonArrowLeft").removeClass('gray_out');
	if (now_list_scroll_idx == _safepoint_network_info_list.length-1)
		ele.addClass('gray_out');
} 

function safepoints_scrollDivLeft(id)
{ 
	if($("#safepoints_nav_left_link.ButtonArrowLeft").hasClass('gray_out')) return;

	var ele = $("#safepoints_nav_left_link.ButtonArrowLeft");
	if (ele.hasClass('gray_out')) return;
	var margin_left_pos = 151;
	var now_margin_left_pos = parseInt($(".safepoint_nav .safepoint_nav_ul").css('margin-left'), 10);

	if ((now_margin_left_pos + margin_left_pos) == 0)
		ele.addClass('gray_out');

	$(".safepoint_nav .safepoint_nav_ul").css('margin-left', (now_margin_left_pos + margin_left_pos) + "px");
	now_list_scroll_idx--;

	$("#safepoints_nav_right_link.ButtonArrowRight").removeClass('gray_out');
}

function safepoints_scrollDivDown(ele, _type)
{
	var _p_ele = $(ele).parent();
	if ($(ele).hasClass('gray_out')) return;
	var ul_ele = (_type == "share") ? $("ul.safepoint_device_shares_list", _p_ele) : $("ul.safepoint_device_safepoints_list", _p_ele);
	var ul_ele_scroll_idx = ul_ele.attr('rel');
	var margin_pos = 31;
	var now_pos = parseInt(ul_ele.css('top'), 10);

	if (ul_ele_scroll_idx === undefined)
		ul_ele_scroll_idx = 0;
	else
		parseInt(ul_ele_scroll_idx, 10);

	ul_ele.css('top', (now_pos - margin_pos) + "px");
	ul_ele_scroll_idx++;

	ul_ele.attr('rel', ul_ele_scroll_idx);

	$(".ButtonArrowTop", _p_ele).removeClass('gray_out');

	if (ul_ele_scroll_idx == $("> li", ul_ele).length-3)
		$(ele).addClass('gray_out');
} 

function safepoints_scrollDivUp(ele, _type)
{ 
	var _p_ele = $(ele).parent();
	if ($(ele).hasClass('gray_out')) return;
	var ul_ele = (_type == "share") ? $("ul.safepoint_device_shares_list", _p_ele) : $("ul.safepoint_device_safepoints_list", _p_ele);
	var ul_ele_scroll_idx = ul_ele.attr('rel');
	var margin_pos = 31;
	var now_pos = parseInt(ul_ele.css('top'), 10);

	if (ul_ele_scroll_idx === undefined)
		ul_ele_scroll_idx = 0;
	else
		parseInt(ul_ele_scroll_idx, 10);

	if (now_pos + margin_pos >= 0)
	{
		ul_ele.css('top', "0px");
		$(ele).addClass('gray_out');
		ul_ele_scroll_idx = 0;
	}
	else
	{
		ul_ele.css('top', (now_pos + margin_pos) + "px");
		ul_ele_scroll_idx--;
	}

	ul_ele.attr('rel', ul_ele_scroll_idx);

	$(".ButtonArrowBottom", _p_ele).removeClass('gray_out');
}

function safepoints_restore_cancel()
{
	wd_ajax({
		url: "/web/addons/safepoints_api.php",
		type: "POST",
		data: {
			action: "recover_cancel"
		},
		cache: false,
		dataType: "json",
		success: function(r) {
			if (r.success)
			{
				//Show message?
				//alert('Cancel!');
			}
		},
		error: function() {
		},
		complete: function() {
		}
	})
}

function safepoints_show_restore_dialog()
{
	clearTimeout(do_recover_get_status_timeout);
	stop_web_timeout();
	safepoints_restore_get_status();

	var _diag = $("#safepointsDiag");
	_diag.overlay({fixed: false, oneInstance:false, expose: '#000', api:true, closeOnClick:false, closeOnEsc:false}).load();
	adjust_dialog_size("#safepointsDiag", 600, 250);
	_diag.center();
	$(".safepoints_process_text").html(_T("_safepoints", "currently_copying"));
	$("#safepointsDiag_title").html(_T('_safepoints', 'restore_progress'));
	$("._safepoint_dialog_div").hide();
	$("#safepointsSafepointRestore").show();
	$("#safepoint_restore_progress_percentage").html(String.format(_T("_safepoints", "copied"), 0));
	$('#safepointsSafepointList').hide();
}

function page_load(_sub_page_callback)
{
	var _diag = $("#safepointsDiag");
	$("#apps_safepointsrecovery_button").click(function(){
	$.safepoint_ajax_pool.abortAll();
		adjust_dialog_size("#safepointsDiag", 800, 430);
		$("#safepointsDiag").center();
		$("#safepointsDiag_title").html(_T('_safepoints', 'sub_title'));

		_diag.overlay({fixed: false, oneInstance:false, expose: '#000', api:true, closeOnClick:false, closeOnEsc:false}).load();
		_diag.center();
		$("._safepoint_dialog_div").hide();
		$('#safepointsScan').show();
		$('#apps_safepointsCancel1_button').show();
	});

	$("#apps_safepointsCancel1_button, #apps_safepointsCancel2_button, #apps_safepointsCancel3_button, #apps_safepointsCancel4_button").click(function(){
		_diag.overlay().close();
		clearTimeout(do_recover_get_status_timeout);
		clearTimeout(network_get_device_timeout);
		$.safepoint_ajax_pool.abortAll();
	});

	//Restore cancel
	$("#apps_safepointsCancel5_button").click(function(){
		if ($(this).hasClass('gray_out')) return;

		_diag.overlay().close();
		clearTimeout(do_recover_get_status_timeout);
		clearTimeout(network_get_device_timeout);
		$.safepoint_ajax_pool.abortAll();

		safepoints_restore_cancel();
	});

	//Scan USB
	$("#safepoint_get_usb_list").click(function(){
		$("._safepoint_dialog_div").hide();
		$('#safepointsSearch').show();
		$('#safepoint_wait_for_usb_devices').show();
		$('#safepoint_wait_for_network_devices').hide();
		_recover_type = "usb";
		safepoints_scan_usb();
	});

	//Scan Network
	$("#safepoint_get_network_device_list").click(function(){
		$("._safepoint_dialog_div").hide();
		$('#safepointsSearch').show();
		$('#safepoint_wait_for_usb_devices').hide();
		$('#safepoint_wait_for_network_devices').show();
		_recover_type = "network";
		safepoints_scan_network();
	});

	$("#safepoint_nav_reload_link").click(function(){
		if (_recover_type == "usb")
			$("#safepoint_get_usb_list").click();
		else if (_recover_type == "network")
			$("#safepoint_get_network_device_list").click();
	});

	//USB: select a device -> USB/Network
	$("#apps_safepointsBack1_button").click(function(){
		$('#safepointsScan').show();
		$('#safepointsSearch').hide();
	});

	//USB: select a device List -> USB/Network
	$("#apps_safepointsBack2_button").click(function(){
		$('#safepointsScan').show();
		$('#safepointsSearch').hide();
		$('#safepointsList').hide();
	});

	//Safepoint List -> device list
	$("#apps_safepointsBack3_button").click(function(){
		$('#safepointsList').show();
		$('#safepointsSafepointList').hide();
		adjust_dialog_size("#safepointsDiag", 800, 430);
		$("#safepointsDiag").center();
	});

	//Select a partition/share
	$('#apps_safepointsNext1_button').click(function() {
		$('#safepointsSafepointList').show();
		$('#safepointsList').hide();
		adjust_dialog_size("#safepointsDiag", 800, 500);
		$("#safepointsDiag").center();

		if (_recover_type == "usb")
			safepoints_usb_get_safepoints_list();
		else if (_recover_type == "network")
			safepoints_network_get_safepoints_list();
	});

	//Finish
	$('#apps_safepointsNext2_button').click(function() {
		jConfirm("", _T("_safepoints", "msg_pre_restore"), _T("_safepoints", "restore_progress"), "", function(r) {
			if (!r)
				return;

			if (_recover_type == "usb")
				safepoints_usb_send_recover();
			else if (_recover_type == "network")
				safepoints_network_send_recover();
		});
	});

	_li_tpl_str = $(".safepoint_nav_ul").html();

	if (_sub_page_callback)
		_sub_page_callback();
}

function page_unload()
{
	_li_tpl_str = null;
	clearTimeout(do_recover_get_status_timeout);
	clearTimeout(network_get_device_timeout);
	$.safepoint_ajax_pool.abortAll();
}
</script>

<body>
<div class="h1_content header_2"><span class="_text" lang="_safepoints" datafld="sub_title"></span></div>
<div class="field_top"><span class="_text" lang="_safepoints" datafld="desc"></span></div>

<button type="button" class="field_top" id="apps_safepointsrecovery_button"><span class="_text" lang="_safepoints" datafld="button_start_recovery"></span></button>

<div id="safepointsDiag" class="WDLabelDiag" style="display:none;">
	<div id="safepointsDiag_title" class="WDLabelHeaderDialogue WDLabelHeaderDialogueFolderIcon">
		<span class="_text" lang="_safepoints" datafld="sub_title"></span>
	</div>
	
	<!-- USB/Network -->
	<div id="safepointsScan" style="display:none;" class="_safepoint_dialog_div">
		<div class="WDLabelBodyDialogue">
			<div class="dialog_content">
				<div>
					<span class="_text" lang="_safepoints" datafld="recovery_desc"></span>
				</div>
				<p>&nbsp;</p>

				<div class="safepoint_wizard_device_discovery wizard_two_column">
					<div class="wizard_box">
						<div id="safepoint_wizard_device_discovery_usb_icon" class="safepoint_wizard_device_discovery_icon"></div>
						<div class="">
							<a id="safepoint_get_usb_list" href="#" onClick="return false;" class="edit_detail"><span class="_text" lang="_safepoints" datafld="local_usb"></span><span class="details_link_marker">&nbsp;»</span></a> 
						</div>
					</div>

					<div class="wizard_box">
						<div id="safepoint_wizard_device_discovery_network_icon" class="safepoint_wizard_device_discovery_icon"></div>
						<div class="">
							<a id="safepoint_get_network_device_list" href="#" onClick="return false;" class="edit_detail"><span class="_text" lang="_safepoints" datafld="scan_network"></span><span class="details_link_marker">&nbsp;»</span></a> 
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="hrBottom2"><hr></div>
		<button type="button" id="apps_safepointsCancel1_button" class="ButtonMarginLeft_40px"><span class="_text" lang="_button" datafld="Cancel"></span></button>
	</div>

	<!-- USB/Network Search -->
	<div id="safepointsSearch" style="display:none;" class="_safepoint_dialog_div">
		<div class="WDLabelBodyDialogue">
			<div class="dialog_content">
				<h2>
					<span class="_text" lang="_safepoints" datafld="select_a_drive"></span>
				</h2>
	
				<div id="safepoint_wait_for_usb_devices" style="display: none;">
					<div class="safepoint_wait_inside">
						<span class="spinnerSunIcon"></span>
						<span class="_text safepoint_wizard_label" lang="_safepoints" datafld="search_usb"></span>
					</div>
				</div>

				<div id="safepoint_wait_for_network_devices" style="display: none;">
					<div class="safepoint_wait_inside">
						<span class="spinnerSunIcon"></span>
						<span class="_text safepoint_wizard_label" lang="_safepoints" datafld="search_network_wait"></span>
					</div>
				</div>
			</div>
		</div>

		<div class="hrBottom2"><hr></div>
		<button type="button" id="apps_safepointsBack1_button" class="ButtonMarginLeft_40px back"><span class="_text" lang="_button" datafld="back"></span></button>
		<button type="button" id="apps_safepointsCancel2_button" class="ButtonMarginLeft_40px"><span class="_text" lang="_button" datafld="Cancel"></span></button>
	</div>

	<!-- Device List -->
	<div id="safepointsList" style="display:none;" class="_safepoint_dialog_div">
		<div class="WDLabelBodyDialogue">
			<div class="dialog_content">
				<h2>
					<span class="_text" lang="_safepoints" datafld="select_a_drive"></span>
				</h2>

				<table border='0' cellspacing="0" cellpadding="0">
					<tr>
						<td>
							<div id="safepoints_nav_left_link" class="ButtonArrowLeft gray_out" onmousedown="safepoints_scrollDivLeft('safepoint_top_nav')">
								<div class="ButtonArrowLeftListUp"></div>
							</div>
						</td>
						<td>
							<div>
								<div class="safepoint_nav_reload"><a id="safepoint_nav_reload_link" href="#" onClick="return false;"></a></div>
								<div class="safepoint_top_nav_container">
									<nav class="safepoint_nav" id="safepoint_top_nav">
										<ul class="safepoint_nav_ul">
											<li class="safepoint_device_list_item {0} id="{1}">
												<a href="" onClick="return false;" class="safepoint_device_name_link">
													<span class="safepoint_device_name_container">
														<span class="safepoint_device_name overflow_hidden_nowrap_ellipsis TooltipIcon"  title="{3}">{2}</span>
														<span class="safepoint_device_arrow"></span>
													</span>
												</a>

												<div class="safepoint_device_wait_for_shares" style="display: none;">
														<p class="safepoint_share_list_please_wait" style="display:block">Retrieving Shares</p>    							
												</div>
												<div class="safepoint_device_authentication" style="display: none;">
													<form class="safepoint_device_authenticate_remote_device" method="POST" action="nas_authenticate" onSubmit="safepoint_device_auth(this); return false;">
														<div class="safepoint_share_authenticate_content_row safepoint_device_authentication_title">
															<label><span class="_text" lang="_safepoints" datafld="device_login"></span></label>
														</div>
														<div class="safepoint_share_authenticate_content_row">
															<input type="text" value="" name="user" placeholder="">
														</div>
														<div class="safepoint_share_authenticate_content_row">
															<input type="password" value="" class="pswd_unencoded" placeholder="">
														</div>
														<div class="safepoint_share_authenticate_content_row">
															<button type="submit"><span class="_text" lang="_button" datafld="Ok"></span></button>
														</div>
													</form>
												</div>
												<div class="safepoint_device_shares" style="display: none;">
													<ul class="ButtonArrowTop enable gray_out" onmousedown="safepoints_scrollDivUp(this, 'share')"  style="display: none;">
														<li class="ButtonArrowUpListUp"></li>
													</ul>
													<div class="safepoint_device_shares_list_container">
														<ul class="safepoint_device_shares_list" style="display:block">
														</ul>
														<p class="safepoint_share_list_please_wait" style="display:none">Retrieving Shares</p>
													</div>
													<ul class="ButtonArrowBottom enable" onmousedown="safepoints_scrollDivDown(this, 'share')" style="display: none;">
														<li class="ButtonArrowDownListUp"></li>
													</ul>
												</div>
												<div class="safepoint_device_authenticate_remote_share_container" style="display: none;">
													<form action="share_authenticate" method="POST" class="safepoint_device_authenticate_remote_share" onSubmit="safepoint_share_auth(this); return false;">
														<div class="safepoint_share_authenticate_content_row safepoint_share_authentication_title">
															<label><span class="_text" lang="_safepoints" datafld="share_login">Share Login</span></label>
														</div>
														<div class="safepoint_share_authenticate_content_row">
															<input type="text" value="" name="user" placeholder="">
														</div>
														<div class="safepoint_share_authenticate_content_row">
															<input type="password" value="" class="pswd_unencoded" placeholder="">
														</div>
						
														<div class="safepoint_share_authenticate_content_row">
															<button type="submit"><span class="_text" lang="_button" datafld="Ok"></span></button>
														</div>
													</form>
												</div>
											</li>
										</ul>
									</nav>
								</div>
							</div>
						</td>
						<td>
							<div id="safepoints_nav_right_link" class="ButtonArrowRight" onmousedown="safepoints_scrollDivRight('safepoint_top_nav')">
								<div class="ButtonArrowRightListUp"></div>
							</div> 
						</td>
					</tr>
				</table>
			</div>
		</div>

		<div class="hrBottom2"><hr></div>
		<button type="button" id="apps_safepointsBack2_button" class="ButtonMarginLeft_40px back"><span class="_text" lang="_button" datafld="back"></span></button>
		<button type="button" id="apps_safepointsCancel3_button" class="ButtonMarginLeft_40px"><span class="_text" lang="_button" datafld="Cancel"></span></button>
		<button type="button" id="apps_safepointsNext1_button" class="ButtonRightPos1"><span class="_text" lang="_button" datafld="Next"></span></button>
	</div>

	<!-- Safepoint List -->
	<div id="safepointsSafepointList" style="display:none;" class="_safepoint_dialog_div">
		<div class="WDLabelBodyDialogue">
			<div class="dialog_content">
				<h2>
					<span class="_text" lang="_safepoints" datafld="choose_a_savepoint"></span>
				</h2>
				<br><br>

				<div>
					<span class="_text" lang="_safepoints" datafld="choose_desc"></span>
				</div>
				<br>

				<ul id="safepoints_userUp_link" class="ButtonArrowTop enable gray_out" onmousedown="safepoints_scrollDivUp(this, 'safepoint')" style="display: none;">
					<li class="ButtonArrowUpListUp"></li>
				</ul>
				<div class="safepoint_device_safepoints" id="safepoint_restore_safepoints_list">
					<div id="safepoint_restore_safepoint_list_container" class="safepoint_device_safepoints_list_container">
						<ul style="display: none; top: 0px;" class="safepoint_device_safepoints_list"></ul>
						<p id="safepoint_restore_list_please_wait" style="display: block;"><span class="_text" lang="_safepoints" datafld="retrieving_safepoints"></span></p>
						<p id="safepoint_restore_list_no_safepoints" style="display: none;"><span class="_text" lang="_safepoints" datafld="no_safepoints"></span></p>
					</div>
				</div>
				<ul id="safepoints_userDown_link" class="ButtonArrowBottom enable" onmousedown="safepoints_scrollDivDown(this, 'safepoint')" style="display: none;">
					<li class="ButtonArrowDownListUp"></li>
				</ul>

				<div class="safepoint_restore_safepoint_details" style="display: block;">
					<h3><span class="_text" lang="_safepoints" datafld="safepoint_details"></span></h3>
					<div><label><span class="_text" lang="_safepoints" datafld="last_updated"></span></label><span id="safepoint_restore_details_last_update"></span></div>
					<div><label><span class="_text" lang="_safepoints" datafld="created_for"></span></label><span id="safepoint_restore_details_created_for"></span></div>
				</div>
			</div>
		</div>

		<div class="hrBottom2"><hr></div>
		<button type="button" id="apps_safepointsBack3_button" class="ButtonMarginLeft_40px back"><span class="_text" lang="_button" datafld="back"></span></button>
		<button type="button" id="apps_safepointsCancel4_button" class="ButtonMarginLeft_40px"><span class="_text" lang="_button" datafld="Cancel"></span></button>
		<button type="button" id="apps_safepointsNext2_button" class="ButtonRightPos1"><span class="_text" lang="_button" datafld="finish"></span></button>
	</div>

	<!-- Recovery -->
	<div id="safepointsSafepointRestore" style="display:none;" class="_safepoint_dialog_div">
		<div class="WDLabelBodyDialogue">
			<div class="dialog_content">
				<div class="safepoints_process_text"></div>
			</div>
			<br><br>

			<div class="safepointsSafepoint_process_bar"><div id="safepoint_restore_progressbar" class="bar_p"></div></div>
			<div id="safepoint_restore_progress_percentage"></div>
		</div>

		<div class="hrBottom2"><hr></div>
		<button type="button" id="apps_safepointsCancel5_button" class="ButtonMarginLeft_40px"><span class="_text" lang="_button" datafld="Cancel"></span></button>
	</div>
</div>

</body>
</html>	