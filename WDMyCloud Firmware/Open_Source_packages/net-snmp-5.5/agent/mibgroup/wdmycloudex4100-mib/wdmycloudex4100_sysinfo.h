#ifndef WDMYCLOUDEX4100_SYSINFO_H
#define WDMYCLOUDEX4100_SYSINFO_H

#define NAS_AGENT_VERSION		"1.00"

typedef struct _WDMYCLOUDEX4100NASAGENT_
{
	char	sw_version[64];
	char	host_name[64];
	char	dhcp_enable[8];
	char	ftp_enable[8];
	char	net_type[16];			//0:Workgroup	1:Active Directory
	char	temperature[64];
	char	fan_status[64];
}wdmycloudex4100nasAgent, *ID_wdmycloudex4100nasAgent;
#define WDMYCLOUDEX4100NASAGENT_SIZE	(sizeof(struct _WDMYCLOUDEX4100NASAGENT_))

void init_wdmycloudex4100_sysinfo(void);
Netsnmp_Node_Handler handle_wdmycloudex4100AgentVer;
Netsnmp_Node_Handler handle_wdmycloudex4100SoftwareVersion;
Netsnmp_Node_Handler handle_wdmycloudex4100HostName;
Netsnmp_Node_Handler handle_wdmycloudex4100DHCPServer;
Netsnmp_Node_Handler handle_wdmycloudex4100FTPServer;
Netsnmp_Node_Handler handle_wdmycloudex4100NetType;
Netsnmp_Node_Handler handle_wdmycloudex4100Temperature;
Netsnmp_Node_Handler handle_wdmycloudex4100FanStatus;

#endif
