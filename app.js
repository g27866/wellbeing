// app.js — WellBeing Clinic LIFF (static treatments)

const LIFF_ID = "YOUR_LIFF_ID";      // <-- 替換為真實值
const API_BASE = "https://api.example.com"; // <-- 替換為後端網域

// 靜態療程資料
const TREATMENTS = [
  { category:"震波治療", name:"受傷震波治療", duration:60 },
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
  { category:"健康檢查", name:"各項抽血檢測", duration:60 },
];

// API endpoints
const ENDPOINTS = {
  getCustomer: uid => `${API_BASE}/customer/${uid}`,
  postBindings: `${API_BASE}/bindings`,
  getSlots: (name,date,dur) => `${API_BASE}/calendar/available?name=${encodeURIComponent(name)}&date=${date}&duration=${dur}`,
  getReservations: uid => `${API_BASE}/reservations?uid=${uid}`,
  postReservations: `${API_BASE}/reservations`
};

// DOM refs
const $ = id=>document.getElementById(id);
const loading = $("loading"), bindSec=$("binding-section"), resvSec=$("reservation-section");
const phoneIn=$("phone"), emailIn=$("email"), bindBtn=$("bind-btn");
const catWrap=$("category-btns"), treatWrap=$("treatment-btns");
const dateIn=$("resv-date"), slotsWrap=$("slots-wrap"), submitBtn=$("submit-btn"), recordsWrap=$("records-wrap");

let idToken="", uid="";
let selectedCategory=null, selectedTreatment=null, selectedSlot=null;

const api=async(method,url,body)=>{
  const headers={"Content-Type":"application/json"};
  if(idToken) headers["Authorization"]=`Bearer ${idToken}`;
  const res=await fetch(url,{method,headers,body:body?JSON.stringify(body):undefined});
  if(!res.ok) throw new Error((await res.json().catch(()=>({}))).message||res.statusText);
  return res.status===204?null:res.json().catch(()=>({}));
};

const show=e=>e.classList.remove("hidden"), hide=e=>e.classList.add("hidden"), toast=m=>alert(m);

// LIFF init
(async()=>{
  try{
    await liff.init({liffId:LIFF_ID,withLoginOnExternalBrowser:true});
    if(!liff.isLoggedIn()){liff.login();return;}
    idToken=liff.getIDToken(); uid=liff.getDecodedIDToken().sub;
    await checkBinding();
  }catch(e){console.error(e);toast("LIFF 初始化失敗");}
})();

async function checkBinding(){
  hide(bindSec);hide(resvSec);show(loading);
  try{
    const data=await api("GET",ENDPOINTS.getCustomer(uid));
    data.exists==="true"?await initReservation():showBinding();
  }catch{showBinding();}
}

function showBinding(){hide(loading);show(bindSec);}

bindBtn.onclick=async()=>{
  const p=phoneIn.value.trim(), em=emailIn.value.trim();
  if(!/^09\\d{8}$/.test(p)) return toast("手機格式錯誤");
  if(!/^.+@.+\\..+$/.test(em)) return toast("Email 格式錯誤");
  try{
    const r=await api("POST",ENDPOINTS.postBindings,{uid,phone:p,email:em});
    r.exists==="true"?await initReservation():toast("綁定錯誤，請稍候再試");
  }catch(e){console.error(e);toast("綁定失敗");}
};

async function initReservation(){
  hide(loading);hide(bindSec);show(resvSec);
  buildCategoryBtns();
  await loadReservations();
}

function buildCategoryBtns(){
  const cats=[...new Set(TREATMENTS.map(t=>t.category))];
  catWrap.innerHTML="";
  cats.forEach(c=>{
    const b=document.createElement("button");
    b.className="m-1 px-3 py-1 rounded-lg border bg-teal-500 text-white";
    b.textContent=c;
    b.onclick=()=>{selectedCategory=c;selectedTreatment=null;selectedSlot=null;
      [...catWrap.children].forEach(x=>x.classList.remove("ring-2","ring-yellow-300"));b.classList.add("ring-2","ring-yellow-300");
      buildTreatmentBtns(c);dateIn.value="";dateIn.disabled=true;slotsWrap.innerHTML="";
    };
    catWrap.appendChild(b);
  });
}

function buildTreatmentBtns(cat){
  treatWrap.innerHTML="";
  TREATMENTS.filter(t=>t.category===cat).forEach(t=>{
    const b=document.createElement("button");
    b.className="m-1 px-3 py-1 rounded-lg border bg-green-600 text-white";
    b.textContent=t.name;
    b.onclick=()=>{selectedTreatment=t;selectedSlot=null;
      [...treatWrap.children].forEach(x=>x.classList.remove("ring-2","ring-yellow-300"));b.classList.add("ring-2","ring-yellow-300");
      dateIn.disabled=false;slotsWrap.innerHTML="";
    };
    treatWrap.appendChild(b);
  });
}

dateIn.onchange=async()=>{
  selectedSlot=null;slotsWrap.innerHTML="";
  if(!selectedTreatment||!dateIn.value)return;
  try{
    const arr=await api("GET",ENDPOINTS.getSlots(selectedTreatment.name,dateIn.value,selectedTreatment.duration));
    renderSlots(arr);
  }catch(e){console.error(e);toast("取得時段失敗");}
};

function renderSlots(busyArr){
  slotsWrap.innerHTML="";
  const busy=new Set(busyArr.map(b=>b.start));
  for(let m=9*60;m<=20*60-selectedTreatment.duration;m+=30){
    const hh=String(Math.floor(m/60)).padStart(2,"0"), mm=String(m%60).padStart(2,"0");
    const s=`${hh}:${mm}`;
    const b=document.createElement("button");b.textContent=s;b.className="m-1 px-3 py-1 rounded-lg";
    if(busy.has(s)){b.classList.add("bg-gray-300","text-gray-500","cursor-not-allowed");b.disabled=true;}
    else{b.classList.add("bg-teal-500","text-white");b.onclick=()=>{selectedSlot=s;[...slotsWrap.children].forEach(x=>x.classList.remove("ring-2","ring-yellow-300"));b.classList.add("ring-2","ring-yellow-300");};}
    slotsWrap.appendChild(b);
  }
}

submitBtn.onclick=async()=>{
  if(!selectedTreatment||!dateIn.value||!selectedSlot)return toast("請完成療程、日期與時段選擇");
  try{
    await api("POST",ENDPOINTS.postReservations,{uid,treatmentName:selectedTreatment.name,category:selectedTreatment.category,date:dateIn.value,startTime:selectedSlot});
    toast("預約成功");await loadReservations();
  }catch(e){console.error(e);toast("預約失敗");}
};

async function loadReservations(){
  recordsWrap.innerHTML="";
  try{
    const list=await api("GET",ENDPOINTS.getReservations(uid));
    list.forEach(r=>{const d=document.createElement("div");d.className="bg-white rounded shadow px-3 py-2";d.textContent=`${r.treatmentName} ${r.date} ${r.startTime}`;recordsWrap.appendChild(d);});
  }catch(e){console.error(e);}
}