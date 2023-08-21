// uses the PositionKeys enum to return the actual Position

function matchPosition(posStr) {
    posStr = posStr.toLowerCase();
    for (const key in PositionKeys) {
        const PositionMatch = PositionKeys[key];
        if (posStr.includes(PositionMatch)) {
            if (posStr.includes(PositionKeys.ELGT)) {
                return Positions.ELGT;
            } else if (posStr.includes(PositionKeys.ESGT)) {
                return Positions.ESGT;
            }
            return Positions[key];
        }
    }
    return DefaultPosition;
}