#ifndef WDMYCLOUDDL4100_SYSINFO_H
#define WDMYCLOUDDL4100_SYSINFO_H

#define NAS_AGENT_VERSION		"1.00"

typedef struct _WDMYCLOUDDL4100NASAGENT_
{
	char	sw_version[64];
	char	host_name[64];
	char	dhcp_enable[8];
	char	ftp_enable[8];
	char	net_type[16];			//0:Workgroup	1:Active Directory
	char	temperature[64];
	char	fan_status[64];
}wdmyclouddl4100nasAgent, *ID_wdmyclouddl4100nasAgent;
#define WDMYCLOUDDL4100NASAGENT_SIZE	(sizeof(struct _WDMYCLOUDDL4100NASAGENT_))

void init_wdmyclouddl4100_sysinfo(void);
Netsnmp_Node_Handler handle_wdmyclouddl4100AgentVer;
Netsnmp_Node_Handler handle_wdmyclouddl4100SoftwareVersion;
Netsnmp_Node_Handler handle_wdmyclouddl4100HostName;
Netsnmp_Node_Handler handle_wdmyclouddl4100DHCPServer;
Netsnmp_Node_Handler handle_wdmyclouddl4100FTPServer;
Netsnmp_Node_Handler handle_wdmyclouddl4100NetType;
Netsnmp_Node_Handler handle_wdmyclouddl4100Temperature;
Netsnmp_Node_Handler handle_wdmyclouddl4100FanStatus;

#endif
