<!doctype html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="PRAGMA" content="no-cache"> 
<meta http-equiv="Expires" content="-1">
<meta http-equiv="Cache-Control" content="no-cache">
</head>

<?php
exec("xmldbc -g /language", $lang);
if ($lang == "")
	$lang = 0;
?>

<script type="text/javascript">
var wd_link = new Array();

var l = "ENG";
for (key in lang_array) {
	if (lang_array[key] == "<?=$lang; ?>") { 
		l = key;
		break;
	}
}

var wd_lang = {
	"ENG": "us",
	"FRA": "fr",
	"ITA": "it",
	"DEU": "de",
	"ESN": "es",
	"CHS": "cn",
	"CHT": "cn",
	"KOR": "kr",
	"JPN": "jp",
	"RUS": "ru",
	"POR": "pt",
	"CZE": "cz",	
	"DUT": "en",
	"HUN": "en",
	"NOR": "en",
	"PLK": "pl",
	"SWE": "en",
	"TUR": "tr"
};

function page_load()
{
	//home_show_volume_info("myhome");
	home_show_user_quota_info();
	show_ftp_download_count(); //P2P
	show_http_download_count(); //HTTP
	show_p2p_download_count(); //P2P
	Home_apps_count(); //APP

	/* [+] My Cloud Desktop */
	var _url = "";
	switch(MODEL_ID)
	{
		case _PROJECT_MODEL_ID_LIGHTNING:
			_url = "http://setup.wd2go.com/?mod=download&device=mcp4";	
			break;
		case _PROJECT_MODEL_ID_KINGS_CANYON:
			_url = "http://setup.wd2go.com/?mod=download&device=mcp2";
			break;
		case _PROJECT_MODEL_ID_ZION:
			_url = "http://setup.wd2go.com/?mod=download&device=mcm";
			break;
		case _PROJECT_MODEL_ID_GLACIER:
			_url = "http://setup.wd2go.com/?mod=download&device=mcg2";
			break;
	}

	$("#wd_cloud_url").attr("href", MY_CLOUD_DESKTOP_URL);
	$("#wd_cloud_text_url").attr("href", MY_CLOUD_DESKTOP_URL);
	/* [-] My Cloud Desktop */

	/* [+] My Cloud and WD Photos */
	var _url = "http://products.wdc.com/?id={0}&type=mobileapps";
	_url = String.format(_url, DEV_ID);

	$("#wd_2go_photos_url").attr("href", _url);
	$("#wd_2go_photos_text_url").attr("href", _url);
	
	if(MODEL_NAME=="BAGX")	//mirrorman ITR:105566
	{
		$("#wd_2go_photos_url img").attr("src","/web/images/icon/cloud/IconWDMyCloudMobile.png");
	}
	else
	{
		$("#wd_2go_photos_url img").attr("src","/web/images/IconCLoudAccessWDPhotos.png");
	}
	
	/* [-] My Cloud Desktop */
}

function page_unload()
{
	
}
</script>

<body>
	<div class="u_b4">
		<div class="WDlabelHeaderBoxLarge header_div" style="margin-top:5px;"><span class="_text" lang="_home" datafld="capacity">Capacity</span></div>
		<div style="clear: both;margin-top:0 !important;">
		<div class="WDlabelInfoBoxLarge info_div" id="myhome_b4_capacity_info" style="margin-top:0;position: relative;top: 36px;">0</div>
		<div class="WDlabelInfoSizeBoxLarge size_div" id="myhome_b4_capacity_size" style="display: inline-block;font-size: 78px;position: relative;top: 55px;padding-right: 34px;padding-left: 150px;color: #85939c;">GB</div>
			<div class="WDlabelInfoFreeBoxLarge" id="myhome_b4_free" style="display: inline-block;font-size: 78px;position: relative;top: 55px;color: #85939c; text-transform: lowercase;">
                <span class="_text" lang="_home" datafld="free"></span>
            </div>
	</div>
			</div>
			
	<div class="u_b5">
		<div class="WDlabelHeaderBoxMedium header_div"><span class="_text" lang="_user_login_home" datafld="quick_status"></span></div>
		<div style="clear: both;"></div>
		<div style="margin: 30px 25px 25px 25px;">
			<div style="margin: 10px 0;">
				<table border='0' cellspacing="0" cellpadding="0" class="qs_text">
					<tr>
						<td width="250"><span class="_text" lang="_user_login_home" datafld="total_ftp_downloads"></span></td>
						<td id="total_ftp_downloads">0</td>
					</tr>
				</table>
			</div>
			<div style="margin: 10px 0;">
				<table border='0' cellspacing="0" cellpadding="0" class="qs_text">
					<tr>
						<td width="250"><span class="_text" lang="_user_login_home" datafld="total_http_downloads"></span></td>
						<td id="total_http_downloads"></td>
					</tr>
				</table>
			</div>
			<div style="margin: 10px 0;">
				<table border='0' cellspacing="0" cellpadding="0" class="qs_text">
					<tr>
						<td width="250"><span class="_text" lang="_user_login_home" datafld="total_p2p_downloads"></span></td>
						<td id="total_p2p_downloads"></td>
					</tr>
				</table>
			</div>
		</div>

	   <div class="u_b6">
			<table border='0' cellspacing="0" cellpadding="0">
				<tr>
					<td align="center" style="width: 50%;">
                        <div style="display:none">
                            <a id="wd_cloud_url" href="#" target="_blank"><img src="/web/images/icon/cloud/IconWDMyCloudMobile.png" border="0"></a>
                        </div>
                        <div style="display:none">
                            <a id="wd_cloud_text_url" href="#" target="_blank">
                                <span class="_text" lang="_user_login_home" datafld="wd_my_cloud_desktop"></span>
                            </a>
                        </div>
					</td>
					<td align="center" style="width: 50%;">
												<div style="display:none">
                            <a id="wd_2go_photos_url" href="#" target="_blank"><img src="" border="0"></a>
                        </div>
                        <div style="display:none">
                            <a id="wd_2go_photos_text_url" href="#" target="_blank">
                                <span class="_text" lang="_user_login_home" datafld="wd_2go_photos"></span>
                            </a>
                        </div>
					</td>
				</tr>
			</table>
		</div>
	</div>

	<div class="LightningDeviceFrame"></div>
	<div class="LightningBottomFrame">
		<div class="b8">
			<div class="WDlabelHeaderBoxMedium m_header_div"><span class="_text" lang="_menu" datafld="ftp_downloads"></span></div>
			<div class="WDlabelInfoBoxMedium m_info_div" id="ftp_download_div">0</div>
			<div class="WDlabelAddIconSmall m_arrow_div" id="ftp_download_arrow" onClick="go_page('/web/myHome/downloads.html?sub=ftp_downloads', 'nav_downloads');"></div>
		</div>	
		<div class="b8">
			<div class="WDlabelHeaderBoxMedium m_header_div"><span class="_text" lang="_menu" datafld="http_downloads"></span></div>
			<div class="WDlabelInfoBoxMedium m_info_div" id="http_download_div">0</div>
			<div class="WDlabelAddIconSmall m_arrow_div" id="http_download_arrow" onClick="go_page('/web/myHome/downloads.html', 'nav_downloads');"></div>
		</div>	
		<div class="b8">
			<div class="WDlabelHeaderBoxMedium m_header_div"><span class="_text" lang="_menu" datafld="p2p_downloads"></span></div>
			<div class="WDlabelInfoBoxMedium m_info_div" id="p2p_download_div">0</div>
			<div class="WDlabelAddIconSmall m_arrow_div" id="p2p_download_arrow" onClick="go_page('/web/myHome/downloads.html?sub=p2p_download', 'nav_downloads');"></div>
		</div>	
		<div class="b8" style="margin-left: 2px;right: -11px;position: relative;">
			<div class="WDlabelHeaderBoxMedium m_header_div"><span class="_text" lang="_menu_title" datafld="app"></span></div>
			<div class="WDlabelInfoBoxMedium m_info_div" id="home_apps_count">0</div>
			<div class="WDlabelArrowIconSmall m_arrow_div" id="user_home_apps_link"></div>
		</div>
	</div>
</body>	
</html>
