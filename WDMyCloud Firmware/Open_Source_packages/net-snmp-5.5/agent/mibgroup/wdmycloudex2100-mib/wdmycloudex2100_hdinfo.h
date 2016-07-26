#ifndef WDMYCLOUDEX2100_HDINFO_H
#define WDMYCLOUDEX2100_HDINFO_H

typedef struct _WDMYCLOUDEX2100_DISK_TABLE_
{
	long	disk_num;
	char	disk_vendor[64];
	char	disk_model[64];
	char	disk_serial[64];
	char	disk_temperature[64];
	char	disk_capacity[64];

	//Illustrate using a simple linked list
	int             			valid;
	struct _WDMYCLOUDEX2100_DISK_TABLE_ 	*next;
}wdmycloudex2100diskTable, *ID_wdmycloudex2100diskTable;
#define WDMYCLOUDEX2100_DISK_TABLE_SIZE	(sizeof(struct _WDMYCLOUDEX2100_VOLUME_TABLE_))

#define WDMYCLOUDEX2100_DISK_NUM				1
#define WDMYCLOUDEX2100_DISK_VENDOR			2
#define WDMYCLOUDEX2100_DISK_MODEL			3
#define WDMYCLOUDEX2100_DISK_SERIAL			4
#define WDMYCLOUDEX2100_DISK_TEMPERATURE		5
#define WDMYCLOUDEX2100_DISK_CAPACITY		6


void initialize_table_wdmycloudex2100DiskTable(void);
void wdmycloudex2100DiskTable_Initialize(void);
Netsnmp_First_Data_Point wdmycloudex2100DiskTable_get_first_data_point;
Netsnmp_Next_Data_Point wdmycloudex2100DiskTable_get_next_data_point;
Netsnmp_Node_Handler wdmycloudex2100DiskTable_handler;
ID_wdmycloudex2100diskTable wdmycloudex2100DiskTable_createEntry(long disk_num);

#endif
