# Fraq Debug

Fraq Debug is a desktop test harness for Fraq plugins. Its Rust backend exposes a controllable Milky 1.2 mock service, while the Vue workbench injects message events and displays API calls and runtime activity.

## Current scope

- Start and stop a local Milky HTTP service.
- Accept API calls at `POST /api/:api` and record their JSON parameters.
- Publish events from `/event` over WebSocket or SSE.
- Require a Bearer token when one is configured.
- Inject friend, group, and temporary-session text messages.
- Return useful mock results for login information, implementation information, and sent messages.

## Development

Requirements:

- Node.js 22 or newer
- pnpm
- Rust stable
- On Windows, Visual Studio Build Tools with the **Desktop development with C++** workload and a Windows SDK

Install dependencies and open the browser preview:

```powershell
pnpm install
pnpm dev
```

Run the desktop application after the native build tools are installed:

```powershell
pnpm tauri dev
```

Checks:

```powershell
pnpm build
pnpm test:e2e
cargo test --manifest-path src-tauri/Cargo.toml
```
