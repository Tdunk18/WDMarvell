var APPS_INSTALL_APPS_INFO = new Array();
var APPS_UPGRADE_APPS_INFO = new Array();
var APPS_INFO = new Array();
var APPS_INSTALL_CANCEL = 0;
var TOTAL_INSTALL_MODULE = 0;
var _jScrollPane = "";
var APKG_INSTALL_DEP_FAIL = 12;
var APKG_ENABLE_DEP_FAIL = 13;
var APKG_REMOVE_DEP_FAIL = 14;
var APKG_DISABLE_DEP_FAIL = 15;
var APKG_INSTALL_CON_FAIL = 18;
var APKG_ENABLE_CON_FAIL = 19;

function apps_button_active() {
    var apps_name = $(".LightningSubMenuOn").attr('id');
    switch (apps_name) {
        case "http_downloads":
        case "ftp_downloads":
        case "p2p":
        case "web_file_server":
        case "safepoints":
            if (!$("#apps_del_button").hasClass("gray_out")) $("#apps_del_button").addClass("gray_out");
            if ($("#apps_del_button").hasClass("TooltipIcon")) $("#apps_del_button").removeClass("TooltipIcon").removeAttr("title");
            init_tooltip();
            break;
        default:
            if ($("#apps_del_button").hasClass("gray_out")) $("#apps_del_button").removeClass("gray_out");
            if (!$("#apps_del_button").hasClass("TooltipIcon")) {
                $("#apps_del_button").addClass("TooltipIcon").attr('title', _T('_module', 'tip1'));
                init_tooltip();
            }
            break;
    }
}

function apps_browse_install_info(my_id, my_name) {
    var my_state = ($("#" + my_id).prop("checked")) ? 1 : 0;
    for (var i = 0; i < APPS_INSTALL_APPS_INFO.length; i++) {
        if (APPS_INSTALL_APPS_INFO[i][0] == my_name) {
            APPS_INSTALL_APPS_INFO[i][1] = my_state;
        }
    }
    var installapp_cnt = 0;
    for (i = 0; i < APPS_INSTALL_APPS_INFO.length; i++) {
        if (parseInt(APPS_INSTALL_APPS_INFO[i][1], 10) == 1) installapp_cnt++;
    }
    if (installapp_cnt === 0) {
        if (!$("#Apps_next_button_3").hasClass("grayout")) $("#Apps_next_button_3").addClass("grayout");
    } else {
        if ($("#Apps_next_button_3").hasClass("grayout")) $("#Apps_next_button_3").removeClass("grayout");
    }
}

function apps_browse_state(my_name) {
    /*
	APPS_INSTALL_APPS_INFO[0] = my_module_name;	//Module Name
	APPS_INSTALL_APPS_INFO[1] = "0";						//install, 0->no, 1->yes
	APPS_INSTALL_APPS_INFO[2] = "0";						//install finish, 0->not yet, 1->finished
	APPS_INSTALL_APPS_INFO[3] = my_show_name;
	APPS_INSTALL_APPS_INFO[4]	= "";							//install result, 0->Downloading, 1->installing, 2->finish, 3->fail
	*/
    wd_ajax({
        url: "/xml/app_status.xml",
        type: "POST",
        async: false,
        cache: false,
        dataType: "xml",
        success: function(xml) {
            var my_show_name = "";
            var my_status = $(xml).find("Status").text();
            for (var i = 0; i < APPS_INSTALL_APPS_INFO.length; i++) {
                if (APPS_INSTALL_APPS_INFO[i][0] == my_name) {
                    my_show_name = APPS_INSTALL_APPS_INFO[i][3];
                    APPS_INSTALL_APPS_INFO[i][4] = my_status;
                    break;
                }
            }
            if ($(xml).find("Status").text().length == 0) return 0;
            switch (parseInt(my_status, 10)) {
                case 0: //Downloading
                    var my_bar = parseInt($(xml).find("Progress").text(), 10);
                    //var my_desc = my_name + " ";
                    var my_desc = (my_show_name != "") ? my_show_name + " " : my_name + " ";
                    my_desc += (parseInt(my_status, 10) == 0) ? _T('_module', 'desc15') : _T('_module', 'desc16');
                    my_bar = (my_bar == 100) ? 98 : my_bar;
                    $("#Apps_InstallApps_State").html(my_desc);
                    $("#Apps_InstallApps_parogressbar").progressbar('option', 'value', my_bar);
                    $("#Apps_InstallApps_Desc").html(my_bar + " %");
                    break;
                case 1: //installing
                    var my_desc = (my_show_name != "") ? my_show_name : my_name;
                    $("#Apps_InstallApps_State").html(my_desc + " " + _T('_module', 'desc16'));
                    $("#Apps_InstallApps_parogressbar").progressbar('option', 'value', 99);
                    $("#Apps_InstallApps_Desc").html("99 %");
                    break;
                case 2: //finish
                    $("#Apps_InstallApps_parogressbar").progressbar('option', 'value', 100);
                    $("#Apps_InstallApps_Desc").html("100 %");
                    if (timeoutId != 0) clearInterval(timeoutId);
                    $("#Apps_InstallApps_State").val(_T('_module', 'desc13'));
                    $("#Apps_InstallApps_Desc").val('');
                    apps_browse_auto_install();
                    break;
                default: //fail
                    if (timeoutId != 0) clearInterval(timeoutId);
                    var msg = _T('_module', 'msg6');
                    jAlert(msg, "warning", null, function() {
                        apps_browse_auto_install();
                    });
                    break;
            }
        }
    })
}

function apps_browse_install(my_name) {
    wd_ajax({
        url: "/cgi-bin/apkg_mgr.cgi",
        type: "POST",
        async: false,
        cache: false,
        data: {
            cmd: "cgi_apps_auto_install",
            f_module_name: my_name
        },
        dataType: "xml",
        success: function(xml) {
            if (timeoutId != 0) clearInterval(timeoutId);
            google_analytics_log('Apps_Installed_Svr_Num', '');
            timeoutId = setInterval(function() {
                apps_browse_state(my_name);
            }, 1500);
        }
    });
}

function apps_browse_auto_install_cancel() {
    for (var i = 0; i < APPS_INSTALL_APPS_INFO.length; i++) {
        if (APPS_INSTALL_APPS_INFO[i][1] == 1) {
            APPS_INSTALL_APPS_INFO[i][2] = 1;
        }
    }
}

function apps_browse_auto_install() {
    var isFinish = 0;
    var install_cut = 0;

    stop_web_timeout(true);

    for (var i = 0; i < APPS_INSTALL_APPS_INFO.length; i++) {
        if ((parseInt(APPS_INSTALL_APPS_INFO[i][1], 10) == 1) && (parseInt(APPS_INSTALL_APPS_INFO[i][2], 10) == 0)) {
            install_cut++;
        }
    }

    if (parseInt(install_cut, 10) == 1) {
        if (!$("#apps_cancel_button_4").hasClass("grayout")) {
            $("#apps_cancel_button_4").addClass("grayout");
        }
    } else if ($("#apps_cancel_button_4").hasClass("grayout")) {
        $("#apps_cancel_button_4").removeClass("grayout");
    }

    //install APP(s)
    for (i = 0; i < APPS_INSTALL_APPS_INFO.length; i++) {
        if ((parseInt(APPS_INSTALL_APPS_INFO[i][1], 10) == 1) && (parseInt(APPS_INSTALL_APPS_INFO[i][2], 10) == 0)) {
            APPS_INSTALL_APPS_INFO[i][2] = 1;
            isFinish = 1;
            $("#AppsDiag_InstallApps_parogressbar").progressbar("destroy");
            console.error("- = - = - = - = - = - = - =");
            console.error(APPS_INSTALL_APPS_INFO[i]);

            // Docker app has 3 element set to 3
            if (APPS_INSTALL_APPS_INFO[i][5] == 1) {
                // APPS_INSTALL_APPS_INFO[i][6] stores the full app information
                // SOAD
                installDockerApp(APPS_INSTALL_APPS_INFO[i][6]);
            } else {
                apps_browse_install(APPS_INSTALL_APPS_INFO[i][0]);
            }
            break;
        }
    }
    var msg = "";
    if (isFinish == 0) {
        restart_web_timeout();
        if (APPS_INSTALL_CANCEL == 1) jLoadingClose();
        INTERNAL_DIADLOG_BUT_UNBIND("Apps_Diag");
        INTERNAL_DIADLOG_DIV_HIDE("Apps_Diag");
        load_app_menu(); //Load APP menu, Add by Ben, 2013/04/30
        $("#TR_AppsDiag_Browse_title1").hide();
        $("#TR_AppsDiag_Browse_Flexgrid").hide();
        $("#Apps_Diag").overlay().close();
        /*
		APPS_INSTALL_APPS_INFO[0] = my_module_name;	//Module Name
		APPS_INSTALL_APPS_INFO[1] = "0";						//install, 0->no, 1->yes
		APPS_INSTALL_APPS_INFO[2] = "0";						//install finish, 0->not yet, 1->finished
		APPS_INSTALL_APPS_INFO[3] = my_show_name;
		APPS_INSTALL_APPS_INFO[4]	= "";							//install result, 0->Downloading, 1->installing, 2->finish, 3->fail
		*/
        var apps_install_success_info = new Array();
        for (var idx = 0; idx < APPS_INSTALL_APPS_INFO.length; idx++) {
            if (APPS_INSTALL_APPS_INFO[idx][2] == "1" && APPS_INSTALL_APPS_INFO[idx][4] == "2") {
                apps_install_success_info.push(APPS_INSTALL_APPS_INFO[idx]);
            }
        }
        console.log("APP INSTALL SUCCESS INFO");
        console.log(apps_install_success_info);
        var res_list_msg = "";
        switch (apps_install_success_info.length) {
            case 1:
                res_list_msg = String.format(_T("_module", "msg24"),
                    /*0*/
                    (apps_install_success_info[0][3].toString() == "") ? apps_install_success_info[0][0].toString() : apps_install_success_info[0][3].toString());
                break;
            case 2:
                res_list_msg = String.format(_T("_module", "msg25"),
                    /*0*/
                    (apps_install_success_info[0][3].toString() == "") ? apps_install_success_info[0][0].toString() : apps_install_success_info[0][3].toString(),
                    /*1*/
                    (apps_install_success_info[1][3].toString() == "") ? apps_install_success_info[1][0].toString() : apps_install_success_info[1][3].toString());
                break;
            default:
                var _tmp_app_showname = "",
                    _tmp_1st_app_showname = "",
                    _tmp_2nd_app_showname = "";
                for (idx = 0; idx < (apps_install_success_info.length - 1); idx++) {
                    if (apps_install_success_info[idx] && apps_install_success_info[idx][3]) {
                        _tmp_app_showname = (apps_install_success_info[idx][3].toString() == "") ? apps_install_success_info[idx][0].toString() : apps_install_success_info[idx][3]
                        .toString();
                    }
                    _tmp_1st_app_showname += (_tmp_1st_app_showname.length == "") ? "" : ", ";
                    _tmp_1st_app_showname += _tmp_app_showname;
                }
                var _tmp_2nd_idx = (apps_install_success_info.length - 1);
                if (apps_install_success_info[_tmp_2nd_idx]) {
                    _tmp_2nd_app_showname = (apps_install_success_info[_tmp_2nd_idx][3].toString() == "") ? apps_install_success_info[_tmp_2nd_idx][0].toString() :
                    apps_install_success_info[_tmp_2nd_idx][3].toString();

                }
                res_list_msg = String.format(_T("_module", "msg25"),
                    /*0*/
                    _tmp_1st_app_showname,
                    /*1*/
                    _tmp_2nd_app_showname);
                break;
        }
        jAlert(res_list_msg, "add_an_app");
    }
}

function apps_install_list(my_apkg_name) {
    var flag = 1;
    for (var idx = 0; idx < apps_list.length; idx++) {
        if ((my_apkg_name.toUpperCase() == apps_list[idx]['name'].toUpperCase()) || (my_apkg_name.toUpperCase() == apps_list[idx]['show'].toUpperCase())) {
            flag = 0;
            break;
        }
    }
    return flag;
}

function apps_browse_available_upgrade(my_apps, my_currentVer) {
    var flag = 0;
    for (var idx = 0; idx < APPS_INFO_XML.length; idx++) {
        if (APPS_INFO_XML[idx]['Name'].toString().toLocaleUpperCase() == my_apps.toLocaleUpperCase()) {
            if (parseInt(APPS_INFO_XML[idx]['Available_Install'], 10) == 1) {
                flag = (parseFloat(my_currentVer) < parseFloat(APPS_INFO_XML[idx]['Version'])) ? "1" : "0";
            } else {
                flag = 0;
            }
            break;
        }
    }
    return flag;
}

function apps_browse_available_install(my_MinFWVer, my_MaxFWVer) {
    if (user_login) {
        return 0;
    }
    if (!getCookie("fw_version")) {
        get_fw_version();
    }
    var flag = 1;
    var my_fw_version = getCookie("fw_version");
    var msg = "my_MinFWVer = " + my_MinFWVer + "\n";
    msg += "my_MaxFWVer = " + my_MaxFWVer + " (Length = " + my_MaxFWVer.length + ")\n";
    msg += "my_fw_version = " + my_fw_version + " (Length = " + my_fw_version.length + ")\n";
    msg += "-----------\n";
    //Min Firmware Version
    var _CurrentFWVer = getCookie("fw_version").split(".");
    var _MinFWVer = my_MinFWVer.split(".");
    if (_MinFWVer.length == _CurrentFWVer.length) {
        flag = 0;
        if (my_MinFWVer == my_fw_version) {
            flag = 1;
        } else {
            msg += "_MinFWVer.toString() = " + _MinFWVer.toString() + "\n";
            for (var idx = 0; idx < _MinFWVer.length; idx++) {
                msg += "_MinFWVer[" + idx + "]=" + _MinFWVer[idx] + " ,_CurrentFWVer[" + idx + "]=" + _CurrentFWVer[idx] + "\n";
                if (parseInt(_MinFWVer[idx], 10) == parseInt(_CurrentFWVer[idx], 10)) {
                    continue;
                } else if (parseInt(_MinFWVer[idx], 10) < parseInt(_CurrentFWVer[idx], 10)) {
                    flag = 1;
                    break;
                } else {
                    flag = 0;
                    break;
                }
            }
        }
        if (flag == 0) {
            msg += "[Min]flag = " + flag + "\n";
            //alert(msg);
            return flag;
        }
    }
    msg += "-----------\n";
    //Max Firmware Version
    var _MaxFWVer = my_MaxFWVer.split(".");
    msg += "_MaxFWVer.toString() = " + _MaxFWVer.toString() + "\n";
    if (_MaxFWVer.length == _CurrentFWVer.length) {
        flag = 0;
        if (my_MaxFWVer == my_fw_version) {
            flag = 1;
            msg += "[Max1]flag = " + flag + "\n";
            //alert(msg);
            return flag;
        } else {
            for (var idx = 0; idx < _MaxFWVer.length; idx++) {
                msg += "_MaxFWVer[" + idx + "]=" + _MaxFWVer[idx] + " ,_CurrentFWVer[" + idx + "]=" + _CurrentFWVer[idx] + "\n";
                if (parseInt(_MaxFWVer[idx], 10) > parseInt(_CurrentFWVer[idx], 10)) {
                    flag = 1;
                    msg += "[Max2]flag = " + flag + "\n";
                    //alert(msg);
                    return flag;
                }
            }
        }
    }
    msg += _MaxFWVer.toString() + "\n";
    msg += "flag = " + flag + "\n";
    //alert(msg);
    return flag;
}

function apps_browse_get_info() {
    if (APPS_INFO_XML.length == 0) {
        $("#Apps_next_button_3").hide();
        $("#SPAN_no_available_apps_desc").show();
        $("#TR_AppsDiag_Browse_Manually_Install").attr('align', 'left');
    } else {
        /*
		APPS_INFO_XML[idx]['Name'] = $(this).find('Name').text();
		APPS_INFO_XML[idx]['ShowName'] = $(this).find('ShowName').text();
		APPS_INFO_XML[idx]['Version'] = $(this).find('Version').text();
		APPS_INFO_XML[idx]['Image'] = $(this).find('Image').text();
		APPS_INFO_XML[idx]['FileSize'] = $(this).find('FileSize').text();
		APPS_INFO_XML[idx]['Icon'] = $(this).find('Icon').text();
		APPS_INFO_XML[idx]['AppDescription'] = $(this).find('AppDescription').text();
		APPS_INFO_XML[idx]['ReleaseNotes'] = $(this).find('ReleaseNotes').text();
		APPS_INFO_XML[idx]['MinFWVer'] = $(this).find('MinFWVer').text();
		APPS_INFO_XML[idx]['MaxFWVer'] = $(this).find('MaxFWVe').text();
		APPS_INFO_XML[idx]['Available_Install'] = 1:install; 0-> not support;
		*/
        var my_html_tr = "";
        var my_install_info = new Array();
        for (var idx = 0; idx < APPS_INFO_XML.length; idx++) {
            var my_show_name = (APPS_INFO_XML[idx]['ShowName'] == "") ? APPS_INFO_XML[idx]['Name'] : APPS_INFO_XML[idx]['ShowName'];
            var my_module_name = APPS_INFO_XML[idx]['Name'];
            if ((1 == apps_install_list(my_module_name)) && (1 == parseInt(APPS_INFO_XML[idx]['Available_Install'], 10))) {
                if (APPS_INFO_XML[idx].is_docker == 1) {
                    console.log(APPS_INFO_XML[idx]);
                    my_html_tr += getDockerInstalledAppDesc(APPS_INFO_XML[idx], my_install_info);
                } else {
                    var _my_install_info = new Array();
                    _my_install_info[0] = my_module_name; //Module Name
                    _my_install_info[1] = "0"; //install, 0->no, 1->yes
                    _my_install_info[2] = "0"; //install finish, 0->not yet, 1->finished
                    _my_install_info[3] = my_show_name;
                    _my_install_info[4] = ""; //install result
                    _my_install_info[5] = APPS_INFO_XML[idx].is_docker; // is docker
                    var n = my_install_info.length;
                    if ((n % 2) == 1) my_html_tr += "<tr id='row " + n + "' class='erow'>";
                    else my_html_tr += "<tr id='row " + n + "'>";
                    my_html_tr += "<td align=\"center\" width=\"25px\"><div style=\"text-align: center; width:25px;\">";
                    my_html_tr += "<input type=\"checkbox\" value=\"" + my_module_name + "\" name=\"f_apps_install_" + n + "\" id=\"f_apps_install_" + n +
                        "\" onclick=\"apps_browse_install_info('f_apps_install_" + n + "','" + my_module_name + "');\">";
                    my_html_tr += "</div></td>";
                    my_html_tr += "<td align=\"center\" width=\"30px\"><div class=\"list_icon\">";
                    my_html_tr += "<div style=\"background-image: url('" + APPS_INFO_XML[idx]['Icon'] + "'); background-size:30px;\"></div>";
                    my_html_tr += "</div></td>";
                    my_html_tr += "<td align=\"left\"><div style=\"text-align: left; width:230px;\">";
                    my_html_tr += my_show_name;
                    my_html_tr += "</div></td>";
                    my_html_tr += "<td align=\"right\"><div style=\"text-align: right; width:200px;\"><a href=\"" + APPS_INFO_XML[idx]['AppDescription'] +
                        "\" target=\'_blank\'>";
                    my_html_tr += _T("_module", "desc2");
                    my_html_tr += "</a></div></td>";
                    my_html_tr += "</tr>";
                    my_install_info.push(_my_install_info);
                }
            } //end if (1 == apps_install_list(my_module_name))
        } //end of for(var idx=0; idx<APPS_INFO_XML.length; idx++)
        var squeezecenter_idx = -1;
        for (var i = 0; i < my_install_info.length; i++) {
            if (my_install_info[i][0] == "SqueezeCenter") {
                squeezecenter_idx = i;
            } else {
                APPS_INSTALL_APPS_INFO.push(my_install_info[i]);
            }
        }
        if (squeezecenter_idx != -1) {
            APPS_INSTALL_APPS_INFO.push(my_install_info[squeezecenter_idx]);
        }
        $("#Apps_Browse_List").html(my_html_tr);
        if (idx == 0) {
            $("#TR_AppsDiag_Browse_title1").hide();
            $("#Apps_next_button_3").hide();
            $("#SPAN_no_available_apps_desc").show();
            $("#TR_AppsDiag_Browse_Manually_Install").attr('align', 'left');
        } else {
            $("#Apps_next_button_3").show();
            $("#TR_AppsDiag_Browse_title1").show();
            $("#TR_AppsDiag_Browse_Flexgrid").show();
            $("#SPAN_no_available_apps_desc").hide();
            $("#TR_AppsDiag_Browse_Manually_Install").attr('align', 'right');
        }
    } //end if (APPS_INFO_XML.length == 0)
}

function apps_borwse_diag() {
    if ($("#apps_installed_button").hasClass("gray_out")) return;
    var apps_eula = 0;
    var multi_lang_id = "?id=" + (new Date()).getTime();
    var multi_lang_idx = new Array(
        /*0*/
        "/web/addons/eula/en-US.html" + multi_lang_id,
        /*1*/
        "/web/addons/eula/fr-FR.html",
        /*2*/
        "/web/addons/eula/it_IT.html",
        /*3*/
        "/web/addons/eula/de-DE.html",
        /*4*/
        "/web/addons/eula/es-ES.html",
        /*5*/
        "/web/addons/eula/zh-CN.html",
        /*6*/
        "/web/addons/eula/zh-TW.html",
        /*7*/
        "/web/addons/eula/ko-KR.html",
        /*8*/
        "/web/addons/eula/ja-JP.html" + multi_lang_id,
        /*9*/
        "/web/addons/eula/ru-RU.html",
        /*10*/
        "/web/addons/eula/pt-BR.html",
        /*11*/
        "/web/addons/eula/cs-CZ.html",
        /*12*/
        "/web/addons/eula/nl-NL.html",
        /*13*/
        "/web/addons/eula/hu-HU.html",
        /*14*/
        "/web/addons/eula/no-NO.html",
        /*15*/
        "/web/addons/eula/pl-PL.html",
        /*16*/
        "/web/addons/eula/sv-SE.html",
        /*17*/
        "/web/addons/eula/tr-TR.html");
    $("#AppsEula_iframe").attr("src", multi_lang_idx[parseInt(MULTI_LANGUAGE, 10)]);
    wd_ajax({
        url: "/cgi-bin/apkg_mgr.cgi",
        type: "POST",
        async: false,
        cache: false,
        data: {
            cmd: "cgi_apps_eula_get"
        },
        dataType: "xml",
        success: function(xml) {
            apps_eula = $(xml).find('eula_apps').text();
        }
    });
    if ($("#apps_installed_button").hasClass("gray_out")) return;
    APPS_INSTALL_APPS_INFO.length = 0;
    APPS_INSTALL_CANCEL = 0;
    var msg = (parseInt(apps_eula, 10) == 0) ? _T('_module', 'title2') : _T('_module', 'desc27');
    $("#AppsDiag_title").html(msg);
    $("#Apps_InstallApps_State").val(_T('_module', 'desc13'));
    $("#Apps_InstallApps_Desc").val('');
    var AppsObj = $("#Apps_Diag").overlay({
        expose: '#000',
        api: true,
        closeOnClick: false,
        closeOnEsc: false
    });
    INTERNAL_DIADLOG_DIV_HIDE("Apps_Diag");
    if (parseInt(apps_eula, 10) == 0) {
        $("#AppsDiag_Eula").show();
    } else {
        //getInstallableDockerApps(apps_list, APPS_INFO_XML, function(MyRes){
        //		if (parseInt(MyRes,10) == 0) apps_browse_get_info();
        //});
        apps_browse_get_info();

        $("#AppsDiag_Browse_List").show();
        $("#AppsDiag_Manually_Install").html(_T('_module', 'desc33'));
        setTimeout(function() {
            $("input:checkbox").checkboxStyle();
            _jScrollPane = $('.scroll-pane').jScrollPane();
        }, 500);
    }
    init_button();
    $("input:checkbox").checkboxStyle();
    language();
    adjust_dialog_size("#Apps_Diag", '', 435);
    AppsObj.load();
    $("#Apps_Diag .close").click(function() {
        if ($("#TR_AppsDiag_Browse_Flexgrid").hasClass("jspContainer")) {
            _jScrollPane.data('jsp').destroy();
        }
        AppsObj.close();
        INTERNAL_DIADLOG_BUT_UNBIND("Apps_Diag");
        INTERNAL_DIADLOG_DIV_HIDE("Apps_Diag");
    });
    $("#Apps_next_button_3").click(function() {
        if ($("#Apps_next_button_3").hasClass('grayout')) return;
        $("#AppsDiag_Browse_List").hide();
        $("#AppsDiag_InstallApps_State").show();
        $("#Apps_InstallApps_parogressbar").progressbar({
            value: 0
        });
        $("#Apps_InstallApps_Desc").html("&nbsp;" + 0 + "%");
        apps_browse_auto_install();
    });
    $("#apps_cancel_button_4").click(function() {
        if ($(this).hasClass('grayout')) return;
        jLoading(_T('_common', 'set'), "loading", "s", "");
        APPS_INSTALL_CANCEL = 1;
        apps_browse_auto_install_cancel();
    });
    $("#apps_next_button_7").click(function() {
        wd_ajax({
            url: "/cgi-bin/apkg_mgr.cgi",
            type: "POST",
            async: false,
            cache: false,
            data: {
                cmd: "cgi_apps_eula_set"
            },
            dataType: "xml",
            success: function(xml) {
                apps_browse_get_info();
                $("input:checkbox").checkboxStyle();
                $("#AppsDiag_title").html(_T('_module', 'desc27'));
                $("#AppsDiag_Manually_Install").html(_T('_module', 'desc33'));
                $("#AppsDiag_Eula").hide();
                $("#AppsDiag_Browse_List").show();
                setTimeout(function() {
                    _jScrollPane = $('.scroll-pane').jScrollPane();
                }, 500);
            }
        });
    });
    $("#Apps_UpdateFirmware8_button").click(function() {
        $("#Apps_Diag .close").click();
        go_page('/web/setting/setting.html', 'nav_settings', 'firmware');
    });
    $("#Apps_OK8_button").click(function() {
        adjust_dialog_size("#Apps_Diag", "", 467);
        $("#AppsDiag_title").html(_T('_module', 'desc27'));
        $("#AppsDiag_Browse_List").show();
        $("#AppsDiag_ErrorMSG_FW").hide();
    });
}

function check_hdd_free_size() {
        var flag = 0;
        wd_ajax({
            url: "/cgi-bin/apkg_mgr.cgi",
            type: "POST",
            data: {
                cmd: 'cgi_chk_hdd_free_size'
            },
            async: false,
            cache: false,
            dataType: "xml",
            success: function(xml) {
                var free_size = $(xml).find("hdd_free_size").text();
                free_size = free_size / 1024 / 1024;
                if (free_size < 1) {
                    flag = 1;
                }
            }
        }); // end of ajax
        return flag;
    }
    //function getFile()
    //{
    //   document.getElementById("f_apps_file").click();
    //}
var _INSTALL = 0;

function apps_manually_install() {
    if (_INSTALL >= 1) //fish07312014+for chrome 36.xx
        return;
    if ($("#f_apps_file").val() == "") {
        jAlert(_T('_module', 'msg1'), "warning"); //Text:Please select a package.
        return;
    }
    if (check_hdd_free_size() == 1) {
        jAlert(_T('_module', 'msg8'), "warning");
        return;
    }
    //if(TOTAL_INSTALL_MODULE==64)
    if (apps_list.length == 64) {
        jAlert(_T('_module', 'msg12'), "warning") //Text:The maximum number of module has been reached.
        return;
    }
    jLoading(_T('_common', 'set'), 'loading', 's', "");
    _INSTALL++;
    if (_INSTALL <= 1) {
        stop_web_timeout(true);
        var cmdstr = 'cgi_apps_install';
        var isDockerMatch = null;
        var dockerSupported = isDockerSupported();
        if (dockerSupported == 1) {
            isDockerMatch = ($("#f_apps_file").val().match(/\.tar$|\.tar\.gz$|\.tgz$/));
            if (isDockerMatch != null) {
                cmdstr = 'cgi_dockerapps_install';  // if cgi does not support docker, this will behave like cgi_apps_install
            }
        }
        $.ajaxFileUpload({
            url: '/cgi-bin/apkg_mgr.cgi',
            secureuri: false,
            fileElementId: 'f_apps_file',
            cmd: cmdstr,
            filePath: '',
            success: function(data, status) {
                google_analytics_log('Apps_Installed_Manul_Num', '');
                restart_web_timeout();
                _INSTALL = 0;
                jLoadingClose();

                dockerFirstTime = true;
                if (dockerSupported == 1 && isDockerMatch != null) {
                    if (data.body.textContent) {
                        console.log("after upload: " + data.body.textContent);
                        var appInfo = [];
                        try {
                            var obj = jQuery.parseJSON(data.body.textContent);
                            if (obj.status != "success")
                                throw obj.detail;
                            appInfo.Image = "file://" + obj.image;
                            appInfo.Name = obj.image.substring(obj.image.lastIndexOf('/')+1);
                            appInfo.Upgrade = 1;
                        } catch(err) {
                            console.log("failed to parse result: " + err);
                        }

                        if (appInfo.Image && appInfo.Name) {
                            console.log("Installing docker app at " + appInfo.Image);
                            $("#AppsDiag_Browse_List").hide();
                            $("#AppsDiag_InstallApps_State").show();
                            $("#Apps_InstallApps_parogressbar").progressbar({
                                value: 0
                            });
                            $("#Apps_InstallApps_Desc").html("&nbsp;" + 0 + "%");
                            if (!$("#apps_cancel_button_4").hasClass("grayout")) {
                                $("#apps_cancel_button_4").addClass("grayout");
                            }
                            installDockerApp(appInfo);
                        }
                    }
                } else {
                    apps_get_install_status();
                }
            },
            error: function(data, status, e) {
                restart_web_timeout();
            }
        })
    }
}

function apps_manually_reinstall(reinstall, install_type, sign_flag) {
    wd_ajax({
        url: "/cgi-bin/apkg_mgr.cgi",
        type: "POST",
        cache: false,
        async: false,
        data: {
            cmd: "cgi_apps_reinstall",
            f_type: reinstall,
            install_type: install_type,
            module_sign_flag: sign_flag
        },
        dataType: "xml",
        success: function(xml) {
            $("#Apps_Diag").overlay().close();
            jLoadingClose();
            timeoutId = setTimeout('apps_get_install_status();', 300);
        }
    });
}

function apps_get_reinstall_name() {
    var apps_name = "",
        msg = "";
    wd_ajax({
        url: "/xml/app_exist.xml",
        type: "POST",
        async: false,
        cache: false,
        dataType: "xml",
        success: function(xml) {
            apps_name = $(xml).find("app_name").text();
        },
        complete: function(jqXHR, textStatus) {}
    });
    return apps_name;
}

function apps_get_install_status() {
    wd_ajax({
        url: "/cgi-bin/apkg_mgr.cgi",
        type: "POST",
        data: {
            cmd: 'module_show_install_status'
        },
        async: false,
        cache: false,
        dataType: "xml",
        success: function(xml) {
                /* install_status:
            	1:install ok
            	2:hdd failed
            	3:install failed
            	4:have isntall moudle in HD_a2
            	5:not enough free hdd size
            	6:enable fail
            	7:enable ok
							8:sqeeze center install fail: didn't used
							9:3-party package
							10:have isntall 3-party moudle in HD_a2
							11:fw version issue
							12:APKG_INSTALL_DEP_FAIL
							13:APKG_ENABLE_DEP_FAIL
							14:APKG_REMOVE_DEP_FAIL
							15:APKG_DISABLE_DEP_FAIL
							18:APKG_INSTALL_CON_FAIL
							19:APKG_ENABLE_CON_FAIL
            	*/
                var obj_name = "install_status";
                var install_type = $(xml).find('config > install_type').text();
                var install_state = $(xml).find('config > install_status').text();
                var install_error_mesg = $(xml).find('config > install_error_mesg').text();
                install_state = parseInt(install_state, 10);
                switch (parseInt(install_state, 10)) {
                    case 1:
                        jAlert(_T('_module', 'msg4'), "complete"); //App installed
                        load_app_menu(); //Load APP menu, Add by Ben, 2013/04/30
                        INTERNAL_DIADLOG_BUT_UNBIND("Apps_Diag");
                        INTERNAL_DIADLOG_DIV_HIDE("Apps_Diag");
                        $("#Apps_Diag").overlay().close();
                        break;
                    case 2:
                        jAlert(_T('_module', 'msg5'), "warning"); //Drive Failure
                        break;
                    case 3:
                        jAlert(_T('_module', 'msg6'), "warning"); //Failed to Install App.
                        break;
                    case 4:
                    case 10:
                        var msg = "";
                        if (install_state == 4) {
                            var my_apps = apps_get_reinstall_name();
                            msg = String.format(_T('_module', 'msg7'), my_apps);
                        } else msg = _T('_module', 'msg15');
                        jConfirm('M', msg, _T('_menu', 'addon'), "apps", function(r) {
                            if (r) {
                                jLoading(_T('_common', 'set'), 'loading', 's', "");
                                timeoutId = setTimeout(function() {
                                    var sing_flag = (install_state == 4) ? 0 : 1;
                                    apps_manually_reinstall(1, install_type, sing_flag);
                                }, 500);
                            } else {
                                timeoutId = setTimeout(function() {
                                    var sing_flag = (install_state == 4) ? 0 : 1;
                                    apps_manually_reinstall(0, install_type, sing_flag);
                                }, 500);
                            }
                        });
                        break;
                    case 5:
                        jAlert(_T('_module', 'msg8'), "warning"); //Text:	Insufficient Space on Volume.
                        break;
                    case 6:
                        jAlert(_T('_module', 'msg9'), "warning"); //Text:Failed to Enable App
                        break;
                    case 7:
                        jAlert(_T('_module', 'msg10'), "complete"); //Text:App Enabled Successfully
                        break;
                    case 9:
                        jAlert(_T('_module', 'msg11'), "complete"); //Text:Delete Module Successfully.
                        break;
                    case 11:
                        //jAlert( _T('_module','msg17') , "warning");
                        $("#AppsDiag_title").html(_T("_common", "warning"));
                        adjust_dialog_size("#Apps_Diag", "", 250);
                        $("#AppsDiag_Browse_List").hide();
                        $("#AppsDiag_ErrorMSG_FW").show();
                        break;
                    case APKG_INSTALL_DEP_FAIL:
                        jAlert(_T('_module', 'msg18'), "warning");
                        break;
                    case APKG_INSTALL_CON_FAIL:
                        jAlert(_T('_module', 'msg22'), "warning");
                        break;
                    case APKG_ENABLE_DEP_FAIL:
                        jAlert(_T('_module', 'msg19'), "warning");
                        break;
                    case APKG_ENABLE_CON_FAIL:
                        jAlert(_T('_module', 'msg23'), "warning");
                        break;
                } //end of switch
            } //end of ajax success
    }); //end of ajax
}

function apps_Del() {
    if ($("#apps_del_button").hasClass('gray_out')) return;
    var apps_name = $(".LightningSubMenuOn").text();
    var apps_show_name = "";
    for (var idx = 0; idx < apps_list.length; idx++) {
        if ((apps_name.toUpperCase() == apps_list[idx]['name'].toUpperCase()) || (apps_name.toUpperCase() == apps_list[idx]['show'].toUpperCase())) {
            apps_name = apps_list[idx]['name'];
            apps_show_name = (apps_list[idx]['show'] == "") ? apps_list[idx]['name'] : apps_list[idx]['show'];
            break;
        }
    }
    var _tmp_jconfirm_title = String.format(_T('_module', 'title3'), apps_show_name);
    var _tmp_jconfirm_msg = String.format(_T('_module', 'msg26'), apps_show_name);
    jConfirm('M', _tmp_jconfirm_msg, _tmp_jconfirm_title, "apps", function(r) {
        if (r) {
            jLoading(_T('_common', 'set'), 'loading', 's', "");
            if (apps_list[idx].is_docker == 1) {
                deleteDockerApp(apps_list[idx], app_deleted_callback);
            } else {
                wd_ajax({
                    url: "/cgi-bin/apkg_mgr.cgi",
                    type: "POST",
                    cache: false,
                    data: {
                        cmd: "cgi_apps_del",
                        f_module_name: apps_name
                    },
                    dataType: "xml",
                    success: function(xml) {
                        jLoadingClose();
                        var res = parseInt($(xml).find("result").text(), 10);
                        if (res == APKG_REMOVE_DEP_FAIL) {
                            jAlert(_T('_module', 'msg20'), "warning");
                        } else {
                            app_deleted_callback();
                        }
                    }
                });
            }
        }
    });
}

function app_deleted_callback() {
    load_app_menu(); //Load APP menu, Add by Ben, 2013/04/30
    go_sub_page('/web/addons/http_downloads.html', 'http_downloads');
    apps_button_active();
}

function apps_upgrade_init() {
    APPS_UPGRADE_APPS_INFO.length = 0;
    var idx = 0;
    for (var i = 0; i < apps_list.length; i++) {
        if (parseInt(apps_list[i]['available_upgrade'], 10) == 1) {
            APPS_UPGRADE_APPS_INFO[idx] = new Array();
            APPS_UPGRADE_APPS_INFO[idx][0] = apps_list[i].name;
            APPS_UPGRADE_APPS_INFO[idx][1] = apps_list[i].show;
            if (apps_list[i].is_docker == 1 || 
               (apps_list[i].hasOwnProperty("upgrade_info") && apps_list[i].upgrade_info.is_docker == 1)) {
                APPS_UPGRADE_APPS_INFO[idx][2] = 1;
                APPS_UPGRADE_APPS_INFO[idx][3] =  apps_list[i].upgrade_info;
            }
            idx++;
        }
    }
    if (APPS_UPGRADE_APPS_INFO.length != 0) {
        var my_html = "<table><tr>";
        my_html += "<td><img border='0' src='/web/images/warning.png' width='20'>&nbsp;</td>";
        my_html += "<td><div class='edit_detail' style='text-align:right;' onclick='apps_upgrade_diag()' id='apps_upgrade_hint'>" + APPS_UPGRADE_APPS_INFO.length + " " + _T(
            '_module', 'desc28') + "</div></td>";
        my_html += "</tr></table>";
        $("#div_apps_upgrade").html(my_html).show();
    } else {
        $("#div_apps_upgrade").hide();
    }
}

function apps_upgrade_releasenote(my_apps) {
    var my_url = "";
    my_apps_name = "";
    var msg = "";
    for (var idx = 0; idx < APPS_INFO_XML.length; idx++) {
        if (APPS_INFO_XML[idx]['Name'].toString().toLocaleUpperCase() == my_apps.toLocaleUpperCase()) {
            my_url = APPS_INFO_XML[idx]['ReleaseNotes'];
            my_apps_name = APPS_INFO_XML[idx]['name'] + "Window";
        }
    }
    if (my_url.length != 0) {
        window.open(my_url, my_apps_name, "", "_blank");
    }
}

function apps_browse_upgrade_info(my_id, my_name) {
    var my_state = ($("#" + my_id).attr("checked") == "checked") ? 1 : 0;
    for (var i = 0; i < APPS_INSTALL_APPS_INFO.length; i++) {
        if (APPS_INSTALL_APPS_INFO[i][0] == my_name) {
            APPS_INSTALL_APPS_INFO[i][1] = my_state;
            break;
        }
    }
    //	var flag = 0;
    //	for (i=0;i<APPS_INSTALL_APPS_INFO.length;i++)
    //	{
    //		if ( parseInt(APPS_INSTALL_APPS_INFO[i][1],10) == 1 )
    //		{
    //			if ( $("#apps_next_button_6").hasClass('gray_out')) $("#apps_next_button_6").removeClass('gray_out');
    //			flag = 1;
    //			break;
    //		}
    //	}
    //
    //	if (flag == 0)
    //	{
    //		if (!$("#apps_next_button_6").hasClass('gray_out')) $("#apps_next_button_6").addClass('gray_out');
    //	}
}

function apps_upgrade_diag() {
    APPS_INSTALL_APPS_INFO.length = 0;
    APPS_INSTALL_CANCEL = 0;
    var my_html_tr = "";
    for (var i = 0; i < APPS_UPGRADE_APPS_INFO.length; i++) {
        var installInfo = [];
        installInfo[0] = APPS_UPGRADE_APPS_INFO[i][0]; //Module Name
        installInfo[1] = "0"; //install, 0->no, 1->yes
        installInfo[2] = "0"; //install finish, 0->not yet, 1->finished
        installInfo[3] = APPS_UPGRADE_APPS_INFO[i][1]; //apps show name
        installInfo[4] = ""; //install result
        installInfo[5] = APPS_UPGRADE_APPS_INFO[i][2]; // is docker
        installInfo[6] = APPS_UPGRADE_APPS_INFO[i][3]; // install entry

        APPS_INSTALL_APPS_INFO.push(installInfo);

        if ((i % 2) == 1) {
            my_html_tr += "<tr id='row " + i + "' class='erow'>";
        } else {
            my_html_tr += "<tr id='row " + i + "'>";
        }
        my_html_tr += "<td align=\"center\" width=\"25px\"><div style=\"text-align: left; width: 25px;\">";
        my_html_tr += "<input type=\"checkbox\" value=\"" + APPS_UPGRADE_APPS_INFO[i][0] + "\" name=\"f_apps_upgrade_" + i + "\" id=\"f_apps_upgrade_" + i +
            "\" onclick=\"apps_browse_upgrade_info('f_apps_upgrade_" + i + "','" + APPS_UPGRADE_APPS_INFO[i][0] + "');\">";
        my_html_tr += "</div></td>";
        my_html_tr += "<td><div style=\"text-align: left; width: 200px;\">";
        my_html_tr += APPS_UPGRADE_APPS_INFO[i][1];
        my_html_tr += "</div></td>";
        my_html_tr += "<td><div class=\"edit_detail\" style=\"text-align: right; width: 200px;\" onclick=\"apps_upgrade_releasenote('" + APPS_UPGRADE_APPS_INFO[i][0] +
            "');\">";
        my_html_tr += _T('_module', 'desc24');
        my_html_tr += "</div></td>";
        my_html_tr += "</tr>";
    }
    $("#Apps_Upgrade_List").html(my_html_tr);
    $("#AppsDiag_title").html($("#apps_upgrade_hint").text());
    var AppsObj = $("#Apps_Diag").overlay({
        expose: '#000',
        api: true,
        closeOnClick: false,
        closeOnEsc: false
    });
    INTERNAL_DIADLOG_DIV_HIDE("Apps_Diag");
    $("#AppsDiag_Upgrade_List").show();
    $("input:checkbox").checkboxStyle();
    init_button();
    language();
    AppsObj.load();
    $('.scroll-pane').jScrollPane();
    $("#Apps_Diag .close").click(function() {
        AppsObj.close();
        INTERNAL_DIADLOG_BUT_UNBIND("Apps_Diag");
        INTERNAL_DIADLOG_DIV_HIDE("Apps_Diag");
    });
    //cancel to upgrade
    $("#apps_cancel_button_4").click(function() {
        jLoading(_T('_common', 'set'), 'loading', 's', "");
        APPS_INSTALL_CANCEL = 1;
        apps_browse_auto_install_cancel();
    });
    //upgrade apps : details
    $("#apps_back_button_5").click(function() {
        $("#AppsDiag_Upgrade_List").show();
        $("#AppsDiag_Upgrade").hide();
    });
    //upgrade apps
    $("#apps_next_button_6").click(function() {
        $("#AppsDiag_Upgrade_List").hide();
        $("#AppsDiag_InstallApps_State").show();
        $("#Apps_InstallApps_parogressbar").progressbar({
            value: 0
        });
        $("#Apps_InstallApps_Desc").html("&nbsp;" + 0 + "%");
        apps_browse_auto_install();
    });
}

function getFWLastVersion(callback) {
    wd_ajax({
        url: "/xml/apkg_install_status.xml",
        type: "POST",
        cache: false,
        dataType: "xml",
        success: function(xml) {
            var last_version = $(xml).find("last_version").text();
            if (callback) callback(last_version);
        }
    });
}
