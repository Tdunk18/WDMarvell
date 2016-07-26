/*
 * Copyright (c) 2015, Western Digital Corp. All rights reserved.
 */
/*
 * Global Variables
 */
var dockerFirstTime = true;
/*
 * Docker App Methods
 */
function startDockerApp(appInfo) {
    jLoading(_T('_common', 'set'), 'loading', 's', "");
    appInfo.enable = 1;
    wd_ajax({
        url: '/web/dsdk/ActiveApps.php',
        type: "POST",
        data: '{"AppName":"' + appInfo.name + '"}',
        async: true,
        cache: false,
        contentType: "application/json",
        statusCode: {
            200: function(response) {
                updateDockerAppAutoStart(appInfo, true);
                console.log("Application '" + appInfo.name + "' started.");
                appInfo.enable = 1;
            },
            405: function(response) {
                console.error("ERROR: Application '" + appInfo.name + "' not started. HTTP_CODE: 405");
            },
            500: function(response) {
                console.error("ERROR: Application '" + appInfo.name + "' not started. HTTP_CODE: 500");
            }
        },
        complete: function(jqXHR, textStatus) {
            jLoadingClose();
            $(".exposeMask").remove();
        }
    });
}

function stopDockerApp(appInfo) {
    jLoading(_T('_common', 'set'), 'loading', 's', "");
    wd_ajax({
        url: '/web/dsdk/ActiveApps.php?AppName=' + appInfo.name,
        type: "DELETE",
        async: true,
        cache: false,
        contentType: "application/json",
        statusCode: {
            200: function(response) {
                updateDockerAppAutoStart(appInfo, false);
                appInfo.enable = 0;
                console.log("Application '" + appInfo.name + "' stopped.");
            },
            405: function(response) {
                console.error("ERROR: Application '" + appInfo.name + "' not stopped. HTTP_CODE: 405");
            },
            500: function(response) {
                console.error("ERROR: Application '" + appInfo.name + "' not stopped. HTTP_CODE: 500");
            }
        },
        complete: function(jqXHR, textStatus) {
            jLoadingClose();
            $(".exposeMask").remove();
        }
    });
}

function updateDockerAppAutoStart(appInfo, autoStart) {
    wd_ajax({
        url: '/web/dsdk/LocalApps.php',
        type: "PUT",
        data: '{"AppName":"' + appInfo.name + '","AutoStart":' + autoStart + '}',
        async: true,
        cache: false,
        contentType: "application/json",
        statusCode: {
            200: function(response) {
                console.log("Application '" + appInfo.name + "' configuration (autoStart=" + autoStart + ").");
            },
            405: function(response) {
                console.error("ERROR: Application '" + appInfo.name + "' configuration (autoStart). HTTP_CODE: 405");
            },
            500: function(response) {
                console.error("ERROR: Application '" + appInfo.name + "' configuration (autoStart). HTTP_CODE: 500");
            }
        },
        complete: function(jqXHR, textStatus) {
            jLoadingClose();
            $(".exposeMask").remove();
        }
    });
}

function getInstalledDockerApps(installedAppList, availableAppList, callback) {
    wd_ajax({
        url: '/web/dsdk/LocalApps.php',
        type: "GET",
        async: false,
        cache: false,
        contentType: "application/json",
        success: function(result) {
            console.log("result: " + result);
            if (result) {
                jQuery.each(result, function() {
                    var appInfo = [];
                    appInfo.name = this.Name;
                    appInfo.show = this.DisplayName;
                    appInfo.version = this.Version;
                    appInfo.enable = (this.Running === true ? 1 : 0);
                    appInfo.url = localhostToServerIP(this.ConfigUrl);

                    /*
                     * The url_port property is not used for docker apps and theregore
                     * the value is irrelevant.  But if it is not specified, an error
                     * occcurs in the main code.
                     */
                    appInfo.url_port = 80;

                    var iconLocation = getLocation(this.IconPath);
                    console.log("iconLocation: " + iconLocation);
                    appInfo.icon = iconLocation.pathname;
                    appInfo.user_control = this.ConfigAllUser;
                    appInfo.inst_date = getDisplayDateString(this.InstalledOn);
                    appInfo.description = getDockerAppDesc(this);
                    appInfo.is_docker = 1;
                    appInfo.available_upgrade = 0;

                    addInstalledApp(appInfo.name, appInfo);
                });
            }
            put_to_menu();
        },
        complete: function(jqXHR, textStatus) {
            getInstallableDockerApps(installedAppList, availableAppList, callback);
        }
    });
}

function getInstallableDockerApps(installedAppList, availableAppList, callback) {
    var idx = 0;
    wd_ajax({
        url: '/web/dsdk/AvailableApps.php',
        type: "GET",
        async: false,
        cache: false,
        contentType: "application/json",
        success: function(result) {
            jQuery.each(result.AppsListing, function() {
                console.log("Docker Name: " + this.Name);
                if (isDockerVersionCompatible(getCookie("fw_version"), this.MinFWVer, this.MaxFWVer)) {
                    var availableApp = {};
                    availableApp.Name = this.Name;
                    availableApp.DisplayName = this.DisplayName;
                    availableApp.Version = this.Version;
                    availableApp.Image = this.Image;
                    availableApp.FileSize = this.FileSize;
                    availableApp.Icon = this.Icon;
                    availableApp.AppDescription = this.AppDescription;
                    availableApp.ReleaseNotes = this.ReleaseNotes;
                    availableApp.MinFWVer = this.MinFWVer;
                    availableApp.MaxFWVer = this.MaxFWVer;
                    availableApp.Available_Install = 1;
                    availableApp.Upgrade = 0;
                    availableApp.is_docker = 1;
                    isUpgradeAvailable(availableApp, installedAppList);
                    console.log(availableApp);

                    addAvailableApp(availableApp.Name, availableApp);
                }
            });

            console.log(availableAppList);
            callback(1);
        },
      	error:function (xhr, ajaxOptions, thrownError){
            if (thrownError) {
                console.error(thrownError);
            }
      		callback(0);
        }
    });
}

function isUpgradeAvailable(availApp, installedAppList) {
    for (var x = 0;x < installedAppList.length;x++) {
        var installedApp = installedAppList[x];

        if (installedApp.name === availApp.Name) {
            installedApp.available_upgrade = (parseFloat(installedApp.version) < parseFloat(availApp.Version) ? 1 : 0);
            installedApp.upgrade_info = availApp;

            // Update installable item as an update
            availApp.Upgrade = parseInt(installedApp.available_upgrade, 10);

            console.log("++++ installed App ++++ ");
            console.log(installedApp);
            return;
        }
    }
    // If app is not found, mark it as a clean install
    availApp.Upgrade = 0;
}

function installDockerApp(appInfo) {
    console.log(" ***** Installing application '" + appInfo.Name + "'...");
    console.log(appInfo);

    appInfo.enable = 1;
    console.log("Image: " + appInfo.Image);
    var methodstr = 'url';
    var pathstr = appInfo.Image;
    if (appInfo.Image.indexOf("file://") === 0) {
        methodstr = 'file';
        pathstr = appInfo.Image.substring(7);
    }
    wd_ajax({
        url: '/web/dsdk/LocalApps.php',
        type: "POST",
        data: '{"Method":"' + methodstr + '","PackagePath":"' + pathstr + '","Upgrade":' + parseInt(appInfo.Upgrade, 10) + '}',
        async: true,
        cache: false,
        contentType: "application/json",
        statusCode: {
            200: function(response) {
                console.log("Install Package Response: " + response);
                if (response) {
                    var taskId = response.BgTaskID;
                    console.log("Application '" + appInfo.Name + "' install started.  BgTaskID: " + taskId);
                    monitorDockerAppInstall(appInfo, taskId);
                } else {
                    console.error("Response is null. Installed failed for an unknown reason");
                    handleInstallError(appInfo);
                }
            },
            405: function(response) {
                console.error("ERROR: Application '" + appInfo.Name + "' install failed. HTTP_CODE: 405");
                handleInstallError(appInfo);
            },
            500: function(response) {
                console.error("ERROR: Application '" + appInfo.Name + "' install failed. HTTP_CODE: 500");
                handleInstallError(appInfo);
            }
        },
        error:function (xhr, ajaxOptions, thrownError){
      		handleInstallError(appInfo);
            if (thrownError) {
                console.error(thrownError);
            }
        }
    });
}

function monitorDockerAppInstall(appInfo, taskId) {
    wd_ajax({
        url: '/web/dsdk/BgTaskStatus.php?BgTaskID=' + taskId,
        type: "GET",
        async: true,
        cache: false,
        contentType: "application/json",
        statusCode: {
            200: function(response) {
                console.log("App install status (" + appInfo.Name + "): " + response.Status + ", progress: " + response.Progress);

                if (response.Status == "FAILED") {
                    handleInstallError(appInfo);
                } else if (response.Status == "FINISHED" || response.Progress == 100) {

                    setAppInstallRecordResult(appInfo, 2);
                    $("#Apps_InstallApps_parogressbar").progressbar('option', 'value', 100);
                    $("#Apps_InstallApps_Desc").html("100 %");
                    if (timeoutId !== 0) {
                        clearInterval(timeoutId);
                    }
                    $("#Apps_InstallApps_State").val(_T('_module', 'desc13'));
                    $("#Apps_InstallApps_Desc").val('');
                    apps_browse_auto_install();
                } else {
                    var message = "Installing application '" + appInfo.Name + "' ...";
                    $("#Apps_InstallApps_State").html(message);
                    $("#Apps_InstallApps_parogressbar").progressbar('option', 'value', response.Progress);
                    $("#Apps_InstallApps_Desc").html(response.Progress + " %");
                    setTimeout(function() {
                        monitorDockerAppInstall(appInfo, taskId);
                    }, 1000);
                }
            },
            405: function(response) {
                console.error("ERROR: Application '" + appInfo.Name + "' with background task id '" + taskId + "' install failed. HTTP_CODE: 405");
                handleInstallError(appInfo);
            },
            500: function(response) {
                console.error("ERROR: Application '" + appInfo.Name + "' with background task id '" + taskId + "'install failed. HTTP_CODE: 500");
                handleInstallError(appInfo);
            }
        },
        error:function (xhr, ajaxOptions, thrownError){
      		handleInstallError(appInfo);
            if (thrownError) {
                console.error(thrownError);
            }
        }
    });
}

function handleInstallError(appInfo) {
    //install result, 0->Downloading, 1->installing, 2->finish, 3->fail
    setAppInstallRecordResult(appInfo, 3);

    console.error("Installed failed for an unknown reason");
    jLoadingClose();
    $(".exposeMask").remove();
    if (timeoutId !== 0) {
        clearInterval(timeoutId);
    }
    var msg = _T('_module', 'msg6');
    jAlert(msg, "warning", null, function() {
        apps_browse_auto_install();
    });
}

function deleteDockerApp(appInfo, appDeletedCallback) {
    wd_ajax({
        url: '/web/dsdk/LocalApps.php?AppName=' + appInfo.name,
        type: "DELETE",
        async: true,
        cache: false,
        contentType: "application/json",
        statusCode: {
            200: function(response) {
                appDeletedCallback();
                console.log("Application '" + appInfo.name + "' uninstalled.");
            },
            405: function(response) {
                console.error("ERROR: Application '" + appInfo.name + "' not uninstalled. HTTP_CODE: 405");
            },
            500: function(response) {
                console.error("ERROR: Application '" + appInfo.name + "' not uninstalled. HTTP_CODE: 500");
            }
        },
        complete: function(jqXHR, textStatus) {
            jLoadingClose();
            $(".exposeMask").remove();
        }
    });
}

function isDockerVersionCompatible(currentVersion, minVersion, maxVersion) {
    console.log("Checking: " + minVersion + " < " + currentVersion + " < " + maxVersion);
    var options = {
        zeroExtend: true,
        lexicographical: true
    };
    if (versionCompare(minVersion, currentVersion, options) == 1) {
        console.log("minVersion: " + minVersion + " is greater than the currentVersion: " + currentVersion);
        return false;
    }
    if (maxVersion) {
        if (versionCompare(currentVersion, maxVersion, options) == 1) {
            console.log("maxVersion: " + maxVersion + " is greater than the currentVersion: " + currentVersion);
            return false;
        }
    }
    return true;
}

function getDockerInstalledAppDesc(appInfo, installInfoList) {
    var appDescHtml = "";
    console.log("APP NAME: " + appInfo.Name + ", is_docker: " + appInfo.is_docker);
    var installInfo = [];
    installInfo[0] = appInfo.Name; //Module Name
    installInfo[1] = "0"; //install, 0->no, 1->yes
    installInfo[2] = "0"; //install finish, 0->not yet, 1->finished
    installInfo[3] = appInfo.DisplayName;
    installInfo[4] = ""; //install result
    installInfo[5] = appInfo.is_docker; // is docker
    installInfo[6] = appInfo; // docker

    if (installInfoList) {
        var n = installInfoList.length;

        if ((n % 2) == 1) {
            appDescHtml += "<tr id='row " + n + "' class='erow'>";
        } else {
            appDescHtml += "<tr id='row " + n + "'>";
        }
    } else {
        appDescHtml += "<tr id='row " + n + "'>";
    }
    appDescHtml += "<td align=\"center\" width=\"25px\"><div style=\"text-align: center; width:25px;\">";
    appDescHtml += "<input type=\"checkbox\" value=\"" + appInfo.Name + "\" name=\"f_apps_install_" + n + "\" id=\"f_apps_install_" + n +
        "\" onclick=\"apps_browse_install_info('f_apps_install_" + n + "','" + appInfo.Name + "');\">";
    appDescHtml += "</div></td>";
    appDescHtml += "<td align=\"center\" width=\"30px\"><div class=\"list_icon\">";
    appDescHtml += "<div style=\"background-image: url('" + appInfo.Icon + "'); background-size:30px;\"></div>";
    appDescHtml += "</div></td>";
    appDescHtml += "<td align=\"left\"><div style=\"text-align: left; width:230px;\">";
    appDescHtml += appInfo.DisplayName;
    appDescHtml += "</div></td>";
    appDescHtml += "<td align=\"right\"><div style=\"text-align: right; width:200px;\"><a href=\"" + appInfo.AppDescription + "\" target=\'_blank\'>";
    appDescHtml += _T("_module", "desc2");
    appDescHtml += "</a></div></td>";
    appDescHtml += "</tr>";
    if (installInfoList) {
        installInfoList.push(installInfo);
    }
    return appDescHtml;
}

function isDockerSupported() {
    var flag = 0;
    wd_ajax({
        url: '/web/dsdk/SupportDocker.php',
        type: "GET",
        async: false,
        cache: false,
        contentType: "application/json",
        success: function(response) {
            try {
                if (response.docker_support == "1") {
                    flag = 1;
                }
            } catch(err) {
            }
        }
    });
    return flag;
}
