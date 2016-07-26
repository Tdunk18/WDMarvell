#ifndef WDMYCLOUDDL2100_UPSINFO_H
#define WDMYCLOUDDL2100_UPSINFO_H

typedef struct _WDMYCLOUDDL2100_UPS_TABLE_
{
	char	ups_mode[64];
	char	ups_manufacturer[64];
	char	ups_product[64];
	char	ups_batterycharge[64];
	char	ups_status[64];
	long	ups_num;

	//Illustrate using a simple linked list
	int             			valid;
	struct _WDMYCLOUDDL2100_UPS_TABLE_ 	*next;
}wdmyclouddl2100UPSTable, *ID_wdmyclouddl2100UPSTable;
#define WDMYCLOUDDL2100_UPS_TABLE_SIZE	(sizeof(struct _WDMYCLOUDDL2100_VOLUME_TABLE_))

#define WDMYCLOUDDL2100_UPS_NUM		1
#define WDMYCLOUDDL2100_UPS_MODE				2
#define WDMYCLOUDDL2100_UPS_MANUFACTURER			3
#define WDMYCLOUDDL2100_UPS_PRODUCT			4
#define WDMYCLOUDDL2100_UPS_BATTERYCHARGE			5
#define WDMYCLOUDDL2100_UPS_STATUS		6



void initialize_table_wdmyclouddl2100UPSTable(void);
void wdmyclouddl2100UPSTable_Initialize(void);
Netsnmp_First_Data_Point wdmyclouddl2100UPSTable_get_first_data_point;
Netsnmp_Next_Data_Point wdmyclouddl2100UPSTable_get_next_data_point;
Netsnmp_Node_Handler wdmyclouddl2100UPSTable_handler;
ID_wdmyclouddl2100UPSTable wdmyclouddl2100UPSTable_createEntry(long ups_num);

#endif
