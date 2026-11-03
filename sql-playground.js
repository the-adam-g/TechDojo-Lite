/* Interface for the local-only SQL lab. No network requests or account XP. */
(() => {
 'use strict';
 const SQL=window.DojoSQL,lessons=window.DojoSQLLessons,questions=lessons.questions;
 const $=id=>document.getElementById(id);
 const storageKey='techdojo-sql-lab-v6';
 let saved={},storageAvailable=true;
 try{saved=JSON.parse(TDVisitStorage.getItem(storageKey)||'{}')||{};if(typeof saved!=='object'||Array.isArray(saved))saved={};}catch(_){storageAvailable=false;}
 let sandbox;
 try{sandbox=new SQL.Simulator(saved.data||SQL.seed());}catch(_){sandbox=new SQL.Simulator();saved.data=null;}
 const firstQuery='SELECT c.name, p.policy_type, cl.amount, cl.status\nFROM customers AS c\nJOIN policies AS p ON c.customer_id = p.customer_id\nJOIN claims AS cl ON p.policy_id = cl.policy_id\nORDER BY cl.amount DESC;';
 let sandboxQuery=typeof saved.sandboxQuery==='string'?saved.sandboxQuery.slice(0,12000):firstQuery;
 let drafts=saved.drafts&&typeof saved.drafts==='object'&&!Array.isArray(saved.drafts)?saved.drafts:{};
 let completed=saved.completed&&typeof saved.completed==='object'&&!Array.isArray(saved.completed)?saved.completed:{};
 let helped=saved.helped&&typeof saved.helped==='object'&&!Array.isArray(saved.helped)?saved.helped:{};
 let current=questions.findIndex(q=>q.id===saved.question);if(current<0)current=0;
 let recent=Array.isArray(saved.recent)?saved.recent.filter(r=>r&&typeof r.sql==='string'&&r.sql.length<=12000&&['select','insert','update','delete','error'].includes(r.type)).slice(0,10):[];
 let mode=location.hash==='#practice'?'practice':'sandbox',table='customers',practice=new SQL.Simulator(),undo=[],timer;
 const examples=[
  ['Customers in London',"SELECT name, city FROM customers WHERE city = 'London';"],
  ['Trace claims through three tables',firstQuery],
  ['Customers without a policy','SELECT c.name\nFROM customers c\nLEFT JOIN policies p ON c.customer_id = p.customer_id\nWHERE p.policy_id IS NULL;'],
  ['Count claims by decision','SELECT status, COUNT(*) AS total\nFROM claims\nGROUP BY status\nORDER BY total DESC;'],
  ['Insert a new customer',"INSERT INTO customers (customer_id, name, city, age)\nVALUES (8, 'Hana Morgan', 'Manchester', 36);"],
  ['Increase a premium','UPDATE policies\nSET annual_premium = annual_premium + 25\nWHERE policy_id = 101;'],
  ['Delete one claim','DELETE FROM claims WHERE claim_id = 1002;']
 ];
 function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=String(text);if(className)el.className=className;return el;}
 function store() {
  if(!storageAvailable){$('storage-notice').hidden=false;return;}
  try{TDVisitStorage.setItem(storageKey,JSON.stringify({data:sandbox.data,sandboxQuery,drafts,completed,helped,question:questions[current].id,recent}));}
  catch(_){storageAvailable=false;$('storage-notice').hidden=false;}
 }
 function rememberDraft(){if(mode==='sandbox')sandboxQuery=$('sql-input').value;else drafts[questions[current].id]=$('sql-input').value;}
 function currentData(){return mode==='sandbox'?sandbox.data:practice.data;}
 function tableElement(columns,rows,caption) {
  const el=node('table');const cap=node('caption',caption,'sr-only');el.append(cap);
  const head=node('thead'),tr=node('tr');columns.forEach(c=>{const th=node('th',c);th.scope='col';tr.append(th);});head.append(tr);el.append(head);
  const body=node('tbody');for(const row of rows){const line=node('tr');for(const value of row)line.append(value==null?node('td','NULL','sql-null'):node('td',value));body.append(line);}el.append(body);return el;
 }
 function renderTables() {
  const data=currentData();document.querySelectorAll('[data-table]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.table===table));b.querySelector('span').textContent=data[b.dataset.table].length;});
  $('table-heading').textContent=table;$('schema-columns').replaceChildren();
  const meta=SQL.schema[table];for(const [name,type] of Object.entries(meta.columns)){
   const li=node('li'),label=node('span',name),info=node('small',type);
   if(meta.pk===name){label.append(node('span',' · PK','sql-key'));info.textContent=type+' · primary key';}
   if(meta.fk?.[name]){label.append(node('span',' · FK','sql-key'));info.textContent=type+' · '+meta.fk[name].join('.');}
   li.append(label,info);$('schema-columns').append(li);
  }
  const columns=Object.keys(meta.columns);$('table-preview').replaceChildren(tableElement(columns,data[table].map(row=>columns.map(c=>row[c])),table+' records'));
  if(!data[table].length)$('table-preview').append(node('p','This table has no records.','muted'));
  $('dataset-label').textContent=mode==='sandbox'?'Sandbox data':'Fresh question data';
  $('sandbox-data-actions').hidden=mode!=='sandbox';$('undo-change').disabled=!undo.length;
 }
 function blankResult() {
  $('query-error').hidden=true;$('practice-feedback').hidden=true;$('query-plan-panel').hidden=true;$('query-status').textContent='';$('result-count').textContent='Ready when you are';
  const box=node('div',undefined,'sql-empty');box.append(node('strong','Ask the data a question.'),node('p','Write a query above, then run it to see the result here.'));$('result-output').replaceChildren(box);
 }
 function renderResult(result) {
  $('query-error').hidden=true;$('query-plan-panel').hidden=result.type!=='select';
  if(result.type!=='select') {
   $('result-count').textContent=result.affected+' row'+(result.affected===1?'':'s')+' changed';
   $('result-output').replaceChildren(node('p',`${result.type.toUpperCase()} changed ${result.affected} row${result.affected===1?'':'s'} in ${result.table}. View the table on the left to inspect the effect.`,'sql-changed'));
   return;
  }
  $('result-count').textContent=result.total+' row'+(result.total===1?'':'s');
  const wrap=node('div',undefined,'sql-table-wrap');wrap.tabIndex=0;wrap.setAttribute('aria-label','SQL query result');wrap.append(tableElement(result.columns,result.rows,'Query result'));
  $('result-output').replaceChildren(wrap);
  if(!result.rows.length)$('result-output').append(node('p','No rows matched. This is a valid result — check your filters or join conditions if you expected more.','muted'));
  if(result.truncated)$('result-output').append(node('p',`Showing the first 200 of ${result.total} rows. Add a filter or LIMIT for a smaller result.`,'muted'));
  $('query-plan').replaceChildren();for(const step of result.plan){const li=node('li');li.append(node('strong',step.label),node('small',step.detail),node('span',step.rows+' row'+(step.rows===1?'':'s')));$('query-plan').append(li);}
 }
 function history() {
  $('history-count').textContent=recent.length;$('query-history').replaceChildren();
  for(const entry of recent){const li=node('li'),b=node('button',entry.sql),small=node('small',entry.type==='error'?'Query needs a correction':entry.type.toUpperCase()+' · '+(entry.mode==='practice'?'Practice':'Sandbox'));b.type='button';b.addEventListener('click',()=>{$('sql-input').value=entry.sql;rememberDraft();store();$('sql-input').focus();});li.append(b,small);$('query-history').append(li);}
 }
 function progress() {
  const done=questions.filter(q=>['solved','worked'].includes(completed[q.id])).length;
  $('practice-progress').textContent=done+' / '+questions.length+' completed on this device';
  for(let i=0;i<questions.length;i++){$('question-picker').options[i].textContent=(i+1)+'. '+questions[i].title+(completed[questions[i].id]==='solved'?' ✓':completed[questions[i].id]==='worked'?' ✓ (worked answer)':'');}
 }
 function showQuestion() {
  practice=new SQL.Simulator();const q=questions[current];$('question-picker').value=String(current);$('practice-title').textContent=q.title;$('practice-level').textContent=q.level;$('practice-prompt').textContent=q.prompt;
  $('hint-panel').hidden=true;$('answer-panel').hidden=true;$('show-hint').textContent='Get a hint';
  $('sql-input').value=typeof drafts[q.id]==='string'?drafts[q.id].slice(0,12000):'';
  $('next-question').textContent=current===questions.length-1?'Back to question 1':'Next question →';progress();blankResult();renderTables();
 }
 function applyMode() {
  $('mode-sandbox').setAttribute('aria-pressed',String(mode==='sandbox'));$('mode-practice').setAttribute('aria-pressed',String(mode==='practice'));
  $('practice-panel').hidden=mode!=='practice';$('examples-control').hidden=mode!=='sandbox';$('reset-confirm').hidden=true;
  $('editor-eyebrow').textContent=mode==='sandbox'?'Try a query':'Put your answer to the test';$('run-query').textContent=mode==='sandbox'?'Run query →':'Run & check answer →';
  if(mode==='practice')showQuestion();else{$('sql-input').value=sandboxQuery;blankResult();renderTables();}
 }
 function switchMode(next) {if(next===mode)return;rememberDraft();mode=next;applyMode();store();try{window.history.replaceState(null,'','#'+mode);}catch(_){} }
 $('mode-sandbox').addEventListener('click',()=>switchMode('sandbox'));$('mode-practice').addEventListener('click',()=>switchMode('practice'));
 document.querySelectorAll('[data-table]').forEach(b=>b.addEventListener('click',()=>{table=b.dataset.table;renderTables();}));
 questions.forEach((q,i)=>{$('question-picker').append(node('option',`${i+1}. ${q.title}`));$('question-picker').lastChild.value=String(i);});
 $('question-picker').addEventListener('change',()=>{rememberDraft();current=Number($('question-picker').value);showQuestion();store();});
 $('next-question').addEventListener('click',()=>{rememberDraft();current=(current+1)%questions.length;showQuestion();store();$('sql-input').focus();});
 examples.forEach(([name],i)=>{const o=node('option',name);o.value=String(i);$('query-example').append(o);});
 $('query-example').addEventListener('change',()=>{const value=$('query-example').value;if(value==='')return;$('sql-input').value=examples[Number(value)][1];$('query-example').value='';rememberDraft();store();$('sql-input').focus();});
 $('show-hint').addEventListener('click',()=>{$('hint-panel').textContent=questions[current].hint;$('hint-panel').hidden=!$('hint-panel').hidden;$('show-hint').textContent=$('hint-panel').hidden?'Get a hint':'Hide hint';});
 $('show-answer').addEventListener('click',()=>{const q=questions[current];$('answer-sql').textContent=q.sql;$('answer-explanation').textContent=q.explain;$('answer-panel').hidden=false;helped[q.id]=true;store();});
 $('load-answer').addEventListener('click',()=>{$('sql-input').value=questions[current].sql;helped[questions[current].id]=true;rememberDraft();store();$('sql-input').focus();});
 function run() {
  const query=$('sql-input').value.trim();if(!query){$('query-status').textContent='Write a query first.';$('sql-input').focus();return;}
  rememberDraft();$('practice-feedback').hidden=true;const start=performance.now();
  try {
   const before=mode==='sandbox'?SQL.clone(sandbox.data):null;
   const result=(mode==='sandbox'?sandbox:new SQL.Simulator()).execute(query,{readOnly:mode==='practice'});
   if(mode==='sandbox'&&result.type!=='select'&&result.affected){undo.push(before);if(undo.length>10)undo.shift();table=result.table;renderTables();}
   renderResult(result);
   $('query-status').textContent='Done · '+Math.max(1,Math.round(performance.now()-start))+' ms';
   if(mode==='practice') {
    const q=questions[current],feedback=lessons.check(q,query,result);$('practice-feedback').hidden=false;$('practice-feedback').className='sql-feedback '+(feedback.correct?'correct':'incorrect');$('practice-feedback').textContent=feedback.message;
    if(feedback.correct){if(completed[q.id]!=='solved')completed[q.id]=helped[q.id]?'worked':'solved';progress();}
   }
   recent.unshift({sql:query,type:result.type,mode});
  } catch(e) {
   $('query-error').hidden=false;$('query-error').textContent=e.message||'The query could not be simulated. Check the pocket guide.';
   $('result-count').textContent='Query needs a correction';$('result-output').replaceChildren();$('query-plan-panel').hidden=true;$('query-status').textContent='No changes made';recent.unshift({sql:query,type:'error',mode});
  }
  recent=recent.slice(0,10);history();store();
 }
 $('run-query').addEventListener('click',run);
 $('sql-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();run();}else if(e.key==='Tab'){e.preventDefault();const el=e.target,start=el.selectionStart;el.setRangeText('  ',start,el.selectionEnd,'end');rememberDraft();store();}});
 $('sql-input').addEventListener('input',()=>{rememberDraft();clearTimeout(timer);timer=setTimeout(store,250);});
 $('clear-query').addEventListener('click',()=>{$('sql-input').value='';rememberDraft();store();$('sql-input').focus();});
 $('undo-change').addEventListener('click',()=>{if(!undo.length)return;sandbox=new SQL.Simulator(undo.pop());renderTables();blankResult();$('query-status').textContent='Last table change undone.';store();});
 $('reset-data').addEventListener('click',()=>{$('reset-confirm').hidden=false;$('confirm-reset').focus();});
 $('cancel-reset').addEventListener('click',()=>{$('reset-confirm').hidden=true;$('reset-data').focus();});
 $('confirm-reset').addEventListener('click',()=>{undo.push(SQL.clone(sandbox.data));if(undo.length>10)undo.shift();sandbox=new SQL.Simulator();$('reset-confirm').hidden=true;renderTables();blankResult();$('query-status').textContent='Starting records restored.';store();$('reset-data').focus();});
 if(!storageAvailable)$('storage-notice').hidden=false;
 applyMode();history();
})();
