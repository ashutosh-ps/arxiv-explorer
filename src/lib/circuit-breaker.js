// Client-side circuit breaker (mirrors api/_lib/resilience.js — see docs/adr/0002 for why
// it's duplicated rather than shared across the CRA src/ boundary).
//
// closed → (failureThreshold consecutive failures) → open → (after cooldownMs) → half-open.
// While open, exec() short-circuits and throws without invoking fn, so a dead dependency
// stops being hammered.
export function createCircuitBreaker({ failureThreshold = 3, cooldownMs = 60000, now = () => Date.now() } = {}) {
  let state = 'closed';
  let failures = 0;
  let openedAt = 0;

  function getState() {
    if (state === 'open' && now() - openedAt >= cooldownMs) {
      state = 'half-open';
    }
    return state;
  }

  async function exec(fn) {
    if (getState() === 'open') {
      const err = new Error('circuit open');
      err.code = 'CIRCUIT_OPEN';
      throw err;
    }

    const wasHalfOpen = state === 'half-open';
    try {
      const result = await fn();
      state = 'closed';
      failures = 0;
      return result;
    } catch (err) {
      if (wasHalfOpen) {
        state = 'open';
        openedAt = now();
      } else {
        failures += 1;
        if (failures >= failureThreshold) {
          state = 'open';
          openedAt = now();
        }
      }
      throw err;
    }
  }

  return { exec, getState };
}
