make distclean
rm -rf autom4te.cache/
git checkout config.h.in config.h.in~ configure
rm -rf tmp_install
rm -rf ../tmp_install
(cd `pwd`/../$OPENSSL_FOLDER_NAME ; sh xbuild.sh clean )
(cd `pwd`/../zlib-1.2.3 ; make clean ; make distclean )
