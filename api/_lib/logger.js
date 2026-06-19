// Minimal structured logger: emits one JSON line per event to stdout (which Vercel captures),
// giving machine-readable, queryable logs with no external dependency. The writer and clock
// are injectable for testing.
function createLogger({ write = (line) => console.log(line), now = () => Date.now() } = {}) {
  return {
    event(fields) {
      write(JSON.stringify({ time: new Date(now()).toISOString(), ...fields }));
    },
  };
}

module.exports = { createLogger };
