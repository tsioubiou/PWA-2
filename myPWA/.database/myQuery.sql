DELETE FROM SchoolTable

CREATE TABLE SchoolTable (
    SchoolName TEXT NOT NULL PRIMARY KEY,
    SchoolPassword TEXT NOT NULL,
    AdminPassword TEXT NOT NULL,
    SchoolTimetable TEXT
);

CREATE TABLE StaffTable (
    Username TEXT NOT NULL PRIMARY KEY,
    "Password" TEXT NOT NULL,
    SchoolName TEXT
);