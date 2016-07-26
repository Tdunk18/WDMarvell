/**************
 * Version 2 DB Schema:
 *
 *  - Added column mount_path to Volumes DB used by Lightening boxes.
 *  - Removed Version table (if exists) -- Schema is now using build-in PRAGMA user_version
 *  -- Comments below left in for reference on how to delete a column in SQLite.
 */

-- This is the only way to remove an existing column. Reference this when the time comes
--    to finally remove mount_path.
-- CREATE TABLE tmpVolumes
-- (
--     volume_id           TEXT PRIMARY KEY, -- [561A-5886] {uuid}
--     label               TEXT,     -- [Family Photos|Vacation Videos]
--     base_path           TEXT,     -- [/media/sdg1] {directory mount point}
--     drive_path          TEXT,     -- [/devices/pci0000:00/0000:00:1a.7/usb/1] {FK}
--     is_connected        TEXT,     -- [true|false] {true if volume is connected}
--     db_ready            INTEGER,  -- [1|0]
--     capacity            INTEGER,  -- {size of volume}
--     dynamic_volume      TEXT,     -- {true if volume can be unplugged}
--     file_system_type    TEXT,     -- [FAT32] {type of file system}
--     read_only           TEXT,     -- {true if read only}
--     usb_handle          TEXT,     -- {which USB slot that drive connected}
--     crawler_status      TEXT,     -- {status of crawling this volume}
--     created_date        DATETIME, -- [1309492800] {when volume was created}
--     mounted_date        DATETIME  -- [1309492800] {when volume was mounted}
-- );
--
-- INSERT INTO tmpVolumes (volume_id, label, base_path, drive_path, is_connected, db_ready,
--            capacity, dynamic_volume, file_system_type, read_only, usb_handle,
--            crawler_status, created_date, mounted_date)
--     SELECT volume_id, label, base_path, drive_path, is_connected, db_ready,
--            capacity, dynamic_volume, file_system_type, read_only, usb_handle,
--            crawler_status, created_date, mounted_date FROM Volumes;
-- DROP TABLE Volumes;
-- ALTER TABLE tmpVolumes RENAME TO Volumes;

DROP TABLE IF EXISTS Version; -- We're using SQLite's built in version option.
ALTER TABLE Volumes ADD COLUMN mount_path    TEXT /* [/media/ShareName] {directory mount point} */
        /* mount_path: used by Lightening because media_crawler
           cannot understand base_path being anything else other than
           /shares--Lightening stores the mount point in a sparate location.
           TODO: Remove this bloody thing once media_crawler is fixed.
           NOTE: See update-v2.sql for info on how to delete a table column. */
;

PRAGMA user_version = 2;
