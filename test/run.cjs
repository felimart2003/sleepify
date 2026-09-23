const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
const { parseSessions } = require('../lib/validation.ts');
const { nightStats, recentNights, formatDuration } = require('../lib/stats.ts');
const { sampleWeek } = require('../lib/demo.ts');
const night = { id: 'night', bedTime: 1000, sleepTime: 601000, wakeTime: 29401000, awakeGaps: [{ start: 1000, end: 601000 }] };
assert.equal(nightStats(night).sleepMs, 8 * 3600000);
assert.equal(nightStats(night).awakeMs, 10 * 60000);
assert.equal(nightStats({ ...night, wakeTime: null }), null);
assert.equal(formatDuration(-1), '0m');
assert.equal(parseSessions(JSON.stringify([night])).length, 1);
assert.throws(() => parseSessions('[null]'));
assert.throws(() => parseSessions(JSON.stringify([{ ...night, wakeTime: 1 }])));
assert.throws(() => parseSessions(JSON.stringify([night, night])));
assert.throws(() => parseSessions(JSON.stringify([{ ...night, awakeGaps: [{ start: 20, end: 10 }] }])));
const sample = sampleWeek();
assert.equal(parseSessions(JSON.stringify(sample)).length, 7);
assert.equal(recentNights(sample, 7).length, 7);
assert.equal(recentNights([night], 7).length, 0);
console.log('12 checks passed: durations, active nights, malformed storage, duplicate sessions, sample week, date filtering.');
