#!/usr/bin/env node
/**
 * Renderiza todos los .mmd de docs/entrega/assets a PNG vía @mermaid-js/mermaid-cli.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'docs', 'entrega', 'assets');
const mmdc = path.join(
  __dirname,
  '..',
  'node_modules',
  '@mermaid-js',
  'mermaid-cli',
  'src',
  'cli.js',
);

const FILES = [
  'der-diagram.mmd',
  'uml-casos-uso.mmd',
  'uml-seq-login.mmd',
  'uml-seq-ipc.mmd',
  'uml-seq-usd.mmd',
  'uml-seq-venta.mmd',
  'uml-seq-cron.mmd',
  'uml-clases.mmd',
  'uml-despliegue.mmd',
  'uml-arquitectura-capas.mmd',
  'componentes.mmd',
  'porter.mmd',
  'foda.mmd',
  'bmc.mmd',
  'gantt.mmd',
];

const puppeteerConfig = path.join(ASSETS, 'puppeteer-mmdc.json');
if (!fs.existsSync(puppeteerConfig)) {
  fs.writeFileSync(
    puppeteerConfig,
    JSON.stringify({ args: ['--no-sandbox', '--disable-setuid-sandbox'] }, null, 2),
  );
}

for (const name of FILES) {
  const input = path.join(ASSETS, name);
  const output = path.join(ASSETS, name.replace(/\.mmd$/, '.png'));
  if (!fs.existsSync(input)) {
    console.warn('SKIP missing', name);
    continue;
  }
  console.log('Rendering', name, '→', path.basename(output));
  execFileSync(
    process.execPath,
    [mmdc, '-i', input, '-o', output, '-b', 'white', '-s', '2', '-p', puppeteerConfig],
    { stdio: 'inherit' },
  );
}

console.log('Done.');
