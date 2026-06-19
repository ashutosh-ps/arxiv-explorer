// Composable resilience primitives for outbound calls: retry with backoff+jitter,
// per-attempt timeout, and a circuit breaker. All side effects (sleep, clock, randomness)
// are injectable so the behaviour is deterministically testable.

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry a promise-returning fn with exponential backoff and equal jitter. Only retries when
// isRetryable(err) is true; otherwise the error propagates immediately.
async function retry(fn, {
  attempts = 3,
  baseDelayMs = 100,
  maxDelayMs = 2000,
  jitter = true,
  isRetryable = () => true,
  sleep = defaultSleep,
  random = Math.random,
} = {}) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === attempts || !isRetryable(err)) throw err;
      const expo = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      const delay = jitter ? expo / 2 + random() * (expo / 2) : expo;
      await sleep(delay);
    }
  }
}

// Run fn(signal) but reject (and abort the signal) if it doesn't settle within `ms`.
// Passing the AbortSignal lets callers actually cancel the underlying work (e.g. fetch).
async function withTimeout(fn, ms) {
  const controller = new AbortController();
  let timer;
  const deadline = new Promise((_resolve, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`timed out after ${ms}ms`));
    }, ms);
  });
  try {
    return await Promise.race([Promise.resolve(fn(controller.signal)), deadline]);
  } finally {
    clearTimeout(timer);
  }
}

// Circuit breaker: stops calling a failing dependency so it can recover.
// closed → (failureThreshold consecutive failures) → open → (after cooldownMs) → half-open
//   half-open: a probe success closes the circuit; a probe failure reopens it.
// While open, exec short-circuits and throws without invoking fn.
function createCircuitBreaker({ failureThreshold = 5, cooldownMs = 30000, now = () => Date.now() } = {}) {
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

module.exports = { retry, withTimeout, createCircuitBreaker };
