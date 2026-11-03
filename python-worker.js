/* Python executes on the student's device. Lite uses a Blob worker inheriting the programming page CSP. */
'use strict';
let runtime;
const INDEX = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
const HARNESS = `
import json as _td_json
import contextlib as _td_contextlib
class _TDOutput:
    def __init__(self):
        self.value = ''
    def write(self, text):
        if len(self.value) < 4000:
            self.value += str(text)[:4000-len(self.value)]
        return len(text)
    def flush(self):
        pass

def _td_check(payload):
    results = []
    for case in payload['tests']:
        ns = {'__name__': '__main__'}
        output = _TDOutput()
        row = {'label': case['label'], 'expected': repr(case['expected'])}
        try:
            with _td_contextlib.redirect_stdout(output), _td_contextlib.redirect_stderr(output):
                exec(payload.get('prelude', ''), ns)
                exec(payload['source'], ns)
                exec(case.get('setup', ''), ns)
                actual = eval(case['expression'], ns)
                # Keep Boolean answers distinct from integers; lists compare structurally.
                def equal(a, b):
                    if isinstance(b, bool):
                        return type(a) is bool and a == b
                    if isinstance(b, list):
                        return isinstance(a, list) and len(a) == len(b) and all(equal(x,y) for x,y in zip(a,b))
                    if isinstance(b, (int, float)):
                        return type(a) in (int, float) and a == b
                    return type(a) is type(b) and a == b
                row['passed'] = equal(actual, case['expected'])
                row['actual'] = repr(actual)[:2000]
        except BaseException as error:
            row['passed'] = False
            row['error'] = type(error).__name__ + ': ' + str(error)[:2000]
        row['output'] = output.value
        results.append(row)
    return _td_json.dumps(results)
`;
self.onmessage = async ({data}) => {
  try {
    if (data.type === 'init') {
      importScripts(INDEX + 'pyodide.js');
      runtime = await loadPyodide({indexURL: INDEX, stdin: () => { throw new Error('Use function parameters, not input(), for these tasks.'); }});
      runtime.runPython(HARNESS);
      self.postMessage({type: 'ready'});
    } else if (data.type === 'run' && runtime) {
      // JSON is passed as data, never interpolated into executable source.
      runtime.globals.set('_td_payload_json', JSON.stringify(data.payload));
      const results = JSON.parse(runtime.runPython('_td_check(_td_json.loads(_td_payload_json))'));
      self.postMessage({type: 'results', results});
    }
  } catch (error) {
    self.postMessage({type: 'error', message: String(error.message || error).slice(0,3000)});
  }
};
