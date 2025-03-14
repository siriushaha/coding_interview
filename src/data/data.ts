import { readFile } from "@opensrc/jsonfile";

import { IBusy, IEvent, IUser } from "../interfaces/availability.ts";

// load users from json file users.json
export const users = await readFile("./users.json") as IUser[];

// load events from json file events.json
export const events = await readFile("./events.json") as IEvent[];

// configurable working hours based on UTC
export const workingHours: IBusy = {
  start: "13:00",
  end: "21:00",
};
