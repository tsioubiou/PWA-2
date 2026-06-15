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

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSIONKEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true
    }
}));

app.use(express.static(path.join(__dirname, "public"))); // Lock serving files to only inside public folder.

app.get("/", function (request, response) {
    response.sendFile(path.join(__dirname, "public/index.html")); // Get index.html when first loading in.
});

app.post("/timetable", [validator.body("*").isString().escape().trim()], function (request, response) {
    if(!validator.validationResult(request).isEmpty()) {
        console.log(validator.validationResult(request));
        return response.send("Invalid inputs, make sure all the fields have text.");
    }
    formData = new Map();
    formData.set("faculties", new Map(Object.entries(request.body.formData)));
    formData.set("parkingSpots", parseInt(request.body.parkingSpots));
    queryRunner.saveTimetable(timetableCalculator.generateTimetable(formData));
    response.send("/html/schoolPage.html");
});

app.get("/checkTimetable", function(request, response) {
    response.json(queryRunner.getTimetable(request));
});

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

app.get("/logsta", [validator.body("*").isString().escape(), validator.body("username").trim()], function(request, response) {
    if(!validator.validationResult(request).isEmpty()) {
        console.log(validator.validationResult(request));
        return response.send("Invalid inputs, make sure all the fields have text.");
    }
    const result = queryRunner.logStaff(request.body.username, request.body.password + process.env.PEPPER);
    return response.send(result);
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

/*app.get("/logsch", [validator.body("*").isString().escape(), validator.body("schoolName").trim()], function(request, response) {
    if(!validator.validationResult(request).isEmpty()) {
        console.log(validator.validationResult(request));
        return response.send("Invalid inputs, make sure all the fields have text.");
    }
})*/

https.createServer(httpsSettings, app).listen(8000, () => console.log("Server is running on Port 8000, visit https://localhost:8000/ or https://127.0.0.1:8000 to access your website."));