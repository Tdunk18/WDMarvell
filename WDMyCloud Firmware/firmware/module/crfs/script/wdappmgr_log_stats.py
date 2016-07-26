#!/usr/bin/python

import sys
import json
import subprocess
import syslog
import shlex

app_list = []
got_app_list = False

def get_app_list():
    global app_list
    global got_app_list
    if got_app_list:
        return
    p = subprocess.Popen( [ "curl", "--unix-socket", "/var/run/wdappmgr.sock", "http://localhost/LocalApps" ], stdout=subprocess.PIPE )
    out, err = p.communicate()
    if p.returncode != 0:
        raise RuntimeError( "failed to get app list" )
    app_list = json.loads( out )
    got_app_list = True

def log_apps_info():
    # get list of apps
    global app_list
    get_app_list()
    running_apps = 0
    for app in app_list:
        if 'Running' in app and app['Running']:
            running_apps += 1
    # log num of apps and running apps
    wdlog_cmd = [ "wdlog", "-l", "INFO", "-s", "wdappmgrlog", "-m", "wdAppCnt", "cnt:int=" + str(len( app_list )), "rcnt:int=" + str(running_apps) ];
    p = subprocess.Popen( wdlog_cmd, stdout=subprocess.PIPE )
    p.communicate();
    if p.returncode != 0:
        raise RuntimeError( "failed to log app info" )

def stats_container( cid ):
    p = subprocess.Popen( [ "curl", "-m", "3", "--unix-socket", "/var/run/docker.sock", "http://localhost/containers/" + cid + "/stats?stream=0" ], stdout=subprocess.PIPE )
    out, err = p.communicate();
    if p.returncode != 0:
        raise RuntimeError( "failed to stats container" )
    return json.loads( out )

def run_command( cmd ):
    p = subprocess.Popen( cmd, stdout=subprocess.PIPE )
    out, err = p.communicate()
    if p.returncode != 0:
        print "failed to run command: " + cmd

def log_app_network_usage( network, log_cmd ):
    if 'rx_bytes' in network:
        log_cmd.append( "rKb:longlong=" + str( network['rx_bytes'] ) )
    if 'tx_bytes' in network:
        log_cmd.append( "tKb:longlong=" + str( network['tx_bytes'] ) )
#    if 'rx_packets' in network:
#        log_cmd.append( "rx_packets:longlong=" + str( network['rx_packets'] ) )
#    if 'rx_errors' in network:
#        log_cmd.append( "rx_errors:longlong=" + str( network['rx_errors'] ) )
#    if 'rx_dropped' in network:
#        log_cmd.append( "rx_dropped:longlong=" + str( network['rx_dropped'] ) )
#    if 'tx_packets' in network:
#        log_cmd.append( "tx_packets:longlong=" + str( network['tx_packets'] ) )
#    if 'tx_errors' in network:
#        log_cmd.append( "tx_errors:longlong=" + str( network['tx_errors'] ) )
#    if 'tx_dropped' in network:
#        log_cmd.append( "tx_dropped:longlong=" + str( network['tx_dropped'] ) )

def log_app_cpu_usage( cpu_stats, precpu_stats, log_cmd ):
    if 'cpu_usage' in cpu_stats and \
            'cpu_usage' in precpu_stats and \
            'total_usage' in cpu_stats['cpu_usage'] and \
            'total_usage' in precpu_stats['cpu_usage'] and \
            'system_cpu_usage' in cpu_stats and \
            'system_cpu_usage' in precpu_stats:
        cpu_percent = 0.0
        cpu_delta = ( cpu_stats['cpu_usage']['total_usage'] - precpu_stats['cpu_usage']['total_usage'] ) * 1.0
        system_delta = ( cpu_stats['system_cpu_usage'] - precpu_stats['system_cpu_usage'] ) * 1.0
        if cpu_delta > 0.0 and system_delta > 0.0:
            cpu_percent = ( cpu_delta / system_delta ) * len( cpu_stats['cpu_usage']['percpu_usage'] ) * 100.0
            log_cmd.append( "cPerc:float=" + str( cpu_percent ) )

#    if 'cpu_usage' in cpu_stats:
#        if 'total_usage' in cpu_stats['cpu_usage']:
#            log_cmd.append( "cpu_total_usage:longlong=" + str( cpu_stats['cpu_usage']['total_usage']) )
#        index = 0
#        if 'percpu_usage' in cpu_stats['cpu_usage']:
#            for usage in cpu_stats['cpu_usage']['percpu_usage']:
#                log_cmd.append( "cpu_" + str(index) + "_usage:longlong=" + str( usage ) )
#                index += 1
#        if 'usage_in_kernelmode' in cpu_stats['cpu_usage']:
#            log_cmd.append( "usage_kernel:longlong=" + str( cpu_stats['cpu_usage']['usage_in_kernelmode']) )
#        if 'usage_in_usermode' in cpu_stats['cpu_usage']:
#            log_cmd.append( "usage_user:longlong=" + str( cpu_stats['cpu_usage']['usage_in_usermode']) )
#    if 'system_cpu_usage' in cpu_stats:
#        log_cmd.append( "system_cpu_usage:longlong=" + str( cpu_stats['system_cpu_usage'] ) )
#    if 'throttling_data' in cpu_stats:
#        if 'periods' in cpu_stats['throttling_data']:
#            log_cmd.append( "throttling_periods:longlong=" + str( cpu_stats['throttling_data']['periods']) )
#        if 'throttled_periods' in cpu_stats['throttling_data']:
#            log_cmd.append( "throttled_periods:longlong=" + str( cpu_stats['throttling_data']['throttled_periods']) )
#        if 'throttled_time' in cpu_stats['throttling_data']:
#            log_cmd.append( "throttled_time:longlong=" + str( cpu_stats['throttling_data']['throttled_time']) )

def log_app_memory_usage( memory_stats, log_cmd ):
    if 'max_usage' in memory_stats:
        log_cmd.append( "mxKb:longlong=" + str( memory_stats['max_usage'] / 1024 ) )
    if 'stats' in memory_stats:
        if 'total_rss' in memory_stats['stats']:
            log_cmd.append( "rssKb:longlong=" + str( memory_stats['stats']['total_rss'] / 1024 ) )
        if 'total_cache' in memory_stats['stats']:
            log_cmd.append( "cchKb:longlong=" + str( memory_stats['stats']['total_cache'] / 1024 ) )
        if 'total_swap' in memory_stats['stats']:
            log_cmd.append( "swpKb:longlong=" + str( memory_stats['stats']['total_swap'] / 1024 ) )
#    if 'usage' in memory_stats:
#        log_cmd.append( "usage:longlong=" + str( memory_stats['usage'] ) )
#    if 'failcnt' in memory_stats:
#        log_cmd.append( "failcnt:longlong=" + str( memory_stats['failcnt'] ) )
#    if 'limit' in memory_stats:
#        log_cmd.append( "limit:longlong=" + str( memory_stats['limit'] ) )
#    if 'stats' in memory_stats:
#        for stat in memory_stats['stats']:
#            log_cmd.append( stat + ":longlong=" + str( memory_stats['stats'][ stat ] ) )

def log_app_blkio_entry_list( name, blkio_stats, log_cmd ):
    index = 0
    if  name in blkio_stats:
        prefix = name + '_' + str( index ) + "_"
        index += 1
        for stat in blkio_stats[ name ]:
            if 'major' in stat:
                log_cmd.append( prefix + "major:longlong=" + str( stat['major'] ) )
            if 'minor' in stat:
                log_cmd.append( prefix + "minor:longlong=" + str( stat['minor'] ) )
            if 'op' in stat:
                log_cmd.append( prefix + "op:string=" + stat['op'] )
            if 'value' in stat:
                log_cmd.append( prefix + "value:longlong=" + str( stat['value'] ) )    

def log_app_blkio_usage( app, blkio_stats ):
    log_app_blkio_entry_list( 'io_service_bytes_recursive', blkio_stats, log_cmd )
    log_app_blkio_entry_list( 'io_serviced_recursive', blkio_stats, log_cmd )
    log_app_blkio_entry_list( 'io_queue_recursive', blkio_stats, log_cmd )
    log_app_blkio_entry_list( 'io_service_time_recursive', blkio_stats, log_cmd )
    log_app_blkio_entry_list( 'io_wait_time_recursive', blkio_stats, log_cmd )
    log_app_blkio_entry_list( 'io_merged_recursive', blkio_stats, log_cmd )
    log_app_blkio_entry_list( 'io_time_recursive', blkio_stats, log_cmd )
    log_app_blkio_entry_list( 'sectors_recursive', blkio_stats, log_cmd )

def log_apps_usage():
    global app_list
    get_app_list()
    for app in app_list:
        if 'Name' not in app:
            continue
        if 'Running' not in app:
            continue
        if not app['Running']:
            continue
        try:
            app_info = stats_container( app['Name'] )
        except Exception:
            print "failed to stats container"
            continue
        log_cmd = [ "wdlog", "-l", "INFO", "-s", "wdappmgrlog", "-m", "wdAppUsgSc" ]
        log_cmd.extend( [ "name:string=" + app['Name'], "ver:string=" + app['Version'] ] )
        if 'network' in app_info:
            log_app_network_usage( app_info['network'], log_cmd )
        if 'cpu_stats' in app_info and 'precpu_stats' in app_info:
            log_app_cpu_usage( app_info['cpu_stats'], app_info['precpu_stats'], log_cmd )
        if 'memory_stats' in app_info:
            log_app_memory_usage( app_info['memory_stats'], log_cmd )
        run_command( log_cmd )

    return

def main(argv):
    try:
        log_apps_info()
    except Exception:
        syslog.syslog( syslog.LOG_ERR, "wdappmgr_log_stats failed to log number of apps" )
    try:
        log_apps_usage()
    except Exception:
        syslog.syslog( syslog.LOG_ERR, "wdappmgr_log_stats failed to log apps usage" )

if __name__ == "__main__":
    main( sys.argv[1:] )


