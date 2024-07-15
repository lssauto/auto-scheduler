import { StatusOptions } from "../status-options";

describe("enums - Positions Static Class", () => {
  StatusOptions.forEach((status) => {
    test(`Match '${status.match}' returns '${status.title}' status`, () => {
      expect(StatusOptions.match(status.match)).toBe(status);
    });
  });
});
