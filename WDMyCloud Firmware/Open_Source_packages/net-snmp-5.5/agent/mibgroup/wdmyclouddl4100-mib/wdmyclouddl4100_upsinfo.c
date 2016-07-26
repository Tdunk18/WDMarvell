#include <net-snmp/net-snmp-config.h>
#include <net-snmp/net-snmp-includes.h>
#include <net-snmp/agent/net-snmp-agent-includes.h>
#if HAVE_STDLIB_H
#include <stdlib.h>
#endif
#if HAVE_STRING_H
#include <string.h>
#else
#include <strings.h>
#endif
#include <stdarg.h>
#include <fcntl.h>
#include "wdmyclouddl4100_upsinfo.h"
#include "getinfo.h"
#include "platform.h" //for snmp oid

ID_wdmyclouddl4100UPSTable		wdmyclouddl4100UPSTable_head;
UPS_INFO				ups_info[MAX_UPS_NUM];

/*-----------------------------------------------------------------
* ROUTINE NAME - init_wdmyclouddl4100_hdinfo
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void init_wdmyclouddl4100_upsinfo(void)
{
	//UPS table
	initialize_table_wdmyclouddl4100UPSTable();
}

/*-----------------------------------------------------------------
* ROUTINE NAME - wdmyclouddl4100UPSTable_Initialize
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void wdmyclouddl4100UPSTable_Initialize(void)
{
	ID_wdmyclouddl4100UPSTable		entry;
	int						i;


	memset(ups_info, 0, sizeof ups_info);


	get_ups_info(ups_info);

	for(i=1; i<=MAX_UPS_NUM; i++)
	{
		//create entry
		entry = wdmyclouddl4100UPSTable_createEntry((long)i);

		entry->valid = ups_info[i-1].enable;

		strcpy(entry->ups_mode, ups_info[i-1].mode);
		strcpy(entry->ups_manufacturer, ups_info[i-1].manufacturer);
		strcpy(entry->ups_product, ups_info[i-1].product);
		strcpy(entry->ups_batterycharge, ups_info[i-1].batterycharge);
		strcpy(entry->ups_status, ups_info[i-1].status);

	}

}


/*-----------------------------------------------------------------
* ROUTINE NAME - wdmyclouddl4100UPSTable_get
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void wdmyclouddl4100UPSTable_get(void)
{
	ID_wdmyclouddl4100UPSTable		entry;
	int						i;

	entry = wdmyclouddl4100UPSTable_head;
	get_ups_info(ups_info);

	for(i=MAX_UPS_NUM; i>=1; i--)
	{
//now_printf("i %d\n", i);
//		now_printf("mode %s\n", ups_info[i-1].mode);
//		now_printf("manufacturer %s\n", ups_info[i-1].manufacturer);
//		now_printf("product %s\n", ups_info[i-1].product);
//		now_printf("batterycharge %s\n", ups_info[i-1].batterycharge);
//		now_printf("status %s\n", ups_info[i-1].status);

		entry->valid = ups_info[i-1].enable;

		strcpy(entry->ups_mode, ups_info[i-1].mode);
		strcpy(entry->ups_manufacturer, ups_info[i-1].manufacturer);
		strcpy(entry->ups_product, ups_info[i-1].product);
		strcpy(entry->ups_batterycharge, ups_info[i-1].batterycharge);
		strcpy(entry->ups_status, ups_info[i-1].status);
		entry=entry->next;
	}


}


/*-----------------------------------------------------------------
* ROUTINE NAME - initialize_table_wdmyclouddl4100UPSTable
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void initialize_table_wdmyclouddl4100UPSTable(void)
{
	static oid wdmyclouddl4100UPSTable_oid[]		= { NAS_COMMA_OID, 1, 11 };
	netsnmp_handler_registration 	*reg;
    netsnmp_iterator_info 			*iinfo;
    netsnmp_table_registration_info	*table_info;

	reg = netsnmp_create_handler_registration("wdmyclouddl4100UPSTable",
												wdmyclouddl4100UPSTable_handler,
												wdmyclouddl4100UPSTable_oid,
												OID_LENGTH(wdmyclouddl4100UPSTable_oid),
												HANDLER_CAN_RONLY);

	table_info = SNMP_MALLOC_TYPEDEF(netsnmp_table_registration_info);
	netsnmp_table_helper_add_indexes(table_info, ASN_INTEGER, 0);

	table_info->min_column = WDMYCLOUDDL4100_UPS_NUM;
	table_info->max_column = WDMYCLOUDDL4100_UPS_STATUS;

	iinfo = SNMP_MALLOC_TYPEDEF(netsnmp_iterator_info);
    iinfo->get_first_data_point = wdmyclouddl4100UPSTable_get_first_data_point;
    iinfo->get_next_data_point = wdmyclouddl4100UPSTable_get_next_data_point;
    iinfo->table_reginfo = table_info;

    netsnmp_register_table_iterator(reg, iinfo);

    //Initialise the contents of the table here
    wdmyclouddl4100UPSTable_Initialize();
}

/*-----------------------------------------------------------------
* ROUTINE NAME - wdmyclouddl4100VolumeTable_get_first_data_point
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
netsnmp_variable_list *wdmyclouddl4100UPSTable_get_first_data_point(void **my_loop_context,
												void **my_data_context,
												netsnmp_variable_list *
												put_index_data,
												netsnmp_iterator_info *mydata)
{
    *my_loop_context = wdmyclouddl4100UPSTable_head;
    return wdmyclouddl4100UPSTable_get_next_data_point(my_loop_context,
                                                 my_data_context,
                                                 put_index_data, mydata);
}

/*-----------------------------------------------------------------
* ROUTINE NAME - wdmyclouddl4100VolumeTable_get_next_data_point
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
netsnmp_variable_list *wdmyclouddl4100UPSTable_get_next_data_point(void **my_loop_context,
											void **my_data_context,
											netsnmp_variable_list * put_index_data,
											netsnmp_iterator_info *mydata)
{
    ID_wdmyclouddl4100UPSTable entry = (ID_wdmyclouddl4100UPSTable)*my_loop_context;
    netsnmp_variable_list *idx = put_index_data;

    if (entry)
    {
        snmp_set_var_typed_integer(idx, ASN_INTEGER, entry->ups_num);
        idx = idx->next_variable;
        *my_data_context = (void *) entry;
        *my_loop_context = (void *) entry->next;
        return put_index_data;
    }
    else
    {
        return NULL;
    }
}

/*-----------------------------------------------------------------
* ROUTINE NAME - wdmyclouddl4100UPSTable_createEntry
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
ID_wdmyclouddl4100UPSTable wdmyclouddl4100UPSTable_createEntry(long ups_num)
{
    ID_wdmyclouddl4100UPSTable entry;

    entry = SNMP_MALLOC_TYPEDEF(struct _WDMYCLOUDDL4100_UPS_TABLE_);
    if (!entry)
        return NULL;

    entry->ups_num = ups_num;
    entry->next = wdmyclouddl4100UPSTable_head;
    wdmyclouddl4100UPSTable_head = entry;
    return entry;
}

/*-----------------------------------------------------------------
* ROUTINE NAME - wdmyclouddl4100UPSTable_handler
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
int wdmyclouddl4100UPSTable_handler(netsnmp_mib_handler *handler,
			netsnmp_handler_registration *reginfo,
			netsnmp_agent_request_info *reqinfo,
			netsnmp_request_info *requests)
{
	netsnmp_request_info		*request;
	//netsnmp_variable_list		*requestvb;
	netsnmp_table_request_info	*table_info;
	ID_wdmyclouddl4100UPSTable			table_entry;

	wdmyclouddl4100UPSTable_get();

	switch(reqinfo->mode)
	{
		//Read-support (also covers GetNext requests)
		case MODE_GET:
			for (request = requests; request; request = request->next)
			{
				//requestvb = request->requestvb;	//????


				table_entry = (ID_wdmyclouddl4100UPSTable)netsnmp_extract_iterator_context(request);
				table_info = netsnmp_extract_table_info(request);


				if(table_entry && (table_entry->valid == 0))
				{
					netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
					continue;
				}

				switch (table_info->colnum)
				{
					case WDMYCLOUDDL4100_UPS_NUM:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}
						snmp_set_var_typed_integer(request->requestvb, ASN_INTEGER,
                                           table_entry->ups_num);
						break;

					case WDMYCLOUDDL4100_UPS_MODE:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}

						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->ups_mode,
                                         strlen(table_entry->ups_mode));
						break;
//						netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
//						continue;

					case WDMYCLOUDDL4100_UPS_MANUFACTURER:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}
						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->ups_manufacturer,
                                         strlen(table_entry->ups_manufacturer));
						break;

					case WDMYCLOUDDL4100_UPS_PRODUCT:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}
						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->ups_product,
                                         strlen(table_entry->ups_product));
						break;

					case WDMYCLOUDDL4100_UPS_BATTERYCHARGE:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}

						//TODO:get current value for batterycharge
//						get_one_ups_batterycharge(ups_info, table_entry->ups_num-1);
//						strcpy(table_entry->ups_batterycharge, ups_info[table_entry->ups_num-1].batterycharge);

						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->ups_batterycharge,
                                         strlen(table_entry->ups_batterycharge));

						break;

					case WDMYCLOUDDL4100_UPS_STATUS:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}
						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->ups_status,
                                         strlen(table_entry->ups_status));
						break;

					default:
						netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHOBJECT);
						break;
				}
			}
			break;
	}

	return SNMP_ERR_NOERROR;
}



