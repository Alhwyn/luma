import { DEFAULT_EVENTS_LIMIT } from "./format-events";

export const usage = `luma — unofficial CLI for the Luma API

Usage:
  luma users get                  Show the authenticated user
  luma events list [--limit N]    List events on your calendar (default limit: 20)
  luma --help                     Show this help

Environment:
  LUMA_API_KEY                    Required. Environment variable or .env in cwd.
`;

export type Command =
  | { kind: "help" }
  | { kind: "users-get" }
  | { kind: "events-list"; limit: number };

const HELP_FLAGS = new Set(["--help", "-h"]);

const formatError = (message: string): Error => new Error(`${message}\n\n${usage}`);

const unknownCommand = (args: string[]): Error =>
  formatError(`Unknown command: ${args.join(" ")}`);

const tooManyArguments = (args: string[]): Error =>
  formatError(`Too many arguments: ${args.join(" ")}`);

const expectExactLength = (args: string[], length: number): void => {
  if (args.length > length) {
    throw tooManyArguments(args);
  }
  if (args.length < length) {
    throw unknownCommand(args);
  }
};

const parseLimitFlag = (args: string[], startIndex: number): number => {
  let limit = DEFAULT_EVENTS_LIMIT;
  let index = startIndex;

  while (index < args.length) {
    if (args[index] === "--limit") {
      const value = args[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw formatError("Missing value for --limit");
      }

      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw formatError(`Invalid --limit value: ${value}`);
      }

      limit = parsed;
      index += 2;
      continue;
    }

    throw tooManyArguments(args);
  }

  return limit;
};

export const parseArgs = (argv: string[]): Command => {
  const args = argv.slice(2);

  if (args.length === 0) {
    return { kind: "help" };
  }

  const helpFlags = args.filter((arg) => HELP_FLAGS.has(arg));
  if (helpFlags.length > 0) {
    if (args.length === helpFlags.length) {
      return { kind: "help" };
    }
    throw formatError(`Unexpected option: ${helpFlags.join(" ")}`);
  }

  const [noun, verb] = args;

  if (noun === "users" && verb === "get") {
    expectExactLength(args, 2);
    return { kind: "users-get" };
  }

  if (noun === "events" && verb === "list") {
    const limit = parseLimitFlag(args, 2);
    return { kind: "events-list", limit };
  }

  throw unknownCommand(args);
};

export const requireApiKey = (apiKey: string | undefined): string => {
  if (!apiKey) {
    throw new Error(
      "Missing LUMA_API_KEY. Set the environment variable or add it to a .env file in the current directory.\n" +
        "Get a key at https://luma.com/calendar/manage/api-keys",
    );
  }

  return apiKey;
};
