# Unofficial Luma SDK

> **Under construction** — not ready for production use.

A TypeScript client for the [Luma public API](https://public-api.luma.com). Not affiliated with or maintained by Luma.

```ts
import { Luma } from "luma";

const luma = new Luma(process.env.LUMA_API_KEY!);

const user = await luma.users.get();
const { data: events } = await luma.events.list({ pagination_limit: 20 });
const guests = await luma.events.guests.list("evt-...");
```
