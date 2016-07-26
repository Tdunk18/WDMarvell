
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

#include <xml_tag.h>
#include <getinfo.h>
#include "mycloudex2ultra_sysinfo.h"
#include "platform.h" //for snmp oid



ID_mycloudex2ultranasAgent		p_nasAgent;

/*-----------------------------------------------------------------
* ROUTINE NAME - init_mycloudex2ultra_sysinfo
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
void init_mycloudex2ultra_sysinfo(void)
{
	static oid mycloudex2ultraAgentVer_oid[]			   = { NAS_COMMA_OID, 1, 1 };
	static oid mycloudex2ultraSoftwareVersion_oid[] 	= { NAS_COMMA_OID, 1, 2 };
	static oid mycloudex2ultraHostName_oid[]			   = { NAS_COMMA_OID, 1, 3 };
	static oid mycloudex2ultraDHCPServer_oid[]		   = { NAS_COMMA_OID, 1, 4 };
	static oid mycloudex2ultraFTPServer_oid[]		      = { NAS_COMMA_OID, 1, 5 };
	static oid mycloudex2ultraNetType_oid[]			   = { NAS_COMMA_OID, 1, 6 };
	static oid mycloudex2ultraTemperature_oid[]		   = { NAS_COMMA_OID, 1, 7 };
	static oid mycloudex2ultraFanStatus_oid[]		      = { NAS_COMMA_OID, 1, 8 };

	//malloc structure memory
	p_nasAgent = malloc(MYCLOUDEX2ULTRANASAGENT_SIZE);
	memset(p_nasAgent, 0, MYCLOUDEX2ULTRANASAGENT_SIZE);
	DEBUGMSGTL(("mycloudex2ultra_sysinfo", "Initializing\n"));

	//mycloudex2ultraAgentVer
	netsnmp_register_scalar(netsnmp_create_handler_registration
							("mycloudex2ultraAgentVer", handle_mycloudex2ultraAgentVer,
							mycloudex2ultraAgentVer_oid,
							OID_LENGTH(mycloudex2ultraAgentVer_oid),
							HANDLER_CAN_RONLY));

	//mycloudex2ultraSoftwareVersion
	netsnmp_register_scalar(netsnmp_create_handler_registration
							("mycloudex2ultraSoftwareVersion", handle_mycloudex2ultraSoftwareVersion,
							mycloudex2ultraSoftwareVersion_oid,
							OID_LENGTH(mycloudex2ultraSoftwareVersion_oid),
							HANDLER_CAN_RONLY));

	//mycloudex2ultraHostName
	netsnmp_register_scalar(netsnmp_create_handler_registration
							("mycloudex2ultraHostName", handle_mycloudex2ultraHostName,
							mycloudex2ultraHostName_oid,
							OID_LENGTH(mycloudex2ultraHostName_oid),
							HANDLER_CAN_RONLY));

	//mycloudex2ultraDHCPServer
//	netsnmp_register_scalar(netsnmp_create_handler_registration
//							("mycloudex2ultraDHCPServer", handle_mycloudex2ultraDHCPServer,
//							mycloudex2ultraDHCPServer_oid,
//							OID_LENGTH(mycloudex2ultraDHCPServer_oid),
//							HANDLER_CAN_RONLY));

	//mycloudex2ultraFTPServer
	netsnmp_register_scalar(netsnmp_create_handler_registration
							("mycloudex2ultraFTPServer", handle_mycloudex2ultraFTPServer,
							mycloudex2ultraFTPServer_oid,
							OID_LENGTH(mycloudex2ultraFTPServer_oid),
							HANDLER_CAN_RONLY));

	//mycloudex2ultraNetType
	netsnmp_register_scalar(netsnmp_create_handler_registration
							("mycloudex2ultraNetType", handle_mycloudex2ultraNetType,
							mycloudex2ultraNetType_oid,
							OID_LENGTH(mycloudex2ultraNetType_oid),
							HANDLER_CAN_RONLY));

	//mycloudex2ultraTemperature
	netsnmp_register_scalar(netsnmp_create_handler_registration
							("mycloudex2ultraTemperature", handle_mycloudex2ultraTemperature,
							mycloudex2ultraTemperature_oid,
							OID_LENGTH(mycloudex2ultraTemperature_oid),
							HANDLER_CAN_RONLY));

	//mycloudex2ultraFanStatus
	netsnmp_register_scalar(netsnmp_create_handler_registration
							("mycloudex2ultraFanStatus", handle_mycloudex2ultraFanStatus,
							mycloudex2ultraFanStatus_oid,
							OID_LENGTH(mycloudex2ultraFanStatus_oid),
							HANDLER_CAN_RONLY));

}

/*-----------------------------------------------------------------
* ROUTINE NAME - handle_mycloudex2ultraAgentVer
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
int handle_mycloudex2ultraAgentVer(netsnmp_mib_handler *handler,
							netsnmp_handler_registration *reginfo,
							netsnmp_agent_request_info *reqinfo,
							netsnmp_request_info *requests)
{
    //We are never called for a GETNEXT if it's registered as a
    //"instance", as it's "magically" handled for us.

    //a instance handler also only hands us one request at a time, so
    //we don't need to loop over a list of requests; we'll only get one.

	switch(reqinfo->mode)
	{
		case MODE_GET:
			snmp_set_var_typed_value(requests->requestvb, ASN_OCTET_STR,
									(u_char *)NAS_AGENT_VERSION,
									strlen(NAS_AGENT_VERSION));
			break;

		default:
		//we should never get here, so this is a really bad error
		snmp_log(LOG_ERR, "unknown mode (%d) in handle_mycloudex2ultraAgentVer\n", reqinfo->mode);
		return SNMP_ERR_GENERR;

	}
	return SNMP_ERR_NOERROR;
}

/*-----------------------------------------------------------------
* ROUTINE NAME - handle_mycloudex2ultraSoftwareVersion
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
int handle_mycloudex2ultraSoftwareVersion(netsnmp_mib_handler *handler,
							netsnmp_handler_registration *reginfo,
							netsnmp_agent_request_info *reqinfo,
							netsnmp_request_info *requests)
{
	switch(reqinfo->mode)
	{
		case MODE_GET:
			if(get_sw_version(p_nasAgent->sw_version) == 0)
				return SNMP_ERR_GENERR;

			snmp_set_var_typed_value(requests->requestvb, ASN_OCTET_STR,
									(u_char *)p_nasAgent->sw_version,
									strlen(p_nasAgent->sw_version));
			break;

		default:
			snmp_log(LOG_ERR, "unknown mode (%d) in handle_mycloudex2ultraSoftwareVersion\n", reqinfo->mode);
			return SNMP_ERR_GENERR;
	}
	return SNMP_ERR_NOERROR;
}

/*-----------------------------------------------------------------
* ROUTINE NAME - handle_mycloudex2ultraHostName
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
int handle_mycloudex2ultraHostName(netsnmp_mib_handler *handler,
							netsnmp_handler_registration *reginfo,
							netsnmp_agent_request_info *reqinfo,
							netsnmp_request_info *requests)
{
	switch(reqinfo->mode)
	{
		case MODE_GET:
			if(get_hostname(p_nasAgent->host_name) == 0)
				return SNMP_ERR_GENERR;

			snmp_set_var_typed_value(requests->requestvb, ASN_OCTET_STR,
									(u_char *)p_nasAgent->host_name,
									strlen(p_nasAgent->host_name));
			break;

		default:
			snmp_log(LOG_ERR, "unknown mode (%d) in handle_mycloudex2ultraHostName\n", reqinfo->mode);
			return SNMP_ERR_GENERR;
	}
	return SNMP_ERR_NOERROR;
}

/*-----------------------------------------------------------------
* ROUTINE NAME - handle_mycloudex2ultraDHCPServer
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
//int handle_mycloudex2ultraDHCPServer(netsnmp_mib_handler *handler,
//							netsnmp_handler_registration *reginfo,
//							netsnmp_agent_request_info *reqinfo,
//							netsnmp_request_info *requests)
//{
//	switch(reqinfo->mode)
//	{
//		case MODE_GET:
//			if(get_config_xml(XML_DHCPD_ENABLE, p_nasAgent->dhcp_enable,sizeof(p_nasAgent->dhcp_enable)) == 0)
//				return SNMP_ERR_GENERR;
//
//			snmp_set_var_typed_value(requests->requestvb, ASN_OCTET_STR,
//									(u_char *)p_nasAgent->dhcp_enable,
//									strlen(p_nasAgent->dhcp_enable));
//			break;
//
//		default:
//			snmp_log(LOG_ERR, "unknown mode (%d) in handle_mycloudex2ultraDHCPServer\n", reqinfo->mode);
//			return SNMP_ERR_GENERR;
//	}
//	return SNMP_ERR_NOERROR;
//}

/*-----------------------------------------------------------------
* ROUTINE NAME - handle_mycloudex2ultraFTPServer
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
int handle_mycloudex2ultraFTPServer(netsnmp_mib_handler *handler,
							netsnmp_handler_registration *reginfo,
							netsnmp_agent_request_info *reqinfo,
							netsnmp_request_info *requests)
{
	switch(reqinfo->mode)
	{
		case MODE_GET:
			if(get_config_xml(XML_FTP_STATE, p_nasAgent->ftp_enable,sizeof(p_nasAgent->ftp_enable)) == 0)
				return SNMP_ERR_GENERR;

//			if(StringInclude(p_nasAgent->ftp_enable, "stop"))
//				strcpy(p_nasAgent->ftp_enable, "0");
//			else
//				strcpy(p_nasAgent->ftp_enable, "1");

			snmp_set_var_typed_value(requests->requestvb, ASN_OCTET_STR,
									(u_char *)p_nasAgent->ftp_enable,
									strlen(p_nasAgent->ftp_enable));
			break;

		default:
			snmp_log(LOG_ERR, "unknown mode (%d) in handle_mycloudex2ultraFTPServer\n", reqinfo->mode);
			return SNMP_ERR_GENERR;
	}
	return SNMP_ERR_NOERROR;
}

/*-----------------------------------------------------------------
* ROUTINE NAME - handle_mycloudex2ultraNetType
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
int handle_mycloudex2ultraNetType(netsnmp_mib_handler *handler,
							netsnmp_handler_registration *reginfo,
							netsnmp_agent_request_info *reqinfo,
							netsnmp_request_info *requests)
{
	switch(reqinfo->mode)
	{
		case MODE_GET:
			if(get_config_xml(XML_SAB_ADS_ENABLE, p_nasAgent->net_type,sizeof(p_nasAgent->net_type)) == 0)
				return SNMP_ERR_GENERR;

			snmp_set_var_typed_value(requests->requestvb, ASN_OCTET_STR,
									(u_char *)p_nasAgent->net_type,
									strlen(p_nasAgent->net_type));
			break;

		default:
			snmp_log(LOG_ERR, "unknown mode (%d) in handle_mycloudex2ultraNetType\n", reqinfo->mode);
			return SNMP_ERR_GENERR;
	}
	return SNMP_ERR_NOERROR;
}

/*-----------------------------------------------------------------
* ROUTINE NAME - handle_mycloudex2ultraTemperature
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
int handle_mycloudex2ultraTemperature(netsnmp_mib_handler *handler,
							netsnmp_handler_registration *reginfo,
							netsnmp_agent_request_info *reqinfo,
							netsnmp_request_info *requests)
{
	switch(reqinfo->mode)
	{
		case MODE_GET:
			if(get_temperature(p_nasAgent->temperature) == 0)
				return SNMP_ERR_GENERR;

			snmp_set_var_typed_value(requests->requestvb, ASN_OCTET_STR,
									(u_char *)p_nasAgent->temperature,
									strlen(p_nasAgent->temperature));
			break;

		default:
			snmp_log(LOG_ERR, "unknown mode (%d) in handle_mycloudex2ultraTemperature\n", reqinfo->mode);
			return SNMP_ERR_GENERR;
	}
	return SNMP_ERR_NOERROR;
}

/*-----------------------------------------------------------------
* ROUTINE NAME - handle_mycloudex2ultraFanStatus
*------------------------------------------------------------------
* FUNCTION:
*
* INPUT:
* OUTPUT:
* RETURN:
*
* NOTE:
*----------------------------------------------------------------*/
int handle_mycloudex2ultraFanStatus(netsnmp_mib_handler *handler,
							netsnmp_handler_registration *reginfo,
							netsnmp_agent_request_info *reqinfo,
							netsnmp_request_info *requests)
{
	switch(reqinfo->mode)
	{
		case MODE_GET:
			if(get_fan_status(p_nasAgent->fan_status) == 0)
				return SNMP_ERR_GENERR;

			snmp_set_var_typed_value(requests->requestvb, ASN_OCTET_STR,
									(u_char *)p_nasAgent->fan_status,
									strlen(p_nasAgent->fan_status));
			break;

		default:
			snmp_log(LOG_ERR, "unknown mode (%d) in handle_mycloudex2ultraFanStatus\n", reqinfo->mode);
			return SNMP_ERR_GENERR;
	}
	return SNMP_ERR_NOERROR;
}





