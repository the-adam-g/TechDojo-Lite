const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const root=__dirname+'/..',mark=require(root+'/marking.js'),traces=require(root+'/paper2-traces.js');
const bank=JSON.parse(fs.readFileSync(root+'/data/bank.json'))['ocr-a-cs-h446'];
const unit=bank.units['h446-02'];assert.equal(Object.keys(unit.topics).length,11);
let count=0,written=0;const prompts=new Set();
for(const topic of Object.values(unit.topics))for(const q of topic.questions){count++;assert(!prompts.has(q.q));prompts.add(q.q);if(q.t==='mcq'){assert.equal(new Set(q.o).size,4);assert(Number.isInteger(q.a)&&q.a>=0&&q.a<4);assert(q.e);}else{written++;assert.equal(q.pts.length,q.marks);assert.equal(mark.mark(q,q.model).score,q.marks,q.q);assert.equal(mark.mark(q,'').score,0);assert.equal(mark.mark(q,'toast and marmalade for breakfast').score,0);}}
assert.equal(count,132);
const context={window:{}};vm.runInNewContext(fs.readFileSync(root+'/paper2-lessons.js','utf8'),context);const lessons=context.window.TDPaper2Lessons;
assert.equal(lessons.length,22);assert.equal(new Set(lessons.map(q=>q.id)).size,22);
for(const q of lessons){assert(q.tests.length>=4);for(const lang of ['python','pseudocode'])assert(q.starter[lang]&&q.solution[lang]);assert(q.rubric.length>=4);}
let seed=1357;function rng(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
for(const kind of Object.keys(traces.types))for(let i=0;i<150;i++){
 const q=traces.generate(kind,rng);assert(q.answer.length>0);assert(traces.check(q.answer.join(', '),q.answer));assert(traces.check('['+q.answer.join(',')+']',q.answer));assert(!traces.check('999999',q.answer));assert(!traces.check('I guess '+q.answer.join(','),q.answer));assert(q.rows.length&&q.rows.every(r=>r.length===q.columns.length));
 // Independent checks against the source values stated in generated prompts.
 if(kind==='bubble'){const a=q.prompt.match(/\[([^\]]+)\]/)[1].split(',').map(Number);const original=a.slice();for(let j=0;j<a.length-1;j++)if(a[j]>a[j+1]){let t=a[j];a[j]=a[j+1];a[j+1]=t;}assert.deepEqual(q.answer,a);assert.equal(q.answer.at(-1),Math.max(...original));}
 if(kind==='insertion'){const nums=q.prompt.match(/\[([^\]]+)\]/)[1].split(',').map(Number),key=Number(q.prompt.match(/key (\d+)/)[1]);assert.deepEqual(q.answer,[...nums,key].sort((a,b)=>a-b));}
 if(kind==='dijkstra'){const nums=[...q.prompt.matchAll(/=(\d+)/g)].map(m=>+m[1]),[ab,ac,cb,bd,cd]=nums;const d=[[0,ab,ac,Infinity],[ab,0,cb,bd],[ac,cb,0,cd],[Infinity,bd,cd,0]];for(let k=0;k<4;k++)for(let a=0;a<4;a++)for(let b=0;b<4;b++)d[a][b]=Math.min(d[a][b],d[a][k]+d[k][b]);assert.equal(q.answer[0],d[0][3]);}
 if(kind==='recursion'){const n=+q.prompt.match(/f\((\d+)\)/)[1];let result=0;for(let j=n;j>0;j-=2)result+=j;assert.equal(q.answer[0],result);}
}
console.log(`PASS: ${count} theory questions (${written} written), 22 programming task schemas, 1,200 generated traces.`);
