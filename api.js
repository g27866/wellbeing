// --- Static Data ---
const TREATMENTS = [
  { category: "震波治療", name: "患部震波", duration: 29 },
  { category: "震波治療", name: "性功能震波", duration: 29 },
  { category: "PRP治療", name: "二代PRP", duration: 59 },
  { category: "PRP治療", name: "訊聯PRP PLUS", duration: 29 },
  { category: "外泌體", name: "生髮", duration: 29 },
  { category: "外泌體", name: "保養", duration: 59 },
  { category: "外泌體", name: "訊聯幹細胞", duration: 59 },
  { category: "點滴療程", name: "記憶力強化", duration: 59 },
  { category: "點滴療程", name: "血液循環", duration: 59 },
  { category: "點滴療程", name: "美白抗氧", duration: 59 },
  { category: "點滴療程", name: "保肝排毒", duration: 59 },
  { category: "點滴療程", name: "抗老逆齡", duration: 59 },
  { category: "點滴療程", name: "燃脂增肌", duration: 59 },
  { category: "點滴療程", name: "好眠好心情", duration: 59 },
  { category: "點滴療程", name: "各類治療點滴", duration: 59 },
  { category: "修復式醫美", name: "體重控制瘦瘦針", duration: 14 },
  { category: "修復式醫美", name: "肉毒桿菌注射", duration: 29 },
  { category: "疫苗注射", name: "HPV", duration: 9 },
  { category: "疫苗注射", name: "帶狀疱疹", duration: 9 },
  { category: "健康檢查", name: "自律神經", duration: 14 },
  { category: "健康檢查", name: "心電圖", duration: 29 },
  { category: "健康檢查", name: "頸動脈超音波", duration: 29 },
  { category: "健康檢查", name: "呼吸中止居家檢測", duration: 9 },
  { category: "健康檢查", name: "其它", duration: 9 },
];

// --- Mock Data ---
const MOCK_BUSY_TIMES = [
    { start: "2025-06-05T10:00:00.000Z", end: "2025-06-05T11:00:00.000Z" },
    { start: "2025-06-05T13:30:00.000Z", end: "2025-06-05T14:30:00.000Z" },
    { start: "2025-06-06T11:30:00.000Z", end: "2025-06-06T12:30:00.000Z" }
];


// --- API URLs ---
const BINDING_CHECK_API = "https://us-central1-wellbeing-369fb.cloudfunctions.net/checkBinding";
const BINDING_SUBMIT_API = "https://us-central1-wellbeing-369fb.cloudfunctions.net/submitBinding";
const BUSY_TIMES_API = "https://getbusytimes-jwft5nijvq-uc.a.run.app";
const CREATE_RESERVATION_API = "https://createreservation-jwft5nijvq-uc.a.run.app";

// --- API Functions ---

async function checkBindingApi(uid) {
    console.log("API: Checking binding for UID:", uid);
    try {
        const response = await fetch(BINDING_CHECK_API, {
            method: 'GET',
            headers: {
                'x-purpose': 'customer_query',
                'X-Line-Uid': uid
            }
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("API Error (checkBindingApi):", error);
        throw error;
    }
}

async function submitBindingApi(phone, email, uid) {
    console.log("API: Submitting binding:", { phone, email, uid });
    try {
        const response = await fetch(BINDING_SUBMIT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-purpose': 'customer_check',
            },
            body: JSON.stringify({
                phone: phone,
                email: email,
                lineUid: uid
            })
        });
         if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("API Error (submitBindingApi):", error);
        throw error;
    }
}

// =======================================================
//    fetchBusyTimesApi 函數(查詢google clander)
// =======================================================
async function fetchBusyTimesApi(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `<span class="math-inline">\{year\}\-</span>{month}-${day}`;

    console.log("API: Fetching busy times for:", dateString);

    try {
        const response = await fetch(BUSY_TIMES_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // No need for 'x-purpose' anymore unless you add it in Firebase Function
            },
            body: JSON.stringify({ "date": dateString })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json(); // Expecting an array directly

        // Ensure data is an array and convert strings to Dates
        if (Array.isArray(data)) {
             return data.map(busy => ({
                start: new Date(busy.start),
                end: new Date(busy.end)
            })).filter(busy => !isNaN(busy.start.getTime()) && !isNaN(busy.end.getTime()));
        } else {
             console.warn("Busy Times API returned non-array. Assuming no busy times.", data);
             return [];
        }

    } catch (error) {
        console.error("API Error (fetchBusyTimesApi):", error);
        return []; // Return empty on error
    }
}
// =======================================================
//   getBusyTimes 函數結束
// =======================================================


async function submitReservationApi(payload) {
    console.log("API: Submitting Reservation:", payload);
    try {
        const response = await fetch(CREATE_RESERVATION_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // No need for 'x-purpose' anymore
            },
            body: JSON.stringify(payload) // Payload is already in the correct format
        });

        const result = await response.json(); // Expect JSON response

        if (!response.ok || !result.success) {
             throw new Error(result.message || `API Error: ${response.statusText}`);
        }

        return { success: true, message: result.message || "Reservation created." };

    } catch (error) {
        console.error("API Error (submitReservationApi):", error);
        throw error; // Rethrow to be caught by handleReservationSubmit
    }
}
