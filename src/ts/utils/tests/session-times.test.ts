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
});
