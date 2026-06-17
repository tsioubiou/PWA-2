let logoutTimer

document.addEventListener("visibilitychange", function() {
    if (document.hidden) { // If tab isnt in focus
        logoutTimer = setTimeout(async function() { // run this function after 1800000 ms 30 mins
            const response = await fetch("/logout", { // Function being: ask to logout
                method: "POST",
                credentials: "same-origin",
                keepalive: true
            })
            const redirect = await response.json() // Tells you why you were logged out in alert (timeout) and sends homepage
            alert(redirect.alertText);
            window.location.href = redirect.url
        }, 1800000); // 30 mins
    }
    else {
        clearTimeout(logoutTimer);
    }
});

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async function() {
    const response = await fetch("/getHomePage", { // If logout then do the same thing but this time by user choice and willingness
        method: "GET", // So use getHomePage instead because its kinder to the user ig
        credentials: "same-origin" // The message is just "successful" not, "I forced you out of my PWA"
    })
    const redirect = await response.json().catch(err => console.log(err))
    alert(redirect.alertText)
    window.location.href = redirect.url;
})