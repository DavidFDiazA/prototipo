import json, math, sys
S=sys.argv[1]
L={l['id']:l for l in json.load(open('../lib/labels.json'))}
def wilson(k,n,z=1.96):
    p=k/n; d=1+z*z/n; c=p+z*z/(2*n); a=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n)); return (c-a)/d,(c+a)/d
CL=['cardboard','glass','metal','paper','plastic','trash']
out={}
def analyze(name,f):
    R=json.load(open(f))['rows']; n=len(R)
    conf={c:{k:0 for k in CL+['none']} for c in CL}
    ok=binok=top2=notrec=0
    for r in R:
        lab=L[r['top']]; rec=not(lab.get('none') or r['score']<0.3)
        pred=(lab['eval'] if lab['eval'] else 'none') if rec else 'none'
        if not rec: notrec+=1
        conf[r['cls']][pred]+=1
        if pred==r['cls']: ok+=1
        tb='negro' if r['cls']=='trash' else 'blanco'
        if rec and lab['bin']==tb: binok+=1
        if pred==r['cls'] or L[r['second']]['eval']==r['cls']: top2+=1
    print(f"== {name} n={n}")
    res={'n':n}
    for lbl,k in (('material',ok),('caneca',binok),('top2',top2)):
        lo,hi=wilson(k,n); res[lbl]=(k,n,k/n,lo,hi); print(f"  {lbl}: {k}/{n} = {k/n*100:.1f}%  IC95 [{lo*100:.1f}, {hi*100:.1f}]")
    print('  no reconocidas:',notrec); res['notrec']=notrec
    res['cls']={}
    for c in CL:
        tot=sum(conf[c].values()); tp=conf[c][c]; pp=sum(conf[x][c] for x in CL)
        res['cls'][c]=(tot,tp,tp/tot,(tp/pp if pp else 0))
        print(f"   {c:10s} n={tot:3d} TP={tp:3d} recall={tp/tot*100:5.1f}%  precision={(tp/pp*100 if pp else 0):5.1f}%")
    for c in CL: print('   conf',c, [conf[c][k] for k in CL+['none']])
    res['conf']=conf
    out[name]=res
analyze('heldout',S+'/res/heldout.json'); analyze('tuning',S+'/res/tuning.json')
json.dump(out,open(S+'/res/metrics.json','w'),indent=1)

# --- vistas adicionales: cobertura/selectiva y "sin umbral"
R=json.load(open(S+'/res/heldout.json'))['rows']; n=len(R)
rec=[r for r in R if not(L[r['top']].get('none') or r['score']<0.3)]
okm=sum(1 for r in rec if L[r['top']]['eval']==r['cls'])
okb=sum(1 for r in rec if L[r['top']]['bin']==('negro' if r['cls']=='trash' else 'blanco'))
print('\nCOBERTURA',len(rec),'/',n,f'= {len(rec)/n*100:.1f}%')
for lbl,k in (('material|reconocidas',okm),('caneca|reconocidas',okb)):
    lo,hi=wilson(k,len(rec)); print(f'  {lbl}: {k}/{len(rec)} = {k/len(rec)*100:.1f}% IC95 [{lo*100:.1f}, {hi*100:.1f}]')
okm2=sum(1 for r in R if L[r['top']]['eval']==r['cls'])
okb2=sum(1 for r in R if (not L[r['top']].get('none')) and L[r['top']]['bin']==('negro' if r['cls']=='trash' else 'blanco'))
print('SIN UMBRAL: material',okm2,'/',n,f'{okm2/n*100:.1f}%','caneca',okb2,f'{okb2/n*100:.1f}%')
import collections
print('no reconocidas por clase:',collections.Counter(r['cls'] for r in R if r not in rec))
print('score medio acierto/error (reconocidas):', sum(r['score'] for r in rec if L[r['top']]['eval']==r['cls'])/max(1,okm), sum(r['score'] for r in rec if L[r['top']]['eval']!=r['cls'])/max(1,len(rec)-okm))
