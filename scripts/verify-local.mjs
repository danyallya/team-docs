import assert from 'node:assert/strict';
import { closeSync, existsSync, openSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { PrismaClient } from '@prisma/client';
import { localSqliteTarget } from './sqlite-target.mjs';
import { seedLibrary } from './seed-data.mjs';

const target = localSqliteTarget(`file:./forma-verify-${Date.now()}.db`);
assert.equal(existsSync(target.path), false, 'Verification must use a fresh file.');
// Create only a fresh isolated file; never replace an existing database.
closeSync(openSync(target.path, 'wx'));
const require = createRequire(import.meta.url);
const migration = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'], { encoding: 'utf8', env: { ...process.env, DATABASE_URL: target.url } });
if (migration.status !== 0) console.error(migration.stderr || migration.error?.message || 'Migration process failed.');
assert.equal(migration.status, 0, 'Isolated SQLite migration must apply.');
const db = new PrismaClient({ datasourceUrl: target.url });
const counts = async () => Promise.all([db.user.count(), db.workspace.count(), db.membership.count(), db.document.count(), db.revision.count()]);
try {
  await seedLibrary(db); assert.deepEqual(await counts(), [1, 1, 1, 1, 1]);
  await seedLibrary(db); assert.deepEqual(await counts(), [1, 1, 1, 1, 1]);
  const document = await db.document.findUniqueOrThrow({ where: { id: 'sample-brief' }, include: { revisions: true } });
  assert.equal(document.revisions[0].body, document.body);
  await assert.rejects(db.membership.create({ data: { userId: 'sample-author', workspaceId: 'sample-studio' } }));
  await assert.rejects(db.revision.create({ data: { documentId: 'sample-brief', version: 1, body: 'Duplicate synthetic version', editorName: 'Fixture' } }));
  await assert.rejects(db.document.create({ data: { workspaceId: 'missing-workspace', authorId: 'sample-author', title: 'Invalid fixture', summary: '', body: '' } }));
  assert.deepEqual(await counts(), [1, 1, 1, 1, 1]);
  console.log('SQLite verification passed: fresh migration, twice-run seed, stable counts, preserved revision, unique membership/version and foreign-key rejection. Isolated synthetic database retained and ignored.');
} finally { await db.$disconnect(); }
