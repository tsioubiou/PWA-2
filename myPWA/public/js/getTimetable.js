timetableDiv = document.getElementById("timetableDiv")

function displayTimetable(timetableData) {
    const tableBodyWk1 = document.getElementById("tableBodyWk1")
    const tableBodyWk2 = document.getElementById("tableBodyWk2")
    console.log(timetableData);
    
    const cycleLength = timetableData.values().next().value.length;
    
    for (const [faculty, teachersPerDay] of timetableData) {
        // Week 1 row (days 0-4)
        const row1 = document.createElement("tr")
        const cell1 = document.createElement("td")
        cell1.textContent = faculty
        row1.appendChild(cell1)
        
        for (let day = 0; day < 5; day++) {
            const cell = document.createElement("td")
            cell.textContent = teachersPerDay[day % cycleLength]
            row1.appendChild(cell)
        }
        tableBodyWk1.appendChild(row1)
        
        // Week 2 row (days 5-9)
        const row2 = document.createElement("tr")
        const cell2 = document.createElement("td")
        cell2.textContent = faculty
        row2.appendChild(cell2)
        
        for (let day = 5; day < 10; day++) {
            const cell = document.createElement("td")
            cell.textContent = teachersPerDay[day % cycleLength]
            row2.appendChild(cell)
        }
        tableBodyWk2.appendChild(row2)
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    const timetable = await fetch("/getTimetable", {
        credentials: "same-origin"
    });
    const timetableText = await timetable.json();
    if (timetableText === "empty") {
        timetableDiv.replaceChildren(
            Object.assign(document.createElement("p"), {
                textContent: "A timetable has not been created for your school."
            })
        );
    }
    else if ("alertText" in timetableText) {
        alert(timetableText.alertText);
        window.location.href = timetableText.url
    }
    else {
        const timetableData = Array.isArray(timetableText) ? new Map(timetableText) : timetableText;
        if (document.title == "Tablegen: Schools") {
            createReplaceBtn.textContent = "Replace";
            deleteBtn.hidden = false;
        }
        displayTimetable(timetableData);
    }
})