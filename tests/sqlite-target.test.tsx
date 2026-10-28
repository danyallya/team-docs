import { describe, expect, it } from 'vitest';
import { localSqliteTarget } from '../scripts/sqlite-target.mjs';
describe('library SQLite file boundary', () => {
  it('resolves only dedicated project-local names', () => {
    expect(localSqliteTarget('file:./forma-dev.db').path.replaceAll('\\', '/')).toMatch(/\/prisma\/forma-dev\.db$/);
    expect(localSqliteTarget('file:./forma-verify-1793145600000.db').url).toContain('forma-verify');
  });
  it.each(['file:../../private.db', 'file:C:/private.db', 'https://example.com/db', 'file:./forma-dev.db?mode=ro', 'file:./dev.db'])('rejects other targets %s', target => {
    expect(() => localSqliteTarget(target)).toThrow();
  });
});
