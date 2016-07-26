TR_WD_PID="/var/run/traceroute_wd.pid"
TR_WD2GO_FILE="/tmp/traceroute-wd2go.com.txt"
TR_WDC_FILE="/tmp/traceroute-wdc.com.txt"

kill -9 `cat ${TR_WD_PID}`
echo $$ > ${TR_WD_PID}
killall traceroute
rm -f ${TR_WD2GO_FILE} ${TR_WDC_FILE}

traceroute  -m 20 www.wd2go.com > ${TR_WD2GO_FILE}.tmp
#traceroute -w1 -m 20 www.wd2go.com > ${TR_WD2GO_FILE}.tmp
traceroute  -m 20 www.wdc.com > ${TR_WDC_FILE}.tmp
#traceroute -w1 -m 20 www.wdc.com > ${TR_WDC_FILE}.tmp
mv ${TR_WD2GO_FILE}.tmp ${TR_WD2GO_FILE}
mv ${TR_WDC_FILE}.tmp ${TR_WDC_FILE}
rm ${TR_WD_PID}
