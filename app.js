// app.js — WellBeing Clinic LIFF (static treatments, Make hook)
//
// ============ CONFIG ============
const LIFF_ID  = "2007485366-aYAOy7rB";                     // TODO: replace
const API_BASE = "https://run.mocky.io/v3/";          // other backend endpoints
const HOOK_URL = "https://hook.us2.make.com/ebcwlrk0t5woz18qxhbq137tpiggst9p"; // Google Calendar query/create

// ============ Static treatment list ============
const TREATMENTS = [
  { category:"震波治療", name:"受傷震波治療", duration:60 },
  { category:"震波治療", name:"男性功能震波治療", duration:60 },
  { category:"PRP治療", name:"二代PRP治療", duration:60 },
  { category:"外泌體",  name:"外泌體保養", duration:60 },
  { category:"外泌體",  name:"外泌體生髮", duration:60 },
  { category:"外泌體",  name:"訊聯血小板外泌體", duration:60 },
  { category:"外泌體",  name:"訊聯脂肪幹細胞外泌體", duration:60 },
  { category:"修復式醫美", name:"瘦瘦針", duration:30 },
  { category:"修復式醫美", name:"肉毒桿菌注射", duration:30 },
  { category:"疫苗注射", name:"HPV疫苗注射", duration:30 },
  { category:"疫苗注射", name:"帶狀泡疹疫苗注射", duration:30 },
  { category:"點滴療程", name:"美白淡斑", duration:30 },
  { category:"點滴療程", name:"增強血液循環", duration:30 },
  { category:"點滴療程", name:"強肝解毒", duration:30 },
  { category:"點滴療程", name:"記憶力強化", duration:30 },
  { category:"點滴療程", name:"提升睡眠品質", duration:30 },
  { category:"點滴療程", name:"燃脂增肌", duration:30 },
  { category:"健康檢查", name:"自律神經檢測", duration:60 },
  { category:"健康檢查", name:"心電圖檢查", duration:60 },
  { category:"健康檢查", name:"頸動脈超音波檢查", duration:60 },
  { category:"健康檢查", name:"睡眠呼吸中止症居家檢測", duration:120 },
  { category:"健康檢查", name:"功能醫學檢測", duration:60 },
  { category:"健康檢查", name:"失智症基因檢測", duration:60 },
  { category:"健康檢查", name:"過敏原檢測", duration:60 },
  { category:"健康檢查", name:"癌症腫瘤指標檢測", duration:60 },
  { category:"健康檢查", name:"CTC循環腫瘤細胞檢測", duration:60 },
  { category:"健康檢查", name:"EPC內皮前趨細胞檢測", duration:60 },
  { category:"健康檢查", name:"先知先覺基因風險評估", duration:60 },
  { category:"健康檢查", name:"美塔力生理年齡檢測", duration:60 },
  { category:"健康檢查", name:"各項抽血檢測", duration:60 },
];

// ============ Backend endpoints ============
const ENDPOINTS = {
  getCustomer: uid => `${API_BASE}/169f768e-227a-4276-81c8-3100d7452ce5`,
  postBindings: `${API_BASE}/bindings`,
  getReservations: uid => `${API_BASE}/reservations?uid=${uid}`, // optional
};

// ============ DOM refs ============
const $ = id=>document.getElementById(id);
const errorBox=$("error-msg"), loading=$("loading"), bindSec=$("binding-section"), resvSec=$("reservation-section");
const phoneIn=$("phone"), emailIn=$("email"), bindBtn=$("bind-btn");
const catWrap=$("category-btns"), treatWrap=$("treatment-btns");
const dateIn=$("resv-date"), slotsWrap=$("slots-wrap"), submitBtn=$("submit-btn"), recordsWrap=$("records-wrap");

// ============ state ============
let idToken="", uid="";
let selectedCategory=null, selectedTreatment=null, selectedSlot=null;

// ============ helpers ============
const api = async(method,url,body)=>{
  const headers={"Content-Type":"application/json"};
  if(idToken) headers["Authorization"]=`Bearer ${idToken}`;
  const res=await fetch(url,{method,headers,body:body?JSON.stringify(body):undefined});
  if(!res.ok) throw new Error(await res.text());
  return res.status===204?null:await res.json().catch(()=>({}));
};

const show = el=>el.classList.remove("hidden");
const hide = el=>el.classList.add("hidden");
const clearError = ()=>{ errorBox.textContent=""; hide(errorBox); };
const showError = msg=>{ errorBox.textContent=msg; show(errorBox); };

// ============ LIFF init ============
(async()=>{
  try{
    await liff.init({liffId:LIFF_ID,withLoginOnExternalBrowser:true});
    if(!liff.isLoggedIn()){liff.login();return;}
    idToken=liff.getIDToken(); uid=liff.getDecodedIDToken().sub;
    await checkBinding();
  }catch(e){
    console.error(e);
    showError("LIFF 初始化失敗");
  }
})();

// ============ Binding ============
async function checkBinding(){
  hide(bindSec);hide(resvSec);clearError();show(loading);
  try{
    const data=await api("GET",ENDPOINTS.(uid));
    if(data.exists==="true"){ await initReservation(); }
    else{ showBinding(); }
  }catch{ showBinding(); }
}
function showBinding(){ hide(loading); show(bindSec); }

bindBtn.onclick=async()=>{
  clearError();
  const phone=phoneIn.value.trim(), email=emailIn.value.trim();
  if(!/^09\d{8}$/.test(phone)){ showError("手機格式錯誤"); return; }
  if(!/^.+@.+\..+$/.test(email)){ showError("Email 格式錯誤"); return; }
  try{
    const res=await api("POST",ENDPOINTS.postBindings,{uid,phone,email});
    if(res.exists==="true"){ await initReservation(); }
    else{ showError("綁定錯誤，請稍候再試"); }
  }catch(e){ console.error(e); showError("綁定失敗"); }
};

// ============ Reservation Center ============
async function initReservation(){
  hide(loading); hide(bindSec); show(resvSec); clearError();
  buildCategoryBtns();
  await loadReservations();
}

// category buttons
function buildCategoryBtns(){
  const cats=[...new Set(TREATMENTS.map(t=>t.category))];
  catWrap.innerHTML="";
  cats.forEach(cat=>{
    const b=document.createElement("button");
    b.className="m-1 px-3 py-1 rounded-lg border bg-teal-500 text-white";
    b.textContent=cat;
    b.onclick=()=>{
      selectedCategory=cat; selectedTreatment=null; selectedSlot=null;
      [...catWrap.children].forEach(x=>x.classList.remove("ring-2","ring-yellow-300"));
      b.classList.add("ring-2","ring-yellow-300");
      buildTreatmentBtns(cat);
      dateIn.value=""; dateIn.disabled=true; slotsWrap.innerHTML="";
    };
    catWrap.appendChild(b);
  });
}

// treatment buttons
function buildTreatmentBtns(cat){
  treatWrap.innerHTML="";
  TREATMENTS.filter(t=>t.category===cat).forEach(t=>{
    const b=document.createElement("button");
    b.className="m-1 px-3 py-1 rounded-lg border bg-green-600 text-white";
    b.textContent=t.name;
    b.onclick=()=>{
      selectedTreatment=t; selectedSlot=null;
      [...treatWrap.children].forEach(x=>x.classList.remove("ring-2","ring-yellow-300"));
      b.classList.add("ring-2","ring-yellow-300");
      dateIn.disabled=false; slotsWrap.innerHTML=""; clearError();
    };
    treatWrap.appendChild(b);
  });
}

// date change -> query free/busy
dateIn.onchange=async()=>{
  selectedSlot=null; slotsWrap.innerHTML=""; clearError();
  if(!selectedTreatment || !dateIn.value) return;
  try{
    const busyData = await api("POST", HOOK_URL, {
      "x-purpose":"query",
      "date": dateIn.value
    });
    const busyArr = parseBusy(busyData);
    renderSlots(busyArr);
  }catch(e){ console.error(e); showError("取得時段失敗"); }
};

// parse API busy to array of minute ranges
function parseBusy(data){
  // expecting structure calendars[key].busy[{start,end}]
  try{
    const obj = Array.isArray(data)?data[0]:data;
    const cal = obj.calendars;
    const firstKey = Object.keys(cal)[0];
    return cal[firstKey].busy || [];
  }catch{ return []; }
}

// render slot buttons with rule filters
function renderSlots(busy){
  slotsWrap.innerHTML="";
  const dur=selectedTreatment.duration; // minutes
  // build busy minute ranges
  const busyRanges = busy.map(b=>{
    const start = new Date(b.start);
    const end   = new Date(b.end);
    return [start.getHours()*60+start.getMinutes(), end.getHours()*60+end.getMinutes()];
  });
  // add lunch break 14:30-16:29 block
  busyRanges.push([14*60+30, 16*60+29+1]); // +1 to be inclusive
  // iterate 09:00 to 20:00
  for(let m=9*60; m<=20*60-dur; m+=30){
    const slotStart=m, slotEnd=m+dur;
    // overlap check
    const overlaps = busyRanges.some(([s,e])=>Math.max(s,slotStart)<Math.min(e,slotEnd));
    createSlotButton(slotStart, !overlaps);
  }
}

// helper create slot btn
function createSlotButton(minuteOfDay, selectable){
  const hh=String(Math.floor(minuteOfDay/60)).padStart(2,"0");
  const mm=String(minuteOfDay%60).padStart(2,"0");
  const label=`${hh}:${mm}`;
  const b=document.createElement("button");
  b.textContent=label; b.className="m-1 px-3 py-1 rounded-lg";
  if(selectable){
    b.classList.add("bg-teal-500","text-white");
    b.onclick=()=>{ selectedSlot=label; [...slotsWrap.children].forEach(x=>x.classList.remove("ring-2","ring-yellow-300")); b.classList.add("ring-2","ring-yellow-300"); };
  }else{
    b.classList.add("bg-gray-300","text-gray-500","cursor-not-allowed"); b.disabled=true;
  }
  slotsWrap.appendChild(b);
}

// submit reservation -> create calendar event
submitBtn.onclick=async()=>{
  clearError();
  if(!selectedTreatment||!dateIn.value||!selectedSlot){ showError("請完成療程、日期與時段選擇"); return; }
  const startISO = toISO(dateIn.value, selectedSlot);
  const endISO   = addMinutesISO(startISO, selectedTreatment.duration);
  try{
    await api("POST", HOOK_URL, {
      "x-purpose":"create",
      "uid": uid,
      "treatment": selectedTreatment.name,
      "start": startISO,
      "end": endISO
    });
    await loadReservations();
    showError("預約成功！"); // success message in same error box (green style could be added)
  }catch(e){ console.error(e); showError("預約失敗"); }
};

// helper time format
function toISO(date, time){
  return new Date(`${date}T${time}:00`).toISOString();
}
function addMinutesISO(iso,min){
  return new Date(new Date(iso).getTime()+min*60000).toISOString();
}

// load reservations (optional)
async function loadReservations(){
  recordsWrap.innerHTML="";
  try{
    const list=await api("GET", ENDPOINTS.getReservations(uid));
    list.forEach(r=>{
      const d=document.createElement("div");
      d.className="bg-white rounded shadow px-3 py-2";
      d.textContent=`${r.treatmentName||r.treatment} ${r.date||r.start?.split("T")[0]} ${r.startTime||r.start?.split("T")[1]?.substring(0,5)}`;
      recordsWrap.appendChild(d);
    });
  }catch(e){ console.error(e); }
}
