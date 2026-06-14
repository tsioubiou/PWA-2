const reglog = document.getElementsByName("register/login")[0];
const stasch = document.getElementsByName("staff/school")[0];
const formFields = document.getElementsByName("formFields")[0];
const forms = formFields.children
const choices = []

document.addEventListener("click", function(event) {
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
});

const cancelBtn = document.getElementById("cancelBtn")

cancelBtn.addEventListener("click", function(event) {
    reglog.hidden = false;
    stasch.hidden = true;
    formFields.hidden = true;
    choices.length = 0;
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