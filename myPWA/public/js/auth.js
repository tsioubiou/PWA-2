const reglog = document.getElementsByName("register/login")[0];
const stasch = document.getElementsByName("staff/school")[0];
const formFields = document.getElementsByName("formFields")[0];
const forms = formFields.children
const choices = []
const dropdowns = document.querySelectorAll(".dropdown");
schools = []

fetch("/getSchools", { // Get a list of schoolnames
    method: "GET",
    credentials: "same-origin"
}).then(response => {return response.json()}).then(schoolList => {schools = schoolList; updateDropdowns()});

function updateDropdowns() { // If there are any schools then update the schooldropdowns by creating a new option for every school and naming it school
    if (schools.length > 0) {
        for (const dropdown of dropdowns) {
            for (const school of schools) {
                dropdown.appendChild(
                    Object.assign(document.createElement("option"), {
                        value: school,
                        text: school
                    })
                )
            }
        }
    }
    else { // Otherwise replace the form with text saying there are no schools available
        for (const dropdown of dropdowns) {
            dropdown.parentElement.replaceChildren(
                Object.assign(document.createElement("p"), {
                textContent: "There are no schools currently registered."
                })
            )
        }
    }
}

document.addEventListener("click", async function(event) {
    if (event.target.className === "non-formBtns") { // If the buttons pressed are either reg/log or sch/sta
        choices.push(event.target); // Add the choice to the choices array
        if (event.target.parentElement == reglog) { // If its the first choice
            reglog.hidden = true; // Make the second choice buttons available
            stasch.hidden = false;
        }
        else { // If its the second choice make both choices hidden and show the form that matches choices array
            stasch.hidden = true;
            formFields.hidden = false;
            showCorrectForm();
        }
    }
    else if (event.target.type === "submit") {
        event.preventDefault();
        const result = await fetch(`/${event.target.parentElement.id}`, { // the form id is also the name of the api for easy access
            method: "POST",
            credentials: "same-origin",
            body: new URLSearchParams(new FormData(event.target.parentElement)) // Send over the form data
        });
        if (result.redirected) {
            window.location.href = result.url; // If redirected to another url, then go there
        }
        else {
            const resultMsg = await result.text(); // Otherwise show the error from the server to the user
            if (typeof resultElement === "undefined"){
                resultElement = document.createElement("p")
                document.body.appendChild(resultElement);
            }
            resultElement.textContent = resultMsg
        }
    }
});

const cancelBtn = document.getElementById("cancelBtn")

cancelBtn.addEventListener("click", function(event) {
    reglog.hidden = false; // If reg/log and sta/sch selections cancelled hide all forms and 2nd choice, reset choices and errormsgs, and show 1st choice
    stasch.hidden = true;
    formFields.hidden = true;
    choices.length = 0;
    if (typeof resultElement !== "undefined") {
        resultElement.textContent = ""
    }
});

const reg = document.getElementById("registerBtn") // get references to the reg/log and sta/sch buttons
const log = document.getElementById("loginBtn")
const sta = document.getElementById("staffBtn")
const sch = document.getElementById("schoolBtn")

function showCorrectForm() {
    for (const form of forms) {
        form.hidden = true; // Hide all forms
    }
    if (choices[0] === reg && choices[1] === sta) { // If regsta show regsta form
        forms[0].hidden = false;
    }
    else if (choices[0] === log && choices[1] === sta) { // If logsta show that form
        forms[1].hidden = false;
    }
    else if (choices[0] === reg && choices[1] === sch) { // If regsch show form
        forms[2].hidden = false;
    }
    else {
        forms[3].hidden = false; // Else show logsch
    }
}