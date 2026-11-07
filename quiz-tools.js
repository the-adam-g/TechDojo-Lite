(() => {
    'use strict';
    const mounted = new WeakSet();

    function attach() {
        const data = document.getElementById('quiz-data');
        const prompt = document.getElementById('question');
        const options = document.getElementById('options');
        const result = document.getElementById('result');
        const modes = document.getElementById('modes');
        if (!data || !prompt || !options || mounted.has(data)) return;
        let questions;
        try { questions = window.QUESTIONS || JSON.parse(data.textContent); }
        catch { return; }
        if (!Array.isArray(questions)) return;
        mounted.add(data);
        const byPrompt = new Map();
        for (const q of questions) {
            const key = q.q.trim();
            if (!byPrompt.has(key)) byPrompt.set(key, []);
            byPrompt.get(key).push(q);
        }

        const controls = document.createElement('div');
        controls.className = 'quiz-tools actions';
        const label = document.createElement('label');
        label.textContent = 'Confidence ';
        const confidence = document.createElement('select');
        confidence.setAttribute('aria-label','Confidence before answering');
        for (const [value,text] of [['','Optional'],['sure','Sure'],['guess','Guessing']]) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            confidence.append(option);
        }
        label.append(confidence);
        controls.append(label);
        const report = document.createElement('a');
        report.className = 'btn ghost';
        report.textContent = '⚑ Report question';
        report.target = '_blank';
        report.rel = 'noopener';
        report.setAttribute('aria-label','Report question (opens in a new tab)');
        report.hidden = true;
        controls.append(report);
        prompt.after(controls);
        let active = null;
        let review = [];

        function showQuestion() {
            const text = prompt.textContent.trim();
            const matches = byPrompt.get(text) || [];
            const source = document.getElementById('question-source')?.textContent.trim();
            active = matches.length === 1 ? matches[0] : matches.find(q => q._source === source);
            confidence.value = '';
            confidence.disabled = false;
            label.hidden = !active || (active.t || 'mcq') !== 'mcq';
            const allowReport = active?._key && active?._id && data.dataset.auth === '1';
            report.hidden = !allowReport;
            if (allowReport) report.href = 'reports.php?' + new URLSearchParams({key:active._key,id:active._id});
            controls.hidden = label.hidden && report.hidden;
        }

        options.addEventListener('click', event => {
            const button = event.target.closest('button.option');
            if (!button || !active || confidence.disabled) return;
            confidence.disabled = true;
            if (!confidence.value) return;
            review.push({q:active.q, confidence:confidence.value, correct:button.dataset.correct === '1'});
        }, true);
        new MutationObserver(showQuestion).observe(prompt,{childList:true,characterData:true,subtree:true});
        if (modes) new MutationObserver(() => {
            if (!modes.hidden) review=[];
        }).observe(modes,{attributes:true,attributeFilter:['hidden']});
        if (result) new MutationObserver(() => {
            if (result.hidden) return;
            result.querySelector('.confidence-review')?.remove();
            const priority = review.filter(item => item.confidence === 'sure' && !item.correct);
            if (!review.length) return;
            const section = document.createElement('section');
            section.className = 'card confidence-review';
            const title = document.createElement('h3');
            title.textContent = 'Confidence review';
            const summary = document.createElement('p');
            summary.textContent = priority.length + ' confidently wrong · ' + review.filter(item => item.confidence === 'guess' && item.correct).length + ' correct guesses';
            section.append(title,summary);
            if (priority.length) {
                const list = document.createElement('ul');
                for (const item of priority) {
                    const row = document.createElement('li');
                    row.textContent = item.q;
                    list.append(row);
                }
                section.append(list);
            }
            result.append(section);
            review=[];
        }).observe(result,{attributes:true,attributeFilter:['hidden']});
        showQuestion();
    }

    function boot() {
        attach();
        const app = document.getElementById('app');
        if (app) new MutationObserver(attach).observe(app,{childList:true});
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot);
    else boot();
})();
