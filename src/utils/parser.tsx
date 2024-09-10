export interface ExplainAnalyzeRow {
    stage: number | null;
    node: number | null;
    plan: string[];
}

export function parseExplainAnalyzeOutput(input: string): ExplainAnalyzeRow[] {
    const lines = input.trim().split('\n');
    const result: ExplainAnalyzeRow[] = [];
    let currentRow: ExplainAnalyzeRow | null = null;

    // Iterate through each line of the input
    for (var line of lines) {
        // Skip separator lines
        if (/^[+\-|]+$/.test(line.trim())) {
            continue;
        }

        if (currentRow !== null && !line.startsWith('|')) {
            // If the current row is not null and the line starts with '|', add the line to the plan
            currentRow!.plan.push(line.trim());
        } else {
            if (!line.startsWith('|')) {
                continue;
            }

            if (!line.endsWith('|')) {
                line = line + '|';
            }

            // Match the line against the expected format
            const match = line.match(/^\|\s*(\S+)\s*\|\s*(\S+)\s*\|\s*(.*?)\s*\|$/);
            if (match) {
                // Destructure the matched groups
                const [, stage, node, plan] = match;
                const trimmedPlan = plan.trim();

                // Exclude the header row
                if (trimmedPlan.toLowerCase() === "plan") {
                    continue;
                }

                if (currentRow !== null) {
                    result.push(currentRow!);
                }

                currentRow = {
                    // Convert 'NULL' to null, otherwise parse as integer
                    stage: stage === 'NULL' ? null : parseInt(stage, 10),
                    node: node === 'NULL' ? null : parseInt(node, 10),
                    plan: [trimmedPlan],
                };
            }
        }
    }

    if (currentRow !== null) {
        result.push(currentRow);
    }

    return result;
}
