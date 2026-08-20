#!/usr/bin/env node
// receipt.mjs — aggregate loop receipts from .loop/state-*.md across project roots.
// The metric core/05 declares (cost per ACCEPTED change) needs this series; without it
// every audit is manual archaeology. Descriptive output only — no causal claims.
//
// Usage:
//   node bootstrap/receipt.mjs <root> [<root> ...]
//   node bootstrap/receipt.mjs C:/Users/me/Dev            (scans 3 levels deep)
//
// Reads each state file and extracts: goal, iterations, checker verdicts + attribution,
// hard-stop status, cost lines, PR references. Prints a per-loop table + denominators.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const roots = process.argv.slice(2);
if (!roots.length) {
  console.error('uso: node bootstrap/receipt.mjs <raiz-de-projetos> [...]');
  process.exit(2);
}

const stateFiles = [];
function findLoops(dir, depth) {
  if (depth > 3) return;
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'bin' || e.name === 'obj') continue;
    const p = join(dir, e.name);
    if (e.name === '.loop') {
      for (const f of readdirSync(p)) {
        if (/^state-.+\.md$/i.test(f) || f === 'STATE.md') stateFiles.push(join(p, f));
      }
    } else {
      findLoops(p, depth + 1);
    }
  }
}
for (const r of roots) findLoops(r, 0);

const rows = [];
const tally = {
  loops: 0, iterations: 0, checkerPass: 0, checkerReprove: 0,
  zeroDiff: 0, hardStopSuccess: 0, hardStopOther: 0, withCost: 0,
  attribution: { checker_unique: 0, gate_redundant: 0, human_seed_checker_confirmed: 0, unknown: 0 },
  prs: new Set(),
};

for (const f of stateFiles) {
  const text = readFileSync(f, 'utf8');
  const slug = basename(f).replace(/^state-|\.md$/g, '');
  const goal = (text.match(/## Goal[^\n]*\n+(.+)/i) || [])[1]?.slice(0, 90) ?? '';
  const iters = new Set(
    [...text.matchAll(/\b(?:iter(?:acao|ação|ation)?|it)\s*\.?\s*(\d+)/gi)].map((m) => m[1]),
  ).size;
  const pass = (text.match(/\b(PASS|APPROVE|SHIP)\b/g) || []).length;
  const reprove = (text.match(/\b(REPROV|REFUS|REJECT)/gi) || []).length;
  const zeroDiff = /zero diff|sem diff|nenhum c[oó]digo (escrito|alterado)/i.test(text);
  const hardStopSuccess = /HARD-?STOP.{0,40}(sucesso|atingido|success)/is.test(text);
  const cost = /tokens? (in\/out|de entrada)|modelo .*tokens/i.test(text);
  const prs = [...text.matchAll(/\bPR\s*#(\d+)/g)].map((m) => m[1]);
  for (const [k] of Object.entries(tally.attribution)) {
    tally.attribution[k] += (text.match(new RegExp(`\\b${k}\\b`, 'g')) || []).length;
  }
  tally.loops++;
  tally.iterations += iters;
  tally.checkerPass += pass;
  tally.checkerReprove += reprove;
  if (zeroDiff) tally.zeroDiff++;
  hardStopSuccess ? tally.hardStopSuccess++ : tally.hardStopOther++;
  if (cost) tally.withCost++;
  prs.forEach((p) => tally.prs.add(p));
  rows.push({ slug, iters, pass, reprove, stop: hardStopSuccess ? 'sucesso' : '?', prs: prs.join(','), file: f, goal });
}

if (!rows.length) {
  console.log('nenhum .loop/state-*.md encontrado nas raizes dadas.');
  process.exit(0);
}

console.log(`RECIBO — ${rows.length} loops encontrados\n`);
const w = (s, n) => String(s ?? '').padEnd(n).slice(0, n);
console.log(w('loop', 42) + w('iters', 7) + w('pass', 6) + w('reprov', 8) + w('stop', 9) + 'PRs');
for (const r of rows.sort((a, b) => a.slug.localeCompare(b.slug))) {
  console.log(w(r.slug, 42) + w(r.iters, 7) + w(r.pass, 6) + w(r.reprove, 8) + w(r.stop, 9) + r.prs);
}
console.log('\nDENOMINADORES (o que a contagem de sucesso esconde):');
console.log(`  loops totais: ${tally.loops} · hard-stop sucesso: ${tally.hardStopSuccess} · outros/abertos: ${tally.hardStopOther}`);
console.log(`  iterações: ${tally.iterations} · vereditos PASS: ${tally.checkerPass} · reprovações de checker: ${tally.checkerReprove}`);
console.log(`  loops zero-diff (root cause sem código): ${tally.zeroDiff} · PRs distintas citadas: ${tally.prs.size}`);
console.log(`  loops com série de custo registrada: ${tally.withCost}/${tally.loops}  <- meta: 100% (core/05 RECORD)`);
const at = tally.attribution;
console.log(`  atribuição de achados — unique:${at.checker_unique} redundant:${at.gate_redundant} seeded:${at.human_seed_checker_confirmed} unknown:${at.unknown}`);
console.log('\nLIMITES: parser heurístico sobre prosa; state fora de .loop/ não aparece;');
console.log('números são DESCRITIVOS — sem grupo de controle não há alegação causal.');
