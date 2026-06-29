export const DEFAULT_EVENTS_LIMIT = 20;

export const formatEventsList = (
  events: { id: string; name: string }[],
  opts: { hasMore: boolean },
): string => {
  if (events.length === 0) {
    return "No events found.";
  }

  const summary = opts.hasMore
    ? `Showing ${events.length} events (more available)`
    : `Showing ${events.length} of ${events.length} events`;

  const lines = [summary, "", "ID\tNAME"];
  for (const event of events) {
    lines.push(`${event.id}\t${event.name}`);
  }

  return lines.join("\n");
};
