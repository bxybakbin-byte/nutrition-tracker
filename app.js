
// ==========================================
// NUTRITION TRACKER
// Food & Macro Tracking System
// ==========================================

const TARGETS = {
    calories: 2200,
    proteinMin: 155,
    proteinMax: 165,
    carbsMin: 180,
    carbsMax: 200,
    fatMin: 60,
    fatMax: 65
};

const MEALS = [
    { id: 1, name: "มื้อที่ 1" },
    { id: 2, name: "มื้อที่ 2" },
    { id: 3, name: "มื้อที่ 3" }
];

const STORAGE_KEY = "nutrition_tracker_data";

const today = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60000)
        .toISOString().slice(0, 10);
};

let currentDate = today();

function loadData() {
    try {
        return JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        ) || {};
    } catch {
        return {};
    }
}

let database = loadData();

function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(database)
    );
}

function getDayData() {
    if (!database[currentDate]) {
        database[currentDate] = {
            meals: { 1: [], 2: [], 3: [] }
        };
    }

    return database[currentDate];
}

function calculateTotals() {
    const meals = getDayData().meals;

    const total = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
    };

    Object.values(meals).forEach(items => {
        items.forEach(food => {
            total.calories += food.calories;
            total.protein += food.protein;
            total.carbs += food.carbs;
            total.fat += food.fat;
        });
    });

    return total;
}

function number(value) {
    return Number(value) || 0;
}

function format(value) {
    return Number(value.toFixed(1));
}

function addFood(mealId) {
    const name = prompt("ชื่ออาหาร:");

    if (!name || !name.trim()) return;

    const amount = prompt("ปริมาณ (กรัม / ml / ชิ้น):");

    if (!amount || !amount.trim()) return;

    const calories = prompt("พลังงาน (kcal):");
    if (calories === null || calories.trim() === "") return;

    const protein = prompt("โปรตีน (g):");
    if (protein === null || protein.trim() === "") return;

    const carbs = prompt("คาร์โบไฮเดรต (g):");
    if (carbs === null || carbs.trim() === "") return;

    const fat = prompt("ไขมัน (g):");
    if (fat === null || fat.trim() === "") return;

    const values = [
        calories, protein, carbs, fat
    ];

    if (values.some(v => v.trim() === "" ||
        !Number.isFinite(Number(v)) ||
        Number(v) < 0)) {
        alert("กรุณากรอกตัวเลขที่ถูกต้อง");
        return;
    }

    const food = {
        id: crypto.randomUUID(),
        name: name.trim(),
        amount: amount.trim(),
        calories: number(calories),
        protein: number(protein),
        carbs: number(carbs),
        fat: number(fat)
    };

    getDayData().meals[mealId].push(food);

    saveData();
    render();
}

function deleteFood(mealId, foodId) {
    if (!confirm("ต้องการลบรายการอาหารนี้หรือไม่?")) {
        return;
    }

    const meals = getDayData().meals;

    meals[mealId] = meals[mealId].filter(
        food => food.id !== foodId
    );

    saveData();
    render();
}

function progress(value, min, max) {
    const percent = Math.min(
        100,
        Math.max(0, value / max * 100)
    );

    return `
        <div class="progress-track">
            <div class="progress-fill"
                 style="width:${percent}%">
            </div>
        </div>
    `;
}

function render() {
    const app = document.getElementById("app");
    if (!app) return;

    const total = calculateTotals();
    const remaining = TARGETS.calories - total.calories;
    const meals = getDayData().meals;

    app.innerHTML = `
        <header class="header">
            <div>
                <h1>Nutrition Tracker</h1>
                <p>Personal Food & Macro Tracking</p>
            </div>
            <div class="date">
                <input type="date"
                    id="datePicker"
                    value="${currentDate}">
            </div>
        </header>

        <section class="summary-card">
            <p>พลังงานที่รับประทานแล้ว</p>
            <h2>${format(total.calories)}
                <small>/ ${TARGETS.calories} kcal</small>
            </h2>

            ${progress(total.calories, 0, TARGETS.calories)}

            <p>เหลือ ${format(remaining)} kcal</p>
        </section>

        <section class="nutrition-section">
            <h2>สารอาหารประจำวัน</h2>

            ${macroCard(
                "โปรตีน",
                total.protein,
                TARGETS.proteinMin,
                TARGETS.proteinMax,
                "g"
            )}

            ${macroCard(
                "คาร์โบไฮเดรต",
                total.carbs,
                TARGETS.carbsMin,
                TARGETS.carbsMax,
                "g"
            )}

            ${macroCard(
                "ไขมัน",
                total.fat,
                TARGETS.fatMin,
                TARGETS.fatMax,
                "g"
            )}
        </section>

        <section class="meals-section">
            <h2>บันทึกอาหารวันนี้</h2>

            ${MEALS.map(meal => `
                <div class="meal-card">
                    <h3>${meal.name}</h3>

                    ${meals[meal.id].map(food => `
                        <div class="food-item">
                            <div>
                                <strong>${escapeHTML(food.name)}</strong>
                                <p>${escapeHTML(food.amount)}</p>
                                <small>
                                    ${format(food.calories)} kcal |
                                    P ${format(food.protein)}g |
                                    C ${format(food.carbs)}g |
                                    F ${format(food.fat)}g
                                </small>
                            </div>

                            <button class="delete-btn"
                                data-delete="${meal.id}"
                                data-food="${food.id}">
                                ลบ
                            </button>
                        </div>
                    `).join("")}

                    <button class="add-btn"
                        data-add="${meal.id}">
                        + เพิ่มอาหาร
                    </button>
                </div>
            `).join("")}
        </section>

        <section class="daily-summary">
            <h2>สรุปวันนี้</h2>
            <p>พลังงาน: ${format(total.calories)} kcal</p>
            <p>โปรตีน: ${format(total.protein)} g</p>
            <p>คาร์โบไฮเดรต: ${format(total.carbs)} g</p>
            <p>ไขมัน: ${format(total.fat)} g</p>
        </section>
    `;

    document.getElementById("datePicker")
        .addEventListener("change", event => {
            if (!event.target.value) return;
            currentDate = event.target.value;
            render();
        });

    app.querySelectorAll("[data-add]").forEach(button => {
        button.addEventListener("click", () => {
            addFood(Number(button.dataset.add));
        });
    });

    app.querySelectorAll("[data-delete]").forEach(button => {
        button.addEventListener("click", () => {
            deleteFood(
                Number(button.dataset.delete),
                button.dataset.food
            );
        });
    });
}

function macroCard(name, value, min, max, unit) {
    return `
        <div class="macro-card">
            <div class="macro-heading">
                <strong>${name}</strong>
                <span>
                    ${format(value)} / ${min}-${max} ${unit}
                </span>
            </div>
            ${progress(value, 0, max)}
            <small>เหลือถึงเป้าหมายขั้นต่ำ:
                ${format(Math.max(0, min - value))} ${unit}
            </small>
        </div>
    `;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

render();
