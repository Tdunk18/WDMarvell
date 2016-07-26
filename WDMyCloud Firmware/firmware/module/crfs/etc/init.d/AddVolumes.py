#!/usr/bin/python

import sqlite3
import sys
import os

wdmc_pipe="/tmp/WDMCDispatcher.pipe"

def send_volume_add_to_crawler( base_path, volume_id, internal_volume ):
    xml = '<?xml version="1.0"?>\
    <volume_data  version="1.0">\
    <id>volume_add</id>\
    <source>"source"</source>\
    <volume>\
    <base_path>' + base_path + '</base_path>\
    <mount_point>' + base_path + '</mount_point>\
    <dev_name>dev_name</dev_name>\
    <drive_path_raw>drive_path_raw</drive_path_raw>\
    <volume_id_fs_label>volume_id_fs_label</volume_id_fs_label>\
    <volume_id>' + volume_id + '</volume_id>\
    <volume_id_fs_type>volume_id_fs_type</volume_id_fs_type>\
    <volume_mount_time>1</volume_mount_time>\
    <volume_read_only>false</volume_read_only>\
    <volume_scratch></volume_scratch>\
    <internal_volume>' + internal_volume + '</internal_volume>\
    </volume>\
    </volume_data>'
    data = '\x00\x00\x00\x00'
    wdmcpipe = os.open(wdmc_pipe, os.O_WRONLY | os.O_NONBLOCK)
    if wdmcpipe:
        os.write(wdmcpipe, xml)
        os.write(wdmcpipe, buffer(data))
        os.close(wdmcpipe)
    
    return

con = sqlite3.connect ('/usr/local/nas/orion/orion.db')

with con:
    cur = con.cursor ()
    cur.execute ("SELECT volume_id, base_path, dynamic_volume FROM Volumes where is_connected = 'true'")
    while True:
        row = cur.fetchone ()
        if row == None:
            break
        base_path = row[1]
        volume_id = row[0]
        if row[2] == 'true':
            try:     
                send_volume_add_to_crawler( base_path, volume_id, 'false' )
            except:
                continue
        else:
            try:
                send_volume_add_to_crawler( base_path, volume_id, 'true' )
            except:
                continue
