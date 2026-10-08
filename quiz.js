(function () {
  var quizData = document.getElementById("quiz-data");
  var quiz = document.getElementById("quiz");
  var $ = function (id) { return document.getElementById(id); };
  var ALL = window.QUESTIONS.map(function (q) { if (!q.t) q.t = 'mcq'; return q; });
  var POOL = {
    mcq: ALL.filter(function (q) { return q.t === 'mcq'; }),
    short: ALL.filter(function (q) { return q.t === 'short'; }),
    long: ALL.filter(function (q) { return q.t === 'long'; })
  };
  var MINUTES = { mcq: 0.5, short: 2.5, long: 8 };

  // ---------- modes ----------
  var MODES = [
    { id: 'quick', glyph: '速', name: 'Quick Fire', desc: 'Multiple choice with instant feedback. Best for a fast recap.', plan: { mcq: 10 } },
    { id: 'short', glyph: '短', name: 'Short Answers', desc: 'Type 2 to 5 mark answers and get marked against the mark scheme.', plan: { short: 5 } },
    { id: 'long', glyph: '長', name: 'Extended Response', desc: 'Write extended answers and compare them with indicative mark points.', plan: { long: 2 } },
    { id: 'mixed', glyph: '混', name: 'Mixed Paper', desc: 'A mini exam: multiple choice, then short answers, then an extended question.', plan: { mcq: 6, short: 3, long: 1 } },
    { id: 'full', glyph: '全', name: 'Full Topic', desc: 'Every question on this topic, easiest style first. All available question styles.', plan: { mcq: 999, short: 999, long: 999 } }
  ];

  function shuffle(a) { a = a.slice(); for (var j = a.length - 1; j > 0; j--) { var k = Math.floor(Math.random() * (j + 1)); var t = a[j]; a[j] = a[k]; a[k] = t; } return a; }

  function counts(mode) {
    var c = {};
    ['mcq', 'short', 'long'].forEach(function (t) { c[t] = Math.min(mode.plan[t] || 0, POOL[t].length); });
    return c;
  }
  function modeStats(mode) {
    var c = counts(mode), n = 0, mins = 0;
    ['mcq', 'short', 'long'].forEach(function (t) { n += c[t]; mins += c[t] * MINUTES[t]; });
    return { n: n, mins: Math.max(1, Math.round(mins / 5) * 5 || 1) };
  }
  function modeAvailable(mode) {
    var c = counts(mode), types = 0;
    ['mcq', 'short', 'long'].forEach(function (t) { if (c[t] > 0) types++; });
    if (mode.id === 'mixed') return types >= 2;
    return types > 0;
  }
  if (quizData.dataset.course === '1') { MODES[4].name='Full Course'; MODES[4].desc='Every available question in your selection. Allow time for a longer session.'; }
  function balanced(pool, count) {
    var groups={}; shuffle(pool).forEach(function(q){ (groups[q._key] ||= []).push(q); });
    var keys=shuffle(Object.keys(groups)),out=[];
    while(out.length<count && keys.length) { keys.forEach(function(k){if(out.length<count && groups[k].length)out.push(groups[k].pop());});keys=keys.filter(function(k){return groups[k].length;}); }
    return out;
  }
  function buildSet(mode) {
    if (quizData.dataset.paper === '1') return ALL.slice();
    var c = counts(mode), out = [];
    ['mcq', 'short', 'long'].forEach(function (t) { out = out.concat(quizData.dataset.course === '1' ? balanced(POOL[t],c[t]) : shuffle(POOL[t]).slice(0,c[t])); });
    return mode.id === 'quick' || mode.id === 'short' || mode.id === 'long' ? shuffle(out) : out;
  }

  var order, i, earned, possible, results, mode, cur, answered;

  // ---------- mode picker ----------
  var hasWritten = POOL.short.length + POOL.long.length > 0;

  function showModes() {
    quiz.hidden = true; $('result').hidden = true; $('modes').hidden = false;
    var box = $('mode-list'); box.innerHTML = '';
    MODES.forEach(function (m) {
      var ok = modeAvailable(m), st = modeStats(m);
      var btn = document.createElement('button');
      btn.className = 'mode'; btn.disabled = !ok;
      var g = document.createElement('span'); g.className = 'glyph'; g.textContent = m.glyph; g.setAttribute('aria-hidden', 'true');
      var body = document.createElement('span'); body.className = 'mode-body';
      var h = document.createElement('strong'); h.textContent = m.name;
      var d = document.createElement('span'); d.className = 'mode-desc'; d.textContent = m.desc;
      var meta = document.createElement('span'); meta.className = 'mode-meta';
      if (ok) {
        var c = counts(m), parts = [];
        if (c.mcq) parts.push(c.mcq + ' multiple choice');
        if (c.short) parts.push(c.short + ' short');
        if (c.long) parts.push(c.long + ' extended');
        meta.textContent = parts.join(', ') + ' · about ' + st.mins + ' min';

      } else { meta.textContent = 'No questions of this type yet'; }
      body.appendChild(h); body.appendChild(d); body.appendChild(meta);
      btn.appendChild(g); btn.appendChild(body);
      btn.onclick = function () { start(m); };
      box.appendChild(btn);
    });
    window.scrollTo(0, 0);
  }

  // ---------- run a session ----------
  function start(m) {
    mode = m; order = buildSet(m); i = 0; earned = 0; possible = 0; results = [];
    $('modes').hidden = true; $('result').hidden = true; quiz.hidden = false;
    $('mode-label').textContent = m.name;
    render();
  }

  function maxOf(q) { return q.t === 'mcq' ? 1 : q.marks; }
  function remaining() { var p = 0; for (var k = i; k < order.length; k++) p += maxOf(order[k]); return p; }

  function updateScore() { $('score').textContent = 'Score: ' + earned + ' / ' + possible; }

  function render() {
    var q = order[i]; cur = { q: q, committed: false }; answered = false;
    $('count').textContent = 'Question ' + (i + 1) + ' of ' + order.length;
    updateScore();
    $('progress').style.width = (i / order.length * 100) + '%';
    $('question').textContent = q.q;
    $('question-source').textContent = q._source || '';
    var tag = $('qtag');
    tag.textContent = q.t === 'mcq' ? 'Multiple choice · 1 mark' : (q.t === 'short' ? 'Short answer · ' : 'Extended response · ') + q.marks + ' marks';
    tag.className = 'qtag ' + q.t;
    $('feedback').hidden = true; $('next').hidden = true;
    var box = $('options'); box.innerHTML = '';
    if (q.t === 'mcq') {
      $('written').hidden = true; box.hidden = false;
      var opts = shuffle(q.o.map(function (text, idx) { return { text: text, correct: idx === q.a, index: idx }; }));
      opts.forEach(function (o, n) {
        var b = document.createElement('button');
        b.className = 'option';
        b.innerHTML = '<span class="letter">' + 'ABCD'[n] + '</span>';
        b.appendChild(document.createTextNode(o.text));
        b.onclick = function () { choose(b, o, q); };
        b.dataset.correct = o.correct ? '1' : '';
        box.appendChild(b);
      });
    } else {
      box.hidden = true; $('written').hidden = false;
      var ta = $('answer'); ta.value = ''; ta.readOnly = false;
      $('mark').hidden = false; $('skip').hidden = false; $('scheme').hidden = true; $('scheme').innerHTML = '';
      $('whint').textContent = q.t === 'long'
        ? 'Aim for a structured answer of about ' + (q.marks * 25) + ' words. Explain and link your points.'
        : 'Aim for one clear, specific point for each mark.';
      updateWc();
    }
  }

  // ---------- multiple choice ----------
  function choose(btn, o, q) {
    if (answered) return; answered = true;
    possible += 1;
    if (o.correct) earned++;
    document.querySelectorAll('.option').forEach(function (b) {
      b.disabled = true;
      if (b.dataset.correct) b.classList.add('right');
    });
    if (!o.correct) btn.classList.add('wrong');
    var f = $('feedback'); f.hidden = false;
    f.className = 'feedback ' + (o.correct ? 'ok' : 'bad');
    f.innerHTML = '<strong>' + (o.correct ? 'Correct!' : 'Not quite.') + '</strong> ';
    f.appendChild(document.createTextNode(q.e));
    updateScore();
    var right = q.o[q.a];
    results.push({ q: q, got: o.correct ? 1 : 0, max: 1, missed: o.correct ? [] : ['Correct answer: ' + right], chosen: o.text });
    showNext();
  }

  function showNext() {
    $('next').hidden = false;
    $('next').textContent = i === order.length - 1 ? 'See results →' : 'Next question →';
    $('next').focus();
  }

  // ---------- written answers ----------
  function updateWc() {
    var n = TDMark.wordCount($('answer').value);
    $('wcount').textContent = n + (n === 1 ? ' word' : ' words');
  }
  $('answer').addEventListener('input', updateWc);
  $('answer').addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); doMark(false); } });
  $('mark').onclick = function () { doMark(false); };
  $('skip').onclick = function () { doMark(true); };

  function doMark(skip) {
    var q = cur.q;
    if (answered) return;
    if (!skip && !$('answer').value.trim()) { $('whint').textContent = 'Write an answer first, or choose "Show mark scheme" to give up on this one.'; $('answer').focus(); return; }
    answered = true;
    cur.answerText = skip ? '' : $('answer').value; cur.skipped = skip;
    var r = TDMark.mark(q, skip ? '' : $('answer').value);
    cur.ticks = r.pts.map(function (p) { return p.hit; });
    cur.pts = r.pts; cur.cap = r.cap; cur.words = r.words; cur.edited = false;
    $('answer').readOnly = true; $('mark').hidden = true; $('skip').hidden = true;
    renderScheme();
    showNext();
    $('scheme').focus();
  }

  function curScore() {
    if (cur.skipped) return 0;
    var q = cur.q, s = TDMark.scoreFromTicks(q, cur.ticks);
    if (cur.cap !== null && !cur.edited) s = Math.min(s, cur.cap);
    return s;
  }

  function renderScheme() {
    var q = cur.q, box = $('scheme'), s = curScore();
    box.hidden = false; box.innerHTML = '';
    box.setAttribute('tabindex', '-1');
    var head = document.createElement('div'); head.className = 'scheme-head';
    var big = document.createElement('div'); big.className = 'scheme-score';
    big.textContent = s + ' / ' + q.marks + ' marks';
    head.appendChild(big);
    box.appendChild(head);
    if (cur.cap !== null && !cur.edited) {
      var capn = document.createElement('p'); capn.className = 'cap-note';
      capn.textContent = 'Your answer is short for ' + q.marks + ' marks (' + cur.words + ' words), so the auto-marker has limited you to ' + cur.cap + '. Develop each point in a full sentence.';
      box.appendChild(capn);
    }
    var help = document.createElement('p'); help.className = 'scheme-help';
    help.textContent = 'Your written mark counts towards this session when you click Next / See results. Mark scheme (any ' + q.marks + ' points). The auto-marker looks for key words, so it can miss a correct answer in different words. Click a point to tick or untick it yourself.';
    box.appendChild(help);
    var ul = document.createElement('ul'); ul.className = 'points';
    cur.pts.forEach(function (p, n) {
      var li = document.createElement('li');
      var b = document.createElement('button'); b.type = 'button';
      b.disabled = cur.skipped;
      b.className = 'pt ' + (cur.ticks[n] ? 'hit' : 'miss');
      b.setAttribute('aria-pressed', cur.ticks[n] ? 'true' : 'false');
      var mk = document.createElement('span'); mk.className = 'pt-mark'; mk.textContent = cur.ticks[n] ? '✓' : '✗'; mk.setAttribute('aria-hidden', 'true');
      var tx = document.createElement('span'); tx.className = 'pt-text'; tx.textContent = p.p;
      b.appendChild(mk); b.appendChild(tx);
      if (p.hit && p.ev && !cur.edited) { var ev = document.createElement('em'); ev.className = 'pt-ev'; ev.textContent = 'matched "' + p.ev + '"'; tx.appendChild(ev); }
      b.onclick = function () { cur.ticks[n] = !cur.ticks[n]; cur.edited = true; renderScheme(); var again = $('scheme').querySelectorAll('.pt')[n]; if (again) again.focus(); };
      li.appendChild(b); ul.appendChild(li);
    });
    box.appendChild(ul);
    var d = document.createElement('details'); d.className = 'model';
    d.open = q.t === 'short' ? true : false;
    var sm = document.createElement('summary'); sm.textContent = 'Model answer';
    var mp = document.createElement('p'); mp.textContent = q.model;
    d.appendChild(sm); d.appendChild(mp); box.appendChild(d);
  }

  function commitWritten() {
    if (cur.committed) return; cur.committed = true;
    var q = cur.q, s = curScore();
    possible += q.marks; earned += s;
    var missed = [];
    cur.pts.forEach(function (p, n) { if (!cur.ticks[n]) missed.push(p.p); });
    results.push({ q: q, got: s, max: q.marks, missed: s >= q.marks ? [] : missed.slice(0, 6), answer: cur.answerText, skipped: cur.skipped, pts: cur.pts.map(function(p,n){return {p:p.p,hit:!!cur.ticks[n]};}) });
    updateScore();
  }

  $('next').onclick = function () {
    if (cur.q.t !== 'mcq') commitWritten();
    i++; if (i < order.length) render(); else finish();
  };

  // ---------- results ----------
  function finish() {
    var pct = possible ? Math.round(earned / possible * 100) : 0;
    quiz.hidden = true; $('result').hidden = false;
    $('result-mode').textContent = mode.name + ' · session complete';
    $('result-score').textContent = earned + ' / ' + possible + ' marks (' + pct + '%)';
    $('result-msg').textContent = pct >= 85 ? 'Strong session! Revisit the points you missed.' : pct >= 50 ? 'Good progress. Practise the questions below to build confidence.' : 'Keep training. Use the explanations and mark schemes to guide your next attempt.';

    var by = { mcq: [0, 0], short: [0, 0], long: [0, 0] };
    results.forEach(function (r) { by[r.q.t][0] += r.got; by[r.q.t][1] += r.max; });
    var names = { mcq: 'Multiple choice', short: 'Short answer', long: 'Extended response' };
    var bd = $('breakdown'); bd.innerHTML = '';
    ['mcq', 'short', 'long'].forEach(function (t) {
      if (!by[t][1]) return;
      var d = document.createElement('div'); d.className = 'bd';
      var n = document.createElement('span'); n.textContent = names[t];
      var v = document.createElement('strong'); v.textContent = by[t][0] + ' / ' + by[t][1];
      d.appendChild(n); d.appendChild(v); bd.appendChild(d);
    });

    var rv = $('revise'); rv.innerHTML = '';
    var weak = results.filter(function (r) { return r.got < r.max; });
    if (weak.length) {
      var h = document.createElement('h3'); h.textContent = 'Where you dropped marks'; rv.appendChild(h);
      weak.forEach(function (r) {
        var box = document.createElement('div'); box.className = 'rv';
        var t = document.createElement('p'); t.className = 'rv-q';
        var qt = r.q.q.length > 140 ? r.q.q.slice(0, 137) + '...' : r.q.q;
        t.textContent = qt + '  (' + r.got + '/' + r.max + ')';
        box.appendChild(t);
        if (r.missed.length) {
          var ul = document.createElement('ul');
          r.missed.forEach(function (m) { var li = document.createElement('li'); li.textContent = m; ul.appendChild(li); });
          box.appendChild(ul);
        }
        rv.appendChild(box);
      });
    }

    var perTopic={};results.forEach(function(r){var k=r.q._source || 'Topic';perTopic[k] ||= [0,0];perTopic[k][0]+=r.got;perTopic[k][1]+=r.max;});
    var summary=$('topic-breakdown');summary.replaceChildren();
    if(quizData.dataset.course==='1'){var heading=document.createElement('h3');heading.textContent='Your topic breakdown';summary.appendChild(heading);Object.keys(perTopic).forEach(function(k){var p=document.createElement('p');p.textContent=k+' — '+perTopic[k][0]+' / '+perTopic[k][1]+' marks';summary.appendChild(p);});}
    window.scrollTo(0, 0);
  }

  $('retry').onclick = function () { start(mode); };
  $('change-mode').onclick = showModes;

  // ---------- export to PDF ----------
  // Builds a print-only sheet with every question of the session: the student's
  // answer, then the mark scheme / correct answer below it. The browser's
  // print dialog ("Save as PDF") produces the file, so no library is needed.
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function buildPrintSheet() {
    var sheet = $('print-sheet'); sheet.innerHTML = '';
    var topicTitle = (document.querySelector('.modes-title') || {}).textContent || document.title;
    var pct = possible ? Math.round(earned / possible * 100) : 0;

    sheet.appendChild(el('h1', '', 'TechDojo Lite: ' + topicTitle));
    sheet.appendChild(el('p', 'ps-meta', mode.name + ' · ' + new Date().toLocaleDateString() +
      ' · Score ' + earned + ' / ' + possible + ' marks (' + pct + '%)'));

    results.forEach(function (r, n) {
      var q = r.q, box = el('section', 'ps-q');
      var tag = q.t === 'mcq' ? 'Multiple choice · 1 mark'
        : (q.t === 'short' ? 'Short answer · ' : 'Extended response · ') + q.marks + ' marks';
      box.appendChild(el('h2', '', 'Question ' + (n + 1) + ' (' + r.got + ' / ' + r.max + ')'));
      box.appendChild(el('p', 'ps-tag', tag));
      box.appendChild(el('p', 'ps-question', q.q));

      // Your answer
      box.appendChild(el('h3', '', 'Your answer'));
      if (q.t === 'mcq') {
        box.appendChild(el('p', 'ps-answer', r.chosen));
      } else if (r.skipped || !r.answer || !r.answer.trim()) {
        box.appendChild(el('p', 'ps-answer ps-none', '(No answer given: mark scheme viewed)'));
      } else {
        box.appendChild(el('p', 'ps-answer', r.answer));
      }

      // Mark scheme below it
      box.appendChild(el('h3', '', q.t === 'mcq' ? 'Correct answer' : 'Mark scheme (any ' + q.marks + ' points)'));
      if (q.t === 'mcq') {
        box.appendChild(el('p', 'ps-correct', q.o[q.a]));
        box.appendChild(el('p', 'ps-explain', q.e));
      } else {
        var ul = el('ul', 'ps-points');
        r.pts.forEach(function (p) {
          ul.appendChild(el('li', p.hit ? 'hit' : 'miss', (p.hit ? '✓ ' : '✗ ') + p.p));
        });
        box.appendChild(ul);
        box.appendChild(el('h3', '', 'Model answer'));
        box.appendChild(el('p', 'ps-model', q.model));
      }
      sheet.appendChild(box);
    });
  }

  $('export-pdf').onclick = function () {
    buildPrintSheet();
    var oldTitle = document.title;
    var topicTitle = (document.querySelector('.modes-title') || {}).textContent || 'answers';
    document.title = 'TechDojo - ' + topicTitle + ' - ' + mode.name;   // becomes the default PDF filename
    document.body.classList.add('printing');
    function done() {
      document.body.classList.remove('printing');
      document.title = oldTitle;
      window.removeEventListener('afterprint', done);
    }
    window.addEventListener('afterprint', done);
    window.print();
  };

  var examClock;
  function beginPaper() {
    $('change-mode').hidden = true;
    start({id:'paper',name:'Custom practice paper',plan:{mcq:POOL.mcq.length,short:POOL.short.length,long:POOL.long.length}});
    clearInterval(examClock);var minutes=Number(quizData.dataset.minutes),end=Date.now()+minutes*60000;
    function tick(){var el=$('exam-timer');if(!minutes){el.textContent='Untimed paper';return;}if(!$('result').hidden){clearInterval(examClock);el.textContent='Paper complete';return;}var left=Math.max(0,Math.ceil((end-Date.now())/1000));el.textContent=left?'Time remaining: '+Math.floor(left/60)+':'+String(left%60).padStart(2,'0'):'Time is up. You can finish your practice; the timer does not submit answers.';if(!left)clearInterval(examClock);}
    tick();if(minutes)examClock=setInterval(tick,1000);
    $('retry').onclick=beginPaper;
  }
  // ---------- boot ----------
  if (quizData.dataset.paper === '1') { beginPaper(); } else { showModes(); }
})();
