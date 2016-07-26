#ifndef WDMYCLOUDDL2100_SYSINFO_H
#define WDMYCLOUDDL2100_SYSINFO_H

#define NAS_AGENT_VERSION		"1.00"

typedef struct _WDMYCLOUDDL2100NASAGENT_
{
	char	sw_version[64];
	char	host_name[64];
	char	dhcp_enable[8];
	char	ftp_enable[8];
	char	net_type[16];			//0:Workgroup	1:Active Directory
	char	temperature[64];
	char	fan_status[64];
}wdmyclouddl2100nasAgent, *ID_wdmyclouddl2100nasAgent;
#define WDMYCLOUDDL2100NASAGENT_SIZE	(sizeof(struct _WDMYCLOUDDL2100NASAGENT_))

void init_wdmyclouddl2100_sysinfo(void);
Netsnmp_Node_Handler handle_wdmyclouddl2100AgentVer;
Netsnmp_Node_Handler handle_wdmyclouddl2100SoftwareVersion;
Netsnmp_Node_Handler handle_wdmyclouddl2100HostName;
Netsnmp_Node_Handler handle_wdmyclouddl2100DHCPServer;
Netsnmp_Node_Handler handle_wdmyclouddl2100FTPServer;
Netsnmp_Node_Handler handle_wdmyclouddl2100NetType;
Netsnmp_Node_Handler handle_wdmyclouddl2100Temperature;
Netsnmp_Node_Handler handle_wdmyclouddl2100FanStatus;

#endif
