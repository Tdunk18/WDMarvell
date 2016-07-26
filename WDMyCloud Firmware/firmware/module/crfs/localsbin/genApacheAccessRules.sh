#!/bin/bash
#
# � 2010 Western Digital Technologies, Inc. All rights reserved.
#
# genApacheAccessRules.sh
#
#
#---------------------

PATH=/sbin:/bin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin

. /etc/nas/config/apache-php-webdav.conf 2>/dev/null

# exit if apache auth dir is absent (e.g. during build)
[ ! -d "${APACHE_AUTH_DIR}" ] && exit 0

# remove old files before creating new records
rm -f "${APACHE_REQUIRE_FILE_PATH}"
rm -f "${APACHE_ALIAS_FILE_PATH}"
touch ${APACHE_REQUIRE_FILE_PATH}
touch ${APACHE_ALIAS_FILE_PATH}
chown -R root:www-data ${APACHE_AUTH_DIR}
chmod -R 775 ${APACHE_AUTH_DIR}

# add limit directives for apache user/share access rules based on trustees.conf
# example private RW: [/dev/sda4]/shares/Michael:Michael:RWBEX:*:CU
# example private RO: [/dev/sda4]/shares/readOnlyShare:Michael:RBE:*:CU
# the trailing ":*:CU" rule is needed for each newly defined share to clear U(nix) permission rules in trustees
            
getShares.sh all > /tmp/allsharelist

while read share; do
    r1_grp=""
    r2_grp=""
    
    line=`grep "/shares/$share:" /etc/trustees.conf`
    doline=$?
    
    if [ $doline -eq 0 ]; then
        echo "Alias /$share /shares/$share" >> "${APACHE_ALIAS_FILE_PATH}"

        r1_grp=$( echo $line | awk 'BEGIN  {ORS=" "; RS = "\n"; FS = ":"; printf("    Require group");}
        {
            for (i=2; i <= NF-1; i=i+2) {
                # give read access to all user-groups listed in trustees for this share,
                # skip any user-group fields defined as "*", "+share" or "www-data"
                if ( ($(i+1) == "RBE" || $(i+1) == "RWBEX") && $(i) != "*" && $(i) != "+share" && $(i) != "www-data" ) {
                    printf(" %s", $(i));
                } 
            }
        }' )
        
        r2_grp=$( echo $line | awk 'BEGIN  {ORS=" "; RS = "\n"; FS = ":"; printf("    Require group");}
        {
            for (i=2; i <= NF-1; i=i+2) {
                # grant write access only to user-groups listed as "RWBEX"
                if ( $(i+1) == "RWBEX" && $(i) != "*" && $(i) != "+share" && $(i) != "www-data" ) {
                   printf(" %s", $(i));
                }
            }
        }' )
    fi
    
    # This is somewhat subtle:
    # 1. if r1_grp is empty then we have a 'Public' share, therefore no group rule should exist for either r1_grp or r2_grp
    # 2. don't want empty 'Require group' since it will block everyone - just leave 'Require valid-user' in place for public share
    if [ "${r1_grp}" == "    Require group" ]; then
        r1_grp=""
        r2_grp=""
    fi

# list of all webdav http methods:
# GET, POST, PUT, DELETE, CONNECT, OPTIONS, PATCH, PROPFIND, PROPPATCH, MKCOL, COPY, MOVE, and UNLOCK
# see "http://www.webdav.org/specs/rfc2518.html"
cat >> "${APACHE_REQUIRE_FILE_PATH}" <<Endofmessage
    <Directory /shares/$share/>
        Dav on
        Allow from all
        AuthName DeviceUser
        AuthType Digest
        AuthDigestProvider file
        AuthDigestDomain /shares/ /shares/$share/ /$share/
        AuthUserFile /etc/nas/apache2/auth/htpasswd
        AuthGroupFile /etc/nas/apache2/auth/htgroup
        <Limit GET PROPFIND COPY>
            Require valid-user
            ${r1_grp}
        </Limit>
        <Limit POST PUT DELETE MOVE MKCOL PROPPATCH>
            ${r2_grp}
        </Limit>
    </Directory>
Endofmessage
done < /tmp/allsharelist


# Reqiure a valid user for 'public' access also
# Add directives to turn on Dav for all Public alias locations

# cleanup tmp files
chown :www-data "${APACHE_ALIAS_FILE_PATH}"
chmod 775 "${APACHE_ALIAS_FILE_PATH}"
chown :www-data "${APACHE_REQUIRE_FILE_PATH}"
chmod 775 "${APACHE_REQUIRE_FILE_PATH}"
rm -f /tmp/allsharelist

