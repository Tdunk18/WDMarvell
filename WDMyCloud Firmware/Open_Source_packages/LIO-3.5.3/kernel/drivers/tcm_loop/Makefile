CWD=$(shell pwd)
AUTOCONFIG=$(CWD)/../../../autoconfig --write-to-file --current-directory=$(CWD)
include $(shell $(AUTOCONFIG))

obj-m				+=	tcm_loop.o
tcm_loop-objs			:=	tcm_loop_fabric.o \
					tcm_loop_fabric_scsi.o \
					tcm_loop_configfs.o

ifeq ($(ALPHA_CUSTOMIZE),1)
EXTRA_CFLAGS += -DALPHA_CUSTOMIZE
endif

EXTRA_CFLAGS+=-I$(CWD)/drivers/tcm_loop/ -I$(CWD)/drivers/scsi/ -I$(CWD)/../../include -I$(CWD) -I$(CWD)../target/

all:
	$(MAKE) -C $(KERNEL_DIR) SUBDIRS=$(CWD) modules CWD=$(CWD) ARCH=$(ARCH) KBUILD_VERBOSE=0

install ins:
	mkdir -p /lib/modules/`uname -r`/extra
	cp -f tcm_loop.ko /lib/modules/`uname -r`/extra
	depmod -ae



clean:
	rm -f $(foreach prog,$(iscsi_target_mod-objs) $(obj-m),$(CWD)/$(prog)) $(CWD)/tcm_loop.mod.o
	rm -f tcm_loop.ko tcm_loop.mod.c
	rm -f .*.cmd ../common/.*.cmd .make_autoconfig *~
	rm -fr .tmp_versions
