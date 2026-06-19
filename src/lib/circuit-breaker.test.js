import { createCircuitBreaker } from './circuit-breaker';

describe('createCircuitBreaker (client)', () => {
  const fail = () => { throw new Error('boom'); };

  test('passes calls through while closed', async () => {
    const b = createCircuitBreaker({ failureThreshold: 3 });
    await expect(b.exec(async () => 'ok')).resolves.toBe('ok');
    expect(b.getState()).toBe('closed');
  });

  test('opens after the failure threshold', async () => {
    const b = createCircuitBreaker({ failureThreshold: 2 });
    await expect(b.exec(fail)).rejects.toThrow();
    await expect(b.exec(fail)).rejects.toThrow();
    expect(b.getState()).toBe('open');
  });

  test('short-circuits without calling fn while open', async () => {
    const b = createCircuitBreaker({ failureThreshold: 1 });
    await expect(b.exec(fail)).rejects.toThrow();

    let called = false;
    await expect(b.exec(async () => { called = true; })).rejects.toThrow(/circuit open/);
    expect(called).toBe(false);
  });

  test('half-opens after cooldown and closes on a successful probe', async () => {
    let now = 0;
    const b = createCircuitBreaker({ failureThreshold: 1, cooldownMs: 1000, now: () => now });
    await expect(b.exec(fail)).rejects.toThrow();
    now = 1000;
    expect(b.getState()).toBe('half-open');
    await expect(b.exec(async () => 'ok')).resolves.toBe('ok');
    expect(b.getState()).toBe('closed');
  });
});
