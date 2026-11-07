(() => {
    'use strict';

    function node(tag, text, className) {
        const element = document.createElement(tag);
        if (text !== undefined) element.textContent = text;
        if (className) element.className = className;
        return element;
    }

    function button(text, action, className = 'btn') {
        const control = node('button', text, className);
        control.type = 'button';
        control.addEventListener('click', action);
        return control;
    }

    function link(text, href) {
        const control = node('a', text, 'btn ghost');
        control.href = href;
        return control;
    }

    function shuffle(items) {
        const list = items.slice();
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }

    function score(question, answer) {
        if ((question.t || 'mcq') === 'mcq') return Number(answer === question.a);
        if (!answer || !window.TDMark) return 0;
        return TDMark.mark(question, answer).score;
    }

    function answerText(question, answer) {
        if (answer === null || answer === '') return 'Unanswered';
        return (question.t || 'mcq') === 'mcq' ? question.o[answer] : answer;
    }

    function setup(root, data) {
        const header = node('section', undefined, 'arena-hero');
        const back = data.onBack ? button('← Back',data.onBack,'btn ghost') : link('← Back', data.back);
        header.append(node('p', data.mode === 'boss' ? '◆ Boss battle' : '◷ Exam conditions', 'eyebrow'),
            node('h1', data.title), back);
        const content = node('section', undefined, 'card arena-card');
        root.replaceChildren(header, content);
        const reset = () => content.replaceChildren();
        if (data.mode === 'boss') boss();
        else exam();

        function review(answers, confidence = []) {
            const questions = data.questions;
            if(window.TDLite) questions.forEach((q,i)=>{if(answers[i]!==undefined) TDLite.record(q,score(q,answers[i]),(q.t||'mcq')==='mcq'?1:q.marks);});
            const attempted = answers.map((value, i) => ({value, i})).filter(item => item.value !== undefined);
            attempted.sort((a, b) => Number(confidence[b.i] === 'sure' && !score(questions[b.i], b.value)) -
                Number(confidence[a.i] === 'sure' && !score(questions[a.i], a.value)));
            for (const {value, i} of attempted) {
                const q = questions[i];
                const mcq = (q.t || 'mcq') === 'mcq';
                const mark = score(q, value);
                const maximum = mcq ? 1 : q.marks;
                const detail = node('details', undefined, 'arena-review');
                const label = mcq && confidence[i] === 'sure' && mark === 0 ? ' · Confidently wrong' : '';
                detail.append(node('summary', (i+1) + '. ' + q.q + ' · ' + mark + '/' + maximum + label),
                    node('p', 'Your answer: ' + answerText(q, value)));
                if (mcq) {
                    detail.append(node('p', 'Correct answer: ' + q.o[q.a]), node('p', q.e));
                } else {
                    detail.append(node('p', q.t === 'calc' ? 'Worked solution' : 'Model answer: ' + q.model));
                    const list = node('ul');
                    for (const point of q.pts) list.append(node('li', point.p));
                    detail.append(list);
                }
                content.append(detail);
            }
        }

        function boss() {
            const count = data.questions.length;
            const goal = Math.ceil(count * 0.7);
            const maxLives = count - goal + 1;
            let wins = 0;
            let lives = maxLives;
            const choices = [];
            reset();
            content.append(node('h2', 'Defeat the unit boss'),
                node('p', 'Land ' + goal + ' correct hits before you lose ' + maxLives + ' lives.'),
                button('Start battle', next));
            if (data.best !== null && data.best !== undefined) {
                content.append(node('p', '◆ Badge earned · best accuracy ' + data.best + '%', 'arena-status'));
            }
            function next() {
                if (wins >= goal || !lives || choices.length >= count) { finish(); return; }
                reset();
                const meter = node('progress');
                meter.max = goal;
                meter.value = goal - wins;
                meter.setAttribute('aria-label','Boss health');
                const q = data.questions[choices.length];
                const heading = node('h2', q.q, 'arena-question');
                heading.tabIndex = -1;
                const options = node('div', undefined, 'arena-options');
                const status = node('p', '', 'arena-status');
                status.setAttribute('role','status');
                content.append(node('p', 'Boss health ' + (goal-wins) + '/' + goal + ' · Lives ' + lives + '/' + maxLives, 'eyebrow'),
                    meter, heading, options, status);
                q.o.forEach((option, i) => options.append(button(option, () => {
                    for (const control of options.children) control.disabled = true;
                    choices.push(i);
                    if (i === q.a) wins++;
                    else lives--;
                    status.textContent = (i === q.a ? 'Hit! ' : 'Lost a life. ') + q.e;
                    const advance = button(wins >= goal || !lives || choices.length === count ? 'See result' : 'Next question', next);
                    content.append(advance);
                    advance.focus();
                }, 'btn ghost')));
                heading.focus();
            }
            function finish() {
                reset();
                const won = wins >= goal;
                content.append(node('h2', won ? '◆ Boss defeated' : 'The boss wins this round'),
                    node('p', wins + ' correct out of ' + choices.length + ' answered.'),
                    link('Play again', location.href));
                if (won && data.token) {
                    const status = node('p','Saving badge…','arena-status');
                    status.setAttribute('role','status');
                    content.append(status);
                    fetch('boss-result.php', {method:'POST',headers:{'Content-Type':'application/json'},
                        body:JSON.stringify({token:data.token,csrf:data.csrf,choices})})
                        .then(response => {
                            if (!response.ok) throw Error();
                            status.textContent = 'Badge saved to your account.';
                        })
                        .catch(() => { status.textContent = 'The win could not be saved. Your result is shown below.'; });
                }
                review(choices);
            }
        }

        function exam() {
            const questions = data.questions;
            const answers = questions.map(q => (q.t || 'mcq') === 'mcq' ? null : '');
            const confidence = [];
            const flags = new Set();
            let index = 0;
            let deadline = 0;
            let timer = null;
            let finished = false;
            let started = false;
            back.addEventListener('click', event => {
                if (started && !finished && !window.confirm('Leave this paper? Your draft will be lost.')) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    return;
                }
                clearInterval(timer);
            }, true);
            const clock = node('strong', data.minutes ? data.minutes + ':00' : 'Untimed');
            const navigator = node('nav', undefined, 'arena-number-grid');
            navigator.setAttribute('aria-label','Questions');
            const panel = node('div');
            reset();
            content.append(node('h2','Ready to start?'),
                node('p', questions.length + ' questions · ' + (data.minutes ? data.minutes + ' minutes' : 'untimed')),
                node('p','Move between questions, flag any for review and hand in when ready. Keep this tab open to retain your answers.'),
                button('Start paper', () => {
                    started = true;
                    reset();
                    if (data.minutes > 0) {
                        deadline = Date.now() + data.minutes * 60000;
                        timer = setInterval(tick, 250);
                    }
                    content.append(clock, navigator, panel, button('Hand in paper', () => {
                        const blank = answers.filter(value => value === null || !String(value).trim()).length;
                        if (window.confirm((blank ? blank + ' unanswered. ' : '') + 'Hand in this paper now?')) finish(false);
                    }));
                    showQuestion();
                    tick();
                }));
            function tick() {
                if (!deadline || finished) return;
                const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
                clock.textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2,'0') + ' remaining';
                if (!seconds) finish(true);
            }
            function showNav() {
                navigator.replaceChildren(...questions.map((_, i) => {
                    const answered = answers[i] !== null && String(answers[i]).trim() !== '';
                    const control = button(String(i+1) + (flags.has(i) ? ' ⚑' : ''), () => {
                        index = i;
                        showQuestion();
                    }, 'btn ghost arena-number');
                    if (i === index) control.setAttribute('aria-current','step');
                    if (answered) control.classList.add('arena-answered');
                    control.setAttribute('aria-label','Question ' + (i+1) + (answered ? ', answered' : ', unanswered') + (flags.has(i) ? ', flagged' : ''));
                    return control;
                }));
            }
            function showQuestion() {
                showNav();
                const q = questions[index];
                const heading = node('h2', (index+1) + '. ' + q.q, 'arena-question');
                heading.tabIndex = -1;
                panel.replaceChildren(heading);
                if ((q.t || 'mcq') === 'mcq') {
                    const group = node('fieldset', undefined, 'arena-options');
                    group.append(node('legend','Choose an answer'));
                    q.o.forEach((option,i) => {
                        const label = node('label', undefined,'topic-choice');
                        const radio = node('input');
                        radio.type = 'radio';
                        radio.name = 'arena-option';
                        radio.checked = answers[index] === i;
                        radio.addEventListener('change', () => { answers[index] = i; showNav(); });
                        label.append(radio, document.createTextNode(' ' + option));
                        group.append(label);
                    });
                    panel.append(group, button('Clear answer', () => { answers[index] = null; showQuestion(); }, 'btn ghost'));
                } else if (q.t === 'calc') {
                    panel.append(TDMark.calculationFields(q, answers[index], value => { answers[index] = value; showNav(); }));
                } else {
                    const label = node('label','Your response (' + q.marks + ' marks)');
                    const textarea = node('textarea');
                    textarea.rows = 7;
                    textarea.maxLength = 4000;
                    textarea.value = answers[index];
                    textarea.addEventListener('input', () => { answers[index] = textarea.value; showNav(); });
                    label.append(textarea);
                    panel.append(label);
                }
                const label = node('label','Confidence (optional)');
                const select = node('select');
                for (const [value,text] of [['','Choose…'],['sure','Sure'],['guess','Guessing']]) {
                    const option = node('option',text);
                    option.value = value;
                    select.append(option);
                }
                select.value = confidence[index] || '';
                select.addEventListener('change', () => { confidence[index] = select.value; });
                label.append(select);
                const controls = node('div',undefined,'actions');
                const previous = button('← Previous', () => { index--; showQuestion(); },'btn ghost');
                const next = button('Next →', () => { index++; showQuestion(); },'btn ghost');
                previous.disabled = index === 0;
                next.disabled = index === questions.length-1;
                controls.append(previous, button(flags.has(index) ? 'Remove flag' : '⚑ Flag for review', () => {
                    if (flags.has(index)) flags.delete(index);
                    else flags.add(index);
                    showQuestion();
                },'btn ghost'), next);
                panel.append(label,controls);
                heading.focus();
            }
            function finish(expired) {
                if (finished) return;
                finished = true;
                clearInterval(timer);
                reset();
                const total = questions.reduce((sum,q,i) => sum + score(q,answers[i]),0);
                const maximum = questions.reduce((sum,q) => sum + ((q.t || 'mcq') === 'mcq' ? 1 : q.marks),0);
                content.append(node('h2', expired ? 'Time is up' : 'Paper handed in'),
                    node('p', total + ' / ' + maximum + ' practice marks', 'lead'));
                if (questions.some(q => q.t === 'short' || q.t === 'long')) content.append(node('p','Written marks are keyword estimates. Compare your wording with the mark points.'));
                review(answers,confidence);
            }
        }
    }

    async function boot() {
        const root = document.getElementById('practice-arena');
        if (!root) return;
        try {
            const embedded = document.getElementById('arena-data');
            if (embedded) { setup(root, JSON.parse(embedded.textContent)); return; }
            const params = new URLSearchParams(location.search);
            const sid = params.get('s');
            const uid = params.get('u');
            const response = await fetch('data/bank.json');
            if (!response.ok) throw Error('The question bank could not be loaded.');
            const bank = await response.json();
            const unit = bank[sid]?.units?.[uid];
            if (!unit) throw Error('Choose a unit to start a boss battle.');
            const groups = Object.values(unit.topics).map(topic => shuffle(topic.questions.filter(q => (q.t || 'mcq') === 'mcq')));
            const questions = [];
            while (questions.length < 10 && groups.some(group => group.length)) {
                for (const group of shuffle(groups)) {
                    if (group.length && questions.length < 10) questions.push(group.pop());
                }
            }
            if (!questions.length) throw Error('This unit has no multiple-choice questions yet.');
            setup(root,{mode:'boss',title:unit.code+' · '+unit.title,questions,
                back:'index.html?'+new URLSearchParams({page:'unit',s:sid,u:uid})});
        } catch (error) {
            root.replaceChildren(node('p',error.message,'notice'),link('Browse subjects','index.html'));
        }
    }

    window.TechDojoArena = {setup};
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot);
    else boot();
})();
