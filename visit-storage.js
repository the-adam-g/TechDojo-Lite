/* In-memory lab state. Reloading or leaving discards it. */
window.TDVisitStorage = (() => { const values = new Map(); return { getItem: key => values.has(key) ? values.get(key) : null, setItem: (key,value) => values.set(key,String(value)) }; })();
