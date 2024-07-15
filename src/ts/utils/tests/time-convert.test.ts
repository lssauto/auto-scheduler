import * as timeConvert from "../time-convert";

describe("utils - Test Time Converters", () => {
  test("Empty str returns 0", () => {
    expect(timeConvert.strToInt("")).toBe(0);
  });

  test("12:00 AM should return 0", () => {
    expect(timeConvert.strToInt("12:00 AM")).toBe(0);
  });

  test("12:59 AM should return 59", () => {
    expect(timeConvert.strToInt("12:59 AM")).toBe(59);
  });

  test("1:00 AM should return 60", () => {
    expect(timeConvert.strToInt("1:00 AM")).toBe(60);
  });
});
