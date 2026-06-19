const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createLogger } = require('./logger');

test('event writes a single JSON line carrying the given fields', () => {
  const lines = [];
  const logger = createLogger({ write: (l) => lines.push(l), now: () => 0 });

  logger.event({ type: 'arxiv', status: 200 });

  assert.equal(lines.length, 1);
  const parsed = JSON.parse(lines[0]);
  assert.equal(parsed.type, 'arxiv');
  assert.equal(parsed.status, 200);
});

test('event stamps an ISO timestamp', () => {
  const lines = [];
  const logger = createLogger({ write: (l) => lines.push(l), now: () => 0 });

  logger.event({ type: 'x' });

  assert.equal(JSON.parse(lines[0]).time, '1970-01-01T00:00:00.000Z');
});
