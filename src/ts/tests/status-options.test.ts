import { StatusOptions } from "../status-options";

describe("enums - Positions Static Class", () => {
    test("Match 'calendar' returns added to calendar status", () => {
        expect(StatusOptions.match("calendar")).toBe(StatusOptions.calendarPosted);
    });
});