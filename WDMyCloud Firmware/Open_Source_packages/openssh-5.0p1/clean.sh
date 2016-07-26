make clean
rm -rf tmp_install
rm -rf ../tmp_install
(cd `pwd`/../zlib-1.2.3 ; sh xbuild.sh clean )
(cd `pwd`/../$OPENSSL_FOLDER_NAME ; sh xbuild.sh clean )
