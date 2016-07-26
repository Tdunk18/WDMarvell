#!/bin/sh

num=$#

if [ "$num" != "2" ]; then
   echo "Please Input LED color"
   echo "Glacier_led_test.sh color action"
   echo "color: red/blue/green/white/yellow"
   echo "action: on/off/blinking"
   exit 0
fi

led hd0 red off
led hd1 red off
led hd0 blue off
mem_rw -w -t 1 -o 0x18148 -v 8000
    
if [ "$1" = "blue" ]; then
  #red
  if [ "$2" = "on" ]; then
    led hd0 red on
  elif [ "$2" = "off" ]; then
    led hd0 red off
  elif [ "$2" = "blinking" ]; then
    led hd0 red blinking
  fi
elif [ "$1" = "green" ]; then
  #Green
  if [ "$2" = "on" ]; then
    led hd0 blue on
  elif [ "$2" = "off" ]; then
    led hd0 blue off
  elif [ "$2" = "blinking" ]; then
    led hd0 blue on
    mem_rw -w -t 1 -o 0x18148 -v 0x02000000
  fi
elif [ "$1" = "red" ]; then
  #Blue
  if [ "$2" = "on" ]; then
    led hd1 red on
  elif [ "$2" = "off" ]; then
    led hd1 red off
  elif [ "$2" = "blinking" ]; then
    led hd1 red blinking
  fi
elif [ "$1" = "yellow" ]; then
  #yellow (R+G)
  if [ "$2" = "on" ]; then
    led hd1 red on
    led hd0 blue on
  elif [ "$2" = "off" ]; then
    led hd1 red off
    led hd0 blue off
  elif [ "$2" = "blinking" ]; then
    led hd1 red blinking
    led hd0 blue on
    mem_rw -w -t 1 -o 0x18148 -v 0x02100000
  fi
elif [ "$1" = "white" ]; then
  #white (R+G+B)
  if [ "$2" = "on" ]; then
    #while solid
    led hd0 red on
    led hd1 red on
    led hd0 blue on
  elif [ "$2" = "off" ]; then
    mem_rw -w -t 1 -o 0x18148 -v 8000
  elif [ "$2" = "blinking" ]; then
    #while blinking
    mem_rw -w -t 1 -o 0x18148 -v 0x82b00000
  fi
fi
