exports.generateTimetable = function generateTimetable(formData) {
    // Putting data in order
    const faculties = formData.get("faculties");
    noOfTeachers = 0
    const parkingSpots = formData.get("parkingSpots");
    const teachersPerFaculty = new Map();

    // Counts how many teachers are in each faculty, saving it to teachersPerFaculty
    for (const [facultyName, teachers] of faculties) {
        noOfTeachers += teachers.length;
        teachersPerFaculty.set(facultyName, teachers.length);
    }

    const cycleLength = Math.ceil(noOfTeachers / parkingSpots);

    // Creating a rough numbered timetable
    const numberedTimetable = new Map();

    // Works by first excluding the cycleLengths remainder, and then going back with the remainder and adding one to each index until there is no more remainder
    for ([facultyName, teacherCount] of teachersPerFaculty) {
        const teachersPerCycle = [];
        const teachersPerDay = Math.floor(teacherCount / cycleLength);

        for (day = 0; day < cycleLength; day++) {
            teachersPerCycle.push(teachersPerDay);
        }

        teacherCount -= teachersPerDay * cycleLength;

        for (day = 0; day < teacherCount; day++) {
            teachersPerCycle[day] += 1;
        }

        // With this you end up with more teachers being distributed toward the start of a cycle, and vacant spots toward the end
        numberedTimetable.set(facultyName, teachersPerCycle);
    }

    // Which is why you need this next step
    // Creating a correct numbered timetable
    // It adds up the total teachers every day, and if it exceeds the parking limit, it moves the extra to the next day
    for (day = 0; day < cycleLength; day++) {
        remainingSpots = parkingSpots;

        for (const[facultyName, teachersPerDay] of numberedTimetable) {
            if (teachersPerDay[day] > remainingSpots) {
                const amountExceeded = teachersPerDay[day] - remainingSpots;
                teachersPerDay[day] -= amountExceeded;
                teachersPerDay[day + 1] += amountExceeded;
            }
            remainingSpots -= teachersPerDay[day];
        }

        if (day == cycleLength - 1 && remainingSpots != 0) {
            for (const[facultyName, teachersPerDay] of numberedTimetable) {
                if (remainingSpots > 0) {
                    teachersPerDay[teachersPerDay.length - 1] += 1;
                    remainingSpots -= 1;
                }
            }
        }
    }
    // The result is saved to numberedTimetable

    // Creating a named timetable
    const namedTimetable = new Map();
    const namesRemaining = structuredClone(faculties);

    // For every day of teachersPerDay, namedTimetable takes day amount of teachers from faculties until faculties is empty
    // If there are still vacant spots after every teacher is assigned a spot, it takes from the beginning of the original faculties map again
    for (const[facultyName, teachersPerDay] of numberedTimetable) {
        namedTimetable.set(facultyName, [])
        for (const day of teachersPerDay) {
            if (day > namesRemaining.get(facultyName).length) {
                const extraNames = day - namesRemaining.get(facultyName).length;
                namedTimetable.get(facultyName).push(namesRemaining.get(facultyName).slice(0, namesRemaining.get(facultyName).length));
                namesRemaining.get(facultyName).splice(0, namesRemaining.get(facultyName).length);
                for (name = 0; name < extraNames; name++) {
                    namedTimetable.get(facultyName)[namedTimetable.get(facultyName).length - 1].push(faculties.get(facultyName)[name]);
                }
            }
            else {
                namedTimetable.get(facultyName).push(namesRemaining.get(facultyName).slice(0, day));
                namesRemaining.get(facultyName).splice(0, day);
            }
        }
    }

    // Expanding the timetable to be 2 weeks long
    const timetable = new Map();

    // Modulus will never return a bigger number than the denominator - 1, meaning it will always give an index from 0 to length - 1
    // It will loop until it has filled up 10 days (a fortnight - weekends)
    for (const[facultyName, namedCycle] of namedTimetable) {
        timetable.set(facultyName, []);
        for (day = 0; day < 10; day++) {
            timetable.get(facultyName).push(namedCycle[day % namedCycle.length]);
        }
    }

    return timetable;
}