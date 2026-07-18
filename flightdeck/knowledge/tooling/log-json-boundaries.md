# ⚠ Structured data boundaries in log messages
SUMMARY: Log details can contain Rust Debug objects that look like JSON but cannot be passed to JSON.parse().
READ WHEN: when JSON-like data in log details remains on one line, especially Tauri updater output containing Object or String wrappers.

---

Log messages may contain a prefix, a JSON object, and trailing transport text. Parsing `message.slice(objectStart)` fails whenever anything follows the closing brace, even though the object itself is valid.

Tauri also logs Rust Debug values such as `Object {"version": String("0.4.10")}`. The text between the outer braces is not valid JSON, so a failed `JSON.parse()` must fall back to structural formatting. Scan the matched braces while tracking quoted strings and escapes, then indent nested objects and arrays without changing their values. Preserve text before and after the outermost brace match.
