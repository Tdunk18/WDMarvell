
-- Change this to be more genetic: component and rest_method with parameters (JSON encoded? or PHPized?)
CREATE TABLE Jobs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,	-- Unique Integer Job Id
    jobtype_id		INTEGER REFERENCES JobType(id), 
    jobstate_id     INTEGER REFERENCES JobState(id),
    description		TEXT,					-- User's comment or job description
    username     	TEXT,
    device_user_id  INTEGER,
    create_time     DATETIME	NOT NULL,
    start_time      DATETIME,
    complete_time   DATETIME,
    work_total      INTEGER,                -- Total Work in Bytes or total steps finish the job
    work_complete   INTEGER,                -- Completed Work in Bytes or total steps finished so far
    error_code		INTEGER,				-- User-friendly Application specific error code
    error_message	TEXT					-- User-friendly Application specific error message
);

CREATE TABLE JobType (
	id		INTEGER PRIMARY KEY,
	description	TEXT NOT NULL			
);

INSERT INTO JobType (id, description) VALUES (1, 'Local Request');
INSERT INTO JobType (id, description) VALUES (2, 'Local to Local');
INSERT INTO JobType (id, description) VALUES (3, 'Local to DAS');
INSERT INTO JobType (id, description) VALUES (4, 'DAS to Local');
INSERT INTO JobType (id, description) VALUES (5, 'Local to Remote');
INSERT INTO JobType (id, description) VALUES (6, 'Remote to Local');

CREATE TABLE JobState (
	id		INTEGER PRIMARY KEY,
	description	TEXT NOT NULL			-- [1=Waiting, 2=Running, 3=Canceled, 4=Completed, 5=Failed]
);
INSERT INTO JobState (id, description)	VALUES (1, 'waiting');
INSERT INTO JobState (id, description)	VALUES (2 , 'running');
INSERT INTO JobState (id, description)	VALUES (3, 'canceled');
INSERT INTO JobState (id, description)	VALUES (4, 'completed');
INSERT INTO JobState (id, description)	VALUES (5, 'failed');

CREATE TABLE TaskDetails (
    id              	INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id          	INTEGER REFERENCES Jobs(id) ON DELETE CASCADE,
    component			TEXT	NOT NULL,	-- FileSystemMgr, DirMgr, MetaDbInfoMgr ... 
    descriptor_type    	TEXT    NOT NULL,   	-- [Copy, Move, Rename, Delete, Upload, Download, MetaDb...]
    descriptor			TEXT	NOT NULL,	-- JSON representation of Descriptor 
    request_method		TEXT	NOT NULL,	-- PUT, DELETE...
    request_parameters	TEXT	NOT NULL,	--
    results             TEXT

);

PRAGMA user_version = 1;