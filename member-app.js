(()=>{"use strict";
const $=id=>document.getElementById(id), $$=s=>[...document.querySelectorAll(s)];
const CFG=window.KLANG_CONFIG||{};
let sb=null,user=null,profile=null,DATA=[],cloudPlans=[],activeWorkspacePlan=null,stage="ปฐมวัย",selected=null,librarySelected=null,style="Modern Government",palette="ฟ้า–ม่วง–ทอง";
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
const affiliationMeta={
  obec:{title:"สพฐ. / กระทรวงศึกษาธิการ",short:"กรอบหลักสูตรแกนกลาง + มาตรฐาน/ตัวชี้วัด",tags:["มาตรฐานและตัวชี้วัด","สมรรถนะสำคัญของผู้เรียน","คุณลักษณะอันพึงประสงค์"],prompt:"ให้ยึดหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน มาตรฐาน ตัวชี้วัด สมรรถนะสำคัญของผู้เรียน และคุณลักษณะอันพึงประสงค์ที่สัมพันธ์กับบทเรียน"},
  bma:{title:"กรุงเทพมหานคร (กทม.)",short:"ปรับแผนให้รองรับกรอบสมรรถนะผู้เรียน 7 ด้านของ กทม.",tags:["สมรรถนะผู้เรียน 7 ด้าน","บริบทโรงเรียน กทม.","กิจกรรมเชิงสมรรถนะ"],prompt:"ให้ปรับแผนให้เหมาะกับโรงเรียนสังกัดกรุงเทพมหานคร และเพิ่มหัวข้อ “สมรรถนะผู้เรียน 7 ด้านที่เกี่ยวข้อง” โดยเลือกเฉพาะด้านที่สัมพันธ์กับกิจกรรมจริง ไม่จำเป็นต้องใส่ครบทั้ง 7 ด้านทุกแผน"},
  local:{title:"อปท. / เทศบาล / อบจ. / อบต.",short:"เน้นบริบทท้องถิ่น ชุมชน และการนำไปใช้จริง",tags:["บริบทท้องถิ่น","ชุมชนและพื้นที่","การเรียนรู้เชื่อมชีวิตจริง"],prompt:"ให้ปรับแผนให้เหมาะกับสถานศึกษาสังกัดองค์กรปกครองส่วนท้องถิ่น โดยเชื่อมโยงบริบทชุมชน ท้องถิ่น และทรัพยากรในพื้นที่เมื่อเหมาะสม โดยยังยึดมาตรฐาน/ตัวชี้วัดตามข้อมูลหลักสูตร"},
  private:{title:"โรงเรียนเอกชน / สช.",short:"ใช้หลักสูตรแกนกลางเป็นฐาน และเปิดรับกรอบเฉพาะของโรงเรียน",tags:["หลักสูตรแกนกลางเป็นฐาน","อัตลักษณ์โรงเรียน","กรอบเสริมของสถานศึกษา"],prompt:"ให้ใช้หลักสูตรและตัวชี้วัดที่กำหนดเป็นฐาน และเปิดพื้นที่ให้สถานศึกษาเอกชนเพิ่มเติมอัตลักษณ์ สมรรถนะ หรือแนวทางเฉพาะของโรงเรียน โดยไม่แต่งข้อมูลที่ผู้ใช้ไม่ได้ระบุ"},
  university:{title:"โรงเรียนสาธิต / มหาวิทยาลัย",short:"รองรับการทดลองนวัตกรรมการสอนและการสะท้อนผล",tags:["นวัตกรรมการเรียนรู้","การสะท้อนผล","การประเมินตามสภาพจริง"],prompt:"ให้ปรับแผนให้เหมาะกับบริบทโรงเรียนสาธิตหรือสถานศึกษาภายใต้มหาวิทยาลัย โดยสามารถเน้นนวัตกรรมการจัดการเรียนรู้ การวิจัยในชั้นเรียน และการประเมินตามสภาพจริงเมื่อเหมาะสม"},
  custom:{title:"อื่น ๆ / กำหนดเอง",short:"ใช้คำอธิบายของผู้ใช้เป็นกรอบเพิ่มเติม",tags:["กำหนดเอง","ยืดหยุ่นตามหน่วยงาน"],prompt:"ให้ปรับแผนตามกรอบหรือข้อกำหนดของหน่วยงานที่ผู้ใช้ระบุเพิ่มเติม โดยไม่คาดเดาข้อมูลที่ไม่ได้ให้"}
};

const gradeOrder={"ปฐมวัย":["อ.1","อ.2","อ.3"],"ประถมศึกษา":["ป.1","ป.2","ป.3","ป.4","ป.5","ป.6"],"มัธยมศึกษา":["ม.1","ม.2","ม.3","ม.4","ม.5","ม.6"]};
const unique=a=>[...new Set(a.filter(Boolean))], esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function recordGrades(x){
  const a=Array.isArray(x?.available_grades)?x.available_grades.filter(Boolean):[];
  return a.length?a:[x?.grade].filter(Boolean)
}
function recordMatchesGrade(x,g){return !g||recordGrades(x).includes(g)}
function displayGradeForRecord(x,fallback=""){return fallback||recordGrades(x)[0]||x?.grade||""}
function toast(t){const x=$("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
function avatar(v){const p={"avatar:teacher":"👩‍🏫","avatar:teacher_male":"👨‍🏫","avatar:book":"📚","avatar:star":"⭐"};if(p[v])return p[v];if(v?.startsWith("data:image/"))return `<img src="${v}" alt="">`;return "👤"}
async function auth(){
  if(!window.supabase||!CFG.supabaseUrl||!(CFG.supabasePublishableKey||CFG.supabaseAnonKey)){location.replace("/teacher.html");return false}
  sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabasePublishableKey||CFG.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,storageKey:"klang-member-auth"}});
  const {data}=await sb.auth.getSession(); if(!data?.session){location.replace("/teacher.html");return false}
  user=data.session.user;
  const {data:p}=await sb.from("profiles").select("id,full_name,school_name,avatar_url,role,status,member_id,membership_started_at,membership_expires_at").eq("id",user.id).maybeSingle();
  if(!p||p.role!=="member"||p.status!=="active"){await sb.auth.signOut();location.replace("/teacher.html");return false}
  if(p.membership_expires_at&&new Date(p.membership_expires_at).getTime()<=Date.now()){
    await sb.auth.signOut();location.replace("/teacher.html?expired=1");return false
  }
  profile=p;renderProfile();return true
}
function renderProfile(){$("profileName").textContent=profile.full_name||"โปรไฟล์";$("profileMemberId").textContent=profile.member_id||"สมาชิก";$("profileAvatar").innerHTML=avatar(profile.avatar_url);$("profileAvatarLarge").innerHTML=avatar(profile.avatar_url);$("profileIdText").textContent=profile.member_id||"สมาชิก";$("profileDisplayName").value=profile.full_name||"";$("profileSchool").value=profile.school_name||""}
async function loadData(){const r=await fetch("/data.json?v=870",{cache:"no-store"});if(!r.ok)throw new Error("data "+r.status);DATA=await r.json();
if(!Array.isArray(DATA)||DATA.length!==2155)throw new Error("Curriculum dataset integrity check failed");
buildGrades();
try{updateLibraryFilters()}catch(err){console.warn("library filters",err)}
renderStyles();
renderAffiliation();
updateSummary()}
function opt(el,val,text=val){const o=document.createElement("option");o.value=val;o.textContent=text;el.appendChild(o)}
function setOpts(el,vals,ph){el.innerHTML="";opt(el,"",ph);vals.forEach(v=>opt(el,v));el.disabled=false}
function buildGrades(){
  const records=DATA.filter(x=>x.stage===stage);
  const avail=unique(records.flatMap(recordGrades));
  const arr=(gradeOrder[stage]||[]).filter(x=>avail.includes(x));
  setOpts($("grade"),arr.length?arr:avail,"เลือกระดับชั้น");
  setOpts($("subject"),[],"เลือกระดับชั้นก่อน");$("subject").disabled=true;
  setOpts($("indicator"),[],"เลือกชั้นและกลุ่มสาระก่อน");$("indicator").disabled=true
}
function buildSubjects(){
  const g=$("grade").value;if(!g){buildGrades();return}
  const vals=unique(DATA.filter(x=>x.stage===stage&&recordMatchesGrade(x,g)).map(x=>x.subject));
  setOpts($("subject"),vals,"เลือกกลุ่มสาระ / ด้าน");
  setOpts($("indicator"),[],"เลือกกลุ่มสาระก่อน");$("indicator").disabled=true;
  selected=null;updateSummary()
}
function filteredIndicators(){
  const g=$("grade").value,s=$("subject").value,q=$("indicatorSearch").value.trim().toLowerCase();
  return DATA.filter(x=>x.stage===stage&&recordMatchesGrade(x,g)&&x.subject===s&&(!q||[x.indicator,x.indicator_text,x.standard,x.domain].some(v=>String(v||"").toLowerCase().includes(q))))
}
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
function renderAffiliation(){
  const key=$("affiliationType")?.value||"obec";
  const meta=affiliationMeta[key]||affiliationMeta.obec;
  if($("affiliationTitle"))$("affiliationTitle").textContent=meta.title;
  if($("affiliationDesc"))$("affiliationDesc").textContent=meta.short;
  if($("affiliationTags"))$("affiliationTags").innerHTML=meta.tags.map(x=>`<span>${esc(x)}</span>`).join("");
  if($("customAffiliationWrap"))$("customAffiliationWrap").hidden=key!=="custom";
  updateSummary()
}
function updateSummary(){const vals=[["ช่วงชั้น",stage],["ชั้น",$("grade")?.value],["กลุ่มสาระ",$("subject")?.value],["ตัวชี้วัด",selected?.indicator],["หน่วย",$("unitName")?.value],["เรื่อง",$("topic")?.value],["สังกัด",(affiliationMeta[$("affiliationType")?.value||"obec"]||affiliationMeta.obec).title],["ภาคเรียน",$("semester")?.value],["ปีการศึกษา",$("academicYear")?.value],["วันที่สอน",$("includeTeachingDate")?.checked?$("teachingDate")?.value:""],["ลงนาม",$("includeSignatures")?.checked?"มี":"ไม่ใช้"],["สไตล์",style],["สี",palette]];$("summary").innerHTML=vals.filter(x=>x[1]).map(x=>`<div class="sum"><b>${x[0]}</b><span>${esc(x[1])}</span></div>`).join("")}
function v(id){return $(id).value.trim()}
function prompt(){
  if(!selected)return"";
  const sem=v("semester")||"ไม่ระบุ";
  const year=v("academicYear")||"ไม่ระบุ";
  const teachingDate=$("includeTeachingDate").checked?(v("teachingDate")||"ยังไม่ระบุ"):"ไม่ใช้ส่วนวันที่สอน";
  const signatures=$("includeSignatures").checked;
  const teacherSign=v("teacherSignatureName")||v("teacherName")||"........................................";
  const customStyle=v("customStyleDirection")||"ไม่มีคำแนะนำเพิ่มเติม";
  const affiliationKey=$("affiliationType")?.value||"obec";
  const affiliation=affiliationMeta[affiliationKey]||affiliationMeta.obec;
  const customAffiliation=v("customAffiliationNote")||"ไม่มีคำอธิบายเพิ่มเติม";
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
ระดับชั้น: ${$("grade")?.value||selected.grade}
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
ประเภทสังกัด / ระบบการศึกษา: ${affiliation.title}
หน่วยงาน / สังกัดที่แสดงในแผน: ${v("organization")||"ไม่ระบุ"}
จังหวัด: ${v("province")||"ไม่ระบุ"}

แนวทางเฉพาะตามสังกัด
${affiliation.prompt}
${affiliationKey==="custom"?"คำอธิบายเพิ่มเติมจากผู้ใช้: "+customAffiliation:""}
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
async function saveWork(t){
  const payload={user_id:user.id,title:v("topic")||selected?.indicator||"แผนการจัดการเรียนรู้",stage,grade:$("grade").value||null,subject:$("subject").value||null,domain:selected?.domain||null,standard:selected?.standard||null,indicator:selected?.indicator||null,indicator_text:selected?.indicator_text||null,unit_name:v("unitName")||null,topic:v("topic")||null,duration:v("duration")||null,method:v("method")||null,semester:$("semester")?.value||null,academic_year:v("academicYear")||null,teaching_date:$("includeTeachingDate")?.checked&&v("teachingDate")?v("teachingDate"):null,affiliation_type:$("affiliationType")?.value||"obec",organization:v("organization")||null,teacher_name:v("teacherName")||null,school_name:v("schoolName")||null,style,palette,prompt_text:t,status:"ready"};if(activeCourseLessonContext){const c=courseDrafts()[activeCourseLessonContext.courseIndex],u=c?.learning_units?.units?.[activeCourseLessonContext.unitIndex];if(c?._cloud_id)payload.course_id=c._cloud_id;if(u?._cloud_id)payload.unit_id=u._cloud_id}
  const {data,error}=await sb.from("lesson_plans").insert(payload).select("*").single();
  if(error){console.warn("cloud save",error);return null}
  cloudPlans.unshift(data);if(activeCourseLessonContext){const rows=courseDrafts(),c=rows[activeCourseLessonContext.courseIndex];if(c){c.lesson_resources=c.lesson_resources||{items:[]};c.lesson_resources.items.push({type:"lesson_plan",unit_id:activeCourseLessonContext.unitClientId||null,lesson_plan_id:data.id,title:data.title,created_at:new Date().toISOString()});c.lesson_resources.saved_at=new Date().toISOString();rows[activeCourseLessonContext.courseIndex]=c;writeCourseDrafts(rows);renderCourses()}}renderWork();return data
}
async function generate(){if(!$("grade").value)return toast("กรุณาเลือกระดับชั้น");if(!$("subject").value)return toast("กรุณาเลือกกลุ่มสาระ");if(!selected)return toast("กรุณาเลือกตัวชี้วัด");const t=prompt();$("promptText").textContent=t;$("promptWrap").hidden=false;await saveWork(t);renderContinue();setTimeout(()=>$("promptWrap").scrollIntoView({behavior:"smooth"}),50);toast("สร้าง Prompt แล้ว ✓")}
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
function switchTab(name){$$(".page").forEach(x=>x.classList.toggle("active",x.id===`tab-${name}`));$$(".top-tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===name));$$("[data-bottom-tab]").forEach(x=>x.classList.toggle("active",x.dataset.bottomTab===name));if(name==="work")loadCloudPlans();window.scrollTo({top:0,behavior:"smooth"})}
async function loadCloudPlans(){
  if(!sb||!user)return;const {data,error}=await sb.from("lesson_plans").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(200);if(error){console.warn(error);return}cloudPlans=data||[];populatePlanFilters();renderWork()
}
function populatePlanFilters(){const grades=unique(cloudPlans.map(x=>x.grade)),subjects=unique(cloudPlans.map(x=>x.subject)),g=$("planGradeFilter"),s=$("planSubjectFilter");if(!g||!s)return;g.innerHTML='<option value="">ทุกชั้น</option>'+grades.map(x=>`<option>${esc(x)}</option>`).join("");s.innerHTML='<option value="">ทุกวิชา</option>'+subjects.map(x=>`<option>${esc(x)}</option>`).join("")}
function renderWork(){const wrap=$("workList");if(!wrap)return;const q=($("planSearch")?.value||"").toLowerCase().trim(),g=$("planGradeFilter")?.value||"",s=$("planSubjectFilter")?.value||"";const rows=cloudPlans.filter(x=>(!g||x.grade===g)&&(!s||x.subject===s)&&(!q||[x.title,x.topic,x.unit_name,x.indicator,x.indicator_text,x.subject,x.grade].some(v=>String(v||"").toLowerCase().includes(q))));$("cloudPlanCount").textContent=cloudPlans.length;$("reflectionCount").textContent=cloudPlans.filter(x=>x.reflection_text?.trim()).length;const now=new Date();$("thisMonthPlanCount").textContent=cloudPlans.filter(x=>{const d=new Date(x.created_at);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()}).length;wrap.innerHTML=rows.map(x=>`<article class="plan-workspace-item"><div class="plan-workspace-main"><span class="plan-doc-icon">📘</span><div><b>${esc(x.title)}</b><small>${esc(x.grade||"")} · ${esc(x.subject||"")} · ${esc(x.indicator||"")}</small><em>${esc(x.unit_name||"")}${x.updated_at?` · แก้ไขล่าสุด ${new Date(x.updated_at).toLocaleDateString("th-TH")}`:""}</em></div></div><div class="plan-workspace-right">${x.reflection_text?'<span class="reflection-badge">มีบันทึกหลังสอน</span>':""}<button type="button" class="secondary-btn" data-open-cloud-plan="${x.id}">เปิด</button></div></article>`).join("")||'<div class="list-item">ยังไม่มีแผนที่บันทึกไว้</div>';$$('[data-open-cloud-plan]').forEach(b=>b.onclick=()=>openWorkspacePlan(b.dataset.openCloudPlan))}
function openWorkspacePlan(id){activeWorkspacePlan=cloudPlans.find(x=>x.id===id);if(!activeWorkspacePlan)return;$("workspacePlanTitle").textContent=activeWorkspacePlan.title||"แผนการจัดการเรียนรู้";$("workspacePlanMeta").textContent=[activeWorkspacePlan.grade,activeWorkspacePlan.subject,activeWorkspacePlan.indicator].filter(Boolean).join(" · ");$("workspacePromptText").textContent=activeWorkspacePlan.prompt_text||"";$("workspaceReflection").value=activeWorkspacePlan.reflection_text||"";$("workspacePlanStatus").textContent=activeWorkspacePlan.reflection_text?"สอนแล้ว / มี Reflection":"พร้อมใช้";$("planWorkspaceModal").hidden=false}
function closeWorkspacePlan(){$("planWorkspaceModal").hidden=true}
function workspaceContinuation(type){if(!activeWorkspacePlan)return;const intro={worksheet:"สร้างใบงานจากแผนนี้ พร้อมคำชี้แจง พื้นที่ตอบ และเฉลย",quiz:"สร้างแบบทดสอบจากแผนนี้ พร้อมเฉลย",game:"สร้างเกมการเรียนรู้จากแผนนี้ พร้อมกติกา คำถาม เฉลย และแพลตฟอร์มที่เหมาะ",pack:"สร้าง Teaching Pack จากแผนนี้ ประกอบด้วย ใบความรู้ ใบงาน แบบทดสอบ Rubric และเกม"};switchTab("create");$("promptText").textContent=`${intro[type]||"สร้างสื่อการสอนต่อจากแผนนี้"}

ข้อมูลแผนเดิม:
---
${activeWorkspacePlan.prompt_text||""}`;$("promptWrap").hidden=false;closeWorkspacePlan();setTimeout(()=>$("promptWrap").scrollIntoView({behavior:"smooth"}),80)}
function legacyDownloadWord(plan){const body=`<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Tahoma,Arial;line-height:1.6;padding:24px}pre{white-space:pre-wrap;font-family:Tahoma,Arial}</style></head><body><h1>${esc(plan.title||"แผนการจัดการเรียนรู้")}</h1><pre>${esc(plan.prompt_text||"")}</pre>${plan.reflection_text?`<h2>บันทึกหลังสอน</h2><p>${esc(plan.reflection_text)}</p>`:""}</body></html>`;const blob=new Blob(["\ufeff",body],{type:"application/msword;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=(plan.title||"klang-plan")+".doc";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function legacyPrintPlanPdf(plan){const w=window.open("","_blank");if(!w)return toast("เบราว์เซอร์ปิดกั้นหน้าต่าง");w.document.write(`<html><head><meta charset="utf-8"><style>body{font-family:Arial;padding:28px;line-height:1.65}pre{white-space:pre-wrap}</style></head><body><h2>${esc(plan.title||"แผนการจัดการเรียนรู้")}</h2><pre>${esc(plan.prompt_text||"")}</pre>${plan.reflection_text?`<h3>บันทึกหลังสอน</h3><p>${esc(plan.reflection_text)}</p>`:""}<script>setTimeout(()=>print(),250)<\/script></body></html>`);w.document.close()}
async function saveReflection(){if(!activeWorkspacePlan)return;const text=$("workspaceReflection").value.trim();const {data,error}=await sb.from("lesson_plans").update({reflection_text:text||null}).eq("id",activeWorkspacePlan.id).select("*").single();if(error)return $("reflectionStatus").innerHTML=`<div class="error-box">${esc(error.message)}</div>`;const i=cloudPlans.findIndex(x=>x.id===data.id);if(i>=0)cloudPlans[i]=data;activeWorkspacePlan=data;$("reflectionStatus").innerHTML='<div class="indicator-preview">บันทึกหลังสอนแล้ว ✓</div>';renderWork()}
async function deleteCloudPlan(){if(!activeWorkspacePlan||!confirm(`ลบ “${activeWorkspacePlan.title}” หรือไม่?`))return;const {error}=await sb.from("lesson_plans").delete().eq("id",activeWorkspacePlan.id);if(error)return toast(error.message);cloudPlans=cloudPlans.filter(x=>x.id!==activeWorkspacePlan.id);closeWorkspacePlan();renderWork();toast("ลบแผนแล้ว")}

function updateLibraryFilters(){
  const stageEl=$("libraryStage"),gradeEl=$("libraryGrade"),subjectEl=$("librarySubject");
  if(!stageEl||!gradeEl||!subjectEl)return;
  const st=stageEl.value;
  const rows=DATA.filter(x=>!st||x.stage===st);
  const grades=unique(rows.flatMap(recordGrades));
  const order=["อ.1","อ.2","อ.3","ป.1","ป.2","ป.3","ป.4","ป.5","ป.6","ม.1","ม.2","ม.3","ม.4","ม.5","ม.6"];
  grades.sort((a,b)=>order.indexOf(a)-order.indexOf(b));
  const oldGrade=gradeEl.value;
  gradeEl.innerHTML='<option value="">ทั้งหมด</option>'+grades.map(g=>`<option value="${esc(g)}">${esc(g)}</option>`).join("");
  if(grades.includes(oldGrade))gradeEl.value=oldGrade;
  updateLibrarySubjects()
}
function updateLibrarySubjects(){
  const stageEl=$("libraryStage"),gradeEl=$("libraryGrade"),subjectEl=$("librarySubject");
  if(!stageEl||!gradeEl||!subjectEl)return;
  const st=stageEl.value,g=gradeEl.value;
  const rows=DATA.filter(x=>(!st||x.stage===st)&&recordMatchesGrade(x,g));
  const subjects=unique(rows.map(x=>x.subject));
  const oldSubject=subjectEl.value;
  subjectEl.innerHTML='<option value="">ทั้งหมด</option>'+subjects.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join("");
  if(subjects.includes(oldSubject))subjectEl.value=oldSubject;
  applyLibraryFilters()
}
function applyLibraryFilters(){
  const st=$("libraryStage")?.value||"";
  const g=$("libraryGrade")?.value||"";
  const s=$("librarySubject")?.value||"";
  const q=($("librarySearch")?.value||"").toLowerCase().trim();
  const rows=DATA.filter(x=>
    (!st||x.stage===st) &&
    recordMatchesGrade(x,g) &&
    (!s||x.subject===s) &&
    (!q||[x.indicator,x.indicator_text,x.standard,x.subject,x.grade,x.domain]
      .some(v=>String(v||"").toLowerCase().includes(q)))
  );
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
  const preferredGrade=$("libraryGrade")?.value||recordGrades(librarySelected)[0]||librarySelected.grade;
  buildGrades();
  $("grade").value=preferredGrade;buildSubjects();
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

const COURSE_DRAFT_KEY="klang-v92-course-drafts";
let activeCourseIndex=null,courseCloudReady=false,courseSyncBusy=false,activeCourseLessonContext=null;
function courseDrafts(){try{return JSON.parse(localStorage.getItem(COURSE_DRAFT_KEY)||"[]")}catch{return []}}
function courseSyncStatus(text,tone=""){const el=$("courseSyncStatus");if(!el)return;el.textContent=text;el.dataset.tone=tone}
function cleanCourseForCloud(c){const x=JSON.parse(JSON.stringify(c||{}));delete x._cloud_id;delete x._sync;return x}
function courseDbPayload(c){return {user_id:user.id,client_id:c.id,name:c.name||"รายวิชา",stage:String(c.grade||"").startsWith("ม.")?"มัธยมศึกษา":String(c.grade||"").startsWith("ป.")?"ประถมศึกษา":"ปฐมวัย",grade:c.grade||"",subject:c.subject||null,semester:c.semester||null,academic_year:c.year||null,total_hours:Number(c.hours)||0,school_name:c.school||profile?.school_name||null,status:c.documents?.saved_at?"complete":c.assessments?.saved_at?"assessments_ready":c.lesson_resources?.saved_at?"lessons_ready":c.learning_units?.saved_at?"units_ready":c.teaching_schedule?.saved_at?"schedule_ready":c.course_structure?.saved_at?"structure_ready":c.course_description?.saved_at?"description_ready":c.curriculum_analysis?.saved_at?"curriculum_ready":"draft",workflow_data:cleanCourseForCloud(c),updated_at:c.updated_at||new Date().toISOString()}}
function writeCourseDrafts(rows,{sync=true}={}){const now=new Date().toISOString();rows.forEach(c=>{if(c)c.updated_at=now});localStorage.setItem(COURSE_DRAFT_KEY,JSON.stringify(rows));if(sync&&courseCloudReady)queueMicrotask(()=>syncCoursesToCloud(rows))}
async function loadCoursesFromCloud(){const local=courseDrafts();if(!sb||!user){return local}courseSyncStatus("กำลังตรวจ Cloud…");const {data,error}=await sb.from("courses").select("id,client_id,name,stage,grade,subject,semester,academic_year,total_hours,school_name,status,workflow_data,updated_at").eq("user_id",user.id).order("updated_at",{ascending:false});if(error){courseCloudReady=false;courseSyncStatus("Local cache · ยังไม่ได้เปิด Cloud","local");console.warn("courses cloud unavailable",error);return local}courseCloudReady=true;const cloud=(data||[]).map(r=>{const c=(r.workflow_data&&typeof r.workflow_data==="object")?r.workflow_data:{};return {...c,id:c.id||r.client_id||r.id,name:c.name||r.name,grade:c.grade||r.grade,subject:c.subject??r.subject,semester:c.semester??r.semester,year:c.year??r.academic_year,hours:c.hours??r.total_hours,school:c.school??r.school_name,updated_at:c.updated_at||r.updated_at,_cloud_id:r.id,_sync:"cloud"}});const by=new Map();for(const c of cloud)by.set(c.id,c);for(const c of local){const prev=by.get(c.id);if(!prev||String(c.updated_at||c.created_at||"")>String(prev.updated_at||prev.created_at||""))by.set(c.id,c)}const merged=[...by.values()].sort((a,b)=>String(b.updated_at||b.created_at||"").localeCompare(String(a.updated_at||a.created_at||"")));writeCourseDrafts(merged,{sync:false});courseSyncStatus(`Cloud พร้อม · ${cloud.length} รายวิชา`,"cloud");if(local.length)await syncCoursesToCloud(merged,{silent:true});return merged}
async function syncCoursesToCloud(rows=courseDrafts(),{silent=false}={}){if(!courseCloudReady||courseSyncBusy||!sb||!user)return false;courseSyncBusy=true;if(!silent)courseSyncStatus("กำลังซิงก์ Cloud…");try{const payload=rows.map(c=>{c.updated_at=c.updated_at||new Date().toISOString();return courseDbPayload(c)});if(payload.length){const {error}=await sb.from("courses").upsert(payload,{onConflict:"user_id,client_id"});if(error)throw error}writeCourseDrafts(rows,{sync:false});courseSyncStatus(`ซิงก์แล้ว · ${rows.length} รายวิชา`,"cloud");return true}catch(error){console.warn("course sync failed",error);courseSyncStatus("ซิงก์ไม่สำเร็จ · เก็บ Local ไว้แล้ว","error");return false}finally{courseSyncBusy=false}}
async function deleteCourseDraft(i){const rows=courseDrafts(),c=rows[i];if(!c)return;if(courseCloudReady){const {error}=await sb.from("courses").delete().eq("user_id",user.id).eq("client_id",c.id);if(error){console.warn("delete course cloud",error);courseSyncStatus("ลบจาก Cloud ไม่สำเร็จ · ยังไม่ลบ Local","error");return}}rows.splice(i,1);writeCourseDrafts(rows,{sync:false});renderCourses();courseSyncStatus(courseCloudReady?`Cloud พร้อม · ${rows.length} รายวิชา`:"Local cache","cloud");toast("ลบรายวิชาแล้ว")}
function courseCurriculumRows(c){return DATA.filter(x=>recordMatchesGrade(x,c.grade)&&(!c.subject||x.subject===c.subject))}
function courseProgress(c){return c.documents?.saved_at?100:c.assessments?.saved_at?87:c.lesson_resources?.saved_at?75:c.learning_units?.saved_at?62:c.teaching_schedule?.saved_at?50:c.course_structure?.saved_at?37:c.course_description?.saved_at?25:c.curriculum_analysis?.saved_at?12:4}
function renderCourses(){const box=$("courseList");if(!box)return;const rows=courseDrafts();box.innerHTML=rows.length?rows.map((c,i)=>{const badge=c.documents?.saved_at?"ครบทั้งรายวิชา":c.assessments?.saved_at?"การประเมินพร้อม":c.lesson_resources?.saved_at?"แผน/สื่อพร้อม":c.learning_units?.saved_at?"หน่วยพร้อม":c.teaching_schedule?.saved_at?"กำหนดการพร้อม":c.course_structure?.saved_at?"โครงสร้างพร้อม":c.course_description?.saved_at?"มีคำอธิบาย":c.curriculum_analysis?.saved_at?"วิเคราะห์แล้ว":"Draft";const status=c.documents?.saved_at?`ขั้นที่ 8 สำเร็จ · Word/PDF พร้อมดาวน์โหลด`:c.assessments?.saved_at?`ขั้นที่ 7 สำเร็จ · Pre/Post/Final + Blueprint พร้อม · ไปสร้างเอกสาร`:c.lesson_resources?.saved_at?`ขั้นที่ 6 สำเร็จ · มีแผน/สื่อที่เชื่อมกับหน่วยแล้ว`:c.learning_units?.saved_at?`ขั้นที่ 5 สำเร็จ · ${c.learning_units.units?.length||0} หน่วยพร้อมสร้างแผนและสื่อ`:c.teaching_schedule?.saved_at?`ขั้นที่ 4 สำเร็จ · ${c.teaching_schedule.rows?.length||0} ช่วงการสอน · พร้อมออกแบบหน่วยการเรียนรู้`:c.course_structure?.saved_at?`ขั้นที่ 3 สำเร็จ · ${c.course_structure.units?.length||0} หน่วย · พร้อมทำกำหนดการสอน`:c.course_description?.saved_at?`ขั้นที่ 2 สำเร็จ · พร้อมจัดโครงสร้างรายวิชา`:c.curriculum_analysis?.saved_at?`ขั้นที่ 1 สำเร็จ · เลือก ${c.curriculum_analysis.selected_ids?.length||0} ตัวชี้วัด · พร้อมสร้างคำอธิบายรายวิชา`:`เริ่มต้น 1/8 ขั้นตอน · วิเคราะห์หลักสูตรจากฐานข้อมูลจริงเป็นขั้นถัดไป`;return `<article class="course-item ${c.documents?.saved_at?"is-complete":""}"><div class="course-item-head"><div><h3>${esc(c.name||"รายวิชา")}</h3><p>${esc(c.grade||"")} · ${esc(c.subject||"ยังไม่ระบุกลุ่มสาระ")} · ภาคเรียน ${esc(c.semester||"")} / ${esc(c.year||"")} · ${esc(c.hours||"-")} ชั่วโมง</p></div><span class="reflection-badge">${badge}</span></div><div class="course-progress"><i style="width:${courseProgress(c)}%"></i></div><p>${status}</p><div class="course-actions"><button type="button" data-course-analysis="${i}">🧠 วิเคราะห์หลักสูตร</button>${c.curriculum_analysis?.saved_at?`<button type="button" data-course-description="${i}">📘 คำอธิบายรายวิชา</button>`:""}${c.course_description?.saved_at?`<button type="button" data-course-structure="${i}">🗂️ โครงสร้างรายวิชา</button>`:""}${c.course_structure?.saved_at?`<button type="button" data-course-schedule="${i}">📅 กำหนดการสอน</button>`:""}${c.teaching_schedule?.saved_at?`<button type="button" data-course-units="${i}">🧩 หน่วยการเรียนรู้</button>`:""}${c.learning_units?.saved_at?`<button type="button" data-course-lessons="${i}">📝 แผนและสื่อ</button><button type="button" data-course-assessments="${i}">✅ การประเมิน</button>`:""}${c.assessments?.saved_at?`<button type="button" data-course-documents="${i}">📄 Word / PDF</button>`:""}<button type="button" data-course-use="${i}">✨ ใช้ข้อมูลสร้างแผน</button><button type="button" data-course-delete="${i}">ลบ Draft</button></div></article>`}).join(""):'<div class="list-item">ยังไม่มีรายวิชา — กด “สร้างรายวิชา” เพื่อเริ่มต้น</div>';
$$('[data-course-delete]').forEach(b=>b.onclick=()=>deleteCourseDraft(Number(b.dataset.courseDelete)));
$$('[data-course-analysis]').forEach(b=>b.onclick=()=>openCurriculumAnalysis(Number(b.dataset.courseAnalysis)));
$$('[data-course-description]').forEach(b=>b.onclick=()=>openCourseDescription(Number(b.dataset.courseDescription)));
$$('[data-course-structure]').forEach(b=>b.onclick=()=>openCourseStructure(Number(b.dataset.courseStructure)));
$$('[data-course-schedule]').forEach(b=>b.onclick=()=>openTeachingSchedule(Number(b.dataset.courseSchedule)));
$$('[data-course-units]').forEach(b=>b.onclick=()=>openLearningUnits(Number(b.dataset.courseUnits)));
$$('[data-course-lessons]').forEach(b=>b.onclick=()=>openCourseLessons(Number(b.dataset.courseLessons)));
$$('[data-course-assessments]').forEach(b=>b.onclick=()=>openCourseAssessments(Number(b.dataset.courseAssessments)));
$$('[data-course-documents]').forEach(b=>b.onclick=()=>openCourseDocuments(Number(b.dataset.courseDocuments)));
$$('[data-course-use]').forEach(b=>b.onclick=()=>{const c=courseDrafts()[Number(b.dataset.courseUse)];if(!c)return;prefillCourseToCreate(c,null);toast("นำข้อมูลรายวิชามาใช้แล้ว ✓")})}
function prefillCourseToCreate(c,u=null,courseIndex=null,unitIndex=null){switchTab("create");stage=String(c.grade||"").startsWith("ม.")?"มัธยมศึกษา":String(c.grade||"").startsWith("ป.")?"ประถมศึกษา":"ปฐมวัย";$$('.stage-btn').forEach(x=>x.classList.toggle('active',x.dataset.stage===stage));buildGrades();$("grade").value=c.grade||"";buildSubjects();if(c.subject){$("subject").value=c.subject;buildIndicators()}$("semester").value=c.semester||"";$("academicYear").value=c.year||"";$("schoolName").value=c.school||profile?.school_name||"";if(u){$("unitName").value=u.name||"";$("topic").value=u.name||"";$("duration").value=`${Number(u.hours)||1} ชั่วโมง`;const firstId=(u.indicator_ids||[])[0],r=courseCurriculumRows(c).find(x=>x.dataset_id===firstId);if(r){const idx=DATA.indexOf(r),opt=[...$("indicator").options].find(o=>o.value===String(idx));if(opt){$("indicator").value=String(idx);chooseIndicator()}}activeCourseLessonContext={courseIndex,unitIndex,courseClientId:c.id,unitClientId:u.id||null}}else activeCourseLessonContext=null;updateSummary()}
function closeCurriculumAnalysis(){$("curriculumAnalysisModal").hidden=true;activeCourseIndex=null}
function openCurriculumAnalysis(i){const c=courseDrafts()[i];if(!c)return;activeCourseIndex=i;const rows=courseCurriculumRows(c);$("curriculumAnalysisMeta").textContent=`${c.name} · ${c.grade} · ${c.subject||"ทุกกลุ่มสาระ"}`;const standards=unique(rows.map(x=>x.standard)),domains=unique(rows.map(x=>x.domain)),curricula=unique(rows.map(x=>x.curriculum));$("curriculumAnalysisSummary").innerHTML=`<div><b>${rows.length}</b><small>ตัวชี้วัด/ผลลัพธ์</small></div><div><b>${standards.length}</b><small>มาตรฐาน</small></div><div><b>${domains.length}</b><small>สาระ/ด้าน</small></div><div><b>${curricula.length}</b><small>หลักสูตร</small></div>`;$("curriculumAnalysisSearch").value="";renderCurriculumIndicators();$("curriculumAnalysisModal").hidden=false}
function renderCurriculumIndicators(){if(activeCourseIndex===null)return;const c=courseDrafts()[activeCourseIndex],q=$("curriculumAnalysisSearch").value.trim().toLowerCase(),saved=new Set(c.curriculum_analysis?.selected_ids||[]);const rows=courseCurriculumRows(c).filter(x=>!q||[x.indicator,x.indicator_text,x.standard,x.domain].some(v=>String(v||"").toLowerCase().includes(q)));$("curriculumIndicatorList").innerHTML=rows.map(x=>`<label class="analysis-indicator-item"><input type="checkbox" value="${esc(x.dataset_id)}" ${saved.size?saved.has(x.dataset_id)?"checked":"":"checked"}><span><b>${esc(x.indicator||x.standard||"ผลลัพธ์การเรียนรู้")}</b><small>${esc(x.standard||"")} ${x.domain?`· ${esc(x.domain)}`:""} ${x.classification?`· ${esc(x.classification)}`:""}</small><p>${esc(x.indicator_text||"")}</p></span></label>`).join("")||'<div class="list-item">ไม่พบข้อมูลหลักสูตรที่ตรงกับรายวิชานี้ กรุณาตรวจระดับชั้นและกลุ่มสาระ</div>';$$('#curriculumIndicatorList input[type="checkbox"]').forEach(x=>x.onchange=updateCurriculumSelectedSummary);updateCurriculumSelectedSummary()}
function selectedCurriculumRows(){if(activeCourseIndex===null)return[];const ids=new Set($$('#curriculumIndicatorList input:checked').map(x=>x.value));return courseCurriculumRows(courseDrafts()[activeCourseIndex]).filter(x=>ids.has(x.dataset_id))}
function updateCurriculumSelectedSummary(){const rows=selectedCurriculumRows(),standards=unique(rows.map(x=>x.standard)),domains=unique(rows.map(x=>x.domain)),terminal=rows.filter(x=>x.classification==="ปลายทาง").length;$("curriculumSelectedSummary").innerHTML=`<p><b>เลือก ${rows.length} รายการ</b> · ${standards.length} มาตรฐาน · ${domains.length} สาระ/ด้าน${terminal?` · ปลายทาง ${terminal}`:""}</p><small>ระบบจะใช้เฉพาะรายการที่เลือกเป็นฐานสำหรับคำอธิบายรายวิชา โครงสร้างรายวิชา หน่วย แผน และการประเมินในขั้นถัดไป</small>`}
function saveCurriculumAnalysis(){if(activeCourseIndex===null)return;const rows=selectedCurriculumRows();if(!rows.length){$("curriculumAnalysisStatus").innerHTML='<div class="error-box">กรุณาเลือกอย่างน้อย 1 ตัวชี้วัด/ผลลัพธ์การเรียนรู้</div>';return}const a=courseDrafts(),c=a[activeCourseIndex];c.curriculum_analysis={selected_ids:rows.map(x=>x.dataset_id),curricula:unique(rows.map(x=>x.curriculum)),standards:unique(rows.map(x=>x.standard)),domains:unique(rows.map(x=>x.domain)),saved_at:new Date().toISOString()};a[activeCourseIndex]=c;writeCourseDrafts(a);$("curriculumAnalysisStatus").innerHTML='<div class="indicator-preview">บันทึกผลวิเคราะห์หลักสูตรแล้ว ✓ ข้อมูลนี้จะเป็นฐานของเอกสารขั้นถัดไป</div>';renderCourses();toast("บันทึกวิเคราะห์หลักสูตรแล้ว ✓")}


function savedCurriculumRows(c){const ids=new Set(c.curriculum_analysis?.selected_ids||[]);return courseCurriculumRows(c).filter(x=>ids.has(x.dataset_id))}
function closeCourseDescription(){$("courseDescriptionModal").hidden=true;activeCourseIndex=null}
function draftCourseDescription(c){const rows=savedCurriculumRows(c),standards=unique(rows.map(x=>x.standard).filter(Boolean)),domains=unique(rows.map(x=>x.domain).filter(Boolean));const indicators=rows.slice(0,8).map(x=>x.indicator_text).filter(Boolean).join(" ");return `ศึกษาและปฏิบัติเกี่ยวกับ${domains.length?" "+domains.join(" และ "):"สาระสำคัญของรายวิชา"} โดยเชื่อมโยงมาตรฐานและผลลัพธ์การเรียนรู้ที่กำหนด${indicators?" ได้แก่ "+indicators:""}\n\nจัดกิจกรรมการเรียนรู้ที่เน้นการลงมือปฏิบัติ การคิด การสื่อสาร การสร้างสรรค์ และการประยุกต์ใช้ความรู้ให้เหมาะสมกับผู้เรียนระดับ ${c.grade||""} และบริบทของ ${c.school||"สถานศึกษา"} พร้อมใช้การประเมินตามสภาพจริงจากชิ้นงาน ภาระงาน และพฤติกรรมการเรียนรู้\n\nรายวิชา ${c.name||""} ภาคเรียนที่ ${c.semester||""} ปีการศึกษา ${c.year||""} เวลาเรียนรวม ${c.hours||"-"} ชั่วโมง${standards.length?" อ้างอิง "+standards.length+" มาตรฐาน":""}`}
function openCourseDescription(i){const c=courseDrafts()[i];if(!c?.curriculum_analysis?.saved_at){toast("กรุณาบันทึกผลวิเคราะห์หลักสูตรก่อน");return}activeCourseIndex=i;const rows=savedCurriculumRows(c);$("courseDescriptionMeta").textContent=`${c.name} · ${c.grade} · ภาคเรียน ${c.semester}/${c.year}`;$("courseDescriptionSource").innerHTML=`ใช้ฐานจาก <b>${rows.length}</b> ตัวชี้วัด/ผลลัพธ์ · <b>${unique(rows.map(x=>x.standard)).length}</b> มาตรฐาน — ข้อความด้านล่างแก้ไขได้ก่อนบันทึก`;$("courseDescriptionText").value=c.course_description?.text||draftCourseDescription(c);$("courseDescriptionStatus").innerHTML="";$("courseDescriptionModal").hidden=false}
function generateCourseDescription(){if(activeCourseIndex===null)return;$("courseDescriptionText").value=draftCourseDescription(courseDrafts()[activeCourseIndex]);toast("สร้างฉบับร่างแล้ว ✓")}
function saveCourseDescription(){if(activeCourseIndex===null)return;const text=$("courseDescriptionText").value.trim();if(!text){$("courseDescriptionStatus").innerHTML='<div class="error-box">กรุณามีคำอธิบายรายวิชาก่อนบันทึก</div>';return}const a=courseDrafts(),c=a[activeCourseIndex];c.course_description={text,source_indicator_ids:c.curriculum_analysis.selected_ids||[],saved_at:new Date().toISOString()};a[activeCourseIndex]=c;writeCourseDrafts(a);$("courseDescriptionStatus").innerHTML='<div class="indicator-preview">บันทึกคำอธิบายรายวิชาแล้ว ✓ พร้อมจัดโครงสร้างรายวิชา</div>';renderCourses();toast("บันทึกคำอธิบายรายวิชาแล้ว ✓")}
function closeCourseStructure(){$("courseStructureModal").hidden=true;activeCourseIndex=null}
function autoUnits(c,count){const rows=savedCurriculumRows(c);count=Math.max(1,Math.min(Number(count)||4,12));const groups=[];for(const r of rows){const key=r.domain||r.standard||"สาระการเรียนรู้";let g=groups.find(x=>x.key===key);if(!g){g={key,rows:[]};groups.push(g)}g.rows.push(r)}const units=[];for(let i=0;i<count;i++){const g=groups[i%Math.max(groups.length,1)]||{key:`หน่วยการเรียนรู้ ${i+1}`,rows:[]};units.push({name:g.key||`หน่วยการเรียนรู้ ${i+1}`,indicator_ids:g.rows.map(x=>x.dataset_id),hours:0,weight:0})}const totalH=Math.max(Number(c.hours)||count,count),base=Math.floor(totalH/count),rem=totalH%count;units.forEach((u,i)=>{u.hours=base+(i<rem?1:0);u.weight=Math.floor(100/count)+(i<100%count?1:0)});return units}
function renderStructureEditor(units){$("courseStructureList").innerHTML=units.map((u,i)=>`<div class="structure-row" data-unit-row="${i}" data-indicator-ids='${esc(JSON.stringify(u.indicator_ids||[]))}'><span>${i+1}</span><input data-unit-name value="${esc(u.name||`หน่วยที่ ${i+1}`)}"><input data-unit-hours type="number" min="0" value="${Number(u.hours)||0}" title="ชั่วโมง"><input data-unit-weight type="number" min="0" max="100" value="${Number(u.weight)||0}" title="น้ำหนัก"><small>${u.indicator_ids?.length||0} ตัวชี้วัด</small></div>`).join("");$$('#courseStructureList input').forEach(x=>x.oninput=updateStructureTotal);updateStructureTotal()}
function readStructureEditor(){return $$('#courseStructureList [data-unit-row]').map((row,i)=>{let ids=[];try{ids=JSON.parse(row.dataset.indicatorIds||"[]")}catch{}return {name:row.querySelector('[data-unit-name]').value.trim()||`หน่วยที่ ${i+1}`,hours:Number(row.querySelector('[data-unit-hours]').value)||0,weight:Number(row.querySelector('[data-unit-weight]').value)||0,indicator_ids:ids}})}
function updateStructureTotal(){const u=readStructureEditor(),h=u.reduce((s,x)=>s+x.hours,0),w=u.reduce((s,x)=>s+x.weight,0);$("courseStructureTotal").innerHTML=`รวม <b>${h} ชั่วโมง</b> · น้ำหนัก <b>${w}%</b>`}
function openCourseStructure(i){const c=courseDrafts()[i];if(!c?.course_description?.saved_at){toast("กรุณาบันทึกคำอธิบายรายวิชาก่อน");return}activeCourseIndex=i;$("courseStructureMeta").textContent=`${c.name} · ${c.grade} · ${c.hours||"-"} ชั่วโมง`;$("courseStructureSource").innerHTML=`โครงสร้างนี้ต่อจากคำอธิบายรายวิชาและ <b>${c.curriculum_analysis?.selected_ids?.length||0}</b> ตัวชี้วัด สามารถแก้ชื่อหน่วย ชั่วโมง และน้ำหนักได้`;const units=c.course_structure?.units||autoUnits(c,Math.min(4,Math.max(1,unique(savedCurriculumRows(c).map(x=>x.domain)).length||4)));$("courseUnitCount").value=units.length;renderStructureEditor(units);$("courseStructureStatus").innerHTML="";$("courseStructureModal").hidden=false}
function generateCourseStructure(){if(activeCourseIndex===null)return;const c=courseDrafts()[activeCourseIndex],units=autoUnits(c,$("courseUnitCount").value);renderStructureEditor(units);$$('#courseStructureList [data-unit-row]').forEach((row,i)=>row.dataset.indicatorIds=JSON.stringify(units[i].indicator_ids||[]));toast("จัดหน่วยอัตโนมัติแล้ว ✓")}
function saveCourseStructure(){if(activeCourseIndex===null)return;const a=courseDrafts(),c=a[activeCourseIndex],units=readStructureEditor();const totalH=units.reduce((s,x)=>s+x.hours,0),totalW=units.reduce((s,x)=>s+x.weight,0);if(!units.length){return}if(totalH!==Number(c.hours||0)){$("courseStructureStatus").innerHTML=`<div class="error-box">ชั่วโมงรวม ${totalH} ยังไม่ตรงกับรายวิชา ${c.hours||0} ชั่วโมง</div>`;return}if(totalW!==100){$("courseStructureStatus").innerHTML=`<div class="error-box">น้ำหนักรวมต้องเท่ากับ 100% (ปัจจุบัน ${totalW}%)</div>`;return}c.course_structure={units,saved_at:new Date().toISOString()};a[activeCourseIndex]=c;writeCourseDrafts(a);$("courseStructureStatus").innerHTML='<div class="indicator-preview">บันทึกโครงสร้างรายวิชาแล้ว ✓ ขั้นถัดไป: กำหนดการสอน</div>';renderCourses();toast("บันทึกโครงสร้างรายวิชาแล้ว ✓")}

function closeTeachingSchedule(){$("teachingScheduleModal").hidden=true;activeCourseIndex=null}
function autoTeachingSchedule(c){const units=c.course_structure?.units||[];let week=1;const out=[];for(let ui=0;ui<units.length;ui++){const u=units[ui],h=Math.max(0,Number(u.hours)||0);if(!h){out.push({week:week++,unit_index:ui,unit_name:u.name,topic:u.name,hours:0,indicator_ids:u.indicator_ids||[]});continue}let remaining=h;while(remaining>0){const block=Math.min(2,remaining);out.push({week:week++,unit_index:ui,unit_name:u.name,topic:remaining===h?u.name:`${u.name} (ต่อ)`,hours:block,indicator_ids:u.indicator_ids||[]});remaining-=block}}return out}
function renderTeachingSchedule(rows){$("teachingScheduleList").innerHTML=rows.map((r,i)=>`<div class="schedule-row" data-schedule-row="${i}" data-unit-index="${Number(r.unit_index)||0}" data-indicator-ids='${esc(JSON.stringify(r.indicator_ids||[]))}'><input data-schedule-week type="number" min="1" value="${Number(r.week)||i+1}" title="สัปดาห์"><input data-schedule-unit value="${esc(r.unit_name||"")}" readonly><input data-schedule-topic value="${esc(r.topic||r.unit_name||"")}" placeholder="เรื่อง/หัวข้อ"><input data-schedule-hours type="number" min="0" value="${Number(r.hours)||0}" title="ชั่วโมง"><small>${r.indicator_ids?.length||0} ตัวชี้วัด</small></div>`).join("")||'<div class="list-item">ยังไม่มีหน่วยจากโครงสร้างรายวิชา</div>';$$('#teachingScheduleList input').forEach(x=>x.oninput=updateScheduleTotal);updateScheduleTotal()}
function readTeachingSchedule(){return $$('#teachingScheduleList [data-schedule-row]').map((row,i)=>{let ids=[];try{ids=JSON.parse(row.dataset.indicatorIds||"[]")}catch{}return {week:Number(row.querySelector('[data-schedule-week]').value)||i+1,unit_index:Number(row.dataset.unitIndex)||0,unit_name:row.querySelector('[data-schedule-unit]').value.trim(),topic:row.querySelector('[data-schedule-topic]').value.trim(),hours:Number(row.querySelector('[data-schedule-hours]').value)||0,indicator_ids:ids}})}
function updateScheduleTotal(){const rows=readTeachingSchedule(),hours=rows.reduce((s,x)=>s+x.hours,0);$("teachingScheduleTotal").innerHTML=`รวม <b>${rows.length} ช่วงการสอน</b> · <b>${hours} ชั่วโมง</b>`}
function openTeachingSchedule(i){const c=courseDrafts()[i];if(!c?.course_structure?.saved_at){toast("กรุณาบันทึกโครงสร้างรายวิชาก่อน");return}activeCourseIndex=i;$("teachingScheduleMeta").textContent=`${c.name} · ${c.grade} · ภาคเรียน ${c.semester}/${c.year}`;$("teachingScheduleSource").innerHTML=`รับข้อมูลจาก <b>${c.course_structure.units?.length||0} หน่วย</b> · เวลาเรียนรวม <b>${c.hours||0} ชั่วโมง</b> — ระบบแบ่งช่วงละไม่เกิน 2 ชั่วโมง และครูแก้หัวข้อ/สัปดาห์ได้`;renderTeachingSchedule(c.teaching_schedule?.rows||autoTeachingSchedule(c));$("teachingScheduleStatus").innerHTML="";$("teachingScheduleModal").hidden=false}
function generateTeachingSchedule(){if(activeCourseIndex===null)return;renderTeachingSchedule(autoTeachingSchedule(courseDrafts()[activeCourseIndex]));toast("สร้างกำหนดการสอนแล้ว ✓")}
function saveTeachingSchedule(){if(activeCourseIndex===null)return;const a=courseDrafts(),c=a[activeCourseIndex],rows=readTeachingSchedule(),hours=rows.reduce((s,x)=>s+x.hours,0);if(hours!==Number(c.hours||0)){$("teachingScheduleStatus").innerHTML=`<div class="error-box">ชั่วโมงรวม ${hours} ยังไม่ตรงกับรายวิชา ${c.hours||0} ชั่วโมง</div>`;return}c.teaching_schedule={rows,saved_at:new Date().toISOString()};a[activeCourseIndex]=c;writeCourseDrafts(a);$("teachingScheduleStatus").innerHTML='<div class="indicator-preview">บันทึกกำหนดการสอนแล้ว ✓ พร้อมออกแบบหน่วยการเรียนรู้</div>';renderCourses();toast("บันทึกกำหนดการสอนแล้ว ✓")}

function closeLearningUnits(){$("learningUnitsModal").hidden=true;activeCourseIndex=null}
function deriveLearningUnit(c,u,i){const rows=savedCurriculumRows(c).filter(x=>(u.indicator_ids||[]).includes(x.dataset_id));const indicatorTexts=rows.map(x=>x.indicator_text).filter(Boolean);return {id:u.id||(crypto.randomUUID?crypto.randomUUID():String(Date.now()+i)),unit_no:i+1,name:u.name,hours:Number(u.hours)||0,weight:Number(u.weight)||0,indicator_ids:u.indicator_ids||[],concept:indicatorTexts.length?indicatorTexts.slice(0,3).join(" "):`สาระสำคัญของ ${u.name}`,objectives:indicatorTexts.slice(0,3).map((t,j)=>`${j+1}. ผู้เรียนสามารถ${t.replace(/^ผู้เรียนสามารถ\s*/,"")}` ).join("\n")||`1. ผู้เรียนอธิบายสาระสำคัญของ ${u.name} ได้\n2. ผู้เรียนปฏิบัติภาระงานที่กำหนดได้`,assessment:"ประเมินจากชิ้นงาน/ภาระงาน การสังเกตพฤติกรรม และการตอบคำถามตามตัวชี้วัด"}}
function renderLearningUnits(units){$("learningUnitsList").innerHTML=units.map((u,i)=>`<article class="learning-unit-card" data-learning-unit="${i}" data-indicator-ids='${esc(JSON.stringify(u.indicator_ids||[]))}'><div class="learning-unit-head"><span>${i+1}</span><div><b>${esc(u.name||`หน่วยที่ ${i+1}`)}</b><small>${Number(u.hours)||0} ชั่วโมง · น้ำหนัก ${Number(u.weight)||0}% · ${u.indicator_ids?.length||0} ตัวชี้วัด</small></div></div><label>สาระสำคัญ<textarea data-unit-concept rows="3">${esc(u.concept||"")}</textarea></label><label>จุดประสงค์/ผลลัพธ์การเรียนรู้<textarea data-unit-objectives rows="4">${esc(u.objectives||"")}</textarea></label><label>แนวทางการวัดและประเมินผล<textarea data-unit-assessment rows="3">${esc(u.assessment||"")}</textarea></label><input type="hidden" data-unit-name value="${esc(u.name||"")}"><input type="hidden" data-unit-hours value="${Number(u.hours)||0}"><input type="hidden" data-unit-weight value="${Number(u.weight)||0}"></article>`).join("")}
function readLearningUnits(){return $$('#learningUnitsList [data-learning-unit]').map((row,i)=>{let ids=[];try{ids=JSON.parse(row.dataset.indicatorIds||"[]")}catch{}return {id:(courseDrafts()[activeCourseIndex]?.learning_units?.units?.[i]?.id)||(crypto.randomUUID?crypto.randomUUID():String(Date.now()+i)),unit_no:i+1,name:row.querySelector('[data-unit-name]').value,hours:Number(row.querySelector('[data-unit-hours]').value)||0,weight:Number(row.querySelector('[data-unit-weight]').value)||0,indicator_ids:ids,concept:row.querySelector('[data-unit-concept]').value.trim(),objectives:row.querySelector('[data-unit-objectives]').value.trim(),assessment:row.querySelector('[data-unit-assessment]').value.trim()}})}
function openLearningUnits(i){const c=courseDrafts()[i];if(!c?.teaching_schedule?.saved_at){toast("กรุณาบันทึกกำหนดการสอนก่อน");return}activeCourseIndex=i;$("learningUnitsMeta").textContent=`${c.name} · ${c.grade} · ${c.course_structure?.units?.length||0} หน่วย`;$("learningUnitsSource").innerHTML=`สร้างจากโครงสร้างรายวิชา + ตัวชี้วัดที่เลือก + กำหนดการสอน ครูสามารถปรับสาระสำคัญ จุดประสงค์ และการประเมินของแต่ละหน่วยได้`;const units=c.learning_units?.units||c.course_structure.units.map((u,j)=>deriveLearningUnit(c,u,j));renderLearningUnits(units);$("learningUnitsStatus").innerHTML="";$("learningUnitsModal").hidden=false}
function generateLearningUnits(){if(activeCourseIndex===null)return;const c=courseDrafts()[activeCourseIndex];renderLearningUnits(c.course_structure.units.map((u,j)=>deriveLearningUnit(c,u,j)));toast("สร้างหน่วยการเรียนรู้แล้ว ✓")}
function saveLearningUnits(){if(activeCourseIndex===null)return;const units=readLearningUnits();if(units.some(u=>!u.concept||!u.objectives)){ $("learningUnitsStatus").innerHTML='<div class="error-box">กรุณาตรวจสาระสำคัญและจุดประสงค์ของทุกหน่วยก่อนบันทึก</div>';return}const a=courseDrafts(),c=a[activeCourseIndex];c.learning_units={units,saved_at:new Date().toISOString()};a[activeCourseIndex]=c;writeCourseDrafts(a);$("learningUnitsStatus").innerHTML='<div class="indicator-preview">บันทึกหน่วยการเรียนรู้แล้ว ✓ พร้อมต่อยอดเป็นแผนการสอน ใบงาน และการประเมิน</div>';renderCourses();toast("บันทึกหน่วยการเรียนรู้แล้ว ✓")}


async function resolveCourseCloudId(c){if(c?._cloud_id)return c._cloud_id;if(!courseCloudReady||!sb||!user)return null;const {data,error}=await sb.from("courses").select("id").eq("user_id",user.id).eq("client_id",c.id).maybeSingle();if(error||!data)return null;c._cloud_id=data.id;const rows=courseDrafts(),idx=rows.findIndex(x=>x.id===c.id);if(idx>=0){rows[idx]=c;writeCourseDrafts(rows,{sync:false})}return data.id}
async function ensureUnitCloud(c,u,unitIndex){if(!courseCloudReady||!sb||!user)return null;const courseId=await resolveCourseCloudId(c);if(!courseId)return null;u.id=u.id||(crypto.randomUUID?crypto.randomUUID():String(Date.now()+unitIndex));const payload={user_id:user.id,course_id:courseId,client_id:u.id,unit_no:Number(u.unit_no)||unitIndex+1,title:u.name||`หน่วยที่ ${unitIndex+1}`,description:u.concept||null,hours:Number(u.hours)||0,weight:Number(u.weight)||0,sort_order:unitIndex,indicator_codes:u.indicator_ids||[],content:{objectives:u.objectives||"",assessment:u.assessment||""},status:"ready",updated_at:new Date().toISOString()};const {data,error}=await sb.from("learning_units").upsert(payload,{onConflict:"user_id,course_id,client_id"}).select("id").single();if(error){console.warn("unit cloud unavailable",error);return null}u._cloud_id=data.id;return data.id}
function closeCourseLessons(){$("courseLessonsModal").hidden=true;activeCourseIndex=null}
function openCourseLessons(i){const c=courseDrafts()[i];if(!c?.learning_units?.saved_at){toast("กรุณาบันทึกหน่วยการเรียนรู้ก่อน");return}activeCourseIndex=i;$("courseLessonsMeta").textContent=`${c.name} · ${c.grade} · ${c.learning_units.units.length} หน่วย`;$("courseLessonsList").innerHTML=c.learning_units.units.map((u,ui)=>`<article class="course-lesson-unit"><div><b>หน่วยที่ ${ui+1} · ${esc(u.name||"")}</b><small>${Number(u.hours)||0} ชั่วโมง · ${(u.indicator_ids||[]).length} ตัวชี้วัด</small></div><div class="course-lesson-actions"><button type="button" data-unit-plan="${ui}">📝 สร้างแผน</button><button type="button" data-unit-resource="worksheet:${ui}">📄 ใบงาน</button><button type="button" data-unit-resource="visual_card:${ui}">🖼️ บัตรภาพ</button><button type="button" data-unit-resource="knowledge:${ui}">📚 ใบความรู้</button></div></article>`).join("");$$('[data-unit-plan]').forEach(b=>b.onclick=()=>startUnitPlan(i,Number(b.dataset.unitPlan)));$$('[data-unit-resource]').forEach(b=>b.onclick=()=>{const [type,ui]=b.dataset.unitResource.split(":");createUnitResourcePrompt(i,Number(ui),type)});$("courseLessonsStatus").innerHTML="";$("courseLessonsModal").hidden=false}
async function startUnitPlan(ci,ui){const rows=courseDrafts(),c=rows[ci],u=c?.learning_units?.units?.[ui];if(!u)return;await ensureUnitCloud(c,u,ui);rows[ci]=c;writeCourseDrafts(rows,{sync:false});closeCourseLessons();prefillCourseToCreate(c,u,ci,ui);toast("นำข้อมูลหน่วยเข้าสู่แบบสร้างแผนแล้ว ✓")}
function resourceIntro(type,u,c){const m={worksheet:`สร้างใบงานสำหรับหน่วย “${u.name}” ของ ${c.grade} มีคำชี้แจง กิจกรรม พื้นที่ตอบ และเฉลย`,visual_card:`สร้างชุดบัตรภาพประกอบการสอนสำหรับหน่วย “${u.name}” ของ ${c.grade} ภาพชัดเจน เหมาะกับวัย พร้อมคำกำกับเฉพาะที่จำเป็น`,knowledge:`สร้างใบความรู้สำหรับหน่วย “${u.name}” ของ ${c.grade} สรุปสาระสำคัญ ตัวอย่าง และกล่องจำง่าย`};return m[type]||`สร้างสื่อการเรียนรู้สำหรับหน่วย “${u.name}”`}
function createUnitResourcePrompt(ci,ui,type){const rows=courseDrafts(),c=rows[ci],u=c?.learning_units?.units?.[ui];if(!u)return;const refs=savedCurriculumRows(c).filter(x=>(u.indicator_ids||[]).includes(x.dataset_id));const text=`${resourceIntro(type,u,c)}\n\nข้อมูลอ้างอิงที่ต้องใช้:\nรายวิชา: ${c.name}\nชั้น: ${c.grade}\nภาคเรียน: ${c.semester}/${c.year}\nหน่วย: ${u.name}\nสาระสำคัญ: ${u.concept||""}\nจุดประสงค์: ${u.objectives||""}\nตัวชี้วัด:\n${refs.map(x=>`- ${x.indicator||""} ${x.indicator_text||""}`).join("\n")}\n\nข้อกำหนด: ใช้เฉพาะตัวชี้วัดที่ให้ ห้ามแต่งรหัสใหม่ และให้เนื้อหาสอดคล้องกับหน่วยเดียวกัน`;c.lesson_resources=c.lesson_resources||{items:[]};c.lesson_resources.items.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),unit_id:u.id||null,type,title:`${type} · ${u.name}`,prompt:text,created_at:new Date().toISOString()});c.lesson_resources.saved_at=new Date().toISOString();rows[ci]=c;writeCourseDrafts(rows);renderCourses();switchTab("create");$("promptText").textContent=text;$("promptWrap").hidden=false;closeCourseLessons();setTimeout(()=>$("promptWrap").scrollIntoView({behavior:"smooth"}),60);toast("สร้าง Prompt สื่อจากหน่วยแล้ว ✓")}

function closeCourseAssessments(){$("courseAssessmentsModal").hidden=true}
function assessmentRefs(c,u=null){const ids=u?.indicator_ids||c.curriculum_analysis?.selected_ids||[];return savedCurriculumRows(c).filter(x=>ids.includes(x.dataset_id))}
function assessmentPrompt(c,type,u=null){const refs=assessmentRefs(c,u), typeLabel={pretest:"ข้อสอบก่อนเรียน",posttest:"ข้อสอบหลังเรียน",final:"ข้อสอบปลายภาค"}[type]||"แบบประเมิน";const scope=u?`หน่วย: ${u.name}\nสาระสำคัญ: ${u.concept||""}\nจุดประสงค์: ${u.objectives||""}`:`ขอบเขตทั้งรายวิชา: ${c.learning_units?.units?.map((x,i)=>`${i+1}. ${x.name} (${x.hours} ชม.)`).join("\n")||"-"}`;const count=type==="final"?30:10;return `สร้าง${typeLabel}สำหรับรายวิชา “${c.name}” ชั้น ${c.grade}\nภาคเรียน ${c.semester}/${c.year}\n${scope}\n\nตัวชี้วัดที่อนุญาตให้ใช้เท่านั้น:\n${refs.map(x=>`- ${x.indicator||""} ${x.indicator_text||""}`).join("\n")}\n\nข้อกำหนด:\n1) จำนวน ${count} ข้อ แบบปรนัย 4 ตัวเลือก เว้นแต่เนื้อหาเหมาะกับรูปแบบอื่นอย่างชัดเจน\n2) ระดับความยากง่ายสมดุล เหมาะกับวัย\n3) ทุกข้อระบุตัวชี้วัด/จุดประสงค์ที่วัด\n4) มีเฉลยพร้อมคำอธิบายสั้น ๆ\n5) ห้ามสร้างรหัสตัวชี้วัดใหม่\n${type==="final"?"6) สร้างตาราง Blueprint ก่อนข้อสอบ แสดงหน่วย ตัวชี้วัด จำนวนข้อ และสัดส่วนคะแนน รวม 100%\n7) กระจายข้อสอบตามชั่วโมงและน้ำหนักของหน่วย ไม่กระจุกอยู่หน่วยเดียว":"6) ให้ครอบคลุมจุดประสงค์สำคัญของหน่วย"}`}
function renderAssessmentItems(c){const box=$("courseAssessmentsList"),items=c.assessments?.items||[];box.innerHTML=(c.learning_units?.units||[]).map((u,ui)=>{const pre=items.filter(x=>x.unit_id===u.id&&x.type==="pretest").length,post=items.filter(x=>x.unit_id===u.id&&x.type==="posttest").length;return `<article class="assessment-unit"><div><b>หน่วยที่ ${ui+1} · ${esc(u.name||"")}</b><small>${(u.indicator_ids||[]).length} ตัวชี้วัด · ก่อนเรียน ${pre} · หลังเรียน ${post}</small></div><div class="assessment-actions"><button type="button" data-assessment-unit="pretest:${ui}">ก่อนเรียน</button><button type="button" data-assessment-unit="posttest:${ui}">หลังเรียน</button></div></article>`}).join("")+`<article class="assessment-final"><div><b>📘 ข้อสอบปลายภาค + Blueprint</b><small>ครอบคลุมทุกหน่วยในรายวิชาและมีเฉลย</small></div><button type="button" data-assessment-final>สร้างข้อสอบปลายภาค</button></article>`;$$('[data-assessment-unit]').forEach(b=>b.onclick=()=>{const [type,ui]=b.dataset.assessmentUnit.split(":");createAssessmentPrompt(activeCourseIndex,type,Number(ui))});const fb=box.querySelector('[data-assessment-final]');if(fb)fb.onclick=()=>createAssessmentPrompt(activeCourseIndex,"final",null)}
function openCourseAssessments(i){const c=courseDrafts()[i];if(!c?.learning_units?.saved_at){toast("กรุณาบันทึกหน่วยการเรียนรู้ก่อน");return}activeCourseIndex=i;$("courseAssessmentsMeta").textContent=`${c.name} · ${c.grade} · ${c.learning_units.units.length} หน่วย`;$("courseAssessmentsSource").innerHTML=`สร้างการประเมินจากตัวชี้วัดที่เลือกจริง โดยข้อสอบปลายภาคจะกระจายตามหน่วย ชั่วโมง และน้ำหนักของรายวิชา`;renderAssessmentItems(c);$("courseAssessmentsStatus").innerHTML=c.assessments?.saved_at?`<div class="indicator-preview">สร้างงานประเมินแล้ว ${c.assessments.items?.length||0} รายการ ✓</div>`:"";$("courseAssessmentsModal").hidden=false}
async function saveAssessmentCloud(c,u,item){if(!courseCloudReady||!sb||!user)return;try{const courseId=await resolveCourseCloudId(c);if(!courseId)return;let unitId=null;if(u)unitId=await ensureUnitCloud(c,u,(c.learning_units?.units||[]).indexOf(u));const payload={user_id:user.id,course_id:courseId,unit_id:unitId,assessment_type:item.type,title:item.title,blueprint:item.blueprint||{},content:{prompt:item.prompt,client_id:item.id},answer_key:{mode:"generated_with_prompt"},status:"prompt_ready",updated_at:new Date().toISOString()};const {error}=await sb.from("assessments").insert(payload);if(error)console.warn("assessment cloud unavailable",error)}catch(error){console.warn("assessment sync failed",error)}}
function createAssessmentPrompt(ci,type,ui=null){const rows=courseDrafts(),c=rows[ci],u=ui===null?null:c?.learning_units?.units?.[ui];if(!c||(!u&&type!=="final"))return;const prompt=assessmentPrompt(c,type,u),id=crypto.randomUUID?crypto.randomUUID():String(Date.now()),title=type==="final"?`ข้อสอบปลายภาค · ${c.name}`:`${type==="pretest"?"ก่อนเรียน":"หลังเรียน"} · ${u.name}`;const blueprint=type==="final"?{units:(c.learning_units?.units||[]).map(x=>({unit_id:x.id,name:x.name,hours:Number(x.hours)||0,weight:Number(x.weight)||0,indicator_ids:x.indicator_ids||[]})),total_weight:(c.learning_units?.units||[]).reduce((s,x)=>s+(Number(x.weight)||0),0)}:{unit_id:u.id,indicator_ids:u.indicator_ids||[]};c.assessments=c.assessments||{items:[]};const item={id,type,unit_id:u?.id||null,title,prompt,blueprint,created_at:new Date().toISOString()};c.assessments.items.push(item);c.assessments.saved_at=new Date().toISOString();rows[ci]=c;writeCourseDrafts(rows);renderCourses();renderAssessmentItems(c);$("courseAssessmentsStatus").innerHTML=`<div class="indicator-preview">สร้าง ${esc(title)} แล้ว ✓ ระบบบันทึก Prompt และ Blueprint ไว้กับรายวิชา</div>`;saveAssessmentCloud(c,u,item);switchTab("create");$("promptText").textContent=prompt;$("promptWrap").hidden=false;closeCourseAssessments();setTimeout(()=>$("promptWrap").scrollIntoView({behavior:"smooth"}),60);toast("สร้าง Prompt การประเมินแล้ว ✓")}

function safeFilename(v){return String(v||"klang-plan").replace(/[\\/:*?"<>|]/g,"-").replace(/\s+/g," ").trim().slice(0,120)||"klang-plan"}
function courseDocumentText(c){const out=[];const push=(...x)=>out.push(...x);push("คลังแผนการสอนหน้าเดียว","ชุดเอกสารรายวิชา","");push(`รายวิชา: ${c.name||"-"}`,`ระดับชั้น: ${c.grade||"-"}`,`กลุ่มสาระ/วิชา: ${c.subject||"-"}`,`ภาคเรียน: ${c.semester||"-"}   ปีการศึกษา: ${c.year||"-"}`,`เวลาเรียนรวม: ${c.hours||"-"} ชั่วโมง`,`สถานศึกษา: ${c.school||profile?.school_name||"-"}`,"");const cur=savedCurriculumRows(c);push("1. การวิเคราะห์หลักสูตร");if(cur.length){cur.forEach((r,i)=>push(`${i+1}. ${r.indicator||r.standard||""}${r.indicator_text?" — "+r.indicator_text:""}`))}else push("ยังไม่มีข้อมูลการวิเคราะห์หลักสูตร");push("","2. คำอธิบายรายวิชา",c.course_description?.text||"ยังไม่มีคำอธิบายรายวิชา","");push("3. โครงสร้างรายวิชา");(c.course_structure?.units||[]).forEach((u,i)=>push(`${i+1}. ${u.name||`หน่วยที่ ${i+1}`} — ${Number(u.hours)||0} ชั่วโมง — น้ำหนัก ${Number(u.weight)||0}%`));push("","4. กำหนดการสอน");(c.teaching_schedule?.rows||[]).forEach((r,i)=>push(`สัปดาห์ ${r.week||i+1}: ${r.unit||r.unit_name||""} — ${r.topic||""} (${Number(r.hours)||0} ชั่วโมง)`));push("","5. หน่วยการเรียนรู้");(c.learning_units?.units||[]).forEach((u,i)=>{push(`หน่วยที่ ${i+1} ${u.name||""} (${Number(u.hours)||0} ชั่วโมง)`,`สาระสำคัญ: ${u.concept||"-"}`,`จุดประสงค์/ผลลัพธ์:\n${u.objectives||"-"}`,`การวัดและประเมินผล: ${u.assessment||"-"}`,"")});push("6. แผนการสอนและสื่อ",`สถานะ: ${c.lesson_resources?.saved_at?"มีการสร้างแผน/สื่อจากหน่วยแล้ว":"ยังไม่มีข้อมูล"}`,"");push("7. การประเมินผล");const items=c.assessments?.items||[];if(items.length){items.forEach((a,i)=>{push(`${i+1}. ${a.title||a.type||"การประเมิน"}`);if(a.blueprint)push(`Blueprint: ${typeof a.blueprint==="string"?a.blueprint:JSON.stringify(a.blueprint,null,2)}`);if(a.prompt)push(`Prompt:\n${a.prompt}`);push("")})}else push("ยังไม่มีข้อมูลการประเมิน");push("","8. บันทึกเอกสาร",`สร้างจาก Klang Plan เมื่อ ${new Date().toLocaleString("th-TH")}`);return out.join("\n")}
function xmlText(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
const CRC_TABLE=(()=>{const a=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;a[n]=c>>>0}return a})();
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=CRC_TABLE[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0}
function u16(n){return new Uint8Array([n&255,(n>>>8)&255])}function u32(n){return new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255])}
function catBytes(parts){const n=parts.reduce((s,x)=>s+x.length,0),o=new Uint8Array(n);let p=0;for(const x of parts){o.set(x,p);p+=x.length}return o}
function zipStored(entries){const te=new TextEncoder(),locals=[],centrals=[];let offset=0;for(const [name,content] of entries){const nb=te.encode(name),data=typeof content==="string"?te.encode(content):content,crc=crc32(data);const local=catBytes([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(nb.length),u16(0),nb,data]);locals.push(local);const central=catBytes([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(nb.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),nb]);centrals.push(central);offset+=local.length}const centralSize=centrals.reduce((s,x)=>s+x.length,0),end=catBytes([u32(0x06054b50),u16(0),u16(0),u16(entries.length),u16(entries.length),u32(centralSize),u32(offset),u16(0)]);return new Blob([...locals,...centrals,end],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"})}
function makeDocxBlob(title,text){const lines=String(text||"").split(/\r?\n/);const paras=lines.map(line=>{const isHead=/^\d+\.\s/.test(line)||line==="คลังแผนการสอนหน้าเดียว"||line==="ชุดเอกสารรายวิชา";return `<w:p>${isHead?'<w:pPr><w:pStyle w:val="Heading1"/></w:pPr>':''}<w:r><w:rPr><w:rFonts w:ascii="TH Sarabun New" w:hAnsi="TH Sarabun New" w:eastAsia="TH Sarabun New"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr><w:t xml:space="preserve">${xmlText(line||" ")}</w:t></w:r></w:p>`}).join("");const doc=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paras}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`;const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style></w:styles>`;return zipStored([["[Content_Types].xml",`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`],["_rels/.rels",`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`],["word/document.xml",doc],["word/styles.xml",styles],["word/_rels/document.xml.rels",`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`]])}
function saveBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200)}
function textPagesToJpegs(text){const W=1240,H=1754,M=96,MAX=W-M*2,lh=42,te=document.createElement("canvas"),ctx=te.getContext("2d");te.width=W;te.height=H;ctx.font='28px Tahoma, Arial, sans-serif';const logical=[];for(const raw of String(text||"").split(/\r?\n/)){if(!raw){logical.push("");continue}let line="";for(const ch of raw){const t=line+ch;if(ctx.measureText(t).width>MAX&&line){logical.push(line);line=ch}else line=t}logical.push(line)}const per=Math.floor((H-M*2)/lh),pages=[];for(let i=0;i<logical.length;i+=per){const c=document.createElement("canvas"),x=c.getContext("2d");c.width=W;c.height=H;x.fillStyle="#fff";x.fillRect(0,0,W,H);x.fillStyle="#111";x.textBaseline="top";let y=M;logical.slice(i,i+per).forEach((line,j)=>{x.font=(/^(คลังแผนการสอนหน้าเดียว|ชุดเอกสารรายวิชา|\d+\.\s)/.test(line)?'bold 30px':'28px')+' Tahoma, Arial, sans-serif';x.fillText(line,M,y,MAX);y+=lh});const b64=c.toDataURL("image/jpeg",.9).split(",")[1],bin=atob(b64),bytes=new Uint8Array(bin.length);for(let k=0;k<bin.length;k++)bytes[k]=bin.charCodeAt(k);pages.push({bytes,w:W,h:H})}return pages}
function makePdfBlob(text){const imgs=textPagesToJpegs(text),te=new TextEncoder(),parts=[],offsets=[0];let len=0;const add=x=>{const b=typeof x==="string"?te.encode(x):x;parts.push(b);len+=b.length};add("%PDF-1.4\n%KLANG\n");const pageObjs=[],imgObjs=[],contentObjs=[];let next=3;for(let i=0;i<imgs.length;i++){pageObjs.push(next++);imgObjs.push(next++);contentObjs.push(next++)}const total=next-1;const obj=(n,body)=>{offsets[n]=len;add(`${n} 0 obj\n`);add(body);add("\nendobj\n")};obj(1,"<< /Type /Catalog /Pages 2 0 R >>");obj(2,`<< /Type /Pages /Count ${imgs.length} /Kids [${pageObjs.map(n=>n+" 0 R").join(" ")}] >>`);imgs.forEach((im,i)=>{obj(pageObjs[i],`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im${i+1} ${imgObjs[i]} 0 R >> >> /Contents ${contentObjs[i]} 0 R >>`);offsets[imgObjs[i]]=len;add(`${imgObjs[i]} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bytes.length} >>\nstream\n`);add(im.bytes);add("\nendstream\nendobj\n");const stream=`q\n595.28 0 0 841.89 0 0 cm\n/Im${i+1} Do\nQ\n`;obj(contentObjs[i],`<< /Length ${te.encode(stream).length} >>\nstream\n${stream}endstream`)});const xref=len;add(`xref\n0 ${total+1}\n0000000000 65535 f \n`);for(let i=1;i<=total;i++)add(String(offsets[i]||0).padStart(10,"0")+" 00000 n \n");add(`trailer\n<< /Size ${total+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);return new Blob(parts,{type:"application/pdf"})}
function markDocumentsReady(type){if(activeCourseIndex==null)return;const rows=courseDrafts(),c=rows[activeCourseIndex];if(!c)return;c.documents={...(c.documents||{}),saved_at:new Date().toISOString(),last_export:type,version:Number(c.documents?.version||0)+1};rows[activeCourseIndex]=c;writeCourseDrafts(rows);renderCourses();$("courseDocumentsStatus").innerHTML=`<div class="indicator-preview">สร้างไฟล์ ${type.toUpperCase()} แล้ว ✓ ขั้นที่ 8 สำเร็จ</div>`}
function openCourseDocuments(i){const c=courseDrafts()[i];if(!c?.assessments?.saved_at){toast("กรุณาทำขั้นการประเมินผลก่อน");return}activeCourseIndex=i;$("courseDocumentsMeta").textContent=`${c.name} · ${c.grade} · ภาคเรียน ${c.semester}/${c.year}`;const text=courseDocumentText(c);$("courseDocumentPreview").textContent=text;$("courseDocumentsStatus").innerHTML=c.documents?.saved_at?'<div class="indicator-preview">เอกสารเคยถูกสร้างแล้ว ✓ สามารถดาวน์โหลดเวอร์ชันใหม่ได้</div>':"";$("courseDocumentsModal").hidden=false}
function closeCourseDocuments(){$("courseDocumentsModal").hidden=true;activeCourseIndex=null}
function downloadCourseDocx(){const c=courseDrafts()[activeCourseIndex];if(!c)return;saveBlob(makeDocxBlob(c.name,courseDocumentText(c)),safeFilename(`${c.name}-${c.grade}-${c.year}`)+".docx");markDocumentsReady("docx")}
function downloadCoursePdf(){const c=courseDrafts()[activeCourseIndex];if(!c)return;saveBlob(makePdfBlob(courseDocumentText(c)),safeFilename(`${c.name}-${c.grade}-${c.year}`)+".pdf");markDocumentsReady("pdf")}
function downloadWord(plan){const text=[plan.title||"แผนการจัดการเรียนรู้","",plan.prompt_text||"",plan.reflection_text?"\nบันทึกหลังสอน\n"+plan.reflection_text:""].join("\n");saveBlob(makeDocxBlob(plan.title||"แผนการจัดการเรียนรู้",text),safeFilename(plan.title||"klang-plan")+".docx")}
function printPlanPdf(plan){const text=[plan.title||"แผนการจัดการเรียนรู้","",plan.prompt_text||"",plan.reflection_text?"\nบันทึกหลังสอน\n"+plan.reflection_text:""].join("\n");saveBlob(makePdfBlob(text),safeFilename(plan.title||"klang-plan")+".pdf")}

function openCourseModal(){if($("courseSchool"))$("courseSchool").value=profile?.school_name||"";$("courseModal").hidden=false}
function closeCourseModal(){$("courseModal").hidden=true}
function saveCourseDraft(){const name=$("courseName").value.trim(),grade=$("courseGrade").value.trim(),subject=$("courseSubject").value.trim(),year=$("courseYear").value.trim();if(!name||!grade||!subject||!year){$("courseStatus").innerHTML='<div class="error-box">กรุณากรอกชื่อรายวิชา ระดับชั้น กลุ่มสาระ/วิชา และปีการศึกษา</div>';return}const a=courseDrafts();a.unshift({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name,grade,subject,semester:$("courseSemester").value,year,hours:$("courseHours").value,school:$("courseSchool").value.trim(),created_at:new Date().toISOString()});writeCourseDrafts(a);closeCourseModal();renderCourses();toast(courseCloudReady?"บันทึกรายวิชาและเตรียมซิงก์ Cloud แล้ว ✓":"บันทึกรายวิชาในเครื่องแล้ว ✓")}

function bind(){
  $$(".stage-btn").forEach(b=>b.onclick=()=>{stage=b.dataset.stage;$$(".stage-btn").forEach(x=>x.classList.toggle("active",x===b));buildGrades();updateSummary()});
  $("grade").onchange=buildSubjects;$("subject").onchange=buildIndicators;$("indicatorSearch").oninput=buildIndicators;$("indicator").onchange=chooseIndicator;
  ["unitName","topic","duration","method","semester","academicYear","teachingDate","teacherName","teacherPosition","schoolName","organization","province","studentCount","teacherSignatureName","directorName","directorPosition","approvalLayout","customStyleDirection","customAffiliationNote"].forEach(id=>$(id).oninput=updateSummary);
  $("affiliationType").onchange=renderAffiliation;
  $("generateBtn").onclick=generate;$("copyPromptBtn").onclick=copy;
  $$(".top-tab").forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));$$("[data-bottom-tab]").forEach(b=>b.onclick=()=>switchTab(b.dataset.bottomTab));
  if($("newCourseBtn"))$("newCourseBtn").onclick=openCourseModal;if($("syncCoursesBtn"))$("syncCoursesBtn").onclick=()=>syncCoursesToCloud();if($("closeCourseBtn"))$("closeCourseBtn").onclick=closeCourseModal;if($("courseBackdrop"))$("courseBackdrop").onclick=closeCourseModal;if($("saveCourseDraftBtn"))$("saveCourseDraftBtn").onclick=saveCourseDraft;if($("closeCurriculumAnalysisBtn"))$("closeCurriculumAnalysisBtn").onclick=closeCurriculumAnalysis;if($("curriculumAnalysisBackdrop"))$("curriculumAnalysisBackdrop").onclick=closeCurriculumAnalysis;if($("curriculumAnalysisSearch"))$("curriculumAnalysisSearch").oninput=renderCurriculumIndicators;if($("selectAllCurriculumBtn"))$("selectAllCurriculumBtn").onclick=()=>{$$('#curriculumIndicatorList input[type="checkbox"]').forEach(x=>x.checked=true);updateCurriculumSelectedSummary()};if($("saveCurriculumAnalysisBtn"))$("saveCurriculumAnalysisBtn").onclick=saveCurriculumAnalysis;if($("closeCourseDescriptionBtn"))$("closeCourseDescriptionBtn").onclick=closeCourseDescription;if($("courseDescriptionBackdrop"))$("courseDescriptionBackdrop").onclick=closeCourseDescription;if($("generateCourseDescriptionBtn"))$("generateCourseDescriptionBtn").onclick=generateCourseDescription;if($("saveCourseDescriptionBtn"))$("saveCourseDescriptionBtn").onclick=saveCourseDescription;if($("closeCourseStructureBtn"))$("closeCourseStructureBtn").onclick=closeCourseStructure;if($("courseStructureBackdrop"))$("courseStructureBackdrop").onclick=closeCourseStructure;if($("generateCourseStructureBtn"))$("generateCourseStructureBtn").onclick=generateCourseStructure;if($("saveCourseStructureBtn"))$("saveCourseStructureBtn").onclick=saveCourseStructure;if($("closeTeachingScheduleBtn"))$("closeTeachingScheduleBtn").onclick=closeTeachingSchedule;if($("teachingScheduleBackdrop"))$("teachingScheduleBackdrop").onclick=closeTeachingSchedule;if($("generateTeachingScheduleBtn"))$("generateTeachingScheduleBtn").onclick=generateTeachingSchedule;if($("saveTeachingScheduleBtn"))$("saveTeachingScheduleBtn").onclick=saveTeachingSchedule;if($("closeLearningUnitsBtn"))$("closeLearningUnitsBtn").onclick=closeLearningUnits;if($("learningUnitsBackdrop"))$("learningUnitsBackdrop").onclick=closeLearningUnits;if($("generateLearningUnitsBtn"))$("generateLearningUnitsBtn").onclick=generateLearningUnits;if($("saveLearningUnitsBtn"))$("saveLearningUnitsBtn").onclick=saveLearningUnits;if($("closeCourseLessonsBtn"))$("closeCourseLessonsBtn").onclick=closeCourseLessons;if($("courseLessonsBackdrop"))$("courseLessonsBackdrop").onclick=closeCourseLessons;if($("closeCourseAssessmentsBtn"))$("closeCourseAssessmentsBtn").onclick=closeCourseAssessments;if($("courseAssessmentsBackdrop"))$("courseAssessmentsBackdrop").onclick=closeCourseAssessments;if($("closeCourseDocumentsBtn"))$("closeCourseDocumentsBtn").onclick=closeCourseDocuments;if($("courseDocumentsBackdrop"))$("courseDocumentsBackdrop").onclick=closeCourseDocuments;if($("downloadCourseDocxBtn"))$("downloadCourseDocxBtn").onclick=downloadCourseDocx;if($("downloadCoursePdfBtn"))$("downloadCoursePdfBtn").onclick=downloadCoursePdf;
  $$("[data-scroll]").forEach(b=>b.onclick=()=>document.getElementById(b.dataset.scroll)?.scrollIntoView({behavior:"smooth",block:"start"}));
  $("libraryStage").onchange=updateLibraryFilters;$("libraryGrade").onchange=updateLibrarySubjects;$("librarySubject").onchange=applyLibraryFilters;$("librarySearch").oninput=applyLibraryFilters;$("useLibraryIndicatorBtn").onclick=useLibraryIndicator;
  $("includeTeachingDate").onchange=()=>{$("teachingDateFields").hidden=!$("includeTeachingDate").checked;updateSummary()};
  $("includeSignatures").onchange=()=>{$("signatureFields").hidden=!$("includeSignatures").checked;updateSummary()};
  $$("[data-style-hint]").forEach(b=>b.onclick=()=>{const t=$("customStyleDirection");t.value=(t.value?t.value+" · ":"")+b.dataset.styleHint;updateSummary()});
  $$("[data-help-type]").forEach(b=>b.onclick=()=>{$$(" [data-help-type]".trim()).forEach(x=>x.classList.toggle("active",x===b));$("helpType").value=b.dataset.helpType});$("sendHelpBtn").onclick=sendHelp;
  if($("planSearch"))$("planSearch").oninput=renderWork;if($("planGradeFilter"))$("planGradeFilter").onchange=renderWork;if($("planSubjectFilter"))$("planSubjectFilter").onchange=renderWork;if($("refreshPlansBtn"))$("refreshPlansBtn").onclick=loadCloudPlans;if($("closePlanWorkspaceBtn"))$("closePlanWorkspaceBtn").onclick=closeWorkspacePlan;if($("planWorkspaceBackdrop"))$("planWorkspaceBackdrop").onclick=closeWorkspacePlan;if($("workspaceWorksheetBtn"))$("workspaceWorksheetBtn").onclick=()=>workspaceContinuation("worksheet");if($("workspaceQuizBtn"))$("workspaceQuizBtn").onclick=()=>workspaceContinuation("quiz");if($("workspaceGameBtn"))$("workspaceGameBtn").onclick=()=>workspaceContinuation("game");if($("workspacePackBtn"))$("workspacePackBtn").onclick=()=>workspaceContinuation("pack");if($("workspaceWordBtn"))$("workspaceWordBtn").onclick=()=>activeWorkspacePlan&&downloadWord(activeWorkspacePlan);if($("workspacePdfBtn"))$("workspacePdfBtn").onclick=()=>activeWorkspacePlan&&printPlanPdf(activeWorkspacePlan);if($("saveReflectionBtn"))$("saveReflectionBtn").onclick=saveReflection;if($("deleteCloudPlanBtn"))$("deleteCloudPlanBtn").onclick=deleteCloudPlan;if($("reusePlanBtn"))$("reusePlanBtn").onclick=()=>{if(!activeWorkspacePlan)return;switchTab("create");$("promptText").textContent=activeWorkspacePlan.prompt_text||"";$("promptWrap").hidden=false;closeWorkspacePlan();setTimeout(()=>$("promptWrap").scrollIntoView({behavior:"smooth"}),80)};
  $("profileBtn").onclick=openProfile;$("closeProfileBtn").onclick=closeProfile;$("profileBackdrop").onclick=closeProfile;
  $$("[data-avatar]").forEach(b=>b.onclick=()=>{profile.avatar_url=b.dataset.avatar;renderProfile()});
  $("profilePhoto").onchange=async e=>{const f=e.target.files?.[0];if(f){profile.avatar_url=await compress(f);renderProfile()}};
  $("saveProfileBtn").onclick=async()=>{const payload={full_name:v("profileDisplayName"),school_name:v("profileSchool")||null,avatar_url:profile.avatar_url||null};const {error}=await sb.from("profiles").update(payload).eq("id",user.id);if(error)return $("profileStatus").innerHTML=`<div class="error-box">${esc(error.message)}</div>`;Object.assign(profile,payload);renderProfile();$("profileStatus").innerHTML='<div class="indicator-preview">บันทึกแล้ว ✓</div>'};
  $("logoutBtn").onclick=async()=>{await sb.auth.signOut();location.replace("/teacher.html")};
  $$(".dest-tab").forEach(b=>b.onclick=()=>{$$(".dest-tab").forEach(x=>x.classList.toggle("active",x===b));$$(".dest-panel").forEach(x=>x.classList.toggle("active",x.id===`dest-${b.dataset.dest}`))});
  $$("[data-open]").forEach(b=>b.onclick=async()=>{await copy();window.open(b.dataset.open,"_blank","noopener")});
  $("openWordBtn").onclick=async()=>{await copy();window.open("https://www.office.com/launch/word","_blank","noopener")};
  $("savePdfBtn").onclick=()=>{const t=$("promptText").textContent;if(!t)return toast("ยังไม่มี Prompt");saveBlob(makePdfBlob("Klang Plan — Prompt\n\n"+t),"Klang-Plan-Prompt.pdf")}
}
async function start(){try{const ok=await auth();if(!ok)return;bind();await loadData();await loadCloudPlans();await loadCoursesFromCloud();renderCourses();$("loadingGate").classList.add("hidden");$("appShell").classList.remove("is-loading")}catch(e){console.error(e);$("loadingGate").innerHTML=`<div class="error-box"><b>เปิดระบบไม่สำเร็จ</b><br>${esc(e.message)}<br><br><button onclick="location.reload()" class="secondary-btn">ลองใหม่</button></div>`}}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start,{once:true}):start();
})();