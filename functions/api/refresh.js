const SUPABASE_URL = "https://vyeemrmzlzqaycpbmuyc.supabase.co";
const APIKEY = "sb_publishable_XRFWoASv4QIXFTHzHmAHgQ_aTRLr9eK";

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const refresh_token = String(body?.refresh_token || "");
    if (!refresh_token) return Response.json({ error:"missing_refresh_token" }, { status:400 });

    const upstream = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=refresh_token", {
      method:"POST",
      headers:{ "apikey":APIKEY, "content-type":"application/json", "accept":"application/json" },
      body:JSON.stringify({ refresh_token })
    });
    const text = await upstream.text();
    let data={}; try{ data=text?JSON.parse(text):{} }catch{ data={raw:text} }

    if(!upstream.ok){
      return Response.json({
        error:data?.error||data?.error_code||"refresh_failed",
        message:data?.msg||data?.message||data?.error_description||upstream.statusText||"refresh failed",
        upstream_status:upstream.status
      }, { status:upstream.status>=500?502:upstream.status, headers:{"cache-control":"no-store"} });
    }
    return Response.json(data,{status:200,headers:{"cache-control":"no-store"}});
  } catch(error){
    return Response.json({error:"refresh_gateway_error",message:error instanceof Error?error.message:String(error)},{
      status:502,headers:{"cache-control":"no-store"}
    });
  }
}

export function onRequest(){
  return Response.json({ok:true,endpoint:"refresh",method:"POST"},{status:405,headers:{"cache-control":"no-store"}});
}
