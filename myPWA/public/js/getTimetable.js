const timetableDiv = document.getElementById("timetableDiv")
const tableBodyWk1 = document.getElementById("tableBodyWk1")
const tableBodyWk2 = document.getElementById("tableBodyWk2")
const facultyColoursKey = document.getElementById("facultyColoursKey")
let hue = 0; // Start with a specific hue for consistency
const facultyColours = []

function generateRandomColor() {
    hue += 0.618033988749895; // Add golden ratio - 1
    if (hue > 1) { // If number goes over 1 then bring it back down by subtracting 1
        hue -= 1;
    }

    const hueDegrees = Math.floor(hue * 360); // Multiply by 360 for full hue range

    return `hsl(${hueDegrees}, ${80}%, ${60}%)`; // Return with set saturation, value
}

function generateFacultyColours(timetable) {
    for ([facultyName, teachers] of timetable) { // For every faculty in timetable generate a random colour
        facultyColours.push(generateRandomColor()) // Add it to a list of facultyColours
        facultyColourKey = Object.assign(document.createElement("p"), {
            textContent: facultyName
        }) // Create a text element with text colour being the just generated colour and text being the faculty name
        facultyColourKey.style.color = facultyColours[facultyColours.length - 1] // Acts as a key to show which colour represents which faculty
        facultyColoursKey.appendChild(facultyColourKey)
    }
}

function generateWeek(weekBody, startDay, timetable) {
    const teachersPerDay = [] // Both teachers and colours for every day in the week
    const coloursPerDay = []

    for (let currentDay = 0; currentDay < 5; currentDay++) {
        const day = startDay + currentDay // Where to start in the timetable
        const teachersForThisDay = []
        const coloursForThisDay = []
        let facultyNumber = 0

        for (const teachersForEachFaculty of timetable.values()) { // Gets the value of each faculty
            const teachersFromThisFaculty = teachersForEachFaculty[day] // Picks this day from the timetable to add for today
            teachersForThisDay.push(...teachersFromThisFaculty) // Since some days have more than 1 teacher per faculty, add each teacher 1 by 1 so teachersforeachday only has strings in it
            for (const teacher of teachersFromThisFaculty) {
                coloursForThisDay.push(facultyColours[facultyNumber]) // For every teacher added rn, add a colour for the current faculty to the list
            }
            facultyNumber += 1 // Next faculty, next colour
        }

        // At the end of the day save the array, finally basically making two 2d arrays out of a map
        teachersPerDay.push(teachersForThisDay) // One for the teachers, one for the colours
        coloursPerDay.push(coloursForThisDay) // Doing this becuase a table is a 2d array, and thats how you fill it, by replicating it
    }

    for (let cell = 0; cell < teachersPerDay[0].length; cell++) { // For every row needed
        const row = document.createElement("tr") // Create row

        for (let day = 0; day < 5; day++) { // For every day in each row
            const cellElement = document.createElement("td") // Create a teacher slot
            const teacher = teachersPerDay[day][cell]
            const colour = coloursPerDay[day][cell]
            cellElement.textContent = teacher // Get the teacher and colour for that day for that row
            cellElement.style.backgroundColor = colour // Set the cells text and colour to that
            row.appendChild(cellElement)
        }

        weekBody.appendChild(row) // Put the cell in the row then the row in the table
    }
}

document.addEventListener("DOMContentLoaded", async function() {
    const timetableResult = await fetch("/getTimetable", { // getTimetable
        credentials: "same-origin"
    });
    const timetableData = await timetableResult.json();
    if (timetableData === "empty") { // If no timetable data tell that to the user
        timetableDiv.replaceChildren(
            Object.assign(document.createElement("p"), {
                textContent: "A timetable has not been created for your school."
            })
        );
    }
    else if ("alertText" in timetableData) { // If funky cookie stuff then homepage
        alert(timetableData.alertText);
        window.location.href = timetableData.url
    }
    else {
        const timetable = new Map(timetableData) // Otherwise make a map out of the timetabledata
        if (document.title == "Tablegen: Schools") { // If this is the school page then make deletion possible and replacing instead of creating
            createReplaceBtn.textContent = "Replace";
            deleteBtn.hidden = false;
        }
        generateFacultyColours(timetable) // Make faculty colours
        generateWeek(tableBodyWk1, 0, timetable) // Make faculty table
        generateWeek(tableBodyWk2, 5, timetable)
    }
})