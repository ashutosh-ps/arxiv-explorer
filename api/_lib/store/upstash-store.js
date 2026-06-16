// Store adapter backed by the Upstash Redis REST API. Same interface as MemoryStore, so
// the gateway code is identical regardless of which store is active. Uses plain fetch
// against Upstash's command endpoint — no SDK dependency.
//
// Values are JSON-serialized on write and parsed on read, so callers store/get plain
// objects (matching MemoryStore's by-reference behaviour for serializable values).
function createUpstashStore({ url, token, fetchImpl = fetch }) {
  async function command(args) {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    });
    if (!res.ok) {
      throw new Error(`upstash command failed: ${res.status}`);
    }
    const data = await res.json();
    return data.result;
  }

  return {
    kind: 'upstash',

    async get(key) {
      const result = await command(['GET', key]);
      return result == null ? undefined : JSON.parse(result);
    },

    async set(key, value, ttlSeconds) {
      const args = ['SET', key, JSON.stringify(value)];
      if (ttlSeconds) args.push('EX', String(ttlSeconds));
      await command(args);
    },
  };
}

module.exports = { createUpstashStore };
