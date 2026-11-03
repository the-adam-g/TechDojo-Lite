(function () {
  'use strict';
  var title = document.getElementById('essay-title');
  if (!title) return;
  var plan = document.getElementById('essay-plan'), answer = document.getElementById('essay-answer');
  var status = document.getElementById('essay-status');
  var account = 'lite';
  var key = 'techdojo:7402:essay:' + account + ':';
  var hints = {
    membranes: 'Possible links: 3.2.3 transport; 3.5.1 thylakoids; 3.5.2 mitochondria; 3.6.2.2 synapses; 3.6.4.3 collecting ducts.',
    gradients: 'Possible links: 3.3.2 gas exchange; 3.3.4.2 xylem and phloem; 3.5.1–3.5.2 chemiosmosis; 3.6.2.1 nerve impulses; 3.6.4.3 kidney.',
    proteins: 'Possible links: 3.1.4.2 enzymes; 3.2.4 antibodies; 3.3.4.1 haemoglobin; 3.6.3 actin and myosin; 3.8.2.2 transcription factors.',
    information: 'Possible links: 3.1.5.2 DNA replication; 3.4.2 protein synthesis; 3.6.2.2 synapses; 3.6.4.2 hormone signalling; 3.8.4.1 gene transfer.'
  };
  function load() {
    plan.value = ''; answer.value = '';
    try {
      var saved = JSON.parse(TDVisitStorage.getItem(key + title.value) || '{}');
      plan.value = typeof saved.plan === 'string' ? saved.plan : '';
      answer.value = typeof saved.answer === 'string' ? saved.answer : '';
      status.textContent = 'Draft is kept for this visit only. ' + words() + ' words in the essay.';
    } catch (e) { status.textContent = 'Draft memory is unavailable. Download your draft to keep a copy.'; }
    document.getElementById('essay-links').textContent = hints[title.value];
  }
  function words() { return (answer.value.trim().match(/\S+/g) || []).length; }
  function save() {
    try {
      TDVisitStorage.setItem(key + title.value, JSON.stringify({plan: plan.value, answer: answer.value}));
      status.textContent = 'Draft kept for this visit only. ' + words() + ' words in the essay.';
    } catch (e) { status.textContent = 'Could not keep draft in memory. Download your draft to keep a copy.'; }
  }
  title.addEventListener('change', load);
  plan.addEventListener('input', save); answer.addEventListener('input', save);
  document.getElementById('essay-download').addEventListener('click', function () {
    var text = 'TechDojo AQA Biology 7402 — essay practice\n\n' + title.options[title.selectedIndex].text + '\n\nPLAN\n' + plan.value + '\n\nESSAY\n' + answer.value;
    var url = URL.createObjectURL(new Blob([text], {type: 'text/plain;charset=utf-8'}));
    var link = document.createElement('a'); link.href = url; link.download = 'biology-7402-essay-' + title.value + '.txt';
    link.click(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });
  document.getElementById('essay-clear').addEventListener('click', function () {
    if (!window.confirm('Clear the plan and essay for this title for this visit?')) return;
    plan.value = ''; answer.value = ''; save();
  });
  load();
}());
