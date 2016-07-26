/*
 * (c) 2010 Western Digital Technologies, Inc. All rights reserved.
 */

#include "upnp_nas_device.h"

#define DEFAULT_WEB_DIR "./web"

#define DESC_URL_SIZE 200

/*
   Device type for NAS device 
 */
char NAS_DeviceType[] = "urn:schemas-upnp-org:device:WdNAS:1";

/*
   The amount of time (in seconds) before advertisements
   will expire 
 */
int default_advr_expire = 100;

/*
   Device handle supplied by UPnP SDK 
 */
UpnpDevice_Handle device_handle = -1;

/*
   Mutex for protecting the global state table data
   in a multi-threaded, asynchronous environment.
   All functions should lock this mutex before reading
   or writing the state table data. 
 */
ithread_mutex_t NAS_DevMutex;


/*
 * currently, the NAS supports NO services
 */

/******************************************************************************
 * NAS_DeviceStateTableInit
 *
 * Description: 
 *       Initialize the device state table for 
 * 	 this NAS Device, pulling identifier info
 *       from the description Document.  Note that 
 *       knowledge of the service description is
 *       assumed.  State table variables and default
 *       values are currently hardcoded in this file
 *       rather than being read from service description
 *       documents.
 *
 * Parameters:
 *   DescDocURL -- The description document URL
 *
 *****************************************************************************/
int
NAS_DeviceStateTableInit( IN char *DescDocURL )
{
    IXML_Document *DescDoc = NULL;
    int ret = UPNP_E_SUCCESS;
    char *udn = NULL;

    //Download description document
    if( UpnpDownloadXmlDoc( DescDocURL, &DescDoc ) != UPNP_E_SUCCESS ) {
        SampleUtil_Print( "NAS_DeviceStateTableInit -- Error Parsing %s\n",
                          DescDocURL );
        ret = UPNP_E_INVALID_DESC;
        goto error_handler;
    }

    udn = SampleUtil_GetFirstDocumentItem( DescDoc, "UDN" );

error_handler:

    if( udn )
        free( udn );
    if( DescDoc )
        ixmlDocument_free( DescDoc );

    return ( ret );
}

/******************************************************************************
 * NAS_DeviceCallbackEventHandler
 *
 * Description: 
 *       The callback handler registered with the SDK while registering
 *       root device.  Dispatches the request to the appropriate procedure
 *       based on the value of EventType. The four requests handled by the 
 *       device are: 
 *                   1) Event Subscription requests.  
 *                   2) Get Variable requests. 
 *                   3) Action requests.
 *
 * Parameters:
 *
 *   EventType -- The type of callback event
 *   Event -- Data structure containing event data
 *   Cookie -- Optional data specified during callback registration
 *
 *****************************************************************************/
int
NAS_DeviceCallbackEventHandler( Upnp_EventType EventType,
				void *Event,
				void *Cookie )
{

    switch ( EventType ) {

        default:
            SampleUtil_Print
                ( "Error in NAS_DeviceCallbackEventHandler: unknown event type %d\n",
                  EventType );
    }

    /*
       Print a summary of the event received 
     */
    SampleUtil_PrintEvent( EventType, Event );

    return ( 0 );
}

/******************************************************************************
 * NAS_DeviceStop
 *
 * Description: 
 *       Stops the device. Uninitializes the sdk. 
 *
 * Parameters:
 *
 *****************************************************************************/
int
NAS_DeviceStop()
{
    UpnpUnRegisterRootDevice( device_handle );
    UpnpFinish();
    SampleUtil_Finish();
    ithread_mutex_destroy( &NAS_DevMutex );
    return UPNP_E_SUCCESS;
}

/******************************************************************************
 * NAS_DeviceStart
 *
 * Description: 
 *      Initializes the UPnP Sdk, registers the device, and sends out 
 *      advertisements.  
 *
 * Parameters:
 *
 *   ip_address - ip address to initialize the sdk (may be NULL)
 *                if null, then the first non null loopback address is used.
 *   port       - port number to initialize the sdk (may be 0)
 *                if zero, then a random number is used.
 *   desc_doc_name - name of description document.
 *                   may be NULL. Default is nasdevicedesc.xml
 *   web_dir_path  - path of web directory.
 *                   may be NULL. Default is ./web (for Linux) or ../nasdevice/web
 *                   for windows.
 *   pfun          - print function to use.  
 *
 *****************************************************************************/
int
NAS_DeviceStart( char *ip_address,
               unsigned short port,
               char *desc_doc_name,
               char *web_dir_path,
               print_string pfun )
{
    int ret = UPNP_E_SUCCESS;

    char desc_doc_url[DESC_URL_SIZE];

    ithread_mutex_init( &NAS_DevMutex, NULL );

    SampleUtil_Initialize( pfun );

    SampleUtil_Print(
        "Initializing UPnP Sdk with\n"
        "\tipaddress = %s port = %u\n",
        ip_address, port );

    if( ( ret = UpnpInit( ip_address, port ) ) != UPNP_E_SUCCESS ) {
        SampleUtil_Print( "Error with UpnpInit -- %d\n", ret );
        UpnpFinish();
        return ret;
    }

    if( ip_address == NULL ) {
        ip_address = UpnpGetServerIpAddress();
    }

    port = UpnpGetServerPort();

    SampleUtil_Print(
        "UPnP Initialized\n"
	"\tipaddress= %s port = %u\n",
        ip_address, port );

    if( desc_doc_name == NULL ) {
        desc_doc_name = "nasdevicedesc.xml";
    }

    if( web_dir_path == NULL ) {
        web_dir_path = DEFAULT_WEB_DIR;
    }

    snprintf( desc_doc_url, DESC_URL_SIZE, "http://%s:%d/%s", ip_address,
              port, desc_doc_name );

    SampleUtil_Print( "Specifying the webserver root directory -- %s\n",
                      web_dir_path );
    if( ( ret =
          UpnpSetWebServerRootDir( web_dir_path ) ) != UPNP_E_SUCCESS ) {
        SampleUtil_Print
            ( "Error specifying webserver root directory -- %s: %d\n",
              web_dir_path, ret );
        UpnpFinish();
        return ret;
    }

    SampleUtil_Print(
        "Registering the RootDevice\n"
        "\t with desc_doc_url: %s\n",
        desc_doc_url );

    if( ( ret = UpnpRegisterRootDevice( desc_doc_url,
                                        NAS_DeviceCallbackEventHandler,
                                        &device_handle, &device_handle ) )
        != UPNP_E_SUCCESS ) {
        SampleUtil_Print( "Error registering the rootdevice : %d\n", ret );
        UpnpFinish();
        return ret;
    } else {
        SampleUtil_Print(
            "RootDevice Registered\n"
            "Initializing State Table\n");
        NAS_DeviceStateTableInit( desc_doc_url );
        SampleUtil_Print("State Table Initialized\n");

        if( ( ret =
              UpnpSendAdvertisement( device_handle, default_advr_expire ) )
            != UPNP_E_SUCCESS ) {
            SampleUtil_Print( "Error sending advertisements : %d\n", ret );
            UpnpFinish();
            return ret;
        }

        SampleUtil_Print("Advertisements Sent\n");
    }
    return UPNP_E_SUCCESS;
}
