import { Command } from "@cliffy/command";

import { AvailableMap, Busys, IBusy } from "./interfaces/availability.ts";
import { setup } from "./data/setup.ts";
import { getAvailabilityFor } from "./services/availability.ts";

// Generate availability grouped by date for all users
function generateAvailabilityForUsersByDate(
  name: string,
  dates: string[],
  availableMap: AvailableMap,
): void {
  console.log(`\nAvailability for users ${name}:\n`);
  dates.forEach((date: string) => {
    const availabilityByDate = availableMap.get(date) as Busys;
    availabilityByDate.forEach((available: IBusy) => {
      const { start, end } = available;
      const message = `${date} ${start} - ${end}`;
      console.log(message);
    });
    console.log("");
  });
}

// Executable to generate availability for all users
async function executeCli(): Promise<void> {
  const { options } = await new Command()
    .name("availability")
    .version("1.0.0")
    .description(`Generate availability for given set of users by dates`)
    .allowEmpty(false)
    .option("-n, --name <name:string>", "list of names separated by commas", {
      required: true,
    })
    .option("-d, --date <date:string>", "list of dates separated by commas", {
      default: "2021-07-05,2021-07-06,2021-07-07",
    })
    .parse(Deno.args);
  const { name, date } = options;
  const names: string[] = name.split(",");
  const dates: string[] = date.split(",");

  setup();

  const availableMap: AvailableMap = getAvailabilityFor(names, dates);
  generateAvailabilityForUsersByDate(name as string, dates, availableMap);
}

// @ts-ignore
if (import.meta.main) {
  await executeCli();
}
