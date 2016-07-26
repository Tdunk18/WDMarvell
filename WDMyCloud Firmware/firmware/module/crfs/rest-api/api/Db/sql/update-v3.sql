/**************
 * Version 3 DB Schema:
 *
 *  -- Since we can not rename a column in SQLITE, we have to create a new table tmpVolumes.
 *  -- And transfer data from Volumes to tmpVolumes.
 *  -- Drop table tmpVolumes
 *  -- Rename table tmpVolumes as Volumes 
 *  -- On modified Volume table,
 *         -- Added column storage_type to Volumes table.
 *         -- Modified column usb_handle as handle in Volumes table.
 */
	DROP TABLE IF EXISTS tmpVolumes;
	CREATE TABLE tmpVolumes
   (
		volume_id           TEXT PRIMARY KEY, -- [561A-5886] {uuid}
        label               TEXT,     -- [Family Photos|Vacation Videos]
		base_path           TEXT,     -- [/media/sdg1] {directory mount point}
		drive_path          TEXT,     -- [/devices/pci0000:00/0000:00:1a.7/usb/1] {FK}
		is_connected        TEXT,     -- [true|false] {true if volume is connected}
		db_ready            INTEGER,  -- [1|0]
		capacity            INTEGER,  -- {size of volume}
		dynamic_volume      TEXT,     -- {true if volume can be unplugged}
		file_system_type    TEXT,     -- [FAT32] {type of file system}
		read_only           TEXT,     -- {true if read only}
		handle              TEXT,     -- {which USB slot that drive connected}
		crawler_status      TEXT,     -- {status of crawling this volume}
		created_date        DATETIME, -- [1309492800] {when volume was created}
		mounted_date        DATETIME,  -- [1309492800] {when volume was mounted}
		mount_path          TEXT,     -- [/media/ShareName] {directory mount point}
		storage_type        TEXT      -- [USB/SDCARD] {Which type of external volume is connected to the NAS}
   );

   INSERT INTO tmpVolumes (volume_id, label, base_path, drive_path, is_connected, db_ready,
                capacity, dynamic_volume, file_system_type, read_only, handle,
                crawler_status, created_date, mounted_date, mount_path, storage_type)
         SELECT volume_id, label, base_path, drive_path, is_connected, db_ready,
                capacity, dynamic_volume, file_system_type, read_only, usb_handle,
                crawler_status, created_date, mounted_date, mount_path, null FROM Volumes;
				
   DROP TABLE Volumes;
   ALTER TABLE tmpVolumes RENAME TO Volumes;

PRAGMA user_version = 3;