#ifndef MYCLOUDEX2ULTRA_HDINFO_H
#define MYCLOUDEX2ULTRA_HDINFO_H

typedef struct _MYCLOUDEX2ULTRA_DISK_TABLE_
{
	long	disk_num;
	char	disk_vendor[64];
	char	disk_model[64];
	char	disk_serial[64];
	char	disk_temperature[64];
	char	disk_capacity[64];

	//Illustrate using a simple linked list
	int             			valid;
	struct _MYCLOUDEX2ULTRA_DISK_TABLE_ 	*next;
}mycloudex2ultradiskTable, *ID_mycloudex2ultradiskTable;
#define MYCLOUDEX2ULTRA_DISK_TABLE_SIZE	(sizeof(struct _MYCLOUDEX2ULTRA_VOLUME_TABLE_))

#define MYCLOUDEX2ULTRA_DISK_NUM				1
#define MYCLOUDEX2ULTRA_DISK_VENDOR			2
#define MYCLOUDEX2ULTRA_DISK_MODEL			3
#define MYCLOUDEX2ULTRA_DISK_SERIAL			4
#define MYCLOUDEX2ULTRA_DISK_TEMPERATURE		5
#define MYCLOUDEX2ULTRA_DISK_CAPACITY		6


void initialize_table_mycloudex2ultraDiskTable(void);
void mycloudex2ultraDiskTable_Initialize(void);
Netsnmp_First_Data_Point mycloudex2ultraDiskTable_get_first_data_point;
Netsnmp_Next_Data_Point mycloudex2ultraDiskTable_get_next_data_point;
Netsnmp_Node_Handler mycloudex2ultraDiskTable_handler;
ID_mycloudex2ultradiskTable mycloudex2ultraDiskTable_createEntry(long disk_num);

#endif
