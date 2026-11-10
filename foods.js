
/* =====================================
   NUTRITION TRACKER
   FOOD DATABASE
===================================== */

const FOOD_STORAGE_KEY = "nutrition_food_database_v1";

// เริ่มต้นด้วยฐานข้อมูลว่าง
// เพิ่มข้อมูลอาหารพร้อมแหล่งอ้างอิงภายหลัง
let foodDatabase = [];

function loadFoodDatabase() {
    try {
        const saved = localStorage.getItem(FOOD_STORAGE_KEY);

        foodDatabase = saved ? JSON.parse(saved) : [];

        if (!Array.isArray(foodDatabase)) {
            foodDatabase = [];
        }
    } catch (error) {
        foodDatabase = [];
    }
}

function saveFoodDatabase() {
    localStorage.setItem(
        FOOD_STORAGE_KEY,
        JSON.stringify(foodDatabase)
    );
}

// เพิ่มอาหาร
function addFoodToDatabase(food) {
    const item = {
        id: crypto.randomUUID(),
        name: String(food.name).trim(),
        category: food.category || "อื่น ๆ",
        unit: food.unit || "100 กรัม",
        calories: Number(food.calories),
        protein: Number(food.protein),
        carbs: Number(food.carbs),
        fat: Number(food.fat),
        fiber: food.fiber === "" ? null : Number(food.fiber),
        sugar: food.sugar === "" ? null : Number(food.sugar),
        sodium: food.sodium === "" ? null : Number(food.sodium),
        source: String(food.source || "").trim(),
        createdAt: new Date().toISOString()
    };

    if (!item.name) {
        throw new Error("กรุณาระบุชื่ออาหาร");
    }

    const values = [
        item.calories,
        item.protein,
        item.carbs,
        item.fat
    ];

    if (values.some(v => !Number.isFinite(v) || v < 0)) {
        throw new Error("ข้อมูลสารอาหารไม่ถูกต้อง");
    }

    foodDatabase.push(item);
    saveFoodDatabase();

    return item;
}

// แก้ไขอาหาร
function updateFoodInDatabase(id, changes) {
    const index = foodDatabase.findIndex(
        food => food.id === id
    );

    if (index === -1) {
        throw new Error("ไม่พบรายการอาหาร");
    }

    const updated = {
        ...foodDatabase[index],
        ...changes,
        id
    };

    const values = [
        updated.calories,
        updated.protein,
        updated.carbs,
        updated.fat
    ];

    if (
        !updated.name ||
        values.some(v => !Number.isFinite(Number(v)) || Number(v) < 0)
    ) {
        throw new Error("ข้อมูลอาหารไม่ถูกต้อง");
    }

    foodDatabase[index] = updated;
    saveFoodDatabase();

    return updated;
}

// ลบอาหาร
function deleteFoodFromDatabase(id) {
    foodDatabase = foodDatabase.filter(
        food => food.id !== id
    );

    saveFoodDatabase();
}

// ค้นหาอาหาร
function searchFoodDatabase(keyword) {
    const query = String(keyword || "").trim().toLowerCase();

    return foodDatabase.filter(food =>
        food.name.toLowerCase().includes(query)
    );
}

// คำนวณสารอาหารตามปริมาณ
function calculateFoodNutrition(food, quantity, baseQuantity = 100) {
    const multiplier = quantity / baseQuantity;

    return {
        calories: food.calories * multiplier,
        protein: food.protein * multiplier,
        carbs: food.carbs * multiplier,
        fat: food.fat * multiplier,
        fiber: food.fiber === null ? null : food.fiber * multiplier,
        sugar: food.sugar === null ? null : food.sugar * multiplier,
        sodium: food.sodium === null ? null : food.sodium * multiplier
    };
}

loadFoodDatabase();
