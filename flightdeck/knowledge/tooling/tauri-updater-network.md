# ⚠ Tauri updater intermittent GitHub requests
SUMMARY: A valid public updater manifest can still fail intermittently with `error sending request`; retry the Tauri update check before reporting failure.
READ WHEN: when update logs show `error sending request` or `Could not fetch a valid release JSON from the remote` while the configured endpoint returns HTTP 200.

---

The Tauri updater first fetches `latest.json`, follows GitHub redirects, and then selects the current platform. In the affected Windows environment, the same running application successfully parsed the manifest once and later failed while connecting to GitHub's proxy-mapped address. The manifest and every release asset continued to return HTTP 200 outside the application.

Treat this pattern as a transient transport failure rather than a malformed release. Automatic and manual update checks should share a bounded retry helper so one temporary GitHub connection failure does not become a user-visible update failure.
