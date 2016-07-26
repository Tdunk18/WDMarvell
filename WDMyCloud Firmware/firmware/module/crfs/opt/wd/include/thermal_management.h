/*
 * Copyright (c) [2013] Western Digital Technologies, Inc. All rights reserved.
 */

#pragma once
#ifndef _WD_THERMAL_MANAGEMENT_H_CF8E7827_E769_4723_91F4_5EE3C9AF6625_
#define _WD_THERMAL_MANAGEMENT_H_CF8E7827_E769_4723_91F4_5EE3C9AF6625_

/* Interface GUID: {CF8E7827-E769-4723-91F4-5EE3C9AF6625} */

#ifdef __cplusplus
extern "C" {
#endif

/* Interface Notes:
 *   - All temperatures are reported in degress Centigrade.
 */

/* System Temperature Interfaces */
float get_system_temp();

/* CPU Temperature Interfaces */
int   get_cpu_temperature_count();
float get_cpu_temperature( int index );

/* Drive Temperature Interface */
int   get_drive_count();
float get_drive_temperature( int index );

/* Fan Status Interface */
int   get_fan_count();
bool  is_fan_active( int index );
bool  is_fan_functional( int index );
bool  fan_has_rpm( int index );
int   get_fan_rpm( int index );

#ifdef __cplusplus
}
#endif

#endif /* _WD_THERMAL_MANAGEMENT_H_CF8E7827_E769_4723_91F4_5EE3C9AF6625_ */
