'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'dist', 'firefox');

const files = [
  '_locales',
  'icons',
  'popup',
  'background.js',
  'content.css',
  'content.js',
  'extension-api.js'
];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }
  fs.copyFileSync(src, dest);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of files) {
  copyRecursive(path.join(root, file), path.join(outDir, file));
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
manifest.background = {
  scripts: ['extension-api.js', 'background.js']
};
manifest.browser_specific_settings = {
  gecko: {
    id: 'side-clock@165cm.github.io',
    strict_min_version: '109.0'
  }
};

fs.writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Firefox package written to ${path.relative(root, outDir)}`);
