#! /bin/sh

#./configure --host=arm-linux --prefix=${PWD}/.install LD=$(CC) --with-zlib=${PWD}/../zlib-1.2.3/_install/
#make

install_sftp=1

#case $PROJECT_NAME in
#
#	LIGHTNING-4A)
#	install_sftp=1
#	;;
#
#	KingsCanyon)
#	install_sftp=1
#	;;
#
#	*)
#	echo $PROJECT_NAME dont supprot sftp
#	;;
#
#esac


unset CFLAGS
unset LDFLAGS
unset LIBS

#source ../xcp.sh
CMD_CP="../color_copy.sh"
export OPENSSL_FOLDER_NAME="openssl-1.0.1j"
SSH_BIN_PATH=/usr

xbuild()
{
sh needlib.sh

#find ./ * | xargs touch -d `date -d 'today' +%y%m%d`

#./configure --host=${CC%-*}  --with-default-path="/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/sbin" LD=$(CC) --prefix= --with-zlib=${PWD}/../zlib-1.2.3 --with-ssl-dir=`pwd`/../tmp_install/
#./configure --host=${CC%-*}  LD=$(CC) --prefix= --with-zlib=${PWD}/../tmp_install --with-ssl-dir=`pwd`/../tmp_install/
./configure --host=${CC%-*} --without-openssl-header-check --with-default-path="/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/sbin:/usr/local/bin" LD=$(CC) --prefix=$SSH_BIN_PATH --with-zlib=${PWD}/../zlib-1.2.3 --with-ssl-dir=`pwd`/../$OPENSSL_FOLDER_NAME/xinst/usr

make
make install-files STRIP_OPT= DESTDIR=`pwd`/tmp_install

${CC%-*}-strip tmp_install$SSH_BIN_PATH/sbin/sshd
${CC%-*}-strip tmp_install$SSH_BIN_PATH/bin/ssh
${CC%-*}-strip tmp_install$SSH_BIN_PATH/bin/ssh-keygen

source ./colortab.sh

echo -e $fcolor_green$color_bright
echo '		##############################################'
echo '		# 1.Run "sh clean.sh" to clean all           #'
echo '		#   dependancy files                         #'
echo '		# 2.Run "sh .installfile.sh" to install      #'
echo '		#    files to /home/tmp/user                 #'
echo '		# 3.Run "sh .installfile.sh nas" to install  #'
echo '		#    files to nas folder                     #'
echo '		##############################################'
echo -ne $color_default
}

xinstall()
{
	${CC%-*}-strip tmp_install$SSH_BIN_PATH/sbin/sshd
	${CC%-*}-strip tmp_install$SSH_BIN_PATH/bin/ssh
	${CC%-*}-strip tmp_install$SSH_BIN_PATH/bin/ssh-keygen

	${CMD_CP} tmp_install$SSH_BIN_PATH/sbin/sshd ${ROOT_FS}/sbin
	${CMD_CP} tmp_install$SSH_BIN_PATH/bin/ssh ${ROOT_FS}/bin
	${CMD_CP} tmp_install$SSH_BIN_PATH/bin/ssh-keygen ${ROOT_FS}/bin

	if [ $install_sftp -eq 1 ];then
		${CC%-*}-strip tmp_install$SSH_BIN_PATH/bin/sftp
		${CC%-*}-strip tmp_install$SSH_BIN_PATH/bin/scp
		${CC%-*}-strip tmp_install$SSH_BIN_PATH/libexec/sftp-server

		${CMD_CP} tmp_install$SSH_BIN_PATH/bin/sftp ${ROOT_FS}/bin
		${CMD_CP} tmp_install$SSH_BIN_PATH/bin/scp ${ROOT_FS}/bin
		${CMD_CP} tmp_install$SSH_BIN_PATH/libexec/sftp-server ${ROOT_FS}/bin
	fi
}


xclean()
{
	sh clean.sh
}

if [ "$1" = "build" ]; then
   xbuild
elif [ "$1" = "install" ]; then
   xinstall
elif [ "$1" = "clean" ]; then
   xclean
else
   echo "Usage : xbuild.sh build or xbuild.sh install or xbuild.sh clean"
fi
