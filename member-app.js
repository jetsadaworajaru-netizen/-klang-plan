(()=>{"use strict";
const $=id=>document.getElementById(id), $$=s=>[...document.querySelectorAll(s)];
const CFG=window.KLANG_CONFIG||{};
let sb=null,user=null,profile=null,DATA=[],stage="ปฐมวัย",selected=null,librarySelected=null,style="Modern Government",palette="ฟ้า–ม่วง–ทอง";
const styleMeta={
"Modern Government":["ทางการสมัยใหม่","หัวข้อชัด • กล่องข้อมูลเป็นระเบียบ • ใช้ได้กับเอกสารโรงเรียน","government"],
"Premium Academic":["วิชาการพรีเมียม","เรียบหรู • เน้นลำดับข้อมูล • เหมาะกับ PA/ผลงานวิชาการ","premium"],
"Clean Infographic":["อินโฟกราฟิกสะอาด","อ่านเร็ว • แบ่ง Section ชัด • ใช้ไอคอนพอดี","info"],
"Bright Classroom":["ห้องเรียนสดใส","สีสว่าง • เป็นมิตร • เหมาะกับแผนประถม","bright"],
"Cute Kids":["น่ารักสำหรับเด็ก","องค์ประกอบอ่อนโยน • สนุก • เหมาะปฐมวัย/ประถมต้น","cute"],
"3D Education":["3D Education","ไอคอนและวัตถุการศึกษา 3D • ทันสมัย • มีมิติ","threeD"],
"Minimal Professional":["มินิมอลมืออาชีพ","พื้นที่โปร่ง • เน้นตัวอักษร • พิมพ์เอกสารง่าย","minimal"],
"Thai Contemporary":["ไทยร่วมสมัย","ลายไทยประยุกต์แบบบาง • สุภาพ • เอกลักษณ์ไทย","thai"]
};
const styles=Object.keys(styleMeta);
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
async function loadData(){const r=await fetch("/data.json?v=870",{cache:"no-store"});if(!r.ok)throw new Error("data "+r.status);DATA=await r.json();buildGrades();updateLibraryFilters();renderStyles();updateSummary()}
function opt(el,val,text=val){const o=document.createElement("option");o.value=val;o.textContent=text;el.appendChild(o)}
function setOpts(el,vals,ph){el.innerHTML="";opt(el,"",ph);vals.forEach(v=>opt(el,v));el.disabled=false}
function buildGrades(){const avail=unique(DATA.filter(x=>x.stage===stage).map(x=>x.grade));const arr=(gradeOrder[stage]||[]).filter(x=>avail.includes(x));setOpts($("grade"),arr.length?arr:avail,"เลือกระดับชั้น");setOpts($("subject"),[],"เลือกระดับชั้นก่อน");$("subject").disabled=true;setOpts($("indicator"),[],"เลือกชั้นและกลุ่มสาระก่อน");$("indicator").disabled=true}
function buildSubjects(){const g=$("grade").value;if(!g){buildGrades();return}const vals=unique(DATA.filter(x=>x.stage===stage&&x.grade===g).map(x=>x.subject));setOpts($("subject"),vals,"เลือกกลุ่มสาระ / ด้าน");setOpts($("indicator"),[],"เลือกกลุ่มสาระก่อน");$("indicator").disabled=true;selected=null;updateSummary()}
function filteredIndicators(){const g=$("grade").value,s=$("subject").value,q=$("indicatorSearch").value.trim().toLowerCase();return DATA.filter(x=>x.stage===stage&&x.grade===g&&x.subject===s&&(!q||[x.indicator,x.indicator_text,x.standard,x.domain].some(v=>String(v||"").toLowerCase().includes(q))))}
function buildIndicators(){if(!$("grade").value||!$("subject").value)return;const rows=filteredIndicators();$("indicator").innerHTML="";opt($("indicator"),"","เลือกตัวชี้วัด / ความสามารถ");rows.forEach(x=>{const o=document.createElement("option");o.value=String(DATA.indexOf(x));o.textContent=`${x.indicator||x.standard||""}${x.indicator_text?" — "+x.indicator_text:""}`;$("indicator").appendChild(o)});$("indicator").disabled=false}
function chooseIndicator(){const i=Number($("indicator").value);selected=Number.isFinite(i)?DATA[i]:null;$("indicatorPreview").innerHTML=selected?`<b>${esc(selected.indicator||selected.standard||"")}</b><br>${esc(selected.indicator_text||"")}<br><small>${esc(selected.classification||"")}</small>`:"เลือกตัวชี้วัดเพื่อดูรายละเอียด";updateSummary()}
function styleCard(v){
  const m=styleMeta[v]||[v,"","minimal"];
  return `<button type="button" class="style-preview-card ${v===style?"active":""}" data-style="${esc(v)}">
    <div class="mini-plan ${m[2]}">
      <div class="mini-title"></div>
      <div class="mini-sub"></div>
      <div class="mini-grid"><i></i><i></i><i></i><i></i></div>
      <div class="mini-footer"></div>
    </div>
    <div class="style-preview-copy"><b>${esc(m[0])}</b><small>${esc(m[1])}</small><em>${esc(v)}</em></div>
  </button>`
}
function renderStyles(){
  $("styleGrid").innerHTML=styles.map(styleCard).join("");
  $("stylesLibrary").innerHTML=styles.map(styleCard).join("");
  const mkPalette=box=>$(box).innerHTML=palettes.map(v=>`<button type="button" class="choice-btn ${v===palette?"active":""}" data-palette="${esc(v)}"><b>${esc(v)}</b></button>`).join("");
  mkPalette("paletteGrid");mkPalette("palettesLibrary");
  $$("[data-style]").forEach(b=>b.onclick=()=>{style=b.dataset.style;renderStyles();updateSummary()});
  $$("[data-palette]").forEach(b=>b.onclick=()=>{palette=b.dataset.palette;renderStyles();updateSummary()})
}
function updateSummary(){const vals=[["ช่วงชั้น",stage],["ชั้น",$("grade")?.value],["กลุ่มสาระ",$("subject")?.value],["ตัวชี้วัด",selected?.indicator],["หน่วย",$("unitName")?.value],["เรื่อง",$("topic")?.value],["ภาคเรียน",$("semester")?.value],["ปีการศึกษา",$("academicYear")?.value],["วันที่สอน",$("includeTeachingDate")?.checked?$("teachingDate")?.value:""],["ลงนาม",$("includeSignatures")?.checked?"มี":"ไม่ใช้"],["สไตล์",style],["สี",palette]];$("summary").innerHTML=vals.filter(x=>x[1]).map(x=>`<div class="sum"><b>${x[0]}</b><span>${esc(x[1])}</span></div>`).join("")}
function v(id){return $(id).value.trim()}
function prompt(){
  if(!selected)return"";
  const sem=v("semester")||"ไม่ระบุ";
  const year=v("academicYear")||"ไม่ระบุ";
  const teachingDate=$("includeTeachingDate").checked?(v("teachingDate")||"ยังไม่ระบุ"):"ไม่ใช้ส่วนวันที่สอน";
  const signatures=$("includeSignatures").checked;
  const teacherSign=v("teacherSignatureName")||v("teacherName")||"........................................";
  const customStyle=v("customStyleDirection")||"ไม่มีคำแนะนำเพิ่มเติม";
  const approval=signatures?`
D. การรับรองแผนและการลงนาม
รูปแบบการรับรอง: ${v("approvalLayout")}
ครูผู้สอน: ${teacherSign}
ผู้บริหาร/ผู้อำนวยการ: ${v("directorName")||"........................................"}
ตำแหน่งผู้บริหาร: ${v("directorPosition")||"ผู้อำนวยการสถานศึกษา"}
ให้มีพื้นที่ลงชื่อและวันที่อย่างเหมาะสม โดยไม่ทำให้หน้าแน่นเกินไป`:`D. การรับรองแผนและการลงนาม
ไม่ต้องแสดงส่วนลงนามหรือรับรองแผน`;

  return `คุณคือผู้เชี่ยวชาญด้านหลักสูตรไทย Instructional Design การจัดการเรียนรู้ การวัดและประเมินผล และ Educational Graphic Design

สร้าง “แผนการจัดการเรียนรู้” แบบหน้าเดียว ภาษาไทย อ่านง่าย กระชับ แต่มีองค์ประกอบทางวิชาการครบถ้วน เหมาะสำหรับครูไทยนำไปใช้จริง

A. ข้อมูลหลักสูตร
หลักสูตร: ${selected.curriculum||"หลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พ.ศ. 2551 (รวมฉบับปรับปรุง พ.ศ. 2560)"}
ช่วงชั้น: ${stage}
ระดับชั้น: ${selected.grade}
กลุ่มสาระการเรียนรู้/ด้าน: ${selected.subject}
สาระ/พัฒนาการ: ${selected.domain||"-"}
มาตรฐานการเรียนรู้: ${selected.standard||"-"}
รหัสตัวชี้วัด/ความสามารถ: ${selected.indicator||"-"}
ข้อความตัวชี้วัด/ความสามารถ: ${selected.indicator_text||"-"}
ประเภทตัวชี้วัด: ${selected.classification||"-"}

B. ข้อมูลพื้นฐานของแผน
หน่วยการเรียนรู้: ${v("unitName")||"-"}
เรื่อง: ${v("topic")||"-"}
เวลา: ${v("duration")||"1 ชั่วโมง"}
รูปแบบการจัดการเรียนรู้: ${v("method")||"Active Learning"}
ภาคเรียน: ${sem}
ปีการศึกษา: ${year}
วันที่สอน: ${teachingDate}

C. ข้อมูลผู้สอน
ชื่อผู้สอน: ${v("teacherName")||"ไม่ระบุ"}
ตำแหน่ง: ${v("teacherPosition")||"ไม่ระบุ"}
โรงเรียน: ${v("schoolName")||"ไม่ระบุ"}
สังกัด: ${v("organization")||"ไม่ระบุ"}
จังหวัด: ${v("province")||"ไม่ระบุ"}
จำนวนนักเรียน: ${v("studentCount")||"ไม่ระบุ"}

${approval}

E. องค์ประกอบทางวิชาการที่ต้องมีในแผนหน้าเดียว
1. สาระสำคัญ / ความคิดรวบยอด
2. จุดประสงค์การเรียนรู้ที่วัดได้ และสอดคล้องกับตัวชี้วัด
3. สาระการเรียนรู้ / เนื้อหาสำคัญ
4. สมรรถนะสำคัญของผู้เรียนที่เกี่ยวข้อง
5. คุณลักษณะอันพึงประสงค์ที่เกี่ยวข้อง
6. กิจกรรมการเรียนรู้ตามรูปแบบ ${v("method")||"Active Learning"} โดยแบ่งเป็น ขั้นนำเข้าสู่บทเรียน → ขั้นเรียนรู้/ปฏิบัติ → ขั้นสรุปและสะท้อนผล พร้อมระบุเวลาโดยประมาณ
7. คำถามสำคัญหรือคำถามกระตุ้นคิดอย่างน้อย 1–2 ข้อ
8. สื่อ / อุปกรณ์ / แหล่งเรียนรู้
9. ชิ้นงาน / ภาระงาน หากเหมาะสมกับบทเรียน
10. การวัดและประเมินผล ให้สัมพันธ์กันระหว่าง จุดประสงค์ → วิธีวัด → เครื่องมือ → เกณฑ์ผ่าน
11. การจัดการเรียนรู้ที่คำนึงถึงความแตกต่างระหว่างผู้เรียนอย่างกระชับ
12. บันทึกหลังสอนแบบย่อ หากพื้นที่เพียงพอ โดยมี ผลการเรียนรู้ / ปัญหาอุปสรรค / แนวทางพัฒนา

ข้อกำหนดด้านความถูกต้อง
- ใช้รหัสและข้อความตัวชี้วัดตามข้อมูลที่ให้เท่านั้น ห้ามแต่งตัวชี้วัดใหม่
- จุดประสงค์การเรียนรู้ให้ “สังเคราะห์” จากตัวชี้วัด ไม่คัดข้อความตัวชี้วัดซ้ำตรงตัว
- แต่ละข้อมูลปรากฏใน Section ที่เหมาะสมเพียงครั้งเดียว ลดข้อความซ้ำ
- กิจกรรม การประเมิน และชิ้นงานต้องสอดคล้องกัน
- หากข้อมูลใดระบุว่า “ไม่ระบุ” ไม่ต้องสร้างชื่อหรือข้อมูลขึ้นเอง
- ห้ามสร้างรูปครู โลโก้โรงเรียน หรือลายเซ็นปลอม

F. แนวทางการออกแบบ
สไตล์หลัก: ${style}
คำอธิบายสไตล์: ${(styleMeta[style]||[])[1]||""}
โทนสี: ${palette}
แนวทางเพิ่มเติมจากผู้ใช้: ${customStyle}
- ใช้ Typography ภาษาไทยอ่านง่าย
- มี Visual hierarchy ชัดเจน
- ออกแบบให้ดูเป็น “แผนการจัดการเรียนรู้หน้าเดียว” จริง ไม่ใช่โปสเตอร์ทั่วไป
- จัดสัดส่วนข้อมูลให้ครบแต่ไม่แน่น ใช้กล่อง Section, icon และพื้นที่ว่างอย่างสมดุล
- ชื่อหลักบนงานใช้คำว่า “แผนการจัดการเรียนรู้”
- ถ้ามีการแนบรูปครูหรือโลโก้ภายหลัง ให้ใช้ไฟล์จริงที่แนบเท่านั้น`;
}
async function copy(){const t=$("promptText").textContent;if(!t)return toast("ยังไม่มี Prompt");try{await navigator.clipboard.writeText(t);toast("คัดลอกแล้ว ✓")}catch{toast("กดค้างที่ Prompt เพื่อคัดลอก")}}
function saveWork(t){try{let a=JSON.parse(localStorage.getItem("klang-clean-work")||"[]");a.unshift({id:Date.now(),title:v("topic")||selected.indicator||"แผนการสอน",prompt:t,date:new Date().toISOString()});localStorage.setItem("klang-clean-work",JSON.stringify(a.slice(0,40)));renderWork()}catch{}}
function generate(){if(!$("grade").value)return toast("กรุณาเลือกระดับชั้น");if(!$("subject").value)return toast("กรุณาเลือกกลุ่มสาระ");if(!selected)return toast("กรุณาเลือกตัวชี้วัด");const t=prompt();$("promptText").textContent=t;$("promptWrap").hidden=false;saveWork(t);renderContinue();setTimeout(()=>$("promptWrap").scrollIntoView({behavior:"smooth"}),50);toast("สร้าง Prompt แล้ว ✓")}
function renderContinue(){
  const items=[
    ["worksheet","📝","สร้าง Prompt ใบงาน","ใบงานพร้อมคำชี้แจง/พื้นที่ตอบ"],
    ["quiz","✅","สร้าง Prompt แบบทดสอบ","ปรนัย/อัตนัย พร้อมเฉลย"],
    ["knowledge","📚","สร้าง Prompt ใบความรู้","สรุปเนื้อหาอ่านง่าย"],
    ["rubric","📊","สร้าง Prompt Rubric","เกณฑ์ประเมิน 4 ระดับ"],
    ["game","🎮","สร้าง Prompt เกม","Kahoot / Quizizz / Wordwall / HTML"],
    ["pack","🎁","สร้าง Teaching Pack","รวมสื่อทั้งชุดจากแผนเดิม"]
  ];
  $("continueGrid").innerHTML=items.map(x=>`<button type="button" data-continue="${x[0]}"><span>${x[1]}</span><b>${x[2]}</b><small>${x[3]}</small></button>`).join("");
  $$("[data-continue]").forEach(b=>b.onclick=()=>continuation(b.dataset.continue))
}
function continuation(type){
  const base=prompt();
  const intro={
    worksheet:"สร้างใบงานสำหรับนักเรียนจากแผนนี้ ให้เหมาะกับระดับชั้น มีชื่อใบงาน คำชี้แจง กิจกรรม/โจทย์ พื้นที่ตอบ และเฉลยแยกท้ายงาน พร้อมแนวทางออกแบบให้สวยอ่านง่าย",
    quiz:"สร้างแบบทดสอบจากแผนนี้ ให้มีตัวเลือกกำหนดจำนวนข้อ โดยค่าเริ่มต้น 10 ข้อ ผสมคำถามตามความเหมาะสม พร้อมเฉลยและเหตุผลย่อ",
    knowledge:"สร้างใบความรู้จากแผนนี้ สรุปสาระสำคัญเป็นภาษาที่เหมาะกับวัย มีตัวอย่าง ภาพ/ไอคอนที่ควรใช้ และกล่องสรุปจำง่าย",
    rubric:"สร้าง Rubric ประเมินชิ้นงานหรือกิจกรรมจากแผนนี้ ใช้ 4 ระดับ เกณฑ์ชัดเจน เชื่อมโยงกับจุดประสงค์และชิ้นงาน",
    game:"สร้าง Prompt สำหรับเกมการเรียนรู้จากแผนนี้ พร้อมกติกา วิธีเล่น คำถาม/ภารกิจ เฉลย และเสนอแพลตฟอร์มที่เหมาะ เช่น Kahoot, Quizizz, Wordwall, Genially, Canva หรือ HTML/Web",
    pack:"สร้าง Teaching Pack จากแผนนี้ให้เป็นชุดเดียว ประกอบด้วย ใบความรู้ ใบงาน แบบทดสอบพร้อมเฉลย Rubric และเกมการเรียนรู้ โดยทุกชิ้นใช้ตัวชี้วัดและเรื่องเดียวกับแผน"
  };
  $("promptText").textContent=`${intro[type]}

ข้อมูลอ้างอิงจากแผนเดิม:
---
${base}`;
  $("promptWrap").scrollIntoView({behavior:"smooth"});
  toast("สร้าง Prompt ต่อยอดแล้ว ✓")
}
function switchTab(name){$$(".page").forEach(x=>x.classList.toggle("active",x.id===`tab-${name}`));$$(".top-tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===name));$$("[data-bottom-tab]").forEach(x=>x.classList.toggle("active",x.dataset.bottomTab===name));if(name==="work")renderWork();window.scrollTo({top:0,behavior:"smooth"})}
function renderWork(){let a=[];try{a=JSON.parse(localStorage.getItem("klang-clean-work")||"[]")}catch{};$("workList").innerHTML=a.map(x=>`<article class="list-item"><b>${esc(x.title)}</b><small>${new Date(x.date).toLocaleString("th-TH")}</small><button type="button" class="secondary-btn" data-work="${x.id}">เปิด Prompt</button></article>`).join("")||'<div class="list-item">ยังไม่มีงานที่บันทึก</div>';$$("[data-work]").forEach(b=>b.onclick=()=>{const x=a.find(i=>i.id==b.dataset.work);if(x){switchTab("create");$("promptText").textContent=x.prompt;$("promptWrap").hidden=false;$("promptWrap").scrollIntoView({behavior:"smooth"})}})}
function updateLibraryFilters(){
  const st=$("libraryStage").value;
  const rows=DATA.filter(x=>!st||x.stage===st);
  const grades=unique(rows.map(x=>x.grade));
  const oldG=$("libraryGrade").value;
  $("libraryGrade").innerHTML='<option value="">ทั้งหมด</option>'+grades.map(g=>`<option>${esc(g)}</option>`).join("");
  if(grades.includes(oldG))$("libraryGrade").value=oldG;
  updateLibrarySubjects()
}
function updateLibrarySubjects(){
  const st=$("libraryStage").value,g=$("libraryGrade").value;
  const rows=DATA.filter(x=>(!st||x.stage===st)&&(!g||x.grade===g));
  const subjects=unique(rows.map(x=>x.subject));
  const old=$("librarySubject").value;
  $("librarySubject").innerHTML='<option value="">ทั้งหมด</option>'+subjects.map(s=>`<option>${esc(s)}</option>`).join("");
  if(subjects.includes(old))$("librarySubject").value=old;
  applyLibraryFilters()
}
function applyLibraryFilters(){
  const st=$("libraryStage").value,g=$("libraryGrade").value,s=$("librarySubject").value,q=$("librarySearch").value.toLowerCase().trim();
  const rows=DATA.filter(x=>(!st||x.stage===st)&&(!g||x.grade===g)&&(!s||x.subject===s)&&(!q||[x.indicator,x.indicator_text,x.standard,x.subject,x.grade,x.domain].some(v=>String(v||"").toLowerCase().includes(q))));
  renderLibrary(rows)
}
function renderLibrary(rows){
  $("libraryList").innerHTML=rows.slice(0,80).map(x=>`<button type="button" class="list-item indicator-library-item ${librarySelected===x?"selected":""}" data-lib-index="${DATA.indexOf(x)}"><b>${esc(x.indicator||x.standard||"ตัวชี้วัด")}</b><div>${esc(x.indicator_text||"")}</div><small>${esc(x.stage||"")} · ${esc(x.grade||"")} · ${esc(x.subject||"")}</small></button>`).join("")||'<div class="list-item">ไม่พบตัวชี้วัด</div>';
  $$("[data-lib-index]").forEach(b=>b.onclick=()=>{librarySelected=DATA[Number(b.dataset.libIndex)];renderLibrary(rows);$("useLibraryIndicatorBtn").hidden=false})
}
function useLibraryIndicator(){
  if(!librarySelected)return;
  stage=librarySelected.stage;
  $$(".stage-btn").forEach(x=>x.classList.toggle("active",x.dataset.stage===stage));
  buildGrades();
  $("grade").value=librarySelected.grade;buildSubjects();
  $("subject").value=librarySelected.subject;buildIndicators();
  $("indicator").value=String(DATA.indexOf(librarySelected));chooseIndicator();
  switchTab("create");
  $("step1").scrollIntoView({behavior:"smooth"});
  toast("นำตัวชี้วัดมาใช้ในแผนแล้ว ✓")
}
async function sendHelp(){const msg=v("helpMessage");if(!msg)return $("helpStatus").innerHTML='<div class="error-box">กรุณาพิมพ์รายละเอียด</div>';const {error}=await sb.from("member_support_messages").insert({user_id:user.id,message_type:$("helpType").value,subject:v("helpSubject")||null,message:msg});if(error)return $("helpStatus").innerHTML=`<div class="error-box">${esc(error.message)}</div>`;$("helpSubject").value="";$("helpMessage").value="";$("helpStatus").innerHTML='<div class="indicator-preview">ส่งถึง Admin แล้ว ✓</div>'}
function openProfile(){$("profileModal").hidden=false;renderProfile()}
function closeProfile(){$("profileModal").hidden=true}
async function compress(file){return new Promise((res,rej)=>{const rd=new FileReader(),im=new Image();rd.onload=()=>im.src=rd.result;rd.onerror=rej;im.onload=()=>{const c=document.createElement("canvas"),n=256;c.width=c.height=n;const s=Math.min(im.width,im.height),x=(im.width-s)/2,y=(im.height-s)/2;c.getContext("2d").drawImage(im,x,y,s,s,0,0,n,n);res(c.toDataURL("image/jpeg",.78))};im.onerror=rej;rd.readAsDataURL(file)})}
function bind(){
  $$(".stage-btn").forEach(b=>b.onclick=()=>{stage=b.dataset.stage;$$(".stage-btn").forEach(x=>x.classList.toggle("active",x===b));buildGrades();updateSummary()});
  $("grade").onchange=buildSubjects;$("subject").onchange=buildIndicators;$("indicatorSearch").oninput=buildIndicators;$("indicator").onchange=chooseIndicator;
  ["unitName","topic","duration","method","semester","academicYear","teachingDate","teacherName","teacherPosition","schoolName","organization","province","studentCount","teacherSignatureName","directorName","directorPosition","approvalLayout","customStyleDirection"].forEach(id=>$(id).oninput=updateSummary);
  $("generateBtn").onclick=generate;$("copyPromptBtn").onclick=copy;
  $$(".top-tab").forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));$$("[data-bottom-tab]").forEach(b=>b.onclick=()=>switchTab(b.dataset.bottomTab));
  $$("[data-scroll]").forEach(b=>b.onclick=()=>document.getElementById(b.dataset.scroll)?.scrollIntoView({behavior:"smooth",block:"start"}));
  $("libraryStage").onchange=updateLibraryFilters;$("libraryGrade").onchange=updateLibrarySubjects;$("librarySubject").onchange=applyLibraryFilters;$("librarySearch").oninput=applyLibraryFilters;$("useLibraryIndicatorBtn").onclick=useLibraryIndicator;
  $("includeTeachingDate").onchange=()=>{$("teachingDateFields").hidden=!$("includeTeachingDate").checked;updateSummary()};
  $("includeSignatures").onchange=()=>{$("signatureFields").hidden=!$("includeSignatures").checked;updateSummary()};
  $$("[data-style-hint]").forEach(b=>b.onclick=()=>{const t=$("customStyleDirection");t.value=(t.value?t.value+" · ":"")+b.dataset.styleHint;updateSummary()});
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