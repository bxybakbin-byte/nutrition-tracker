
/* =====================================
   NUTRITION TRACKER
   FOOD DATABASE
===================================== */

// ฐานข้อมูลอาหารส่วนตัว
// ค่าสารอาหารทั้งหมดอ้างอิงต่อ 100 กรัม
// หรือ 100 มิลลิลิตร ตามหน่วยของอาหาร

window.FOOD_DATABASE = [];

// หมวดหมู่อาหาร
window.FOOD_CATEGORIES = [
    "ข้าวและแป้ง",
    "เนื้อสัตว์",
    "ไข่",
    "นมและผลิตภัณฑ์นม",
    "ผัก",
    "ผลไม้",
    "ถั่วและธัญพืช",
    "เครื่องดื่ม",
    "อาหารสำเร็จรูป",
    "อื่น ๆ"
];

// โครงสร้างข้อมูลอาหาร
window.FOOD_TEMPLATE = {
    id: "",
    name: "",
    category: "",
    unit: "g",

    // สารอาหารต่อ 100 หน่วย
    calories: null,
    protein: null,
    carbs: null,
    fat: null,

    // สารอาหารเพิ่มเติม
    fiber: null,
    sugar: null,
    sodium: null,
    saturatedFat: null,

    source: "",
    note: ""
};

// คำนวณสารอาหารตามปริมาณที่รับประทาน
window.calculateFoodNutrition = function(food, amount) {

    if (!food || !Number.isFinite(amount) || amount < 0) {
        throw new Error("ข้อมูลอาหารหรือปริมาณไม่ถูกต้อง");
    }

    const result = {};

    const nutrients = [
        "calories",
        "protein",
        "carbs",
        "fat",
        "fiber",
        "sugar",
        "sodium",
        "saturatedFat"
    ];

    nutrients.forEach(key => {
        const value = food[key];

        result[key] =
            value === null || value === undefined
                ? null
                : Number((value * amount / 100).toFixed(2));
    });

    return result;
};
