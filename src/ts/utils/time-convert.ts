// * utility function to convert individual times to an integer representation to make comparison easier

// * times given as "HH:MM [AM/PM]" are converted to an integer representing the number of minutes
// * from midnight. This means all times will be between 0 (12:00 AM) and 1439 (11:59 PM).

// ! does not work for times from 12:00 AM to 12:59 AM, this is left unfixed since it's not a valid time
export function strToInt(time: string): number {
  if (time === "") return 0;
  time = time.toUpperCase();

  const [hours, minutes] = time.split(":");
  let totalMinutes = parseInt(hours, 10) * 60 + parseInt(minutes, 10);
  if (time.includes("PM") && hours !== "12") {
    totalMinutes += 12 * 60; // Add 12 hours if it's PM (except for 12pm)
  }

  return totalMinutes;
}

// convert an integer representation of a time to a string "HH:MM [AM/PM]"
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

export function intTo24hr(time: number): string {
  const hours = Math.floor(time / 60);
  const mins = time % 60;
  return `${hours
    .toString()
    .padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}
