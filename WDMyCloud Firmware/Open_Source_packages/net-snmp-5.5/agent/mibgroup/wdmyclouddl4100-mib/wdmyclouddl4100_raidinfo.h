#ifndef WDMYCLOUDDL4100_RAIDINFO_H
#define WDMYCLOUDDL4100_RAIDINFO_H

typedef struct _WDMYCLOUDDL4100_VOLUME_TABLE_
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
	struct _WDMYCLOUDDL4100_VOLUME_TABLE_ 	*next;
}wdmyclouddl4100volumeTable, *ID_wdmyclouddl4100volumeTable;
#define WDMYCLOUDDL4100VOLUME_TABLE_SIZE	(sizeof(struct _WDMYCLOUDDL4100_VOLUME_TABLE_))

#define WDMYCLOUDDL4100_VOLUME_NUM			1
#define WDMYCLOUDDL4100_VOLUME_NAME			2
#define WDMYCLOUDDL4100_VOLUME_FS_TYPE		3
#define WDMYCLOUDDL4100_VOLUME_RAID_LEVEL	4
#define WDMYCLOUDDL4100_VOLUME_SIZE			5
#define WDMYCLOUDDL4100_VOLUME_FREE_SPACE	6


void initialize_table_wdmyclouddl4100VolumeTable(void);
Netsnmp_First_Data_Point wdmyclouddl4100VolumeTable_get_first_data_point;
Netsnmp_Next_Data_Point wdmyclouddl4100VolumeTable_get_next_data_point;
Netsnmp_Node_Handler wdmyclouddl4100VolumeTable_handler;
ID_wdmyclouddl4100volumeTable wdmyclouddl4100VolumeTable_createEntry(long volume_num);
void wdmyclouddl4100VolumeTable_Initialize(void);


#endif
