/*
 * Copyright (c) 2015, Western Digital Corp. All rights reserved.
 */
// APPS_INSTALL_APPS_INFO is a global variable holding install app state
/*
APPS_INSTALL_APPS_INFO[0] = my_module_name;	//Module Name
APPS_INSTALL_APPS_INFO[1] = "0";			//install, 0->no, 1->yes
APPS_INSTALL_APPS_INFO[2] = "0";			//install finish, 0->not yet, 1->finished
APPS_INSTALL_APPS_INFO[3] = my_show_name;
APPS_INSTALL_APPS_INFO[4]	= "";			//install result, 0->Downloading, 1->installing, 2->finish, 3->fail
*/

function setAppInstallRecordResult(appInfo, installResult) {
    for (var i = 0; i < APPS_INSTALL_APPS_INFO.length; i++) {
        if (APPS_INSTALL_APPS_INFO[i][0] == appInfo.Name) {
            APPS_INSTALL_APPS_INFO[i][1] = 1;
            APPS_INSTALL_APPS_INFO[i][2] = 1;
            APPS_INSTALL_APPS_INFO[i][3] = appInfo.DisplayName;
            APPS_INSTALL_APPS_INFO[i][4] = installResult;
        }
    }
}

/*
 * Utility Methods
 */

function versionCompare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }
    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }
    console.log("zeroExtend: " + zeroExtend);
    if (zeroExtend) {
        while (v1parts.length < v2parts.length) {
            v1parts.push("0");
        }
        while (v2parts.length < v1parts.length) {
            v2parts.push("0");
        }
    }
    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }
    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }
        if (v1parts[i] == v2parts[i]) {
            continue;
        } else if (v1parts[i] > v2parts[i]) {
            console.log(v1parts[i] + " > " + v2parts[i]);
            return 1;
        } else {
            console.log(v1parts[i] + " < " + v2parts[i]);
            return -1;
        }
    }
    if (v1parts.length != v2parts.length) {
        console.log(v1parts.length + " != " + v2parts.length);
        return -1;
    }
    return 0;
}

/*
Input date is expected to be in this format :
2015-07-25T13:16:46
*/

function getDisplayDateString(d) {
    var isIE = detectIE();
    var isFirefox = detectFirefox();

    console.log("isIE: " + isIE + ", isFirefox: " + isFirefox);
    if (isIE || isFirefox) {
        d += 'Z';
    }

    console.log("Input Date String: " + d);

    var date = new Date(d);
    date = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));

    var dateString = "";
    dateString += ("0" + (date.getMonth() + 1)).slice(-2);
    dateString += '/';
    dateString += ("0" + date.getDate()).slice(-2);
    dateString += '/';
    dateString += date.getFullYear();
    dateString += ' ';
    dateString += ("0" + date.getHours()).slice(-2);
    dateString += ":";
    dateString += ("0" + date.getMinutes()).slice(-2);
    dateString += ":";
    dateString += ("0" + date.getSeconds()).slice(-2);
    console.log(dateString);
    return dateString;
}

/**
 * Given a URL, parse the path from the hostname
 */

function getLocation(href) {
    if (href) {
        var l = document.createElement("a");
        l.href = href;
        return l;
    } else {
        return null;
    }
}

function localhostToServerIP(url) {
    if (url !== null && url.indexOf('localhost') !== -1) {
        return url.replace('localhost', location.hostname);
    }
    console.log("localhostToServerIP: url=" + url);
    return url;
}

/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
       // IE 12 => return version number
       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

function detectFirefox() {
    return (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 );
}
