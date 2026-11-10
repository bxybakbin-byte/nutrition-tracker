
/* =========================================
   NUTRITION TRACKER 2.0
   Main Application
========================================= */

const DB_KEY = "nutrition_tracker_v2";

const DEFAULT_TARGETS = {
    calories: 2200,
    proteinMin: 155,
    proteinMax: 165,
    carbsMin: 180,
    carbsMax: 200,
    fatMin: 60,
    fatMax: 65
};

const WORKOUT_PROGRAMS = {
    chest: {
        name: "CHEST DAY",
        exercises: ["Bench Press", "Incline Dumbbell Press", "Chest Fly", "Machine Chest Press", "Push Up"]
    },
    back: {
        name: "BACK DAY",
        exercises: ["Lat Pulldown", "Seated Cable Row", "Barbell Row", "Face Pull", "Deadlift"]
    },
    shoulder: {
        name: "SHOULDER DAY",
        exercises: ["Shoulder Press", "Lateral Raise", "Front Raise", "Rear Delt Fly", "Shrugs"]
    },
    arm: {
        name: "ARM DAY",
        exercises: ["Barbell Curl", "Hammer Curl", "Triceps Pushdown", "Overhead Extension", "Preacher Curl"]
    },
    leg: {
        name: "LEG DAY",
        exercises: ["Squat", "Leg Press", "Leg Extension", "Leg Curl", "Calf Raises"]
    }
};

const $ = id => document.getElementById(id);

const today = () => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 10);
};

function emptyDay() {
    return {
        meals: { 1: [], 2: [], 3: [] },
        workouts: [],
        cardio: [],
        water: 0,
        weight: null
    };
}

function loadDatabase() {
    try {
        const saved = JSON.parse(localStorage.getItem(DB_KEY));
        if (!saved || typeof saved !== "object") throw new Error();
        return saved;
    } catch {
        return {
            days: {},
            foods: [],
            targets: { ...DEFAULT_TARGETS }
        };
    }
}

let database = loadDatabase();
let selectedDate = today();
let currentPage = "dashboard";
let selectedWorkout = "leg";

function saveDatabase() {
    localStorage.setItem(DB_KEY, JSON.stringify(database));
}
// =========================================
// SUPABASE DATABASE BRIDGE
// =========================================

window.getFitnessDatabase = function () {
    return database;
};

window.replaceFitnessDatabase = function (newDatabase) {
    if (
        !newDatabase ||
        typeof newDatabase !== "object" ||
        !newDatabase.days ||
        !Array.isArray(newDatabase.foods) ||
        !newDatabase.targets
    ) {
        throw new Error("Invalid database format");
    }

    database = newDatabase;

    localStorage.setItem(DB_KEY, JSON.stringify(database));

    renderPage();
};

function getDay(date = selectedDate) {
    if (!database.days[date]) {
        database.days[date] = emptyDay();
    }

    const day = database.days[date];

    day.meals ||= { 1: [], 2: [], 3: [] };
    day.workouts ||= [];
    day.cardio ||= [];
    day.water ??= 0;
    day.weight ??= null;

    return day;
}

function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[c]);
}

function fmt(value) {
    return Number(value || 0).toFixed(1).replace(/\.0$/, "");
}

function totals() {
    const result = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        saturatedFat: 0
    };

    Object.values(getDay().meals).flat().forEach(food => {
        Object.keys(result).forEach(key => {
            result[key] += Number(food[key] || 0);
        });
    });

    return result;
}

function progressBar(value, target) {
    const percent = target > 0
        ? Math.min(100, Math.max(0, value / target * 100))
        : 0;

    return `
        <div class="progress-track">
            <div class="progress-fill"
                style="width:${percent}%"></div>
        </div>`;
}

function card(title, content) {
    return `
        <div class="meal-card">
            <h3>${title}</h3>
            ${content}
        </div>`;
}

function navigate(page) {
    currentPage = page;

    document.querySelectorAll(".page").forEach(el => {
        el.classList.remove("active");
    });

    const target = $(`${page}-page`);
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.page === page);
    });

    renderPage();
}

function renderPage() {
    const day = getDay();

    if ($("today-date")) {
        $("today-date").innerText = selectedDate;
    }

    if (currentPage === "dashboard") renderDashboard();
    if (currentPage === "nutrition") renderNutrition();
    if (currentPage === "foods") renderFoods();
    if (currentPage === "workout") renderWorkout();
    if (currentPage === "cardio") renderCardio();
    if (currentPage === "progress") renderProgress();
    if (currentPage === "weight") renderWeight();
    if (currentPage === "water") renderWater();
    if (currentPage === "settings") renderSettings();
}

// =========================================
// DASHBOARD
// =========================================

function renderDashboard() {
    const t = totals();
    const target = database.targets;

    $("dashboard").innerHTML = `
        <h2>Today's Overview</h2>

        ${card("พลังงานวันนี้", `
            <h2>${fmt(t.calories)} / ${target.calories} kcal</h2>
            ${progressBar(t.calories, target.calories)}
            <p>เหลือ ${fmt(target.calories - t.calories)} kcal</p>
        `)}

        ${card("สารอาหาร", `
            <p>โปรตีน ${fmt(t.protein)} / ${target.proteinMin}-${target.proteinMax} g</p>
            ${progressBar(t.protein, target.proteinMax)}
            <p>คาร์โบไฮเดรต ${fmt(t.carbs)} / ${target.carbsMin}-${target.carbsMax} g</p>
            ${progressBar(t.carbs, target.carbsMax)}
            <p>ไขมัน ${fmt(t.fat)} / ${target.fatMin}-${target.fatMax} g</p>
            ${progressBar(t.fat, target.fatMax)}
        `)}

        ${card("การออกกำลังกาย", `
            <p>จำนวนรายการฝึก: ${getDay().workouts.length}</p>
            <p>ระยะทาง Cardio: ${fmt(getDay().cardio.reduce((s,x)=>s+x.distance,0))} km</p>
            <p>แคลอรีจาก Cardio: ${fmt(getDay().cardio.reduce((s,x)=>s+x.calories,0))} kcal</p>
            <button data-page="workout">บันทึก Workout</button>
            <button data-page="cardio">บันทึก Cardio</button>
        `)}

        ${card("สุขภาพวันนี้", `
            <p>น้ำดื่ม ${fmt(getDay().water)} ml</p>
            <p>น้ำหนัก ${getDay().weight ?? "-"} kg</p>
            <button data-page="water">บันทึกน้ำดื่ม</button>
            <button data-page="weight">บันทึกน้ำหนัก</button>
        `)}

        <button data-page="nutrition">ไปบันทึกอาหาร</button>
        <button data-page="progress">ดูพัฒนาการ</button>
    `;
}

// =========================================
// NUTRITION
// =========================================

function renderNutrition() {
    const meals = getDay().meals;

    $("nutrition").innerHTML = `
        <h2>บันทึกอาหาร</h2>
        ${[1,2,3].map(id => `
            ${card("มื้อที่ " + id, `
                ${meals[id].map(food => `
                    <div class="food-item">
                        <div>
                            <strong>${safe(food.name)}</strong>
                            <p>${food.amount} ${safe(food.unit)}</p>
                            <small>
                                ${fmt(food.calories)} kcal |
                                P ${fmt(food.protein)}g |
                                C ${fmt(food.carbs)}g |
                                F ${fmt(food.fat)}g
                            </small>
                        </div>
                        <button data-delete-food="${food.id}"
                            data-meal="${id}">ลบ</button>
                    </div>
                `).join("")}
                <button data-add-meal="${id}">+ เพิ่มอาหารจากฐานข้อมูล</button>
            `)}
        `).join("")}
        ${card("สรุปสารอาหาร", `
            <p>พลังงาน ${fmt(totals().calories)} kcal</p>
            <p>โปรตีน ${fmt(totals().protein)} g</p>
            <p>คาร์โบไฮเดรต ${fmt(totals().carbs)} g</p>
            <p>ไขมัน ${fmt(totals().fat)} g</p>
        `)}
    `;
}

// =========================================
// FOOD DATABASE
// =========================================

function renderFoods() {
    const foods = database.foods || [];

    $("foods").innerHTML = `
        <h2>ฐานข้อมูลอาหาร</h2>
        <form id="food-form">
            <label>ชื่ออาหาร</label>
            <input name="name" required placeholder="เช่น หมูสันนอก">

            <label>หมวดหมู่</label>
            <select name="category">
                ${(window.FOOD_CATEGORIES || []).map(c =>
                    `<option value="${safe(c)}">${safe(c)}</option>`
                ).join("")}
            </select>

            <label>หน่วยอ้างอิง</label>
            <select name="unit">
                <option value="g">กรัม (g)</option>
                <option value="ml">มิลลิลิตร (ml)</option>
            </select>

            <label>พลังงาน (kcal / 100 หน่วย)</label>
            <input name="calories" type="number" min="0" step="any" required>

            <label>โปรตีน (g / 100 หน่วย)</label>
            <input name="protein" type="number" min="0" step="any" required>

            <label>คาร์โบไฮเดรต (g / 100 หน่วย)</label>
            <input name="carbs" type="number" min="0" step="any" required>

            <label>ไขมัน (g / 100 หน่วย)</label>
            <input name="fat" type="number" min="0" step="any" required>

            <label>ใยอาหาร (g)</label>
            <input name="fiber" type="number" min="0" step="any">

            <label>น้ำตาล (g)</label>
            <input name="sugar" type="number" min="0" step="any">

            <label>โซเดียม (mg)</label>
            <input name="sodium" type="number" min="0" step="any">

            <label>ไขมันอิ่มตัว (g)</label>
            <input name="saturatedFat" type="number" min="0" step="any">

            <label>แหล่งข้อมูล / ฉลาก</label>
            <input name="source" placeholder="เช่น ฉลากสินค้า">

            <button type="submit">บันทึกอาหาร</button>
        </form>

        <h3>อาหารของฉัน (${foods.length})</h3>

        ${foods.map(f => `
            <div class="food-item">
                <div>
                    <strong>${safe(f.name)}</strong>
                    <p>${safe(f.category)}</p>
                    <small>
                        ${fmt(f.calories)} kcal |
                        P ${fmt(f.protein)}g |
                        C ${fmt(f.carbs)}g |
                        F ${fmt(f.fat)}g
                    </small>
                </div>
                <button data-delete-database-food="${f.id}">ลบ</button>
            </div>
        `).join("")}
    `;
}

function addFoodToMeal(mealId) {
    const foods = database.foods || [];

    if (!foods.length) {
        alert("ยังไม่มีอาหาร กรุณาเพิ่มอาหารในฐานข้อมูลก่อน");
        navigate("foods");
        return;
    }

    const options = foods.map((f,i) => `${i+1}. ${f.name}`).join("\n");
    const choice = prompt("เลือกหมายเลขอาหาร:\n" + options);

    if (choice === null) return;

    const food = foods[Number(choice)-1];

    if (!food) {
        alert("ไม่พบอาหารที่เลือก");
        return;
    }

    const amountText = prompt(`ปริมาณ (${food.unit}):`);
    if (amountText === null) return;

    const amount = Number(amountText);

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("กรุณากรอกปริมาณที่ถูกต้อง");
        return;
    }

    const nutrition = window.calculateFoodNutrition(food, amount);

    getDay().meals[mealId].push({
        id: crypto.randomUUID(),
        name: food.name,
        amount,
        unit: food.unit,
        ...nutrition
    });

    saveDatabase();
    renderPage();
}

// =========================================
// WORKOUT
// =========================================

function renderWorkout() {
    const program = WORKOUT_PROGRAMS[selectedWorkout];
    const exercises = program.exercises;

    $("workout").innerHTML = `
        <h2>Workout Tracker</h2>

        <label>เลือกวันฝึก</label>
        <select id="workout-type">
            ${Object.entries(WORKOUT_PROGRAMS).map(([key,value]) =>
                `<option value="${key}" ${key===selectedWorkout?"selected":""}>
                    ${value.name}
                </option>`
            ).join("")}
        </select>

        <form id="workout-form">
            ${exercises.map((name,i) => `
                <div class="meal-card">
                    <h3>${i+1}. ${safe(name)}</h3>

                    <label>จำนวนเซต</label>
                    <input name="sets-${i}" type="number" min="1" required>

                    <label>จำนวนครั้งต่อเซต</label>
                    <input name="reps-${i}" type="number" min="1" required>

                    <label>น้ำหนัก (kg)</label>
                    <input name="weight-${i}" type="number" min="0" step="any" required>
                </div>
            `).join("")}

            <label>หมายเหตุ</label>
            <input name="note" placeholder="ความรู้สึก / ความหนัก">

            <button type="submit">บันทึกการฝึก</button>
        </form>

        <h3>ประวัติการฝึกวันนี้</h3>
        ${getDay().workouts.map(w => `
            <div class="food-item">
                <div>
                    <strong>${safe(w.program)}</strong>
                    <p>${w.exercises.length} ท่า</p>
                </div>
                <button data-delete-workout="${w.id}">ลบ</button>
            </div>
        `).join("")}
    `;
}

// =========================================
// CARDIO
// =========================================

function renderCardio() {
    $("cardio").innerHTML = `
        <h2>Cardio Tracker</h2>

        <form id="cardio-form">
            <label>ประเภท</label>
            <select name="type">
                <option>Running</option>
                <option>Walking</option>
                <option>Cycling</option>
                <option>Treadmill</option>
                <option>Other</option>
            </select>

            <label>ระยะทาง (km)</label>
            <input name="distance" type="number" min="0" step="any" required>

            <label>ระยะเวลา (นาที)</label>
            <input name="duration" type="number" min="0" step="any" required>

            <label>แคลอรีที่เผาผลาญ (kcal)</label>
            <input name="calories" type="number" min="0" step="any" required>

            <label>แหล่งข้อมูลแคลอรี</label>
            <input name="source" placeholder="เช่น นาฬิกา / ลู่วิ่ง / ประเมิน">

            <button type="submit">บันทึก Cardio</button>
        </form>

        <h3>ประวัติวันนี้</h3>
        ${getDay().cardio.map(c => `
            <div class="food-item">
                <div>
                    <strong>${safe(c.type)}</strong>
                    <p>${c.distance} km · ${c.duration} นาที</p>
                    <small>${c.calories} kcal</small>
                </div>
                <button data-delete-cardio="${c.id}">ลบ</button>
            </div>
        `).join("")}
    `;
}

// =========================================
// WEIGHT
// =========================================

function renderWeight() {
    const records = Object.entries(database.days)
        .filter(([date,day]) => day.weight !== null && day.weight !== undefined)
        .sort(([a],[b]) => a.localeCompare(b));

    $("weight").innerHTML = `
        <h2>Weight Tracker</h2>

        <form id="weight-form">
            <label>น้ำหนักตัว (kg)</label>
            <input name="weight" type="number" min="0" step="0.1" required>
            <button type="submit">บันทึกน้ำหนัก</button>
        </form>

        <h3>ประวัติน้ำหนัก</h3>
        ${records.map(([date,day]) => `
            <div class="food-item">
                <span>${date}</span>
                <strong>${day.weight} kg</strong>
            </div>
        `).join("")}
    `;
}

// =========================================
// WATER
// =========================================

function renderWater() {
    $("water").innerHTML = `
        <h2>Water Tracker</h2>
        <h1>${fmt(getDay().water)} ml</h1>

        <button data-water="250">+250 ml</button>
        <button data-water="500">+500 ml</button>
        <button data-water="1000">+1000 ml</button>

        <form id="water-form">
            <label>เพิ่มปริมาณน้ำเอง (ml)</label>
            <input name="amount" type="number" min="1" required>
            <button type="submit">บันทึกน้ำ</button>
        </form>
    `;
}

// =========================================
// PROGRESS
// =========================================

function renderProgress() {
    const dates = Object.keys(database.days).sort();

    const rows = dates.map(date => {
        const day = database.days[date];
        const foodTotal = Object.values(day.meals || {}).flat()
            .reduce((s,f) => s + Number(f.calories || 0), 0);

        const cardioTotal = (day.cardio || [])
            .reduce((s,c) => s + Number(c.calories || 0), 0);

        return { date, foodTotal, cardioTotal, weight: day.weight };
    });

    $("progress").innerHTML = `
        <h2>Progress History</h2>

        <p>ข้อมูลรายวันที่บันทึกไว้</p>

        ${rows.reverse().map(r => `
            <div class="meal-card">
                <strong>${r.date}</strong>
                <p>อาหาร: ${fmt(r.foodTotal)} kcal</p>
                <p>Cardio: ${fmt(r.cardioTotal)} kcal</p>
                <p>น้ำหนัก: ${r.weight ?? "-"} kg</p>
            </div>
        `).join("")}

        <button id="export-data">ส่งออกข้อมูล JSON</button>
        <button id="import-data">นำเข้าข้อมูล JSON</button>
        <input id="import-file" type="file" accept=".json" hidden>
    `;
}

// =========================================
// SETTINGS
// =========================================

function renderSettings() {
    const t = database.targets;

    $("settings").innerHTML = `
        <h2>ตั้งค่าเป้าหมาย</h2>

        <form id="settings-form">
            <label>แคลอรี (kcal)</label>
            <input name="calories" type="number" value="${t.calories}" required>

            <label>โปรตีนขั้นต่ำ (g)</label>
            <input name="proteinMin" type="number" value="${t.proteinMin}" required>

            <label>โปรตีนสูงสุด (g)</label>
            <input name="proteinMax" type="number" value="${t.proteinMax}" required>

            <label>คาร์โบไฮเดรตขั้นต่ำ (g)</label>
            <input name="carbsMin" type="number" value="${t.carbsMin}" required>

            <label>คาร์โบไฮเดรตสูงสุด (g)</label>
            <input name="carbsMax" type="number" value="${t.carbsMax}" required>

            <label>ไขมันขั้นต่ำ (g)</label>
            <input name="fatMin" type="number" value="${t.fatMin}" required>

            <label>ไขมันสูงสุด (g)</label>
            <input name="fatMax" type="number" value="${t.fatMax}" required>

            <button type="submit">บันทึกเป้าหมาย</button>
        </form>
    `;
}

// =========================================
// EVENT HANDLERS
// =========================================

document.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.page) {
        navigate(button.dataset.page);
    }

    if (button.dataset.addMeal) {
        addFoodToMeal(Number(button.dataset.addMeal));
    }

    if (button.dataset.deleteFood) {
        const meal = button.dataset.meal;
        getDay().meals[meal] = getDay().meals[meal]
            .filter(f => f.id !== button.dataset.deleteFood);
        saveDatabase();
        renderPage();
    }

    if (button.dataset.deleteDatabaseFood) {
        if (!confirm("ลบอาหารออกจากฐานข้อมูล?")) return;
        database.foods = database.foods.filter(
            f => f.id !== button.dataset.deleteDatabaseFood
        );
        saveDatabase();
        renderPage();
    }

    if (button.dataset.deleteWorkout) {
        getDay().workouts = getDay().workouts.filter(
            w => w.id !== button.dataset.deleteWorkout
        );
        saveDatabase();
        renderPage();
    }

    if (button.dataset.deleteCardio) {
        getDay().cardio = getDay().cardio.filter(
            c => c.id !== button.dataset.deleteCardio
        );
        saveDatabase();
        renderPage();
    }

    if (button.dataset.water) {
        getDay().water += Number(button.dataset.water);
        saveDatabase();
        renderPage();
    }
});

document.addEventListener("change", event => {
    if (event.target.id === "workout-type") {
        selectedWorkout = event.target.value;
        renderWorkout();
    }
});

document.addEventListener("submit", event => {
    const form = event.target;
    event.preventDefault();

    const data = new FormData(form);

    if (form.id === "food-form") {
        const food = {
            id: crypto.randomUUID(),
            name: data.get("name").trim(),
            category: data.get("category"),
            unit: data.get("unit"),
            calories: Number(data.get("calories")),
            protein: Number(data.get("protein")),
            carbs: Number(data.get("carbs")),
            fat: Number(data.get("fat")),
            fiber: data.get("fiber") === "" ? null : Number(data.get("fiber")),
            sugar: data.get("sugar") === "" ? null : Number(data.get("sugar")),
            sodium: data.get("sodium") === "" ? null : Number(data.get("sodium")),
            saturatedFat: data.get("saturatedFat") === "" ? null : Number(data.get("saturatedFat")),
            source: data.get("source").trim()
        };

        if (Object.entries(food).some(([key,value]) =>
            ["calories","protein","carbs","fat"].includes(key) &&
            (!Number.isFinite(value) || value < 0)
        )) {
            alert("ตรวจสอบค่าสารอาหารอีกครั้ง");
            return;
        }

        database.foods.push(food);
        saveDatabase();
        renderFoods();
    }

    if (form.id === "workout-form") {
        const program = WORKOUT_PROGRAMS[selectedWorkout];

        const exercises = program.exercises.map((name,i) => ({
            name,
            sets: Number(data.get(`sets-${i}`)),
            reps: Number(data.get(`reps-${i}`)),
            weight: Number(data.get(`weight-${i}`))
        }));

        if (exercises.some(e =>
            !Number.isFinite(e.sets) || e.sets <= 0 ||
            !Number.isFinite(e.reps) || e.reps <= 0 ||
            !Number.isFinite(e.weight) || e.weight < 0
        )) {
            alert("กรุณาตรวจสอบข้อมูลการฝึก");
            return;
        }

        getDay().workouts.push({
            id: crypto.randomUUID(),
            program: program.name,
            exercises,
            note: data.get("note"),
            date: selectedDate
        });

        saveDatabase();
        renderWorkout();
    }

    if (form.id === "cardio-form") {
        const cardio = {
            id: crypto.randomUUID(),
            type: data.get("type"),
            distance: Number(data.get("distance")),
            duration: Number(data.get("duration")),
            calories: Number(data.get("calories")),
            source: data.get("source")
        };

        if ([cardio.distance,cardio.duration,cardio.calories]
            .some(v => !Number.isFinite(v) || v < 0)) {
            alert("กรุณากรอกตัวเลขให้ถูกต้อง");
            return;
        }

        getDay().cardio.push(cardio);
        saveDatabase();
        renderCardio();
    }

    if (form.id === "weight-form") {
        const weight = Number(data.get("weight"));

        if (!Number.isFinite(weight) || weight <= 0) {
            alert("น้ำหนักไม่ถูกต้อง");
            return;
        }

        getDay().weight = weight;
        saveDatabase();
        renderWeight();
    }

    if (form.id === "water-form") {
        const amount = Number(data.get("amount"));

        if (!Number.isFinite(amount) || amount <= 0) {
            alert("ปริมาณน้ำไม่ถูกต้อง");
            return;
        }

        getDay().water += amount;
        saveDatabase();
        renderWater();
    }

    if (form.id === "settings-form") {
        const keys = Object.keys(DEFAULT_TARGETS);

        const updated = {};
        keys.forEach(key => {
            updated[key] = Number(data.get(key));
        });

        if (Object.values(updated).some(v => !Number.isFinite(v) || v <= 0) ||
            updated.proteinMin > updated.proteinMax ||
            updated.carbsMin > updated.carbsMax ||
            updated.fatMin > updated.fatMax) {
            alert("ตรวจสอบเป้าหมายอีกครั้ง");
            return;
        }

        database.targets = updated;
        saveDatabase();
        alert("บันทึกเป้าหมายแล้ว");
        renderSettings();
    }
});

// =========================================
// DATA EXPORT / IMPORT
// =========================================

document.addEventListener("click", event => {
    if (event.target.id === "export-data") {
        const blob = new Blob(
            [JSON.stringify(database, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "nutrition-backup.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    if (event.target.id === "import-data") {
        $("import-file").click();
    }
});

document.addEventListener("change", event => {
    if (event.target.id !== "import-file") return;

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const imported = JSON.parse(reader.result);

            if (!imported.days || !imported.foods || !imported.targets) {
                throw new Error("รูปแบบไฟล์ไม่ถูกต้อง");
            }

            if (!confirm("การนำเข้าจะเขียนทับข้อมูลปัจจุบัน ต้องการดำเนินการหรือไม่?")) {
                return;
            }

            database = imported;
            saveDatabase();
            renderPage();
            alert("นำเข้าข้อมูลสำเร็จ");
        } catch (error) {
            alert("ไม่สามารถนำเข้าไฟล์นี้ได้");
        }
    };

    reader.readAsText(file);
});

// =========================================
// INITIALIZE
// =========================================

document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => {
        navigate(button.dataset.page);
    });
});

if (database.targets === undefined) {
    database.targets = { ...DEFAULT_TARGETS };
}

database.foods ||= [];
saveDatabase();

navigate("dashboard");
