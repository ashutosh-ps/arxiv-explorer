// Liveness/readiness probe. Reports which store and db adapters are active (memory vs
// upstash/postgres), so a deploy can be checked at a glance.
function createHealthHandler({ store, db, now = () => Date.now() }) {
  return async function handle(_req, res) {
    return res.status(200).json({
      status: 'ok',
      store: store.kind,
      db: db.kind,
      time: new Date(now()).toISOString(),
    });
  };
}

module.exports = { createHealthHandler };
