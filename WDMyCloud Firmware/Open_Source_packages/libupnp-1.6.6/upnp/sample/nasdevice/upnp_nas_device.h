/*
 * (c) 2010 Western Digital Technologies, Inc. All rights reserved.
 */

#ifndef UPNP_NAS_DEVICE_H
#define UPNP_NAS_DEVICE_H

#include <stdio.h>
#include <signal.h>

#ifdef __cplusplus
extern "C" {
#endif

#include "ithread.h"
#include <stdlib.h>
#ifndef WIN32
#include <unistd.h>
#endif
#include <string.h>
#include "upnp.h"
#include "sample_util.h"


/*
 * currently, the NAS supports NO services
 */

int NAS_DeviceStart(char * ip_address, unsigned short port,char * desc_doc_name,
		    char *web_dir_path, print_string pfun);

int NAS_DeviceStop();


#ifdef __cplusplus
}
#endif

#endif
