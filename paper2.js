/* Browser-local drafts and practice. No submitted answer is sent to TechDojo. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),lessons=window.TDPaper2Lessons,traces=window.TDPaper2Traces;
 const KEY='techdojo-paper2-v7';
 let saved={drafts:{},reviews:{},passed:{}},lang='python',current=lessons[0],worker=null,timer=null,trace=null,traceDone=false;
 try{const raw=JSON.parse(TDVisitStorage.getItem(KEY)||'null');if(raw&&typeof raw==='object')for(const key of ['drafts','reviews','passed'])if(raw[key]&&typeof raw[key]==='object'&&!Array.isArray(raw[key]))saved[key]=raw[key];}catch{$('storage-warning').hidden=false;}
 function persist(){try{TDVisitStorage.setItem(KEY,JSON.stringify(saved));$('draft-status').textContent='Kept for this visit';}catch{$('storage-warning').hidden=false;$('draft-status').textContent='Not saved';}}
 const draftKey=()=>current.id+'/'+lang;
 function draft(){const value=saved.drafts[draftKey()];return typeof value==='string'?value:current.starter[lang];}
 function saveDraft(){saved.drafts[draftKey()]=$('code-editor').value;persist();}
 function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
 function filtered(){return lessons.filter(q=>$('kind-filter').value==='all'||q.kind===$('kind-filter').value);}
 function statusLabel(q){const passes=saved.passed[q.id];return passes?' · tests passed'+(passes.assisted?' (answer viewed)':''):'';}
 function refreshPicker(){const qs=filtered();$('challenge-picker').replaceChildren(...qs.map(q=>{const opt=node('option',q.title+statusLabel(q));opt.value=q.id;return opt;}));if(qs.includes(current))$('challenge-picker').value=current.id;$('lab-progress').textContent=`${lessons.filter(q=>saved.passed[q.id]).length} / ${lessons.length} tested successfully`;}
 function stop(message){if(worker)worker.terminate();worker=null;clearTimeout(timer);timer=null;$('run-code').disabled=false;$('stop-code').hidden=true;if(message)$('run-status').textContent=message;}
 function render(){
  stop();$('challenge-meta').textContent=current.topic+' · '+current.kind;$('challenge-title').textContent=current.title;$('challenge-prompt').textContent=current.prompt;
  $('prelude-wrap').hidden=!current.prelude;$('prelude-wrap').open=false;$('prelude').textContent=current.prelude;$('challenge-hint').textContent=current.hint;
  $('test-contracts').replaceChildren(...current.tests.map(t=>{const el=node('div',undefined,'p2-test');el.append(node('strong',t.label),node('pre',(t.setup?t.setup+'\n':'')+t.expression),node('p','Expected: '+JSON.stringify(t.expected)));return el;}));
  $('code-editor').value=draft();$('lang-python').setAttribute('aria-pressed',String(lang==='python'));$('lang-pseudocode').setAttribute('aria-pressed',String(lang==='pseudocode'));
  $('editor-label').textContent=lang==='python'?'Your Python solution':'Your pseudocode solution';$('run-code').hidden=lang!=='python';
  $('editor-help').textContent=lang==='python'?'Use the specified names and return values. Tab indents; Ctrl/⌘ + Enter runs tests. Python loads from a pinned CDN only when you run it.':'Write clear pseudocode in your preferred convention. This tab is self-assessed, not executed. Your Python draft is kept separately during this visit.';
  $('run-status').textContent=lang==='python'?'Ready when you are.':'Pseudocode: use Review mark scheme to check your logic.';$('test-results').replaceChildren();$('review-panel').hidden=true;$('solution-details').open=false;$('reset-confirm').hidden=true;
  $('draft-status').textContent=Object.hasOwn(saved.drafts,draftKey())?'Draft for this visit':'Starter code';refreshPicker();location.hash=current.id;
 }
 function review(){
  saveDraft();$('review-panel').hidden=false;$('worked-answer').textContent=current.solution[lang];$('solution-details').open=false;
  const previous=saved.reviews[draftKey()]||{};const ticks=Array.isArray(previous.ticks)?previous.ticks:[];
  $('rubric').replaceChildren(...current.rubric.map((p,i)=>{const label=node('label'),box=node('input');box.type='checkbox';box.checked=!!ticks[i];box.addEventListener('change',saveReview);label.append(box,node('span',p));return label;}));updateReviewScore();
 }
 function updateReviewScore(){const n=[...$('rubric').querySelectorAll('input')].filter(e=>e.checked).length;$('review-score').textContent=`Self-assessed: ${n} / ${current.rubric.length} method points`;}
 function saveReview(){const k=draftKey();saved.reviews[k]={...saved.reviews[k],ticks:[...$('rubric').querySelectorAll('input')].map(e=>e.checked)};updateReviewScore();persist();}
 $('solution-details').addEventListener('toggle',()=>{if($('solution-details').open){const k=draftKey();saved.reviews[k]={...saved.reviews[k],viewed:true};persist();}});
 function run(){
  if(lang!=='python'||worker)return;
  saveDraft();const source=$('code-editor').value;
  if(source.length>40000){$('run-status').textContent='Please keep this exercise under 40,000 characters.';return;}
  if(!source.trim()){$('run-status').textContent='Write a solution first.';return;}
  $('test-results').replaceChildren();$('run-code').disabled=true;$('stop-code').hidden=false;
  $('run-status').textContent='Loading Python on your device. First use downloads the runtime from jsDelivr and may take a moment…';
  const lesson=current,code=source,assisted=!!saved.reviews[draftKey()]?.viewed;
  try{const workerURL=URL.createObjectURL(new Blob([window.TDPythonWorkerSource],{type:'application/javascript'})); worker=new Worker(workerURL); URL.revokeObjectURL(workerURL);}catch(error){stop('Python could not start: '+error.message+'. You can still review the mark scheme.');return;}
  const active=worker;
  timer=setTimeout(()=>stop('Python download timed out. Check your connection or CDN access, then retry. Mark-scheme review still works.'),60000);
  worker.onerror=()=>stop('Python could not load. Check that jsDelivr is reachable and your browser permits WebAssembly workers. Your draft is still in this page; you can still review the mark scheme.');
  worker.onmessage=({data})=>{
   if(worker!==active)return;
   if(data.type==='ready'){
    clearTimeout(timer);$('run-status').textContent='Running fresh test cases…';timer=setTimeout(()=>stop('Stopped after 5 seconds. Check for an infinite loop or a missing recursion base case, then try again.'),5000);
    worker.postMessage({type:'run',payload:{source:code,prelude:lesson.prelude,tests:lesson.tests}});
   }else if(data.type==='results'){
    const results=data.results,n=results.filter(r=>r.passed).length;
    stop(`${n} / ${results.length} behaviour tests passed. ${n===results.length?'Now review the method checklist; this is not an exam mark.':'Use the failing cases to improve your solution.'}`);
    $('test-results').replaceChildren(...results.map(r=>{const el=node('div',undefined,'p2-test '+(r.passed?'pass':'fail'));el.append(node('strong',(r.passed?'✓ ':'✗ ')+r.label));el.append(node('p','Expected: '+r.expected));el.append(node('p',r.error||'Returned: '+r.actual));if(r.output)el.append(node('pre','Printed output (not the return value):\n'+r.output));return el;}));
    if(n===results.length){saved.passed[lesson.id]={assisted,when:Date.now()};persist();refreshPicker();}
   }else if(data.type==='error')stop('Python error: '+data.message+' You can edit and retry, or use the mark scheme.');
  };
  worker.postMessage({type:'init'});
 }
 $('run-code').addEventListener('click',run);$('stop-code').addEventListener('click',()=>stop('Stopped. Your draft has been kept.'));
 $('code-editor').addEventListener('input',()=>{saveDraft();$('review-panel').hidden=true;$('test-results').replaceChildren();if(worker)stop('Run stopped because the draft changed. Run again to test the new version.');else $('run-status').textContent='Draft changed; run or review again to check this version.';const k=draftKey();if(saved.reviews[k]){saved.reviews[k].ticks=[];persist();}});
 $('code-editor').addEventListener('keydown',event=>{
  if(event.key==='Tab'){event.preventDefault();const e=event.target,start=e.selectionStart,end=e.selectionEnd;e.setRangeText('    ',start,end,'end');e.dispatchEvent(new Event('input'));}
  if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();if(lang==='python')run();else review();}
 });
 for(const l of ['python','pseudocode'])$('lang-'+l).addEventListener('click',()=>{if(l!==lang){saveDraft();lang=l;render();}});
 $('challenge-picker').addEventListener('change',()=>{saveDraft();current=lessons.find(q=>q.id===$('challenge-picker').value);render();});
 $('kind-filter').addEventListener('change',()=>{saveDraft();const list=filtered();if(!list.includes(current))current=list[0];render();});
 $('next-challenge').addEventListener('click',()=>{saveDraft();const qs=filtered();current=qs[(qs.indexOf(current)+1)%qs.length];render();});
 $('review-code').addEventListener('click',review);
 $('reset-code').addEventListener('click',()=>{$('reset-confirm').hidden=false;});$('cancel-reset').addEventListener('click',()=>{$('reset-confirm').hidden=true;});
 $('confirm-reset').addEventListener('click',()=>{delete saved.drafts[draftKey()];delete saved.reviews[draftKey()];persist();render();});
 $('download-code').addEventListener('click',()=>{saveDraft();const url=URL.createObjectURL(new Blob([$('code-editor').value],{type:'text/plain;charset=utf-8'}));const a=node('a');a.href=url;a.download=`techdojo-${current.id}.${lang==='python'?'py':'txt'}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 function mode(which){saveDraft();stop();$('code-mode').hidden=which!=='code';$('trace-mode').hidden=which!=='trace';for(const name of ['code','trace']){$('mode-'+name).setAttribute('aria-pressed',String(name===which));$('mode-'+name).classList.toggle('ghost',name!==which);}if(which==='trace'&&!trace)newTrace();}
 $('mode-code').addEventListener('click',()=>mode('code'));$('mode-trace').addEventListener('click',()=>mode('trace'));
 $('trace-picker').replaceChildren(...Object.entries(traces.types).map(([value,title])=>{const opt=node('option',title);opt.value=value;return opt;}));
 function newTrace(){trace=traces.generate($('trace-picker').value);traceDone=false;$('trace-title').textContent=trace.title;$('trace-prompt').textContent=trace.prompt;$('trace-answer').value='';$('trace-feedback').textContent='';$('trace-worked').hidden=true;$('trace-worked').replaceChildren();}
 function revealTrace(){traceDone=true;const out=$('trace-worked');out.hidden=false;const table=node('table'),thead=node('thead'),tr=node('tr');trace.columns.forEach(c=>{const th=node('th',c);th.scope='col';tr.append(th);});thead.append(tr);table.append(thead);const body=node('tbody');trace.rows.forEach(row=>{const tr=node('tr');row.forEach(v=>tr.append(node('td',String(v))));body.append(tr);});table.append(body);out.replaceChildren(node('p','Answer: '+trace.answer.join(', ')),node('p',trace.explanation),table);}
 $('check-trace').addEventListener('click',()=>{if(!$('trace-answer').value.trim()){$('trace-feedback').textContent='Enter your answer first.';return;}const pass=traces.check($('trace-answer').value,trace.answer);$('trace-feedback').textContent=(traceDone?'Practice after reveal: ':'')+(pass?'Correct. Follow the worked steps below.':'Not quite. Check the order and boundaries, or reveal the worked trace.');if(pass)revealTrace();});
 $('reveal-trace').addEventListener('click',()=>{$('trace-feedback').textContent='Worked answer revealed — use a new example to test yourself.';revealTrace();});
 $('trace-answer').addEventListener('keydown',e=>{if(e.key==='Enter')$('check-trace').click();});$('trace-picker').addEventListener('change',newTrace);$('new-trace').addEventListener('click',newTrace);
 window.addEventListener('pagehide',()=>stop());
 const hash=location.hash.slice(1);current=lessons.find(q=>q.id===hash)||current;render();
})();
