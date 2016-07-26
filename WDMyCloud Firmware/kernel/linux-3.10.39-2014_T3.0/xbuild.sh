#!/bin/sh

export KBUILD_BUILD_USER=kman
export KBUILD_BUILD_HOST=kmachine
export KCFLAGS="-DALPHA_CUSTOMIZE"
export BASEVERSION=2014T30p5
export BUILDNO=git$(git rev-parse --verify --short HEAD)

build()
{
	if [ -z "$ARCH" ] ; then
		echo "do \"export ARCH=arm\" first."
		exit 1
	fi

	if [[ "$CROSS_COMPILE" != "arm-marvell-linux-gnueabi-" ]]; then
		export CROSS_COMPILE=arm-marvell-linux-gnueabi-
		export PATH=/opt_gccarm/armv7-marvell-linux-gnueabi-softfp_i686_64K_Dev_20131002/bin:$PATH
	fi

	cp arch/arm/boot/dts/GrandTeton/* arch/arm/boot/dts/

	rm -f arch/arm/boot/zImage .version

	make zImage || exit 1
	make dtbs || exit 1

	cat arch/arm/boot/zImage arch/arm/boot/dts/armada-385-db.dtb > arch/arm/boot/zImage_dtb || exit 1
	rm -f arch/arm/boot/zImage
	mv arch/arm/boot/zImage_dtb arch/arm/boot/zImage

	./scripts/mkuboot.sh -A arm -O linux -T kernel -C none -a 0x00008000 -e 0x00008000 -n 'Linux-382' -d arch/arm/boot/zImage arch/arm/boot/uImage || exit 1

	make modules || exit 1

	# netatop
	export KERNELDIR=`pwd`
	make clean -C ../netatop-0.5
	make all -C ../netatop-0.5 || exit 1

	rm -f arch/arm/boot/dts/armada-385-db.dts
	rm -f arch/arm/boot/dts/armada-385-rd.dts
	rm -f arch/arm/boot/dts/armada-388-rd.dts
	rm -f arch/arm/boot/dts/armada-38x.dtsi
}

install()
{
	cp -avf arch/arm/boot/uImage ${ROOTDIR}/merge/${PROJECT_NAME}/

	if [ -n "${ROOT_FS}" ] ; then
		# for iSCSI Target
		cp -avf \
			./drivers/target/iscsi/iscsi_target_mod.ko \
			./drivers/target/target_core_mod.ko \
			./drivers/target/target_core_file.ko \
			./drivers/target/target_core_iblock.ko \
			${ROOT_FS}/driver/

		# for Virtual Volume
		cp -avf \
			./drivers/scsi/scsi_transport_iscsi.ko \
			./drivers/scsi/iscsi_tcp.ko \
			./drivers/scsi/libiscsi_tcp.ko \
			./drivers/scsi/libiscsi.ko \
			${ROOT_FS}/driver/

		cp -avf drivers/net/bonding/bonding.ko   ${ROOT_FS}/driver/
		cp -avf net/ipv4/tunnel4.ko              ${ROOT_FS}/driver/
		cp -avf net/ipv6/ipv6.ko                 ${ROOT_FS}/driver/
		cp -avf net/ipv6/sit.ko                  ${ROOT_FS}/driver/
		cp -avf net/ipv6/xfrm6_mode_beet.ko      ${ROOT_FS}/driver/
		cp -avf net/ipv6/xfrm6_mode_transport.ko ${ROOT_FS}/driver/
		cp -avf net/ipv6/xfrm6_mode_tunnel.ko    ${ROOT_FS}/driver/
		cp -avf net/ipv4/ipip.ko                 ${ROOT_FS}/driver/
		cp -avf net/ipv6/tunnel6.ko              ${ROOT_FS}/driver/
		cp -avf net/ipv6/ip6_tunnel.ko           ${ROOT_FS}/driver/
		cp -avf drivers/net/tun.ko               ${ROOT_FS}/driver/
		
		                
		mkdir -p ${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/VPN/lib/modules
		cp -avf drivers/net/ppp/bsd_comp.ko			${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/VPN/lib/modules
		cp -avf drivers/net/ppp/ppp_async.ko        ${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/VPN/lib/modules
		cp -avf drivers/net/ppp/ppp_deflate.ko      ${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/VPN/lib/modules
		cp -avf drivers/net/ppp/ppp_generic.ko      ${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/VPN/lib/modules
		cp -avf drivers/net/ppp/ppp_mppe.ko         ${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/VPN/lib/modules
		cp -avf drivers/net/ppp/ppp_synctty.ko      ${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/VPN/lib/modules
		cp -avf drivers/net/ppp/pppoe.ko            ${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/VPN/lib/modules
		cp -avf drivers/net/ppp/pppox.ko            ${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/VPN/lib/modules
		cp -avf drivers/net/slip/slhc.ko			${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/VPN/lib/modules
		cp -avf lib/crc-ccitt.ko					${MODULE_DIR}/apkg/addons/${PROJECT_NAME}/VPN/lib/modules
		
		# Docker dependencies
        cp -avf \
            net/netfilter/nf_conntrack.ko \
            net/netfilter/nf_nat.ko \
            net/netfilter/x_tables.ko \
            net/netfilter/xt_addrtype.ko \
            net/netfilter/xt_conntrack.ko \
            net/netfilter/xt_nat.ko \
            net/netfilter/xt_tcpudp.ko \
            net/ipv4/netfilter/ip_tables.ko \
            net/ipv4/netfilter/nf_nat_ipv4.ko \
            net/ipv4/netfilter/nf_defrag_ipv4.ko \
            net/ipv4/netfilter/nf_conntrack_ipv4.ko \
            net/ipv4/netfilter/iptable_nat.ko \
            net/ipv4/netfilter/ipt_MASQUERADE.ko \
            net/ipv4/netfilter/iptable_filter.ko \
            net/llc/llc.ko \
            net/802/stp.ko \
            net/bridge/bridge.ko \
            ${ROOT_FS}/driver/
            
		# netatop
		cp -avf ../netatop-0.5/module/netatop.ko ${ROOT_FS}/driver/
		
		# btrfs
		cp -avf fs/btrfs/btrfs.ko ${ROOT_FS}/driver/
		
	fi
}

clean()
{
	make clean
}

if [ "$1" = "build" ]; then
	build
elif [ "$1" = "install" ]; then
	install
elif [ "$1" = "clean" ]; then
	clean
else
	echo "Usage : $0 <build|install|clean>"
fi
