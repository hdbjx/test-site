import fs from 'node:fs';

const css = fs.readFileSync('src/app/globals.css', 'utf8');
const header = fs.readFileSync('src/components/Header.tsx', 'utf8');

const checks = [
  ['header component emits data-tone', /data-tone=\{headerTone\}/.test(header)],
  ['base header tone provider exists', /\.site-shared-header\s*\{[^}]*--ed-header-logo-fg:/s.test(css)],
  ['ink provider exists', /\.site-shared-header\[data-tone="ink"\]\s*\{[^}]*--ed-header-control-bg:/s.test(css)],
  ['light provider exists', /\.site-shared-header\[data-tone="light"\]\s*\{[^}]*--ed-header-control-bg:/s.test(css)],
  ['brand provider exists', /\.site-shared-header\[data-tone="brand"\]\s*\{[^}]*--ed-header-logo-fg:var\(--color-logo-red\)/s.test(css)],
  ['menu-open provider exists', /\.site-shared-header\[data-menu-open="true"\]\s*\{[^}]*--ed-header-logo-fg:/s.test(css)],
  ['logo consumes header token', /\.site-shared-logo-mark\s*\{[^}]*background:var\(--ed-header-logo-fg\)/s.test(css)],
  ['menu consumes header tokens', /site-shared-header\[data-tone\][^}]*site-shared-menu-button\s*\{[^}]*background:var\(--ed-header-control-bg\)/s.test(css)],
  ['vehicle pill consumes header tokens', /site-shared-header\[data-tone\][^}]*site-context-pill[^\{]*\{[^}]*background:var\(--ed-header-control-bg\)/s.test(css)],
];

let failed = 0;
for (const [name, ok] of checks) {
  if (!ok) {
    console.error(`FAIL: ${name}`);
    failed++;
  }
}
if (failed) process.exit(1);
console.log(`Header QA passed: ${checks.length}/${checks.length}`);
