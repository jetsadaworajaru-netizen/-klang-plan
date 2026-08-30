(()=>{
"use strict";
const $=id=>document.getElementById(id);
const $$=sel=>Array.from(document.querySelectorAll(sel));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const toast=text=>{
  const t=$("toast");
  if(t){t.textContent=text;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
};

let DATA=[];
let stage="ปฐมวัย";
let selectedRecord=null;
let selectedStyle="Modern Government";
let selectedPalette="ฟ้า–ม่วง–ทอง";
let selectedDetail="กระชับพร้อมใช้";

const STAGE_GRADES={
  "ปฐมวัย":["อ.1","อ.2","อ.3"],
  "ประถมศึกษา":["ป.1","ป.2","ป.3","ป.4","ป.5","ป.6"],
  "มัธยมศึกษา":["ม.1","ม.2","ม.3","ม.4","ม.5","ม.6"]
};

function unique(arr){return [...new Set(arr.filter(Boolean))]}
function option(el,val,text=val){const o=document.createElement("option");o.value=val;o.textContent=text;el.appendChild(o)}
function setLoading(el,text="กำลังโหลดข้อมูล..."){if(!el)return;el.innerHTML="";option(el,"",text);el.disabled=true}
function setOptions(el,values,placeholder){
  if(!el)return;
  const old=el.value;
  el.innerHTML=""; option(el,"",placeholder);
  values.forEach(v=>option(el,v));
  el.disabled=false;
  if(values.includes(old))el.value=old
}
function currentGrade(){return $("grade")?.value||""}
function currentSubject(){return $("subject")?.value||""}

function syncStageUI(){
  $$(".stage-tab").forEach(b=>b.classList.toggle("active",b.dataset.stage===stage));
  buildGrades()
}
function buildGrades(){
  const grades=unique(DATA.filter(x=>x.stage===stage).map(x=>x.grade));
  const ordered=(STAGE_GRADES[stage]||[]).filter(x=>grades.includes(x));
  setOptions($("grade"),ordered.length?ordered:grades,"เลือกระดับชั้น");
  if($("gradeCards")){
    $("gradeCards").innerHTML=(ordered.length?ordered:grades).map(g=>`<button type="button" class="grade-card" data-grade-core="${esc(g)}">${esc(g)}</button>`).join("");
    $$("[data-grade-core]").forEach(btn=>btn.onclick=()=>{$("grade").value=btn.dataset.gradeCore;$$("[data-grade-core]").forEach(x=>x.classList.toggle("active",x===btn));buildSubjects()})
  }
  buildSubjects()
}
function buildSubjects(){
  const g=currentGrade();
  const rows=DATA.filter(x=>x.stage===stage&&(!g||x.grade===g));
  const subjects=unique(rows.map(x=>x.subject));
  setOptions($("subject"),subjects,g?"เลือกกลุ่มสาระ / ด้าน":"เลือกระดับชั้นก่อน");
  if(!g)$("subject").disabled=true;
  selectedRecord=null;
  buildIndicators()
}
function indicatorLabel(x){
  return `${x.indicator||x.standard||""}${x.indicator_text?" — "+x.indicator_text:""}`
}
function buildIndicators(filter=""){
  const g=currentGrade(),s=currentSubject();
  let rows=DATA.filter(x=>x.stage===stage&&x.grade===g&&x.subject===s);
  const q=filter.trim().toLowerCase();
  if(q)rows=rows.filter(x=>[x.indicator,x.indicator_text,x.standard,x.domain].some(v=>String(v||"").toLowerCase().includes(q)));
  const el=$("indicator");
  if(!g||!s){setOptions(el,[],"เลือกชั้นและกลุ่มสาระก่อน");el.disabled=true;return}
  el.innerHTML="";option(el,"","เลือกตัวชี้วัด / ความสามารถ");
  rows.slice(0,300).forEach((x,i)=>{const o=document.createElement("option");o.value=String(DATA.indexOf(x));o.textContent=indicatorLabel(x);el.appendChild(o)});
  el.disabled=false;
  renderIndicatorCards(rows)
}
function renderIndicatorCards(rows){
  const box=$("indicatorCards"); if(!box)return;
  box.innerHTML=rows.slice(0,8).map(x=>`<button type="button" class="indicator-card" data-core-indicator="${DATA.indexOf(x)}"><b>${esc(x.indicator||x.standard||"ตัวชี้วัด")}</b><span>${esc(x.indicator_text||"")}</span></button>`).join("");
  $$("[data-core-indicator]").forEach(btn=>btn.onclick=()=>selectIndicator(Number(btn.dataset.coreIndicator)))
}
function selectIndicator(idx){
  selectedRecord=DATA[idx]||null;
  if(!selectedRecord)return;
  if($("indicator"))$("indicator").value=String(idx);
  if($("indicatorBox"))$("indicatorBox").innerHTML=`<b>${esc(selectedRecord.indicator||selectedRecord.standard||"")}</b><br>${esc(selectedRecord.indicator_text||"")}<br><small>${esc(selectedRecord.classification||"")}</small>`;
  $$("[data-core-indicator]").forEach(x=>x.classList.toggle("selected",Number(x.dataset.coreIndicator)===idx));
  updateSummary()
}
function updateSummary(){
  const s=$("summary");if(!s)return;
  const r=selectedRecord;
  const vals=[
    ["ช่วงชั้น",stage],["ระดับชั้น",currentGrade()],["กลุ่มสาระ / ด้าน",currentSubject()],
    ["ตัวชี้วัด",r?.indicator||""],["หน่วย",$("unitName")?.value||""],["เรื่อง",$("topic")?.value||""],
    ["เวลา",$("duration")?.value||""],["รูปแบบ",$("method")?.value||""],["สไตล์",selectedStyle],["โทนสี",selectedPalette]
  ];
  s.innerHTML=vals.filter(x=>x[1]).map(([k,v])=>`<div class="sum-row"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join("")
}
function val(id){return $(id)?.value?.trim()||""}
function buildLessonPrompt(){
  const r=selectedRecord;
  if(!r)return "";
  return `คุณคือผู้เชี่ยวชาญด้านหลักสูตรไทย Instructional Design การจัดการเรียนรู้ และ Educational Graphic Design

สร้าง “แผนการจัดการเรียนรู้” แบบหน้าเดียว ภาษาไทย อ่านง่าย กระชับ แต่ข้อมูลครบ โดยยึดข้อมูลต่อไปนี้ตามจริง

A. ข้อมูลพื้นฐานของแผน
หลักสูตร: ${r.curriculum||r.source_curriculum||""}
ช่วงชั้น: ${stage}
ระดับชั้น: ${r.grade||currentGrade()}
กลุ่มสาระ/ด้าน: ${r.subject||currentSubject()}
สาระ/พัฒนาการ: ${r.domain||"-"}
หน่วยการเรียนรู้: ${val("unitName")||"-"}
เรื่อง: ${val("topic")||"-"}
เวลา: ${val("duration")||"1 ชั่วโมง"}
รูปแบบการจัดการเรียนรู้: ${val("method")||"Active Learning"}
ระดับรายละเอียด: ${selectedDetail}

B. มาตรฐานการเรียนรู้และตัวชี้วัด
มาตรฐาน: ${r.standard||"-"}
ตัวชี้วัด/ความสามารถ: ${r.indicator||"-"}
ข้อความตัวชี้วัด/ความสามารถ: ${r.indicator_text||"-"}
ประเภทตัวชี้วัด: ${r.classification||"-"}

C. ข้อมูลผู้สอน
ชื่อผู้สอน: ${val("teacherName")||"ไม่ระบุ"}
ตำแหน่ง: ${val("teacherPosition")||"ไม่ระบุ"}
โรงเรียน: ${val("schoolName")||"ไม่ระบุ"}
สังกัด: ${val("organization")||"ไม่ระบุ"}
จังหวัด: ${val("province")||"ไม่ระบุ"}
ภาคเรียน/ปีการศึกษา: ${val("semester")||"-"} / ${val("academicYear")||"-"}
จำนวนนักเรียน: ${val("studentCount")||"ไม่ระบุ"}

ข้อกำหนดการออกแบบ
- ชื่อบนชิ้นงานใช้ “แผนการจัดการเรียนรู้”
- จัดเนื้อหาให้อยู่ในหน้าเดียวอย่างสมดุล
- สไตล์: ${selectedStyle}
- โทนสี: ${selectedPalette}
- Typography ภาษาไทยอ่านง่าย
- มีหัวข้อสำคัญ ได้แก่ สาระสำคัญ จุดประสงค์การเรียนรู้ กิจกรรมการเรียนรู้ สื่อ/แหล่งเรียนรู้ และการวัดประเมินผล
- จุดประสงค์ให้สังเคราะห์จากตัวชี้วัด ไม่คัดข้อความตัวชี้วัดซ้ำแบบตรงตัว
- ห้ามสร้างข้อมูลครู โรงเรียน โลโก้ หรือรูปบุคคลที่ไม่ได้ให้มา
- หากผู้ใช้แนบรูปครูหรือโลโก้ภายหลัง ให้ใช้ไฟล์จริงที่แนบเท่านั้น`;
}
function showFinal(prompt){
  if($("promptText"))$("promptText").textContent=prompt;
  if($("promptBox"))$("promptBox").style.display="block";
  if($("afterPromptActions"))$("afterPromptActions").style.display="grid";
  populateContinue();
  $("promptBox")?.scrollIntoView({behavior:"smooth",block:"start"})
}
function generate(){
  if(!currentGrade()){toast("กรุณาเลือกระดับชั้น");return}
  if(!currentSubject()){toast("กรุณาเลือกกลุ่มสาระ / ด้าน");return}
  if(!selectedRecord){toast("กรุณาเลือกตัวชี้วัด");return}
  const p=buildLessonPrompt();showFinal(p);
  try{
    const arr=JSON.parse(localStorage.getItem("klangPlans")||"[]");
    arr.unshift({id:Date.now(),title:val("topic")||selectedRecord.indicator||"แผนการสอน",prompt:p,createdAt:new Date().toISOString()});
    localStorage.setItem("klangPlans",JSON.stringify(arr.slice(0,50)))
  }catch{}
  toast("สร้าง Prompt แล้ว ✓")
}
async function copyPrompt(){
  const p=$("promptText")?.textContent||"";if(!p){toast("ยังไม่มี Prompt");return}
  try{await navigator.clipboard.writeText(p);toast("คัดลอก Prompt แล้ว ✓")}
  catch{toast("กดค้างที่ข้อความเพื่อคัดลอก")}
}
const continueItems=[
  ["worksheet","📝","ใบงาน","สร้างใบงานจากแผนนี้"],
  ["quiz","✅","แบบทดสอบ","ปรนัย/อัตนัย พร้อมเฉลย"],
  ["knowledge","📚","ใบความรู้","สรุปเนื้อหาให้นักเรียน"],
  ["rubric","📊","Rubric","เกณฑ์ประเมินชิ้นงาน/กิจกรรม"],
  ["game","🎮","เกมการเรียนรู้","Kahoot / Quizizz / Wordwall / HTML"],
  ["pack","🎁","Teaching Pack","รวมสื่อการสอนทั้งชุด"]
];
function populateContinue(){
  const box=$("continueTools");if(!box)return;
  box.innerHTML=continueItems.map(x=>`<button type="button" class="continue-tool" data-core-continue="${x[0]}"><span>${x[1]}</span><div class="continue-copy"><b>${x[2]}</b><small>${x[3]}</small></div></button>`).join("");
  $$("[data-core-continue]").forEach(btn=>btn.onclick=()=>makeContinuation(btn.dataset.coreContinue))
}
function makeContinuation(type){
  const base=buildLessonPrompt(); if(!base){toast("กรุณาสร้างแผนก่อน");return}
  const map={
    worksheet:"สร้างใบงานสำหรับนักเรียนจากแผนการสอนนี้ ให้พร้อมพิมพ์ มีคำชี้แจง พื้นที่ตอบ และเฉลยแยกท้ายงาน",
    quiz:"สร้างแบบทดสอบจากแผนการสอนนี้ มีทั้งคำถามและเฉลย โดยระดับความยากเหมาะกับชั้นเรียน",
    knowledge:"สร้างใบความรู้จากแผนการสอนนี้ ภาษาเข้าใจง่าย มีตัวอย่างและสรุปสำคัญ",
    rubric:"สร้าง Rubric ประเมินผลจากกิจกรรมในแผนนี้ ใช้เกณฑ์ชัดเจน 4 ระดับ",
    game:"สร้างเกมการเรียนรู้จากแผนนี้ พร้อมคำถาม กติกา วิธีเล่น และเสนอแพลตฟอร์มที่เหมาะ เช่น Kahoot, Quizizz, Wordwall หรือ HTML/Web",
    pack:"สร้าง Teaching Pack จากแผนนี้ ประกอบด้วย ใบงาน แบบทดสอบ ใบความรู้ Rubric และเกมการเรียนรู้"
  };
  showFinal(`${map[type]||"สร้างสื่อการเรียนรู้ต่อจากแผนนี้"}

ให้ยึดข้อมูลจากแผนเดิมต่อไปนี้ และไม่เปลี่ยนตัวชี้วัด:
---
${base}`);
  toast("สร้าง Prompt ต่อยอดแล้ว ✓")
}

function bindNavigation(){
  $$("[data-app-nav]").forEach(btn=>btn.addEventListener("click",e=>{
    e.preventDefault();
    const target=btn.dataset.appNav;
    const map={generator:"generatorView",plans:"plansView",indicators:"indicatorsView",styles:"stylesView",guide:"guideView",help:"helpView"};
    const id=map[target];if(!id)return;
    $$(".view").forEach(v=>v.classList.remove("active"));
    $(id)?.classList.add("active");
    $$("[data-app-nav]").forEach(x=>x.classList.toggle("active",x.dataset.appNav===target));
    window.scrollTo({top:0,behavior:"smooth"})
  },true))
}
function bindUI(){
  $$(".stage-tab").forEach(btn=>btn.addEventListener("click",e=>{e.preventDefault();stage=btn.dataset.stage;syncStageUI()},true));
  $("grade")?.addEventListener("change",buildSubjects,true);
  $("subject")?.addEventListener("change",()=>buildIndicators(),true);
  $("indicator")?.addEventListener("change",e=>{const idx=Number(e.target.value);if(Number.isFinite(idx))selectIndicator(idx)},true);
  $("indicatorSearch")?.addEventListener("input",e=>buildIndicators(e.target.value));
  $("generateBtn")?.addEventListener("click",e=>{e.preventDefault();generate()},true);
  $("copyPrompt")?.addEventListener("click",copyPrompt,true);
  $("copyPromptBottom")?.addEventListener("click",copyPrompt,true);
  $$("[data-detail]").forEach(b=>b.addEventListener("click",()=>{selectedDetail=b.dataset.detail;$$("[data-detail]").forEach(x=>x.classList.toggle("active",x===b));updateSummary()},true));
  $$("[data-style]").forEach(b=>b.addEventListener("click",()=>{selectedStyle=b.querySelector("b")?.textContent?.trim()||b.dataset.style;$$("[data-style]").forEach(x=>x.classList.toggle("selected",x===b));updateSummary()},true));
  $$("[data-color-pair]").forEach(b=>b.addEventListener("click",()=>{selectedPalette=b.dataset.colorPair;$$("[data-color-pair]").forEach(x=>x.classList.toggle("active",x===b));updateSummary()},true));
  ["unitName","topic","duration","method","teacherName","teacherPosition","schoolName","organization","province","semester","academicYear","studentCount"].forEach(id=>$(id)?.addEventListener("input",updateSummary));
  bindNavigation();

  $$("[data-destination-tab]").forEach(btn=>btn.onclick=()=>{
    const tab=btn.dataset.destinationTab;
    $$("[data-destination-tab]").forEach(x=>x.classList.toggle("active",x===btn));
    $("destinationAI")?.classList.toggle("active",tab==="ai");
    $("destinationDocument")?.classList.toggle("active",tab==="document")
  });
  const links={chatgpt:"https://chatgpt.com/",gemini:"https://gemini.google.com/",claude:"https://claude.ai/",canva:"https://www.canva.com/"};
  $$("[data-ai-launch]").forEach(btn=>btn.onclick=async()=>{await copyPrompt();window.open(links[btn.dataset.aiLaunch]||"#","_blank","noopener")});
}
async function loadData(){
  setLoading($("grade"));setLoading($("subject"));setLoading($("indicator"));
  try{
    const r=await fetch("data.json?v=860",{cache:"no-store"});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    DATA=await r.json();
    if(!Array.isArray(DATA)||!DATA.length)throw new Error("ฐานข้อมูลว่าง");
    document.documentElement.dataset.coreReady="1";
    syncStageUI();
    toast("ระบบพร้อมใช้งาน ✓")
  }catch(err){
    console.error("Klang member core:",err);
    [$("grade"),$("subject"),$("indicator")].forEach(el=>{if(el){el.innerHTML="<option>โหลดข้อมูลไม่สำเร็จ</option>";el.disabled=true}});
    if($("indicatorBox"))$("indicatorBox").innerHTML="<b>โหลดข้อมูลหลักสูตรไม่สำเร็จ</b><br>กรุณารีเฟรชหน้าเว็บ";
    toast("โหลดข้อมูลหลักสูตรไม่สำเร็จ")
  }
}
function start(){
  bindUI();
  populateContinue();
  loadData()
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();