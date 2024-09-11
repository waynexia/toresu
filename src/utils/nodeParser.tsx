export interface PlanProperties {
    name: string;
    prop: string;
    metrics: { [key: string]: number };
}

// Function to parse the given line into PlanProperties
export function parsePlanProperties(line: string): PlanProperties {
    const regex = /^(.*?):\s*(.*?)\s*metrics=\[(.*?)\]$/;
    const [, namePart, prop, metricsPart] = line.match(regex) || [];

    const name = namePart.trim();

    const metricsEntries = metricsPart.split(', ').map(entry => entry.split(': '));
    const metrics = Object.fromEntries(
        metricsEntries
            .map(([key, value]) => [key.trim(), parseFloat(value)])
            .filter(([key, value]) => key !== '' && value !== undefined && !isNaN(value))
    );

    return { name, prop, metrics };
}