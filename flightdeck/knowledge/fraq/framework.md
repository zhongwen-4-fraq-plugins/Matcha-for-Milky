# Fraq framework reference
SUMMARY: Fraq 0.13.3 is a Node.js TypeScript framework that adds Context-managed routing, plugins, services, and lifecycle behavior on top of Milky.
READ WHEN: when implementing or debugging a Fraq bot, plugin, route, Context, or Milky integration.
RECHECK WHEN: when the installed Fraq version differs from 0.13.3 or the official documentation changes.

---

Verified against Fraq 0.13.3 on 2026-07-16. The package is `@fraqjs/fraq` and requires Node.js 22 or newer.

## Context

- `Context.fromUrl()` creates a Milky API client and installs a WebSocket event source by default. Use `accessToken` for authenticated protocol implementations.
- `ctx.client` exposes typed Milky API methods. HTTP failures and Milky `status: "failed"` responses become thrown errors.
- `ctx.on()` listens for typed Milky events. `ctx.hookApi()` intercepts or replaces API calls.
- `ctx.fork()` creates an isolated child Context that shares the base client, inherits parent services and activation rules, and may filter incoming events.
- `ctx.start()` loads plugins and starts event sources. `ctx.stop()` stops timers and event flow, stops children, then disposes services in reverse registration order.

## Routing and messages

- The router tokenizes text and non-text message segments, then selects the first registered route that completely consumes the input.
- Route forms are `command`, `rawPattern`, `group`, and `filter`.
- Typed parameters include literals, strings, numbers, unions, message segments, greedy text, and catch-all remaining segments.
- Activation rules can require direct input, a mention, a text prefix, or a mention plus prefix. They can vary by scene, plugin, tag, command, or route.
- `msg` builds mixed messages with a tagged template. `seg` constructs common outgoing segments.
- A command `Session` exposes the original Milky message plus `reply()` and group-message `reaction()` helpers.

## Plugins and testing

- Define plugins with `definePlugin()`, install them with `ctx.install()`, and keep user options JSON-serializable.
- Services are declared through `provides` and consumed through `inject` or `requires`; optional forms are also available.
- Plugin `apply()` performs normal setup. Optional `start()` runs only after all plugins have been applied.
- Use `@fraqjs/mock` for isolated message, event, entity, and API-stub tests.

## Sources

- https://fraq.dev/
- https://fraq.dev/llms-full.txt
- https://fraq.dev/docs/development/start
- https://fraq.dev/docs/development/digging/context
- https://fraq.dev/docs/development/digging/router
- https://fraq.dev/docs/development/plugin
