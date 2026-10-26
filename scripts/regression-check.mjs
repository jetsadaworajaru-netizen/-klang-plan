import fs from "node:fs";

const read=p=>fs.readFileSync(p,"utf8");
const fail=msg=>{console.error("❌ "+msg);process.exitCode=1};
const ok=msg=>console.log("✅ "+msg);

const jsFiles=["member-app.js","admin.js","join.js"];
for(const file of jsFiles){
  const src=read(file);
  try{new Function(src);ok(file+" syntax")}catch(e){fail(file+" syntax: "+e.message)}
  if(src.includes("$$$"))fail(file+" contains forbidden $$$ selector");
}

const pages=["index.html","teacher.html","join.html","member-app.html","admin-panel.html"];
for(const file of pages){
  const html=read(file);
  const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
  const dup=[...new Set(ids.filter((x,i)=>ids.indexOf(x)!==i))];
  if(dup.length)fail(file+" duplicate IDs: "+dup.join(", "));
  else ok(file+" unique IDs");

  const inline=[...html.matchAll(/<script(?:[^>]*)>([\s\S]*?)<\/script>/g)]
    .map(m=>m[1]).filter(x=>x.trim());
  inline.forEach((src,i)=>{
    try{new Function(src);ok(file+" inline script "+(i+1))}
    catch(e){fail(file+" inline script "+(i+1)+": "+e.message)}
  });
}

const member=read("member-app.js");
const memberHtml=read("member-app.html");
const memberIds=new Set([...memberHtml.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));

for(let i=0;i<member.length-3;i++){
  if(member.slice(i,i+3)==='$("'){
    const prev=i>0?member[i-1]:"";
    if(prev==="$")continue;
    const end=member.indexOf('")',i+3);
    if(end<0)continue;
    const arg=member.slice(i+3,end);
    if(arg.startsWith(".")||arg.startsWith("[")||arg.startsWith("#")){
      fail('member-app.js collection selector must use $$: '+arg);
    }
  }
}

const memberIdRefs=[...new Set([...member.matchAll(/(?<!\$)\$\("([A-Za-z][A-Za-z0-9_-]*)"\)/g)].map(m=>m[1]))];
const missingMemberIds=memberIdRefs.filter(id=>!memberIds.has(id));
if(missingMemberIds.length)fail("member-app.js references missing IDs: "+missingMemberIds.join(", "));
else ok("member-app.js DOM IDs exist");

const config=read("config.js");
if(!config.includes('https://vyeemrmzlzqaycpbmuyc.supabase.co'))fail("config.js Supabase project URL changed unexpectedly");
else ok("Supabase project URL");

for(const file of ["config.js","admin.js","member-app.js","teacher.html"]){
  const src=read(file);
  if(/\/api\/(login|refresh|backend)|\/supabase\//.test(src))fail(file+" still references temporary recovery routes");
}
ok("No temporary recovery routes in core files");

const memberVersion=(memberHtml.match(/member-app\.js\?v=(\d+)/)||[])[1];
if(!memberVersion)fail("member-app.html has no cache-busted member-app.js");
else ok("member-app cache version "+memberVersion);

if(process.exitCode)process.exit(process.exitCode);
console.log("\nAll regression checks passed.");
