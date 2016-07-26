#!/bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

source ../xcp.sh

echo toolchain: source.me.d/LIGHTNING-4A-sddnd.rc

xbuild()
{
	make clean ; make distclean

#	XINST_DIR=$(readlink -f $PWD/xinst)
	XINST_DIR=$PWD/../_xinstall/${PROJECT_NAME}

	#autoreconf -v -f -i

#-	./configure --prefix=/ --libdir=/usr/lib --host=arm-linux \

	./configure --prefix=${XINST_DIR} --host=arm-linux \
		CFLAGS="-I${XINST_DIR}/include ${CFLAGS} -I$(readlink -f ../libiconv-1.9.2/include)" \
		LDFLAGS="-L${XINST_DIR}/lib -s -L$(readlink -f ../libiconv-1.9.2/lib/.libs) -liconv" \
		PKG_CONFIG_PATH=${XINST_DIR}/lib/pkgconfig \
		LIBFFI_CFLAGS="-I$(readlink -f ../libffi-3.0.13/arm-gnu-linux-gnu/include)" \
		LIBFFI_LIBS="-L$(readlink -f ../libffi-3.0.13/arm-gnu-linux-gnu/.libs) -lffi" \
		ZLIB_CFLAGS="-I$(readlink -f ../zlib-1.2.3)" \
		ZLIB_LIBS="-L$(readlink -f ../zlib-1.2.3) -lz" \
		--with-pcre=internal \
		--with-threads=posix --disable-dtrace --disable-systemtap \
		--with-libiconv=gnu \
		--disable-gtk-doc --disable-gtk-doc-html --disable-gtk-doc-pdf --disable-man \
		ac_cv_func_posix_getpwuid_r=yes glib_cv_stack_grows=no \
		glib_cv_uscore=no ac_cv_func_strtod=yes \
		ac_fsusage_space=yes fu_cv_sys_stat_statfs2_bsize=yes \
		ac_cv_func_closedir_void=no ac_cv_func_getloadavg=no \
		ac_cv_lib_util_getloadavg=no ac_cv_lib_getloadavg_getloadavg=no \
		ac_cv_func_getgroups=yes ac_cv_func_getgroups_works=yes \
		ac_cv_func_chown_works=yes ac_cv_have_decl_euidaccess=no \
		ac_cv_func_euidaccess=no ac_cv_have_decl_strnlen=yes \
		ac_cv_func_strnlen_working=yes \
		ac_cv_func_lstat_dereferences_slashed_symlink=yes \
		ac_cv_func_lstat_empty_string_bug=no ac_cv_func_stat_empty_string_bug=no \
		vb_cv_func_rename_trailing_slash_bug=no ac_cv_have_decl_nanosleep=yes \
		jm_cv_func_nanosleep_works=yes gl_cv_func_working_utimes=yes \
		ac_cv_func_utime_null=yes ac_cv_have_decl_strerror_r=yes \
		ac_cv_func_strerror_r_char_p=no jm_cv_func_svid_putenv=yes \
		ac_cv_func_getcwd_null=yes ac_cv_func_getdelim=yes \
		ac_cv_func_mkstemp=yes utils_cv_func_mkstemp_limitations=no \
		utils_cv_func_mkdir_trailing_slash_bug=no \
		jm_cv_func_gettimeofday_clobber=no \
		gl_cv_func_working_readdir=yes jm_ac_cv_func_link_follows_symlink=no \
		utils_cv_localtime_cache=no ac_cv_struct_st_mtim_nsec=no \
		gl_cv_func_tzset_clobber=no gl_cv_func_getcwd_null=yes \
		gl_cv_func_getcwd_path_max=yes ac_cv_func_fnmatch_gnu=yes \
		am_getline_needs_run_time_check=no am_cv_func_working_getline=yes \
		gl_cv_func_mkdir_trailing_slash_bug=no gl_cv_func_mkstemp_limitations=no \
		ac_cv_func_working_mktime=yes jm_cv_func_working_re_compile_pattern=yes \
		ac_use_included_regex=no gl_cv_c_restrict=no \
		ac_cv_path_GLIB_GENMARSHAL=/usr/bin/glib-genmarshal ac_cv_prog_F77=no \
		ac_cv_func_posix_getgrgid_r=no \
		gt_cv_c_wchar_t=yes


	# Don't even try to get in 'doc'
	sed -ie 's/SUBDIRS = . m4macros glib gmodule gthread gobject gio po docs/SUBDIRS = . m4macros glib gmodule gthread gobject gio po/g' Makefile

	make
#-	make DESTDIR=$PWD/xinst install
	make install
}


xinstall()
{
	${CROSS_COMPILE}strip -s glib/.libs/libglib-2.0.so.0
	xcp glib/.libs/libglib-2.0.so.0 ${ROOT_FS}/lib
	ls -l ${ROOT_FS}/lib/libglib-2.0.so.0
}

xclean()
{
	make clean
	make distclean
}

if [ "$1" = "build" ]; then
	xbuild
elif [ "$1" = "install" ]; then
	xinstall
elif [ "$1" = "clean" ]; then
	xclean
else
	echo "Usage : xbuild.sh {build | install | clean}"
fi

