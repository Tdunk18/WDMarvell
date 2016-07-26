CWD=$(shell pwd)
AUTOCONFIG=$(CWD)/autoconfig --write-to-file --current-directory=$(CWD)
include $(shell $(AUTOCONFIG))

all:
ifeq ($(CONFIGFS_BACKPORT), 1)
	make -C kernel/fs/configfs all
	-if test -f kernel/fs/configfs/Module.symvers ; then cp kernel/fs/configfs/Module.symvers kernel/drivers/target/; fi;
endif
	make -C kernel/drivers/target all
	-if test -f kernel/drivers/target/Module.symvers ; then cp kernel/drivers/target/Module.symvers kernel/drivers/lio-core/; fi;
	make -C kernel/drivers/lio-core all
	-if test -f kernel/drivers/target/Module.symvers ; then cp kernel/drivers/target/Module.symvers kernel/drivers/tcm_loop/; fi;
	make -C kernel/drivers/tcm_loop all

install: all
ifeq ($(CONFIGFS_BACKPORT), 1)
	make -C kernel/fs/configfs install
endif
	make -C kernel/drivers/target install
	make -C kernel/drivers/lio-core install
	make -C kernel/drivers/tcm_loop install

kernel_rpms: all
ifeq ($(CONFIGFS_BACKPORT), 1)
	./autoconfig make_configfs_rpm
endif
	./autoconfig make_target_kernel_rpm

configfs-backport-source-deb:
ifeq ($(CONFIGFS_BACKPORT), 1)
	-if test -s debian ; then unlink debian; fi;
	-ln -s debian-configfs-backport debian;
	dpkg-buildpackage -rfakeroot
	-if test -f kernel/fs/configfs/Module.symvers ; then cp kernel/fs/configfs/Module.symvers kernel/drivers/target/; fi;
endif

configfs-backport-source-deb-nosign:
ifeq ($(CONFIGFS_BACKPORT), 1)
	-if test -s debian ; then unlink debian; fi;
	-ln -s debian-configfs-backport debian;
	dpkg-buildpackage -rfakeroot -us -uc
	-if test -f kernel/fs/configfs/Module.symvers ; then cp kernel/fs/configfs/Module.symvers kernel/drivers/target/; fi;
endif

configfs-backport-clean-deb:
ifeq ($(CONFIGFS_BACKPORT), 1)
	-if test -s debian ; then unlink debian; fi;
	-ln -s debian-configfs-backport debian;
	debian/rules clean
endif

target_core_mod-source-deb:
	-if test -s debian ; then unlink debian; fi;
	-ln -s debian-target_core_mod debian;
	dpkg-buildpackage -rfakeroot
	-if test -f kernel/drivers/target/Module.symvers ; then cp kernel/drivers/target/Module.symvers kernel/drivers/lio-core/; fi;

target_core_mod-source-deb-nosign:
	-if test -s debian ; then unlink debian; fi;
	 -ln -s debian-target_core_mod debian;
	dpkg-buildpackage -rfakeroot -us -uc
	-if test -f kernel/drivers/target/Module.symvers ; then cp kernel/drivers/target/Module.symvers kernel/drivers/lio-core/; fi;

target_core_mod-clean-deb:
	-if test -s debian ; then unlink debian; fi;
	-ln -s debian-target_core_mod debian;
	-if test -f kernel/drivers/target/Module.symvers ; then rm -rf kernel/drivers/target/Module.symvers; fi;
	debian/rules clean

iscsi_target_mod-source-deb:
	-if test -s debian ; then unlink debian; fi;
	-ln -s debian-iscsi_target_mod debian;
	dpkg-buildpackage -rfakeroot

iscsi_target_mod-source-deb-nosign:
	-if test -s debian ; then unlink debian; fi;
	-ln -s debian-iscsi_target_mod debian;
	dpkg-buildpackage -rfakeroot -us -uc

iscsi_target_mod-clean-deb:
	-if test -s debian ; then unlink debian; fi;
	-ln -s debian-iscsi_target_mod debian;
	-if test -f kernel/drivers/lio-core/Module.symvers ; then rm -rf kernel/drivers/lio-core/Module.symvers; fi;
	debian/rules clean

kernel_source-debs: configfs-backport-source-deb target_core_mod-source-deb iscsi_target_mod-source-deb

kernel_source-debs-nosign: configfs-backport-source-deb-nosign target_core_mod-source-deb-nosign iscsi_target_mod-source-deb-nosign

kernel_clean-debs: configfs-backport-clean-deb target_core_mod-clean-deb iscsi_target_mod-clean-deb

clean:
ifeq ($(CONFIGFS_BACKPORT), 1)
	make -C kernel/fs/configfs clean
endif
	-if test -f kernel/drivers/target/Module.symvers ; then rm -rf kernel/drivers/target/Module.symvers; fi;
	make -C kernel/drivers/target clean
	-if test -f kernel/drivers/lio-core/Module.symvers ; then rm -rf kernel/drivers/lio-core/Module.symvers; fi;
	make -C kernel/drivers/lio-core clean
	-if test -f kernel/drivers/tcm_loop/Module.symvers ; then rm -rf kernel/drivers/tcm_loop/Module.symvers; fi;
	make -C kernel/drivers/tcm_loop clean
