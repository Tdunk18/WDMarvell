# $OpenLDAP$
## This work is part of OpenLDAP Software <http://www.openldap.org/>.
##
## Copyright 1998-2014 The OpenLDAP Foundation.
## All rights reserved.
##
## Redistribution and use in source and binary forms, with or without
## modification, are permitted only as authorized by the OpenLDAP
## Public License.
##
## A copy of this license is available in the file LICENSE in the
## top-level directory of the distribution or, alternatively, at
##---------------------------------------------------------------------------
#
# Top-level Makefile template
#

PACKAGE= OpenLDAP
VERSION= 2.4.39
RELEASEDATE= 2014/01/26


SHELL = /bin/sh

top_builddir = ../../..

srcdir = .
top_srcdir = ../../..

prefix = /home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A
exec_prefix = ${prefix}
ldap_subdir = /openldap

bindir = ${exec_prefix}/bin
datarootdir = ${prefix}/share
datadir = ${datarootdir}$(ldap_subdir)
includedir = ${prefix}/include
infodir = ${datarootdir}/info
libdir = ${exec_prefix}/lib
libexecdir = ${exec_prefix}/libexec
localstatedir = ${prefix}/var
mandir = ${datarootdir}/man
moduledir = ${exec_prefix}/libexec$(ldap_subdir)
sbindir = ${exec_prefix}/sbin
sharedstatedir = ${prefix}/com
sysconfdir = /etc$(ldap_subdir)
schemadir = $(sysconfdir)/schema

PLAT = UNIX
EXEEXT = 
OBJEXT = o

BUILD_LIBS_DYNAMIC = static

SHTOOL = $(top_srcdir)/build/shtool

INSTALL = $(SHTOOL) install -c
INSTALL_PROGRAM = $(INSTALL)
INSTALL_DATA = $(INSTALL) -m 644
INSTALL_SCRIPT = $(INSTALL)

STRIP = -s

LINT = lint
5LINT = 5lint

MKDEP = $(top_srcdir)/build/mkdep $(MKDEPFLAG) \
	-d "$(srcdir)" -c "$(MKDEP_CC)" -m "$(MKDEP_CFLAGS)"
MKDEP_CC	= arm-mv5sft-linux-gnueabi-gcc
MKDEP_CFLAGS = -M

MKVERSION = $(top_srcdir)/build/mkversion -v "$(VERSION)"

LIBTOOL = $(SHELL) $(top_builddir)/libtool
LIBRELEASE = 2.4
LIBVERSION = 12:2:10
LTVERSION = -release $(LIBRELEASE) -version-info $(LIBVERSION)

# libtool --only flag for libraries: platform specific
NT_LTONLY_LIB = # --only-$(BUILD_LIBS_DYNAMIC)
LTONLY_LIB = $(UNIX_LTONLY_LIB)

# libtool --only flag for modules: depends on linkage of module
# The BUILD_MOD macro is defined in each backend Makefile.in file
LTONLY_yes = --tag=disable-shared
LTONLY_mod = --tag=disable-static
LTONLY_MOD = $(LTONLY_$(BUILD_MOD))

# platform-specific libtool flags
NT_LTFLAGS_LIB = -no-undefined -avoid-version -rpath $(libdir)
NT_LTFLAGS_MOD = -no-undefined -avoid-version -rpath $(moduledir)
UNIX_LTFLAGS_LIB = $(LTVERSION) -rpath $(libdir)
UNIX_LTFLAGS_MOD = $(LTVERSION) -rpath $(moduledir)

# libtool flags
LTFLAGS     = $(UNIX_LTFLAGS)
LTFLAGS_LIB = $(UNIX_LTFLAGS_LIB)
LTFLAGS_MOD = $(UNIX_LTFLAGS_MOD)

# LIB_DEFS defined in liblber and libldap Makefile.in files.
# MOD_DEFS defined in backend Makefile.in files.

# platform-specific LINK_LIBS defined in various Makefile.in files.
# LINK_LIBS referenced in library and module link commands.
LINK_LIBS = $(MOD_LIBS) $(UNIX_LINK_LIBS)

LTSTATIC = -static

LTLINK   = $(LIBTOOL) --mode=link \
	$(CC) $(LTSTATIC) $(LT_CFLAGS) $(LDFLAGS) $(LTFLAGS)

LTCOMPILE_LIB = $(LIBTOOL) $(LTONLY_LIB) --mode=compile \
	$(CC) $(LT_CFLAGS) $(LT_CPPFLAGS) $(LIB_DEFS) -c

LTLINK_LIB = $(LIBTOOL) $(LTONLY_LIB) --mode=link \
	$(CC) $(LT_CFLAGS) $(LDFLAGS) $(LTFLAGS_LIB)

LTCOMPILE_MOD = $(LIBTOOL) $(LTONLY_MOD) --mode=compile \
	$(CC) $(LT_CFLAGS) $(LT_CPPFLAGS) $(MOD_DEFS) -c

LTLINK_MOD = $(LIBTOOL) $(LTONLY_MOD) --mode=link \
	$(CC) $(LT_CFLAGS) $(LDFLAGS) $(LTFLAGS_MOD)

LTINSTALL = $(LIBTOOL) --mode=install $(INSTALL) 
LTFINISH = $(LIBTOOL) --mode=finish

# Misc UNIX commands used in build environment
AR = arm-mv5sft-linux-gnueabi-ar
BASENAME = basename
CAT = cat
CHMOD = chmod
DATE = date
ECHO = $(SHTOOL) echo
HOSTNAME = $(SHTOOL) echo -e "%h%d"
LN = $(SHTOOL) mkln
LN_H = $(LN)
LN_S = $(LN) -s
MAKEINFO = ${SHELL} /home/ben/wdic-gpl/openldap-2.4.39/build/missing --run makeinfo
MKDIR = $(SHTOOL) mkdir -p
MV = $(SHTOOL) move
PWD = pwd
RANLIB = arm-mv5sft-linux-gnueabi-ranlib
RM = rm -f
SED = sed
SUBST = $(SHTOOL) subst

# For manual pages
# MANCOMPRESS=@MANCOMPRESS@
# MANCOMPRESSSUFFIX=@MANCOMPRESSSUFFIX@
MANCOMPRESS=$(CAT)
MANCOMPRESSSUFFIX=

SOELIM=soelim

INCLUDEDIR= $(top_srcdir)/include
LDAP_INCPATH= -I$(LDAP_INCDIR) -I$(INCLUDEDIR)
LDAP_LIBDIR= $(top_builddir)/libraries

LUTIL_LIBS = 
LTHREAD_LIBS =  -pthread

BDB_LIBS =  -ldb-4.7
SLAPD_NDB_LIBS = 

LDAP_LIBLBER_LA = $(LDAP_LIBDIR)/liblber/liblber.la
LDAP_LIBLDAP_LA = $(LDAP_LIBDIR)/libldap/libldap.la
LDAP_LIBLDAP_R_LA = $(LDAP_LIBDIR)/libldap_r/libldap_r.la

LDAP_LIBREWRITE_A = $(LDAP_LIBDIR)/librewrite/librewrite.a
LDAP_LIBLUNICODE_A = $(LDAP_LIBDIR)/liblunicode/liblunicode.a
LDAP_LIBLUTIL_A = $(LDAP_LIBDIR)/liblutil/liblutil.a

LDAP_L = $(LDAP_LIBLUTIL_A) \
	$(LDAP_LIBLDAP_LA) $(LDAP_LIBLBER_LA)
SLAPD_L = $(LDAP_LIBLUNICODE_A) $(LDAP_LIBREWRITE_A) \
	$(LDAP_LIBLUTIL_A) $(LDAP_LIBLDAP_R_LA) $(LDAP_LIBLBER_LA)

WRAP_LIBS = 
# AutoConfig generated 
AC_CC	= arm-mv5sft-linux-gnueabi-gcc
AC_CFLAGS =  -I/home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A/include
AC_DEFS =  -I/home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A/include -I/home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A/include # -DHAVE_CONFIG_H
AC_LDFLAGS =  -L/home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A/lib
AC_LIBS = -lresolv 

KRB4_LIBS = 
KRB5_LIBS = 
KRB_LIBS =  
SASL_LIBS = 
TLS_LIBS = -lssl -lcrypto
AUTH_LIBS = 
SECURITY_LIBS = $(SASL_LIBS) $(KRB_LIBS) $(TLS_LIBS) $(AUTH_LIBS)
ICU_LIBS = 

MODULES_CPPFLAGS = 
MODULES_LDFLAGS = 
MODULES_LIBS = 
SLAPD_PERL_LDFLAGS = 

SLAPD_SQL_LDFLAGS = 
SLAPD_SQL_INCLUDES = 
SLAPD_SQL_LIBS = 

SLAPD_LIBS =  -luuid $(BDB_LIBS)      $(ICU_LIBS)

# Our Defaults
CC = $(AC_CC)
DEFS = $(LDAP_INCPATH) $(XINCPATH) $(XDEFS) $(AC_DEFS) $(DEFINES)
CFLAGS = $(AC_CFLAGS) $(DEFS)
LDFLAGS = $(LDAP_LIBPATH) $(AC_LDFLAGS) $(XLDFLAGS)
LIBS = $(XLIBS) $(XXLIBS) $(AC_LIBS) $(XXXLIBS)

LT_CFLAGS = $(AC_CFLAGS)
LT_CPPFLAGS = $(DEFS)

all:		all-common all-local FORCE
install:	install-common install-local FORCE
clean:		clean-common clean-local FORCE
veryclean:	veryclean-common veryclean-local FORCE
depend:		depend-common depend-local FORCE

# empty common rules
all-common:
install-common:
clean-common:
veryclean-common:	clean-common FORCE
depend-common:
lint-common:
lint5-common:

# empty local rules
all-local:
install-local:
clean-local:
veryclean-local:	clean-local FORCE
depend-local:
lint-local:
lint5-local:

veryclean: FORCE
	$(RM) Makefile
	$(RM) -r .libs

Makefile: Makefile.in $(top_srcdir)/build/top.mk

pathtest:
	$(SHTOOL) --version

# empty rule for forcing rules
FORCE:

##---------------------------------------------------------------------------

# Makefile.in for back-mdb
# $OpenLDAP$
## This work is part of OpenLDAP Software <http://www.openldap.org/>.
##
## Copyright 2011-2014 The OpenLDAP Foundation.
## All rights reserved.
##
## Redistribution and use in source and binary forms, with or without
## modification, are permitted only as authorized by the OpenLDAP
## Public License.
##
## A copy of this license is available in the file LICENSE in the
## top-level directory of the distribution or, alternatively, at
## <http://www.OpenLDAP.org/license.html>.

SRCS = init.c tools.c config.c \
	add.c bind.c compare.c delete.c modify.c modrdn.c search.c \
	extended.c operational.c \
	attr.c index.c key.c filterindex.c \
	dn2entry.c dn2id.c id2entry.c idl.c \
	nextid.c monitor.c

OBJS = init.lo tools.lo config.lo \
	add.lo bind.lo compare.lo delete.lo modify.lo modrdn.lo search.lo \
	extended.lo operational.lo \
	attr.lo index.lo key.lo filterindex.lo \
	dn2entry.lo dn2id.lo id2entry.lo idl.lo \
	nextid.lo monitor.lo mdb.lo midl.lo

LDAP_INCDIR= ../../../include       
LDAP_LIBDIR= ../../../libraries
MDB_SUBDIR = $(srcdir)/$(LDAP_LIBDIR)/liblmdb

BUILD_OPT = "--enable-mdb"
BUILD_MOD = yes

mod_DEFS = -DSLAPD_IMPORT
MOD_DEFS = $(yes_DEFS)
MOD_LIBS = $(MDB_LIBS)

shared_LDAP_LIBS = $(LDAP_LIBLDAP_R_LA) $(LDAP_LIBLBER_LA)
NT_LINK_LIBS = -L.. -lslapd $(static_LDAP_LIBS)
UNIX_LINK_LIBS = $(static_LDAP_LIBS)

LIBBASE = back_mdb

XINCPATH = -I.. -I$(srcdir)/.. -I$(MDB_SUBDIR)
XDEFS = $(MODULES_CPPFLAGS)

all-local-lib:	../.backend

../.backend: lib$(LIBBASE).a
	@touch $@

mdb.lo:	$(MDB_SUBDIR)/mdb.c
	$(LTCOMPILE_MOD) $(MDB_SUBDIR)/mdb.c

midl.lo:	$(MDB_SUBDIR)/midl.c
	$(LTCOMPILE_MOD) $(MDB_SUBDIR)/midl.c

veryclean-local-lib: FORCE
	$(RM) $(XXHEADERS) $(XXSRCS) .links
# $OpenLDAP$
## This work is part of OpenLDAP Software <http://www.openldap.org/>.
##
## Copyright 1998-2014 The OpenLDAP Foundation.
## All rights reserved.
##
## Redistribution and use in source and binary forms, with or without
## modification, are permitted only as authorized by the OpenLDAP
## Public License.
##
## A copy of this license is available in the file LICENSE in the
## top-level directory of the distribution or, alternatively, at
## <http://www.OpenLDAP.org/license.html>.
##---------------------------------------------------------------------------
#
# Makefile Template for Server Modules
#

LIBRARY = $(LIBBASE).la
LIBSTAT = lib$(LIBBASE).a

MKDEPFLAG = -l

.SUFFIXES: .c .o .lo

.c.lo:
	$(LTCOMPILE_MOD) $<

all-no lint-no 5lint-no depend-no install-no: FORCE
	@echo "run configure with $(BUILD_OPT) to make $(LIBBASE)"

all-common: all-$(BUILD_MOD)

version.c: Makefile
	$(RM) $@
	$(MKVERSION) $(LIBBASE) > $@

version.lo: version.c $(OBJS)

$(LIBRARY): version.lo
	$(LTLINK_MOD) -module -o $@ $(OBJS) version.lo $(LINK_LIBS)

$(LIBSTAT): version.lo
	$(AR) ruv $@ `echo $(OBJS) | sed 's/\.lo/.o/g'` version.o
	@$(RANLIB) $@

clean-common: clean-lib FORCE
veryclean-common: veryclean-lib FORCE


lint-common: lint-$(BUILD_MOD)

5lint-common: 5lint-$(BUILD_MOD)

depend-common: depend-$(BUILD_MOD)

install-common: install-$(BUILD_MOD)

all-local-mod:
all-mod: $(LIBRARY) all-local-mod FORCE

all-local-lib:
all-yes: $(LIBSTAT) all-local-lib FORCE

install-mod: $(LIBRARY)
	@-$(MKDIR) $(DESTDIR)$(moduledir)
	$(LTINSTALL) $(INSTALLFLAGS) -m 755 $(LIBRARY) $(DESTDIR)$(moduledir)

install-local-lib:
install-yes: install-local-lib FORCE

lint-local-lib:
lint-yes lint-mod: lint-local-lib FORCE
	$(LINT) $(DEFS) $(DEFINES) $(SRCS)

5lint-local-lib:
5lint-yes 5lint-mod: 5lint-local-lib FORCE
	$(5LINT) $(DEFS) $(DEFINES) $(SRCS)

clean-local-lib:
clean-lib: 	clean-local-lib FORCE
	$(RM) $(LIBRARY) $(LIBSTAT) version.c *.o *.lo a.out core .libs/*

depend-local-lib:
depend-yes depend-mod: depend-local-lib FORCE
	$(MKDEP) $(DEFS) $(DEFINES) $(SRCS)

veryclean-local-lib:
veryclean-lib: 	clean-lib veryclean-local-lib

Makefile: $(top_srcdir)/build/mod.mk

# DO NOT DELETE THIS LINE -- mkdep uses it.
# DO NOT PUT ANYTHING AFTER THIS LINE, IT WILL GO AWAY.


#
# files: -I../../../include -I../../../include -I.. -I./.. -I./../../../libraries/liblmdb -I/home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A/include -I/home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A/include init.c tools.c config.c add.c bind.c compare.c delete.c modify.c modrdn.c search.c extended.c operational.c attr.c index.c key.c filterindex.c dn2entry.c dn2id.c id2entry.c idl.c nextid.c monitor.c
# command: arm-mv5sft-linux-gnueabi-gcc -M -I.  -I../../../include -I../../../include -I.. -I./.. -I./../../../libraries/liblmdb -I/home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A/include -I/home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A/include init.c tools.c config.c add.c bind.c compare.c delete.c modify.c modrdn.c search.c extended.c operational.c attr.c index.c key.c filterindex.c dn2entry.c dn2id.c id2entry.c idl.c nextid.c monitor.c
#

init.lo: init.c
init.lo: ../../../include/portable.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
init.lo: ../../../include/ac/fdset.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
init.lo: ../../../include/ldap_cdefs.h
init.lo: ../../../include/ldap_features.h
init.lo: ../../../include/ac/assert.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
init.lo: ../../../include/ac/localize.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
init.lo: ../../../include/ac/string.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
init.lo: ../../../include/ac/unistd.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
init.lo: ../../../include/lutil_lockf.h
init.lo: ../../../include/ac/stdlib.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
init.lo: ../../../include/ac/errno.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/errno.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/errno.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/errno.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/errno.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/errno.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/errno-base.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/stat.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stat.h
init.lo: back-mdb.h
init.lo: ../slap.h
init.lo: ../../../include/ldap_defaults.h
init.lo: ../../../include/ldap_config.h
init.lo: ../../../include/ac/syslog.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
init.lo: ../../../include/ac/regex.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
init.lo: ../../../include/ac/signal.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
init.lo: ../../../include/ac/socket.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
init.lo: ../../../include/ac/time.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
init.lo: ../../../include/ac/param.h
init.lo: ../../../include/avl.h
init.lo: ../../../include/ldap_cdefs.h
init.lo: ../../../include/ldap_log.h
init.lo: ../../../include/ldap.h
init.lo: ../../../include/lber.h
init.lo: ../../../include/lber_types.h
init.lo: ../../../include/ldap_features.h
init.lo: ../../../include/ldap_schema.h
init.lo: ../../../include/lber_pvt.h
init.lo: ../../../include/ldap_pvt.h
init.lo: ../../../include/ldap_pvt_uc.h
init.lo: ../../../include/ac/bytes.h
init.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
init.lo: ../../../include/ldap_pvt_thread.h
init.lo: ../../../include/ldap_int_thread.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
init.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
init.lo: ../../../include/ldap_queue.h
init.lo: ../proto-slap.h
init.lo: ../../../libraries/liblmdb/lmdb.h
init.lo: proto-mdb.h
init.lo: ../../../include/lutil.h
init.lo: ../../../include/ldap_rq.h
init.lo: ../config.h
tools.lo: tools.c
tools.lo: ../../../include/portable.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
tools.lo: ../../../include/ac/fdset.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
tools.lo: ../../../include/ldap_cdefs.h
tools.lo: ../../../include/ldap_features.h
tools.lo: ../../../include/ac/assert.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
tools.lo: ../../../include/ac/localize.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
tools.lo: ../../../include/ac/string.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
tools.lo: ../../../include/ac/errno.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/errno.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/errno.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/errno.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/errno.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/errno.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/errno-base.h
tools.lo: back-mdb.h
tools.lo: ../slap.h
tools.lo: ../../../include/ldap_defaults.h
tools.lo: ../../../include/ldap_config.h
tools.lo: ../../../include/ac/stdlib.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
tools.lo: ../../../include/ac/syslog.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
tools.lo: ../../../include/ac/regex.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
tools.lo: ../../../include/ac/signal.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
tools.lo: ../../../include/ac/socket.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
tools.lo: ../../../include/ac/time.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
tools.lo: ../../../include/ac/param.h
tools.lo: ../../../include/ac/unistd.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
tools.lo: ../../../include/lutil_lockf.h
tools.lo: ../../../include/avl.h
tools.lo: ../../../include/ldap_cdefs.h
tools.lo: ../../../include/ldap_log.h
tools.lo: ../../../include/ldap.h
tools.lo: ../../../include/lber.h
tools.lo: ../../../include/lber_types.h
tools.lo: ../../../include/ldap_features.h
tools.lo: ../../../include/ldap_schema.h
tools.lo: ../../../include/lber_pvt.h
tools.lo: ../../../include/ldap_pvt.h
tools.lo: ../../../include/ldap_pvt_uc.h
tools.lo: ../../../include/ac/bytes.h
tools.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
tools.lo: ../../../include/ldap_pvt_thread.h
tools.lo: ../../../include/ldap_int_thread.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
tools.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
tools.lo: ../../../include/ldap_queue.h
tools.lo: ../proto-slap.h
tools.lo: ../../../libraries/liblmdb/lmdb.h
tools.lo: proto-mdb.h
tools.lo: idl.h
tools.lo: ../../../include/lutil_meter.h
tools.lo: ../../../include/portable.h
config.lo: config.c
config.lo: ../../../include/portable.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
config.lo: ../../../include/ac/fdset.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
config.lo: ../../../include/ldap_cdefs.h
config.lo: ../../../include/ldap_features.h
config.lo: ../../../include/ac/assert.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
config.lo: ../../../include/ac/localize.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
config.lo: ../../../include/ac/ctype.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/ctype.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
config.lo: ../../../include/ac/string.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
config.lo: ../../../include/ac/errno.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/errno.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/errno.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/errno.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/errno.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/errno.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/errno-base.h
config.lo: back-mdb.h
config.lo: ../slap.h
config.lo: ../../../include/ldap_defaults.h
config.lo: ../../../include/ldap_config.h
config.lo: ../../../include/ac/stdlib.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
config.lo: ../../../include/ac/syslog.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
config.lo: ../../../include/ac/regex.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
config.lo: ../../../include/ac/signal.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
config.lo: ../../../include/ac/socket.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
config.lo: ../../../include/ac/time.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
config.lo: ../../../include/ac/param.h
config.lo: ../../../include/ac/unistd.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
config.lo: ../../../include/lutil_lockf.h
config.lo: ../../../include/avl.h
config.lo: ../../../include/ldap_cdefs.h
config.lo: ../../../include/ldap_log.h
config.lo: ../../../include/ldap.h
config.lo: ../../../include/lber.h
config.lo: ../../../include/lber_types.h
config.lo: ../../../include/ldap_features.h
config.lo: ../../../include/ldap_schema.h
config.lo: ../../../include/lber_pvt.h
config.lo: ../../../include/ldap_pvt.h
config.lo: ../../../include/ldap_pvt_uc.h
config.lo: ../../../include/ac/bytes.h
config.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
config.lo: ../../../include/ldap_pvt_thread.h
config.lo: ../../../include/ldap_int_thread.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
config.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
config.lo: ../../../include/ldap_queue.h
config.lo: ../proto-slap.h
config.lo: ../../../libraries/liblmdb/lmdb.h
config.lo: proto-mdb.h
config.lo: ../config.h
config.lo: ../../../include/lutil.h
config.lo: ../../../include/ldap_rq.h
add.lo: add.c
add.lo: ../../../include/portable.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
add.lo: ../../../include/ac/fdset.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
add.lo: ../../../include/ldap_cdefs.h
add.lo: ../../../include/ldap_features.h
add.lo: ../../../include/ac/assert.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
add.lo: ../../../include/ac/localize.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
add.lo: ../../../include/ac/string.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
add.lo: back-mdb.h
add.lo: ../slap.h
add.lo: ../../../include/ldap_defaults.h
add.lo: ../../../include/ldap_config.h
add.lo: ../../../include/ac/stdlib.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
add.lo: ../../../include/ac/syslog.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
add.lo: ../../../include/ac/regex.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
add.lo: ../../../include/ac/signal.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
add.lo: ../../../include/ac/socket.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
add.lo: ../../../include/ac/time.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
add.lo: ../../../include/ac/param.h
add.lo: ../../../include/ac/unistd.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
add.lo: ../../../include/lutil_lockf.h
add.lo: ../../../include/avl.h
add.lo: ../../../include/ldap_cdefs.h
add.lo: ../../../include/ldap_log.h
add.lo: ../../../include/ldap.h
add.lo: ../../../include/lber.h
add.lo: ../../../include/lber_types.h
add.lo: ../../../include/ldap_features.h
add.lo: ../../../include/ldap_schema.h
add.lo: ../../../include/lber_pvt.h
add.lo: ../../../include/ldap_pvt.h
add.lo: ../../../include/ldap_pvt_uc.h
add.lo: ../../../include/ac/bytes.h
add.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
add.lo: ../../../include/ldap_pvt_thread.h
add.lo: ../../../include/ldap_int_thread.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
add.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
add.lo: ../../../include/ldap_queue.h
add.lo: ../proto-slap.h
add.lo: ../../../libraries/liblmdb/lmdb.h
add.lo: proto-mdb.h
bind.lo: bind.c
bind.lo: ../../../include/portable.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
bind.lo: ../../../include/ac/fdset.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
bind.lo: ../../../include/ldap_cdefs.h
bind.lo: ../../../include/ldap_features.h
bind.lo: ../../../include/ac/assert.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
bind.lo: ../../../include/ac/localize.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
bind.lo: ../../../include/ac/string.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
bind.lo: ../../../include/ac/unistd.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
bind.lo: ../../../include/lutil_lockf.h
bind.lo: back-mdb.h
bind.lo: ../slap.h
bind.lo: ../../../include/ldap_defaults.h
bind.lo: ../../../include/ldap_config.h
bind.lo: ../../../include/ac/stdlib.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
bind.lo: ../../../include/ac/syslog.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
bind.lo: ../../../include/ac/regex.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
bind.lo: ../../../include/ac/signal.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
bind.lo: ../../../include/ac/socket.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
bind.lo: ../../../include/ac/time.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
bind.lo: ../../../include/ac/param.h
bind.lo: ../../../include/avl.h
bind.lo: ../../../include/ldap_cdefs.h
bind.lo: ../../../include/ldap_log.h
bind.lo: ../../../include/ldap.h
bind.lo: ../../../include/lber.h
bind.lo: ../../../include/lber_types.h
bind.lo: ../../../include/ldap_features.h
bind.lo: ../../../include/ldap_schema.h
bind.lo: ../../../include/lber_pvt.h
bind.lo: ../../../include/ldap_pvt.h
bind.lo: ../../../include/ldap_pvt_uc.h
bind.lo: ../../../include/ac/bytes.h
bind.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
bind.lo: ../../../include/ldap_pvt_thread.h
bind.lo: ../../../include/ldap_int_thread.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
bind.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
bind.lo: ../../../include/ldap_queue.h
bind.lo: ../proto-slap.h
bind.lo: ../../../libraries/liblmdb/lmdb.h
bind.lo: proto-mdb.h
compare.lo: compare.c
compare.lo: ../../../include/portable.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
compare.lo: ../../../include/ac/fdset.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
compare.lo: ../../../include/ldap_cdefs.h
compare.lo: ../../../include/ldap_features.h
compare.lo: ../../../include/ac/assert.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
compare.lo: ../../../include/ac/localize.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
compare.lo: ../../../include/ac/string.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
compare.lo: back-mdb.h
compare.lo: ../slap.h
compare.lo: ../../../include/ldap_defaults.h
compare.lo: ../../../include/ldap_config.h
compare.lo: ../../../include/ac/stdlib.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
compare.lo: ../../../include/ac/syslog.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
compare.lo: ../../../include/ac/regex.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
compare.lo: ../../../include/ac/signal.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
compare.lo: ../../../include/ac/socket.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
compare.lo: ../../../include/ac/time.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
compare.lo: ../../../include/ac/param.h
compare.lo: ../../../include/ac/unistd.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
compare.lo: ../../../include/lutil_lockf.h
compare.lo: ../../../include/avl.h
compare.lo: ../../../include/ldap_cdefs.h
compare.lo: ../../../include/ldap_log.h
compare.lo: ../../../include/ldap.h
compare.lo: ../../../include/lber.h
compare.lo: ../../../include/lber_types.h
compare.lo: ../../../include/ldap_features.h
compare.lo: ../../../include/ldap_schema.h
compare.lo: ../../../include/lber_pvt.h
compare.lo: ../../../include/ldap_pvt.h
compare.lo: ../../../include/ldap_pvt_uc.h
compare.lo: ../../../include/ac/bytes.h
compare.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
compare.lo: ../../../include/ldap_pvt_thread.h
compare.lo: ../../../include/ldap_int_thread.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
compare.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
compare.lo: ../../../include/ldap_queue.h
compare.lo: ../proto-slap.h
compare.lo: ../../../libraries/liblmdb/lmdb.h
compare.lo: proto-mdb.h
delete.lo: delete.c
delete.lo: ../../../include/portable.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
delete.lo: ../../../include/ac/fdset.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
delete.lo: ../../../include/ldap_cdefs.h
delete.lo: ../../../include/ldap_features.h
delete.lo: ../../../include/ac/assert.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
delete.lo: ../../../include/ac/localize.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
delete.lo: ../../../include/ac/string.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
delete.lo: ../../../include/lutil.h
delete.lo: ../../../include/ldap_cdefs.h
delete.lo: ../../../include/lber_types.h
delete.lo: back-mdb.h
delete.lo: ../slap.h
delete.lo: ../../../include/ldap_defaults.h
delete.lo: ../../../include/ldap_config.h
delete.lo: ../../../include/ac/stdlib.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
delete.lo: ../../../include/ac/syslog.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
delete.lo: ../../../include/ac/regex.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
delete.lo: ../../../include/ac/signal.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
delete.lo: ../../../include/ac/socket.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
delete.lo: ../../../include/ac/time.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
delete.lo: ../../../include/ac/param.h
delete.lo: ../../../include/ac/unistd.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
delete.lo: ../../../include/lutil_lockf.h
delete.lo: ../../../include/avl.h
delete.lo: ../../../include/ldap_log.h
delete.lo: ../../../include/ldap.h
delete.lo: ../../../include/lber.h
delete.lo: ../../../include/ldap_features.h
delete.lo: ../../../include/ldap_schema.h
delete.lo: ../../../include/lber_pvt.h
delete.lo: ../../../include/ldap_pvt.h
delete.lo: ../../../include/ldap_pvt_uc.h
delete.lo: ../../../include/ac/bytes.h
delete.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
delete.lo: ../../../include/ldap_pvt_thread.h
delete.lo: ../../../include/ldap_int_thread.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
delete.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
delete.lo: ../../../include/ldap_queue.h
delete.lo: ../proto-slap.h
delete.lo: ../../../libraries/liblmdb/lmdb.h
delete.lo: proto-mdb.h
modify.lo: modify.c
modify.lo: ../../../include/portable.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
modify.lo: ../../../include/ac/fdset.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
modify.lo: ../../../include/ldap_cdefs.h
modify.lo: ../../../include/ldap_features.h
modify.lo: ../../../include/ac/assert.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
modify.lo: ../../../include/ac/localize.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
modify.lo: ../../../include/ac/string.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
modify.lo: ../../../include/ac/time.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
modify.lo: back-mdb.h
modify.lo: ../slap.h
modify.lo: ../../../include/ldap_defaults.h
modify.lo: ../../../include/ldap_config.h
modify.lo: ../../../include/ac/stdlib.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
modify.lo: ../../../include/ac/syslog.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
modify.lo: ../../../include/ac/regex.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
modify.lo: ../../../include/ac/signal.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
modify.lo: ../../../include/ac/socket.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
modify.lo: ../../../include/ac/param.h
modify.lo: ../../../include/ac/unistd.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
modify.lo: ../../../include/lutil_lockf.h
modify.lo: ../../../include/avl.h
modify.lo: ../../../include/ldap_cdefs.h
modify.lo: ../../../include/ldap_log.h
modify.lo: ../../../include/ldap.h
modify.lo: ../../../include/lber.h
modify.lo: ../../../include/lber_types.h
modify.lo: ../../../include/ldap_features.h
modify.lo: ../../../include/ldap_schema.h
modify.lo: ../../../include/lber_pvt.h
modify.lo: ../../../include/ldap_pvt.h
modify.lo: ../../../include/ldap_pvt_uc.h
modify.lo: ../../../include/ac/bytes.h
modify.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
modify.lo: ../../../include/ldap_pvt_thread.h
modify.lo: ../../../include/ldap_int_thread.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
modify.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
modify.lo: ../../../include/ldap_queue.h
modify.lo: ../proto-slap.h
modify.lo: ../../../libraries/liblmdb/lmdb.h
modify.lo: proto-mdb.h
modrdn.lo: modrdn.c
modrdn.lo: ../../../include/portable.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
modrdn.lo: ../../../include/ac/fdset.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
modrdn.lo: ../../../include/ldap_cdefs.h
modrdn.lo: ../../../include/ldap_features.h
modrdn.lo: ../../../include/ac/assert.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
modrdn.lo: ../../../include/ac/localize.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
modrdn.lo: ../../../include/ac/string.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
modrdn.lo: back-mdb.h
modrdn.lo: ../slap.h
modrdn.lo: ../../../include/ldap_defaults.h
modrdn.lo: ../../../include/ldap_config.h
modrdn.lo: ../../../include/ac/stdlib.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
modrdn.lo: ../../../include/ac/syslog.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
modrdn.lo: ../../../include/ac/regex.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
modrdn.lo: ../../../include/ac/signal.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
modrdn.lo: ../../../include/ac/socket.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
modrdn.lo: ../../../include/ac/time.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
modrdn.lo: ../../../include/ac/param.h
modrdn.lo: ../../../include/ac/unistd.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
modrdn.lo: ../../../include/lutil_lockf.h
modrdn.lo: ../../../include/avl.h
modrdn.lo: ../../../include/ldap_cdefs.h
modrdn.lo: ../../../include/ldap_log.h
modrdn.lo: ../../../include/ldap.h
modrdn.lo: ../../../include/lber.h
modrdn.lo: ../../../include/lber_types.h
modrdn.lo: ../../../include/ldap_features.h
modrdn.lo: ../../../include/ldap_schema.h
modrdn.lo: ../../../include/lber_pvt.h
modrdn.lo: ../../../include/ldap_pvt.h
modrdn.lo: ../../../include/ldap_pvt_uc.h
modrdn.lo: ../../../include/ac/bytes.h
modrdn.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
modrdn.lo: ../../../include/ldap_pvt_thread.h
modrdn.lo: ../../../include/ldap_int_thread.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
modrdn.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
modrdn.lo: ../../../include/ldap_queue.h
modrdn.lo: ../proto-slap.h
modrdn.lo: ../../../libraries/liblmdb/lmdb.h
modrdn.lo: proto-mdb.h
search.lo: search.c
search.lo: ../../../include/portable.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
search.lo: ../../../include/ac/fdset.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
search.lo: ../../../include/ldap_cdefs.h
search.lo: ../../../include/ldap_features.h
search.lo: ../../../include/ac/assert.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
search.lo: ../../../include/ac/localize.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
search.lo: ../../../include/ac/string.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
search.lo: back-mdb.h
search.lo: ../slap.h
search.lo: ../../../include/ldap_defaults.h
search.lo: ../../../include/ldap_config.h
search.lo: ../../../include/ac/stdlib.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
search.lo: ../../../include/ac/syslog.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
search.lo: ../../../include/ac/regex.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
search.lo: ../../../include/ac/signal.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
search.lo: ../../../include/ac/socket.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
search.lo: ../../../include/ac/time.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
search.lo: ../../../include/ac/param.h
search.lo: ../../../include/ac/unistd.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
search.lo: ../../../include/lutil_lockf.h
search.lo: ../../../include/avl.h
search.lo: ../../../include/ldap_cdefs.h
search.lo: ../../../include/ldap_log.h
search.lo: ../../../include/ldap.h
search.lo: ../../../include/lber.h
search.lo: ../../../include/lber_types.h
search.lo: ../../../include/ldap_features.h
search.lo: ../../../include/ldap_schema.h
search.lo: ../../../include/lber_pvt.h
search.lo: ../../../include/ldap_pvt.h
search.lo: ../../../include/ldap_pvt_uc.h
search.lo: ../../../include/ac/bytes.h
search.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
search.lo: ../../../include/ldap_pvt_thread.h
search.lo: ../../../include/ldap_int_thread.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
search.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
search.lo: ../../../include/ldap_queue.h
search.lo: ../proto-slap.h
search.lo: ../../../libraries/liblmdb/lmdb.h
search.lo: proto-mdb.h
search.lo: idl.h
extended.lo: extended.c
extended.lo: ../../../include/portable.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
extended.lo: ../../../include/ac/fdset.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
extended.lo: ../../../include/ldap_cdefs.h
extended.lo: ../../../include/ldap_features.h
extended.lo: ../../../include/ac/assert.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
extended.lo: ../../../include/ac/localize.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
extended.lo: ../../../include/ac/string.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
extended.lo: back-mdb.h
extended.lo: ../slap.h
extended.lo: ../../../include/ldap_defaults.h
extended.lo: ../../../include/ldap_config.h
extended.lo: ../../../include/ac/stdlib.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
extended.lo: ../../../include/ac/syslog.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
extended.lo: ../../../include/ac/regex.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
extended.lo: ../../../include/ac/signal.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
extended.lo: ../../../include/ac/socket.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
extended.lo: ../../../include/ac/time.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
extended.lo: ../../../include/ac/param.h
extended.lo: ../../../include/ac/unistd.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
extended.lo: ../../../include/lutil_lockf.h
extended.lo: ../../../include/avl.h
extended.lo: ../../../include/ldap_cdefs.h
extended.lo: ../../../include/ldap_log.h
extended.lo: ../../../include/ldap.h
extended.lo: ../../../include/lber.h
extended.lo: ../../../include/lber_types.h
extended.lo: ../../../include/ldap_features.h
extended.lo: ../../../include/ldap_schema.h
extended.lo: ../../../include/lber_pvt.h
extended.lo: ../../../include/ldap_pvt.h
extended.lo: ../../../include/ldap_pvt_uc.h
extended.lo: ../../../include/ac/bytes.h
extended.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
extended.lo: ../../../include/ldap_pvt_thread.h
extended.lo: ../../../include/ldap_int_thread.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
extended.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
extended.lo: ../../../include/ldap_queue.h
extended.lo: ../proto-slap.h
extended.lo: ../../../libraries/liblmdb/lmdb.h
extended.lo: proto-mdb.h
operational.lo: operational.c
operational.lo: ../../../include/portable.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
operational.lo: ../../../include/ac/fdset.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
operational.lo: ../../../include/ldap_cdefs.h
operational.lo: ../../../include/ldap_features.h
operational.lo: ../../../include/ac/assert.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
operational.lo: ../../../include/ac/localize.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
operational.lo: ../../../include/ac/string.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
operational.lo: ../../../include/ac/socket.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
operational.lo: ../slap.h
operational.lo: ../../../include/ldap_defaults.h
operational.lo: ../../../include/ldap_config.h
operational.lo: ../../../include/ac/stdlib.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
operational.lo: ../../../include/ac/syslog.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
operational.lo: ../../../include/ac/regex.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
operational.lo: ../../../include/ac/signal.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
operational.lo: ../../../include/ac/time.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
operational.lo: ../../../include/ac/param.h
operational.lo: ../../../include/ac/unistd.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
operational.lo: ../../../include/lutil_lockf.h
operational.lo: ../../../include/avl.h
operational.lo: ../../../include/ldap_cdefs.h
operational.lo: ../../../include/ldap_log.h
operational.lo: ../../../include/ldap.h
operational.lo: ../../../include/lber.h
operational.lo: ../../../include/lber_types.h
operational.lo: ../../../include/ldap_features.h
operational.lo: ../../../include/ldap_schema.h
operational.lo: ../../../include/lber_pvt.h
operational.lo: ../../../include/ldap_pvt.h
operational.lo: ../../../include/ldap_pvt_uc.h
operational.lo: ../../../include/ac/bytes.h
operational.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
operational.lo: ../../../include/ldap_pvt_thread.h
operational.lo: ../../../include/ldap_int_thread.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
operational.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
operational.lo: ../../../include/ldap_queue.h
operational.lo: ../proto-slap.h
operational.lo: back-mdb.h
operational.lo: ../../../libraries/liblmdb/lmdb.h
operational.lo: proto-mdb.h
attr.lo: attr.c
attr.lo: ../../../include/portable.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
attr.lo: ../../../include/ac/fdset.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
attr.lo: ../../../include/ldap_cdefs.h
attr.lo: ../../../include/ldap_features.h
attr.lo: ../../../include/ac/assert.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
attr.lo: ../../../include/ac/localize.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
attr.lo: ../../../include/ac/socket.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
attr.lo: ../../../include/ac/string.h
attr.lo: ../slap.h
attr.lo: ../../../include/ldap_defaults.h
attr.lo: ../../../include/ldap_config.h
attr.lo: ../../../include/ac/stdlib.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
attr.lo: ../../../include/ac/syslog.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
attr.lo: ../../../include/ac/regex.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
attr.lo: ../../../include/ac/signal.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
attr.lo: ../../../include/ac/time.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
attr.lo: ../../../include/ac/param.h
attr.lo: ../../../include/ac/unistd.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
attr.lo: ../../../include/lutil_lockf.h
attr.lo: ../../../include/avl.h
attr.lo: ../../../include/ldap_cdefs.h
attr.lo: ../../../include/ldap_log.h
attr.lo: ../../../include/ldap.h
attr.lo: ../../../include/lber.h
attr.lo: ../../../include/lber_types.h
attr.lo: ../../../include/ldap_features.h
attr.lo: ../../../include/ldap_schema.h
attr.lo: ../../../include/lber_pvt.h
attr.lo: ../../../include/ldap_pvt.h
attr.lo: ../../../include/ldap_pvt_uc.h
attr.lo: ../../../include/ac/bytes.h
attr.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
attr.lo: ../../../include/ldap_pvt_thread.h
attr.lo: ../../../include/ldap_int_thread.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
attr.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
attr.lo: ../../../include/ldap_queue.h
attr.lo: ../proto-slap.h
attr.lo: back-mdb.h
attr.lo: ../../../libraries/liblmdb/lmdb.h
attr.lo: proto-mdb.h
attr.lo: ../config.h
attr.lo: ../../../include/lutil.h
index.lo: index.c
index.lo: ../../../include/portable.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
index.lo: ../../../include/ac/fdset.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
index.lo: ../../../include/ldap_cdefs.h
index.lo: ../../../include/ldap_features.h
index.lo: ../../../include/ac/assert.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
index.lo: ../../../include/ac/localize.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
index.lo: ../../../include/ac/string.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
index.lo: ../../../include/ac/socket.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
index.lo: ../slap.h
index.lo: ../../../include/ldap_defaults.h
index.lo: ../../../include/ldap_config.h
index.lo: ../../../include/ac/stdlib.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
index.lo: ../../../include/ac/syslog.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
index.lo: ../../../include/ac/regex.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
index.lo: ../../../include/ac/signal.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
index.lo: ../../../include/ac/time.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
index.lo: ../../../include/ac/param.h
index.lo: ../../../include/ac/unistd.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
index.lo: ../../../include/lutil_lockf.h
index.lo: ../../../include/avl.h
index.lo: ../../../include/ldap_cdefs.h
index.lo: ../../../include/ldap_log.h
index.lo: ../../../include/ldap.h
index.lo: ../../../include/lber.h
index.lo: ../../../include/lber_types.h
index.lo: ../../../include/ldap_features.h
index.lo: ../../../include/ldap_schema.h
index.lo: ../../../include/lber_pvt.h
index.lo: ../../../include/ldap_pvt.h
index.lo: ../../../include/ldap_pvt_uc.h
index.lo: ../../../include/ac/bytes.h
index.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
index.lo: ../../../include/ldap_pvt_thread.h
index.lo: ../../../include/ldap_int_thread.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
index.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
index.lo: ../../../include/ldap_queue.h
index.lo: ../proto-slap.h
index.lo: back-mdb.h
index.lo: ../../../libraries/liblmdb/lmdb.h
index.lo: proto-mdb.h
index.lo: ../../../include/lutil_hash.h
key.lo: key.c
key.lo: ../../../include/portable.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
key.lo: ../../../include/ac/fdset.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
key.lo: ../../../include/ldap_cdefs.h
key.lo: ../../../include/ldap_features.h
key.lo: ../../../include/ac/assert.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
key.lo: ../../../include/ac/localize.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
key.lo: ../../../include/ac/string.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
key.lo: ../../../include/ac/socket.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
key.lo: ../slap.h
key.lo: ../../../include/ldap_defaults.h
key.lo: ../../../include/ldap_config.h
key.lo: ../../../include/ac/stdlib.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
key.lo: ../../../include/ac/syslog.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
key.lo: ../../../include/ac/regex.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
key.lo: ../../../include/ac/signal.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
key.lo: ../../../include/ac/time.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
key.lo: ../../../include/ac/param.h
key.lo: ../../../include/ac/unistd.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
key.lo: ../../../include/lutil_lockf.h
key.lo: ../../../include/avl.h
key.lo: ../../../include/ldap_cdefs.h
key.lo: ../../../include/ldap_log.h
key.lo: ../../../include/ldap.h
key.lo: ../../../include/lber.h
key.lo: ../../../include/lber_types.h
key.lo: ../../../include/ldap_features.h
key.lo: ../../../include/ldap_schema.h
key.lo: ../../../include/lber_pvt.h
key.lo: ../../../include/ldap_pvt.h
key.lo: ../../../include/ldap_pvt_uc.h
key.lo: ../../../include/ac/bytes.h
key.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
key.lo: ../../../include/ldap_pvt_thread.h
key.lo: ../../../include/ldap_int_thread.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
key.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
key.lo: ../../../include/ldap_queue.h
key.lo: ../proto-slap.h
key.lo: back-mdb.h
key.lo: ../../../libraries/liblmdb/lmdb.h
key.lo: proto-mdb.h
key.lo: idl.h
filterindex.lo: filterindex.c
filterindex.lo: ../../../include/portable.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
filterindex.lo: ../../../include/ac/fdset.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
filterindex.lo: ../../../include/ldap_cdefs.h
filterindex.lo: ../../../include/ldap_features.h
filterindex.lo: ../../../include/ac/assert.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
filterindex.lo: ../../../include/ac/localize.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
filterindex.lo: ../../../include/ac/string.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
filterindex.lo: back-mdb.h
filterindex.lo: ../slap.h
filterindex.lo: ../../../include/ldap_defaults.h
filterindex.lo: ../../../include/ldap_config.h
filterindex.lo: ../../../include/ac/stdlib.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
filterindex.lo: ../../../include/ac/syslog.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
filterindex.lo: ../../../include/ac/regex.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
filterindex.lo: ../../../include/ac/signal.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
filterindex.lo: ../../../include/ac/socket.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
filterindex.lo: ../../../include/ac/time.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
filterindex.lo: ../../../include/ac/param.h
filterindex.lo: ../../../include/ac/unistd.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
filterindex.lo: ../../../include/lutil_lockf.h
filterindex.lo: ../../../include/avl.h
filterindex.lo: ../../../include/ldap_cdefs.h
filterindex.lo: ../../../include/ldap_log.h
filterindex.lo: ../../../include/ldap.h
filterindex.lo: ../../../include/lber.h
filterindex.lo: ../../../include/lber_types.h
filterindex.lo: ../../../include/ldap_features.h
filterindex.lo: ../../../include/ldap_schema.h
filterindex.lo: ../../../include/lber_pvt.h
filterindex.lo: ../../../include/ldap_pvt.h
filterindex.lo: ../../../include/ldap_pvt_uc.h
filterindex.lo: ../../../include/ac/bytes.h
filterindex.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
filterindex.lo: ../../../include/ldap_pvt_thread.h
filterindex.lo: ../../../include/ldap_int_thread.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
filterindex.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
filterindex.lo: ../../../include/ldap_queue.h
filterindex.lo: ../proto-slap.h
filterindex.lo: ../../../libraries/liblmdb/lmdb.h
filterindex.lo: proto-mdb.h
filterindex.lo: idl.h
dn2entry.lo: dn2entry.c
dn2entry.lo: ../../../include/portable.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
dn2entry.lo: ../../../include/ac/fdset.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
dn2entry.lo: ../../../include/ldap_cdefs.h
dn2entry.lo: ../../../include/ldap_features.h
dn2entry.lo: ../../../include/ac/assert.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
dn2entry.lo: ../../../include/ac/localize.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
dn2entry.lo: ../../../include/ac/string.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
dn2entry.lo: back-mdb.h
dn2entry.lo: ../slap.h
dn2entry.lo: ../../../include/ldap_defaults.h
dn2entry.lo: ../../../include/ldap_config.h
dn2entry.lo: ../../../include/ac/stdlib.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
dn2entry.lo: ../../../include/ac/syslog.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
dn2entry.lo: ../../../include/ac/regex.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
dn2entry.lo: ../../../include/ac/signal.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
dn2entry.lo: ../../../include/ac/socket.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
dn2entry.lo: ../../../include/ac/time.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
dn2entry.lo: ../../../include/ac/param.h
dn2entry.lo: ../../../include/ac/unistd.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
dn2entry.lo: ../../../include/lutil_lockf.h
dn2entry.lo: ../../../include/avl.h
dn2entry.lo: ../../../include/ldap_cdefs.h
dn2entry.lo: ../../../include/ldap_log.h
dn2entry.lo: ../../../include/ldap.h
dn2entry.lo: ../../../include/lber.h
dn2entry.lo: ../../../include/lber_types.h
dn2entry.lo: ../../../include/ldap_features.h
dn2entry.lo: ../../../include/ldap_schema.h
dn2entry.lo: ../../../include/lber_pvt.h
dn2entry.lo: ../../../include/ldap_pvt.h
dn2entry.lo: ../../../include/ldap_pvt_uc.h
dn2entry.lo: ../../../include/ac/bytes.h
dn2entry.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
dn2entry.lo: ../../../include/ldap_pvt_thread.h
dn2entry.lo: ../../../include/ldap_int_thread.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
dn2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
dn2entry.lo: ../../../include/ldap_queue.h
dn2entry.lo: ../proto-slap.h
dn2entry.lo: ../../../libraries/liblmdb/lmdb.h
dn2entry.lo: proto-mdb.h
dn2id.lo: dn2id.c
dn2id.lo: ../../../include/portable.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
dn2id.lo: ../../../include/ac/fdset.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
dn2id.lo: ../../../include/ldap_cdefs.h
dn2id.lo: ../../../include/ldap_features.h
dn2id.lo: ../../../include/ac/assert.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
dn2id.lo: ../../../include/ac/localize.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
dn2id.lo: ../../../include/ac/string.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
dn2id.lo: back-mdb.h
dn2id.lo: ../slap.h
dn2id.lo: ../../../include/ldap_defaults.h
dn2id.lo: ../../../include/ldap_config.h
dn2id.lo: ../../../include/ac/stdlib.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
dn2id.lo: ../../../include/ac/syslog.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
dn2id.lo: ../../../include/ac/regex.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
dn2id.lo: ../../../include/ac/signal.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
dn2id.lo: ../../../include/ac/socket.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
dn2id.lo: ../../../include/ac/time.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
dn2id.lo: ../../../include/ac/param.h
dn2id.lo: ../../../include/ac/unistd.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
dn2id.lo: ../../../include/lutil_lockf.h
dn2id.lo: ../../../include/avl.h
dn2id.lo: ../../../include/ldap_cdefs.h
dn2id.lo: ../../../include/ldap_log.h
dn2id.lo: ../../../include/ldap.h
dn2id.lo: ../../../include/lber.h
dn2id.lo: ../../../include/lber_types.h
dn2id.lo: ../../../include/ldap_features.h
dn2id.lo: ../../../include/ldap_schema.h
dn2id.lo: ../../../include/lber_pvt.h
dn2id.lo: ../../../include/ldap_pvt.h
dn2id.lo: ../../../include/ldap_pvt_uc.h
dn2id.lo: ../../../include/ac/bytes.h
dn2id.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
dn2id.lo: ../../../include/ldap_pvt_thread.h
dn2id.lo: ../../../include/ldap_int_thread.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
dn2id.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
dn2id.lo: ../../../include/ldap_queue.h
dn2id.lo: ../proto-slap.h
dn2id.lo: ../../../libraries/liblmdb/lmdb.h
dn2id.lo: proto-mdb.h
dn2id.lo: idl.h
dn2id.lo: ../../../include/lutil.h
id2entry.lo: id2entry.c
id2entry.lo: ../../../include/portable.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
id2entry.lo: ../../../include/ac/fdset.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
id2entry.lo: ../../../include/ldap_cdefs.h
id2entry.lo: ../../../include/ldap_features.h
id2entry.lo: ../../../include/ac/assert.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
id2entry.lo: ../../../include/ac/localize.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
id2entry.lo: ../../../include/ac/string.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
id2entry.lo: ../../../include/ac/errno.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/errno.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/errno.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/errno.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/errno.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/errno.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/errno-base.h
id2entry.lo: back-mdb.h
id2entry.lo: ../slap.h
id2entry.lo: ../../../include/ldap_defaults.h
id2entry.lo: ../../../include/ldap_config.h
id2entry.lo: ../../../include/ac/stdlib.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
id2entry.lo: ../../../include/ac/syslog.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
id2entry.lo: ../../../include/ac/regex.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
id2entry.lo: ../../../include/ac/signal.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
id2entry.lo: ../../../include/ac/socket.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
id2entry.lo: ../../../include/ac/time.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
id2entry.lo: ../../../include/ac/param.h
id2entry.lo: ../../../include/ac/unistd.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
id2entry.lo: ../../../include/lutil_lockf.h
id2entry.lo: ../../../include/avl.h
id2entry.lo: ../../../include/ldap_cdefs.h
id2entry.lo: ../../../include/ldap_log.h
id2entry.lo: ../../../include/ldap.h
id2entry.lo: ../../../include/lber.h
id2entry.lo: ../../../include/lber_types.h
id2entry.lo: ../../../include/ldap_features.h
id2entry.lo: ../../../include/ldap_schema.h
id2entry.lo: ../../../include/lber_pvt.h
id2entry.lo: ../../../include/ldap_pvt.h
id2entry.lo: ../../../include/ldap_pvt_uc.h
id2entry.lo: ../../../include/ac/bytes.h
id2entry.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
id2entry.lo: ../../../include/ldap_pvt_thread.h
id2entry.lo: ../../../include/ldap_int_thread.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
id2entry.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
id2entry.lo: ../../../include/ldap_queue.h
id2entry.lo: ../proto-slap.h
id2entry.lo: ../../../libraries/liblmdb/lmdb.h
id2entry.lo: proto-mdb.h
idl.lo: idl.c
idl.lo: ../../../include/portable.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
idl.lo: ../../../include/ac/fdset.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
idl.lo: ../../../include/ldap_cdefs.h
idl.lo: ../../../include/ldap_features.h
idl.lo: ../../../include/ac/assert.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
idl.lo: ../../../include/ac/localize.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
idl.lo: ../../../include/ac/string.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
idl.lo: back-mdb.h
idl.lo: ../slap.h
idl.lo: ../../../include/ldap_defaults.h
idl.lo: ../../../include/ldap_config.h
idl.lo: ../../../include/ac/stdlib.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
idl.lo: ../../../include/ac/syslog.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
idl.lo: ../../../include/ac/regex.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
idl.lo: ../../../include/ac/signal.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
idl.lo: ../../../include/ac/socket.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
idl.lo: ../../../include/ac/time.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
idl.lo: ../../../include/ac/param.h
idl.lo: ../../../include/ac/unistd.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
idl.lo: ../../../include/lutil_lockf.h
idl.lo: ../../../include/avl.h
idl.lo: ../../../include/ldap_cdefs.h
idl.lo: ../../../include/ldap_log.h
idl.lo: ../../../include/ldap.h
idl.lo: ../../../include/lber.h
idl.lo: ../../../include/lber_types.h
idl.lo: ../../../include/ldap_features.h
idl.lo: ../../../include/ldap_schema.h
idl.lo: ../../../include/lber_pvt.h
idl.lo: ../../../include/ldap_pvt.h
idl.lo: ../../../include/ldap_pvt_uc.h
idl.lo: ../../../include/ac/bytes.h
idl.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
idl.lo: ../../../include/ldap_pvt_thread.h
idl.lo: ../../../include/ldap_int_thread.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
idl.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
idl.lo: ../../../include/ldap_queue.h
idl.lo: ../proto-slap.h
idl.lo: ../../../libraries/liblmdb/lmdb.h
idl.lo: proto-mdb.h
idl.lo: idl.h
nextid.lo: nextid.c
nextid.lo: ../../../include/portable.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
nextid.lo: ../../../include/ac/fdset.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
nextid.lo: ../../../include/ldap_cdefs.h
nextid.lo: ../../../include/ldap_features.h
nextid.lo: ../../../include/ac/assert.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
nextid.lo: ../../../include/ac/localize.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
nextid.lo: ../../../include/ac/string.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
nextid.lo: back-mdb.h
nextid.lo: ../slap.h
nextid.lo: ../../../include/ldap_defaults.h
nextid.lo: ../../../include/ldap_config.h
nextid.lo: ../../../include/ac/stdlib.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
nextid.lo: ../../../include/ac/syslog.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
nextid.lo: ../../../include/ac/regex.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
nextid.lo: ../../../include/ac/signal.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
nextid.lo: ../../../include/ac/socket.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
nextid.lo: ../../../include/ac/time.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
nextid.lo: ../../../include/ac/param.h
nextid.lo: ../../../include/ac/unistd.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
nextid.lo: ../../../include/lutil_lockf.h
nextid.lo: ../../../include/avl.h
nextid.lo: ../../../include/ldap_cdefs.h
nextid.lo: ../../../include/ldap_log.h
nextid.lo: ../../../include/ldap.h
nextid.lo: ../../../include/lber.h
nextid.lo: ../../../include/lber_types.h
nextid.lo: ../../../include/ldap_features.h
nextid.lo: ../../../include/ldap_schema.h
nextid.lo: ../../../include/lber_pvt.h
nextid.lo: ../../../include/ldap_pvt.h
nextid.lo: ../../../include/ldap_pvt_uc.h
nextid.lo: ../../../include/ac/bytes.h
nextid.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
nextid.lo: ../../../include/ldap_pvt_thread.h
nextid.lo: ../../../include/ldap_int_thread.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
nextid.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
nextid.lo: ../../../include/ldap_queue.h
nextid.lo: ../proto-slap.h
nextid.lo: ../../../libraries/liblmdb/lmdb.h
nextid.lo: proto-mdb.h
monitor.lo: monitor.c
monitor.lo: ../../../include/portable.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
monitor.lo: ../../../include/ac/fdset.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
monitor.lo: ../../../include/ldap_cdefs.h
monitor.lo: ../../../include/ldap_features.h
monitor.lo: ../../../include/ac/assert.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
monitor.lo: ../../../include/ac/localize.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
monitor.lo: ../../../include/ac/string.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
monitor.lo: ../../../include/ac/unistd.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
monitor.lo: ../../../include/lutil_lockf.h
monitor.lo: ../../../include/ac/stdlib.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
monitor.lo: ../../../include/ac/errno.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/errno.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/errno.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/errno.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/errno.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/errno.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/errno-base.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/stat.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stat.h
monitor.lo: ../../../include/lutil.h
monitor.lo: ../../../include/ldap_cdefs.h
monitor.lo: ../../../include/lber_types.h
monitor.lo: back-mdb.h
monitor.lo: ../slap.h
monitor.lo: ../../../include/ldap_defaults.h
monitor.lo: ../../../include/ldap_config.h
monitor.lo: ../../../include/ac/syslog.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
monitor.lo: ../../../include/ac/regex.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
monitor.lo: ../../../include/ac/signal.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
monitor.lo: ../../../include/ac/socket.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
monitor.lo: ../../../include/ac/time.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
monitor.lo: ../../../include/ac/param.h
monitor.lo: ../../../include/avl.h
monitor.lo: ../../../include/ldap_log.h
monitor.lo: ../../../include/ldap.h
monitor.lo: ../../../include/lber.h
monitor.lo: ../../../include/ldap_features.h
monitor.lo: ../../../include/ldap_schema.h
monitor.lo: ../../../include/lber_pvt.h
monitor.lo: ../../../include/ldap_pvt.h
monitor.lo: ../../../include/ldap_pvt_uc.h
monitor.lo: ../../../include/ac/bytes.h
monitor.lo: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
monitor.lo: ../../../include/ldap_pvt_thread.h
monitor.lo: ../../../include/ldap_int_thread.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
monitor.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
monitor.lo: ../../../include/ldap_queue.h
monitor.lo: ../proto-slap.h
monitor.lo: ../../../libraries/liblmdb/lmdb.h
monitor.lo: proto-mdb.h
monitor.lo: ../back-monitor/back-monitor.h
monitor.lo: ../back-monitor/proto-back-monitor.h
monitor.lo: ../config.h

# IF YOU PUT ANYTHING HERE IT WILL GO AWAY
