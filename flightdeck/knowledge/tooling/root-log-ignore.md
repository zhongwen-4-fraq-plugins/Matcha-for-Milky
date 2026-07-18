# ⚠ Root log directory ignore
SUMMARY: Always anchor the generated log directory as `/logs` in `.gitignore` so source folders named `logs` remain trackable.
READ WHEN: when adding a source directory named `logs`, or when a log-related source file does not appear in Git status.

---

A bare `logs` pattern matches directories with that name at every depth, including `src/components/logs/`. Use `/logs` to ignore only the generated repository-root log directory while preserving functional source organization.
