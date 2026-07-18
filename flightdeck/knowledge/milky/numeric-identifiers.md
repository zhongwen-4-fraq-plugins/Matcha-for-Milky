# ⚠ Milky numeric identifiers
SUMMARY: Never serialize unchecked user or group identifiers into Milky `int64` fields because JavaScript converts `NaN` to JSON `null`.
READ WHEN: when converting account or group IDs for Milky, or when an event contains `null` in an ID field.

---

Matcha stores account and group identifiers as strings, while Milky exposes QQ identifiers as `int64`. Calling `Number()` on an alphanumeric identifier produces `NaN`; `JSON.stringify()` silently serializes that value as `null`, which disconnects strictly typed clients such as Kotlin serialization.

Use `toMilkyId()` for protocol event identifiers. It accepts only positive safe integers and fails before an invalid event reaches the transport. Account and group creation must likewise accept numeric IDs only so simulated entities remain valid Milky entities.
