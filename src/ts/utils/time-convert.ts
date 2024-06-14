// * utility function to convert individual times to an integer representation to make comparison easier

import { Days } from "../days";

// * times given as "HH:MM [AM/PM]" are converted to an integer representing the number of minutes
// * from midnight. This means all times will be between 0 (12:00 AM) and 1439 (11:59 PM).

/**
 * Converts a string in the format "HH:MM [AM/PM]" to an integer 
 * for easy comparison.
 */
export function strToInt(time: string): number {
  if (time === "") return 0;
  time = time.toUpperCase();

  const [hours, minutes] = time.split(":");
  let totalMinutes = parseInt(hours, 10) * 60 + parseInt(minutes, 10);
  if (time.includes("PM") && hours !== "12") {
    totalMinutes += 12 * 60; // Add 12 hours if it's PM (except for 12pm)
  } else if (time.includes("AM") && hours === "12") {
    totalMinutes -= 12 * 60; // 12am should be considered 0
  }

  return totalMinutes;
}

/**
 * Convert an integer representation of a time to a string "HH:MM [AM/PM]"
 */
export function intToStr(time: number): string {
  const hours = Math.floor(time / 60);
  const mins = time % 60;

  let formattedHours = hours % 12;
  if (formattedHours === 0) {
    formattedHours = 12;
  }

  const ampm = hours < 12 ? "AM" : "PM";

  const formattedTime = `${formattedHours}:${mins
    .toString()
    .padStart(2, "0")} ${ampm}`;
  return formattedTime;
}

/**
 * Converts an integer time to a string given in 24hr time format (e.g. "14:00").
 */
export function intTo24hr(time: number): string {
  const hours = Math.floor(time / 60);
  const mins = time % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Convert a timestamp string (a.k.a. the timestamp column in the response form) to
 * an integer.
 */
export function stampToStr(time: number): string {
  const u = new Date(time);

  return (
    ("0" + (u.getMonth() + 1)).slice(-2) +
    "/" +
    ("0" + u.getDate()).slice(-2) +
    "/" +
    u.getFullYear() +
    " " +
    ("0" + u.getHours()).slice(-2) +
    ":" +
    ("0" + u.getMinutes()).slice(-2) +
    ":" +
    ("0" + u.getSeconds()).slice(-2)
  );
}

/**
 * Convert an integer timestamp to a string format that matches that used in the response form.
 */
export function stampToInt(time: string): number {
  const dateObject = new Date(time);
  return dateObject.getTime(); // convert to milliseconds for comparison
}

/**
 * Convert a string that represents a time range on multiple days (e.g. "MWF 2:00 PM - 3:00 PM"),
 * to an object. If the given string cannot be parsed, then null is returned.
 */
export function parseTimeStr(
  timeStr: string,
  dayDefault = [Days.sun]
): {
  days: Days[];
  start: number;
  end: number;
} | null {
  // split string at an arbitrary space to prevent days from including the "M" from PM/AM
  const halves = timeStr.split(":");

  let days: Days[] | null = halves[0].match(/(M|Tu|W|Th|F|Sat|Sun)/g) as Days[]; // get all days
  const hours = timeStr.match(/[0-9]{1,2}:[0-9]{1,2}[\s]?(AM|PM|am|pm)?/g); // get all hours

  if (hours == null) return null;

  // if there are no days, then this is a Sun time
  if (days == null) {
    days = dayDefault;
  }

  // add AM or PM to first time if it's missing
  if (hours[0].match(/(AM|PM|am|pm)/g) == null) {
    if (hours[1].split(":")[0].trim() == "12") {
      hours[0] += hours[1].match(/(AM|am)/g) == null ? "AM" : "PM";
    } else {
      hours[0] += hours[1].match(/(AM|am)/g) == null ? "PM" : "AM";
    }
  }

  // get int time values
  const start = strToInt(hours[0]);
  const end = hours.length > 1 ? strToInt(hours[1]) : start + 60; // add 60 minutes if no second time

  return {
    days: days,
    start: start,
    end: end,
  };
}
