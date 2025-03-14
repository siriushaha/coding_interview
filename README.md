# Background

Most calendar applications provide some kind of "meet with" feature where the
user can input a list of coworkers with whom they want to meet, and the calendar
will output a list of times where all the coworkers are available.

For example, say that we want to schedule a meeting with Jane, John, and Mary on
Monday.

- Jane is busy from 9am - 10am, 12pm - 1pm, and 4pm - 5pm.
- John is busy from 9:30am - 11:00am and 3pm - 4pm
- Mary is busy from 3:30pm - 5pm.

Based on that information, our calendar app should tell us that everyone is
available:

- 11:00am - 12:00pm
- 1pm - 3pm

We can then schedule a meeting during any of those available times.

# Instructions

Given the data in `events.json` and `users.json`, build a script that displays
available times for a given set of users. For example, your script might be
executed like this:

```
python availability.py Maggie,Joe,Jordan
```

and would output something like this:

```
2021-07-05 13:30 - 16:00
2021-07-05 17:00 - 19:00
2021-07-05 20:00 - 21:00

2021-07-06 14:30 - 15:00
2021-07-06 16:00 - 18:00
2021-07-06 19:00 - 19:30
2021-07-06 20:00 - 20:30

2021-07-07 14:00 - 15:00
2021-07-07 16:00 - 16:15
```

For the purposes of this exercise, you should restrict your search between
`2021-07-05` and `2021-07-07`, which are the three days covered in the
`events.json` file. You can also assume working hours between `13:00` and
`21:00` UTC, which is 9-5 Eastern (don't worry about any time zone conversion,
just work in UTC). Optionally, you could make your program support configured
working hours, but this is not necessary.

## Data files

### `users.json`

A list of users that our system is aware of. You can assume all the names are
unique (in the real world, maybe they would be input as email addresses).

`id`: An integer unique to the user

`name`: The display name of the user - your program should accept these names as
input.

### `events.json`

A dataset of all events on the calendars of all our users.

`id`: An integer unique to the event

`user_id`: A foreign key reference to a user

`start_time`: The time the event begins

`end_time`: The time the event ends

# Notes

- Feel free to use whatever language you feel most comfortable working with
- Please provide instructions for execution of your program
- Please include a description of your approach to the problem, as well as any
  documentation about key parts of your code.
- You'll notice that all our events start and end on 15 minute blocks. However,
  this is not a strict requirement. Events may start or end on any minute (for
  example, you may have an event from 13:26 - 13:54).

# Solution

## Language / Framework

Deno at https://deno.land/ is a modern and secure runtime of Javascript and
Typescript with feature to generate a self-contained executable. Deno is
considered as the new generation of Node.

The solution of this coding challenge is implemented in Deno and Typescript to
generate a self-contained executable availability.

## Approach to Problem

### Data and File Structures

Map is used to load data for users and events from users.json and events.json,
and maintain availability for all users grouped by date.

#### interfaces/availability.ts

- interfaces:

`IUser`: record from users.json

`IEvent`: record from events.json

`IBusy`: record parsed from IEvents events to keep track of each busy event

`IAvailable`: record to keep track of available time

- types and enums:

`EventType`: enum to represent BUSY and AVAILABLE event type

`Busys`: list of IBusy blocks per day

`Availables`: list of IAvailable blocks per day

`Time`: record of either IBusy or IAvailable block

`Times`: list of Time block

`UserMap`: a map of user ids by name

`EventByTypeMap`: a map of Busys or Availables blocks grouped by BUSY or
AVAILABLE event type

`EventByDateMap`: a map of EventType maps grouped by date

`EventByUserMap`: a map of EventByDateMap maps grouped by user id

`AvailableMap`: a map of available blocks grouped by date for a given set of
users

- global variables:

`userMap`: global variable to maintain a map of UserMap type

`eventMap`: global variable to maintain a map of EventByDateMap maps grouped by
user ids

#### data/data.js

`users`: global variable containing list of IUser records read from users.json
file

`events`: global variable containing list of IEvent record read from events.json
file

`workingHours`: configurable variable defined for working hours

#### data/setup.js

`loadUserMap`: function to create userMap from users variable

`loadBusyMap`: function to create a EventMap map grouped by user ids containing
EventByDateMap maps grouped by date which contain list of IBusy records

`loadAvailableMap`: function to create a list of IAvailable blocks grouped by
date from a list of IBusy records stored in a EventByTypeMap map

#### lib/library.ts

Utility functions used in data/setup.ts and services/availability.ts:

`parseEvent`: function to parse IEvent record to IBusy record

`convertTimeToInt`: function to convert time in "HH:MM" format into numeric
format ranging from 0 to 2400

`convertTimeToString`: function to convert time in numeric format ranging from 0
to 2400 to "HH:MM" format

`convertRecordFromIBusyToIAvailable`: function to convert record from IBusy
interface to IAvailable interface

`convertRecordFromIAvailableToIBusy`: function to convert record from IAvailable
interface to IBusy interface

`getMergedRange`: function to determine range that can be merged between merged
availability and availability by a user

`isInRange`: function to determine whether time block is contained within
another time block

`isBetween`: function to determine whether time is between start and end of a
time block

`getAvailabilityByDate`: function to generate list of IAvailable blocks from
list of IBusy blocks based on working hours defined in workingHours variable in
data/data.ts

#### services/availabity.ts

`adjustAvailabilityByRange`: function to keep only a list of user availability
blocks that are within merged range

`mergeAvailabilityByUserToAvailables`: function to merge list of user
availability blocks adjusted by adjustAvailabilityByRange into existing
availability

`getAvailabilityFor`: exported function to determine availability for a given
set of users on specific dates

#### main.ts

`generateAvailabilityForUsersByDate`: function to print out all availability for
given set of users by specified dates

`executeCli`: function to get name and date as command line parameters, get all
availability for users specified by name and date parameters and print out all
availability to the console output

This is the main entry point of this script

## Algorithm

```
- Load data from users.json and events.json into users and events variables in data/data.js

- Initialize userMap variable by calling loadUserMap, and eventMap variable by calling loadBusyMap and loadAvailableMap in data/setup.ts

- executeCli
    use Command to parse name and date as parameters from command line
    names = list of names parsed from name paramters
    dates = list of dates parsed from date parameters
    availableMap = new Map<AvailableMap>()
    for each date from dates
      for each name and index from names
        user_id = user_id retrieved from userMap by name
        eventByDateMap = EventByDateMap map retrieved from EventByUserMap eventMap by user_id
        availablesByDate = list of IAvailable blocks retrieved from eventByDateMap map by AVAILABLE event type
        mergedAvailables = []
        if index is 0 
          mergedAvailables = [...availablesByDate]
        else 
          mergedAvailables = mergeAvailabilityByUserToAvailables(availables,availablesByDate)
      availableMap.set(date, mergedAvailables.map(convertRecordFromIAvailableToIBusy)
    generateAvailabilityForUsersByDate(name, date, availableMap) to print out all availability for all names in name parameter
    
- mergeAvailabilityByUserToAvailables(availables,availablesByUser)
  mergedRange = getMergedRange(availables, availablesByUser)
  adjust availables to be within mergedRange
  mergedAvailables variable is list of merged IAvailable from availables and availablesByUser
  lastAvailableByUser variable to keep track of lastAvailableByUser
  lastMerged variable used as last merged IAvailable
  adjust availablesByUser by calling adjustAvailabilityByRange(availablesByUser, mergedRange)
  for each available from availables
    for each availableByUser from availablesByUser
      lastAvailableByUser = availableByUser
      if available == availableByUser
        lastMerged = available
        append lastMerged to mergedAvailables
      else if isInRange(available, availableByUser)
        lastMerged = {
          start: max(available.start, availableByUser.start)
          end: min(available.end, availableByUser.end)
        }
        append lastMerged to mergedAvailables
        break
      else if isInRange(availableByUser, available)
        lastMerged = availableByUser
        append lastMerged to mergedAvailables
      else if isBetween(lastAvailableByUser.end, available)
        lastMerged = {
          start: available.start,
          end: lastAvailableByUser.end
        }
        append lastMerged to mergedAvailables
  return mergedAvailables
```

Note that

1. time in "HH:MM" format is converted into numberic format ranging from 0 to
   2400 so that time in numeric format can be compared in determining
   availability
2. Map is used for search by user, date, event type
3. Working hours is configurable
4. Events can start or end on any minute

## Install Deno

#### Shell (Mac, Linux):

- `curl -fsSL https://deno.land/x/install/install.sh | sh`

#### PowerShell (Windows):

- `iwr https://deno.land/x/install/install.ps1 -useb | iex`

#### Homebrew (Mac):

`brew install deno`

## Generate self-contained single executable into `bin` directory

### For Windows

- deno compile --target x86_64-pc-windows-msvc -o bin/availability --allow-read
  src/main.ts

### For Linux

- `deno compile --target x86_64-unknown-linux-gnu -o bin/availability.linux --allow-read src/main.ts`

### For x86 Mac

- `deno compile --target x86_64-apple-darwin -o bin/availability.x86_mac --allow-read src/main.ts`

### For aarch Mac

- `deno compile --target aarch64-apple-darwin -o bin/availability.aarch_mac --allow-read src/main.ts`

## Run

### In your local installation directory

- deno run --allow-read src/main.ts -n Maggie,Joe,Jordan

```angular2html
Availability for users Maggie,Joe,Jordan:

2021-07-05 13:30 - 16:00
2021-07-05 17:00 - 19:00
2021-07-05 20:00 - 21:00

2021-07-06 14:30 - 15:00
2021-07-06 16:00 - 18:00
2021-07-06 19:00 - 19:30
2021-07-06 20:00 - 20:30

2021-07-07 14:00 - 15:00
2021-07-07 16:00 - 16:15
```

- deno run --allow-read src/main.ts

```angular2html
  Usage:   availability
  Version: 1.0.0       

  Description:

    Generate availability for given set of users by dates

  Options:

    -h, --help             - Show this help.                                                                         
    -V, --version          - Show the version number for this program.                                               
    -n, --name     <name>  - list of names separated by commas          (required)                                   
    -d, --date     <date>  - list of dates separated by commas          (Default: "2021-07-05,2021-07-06,2021-07-07")

  error: Missing required option "--name".
```

### Self-contained single executable `availability` in your OS

- Copy OS version of `availability` executable, `users.json` and `events.json`
  data files to your executable path

- cd `executable path` or bin

- Run `OS version of availability -n Maggie,Joe,Jordan`

in x68 Mac: `./availability.x86_mac -n Maggie,Joe,Jordan`

```angular2html
Availability for users Maggie,Joe,Jordan:

2021-07-05 13:30 - 16:00
2021-07-05 17:00 - 19:00
2021-07-05 20:00 - 21:00

2021-07-06 14:30 - 15:00
2021-07-06 16:00 - 18:00
2021-07-06 19:00 - 19:30
2021-07-06 20:00 - 20:30

2021-07-07 14:00 - 15:00
2021-07-07 16:00 - 16:15
```

- Run `OS version of availability`

in x68 Mac: `./availability.x86_mac`

```angular2html
  Usage:   availability
  Version: 1.0.0       

  Description:

    Generate availability for given set of users by dates

  Options:

    -h, --help             - Show this help.                                                                         
    -V, --version          - Show the version number for this program.                                               
    -n, --name     <name>  - list of names separated by commas          (required)                                   
    -d, --date     <date>  - list of dates separated by commas          (Default: "2021-07-05,2021-07-06,2021-07-07")

  error: Missing required option "--name".
```
