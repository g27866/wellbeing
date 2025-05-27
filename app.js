// app.js — WellBeing Clinic LIFF (static treatments, Make hook + Mocky binding)

// ============ CONFIG ============
const LIFF_ID  = "YOUR_LIFF_ID";            // TODO: replace
const API_BASE = "https://api.example.com"; // Other backend endpoints (reservations list)
const HOOK_URL = "https://hook.us2.make.com/ebcwlrk0t5woz18qxhbq137tpiggst9p"; // Google Calendar hook

// 綁定 / 查詢 Mocky 端點
const BIND_API  = "https://run.mocky.io/v3/169f768e-227a-4276-81c8-3100d7452ce5";
const QUERY_API = "https://run.mocky.io/v3/35ae2952-0a29-4c26-b829-1e8484d64c20";

// ============ Treatment List ============
const TREATMENTS = [{ category:"震波治療", name:"受傷震波治療", duration:60 },
{ category:"震波治療", name:"男性功能震波治療", duration:60 },
{ category:"PRP治療", name:"二代PRP治療", duration:60 },
{ category:"外泌體", name:"外泌體保養", duration:60 },
{ category:"外泌體", name:"外泌體生髮", duration:60 },
{ category:"外泌體", name:"訊聯血小板外泌體", duration:60 },
{ category:"外泌體", name:"訊聯脂肪幹細胞外泌體", duration:60 },
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
{ category:"健康檢查", name:"各項抽血檢測", duration:60 }];

// ============ Other endpoints ============
const ENDPOINTS = {
  getReservations: uid => `${API_BASE}/reservations?uid=${uid}`,
};

// ============ DOM refs ============
const $       = id => document.getElementById(id);
const errorEl = $("error-msg");
const loading = $("loading");
const bindSec = $("binding-section");
const resvSec = $("reservation-section");
const phoneIn = $("phone");
const emailIn = $("email");
const bindBtn = $("bind-btn");
const catWrap = $("category-btns");
const treatWrap = $("treatment-btns");
const dateIn  = $("resv-date");
const slotsWrap = $("slots-wrap");
const submitBtn = $("submit-btn");
const recordsWrap = $("records-wrap");

// ============ State ============
let idToken="", uid="";
let selectedCategory=null, selectedTreatment=null, selectedSlot=null;

// ============ Helper functions ============
const show = el=>el.classList.remove("hidden");
const hide = el=>el.classList.add("hidden");
const clearError = ()=>{ errorEl.textContent=""; hide(errorEl); };
const showError = msg=>{ errorEl.textContent=msg; show(errorEl); };

async function api(method, url, body){
  const headers={ "Content-Type":"application/json" };
  if(idToken) headers["Authorization"]=`Bearer ${idToken}`;
  const res = await fetch(url,{method,headers,body:body?JSON.stringify(body):undefined});
  if(!res.ok) throw new Error(await res.text());
  return res.status===204?null:await res.json().catch(()=>({}));
}

// ============ LIFF init ============
(async()=>{
  try{
    await liff.init({ liffId: LIFF_ID, withLoginOnExternalBrowser:true });
    if(!liff.isLoggedIn()){ liff.login(); return; }
    idToken = liff.getIDToken();
    uid     = liff.getDecodedIDToken().sub;
    await checkBinding();
  }catch(e){ console.error(e); showError("LIFF 初始化失敗"); }
})();

// ============ Binding Logic ============
async function checkBinding(){
  hide(bindSec); hide(resvSec); clearError(); show(loading);
  try{
    const res = await api("POST", QUERY_API, { "x-purpose":"customer_query", "uid": uid });
    res.exists==="true" ? await initReservation() : showBinding();
  }catch{ showBinding(); }
}

function showBinding(){ hide(loading); show(bindSec); }

bindBtn.onclick = async ()=>{
  clearError();
  const phone = phoneIn.value.trim();
  const email = emailIn.value.trim();
  if(!/^09\d{8}$/.test(phone)){ showError("手機格式錯誤"); return; }
  if(!/^.+@.+\..+$/.test(email)){ showError("Email 格式錯誤"); return; }
  try{
    const r = await api("POST", BIND_API, {
      "x-purpose":"customer_check",
      phone, email, uid
    });
    r.exists==="true" ? await initReservation() : showError("綁定錯誤，請稍候再試");
  }catch(e){ console.error(e); showError("綁定失敗"); }
};

// ============ Reservation Center ============
async function initReservation(){
  hide(loading); hide(bindSec); show(resvSec); clearError();
  buildCategoryButtons();
  await loadReservations();
}

// Category & Treatment buttons
function buildCategoryButtons(){
  catWrap.innerHTML="";
  const cats=[...new Set(TREATMENTS.map(t=>t.category))];
  cats.forEach(cat=>{
    const btn=document.createElement("button");
    btn.className="m-1 px-3 py-1 rounded-lg border bg-teal-500 text-white";
    btn.textContent=cat;
    btn.onclick=()=>{
      selectedCategory=cat; selectedTreatment=null; selectedSlot=null;
      [...catWrap.children].forEach(x=>x.classList.remove("ring-2","ring-yellow-300"));
      btn.classList.add("ring-2","ring-yellow-300");
      buildTreatmentButtons(cat);
      dateIn.value=""; dateIn.disabled=true; slotsWrap.innerHTML="";
    };
    catWrap.appendChild(btn);
  });
}

function buildTreatmentButtons(cat){
  treatWrap.innerHTML="";
  TREATMENTS.filter(t=>t.category===cat).forEach(t=>{
    const btn=document.createElement("button");
    btn.className="m-1 px-3 py-1 rounded-lg border bg-green-600 text-white";
    btn.textContent=t.name;
    btn.onclick=()=>{
      selectedTreatment=t; selectedSlot=null;
      [...treatWrap.children].forEach(x=>x.classList.remove("ring-2","ring-yellow-300"));
      btn.classList.add("ring-2","ring-yellow-300");
      dateIn.disabled=false; slotsWrap.innerHTML=""; clearError();
    };
    treatWrap.appendChild(btn);
  });
}

// Date change -> query free/busy
dateIn.onchange = async ()=>{
  selectedSlot=null; slotsWrap.innerHTML=""; clearError();
  if(!selectedTreatment || !dateIn.value) return;
  try{
    const busyData = await api("POST", HOOK_URL, { "x-purpose":"query", "date": dateIn.value });
    const busyArr  = parseBusy(busyData);
    renderSlots(busyArr);
  }catch(e){ console.error(e); showError("取得時段失敗"); }
};

function parseBusy(data){
  try{
    const obj = Array.isArray(data)?data[0]:data;
    const cal = obj.calendars; const key=Object.keys(cal)[0];
    return cal[key].busy || [];
  }catch{ return []; }
}

function renderSlots(busy){
  slotsWrap.innerHTML="";
  const dur=selectedTreatment.duration;
  const busyRanges = busy.map(b=>{
    const s=new Date(b.start), e=new Date(b.end);
    return [s.getHours()*60+s.getMinutes(), e.getHours()*60+e.getMinutes()];
  });
  busyRanges.push([14*60+30, 16*60+29+1]);
  for(let m=9*60;m<=20*60-dur;m+=30){
    const end=m+dur, overlap=busyRanges.some(([s,e])=>Math.max(s,m)<Math.min(e,end));
    createSlotButton(m, !overlap);
  }
}

function createSlotButton(minute, selectable){
  const h=String(Math.floor(minute/60)).padStart(2,"0"), m=String(minute%60).padStart(2,"0");
  const label=`${h}:${m}`;
  const btn=document.createElement("button");
  btn.textContent=label; btn.className="m-1 px-3 py-1 rounded-lg";
  if(selectable){
    btn.classList.add("bg-teal-500","text-white");
    btn.onclick=()=>{
      selectedSlot=label;
      [...slotsWrap.children].forEach(x=>x.classList.remove("ring-2","ring-yellow-300"));
      btn.classList.add("ring-2","ring-yellow-300");
    };
  }else{
    btn.classList.add("bg-gray-300","text-gray-500","cursor-not-allowed"); btn.disabled=true;
  }
  slotsWrap.appendChild(btn);
}

// Submit reservation
submitBtn.onclick = async ()=>{
  clearError();
  if(!selectedTreatment||!dateIn.value||!selectedSlot){ showError("請完成療程、日期與時段選擇"); return; }
  const startISO=iso(dateIn.value,selectedSlot);
  const endISO  =isoAdd(startISO,selectedTreatment.duration);
  try{
    await api("POST", HOOK_URL, {
      "x-purpose":"create",
      uid,
      treatment:selectedTreatment.name,
      start:startISO,
      end:endISO
    });
    showError("預約成功！");
    await loadReservations();
  }catch(e){ console.error(e); showError("預約失敗"); }
};

// Helpers
function iso(date, time){ return new Date(`${date}T${time}:00`).toISOString(); }
function isoAdd(iso,mins){ return new Date(new Date(iso).getTime()+mins*60000).toISOString(); }

// Reservations list (optional backend)
async function loadReservations(){
  recordsWrap.innerHTML="";
  try{
    const list = await api("GET", ENDPOINTS.getReservations(uid));
    list.forEach(r=>{
      const div=document.createElement("div");
      div.className="bg-white rounded shadow px-3 py-2";
      div.textContent=`${r.treatmentName||r.treatment} ${r.date||r.start?.split("T")[0]} ${r.startTime||r.start?.split("T")[1]?.substring(0,5)}`;
      recordsWrap.appendChild(div);
    });
  }catch(e){ console.error(e); }
}
