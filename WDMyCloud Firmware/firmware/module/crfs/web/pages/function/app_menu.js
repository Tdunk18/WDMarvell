/* Load APP menu, Add by Ben, 2013/04/30 */
var apps_list = new Array();
var APPS_INFO_XML = new Array();
var first_load = true;
var now_focus_menu = "";

function addInstalledApp(name, appInfo) {
    var resList = $.grep(apps_list, function(a){
        return (a.name == name);
    });

    if (resList.length > 0) {
        apps_list = $.grep(apps_list, function(a) {
            return (a.name != name);
        });
    }
    apps_list.push(appInfo);
}

function addAvailableApp(name, appInfo) {
    var resList = $.grep(APPS_INFO_XML, function(a){
        return (a.Name == name);
    });

    if (resList.length > 0) {

        APPS_INFO_XML = $.grep(APPS_INFO_XML, function(a) {
            return (a.Name != name);
        });
    }
    APPS_INFO_XML.push(appInfo);
}

function WD_AppsList_Version(apps_name) {
    var my_version = "1.00";
    for (var idx = 0; idx < APPS_INFO_XML.length; idx++) {
        if (APPS_INFO_XML[idx]['Name'].toString().toLocaleUpperCase() == apps_name.toLocaleUpperCase()) {
            my_version = APPS_INFO_XML[idx]['Version'];
            break;
        }
    }
    return my_version;
}

function get_app_desc(str) {
    var desc = "";
    var sys_time = (new Date()).getTime();
    var my_xml_file = String.format("/{0}/desc.xml?id={1}",
        /*0*/
        str,
        /*1*/
        sys_time);
    wd_ajax({
        url: my_xml_file,
        type: "POST",
        async: false,
        cache: false,
        dataType: "xml",
        success: function(xml) {
                var multi_lang_idx = new Array(
                    /*0*/
                    "en-US",
                    /*1*/
                    "fr-FR",
                    /*2*/
                    "it-IT",
                    /*3*/
                    "de-DE",
                    /*4*/
                    "es-ES",
                    /*5*/
                    "zh-CN",
                    /*6*/
                    "zh-TW",
                    /*7*/
                    "ko-KR",
                    /*8*/
                    "ja-JP",
                    /*9*/
                    "ru-RU",
                    /*10*/
                    "pt-BR",
                    /*11*/
                    "cs-CZ",
                    /*12*/
                    "nl-NL",
                    /*13*/
                    "hu-HU",
                    /*14*/
                    "no-NO",
                    /*15*/
                    "pl-PL",
                    /*16*/
                    "cs-CZ",
                    /*17*/
                    "sv-SE",
                    /*18*/
                    "tr-TR");
                var my_tag = multi_lang_idx[parseInt(MULTI_LANGUAGE, 10)].toString();
                desc = $(xml).find(my_tag).text();
                //alert("["+str+"]\n["+my_tag+"]\n"+desc);
            } //success
    });
    return desc;
}

function load_app_menu() {
    if (!first_load) {
        now_focus_menu = $("#SubMenuDiv .LightningSubMenu .LightningSubMenuOn");
        if (now_focus_menu.hasClass("apkg_menu")) now_focus_menu = now_focus_menu.html();
        else now_focus_menu = "";
    }
    apps_list.length = 0;
    /*
	<apkg>
	    <item>
	      <procudt_id>0</procudt_id>
	      <custom_id>20</custom_id>
	      <model_id>0</model_id>
	      <user_control>0</user_control>
	      <center_type>0</center_type>
	      <name>IceCast</name>
	      <show>IceCast</show>
	      <enable>1</enable>
	      <version>1.02</version>
	      <date>20131225</date>
	      <inst_date>12/29/2013</inst_date>
	      <path>/mnt/HD/HD_a2/Nas_Prog/IceCast</path>
	      <ps_name></ps_name>
	      <url>index.html</url>
	      <url_port>8000</url_port>
	      <apkg_version>2</apkg_version>
	      <packager>WD</packager>
	      <email>support@wdc.com</email>
	      <homepage>http://support.wdc.com</homepage>
	      <inst_depend></inst_depend>
	      <inst_conflict></inst_conflict>
	      <start_depend></start_depend>
	      <start_conflict></start_conflict>
	      <description>A free server software for streaming multimedia.</description>
	      <icon>IceCast.png</icon>
	    </item>
 	 </apkg>
	*/

    // Only load docker apps once.
    getInstalledNativeApps(getInstalledDockerApps);
}

function getInstalledAppsComplete() {
    // admin
    if (!user_login){
        apps_upgrade_init();
    }
}
function getInstalledNativeApps(callback) {

    wd_ajax({
        url: '/xml/apkg_all.xml',
        type: "GET",
        async: false,
        cache: false,
        dataType: "xml",
        success: function(xml) {
            var idx = "",
                cut = 0;
            $(xml).find('item').each(function() {
                var app_info = new Array();
                app_info['is_docker'] = 0;
                app_info['name'] = $(this).find('name').text();
                app_info['show'] = $(this).find('show').text();
                app_info['url'] = $(this).find('url').text();
                if (app_info['url'].length !== 0) app_info['url'] = String.format("/{0}/{1}",
                    app_info['name'], app_info['url']);
                app_info['url_port'] = $(this).find('url_port').text();
                app_info['enable'] = $(this).find('enable').text();
                var my_desc = get_app_desc($(this).find('name').text());
                app_info['description'] = (my_desc === "") ? $(this).find('description').text() :
                    my_desc;
                if ($(this).find('icon').text() !== "") app_info['icon'] = String.format(
                    "/{0}/{1}", app_info['name'], $(this).find('icon').text());
                else app_info['icon'] = "/web/images/icon/apps_default.png";
                app_info['version'] = $(this).find('version').text();
                app_info['inst_date'] = $(this).find('inst_date').text();
                var WD_version = WD_AppsList_Version($(this).find('name').text());
                app_info['newly_version'] = WD_version;
                //app_info['available_upgrade'] = (parseFloat($(this).find('version').text()) < parseFloat(WD_version))?"1":"0";
                app_info['available_upgrade'] = apps_browse_available_upgrade($(this).find(
                    'name').text(), $(this).find('version').text());
                app_info['center_type'] = $(this).find('center_type').text();
                app_info['user_control'] = $(this).find('user_control').text();
                app_info['individual_flag'] = $(this).find('individual_flag').text();
                app_info['releasenotes'] = $(this).find('ReleaseNotes').text();
                if (user_login) {
                    if ($(this).find('enable').text() == "1" && $(this).find('user_control').text() ==
                        "0") {
                        if (idx === "" && $(this).find('user_control').text() == "0") idx = cut;
                        apps_list.push(app_info);
                    }
                    cut++;
                } else apps_list.push(app_info);
            });
            put_to_menu();
            if (user_login && first_load) {
                if ($("#SubMenuDiv .LightningSubMenu li:first").length > 0) {
                    $("#SubMenuDiv .LightningSubMenu li:first").removeClass("LightningSubMenuOn").addClass(
                        "LightningSubMenuOn");
                    go_app(0);
                }
            }
            first_load = false;
        },
        complete: function(jqXHR, textStatus) {
            callback(apps_list, APPS_INFO_XML, getInstalledAppsComplete);
        }
    });
}
var menu_template =
    "<li class=\"{0} {1}\" onclick=\"go_app('{2}');apps_button_active()\" id=\"{3}\"><div class=\'{4}\'>{5}</div></li>";

function put_to_menu() {
    var menu_ele = $("#SubMenuDiv .LightningSubMenu");
    var cnt = apps_list.length;
    var now_focus_menu_now_exist = false;
    //var login_user = getCookie("username");
    $("#SubMenuDiv .apkg_menu").remove();
    var idx = 0;
    for (var i = 0; i < cnt; i++) {
        if ((user_login != '1') || ((user_login == '1') && (apps_list[i]['user_control'] == "0"))) {
            if (now_focus_menu == apps_list[i]['show'] && !now_focus_menu_now_exist) now_focus_menu_now_exist =
                true;
            var _item = String.format(menu_template,
                /*0*/
                "apkg_menu",
                /*1*/
                (now_focus_menu == apps_list[i]['show']) ? "LightningSubMenuOn" : "",
                /*2*/
                idx, //menu index
                /*3*/
                apps_list[i]['name'],
                /*4*/
                (1 == apps_list[i]['available_upgrade']) ? "appicon" : "",
                /*5*/
                apps_list[i]['show']);
            menu_ele.append(_item);
            idx++;
        }
    }
    if (!now_focus_menu_now_exist && now_focus_menu !== "") {
        //if ($("#SubMenuDiv .LightningSubMenu .LightningSubMenuOn").length == 0)
        //	go_sub_page('/web/addons/http_downloads.html', 'http_downloads');
        now_focus_menu = "";
    }
    $("#SubMenuDiv .LightningSubMenu li:first").removeClass("LightningSubMenuFirst").addClass(
        "LightningSubMenuFirst");
    if ($("#SubMenuDiv .LightningSubMenu li").length > 1) $("#SubMenuDiv .LightningSubMenu li:last").removeClass(
        "LightningSubMenuEnd").addClass("LightningSubMenuEnd");
    if ($("#SubMenuDiv .LightningSubMenu li").length > 6) {
        $(".ButtonArrowTop").show();
        $(".ButtonArrowBottom").show();
    } else {
        $(".ButtonArrowTop").hide();
        $(".ButtonArrowBottom").hide();
    }
    menu_ele = null;
}

function go_app(idx) {
    //fish20140115+ for call page_unload(), when leave app page
    if (typeof(page_unload) == "function") page_unload();
    $.ajax_pool.abortAll();
    //fish20140115+ end
    var menu_idx = 0;
    idx = parseInt(idx, 10);
    //For admin
    var apps_total_apps_counter = parseInt($(".LightningSubMenu").find("li").size(), 10);
    var apps_apkg_apps_counter = parseInt($(".LightningSubMenu").find(".apkg_menu").size(), 10);
    menu_idx = idx + (apps_total_apps_counter - apps_apkg_apps_counter);
    if (user_login) menu_idx = idx;
    $("#apps_config_button").show();
    $("#mainbody").html($("#apkg_template").html());
    $("#SubMenuDiv .LightningSubMenu .LightningSubMenuOn").removeClass("LightningSubMenuOn");
    $("#SubMenuDiv .LightningSubMenu li").eq(menu_idx).removeClass("LightningSubMenuOn").addClass(
        "LightningSubMenuOn");
    $("#app_icon").html(String.format("<img src=\"{0}\" border=\"0\" style=\"height: 40px;\">", apps_list[idx][
        'icon'
    ]));
    $("#app_show_name").html(apps_list[idx]['show']);
    $("#app_description").html(apps_list[idx]['description']);
    $("#apps_install_details_name").html(apps_list[idx]['show']);
    if (user_login) {
        $("#app_link").html("");
        if (apps_list[idx]['enable'] == 1) {
            $("#apps_config_button").unbind('click');
            if (apps_list[idx]['url'].length > 0) {
                if ((parseInt(apps_list[idx]['center_type'], 10)) != 1) {
                    //$("#app_link").html(String.format("<a href=\"{0}\" target=\"_blank\">{1}</a>", full_url, full_url));
                    $("#apps_config_button").click(function() {
                        if ($(this).hasClass('gray_out')) return;
                        // Docker returns the fully qualified url.  No need to add a port.
                        var full_url = apps_list[idx]['url'];
                        if (!apps_list[idx]['is_docker']) {
                            var my_port = (apps_list[idx]['url_port'].length <= 0) ? "" : ":" + apps_list[idx]['url_port'];
                            full_url = String.format("{0}//{1}{2}{3}", window.location.protocol, window.location.hostname, my_port, apps_list[idx]['url']);
                            window.open(full_url, "_blank");
                        }
                    });
                } else {
                    $("#apps_config_button").click(function() {
                        if ($(this).hasClass('gray_out')) return;
                        go_sub_page(apps_list[idx]['url'], apps_list[idx]['name']);
                    });
                }
                full_url = null;
            }
        }
        return;
    }
    var my_version = apps_list[idx]['version'];
    $("#apps_install_details_verison").html(my_version);
    var tmp = apps_list[idx]['inst_date']; //Text: MM/DD/YYYY
    if (tmp.indexOf(" ") == -1) {
        var my_date = dateFormat(new Date(tmp.slice(6, 10), (parseInt(tmp.slice(0, 2), 10) - 1), tmp.slice(3, 5),
            '', '', ''), "dddd, mmmm dS, yyyy");
    } else {
        //inst_date:01/07/2014 19:18:56
        var dt = new Date(tmp.slice(6, 10), (parseInt(tmp.slice(0, 2), 10) - 1), tmp.slice(3, 5), tmp.slice(11, 13),
            tmp.slice(14, 16), tmp.slice(17, 19)).valueOf();
        var my_date = multi_lang_format_time(dt);
    }
    $("#apps_install_details_installon").html(my_date);
    if (apps_list[idx]['url'] !== "") {
        if (apps_list[idx]['enable'] == "1") {
            var xurl = document.URL.substr(0, 5);
            var my_port = "";
            switch (apps_list[idx]['name']) {
                case "aMule":
                case "IceCast":
                case "Joomla":
                case "phpBB":
                case "phpMyAdmin":
                case "SqueezeCenter":
                case "WordPress":
                    my_port = window.location.port;
                    break;
                default:
                    my_port = apps_list[idx]['url_port'];
                    break;
            }
            my_port = (my_port.length <= 0) ? "" : ":" + my_port;
            $("#apps_config_button").unbind('click');
            if ((parseInt(apps_list[idx]['center_type'], 10)) != 1) {
                $("#apps_config_button").click(function() {
                    if ($(this).hasClass('gray_out')) return;

                    // Docker configuration URL is fully qualified
                    var full_url = apps_list[idx]['url'];
                    if (apps_list[idx]['is_docker'] === 0) {
                    		var full_tpl="http{0}://{1}{2}{3}";
                    		full_url = String.format(full_tpl,
                    		/*0*/ (xurl == "https")?"s":"",
                    		/*1*/	document.domain,
                    		/*2*/	my_port,
                    		/*3*/ apps_list[idx]['url']);
//Mark by Alpha.Eve Wu:[SKY-4441]-App Config page(DVBLink, Arcus and Z-Way) does not redirect with port number           		
//                        var protocol = "http://";
//                        if (xurl == "https") {
//                            protocol = "https://";
//                            full_url = protocol + document.domain + my_port + apps_list[idx]['url'];
//                        }
                    }
                    window.open(full_url, "_blank");
                });
            } else {
                $("#apps_config_button").click(function() {
                    if ($(this).hasClass('gray_out')) return;
                    go_sub_page(apps_list[idx]['url'], apps_list[idx]['name']);
                });
                /*
					my_html = String.format("<span class='edit_detail_x1' onclick=go_sub_page('{0}','{1}');>{2}//{3}{4}</span>",
								apps_list[idx]['url'], apps_list[idx]['name'],window.location.protocol,window.location.hostname,apps_list[idx]['url']
					);*/
            }
        } else my_html = _T('_module', 'desc4');
    } else my_html = _T('_module', 'desc4');
    if (apps_list[idx]['individual_flag'] == '0') $("#apps_note_tr").show();
    else $("#apps_note_tr").hide();
    var app_switch =
        '<input id="apps_runApp_switch" name="apps_runApp_switch" class="onoffswitch" type="checkbox" value="true" >';
    $("#apps_runAppSwitch_div").html(app_switch);
    setSwitch('#apps_runApp_switch', apps_list[idx]['enable']);
    if (apps_list[idx]['enable'] == "1" && apps_list[idx]['url'].length > 0) {
        $("#apps_config_button").removeClass("gray_out");
    } else {
        $("#apps_config_button").addClass("gray_out");
    }
    init_switch();
    $("#apps_runApp_switch").unbind("click");
    $("#apps_runApp_switch").click(function() {
        if (apps_list[idx]['is_docker']) {
            if (apps_list[idx]['enable'] == 1) {
                stopDockerApp(apps_list[idx]);
            } else {
                startDockerApp(apps_list[idx]);
            }
        } else {
            var v = getSwitch('#apps_runApp_switch');
            jLoading(_T('_common', 'set'), 'loading', 's', "");
            wd_ajax({
                url: "/cgi-bin/apkg_mgr.cgi",
                type: "POST",
                cache: false,
                data: {
                    cmd: "cgi_apps_set",
                    f_module_name: apps_list[idx]['name'],
                    f_enable: v
                },
                dataType: "xml",
                success: function(xml) {
                    jLoadingClose();
                    var res = parseInt($(xml).find("result").text(), 10);
                    if (res == APKG_ENABLE_DEP_FAIL) {
                        setSwitch('#apps_runApp_switch', 0);
                        jAlert(_T('_module', 'msg19'), "warning");
                        return;
                    } else if (res == APKG_ENABLE_CON_FAIL) {
                        setSwitch('#apps_runApp_switch', 0);
                        jAlert(_T('_module', 'msg23'), "warning");
                        return;
                    } else if (res == APKG_DISABLE_DEP_FAIL) {
                        setSwitch('#apps_runApp_switch', 1);
                        jAlert(_T('_module', 'msg21'), "warning");
                        return;
                    }
                    apps_list[idx]['enable'] = v;
                    console.log("idx enable: " + apps_list[idx]['enable']);
                    go_app(idx);
                    setSwitch('#apps_runApp_switch', apps_list[idx]['enable']);
                    var url = apps_list[idx]['url'];
                    if (url.length !== 0) {
                        if (v == 1) {
                            $("#apps_config_button").removeClass("gray_out");
                        } else {
                            $("#apps_config_button").addClass("gray_out");
                        }
                    }
                }
            });
        }
    });
}

function load_app_info(callback) {
    wd_ajax({
        url: "/cgi-bin/apkg_mgr.cgi",
        type: "POST",
        cache: false,
        data: {
            cmd: "cgi_apps_load_appinfo"
        },
        dataType: "xml",
        success: function(xml) {
            var res = $(xml).find("res").text();
            if (callback) {
                callback(res);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            if (callback) {
                callback(1);
            }
        }
    });
}

function load_app_info_xml() {
    APPS_INFO_XML.length = 0;
    /*
	  <App>
                <Name>IceCast</Name>
                <ShowName>IceCast</ShowName>
                <Version>1.01</Version>
                <Image>http://download.wdc.com/apps/WDMyCloudEX4/IceCast/IceCast_1.01.bin</Image>
                <FileSize>741376</FileSize>
                <Icon>http://download.wdc.com/apps/WDMyCloudEX4/IceCast/IceCast.png</Icon>
                <AppDescription>http://setup.wd2go.com/?mod=faqs&amp;device=mcp4&amp;faq=thirdParty</AppDescription>
                <ReleaseNotes>http://support.wd.com/download/notes/apps/WDMyCloudEX4/IceCast_releasenote.txt</ReleaseNotes>
                <MinFWVer>1.03.040</MinFWVer>
                <MaxFWVe>1.03.040</MaxFWVe>
   </App>
		*/
    wd_ajax({
        url: '/xml/app_info.xml',
        type: "GET",
        async: false,
        cache: false,
        dataType: "xml",
        success: function(xml) {
                $(xml).find('App').each(function(idx) {
                    if ($(this).find('Name').text().length !== 0) {
                        var _apps_info = new Array();
                        _apps_info['is_docker'] = 0;
                        _apps_info['Name'] = $(this).find('Name').text();
                        _apps_info['ShowName'] = $(this).find('ShowName').text();
                        _apps_info['Version'] = $(this).find('Version').text();
                        _apps_info['Image'] = $(this).find('Image').text();
                        _apps_info['FileSize'] = $(this).find('FileSize').text();
                        _apps_info['Icon'] = $(this).find('Icon').text();
                        _apps_info['AppDescription'] = $(this).find('AppDescription').text();
                        _apps_info['ReleaseNotes'] = $(this).find('ReleaseNotes').text();
                        var _MinFWVer = ($(this).find('MinFWVer').text() === "") ? "0.0.0" : $(this).find(
                            'MinFWVer').text();
                        var _MaxFWVer = ($(this).find('MaxFWVer').text() === "") ? "65535.65535.65535" :
                            $(this).find('MaxFWVer').text();
                        _apps_info['MinFWVer'] = _MinFWVer;
                        _apps_info['MaxFWVer'] = _MaxFWVer;
                        _apps_info['Available_Install'] = apps_browse_available_install(_MinFWVer,
                            _MaxFWVer);
                        APPS_INFO_XML.push(_apps_info);
                    }
                });
                //			var msg = "APPS_INFO_XML.length =" + APPS_INFO_XML.length + "\n";
                //			for(var idx=0; idx<APPS_INFO_XML.length; idx++)
                //			{
                //				msg += "['Name'] = "+ APPS_INFO_XML[idx]['Name'].toString()+"\n";
                //				msg += "['MinFWVer'] = "+ APPS_INFO_XML[idx]['MinFWVer'].toString()+"\n";
                //				msg += "['MaxFWVe'] = "+ APPS_INFO_XML[idx]['MaxFWVer'].toString()+"\n";
                //				msg += "['Available_Install'] = "+ APPS_INFO_XML[idx]['Available_Install'].toString()+"\n\n";
                //			}
                //			alert(msg);
            } //end of success
    }); //end of
}
