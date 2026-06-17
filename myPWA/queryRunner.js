const bcrypt = require("bcrypt");
const Database = require("better-sqlite3");
const db = new Database("database/datasource.db");

exports.saveTimetable = function saveTimetable(schoolName, timetable) {
    // Put timetable in row where schoolname = schoolname
    const preparedQuery = db.prepare("UPDATE SchoolTable SET SchoolTimetable = ? WHERE SchoolName = ?");
    preparedQuery.run(JSON.stringify(Array.from(timetable.entries())), schoolName);
}

exports.getTimetable = function getTimetable(anyUserName, anyUserRole) {
    schoolName = ""
    if (anyUserRole == "Staff") { // If the user is staff then find the schoolname
        schoolName = db.prepare("SELECT SchoolName FROM StaffTable WHERE Username = ?").get(anyUserName).SchoolName;
    }
    else {
        schoolName = anyUserName; // Otherwise you alr have the schoolname
    }
    const timetableRow = db.prepare("SELECT SchoolTimetable FROM SchoolTable WHERE SchoolName = ?").get(schoolName)
    if (timetableRow.SchoolTimetable === null) {
        return "empty"; // If timetable hasnt been made
    }
    return JSON.parse(timetableRow.SchoolTimetable); // Otherwise get back timetable from where schoolname = schoolname
}

exports.deleteTimetable = function deleteTimetable(schoolName) { // delette timetable where schoolname = schoolname
    db.prepare("UPDATE SchoolTable SET SchoolTimetable = NULL WHERE SchoolName = ?").run(schoolName)
}

exports.getSchools = function getSchools() { // Get all registered schoolnames
    return db.prepare("SELECT SchoolName FROM SchoolTable").pluck().all()
}

exports.registerStaff = async function registerStaff(username, password, schoolName, schoolPassword) {
    const schoolPasswordCheck = db.prepare("SELECT SchoolPassword FROM SchoolTable WHERE SchoolName = ?").get(schoolName).SchoolPassword;
    if (!(await bcrypt.compare(schoolPassword, schoolPasswordCheck))) { // Check if the right schoolpassword was entered
        return "School credentials do not match."
    }
    const usernameTakenCheck = db.prepare("SELECT Username FROM StaffTable WHERE Username = ?").get(username);
    if (typeof usernameTakenCheck !== "undefined") { // Check if the username is unique
        return "Username is already taken, use a different one."
    }
    const registerStaff = db.prepare("INSERT INTO StaffTable (Username, Password, SchoolName) VALUES (?, ?, ?)");
    registerStaff.run(username, password, schoolName); // Otherwise create a row with user details
    return "Account created. Please restart the page before logging in."
}

exports.logStaff = async function logStaff(username, password) {
    const passwordCheck = db.prepare("SELECT Password FROM StaffTable WHERE Username = ?").get(username);
    if (typeof passwordCheck === "undefined") { // If password wasnt found then username doesnt exist
        return "Credentials do not match."
    }
    else if (!(await bcrypt.compare(password, passwordCheck.Password))) { // else if password is wrong
        return "Credentials do not match."
    }
    return "Credentials match."
}

exports.registerSchool = function registerSchool(schoolName, schoolPassword, adminPassword) {
    const schoolNameTakenCheck = db.prepare("SELECT schoolName FROM SchoolTable WHERE schoolName = ?").get(schoolName);
    if (typeof schoolNameTakenCheck !== "undefined") { // Check if looking for a schoolname = schoolname gives something
        return "School Name is already taken, use a different one." // If it does then already taken
    }
    const registerSchool = db.prepare("INSERT INTO SchoolTable (SchoolName, SchoolPassword, AdminPassword) VALUES (?, ?, ?)");
    registerSchool.run(schoolName, schoolPassword, adminPassword); // Otherwise register
    return "Account created. Please restart the page before logging in."
}

exports.logSchool = async function logSchool(schoolName, adminPassword) {
    const adminPasswordCheck = db.prepare("SELECT adminPassword FROM SchoolTable WHERE schoolName = ?").get(schoolName).AdminPassword;
    if (typeof adminPasswordCheck === "undefined") { // Schoolname doesnt exist (this is impossible why did I add this)
        return "Credentials do not match."
    }
    else if (!(await bcrypt.compare(adminPassword, adminPasswordCheck))) {
        return "Credentials do not match." // If password doesnt match the registtered one
    }
    return "Credentials match."
}