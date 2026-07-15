# ⚠ Axum WebSocket and SSE route extraction
SUMMARY: On Axum 0.8, never use `Option<WebSocketUpgrade>` to share one route between WebSocket and SSE because `WebSocketUpgrade` is not an optional request-parts extractor.
READ WHEN: when one Axum endpoint must serve WebSocket upgrades and normal HTTP streaming requests.
RECHECK WHEN: when upgrading Axum beyond 0.8 or when `WebSocketUpgrade` gains `OptionalFromRequestParts` support.

---

Inspect the `Upgrade` header from an `axum::extract::Request`. For WebSocket requests, split the request into parts and call `WebSocketUpgrade::from_request_parts`. For other requests, return the SSE response directly.

Using `Option<WebSocketUpgrade>` does not compile on Axum 0.8 because the optional extractor requires `OptionalFromRequestParts`, while `WebSocketUpgrade` only implements `FromRequestParts`.
