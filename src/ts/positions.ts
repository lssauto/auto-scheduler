export interface Position {
  title: string;        // position title displayed
  match: string;        // used to str match form responses
  sessionLimit: number; // max number of sessions allowed
  requestLimit: number; // when any remaining sessions will default to registrar requests
}

export class Positions {
  static sgt: Position = {
    title: "SGT",
    match: "small",
    sessionLimit: 3,
    requestLimit: 3
  };

  static esgt: Position = {
    title: "EMB SGT",
    match: "embedded small",
    sessionLimit: 3,
    requestLimit: 3
  };

  static lgt: Position = {
    title: "LGT",
    match: "large",
    sessionLimit: 3,
    requestLimit: 3
  };

  static elgt: Position = {
    title: "EMB LGT",
    match: "embedded large",
    sessionLimit: 3,
    requestLimit: 3
  };

  static si: Position = {
    title: "SI",
    match: "si leader",
    sessionLimit: 3,
    requestLimit: 3
  };

  static wr: Position = {
    title: "WR",
    match: "writing",
    sessionLimit: 3,
    requestLimit: 3
  };

  static defaultPosition: Position = Positions.sgt;

  static courseless: Position[] = [Positions.wr];

  static selfSchedulable: Position[] = [
    Positions.wr,
    Positions.esgt,
    Positions.sgt,
  ];
}
