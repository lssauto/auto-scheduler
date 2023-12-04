export interface Position {
  readonly title: string;        // position title displayed
  readonly match: string;        // used to str match form responses
  readonly sessionLimit: number; // max number of sessions allowed
  readonly requestLimit: number; // when any remaining sessions will default to registrar requests
}

export class Positions {
  static readonly sgt: Position = {
    title: "SGT",
    match: "small",
    sessionLimit: 3,
    requestLimit: 3
  };

  static readonly esgt: Position = {
    title: "EMB SGT",
    match: "embedded small",
    sessionLimit: 3,
    requestLimit: 3
  };

  static readonly lgt: Position = {
    title: "LGT",
    match: "large",
    sessionLimit: 3,
    requestLimit: 3
  };

  static readonly elgt: Position = {
    title: "EMB LGT",
    match: "embedded large",
    sessionLimit: 3,
    requestLimit: 3
  };

  static readonly si: Position = {
    title: "SI",
    match: "si leader",
    sessionLimit: 3,
    requestLimit: 3
  };

  static readonly wr: Position = {
    title: "WR",
    match: "writing",
    sessionLimit: 3,
    requestLimit: 3
  };

  static readonly positions: Position[] = [
    Positions.lgt,
    Positions.sgt,
    Positions.elgt,
    Positions.esgt,
    Positions.si,
    Positions.wr
  ];

  static forEach(action: (position: Position) => void) {
    Positions.positions.forEach(action);
  }

  static match(str: string): Position {
    let pos = Positions.defaultPosition;
    const lower = str.toLowerCase();
    Positions.forEach(p => {
      if (lower.includes(p.match) || lower.includes(p.title.toLowerCase())) {
        pos = p;
      }
    });
    return pos;
  }

  static readonly defaultPosition: Position = Positions.sgt;

  static readonly courseless: Position[] = [Positions.wr];

  static readonly selfSchedulable: Position[] = [
    Positions.wr,
    Positions.esgt,
    Positions.sgt,
  ];
}
