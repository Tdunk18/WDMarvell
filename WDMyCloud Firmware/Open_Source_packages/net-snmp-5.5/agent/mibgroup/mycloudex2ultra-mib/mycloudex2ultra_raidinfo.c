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

#include "mycloudex2ultra_raidinfo.h"
#include "getinfo.h"
#include "platform.h" //for snmp oid

ID_mycloudex2ultravolumeTable	mycloudex2ultraVolumeTable_head;
VOLUME_INFO				volume_info[MAX_VOLUME_NUM];

/*-----------------------------------------------------------------
* ROUTINE NAME - init_mycloudex2ultra_raidinfo
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void init_mycloudex2ultra_raidinfo(void)
{
	//volume table
	initialize_table_mycloudex2ultraVolumeTable();
}

/*-----------------------------------------------------------------
* ROUTINE NAME - mycloudex2ultraVolumeTable_Initialize
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void mycloudex2ultraVolumeTable_Initialize(void)
{
	ID_mycloudex2ultravolumeTable	entry;
	int						entry_num;
	int						i;

	memset(volume_info, 0, sizeof volume_info);

	entry_num=get_volume_info(volume_info);

	for(i=1; i<=MAX_VOLUME_NUM; i++)
	{
		//create entry
		entry = mycloudex2ultraVolumeTable_createEntry((long)i);

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


void mycloudex2ultraVolumeTable_get(void)
{
	ID_mycloudex2ultravolumeTable		entry;
	int						i;

	entry = mycloudex2ultraVolumeTable_head;
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
* ROUTINE NAME - initialize_table_mycloudex2ultraVolumeTable
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void initialize_table_mycloudex2ultraVolumeTable(void)
{
	static oid mycloudex2ultraVolumeTable_oid[]		= { NAS_COMMA_OID, 1, 9 };
	netsnmp_handler_registration 	*reg;
    netsnmp_iterator_info 			*iinfo;
    netsnmp_table_registration_info	*table_info;

	reg = netsnmp_create_handler_registration("mycloudex2ultraVolumeTable",
												mycloudex2ultraVolumeTable_handler,
												mycloudex2ultraVolumeTable_oid,
												OID_LENGTH(mycloudex2ultraVolumeTable_oid),
												HANDLER_CAN_RONLY);

	table_info = SNMP_MALLOC_TYPEDEF(netsnmp_table_registration_info);
	netsnmp_table_helper_add_indexes(table_info, ASN_INTEGER, 0);

	table_info->min_column = MYCLOUDEX2ULTRA_VOLUME_NUM;
	table_info->max_column = MYCLOUDEX2ULTRA_VOLUME_FREE_SPACE;

	iinfo = SNMP_MALLOC_TYPEDEF(netsnmp_iterator_info);
    iinfo->get_first_data_point = mycloudex2ultraVolumeTable_get_first_data_point;
    iinfo->get_next_data_point = mycloudex2ultraVolumeTable_get_next_data_point;
    iinfo->table_reginfo = table_info;

    netsnmp_register_table_iterator(reg, iinfo);

    //Initialise the contents of the table here
    mycloudex2ultraVolumeTable_Initialize();
}

/*-----------------------------------------------------------------
* ROUTINE NAME - mycloudex2ultraVolumeTable_get_first_data_point
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
netsnmp_variable_list *mycloudex2ultraVolumeTable_get_first_data_point(void **my_loop_context,
												void **my_data_context,
												netsnmp_variable_list *
												put_index_data,
												netsnmp_iterator_info *mydata)
{
    *my_loop_context = mycloudex2ultraVolumeTable_head;
    return mycloudex2ultraVolumeTable_get_next_data_point(my_loop_context,
                                                 my_data_context,
                                                 put_index_data, mydata);
}

/*-----------------------------------------------------------------
* ROUTINE NAME - mycloudex2ultraVolumeTable_get_next_data_point
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
netsnmp_variable_list *mycloudex2ultraVolumeTable_get_next_data_point(void **my_loop_context,
											void **my_data_context,
											netsnmp_variable_list * put_index_data,
											netsnmp_iterator_info *mydata)
{
    ID_mycloudex2ultravolumeTable entry = (ID_mycloudex2ultravolumeTable)*my_loop_context;
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
* ROUTINE NAME - mycloudex2ultraVolumeTable_createEntry
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
ID_mycloudex2ultravolumeTable mycloudex2ultraVolumeTable_createEntry(long entry_num)
{
    ID_mycloudex2ultravolumeTable entry;

    entry = SNMP_MALLOC_TYPEDEF(struct _MYCLOUDEX2ULTRA_VOLUME_TABLE_);
    if (!entry)
        return NULL;

		entry->entry_num = entry_num;
    entry->next = mycloudex2ultraVolumeTable_head;
    mycloudex2ultraVolumeTable_head = entry;
    return entry;
}

/*-----------------------------------------------------------------
* ROUTINE NAME - mycloudex2ultraVolumeTable_removeEntry
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void mycloudex2ultraVolumeTable_removeEntry(ID_mycloudex2ultravolumeTable entry)
{
    ID_mycloudex2ultravolumeTable	ptr, prev;

	if (!entry)
		return;                 /* Nothing to remove */

    for (ptr = mycloudex2ultraVolumeTable_head, prev = NULL;
         ptr != NULL; prev = ptr, ptr = ptr->next)
	{
		if (ptr == entry)
			break;
	}
	if (!ptr)
		return;                 /* Can't find it */

	if (prev == NULL)
		mycloudex2ultraVolumeTable_head = ptr->next;
	else
		prev->next = ptr->next;

    SNMP_FREE(entry);           /* XXX - release any other internal resources */
}

/*-----------------------------------------------------------------
* ROUTINE NAME - mycloudex2ultraVolumeTable_removeEntry_byNum
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void mycloudex2ultraVolumeTable_removeEntry_byNum(long num)
{
	ID_mycloudex2ultravolumeTable	ptr, prev;

	for (ptr = mycloudex2ultraVolumeTable_head, prev = NULL;
		ptr != NULL; prev = ptr, ptr = ptr->next)
	{
		if (ptr->volume_num == num)
		break;
    }
	if (!ptr)
		return;                 /* Can't find it */

	if (prev == NULL)
		mycloudex2ultraVolumeTable_head = ptr->next;
	else
		prev->next = ptr->next;

	SNMP_FREE(ptr);           /* XXX - release any other internal resources */
}

/*-----------------------------------------------------------------
* ROUTINE NAME - mycloudex2ultraVolumeTable_handler
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
int mycloudex2ultraVolumeTable_handler(netsnmp_mib_handler *handler,
			netsnmp_handler_registration *reginfo,
			netsnmp_agent_request_info *reqinfo,
			netsnmp_request_info *requests)
{
	netsnmp_request_info		*request;
	//netsnmp_variable_list		*requestvb;
	netsnmp_table_request_info	*table_info;
	ID_mycloudex2ultravolumeTable		table_entry;


	mycloudex2ultraVolumeTable_get();

	switch(reqinfo->mode)
	{
		//Read-support (also covers GetNext requests)
		case MODE_GET:
			for (request = requests; request; request = request->next)
			{
				//requestvb = request->requestvb;	//????

				table_entry = (ID_mycloudex2ultravolumeTable)netsnmp_extract_iterator_context(request);
				table_info = netsnmp_extract_table_info(request);

				if(table_entry && (table_entry->valid == 0))
				{
					netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
					continue;
				}

				switch (table_info->colnum)
				{
					case MYCLOUDEX2ULTRA_VOLUME_NUM:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}
						snmp_set_var_typed_integer(request->requestvb, ASN_INTEGER,
                                           table_entry->volume_num);
						break;

					case MYCLOUDEX2ULTRA_VOLUME_NAME:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}

						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->volume_name,
                                         strlen(table_entry->volume_name));
						break;

					case MYCLOUDEX2ULTRA_VOLUME_FS_TYPE:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}
						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->volume_fs_type,
                                         strlen(table_entry->volume_fs_type));
						break;

					case MYCLOUDEX2ULTRA_VOLUME_RAID_LEVEL:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}
						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->volume_raid_level,
                                         strlen(table_entry->volume_raid_level));
						break;

					case MYCLOUDEX2ULTRA_VOLUME_SIZE:
						if (!table_entry)
						{
							netsnmp_set_request_error(reqinfo, request, SNMP_NOSUCHINSTANCE);
							continue;
						}
						snmp_set_var_typed_value(request->requestvb, ASN_OCTET_STR,
                                         (u_char *) table_entry->volume_size,
                                         strlen(table_entry->volume_size));
						break;

					case MYCLOUDEX2ULTRA_VOLUME_FREE_SPACE:
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






