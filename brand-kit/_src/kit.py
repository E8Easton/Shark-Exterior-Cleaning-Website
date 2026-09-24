import json, os, re
K='brand-kit'
P=json.load(open(f'{K}/_src/paths.json'))
BLUE,ORANGE,NAVY,SKY='#0463EE','#F86A05','#04143C','#0FA3E0'
def g(fill,d): return f'<path fill="{fill}" fill-rule="evenodd" d="{d}"/>'
# colourways: fin, wave, SHARK, EXTERIOR
WAYS={
 'full-color':(BLUE,BLUE,BLUE,ORANGE),
 'reversed':('#FFFFFF','#FFFFFF','#FFFFFF',ORANGE),
 'white':('#FFFFFF',)*4,
 'navy':(NAVY,)*4,
 'black':('#000000',)*4,
 'orange-fin':(ORANGE,BLUE,NAVY,ORANGE),
}
def body(way):
    f,w,s,e=WAYS[way]
    return g(f,P['fin'])+g(w,P['wave'])+g(s,P['shark'])+g(e,P['exterior'])
def mark(fin,wave): return g(fin,P['fin'])+g(wave,P['wave'])
files={}
# Stacked: tight box around artwork (x 5..896, y 5..599) + padding
for way in WAYS:
    files[f'01-Logos/Stacked/SVG/shark-exterior-stacked-{way}.svg']=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-15 -15 921 629" width="921" height="629">{body(way)}</svg>'
# Horizontal: mark scaled to 250 tall on the left, words on the right
MX,MY,MW,MH=251,5,401,329
s=250/MH; mw=MW*s; gap=46; tx=mw+gap; ty=(250-227)/2
W=round(tx+891+30); H=280
for way in WAYS:
    f,w,sc,e=WAYS[way]
    art=(f'<g transform="translate(15 15) scale({s:.4f}) translate({-MX} {-MY})">{mark(f,w)}</g>'
         f'<g transform="translate({15+tx:.2f} {15+ty:.2f}) translate(-5 -372)">{g(sc,P["shark"])}{g(e,P["exterior"])}</g>')
    files[f'01-Logos/Horizontal/SVG/shark-exterior-horizontal-{way}.svg']=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">{art}</svg>'
# Fin mark alone (transparent)
MARKS={'blue':(BLUE,BLUE),'orange':(ORANGE,ORANGE),'navy':(NAVY,NAVY),'white':('#FFFFFF','#FFFFFF'),'black':('#000000','#000000'),'orange-blue':(ORANGE,BLUE)}
for k,(f,w) in MARKS.items():
    files[f'02-Icons/Mark/SVG/shark-fin-mark-{k}.svg']=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{MX-12} {MY-12} {MW+24} {MH+24}" width="{MW+24}" height="{MH+24}">{mark(f,w)}</svg>'
# App icon: rounded square, mark ~64% wide, optically centred
def app(bg,fin,wave,radius=225,size=1024,frac=.64):
    sc=size*frac/MW; ox=(size-MW*sc)/2; oy=(size-MH*sc)/2+size*.01
    rect=f'<rect width="{size}" height="{size}" rx="{radius}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">{rect}<g transform="translate({ox:.2f} {oy:.2f}) scale({sc:.4f}) translate({-MX} {-MY})">{mark(fin,wave)}</g></svg>'
ICONS={'blue':(BLUE,'#FFFFFF','#FFFFFF'),'orange':(ORANGE,'#FFFFFF','#FFFFFF'),'navy':(NAVY,'#FFFFFF','#FFFFFF'),'blue-orange':(BLUE,ORANGE,'#FFFFFF'),'navy-orange':(NAVY,ORANGE,'#FFFFFF'),'white':('#FFFFFF',BLUE,BLUE)}
for k,(bg,f,w) in ICONS.items():
    files[f'02-Icons/App-Icon/SVG/shark-app-icon-{k}.svg']=app(bg,f,w)
# favicon (blue rounded square)
files['04-Favicon/favicon.svg']=app(BLUE,'#FFFFFF','#FFFFFF',radius=190,frac=.80)
files['04-Favicon/_apple.svg']=app(BLUE,'#FFFFFF','#FFFFFF',radius=0,frac=.68)
files['04-Favicon/_maskable.svg']=app(BLUE,'#FFFFFF','#FFFFFF',radius=0,frac=.52)
for p,c in files.items():
    os.makedirs(os.path.dirname(f'{K}/{p}'),exist_ok=True); open(f'{K}/{p}','w').write(c)
json.dump({'horizontal':[W,H]},open(f'{K}/_src/meta.json','w'))
print(len(files),'svg files')
