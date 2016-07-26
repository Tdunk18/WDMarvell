#ifndef WDMYCLOUDDL2100_HDINFO_H
#define WDMYCLOUDDL2100_HDINFO_H

typedef struct _WDMYCLOUDDL2100_DISK_TABLE_
{
	long	disk_num;
	char	disk_vendor[64];
	char	disk_model[64];
	char	disk_serial[64];
	char	disk_temperature[64];
	char	disk_capacity[64];

	//Illustrate using a simple linked list
	int             			valid;
	struct _WDMYCLOUDDL2100_DISK_TABLE_ 	*next;
}wdmyclouddl2100diskTable, *ID_wdmyclouddl2100diskTable;
#define WDMYCLOUDDL2100_DISK_TABLE_SIZE	(sizeof(struct _WDMYCLOUDDL2100_VOLUME_TABLE_))

#define WDMYCLOUDDL2100_DISK_NUM				1
#define WDMYCLOUDDL2100_DISK_VENDOR			2
#define WDMYCLOUDDL2100_DISK_MODEL			3
#define WDMYCLOUDDL2100_DISK_SERIAL			4
#define WDMYCLOUDDL2100_DISK_TEMPERATURE		5
#define WDMYCLOUDDL2100_DISK_CAPACITY		6


void initialize_table_wdmyclouddl2100DiskTable(void);
void wdmyclouddl2100DiskTable_Initialize(void);
Netsnmp_First_Data_Point wdmyclouddl2100DiskTable_get_first_data_point;
Netsnmp_Next_Data_Point wdmyclouddl2100DiskTable_get_next_data_point;
Netsnmp_Node_Handler wdmyclouddl2100DiskTable_handler;
ID_wdmyclouddl2100diskTable wdmyclouddl2100DiskTable_createEntry(long disk_num);

#endif
