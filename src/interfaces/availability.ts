export interface IUser {
  id: number;
  name: string;
}

export interface IEvent {
  id: number;
  user_id: number;
  start_time: string;
  end_time: string;
}

export interface IBusy {
  start: string;
  end: string;
  id?: number;
  date?: string;
}

export interface IAvailable {
  start: number;
  end: number;
}

export enum EventType {
  BUSY = "busy",
  AVAILABLE = "available",
}

export type Time = IBusy | IAvailable | undefined;
export type Busys = IBusy[];
export type Availables = IAvailable[];
export type Times = Time[];
export type UserMap = Map<string, number>;
export type EventByTypeMap = Map<EventType, Busys | Availables> | undefined;
export type EventByDateMap = Map<string, EventByTypeMap> | undefined;
export type EventByUserMap = Map<number, EventByDateMap> | undefined;
export type AvailableMap = Map<string, Times>;

// Map of users
export const userMap: UserMap = new Map();

// Map of busy and available events by date for all users defined by user map
export const eventMap: EventByUserMap = new Map();
