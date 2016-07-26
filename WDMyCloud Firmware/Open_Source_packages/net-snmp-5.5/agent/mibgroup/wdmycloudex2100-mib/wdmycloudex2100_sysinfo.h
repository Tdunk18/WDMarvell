#ifndef WDMYCLOUDEX2100_SYSINFO_H
#define WDMYCLOUDEX2100_SYSINFO_H

#define NAS_AGENT_VERSION		"1.00"

typedef struct _WDMYCLOUDEX2100NASAGENT_
{
	char	sw_version[64];
	char	host_name[64];
	char	dhcp_enable[8];
	char	ftp_enable[8];
	char	net_type[16];			//0:Workgroup	1:Active Directory
	char	temperature[64];
	char	fan_status[64];
}wdmycloudex2100nasAgent, *ID_wdmycloudex2100nasAgent;
#define WDMYCLOUDEX2100NASAGENT_SIZE	(sizeof(struct _WDMYCLOUDEX2100NASAGENT_))

void init_wdmycloudex2100_sysinfo(void);
Netsnmp_Node_Handler handle_wdmycloudex2100AgentVer;
Netsnmp_Node_Handler handle_wdmycloudex2100SoftwareVersion;
Netsnmp_Node_Handler handle_wdmycloudex2100HostName;
Netsnmp_Node_Handler handle_wdmycloudex2100DHCPServer;
Netsnmp_Node_Handler handle_wdmycloudex2100FTPServer;
Netsnmp_Node_Handler handle_wdmycloudex2100NetType;
Netsnmp_Node_Handler handle_wdmycloudex2100Temperature;
Netsnmp_Node_Handler handle_wdmycloudex2100FanStatus;

#endif
