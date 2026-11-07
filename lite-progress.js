(function () {
    'use strict';
    const key = 'techdojo-lite-progress-v1';
    const empty = () => ({version:1, remember:true, questions:{}, bookmarks:[], recent:[], labSkills:{}});
    let persistent = true;
    function validate(value) {
        if (!value || value.version !== 1 || typeof value.remember !== 'boolean' ||
            !value.questions || Array.isArray(value.questions) || !Array.isArray(value.bookmarks) || !Array.isArray(value.recent) ||
            !value.labSkills || Array.isArray(value.labSkills)) throw Error('Choose a TechDojo Lite progress backup.');
        const result = empty();
        result.remember = value.remember;
        const validId = id => typeof id === 'string' && id.length < 40000 && id.startsWith('[');
        function record(input) {
            if (!input || !Number.isInteger(input.score) || !Number.isInteger(input.max) || input.max < 1 || input.max > 100 ||
                input.score < 0 || input.score > input.max || !Number.isInteger(input.attempts) || input.attempts < 1 ||
                input.attempts > 1000000 || !Number.isInteger(input.best) || input.best < 0 || input.best > input.max ||
                !Number.isFinite(input.date) || input.date < 0) throw Error('The backup contains invalid progress.');
            return {score:input.score,max:input.max,attempts:input.attempts,best:input.best,date:input.date};
        }
        const entries = Object.entries(value.questions);
        if (entries.length > 10000 || value.bookmarks.length > 10000 || value.recent.length > 8 || Object.keys(value.labSkills).length > 100) throw Error('The backup is too large.');
        for (const [id, data] of entries) {
            if (!validId(id)) throw Error('The backup contains an invalid question reference.');
            result.questions[id] = record(data);
        }
        for (const id of value.bookmarks) {
            if (!validId(id)) throw Error('The backup contains an invalid bookmark.');
            if (!result.bookmarks.includes(id)) result.bookmarks.push(id);
        }
        for (const topic of value.recent) {
            if (typeof topic !== 'string' || !/^[\w.-]+\/[\w.-]+\/[\w.-]+$/.test(topic)) throw Error('The backup contains an invalid topic.');
            if (!result.recent.includes(topic)) result.recent.push(topic);
        }
        for (const [id, data] of Object.entries(value.labSkills)) {
            if (['constructor','prototype'].includes(id) || !/^[a-zA-Z][a-zA-Z0-9]{0,79}$/.test(id)) throw Error('The backup contains an invalid lab skill.');
            result.labSkills[id] = record(data);
        }
        return result;
    }
    let state = empty();
    try {
        const saved = localStorage.getItem(key);
        if (saved) state = validate(JSON.parse(saved));
    } catch { persistent = false; }
    function refresh() {
        if (!state.remember || !persistent) return;
        try {
            const value = localStorage.getItem(key);
            if (value) state = validate(JSON.parse(value));
        } catch { persistent = false; }
    }
    function write() {
        try { localStorage.setItem(key, JSON.stringify(state.remember ? state : {...empty(),remember:false})); persistent = true; }
        catch { persistent = false; }
        window.dispatchEvent(new CustomEvent('lite-progress-change'));
    }
    function identity(question) {
        return JSON.stringify([question._key || '', question.t || 'mcq', question.q, question.o || [], question.a ?? null,
            question.t === 'calc' ? question.parts.map(p => [p.label,p.unit,p.value,p.tolerance]) : []]);
    }
    function addRecord(collection, id, score, max) {
        const previous = collection[id];
        collection[id] = {score,max,best:Math.max(score, previous?.max === max ? previous.best : 0),
            attempts:Math.min(1000000,(previous?.attempts || 0)+1),date:Date.now()};
    }
    function record(question, score, max) {
        if (!question?._key || !Number.isInteger(score) || !Number.isInteger(max) || max < 1 || score < 0 || score > max) return;
        refresh();
        addRecord(state.questions, identity(question), score, max);
        write();
    }
    function visit(topic) {
        if (!/^[\w.-]+\/[\w.-]+\/[\w.-]+$/.test(topic)) return;
        refresh();
        state.recent = [topic,...state.recent.filter(t => t !== topic)].slice(0,8);
        write();
    }
    function bookmark(question) {
        refresh();
        const id = identity(question), index = state.bookmarks.indexOf(id);
        if (index === -1) state.bookmarks.push(id);
        else state.bookmarks.splice(index,1);
        write();
        return index === -1;
    }
    function questionTools(question) {
        const controls = document.createElement('div');
        controls.className = 'local-actions';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn ghost';
        function update() {
            const saved = state.bookmarks.includes(identity(question));
            button.textContent = saved ? '★ Bookmarked' : '☆ Bookmark';
            button.setAttribute('aria-pressed',String(saved));
        }
        button.addEventListener('click', () => { bookmark(question); update(); });
        update();
        controls.append(button);
        return controls;
    }
    function download() {
        refresh();
        const file = new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
        const url = URL.createObjectURL(file), link = document.createElement('a');
        link.href = url;
        link.download = 'TechDojo-Lite-progress.json';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url),1000);
    }
    async function restore(file) {
        if (!file || file.size > 5000000) throw Error('Choose a progress backup smaller than 5 MB.');
        const incoming = validate(JSON.parse(await file.text()));
        // Import replaces the device snapshot, allowing a backup to restore deletions as well.
        incoming.remember = state.remember;
        state = incoming;
        write();
    }
    function remember(value) {
        state.remember = value;
        if (!value) {
            try { localStorage.removeItem(key); } catch { persistent = false; }
        }
        write();
    }
    function reset() {
        const enabled = state.remember;
        state = empty();
        state.remember = enabled;
        write();
    }
    window.TDLite = {
        data:() => { refresh(); return JSON.parse(JSON.stringify(state)); }, identity, record, visit, bookmark, questionTools, download, restore, remember, reset,
        saved:question => state.bookmarks.includes(identity(question)),
        storageStatus:() => !state.remember ? 'Remembering is off. Progress lasts for this visit.' :
            persistent ? 'Saved in this browser on this device.' : 'Browser storage is unavailable. Progress lasts for this visit. You can export a backup.',
        labRecord(id,score,max) { refresh(); addRecord(state.labSkills,id,score,max); write(); }
    };
})();
