
/* =========================================
   NUTRITION TRACKER - MODERN DASHBOARD
========================================= */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Thai:wght@400;500;600;700;800&display=swap');

:root {
    --background: #f5f7fb;
    --surface: #ffffff;
    --primary: #3678ed;
    --primary-light: #eaf1ff;
    --text: #172033;
    --muted: #8792a5;
    --border: #e9edf3;
    --green: #16a477;
    --red: #e45d67;
    --yellow: #e5a63b;
    --radius: 18px;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', 'Noto Sans Thai', sans-serif;
    background: var(--background);
    color: var(--text);
    min-height: 100vh;
    padding: 30px 20px;
}

#app {
    max-width: 760px;
    width: 100%;
    margin: auto;
}

/* HEADER */

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    margin-bottom: 25px;
    flex-wrap: wrap;
}

.header h1 {
    font-size: 27px;
    font-weight: 800;
    letter-spacing: -0.8px;
}

.header p {
    color: var(--muted);
    font-size: 13px;
    margin-top: 5px;
}

.date input {
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 11px;
    border-radius: 11px;
    font-family: inherit;
    color: var(--text);
}

/* SECTION */

section {
    margin-bottom: 22px;
}

section h2 {
    font-size: 17px;
    font-weight: 700;
    margin-bottom: 15px;
}

/* CALORIE SUMMARY */

.summary-card {
    background: linear-gradient(135deg, #3678ed, #5b9bfa);
    color: white;
    padding: 25px;
    border-radius: 22px;
    box-shadow: 0 8px 24px rgba(54, 120, 237, 0.16);
}

.summary-card > p:first-child {
    color: #e5edff;
    font-size: 13px;
}

.summary-card h2 {
    font-size: 38px;
    margin: 10px 0 18px;
    letter-spacing: -1px;
}

.summary-card h2 small {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0;
}

.summary-card > p:last-child {
    font-size: 13px;
    margin-top: 12px;
    color: white;
}

.progress-track {
    width: 100%;
    height: 9px;
    background: #e9edf3;
    border-radius: 20px;
    overflow: hidden;
    margin: 12px 0;
}

.summary-card .progress-track {
    background: rgba(255,255,255,0.25);
}

.progress-fill {
    height: 100%;
    background: var(--primary);
    border-radius: 20px;
    transition: width 0.3s ease;
}

.summary-card .progress-fill {
    background: white;
}

/* MACROS */

.macro-card {
    background: var(--surface);
    padding: 18px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 12px;
}

.macro-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    font-size: 14px;
}

.macro-heading span {
    font-size: 12px;
    color: var(--muted);
    text-align: right;
}

.macro-card small {
    color: var(--muted);
    font-size: 11px;
}

.macro-card .progress-fill {
    background: var(--green);
}

/* MEALS */

.meal-card {
    background: var(--surface);
    padding: 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    margin-bottom: 14px;
}

.meal-card h3 {
    font-size: 15px;
    margin-bottom: 14px;
}

.food-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 13px 0;
    border-top: 1px solid var(--border);
}

.food-item strong {
    font-size: 14px;
}

.food-item p {
    font-size: 12px;
    color: var(--muted);
    margin: 5px 0;
}

.food-item small {
    color: var(--muted);
    font-size: 11px;
    line-height: 1.8;
}

.add-btn {
    width: 100%;
    border: 1px dashed #a9c5f5;
    background: var(--primary-light);
    color: var(--primary);
    padding: 13px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 10px;
    font-family: inherit;
}

.add-btn:hover {
    background: #dce8ff;
}

.delete-btn {
    border: none;
    background: #fff0f0;
    color: var(--red);
    padding: 8px 12px;
    border-radius: 9px;
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
}

/* DAILY SUMMARY */

.daily-summary {
    background: var(--surface);
    padding: 22px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
}

.daily-summary p {
    display: flex;
    justify-content: space-between;
    padding: 11px 0;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
}

.daily-summary p:last-child {
    border-bottom: none;
}

/* BUTTON INTERACTION */

button {
    transition: 0.2s ease;
}

button:active {
    transform: scale(0.98);
}

input:focus {
    outline: 2px solid #b5ceff;
    outline-offset: 2px;
}

/* MOBILE */

@media (max-width: 600px) {

    body {
        padding: 18px 13px;
    }

    .header {
        align-items: flex-start;
    }

    .header h1 {
        font-size: 23px;
    }

    .date input {
        width: 145px;
        font-size: 11px;
    }

    .summary-card {
        padding: 21px;
    }

    .summary-card h2 {
        font-size: 32px;
    }

    .macro-card {
        padding: 15px;
    }

    .macro-heading {
        font-size: 13px;
    }

    .macro-heading span {
        font-size: 11px;
    }

    .meal-card {
        padding: 16px;
    }
}
