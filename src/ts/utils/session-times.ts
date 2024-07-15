import { TimeBlock } from "../schedule/time-block";
import { Days } from "../days";
import * as timeConvert from "./time-convert";
// * checks if a given session time is valid, expects an int

// * Valid Session Times according to https://registrar.ucsc.edu/soc/archive/html/fall2020/schedule_planner1.pdf
const sessionTimes = new Map<Days, { start: string; end: string }[]>();
sessionTimes.set(Days.mon, [
  { start: "8:00 AM", end: "9:05 AM" },
  { start: "9:20 AM", end: "10:25 AM" },
  { start: "10:40 AM", end: "11:45 AM" },
  { start: "12:00 PM", end: "1:05 PM" },
  { start: "1:20 PM", end: "2:25 PM" },
  { start: "2:40 PM", end: "3:45 PM" },
  { start: "4:00 PM", end: "5:05 PM" },
  { start: "5:20 PM", end: "6:55 PM" },
  { start: "7:10 PM", end: "8:45 PM" },
  { start: "9:00 PM", end: "10:00 PM" },
]);
sessionTimes.set(Days.tue, [
  { start: "8:00 AM", end: "9:35 AM" },
  { start: "9:50 AM", end: "11:25 AM" },
  { start: "11:40 AM", end: "1:15 PM" },
  { start: "1:30 PM", end: "3:05 PM" },
  { start: "3:20 PM", end: "4:55 PM" },
  { start: "5:20 PM", end: "6:55 PM" },
  { start: "7:10 PM", end: "8:45 PM" },
]);
sessionTimes.set(Days.wed, [
  { start: "8:00 AM", end: "9:05 AM" },
  { start: "9:20 AM", end: "10:25 AM" },
  { start: "10:40 AM", end: "11:45 AM" },
  { start: "12:00 PM", end: "1:05 PM" },
  { start: "1:20 PM", end: "2:25 PM" },
  { start: "2:40 PM", end: "3:45 PM" },
  { start: "4:00 PM", end: "5:05 PM" },
  { start: "5:20 PM", end: "6:55 PM" },
  { start: "7:10 PM", end: "8:45 PM" },
  { start: "9:00 PM", end: "10:00 PM" },
]);
sessionTimes.set(Days.thu, [
  { start: "8:00 AM", end: "9:35 AM" },
  { start: "9:50 AM", end: "11:25 AM" },
  { start: "11:40 AM", end: "1:15 PM" },
  { start: "1:30 PM", end: "3:05 PM" },
  { start: "3:20 PM", end: "4:55 PM" },
  { start: "5:20 PM", end: "6:55 PM" },
  { start: "7:10 PM", end: "8:45 PM" },
]);
sessionTimes.set(Days.fri, [
  { start: "8:00 AM", end: "9:05 AM" },
  { start: "9:20 AM", end: "10:25 AM" },
  { start: "10:40 AM", end: "11:45 AM" },
  { start: "12:00 PM", end: "1:05 PM" },
  { start: "1:20 PM", end: "2:25 PM" },
  { start: "2:40 PM", end: "3:45 PM" },
  { start: "4:00 PM", end: "5:05 PM" },
  { start: "5:05 PM", end: "10:00 PM" },
]);
sessionTimes.set(Days.sun, [
  { start: "8:00 AM", end: "9:00 AM" },
  { start: "9:00 AM", end: "10:00 AM" },
  { start: "10:00 AM", end: "11:00 AM" },
  { start: "11:00 AM", end: "12:00 PM" },
  { start: "12:00 PM", end: "1:00 PM" },
  { start: "1:00 PM", end: "2:00 PM" },
  { start: "2:00 PM", end: "3:00 PM" },
  { start: "3:00 PM", end: "4:00 PM" },
  { start: "4:00 PM", end: "5:00 PM" },
  { start: "5:00 PM", end: "6:00 PM" },
  { start: "6:00 PM", end: "7:00 PM" },
  { start: "7:00 PM", end: "8:00 PM" },
  { start: "8:00 PM", end: "9:00 PM" },
  { start: "9:00 PM", end: "10:00 PM" },
]);

export enum SessionTimes {
  schoolYear,
  summer
}

// checks if a given session time is valid
export function isValidSessionTime(
  time: TimeBlock | {day: Days, start: number, end: number}, 
  quarter: SessionTimes = SessionTimes.schoolYear
) {
  // sessions can only be one hour long, 5min buffer just cus
  if (time.end - time.start > 65) {
    return false;
  }

  // compare against session times list during normal school year
  if (quarter === SessionTimes.schoolYear) {
    for (const block of sessionTimes.get(time.day)!) {
      const timeBlockStart = timeConvert.strToInt(block.start);
      const timeBlockEnd = timeConvert.strToInt(block.end);
      if (timeBlockStart <= time.start && time.end <= timeBlockEnd) {
        return true;
      }
    }
  
  // sessions on 15min marks during the summer
  } else if (quarter === SessionTimes.summer) {
    if (
      timeConvert.strToInt("8:00 AM") <= time.start && 
      time.end <= timeConvert.strToInt("10:00 PM") &&
      time.start % 15 === 0
    ) {
      return true;
    }
  }

  return false;
}
