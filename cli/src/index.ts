import { Luma } from "@alhwyn/luma";
import { formatEventsList } from "./format-events";
import { loadEnvFile } from "./load-env";
import { parseArgs, requireApiKey, usage } from "./parse";

export const run = async (argv: string[]): Promise<number> => {
  try {
    const command = parseArgs(argv);

    if (command.kind === "help") {
      console.log(usage);
      return 0;
    }

    loadEnvFile();
    const apiKey = requireApiKey(process.env.LUMA_API_KEY);
    const luma = new Luma(apiKey);

    switch (command.kind) {
      case "users-get": {
        const user = await luma.users.get();
        console.log(`${user.email} (${user.id})`);
        return 0;
      }
      case "events-list": {
        const { data: events, hasMore } = await luma.events.list({
          pagination_limit: command.limit,
        });
        console.log(formatEventsList(events, { hasMore }));
        return 0;
      }
      default: {
        const _exhaustive: never = command;
        return _exhaustive;
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    return 1;
  }
};

if (import.meta.main) {
  const code = await run(process.argv);
  process.exit(code);
}
