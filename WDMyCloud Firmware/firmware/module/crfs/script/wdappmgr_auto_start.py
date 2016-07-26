#!/usr/bin/python

import subprocess
import time
import json
import os
import syslog
import sys
import getopt
import glob

retry_count = 5
retry_timeout = 1
app_start_gap = 1

def get_app_list():
    global retry_count
    global retry_timeout
    got_list = False
    for i in range( retry_count ):
        p = subprocess.Popen( [ "curl", "--unix-socket", "/var/run/wdappmgr.sock", "http://localhost/LocalApps" ], stdout=subprocess.PIPE )
        out, err = p.communicate()
        if p.returncode != 0:
            time.sleep( retry_timeout )
            continue
        got_list = True
        break
    if not got_list:
        raise RuntimeError( "failed to get App list" )
    return json.loads( out )

def start_app( app_name ):
    p = subprocess.Popen( [ "curl", "--unix-socket", "/var/run/wdappmgr.sock", "-X", "POST","-d", "{ \"AppName\":\"" + app_name + "\" }", "http://localhost/ActiveApps" ], stdout=subprocess.PIPE )
    out, err = p.communicate()
    if p.returncode != 0:
        raise RuntimeError( "failed to start app: " + app_name )

def auto_start_apps():
    # get app listing
    try:
        app_list = get_app_list()
    except Exception:
        syslog.syslog( syslog.LOG_ERR, "wdappmgr_auto_start failed to get app list from wdappmgr " )
        sys.exit(1)

    # iterate app list to start app with auto start set to true
    for app in app_list:
        if 'AutoStart' not in app:
            continue
        if not app[ 'AutoStart' ]:
            print "wdappmgr_auto_start App: " + app[ 'Name' ] + " AutoStart not enabled. Skipping."
            continue
        if app[ 'Running' ]:
            print "wdappmgr_auto_start App: " + app[ 'Name' ] + " is already running. Skipping."
            continue
        try:
            print "wdappmgr_auto_start starting App: " + app[ 'Name' ] + "."
            start_app( app[ 'Name' ] )
            time.sleep( app_start_gap )
        except Exception:
            syslog.syslog( syslog.LOG_ERR, "wdappmgr_auto_start failed to start " + app[ 'Name' ] )
    print "wdappmgr_auto_start done"

def wait_docker_exit():
    docker_tries = 5
    docker_try_sleep = 1
    docker_exit = False
    for i in range( docker_tries ):
        p = subprocess.Popen( [ "pidof", "docker" ], stdout=subprocess.PIPE )
        out, err = p.communicate()
        if p.returncode == 0:
            print "wdappmgr_auto_start: waiting for docker daemon to exit..."
            time.sleep( docker_try_sleep )
            continue
        docker_exit = True
        break
    if not docker_exit:
        msg = "wdappmgr_auto_start: Docker is still running after multiple wait attempts. Aborting"
        print msg
        syslog.syslog( syslog.LOG_ERR, msg )
        sys.exit( 1 )

def change_wd_app_exit_code():
    wait_docker_exit()
    apps_path = "/mnt/HD/HD_a2/Nas_Prog/_wdappmgr/apps/"
    containers_path = "/var/lib/docker/containers/"
    wd_apps = {}
    try:
        app_dirs = glob.glob( apps_path + "*" )
    except Exception:
        syslog.syslog( syslog.LOG_ERR, "wdappmgr_auto_start failed to list app directories" )
    # gather a list of wd apps and corresponding container ids
    for app_dir in app_dirs:
        try:
            #print "processing app dir: " + app_dir
            if not os.path.exists( app_dir + "/runtime.json" ):
                continue
            #print "processing app runtime config: " + app_dir
            with open( app_dir + "/runtime.json" ) as runtime_fd:
                runtime = json.load( runtime_fd )
                if 'container_id' not in runtime:
                    continue
                #print "setting app: " + app_dir + " with cid: " + runtime[ 'container_id' ]
                wd_apps[ app_dir ] = runtime[ 'container_id' ]
        except Exception:
            syslog.syslog( syslog.LOG_ERR, "wdappmgr_auto_start failed to modify exit code for app: " + app_dir )
    for app_name in wd_apps:
        cid = wd_apps[ app_name ]
        docker_config_path = containers_path + cid + "/config.json"
        temp_docker_config_path = containers_path + cid + "/wdappmgr_config.json"
        try:
            if not os.path.exists( containers_path + cid + "/config.json" ):
                continue
            #print "processing app: " + app_name
            with open( docker_config_path, 'r' ) as config_fd:
                config = json.load( config_fd )
            if 'State' not in config:
                continue
            if 'ExitCode' not in config[ 'State' ]:
                continue
            if config[ 'State' ][ 'ExitCode' ] == 0:
                continue
            config[ 'State' ][ 'ExitCode' ] = 0
            with open( temp_docker_config_path, 'w' ) as new_config_fd:
                # flush back to file
                print "modifying: " + containers_path + cid + "/config.json"
                json.dump( config, new_config_fd )
            os.rename( temp_docker_config_path, docker_config_path )
            print "wdappmgr_auto_start modified app: " + app_name + "exit code to 0"
        except Exception:
            syslog.syslog( syslog.LOG_ERR, "wdappmgr_auto_start failed to modify recorded exit code for app: " + app_name )
    print "wdappmgr_auto_start finished modifying wd apps exit code"
def main(argv):
    run_prep = False
    run_start = False
    try:
        opts, args = getopt.getopt( argv, "ps", [ "prepare", "start" ] )
    except getopt.GetoptError:
        print "wdappmgr_auto_start.py --prepare|--start"
        sys.exit(2)
    for opt, arg in opts:
        if opt in ( "-p", "--prepare" ):
            run_prep = True
        elif opt in ( "-s", "--start" ):
            run_start = True
    if run_prep:
        change_wd_app_exit_code()
    if run_start:
        auto_start_apps()


if __name__ == "__main__":
    main( sys.argv[1:] )
