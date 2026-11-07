(function () {
    'use strict';
    const lab = document.getElementById('engineering-lab');
    if (!lab) return;
    const maths = TDEngineeringMaths;
    const skills = Object.entries(maths.skills);
    lab.innerHTML = `
      <div class="lab-layout">
        <aside class="lab-picker" aria-label="Choose your practice">
          <label for="engineering-search">Find a skill</label>
          <input id="engineering-search" type="search" placeholder="Try beams, friction or AC" autocomplete="off">
          <div id="engineering-search-results" class="lab-search-results" hidden></div>
          <label for="engineering-skill">Practice focus</label>
          <select id="engineering-skill"></select>
          <div class="lab-quick">
            <button id="engineering-mixed" class="btn ghost" type="button">Mix all skills</button>
            <button id="engineering-weak" class="btn ghost" type="button">Revisit mistakes</button>
          </div>
          <p id="engineering-review-note" class="muted" role="status"></p>
          <details><summary>How to enter answers</summary><p>Use the unit beside each field. Round non-exact results to 3 significant figures. For 3.2 × 10⁻⁴, enter 3.2e-4. The ± and ×10ⁿ buttons help with number entry.</p></details>
        </aside>
        <div class="lab-practice">
          <p id="engineering-score" class="lab-stats" role="status"></p>
          <section class="quiz" aria-labelledby="engineering-question">
            <p id="engineering-topic" class="eyebrow"></p>
            <h2 id="engineering-question" tabindex="-1"></h2>
            <p class="muted">Give non-exact results to 3 significant figures.</p>
            <form id="engineering-form">
              <div id="engineering-fields"></div>
              <div class="lab-actions">
                <button id="engineering-check" class="btn" type="submit">Check answers</button>
                <button id="engineering-hint-button" class="btn ghost" type="button">Hint</button>
                <button id="engineering-reveal" class="btn ghost" type="button">Show solution</button>
                <button id="engineering-retry" class="btn ghost" type="button" hidden>Retry this question</button>
                <button id="engineering-next" class="btn ghost" type="button">New question →</button>
              </div>
              <p id="engineering-error" class="error" role="status" hidden>Enter a result before checking your answers.</p>
            </form>
            <div id="engineering-hint" class="lab-hint" hidden></div>
            <details class="lab-working"><summary>Working space</summary><label for="engineering-working" class="sr-only">Your working for this question</label><textarea id="engineering-working" rows="4" placeholder="Jot down your method here…"></textarea></details>
            <div id="engineering-feedback" class="scheme" tabindex="-1" hidden></div>
          </section>
        </div>
      </div>`;
    const element = id => document.getElementById('engineering-' + id);
    const filter = element('skill');
    filter.append(new Option('Mixed · all skills', 'mixed'));
    filter.append(new Option('Revisit mistakes', 'weak'));
    for (const [id, label] of Object.entries(maths.groups)) {
        const group = document.createElement('optgroup');
        group.label = label;
        group.append(new Option('Mix ' + label.toLowerCase(), 'group:' + id));
        for (const [skill, {ref, title}] of skills) {
            if (maths.groupFor(ref) === id) group.append(new Option(ref + ' · ' + title, skill));
        }
        filter.append(group);
    }
    const selection = new URLSearchParams(location.search).get('skill');
    if (selection && Array.from(filter.options).some(option => option.value === selection)) filter.value = selection;
    let exercise, fields, response, complete, deck = [];
    let attempted = 0, scored = 0, available = 0;
    const mistakes = new Set();
    const saved = window.TDLite?.data().labSkills || {};
    for (const [id, record] of Object.entries(saved)) {
        if (Object.hasOwn(maths.skills,id) && record.score < record.max) mistakes.add(id);
    }
    function summary() {
        element('score').textContent = attempted + ' checked · ' + scored + ' / ' + available + ' parts correct';
        element('weak').disabled = mistakes.size === 0;
        filter.querySelector('option[value="weak"]').disabled = mistakes.size === 0;
    }
    function draw() {
        if (filter.value === 'weak' && !mistakes.size) {
            filter.value = 'mixed';
            deck = [];
            element('review-note').textContent = 'You have cleared your current mistakes. Try a mixed round.';
        }
        if (!deck.length) {
            const selected = filter.value;
            deck = skills.filter(([id, {ref}]) => selected === 'mixed' || selected === id ||
                selected === 'group:' + maths.groupFor(ref) || selected === 'weak' && mistakes.has(id)).map(([id]) => id);
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
            if (deck.length > 1 && deck.at(-1) === exercise?.id) {
                [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
            }
        }
        const id = deck.pop();
        let next = maths.generate(id);
        for (let i = 0; i < 8 && next.q === exercise?.q; i++) next = maths.generate(id);
        return next;
    }
    function showQuestion(question, focus, resetWorking = true) {
        exercise = question;
        response = '';
        complete = false;
        element('topic').textContent = exercise.ref + ' · ' + exercise.title;
        element('question').textContent = exercise.q;
        fields = TDMark.calculationFields(exercise, '', value => { response = value; element('error').hidden = true; });
        element('fields').replaceChildren(fields);
        for (const id of ['check','reveal','hint-button']) element(id).hidden = false;
        for (const id of ['retry','error','feedback','hint']) element(id).hidden = true;
        if (resetWorking) element('working').value = '';
        if (focus) element('question').focus();
    }
    function showSolution(mark) {
        complete = true;
        fields.disabled = true;
        for (const id of ['check','reveal','hint-button']) element(id).hidden = true;
        element('retry').hidden = false;
        element('error').hidden = true;
        if (mark) {
            attempted++;
            scored += mark.score;
            available += exercise.marks;
            if (mark.score < exercise.marks) mistakes.add(exercise.id);
            else mistakes.delete(exercise.id);
            if (filter.value === 'weak') deck = deck.filter(id => mistakes.has(id));
            window.TDLite?.labRecord(exercise.id, mark.score, exercise.marks);
            summary();
        }
        const box = element('feedback'), heading = document.createElement('h3');
        heading.textContent = mark ? mark.score + ' / ' + exercise.marks + ' correct' : 'Worked solution';
        const list = document.createElement('ol');
        list.className = 'lab-feedback-list';
        for (const [index, part] of exercise.parts.entries()) {
            const item = document.createElement('li');
            item.className = mark ? (mark.pts[index].hit ? 'correct' : 'missed') : '';
            item.textContent = (mark ? (mark.pts[index].hit ? 'Correct. ' : 'Review. ') : '') + part.label + ' · ' + part.work;
            list.append(item);
        }
        box.replaceChildren(heading, list);
        box.hidden = false;
        box.focus();
    }
    function choose(value) {
        if (value === 'weak' && !mistakes.size) {
            element('review-note').textContent = 'Check some answers first. Missed skills will appear here.';
            return;
        }
        filter.value = value;
        deck = [];
        element('review-note').textContent = '';
        showQuestion(draw(), false);
    }
    element('form').addEventListener('submit', event => {
        event.preventDefault();
        if (complete) return;
        if (!response.trim()) {
            element('error').hidden = false;
            fields.querySelector('input').focus();
            return;
        }
        showSolution(TDMark.mark(exercise, response));
    });
    element('hint-button').addEventListener('click', () => {
        const steps = document.createElement('ul');
        for (const part of exercise.parts) {
            const item = document.createElement('li');
            const method = part.work.slice(0, part.work.lastIndexOf(' = '));
            item.textContent = part.label + ': ' + method;
            steps.append(item);
        }
        element('hint').replaceChildren(steps);
        element('hint').hidden = false;
    });
    element('reveal').addEventListener('click', () => { if (!complete) showSolution(null); });
    element('retry').addEventListener('click', () => showQuestion(exercise, true, false));
    element('next').addEventListener('click', () => showQuestion(draw(), true));
    element('mixed').addEventListener('click', () => choose('mixed'));
    element('weak').addEventListener('click', () => choose('weak'));
    filter.addEventListener('change', () => choose(filter.value));
    element('search').addEventListener('input', event => {
        const query = event.target.value.trim().toLowerCase();
        const results = element('search-results');
        results.replaceChildren();
        results.hidden = !query;
        if (!query) return;
        const matches = skills.filter(([, skill]) => (skill.ref + ' ' + skill.title + ' ' + maths.groups[maths.groupFor(skill.ref)]).toLowerCase().includes(query));
        for (const [id, {ref, title}] of matches) {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = ref + ' · ' + title;
            button.addEventListener('click', () => { choose(id); results.hidden = true; element('search').value = ''; });
            results.append(button);
        }
        if (!matches.length) results.textContent = 'No matching skills. Try a topic name or specification reference.';
    });
    summary();
    if (filter.value === 'weak' && !mistakes.size) filter.value = 'mixed';
    showQuestion(draw(), false);
})();
