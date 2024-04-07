import { Positions } from "../positions";

describe("enums - Positions Static Class", () => {
    test("Match 'LGT' returns large group tutor position", () => {
        expect(Positions.match("LGT")).toBe(Positions.lgt);
    });
});