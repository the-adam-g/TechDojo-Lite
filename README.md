# TechDojo Lite — course and lab update

A static, account-free edition of TechDojo for GitHub Pages or another static host. No PHP, database, build command or production npm installation is required.

## Course parity with the supplied full version

| Course | Questions | Coverage |
| --- | ---: | --- |
| OCR IT Data Analytics | 61 | F201 topic areas 1–2; retains the existing coverage notice |
| OCR A-level Computer Science H446 | 519 | Component 01 plus all supplied Component 02 theory |
| OCR Engineering | 180 | F131 materials science and technology |
| AQA A-level Biology 7402 | 261 | All 53 content subsections, 12 required practicals, maths/data skills |
| **Total** | **1,021** | **100 topic routes** |

`data/bank.json` matches the latest full-version bank provided in this conversation, including its coverage notices, answer keys, model answers and Biology specification metadata. Missing content in the full version is not presented as complete here. Biology follows AQA version 1.6 (July 2026); see `BIOLOGY-COVERAGE.md` for source mapping and marking limits.

## Included tools

- Subject, unit and topic browsing.
- Quick Fire, Short Answers, Extended Response, Mixed Paper and Full Topic modes where suitable questions exist.
- Course-wide and selected-topic training.
- Written keyword feedback, editable point ticks and model answers.
- 23 generated binary/maths exercise types.
- Custom practice papers with exact question counts, advisory timing, blank printable questions and separate answer sheets.
- Completed-session printing / Save as PDF.
- SQL playground with fictional insurance data and 15 guided questions.
- Paper 2 programming lab: 22 Python/pseudocode challenges, method checklists and generated algorithm traces.
- Biology guide with specification PDF link, paper-focused topic filters and four original essay-planning prompts.
- Updated Full/Lite comparison that includes the courses and labs.

The visual style and supplied `lite.findmycode.org` custom-domain setting are retained. Full-platform links consistently use `https://full.findmycode.org/`, as in the supplied HTML.

## Lite stays account-free

There are no accounts, authentication, XP, belts, companions, saved weak areas, dashboards or cross-device syncing. Quizzes and papers exist only during the current page visit. Lab work, essay plans, review ticks and SQL changes are held in JavaScript memory, not cookies, localStorage or sessionStorage. Leaving or reloading discards them. Download a programming answer or essay draft before leaving if you want a copy.

Python executes on the learner's device in a disposable Worker. The pinned Pyodide 0.27.7 runtime downloads from jsDelivr only when Run is pressed, so Python execution requires CDN access and a browser with WebAssembly/Worker support. Pseudocode review, traces, SQL and the rest of the site do not need that runtime. The Blob worker inherits the programming page's restrictive content security policy; allowed network requests are limited to the pinned runtime directory. No PHP worker endpoint is needed.

Written marks are approximate revision guidance. They are not official OCR or AQA grades. AQA essays use a separate unscored planner; laboratory practical activities and endorsement still need to be completed through the school/college. Custom papers do not reproduce an official full-paper structure or assessment weighting.

## Install this update

1. Back up the current Lite repository or static site folder.
2. Extract this ZIP and upload the **contents** of `TechDojo-Lite-main` into the existing site root, keeping the paths together. Include the `data` folder and all new lab scripts/styles. The `tests` folder and Markdown documentation may be omitted from hosting.
3. Keep your existing GitHub Pages/custom-domain configuration. The supplied `CNAME` remains unchanged. If this is a project-path deployment without a custom domain, use your existing domain setup instead.
4. Load `index.html` through the host and check that four subject cards appear. Open Biology, the programming lab and the SQL lab. If an old page is cached, hard-refresh it.

This package updates the supplied source files. It does not push to GitHub, change DNS or deploy the live site.

For a local preview, serve this folder with a static server, for example `python3 -m http.server 8000`, and open `http://localhost:8000`. Opening via `file://` will not load the fetched bank reliably.

## Developer checks

`TEST-RESULTS.txt` records completed checks and their limits. Content, SQL and native-Python harness checks run with Node/Python only:

```sh
node tests/content.cjs
node tests/sql.cjs
node tests/paper2.cjs
python3 tests/paper2-python.py
```

Optional DOM interaction checks use jsdom as a developer-only dependency:

```sh
npm install --prefix tests
npm test --prefix tests
```

The developer dependency is not needed on the host or by learners.
