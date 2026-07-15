# Milky protocol reference
SUMMARY: Milky 1.2 is a strongly typed QQ bot application interface over HTTP APIs and event streams; transport success and business success are separate concerns.
READ WHEN: when implementing or debugging Milky APIs, event delivery, authentication, messages, or version compatibility.
RECHECK WHEN: when the configured Milky version differs from 1.2.x or the official documentation changes.

---

Verified against Milky 1.2.2 on 2026-07-16.

## Boundary

Milky is a protocol standard, not a bot framework. The protocol implementation hosts the HTTP services and the application connects to them.

## Communication

- API calls use `POST /api/:api` with a UTF-8 JSON body. APIs without parameters still receive `{}`.
- Authentication uses `Authorization: Bearer <access_token>` when configured.
- Authentication, missing endpoints, and unsupported content types use HTTP `401`, `404`, and `415`.
- All other API outcomes use HTTP `200`. Check the response envelope: success is `status: "ok"`, `retcode: 0`, and `data`; failure is `status: "failed"` with `retcode` and `message`.
- Events use `/event`. A WebSocket upgrade selects WebSocket; a normal GET selects SSE. Protocol implementations may also POST the same event objects to configured WebHooks.
- An event contains `time`, `self_id`, `event_type`, and variant-specific `data`.

## Types and compatibility

- Events, incoming messages, and message segments are discriminated unions. Typical discriminators are `event_type`, `message_scene`, and `type`.
- Message scenes are `friend`, `group`, and `temp`. Incoming and outgoing message segments are distinct types.
- File-like inputs commonly accept `file://`, `http(s)://`, and `base64://` URIs.
- Milky guarantees protocol-side backward compatibility and application-side forward compatibility across minor versions.
- Applications should ignore or warn on unknown non-message events. Unknown message segments should degrade to explanatory text. Unknown union members in arrays should be skipped where the compatibility rules require it.

Milky 1.2.2 currently exposes 64 OpenAPI endpoints and 106 schemas across system, message, friend, group, and file domains.

## Sources

- https://milky.ntqqrev.org/
- https://milky.ntqqrev.org/guide/communication
- https://milky.ntqqrev.org/guide/compatibility
- https://milky.ntqqrev.org/raw/openapi/openapi.json
