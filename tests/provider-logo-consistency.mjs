import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repoRoot = process.cwd();
const gameDataPath = path.join(repoRoot, 'game-data.js');
const scriptPath = path.join(repoRoot, 'script.js');

const gameData = fs.readFileSync(gameDataPath, 'utf8');
const script = fs.readFileSync(scriptPath, 'utf8');

const providerPattern = /"([^"]+)":\s*\{\s*"name":\s*"([^"]+)",\s*"code":\s*"([^"]+)",\s*"logo":\s*"([^"]+)"/gs;
const providers = [...gameData.matchAll(providerPattern)].map(([, key, name, code, logo]) => ({ key, name, code, logo }));

assert.ok(providers.length >= 10, `expected provider database to contain at least 10 providers, got ${providers.length}`);

const nonLocalProviders = providers.filter((provider) => !provider.logo.startsWith('assets/'));
assert.equal(
  nonLocalProviders.length,
  0,
  `expected all provider logos to use local assets, found external logos for: ${nonLocalProviders.map((provider) => provider.name).join(', ')}`
);

const missingAssets = providers.filter((provider) => !fs.existsSync(path.join(repoRoot, provider.logo)));
assert.equal(
  missingAssets.length,
  0,
  `expected every provider logo asset to exist locally, missing: ${missingAssets.map((provider) => provider.logo).join(', ')}`
);

assert.match(
  script,
  /provider-icon"><img loading="eager"[^>]+decoding="async"/,
  'expected provider modal cards to render logos with eager loading and async decoding'
);

assert.match(
  script,
  /featured-provider-thumb"><img loading="eager"[^>]+decoding="async"/,
  'expected featured provider cards to render logos with eager loading and async decoding'
);

assert.ok(
  script.includes('warmProviderLogos()'),
  'expected script to warm provider logos for consistent modal rendering'
);

console.log(`Provider logo consistency checks passed for ${providers.length} providers.`);
