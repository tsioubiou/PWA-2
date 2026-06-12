form = document.getElementById("schoolInfoForm");

form.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Collect form data
    formData = new Map();

    for ([fieldNumber, field] of Object.entries(form.elements)) {
        if (field.placeholder === "Faculty Name") {

            if (typeof teachers !== "undefined") {
                formData.set(currentFaculty, teachers);
            }

            currentFaculty = field.value;
            if (formData.has(currentFaculty)) {
                alert("Each faculty must have a unique name. You have multiple faculties called " + currentFaculty + ".");
            }
            teachers = [];
        }

        if (field.placeholder === "Teacher Name") {
            if (field.value.trim() !== "") {
                teachers.push(field.value);
            }
        }
    }
    formData.set(currentFaculty, teachers);
    console.log(formData);
});

addFaculty = document.getElementById("addFacultyBtn");

addFaculty.addEventListener("click", function() {
    fieldset = document.createElement("fieldset");
    form.appendChild(fieldset);
    facultyInput = Object.assign(document.createElement("input"), {
        type: "text",
        placeholder: "Faculty Name",
        required: true
    });
    fieldset.appendChild(facultyInput);
    teachersDiv = document.createElement("div");
    teachersDiv.style = "margin-top: 10px; margin-bottom: 10px; margin-left: 20px;";
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
    addFaculty.insertAdjacentElement("beforebegin", fieldset);
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
});