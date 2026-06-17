let logoutTimer

document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
        logoutTimer = setTimeout(async function() {
            const response = await fetch("/logout", {
                method: "POST",
                credentials: "same-origin",
                keepalive: true
            })
            const redirect = await response.json()
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
    const response = await fetch("/getHomePage", {
        method: "GET",
        credentials: "same-origin"
    })
    const redirect = await response.json().catch(err => console.log(err))
    alert(redirect.alertText)
    window.location.href = redirect.url;
})