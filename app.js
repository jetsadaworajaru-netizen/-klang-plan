const $=id=>document.getElementById(id);const CFG=window.KLANG_CONFIG||{};let DATA=[],ACTIVE_STAGE="ปฐมวัย",selectedTool=null,supabaseClient=null,currentUser=null,currentProfile=null;const grades={"ปฐมวัย":["อ.1","อ.2","อ.3"],"ประถมศึกษา":["ป.1","ป.2","ป.3","ป.4","ป.5","ป.6"],"มัธยมศึกษา":["ม.1","ม.2","ม.3","ม.4","ม.5","ม.6"]};const SUBJECT_ORDER=["ภาษาไทย","คณิตศาสตร์","วิทยาศาสตร์และเทคโนโลยี","สังคมศึกษา ศาสนาและวัฒนธรรม","สุขศึกษาและพลศึกษา","ศิลปะ","การงานอาชีพ","ภาษาต่างประเทศ (ภาษาอังกฤษ)","ปฐมวัย"];
const TOOLS=[{id:"lesson",icon:"📘",title:"แผนการสอนหน้าเดียว",desc:"Prompt แผนกระชับ ครบองค์ประกอบ และสอดคล้องตัวชี้วัด",tier:"guest"},{id:"worksheet",icon:"📝",title:"ใบงาน",desc:"สร้างใบงานตามตัวชี้วัด พร้อมตัวเลือกชนิดงานและเฉลย",tier:"guest"},{id:"exercise",icon:"✏️",title:"แบบฝึกหัด",desc:"แบบฝึกหลายระดับพร้อมเฉลยและเกณฑ์",tier:"member"},{id:"quiz",icon:"✅",title:"แบบทดสอบ",desc:"ก่อนเรียน/หลังเรียน พร้อมเฉลยและวิเคราะห์ตัวชี้วัด",tier:"member"},{id:"rubric",icon:"📊",title:"แบบประเมิน / Rubric",desc:"เกณฑ์ประเมินที่โยงกับพฤติกรรมตามตัวชี้วัด",tier:"vip"},{id:"knowledge",icon:"📚",title:"ใบความรู้",desc:"สรุปความรู้ที่ตรงกับเรื่องและระดับชั้น",tier:"member"},{id:"game",icon:"🎮",title:"เกม / Active Learning",desc:"กิจกรรมเล่นได้จริงในคาบเรียน",tier:"vip"},{id:"pack",icon:"🎁",title:"Teaching Pack",desc:"แผน + ใบงาน + ใบความรู้ + แบบประเมิน + แบบทดสอบ ในชุดเดียว",tier:"vip"}];
function toast(t){const e=$("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1800)}function go(v){document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));$(v+"View").classList.add("active");scrollTo({top:0,behavior:"smooth"});if(v==="admin")loadAdmin()}document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));document.querySelectorAll("[data-stage-go]").forEach(b=>b.onclick=()=>{ACTIVE_STAGE=b.dataset.stageGo;go("generator");syncStageTabs();buildGrades()});
document.querySelectorAll("[data-tool-start]").forEach(b=>b.onclick=()=>{
  selectedTool=b.dataset.toolStart;
  go("generator");
  renderTools();
  renderOptions();
  revealFlowAfterTool(true);
});
function backendReady(){return !!(CFG.supabaseUrl&&(CFG.supabasePublishableKey||CFG.supabaseAnonKey)&&window.supabase)}function initBackend(){if(!backendReady()){$("backendWarning").style.display="block";return}const key=CFG.supabasePublishableKey||CFG.supabaseAnonKey;supabaseClient=window.supabase.createClient(CFG.supabaseUrl,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});supabaseClient.auth.getSession().then(({data})=>applySession(data.session));supabaseClient.auth.onAuthStateChange((_e,s)=>applySession(s))}async function applySession(session){currentUser=session?.user||null;currentProfile=null;if(currentUser){const {data,error}=await supabaseClient.from("profiles").select("id,email,full_name,school_name,facebook_name,phone,role,status,requested_role,invite_code,membership_started_at,membership_expires_at,approved_at,created_at").eq("id",currentUser.id).maybeSingle();if(error)console.error(error);currentProfile=data||null}renderAuthState()}
function renderAuthState(){const chip=$("memberChip"),admin=$("adminBtn"),btn=$("authBtn");if(!currentUser){chip.style.display="none";admin.style.display="none";btn.textContent="เข้าสู่ระบบ";btn.onclick=openAuth;return}chip.style.display="inline-block";const role=currentProfile?.role||"member",status=currentProfile?.status||"pending";chip.textContent=currentProfile?`${currentProfile.full_name||currentUser.email} · ${role}${status!=="active"?` · ${status}`:""}`:currentUser.email;admin.style.display=(currentProfile?.role==="admin"&&currentProfile?.status==="active")?"inline-block":"none";btn.textContent="ออกจากระบบ";btn.onclick=logout}
async function logout(){if(supabaseClient)await supabaseClient.auth.signOut();currentUser=null;currentProfile=null;renderAuthState();go("home")}
function openAuth(tab="login"){$("authModal").classList.add("open");switchAuth(tab)}
if($("authBtn"))$("authBtn").onclick=openAuth;
if($("joinNow"))$("joinNow").onclick=()=>openAuth("register");
if($("closeAuth"))$("closeAuth").onclick=()=>$("authModal").classList.remove("open");document.querySelectorAll("[data-auth]").forEach(b=>b.onclick=()=>switchAuth(b.dataset.auth));function switchAuth(t){document.querySelectorAll(".auth-tab").forEach(x=>x.classList.toggle("active",x.dataset.auth===t));document.querySelectorAll(".auth-pane").forEach(x=>x.classList.toggle("active",x.id==="auth-"+t))}
$("loginBtn").onclick=async()=>{if(!backendReady()){msg("loginMsg","ยังไม่ได้เชื่อม Supabase","warn");return}const email=$("loginEmail").value.trim(),password=$("loginPassword").value;if(!email||!password){msg("loginMsg","กรุณากรอกอีเมลและรหัสผ่าน","warn");return}const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});if(error){msg("loginMsg",error.message,"warn");return}await applySession(data.session);const p=currentProfile;if(p?.status==="pending")msg("loginMsg","เข้าสู่ระบบแล้ว แต่บัญชียังรอแอดมินอนุมัติ","warn");else if(["suspended","expired"].includes(p?.status))msg("loginMsg","บัญชีนี้ยังไม่สามารถใช้งานได้ กรุณาติดต่อแอดมิน","warn");else if(p?.status==="active"){$("authModal").classList.remove("open");toast("เข้าสู่ระบบสำเร็จ")}else msg("loginMsg","กำลังตรวจสอบสถานะสมาชิก กรุณาลองใหม่อีกครั้ง","warn")};
$("registerBtn").onclick=async()=>{if(!backendReady()){msg("registerMsg","ระบบสมาชิกยังเชื่อมต่อไม่สมบูรณ์","warn");return}const email=$("regEmail").value.trim(),password=$("regPassword").value;if(!email||!password||!$("regName").value.trim()){msg("registerMsg","กรุณากรอกชื่อ อีเมล และรหัสผ่าน","warn");return}if(password.length<6){msg("registerMsg","รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษร","warn");return}const meta={full_name:$("regName").value.trim(),school_name:$("regSchool").value.trim(),phone:$("regPhone").value.trim(),facebook_name:$("regFacebook").value.trim(),invite_code:$("regInvite").value.trim()};const {data,error}=await supabaseClient.auth.signUp({email,password,options:{data:meta,emailRedirectTo:CFG.siteUrl||location.origin}});if(error){msg("registerMsg",error.message,"warn");return}if(data.session){await applySession(data.session);msg("registerMsg","สมัครสำเร็จ ✓ บัญชีอยู่ในสถานะรอแอดมินอนุมัติ","ok")}else msg("registerMsg","ส่งคำขอแล้ว ✓ หากมีอีเมลยืนยัน กรุณากดยืนยันอีเมล จากนั้นรอแอดมินอนุมัติ","ok")};function msg(id,t,type){$(id).innerHTML=`<div class="alert ${type}">${t}</div>`}
const invite=new URLSearchParams(location.search).get("invite");if(invite){$("regInvite").value=invite;setTimeout(()=>openAuth("register"),500)}
function matchGrade(r,g){return r.grade===g||(Array.isArray(r.available_grades)&&r.available_grades.includes(g))}function syncStageTabs(){document.querySelectorAll(".stage-tab").forEach(x=>x.classList.toggle("active",x.dataset.stage===ACTIVE_STAGE))}document.querySelectorAll(".stage-tab").forEach(b=>b.onclick=()=>{if(!DATA.length){toast("กำลังโหลดฐานข้อมูล กรุณารอสักครู่");return}ACTIVE_STAGE=b.dataset.stage;syncStageTabs();buildGrades();savePrefs()});
function setSelectState(el,items,placeholder){
  el.innerHTML="";
  if(!items||!items.length){
    const o=document.createElement("option");o.value="";o.textContent=placeholder||"ไม่มีข้อมูล";
    el.appendChild(o);el.disabled=true;return
  }
  items.forEach(v=>{const o=document.createElement("option");o.value=o.textContent=v;el.appendChild(o)});
  el.disabled=false
}
function buildGrades(){
  let arr=(grades[ACTIVE_STAGE]||[]).filter(g=>DATA.some(r=>r.stage===ACTIVE_STAGE&&matchGrade(r,g)));
  if(!arr.length&&DATA.length) arr=[...new Set(DATA.filter(r=>r.stage===ACTIVE_STAGE).map(r=>r.grade).filter(Boolean))];
  setSelectState($("grade"),arr,"ไม่พบระดับชั้น");
  $("grade").onchange=()=>{buildSubjects();savePrefs()};
  buildSubjects()
}
function fill(el,arr){setSelectState(el,arr,"ไม่มีตัวเลือก")}
function buildSubjects(){
  const g=$("grade").value;
  if(!g){setSelectState($("subject"),[],"กรุณาเลือกระดับชั้น");setSelectState($("indicator"),[],"กรุณาเลือกกลุ่มสาระ");$("indicatorBox").textContent="เลือกระดับชั้นเพื่อดูข้อมูล";return}
  let arr=[...new Set(DATA.filter(r=>r.stage===ACTIVE_STAGE&&matchGrade(r,g)).map(r=>r.subject).filter(Boolean))];
  arr.sort((a,b)=>(SUBJECT_ORDER.indexOf(a)<0?99:SUBJECT_ORDER.indexOf(a))-(SUBJECT_ORDER.indexOf(b)<0?99:SUBJECT_ORDER.indexOf(b)));
  setSelectState($("subject"),arr,"ไม่พบกลุ่มสาระ");
  $("subject").onchange=()=>{buildIndicators();savePrefs()};
  buildIndicators()
}
function rows(){
  const g=$("grade").value,s=$("subject").value;
  if(!g||!s)return[];
  return DATA.filter(r=>r.stage===ACTIVE_STAGE&&matchGrade(r,g)&&r.subject===s)
}
function buildIndicators(){
  const rs=rows(),el=$("indicator");el.innerHTML="";
  if(!rs.length){setSelectState(el,[],"ไม่พบตัวชี้วัด");$("indicatorBox").textContent="ไม่พบข้อมูลที่สัมพันธ์กับตัวเลือกนี้";renderSummary();return}
  rs.forEach((r,i)=>{const o=document.createElement("option");o.value=i;o.textContent=`${r.indicator}${r.classification?` [${r.classification}]`:""} — ${r.indicator_text}`;el.appendChild(o)});
  el.disabled=false;el.onchange=syncRecord;syncRecord()
}
function record(){return rows()[Number($("indicator").value||0)]||{}}function syncRecord(){const r=record();$("indicatorBox").innerHTML=r.indicator?`<b>${r.indicator}</b>${r.classification?` · ${r.classification}`:""}<br>${r.indicator_text}`:"ไม่มีข้อมูล";$("topic").placeholder=r.domain?`เช่น ${r.domain}`:"เรื่องที่จะสอน";renderSummary()}["topic","duration","method","context"].forEach(id=>$(id).addEventListener(id==="topic"||id==="context"?"input":"change",renderSummary));function renderSummary(){const r=record();$("summary").innerHTML=`<b>ตรวจสอบก่อนสร้าง</b><br>${ACTIVE_STAGE} · ${$("grade").value||"—"} · ${$("subject").value||"—"}<br>${r.indicator||"—"} · เรื่อง ${$("topic").value||"ยังไม่ระบุ"}`}
$("indicatorSearch").oninput=()=>{const q=$("indicatorSearch").value.trim().toLowerCase(),box=$("searchResults");if(!q){box.style.display="none";return}const found=rows().filter(r=>[r.indicator,r.indicator_text,r.domain,r.standard].join(" ").toLowerCase().includes(q)).slice(0,30);box.innerHTML=found.map(r=>`<div class="result-item" data-id="${r.dataset_id}"><b>${r.indicator}</b><small>${r.indicator_text}</small></div>`).join("")||'<div class="result-item">ไม่พบข้อมูล</div>';box.style.display="block";box.querySelectorAll("[data-id]").forEach(x=>x.onclick=()=>{const i=rows().findIndex(r=>r.dataset_id===x.dataset.id);$("indicator").value=i;box.style.display="none";$("indicatorSearch").value="";syncRecord()})};
function tierRank(t){return {guest:0,member:1,vip:2,admin:3}[t]??0}function userTier(){if(currentProfile?.status!=="active")return"guest";if(currentProfile?.role==="admin")return"admin";if(currentProfile?.role==="vip")return"vip";return"member"}function revealFlowAfterTool(scrollIt=false){
  const has=!!selectedTool;
  $("flowDetailsStep").style.display=has?"block":"none";
  $("flowOptionsStep").style.display=has?"block":"none";
  $("flowFinalStep").style.display=has?"block":"none";
  document.querySelectorAll(".flow-dot").forEach((x,i)=>x.classList.toggle("active",has&&i<=3));
  if(scrollIt&&has)setTimeout(()=>$("flowDetailsStep").scrollIntoView({behavior:"smooth",block:"start"}),120);
}
function renderTools(){
  $("tools").innerHTML=TOOLS.map(t=>`<article class="tool simple-tool-card ${selectedTool===t.id?"selected":""}" data-tool="${t.id}">
    <div class="icon">${t.icon}</div><div class="tool-copy"><h4>${t.title}</h4><p>${t.desc}</p></div>
    <span class="tier ${t.tier==="vip"?"vip":""}">${t.tier==="guest"?"FREE":t.tier.toUpperCase()}</span>
    <span class="choose-mark">${selectedTool===t.id?"✓":"เลือก"}</span>
  </article>`).join("");
  document.querySelectorAll("[data-tool]").forEach(x=>x.onclick=()=>{
    selectedTool=x.dataset.tool;
    renderTools();renderOptions();revealFlowAfterTool(true);renderSummary();
  });
  renderOptions();revealFlowAfterTool(false);
}
function renderOptions(){
  const t=TOOLS.find(x=>x.id===selectedTool);
  if(!t){$("toolOptions").innerHTML='<div class="option-placeholder">เลือกประเภทงานก่อน</div>';return}
  let h='<div class="option-grid">';
  if(t.id==="worksheet")h+='<div class="field"><label>ชนิดใบงาน</label><select id="optType"><option>เติมคำ</option><option>จับคู่</option><option>เขียนตอบ</option><option>วิเคราะห์</option><option>ระบายสี/สร้างสรรค์</option><option>ปฏิบัติ</option></select></div><div class="field"><label>จำนวนข้อ</label><select id="optCount"><option>5</option><option selected>10</option><option>15</option></select></div><div class="field"><label>เฉลย</label><select id="optAnswer"><option>มีเฉลย</option><option>ไม่มีเฉลย</option></select></div><div class="field"><label>สไตล์</label><select id="optStyle"><option>A4 ขาวดำประหยัดหมึก</option><option>สีสวย Canva Ready</option><option>น่ารักเหมาะกับเด็ก</option><option>ทางการเรียบง่าย</option></select></div>';
  else if(t.id==="quiz"||t.id==="exercise")h+='<div class="field"><label>จำนวนข้อ</label><select id="optCount"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></div><div class="field"><label>ระดับความยาก</label><select id="optLevel"><option>ง่าย–ปานกลาง</option><option>ปานกลาง</option><option>ปานกลาง–ยาก</option><option>คละระดับ</option></select></div>';
  else if(t.id==="rubric")h+='<div class="field"><label>ระดับเกณฑ์</label><select id="optRubric"><option>3 ระดับ</option><option selected>4 ระดับ</option><option>5 ระดับ</option></select></div><div class="field"><label>รูปแบบ</label><select id="optAssessment"><option>Rubric แบบวิเคราะห์</option><option>Checklist</option><option>แบบสังเกตพฤติกรรม</option></select></div>';
  else if(t.id==="game")h+='<div class="field"><label>รูปแบบกิจกรรม</label><select id="optGame"><option>เกมกลุ่ม</option><option>เกมแข่งขัน</option><option>ฐานกิจกรรม</option><option>ภารกิจ/Challenge</option></select></div><div class="field"><label>ทรัพยากร</label><select id="optResource"><option>ใช้ของในห้องเรียน</option><option>ใช้มือถือ/ดิจิทัล</option><option>ไม่ใช้อุปกรณ์พิเศษ</option></select></div>';
  else h+='<div class="field"><label>ระดับรายละเอียด</label><select id="optDetail"><option>กระชับพร้อมใช้</option><option>ละเอียด</option><option>ละเอียดมาก</option></select></div>';
  h+='</div>';$("toolOptions").innerHTML=h
}

function optionValue(id,fallback=""){
  const el=$(id);
  return el&&typeof el.value==="string"&&el.value.trim()?el.value.trim():fallback
}
function common(){
  const r=record()||{};
  return {
    r,
    stage:ACTIVE_STAGE,
    grade:$("grade")?.value||"",
    subject:$("subject")?.value||"",
    topic:$("topic")?.value?.trim()||"",
    duration:$("duration")?.value||"1 คาบ (50–60 นาที)",
    method:$("method")?.value||"Active Learning",
    context:$("context")?.value?.trim()||"",
    curriculum:r.curriculum||r.source_curriculum||"",
    domain:r.domain||"",
    standard:r.standard||"",
    indicator:r.indicator||"",
    indicatorText:r.indicator_text||"",
    classification:r.classification||""
  }
}
function promptHeader(c){
  return `คุณคือผู้เชี่ยวชาญด้านการออกแบบการเรียนรู้และหลักสูตรไทย
สร้างผลงานภาษาไทยสำหรับครู โดยยึดข้อมูลต่อไปนี้เป็นข้อมูลหลัก ห้ามเปลี่ยนรหัสหรือข้อความตัวชี้วัด

หลักสูตร: ${c.curriculum||"-"}
ช่วงชั้น: ${c.stage||"-"}
ระดับชั้น: ${c.grade||"-"}
กลุ่มสาระ/ด้าน: ${c.subject||"-"}
สาระ/พัฒนาการ: ${c.domain||"-"}
มาตรฐาน: ${c.standard||"-"}
ตัวชี้วัด/ความสามารถ: ${c.indicator||"-"}
ข้อความตัวชี้วัด/ความสามารถ: ${c.indicatorText||"-"}
ประเภทตัวชี้วัด: ${c.classification||"-"}
เรื่อง: ${c.topic||"-"}
เวลา: ${c.duration||"-"}
รูปแบบการเรียนรู้: ${c.method||"-"}${c.context?`\nบริบทเพิ่มเติม: ${c.context}`:""}`
}
function promptFor(tool,c){
  const base=promptHeader(c);
  const detail=optionValue("optDetail","กระชับพร้อมใช้");
  if(tool==="lesson"){
    return `${base}

งานที่ต้องการ: แผนการจัดการเรียนรู้หน้าเดียว

ข้อกำหนด:
1. จัดทำเป็น “แผนการสอนหน้าเดียว” ภาษาไทย อ่านง่าย กระชับ แต่ข้อมูลครบและนำไปใช้สอนได้จริง
2. ประกอบด้วย สาระสำคัญ/ความคิดรวบยอด, จุดประสงค์การเรียนรู้, สาระการเรียนรู้, สมรรถนะ/คุณลักษณะที่เกี่ยวข้อง, ขั้นตอนกิจกรรมการเรียนรู้, สื่อ/แหล่งเรียนรู้ และการวัดประเมินผล
3. กิจกรรมต้องสอดคล้องกับตัวชี้วัดและรูปแบบ ${c.method}
4. กำหนดเวลาในแต่ละช่วงให้เหมาะกับ ${c.duration}
5. การประเมินต้องบอก วิธีการ เครื่องมือ และเกณฑ์ผ่านอย่างชัดเจน
6. ห้ามแต่งรหัสตัวชี้วัดใหม่ และไม่ใส่ข้อมูลที่ไม่สัมพันธ์กับระดับชั้น
7. ระดับรายละเอียด: ${detail}

จัดคำตอบให้ครูสามารถคัดลอกไปใช้หรือจัดหน้าเป็นเอกสารหน้าเดียวได้ทันที`;
  }
  if(tool==="worksheet"){
    const type=optionValue("optType","เติมคำ");
    const count=optionValue("optCount","10");
    const answer=optionValue("optAnswer","มีเฉลย");
    const style=optionValue("optStyle","A4 ขาวดำประหยัดหมึก");
    return `${base}

งานที่ต้องการ: ใบงานสำหรับนักเรียน

ข้อกำหนด:
1. สร้างใบงานชนิด: ${type}
2. จำนวน: ${count} ข้อ/ภารกิจ
3. รูปแบบงาน: ${style}
4. ${answer}
5. เริ่มด้วยชื่อใบงาน คำชี้แจง และช่องชื่อ–ชั้น–เลขที่
6. ทุกข้อจะต้องวัดหรือฝึกทักษะที่สัมพันธ์กับตัวชี้วัดที่ให้ไว้
7. ใช้ภาษาที่เหมาะกับ ${c.grade} และไม่ยากเกินวัย
8. หากเป็นงานสร้างสรรค์ ให้กำหนดพื้นที่หรือคำบอกใบ้สำหรับการทำงาน
9. จัดหน้าให้ง่ายต่อการนำไปสร้างเป็น A4 ใน Canva/Word

ห้ามเปลี่ยนตัวชี้วัด และหลีกเลี่ยงเนื้อหานอกเรื่อง`;
  }
  if(tool==="quiz"){
    const count=optionValue("optCount","10");
    const level=optionValue("optLevel","ง่าย–ปานกลาง");
    return `${base}

งานที่ต้องการ: แบบทดสอบตามตัวชี้วัด

ข้อกำหนด:
1. จำนวน ${count} ข้อ ระดับความยาก ${level}
2. คละรูปแบบคำถามให้เหมาะสม เช่น ปรนัย 4 ตัวเลือก / ถูกผิด / ตอบสั้น
3. ทุกข้อระบุว่ากำลังวัดความรู้หรือทักษะใดที่สัมพันธ์กับตัวชี้วัด
4. มีเฉลยครบ พร้อมคำอธิบายสั้น ๆ
5. จัดทำตารางสรุปข้อที่–คำตอบ–พฤติกรรมที่วัด
6. ภาษาเหมาะกับ ${c.grade} และคำถามไม่กำกวม`;
  }
  if(tool==="exercise"){
    const count=optionValue("optCount","10");
    const level=optionValue("optLevel","คละระดับ");
    return `${base}

งานที่ต้องการ: แบบฝึกหัด

ข้อกำหนด:
1. จำนวน ${count} ข้อ ระดับ ${level}
2. เรียงจากพื้นฐานไปสู่การประยุกต์
3. มีตัวอย่างก่อนเริ่มทำอย่างน้อย 1 ตัวอย่าง
4. แต่ละข้อสัมพันธ์กับตัวชี้วัดโดยตรง
5. มีเฉลยและแนวคิด/วิธีทำที่กระชับ
6. ภาษาเหมาะกับ ${c.grade}`;
  }
  if(tool==="rubric"){
    const levels=optionValue("optRubric","4 ระดับ");
    const assessment=optionValue("optAssessment","Rubric แบบวิเคราะห์");
    return `${base}

งานที่ต้องการ: แบบประเมิน ${assessment}

ข้อกำหนด:
1. ใช้เกณฑ์ ${levels}
2. สร้างประเด็นประเมินจากพฤติกรรมที่สังเกตได้จริงและเชื่อมโยงตัวชี้วัด
3. ระบุคำอธิบายคุณภาพแต่ละระดับให้แยกกันชัดเจน
4. มีคะแนนรวม เกณฑ์ผ่าน และวิธีแปลผล
5. ใช้ถ้อยคำที่ครูสามารถสังเกต/ตรวจหลักฐานได้ ไม่ใช้คำกว้างเกินไป
6. จัดเป็นตารางพร้อมใช้งาน`;
  }
  if(tool==="knowledge"){
    return `${base}

งานที่ต้องการ: ใบความรู้สำหรับนักเรียน

ข้อกำหนด:
1. สรุปเฉพาะเนื้อหาที่จำเป็นต่อการบรรลุตัวชี้วัด
2. ใช้หัวข้อสั้น อ่านง่าย และภาษาที่เหมาะกับ ${c.grade}
3. มีตัวอย่างหรือสถานการณ์ใกล้ตัว
4. มี “จำง่าย” หรือ Key Takeaway 3–5 ข้อ
5. ปิดท้ายด้วยคำถามตรวจสอบความเข้าใจ 3 ข้อ พร้อมเฉลย
6. ออกแบบโครงสร้างให้สามารถนำไปจัดหน้า A4 หรือ Infographic ได้`;
  }
  if(tool==="game"){
    const game=optionValue("optGame","เกมกลุ่ม");
    const resource=optionValue("optResource","ใช้ของในห้องเรียน");
    return `${base}

งานที่ต้องการ: เกม/กิจกรรม Active Learning

ข้อกำหนด:
1. รูปแบบ: ${game}
2. ทรัพยากร: ${resource}
3. ระบุเป้าหมายการเรียนรู้ที่โยงตัวชี้วัด
4. เขียนขั้นเตรียมอุปกรณ์ กติกา วิธีเล่น/ทำกิจกรรม บทบาทครู บทบาทนักเรียน และเวลา
5. มีวิธีสรุปบทเรียนหลังจบเกม
6. มีการประเมินระหว่างกิจกรรมที่ครูสังเกตได้
7. ปลอดภัย ทำได้จริงในห้องเรียน และเหมาะกับ ${c.grade}`;
  }
  if(tool==="pack"){
    return `${base}

งานที่ต้องการ: Teaching Pack ครบชุดจากตัวชี้วัดเดียว

สร้างชุดสื่อที่เชื่อมโยงกันทั้งหมด:
A. แผนการสอนหน้าเดียว
B. ใบความรู้
C. ใบงาน 10 ข้อ/ภารกิจ พร้อมเฉลย
D. แบบทดสอบ 10 ข้อ พร้อมเฉลย
E. Rubric หรือ Checklist สำหรับประเมินผล
F. เกม/กิจกรรม Active Learning 1 กิจกรรม

ข้อกำหนด:
- ทุกชิ้นต้องใช้เรื่องและตัวชี้วัดเดียวกันอย่างสอดคล้อง
- ไม่แต่งรหัสตัวชี้วัดใหม่
- ภาษาและความยากเหมาะกับ ${c.grade}
- แยกหัวข้อ A–F ชัดเจน พร้อมนำไปใช้จริง`;
  }
  return `${base}

สร้างสื่อการเรียนรู้ที่สอดคล้องกับตัวชี้วัด ใช้งานได้จริง และเหมาะกับ ${c.grade}`;
}



const CONTINUE_TOOL_IDS=["worksheet","quiz","knowledge","rubric","game","pack"];
let smartContinueTool=null;

function continuationLabel(id){
  const map={
    worksheet:["📝","สร้างใบงาน","เลือกแนวใบงาน จำนวนข้อ เฉลย และสไตล์"],
    quiz:["✅","สร้างแบบทดสอบ","ปรนัย/อัตนัย/แบบผสม จำนวนข้อ และเฉลย"],
    knowledge:["📚","สร้างใบความรู้","A4 / Infographic / อ่านง่าย / Mind Map"],
    rubric:["📊","สร้าง Rubric","ชิ้นงาน พฤติกรรม การนำเสนอ หรือ Checklist"],
    game:["🎮","สร้างเกม","เลือกแนวเกมและแพลตฟอร์มที่จะนำไปสร้างต่อ"],
    pack:["🎁","สร้าง Teaching Pack","เลือกชุดสื่อหลายชิ้นจากตัวชี้วัดเดียว"]
  };
  return map[id]||["✨",id,""]
}

function renderContinuePanel(sourceTool){
  const panel=$("continuePanel"),wrap=$("continueTools"),title=$("continueTitle");
  if(!panel||!wrap)return;
  title.textContent=sourceTool==="lesson"?"สร้างอะไรต่อจากแผนนี้?":"สร้างอะไรต่อจากงานนี้?";
  wrap.innerHTML=CONTINUE_TOOL_IDS.map(id=>{
    const [icon,name,desc]=continuationLabel(id);
    const t=TOOLS.find(x=>x.id===id);
    const locked=t&&tierRank(userTier())<tierRank(t.tier);
    return `<button class="continue-tool ${id==="pack"?"featured":""}" data-continue-tool="${id}">
      <span class="continue-icon">${icon}</span>
      <span class="continue-copy"><b>${name}</b><small>${desc}</small></span>
      ${locked?`<span class="continue-lock">${t.tier.toUpperCase()}</span>`:`<span class="continue-arrow">→</span>`}
    </button>`
  }).join("");
  panel.style.display="block";
  document.querySelectorAll("[data-continue-tool]").forEach(btn=>btn.onclick=()=>openSmartContinue(btn.dataset.continueTool));
}

function smartField(label,html){return `<div class="smart-field"><label>${label}</label>${html}</div>`}
function smartChips(name,items,selected=0,multi=false){
  return `<div class="smart-chips" data-chip-group="${name}" data-multi="${multi?1:0}">
    ${items.map((x,i)=>`<button type="button" class="smart-chip ${i===selected?"active":""}" data-value="${x.value||x}">${x.label||x}</button>`).join("")}
  </div>`
}

function configTemplate(tool){
  if(tool==="worksheet"){
    return [
      smartField("แนวใบงาน",smartChips("wsType",[
        ["เติมคำ","เติมคำ"],["จับคู่","จับคู่"],["ตอบคำถาม","ตอบคำถาม"],["วิเคราะห์","วิเคราะห์"],["ระบายสี/วาดภาพ","ระบายสี/วาดภาพ"],["ตัด–แปะ","ตัด–แปะ"],["ปฏิบัติ","ปฏิบัติ"]
      ].map(([label,value])=>({label,value})))),
      smartField("จำนวนข้อ",smartChips("wsCount",["5","10","15"],1)),
      smartField("เฉลย",smartChips("wsAnswer",["มีเฉลย","ไม่มีเฉลย"],0)),
      smartField("รูปแบบ",smartChips("wsStyle",["ขาวดำประหยัดหมึก","สีสวยสำหรับเด็ก","เรียบทางการ"],1))
    ].join("")
  }
  if(tool==="quiz"){
    return [
      smartField("รูปแบบข้อสอบ",smartChips("quizType",["ปรนัย 4 ตัวเลือก","อัตนัย","ปรนัย + อัตนัย","ถูก–ผิด","แบบผสม"],0)),
      smartField("จำนวนข้อ",smartChips("quizCount",["5","10","15","20"],1)),
      smartField("ระดับ",smartChips("quizLevel",["ง่าย","ปานกลาง","คละระดับ","ยาก"],2)),
      smartField("เฉลย",smartChips("quizAnswer",["มีเฉลย + คำอธิบาย","มีเฉลย","ไม่มีเฉลย"],0))
    ].join("")
  }
  if(tool==="knowledge"){
    return [
      smartField("รูปแบบใบความรู้",smartChips("knowType",["ใบความรู้ A4","Infographic","อ่านง่ายสำหรับนักเรียน","เนื้อหา + ตัวอย่าง","Mind Map"],0)),
      smartField("ระดับรายละเอียด",smartChips("knowDetail",["สั้น","ปานกลาง","ละเอียด"],1)),
      smartField("องค์ประกอบเสริม",smartChips("knowExtra",[
        {label:"มีตัวอย่าง",value:"มีตัวอย่าง"},
        {label:"ภาพประกอบ",value:"มีคำแนะนำภาพประกอบ"},
        {label:"คำถามท้ายใบ",value:"มีคำถามท้ายใบความรู้"}
      ],0,true))
    ].join("")
  }
  if(tool==="rubric"){
    return [
      smartField("ต้องการประเมินอะไร",smartChips("rubricType",["ชิ้นงาน","การปฏิบัติงาน","การนำเสนอ","การทำงานกลุ่ม","พฤติกรรม","Checklist"],0)),
      smartField("ระดับคะแนน",smartChips("rubricLevel",["3 ระดับ","4 ระดับ","5 ระดับ"],1)),
      smartField("เกณฑ์ผ่าน",smartChips("rubricPass",["60%","70%","80%"],1))
    ].join("")
  }
  if(tool==="game"){
    return [
      smartField("แนวเกม",smartChips("gameType",["Quiz Game","Bingo","Matching Game","Spin Wheel","Escape Room","Mission / Adventure","Team Competition","Board Game"],0)),
      smartField("นำไปสร้างกับอะไร",smartChips("gamePlatform",["Canva","Wordwall","Quizizz","Kahoot!","Genially","ChatGPT","HTML/Web Game","เกมกระดาษ"],0)),
      smartField("รูปแบบการเล่น",smartChips("gameMode",["รายบุคคล","คู่","กลุ่ม","แข่งขันทั้งห้อง"],2))
    ].join("")
  }
  if(tool==="pack"){
    return [
      smartField("Preset",smartChips("packPreset",["Pack ด่วน","Pack ครบ","Ultimate Teaching Pack"],1)),
      smartField("ชิ้นงานในชุด",smartChips("packItems",[
        {label:"📘 แผนการสอน",value:"แผนการสอน"},
        {label:"📚 ใบความรู้",value:"ใบความรู้"},
        {label:"📝 ใบงาน",value:"ใบงาน"},
        {label:"✅ แบบทดสอบ",value:"แบบทดสอบ"},
        {label:"💡 เฉลย",value:"เฉลย"},
        {label:"📊 Rubric",value:"Rubric"},
        {label:"🎮 เกม/กิจกรรม",value:"เกม/กิจกรรม"},
        {label:"📽️ สไลด์",value:"Prompt สร้างสไลด์"}
      ],0,true))
    ].join("")
  }
  return ""
}

function initSmartChips(){
  document.querySelectorAll(".smart-chips").forEach(group=>{
    const multi=group.dataset.multi==="1";
    group.querySelectorAll(".smart-chip").forEach(btn=>btn.onclick=()=>{
      if(multi)btn.classList.toggle("active");
      else{
        group.querySelectorAll(".smart-chip").forEach(x=>x.classList.remove("active"));
        btn.classList.add("active")
      }
    })
  })
}

function openSmartContinue(tool){
  const t=TOOLS.find(x=>x.id===tool);
  if(t&&tierRank(userTier())<tierRank(t.tier)){
    openAuth("login");toast(`เครื่องมือนี้สำหรับ ${t.tier.toUpperCase()}`);return
  }
  smartContinueTool=tool;
  const [icon,name]=continuationLabel(tool);
  $("smartConfigIcon").textContent=icon;
  $("smartConfigTitle").textContent=name;
  $("smartConfigBody").innerHTML=configTemplate(tool);
  $("smartContinueConfig").style.display="block";
  initSmartChips();
  $("smartContinueConfig").scrollIntoView({behavior:"smooth",block:"nearest"})
}

function chipValue(groupName){
  const group=document.querySelector(`[data-chip-group="${groupName}"]`);
  if(!group)return"";
  const active=[...group.querySelectorAll(".smart-chip.active")].map(x=>x.dataset.value);
  return active.join(", ")
}

function smartPromptFor(tool,c){
  const base=promptHeader(c);
  if(tool==="worksheet"){
    return `${base}

งานที่ต้องการ: ใบงานตามตัวชี้วัดเดิม
แนวใบงาน: ${chipValue("wsType")}
จำนวน: ${chipValue("wsCount")} ข้อ/ภารกิจ
เฉลย: ${chipValue("wsAnswer")}
รูปแบบงาน: ${chipValue("wsStyle")}

ข้อกำหนด:
1. ใช้ภาษาที่เหมาะกับ ${c.grade}
2. ทุกข้อสัมพันธ์กับตัวชี้วัดโดยตรง
3. มีชื่อใบงาน คำชี้แจง ช่องชื่อ–ชั้น–เลขที่
4. จัดโครงสร้างพร้อมนำไปทำ A4 ใน Canva/Word
5. หากเลือกมีเฉลย ให้แยกเฉลยท้ายใบงานอย่างชัดเจน`;
  }
  if(tool==="quiz"){
    return `${base}

งานที่ต้องการ: แบบทดสอบตามตัวชี้วัดเดิม
รูปแบบข้อสอบ: ${chipValue("quizType")}
จำนวน: ${chipValue("quizCount")} ข้อ
ระดับ: ${chipValue("quizLevel")}
เฉลย: ${chipValue("quizAnswer")}

ข้อกำหนด:
1. คำถามต้องวัดตัวชี้วัด ไม่ถามนอกประเด็น
2. ภาษาเหมาะกับ ${c.grade}
3. ถ้าเป็นปรนัย ให้มีตัวเลือกที่สมเหตุผลและไม่กำกวม
4. หากมีอัตนัย ให้มีแนวคำตอบ/เกณฑ์ให้คะแนน
5. หากเลือกมีคำอธิบาย ให้เขียนเหตุผลของคำตอบแบบกระชับ`;
  }
  if(tool==="knowledge"){
    return `${base}

งานที่ต้องการ: ใบความรู้
รูปแบบ: ${chipValue("knowType")}
ระดับรายละเอียด: ${chipValue("knowDetail")}
องค์ประกอบเสริม: ${chipValue("knowExtra")||"ไม่ระบุ"}

ข้อกำหนด:
1. เนื้อหาตรงกับตัวชี้วัดและเรื่องที่สอน
2. ใช้ภาษาที่เหมาะกับ ${c.grade}
3. มีหัวข้อย่อยและ Key Takeaway
4. ออกแบบโครงสร้างให้นำไปจัดหน้า A4/Infographic ได้ง่าย`;
  }
  if(tool==="rubric"){
    return `${base}

งานที่ต้องการ: Rubric / แบบประเมิน
ประเมิน: ${chipValue("rubricType")}
ระดับคะแนน: ${chipValue("rubricLevel")}
เกณฑ์ผ่าน: ${chipValue("rubricPass")}

ข้อกำหนด:
1. สร้างเกณฑ์จากกิจกรรมและผลลัพธ์ในแผนเดิม
2. ใช้พฤติกรรมที่สังเกตได้จริง
3. อธิบายคุณภาพแต่ละระดับให้แตกต่างชัดเจน
4. มีคะแนนรวมและวิธีแปลผล`;
  }
  if(tool==="game"){
    return `${base}

งานที่ต้องการ: เกม/กิจกรรมการเรียนรู้
แนวเกม: ${chipValue("gameType")}
แพลตฟอร์ม/ปลายทาง: ${chipValue("gamePlatform")}
รูปแบบการเล่น: ${chipValue("gameMode")}

ข้อกำหนด:
1. เกมต้องสัมพันธ์กับตัวชี้วัดและเรื่องเดิม
2. ระบุกติกา วิธีเล่น เวลา อุปกรณ์ และวิธีสรุปบทเรียน
3. หากเลือก Canva ให้สร้าง Prompt สำหรับออกแบบเกม/สไลด์ใน Canva
4. หากเลือก Wordwall/Quizizz/Kahoot!/Genially ให้จัดเนื้อหาและโครงกิจกรรมให้เหมาะกับแพลตฟอร์มนั้น
5. หากเลือก HTML/Web Game ให้สร้าง Prompt สำหรับให้ AI เขียนเกมเว็บ
6. หากเลือกเกมกระดาษ ให้ใช้อุปกรณ์ง่ายและพิมพ์ใช้งานได้`;
  }
  if(tool==="pack"){
    return `${base}

งานที่ต้องการ: Teaching Pack
Preset: ${chipValue("packPreset")}
ชิ้นงานที่เลือก: ${chipValue("packItems")}

ข้อกำหนด:
1. ทุกชิ้นใช้ตัวชี้วัด เรื่อง และระดับชั้นเดียวกัน
2. ให้แต่ละชิ้นเชื่อมโยงกันเป็นชุดการสอนเดียว
3. แยกหัวข้อของแต่ละชิ้นชัดเจน
4. พร้อมคัดลอกไปสร้างงานต่อใน AI/Canva/Word
5. หากเลือก Ultimate Teaching Pack ให้เพิ่มแนวทางนำชุดนี้ไปใช้จริงในห้องเรียน`;
  }
  return promptFor(tool,c)
}

function buildSmartContinuePrompt(){
  if(!smartContinueTool)return;
  const c=common();
  const p=smartPromptFor(smartContinueTool,c);
  const t=TOOLS.find(x=>x.id===smartContinueTool);
  $("promptText").textContent=p;
  $("promptBox").style.display="block";
  logPrompt(smartContinueTool,c,p);
  renderContinuePanel(smartContinueTool);
  $("smartContinueConfig").style.display="none";
  $("promptBox").scrollIntoView({behavior:"smooth",block:"start"});
  toast(`สร้าง Prompt ${t?.title||""} สำเร็จ ✓`)
}

if($("closeSmartConfig"))$("closeSmartConfig").onclick=()=>{$("smartContinueConfig").style.display="none"};
if($("smartCreateBtn"))$("smartCreateBtn").onclick=buildSmartContinuePrompt;

$("generateBtn").onclick=()=>{
  try{
    const t=TOOLS.find(x=>x.id===selectedTool);
    if(!t){toast("กรุณาเลือกสิ่งที่ต้องการสร้างก่อน");return}
    if(!$("topic").value.trim()){toast("กรุณาระบุเรื่องที่จะสอน");$("topic").focus();return}
    const rank=tierRank(userTier());
    if(rank<tierRank(t.tier)){openAuth("login");toast(`เครื่องมือนี้สำหรับ ${t.tier.toUpperCase()}`);return}
    const c=common();
    if(!c.r.indicator){toast("กรุณาเลือกตัวชี้วัด");return}
    const p=promptFor(t.id,c);
    $("promptText").textContent=p;
    $("promptBox").style.display="block";
    logPrompt(t.id,c,p);
    renderContinuePanel(t.id);
    $("promptBox").scrollIntoView({behavior:"smooth",block:"start"});
    toast("สร้าง Prompt สำเร็จ ✓")
  }catch(err){
    console.error("generate prompt error",err);
    toast("เกิดข้อผิดพลาดในการสร้าง Prompt กรุณารีเฟรชแล้วลองใหม่")
  }
};
$("copyPrompt").onclick=async()=>{try{await navigator.clipboard.writeText($("promptText").textContent);toast("คัดลอก Prompt แล้ว ✓")}catch{toast("คัดลอกอัตโนมัติไม่ได้")}};$("savePrompt").onclick=()=>toast(currentUser?"บันทึกในประวัติแล้ว":"เข้าสู่ระบบเพื่อบันทึกประวัติ");async function logPrompt(tool,c,p){if(!supabaseClient||!currentUser||currentProfile?.status!=="active")return;const title=TOOLS.find(x=>x.id===tool)?.title||tool;const {error}=await supabaseClient.from("prompt_history").insert({user_id:currentUser.id,product_type:tool,title,grade:c.grade,subject:c.subject,indicator_code:c.r.indicator,indicator_text:c.r.indicator_text,topic:c.topic,prompt_text:p});if(error)console.error("prompt_history",error)}
function savePrefs(){localStorage.setItem("klangPrefs",JSON.stringify({stage:ACTIVE_STAGE,grade:$("grade").value,subject:$("subject").value}))}function restorePrefs(){try{const p=JSON.parse(localStorage.getItem("klangPrefs")||"{}");if(p.stage&&grades[p.stage])ACTIVE_STAGE=p.stage}catch{}}
// ADMIN
function requireAdmin(){return currentProfile?.role==="admin"&&currentProfile?.status==="active"}
document.querySelectorAll("[data-admin]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".admin-tab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".admin-pane").forEach(x=>x.classList.toggle("active",x.id==="admin-"+b.dataset.admin))});
async function loadAdmin(){if(!backendReady()){$("backendWarning").style.display="block";return}if(!requireAdmin()){$("backendWarning").style.display="block";$("backendWarning").textContent="กรุณาเข้าสู่ระบบด้วยบัญชี Admin ที่เปิดใช้งานแล้ว";return}$("backendWarning").style.display="none";const [{data:profiles,error:pe},{data:requests,error:re},{count:phCount},{data:invites,error:ie},{data:usage,error:ue}]=await Promise.all([supabaseClient.from("profiles").select("id,email,full_name,school_name,facebook_name,phone,role,status,requested_role,invite_code,membership_started_at,membership_expires_at,created_at").order("created_at",{ascending:false}),supabaseClient.from("membership_requests").select("id,user_id,requested_role,status,invite_code,note,payment_reference,created_at,reviewed_at").order("created_at",{ascending:false}),supabaseClient.from("prompt_history").select("id",{count:"exact",head:true}),supabaseClient.from("invite_codes").select("id,code,label,target_role,is_active,max_uses,used_count,expires_at,created_at").order("created_at",{ascending:false}),supabaseClient.from("prompt_history").select("created_at,product_type,title,grade,subject,indicator_code,user_id").order("created_at",{ascending:false}).limit(100)]);if(pe||re||ie||ue)console.error("admin load",pe||re||ie||ue);const pendingByUser={};(requests||[]).filter(r=>r.status==="pending").forEach(r=>{if(!pendingByUser[r.user_id])pendingByUser[r.user_id]=r});renderMembers(profiles||[],pendingByUser);renderInvites(invites||[]);renderUsage(usage||[]);$("kAll").textContent=profiles?.length||0;$("kPending").textContent=(profiles||[]).filter(x=>x.status==="pending").length;$("kVip").textContent=(profiles||[]).filter(x=>x.role==="vip"&&x.status==="active").length;$("kPrompts").textContent=phCount||0}
function renderMembers(a,pendingByUser=window._pendingByUser||{}){window._profilesAll=a;window._pendingByUser=pendingByUser;const q=$("memberSearch").value?.toLowerCase()||"",view=a.filter(x=>!q||[x.full_name,x.email,x.school_name,x.phone,x.facebook_name].join(" ").toLowerCase().includes(q));$("memberRows").innerHTML=view.map(x=>{const req=pendingByUser[x.id],requested=req?.requested_role||x.requested_role||"member",expiry=x.membership_expires_at?new Date(x.membership_expires_at).toLocaleDateString("th-TH"):"—";return `<tr><td><b>${x.full_name||"-"}</b><br>${x.email||"-"}<br><small>${x.phone||""}</small></td><td>${x.school_name||"-"}</td><td><span class="status ${x.status}">${x.status}</span></td><td>${x.role}${x.status==="pending"?`<br><small>ขอ: ${requested.toUpperCase()}</small>`:""}</td><td>${expiry}</td><td><div class="admin-actions">${x.status==="pending"?`<button class="btn btn-blue mini" onclick="approveMember('${x.id}','member','${req?.id||""}')">อนุมัติ Member</button><button class="btn btn-gold mini" onclick="approveMember('${x.id}','vip','${req?.id||""}')">อนุมัติ VIP</button>`:""}<button class="btn btn-ghost mini" onclick="setMemberStatus('${x.id}','active','${x.role}','${req?.id||""}')">Active</button><button class="btn btn-red mini" onclick="setMemberStatus('${x.id}','suspended','${x.role}','${req?.id||""}')">ระงับ</button></div></td></tr>`}).join("")}
$("memberSearch").oninput=()=>renderMembers(window._profilesAll||[],window._pendingByUser||{});
window.approveMember=async(id,role,requestId)=>{const expires=role==="vip"?new Date(Date.now()+365*86400000).toISOString():null,{error}=await supabaseClient.rpc("admin_set_member",{p_user_id:id,p_status:"active",p_role:role,p_expires_at:expires,p_request_id:requestId||null});if(error){toast(error.message);return}toast(`อนุมัติ ${role.toUpperCase()} แล้ว`);loadAdmin()};
window.setMemberStatus=async(id,status,role,requestId)=>{const p=(window._profilesAll||[]).find(x=>x.id===id),{error}=await supabaseClient.rpc("admin_set_member",{p_user_id:id,p_status:status,p_role:role||p?.role||"member",p_expires_at:p?.membership_expires_at||null,p_request_id:requestId||null});if(error){toast(error.message);return}toast("อัปเดตสถานะแล้ว");loadAdmin()};
$("createInvite").onclick=async()=>{if(!requireAdmin()){toast("ต้องเป็น Admin");return}const days=Number($("inviteDays").value||30),maxUses=Number($("inviteMax").value||1),role=$("inviteTier").value,expires=new Date(Date.now()+days*86400000).toISOString(),{data,error}=await supabaseClient.rpc("admin_create_invite",{p_label:`Web invite ${new Date().toLocaleDateString("th-TH")}`,p_target_role:role,p_max_uses:maxUses,p_expires_at:expires});if(error){toast(error.message);return}const row=Array.isArray(data)?data[0]:data,code=row?.code;if(!code){toast("สร้างลิงก์ไม่สำเร็จ");return}const link=`${CFG.siteUrl||location.origin}/?invite=${code}`;$("inviteOutput").innerHTML=`<div class="codebox">${link}</div>`;try{await navigator.clipboard.writeText(link)}catch{}toast("สร้างและคัดลอกลิงก์เชิญแล้ว");loadAdmin()};
function renderInvites(a){$("inviteRows").innerHTML=a.map(x=>{const link=`${CFG.siteUrl||location.origin}/?invite=${x.code}`;return `<tr><td><b>${x.code}</b>${x.label?`<br><small>${x.label}</small>`:""}</td><td>${x.target_role}</td><td>${x.used_count||0}/${x.max_uses??"∞"}</td><td>${x.expires_at?new Date(x.expires_at).toLocaleDateString("th-TH"):"—"}</td><td><button class="btn btn-ghost mini" onclick="navigator.clipboard.writeText('${link}');toast('คัดลอกแล้ว')">คัดลอก</button></td></tr>`}).join("")}
function renderUsage(a){$("usageRows").innerHTML=a.map(x=>`<tr><td>${new Date(x.created_at).toLocaleString("th-TH")}</td><td>${x.user_id.slice(0,8)}…</td><td>${x.product_type}</td><td>${x.grade} / ${x.subject}</td><td>${x.indicator_code||"—"}</td></tr>`).join("")}
fetch("data.json",{cache:"no-store"})
.then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.json()})
.then(d=>{
  DATA=Array.isArray(d)?d:[];document.documentElement.dataset.curriculumReady="1";
  if(!DATA.length)throw new Error("ฐานข้อมูลว่าง");
  restorePrefs();syncStageTabs();buildGrades();
  const p=JSON.parse(localStorage.getItem("klangPrefs")||"{}");
  if(p.grade&&[...$("grade").options].some(o=>o.value===p.grade)){$("grade").value=p.grade;buildSubjects()}
  if(p.subject&&[...$("subject").options].some(o=>o.value===p.subject)){$("subject").value=p.subject;buildIndicators()}
  renderTools();renderSummary();initBackend()
})
.catch(e=>{
  console.error(e);
  ["grade","subject","indicator"].forEach(id=>setSelectState($(id),[],"โหลดข้อมูลไม่สำเร็จ"));
  $("indicatorBox").innerHTML="<b>โหลดฐานข้อมูลไม่สำเร็จ</b><br>กรุณารีเฟรชหน้าเว็บอีกครั้ง"
});