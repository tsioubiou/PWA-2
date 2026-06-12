if ('serviceWorker' in navigator) { // If browser allows serviceworkers.
    window.addEventListener('load', () => { // Wait for window to finish loading.
        navigator.serviceWorker.register('../serviceWorker.js') // Register the serviceworker.
        .catch((error) => {
            console.log(error)
        });
    });
}