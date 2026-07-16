# Fraq plugin tester

State: The first runnable framework is implemented; native Rust verification is blocked by missing Windows C++ build tools.

## Next

- Install Visual Studio Build Tools with the Desktop development with C++ workload and a Windows SDK.
- Run `cargo test --manifest-path src-tauri/Cargo.toml` and `pnpm tauri dev`.
- Choose the first plugin-specific API stubs and test scenarios.

## Progress

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
- flightdeck/knowledge/fraq/framework.md
- flightdeck/knowledge/tooling/windows-tauri-build.md

## Read if

- Read `flightdeck/knowledge/fraq/timer-argument-order.md` when adding Fraq Context timers to fixtures or examples.
- Read `flightdeck/knowledge/rust/axum-shared-event-route.md` when changing the `/event` transport handler.

## Open questions

- Which plugin-specific scenarios should be added after the general test framework is usable?
