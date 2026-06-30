# Unofficial Luma SDK

> **Under construction** — not ready for production use.

A TypeScript client for the [Luma public API](https://public-api.luma.com). Not affiliated with or maintained by Luma.

**Note:** You need a [Luma Plus](https://luma.com) organization to use the API. See the [Getting Started guide](https://docs.luma.com/reference/getting-started-with-your-api) for setup and authentication.

## Install

Packages are published to [GitHub Packages](https://github.com/Alhwyn/luma/packages).

**1. Authenticate** — create a [GitHub token](https://github.com/settings/tokens) with `read:packages`, then add to `~/.npmrc`:

```
@alhwyn:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

See [`.npmrc.example`](.npmrc.example) for a template.

**2. Install the SDK:**

```bash
bun add @alhwyn/luma
```

**3. Install the CLI (optional):**

```bash
bun add @alhwyn/luma-cli
```

## Setup

Get an API key from [Luma API keys](https://luma.com/calendar/manage/api-keys) (Luma Plus required).

```bash
cp .env.example .env
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

Register a webhook endpoint and verify incoming events with `unwrap()`:

```ts
import { Luma, WebhookScopes, webhookEventTypesFromEnv } from "@alhwyn/luma";

const luma = new Luma(process.env.LUMA_API_KEY!);

// Outbound: create a webhook endpoint
const endpoint = await luma.webhooks.create({
  url: "https://myapp.com/api/luma-webhook",
  event_types: webhookEventTypesFromEnv(),
  // or use named scopes directly:
  // event_types: [WebhookScopes.GuestUpdated, WebhookScopes.GuestRegistered],
});
// Store endpoint.secret (whsec_...) securely in LUMA_WEBHOOK_SECRET

// .env example:
// LUMA_WEBHOOK_EVENT_TYPES=guest.updated,guest.registered
// or scope names: GuestUpdated,GuestRegistered

// Inbound: verify and parse in your HTTP handler
const event = luma.webhooks.unwrap({
  body: rawBody,       // raw request body (string), not re-serialized JSON
  headers: req.headers,
  secret: process.env.LUMA_WEBHOOK_SECRET!,
});

if (event.type === WebhookScopes.GuestUpdated) {
  const justCheckedIn = event.data.event_tickets.some(
    (ticket) => ticket.checked_in_at !== null,
  );
  if (justCheckedIn) {
    await sendWelcomeEmail({
      to: event.data.user_email,
      name: event.data.user_name,
    });
  }
}
```

Luma does not have a dedicated check-in webhook — check-in fires `guest.updated` with `event_tickets[].checked_in_at` set. See the [Guest Updated webhook docs](https://docs.luma.com/reference/webhook_guest_updated).

## CLI

After installing `@alhwyn/luma-cli`:

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

## Publish (maintainers)

Packages publish to GitHub Packages as `@alhwyn/luma` and `@alhwyn/luma-cli`.

### Automatic (recommended)

1. Push your changes to `main`
2. Create a GitHub release with tag `v0.1.0` (or bump version in `package.json` first)
3. The [Publish workflow](.github/workflows/publish.yml) runs on `release: published` and publishes both packages

### Manual

```bash
# one-time: token with write:packages in NODE_AUTH_TOKEN
export NODE_AUTH_TOKEN=ghp_...

# SDK first
bun run build:api
npm publish

# CLI second — point at published SDK, not file:..
cd cli
npm pkg set 'dependencies[@alhwyn/luma]=^0.1.0'
bun run build
npm publish
```

Verify with `npm publish --dry-run` before the first release.

After publish, packages appear under **Packages** on the GitHub repo sidebar.
