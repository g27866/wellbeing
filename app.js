
// app.js — LIFF progressive UI demo (calendar version)

const LIFF_ID = "2007485366-aYAOy7rB"; // replace
const API_BASE = "https://api.example.com";
const HOOK_URL = "https://hook.us2.make.com/vgchlivul73etm3odnx05no64uw6123p";
const CUSTOMER_QUERY_URL = "https://run.mocky.io/v3/35ae2952-0a29-4c26-b829-1e8484d64c20";
const CUSTOMER_BIND_URL  = "https://run.mocky.io/v3/169f768e-227a-4276-81c8-3100d7452ce5";

// Static treatments (subset for brevity)
const TREATMENTS = [
  { category: "震波治療", name: "受傷震波治療", duration: 60 },
  { category: "震波治療", name: "男性功能震波治療", duration: 60 },
  { category: "PRP治療", name: "二代PRP治療", duration: 60 }
  // ...其餘照前版
];

// DOM refs
const $ = id => document.getElementById(id);
const errorBox = $("error-msg"), loading=$("loading"), bindSec=$("binding-section"), resvSec=$("reservation-section");
const phoneIn=$("phone"), emailIn=$("email"), bindBtn=$("bind-btn");
const catWrap=$("category-btns"), treatWrap=$("treatment-btns");
const calWrap=$("calendar"), calLabel=$("cal-label"), prevBtn=$("prev-month"), nextBtn=$("next-month");
const slotsWrap=$("slots-wrap"), submitBtn=$("submit-btn"), recordsWrap=$("records-wrap");

let idToken="", uid="";
let selectedCategory=null, selectedTreatment=null;
let currentMonth=new Date();
let selectedDate=null;
let selectedSlot=null;

const show=el=>el.classList.remove("hidden");
const hide=el=>el.classList.add("hidden");
const showError=msg=>{ errorBox.textContent=msg; show(errorBox); };
const clearError=()=>{ errorBox.textContent=""; hide(errorBox); };

// --- api
const api = async(method,url,body)=>{
  const headers={"Content-Type":"application/json"};
  const res=await fetch(url,{method,headers,body:body?JSON.stringify(body):undefined});
  if(!res.ok) throw new Error(await res.text());
  return res.status===204?null:await res.json().catch(()=>({}));
};

// --- LIFF init
(async()=>{
  try{
    await liff.init({liffId:LIFF_ID,withLoginOnExternalBrowser:true});
    if(!liff.isLoggedIn()){liff.login();return;}
    uid=liff.getDecodedIDToken().sub;
    await checkCustomer();
  }catch(e){ showError("LIFF 初始化失敗"); console.error(e);}
})();

async function checkCustomer(){
  hide(bindSec); hide(resvSec); clearError(); show(loading);
  try{
    const res=await api("POST",CUSTOMER_QUERY_URL,{ "x-purpose":"customer_query","uid":uid});
    res.exists==="true"?initResv():showBind();
  }catch{ showBind(); }
}
function showBind(){ hide(loading); show(bindSec); }
bindBtn.onclick=async()=>{
  clearError();
  const phone=phoneIn.value.trim(), email=emailIn.value.trim();
  if(!/^09\d{8}$/.test(phone)) return showError("手機格式錯誤");
  if(!/^.+@.+\..+$/.test(email)) return showError("Email 格式錯誤");
  try{
    const res=await api("POST",CUSTOMER_BIND_URL,{"x-purpose":"customer_check","uid":uid,phone,email});
    res.exists==="true"?initResv():showError("綁定失敗");
  }catch(e){ showError("綁定失敗"); }
};

function initResv(){
  hide(loading); hide(bindSec); show(resvSec); buildCategory();
}
function buildCategory(){
  catWrap.innerHTML="";
  [...new Set(TREATMENTS.map(t=>t.category))].forEach(cat=>{
    const b=document.createElement("button");
    b.className="m-1 px-3 py-1 rounded bg-teal-500 text-white";
    b.textContent=cat;
    b.onclick=()=>{ selectedCategory=cat; buildTreatments(cat); resetCalendar(); };
    catWrap.appendChild(b);
  });
}
function buildTreatments(cat){
  treatWrap.innerHTML="";
  TREATMENTS.filter(t=>t.category===cat).forEach(tt=>{
    const b=document.createElement("button");
    b.className="m-1 px-3 py-1 rounded bg-green-600 text-white";
    b.textContent=tt.name;
    b.onclick=()=>{ selectedTreatment=tt; resetCalendar(); };
    treatWrap.appendChild(b);
  });
}
function resetCalendar(){
  selectedDate=null; selectedSlot=null; slotsWrap.innerHTML="";
  currentMonth=new Date(); renderCalendar();
}
prevBtn.onclick=()=>{ currentMonth.setMonth(currentMonth.getMonth()-1); renderCalendar(); };
nextBtn.onclick=()=>{ currentMonth.setMonth(currentMonth.getMonth()+1); renderCalendar(); };

function renderCalendar(){
  calWrap.innerHTML="";
  const year=currentMonth.getFullYear(), month=currentMonth.getMonth();
  calLabel.textContent=`${year}-${String(month+1).padStart(2,"0")}`;
  const first=new Date(year,month,1).getDay();
  const days= new Date(year,month+1,0).getDate();
  const today=new Date();
  for(let i=0;i<first;i++){ calWrap.appendChild(blankCell()); }
  for(let d=1;d<=days;d++){
    const cell=document.createElement("button");
    cell.textContent=d;
    cell.className="p-2 rounded";
    const dateObj=new Date(year,month,d);
    const diff=(dateObj-today)/86400000;
    if(diff<0||diff>60){ disable(cell); }
    cell.onclick=()=>{ if(cell.disabled)return; selectedDate=dateObj; queryBusy(); highlightCells(d); };
    calWrap.appendChild(cell);
  }
}
function blankCell(){ const s=document.createElement("div"); return s; }
function disable(btn){ btn.disabled=true; btn.classList.add("text-gray-400"); }
function highlightCells(day){
  [...calWrap.children].forEach(c=>c.classList.remove("bg-yellow-200"));
  const idx=[...calWrap.children].find(c=>c.textContent==day);
  if(idx) idx.classList.add("bg-yellow-200");
}

async function queryBusy(){
  if(!selectedTreatment||!selectedDate) return;
  slotsWrap.innerHTML="查詢中…";
  const dateStr=selectedDate.toISOString().split("T")[0];
  try{
    const res=await api("POST",HOOK_URL,{"x-purpose":"query","date":dateStr});
    const busy=parseBusy(res);
    renderSlots(busy);
  }catch(e){ showError("取得行事曆失敗"); slotsWrap.innerHTML=""; }
}
function parseBusy(data){
  try{
    const obj=Array.isArray(data)?data[0]:data;
    const first=Object.values(obj.calendars)[0];
    return first.busy||[];
  }catch{ return[];}
}
function renderSlots(busyArr){
  slotsWrap.innerHTML="";
  selectedSlot=null;
  const busySet=new Set(busyArr.map(b=>new Date(b.start).getHours()*60+new Date(b.start).getMinutes()));
  // 午休
  for(let m=14*60+30;m<=16*60+29;m+=30){busySet.add(m);}
  const dur=selectedTreatment.duration;
  for(let m=9*60;m<=20*60-dur;m+=30){
    const free=[...busySet].every(st=>!(st>=m && st<m+dur));
    createSlot(m,free);
  }
}
function createSlot(minute,free){
  const hh=String(Math.floor(minute/60)).padStart(2,"0");
  const mm=String(minute%60).padStart(2,"0");
  const b=document.createElement("button");
  b.textContent=`${hh}:${mm}`; b.className="m-1 px-3 py-1 rounded";
  if(free){
    b.classList.add("bg-teal-500","text-white");
    b.onclick=()=>{ selectedSlot=`${hh}:${mm}`; highlightSlot(b); };
  }else{ b.disabled=true; b.classList.add("bg-gray-300","text-gray-500"); }
  slotsWrap.appendChild(b);
}
function highlightSlot(sel){
  [...slotsWrap.children].forEach(c=>c.classList.remove("ring-2","ring-yellow-300"));
  sel.classList.add("ring-2","ring-yellow-300");
}

submitBtn.onclick=async()=>{
  if(!selectedTreatment||!selectedDate||!selectedSlot) return showError("步驟未完成");
  const dateStr=selectedDate.toISOString().split("T")[0];
  const startISO=new Date(`${dateStr}T${selectedSlot}:00`).toISOString();
  const endISO=new Date(new Date(startISO).getTime()+selectedTreatment.duration*60000).toISOString();
  try{
    await api("POST",HOOK_URL,{
      "x-purpose":"create","uid":uid,
      "treatment":selectedTreatment.name,"start":startISO,"end":endISO
    });
    showError("預約成功！");
  }catch{ showError("預約失敗"); }
};
