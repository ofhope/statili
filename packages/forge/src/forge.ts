import { curry } from "@statili/fp";
import { linear, type RegressionResult } from "@statili/stats";
import type { InsightRule } from "./type";

const DEFAULT_INSIGHTS: InsightRule[] =  []

export const forge = curry((insights: InsightRule[] = DEFAULT_INSIGHTS, result: RegressionResult) => {
    insights = insights.filter(({ appliesTo }) => appliesTo.includes('linear'));
    return insights.map(({ condition, generator }) => {
        if (condition(result)) {
            return generator(result);
        }
        return null;
    });
});


// pipe(linear, forge())
// pipe(linear, insights(summary, outliers))

