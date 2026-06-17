const form = document.getElementById("schoolInfoForm");
const parkingSpotsInput = document.getElementById("parkingSpotsInput");
let currentFaculty;
let errorMsg; // Used to show server msgs to the user

form.addEventListener("submit", async function(event) {
    event.preventDefault(); // Stop the button from reloading the page

    const formData = new Map();
    let teachers = [];

    for (const [fieldNumber, field] of Object.entries(form.elements)) { // Go through all the fields in the form
        if (field.placeholder === "Faculty Name") {
            if (teachers.length > 0) { // If its the first faculty, no teacher data would be gatheres so don't save the faculty
                formData.set(currentFaculty, teachers);
                teachers = [];
            }

            currentFaculty = field.value;
            if (formData.has(currentFaculty)) { // If formData already has a faculty with the same, tell user 2 faculties cant share a name
                if (typeof errorMsg === "undefined") {
                    errorMsg = document.createElement("p");
                    form.appendChild(errorMsg);
                }
                errorMsg.textContent = "Each faculty must have a unique name. You have multiple faculties called " + currentFaculty + ".";
                return;
            }
        }

        if (field.placeholder === "Teacher Name" && field.value.trim() !== "") {
            teachers.push(field.value); // Add all teachers to the teacher list
        }
    }
    formData.set(currentFaculty, teachers); // Dont forget to set the last faculty too
    const formDataAsJSON = JSON.stringify({formData: Object.fromEntries(formData), parkingSpots: parkingSpotsInput.value});
    const response = await fetch("/createTimetable", {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        body: formDataAsJSON // send the formData to /createTimetable as a stringified json
    });
    try {
        redirect = await response.json() // If session cookies have an issue send to homepage
        if (typeof redirect !== "undefined") {
            alert(redirect.alertText);
            window.location.href = redirect.url
        }
    }
    catch {
        if (response.redirected) {
            window.location.href = response.url; // Otherwise if the create + save timetable went well do back to schoolPage
        }
        else { // Otherwise show the user any error sent from the server
            const text = await response.text();
            if (typeof errorMsg === "undefined") {
                errorMsg = document.createElement("p");
                form.appendChild(errorMsg);
            }
            errorMsg.textContent = text;
        }
    }
});

const addFaculty = document.getElementById("addFacultyBtn");

addFaculty.addEventListener("click", function() {
    const fieldset = document.createElement("fieldset");
    form.appendChild(fieldset); // Make a fieldset child of form

    facultyInput = Object.assign(document.createElement("input"), {
        type: "text",
        placeholder: "Faculty Name",
        required: true
    });
    fieldset.appendChild(facultyInput); // Make a faculty input child of fieldset

    const teachersDiv = document.createElement("div");
    fieldset.appendChild(teachersDiv); // Make the teachersDiv a child of fieldset

    teacherInput = Object.assign(document.createElement("input"), {
        type: "text",
        placeholder: "Teacher Name",
        required: true
    });
    teachersDiv.appendChild(teacherInput); // Make a teacherInput a teachersDiv child

    addTeacherBtn = Object.assign(document.createElement("button"), {
        type: "button",
        className: "addTeacherBtn"
    })
    addTeacherBtn.textContent = "Add Teacher"
    teachersDiv.appendChild(addTeacherBtn);

    removeTeacherBtn = Object.assign(document.createElement("button"), {
        type: "button",
        className: "removeTeacherBtn"
    });
    removeTeacherBtn.textContent = "Remove Teacher";
    teachersDiv.appendChild(removeTeacherBtn); // Make the add and remove teacher buttons teachersDiv children too

    addFaculty.insertAdjacentElement("beforebegin", fieldset);
});

const removeFaculty = document.getElementById("removeFacultyBtn");

removeFaculty.addEventListener("click", function() {
    const fieldsets = form.getElementsByTagName("fieldset");
    if (fieldsets.length > 0) { // Remove the last fieldset in a list of all fieldsets (the bottom one in the page)
        fieldsets[fieldsets.length - 1].remove();
    }
});

form.addEventListener("click", function(event) {
    if (event.target.className === "addTeacherBtn") {
        teacherInput = Object.assign(document.createElement("input"), {
            type: "text",
            placeholder: "Teacher Name",
            required: true
        });
        event.target.insertAdjacentElement("beforebegin", teacherInput);
    }
    if (event.target.className === "removeTeacherBtn") {
        for (const sibling of Array.from(event.target.parentElement.children).reverse()) { // Get a reversed list of siblings of the button
            if (sibling.placeholder === "Teacher Name") { // Then remove the first one that is a teacher input
                sibling.remove();
                return;
            }
        }
    }
});

const fileInput = document.getElementById("fileInput");
const fileUploadBtn = document.getElementById("fileUploadBtn");

fileUploadBtn.addEventListener("click", async function(event) {
    form.querySelectorAll("fieldset").forEach(fieldset => fieldset.remove()); // Get rid of all fieldsets
    for (const file of fileInput.files) { // For every file
        if (!/\.(txt)$/i.test(file.name)) { // If its not a .txt then ask for one
            alert("Please upload only .txt files.");
            fileInput.value = "";
            return;
        }
        addFaculty.click(); // Otherwise, add a faculty
        facultyInput.value = file.name.split(".")[0]; // Name it the filename - file extension
        removeTeacherBtn.click(); // Remove the one teacher that comes up by default
        teachers = await asyncFileReader(file); // Get array of teachers
        try {
            for (const teacher of teachers) {
                addTeacherBtn.click(); // For each teacher add a teacher field and make its text the teacher
                teacherInput.value = teacher;
            }
        }
        catch (error) {
            console.log("THERES AN ERROR HELP: " + error);
        }
    }
});

function asyncFileReader(file, type) {
    return new Promise((resolve, reject) => { // Use a promise so that you can await the results of the function
        const reader = new FileReader();
        reader.onload = function(event) { // Make an array out of each line in the file, separated by a newline
            resolve(event.target.result.split(/\r?\n/).filter(line => line.trim() !== ""));
        };
        reader.onerror = function() {
            reject("EROROORORO: " + reader.error);
        };
        reader.readAsText(file);
    });
}

const cancelBtn = document.getElementById("cancelBtn");

cancelBtn.addEventListener("click", async function(event) {
    const result = await fetch("/schoolPage", {
        method: "GET",
        credentials: "same-origin"
    })
    try { // If its cancelled then try to get back to schoolPage
        redirect = await result.json()
        if (typeof redirect !== "undefined") { // If there was some funky cookies then send user back to home
            alert(redirect.alertText);
            window.location.href = redirect.url
        }
    }
    catch {
        window.location.href = result.url; // Else go on ahead to school page
    }
});