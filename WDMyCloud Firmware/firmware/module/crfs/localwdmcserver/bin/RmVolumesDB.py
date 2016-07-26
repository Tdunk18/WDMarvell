#!/usr/bin/python

'''
Updated and modified RmVolumesDB that uses the WD_HDD env variable to figure out the location
of the artifacts and uses the volume_id from the Volumes table
'''
import sqlite3
import sys
import os

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
                cmd = 'rm -rf ' + os.environ['WD_HDD'] + '/usb_' + volume_id + '/.wdmc'
                print cmd
                os.system(cmd)
            except:
                continue
        else:
            try:
                cmd = 'rm -rf ' + base_path + '/.wdmc'
                print cmd
                os.system(cmd)
            except:
                continue
