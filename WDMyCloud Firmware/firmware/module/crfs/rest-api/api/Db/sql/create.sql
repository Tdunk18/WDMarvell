/**************
 * Version 1 DB Schema:
 *
 * - Initial Version of Orion DB.
 */

CREATE TABLE Volumes (
/* Base root table for managing current mounted drives. No direct API management. */
    volume_id           TEXT PRIMARY KEY /* [1 ,2, etc] {uuid} */,
    label               TEXT         /* [Family Photos|Vacation Videos] */,
    base_path           TEXT         /* [/media/sdg1] {directory mount point} */,
    drive_path          TEXT         /* [/devices/pci0000:00/0000:00:1a.7/usb/1] {FK} */,
    is_connected        TEXT         /* [true|false] {true if volume is connected} */,
    db_ready            INTEGER      /* [1|0] */,
    capacity            INTEGER      /* {size of volume} */,
    dynamic_volume      TEXT         /* {true if volume can be unplugged} */,
    file_system_type    TEXT         /* [FAT32] {type of file system} */,
    read_only           TEXT         /* {true if read only} */,
    usb_handle          TEXT         /* {which USB slot that drive connected} */,
    crawler_status      TEXT         /* {status of crawling this volume} */,
    created_date        DATETIME     /* [1309492800] {when volume was created} */,
    mounted_date        DATETIME     /* [1309492800] {when volume was mounted} */
);

/**
 * Album Tables used by Album Module
 */
CREATE TABLE Albums (
/* User created for grouping items. Managed by Albums Module */
    album_id                INTEGER PRIMARY KEY AUTOINCREMENT,
    owner                   TEXT,
    name                    TEXT,
    description             TEXT,
    background_color        INTEGER,
    background_image        TEXT,
    preview_image           TEXT,
    slide_show_duration     INTEGER,
    slide_show_transition   TEXT,
    media_type              TEXT       /* [videos,music,photos,other] */,
    created_date            DATETIME   /* [1309492800] {when album was created} */,
    expired_date            DATETIME   /* [1309492800] {when album expires} */
);

CREATE TABLE AlbumAccess (
/* ACL control for Album access. Managed by Albums Module */
    album_id        INTEGER REFERENCES Albums(album_id) ON DELETE CASCADE,
    username        TEXT,
    access_level    TEXT       /* [RO|RW] */,
    created_date    DATETIME   /* [1309492800] {when access was created} */
);

CREATE TABLE AlbumItems (
/* Individual items within an Album.  Managed by Albums Module */
    album_item_id       INTEGER  PRIMARY KEY AUTOINCREMENT,
    path                TEXT,
    album_id            INTEGER  REFERENCES Albums(album_id) ON DELETE CASCADE,
    item_order          INTEGER  /* [1-10] {created order or user-defined order} */,
    share_name          TEXT     REFERENCES UserShares(share_name) ON DELETE CASCADE,
    -- TODO: is share_name required? Makes a dependency on Share we may not want.

    FOREIGN KEY (album_id)  REFERENCES Albums(album_id)
);

/**
 * I don't see any references for these two tables.
CREATE TABLE CrawlerStatus (
    volume_uuid         TEXT,
    category            INTEGER,
    process             TEXT,
    state               TEXT,
    files_processed     INTEGER,
    files_total         INTEGER,
    last_modified_time  DATETIME,

    PRIMARY KEY (volume_uuid, category)
);
CREATE TABLE MetaStatus (
    share_name      TEXT REFERENCES UserShares(share_name) ON DELETE CASCADE,
    media_type      TEXT,     -- [videos,music,photos,other]
    modified_date   DATETIME, -- [1309492800] {when media_type of share was modified}
    transcoded_date DATETIME, -- [1309492800] {when media_type of share was transcoded}

    FOREIGN KEY (share_name) REFERENCES UserShares(share_name)
);
*/

CREATE TABLE DeviceUsers (
/* Table for managing valid Device Users used by multiple APIs, managed by Remote Module. */
    device_user_id      INTEGER PRIMARY KEY,
    username            TEXT,
    auth                TEXT,
    email               TEXT,
    name                TEXT,
    type                TEXT,
    is_active           BOOLEAN,
    dac                 CHAR(32),
    dac_expiration      INTEGER,
    enable_wan_access   BOOLEAN,
    type_name           VARCHAR(64),
    application         VARCHAR(64),
    created_date        DATETIME
);

/**
 * Entire Jobs API needs to be rewritten, this includes a restructuring of DB tables.

-- Sparate Table for "Dir" jobs and "File" jobs is bad. Need a single generic Jobs table
--    for handling component and parameters.
CREATE TABLE DirJobs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id          INTEGER REFERENCES Jobs(job_id) ON DELETE CASCADE,
    oper_type       TEXT    NOT NULL,   -- [copy,move,rename,delete,upload,download]
    source          TEXT    NOT NULL,   -- {source of file}
    destination     TEXT    NOT NULL,   -- {destination of file}
    creation_date   DATETIME,           -- [1309492800] {when volume was created}

    FOREIGN KEY (job_id) REFERENCES Jobs(job_id)
);

CREATE TABLE FileJobs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id          INTEGER REFERENCES Jobs(job_id) ON DELETE CASCADE,
    oper_type       TEXT    NOT NULL,   -- [copy,move,rename,delete,upload,download]
    source          TEXT    NOT NULL,   -- {source of file}
    destination     TEXT    NOT NULL,   -- {destination of file}
    creation_date   DATETIME,           -- [1309492800] {when volume was created}

    FOREIGN KEY (job_id) REFERENCES Jobs(job_id)
);

-- Change this to be more genetic: component and rest_method with parameters (JSON encoded? or PHPized?)
CREATE TABLE Jobs (
    job_id              INTEGER PRIMARY KEY,
    component           TEXT,
    status              TEXT,
    description         TEXT,
    process_id          INTEGER,
    priority            INTEGER,
    start_time          DATETIME,
    completion_time     DATETIME,
    work_total          INTEGER,
    work_complete       INTEGER,
    owner_user_id       INTEGER,
    device_user_id      INTEGER,
    creation_date       DATETIME
);
*/

/**
 * Social Network Table currently not in use.

CREATE TABLE SocialNetworks (
    network         TEXT,     -- [facebook|twitter|youtube|twitpic]
    username        TEXT,
    auth_type       TEXT,     -- [BASIC|DIGEST|OAUTH|XAUTH]
    auth_code       TEXT,     -- [AAAEGEaGLtrgBAJA3AbJZCA203PgUS...]
    access_token    TEXT,     -- [AAAEGEaGLtrgBAJA3AbJZCA203PgUS...]
    expires         DATETIME, -- [1309492800] {when access token expires}

    PRIMARY KEY (network,username)    -- {Each user can only have one facebook account}
);
*/

CREATE TABLE UserShares (
/* Shares, individual "mounts" used by UI, Samba, and other applications.
   Managed by Shares Module. */
    share_name          TEXT PRIMARY KEY,
    username            TEXT,
    description         TEXT,
    public_access       TEXT,
    media_serving       TEXT,
    remote_access       TEXT,
    dynamic_volume      TEXT,
    capacity            TEXT,
    read_only           TEXT,
    usb_handle          TEXT,
    file_system_type    TEXT,
    created_date        DATETIME,
    volume_id           TEXT REFERENCES Volumes(volume_id) ON DELETE CASCADE,
    rel_path            TEXT /* Relative to Volume mount point */,

    FOREIGN KEY (volume_id) REFERENCES Volumes(volume_id)
);

CREATE TABLE UserShareAccess (
/* ACL control for share access. Managed by Shares Module. */
    share_name      TEXT REFERENCES UserShares(share_name) ON DELETE CASCADE,
    username        TEXT,
    access_level    TEXT,
    created_date    DATETIME,

    FOREIGN KEY (share_name) REFERENCES UserShares(share_name)
);

-- Default Values
-- Removing default values
/*INSERT INTO Volumes (volume_id, label, base_path, drive_path, is_connected, dynamic_volume, read_only, created_date, mounted_date)
    VALUES (1, 'shares', '/shares', '/dev/md3', 'true', 'false', 'false', current_timestamp, current_timestamp);
INSERT INTO UserShares (share_name, username, description, public_access, media_serving, remote_access, dynamic_volume, created_date, volume_id, rel_path)
    VALUES ('Public', 'admin', 'Public Share', 'true', 'any', 'true', 'false', current_timestamp, 1, '/Public');*/


PRAGMA user_version = 1;
PRAGMA foreign_keys = ON;
