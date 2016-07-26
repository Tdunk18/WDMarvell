#!/usr/bin/perl
#
# wdLogUploader: tool to send a log to collection for analytics. a component of
#                the robust analytics collection kit (RACK).
#
use strict;     # we prefer a pedantic interpreter
use warnings;   # that complains a lot.	
use File::Spec::Functions qw/ splitpath file_name_is_absolute catfile /;
use Cwd qw/ abs_path /;
use File::Temp qw/ tempfile /;
use File::Path qw/ make_path /;
use File::Copy;
use File::Basename;

my $switch;
my @logs;
my @allow;
my @deny;
my %filter;
my $track = 0;
my $append = ".1";  # default - append ".1" to logname
my $demo;       # demo = dry run
my $verbose;
my $collection;
my $collector_url;
my $wdlogconfname = "/usr/local/config/wdlog.conf";
my $wdlogfiltername = "/usr/local/config/wdlog.filters";
my $wdlogfilteroption;
my $wd2goenvname = "/etc/nas/wd2go_setting";
my $wd2goenvoption;
my $systemconfname = "/etc/system.conf";
my $systemconfoption;
my $wdlogininame = "/etc/nas/wdlog.ini";
my $wdloginioption;
my $uploadqueuedirname; # = "/usr/local/config/wdlog_queue";
my $savetemps;
my $sendold = 1; # compatibility: by default, attempt uploading old logs
my $upload_error; # define this by setting a value if an upload error/failure
				  # has occured

# the uploader subroutine: upload_log( log_file_name )
sub upload_log
{
    my $log = shift @_;
    my $http_status;

    my $filth;
    my $filtname;
    my $logh;

    # apply filters
    ( $filth, $filtname ) = tempfile( "wdlogXXXXXXXX", TMPDIR => 1 );
    open( $logh, "<", $log ) or return 0;
    LOGLINE: while ( my $line = <$logh> ) {
        chomp $line;

        # consider filters
        foreach my $key ( keys %filter ) {
            $line =~ s/$key/$filter{$key}/;
        }

        # skip if denied
        foreach my $block ( @deny ) {
            if ( $line =~ /$block/ ) {
                next LOGLINE;
            }
        }

        # save if allowed
        foreach my $permit ( @allow ) {
            if ( $line =~ /${permit}/ ) {
                print $filth "$line\n";
                next LOGLINE;
            }
        }

        # drop if not allowed
    }

    close $filth; # prepare to upload

    if ( defined $demo ) {
        printf "$0: would upload '$log' to '$collector_url'\n";
        $http_status = 404;
    } else {
        $http_status = `curl -s -w %{http_code} -X POST -T $filtname $collector_url -o /dev/null `;
    }

    if ( defined $savetemps ) {
        printf "$0: '$log' was filtered into '$filtname'\n";
    } else {
        unlink $filtname; #remove temporary file
    }
    
    if ( $http_status != 200 )
    {
        printf "$0: Upload of '$log' failed, HTTP STATUS $http_status\n";
        return 0;
    };

    return 1;
}

# epic 1: process command line options
NEXTOPT:
$switch = shift;
defined $switch or goto ENDOPT;

( $switch eq "-o" or $switch eq "--old" ) and do {
    $sendold = 1;
    goto NEXTOPT;
};

( $switch eq "--no-old" ) and do {
    undef $sendold;
    goto NEXTOPT;
}; 

( $switch eq "-i" or $switch eq "--ini" ) and do {
    defined $ARGV[0] or die "$0: '$switch' requires a file name parameter!\n";
    $wdlogininame = shift;
	$wdloginioption = 1;
    goto NEXTOPT;
};

( $switch eq "-q" or $switch eq "--queue" ) and do {
    defined $ARGV[0] or die "$0: '$switch' requires a directory name paramenter!\n";
    $uploadqueuedirname = shift;
    goto NEXTOPT;
};

( $switch eq "-c" or $switch eq "--config" ) and do {
    defined $ARGV[0] or die "$0: '$switch' requires a file name parameter!\n";
    $wdlogconfname = shift;
    goto NEXTOPT;
};

( $switch eq "-e" or $switch eq "--env" ) and do {
    defined $ARGV[0] or die "$0: '$switch' requires a file name parameter!\n";
    $wd2goenvname = shift;
	$wd2goenvoption = 1;
    goto NEXTOPT;
};

( $switch eq "-s" or $switch eq "--system" ) and do {
    defined $ARGV[0] or die "$0: '$switch' requires a file name parameter.\n";
    $systemconfname = shift;
    $systemconfoption = 1;
    goto NEXTOPT;
};

( $switch eq "--filter" ) and do {
    defined $ARGV[0] or die "$0: '$switch' requires a file name parameter.\n";
    $wdlogfiltername = shift;
    $wdlogfilteroption = 1;
    goto NEXTOPT;
};

( $switch eq "-f" or $switch eq "--file" ) and do {
    defined $ARGV[0] or die "$0: '$switch' requires a file name parameter!\n";
	push( @logs, shift );
    goto NEXTOPT;
};

( $switch eq "-t" or $switch eq "--track" ) and do {
    # old wdLogUploader.sh required a dummy parameter after -t. we now consider
    # it optional.
    ( $switch eq "-t" ) and do {
        defined $ARGV[0] and not $ARGV[0] =~ "^-" and do {
            shift; # eat parameter
        };
    };
    $track = 1;
    goto NEXTOPT;
};

( $switch eq "-a" or $switch eq "--no-append" ) and do {
    # old wdLogUploader.sh required a dummy parameter after -a. we now consider
    # it optional.
    ( $switch eq "-a" ) and do {
        defined $ARGV[0] and not $ARGV[0] =~ "^-" and do {
            shift; # eat parameter
        };
    };
    $append = "";
    goto NEXTOPT;
};

( $switch eq "--append" ) and do {
    ( not defined $ARGV[0] or not $ARGV[0] =~ "^-" ) and die "$0: '$switch' requires a parameter!\n";
    $append = shift;
    goto NEXTOPT;
};

( $switch eq "-d" or $switch eq "--demo" ) and do {
    $demo = 1;
    goto NEXTOPT;
};

( $switch eq "-v" or $switch eq "--verbose" ) and do {
    $verbose = 1;
    goto NEXTOPT;
};

( $switch eq "--savetemps" ) and do {
    $savetemps = 1;
    goto NEXTOPT;
};

if ( $switch =~ /^-/ ) {
    print "$0: unknown option '$switch'\n";
} else {
    print "$0: unexpected parameter '$switch'\n";
}
exit -1;
ENDOPT:

# epic 1 code: ensure required options were specified.
( @logs or defined $sendold ) or die "Must specify file(s) to process with -f option or use --old to send queued logs.\n";
@logs and defined $verbose and do {
	printf "$0: Logs that will be processed:";
	foreach my $log ( @logs ) {
		printf " $log";
	}
	printf "\n";
};

# epic 2: read configuration files 

# epic 2a: read the wdlog.conf file; are we enabled for upload?
my $confighandle;
open( $confighandle, "<", $wdlogconfname ) or die "Could not open configuration file '$wdlogconfname'\n";

CONFIGLINE: while ( my $line = <$confighandle>) {
    chomp $line;

    # blank lines OK and ignored
    next CONFIGLINE if $line eq "";

    # lines starting with a hash are comments and ignored
    next CONFIGLINE if $line =~ /^#/;

    ( $line =~ /^\s*STATUS\s*=\s*([\S]+)/ ) and do {
        $collection = $1;
        next CONFIGLINE;
    };
    
    ( $line =~ /^\s*HOSTED_COLLECTOR_URL\s*=\s*"([^"]+)"/ ) and do {
        $collector_url = $1;
		$collector_url =~ "^https://" or die "$0: Collector not HTTPS, aborting...\n";
        next CONFIGLINE;
    };

	( $line =~ /^\s*WDLOG\.INI\s*=\s*(\S+)/ ) and do {
		if ( not defined $wdloginioption ) {
			$wdlogininame = $1;
		}
		next CONFIGLINE;
	};

    ( $line =~ /^\s*UPLOAD_QUEUE_DIR\s*=\s*(\S+)/ ) and do {
        if ( not deifned $uploadqueuedirname ) {
            $uploadqueuedirname = $1;
        }
        next CONFIGLINE;
    };

	( $line =~ /^\s*WD2GO_SETTING\s*=\s*(\S+)/ ) and do {
		if ( not defined $wd2goenvoption ) {
			$wd2goenvname = $1;
		}
		next CONFIGLINE;
	};

	( $line =~ /^\s*SYSTEM\.CONF\s*=\s*(\S+)/ ) and do {
		if ( not defined $systemconfoption ) {
			$systemconfname = $1;
		}
		next CONFIGLINE;
	};

    ( $line =~ /^\s*WDLOG.FILTERS\s*=\s*(\S+)/ ) and do {
        if ( not defined $wdlogfilteroption ) {
            $wdlogfiltername = $1;
        }
        next CONFIGLINE;
    };

    # ignore other lines
}

close $confighandle;
defined $collection or die "STATUS not found in '$wdlogconfname'!\n";
( lc $collection eq "enabled" ) or do {
    # do NOT queue up logs when disabled
    print "Collection is disabled; exiting.\n";
    exit 0;
};
defined $collector_url or die "Enabled but HOSTED_COLLECTOR_URL not found in '$wdlogconfname'!\n";

# we are enabled (collector wants to hear from us)

my $model_number;

# epic 2b: read system.conf to get our model type
my $systemhandle;
open( $systemhandle, "<", $systemconfname ) or die "Could not open system config file '$systemconfname'!\n";
SYSTEMLINE: while ( my $line = <$systemhandle> ) {
    chomp $line;

    # blank likes OK and ignored
    next SYSTEMLINE if $line eq "";

    # lines starting with a hash are comments and ignored
    next SYSTEMLINE if $line =~ /^#/;

    ( $line =~ /^\s*modelNumber\s*=\s*"([^"]+)"/ ) and do {
        $model_number = $1;
        next SYSTEMLINE;
    }

    # ignore other lines
}
close $systemhandle;
defined $model_number or die "$0: Could not determine model!\n";

# is this system participating? (owner opted in)
my $pip_participant = "false";
# epic 2c: determine if PIP enabled (read wd2go_setting and check user opt-in)
my $envhandle;
open( $envhandle, "<", $wd2goenvname ) or die "Could not open environment file '$wd2goenvname'\n";
my $env = <$envhandle>;
defined $env and chomp $env;
close $envhandle;

if ( defined $env and $env eq "-dev" ) {
    printf "$0: In developer mode.\n" if defined $verbose;
    $pip_participant = "true";
} else {
    printf "$0: In release mode.\n" if defined $verbose;

    if ( $model_number eq "sq" ) {
        $pip_participant = `bash privacyOptions.sh | awk -F"=" '{print \$2}'`;
	chomp $pip_participant;
    } else {
        my $flag = `xmldbc -g analytics`;
        chomp $flag; # eliminate trailing newline
        if ( $flag eq "1" ) {
            $pip_participant = "true";
        }
    }
}

if ( not defined $uploadqueuedirname ) {
    if ( $model_number eq "sq" ) {
        $uploadqueuedirname = "/var/log/analytics_missed";
    } else {
        $uploadqueuedirname = "/usr/local/config/analytics_missed";
    }
}

( lc $pip_participant eq "true" ) or do {
    print "Not participating; exiting.\n";
    exit 0;
};

# Should we even process this log file?
my @supported_logs;
my $inihandle;
my $specialized_tag = "LOG_LIST_MyCOS";
if ( $model_number eq "sq" ) {
    $specialized_tag = "LOG_LIST_sq";
}
my @specialized_logs;
# epic 2d: read wdlog.ini for the log list
open( $inihandle, "<", $wdlogininame ) or die "Could not open INI file '$wdlogininame'!\n";
INILINE: while ( my $line = <$inihandle> ) {
    chomp $line;

    # blank lines OK and ignored
    next INILINE if $line eq "";

    # lines starting with a hash are comments and ignored
    next INILINE if $line =~ /^#/;

    ( $line =~ /^\s*LOG_LIST\s*=\s\(([^\)]+)\)/ ) and do {
        undef @supported_logs;
        my @elements = split /,/, $1;
        while ( 0 != scalar @elements ) {
            my $element;
            $element = shift @elements;
            if ( $element =~ /\s*'([^']*)'/ ) {
                push( @supported_logs, $1 );
            }
        }

        next INILINE;
    };

    ( $line =~ /^\s*LOG_LIST\s*\+=\s\(([^\)]+)\)/ ) and do {
        my @elements = split /,/, $1;
        while ( 0 != scalar @elements ) {
            my $element;
            $element = shift @elements;
            if ( $element =~ /\s*'([^']*)'/ ) {
                push( @supported_logs, $1 );
            }
        }

        next INILINE;
    };


    # compatibility: look for LOG_LIST_sq or LOG_LIST_MyCOS
    ( $line =~ /^\s*declare\s+-a\s+$specialized_tag\s*=\s*\(([^\)]+)\)/ ) and do {
        undef @specialized_logs;
        my @elements = split / /, $1;
        while ( 0 != scalar @elements ) {
            my $element;
            $element = shift @elements;
            if ( $element =~ /\s*'([^']*)'/ ) {
                push( @specialized_logs, $1 );
            }
        }

        next INILINE;
    };
}
close $inihandle;
# if we saw no LOG_LIST entries, then use value from LOG_LIST_sq or LOG_LIST_MyCOS
@supported_logs or @supported_logs = @specialized_logs;

# load filter rules
my $filterhandle;
if ( open( $filterhandle, "<", $wdlogfiltername ) ) {
FILTERLINE: while ( my $line = <$filterhandle> ) {
        chomp $line;

        ( $line =~ /^\s*ALLOW\s+(.+)$/ ) and do {
            # The statement "ALLOW *" was defined as the instruction to allow any message through.
            # While the general format is ALLOW <regexp>, note that "*" is not actually a valid
            # regexp; it just looks right while ".*" doesn't. So, during parsing, we will convert
            # the value "*" into the valid equivalent regexp ".*".
            if ( "$1" eq "*" ) {
                push( @allow, ".*" );
                next FILTERLINE;
            }
            push( @allow, $1 );
            next FILTERLINE;
        };

        ( $line =~ /^\s*DENY\s+(.+)$/ ) and do {
            push( @deny, $1 );
            next FILTERLINE;
        };

        ( $line =~ /^\s*FILTER\s+(\S+)\s+(.+)$/ ) and do {
            $filter{$1} = $2;
            next FILTERLINE;
        };

        # allow comments
        ( $line =~ /^\s*#/ ) and do {
            next FILTERLINE;
        };

        # bad config... die!
        die "$0: Filter config file '$wdlogfiltername' is invalid.\n";
    }

    close $filterhandle;
}
else
{
    printf "$0: Could not open filter config file '$wdlogfiltername'\n" if defined $verbose;
}
@allow or die "$0: Filter config file '$wdlogfiltername' ALLOWs nothing.\n";

# must have at least one @allow or it's pointless

my $old_logs_dir = "/usr/local/config/analytics_missed";
if ( $model_number eq "sq" ) {
    $old_logs_dir = "/var/log/analytics_missed";
}
my $old_keep = 2;

LOGLIST: foreach my $logname ( @logs ) {
    my $logbasename = basename( $logname );
    my $logfull = abs_path( $logname );

    my $allowed = 0;
    foreach my $supported_log ( @supported_logs ) {
        if ( file_name_is_absolute( $supported_log ) ) {
            # match full path
            if ( $logfull eq $supported_log ) {
                $allowed = 1;
                goto CHECKDONE;
            }
        } else {
            # supported is just name - allow from any path
            if ( $logbasename eq $supported_log ) {
                $allowed = 1;
                goto CHECKDONE;
            }
        }
    };
    CHECKDONE:
    if ( $allowed != 1 ) {
		printf "$0: Uploading '$logname' not supported.\n";
		next LOGLIST;
	}

    if ( defined $upload_error or 0 == upload_log( $logname . $append ) ) {
		if ( not defined $upload_error ) {
	        printf "$0: Upload of '$logname' failed.\n";
			$upload_error = 1;
		}

        if ( not -d $uploadqueuedirname ) {
            # directory does not exist; attempt to create
            make_path( $uploadqueuedirname, { mode => 0755, error => \my $err } );
            if ( @$err ) {
                if ( defined $verbose ) {
                    for my $diag (@$err) {
                        my ($file, $message) = %$diag;
                        if ( $file eq "" ) {
                            printf "$0: general error making '$uploadqueuedirname', '$message'\n";
                        } else {
                            printf" $0: error making component '$file' of '$uploadqueuedirname', '$message'\n";
                        }
                    }
                }
            }
        }

        if ( -d $uploadqueuedirname ) {
            my $queuedlogname = catfile( $uploadqueuedirname, basename( $logname ) );

            # TODO: save log to retry later
            if ( -e $queuedlogname ) {
                printf "$0: Replacing existing queued log '$queuedlogname' for '$logname'\n" if defined $verbose;
                unlink $queuedlogname;
            } 

            if ( copy( $logname . $append, $queuedlogname ) ) {
		        printf "$0: Log '$logname' saved for later retry.\n";
            } else {
                printf "$0: Failed to copy '$logname' to '$queuedlogname' for retry; log may be lost.\n";
            }
        } else {
            printf "$0: Unable to save log '$logname' for later retry.\n";
        }

		# continue & save other logs in the processing list.
        next LOGLIST;
    }

    printf "$0: upload of '$logname' succeeded.\n" if defined $verbose;
}

# TODO: retry logs saved for later
if ( not defined $upload_error and defined $sendold ) {
    printf "$0: Checking in '$uploadqueuedirname' for old logs to send.\n" if defined $verbose;
    foreach my $supported_log ( @supported_logs ) {
        my $deferredfile = catfile( $uploadqueuedirname, basename( $supported_log ) );

        printf "$0: Looking for old '$supported_log' (as '$deferredfile') file to send.\n" if defined $verbose;

        if ( -e $deferredfile ) {
            printf "$0: Processing deferred '$supported_log' file '$deferredfile'.\n" if defined $verbose;

            if ( 0 == upload_log( $deferredfile ) ) {
                printf "$0: Upload of deferred '$supported_log' failed; will try again\n";
                exit 0;
            }

            printf "$0: Deferred upload of '$supported_log' completed successfully.\n" if defined $verbose;
            unlink( $deferredfile );
        }
    }
}
 
exit 0;
