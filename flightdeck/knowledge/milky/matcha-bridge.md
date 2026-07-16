# Matcha Milky bridge
SUMMARY: Matcha hosts Milky transport in Rust and delegates API behavior to the Vue adapter so protocol requests and simulated chat share one state model.
READ WHEN: when changing Milky transport, adding a Milky API, or debugging Rust-to-Vue request handling.
RECHECK WHEN: when Tauri event semantics, Milky transport requirements, or Matcha adapter ownership changes.

---

## Flow

1. `src/driver/milky/index.ts` starts the Rust server and listens for `milky-action` events.
2. Rust accepts `POST /api/:api`, verifies authentication and JSON content, then emits the request with a numeric request ID.
3. `src/adapter/milky/action.ts` aggregates domain handlers from `src/adapter/milky/actions/`, which execute APIs against Matcha's Dexie data and `Behav` operations.
4. Vue resolves the pending Rust request through `resolve_milky_action`.
5. Matcha scenes become Milky events in `src/adapter/milky/event.ts`; the driver broadcasts them to WebSocket and SSE clients.

Rust owns sockets and pending request channels. Vue owns users, groups, messages, API behavior, and protocol conversion. Keep this ownership split when adding APIs.

Milky 1.2.2 API state that is not part of upstream Matcha uses Dexie v5 tables for announcements, essence messages, private files, group files, and group folders. Forwarded-message contents remain process-local because their `forward_id` only needs to live for the active simulated session.
