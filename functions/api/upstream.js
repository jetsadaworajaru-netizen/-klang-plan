const UPSTREAM = "https://vyeemrmzlzqaycpbmuyc.supabase.co/auth/v1/settings";
const APIKEY = "sb_publishable_XRFWoASv4QIXFTHzHmAHgQ_aTRLr9eK";

export async function onRequest() {
  try {
    const r = await fetch(UPSTREAM, { headers: { apikey: APIKEY }, redirect: "manual" });
    const text = await r.text();
    return new Response(text, {
      status: r.status,
      headers: {
        "content-type": r.headers.get("content-type") || "application/json; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  } catch (error) {
    return Response.json({ ok:false, error:String(error?.message || error) }, {
      status: 502,
      headers: { "cache-control": "no-store" }
    });
  }
}
