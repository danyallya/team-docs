import { resolve } from 'node:path';
export function localSqliteTarget(raw) {
  const match = /^file:\.\/(forma-(?:dev|verify-\d{13})\.db)$/.exec(raw ?? '');
  if (!match) throw new Error('Use file:./forma-dev.db or a dedicated timestamped verification database.');
  const path = resolve(process.cwd(), 'prisma', match[1]);
  return { path, url: `file:${path.replaceAll('\\', '/')}` };
}
