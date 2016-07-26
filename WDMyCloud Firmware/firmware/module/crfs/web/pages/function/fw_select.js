_SELECT_ITEMS = new Array("settings_fwSch_select", "settings_fwPm_select", "settings_fwTime_select");
var _g_sch = 0;
var _g_pm = 0;
var _g_time = 1

	function draw_select() {
		sch_week_select();		
		time_select();
		if(TIME_FORMAT=="12")
			pm_select();
	}

	function sch_week_select() {
		var select_array = new Array(
		//0,1,2,3,4
		_T('_mail', 'random'),
		_T('_mail', 'daily'),
			_T('_mail', 'sun'),
			_T('_mail', 'mon'),
			_T('_mail', 'tue'),
			_T('_mail', 'wed'),
			_T('_mail', 'thu'),
			_T('_mail', 'fri'),
			_T('_mail', 'sat')


		);

		var select_v_array = new Array(
			8,7, 0, 1, 2, 3, 4, 5, 6);

		SIZE = select_v_array.length;
		SIZE2 = 2;

		var a = new Array(SIZE);

		for (var i = 0; i < SIZE; i++) {
			a[i] = new Array(SIZE2);
		}

		for (var i = 0; i < SIZE; i++)
			for (var j = 0; j < SIZE2; j++) {
				a[i][0] = select_array[i];
				a[i][1] = select_v_array[i];
		}

		$('#id_sch_top_main').empty();

		var my_html_options = "";

		my_html_options += "<ul>";
		my_html_options += "<li class='option_list'>";
		my_html_options += "<div id=\"settings_fwSch_select\" class=\"wd_select option_selected\">";
		my_html_options += "<div class=\"sLeft wd_select_l\"></div>";
		my_html_options += "<div class=\"sBody text wd_select_m\" id=\"id_sch\" rel='" + _g_sch + "'>" + map_table(_g_sch) + "</div>";

		my_html_options += "<div class=\"sRight wd_select_r\"></div>";
		my_html_options += "</div>";
		my_html_options += "<ul class='ul_obj' id='id_sch_li'>"
		my_html_options += "<div class='scrollbar_fw'>";
		my_html_options += "<li id=\"settings_fwSchLi1_select\" class=\"li_start\" rel=\"" + select_v_array[0] + "\" ><a href='#'>" + select_array[0] + "</a></li>";

		for (var i = 1; i < select_array.length - 1; i++) {
			my_html_options += "<li id=\"settings_fwSchLi"+(i+1)+"_select\" rel=\"" + select_v_array[i] + "\" ><a href='#'>" + select_array[i] + "</a></li>";
		}
		var j = select_array.length - 1;
		my_html_options += "<li id=\"settings_fwSchLi"+(j+1)+"_select\" class=\"li_end\" rel='" + select_v_array[j] + "' ><a href='#'>" + select_array[select_array.length - 1] + "</a></li>";
		my_html_options += "</div>";
		my_html_options += "</ul>";
		my_html_options += "</li>";
		my_html_options += "</ul>";

		$("#id_sch_top_main").append(my_html_options);

		function map_table(rel) {
			for (var i = 0; i < SIZE; i++)
				for (var j = 0; j < SIZE2; j++) {
					a[i][0] = select_array[i];
					a[i][1] = select_v_array[i];
					if (a[i][1] == rel) {
						return a[i][0];
					}
			}
		}

	}

	function pm_select() {
		var select_array = new Array(
		//0,1,2,3,4
		"AM", "PM");
		var select_v_array = new Array(
			0, 1);

		SIZE = 2;
		SIZE2 = 2;

		var a = new Array(SIZE);

		for (var i = 0; i < SIZE; i++) {
			a[i] = new Array(SIZE2);
		}

		for (var i = 0; i < SIZE; i++)
			for (var j = 0; j < SIZE2; j++) {
				a[i][0] = select_array[i];
				a[i][1] = select_v_array[i];
		}

		$('#id_pm_top_main').empty();


		var my_html_options = "";

		my_html_options += "<ul>";
		my_html_options += "<li class='option_list'>";
		my_html_options += "<div id=\"settings_fwPm_select\" class=\"wd_select option_selected\" >";
		my_html_options += "<div class=\"sLeft wd_select_l\"></div>";
		my_html_options += "<div class=\"sBody text wd_select_m\" id=\"id_pm\" rel='" + _g_pm + "'>" + map_table(_g_pm) + "</div>";

		my_html_options += "<div class=\"sRight wd_select_r\"></div>";
		my_html_options += "</div>";
		my_html_options += "<ul class='ul_obj' id='id_pm_li'><div>"
		my_html_options += "<li id=\"settings_fwPmLi1_select\" class=\"li_start\" rel=\"" + select_v_array[0] + "\" ><a href='#'>" + select_array[0] + "</a>";


		for (var i = 1; i < select_array.length - 1; i++) {
			my_html_options += "<li id=\"settings_fwPmLi"+(i+1)+"_select\" rel=\"" + select_v_array[i] + "\" ><a href='#'>" + select_array[i] + "</a>";
		}
		var j = select_array.length - 1;
		my_html_options += "<li id=\"settings_fwPmLi"+(j+1)+"_select\" class=\"li_end\" rel='" + select_v_array[j] + "'><a href='#'>" + select_array[select_array.length - 1] + "</a>";
		my_html_options += "</div></ul>";
		my_html_options += "</li>";
		my_html_options += "</ul>";

		$("#id_pm_top_main").append(my_html_options);

		function map_table(rel) {
			for (var i = 0; i < SIZE; i++)
				for (var j = 0; j < SIZE2; j++) {
					a[i][0] = select_array[i];
					a[i][1] = select_v_array[i];
					if (a[i][1] == rel) {
						return a[i][0];
					}
			}
		}

	}

	function time_select() {
		
//	var new_hour = __hour;
//	var start="",end="";
	
	if(TIME_FORMAT=="12")
	{
		var select_array = new Array(
			"1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00");
		var select_v_array = new Array(
			1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0);

		SIZE = 12;
		SIZE2 = 2;
			
		
//	if (__hour >12)
//		new_hour = new_hour -12;
//		
//		pm_select();
//		
//		start = 1;
//		end = 12;
	}
	else
	{
		
		var select_array = new Array(
		"0:00",	"1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00");
		var select_v_array = new Array(
			0,1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,13,14,15,16,17,18,19,20,21,22,23);

		SIZE = 24;
		SIZE2 = 2;
		
//		$('#id_pm_top_main').empty();
//		start = 0;
//		end = 23;
	}
		
		
		




		var a = new Array(SIZE);

		for (var i = 0; i < SIZE; i++) {
			a[i] = new Array(SIZE2);
		}

		for (var i = 0; i < SIZE; i++)
			for (var j = 0; j < SIZE2; j++) {
				a[i][0] = select_array[i];
				a[i][1] = select_v_array[i];
		}

		$('#id_time_top_main').empty();

		var my_html_options = "";

		my_html_options += "<ul>";
		my_html_options += "<li class='option_list'>";
		my_html_options += "<div id=\"settings_fwTime_select\" class=\"wd_select option_selected\" >";
		my_html_options += "<div class=\"sLeft wd_select_l\"></div>";
		my_html_options += "<div class=\"sBody text wd_select_m\" id=\"id_time\" rel='" + _g_time + "'>" + map_table(_g_time) + "</div>";

		my_html_options += "<div class=\"sRight wd_select_r\"></div>";
		my_html_options += "</div>";
		my_html_options += "<ul class='ul_obj' id='id_time_li'>"
		my_html_options+="<div class='scrollbar_time'>";
		my_html_options += "<li id=\"settings_fwTimeLi1_select\" class=\"li_start\" rel=\"" + select_v_array[0] + "\" ><a href='#'>" + select_array[0] + "</a>";

		for (var i = 1; i < select_array.length - 1; i++) {
			my_html_options += "<li id=\"settings_fwTimeLi"+(i+1)+"_select\"  rel=\"" + select_v_array[i] + "\"><a href='#'>" + select_array[i] + "</a>";
		}
		var j = select_array.length - 1;
		my_html_options += "<li id=\"settings_fwTimeLi"+(j+1)+"_select\" class=\"li_end\" rel='" + select_v_array[j] + "'><a href='#'>" + select_array[select_array.length - 1] + "</a>";
		my_html_options += "</div>";
		my_html_options += "</ul>";
		my_html_options += "</li>";
		my_html_options += "</ul>";

		$("#id_time_top_main").append(my_html_options);

		if(_g_sch==8)
		{
			$("#id_pm_top_main, #id_time_top_main").hide();
		}
		else
		{
			$("#id_pm_top_main, #id_time_top_main").show();
		}
		
		function map_table(rel) {
			for (var i = 0; i < SIZE; i++)
				for (var j = 0; j < SIZE2; j++) {
					a[i][0] = select_array[i];
					a[i][1] = select_v_array[i];					
					if (a[i][1] == rel) {
						return a[i][0];
					}	
				}
			}

	}

	function auto_update(e) {
		var hour = $("#id_time").attr('rel');
		
		if(TIME_FORMAT=="12")
		{
			var t = $("#id_pm").text();
			if (t == "PM") {
				if (hour != 12)
					hour = parseInt(hour, 10) + 12;
			} else {
				if (hour == 12)
					hour = 0;
			}
		}

		var sch = $("#id_sch").attr('rel');
		var enable = e;
		var str = "cmd=set_auto_fw_sch";
		str += "&hour=" + hour
		str += "&week=" + sch
		str += "&enable=" + enable;

		//alert(str);
		jLoading(_T('_common', 'set'), 'loading', 's', "");
		wd_ajax({
			type: "POST",
			async: true,
			cache: false,
			url: "/cgi-bin/system_mgr.cgi",
			data: str,
			success: function (data) {
				google_analytics_log('auto-fw-en',enable);
				jLoadingClose();
			}
		});
	}

	function init_tb_sch_info() {
		wd_ajax({
			type: "POST",
			async: false,
			cache: false,
			url: "/cgi-bin/system_mgr.cgi",
			data: "cmd=get_auto_fw_sch",
			success: function (xml) {

				$(xml).find('fw').each(function (index) {
					//var type = $(this).find('method').text();		
					var enable = $(this).find('enable').text();
																
					setSwitch('#settings_fwAutoupdate_switch', enable)
					if (enable == 1) {

						show('id_tb_sch');
					} else {
						hide('id_tb_sch');
					}
					
					$("#settings_fwAutoupdate_switch").unbind();
					$("#settings_fwAutoupdate_switch").click(function () {									
					var v = getSwitch('#settings_fwAutoupdate_switch');
					if( v==1 )
				  {	  				  
					  show('id_tb_sch');
					  auto_update(1);
				  }
				  else
				  {				  	
					   hide('id_tb_sch');	   
					   auto_update(0);
				  }	
				});
					
					_g_time = $(this).find('hour').text();
					if (_g_time == "") _g_time = 1;
					var week = $(this).find('week').text();
					if (week == "") week = 0;

					if ( (week >= 0 && week <= 6) || week ==8) {
						_g_sch = week
					}
					else
						_g_sch = 7;
					
					if(TIME_FORMAT=="12")
					{
						if (_g_time >= 12) {
							_g_time = _g_time - 12;
							_g_pm = 1;
						}
					}				
				});
			}
		});
	}

	function init_auto_fw_version() {
		wd_ajax({
			type: "POST",
			async: true,
			cache: false,
			url: "/cgi-bin/system_mgr.cgi",
			data: "cmd=get_auto_fw_version",
			success: function (xml) {

				$(xml).find('fw').each(function (index) {
					var str = "";
					var new_str = $(this).find('new').text();
					if (new_str == "-1" || new_str == "0") {
						hide('id_new_fw_td');
						show('id_ck_fw_td')
                                                show('id_ck_fw_td_tip')
					}
					else {
						var version = $(this).find('version').text();
						var path = $(this).find('path').text();

						$("#id_new_firm_version").text(version);
                                                show('id_new_firm_version')
						show('id_new_fw_td')
						hide('id_ck_fw_td')
                                                hide('id_ck_fw_td_tip')
					}
				});
			}
		});
	}