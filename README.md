# Unofficial Luma SDK

> **Under construction** — not ready for production use.

A TypeScript client for the [Luma public API](https://public-api.luma.com). Not affiliated with or maintained by Luma.

**Note:** You need a [Luma Plus](https://luma.com) organization to use the API. See the [Getting Started guide](https://docs.luma.com/reference/getting-started-with-your-api) for setup and authentication.

## Install

```bash
bun add luma-api
```

For the CLI:

```bash
bun add luma-cli
```

## Setup

Get an API key from [Luma API keys](https://luma.com/calendar/manage/api-keys) (Luma Plus required).

```bash
cp .env.example .env
# add LUMA_API_KEY=your-key-here
```

## Usage

```ts
import { Luma } from "luma-api";

const luma = new Luma(process.env.LUMA_API_KEY!);

await luma.events.guests.add("evt-abc123", {
  guests: [
    { email: "jane@example.com", name: "Jane Doe" },
  ],
});
```

## CLI

After installing `luma-cli`:

```bash
luma users get
luma events list
luma --help
```

### Local development

From this repo:

```bash
bun install
cp .env.example .env   # add your API key
bun run luma users get
bun test
bun run build
```

## Publish

Publish to npm in this order:

1. **`luma-api`** (repo root) — the SDK library
2. **`luma-cli`** (`cli/`) — depends on `luma-api`

```bash
npm login

# from repo root — prepublishOnly builds dist/ automatically
bun test
npm publish --access public

# from cli/ — prepublishOnly builds dist/ automatically
cd cli
npm pkg set 'dependencies[luma-api]=^0.1.0'
npm publish --access public
```

Verify with `npm publish --dry-run` before the first release.
