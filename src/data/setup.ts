import {
  Availables,
  Busys,
  EventByDateMap,
  EventByTypeMap,
  eventMap,
  EventType,
  IEvent,
  userMap,
} from "../interfaces/availability.ts";

import { events, users } from "./data.ts";

import { getAvailabilityByDate, parseEvent } from "../lib/library.ts";

let eventByDateMap: EventByDateMap;
let eventByTypeMap: EventByTypeMap;

// load user map from users
function loadUserMap(): void {
  users.forEach((user) => userMap.set(user.name, user.id));
}

// load map of busy blocks from events
function loadBusyMap(): void {
  events.forEach((event: IEvent) => {
    // @ts-ignore
    if (!eventMap.has(event.user_id)) {
      eventByDateMap = new Map();
      // @ts-ignore
      eventMap.set(event.user_id, eventByDateMap);
    }
    // @ts-ignore
    eventByDateMap = eventMap.get(event.user_id) as EventByDateMap;
    const { id, date, start, end } = parseEvent(event);
    let eventsByUser: Busys;
    // @ts-ignore
    if (!eventByDateMap.has(date as string)) {
      eventByTypeMap = new Map();
      eventByTypeMap.set(EventType.BUSY, [] as Busys);
      // @ts-ignore
      eventByDateMap.set(date as string, eventByTypeMap);
    }
    // @ts-ignore
    eventsByUser = eventByDateMap.get(date).get(EventType.BUSY) as Busys;
    eventsByUser.push({ id, start, end });
  });
}

// load map of availabity from map of busy events
function loadAvailableMap(): void {
  userMap.forEach((value) => {
    // console.log(`User is ${key}`)
    // @ts-ignore
    const eventsByUserMap = eventMap.get(value);
    // @ts-ignore
    eventsByUserMap.forEach((value: EventByTypeMap, key: string) => {
      // console.log(`By date ${key}`)
      // @ts-ignore
      const busyByDate = value.get(EventType.BUSY) as Busys;
      // console.log(busyByDate)
      const availablesByDate: Availables = getAvailabilityByDate(busyByDate);
      // console.log(availableByDate)
      // @ts-ignore
      value.set(EventType.AVAILABLE, availablesByDate);
    });
  });
}

export function setup(): void {
  loadUserMap();
  loadBusyMap();
  loadAvailableMap();
}
