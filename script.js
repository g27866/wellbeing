// --- DOM Elements ---
const loadingSection = document.getElementById("loading-section");
const accountBindingSection = document.getElementById("account-binding-section");
const reservationCenterSection = document.getElementById("reservation-center-section");
const headerTitle = document.getElementById("header-title");
const phoneInput = document.getElementById("phone-input");
const emailInput = document.getElementById("email-input");
const submitBindingButton = document.getElementById("submit-binding-button");
const bindingErrorMessage = document.getElementById("binding-error-message");
const generalErrorMessage = document.getElementById("general-error-message");
// closeButton 已被移除
const treatmentCategoryList = document.getElementById("treatment-category-list");
const treatmentNameSection = document.getElementById("treatment-name-section");
const treatmentNameList = document.getElementById("treatment-name-list");
const calendarSection = document.getElementById("calendar-section");
const monthYear = document.getElementById("month-year");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const calendarDays = document.getElementById("calendar-days");
const timeSlotSection = document.getElementById("time-slot-section");
const submitReservationDiv = document.getElementById("submit-reservation-div");
const submitReservationButton = document.getElementById("submit-reservation-button");

// --- State ---
let lineUid = null;
let currentMonthDate = new Date();
let selectedTreatment = null;
let selectedDate = null;
let selectedTime = null;

// --- Utility Functions ---

function showSection(section) {
    loadingSection.classList.add("hidden");
    accountBindingSection.classList.add("hidden");
    reservationCenterSection.classList.add("hidden");
    section.classList.remove("hidden");
}

function showBindingError(message) {
    bindingErrorMessage.textContent = message;
    bindingErrorMessage.classList.remove("hidden");
}

function hideBindingError() {
    bindingErrorMessage.classList.add("hidden");
}

function showGeneralError(message) {
    generalErrorMessage.textContent = message;
    generalErrorMessage.classList.remove("hidden");
     loadingSection.classList.remove("hidden"); // Ensure loading section shows error
     accountBindingSection.classList.add("hidden");
     reservationCenterSection.classList.add("hidden");
}

function validateInput(inputElement) {
    let isValid = true;
    inputElement.classList.remove('input-error'); // Reset style

    if (!inputElement.value.trim()) {
        isValid = false;
    } else if (inputElement.type === 'email' && !/^\S+@\S+\.\S+$/.test(inputElement.value)) {
        isValid = false;
    } else if (inputElement.type === 'tel' && !/^\d{10}$/.test(inputElement.value)) { // Simple 10-digit phone check
        isValid = false;
    }

    if (!isValid) {
        inputElement.classList.add('input-error');
    }
    return isValid;
}


// --- Core Logic Functions ---

async function checkBinding(uid) {
    console.log("Checking binding for UID:", uid);
    try {
        const data = await checkBindingApi(uid);
        console.log("Binding check response:", data);

        if (data.exists === "true") {
            showSection(reservationCenterSection);
            setupReservationCenter();
        } else {
            headerTitle.textContent = "Account Binding";
            showSection(accountBindingSection);
        }
    } catch (error) {
        console.error("Error checking binding:", error);
        headerTitle.textContent = "Error";
        showGeneralError("Could not check account status. Please try again later.");
    }
}

async function handleBindingSubmit() {
    hideBindingError();

    const isPhoneValid = validateInput(phoneInput);
    const isEmailValid = validateInput(emailInput);

    if (!isPhoneValid || !isEmailValid) {
        showBindingError("Please enter valid phone and email.");
        return;
    }

     if (!lineUid) {
        showBindingError("Could not get LINE user ID. Please ensure you are in LINE.");
        return;
    }

    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();

    console.log("Submitting binding:", { phone, email, lineUid });

    try {
        const data = await submitBindingApi(phone, email, lineUid);
        console.log("Binding submit response:", data);

        if (data.exists === "true") {
            showSection(reservationCenterSection);
            setupReservationCenter();
        } else {
            showBindingError("Binding failed. Please check your details and try again.");
            phoneInput.classList.add('input-error');
            emailInput.classList.add('input-error');
        }
    } catch (error) {
        console.error("Error submitting binding:", error);
        showBindingError("An error occurred during binding. Please try again later.");
    }
}

function setupReservationCenter() {
    populateCategories();
    hideAllReservationSteps();
    treatmentCategoryList.parentElement.classList.remove('hidden');
}

function hideAllReservationSteps() {
    treatmentNameSection.classList.add('hidden');
    calendarSection.classList.add('hidden');
    timeSlotSection.classList.add('hidden');
    submitReservationDiv.classList.add('hidden');
}

function createTreatmentButton(item, type, clickHandler) {
    const div = document.createElement("div");
    div.className = `flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#e6f4f2] pl-4 pr-4 ${type}`;
    div.dataset.name = item.name || item.category;
    if (item.category) div.dataset.category = item.category;

    const p = document.createElement("p");
    p.className = "text-[#0c1d1a] text-sm font-medium leading-normal";
    p.textContent = item.name || item.category;
    div.appendChild(p);

    div.addEventListener("click", () => {
        document.querySelectorAll(`.${type}.selected`).forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');
        clickHandler(item);
    });
    return div;
}

function populateCategories() {
    treatmentCategoryList.innerHTML = '';
    const categories = [...new Set(TREATMENTS.map(t => t.category))];
    categories.forEach(cat => {
        const btn = createTreatmentButton({ category: cat }, 'treatment-category', handleCategorySelect);
        treatmentCategoryList.appendChild(btn);
    });
    treatmentCategoryList.parentElement.classList.remove('hidden');
}

function handleCategorySelect(categoryItem) {
    const category = categoryItem.category;
    console.log("Category selected:", category);
    populateTreatments(category);
    selectedTreatment = null;
    selectedDate = null;
    selectedTime = null;
    calendarSection.classList.add('hidden');
    timeSlotSection.classList.add('hidden');
    submitReservationDiv.classList.add('hidden');
    treatmentNameSection.classList.remove('hidden');
}

function populateTreatments(category) {
    treatmentNameList.innerHTML = '';
    const names = TREATMENTS.filter(t => t.category === category);
    names.forEach(treatment => {
        const btn = createTreatmentButton(treatment, 'treatment-name', handleTreatmentSelect);
        treatmentNameList.appendChild(btn);
    });
}

function handleTreatmentSelect(treatment) {
    selectedTreatment = treatment;
    console.log("Treatment selected:", selectedTreatment);
    selectedDate = null;
    selectedTime = null;
    timeSlotSection.classList.add('hidden');
    submitReservationDiv.classList.add('hidden');
    calendarSection.classList.remove('hidden');
    renderCalendar(currentMonthDate);
}

function renderCalendar(date) {
    calendarDays.innerHTML = '';
    const year = date.getFullYear();
    const month = date.getMonth();
    monthYear.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.appendChild(document.createElement("div"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayButton = document.createElement("button");
        const dayDiv = document.createElement("div");
        const currentDate = new Date(year, month, day);

        dayButton.className = "h-12 w-full text-[#0c1d1a] text-sm font-medium leading-normal calendar-day";
        dayDiv.className = "flex size-full items-center justify-center rounded-full";
        dayDiv.textContent = day;
        dayButton.appendChild(dayDiv);
        dayButton.dataset.date = currentDate.toISOString().split('T')[0];

        // 星期日 (getDay() === 0) 和過去的日期不可選
        if (currentDate < today || currentDate.getDay() === 0) {
            dayButton.classList.add('disabled');
            dayButton.disabled = true;
        } else {
            dayButton.addEventListener('click', () => handleDateSelect(currentDate));
        }

        calendarDays.appendChild(dayButton);
    }
}

function handleDateSelect(date) {
    selectedDate = date;
    console.log("Date selected:", selectedDate);

    document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
    const dateString = date.toISOString().split('T')[0];
    const selectedButton = document.querySelector(`.calendar-day[data-date="${dateString}"]`);
    if (selectedButton) selectedButton.classList.add('selected');

    selectedTime = null;
    submitReservationDiv.classList.add('hidden');
    populateTimeSlots(date);
}

// =======================================================
//    populateTimeSlots 函數已更新以符合新規則
// =======================================================
async function populateTimeSlots(date) {
    timeSlotSection.innerHTML = '<p class="text-center text-[#45a190] p-4 col-span-full">Loading times...</p>';
    timeSlotSection.classList.remove('hidden');

    if (!selectedTreatment) return;

    try {
        const busyTimes = await fetchBusyTimesApi(date);
        const duration = selectedTreatment.duration;
        const availableSlots = [];
        const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

        let timeRanges = [];

        // 根據星期幾設定時間範圍
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // 星期一至星期五
            timeRanges = [
                { startH: 11, startM: 0, endH: 14, endM: 30 }, // 午診 11:00 ~ 14:30
                { startH: 16, startM: 30, endH: 23, endM: 0 }  // 晚診 16:30 ~ 23:00 (允許 22:30 開始)
            ];
        } else if (dayOfWeek === 6) { // 星期六
            timeRanges = [
                { startH: 12, startM: 0, endH: 18, endM: 0 }  // 午診 12:00 ~ 18:00
            ];
        }
        // 星期日 (dayOfWeek === 0) timeRanges 為空，不會產生時段。

        // 遍歷每個時間範圍
        timeRanges.forEach(range => {
            const openingTime = new Date(date);
            openingTime.setHours(range.startH, range.startM, 0, 0);

            const closingTime = new Date(date);
            closingTime.setHours(range.endH, range.endM, 0, 0);

            let currentTime = new Date(openingTime);

            // 在此範圍內產生 30 分鐘間隔的時段
            while (currentTime < closingTime) {
                const potentialEndTime = new Date(currentTime.getTime() + duration * 60000);
                let isAvailable = true;

                // 1. 檢查結束時間是否超過此範圍的關閉時間
                if (potentialEndTime > closingTime) {
                    isAvailable = false;
                }

                // 2. 檢查是否與忙碌時段重疊
                if (isAvailable) {
                    for (const busy of busyTimes) {
                        // 如果 (開始時間 < 忙碌結束) 且 (結束時間 > 忙碌開始)，則表示重疊
                        if (currentTime < busy.end && potentialEndTime > busy.start) {
                            isAvailable = false;
                            break;
                        }
                    }
                }

                // 3. 如果可用，則加入列表
                if (isAvailable) {
                    availableSlots.push(new Date(currentTime));
                }

                // 移至下一個 30 分鐘時段
                currentTime.setMinutes(currentTime.getMinutes() + 30);
            }
        });

        // 清除載入訊息並顯示時段
        timeSlotSection.innerHTML = '';
        if (availableSlots.length > 0) {
            availableSlots.forEach(slot => {
                const timeString = slot.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                const div = document.createElement("div");
                div.className = "flex flex-1 gap-3 rounded-lg border border-[#cdeae4] bg-[#f8fcfb] p-4 items-center time-slot";
                div.dataset.time = timeString;
                div.innerHTML = `
                    <div class="text-[#0c1d1a]" data-icon="Clock" data-size="24px" data-weight="regular">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
                        </svg>
                    </div>
                    <h2 class="text-[#0c1d1a] text-base font-bold leading-tight">${timeString}</h2>
                `;
                div.addEventListener('click', () => {
                    document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
                    div.classList.add('selected');
                    selectedTime = timeString;
                    submitReservationDiv.classList.remove('hidden');
                    console.log("Time selected:", selectedTime);
                });
                timeSlotSection.appendChild(div);
            });
        } else {
            timeSlotSection.innerHTML = '<p class="text-center text-[#45a190] p-4 col-span-full">此日期無可預約時段。</p>';
        }
        timeSlotSection.classList.remove('hidden');

    } catch (error) {
         console.error("Error populating time slots:", error);
         timeSlotSection.innerHTML = '<p class="text-center error-text p-4 col-span-full">無法載入可預約時段，請稍後再試。</p>';
         timeSlotSection.classList.remove('hidden');
    }
}
// =======================================================
//   populateTimeSlots 函數結束
// =======================================================

async function handleReservationSubmit() {
    if (!lineUid || !selectedTreatment || !selectedDate || !selectedTime) {
        alert("Please complete all selections before submitting.");
        return;
    }

    const [hours, minutes] = selectedTime.split(':');
    const startTime = new Date(selectedDate);
    startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const endTime = new Date(startTime.getTime() + selectedTreatment.duration * 60000);

    const payload = {
        purpose: "creat",
        lineUid: lineUid,
        treatment: selectedTreatment.name,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
    };

    try {
        const result = await submitReservationApi(payload);
        if (result.success) {
            alert(`Reservation Submitted!\nTreatment: ${payload.treatment}\nTime: ${startTime.toLocaleString()} to ${endTime.toLocaleString()}`);
            if (liff && liff.isInClient()) liff.closeWindow();
        } else {
             alert("Failed to submit reservation. Please try again.");
        }
    } catch (error) {
        alert("An error occurred during submission. Please try again later.");
    }
}

function initializeLiff() {
    const liffId = '2007485366-aYAOy7rB'; // <<< IMPORTANT: REPLACE THIS
    console.log("Initializing LIFF with ID:", liffId);

    liff.init({ liffId: liffId })
        .then(() => {
            console.log("LIFF initialized.");
            if (!liff.isLoggedIn()) {
                console.log("Not logged in, redirecting to login.");
                liff.login();
            } else {
                return liff.getProfile();
            }
        })
        .then(profile => {
            if (profile) {
                lineUid = profile.userId;
                console.log("Got LINE UID:", lineUid);
                checkBinding(lineUid);
            }
        })
        .catch((err) => {
            console.error("LIFF initialization or profile fetch failed:", err);
            headerTitle.textContent = "LIFF Error";
            showGeneralError("Could not initialize LIFF. Please open this page in LINE. (Using mock data for now)");
            console.warn("Using MOCK UID for testing.");
            lineUid = "MOCK_U1234567890abcdef1234567890";
            checkBinding(lineUid);
        });
}

// --- Event Listeners ---
submitBindingButton.addEventListener("click", handleBindingSubmit);
submitReservationButton.addEventListener("click", handleReservationSubmit);

prevMonthBtn.addEventListener('click', () => {
    currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
    renderCalendar(currentMonthDate);
    timeSlotSection.classList.add('hidden');
    submitReservationDiv.classList.add('hidden');
});

nextMonthBtn.addEventListener('click', () => {
    currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
    renderCalendar(currentMonthDate);
    timeSlotSection.classList.add('hidden');
    submitReservationDiv.classList.add('hidden');
});

phoneInput.addEventListener('input', () => phoneInput.classList.remove('input-error'));
emailInput.addEventListener('input', () => emailInput.classList.remove('input-error'));


// --- Initial Load ---
document.addEventListener("DOMContentLoaded", () => {
    initializeLiff();
    // // --- Use this for local testing without LIFF ID ---
    // console.warn("LIFF initialization skipped. Using MOCK UID for testing.");
    // lineUid = "MOCK_U1234567890abcdef1234567890";
    // checkBinding(lineUid);
    // // --- End local testing block ---
});
