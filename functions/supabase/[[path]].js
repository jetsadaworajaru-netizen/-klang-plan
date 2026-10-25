const SUPABASE_ORIGIN = "https://vyeemrmzlzqaycpbmuyc.supabase.co";

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const parts = context.params.path;
  const suffix = Array.isArray(parts) ? parts.join("/") : String(parts || "");
  const target = new URL("/" + suffix, SUPABASE_ORIGIN);
  target.search = url.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("cf-connecting-ip");
  headers.delete("cf-ipcountry");
  headers.delete("cf-ray");
  headers.delete("cf-visitor");
  headers.delete("x-forwarded-for");
  headers.delete("x-forwarded-proto");
  headers.set("x-klang-plan-proxy", "1");

  const init = {
    method: request.method,
    headers,
    redirect: "manual"
  };
  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = request.body;
  }

  try {
    const upstream = await fetch(target.toString(), init);
    const outHeaders = new Headers(upstream.headers);
    outHeaders.set("x-klang-plan-upstream", "supabase");
    outHeaders.delete("content-length");
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: outHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "supabase_proxy_unavailable",
      message: String(error && error.message || "upstream fetch failed")
    }), {
      status: 502,
      headers: {"content-type": "application/json; charset=utf-8", "cache-control": "no-store"}
    });
  }
}
