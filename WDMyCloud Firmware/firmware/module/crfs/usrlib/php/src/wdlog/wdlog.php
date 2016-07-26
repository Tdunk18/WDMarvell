<?php
namespace wdlog;

define(__NAMESPACE__ . '\WD_LOG_CRITICAL' , 0);
define(__NAMESPACE__ . '\WD_LOG_ERROR'    , 1);
define(__NAMESPACE__ . '\WD_LOG_WARN'     , 2);
define(__NAMESPACE__ . '\WD_LOG_INFO'     , 3);
define(__NAMESPACE__ . '\WD_LOG_DEBUG'    , 4);
define(__NAMESPACE__ . '\WD_LOG_DUMP'     , 5);

/*
 WDLOG_KVP logs an entry that contains a list of key value pairs (KVP).

 level: indicates the logging level. 
  WD_LOG_CRITICAL
  WD_LOG_ERROR
  WD_LOG_WARN
  WD_LOG_INFO
  WD_LOG_DEBUG
  WD_LOG_DUMP

 msgid: a unique string that represents this particular log entry
 kvp: an array of KVP

 Return: nothing

 example:
  $arr = array('seconds' => 135.08);
  \wdlog\WDLOG_KVP( \wdlog\WD_LOG_CRITICAL, "sysboottime", $arr );
 */
function WDLOG_KVP($level, $msgid, $kvp)
{
    if(is_int($level) && is_string($msgid) && is_array($kvp))
    {
        $kvp = array("msgid" => $msgid) + $kvp;
        $json_string = json_encode($kvp);
        if($json_string !== false)
        {
            // Map WD_LOG_... priority to PHP syslog priority
            switch($level)
            {
            case WD_LOG_CRITICAL:
                $mapped_piority = LOG_CRIT;
                break;
            case WD_LOG_ERROR:
                $mapped_piority = LOG_ERR;
                break;
            case WD_LOG_WARN:
                $mapped_piority = LOG_WARNING;
                break;
            case WD_LOG_INFO:
                $mapped_piority = LOG_NOTICE;
                break;
            case WD_LOG_DEBUG:
                $mapped_piority = LOG_INFO;
                break;
            case WD_LOG_DUMP:
            default:
                $mapped_piority = LOG_DEBUG;
                break;
            }
            syslog($mapped_piority, $json_string);
        }   
    }
}
?>
