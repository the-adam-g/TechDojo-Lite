const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..'),bank=JSON.parse(fs.readFileSync(root+'/data/bank.json'));
const source=f=>fs.readFileSync(root+'/'+f,'utf8');let errors=[];
class Loader extends ResourceLoader {fetch(url){const u=new URL(url);if(u.origin!=='https://lite.test')throw Error('Unexpected network: '+url);const result=Promise.resolve(fs.readFileSync(root+u.pathname));result.abort=()=>{};return result;}}
async function boot(query='',file='index.html'){
 const v=new VirtualConsole();v.on('jsdomError',e=>errors.push(e.message));
 const d=new JSDOM(source(file).replace(/<script[^>]*>[\s\S]*?<\/script>/g,''),{url:'https://lite.test/'+file+query,runScripts:'dangerously',resources:new Loader(),virtualConsole:v});
 const w=d.window;w.scrollTo=()=>{};w.print=()=>{w.printed=true};w.confirm=()=>true;
 for(const key of ['localStorage','sessionStorage'])Object.defineProperty(w,key,{get(){throw Error('Persistent storage forbidden in Lite');}});
 w.fetch=async()=>({ok:true,json:async()=>JSON.parse(JSON.stringify(bank))});
 if(file==='index.html'){for(const f of ['marking.js','maths-core.js','lite-progress.js','lite-dojo.js','lite.js'])w.eval(source(f));await new Promise(r=>setTimeout(r,20));}
 else {
  w.URL.createObjectURL=()=> 'blob:https://lite.test/worker';w.URL.revokeObjectURL=()=>{};
  w.workers=[];w.Worker=class{constructor(url){this.url=url;w.workers.push(this)}postMessage(data){this.last=data}terminate(){this.terminated=true}};
  for(const m of source(file).matchAll(/<script src="([^"?]+)(?:\?[^" ]*)?"><\/script>/g))w.eval(source(m[1]));
 }
 return d;
}
(async()=>{
 let d=await boot();assert.equal(d.window.document.querySelectorAll('.subject-card').length,4);d.window.close();
 let routes=0,total=0;
 for(const [s,subject] of Object.entries(bank)){
  d=await boot('?'+new URLSearchParams({page:'subject',s}));assert.equal(d.window.document.querySelectorAll('a.card').length,Object.keys(subject.units).length);d.window.close();
  for(const [u,unit] of Object.entries(subject.units))for(const [t,topic] of Object.entries(unit.topics)){
   d=await boot('?'+new URLSearchParams({page:'quiz',s,u,t}));const w=d.window;
   assert.equal(w.QUESTIONS.length,topic.questions.length);assert(w.document.querySelectorAll('.mode').length===(topic.questions.some(q=>q.t==='calc')?6:5),'Quiz script did not load: '+t);
   const mode=[...w.document.querySelectorAll('.mode')].find(b=>!b.disabled);mode.click();assert(w.document.getElementById('question').textContent);
   routes++;total+=topic.questions.length;w.close();
  }
 }
 assert.equal(total,1783);assert.equal(routes,159);
 d=await boot('?page=training&s=aqa-a-biology-7402');let w=d.window;w.document.getElementById('select-none').click();w.document.getElementById('training-form').dispatchEvent(new w.Event('submit',{cancelable:true}));assert.match(w.document.getElementById('selection-error').textContent,/Select at least/);w.close();
 // A complete MCQ response and printable practice paper.
 d=await boot('?page=quiz&s=aqa-a-biology-7402&u=1&t=3.1.1');w=d.window;w.document.querySelector('.mode').click();w.document.querySelector('.option').click();assert(!w.document.getElementById('feedback').hidden);w.close();
 d=await boot('?page=exam&s=aqa-a-biology-7402');w=d.window;const form=w.document.getElementById('exam-form');form.elements.mcq.value=2;form.elements.short.value=1;form.elements.long.value=1;form.dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(w.document.querySelectorAll('.paper-question').length,4);assert(!w.document.body.textContent.includes('Example answer:'));w.document.getElementById('toggle-scheme').click();assert(w.document.body.textContent.includes('Example answer:'));w.document.getElementById('print-paper').click();assert(w.printed);w.close();
 // Static paper routes include the correct topic range.
 d=await boot('','biology.html');w=d.window;const routesLinks=[...w.document.querySelectorAll('a.card')].map(e=>e.href);assert.equal(routesLinks.length,3);w.document.getElementById('essay-answer').value='A membrane essay draft';w.document.getElementById('essay-answer').dispatchEvent(new w.Event('input'));assert.match(w.document.getElementById('essay-status').textContent,/visit only/);w.close();
 for(let i=0;i<3;i++){d=await boot(new URL(routesLinks[i]).search);w=d.window;assert(w.QUESTIONS.length);for(const q of w.QUESTIONS){const unit=q._key.split('/')[1];if(/^\d+$/.test(unit))assert(i===2||(i===0?+unit<=4:+unit>=5));}w.close();}
 // SQL sandbox and guided practice.
 d=await boot('','sql.html');w=d.window;w.document.getElementById('sql-input').value='SELECT name, city FROM customers';w.document.getElementById('run-query').click();assert(w.document.querySelector('#result-output table'));w.document.getElementById('mode-practice').click();assert.equal(w.document.getElementById('question-picker').options.length,15);w.close();
 // Programming draft switches and Worker handshake, without downloading runtime.
 d=await boot('','paper2.html');w=d.window;assert.equal(w.document.getElementById('challenge-picker').options.length,22);w.document.getElementById('code-editor').value='def total(values):\n return sum(values)';w.document.getElementById('code-editor').dispatchEvent(new w.Event('input'));w.document.getElementById('run-code').click();assert.equal(w.workers.length,1);assert(w.workers[0].url.startsWith('blob:'));w.workers[0].onmessage({data:{type:'ready'}});assert.equal(w.workers[0].last.type,'run');w.document.getElementById('stop-code').click();assert(w.workers[0].terminated);w.document.getElementById('mode-trace').click();assert(!w.document.getElementById('trace-mode').hidden);w.close();
 assert.deepEqual(errors,[]);console.log('PASS: 4 courses, 159 topic routes, 1783 questions, modes, MCQ feedback, empty selection, custom printable papers, Biology routes/essay draft, SQL and Python Worker handshake; device storage fallback checked throughout.');
})().catch(e=>{console.error(e);process.exitCode=1});
