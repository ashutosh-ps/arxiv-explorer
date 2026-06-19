import { getCodeLinks, clearCache } from './papersWithCodeApi';
import { createCircuitBreaker } from '../lib/circuit-breaker';

beforeEach(() => clearCache());

test('getCodeLinks stops hitting the endpoint once the breaker opens', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls++; return { ok: false, status: 422, json: async () => ({}) }; };
  const breaker = createCircuitBreaker({ failureThreshold: 2 });

  // Distinct ids so the success-cache doesn't short-circuit the calls.
  await getCodeLinks('1111.11111', { fetchImpl, breaker }); // failure 1
  await getCodeLinks('2222.22222', { fetchImpl, breaker }); // failure 2 -> opens
  await getCodeLinks('3333.33333', { fetchImpl, breaker }); // open -> no fetch

  expect(calls).toBe(2);
});

test('getCodeLinks returns [] on failure instead of throwing', async () => {
  const fetchImpl = async () => { throw new Error('network'); };
  const breaker = createCircuitBreaker({ failureThreshold: 3 });

  await expect(getCodeLinks('1706.03762', { fetchImpl, breaker })).resolves.toEqual([]);
});
