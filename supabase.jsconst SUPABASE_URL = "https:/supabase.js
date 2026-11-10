// =========================================
// MY FITNESS - SUPABASE CONFIGURATION
// =========================================

const SUPABASE_URL = "https://rjirogpjhclfueipnuym.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_4fkPSfvL6h-v85vSuc62Xg_M9s4oj2H";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

window.supabaseClient = supabaseClient;

// =========================================
// AUTHENTICATION
// =========================================

const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app");
const bottomNav = document.querySelector(".bottom-nav");

let currentUser = null;
let initialSyncComplete = false;
let writeQueue = Promise.resolve();

function showLogin(message = "") {
    authSection.style.display = "block";
    appSection.style.display = "none";

    if (bottomNav) {
        bottomNav.style.display = "none";
    }

    document.getElementById("auth-message").textContent = message;
}

function showApp() {
    authSection.style.display = "none";
    appSection.style.display = "";

    if (bottomNav) {
        bottomNav.style.display = "";
    }
}

// ซ่อนแอปก่อนตรวจสอบสถานะล็อกอิน
showLogin();

// =========================================
// SIGN IN
// =========================================

document.getElementById("login-form").addEventListener("submit", async event => {
    event.preventDefault();

    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;

    const message = document.getElementById("auth-message");
    message.textContent = "กำลังเข้าสู่ระบบ...";

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        message.textContent = error.message;
    }
});

// =========================================
// SIGN UP
// =========================================

document.getElementById("signup-btn").addEventListener("click", async () => {
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;

    const message = document.getElementById("auth-message");

    if (!email || !password) {
        message.textContent = "กรุณากรอกอีเมลและรหัสผ่าน";
        return;
    }

    message.textContent = "กำลังสมัครสมาชิก...";

    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
    });

    if (error) {
        message.textContent = error.message;
        return;
    }

    if (!data.session) {
        message.textContent = "สมัครสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี";
    } else {
        message.textContent = "สมัครสมาชิกสำเร็จ";
    }
});

// =========================================
// LOCAL DATABASE CHECK
// =========================================

function isLocalDatabaseEmpty(data) {
    return (
        Object.keys(data.days || {}).length === 0 &&
        (data.foods || []).length === 0 &&
        JSON.stringify(data.targets) === JSON.stringify({
            calories: 2200,
            proteinMin: 155,
            proteinMax: 165,
            carbsMin: 180,
            carbsMax: 200,
            fatMin: 60,
            fatMax: 65
        })
    );
}

// =========================================
// CLOUD DATABASE
// =========================================

async function uploadToCloud(user, data) {
    const { error } = await supabaseClient
        .from("user_data")
        .upsert({
            user_id: user.id,
            data: data,
            updated_at: new Date().toISOString()
        }, {
            onConflict: "user_id"
        });

    if (error) {
        throw error;
    }
}

async function loadCloudDatabase(user) {
    const { data, error } = await supabaseClient
        .from("user_data")
        .select("data, updated_at")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

// =========================================
// INITIAL DATA SYNC
// =========================================

async function initializeUser(user) {
    initialSyncComplete = false;
    currentUser = user;

    showLogin("กำลังโหลดข้อมูล...");

    try {
        const localData = window.getFitnessDatabase();

        const cloudRecord = await loadCloudDatabase(user);

        if (cloudRecord && cloudRecord.data) {

            if (isLocalDatabaseEmpty(localData)) {

                window.replaceFitnessDatabase(cloudRecord.data);

            } else {

                const useCloud = confirm(
                    "พบข้อมูลทั้งในเครื่องและ Cloud\n\n" +
                    "กด OK เพื่อใช้ข้อมูลจาก Cloud\n" +
                    "กด Cancel เพื่อใช้ข้อมูลในเครื่อง"
                );

                if (useCloud) {
                    window.replaceFitnessDatabase(cloudRecord.data);
                } else {
                    await uploadToCloud(user, localData);
                }
            }

        } else {

            await uploadToCloud(user, localData);

        }

        initialSyncComplete = true;
        showApp();
        renderPage();

    } catch (error) {

        initialSyncComplete = false;

        showLogin("เกิดข้อผิดพลาดในการโหลดข้อมูล: " + error.message);

        console.error("Supabase initialization error:", error);
    }
}

// =========================================
// AUTOMATIC CLOUD SAVE
// =========================================

window.syncToSupabase = function (data) {

    if (!currentUser || !initialSyncComplete) {
        return;
    }

    const snapshot = JSON.parse(JSON.stringify(data));

    writeQueue = writeQueue.then(async () => {

        if (!currentUser || !initialSyncComplete) {
            return;
        }

        try {
            await uploadToCloud(currentUser, snapshot);
        } catch (error) {
            console.error("Cloud sync error:", error);
        }

    });

    return writeQueue;
};

// =========================================
// AUTH STATE
// =========================================

async function handleAuthState(session) {

    if (!session) {
        currentUser = null;
        initialSyncComplete = false;
        showLogin();
        return;
    }

    if (
        currentUser &&
        currentUser.id === session.user.id &&
        initialSyncComplete
    ) {
        return;
    }

    await initializeUser(session.user);
}

supabaseClient.auth.onAuthStateChange((event, session) => {

    setTimeout(() => {
        handleAuthState(session);
    }, 0);

});

// =========================================
// CHECK EXISTING SESSION
// =========================================

supabaseClient.auth.getSession().then(({ data, error }) => {

    if (error) {
        showLogin("ไม่สามารถตรวจสอบบัญชีได้");
        return;
    }

    handleAuthState(data.session);

});
