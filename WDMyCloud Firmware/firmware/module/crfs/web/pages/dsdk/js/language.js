/*
 * Copyright (c) 2015, Western Digital Corp. All rights reserved.
 */
function getDockerAppDesc(appInfo) {
    var desc = appInfo.Description;
    console.log("appInfo.Name: " + appInfo.Name);
    var sys_time = (new Date()).getTime();
    var descUri = "/wdapps/" + appInfo.Name + "/desc.json?id=" + sys_time;
    var response = $.ajax({
        url: descUri,
        type: "GET",
        async: false,
        contentType: "application/json"
    }).responseText;
    console.log("response: " + response);
    if (response) {
        try {
            var lang = I18N_ARRAY[MULTI_LANGUAGE];
            var i18nProps = jQuery.parseJSON(response);
            console.log("i18nProps: " + i18nProps);
            if (i18nProps.hasOwnProperty('description') && i18nProps.description.hasOwnProperty(lang)) {
                desc = i18nProps.description[lang];
            } else {
                desc = appInfo.Description;
            }
        } catch (err) {
        }
    }
    console.log("Returning description: " + desc);
    return desc;
}
