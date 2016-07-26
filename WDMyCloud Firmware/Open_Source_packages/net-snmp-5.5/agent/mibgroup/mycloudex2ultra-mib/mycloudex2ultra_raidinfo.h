#ifndef MYCLOUDEX2ULTRA_RAIDINFO_H
#define MYCLOUDEX2ULTRA_RAIDINFO_H

typedef struct _MYCLOUDEX2ULTRA_VOLUME_TABLE_
{
	int entry_num;
	long	volume_num;
	char	volume_name[64];
	char	volume_fs_type[64];
	char	volume_raid_level[64];
	char	volume_size[64];
	char	volume_free_space[64];

	//Illustrate using a simple linked list
	int             				valid;
	struct _MYCLOUDEX2ULTRA_VOLUME_TABLE_ 	*next;
}mycloudex2ultravolumeTable, *ID_mycloudex2ultravolumeTable;
#define MYCLOUDEX2ULTRAVOLUME_TABLE_SIZE	(sizeof(struct _MYCLOUDEX2ULTRA_VOLUME_TABLE_))

#define MYCLOUDEX2ULTRA_VOLUME_NUM			1
#define MYCLOUDEX2ULTRA_VOLUME_NAME			2
#define MYCLOUDEX2ULTRA_VOLUME_FS_TYPE		3
#define MYCLOUDEX2ULTRA_VOLUME_RAID_LEVEL	4
#define MYCLOUDEX2ULTRA_VOLUME_SIZE			5
#define MYCLOUDEX2ULTRA_VOLUME_FREE_SPACE	6


void initialize_table_mycloudex2ultraVolumeTable(void);
Netsnmp_First_Data_Point mycloudex2ultraVolumeTable_get_first_data_point;
Netsnmp_Next_Data_Point mycloudex2ultraVolumeTable_get_next_data_point;
Netsnmp_Node_Handler mycloudex2ultraVolumeTable_handler;
ID_mycloudex2ultravolumeTable mycloudex2ultraVolumeTable_createEntry(long volume_num);
void mycloudex2ultraVolumeTable_Initialize(void);


#endif
