# Matcha-based Fraq plugin tester

State: Matcha 0.4.8 now includes a Milky 1.2 server adapter for Fraq integration.

## Next

- Verify the native Milky server after installing Windows C++ Build Tools and a Windows SDK.
- Exercise a real Fraq `Context.fromUrl()` connection against the desktop build.
- Install Visual Studio Build Tools and a Windows SDK before native Tauri verification.

## Progress

- Chose upstream Matcha 0.4.8 as the maintained base instead of continuing the partial custom reimplementation.
- Imported upstream commit `ce38c344fa1a715f3a8496d9b793c4c1f75e7a78` with its AGPL-3.0 license, attribution, documentation, and assets intact.
- Verified the imported upstream application with `bun run build:web`.
- Added a Rust Milky server for `POST /api/:api` and WebSocket/SSE `/event`, including Bearer authentication and request timeouts.
- Added a Tauri request bridge so Milky APIs reuse Matcha's Vue/Dexie users, groups, messages, and behavior model.
- Added Milky message, entity, event, and action modules plus connection settings for `127.0.0.1:30001`.
- Added a browser-preview fallback around Tauri-only window APIs and fixed the collapsed contact action at Matcha's minimum desktop width.
- Implemented the second sidebar action as a runtime log viewer with Tauri log capture, search, level filtering, automatic scrolling, and clearing.
- Frontend type checking and JavaScript linting pass; Rust dependency metadata resolves, while native compilation remains blocked before crate checking by the missing MSVC linker.
- Chose Tauri 2 with Vue 3 and TypeScript for the desktop application.
- Implemented a Rust Milky mock with API capture, Bearer authentication, WebSocket/SSE events, and message injection.
- Implemented the Vue workbench with server controls, event composition, runtime metrics, API history, and logs.
- Redesigned the full UI around the supplied desktop-chat reference: icon rail, searchable scenario list, chat timeline, and bottom event composer.
- API calls now appear as plugin replies in the chat timeline; service settings and logs remain separate selectable views.
- Added an About view behind the bottom rail menu with application, stack, protocol, and framework version information.
- Simplified the primary rail to message testing, plugin management, and activity logs in that order.
- Added a frontend plugin target manager with path entry, enable toggles, and removal controls; native plugin loading remains future Rust work.
- Added a group-list rail entry whose middle pane follows the conversation-list layout, plus group details and a direct handoff into group message testing.
- Added a friend-list rail entry with conversation-style rows, presence indicators, friend details, and a direct handoff into private-message testing.
- Replaced the middle-pane plus action with an add menu for group chats and accounts, including validated forms and automatic list selection after creation.
- Renamed the primary message rail entry from message testing to message list while keeping explicit test actions unchanged.
- `pnpm build`, Rust formatting, and two Playwright desktop/mobile tests pass.
- `cargo test` cannot start because this machine has no MSVC linker or Windows SDK.

## Read now

- flightdeck/knowledge/milky/protocol.md
- flightdeck/knowledge/milky/matcha-bridge.md
- flightdeck/knowledge/fraq/framework.md
- flightdeck/knowledge/tooling/windows-tauri-build.md

## Read if

- Read `flightdeck/knowledge/fraq/timer-argument-order.md` when adding Fraq Context timers to fixtures or examples.
- Read `flightdeck/knowledge/rust/axum-shared-event-route.md` when changing the `/event` transport handler.

## Open questions

- Which Fraq plugin-specific scenarios should be added after native Milky transport verification?
