const CFG=window.KLANG_CONFIG||{};
const $=id=>document.getElementById(id);
let sb=null;
const invite=new URLSearchParams(location.search).get("invite")?.trim()||"";

function setState(type,title,sub,icon){
  const e=$("inviteState");e.className="invite-state "+type;
  e.innerHTML=`<span>${icon}</span><div><b>${title}</b><small>${sub}</small></div>`
}
function msg(text,type="bad"){$("joinMsg").innerHTML=`<div class="msg ${type}">${text}</div>`}
function clearMsg(){$("joinMsg").innerHTML=""}

async function init(){
  if(!invite){
    setState("bad","ไม่พบรหัสเชิญ","กรุณาเปิดลิงก์ที่ได้รับจาก Admin","⚠️");
    msg("ลิงก์นี้ไม่สมบูรณ์ กรุณาขอลิงก์เชิญใหม่จาก Admin");return
  }
  $("inviteCode").value=invite;
  if(!CFG.supabaseUrl||!CFG.supabasePublishableKey||!window.supabase){
    setState("bad","ระบบยังไม่พร้อม","ไม่สามารถเชื่อมระบบสมาชิกได้","⚠️");return
  }
  sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,storageKey:"klang-member-auth"}});
  setState("ok","ลิงก์เชิญพร้อมใช้งาน",`รหัส ${invite} • คุณครูกรอกข้อมูลด้านล่างได้เลย`,"✅");
  $("joinForm").style.display="block"
}

$("joinForm").addEventListener("submit",async e=>{
  e.preventDefault();clearMsg();
  const fullName=$("fullName").value.trim();
  const password=$("password").value.trim(),password2=$("password2").value.trim();
  if(!fullName||!password){msg("กรุณากรอกชื่อและรหัสผ่านให้ครบ");return}
  if(!/^\d{6}$/.test(password)){msg("รหัสผ่านต้องเป็นตัวเลข 6 หลัก");return}
  if(password!==password2){msg("รหัสผ่านทั้งสองช่องไม่ตรงกัน");return}

  const btn=$("joinBtn");btn.disabled=true;
  try{
    const endpoint=`${CFG.supabaseUrl}/functions/v1/join-member`;
    const resp=await fetch(endpoint,{
      method:"POST",
      headers:{"Content-Type":"application/json","apikey":CFG.supabasePublishableKey},
      body:JSON.stringify({password,full_name:fullName,invite_code:invite})
    });
    const result=await resp.json().catch(()=>({}));
    if(!resp.ok){
      if(result.error==="invalid_or_expired_invite") throw new Error("invalid_or_expired_invite");
      throw new Error(result.detail||result.error||"สมัครไม่สำเร็จ");
    }

    const memberId=String(result.member_id||"").toUpperCase();
    const loginEmail=result.login_email;
    if(!memberId||!loginEmail)throw new Error("member_id_missing");

    const {error:loginError}=await sb.auth.signInWithPassword({email:loginEmail,password});
    if(loginError)throw loginError;

    localStorage.setItem("klangRememberMemberId",memberId);
    localStorage.setItem("klangRememberName",fullName);

    $("joinForm").style.display="none";
    $("inviteState").style.display="none";
    $("successBox").style.display="block";
    $("createdMemberId").textContent=memberId;
    $("successText").textContent="สมัครสำเร็จและเปิดสิทธิ์ Member แล้ว เข้าใช้งานได้ทันที";
    $("copyMemberId").onclick=async()=>{
      try{await navigator.clipboard.writeText(memberId);msg("คัดลอก Member ID แล้ว ✓","ok")}
      catch{msg("Member ID: "+memberId,"ok")}
    };
  }catch(err){
    console.error(err);
    const t=(err?.message||"สมัครไม่สำเร็จ").toLowerCase();
    if(t.includes("invalid_or_expired_invite")||t.includes("invite")) msg("ลิงก์เชิญนี้ถูกใช้แล้ว หมดอายุ หรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่จาก Admin");
    else msg("สมัครไม่สำเร็จ: "+(err?.message||"กรุณาลองอีกครั้ง"));
    btn.disabled=false
  }
});
init();