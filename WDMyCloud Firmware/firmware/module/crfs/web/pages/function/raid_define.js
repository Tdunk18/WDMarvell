var FILE_DM_VOLUME_INFO = "/xml/dm_volume_info.xml";
var FILE_DM_READ_STATE = "/xml/dm_read_state.xml"
var FILE_CURRENT_HD_INFO = "/xml/current_hd_info.xml";
var FILE_USED_VOLUME_INFO = "/xml/used_volume_info.xml";
var FILE_UNUSED_VOLUME_INFO = "/xml/unused_volume_info.xml";
var FILE_CGI_FMT_GUI_LOG = "/xml/cgi_fmt_gui_log.xml";
var FILE_DM_READ_PROGRESS = "/xml/dm_read_progress.xml";
var FILE_HD_RIGHT_POSITION = "/xml/hd_right_position.xml";
var FILE_HIDDEN_ENCRYPTION = "/xml/hidden_encryption.xml";
var FILE_SYSINFO = "/xml/sysinfo.xml";
var FUN_VOLUME_ENCRYPTION = VE_FUNCTION;
var FMT_SHAREDNAME = new Array();	
var PARTITION_SWAP = 2097152;
var PARTITION_HIDDEN = 1048576;
var PARTITION_RESERVED = 1048576;
var BLOCKS_1G_GIBYTES = 1048576;
var BLOCKS_1T_GIBYTES = 1073741824;
var HD_BLOCKS_KEEP_BLOCKS = parseInt(PARTITION_HIDDEN,10) + parseInt(PARTITION_SWAP,10) + parseInt(PARTITION_RESERVED,10);
var HD_BLOCKS_KEEP = 4; //Unit:GB
var FILE_SYSTEM = "ext4";
var USED_VOLUME_INFO,UNUSED_VOLUME_INFO,SYSINFO;

var FMT_CREATEALL_DATA_INIT = 0;
/*
CURRENT_HD_INFO[idx][0] = Devics Name,ex:sda
CURRENT_HD_INFO[idx][1] = SCSI, ex:1
CURRENT_HD_INFO[idx][2] = HD Vendor
CURRENT_HD_INFO[idx][3] = HD Model
CURRENT_HD_INFO[idx][4] = HD Serial
CURRENT_HD_INFO[idx][5] = HD size, unit:blocks
CURRENT_HD_INFO[idx][6] = HD size, unit:Gbytes
CURRENT_HD_INFO[idx][7] = sdx2 size,unit:blocks
CURRENT_HD_INFO[idx][8] = n, part_cnt
*/
var CURRENT_HD_INFO = new Array();

var FMT_HD_INFO = new Array();		//format all
/*		type1: format all hd or format newly hd
		CREATE_VOLUME_INFO[x][0] = Volume Name,ex:1,2,3,4
		CREATE_VOLUME_INFO[x][1] = RAID Level,ex:standard,linear,raid0,raid1,raid5,raid10
		CREATE_VOLUME_INFO[x][2] = File System,ex:ext3,ext4
		CREATE_VOLUME_INFO[x][3] = RAID Size,ex:1 to n
		CREATE_VOLUME_INFO[x][4] = Deive Name,ex:sda,adasdb,adasdbsdc,adasdbsdcsdd
		CREATE_VOLUME_INFO[x][5] = Spare Disk,ex:none,sda,sdb,sdc,sdd
		CREATE_VOLUME_INFO[x][6] = linear on partitions 3,ex:0->false,1->true
		CREATE_VOLUME_INFO[x][7] = status,ex:0->don't create volume,1->create volume
		CREATE_VOLUME_INFO[x][8] = raid size by user set,1 to n
		CREATE_VOLUME_INFO[x][9] = format type,ex: 0 -> cereate all disk(s) or newly insert hd
												   1 -> STD	To	RAID1
												   2 -> STD	To	RAID5
												   3 -> RAID5 Spare Disk
		CREATE_VOLUME_INFO[x][10] = source device for STD2R1,STD2R5 or R5 Spare Disk,ex:sda,adasdb,adasdbsdc,adasdbsdcsdd	 
		CREATE_VOLUME_INFO[x][11] = same device size,ex:sda == sdb
		CREATE_VOLUME_INFO[x][12] = Volume Encryption,ex:0 -> no, 1 -> yes
		CREATE_VOLUME_INFO[x][13] = Volume Encryption's Auto-Mount,ex:0 -> no, 1 -> yes
		CREATE_VOLUME_INFO[x][14] = Volume Encryption's Password,ex:str
		CREATE_VOLUME_INFO[x][15] = Create type,ex:0 -> format all disk(s); 1-> format newly insert disk(s)
		----------------------------------------------------------------------------
		type2: re-main to linear
		CREATE_VOLUME_INFO[my_len] = new Array();
		CREATE_VOLUME_INFO[my_len][0] = my_volume;		//Volume Name,ex:1,2,3,4
		CREATE_VOLUME_INFO[my_len][1] = my_raid_mode;	//RAID mode,ex:linear
		CREATE_VOLUME_INFO[my_len][2] = my_file_type;	//File Tyle,ex:ext3,ext4
		CREATE_VOLUME_INFO[my_len][3] = my_dev;			//device,ex:sda,sdasdb,sdasdbsdc,sdasdnsdcsdd
		CREATE_VOLUME_INFO[my_len][4] = 0				//free size,unit is block
		CREATE_VOLUME_INFO[my_len][5] = 0;				//state,0:don'r create,1:create
		CREATE_VOLUME_INFO[my_len][6] = 0;				//volume encryption state,ex:1->yes,0->no
		CREATE_VOLUME_INFO[my_len][7] = 0;				//volume encryption/auto mount,ex:1->yes,0->no
		CREATE_VOLUME_INFO[my_len][8] = 0;				//volume pwd
*/
var CREATE_VOLUME_INFO = new Array();
/*
	FMT_RAIDEXPAN_VOLUME_INFO[idx][0] = Volume Name, ex:1,2,3,4
	FMT_RAIDEXPAN_VOLUME_INFO[idx][1] = RAID Level,ex:standard,linear,raid0,raid1,raid5,raid10
	FMT_RAIDEXPAN_VOLUME_INFO[idx][2] = RAID Origin Size,ex:1 to n
	FMT_RAIDEXPAN_VOLUME_INFO[idx][3] = Deive Name,ex:sda,adasdb,adasdbsdc,adasdbsdcsdd
	FMT_RAIDEXPAN_VOLUME_INFO[idx][4] = Mount, ex:/dev/md1
	FMT_RAIDEXPAN_VOLUME_INFO[idx][5] = UUID, ex:xx...xx:xx...xx:xx...xx:xx...xx
	FMT_RAIDEXPAN_VOLUME_INFO[idx][6] = Replace HD,ex:1->Yes; 0->No;
	FMT_RAIDEXPAN_VOLUME_INFO[idx][7] = Status,ex:0->don't create volume,1->create volume
	FMT_RAIDEXPAN_VOLUME_INFO[idx][8] = RAID Max Size,ex:1 to n
	FMT_RAIDEXPAN_VOLUME_INFO[idx][9] = RAID Size,ex:1 to n
	FMT_RAIDEXPAN_VOLUME_INFO[idx][10] = System File Type, ex:"ext4"
	FMT_RAIDEXPAN_VOLUME_INFO[idx][11] = Spanning Size
	FMT_RAIDEXPAN_VOLUME_INFO[idx][12] = Expan Minimal Required Size
*/
var FMT_RAIDEXPAN_VOLUME_INFO = new Array();
/*
	FMT_R12STD_VOLUME_INFO[idx][0] = Volume Name, ex:1,2,3,4
	FMT_R12STD_VOLUME_INFO[idx][1] = RAID Level,ex:standard,linear,raid0,raid1,raid5,raid10
	FMT_R12STD_VOLUME_INFO[idx][2] = Deive Name,ex:sda,adasdb,adasdbsdc,adasdbsdcsdd
	FMT_R12STD_VOLUME_INFO[idx][3] = Status,ex:0->don't create volume,1->create volume
	FMT_R12STD_VOLUME_INFO[idx][4] = Primaary HD, ex:sda
*/
var FMT_R12STD_VOLUME_INFO = new Array();
var REFMT_HD_INFO = new Array();	//insert hd
var FMT_REFORMAT_DATA_INIT = 0;
var DIAD_REFORMAT_FLAG = 0;
var REFMT_HD_INFO = new Array();
var STD2R1_SOURCE_INFO = new Array();
var STD2R5_SOURCE_INFO = new Array();
var R12R5_SOURCE_INFO = new Array();
/*
Migration_Continue_INFO[0] = UUID, ex:1234:1234:1234:1234
Migration_Continue_INFO[1] = Device Name, ex:"sdc,sdd"
*/
var Migration_Continue_INFO = new Array();