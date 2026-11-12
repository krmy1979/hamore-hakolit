const vm=require('vm'),fs=require('fs');
const ctx={console,Math};ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['util','hebrew','draw','fractions','sequences']) vm.runInContext(fs.readFileSync(__dirname+'/../js/'+f+'.js','utf8'),ctx);
const units=[...ctx.FRACTIONS,...ctx.SEQUENCES]; let bad=0, n=0;
const badTxt=s=>/NaN|undefined|Infinity|\[object/.test(s);
for(const u of units){
  for(const st of u.lesson){ const sp=ctx.HE.speakable(st.say); if(/\d+\/\d+/.test(sp)||badTxt(sp)){console.log('LESSON',u.id,sp);bad++} st.viz&&st.viz(); }
  for(let L=1;L<=3;L++) for(let i=0;i<400;i++){ n++;
    const q=u.gen(L); const all=[q.text,q.say||'',q.hint||'',...(q.solve||[]),...Object.values(q.hints||{})].join(' | ');
    if(badTxt(all)||badTxt(q.viz||'')+badTxt(q.hintViz||'')){console.log('BADTXT',u.id,L,all);bad++;break}
    const sp=ctx.HE.speakable(all); if(/\d+\/\d+/.test(sp)){console.log('UNSPOKEN',u.id,sp);bad++;break}
    if(q.type==='choice'){ if(!q.choices.some(c=>c.value===q.answer)){console.log('NOANS',u.id,L,q);bad++;break} if(new Set(q.choices.map(c=>c.label)).size!==q.choices.length){console.log('DUP',u.id);bad++;break} if(q.choices.length<2){console.log('FEW',u.id,L);bad++;break}}
    else if(q.type==='num'){ if(!Number.isInteger(q.answer)||q.answer<0){console.log('NUMANS',u.id,L,q.answer,q.text);bad++;break}
      if(q.diagnose){const r=q.diagnose(q.answer); if(r){console.log('DIAG-ON-RIGHT',u.id,L,q.text,r);bad++;break}} }
    else if(q.type==='frac'){ const a=q.answer; if(!(a.d>0)||!Number.isInteger(a.n)||a.n<=0){console.log('FRACANS',u.id,L,a,q.text);bad++;break}
      if(q.diagnose){const w=q.mode==='mixed'?Math.floor(a.n/a.d):0; const r=q.diagnose({w,n:q.mode==='mixed'?a.n%a.d:a.n,d:a.d}); if(r){console.log('DIAG-ON-RIGHT',u.id,L,q.text,r);bad++;break}} }
    else if(q.type==='paint'){ if(!q.check(q.target).ok){console.log('PAINT');bad++} }
  }
}
// spot samples
const H=ctx.HE; console.log(H.speakable('[[2 ו־1/3 ⬜ 7/3]]'),'|',H.speakable('[[3/8 + 1/8 = ⬜]]'),'|',H.speakable('[[1 − 2/5 = ⬜]]'),'|',H.speakable('כמה זה [[3/4]] מ־20?'));
console.log('questions',n,'bad',bad);
for(const u of units) for(let L=1;L<=3;L++){const q=u.gen(L); console.log(u.id,L,q.type,'::',q.say||q.text,'=>',JSON.stringify(q.answer));}
