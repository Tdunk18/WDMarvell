#!/bin/bash
#
# ? 2010 Western Digital Technologies, Inc. All rights reserved.
#
# update_timezone_config.sh
#
# Modified By Alpha.Brian
#---------------------



PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin
#---------------------
# Begin Script
#---------------------

#alpha_timezone_index=WD_timezone
tz_map=(
	0="Pacific/Midway" #no use index from 1 to 100
	1="Pacific/Fiji"
	2="Pacific/Midway"
	3="US/Hawaii"
	4="US/Alaska"
	5="America/Tijuana"
	6="US/Pacific"
	7="US/Mountain"
	8="US/Arizona"
	9="America/Chihuahua"
	10="America/Guatemala"
	11="US/Central"
	12="America/Mexico_City"
	13="Canada/Saskatchewan"
	14="US/East-Indiana"
	15="US/Eastern"
	16="America/Bogota"
	17="America/Caracas"
	18="America/Goose_Bay"
	19="America/Manaus"
	20="America/La_Paz"
	21="America/La_Paz"
	22="America/Santiago"
	23="Canada/Newfoundland"
	24="Brazil/East"
	25="America/Argentina/Buenos_Aires"
	26="America/Godthab"
	27="America/Argentina/Buenos_Aires"
	28="America/Montevideo"
	29="America/Noronha"
	30="America/Noronha"
	31="Atlantic/Azores"
	32="Atlantic/Cape_Verde"
	33="Africa/Casablanca"
	34="Europe/London"
	35="Europe/London"
	36="Africa/Casablanca"
	37="Africa/Niamey"
	38="Europe/Brussels"
	39="Europe/Belgrade"
	40="Europe/Amsterdam"
	41="Europe/Sarajevo"
	42="Africa/Niamey"
	43="Asia/Amman"
	44="Europe/Athens"
	45="Europe/Athens"
	46="Asia/Amman"
	47="Asia/Beirut"
	48="Africa/Harare"
	49="Asia/Jerusalem"
	50="Africa/Cairo"
	51="Europe/Athens"
	52="Europe/Helsinki"
	53="Asia/Baghdad"
	54="Europe/Minsk"
	55="Africa/Nairobi"
	56="Asia/Kuwait"
	57="Asia/Tehran"
	58="Asia/Baku"
	59="Asia/Muscat"
	60="Asia/Baku"
	61="Europe/Moscow"
	62="Asia/Yerevan"
	63="Asia/Muscat"
	64="Asia/Kabul"
	65="Asia/Karachi"
	66="Asia/Tashkent"
	67="Asia/Kolkata"
	68="Asia/Kolkata"
	69="Asia/Katmandu"
	70="Asia/Yekaterinburg"
	71="Asia/Dhaka"
	72="Asia/Dhaka"
	73="Asia/Rangoon"
	74="Asia/Bangkok"
	75="Asia/Almaty"
	76="Asia/Hong_Kong"
	77="Asia/Taipei"
	78="Asia/Kuala_Lumpur"
	79="Australia/Perth"
	80="Asia/Krasnoyarsk"
	81="Asia/Irkutsk"
	82="Asia/Tokyo"
	83="Asia/Irkutsk"
	84="Asia/Seoul"
	85="Australia/Adelaide"
	86="Australia/Darwin"
	87="Australia/Brisbane"
	88="Australia/Canberra"
	89="Asia/Yakutsk"
	90="Australia/Hobart"
	91="Pacific/Guam"
	92="Asia/Vladivostok"
	93="Asia/Magadan"
	94="Asia/Magadan"
	95="Asia/Magadan"
	96="Asia/Magadan"
	97="Pacific/Fiji"
	98="Pacific/Auckland"
	99="Pacific/Midway"
	100="Pacific/Midway"
	)

tz_index=`xmldbc -g /system_mgr/time/timezone`

if [ $tz_index -lt 1 ]; then
	exit 1
elif [ $tz_index -gt 100 ]; then
	exit 1
fi

tz=`echo ${tz_map[$tz_index]} | sed s/$tz_index=//g`

echo $tz > /etc/timezone
