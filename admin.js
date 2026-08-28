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
  sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
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

$("switchToUserBtn").onclick=async()=>{
  // Do NOT sign out. Verify current session and move to teacher-facing UI.
  const {data}=await sb.auth.getSession();
  if(!data?.session){toast("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");showLogin();return}
  sessionStorage.setItem("klangAdminUserView","1");
  location.assign("/teacher.html?adminview=1")
};
$("adminPassword").addEventListener("keydown",e=>{if(e.key==="Enter")$("adminLoginBtn").click()});

document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>openTab(b.dataset.tab));
function openTab(tab){
  document.querySelectorAll(".side-tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===tab));
  document.querySelectorAll(".tab-pane").forEach(x=>x.classList.toggle("active",x.id==="tab-"+tab))
}
$("goQuickBtn").onclick=()=>openTab("quick");

async function loadAll(){
  const [p,r,i,u]=await Promise.all([
    sb.from("profiles").select("id,email,full_name,role,status,invite_code,created_at,auth_provider,sales_source,campaign_name,price_paid,payment_status,avatar_url").order("created_at",{ascending:false}),
    sb.from("membership_requests").select("id,user_id,status,invite_code,created_at").order("created_at",{ascending:false}),
    sb.from("invite_codes").select("id,code,label,is_active,max_uses,used_count,expires_at,created_at,invite_type,auto_activate,sales_source,campaign_name,price_paid,payment_note").order("created_at",{ascending:false}).limit(150),
    sb.from("prompt_history").select("created_at,product_type,title,grade,subject,indicator_code,user_id").order("created_at",{ascending:false}).limit(100)
  ]);
  if(p.error||r.error||i.error||u.error){console.error(p.error||r.error||i.error||u.error);toast("โหลดข้อมูลบางส่วนไม่สำเร็จ")}
  profiles=p.data||[];requests=r.data||[];invites=i.data||[];usage=u.data||[];
  renderAll()
}
function renderAll(){renderRecent();renderDashboard();renderPending();renderMembers();renderInvites();renderUsage()}

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
$("quickCreateBtn").onclick=async()=>{
  const btn=$("quickCreateBtn");btn.disabled=true;
  try{
    const days=Number($("qDays")?.value||30);
    const price=$("qPrice")?.value||"";
    const source=$("qSource")?.value||"";
    const campaign=$("qCampaign")?.value?.trim()||"";
    const row=await createInvite({
      label:`Paid member ${new Date().toLocaleString("th-TH")}`,
      maxUses:1,
      expiresAt:new Date(Date.now()+days*86400000).toISOString(),
      autoActivate:true,
      inviteType:"private_paid",
      source,
      campaign,
      price,
      note:"ตรวจสลิปแล้ว"
    });
    currentQuickLink=`${CFG.siteUrl||location.origin}/?invite=${row.code}`;
    $("quickLink").textContent=currentQuickLink;
    $("quickResult").style.display="block";
    try{await navigator.clipboard.writeText(currentQuickLink)}catch{}
    toast("สร้างลิงก์และคัดลอกแล้ว ✓");
    await loadAll()
  }catch(e){
    console.error(e);toast(e.message||"สร้างลิงก์ไม่สำเร็จ")
  }finally{btn.disabled=false}
};
$("copyQuickLink").onclick=async()=>{if(!currentQuickLink)return;try{await navigator.clipboard.writeText(currentQuickLink);toast("คัดลอกแล้ว ✓")}catch{toast("คัดลอกไม่สำเร็จ")}};
$("newQuickInvite").onclick=()=>{$("quickResult").style.display="none";$("quickCreateBtn").focus()};
$("refreshQuick").onclick=loadAll;

function renderRecent(){
  const a=invites.filter(x=>x.invite_type==="private_paid").slice(0,8);
  $("recentInviteList").innerHTML=a.map(x=>{
    const link=`${CFG.siteUrl||location.origin}/?invite=${x.code}`;
    return `<div class="invite-row"><div class="row-main"><b>${esc(x.label||x.code)}</b><small>${esc(x.code)} • ${money(x.price_paid)} • ${esc(x.sales_source||"—")}</small><em>ใช้แล้ว ${x.used_count||0}/${x.max_uses??"∞"} • หมดอายุ ${d(x.expires_at)}</em></div><div class="row-actions"><button class="mini-btn" data-copy="${esc(link)}">คัดลอก</button></div></div>`
  }).join("")||'<div class="invite-row"><div class="row-main"><small>ยังไม่มีลิงก์</small></div></div>';
  $("recentInviteList").querySelectorAll("[data-copy]").forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(b.dataset.copy);toast("คัดลอกแล้ว ✓")})
}
function renderDashboard(){
  const members=profiles.filter(x=>x.role!=="admin");
  $("dMembers").textContent=members.length;$("dActive").textContent=members.filter(x=>x.status==="active").length;
  const pend=members.filter(x=>x.status==="pending").length;$("dPending").textContent=pend;$("sidePendingCount").textContent=pend;
  $("dSales").textContent=money(members.reduce((s,x)=>s+Number(x.price_paid||0),0));
  $("attentionList").innerHTML=pend?`<div class="pending-row"><div class="row-main"><b>${pend} คนรออนุมัติ</b><small>กดไปที่เมนูรออนุมัติ</small></div><button class="mini-btn good" id="attnPending">ดูเลย</button></div>`:'<div class="pending-row"><div class="row-main"><b>✓ ไม่มีคำขอค้าง</b></div></div>';
  $("attnPending")?.addEventListener("click",()=>openTab("pending"));
  const c={};members.forEach(x=>{const k=x.sales_source||x.auth_provider||"ไม่ระบุ";c[k]=(c[k]||0)+1});
  $("sourceList").innerHTML=Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="invite-row"><div class="row-main"><b>${esc(k)}</b></div><b>${v}</b></div>`).join("")||'<div class="invite-row">ยังไม่มีข้อมูล</div>'
}
function pendingReq(userId){return requests.find(r=>r.user_id===userId&&r.status==="pending")}
function renderPending(){
  const a=profiles.filter(x=>x.role!=="admin"&&x.status==="pending");
  $("pendingList").innerHTML=a.map(x=>{
    const req=pendingReq(x.id);
    return `<div class="pending-row"><div class="row-main"><b>${esc(x.full_name||"ไม่ระบุชื่อ")}</b><small>${esc(x.email||"—")} • ${esc(x.invite_code||"ไม่มี Code")}</small><em>${esc(x.sales_source||x.auth_provider||"—")} ${x.campaign_name?"• "+esc(x.campaign_name):""}</em></div><div class="row-actions"><button class="mini-btn good" data-approve="${x.id}" data-req="${req?.id||""}">✓ อนุมัติ</button><button class="mini-btn danger" data-suspend="${x.id}" data-req="${req?.id||""}">ระงับ</button></div></div>`
  }).join("")||'<div class="pending-row"><div class="row-main"><b>✅ ไม่มีสมาชิกที่รออนุมัติ</b><small>ลิงก์หลังชำระเงินจะ Active อัตโนมัติ</small></div></div>';
  wireMemberButtons($("pendingList"))
}
function renderMembers(){
  const q=$("memberSearchAdmin").value.trim().toLowerCase(),f=$("memberFilterAdmin").value;
  const a=profiles.filter(x=>x.role!=="admin").filter(x=>(!f||x.status===f)&&(!q||[x.full_name,x.email,x.invite_code,x.campaign_name,x.sales_source].join(" ").toLowerCase().includes(q)));
  $("memberListAdmin").innerHTML=a.map(x=>{
    const req=pendingReq(x.id);
    return `<div class="member-row"><div class="row-main"><b>${esc(x.full_name||"—")} <span class="status ${esc(x.status)}">${esc(x.status)}</span></b><small>${esc(x.email||"—")} • ${esc(x.auth_provider||"email")}</small><em>Code ${esc(x.invite_code||"—")} • ${esc(x.campaign_name||x.sales_source||"—")} • ${money(x.price_paid)}</em></div><div class="row-actions">${x.status==="pending"?`<button class="mini-btn good" data-approve="${x.id}" data-req="${req?.id||""}">อนุมัติ</button>`:""}<button class="mini-btn" data-active="${x.id}" data-req="${req?.id||""}">Active</button><button class="mini-btn danger" data-suspend="${x.id}" data-req="${req?.id||""}">ระงับ</button></div></div>`
  }).join("")||'<div class="member-row">ไม่พบสมาชิก</div>';
  wireMemberButtons($("memberListAdmin"))
}
$("memberSearchAdmin").oninput=renderMembers;$("memberFilterAdmin").onchange=renderMembers;
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
    const link=`${CFG.siteUrl||location.origin}/?invite=${x.code}`;
    const type=x.invite_type==="private_paid"?"💳 หลังชำระเงิน":x.invite_type==="public_promo"?"🎟️ โปรโมชั่น":x.invite_type||"—";
    return `<div class="invite-row"><div class="row-main"><b>${type} • ${esc(x.code)}</b><small>${esc(x.label||"—")} • ${money(x.price_paid)} • ${esc(x.sales_source||"—")}</small><em>ใช้ ${x.used_count||0}/${x.max_uses??"∞"} • หมดอายุ ${d(x.expires_at)} • ${x.auto_activate?"Auto Active":"Pending"}</em></div><button class="mini-btn" data-hcopy="${esc(link)}">คัดลอก</button></div>`
  }).join("")||'<div class="invite-row">ยังไม่มีลิงก์</div>';
  $("inviteHistory").querySelectorAll("[data-hcopy]").forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(b.dataset.hcopy);toast("คัดลอกแล้ว ✓")})
}
function renderUsage(){
  $("usageList").innerHTML=usage.map(x=>`<div class="usage-row"><div class="row-main"><b>${esc(x.product_type||"Prompt")} • ${esc(x.grade||"—")} ${esc(x.subject||"")}</b><small>${esc(x.indicator_code||"—")}</small><em>${new Date(x.created_at).toLocaleString("th-TH")}</em></div></div>`).join("")||'<div class="usage-row">ยังไม่มีข้อมูล</div>'
}
init();