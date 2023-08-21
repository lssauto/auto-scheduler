# match-pos.js
[Back To Overview](../overview.md)

> ## `matchPosition(posStr: str) -> Positions`
> Used to match a string from raw table data to a position from the [`Positions`](../globals.md#positions) enum. Has some special conditions for positions such as LGT and EMB LGT, which share "large" as part of their substrings in [`PositionKeys`](../globals.md#positionkeys).