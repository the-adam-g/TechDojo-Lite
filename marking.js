/* TechDojo keyword marking engine.
 * Marks a written answer against a list of mark points (like an OCR mark scheme).
 * Each point has a list of alternative ways to earn it ('k'). An alternative is an
 * array of terms; every term in the array must appear in the answer.
 *   term            default: terms of 4 letters or fewer must match a whole word (plus optional s/es);
 *                   longer terms match the start of a word (so 'compil' matches compiler/compiled)
 *   term*           force word-start matching      term$   force whole-word matching
 *   ~term           match against the answer with spaces removed (for codes such as 5A3B)
 * Works in the browser (window.TDMark) and in Node (module.exports) for testing.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory(); }
  else { root.TDMark = factory(); }
}(typeof self !== 'undefined' ? self : this, function () {

  var CONTRACTIONS = /\b(can|don|doesn|didn|isn|aren|wasn|weren|won|wouldn|couldn|shouldn|hasn|haven|hadn) t\b/g;

  function norm(s) {
    var t = String(s).toLowerCase().replace(/['\u2019\u2018`]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    t = t.replace(CONTRACTIONS, '$1t');
    return ' ' + t + ' ';
  }

  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  var cache = {};
  function compile(raw) {
    if (cache[raw]) { return cache[raw]; }
    var t = String(raw).trim(), strip = false, mode = 'auto', out;
    if (t.charAt(0) === '~') { strip = true; t = t.slice(1); }
    if (t.slice(-1) === '*' && t.indexOf('*') === t.length - 1) { mode = 'prefix'; t = t.slice(0, -1); }
    else if (t.slice(-1) === '$') { mode = 'exact'; t = t.slice(0, -1); }
    var n;
    if (t.indexOf('*') !== -1 && !strip) {
      // '*' anywhere = any word ending, e.g. 'look* up' matches 'looks up' and 'looked up'
      var parts = t.split('*').map(function (p) {
        return p.toLowerCase().replace(/['\u2019\u2018`]/g, '').replace(/[^a-z0-9]+/g, ' ');
      });
      parts[0] = parts[0].replace(/^ +/, '');
      parts[parts.length - 1] = parts[parts.length - 1].replace(/ +$/, '');
      out = { strip: false, re: new RegExp('(?:^| )' + parts.map(esc).join('[a-z0-9]*')) };
      cache[raw] = out;
      return out;
    }
    n = norm(t).trim();
    if (strip) {
      out = { strip: true, s: n.replace(/ /g, '') };
    } else {
      if (mode === 'auto') { mode = (n.indexOf(' ') === -1 && n.length <= 4) ? 'exact' : 'prefix'; }
      var re = '(?:^| )' + esc(n) + (mode === 'exact' ? '(?:s|es)?(?= |$)' : '');
      out = { strip: false, re: new RegExp(re) };
    }
    cache[raw] = out;
    return out;
  }

  function findTerm(term, N, NS) {
    var c = compile(term);
    if (c.strip) { return c.s && NS.indexOf(c.s) !== -1 ? c.s : null; }
    var m = c.re.exec(N);
    return m ? m[0].trim() : null;
  }

  function checkPoint(pt, N, NS) {
    for (var a = 0; a < pt.k.length; a++) {
      var alt = pt.k[a], found = [], ok = true;
      for (var i = 0; i < alt.length; i++) {
        var f = findTerm(alt[i], N, NS);
        if (f === null) { ok = false; break; }
        found.push(f);
      }
      if (ok && alt.length) { return found.join(' + '); }
    }
    return null;
  }

  function wordCount(text) { return (String(text).trim().match(/\S+/g) || []).length; }

  // minimum words per mark before the auto-marker will give full credit (stops keyword dumping)
  function wordsPerMark(q) { return q.nocap ? 0 : (q.t === 'long' ? 12 : 4); }

  function mark(q, text) {
    var N = norm(text), NS = N.replace(/ /g, '');
    var words = wordCount(text);
    var pts = q.pts.map(function (pt) {
      var ev = words ? checkPoint(pt, N, NS) : null;
      return { p: pt.p, hit: ev !== null, ev: ev };
    });
    var hits = pts.filter(function (p) { return p.hit; }).length;
    var wpm = wordsPerMark(q);
    var cap = null;
    if (wpm) {
      var allowed = Math.floor(words / wpm);
      if (allowed < Math.min(hits, q.marks)) { cap = allowed; }
    }
    var score = Math.min(hits, q.marks);
    if (cap !== null) { score = Math.min(score, cap); }
    return { pts: pts, hits: hits, score: score, cap: cap, words: words };
  }

  // score from a (possibly edited) set of ticks
  function scoreFromTicks(q, ticks) {
    var n = 0; for (var i = 0; i < ticks.length; i++) { if (ticks[i]) { n++; } }
    return Math.min(n, q.marks);
  }

  // OCR-style level of response bands for 6 and 9 mark questions
  function level(marks, score) {
    var bands = marks >= 9 ? [3, 6, 9] : [2, 4, 6];
    if (score <= 0) { return { n: 0, label: 'Level 0', text: 'No creditable response yet.' }; }
    if (score <= bands[0]) { return { n: 1, label: 'Level 1 (low)', text: 'A few relevant points, limited detail or links between them.' }; }
    if (score <= bands[1]) { return { n: 2, label: 'Level 2 (mid)', text: 'Several relevant points with some explanation. Develop and link them further.' }; }
    return { n: 3, label: 'Level 3 (high)', text: 'A wide range of well-explained points. Check the mark scheme for anything you missed.' };
  }

  return { norm: norm, mark: mark, scoreFromTicks: scoreFromTicks, level: level, wordCount: wordCount };
}));
