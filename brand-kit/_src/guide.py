import re, os
K = '/home/user/Shark-Exterior-Cleaning-Website/brand-kit/'
OUT = '/tmp/claude-0/-home-user-Shark-Exterior-Cleaning-Website/5ad31d0d-418b-5f53-b87a-f77490bfd52b/scratchpad/guide.html'

def svg(rel, cls=''):
    s = open(K + rel).read()
    return re.sub(r' width="[\d.]+" height="[\d.]+"', f' class="{cls}"', s, count=1)

st = lambda w: svg(f'01-Logos/Stacked/SVG/shark-exterior-stacked-{w}.svg', 'lg')
hz = lambda w: svg(f'01-Logos/Horizontal/SVG/shark-exterior-horizontal-{w}.svg', 'lg')
mk = lambda w: svg(f'02-Icons/Mark/SVG/shark-fin-mark-{w}.svg', 'lg')
ap = lambda w: svg(f'02-Icons/App-Icon/SVG/shark-app-icon-{w}.svg', 'lg')

def page(num, kicker, title, body, dark=False):
    return f'''<section class="pg{' dark' if dark else ''}">
  <header><span class="k">{kicker}</span><h2>{title}</h2></header>
  <div class="bd">{body}</div>
  <footer><span>Shark Exterior · Brand Guidelines</span><span>{num:02d}</span></footer>
</section>'''

def tile(inner, label, bg='#fff', fg='#04143C'):
    return f'<figure class="tile" style="background:{bg};color:{fg}"><div class="art">{inner}</div><figcaption>{label}</figcaption></figure>'

colors = [
    ('Shark Blue', '#0463EE', '4, 99, 238', '98, 58, 0, 7', 'Primary — fin, wordmark, buttons, links'),
    ('Signal Orange', '#F86A05', '248, 106, 5', '0, 57, 98, 3', 'Accent — EXTERIOR, calls to action, highlights'),
    ('Deep Navy', '#04143C', '4, 20, 60', '93, 67, 0, 76', 'Backgrounds, headings, reversed layouts'),
    ('Sky', '#0FA3E0', '15, 163, 224', '93, 27, 0, 12', 'Supporting — gradients, water, glow effects'),
    ('White', '#FFFFFF', '255, 255, 255', '0, 0, 0, 0', 'Reversed logo, text on dark'),
]
sw = ''.join(f'''<div class="sw"><div class="chip" style="background:{h}{';box-shadow:inset 0 0 0 1px #d6dbe4' if h=='#FFFFFF' else ''}"></div>
<b>{n}</b><dl><dt>HEX</dt><dd>{h}</dd><dt>RGB</dt><dd>{r}</dd><dt>CMYK</dt><dd>{c}</dd></dl><p>{u}</p></div>''' for n, h, r, c, u in colors)

pages = []
pages.append(f'''<section class="pg cover">
  <div class="cv-logo">{st('reversed')}</div>
  <div class="cv-t"><span class="k">Brand Guidelines · 2026</span><h1>Shark Exterior</h1><p>Logos, colors, type and usage rules for Shark Exterior Cleaning — Lincoln &amp; Kearney, Nebraska.</p></div>
</section>''')

pages.append(page(2, 'Logo', 'Primary logo', f'''
<div class="two">
  {tile(st('full-color'), 'Stacked · full color — use this first')}
  {tile(st('reversed'), 'Stacked · reversed — on navy or photos', '#04143C', '#fff')}
</div>
<p class="note">The stacked logo is the main version. Use it on the website, trucks, yard signs, shirts and anywhere there's room. Every logo file is traced vector artwork, so it stays sharp at any size.</p>'''))

pages.append(page(3, 'Logo', 'Horizontal logo', f'''
<div class="stack">
  {tile(hz('full-color'), 'Horizontal · full color')}
  {tile(hz('reversed'), 'Horizontal · reversed', '#04143C', '#fff')}
</div>
<p class="note">Use the horizontal logo in wide, short spaces like website headers, email signatures, invoices, door hangers and banner ads.</p>'''))

pages.append(page(4, 'Logo', 'Color versions', f'''
<div class="grid3">
  {tile(st('full-color'), 'Full color')}
  {tile(st('orange-fin'), 'Orange fin')}
  {tile(st('navy'), 'Navy · one color')}
  {tile(st('black'), 'Black · one color')}
  {tile(st('white'), 'White · one color', '#0463EE', '#fff')}
  {tile(st('reversed'), 'Reversed', '#04143C', '#fff')}
</div>
<p class="note">Use a one-color version for embroidery, vinyl decals, stamps and single-ink printing. Every version comes in both stacked and horizontal layouts.</p>'''))

cs_art = st('full-color').replace('class="lg"', 'class="lg cs"')
pages.append(page(5, 'Logo', 'Clear space &amp; minimum size', f'''
<div class="two">
  <figure class="tile clear"><div class="art"><div class="cs-box">{cs_art}<i class="x t">X</i><i class="x b">X</i><i class="x l">X</i><i class="x r">X</i></div></div>
  <figcaption>Leave at least <b>X</b> of clear space on every side, where X is the height of the letters in EXTERIOR.</figcaption></figure>
  <div class="mins">
    <div><div class="min" style="width:1.25in">{st('full-color')}</div><b>Stacked</b><span>Minimum 1.25 in / 120 px wide</span></div>
    <div><div class="min" style="width:1.5in">{hz('full-color')}</div><b>Horizontal</b><span>Minimum 1.5 in / 160 px wide</span></div>
    <div><div class="min" style="width:.35in">{mk('blue')}</div><b>Fin mark</b><span>Minimum 0.35 in / 24 px wide</span></div>
  </div>
</div>'''))

pages.append(page(6, 'Icon', 'Fin mark &amp; app icons', f'''
<div class="grid6">
  {tile(mk('blue'), 'Blue')}{tile(mk('orange'), 'Orange')}{tile(mk('orange-blue'), 'Orange + blue')}
  {tile(mk('navy'), 'Navy')}{tile(mk('black'), 'Black')}{tile(mk('white'), 'White', '#04143C', '#fff')}
</div>
<div class="grid6 apps">
  {''.join(f'<div class="app">{ap(k)}<span>{k.replace("-", " + ")}</span></div>' for k in ['blue','orange','navy','blue-orange','navy-orange','white'])}
</div>
<p class="note">Use the fin on its own when the full name is already nearby or space is tight: profile pictures, favicons, stickers, hats and social posts.</p>'''))

fav = ''.join(f'<div class="fv"><img src="{K}04-Favicon/{f}" style="width:{d}px;height:{d}px;image-rendering:{"pixelated" if px else "auto"}"><b>{n}</b><span>{f}</span></div>'
              for f, n, d, px in [('favicon-16x16.png', '16 px', 48, 1), ('favicon-32x32.png', '32 px', 64, 1), ('favicon-48x48.png', '48 px', 72, 1),
                                  ('apple-touch-icon.png', 'Apple touch 180', 90, 0), ('android-chrome-512x512.png', 'Android 512', 90, 0), ('maskable-icon-512x512.png', 'Maskable 512', 90, 0)])
pages.append(page(7, 'Web', 'Favicon &amp; link preview', f'''
<div class="favs">{fav}</div>
<div class="og"><img src="{K}03-Social/og-link-preview-1200x630.png"><p><b>Link preview (1200 × 630)</b><br>This is the image people see when a link to sharkexteriorcleaning.com is shared by text or on Facebook, Messenger, LinkedIn or X. It's already set up on every page of the site.</p></div>'''))

pages.append(page(8, 'Color', 'Color palette', f'<div class="sws">{sw}</div><p class="note">Use Shark Blue as the main color, Deep Navy for dark backgrounds and Signal Orange sparingly for accents and calls to action. On screen, use HEX or RGB. For print, use CMYK and check a proof.</p>'))

pages.append(page(9, 'Type', 'Typography', '''
<div class="type">
  <div class="spec"><span class="k">Primary typeface</span><div class="aa">Lexend</div><p>Free from Google Fonts (fonts.google.com/specimen/Lexend). Use it for the website, flyers, social posts and documents.</p></div>
  <div class="ramp">
    <div style="font-weight:800;font-size:40px;line-height:1.05">Crystal clear, every time.</div><small>Headline · Lexend ExtraBold 800</small>
    <div style="font-weight:600;font-size:22px">Window cleaning, soft washing &amp; gutters</div><small>Subhead · Lexend SemiBold 600</small>
    <div style="font-weight:400;font-size:15px;color:#3b4a66;max-width:420px">We treat every home like our own. Streak-free glass, clean frames and a spotless finish, backed by our 7-Day Rain Guarantee.</div><small>Body · Lexend Regular 400</small>
    <div style="font-weight:600;font-size:12px;letter-spacing:.24em;color:#F86A05">LINCOLN &amp; KEARNEY, NE</div><small>Label · Lexend SemiBold 600, +24% tracking, all caps</small>
  </div>
</div>
<p class="note">The words SHARK and EXTERIOR in the logo are custom artwork. Always use the logo files; never retype the name in a font to stand in for the logo.</p>'''))

pages.append(page(10, 'Social', 'Social media kit', f'''
<div class="soc">
  <figure><img src="{K}03-Social/facebook-cover-1640x624.png" style="width:100%"><figcaption>Facebook cover · 1640 × 624</figcaption></figure>
  <div class="socrow">
    <figure><img src="{K}03-Social/profile-picture-logo-1080.png"><figcaption>Profile picture · logo</figcaption></figure>
    <figure><img src="{K}03-Social/profile-picture-icon-1080.png"><figcaption>Profile picture · fin</figcaption></figure>
    <figure><img src="{K}03-Social/instagram-post-template-1080x1350.png" style="aspect-ratio:1080/1350"><figcaption>Instagram post · 1080 × 1350</figcaption></figure>
  </div>
</div>'''))

logo = st('full-color')
donts = [
    ('stretch', 'Don’t stretch or squash it', 'transform:scale(1.5,.7)'),
    ('recolor', 'Don’t use off-brand colors', 'filter:hue-rotate(110deg)'),
    ('rotate', 'Don’t rotate or tilt it', 'transform:rotate(-14deg)'),
    ('shadow', 'Don’t add shadows or effects', 'filter:drop-shadow(6px 6px 0 #F86A05) drop-shadow(-3px -3px 4px #0FA3E0)'),
    ('busy', 'Don’t place it on busy backgrounds', ''),
    ('contrast', 'Don’t use low contrast', 'opacity:.45'),
]
dd = ''
for k, label, css in donts:
    bg = 'repeating-linear-gradient(45deg,#F86A05 0 14px,#0FA3E0 14px 28px)' if k == 'busy' else ('#0463EE' if k == 'contrast' else '#fff')
    dd += f'<figure class="tile dont" style="background:{bg}"><div class="art"><div style="{css};width:62%">{logo}</div></div><figcaption><i>✕</i>{label}</figcaption></figure>'
pages.append(page(11, 'Usage', 'Logo don’ts', f'<div class="grid3">{dd}</div>'))

pages.append(f'''<section class="pg cover end">
  <div class="cv-logo sm">{hz('reversed')}</div>
  <div class="cv-t"><h1 style="font-size:40px">Questions about the brand?</h1><p>dirtysharkexterior@gmail.com · (402) 309-0128<br>sharkexteriorcleaning.com</p></div>
</section>''')

css = '''
@page{size:11in 8.5in;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Lexend,sans-serif;color:#04143C;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:11in;height:8.5in;padding:.55in .65in .5in;display:flex;flex-direction:column;page-break-after:always;overflow:hidden;background:#fff;position:relative}
.pg header{margin-bottom:.28in}.k{font-size:11px;font-weight:600;letter-spacing:.24em;text-transform:uppercase;color:#F86A05}
.pg h2{font-size:34px;font-weight:800;letter-spacing:-.01em;margin-top:4px}
.bd{flex:1;display:flex;flex-direction:column;gap:.2in;min-height:0}
.pg footer{display:flex;justify-content:space-between;font-size:10px;color:#8a94a6;letter-spacing:.08em;border-top:1px solid #e6eaf0;padding-top:10px;margin-top:.15in}
.note{font-size:13px;line-height:1.55;color:#3b4a66;max-width:7.6in}
.tile{border-radius:16px;box-shadow:inset 0 0 0 1px #e3e8ef;display:flex;flex-direction:column;overflow:hidden;min-height:0}
.tile .art{flex:1;display:flex;align-items:center;justify-content:center;padding:26px;min-height:0}
.tile .lg{max-width:100%;max-height:100%;width:auto;height:auto}
.tile figcaption{font-size:11px;font-weight:500;padding:0 16px 12px;opacity:.75}
.two{display:grid;grid-template-columns:1fr 1fr;gap:.25in;flex:1;min-height:0}
.two .tile .lg{width:78%}
.stack{display:grid;grid-template-rows:1fr 1fr;gap:.22in;flex:1;min-height:0}.stack .lg{width:62%}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:1fr;gap:.18in;flex:1;min-height:0}.grid3 .lg{width:70%}
.grid6{display:grid;grid-template-columns:repeat(6,1fr);gap:.14in}.grid6 .tile{height:1.55in}.grid6 .tile .art{padding:18px}.grid6 .lg{width:80%}
.apps .app{text-align:center;font-size:11px;color:#3b4a66;text-transform:capitalize}.apps .lg{width:1.15in;height:1.15in;display:block;margin:0 auto 6px}
.clear .art{padding:40px}.cs-box{position:relative;width:74%;outline:1.5px dashed #F86A05;outline-offset:22px}.cs-box .lg{width:100%;display:block}
.x{position:absolute;font-style:normal;font-size:11px;font-weight:700;color:#F86A05}.x.t{top:-20px;left:50%}.x.b{bottom:-20px;left:50%}.x.l{left:-18px;top:45%}.x.r{right:-18px;top:45%}
.mins{display:flex;flex-direction:column;justify-content:center;gap:.3in;padding-left:.2in}
.mins>div{display:grid;grid-template-columns:1.7in 1fr;align-items:center;column-gap:16px}.mins .min .lg{width:100%;display:block}
.mins b{font-size:15px;grid-column:2}.mins span{font-size:12px;color:#3b4a66;grid-column:2}.mins .min{grid-row:1/3}
.favs{display:flex;gap:.3in;align-items:flex-end}.fv{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:11px}.fv span{color:#8a94a6;font-size:9.5px}.fv img{border-radius:0}
.og{display:grid;grid-template-columns:4.6in 1fr;gap:.3in;align-items:center;margin-top:.1in}.og img{width:100%;border-radius:12px;box-shadow:0 10px 30px rgba(4,20,60,.18)}.og p{font-size:13px;line-height:1.6;color:#3b4a66}.og b{color:#04143C;font-size:15px}
.sws{display:grid;grid-template-columns:repeat(5,1fr);gap:.18in;flex:1}.chip{height:1.9in;border-radius:14px;margin-bottom:12px}
.sw b{font-size:15px}.sw dl{display:grid;grid-template-columns:44px 1fr;font-size:11.5px;margin:8px 0;row-gap:3px}.sw dt{color:#8a94a6;font-weight:600}.sw p{font-size:11px;color:#3b4a66;line-height:1.45}
.type{display:grid;grid-template-columns:3.4in 1fr;gap:.4in;flex:1}.aa{font-size:80px;font-weight:700;letter-spacing:-.03em;line-height:1;margin:10px 0 14px;color:#0463EE}.spec p{font-size:12.5px;color:#3b4a66;line-height:1.55}
.ramp{display:flex;flex-direction:column;gap:4px}.ramp small{font-size:10.5px;color:#8a94a6;margin-bottom:16px;letter-spacing:.04em}
.soc{display:flex;flex-direction:column;gap:.16in;flex:1;min-height:0}.soc figure{font-size:11px;color:#3b4a66}.soc img{border-radius:10px;display:block;margin-bottom:5px;box-shadow:0 0 0 1px #e3e8ef}
.socrow{display:grid;grid-template-columns:repeat(3,1.9in);gap:.3in}.socrow img{width:100%;aspect-ratio:1}
.soc>figure img{height:2.45in;width:auto!important;max-width:100%}
.dont figcaption{opacity:1;color:#04143C;background:#fff;padding:8px 14px;font-size:11.5px;font-weight:600}.dont i{font-style:normal;color:#e03131;margin-right:6px}
.cover{background:radial-gradient(120% 90% at 85% 0%,#0a4fd0 0%,#06215f 38%,#04143C 70%);color:#fff;justify-content:center;align-items:flex-start;padding:.9in}
.cv-logo{width:4.2in;margin-bottom:.5in}.cv-logo .lg{width:100%}.cv-logo.sm{width:4.6in}
.cover h1{font-size:64px;font-weight:800;letter-spacing:-.02em;margin:8px 0 12px}.cover p{font-size:16px;line-height:1.6;color:#c9d6ee;max-width:6in}
'''
html = f'<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"><style>{css}</style></head><body>{"".join(pages)}</body></html>'
html = html.replace('class="lg"', 'class="lg"')
open(OUT, 'w').write(html)
print('ok', len(pages))
