<?php

namespace DlnaServer\Model;

class Database {

    protected $version = '';
    protected $time_db_update = '';
    protected $music_tracks = '';
    protected $pictures = '';
    protected $videos = '';
    protected $scanInProgress = '';

    function getStatus() {
        //!!!This where we gather up response
        //!!!Return NULL on error
        // get the network configuration
        $output = $retVal = null;
        exec_runtime("sudo /usr/local/sbin/getMediaServerDbInfo.sh", $output, $retVal);
        if ($retVal !== 0) {
            return NULL;
        }

        $version = explode(" ", $output[0]);
        $this->version = trim($version[1], '"');

        $musicTracks = explode(" ", $output[1]);
        $this->music_tracks = trim($musicTracks[1], '"');

        $pictures = explode(" ", $output[2]);
        $this->pictures = trim($pictures[1], '"');

        $videos = explode(" ", $output[3]);
        $this->videos = trim($videos[1], '"');

        $timeDBUpdate = explode(" ", $output[4]);
        $this->time_db_update = trim($timeDBUpdate[1], '"');

        $scanInProgress = explode(" ", $output[5]);
        $this->scanInProgress = trim($scanInProgress[1], '"');

        return( array(
            'version' => "$this->version",
            'time_db_update' => "$this->time_db_update",
            'music_tracks' => "$this->music_tracks",
            'pictures' => "$this->pictures",
            'videos' => "$this->videos",
            'scan_in_progress' => "$this->scanInProgress",
                ));
    }

    function config($changes) {
        //Require entire representation and not just a delta to ensure a consistant representation
        if (!isset($changes["database"])) {
            return 'BAD_REQUEST';
        }
        //Verify changes are valid
        if (FALSE) {
            return 'BAD_REQUEST';
        }

        //Actually do change
        $output = $retVal = null;
        $databaseParam = escapeshellarg($changes["database"]);
        exec_runtime("sudo /usr/local/sbin/cmdDlnaServer.sh " . $databaseParam . " 1>/dev/null &", $output, $retVal, false);
        if ($retVal !== 0) {
            return 'SERVER_ERROR';
        }

        return 'SUCCESS';
    }

}

/*
 * Local variables:
 *  indent-tabs-mode: nil
 *  c-basic-offset: 4
 *  c-indent-level: 4
 *  tab-width: 4
 * End:
 */
