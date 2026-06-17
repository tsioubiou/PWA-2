const createReplaceBtn = document.getElementById("createReplaceBtn")
const deleteBtn = document.getElementById("deleteBtn")
const infoText = document.getElementById("infoText")

createReplaceBtn.addEventListener("click", async function() {
    const result = await fetch("/timetableCreationPage", { // Ask for timetablecreationpage
        method: "GET",
        credentials: "same-origin"
    });
    try {
        redirect = await result.json() // If funky cookie get homepage
        if (typeof redirect !== "undefined") {
            alert(redirect.alertText);
            window.location.href = redirect.url
        }
    }
    catch {
        window.location.href = result.url; // otherwise request accepted
    }
})

deleteBtn.addEventListener("click", async function() {
    const result = await fetch("/deleteTimetable", { // Ask to delete timetable
        method: "POST",
        credentials: "same-origin"
    });
    resultClone = result.clone() // Make clone of result so you can read it twice
    try {
        redirect = await result.json() // funky cookie yk the drill
        console.log(redirect);
        if (typeof redirect !== "undefined") {
            alert(redirect.alertText);
            window.location.href = redirect.url
        }
    }
    catch {
        infoText.innerText = await resultClone.text(); // If it works send a quick message that deletion worked and they should refresh
    }
})