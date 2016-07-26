#ifndef WDMYCLOUDEX2100_UPSINFO_H
#define WDMYCLOUDEX2100_UPSINFO_H

typedef struct _WDMYCLOUDEX2100_UPS_TABLE_
{
	char	ups_mode[64];
	char	ups_manufacturer[64];
	char	ups_product[64];
	char	ups_batterycharge[64];
	char	ups_status[64];
	long	ups_num;

	//Illustrate using a simple linked list
	int             			valid;
	struct _WDMYCLOUDEX2100_UPS_TABLE_ 	*next;
}wdmycloudex2100UPSTable, *ID_wdmycloudex2100UPSTable;
#define WDMYCLOUDEX2100_UPS_TABLE_SIZE	(sizeof(struct _WDMYCLOUDEX2100_VOLUME_TABLE_))

#define WDMYCLOUDEX2100_UPS_NUM		1
#define WDMYCLOUDEX2100_UPS_MODE				2
#define WDMYCLOUDEX2100_UPS_MANUFACTURER			3
#define WDMYCLOUDEX2100_UPS_PRODUCT			4
#define WDMYCLOUDEX2100_UPS_BATTERYCHARGE			5
#define WDMYCLOUDEX2100_UPS_STATUS		6



void initialize_table_wdmycloudex2100UPSTable(void);
void wdmycloudex2100UPSTable_Initialize(void);
Netsnmp_First_Data_Point wdmycloudex2100UPSTable_get_first_data_point;
Netsnmp_Next_Data_Point wdmycloudex2100UPSTable_get_next_data_point;
Netsnmp_Node_Handler wdmycloudex2100UPSTable_handler;
ID_wdmycloudex2100UPSTable wdmycloudex2100UPSTable_createEntry(long ups_num);

#endif
