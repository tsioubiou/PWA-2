const Database = require("better-sqlite3");

// Exports make it so you can refernece the script and use the exported function like sqlite3 above.
exports.saveTimetable = function saveTimetable(schoolName, timetable) {
    const db = new Database("database/datasource.db");
    const preparedQuery = db.prepare("UPDATE SchoolDatabase SET SchoolTimetable = ? WHERE SchoolName = ?");
    preparedQuery.run(JSON.stringify(Array.from(timetable.entries())), schoolName);
}

exports.getTimetable = function getTimetable(schoolName) {
    const db = new Database("database/datasource.db", { readonly: true });
    const preparedQuery = db.prepare("SELECT SchoolTimetable FROM SchoolTable WHERE SchoolName = ?")
    if (typeof preparedQuery.get(schoolName) === "undefined") {
        return "empty";
    }
    return JSON.parse(preparedQuery.get(schoolName).SchoolTimetable);
}

exports.deleteTimetable = function deleteTimetable(schoolName) {

}

exports.registerStaff = function registerStaff(username, password, schoolName, schoolPassword) {
    
}