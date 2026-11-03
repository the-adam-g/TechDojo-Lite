/* Generated, deterministic-from-input algorithm practice. No eval or network. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.TDPaper2Traces=factory();})(typeof self!=='undefined'?self:this,function(){
 const types={bubble:'One bubble pass',insertion:'Insertion-sort step',binary:'Binary-search trace',stack:'Stack operations',queue:'Queue operations',tree:'Tree traversal',recursion:'Recursive calls',dijkstra:'Shortest path'};
 function generate(kind,random=Math.random){
  const ri=(a,b)=>a+Math.floor(random()*(b-a+1));
  const values=()=>Array.from({length:5},()=>ri(1,30));
  let q={kind,title:types[kind],columns:[],rows:[]};
  if(kind==='bubble'){
   const a=values(),b=a.slice();q.prompt=`Perform ONE left-to-right ascending bubble-sort pass on [${a.join(', ')}]. Enter the list after the pass.`;
   q.columns=['Pair indices','After comparison'];
   for(let i=0;i<b.length-1;i++){if(b[i]>b[i+1])[b[i],b[i+1]]=[b[i+1],b[i]];q.rows.push([`${i}, ${i+1}`,b.join(', ')]);}
   q.answer=b;q.explanation='Compare adjacent items and swap if out of order. One pass moves a maximum to the end; it need not sort the whole list.';
  }else if(kind==='insertion'){
   const prefix=values().slice(0,4).sort((a,b)=>a-b),key=ri(1,30),b=[...prefix,key];
   q.prompt=`The prefix [${prefix.join(', ')}] is sorted. In insertion sort, insert the next key ${key}. Enter the five values after this insertion.`;
   q.columns=['Action','List'];let j=3;
   while(j>=0&&b[j]>key){b[j+1]=b[j];q.rows.push([`Shift index ${j}`,b.join(', ')]);j--;}
   b[j+1]=key;q.rows.push(['Insert saved key',b.join(', ')]);q.answer=b;q.explanation='Save the key, shift larger prefix values right, then put the key into the gap.';
  }else if(kind==='binary'){
   const a=Array.from({length:9},(_,i)=>i*4+ri(0,2));const target=random()<.75?a[ri(0,8)]:39;
   q.prompt=`Binary search [${a.join(', ')}] for ${target}. Use low=0, high=8 and mid=(low+high) DIV 2. Enter the sequence of MIDDLE VALUES compared, including the match if found.`;
   q.columns=['low','high','mid index','mid value'];let low=0,high=8,answer=[];
   while(low<=high){const mid=Math.floor((low+high)/2);answer.push(a[mid]);q.rows.push([low,high,mid,a[mid]]);if(a[mid]===target)break;if(a[mid]<target)low=mid+1;else high=mid-1;}
   q.answer=answer;q.explanation=`${a.includes(target)?'Target found.':'Target absent: stop when low > high.'} Discard the midpoint as well as the impossible half.`;
  }else if(kind==='stack'||kind==='queue'){
   const a=values().slice(0,3);const s=[];let answer=[];const push=kind==='stack'?'push':'enqueue',pop=kind==='stack'?'pop':'dequeue';
   const ops=[[push,a[0]],[push,a[1]],[pop],[push,a[2]],[pop],[pop]];
   q.prompt=`Start empty. Operations: ${ops.map(o=>o.join(' ')).join('; ')}. Enter the THREE removed values in order.`;q.columns=['Operation',kind==='stack'?'Contents (bottom → top)':'Contents (front → back)','Removed'];
   ops.forEach(o=>{let v='—';if(o.length===2)s.push(o[1]);else {v=kind==='stack'?s.pop():s.shift();answer.push(v);}q.rows.push([o.join(' '),s.join(', ')||'empty',v]);});q.answer=answer;q.explanation=kind==='stack'?'LIFO: remove the most recently added item first.':'FIFO: remove the earliest remaining item first.';
  }else if(kind==='tree'){
   const offset=ri(0,15),a=[8,3,10,1,6].map(v=>v+offset),post=random()<.5;
   q.prompt=`Tree: root ${a[0]}; its left child is ${a[1]} and right child is ${a[2]}. Node ${a[1]} has left child ${a[3]} and right child ${a[4]}. All other nodes are leaves. Enter ${post?'left-to-right POST-ORDER':'BREADTH-FIRST (left before right)'} traversal.`;
   q.answer=post?[a[3],a[4],a[1],a[2],a[0]]:a;q.columns=['Visit','Value'];q.rows=q.answer.map((v,i)=>[i+1,v]);q.explanation=post?'Post-order visits left subtree, right subtree, then root.':'Breadth-first uses a queue to visit nodes level by level.';
  }else if(kind==='recursion'){
   const n=ri(3,7);q.prompt=`Trace f(${n}) and enter its returned value.\n\nfunction f(n)\n    if n <= 0 then\n        return 0\n    endif\n    return n + f(n - 2)\nendfunction`;
   q.columns=['Call','Returned value'];let result=0;const calls=[];for(let x=n;x>0;x-=2)calls.push(x);q.rows.push([`f(${n%2===0?0:-1})`,0]);calls.reverse().forEach(x=>{result+=x;q.rows.push([`f(${x})`,result]);});q.answer=[result];q.explanation='Reach the base case, then add each pending n as the calls unwind.';
  }else if(kind==='dijkstra'){
   const ab=ri(4,9),ac=ri(1,3),cb=ri(1,3),bd=ri(1,4),cd=ri(5,10);
   q.prompt=`Undirected graph: A–B=${ab}, A–C=${ac}, C–B=${cb}, B–D=${bd}, C–D=${cd}. Enter the minimum total cost from A to D.`;
   const paths=[['A → B → D',ab+bd],['A → C → D',ac+cd],['A → C → B → D',ac+cb+bd],['A → B → C → D',ab+cb+cd]];
   q.answer=[Math.min(...paths.map(p=>p[1]))];q.columns=['Simple route','Total cost'];q.rows=paths;q.explanation='These are all simple A-to-D paths in this graph. Nonnegative weights mean repeating a node cannot improve the minimum cost. Dijkstra obtains the same minimum by settling the smallest tentative distance.';
  }else throw Error('Unknown trace type');
  return q;
 }
 function check(answer,expected){const trimmed=String(answer).trim();if(!/^\[?\s*-?\d+(?:[\s,]+-?\d+)*\s*\]?$/.test(trimmed))return false;const vals=trimmed.replace(/[\[\]]/g,'').split(/[\s,]+/).filter(Boolean).map(Number);return vals.length===expected.length&&vals.every((v,i)=>v===expected[i]);}
 return {types,generate,check};
});
