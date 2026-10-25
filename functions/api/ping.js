export function onRequest() {
  return Response.json({ ok: true, service: "klang-plan-pages-functions" }, {
    headers: { "cache-control": "no-store" }
  });
}
