# Matcha for Milky Fraq plugin tester

State: Matcha for Milky with Milky 1.2 builds as a native Windows release.

## Next

- Inspect the completed `v20260719.2` draft Release on GitHub, verify its categorized notes and 17 all-platform signed assets, then publish it.

## Progress

- Chose upstream Matcha 0.4.8 as the maintained base instead of continuing the partial custom reimplementation.
- Imported upstream commit `ce38c344fa1a715f3a8496d9b793c4c1f75e7a78` with its AGPL-3.0 license, attribution, documentation, and assets intact.
- Verified the imported upstream application with `bun run build:web`.
- Added a Rust Milky server for `POST /api/:api` and WebSocket/SSE `/event`, including Bearer authentication and request timeouts.
- Added a Tauri request bridge so Milky APIs reuse Matcha for Milky's Vue/Dexie users, groups, messages, and behavior model.
- Added Milky message, entity, event, and action modules plus connection settings for `127.0.0.1:30001`.
- Added a browser-preview fallback around Tauri-only window APIs and fixed the collapsed contact action at Matcha for Milky's minimum desktop width.
- Implemented the second sidebar action as a runtime log viewer with Tauri log capture, search, level filtering, automatic scrolling, and clearing.
- Frontend type checking, JavaScript linting, and the native Rust/Tauri release build pass.
- Installed Visual Studio Build Tools 2022 with the C++ workload and Windows SDK 10.0.26100.0.
- Renamed the application to Matcha for Milky and standardized internal shorthand as `mfm`.
- Named the standalone Windows release `Matcha for Milky.exe` while keeping the internal Rust binary name `mfm`.
- NSIS bundling reached the installer stage but its optional GitHub utility download timed out; the standalone EXE is unaffected.
- Milky connection status is driven by active WebSocket/SSE client count instead of local server startup.
- Milky outgoing `forward` segments are parsed recursively and displayed as expandable forwarded messages, so plugin help responses are no longer discarded.
- Expanded the README protocol adapter matrix against Milky 1.2.2, covering all 64 APIs and 20 event types with implementation checkboxes.
- Implemented all 64 Milky 1.2.2 API routes, split missing handlers by system, friend, group, notification, and file responsibilities, with Dexie v5 persistence for new simulated entities.
- Implemented all 20 Milky 1.2.2 events, split conversion by system, message, friend, and group responsibilities; related API and UI operations now emit their matching simulated events.
- Removed the OneBot 11/12 adapters, their WebSocket client drivers, protocol settings, documentation matrices, and unused dependencies; Matcha for Milky now exposes Milky only.
- Added categorized runtime logs for Milky service and client connections, debug-level API calls and responses, and received event delivery.
- Formatted runtime log rows as `time | LOG LEVEL | message` with aligned fields and standard uppercase level names.
- Formatted API log messages as `[API: action] content` so each operation can be identified and searched directly.
- Formatted event log messages as `[Event: event_type] content` for consistent event identification and search.
- Collapsed log messages after two lines with click-to-expand and click-to-collapse behavior.
- Configured the Tauri Webview logger to send message text only, excluding duplicate timestamps, levels, targets, and call locations.
- Implemented the quick-call dialog with a searchable list of all 64 Milky APIs, editable JSON parameters, execution, and response output.
- Replaced raw quick-call JSON input with parameter name/value rows, add/remove controls, and automatic value parsing.
- Implemented custom sending for all 20 Milky events with search, shared data parameter rows, generated base fields, event preview, and delivery status.
- Added an expanded multiline editor for nested API and event parameter values.
- Added JSON formatting in the expanded parameter editor with non-destructive invalid-input feedback.
- Hid parameter expand and delete actions until row hover or keyboard focus, without shifting the two-column layout.
- Set the default Windows installer directory name to `Matcha-for-Milky` while preserving the displayed application name `Matcha for Milky`.
- Built both NSIS and WiX installers successfully after their required tooling downloads completed.
- Updated the release workflow to publish under pushed date-sequence tags with the required GitHub token permissions.
- Published the first annotated release tag, `v20260718.1`, and confirmed that its GitHub Release workflow started.
- Diagnosed the failed first release: all platforms completed compilation and bundling, then failed because the encrypted updater key password was not passed to Tauri.
- Rotated the updater signing key before any successful public release, backed up the old local key, and configured both signing secrets in GitHub Actions.
- Verified the signing fix with a complete local Windows release build that produced the NSIS installer and its updater signature.
- Confirmed the `v20260718.2` GitHub Release workflow passed on Linux, Windows, macOS Intel, and macOS ARM64, then published all 17 signed release artifacts.
- Diagnosed intermittent updater failures as transient GitHub request errors after confirming the same application could parse the valid manifest; automatic and manual checks now retry through one shared helper.
- Bumped the application to `0.4.9` so the updater retry fix can be delivered as a newer release.
- Verified the retry against the real Windows transport with two failed requests followed by a successful third request, then published all 17 `v20260718.3` release artifacts.
- Replaced silent automatic installation with a shared update confirmation dialog that shows versions, release notes, download progress, retryable errors, and a later option; bumped the application to `0.4.10`.
- Published all 17 `v20260718.4` artifacts after the update-dialog release passed on Linux, Windows, macOS Intel, and macOS ARM64.
- Replaced `0.x` version names with an MSI-compatible date sequence: internal `YY.M.DDNN`, development display `YYYYMMDDNN-dev`, and release display `YYYYMMDDNN-build`.
- Fixed Issue #1 by validating every Milky event identifier as a positive integer and restricting new account and group IDs to numbers, preventing JavaScript `NaN` values from becoming JSON `null`.
- Added complete log export, a right-click selectable log detail dialog, and a persisted user-configurable log retention limit that trims the oldest entries immediately.
- Formatted JSON objects matched by their outermost braces and JSON array suffixes in log details with two-space indentation, preserving surrounding text, one-line exports, and non-JSON messages.
- Added structural formatting for Tauri Rust Debug objects in log details, including nested `Object` and `String` wrappers that are not valid JSON.
- Bumped the application to the `26.7.1901` internal version for the `v20260719.1` release.
- Established a standing delivery rule to build and copy a release-mode Windows EXE with update checking enabled to the user's Downloads folder after every verified feature.
- Verified the local release EXE path by building with `GITHUB_WORKFLOW=Release`, confirming the generated release flag is true, and matching the copied download EXE against the release binary by SHA-256.
- Closed Issue #2 from the default branch with `Fixes #2` after confirming the report described broken Linux log copy/export behavior rather than a new feature request.
- Diagnosed the missing `v20260719.1` release notes: Release Drafter found no merged pull requests because all 11 changes since `v20260718.4` were direct commits, while multiple workflow jobs also competed to manage release drafts.
- Replaced Release Drafter with a Git commit changelog generator that categorizes entries as 新增、修改、文档、重构、破坏性更新 and creates one draft before parallel Tauri uploads begin.
- Verified categorized output against `v20260719.1` and the first release tag, then built a release-mode Windows EXE with update checking enabled and copied the hash-matched artifact to Downloads.
- Implemented Issue #248 with persisted application-wide shortcut settings, configurable master and per-action switches, user-role cycling, chat-input focus, duplicate-binding validation, and settings import/export support.
- Fixed private-message event scenes so Milky derives `message_scene` from the bot and the actual message peer instead of the user selected in the UI; the regression test, Milky event tests, JavaScript lint, web build, and native release build pass, and the hash-matched release EXE was copied to Downloads.
- Prepared the `26.7.1902` application version for `v20260719.2`; version and Milky regression tests, the web build, and the Windows native release build pass, with the release-enabled EXE copied to Downloads and verified by SHA-256.
- Confirmed the `v20260719.2` Release workflow completed successfully; its draft remains private to authenticated GitHub users until the categorized notes and 17 assets are checked and published.
- Added a leading digits-only check to role creation so non-numeric IDs show `角色 ID 必须为数字` before length validation; JavaScript lint, the web build, and the Windows native release build pass, with the release-enabled EXE copied to Downloads and verified by SHA-256.
- Added Milky `file_hash` to private incoming file segments using the protocol-defined TriSHA1 algorithm while keeping it absent from group segments; all 32 tests, type checking, JavaScript lint, the web build, and the Windows native release build pass. The new EXE is built but cannot replace the Downloads copy while that application is running.
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
- Native Rust compilation is now available through the Visual Studio Developer PowerShell environment.

## Read now

- flightdeck/knowledge/milky/protocol.md
- flightdeck/knowledge/milky/mfm-bridge.md
- flightdeck/knowledge/fraq/framework.md
- flightdeck/knowledge/tooling/windows-tauri-build.md

## Read if

- Read `flightdeck/knowledge/milky/private-file-tri-sha1.md` before changing Milky file message segments or private `message_receive` events.
- Read `flightdeck/knowledge/milky/private-message-scene.md` before changing private message creation or Milky `message_receive` conversion.
- Read `flightdeck/knowledge/milky/numeric-identifiers.md` when converting account or group IDs for Milky or debugging a `null` event identifier.
- Read `flightdeck/knowledge/tooling/root-log-ignore.md` when adding a source directory named `logs` or debugging ignored log-related source files.
- Read `flightdeck/knowledge/tooling/local-release-exe.md` before building any local Windows EXE for user delivery.
- Read `flightdeck/knowledge/tooling/github-issue-closing-keywords.md` before linking or closing any GitHub issue from a commit or pull request.
- Read `flightdeck/knowledge/tooling/log-json-boundaries.md` when JSON in log details remains on one line or has trailing text after its closing brace.
- Read `flightdeck/knowledge/tooling/github-release-tags.md` before creating or changing a release tag.
- Read `flightdeck/knowledge/tooling/release-drafter-direct-commits.md` when release notes are empty despite commits existing between tags.
- Read `flightdeck/knowledge/tooling/date-versioning.md` before changing the application version or creating a release tag.
- Read `flightdeck/knowledge/tooling/tauri-updater-network.md` when an update check fails while the public manifest remains available.
- Read `flightdeck/knowledge/fraq/timer-argument-order.md` when adding Fraq Context timers to fixtures or examples.
- Read `flightdeck/knowledge/rust/axum-shared-event-route.md` when changing the `/event` transport handler.

## Open questions

- Which Fraq plugin-specific scenarios should be added after native Milky transport verification?
