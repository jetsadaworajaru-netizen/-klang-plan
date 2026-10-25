const UPSTREAM = "https://vyeemrmzlzqaycpbmuyc.supabase.co";

export async function onRequest({ request, params }) {
  try {
    const url = new URL(request.url);
    const catchall = params.path;
    const suffix = Array.isArray(catchall) ? catchall.join("/") : String(catchall || "");
    const target = UPSTREAM + "/" + suffix + url.search;

    const headers = new Headers(request.headers);
    for (const name of [
      "host","origin","referer","content-length",
      "cf-connecting-ip","cf-ipcountry","cf-ray","cf-visitor",
      "x-forwarded-for","x-forwarded-proto"
    ]) headers.delete(name);

    const init = {
      method: request.method,
      headers,
      redirect: "manual"
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = await request.arrayBuffer();
    }

    const upstream = await fetch(target, init);
    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("content-length");
    responseHeaders.set("cache-control", "no-store");
    responseHeaders.set("x-klang-backend", "ok");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    return Response.json({
      error: "backend_proxy_error",
      message: error instanceof Error ? error.message : String(error)
    }, {
      status: 502,
      headers: { "cache-control": "no-store" }
    });
  }
}
