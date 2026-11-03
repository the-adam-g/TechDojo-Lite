/* TechDojo teaching SQL simulator. Plain JavaScript arrays, never a database or eval. */
(function (root, factory) {
 'use strict';
 const api = factory();
 if (typeof module === 'object' && module.exports) module.exports = api;
 else root.DojoSQL = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
 'use strict';
 const MAX_ROWS = 200, MAX_STEPS = 300000;
 const schema = {
  customers: { columns: {customer_id:'integer',name:'text',city:'text',age:'integer'}, pk:'customer_id' },
  policies: { columns: {policy_id:'integer',customer_id:'integer',policy_type:'text',annual_premium:'number',status:'text'}, pk:'policy_id', fk:{customer_id:['customers','customer_id']} },
  claims: { columns: {claim_id:'integer',policy_id:'integer',claim_date:'text',amount:'number',status:'text'}, pk:'claim_id', fk:{policy_id:['policies','policy_id']} }
 };
 function seed() { return {
  customers:[
   {customer_id:1,name:'Amira Shah',city:'London',age:28},{customer_id:2,name:'Ben Carter',city:'Bristol',age:42},
   {customer_id:3,name:'Chloe Evans',city:'Leeds',age:35},{customer_id:4,name:'Daniel Okafor',city:'London',age:51},
   {customer_id:5,name:'Ella Hughes',city:'Cardiff',age:23},{customer_id:6,name:'Finn Patel',city:'Bristol',age:67},
   {customer_id:7,name:'Grace Wilson',city:'York',age:31}
  ],
  policies:[
   {policy_id:101,customer_id:1,policy_type:'Car',annual_premium:480,status:'Active'},
   {policy_id:102,customer_id:1,policy_type:'Home',annual_premium:320,status:'Active'},
   {policy_id:103,customer_id:2,policy_type:'Car',annual_premium:650,status:'Active'},
   {policy_id:104,customer_id:3,policy_type:'Travel',annual_premium:120,status:'Expired'},
   {policy_id:105,customer_id:4,policy_type:'Home',annual_premium:410,status:'Active'},
   {policy_id:106,customer_id:5,policy_type:'Car',annual_premium:820,status:'Active'},
   {policy_id:107,customer_id:6,policy_type:'Home',annual_premium:290,status:'Active'},
   {policy_id:108,customer_id:2,policy_type:'Travel',annual_premium:95,status:'Expired'},
   {policy_id:109,customer_id:3,policy_type:'Car',annual_premium:540,status:'Active'},
   {policy_id:110,customer_id:4,policy_type:'Car',annual_premium:590,status:'Cancelled'}
  ],
  claims:[
   {claim_id:1001,policy_id:101,claim_date:'2026-01-12',amount:1200,status:'Approved'},
   {claim_id:1002,policy_id:101,claim_date:'2026-06-04',amount:350,status:'Pending'},
   {claim_id:1003,policy_id:103,claim_date:'2026-02-18',amount:2400,status:'Approved'},
   {claim_id:1004,policy_id:105,claim_date:'2026-03-22',amount:5800,status:'Approved'},
   {claim_id:1005,policy_id:106,claim_date:'2026-04-09',amount:900,status:'Rejected'},
   {claim_id:1006,policy_id:104,claim_date:'2026-01-30',amount:600,status:'Approved'},
   {claim_id:1007,policy_id:109,claim_date:'2026-07-15',amount:1800,status:'Pending'},
   {claim_id:1008,policy_id:105,claim_date:'2026-08-03',amount:750,status:'Rejected'},
   {claim_id:1009,policy_id:108,claim_date:'2026-02-01',amount:450,status:'Approved'},
   {claim_id:1010,policy_id:110,claim_date:'2026-05-20',amount:1300,status:'Approved'}
  ]
 }; }
 function clone(data) { return JSON.parse(JSON.stringify(data)); }
 function fail(message) { throw new Error(message); }
 function tokenize(sql) {
  if(typeof sql!=='string'||sql.length>12000)fail('Keep each query under 12,000 characters.');
  const tokens=[];let i=0;
  while(i<sql.length) {
   if(/\s/.test(sql[i])){i++;continue;}
   if(sql.slice(i,i+2)==='--'){while(i<sql.length&&sql[i]!=='\n')i++;continue;}
   if(sql.slice(i,i+2)==='/*'){const end=sql.indexOf('*/',i+2);if(end<0)fail('Close your /* comment */.');i=end+2;continue;}
   const pos=i;
   if(sql[i]==="'") {
    i++;let value='',closed=false;
    while(i<sql.length){if(sql[i]==="'"){if(sql[i+1]==="'"){value+="'";i+=2;}else{i++;closed=true;break;}}else value+=sql[i++];}
    if(!closed)fail('Close the text value with a single quote.');tokens.push({kind:'value',value,pos});
   } else if(/[0-9]/.test(sql[i])) {
    const m=sql.slice(i).match(/^\d+(?:\.\d+)?/)[0];tokens.push({kind:'value',value:Number(m),pos});i+=m.length;
   } else if(/[a-z_]/i.test(sql[i])) {
    const m=sql.slice(i).match(/^[a-z_][a-z0-9_]*/i)[0];tokens.push({kind:'word',value:m.toLowerCase(),pos});i+=m.length;
   } else {
    const pair=sql.slice(i,i+2);const op=['<=','>=','<>','!='].includes(pair)?pair:sql[i];
    if(!['(',')',',','.','*','+','-','/','%','=','<','>','<=','>=','<>','!=',';'].includes(op))fail(`Unexpected character at position ${i+1}. Use single quotes for text values.`);
    tokens.push({kind:'symbol',value:op,pos});i+=op.length;
   }
   if(tokens.length>1500)fail('This query is too long for the teaching simulator.');
  }
  tokens.push({kind:'end',value:'<end>',pos:i});return tokens;
 }
 const clauseWords=new Set(['from','where','join','inner','left','outer','on','group','having','order','limit','offset','asc','desc','set','values','and','or','union','right','full','cross']);
 const aggregateNames=new Set(['count','sum','avg','min','max']);
 class Parser {
  constructor(sql){this.tokens=tokenize(sql);this.i=0;this.depth=0;}
  token(){return this.tokens[this.i];}
  at(s){return this.token().value===s&&this.token().kind!=='value';}
  eat(s){if(this.at(s)){this.i++;return true;}return false;}
  need(s){if(!this.eat(s))fail(`Expected ${s.toUpperCase()} near position ${this.token().pos+1}.`);}
  ident(){const t=this.token();if(t.kind!=='word')fail(`Expected a table or column name near position ${t.pos+1}.`);this.i++;return t.value;}
  alias(){if(this.eat('as'))return this.ident();if(this.token().kind==='word'&&!clauseWords.has(this.token().value))return this.ident();return null;}
  list(fn){const out=[fn()];while(this.eat(','))out.push(fn());return out;}
  expr(min=0) {
   if(++this.depth>45)fail('The expression is nested too deeply.');
   let node;
   if(this.eat('not'))node={kind:'unary',op:'not',arg:this.expr(3)};
   else if(this.eat('-'))node={kind:'unary',op:'-',arg:this.expr(6)};
   else if(this.eat('+'))node={kind:'unary',op:'+',arg:this.expr(6)};
   else if(this.eat('(')){node=this.expr();this.need(')');}
   else if(this.token().kind==='value'){node={kind:'literal',value:this.token().value};this.i++;}
   else if(this.eat('null'))node={kind:'literal',value:null};
   else if(this.eat('true'))node={kind:'literal',value:1};
   else if(this.eat('false'))node={kind:'literal',value:0};
   else {
    const name=this.ident();
    if(this.eat('(')) {
     let distinct=this.eat('distinct');let args=[];
     if(this.eat('*'))args=[{kind:'star'}];
     else if(!this.at(')'))args=this.list(()=>this.expr());
     this.need(')');node={kind:'call',name,args,distinct};
    } else {const path=[name];if(this.eat('.'))path.push(this.ident());node={kind:'column',path};}
   }
   for(;;) {
    let op=this.token().kind==='value'?'':this.token().value;
    const neg=this.at('not')&&['in','like','between'].includes(this.tokens[this.i+1]?.value);
    if(neg)op=this.tokens[this.i+1].value;
    const precedence={or:1,and:2,'=':3,'!=':3,'<>':3,'<':3,'>':3,'<=':3,'>=':3,is:3,in:3,like:3,between:3,'+':4,'-':4,'*':5,'/':5,'%':5}[op];
    if(precedence===undefined||precedence<min)break;
    this.i+=neg?2:1;
    if(op==='is'){const not=this.eat('not');this.need('null');node={kind:'isnull',arg:node,not};}
    else if(op==='in'){this.need('(');const values=this.list(()=>this.expr());this.need(')');node={kind:'in',arg:node,values,not:neg};}
    else if(op==='between'){const low=this.expr(4);this.need('and');const high=this.expr(4);node={kind:'between',arg:node,low,high,not:neg};}
    else node={kind:'binary',op,left:node,right:this.expr(precedence+1),not:neg};
   }
   this.depth--;return node;
  }
  table(){const name=this.ident();if(!Object.hasOwn(schema,name))fail(`Unknown table ${name}. Try customers, policies or claims.`);return {name,alias:this.alias()||name};}
  projection(){
   if(this.eat('*'))return {expr:{kind:'star'},alias:null};
   if(this.token().kind==='word'&&this.tokens[this.i+1]?.value==='.'&&this.tokens[this.i+2]?.value==='*'){
    const table=this.ident();this.need('.');this.need('*');return {expr:{kind:'star',table},alias:null};
   }
   const expr=this.expr();return {expr,alias:this.alias()};
  }
  parse() {
   let ast;
   if(this.eat('select')) {
    ast={type:'select',distinct:this.eat('distinct'),columns:this.list(()=>this.projection())};this.need('from');ast.from=this.table();ast.joins=[];
    while(this.at('join')||this.at('inner')||this.at('left')) {
     let type='inner';if(this.eat('left')){type='left';this.eat('outer');}else this.eat('inner');
     this.need('join');const table=this.table();this.need('on');ast.joins.push({type,table,on:this.expr()});
    }
    if(this.eat('where'))ast.where=this.expr();
    if(this.eat('group')){this.need('by');ast.group=this.list(()=>this.expr());}
    if(this.eat('having'))ast.having=this.expr();
    if(this.eat('order')){this.need('by');ast.order=this.list(()=>{const expr=this.expr();const desc=this.eat('desc');if(!desc)this.eat('asc');return {expr,desc};});}
    if(this.eat('limit')){ast.limit=this.number();if(this.eat('offset'))ast.offset=this.number();}
   } else if(this.eat('insert')) {
    this.need('into');const name=this.ident();ast={type:'insert',table:{name,alias:name}};this.need('(');ast.columns=this.list(()=>this.ident());this.need(')');this.need('values');
    ast.values=this.list(()=>{this.need('(');const args=this.list(()=>this.expr());this.need(')');return args;});
   } else if(this.eat('update')) {
    ast={type:'update',table:this.table()};this.need('set');ast.assignments=this.list(()=>{const column=this.ident();this.need('=');return {column,expr:this.expr()};});if(this.eat('where'))ast.where=this.expr();
   } else if(this.eat('delete')) {
    this.need('from');ast={type:'delete',table:this.table()};if(this.eat('where'))ast.where=this.expr();
   } else fail('Start with SELECT, INSERT INTO, UPDATE or DELETE FROM. Schema changes and subqueries are not supported.');
   this.eat(';');if(this.token().kind!=='end')fail(`Unexpected ${String(this.token().value).toUpperCase()} near position ${this.token().pos+1}. Run one statement at a time. This simulator supports INNER/LEFT JOIN, not subqueries or schema changes.`);
   return ast;
  }
  number(){const t=this.token();if(t.kind!=='value'||typeof t.value!=='number'||!Number.isInteger(t.value)||t.value<0)fail('LIMIT and OFFSET need non-negative whole numbers.');this.i++;return t.value;}
 }
 function children(node) {
  if(!node)return [];
  return [node.arg,node.left,node.right,node.low,node.high,...(node.args||[]),...(node.values||[])].filter(Boolean);
 }
 function hasAggregate(node){return !!node&&(node.kind==='call'&&aggregateNames.has(node.name)||children(node).some(hasAggregate));}
 function columnsIn(node,withinAggregate=false){
  if(!node)return [];
  if(node.kind==='column'&&!withinAggregate)return [node];
  return children(node).flatMap(child=>columnsIn(child,withinAggregate||node.kind==='call'&&aggregateNames.has(node.name)));
 }
 function truth(v){return v==null?null:!!v;}
 function numeric(v){if(typeof v!=='number'||!Number.isFinite(v))fail('Arithmetic and SUM/AVG require numeric values.');return v;}
 function compare(a,b,op){if(a==null||b==null)return null;switch(op){case '=':return a===b;case '!=':case '<>':return a!==b;case '<':return a<b;case '>':return a>b;case '<=':return a<=b;case '>=':return a>=b;}return null;}
 function label(node){
  if(node.kind==='column')return node.path.join('.');if(node.kind==='literal')return String(node.value);
  if(node.kind==='call')return `${node.name.toUpperCase()}(${node.distinct?'DISTINCT ':''}${node.args.map(label).join(', ')})`;
  if(node.kind==='star')return '*';return 'expression';
 }
 class Simulator {
  constructor(data=seed()){this.data=clone(data);this.validateData(this.data);this.steps=0;}
  tick(n=1){this.steps+=n;if(this.steps>MAX_STEPS)fail('Query is too expensive for this small simulator. Use a narrower join or filter.');}
  validateData(data) {
   for(const [name,meta] of Object.entries(schema)) {
    if(!Array.isArray(data[name])||data[name].length>MAX_ROWS)fail(`Keep ${name} to ${MAX_ROWS} rows or fewer.`);
    const ids=new Set();
    for(const row of data[name]) {
     for(const [col,type] of Object.entries(meta.columns)) {
      const v=row[col];if(v==null)fail(`${name}.${col} cannot be NULL.`);
      if(type==='text'?(typeof v!=='string'||v.length>200):(typeof v!=='number'||!Number.isFinite(v)||type==='integer'&&!Number.isInteger(v)))fail(`${name}.${col} needs ${type==='text'?'text':type==='integer'?'a whole number':'a number'}.`);
     }
     if(ids.has(row[meta.pk]))fail(`Duplicate primary key in ${name}.${meta.pk}.`);ids.add(row[meta.pk]);
    }
   }
   for(const [name,meta] of Object.entries(schema))for(const [column,[parent,key]] of Object.entries(meta.fk||{}))for(const row of data[name])if(!data[parent].some(r=>r[key]===row[column]))fail(`Foreign key: ${name}.${column} must match an existing ${parent}.${key}. Remove dependent rows before deleting their parent.`);
  }
  descriptors(ast){const tables=ast.type==='select'?[ast.from,...ast.joins.map(j=>j.table)]:[ast.table];const names=new Set();for(const t of tables){if(!Object.hasOwn(schema,t.name))fail(`Unknown table ${t.name}.`);if(names.has(t.alias))fail(`Table alias ${t.alias} is used twice.`);names.add(t.alias);}return tables;}
  resolve(path,tables,extras={}) {
   if(path.length===1&&Object.hasOwn(extras,path[0]))return {extra:path[0]};
   const candidates=tables.filter(t=>path.length===2?t.alias===path[0]&&Object.hasOwn(schema[t.name].columns,path[1]):Object.hasOwn(schema[t.name].columns,path[0]));
   if(!candidates.length)fail(`Unknown column ${path.join('.')}. Check the table schema and aliases.`);
   if(candidates.length>1)fail(`Column ${path[0]} is ambiguous. Add a table name or alias, for example p.${path[0]}.`);
   return {alias:candidates[0].alias,column:path.at(-1)};
  }
  validateExpr(node,tables,{aggregate=false,extras={},inside=false}={}) {
   if(!node)return;
   if(node.kind==='column')this.resolve(node.path,tables,extras);
   if(node.kind==='call') {
    const agg=aggregateNames.has(node.name);
    if(!agg&&!['round','lower','upper','length','coalesce','abs'].includes(node.name))fail(`Function ${node.name.toUpperCase()} is not supported. Use COUNT, SUM, AVG, MIN, MAX, ROUND, LOWER, UPPER, LENGTH, COALESCE or ABS.`);
    if(agg&&(!aggregate||inside))fail('Aggregate functions belong in SELECT, HAVING or ORDER BY, and cannot be nested.');
    if(node.distinct&&!agg)fail('DISTINCT inside a function is only supported for aggregates.');
    if(agg&&node.args.length!==1)fail(`${node.name.toUpperCase()} needs one argument.`);
    if(node.args.some(a=>a.kind==='star')&&(node.name!=='count'||node.distinct))fail('Only COUNT(*) supports the wildcard argument.');
    const n=node.args.length;if(!agg&&(node.name==='round'?(n<1||n>2):node.name==='coalesce'?n<2:n!==1))fail(`Check the number of arguments to ${node.name.toUpperCase()}.`);
    node.args.forEach(a=>this.validateExpr(a,tables,{aggregate,extras,inside:inside||agg}));return;
   }
   children(node).forEach(c=>this.validateExpr(c,tables,{aggregate,extras,inside}));
  }
  evaluate(node,ctx,tables,group=null,extras={}) {
   this.tick();
   if(node.kind==='literal')return node.value;
   if(node.kind==='column'){const r=this.resolve(node.path,tables,extras);return r.extra?extras[r.extra]:ctx[r.alias]?.[r.column]??null;}
   const ev=n=>this.evaluate(n,ctx,tables,group,extras);
   if(node.kind==='unary'){const v=ev(node.arg);if(node.op==='not')return v==null?null:!truth(v);return v==null?null:node.op==='-'?-numeric(v):numeric(v);}
   if(node.kind==='isnull')return node.not?ev(node.arg)!=null:ev(node.arg)==null;
   if(node.kind==='between'){const v=ev(node.arg),a=compare(v,ev(node.low),'>='),b=compare(v,ev(node.high),'<=');const result=a===false||b===false?false:a==null||b==null?null:true;return node.not&&result!=null?!result:result;}
   if(node.kind==='in'){const v=ev(node.arg),values=node.values.map(ev);let result=v==null?null:values.includes(v)?true:values.includes(null)?null:false;return node.not&&result!=null?!result:result;}
   if(node.kind==='binary') {
    const a=ev(node.left),b=ev(node.right);
    if(node.op==='and'){const x=truth(a),y=truth(b);return x===false||y===false?false:x==null||y==null?null:true;}
    if(node.op==='or'){const x=truth(a),y=truth(b);return x===true||y===true?true:x==null||y==null?null:false;}
    if(node.op==='like'){
     if(a==null||b==null)return null;
     const text=String(a).toLowerCase(),pattern=String(b).toLowerCase();
     // Dynamic programming avoids executing learner input as a regex.
     let previous=Array(text.length+1).fill(false);previous[0]=true;
     for(const ch of pattern){const next=Array(text.length+1).fill(false);next[0]=ch==='%'&&previous[0];for(let j=1;j<=text.length;j++){this.tick();next[j]=ch==='%'?(previous[j]||next[j-1]):(ch==='_'||ch===text[j-1])&&previous[j-1];}previous=next;}
     return node.not?!previous[text.length]:previous[text.length];
    }
    if(['+','-','*','/','%'].includes(node.op)){if(a==null||b==null)return null;numeric(a);numeric(b);let result=node.op==='+'?a+b:node.op==='-'?a-b:node.op==='*'?a*b:b===0?null:node.op==='/'?a/b:a%b;if(result!=null&&!Number.isFinite(result))fail('The numeric result is too large.');return result;}
    return compare(a,b,node.op);
   }
   if(node.kind==='call') {
    if(aggregateNames.has(node.name)) {
     let values=node.args[0].kind==='star'?group.map(()=>1):group.map(row=>this.evaluate(node.args[0],row,tables));
     values=values.filter(v=>v!=null);if(node.distinct)values=[...new Set(values)];
     if(node.name==='count')return values.length;if(!values.length)return null;
     if(node.name==='min')return values.reduce((a,b)=>a<b?a:b);if(node.name==='max')return values.reduce((a,b)=>a>b?a:b);
     values.forEach(numeric);const total=values.reduce((sum,v)=>sum+v,0);if(!Number.isFinite(total))fail('The aggregate result is too large.');return node.name==='sum'?total:total/values.length;
    }
    const args=node.args.map(ev);if(node.name==='coalesce')return args.find(v=>v!=null)??null;
    if(args[0]==null)return null;
    switch(node.name){case 'lower':return String(args[0]).toLowerCase();case 'upper':return String(args[0]).toUpperCase();case 'length':return String(args[0]).length;case 'abs':return Math.abs(numeric(args[0]));case 'round':{const dp=args[1]??0;if(!Number.isInteger(dp)||Math.abs(dp)>8)fail('ROUND precision must be a whole number from -8 to 8.');const factor=10**dp;return Math.round(numeric(args[0])*factor)/factor;}}
   }
   fail('Unsupported expression.');
  }
  execute(sql,{readOnly=false}={}) {
   this.steps=0;const ast=new Parser(sql).parse();const tables=this.descriptors(ast);
   if(ast.type!=='select') {
    if(readOnly)fail('Practice questions use SELECT only. Try changing records in Sandbox mode.');
    return this.mutate(ast,tables);
   }
   return this.select(ast,tables);
  }
  select(ast,tables) {
   const aliases=Object.create(null);for(const c of ast.columns)if(c.alias){if(Object.hasOwn(aliases,c.alias))fail(`Output alias ${c.alias} is used twice.`);aliases[c.alias]=null;}
   this.validateExpr(ast.where,tables);
   for(let i=0;i<ast.joins.length;i++)this.validateExpr(ast.joins[i].on,tables.slice(0,i+2));
   ast.group?.forEach(e=>this.validateExpr(e,tables));
   for(const c of ast.columns){if(c.expr.kind==='star'){if(c.expr.table&&!tables.some(t=>t.alias===c.expr.table))fail(`Unknown table alias ${c.expr.table}.`);}else this.validateExpr(c.expr,tables,{aggregate:true});}
   this.validateExpr(ast.having,tables,{aggregate:true,extras:aliases});ast.order?.forEach(o=>this.validateExpr(o.expr,tables,{aggregate:true,extras:aliases}));
   const grouped=!!ast.group||ast.columns.some(c=>hasAggregate(c.expr))||hasAggregate(ast.having)||ast.order?.some(o=>hasAggregate(o.expr));
   if(ast.having&&!grouped)fail('HAVING needs GROUP BY or an aggregate. Use WHERE to filter individual rows.');
   if(grouped) {
    if(ast.columns.some(c=>c.expr.kind==='star'))fail('Choose named columns when grouping, rather than SELECT *.');
    const groupColumns=new Set((ast.group||[]).filter(e=>e.kind==='column').map(e=>JSON.stringify(this.resolve(e.path,tables))));
    const groupedExpressions=new Set((ast.group||[]).map(e=>JSON.stringify(e)));
    const check=(n,allowAliases=false)=>{if(groupedExpressions.has(JSON.stringify(n)))return;for(const c of columnsIn(n)){if(allowAliases&&c.path.length===1&&Object.hasOwn(aliases,c.path[0]))continue;if(!groupColumns.has(JSON.stringify(this.resolve(c.path,tables))))fail(`Include ${c.path.join('.')} in GROUP BY or use an aggregate.`);}};
    ast.columns.forEach(c=>check(c.expr));if(ast.having)check(ast.having,true);ast.order?.forEach(o=>check(o.expr,true));
   }
   let contexts=this.data[ast.from.name].map(row=>({[ast.from.alias]:row}));
   const plan=[{label:'FROM',detail:`Start with ${ast.from.name}`,rows:contexts.length}];
   for(const join of ast.joins) {
    const out=[];for(const ctx of contexts){let matched=false;for(const row of this.data[join.table.name]){this.tick();const next={...ctx,[join.table.alias]:row};if(truth(this.evaluate(join.on,next,tables))===true){out.push(next);matched=true;}}if(!matched&&join.type==='left')out.push({...ctx,[join.table.alias]:null});}
    contexts=out;plan.push({label:join.type==='left'?'LEFT JOIN':'INNER JOIN',detail:`Link ${join.table.name} using ON`,rows:contexts.length});
   }
   if(ast.where){contexts=contexts.filter(row=>truth(this.evaluate(ast.where,row,tables))===true);plan.push({label:'WHERE',detail:'Keep matching rows',rows:contexts.length});}
   let groups;
   if(grouped){
    if(ast.group){const map=new Map();for(const ctx of contexts){const key=JSON.stringify(ast.group.map(e=>this.evaluate(e,ctx,tables)));if(!map.has(key))map.set(key,[]);map.get(key).push(ctx);}groups=[...map.values()];}
    else groups=[contexts];
    plan.push({label:ast.group?'GROUP BY':'AGGREGATE',detail:ast.group?'Gather matching groups':'Summarise all matching rows',rows:groups.length});
   }else groups=contexts.map(ctx=>[ctx]);
   const projections=[];
   for(const c of ast.columns) {
    if(c.expr.kind==='star'){for(const table of tables.filter(t=>!c.expr.table||t.alias===c.expr.table))for(const col of Object.keys(schema[table.name].columns))projections.push({expr:{kind:'column',path:[table.alias,col]},name:tables.length===1?col:table.alias+'.'+col});}
    else projections.push({expr:c.expr,name:c.alias||label(c.expr),alias:c.alias});
   }
   let records=groups.map(group=>{
    const ctx=group[0]||{};const values=projections.map(p=>this.evaluate(p.expr,ctx,tables,group));const extra=Object.create(null);projections.forEach((p,i)=>{if(p.alias)extra[p.alias]=values[i];});return {ctx,group,values,extra};
   });
   if(ast.having){records=records.filter(r=>truth(this.evaluate(ast.having,r.ctx,tables,r.group,r.extra))===true);plan.push({label:'HAVING',detail:'Filter the groups',rows:records.length});}
   if(ast.distinct){const seen=new Set();records=records.filter(r=>{const key=JSON.stringify(r.values);if(seen.has(key))return false;seen.add(key);return true;});plan.push({label:'DISTINCT',detail:'Remove repeated result rows',rows:records.length});}
   if(ast.order){for(const o of ast.order)if(o.expr.kind==='literal'&&typeof o.expr.value==='number'&&(!Number.isInteger(o.expr.value)||o.expr.value<1||o.expr.value>projections.length))fail('ORDER BY column positions must be whole numbers within the selected column list.');for(const r of records)r.sort=ast.order.map(o=>typeof o.expr.value==='number'&&o.expr.kind==='literal'&&Number.isInteger(o.expr.value)&&o.expr.value>0?r.values[o.expr.value-1]:this.evaluate(o.expr,r.ctx,tables,r.group,r.extra));records.sort((a,b)=>{for(let i=0;i<ast.order.length;i++){const x=a.sort[i],y=b.sort[i];const cmp=x===y?0:x==null?-1:y==null?1:x<y?-1:1;if(cmp)return ast.order[i].desc?-cmp:cmp;}return 0;});plan.push({label:'ORDER BY',detail:'Sort the result',rows:records.length});}
   if(ast.limit!==undefined){records=records.slice(ast.offset||0,(ast.offset||0)+ast.limit);plan.push({label:'LIMIT',detail:'Take the requested slice',rows:records.length});}
   const total=records.length;return {type:'select',columns:projections.map(p=>p.name),rows:records.slice(0,MAX_ROWS).map(r=>r.values),total,truncated:total>MAX_ROWS,plan,ast};
  }
  mutate(ast,tables) {
   const meta=schema[ast.table.name],next=clone(this.data);let affected=0;
   if(ast.type==='insert') {
    if(new Set(ast.columns).size!==ast.columns.length)fail('Each INSERT column must be listed once.');
    ast.columns.forEach(col=>{if(!Object.hasOwn(meta.columns,col))fail(`Unknown column ${col}.`);});
    for(const values of ast.values){if(values.length!==ast.columns.length)fail('The number of VALUES must match the column list.');for(const expr of values){this.validateExpr(expr,[]);if(hasAggregate(expr))fail('INSERT values cannot use aggregates.');}const row={};ast.columns.forEach((col,i)=>row[col]=this.evaluate(values[i],{},[]));next[ast.table.name].push(row);affected++;}
   }else {
    this.validateExpr(ast.where,tables);
    if(ast.type==='update'){
     if(new Set(ast.assignments.map(a=>a.column)).size!==ast.assignments.length)fail('Set each column only once.');
     for(const a of ast.assignments){if(!Object.hasOwn(meta.columns,a.column))fail(`Unknown column ${a.column}.`);this.validateExpr(a.expr,tables);}
     next[ast.table.name]=next[ast.table.name].map(row=>{const ctx={[ast.table.alias]:row};if(ast.where&&truth(this.evaluate(ast.where,ctx,tables))!==true)return row;affected++;const updated={...row};for(const a of ast.assignments)updated[a.column]=this.evaluate(a.expr,ctx,tables);return updated;});
    }else next[ast.table.name]=next[ast.table.name].filter(row=>{const matches=!ast.where||truth(this.evaluate(ast.where,{[ast.table.alias]:row},tables))===true;if(matches)affected++;return !matches;});
   }
   this.validateData(next);this.data=next;return {type:ast.type,affected,table:ast.table.name,ast};
  }
 }
 return {Simulator,seed,schema,clone,parse:sql=>new Parser(sql).parse(),hasAggregate};
});
