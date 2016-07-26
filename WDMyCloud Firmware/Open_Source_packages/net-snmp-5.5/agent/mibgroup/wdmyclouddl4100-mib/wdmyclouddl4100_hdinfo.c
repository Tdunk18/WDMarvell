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
#include "wdmyclouddl4100_hdinfo.h"
#include "getinfo.h"
#include "platform.h" //for snmp oid

ID_wdmyclouddl4100diskTable		wdmyclouddl4100DiskTable_head;
DISK_INFO				disk_info[MAX_DISK_NUM];

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
void init_wdmyclouddl4100_hdinfo(void)
{
	//disk table
	initialize_table_wdmyclouddl4100DiskTable();
}

/*-----------------------------------------------------------------
* ROUTINE NAME - wdmyclouddl4100DiskTable_Initialize
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void wdmyclouddl4100DiskTable_Initialize(void)
{
	ID_wdmyclouddl4100diskTable		entry;
	int						i;


	memset(disk_info, 0, sizeof disk_info);


	get_hd_info(disk_info);

	for(i=1; i<=MAX_DISK_NUM; i++)
	{
		//create entry
		entry = wdmyclouddl4100DiskTable_createEntry((long)i);

		//make table entry valid and visible ,1:visible
		entry->valid = disk_info[i-1].enable;

		strcpy(entry->disk_vendor, disk_info[i-1].vendor);
		strcpy(entry->disk_model, disk_info[i-1].model);
		strcpy(entry->disk_serial, disk_info[i-1].serial);
		strcpy(entry->disk_temperature, disk_info[i-1].temperature);
		strcpy(entry->disk_capacity, disk_info[i-1].capacity);

	}

}


/*-----------------------------------------------------------------
* ROUTINE NAME - wdmyclouddl4100DiskTable_get
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void wdmyclouddl4100DiskTable_get(void)
{
	ID_wdmyclouddl4100diskTable		entry;
	int						i;

	entry = wdmyclouddl4100DiskTable_head;
	get_hd_info(disk_info);

	for(i=MAX_DISK_NUM; i>=1; i--)
	{
		//create entry


		//make table entry valid and visible ,1:visible
		entry->valid = disk_info[i-1].enable;

		strcpy(entry->disk_vendor, disk_info[i-1].vendor);
		strcpy(entry->disk_model, disk_info[i-1].model);
		strcpy(entry->disk_serial, disk_info[i-1].serial);
		strcpy(entry->disk_temperature, disk_info[i-1].temperature);
		strcpy(entry->disk_capacity, disk_info[i-1].capacity);
//		if(i==3)
//			strcpy(entry->disk_vendor, "qqqqq");
		entry=entry->next;
	}


}


/*-----------------------------------------------------------------
* ROUTINE NAME - initialize_table_wdmyclouddl4100DiskTable
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void initialize_table_wdmyclouddl4100DiskTable(void)
{
	static oid wdmyclouddl4100DiskTable_oid[]		= { NAS_COMMA_OID, 1, 10 };
	netsnmp_handler_registration 	*reg;
    netsnmp_iterator_info 			*iinfo;
    netsnmp_table_registration_info	*table_info;

	reg = netsnmp_create_handler_registration("wdmyclouddl4100DiskTable",
												wdmyclouddl4100DiskTable_handler,
												wdmyclouddl4100DiskTable_oid,
												OID_LENGTH(wdmyclouddl4100DiskTable_oid),
												HANDLER_CAN_RONLY);

	table_info = SNMP_MALLOC_TYPEDEF(netsnmp_table_registration_info);
	netsnmp_table_helper_add_indexes(table_info, ASN_INTEGER, 0);

	table_info->min_column = WDMYCLOUDDL4100_DISK_NUM;
	table_info->max_column = WDMYCLOUDDL4100_DISK_CAPACITY;

	iinfo = SNMP_MALLOC_TYPEDEF(netsnmp_iterator_info);
    iinfo->get_first_data_point = wdmyclouddl4100DiskTable_get_first_data_point;
    iinfo->get_next_data_point = wdmyclouddl4100DiskTable_get_next_data_point;
    iinfo->table_reginfo = table_info;

    netsnmp_register_table_iterator(reg, iinfo);

    //Initialise the contents of the table here
    wdmyclouddl4100DiskTable_Initialize();
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
netsnmp_variable_list *wdmyclouddl4100DiskTable_get_first_data_point(void **my_loop_context,
												void **my_data_context,
												netsnmp_variable_list *
												put_index_data,
												netsnmp_iterator_info *mydata)
{
    *my_loop_context = wdmyclouddl4100DiskTable_head;
    return wdmyclouddl4100DiskTable_get_next_data_point(my_loop_context,
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
netsnmp_variable_list *wdmyclouddl4100DiskTable_get_next_data_point(void **my_loop_context,
											void **my_data_context,
											netsnmp_variable_list * put_index_data,
											netsnmp_iterator_info *mydata)
{
    ID_wdmyclouddl4100diskTable entry = (ID_wdmyclouddl4100diskTable)*my_loop_context;
    netsnmp_variable_list *idx = put_index_data;

    if (entry)
    {
        snmp_set_var_typed_integer(idx, ASN_INTEGER, entry->disk_num);
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
* ROUTINE NAME - wdmyclouddl4100DiskTable_createEntry
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
ID_wdmyclouddl4100diskTable wdmyclouddl4100DiskTable_createEntry(long disk_num)
{
    ID_wdmyclouddl4100diskTable entry;

    entry = SNMP_MALLOC_TYPEDEF(struct _WDMYCLOUDDL4100_DISK_TABLE_);
    if (!entry)
        return NULL;

    entry->disk_num = disk_num;
    entry->next = wdmyclouddl4100DiskTable_head;
    wdmyclouddl4100DiskTable_head = entry;
    return entry;
}

/*-----------------------------------------------------------------
* ROUTINE NAME - wdmyclouddl4100DiskTable_handler
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
int wdmyclouddl4100DiskTable_handler(netsnmp_mib_handler *handler,
			netsnmp_handler_registration *reginfo,
			netsnmp_agent_request_info *reqinfo,
			netsnmp_request_info *requests)
{
	netsnmp_request_info		*request;
	//netsnmp_variable_list		*requestvb;
	netsnmp_table_request_info	*table_info;
	ID_wdmyclouddl4100diskTable			table_entry;

//	wdmyclouddl4100DiskTable_get();

	switch(reqinfo->mode)
	{
		//Read-support (also covers GetNext requests)
		case MODE_GET:
			for (request = requests; request; request = request->next)
			{
				//requestvb = request->requestvb;	//????


				table_entry = (ID_wdmyclouddl4100diskTable)netsnmp_extract_iterator_context(request);
				table_info = netsnmp_extract_table_info(request);

				if(table_entry && (table_entry->valid == 0))
				{
					netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
					continue;
				}

				switch (table_info->colnum)
				{
					case WDMYCLOUDDL4100_DISK_NUM:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}
						snmp_set_var_typed_integer(request->requestvb, ASN_INTEGER,
                                           table_entry->disk_num);
						break;

					case WDMYCLOUDDL4100_DISK_VENDOR:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}

						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->disk_vendor,
                                         strlen(table_entry->disk_vendor));
						break;

					case WDMYCLOUDDL4100_DISK_MODEL:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}
						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->disk_model,
                                         strlen(table_entry->disk_model));
						break;

					case WDMYCLOUDDL4100_DISK_SERIAL:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}
						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->disk_serial,
                                         strlen(table_entry->disk_serial));
						break;

					case WDMYCLOUDDL4100_DISK_TEMPERATURE:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}

						//TODO:get current value for temperature
						get_one_hd_temperature(disk_info, table_entry->disk_num-1);
						strcpy(table_entry->disk_temperature, disk_info[table_entry->disk_num-1].temperature);

						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->disk_temperature,
                                         strlen(table_entry->disk_temperature));

						break;

					case WDMYCLOUDDL4100_DISK_CAPACITY:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}
						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->disk_capacity,
                                         strlen(table_entry->disk_capacity));
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



