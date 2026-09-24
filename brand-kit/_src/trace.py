import numpy as np, potrace, json
from PIL import Image, ImageFilter
SC=4
src=Image.open('images/logo-shark-white.png').getchannel('A')
big=src.resize((src.width*SC,src.height*SC),Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.7))
A=np.array(big)
bands={'mark':(5,334),'shark':(372,514),'exterior':(553,599)}
def f(v): return f'{v/SC:.2f}'
out={}
for name,(a,b) in bands.items():
    y0,y1=(a-4)*SC,(b+4)*SC
    sub=np.zeros_like(A,dtype=bool); sub[y0:y1]=A[y0:y1]>127
    bm=potrace.Bitmap(~sub)  # potracer treats 0 as ink
    plist=bm.trace(turdsize=40,turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,alphamax=0.9,opticurve=True,opttolerance=0.35)
    d=[]
    for curve in plist:
        sp=curve.start_point; d.append(f'M{f(sp.x)} {f(sp.y)}')
        for seg in curve.segments:
            if seg.is_corner:
                d.append(f'L{f(seg.c.x)} {f(seg.c.y)}L{f(seg.end_point.x)} {f(seg.end_point.y)}')
            else:
                d.append(f'C{f(seg.c1.x)} {f(seg.c1.y)} {f(seg.c2.x)} {f(seg.c2.y)} {f(seg.end_point.x)} {f(seg.end_point.y)}')
        d.append('Z')
    out[name]=''.join(d); print(name,len(plist),'curves',len(out[name]),'chars')
json.dump(out,open('brand-kit/_src/paths.json','w'))
