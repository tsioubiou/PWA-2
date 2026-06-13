const Database = require("better-sqlite3");
const placeholderName = "John Toe"
const placeholderPass = "Tohn Joe(unencrypted cuz im cool like that frfr)"

// Exports make it so you can refernece the script and use the exported function like sqlite3 above.
exports.saveTimetable = function saveTimetable(timetable) {
    const db = new Database("database/datasource.db");
    const preparedQuery = db.prepare("INSERT OR REPLACE INTO SchoolTable (SchoolName, SchoolPassword, SchoolTimetable) VALUES (?, ?, ?)");
    preparedQuery.run(placeholderName, placeholderPass, JSON.stringify(Array.from(timetable.entries())));
}

exports.getTimetable = function getTimetable() {
    const db = new Database("database/datasource.db", { readonly: true });
    const preparedQuery = db.prepare("SELECT SchoolTimetable FROM SchoolTable WHERE SchoolName = ?")
    return new Map(JSON.parse(preparedQuery.get(placeholderName).SchoolTimetable));
}