const https = require("https");
const fs = require("fs");
const express = require("express");
const path = require("path");
const timetableCalculator = require("./timetableCalculator.js");
const queryRunner = require("./queryRunner.js"); // Use this to run the query function.
const app = express();
const bcrypt = require("bcrypt");
const validator = require("express-validator");
const session = require("express-session");

const httpsSettings = { // Get the self signed stuff for https
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem")
};

function getHomePage(response, alert) { // Anytime the user should be redirected to the homepage use this function
    response.json({url: "/index.html", alertText: alert});
}

async function checkSession(request, response, role) {
    if (!request.session.loggedIn) { // If the user isnt logged in
        request.session.destroy(err => {
            if (err) {
                return getHomePage(response, "Detected attempt to access the website without logging in. Log in first to use the site.")
            }
            response.clearCookie("connect.sid", {path: "/"})
            getHomePage(response, "Detected attempt to access the website without logging in. Log in first to use the site.")
        })
        return true;
    }
    else if (request.session.role != role) { // If the users role doesnt permit access
        const currentRole = request.session.role;
        request.session.destroy(err => { // These both destroy cookies and redirect to home page
            if (err) {
                return getHomePage(response, `${"Detected attempt to access a "}${role}${" page with "}${currentRole}${" credentials. Log in as a "}${role}${" first."}`)
            }
            response.clearCookie("connect.sid", {path: "/"})
            getHomePage(response, `${"Detected attempt to access a "}${role}${" page with "}${currentRole}${" credentials. Log in as a "}${role}${" first."}`)
        })
        return true;
    }
    return false;
}

function clearCookies(request, response) { // This clears cookies. Its set off when someone first gets / to make sure none are saved from last time
    return new Promise((resolve) => {
        request.session.destroy(err => {
            if (!err) {
                response.clearCookie("connect.sid", { path: "/" });
                resolve();
            }
        })
    })
}

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSIONKEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        httpOnly: true
    }
}));

app.get("/", async function (request, response) { // Happens when user first logs in
    await clearCookies(request, response);
    response.sendFile(path.join(__dirname, "public/index.html")); // Get index.html when first loading in.
});

app.use(express.static(path.join(__dirname, "public"))); // Lock serving files to only inside public folder.

app.get("/getHomePage", async function(request, response) { // API for getting to home if requested from client since function is only for server to use
    await clearCookies(request, response);
    getHomePage(response, "Successfully logged out.")
})

app.get("/getSchools", function(request, response) {
    result = queryRunner.getSchools(); // Returns a list of schoolnames that exist
    response.json(result);
})

// Register staff. .isString() checks if string, .escape() gets rid of characters that could not be treated as raw text, .trim() gets rid of starting/trailing whitespaces
app.post("/regsta", [validator.body("*").isString().escape(), validator.body(["username", "schoolName"]).trim()], async function(request, response) {
    if(!validator.validationResult(request).isEmpty()) { // If the string/excape stuff fails then dont allow the process to continue and log the error
        console.log(validator.validationResult(request));
        return response.send("Invalid inputs, make sure all the fields have text.");
    }
    if (request.body.password.length < 8) { // If password is too short
        return response.send("Your password must be at least 8 characters long.");
    }
    const hashedPassword = await bcrypt.hash(request.body.password + process.env.PEPPER, 12); // bcrypt is async but this hashes the password
    const result = await queryRunner.registerStaff(request.body.username, hashedPassword, request.body.schoolName, request.body.schoolPassword + process.env.PEPPER);
    response.send(result); // Could be error from queryRunner or just a valid message
})

// Login staff .isstring() blah blah same deal
app.post("/logsta", [validator.body("*").isString().escape(), validator.body("username").trim()], async function(request, response) {
    if(!validator.validationResult(request).isEmpty()) { // Same
        console.log(validator.validationResult(request));
        return response.send("Invalid inputs, make sure all the fields have text.");
    }
    const result = await queryRunner.logStaff(request.body.username, request.body.password + process.env.PEPPER);
    if (result != "Credentials match.") { // If the queryrunner says that credentials dont match then send an error msg
        return response.send(result);
    }
    request.session.username = request.body.username; // Otherwise create the session and send them the staffPage
    request.session.role = "Staff";
    request.session.loggedIn = true;
    response.redirect("/staffPage");
})

// Register school, same thing
app.post("/regsch", [validator.body("*").isString().escape(), validator.body("schoolName").trim()], async function(request, response) {
    if(!validator.validationResult(request).isEmpty()) {
        console.log(validator.validationResult(request));
        return response.send("Invalid inputs, make sure all the fields have text.");
    }
    if (request.body.schoolPassword.length < 8 || request.body.adminPassword.length < 8) { // Check both school and admin passwords
        return response.send("Your school and admin passwords must both be at least 8 characters long.");
    }
    const hashedSchoolPassword = await bcrypt.hash(request.body.schoolPassword + process.env.PEPPER, 12); // Hash both too
    const hashedAdminPassword = await bcrypt.hash(request.body.adminPassword + process.env.PEPPER, 12);
    const result = queryRunner.registerSchool(request.body.schoolName, hashedSchoolPassword, hashedAdminPassword);
    response.send(result); // Could be error msg or ok response depending on query
})

// Login school
app.post("/logsch", [validator.body("*").isString().escape(), validator.body("schoolName").trim()], async function(request, response) {
    if(!validator.validationResult(request).isEmpty()) {
        console.log(validator.validationResult(request));
        return response.send("Invalid inputs, make sure all the fields have text.");
    }
    const result = await queryRunner.logSchool(request.body.schoolName, request.body.adminPassword + process.env.PEPPER);
    if (result != "Credentials match.") { // If query says info doesnt match registered credentials send error msg
        return response.send(result);
    }
    request.session.username = request.body.schoolName; // else create the session and send schoolPage over
    request.session.role = "School";
    request.session.loggedIn = true;
    response.redirect("/schoolPage");
})

app.get("/schoolPage", async function(request, response) { // Sends over the school page
    if (await checkSession(request, response, "School")) { // Session always cheecked to authenticate
        return;
    }
    response.redirect("/html/schoolPage.html");
})

app.get("/staffPage", async function(request, response) { // sends the staff page
    if (await checkSession(request, response, "Staff")) {
        return;
    }
    response.redirect("/html/staffPage.html");
})

// Creates a new custom type check to validate that formData is an object, as well as doing the usual escape stuff + isint()
app.post("/createTimetable", [validator.body("parkingSpots").isInt().escape().trim(), validator.body("formData").custom(type => {
    if (typeof type !== "object") {throw new Error("Invalid Form Data")} return true})], async function (request, response) {
        if (!validator.validationResult(request).isEmpty()) {
            return response.send("Invalid inputs, make sure all the fields have text.");
        }
        if (await checkSession(request, response, "School")) {
            return;
        }
        const formData = new Map(); // Recreate the map from the client from the json data
        formData.set("faculties", new Map(Object.entries(request.body.formData)));
        formData.set("parkingSpots", parseInt(request.body.parkingSpots));
        queryRunner.saveTimetable(request.session.username, timetableCalculator.generateTimetable(formData));
        response.redirect("/schoolPage") // Save the timetable to the schoolnames row, and send back the school page
    }
);

app.get("/getTimetable", async function(request, response) {
    if (await checkSession(request, response, request.session.role)) {
        return;
    }
    response.json(queryRunner.getTimetable(request.session.username, request.session.role)); // Grabs the timetable data for the client to visualise
});

app.post("/deleteTimetable", async function(request, response) {
    if (await checkSession(request, response, request.session.role)) {
        return;
    }
    queryRunner.deleteTimetable(request.session.username); // Deletes the timetable on schoolname row
    response.send("Timetable deleted, refresh to see changes.");
})

app.get("/timetableCreationPage", async function(request, response) {
    if (await checkSession(request, response, "School")) {
        return;
    }
    response.redirect("/html/timetableCreationPage.html"); // The redirect to the timetablecreationpage
})

app.post("/logout", function(request, response) {
    request.session.destroy(err => { // Set off if the user has had the tab out of focus for 30mins, just times out the session and sends them back to home page, along with an alert
        if (err) {
            return getHomePage(response, "The tab has been out of focus for too long, and the session has timed out. Log in again to use the site.")
        }
        response.clearCookie("connect.sid", {path: "/"})
        getHomePage(response, "The tab has been out of focus for too long, and the session has timed out. Log in again to use the site.")
    })
});

// Make the https server listen to port 8000
https.createServer(httpsSettings, app).listen(8000, () => console.log("Server is running on Port 8000, visit https://localhost:8000/ or https://127.0.0.1:8000 to access your website."));