const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1056,height:816}});
await p.goto('file://'+__dirname+'/guide.html',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
console.log('lexend loaded:',await p.evaluate(()=>document.fonts.check('800 20px Lexend')));
await p.pdf({path:process.argv[2],width:'11in',height:'8.5in',printBackground:true});
await p.emulateMedia({media:'print'});
const n=await p.evaluate(()=>document.querySelectorAll('.pg').length);
for(let i=0;i<n;i++){const el=(await p.$$('.pg'))[i];await el.screenshot({path:`gp-${i+1}.png`});}
await b.close();})();
