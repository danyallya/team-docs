import { closeSync, existsSync, openSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { PrismaClient } from '@prisma/client';
import { localSqliteTarget } from './sqlite-target.mjs';
import { seedLibrary } from './seed-data.mjs';
if (existsSync('.env')) process.loadEnvFile('.env');
const target = localSqliteTarget(process.env.DATABASE_URL ?? 'file:./forma-dev.db');
const command = process.argv[2];
if (command === 'setup' || command === 'status') {
  if (command === 'setup' && !existsSync(target.path)) closeSync(openSync(target.path, 'wx'));
  const require = createRequire(import.meta.url);
  const result = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', command === 'setup' ? 'deploy' : 'status'], { stdio: 'inherit', env: { ...process.env, DATABASE_URL: target.url } });
  process.exitCode = result.status ?? 1;
} else if (command === 'seed') {
  const db = new PrismaClient({ datasourceUrl: target.url });
  try { await seedLibrary(db); console.log('Synthetic library fixtures ready; existing records preserved.'); }
  catch { console.error('Local seed failed. Apply reviewed migrations first; no document content is logged.'); process.exitCode = 1; }
  finally { await db.$disconnect(); }
} else throw new Error('Choose setup, status or seed. No destructive reset is provided.');
