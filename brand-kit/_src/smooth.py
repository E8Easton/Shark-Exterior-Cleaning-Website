import numpy as np, cv2, json
from PIL import Image
from scipy.ndimage import gaussian_filter1d
SC=8
import sys; SIG=float(sys.argv[1]); STEP=float(sys.argv[2])
src=Image.open('images/logo-shark-white.png').getchannel('A')
big=np.array(src.resize((src.width*SC,src.height*SC),Image.BICUBIC))
m=np.zeros_like(big); y0,y1=(5-4)*SC,(334+4)*SC; m[y0:y1]=(big[y0:y1]>127)*255
cs,h=cv2.findContours(m,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE)
cs=[c[:,0,:].astype(float) for c in cs if cv2.contourArea(c)>2000*SC]
print('contours',len(cs),[len(c) for c in cs],h)
def corners(P,k,thr):
    n=len(P); a=P[(np.arange(n)-k)%n]-P; b=P[(np.arange(n)+k)%n]-P
    cos=(a*b).sum(1)/np.linalg.norm(a,axis=1)/np.linalg.norm(b,axis=1)
    ang=np.degrees(np.arccos(np.clip(cos,-1,1)))  # 180 straight
    idx=[]
    for i in np.argsort(ang):
        if ang[i]>thr: break
        if all(min(abs(i-j),n-abs(i-j))>4*k for j in idx): idx.append(i)
    return sorted(idx), ang
def smooth_seg(S,sig):
    if len(S)<5: return S
    pad=int(3*sig); L=len(S)
    # reflect-odd padding keeps endpoints fixed
    pre=2*S[0]-S[1:pad+1][::-1]; post=2*S[-1]-S[-pad-1:-1][::-1]
    X=np.vstack([pre,S,post])
    Y=np.stack([gaussian_filter1d(X[:,0],sig),gaussian_filter1d(X[:,1],sig)],1)
    return Y[pad:pad+L]
def bez(P,closed_pts):
    # Catmull-Rom through resampled points -> cubic beziers
    out=[]
    n=len(P)
    for i in range(n-1):
        p0=P[i-1] if i>0 else P[i]; p1=P[i]; p2=P[i+1]; p3=P[i+2] if i+2<n else P[i+1]
        c1=p1+(p2-p0)/6; c2=p2-(p3-p1)/6
        out.append((c1,c2,p2))
    return out
def resample(S,step):
    d=np.r_[0,np.cumsum(np.linalg.norm(np.diff(S,axis=0),axis=1))]
    if d[-1]<step*2: return S[[0,-1]]
    t=np.linspace(0,d[-1],max(3,int(d[-1]/step)+1))
    return np.stack([np.interp(t,d,S[:,0]),np.interp(t,d,S[:,1])],1)
f=lambda v:f'{v/SC:.2f}'
res={}
for P in cs:
    idx,ang=corners(P,3*SC,120)
    print('bbox',P.min(0)/SC,P.max(0)/SC,'corners',[(tuple((P[i]/SC).round(1)),round(ang[i])) for i in idx])
    if not idx: idx=[0]
    segs=[]
    for a,b in zip(idx, idx[1:]+[idx[0]+len(P)]):
        S=np.vstack([P[a:],P[:]])[0:b-a+1] if b>len(P) else P[a:b+1]
        if b>len(P): S=np.vstack([P[a:],P[:b-len(P)+1]])
        S0=S; S=smooth_seg(S,SIG*SC); print("  seg dev max",round(float(np.linalg.norm(S0-S,axis=1).max())/SC,2)); S=resample(S,STEP*SC)
        segs.append(S)
    d=[f'M{f(segs[0][0][0])} {f(segs[0][0][1])}']
    for S in segs:
        for c1,c2,p in bez(S,False): d.append(f'C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p[0])} {f(p[1])}')
    d.append('Z')
    key='fin' if P[:,1].min()/SC<100 else 'wave'
    res[key]=''.join(d)
json.dump(res,open('/tmp/claude-0/-home-user-Shark-Exterior-Cleaning-Website/5ad31d0d-418b-5f53-b87a-f77490bfd52b/scratchpad/smooth_paths.json','w'))
print({k:len(v) for k,v in res.items()})
