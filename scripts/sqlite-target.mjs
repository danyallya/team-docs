import { fileURLToPath } from 'node:url';
export function localSqliteTarget(raw) {
  if (!/^file:\.\/forma-(?:dev|verify-\d{13})\.db$/.test(raw ?? '')) throw new Error('Use file:./forma-dev.db or a dedicated timestamped verification database.');
  const path = fileURLToPath(new URL(`../prisma/${raw.slice('file:./'.length)}`, import.meta.url));
  return { path, url: `file:${path.replaceAll('\\', '/')}` };
}
