const UPSTREAM = "https://vyeemrmzlzqaycpbmuyc.supabase.co";

export async function onRequest({ request, params }) {
  try {
    const url = new URL(request.url);
    const catchall = params.path;
    const suffix = Array.isArray(catchall) ? catchall.join("/") : String(catchall || "");
    const target = UPSTREAM + "/" + suffix + url.search;

    const incoming = request.headers;
    const headers = new Headers();
    for (const name of [
      "apikey","authorization","content-type","accept",
      "prefer","range","accept-profile","content-profile",
      "x-client-info"
    ]) {
      const value = incoming.get(name);
      if (value) headers.set(name, value);
    }

    const init = { method: request.method, headers, redirect: "manual" };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = await request.arrayBuffer();
    }

    const upstream = await fetch(target, init);
    const responseHeaders = new Headers();
    for (const name of [
      "content-type","content-range","range","location",
      "www-authenticate","x-supabase-api-version"
    ]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    responseHeaders.set("cache-control", "no-store");
    responseHeaders.set("x-klang-backend", "ok");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "backend_proxy_error",
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 502,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }
}
