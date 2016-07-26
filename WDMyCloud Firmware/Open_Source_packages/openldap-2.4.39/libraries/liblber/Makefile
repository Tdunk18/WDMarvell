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

top_builddir = ../..

srcdir = .
top_srcdir = ../..

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

# LIBLBER
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

LIBRARY = liblber.la

NT_SRCS = nt_err.c
NT_OBJS = nt_err.lo

UNIX_SRCS = stdio.c
UNIX_OBJS = stdio.lo

LIB_DEFS = -DLBER_LIBRARY

SRCS= assert.c decode.c encode.c io.c bprint.c debug.c \
	memory.c options.c sockbuf.c $(UNIX_SRCS)
OBJS= assert.lo decode.lo encode.lo io.lo bprint.lo debug.lo \
	memory.lo options.lo sockbuf.lo $(UNIX_OBJS)
XSRCS= version.c

PROGRAMS= dtest etest idtest

LDAP_INCDIR= ../../include
LDAP_LIBDIR= ../../libraries

XLIBS = $(LIBRARY) $(LDAP_LIBLUTIL_A)
XXLIBS = 
NT_LINK_LIBS = $(AC_LIBS)
UNIX_LINK_LIBS = $(AC_LIBS)

dtest:    $(XLIBS) dtest.o
	$(LTLINK) -o $@ dtest.o $(LIBS)
etest:  $(XLIBS) etest.o
	$(LTLINK) -o $@ etest.o $(LIBS)
idtest:  $(XLIBS) idtest.o
	$(LTLINK) -o $@ idtest.o $(LIBS)

install-local: FORCE
	-$(MKDIR) $(DESTDIR)$(libdir)
	$(LTINSTALL) $(INSTALLFLAGS) -m 644 $(LIBRARY) $(DESTDIR)$(libdir)
	$(LTFINISH) $(DESTDIR)$(libdir)

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
# Makefile Template for Libraries
#

all-common: $(LIBRARY) $(PROGRAMS)

version.c: Makefile
	$(RM) $@
	$(MKVERSION) $(LIBRARY) > $@

version.o version.lo: version.c $(OBJS)

install-common: FORCE

lint: lint-local FORCE
	$(LINT) $(DEFS) $(DEFINES) $(SRCS)

lint5: lint5-local FORCE
	$(5LINT) $(DEFS) $(DEFINES) $(SRCS)

#
# In the mingw/cygwin environment, the so and dll files must be
# deleted separately, instead of using the {.so*,*.dll} construct
# that was previously used. It just didn't work.
#
clean-common: 	FORCE
	$(RM) $(LIBRARY) ../$(LIBRARY) $(XLIBRARY) \
		$(PROGRAMS) $(XPROGRAMS) $(XSRCS) $(XXSRCS) \
		*.o *.lo a.out *.exe core version.c .libs/*

depend-common: FORCE
	$(MKDEP) $(DEFS) $(DEFINES) $(SRCS) $(XXSRCS)

lint-local: FORCE
lint5-local: FORCE

Makefile: $(top_srcdir)/build/lib.mk

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
# Makefile Template for Shared Libraries
#

MKDEPFLAG = -l

.SUFFIXES: .c .o .lo

.c.lo:
	$(LTCOMPILE_LIB) $<

$(LIBRARY): version.lo
	$(LTLINK_LIB) -o $@ $(OBJS) version.lo $(LINK_LIBS)

Makefile: $(top_srcdir)/build/lib-shared.mk

# DO NOT DELETE THIS LINE -- mkdep uses it.
# DO NOT PUT ANYTHING AFTER THIS LINE, IT WILL GO AWAY.


#
# files: -I../../include -I../../include -I/home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A/include -I/home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A/include assert.c decode.c encode.c io.c bprint.c debug.c memory.c options.c sockbuf.c stdio.c
# command: arm-mv5sft-linux-gnueabi-gcc -M -I.  -I../../include -I../../include -I/home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A/include -I/home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A/include assert.c decode.c encode.c io.c bprint.c debug.c memory.c options.c sockbuf.c stdio.c
#

assert.lo: assert.c
assert.lo: ../../include/portable.h
assert.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
assert.lo: ../../include/ac/fdset.h
assert.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
assert.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
assert.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
assert.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
assert.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
assert.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
assert.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
assert.lo: ../../include/ldap_cdefs.h
assert.lo: ../../include/ldap_features.h
assert.lo: ../../include/ac/assert.h
assert.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
assert.lo: ../../include/ac/localize.h
decode.lo: decode.c
decode.lo: ../../include/portable.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
decode.lo: ../../include/ac/fdset.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
decode.lo: ../../include/ldap_cdefs.h
decode.lo: ../../include/ldap_features.h
decode.lo: ../../include/ac/assert.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
decode.lo: ../../include/ac/localize.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
decode.lo: ../../include/ac/stdlib.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
decode.lo: ../../include/ac/stdarg.h
decode.lo: ../../include/ac/string.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
decode.lo: ../../include/ac/socket.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
decode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
decode.lo: lber-int.h
decode.lo: ../../include/lber.h
decode.lo: ../../include/lber_types.h
decode.lo: ../../include/ldap_cdefs.h
decode.lo: ../../include/ldap_log.h
decode.lo: ../../include/lber_pvt.h
decode.lo: ../../include/ldap_queue.h
encode.lo: encode.c
encode.lo: ../../include/portable.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
encode.lo: ../../include/ac/fdset.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
encode.lo: ../../include/ldap_cdefs.h
encode.lo: ../../include/ldap_features.h
encode.lo: ../../include/ac/assert.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
encode.lo: ../../include/ac/localize.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/ctype.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
encode.lo: ../../include/ac/stdlib.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
encode.lo: ../../include/ac/stdarg.h
encode.lo: ../../include/ac/socket.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
encode.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
encode.lo: ../../include/ac/string.h
encode.lo: lber-int.h
encode.lo: ../../include/lber.h
encode.lo: ../../include/lber_types.h
encode.lo: ../../include/ldap_cdefs.h
encode.lo: ../../include/ldap_log.h
encode.lo: ../../include/lber_pvt.h
encode.lo: ../../include/ldap_queue.h
io.lo: io.c
io.lo: ../../include/portable.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
io.lo: ../../include/ac/fdset.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
io.lo: ../../include/ldap_cdefs.h
io.lo: ../../include/ldap_features.h
io.lo: ../../include/ac/assert.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
io.lo: ../../include/ac/localize.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
io.lo: ../../include/ac/stdlib.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
io.lo: ../../include/ac/ctype.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/ctype.h
io.lo: ../../include/ac/errno.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/errno.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/errno.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/errno.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/errno.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/errno.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/errno-base.h
io.lo: ../../include/ac/socket.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
io.lo: ../../include/ac/string.h
io.lo: ../../include/ac/unistd.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
io.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
io.lo: ../../include/lutil_lockf.h
io.lo: lber-int.h
io.lo: ../../include/lber.h
io.lo: ../../include/lber_types.h
io.lo: ../../include/ldap_cdefs.h
io.lo: ../../include/ldap_log.h
io.lo: ../../include/lber_pvt.h
io.lo: ../../include/ldap_queue.h
bprint.lo: bprint.c
bprint.lo: ../../include/portable.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
bprint.lo: ../../include/ac/fdset.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
bprint.lo: ../../include/ldap_cdefs.h
bprint.lo: ../../include/ldap_features.h
bprint.lo: ../../include/ac/assert.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
bprint.lo: ../../include/ac/localize.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
bprint.lo: ../../include/ac/ctype.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/ctype.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
bprint.lo: ../../include/ac/stdarg.h
bprint.lo: ../../include/ac/string.h
bprint.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
bprint.lo: lber-int.h
bprint.lo: ../../include/lber.h
bprint.lo: ../../include/lber_types.h
bprint.lo: ../../include/ldap_cdefs.h
bprint.lo: ../../include/ldap_log.h
bprint.lo: ../../include/lber_pvt.h
bprint.lo: ../../include/ldap_queue.h
debug.lo: debug.c
debug.lo: ../../include/portable.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
debug.lo: ../../include/ac/fdset.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
debug.lo: ../../include/ldap_cdefs.h
debug.lo: ../../include/ldap_features.h
debug.lo: ../../include/ac/assert.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
debug.lo: ../../include/ac/localize.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
debug.lo: ../../include/ac/stdarg.h
debug.lo: ../../include/ac/stdlib.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
debug.lo: ../../include/ac/string.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
debug.lo: ../../include/ac/time.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
debug.lo: ../../include/ac/ctype.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/ctype.h
debug.lo: ../../include/ac/syslog.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
debug.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
debug.lo: ../../include/ldap_log.h
debug.lo: ../../include/ldap_cdefs.h
debug.lo: ../../include/ldap_defaults.h
debug.lo: ../../include/ldap_config.h
debug.lo: ../../include/lber.h
debug.lo: ../../include/lber_types.h
debug.lo: ../../include/ldap_pvt.h
debug.lo: ../../include/lber_pvt.h
debug.lo: ../../include/ldap_pvt_uc.h
debug.lo: ../../include/ac/bytes.h
debug.lo: ../../include/../libraries/liblunicode/ucdata/ucdata.h
memory.lo: memory.c
memory.lo: ../../include/portable.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
memory.lo: ../../include/ac/fdset.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
memory.lo: ../../include/ldap_cdefs.h
memory.lo: ../../include/ldap_features.h
memory.lo: ../../include/ac/assert.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
memory.lo: ../../include/ac/localize.h
memory.lo: ../../include/ac/stdlib.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
memory.lo: ../../include/ac/string.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
memory.lo: lber-int.h
memory.lo: ../../include/lber.h
memory.lo: ../../include/lber_types.h
memory.lo: ../../include/ldap_cdefs.h
memory.lo: ../../include/ldap_log.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
memory.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
memory.lo: ../../include/lber_pvt.h
memory.lo: ../../include/ldap_queue.h
options.lo: options.c
options.lo: ../../include/portable.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
options.lo: ../../include/ac/fdset.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
options.lo: ../../include/ldap_cdefs.h
options.lo: ../../include/ldap_features.h
options.lo: ../../include/ac/assert.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
options.lo: ../../include/ac/localize.h
options.lo: ../../include/ac/stdlib.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
options.lo: ../../include/ac/string.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
options.lo: ../../include/ac/stdarg.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
options.lo: lber-int.h
options.lo: ../../include/lber.h
options.lo: ../../include/lber_types.h
options.lo: ../../include/ldap_cdefs.h
options.lo: ../../include/ldap_log.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
options.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
options.lo: ../../include/lber_pvt.h
options.lo: ../../include/ldap_queue.h
sockbuf.lo: sockbuf.c
sockbuf.lo: ../../include/portable.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
sockbuf.lo: ../../include/ac/fdset.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
sockbuf.lo: ../../include/ldap_cdefs.h
sockbuf.lo: ../../include/ldap_features.h
sockbuf.lo: ../../include/ac/assert.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
sockbuf.lo: ../../include/ac/localize.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
sockbuf.lo: ../../include/ac/stdlib.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
sockbuf.lo: ../../include/ac/ctype.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/ctype.h
sockbuf.lo: ../../include/ac/errno.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/errno.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/errno.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/errno.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/errno.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/errno.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/errno-base.h
sockbuf.lo: ../../include/ac/socket.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
sockbuf.lo: ../../include/ac/string.h
sockbuf.lo: ../../include/ac/unistd.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
sockbuf.lo: ../../include/lutil_lockf.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/fcntl.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/fcntl.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/ioctl.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/ioctls.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/ioctls.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/ioctl.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/ioctl.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/ioctl-types.h
sockbuf.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/ttydefaults.h
sockbuf.lo: lber-int.h
sockbuf.lo: ../../include/lber.h
sockbuf.lo: ../../include/lber_types.h
sockbuf.lo: ../../include/ldap_cdefs.h
sockbuf.lo: ../../include/ldap_log.h
sockbuf.lo: ../../include/lber_pvt.h
sockbuf.lo: ../../include/ldap_queue.h
stdio.lo: stdio.c
stdio.lo: ../../include/portable.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
stdio.lo: ../../include/ac/fdset.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
stdio.lo: ../../include/ldap_cdefs.h
stdio.lo: ../../include/ldap_features.h
stdio.lo: ../../include/ac/assert.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
stdio.lo: ../../include/ac/localize.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
stdio.lo: ../../include/ac/stdarg.h
stdio.lo: ../../include/ac/string.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
stdio.lo: ../../include/ac/ctype.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/ctype.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
stdio.lo: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
stdio.lo: ../../include/lutil.h
stdio.lo: ../../include/ldap_cdefs.h
stdio.lo: ../../include/lber_types.h

# IF YOU PUT ANYTHING HERE IT WILL GO AWAY
