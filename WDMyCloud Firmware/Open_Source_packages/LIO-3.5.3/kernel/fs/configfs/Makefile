#
# Makefile for the configfs virtual filesystem
#

CWD=$(shell pwd)
AUTOCONFIG=$(CWD)/../../../autoconfig --write-to-file --current-directory=$(CWD)
include $(shell $(AUTOCONFIG))

obj-m		+= configfs.o

configfs-objs	:= inode.o file.o dir.o symlink.o mount.o item.o

EXTRA_CFLAGS+=-I$(CWD)

all:
	$(MAKE) -C $(KERNEL_DIR) SUBDIRS=$(CWD) modules CWD=$(CWD) ARCH=$(ARCH) KBUILD_VERBOSE=0

install ins:
	mkdir -p /lib/modules/`uname -r`/kernel/fs/configfs
	cp -f configfs.ko /lib/modules/`uname -r`/kernel/fs/configfs
	depmod -ae



clean:
	rm -f $(foreach prog,$(configfs-objs) $(obj-m),$(CWD)/$(prog)) $(CWD)/configfs.mod.o
	rm -f configfs.ko configfs.mod.c
	rm -f .*.cmd ../common/.*.cmd .make_autoconfig *~
	rm -fr .tmp_versions Module.*
