import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const trustedHtml = fs.readFileSync(path.join(repoRoot, 'trusted', 'index.html'), 'utf8');

const navMatch = trustedHtml.match(/<nav class="bottom-nav trusted-bottom-nav"[\s\S]*?<\/nav>/);
assert.ok(navMatch, 'expected trusted page to include a dedicated bottom nav shell');

const navHtml = navMatch[0];
const navItemCount = (navHtml.match(/class="nav-item\b/g) || []).length;

assert.equal(
  navItemCount,
  5,
  'expected trusted page to keep the same 5-slot bottom-nav structure as the home page'
);

assert.match(
  navHtml,
  /center-hack-btn/,
  'expected trusted page to preserve the floating center scan button design'
);

assert.match(
  navHtml,
  /href="\/#providerSection"[^>]*center-hack-btn|center-hack-btn[^>]*href="\/#providerSection"/,
  'expected the trusted-page scan button to route back to the home provider/scan entry point'
);

assert.match(
  navHtml,
  /id="scanButtonLabel">SCAN</,
  'expected trusted page bottom nav to keep the same SCAN medallion label'
);

console.log('Trusted bottom-nav consistency checks passed.');
