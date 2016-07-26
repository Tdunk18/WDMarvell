KRB5LIBS=-L/home/ben/unic-gpl/ADS/krb5-1.7.1/src/../../../_xinstall/LIGHTNING-4A/lib -Wl,-rpath -Wl,/home/ben/unic-gpl/ADS/krb5-1.7.1/src/../../../_xinstall/LIGHTNING-4A/lib -L/home/ben/unic-gpl/ADS/krb5-1.7.1/src/../../../_xinstall/LIGHTNING-4A/lib -L/home/ben/unic-gpl/ADS/krb5-1.7.1/src/../../../_xinstall/LIGHTNING-4A/lib -Wl,-rpath -Wl,/home/ben/unic-gpl/ADS/krb5-1.7.1/src/../../../_xinstall/LIGHTNING-4A/lib -L/home/ben/unic-gpl/ADS/krb5-1.7.1/src/../../../_xinstall/LIGHTNING-4A/lib -lgssapi_krb5 -lkrb5 -lk5crypto -lcom_err -lresolv -ldl
LDAP_LIBS=-lldap -llber 
LIBS=-lresolv -lnsl -ldl -lrt -liconv -lrt -lpthread -lnetapi -ltdb -ltalloc
DEVELOPER_CFLAGS=-DDEBUG_PASSWORD -DDEVELOPER -g -Wall -Wshadow -Wpointer-arith -Wcast-align -Wwrite-strings
CCFLAGS=-I../ -L../../../bin  -I/home/ben/unic-gpl/ADS/krb5-1.7.1/src/../../../_xinstall/LIGHTNING-4A/include -DPROJECT_NAME=\"LIGHTNING-4A\" -DPROJECT_LIGHTNING_4A=1 -DLIGHTNING_4A=1 -DALPHA_CUSTOMIZE=1 -DPROJECT_FEATURE_UNIC=1 -DPROJECT_FEATURE_CUSTOM_WD=1 -DPROJECT_FEATURE_MCU_CHIP_69P803=1 -DPROJECT_FEATURE_RTC_CHIP_IDT1337G=1 -DPROJECT_FEATURE_BAYS=4 -DPROJECT_FEATURE_BAYS_4=1 -DPROJECT_FEATURE_VOLUME_ENCRYPTION=1 -DPROJECT_FEATURE_IPV6=1 -DPROJECT_FEATURE_VLAN=1 -DPROJECT_FEATURE_BONDING=1 -DPROJECT_FEATURE_OLED=1 -DPROJECT_FEATURE_SNMP=1 -DPROJECT_FEATURE_LAN_PORT=2 -DPROJECT_FEATURE_LAN_PORTS_2=1 -DPROJECT_FEATURE_BURN_IN_uP=1 -DPROJECT_FEATURE_UART_CMD_AUTO_POWER_RECOVERY=1 -DPROJECT_FEATURE_SCHEDULE_POWER_ON=1 -DPROJECT_FEATURE_MYPHOTO=1 -DPROJECT_FEATURE_MYMUSIC=1 -DPROJECT_FEATURE_MYSQL=1 -DPROJECT_FEATURE_ADS=1 -DPROJECT_FEATURE_CONFIG_FILESYSTEM=\"UBIFS\" -DPROJECT_FEATURE_CHIP_MV6282=1 -DPROJECT_FEATURE_REMOVE_REBOOT=1 -DPROJECT_FEATURE_ADDONS=1 -DPROJECT_FEATURE_USBMOUNT_C_CODE=1 -DPROJECT_FEATURE_UPDATE_FIRMWARE_FROM_USB=1 -DPROJECT_FEATURE_ALERT_MESSAGE=1 -DPROJECT_FEATURE_WRITE_KEY_SERIAL=1 -DPROJECT_FEATURE_UNLOCKING_USB=1 -DPROJECT_FEATURE_SSH_PASSWORD=1 -DPROJECT_FEATURE_USB_SHARE_PRODUCT_NAME=1 -DPROJECT_FEATURE_UPDATE_UBOOT=1 -DPROJECT_FEATURE_HDD_WHITE_LIST=1 -DPROJECT_FEATURE_NO_FORMAT_ENTIRE_VOLUME=1 -DPROJECT_FEATURE_DISKMGR_FORMATTING_SIZE_IN_GB_NOT_GiB=1 -DPROJECT_FEATURE_SQUASHFS_LZMA=1 -I/home/ben/unic/module/include -I/home/ben/unic/module/include/openssl-1.0.1c -I/home/ben/unic/module/include/sqlite-3.7.17 -D_REENTRANT -D_POSIX_PTHREAD_SEMANTICS $(FLAGS) -D_SAMBA_BUILD_=3 $(GTK_FLAGS)
CC=arm-mv5sft-linux-gnueabi-gcc
PICFLAG=-fPIC
LDFLAGS= -L/home/ben/unic-gpl/ADS/krb5-1.7.1/src/../../../_xinstall/LIGHTNING-4A/lib -Wl,-rpath -Wl,/home/ben/unic-gpl/ADS/krb5-1.7.1/src/../../../_xinstall/LIGHTNING-4A/lib -L/home/ben/unic-gpl/ADS/krb5-1.7.1/src/../../../_xinstall/LIGHTNING-4A/lib -L/home/ben/unic/module/lib/LIGHTNING-4A -L./bin -L/home/ben/unic-gpl/samba-4.0.9/source3/../../_xinstall/LIGHTNING-4A/lib
DYNEXP=-Wl,--export-dynamic
NETAPI_LIBS=$(LIBS) $(KRB5LIBS) $(LDAP_LIBS)
CMDLINE_LIBS=$(NETAPI_LIBS) $(POPT_OBJ)

# Compile a source file.
COMPILE_CC = $(CC) -I. $(CCFLAGS) $(PICFLAG) -c $< -o $@
COMPILE = $(COMPILE_CC)

PROGS = bin/netapitest

all: $(PROGS)

MAKEDIR = || exec false; \
	  if test -d "$$dir"; then :; else \
	  echo mkdir "$$dir"; \
	  mkdir -p "$$dir" >/dev/null 2>&1 || \
	  test -d "$$dir" || \
	  mkdir "$$dir" || \
	  exec false; fi || exec false

BINARY_PREREQS = bin/.dummy

bin/.dummy:
	@if (: >> $@ || : > $@) >/dev/null 2>&1; then :; else \
	  dir=bin $(MAKEDIR); fi
	@: >> $@ || : > $@ # what a fancy emoticon!

.c.o:
	@if (: >> $@ || : > $@) >/dev/null 2>&1; then rm -f $@; else \
	 dir=`echo $@ | sed 's,/[^/]*$$,,;s,^$$,.,'` $(MAKEDIR); fi
	@echo Compiling $*.c
	@$(COMPILE) && exit 0;\
		echo "The following command failed:" 1>&2;\
		echo "$(COMPILE_CC)" 1>&2;\
		$(COMPILE_CC) >/dev/null 2>&1

CMDLINE_OBJ = common.o
NETAPIBUFFER_OBJ = netapibuffer.o
NETAPITEST_OBJ = netapitest.o netlocalgroup.o netuser.o netgroup.o netdisplay.o netshare.o netfile.o netserver.o $(CMDLINE_OBJ)

bin/netapitest: $(BINARY_PREREQS) $(NETAPITEST_OBJ)
	@echo Linking $@
	@$(CC) $(CCFLAGS) -o $@ $(NETAPITEST_OBJ) $(LDFLAGS) $(DYNEXP) $(CMDLINE_LIBS)

clean:
	-rm -f $(PROGS)
	-rm -f core */*~ *~ \
		*/*.o */*/*.o */*/*/*.o

