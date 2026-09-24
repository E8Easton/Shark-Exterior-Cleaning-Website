const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
const jobs=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
(async()=>{const b=await chromium.launch();
for (const [svgFile,png,w] of jobs){
  const svg=fs.readFileSync(svgFile,'utf8'); const m=svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/);
  const vw=+m[3], vh=+m[4]; const h=Math.round(w*vh/vw);
  const p=await b.newPage({viewport:{width:w,height:h}});
  const sized=svg.replace(/width="[\d.]+" height="[\d.]+"/,`width="${w}" height="${h}"`);
  await p.setContent(`<html><body style="margin:0;background:transparent">${sized}</body></html>`);
  fs.mkdirSync(path.dirname(png),{recursive:true});
  await p.screenshot({path:png,omitBackground:true,clip:{x:0,y:0,width:w,height:h}}); await p.close();
}
await b.close();})();
