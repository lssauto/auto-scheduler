import { Course } from "../course";

describe("tutors - Course ID Formatting", () => {
  test("'CSE 12' -> 'CSE 12-001'", () => {
    expect(Course.formatID("CSE 12")).toBe("CSE 12-001");
  });
});
