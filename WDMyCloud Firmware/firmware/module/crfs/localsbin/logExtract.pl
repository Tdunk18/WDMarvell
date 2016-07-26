#!/usr/bin/perl
#
# logExtract: filter log files for important information while masking private
#             data. a component of the robust analytics collection kit (RACK).
#
use strict;     # we prefer a pedantic interpreter
use warnings;   # that complains a lot.

my $switch;
my $logname;
my $loghandle;
my $sourcename;
my $filterfile;
my $demo = 0;

# epic 1: process command line options
NEXTOPT:
$switch = shift;
defined $switch or goto ENDOPT;

( $switch eq "-l" or $switch eq "--log" ) and do {
    my $newlog="debug.log";
    defined $ARGV[0] and not $ARGV[0] =~ "^-" and do {
        $newlog = shift;
    };
    $logname = $newlog;
    goto NEXTOPT;
};

( $switch eq "-s" or $switch eq "--source" ) and do {
    defined $ARGV[0] or do {
        print "'$switch' requires a file name parameter.\n";
        exit -1;
    };
    $sourcename = shift;
    goto NEXTOPT;
};

( $switch eq "-d" or $switch eq "--demo" ) and do {
    $demo = 1;
    goto NEXTOPT;
};

( $switch eq "-f" or $switch eq "--filter" ) and do {
    defined $ARGV[0] or do {
        print "'$switch' requires a file name parameter.\n";
        exit -1;
    };
    $filterfile = shift;
    goto NEXTOPT;
};

( $switch eq "-h" or $switch eq "--help" ) and do {
    print "help yourself to the source, for now.\n";
    exit 0;
};

if ( $switch =~ "^-" ) {
    print "unknown option '$switch'\n";
} else {
    print "unexpected parameter '$switch'\n";
}
exit -1;
ENDOPT:

# epic 1 coda: ensure required options were specified.
defined $sourcename or die "Must specify file to process with -s option.\n";
defined $filterfile or die "Must specify filter rules with -f option.\n";

# epic 2: open files
defined $logname and do {
    open( $loghandle, ">>", $logname ) or die "Could not open file '$logname' to log!\n";
};
defined $loghandle or do {
    open ( $loghandle, ">", "/dev/null" ) or die "Could not open bitbucket!\n";
};

my $sourcehandle;

open ( $sourcehandle, "<", $sourcename ) or do {
    print $loghandle "could not open log '$sourcename' to process.\n";
    die "Could not open file '$sourcename' to process.\n";
};

my $filterhandle;

open ( $filterhandle, "<", $filterfile ) or do {
    print $loghandle "could not open filter set '$filterfile' for processing.\n";
    die "Count not open filter set '$filterfile' for processing.\n";
};

# epic 3: load filters
my %logline = ();
my %level = ();
my %sender = ();
my %msgid = ();
my @keys;
my $lastkey;
my $defaultlevel = "CRITICAL";
my $defaultsender = "logExtract";
CONFIGLINE: while ( my $config = <$filterhandle> ) {
    chomp $config;

    # blank lines are OK and ignored
    next CONFIGLINE if $config eq "";

    # lines starting with a hash are comments and ignored
    next CONFIGLINE if $config =~ "^#";

    ( $config =~ "^defaultlevel ([^ ]+)" ) and do {
        $defaultlevel = $1;
        next CONFIGLINE;
    };

    ( $config =~ "^defaultsender ([^ ]+)" ) and do {
        $defaultsender = $1;
        next CONFIGLINE;
    };
    
    ( $config =~ "^when (.+)" ) and do {
        $lastkey = $1;
        $level{$lastkey} = $defaultlevel;
        $sender{$lastkey} = $defaultsender;
        next CONFIGLINE;
    };

    ( $config =~ "^level ([^ ]+)" ) and do {
        $level{$lastkey} = $1;
        next CONFIGLINE;
    };

    ( $config =~ "^sender ([^ ]+)" ) and do {
        $sender{$lastkey} = $1;
        next CONFIGLINE;
    };

    ( $config =~ "^log ([^ ]+) (.+)" ) and do {
        $msgid{$lastkey} = $1;
        $logline{$lastkey} = $2;
        push( @keys, $lastkey );
        next CONFIGLINE;
    };

    print $loghandle "config file '$filterfile' invalid statement '$config'\n";
    die "invalid statement in config file: '$config'\n";
};

close $filterhandle;

# epic 4: process log!
while ( my $line = <$sourcehandle>) {
    chomp $line;

    foreach my $filter (@keys) {
        ( $line =~ $filter ) and do {
            my $expand;

            eval( "\$expand = \"$logline{$filter}\";" );
            my $command = "wdlog -l $level{$filter} -s $sender{$filter} -m $msgid{$filter} $expand";
            if ( $demo ) {
                print "Command: '$command'\n";
            } else {
                my $status = system $command;
		( $status == 0 ) or print $loghandle "system exec failed status $status, command '$command'\n";
            }
        }
    }
};

print $loghandle "logExtract completed.\n";
close $loghandle;

print "Execution complete.\n";
exit 0;
