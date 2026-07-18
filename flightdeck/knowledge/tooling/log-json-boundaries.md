# ⚠ JSON boundaries in log messages
SUMMARY: When pretty-printing JSON inside a log message, parse the outermost brace match instead of requiring JSON to occupy the complete message suffix.
READ WHEN: when log details contain JSON that remains on one line, especially when text follows the closing brace.

---

Log messages may contain a prefix, a JSON object, and trailing transport text. Parsing `message.slice(objectStart)` fails whenever anything follows the closing brace, even though the object itself is valid.

Match the first `{` through the last `}` with a greedy multiline expression, parse only that match with `JSON.parse()`, and preserve the text before and after it. The parser still validates the structure; the regular expression only identifies its outer boundary.
