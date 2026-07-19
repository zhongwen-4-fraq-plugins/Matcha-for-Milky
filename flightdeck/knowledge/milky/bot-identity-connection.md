# Milky bot identity connection checklist
SUMMARY: Always keep the Milky transport running when changing or exchanging bot identities; start or stop it only when bot availability changes, and reboot it only for transport configuration changes.
READ WHEN: before changing any bot identity assignment, account exchange, or Milky driver lifecycle behavior.

---

Matcha for Milky's Rust transport owns the listening socket and connected WebSocket/SSE
clients, but it does not bind itself to one bot identity. API handlers and event conversion
read the current bot from the Vue state at request or event time.

An unconditional `reboot()` watcher on `state.bot` stops the server whenever identities are
exchanged. That closes real client sockets, resets the client count to zero, and correctly
causes the UI to show `未连接`; restoring the UI flag would only hide the disconnect.

Apply these lifecycle transitions:

- no bot to a bot: start the transport;
- a bot to no bot: stop the transport;
- one bot identity to another: keep the existing transport and client connections;
- host, port, access token, or other transport configuration change: explicitly reboot.
