<?php
// Job states
defined('JOBSTATE_WAITING') || define('JOBSTATE_WAITING', 1);
defined('JOBSTATE_RUNNING') || define('JOBSTATE_RUNNING',   2);
defined('JOBSTATE_CANCELLED') || define('JOBSTATE_CANCELLED', 3);
defined('JOBSTATE_COMPLETED') || define('JOBSTATE_COMPLETED', 4);
defined('JOBSTATE_FAILED') || define('JOBSTATE_FAILED',    5);

// Job failures
defined('JOBFAILURE_USERAUTH') || define('JOBFAILURE_USERAUTH', 1);

// Cloud sources
defined('@DROPBOX') || define('@DROPBOX', 1);
defined('@GOOGLEDRIVE') || define('@GOOGLEDRIVE', 2);
defined('@SKYDRIVE') || define('@SKYDRIVE', 3);

// Operation direction
defined('JOB_LOCAL') || define('JOB_LOCAL', 1);         // movement within local nas
defined('JOB_LOCAL_LOCAL') || define('JOB_LOCAL_LOCAL', 2);   // movement across 2 NASes (Local nas and remote nas, using samba share)
defined('JOB_LOCAL_DAS') || define('JOB_LOCAL_DAS', 3);     // movement between local NAS and DAS
defined('JOB_DAS_LOCAL') || define('JOB_DAS_LOCAL', 4);     // movement from DAS to local NAS
defined('JOB_LOCAL_REMOTE') || define('JOB_LOCAL_REMOTE', 5);  // movement from local NAS to Cloud (Dropbox, SkyDrive, GooleDrive etc)
defined('JOB_REMOTE_LOCAL') || define('JOB_REMOTE_LOCAL', 6);  // movement from Cloud to local NAS
?>