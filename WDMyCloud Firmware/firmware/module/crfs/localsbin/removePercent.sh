#!/bin/sh

STRING=/etc/nas/strings 
ALERT=/etc/nas/strings/en_US/alertmessages.txt

line1=`grep -nr "1002D" "${ALERT}" | cut -d ':' -f 1`
line2=`grep -nr "1022D" "${ALERT}" | cut -d ':' -f 1`

find "${STRING}" -name "*.txt" | xargs sed -i ""${line1}"s/ %1 / /g"
find "${STRING}" -name "*.txt" | xargs sed -i ""${line2}"s/ %1 / /g"

#Remove 1002, 1022 alert description "%1" for KC, Zion, Glacier, Black ice, Mirrorman.
