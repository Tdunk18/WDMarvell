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

#include "wdmyclouddl2100_raidinfo.h"
#include "getinfo.h"
#include "platform.h" //for snmp oid

ID_wdmyclouddl2100volumeTable	wdmyclouddl2100VolumeTable_head;
VOLUME_INFO				volume_info[MAX_VOLUME_NUM];

/*-----------------------------------------------------------------
* ROUTINE NAME - init_wdmyclouddl2100_raidinfo
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void init_wdmyclouddl2100_raidinfo(void)
{
	//volume table
	initialize_table_wdmyclouddl2100VolumeTable();
}

/*-----------------------------------------------------------------
* ROUTINE NAME - wdmyclouddl2100VolumeTable_Initialize
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void wdmyclouddl2100VolumeTable_Initialize(void)
{
	ID_wdmyclouddl2100volumeTable	entry;
	int						entry_num;
	int						i;

	memset(volume_info, 0, sizeof volume_info);

	entry_num=get_volume_info(volume_info);

	for(i=1; i<=MAX_VOLUME_NUM; i++)
	{
		//create entry
		entry = wdmyclouddl2100VolumeTable_createEntry((long)i);

		//make table entry valid and visible ,1:visible
		entry->valid = volume_info[i-1].enable;


		entry->volume_num=volume_info[i-1].volume_num;
		strcpy(entry->volume_name, volume_info[i-1].name);
		strcpy(entry->volume_fs_type, volume_info[i-1].fs_type);
		strcpy(entry->volume_raid_level, volume_info[i-1].raid_level);
		strcpy(entry->volume_size, volume_info[i-1].size);
		strcpy(entry->volume_free_space, volume_info[i-1].free_space);
	}
}


void wdmyclouddl2100VolumeTable_get(void)
{
	ID_wdmyclouddl2100volumeTable		entry;
	int						i;

	entry = wdmyclouddl2100VolumeTable_head;
	get_volume_info(volume_info);

	for(i=MAX_VOLUME_NUM; i>=1; i--)
	{
		//create entry


		//make table entry valid and visible ,1:visible
		entry->valid = volume_info[i-1].enable;

		entry->volume_num=volume_info[i-1].volume_num;
		strcpy(entry->volume_name, volume_info[i-1].name);
		strcpy(entry->volume_fs_type, volume_info[i-1].fs_type);
		strcpy(entry->volume_raid_level, volume_info[i-1].raid_level);
		strcpy(entry->volume_size, volume_info[i-1].size);
		strcpy(entry->volume_free_space, volume_info[i-1].free_space);
		entry=entry->next;
	}


}

/*-----------------------------------------------------------------
* ROUTINE NAME - initialize_table_wdmyclouddl2100VolumeTable
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void initialize_table_wdmyclouddl2100VolumeTable(void)
{
	static oid wdmyclouddl2100VolumeTable_oid[]		= { NAS_COMMA_OID, 1, 9 };
	netsnmp_handler_registration 	*reg;
    netsnmp_iterator_info 			*iinfo;
    netsnmp_table_registration_info	*table_info;

	reg = netsnmp_create_handler_registration("wdmyclouddl2100VolumeTable",
												wdmyclouddl2100VolumeTable_handler,
												wdmyclouddl2100VolumeTable_oid,
												OID_LENGTH(wdmyclouddl2100VolumeTable_oid),
												HANDLER_CAN_RONLY);

	table_info = SNMP_MALLOC_TYPEDEF(netsnmp_table_registration_info);
	netsnmp_table_helper_add_indexes(table_info, ASN_INTEGER, 0);

	table_info->min_column = WDMYCLOUDDL2100_VOLUME_NUM;
	table_info->max_column = WDMYCLOUDDL2100_VOLUME_FREE_SPACE;

	iinfo = SNMP_MALLOC_TYPEDEF(netsnmp_iterator_info);
    iinfo->get_first_data_point = wdmyclouddl2100VolumeTable_get_first_data_point;
    iinfo->get_next_data_point = wdmyclouddl2100VolumeTable_get_next_data_point;
    iinfo->table_reginfo = table_info;

    netsnmp_register_table_iterator(reg, iinfo);

    //Initialise the contents of the table here
    wdmyclouddl2100VolumeTable_Initialize();
}

/*-----------------------------------------------------------------
* ROUTINE NAME - wdmyclouddl2100VolumeTable_get_first_data_point
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
netsnmp_variable_list *wdmyclouddl2100VolumeTable_get_first_data_point(void **my_loop_context,
												void **my_data_context,
												netsnmp_variable_list *
												put_index_data,
												netsnmp_iterator_info *mydata)
{
    *my_loop_context = wdmyclouddl2100VolumeTable_head;
    return wdmyclouddl2100VolumeTable_get_next_data_point(my_loop_context,
                                                 my_data_context,
                                                 put_index_data, mydata);
}

/*-----------------------------------------------------------------
* ROUTINE NAME - wdmyclouddl2100VolumeTable_get_next_data_point
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
netsnmp_variable_list *wdmyclouddl2100VolumeTable_get_next_data_point(void **my_loop_context,
											void **my_data_context,
											netsnmp_variable_list * put_index_data,
											netsnmp_iterator_info *mydata)
{
    ID_wdmyclouddl2100volumeTable entry = (ID_wdmyclouddl2100volumeTable)*my_loop_context;
    netsnmp_variable_list *idx = put_index_data;

    if (entry)
    {
        snmp_set_var_typed_integer(idx, ASN_INTEGER, entry->volume_num);
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
* ROUTINE NAME - wdmyclouddl2100VolumeTable_createEntry
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
ID_wdmyclouddl2100volumeTable wdmyclouddl2100VolumeTable_createEntry(long entry_num)
{
    ID_wdmyclouddl2100volumeTable entry;

    entry = SNMP_MALLOC_TYPEDEF(struct _WDMYCLOUDDL2100_VOLUME_TABLE_);
    if (!entry)
        return NULL;

		entry->entry_num = entry_num;
    entry->next = wdmyclouddl2100VolumeTable_head;
    wdmyclouddl2100VolumeTable_head = entry;
    return entry;
}

/*-----------------------------------------------------------------
* ROUTINE NAME - wdmyclouddl2100VolumeTable_removeEntry
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void wdmyclouddl2100VolumeTable_removeEntry(ID_wdmyclouddl2100volumeTable entry)
{
    ID_wdmyclouddl2100volumeTable	ptr, prev;

	if (!entry)
		return;                 /* Nothing to remove */

    for (ptr = wdmyclouddl2100VolumeTable_head, prev = NULL;
         ptr != NULL; prev = ptr, ptr = ptr->next)
	{
		if (ptr == entry)
			break;
	}
	if (!ptr)
		return;                 /* Can't find it */

	if (prev == NULL)
		wdmyclouddl2100VolumeTable_head = ptr->next;
	else
		prev->next = ptr->next;

    SNMP_FREE(entry);           /* XXX - release any other internal resources */
}

/*-----------------------------------------------------------------
* ROUTINE NAME - wdmyclouddl2100VolumeTable_removeEntry_byNum
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void wdmyclouddl2100VolumeTable_removeEntry_byNum(long num)
{
	ID_wdmyclouddl2100volumeTable	ptr, prev;

	for (ptr = wdmyclouddl2100VolumeTable_head, prev = NULL;
		ptr != NULL; prev = ptr, ptr = ptr->next)
	{
		if (ptr->volume_num == num)
		break;
    }
	if (!ptr)
		return;                 /* Can't find it */

	if (prev == NULL)
		wdmyclouddl2100VolumeTable_head = ptr->next;
	else
		prev->next = ptr->next;

	SNMP_FREE(ptr);           /* XXX - release any other internal resources */
}

/*-----------------------------------------------------------------
* ROUTINE NAME - wdmyclouddl2100VolumeTable_handler
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
int wdmyclouddl2100VolumeTable_handler(netsnmp_mib_handler *handler,
			netsnmp_handler_registration *reginfo,
			netsnmp_agent_request_info *reqinfo,
			netsnmp_request_info *requests)
{
	netsnmp_request_info		*request;
	//netsnmp_variable_list		*requestvb;
	netsnmp_table_request_info	*table_info;
	ID_wdmyclouddl2100volumeTable		table_entry;


	wdmyclouddl2100VolumeTable_get();

	switch(reqinfo->mode)
	{
		//Read-support (also covers GetNext requests)
		case MODE_GET:
			for (request = requests; request; request = request->next)
			{
				//requestvb = request->requestvb;	//????

				table_entry = (ID_wdmyclouddl2100volumeTable)netsnmp_extract_iterator_context(request);
				table_info = netsnmp_extract_table_info(request);

				if(table_entry && (table_entry->valid == 0))
				{
					netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
					continue;
				}

				switch (table_info->colnum)
				{
					case WDMYCLOUDDL2100_VOLUME_NUM:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}
						snmp_set_var_typed_integer(request->requestvb, ASN_INTEGER,
                                           table_entry->volume_num);
						break;

					case WDMYCLOUDDL2100_VOLUME_NAME:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}

						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->volume_name,
                                         strlen(table_entry->volume_name));
						break;

					case WDMYCLOUDDL2100_VOLUME_FS_TYPE:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}
						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->volume_fs_type,
                                         strlen(table_entry->volume_fs_type));
						break;

					case WDMYCLOUDDL2100_VOLUME_RAID_LEVEL:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}
						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->volume_raid_level,
                                         strlen(table_entry->volume_raid_level));
						break;

					case WDMYCLOUDDL2100_VOLUME_SIZE:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}
						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->volume_size,
                                         strlen(table_entry->volume_size));
						break;

					case WDMYCLOUDDL2100_VOLUME_FREE_SPACE:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}

						//get current free space for volume
//						get_volume_free_space(volume_info);
//						strcpy(table_entry->volume_free_space, volume_info[table_entry->entry_num-1].free_space);

						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->volume_free_space,
                                         strlen(table_entry->volume_free_space));
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






