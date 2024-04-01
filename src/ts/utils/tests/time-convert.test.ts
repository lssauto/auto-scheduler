import * as timeConvert from "../time-convert";

describe("utils - Test Time Converters", () => {
    test("Empty str returns 0", () => {
        expect(
            timeConvert.strToInt("")
        ).toBe(0);
    });
});