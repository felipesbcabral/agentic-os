#!/usr/bin/env node
// validate-agentic-os.mjs — mechanical gate over the repo itself (core/04: prose does
// not hold; assertions do). Cross-platform (Windows/POSIX). Exit 0 = green.
//
// Checks:
//   1. Every `NN-*.md` reference inside core/, README.md and adapters/ resolves to a
//      real file in core/.
//   2. Relative .md links/refs in core docs (../bootstrap/..., ../adapters/...) resolve.
//   3. Placeholders `<caminho-do-repo...>` only appear in allowed template locations,
//      and each installer documents the substitution step.
//   4. Workflow reference scripts parse as plain JS (node --check) and export meta.
//   5. Every lesson listed in lessons/README.md exists, and every lesson file is listed.
//
// Usage: node bootstrap/validate-agentic-os.mjs   (from repo root or anywhere)

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const ok = (msg) => console.log(`  ok  ${msg}`);
const fail = (msg) => { errors.push(msg); console.log(`FAIL  ${msg}`); };

const read = (p) => readFileSync(p, 'utf8');
const mdFiles = (dir) => {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...mdFiles(p));
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
};

// ---- 1+2. core doc references resolve -------------------------------------
const coreDir = join(ROOT, 'core');
const coreDocs = readdirSync(coreDir).filter((f) => f.endsWith('.md'));
const scanTargets = [
  ...coreDocs.map((f) => join(coreDir, f)),
  join(ROOT, 'README.md'),
  ...mdFiles(join(ROOT, 'adapters')),
  ...mdFiles(join(ROOT, 'bootstrap')),
];
let refCount = 0;
for (const file of scanTargets) {
  const text = read(file);
  // `NN-slug.md` style refs → must exist in core/
  for (const m of text.matchAll(/`(\d{2}-[a-z0-9-]+\.md)`/g)) {
    refCount++;
    if (!existsSync(join(coreDir, m[1]))) fail(`${file}: referência quebrada -> core/${m[1]}`);
  }
  // relative ../path/file.md refs inside backticks → must exist relative to the file
  for (const m of text.matchAll(/`((?:\.\.\/)+[a-zA-Z0-9_\-./]+?\.(?:md|mjs|json))`/g)) {
    refCount++;
    if (!existsSync(resolve(dirname(file), m[1]))) fail(`${file}: referência quebrada -> ${m[1]}`);
  }
  // relative dir refs like `../adapters/claude-code/workflows/` → dir must exist
  for (const m of text.matchAll(/`((?:\.\.\/)+[a-zA-Z0-9_\-./]+?\/)`/g)) {
    refCount++;
    if (!existsSync(resolve(dirname(file), m[1]))) fail(`${file}: diretório referenciado não existe -> ${m[1]}`);
  }
}
if (!errors.length) ok(`${refCount} referencias de arquivo resolvem`);

// ---- 3. placeholders only where documented --------------------------------
const PLACEHOLDER = /<caminho-do-repo[^>]*>/;
const allowedPlaceholder = [
  join(ROOT, 'adapters', 'codex', 'prompts'),
  join(ROOT, 'adapters', 'codex', 'INSTALL.md'),
  join(ROOT, 'adapters', 'claude-code', 'INSTALL.md'),
  join(ROOT, 'adapters', 'claude-code', 'commands'),
  join(ROOT, 'bootstrap', 'templates'),
];
let phCount = 0;
for (const file of [...mdFiles(join(ROOT, 'adapters')), ...mdFiles(join(ROOT, 'bootstrap')), ...mdFiles(coreDir)]) {
  if (!PLACEHOLDER.test(read(file))) continue;
  phCount++;
  if (!allowedPlaceholder.some((a) => resolve(file).startsWith(resolve(a)))) {
    fail(`${file}: placeholder <caminho-do-repo...> fora de local permitido`);
  }
}
const codexInstall = read(join(ROOT, 'adapters', 'codex', 'INSTALL.md'));
if (!/sed ..s\|<caminho-do-repo-agentic-os>|/.test(codexInstall) && !codexInstall.includes('-replace'))
  fail('adapters/codex/INSTALL.md: passo de substituição do placeholder sumiu');
else ok(`${phCount} arquivos com placeholder, todos em local permitido + substituicao documentada`);

// ---- 4. workflow scripts parse and export meta ----------------------------
const wfDir = join(ROOT, 'adapters', 'claude-code', 'workflows-experimental');
if (!existsSync(wfDir)) fail('adapters/claude-code/workflows-experimental/ não existe');
else {
  const scripts = readdirSync(wfDir).filter((f) => f.endsWith('.js'));
  for (const s of scripts) {
    const p = join(wfDir, s);
    try {
      execFileSync(process.execPath, ['--check', p], { stdio: 'pipe' });
    } catch (e) {
      fail(`${s}: não parseia como JS puro — ${String(e.stderr).split('\n')[0]}`);
      continue;
    }
    if (!/export const meta\s*=/.test(read(p))) fail(`${s}: sem 'export const meta'`);
  }
  if (!errors.some((e) => e.includes('.js'))) ok(`${scripts.length} workflow scripts parseiam (JS puro) e exportam meta`);
}

// ---- 5. lessons index in sync ----------------------------------------------
const lessonsDir = join(ROOT, 'lessons');
const lessonFiles = readdirSync(lessonsDir).filter((f) => f.endsWith('.md') && f !== 'README.md');
const lessonsIndex = read(join(lessonsDir, 'README.md'));
for (const f of lessonFiles) if (!lessonsIndex.includes(`\`${f}\``)) fail(`lessons/README.md: não lista ${f}`);
for (const m of lessonsIndex.matchAll(/- `([a-z0-9-]+\.md)`/g))
  if (!existsSync(join(lessonsDir, m[1]))) fail(`lessons/README.md lista ${m[1]}, que não existe`);
if (!errors.some((e) => e.includes('lessons'))) ok(`${lessonFiles.length} lessons em sync com o indice`);

// ---- verdict ----------------------------------------------------------------
console.log('');
if (errors.length) {
  console.log(`agentic-os validate: ${errors.length} FALHA(S)`);
  process.exit(1);
}
console.log('agentic-os validate: OK');
