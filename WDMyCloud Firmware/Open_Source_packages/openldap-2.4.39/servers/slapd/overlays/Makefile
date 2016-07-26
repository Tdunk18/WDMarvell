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

# Makefile.in for overlays
# $OpenLDAP$
## This work is part of OpenLDAP Software <http://www.openldap.org/>.
##
## Copyright 2003-2014 The OpenLDAP Foundation.
## All rights reserved.
##
## Redistribution and use in source and binary forms, with or without
## modification, are permitted only as authorized by the OpenLDAP
## Public License.
##
## A copy of this license is available in the file LICENSE in the
## top-level directory of the distribution or, alternatively, at
## <http://www.OpenLDAP.org/license.html>.

SRCS = overlays.c \
	accesslog.c \
	auditlog.c \
	constraint.c \
	dds.c \
	deref.c \
	dyngroup.c \
	dynlist.c \
	memberof.c \
	pcache.c \
	collect.c \
	ppolicy.c \
	refint.c \
	retcode.c \
	rwm.c rwmconf.c rwmdn.c rwmmap.c \
	seqmod.c \
	sssvlv.c \
	syncprov.c \
	translucent.c \
	unique.c \
	valsort.c
OBJS = statover.o \
	 accesslog.o auditlog.o collect.o constraint.o dds.o deref.o dyngroup.o dynlist.o memberof.o ppolicy.o pcache.o refint.o retcode.o rwm_x.o seqmod.o sssvlv.o syncprov.o translucent.o unique.o valsort.o \
	overlays.o

# Add here the objs that are needed by overlays, but do not make it
# into SLAPD_STATIC_OVERLAYS...
OBJDEP=rwm.o rwmconf.o rwmdn.o rwmmap.o

LTONLY_MOD = $(LTONLY_mod)
LDAP_INCDIR= ../../../include       
LDAP_LIBDIR= ../../../libraries

MOD_DEFS = -DSLAPD_IMPORT

shared_LDAP_LIBS = $(LDAP_LIBLDAP_R_LA) $(LDAP_LIBLBER_LA)
NT_LINK_LIBS = -L.. -lslapd $(static_LDAP_LIBS)
UNIX_LINK_LIBS = $(static_LDAP_LIBS)

LIBRARY = ../liboverlays.a
PROGRAMS = 

XINCPATH = -I.. -I$(srcdir)/..
XDEFS = $(MODULES_CPPFLAGS)

static:	$(LIBRARY)

dynamic: $(PROGRAMS)

accesslog.la : accesslog.lo
	$(LTLINK_MOD) -module -o $@ accesslog.lo version.lo $(LINK_LIBS)

auditlog.la : auditlog.lo
	$(LTLINK_MOD) -module -o $@ auditlog.lo version.lo $(LINK_LIBS)

constraint.la : constraint.lo
	$(LTLINK_MOD) -module -o $@ constraint.lo version.lo $(LINK_LIBS)

dds.la : dds.lo
	$(LTLINK_MOD) -module -o $@ dds.lo version.lo $(LINK_LIBS)

deref.la : deref.lo
	$(LTLINK_MOD) -module -o $@ deref.lo version.lo $(LINK_LIBS)

dyngroup.la : dyngroup.lo
	$(LTLINK_MOD) -module -o $@ dyngroup.lo version.lo $(LINK_LIBS)

dynlist.la : dynlist.lo
	$(LTLINK_MOD) -module -o $@ dynlist.lo version.lo $(LINK_LIBS)

memberof.la : memberof.lo
	$(LTLINK_MOD) -module -o $@ memberof.lo version.lo $(LINK_LIBS)

pcache.la : pcache.lo
	$(LTLINK_MOD) -module -o $@ pcache.lo version.lo $(LINK_LIBS)

collect.la : collect.lo
	$(LTLINK_MOD) -module -o $@ collect.lo version.lo $(LINK_LIBS)

ppolicy.la : ppolicy.lo
	$(LTLINK_MOD) -module -o $@ ppolicy.lo version.lo $(LINK_LIBS) $(MODULES_LIBS)

refint.la : refint.lo
	$(LTLINK_MOD) -module -o $@ refint.lo version.lo $(LINK_LIBS)

retcode.la : retcode.lo
	$(LTLINK_MOD) -module -o $@ retcode.lo version.lo $(LINK_LIBS)

rwm_x.o: rwm.o rwmconf.o rwmdn.o rwmmap.o
	$(LD) -r -o $@ rwm.o rwmconf.o rwmdn.o rwmmap.o

rwm.la : rwm.lo rwmconf.lo rwmdn.lo rwmmap.lo
	$(LTLINK_MOD) -module -o $@ rwm.lo rwmconf.lo rwmdn.lo rwmmap.lo version.lo $(LINK_LIBS)

seqmod.la : seqmod.lo
	$(LTLINK_MOD) -module -o $@ seqmod.lo version.lo $(LINK_LIBS)

sssvlv.la : sssvlv.lo
	$(LTLINK_MOD) -module -o $@ sssvlv.lo version.lo $(LINK_LIBS)

syncprov.la : syncprov.lo
	$(LTLINK_MOD) -module -o $@ syncprov.lo version.lo $(LINK_LIBS)

translucent.la : translucent.lo
	$(LTLINK_MOD) -module -o $@ translucent.lo version.lo $(LINK_LIBS)

unique.la : unique.lo
	$(LTLINK_MOD) -module -o $@ unique.lo version.lo $(LINK_LIBS)

valsort.la : valsort.lo
	$(LTLINK_MOD) -module -o $@ valsort.lo version.lo $(LINK_LIBS)

install-local:	$(PROGRAMS)
	@if test -n "$?" ; then \
		$(MKDIR) $(DESTDIR)$(moduledir); \
		$(LTINSTALL) $(INSTALLFLAGS) -m 755 $? $(DESTDIR)$(moduledir);\
	fi

MKDEPFLAG = -l

.SUFFIXES: .c .o .lo

.c.lo:
	$(LTCOMPILE_MOD) $<

statover.o: statover.c $(srcdir)/../slap.h

$(LIBRARY): $(OBJS) version.lo
	$(AR) rs $@ $(OBJS)

# Must fixup depends for non-libtool objects
depend-local: depend-common
	@if test -n "$(OBJS)"; then \
	OBJ2=`echo $(OBJS) $(OBJDEP) | $(SED) -e 's/\.o//g'`; \
	SCR=''; for i in $$OBJ2; do SCR="$$SCR -e s/^$$i.lo:/$$i.o:/"; done; \
	mv Makefile Makefile.bak; $(SED) $$SCR Makefile.bak > Makefile && \
	$(RM) Makefile.bak; fi

veryclean-local:
	$(RM) statover.c

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

# DO NOT DELETE THIS LINE -- mkdep uses it.
# DO NOT PUT ANYTHING AFTER THIS LINE, IT WILL GO AWAY.


#
# files: -I../../../include -I../../../include -I.. -I./.. -I/home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A/include -I/home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A/include overlays.c accesslog.c auditlog.c constraint.c dds.c deref.c dyngroup.c dynlist.c memberof.c pcache.c collect.c ppolicy.c refint.c retcode.c rwm.c rwmconf.c rwmdn.c rwmmap.c seqmod.c sssvlv.c syncprov.c translucent.c unique.c valsort.c
# command: arm-mv5sft-linux-gnueabi-gcc -M -I.  -I../../../include -I../../../include -I.. -I./.. -I/home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A/include -I/home/ben/wdic-gpl/openldap-2.4.39/../_xinstall/LIGHTNING-4A/include overlays.c accesslog.c auditlog.c constraint.c dds.c deref.c dyngroup.c dynlist.c memberof.c pcache.c collect.c ppolicy.c refint.c retcode.c rwm.c rwmconf.c rwmdn.c rwmmap.c seqmod.c sssvlv.c syncprov.c translucent.c unique.c valsort.c
#

overlays.o: overlays.c
overlays.o: ../../../include/portable.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
overlays.o: ../../../include/ac/fdset.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
overlays.o: ../../../include/ldap_cdefs.h
overlays.o: ../../../include/ldap_features.h
overlays.o: ../../../include/ac/assert.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
overlays.o: ../../../include/ac/localize.h
overlays.o: ../slap.h
overlays.o: ../../../include/ldap_defaults.h
overlays.o: ../../../include/ldap_config.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
overlays.o: ../../../include/ac/stdlib.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
overlays.o: ../../../include/ac/syslog.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
overlays.o: ../../../include/ac/regex.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
overlays.o: ../../../include/ac/signal.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
overlays.o: ../../../include/ac/socket.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
overlays.o: ../../../include/ac/time.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
overlays.o: ../../../include/ac/param.h
overlays.o: ../../../include/ac/unistd.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
overlays.o: ../../../include/lutil_lockf.h
overlays.o: ../../../include/avl.h
overlays.o: ../../../include/ldap_cdefs.h
overlays.o: ../../../include/ldap_log.h
overlays.o: ../../../include/ldap.h
overlays.o: ../../../include/lber.h
overlays.o: ../../../include/lber_types.h
overlays.o: ../../../include/ldap_features.h
overlays.o: ../../../include/ldap_schema.h
overlays.o: ../../../include/lber_pvt.h
overlays.o: ../../../include/ldap_pvt.h
overlays.o: ../../../include/ldap_pvt_uc.h
overlays.o: ../../../include/ac/bytes.h
overlays.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
overlays.o: ../../../include/ldap_pvt_thread.h
overlays.o: ../../../include/ldap_int_thread.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
overlays.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
overlays.o: ../../../include/ldap_queue.h
overlays.o: ../proto-slap.h
accesslog.o: accesslog.c
accesslog.o: ../../../include/portable.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
accesslog.o: ../../../include/ac/fdset.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
accesslog.o: ../../../include/ldap_cdefs.h
accesslog.o: ../../../include/ldap_features.h
accesslog.o: ../../../include/ac/assert.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
accesslog.o: ../../../include/ac/localize.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
accesslog.o: ../../../include/ac/string.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
accesslog.o: ../../../include/ac/ctype.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/ctype.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
accesslog.o: ../slap.h
accesslog.o: ../../../include/ldap_defaults.h
accesslog.o: ../../../include/ldap_config.h
accesslog.o: ../../../include/ac/stdlib.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
accesslog.o: ../../../include/ac/syslog.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
accesslog.o: ../../../include/ac/regex.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
accesslog.o: ../../../include/ac/signal.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
accesslog.o: ../../../include/ac/socket.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
accesslog.o: ../../../include/ac/time.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
accesslog.o: ../../../include/ac/param.h
accesslog.o: ../../../include/ac/unistd.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
accesslog.o: ../../../include/lutil_lockf.h
accesslog.o: ../../../include/avl.h
accesslog.o: ../../../include/ldap_cdefs.h
accesslog.o: ../../../include/ldap_log.h
accesslog.o: ../../../include/ldap.h
accesslog.o: ../../../include/lber.h
accesslog.o: ../../../include/lber_types.h
accesslog.o: ../../../include/ldap_features.h
accesslog.o: ../../../include/ldap_schema.h
accesslog.o: ../../../include/lber_pvt.h
accesslog.o: ../../../include/ldap_pvt.h
accesslog.o: ../../../include/ldap_pvt_uc.h
accesslog.o: ../../../include/ac/bytes.h
accesslog.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
accesslog.o: ../../../include/ldap_pvt_thread.h
accesslog.o: ../../../include/ldap_int_thread.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
accesslog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
accesslog.o: ../../../include/ldap_queue.h
accesslog.o: ../proto-slap.h
accesslog.o: ../config.h
accesslog.o: ../../../include/lutil.h
accesslog.o: ../../../include/ldap_rq.h
auditlog.o: auditlog.c
auditlog.o: ../../../include/portable.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
auditlog.o: ../../../include/ac/fdset.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
auditlog.o: ../../../include/ldap_cdefs.h
auditlog.o: ../../../include/ldap_features.h
auditlog.o: ../../../include/ac/assert.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
auditlog.o: ../../../include/ac/localize.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
auditlog.o: ../../../include/ac/string.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
auditlog.o: ../../../include/ac/ctype.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/ctype.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
auditlog.o: ../slap.h
auditlog.o: ../../../include/ldap_defaults.h
auditlog.o: ../../../include/ldap_config.h
auditlog.o: ../../../include/ac/stdlib.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
auditlog.o: ../../../include/ac/syslog.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
auditlog.o: ../../../include/ac/regex.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
auditlog.o: ../../../include/ac/signal.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
auditlog.o: ../../../include/ac/socket.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
auditlog.o: ../../../include/ac/time.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
auditlog.o: ../../../include/ac/param.h
auditlog.o: ../../../include/ac/unistd.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
auditlog.o: ../../../include/lutil_lockf.h
auditlog.o: ../../../include/avl.h
auditlog.o: ../../../include/ldap_cdefs.h
auditlog.o: ../../../include/ldap_log.h
auditlog.o: ../../../include/ldap.h
auditlog.o: ../../../include/lber.h
auditlog.o: ../../../include/lber_types.h
auditlog.o: ../../../include/ldap_features.h
auditlog.o: ../../../include/ldap_schema.h
auditlog.o: ../../../include/lber_pvt.h
auditlog.o: ../../../include/ldap_pvt.h
auditlog.o: ../../../include/ldap_pvt_uc.h
auditlog.o: ../../../include/ac/bytes.h
auditlog.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
auditlog.o: ../../../include/ldap_pvt_thread.h
auditlog.o: ../../../include/ldap_int_thread.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
auditlog.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
auditlog.o: ../../../include/ldap_queue.h
auditlog.o: ../proto-slap.h
auditlog.o: ../config.h
auditlog.o: ../../../include/ldif.h
constraint.o: constraint.c
constraint.o: ../../../include/portable.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
constraint.o: ../../../include/ac/fdset.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
constraint.o: ../../../include/ldap_cdefs.h
constraint.o: ../../../include/ldap_features.h
constraint.o: ../../../include/ac/assert.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
constraint.o: ../../../include/ac/localize.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
constraint.o: ../../../include/ac/string.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
constraint.o: ../../../include/ac/socket.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
constraint.o: ../../../include/ac/regex.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
constraint.o: ../../../include/lutil.h
constraint.o: ../../../include/ldap_cdefs.h
constraint.o: ../../../include/lber_types.h
constraint.o: ../slap.h
constraint.o: ../../../include/ldap_defaults.h
constraint.o: ../../../include/ldap_config.h
constraint.o: ../../../include/ac/stdlib.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
constraint.o: ../../../include/ac/syslog.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
constraint.o: ../../../include/ac/signal.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
constraint.o: ../../../include/ac/time.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
constraint.o: ../../../include/ac/param.h
constraint.o: ../../../include/ac/unistd.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
constraint.o: ../../../include/lutil_lockf.h
constraint.o: ../../../include/avl.h
constraint.o: ../../../include/ldap_log.h
constraint.o: ../../../include/ldap.h
constraint.o: ../../../include/lber.h
constraint.o: ../../../include/ldap_features.h
constraint.o: ../../../include/ldap_schema.h
constraint.o: ../../../include/lber_pvt.h
constraint.o: ../../../include/ldap_pvt.h
constraint.o: ../../../include/ldap_pvt_uc.h
constraint.o: ../../../include/ac/bytes.h
constraint.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
constraint.o: ../../../include/ldap_pvt_thread.h
constraint.o: ../../../include/ldap_int_thread.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
constraint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
constraint.o: ../../../include/ldap_queue.h
constraint.o: ../proto-slap.h
constraint.o: ../config.h
dds.o: dds.c
dds.o: ../../../include/portable.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
dds.o: ../../../include/ac/fdset.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
dds.o: ../../../include/ldap_cdefs.h
dds.o: ../../../include/ldap_features.h
dds.o: ../../../include/ac/assert.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
dds.o: ../../../include/ac/localize.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
dds.o: ../../../include/ac/string.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
dds.o: ../../../include/ac/time.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
dds.o: ../slap.h
dds.o: ../../../include/ldap_defaults.h
dds.o: ../../../include/ldap_config.h
dds.o: ../../../include/ac/stdlib.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
dds.o: ../../../include/ac/syslog.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
dds.o: ../../../include/ac/regex.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
dds.o: ../../../include/ac/signal.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
dds.o: ../../../include/ac/socket.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
dds.o: ../../../include/ac/param.h
dds.o: ../../../include/ac/unistd.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
dds.o: ../../../include/lutil_lockf.h
dds.o: ../../../include/avl.h
dds.o: ../../../include/ldap_cdefs.h
dds.o: ../../../include/ldap_log.h
dds.o: ../../../include/ldap.h
dds.o: ../../../include/lber.h
dds.o: ../../../include/lber_types.h
dds.o: ../../../include/ldap_features.h
dds.o: ../../../include/ldap_schema.h
dds.o: ../../../include/lber_pvt.h
dds.o: ../../../include/ldap_pvt.h
dds.o: ../../../include/ldap_pvt_uc.h
dds.o: ../../../include/ac/bytes.h
dds.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
dds.o: ../../../include/ldap_pvt_thread.h
dds.o: ../../../include/ldap_int_thread.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
dds.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
dds.o: ../../../include/ldap_queue.h
dds.o: ../proto-slap.h
dds.o: ../../../include/lutil.h
dds.o: ../../../include/ldap_rq.h
dds.o: ../config.h
deref.o: deref.c
deref.o: ../../../include/portable.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
deref.o: ../../../include/ac/fdset.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
deref.o: ../../../include/ldap_cdefs.h
deref.o: ../../../include/ldap_features.h
deref.o: ../../../include/ac/assert.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
deref.o: ../../../include/ac/localize.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
deref.o: ../../../include/ac/string.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
deref.o: ../../../include/ac/socket.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
deref.o: ../slap.h
deref.o: ../../../include/ldap_defaults.h
deref.o: ../../../include/ldap_config.h
deref.o: ../../../include/ac/stdlib.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
deref.o: ../../../include/ac/syslog.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
deref.o: ../../../include/ac/regex.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
deref.o: ../../../include/ac/signal.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
deref.o: ../../../include/ac/time.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
deref.o: ../../../include/ac/param.h
deref.o: ../../../include/ac/unistd.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
deref.o: ../../../include/lutil_lockf.h
deref.o: ../../../include/avl.h
deref.o: ../../../include/ldap_cdefs.h
deref.o: ../../../include/ldap_log.h
deref.o: ../../../include/ldap.h
deref.o: ../../../include/lber.h
deref.o: ../../../include/lber_types.h
deref.o: ../../../include/ldap_features.h
deref.o: ../../../include/ldap_schema.h
deref.o: ../../../include/lber_pvt.h
deref.o: ../../../include/ldap_pvt.h
deref.o: ../../../include/ldap_pvt_uc.h
deref.o: ../../../include/ac/bytes.h
deref.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
deref.o: ../../../include/ldap_pvt_thread.h
deref.o: ../../../include/ldap_int_thread.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
deref.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
deref.o: ../../../include/ldap_queue.h
deref.o: ../proto-slap.h
deref.o: ../config.h
deref.o: ../../../include/lutil.h
dyngroup.o: dyngroup.c
dyngroup.o: ../../../include/portable.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
dyngroup.o: ../../../include/ac/fdset.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
dyngroup.o: ../../../include/ldap_cdefs.h
dyngroup.o: ../../../include/ldap_features.h
dyngroup.o: ../../../include/ac/assert.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
dyngroup.o: ../../../include/ac/localize.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
dyngroup.o: ../../../include/ac/string.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
dyngroup.o: ../../../include/ac/socket.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
dyngroup.o: ../../../include/lutil.h
dyngroup.o: ../../../include/ldap_cdefs.h
dyngroup.o: ../../../include/lber_types.h
dyngroup.o: ../slap.h
dyngroup.o: ../../../include/ldap_defaults.h
dyngroup.o: ../../../include/ldap_config.h
dyngroup.o: ../../../include/ac/stdlib.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
dyngroup.o: ../../../include/ac/syslog.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
dyngroup.o: ../../../include/ac/regex.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
dyngroup.o: ../../../include/ac/signal.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
dyngroup.o: ../../../include/ac/time.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
dyngroup.o: ../../../include/ac/param.h
dyngroup.o: ../../../include/ac/unistd.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
dyngroup.o: ../../../include/lutil_lockf.h
dyngroup.o: ../../../include/avl.h
dyngroup.o: ../../../include/ldap_log.h
dyngroup.o: ../../../include/ldap.h
dyngroup.o: ../../../include/lber.h
dyngroup.o: ../../../include/ldap_features.h
dyngroup.o: ../../../include/ldap_schema.h
dyngroup.o: ../../../include/lber_pvt.h
dyngroup.o: ../../../include/ldap_pvt.h
dyngroup.o: ../../../include/ldap_pvt_uc.h
dyngroup.o: ../../../include/ac/bytes.h
dyngroup.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
dyngroup.o: ../../../include/ldap_pvt_thread.h
dyngroup.o: ../../../include/ldap_int_thread.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
dyngroup.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
dyngroup.o: ../../../include/ldap_queue.h
dyngroup.o: ../proto-slap.h
dyngroup.o: ../config.h
dynlist.o: dynlist.c
dynlist.o: ../../../include/portable.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
dynlist.o: ../../../include/ac/fdset.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
dynlist.o: ../../../include/ldap_cdefs.h
dynlist.o: ../../../include/ldap_features.h
dynlist.o: ../../../include/ac/assert.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
dynlist.o: ../../../include/ac/localize.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
dynlist.o: ../../../include/ac/string.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
dynlist.o: ../slap.h
dynlist.o: ../../../include/ldap_defaults.h
dynlist.o: ../../../include/ldap_config.h
dynlist.o: ../../../include/ac/stdlib.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
dynlist.o: ../../../include/ac/syslog.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
dynlist.o: ../../../include/ac/regex.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
dynlist.o: ../../../include/ac/signal.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
dynlist.o: ../../../include/ac/socket.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
dynlist.o: ../../../include/ac/time.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
dynlist.o: ../../../include/ac/param.h
dynlist.o: ../../../include/ac/unistd.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
dynlist.o: ../../../include/lutil_lockf.h
dynlist.o: ../../../include/avl.h
dynlist.o: ../../../include/ldap_cdefs.h
dynlist.o: ../../../include/ldap_log.h
dynlist.o: ../../../include/ldap.h
dynlist.o: ../../../include/lber.h
dynlist.o: ../../../include/lber_types.h
dynlist.o: ../../../include/ldap_features.h
dynlist.o: ../../../include/ldap_schema.h
dynlist.o: ../../../include/lber_pvt.h
dynlist.o: ../../../include/ldap_pvt.h
dynlist.o: ../../../include/ldap_pvt_uc.h
dynlist.o: ../../../include/ac/bytes.h
dynlist.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
dynlist.o: ../../../include/ldap_pvt_thread.h
dynlist.o: ../../../include/ldap_int_thread.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
dynlist.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
dynlist.o: ../../../include/ldap_queue.h
dynlist.o: ../proto-slap.h
dynlist.o: ../config.h
dynlist.o: ../../../include/lutil.h
memberof.o: memberof.c
memberof.o: ../../../include/portable.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
memberof.o: ../../../include/ac/fdset.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
memberof.o: ../../../include/ldap_cdefs.h
memberof.o: ../../../include/ldap_features.h
memberof.o: ../../../include/ac/assert.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
memberof.o: ../../../include/ac/localize.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
memberof.o: ../../../include/ac/string.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
memberof.o: ../../../include/ac/socket.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
memberof.o: ../slap.h
memberof.o: ../../../include/ldap_defaults.h
memberof.o: ../../../include/ldap_config.h
memberof.o: ../../../include/ac/stdlib.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
memberof.o: ../../../include/ac/syslog.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
memberof.o: ../../../include/ac/regex.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
memberof.o: ../../../include/ac/signal.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
memberof.o: ../../../include/ac/time.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
memberof.o: ../../../include/ac/param.h
memberof.o: ../../../include/ac/unistd.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
memberof.o: ../../../include/lutil_lockf.h
memberof.o: ../../../include/avl.h
memberof.o: ../../../include/ldap_cdefs.h
memberof.o: ../../../include/ldap_log.h
memberof.o: ../../../include/ldap.h
memberof.o: ../../../include/lber.h
memberof.o: ../../../include/lber_types.h
memberof.o: ../../../include/ldap_features.h
memberof.o: ../../../include/ldap_schema.h
memberof.o: ../../../include/lber_pvt.h
memberof.o: ../../../include/ldap_pvt.h
memberof.o: ../../../include/ldap_pvt_uc.h
memberof.o: ../../../include/ac/bytes.h
memberof.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
memberof.o: ../../../include/ldap_pvt_thread.h
memberof.o: ../../../include/ldap_int_thread.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
memberof.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
memberof.o: ../../../include/ldap_queue.h
memberof.o: ../proto-slap.h
memberof.o: ../config.h
memberof.o: ../../../include/lutil.h
pcache.o: pcache.c
pcache.o: ../../../include/portable.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
pcache.o: ../../../include/ac/fdset.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
pcache.o: ../../../include/ldap_cdefs.h
pcache.o: ../../../include/ldap_features.h
pcache.o: ../../../include/ac/assert.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
pcache.o: ../../../include/ac/localize.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
pcache.o: ../../../include/ac/string.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
pcache.o: ../../../include/ac/time.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
pcache.o: ../slap.h
pcache.o: ../../../include/ldap_defaults.h
pcache.o: ../../../include/ldap_config.h
pcache.o: ../../../include/ac/stdlib.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
pcache.o: ../../../include/ac/syslog.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
pcache.o: ../../../include/ac/regex.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
pcache.o: ../../../include/ac/signal.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
pcache.o: ../../../include/ac/socket.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
pcache.o: ../../../include/ac/param.h
pcache.o: ../../../include/ac/unistd.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
pcache.o: ../../../include/lutil_lockf.h
pcache.o: ../../../include/avl.h
pcache.o: ../../../include/ldap_cdefs.h
pcache.o: ../../../include/ldap_log.h
pcache.o: ../../../include/ldap.h
pcache.o: ../../../include/lber.h
pcache.o: ../../../include/lber_types.h
pcache.o: ../../../include/ldap_features.h
pcache.o: ../../../include/ldap_schema.h
pcache.o: ../../../include/lber_pvt.h
pcache.o: ../../../include/ldap_pvt.h
pcache.o: ../../../include/ldap_pvt_uc.h
pcache.o: ../../../include/ac/bytes.h
pcache.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
pcache.o: ../../../include/ldap_pvt_thread.h
pcache.o: ../../../include/ldap_int_thread.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
pcache.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
pcache.o: ../../../include/ldap_queue.h
pcache.o: ../proto-slap.h
pcache.o: ../../../include/lutil.h
pcache.o: ../../../include/ldap_rq.h
pcache.o: ../back-monitor/back-monitor.h
pcache.o: ../back-monitor/proto-back-monitor.h
pcache.o: ../config.h
collect.o: collect.c
collect.o: ../../../include/portable.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
collect.o: ../../../include/ac/fdset.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
collect.o: ../../../include/ldap_cdefs.h
collect.o: ../../../include/ldap_features.h
collect.o: ../../../include/ac/assert.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
collect.o: ../../../include/ac/localize.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
collect.o: ../../../include/ac/string.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
collect.o: ../../../include/ac/socket.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
collect.o: ../slap.h
collect.o: ../../../include/ldap_defaults.h
collect.o: ../../../include/ldap_config.h
collect.o: ../../../include/ac/stdlib.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
collect.o: ../../../include/ac/syslog.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
collect.o: ../../../include/ac/regex.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
collect.o: ../../../include/ac/signal.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
collect.o: ../../../include/ac/time.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
collect.o: ../../../include/ac/param.h
collect.o: ../../../include/ac/unistd.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
collect.o: ../../../include/lutil_lockf.h
collect.o: ../../../include/avl.h
collect.o: ../../../include/ldap_cdefs.h
collect.o: ../../../include/ldap_log.h
collect.o: ../../../include/ldap.h
collect.o: ../../../include/lber.h
collect.o: ../../../include/lber_types.h
collect.o: ../../../include/ldap_features.h
collect.o: ../../../include/ldap_schema.h
collect.o: ../../../include/lber_pvt.h
collect.o: ../../../include/ldap_pvt.h
collect.o: ../../../include/ldap_pvt_uc.h
collect.o: ../../../include/ac/bytes.h
collect.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
collect.o: ../../../include/ldap_pvt_thread.h
collect.o: ../../../include/ldap_int_thread.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
collect.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
collect.o: ../../../include/ldap_queue.h
collect.o: ../proto-slap.h
collect.o: ../config.h
collect.o: ../../../include/lutil.h
ppolicy.o: ppolicy.c
ppolicy.o: ../../../include/portable.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
ppolicy.o: ../../../include/ac/fdset.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
ppolicy.o: ../../../include/ldap_cdefs.h
ppolicy.o: ../../../include/ldap_features.h
ppolicy.o: ../../../include/ac/assert.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
ppolicy.o: ../../../include/ac/localize.h
ppolicy.o: ../../../include/ldap.h
ppolicy.o: ../../../include/lber.h
ppolicy.o: ../../../include/lber_types.h
ppolicy.o: ../../../include/ldap_cdefs.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
ppolicy.o: ../../../include/ldap_features.h
ppolicy.o: ../../../include/lutil.h
ppolicy.o: ../slap.h
ppolicy.o: ../../../include/ldap_defaults.h
ppolicy.o: ../../../include/ldap_config.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
ppolicy.o: ../../../include/ac/stdlib.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
ppolicy.o: ../../../include/ac/syslog.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
ppolicy.o: ../../../include/ac/regex.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
ppolicy.o: ../../../include/ac/signal.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
ppolicy.o: ../../../include/ac/socket.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
ppolicy.o: ../../../include/ac/time.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
ppolicy.o: ../../../include/ac/param.h
ppolicy.o: ../../../include/ac/unistd.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
ppolicy.o: ../../../include/lutil_lockf.h
ppolicy.o: ../../../include/avl.h
ppolicy.o: ../../../include/ldap_log.h
ppolicy.o: ../../../include/ldap_schema.h
ppolicy.o: ../../../include/lber_pvt.h
ppolicy.o: ../../../include/ldap_pvt.h
ppolicy.o: ../../../include/ldap_pvt_uc.h
ppolicy.o: ../../../include/ac/bytes.h
ppolicy.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
ppolicy.o: ../../../include/ldap_pvt_thread.h
ppolicy.o: ../../../include/ldap_int_thread.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
ppolicy.o: ../../../include/ldap_queue.h
ppolicy.o: ../proto-slap.h
ppolicy.o: ../../../include/ac/errno.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/errno.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/errno.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/errno.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/errno.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/errno.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm-generic/errno-base.h
ppolicy.o: ../../../include/ac/string.h
ppolicy.o: ../../../include/ac/ctype.h
ppolicy.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/ctype.h
ppolicy.o: ../config.h
refint.o: refint.c
refint.o: ../../../include/portable.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
refint.o: ../../../include/ac/fdset.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
refint.o: ../../../include/ldap_cdefs.h
refint.o: ../../../include/ldap_features.h
refint.o: ../../../include/ac/assert.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
refint.o: ../../../include/ac/localize.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
refint.o: ../../../include/ac/string.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
refint.o: ../../../include/ac/socket.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
refint.o: ../slap.h
refint.o: ../../../include/ldap_defaults.h
refint.o: ../../../include/ldap_config.h
refint.o: ../../../include/ac/stdlib.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
refint.o: ../../../include/ac/syslog.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
refint.o: ../../../include/ac/regex.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
refint.o: ../../../include/ac/signal.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
refint.o: ../../../include/ac/time.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
refint.o: ../../../include/ac/param.h
refint.o: ../../../include/ac/unistd.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
refint.o: ../../../include/lutil_lockf.h
refint.o: ../../../include/avl.h
refint.o: ../../../include/ldap_cdefs.h
refint.o: ../../../include/ldap_log.h
refint.o: ../../../include/ldap.h
refint.o: ../../../include/lber.h
refint.o: ../../../include/lber_types.h
refint.o: ../../../include/ldap_features.h
refint.o: ../../../include/ldap_schema.h
refint.o: ../../../include/lber_pvt.h
refint.o: ../../../include/ldap_pvt.h
refint.o: ../../../include/ldap_pvt_uc.h
refint.o: ../../../include/ac/bytes.h
refint.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
refint.o: ../../../include/ldap_pvt_thread.h
refint.o: ../../../include/ldap_int_thread.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
refint.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
refint.o: ../../../include/ldap_queue.h
refint.o: ../proto-slap.h
refint.o: ../config.h
refint.o: ../../../include/ldap_rq.h
retcode.o: retcode.c
retcode.o: ../../../include/portable.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
retcode.o: ../../../include/ac/fdset.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
retcode.o: ../../../include/ldap_cdefs.h
retcode.o: ../../../include/ldap_features.h
retcode.o: ../../../include/ac/assert.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
retcode.o: ../../../include/ac/localize.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
retcode.o: ../../../include/ac/unistd.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
retcode.o: ../../../include/lutil_lockf.h
retcode.o: ../../../include/ac/string.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
retcode.o: ../../../include/ac/ctype.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/ctype.h
retcode.o: ../../../include/ac/socket.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
retcode.o: ../slap.h
retcode.o: ../../../include/ldap_defaults.h
retcode.o: ../../../include/ldap_config.h
retcode.o: ../../../include/ac/stdlib.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
retcode.o: ../../../include/ac/syslog.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
retcode.o: ../../../include/ac/regex.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
retcode.o: ../../../include/ac/signal.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
retcode.o: ../../../include/ac/time.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
retcode.o: ../../../include/ac/param.h
retcode.o: ../../../include/avl.h
retcode.o: ../../../include/ldap_cdefs.h
retcode.o: ../../../include/ldap_log.h
retcode.o: ../../../include/ldap.h
retcode.o: ../../../include/lber.h
retcode.o: ../../../include/lber_types.h
retcode.o: ../../../include/ldap_features.h
retcode.o: ../../../include/ldap_schema.h
retcode.o: ../../../include/lber_pvt.h
retcode.o: ../../../include/ldap_pvt.h
retcode.o: ../../../include/ldap_pvt_uc.h
retcode.o: ../../../include/ac/bytes.h
retcode.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
retcode.o: ../../../include/ldap_pvt_thread.h
retcode.o: ../../../include/ldap_int_thread.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
retcode.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
retcode.o: ../../../include/ldap_queue.h
retcode.o: ../proto-slap.h
retcode.o: ../config.h
retcode.o: ../../../include/lutil.h
retcode.o: ../../../include/ldif.h
rwm.o: rwm.c
rwm.o: ../../../include/portable.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
rwm.o: ../../../include/ac/fdset.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
rwm.o: ../../../include/ldap_cdefs.h
rwm.o: ../../../include/ldap_features.h
rwm.o: ../../../include/ac/assert.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
rwm.o: ../../../include/ac/localize.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
rwm.o: ../../../include/ac/string.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
rwm.o: ../slap.h
rwm.o: ../../../include/ldap_defaults.h
rwm.o: ../../../include/ldap_config.h
rwm.o: ../../../include/ac/stdlib.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
rwm.o: ../../../include/ac/syslog.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
rwm.o: ../../../include/ac/regex.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
rwm.o: ../../../include/ac/signal.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
rwm.o: ../../../include/ac/socket.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
rwm.o: ../../../include/ac/time.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
rwm.o: ../../../include/ac/param.h
rwm.o: ../../../include/ac/unistd.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
rwm.o: ../../../include/lutil_lockf.h
rwm.o: ../../../include/avl.h
rwm.o: ../../../include/ldap_cdefs.h
rwm.o: ../../../include/ldap_log.h
rwm.o: ../../../include/ldap.h
rwm.o: ../../../include/lber.h
rwm.o: ../../../include/lber_types.h
rwm.o: ../../../include/ldap_features.h
rwm.o: ../../../include/ldap_schema.h
rwm.o: ../../../include/lber_pvt.h
rwm.o: ../../../include/ldap_pvt.h
rwm.o: ../../../include/ldap_pvt_uc.h
rwm.o: ../../../include/ac/bytes.h
rwm.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
rwm.o: ../../../include/ldap_pvt_thread.h
rwm.o: ../../../include/ldap_int_thread.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
rwm.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
rwm.o: ../../../include/ldap_queue.h
rwm.o: ../proto-slap.h
rwm.o: ../config.h
rwm.o: ../../../include/lutil.h
rwm.o: rwm.h
rwm.o: ../../../include/rewrite.h
rwmconf.o: rwmconf.c
rwmconf.o: ../../../include/portable.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
rwmconf.o: ../../../include/ac/fdset.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
rwmconf.o: ../../../include/ldap_cdefs.h
rwmconf.o: ../../../include/ldap_features.h
rwmconf.o: ../../../include/ac/assert.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
rwmconf.o: ../../../include/ac/localize.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
rwmconf.o: ../../../include/ac/string.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
rwmconf.o: ../../../include/ac/socket.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
rwmconf.o: ../slap.h
rwmconf.o: ../../../include/ldap_defaults.h
rwmconf.o: ../../../include/ldap_config.h
rwmconf.o: ../../../include/ac/stdlib.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
rwmconf.o: ../../../include/ac/syslog.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
rwmconf.o: ../../../include/ac/regex.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
rwmconf.o: ../../../include/ac/signal.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
rwmconf.o: ../../../include/ac/time.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
rwmconf.o: ../../../include/ac/param.h
rwmconf.o: ../../../include/ac/unistd.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
rwmconf.o: ../../../include/lutil_lockf.h
rwmconf.o: ../../../include/avl.h
rwmconf.o: ../../../include/ldap_cdefs.h
rwmconf.o: ../../../include/ldap_log.h
rwmconf.o: ../../../include/ldap.h
rwmconf.o: ../../../include/lber.h
rwmconf.o: ../../../include/lber_types.h
rwmconf.o: ../../../include/ldap_features.h
rwmconf.o: ../../../include/ldap_schema.h
rwmconf.o: ../../../include/lber_pvt.h
rwmconf.o: ../../../include/ldap_pvt.h
rwmconf.o: ../../../include/ldap_pvt_uc.h
rwmconf.o: ../../../include/ac/bytes.h
rwmconf.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
rwmconf.o: ../../../include/ldap_pvt_thread.h
rwmconf.o: ../../../include/ldap_int_thread.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
rwmconf.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
rwmconf.o: ../../../include/ldap_queue.h
rwmconf.o: ../proto-slap.h
rwmconf.o: rwm.h
rwmconf.o: ../../../include/rewrite.h
rwmconf.o: ../../../include/lutil.h
rwmdn.o: rwmdn.c
rwmdn.o: ../../../include/portable.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
rwmdn.o: ../../../include/ac/fdset.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
rwmdn.o: ../../../include/ldap_cdefs.h
rwmdn.o: ../../../include/ldap_features.h
rwmdn.o: ../../../include/ac/assert.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
rwmdn.o: ../../../include/ac/localize.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
rwmdn.o: ../../../include/ac/string.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
rwmdn.o: ../../../include/ac/socket.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
rwmdn.o: ../slap.h
rwmdn.o: ../../../include/ldap_defaults.h
rwmdn.o: ../../../include/ldap_config.h
rwmdn.o: ../../../include/ac/stdlib.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
rwmdn.o: ../../../include/ac/syslog.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
rwmdn.o: ../../../include/ac/regex.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
rwmdn.o: ../../../include/ac/signal.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
rwmdn.o: ../../../include/ac/time.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
rwmdn.o: ../../../include/ac/param.h
rwmdn.o: ../../../include/ac/unistd.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
rwmdn.o: ../../../include/lutil_lockf.h
rwmdn.o: ../../../include/avl.h
rwmdn.o: ../../../include/ldap_cdefs.h
rwmdn.o: ../../../include/ldap_log.h
rwmdn.o: ../../../include/ldap.h
rwmdn.o: ../../../include/lber.h
rwmdn.o: ../../../include/lber_types.h
rwmdn.o: ../../../include/ldap_features.h
rwmdn.o: ../../../include/ldap_schema.h
rwmdn.o: ../../../include/lber_pvt.h
rwmdn.o: ../../../include/ldap_pvt.h
rwmdn.o: ../../../include/ldap_pvt_uc.h
rwmdn.o: ../../../include/ac/bytes.h
rwmdn.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
rwmdn.o: ../../../include/ldap_pvt_thread.h
rwmdn.o: ../../../include/ldap_int_thread.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
rwmdn.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
rwmdn.o: ../../../include/ldap_queue.h
rwmdn.o: ../proto-slap.h
rwmdn.o: rwm.h
rwmdn.o: ../../../include/rewrite.h
rwmmap.o: rwmmap.c
rwmmap.o: ../../../include/portable.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
rwmmap.o: ../../../include/ac/fdset.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
rwmmap.o: ../../../include/ldap_cdefs.h
rwmmap.o: ../../../include/ldap_features.h
rwmmap.o: ../../../include/ac/assert.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
rwmmap.o: ../../../include/ac/localize.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
rwmmap.o: ../../../include/ac/string.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
rwmmap.o: ../../../include/ac/socket.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
rwmmap.o: ../slap.h
rwmmap.o: ../../../include/ldap_defaults.h
rwmmap.o: ../../../include/ldap_config.h
rwmmap.o: ../../../include/ac/stdlib.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
rwmmap.o: ../../../include/ac/syslog.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
rwmmap.o: ../../../include/ac/regex.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
rwmmap.o: ../../../include/ac/signal.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
rwmmap.o: ../../../include/ac/time.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
rwmmap.o: ../../../include/ac/param.h
rwmmap.o: ../../../include/ac/unistd.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
rwmmap.o: ../../../include/lutil_lockf.h
rwmmap.o: ../../../include/avl.h
rwmmap.o: ../../../include/ldap_cdefs.h
rwmmap.o: ../../../include/ldap_log.h
rwmmap.o: ../../../include/ldap.h
rwmmap.o: ../../../include/lber.h
rwmmap.o: ../../../include/lber_types.h
rwmmap.o: ../../../include/ldap_features.h
rwmmap.o: ../../../include/ldap_schema.h
rwmmap.o: ../../../include/lber_pvt.h
rwmmap.o: ../../../include/ldap_pvt.h
rwmmap.o: ../../../include/ldap_pvt_uc.h
rwmmap.o: ../../../include/ac/bytes.h
rwmmap.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
rwmmap.o: ../../../include/ldap_pvt_thread.h
rwmmap.o: ../../../include/ldap_int_thread.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
rwmmap.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
rwmmap.o: ../../../include/ldap_queue.h
rwmmap.o: ../proto-slap.h
rwmmap.o: rwm.h
rwmmap.o: ../../../include/rewrite.h
rwmmap.o: ../../../libraries/libldap/ldap-int.h
rwmmap.o: ../../../libraries/libldap/../liblber/lber-int.h
rwmmap.o: ../../../include/lutil.h
seqmod.o: seqmod.c
seqmod.o: ../../../include/portable.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
seqmod.o: ../../../include/ac/fdset.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
seqmod.o: ../../../include/ldap_cdefs.h
seqmod.o: ../../../include/ldap_features.h
seqmod.o: ../../../include/ac/assert.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
seqmod.o: ../../../include/ac/localize.h
seqmod.o: ../slap.h
seqmod.o: ../../../include/ldap_defaults.h
seqmod.o: ../../../include/ldap_config.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
seqmod.o: ../../../include/ac/stdlib.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
seqmod.o: ../../../include/ac/syslog.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
seqmod.o: ../../../include/ac/regex.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
seqmod.o: ../../../include/ac/signal.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
seqmod.o: ../../../include/ac/socket.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
seqmod.o: ../../../include/ac/time.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
seqmod.o: ../../../include/ac/param.h
seqmod.o: ../../../include/ac/unistd.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
seqmod.o: ../../../include/lutil_lockf.h
seqmod.o: ../../../include/avl.h
seqmod.o: ../../../include/ldap_cdefs.h
seqmod.o: ../../../include/ldap_log.h
seqmod.o: ../../../include/ldap.h
seqmod.o: ../../../include/lber.h
seqmod.o: ../../../include/lber_types.h
seqmod.o: ../../../include/ldap_features.h
seqmod.o: ../../../include/ldap_schema.h
seqmod.o: ../../../include/lber_pvt.h
seqmod.o: ../../../include/ldap_pvt.h
seqmod.o: ../../../include/ldap_pvt_uc.h
seqmod.o: ../../../include/ac/bytes.h
seqmod.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
seqmod.o: ../../../include/ldap_pvt_thread.h
seqmod.o: ../../../include/ldap_int_thread.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
seqmod.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
seqmod.o: ../../../include/ldap_queue.h
seqmod.o: ../proto-slap.h
seqmod.o: ../config.h
seqmod.o: ../../../include/ac/string.h
sssvlv.o: sssvlv.c
sssvlv.o: ../../../include/portable.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
sssvlv.o: ../../../include/ac/fdset.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
sssvlv.o: ../../../include/ldap_cdefs.h
sssvlv.o: ../../../include/ldap_features.h
sssvlv.o: ../../../include/ac/assert.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
sssvlv.o: ../../../include/ac/localize.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
sssvlv.o: ../../../include/ac/string.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
sssvlv.o: ../../../include/ac/ctype.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/ctype.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
sssvlv.o: ../../../include/avl.h
sssvlv.o: ../../../include/ldap_cdefs.h
sssvlv.o: ../slap.h
sssvlv.o: ../../../include/ldap_defaults.h
sssvlv.o: ../../../include/ldap_config.h
sssvlv.o: ../../../include/ac/stdlib.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
sssvlv.o: ../../../include/ac/syslog.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
sssvlv.o: ../../../include/ac/regex.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
sssvlv.o: ../../../include/ac/signal.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
sssvlv.o: ../../../include/ac/socket.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
sssvlv.o: ../../../include/ac/time.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
sssvlv.o: ../../../include/ac/param.h
sssvlv.o: ../../../include/ac/unistd.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
sssvlv.o: ../../../include/lutil_lockf.h
sssvlv.o: ../../../include/ldap_log.h
sssvlv.o: ../../../include/ldap.h
sssvlv.o: ../../../include/lber.h
sssvlv.o: ../../../include/lber_types.h
sssvlv.o: ../../../include/ldap_features.h
sssvlv.o: ../../../include/ldap_schema.h
sssvlv.o: ../../../include/lber_pvt.h
sssvlv.o: ../../../include/ldap_pvt.h
sssvlv.o: ../../../include/ldap_pvt_uc.h
sssvlv.o: ../../../include/ac/bytes.h
sssvlv.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
sssvlv.o: ../../../include/ldap_pvt_thread.h
sssvlv.o: ../../../include/ldap_int_thread.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
sssvlv.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
sssvlv.o: ../../../include/ldap_queue.h
sssvlv.o: ../proto-slap.h
sssvlv.o: ../../../include/lutil.h
sssvlv.o: ../config.h
sssvlv.o: ../../../libraries/liblber/lber-int.h
syncprov.o: syncprov.c
syncprov.o: ../../../include/portable.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
syncprov.o: ../../../include/ac/fdset.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
syncprov.o: ../../../include/ldap_cdefs.h
syncprov.o: ../../../include/ldap_features.h
syncprov.o: ../../../include/ac/assert.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
syncprov.o: ../../../include/ac/localize.h
syncprov.o: ../../../include/ac/string.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
syncprov.o: ../../../include/lutil.h
syncprov.o: ../../../include/ldap_cdefs.h
syncprov.o: ../../../include/lber_types.h
syncprov.o: ../slap.h
syncprov.o: ../../../include/ldap_defaults.h
syncprov.o: ../../../include/ldap_config.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
syncprov.o: ../../../include/ac/stdlib.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
syncprov.o: ../../../include/ac/syslog.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
syncprov.o: ../../../include/ac/regex.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
syncprov.o: ../../../include/ac/signal.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
syncprov.o: ../../../include/ac/socket.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
syncprov.o: ../../../include/ac/time.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
syncprov.o: ../../../include/ac/param.h
syncprov.o: ../../../include/ac/unistd.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
syncprov.o: ../../../include/lutil_lockf.h
syncprov.o: ../../../include/avl.h
syncprov.o: ../../../include/ldap_log.h
syncprov.o: ../../../include/ldap.h
syncprov.o: ../../../include/lber.h
syncprov.o: ../../../include/ldap_features.h
syncprov.o: ../../../include/ldap_schema.h
syncprov.o: ../../../include/lber_pvt.h
syncprov.o: ../../../include/ldap_pvt.h
syncprov.o: ../../../include/ldap_pvt_uc.h
syncprov.o: ../../../include/ac/bytes.h
syncprov.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
syncprov.o: ../../../include/ldap_pvt_thread.h
syncprov.o: ../../../include/ldap_int_thread.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
syncprov.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
syncprov.o: ../../../include/ldap_queue.h
syncprov.o: ../proto-slap.h
syncprov.o: ../config.h
syncprov.o: ../../../include/ldap_rq.h
translucent.o: translucent.c
translucent.o: ../../../include/portable.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
translucent.o: ../../../include/ac/fdset.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
translucent.o: ../../../include/ldap_cdefs.h
translucent.o: ../../../include/ldap_features.h
translucent.o: ../../../include/ac/assert.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
translucent.o: ../../../include/ac/localize.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
translucent.o: ../../../include/ac/string.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
translucent.o: ../../../include/ac/socket.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
translucent.o: ../slap.h
translucent.o: ../../../include/ldap_defaults.h
translucent.o: ../../../include/ldap_config.h
translucent.o: ../../../include/ac/stdlib.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
translucent.o: ../../../include/ac/syslog.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
translucent.o: ../../../include/ac/regex.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
translucent.o: ../../../include/ac/signal.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
translucent.o: ../../../include/ac/time.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
translucent.o: ../../../include/ac/param.h
translucent.o: ../../../include/ac/unistd.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
translucent.o: ../../../include/lutil_lockf.h
translucent.o: ../../../include/avl.h
translucent.o: ../../../include/ldap_cdefs.h
translucent.o: ../../../include/ldap_log.h
translucent.o: ../../../include/ldap.h
translucent.o: ../../../include/lber.h
translucent.o: ../../../include/lber_types.h
translucent.o: ../../../include/ldap_features.h
translucent.o: ../../../include/ldap_schema.h
translucent.o: ../../../include/lber_pvt.h
translucent.o: ../../../include/ldap_pvt.h
translucent.o: ../../../include/ldap_pvt_uc.h
translucent.o: ../../../include/ac/bytes.h
translucent.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
translucent.o: ../../../include/ldap_pvt_thread.h
translucent.o: ../../../include/ldap_int_thread.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
translucent.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
translucent.o: ../../../include/ldap_queue.h
translucent.o: ../proto-slap.h
translucent.o: ../../../include/lutil.h
translucent.o: ../config.h
unique.o: unique.c
unique.o: ../../../include/portable.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
unique.o: ../../../include/ac/fdset.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
unique.o: ../../../include/ldap_cdefs.h
unique.o: ../../../include/ldap_features.h
unique.o: ../../../include/ac/assert.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
unique.o: ../../../include/ac/localize.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
unique.o: ../../../include/ac/string.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
unique.o: ../../../include/ac/socket.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
unique.o: ../slap.h
unique.o: ../../../include/ldap_defaults.h
unique.o: ../../../include/ldap_config.h
unique.o: ../../../include/ac/stdlib.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
unique.o: ../../../include/ac/syslog.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
unique.o: ../../../include/ac/regex.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
unique.o: ../../../include/ac/signal.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
unique.o: ../../../include/ac/time.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
unique.o: ../../../include/ac/param.h
unique.o: ../../../include/ac/unistd.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
unique.o: ../../../include/lutil_lockf.h
unique.o: ../../../include/avl.h
unique.o: ../../../include/ldap_cdefs.h
unique.o: ../../../include/ldap_log.h
unique.o: ../../../include/ldap.h
unique.o: ../../../include/lber.h
unique.o: ../../../include/lber_types.h
unique.o: ../../../include/ldap_features.h
unique.o: ../../../include/ldap_schema.h
unique.o: ../../../include/lber_pvt.h
unique.o: ../../../include/ldap_pvt.h
unique.o: ../../../include/ldap_pvt_uc.h
unique.o: ../../../include/ac/bytes.h
unique.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
unique.o: ../../../include/ldap_pvt_thread.h
unique.o: ../../../include/ldap_int_thread.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
unique.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
unique.o: ../../../include/ldap_queue.h
unique.o: ../proto-slap.h
unique.o: ../config.h
valsort.o: valsort.c
valsort.o: ../../../include/portable.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stddef.h
valsort.o: ../../../include/ac/fdset.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/types.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/features.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/predefs.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/cdefs.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wordsize.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/gnu/stubs.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/typesizes.h
valsort.o: ../../../include/ldap_cdefs.h
valsort.o: ../../../include/ldap_features.h
valsort.o: ../../../include/ac/assert.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/assert.h
valsort.o: ../../../include/ac/localize.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdio.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/libio.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/_G_config.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/wchar.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include/stdarg.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/stdio_lim.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sys_errlist.h
valsort.o: ../../../include/ac/string.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/string.h
valsort.o: ../../../include/ac/ctype.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/ctype.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/endian.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/endian.h
valsort.o: ../slap.h
valsort.o: ../../../include/ldap_defaults.h
valsort.o: ../../../include/ldap_config.h
valsort.o: ../../../include/ac/stdlib.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdlib.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/types.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/time.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/select.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/select.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigset.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/time.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/sysmacros.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/pthreadtypes.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/alloca.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/limits.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../lib/gcc/arm-mv5sft-linux-gnueabi/4.3.2/include-fixed/syslimits.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/limits.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix1_lim.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/local_lim.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/limits.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix2_lim.h
valsort.o: ../../../include/ac/syslog.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/syslog.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/syslog.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/syslog-path.h
valsort.o: ../../../include/ac/regex.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/regex.h
valsort.o: ../../../include/ac/signal.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/signal.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/signum.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/siginfo.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigaction.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigcontext.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sigcontext.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigstack.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sigthread.h
valsort.o: ../../../include/ac/socket.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/poll.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/poll.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/poll.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/socket.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/uio.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/uio.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/socket.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sockaddr.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/socket.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/sockios.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/un.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/in.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/stdint.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/wchar.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/in.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/byteswap.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netinet/tcp.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/inet.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/param.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/linux/param.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/asm/param.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/bitypes.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/arpa/nameser_compat.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/netdb.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/rpc/netdb.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/netdb.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/resolv.h
valsort.o: ../../../include/ac/time.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sys/time.h
valsort.o: ../../../include/ac/param.h
valsort.o: ../../../include/ac/unistd.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/unistd.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/posix_opt.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/confname.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/getopt.h
valsort.o: ../../../include/lutil_lockf.h
valsort.o: ../../../include/avl.h
valsort.o: ../../../include/ldap_cdefs.h
valsort.o: ../../../include/ldap_log.h
valsort.o: ../../../include/ldap.h
valsort.o: ../../../include/lber.h
valsort.o: ../../../include/lber_types.h
valsort.o: ../../../include/ldap_features.h
valsort.o: ../../../include/ldap_schema.h
valsort.o: ../../../include/lber_pvt.h
valsort.o: ../../../include/ldap_pvt.h
valsort.o: ../../../include/ldap_pvt_uc.h
valsort.o: ../../../include/ac/bytes.h
valsort.o: ../../../include/../libraries/liblunicode/ucdata/ucdata.h
valsort.o: ../../../include/ldap_pvt_thread.h
valsort.o: ../../../include/ldap_int_thread.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/pthread.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/sched.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/sched.h
valsort.o: /opt_gccarm/arm-mv5sft-linux-gnueabi/bin/../arm-mv5sft-linux-gnueabi//sys-root/usr/include/bits/setjmp.h
valsort.o: ../../../include/ldap_queue.h
valsort.o: ../proto-slap.h
valsort.o: ../config.h
valsort.o: ../../../include/lutil.h

# IF YOU PUT ANYTHING HERE IT WILL GO AWAY
