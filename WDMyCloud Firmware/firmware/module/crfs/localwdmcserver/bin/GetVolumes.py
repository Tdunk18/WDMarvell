#!/usr/bin/python

import sqlite3
import sys

print "<?xml version = \"1.0\"?>"
print "<Volumes>"

con = sqlite3.connect ('/usr/local/nas/orion/orion.db')

with con:
    cur = con.cursor ()
    cur.execute ("SELECT base_path, is_connected FROM Volumes where dynamic_volume != 'true'")
    while True:
        row = cur.fetchone ()
        if row == None:
            break
        if row[1] == 'true':
            print "    <Volume>" + row[0] + "</Volume>"

print "</Volumes>"
