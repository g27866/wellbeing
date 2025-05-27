// --- Static Data ---
const TREATMENTS = [
    { category: "震波治療", name: "受傷震波治療", duration: 60 },
    { category: "震波治療", name: "男性功能震波治療", duration: 60 },
    { category: "PRP治療", name: "二代PRP治療", duration: 60 },
    { category: "外泌體", name: "外泌體保養", duration: 60 },
    { category: "外泌體", name: "外泌體生髮", duration: 60 },
    { category: "外泌體", name: "訊聯血小板外泌體", duration: 60 },
    { category: "外泌體", name: "訊聯脂肪幹細胞外泌體", duration: 60 },
    { category: "修復式醫美", name: "瘦瘦針", duration: 30 },
    { category: "修復式醫美", name: "肉毒桿菌注射", duration: 30 },
    { category: "疫苗注射", name: "HPV疫苗注射", duration: 30 },
    { category: "疫苗注射", name: "帶狀泡疹疫苗注射", duration: 30 },
    { category: "點滴療程", name: "美白淡斑", duration: 30 },
    { category: "點滴療程", name: "增強血液循環", duration: 30 },
    { category: "點滴療程", name: "強肝解毒", duration: 30 },
    { category: "點滴療程", name: "記憶力強化", duration: 30 },
    { category: "點滴療程", name: "提升睡眠品質", duration: 30 },
    { category: "點滴療程", name: "燃脂增肌", duration: 30 },
    { category: "健康檢查", name: "自律神經檢測", duration: 60 },
    { category: "健康檢查", name: "心電圖檢查", duration: 60 },
    { category: "健康檢查", name: "頸動脈超音波檢查", duration: 60 },
    { category: "健康檢查", name: "睡眠呼吸中止症居家檢測", duration: 120 },
    { category: "健康檢查", name: "功能醫學檢測", duration: 60 },
    { category: "健康檢查", name: "失智症基因檢測", duration: 60 },
    { category: "健康檢查", name: "過敏原檢測", duration: 60 },
    { category: "健康檢查", name: "癌症腫瘤指標檢測", duration: 60 },
    { category: "健康檢查", name: "CTC循環腫瘤細胞檢測", duration: 60 },
    { category: "健康檢查", name: "EPC內皮前趨細胞檢測", duration: 60 },
    { category: "健康檢查", name: "先知先覺基因風險評估", duration: 60 },
    { category: "健康檢查", name: "美塔力生理年齡檢測", duration: 60 },
    { category: "健康檢查", name: "各項抽血檢測", duration: 60 },
];

// --- Mock Data ---
// MOCK_BUSY_TIMES 仍然保留，以防真實 API 失敗時可作為備用或測試
const MOCK_BUSY_TIMES = [
    { start: "2025-06-05T10:00:00.000Z", end: "2025-06-05T11:00:00.000Z" },
    { start: "2025-06-05T13:30:00.000Z", end: "2025-06-05T14:30:00.000Z" },
    { start: "2025-06-06T11:30:00.000Z", end: "2025-06-06T12:30:00.000Z" }
];


// --- API URLs (已更新) ---
const BINDING_CHECK_API = "https://run.mocky.io/v3/eb7319e1-442e-421d-a140-cd6b4abef706";
const BINDING_SUBMIT_API = "https://run.mocky.io/v3/eb7319e1-442e-421d-a140-cd6b4abef706";
const BUSY_TIMES_API = "https://hook.us2.make.com/ebcwlrk0t5woz18qxhbq137tpiggst9p";
const CREATE_RESERVATION_API = "https://hook.us2.make.com/ebcwlrk0t5woz18qxhbq137tpiggst9p";

// --- API Functions ---

async function checkBindingApi(uid) {
    console.log("API: Checking binding for UID:", uid);
    try {
        const response = await fetch(BINDING_CHECK_API, {
            method: 'GET', // 假設此 Mocky URL 接受 GET
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
            method: 'POST', // 假設此 Mocky URL 接受 POST
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
//    fetchBusyTimesApi 函數已更新
// =======================================================
async function fetchBusyTimesApi(date) {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    console.log("API: Fetching busy times for:", dateString);

    try {
        const response = await fetch(BUSY_TIMES_API, {
            method: 'POST', // 改為 POST
            headers: {
                'Content-Type': 'application/json',
                'x-purpose': 'calendar_query' // 新增 Header
            },
            body: JSON.stringify({ "date": dateString }) // 新增 Body
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Busy Times API Response:", data);

        // 確保回傳的格式是 { "busy": [...] }
        if (data && Array.isArray(data.busy)) {
            return data.busy.map(busy => ({
                start: new Date(busy.start),
                end: new Date(busy.end)
            }));
        } else {
            console.warn("Busy Times API returned unexpected format or no 'busy' array. Assuming no busy times.", data);
            return []; // 如果格式不對或沒有 busy 陣列，回傳空陣列
        }

    } catch (error) {
        console.error("API Error (fetchBusyTimesApi):", error);
        // 發生錯誤時回傳空陣列，讓 UI 顯示「無時段」而非崩潰
        return [];
    }
}
// =======================================================
//   fetchBusyTimesApi 函數結束
// =======================================================


// =======================================================
//    submitReservationApi 函數已更新 (使用真實 API URL)
// =======================================================
async function submitReservationApi(payload) {
    console.log("API: Submitting Reservation:", payload);
    try {
        const response = await fetch(CREATE_RESERVATION_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-purpose': 'creat', // 保留原有的 purpose
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
             // 嘗試讀取錯誤訊息 (如果有的話)
            let errorBody = 'Unknown error';
            try {
                errorBody = await response.text();
            } catch (e) { /* ignore */ }
            throw new Error(`API Error: ${response.statusText} - ${errorBody}`);
        }

        // 假設 Make.com Webhook 會回傳 JSON
        const result = await response.json();
        console.log("Create Reservation API Response:", result);

        // 檢查 Make.com Webhook 是否回傳成功訊息
        // 這裡需要根據您在 Make.com 設定的回應來調整
        // 假設 Make.com 回應 { "success": true } 或類似格式
        if (result && result.success === true) {
             return { success: true, message: "Reservation created." };
        } else if (response.ok) {
            // 如果 API 回應 200 OK 但沒有明確的 success:true，
            // 且 Make.com 設定為簡單回應 (如只回傳 "Accepted")，
            // 則我們可以假設成功。如果 Make.com 會回傳 JSON，請修改此處。
            console.warn("Reservation API returned OK but no 'success:true'. Assuming success based on HTTP status.");
            return { success: true, message: "Reservation accepted (assumed)." };
        } else {
            return { success: false, message: result.message || "Unknown reservation error." };
        }

    } catch (error) {
        console.error("API Error (submitReservationApi):", error);
        throw error;
    }
}
// =======================================================
//   submitReservationApi 函數結束
// =======================================================
