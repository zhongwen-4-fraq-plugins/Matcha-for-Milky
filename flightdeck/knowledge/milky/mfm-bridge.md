# Matcha for Milky bridge
SUMMARY: Matcha for Milky hosts Milky transport in Rust and delegates API behavior to the Vue adapter so protocol requests and simulated chat share one state model.
READ WHEN: when changing Milky transport, adding a Milky API, or debugging Rust-to-Vue request handling.
RECHECK WHEN: when Tauri event semantics, Milky transport requirements, or Matcha for Milky adapter ownership changes.

---

## Flow

1. `src/driver/milky/index.ts` starts the Rust server and listens for `milky-action` events.
2. Rust accepts `POST /api/:api`, verifies authentication and JSON content, then emits the request with a numeric request ID.
3. `src/adapter/milky/action.ts` aggregates domain handlers from `src/adapter/milky/actions/`, which execute APIs against Matcha for Milky's Dexie data and `Behav` operations.
4. Vue resolves the pending Rust request through `resolve_milky_action`.
5. Matcha for Milky scenes become Milky events through the strategies in `src/adapter/milky/events/`; `src/adapter/milky/event.ts` combines them and the driver broadcasts the result to WebSocket and SSE clients.

Rust owns sockets and pending request channels. Vue owns users, groups, messages, API behavior, and protocol conversion. Keep this ownership split when adding APIs.

Milky 1.2.2 API state that is not part of upstream Matcha uses Dexie v5 tables for announcements, essence messages, private files, group files, and group folders. Forwarded-message contents remain process-local because their `forward_id` only needs to live for the active simulated session.

Actions that have a matching Milky event must create a scene through `Behav` after their state change. This keeps the chat timeline, event preview, and WebSocket/SSE payload consistent. `bot_offline` is emitted directly before the Milky driver stops because the transport must still be available for delivery.

The Tauri Webview log target uses a message-only formatter. The Vue log store owns display timestamps and levels, so the Rust formatter must not duplicate them or include the JavaScript call location encoded in the log target.
