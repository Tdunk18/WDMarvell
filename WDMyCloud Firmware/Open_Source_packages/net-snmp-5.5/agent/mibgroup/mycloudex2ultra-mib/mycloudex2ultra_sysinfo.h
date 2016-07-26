#ifndef MYCLOUDEX2ULTRA_SYSINFO_H
#define MYCLOUDEX2ULTRA_SYSINFO_H

#define NAS_AGENT_VERSION		"1.00"

typedef struct _MYCLOUDEX2ULTRANASAGENT_
{
	char	sw_version[64];
	char	host_name[64];
	char	dhcp_enable[8];
	char	ftp_enable[8];
	char	net_type[16];			//0:Workgroup	1:Active Directory
	char	temperature[64];
	char	fan_status[64];
}mycloudex2ultranasAgent, *ID_mycloudex2ultranasAgent;
#define MYCLOUDEX2ULTRANASAGENT_SIZE	(sizeof(struct _MYCLOUDEX2ULTRANASAGENT_))

void init_mycloudex2ultra_sysinfo(void);
Netsnmp_Node_Handler handle_mycloudex2ultraAgentVer;
Netsnmp_Node_Handler handle_mycloudex2ultraSoftwareVersion;
Netsnmp_Node_Handler handle_mycloudex2ultraHostName;
Netsnmp_Node_Handler handle_mycloudex2ultraDHCPServer;
Netsnmp_Node_Handler handle_mycloudex2ultraFTPServer;
Netsnmp_Node_Handler handle_mycloudex2ultraNetType;
Netsnmp_Node_Handler handle_mycloudex2ultraTemperature;
Netsnmp_Node_Handler handle_mycloudex2ultraFanStatus;

#endif
