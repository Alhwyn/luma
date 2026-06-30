# Unofficial Luma SDK

> **Under construction** — not ready for production use.

A TypeScript client for the [Luma public API](https://public-api.luma.com). Not affiliated with or maintained by Luma.

**Note:** You need a [Luma Plus](https://luma.com) organization to use the API. See the [Getting Started guide](https://docs.luma.com/reference/getting-started-with-your-api) for setup and authentication.

**Documentation:** [alhwyn.mintlify.site](https://alhwyn.mintlify.site/introduction) — install, authentication, API guides, webhooks, and CLI.

## Install

Packages are published to [GitHub Packages](https://github.com/Alhwyn/luma/packages).

### 1. Authenticate with GitHub Packages

Create a [personal access token](https://github.com/settings/tokens) with **`read:packages`**.

Add to your project:

**`.npmrc`**

```ini
@alhwyn:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

**`bunfig.toml`**

```toml
[install.scopes]
"@alhwyn" = { url = "https://npm.pkg.github.com", token = "$GITHUB_TOKEN" }
```

Set in `.env`:

```bash
GITHUB_TOKEN=ghp_your_token
```

### 2. Install the SDK

```bash
bun add @alhwyn/luma
```

### 3. Install the CLI (optional)

```bash
bun add @alhwyn/luma-cli
```

If you get **401 Unauthorized**, your `GITHUB_TOKEN` is missing, expired, or lacks `read:packages`. See [docs/install.mdx](docs/install.mdx) for details.



## Setup

Get an API key from [Luma API keys](https://luma.com/calendar/manage/api-keys) (Luma Plus required).

```bash
# add LUMA_API_KEY=your-key-here
```



## Usage

```ts
import { Luma } from "@alhwyn/luma";

const luma = new Luma(process.env.LUMA_API_KEY!);

await luma.events.guests.add("evt-abc123", {
  guests: [
    { email: "jane@example.com", name: "Jane Doe" },
  ],
});
```



## Webhooks

Add to `.env` (see [.env.example](.env.example)):

```bash
LUMA_WEBHOOK_SECRET=whsec_...
LUMA_WEBHOOK_EVENT_TYPES=guest.updated,guest.registered
```



### Register an endpoint

```ts
import { Luma } from "@alhwyn/luma";

const luma = new Luma(process.env.LUMA_API_KEY!);

const endpoint = await luma.webhooks.create({
  url: "https://myapp.com/api/luma-webhook",
  event_types: ["guest.updated", "guest.registered"],
});

// Save endpoint.secret as LUMA_WEBHOOK_SECRET
```

`event_types` also reads from `LUMA_WEBHOOK_EVENT_TYPES` via `webhookEventTypesFromEnv()`.

### Verify incoming events

```ts
import { Luma } from "@alhwyn/luma";

const webhook = new Luma(process.env.LUMA_API_KEY!).webhooks.client({
  secret: process.env.LUMA_WEBHOOK_SECRET!,
});

// In your HTTP handler — pass the raw body, not re-serialized JSON
const event = webhook.verify({
  body: await req.text(),
  headers: req.headers,
});
```

Inbound-only handlers do not need an API key:

```ts
import { WebhookInboundClient } from "@alhwyn/luma";

const webhook = new WebhookInboundClient({
  secret: process.env.LUMA_WEBHOOK_SECRET!,
});
```



### Handle an event

```ts
if (event.type === "guest.updated") {
  const checkedIn = event.data.event_tickets.some((t) => t.checked_in_at !== null);
  if (checkedIn) {
    // e.g. send welcome email to event.data.user_email
  }
}
```

Luma has no dedicated check-in webhook — check-in arrives as `guest.updated` with `event_tickets[].checked_in_at` set. See the [Guest Updated docs](https://docs.luma.com/reference/webhook_guest_updated).

## CLI

After installing `@alhwyn/luma-cli`:

```bash
luma users get
luma events list
luma --help
```

