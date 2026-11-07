/* Device progress UI. Question content is always resolved from the current bank. */
function liteTopic(bank, key) {
    const [s,u,t] = key.split('/');
    const subject = bank[s], unit = subject?.units[u], topic = unit?.topics[t];
    return topic ? {s,u,t,subject,unit,topic} : null;
}
function liteQuestions(bank) {
    return Object.entries(bank).flatMap(([s,subject]) => flatten(subject,s));
}
function liteQuestionLink(question) {
    const [s,u,t] = question._key.split('/');
    return url({page:'quiz',s,u,t,question:TDLite.identity(question)});
}
function renderDojo(bank, tab = 'overview') {
    const state = TDLite.data(), all = liteQuestions(bank);
    const current = new Map(all.map(q => [TDLite.identity(q),q]));
    const records = Object.entries(state.questions).filter(([id]) => current.has(id));
    const bookmarks = state.bookmarks.filter(id => current.has(id));
    const mistakes = records.filter(([,r]) => r.score/r.max < .7).map(([id]) => id);
    app.innerHTML = title('Your device, your dojo','My Lite dojo','Pick up a topic, revisit mistakes or collect questions for later.') + `
      <p id="local-storage-status" class="muted" role="status">${esc(TDLite.storageStatus())}</p>
      <div class="stats"><div class="stat"><span>Questions practised</span><strong>${records.length}</strong></div><div class="stat"><span>To revisit</span><strong>${mistakes.length}</strong></div><div class="stat"><span>Bookmarks</span><strong>${bookmarks.length}</strong></div></div>
      <nav class="local-actions" aria-label="My dojo sections">${[['overview','Recent topics'],['mistakes','Mistakes'],['bookmarks','Bookmarks']].map(([id,label])=>`<a class="btn ${tab===id?'':'ghost'}" ${tab===id?'aria-current="page"':''} href="${esc(url({page:'dojo',tab:id}))}">${label}</a>`).join('')}</nav>
      <section id="local-content"></section>
      <details class="card"><summary>Device storage and backups</summary>
        <p>Progress and bookmarks are stored in this browser. Export a backup to move them to another device. Importing replaces the current progress and bookmarks. Written-answer marks reflect your self-assessment.</p>
        <label><input id="local-remember" type="checkbox" ${state.remember?'checked':''}> Remember my progress on this device</label>
        <div class="local-actions"><button class="btn ghost" id="local-export">Export backup</button><button class="btn ghost" id="local-import-button">Import backup</button><input id="local-import" type="file" accept=".json,application/json" hidden><button class="btn ghost" id="local-reset">Clear local progress</button></div>
        <p id="local-message" role="status"></p>
      </details>`;
    const content = document.getElementById('local-content');
    if (tab === 'mistakes' || tab === 'bookmarks') {
        const ids = tab === 'mistakes' ? mistakes : bookmarks;
        const heading = document.createElement('h2');
        heading.textContent = tab === 'mistakes' ? 'Questions to revisit' : 'Your bookmarks';
        content.append(heading);
        if (!ids.length) {
            const note = document.createElement('p');
            note.textContent = tab === 'mistakes' ? 'Your latest answers below 70% will appear here.' : 'Use the Bookmark button during practice to save a question here.';
            content.append(note);
        } else {
            const start = document.createElement('button');
            start.className = 'btn';
            start.textContent = tab === 'mistakes' ? 'Practise mistakes →' : 'Practise bookmarks →';
            start.addEventListener('click', () => renderQuiz(ids.map(id=>current.get(id)),heading.textContent,url({page:'dojo',tab}),{course:true}));
            const list = document.createElement('ul');
            list.className = 'local-list';
            for (const id of ids) {
                const q = current.get(id), row = document.createElement('li'), link = document.createElement('a');
                link.href = liteQuestionLink(q);
                link.textContent = q.q;
                const source = document.createElement('p');
                source.className = 'muted';
                const record = state.questions[id];
                source.textContent = q._source + (record ? ' · Latest ' + record.score + '/' + record.max : '');
                row.append(link,source);
                if (tab === 'bookmarks') {
                    const remove = document.createElement('button');
                    remove.className = 'btn ghost';
                    remove.textContent = 'Remove bookmark';
                    remove.addEventListener('click',()=>{ TDLite.bookmark(q); renderDojo(bank,tab); });
                    row.append(remove);
                }
                list.append(row);
            }
            content.append(start,list);
        }
    } else {
        const recent = state.recent.map(key=>liteTopic(bank,key)).filter(Boolean);
        content.innerHTML = '<h2>Pick up a topic</h2>' + (recent.length ? '<ul class="local-list">'+recent.map(({s,u,t,unit,topic})=>`<li><a href="${esc(url({page:'quiz',s,u,t}))}">${esc(topic.title)}</a><p class="muted">${esc(unit.code)}</p></li>`).join('')+'</ul>' : '<p>Your recently visited topics will appear here. Choose a subject to get started.</p>');
        const lab = Object.entries(state.labSkills);
        if (lab.length) content.innerHTML += `<h2>Engineering lab</h2><p>${lab.reduce((n,[,r])=>n+r.attempts,0)} checked · ${lab.filter(([,r])=>r.score<r.max).length} skills to revisit</p><a class="btn ghost" href="engineering-maths.html?skill=weak">Revisit lab mistakes →</a>`;
    }
    document.getElementById('local-remember').addEventListener('change', event => {
        TDLite.remember(event.target.checked);
        document.getElementById('local-storage-status').textContent = TDLite.storageStatus();
    });
    document.getElementById('local-export').addEventListener('click', TDLite.download);
    document.getElementById('local-import-button').addEventListener('click',()=>document.getElementById('local-import').click());
    document.getElementById('local-import').addEventListener('change', async event => {
        if (!event.target.files[0]) return;
        if (!confirm('Replace this browser’s progress and bookmarks with the backup?')) { event.target.value=''; return; }
        try { await TDLite.restore(event.target.files[0]); renderDojo(bank,tab); document.getElementById('local-message').textContent='Backup imported.'; }
        catch(error) { document.getElementById('local-message').textContent=error.message; }
    });
    document.getElementById('local-reset').addEventListener('click', () => {
        if (confirm('Clear saved progress and bookmarks from this browser?')) { TDLite.reset(); renderDojo(bank,tab); }
    });
}
function addLiteSearch(bank) {
    const section = document.createElement('section');
    section.className = 'local-search';
    section.innerHTML = '<label for="lite-search">Find a topic</label><input id="lite-search" type="search" placeholder="Search all courses, topics or references…"><ul class="local-list" id="lite-search-results" hidden></ul>';
    app.querySelector('.hero').after(section);
    const topics = Object.entries(bank).flatMap(([s,subject])=>Object.entries(subject.units).flatMap(([u,unit])=>Object.entries(unit.topics).map(([t,topic])=>({s,u,t,subject,unit,topic}))));
    section.querySelector('input').addEventListener('input', event => {
        const query = event.target.value.trim().toLowerCase(), list = section.querySelector('ul');
        list.replaceChildren();
        list.hidden = !query;
        if (!query) return;
        const matches = topics.filter(({subject,unit,topic,t})=>(subject.subtitle+' '+unit.code+' '+topic.title+' '+topic.blurb+' '+t).toLowerCase().includes(query)).slice(0,20);
        for (const {s,u,t,subject,unit,topic} of matches) {
            const row = document.createElement('li'), link = document.createElement('a');
            link.href = url({page:'quiz',s,u,t});
            link.textContent = subject.subtitle + ' · ' + unit.code + ' · ' + topic.title;
            row.append(link);
            list.append(row);
        }
        if (!matches.length) list.textContent = 'No matching topics. Try another term.';
    });
}

function liteTopicProgress(topic,key) {
    const records = TDLite.data().questions;
    let attempted = 0, correct = 0;
    for (const q of topic.questions) {
        const record = records[TDLite.identity({...q,_key:key})];
        if (record) { attempted++; if (record.score/record.max>=.7) correct++; }
    }
    return attempted ? `<p class="local-progress">${attempted} practised · ${correct} at 70% or above</p>` : '';
}
