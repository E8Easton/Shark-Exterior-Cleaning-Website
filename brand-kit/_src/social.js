const { chromium } = require('playwright'); const fs=require('fs');
const K='/home/user/Shark-Exterior-Cleaning-Website/brand-kit/';
const svg=(f)=>fs.readFileSync(K+f,'utf8').replace(/ width="[\d.]+" height="[\d.]+"/,' width="100%" height="100%"');
const stackedRev=svg('01-Logos/Stacked/SVG/shark-exterior-stacked-reversed.svg');
const horizRev=svg('01-Logos/Horizontal/SVG/shark-exterior-horizontal-reversed.svg');
const icon=svg('02-Icons/App-Icon/SVG/shark-app-icon-blue.svg');
const font=`<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700;800&display=swap" rel="stylesheet">`;
const bg=`background:radial-gradient(900px 600px at 85% 0%,rgba(4,99,238,.55),transparent 60%),radial-gradient(700px 500px at 0% 110%,rgba(248,106,5,.35),transparent 60%),linear-gradient(160deg,#0A2152,#04143C 65%,#020C26);`;
const pages={
 '03-Social/og-link-preview-1200x630.png':[1200,630,`<div style="width:1200px;height:630px;${bg}display:flex;align-items:center;gap:70px;padding:0 80px;box-sizing:border-box;font-family:Lexend">
   <div style="width:430px;flex:none">${stackedRev}</div>
   <div style="color:#fff"><div style="color:#FF9A4D;font-weight:600;letter-spacing:.14em;font-size:26px">LINCOLN &amp; KEARNEY, NE</div>
   <div style="font-size:64px;font-weight:800;line-height:1.05;margin:14px 0 18px">Exterior Cleaning<br>Done Right.</div>
   <div style="font-size:24px;color:rgba(255,255,255,.82);line-height:1.5">Window cleaning · Soft washing<br>Power washing · Gutters · Holiday lighting</div>
   <div style="display:inline-block;margin-top:26px;padding:14px 28px;border-radius:999px;background:#F86A05;font-weight:700;font-size:26px">(402) 309-0128</div></div></div>`],
 '03-Social/profile-picture-logo-1080.png':[1080,1080,`<div style="width:1080px;height:1080px;${bg}display:grid;place-items:center"><div style="width:700px">${stackedRev}</div></div>`],
 '03-Social/profile-picture-icon-1080.png':[1080,1080,`<div style="width:1080px;height:1080px;background:#0463EE;display:grid;place-items:center"><div style="width:1080px;height:1080px">${icon.replace(/<rect[^>]*>/,'')}</div></div>`],
 '03-Social/facebook-cover-1640x624.png':[1640,624,`<div style="width:1640px;height:624px;${bg}display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;font-family:Lexend">
   <div style="width:900px">${horizRev}</div>
   <div style="color:#fff;font-size:34px;font-weight:500;letter-spacing:.02em">Window Cleaning · Soft Washing · Power Washing · Gutters · Holiday Lighting</div>
   <div style="color:#FF9A4D;font-size:26px;font-weight:600;letter-spacing:.16em">LINCOLN &amp; KEARNEY, NEBRASKA · (402) 309-0128</div></div>`],
 '03-Social/instagram-post-template-1080x1350.png':[1080,1350,`<div style="width:1080px;height:1350px;${bg}display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:90px 80px;box-sizing:border-box;font-family:Lexend;color:#fff;text-align:center">
   <div style="width:520px">${stackedRev}</div>
   <div style="font-size:88px;font-weight:800;line-height:1.05">Crystal Clear<br><span style="color:#F86A05">Every Time.</span></div>
   <div style="font-size:32px;color:rgba(255,255,255,.85)">Free quotes · sharkexteriorcleaning.com<br>(402) 309-0128</div></div>`],
};
(async()=>{const b=await chromium.launch();
for (const [out,[w,h,html]] of Object.entries(pages)){const p=await b.newPage({viewport:{width:w,height:h}});
 await p.setContent(`<html><head>${font}</head><body style="margin:0">${html}</body></html>`,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
 fs.mkdirSync(K+'03-Social',{recursive:true}); await p.screenshot({path:K+out}); await p.close(); console.log(out);}
await b.close();})();
