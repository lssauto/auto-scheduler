import { Days } from "../../days";
import { isValidSessionTime } from "../session-times";
import * as timeConvert from "../time-convert";

describe("utils - Test Session Time Validation", () => {
  test("M 7:00 - 8:00 AM returns false", () => {
    expect(
      isValidSessionTime({
        day: Days.mon,
        start: timeConvert.strToInt("7:00 AM"),
        end: timeConvert.strToInt("8:00 AM"),
      })
    ).toBe(false);
  });

  test("Tu 11:40 - 12:40 PM returns true", () => {
    expect(
      isValidSessionTime({
        day: Days.tue,
        start: timeConvert.strToInt("11:40 AM"),
        end: timeConvert.strToInt("12:40 PM"),
      })
    ).toBe(true);
  });

  test("Sun 3:00 - 4:00 PM returns true", () => {
    expect(
      isValidSessionTime({
        day: Days.sun,
        start: timeConvert.strToInt("3:00 PM"),
        end: timeConvert.strToInt("4:00 PM"),
      })
    ).toBe(true);
  });
});
