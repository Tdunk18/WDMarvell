# if /etc/smtp.conf real link path is /aa/bb/cc/smtp.conf.mirrorman
# run "get_suffix_product.sh" will return ".mirrorman"
# run "get_suffix_product.sh -- haha" will return "haha.mirrorman"

# if /etc/test.conf real link path is /aa/bb/cc/test.conf.bbman
# run "get_suffix_product.sh /etc/test.conf haha" will return "haha.bbman"

name="/etc/smtp.conf"
[ -z "${1}" ] || [ "${1}" = "--" ] || name="${1}"
suffix_product=`readlink -f ${name} 2>/dev/null`
echo ${2}${suffix_product##*${name}}
