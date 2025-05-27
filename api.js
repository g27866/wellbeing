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
const MOCK_BUSY_TIMES = [
    { start: "2025-06-05T10:00:00.000Z", end: "2025-06-05T11:00:00.000Z" },
    { start: "2025-06-05T13:30:00.000Z", end: "2025-06-05T14:30:00.000Z" },
    { start: "2025-06-06T11:30:00.000Z", end: "2025-06-06T12:30:00.000Z" }
];


// --- API URLs ---
const BINDING_CHECK_API = "https://run.mocky.io/v3/eb7319e1-442e-421d-a140-cd6b4abef706";
const BINDING_SUBMIT_API = "https://run.mocky.io/v3/eb7319e1-442e-421d-a140-cd6b4abef706";
const BUSY_TIMES_API = "https://hook.us2.make.com/ebcwlrk0t5woz18qxhbq137tpiggst9p";
const CREATE_RESERVATION_API = "https://hook.us2.make.com/ebcwlrk0t5woz18qxhbq137tpiggst9p";

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
//    fetchBusyTimesApi 函數已更新 (修正日期 & 處理 Accepted)
// =======================================================
async function fetchBusyTimesApi(date) {
    // --- 修正日期格式 ---
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始，所以要 +1
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`; // 組成 YYYY-MM-DD
    // ----------------------

    console.log("API: Fetching busy times for:", dateString); // 現在會印出正確日期

    try {
        const response = await fetch(BUSY_TIMES_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-purpose': 'calendar_query'
            },
            body: JSON.stringify({ "date": dateString })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        // --- 修正 JSON 解析 ---
        const responseText = await response.text(); // 1. 先讀取為純文字
        console.log("Busy Times API Raw Response:", responseText);

        // 2. 檢查是否為 "Accepted"
        if (responseText.trim().toLowerCase() === 'accepted') {
            console.warn("API returned 'Accepted'. Assuming no busy times.");
            return []; // 回傳空陣列，表示沒有忙碌時段
        }

        // 3. 如果不是 "Accepted"，才嘗試解析為 JSON
        try {
            const data = JSON.parse(responseText);
            if (data && Array.isArray(data.busy)) {
                return data.busy.map(busy => ({
                    start: new Date(busy.start),
                    end: new Date(busy.end)
                }));
            } else {
                console.warn("Busy Times API returned unexpected JSON format. Assuming no busy times.", data);
                return [];
            }
        } catch (jsonError) {
             console.error("Failed to parse Busy Times API response as JSON:", jsonError, "Response was:", responseText);
             // 如果解析失敗，也當作沒有忙碌時段處理，避免頁面出錯
             return [];
        }
        // ------------------------

    } catch (error) {
        console.error("API Error (fetchBusyTimesApi):", error);
        return [];
    }
}
// =======================================================
//   fetchBusyTimesApi 函數結束
// =======================================================


async function submitReservationApi(payload) {
    console.log("API: Submitting Reservation:", payload);
    try {
        const response = await fetch(CREATE_RESERVATION_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-purpose': 'creat',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errorBody = 'Unknown error';
            try { errorBody = await response.text(); } catch (e) { /* ignore */ }
            throw new Error(`API Error: ${response.statusText} - ${errorBody}`);
        }

        const resultText = await response.text(); // 先讀取文字，因為 Make.com 可能回傳非 JSON
        console.log("Create Reservation API Response:", resultText);

        // 嘗試解析 JSON，如果失敗，則檢查是否為 Accepted
        try {
            const result = JSON.parse(resultText);
             if (result && result.success === true) {
                 return { success: true, message: "Reservation created." };
             } else {
                  return { success: false, message: result.message || "Unknown reservation error." };
             }
        } catch(e) {
            if (resultText.trim().toLowerCase() === 'accepted') {
                console.warn("Reservation API returned 'Accepted'. Assuming success.");
                return { success: true, message: "Reservation accepted (assumed)." };
            } else {
                throw new Error("Reservation API returned non-JSON/Accepted response: " + resultText);
            }
        }

    } catch (error) {
        console.error("API Error (submitReservationApi):", error);
        throw error;
    }
}
