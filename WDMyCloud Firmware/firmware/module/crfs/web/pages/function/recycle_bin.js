var enable_auto_clear = 0;
var clear_days = 0;

function get_recycle_bin_info()
{
	wd_ajax({
		url: "/web/setting/recycle_bin.php",
		type: "POST",
		data: {
			action: "get_info"
		},
		cache: false,
		dataType: "json",
		success: function(r) {
			enable_auto_clear = parseInt(r.auto_clear, 10);
			clear_days = (r.clear_days == "") ? 0 : r.clear_days;

			if(enable_auto_clear == 1)
				$("#recycle_bin_clear_days_div").show();
			else
				$("#recycle_bin_clear_days_div").hide();
		}
	});
}

function save_recycle_bin_info()
{
	var _e = $("#settings_recyclBinClearDays_text");
	var day_val = _e.val();
	if (day_val == "" || day_val == "0" || parseInt(day_val, 10) > 365)
	{
		show_error_tip(".tip_clear_day_error", _T('_recycle', 'err_clear_days_empty'));
		_e.focus();
		_e = null;
		return;
	}

	jLoading(_T('_common','set'), 'loading', 's', "");
	wd_ajax({
		url: "/web/setting/recycle_bin.php",
		type: "POST",
		data: {
			action: "save",
			enable_auto_clear: getSwitch('#settings_recycleBin_switch'),
			clear_days: _e.val()
		},
		cache: false,
		dataType: "json",
		success: function(r) {
			enable_auto_clear = getSwitch('#settings_recycleBin_switch');
			clear_days = _e.val();

			google_analytics_log('autoclear-recycle-en', enable_auto_clear);
			
		},
		complete: function() {
			jLoadingClose();
			$("#recycleBinDiag .close").trigger("click");
		}
	});
}

function init_recycle_bin_diag()
{
	get_recycle_bin_info();

	$("#settings_recycleBin_switch").click(function(){
		if(getSwitch('#settings_recycleBin_switch') == 1)
			$("#recycle_bin_clear_days_div").show();
		else
			$("#recycle_bin_clear_days_div").hide();
	});

	$("#settings_recycleBinConfig_link").click(function() {
		$("#recycleBinDiag .TooltipIconError").removeClass('SaveButton');
		$("#recycleBinDiag .TooltipIconError").addClass('SaveButton');

		setSwitch('#settings_recycleBin_switch', enable_auto_clear);
		$("#settings_recyclBinClearDays_text").numeric({decimal: false, negative: false});
		$("#settings_recyclBinClearDays_text").val(parseInt(clear_days, 10));

		$("#recycleBinDiag_title").html(_T('_recycle', 'title'));
		$("#recycleBinDiag").overlay({oneInstance:false, expose: '#000', api:true, closeOnClick:false, closeOnEsc:false}).load();

		$("#recycleBinDiag .close").click(function(){
			$("#recycleBinDiag").overlay().close();
			$("#recycleBinDiag .close").unbind('click');
		});
		$("input:text").inputReset();
	});
}
