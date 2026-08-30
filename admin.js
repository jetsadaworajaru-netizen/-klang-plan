const MEMBER_PRICE=169;
const CFG=window.KLANG_CONFIG||{};
const $=id=>document.getElementById(id);
let sb=null,user=null,profile=null,profiles=[],requests=[],invites=[],usage=[];
let currentQuickLink="";

function toast(t){const e=$("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1800)}
function money(v){return v==null||v===""?"—":Number(v).toLocaleString("th-TH")+" ฿"}
function d(v){return v?new Date(v).toLocaleDateString("th-TH"):"—"}
function esc(s){return (s??"").toString().replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

async function init(){
  if(!CFG.supabaseUrl||!CFG.supabasePublishableKey||!window.supabase){
    $("adminLoginMsg").innerHTML='<div style="color:#a44;margin-top:9px">ยังไม่ได้เชื่อม Supabase</div>';return
  }
  sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:"klang-admin-auth"}});
  const {data}=await sb.auth.getSession();
  if(data.session)await useSession(data.session);
  sb.auth.onAuthStateChange(async(_e,s)=>{if(s)await useSession(s);else showLogin()})
}
async function useSession(session){
  user=session.user;
  const {data,error}=await sb.from("profiles").select("*").eq("id",user.id).maybeSingle();
  if(error){showLogin("อ่านข้อมูลบัญชีไม่สำเร็จ");return}
  profile=data;
  if(profile?.role!=="admin"){showLogin("บัญชีนี้ไม่มีสิทธิ์ Admin");await sb.auth.signOut();return}
  $("adminName").textContent=profile.full_name||user.email||"Admin";
  $("loginScreen").style.display="none";$("adminApp").style.display="block";$("logoutBtn").style.display="inline-flex";
  await loadAll()
}
function showLogin(msg=""){
  user=null;profile=null;$("loginScreen").style.display="grid";$("adminApp").style.display="none";$("logoutBtn").style.display="none";
  if(msg)$("adminLoginMsg").innerHTML='<div style="color:#a05a2c;margin-top:9px">'+esc(msg)+'</div>'
}
$("adminLoginBtn").onclick=async()=>{
  const email=$("adminEmail").value.trim(),password=$("adminPassword").value;
  if(!email||!password){showLogin("กรุณากรอกอีเมลและรหัสผ่าน");return}
  $("adminLoginBtn").disabled=true;
  const {data,error}=await sb.auth.signInWithPassword({email,password});
  $("adminLoginBtn").disabled=false;
  if(error){showLogin("เข้าสู่ระบบไม่สำเร็จ: "+error.message);return}
  await useSession(data.session)
};
$("logoutBtn").onclick=async()=>{await sb.auth.signOut();showLogin()};

$("switchToUserBtn").onclick=()=>{location.assign("/teacher.html")};
$("adminPassword").addEventListener("keydown",e=>{if(e.key==="Enter")$("adminLoginBtn").click()});

document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>openTab(b.dataset.tab));
function openTab(tab){
  document.querySelectorAll(".side-tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===tab));
  document.querySelectorAll(".tab-pane").forEach(x=>x.classList.toggle("active",x.id==="tab-"+tab))
}
$("goQuickBtn").onclick=()=>openTab("quick");

async function loadAll(){
  const [p,r,i,u]=await Promise.all([
    sb.from("profiles").select("id,email,full_name,role,status,invite_code,member_id,created_at,auth_provider,sales_source,campaign_name,price_paid,payment_status,avatar_url").order("created_at",{ascending:false}),
    sb.from("membership_requests").select("id,user_id,status,invite_code,created_at").order("created_at",{ascending:false}),
    sb.from("invite_codes").select("id,code,label,is_active,max_uses,used_count,expires_at,created_at,invite_type,auto_activate,sales_source,campaign_name,price_paid,payment_note").order("created_at",{ascending:false}).limit(150),
    sb.from("prompt_history").select("created_at,product_type,title,grade,subject,indicator_code,user_id").order("created_at",{ascending:false}).limit(100)
  ]);
  if(p.error||r.error||i.error||u.error){console.error(p.error||r.error||i.error||u.error);toast("โหลดข้อมูลบางส่วนไม่สำเร็จ")}
  profiles=p.data||[];requests=r.data||[];invites=i.data||[];usage=u.data||[];
  renderAll()
}
function renderAll(){
  const jobs=[renderRecent,renderDashboard,renderDashboardMembers,renderMemberNames,renderPending,renderMembers,renderInvites,renderUsage];
  jobs.forEach(fn=>{try{fn()}catch(e){console.error("render error",fn.name,e)}})
}

async function createInvite(opts){
  const {data,error}=await sb.rpc("admin_create_member_invite",{
    p_label:opts.label||null,p_max_uses:opts.maxUses??1,p_expires_at:opts.expiresAt||null,
    p_auto_activate:!!opts.autoActivate,p_invite_type:opts.inviteType||"private_paid",
    p_sales_source:opts.source||null,p_campaign_name:opts.campaign||null,
    p_price_paid:opts.price===""?null:Number(opts.price),p_payment_note:opts.note||null
  });
  if(error)throw error;
  return Array.isArray(data)?data[0]:data
}
async function createOneTapInvite(btn){
  if(btn)btn.disabled=true;
  try{
    const days=Number($("qDays")?.value||30);
    const row=await createInvite({
      label:`Member invite ${new Date().toLocaleString("th-TH")}`,
      maxUses:1,
      expiresAt:new Date(Date.now()+days*86400000).toISOString(),
      autoActivate:true,
      inviteType:"private_paid",
      source:$("qSource")?.value||"",
      campaign:$("qCampaign")?.value?.trim()||"",
      price:$("qPrice")?.value||"",
      note:"Admin generated invite"
    });
    currentQuickLink=`${CFG.siteUrl||location.origin}/join.html?invite=${encodeURIComponent(row.code)}`;
    $("quickLink").textContent=currentQuickLink;
    $("quickResult").style.display="block";
    try{await navigator.clipboard.writeText(currentQuickLink)}catch{}
    openTab("quick");
    toast("สร้างลิงก์เชิญแล้ว • ครูสมัครแล้ว Active ทันที ✓");
    await loadAll()
  }catch(e){console.error(e);toast(e.message||"สร้างลิงก์เชิญไม่สำเร็จ")}
  finally{if(btn)btn.disabled=false}
}
$("quickCreateBtn").onclick=()=>createOneTapInvite($("quickCreateBtn"));
$("topQuickInviteBtn")?.addEventListener("click",()=>createOneTapInvite($("topQuickInviteBtn")));
$("copyQuickLink").onclick=async()=>{if(!currentQuickLink)return;try{await navigator.clipboard.writeText(currentQuickLink);toast("คัดลอกแล้ว ✓")}catch{toast("คัดลอกไม่สำเร็จ")}};
$("newQuickInvite").onclick=()=>{$("quickResult").style.display="none";$("quickCreateBtn").focus()};
$("refreshQuick").onclick=loadAll;

function renderRecent(){
  const a=invites.filter(x=>x.invite_type==="private_paid").slice(0,8);
  $("recentInviteList").innerHTML=a.map(x=>{
    const link=`${CFG.siteUrl||location.origin}/join.html?invite=${x.code}`;
    return `<div class="invite-row"><div class="row-main"><b>${esc(x.label||x.code)}</b><small>${esc(x.code)} • ${money(x.price_paid)} • ${esc(x.sales_source||"—")}</small><em>ใช้แล้ว ${x.used_count||0}/${x.max_uses??"∞"} • หมดอายุ ${d(x.expires_at)}</em></div><div class="row-actions"><button class="mini-btn" data-copy="${esc(link)}">คัดลอก</button></div></div>`
  }).join("")||'<div class="invite-row"><div class="row-main"><small>ยังไม่มีลิงก์</small></div></div>';
  $("recentInviteList").querySelectorAll("[data-copy]").forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(b.dataset.copy);toast("คัดลอกแล้ว ✓")})
}
function renderDashboard(){
  const members=profiles.filter(x=>x.role!=="admin");
  const active=members.filter(x=>x.status==="active");
  const pending=members.filter(x=>x.status==="pending");

  // รายได้ = จำนวนสมาชิกที่สมัครเข้าระบบทั้งหมด x 169 บาท
  const revenue=members.length*MEMBER_PRICE;

  const now=new Date();
  const bangkokParts=new Intl.DateTimeFormat("en-CA",{
    timeZone:"Asia/Bangkok",year:"numeric",month:"2-digit",day:"2-digit"
  }).formatToParts(now);
  const bp=Object.fromEntries(bangkokParts.map(x=>[x.type,x.value]));
  const todayKey=`${bp.year}-${bp.month}-${bp.day}`;
  const monthKey=`${bp.year}-${bp.month}`;

  const memberDateKey=v=>{
    if(!v)return "";
    const parts=new Intl.DateTimeFormat("en-CA",{
      timeZone:"Asia/Bangkok",year:"numeric",month:"2-digit",day:"2-digit"
    }).formatToParts(new Date(v));
    const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
    return `${p.year}-${p.month}-${p.day}`
  };

  const newToday=members.filter(x=>memberDateKey(x.created_at)===todayKey).length;
  const newMonth=members.filter(x=>memberDateKey(x.created_at).startsWith(monthKey)).length;
  const promptCount=usage.length;
  const usersWithPrompt=new Set(usage.map(x=>x.user_id).filter(Boolean)).size;
  const avgPrompts=members.length?Math.round((promptCount/members.length)*10)/10:0;

  if($("dMembers"))$("dMembers").textContent=members.length;
  if($("dActive"))$("dActive").textContent=active.length;
  if($("dPending"))$("dPending").textContent=pending.length;
  if($("sidePendingCount"))$("sidePendingCount").textContent=pending.length;
  if($("dSales"))$("dSales").textContent=money(revenue);

  if($("dToday"))$("dToday").textContent=newToday;
  if($("dMonth"))$("dMonth").textContent=newMonth;
  if($("dPrompts"))$("dPrompts").textContent=promptCount;
  if($("dPromptUsers"))$("dPromptUsers").textContent=usersWithPrompt;
  if($("dAvgPrompts"))$("dAvgPrompts").textContent=avgPrompts;

  $("attentionList").innerHTML=pending.length
    ? `<div class="pending-row"><div class="row-main"><b>${pending.length} คนรออนุมัติ</b><small>กดไปที่เมนูรออนุมัติ</small></div><button class="mini-btn good" id="attnPending">ดูเลย</button></div>`
    : '<div class="pending-row"><div class="row-main"><b>✓ ไม่มีคำขอค้าง</b><small>ระบบสมาชิกทำงานปกติ</small></div></div>';

  $("attnPending")?.addEventListener("click",()=>openTab("pending"));

  const c={};
  members.forEach(x=>{
    const k=x.sales_source||x.auth_provider||"ลิงก์ Admin";
    c[k]=(c[k]||0)+1
  });
  $("sourceList").innerHTML=Object.entries(c)
    .sort((a,b)=>b[1]-a[1])
    .map(([k,v])=>`<div class="invite-row"><div class="row-main"><b>${esc(k)}</b><small>${v} สมาชิก</small></div><b>${v}</b></div>`)
    .join("")||'<div class="invite-row">ยังไม่มีข้อมูล</div>';

  if($("dashboardRevenueFormula")){
    $("dashboardRevenueFormula").textContent=`${members.length} สมาชิก × ${MEMBER_PRICE} บาท = ${money(revenue)}`
  }
}
function pendingReq(userId){return requests.find(r=>r.user_id===userId&&r.status==="pending")}
function renderMemberNames(){
  const el=$("memberNamesList");
  if(!el)return;

  const q=($("memberNamesSearch")?.value||"").trim().toLowerCase();
  const members=(profiles||[])
    .filter(x=>x&&x.role!=="admin")
    .filter(x=>{
      if(!q)return true;
      return [x.full_name,x.member_id,x.status].join(" ").toLowerCase().includes(q)
    })
    .sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));

  if($("memberNamesCount"))$("memberNamesCount").textContent=`${members.length} คน`;

  el.innerHTML=members.map((x,i)=>`
    <div class="member-name-row">
      <div class="member-name-no">${i+1}</div>
      <div class="member-name-main">
        <b>${esc(x.full_name||"ไม่ระบุชื่อ")}</b>
        <small>${esc(x.member_id||"ยังไม่มี Member ID")}</small>
      </div>
      <div class="member-name-actions">
        <span class="status ${esc(x.status||"")}">${esc(x.status||"—")}</span>
        <button class="mini-btn danger delete-member" data-delete-member="${x.id}" data-member="${esc(x.member_id||"")}" data-name="${esc(x.full_name||"สมาชิก")}">ลบ</button>
      </div>
    </div>
  `).join("")||'<div class="dashboard-member-empty">ไม่พบสมาชิก</div>';
}

function renderDashboardMembers(){
  const el=$("dashboardMemberList");if(!el)return;
  const members=(profiles||[])
    .filter(x=>x&&x.role!=="admin")
    .sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));

  if($("dashboardMemberCount"))$("dashboardMemberCount").textContent=`${members.length} คน`;

  el.innerHTML=members.map((x,i)=>`
    <div class="dashboard-member-row">
      <div class="member-order">${i+1}</div>
      <div class="dashboard-member-info">
        <b>${esc(x.full_name||"ไม่ระบุชื่อ")}</b>
        <small>${esc(x.member_id||"ยังไม่มี Member ID")}</small>
      </div>
      <span class="status ${esc(x.status||"")}">${esc(x.status||"—")}</span>
    </div>
  `).join("")||'<div class="dashboard-member-empty">ยังไม่มีสมาชิก</div>';
}
function renderPending(){
  const a=profiles.filter(x=>x.role!=="admin"&&x.status==="pending");
  $("pendingList").innerHTML=a.map(x=>{
    const req=pendingReq(x.id);
    return `<div class="pending-row"><div class="row-main"><b>${esc(x.full_name||"ไม่ระบุชื่อ")}</b><small>${esc(x.email||"—")} • ${esc(x.invite_code||"ไม่มี Code")}</small><em>${esc(x.sales_source||x.auth_provider||"—")} ${x.campaign_name?"• "+esc(x.campaign_name):""}</em></div><div class="row-actions"><button class="mini-btn good" data-approve="${x.id}" data-req="${req?.id||""}">✓ อนุมัติ</button><button class="mini-btn danger" data-suspend="${x.id}" data-req="${req?.id||""}">ระงับ</button></div></div>`
  }).join("")||'<div class="pending-row"><div class="row-main"><b>✅ ไม่มีสมาชิกที่รออนุมัติ</b><small>ลิงก์หลังชำระเงินจะ Active อัตโนมัติ</small></div></div>';
  wireMemberButtons($("pendingList"))
}
function renderMembers(){
  const q=$("memberSearchAdmin").value.trim().toLowerCase();
  const f=$("memberFilterAdmin").value;
  const dateFrom=$("memberDateFrom")?.value||"";
  const dateTo=$("memberDateTo")?.value||"";

  const fromTs=dateFrom?new Date(`${dateFrom}T00:00:00+07:00`).getTime():null;
  const toTs=dateTo?new Date(`${dateTo}T23:59:59+07:00`).getTime():null;

  const a=profiles
    .filter(x=>x.role!=="admin")
    .filter(x=>{
      if(f&&x.status!==f)return false;
      const text=[x.full_name,x.member_id,x.invite_code,x.campaign_name,x.sales_source].join(" ").toLowerCase();
      if(q&&!text.includes(q))return false;
      const ts=x.created_at?new Date(x.created_at).getTime():null;
      if(fromTs&&(!ts||ts<fromTs))return false;
      if(toTs&&(!ts||ts>toTs))return false;
      return true;
    })
    .sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));

  if($("memberResultCount"))$("memberResultCount").textContent=`สมาชิกทั้งหมด ${a.length} คน`;

  $("memberListAdmin").innerHTML=a.map(x=>{
    const req=pendingReq(x.id);
    return `<div class="member-row">
      <div class="row-main">
        <b>${esc(x.full_name||"—")} <span class="status ${esc(x.status)}">${esc(x.status)}</span></b>
        <small>Member ID: ${esc(x.member_id||"—")}</small>
        <em>สมัครเมื่อ ${esc(fmtDateTime(x.created_at))} น. • Code ${esc(x.invite_code||"—")}</em>
      </div>
      <div class="row-actions">
        ${x.status==="pending"?`<button class="mini-btn good" data-approve="${x.id}" data-req="${req?.id||""}">อนุมัติ</button>`:""}
        <button class="mini-btn" data-active="${x.id}" data-req="${req?.id||""}">Active</button>
        <button class="mini-btn recovery" data-reset-devices="${x.id}" data-member="${esc(x.member_id||"")}">รีเซ็ตอุปกรณ์</button>
        <button class="mini-btn recovery-pin" data-reset-pin="${x.id}" data-member="${esc(x.member_id||"")}" data-name="${esc(x.full_name||"สมาชิก")}">รีเซ็ต PIN</button>
        <button class="mini-btn danger delete-member" data-delete-member="${x.id}" data-member="${esc(x.member_id||"")}" data-name="${esc(x.full_name||"สมาชิก")}">ลบสมาชิก</button>
        <button class="mini-btn danger" data-suspend="${x.id}" data-req="${req?.id||""}">ระงับ</button>
      </div>
    </div>`
  }).join("")||'<div class="member-row empty-member">ไม่พบสมาชิกตามเงื่อนไขที่ค้นหา</div>';

  wireMemberButtons($("memberListAdmin"))
}
$("memberSearchAdmin").oninput=renderMembers;
if($("memberDateFrom"))$("memberDateFrom").onchange=renderMembers;
if($("memberDateTo"))$("memberDateTo").onchange=renderMembers;
if($("memberFilterAdmin"))$("memberFilterAdmin").onchange=renderMembers;
if($("memberSearchReset"))$("memberSearchReset").onclick=()=>{
  $("memberSearchAdmin").value="";
  if($("memberFilterAdmin"))$("memberFilterAdmin").value="";
  if($("memberDateFrom"))$("memberDateFrom").value="";
  if($("memberDateTo"))$("memberDateTo").value="";
  renderMembers()
};
$("memberFilterAdmin").onchange=renderMembers;

async function resetMemberDevices(userId,memberId){
  if(!confirm(`รีเซ็ตอุปกรณ์ของ ${memberId||"สมาชิกนี้"} ใช่หรือไม่?\n\nหลังรีเซ็ต อุปกรณ์เดิมทั้งหมดจะถูกปลด และครูสามารถเข้าใช้งานใหม่ได้สูงสุด 2 เครื่อง`))return;
  const {data,error}=await sb.rpc("admin_reset_member_devices",{p_user_id:userId});
  if(error){toast("รีเซ็ตอุปกรณ์ไม่สำเร็จ: "+error.message);return}
  toast(`รีเซ็ตอุปกรณ์แล้ว ✓ ปลด ${Number(data||0)} เครื่อง`);
  await loadAll()
}

async function resetMemberPin(userId,memberId,fullName){
  const pin=prompt(`ตั้งรหัสผ่านใหม่ 6 หลัก\n${fullName||""}${memberId?` • ${memberId}`:""}\n\nกรอกตัวเลข 6 หลัก:`);
  if(pin===null)return;
  const clean=String(pin).trim();
  if(!/^\d{6}$/.test(clean)){toast("PIN ต้องเป็นตัวเลข 6 หลัก");return}
  const confirmPin=prompt("ยืนยัน PIN ใหม่อีกครั้ง:");
  if(confirmPin===null)return;
  if(String(confirmPin).trim()!==clean){toast("PIN ทั้งสองครั้งไม่ตรงกัน");return}

  const {data:{session}}=await sb.auth.getSession();
  if(!session?.access_token){toast("Session Admin หมดอายุ กรุณาเข้าสู่ระบบใหม่");return}

  const resp=await fetch(`${CFG.supabaseUrl}/functions/v1/admin-reset-pin`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "apikey":CFG.supabasePublishableKey,
      "Authorization":`Bearer ${session.access_token}`
    },
    body:JSON.stringify({user_id:userId,new_pin:clean})
  });
  const result=await resp.json().catch(()=>({}));
  if(!resp.ok){toast("รีเซ็ต PIN ไม่สำเร็จ: "+(result.detail||result.error||"กรุณาลองใหม่"));return}
  toast(`รีเซ็ต PIN ของ ${memberId||fullName||"สมาชิก"} สำเร็จ ✓`)
}


async function deleteMemberAccount(userId,memberId,fullName){
  const label=[fullName,memberId].filter(Boolean).join(" • ");
  const ok=confirm(`ลบสมาชิก ${label||"รายนี้"} ออกจากระบบถาวรหรือไม่?\n\nข้อมูลบัญชี ประวัติ Prompt และอุปกรณ์ของสมาชิกจะถูกลบออกจากระบบ และไม่สามารถย้อนกลับได้`);
  if(!ok)return;
  const verify=prompt(`เพื่อยืนยันการลบ กรุณาพิมพ์คำว่า ลบ`);
  if(verify!=="ลบ"){toast("ยกเลิกการลบสมาชิก");return}

  const {data:{session}}=await sb.auth.getSession();
  if(!session?.access_token){toast("Session Admin หมดอายุ กรุณาเข้าสู่ระบบใหม่");return}

  const resp=await fetch(`${CFG.supabaseUrl}/functions/v1/admin-delete-member`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "apikey":CFG.supabasePublishableKey,
      "Authorization":`Bearer ${session.access_token}`
    },
    body:JSON.stringify({user_id:userId})
  });
  const result=await resp.json().catch(()=>({}));
  if(!resp.ok){toast("ลบสมาชิกไม่สำเร็จ: "+(result.detail||result.error||"กรุณาลองใหม่"));return}
  toast(`ลบสมาชิก ${memberId||fullName||""} แล้ว ✓`);
  await loadAll()
}

function wireMemberButtons(root){
  root.querySelectorAll("[data-approve]").forEach(b=>b.onclick=()=>setMember(b.dataset.approve,"active",b.dataset.req));
  root.querySelectorAll("[data-active]").forEach(b=>b.onclick=()=>setMember(b.dataset.active,"active",b.dataset.req));
  root.querySelectorAll("[data-suspend]").forEach(b=>b.onclick=()=>setMember(b.dataset.suspend,"suspended",b.dataset.req))
}
async function setMember(id,status,req=""){
  const {error}=await sb.rpc("admin_set_member",{p_user_id:id,p_status:status,p_role:"member",p_expires_at:null,p_request_id:req||null});
  if(error){toast(error.message);return}toast(status==="active"?"อนุมัติแล้ว ✓":"ระงับแล้ว");await loadAll()
}
$("approveAllBtn").onclick=async()=>{
  const a=profiles.filter(x=>x.role!=="admin"&&x.status==="pending");if(!a.length){toast("ไม่มีคนรออนุมัติ");return}
  $("approveAllBtn").disabled=true;
  for(const x of a){const req=pendingReq(x.id);await sb.rpc("admin_set_member",{p_user_id:x.id,p_status:"active",p_role:"member",p_expires_at:null,p_request_id:req?.id||null})}
  $("approveAllBtn").disabled=false;toast(`อนุมัติ ${a.length} คนแล้ว ✓`);await loadAll()
};

$("createPromoBtn").onclick=async()=>{
  try{
    const days=Number($("promoDays").value||7),max=Number($("promoMax").value||20);
    const row=await createInvite({label:$("promoName").value.trim()||"Promotion",maxUses:max,expiresAt:new Date(Date.now()+days*86400000).toISOString(),autoActivate:false,inviteType:"public_promo",source:"โปรโมชั่น",campaign:$("promoName").value.trim()});
    const link=`${CFG.siteUrl||location.origin}/?invite=${row.code}`;
    $("promoResult").innerHTML=`<div class="quick-result" style="display:block"><b>Code: ${esc(row.code)}</b><div class="link-box">${esc(link)}</div></div>`;
    await navigator.clipboard.writeText(link);toast("สร้าง Code และคัดลอกแล้ว ✓");await loadAll()
  }catch(e){toast(e.message||"สร้าง Code ไม่สำเร็จ")}
};
function renderInvites(){
  $("inviteHistory").innerHTML=invites.map(x=>{
    const link=`${CFG.siteUrl||location.origin}/join.html?invite=${x.code}`;
    const type=x.invite_type==="private_paid"?"💳 หลังชำระเงิน":x.invite_type==="public_promo"?"🎟️ โปรโมชั่น":x.invite_type||"—";
    return `<div class="invite-row"><div class="row-main"><b>${type} • ${esc(x.code)}</b><small>${esc(x.label||"—")} • ${money(x.price_paid)} • ${esc(x.sales_source||"—")}</small><em>ใช้ ${x.used_count||0}/${x.max_uses??"∞"} • หมดอายุ ${d(x.expires_at)} • ${x.auto_activate?"Auto Active":"Pending"}</em></div><button class="mini-btn" data-hcopy="${esc(link)}">คัดลอก</button></div>`
  }).join("")||'<div class="invite-row">ยังไม่มีลิงก์</div>';
  $("inviteHistory").querySelectorAll("[data-hcopy]").forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(b.dataset.hcopy);toast("คัดลอกแล้ว ✓")})
}
function renderUsage(){
  $("usageList").innerHTML=usage.map(x=>`<div class="usage-row"><div class="row-main"><b>${esc(x.product_type||"Prompt")} • ${esc(x.grade||"—")} ${esc(x.subject||"")}</b><small>${esc(x.indicator_code||"—")}</small><em>${new Date(x.created_at).toLocaleString("th-TH")}</em></div></div>`).join("")||'<div class="usage-row">ยังไม่มีข้อมูล</div>'
}
init();
setInterval(()=>{if(user&&profile?.role==="admin")loadAll()},30000);

document.addEventListener("click",e=>{
  const d=e.target.closest("[data-reset-devices]");
  if(d){resetMemberDevices(d.dataset.resetDevices,d.dataset.member);return}
  const p=e.target.closest("[data-reset-pin]");
  if(p){resetMemberPin(p.dataset.resetPin,p.dataset.member,p.dataset.name);return}
  const del=e.target.closest("[data-delete-member]");
  if(del){deleteMemberAccount(del.dataset.deleteMember,del.dataset.member,del.dataset.name);return}
});

document.addEventListener("click",e=>{
  const jump=e.target.closest("[data-tab-jump]");
  if(jump){openTab(jump.dataset.tabJump)}
});

if($("refreshMembersDashboard"))$("refreshMembersDashboard").onclick=async()=>{
  $("refreshMembersDashboard").disabled=true;
  try{await loadAll();toast("อัปเดตรายชื่อสมาชิกแล้ว ✓")}
  finally{$("refreshMembersDashboard").disabled=false}
};

if($("memberNamesSearch"))$("memberNamesSearch").oninput=renderMemberNames;
if($("memberNamesRefresh"))$("memberNamesRefresh").onclick=async()=>{
  $("memberNamesRefresh").disabled=true;
  try{
    await loadAll();
    renderMemberNames();
    toast("อัปเดตรายชื่อสมาชิกแล้ว ✓")
  }finally{
    $("memberNamesRefresh").disabled=false
  }
};

async function renderAdminSupport(){
  const wrap=$("adminSupportList");if(!wrap)return;
  wrap.innerHTML='<div class="loading-note">กำลังโหลดข้อความ...</div>';
  const {data,error}=await sb.from("member_support_messages").select("id,user_id,message_type,subject,message,status,created_at").order("created_at",{ascending:false}).limit(100);
  if(error){wrap.innerHTML=`<div class="loading-note">โหลดไม่ได้: ${esc(error.message)}</div>`;return}
  const profileMap=Object.fromEntries((profiles||[]).map(p=>[p.id,p]));
  const names={question:"❓ คำถาม",suggestion:"💡 คำแนะนำ",contact:"💬 ติดต่อกลับ"};
  wrap.innerHTML=(data||[]).map(x=>{const p=profileMap[x.user_id]||{};return `<article class="support-admin-row"><div><b>${names[x.message_type]||"ข้อความ"} · ${esc(p.full_name||p.member_id||"สมาชิก")}</b><small>${esc(p.member_id||"")} · ${new Date(x.created_at).toLocaleString("th-TH")}</small><h4>${esc(x.subject||"ไม่มีหัวข้อ")}</h4><p>${esc(x.message)}</p></div><div>${x.status==="resolved"?'<span class="status active">ตอบแล้ว</span>':`<button class="mini-btn" data-resolve-support="${x.id}">ทำเครื่องหมายว่าจัดการแล้ว</button>`}</div></article>`}).join("")||'<div class="loading-note">ยังไม่มีข้อความจากสมาชิก</div>';
  wrap.querySelectorAll("[data-resolve-support]").forEach(btn=>btn.onclick=async()=>{const {error}=await sb.from("member_support_messages").update({status:"resolved",resolved_at:new Date().toISOString()}).eq("id",btn.dataset.resolveSupport);if(error)toast(error.message);else renderAdminSupport()})
}
if($("refreshAdminSupport"))$("refreshAdminSupport").onclick=renderAdminSupport;
document.querySelectorAll('[data-tab="support"]').forEach(btn=>btn.addEventListener("click",()=>setTimeout(renderAdminSupport,50)));
