import * as timeConvert from "../../utils/time-convert";
import { Tutors } from "../../tutors/tutors";
import { ResponseTableMaker, Titles, Response } from "../../table-makers/response-maker";
import { Positions } from "../../positions";
import { StatusOptions } from "../../status-options";

describe("parsing - Response Parsing", () => {
  // init managers
  new Tutors();
  new ResponseTableMaker();

  // init column titles using expected values
  ResponseTableMaker.instance?.setColumnTitles(Object.values(Titles));

  // test response
  const testResponse : Response = {
    row: 2,
    encoding: "",
    timestamp: timeConvert.stampToStr(1),
    email: "jdoe@ucsc.edu",
    name: "John Doe",
    resubmission: false,
    returnee: false,
    courseID: "CHIN 6-(All Sections)",
    position: Positions.sgt,
    lectures: [],
    officeHours: [],
    discord: [],
    times: [],
    comments: "something something",
    status: StatusOptions.inProgress,
    scheduler: ""
  };
  
  console.log(testResponse);

  test("Sessions properly marked as errors", () => {
    //expect().toBe();
  });
});
