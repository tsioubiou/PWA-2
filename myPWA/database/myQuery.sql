DELETE FROM SchoolTable WHERE SchoolName = "John Toe";

CREATE TABLE SchoolTable (
    SchoolName TEXT NOT NULL PRIMARY KEY,
    SchoolPassword TEXT NOT NULL,
    SchoolTimetableKeys TEXT,
    SchoolTimetableValues TEXT
);