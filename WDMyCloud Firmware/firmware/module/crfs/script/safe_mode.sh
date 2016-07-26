#!/bin/sh

if [ "${1}" = "1" ]; then
  touch /tmp/system_safing_mode
  kill_running_process >/dev/null
elif [ "${1}" = "0" ]; then
  touch /tmp/load_module_reload
else
  echo "Not Support"
fi
