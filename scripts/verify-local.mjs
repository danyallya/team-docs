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
  await seedLibrary(db); assert.deepEqual(await counts(), [1, 2, 2, 2, 2]);
  await seedLibrary(db); assert.deepEqual(await counts(), [1, 2, 2, 2, 2]);
  const document = await db.document.findUniqueOrThrow({ where: { id: 'sample-brief' }, include: { revisions: true } });
  assert.equal(document.revisions[0].body, document.body);
  assert.equal(document.type, 'PROJECT_BRIEF');
  const workspaceNote = await db.document.findUniqueOrThrow({ where: { id: 'sample-workspace-notes' }, include: { revisions: true } });
  assert.equal(workspaceNote.revisions[0].body, workspaceNote.body);
  assert.equal(workspaceNote.type, 'STUDIO_GUIDE');
  await db.document.create({ data: {
    id: 'verify-day05-edit', workspaceId: 'sample-studio', authorId: 'sample-author',
    title: 'Synthetic Day 05 brief', summary: 'A disposable isolated write rehearsal.', type: 'RESEARCH', body: 'Version one.',
    revisions: { create: { version: 1, body: 'Version one.', editorName: 'Synthetic editor' } },
  } });
  await db.$transaction(async (tx) => {
    const current = await tx.document.findUniqueOrThrow({ where: { id: 'verify-day05-edit' }, include: { revisions: { orderBy: { version: 'desc' }, take: 1 } } });
    await tx.document.update({ where: { id: current.id }, data: {
      title: 'Synthetic Day 05 brief revised', summary: 'Revised summary.', type: 'PROJECT_BRIEF', body: 'Version two.',
      revisions: { create: { version: current.revisions[0].version + 1, body: 'Version two.', editorName: 'Synthetic editor' } },
    } });
  });
  const edited = await db.document.findUniqueOrThrow({ where: { id: 'verify-day05-edit' }, include: { revisions: { orderBy: { version: 'asc' } } } });
  assert.equal(edited.authorId, 'sample-author');
  assert.equal(edited.type, 'PROJECT_BRIEF');
  assert.deepEqual(edited.revisions.map(({ version, body }) => [version, body]), [[1, 'Version one.'], [2, 'Version two.']]);
  await db.document.update({ where: { id: edited.id }, data: { summary: 'Metadata-only edit.' } });
  assert.equal(await db.revision.count({ where: { documentId: edited.id } }), 2);
  await db.document.delete({ where: { id: edited.id } });
  assert.deepEqual(await counts(), [1, 2, 2, 2, 2]);
  await assert.rejects(db.membership.create({ data: { userId: 'sample-author', workspaceId: 'sample-studio' } }));
  await assert.rejects(db.revision.create({ data: { documentId: 'sample-brief', version: 1, body: 'Duplicate synthetic version', editorName: 'Fixture' } }));
  await assert.rejects(db.document.create({ data: { workspaceId: 'missing-workspace', authorId: 'sample-author', title: 'Invalid fixture', summary: '', body: '' } }));
  assert.deepEqual(await counts(), [1, 2, 2, 2, 2]);
  console.log('SQLite verification passed: fresh migrations, twice-run seed, typed documents, atomic document/revision writes, immutable version sequence, metadata-only edit, stable counts, unique membership/version and foreign-key rejection. Isolated synthetic database retained and ignored.');
} finally { await db.$disconnect(); }
