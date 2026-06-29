export const usage = `luma — unofficial CLI for the Luma API

Usage:
  luma whoami              Show the authenticated user
  luma events list         List events on your calendar
  luma --help              Show this help

Environment:
  LUMA_API_KEY             Required. Your Luma API key.
`;

export type Command =
  | { kind: "help" }
  | { kind: "whoami" }
  | { kind: "events" };

export const parseArgs = (argv: string[]): Command => {
  const args = argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    return { kind: "help" };
  }

  const [resource, action] = args;

  if (resource === "whoami") {
    return { kind: "whoami" };
  }

  if (resource === "events" && action === "list") {
    return { kind: "events" };
  }

  throw new Error(`Unknown command: ${args.join(" ")}\n\n${usage}`);
};

export const requireApiKey = (apiKey: string | undefined): string => {
  if (!apiKey) {
    throw new Error(
      "Missing LUMA_API_KEY. Set it in your environment or .env file.\n" +
        "Get a key at https://luma.com/calendar/manage/api-keys",
    );
  }

  return apiKey;
};
