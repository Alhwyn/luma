# Unofficial Luma SDK

> **Under construction** — not ready for production use.

A TypeScript client for the [Luma public API](https://public-api.luma.com). Not affiliated with or maintained by Luma.

```ts
import { Luma } from "luma";

const luma = new Luma("your-api-key");

await luma.events.guests.add("evt-abc123", {
  guests: [
    { email: "jane@example.com", name: "Jane Doe" },
  ],
});
```
