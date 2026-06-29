import { Luma } from "luma-api";
import { parseArgs, requireApiKey, usage } from "./parse";

export const run = async (argv: string[]): Promise<number> => {
  try {
    const command = parseArgs(argv);

    if (command.kind === "help") {
      console.log(usage);
      return 0;
    }

    const apiKey = requireApiKey(process.env.LUMA_API_KEY);
    const luma = new Luma(apiKey);

    switch (command.kind) {
      case "whoami": {
        const user = await luma.users.get();
        console.log(`${user.email} (${user.id})`);
        return 0;
      }
      case "events": {
        const { data: events } = await luma.events.list();
        if (events.length === 0) {
          console.log("No events found.");
          return 0;
        }

        for (const event of events) {
          console.log(`${event.id}\t${event.name}`);
        }
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
