const KLANG_DIRECT_SUPABASE_URL = "https://vyeemrmzlzqaycpbmuyc.supabase.co";
const KLANG_USE_PAGES_PROXY = location.hostname === "klang-plan.pages.dev";

window.KLANG_CONFIG = {
  supabaseUrl: KLANG_USE_PAGES_PROXY ? location.origin + "/api/backend" : KLANG_DIRECT_SUPABASE_URL,
  supabaseDirectUrl: KLANG_DIRECT_SUPABASE_URL,
  supabaseProxyEnabled: KLANG_USE_PAGES_PROXY,
  supabasePublishableKey: "sb_publishable_XRFWoASv4QIXFTHzHmAHgQ_aTRLr9eK",
  siteUrl: window.location.origin,
  appName: "คลังแผนการสอนหน้าเดียว",
  salesContactUrl: "",
  facebookOAuthEnabled: false
};
