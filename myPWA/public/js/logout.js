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
        }, 1800000);
    }
    else {
        clearTimeout(logoutTimer);
    }
});