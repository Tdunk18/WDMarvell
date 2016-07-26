#!/bin/sh

num=$#

if [ "$num" != "1" ]; then
  echo "1Please run compare_image.sh msw5 or compare_image.sh msw6"
  exit 0
fi

if [ "$1" != "msw5" -a "$1" != "msw6" ]; then
  echo "2Please run compare_image.sh msw5 or compare_image.sh msw6"
  exit 0
fi

if [ ! -d /mnt/HD/HD_a2 ];then
  echo "Please Insert HD (must HD_a2)"
  exit 
fi

model_name=`xmldbc -g /hw_ver`
if [ "$model_name" = "WDMyCloudEX4" ];then
  model_name=LIGHTNING-4A
  image_name=LIGHTNING-4A-image.cfs.cmp
else
  image_name=${model_name}-image.cfs.cmp
fi

cd /mnt/HD/HD_a2

rm -f tmp.tar.gz
rm -f ${image_name}

echo "copy compare files"
if [ "$1" == "msw5" ];then
  cp -f /mnt/tmp5/firmware_compare/${model_name}/* .
else
  cp -f /mnt/tmp6/firmware_compare/${model_name}/* .
fi

if [ -e tmp.tar.gz ];then
  echo ""
  echo "decompress tmp.tar.gz"
  rm -rf tmp
  tar zxf tmp.tar.gz
else
  echo "can not find tmp.tar.gz"
  exit 0
fi

if [ -e ${image_name} ]; then
  echo ""
  echo "mount $image_name"
  mkdir /tmp/tmp_image
  mount -t squashfs -o loop /mnt/HD/HD_a2/${image_name} /tmp/tmp_image
else
  echo "can not find ${image_name}"
  exit 0
fi

echo ""
echo "compare /mnt/HD/HD_a2/tmp and /tmp/tmp_image files"
diff -rq /mnt/HD/HD_a2/tmp /tmp/tmp_image

echo ""
echo "compare /mnt/HD/HD_a2/tmp and /usr/local/modules files"
diff -rq /mnt/HD/HD_a2/tmp /usr/local/modules

umount /tmp/tmp_image
rm -rf /tmp/tmp_image