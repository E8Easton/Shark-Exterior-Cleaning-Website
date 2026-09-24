import re, os, json, qrcode
R = '/home/user/Shark-Exterior-Cleaning-Website/'
K = R + 'brand-kit/'
OUT = os.path.dirname(os.path.abspath(__file__)) + '/html/'
os.makedirs(OUT, exist_ok=True)
IMG = 'file://' + R + 'images/'

BLUE, ORANGE, NAVY, SKY = '#0463EE', '#F86A05', '#04143C', '#0FA3E0'
PHONE, WEB, EMAIL = '(402) 309-0128', 'sharkexteriorcleaning.com', 'dirtysharkexterior@gmail.com'
BLEED = .125


def logo(rel):
    s = open(K + rel).read()
    return re.sub(r' width="[\d.]+" height="[\d.]+"', ' width="100%" height="100%" preserveAspectRatio="xMidYMid meet"', s, count=1)

ST_REV = logo('01-Logos/Stacked/SVG/shark-exterior-stacked-reversed.svg')
ST_FULL = logo('01-Logos/Stacked/SVG/shark-exterior-stacked-full-color.svg')
HZ_REV = logo('01-Logos/Horizontal/SVG/shark-exterior-horizontal-reversed.svg')
HZ_FULL = logo('01-Logos/Horizontal/SVG/shark-exterior-horizontal-full-color.svg')
FIN_W = logo('02-Icons/Mark/SVG/shark-fin-mark-white.svg')
FIN_B = logo('02-Icons/Mark/SVG/shark-fin-mark-blue.svg')


def qr(src, color=NAVY):
    q = qrcode.QRCode(border=0, error_correction=qrcode.constants.ERROR_CORRECT_M)
    q.add_data(f'https://{WEB}/quote.html?utm_source={src}&utm_medium=print&utm_campaign=print_{src}')
    q.make(fit=True)
    m = q.get_matrix(); n = len(m)
    d = ''.join(f'M{x} {y}h1v1h-1z' for y, row in enumerate(m) for x, v in enumerate(row) if v)
    return f'<svg viewBox="0 0 {n} {n}" width="100%" height="100%" shape-rendering="crispEdges"><path fill="{color}" d="{d}"/></svg>'


# simple stroke icons (24 grid)
IC = {
    'phone': '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    'mail': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    'web': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    'pin': '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    'check': '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'shield': '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.6 7.5 9.5 4.3-.9 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12 2.3 2.3 4.3-4.6"/>',
    'drop': '<path d="M12 3.5s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    'star': '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"/>',
    'smile': '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
}
def icon(k, color='currentColor', sw=2, fill='none'):
    return f'<svg viewBox="0 0 24 24" width="100%" height="100%" fill="{fill}" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{IC[k]}</svg>'

def stars(color=ORANGE):
    return ''.join(f'<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="{color}" d="{IC["star"][9:-3]}"/></svg>' for _ in range(5))


def waves(opacity=1):
    # layered decorative waves, drawn in a 1000x200 box
    return f'''<svg viewBox="0 0 1000 200" preserveAspectRatio="none" width="100%" height="100%" style="opacity:{opacity}">
<path fill="{SKY}" fill-opacity=".22" d="M0 90 C170 30 330 150 500 95 C670 40 830 140 1000 70 V200 H0Z"/>
<path fill="{BLUE}" fill-opacity=".55" d="M0 130 C180 80 320 180 520 125 C700 75 840 165 1000 115 V200 H0Z"/>
<path fill="{BLUE}" d="M0 165 C200 125 360 205 560 160 C730 122 860 190 1000 150 V200 H0Z"/></svg>'''


BASE_CSS = f'''
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{background:#fff}}
body{{font-family:Lexend,sans-serif;color:{NAVY};-webkit-print-color-adjust:exact;print-color-adjust:exact;-webkit-font-smoothing:antialiased}}
.sheet{{position:relative;overflow:hidden}}
.abs{{position:absolute}}
.k{{font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:{ORANGE}}}
.navy{{background:radial-gradient(110% 90% at 88% 0%,#0b56d9 0%,#07266e 34%,{NAVY} 68%)}}
.ic{{display:inline-block;flex:none}}
.row{{display:flex;align-items:center}}
'''

pieces = []

def piece(name, title, w, h, body, css='', note=''):
    W, H = w + 2 * BLEED, h + 2 * BLEED
    html = f'''<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>@page{{size:{W}in {H}in;margin:0}}{BASE_CSS}.sheet{{width:{W}in;height:{H}in}}{css}</style></head>
<body><div class="sheet">{body}</div></body></html>'''
    open(OUT + name + '.html', 'w').write(html)
    pieces.append({'name': name, 'title': title, 'w': W, 'h': H, 'trim': [w, h], 'note': note})


# ---------------------------------------------------------------- BUSINESS CARDS (3.5 x 2)
B = BLEED
piece('business-card-front', 'Business card — front', 3.5, 2, f'''
<div class="abs navy" style="inset:0"></div>
<div class="abs" style="left:0;right:0;bottom:0;height:.62in">{waves()}</div>
<div class="abs" style="left:50%;top:.34in;width:1.55in;height:1.08in;transform:translateX(-50%)">{ST_REV}</div>
''')

def card_back(name, role, src):
    person = f'''<div style="font-size:12.5pt;font-weight:800;letter-spacing:-.01em;line-height:1">{name}</div>
<div class="k" style="font-size:5.6pt;margin-top:.05in">{role}</div>''' if name else f'''<div style="height:.28in;width:1.45in">{HZ_FULL}</div>'''
    return f'''
<div class="abs" style="inset:0;background:#fff"></div>
<div class="abs" style="left:{B+.2}in;top:{B+.26}in;width:2.05in">
  {person}
  <div style="margin-top:.17in;display:flex;flex-direction:column;gap:.07in;font-size:6.9pt;font-weight:500">
    <div class="row" style="gap:.06in"><span class="ic" style="width:.12in;height:.12in;color:{BLUE}">{icon('phone')}</span><b style="font-weight:700;font-size:8pt">{PHONE}</b></div>
    <div class="row" style="gap:.06in"><span class="ic" style="width:.12in;height:.12in;color:{BLUE}">{icon('mail')}</span>{EMAIL}</div>
    <div class="row" style="gap:.06in"><span class="ic" style="width:.12in;height:.12in;color:{BLUE}">{icon('web')}</span>{WEB}</div>
    <div class="row" style="gap:.06in"><span class="ic" style="width:.12in;height:.12in;color:{BLUE}">{icon('pin')}</span>Lincoln &amp; Kearney, NE</div>
  </div>
</div>
<div class="abs" style="right:{B+.2}in;top:{B+.27}in;width:.86in;text-align:center">
  <div style="width:.86in;height:.86in;padding:.05in;border-radius:.08in;box-shadow:0 0 0 .012in #d9e1ee">{qr(src)}</div>
  <div style="font-size:5.4pt;font-weight:700;margin-top:.05in;line-height:1.2">Scan for a<br><span style="color:{ORANGE}">free quote</span></div>
</div>
<div class="abs" style="left:0;right:0;bottom:0;height:{B+.27}in;background:{BLUE};color:#fff;font-size:5.6pt;font-weight:600;letter-spacing:.04em;display:flex;align-items:flex-start;justify-content:center;padding-top:.085in">
  Windows &nbsp;·&nbsp; Soft Washing &nbsp;·&nbsp; Power Washing &nbsp;·&nbsp; Gutters &nbsp;·&nbsp; Holiday Lighting</div>
<div class="abs" style="left:0;right:0;bottom:{B+.27}in;height:.03in;background:{ORANGE}"></div>
'''
piece('business-card-back-easton', 'Business card — back (Easton)', 3.5, 2, card_back('Easton Zastrow', 'Owner', 'business_card'))
piece('business-card-back-team', 'Business card — back (no name)', 3.5, 2, card_back('', '', 'business_card'))

# ---------------------------------------------------------------- FLYER (8.5 x 11)
svc = [('svc-exterior', 'Window Cleaning', 'Inside &amp; out, streak-free'),
       ('svc-softwash', 'Soft Washing', 'Siding, roofs &amp; stucco'),
       ('svc-powerwash', 'Power Washing', 'Driveways, patios &amp; walks'),
       ('svc-gutter', 'Gutter Cleaning', 'Cleared &amp; flushed'),
       ('svc-christmas', 'Holiday Lighting', 'Installed &amp; taken down'),
       ('svc-commercial', 'Commercial', 'Storefronts &amp; offices')]
svc_cards = ''.join(f'''<div class="sv"><div class="ph" style="background-image:url({IMG}{f}.jpg)"></div><b>{t}</b><span>{d}</span></div>''' for f, t, d in svc)
trust = [('star', '5.0 Google rating'), ('shield', 'Fully insured &amp; bonded'), ('drop', '7-Day Rain Guarantee'), ('smile', '100% satisfaction guarantee')]
trust_row = ''.join(f'<div class="tr"><span class="ic" style="width:.26in;height:.26in;color:{BLUE}">{icon(k)}</span><span>{t}</span></div>' for k, t in trust)

piece('flyer-8.5x11', 'Flyer — 8.5 × 11 in', 8.5, 11, f'''
<div class="abs" style="left:0;right:0;top:0;height:5.35in;background:url({IMG}step2-squeegee.jpg) 38% 50%/cover"></div>
<div class="abs" style="left:0;right:0;top:0;height:5.35in;background:linear-gradient(180deg,rgba(4,20,60,.55) 0%,rgba(4,20,60,.12) 28%,rgba(4,20,60,.35) 55%,{NAVY} 100%)"></div>
<div class="abs" style="left:0;right:0;top:0;height:5.35in;background:linear-gradient(90deg,rgba(4,20,60,.78) 0%,rgba(4,20,60,.45) 45%,rgba(4,20,60,0) 75%)"></div>
<div class="abs" style="left:{B+.5}in;top:{B+.45}in;width:2.6in;height:.58in">{HZ_REV}</div>
<div class="abs" style="left:{B+.5}in;top:{B+2.55}in;color:#fff">
  <div class="k" style="font-size:10pt;color:#ffb27a">Lincoln &amp; Kearney, Nebraska</div>
  <div style="font-size:50pt;font-weight:800;line-height:.98;letter-spacing:-.02em;margin-top:.1in">Crystal clear.<br><span style="color:{ORANGE}">Every time.</span></div>
</div>
<div class="abs" style="left:0;right:0;top:5.35in;bottom:0;background:#fff"></div>
<div class="abs" style="left:{B+.5}in;right:{B+.5}in;top:5.62in">
  <div style="font-size:13pt;font-weight:500;color:#3b4a66;line-height:1.4">Professional window cleaning and exterior care for homes and businesses. Bright glass, clean siding, clear gutters.</div>
  <div class="svs">{svc_cards}</div>
  <div class="trs">{trust_row}</div>
</div>
<div class="abs navy" style="left:0;right:0;bottom:0;height:{B+1.98}in"></div>
<div class="abs" style="left:{B+.5}in;right:{B+.5}in;bottom:{B+.35}in;display:flex;align-items:center;gap:.35in;color:#fff">
  <div style="flex:1">
    <div class="badge">Bundle 2+ services &amp; save up to 20%</div>
    <div style="font-size:30pt;font-weight:800;letter-spacing:-.01em;margin-top:.1in;line-height:1">{PHONE}</div>
    <div style="font-size:11.5pt;font-weight:500;color:#c9d6ee;margin-top:.06in">{WEB} &nbsp;·&nbsp; Free quotes</div>
  </div>
  <div style="text-align:center"><div style="width:1.12in;height:1.12in;background:#fff;padding:.08in;border-radius:.1in">{qr('flyer')}</div>
  <div style="font-size:8pt;font-weight:700;margin-top:.06in">Scan for a free quote</div></div>
</div>
''', css=f'''
.svs{{display:grid;grid-template-columns:repeat(3,1fr);gap:.24in .2in;margin-top:.34in}}
.sv{{display:grid;grid-template-columns:.62in 1fr;grid-template-rows:auto auto;column-gap:.12in;align-items:center}}
.sv .ph{{grid-row:1/3;width:.62in;height:.62in;border-radius:.14in;background-size:cover;background-position:center}}
.sv b{{font-size:11pt;font-weight:700;align-self:end}}.sv span{{font-size:8.5pt;color:#5a6882;align-self:start}}
.trs{{display:grid;grid-template-columns:repeat(4,1fr);gap:.12in;margin-top:.38in;padding-top:.26in;border-top:.012in solid #e3e8ef}}
.tr{{display:flex;align-items:center;gap:.08in;font-size:8.6pt;font-weight:600;line-height:1.2}}
.badge{{display:inline-block;background:{ORANGE};color:#fff;font-weight:700;font-size:10.5pt;padding:.07in .16in;border-radius:1in}}
''')

# ---------------------------------------------------------------- DOOR HANGER (4.25 x 11)
checks = ['Window cleaning — inside &amp; out', 'Soft washing — siding &amp; roofs', 'Power washing — driveways &amp; patios', 'Gutter cleaning', 'Holiday light installation']
piece('door-hanger-4.25x11', 'Door hanger — 4.25 × 11 in', 4.25, 11, f'''
<div class="abs navy" style="left:0;right:0;top:0;height:{B+4.2}in"></div>
<div class="abs" style="left:0;right:0;top:{B+3.55}in;height:.7in">{waves()}</div>
<div class="abs" style="left:50%;top:{B+2.0}in;width:2.2in;height:1.5in;transform:translateX(-50%)">{ST_REV}</div>
<div class="abs" style="left:0;right:0;top:{B+4.2}in;height:2.1in;background:url({IMG}why-us-home.jpg) 50% 60%/cover"></div>
<div class="abs" style="left:{B+.3}in;right:{B+.3}in;top:{B+6.5}in">
  <div class="k" style="font-size:7.5pt">Hi neighbor!</div>
  <div style="font-size:21pt;font-weight:800;line-height:1.05;letter-spacing:-.01em;margin-top:.06in">We're cleaning homes<br>in your neighborhood.</div>
  <div style="margin-top:.16in;display:flex;flex-direction:column;gap:.07in">{''.join(f'<div class="row" style="gap:.08in;font-size:9pt;font-weight:500"><span class="ic" style="width:.17in;height:.17in;border-radius:50%;background:{BLUE};padding:.025in">{icon("check", "#fff", 3)}</span>{c}</div>' for c in checks)}</div>
  <div class="row" style="margin-top:.2in;gap:.1in;font-size:8pt;font-weight:600;color:#3b4a66"><span style="display:flex;width:.8in;height:.15in">{stars()}</span>5.0 on Google · Fully insured</div>
</div>
<div class="abs navy" style="left:0;right:0;bottom:0;height:{B+1.55}in"></div>
<div class="abs" style="left:{B+.3}in;right:{B+.3}in;bottom:{B+.28}in;display:flex;align-items:center;gap:.18in;color:#fff">
  <div style="flex:1"><div class="badge">Bundle &amp; save up to 20%</div>
  <div style="font-size:17pt;font-weight:800;margin-top:.08in">{PHONE}</div><div style="font-size:7.6pt;color:#c9d6ee;margin-top:.03in">{WEB}</div></div>
  <div style="width:.95in;height:.95in;background:#fff;padding:.06in;border-radius:.08in">{qr('door_hanger')}</div>
</div>
''', css=f'.badge{{display:inline-block;background:{ORANGE};color:#fff;font-weight:700;font-size:8pt;padding:.05in .12in;border-radius:1in}}',
      note='Top 1.9 in kept clear for the door-knob hole. Most printers apply their own die cut.')

# ---------------------------------------------------------------- POSTCARD 6 x 9 (front / back)
piece('postcard-6x9-front', 'Postcard — 6 × 9 in, front', 9, 6, f'''
<div class="abs" style="inset:0;background:url({IMG}why-us-home.jpg) 50% 55%/cover"></div>
<div class="abs" style="inset:0;background:linear-gradient(90deg,rgba(4,20,60,.94) 0%,rgba(4,20,60,.78) 42%,rgba(4,20,60,.05) 75%)"></div>
<div class="abs" style="left:{B+.45}in;top:{B+.42}in;width:2.4in;height:.53in">{HZ_REV}</div>
<div class="abs" style="left:{B+.45}in;top:{B+1.55}in;color:#fff;width:4.6in">
  <div class="k" style="font-size:9pt;color:#ffb27a">Lincoln &amp; Kearney, NE</div>
  <div style="font-size:36pt;font-weight:800;line-height:1.02;letter-spacing:-.02em;margin-top:.08in">Your home,<br><span style="color:{ORANGE}">spotless.</span></div>
  <div style="font-size:11pt;color:#d5e0f3;margin-top:.14in;line-height:1.45">Windows, siding, driveways and gutters, cleaned by a local team that treats your home like its own.</div>
  <div class="row" style="gap:.14in;margin-top:.24in"><span class="badge">Free quotes · {PHONE}</span></div>
</div>
''', css=f'.badge{{display:inline-block;background:{ORANGE};color:#fff;font-weight:700;font-size:11pt;padding:.08in .2in;border-radius:1in}}')

piece('postcard-6x9-back', 'Postcard — 6 × 9 in, back', 9, 6, f'''
<div class="abs" style="inset:0;background:#fff"></div>
<div class="abs navy" style="left:0;top:0;bottom:0;width:{B+4.55}in"></div>
<div class="abs" style="left:{B+.4}in;top:{B+.4}in;width:3.75in;color:#fff">
  <div class="k" style="font-size:8pt">What we do</div>
  <div style="margin-top:.12in;display:flex;flex-direction:column;gap:.085in">{''.join(f'<div class="row" style="gap:.1in;font-size:10.5pt;font-weight:500"><span class="ic" style="width:.19in;height:.19in;border-radius:50%;background:{BLUE};padding:.03in">{icon("check", "#fff", 3)}</span>{c}</div>' for c in checks)}</div>
  <div style="margin-top:.28in;display:flex;flex-direction:column;gap:.06in;font-size:8.6pt;color:#c9d6ee">
    <div class="row" style="gap:.08in"><span style="display:flex;width:.75in;height:.14in">{stars()}</span>5.0 on Google</div>
    <div>Fully insured &amp; bonded · 7-Day Rain Guarantee</div></div>
  <div class="row" style="gap:.2in;margin-top:.3in">
    <div style="width:1in;height:1in;background:#fff;padding:.06in;border-radius:.08in">{qr('postcard')}</div>
    <div><div style="font-size:8pt;font-weight:600;color:#ffb27a">Scan for a free quote</div>
    <div style="font-size:18pt;font-weight:800;margin-top:.03in">{PHONE}</div><div style="font-size:8.5pt;color:#c9d6ee">{WEB}</div></div></div>
</div>
<div class="abs" style="right:{B+.35}in;top:{B+.35}in;width:.85in;height:1in;border:.015in dashed #aab4c5;display:flex;align-items:center;justify-content:center;text-align:center;font-size:6.5pt;color:#8a94a6;font-weight:600">PLACE<br>STAMP<br>HERE</div>
<div class="abs" style="left:{B+4.95}in;top:{B+.4}in;width:1.4in;height:.33in">{HZ_FULL}</div>
<div class="abs" style="left:{B+4.95}in;right:{B+.35}in;bottom:{B+1.25}in;display:flex;flex-direction:column;gap:.3in">
  <div style="border-bottom:.012in solid #c3cad6"></div><div style="border-bottom:.012in solid #c3cad6"></div><div style="border-bottom:.012in solid #c3cad6"></div></div>
''', note='Right side is the mailing area. For EDDM mailings, replace the stamp box with your printer\'s EDDM indicia.')

# ---------------------------------------------------------------- YARD SIGNS 24 x 18
piece('yard-sign-24x18', 'Yard sign — 24 × 18 in', 24, 18, f'''
<div class="abs navy" style="inset:0"></div>
<div class="abs" style="left:0;right:0;bottom:0;height:3.1in">{waves()}</div>
<div class="abs" style="left:50%;top:{B+.9}in;width:17in;height:3.75in;transform:translateX(-50%)">{HZ_REV}</div>
<div class="abs" style="left:0;right:0;top:{B+5.3}in;text-align:center;color:#fff;font-weight:800;font-size:92pt;letter-spacing:.01em;line-height:1.05">WINDOW CLEANING<br><span style="color:{ORANGE}">POWER WASHING · GUTTERS</span></div>
<div class="abs" style="left:0;right:0;top:{B+9.95}in;text-align:center;color:#fff;font-weight:800;font-size:168pt;letter-spacing:-.01em;line-height:1">{PHONE}</div>
<div class="abs" style="left:0;right:0;top:{B+13.05}in;text-align:center;color:#d5e0f3;font-weight:600;font-size:54pt">{WEB}</div>
''')

piece('yard-sign-24x18-job', 'Yard sign — 24 × 18 in, "another home" version', 24, 18, f'''
<div class="abs" style="inset:0;background:#fff"></div>
<div class="abs" style="left:0;right:0;top:0;height:{B+1.1}in;background:{BLUE}"></div>
<div class="abs" style="left:0;right:0;top:{B+1.1}in;height:.25in;background:{ORANGE}"></div>
<div class="abs" style="left:0;right:0;top:{B+1.75}in;text-align:center;font-weight:800;font-size:76pt;line-height:1.04;letter-spacing:-.01em">Another crystal-clear<br>home by</div>
<div class="abs" style="left:50%;top:{B+4.95}in;width:18.5in;height:4.1in;transform:translateX(-50%)">{HZ_FULL}</div>
<div class="abs navy" style="left:0;right:0;bottom:0;height:{B+6.2}in"></div>
<div class="abs" style="left:0;right:0;bottom:{B+2.35}in;text-align:center;color:#fff;font-weight:800;font-size:165pt;line-height:1">{PHONE}</div>
<div class="abs" style="left:0;right:0;bottom:{B+.95}in;text-align:center;color:#ffb27a;font-weight:600;font-size:50pt">Free quotes · {WEB}</div>
''')

# ---------------------------------------------------------------- BANNER 72 x 36
piece('banner-6x3ft', 'Vinyl banner — 6 × 3 ft', 72, 36, f'''
<div class="abs navy" style="inset:0"></div>
<div class="abs" style="left:0;right:0;bottom:0;height:9in">{waves()}</div>
<div class="abs" style="left:{B+3}in;top:{B+3}in;width:28in;height:19.2in">{ST_REV}</div>
<div class="abs" style="left:{B+34}in;top:{B+2.6}in;color:#fff;width:37in">
  <div class="k" style="font-size:128pt;color:#ffb27a;letter-spacing:.14em">Lincoln &amp; Kearney</div>
  <div style="font-weight:800;font-size:420pt;line-height:.95;letter-spacing:-.02em;margin-top:.4in">Window<br>Cleaning</div>
  <div style="font-weight:600;font-size:150pt;line-height:1.25;margin-top:.8in;color:#d5e0f3">Soft Washing · Power Washing<br>Gutters · Holiday Lighting</div>
</div>
<div class="abs" style="left:0;right:0;bottom:{B+2}in;text-align:center;color:#fff">
  <span style="display:inline-block;background:{ORANGE};font-weight:800;font-size:250pt;line-height:1;padding:.7in 2.8in;border-radius:6in">{PHONE}</span></div>
''', note='Keep 1.5 in at the edges clear for grommets and hemming. No text sits in that zone.')

# ---------------------------------------------------------------- CAR MAGNET 24 x 12
piece('car-magnet-24x12', 'Car door magnet — 24 × 12 in', 24, 12, f'''
<div class="abs" style="inset:0;background:#fff"></div>
<div class="abs" style="left:0;right:0;bottom:0;height:{B+4.3}in;background:{NAVY}"></div>
<div class="abs" style="left:0;right:0;bottom:{B+4.3}in;height:.22in;background:{ORANGE}"></div>
<div class="abs" style="left:50%;top:{B+.7}in;width:17.5in;height:3.85in;transform:translateX(-50%)">{HZ_FULL}</div>
<div class="abs" style="left:0;right:0;top:{B+4.85}in;text-align:center;font-weight:700;font-size:36pt;color:{BLUE};letter-spacing:.02em">Windows · Soft Washing · Power Washing · Gutters</div>
<div class="abs" style="left:0;right:0;bottom:{B+1.5}in;text-align:center;color:#fff;font-weight:800;font-size:125pt;line-height:1">{PHONE}</div>
<div class="abs" style="left:0;right:0;bottom:{B+.7}in;text-align:center;color:#c9d6ee;font-weight:600;font-size:32pt">{WEB}</div>
''', note='Magnets have rounded corners, so keep 1 in at the corners clear. Order a pair (driver and passenger door).')

# ---------------------------------------------------------------- EMAIL SIGNATURE (screen, 600 x 150 px)
open(OUT + 'email-signature.html', 'w').write(f'''<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>{BASE_CSS}body{{background:transparent}}.sheet{{width:600px;height:150px;display:flex;align-items:center;gap:22px;padding:14px 18px;background:#fff}}</style></head><body>
<div class="sheet"><div style="width:120px;height:120px;border-radius:24px;background:{BLUE};padding:20px 14px">{FIN_W}</div>
<div style="border-left:3px solid {ORANGE};padding-left:18px"><div style="font-size:21px;font-weight:800">Easton Zastrow</div>
<div class="k" style="font-size:10px;margin-top:2px">Owner · Shark Exterior</div>
<div style="font-size:13px;margin-top:10px;line-height:1.55;color:#3b4a66"><b style="color:{NAVY}">{PHONE}</b> &nbsp;·&nbsp; {EMAIL}<br><span style="color:{BLUE};font-weight:600">{WEB}</span></div></div></div></body></html>''')
pieces.append({'name': 'email-signature', 'title': 'Email signature', 'w': 600, 'h': 150, 'px': True, 'note': ''})

json.dump(pieces, open(os.path.dirname(OUT[:-1]) + '/pieces.json', 'w'), indent=1)
print(len(pieces), 'pieces')
