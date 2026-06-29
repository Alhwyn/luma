# Unofficial Luma SDK

> **Under construction** — not ready for production use.

A TypeScript client for the [Luma public API](https://public-api.luma.com). Not affiliated with or maintained by Luma.

**Note:** You need a [Luma Plus](https://luma.com) organization to use the API. See the [Getting Started guide](https://docs.luma.com/reference/getting-started-with-your-api) for setup and authentication.

```ts
import { Luma } from "luma";

const luma = new Luma("your-api-key");

await luma.events.guests.add("evt-abc123", {
  guests: [
    { email: "jane@example.com", name: "Jane Doe" },
  ],
});
```
