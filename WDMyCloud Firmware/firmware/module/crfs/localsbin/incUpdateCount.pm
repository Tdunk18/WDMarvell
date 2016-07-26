#!/usr/bin/perl
# Copyright (c) [2011] Western Digital Technologies, Inc. All rights reserved.
#
# This script increments the update count of a component in the system.  The count acts as a
# revision of the component's database.  Each time the component's database changes, the revision
# changes.  A client can detect changes to the component databases by polling the update counts
# and comparing them to the last values polled.

use strict;
use warnings;
use Fcntl ':flock';

# Make sure a component was specified.  If not, display the proper usage.  If a component was
# specified, lock the update counts before accessing them.

my $numArgs = $#ARGV + 1;
if ($numArgs != 1) {
    print "usage: incUpdateCount.pm <componentName>\n";
    exit 1;
}

open LOCK_FILE, "> /var/lock/updateCounts" or die "Unable to open lock file (/var/lock/updateCounts)";
flock LOCK_FILE, LOCK_EX or die "Unable to lock file (/var/lock/updateCounts)";

# Attempt to get the current value of the count.  If the component file doesn't exist or it has an
# illegal value, set its value to zero.

my($name) = $ARGV[0];
my $directory = '/tmp/updateCounts';

if (! -e $directory) {
   mkdir($directory) or die "Can't create $directory:$!\n";
}

my $count = `cat $directory/$name 2> /dev/null`;
chomp($count);
$count = 0 if (!($count =~ /^[0-9]+$/));

# Increment the value and save it back to the component's file (or create the file if it didn't
# exist).  Then, unlock the update counts.

$count = $count + 1;
system("echo $count > $directory/$name");
close LOCK_FILE;
exit 0;