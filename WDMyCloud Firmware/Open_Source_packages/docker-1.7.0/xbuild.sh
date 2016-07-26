#! /bin/sh

unset CFLAGS
unset LDFLAGS
unset LIBS

# Docker build requires docker to be installed.  Instructions are located at
# https://docs.docker.com/v1.4/installation/ubuntulinux/

source ../xcp.sh

# Docker last commit from https://github.com/docker/docker/releases for the VERSION in ./VERSION
DOCKER_GITCOMMIT=0baf609

# Version
VERSION=`cat ./VERSION`
DOCKER_BINARY=docker-${VERSION}

DOCKER_BUILD_FILES_DIR=`pwd`/../docker-build-files

xbuild()
{
    # The default Docker build system only builds daemon for the native system (amd64).
    #
    # The following changes were made in order to cross-compile a Docker daemon for ARM 32K page size.
    # - Create Dockerfile.arm_32k to perform the following:
    #    . Inject lib32 package into docker build image in order to run ARM cross build toolchain
    #    . Inject the ARM cross build GCC toolchain into docker build image; installed at /opt_gccarm
    #    . Patch Go 1.4.2 for ARM 32K page size
    # - Add Docker build dependencies to ARM GCC toolchain's sysroot dir:
    #    . btrfs-progs-v4.0
    #    . LVM2.2.02.114 (libdevmapper.a)
    #    . sqlite3 (libsqlite3.a)
    #    . e2fsprogs-1.42.12
    #    . attr-2.4.47
    #    . acl-2.2.52
    #    . lzo-2.09
    #    . zlib-1.2.8
    #    . util-linux-2.26.2
    # - Modify hack/make/cross to add linux/arm as a supported platform for Docker daemon 
    #   in cross-compile
    # - Modify hack/make/binary to use additional build flags and ARM toolchain for Docker build
    #    . Specify CGO_ENABLED=1
    #    . Use ARM GCC cross compiler as CC_FOR_TARGET
    #    . Remove Apparmor and Selinux from ARM daemon build
    #    . Work-around sqlite3 linking issue
    # - Makefile.wd modified to pass additional flags to Docker build image
    #    . target 'cross' is modified to remove building 'binary' first; only builds 'cross'
    # - Dockerfiles and modified ARM GCC toolchain are in the docker-build-files directory
   
    [ -d ${DOCKER_BUILD_FILES_DIR} ] || (echo "Error: docker-build-files directory not found." && exit 1)
    
    # Used as the image name of the docker build image
    GIT_BRANCH=
    
    # Points to ARM cross compiler; passed to the docker build container
    ARM_CC=
    
    # The docker build target (cross is modified in Makefile.wd file to only build cross)
    TARGET=
    
    if [ "${TARGET_HOST}" == "arm-marvell-linux-gnueabi" ]; then
        GIT_BRANCH=arm_build
        TARGET=cross
        ARM_CC=${CROSS_COMPILE}gcc
        cp -vf Dockerfile.arm_32k Dockerfile
        cp -vf ${DOCKER_BUILD_FILES_DIR}/armv7-marvell-linux-gnueabi-softfp_i686_64K_Dev_20131002.docker_build.tar.gz .
        cp -vf ${DOCKER_BUILD_FILES_DIR}/go_arm_32k_patch.diff .
    elif [ "${TARGET_HOST}" == "x86_64-intel-linux-gnu" ]; then
        GIT_BRANCH=build
        TARGET=binary
        ARM_CC=
        cp -vf Dockerfile.orig Dockerfile
    else
        echo "Platform not supported: ${TARGET_HOST}"
        exit 1
    fi
        
    sudo make -f Makefile.wd \
        BINDDIR=. \
        GIT_BRANCH=${GIT_BRANCH} \
        DOCKER_GITCOMMIT=${DOCKER_GITCOMMIT} \
        DOCKER_CROSSPLATFORMS=linux/arm \
        ARM_CC=${ARM_CC} \
        ${TARGET}
}

xinstall()
{
    if [ "${TARGET_HOST}" == "arm-marvell-linux-gnueabi" ]; then
        xcp ./bundles/${VERSION}/cross/linux/arm/${DOCKER_BINARY} ${ROOT_FS}/usrsbin/docker
    elif [ "${TARGET_HOST}" == "x86_64-intel-linux-gnu" ]; then
        xcp ./bundles/${VERSION}/binary/${DOCKER_BINARY} ${ROOT_FS}/usrsbin/docker
    else
        echo "Platform not supported: ${TARGET_HOST}"
        exit 1
    fi
}

xclean()
{
	if [ -d bundles ]; then
        sudo rm -rf bundles
    fi
    
    rm -f go_arm_32k_patch.diff
    rm -f armv7-marvell-linux-gnueabi-softfp_i686_64K_Dev_20131002.docker_build.tar.gz
    
    echo "To start over, you need to delete the docker build image and any containers associated with it."
    echo " sudo docker rm <cid>    ## Remove any docker build containers."
    echo " sudo docker rmi <image> ## Remove any docker:build or docker:arm_build images."
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

