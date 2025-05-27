
const LIFF_ID = "2007485366-aYAOy7rB";
const HOOK_URL = "https://hook.us2.make.com/ebcwlrk0t5woz18qxhbq137tpiggst9p";
const CUSTOMER_QUERY_URL = "https://run.mocky.io/v3/35ae2952-0a29-4c26-b829-1e8484d64c20";
const CUSTOMER_BIND_URL  = "https://run.mocky.io/v3/169f768e-227a-4276-81c8-3100d7452ce5";
const MAX_RANGE = 90; // 天

// Static treatments (subset for brevity)
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

// DOM
const $=id=>document.getElementById(id);
const loading=$("loading"),errorBox=$("error-msg"),bindSec=$("binding-section"),resvSec=$("reservation-section");
const phoneIn=$("phone"),emailIn=$("email"),bindBtn=$("bind-btn");
const categoryWrap=$("category-btns"),treatWrap=$("treatment-btns");
const stepTreatment=$("step-treatment"),stepDate=$("step-date"),stepSlot=$("step-slot");
const calWrap=$("calendar"),calLabel=$("cal-label"),prevBtn=$("prev-month"),nextBtn=$("next-month");
const slotsWrap=$("slots-wrap"),submitBtn=$("submit-btn");

let uid="",selectedCategory=null,selectedTreatment=null,selectedDate=null,selectedSlot=null;
let currentMonth=new Date();

// helpers
const show=el=>el.classList.remove("hidden");
const hide=el=>el.classList.add("hidden");
const clearErr=()=>{errorBox.textContent=""; errorBox.classList.add("hidden")};
const err=msg=>{errorBox.textContent=msg; errorBox.classList.remove("hidden")};

const api=async(body)=>{
 const res=await fetch(HOOK_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
 if(!res.ok) throw new Error(await res.text()); return res.json();
};

// LIFF init
(async()=>{
 await liff.init({liffId:LIFF_ID,withLoginOnExternalBrowser:true});
 if(!liff.isLoggedIn()){liff.login();return;}
 uid=liff.getDecodedIDToken().sub;
 await checkCustomer();
})();

async function checkCustomer(){
 loading.classList.remove("hidden");
 try{
   const r=await fetch(CUSTOMER_QUERY_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({"x-purpose":"customer_query","uid":uid})}).then(r=>r.json());
   loading.classList.add("hidden");
   if(r.exists==="true") initUI(); else bindSec.classList.remove("hidden");
 }catch{err("初始化失敗");}
}

bindBtn.onclick=async()=>{
 clearErr();
 if(!/^09\d{8}$/.test(phoneIn.value)) return err("手機錯誤");
 if(!/^.+@.+\..+$/.test(emailIn.value)) return err("Email錯誤");
 const r=await fetch(CUSTOMER_BIND_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({"x-purpose":"customer_check","uid":uid,"phone":phoneIn.value,"email":emailIn.value})}).then(r=>r.json());
 if(r.exists==="true") initUI(); else err("綁定失敗");
};

function initUI(){
 bindSec.classList.add("hidden"); resvSec.classList.remove("hidden");
 buildCategory();
}

function buildCategory(){
 categoryWrap.innerHTML="";
 [...new Set(TREATMENTS.map(t=>t.category))].forEach(cat=>{
   const b=document.createElement("button"); b.textContent=cat; b.className="chip m-1 px-3 py-1 rounded";
   b.onclick=()=>{selectedCategory=cat; highlight(b,categoryWrap); buildTreatments();};
   categoryWrap.appendChild(b);
 });
}

function buildTreatments(){
 treatWrap.innerHTML=""; stepTreatment.classList.remove("hidden");
 TREATMENTS.filter(t=>t.category===selectedCategory).forEach(t=>{
   const b=document.createElement("button"); b.textContent=t.name; b.className="chip m-1 px-3 py-1 rounded";
   b.onclick=()=>{selectedTreatment=t; highlight(b,treatWrap); stepDate.classList.remove("hidden"); renderCalendar();};
   treatWrap.appendChild(b);
 });
}

function highlight(btn,wrap){[...wrap.children].forEach(x=>x.classList.remove("chip-selected"));btn.classList.add("chip-selected");}

prevBtn.onclick=()=>{currentMonth.setMonth(currentMonth.getMonth()-1); renderCalendar();};
nextBtn.onclick=()=>{currentMonth.setMonth(currentMonth.getMonth()+1); renderCalendar();};

function renderCalendar(){
 calWrap.innerHTML=""; selectedDate=null; slotsWrap.innerHTML=""; stepSlot.classList.add("hidden"); submitBtn.classList.add("hidden");
 const y=currentMonth.getFullYear(),m=currentMonth.getMonth();
 calLabel.textContent=`${y}-${String(m+1).padStart(2,"0")}`;
 const first=new Date(y,m,1).getDay(); const days=new Date(y,m+1,0).getDate();
 const today=new Date(); today.setHours(0,0,0,0);
 [...Array(first)].forEach(()=>calWrap.appendChild(document.createElement("div")));
 for(let d=1;d<=days;d++){
  const cell=document.createElement("button"); cell.textContent=d; cell.className="p-2 rounded";
  const date=new Date(y,m,d); const diff=(date-today)/86400000;
  if(diff<0||diff>MAX_RANGE) disable(cell);
  cell.onclick=()=>{ if(cell.disabled)return; selectedDate=date; highlight(cell,calWrap); queryBusy();};
  calWrap.appendChild(cell);
 }
}

function disable(el){el.disabled=true;el.classList.add("text-gray-400");}

async function queryBusy(){
 stepSlot.classList.add("hidden"); slotsWrap.innerHTML="查詢中…";
 const dateStr=selectedDate.toISOString().split("T")[0];
 const res=await api({"x-purpose":"query","date":dateStr});
 const busy=parseBusy(res); renderSlots(busy);
}

function parseBusy(data){try{const cal=Object.values(Array.isArray(data)?data[0].calendars:data.calendars)[0];return cal.busy||[]}catch{return[]}}

function renderSlots(busy){
 slotsWrap.innerHTML=""; selectedSlot=null;
 const busySet=new Set(busy.map(b=>{const d=new Date(b.start);return d.getHours()*60+d.getMinutes()}));
 for(let m=9*60;m<=20*60-selectedTreatment.duration;m+=30){
   if(m>=14*60&&m<16*60) continue; // skip 14:00-15:59
   const ok=[...busySet].every(t=>!(t>=m && t<m+selectedTreatment.duration));
   makeSlot(m,ok);
 }
 stepSlot.classList.remove("hidden");
}

function makeSlot(min,ok){
 const hh=String(Math.floor(min/60)).padStart(2,"0"); const mm=String(min%60).padStart(2,"0");
 const b=document.createElement("button"); b.textContent=`${hh}:${mm}`; b.className="m-1 px-3 py-1 rounded";
 if(ok){b.classList.add("bg-emerald-600","text-white"); b.onclick=()=>{selectedSlot=`${hh}:${mm}`; highlight(b,slotsWrap); submitBtn.classList.remove("hidden");};}
 else{b.disabled=true;b.classList.add("bg-gray-300","text-gray-500");}
 slotsWrap.appendChild(b);
}

submitBtn.onclick=async()=>{
 if(!selectedSlot) return;
 const dateStr=selectedDate.toISOString().split("T")[0];
 const startISO=new Date(`${dateStr}T${selectedSlot}:00`).toISOString();
 const endISO=new Date(new Date(startISO).getTime()+selectedTreatment.duration*60000).toISOString();
 await api({"x-purpose":"create","uid":uid,"treatment":selectedTreatment.name,"start":startISO,"end":endISO});
 err("預約成功！");
};
