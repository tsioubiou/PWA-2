const form = document.getElementById("schoolInfoForm");
const parkingSpotsInput = document.getElementById("parkingSpotsInput");
let currentFaculty;
let errorMsg;

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const formData = new Map();
    let teachers = [];

    for (const [fieldNumber, field] of Object.entries(form.elements)) {
        if (field.placeholder === "Faculty Name") {
            if (teachers.length > 0) {
                formData.set(currentFaculty, teachers);
                teachers = [];
            }

            currentFaculty = field.value;
            if (formData.has(currentFaculty)) {
                if (typeof errorMsg === "undefined") {
                    errorMsg = document.createElement("p");
                    form.appendChild(errorMsg);
                }
                errorMsg.textContent = "Each faculty must have a unique name. You have multiple faculties called " + currentFaculty + ".";
                return;
            }
        }

        if (field.placeholder === "Teacher Name" && field.value.trim() !== "") {
            teachers.push(field.value);
        }
    }
    formData.set(currentFaculty, teachers);
    const formDataAsJSON = JSON.stringify({formData: Object.fromEntries(formData), parkingSpots: parkingSpotsInput.value});
    const response = await fetch("/createTimetable", {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        body: formDataAsJSON
    });
    try {
        redirect = await response.json()
        if (typeof redirect !== "undefined") {
            alert(redirect.alertText);
            window.location.href = redirect.url
        }
    }
    catch {
        if (response.redirected) {
            window.location.href = response.url;
        }
        else {
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
    form.appendChild(fieldset);

    facultyInput = Object.assign(document.createElement("input"), {
        type: "text",
        placeholder: "Faculty Name",
        required: true
    });
    fieldset.appendChild(facultyInput);

    const teachersDiv = document.createElement("div");
    fieldset.appendChild(teachersDiv);

    teacherInput = Object.assign(document.createElement("input"), {
        type: "text",
        placeholder: "Teacher Name",
        required: true
    });
    teachersDiv.appendChild(teacherInput);

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
    teachersDiv.appendChild(removeTeacherBtn);

    addFaculty.insertAdjacentElement("beforebegin", fieldset);
});

const removeFaculty = document.getElementById("removeFacultyBtn");

removeFaculty.addEventListener("click", function() {
    const fieldsets = form.getElementsByTagName("fieldset");
    if (fieldsets.length > 0) {
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
        for (const sibling of Array.from(event.target.parentElement.children).reverse()) {
            if (sibling.placeholder === "Teacher Name") {
                sibling.remove();
                return;
            }
        }
    }
});

const fileInput = document.getElementById("fileInput");
const fileUploadBtn = document.getElementById("fileUploadBtn");

fileUploadBtn.addEventListener("click", async function(event) {
    form.querySelectorAll("fieldset").forEach(fieldset => fieldset.remove());
    for (const file of fileInput.files) {
        if (!/\.(txt)$/i.test(file.name)) {
            alert("Please upload only .txt files.");
            fileInput.value = "";
            return;
        }
        addFaculty.click();
        facultyInput.value = file.name.split(".")[0];
        removeTeacherBtn.click();
        teachers = await asyncFileReader(file);
        try {
            for (const teacher of teachers) {
                addTeacherBtn.click();
                teacherInput.value = teacher;
            }
        }
        catch (error) {
            console.log("THERES AN ERROR HELP: " + error);
        }
    }
});

function asyncFileReader(file, type) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
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
    try {
        redirect = await result.json()
        if (typeof redirect !== "undefined") {
            alert(redirect.alertText);
            window.location.href = redirect.url
        }
    }
    catch {
        window.location.href = result.url;
    }
});