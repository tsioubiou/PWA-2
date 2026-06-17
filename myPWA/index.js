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

const httpsSettings = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem")
};

function getHomePage(response, alert) {
    response.json({url: "/index.html", alertText: alert});
}

async function checkSession(request, response, role) {
    if (!request.session.loggedIn) {
        request.session.destroy(err => {
            if (err) {
                return getHomePage(response, "Detected attempt to access the website without logging in. Log in first to use the site.")
            }
            response.clearCookie("connect.sid", {path: "/"})
            getHomePage(response, "Detected attempt to access the website without logging in. Log in first to use the site.")
        })
        return true;
    }
    else if (request.session.role != role) {
        const currentRole = request.session.role;
        request.session.destroy(err => {
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

function clearCookies(request, response) {
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

app.get("/", async function (request, response) {
    await clearCookies(request, response);
    response.sendFile(path.join(__dirname, "public/index.html")); // Get index.html when first loading in.
});

app.use(express.static(path.join(__dirname, "public"))); // Lock serving files to only inside public folder.

app.get("/getHomePage", async function(request, response) {
    await clearCookies(request, response);
    getHomePage(response, "Successfully logged out.")
})

app.get("/getSchools", function(request, response) {
    result = queryRunner.getSchools();
    response.json(result);
})

app.post("/regsta", [validator.body("*").isString().escape(), validator.body(["username", "schoolName"]).trim()], async function(request, response) {
    if(!validator.validationResult(request).isEmpty()) {
        console.log(validator.validationResult(request));
        return response.send("Invalid inputs, make sure all the fields have text.");
    }
    if (request.body.password.length < 8) {
        return response.send("Your password must be at least 8 characters long.");
    }
    const hashedPassword = await bcrypt.hash(request.body.password + process.env.PEPPER, 12);
    const result = await queryRunner.registerStaff(request.body.username, hashedPassword, request.body.schoolName, request.body.schoolPassword + process.env.PEPPER);
    response.send(result);
})

app.post("/logsta", [validator.body("*").isString().escape(), validator.body("username").trim()], async function(request, response) {
    if(!validator.validationResult(request).isEmpty()) {
        console.log(validator.validationResult(request));
        return response.send("Invalid inputs, make sure all the fields have text.");
    }
    const result = await queryRunner.logStaff(request.body.username, request.body.password + process.env.PEPPER);
    if (result != "Credentials match.") {
        return response.send(result);
    }
    request.session.username = request.body.username;
    request.session.role = "Staff";
    request.session.loggedIn = true;
    response.redirect("/staffPage");
})

app.post("/regsch", [validator.body("*").isString().escape(), validator.body("schoolName").trim()], async function(request, response) {
    if(!validator.validationResult(request).isEmpty()) {
        console.log(validator.validationResult(request));
        return response.send("Invalid inputs, make sure all the fields have text.");
    }
    if (request.body.schoolPassword.length < 8 || request.body.adminPassword.length < 8) {
        return response.send("Your school and admin passwords must both be at least 8 characters long.");
    }
    const hashedSchoolPassword = await bcrypt.hash(request.body.schoolPassword + process.env.PEPPER, 12);
    const hashedAdminPassword = await bcrypt.hash(request.body.adminPassword + process.env.PEPPER, 12);
    const result = queryRunner.registerSchool(request.body.schoolName, hashedSchoolPassword, hashedAdminPassword);
    response.send(result);
})

app.post("/logsch", [validator.body("*").isString().escape(), validator.body("schoolName").trim()], async function(request, response) {
    if(!validator.validationResult(request).isEmpty()) {
        console.log(validator.validationResult(request));
        return response.send("Invalid inputs, make sure all the fields have text.");
    }
    const result = await queryRunner.logSchool(request.body.schoolName, request.body.adminPassword + process.env.PEPPER);
    if (result != "Credentials match.") {
        return response.send(result);
    }
    request.session.username = request.body.schoolName;
    request.session.role = "School";
    request.session.loggedIn = true;
    response.redirect("/schoolPage");
})

app.get("/schoolPage", async function(request, response) {
    if (await checkSession(request, response, "School")) {
        return;
    }
    response.redirect("/html/schoolPage.html");
})

app.get("/staffPage", async function(request, response) {
    if (await checkSession(request, response, "Staff")) {
        return;
    }
    response.redirect("/html/staffPage.html");
})

app.post("/createTimetable", [validator.body("parkingSpots").isInt().escape().trim(), validator.body("formData").custom(type => {
    if (typeof type !== "object") {throw new Error("Invalid Form Data")} return true})], async function (request, response) {
        if (!validator.validationResult(request).isEmpty()) {
            return response.send("Invalid inputs, make sure all the fields have text.");
        }
        if (await checkSession(request, response, "School")) {
            return;
        }
        const formData = new Map();
        formData.set("faculties", new Map(Object.entries(request.body.formData)));
        formData.set("parkingSpots", parseInt(request.body.parkingSpots));
        queryRunner.saveTimetable(request.session.username, timetableCalculator.generateTimetable(formData));
        response.redirect("/schoolPage")
    }
);

app.get("/getTimetable", async function(request, response) {
    if (await checkSession(request, response, request.session.role)) {
        return;
    }
    response.json(queryRunner.getTimetable(request.session.username, request.session.role));
});

app.post("/deleteTimetable", async function(request, response) {
    if (await checkSession(request, response, request.session.role)) {
        return;
    }
    queryRunner.deleteTimetable(request.session.username);
    response.send("Timetable deleted, refresh to see changes.");
})

app.get("/timetableCreationPage", async function(request, response) {
    if (await checkSession(request, response, "School")) {
        return;
    }
    response.redirect("/html/timetableCreationPage.html");
})

app.post("/logout", function(request, response) {
    request.session.destroy(err => {
        if (err) {
            return getHomePage(response, "The tab has been out of focus for too long, and the session has timed out. Log in again to use the site.")
        }
        response.clearCookie("connect.sid", {path: "/"})
        getHomePage(response, "The tab has been out of focus for too long, and the session has timed out. Log in again to use the site.")
    })
});

https.createServer(httpsSettings, app).listen(8000, () => console.log("Server is running on Port 8000, visit https://localhost:8000/ or https://127.0.0.1:8000 to access your website."));