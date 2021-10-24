import {
  Availables,
  Busys,
  IAvailable,
  IBusy,
  IEvent,
} from "../interfaces/availability.ts";

import { workingHours } from "../data/data.ts";

// Parse event record into IBusy record
export function parseEvent(event: IEvent): IBusy {
  const eventStarting: string[] = event.start_time.split("T");
  const eventEnding: string[] = event.end_time.split("T");
  return {
    id: event.id,
    date: eventStarting[0],
    start: eventStarting[1].slice(0, 5),
    end: eventEnding[1].slice(0, 5),
  };
}

// Convert time from string format to integer format
export function convertTimeToInt(time: string): number {
  return parseInt(time.replace(":", ""), 10);
}

// Convert time from integer format to string format
export function convertTimeToString(time: number): string {
  const timeStr: string = time.toString();
  return `${timeStr.slice(0, 2)}:${timeStr.slice(2)}`;
}

// Convert record from IBusy interface to IAvailable interface
export function convertRecordFromIBusyToIAvailable(time: IBusy): IAvailable {
  const start: number = convertTimeToInt(time.start);
  const end: number = convertTimeToInt(time.end);
  return { start, end };
}

// Convert record from IAvailable interface to IBusy format
export function convertRecordFromIAvailableToIBusy(time: IAvailable): IBusy {
  const start: string = convertTimeToString(time.start);
  const end: string = convertTimeToString(time.end);
  return { start, end };
}

// Determine range that can be merged between merged availabity and availabity by a user
export function getMergedRange(
  availables: Availables,
  availableByUser: Availables,
): IAvailable {
  const mergedRange: IAvailable = {
    start: Math.max(availables[0].start, availableByUser[0].start),
    end: Math.min(
      availables[availables.length - 1].end,
      availableByUser[availableByUser.length - 1].end,
    ),
  };
  return mergedRange;
}

// Determine whether a is contained in b
export function isInRange(a: IAvailable, b: IAvailable): boolean {
  return (b.start <= a.start && a.end <= b.end);
}

// Determine whether a is between start and end of availability
export function isInBetween(a: number, availableTime: IAvailable): boolean {
  return availableTime.start <= a && a <= availableTime.end;
}

// Create a list of availability from list of busy times for given date based on configured working hours
export function getAvailabilityByDate(busyByDate: Busys): Availables {
  const available: Busys = [];
  let start: string;
  const workingStart = convertTimeToInt(workingHours.start);
  const workingEnd = convertTimeToInt(workingHours.end);
  const addToAvailable = (start: string, end: string): void => {
    available.push({ start, end });
  };
  busyByDate.forEach((busy: IBusy, i: number, array: Busys) => {
    const last = array.length - 1;
    const busyStart = convertTimeToInt(busy.start);
    const busyEnd = convertTimeToInt(busy.end);
    if (i === 0) {
      if (busyStart > workingStart) {
        addToAvailable(workingHours.start, busy.start);
      }
      start = busy.end;
    }
    if (i > 0 && i <= last) {
      addToAvailable(start, busy.start);
      start = busy.end;
    }
    if (i === last) {
      if (busyEnd < workingEnd) {
        addToAvailable(busy.end, workingHours.end);
      }
    }
  });
  return available.map((available: IBusy) =>
    convertRecordFromIBusyToIAvailable(available)
  );
}
