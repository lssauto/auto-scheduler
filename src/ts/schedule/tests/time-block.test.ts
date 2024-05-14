import { Days } from "../../days";
import { Tags, TimeBlock } from "../time-block";
import * as timeConvert from "../../utils/time-convert";
import { Tutors } from "../../tutors/tutors";
import { Rooms } from "../../rooms/rooms";

describe("schedule - TimeBlocks", () => {
  new Tutors();
  new Rooms();

  const time = TimeBlock.buildTimeBlock({
    coords: { row: -1, col: -1 },
    tag: Tags.session,
    day: Days.mon,
    start: timeConvert.strToInt("3:00 PM"),
    end: timeConvert.strToInt("4:00 PM"),
    scheduleByLSS: true,
    tutorEmail: "test@gmail.com",
    roomName: null,
    courseID: null,
  });

  test("time string should be 'M 3:00 PM - 4:00 PM'", () => {
    expect(time.getTimeStr()).toBe("M 3:00 PM - 4:00 PM");
  });

  test("'M 3:00 PM - 4:00 PM' should NOT conflict with 'Tu 3:00 PM - 4:00 PM'", () => {
    expect(time.conflictsWith({
      day: Days.tue,
      start: timeConvert.strToInt("3:00 PM"),
      end: timeConvert.strToInt("4:00 PM")
    })).toBe(false);
  });

  test("'M 3:00 PM - 4:00 PM' should NOT conflict with 'M 1:00 PM - 3:00 PM'", () => {
    expect(time.conflictsWith({
      day: Days.mon,
      start: timeConvert.strToInt("1:00 PM"),
      end: timeConvert.strToInt("3:00 PM")
    })).toBe(false);
  });

  test("'M 3:00 PM - 4:00 PM' should conflict with 'M 3:00 PM - 4:00 PM'", () => {
    expect(time.conflictsWith({
      day: Days.mon,
      start: timeConvert.strToInt("3:00 PM"),
      end: timeConvert.strToInt("4:00 PM")
    })).toBe(true);
  });

  test("'M 3:00 PM - 4:00 PM' should conflict with 'M 3:30 PM - 4:30 PM'", () => {
    expect(time.conflictsWith({
      day: Days.mon,
      start: timeConvert.strToInt("3:30 PM"),
      end: timeConvert.strToInt("4:30 PM")
    })).toBe(true);
  });
});
