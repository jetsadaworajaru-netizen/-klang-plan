const $=id=>document.getElementById(id);const CFG=window.KLANG_CONFIG||{};
function syncOptionalAuthControls(){
  const fb=$("facebookLoginBtn");
  if(fb)fb.style.display=CFG.facebookOAuthEnabled?"block":"none";
  const contact=$("contactPageBtn");
  if(contact)contact.style.display=CFG.salesContactUrl?"block":"none";
}
let DATA=[],ACTIVE_STAGE="ปฐมวัย",selectedTool="lesson",supabaseClient=null,currentUser=null,currentProfile=null;const grades={"ปฐมวัย":["อ.1","อ.2","อ.3"],"ประถมศึกษา":["ป.1","ป.2","ป.3","ป.4","ป.5","ป.6"],"มัธยมศึกษา":["ม.1","ม.2","ม.3","ม.4","ม.5","ม.6"]};const SUBJECT_ORDER=["ภาษาไทย","คณิตศาสตร์","วิทยาศาสตร์และเทคโนโลยี","สังคมศึกษา ศาสนาและวัฒนธรรม","สุขศึกษาและพลศึกษา","ศิลปะ","การงานอาชีพ","ภาษาต่างประเทศ (ภาษาอังกฤษ)","ปฐมวัย"];
const TOOLS=[{id:"lesson",icon:"📘",title:"แผนการสอนหน้าเดียว",desc:"Prompt แผนกระชับ ครบองค์ประกอบ และสอดคล้องตัวชี้วัด",tier:"member"},{id:"worksheet",icon:"📝",title:"ใบงาน",desc:"สร้างใบงานตามตัวชี้วัด พร้อมตัวเลือกชนิดงานและเฉลย",tier:"member"},{id:"exercise",icon:"✏️",title:"แบบฝึกหัด",desc:"แบบฝึกหลายระดับพร้อมเฉลยและเกณฑ์",tier:"member"},{id:"quiz",icon:"✅",title:"แบบทดสอบ",desc:"ก่อนเรียน/หลังเรียน พร้อมเฉลยและวิเคราะห์ตัวชี้วัด",tier:"member"},{id:"rubric",icon:"📊",title:"แบบประเมิน / Rubric",desc:"เกณฑ์ประเมินที่โยงกับพฤติกรรมตามตัวชี้วัด",tier:"member"},{id:"knowledge",icon:"📚",title:"ใบความรู้",desc:"สรุปความรู้ที่ตรงกับเรื่องและระดับชั้น",tier:"member"},{id:"game",icon:"🎮",title:"เกม / Active Learning",desc:"กิจกรรมเล่นได้จริงในคาบเรียน",tier:"member"},{id:"pack",icon:"🎁",title:"Teaching Pack",desc:"แผน + ใบงาน + ใบความรู้ + แบบประเมิน + แบบทดสอบ ในชุดเดียว",tier:"member"}];
const STYLE_PRESETS={
  "modern-government":{
    title:"ราชการโมเดิร์น",
    instruction:"Modern Thai Government Education Design, clean professional editorial layout, white and soft sky-blue base, navy headings, restrained champagne-gold accents, subtle Thai-inspired geometry only as decoration, formal but contemporary, high legibility."
  },
  "bright-primary":{
    title:"สดใสสำหรับประถม",
    instruction:"Bright Primary Education Design, fresh sky blue, mint, sunny yellow and coral accents, friendly rounded cards, playful but organized educational icons, cheerful classroom mood, highly readable Thai typography."
  },
  "cute-kids":{
    title:"น่ารักสำหรับเด็กเล็ก",
    instruction:"Cute Early Childhood Education Design, warm pastel palette, soft rounded shapes, friendly child-safe illustrations, gentle playful learning atmosphere, simple hierarchy and large readable Thai text."
  },
  "education-infographic":{
    title:"อินโฟกราฟิกอ่านง่าย",
    instruction:"Modern Education Infographic Design, strong information hierarchy, modular content cards, clean icons, visual timeline for activities, balanced whitespace, concise visual summaries and excellent Thai readability."
  },
  "premium-academic":{
    title:"พรีเมียมวิชาการ",
    instruction:"Premium Academic Editorial Design, elegant navy, pearl white, refined blue gradients and subtle gold accents, polished professional composition, sophisticated educational report aesthetic, premium but not overcrowded."
  },
  "3d-learning":{
    title:"3D สะดุดตา",
    instruction:"Modern 3D Learning Design, bright clean education theme, tasteful 3D books, pencils, learning objects and soft dimensional cards, blue-violet accents, energetic but professional, decorative 3D objects must never cover text."
  }
};
let selectedStyle="modern-government";
let selectedColorPair="ฟ้า–ม่วง–ทอง";
let teacherPhotoData="";
let schoolLogoData=""; // legacy: no longer used for lesson generation

function toast(t){const e=$("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1800)}function go(v){
  const target=$(v+"View");if(!target){console.warn("View not found",v);return}
  document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));
  target.classList.add("active");
  document.body.dataset.currentView=v;
  closeMobileMenus();
  syncMobileNav(v);
  const reduce=window.matchMedia("(max-width: 980px)").matches;
  window.scrollTo({top:0,behavior:reduce?"auto":"smooth"});
  if($("mobileGenerateShortcut"))$("mobileGenerateShortcut").classList.toggle("show",v==="generator");
  if(v==="admin")loadAdmin();
  if(v==="plans")renderMyPlans?.();
  if(v==="indicators")renderIndicatorLibrary?.();
  if(v==="styles")renderStylesLibrary?.()
}
function safeGoFromElement(el){const v=el?.dataset?.go;if(v)go(v)}
document.querySelectorAll("[data-stage-go]").forEach(b=>b.onclick=()=>{ACTIVE_STAGE=b.dataset.stageGo;go("generator");syncStageTabs();buildGrades()});
document.querySelectorAll("[data-tool-start]").forEach(b=>b.onclick=()=>{
  selectedTool=b.dataset.toolStart;
  go("generator");
  renderTools();
  renderOptions();
  revealFlowAfterTool(true);
});

function closeMobileMenus(){
  $("mobileWorkspaceMenu")?.classList.remove("open");
  $("mobileMoreSheet")?.classList.remove("open");
  $("mobileMoreSheet")?.setAttribute("aria-hidden","true");
  document.body.classList.remove("mobile-sheet-open")
}
function syncMobileNav(v){
  document.querySelectorAll("[data-mobile-go]").forEach(btn=>btn.classList.toggle("active",btn.dataset.mobileGo===v));
}
function openMobileSheet(){
  $("mobileMoreSheet")?.classList.add("open");
  $("mobileMoreSheet")?.setAttribute("aria-hidden","false");
  document.body.classList.add("mobile-sheet-open");
  const t=$("mobileMemberText");
  if(t)t.textContent=currentUser?(currentProfile?.full_name||currentUser.email||"สมาชิก Klang Plan"):"ยังไม่ได้เข้าสู่ระบบ";
  if($("mobileAdminBtn"))$("mobileAdminBtn").style.display=currentProfile?.role==="admin"?"flex":"none"
}
if($("mobileMoreBtn"))$("mobileMoreBtn").onclick=openMobileSheet;
if($("closeMobileSheet"))$("closeMobileSheet").onclick=closeMobileMenus;
if($("mobileSheetBackdrop"))$("mobileSheetBackdrop").onclick=closeMobileMenus;
if($("mobileAccountBtn"))$("mobileAccountBtn").onclick=()=>{
  closeMobileMenus();
  if(currentUser)logout();else openAuth("login")
};
if($("mobileAdminBtn"))$("mobileAdminBtn").onclick=()=>{closeMobileMenus();go("admin")};
document.querySelectorAll("[data-mobile-go]").forEach(btn=>btn.onclick=()=>go(btn.dataset.mobileGo));

document.addEventListener("click",e=>{
  const goEl=e.target.closest("[data-go]");
  if(goEl&&!goEl.closest("#mobileBottomNav")&&!goEl.closest("#mobileMoreSheet")){
    e.preventDefault();go(goEl.dataset.go)
  }
  const jump=e.target.closest("[data-jump-flow]");
  if(jump){
    const target=$(jump.dataset.jumpFlow);if(target)target.scrollIntoView({behavior:"smooth",block:"start"})
  }
},{passive:false});

if($("mobileGenerateShortcut"))$("mobileGenerateShortcut").onclick=()=>{
  const target=$("flowFinalStep");if(target)target.scrollIntoView({behavior:"smooth",block:"start"})
};

document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    closeMobileMenus();
    $("authModal")?.classList.remove("open")
  }
});
if($("authModal"))$("authModal").addEventListener("click",e=>{
  if(e.target===$("authModal"))$("authModal").classList.remove("open")
});

function makeTapSafe(root=document){
  root.querySelectorAll("button,.btn,.stage-tab,.grade-card,.indicator-select-card,.style-card,.smart-chip,.continue-tool,.result-item,[role=button]").forEach(el=>{
    el.style.webkitTapHighlightColor="transparent";
  })
}
makeTapSafe();
function backendReady(){return !!(CFG.supabaseUrl&&(CFG.supabasePublishableKey||CFG.supabaseAnonKey)&&window.supabase)}function initBackend(){if(!backendReady()){$("backendWarning").style.display="block";return}const key=CFG.supabasePublishableKey||CFG.supabaseAnonKey;supabaseClient=window.supabase.createClient(CFG.supabaseUrl,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});supabaseClient.auth.getSession().then(({data})=>applySession(data.session));supabaseClient.auth.onAuthStateChange((_e,s)=>applySession(s))}let applyingSessionFor="";
async function applySession(session){
  const uid=session?.user?.id||"";
  if(uid&&applyingSessionFor===uid&&currentProfile)return;
  applyingSessionFor=uid;
  currentUser=session?.user||null;currentProfile=null;if(currentUser){const {data,error}=await supabaseClient.from("profiles").select("id,email,full_name,school_name,facebook_name,phone,role,status,requested_role,invite_code,membership_started_at,membership_expires_at,approved_at,created_at").eq("id",currentUser.id).maybeSingle();if(error)console.error(error);currentProfile=data||null;
    const pendingInvite=localStorage.getItem("klangPendingInvite");
    if(pendingInvite&&currentProfile&&!currentProfile.invite_code){
      const {data:claimed,error:claimError}=await supabaseClient.rpc("claim_member_invite",{p_code:pendingInvite});
      if(!claimError&&claimed){currentProfile=Array.isArray(claimed)?claimed[0]:claimed;localStorage.removeItem("klangPendingInvite")}
      else if(claimError)console.error("claim invite",claimError)
    }
  }else{applyingSessionFor=""}renderAuthState()}
function renderAuthState(){const chip=$("memberChip"),admin=$("adminBtn"),btn=$("authBtn");if(!currentUser){chip.style.display="none";admin.style.display="none";btn.textContent="เข้าสู่ระบบ";btn.onclick=openAuth;if($("mobileAdminBtn"))$("mobileAdminBtn").style.display="none";return}chip.style.display="inline-block";const role=currentProfile?.role||"member",status=currentProfile?.status||"pending";chip.textContent=currentProfile?`${currentProfile.full_name||currentUser.email} · ${role}${status!=="active"?` · ${status}`:""}`:currentUser.email;admin.style.display=(currentProfile?.role==="admin")?"inline-block":"none";
const testBadge=$("adminTestBadge");if(testBadge)testBadge.style.display=currentProfile?.role==="admin"?"inline-flex":"none";
btn.textContent="ออกจากระบบ";btn.onclick=logout;if($("mobileAdminBtn"))$("mobileAdminBtn").style.display=currentProfile?.role==="admin"?"flex":"none"}
async function logout(){if(supabaseClient)await supabaseClient.auth.signOut();currentUser=null;currentProfile=null;renderAuthState();go("home")}
function openAuth(tab="login"){$("authModal").classList.add("open");switchAuth(tab)}
if($("authBtn"))$("authBtn").onclick=openAuth;
if($("facebookLoginBtn"))$("facebookLoginBtn").onclick=async()=>{
  if(!CFG.facebookOAuthEnabled){toast("Facebook Login เตรียมไว้แล้ว แต่ยังต้องเชื่อม Meta App กับ Supabase");return}
  if(!backendReady()){toast("ระบบสมาชิกยังเชื่อมต่อไม่สมบูรณ์");return}
  const code=$("regInvite")?.value?.trim()||new URLSearchParams(location.search).get("invite")||"";
  if(code)localStorage.setItem("klangPendingInvite",code);
  const {error}=await supabaseClient.auth.signInWithOAuth({provider:"facebook",options:{redirectTo:CFG.siteUrl||location.origin}});
  if(error)toast(error.message)
};
if($("contactPageBtn"))$("contactPageBtn").onclick=()=>{
  if(CFG.salesContactUrl)window.open(CFG.salesContactUrl,"_blank","noopener");
  else toast("ยังไม่ได้ตั้งค่าลิงก์เพจใน config.js")
};
if($("joinNow"))$("joinNow").onclick=()=>openAuth("register");
if($("closeAuth"))$("closeAuth").onclick=()=>$("authModal").classList.remove("open");document.querySelectorAll("[data-auth]").forEach(b=>b.onclick=()=>switchAuth(b.dataset.auth));function switchAuth(t){document.querySelectorAll(".auth-tab").forEach(x=>x.classList.toggle("active",x.dataset.auth===t));document.querySelectorAll(".auth-pane").forEach(x=>x.classList.toggle("active",x.id==="auth-"+t))}
$("loginBtn").onclick=async()=>{
  if(!backendReady()){msg("loginMsg","ยังไม่ได้เชื่อม Supabase","warn");return}
  const email=$("loginEmail").value.trim(),password=$("loginPassword").value;
  if(!email||!password){msg("loginMsg","กรุณากรอกอีเมลและรหัสผ่าน","warn");return}
  $("loginBtn").disabled=true;$("loginBtn").textContent="กำลังเข้าสู่ระบบ...";
  try{
    const {data,error}=await supabaseClient.auth.signInWithPassword({email,password});
    if(error){
      const t=(error.message||"").toLowerCase();
      if(t.includes("email not confirmed")) msg("loginMsg","อีเมลนี้ยังไม่ได้ยืนยัน กรุณาเปิดอีเมลยืนยันบัญชีก่อน แล้วกลับมาเข้าสู่ระบบ","warn");
      else if(t.includes("invalid login")) msg("loginMsg","อีเมลหรือรหัสผ่านไม่ถูกต้อง","warn");
      else msg("loginMsg",error.message,"warn");
      return
    }
    await applySession(data.session);
    const p=currentProfile;
    if(p?.status==="pending")msg("loginMsg","เข้าสู่ระบบแล้ว แต่บัญชียังรอแอดมินอนุมัติ","warn");
    else if(["suspended","expired"].includes(p?.status))msg("loginMsg","บัญชีนี้ยังไม่สามารถใช้งานได้ กรุณาติดต่อแอดมิน","warn");
    else if(p?.status==="active"){$("authModal").classList.remove("open");toast("เข้าสู่ระบบสำเร็จ")}
    else msg("loginMsg","กำลังตรวจสอบสถานะสมาชิก กรุณาลองใหม่อีกครั้ง","warn")
  }finally{$("loginBtn").disabled=false;$("loginBtn").textContent="เข้าสู่ระบบ"}
}
$("registerBtn").onclick=async()=>{
  if(!backendReady()){msg("registerMsg","ระบบสมาชิกยังเชื่อมต่อไม่สมบูรณ์","warn");return}
  const email=$("regEmail").value.trim(),
        password=$("regPassword").value,
        inviteCode=$("regInvite").value.trim(),
        teacherName=$("regName").value.trim();
  if(!email||!password||!teacherName||!inviteCode){
    msg("registerMsg","กรุณากรอกชื่อคุณครู อีเมล รหัสสมาชิก และรหัสผ่านให้ครบ","warn");return
  }
  if(password.length<6){msg("registerMsg","รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษร","warn");return}

  $("registerBtn").disabled=true;
  $("registerBtn").textContent="กำลังตรวจสอบรหัส...";
  try{
    const {data:check,error:checkError}=await supabaseClient.rpc("check_member_invite",{p_code:inviteCode});
    if(checkError){
      console.error(checkError);
      msg("registerMsg","ตรวจสอบรหัสไม่ได้ กรุณาลองใหม่อีกครั้ง","warn");return
    }
    if(!check?.valid){
      msg("registerMsg","รหัสสมาชิกไม่ถูกต้อง หมดอายุ หรือถูกใช้งานครบแล้ว กรุณาตรวจสอบลิงก์/รหัสที่ได้รับจากแอดมิน","warn");return
    }

    $("registerBtn").textContent="กำลังสมัครสมาชิก...";
    const meta={full_name:teacherName,school_name:"",phone:"",facebook_name:"",invite_code:inviteCode};
    const {data,error}=await supabaseClient.auth.signUp({
      email,password,
      options:{data:meta,emailRedirectTo:CFG.siteUrl||location.origin}
    });
    if(error){
      const text=(error.message||"").toLowerCase();
      if(text.includes("rate")||text.includes("seconds")){
        msg("registerMsg","ระบบส่งอีเมลถี่เกินไป กรุณารอสักครู่แล้วลองใหม่","warn")
      }else if(text.includes("invalid_or_expired_invite")){
        msg("registerMsg","รหัสสมาชิกหมดอายุหรือถูกใช้ไปแล้ว กรุณาขอลิงก์ใหม่จากแอดมิน","warn")
      }else{
        msg("registerMsg",error.message,"warn")
      }
      return
    }
    if(data.session){
      await applySession(data.session);
      if(currentProfile?.status==="active"){
        msg("registerMsg","สมัครสำเร็จ ✓ เปิดสิทธิ์ Member แล้ว เข้าใช้งานได้ทันที","ok");
        setTimeout(()=>$("authModal").classList.remove("open"),900)
      }else msg("registerMsg","สมัครสำเร็จ ✓ คำขออยู่ระหว่างรอแอดมินอนุมัติ","ok")
    }else{
      msg("registerMsg","สมัครสำเร็จ ✓ กรุณาเปิดอีเมลยืนยันบัญชี 1 ครั้ง แล้วกลับมาเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน","ok")
    }
  }finally{
    $("registerBtn").disabled=false;
    $("registerBtn").textContent="สมัครสมาชิก"
  }
};function msg(id,t,type){$(id).innerHTML=`<div class="alert ${type}">${t}</div>`}
const invite=new URLSearchParams(location.search).get("invite");
if(invite){
  $("regInvite").value=invite;
  $("regInvite").readOnly=true;
  $("regInvite").title="รหัสจากลิงก์ส่วนตัว";
  setTimeout(()=>openAuth("register"),350)
}
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
  $("grade").onchange=()=>{showAllIndicatorCards=false;renderGradeCards();buildSubjects();savePrefs()};
  renderGradeCards();
  buildSubjects()
}
function renderGradeCards(){
  const wrap=$("gradeCards");if(!wrap)return;
  const vals=[...$("grade").options].map(o=>o.value).filter(Boolean);
  const palette=["c1","c2","c3","c4","c5","c6","c7","c8","c9"];
  wrap.innerHTML=vals.map((g,i)=>`<button type="button" class="grade-card ${$("grade").value===g?"active":""} ${palette[i%palette.length]}" data-grade-card="${g}"><span>${g.includes("อ.")?"🧸":g.includes("ป.")?"📘":"🎓"}</span><b>${g}</b></button>`).join("");
  wrap.querySelectorAll("[data-grade-card]").forEach(btn=>btn.onclick=()=>{
    $("grade").value=btn.dataset.gradeCard;renderGradeCards();buildSubjects();savePrefs()
  })
}
function fill(el,arr){setSelectState(el,arr,"ไม่มีตัวเลือก")}
function buildSubjects(){
  const g=$("grade").value;
  if(!g){setSelectState($("subject"),[],"กรุณาเลือกระดับชั้น");setSelectState($("indicator"),[],"กรุณาเลือกกลุ่มสาระ");$("indicatorBox").textContent="เลือกระดับชั้นเพื่อดูข้อมูล";return}
  let arr=[...new Set(DATA.filter(r=>r.stage===ACTIVE_STAGE&&matchGrade(r,g)).map(r=>r.subject).filter(Boolean))];
  arr.sort((a,b)=>(SUBJECT_ORDER.indexOf(a)<0?99:SUBJECT_ORDER.indexOf(a))-(SUBJECT_ORDER.indexOf(b)<0?99:SUBJECT_ORDER.indexOf(b)));
  setSelectState($("subject"),arr,"ไม่พบกลุ่มสาระ");
  $("subject").onchange=()=>{showAllIndicatorCards=false;buildIndicators();savePrefs()};
  buildIndicators()
}
function rows(){
  const g=$("grade").value,s=$("subject").value;
  if(!g||!s)return[];
  return DATA.filter(r=>r.stage===ACTIVE_STAGE&&matchGrade(r,g)&&r.subject===s)
}
function renderIndicatorCards(){
  const wrap=$("indicatorCards");if(!wrap)return;
  const rs=rows(),current=Number($("indicator")?.value||0),selected=rs[current]||rs[0];
  const sameStandard=selected?.standard
    ? rs.filter(r=>r.standard===selected.standard)
    : rs;
  const visible=showAllIndicatorCards?sameStandard:sameStandard.slice(0,6);
  wrap.innerHTML=visible.map(r=>{
    const i=rs.findIndex(x=>x.dataset_id===r.dataset_id);
    return `<button type="button" class="indicator-select-card ${i===current?"active":""}" data-ind-card="${i}">
      <div><b>${r.indicator}</b>${r.classification?`<span>${r.classification}</span>`:""}</div>
      <small>${r.indicator_text}</small>
    </button>`
  }).join("") || '<div class="indicator-empty">ไม่พบตัวชี้วัดสำหรับตัวเลือกนี้</div>';
  if($("indicatorRecommendCount"))$("indicatorRecommendCount").textContent=`${sameStandard.length} รายการ`;
  const more=$("toggleMoreIndicators");
  if(more){
    more.style.display=sameStandard.length>6?"inline-flex":"none";
    more.textContent=showAllIndicatorCards?"ย่อรายการ ↑":`ดูเพิ่มเติมอีก ${Math.max(0,sameStandard.length-6)} รายการ ↓`;
    more.onclick=()=>{showAllIndicatorCards=!showAllIndicatorCards;renderIndicatorCards()}
  }
  wrap.querySelectorAll("[data-ind-card]").forEach(btn=>btn.onclick=()=>{
    $("indicator").value=btn.dataset.indCard;syncRecord()
  })
}
function buildIndicators(){
  const rs=rows(),el=$("indicator");el.innerHTML="";
  if(!rs.length){setSelectState(el,[],"ไม่พบตัวชี้วัด");$("indicatorBox").textContent="ไม่พบข้อมูลที่สัมพันธ์กับตัวเลือกนี้";renderIndicatorCards();renderSummary();return}
  rs.forEach((r,i)=>{const o=document.createElement("option");o.value=i;o.textContent=`${r.indicator}${r.classification?` [${r.classification}]`:""} — ${r.indicator_text}`;el.appendChild(o)});
  el.disabled=false;el.onchange=syncRecord;syncRecord()
}
function record(){return rows()[Number($("indicator").value||0)]||{}}function syncRecord(){const r=record();$("indicatorBox").innerHTML=r.indicator?`<b>${r.indicator}</b>${r.classification?` · ${r.classification}`:""}<br>${r.indicator_text}`:"ไม่มีข้อมูล";$("topic").placeholder=r.domain?`เช่น หัวข้อใน ${r.domain}`:"เช่น เรื่องที่ต้องการจัดการเรียนรู้";renderIndicatorCards();renderSummary()}["unitName","topic","duration","customDuration","method","customMethod","context","teacherName","teacherPosition","schoolName","organization","province","semester","academicYear","studentCount","learningApproach","teachDate","teacherSignName","directorName","directorPosition"].forEach(id=>{
  const el=$(id);if(el)el.addEventListener(["unitName","topic","customDuration","customMethod","context","teacherName","teacherPosition","schoolName","organization","province","academicYear","studentCount"].includes(id)?"input":"change",renderSummary)
});
function renderSummary(){
  const r=record()||{},c=common();
  const unit=c.unitName||"ยังไม่ระบุ";
  $("summary").innerHTML=`<b>ตรวจสอบก่อนสร้าง</b>
    <div class="review-grid">
      <span><small>หลักสูตร</small>${ACTIVE_STAGE} • ${c.grade||"—"} • ${c.subject||"—"}</span>
      <span><small>ตัวชี้วัด</small>${r.indicator||"—"}${r.classification?` • ${r.classification}`:""}</span>
      <span><small>หน่วยการเรียนรู้</small>${unit}</span>
      <span><small>เรื่อง</small>${c.topic||"ยังไม่ระบุ"}</span>
      <span><small>เวลา / รูปแบบ</small>${c.duration} • ${c.method}</span>
      <span><small>แนวการจัดการเรียนรู้</small>${c.learningApproach}</span><span><small>สไตล์ / โทนสี</small>${c.styleTitle} • ${c.colorPair}</span>
    </div>`
}

function normalizeThaiSearch(v){
  return (v||"").toString().toLowerCase()
    .normalize("NFKC")
    .replace(/[^\u0E00-\u0E7Fa-z0-9./]+/g," ")
    .replace(/\s+/g," ")
    .trim()
}
function searchTokens(v){
  return normalizeThaiSearch(v).split(" ").filter(Boolean)
}
function levenshtein(a,b){
  a=normalizeThaiSearch(a);b=normalizeThaiSearch(b);
  if(a===b)return 0;if(!a)return b.length;if(!b)return a.length;
  const prev=Array.from({length:b.length+1},(_,i)=>i),cur=new Array(b.length+1);
  for(let i=1;i<=a.length;i++){
    cur[0]=i;
    for(let j=1;j<=b.length;j++){
      cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1))
    }
    for(let j=0;j<=b.length;j++)prev[j]=cur[j]
  }
  return prev[b.length]
}
function fuzzyIndicatorScore(r,raw){
  const q=normalizeThaiSearch(raw);if(!q)return 0;
  const ind=normalizeThaiSearch(r.indicator),std=normalizeThaiSearch(r.standard),
        txt=normalizeThaiSearch(r.indicator_text),dom=normalizeThaiSearch(r.domain),
        subj=normalizeThaiSearch(r.subject);
  if(ind===q)return 1000;
  if(ind.startsWith(q))return 900;
  if(ind.includes(q))return 800;
  if(std===q||std.startsWith(q))return 700;
  if(txt.includes(q))return 650;
  const toks=searchTokens(q);
  let score=0;
  for(const t of toks){
    if(ind.includes(t))score+=120;
    if(std.includes(t))score+=90;
    if(txt.includes(t))score+=80;
    if(dom.includes(t))score+=55;
    if(subj.includes(t))score+=35;
    // small typo tolerance for short teacher-entered words
    const words=(txt+" "+dom).split(" ").filter(w=>w.length>=3);
    let best=99;
    for(const w of words.slice(0,120)){
      if(Math.abs(w.length-t.length)>2)continue;
      best=Math.min(best,levenshtein(t,w))
    }
    if(best===1)score+=45;
    else if(best===2 && t.length>=5)score+=20;
  }
  return score
}
let showAllIndicatorCards=false;
let searchTimer=null;
$("indicatorSearch").oninput=()=>{
  clearTimeout(searchTimer);
  searchTimer=setTimeout(()=>{
    const raw=$("indicatorSearch").value.trim(),box=$("searchResults");
    if(!raw){box.style.display="none";return}
    const found=rows()
      .map(r=>({r,s:fuzzyIndicatorScore(r,raw)}))
      .filter(x=>x.s>0)
      .sort((a,b)=>b.s-a.s)
      .slice(0,window.matchMedia("(max-width:600px)").matches?20:35)
      .map(x=>x.r);
    box.innerHTML=found.map(r=>`<div class="result-item rich-result" data-id="${r.dataset_id}">
      <div><b>${r.indicator}</b>${r.classification?`<span class="result-tag">${r.classification}</span>`:""}</div>
      <small>${r.indicator_text}</small>
      <em>${r.subject||""} • ${$("grade").value||""} • มาตรฐาน ${r.standard||"-"}</em>
    </div>`).join("")||'<div class="result-item empty-result"><b>ยังไม่พบคำที่ตรง</b><small>ลองพิมพ์คำสั้น ๆ เช่น “บวก”, “อ่าน”, “สี” หรือรหัสบางส่วน</small></div>';
    box.style.display="block";
    box.querySelectorAll("[data-id]").forEach(x=>x.onclick=()=>{
      const i=rows().findIndex(r=>r.dataset_id===x.dataset.id);
      $("indicator").value=i;box.style.display="none";$("indicatorSearch").value="";syncRecord()
    })
  },140)
};
function tierRank(t){return {guest:0,member:1,vip:1,admin:2}[t]??0}function userTier(){if(currentProfile?.role==="admin")return"admin";if(currentProfile?.status==="active")return"member";return"guest"}function revealFlowAfterTool(scrollIt=false){
  selectedTool="lesson";
  ["flowDetailsStep","flowOptionsStep","teacherSection","styleSection","flowFinalStep"].forEach(id=>{const el=$(id);if(el)el.style.display="block"});
  document.querySelectorAll(".flow-dot").forEach(x=>x.classList.add("active"));
  if(scrollIt&&$("flowDetailsStep"))setTimeout(()=>$("flowDetailsStep").scrollIntoView({behavior:"smooth",block:"start"}),100)
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
  selectedTool=selectedTool||"lesson";const t=TOOLS.find(x=>x.id===selectedTool);
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
function teacherData(){
  return {
    name:$("teacherName")?.value?.trim()||"",
    position:$("teacherPosition")?.value?.trim()||"",
    school:$("schoolName")?.value?.trim()||"",
    organization:$("organization")?.value?.trim()||"",
    province:$("province")?.value?.trim()||"",
    semester:$("semester")?.value||"",
    academicYear:$("academicYear")?.value?.trim()||"",
    studentCount:$("studentCount")?.value?.trim()||""
  }
}
function resolvedDuration(){
  return $("duration")?.value==="กำหนดเอง" ? ($("customDuration")?.value?.trim()||"กำหนดเอง") : ($("duration")?.value||"1 คาบ (50–60 นาที)")
}
function resolvedMethod(){
  return $("method")?.value==="อื่น ๆ" ? ($("customMethod")?.value?.trim()||"อื่น ๆ") : ($("method")?.value||"Active Learning")
}
function common(){
  const r=record()||{};
  return {
    r,
    stage:ACTIVE_STAGE,
    grade:$("grade")?.value||"",
    subject:$("subject")?.value||"",
    unitName:$("unitName")?.value?.trim()||"",
    topic:$("topic")?.value?.trim()||"",
    duration:resolvedDuration(),
    method:resolvedMethod(),
    learningApproach:$("learningApproach")?.value||"ผสมผสานตามแผน",
    detailLevel:$("detailLevel")?.value||"กระชับพร้อมใช้",
    context:$("context")?.value?.trim()||"",
    teacher:teacherData(),
    styleKey:selectedStyle,
    styleTitle:STYLE_PRESETS[selectedStyle]?.title||"ราชการโมเดิร์น",
    colorPair:selectedColorPair,
    teachDate:$("teachDate")?.value||"",
    teacherSignName:$("teacherSignName")?.value?.trim()||"",
    directorName:$("directorName")?.value?.trim()||"",
    directorPosition:$("directorPosition")?.value?.trim()||"",
    styleInstruction:STYLE_PRESETS[selectedStyle]?.instruction||"",
    curriculum:r.curriculum||r.source_curriculum||"",
    domain:r.domain||"",
    standard:r.standard||"",
    indicator:r.indicator||"",
    indicatorText:r.indicator_text||"",
    classification:r.classification||""
  }
}
function teacherPromptBlock(t){
  const items=[
    ["ชื่อผู้สอน",t.name],["ตำแหน่ง",t.position],["โรงเรียน",t.school],
    ["สังกัด",t.organization],["จังหวัด",t.province],["ภาคเรียน",t.semester],
    ["ปีการศึกษา",t.academicYear],["จำนวนนักเรียน",t.studentCount?t.studentCount+" คน":""]
  ].filter(([,v])=>v);
  return items.length ? `\nข้อมูลผู้สอน:\n${items.map(([k,v])=>`${k}: ${v}`).join("\n")}` :
    `\nข้อมูลผู้สอน: ไม่ได้ระบุ — ห้ามสร้างชื่อครู โรงเรียน สังกัด หรือข้อมูลส่วนบุคคลสมมติ`;
}
function promptHeader(c){
  return `คุณคือผู้เชี่ยวชาญด้านหลักสูตรไทย Instructional Design การจัดการเรียนรู้ และ Educational Graphic Design

ข้อมูลหลักสูตรและแผนที่ต้องยึดตามจริง:
หลักสูตร: ${c.curriculum||"-"}
ช่วงชั้น: ${c.stage||"-"}
ระดับชั้น: ${c.grade||"-"}
กลุ่มสาระ/ด้าน: ${c.subject||"-"}
สาระ/พัฒนาการ: ${c.domain||"-"}
มาตรฐาน: ${c.standard||"-"}
ตัวชี้วัด/ความสามารถ: ${c.indicator||"-"}
ข้อความตัวชี้วัด/ความสามารถ: ${c.indicatorText||"-"}
ประเภทตัวชี้วัด: ${c.classification||"-"}
หน่วยการเรียนรู้: ${c.unitName||"-"}
เรื่อง: ${c.topic||"-"}
เวลา: ${c.duration||"-"}
รูปแบบการเรียนรู้: ${c.method||"-"}
แนวการจัดการเรียนรู้: ${c.learningApproach||"-"}
ระดับรายละเอียด: ${c.detailLevel||"กระชับพร้อมใช้"}
สไตล์ภาพ: ${c.styleTitle||"-"}
โทนสี: ${c.colorPair||"-"}${c.context?`\nบริบทเพิ่มเติม: ${c.context}`:""}${teacherPromptBlock(c.teacher)}`
}
function promptFor(tool,c){
  const base=promptHeader(c);
  const detail=optionValue("optDetail","กระชับพร้อมใช้");
  if(tool==="lesson"){
    const signTeacher=c.teacherSignName||c.teacher.name||"";
    return `คุณคือผู้เชี่ยวชาญด้านหลักสูตรไทย Instructional Design การจัดการเรียนรู้ และ Educational Graphic Design

เป้าหมาย:
สร้างภาพเอกสาร “แผนการจัดการเรียนรู้” ภาษาไทย แบบหน้าเดียว A4 แนวตั้ง อัตราส่วน 2:3 ที่สวยงาม อ่านง่าย ใช้สอนได้จริง และพร้อมแก้ไขต่อใน Canva

สำคัญ:
- บนหัวเอกสารให้ใช้คำว่า “แผนการจัดการเรียนรู้” เท่านั้น
- ห้ามเขียนคำว่า “แผนการจัดการเรียนรู้หน้าเดียว” เป็นชื่อบนภาพ
- คำว่า “หน้าเดียว” เป็นเพียงข้อกำหนดด้านการจัดหน้า ไม่ใช่ชื่อเอกสาร
- ห้ามทำข้อมูลซ้ำหลาย Section

━━━━━━━━━━━━━━━━━━
1) ข้อมูลพื้นฐานของแผน
━━━━━━━━━━━━━━━━━━
หลักสูตร: ${c.curriculum||"-"}
ช่วงชั้น: ${c.stage||"-"}
ระดับชั้น: ${c.grade||"-"}
กลุ่มสาระ/ด้าน: ${c.subject||"-"}
สาระ/พัฒนาการ: ${c.domain||"-"}
หน่วยการเรียนรู้: ${c.unitName||"-"}
เรื่อง: ${c.topic||"-"}
เวลา: ${c.duration||"-"}
รูปแบบการเรียนรู้: ${c.method||"-"}
แนวการจัดการเรียนรู้: ${c.learningApproach||"-"}
ระดับรายละเอียด: ${c.detailLevel||"-"}${c.context?`\nบริบทเพิ่มเติม: ${c.context}`:""}

━━━━━━━━━━━━━━━━━━
2) มาตรฐานการเรียนรู้และตัวชี้วัด
━━━━━━━━━━━━━━━━━━
มาตรฐาน: ${c.standard||"-"}
ตัวชี้วัด/ความสามารถ: ${c.indicator||"-"}
ข้อความตัวชี้วัด/ความสามารถ: ${c.indicatorText||"-"}
ประเภทตัวชี้วัด: ${c.classification||"-"}

ให้ข้อมูลมาตรฐานและตัวชี้วัดจบใน Section นี้เพียงครั้งเดียว ห้ามนำไปรวมซ้ำใน “ข้อมูลพื้นฐานของแผน”

━━━━━━━━━━━━━━━━━━
3) ข้อมูลผู้สอน
━━━━━━━━━━━━━━━━━━
${[
["ชื่อผู้สอน",c.teacher.name],["ตำแหน่ง",c.teacher.position],["โรงเรียน",c.teacher.school],
["สังกัด",c.teacher.organization],["จังหวัด",c.teacher.province],["ภาคเรียน",c.teacher.semester],
["ปีการศึกษา",c.teacher.academicYear],["จำนวนนักเรียน",c.teacher.studentCount?c.teacher.studentCount+" คน":""]
].filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`).join("\n") || "ไม่ได้ระบุ — ห้ามสร้างข้อมูลผู้สอนหรือโรงเรียนสมมติ"}

━━━━━━━━━━━━━━━━━━
4) เนื้อหาแผนที่ต้องสร้าง
━━━━━━━━━━━━━━━━━━
- สาระสำคัญ / ความคิดรวบยอด
- จุดประสงค์การเรียนรู้ที่สังเกตและประเมินได้
- สาระการเรียนรู้
- สมรรถนะสำคัญและคุณลักษณะอันพึงประสงค์ เฉพาะที่สัมพันธ์กับกิจกรรม
- ขั้นตอนกิจกรรมการเรียนรู้ตาม ${c.method} และแนว “${c.learningApproach}”
- สื่อ / อุปกรณ์ / แหล่งเรียนรู้
- การวัดและประเมินผล: จุดประสงค์ / วิธีการ / เครื่องมือ / เกณฑ์ผ่าน

กิจกรรมทุกขั้นต้องสัมพันธ์กับตัวชี้วัดและเหมาะกับ ${c.grade}
ถ้าแนวการจัดการเรียนรู้เน้นเกม ใบงาน ใบความรู้ เทคโนโลยี หรือชิ้นงาน ให้เลือกกิจกรรมและสื่อให้สอดคล้องกับแนวนั้นจริง

━━━━━━━━━━━━━━━━━━
5) การลงชื่อและวันที่
━━━━━━━━━━━━━━━━━━
วันที่สอน: ${c.teachDate||"เว้นเส้นสำหรับกรอก"}
ลงชื่อผู้สอน: ${signTeacher||"เว้นเส้นสำหรับลงชื่อและชื่อผู้สอน"}
ลงชื่อผู้บริหาร/ผู้อำนวยการ: ${c.directorName||"เว้นเส้นสำหรับลงชื่อและชื่อผู้บริหาร"}
ตำแหน่งผู้บริหาร: ${c.directorPosition||"ผู้อำนวยการโรงเรียน / เว้นเส้นสำหรับกรอก"}

จัดส่วนลงชื่อไว้ท้ายเอกสารอย่างสุภาพ ไม่เด่นกว่าสาระการเรียนรู้

━━━━━━━━━━━━━━━━━━
6) STYLE & COLOR
━━━━━━━━━━━━━━━━━━
สไตล์: ${c.styleTitle}
คำอธิบายสไตล์: ${c.styleInstruction}
โทนสีที่เลือก: ${c.colorPair}

ใช้คู่สีนี้เป็นแนวทางหลักอย่างสมดุล สีต้องช่วยแบ่ง Section และอ่านง่าย ไม่ใช้สีมากเกินไป
เพิ่มไอคอนการศึกษา/บุคลากรการศึกษาแบบ 3D ได้อย่างพอดี โดยห้ามบังข้อความ

━━━━━━━━━━━━━━━━━━
7) การใช้รูปครูและโลโก้
━━━━━━━━━━━━━━━━━━
หากผู้ใช้ต้องการให้ภาพมีรูปครูหรือโลโก้โรงเรียน ให้ผู้ใช้แนบไฟล์จริงกับแพลตฟอร์ม AI ตอนสร้างภาพ และสั่งให้ใช้ไฟล์ที่แนบเท่านั้น ห้ามสร้างใบหน้าหรือโลโก้สมมติ

━━━━━━━━━━━━━━━━━━
8) DESIGN RULES
━━━━━━━━━━━━━━━━━━
- A4 Portrait, 2:3, High Resolution, Print Ready, Canva Ready
- ใช้ Visual Hierarchy ชัดเจน
- เนื้อหาเป็นการ์ด/บล็อกที่อ่านตามลำดับได้
- ใช้ White Space เพียงพอ
- ตัวอักษรไทยคมชัด ไม่เพี้ยน ไม่บิดรูป
- ห้ามสร้าง Placeholder ภาษาไทยมั่ว
- ห้ามทำ Section ซ้ำ
- ห้ามนำ “ข้อมูลผู้สอน” ไปปะปนใน “ข้อมูลพื้นฐานของแผน”
- ห้ามทำ “มาตรฐาน/ตัวชี้วัด” ซ้ำใน Section อื่น
- ผลงานต้องดูเป็นแผนการจัดการเรียนรู้จริง ไม่ใช่โปสเตอร์โฆษณาหรืออินโฟกราฟิกตกแต่งอย่างเดียว`;
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
    selectedTool="lesson";
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
    saveLastLessonSnapshot(c);
    try{
      const h=JSON.parse(localStorage.getItem("klangLocalHistory")||"[]");
      h.unshift({topic:c.topic,grade:c.grade,subject:c.subject,indicator:c.indicator,createdAt:new Date().toISOString()});
      localStorage.setItem("klangLocalHistory",JSON.stringify(h.slice(0,12)))
    }catch{}
    renderContinuePanel(t.id);if(window.matchMedia("(max-width:600px)").matches)setTimeout(()=>$("promptBox")?.scrollIntoView({behavior:"smooth",block:"start"}),120);
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
function requireAdmin(){return currentProfile?.role==="admin"}
document.querySelectorAll("[data-admin]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".admin-tab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".admin-pane").forEach(x=>x.classList.toggle("active",x.id==="admin-"+b.dataset.admin))});

async function loadAdmin(){
  if(!backendReady()){$("backendWarning").style.display="block";return}
  if(!requireAdmin()){$("backendWarning").style.display="block";$("backendWarning").textContent="กรุณาเข้าสู่ระบบด้วยบัญชี Admin";return}
  $("backendWarning").style.display="none";
  const [
    {data:profiles,error:pe},
    {data:requests,error:re},
    {count:phCount},
    {data:invites,error:ie},
    {data:usage,error:ue}
  ]=await Promise.all([
    supabaseClient.from("profiles").select("id,email,full_name,school_name,facebook_name,phone,role,status,requested_role,invite_code,membership_started_at,membership_expires_at,created_at,auth_provider,provider_user_id,avatar_url,sales_source,campaign_name,price_paid,payment_status").order("created_at",{ascending:false}),
    supabaseClient.from("membership_requests").select("id,user_id,requested_role,status,invite_code,note,payment_reference,created_at,reviewed_at").order("created_at",{ascending:false}),
    supabaseClient.from("prompt_history").select("id",{count:"exact",head:true}),
    supabaseClient.from("invite_codes").select("id,code,label,target_role,is_active,max_uses,used_count,expires_at,created_at,invite_type,auto_activate,sales_source,campaign_name,price_paid,payment_note").order("created_at",{ascending:false}),
    supabaseClient.from("prompt_history").select("created_at,product_type,title,grade,subject,indicator_code,user_id").order("created_at",{ascending:false}).limit(100)
  ]);
  if(pe||re||ie||ue)console.error("admin load",pe||re||ie||ue);
  const pendingByUser={};
  (requests||[]).filter(r=>r.status==="pending").forEach(r=>{if(!pendingByUser[r.user_id])pendingByUser[r.user_id]=r});
  window._profilesAll=profiles||[];window._pendingByUser=pendingByUser;window._invitesAll=invites||[];
  renderMembers(profiles||[],pendingByUser);
  renderPendingMembers(profiles||[],pendingByUser);
  renderInvites(invites||[]);
  renderUsage(usage||[]);
  const memberProfiles=(profiles||[]).filter(x=>x.role!=="admin");
  $("kAll").textContent=memberProfiles.length;
  $("kPending").textContent=memberProfiles.filter(x=>x.status==="pending").length;
  $("kActive").textContent=memberProfiles.filter(x=>x.status==="active").length;
  $("kPrompts").textContent=phCount||0;
  const sales=memberProfiles.reduce((s,x)=>s+Number(x.price_paid||0),0);
  $("kSalesTotal").textContent=sales?`${sales.toLocaleString("th-TH")} ฿`:"0 ฿";
  if($("pendingTabCount"))$("pendingTabCount").textContent=memberProfiles.filter(x=>x.status==="pending").length;
  renderAdminSummary(memberProfiles);
  if($("facebookAdminStatus"))$("facebookAdminStatus").textContent=CFG.facebookOAuthEnabled?"Facebook Login เปิดใช้งานใน config แล้ว":"โครงสร้างรองรับแล้ว — ต้องเชื่อม Meta App กับ Supabase และตั้ง facebookOAuthEnabled=true";
}
function providerLabel(x){
  const p=(x.auth_provider||"email").toLowerCase();
  if(p==="facebook")return "🔵 Facebook";
  return "✉️ Email"
}
function renderAdminSummary(a){
  const pending=a.filter(x=>x.status==="pending").length;
  $("adminAttentionList").innerHTML=pending?`<div class="attention-row"><span>⏳</span><b>${pending} คนรออนุมัติ</b><button class="btn btn-blue mini" onclick="openAdminTab('pending')">ดูคำขอ</button></div>`:'<div class="admin-empty-small">✓ ไม่มีคำขอค้าง</div>';
  const counts={};a.forEach(x=>{const s=x.sales_source||x.auth_provider||"ไม่ระบุ";counts[s]=(counts[s]||0)+1});
  $("adminSourceSummary").innerHTML=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>`<div class="source-row"><span>${k}</span><b>${v}</b></div>`).join("")||'<div class="admin-empty-small">ยังไม่มีข้อมูล</div>'
}
window.openAdminTab=function(name){
  document.querySelectorAll("[data-admin]").forEach(x=>x.classList.toggle("active",x.dataset.admin===name));
  document.querySelectorAll(".admin-pane").forEach(x=>x.classList.toggle("active",x.id==="admin-"+name))
};
function renderPendingMembers(a,pendingByUser={}){
  const pending=a.filter(x=>x.status==="pending"&&x.role!=="admin");
  const wrap=$("pendingMemberCards");if(!wrap)return;
  wrap.innerHTML=pending.map(x=>{const req=pendingByUser[x.id];return `<article class="pending-member-card">
    <div class="pending-avatar">${x.avatar_url?`<img src="${x.avatar_url}" alt="">`:"👩‍🏫"}</div>
    <div class="pending-copy"><h3>${x.full_name||"ไม่ระบุชื่อ"}</h3><p>${providerLabel(x)} • ${x.email||"ไม่มีอีเมล"}</p>
      <small>Code: ${x.invite_code||"—"}${x.campaign_name?` • ${x.campaign_name}`:""}${x.sales_source?` • ${x.sales_source}`:""}</small>
    </div>
    <div class="pending-actions"><button class="btn btn-blue mini" onclick="approveMember('${x.id}','${req?.id||""}')">✓ อนุมัติ</button><button class="btn btn-red mini" onclick="setMemberStatus('${x.id}','suspended','${req?.id||""}')">ระงับ</button></div>
  </article>`}).join("")||'<div class="empty-workspace"><span>✅</span><h3>ไม่มีสมาชิกที่รออนุมัติ</h3><p>Private Invite หลังตรวจสลิปจะ Active อัตโนมัติและไม่มาค้างที่หน้านี้</p></div>'
}
function renderMembers(a,pendingByUser=window._pendingByUser||{}){
  window._profilesAll=a;window._pendingByUser=pendingByUser;
  const q=($("memberSearch")?.value||"").toLowerCase(),status=$("memberStatusFilter")?.value||"";
  const view=a.filter(x=>x.role!=="admin").filter(x=>{
    if(status&&x.status!==status)return false;
    return !q||[x.full_name,x.email,x.school_name,x.invite_code,x.sales_source,x.campaign_name,x.auth_provider].join(" ").toLowerCase().includes(q)
  });
  const rowHtml=x=>{const req=pendingByUser[x.id];return `<tr>
    <td><b>${x.full_name||"-"}</b><br><small>${x.email||"-"}</small></td>
    <td>${providerLabel(x)}</td>
    <td><span class="status ${x.status}">${x.status}</span></td>
    <td>${x.invite_code||"—"}${x.campaign_name?`<br><small>${x.campaign_name}</small>`:""}</td>
    <td>${x.price_paid!=null?Number(x.price_paid).toLocaleString("th-TH")+" ฿":"—"}</td>
    <td><div class="admin-actions">${x.status==="pending"?`<button class="btn btn-blue mini" onclick="approveMember('${x.id}','${req?.id||""}')">อนุมัติ</button>`:""}<button class="btn btn-ghost mini" onclick="setMemberStatus('${x.id}','active','${req?.id||""}')">Active</button><button class="btn btn-red mini" onclick="setMemberStatus('${x.id}','suspended','${req?.id||""}')">ระงับ</button></div></td>
  </tr>`};
  $("memberRows").innerHTML=view.map(rowHtml).join("");
  const cards=$("memberCards");
  if(cards)cards.innerHTML=view.map(x=>{const req=pendingByUser[x.id];return `<article class="member-admin-card">
    <div class="member-card-top"><div class="pending-avatar">${x.avatar_url?`<img src="${x.avatar_url}" alt="">`:"👩‍🏫"}</div><div><h3>${x.full_name||"-"}</h3><p>${providerLabel(x)} • ${x.email||"-"}</p></div><span class="status ${x.status}">${x.status}</span></div>
    <div class="member-card-meta"><span>Code <b>${x.invite_code||"—"}</b></span><span>แคมเปญ <b>${x.campaign_name||"—"}</b></span><span>ยอด <b>${x.price_paid!=null?Number(x.price_paid).toLocaleString("th-TH")+" ฿":"—"}</b></span></div>
    <div class="admin-actions">${x.status==="pending"?`<button class="btn btn-blue mini" onclick="approveMember('${x.id}','${req?.id||""}')">✓ อนุมัติ</button>`:""}<button class="btn btn-ghost mini" onclick="setMemberStatus('${x.id}','active','${req?.id||""}')">Active</button><button class="btn btn-red mini" onclick="setMemberStatus('${x.id}','suspended','${req?.id||""}')">ระงับ</button></div>
  </article>`}).join("")||'<div class="empty-workspace"><span>👥</span><h3>ยังไม่มีสมาชิก</h3></div>'
}
if($("memberSearch"))$("memberSearch").oninput=()=>renderMembers(window._profilesAll||[],window._pendingByUser||{});
if($("memberStatusFilter"))$("memberStatusFilter").onchange=()=>renderMembers(window._profilesAll||[],window._pendingByUser||{});
window.approveMember=async(id,requestId)=>{const {error}=await supabaseClient.rpc("admin_set_member",{p_user_id:id,p_status:"active",p_role:"member",p_expires_at:null,p_request_id:requestId||null});if(error){toast(error.message);return}toast("อนุมัติ Member แล้ว ✓");loadAdmin()};
window.setMemberStatus=async(id,status,requestId)=>{const {error}=await supabaseClient.rpc("admin_set_member",{p_user_id:id,p_status:status,p_role:"member",p_expires_at:null,p_request_id:requestId||null});if(error){toast(error.message);return}toast("อัปเดตสถานะแล้ว");loadAdmin()};
if($("approveAllPending"))$("approveAllPending").onclick=async()=>{
  const pending=(window._profilesAll||[]).filter(x=>x.role!=="admin"&&x.status==="pending");
  if(!pending.length){toast("ไม่มีสมาชิกที่รออนุมัติ");return}
  $("approveAllPending").disabled=true;
  for(const x of pending){const req=(window._pendingByUser||{})[x.id];await supabaseClient.rpc("admin_set_member",{p_user_id:x.id,p_status:"active",p_role:"member",p_expires_at:null,p_request_id:req?.id||null})}
  $("approveAllPending").disabled=false;toast(`อนุมัติ ${pending.length} คนแล้ว ✓`);loadAdmin()
};
async function createMemberInvite(opts){
  const {data,error}=await supabaseClient.rpc("admin_create_member_invite",{
    p_label:opts.label||null,p_max_uses:opts.maxUses??1,p_expires_at:opts.expiresAt||null,
    p_auto_activate:!!opts.autoActivate,p_invite_type:opts.inviteType||"private_paid",
    p_sales_source:opts.salesSource||null,p_campaign_name:opts.campaign||null,
    p_price_paid:opts.pricePaid===""||opts.pricePaid==null?null:Number(opts.pricePaid),
    p_payment_note:opts.paymentNote||null
  });
  if(error)throw error;
  return Array.isArray(data)?data[0]:data
}
async function makePaidInvite(){
  if(!requireAdmin()){toast("ต้องเป็น Admin");return}
  try{
    const days=Number($("paidInviteDays")?.value||30);
    const row=await createMemberInvite({
      label:$("paidInviteLabel")?.value?.trim()||`Paid member ${new Date().toLocaleDateString("th-TH")}`,
      maxUses:1,expiresAt:new Date(Date.now()+days*86400000).toISOString(),autoActivate:true,inviteType:"private_paid",
      salesSource:$("paidInviteSource")?.value||"Facebook Page",campaign:$("paidInviteCampaign")?.value?.trim()||"",
      pricePaid:$("paidInvitePrice")?.value||"",paymentNote:$("paidInvitePaymentNote")?.value?.trim()||"ตรวจสลิปแล้ว"
    });
    const link=`${CFG.siteUrl||location.origin}/?invite=${row.code}`;
    if($("paidInviteOutput"))$("paidInviteOutput").innerHTML=`<div class="invite-success"><b>✓ ลิงก์พร้อมส่งให้คุณครู</b><div class="codebox">${link}</div><small>สมัครจากลิงก์นี้แล้ว Active Member อัตโนมัติ</small></div>`;
    try{await navigator.clipboard.writeText(link)}catch{}
    toast("สร้างและคัดลอกลิงก์แล้ว ✓");loadAdmin()
  }catch(e){console.error(e);toast(e.message||"สร้างลิงก์ไม่สำเร็จ")}
}
async function makePromoInvite(){
  if(!requireAdmin()){toast("ต้องเป็น Admin");return}
  try{
    const days=Number($("promoInviteDays")?.value||7),maxUses=Number($("promoInviteMax")?.value||20);
    const row=await createMemberInvite({
      label:$("promoInviteCampaign")?.value?.trim()||"Public promotion",maxUses,
      expiresAt:new Date(Date.now()+days*86400000).toISOString(),autoActivate:false,inviteType:"public_promo",
      salesSource:$("promoInviteSource")?.value||"กิจกรรมแจก Code",campaign:$("promoInviteCampaign")?.value?.trim()||""
    });
    const link=`${CFG.siteUrl||location.origin}/?invite=${row.code}`;
    if($("promoInviteOutput"))$("promoInviteOutput").innerHTML=`<div class="invite-success"><b>Code: ${row.code}</b><div class="codebox">${link}</div><small>สมาชิกจาก Code นี้จะ Pending ให้แอดมินอนุมัติ</small></div>`;
    try{await navigator.clipboard.writeText(link)}catch{}
    toast("สร้าง Code โปรโมชั่นแล้ว ✓");loadAdmin()
  }catch(e){console.error(e);toast(e.message||"สร้าง Code ไม่สำเร็จ")}
}
if($("createPaidInvite"))$("createPaidInvite").onclick=makePaidInvite;
if($("createPromoInvite"))$("createPromoInvite").onclick=makePromoInvite;
if($("adminCreatePaidInvite"))$("adminCreatePaidInvite").onclick=()=>{openAdminTab("invites");setTimeout(()=>$("paidInviteLabel")?.focus(),100)};
if($("adminCreatePromoInvite"))$("adminCreatePromoInvite").onclick=()=>{openAdminTab("invites");setTimeout(()=>$("promoInviteCampaign")?.focus(),100)};
function renderInvites(a){
  $("inviteRows").innerHTML=a.map(x=>{const link=`${CFG.siteUrl||location.origin}/?invite=${x.code}`;return `<tr>
    <td><b>${x.code}</b>${x.label?`<br><small>${x.label}</small>`:""}</td>
    <td>${x.invite_type==="private_paid"?"💳 หลังชำระเงิน":x.invite_type==="public_promo"?"🎟️ โปรโมชั่น":x.invite_type||"—"}${x.auto_activate?"<br><small>Auto Active</small>":"<br><small>Pending</small>"}</td>
    <td>${x.sales_source||"—"}${x.campaign_name?`<br><small>${x.campaign_name}</small>`:""}</td>
    <td>${x.price_paid!=null?Number(x.price_paid).toLocaleString("th-TH")+" ฿":"—"}</td>
    <td>${x.used_count||0}/${x.max_uses??"∞"}</td>
    <td>${x.expires_at?new Date(x.expires_at).toLocaleDateString("th-TH"):"—"}</td>
    <td><button class="btn btn-ghost mini" onclick="navigator.clipboard.writeText('${link}');toast('คัดลอกลิงก์แล้ว')">คัดลอก</button></td>
  </tr>`}).join("")
}
function renderUsage(a){$("usageRows").innerHTML=a.map(x=>`<tr><td>${new Date(x.created_at).toLocaleString("th-TH")}</td><td>${(x.user_id||"").slice(0,8)}…</td><td>${x.product_type||"—"}</td><td>${x.grade||"—"} / ${x.subject||"—"}</td><td>${x.indicator_code||"—"}</td></tr>`).join("")}
function updateConditionalFields(){
  if($("customDuration"))$("customDuration").style.display=$("duration")?.value==="กำหนดเอง"?"block":"none";
  if($("customMethod"))$("customMethod").style.display=$("method")?.value==="อื่น ๆ"?"block":"none";
  renderSummary()
}
if($("duration"))$("duration").addEventListener("change",updateConditionalFields);
if($("method"))$("method").addEventListener("change",updateConditionalFields);

document.querySelectorAll("[data-detail]").forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll("[data-detail]").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");$("detailLevel").value=btn.dataset.detail;renderSummary()
});
document.querySelectorAll("[data-style]").forEach(card=>card.onclick=()=>{
  selectedStyle=card.dataset.style;localStorage.setItem("klangLastStyle",selectedStyle);
  document.querySelectorAll("[data-style]").forEach(x=>{
    x.classList.toggle("selected",x===card);
    const e=x.querySelector(".style-info em");if(e)e.textContent=x===card?"✓ เลือกแล้ว":"เลือกสไตล์นี้"
  });
  renderSummary()
});

function readTeacherProfile(){
  try{
    const p=JSON.parse(localStorage.getItem("klangTeacherProfile")||"{}");
    const map={teacherName:"name",teacherPosition:"position",schoolName:"school",organization:"organization",province:"province",semester:"semester",academicYear:"academicYear",studentCount:"studentCount"};
    Object.entries(map).forEach(([id,key])=>{if($(id)&&p[key]!=null)$(id).value=p[key]});
    if(Object.keys(p).length&&$("rememberTeacher"))$("rememberTeacher").checked=true
  }catch(e){console.error("teacher profile",e)}
}
function persistTeacherProfile(){
  if(!$("rememberTeacher"))return;
  if(!$("rememberTeacher").checked){localStorage.removeItem("klangTeacherProfile");return}
  localStorage.setItem("klangTeacherProfile",JSON.stringify(teacherData()))
}
if($("rememberTeacher"))$("rememberTeacher").addEventListener("change",persistTeacherProfile);
["teacherName","teacherPosition","schoolName","organization","province","semester","academicYear","studentCount"].forEach(id=>{
  const el=$(id);if(el)el.addEventListener(el.tagName==="SELECT"?"change":"input",()=>{if($("rememberTeacher")?.checked)persistTeacherProfile()})
});
readTeacherProfile();
updateConditionalFields();
revealFlowAfterTool(false);


const COLOR_PAIRS={
  "ฟ้า–ม่วง–ทอง":"Blue, violet and restrained warm gold accents",
  "กรมท่า–ทอง":"Deep navy and refined gold on white",
  "มิ้นต์–ฟ้า":"Fresh mint and sky blue on clean white",
  "ส้ม–ครีม":"Warm orange and soft cream",
  "ชมพู–ฟ้า":"Friendly pink and sky blue",
  "เขียว–ทอง":"Education green with restrained gold"
};
document.querySelectorAll("[data-color-pair]").forEach(btn=>btn.onclick=()=>{
  selectedColorPair=btn.dataset.colorPair;
  document.querySelectorAll("[data-color-pair]").forEach(x=>x.classList.toggle("active",x===btn));
  localStorage.setItem("klangColorPair",selectedColorPair);renderSummary();refreshHomeUtilities()
});
const savedColor=localStorage.getItem("klangColorPair");
if(savedColor&&COLOR_PAIRS[savedColor]){
  selectedColorPair=savedColor;
  document.querySelectorAll("[data-color-pair]").forEach(x=>x.classList.toggle("active",x.dataset.colorPair===savedColor))
}
const savedStyle=localStorage.getItem("klangLastStyle");
if(savedStyle&&STYLE_PRESETS[savedStyle]){
  selectedStyle=savedStyle;
  document.querySelectorAll("[data-style]").forEach(x=>{
    const on=x.dataset.style===savedStyle;x.classList.toggle("selected",on);
    const e=x.querySelector(".style-info em");if(e)e.textContent=on?"✓ เลือกแล้ว":"เลือกสไตล์นี้"
  })
}

async function imageFileToSmallData(file,max=420){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const scale=Math.min(1,max/Math.max(img.width,img.height));
        const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
        canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL("image/jpeg",.82))
      };
      img.onerror=reject;img.src=reader.result
    };
    reader.onerror=reject;reader.readAsDataURL(file)
  })
}
function setAssetPreview(id,data,fallback){
  const box=$(id);if(!box)return;
  box.innerHTML=data?`<img src="${data}" alt="">`:`<span>${fallback}</span>`
}
async function handleAssetInput(input,type){
  const file=input.files?.[0];if(!file)return;
  if(file.size>8*1024*1024){toast("ไฟล์ใหญ่เกินไป กรุณาใช้ไฟล์ไม่เกิน 8 MB");return}
  try{
    const data=await imageFileToSmallData(file,type==="logo"?500:420);
    if(type==="teacher"){teacherPhotoData=data;setAssetPreview("teacherPhotoPreview",data,"👩‍🏫")}
    else{schoolLogoData=data;setAssetPreview("schoolLogoPreview",data,"🏫")}
    if($("rememberTeacher")?.checked)persistTeacherProfile();
    refreshProfileMini();toast("เพิ่มรูปเรียบร้อย ✓")
  }catch(e){console.error(e);toast("ไม่สามารถอ่านรูปได้")}
}
if($("teacherPhotoInput"))$("teacherPhotoInput").onchange=e=>handleAssetInput(e.target,"teacher");


const oldPersistTeacherProfile=persistTeacherProfile;
persistTeacherProfile=function(){
  if(!$("rememberTeacher"))return;
  if(!$("rememberTeacher").checked){localStorage.removeItem("klangTeacherProfile");return}
  const d=teacherData();d.photoData=teacherPhotoData;d.logoData=schoolLogoData;
  try{localStorage.setItem("klangTeacherProfile",JSON.stringify(d))}catch(e){
    d.photoData="";d.logoData="";localStorage.setItem("klangTeacherProfile",JSON.stringify(d))
  }
  refreshHomeUtilities();refreshProfileMini()
};
(function restoreV72TeacherAssets(){
  try{
    const p=JSON.parse(localStorage.getItem("klangTeacherProfile")||"{}");
    teacherPhotoData=p.photoData||"";schoolLogoData=p.logoData||"";
    setAssetPreview("teacherPhotoPreview",teacherPhotoData,"👩‍🏫");
    setAssetPreview("schoolLogoPreview",schoolLogoData,"🏫")
  }catch{}
})();

function refreshProfileMini(){
  const box=$("profileMini");if(!box)return;
  const t=teacherData(),has=t.name||currentProfile?.full_name||currentUser;
  if(!has){box.style.display="none";return}
  box.style.display="flex";
  $("profileMiniName").textContent=t.name||currentProfile?.full_name||"ผู้ใช้";
  $("profileMiniRole").textContent=currentProfile?.role==="admin"?"ADMIN":"ครูผู้ใช้งาน";
  const img=$("profileMiniAvatar");
  if(teacherPhotoData){img.src=teacherPhotoData;img.style.display="block"}
  else{img.removeAttribute("src");img.style.display="none"}
}
function refreshHomeUtilities(){
  let last={};try{last=JSON.parse(localStorage.getItem("klangLastLesson")||"{}")}catch{}
  let tp={};try{tp=JSON.parse(localStorage.getItem("klangTeacherProfile")||"{}")}catch{}
  if($("homeRecentText"))$("homeRecentText").textContent=last.topic?`${last.grade||""} ${last.subject||""} • ${last.topic}`:"ยังไม่มีงานล่าสุด";
  if($("homeProfileText"))$("homeProfileText").textContent=tp.name?`${tp.name}${tp.school?` • ${tp.school}`:""}`:"ยังไม่ได้บันทึกข้อมูล";
  if($("homeStyleText"))$("homeStyleText").textContent=`${STYLE_PRESETS[selectedStyle]?.title||"ราชการโมเดิร์น"} • ${selectedColorPair}`;
  if($("homeContinueText"))$("homeContinueText").textContent=last.topic?`ต่อยอดจาก “${last.topic}”`:"สร้างแผนก่อน 1 ครั้ง"
}
document.querySelectorAll("[data-quick]").forEach(btn=>btn.onclick=()=>{
  const q=btn.dataset.quick;
  if(q==="recent"||q==="continue"){go("generator");setTimeout(()=>$("flowFinalStep")?.scrollIntoView({behavior:"smooth"}),100)}
  if(q==="profile"){go("generator");setTimeout(()=>$("teacherSection")?.scrollIntoView({behavior:"smooth"}),100)}
  if(q==="style"){go("generator");setTimeout(()=>$("styleSection")?.scrollIntoView({behavior:"smooth"}),100)}
});
function appNav(target){
  document.querySelectorAll("[data-app-nav]").forEach(x=>x.classList.toggle("active",x.dataset.appNav===target));
  if(target==="home"){go("home");return}
  if(target==="plans"){renderMyPlans();go("plans");return}
  if(target==="indicators"){renderIndicatorLibrary();go("indicators");return}
  if(target==="styles"){renderStylesLibrary();go("styles");return}
  if(target==="guide"){go("guide");return}
  if(target==="help"){go("help");return}
}
document.querySelectorAll("[data-app-nav]").forEach(btn=>btn.onclick=()=>appNav(btn.dataset.appNav));


function renderMyPlans(){
  const wrap=$("myPlansList");if(!wrap)return;
  let last={};try{last=JSON.parse(localStorage.getItem("klangLastLesson")||"{}")}catch{}
  const cards=[];
  if(last.topic)cards.push(`<article class="saved-work-card">
    <div class="saved-work-icon">📘</div><div><span class="saved-badge">งานล่าสุด</span><h3>${last.topic}</h3>
    <p>${last.grade||""} • ${last.subject||""}${last.unitName?` • หน่วย ${last.unitName}`:""}</p>
    <small>${last.createdAt?new Date(last.createdAt).toLocaleString("th-TH"):""}</small></div>
    <button class="btn btn-blue" data-open-last>เปิดงาน</button></article>`);
  let hist=[];try{hist=JSON.parse(localStorage.getItem("klangLocalHistory")||"[]")}catch{}
  hist.slice(0,12).forEach(x=>cards.push(`<article class="saved-work-card compact"><div class="saved-work-icon">📄</div><div><h3>${x.topic||"แผนการสอน"}</h3><p>${x.grade||""} • ${x.subject||""}</p></div></article>`));
  wrap.innerHTML=cards.join("")||`<div class="empty-workspace"><span>📂</span><h3>ยังไม่มีแผนที่บันทึก</h3><p>เมื่อสร้างแผนครั้งแรก งานล่าสุดจะมาแสดงที่นี่</p><button class="btn btn-blue" data-go="generator">สร้างแผนแรก</button></div>`;
  wrap.querySelectorAll("[data-open-last]").forEach(b=>b.onclick=()=>go("generator"));
  wrap.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go))
}
function librarySubjects(){
  return [...new Set(DATA.map(r=>r.subject).filter(Boolean))].sort()
}
function renderIndicatorLibrary(){
  if($("librarySubject")&&$("librarySubject").options.length<=1){
    librarySubjects().forEach(s=>{const o=document.createElement("option");o.value=o.textContent=s;$("librarySubject").appendChild(o)})
  }
  const q=($("libraryIndicatorSearch")?.value||"").trim().toLowerCase();
  const st=$("libraryStage")?.value||"",sub=$("librarySubject")?.value||"";
  const found=DATA.filter(r=>{
    if(st&&r.stage!==st)return false;if(sub&&r.subject!==sub)return false;
    if(!q)return true;
    return [r.indicator,r.indicator_text,r.standard,r.domain,r.subject].join(" ").toLowerCase().includes(q)
  }).slice(0,60);
  const wrap=$("indicatorLibraryResults");if(!wrap)return;
  wrap.innerHTML=found.map(r=>`<button class="library-indicator-card" data-library-id="${r.dataset_id}">
    <div><b>${r.indicator||"—"}</b>${r.classification?`<span>${r.classification}</span>`:""}</div>
    <strong>${r.subject||""} • ${r.grade||""}</strong><p>${r.indicator_text||""}</p>
  </button>`).join("")||'<div class="empty-workspace"><span>🔎</span><h3>ไม่พบตัวชี้วัด</h3><p>ลองใช้คำค้นสั้นลงหรือเปลี่ยนตัวกรอง</p></div>';
  wrap.querySelectorAll("[data-library-id]").forEach(btn=>btn.onclick=()=>{
    const r=DATA.find(x=>x.dataset_id===btn.dataset.libraryId);if(!r)return;
    ACTIVE_STAGE=r.stage||ACTIVE_STAGE;go("generator");syncStageTabs();buildGrades();
    setTimeout(()=>{
      if([...$("grade").options].some(o=>o.value===r.grade)){$("grade").value=r.grade;renderGradeCards();buildSubjects()}
      if([...$("subject").options].some(o=>o.value===r.subject)){$("subject").value=r.subject;buildIndicators()}
      const i=rows().findIndex(x=>x.dataset_id===r.dataset_id);if(i>=0){$("indicator").value=i;syncRecord()}
    },50)
  })
}
["libraryIndicatorSearch","libraryStage","librarySubject"].forEach(id=>{const el=$(id);if(el)el.addEventListener(id==="libraryIndicatorSearch"?"input":"change",renderIndicatorLibrary)});
function renderStylesLibrary(){
  const wrap=$("stylesLibrary");if(!wrap)return;
  wrap.innerHTML=Object.entries(STYLE_PRESETS).map(([key,s])=>`<article class="style-library-card ${selectedStyle===key?"active":""}">
    <div class="style-library-preview ${key}"><span>🎨</span></div><div><h3>${s.title}</h3><p>${s.instruction}</p>
    <button class="btn btn-ghost" data-use-style="${key}">${selectedStyle===key?"✓ กำลังใช้":"ใช้สไตล์นี้"}</button></div>
  </article>`).join("");
  wrap.querySelectorAll("[data-use-style]").forEach(btn=>btn.onclick=()=>{
    selectedStyle=btn.dataset.useStyle;localStorage.setItem("klangLastStyle",selectedStyle);
    document.querySelectorAll("[data-style]").forEach(x=>{
      const on=x.dataset.style===selectedStyle;x.classList.toggle("selected",on);
      const e=x.querySelector(".style-info em");if(e)e.textContent=on?"✓ เลือกแล้ว":"เลือกสไตล์นี้"
    });
    renderStylesLibrary();refreshHomeUtilities();toast("เลือกสไตล์แล้ว ✓")
  })
}
if($("mobileMenuBtn"))$("mobileMenuBtn").onclick=()=>$("mobileWorkspaceMenu")?.classList.toggle("open");
document.querySelectorAll("#mobileWorkspaceMenu [data-app-nav]").forEach(btn=>btn.onclick=()=>{$("mobileWorkspaceMenu").classList.remove("open");appNav(btn.dataset.appNav)});
const AI_LINKS={
  chatgpt:"https://chatgpt.com/",
  gemini:"https://gemini.google.com/",
  claude:"https://claude.ai/",
  canva:"https://www.canva.com/"
};
document.querySelectorAll("[data-ai-launch]").forEach(btn=>btn.onclick=async()=>{
  await copyCurrentPrompt();window.open(AI_LINKS[btn.dataset.aiLaunch],"_blank","noopener")
});

const GAME_LINKS={
  "Canva":"https://www.canva.com/",
  "Wordwall":"https://wordwall.net/",
  "Quizizz":"https://quizizz.com/",
  "Kahoot!":"https://create.kahoot.it/",
  "Genially":"https://genially.com/",
  "ChatGPT":"https://chatgpt.com/"
};
function syncGamePlatformButton(){
  const b=$("openGamePlatformBtn");if(!b)return;
  const platform=chipValue("gamePlatform");
  const url=GAME_LINKS[platform];
  b.style.display=smartContinueTool==="game"&&url?"block":"none";
  if(url){b.textContent=`🔗 เปิด ${platform}`;b.onclick=()=>window.open(url,"_blank","noopener")}
}
const originalInitSmartChips=initSmartChips;
initSmartChips=function(){
  originalInitSmartChips();
  document.querySelectorAll('[data-chip-group="gamePlatform"] .smart-chip').forEach(x=>x.addEventListener("click",()=>setTimeout(syncGamePlatformButton,0)));
  syncGamePlatformButton()
};

function saveLastLessonSnapshot(c){
  const snap={stage:c.stage,grade:c.grade,subject:c.subject,indicator:c.indicator,unitName:c.unitName,topic:c.topic,duration:c.duration,method:c.method,styleKey:c.styleKey,colorPair:c.colorPair,createdAt:new Date().toISOString()};
  localStorage.setItem("klangLastLesson",JSON.stringify(snap));refreshHomeUtilities()
}
refreshHomeUtilities();refreshProfileMini();
if($("adminRefresh"))$("adminRefresh").onclick=()=>loadAdmin();
if($("adminOpenGenerator"))$("adminOpenGenerator").onclick=()=>{selectedTool="lesson";go("generator");renderTools();renderOptions();revealFlowAfterTool(true);toast("Admin Test Mode: ใช้งานทุกฟีเจอร์ของ Member ได้")};



syncOptionalAuthControls();
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