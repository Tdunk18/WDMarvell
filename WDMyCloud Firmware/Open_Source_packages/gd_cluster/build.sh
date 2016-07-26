#!/bin/sh
MY_POSITION=${PWD}

#build iconv
cp ${MY_POSITION}/iconv_build.sh ${MY_POSITION}/../libiconv-1.9.2/
cd ${MY_POSITION}/../libiconv-1.9.2/
./iconv_build.sh
if [ $? != 0 ] ; then
	echo "configure failed!!!!"
	exit 1
fi
make clean;make distclean
rm iconv_build.sh
cd $MY_POSITION

#build zlib
cp ${MY_POSITION}/zlib_build.sh ${MY_POSITION}/../zlib-1.2.3/
cd ${MY_POSITION}/../zlib-1.2.3/
./zlib_build.sh
if [ $? != 0 ] ; then
	echo "configure failed!!!!"
	exit 1
fi
make clean;make distclean
rm zlib_build.sh
cd $MY_POSITION

#build libjpeg
cp ${MY_POSITION}/jpeg7_build.sh ${MY_POSITION}/../jpeg-7/
cd ${MY_POSITION}/../jpeg-7/
./jpeg7_build.sh
if [ $? != 0 ] ; then
	echo "configure failed!!!!"
	exit 1
fi

make clean;make distclean
rm jpeg7_build.sh
cd $MY_POSITION

#build libpng
cp ${MY_POSITION}/libpng_build.sh ${MY_POSITION}/../libpng-1.2.39/
cd ${MY_POSITION}/../libpng-1.2.39/
./libpng_build.sh
if [ $? != 0 ] ; then
	echo "configure failed!!!!"
	exit 1
fi
make clean;make distclean
rm libpng_build.sh
cd $MY_POSITION

#build freetype
cp ${MY_POSITION}/ft_build.sh  ${MY_POSITION}/../freetype-2.3.9/
cd ${MY_POSITION}/../freetype-2.3.9/
./ft_build.sh
if [ $? != 0 ] ; then
	echo "configure failed!!!!"
	exit 1
fi

make clean;make distclean
rm ft_build.sh
cd $MY_POSITION

#build expat
cp ${MY_POSITION}/expat_build.sh  ${MY_POSITION}/../expat-2.0.1/
cd ${MY_POSITION}/../expat-2.0.1/
./expat_build.sh
if [ $? != 0 ] ; then
	echo "configure failed!!!!"
	exit 1
fi

make clean;make distclean
rm expat_build.sh
cd $MY_POSITION

#build libxml2
cp ${MY_POSITION}/libxml2_build.sh ${MY_POSITION}/../libxml2-2.7.4/
cd ${MY_POSITION}/../libxml2-2.7.4/
./libxml2_build.sh
if [ $? != 0 ] ; then
	echo "configure failed!!!!"
	exit 1
fi

make clean;make distclean
rm libxml2_build.sh
cd $MY_POSITION

#build ncurses
cp ${MY_POSITION}/ncurses_build.sh ${MY_POSITION}/../ncurses-5.7/
cd ${MY_POSITION}/../ncurses-5.7/
./ncurses_build.sh
if [ $? != 0 ] ; then
	echo "configure failed!!!!"
	exit 1
fi

make clean;make distclean
rm ncurses_build.sh
cd $MY_POSITION

#build curl
cp ${MY_POSITION}/curl_build.sh ${MY_POSITION}/../curl-7.19.7/
cd ${MY_POSITION}/../curl-7.19.7/
./curl_build.sh
if [ $? != 0 ] ; then
	echo "configure failed!!!!"
	exit 1
fi

make clean;make distclean
rm curl_build.sh
cd $MY_POSITION

#remove all la file .
cd ${MY_POSITION}/../
find -name *.la -delete

#build fontconfig
cp ${MY_POSITION}/fontcfg_build.sh ${MY_POSITION}/../fontconfig-2.8.0/
cd ${MY_POSITION}/../fontconfig-2.8.0/
./fontcfg_build.sh
if [ $? != 0 ] ; then
	echo "configure failed!!!!"
	exit 1
fi

make clean;make distclean
rm fontcfg_build.sh
cd $MY_POSITION

#remove all la file .
cd ${MY_POSITION}/../
find -name *.la -delete

#build gd
cp ${MY_POSITION}/gd_build.sh ${MY_POSITION}/../gd-2.0.35/
cd ${MY_POSITION}/../gd-2.0.35/
./gd_build.sh
if [ $? != 0 ] ; then
	echo "configure failed!!!!"
	exit 1
fi

make clean;make distclean
rm gd_build.sh
cd $MY_POSITION

#build libmcrypt
cp ${MY_POSITION}/libmcrypt_build.sh ${MY_POSITION}/../libmcrypt-2.5.8/
cd ${MY_POSITION}/../libmcrypt-2.5.8/
./libmcrypt_build.sh
if [ $? != 0 ] ; then
	echo "configure failed!!!!"
	exit 1
fi

make clean;make distclean
rm libmcrypt_build.sh
cd $MY_POSITION

#build mhash
cp ${MY_POSITION}/mhash_build.sh ${MY_POSITION}/../mhash-0.9.9.9/
cd ${MY_POSITION}/../mhash-0.9.9.9/
./mhash_build.sh
if [ $? != 0 ] ; then
	echo "configure failed!!!!"
	exit 1
fi

make clean;make distclean
rm mhash_build.sh
cd $MY_POSITION

#build mcrypt
cp ${MY_POSITION}/mcrypt_build.sh ${MY_POSITION}/../mcrypt-2.6.8/
cd ${MY_POSITION}/../mcrypt-2.6.8/
./mcrypt_build.sh
if [ $? != 0 ] ; then
	echo "configure failed!!!!"
	exit 1
fi

make clean;make distclean
rm mcrypt_build.sh
cd $MY_POSITION

cd ${MY_POSITION}/../
find -name *.la -delete

