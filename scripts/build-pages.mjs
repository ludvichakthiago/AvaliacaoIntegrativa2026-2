import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const result = spawnSync(process.execPath, [require.resolve('next/dist/bin/next'), 'build'], {
  stdio: 'inherit',
  env: { ...process.env, GITHUB_PAGES: 'true' },
});
if (result.error) { console.error(result.error.message); process.exit(1); }
if (result.status !== 0) process.exit(result.status ?? 1);
writeFileSync('out/.nojekyll', '');
console.log('Exportação estática pronta em out/.');
