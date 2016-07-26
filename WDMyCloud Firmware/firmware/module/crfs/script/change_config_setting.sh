#!/bin/bash

nas_model_name=`xmldbc -g /hw_ver`

case ${nas_model_name} in
  WDMyCloudMirror)
    xmldbc -s "/app_mgr/upnpavserver/enable" "1"
    ;;
esac
