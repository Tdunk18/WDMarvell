#!/usr/bin/perl
# Copyright (c) [2011] Western Digital Technologies, Inc. All rights reserved.
#
# This script outputs the update counts of components in the system.  Each count acts as a revision
# of its associated component's database.  Each time the database changes, the revision changes.  A
# client can detect changes to component databases by polling the update counts and comparing them
# to the last values polled.

use strict;
use warnings;
use Fcntl ':flock';

# Lock the update counts before accessing them.

open LOCK_FILE, "> /var/lock/updateCounts" or die "Unable to open lock file (/var/lock/updateCounts)";
flock LOCK_FILE, LOCK_EX or die "Unable to lock file (/var/lock/updateCounts)";

# Each update count is maintained by a single file in the 'updateCounts' directory.  The name of
# each file identifies the name of the update count.  Output the name of each update count along
# with its count value using the format 'name=count', with one count per line.

my $directory = '/tmp/updateCounts';
my @fileList = `ls $directory 2> /dev/null`;

foreach my $name (@fileList) {
    chomp($name);
    my $count = `cat $directory/$name`;
    chomp($count);
    print "$name=$count\n";
}

# Unlock the update counts since access is completed.

close LOCK_FILE;
exit(0);
