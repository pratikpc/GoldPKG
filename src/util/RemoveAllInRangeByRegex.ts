function PrevLine(
    direction_: 'UP' | 'DOWN',
    lineNo_: number
) {
    return direction_ === 'DOWN'
        ? lineNo_ - 1
        : lineNo_ + 1;
}
function NextLine(
    direction_: 'UP' | 'DOWN',
    lineNo_: number
) {
    return PrevLine(
        direction_ === 'UP' ? 'DOWN' : 'UP',
        lineNo_
    );
}
function GetPreviousNonEmptyLine(
    data: string[],
    lineNo: number,
    direction: 'UP' | 'DOWN'
) {
    if (lineNo <= 0 || lineNo >= data.length) return lineNo;
    let prevLine = PrevLine(direction, lineNo);
    for (
        ;
        prevLine >= 0 && prevLine < data.length;
        prevLine = PrevLine(direction, prevLine)
    ) {
        if (data[prevLine] !== '') {
            const nextLine = NextLine(direction, prevLine);
            return nextLine;
        }
    }
    return prevLine;
}

function Iterate(
    data: string[],
    regex: RegExp,
    direction: 'UP' | 'DOWN',
    startAt = 0
): [number | undefined, number | undefined] {
    let start;
    let end;
    let lineNo = startAt;
    for (
        ;
        lineNo < data.length &&
        lineNo >= 0 &&
        (start == null || end == null);
        lineNo = NextLine(direction, lineNo)
    ) {
        const line = data[lineNo];
        const regexTestResult = regex.test(line);
        // Keep Looking For Start
        if (start == null && regexTestResult) {
            // Remember based on Library design,
            // Start will always start with a comment
            // Why do we add this check?
            // Simple. Because this Regex must only affect our sections which are enclosed in comments
            // This regex must not affect our User's own Commands
            // This is because our library works on the principle of Zoning
            // We zone a portion, you do what you want with the rest
            if (!line.startsWith('#')) break;

            start = GetPreviousNonEmptyLine(
                data,
                lineNo,
                direction
            );
        }
        // Ignore all Empty Lines
        else if (line === '') continue;
        else if (!regexTestResult) {
            // If Start is Found, Search for where it ends
            // Last is Blank/Non Blank Line with Regex Working
            if (start != null) {
                end = GetPreviousNonEmptyLine(
                    data,
                    PrevLine(direction, lineNo),
                    // Flip Direction because at Start we want to go up
                    direction === 'UP' ? 'DOWN' : 'UP'
                );
            }
            // End the Loop
            break;
        }
    }

    // Assume you get to the Last Line
    // And the Regex is Still Satisfied
    if (start != null && end == null)
        end = NextLine(direction, lineNo);

    // If they were both found
    // Remember logically irrespective of direction of choice
    // Everything Else parses First to Last
    // So First < Last always
    if (start != null && end != null)
        [start, end] =
            start < end ? [start, end] : [end, start];

    return [start, end];
}

export default function RemoveAllThatSatisfyRegex(
    data: string[],
    regex: RegExp,
    startAt: number,
    parseDirection: 'UP' | 'DOWN'
): [string[], string[]] {
    let removed: string[] = [];
    const [start, end] = Iterate(
        data,
        regex,
        parseDirection,
        startAt
    );
    if (start != null && end != null) {
        // Remove All Elements from Start to End
        // Removed stores list of all Removed values
        removed = data.splice(start, end - start + 1);
    }
    return [data, removed];
}
