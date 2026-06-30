# Unofficial Luma SDK

> **Under construction** — not ready for production use.

A TypeScript client for the [Luma public API](https://public-api.luma.com). Not affiliated with or maintained by Luma.

## Documentation

Guides and API reference live in [docs/](docs/) (Mintlify). Preview locally:

```bash
bun run docs:dev
```

Connect the `docs/` directory in the [Mintlify dashboard](https://dashboard.mintlify.com) to publish.

## Install

```bash
bun add @alhwyn/luma
```

Optional CLI:

```bash
bun add @alhwyn/luma-cli
```

Packages are published to [GitHub Packages](https://github.com/Alhwyn/luma/packages). See [docs/install.mdx](docs/install.mdx) for setup details.

## Quick start

```ts
import { Luma } from "@alhwyn/luma";

const luma = new Luma(process.env.LUMA_API_KEY!);

await luma.events.guests.add("evt-abc123", {
  guests: [{ email: "jane@example.com", name: "Jane Doe" }],
});
```

Get an API key from [Luma API keys](https://luma.com/calendar/manage/api-keys) (Luma Plus required).

For webhooks, CLI usage, and the full API reference, see the [documentation](docs/introduction.mdx).
