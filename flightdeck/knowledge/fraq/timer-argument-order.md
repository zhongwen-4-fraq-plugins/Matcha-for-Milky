# ⚠ Fraq timer argument order
SUMMARY: In Fraq 0.13.3, always pass the delay before the callback to `Context.timeout` and `Context.interval`; the current documentation examples show the reverse order.
READ WHEN: when adding or debugging a Fraq Context timer, or when a timer example fails type checking.
RECHECK WHEN: when Fraq is upgraded from 0.13.3 or the timer documentation is corrected.

---

The Fraq 0.13.3 implementation declares:

```typescript
ctx.timeout(delayMs, callback);
ctx.interval(intervalMs, callback);
```

The current Context documentation instead shows `ctx.timeout(callback, delayMs)` and `ctx.interval(callback, intervalMs)`. Follow the installed type declarations and implementation until the documentation or API changes.

Sources:

- https://fraq.dev/docs/development/digging/context#设定计时任务
- https://github.com/fraqjs/fraq/blob/main/packages/fraq/src/core/context/index.ts
