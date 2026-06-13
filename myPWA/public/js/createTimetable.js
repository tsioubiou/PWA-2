const form = document.getElementById("schoolInfoForm");
const parkingSpotsInput = document.getElementById("parkingSpotsInput");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new Map();
    teachers = [];

    for ([fieldNumber, field] of Object.entries(form.elements)) {
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
    formDataAsJSON = JSON.stringify({formData: Object.fromEntries(formData), parkingSpots: parkingSpotsInput.value});
    fetch("/timetable", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: formDataAsJSON
    }).then(response => response.text())
    .then(url => {
        window.location.href = url;
    })
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
    addTeacherBtn.innerHTML = "Add Teacher"
    teachersDiv.appendChild(addTeacherBtn);

    removeTeacherBtn = Object.assign(document.createElement("button"), {
        type: "button",
        className: "removeTeacherBtn"
    });
    removeTeacherBtn.innerHTML = "Remove Teacher";
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
            console.log(error);
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
            reject(reader.error);
        };
        reader.readAsText(file);
    });
}