const timetableDiv = document.getElementById("timetableDiv")
const tableBodyWk1 = document.getElementById("tableBodyWk1")
const tableBodyWk2 = document.getElementById("tableBodyWk2")
const facultyColoursKey = document.getElementById("facultyColoursKey")
let hue = 0.45;
const facultyColours = []

function generateRandomColor() {
    hue += 0.618033988749895;
    if (hue > 1) {
        hue -= 1;
    }

    const hueDegrees = Math.floor(hue * 360);

    return `hsl(${hueDegrees}, ${80}%, ${60}%)`;
}

function generateFacultyColours(timetable) {
    for ([facultyName, teachers] of timetable) {
        facultyColours.push(generateRandomColor())
        facultyColourKey = Object.assign(document.createElement("p"), {
            textContent: facultyName
        })
        facultyColourKey.style.color = facultyColours[facultyColours.length - 1]
        facultyColoursKey.appendChild(facultyColourKey)
    }
}

function generateWeek(weekBody, startDay, timetable) {
    const teachersPerDay = []
    const coloursPerDay = []

    for (let currentDay = 0; currentDay < 5; currentDay++) {
        const day = startDay + currentDay
        const teachersForThisDay = []
        const coloursForThisDay = []
        let facultyNumber = 0

        for (const teachersForEachFaculty of timetable.values()) {
            const teachersFromThisFaculty = teachersForEachFaculty[day]
            teachersForThisDay.push(...teachersFromThisFaculty)
            for (const teacher of teachersFromThisFaculty) {
                coloursForThisDay.push(facultyColours[facultyNumber])
            }
            facultyNumber += 1
        }

        teachersPerDay.push(teachersForThisDay)
        coloursPerDay.push(coloursForThisDay);
    }

    for (let cell = 0; cell < teachersPerDay[0].length; cell++) {
        const row = document.createElement("tr")

        for (let day = 0; day < 5; day++) {
            const cellElement = document.createElement("td")
            const teacher = teachersPerDay[day][cell]
            const colour = coloursPerDay[day][cell]
            cellElement.textContent = teacher
            cellElement.style.backgroundColor = colour
            row.appendChild(cellElement)
        }

        weekBody.appendChild(row)
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    const timetableResult = await fetch("/getTimetable", {
        credentials: "same-origin"
    });
    const timetableData = await timetableResult.json();
    if (timetableData === "empty") {
        timetableDiv.replaceChildren(
            Object.assign(document.createElement("p"), {
                textContent: "A timetable has not been created for your school."
            })
        );
    }
    else if ("alertText" in timetableData) {
        alert(timetableData.alertText);
        window.location.href = timetableData.url
    }
    else {
        const timetable = new Map(timetableData)
        if (document.title == "Tablegen: Schools") {
            createReplaceBtn.textContent = "Replace";
            deleteBtn.hidden = false;
        }
        generateFacultyColours(timetable)
        generateWeek(tableBodyWk1, 0, timetable)
        generateWeek(tableBodyWk2, 5, timetable)
    }
})