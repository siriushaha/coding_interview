import {
  AvailableMap,
  Availables,
  EventByDateMap,
  EventByTypeMap,
  eventMap,
  EventType,
  IAvailable,
  userMap,
} from "../interfaces/availability.ts";

import {
  convertRecordFromIAvailableToIBusy,
  getMergedRange,
  isBetween,
  isInRange,
} from "../lib/library.ts";

// Adjust availabity within given range
function adjustAvailabilityByRange(
  times: Availables,
  range: IAvailable,
): Availables {
  const adjustedTimes = [];
  for (let i = 0; i < times.length; i++) {
    if (times[i].start >= range.end) break;
    let start = times[i].start;
    let end = times[i].end;
    if (i === 0) start = range.start;
    if (end >= range.end) end = range.end;
    adjustedTimes.push({ start, end });
    if (times[i].end >= range.end) {
      break;
    }
  }
  return adjustedTimes;
}

// Algorithm to merge availability by user into common availability
function mergeAvailabilityByUserToAvailables(
  availables: Availables,
  availablesByUser: Availables,
): Availables {
  const mergedAvailables: Availables = [];
  const mergedRange = getMergedRange(availables, availablesByUser);

  // console.log('availables', availables)
  // console.log('availables by user', availablesByUser)
  // console.log('merged range', mergedRange)

  availables[0].start = Math.max(availables[0].start, mergedRange.start);
  availables[availables.length - 1].end = Math.min(
    availables[availables.length - 1].end,
    mergedRange.end,
  );
  availablesByUser = adjustAvailabilityByRange(availablesByUser, mergedRange);

  // console.log('availables', availables)
  // console.log('availables by user', availablesByUser)

  let lastAvailableByUser: IAvailable;
  let lastMerged: IAvailable;
  for (let available of availables) {
    // lastAvailable = available
    for (let availableByUser of availablesByUser) {
      lastAvailableByUser = availableByUser;
      // console.log('available', available)
      // console.log('available by user', availableByUser)
      if (
        available.start === availableByUser.start &&
        available.end === availableByUser.end
      ) {
        lastMerged = available;
        mergedAvailables.push(lastMerged);
        // console.log("1", lastMerged)
      } else if (isInRange(available, availableByUser)) {
        lastMerged = {
          start: Math.max(available.start, lastAvailableByUser.start),
          end: Math.min(available.end, lastAvailableByUser.end),
        };
        mergedAvailables.push(lastMerged);
        // console.log("2", lastMerged)
        break;
      } else if (isInRange(availableByUser, available)) {
        lastMerged = availableByUser;
        mergedAvailables.push(lastMerged);
        // console.log("3", lastMerged)
      } else {
        if (isBetween(lastAvailableByUser.end, available)) {
          lastMerged = {
            start: available.start,
            end: lastAvailableByUser.end,
          };
          mergedAvailables.push(lastMerged);
          // console.log("4", lastMerged)
        }
      }
    }
  }
  return mergedAvailables;
}

// Get availability for given set of names by dates
export function getAvailabilityFor(
  names: string[],
  dates: string[],
): AvailableMap {
  const availableMap = new Map() as AvailableMap;
  dates.forEach((date: string) => {
    // console.log(`By date ${date}`)
    let availables: Availables = [];
    names.forEach((name: string, index: number) => {
      // console.log(name)
      const userId = userMap.get(name) as number;
      // @ts-ignore
      const eventByDateMap = eventMap.get(userId) as EventByDateMap;
      // @ts-ignore
      const eventByTypeMap = eventByDateMap.get(date) as EventByTypeMap;
      // const busyByDate = eventByTypeMap.get("busy") as BusyTimes
      // console.log(busyByDate)
      const availablesByDate = eventByTypeMap.get(
        EventType.AVAILABLE,
      ) as Availables;
      // console.log(availableByDate)

      if (index === 0) {
        availables = [...availablesByDate];
      } else {
        availables = mergeAvailabilityByUserToAvailables(
          availables,
          availablesByDate,
        );
      }
      // console.log(index, availables)
    });

    availableMap.set(
      date,
      availables.map((available: IAvailable) =>
          convertRecordFromIAvailableToIBusy(available)
      ),
    );
  });
  return availableMap;
}
