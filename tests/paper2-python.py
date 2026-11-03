"""Validate lesson reference solutions and the exact worker harness using local Python."""
import json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
lessons=json.loads((root/'paper2-lessons.js').read_text().split('window.TDPaper2Lessons = ',1)[1].removesuffix(';\n'))
harness=re.search(r'const HARNESS = `([\s\S]*?)`;', (root/'python-worker.js').read_text())[1]
ns={};exec(harness,ns);count=0
for lesson in lessons:
 result=json.loads(ns['_td_check']({'source':lesson['solution']['python'],'prelude':lesson['prelude'],'tests':lesson['tests']}))
 assert all(r['passed'] for r in result),(lesson['id'],result)
 count+=len(result)
 # A no-op must not pass an entire exercise.
 wrong=json.loads(ns['_td_check']({'source':'pass','prelude':lesson['prelude'],'tests':lesson['tests']}))
 assert not all(r['passed'] for r in wrong),lesson['id']
# Accept a structurally different correct implementation.
a=lessons[0]
assert all(r['passed'] for r in json.loads(ns['_td_check']({'source':'def total(values):\n    return sum(values)','tests':a['tests']})))
# Exceptions and printing receive useful feedback, not accidental credit.
r=json.loads(ns['_td_check']({'source':'def total(values):\n    print(sum(values))','tests':a['tests']}))
assert not any(x['passed'] for x in r) and r[0]['output']
print(f'PASS: {count} reference cases in exact harness; invalid, alternative and print-only solutions checked.')
