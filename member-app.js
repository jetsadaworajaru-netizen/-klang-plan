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
  syncTeacherSourceControls();
  $("affiliationType").onchange=()=>{$("affiliationType").dataset.userChanged="1";renderAffiliation()};
  $("generateBtn").onclick=generate;$("copyPromptBtn").onclick=copy;
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