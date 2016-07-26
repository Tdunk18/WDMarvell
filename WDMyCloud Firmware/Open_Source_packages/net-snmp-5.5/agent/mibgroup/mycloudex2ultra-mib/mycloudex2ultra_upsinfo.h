#ifndef MYCLOUDEX2ULTRA_UPSINFO_H
#define MYCLOUDEX2ULTRA_UPSINFO_H

typedef struct _MYCLOUDEX2ULTRA_UPS_TABLE_
{
	char	ups_mode[64];
	char	ups_manufacturer[64];
	char	ups_product[64];
	char	ups_batterycharge[64];
	char	ups_status[64];
	long	ups_num;

	//Illustrate using a simple linked list
	int             			valid;
	struct _MYCLOUDEX2ULTRA_UPS_TABLE_ 	*next;
}mycloudex2ultraUPSTable, *ID_mycloudex2ultraUPSTable;
#define MYCLOUDEX2ULTRA_UPS_TABLE_SIZE	(sizeof(struct _MYCLOUDEX2ULTRA_VOLUME_TABLE_))

#define MYCLOUDEX2ULTRA_UPS_NUM		1
#define MYCLOUDEX2ULTRA_UPS_MODE				2
#define MYCLOUDEX2ULTRA_UPS_MANUFACTURER			3
#define MYCLOUDEX2ULTRA_UPS_PRODUCT			4
#define MYCLOUDEX2ULTRA_UPS_BATTERYCHARGE			5
#define MYCLOUDEX2ULTRA_UPS_STATUS		6



void initialize_table_mycloudex2ultraUPSTable(void);
void mycloudex2ultraUPSTable_Initialize(void);
Netsnmp_First_Data_Point mycloudex2ultraUPSTable_get_first_data_point;
Netsnmp_Next_Data_Point mycloudex2ultraUPSTable_get_next_data_point;
Netsnmp_Node_Handler mycloudex2ultraUPSTable_handler;
ID_mycloudex2ultraUPSTable mycloudex2ultraUPSTable_createEntry(long ups_num);

#endif
