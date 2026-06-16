const reglog = document.getElementsByName("register/login")[0];
const stasch = document.getElementsByName("staff/school")[0];
const formFields = document.getElementsByName("formFields")[0];
const forms = formFields.children
const choices = []
const dropdowns = document.querySelectorAll(".dropdown");
schools = []

fetch("/getSchools", {
    method: "GET",
    credentials: "same-origin"
}).then(response => {return response.json()}).then(schoolList => {schools = schoolList; updateDropdowns()});

function updateDropdowns() {
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
    else {
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
    if (event.target.className === "non-formBtns") {
        choices.push(event.target);
        if (event.target.parentElement == reglog) {
            reglog.hidden = true;
            stasch.hidden = false;
        }
        else {
            stasch.hidden = true;
            formFields.hidden = false;
            showCorrectForm();
        }
    }
    else if (event.target.type === "submit") {
        event.preventDefault();
        const result = await fetch(`/${event.target.parentElement.id}`, {
            method: "POST",
            credentials: "same-origin",
            body: new URLSearchParams(new FormData(event.target.parentElement))
        });
        if (result.redirected) {
            window.location.href = result.url;
        }
        else {
            const resultMsg = await result.text();
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
    reglog.hidden = false;
    stasch.hidden = true;
    formFields.hidden = true;
    choices.length = 0;
    if (typeof resultElement !== "undefined") {
        resultElement.textContent = ""
    }
});

const reg = document.getElementById("registerBtn")
const log = document.getElementById("loginBtn")
const sta = document.getElementById("staffBtn")
const sch = document.getElementById("schoolBtn")

function showCorrectForm() {
    for (const form of forms) {
        form.hidden = true;
    }
    if (choices[0] === reg && choices[1] === sta) {
        forms[0].hidden = false;
    }
    else if (choices[0] === log && choices[1] === sta) {
        forms[1].hidden = false;
    }
    else if (choices[0] === reg && choices[1] === sch) {
        forms[2].hidden = false;
    }
    else {
        forms[3].hidden = false;
    }
}