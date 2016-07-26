/*
 * (c) 2010 Western Digital Technologies, Inc. All rights reserved.
 */


#include "sample_util.h"
#include "upnp_nas_device.h"


#include <stdio.h>


/******************************************************************************
 * linux_print
 *
 * Description: 
 *       Prints a string to standard out.
 *
 * Parameters:
 *    None
 *
 *****************************************************************************/
void
linux_print( const char *string )
{
    printf( "%s", string );
}

/******************************************************************************
 * NAS_DeviceCommandLoop
 *
 * Description: 
 *       Function that receives commands from the user at the command prompt
 *       during the lifetime of the device, and calls the appropriate
 *       functions for those commands. Only one command, exit, is currently
 *       defined.
 *
 * Parameters:
 *    None
 *
 *****************************************************************************/
void *
NAS_DeviceCommandLoop( void *args )
{
    int stoploop = 0;
    char cmdline[100];
    char cmd[100];

    while( !stoploop ) {
        sprintf( cmdline, " " );
        sprintf( cmd, " " );

        SampleUtil_Print( "\n>> " );

        // Get a command line
        if (fgets( cmdline, 100, stdin )) {
            sscanf( cmdline, "%s", cmd );

            if( strcasecmp( cmd, "exit" ) == 0 ) {
                SampleUtil_Print( "Shutting down...\n" );
                NAS_DeviceStop();
                exit( 0 );
            } else {
                SampleUtil_Print( "\n   Unknown command: %s\n\n", cmd );
                SampleUtil_Print( "   Valid Commands:\n" );
                SampleUtil_Print( "     Exit\n\n" );
            }

	}

    }

    return NULL;
}

/******************************************************************************
 * main
 *
 * Description: 
 *       Main entry point for tv device application.
 *       Initializes and registers with the sdk.
 *       Initializes the state stables of the service.
 *       Starts the command loop.
 *
 * Parameters:
 *    int argc  - count of arguments
 *    char ** argv -arguments. The application 
 *                  accepts the following optional arguments:
 *
 *                  -ip ipaddress 
 *                  -port port
 *		    -desc desc_doc_name 
 *	            -webdir web_dir_path"
 *		    -help 
 *                 
 *
 *****************************************************************************/
int main( IN int argc, IN char **argv )
{

    unsigned int portTemp = 0;
    char *ip_address = NULL,
     *desc_doc_name = NULL,
     *web_dir_path = NULL;
    int rc;
    ithread_t cmdloop_thread;
#ifndef WIN32
    int sig;
    sigset_t sigs_to_catch;
#endif
    int code;
    unsigned int port = 0;
    int i = 0;

    SampleUtil_Initialize( linux_print );

    // Parse options
    for( i = 1; i < argc; i++ ) {
        if( strcmp( argv[i], "-ip" ) == 0 ) {
            ip_address = argv[++i];
        } else if( strcmp( argv[i], "-port" ) == 0 ) {
            sscanf( argv[++i], "%u", &portTemp );
        } else if( strcmp( argv[i], "-desc" ) == 0 ) {
            desc_doc_name = argv[++i];
        } else if( strcmp( argv[i], "-webdir" ) == 0 ) {
            web_dir_path = argv[++i];
        } else if( strcmp( argv[i], "-help" ) == 0 ) {
            SampleUtil_Print( "Usage: %s -ip ipaddress -port port"
                              " -desc desc_doc_name -webdir web_dir_path"
                              " -help (this message)\n", argv[0] );
            SampleUtil_Print( "\tipaddress:     IP address of the device"
                              " (must match desc. doc)\n" );
            SampleUtil_Print( "\t\te.g.: 192.168.0.4\n" );
            SampleUtil_Print( "\tport:          Port number to use for "
                              "receiving UPnP messages (must match desc. doc)\n" );
            SampleUtil_Print( "\t\te.g.: 5431\n" );
            SampleUtil_Print
                ( "\tdesc_doc_name: name of device description document\n" );
            SampleUtil_Print( "\t\te.g.: tvdevicedesc.xml\n" );
            SampleUtil_Print
                ( "\tweb_dir_path: Filesystem path where web files "
                  "related to the device are stored\n" );
            SampleUtil_Print( "\t\te.g.: /upnp/sample/tvdevice/web\n" );
            return 1;
        }
    }

    port = ( unsigned short )portTemp;

    NAS_DeviceStart( ip_address, port, desc_doc_name, web_dir_path, linux_print );

    /* start a command loop thread */
//    code = ithread_create( &cmdloop_thread, NULL, NAS_DeviceCommandLoop, NULL );

#ifndef WIN32
    /*
       Catch Ctrl-C and properly shutdown 
     */
    sigemptyset( &sigs_to_catch );
    sigaddset( &sigs_to_catch, SIGINT );
    sigwait( &sigs_to_catch, &sig );

    SampleUtil_Print( "Shutting down on signal %d...\n", sig );
#else
	ithread_join(cmdloop_thread, NULL);
#endif
    rc = NAS_DeviceStop();
    
    return rc;
}

