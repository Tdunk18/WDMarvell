#ifndef WDMYCLOUDDL4100_UPSINFO_H
#define WDMYCLOUDDL4100_UPSINFO_H

typedef struct _WDMYCLOUDDL4100_UPS_TABLE_
{
	char	ups_mode[64];
	char	ups_manufacturer[64];
	char	ups_product[64];
	char	ups_batterycharge[64];
	char	ups_status[64];
	long	ups_num;

	//Illustrate using a simple linked list
	int             			valid;
	struct _WDMYCLOUDDL4100_UPS_TABLE_ 	*next;
}wdmyclouddl4100UPSTable, *ID_wdmyclouddl4100UPSTable;
#define WDMYCLOUDDL4100_UPS_TABLE_SIZE	(sizeof(struct _WDMYCLOUDDL4100_VOLUME_TABLE_))

#define WDMYCLOUDDL4100_UPS_NUM		1
#define WDMYCLOUDDL4100_UPS_MODE				2
#define WDMYCLOUDDL4100_UPS_MANUFACTURER			3
#define WDMYCLOUDDL4100_UPS_PRODUCT			4
#define WDMYCLOUDDL4100_UPS_BATTERYCHARGE			5
#define WDMYCLOUDDL4100_UPS_STATUS		6



void initialize_table_wdmyclouddl4100UPSTable(void);
void wdmyclouddl4100UPSTable_Initialize(void);
Netsnmp_First_Data_Point wdmyclouddl4100UPSTable_get_first_data_point;
Netsnmp_Next_Data_Point wdmyclouddl4100UPSTable_get_next_data_point;
Netsnmp_Node_Handler wdmyclouddl4100UPSTable_handler;
ID_wdmyclouddl4100UPSTable wdmyclouddl4100UPSTable_createEntry(long ups_num);

#endif
