# TechDojo Lite

A static edition of the supplied TechDojo project for GitHub Pages.
No PHP, SQL, database, build step, npm install or server API is needed.

## Included

- All 628 supplied questions: IT Data Analytics (61), Computer Science (387), Engineering (180).
- Subject, unit and topic browsing, with the original content-coverage notices.
- Quick Fire, Short Answers, Extended Response, Mixed Paper and Full Topic modes where the bank has suitable questions.
- Training across a course or a selection of topics.
- Written keyword marking, editable mark-point ticks and model answers.
- 23 generated binary/maths exercise types with browser-calculated answers.
- Practice paper builder: select topics, choose question counts and an advisory time limit.
- Blank printable papers and separate mark schemes.
- Print / Save as PDF for papers and completed-session answers.
- A Full / Lite comparison at `choose.html`, linked to the requested domains.

## Deliberately omitted

Accounts, authentication, Microsoft sign-in, XP, belts, companions, profile customisation,
saved activity, dashboards, saved weak areas and cross-device syncing.
No cookies, localStorage or sessionStorage are used. Questions, answers, marks and generated
papers exist in memory during the current page visit. Reloading or leaving discards them.
The quiz completion summary describes only the current attempt.

The app doesn't automatically redirect when the Full server is unavailable; students can
choose Lite using its separate address or the comparison page.

## Publish on GitHub Pages

1. Create a public GitHub repository for Lite.
2. Extract this archive. Upload the CONTENTS of the `techdojo-lite` folder to the repository
   root so `index.html`, `data`, `style.css`, `lite.css` and the JavaScript files sit together.
   Include `.nojekyll` and `CNAME`.
3. In the repository, open Settings → Pages. Choose “Deploy from a branch”, select your
   `main` branch and `/(root)`, then Save.
4. In Pages settings, set Custom domain to `lite.findmycode.org` and Save. The included
   `CNAME` file alone does not configure the domain in repository settings.
5. At your DNS provider, add a CNAME record for `lite` pointing to YOUR GitHub Pages default
   hostname, normally `YOUR-USERNAME.github.io`. Do not point it to the Full server and do
   not include a protocol or repository path in the DNS target.
6. When GitHub's DNS check and certificate provisioning finish, enable Enforce HTTPS.

GitHub's official instructions:
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

The site uses relative paths and query parameters rather than server rewrite rules, so
it can also run beneath a GitHub project path. To use only the default github.io URL,
remove the included `CNAME` and omit the custom-domain steps. The comparison's external
Lite link will still point at `lite.findmycode.org` until you edit it.

## Preview locally

Serve this folder with any static web server. For example, if Python is installed:

```sh
cd techdojo-lite
python3 -m http.server 8000
```

Open http://localhost:8000. Opening the HTML directly with `file://` is unsuitable because
the question bank is loaded with `fetch`.

## Landing page for the Full platform

The separately supplied `index.php` is a replacement for the Full platform's original
`index.php`. It keeps the existing `layout.php`, live question bank and subject-card loop,
and adds the comparison cards with their styles. It belongs on the PHP host, outside this
static package. Back up your original index.php before replacing it.

The separately supplied `landing-page-card.html` contains just the styles and cards if
you prefer to insert them after the hero in your existing landing page.

Full: https://techdojo.findmycode.org/
Lite: https://lite.findmycode.org/

## Content and maintenance

All supplied course data lives in `data/bank.json`, including the IT questions previously
embedded in `data.php`. Edit that one JSON file to update Lite's questions. Its subject,
unit, topic and question fields follow the source project's format. No learner records or
configuration files from the PHP application were copied into this package.

The supplied material remains incomplete where its notices say so: IT F201 has Topic Areas
1 and 2; CS currently covers Component 01; Engineering covers F131. An unavailable question
style is disabled rather than filled with invented questions. Generated maths exercises
remain separate from the practice paper builder.

Written keyword marking is indicative and can miss valid wording or reward keywords
without a complete explanation. Use the mark scheme and adjust ticks with judgement.
These are independent revision questions, not official OCR assessments.

`TEST-RESULTS.txt` describes the checks performed and their limits. Visual browser testing,
real print-dialog testing and publishing/DNS configuration remain to be checked after deployment.
