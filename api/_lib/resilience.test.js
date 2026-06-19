const { test } = require('node:test');
const assert = require('node:assert/strict');
const { retry, withTimeout, createCircuitBreaker } = require('./resilience');

const fail = () => { throw new Error('boom'); };

const noSleep = () => async () => {};
function recordingSleep() {
  const delays = [];
  return { sleep: async (ms) => { delays.push(ms); }, delays };
}

test('retry returns the result once a retryable call eventually succeeds', async () => {
  let calls = 0;
  const fn = async () => { calls++; if (calls < 3) throw new Error('flaky'); return 'ok'; };

  const result = await retry(fn, { attempts: 3, sleep: noSleep() });

  assert.equal(result, 'ok');
  assert.equal(calls, 3);
});

test('retry throws after exhausting all attempts', async () => {
  let calls = 0;
  const fn = async () => { calls++; throw new Error('always'); };

  await assert.rejects(() => retry(fn, { attempts: 3, sleep: noSleep() }), /always/);
  assert.equal(calls, 3);
});

test('retry does not retry when the error is not retryable', async () => {
  let calls = 0;
  const fn = async () => { calls++; const e = new Error('bad request'); e.status = 400; throw e; };

  await assert.rejects(() => retry(fn, { attempts: 3, isRetryable: (e) => e.status >= 500, sleep: noSleep() }));
  assert.equal(calls, 1);
});

test('retry uses exponential backoff between attempts (jitter off)', async () => {
  const { sleep, delays } = recordingSleep();
  const fn = async () => { throw new Error('fail'); };

  await assert.rejects(() => retry(fn, { attempts: 3, baseDelayMs: 100, jitter: false, sleep }));

  assert.deepEqual(delays, [100, 200]); // sleeps before attempts 2 and 3, none after the last
});

test('retry applies equal jitter within [expo/2, expo]', async () => {
  const { sleep, delays } = recordingSleep();
  const fn = async () => { throw new Error('fail'); };

  await assert.rejects(() => retry(fn, {
    attempts: 2, baseDelayMs: 100, jitter: true, random: () => 0, sleep,
  }));

  assert.deepEqual(delays, [50]); // random()=0 -> expo/2
});

test('withTimeout returns the value when fn settles in time', async () => {
  const result = await withTimeout(async () => 'ok', 1000);
  assert.equal(result, 'ok');
});

test('withTimeout rejects when fn exceeds the deadline', async () => {
  const never = () => new Promise(() => {});
  await assert.rejects(() => withTimeout(never, 10), /timed out/);
});

test('withTimeout aborts the signal on timeout', async () => {
  let captured;
  const fn = (signal) => { captured = signal; return new Promise(() => {}); };
  await assert.rejects(() => withTimeout(fn, 10));
  assert.equal(captured.aborted, true);
});

test('circuit breaker passes calls through while closed', async () => {
  const breaker = createCircuitBreaker({ failureThreshold: 3 });
  assert.equal(await breaker.exec(async () => 'ok'), 'ok');
  assert.equal(breaker.getState(), 'closed');
});

test('circuit breaker opens after failureThreshold consecutive failures', async () => {
  const breaker = createCircuitBreaker({ failureThreshold: 3 });
  for (let i = 0; i < 3; i++) {
    await assert.rejects(() => breaker.exec(fail));
  }
  assert.equal(breaker.getState(), 'open');
});

test('circuit breaker short-circuits without calling fn while open', async () => {
  const breaker = createCircuitBreaker({ failureThreshold: 1 });
  await assert.rejects(() => breaker.exec(fail)); // opens

  let called = false;
  await assert.rejects(() => breaker.exec(async () => { called = true; }), /circuit open/);
  assert.equal(called, false);
});

test('circuit breaker resets the failure count on a success while closed', async () => {
  const breaker = createCircuitBreaker({ failureThreshold: 3 });
  await assert.rejects(() => breaker.exec(fail));
  await assert.rejects(() => breaker.exec(fail));
  await breaker.exec(async () => 'ok'); // resets
  await assert.rejects(() => breaker.exec(fail));
  await assert.rejects(() => breaker.exec(fail));
  assert.equal(breaker.getState(), 'closed'); // 2 < threshold after reset
});

test('circuit breaker half-opens after cooldown and a successful probe closes it', async () => {
  let nowMs = 0;
  const breaker = createCircuitBreaker({ failureThreshold: 1, cooldownMs: 1000, now: () => nowMs });
  await assert.rejects(() => breaker.exec(fail)); // opens at t=0
  nowMs = 1000;
  assert.equal(breaker.getState(), 'half-open');
  assert.equal(await breaker.exec(async () => 'ok'), 'ok');
  assert.equal(breaker.getState(), 'closed');
});

test('circuit breaker reopens if the half-open probe fails', async () => {
  let nowMs = 0;
  const breaker = createCircuitBreaker({ failureThreshold: 1, cooldownMs: 1000, now: () => nowMs });
  await assert.rejects(() => breaker.exec(fail)); // opens at t=0
  nowMs = 1000;
  await assert.rejects(() => breaker.exec(fail)); // probe fails -> reopen at t=1000
  assert.equal(breaker.getState(), 'open');
});
