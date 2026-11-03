const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),b=JSON.parse(fs.readFileSync(root+'/data/bank.json')),m=require(root+'/marking.js'),math=require(root+'/maths-core.js');
let count=0,written=0,topics=0;
for(const v of Object.values(b))for(const u of Object.values(v.units))for(const t of Object.values(u.topics)){topics++;const seen=new Set();for(const q of t.questions){count++;assert(q.q&&!seen.has(q.q));seen.add(q.q);if(q.t==='mcq'){assert(q.o.length>=2&&Number.isInteger(q.a)&&q.a>=0&&q.a<q.o.length);assert(q.e);}else{written++;assert.equal(m.mark(q,q.model).score,q.marks,q.q);assert.equal(m.mark(q,'').score,0);}}}
assert.equal(Object.keys(b).length,4);assert.equal(count,1021);assert.equal(topics,100);assert.equal(written,251);
let cases=0;for(const t of Object.keys(math.types))for(let seed=1;seed<=200;seed++){const q=math.generate(t,seed);assert(math.check(q,q.answer));cases++;}
console.log(`PASS: ${count} questions, ${topics} topics, ${written} written models, ${cases} generated maths answers.`);
