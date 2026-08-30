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
  sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
  setState("ok","ลิงก์เชิญพร้อมใช้งาน",`รหัส ${invite} • คุณครูกรอกข้อมูลด้านล่างได้เลย`,"✅");
  $("joinForm").style.display="block"
}

$("joinForm").addEventListener("submit",async e=>{
  e.preventDefault();clearMsg();
  const fullName=$("fullName").value.trim(),email=$("email").value.trim();
localStorage.setItem("klangRememberEmail",email);localStorage.setItem("klangRememberName",fullName);
  const password=$("password").value,password2=$("password2").value;
  if(!fullName||!email||!password){msg("กรุณากรอกข้อมูลให้ครบ");return}
  if(password.length<6){msg("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");return}
  if(password!==password2){msg("รหัสผ่านทั้งสองช่องไม่ตรงกัน");return}
  const btn=$("joinBtn");btn.disabled=true;
  try{
    const meta={full_name:fullName,school_name:"",phone:"",facebook_name:"",invite_code:invite};
    const {data,error}=await sb.auth.signUp({
      email,password,
      options:{data:meta,emailRedirectTo:(CFG.siteUrl||location.origin)+"/teacher.html"}
    });
    if(error)throw error;
    $("joinForm").style.display="none";
    $("inviteState").style.display="none";
    $("successBox").style.display="block";
    if(data.session){
      $("successText").textContent="สมัครสำเร็จและเปิดสิทธิ์ Member แล้ว กดปุ่มด้านล่างเพื่อเริ่มใช้งานได้ทันที";
    }else{
      $("successText").textContent="สมัครสำเร็จ หากได้รับอีเมลยืนยัน กรุณากดยืนยัน 1 ครั้ง แล้วกลับมาเข้าสู่ระบบ";
    }
  }catch(err){
    console.error(err);
    const t=(err?.message||"สมัครไม่สำเร็จ").toLowerCase();
    if(t.includes("already")||t.includes("registered")) msg("อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบจากหน้าเว็บครู");
    else if(t.includes("invite")||t.includes("code")) msg("ลิงก์เชิญนี้ใช้ไม่ได้ อาจถูกใช้แล้วหรือหมดอายุ กรุณาขอลิงก์ใหม่จาก Admin");
    else msg("สมัครไม่สำเร็จ: "+(err?.message||"กรุณาลองอีกครั้ง"));
    btn.disabled=false
  }
});
init();