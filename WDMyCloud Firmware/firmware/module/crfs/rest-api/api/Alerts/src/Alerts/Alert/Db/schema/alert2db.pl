#!/usr/bin/perl

#Script for creating alert specs from alertmessages.txt 

use File::Copy;


my $repo = "http://svn.wdc.com/svn/bpg";
my $target = "/tmp/alertmessages.txt";
my $dbfile = "wd-alert-desc.db";
my $dbfile_main = "wd-alert.db";
my $branch = "";
my $dbschema = "wd-alert-desc.sql";
my $dbschema_main = "wd-alert.sql";
my $cleanup = 1;
my %scopemap;
my %adminackmap;
my $scopefile;
my $sqlite3 = "./sqlite3";

%alertscopemap = ("all"=>1, "admin"=>2, "specific"=>3);
%alertcategorymap = ("system"=>1, "user"=>2);

for my $arg (@ARGV) {
    if($arg =~ /-branch=(.*)/) { $branch = $1; }
    elsif($arg =~ /-dbschema=(.*)/) { $dbschema = $1; }
    elsif($arg =~ /-db=(.*)/) { $dbfile = $1; }
    elsif($arg =~ /-noclean/) { $cleanup = 0; }
    elsif($arg =~ /-scopefile=(.*)/) { $scopefile = $1; }
    elsif($arg =~ /-sqlite3=(.*)/) { $sqlite3 = $1; }
}

if($branch eq "") {
    printf("ERROR: please supply branch\n");
    exit(1);
}

if(!-e $dbschema) {
    printf("ERROR: unable to find db schema file: ${dbschema}\n");
    exit(1);
}

if(!-e $dbschema_main) {
    printf("ERROR: unable to find db schema file: ${dbschema_main}\n");
    exit(1);
}

if(!$scopefile || ! -e $scopefile) {
    printf("ERROR: please specify a valid scope file: $scopefile\n");
    exit(1);
}

if(! -e $sqlite3) {
    printf("ERROR: please specify a valid path to sqlite3 binary\n");
    exit(1);
}

sub read_scope_file {
    my %parm = @_;
    my $filename = $parm{filename};
    
    open SCOPEFILE, $filename;
    while(<SCOPEFILE>) {
        my @col = split(/,/);
        chomp(@col);
        foreach my $string (@col) {
            for ($string) {
                s/^\s+//;
                s/\s+$//;
            }
        }

        $scopemap{$col[0]} = $col[1];
        $adminackmap{$col[0]} = $col[2];
        $categorymap{$col[0]} = $col[3];
        printf("setting scope ".$col[0].":".$col[1]."\n");
        printf("setting admin_ack_only ".$col[0].":".$col[2]."\n");
        printf("setting category ".$col[0].":".$col[3]."\n")
    }
    close SCOPEFILE;
}

#make a copy of the schema file

$dbschema_test = "${dbschema}.test";
if(-e $dbschema_test) {
    unlink $dbschema_test;
}
copy($dbschema, $dbschema_test);

my $svn_path = "${repo}/NAS/Linux/Components/$branch/alert-strings/en_US/alertmessages.txt";

if(-e $target) {
    unlink $target;
}

if(system("svn export ${svn_path} ${target}")) {
    printf("ERROR: failed to export\n");
    exit(1);
}

if( ! -e "${target}") {
    printf("ERROR: ${target} not found!\n");
    exit(1);
}

my @out = `cat ${target}`;
my $inserts = "";

read_scope_file(filename=>$scopefile);

foreach my $line (@out) {
    if($line =~ /^(\d+)\s*=\s*(\S+.*)$/) {
        #printf("code: $1, desc: $2\n");
        my $code = $1;
        my $desc = $2;
        my $scope = 2; #admin
        my $admin_ack_only = 1;
        my $category = 1; #system

        my $sev = 1;
        if($1 < 1000) {
            $sev = 1;
        } elsif ($1 < 2000) {
            $sev = 5;
        } else {
            $sev = 10;
        }
        if($alertscopemap{$scopemap{$code}}) {
            $scope = $alertscopemap{$scopemap{$code}};
        } else {
            printf("using default scope: $code\n");
        }
        if($adminackmap{$code} =~ /^\d+$/) {
            $admin_ack_only = $adminackmap{$code};
        } else {
            $admin_ack_only = 1;
        }
        if($alertcategorymap{$categorymap{$code}}) {
            $category = $alertcategorymap{$categorymap{$code}};
        } else {
            printf("using default category: $code\n");
        }

        $inserts .= "INSERT INTO \"AlertDesc\" (severity, code, description, scope, admin_ack_only, category) VALUES (${sev}, '${code}', '${desc}', '$scope', '$admin_ack_only', '$category');\n";
    }
}

if(!-e $dbschema_test) {
    printf("ERROR: the supplied data base schema file: $schemadb does not exist\n");
    exit(1);
}

unlink $dbfile if(-e $dbfile);

open DBSCHEMA, ">>${dbschema_test}";
print DBSCHEMA $inserts;
close DBSCHEMA;

if(system("echo \".quit\" |${sqlite3}  -init ${dbschema_test} ${dbfile}")) {
    printf("ERROR: problem importing the database: ${dbfile}\n");
    exit(1);
}

unlink $dbfile_main if(-e $dbfile_main);

#building the main alert database
if(system("echo \".quit\" |${sqlite3}  -init ${dbschema_main} ${dbfile_main}")) {
    printf("ERROR: problem importing the database: ${dbfile_main}\n");
    exit(1);
}

printf("database successfully constructed.\n");
#printf($inserts);
if(system("chown root:www-data ${dbfile_main} ${dbfile}")) {
    printf("ERROR: unable to change the database ownership\n");
}

if(system("chmod 775 ${dbfile_main} ${dbfile}")) {
    printf("ERROR: unable to change the database permission\n");
}

if(cleanup) {
    unlink $dbschema_test if(-e $dbschema_test);
}
exit(0);
