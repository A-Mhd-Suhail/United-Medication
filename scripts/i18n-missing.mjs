// Lists UI strings in src/**/*.tsx that have no entry in the i18n dictionaries.
// Usage: npm run i18n:missing   — add the printed phrases to src/lib/i18n.extra.ts.
import fs from 'node:fs';
import path from 'node:path';

const walk = (d) => fs.readdirSync(d).flatMap((f) => {
  const p = path.join(d, f);
  return fs.statSync(p).isDirectory() ? walk(p) : p.endsWith('.tsx') ? [p] : [];
});
const dict = fs.readFileSync('src/lib/i18n.ts', 'utf8') + fs.readFileSync('src/lib/i18n.extra.ts', 'utf8');
const known = (s) => dict.includes(`'${s}'`) || dict.includes(`"${s}"`) || dict.includes(`:'${s}'`);
const found = new Map();
for (const f of walk('src')) {
  const src = fs.readFileSync(f, 'utf8');
  const add = (t) => { t = t.replace(/\s+/g, ' ').trim(); if (t.length > 1 && /[A-Za-z]{2,}/.test(t) && !known(t)) found.set(t, f); };
  for (const m of src.matchAll(/>([^<>{}=;]*[A-Za-z]{2,}[^<>{}=;]*)</g)) add(m[1]);
  for (const m of src.matchAll(/(?:placeholder|title|aria-label|alt)="([^"]+)"/g)) add(m[1]);
}
console.log(`${found.size} untranslated phrases`);
for (const [t, f] of found) console.log(`${f}\t${t}`);
