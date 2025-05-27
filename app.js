
const LIFF_ID = "2007485366-aYAOy7rB";
// --- API URLs ---
const BINDING_CHECK_API = "https://run.mocky.io/v3/35ae2952-0a29-4c26-b829-1e8484d64c20";
const BINDING_SUBMIT_API = "https://run.mocky.io/v3/169f768e-227a-4276-81c8-3100d7452ce5";
// NOTE: Busy Times and Create Reservation APIs are not provided, using mocks/logs.
const BUSY_TIMES_API = "https://hook.us2.make.com/ebcwlrk0t5woz18qxhbq137tpiggst9p"; // Placeholder
const CREATE_RESERVATION_API = "https://hook.us2.make.com/ebcwlrk0t5woz18qxhbq137tpiggst9p"; // Placeholder

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
    // Use the current year and next month for better testing
    { start: "2025-06-05T10:00:00.000Z", end: "2025-06-05T11:00:00.000Z" },
    { start: "2025-06-05T13:30:00.000Z", end: "2025-06-05T14:30:00.000Z" },
    { start: "2025-06-06T11:30:00.000Z", end: "2025-06-06T12:30:00.000Z" }
];



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
        throw error; // Re-throw to be handled by the caller
    }
}

async function submitBindingApi(phone, email, uid) {
    console.log("API: Submitting binding:", { phone, email, uid });
    try {
        const response = await fetch(BINDING_SUBMIT_API, {
            method: 'POST', // Mocky.io might use GET, but POST is more appropriate
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
        throw error; // Re-throw
    }
}

// Mock fetch busy times
async function fetchBusyTimesApi(date) {
    console.log("API: Fetching busy times for:", date.toISOString().split('T')[0]);
    // In a real scenario, this would be an API call to BUSY_TIMES_API
    // We are using MOCK_BUSY_TIMES for now.
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    const selectedDateString = date.toISOString().split('T')[0];
    return MOCK_BUSY_TIMES
        .filter(busy => busy.start.startsWith(selectedDateString))
        .map(busy => ({
            start: new Date(busy.start),
            end: new Date(busy.end)
        }));
}

async function submitReservationApi(payload) {
    console.log("API: Submitting Reservation:", payload);
    // In a real scenario, this would be an API call to CREATE_RESERVATION_API
    try {
        // const response = await fetch(CREATE_RESERVATION_API, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'x-purpose': 'creat',
        //     },
        //     body: JSON.stringify(payload)
        // });
        // if (!response.ok) {
        //     throw new Error(`API Error: ${response.statusText}`);
        // }
        // return await response.json();

        // Mock success response
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
        console.log("Mock submission successful.");
        return { success: true, message: "Reservation created (Mock)." };

    } catch (error) {
        console.error("API Error (submitReservationApi):", error);
        throw error; // Re-throw
    }
}
