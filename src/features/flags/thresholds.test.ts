import * as thresholds from './thresholds';

// Jest runs in Node; read the doc directly so code and HEALTH_RULES.md can't drift apart.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { readFileSync } = require('node:fs') as {
  readFileSync(path: string, encoding: 'utf8'): string;
};
declare const __dirname: string;

function documentedThresholds(): Record<string, number> {
  const doc = readFileSync(`${__dirname}/../../../docs/HEALTH_RULES.md`, 'utf8');
  const rows: Record<string, number> = {};
  // Table rows look like: | `SHORT_CYCLE_FLAG` | ≤ 20 days | ... |
  for (const match of doc.matchAll(/^\|\s*`([A-Z0-9_]+)`\s*\|\s*[^|\d]*(\d+)/gm)) {
    rows[match[1]] = Number(match[2]);
  }
  return rows;
}

describe('health thresholds', () => {
  it('match docs/HEALTH_RULES.md exactly', () => {
    expect({ ...thresholds }).toEqual(documentedThresholds());
  });
});
