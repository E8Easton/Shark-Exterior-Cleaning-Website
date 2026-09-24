const { chromium } = require('playwright'); const fs=require('fs');
const P=JSON.parse(fs.readFileSync(__dirname+'/pieces.json'));const only=process.argv[2];
fs.mkdirSync(__dirname+'/out',{recursive:true});
(async()=>{const b=await chromium.launch();
for(const p of P){ if(only && !only.split(',').includes(p.name)) continue;
  const f='file://'+__dirname+'/html/'+p.name+'.html';
  if(p.px){const pg=await b.newPage({viewport:{width:p.w,height:p.h},deviceScaleFactor:2});await pg.goto(f,{waitUntil:'networkidle'});await pg.evaluate(()=>document.fonts.ready);
    await pg.screenshot({path:__dirname+'/out/'+p.name+'.png'});await pg.close();continue;}
  const vw=Math.round(p.w*96), vh=Math.round(p.h*96), dsf=Math.min(8,2400/vw);
  const pg=await b.newPage({viewport:{width:vw,height:vh},deviceScaleFactor:dsf});
  await pg.goto(f,{waitUntil:'networkidle'});await pg.evaluate(()=>document.fonts.ready);
  await pg.pdf({path:__dirname+'/out/'+p.name+'.pdf',width:p.w+'in',height:p.h+'in',printBackground:true,pageRanges:'1'});
  const bl=0.125*96; await pg.screenshot({path:__dirname+'/out/'+p.name+'.png',clip:{x:bl,y:bl,width:vw-2*bl,height:vh-2*bl}});
  await pg.close(); console.log('ok',p.name);}
await b.close();})();
