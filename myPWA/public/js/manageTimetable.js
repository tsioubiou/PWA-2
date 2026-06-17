const createReplaceBtn = document.getElementById("createReplaceBtn")
const deleteBtn = document.getElementById("deleteBtn")
const infoText = document.getElementById("infoText")

createReplaceBtn.addEventListener("click", async function() {
    const result = await fetch("/timetableCreationPage", {
        method: "GET",
        credentials: "same-origin"
    });
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
})

deleteBtn.addEventListener("click", async function() {
    const result = await fetch("/deleteTimetable", {
        method: "POST",
        credentials: "same-origin"
    });
    resultClone = result.clone()
    try {
        redirect = await result.json()
        console.log(redirect);
        if (typeof redirect !== "undefined") {
            alert(redirect.alertText);
            window.location.href = redirect.url
        }
    }
    catch {
        infoText.innerText = await resultClone.text();
    }
})