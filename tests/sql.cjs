'use strict';
const assert=require('node:assert/strict');
const SQL=require('../sql-engine.js'),lessons=require('../sql-lessons.js');
const run=query=>new SQL.Simulator().execute(query);
const rows=query=>run(query).rows;
assert.deepEqual(rows("select NAME, city from CUSTOMERS where city = 'London' order by name;"),[['Amira Shah','London'],['Daniel Okafor','London']]);
assert.deepEqual(rows("SELECT name FROM customers WHERE age BETWEEN 25 AND 40 AND city IN ('Leeds','York');"),[['Chloe Evans'],['Grace Wilson']]);
assert.deepEqual(rows("SELECT name FROM customers WHERE name LIKE '%sh%' ORDER BY name;"),[['Amira Shah']]);
assert.deepEqual(rows("SELECT name FROM customers WHERE name LIKE '_EN%'"),[['Ben Carter']]);
assert.equal(rows("SELECT * FROM customers WHERE NOT city = 'London' AND age > 40").length,2);
assert.equal(rows("SELECT * FROM customers WHERE city = 'London' OR (city = 'Bristol' AND age > 60)").length,3);
assert.deepEqual(rows('SELECT DISTINCT city FROM customers ORDER BY city LIMIT 2 OFFSET 1'),[['Cardiff'],['Leeds']]);
assert.deepEqual(rows('SELECT claim_id, amount FROM claims ORDER BY amount DESC, claim_id ASC LIMIT 3'),[[1004,5800],[1003,2400],[1007,1800]]);
assert.equal(rows('SELECT * FROM customers c JOIN policies p ON c.customer_id=p.customer_id').length,10);
assert.equal(run('SELECT c.*, p.policy_id FROM customers c JOIN policies p ON c.customer_id=p.customer_id').columns.length,5);
assert.deepEqual(rows('SELECT c.name FROM customers c LEFT JOIN policies p ON c.customer_id=p.customer_id WHERE p.policy_id IS NULL'),[['Grace Wilson']]);
assert.equal(rows('SELECT c.name FROM customers c LEFT JOIN policies p ON c.customer_id=p.customer_id WHERE p.policy_id = NULL').length,0);
assert.equal(rows('SELECT c.name FROM customers c LEFT JOIN policies p ON c.customer_id=p.customer_id WHERE p.policy_id IS NOT NULL').length,10);
assert.deepEqual(rows("SELECT COUNT(*) AS n, SUM(amount) AS total FROM claims WHERE status='Approved'"),[[6,11750]]);
assert.deepEqual(rows('SELECT COUNT(*), SUM(amount), AVG(amount), MIN(amount), MAX(amount) FROM claims WHERE amount < 0'),[[0,null,null,null,null]]);
assert.deepEqual(rows('SELECT COUNT(DISTINCT city) FROM customers'),[[5]]);
assert.deepEqual(rows('SELECT COUNT(*), COUNT(p.policy_id) FROM customers c LEFT JOIN policies p ON c.customer_id=p.customer_id'),[[11,10]]);
assert.deepEqual(rows('SELECT status, COUNT(*) AS n FROM claims GROUP BY status HAVING n > 2 ORDER BY n DESC'),[['Approved',6]]);
assert.deepEqual(rows('SELECT LOWER(city), COUNT(*) FROM customers GROUP BY LOWER(city) ORDER BY LOWER(city)'),[['bristol',2],['cardiff',1],['leeds',1],['london',2],['york',1]]);
assert.deepEqual(rows('SELECT ROUND(AVG(annual_premium),2) FROM policies'),[[431.5]]);
assert.deepEqual(rows("SELECT COALESCE(p.policy_id,0), UPPER(c.name), LENGTH(c.city), ABS(-10), 8 / 0 FROM customers c LEFT JOIN policies p ON c.customer_id=p.customer_id WHERE p.policy_id IS NULL"),[[0,'GRACE WILSON',4,10,null]]);
assert.equal(rows('SELECT name FROM customers WHERE customer_id NOT IN (1, NULL)').length,0);
assert.equal(rows('SELECT name FROM customers WHERE NOT (NULL AND FALSE)').length,7);
assert.equal(rows("-- a comment\n SELECT name /* note */ FROM customers WHERE name != 'nobody';").length,7);
for(const [query,message] of [
 ['SELECT customer_id FROM customers c JOIN policies p ON c.customer_id=p.customer_id',/ambiguous/],
 ['SELECT missing FROM customers WHERE age < 0',/Unknown column/],
 ['SELECT c.name FROM customers c JOIN policies p ON c.customer_id = cl.policy_id JOIN claims cl ON p.policy_id = cl.policy_id',/Unknown column/],
 ['SELECT name, COUNT(*) FROM customers',/GROUP BY/],
 ['SELECT name AS name, COUNT(*) FROM customers',/GROUP BY/],
 ['SELECT SUM(COUNT(*)) FROM claims',/nested/],
 ['SELECT name FROM customers WHERE COUNT(*) > 1',/Aggregate/],
 ['SELECT * FROM customers; DELETE FROM customers',/one statement/],
 ['DROP TABLE customers',/Start with/],
 ['SELECT name FROM customers RIGHT JOIN policies ON customers.customer_id=policies.customer_id',/not subqueries/],
 ["SELECT name FROM customers WHERE city = 'London",/Close/],
 ['SELECT * FROM no_table',/Unknown table/],
 ['SELECT count(DISTINCT *) FROM claims',/COUNT/]
])assert.throws(()=>run(query),message,query);
let sim=new SQL.Simulator(),original=SQL.clone(sim.data);
assert.equal(sim.execute("INSERT INTO customers (customer_id,name,city,age) VALUES (8,'O''Brien','Bath',24), (9,'Mina','York',29)").affected,2);
assert.equal(sim.data.customers[7].name,"O'Brien");
assert.equal(sim.execute('UPDATE policies SET annual_premium=annual_premium+25 WHERE policy_id=101').affected,1);
assert.equal(sim.data.policies[0].annual_premium,505);
const before=SQL.clone(sim.data);
assert.throws(()=>sim.execute('UPDATE policies SET customer_id=999 WHERE policy_id=101'),/Foreign key/);assert.deepEqual(sim.data,before);
assert.throws(()=>sim.execute('UPDATE customers SET customer_id=1 WHERE customer_id=2'),/Duplicate/);assert.deepEqual(sim.data,before);
assert.throws(()=>sim.execute('DELETE FROM customers WHERE customer_id=1'),/Foreign key/);assert.deepEqual(sim.data,before);
assert.throws(()=>sim.execute("INSERT INTO customers (customer_id,name,city,age) VALUES (10,'Good','York',20), (10,'Bad','Bath',30)"),/Duplicate/);assert.deepEqual(sim.data,before);
assert.throws(()=>sim.execute("UPDATE customers SET age='young' WHERE customer_id=1"),/whole number/);assert.deepEqual(sim.data,before);
assert.throws(()=>sim.execute('INSERT INTO customers (customer_id) VALUES (12)'),/cannot be NULL/);assert.deepEqual(sim.data,before);
assert.equal(sim.execute('DELETE FROM claims WHERE claim_id=1002').affected,1);assert.equal(sim.data.claims.length,9);
assert.throws(()=>sim.execute('DELETE FROM claims',{readOnly:true}),/SELECT only/);
sim=new SQL.Simulator();assert.equal(sim.execute('UPDATE claims SET amount=amount+1, claim_id=claim_id').affected,10);
assert.equal(sim.data.claims[0].amount,1201);
const empty=SQL.seed();empty.claims=[];assert.deepEqual(new SQL.Simulator(empty).execute('SELECT COUNT(*), SUM(amount) FROM claims').rows,[[0,null]]);
assert.throws(()=>new SQL.Simulator({customers:[],policies:[SQL.seed().policies[0]],claims:[]}),/Foreign key/);
assert.throws(()=>SQL.parse('SELECT '+'('.repeat(60)+'1'+')'.repeat(60)+' FROM customers'),/nested too deeply/);
const large=SQL.seed();large.customers=Array.from({length:200},(_,i)=>({customer_id:i+1,name:'Customer '+i,city:'York',age:20}));
assert.throws(()=>new SQL.Simulator(large).execute('SELECT a.name FROM customers a JOIN customers b ON 1=1 JOIN customers c ON 1=1'),/too expensive/,'Work budget must stop oversized joins');
assert.throws(()=>run('SELECT name FROM customers ORDER BY 99'),/column positions/);
for(const question of lessons.questions){const result=run(question.sql);assert.equal(lessons.check(question,question.sql,result).correct,true,question.id);}
assert.equal(lessons.check(lessons.questions[1],"SELECT customer_id,name FROM customers WHERE customer_id IN (1,4)").correct,false,'Checker must reject dataset-specific hardcoding');
assert.equal(lessons.check(lessons.questions[13],'SELECT c.name,COUNT(*) FROM customers c LEFT JOIN policies p ON c.customer_id=p.customer_id GROUP BY c.customer_id,c.name').correct,false,'COUNT(*) cannot count missing policies');
assert.equal(lessons.check(lessons.questions[0],'SELECT city,name FROM customers').correct,false,'Requested column order matters');
assert.equal(lessons.check(lessons.questions[4],'SELECT a.name AS person,b.policy_id AS policy,b.policy_type AS type FROM policies b JOIN customers a ON b.customer_id=a.customer_id').correct,true,'Equivalent join direction and aliases should work');
console.log('PASS: filters, precedence, aliases, two/three table joins, LEFT JOIN and NULL semantics, aggregates/grouping/HAVING, sort/limits, unsupported SQL, atomic changes, key constraints, read-only practice, all 15 reference answers and equivalent-query grading on varied records.');
