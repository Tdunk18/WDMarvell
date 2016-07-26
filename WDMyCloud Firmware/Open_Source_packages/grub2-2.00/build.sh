#!/bin/sh
#! /bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS


source ../xcp.sh

xbuild()
{
    mkdir ${PWD}/_xinstall
	AR=${CROSS_COMPILE}ar AS=${CROSS_COMPILE}as LD=${CROSS_COMPILE}ld NM=${CROSS_COMPILE}nm CC=${CROSS_COMPILE}gcc GCC=${CROSS_COMPILE}gcc CPP=${CROSS_COMPILE}cpp CXX=${CROSS_COMPILE}g++ FC=${CROSS_COMPILE}gfortran RANLIB=${CROSS_COMPILE}ranlib READELF=${CROSS_COMPILE}readelf STRIP=${CROSS_COMPILE}strip OBJCOPY=${CROSS_COMPILE}objcopy OBJDUMP=${CROSS_COMPILE}objdump AR_FOR_BUILD="ar" AS_FOR_BUILD="as" CC_FOR_BUILD="gcc" GCC_FOR_BUILD="gcc" CXX_FOR_BUILD="g++" FC_FOR_BUILD="ld" LD_FOR_BUILD="ld" CPPFLAGS_FOR_BUILD="-I${PWD}/_xinstall/output/host/usr/include" CFLAGS_FOR_BUILD="-O2 -I${PWD}/_xinstall/output/host/usr/include" CXXFLAGS_FOR_BUILD="-O2 -I${PWD}/_xinstall/output/host/usr/include" LDFLAGS_FOR_BUILD="-L${PWD}/_xinstall/output/host/lib -L${PWD}/_xinstall/output/host/usr/lib -Wl,-rpath,${PWD}/_xinstall/output/host/usr/lib" FCFLAGS_FOR_BUILD="" DEFAULT_ASSEMBLER=${CROSS_COMPILE}as DEFAULT_LINKER=${CROSS_COMPILE}ld CPPFLAGS="-D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -D_FILE_OFFSET_BITS=64" CFLAGS="-D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -D_FILE_OFFSET_BITS=64  -pipe -Os " CXXFLAGS="-D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -D_FILE_OFFSET_BITS=64  -pipe -Os " LDFLAGS="" FCFLAGS="" PKG_CONFIG="${PWD}/_xinstall/output/host/usr/bin/pkg-config" STAGING_DIR="${PWD}/_xinstall/output/host/usr/x86_64-buildroot-linux-gnu/sysroot" ac_cv_lbl_unaligned_fail=no ac_cv_func_mmap_fixed_mapped=yes ac_cv_func_memcmp_working=yes ac_cv_have_decl_malloc=yes gl_cv_func_malloc_0_nonnull=yes ac_cv_func_malloc_0_nonnull=yes ac_cv_func_calloc_0_nonnull=yes ac_cv_func_realloc_0_nonnull=yes lt_cv_sys_lib_search_path_spec="" ac_cv_c_bigendian=no AR="ar" AS="as" LD="ld" NM="nm" CC="gcc" GCC="gcc" CXX="g++" CPP="cpp" OBJCOPY="objcopy" RANLIB="ranlib" CPPFLAGS="-I${PWD}/_xinstall/output/host/usr/include" CFLAGS="-O2 -I./xbuild/output/host/usr/include" CXXFLAGS="-O2 -I${PWD}/_xinstall/output/host/usr/include" LDFLAGS="-L./xbuild/output/host/lib -L./xbuild/output/host/usr/lib -Wl,-rpath,${PWD}/_xinstall/output/host/usr/lib" PKG_CONFIG_ALLOW_SYSTEM_CFLAGS=1 PKG_CONFIG_ALLOW_SYSTEM_LIBS=1 PKG_CONFIG="${PWD}/_xinstall/output/host/usr/bin/pkg-config" PKG_CONFIG_SYSROOT_DIR="${PWD}/_xinstall/sysroot" PKG_CONFIG_LIBDIR="./xbuild/output/host/usr/lib/pkgconfig:${PWD}/_xinstall/output/host/usr/share/pkgconfig" LD_LIBRARY_PATH="${PWD}/_xinstall/output/host/usr/lib:" CPP="gcc -E" TARGET_CC=${CROSS_COMPILE}gcc TARGET_CFLAGS="-D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -D_FILE_OFFSET_BITS=64  -pipe -Os " TARGET_CPPFLAGS="-D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -D_FILE_OFFSET_BITS=64" ./configure --target=x86_64-buildroot-linux-gnu --host=x86_64-buildroot-linux-gnu --build=i686-pc-linux-gnu --prefix=/usr --exec-prefix=/usr --sysconfdir=/etc --program-prefix="" --disable-gtk-doc --disable-doc --disable-docs --disable-documentation --with-xmlto=no --with-fop=no   --enable-ipv6 --enable-static --enable-shared  --target=x86_64 --with-platform=efi --disable-grub-mkfont --enable-efiemu=no --enable-liblzma=no --enable-device-mapper=no --enable-libzfs=no --disable-werror
	make -j3
}


xinstall()
{
	mkdir -p ${PWD}/_xinstall/output/images/efi-part/EFI/BOOT/
	make -j3 DESTDIR=${PWD}/_xinstall/output/host install
	${PWD}/_xinstall/output/host/usr/bin/grub-mkimage -d ${PWD}/_xinstall/output/host/usr/lib/grub/x86_64-efi -O x86_64-efi -o ${PWD}/_xinstall/output/images/efi-part/EFI/BOOT/bootx64.efi -p /EFI/BOOT  boot linux ext2 fat part_msdos part_gpt normal efi_gop search serial
	cp -avf ./grub.cfg.alpha.sample $ROOTDIR/merge/$PROJECT_NAME/grub/EFI/BOOT/grub.cfg
    cp -avf ${PWD}/_xinstall/output/images/efi-part/EFI/BOOT/bootx64.efi $ROOTDIR/merge/$PROJECT_NAME/grub/EFI/BOOT/
	echo bootx64.efi > $ROOTDIR/merge/$PROJECT_NAME/grub/startup.nsh	
}

xclean()
{
    make clean
	rm -rf ${PWD}/_xinstall
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

