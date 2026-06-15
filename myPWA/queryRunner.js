const bcrypt = require("bcrypt");
const Database = require("better-sqlite3");
const db = new Database("database/datasource.db");

// Exports make it so you can refernece the script and use the exported function like sqlite3 above.
exports.saveTimetable = function saveTimetable(schoolName, timetable) {
    const preparedQuery = db.prepare("UPDATE SchoolDatabase SET SchoolTimetable = ? WHERE SchoolName = ?");
    preparedQuery.run(JSON.stringify(Array.from(timetable.entries())), schoolName);
}

exports.getTimetable = function getTimetable(schoolName) {
    const preparedQuery = db.prepare("SELECT SchoolTimetable FROM SchoolTable WHERE SchoolName = ?")
    if (typeof preparedQuery.get(schoolName) === "undefined") {
        return "empty";
    }
    return JSON.parse(preparedQuery.get(schoolName).SchoolTimetable);
}

exports.deleteTimetable = function deleteTimetable(schoolName) {
    
}

exports.getSchools = function getSchools() {
    return db.prepare("SELECT SchoolName FROM SchoolTable").pluck().all()
}

exports.registerStaff = async function registerStaff(username, password, schoolName, schoolPassword) {
    const schoolPasswordCheck = db.prepare("SELECT SchoolPassword FROM SchoolTable WHERE SchoolName = ?").get(schoolName).SchoolPassword;
    if (!(await bcrypt.compare(schoolPassword, schoolPasswordCheck))) {
        return "School credentials do not match."
    }
    const usernameTakenCheck = db.prepare("SELECT Username FROM StaffTable WHERE Username = ?").get(username);
    if (typeof usernameTakenCheck !== "undefined") {
        return "Username is already taken, use a different one."
    }
    const registerStaff = db.prepare("INSERT INTO StaffTable (Username, Password, SchoolName) VALUES (?, ?, ?)");
    registerStaff.run(username, password, schoolName);
    return "Account created."
}

exports.logStaff = async function logStaff(username, password) {
    const passwordCheck = db.prepare("SELECT Password FROM StaffTable WHERE Username = ?").get(username).Password;
    if (typeof passwordCheck === "undefined") {
        return "Credentials do not match."
    }
    else if (!(await bcrypt.compare(password, passwordCheck))) {
        return "Credentials do not match."
    }
    return "Credentials match."
}

exports.registerSchool = function registerSchool(schoolName, schoolPassword, adminPassword) {
    const schoolNameTakenCheck = db.prepare("SELECT schoolName FROM SchoolTable WHERE schoolName = ?").get(schoolName);
    if (typeof schoolNameTakenCheck !== "undefined") {
        return "School Name is already taken, use a different one."
    }
    const registerSchool = db.prepare("INSERT INTO SchoolTable (SchoolName, SchoolPassword, AdminPassword) VALUES (?, ?, ?)");
    registerSchool.run(schoolName, schoolPassword, adminPassword);
    return "Account created."
}

exports.logSchool = function logSchool() {
    
}