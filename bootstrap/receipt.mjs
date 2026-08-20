#!/usr/bin/env node
// receipt.mjs. Agrega recibos de loop a partir de .loop/state-*.md nas raizes dadas.
// A metrica que core/05 declara (custo por mudanca ACEITA) precisa desta serie; sem ela,
// toda auditoria e arqueologia manual. Saida DESCRITIVA: sem grupo de controle, sem
// alegacao causal.
//
// Uso:
//   node bootstrap/receipt.mjs <raiz> [<raiz> ...]
//
// Regra dura: PLACEHOLDER NAO E DADO. Linha com `<...>` (template intocado) e ignorada
// em custo e atribuicao; senao um state recem-criado fabrica os denominadores.

import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const roots = process.argv.slice(2);
if (!roots.length) {
  console.error('uso: node bootstrap/receipt.mjs <raiz-de-projetos> [...]');
  process.exit(2);
}

const PLACEHOLDER = /<[^<>\n]{0,80}>/;
// placeholder ABERTO no fim da linha (`<cada um com ...` continua na linha seguinte):
// o template do state quebra hints em 2 linhas, e a 2a linha sozinha parece dado real.
const OPENS_HINT = /<[a-zà-ú][^<>]*$/i;
const MAX_SPAN = 3;

// indices das linhas que NAO sao placeholder (nem continuacao de um)
function realLineIdx(lines) {
  const keep = [];
  let span = 0;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const continuing = span > 0;
    if (continuing) {
      span = l.includes('>') || span >= MAX_SPAN ? 0 : span + 1;
      continue; // linha dentro (ou que fecha) o hint multi-linha
    }
    if (OPENS_HINT.test(l)) { span = 1; continue; }
    if (PLACEHOLDER.test(l) || !l.trim()) continue;
    keep.push(i);
  }
  return keep;
}

// numero em pt-BR ou en-US: "120000", "120.000", "1,23", "1.234,56"
function num(raw) {
  if (!raw) return NaN;
  let s = String(raw).trim();
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, '');
  else if (/\.\d{3}$/.test(s)) s = s.replace(/\./g, '');
  const v = Number(s);
  return Number.isFinite(v) ? v : NaN;
}

// aplica sufixo k/M ("180k tokens" = 180000)
function scale(raw, suffix) {
  const v = num(raw);
  if (isNaN(v)) return NaN;
  const s = (suffix || '').toLowerCase();
  return s === 'k' ? v * 1e3 : s === 'm' ? v * 1e6 : v;
}

// indices das linhas da secao cujo titulo casa com re, ate o proximo "## "
function sectionIdx(lines, re) {
  const out = [];
  let inside = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) { inside = re.test(lines[i]); continue; }
    if (inside) out.push(i);
  }
  return out;
}

const stateFiles = [];
function findLoops(dir, depth) {
  if (depth > 3) return;
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (['node_modules', '.git', 'bin', 'obj'].includes(e.name)) continue;
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

const ATTRIBUTIONS = ['checker_unique', 'gate_redundant', 'human_seed_checker_confirmed', 'unknown'];
const rows = [];
const tally = {
  loops: 0, iterations: 0, checkerPass: 0, checkerReprove: 0,
  zeroDiff: 0, hardStopSuccess: 0, hardStopOther: 0,
  withCost: 0, tokensIn: 0, tokensOut: 0, tokensFlat: 0, money: 0, moneyCurrency: '',
  costLines: 0, attribution: Object.fromEntries(ATTRIBUTIONS.map((a) => [a, 0])),
  prs: new Set(),
};

for (const f of stateFiles) {
  const text = readFileSync(f, 'utf8');
  const slug = basename(f).replace(/^state-|\.md$/g, '');
  const iters = new Set(
    [...text.matchAll(/\b(?:iter(?:acao|ação|ation)?|it)\s*\.?\s*(\d+)/gi)].map((m) => m[1]),
  ).size;
  const pass = (text.match(/\b(PASS|APPROVE|SHIP)\b/g) || []).length;
  const reprove = (text.match(/\b(REPROV|REFUS|REJECT)/gi) || []).length;
  const zeroDiff = /zero diff|sem diff|nenhum c[oó]digo (escrito|alterado)/i.test(text);
  const hardStopSuccess = /HARD-?STOP.{0,40}(sucesso|atingido|success)/is.test(text);
  const prs = [...text.matchAll(/\bPR\s*#(\d+)/g)].map((m) => m[1]);

  const lines = text.split(/\r?\n/);
  const real = new Set(realLineIdx(lines));

  // custo: SO linhas reais da secao Custo (placeholder do template nao conta).
  // Duas formas aceitas: par in/out ("tokens in/out 120000/8000") e agregado
  // ("~180k tokens"). Exigir so o par derruba dado real de state escrito a mao.
  let tIn = 0, tOut = 0, tFlat = 0, cash = 0, costLines = 0, currency = '';
  for (const l of sectionIdx(lines, /custo/i).filter((i) => real.has(i)).map((i) => lines[i])) {
    const pair = l.match(/tokens?[^\d]{0,25}([\d.,]+)\s*([kKmM])?\s*\/\s*([\d.,]+)\s*([kKmM])?/i);
    const flat = pair ? null : l.match(/([\d.,]+)\s*([kKmM])?\s*tokens|tokens?[^\d]{0,25}([\d.,]+)\s*([kKmM])?/i);
    const cur = l.match(/(R\$|US\$|USD|\$|EUR|€)\s*([\d.,]+)/i);
    if (!pair && !flat && !cur) continue;
    costLines++;
    if (pair) {
      const a = scale(pair[1], pair[2]), b = scale(pair[3], pair[4]);
      if (!isNaN(a)) tIn += a;
      if (!isNaN(b)) tOut += b;
    } else if (flat) {
      const v = scale(flat[1] ?? flat[3], flat[2] ?? flat[4]);
      if (!isNaN(v)) tFlat += v;
    }
    if (cur) { const v = num(cur[2]); if (!isNaN(v)) { cash += v; currency = currency || cur[1]; } }
  }

  // atribuicao: SO linhas reais. Guarda extra: linha que lista 2+ atribuicoes separadas
  // por "|" e MENU (documentacao/hint), nao achado.
  const attr = Object.fromEntries(ATTRIBUTIONS.map((a) => [a, 0]));
  for (const i of real) {
    const l = lines[i];
    const distintas = ATTRIBUTIONS.filter((a) => new RegExp(`\\b${a}\\b`).test(l)).length;
    if (distintas > 1 && l.includes('|')) continue;
    for (const a of ATTRIBUTIONS) attr[a] += (l.match(new RegExp(`\\b${a}\\b`, 'g')) || []).length;
  }

  tally.loops++;
  tally.iterations += iters;
  tally.checkerPass += pass;
  tally.checkerReprove += reprove;
  if (zeroDiff) tally.zeroDiff++;
  hardStopSuccess ? tally.hardStopSuccess++ : tally.hardStopOther++;
  if (costLines) tally.withCost++;
  tally.tokensIn += tIn; tally.tokensOut += tOut; tally.tokensFlat += tFlat; tally.money += cash;
  tally.moneyCurrency = tally.moneyCurrency || currency;
  tally.costLines += costLines;
  for (const a of ATTRIBUTIONS) tally.attribution[a] += attr[a];
  prs.forEach((p) => tally.prs.add(p));

  rows.push({ slug, iters, pass, reprove, stop: hardStopSuccess ? 'sucesso' : '?', tIn, tOut, tFlat, prs: prs.join(',') });
}

if (!rows.length) {
  console.log('nenhum .loop/state-*.md encontrado nas raizes dadas.');
  process.exit(0);
}

const w = (s, n) => String(s ?? '').padEnd(n).slice(0, n);
const k = (v) => (v ? `${Math.round(v / 1000)}k` : '.');

console.log(`RECIBO. ${rows.length} loops encontrados\n`);
console.log(w('loop', 40) + w('iters', 7) + w('pass', 6) + w('reprov', 8) + w('stop', 9) + w('tok in/out', 13) + 'PRs');
for (const r of rows.sort((a, b) => a.slug.localeCompare(b.slug))) {
  console.log(w(r.slug, 40) + w(r.iters, 7) + w(r.pass, 6) + w(r.reprove, 8) + w(r.stop, 9) +
              w(r.tFlat ? `~${k(r.tFlat)}` : `${k(r.tIn)}/${k(r.tOut)}`, 13) + r.prs);
}

// mudanca ACEITA = loop fechado em hard-stop de sucesso (proxy auditavel, nao revisao humana)
const accepted = tally.hardStopSuccess;
const totalTok = tally.tokensIn + tally.tokensOut + tally.tokensFlat;
const cur = tally.moneyCurrency || 'R$';
const short = (a) => a.replace('human_seed_checker_confirmed', 'seeded').replace('checker_', '').replace('gate_', '');

console.log('\nDENOMINADORES (o que a contagem de sucesso esconde):');
console.log(`  loops totais: ${tally.loops} · hard-stop sucesso: ${accepted} · outros/abertos: ${tally.hardStopOther}`);
console.log(`  iterações: ${tally.iterations} · vereditos PASS: ${tally.checkerPass} · reprovações de checker: ${tally.checkerReprove}`);
console.log(`  loops zero-diff (root cause sem código): ${tally.zeroDiff} · PRs distintas citadas: ${tally.prs.size}`);
console.log(`  loops com série de custo REAL: ${tally.withCost}/${tally.loops}  <- meta: 100% (core/05 RECORD)`);
console.log(`  atribuição de achados: ` + ATTRIBUTIONS.map((a) => `${short(a)}:${tally.attribution[a]}`).join(' '));

console.log('\nCUSTO POR MUDANÇA ACEITA (a métrica de core/05):');
if (!tally.costLines) {
  console.log('  INDISPONÍVEL: nenhuma linha de custo real registrada. Preencha a seção Custo do state.');
} else {
  console.log(`  linhas de custo reais: ${tally.costLines} em ${tally.withCost} loop(s)`);
  console.log(`  tokens: in ${tally.tokensIn.toLocaleString('pt-BR')} · out ${tally.tokensOut.toLocaleString('pt-BR')}` +
              (tally.tokensFlat ? ` · agregado sem split ${tally.tokensFlat.toLocaleString('pt-BR')}` : '') +
              ` · soma ${totalTok.toLocaleString('pt-BR')}`);
  if (tally.money) console.log(`  custo declarado: ${cur} ${tally.money.toLocaleString('pt-BR')}`);
  if (accepted) {
    console.log(`  por mudança aceita: ${Math.round(totalTok / accepted).toLocaleString('pt-BR')} tokens` +
                (tally.money ? ` · ${cur} ${(tally.money / accepted).toFixed(2)}` : ''));
  } else {
    console.log('  por mudança aceita: INDISPONÍVEL (zero loops em hard-stop de sucesso)');
  }
  if (tally.withCost < tally.loops) {
    console.log(`  AVISO: ${tally.loops - tally.withCost} loop(s) sem custo registrado ficaram fora do numerador; o valor acima SUBESTIMA.`);
  }
}

console.log('\nLIMITES: parser heurístico sobre prosa; state fora de .loop/ não aparece;');
console.log('placeholder de template (`<...>`) é ignorado, então state intocado não infla nada;');
console.log('"aceita" = hard-stop de sucesso, proxy auditável, não revisão humana;');
console.log('números são DESCRITIVOS. Sem grupo de controle não há alegação causal.');
