(()=>{"use strict";
const $=id=>document.getElementById(id), $$=s=>[...document.querySelectorAll(s)];
const CFG=window.KLANG_CONFIG||{};
let sb=null,user=null,profile=null,DATA=[],stage="ปฐมวัย",selected=null,style="Modern Government",palette="ฟ้า–ม่วง–ทอง";
const styles=["Modern Government","Premium Academic","Clean Infographic","Bright Classroom","Cute Kids","3D Education","Minimal Professional","Thai Contemporary"];
const palettes=["ฟ้า–ม่วง–ทอง","กรมท่า–ทอง","มิ้นต์–ฟ้า","ส้ม–ครีม","ชมพู–ฟ้า","เขียว–ทอง"];
const gradeOrder={"ปฐมวัย":["อ.1","อ.2","อ.3"],"ประถมศึกษา":["ป.1","ป.2","ป.3","ป.4","ป.5","ป.6"],"มัธยมศึกษา":["ม.1","ม.2","ม.3","ม.4","ม.5","ม.6"]};
const unique=a=>[...new Set(a.filter(Boolean))], esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(t){const x=$("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
function avatar(v){const p={"avatar:teacher":"👩‍🏫","avatar:teacher_male":"👨‍🏫","avatar:book":"📚","avatar:star":"⭐"};if(p[v])return p[v];if(v?.startsWith("data:image/"))return `<img src="${v}" alt="">`;return "👤"}
async function auth(){
  if(!window.supabase||!CFG.supabaseUrl||!(CFG.supabasePublishableKey||CFG.supabaseAnonKey)){location.replace("/teacher.html");return false}
  sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabasePublishableKey||CFG.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,storageKey:"klang-member-auth"}});
  const {data}=await sb.auth.getSession(); if(!data?.session){location.replace("/teacher.html");return false}
  user=data.session.user;
  const {data:p}=await sb.from("profiles").select("id,full_name,school_name,avatar_url,role,status,member_id").eq("id",user.id).maybeSingle();
  if(!p||p.role!=="member"||p.status!=="active"){await sb.auth.signOut();location.replace("/teacher.html");return false}
  profile=p;renderProfile();return true
}
function renderProfile(){$("profileName").textContent=profile.full_name||"โปรไฟล์";$("profileMemberId").textContent=profile.member_id||"สมาชิก";$("profileAvatar").innerHTML=avatar(profile.avatar_url);$("profileAvatarLarge").innerHTML=avatar(profile.avatar_url);$("profileIdText").textContent=profile.member_id||"สมาชิก";$("profileDisplayName").value=profile.full_name||"";$("profileSchool").value=profile.school_name||""}
async function loadData(){const r=await fetch("/data.json?v=870",{cache:"no-store"});if(!r.ok)throw new Error("data "+r.status);DATA=await r.json();buildGrades();renderLibrary(DATA.slice(0,30));renderStyles();updateSummary()}
function opt(el,val,text=val){const o=document.createElement("option");o.value=val;o.textContent=text;el.appendChild(o)}
function setOpts(el,vals,ph){el.innerHTML="";opt(el,"",ph);vals.forEach(v=>opt(el,v));el.disabled=false}
function buildGrades(){const avail=unique(DATA.filter(x=>x.stage===stage).map(x=>x.grade));const arr=(gradeOrder[stage]||[]).filter(x=>avail.includes(x));setOpts($("grade"),arr.length?arr:avail,"เลือกระดับชั้น");setOpts($("subject"),[],"เลือกระดับชั้นก่อน");$("subject").disabled=true;setOpts($("indicator"),[],"เลือกชั้นและกลุ่มสาระก่อน");$("indicator").disabled=true}
function buildSubjects(){const g=$("grade").value;if(!g){buildGrades();return}const vals=unique(DATA.filter(x=>x.stage===stage&&x.grade===g).map(x=>x.subject));setOpts($("subject"),vals,"เลือกกลุ่มสาระ / ด้าน");setOpts($("indicator"),[],"เลือกกลุ่มสาระก่อน");$("indicator").disabled=true;selected=null;updateSummary()}
function filteredIndicators(){const g=$("grade").value,s=$("subject").value,q=$("indicatorSearch").value.trim().toLowerCase();return DATA.filter(x=>x.stage===stage&&x.grade===g&&x.subject===s&&(!q||[x.indicator,x.indicator_text,x.standard,x.domain].some(v=>String(v||"").toLowerCase().includes(q))))}
function buildIndicators(){if(!$("grade").value||!$("subject").value)return;const rows=filteredIndicators();$("indicator").innerHTML="";opt($("indicator"),"","เลือกตัวชี้วัด / ความสามารถ");rows.forEach(x=>{const o=document.createElement("option");o.value=String(DATA.indexOf(x));o.textContent=`${x.indicator||x.standard||""}${x.indicator_text?" — "+x.indicator_text:""}`;$("indicator").appendChild(o)});$("indicator").disabled=false}
function chooseIndicator(){const i=Number($("indicator").value);selected=Number.isFinite(i)?DATA[i]:null;$("indicatorPreview").innerHTML=selected?`<b>${esc(selected.indicator||selected.standard||"")}</b><br>${esc(selected.indicator_text||"")}<br><small>${esc(selected.classification||"")}</small>`:"เลือกตัวชี้วัดเพื่อดูรายละเอียด";updateSummary()}
function renderStyles(){const mk=(box,arr,key)=>{$(box).innerHTML=arr.map(v=>`<button type="button" class="choice-btn ${v===(key==="style"?style:palette)?"active":""}" data-${key}="${esc(v)}"><b>${esc(v)}</b></button>`).join("")};mk("styleGrid",styles,"style");mk("stylesLibrary",styles,"style");mk("paletteGrid",palettes,"palette");mk("palettesLibrary",palettes,"palette");$$("[data-style]").forEach(b=>b.onclick=()=>{style=b.dataset.style;renderStyles();updateSummary()});$$("[data-palette]").forEach(b=>b.onclick=()=>{palette=b.dataset.palette;renderStyles();updateSummary()})}
function updateSummary(){const vals=[["ช่วงชั้น",stage],["ชั้น",$("grade")?.value],["กลุ่มสาระ",$("subject")?.value],["ตัวชี้วัด",selected?.indicator],["หน่วย",$("unitName")?.value],["เรื่อง",$("topic")?.value],["สไตล์",style],["สี",palette]];$("summary").innerHTML=vals.filter(x=>x[1]).map(x=>`<div class="sum"><b>${x[0]}</b><span>${esc(x[1])}</span></div>`).join("")}
function v(id){return $(id).value.trim()}
function prompt(){if(!selected)return"";return `คุณคือผู้เชี่ยวชาญด้านหลักสูตรไทย Instructional Design การจัดการเรียนรู้ และ Educational Graphic Design

สร้าง “แผนการจัดการเรียนรู้” แบบหน้าเดียว ภาษาไทย อ่านง่าย กระชับ และข้อมูลครบ

A. ข้อมูลพื้นฐานของแผน
หลักสูตร: ${selected.curriculum||"หลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พ.ศ. 2551 (รวมฉบับปรับปรุง พ.ศ. 2560)"}
ช่วงชั้น: ${stage}
ระดับชั้น: ${selected.grade}
กลุ่มสาระ/ด้าน: ${selected.subject}
สาระ/พัฒนาการ: ${selected.domain||"-"}
หน่วยการเรียนรู้: ${v("unitName")||"-"}
เรื่อง: ${v("topic")||"-"}
เวลา: ${v("duration")||"1 ชั่วโมง"}
รูปแบบการจัดการเรียนรู้: ${v("method")||"Active Learning"}

B. มาตรฐานการเรียนรู้และตัวชี้วัด
มาตรฐาน: ${selected.standard||"-"}
ตัวชี้วัด/ความสามารถ: ${selected.indicator||"-"}
ข้อความตัวชี้วัด/ความสามารถ: ${selected.indicator_text||"-"}
ประเภทตัวชี้วัด: ${selected.classification||"-"}

C. ข้อมูลผู้สอน
ชื่อผู้สอน: ${v("teacherName")||"ไม่ระบุ"}
ตำแหน่ง: ${v("teacherPosition")||"ไม่ระบุ"}
โรงเรียน: ${v("schoolName")||"ไม่ระบุ"}
สังกัด: ${v("organization")||"ไม่ระบุ"}
จังหวัด: ${v("province")||"ไม่ระบุ"}
จำนวนนักเรียน: ${v("studentCount")||"ไม่ระบุ"}

ข้อกำหนด
- ชื่อชิ้นงานใช้ “แผนการจัดการเรียนรู้”
- จัดข้อมูลให้อยู่ในหน้าเดียว
- สไตล์: ${style}
- โทนสี: ${palette}
- มีสาระสำคัญ จุดประสงค์ กิจกรรมการเรียนรู้ สื่อ/แหล่งเรียนรู้ และการวัดประเมินผล
- จุดประสงค์ต้องสังเคราะห์จากตัวชี้วัด ไม่คัดข้อความซ้ำตรงตัว
- Typography ภาษาไทยอ่านง่าย
- ห้ามสร้างรูปครูหรือโลโก้ที่ผู้ใช้ไม่ได้แนบ`}
async function copy(){const t=$("promptText").textContent;if(!t)return toast("ยังไม่มี Prompt");try{await navigator.clipboard.writeText(t);toast("คัดลอกแล้ว ✓")}catch{toast("กดค้างที่ Prompt เพื่อคัดลอก")}}
function saveWork(t){try{let a=JSON.parse(localStorage.getItem("klang-clean-work")||"[]");a.unshift({id:Date.now(),title:v("topic")||selected.indicator||"แผนการสอน",prompt:t,date:new Date().toISOString()});localStorage.setItem("klang-clean-work",JSON.stringify(a.slice(0,40)));renderWork()}catch{}}
function generate(){if(!$("grade").value)return toast("กรุณาเลือกระดับชั้น");if(!$("subject").value)return toast("กรุณาเลือกกลุ่มสาระ");if(!selected)return toast("กรุณาเลือกตัวชี้วัด");const t=prompt();$("promptText").textContent=t;$("promptWrap").hidden=false;saveWork(t);renderContinue();setTimeout(()=>$("promptWrap").scrollIntoView({behavior:"smooth"}),50);toast("สร้าง Prompt แล้ว ✓")}
function renderContinue(){const items=[["worksheet","📝","ใบงาน"],["quiz","✅","แบบทดสอบ"],["knowledge","📚","ใบความรู้"],["rubric","📊","Rubric"],["game","🎮","เกม"],["pack","🎁","Teaching Pack"]];$("continueGrid").innerHTML=items.map(x=>`<button type="button" data-continue="${x[0]}"><span>${x[1]}</span><b>${x[2]}</b></button>`).join("");$$("[data-continue]").forEach(b=>b.onclick=()=>continuation(b.dataset.continue))}
function continuation(type){const base=prompt();const intro={worksheet:"สร้างใบงานจากแผนนี้ พร้อมคำชี้แจง พื้นที่ตอบ และเฉลย",quiz:"สร้างแบบทดสอบจากแผนนี้ พร้อมเฉลย",knowledge:"สร้างใบความรู้จากแผนนี้ ภาษาเข้าใจง่าย",rubric:"สร้าง Rubric 4 ระดับจากแผนนี้",game:"สร้างเกมการเรียนรู้จากแผนนี้ พร้อมกติกา คำถาม และแพลตฟอร์มที่เหมาะ",pack:"สร้าง Teaching Pack จากแผนนี้ ประกอบด้วย ใบงาน แบบทดสอบ ใบความรู้ Rubric และเกม"};$("promptText").textContent=`${intro[type]}

ให้ยึดข้อมูลเดิมต่อไปนี้ และห้ามเปลี่ยนตัวชี้วัด:
---
${base}`;$("promptWrap").scrollIntoView({behavior:"smooth"});toast("สร้าง Prompt ต่อยอดแล้ว")}
function switchTab(name){$$(".page").forEach(x=>x.classList.toggle("active",x.id===`tab-${name}`));$$(".top-tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===name));$$("[data-bottom-tab]").forEach(x=>x.classList.toggle("active",x.dataset.bottomTab===name));if(name==="work")renderWork();window.scrollTo({top:0,behavior:"smooth"})}
function renderWork(){let a=[];try{a=JSON.parse(localStorage.getItem("klang-clean-work")||"[]")}catch{};$("workList").innerHTML=a.map(x=>`<article class="list-item"><b>${esc(x.title)}</b><small>${new Date(x.date).toLocaleString("th-TH")}</small><button type="button" class="secondary-btn" data-work="${x.id}">เปิด Prompt</button></article>`).join("")||'<div class="list-item">ยังไม่มีงานที่บันทึก</div>';$$("[data-work]").forEach(b=>b.onclick=()=>{const x=a.find(i=>i.id==b.dataset.work);if(x){switchTab("create");$("promptText").textContent=x.prompt;$("promptWrap").hidden=false;$("promptWrap").scrollIntoView({behavior:"smooth"})}})}
function renderLibrary(rows){$("libraryList").innerHTML=rows.slice(0,60).map(x=>`<article class="list-item"><b>${esc(x.indicator||x.standard||"ตัวชี้วัด")}</b><div>${esc(x.indicator_text||"")}</div><small>${esc(x.stage||"")} · ${esc(x.grade||"")} · ${esc(x.subject||"")}</small></article>`).join("")}
async function sendHelp(){const msg=v("helpMessage");if(!msg)return $("helpStatus").innerHTML='<div class="error-box">กรุณาพิมพ์รายละเอียด</div>';const {error}=await sb.from("member_support_messages").insert({user_id:user.id,message_type:$("helpType").value,subject:v("helpSubject")||null,message:msg});if(error)return $("helpStatus").innerHTML=`<div class="error-box">${esc(error.message)}</div>`;$("helpSubject").value="";$("helpMessage").value="";$("helpStatus").innerHTML='<div class="indicator-preview">ส่งถึง Admin แล้ว ✓</div>'}
function openProfile(){$("profileModal").hidden=false;renderProfile()}
function closeProfile(){$("profileModal").hidden=true}
async function compress(file){return new Promise((res,rej)=>{const rd=new FileReader(),im=new Image();rd.onload=()=>im.src=rd.result;rd.onerror=rej;im.onload=()=>{const c=document.createElement("canvas"),n=256;c.width=c.height=n;const s=Math.min(im.width,im.height),x=(im.width-s)/2,y=(im.height-s)/2;c.getContext("2d").drawImage(im,x,y,s,s,0,0,n,n);res(c.toDataURL("image/jpeg",.78))};im.onerror=rej;rd.readAsDataURL(file)})}
function bind(){
  $$(".stage-btn").forEach(b=>b.onclick=()=>{stage=b.dataset.stage;$$(".stage-btn").forEach(x=>x.classList.toggle("active",x===b));buildGrades();updateSummary()});
  $("grade").onchange=buildSubjects;$("subject").onchange=buildIndicators;$("indicatorSearch").oninput=buildIndicators;$("indicator").onchange=chooseIndicator;
  ["unitName","topic","duration","method","teacherName","teacherPosition","schoolName","organization","province","studentCount"].forEach(id=>$(id).oninput=updateSummary);
  $("generateBtn").onclick=generate;$("copyPromptBtn").onclick=copy;
  $$(".top-tab").forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));$$("[data-bottom-tab]").forEach(b=>b.onclick=()=>switchTab(b.dataset.bottomTab));
  $$("[data-scroll]").forEach(b=>b.onclick=()=>document.getElementById(b.dataset.scroll)?.scrollIntoView({behavior:"smooth",block:"start"}));
  $("librarySearch").oninput=e=>{const q=e.target.value.toLowerCase().trim();renderLibrary(DATA.filter(x=>!q||[x.indicator,x.indicator_text,x.standard,x.subject,x.grade].some(v=>String(v||"").toLowerCase().includes(q))))};
  $$("[data-help-type]").forEach(b=>b.onclick=()=>{$$(" [data-help-type]".trim()).forEach(x=>x.classList.toggle("active",x===b));$("helpType").value=b.dataset.helpType});$("sendHelpBtn").onclick=sendHelp;
  $("profileBtn").onclick=openProfile;$("closeProfileBtn").onclick=closeProfile;$("profileBackdrop").onclick=closeProfile;
  $$("[data-avatar]").forEach(b=>b.onclick=()=>{profile.avatar_url=b.dataset.avatar;renderProfile()});
  $("profilePhoto").onchange=async e=>{const f=e.target.files?.[0];if(f){profile.avatar_url=await compress(f);renderProfile()}};
  $("saveProfileBtn").onclick=async()=>{const payload={full_name:v("profileDisplayName"),school_name:v("profileSchool")||null,avatar_url:profile.avatar_url||null};const {error}=await sb.from("profiles").update(payload).eq("id",user.id);if(error)return $("profileStatus").innerHTML=`<div class="error-box">${esc(error.message)}</div>`;Object.assign(profile,payload);renderProfile();$("profileStatus").innerHTML='<div class="indicator-preview">บันทึกแล้ว ✓</div>'};
  $("logoutBtn").onclick=async()=>{await sb.auth.signOut();location.replace("/teacher.html")};
  $$(".dest-tab").forEach(b=>b.onclick=()=>{$$(".dest-tab").forEach(x=>x.classList.toggle("active",x===b));$$(".dest-panel").forEach(x=>x.classList.toggle("active",x.id===`dest-${b.dataset.dest}`))});
  $$("[data-open]").forEach(b=>b.onclick=async()=>{await copy();window.open(b.dataset.open,"_blank","noopener")});
  $("openWordBtn").onclick=async()=>{await copy();window.open("https://www.office.com/launch/word","_blank","noopener")};
  $("savePdfBtn").onclick=()=>{const t=$("promptText").textContent;if(!t)return toast("ยังไม่มี Prompt");const w=window.open("","_blank");if(!w)return;w.document.write(`<html><head><meta charset="utf-8"><title>Klang Plan Prompt</title><style>body{font-family:Arial;padding:28px;line-height:1.7}pre{white-space:pre-wrap}</style></head><body><h2>Klang Plan — Prompt</h2><pre>${esc(t)}</pre><script>setTimeout(()=>print(),250)<\/script></body></html>`);w.document.close()}
}
async function start(){try{const ok=await auth();if(!ok)return;bind();await loadData();$("loadingGate").classList.add("hidden");$("appShell").classList.remove("is-loading")}catch(e){console.error(e);$("loadingGate").innerHTML=`<div class="error-box"><b>เปิดระบบไม่สำเร็จ</b><br>${esc(e.message)}<br><br><button onclick="location.reload()" class="secondary-btn">ลองใหม่</button></div>`}}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start,{once:true}):start();
})();