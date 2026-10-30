(()=>{"use strict";
const $=id=>document.getElementById(id), $$=s=>[...document.querySelectorAll(s)];
const nodes=s=>[...document.querySelectorAll(s)];
function withTimeout(promise,ms,label="การเชื่อมต่อ"){return Promise.race([promise,new Promise((_,rej)=>setTimeout(()=>rej(new Error(label+" ใช้เวลานานเกินไป กรุณาลองใหม่")),ms))])}
const CFG=window.KLANG_CONFIG||{};
function memberRuntimeGuard(error){
  const message=(error&&error.message)||String(error||"เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
  console.error("Klang Plan runtime error",error);
  const gate=document.getElementById("loadingGate");
  if(gate&&!gate.classList.contains("hidden")){
    gate.innerHTML='<div class="error-box"><b>เปิดระบบไม่สำเร็จ</b><br>'+message.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))+'<br><br><button onclick="location.reload()" class="secondary-btn">ลองใหม่</button></div>';
    return
  }
  const toastEl=document.getElementById("toast");
  if(toastEl){toastEl.textContent="ระบบพบข้อผิดพลาด กรุณารีเฟรชหน้า";toastEl.classList.add("show");setTimeout(()=>toastEl.classList.remove("show"),3500)}
}
window.addEventListener("error",e=>memberRuntimeGuard(e.error||new Error(e.message||"runtime error")));
window.addEventListener("unhandledrejection",e=>memberRuntimeGuard(e.reason||new Error("promise rejected")));
let sb=null,user=null,profile=null,DATA=[],cloudPlans=[],activeWorkspacePlan=null,activeSavedResourceId=null,resourceAutosaveTimer=null,resourceCloudReady=false,stage="ปฐมวัย",selected=null,librarySelected=null,style="Modern Government",palette="ฟ้า–ม่วง–ทอง",materialType="worksheet",materialStyle="clean",materialPreviewMode="student",materialEditing=false,materialEditedHtml="",quizViewMode="student",quizEditing=false,quizEditedHtml="",rubricEditing=false,rubricEditedHtml="",gameViewMode="student",gameEditing=false,gameEditedHtml="",autoUnitValue="",autoTopicValue="",profilePhotoSource="",profilePhotoZoom=1,profilePhotoX=0,profilePhotoY=0,profilePhotoDragging=false,profilePhotoDragStart=null,planTeacherImageSource="none",planTeacherImageData="",planSchoolLogoSource="none",planSchoolLogoData="",planQrSource="none",planQrData="";
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
function makeMemberClient(url){return window.supabase.createClient(url,CFG.supabasePublishableKey||CFG.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,storageKey:"klang-member-auth"}})}
async function auth(){
  if(!window.supabase||!CFG.supabaseUrl||!(CFG.supabasePublishableKey||CFG.supabaseAnonKey)){location.replace("/teacher.html");return false}
  sb=makeMemberClient(CFG.supabaseUrl);
  const {data,error}=await withTimeout(sb.auth.getSession(),8000,"ตรวจสอบการเข้าสู่ระบบ");
  if(error||!data?.session){location.replace("/teacher.html");return false}
  user=data.session.user;
  const {data:p}=await withTimeout(sb.from("profiles").select("id,full_name,school_name,avatar_url,teacher_photo_url,school_logo_url,role,status,member_id,membership_started_at,membership_expires_at").eq("id",user.id).maybeSingle(),8000,"โหลดข้อมูลสมาชิก");
  if(!p||p.role!=="member"||p.status!=="active"){await sb.auth.signOut();location.replace("/teacher.html");return false}
  if(p.membership_expires_at&&new Date(p.membership_expires_at).getTime()<=Date.now()){
    await sb.auth.signOut();location.replace("/teacher.html?expired=1");return false
  }
  profile=p;renderProfile();applyTeacherDefaults(true);return true
}
function profileImageHtml(v,label){return v?.startsWith("data:image/")?'<img src="'+v+'" alt="'+esc(label||"")+'">':'<span>ยังไม่ได้อัปโหลด</span>'}
function teacherDefaults(){
  const m=user?.user_metadata||{};
  return {
    full_name:profile?.full_name||m.full_name||"",
    teacher_position:m.teacher_position||"",
    school_name:profile?.school_name||m.school_name||"",
    affiliation_type:m.affiliation_type||"obec",
    organization:m.organization||"",
    province:m.province||"",
    student_count:m.student_count==null?"":String(m.student_count)
  }
}
function applyTeacherDefaults(force=false){
  const d=teacherDefaults();
  const set=(id,val)=>{const el=$(id);if(el&&(force||!String(el.value||"").trim()))el.value=val||""};
  set("teacherName",d.full_name);
  set("teacherPosition",d.teacher_position);
  set("schoolName",d.school_name);
  if($("affiliationType")&&(force||!$("affiliationType").dataset.userChanged))$("affiliationType").value=d.affiliation_type||"obec";
  set("organization",d.organization);
  set("province",d.province);
  set("studentCount",d.student_count);
  if($("teacherSignatureName")&&(force||!$("teacherSignatureName").value.trim()))$("teacherSignatureName").value=d.full_name||"";
  renderAffiliation();updateSummary()
}
function renderProfile(){
  const d=teacherDefaults();
  $("profileName").textContent=d.full_name||"โปรไฟล์";
  $("profileMemberId").textContent=profile.member_id||"สมาชิก";
  $("profileAvatar").innerHTML=avatar(profile.avatar_url);
  $("profileAvatarLarge").innerHTML=avatar(profile.avatar_url);
  $("profileIdText").textContent=profile.member_id||"สมาชิก";
  $("profileDisplayName").value=d.full_name;
  $("profileTeacherPosition").value=d.teacher_position;
  $("profileSchool").value=d.school_name;
  $("profileAffiliationType").value=d.affiliation_type;
  $("profileOrganization").value=d.organization;
  $("profileProvince").value=d.province;
  $("profileStudentCount").value=d.student_count;
  renderProfilePhotoEditor();
  if($("teacherPhotoPreview"))$("teacherPhotoPreview").innerHTML=profileImageHtml(profile.teacher_photo_url||profile.avatar_url,"รูปครู");
  if($("schoolLogoPreview"))$("schoolLogoPreview").innerHTML=profileImageHtml(profile.school_logo_url,"โลโก้โรงเรียน");
}

function planTeacherImageLabel(){
  return planTeacherImageSource==="upload"?"อัปโหลดรูปใหม่สำหรับแผนนี้":planTeacherImageSource==="none"?"ไม่แสดงรูปครู":"ใช้รูปโปรไฟล์ (ต้องแนบไฟล์จริงเมื่อใช้ Prompt ภายนอก)"
}
function currentPlanTeacherImage(){
  if(planTeacherImageSource==="none")return "";
  if(planTeacherImageSource==="upload")return planTeacherImageData||"";
  const src=profile?.teacher_photo_url||profile?.avatar_url||"";
  return src&&String(src).startsWith("avatar:")?"":src
}
function planTeacherImagePrompt(){
  if(planTeacherImageSource==="none")return "รูปครูสำหรับแผนนี้: ไม่แสดงรูปครู และห้ามสร้างบุคคลหรือรูปครูขึ้นมาใหม่";
  if(planTeacherImageSource==="upload"){
    return planTeacherImageData
      ?"รูปครูสำหรับแผนนี้: ใช้รูปที่ครูอัปโหลดใหม่สำหรับแผนนี้เป็นภาพอ้างอิงเท่านั้น คงใบหน้า บุคลิก และสัดส่วนเดิม ห้ามเปลี่ยนใบหน้า ห้ามสร้างบุคคลใหม่ และเมื่อนำ Prompt ไปใช้กับ AI ให้แนบรูปนี้ไปพร้อม Prompt"
      :"รูปครูสำหรับแผนนี้: ครูเลือกอัปโหลดรูปใหม่ แต่ยังไม่ได้เลือกรูป จึงห้ามสร้างรูปครูขึ้นมาเองจนกว่าจะมีไฟล์ภาพจริง"
  }
  return currentPlanTeacherImage()
    ?"รูปครูสำหรับแผนนี้: ใช้รูปครูจริงจากโปรไฟล์ของครูเป็นภาพอ้างอิงหลักของผลงานนี้ ระบบเลือกภาพนี้ให้แล้ว ต้องใช้บุคคลคนเดิม คงใบหน้า ทรงผม บุคลิก โทนผิว และสัดส่วนเดิม ห้ามเปลี่ยนใบหน้า ห้ามสร้างบุคคลใหม่ ห้ามใช้ภาพครูอื่น และให้ถือภาพโปรไฟล์นี้เป็น Reference Image ของ Prompt นี้โดยตรง"
    :"รูปครูสำหรับแผนนี้: เลือกใช้รูปโปรไฟล์ แต่โปรไฟล์ยังไม่มีไฟล์ภาพจริง จึงห้ามสร้างรูปครูขึ้นมาเอง"
}
function renderPlanTeacherImagePicker(){
  const box=$("planTeacherImageBlock");if(!box)return;
  document.querySelectorAll('input[name="planTeacherImageSource"]').forEach(r=>r.checked=r.value===planTeacherImageSource);
  const uploadWrap=$("planTeacherUploadWrap");if(uploadWrap)uploadWrap.hidden=planTeacherImageSource!=="upload";
  const hint=$("planTeacherImageHint");
  if(hint){
    hint.textContent=planTeacherImageSource==="profile"
      ?(currentPlanTeacherImage()?"ระบบจะใช้รูปโปรไฟล์ปัจจุบันของครู":"ยังไม่มีรูปโปรไฟล์แบบภาพ กรุณาเพิ่มในโปรไฟล์หรือเลือกอัปโหลดรูปใหม่")
      :planTeacherImageSource==="upload"
        ?(planTeacherImageData?"ใช้รูปใหม่เฉพาะแผนนี้ ไม่เปลี่ยนรูปโปรไฟล์หลัก":"เลือกรูปใหม่สำหรับแผนนี้")
        :"แผนหน้าเดียวและ Prompt จะไม่ใช้รูปครู"
  }
  const preview=$("planTeacherImagePreview"),src=currentPlanTeacherImage();
  if(preview)preview.innerHTML=src?'<img src="'+src+'" alt="ตัวอย่างรูปครู">':'<span>ไม่มีรูปครูที่จะแสดง</span>';
}
function ensurePlanTeacherImagePicker(){}

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
function indicatorSuggestions(row){
  if(!row)return {unit:"",topic:""};
  const unit=String(row.domain||row.subject||"").trim();
  let topic=String(row.indicator_text||"").trim().replace(/\s+/g," ");
  if(topic.length>120)topic=topic.slice(0,117).trim()+"...";
  return {unit,topic}
}
function applyIndicatorSuggestions(row){
  if(!row)return;
  const unitEl=$("unitName"),topicEl=$("topic"),sug=indicatorSuggestions(row);
  const unitNow=unitEl?.value?.trim()||"",topicNow=topicEl?.value?.trim()||"";
  const canUnit=!unitNow||unitNow===autoUnitValue;
  const canTopic=!topicNow||topicNow===autoTopicValue;
  if(unitEl&&canUnit&&sug.unit){unitEl.value=sug.unit;autoUnitValue=sug.unit}
  if(topicEl&&canTopic&&sug.topic){topicEl.value=sug.topic;autoTopicValue=sug.topic}
}
function chooseIndicator(){
  const i=Number($("indicator").value);
  selected=Number.isFinite(i)?DATA[i]:null;
  $("indicatorPreview").innerHTML=selected?`<b>${esc(selected.indicator||selected.standard||"")}</b><br>${esc(selected.indicator_text||"")}<br><small>${esc(selected.classification||"")}</small>`:"เลือกตัวชี้วัดเพื่อดูรายละเอียด";
  if(selected)applyIndicatorSuggestions(selected);
  updateSummary()
}
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
function planDesignValue(id,fallback=""){return $(id)?.value||fallback}
function planTeacherPlacementLabel(){const m={header:"หัวเอกสาร",side:"มุมข้างข้อมูลผู้สอน",footer:"ส่วนท้ายเอกสาร"};return m[planDesignValue("planTeacherPlacement","header")]||"หัวเอกสาร"}
function schoolLogoPrompt(){
  if(planSchoolLogoSource==="none")return "โลโก้โรงเรียน: ไม่แสดงโลโก้ และห้ามสร้างโลโก้ขึ้นมาเอง";
  if(planSchoolLogoSource==="upload")return planSchoolLogoData?"โลโก้โรงเรียน: ใช้ไฟล์โลโก้ที่ครูอัปโหลดสำหรับแผนนี้เท่านั้น ต้องคงรูปทรง สี สัดส่วน และรายละเอียดต้นฉบับ ห้ามบิด ดัดแปลง หรือสร้างใหม่":"โลโก้โรงเรียน: ครูเลือกอัปโหลดใหม่แต่ยังไม่มีไฟล์ จึงห้ามสร้างโลโก้สมมติ";
  return profile?.school_logo_url?"โลโก้โรงเรียน: ใช้โลโก้จากโปรไฟล์ของครู คงรูปทรง สี สัดส่วน และรายละเอียดต้นฉบับ ห้ามบิดหรือดัดแปลง":"โลโก้โรงเรียน: เลือกใช้จากโปรไฟล์แต่ยังไม่มีไฟล์จริง จึงห้ามสร้างโลโก้สมมติ";
}
function qrPrompt(){
  if(planQrSource!=="upload")return "QR Code: ไม่ใช้";
  return planQrData?"QR Code: ใช้ QR Code ที่ครูอัปโหลดเท่านั้น ต้องคงภาพต้นฉบับ ไม่ตกแต่งทับ ไม่บิดเบือน มีพื้นที่ว่างรอบโค้ด และต้องสแกนได้จริง":"QR Code: ครูเลือกใช้ QR แต่ยังไม่มีไฟล์ จึงยังไม่ต้องแสดง QR";
}
function designOptionsPrompt(){
  const density={balanced:"สมดุล สวย อ่านง่าย และมีพื้นที่ว่างพอดี",airy:"โปร่ง โล่ง มีพื้นที่ว่างมากขึ้น และลดความหนาแน่นของข้อความ",compact:"กระชับ ใช้พื้นที่คุ้มค่า แต่ยังอ่านง่ายและห้ามย่อจนตัวเล็ก"}[planDesignValue("planDensity","balanced")];
  const icons={soft:"ไอคอน Soft Rounded ทันสมัย ขนาดเล็กและสม่ำเสมอ",line:"ไอคอนเส้น Outline เรียบ สุภาพ เป็นทางการ",flat:"ไอคอน Flat Color สดใสแต่ไม่รบกวนเนื้อหา","3d":"ไอคอน 3D Education ใช้เฉพาะจุดสำคัญ ไม่มากเกินไป",none:"ไม่ใช้ไอคอน เน้น Typography และเส้นแบ่ง"}[planDesignValue("planIconStyle","soft")];
  const bg={clean:"พื้นขาวสะอาด เน้นความชัดและพิมพ์ง่าย",soft:"พื้นหลังไล่เฉดสีอ่อนมาก ไม่รบกวนตัวอักษร",geometric:"พื้นหลังมีลายเรขาคณิตบางมากเฉพาะขอบหรือมุม",thai:"ใช้ลายไทยร่วมสมัยบางมากเฉพาะขอบหรือหัวเรื่อง"}[planDesignValue("planBackground","clean")];
  const frame={rounded:"ใช้กล่อง Section มุมโค้งสมัยใหม่",formal:"ใช้กรอบเส้นเรียบทางการและเป็นระเบียบ",minimal:"ใช้เส้นคั่นบางและพื้นที่ว่างแทนกล่องหนัก",none:"ไม่ใช้กรอบ Section ใช้ระยะห่างและ Typography แยกส่วน"}[planDesignValue("planSectionFrame","rounded")];
  const decor={low:"ตกแต่งน้อย เรียบ สุภาพ เหมาะเอกสารราชการ",medium:"ตกแต่งพอดี ดูสวยทันสมัยแต่ไม่รก",high:"ตกแต่งเด่นแบบอินโฟกราฟิก แต่ต้องคุมจำนวนองค์ประกอบและไม่แย่งเนื้อหา"}[planDesignValue("planDecorationLevel","medium")];
  return ["ความหนาแน่น: "+density,"รูปแบบไอคอน: "+icons,"พื้นหลัง: "+bg,"กรอบ Section: "+frame,"ระดับการตกแต่ง: "+decor,"ตำแหน่งรูปครู: "+planTeacherPlacementLabel()].join("\n");
}
function syncTeacherSourceControls(){
  document.querySelectorAll('input[name="planTeacherImageStyleSource"]').forEach(r=>r.checked=r.value===planTeacherImageSource);
  if($("planTeacherStyleUploadWrap"))$("planTeacherStyleUploadWrap").hidden=planTeacherImageSource!=="upload";
}

let directPreviewRaf=0;
function directTheme(){
  const palettes={
    "ฟ้า–ม่วง–ทอง":["#246BCE","#6552E8","#F2B735","#EEF5FF"],
    "กรมท่า–ทอง":["#173B67","#B4872E","#E1B84C","#F6F2E8"],
    "มิ้นต์–ฟ้า":["#278C7C","#3F8EDB","#82D6C8","#EFFAF8"],
    "ส้ม–ครีม":["#E87A27","#D9A441","#F1B45C","#FFF7E9"],
    "ชมพู–ฟ้า":["#D85F93","#4F8EDB","#F39BC0","#FFF0F7"],
    "เขียว–ทอง":["#2F7D52","#B78B32","#D6B85D","#F3F8F1"]
  };
  const p=palettes[palette]||palettes["ฟ้า–ม่วง–ทอง"];
  return {primary:p[0],secondary:p[1],accent:p[2],soft:p[3],ink:"#183B56",muted:"#60788A",line:"#D7E3EC"};
}
function directPreviewData(){
  const g=$("grade")?.value||selected?.grade||"-";
  const subject=$("subject")?.value||selected?.subject||"-";
  const unit=v("unitName")||selected?.domain||"-";
  const topic=v("topic")||selected?.indicator_text||"หัวข้อการเรียนรู้";
  const duration=v("duration")||"1 ชั่วโมง";
  const method=v("method")||"Active Learning";
  const sem=v("semester")||"-",year=v("academicYear")||"-";
  const teacher=v("teacherName")||profile?.full_name||"ครูผู้สอน";
  const position=v("teacherPosition")||profile?.teacher_position||"";
  const school=v("schoolName")||profile?.school_name||"";
  const org=v("organization")||profile?.organization||"";
  const indicator=selected?.indicator||"-";
  const indicatorText=selected?.indicator_text||"";
  const standard=selected?.standard||"-";
  const essence=indicatorText?("มุ่งให้ผู้เรียนเข้าใจและสามารถ "+indicatorText.replace(/^สามารถ\s*/,"")):("เรียนรู้เรื่อง "+topic+" ผ่านกิจกรรมที่เน้นผู้เรียนเป็นสำคัญ");
  const objectives=[
    indicatorText?("อธิบายสาระสำคัญที่เกี่ยวข้องกับ "+topic+" ได้"):"อธิบายความรู้สำคัญของบทเรียนได้",
    "ปฏิบัติกิจกรรมตามขั้นตอนและประยุกต์ใช้ความรู้ได้",
    "มีส่วนร่วมในการเรียนรู้และสะท้อนผลการเรียนรู้ของตนเองได้"
  ];
  return {g,subject,unit,topic,duration,method,sem,year,teacher,position,school,org,indicator,indicatorText,standard,essence,objectives};
}
function roundRectPath(ctx,x,y,w,h,r=18){
  const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
}
function fillRound(ctx,x,y,w,h,fill,stroke=null,r=18){
  roundRectPath(ctx,x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}
}
function fitTextLines(ctx,text,maxWidth,maxLines=4){
  const src=String(text||"").replace(/\s+/g," ").trim();if(!src)return [""];
  const words=src.split(" ");const lines=[];let line="";
  for(const word of words){
    const test=line?line+" "+word:word;
    if(ctx.measureText(test).width<=maxWidth){line=test;continue}
    if(line)lines.push(line);
    line=word;
    if(lines.length>=maxLines-1)break;
  }
  if(line&&lines.length<maxLines)lines.push(line);
  if(lines.length===maxLines){
    let last=lines[maxLines-1];
    while(last&&ctx.measureText(last+"…").width>maxWidth)last=last.slice(0,-1);
    if(last!==lines[maxLines-1]||words.join(" ").length>lines.join(" ").length)lines[maxLines-1]=last+"…";
  }
  return lines;
}
function drawWrapped(ctx,text,x,y,maxWidth,lineHeight,maxLines=4){
  const lines=fitTextLines(ctx,text,maxWidth,maxLines);lines.forEach((ln,i)=>ctx.fillText(ln,x,y+i*lineHeight));return y+lines.length*lineHeight;
}
function drawBulletList(ctx,items,x,y,maxWidth,lineHeight=26,maxItems=4){
  let yy=y;for(const item of items.slice(0,maxItems)){ctx.fillText("•",x,yy);yy=drawWrapped(ctx,item,x+20,yy,maxWidth-20,lineHeight,2)+4}return yy;
}
function drawSectionTitle(ctx,n,title,x,y,w,theme){
  fillRound(ctx,x,y,42,42,theme.primary,null,12);ctx.fillStyle="#fff";ctx.font="700 23px Tahoma, Arial, sans-serif";ctx.textAlign="center";ctx.fillText(String(n),x+21,y+29);ctx.textAlign="left";
  ctx.fillStyle=theme.ink;ctx.font="700 25px Tahoma, Arial, sans-serif";ctx.fillText(title,x+54,y+29);
  ctx.strokeStyle=theme.line;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+54,y+38);ctx.lineTo(x+w,y+38);ctx.stroke();
}
async function drawCoverImage(ctx,src,x,y,w,h){
  if(!src||!String(src).startsWith("data:image/"))return false;
  const im=await loadCanvasImage(src);if(!im)return false;
  const scale=Math.max(w/im.width,h/im.height),sw=w/scale,sh=h/scale,sx=(im.width-sw)/2,sy=(im.height-sh)/2;
  ctx.save();roundRectPath(ctx,x,y,w,h,16);ctx.clip();ctx.drawImage(im,sx,sy,sw,sh,x,y,w,h);ctx.restore();return true;
}
async function buildDirectPlanCanvas(){
  const c=$("directPlanCanvas");if(!c||!selected)return;
  const ctx=c.getContext("2d"),W=c.width,H=c.height,d=directPreviewData(),th=directTheme();
  ctx.clearRect(0,0,W,H);ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);

  const bg=planDesignValue("planBackground","clean");
  if(bg==="soft"){const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,th.soft);g.addColorStop(.48,"#fff");g.addColorStop(1,th.soft);ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
  else if(bg==="geometric"){ctx.fillStyle=th.soft;ctx.globalAlpha=.42;for(let i=0;i<8;i++){ctx.beginPath();ctx.arc(80+i*165,64+(i%2)*24,28,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1}
  else if(bg==="thai"){ctx.fillStyle=th.soft;ctx.globalAlpha=.52;for(let i=0;i<12;i++){ctx.save();ctx.translate(i*110,24);ctx.rotate(Math.PI/4);ctx.fillRect(0,0,16,16);ctx.restore()}ctx.globalAlpha=1}

  ctx.fillStyle=th.primary;ctx.fillRect(0,0,W,16);
  const M=48,G=14,contentW=W-M*2,col=(contentW-G)/2;
  const density=planDesignValue("planDensity","balanced"),airy=density==="airy";
  const cardR=planDesignValue("planSectionFrame","rounded")==="formal"?4:planDesignValue("planSectionFrame","rounded")==="minimal"?10:18;
  const cardFill=planDesignValue("planSectionFrame","rounded")==="none"?"#FFFFFF":(airy?"#FFFFFF":th.soft);

  // Header — compact but readable
  let y=36;
  ctx.fillStyle=th.ink;ctx.font="800 48px Tahoma, Arial, sans-serif";ctx.textAlign="center";ctx.fillText("แผนการจัดการเรียนรู้",W/2,y+44);
  ctx.font="600 22px Tahoma, Arial, sans-serif";ctx.fillStyle=th.muted;ctx.fillText(d.subject+" • ชั้น "+d.g+" • ภาคเรียน "+d.sem+"/"+d.year,W/2,y+78);
  ctx.textAlign="left";

  const teacherSrc=profile?.teacher_photo_url||profile?.avatar_url||"";
  const logoSrc=profile?.school_logo_url||"";
  const mediaY=y+90;
  fillRound(ctx,M,mediaY,contentW,96,"#FFFFFF",th.line,16);
  const hasTeacher=await drawCoverImage(ctx,teacherSrc,M+14,mediaY+10,72,72);
  const hasLogo=await drawCoverImage(ctx,logoSrc,W-M-78,mediaY+11,66,66);
  const infoX=M+(hasTeacher?100:20);
  ctx.fillStyle=th.ink;ctx.font="700 22px Tahoma, Arial, sans-serif";ctx.fillText(d.teacher,infoX,mediaY+29);
  ctx.font="500 18px Tahoma, Arial, sans-serif";ctx.fillStyle=th.muted;
  ctx.fillText([d.position,d.school].filter(Boolean).join(" • "),infoX,mediaY+54);
  ctx.fillText([d.org,v("province")].filter(Boolean).join(" • "),infoX,mediaY+78);
  y=mediaY+112;

  // 1-2: curriculum + essence
  const h1=210;
  fillRound(ctx,M,y,col,h1,cardFill,th.line,cardR);drawSectionTitle(ctx,1,"ข้อมูลหลักสูตรและข้อมูลพื้นฐาน",M+16,y+12,col-32,th);
  ctx.fillStyle=th.ink;ctx.font="600 18px Tahoma, Arial, sans-serif";
  const leftRows=[
    ["หน่วย",d.unit],["เรื่อง",d.topic],["เวลา",d.duration],["รูปแบบ",d.method],
    ["มาตรฐาน",d.standard],["ตัวชี้วัด",d.indicator],
    ["วันที่สอน",v("teachingDate")||"-"],["นักเรียน",v("studentCount")?v("studentCount")+" คน":"-"]
  ];
  let yy=y+60;
  leftRows.forEach(([k,val],i)=>{ctx.fillStyle=th.muted;ctx.fillText(k+" :",M+22,yy);ctx.fillStyle=th.ink;ctx.fillText(String(val||"-").slice(0,42),M+128,yy);yy+=19});

  fillRound(ctx,M+col+G,y,col,h1,cardFill,th.line,cardR);drawSectionTitle(ctx,2,"สาระสำคัญ / ความคิดรวบยอด",M+col+G+16,y+12,col-32,th);
  ctx.fillStyle=th.ink;ctx.font="500 18px Tahoma, Arial, sans-serif";drawWrapped(ctx,d.essence,M+col+G+22,y+62,col-44,23,4);
  ctx.fillStyle=th.primary;ctx.font="700 18px Tahoma, Arial, sans-serif";ctx.fillText("ข้อความตัวชี้วัด",M+col+G+22,y+150);
  ctx.fillStyle=th.ink;ctx.font="500 17px Tahoma, Arial, sans-serif";drawWrapped(ctx,d.indicatorText||"-",M+col+G+22,y+176,col-44,21,2);
  y+=h1+G;

  // 3-4: objectives + learning content
  const h2=190;
  fillRound(ctx,M,y,col,h2,"#FFFFFF",th.line,cardR);drawSectionTitle(ctx,3,"จุดประสงค์การเรียนรู้",M+16,y+12,col-32,th);
  ctx.fillStyle=th.ink;ctx.font="500 18px Tahoma, Arial, sans-serif";drawBulletList(ctx,d.objectives,M+22,y+60,col-44,21,3);

  fillRound(ctx,M+col+G,y,col,h2,"#FFFFFF",th.line,cardR);drawSectionTitle(ctx,4,"สาระ / สมรรถนะ / คุณลักษณะ",M+col+G+16,y+12,col-32,th);
  ctx.fillStyle=th.primary;ctx.font="700 18px Tahoma, Arial, sans-serif";ctx.fillText("สาระการเรียนรู้",M+col+G+22,y+60);
  ctx.fillStyle=th.ink;ctx.font="500 17px Tahoma, Arial, sans-serif";drawWrapped(ctx,d.topic+" — "+(d.indicatorText||"สาระตามตัวชี้วัด"),M+col+G+22,y+84,col-44,20,2);
  ctx.fillStyle=th.primary;ctx.font="700 18px Tahoma, Arial, sans-serif";ctx.fillText("สมรรถนะ",M+col+G+22,y+130);
  ctx.fillStyle=th.ink;ctx.font="500 16px Tahoma, Arial, sans-serif";ctx.fillText("การสื่อสาร • การคิด • การใช้ทักษะชีวิต",M+col+G+126,y+130);
  ctx.fillStyle=th.primary;ctx.font="700 18px Tahoma, Arial, sans-serif";ctx.fillText("คุณลักษณะ",M+col+G+22,y+160);
  ctx.fillStyle=th.ink;ctx.font="500 16px Tahoma, Arial, sans-serif";ctx.fillText("ใฝ่เรียนรู้ • มุ่งมั่นในการทำงาน • มีวินัย",M+col+G+126,y+160);
  y+=h2+G;

  // 5: learning activities
  const h3=220;
  fillRound(ctx,M,y,contentW,h3,th.soft,th.line,cardR);drawSectionTitle(ctx,5,"กิจกรรมการเรียนรู้ ("+d.method+")",M+16,y+12,contentW-32,th);
  const thirds=(contentW-44)/3,stageY=y+58;
  const stages=[
    ["A","ขั้นนำเข้าสู่บทเรียน","10 นาที","ทบทวนประสบการณ์เดิม เชื่อมโยงเข้าสู่เรื่อง "+d.topic],
    ["B","ขั้นเรียนรู้ / ปฏิบัติ","40 นาที","ผู้เรียนลงมือทำกิจกรรมตาม "+d.method+" แลกเปลี่ยน ตรวจสอบ และประยุกต์ใช้ความรู้"],
    ["C","ขั้นสรุป / สะท้อนผล","10 นาที","ร่วมสรุปสาระสำคัญ นำเสนอผลงาน และสะท้อนสิ่งที่ได้เรียนรู้"]
  ];
  stages.forEach((st,i)=>{const x=M+14+i*(thirds+8);fillRound(ctx,x,stageY,thirds,146,"#FFFFFF",th.line,14);fillRound(ctx,x+12,stageY+12,32,32,i===0?th.primary:i===1?th.secondary:th.accent,null,10);ctx.fillStyle="#fff";ctx.font="800 18px Tahoma, Arial, sans-serif";ctx.textAlign="center";ctx.fillText(st[0],x+28,stageY+34);ctx.textAlign="left";ctx.fillStyle=th.ink;ctx.font="700 17px Tahoma, Arial, sans-serif";ctx.fillText(st[1],x+52,stageY+28);ctx.fillStyle=th.muted;ctx.font="600 15px Tahoma, Arial, sans-serif";ctx.fillText(st[2],x+52,stageY+51);ctx.fillStyle=th.ink;ctx.font="500 15px Tahoma, Arial, sans-serif";drawWrapped(ctx,st[3],x+14,stageY+72,thirds-28,19,3)});
  y+=h3+G;

  // 6-7: question/media/task + differentiation
  const h4=160;
  fillRound(ctx,M,y,col,h4,"#FFFFFF",th.line,cardR);drawSectionTitle(ctx,6,"คำถามสำคัญ / สื่อ / ชิ้นงาน",M+16,y+12,col-32,th);
  ctx.fillStyle=th.ink;ctx.font="500 16px Tahoma, Arial, sans-serif";
  drawBulletList(ctx,["วันนี้เราได้เรียนรู้อะไรจากเรื่อง "+d.topic+"?","ความรู้นี้นำไปใช้ในชีวิตจริงอย่างไร?","สื่อ: ใบงาน / บัตรภาพ / สื่อดิจิทัล","ชิ้นงาน: ผลงานหรือภาระงานจากกิจกรรม"],M+22,y+58,col-44,18,4);

  fillRound(ctx,M+col+G,y,col,h4,"#FFFFFF",th.line,cardR);drawSectionTitle(ctx,7,"ความแตกต่างระหว่างผู้เรียน",M+col+G+16,y+12,col-32,th);
  ctx.fillStyle=th.ink;ctx.font="500 16px Tahoma, Arial, sans-serif";drawBulletList(ctx,["จัดกลุ่มยืดหยุ่นตามความพร้อมของผู้เรียน","ใช้สื่อหลายรูปแบบและตัวอย่างที่หลากหลาย","ให้คำแนะนำเพิ่มเติมแก่ผู้เรียนที่ต้องการความช่วยเหลือ"],M+col+G+22,y+60,col-44,19,3);
  y+=h4+G;

  // 8: assessment
  const h5=180;
  fillRound(ctx,M,y,contentW,h5,th.soft,th.line,cardR);drawSectionTitle(ctx,8,"การวัดและประเมินผล",M+16,y+12,contentW-32,th);
  const tx=M+20,ty=y+56,tw=contentW-40,rowH=29,cols=[.36,.20,.24,.20],headers=["จุดประสงค์","วิธีวัด","เครื่องมือ","เกณฑ์ผ่าน"];
  let cx=tx;ctx.font="700 15px Tahoma, Arial, sans-serif";
  headers.forEach((hd,i)=>{const ww=tw*cols[i];ctx.fillStyle=i===0?th.primary:th.secondary;ctx.fillRect(cx,ty,ww,rowH);ctx.fillStyle="#fff";ctx.fillText(hd,cx+8,ty+20);cx+=ww});
  const rows=[
    [d.objectives[0],"ถาม-ตอบ / ตรวจงาน","แบบตรวจ / ใบงาน","≥ 70%"],
    [d.objectives[1],"สังเกตการปฏิบัติ","แบบสังเกต","ระดับพอใช้ขึ้นไป"],
    [d.objectives[2],"สังเกตพฤติกรรม","แบบประเมิน","ผ่านเกณฑ์"]
  ];
  ctx.font="500 13px Tahoma, Arial, sans-serif";
  rows.forEach((r,ri)=>{let x=tx;const yy2=ty+rowH*(ri+1);r.forEach((val,i)=>{const ww=tw*cols[i];ctx.fillStyle="#fff";ctx.fillRect(x,yy2,ww,rowH);ctx.strokeStyle=th.line;ctx.strokeRect(x,yy2,ww,rowH);ctx.fillStyle=th.ink;const txt=String(val||"");ctx.fillText(txt.length>42?txt.slice(0,41)+"…":txt,x+6,yy2+19);x+=ww})});
  y+=h5+G;

  // 9: reflection + signatures — guaranteed to stay inside A4
  const footerY=Math.min(y,H-444-42); y=footerY; const footerH=H-y-42;
  fillRound(ctx,M,y,contentW,footerH,"#FFFFFF",th.line,cardR);drawSectionTitle(ctx,9,"บันทึกหลังสอน / การรับรองแผน",M+16,y+12,contentW-32,th);
  const splitX=M+contentW*.62;
  ctx.strokeStyle=th.line;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(splitX,y+60);ctx.lineTo(splitX,y+footerH-22);ctx.stroke();

  ctx.fillStyle=th.muted;ctx.font="500 16px Tahoma, Arial, sans-serif";
  ctx.fillText("ผลการเรียนรู้: ....................................................................................",M+22,y+78);
  ctx.fillText("ปัญหา/อุปสรรค: .................................................................................",M+22,y+110);
  ctx.fillText("แนวทางพัฒนา: ....................................................................................",M+22,y+142);
  ctx.fillText("ข้อเสนอแนะเพิ่มเติม: ...........................................................................",M+22,y+172);

  const signX=splitX+24,signW=W-M-signX;
  ctx.fillStyle=th.ink;ctx.font="700 17px Tahoma, Arial, sans-serif";ctx.fillText("ลงชื่อผู้สอน",signX,y+78);
  ctx.fillStyle=th.muted;ctx.font="500 15px Tahoma, Arial, sans-serif";
  ctx.fillText("ลงชื่อ ................................................",signX,y+106);
  ctx.fillText("( "+d.teacher+" )",signX,y+132);
  ctx.fillText("วันที่ ........ / ........ / ........",signX,y+158);
  if($("includeSignatures")?.checked){
    ctx.fillStyle=th.ink;ctx.font="700 17px Tahoma, Arial, sans-serif";ctx.fillText("ความเห็นผู้รับรอง",signX,y+188);
    ctx.fillStyle=th.muted;ctx.font="500 15px Tahoma, Arial, sans-serif";ctx.fillText("ลงชื่อ ................................................",signX,y+214);
    ctx.fillText("ตำแหน่ง .............................................",signX,y+238);
  }

  ctx.fillStyle=th.primary;ctx.font="600 14px Tahoma, Arial, sans-serif";ctx.fillText("Klang Plan · แผนการจัดการเรียนรู้หน้าเดียว A4",M,H-20);

  if($("directPreviewStyleName"))$("directPreviewStyleName").textContent=(styleMeta[style]||[])[0]||style;
}
function renderDirectPlanPreview(){
  cancelAnimationFrame(directPreviewRaf);
  directPreviewRaf=requestAnimationFrame(()=>{buildDirectPlanCanvas().catch(err=>console.warn("direct preview",err))});
}
function canvasJpegBytes(canvas){
  const b64=canvas.toDataURL("image/jpeg",.94).split(",")[1],bin=atob(b64),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return bytes
}
function singleImagePdfBlob(canvas){
  const im={bytes:canvasJpegBytes(canvas),w:canvas.width,h:canvas.height},te=new TextEncoder(),parts=[],offsets=[0];let len=0;
  const add=x=>{const b=typeof x==="string"?te.encode(x):x;parts.push(b);len+=b.length};
  add("%PDF-1.4\n%KLANG-A4\n");
  const obj=(n,body)=>{offsets[n]=len;add(n+" 0 obj\n");add(body);add("\nendobj\n")};
  obj(1,"<< /Type /Catalog /Pages 2 0 R >>");
  obj(2,"<< /Type /Pages /Count 1 /Kids [3 0 R] >>");
  obj(3,"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>");
  offsets[4]=len;add("4 0 obj\n<< /Type /XObject /Subtype /Image /Width "+im.w+" /Height "+im.h+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+im.bytes.length+" >>\nstream\n");add(im.bytes);add("\nendstream\nendobj\n");
  const stream="q\n595.28 0 0 841.89 0 0 cm\n/Im1 Do\nQ\n";obj(5,"<< /Length "+te.encode(stream).length+" >>\nstream\n"+stream+"endstream");
  const xref=len;add("xref\n0 6\n0000000000 65535 f \n");for(let i=1;i<=5;i++)add(String(offsets[i]||0).padStart(10,"0")+" 00000 n \n");add("trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF");
  return new Blob(parts,{type:"application/pdf"})
}
async function downloadDirectPlanPdf(){
  if(!selected)return toast("กรุณาเลือกตัวชี้วัดก่อน");
  await buildDirectPlanCanvas();
  const c=$("directPlanCanvas");if(!c)return;
  const name=safeFilename("แผนหน้าเดียว-"+(v("topic")||selected?.indicator||"Klang-Plan"))+".pdf";
  saveBlob(singleImagePdfBlob(c),name);toast("ดาวน์โหลด PDF A4 แล้ว ✓")
}

function updateSummary(){renderDirectPlanPreview();const vals=[["ช่วงชั้น",stage],["ชั้น",$("grade")?.value],["กลุ่มสาระ",$("subject")?.value],["ตัวชี้วัด",selected?.indicator],["หน่วย",$("unitName")?.value],["เรื่อง",$("topic")?.value],["สังกัด",(affiliationMeta[$("affiliationType")?.value||"obec"]||affiliationMeta.obec).title],["ภาคเรียน",$("semester")?.value],["ปีการศึกษา",$("academicYear")?.value],["วันที่สอน",$("includeTeachingDate")?.checked?$("teachingDate")?.value:""],["ลงนาม",$("includeSignatures")?.checked?"มี":"ไม่ใช้"],["สไตล์",style],["สี",palette],["ความหนาแน่น",planDesignValue("planDensity","balanced")],["ไอคอน",planDesignValue("planIconStyle","soft")]];$("summary").innerHTML=vals.filter(x=>x[1]).map(x=>`<div class="sum"><b>${x[0]}</b><span>${esc(x[1])}</span></div>`).join("")}
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
  const teacherMedia=planTeacherImagePrompt();
  const teacherImageRef=currentPlanTeacherImage();
  const teacherImageReferenceNote=teacherImageRef&&String(teacherImageRef).startsWith("data:image/")
    ?"ภาพครูอ้างอิงจากโปรไฟล์: ระบบมีไฟล์ภาพจริงของครูสำหรับงานนี้แล้ว ให้ใช้ภาพดังกล่าวเป็น Reference Image ของการสร้างภาพ ห้ามแทนที่ด้วยบุคคลอื่น"
    :"ภาพครูอ้างอิงจากโปรไฟล์: "+(planTeacherImageSource==="none"?"ไม่ใช้รูปครู":"หากไม่มีไฟล์ภาพจริง ห้ามสร้างใบหน้าครูสมมติ");
  const schoolLogoMedia=schoolLogoPrompt();
  const qrMedia=qrPrompt();
  const visualOptions=designOptionsPrompt();
  const approval=signatures?`
D. การรับรองแผนและการลงนาม
รูปแบบการรับรอง: ${v("approvalLayout")}
ครูผู้สอน: ${teacherSign}
ผู้บริหาร/ผู้อำนวยการ: ${v("directorName")||"........................................"}
ตำแหน่งผู้บริหาร: ${v("directorPosition")||"ผู้อำนวยการสถานศึกษา"}
ให้มีพื้นที่ลงชื่อและวันที่อย่างเหมาะสม โดยไม่ทำให้หน้าแน่นเกินไป`:`D. การรับรองแผนและการลงนาม
ไม่ต้องแสดงส่วนลงนามหรือรับรองแผน`;

  return `สร้างภาพ “แผนการจัดการเรียนรู้หน้าเดียว” ให้เสร็จเป็นผลงานภาพทันที ห้ามตอบเป็นบทความ ห้ามอธิบายขั้นตอน ห้ามสร้าง Prompt ซ้อน และห้ามส่งเป็นเอกสารข้อความยาว ให้เรนเดอร์เป็นภาพ A4 แนวตั้ง 210 × 297 มม. จำนวน 1 หน้าเท่านั้น พร้อมพิมพ์

คุณคือผู้เชี่ยวชาญด้านหลักสูตรไทย Instructional Design การจัดการเรียนรู้ การวัดและประเมินผล และ Educational Graphic Design ให้ผสานความถูกต้องทางวิชาการเข้ากับงานออกแบบอินโฟกราฟิกสำหรับครูไทย

เป้าหมายภาพ:
- งานต้องมีความสวยงามระดับอินโฟกราฟิกการศึกษาแบบมืออาชีพ แต่ยังคงลักษณะ “เอกสารแผนการจัดการเรียนรู้” มากกว่าโปสเตอร์โฆษณา
- ใช้หัวเรื่องใหญ่เด่นด้านบน แล้วจัดข้อมูลเป็นการ์ด/Section ที่มีลำดับสายตาชัดเจน
- ใช้สี ไอคอน รูปทรง การ์ด เส้นคั่น และภาพประกอบตามสไตล์ที่ครูเลือก โดยคุมให้เป็นธีมเดียวกันทั้งหน้า
- ใช้รายละเอียดตกแต่งแบบงานครูยุคใหม่ เช่น ไอคอนหนังสือ เป้าหมาย หลอดไฟ คลิปบอร์ด กราฟ อุปกรณ์การเรียน หรือองค์ประกอบที่สัมพันธ์กับรายวิชา โดยไม่ให้รก
- จัดองค์ประกอบให้แน่นพอดีแบบ “หน้าเดียวสวย” ไม่ใช่เอกสารราชการที่มีแต่ตาราง และไม่ใช่โปสเตอร์ที่เน้นภาพจนข้อมูลหาย
- ตัวอักษรภาษาไทยต้องอ่านง่าย ชัด มีขนาดเพียงพอเมื่อพิมพ์ A4; ห้ามใช้ฟอนต์จิ๋ว และต้องคงลำดับขนาดหัวเรื่อง > หัวข้อ > เนื้อหาอย่างชัดเจน
- ถ้าข้อมูลมากเกินพื้นที่ ให้สรุปใหม่เป็นวลีสั้น Bullet ตารางย่อ หรือแผนผัง โดยห้ามสร้างหน้าที่ 2 และห้ามลดตัวอักษรจนอ่านยาก
- ห้ามมีข้อความสุ่ม ข้อความเพี้ยน ภาษาไทยผิดรูป หรือคำตกแต่งที่ไม่มีข้อมูลรองรับ
- ผลลัพธ์สุดท้ายต้องเป็น “ภาพแผน A4 หน้าเดียว” พร้อมใช้งาน ไม่ต้องมีคำอธิบายนอกภาพ

โครงสร้างภาพบังคับเพื่อให้อ่านได้จริงบน A4:
- ใช้โครงแบบ 2 คอลัมน์หรือกริดใหญ่ที่สมดุล ห้ามแตกเป็นช่องเล็กจำนวนมาก
- จำกัด “บล็อกหลัก” ประมาณ 7–9 บล็อก โดยรวมองค์ประกอบที่เกี่ยวข้องไว้ด้วยกัน เพื่อให้ตัวอักษรมีขนาดอ่านง่าย
1. Header ขนาดใหญ่: “แผนการจัดการเรียนรู้” + กลุ่มสาระ/ชั้น/ภาคเรียน/ปีการศึกษา
2. ข้อมูลผู้สอนและโรงเรียน: ใช้รูปครูจริงจากไฟล์อ้างอิงในสัดส่วนเห็นใบหน้าชัด ไม่ใช้ avatar ไอคอนหรือภาพการ์ตูนแทน + โลโก้จริง
3. ข้อมูลหลักสูตร: มาตรฐาน / ตัวชี้วัด / หน่วย / เรื่อง / เวลา / รูปแบบการสอน
4. สาระสำคัญ + จุดประสงค์การเรียนรู้
5. สาระการเรียนรู้ + สมรรถนะ + คุณลักษณะ + ชิ้นงาน/ภาระงาน
6. กิจกรรมการเรียนรู้ 3 ขั้น: นำเข้า → เรียนรู้/ปฏิบัติ → สรุป/สะท้อนผล พร้อมเวลา
7. คำถามสำคัญ + สื่อ/อุปกรณ์/แหล่งเรียนรู้
8. การวัดและประเมินผลเป็นตาราง 4 คอลัมน์: จุดประสงค์ | วิธีวัด | เครื่องมือ | เกณฑ์ผ่าน
9. ส่วนท้าย: ความแตกต่างระหว่างผู้เรียน + บันทึกหลังสอน + ลงชื่อ/QR ตามที่เลือก

กติกาการอ่าน:
- ตัวอักษรเนื้อหาต้องอ่านได้จริงเมื่อดูเอกสาร A4 ที่ขนาด 100% ห้ามใช้ฟอนต์จิ๋วเพื่อยัดข้อมูล
- ห้ามสร้างหัวข้อย่อยมากกว่า 9 บล็อกหลัก
- ห้ามใช้ข้อความยาวเป็นย่อหน้าหนาแน่น ให้สรุปเป็น 2–4 บรรทัดต่อบล็อก หรือ bullet สั้น
- ห้ามใช้กราฟิกตกแต่งกินพื้นที่มากกว่าประมาณ 15% ของหน้า
- รูปครูต้องเป็น “ภาพถ่ายจริงจากไฟล์อ้างอิง” และต้องเห็นชัดพอ ไม่ใช่ไอคอนวงกลมเล็ก ๆ
- โลโก้ต้องใช้ไฟล์จริงและมีขนาดพอเหมาะ ไม่เด่นกว่าหัวเรื่อง
- ถ้าสไตล์ที่เลือกเป็นทางการ ห้ามใช้ตัวการ์ตูน เว้นแต่ผู้ใช้เลือกสไตล์เด็ก/สดใสโดยตรง
- พื้นที่ต้องมี white space ชัดเจน ไม่อัดทุกบล็อกชิดกัน

E. สื่อประจำตัวครู/โรงเรียน

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

E. องค์ประกอบทางวิชาการที่ต้องมีในแผนหน้าเดียว (บังคับให้ครบ)
1. ชื่อเอกสาร “แผนการจัดการเรียนรู้”
2. ข้อมูลพื้นฐานของแผน: กลุ่มสาระ/รายวิชา, ชั้น, ภาคเรียน, ปีการศึกษา, หน่วยการเรียนรู้, เรื่อง, เวลา, รูปแบบการจัดการเรียนรู้
3. ข้อมูลผู้สอน/โรงเรียน/สังกัด ตามข้อมูลที่มี
4. มาตรฐานการเรียนรู้ / ตัวชี้วัด / ความสามารถที่เกี่ยวข้อง
5. สาระสำคัญ / ความคิดรวบยอด
6. จุดประสงค์การเรียนรู้ที่วัดได้และสอดคล้องกับตัวชี้วัด
7. สาระการเรียนรู้ / เนื้อหาสำคัญ
8. สมรรถนะสำคัญของผู้เรียนที่เกี่ยวข้อง
9. คุณลักษณะอันพึงประสงค์ที่เกี่ยวข้อง
10. ชิ้นงาน / ภาระงาน หรือหลักฐานการเรียนรู้
11. กิจกรรมการเรียนรู้ตามรูปแบบ ${v("method")||"Active Learning"} โดยแบ่งเป็น ขั้นนำเข้าสู่บทเรียน → ขั้นเรียนรู้/ปฏิบัติ → ขั้นสรุปและสะท้อนผล พร้อมระบุเวลาโดยประมาณ
12. คำถามสำคัญ / คำถามกระตุ้นคิดอย่างน้อย 1–2 ข้อ
13. สื่อ / อุปกรณ์ / แหล่งเรียนรู้
14. การวัดและประเมินผล โดยต้องมีครบ: จุดประสงค์ → วิธีวัด → เครื่องมือ → เกณฑ์ผ่าน
15. การจัดการเรียนรู้ที่คำนึงถึงความแตกต่างระหว่างผู้เรียน / การช่วยเหลือผู้เรียนที่แตกต่างกัน แบบย่อ
16. บันทึกหลังสอนแบบย่อ โดยมี ผลการเรียนรู้ / ปัญหาอุปสรรค / แนวทางพัฒนา
17. ส่วนลงชื่อ/รับรองแผน หากผู้ใช้เลือกให้แสดง

กติกาการจัดพื้นที่:
- ห้ามตัดหัวข้อใดในข้อ 1–18 ออก หากหัวข้อนั้นมีข้อมูลหรือผู้ใช้เลือกให้แสดง
- หากพื้นที่ไม่พอ ให้ “ย่อถ้อยคำ” ไม่ใช่ “ตัดองค์ประกอบ”
- ใช้ Bullet, ตารางย่อ, badge, timeline, card และกล่องสรุป เพื่อให้ครบทุกองค์ประกอบใน 1 หน้า
- หัวข้อหลักทุกส่วนต้องมองเห็นได้ชัด ไม่ซ่อนรวมกันจนแยกไม่ออก
- การวัดและประเมินผลต้องเป็นตารางย่อที่อ่านง่าย
- กิจกรรมการเรียนรู้ต้องเห็นลำดับขั้นอย่างชัดเจน
- บันทึกหลังสอนและส่วนลงชื่อสามารถทำเป็นพื้นที่สั้นด้านล่างได้ แต่ต้องยังมองเห็นเป็นองค์ประกอบแยก

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

ตัวเลือกการตกแต่งที่ครูเลือก (ต้องปฏิบัติตามจริง)
${visualOptions}

ไฟล์อ้างอิงที่อาจแนบมาพร้อม Prompt นี้
- 01-Teacher-Reference: ถ้ามี ให้ใช้ภาพครูคนนี้เท่านั้น คงใบหน้าและบุคลิกเดิม ห้ามสร้างบุคคลใหม่
- 02-School-Logo: ถ้ามี ให้ใช้โลโก้ต้นฉบับนี้เท่านั้น ห้ามดัดแปลง
- 03-QR-Code: ถ้ามี ให้ใช้ QR ต้นฉบับนี้เท่านั้น ต้องสแกนได้จริง
- หากไม่มีไฟล์ชนิดใดแนบมา ห้ามสร้างไฟล์นั้นขึ้นเอง

- ใช้ Typography ภาษาไทยอ่านง่าย
- มี Visual hierarchy ชัดเจน
- ออกแบบให้ดูเป็น “แผนการจัดการเรียนรู้หน้าเดียว” แบบอินโฟกราฟิกการศึกษา ไม่ใช่เอกสารตารางธรรมดา
- จัดสัดส่วนข้อมูลให้ครบแต่ไม่แน่น ใช้การ์ด Section, icon, badge, เส้นคั่น และพื้นที่ว่างอย่างสมดุล
- ชื่อหลักบนงานใช้คำว่า “แผนการจัดการเรียนรู้”
- ให้แต่ละ Section มีหัวข้อสั้นเด่น สีสัมพันธ์กับธีม และใช้เลขลำดับหรือไอคอนช่วยนำสายตา
- ถ้ามีรูปครูหรือโลโก้ ให้ใช้ไฟล์จริงที่แนบเท่านั้น ห้ามสร้างใหม่ ห้ามเปลี่ยนใบหน้า และห้ามบิดโลโก้
- หาก AI รองรับการสร้างภาพ ให้สร้างภาพทันทีจากคำสั่งนี้โดยไม่ตอบกลับเป็นข้อความก่อน
- ส่งออกผลลัพธ์เป็นภาพ A4 หน้าเดียวเท่านั้น`;
}
async function imageSourceToPngBlob(src){
  if(!src)return null;
  const blob=await fetch(src).then(r=>{if(!r.ok)throw new Error("โหลดรูปไม่สำเร็จ");return r.blob()});
  if(blob.type==="image/png")return blob;
  const bmp=await createImageBitmap(blob);
  const c=document.createElement("canvas");c.width=bmp.width;c.height=bmp.height;
  c.getContext("2d").drawImage(bmp,0,0);
  return await new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("แปลงรูปไม่สำเร็จ")),"image/png"));
}
function ensurePromptReferencePreview(){
  const wrap=$("promptWrap");if(!wrap)return;
  let box=$("promptReferenceMedia");
  if(!box){
    box=document.createElement("div");box.id="promptReferenceMedia";
    box.style.cssText="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:10px 0 14px;padding:10px 12px;border:1px solid #dbe7f0;border-radius:12px;background:#f8fbfe";
    const pre=$("promptText");pre?.parentNode?.insertBefore(box,pre);
  }
  const img=currentPlanTeacherImage();
  if(planTeacherImageSource!=="none"&&img){
    box.hidden=false;
    box.innerHTML='<img src="'+img+'" alt="รูปครูอ้างอิง" style="width:72px;height:72px;object-fit:cover;border-radius:12px;border:1px solid #dbe7f0"><div><b>รูปครูอ้างอิงสำหรับ Prompt นี้</b><br><small>เมื่อนำ Prompt ไปใช้ ต้องแนบรูปนี้ไปพร้อมกัน เพื่อให้ AI ใช้ใบหน้าครูจริง</small></div>';
  }else{box.hidden=true;box.innerHTML=""}
  if($("copyPromptBtn"))$("copyPromptBtn").textContent=(planTeacherImageSource!=="none"&&img)?"📋 คัดลอก Prompt + รูปครู":"📋 คัดลอก";
}
function profileTeacherRef(){const src=profile?.teacher_photo_url||profile?.avatar_url||"";return src&&String(src).startsWith("avatar:")?"":src}
function profileLogoRef(){return profile?.school_logo_url||""}
async function sourceToBytes(src){
  if(!src)return null;
  const r=await fetch(src);if(!r.ok)throw new Error("โหลดไฟล์แนบไม่สำเร็จ");
  const blob=await r.blob();return {bytes:new Uint8Array(await blob.arrayBuffer()),type:blob.type||"application/octet-stream"};
}
function extFromMime(type){if(type.includes("png"))return"png";if(type.includes("webp"))return"webp";return"jpg"}
function saveSourceFile(src,name){
  if(!src)return toast("ยังไม่มีไฟล์นี้ในโปรไฟล์");
  fetch(src).then(r=>r.blob()).then(blob=>saveBlob(blob,name+"."+extFromMime(blob.type||"image/jpeg"))).catch(()=>toast("ดาวน์โหลดไฟล์ไม่สำเร็จ"));
}
function renderAiAttachmentKit(){
  const teacher=profileTeacherRef(),logo=profileLogoRef();
  const tp=$("aiTeacherPreview"),lp=$("aiLogoPreview"),qp=$("aiQrPreview");
  if(tp)tp.innerHTML=teacher?'<img src="'+teacher+'" alt="รูปครู">':"ไม่มีรูปครู";
  if(lp)lp.innerHTML=logo?'<img src="'+logo+'" alt="โลโก้โรงเรียน">':"ไม่มีโลโก้";
  if(qp)qp.innerHTML=planQrData?'<img src="'+planQrData+'" alt="QR Code">':"QR";
  if($("aiTeacherStatus"))$("aiTeacherStatus").textContent=teacher?"พร้อมแนบ":"ยังไม่มีรูปครูในโปรไฟล์";
  if($("aiLogoStatus"))$("aiLogoStatus").textContent=logo?"พร้อมแนบ":"ยังไม่มีโลโก้ในโปรไฟล์";
  if($("aiQrStatus"))$("aiQrStatus").textContent=planQrData?"พร้อมแนบ":"ไม่บังคับ";
  if($("downloadTeacherRefBtn"))$("downloadTeacherRefBtn").disabled=!teacher;
  if($("downloadLogoRefBtn"))$("downloadLogoRefBtn").disabled=!logo;
}
async function downloadAiPack(){
  const entries=[];
  const promptText=$("promptText")?.textContent||"";
  entries.push(["00-Prompt-Klang-Plan.txt",promptText]);
  const teacher=profileTeacherRef(),logo=profileLogoRef();
  try{if(teacher){const x=await sourceToBytes(teacher);entries.push(["01-Teacher-Reference."+extFromMime(x.type),x.bytes])}}catch(e){console.warn(e)}
  try{if(logo){const x=await sourceToBytes(logo);entries.push(["02-School-Logo."+extFromMime(x.type),x.bytes])}}catch(e){console.warn(e)}
  try{if(planQrData){const x=await sourceToBytes(planQrData);entries.push(["03-QR-Code."+extFromMime(x.type),x.bytes])}}catch(e){console.warn(e)}
  const readme="วิธีใช้\n1) เปิด ChatGPT หรือ Gemini\n2) แนบไฟล์ 01 รูปครู / 02 โลโก้ / 03 QR (ถ้ามี)\n3) คัดลอกข้อความจาก 00-Prompt-Klang-Plan.txt\n4) วาง Prompt แล้วสั่งสร้างภาพ A4 หน้าเดียว\n\nสำคัญ: ใช้รูปครูและโลโก้จากไฟล์แนบจริง ห้ามสร้างใหม่หรือเปลี่ยนใบหน้า";
  entries.push(["README.txt",readme]);
  saveBlob(zipStored(entries,"application/zip"),"Klang-Plan-AI-Attachments.zip");toast("ดาวน์โหลดชุดแนบแล้ว ✓");
}
async function copy(){
  const t=$("promptText").textContent;if(!t)return toast("ยังไม่มี Prompt");
  const img=currentPlanTeacherImage();
  try{
    if(img&&planTeacherImageSource!=="none"&&window.ClipboardItem&&navigator.clipboard?.write){
      const png=await imageSourceToPngBlob(img);
      const item=new ClipboardItem({"text/plain":new Blob([t],{type:"text/plain"}),"image/png":png});
      await navigator.clipboard.write([item]);
      toast("คัดลอก Prompt + รูปครูแล้ว ✓");return;
    }
    await navigator.clipboard.writeText(t);
    toast(img&&planTeacherImageSource!=="none"?"คัดลอก Prompt แล้ว — กรุณาแนบรูปครูที่แสดงไว้ด้วย":"คัดลอกแล้ว ✓");
  }catch(e){
    try{await navigator.clipboard.writeText(t);toast(img?"คัดลอก Prompt แล้ว — กรุณาแนบรูปครูที่แสดงไว้ด้วย":"คัดลอกแล้ว ✓")}catch{toast("กดค้างที่ Prompt เพื่อคัดลอก")}
  }
}
async function saveWork(t){
  const payload={user_id:user.id,title:v("topic")||selected?.indicator||"แผนการจัดการเรียนรู้",stage,grade:$("grade").value||null,subject:$("subject").value||null,domain:selected?.domain||null,standard:selected?.standard||null,indicator:selected?.indicator||null,indicator_text:selected?.indicator_text||null,unit_name:v("unitName")||null,topic:v("topic")||null,duration:v("duration")||null,method:v("method")||null,semester:$("semester")?.value||null,academic_year:v("academicYear")||null,teaching_date:$("includeTeachingDate")?.checked&&v("teachingDate")?v("teachingDate"):null,affiliation_type:$("affiliationType")?.value||"obec",organization:v("organization")||null,teacher_name:v("teacherName")||null,school_name:v("schoolName")||null,style,palette,prompt_text:t,status:"ready"};if(activeCourseLessonContext){const c=courseDrafts()[activeCourseLessonContext.courseIndex],u=c?.learning_units?.units?.[activeCourseLessonContext.unitIndex];if(c?._cloud_id)payload.course_id=c._cloud_id;if(u?._cloud_id)payload.unit_id=u._cloud_id}
  const {data,error}=await sb.from("lesson_plans").insert(payload).select("*").single();
  if(error){console.warn("cloud save",error);return null}
  cloudPlans.unshift(data);if(activeCourseLessonContext){const rows=courseDrafts(),c=rows[activeCourseLessonContext.courseIndex];if(c){c.lesson_resources=c.lesson_resources||{items:[]};c.lesson_resources.items.push({type:"lesson_plan",unit_id:activeCourseLessonContext.unitClientId||null,lesson_plan_id:data.id,title:data.title,created_at:new Date().toISOString()});c.lesson_resources.saved_at=new Date().toISOString();rows[activeCourseLessonContext.courseIndex]=c;writeCourseDrafts(rows);renderCourses()}}renderWork();return data
}
async function generate(){if(!$("grade").value)return toast("กรุณาเลือกระดับชั้น");if(!$("subject").value)return toast("กรุณาเลือกกลุ่มสาระ");if(!selected)return toast("กรุณาเลือกตัวชี้วัด");const t=prompt();$("promptText").textContent=t;$("promptWrap").hidden=false;renderAiAttachmentKit();ensurePromptReferencePreview();await saveWork(t);renderContinue();setTimeout(()=>$("promptWrap").scrollIntoView({behavior:"smooth"}),50);toast("สร้าง Prompt แล้ว ✓")}
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
function switchTab(name){$$(".page").forEach(x=>x.classList.toggle("active",x.id===`tab-${name}`));$$(".top-tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===name));$$("[data-bottom-tab]").forEach(x=>x.classList.toggle("active",x.dataset.bottomTab===name));if(name==="work")loadCloudPlans();if(name==="library"){if(!cloudPlans.length)loadCloudPlans().then(()=>renderGlobalResourceLibrary());else renderGlobalResourceLibrary()}window.scrollTo({top:0,behavior:"smooth"})}
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
async function duplicateActivePlan(){
  const p=activeWorkspacePlan;if(!p||!sb||!user)return;
  const payload={...p};delete payload.id;delete payload.created_at;delete payload.updated_at;delete payload.reflection_text;
  payload.user_id=user.id;payload.title="สำเนา - "+(p.title||"แผนการจัดการเรียนรู้");payload.status="ready";
  const {data,error}=await sb.from("lesson_plans").insert(payload).select("*").single();
  if(error){toast("ทำสำเนาไม่สำเร็จ");console.warn(error);return}
  cloudPlans.unshift(data);renderWork();closeWorkspacePlan();toast("สร้างสำเนาแผนแล้ว ✓")
}
function nextPlanFromActive(){
  const p=activeWorkspacePlan;if(!p)return;
  switchTab("create");
  stage=p.stage||(String(p.grade||"").startsWith("ม.")?"มัธยมศึกษา":String(p.grade||"").startsWith("ป.")?"ประถมศึกษา":"ปฐมวัย");
  $$(".stage-btn").forEach(x=>x.classList.toggle("active",x.dataset.stage===stage));buildGrades();
  if($("grade")){$("grade").value=p.grade||"";buildSubjects()}
  if($("subject")){$("subject").value=p.subject||"";buildIndicators()}
  const match=DATA.findIndex(x=>x.indicator===p.indicator&&x.subject===p.subject&&recordMatchesGrade(x,p.grade));
  if(match>=0&&$("indicator")){const opt=[...$("indicator").options].find(o=>o.value===String(match));if(opt){$("indicator").value=String(match);chooseIndicator()}}
  if($("unitName"))$("unitName").value=p.unit_name||"";
  if($("topic"))$("topic").value="";
  if($("duration"))$("duration").value=p.duration||"1 ชั่วโมง";
  if($("method"))$("method").value=p.method||$("method").value;
  if($("semester"))$("semester").value=p.semester||"";
  if($("academicYear"))$("academicYear").value=p.academic_year||"";
  if($("schoolName"))$("schoolName").value=p.school_name||profile?.school_name||"";
  if($("teacherName"))$("teacherName").value=p.teacher_name||profile?.full_name||"";
  activeCourseLessonContext=null;updateSummary();closeWorkspacePlan();setTimeout(()=>$("topic")?.focus(),80);toast("เตรียมข้อมูลแผนถัดไปแล้ว ✓")
}
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
function fileToDataUrl(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result||""));r.onerror=rej;r.readAsDataURL(file)})}
function syncProfilePhotoControlValues(){
  if($("profilePhotoZoom"))$("profilePhotoZoom").value=String(Math.round(profilePhotoZoom*100));
  if($("profilePhotoX"))$("profilePhotoX").value=String(Math.round(profilePhotoX));
  if($("profilePhotoY"))$("profilePhotoY").value=String(Math.round(profilePhotoY))
}
function profilePhotoTransformStyle(){
  return `transform:translate(${profilePhotoX/2}%,${profilePhotoY/2}%) scale(${profilePhotoZoom});transform-origin:center center;`
}
function renderProfilePhotoEditor(){
  const box=$("profilePhotoPreview");if(!box)return;
  const src=profilePhotoSource||profile?.avatar_url||"";
  if(src?.startsWith("data:image/")){
    box.innerHTML=`<img id="profilePhotoEditorImage" src="${src}" alt="รูปโปรไฟล์" style="${profilePhotoTransformStyle()}">`;
  }else{
    box.innerHTML='<span>'+avatar(profile?.avatar_url)+'</span>'
  }
  syncProfilePhotoControlValues()
}
function resetProfilePhotoEditor(){
  profilePhotoZoom=1;profilePhotoX=0;profilePhotoY=0;renderProfilePhotoEditor()
}
function cropProfilePhotoDataUrl(src,zoom=1,x=0,y=0){
  return new Promise((res,rej)=>{
    if(!src?.startsWith("data:image/"))return res(src||"");
    const im=new Image();
    im.onload=()=>{
      const size=512,c=document.createElement("canvas");c.width=c.height=size;
      const ctx=c.getContext("2d"),base=Math.max(size/im.width,size/im.height),scale=base*zoom;
      const w=im.width*scale,h=im.height*scale;
      const dx=(size-w)/2+(x/100)*(size*.45),dy=(size-h)/2+(y/100)*(size*.45);
      ctx.fillStyle="#fff";ctx.fillRect(0,0,size,size);ctx.drawImage(im,dx,dy,w,h);
      res(c.toDataURL("image/jpeg",.86))
    };
    im.onerror=rej;im.src=src
  })
}
function bindProfilePhotoDrag(){
  const box=$("profilePhotoPreview");if(!box)return;
  const start=e=>{if(!(profilePhotoSource||profile?.avatar_url)?.startsWith?.("data:image/"))return;profilePhotoDragging=true;const p=e.touches?.[0]||e;profilePhotoDragStart={x:p.clientX,y:p.clientY,ox:profilePhotoX,oy:profilePhotoY};e.preventDefault()};
  const move=e=>{if(!profilePhotoDragging||!profilePhotoDragStart)return;const p=e.touches?.[0]||e;const r=box.getBoundingClientRect(),dx=(p.clientX-profilePhotoDragStart.x)/(r.width||1)*200,dy=(p.clientY-profilePhotoDragStart.y)/(r.height||1)*200;profilePhotoX=Math.max(-100,Math.min(100,profilePhotoDragStart.ox+dx));profilePhotoY=Math.max(-100,Math.min(100,profilePhotoDragStart.oy+dy));renderProfilePhotoEditor();e.preventDefault()};
  const end=()=>{profilePhotoDragging=false;profilePhotoDragStart=null};
  box.onmousedown=start;box.onmousemove=move;window.addEventListener("mouseup",end);
  box.ontouchstart=start;box.ontouchmove=move;box.ontouchend=end
}


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
function courseQuality(c){
  const checks=[
    {key:"identity",label:"ข้อมูลรายวิชา",ok:!!(c.name&&c.grade&&c.subject&&c.semester&&c.year),hint:"ชื่อรายวิชา ระดับชั้น กลุ่มสาระ ภาคเรียน และปีการศึกษา"},
    {key:"curriculum",label:"วิเคราะห์หลักสูตร",ok:!!c.curriculum_analysis?.saved_at,hint:"เลือกมาตรฐาน/ตัวชี้วัดที่ใช้จริง"},
    {key:"description",label:"คำอธิบายรายวิชา",ok:!!c.course_description?.saved_at,hint:"มีคำอธิบายรายวิชาที่สร้างจากหลักสูตร"},
    {key:"structure",label:"โครงสร้างรายวิชา",ok:!!c.course_structure?.saved_at,hint:"มีหน่วยและชั่วโมงเรียน"},
    {key:"schedule",label:"กำหนดการสอน",ok:!!c.teaching_schedule?.saved_at,hint:"มีแผนกระจายเวลาเรียนทั้งภาคเรียน"},
    {key:"units",label:"หน่วยการเรียนรู้",ok:!!c.learning_units?.saved_at,hint:"มีหน่วยพร้อมตัวชี้วัด/ชิ้นงาน"},
    {key:"lessons",label:"แผนและสื่อ",ok:!!c.lesson_resources?.saved_at,hint:"มีแผนหรือสื่อที่เชื่อมกับหน่วย"},
    {key:"assessment",label:"การประเมิน",ok:!!c.assessments?.saved_at,hint:"มีแบบประเมิน/แบบทดสอบ/Blueprint"}
  ];
  const passed=checks.filter(x=>x.ok).length,percent=Math.round(passed/checks.length*100);
  return {checks,passed,total:checks.length,percent,ready:passed===checks.length,missing:checks.filter(x=>!x.ok)}
}
function renderCourseDashboard(rows){
  const total=rows.length,ready=rows.filter(c=>courseQuality(c).ready).length,avg=total?Math.round(rows.reduce((sum,c)=>sum+courseProgress(c),0)/total):0;
  if($("courseTotalCount"))$("courseTotalCount").textContent=total;
  if($("courseReadyCount"))$("courseReadyCount").textContent=ready;
  if($("courseAvgProgress"))$("courseAvgProgress").textContent=avg+"%";
  if($("courseNeedActionCount"))$("courseNeedActionCount").textContent=Math.max(0,total-ready)
}
function openCourseReadiness(i){
  const c=courseDrafts()[i];if(!c)return;const q=courseQuality(c);
  $("courseReadinessMeta").textContent=[c.name,c.grade,c.subject].filter(Boolean).join(" · ");
  $("courseReadinessBadge").textContent=q.ready?"พร้อมส่งออก":"ยังขาด "+q.missing.length+" ส่วน";
  $("courseReadinessScore").innerHTML='<div class="readiness-ring" style="--p:'+q.percent+'%"><b>'+q.percent+'%</b></div><div><h3>'+(q.ready?"รายวิชาพร้อมสำหรับส่งออก":"ตรวจพบส่วนที่ควรทำให้ครบ")+'</h3><p>ผ่าน '+q.passed+' จาก '+q.total+' องค์ประกอบหลัก</p></div>';
  $("courseReadinessList").innerHTML=q.checks.map(x=>'<div class="readiness-item '+(x.ok?"ok":"warn")+'"><span>'+(x.ok?"✅":"⚠️")+'</span><div><b>'+esc(x.label)+'</b><small>'+esc(x.hint)+'</small></div></div>').join("");
  $("courseReadinessAdvice").textContent=q.ready?"ข้อมูลหลักครบแล้ว สามารถสร้าง Word/PDF ได้โดยมั่นใจมากขึ้น":"แนะนำให้ทำส่วนที่มีเครื่องหมาย ⚠️ ให้ครบก่อนส่งเอกสารฉบับสมบูรณ์";
  $("courseReadinessModal").hidden=false
}
function closeCourseReadiness(){$("courseReadinessModal").hidden=true}

function renderCourses(){const box=$("courseList");if(!box)return;const rows=courseDrafts();renderCourseDashboard(rows);box.innerHTML=rows.length?rows.map((c,i)=>{const badge=c.documents?.saved_at?"ครบทั้งรายวิชา":c.assessments?.saved_at?"การประเมินพร้อม":c.lesson_resources?.saved_at?"แผน/สื่อพร้อม":c.learning_units?.saved_at?"หน่วยพร้อม":c.teaching_schedule?.saved_at?"กำหนดการพร้อม":c.course_structure?.saved_at?"โครงสร้างพร้อม":c.course_description?.saved_at?"มีคำอธิบาย":c.curriculum_analysis?.saved_at?"วิเคราะห์แล้ว":"Draft";const status=c.documents?.saved_at?`ขั้นที่ 8 สำเร็จ · Word/PDF พร้อมดาวน์โหลด`:c.assessments?.saved_at?`ขั้นที่ 7 สำเร็จ · Pre/Post/Final + Blueprint พร้อม · ไปสร้างเอกสาร`:c.lesson_resources?.saved_at?`ขั้นที่ 6 สำเร็จ · มีแผน/สื่อที่เชื่อมกับหน่วยแล้ว`:c.learning_units?.saved_at?`ขั้นที่ 5 สำเร็จ · ${c.learning_units.units?.length||0} หน่วยพร้อมสร้างแผนและสื่อ`:c.teaching_schedule?.saved_at?`ขั้นที่ 4 สำเร็จ · ${c.teaching_schedule.rows?.length||0} ช่วงการสอน · พร้อมออกแบบหน่วยการเรียนรู้`:c.course_structure?.saved_at?`ขั้นที่ 3 สำเร็จ · ${c.course_structure.units?.length||0} หน่วย · พร้อมทำกำหนดการสอน`:c.course_description?.saved_at?`ขั้นที่ 2 สำเร็จ · พร้อมจัดโครงสร้างรายวิชา`:c.curriculum_analysis?.saved_at?`ขั้นที่ 1 สำเร็จ · เลือก ${c.curriculum_analysis.selected_ids?.length||0} ตัวชี้วัด · พร้อมสร้างคำอธิบายรายวิชา`:`เริ่มต้น 1/8 ขั้นตอน · วิเคราะห์หลักสูตรจากฐานข้อมูลจริงเป็นขั้นถัดไป`;return `<article class="course-item ${c.documents?.saved_at?"is-complete":""}"><div class="course-item-head"><div><h3>${esc(c.name||"รายวิชา")}</h3><p>${esc(c.grade||"")} · ${esc(c.subject||"ยังไม่ระบุกลุ่มสาระ")} · ภาคเรียน ${esc(c.semester||"")} / ${esc(c.year||"")} · ${esc(c.hours||"-")} ชั่วโมง</p></div><span class="reflection-badge">${badge}</span></div><div class="course-progress"><i style="width:${courseProgress(c)}%"></i></div><div class="course-health"><span class="${courseQuality(c).ready?"ok":"warn"}">${courseQuality(c).ready?"✅ พร้อมส่งออก":"⚠️ ขาด "+courseQuality(c).missing.length+" ส่วน"}</span><span>${courseProgress(c)}% ความคืบหน้า</span></div><p>${status}</p><div class="course-actions"><button type="button" data-course-readiness="${i}">🔎 ตรวจความพร้อม</button><button type="button" data-course-analysis="${i}">🧠 วิเคราะห์หลักสูตร</button>${c.curriculum_analysis?.saved_at?`<button type="button" data-course-description="${i}">📘 คำอธิบายรายวิชา</button>`:""}${c.course_description?.saved_at?`<button type="button" data-course-structure="${i}">🗂️ โครงสร้างรายวิชา</button>`:""}${c.course_structure?.saved_at?`<button type="button" data-course-schedule="${i}">📅 กำหนดการสอน</button>`:""}${c.teaching_schedule?.saved_at?`<button type="button" data-course-units="${i}">🧩 หน่วยการเรียนรู้</button>`:""}${c.learning_units?.saved_at?`<button type="button" data-course-lessons="${i}">📝 แผนและสื่อ</button><button type="button" data-course-assessments="${i}">✅ การประเมิน</button>`:""}${c.assessments?.saved_at?`<button type="button" data-course-documents="${i}">📄 Word / PDF</button>`:""}<button type="button" data-course-use="${i}">✨ ใช้ข้อมูลสร้างแผน</button><button type="button" data-course-delete="${i}">ลบ Draft</button></div></article>`}).join(""):'<div class="list-item">ยังไม่มีรายวิชา — กด “สร้างรายวิชา” เพื่อเริ่มต้น</div>';
$$('[data-course-readiness]').forEach(b=>b.onclick=()=>openCourseReadiness(Number(b.dataset.courseReadiness)));
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
function unitWorkStatus(c,u){
  const uid=u?.id||null,items=c.lesson_resources?.items||[],assess=c.assessments?.items||[];
  const has=t=>items.some(x=>x.unit_id===uid&&x.type===t);
  const plan=has("lesson_plan"),worksheet=has("worksheet"),knowledge=has("knowledge"),visual=has("visual_card");
  const assessment=assess.some(x=>x.unit_id===uid)||false;
  const flags=[plan,worksheet,knowledge,visual,assessment],done=flags.filter(Boolean).length;
  return {plan,worksheet,knowledge,visual,assessment,done,total:5,percent:Math.round(done/5*100)}
}
function closeCourseLessons(){$("courseLessonsModal").hidden=true;activeCourseIndex=null}
function openCourseLessons(i){const c=courseDrafts()[i];if(!c?.learning_units?.saved_at){toast("กรุณาบันทึกหน่วยการเรียนรู้ก่อน");return}activeCourseIndex=i;$("courseLessonsMeta").textContent=`${c.name} · ${c.grade} · ${c.learning_units.units.length} หน่วย`;$("courseLessonsList").innerHTML=c.learning_units.units.map((u,ui)=>{const st=unitWorkStatus(c,u);return `<article class="course-lesson-unit"><div><b>หน่วยที่ ${ui+1} · ${esc(u.name||"")}</b><small>${Number(u.hours)||0} ชั่วโมง · ${(u.indicator_ids||[]).length} ตัวชี้วัด</small><div class="unit-progress-wrap"><div class="unit-progress-bar"><i style="width:${st.percent}%"></i></div><div class="unit-progress-meta"><span>ความพร้อมหน่วย ${st.percent}%</span><span>${st.done}/${st.total} งานหลัก</span></div><div class="unit-resource-chips"><span class="${st.plan?"done":""}">📝 แผน</span><span class="${st.worksheet?"done":""}">📄 ใบงาน</span><span class="${st.knowledge?"done":""}">📚 ใบความรู้</span><span class="${st.visual?"done":""}">🖼️ บัตรภาพ</span><span class="${st.assessment?"done":""}">✅ ประเมิน</span></div></div></div><div class="course-lesson-actions"><button type="button" data-unit-plan="${ui}">📝 สร้างแผน</button><button type="button" data-unit-resource="worksheet:${ui}">📄 ใบงาน</button><button type="button" data-unit-resource="visual_card:${ui}">🖼️ บัตรภาพ</button><button type="button" data-unit-resource="knowledge:${ui}">📚 ใบความรู้</button></div></article>`}).join("");$('[data-unit-plan]').forEach(b=>b.onclick=()=>startUnitPlan(i,Number(b.dataset.unitPlan)));$('[data-unit-resource]').forEach(b=>b.onclick=()=>{const [type,ui]=b.dataset.unitResource.split(":");createUnitResourcePrompt(i,Number(ui),type)});$("courseLessonsStatus").innerHTML="";$("courseLessonsModal").hidden=false}
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
function zipStored(entries,mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"){const te=new TextEncoder(),locals=[],centrals=[];let offset=0;for(const [name,content] of entries){const nb=te.encode(name),data=typeof content==="string"?te.encode(content):content,crc=crc32(data);const local=catBytes([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(nb.length),u16(0),nb,data]);locals.push(local);const central=catBytes([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(data.length),u32(data.length),u16(nb.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),nb]);centrals.push(central);offset+=local.length}const centralSize=centrals.reduce((s,x)=>s+x.length,0),end=catBytes([u32(0x06054b50),u16(0),u16(0),u16(entries.length),u16(entries.length),u32(centralSize),u32(offset),u16(0)]);return new Blob([...locals,...centrals,end],{type:mime})}
function makeDocxBlob(title,text){const lines=String(text||"").split(/\r?\n/);const paras=lines.map(line=>{if(line==="[[PAGE_BREAK]]")return `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;const isHead=/^\d+\.\s/.test(line)||line==="คลังแผนการสอนหน้าเดียว"||line==="ชุดเอกสารรายวิชา";return `<w:p>${isHead?'<w:pPr><w:pStyle w:val="Heading1"/></w:pPr>':''}<w:r><w:rPr><w:rFonts w:ascii="TH Sarabun New" w:hAnsi="TH Sarabun New" w:eastAsia="TH Sarabun New"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr><w:t xml:space="preserve">${xmlText(line||" ")}</w:t></w:r></w:p>`}).join("");const doc=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paras}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`;const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style></w:styles>`;return zipStored([["[Content_Types].xml",`<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`],["_rels/.rels",`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`],["word/document.xml",doc],["word/styles.xml",styles],["word/_rels/document.xml.rels",`<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`]])}
function saveBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200)}
function textPagesToJpegs(text){const W=1240,H=1754,M=96,MAX=W-M*2,lh=42,te=document.createElement("canvas"),ctx=te.getContext("2d");te.width=W;te.height=H;ctx.font='28px Tahoma, Arial, sans-serif';const logical=[];for(const raw of String(text||"").split(/\r?\n/)){if(raw==="[[PAGE_BREAK]]"){logical.push("__KLANG_PAGE_BREAK__");continue}if(!raw){logical.push("");continue}let line="";for(const ch of raw){const t=line+ch;if(ctx.measureText(t).width>MAX&&line){logical.push(line);line=ch}else line=t}logical.push(line)}const per=Math.floor((H-M*2)/lh),pageLines=[[]];for(const line of logical){const cur=pageLines[pageLines.length-1];if(line==="__KLANG_PAGE_BREAK__"){if(cur.length)pageLines.push([]);continue}if(cur.length>=per)pageLines.push([]);pageLines[pageLines.length-1].push(line)}const pages=[];for(const pageChunk of pageLines){if(!pageChunk.length)continue;const c=document.createElement("canvas"),x=c.getContext("2d");c.width=W;c.height=H;x.fillStyle="#fff";x.fillRect(0,0,W,H);x.fillStyle="#111";x.textBaseline="top";let y=M;pageChunk.forEach((line,j)=>{x.font=(/^(คลังแผนการสอนหน้าเดียว|ชุดเอกสารรายวิชา|\d+\.\s)/.test(line)?'bold 30px':'28px')+' Tahoma, Arial, sans-serif';x.fillText(line,M,y,MAX);y+=lh});const b64=c.toDataURL("image/jpeg",.9).split(",")[1],bin=atob(b64),bytes=new Uint8Array(bin.length);for(let k=0;k<bin.length;k++)bytes[k]=bin.charCodeAt(k);pages.push({bytes,w:W,h:H})}return pages}
function makePdfBlob(text){const imgs=textPagesToJpegs(text),te=new TextEncoder(),parts=[],offsets=[0];let len=0;const add=x=>{const b=typeof x==="string"?te.encode(x):x;parts.push(b);len+=b.length};add("%PDF-1.4\n%KLANG\n");const pageObjs=[],imgObjs=[],contentObjs=[];let next=3;for(let i=0;i<imgs.length;i++){pageObjs.push(next++);imgObjs.push(next++);contentObjs.push(next++)}const total=next-1;const obj=(n,body)=>{offsets[n]=len;add(`${n} 0 obj\n`);add(body);add("\nendobj\n")};obj(1,"<< /Type /Catalog /Pages 2 0 R >>");obj(2,`<< /Type /Pages /Count ${imgs.length} /Kids [${pageObjs.map(n=>n+" 0 R").join(" ")}] >>`);imgs.forEach((im,i)=>{obj(pageObjs[i],`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im${i+1} ${imgObjs[i]} 0 R >> >> /Contents ${contentObjs[i]} 0 R >>`);offsets[imgObjs[i]]=len;add(`${imgObjs[i]} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bytes.length} >>\nstream\n`);add(im.bytes);add("\nendstream\nendobj\n");const stream=`q\n595.28 0 0 841.89 0 0 cm\n/Im${i+1} Do\nQ\n`;obj(contentObjs[i],`<< /Length ${te.encode(stream).length} >>\nstream\n${stream}endstream`)});const xref=len;add(`xref\n0 ${total+1}\n0000000000 65535 f \n`);for(let i=1;i<=total;i++)add(String(offsets[i]||0).padStart(10,"0")+" 00000 n \n");add(`trailer\n<< /Size ${total+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);return new Blob(parts,{type:"application/pdf"})}

function dataUrlToBytes(dataUrl){
  if(!dataUrl||!dataUrl.startsWith("data:image/"))return null;
  const parts=dataUrl.split(","),bin=atob(parts[1]||""),bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  return {bytes,mime:(parts[0].match(/^data:([^;]+)/)||[])[1]||"image/jpeg"};
}
function materialExportTheme(key){
  return {
    clean:{accent:"355F80",soft:"EEF4F8"},
    primary:{accent:"D56A7A",soft:"FFF0F4"},
    formal:{accent:"214E83",soft:"EAF2FB"},
    playful:{accent:"E67E22",soft:"FFF3E6"},
    eco:{accent:"4D7B5B",soft:"EDF6EF"}
  }[key]||{accent:"355F80",soft:"EEF4F8"}
}
function makeDocxBlobBranded(title,text,logoUrl,teacherUrl,styleKey="clean"){
  const logo=dataUrlToBytes(logoUrl),teacher=dataUrlToBytes(teacherUrl);
  if(!logo&&!teacher)return makeDocxBlob(title,text);
  const imgs=[];if(logo)imgs.push({key:"logo",...logo});if(teacher)imgs.push({key:"teacher",...teacher});
  const lines=String(text||"").split(/\r?\n/);
  const drawings=imgs.map((im,i)=>{
    const cx=im.key==="logo"?1050000:900000,cy=im.key==="logo"?1050000:900000;
    return '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><wp:extent cx="'+cx+'" cy="'+cy+'"/><wp:docPr id="'+(i+1)+'" name="'+im.key+'"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="'+(i+1)+'" name="'+im.key+'.jpg"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rIdImg'+(i+2)+'"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+cx+'" cy="'+cy+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>'
  }).join("");
  const theme=materialExportTheme(styleKey),firstNonEmpty=lines.find(x=>String(x||"").trim())||title;const paras=lines.map(line=>{if(line==="[[PAGE_BREAK]]")return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';const isTitle=line===firstNonEmpty,isHead=/^(สาระสำคัญ|สิ่งที่ควรรู้|คำชี้แจง|ภารกิจที่|สรุปท้ายใบงาน|จำให้แม่น|คำแนะนำการตรวจ|กิจกรรมเสริม|\d+\.\s)/.test(line)||line==="คลังแผนการสอนหน้าเดียว"||line==="ชุดเอกสารรายวิชา";const ppr=isTitle?'<w:pPr><w:jc w:val="center"/><w:shd w:fill="'+theme.soft+'"/><w:spacing w:after="180"/></w:pPr>':isHead?'<w:pPr><w:shd w:fill="'+theme.soft+'"/><w:spacing w:before="100" w:after="80"/></w:pPr>':'';const size=isTitle?"40":isHead?"34":"32";return '<w:p>'+ppr+'<w:r><w:rPr>'+(isTitle||isHead?'<w:b/><w:color w:val="'+theme.accent+'"/>':'')+'<w:rFonts w:ascii="TH Sarabun New" w:hAnsi="TH Sarabun New" w:eastAsia="TH Sarabun New"/><w:sz w:val="'+size+'"/><w:szCs w:val="'+size+'"/></w:rPr><w:t xml:space="preserve">'+xmlText(line||" ")+'</w:t></w:r></w:p>'}).join("");
  const doc='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:pPr><w:jc w:val="both"/></w:pPr>'+drawings+'</w:p>'+paras+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>';
  const styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style></w:styles>';
  const rels=imgs.map((im,i)=>'<Relationship Id="rIdImg'+(i+2)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/'+im.key+'.jpg"/>').join("");
  const entries=[
    ["[Content_Types].xml",'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'],
    ["_rels/.rels",'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
    ["word/document.xml",doc],["word/styles.xml",styles],
    ["word/_rels/document.xml.rels",'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'+rels+'</Relationships>']
  ];
  imgs.forEach(im=>entries.push(["word/media/"+im.key+".jpg",im.bytes]));
  return zipStored(entries)
}
function loadCanvasImage(url){
  return new Promise(resolve=>{if(!url||!url.startsWith("data:image/"))return resolve(null);const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=url})
}
async function makePdfBlobBranded(text,logoUrl,teacherUrl,styleKey="clean"){
  const [logo,teacher]=await Promise.all([loadCanvasImage(logoUrl),loadCanvasImage(teacherUrl)]);
  if(!logo&&!teacher)return makePdfBlob(text);
  const W=1240,H=1754,M=96,lh=42,MAX=W-M*2,probe=document.createElement("canvas"),ctx=probe.getContext("2d");
  probe.width=W;probe.height=H;ctx.font='28px Tahoma, Arial, sans-serif';
  const logical=[];for(const raw of String(text||"").split(/\r?\n/)){if(raw==="[[PAGE_BREAK]]"){logical.push("__KLANG_PAGE_BREAK__");continue}if(!raw){logical.push("");continue}let line="";for(const ch of raw){const t=line+ch;if(ctx.measureText(t).width>MAX&&line){logical.push(line);line=ch}else line=t}logical.push(line)}
  const header=logo||teacher?155:0,per=Math.floor((H-M*2-header)/lh),pageLines=[[]];
  for(const line of logical){const cur=pageLines[pageLines.length-1];if(line==="__KLANG_PAGE_BREAK__"){if(cur.length)pageLines.push([]);continue}if(cur.length>=per)pageLines.push([]);pageLines[pageLines.length-1].push(line)}
  const theme=materialExportTheme(styleKey),accent="#"+theme.accent,soft="#"+theme.soft;const imgs=[];for(let pi=0;pi<pageLines.length;pi++){const pageChunk=pageLines[pi];if(!pageChunk.length)continue;const c=document.createElement("canvas"),x=c.getContext("2d");c.width=W;c.height=H;x.fillStyle="#fff";x.fillRect(0,0,W,H);x.fillStyle=accent;x.fillRect(0,0,W,18);let y=M;if(pi===0&&(logo||teacher)){if(logo)x.drawImage(logo,M,y,105,105);if(teacher)x.drawImage(teacher,W-M-105,y,105,105);y+=135}x.textBaseline="top";pageChunk.forEach((line,li)=>{const isTitle=li===0&&pi===0,isHead=/^(สาระสำคัญ|สิ่งที่ควรรู้|คำชี้แจง|ภารกิจที่|สรุปท้ายใบงาน|จำให้แม่น|คำแนะนำการตรวจ|กิจกรรมเสริม|\d+\.\s)/.test(line);if(isTitle||isHead){x.fillStyle=soft;x.fillRect(M-10,y-5,MAX+20,lh);x.fillStyle=accent;x.font=(isTitle?"bold 34px":"bold 30px")+" Tahoma, Arial, sans-serif"}else{x.fillStyle="#111";x.font="28px Tahoma, Arial, sans-serif"}x.fillText(line,M,y,MAX);y+=lh});const b64=c.toDataURL("image/jpeg",.9).split(",")[1],bin=atob(b64),bytes=new Uint8Array(bin.length);for(let k=0;k<bin.length;k++)bytes[k]=bin.charCodeAt(k);imgs.push({bytes,w:W,h:H})}
  const te=new TextEncoder(),parts=[],offsets=[0];let len=0;const add=x=>{const b=typeof x==="string"?te.encode(x):x;parts.push(b);len+=b.length};add("%PDF-1.4\n%KLANG\n");const pageObjs=[],imgObjs=[],contentObjs=[];let next=3;for(let i=0;i<imgs.length;i++){pageObjs.push(next++);imgObjs.push(next++);contentObjs.push(next++)}const total=next-1;const obj=(n,body)=>{offsets[n]=len;add(n+" 0 obj\n");add(body);add("\nendobj\n")};obj(1,"<< /Type /Catalog /Pages 2 0 R >>");obj(2,"<< /Type /Pages /Count "+imgs.length+" /Kids ["+pageObjs.map(n=>n+" 0 R").join(" ")+"] >>");imgs.forEach((im,i)=>{obj(pageObjs[i],"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im"+(i+1)+" "+imgObjs[i]+" 0 R >> >> /Contents "+contentObjs[i]+" 0 R >>");offsets[imgObjs[i]]=len;add(imgObjs[i]+" 0 obj\n<< /Type /XObject /Subtype /Image /Width "+im.w+" /Height "+im.h+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+im.bytes.length+" >>\nstream\n");add(im.bytes);add("\nendstream\nendobj\n");const stream="q\n595.28 0 0 841.89 0 0 cm\n/Im"+(i+1)+" Do\nQ\n";obj(contentObjs[i],"<< /Length "+te.encode(stream).length+" >>\nstream\n"+stream+"endstream")});const xref=len;add("xref\n0 "+(total+1)+"\n0000000000 65535 f \n");for(let i=1;i<=total;i++)add(String(offsets[i]||0).padStart(10,"0")+" 00000 n \n");add("trailer\n<< /Size "+(total+1)+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF");return new Blob(parts,{type:"application/pdf"})
}
function markDocumentsReady(type){if(activeCourseIndex==null)return;const rows=courseDrafts(),c=rows[activeCourseIndex];if(!c)return;c.documents={...(c.documents||{}),saved_at:new Date().toISOString(),last_export:type,version:Number(c.documents?.version||0)+1};rows[activeCourseIndex]=c;writeCourseDrafts(rows);renderCourses();$("courseDocumentsStatus").innerHTML=`<div class="indicator-preview">สร้างไฟล์ ${type.toUpperCase()} แล้ว ✓ ขั้นที่ 8 สำเร็จ</div>`}
function openCourseDocuments(i){const c=courseDrafts()[i];if(!c)return;const quality=courseQuality(c);if(!quality.ready){openCourseReadiness(i);toast("ตรวจพบข้อมูลที่ควรทำให้ครบก่อนส่งออก");return}activeCourseIndex=i;$("courseDocumentsMeta").textContent=`${c.name} · ${c.grade} · ภาคเรียน ${c.semester}/${c.year}`;const text=courseDocumentText(c);$("courseDocumentPreview").textContent=text;$("courseDocumentsStatus").innerHTML=c.documents?.saved_at?'<div class="indicator-preview">เอกสารเคยถูกสร้างแล้ว ✓ สามารถดาวน์โหลดเวอร์ชันใหม่ได้</div>':"";$("courseDocumentsModal").hidden=false}
function closeCourseDocuments(){$("courseDocumentsModal").hidden=true;activeCourseIndex=null}
function downloadCourseDocx(){const c=courseDrafts()[activeCourseIndex];if(!c)return;saveBlob(makeDocxBlob(c.name,courseDocumentText(c)),safeFilename(`${c.name}-${c.grade}-${c.year}`)+".docx");markDocumentsReady("docx")}
function downloadCoursePdf(){const c=courseDrafts()[activeCourseIndex];if(!c)return;saveBlob(makePdfBlob(courseDocumentText(c)),safeFilename(`${c.name}-${c.grade}-${c.year}`)+".pdf");markDocumentsReady("pdf")}
function downloadWord(plan){const text=[plan.title||"แผนการจัดการเรียนรู้","",plan.prompt_text||"",plan.reflection_text?"\nบันทึกหลังสอน\n"+plan.reflection_text:""].join("\n");saveBlob(makeDocxBlobBranded(plan.title||"แผนการจัดการเรียนรู้",text,profile?.school_logo_url,profile?.teacher_photo_url||profile?.avatar_url),safeFilename(plan.title||"klang-plan")+".docx")}
async function printPlanPdf(plan){const text=[plan.title||"แผนการจัดการเรียนรู้","",plan.prompt_text||"",plan.reflection_text?"\nบันทึกหลังสอน\n"+plan.reflection_text:""].join("\n");saveBlob(await makePdfBlobBranded(text,profile?.school_logo_url,profile?.teacher_photo_url||profile?.avatar_url),safeFilename(plan.title||"klang-plan")+".pdf")}





const RESOURCE_LIBRARY_KEY="klang-plan-resource-library-v1";
function resourceLibrary(){
  try{return JSON.parse(localStorage.getItem(RESOURCE_LIBRARY_KEY)||"[]").filter(x=>!user?.id||!x.user_id||x.user_id===user.id)}catch{return[]}
}
function writeResourceLibrary(rows){localStorage.setItem(RESOURCE_LIBRARY_KEY,JSON.stringify(rows))}
async function loadResourceLibraryFromCloud(){
  if(!sb||!user)return resourceLibrary();
  try{
    const {data,error}=await sb.from("learning_resources").select("id,client_id,course_id,unit_id,lesson_plan_id,resource_type,title,content,created_at,updated_at").eq("user_id",user.id).order("updated_at",{ascending:false}).limit(500);
    if(error)throw error;resourceCloudReady=true;
    const local=resourceLibrary(),by=new Map(local.map(x=>[x.id,x]));
    for(const r of data||[]){
      const c=r.content&&typeof r.content==="object"?r.content:{},id=c.library_id||r.client_id||r.id;
      const item={id,user_id:user.id,plan_id:r.lesson_plan_id||null,course_id:r.course_id||null,unit_id:r.unit_id||null,type:r.resource_type,title:r.title,config:c.config||{},html:c.html||"",text:c.text||"",created_at:r.created_at,updated_at:r.updated_at,cloud_id:r.id};
      const prev=by.get(id);if(!prev||String(item.updated_at||"")>=String(prev.updated_at||""))by.set(id,{...prev,...item})
    }
    const merged=[...by.values()].sort((a,b)=>String(b.updated_at||b.created_at||"").localeCompare(String(a.updated_at||a.created_at||"")));
    writeResourceLibrary(merged);return merged
  }catch(error){resourceCloudReady=false;console.warn("resource cloud load unavailable",error);return resourceLibrary()}
}
async function updateCloudResource(item){
  if(!sb||!user||!item?.cloud_id)return false;
  try{
    const {error}=await sb.from("learning_resources").update({title:item.title,content:{library_id:item.id,config:item.config||{},html:item.html||"",text:item.text||""},updated_at:item.updated_at}).eq("id",item.cloud_id).eq("user_id",user.id);
    if(error)throw error;return true
  }catch(error){console.warn("resource cloud update unavailable",error);return false}
}

function resourceTypeName(t){return ({worksheet:"ใบงาน",knowledge:"ใบความรู้",quiz:"แบบทดสอบ",rubric:"Rubric",game:"เกมการเรียนรู้"})[t]||t}
function resourceIcon(t){return ({worksheet:"📝",knowledge:"📚",quiz:"✅",rubric:"📊",game:"🎮"})[t]||"📄"}
function planLibraryRows(planId){return resourceLibrary().filter(x=>x.plan_id===planId).sort((a,b)=>String(b.updated_at||b.created_at||"").localeCompare(String(a.updated_at||a.created_at||"")))}
function resourcePlan(item){return cloudPlans.find(p=>p.id===item.plan_id)||null}
function populateGlobalResourceSubjects(){
  const el=$("globalResourceSubject");if(!el)return;
  const current=el.value,subjects=unique(resourceLibrary().map(x=>resourcePlan(x)?.subject).filter(Boolean));
  el.innerHTML='<option value="">ทุกวิชา</option>'+subjects.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join("");
  if(subjects.includes(current))el.value=current
}
function renderGlobalResourceLibrary(){
  const box=$("globalResourceList");if(!box)return;
  const all=resourceLibrary(),q=($("globalResourceSearch")?.value||"").trim().toLowerCase(),type=$("globalResourceType")?.value||"",subject=$("globalResourceSubject")?.value||"";
  populateGlobalResourceSubjects();
  const rows=all.filter(x=>{const p=resourcePlan(x),hay=[x.title,x.type,p?.title,p?.topic,p?.unit_name,p?.subject,p?.grade].map(v=>String(v||"").toLowerCase()).join(" ");return(!type||x.type===type)&&(!subject||p?.subject===subject)&&(!q||hay.includes(q))}).sort((a,b)=>String(b.updated_at||b.created_at||"").localeCompare(String(a.updated_at||a.created_at||"")));
  if($("globalResourceCount"))$("globalResourceCount").textContent=all.length;
  if($("globalWorksheetCount"))$("globalWorksheetCount").textContent=all.filter(x=>x.type==="worksheet"||x.type==="knowledge").length;
  if($("globalAssessmentCount"))$("globalAssessmentCount").textContent=all.filter(x=>x.type==="quiz"||x.type==="rubric").length;
  if($("globalGameCount"))$("globalGameCount").textContent=all.filter(x=>x.type==="game").length;
  box.innerHTML=rows.length?rows.map(x=>{const p=resourcePlan(x);return '<article class="global-resource-card"><div class="global-resource-head"><div class="global-resource-icon">'+resourceIcon(x.type)+'</div><div class="global-resource-title"><h3>'+esc(x.title||resourceTypeName(x.type))+'</h3><p>'+esc(resourceTypeName(x.type))+' · '+esc(p?.title||"แผนเดิม")+'</p></div></div><div class="global-resource-meta"><span>'+esc(p?.grade||"-")+'</span><span>'+esc(p?.subject||"-")+'</span><span>'+esc(p?.unit_name||"ไม่ระบุหน่วย")+'</span><span>'+(x.cloud_id?"☁️ Cloud":"📱 ในเครื่อง")+'</span></div><small>แก้ไขล่าสุด '+new Date(x.updated_at||x.created_at).toLocaleString("th-TH")+'</small><div class="global-resource-actions"><button type="button" data-global-open="'+x.id+'">เปิดแก้ไข</button><button type="button" class="danger" data-global-delete="'+x.id+'">ลบ</button></div></article>'}).join(""):'<div class="resource-empty">ไม่พบงานที่ตรงกับตัวกรอง<br><small>งานที่กด “บันทึกเข้าคลัง” จากแต่ละ Studio จะมาแสดงที่นี่</small></div>';
  $$("[data-global-open]").forEach(b=>b.onclick=()=>openGlobalSavedResource(b.dataset.globalOpen));
  $$("[data-global-delete]").forEach(b=>b.onclick=()=>deleteSavedResource(b.dataset.globalDelete,true))
}
async function openGlobalSavedResource(id){
  const item=resourceLibrary().find(x=>x.id===id);if(!item)return;
  let p=resourcePlan(item);
  if(!p){await loadCloudPlans();p=resourcePlan(item)}
  if(!p){toast("ไม่พบแผนต้นทางของงานนี้");return}
  activeWorkspacePlan=p;openSavedResource(id)
}

function syncSavedResourceToCourse(item){
  const p=activeWorkspacePlan;if(!p?.course_id)return;
  const rows=courseDrafts(),ci=rows.findIndex(c=>c._cloud_id===p.course_id||c.id===p.course_id);
  if(ci<0)return;const c=rows[ci];c.lesson_resources=c.lesson_resources||{items:[]};
  const exists=c.lesson_resources.items.findIndex(x=>x.resource_library_id===item.id);
  const mapped={id:item.id,resource_library_id:item.id,type:item.type,unit_id:(c.learning_units?.units||[]).find(u=>u._cloud_id===p.unit_id)?.id||p.unit_id||null,lesson_plan_id:p.id,title:item.title,created_at:item.created_at};
  if(exists>=0)c.lesson_resources.items[exists]=mapped;else c.lesson_resources.items.push(mapped);
  c.lesson_resources.saved_at=new Date().toISOString();rows[ci]=c;writeCourseDrafts(rows);renderCourses()
}
async function cloudSaveResource(item){
  const p=activeWorkspacePlan;if(!sb||!user||!p?.course_id)return null;
  if(item.cloud_id){await updateCloudResource(item);return item.cloud_id}
  try{
    const payload={user_id:user.id,course_id:p.course_id,unit_id:p.unit_id||null,lesson_plan_id:p.id,resource_type:item.type,title:item.title,content:{library_id:item.id,config:item.config||{},html:item.html||"",text:item.text||""},status:"ready"};
    if(item.id&&/^[0-9a-f-]{36}$/i.test(item.id))payload.client_id=item.id;
    const {data,error}=await sb.from("learning_resources").insert(payload).select("id").single();
    if(error)throw error;return data?.id||null
  }catch(error){console.warn("resource cloud save unavailable",error);return null}
}
async function savePlanResource(type,title,config,html,text){
  if(!activeWorkspacePlan)return toast("กรุณาเลือกแผนก่อน");
  const rows=resourceLibrary(),now=new Date().toISOString();
  let item=activeSavedResourceId?rows.find(x=>x.id===activeSavedResourceId):null;
  if(item){Object.assign(item,{type,title,config:config||{},html:html||"",text:text||"",updated_at:now,plan_id:activeWorkspacePlan.id,course_id:activeWorkspacePlan.course_id||null,unit_id:activeWorkspacePlan.unit_id||null})}
  else{const id=crypto.randomUUID?crypto.randomUUID():"res-"+Date.now()+"-"+Math.random().toString(16).slice(2);item={id,user_id:user?.id||null,plan_id:activeWorkspacePlan.id,course_id:activeWorkspacePlan.course_id||null,unit_id:activeWorkspacePlan.unit_id||null,type,title,config:config||{},html:html||"",text:text||"",created_at:now,updated_at:now,cloud_id:null};rows.push(item);activeSavedResourceId=id}
  writeResourceLibrary(rows);syncSavedResourceToCourse(item);
  const cloudId=await cloudSaveResource(item);if(cloudId){item.cloud_id=cloudId;writeResourceLibrary(rows)}
  toast((item.created_at===item.updated_at?"บันทึก":"อัปเดต")+resourceTypeName(type)+"เข้าคลังแล้ว ✓");return item
}
async function saveCurrentMaterialLibrary(){
  const m=materialModel();if(!m)return;
  const html=$("materialPreview")?.innerHTML||"",text=materialEditedText()||materialStudentText();
  await savePlanResource(materialType,m.title,{style:materialStyle,previewMode:materialPreviewMode,taskCount:$("materialTaskCount")?.value,pageCount:$("materialPageCount")?.value,student:$("materialStudentPlaceholder")?.value,visual:!!$("materialVisualCards")?.checked},html,text);
  if($("materialStudioStatus"))$("materialStudioStatus").innerHTML='<div class="indicator-preview">บันทึกเข้าคลังสื่อแล้ว ✓</div>'
}
async function saveCurrentQuizLibrary(){
  const m=quizModel();if(!m)return;
  await savePlanResource("quiz",m.title,{viewMode:quizViewMode,count:$("quizCount")?.value,difficulty:$("quizDifficulty")?.value,type:$("quizType")?.value},$("quizPreview")?.innerHTML||"",quizEditedText()||quizStudentText());
  if($("quizStudioStatus"))$("quizStudioStatus").innerHTML='<div class="indicator-preview">บันทึกแบบทดสอบเข้าคลังแล้ว ✓</div>'
}
async function saveCurrentRubricLibrary(){
  const m=rubricModel();if(!m)return;
  await savePlanResource("rubric",m.title,{type:$("rubricType")?.value,count:$("rubricCriteriaCount")?.value,maxScore:$("rubricMaxScore")?.value},$("rubricPreview")?.innerHTML||"",rubricEditedText()||rubricText());
  if($("rubricStudioStatus"))$("rubricStudioStatus").innerHTML='<div class="indicator-preview">บันทึก Rubric เข้าคลังแล้ว ✓</div>'
}
function currentResourceSnapshot(type){
  if(type==="material"){const m=materialModel();if(!m)return null;return {type:materialType,title:m.title,config:{style:materialStyle,previewMode:materialPreviewMode,taskCount:$("materialTaskCount")?.value,pageCount:$("materialPageCount")?.value,student:$("materialStudentPlaceholder")?.value,visual:!!$("materialVisualCards")?.checked},html:$("materialPreview")?.innerHTML||"",text:materialEditedText()||materialStudentText()}}
  if(type==="quiz"){const m=quizModel();if(!m)return null;return {type:"quiz",title:m.title,config:{viewMode:quizViewMode,count:$("quizCount")?.value,difficulty:$("quizDifficulty")?.value,type:$("quizType")?.value},html:$("quizPreview")?.innerHTML||"",text:quizEditedText()||quizStudentText()}}
  if(type==="rubric"){const m=rubricModel();if(!m)return null;return {type:"rubric",title:m.title,config:{type:$("rubricType")?.value,count:$("rubricCriteriaCount")?.value,maxScore:$("rubricMaxScore")?.value},html:$("rubricPreview")?.innerHTML||"",text:rubricEditedText()||rubricText()}}
  if(type==="game"){const m=gameModel();if(!m)return null;return {type:"game",title:m.title,config:{viewMode:gameViewMode,type:$("gameType")?.value,count:$("gameCount")?.value,mode:$("gameMode")?.value},html:$("gamePreview")?.innerHTML||"",text:gameEditedText()||gameText()}}
  return null
}
function scheduleResourceAutosave(type){
  if(!activeSavedResourceId)return;
  clearTimeout(resourceAutosaveTimer);resourceAutosaveTimer=setTimeout(()=>autosaveSavedResource(type),900)
}
async function autosaveSavedResource(type){
  const snap=currentResourceSnapshot(type),rows=resourceLibrary(),item=rows.find(x=>x.id===activeSavedResourceId);if(!snap||!item)return;
  Object.assign(item,snap,{updated_at:new Date().toISOString()});writeResourceLibrary(rows);await updateCloudResource(item);
  const statusId=type==="material"?"materialStudioStatus":type==="quiz"?"quizStudioStatus":type==="rubric"?"rubricStudioStatus":"gameStudioStatus";
  if($(statusId))$(statusId).innerHTML='<div class="indicator-preview">บันทึกอัตโนมัติแล้ว ✓</div>'
}
async function saveCurrentGameLibrary(){
  const m=gameModel();if(!m)return;
  await savePlanResource("game",m.title,{viewMode:gameViewMode,type:$("gameType")?.value,count:$("gameCount")?.value,mode:$("gameMode")?.value},$("gamePreview")?.innerHTML||"",gameEditedText()||gameText());
  if($("gameStudioStatus"))$("gameStudioStatus").innerHTML='<div class="indicator-preview">บันทึกเกมเข้าคลังแล้ว ✓</div>'
}
function renderResourceLibrary(){
  if(!activeWorkspacePlan)return;const rows=planLibraryRows(activeWorkspacePlan.id),box=$("resourceLibraryList");
  $("resourceLibraryMeta").textContent=[activeWorkspacePlan.title,activeWorkspacePlan.grade,activeWorkspacePlan.subject].filter(Boolean).join(" · ");
  $("resourceLibraryCount").textContent=rows.length+" งาน";
  box.innerHTML=rows.length?rows.map(x=>'<article class="resource-library-item"><div><h3>'+resourceIcon(x.type)+" "+esc(x.title||resourceTypeName(x.type))+'</h3><p>'+esc(resourceTypeName(x.type))+(x.cloud_id?" · ☁️ ซิงก์ Cloud":" · เก็บในเครื่อง")+'</p><small>บันทึก '+new Date(x.updated_at||x.created_at).toLocaleString("th-TH")+'</small></div><div class="resource-library-actions"><button type="button" data-open-resource="'+x.id+'">เปิดแก้ไข</button><button type="button" class="danger" data-delete-resource="'+x.id+'">ลบ</button></div></article>').join(""):'<div class="resource-empty">ยังไม่มีสื่อที่บันทึกไว้สำหรับแผนนี้<br><small>เปิด Studio แล้วกด “บันทึกเข้าคลัง” ได้ทันที</small></div>';
  $$("[data-open-resource]").forEach(b=>b.onclick=()=>openSavedResource(b.dataset.openResource));
  $$("[data-delete-resource]").forEach(b=>b.onclick=()=>deleteSavedResource(b.dataset.deleteResource))
}
function openResourceLibrary(){if(!activeWorkspacePlan)return;renderResourceLibrary();$("resourceLibraryModal").hidden=false}
function closeResourceLibrary(){$("resourceLibraryModal").hidden=true}
function openSavedResource(id){
  const item=resourceLibrary().find(x=>x.id===id);if(!item)return;
  closeResourceLibrary();
  if(item.type==="worksheet"||item.type==="knowledge"){
    openMaterialStudio(item.type);materialStyle=item.config?.style||"clean";materialPreviewMode=item.config?.previewMode||"student";
    if($("materialTaskCount")&&item.config?.taskCount)$("materialTaskCount").value=item.config.taskCount;
    if($("materialPageCount")&&item.config?.pageCount)$("materialPageCount").value=item.config.pageCount;
    if($("materialStudentPlaceholder")&&item.config?.student)$("materialStudentPlaceholder").value=item.config.student;
    if($("materialVisualCards"))$("materialVisualCards").checked=item.config?.visual!==false;
    activeSavedResourceId=item.id;materialEditedHtml=item.html||"";materialEditing=false;renderMaterialPreview();return
  }
  if(item.type==="quiz"){
    openQuizStudio();if(item.config?.count)$("quizCount").value=item.config.count;if(item.config?.difficulty)$("quizDifficulty").value=item.config.difficulty;if(item.config?.type)$("quizType").value=item.config.type;quizViewMode=item.config?.viewMode||"student";activeSavedResourceId=item.id;quizEditedHtml=item.html||"";quizEditing=false;renderQuizPreview();return
  }
  if(item.type==="rubric"){
    openRubricStudio();if(item.config?.type)$("rubricType").value=item.config.type;if(item.config?.count)$("rubricCriteriaCount").value=item.config.count;if(item.config?.maxScore)$("rubricMaxScore").value=item.config.maxScore;activeSavedResourceId=item.id;rubricEditedHtml=item.html||"";rubricEditing=false;renderRubricPreview();return
  }
  if(item.type==="game"){
    openGameStudio();if(item.config?.type)$("gameType").value=item.config.type;if(item.config?.count)$("gameCount").value=item.config.count;if(item.config?.mode)$("gameMode").value=item.config.mode;gameViewMode=item.config?.viewMode||"student";activeSavedResourceId=item.id;gameEditedHtml=item.html||"";gameEditing=false;renderGamePreview()
  }
}
async function deleteSavedResource(id,globalView=false){
  const rows=resourceLibrary(),item=rows.find(x=>x.id===id);if(!item)return;
  if(!confirm("ลบสื่อนี้ออกจากคลังหรือไม่?"))return;
  if(item.cloud_id&&sb){try{await sb.from("learning_resources").delete().eq("id",item.cloud_id)}catch(error){console.warn(error)}}
  writeResourceLibrary(rows.filter(x=>x.id!==id));if(globalView)renderGlobalResourceLibrary();else renderResourceLibrary();toast("ลบสื่อจากคลังแล้ว")
}

function gameTypeName(v){return ({battle:"ตอบไวแข่งขัน",truefalse:"จริงหรือเท็จ",match:"จับคู่ความรู้"})[v]||"ตอบไวแข่งขัน"}
function gameModeName(v){return ({team:"แบ่งทีม",individual:"รายบุคคล",pair:"จับคู่ผู้เรียน"})[v]||"แบ่งทีม"}
function gameModel(){
  const p=activeWorkspacePlan;if(!p)return null;
  const type=$("gameType")?.value||"battle",count=Math.max(6,Math.min(12,Number($("gameCount")?.value||8))),mode=$("gameMode")?.value||"team",topic=materialTopic(p),indicator=p.indicator||"-";
  const quizBase=quizStemBank(p,"medium"),items=[];
  for(let i=0;i<count;i++){
    if(type==="truefalse"){
      const truth=i%2===0;
      items.push({kind:"tf",q:truth?"ความรู้เรื่อง “"+topic+"” ควรเชื่อมโยงกับกิจกรรมและตัวชี้วัดของแผน":"การเรียนเรื่อง “"+topic+"” ไม่จำเป็นต้องสัมพันธ์กับตัวชี้วัดของแผน",key:truth?"จริง":"เท็จ"});
    }else if(type==="match"){
      const pairs=[
        ["เรื่อง",topic],["ตัวชี้วัด",indicator],["วิธีเรียน",p.method||"กิจกรรมตามแผน"],["หลักฐานการเรียนรู้","ผลงานหรือคำตอบที่สัมพันธ์กับแผน"],["การสะท้อนคิด","สรุปสิ่งที่ได้เรียนรู้"],["การประเมิน","ตรวจตามเกณฑ์และตัวชี้วัด"]
      ];
      const pair=pairs[i%pairs.length];items.push({kind:"match",left:pair[0]+" "+(i+1),right:pair[1],key:pair[0]+" → "+pair[1]});
    }else{
      const q=rotateQuizMcq(quizBase[i%quizBase.length],i);
      items.push({kind:"battle",q:q.q,a:q.a,b:q.b,c:q.c,d:q.d,key:q.key});
    }
  }
  return {title:"เกมการเรียนรู้ เรื่อง "+topic,type,count,mode,topic,subject:p.subject||"",grade:p.grade||"",unit:p.unit_name||"",indicator,indicatorText:materialIndicatorText(p),items,school:p.school_name||profile?.school_name||"",schoolLogo:profile?.school_logo_url||null,teacherPhoto:profile?.teacher_photo_url||profile?.avatar_url||null,style:"playful"}
}
function gameRules(m){
  if(m.type==="match")return "แจกหรือพิมพ์บัตรคำให้ผู้เรียนจับคู่คำ/แนวคิดที่สัมพันธ์กัน แล้วอธิบายเหตุผลสั้น ๆ";
  if(m.type==="truefalse")return "ครูอ่านโจทย์ทีละข้อ ผู้เรียนยกป้ายจริง/เท็จหรือเลือกคำตอบ จากนั้นเฉลยและอธิบายร่วมกัน";
  return m.mode==="team"?"แบ่งผู้เรียนเป็นทีม ตอบคำถามทีละข้อ ทีมที่ตอบถูกได้ 1 คะแนน สามารถกำหนดเวลา 20–30 วินาทีต่อข้อ":"ตอบคำถามทีละข้อ เก็บคะแนนรายบุคคล แล้วสรุปคำตอบร่วมกัน";
}
function gameStudentHtml(m){
  const brand=(m.schoolLogo?.startsWith("data:image/")||m.teacherPhoto?.startsWith("data:image/"))?"<div class=\"material-brand-row\">"+(m.schoolLogo?.startsWith("data:image/")?"<img class=\"material-school-logo\" src=\""+m.schoolLogo+"\" alt=\"โลโก้โรงเรียน\">":"<span></span>")+(m.teacherPhoto?.startsWith("data:image/")?"<img class=\"material-teacher-photo\" src=\""+m.teacherPhoto+"\" alt=\"รูปครู\">":"")+"</div>":"";
  let body="";
  if(m.type==="match"){
    body="<div class=\"game-match\">"+m.items.map((x,i)=>"<div><b>บัตร A"+(i+1)+"</b><p>"+esc(x.left)+"</p></div><div><b>บัตร B"+(i+1)+"</b><p>"+esc(x.right)+"</p></div>").join("")+"</div>";
  }else{
    body="<div class=\"game-grid\">"+m.items.map((x,i)=>x.kind==="tf"?
      "<div class=\"game-card\"><b>ข้อ "+(i+1)+"</b><p>"+esc(x.q)+"</p><div>☐ จริง &nbsp;&nbsp; ☐ เท็จ</div></div>":
      "<div class=\"game-card\"><b>ข้อ "+(i+1)+"</b><p>"+esc(x.q)+"</p><div class=\"quiz-options\"><div class=\"quiz-option\">ก. "+esc(x.a)+"</div><div class=\"quiz-option\">ข. "+esc(x.b)+"</div><div class=\"quiz-option\">ค. "+esc(x.c)+"</div><div class=\"quiz-option\">ง. "+esc(x.d)+"</div></div></div>"
    ).join("")+"</div>";
  }
  return "<header class=\"material-doc-title\">"+brand+"<div class=\"kicker\">GAME · "+esc(gameTypeName(m.type))+"</div><h1>"+esc(m.title)+"</h1><p>"+esc(m.school||"คลังแผนการสอนหน้าเดียว")+"</p></header><div class=\"material-meta-grid\"><div><b>รายวิชา:</b> "+esc(m.subject||"-")+"</div><div><b>ชั้น:</b> "+esc(m.grade||"-")+"</div><div><b>รูปแบบ:</b> "+esc(gameModeName(m.mode))+"</div><div><b>จำนวน:</b> "+m.count+" ภารกิจ</div></div><div class=\"material-indicator\"><b>ตัวชี้วัด:</b> "+esc(m.indicator)+"<br>"+esc(m.indicatorText)+"</div><div class=\"game-rules\"><b>วิธีเล่น:</b> "+esc(gameRules(m))+"</div>"+body+"<div class=\"game-score\">คะแนน ______ / "+m.count+" คะแนน</div><footer class=\"material-footer\">เกมสร้างจากแผนการสอนและตัวชี้วัดเดียวกัน</footer>"
}
function gameKeyHtml(m){
  const rows=m.items.map((x,i)=>"<div class=\"quiz-question\"><b>ข้อ "+(i+1)+"</b><div class=\"game-answer\">"+esc(x.key)+"</div></div>").join("");
  return "<header class=\"material-doc-title\"><div class=\"kicker\">GAME KEY</div><h1>เฉลย — "+esc(m.title)+"</h1></header><div class=\"game-rules\"><b>วิธีเล่น:</b> "+esc(gameRules(m))+"</div>"+rows+"<footer class=\"material-footer\">เอกสารสำหรับครู</footer>"
}
function gameText(){
  const m=gameModel();if(!m)return "";const lines=[m.title,"รูปแบบเกม: "+gameTypeName(m.type)+"   การเล่น: "+gameModeName(m.mode),"รายวิชา: "+(m.subject||"-")+"   ชั้น: "+(m.grade||"-"),"ตัวชี้วัด: "+m.indicator,m.indicatorText,"","วิธีเล่น: "+gameRules(m),""];
  m.items.forEach((x,i)=>{if(x.kind==="match")lines.push("บัตร A"+(i+1)+": "+x.left,"บัตร B"+(i+1)+": "+x.right,"");else if(x.kind==="tf")lines.push((i+1)+". "+x.q,"☐ จริง   ☐ เท็จ","");else lines.push((i+1)+". "+x.q,"ก. "+x.a,"ข. "+x.b,"ค. "+x.c,"ง. "+x.d,"")});lines.push("คะแนน ______ / "+m.count+" คะแนน");return lines.join("\n")
}
function gameKeyText(){
  const m=gameModel();if(!m)return "";const lines=["เฉลย — "+m.title,"วิธีเล่น: "+gameRules(m),""];m.items.forEach((x,i)=>lines.push((i+1)+". "+x.key,""));return lines.join("\n")
}
function renderGamePreview(){
  const m=gameModel(),el=$("gamePreview");if(!m||!el)return;el.className="material-preview style-playful";
  $("gameStudentViewBtn")?.classList.toggle("active",gameViewMode==="student");$("gameKeyViewBtn")?.classList.toggle("active",gameViewMode==="key");
  el.innerHTML=gameEditedHtml||(gameViewMode==="key"?gameKeyHtml(m):gameStudentHtml(m));gameSetEditable(gameEditing)
}
function gameSetEditable(on){
  gameEditing=!!on;const el=$("gamePreview");if(!el)return;el.classList.toggle("is-editing",gameEditing);
  el.querySelectorAll("h1,p,.game-card,.quiz-option,.game-rules,.game-answer,.material-indicator,.material-meta-grid div,.game-match>div").forEach(x=>x.contentEditable=gameEditing?"true":"false");
  if($("toggleGameEditBtn")){$("toggleGameEditBtn").classList.toggle("active",gameEditing);$("toggleGameEditBtn").textContent=gameEditing?"✅ เสร็จสิ้น":"✏️ แก้ไข"}
  if($("gameEditHint"))$("gameEditHint").hidden=!gameEditing
}
function openGameStudio(){
  if(!activeWorkspacePlan)return toast("กรุณาเลือกแผนก่อน");activeSavedResourceId=null;gameViewMode="student";gameEditing=false;gameEditedHtml="";
  $("gameStudioMeta").textContent=[activeWorkspacePlan.title,activeWorkspacePlan.grade,activeWorkspacePlan.subject].filter(Boolean).join(" · ");
  $("gameStudioStatus").innerHTML="";$("gameStudioModal").hidden=false;closeWorkspacePlan();renderGamePreview()
}
function closeGameStudio(){$("gameStudioModal").hidden=true;activeSavedResourceId=null}
function toggleGameEdit(){gameEditing=!gameEditing;if(!gameEditing&&$("gamePreview"))gameEditedHtml=$("gamePreview").innerHTML;gameSetEditable(gameEditing)}
function gameEditedText(){return gameEditedHtml&&$("gamePreview")?$("gamePreview").innerText.replace(/\n{3,}/g,"\n\n").trim():""}
function downloadGameDocx(){const m=gameModel();if(!m)return;const txt=gameEditedText()||gameText();saveBlob(makeDocxBlobBranded(m.title,txt,m.schoolLogo,m.teacherPhoto,m.style),safeFilename(m.title)+".docx");toast("ดาวน์โหลด Word ชุดเกมแล้ว ✓")}
async function downloadGamePdf(){const m=gameModel();if(!m)return;const txt=gameEditedText()||gameText();saveBlob(await makePdfBlobBranded(txt,m.schoolLogo,m.teacherPhoto,m.style),safeFilename(m.title)+".pdf");toast("ดาวน์โหลด PDF ชุดเกมแล้ว ✓")}
function downloadGameKeyDocx(){const m=gameModel();if(!m)return;saveBlob(makeDocxBlobBranded("เฉลย "+m.title,gameKeyText(),m.schoolLogo,m.teacherPhoto,m.style),safeFilename("เฉลย-"+m.title)+".docx");toast("ดาวน์โหลด Word เฉลยเกมแล้ว ✓")}
async function downloadGameKeyPdf(){const m=gameModel();if(!m)return;saveBlob(await makePdfBlobBranded(gameKeyText(),m.schoolLogo,m.teacherPhoto,m.style),safeFilename("เฉลย-"+m.title)+".pdf");toast("ดาวน์โหลด PDF เฉลยเกมแล้ว ✓")}

function rubricTypeName(v){return ({work:"ชิ้นงาน/ผลงาน",performance:"การปฏิบัติ",presentation:"การนำเสนอ",participation:"การมีส่วนร่วม"})[v]||"ชิ้นงาน/ผลงาน"}
function rubricModel(){
  const p=activeWorkspacePlan;if(!p)return null;
  const count=Math.max(3,Math.min(5,Number($("rubricCriteriaCount")?.value||4))),type=$("rubricType")?.value||"work",maxScore=Number($("rubricMaxScore")?.value||16),topic=materialTopic(p),indicator=p.indicator||"-";
  const base={
    work:["ความถูกต้องของเนื้อหา","ความครบถ้วนของชิ้นงาน","การประยุกต์ใช้ความรู้","ความเรียบร้อย/ความคิดสร้างสรรค์","การส่งงานและความรับผิดชอบ"],
    performance:["ความถูกต้องของการปฏิบัติ","ลำดับขั้นตอน","ความคล่องแคล่ว","การแก้ปัญหา","ความรับผิดชอบ"],
    presentation:["ความถูกต้องของเนื้อหา","การสื่อสาร","การจัดลำดับเรื่อง","การใช้สื่อประกอบ","การตอบคำถาม"],
    participation:["การมีส่วนร่วม","การทำงานร่วมกับผู้อื่น","ความรับผิดชอบ","การแสดงความคิดเห็น","การปฏิบัติตามกติกา"]
  }[type];
  const criteria=base.slice(0,count).map(name=>({name,levels:[
    "ทำได้ครบถ้วน ถูกต้อง ชัดเจน และเชื่อมโยงกับเรื่อง “"+topic+"” ได้ดีมาก",
    "ทำได้ถูกต้องเป็นส่วนใหญ่ มีรายละเอียดเพียงพอ และสัมพันธ์กับบทเรียน",
    "ทำได้บางส่วน แต่ยังขาดรายละเอียดหรือมีข้อผิดพลาดที่ควรปรับ",
    "ยังไม่แสดงหลักฐานเพียงพอว่าบรรลุเกณฑ์ตามแผน"
  ]}));
  return {title:"Rubric ประเมิน"+rubricTypeName(type)+" เรื่อง "+topic,type,maxScore,count,topic,subject:p.subject||"",grade:p.grade||"",unit:p.unit_name||"",indicator,indicatorText:materialIndicatorText(p),criteria,school:p.school_name||profile?.school_name||"",schoolLogo:profile?.school_logo_url||null,teacherPhoto:profile?.teacher_photo_url||profile?.avatar_url||null,style:"formal"}
}
function rubricHtml(m){
  const brand=(m.schoolLogo?.startsWith("data:image/")||m.teacherPhoto?.startsWith("data:image/"))?"<div class=\"material-brand-row\">"+(m.schoolLogo?.startsWith("data:image/")?"<img class=\"material-school-logo\" src=\""+m.schoolLogo+"\" alt=\"โลโก้โรงเรียน\">":"<span></span>")+(m.teacherPhoto?.startsWith("data:image/")?"<img class=\"material-teacher-photo\" src=\""+m.teacherPhoto+"\" alt=\"รูปครู\">":"")+"</div>":"";
  const rows=m.criteria.map((c,i)=>"<tr><td>"+(i+1)+". "+esc(c.name)+"</td><td class=\"rubric-level-4\">"+esc(c.levels[0])+"</td><td class=\"rubric-level-3\">"+esc(c.levels[1])+"</td><td class=\"rubric-level-2\">"+esc(c.levels[2])+"</td><td class=\"rubric-level-1\">"+esc(c.levels[3])+"</td></tr>").join("");
  return "<header class=\"material-doc-title\">"+brand+"<div class=\"kicker\">RUBRIC · "+esc(rubricTypeName(m.type))+"</div><h1>"+esc(m.title)+"</h1><p>"+esc(m.school||"คลังแผนการสอนหน้าเดียว")+"</p></header><div class=\"material-meta-grid\"><div><b>รายวิชา:</b> "+esc(m.subject||"-")+"</div><div><b>ชั้น:</b> "+esc(m.grade||"-")+"</div><div><b>หน่วย:</b> "+esc(m.unit||"-")+"</div><div><b>คะแนนเต็ม:</b> "+m.maxScore+"</div></div><div class=\"material-indicator\"><b>ตัวชี้วัด:</b> "+esc(m.indicator)+"<br>"+esc(m.indicatorText)+"</div><div class=\"rubric-table-wrap\"><table class=\"rubric-table\"><thead><tr><th>เกณฑ์</th><th>4 ดีเยี่ยม</th><th>3 ดี</th><th>2 พอใช้</th><th>1 ควรพัฒนา</th></tr></thead><tbody>"+rows+"</tbody></table></div><div class=\"rubric-score-box\">คะแนนที่ได้ ______ / "+m.maxScore+" คะแนน &nbsp;&nbsp; ระดับคุณภาพ ____________________</div><footer class=\"material-footer\">เกณฑ์ประเมินเชื่อมโยงกับแผนและตัวชี้วัดเดียวกัน</footer>"
}
function rubricText(){
  const m=rubricModel();if(!m)return "";const lines=[m.title,"ประเภท: "+rubricTypeName(m.type)+"   คะแนนเต็ม: "+m.maxScore,"รายวิชา: "+(m.subject||"-")+"   ชั้น: "+(m.grade||"-"),"หน่วย: "+(m.unit||"-"),"ตัวชี้วัด: "+m.indicator,m.indicatorText,""];
  m.criteria.forEach((c,i)=>{lines.push((i+1)+". "+c.name,"4 ดีเยี่ยม: "+c.levels[0],"3 ดี: "+c.levels[1],"2 พอใช้: "+c.levels[2],"1 ควรพัฒนา: "+c.levels[3],"")});
  lines.push("คะแนนที่ได้ ______ / "+m.maxScore+" คะแนน","ระดับคุณภาพ ____________________");return lines.join("\n")
}
function renderRubricPreview(){
  const m=rubricModel(),el=$("rubricPreview");if(!m||!el)return;el.className="material-preview style-formal";el.innerHTML=rubricEditedHtml||rubricHtml(m);rubricSetEditable(rubricEditing)
}
function rubricSetEditable(on){
  rubricEditing=!!on;const el=$("rubricPreview");if(!el)return;el.classList.toggle("is-editing",rubricEditing);
  el.querySelectorAll("h1,p,td,.material-indicator,.material-meta-grid div,.rubric-score-box").forEach(x=>x.contentEditable=rubricEditing?"true":"false");
  if($("toggleRubricEditBtn")){$("toggleRubricEditBtn").classList.toggle("active",rubricEditing);$("toggleRubricEditBtn").textContent=rubricEditing?"✅ เสร็จสิ้น":"✏️ แก้ไข"}
  if($("rubricEditHint"))$("rubricEditHint").hidden=!rubricEditing
}
function openRubricStudio(){
  if(!activeWorkspacePlan)return toast("กรุณาเลือกแผนก่อน");activeSavedResourceId=null;rubricEditing=false;rubricEditedHtml="";
  $("rubricStudioMeta").textContent=[activeWorkspacePlan.title,activeWorkspacePlan.grade,activeWorkspacePlan.subject].filter(Boolean).join(" · ");
  $("rubricStudioStatus").innerHTML="";$("rubricStudioModal").hidden=false;closeWorkspacePlan();renderRubricPreview()
}
function closeRubricStudio(){$("rubricStudioModal").hidden=true;activeSavedResourceId=null}
function toggleRubricEdit(){rubricEditing=!rubricEditing;if(!rubricEditing&&$("rubricPreview"))rubricEditedHtml=$("rubricPreview").innerHTML;rubricSetEditable(rubricEditing)}
function rubricEditedText(){return rubricEditedHtml&&$("rubricPreview")?$("rubricPreview").innerText.replace(/\n{3,}/g,"\n\n").trim():""}
function downloadRubricDocx(){const m=rubricModel();if(!m)return;const txt=rubricEditedText()||rubricText();saveBlob(makeDocxBlobBranded(m.title,txt,m.schoolLogo,m.teacherPhoto,m.style),safeFilename(m.title)+".docx");toast("ดาวน์โหลด Word Rubric แล้ว ✓")}
async function downloadRubricPdf(){const m=rubricModel();if(!m)return;const txt=rubricEditedText()||rubricText();saveBlob(await makePdfBlobBranded(txt,m.schoolLogo,m.teacherPhoto,m.style),safeFilename(m.title)+".pdf");toast("ดาวน์โหลด PDF Rubric แล้ว ✓")}

function quizDifficultyName(v){return ({easy:"ง่าย",medium:"ปานกลาง",hard:"ท้าทาย"})[v]||"ปานกลาง"}
function quizTypeName(v){return ({mcq:"ปรนัย 4 ตัวเลือก",mixed:"ผสมปรนัย + อัตนัย",short:"อัตนัยสั้น"})[v]||"ปรนัย 4 ตัวเลือก"}
function quizPlan(){return activeWorkspacePlan||null}
function quizTopic(p){return materialTopic(p)}
function quizStemBank(p,diff){
  const topic=quizTopic(p),indicator=p?.indicator||"-",method=p?.method||"กิจกรรมตามแผน";
  const easy=[
    {q:"ข้อใดกล่าวถึงเรื่อง “"+topic+"” ได้สอดคล้องกับบทเรียนมากที่สุด",a:"แนวคิดที่สัมพันธ์กับสาระและกิจกรรมในแผน",b:"เรื่องที่ไม่เกี่ยวข้องกับบทเรียน",c:"ข้อมูลที่ขัดกับตัวชี้วัด",d:"กิจกรรมที่ไม่ใช้ความรู้จากบทเรียน",key:"A"},
    {q:"จากการเรียนเรื่อง “"+topic+"” นักเรียนควรทำสิ่งใดได้",a:"อธิบายหรือปฏิบัติได้ตามกิจกรรมในแผน",b:"จดจำคำศัพท์ที่ไม่เกี่ยวข้อง",c:"ทำกิจกรรมอื่นที่ไม่สัมพันธ์กับหน่วย",d:"หลีกเลี่ยงการใช้ความรู้จากบทเรียน",key:"A"},
    {q:"ตัวชี้วัด "+indicator+" เน้นให้นักเรียนแสดงอะไร",a:"ความรู้หรือทักษะที่สัมพันธ์กับบทเรียน",b:"ข้อมูลนอกหน่วยทั้งหมด",c:"การท่องจำโดยไม่ต้องเข้าใจ",d:"การทำงานที่ไม่ต้องอ้างอิงบทเรียน",key:"A"}
  ];
  const medium=[
    {q:"หากต้องนำความรู้เรื่อง “"+topic+"” ไปใช้ในกิจกรรม นักเรียนควรเริ่มจากข้อใด",a:"พิจารณาจุดประสงค์และขั้นตอนของกิจกรรม",b:"เลือกคำตอบแบบสุ่ม",c:"ข้ามคำชี้แจงของงาน",d:"ทำเฉพาะส่วนที่ไม่เกี่ยวข้อง",key:"A"},
    {q:"ข้อใดเป็นหลักฐานที่เหมาะสมที่สุดว่าผู้เรียนเข้าใจเรื่อง “"+topic+"”",a:"สามารถอธิบายและยกตัวอย่างตามบริบทของบทเรียน",b:"คัดลอกข้อความโดยไม่อธิบาย",c:"ตอบโดยไม่สัมพันธ์กับคำถาม",d:"เว้นคำตอบทั้งหมด",key:"A"},
    {q:"การเรียนแบบ "+method+" ช่วยให้ผู้เรียนพัฒนาด้านใดมากที่สุดตามแผน",a:"การลงมือคิดหรือปฏิบัติตามเป้าหมาย",b:"การจำข้อมูลที่ไม่เกี่ยวข้อง",c:"การหลีกเลี่ยงการทำกิจกรรม",d:"การทำงานโดยไม่ตรวจสอบผล",key:"A"}
  ];
  const hard=[
    {q:"สถานการณ์ใดแสดงการประยุกต์ใช้ความรู้เรื่อง “"+topic+"” ได้ดีที่สุด",a:"เลือกวิธีที่เหมาะกับสถานการณ์และอธิบายเหตุผลได้",b:"ใช้คำตอบเดิมทุกสถานการณ์โดยไม่พิจารณา",c:"ตัดสินใจโดยไม่ใช้ข้อมูลจากบทเรียน",d:"ทำตามผู้อื่นโดยไม่อธิบาย",key:"A"},
    {q:"หากผลงานยังไม่สอดคล้องกับตัวชี้วัด "+indicator+" ควรปรับอย่างไร",a:"ตรวจหลักฐานการเรียนรู้และแก้ให้สัมพันธ์กับเกณฑ์",b:"เพิ่มเนื้อหาที่ไม่เกี่ยวข้อง",c:"ตัดขั้นตอนสำคัญออก",d:"ไม่ต้องตรวจสอบผลงาน",key:"A"},
    {q:"ข้อใดสะท้อนการคิดวิเคราะห์จากเรื่อง “"+topic+"” ได้ชัดที่สุด",a:"เปรียบเทียบเหตุผล หลักฐาน และสรุปอย่างมีที่มา",b:"เลือกคำตอบโดยไม่อ่านโจทย์",c:"คัดลอกคำตอบโดยไม่พิจารณา",d:"ตอบเพียงคำเดียวทุกข้อ",key:"A"}
  ];
  return diff==="easy"?easy:diff==="hard"?hard:medium
}
function rotateQuizMcq(q,i){
  const vals=[q.a,q.b,q.c,q.d],shift=i%4,rot=vals.slice(shift).concat(vals.slice(0,shift)),correct=(4-shift)%4;
  return {kind:"mcq",q:q.q,a:rot[0],b:rot[1],c:rot[2],d:rot[3],key:["A","B","C","D"][correct]}
}
function quizShortQuestion(p,diff,i){
  const topic=quizTopic(p),indicator=p?.indicator||"-";
  const bank=diff==="easy"?[
    "เขียนสรุปสิ่งสำคัญเกี่ยวกับ “"+topic+"” 1–2 ประโยค",
    "ยกตัวอย่างสิ่งที่ได้เรียนรู้จากเรื่อง “"+topic+"” 1 ตัวอย่าง"
  ]:diff==="hard"?[
    "วิเคราะห์สถานการณ์หนึ่งที่สามารถนำความรู้เรื่อง “"+topic+"” ไปใช้ และอธิบายเหตุผล",
    "อธิบายว่าผลงานของนักเรียนจะสะท้อนตัวชี้วัด "+indicator+" ได้อย่างไร"
  ]:[
    "อธิบายแนวคิดสำคัญของเรื่อง “"+topic+"” ด้วยภาษาของตนเอง",
    "ยกตัวอย่างการนำความรู้เรื่อง “"+topic+"” ไปใช้ในสถานการณ์จริง"
  ];
  return bank[i%bank.length]
}
function quizModel(){
  const p=quizPlan();if(!p)return null;
  const count=Math.max(5,Math.min(20,Number($("quizCount")?.value||10))),difficulty=$("quizDifficulty")?.value||"medium",type=$("quizType")?.value||"mcq";
  const base=quizStemBank(p,difficulty),questions=[];
  for(let i=0;i<count;i++){
    const makeShort=type==="short"||(type==="mixed"&&i%4===3);
    if(makeShort){questions.push({kind:"short",q:quizShortQuestion(p,difficulty,i),key:"พิจารณาความถูกต้อง ความครบถ้วน และความสัมพันธ์กับเรื่อง “"+quizTopic(p)+"” และตัวชี้วัด "+(p.indicator||"-")})}
    else{const q=base[i%base.length];questions.push(rotateQuizMcq(q,i))}
  }
  return {title:"แบบทดสอบ เรื่อง "+quizTopic(p),topic:quizTopic(p),subject:p.subject||"",grade:p.grade||"",unit:p.unit_name||"",indicator:p.indicator||"",indicatorText:materialIndicatorText(p),difficulty,type,count,questions,school:p.school_name||profile?.school_name||"",teacher:p.teacher_name||profile?.full_name||"",schoolLogo:profile?.school_logo_url||null,teacherPhoto:profile?.teacher_photo_url||profile?.avatar_url||null,style:"formal"}
}
function quizStudentHtml(m){
  const brand=(m.schoolLogo?.startsWith("data:image/")||m.teacherPhoto?.startsWith("data:image/"))?"<div class=\"material-brand-row\">"+(m.schoolLogo?.startsWith("data:image/")?"<img class=\"material-school-logo\" src=\""+m.schoolLogo+"\" alt=\"โลโก้โรงเรียน\">":"<span></span>")+(m.teacherPhoto?.startsWith("data:image/")?"<img class=\"material-teacher-photo\" src=\""+m.teacherPhoto+"\" alt=\"รูปครู\">":"")+"</div>":"";
  const qs=m.questions.map((q,i)=>q.kind==="mcq"?
    "<div class=\"quiz-question\"><b>"+(i+1)+". "+esc(q.q)+"</b><div class=\"quiz-options\"><div class=\"quiz-option\">ก. "+esc(q.a)+"</div><div class=\"quiz-option\">ข. "+esc(q.b)+"</div><div class=\"quiz-option\">ค. "+esc(q.c)+"</div><div class=\"quiz-option\">ง. "+esc(q.d)+"</div></div></div>":
    "<div class=\"quiz-question\"><b>"+(i+1)+". "+esc(q.q)+"</b><div class=\"quiz-short-lines\"><i></i><i></i><i></i></div></div>"
  ).join("");
  return "<header class=\"material-doc-title\">"+brand+"<div class=\"kicker\">QUIZ · "+esc(quizDifficultyName(m.difficulty))+"</div><h1>"+esc(m.title)+"</h1><p>"+esc(m.school||"คลังแผนการสอนหน้าเดียว")+"</p></header><div class=\"material-meta-grid\"><div><b>รายวิชา:</b> "+esc(m.subject||"-")+"</div><div><b>ชั้น:</b> "+esc(m.grade||"-")+"</div><div><b>หน่วย:</b> "+esc(m.unit||"-")+"</div><div><b>จำนวน:</b> "+m.count+" ข้อ</div></div><div class=\"material-indicator\"><b>ตัวชี้วัด:</b> "+esc(m.indicator||"-")+"<br>"+esc(m.indicatorText)+"</div><div class=\"quiz-note\">ชื่อ-สกุล ______________________________ ชั้น ______ เลขที่ ______</div>"+qs+"<footer class=\"material-footer\">แบบทดสอบสร้างจากแผนการสอนเดียวกัน • ครูสามารถแก้ไขก่อนดาวน์โหลดได้</footer>"
}
function quizKeyHtml(m){
  const qs=m.questions.map((q,i)=>"<div class=\"quiz-question\"><b>"+(i+1)+". "+esc(q.q)+"</b><div class=\"quiz-answer\">"+(q.kind==="mcq"?"เฉลย: "+esc(q.key):"แนวตรวจ: "+esc(q.key))+"</div></div>").join("");
  return "<header class=\"material-doc-title\"><div class=\"kicker\">ANSWER KEY</div><h1>เฉลย — "+esc(m.title)+"</h1><p>"+esc(m.school||"คลังแผนการสอนหน้าเดียว")+"</p></header><div class=\"material-indicator\"><b>ระดับ:</b> "+esc(quizDifficultyName(m.difficulty))+" · <b>รูปแบบ:</b> "+esc(quizTypeName(m.type))+"</div>"+qs+"<footer class=\"material-footer\">เอกสารสำหรับครู</footer>"
}
function quizSetEditable(on){
  quizEditing=!!on;const el=$("quizPreview");if(!el)return;el.classList.toggle("is-editing",quizEditing);
  el.querySelectorAll("h1,p,.quiz-question,.quiz-option,.quiz-answer,.material-indicator,.material-meta-grid div").forEach(x=>x.contentEditable=quizEditing?"true":"false");
  if($("toggleQuizEditBtn")){$("toggleQuizEditBtn").classList.toggle("active",quizEditing);$("toggleQuizEditBtn").textContent=quizEditing?"✅ เสร็จสิ้น":"✏️ แก้ไข"}
  if($("quizEditHint"))$("quizEditHint").hidden=!quizEditing
}
function renderQuizPreview(){
  const m=quizModel(),el=$("quizPreview");if(!m||!el)return;
  el.className="material-preview style-formal";
  $("quizStudentViewBtn")?.classList.toggle("active",quizViewMode==="student");$("quizKeyViewBtn")?.classList.toggle("active",quizViewMode==="key");
  const generated=quizViewMode==="key"?quizKeyHtml(m):quizStudentHtml(m);el.innerHTML=quizEditedHtml||generated;quizSetEditable(quizEditing)
}
function openQuizStudio(){
  if(!activeWorkspacePlan)return toast("กรุณาเลือกแผนก่อน");activeSavedResourceId=null;quizViewMode="student";quizEditing=false;quizEditedHtml="";
  $("quizStudioMeta").textContent=[activeWorkspacePlan.title,activeWorkspacePlan.grade,activeWorkspacePlan.subject].filter(Boolean).join(" · ");
  $("quizStudioStatus").innerHTML="";$("quizStudioModal").hidden=false;closeWorkspacePlan();renderQuizPreview()
}
function closeQuizStudio(){$("quizStudioModal").hidden=true;activeSavedResourceId=null}
function quizStudentText(){
  const m=quizModel();if(!m)return "";const lines=[m.title,"ระดับ: "+quizDifficultyName(m.difficulty)+"   รูปแบบ: "+quizTypeName(m.type),"รายวิชา: "+(m.subject||"-")+"   ชั้น: "+(m.grade||"-"),"หน่วย: "+(m.unit||"-"),"ตัวชี้วัด: "+(m.indicator||"-"),m.indicatorText,"","ชื่อ-สกุล ______________________________ ชั้น ______ เลขที่ ______",""];
  m.questions.forEach((q,i)=>{lines.push((i+1)+". "+q.q);if(q.kind==="mcq")lines.push("ก. "+q.a,"ข. "+q.b,"ค. "+q.c,"ง. "+q.d);else lines.push("____________________________________________________________","____________________________________________________________");lines.push("")});return lines.join("\n")
}
function quizKeyText(){
  const m=quizModel();if(!m)return "";const lines=["เฉลย — "+m.title,"ระดับ: "+quizDifficultyName(m.difficulty)+"   รูปแบบ: "+quizTypeName(m.type),"ตัวชี้วัด: "+(m.indicator||"-"),""];
  m.questions.forEach((q,i)=>lines.push((i+1)+". "+q.q,q.kind==="mcq"?"เฉลย: "+q.key:"แนวตรวจ: "+q.key,""));return lines.join("\n")
}
function quizEditedText(){return quizEditedHtml&&$("quizPreview")?$("quizPreview").innerText.replace(/\n{3,}/g,"\n\n").trim():""}
function toggleQuizEdit(){quizEditing=!quizEditing;if(!quizEditing&&$("quizPreview"))quizEditedHtml=$("quizPreview").innerHTML;quizSetEditable(quizEditing)}
function downloadQuizDocx(){const m=quizModel();if(!m)return;const txt=quizEditedText()||quizStudentText();saveBlob(makeDocxBlobBranded(m.title,txt,m.schoolLogo,m.teacherPhoto,m.style),safeFilename(m.title)+".docx");toast("ดาวน์โหลด Word แบบทดสอบแล้ว ✓")}
async function downloadQuizPdf(){const m=quizModel();if(!m)return;const txt=quizEditedText()||quizStudentText();saveBlob(await makePdfBlobBranded(txt,m.schoolLogo,m.teacherPhoto,m.style),safeFilename(m.title)+".pdf");toast("ดาวน์โหลด PDF แบบทดสอบแล้ว ✓")}
function downloadQuizKeyDocx(){const m=quizModel();if(!m)return;saveBlob(makeDocxBlobBranded("เฉลย "+m.title,quizKeyText(),m.schoolLogo,m.teacherPhoto,m.style),safeFilename("เฉลย-"+m.title)+".docx");toast("ดาวน์โหลด Word เฉลยแล้ว ✓")}
async function downloadQuizKeyPdf(){const m=quizModel();if(!m)return;saveBlob(await makePdfBlobBranded(quizKeyText(),m.schoolLogo,m.teacherPhoto,m.style),safeFilename("เฉลย-"+m.title)+".pdf");toast("ดาวน์โหลด PDF เฉลยแล้ว ✓")}

function materialStyleName(key){
  return ({clean:"มินิมอลคลีน",primary:"พาสเทลประถม",formal:"ทางการน้ำเงิน",playful:"สดใสสนุก",eco:"ธรรมชาติ"})[key]||"มินิมอลคลีน"
}
function materialPlan(){return activeWorkspacePlan||null}
function materialTopic(p){return p?.topic||p?.title?.replace(/^แผนการจัดการเรียนรู้\s*/,"")||p?.unit_name||"บทเรียน"}
function materialIndicatorText(p){return p?.indicator_text||p?.indicator||"ยึดตามตัวชี้วัดที่ระบุในแผน"}
function materialTasks(p,count){
  const topic=materialTopic(p),method=p?.method||"กิจกรรมตามแผน";
  const pool=[
    {title:"ทบทวนความรู้เดิม",body:"เขียนหรืออธิบายสิ่งที่นักเรียนรู้เกี่ยวกับ “"+topic+"” อย่างน้อย 2 ประเด็น",key:"พิจารณาคำตอบที่กล่าวถึงประเด็นสำคัญของเรื่อง “"+topic+"” อย่างน้อย 2 ประเด็น และสอดคล้องกับสิ่งที่เรียนในแผน"},
    {title:"ภารกิจจากแผน",body:"ปฏิบัติหรือวิเคราะห์กิจกรรมเรื่อง “"+topic+"” โดยใช้แนวทาง "+method+" แล้วบันทึกขั้นตอนและผลที่ได้",key:"พิจารณาความครบถ้วนของขั้นตอน การปฏิบัติตามกิจกรรม และการอธิบายผลที่เกิดขึ้นตามแนวทาง "+method},
    {title:"เชื่อมโยงตัวชี้วัด",body:"อธิบายว่าผลงานหรือคำตอบของนักเรียนแสดงความเข้าใจตามตัวชี้วัด "+(p?.indicator||"-")+" อย่างไร",key:"คำตอบควรเชื่อมผลงานหรือหลักฐานการเรียนรู้กับตัวชี้วัด "+(p?.indicator||"-")+" โดยอ้างสิ่งที่นักเรียนได้ทำจริง"},
    {title:"สรุปและสะท้อนคิด",body:"สรุปสิ่งสำคัญที่ได้เรียนรู้จากเรื่อง “"+topic+"” และยกตัวอย่างการนำไปใช้ 1 ตัวอย่าง",key:"พิจารณาว่าสรุปใจความสำคัญของเรื่อง “"+topic+"” ได้ และยกตัวอย่างการนำไปใช้ที่สัมพันธ์กับบทเรียนอย่างน้อย 1 ตัวอย่าง"}
  ];
  return pool.slice(0,Math.max(2,Math.min(4,Number(count)||3)))
}
function materialVisualCards(m){
  const text=((m.subject||"")+" "+(m.topic||"")).toLowerCase();
  let icons=["💡","🧠","✅"];
  if(/ดนตรี|เพลง|music/.test(text))icons=["🎵","🥁","🎤"];
  else if(/นาฏ|รำ|dance/.test(text))icons=["💃","🪭","🎭"];
  else if(/ศิลป|วาด|art/.test(text))icons=["🎨","🖍️","🖼️"];
  else if(/วิทย|science/.test(text))icons=["🔬","🧪","🌱"];
  else if(/คณิต|math/.test(text))icons=["🔢","📐","➗"];
  else if(/ภาษา|ไทย|english|อังกฤษ/.test(text))icons=["📖","✏️","💬"];
  else if(/สังคม|ประวัติ|ภูมิ/.test(text))icons=["🌏","🏛️","🗺️"];
  return [{icon:icons[0],label:"สังเกต "+m.topic},{icon:icons[1],label:"ลงมือเรียนรู้"},{icon:icons[2],label:"สรุปความเข้าใจ"}]
}
function materialModel(){
  const p=materialPlan();if(!p)return null;const topic=materialTopic(p),count=Number($("materialTaskCount")?.value||3);
  const pages=Math.max(1,Math.min(3,Number($("materialPageCount")?.value||1)));
  const showVisual=!!$("materialVisualCards")?.checked;
  const m={type:materialType,style:materialStyle,title:materialType==="worksheet"?"ใบงาน เรื่อง "+topic:"ใบความรู้ เรื่อง "+topic,topic,grade:p.grade||"",subject:p.subject||"",unit:p.unit_name||"",indicator:p.indicator||"",indicatorText:materialIndicatorText(p),method:p.method||"",duration:p.duration||"",school:p.school_name||profile?.school_name||"",teacher:p.teacher_name||profile?.full_name||"",student:$("materialStudentPlaceholder")?.value||"ชื่อ-สกุล ______________________________",tasks:materialTasks(p,count),pages,showVisual,teacherPhoto:profile?.teacher_photo_url||profile?.avatar_url||null,schoolLogo:profile?.school_logo_url||null};
  m.cards=materialVisualCards(m);return m
}
function materialCardsHtml(m){
  if(!m.showVisual)return "";
  return "<div class=\"material-section\"><h3><span>★</span>บัตรภาพประกอบ</h3><div class=\"material-visual-cards\">"+m.cards.map(x=>"<div class=\"material-visual-card\"><div><span>"+esc(x.icon)+"</span><b>"+esc(x.label)+"</b></div></div>").join("")+"</div></div>"
}
function materialStudentHtml(m){
  const meta="<div><b>รายวิชา:</b> "+esc(m.subject||"-")+"</div><div><b>ชั้น:</b> "+esc(m.grade||"-")+"</div><div><b>หน่วย:</b> "+esc(m.unit||"-")+"</div><div><b>เวลา:</b> "+esc(m.duration||"-")+"</div>";
  const indicator="<div class=\"material-indicator\"><b>ตัวชี้วัด:</b> "+esc(m.indicator||"-")+"<br><span>"+esc(m.indicatorText)+"</span></div>";
  let body="";
  if(m.type==="worksheet"){
    body="<div class=\"material-section\"><h3><span>1</span>ข้อมูลผู้เรียน</h3><div class=\"material-task\">"+esc(m.student)+"</div></div>"+
      "<div class=\"material-section\"><h3><span>2</span>คำชี้แจง</h3><div class=\"material-task\">ทำกิจกรรมต่อไปนี้ให้ครบ โดยใช้ความรู้และทักษะจากแผนการเรียนรู้เรื่อง <b>"+esc(m.topic)+"</b></div></div>"+materialCardsHtml(m)+
      "<div class=\"material-section\"><h3><span>3</span>ภารกิจการเรียนรู้</h3>"+m.tasks.map((t,i)=>"<div class=\"material-task\"><b>ภารกิจที่ "+(i+1)+": "+esc(t.title)+"</b><p>"+esc(t.body)+"</p><div class=\"material-answer-lines\"><div></div><div></div><div></div></div></div>").join("")+"</div>"+
      "<div class=\"material-summary-box\"><b>สรุปท้ายใบงาน</b><p>สิ่งที่ฉันทำได้ดี ____________________________________________</p><p>สิ่งที่ฉันอยากพัฒนาต่อ ________________________________________</p></div>";
  }else{
    body=materialCardsHtml(m)+"<div class=\"material-section\"><h3><span>1</span>สาระสำคัญ</h3><div class=\"material-knowledge-box\">"+esc(m.indicatorText)+"</div></div>"+
      "<div class=\"material-section\"><h3><span>2</span>สิ่งที่ควรรู้</h3><div class=\"material-knowledge-box\"><b>แนวคิดหลัก</b><p>เรียนรู้และทำความเข้าใจเรื่อง “"+esc(m.topic)+"” ให้สัมพันธ์กับตัวชี้วัดของบทเรียน</p></div>"+
      "<div class=\"material-knowledge-box\"><b>การเรียนรู้ตามแผน</b><p>ใช้แนวทาง "+esc(m.method||"กิจกรรมตามแผน")+" เพื่อฝึกความเข้าใจ การปฏิบัติ และการอธิบายสิ่งที่เรียนรู้</p></div>"+
      "<div class=\"material-knowledge-box\"><b>จุดสังเกตสำคัญ</b><p>เน้นความถูกต้องของสาระ การลงมือทำ และการเชื่อมโยงผลการเรียนรู้กับตัวชี้วัด "+esc(m.indicator||"-")+"</p></div></div>"+
      "<div class=\"material-summary-box\"><b>จำให้แม่น</b><p>หัวใจของบทเรียนนี้คือการเข้าใจ “"+esc(m.topic)+"” และนำความรู้ไปใช้ในกิจกรรมตามแผนได้อย่างเหมาะสม</p></div>";
  }
  for(let page=2;page<=m.pages;page++){
    body+="<div class=\"material-page-break\"><div class=\"material-page-label\">หน้าที่ "+page+" จาก "+m.pages+"</div><div class=\"material-section\"><h3><span>"+page+"</span>"+(m.type==="worksheet"?"กิจกรรมเสริม":"ทบทวนความรู้")+"</h3><div class=\"material-task\"><b>"+esc(m.topic)+"</b><p>"+(m.type==="worksheet"?"ให้นักเรียนยกตัวอย่าง อธิบาย หรือสร้างชิ้นงานเพิ่มเติมจากสิ่งที่เรียน โดยเชื่อมกับตัวชี้วัดเดิม":"อ่านทบทวนประเด็นสำคัญ แล้วเขียนสรุปใจความด้วยภาษาของตนเอง")+"</p><div class=\"material-answer-lines\"><div></div><div></div><div></div><div></div></div></div></div></div>";
  }
  const brand=(m.schoolLogo?.startsWith("data:image/")||m.teacherPhoto?.startsWith("data:image/"))?"<div class=\"material-brand-row\">"+(m.schoolLogo?.startsWith("data:image/")?"<img class=\"material-school-logo\" src=\""+m.schoolLogo+"\" alt=\"โลโก้โรงเรียน\">":"<span></span>")+(m.teacherPhoto?.startsWith("data:image/")?"<img class=\"material-teacher-photo\" src=\""+m.teacherPhoto+"\" alt=\"รูปครู\">":"")+"</div>":"";return "<header class=\"material-doc-title\">"+brand+"<div class=\"kicker\">"+(m.type==="worksheet"?"WORKSHEET":"KNOWLEDGE SHEET")+" · "+esc(materialStyleName(m.style))+"</div><h1>"+esc(m.title)+"</h1><p>"+esc(m.school||"คลังแผนการสอนหน้าเดียว")+"</p></header><div class=\"material-meta-grid\">"+meta+"</div>"+indicator+body+"<footer class=\"material-footer\">สร้างจากแผนการสอนเดียวกัน • ไม่เปลี่ยนตัวชี้วัดของแผน • "+m.pages+" หน้า</footer>"
}
function materialTeacherHtml(m){
  const items=m.tasks.map((t,i)=>"<div class=\"material-teacher-key\"><h3>ภารกิจที่ "+(i+1)+": "+esc(t.title)+"</h3><p><b>แนวคำตอบ/เกณฑ์ตรวจ:</b> "+esc(t.key)+"</p></div>").join("");
  const extra=m.pages>1?"<div class=\"material-teacher-key\"><h3>กิจกรรมเสริมหน้าถัดไป</h3><p><b>เกณฑ์ตรวจ:</b> พิจารณาความสอดคล้องกับเรื่อง "+esc(m.topic)+" และตัวชี้วัด "+esc(m.indicator||"-")+" โดยใช้หลักฐานจากการเรียนรู้จริง</p></div>":"";
  return "<header class=\"material-doc-title\"><div class=\"kicker\">TEACHER KEY · "+esc(materialStyleName(m.style))+"</div><h1>แนวคำตอบสำหรับครู — "+esc(m.topic)+"</h1><p>"+esc(m.school||"คลังแผนการสอนหน้าเดียว")+"</p></header><div class=\"material-indicator\"><b>ตัวชี้วัด:</b> "+esc(m.indicator||"-")+"<br>"+esc(m.indicatorText)+"</div><div class=\"material-teacher-key\"><h3>คำแนะนำการตรวจ</h3><p>ใช้แนวคำตอบเป็นเกณฑ์พิจารณา ไม่บังคับถ้อยคำเดียวกัน ให้ยึดความถูกต้อง ความครบถ้วน และหลักฐานที่สัมพันธ์กับแผนการสอน</p></div>"+items+extra+"<footer class=\"material-footer\">เอกสารสำหรับครู • แยกจากใบงานนักเรียน</footer>"
}
function materialSetEditable(on){
  const el=$("materialPreview");if(!el)return;materialEditing=!!on;
  el.classList.toggle("is-editing",materialEditing);
  el.querySelectorAll("h1,h3,p,.material-task,.material-knowledge-box,.material-summary-box,.material-indicator,.material-meta-grid div,.material-visual-card b").forEach(x=>x.contentEditable=materialEditing?"true":"false");
  if($("toggleMaterialEditBtn")){$("toggleMaterialEditBtn").classList.toggle("active",materialEditing);$("toggleMaterialEditBtn").textContent=materialEditing?"✅ เสร็จสิ้นการแก้ไข":"✏️ แก้ไขเนื้อหา"}
  if($("resetMaterialEditBtn"))$("resetMaterialEditBtn").hidden=!materialEditedHtml;
  if($("materialEditHint"))$("materialEditHint").hidden=!materialEditing;
}
function renderMaterialPreview(){
  const m=materialModel(),el=$("materialPreview");if(!m||!el)return;
  el.className="material-preview style-"+materialStyle;
  nodes("[data-material-style]").forEach(b=>b.classList.toggle("active",b.dataset.materialStyle===materialStyle));
  $("materialTypeWorksheet")?.classList.toggle("active",materialType==="worksheet");
  $("materialTypeKnowledge")?.classList.toggle("active",materialType==="knowledge");
  $("previewStudentMaterialBtn")?.classList.toggle("active",materialPreviewMode==="student");
  $("previewTeacherKeyBtn")?.classList.toggle("active",materialPreviewMode==="teacher");
  if($("materialTaskCount"))$("materialTaskCount").closest("label").style.display=materialType==="worksheet"?"grid":"none";
  if($("materialStudentPlaceholder"))$("materialStudentPlaceholder").closest("label").style.display=materialType==="worksheet"?"grid":"none";
  if($("materialAnswerSwitch"))$("materialAnswerSwitch").style.display=materialType==="worksheet"?"flex":"none";
  $$(".teacher-key-btn").forEach(b=>b.style.display=materialType==="worksheet"?"grid":"none");
  if(materialType!=="worksheet")materialPreviewMode="student";
  const generated=materialPreviewMode==="teacher"?materialTeacherHtml(m):materialStudentHtml(m);
  el.innerHTML=materialEditedHtml||generated;
  materialSetEditable(materialEditing);
}
function openMaterialStudio(type="worksheet"){
  if(!activeWorkspacePlan)return toast("กรุณาเลือกแผนก่อน");activeSavedResourceId=null;materialType=type;materialStyle="clean";materialPreviewMode="student";materialEditing=false;materialEditedHtml="";
  $("materialStudioMeta").textContent=[activeWorkspacePlan.title,activeWorkspacePlan.grade,activeWorkspacePlan.subject].filter(Boolean).join(" · ");
  $("materialStudioStatus").innerHTML="";$("materialStudioModal").hidden=false;closeWorkspacePlan();renderMaterialPreview()
}
function closeMaterialStudio(){$("materialStudioModal").hidden=true;activeSavedResourceId=null}
function materialEditedText(){
  const el=$("materialPreview");
  if(materialEditedHtml&&el)return el.innerText.replace(/\n{3,}/g,"\n\n").trim();
  return "";
}
function toggleMaterialEdit(){
  materialEditing=!materialEditing;
  if(!materialEditing&&$("materialPreview"))materialEditedHtml=$("materialPreview").innerHTML;
  materialSetEditable(materialEditing);
}
function resetMaterialEdit(){materialEditedHtml="";materialEditing=false;renderMaterialPreview();toast("คืนค่าเนื้อหาเดิมแล้ว")}
function materialStudentText(){
  const m=materialModel();if(!m)return "";const lines=[m.title,"รูปแบบ: "+materialStyleName(m.style),m.school?"โรงเรียน: "+m.school:"","รายวิชา: "+(m.subject||"-")+"   ชั้น: "+(m.grade||"-"),"หน่วย: "+(m.unit||"-")+"   เวลา: "+(m.duration||"-"),"ตัวชี้วัด: "+(m.indicator||"-"),m.indicatorText,""];
  if(m.showVisual){lines.push("","บัตรภาพประกอบ");m.cards.forEach(x=>lines.push(x.icon+" "+x.label))}
  if(m.type==="worksheet"){
    lines.push("",m.student,"","คำชี้แจง","ทำกิจกรรมต่อไปนี้ให้ครบ โดยใช้ความรู้และทักษะจากแผนการเรียนรู้เรื่อง "+m.topic,"");
    m.tasks.forEach((t,i)=>{lines.push("ภารกิจที่ "+(i+1)+": "+t.title,t.body,"คำตอบ: ______________________________________________________________","______________________________________________________________________","")});
    lines.push("สรุปท้ายใบงาน","สิ่งที่ฉันทำได้ดี ____________________________________________","สิ่งที่ฉันอยากพัฒนาต่อ ________________________________________");
  }else{
    lines.push("","สาระสำคัญ",m.indicatorText,"","สิ่งที่ควรรู้","1. แนวคิดหลัก: เรียนรู้และทำความเข้าใจเรื่อง “"+m.topic+"” ให้สัมพันธ์กับตัวชี้วัดของบทเรียน","2. การเรียนรู้ตามแผน: ใช้แนวทาง "+(m.method||"กิจกรรมตามแผน")+" เพื่อฝึกความเข้าใจและการปฏิบัติ","3. จุดสังเกตสำคัญ: เชื่อมผลการเรียนรู้กับตัวชี้วัด "+(m.indicator||"-"),"","จำให้แม่น","หัวใจของบทเรียนนี้คือการเข้าใจ “"+m.topic+"” และนำความรู้ไปใช้ในกิจกรรมตามแผนได้อย่างเหมาะสม");
  }
  for(let page=2;page<=m.pages;page++){lines.push("[[PAGE_BREAK]]","หน้าที่ "+page+" จาก "+m.pages,m.type==="worksheet"?"กิจกรรมเสริม":"ทบทวนความรู้","เรื่อง: "+m.topic,"______________________________________________________________________","______________________________________________________________________","______________________________________________________________________")}
  return lines.filter(x=>x!==null&&x!==undefined).join("\n")
}
function materialTeacherText(){
  const m=materialModel();if(!m)return "";const lines=["แนวคำตอบสำหรับครู — "+m.topic,"ตัวชี้วัด: "+(m.indicator||"-"),m.indicatorText,"","คำแนะนำการตรวจ","ใช้แนวคำตอบเป็นเกณฑ์พิจารณา ไม่บังคับถ้อยคำเดียวกัน ให้ยึดความถูกต้อง ความครบถ้วน และหลักฐานที่สัมพันธ์กับแผนการสอน",""];
  m.tasks.forEach((t,i)=>lines.push("ภารกิจที่ "+(i+1)+": "+t.title,"แนวคำตอบ/เกณฑ์ตรวจ: "+t.key,""));
  if(m.pages>1)lines.push("กิจกรรมเสริมหน้าถัดไป","เกณฑ์ตรวจ: พิจารณาความสอดคล้องกับเรื่อง "+m.topic+" และตัวชี้วัด "+(m.indicator||"-")+" โดยใช้หลักฐานจากการเรียนรู้จริง");
  return lines.join("\n")
}
function downloadMaterialDocx(){const m=materialModel();if(!m)return;const txt=materialEditedText()||materialStudentText();saveBlob(makeDocxBlobBranded(m.title,txt,m.schoolLogo,m.teacherPhoto,m.style),safeFilename(m.title)+".docx");$("materialStudioStatus").innerHTML='<div class="indicator-preview">ดาวน์โหลด Word สำหรับนักเรียนสำเร็จ ✓</div>';toast("ดาวน์โหลด Word แล้ว ✓")}
async function downloadMaterialPdf(){const m=materialModel();if(!m)return;const txt=materialEditedText()||materialStudentText();saveBlob(await makePdfBlobBranded(txt,m.schoolLogo,m.teacherPhoto,m.style),safeFilename(m.title)+".pdf");$("materialStudioStatus").innerHTML='<div class="indicator-preview">ดาวน์โหลด PDF สำหรับนักเรียนสำเร็จ ✓</div>';toast("ดาวน์โหลด PDF แล้ว ✓")}
async function blobBytes(blob){return new Uint8Array(await blob.arrayBuffer())}
async function downloadTeachingPack(){
  if(!activeWorkspacePlan)return toast("กรุณาเลือกแผนก่อน");
  const prevType=materialType,prevMode=materialPreviewMode,prevEdit=materialEditedHtml;
  try{
    materialEditedHtml="";materialPreviewMode="student";
    materialType="worksheet";const wm=materialModel();const wText=materialStudentText();const keyText=materialTeacherText();
    materialType="knowledge";const km=materialModel();const kText=materialStudentText();
    const planTitle=activeWorkspacePlan.title||"แผนการจัดการเรียนรู้";
    const planText=[planTitle,"",activeWorkspacePlan.prompt_text||"",activeWorkspacePlan.reflection_text?"\nบันทึกหลังสอน\n"+activeWorkspacePlan.reflection_text:""].join("\n");
    const logo=profile?.school_logo_url||null,teacher=profile?.teacher_photo_url||profile?.avatar_url||null;
    const files=[];
    files.push(["01-"+safeFilename(planTitle)+".docx",await blobBytes(makeDocxBlobBranded(planTitle,planText,logo,teacher))]);
    files.push(["01-"+safeFilename(planTitle)+".pdf",await blobBytes(await makePdfBlobBranded(planText,logo,teacher))]);
    files.push(["02-"+safeFilename(wm.title)+".docx",await blobBytes(makeDocxBlobBranded(wm.title,wText,wm.schoolLogo,wm.teacherPhoto,wm.style))]);
    files.push(["02-"+safeFilename(wm.title)+".pdf",await blobBytes(await makePdfBlobBranded(wText,wm.schoolLogo,wm.teacherPhoto,wm.style))]);
    files.push(["03-"+safeFilename(km.title)+".docx",await blobBytes(makeDocxBlobBranded(km.title,kText,km.schoolLogo,km.teacherPhoto,km.style))]);
    files.push(["03-"+safeFilename(km.title)+".pdf",await blobBytes(await makePdfBlobBranded(kText,km.schoolLogo,km.teacherPhoto,km.style))]);
    files.push(["04-"+safeFilename("เฉลย-"+wm.title)+".docx",await blobBytes(makeDocxBlobBranded("เฉลย "+wm.title,keyText,wm.schoolLogo,wm.teacherPhoto,wm.style))]);
    files.push(["04-"+safeFilename("เฉลย-"+wm.title)+".pdf",await blobBytes(await makePdfBlobBranded(keyText,wm.schoolLogo,wm.teacherPhoto,wm.style))]);
    const qm=quizModel(),qText=quizStudentText(),qKey=quizKeyText();
    if(qm){
      files.push(["05-"+safeFilename(qm.title)+".docx",await blobBytes(makeDocxBlobBranded(qm.title,qText,qm.schoolLogo,qm.teacherPhoto,qm.style))]);
      files.push(["05-"+safeFilename(qm.title)+".pdf",await blobBytes(await makePdfBlobBranded(qText,qm.schoolLogo,qm.teacherPhoto,qm.style))]);
      files.push(["06-"+safeFilename("เฉลย-"+qm.title)+".docx",await blobBytes(makeDocxBlobBranded("เฉลย "+qm.title,qKey,qm.schoolLogo,qm.teacherPhoto,qm.style))]);
      files.push(["06-"+safeFilename("เฉลย-"+qm.title)+".pdf",await blobBytes(await makePdfBlobBranded(qKey,qm.schoolLogo,qm.teacherPhoto,qm.style))]);
      const rm=rubricModel(),rText=rubricText();
      if(rm){
        files.push(["07-"+safeFilename(rm.title)+".docx",await blobBytes(makeDocxBlobBranded(rm.title,rText,rm.schoolLogo,rm.teacherPhoto,rm.style))]);
        files.push(["07-"+safeFilename(rm.title)+".pdf",await blobBytes(await makePdfBlobBranded(rText,rm.schoolLogo,rm.teacherPhoto,rm.style))]);
        const gm=gameModel(),gText=gameText(),gKey=gameKeyText();
        if(gm){
          files.push(["08-"+safeFilename(gm.title)+".docx",await blobBytes(makeDocxBlobBranded(gm.title,gText,gm.schoolLogo,gm.teacherPhoto,gm.style))]);
          files.push(["08-"+safeFilename(gm.title)+".pdf",await blobBytes(await makePdfBlobBranded(gText,gm.schoolLogo,gm.teacherPhoto,gm.style))]);
          files.push(["09-"+safeFilename("เฉลย-"+gm.title)+".docx",await blobBytes(makeDocxBlobBranded("เฉลย "+gm.title,gKey,gm.schoolLogo,gm.teacherPhoto,gm.style))]);
          files.push(["09-"+safeFilename("เฉลย-"+gm.title)+".pdf",await blobBytes(await makePdfBlobBranded(gKey,gm.schoolLogo,gm.teacherPhoto,gm.style))]);
        }
      }
    }
    saveBlob(zipStored(files,"application/zip"),safeFilename("Teaching-Pack-"+materialTopic(activeWorkspacePlan))+".zip");
    toast("ดาวน์โหลด Teaching Pack แล้ว ✓")
  }catch(e){console.error(e);toast("สร้าง Teaching Pack ไม่สำเร็จ")}
  finally{materialType=prevType;materialPreviewMode=prevMode;materialEditedHtml=prevEdit}
}
function downloadTeacherKeyDocx(){const m=materialModel();if(!m||m.type!=="worksheet")return;saveBlob(makeDocxBlobBranded("เฉลย "+m.title,materialTeacherText(),m.schoolLogo,m.teacherPhoto,m.style),safeFilename("เฉลย-"+m.title)+".docx");toast("ดาวน์โหลด Word เฉลยครูแล้ว ✓")}
async function downloadTeacherKeyPdf(){const m=materialModel();if(!m||m.type!=="worksheet")return;saveBlob(await makePdfBlobBranded(materialTeacherText(),m.schoolLogo,m.teacherPhoto,m.style),safeFilename("เฉลย-"+m.title)+".pdf");toast("ดาวน์โหลด PDF เฉลยครูแล้ว ✓")}
function openCourseModal(){if($("courseSchool"))$("courseSchool").value=profile?.school_name||"";$("courseModal").hidden=false}
function closeCourseModal(){$("courseModal").hidden=true}
function saveCourseDraft(){const name=$("courseName").value.trim(),grade=$("courseGrade").value.trim(),subject=$("courseSubject").value.trim(),year=$("courseYear").value.trim();if(!name||!grade||!subject||!year){$("courseStatus").innerHTML='<div class="error-box">กรุณากรอกชื่อรายวิชา ระดับชั้น กลุ่มสาระ/วิชา และปีการศึกษา</div>';return}const a=courseDrafts();a.unshift({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name,grade,subject,semester:$("courseSemester").value,year,hours:$("courseHours").value,school:$("courseSchool").value.trim(),created_at:new Date().toISOString()});writeCourseDrafts(a);closeCourseModal();renderCourses();toast(courseCloudReady?"บันทึกรายวิชาและเตรียมซิงก์ Cloud แล้ว ✓":"บันทึกรายวิชาในเครื่องแล้ว ✓")}

function bind(){
  $$(".stage-btn").forEach(b=>b.onclick=()=>{stage=b.dataset.stage;$$(".stage-btn").forEach(x=>x.classList.toggle("active",x===b));buildGrades();updateSummary()});
  $("grade").onchange=buildSubjects;$("subject").onchange=buildIndicators;$("indicatorSearch").oninput=buildIndicators;$("indicator").onchange=chooseIndicator;
  ["unitName","topic","duration","method","semester","academicYear","teachingDate","teacherName","teacherPosition","schoolName","organization","province","studentCount","teacherSignatureName","directorName","directorPosition","approvalLayout","customStyleDirection","customAffiliationNote"].forEach(id=>$(id).oninput=()=>{
  if(id==="unitName"&&$("unitName").value.trim()!==autoUnitValue)autoUnitValue="";
  if(id==="topic"&&$("topic").value.trim()!==autoTopicValue)autoTopicValue="";
  updateSummary()
});
  ["planDensity","planIconStyle","planBackground","planSectionFrame","planDecorationLevel","planTeacherPlacement"].forEach(id=>{if($(id))$(id).onchange=updateSummary});
  document.querySelectorAll('input[name="planTeacherImageStyleSource"]').forEach(r=>r.onchange=()=>{planTeacherImageSource=r.value;if($("planTeacherStyleUploadWrap"))$("planTeacherStyleUploadWrap").hidden=planTeacherImageSource!=="upload";syncTeacherSourceControls();updateSummary()});
  if($("planTeacherStyleUpload"))$("planTeacherStyleUpload").onchange=async e=>{const f=e.target.files?.[0];if(!f)return;planTeacherImageData=await fileToDataUrl(f);planTeacherImageSource="upload";syncTeacherSourceControls();updateSummary()};
  document.querySelectorAll('input[name="planSchoolLogoSource"]').forEach(r=>r.onchange=()=>{planSchoolLogoSource=r.value;if($("planSchoolLogoUploadWrap"))$("planSchoolLogoUploadWrap").hidden=planSchoolLogoSource!=="upload";updateSummary()});
  if($("planSchoolLogoUpload"))$("planSchoolLogoUpload").onchange=async e=>{const f=e.target.files?.[0];if(!f)return;planSchoolLogoData=await fileToDataUrl(f);planSchoolLogoSource="upload";document.querySelectorAll('input[name="planSchoolLogoSource"]').forEach(r=>r.checked=r.value==="upload");updateSummary()};
  document.querySelectorAll('input[name="planQrSource"]').forEach(r=>r.onchange=()=>{planQrSource=r.value;if($("planQrUploadWrap"))$("planQrUploadWrap").hidden=planQrSource!=="upload";updateSummary()});
  if($("planQrUpload"))$("planQrUpload").onchange=async e=>{const f=e.target.files?.[0];if(!f)return;planQrData=await fileToDataUrl(f);planQrSource="upload";document.querySelectorAll('input[name="planQrSource"]').forEach(r=>r.checked=r.value==="upload");updateSummary()};
  syncTeacherSourceControls();
  $("affiliationType").onchange=()=>{$("affiliationType").dataset.userChanged="1";renderAffiliation()};
  $("generateBtn").onclick=generate;$("copyPromptBtn").onclick=copy;
  if($("refreshDirectPreviewBtn"))$("refreshDirectPreviewBtn").onclick=renderDirectPlanPreview;
  if($("downloadDirectPlanPdfBtn"))$("downloadDirectPlanPdfBtn").onclick=downloadDirectPlanPdf;
  if($("downloadTeacherRefBtn"))$("downloadTeacherRefBtn").onclick=()=>saveSourceFile(profileTeacherRef(),"Teacher-Reference");
  if($("downloadLogoRefBtn"))$("downloadLogoRefBtn").onclick=()=>saveSourceFile(profileLogoRef(),"School-Logo");
  if($("downloadAiPackBtn"))$("downloadAiPackBtn").onclick=downloadAiPack;
  if($("aiQrUpload"))$("aiQrUpload").onchange=async e=>{const f=e.target.files?.[0];if(!f)return;planQrData=await fileToDataUrl(f);renderAiAttachmentKit();toast("เพิ่ม QR สำหรับชุดแนบแล้ว ✓")};
  $$(".top-tab").forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));$$("[data-bottom-tab]").forEach(b=>b.onclick=()=>switchTab(b.dataset.bottomTab));
  if($("newCourseBtn"))$("newCourseBtn").onclick=openCourseModal;if($("syncCoursesBtn"))$("syncCoursesBtn").onclick=()=>syncCoursesToCloud();if($("closeCourseBtn"))$("closeCourseBtn").onclick=closeCourseModal;if($("courseBackdrop"))$("courseBackdrop").onclick=closeCourseModal;if($("saveCourseDraftBtn"))$("saveCourseDraftBtn").onclick=saveCourseDraft;if($("closeCurriculumAnalysisBtn"))$("closeCurriculumAnalysisBtn").onclick=closeCurriculumAnalysis;if($("curriculumAnalysisBackdrop"))$("curriculumAnalysisBackdrop").onclick=closeCurriculumAnalysis;if($("curriculumAnalysisSearch"))$("curriculumAnalysisSearch").oninput=renderCurriculumIndicators;if($("selectAllCurriculumBtn"))$("selectAllCurriculumBtn").onclick=()=>{$$('#curriculumIndicatorList input[type="checkbox"]').forEach(x=>x.checked=true);updateCurriculumSelectedSummary()};if($("saveCurriculumAnalysisBtn"))$("saveCurriculumAnalysisBtn").onclick=saveCurriculumAnalysis;if($("closeCourseDescriptionBtn"))$("closeCourseDescriptionBtn").onclick=closeCourseDescription;if($("courseDescriptionBackdrop"))$("courseDescriptionBackdrop").onclick=closeCourseDescription;if($("generateCourseDescriptionBtn"))$("generateCourseDescriptionBtn").onclick=generateCourseDescription;if($("saveCourseDescriptionBtn"))$("saveCourseDescriptionBtn").onclick=saveCourseDescription;if($("closeCourseStructureBtn"))$("closeCourseStructureBtn").onclick=closeCourseStructure;if($("courseStructureBackdrop"))$("courseStructureBackdrop").onclick=closeCourseStructure;if($("generateCourseStructureBtn"))$("generateCourseStructureBtn").onclick=generateCourseStructure;if($("saveCourseStructureBtn"))$("saveCourseStructureBtn").onclick=saveCourseStructure;if($("closeTeachingScheduleBtn"))$("closeTeachingScheduleBtn").onclick=closeTeachingSchedule;if($("teachingScheduleBackdrop"))$("teachingScheduleBackdrop").onclick=closeTeachingSchedule;if($("generateTeachingScheduleBtn"))$("generateTeachingScheduleBtn").onclick=generateTeachingSchedule;if($("saveTeachingScheduleBtn"))$("saveTeachingScheduleBtn").onclick=saveTeachingSchedule;if($("closeLearningUnitsBtn"))$("closeLearningUnitsBtn").onclick=closeLearningUnits;if($("learningUnitsBackdrop"))$("learningUnitsBackdrop").onclick=closeLearningUnits;if($("generateLearningUnitsBtn"))$("generateLearningUnitsBtn").onclick=generateLearningUnits;if($("saveLearningUnitsBtn"))$("saveLearningUnitsBtn").onclick=saveLearningUnits;if($("closeCourseLessonsBtn"))$("closeCourseLessonsBtn").onclick=closeCourseLessons;if($("courseLessonsBackdrop"))$("courseLessonsBackdrop").onclick=closeCourseLessons;if($("closeCourseAssessmentsBtn"))$("closeCourseAssessmentsBtn").onclick=closeCourseAssessments;if($("courseAssessmentsBackdrop"))$("courseAssessmentsBackdrop").onclick=closeCourseAssessments;if($("closeCourseDocumentsBtn"))$("closeCourseDocumentsBtn").onclick=closeCourseDocuments;if($("closeCourseReadinessBtn"))$("closeCourseReadinessBtn").onclick=closeCourseReadiness;if($("courseReadinessBackdrop"))$("courseReadinessBackdrop").onclick=closeCourseReadiness;if($("courseDocumentsBackdrop"))$("courseDocumentsBackdrop").onclick=closeCourseDocuments;if($("downloadCourseDocxBtn"))$("downloadCourseDocxBtn").onclick=downloadCourseDocx;if($("downloadCoursePdfBtn"))$("downloadCoursePdfBtn").onclick=downloadCoursePdf;
  $$("[data-scroll]").forEach(b=>b.onclick=()=>document.getElementById(b.dataset.scroll)?.scrollIntoView({behavior:"smooth",block:"start"}));
  $("libraryStage").onchange=updateLibraryFilters;$("libraryGrade").onchange=updateLibrarySubjects;$("librarySubject").onchange=applyLibraryFilters;$("librarySearch").oninput=applyLibraryFilters;$("useLibraryIndicatorBtn").onclick=useLibraryIndicator;
  $("includeTeachingDate").onchange=()=>{$("teachingDateFields").hidden=!$("includeTeachingDate").checked;updateSummary()};
  $("includeSignatures").onchange=()=>{$("signatureFields").hidden=!$("includeSignatures").checked;updateSummary()};
  $$("[data-style-hint]").forEach(b=>b.onclick=()=>{const t=$("customStyleDirection");t.value=(t.value?t.value+" · ":"")+b.dataset.styleHint;updateSummary()});
  $$("[data-help-type]").forEach(b=>b.onclick=()=>{$$(" [data-help-type]".trim()).forEach(x=>x.classList.toggle("active",x===b));$("helpType").value=b.dataset.helpType});$("sendHelpBtn").onclick=sendHelp;
  if($("planSearch"))$("planSearch").oninput=renderWork;if($("planGradeFilter"))$("planGradeFilter").onchange=renderWork;if($("planSubjectFilter"))$("planSubjectFilter").onchange=renderWork;if($("refreshPlansBtn"))$("refreshPlansBtn").onclick=loadCloudPlans;if($("closePlanWorkspaceBtn"))$("closePlanWorkspaceBtn").onclick=closeWorkspacePlan;if($("planWorkspaceBackdrop"))$("planWorkspaceBackdrop").onclick=closeWorkspacePlan;if($("workspaceWorksheetBtn"))$("workspaceWorksheetBtn").onclick=()=>openMaterialStudio("worksheet");if($("workspaceKnowledgeBtn"))$("workspaceKnowledgeBtn").onclick=()=>openMaterialStudio("knowledge");if($("workspaceQuizBtn"))$("workspaceQuizBtn").onclick=openQuizStudio;if($("workspaceRubricBtn"))$("workspaceRubricBtn").onclick=openRubricStudio;if($("workspaceGameBtn"))$("workspaceGameBtn").onclick=openGameStudio;if($("workspacePackBtn"))$("workspacePackBtn").onclick=downloadTeachingPack;if($("workspaceResourceLibraryBtn"))$("workspaceResourceLibraryBtn").onclick=openResourceLibrary;if($("globalResourceSearch"))$("globalResourceSearch").oninput=renderGlobalResourceLibrary;if($("globalResourceType"))$("globalResourceType").onchange=renderGlobalResourceLibrary;if($("globalResourceSubject"))$("globalResourceSubject").onchange=renderGlobalResourceLibrary;if($("refreshResourceLibraryBtn"))$("refreshResourceLibraryBtn").onclick=()=>{populateGlobalResourceSubjects();renderGlobalResourceLibrary()};if($("closeResourceLibraryBtn"))$("closeResourceLibraryBtn").onclick=closeResourceLibrary;if($("resourceLibraryBackdrop"))$("resourceLibraryBackdrop").onclick=closeResourceLibrary;if($("saveMaterialLibraryBtn"))$("saveMaterialLibraryBtn").onclick=saveCurrentMaterialLibrary;if($("saveQuizLibraryBtn"))$("saveQuizLibraryBtn").onclick=saveCurrentQuizLibrary;if($("saveRubricLibraryBtn"))$("saveRubricLibraryBtn").onclick=saveCurrentRubricLibrary;if($("saveGameLibraryBtn"))$("saveGameLibraryBtn").onclick=saveCurrentGameLibrary;if($("closeGameStudioBtn"))$("closeGameStudioBtn").onclick=closeGameStudio;if($("gameStudioBackdrop"))$("gameStudioBackdrop").onclick=closeGameStudio;if($("gameType"))$("gameType").onchange=()=>{gameEditedHtml="";renderGamePreview();scheduleResourceAutosave("game")};if($("gameCount"))$("gameCount").onchange=()=>{gameEditedHtml="";renderGamePreview();scheduleResourceAutosave("game")};if($("gameMode"))$("gameMode").onchange=()=>{gameEditedHtml="";renderGamePreview();scheduleResourceAutosave("game")};if($("gameStudentViewBtn"))$("gameStudentViewBtn").onclick=()=>{gameViewMode="student";gameEditedHtml="";gameEditing=false;renderGamePreview()};if($("gameKeyViewBtn"))$("gameKeyViewBtn").onclick=()=>{gameViewMode="key";gameEditedHtml="";gameEditing=false;renderGamePreview()};if($("toggleGameEditBtn"))$("toggleGameEditBtn").onclick=toggleGameEdit;if($("gamePreview"))$("gamePreview").oninput=()=>{if(gameEditing){gameEditedHtml=$("gamePreview").innerHTML;scheduleResourceAutosave("game")}};if($("downloadGameDocxBtn"))$("downloadGameDocxBtn").onclick=downloadGameDocx;if($("downloadGamePdfBtn"))$("downloadGamePdfBtn").onclick=downloadGamePdf;if($("downloadGameKeyDocxBtn"))$("downloadGameKeyDocxBtn").onclick=downloadGameKeyDocx;if($("downloadGameKeyPdfBtn"))$("downloadGameKeyPdfBtn").onclick=downloadGameKeyPdf;if($("closeRubricStudioBtn"))$("closeRubricStudioBtn").onclick=closeRubricStudio;if($("rubricStudioBackdrop"))$("rubricStudioBackdrop").onclick=closeRubricStudio;if($("rubricType"))$("rubricType").onchange=()=>{rubricEditedHtml="";renderRubricPreview();scheduleResourceAutosave("rubric")};if($("rubricCriteriaCount"))$("rubricCriteriaCount").onchange=()=>{rubricEditedHtml="";renderRubricPreview();scheduleResourceAutosave("rubric")};if($("rubricMaxScore"))$("rubricMaxScore").onchange=()=>{rubricEditedHtml="";renderRubricPreview();scheduleResourceAutosave("rubric")};if($("toggleRubricEditBtn"))$("toggleRubricEditBtn").onclick=toggleRubricEdit;if($("rubricPreview"))$("rubricPreview").oninput=()=>{if(rubricEditing){rubricEditedHtml=$("rubricPreview").innerHTML;scheduleResourceAutosave("rubric")}};if($("downloadRubricDocxBtn"))$("downloadRubricDocxBtn").onclick=downloadRubricDocx;if($("downloadRubricPdfBtn"))$("downloadRubricPdfBtn").onclick=downloadRubricPdf;if($("closeQuizStudioBtn"))$("closeQuizStudioBtn").onclick=closeQuizStudio;if($("quizStudioBackdrop"))$("quizStudioBackdrop").onclick=closeQuizStudio;if($("quizCount"))$("quizCount").onchange=()=>{quizEditedHtml="";renderQuizPreview();scheduleResourceAutosave("quiz")};if($("quizDifficulty"))$("quizDifficulty").onchange=()=>{quizEditedHtml="";renderQuizPreview();scheduleResourceAutosave("quiz")};if($("quizType"))$("quizType").onchange=()=>{quizEditedHtml="";renderQuizPreview();scheduleResourceAutosave("quiz")};if($("quizStudentViewBtn"))$("quizStudentViewBtn").onclick=()=>{quizViewMode="student";quizEditedHtml="";renderQuizPreview()};if($("quizKeyViewBtn"))$("quizKeyViewBtn").onclick=()=>{quizViewMode="key";quizEditedHtml="";renderQuizPreview()};if($("toggleQuizEditBtn"))$("toggleQuizEditBtn").onclick=toggleQuizEdit;if($("quizPreview"))$("quizPreview").oninput=()=>{if(quizEditing){quizEditedHtml=$("quizPreview").innerHTML;scheduleResourceAutosave("quiz")}};if($("downloadQuizDocxBtn"))$("downloadQuizDocxBtn").onclick=downloadQuizDocx;if($("downloadQuizPdfBtn"))$("downloadQuizPdfBtn").onclick=downloadQuizPdf;if($("downloadQuizKeyDocxBtn"))$("downloadQuizKeyDocxBtn").onclick=downloadQuizKeyDocx;if($("downloadQuizKeyPdfBtn"))$("downloadQuizKeyPdfBtn").onclick=downloadQuizKeyPdf;if($("closeMaterialStudioBtn"))$("closeMaterialStudioBtn").onclick=closeMaterialStudio;if($("materialStudioBackdrop"))$("materialStudioBackdrop").onclick=closeMaterialStudio;if($("materialTypeWorksheet"))$("materialTypeWorksheet").onclick=()=>{materialType="worksheet";renderMaterialPreview()};if($("materialTypeKnowledge"))$("materialTypeKnowledge").onclick=()=>{materialType="knowledge";renderMaterialPreview()};nodes("[data-material-style]").forEach(b=>b.onclick=()=>{materialStyle=b.dataset.materialStyle;renderMaterialPreview();scheduleResourceAutosave("material")});if($("materialStudentPlaceholder"))$("materialStudentPlaceholder").oninput=()=>{renderMaterialPreview();scheduleResourceAutosave("material")};if($("materialTaskCount"))$("materialTaskCount").onchange=()=>{renderMaterialPreview();scheduleResourceAutosave("material")};if($("materialPageCount"))$("materialPageCount").onchange=()=>{renderMaterialPreview();scheduleResourceAutosave("material")};if($("materialVisualCards"))$("materialVisualCards").onchange=()=>{renderMaterialPreview();scheduleResourceAutosave("material")};if($("toggleMaterialEditBtn"))$("toggleMaterialEditBtn").onclick=toggleMaterialEdit;if($("resetMaterialEditBtn"))$("resetMaterialEditBtn").onclick=resetMaterialEdit;if($("materialPreview"))$("materialPreview").oninput=()=>{if(materialEditing){materialEditedHtml=$("materialPreview").innerHTML;if($("resetMaterialEditBtn"))$("resetMaterialEditBtn").hidden=false;scheduleResourceAutosave("material")}};if($("previewStudentMaterialBtn"))$("previewStudentMaterialBtn").onclick=()=>{materialPreviewMode="student";materialEditedHtml="";materialEditing=false;renderMaterialPreview()};if($("previewTeacherKeyBtn"))$("previewTeacherKeyBtn").onclick=()=>{materialPreviewMode="teacher";materialEditedHtml="";materialEditing=false;renderMaterialPreview()};if($("downloadTeacherKeyDocxBtn"))$("downloadTeacherKeyDocxBtn").onclick=downloadTeacherKeyDocx;if($("downloadTeacherKeyPdfBtn"))$("downloadTeacherKeyPdfBtn").onclick=downloadTeacherKeyPdf;if($("downloadMaterialDocxBtn"))$("downloadMaterialDocxBtn").onclick=downloadMaterialDocx;if($("downloadMaterialPdfBtn"))$("downloadMaterialPdfBtn").onclick=downloadMaterialPdf;if($("workspaceWordBtn"))$("workspaceWordBtn").onclick=()=>activeWorkspacePlan&&downloadWord(activeWorkspacePlan);if($("workspacePdfBtn"))$("workspacePdfBtn").onclick=()=>activeWorkspacePlan&&printPlanPdf(activeWorkspacePlan);if($("saveReflectionBtn"))$("saveReflectionBtn").onclick=saveReflection;if($("deleteCloudPlanBtn"))$("deleteCloudPlanBtn").onclick=deleteCloudPlan;if($("reusePlanBtn"))$("reusePlanBtn").onclick=()=>{if(!activeWorkspacePlan)return;switchTab("create");$("promptText").textContent=activeWorkspacePlan.prompt_text||"";$("promptWrap").hidden=false;closeWorkspacePlan();setTimeout(()=>$("promptWrap").scrollIntoView({behavior:"smooth"}),80)};if($("duplicatePlanBtn"))$("duplicatePlanBtn").onclick=duplicateActivePlan;if($("nextPlanBtn"))$("nextPlanBtn").onclick=nextPlanFromActive;
  $("profileBtn").onclick=openProfile;$("closeProfileBtn").onclick=closeProfile;$("profileBackdrop").onclick=closeProfile;
  nodes("[data-avatar]").forEach(b=>b.onclick=()=>{profilePhotoSource="";profilePhotoZoom=1;profilePhotoX=0;profilePhotoY=0;profile.avatar_url=b.dataset.avatar;renderProfile()});
  $("profilePhoto").onchange=async e=>{const f=e.target.files?.[0];if(f){profilePhotoSource=await fileToDataUrl(f);resetProfilePhotoEditor();$("profileStatus").innerHTML='<div class="indicator-preview">เลือกรูปแล้ว ลาก/ซูม/เลื่อนได้ จากนั้นกด “บันทึกโปรไฟล์”</div>'}};
  if($("teacherPhotoUpload"))$("teacherPhotoUpload").onchange=async e=>{const f=e.target.files?.[0];if(f){profile.teacher_photo_url=await compress(f);renderProfile()}};
  if($("schoolLogoUpload"))$("schoolLogoUpload").onchange=async e=>{const f=e.target.files?.[0];if(f){profile.school_logo_url=await compress(f);renderProfile()}};
  if($("profilePhotoZoom"))$("profilePhotoZoom").oninput=e=>{profilePhotoZoom=Number(e.target.value||100)/100;renderProfilePhotoEditor()};
  if($("profilePhotoX"))$("profilePhotoX").oninput=e=>{profilePhotoX=Number(e.target.value||0);renderProfilePhotoEditor()};
  if($("profilePhotoY"))$("profilePhotoY").oninput=e=>{profilePhotoY=Number(e.target.value||0);renderProfilePhotoEditor()};
  if($("resetProfilePhotoBtn"))$("resetProfilePhotoBtn").onclick=resetProfilePhotoEditor;
  bindProfilePhotoDrag();
  $("saveProfileBtn").onclick=async()=>{
  const adjustedAvatar=profilePhotoSource?await cropProfilePhotoDataUrl(profilePhotoSource,profilePhotoZoom,profilePhotoX,profilePhotoY):(profile.avatar_url||null);
  const payload={full_name:v("profileDisplayName"),school_name:v("profileSchool")||null,avatar_url:adjustedAvatar,teacher_photo_url:profile.teacher_photo_url||null,school_logo_url:profile.school_logo_url||null};
  const metadata={full_name:payload.full_name,school_name:payload.school_name,teacher_position:v("profileTeacherPosition")||"",affiliation_type:$("profileAffiliationType").value||"obec",organization:v("profileOrganization")||"",province:v("profileProvince")||"",student_count:v("profileStudentCount")?Number(v("profileStudentCount")):null};
  $("saveProfileBtn").disabled=true;
  const [profileResult,authResult]=await Promise.all([
    sb.from("profiles").update(payload).eq("id",user.id),
    sb.auth.updateUser({data:metadata})
  ]);
  $("saveProfileBtn").disabled=false;
  const error=profileResult.error||authResult.error;
  if(error)return $("profileStatus").innerHTML=`<div class="error-box">${esc(error.message)}</div>`;
  Object.assign(profile,payload);profilePhotoSource="";profilePhotoZoom=1;profilePhotoX=0;profilePhotoY=0;user={...user,user_metadata:{...(user.user_metadata||{}),...metadata}};
  renderProfile();applyTeacherDefaults(true);
  $("profileStatus").innerHTML='<div class="indicator-preview">บันทึกแล้ว ✓ ข้อมูลผู้สอนถูกตั้งเป็นค่าเริ่มต้นสำหรับแผนใหม่</div>'
};
  $("logoutBtn").onclick=async()=>{await sb.auth.signOut();location.replace("/teacher.html")};
  $$(".dest-tab").forEach(b=>b.onclick=()=>{$$(".dest-tab").forEach(x=>x.classList.toggle("active",x===b));$$(".dest-panel").forEach(x=>x.classList.toggle("active",x.id===`dest-${b.dataset.dest}`))});
  $$("[data-open]").forEach(b=>b.onclick=async()=>{await copy();window.open(b.dataset.open,"_blank","noopener")});
  $("openWordBtn").onclick=async()=>{await copy();window.open("https://www.office.com/launch/word","_blank","noopener")};
  $("savePdfBtn").onclick=()=>{const t=$("promptText").textContent;if(!t)return toast("ยังไม่มี Prompt");saveBlob(makePdfBlob("Klang Plan — Prompt\n\n"+t),"Klang-Plan-Prompt.pdf")}
}
async function start(){try{const ok=await auth();if(!ok)return;bind();await withTimeout(loadData(),10000,"โหลดฐานหลักสูตร");await Promise.allSettled([withTimeout(loadCloudPlans(),8000,"โหลดคลังแผน"),withTimeout(loadCoursesFromCloud(),8000,"โหลดรายวิชา"),withTimeout(loadResourceLibraryFromCloud(),8000,"โหลดคลังงาน")]);renderCourses();$("loadingGate").classList.add("hidden");$("appShell").classList.remove("is-loading")}catch(e){console.error(e);$("loadingGate").innerHTML=`<div class="error-box"><b>เปิดระบบไม่สำเร็จ</b><br>${esc(e.message||"เกิดข้อผิดพลาดในการเชื่อมต่อ")}<br><br><button onclick="location.reload()" class="secondary-btn">ลองใหม่</button><br><small>หากอินเทอร์เน็ตช้า ระบบจะหยุดรอแทนการค้างหน้าจอ</small></div>`}}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",start,{once:true}):start();
})();