// Cache-aside helper. Looks the key up in the store; on a miss it runs the producer,
// writes the result back with a TTL, and returns it. Reports whether the value came
// from cache via `hit`. Degrades to a direct producer call if the store misbehaves,
// so a cache outage never breaks the request path.
async function cached(store, key, ttlSeconds, producer) {
  try {
    const existing = await store.get(key);
    if (existing !== undefined) {
      return { value: existing, hit: true };
    }
  } catch {
    // Store read failed — skip the cache entirely and fetch fresh.
    return { value: await producer(), hit: false };
  }

  const value = await producer();
  try {
    await store.set(key, value, ttlSeconds);
  } catch {
    // Best-effort write; a failed cache write must not fail the response.
  }
  return { value, hit: false };
}

module.exports = { cached };
