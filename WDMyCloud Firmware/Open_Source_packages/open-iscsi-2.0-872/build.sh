export ALPHA_CUSTOMIZE=1

if [ -z "${LINUX_SRC}" ] ; then
	echo "You need to export LINUX_SRC first"
	echo "	export LINUX_SRC=/opt/DNS-345_LSP/linux-2.6.31.8"
	exit 1
fi

if [ ! -e ${TOOLCHAIN_FS}/lib/libcrypto.so ]; then
	echo ""
	echo "*ERROR*: You need to build libcrypto first."
	echo ""
	echo "\$ cd ${MODULE_DIR}/gpl/openssl-0.9.8m"
	echo "\$ sh build.sh"
	echo ""
	exit 1
fi

make clean
make KSRC=${LINUX_SRC}
if [ $? != 0 ] ; then
echo "make failed!!!!"
exit 1
fi


