/* =========================================================
   STUDENT BURNOUT DETECTION & WELL-BEING MONITOR
   LocalStorage Based Application
   ========================================================= */

const STORAGE_KEY = "studentBurnoutRecords";
const PROFILE_KEY = "studentProfile";


// ---------------------------------------------------------
// STORAGE FUNCTIONS
// ---------------------------------------------------------

function getRecords() {

    return JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];

}


function saveRecords(records) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(records)
    );

}


function getProfile() {

    return JSON.parse(
        localStorage.getItem(PROFILE_KEY)
    ) || {
        name: "Student",
        course: "",
        year: ""
    };

}


// ---------------------------------------------------------
// BURNOUT SCORE CALCULATION
// ---------------------------------------------------------

function calculateBurnoutScore(
    mood,
    stress,
    study,
    sleep,
    motivation
) {

    /*
        Stress = 30%
        Sleep = 25%
        Motivation = 20%
        Mood = 15%
        Study = 10%
    */

    const stressScore =
        ((stress - 1) / 4) * 30;

    let sleepRisk;

    if (sleep >= 7 && sleep <= 9) {
        sleepRisk = 0;
    }
    else if (sleep >= 6 && sleep < 7) {
        sleepRisk = 12;
    }
    else if (sleep >= 5 && sleep < 6) {
        sleepRisk = 20;
    }
    else {
        sleepRisk = 25;
    }

    const motivationScore =
        ((5 - motivation) / 4) * 20;

    const moodScore =
        ((5 - mood) / 4) * 15;

    let studyScore = 0;

    if (study > 10) {
        studyScore = 10;
    }
    else if (study > 8) {
        studyScore = 7;
    }
    else if (study > 6) {
        studyScore = 4;
    }

    let total =
        stressScore +
        sleepRisk +
        motivationScore +
        moodScore +
        studyScore;

    total = Math.round(total);

    return Math.max(
        0,
        Math.min(100, total)
    );

}


// ---------------------------------------------------------
// RISK LEVEL
// ---------------------------------------------------------

function getRiskLevel(score) {

    if (score < 40) {
        return "Healthy";
    }

    if (score < 70) {
        return "Moderate Risk";
    }

    return "High Risk";

}


// ---------------------------------------------------------
// RECOMMENDATIONS
// ---------------------------------------------------------

function getRecommendation(record) {

    const recommendations = [];

    if (record.stress >= 4) {

        recommendations.push(
            "Try taking short breaks and practicing relaxation activities."
        );

    }

    if (record.sleep < 6) {

        recommendations.push(
            "Try to maintain a consistent sleep schedule and aim for adequate sleep."
        );

    }

    if (record.study > 10) {

        recommendations.push(
            "Avoid excessively long study sessions. Use regular breaks."
        );

    }

    if (record.motivation <= 2) {

        recommendations.push(
            "Break large tasks into smaller achievable goals."
        );

    }

    if (record.mood <= 2) {

        recommendations.push(
            "Consider talking with someone you trust about how you are feeling."
        );

    }

    if (recommendations.length === 0) {

        recommendations.push(
            "Your current pattern looks balanced. Keep maintaining healthy routines."
        );

    }

    return recommendations.join(" ");

}


// ---------------------------------------------------------
// PROFILE
// ---------------------------------------------------------

const profileForm =
    document.getElementById("profileForm");

if (profileForm) {

    const profile = getProfile();

    document.getElementById("profileName").value =
        profile.name || "";

    document.getElementById("course").value =
        profile.course || "";

    document.getElementById("year").value =
        profile.year || "1st Year";


    profileForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const newProfile = {

                name:
                    document.getElementById(
                        "profileName"
                    ).value,

                course:
                    document.getElementById(
                        "course"
                    ).value,

                year:
                    document.getElementById(
                        "year"
                    ).value

            };

            localStorage.setItem(
                PROFILE_KEY,
                JSON.stringify(newProfile)
            );

            alert(
                "Profile saved successfully!"
            );

            showAchievements();

        }
    );

}


// ---------------------------------------------------------
// DAILY CHECK-IN
// ---------------------------------------------------------

const checkinForm =
    document.getElementById("checkinForm");

if (checkinForm) {

    const dateInput =
        document.getElementById("date");

    dateInput.value =
        new Date().toISOString().split("T")[0];


    checkinForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const date =
                document.getElementById("date").value;

            const mood =
                Number(
                    document.getElementById("mood").value
                );

            const stress =
                Number(
                    document.getElementById("stress").value
                );

            const study =
                Number(
                    document.getElementById("study").value
                );

            const sleep =
                Number(
                    document.getElementById("sleep").value
                );

            const motivation =
                Number(
                    document.getElementById(
                        "motivation"
                    ).value
                );

            const notes =
                document.getElementById(
                    "notes"
                ).value;


            const score =
                calculateBurnoutScore(
                    mood,
                    stress,
                    study,
                    sleep,
                    motivation
                );


            const risk =
                getRiskLevel(score);


            const record = {

                id: Date.now(),

                date,

                mood,

                stress,

                study,

                sleep,

                motivation,

                notes,

                burnoutScore: score,

                risk,

                recommendation:
                    getRecommendation({
                        mood,
                        stress,
                        study,
                        sleep,
                        motivation
                    })

            };


            const records =
                getRecords();


            records.push(record);

            saveRecords(records);


            document.getElementById(
                "message"
            ).innerHTML =
                `✅ Check-in saved successfully!<br>
                 Burnout Score: ${score}/100<br>
                 Risk Level: ${risk}`;


            checkinForm.reset();

            dateInput.value =
                new Date().toISOString().split("T")[0];

        }
    );

}


// ---------------------------------------------------------
// DASHBOARD
// ---------------------------------------------------------

function loadDashboard() {

    const scoreElement =
        document.getElementById(
            "burnoutScore"
        );

    if (!scoreElement) return;


    const records =
        getRecords();

    const profile =
        getProfile();


    document.getElementById(
        "userName"
    ).textContent =
        profile.name || "Student";


    if (records.length === 0) {

        return;

    }


    records.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );


    const latest =
        records[0];


    scoreElement.textContent =
        latest.burnoutScore;


    document.getElementById(
        "scoreCircle"
    ).textContent =
        latest.burnoutScore;


    document.getElementById(
        "riskLevel"
    ).textContent =
        latest.risk;


    document.getElementById(
        "latestMood"
    ).textContent =
        getMoodText(latest.mood);


    document.getElementById(
        "latestStress"
    ).textContent =
        latest.stress + "/5";


    document.getElementById(
        "latestSleep"
    ).textContent =
        latest.sleep + " hrs";


    document.getElementById(
        "latestStudy"
    ).textContent =
        latest.study + " hrs";


    document.getElementById(
        "latestMotivation"
    ).textContent =
        latest.motivation + "/5";


    document.getElementById(
        "recommendation"
    ).textContent =
        latest.recommendation;


    document.getElementById(
        "currentStreak"
    ).textContent =
        calculateCurrentStreak(records) +
        " days";

}


function getMoodText(mood) {

    const moods = {

        5: "😊 Very Happy",

        4: "🙂 Happy",

        3: "😐 Neutral",

        2: "😔 Sad",

        1: "😞 Very Sad"

    };

    return moods[mood] || "--";

}


loadDashboard();


// ---------------------------------------------------------
// HISTORY
// ---------------------------------------------------------

function displayHistory() {

    const container =
        document.getElementById(
            "historyContainer"
        );

    if (!container) return;


    const records =
        getRecords();


    const search =
        (
            document.getElementById(
                "searchHistory"
            )?.value || ""
        ).toLowerCase();


    const riskFilter =
        document.getElementById(
            "riskFilter"
        )?.value || "all";


    const filtered =
        records.filter(record => {

            const matchesSearch =
                record.notes
                    .toLowerCase()
                    .includes(search);


            const matchesRisk =
                riskFilter === "all" ||
                record.risk === riskFilter;


            return (
                matchesSearch &&
                matchesRisk
            );

        });


    if (filtered.length === 0) {

        container.innerHTML =
            "<p>No records found.</p>";

        return;

    }


    filtered.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );


    container.innerHTML =
        filtered.map(record => `

            <div class="history-card">

                <h3>
                    📅 ${record.date}
                </h3>

                <p>
                    <strong>Mood:</strong>
                    ${getMoodText(record.mood)}
                </p>

                <p>
                    <strong>Stress:</strong>
                    ${record.stress}/5
                </p>

                <p>
                    <strong>Study:</strong>
                    ${record.study} hours
                </p>

                <p>
                    <strong>Sleep:</strong>
                    ${record.sleep} hours
                </p>

                <p>
                    <strong>Motivation:</strong>
                    ${record.motivation}/5
                </p>

                <p>
                    <strong>Burnout Score:</strong>
                    ${record.burnoutScore}/100
                </p>

                <p>
                    <strong>Risk:</strong>
                    ${record.risk}
                </p>

                <p>
                    <strong>Notes:</strong>
                    ${record.notes || "No notes"}
                </p>

                <p>
                    💡 ${record.recommendation}
                </p>

                <button
                    class="delete-btn"
                    onclick="deleteRecord(${record.id})"
                >
                    Delete
                </button>

            </div>

        `).join("");

}


function deleteRecord(id) {

    if (
        !confirm(
            "Are you sure you want to delete this record?"
        )
    ) {

        return;

    }


    let records =
        getRecords();


    records =
        records.filter(
            record =>
                record.id !== id
        );


    saveRecords(records);

    displayHistory();

}


if (
    document.getElementById(
        "searchHistory"
    )
) {

    document.getElementById(
        "searchHistory"
    ).addEventListener(
        "input",
        displayHistory
    );

}


if (
    document.getElementById(
        "riskFilter"
    )
) {

    document.getElementById(
        "riskFilter"
    ).addEventListener(
        "change",
        displayHistory
    );

}


displayHistory();


// ---------------------------------------------------------
// STREAK CALCULATION
// ---------------------------------------------------------

function calculateCurrentStreak(records) {

    if (records.length === 0) {
        return 0;
    }


    const dates =
        [...new Set(
            records.map(
                record => record.date
            )
        )].sort().reverse();


    let streak = 1;


    for (
        let i = 0;
        i < dates.length - 1;
        i++
    ) {

        const current =
            new Date(dates[i]);

        const previous =
            new Date(dates[i + 1]);


        const difference =
            (
                current - previous
            ) /
            (
                1000 *
                60 *
                60 *
                24
            );


        if (difference === 1) {

            streak++;

        }
        else {

            break;

        }

    }


    return streak;

}


function calculateLongestStreak(records) {

    if (records.length === 0) {
        return 0;
    }


    const dates =
        [...new Set(
            records.map(
                record => record.date
            )
        )].sort();


    let longest = 1;

    let current = 1;


    for (
        let i = 1;
        i < dates.length;
        i++
    ) {

        const previous =
            new Date(
                dates[i - 1]
            );

        const currentDate =
            new Date(
                dates[i]
            );


        const difference =
            (
                currentDate -
                previous
            ) /
            (
                1000 *
                60 *
                60 *
                24
            );


        if (difference === 1) {

            current++;

            longest =
                Math.max(
                    longest,
                    current
                );

        }
        else {

            current = 1;

        }

    }


    return longest;

}


// ---------------------------------------------------------
// ACHIEVEMENTS
// ---------------------------------------------------------

function showAchievements() {

    const container =
        document.getElementById(
            "achievements"
        );

    if (!container) return;


    const records =
        getRecords();


    const badges = [];


    if (records.length >= 1) {

        badges.push(
            "🌱 First Check-In"
        );

    }


    if (records.length >= 7) {

        badges.push(
            "🔥 7 Day Tracker"
        );

    }


    if (records.length >= 30) {

        badges.push(
            "🏆 30 Day Champion"
        );

    }


    if (
        calculateLongestStreak(records) >= 7
    ) {

        badges.push(
            "⭐ 7 Day Streak"
        );

    }


    if (records.length === 0) {

        container.innerHTML =
            "<p>Complete check-ins to unlock achievements.</p>";

        return;

    }


    container.innerHTML =
        badges.map(
            badge =>
                `<span class="badge">${badge}</span>`
        ).join("");

}


showAchievements();


// ---------------------------------------------------------
// EXPORT JSON
// ---------------------------------------------------------

function exportJSON() {

    const records =
        getRecords();


    const data =
        JSON.stringify(
            records,
            null,
            2
        );


    downloadFile(
        data,
        "wellbeing-records.json",
        "application/json"
    );

}


// ---------------------------------------------------------
// EXPORT CSV
// ---------------------------------------------------------

function exportCSV() {

    const records =
        getRecords();


    if (records.length === 0) {

        alert(
            "No records available."
        );

        return;

    }


    const headers = [

        "Date",
        "Mood",
        "Stress",
        "Study Hours",
        "Sleep Hours",
        "Motivation",
        "Burnout Score",
        "Risk",
        "Notes"

    ];


    const rows =
        records.map(record => [

            record.date,

            getMoodText(
                record.mood
            ),

            record.stress,

            record.study,

            record.sleep,

            record.motivation,

            record.burnoutScore,

            record.risk,

            record.notes

        ]);


    const csv = [

        headers.join(","),

        ...rows.map(
            row =>
                row.map(
                    value =>
                        `"${String(value)
                            .replaceAll('"', '""')}"`
                ).join(",")
        )

    ].join("\n");


    downloadFile(
        csv,
        "wellbeing-records.csv",
        "text/csv"
    );

}


// ---------------------------------------------------------
// FILE DOWNLOAD
// ---------------------------------------------------------

function downloadFile(
    content,
    filename,
    type
) {

    const blob =
        new Blob(
            [content],
            { type }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        filename;

    link.click();


    URL.revokeObjectURL(url);

}


// ---------------------------------------------------------
// ANALYTICS
// ---------------------------------------------------------

function loadAnalytics() {

    if (
        !document.getElementById(
            "burnoutChart"
        )
    ) {

        return;

    }


    const records =
        getRecords().sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        );


    if (records.length === 0) {

        return;

    }


    const labels =
        records.map(
            record =>
                record.date
        );


    const burnout =
        records.map(
            record =>
                record.burnoutScore
        );


    const stress =
        records.map(
            record =>
                record.stress
        );


    const motivation =
        records.map(
            record =>
                record.motivation
        );


    const sleep =
        records.map(
            record =>
                record.sleep
        );


    const study =
        records.map(
            record =>
                record.study
        );


    new Chart(

        document.getElementById(
            "burnoutChart"
        ),

        {

            type: "line",

            data: {

                labels,

                datasets: [

                    {

                        label:
                            "Burnout Score",

                        data:
                            burnout,

                        borderWidth: 3,

                        tension: 0.3

                    }

                ]

            },

            options: {

                responsive: true,

                scales: {

                    y: {

                        min: 0,

                        max: 100

                    }

                }

            }

        }

    );


    new Chart(

        document.getElementById(
            "stressChart"
        ),

        {

            type: "line",

            data: {

                labels,

                datasets: [

                    {

                        label:
                            "Stress",

                        data:
                            stress,

                        borderWidth: 3

                    },

                    {

                        label:
                            "Motivation",

                        data:
                            motivation,

                        borderWidth: 3

                    }

                ]

            },

            options: {

                responsive: true,

                scales: {

                    y: {

                        min: 0,

                        max: 5

                    }

                }

            }

        }

    );


    new Chart(

        document.getElementById(
            "sleepStudyChart"
        ),

        {

            type: "bar",

            data: {

                labels,

                datasets: [

                    {

                        label:
                            "Sleep Hours",

                        data:
                            sleep

                    },

                    {

                        label:
                            "Study Hours",

                        data:
                            study

                    }

                ]

            },

            options: {

                responsive: true

            }

        }

    );


    const averageBurnout =
        burnout.reduce(
            (a, b) => a + b,
            0
        ) / burnout.length;


    document.getElementById(
        "analyticsSummary"
    ).textContent =
        `You have completed ${records.length}
        check-in(s). Your average burnout
        score is ${Math.round(averageBurnout)}/100.
        Your longest tracking streak is
        ${calculateLongestStreak(records)} day(s).`;

}


loadAnalytics();
