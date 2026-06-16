createReplaceBtn = document.getElementById("createReplaceBtn")
deleteBtn = document.getElementById("deleteBtn")

createReplaceBtn.addEventListener("click", async function(event) {
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