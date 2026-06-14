const https = require("https");
const fs = require("fs");
const express = require("express");
const path = require("path");
const timetableCalculator = require("./timetableCalculator.js")
const queryRunner = require("./queryRunner.js"); // Use this to run the query function.
const app = express();

const httpsSettings = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem")
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Middleware to parse JSON bodies.

app.use(express.static(path.join(__dirname, "public"))); // Lock serving files to only inside public folder.

app.get("/", function (request, response) {
    response.sendFile(path.join(__dirname, "public/index.html")); // Get index.html when first loading in.
});

app.post("/timetable", function (request, response) {
    formData = new Map();
    formData.set("faculties", new Map(Object.entries(request.body.formData)));
    formData.set("parkingSpots", parseInt(request.body.parkingSpots));
    queryRunner.saveTimetable(timetableCalculator.generateTimetable(formData));
    response.send("/html/schoolPage.html");
});

app.get("/checkTimetable", function(request, response) {
    response.json(queryRunner.getTimetable(request));
});

app.post("/regsta", function(request, resoponse) {
    if (request.body.password.length < 8){
        return request.send("Your password must be at least 8 characters long");
    }
    request.body.username, request.body.password, request.body.schoolName, request.body.schoolPassword;
})

// Listen to port 8000.
https.createServer(httpsSettings, app).listen(8000, () => console.log("Server is running on Port 8000, visit https://localhost:8000/ or https://127.0.0.1:8000 to access your website"));