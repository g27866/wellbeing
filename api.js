// --- Static Data ---
const TREATMENTS = [
    { category: "震波治療", name: "受傷震波治療", duration: 59 },
    { category: "震波治療", name: "男性功能震波治療", duration: 59 },
    { category: "PRP治療", name: "二代PRP治療", duration: 59 },
    { category: "外泌體", name: "外泌體保養", duration: 59 },
    { category: "外泌體", name: "外泌體生髮", duration: 59 },
    { category: "外泌體", name: "訊聯血小板外泌體", duration: 59 },
    { category: "外泌體", name: "訊聯脂肪幹細胞外泌體", duration: 59 },
    { category: "修復式醫美", name: "瘦瘦針", duration: 29 },
    { category: "修復式醫美", name: "肉毒桿菌注射", duration: 29 },
    { category: "疫苗注射", name: "HPV疫苗注射", duration: 29 },
    { category: "疫苗注射", name: "帶狀泡疹疫苗注射", duration: 29 },
    { category: "點滴療程", name: "美白淡斑", duration: 29 },
    { category: "點滴療程", name: "增強血液循環", duration: 29 },
    { category: "點滴療程", name: "強肝解毒", duration: 29 },
    { category: "點滴療程", name: "記憶力強化", duration: 29 },
    { category: "點滴療程", name: "提升睡眠品質", duration: 29 },
    { category: "點滴療程", name: "燃脂增肌", duration: 29 },
    { category: "健康檢查", name: "自律神經檢測", duration: 59 },
    { category: "健康檢查", name: "心電圖檢查", duration: 59 },
    { category: "健康檢查", name: "頸動脈超音波檢查", duration: 59 },
    { category: "健康檢查", name: "睡眠呼吸中止症居家檢測", duration: 119 },
    { category: "健康檢查", name: "功能醫學檢測", duration: 59 },
    { category: "健康檢查", name: "失智症基因檢測", duration: 59 },
    { category: "健康檢查", name: "過敏原檢測", duration: 59 },
    { category: "健康檢查", name: "癌症腫瘤指標檢測", duration: 59 },
    { category: "健康檢查", name: "CTC循環腫瘤細胞檢測", duration: 59 },
    { category: "健康檢查", name: "EPC內皮前趨細胞檢測", duration: 59 },
    { category: "健康檢查", name: "先知先覺基因風險評估", duration: 59 },
    { category: "健康檢查", name: "美塔力生理年齡檢測", duration: 59 },
    { category: "健康檢查", name: "各項抽血檢測", duration: 59 },
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
const BUSY_TIMES_API = "https://hook.us2.make.com/vgchlivul73etm3odnx05no64uw6123p";
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
//    getBusyTimes 函數(查詢google clander)
// =======================================================
exports.getBusyTimes = functions.https.onRequest(async (req, res) => {
    // Add CORS for calling from the web app
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST' || !req.body.date) {
        res.status(400).send('Please provide a date in YYYY-MM-DD format via POST.');
        return;
    }

    const dateString = req.body.date;
    const timeMin = new Date(`${dateString}T00:00:00.000Z`); // Adjust to your timezone if needed
    const timeMax = new Date(`${dateString}T23:59:59.999Z`); // Adjust to your timezone if needed

    try {
        const response = await calendar.events.list({
            calendarId: calendarId,
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        const busyTimes = response.data.items.map(event => ({
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date
        }));

        // Convert to Date objects to match api.js expectation (if needed)
        const busyTimesAsDates = busyTimes.map(busy => ({
             start: new Date(busy.start),
             end: new Date(busy.end)
        }));


        res.status(200).json(busyTimesAsDates); // Return as an array directly

    } catch (error) {
        console.error('Error fetching Google Calendar events:', error);
        res.status(500).send('Error fetching busy times.');
    }
});
// =======================================================
//   getBusyTimes 函數結束
// =======================================================


exports.createReservation = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

     if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST' || !req.body.lineUid || !req.body.treatment || !req.body.startTime || !req.body.endTime) {
        res.status(400).send('Missing reservation data.');
        return;
    }

    const { lineUid, treatment, startTime, endTime } = req.body;

    try {
        // 1. Fetch customer data from Firestore
        const customersRef = db.collection('customers');
        const snapshot = await customersRef.where('lineUid', '==', lineUid).limit(1).get();

        if (snapshot.empty) {
            res.status(404).send('Customer not found with this LINE UID.');
            return;
        }

        const customer = snapshot.docs[0].data();
        const customerId = snapshot.docs[0].id; // Get customer document ID
        const customerName = customer.name || 'Unknown';
        const customerMobile = customer.mobile || 'N/A';

        // 2. Create Google Calendar event
        const event = {
            summary: `${treatment} - ${customerName}`,
            description: `顧客姓名: ${customerName}\n手機: ${customerMobile}\n療程: ${treatment}\nLINE UID: ${lineUid}`,
            start: { dateTime: startTime, timeZone: 'Asia/Taipei' }, // Ensure timezone is correct
            end: { dateTime: endTime, timeZone: 'Asia/Taipei' },
        };

        const createdEvent = await calendar.events.insert({
            calendarId: calendarId,
            resource: event,
        });

        // 3. Write to Firestore 'appointment' collection
        const appointmentRef = db.collection('customers').doc(customerId).collection('appointment').doc();
        await appointmentRef.set({
            Treatment_uid: 'some_unique_id_if_needed', // Or use the GCal event ID?
            date: new Date(startTime),
            status: 'Confirmed', // Or 'Booked'
            Treatment: treatment,
            googleCalendarEventId: createdEvent.data.id // Store GCal event ID for future reference
        });

        res.status(200).json({ success: true, message: 'Reservation created successfully.' });

    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).send('Failed to create reservation.');
    }
});
