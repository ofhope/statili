// @facta/forge/types.ts (or a new 'rules' module)

import type { RegressionResult } from "@facta/stats";

// import { StatSuccess } from '@facta/stats'; // General stat success type
// import { SpecificInsight } from './types'; // Your deterministic insight types


type BaseInsight = {
  /**
   * A concise, human-readable summary of the insight.
   */
  summary: string;
  /**
   * The method or statistical analysis that generated this insight.
   */
  method: string;
  /**
   * The type of finding this insight represents.
   * 'finding': A primary, notable observation.
   * 'warning': An alert about potential issues or weak results.
   * 'no-finding': Indicates that no significant pattern or anomaly was detected.
   * 'not-applicable': The statistical method or data was not suitable for this specific insight type.
   */
  level: 'finding' | 'warning' | 'no-finding' | 'not-applicable';
  /**
   * Optional severity for 'finding' and 'warning' levels.
   */
  severity?: 'info' | 'critical'; // Adjusted from previous 'info' | 'warning' | 'critical'
};




/**
 * The base structure for a statistical result that an InsightRule can process.
 * This is effectively any of the `ResultSuccess` types from @facta/stats.
 */
// export type ProcessableStatResult = 'ok'; // Union of all @facta/stats success types

/**
 * A function that determines if an insight rule's conditions are met.
 * It receives the statistical result and potentially the raw data.
 * @returns true if the insight should be generated, false otherwise.
 */
export type InsightCondition = (
  statResult: RegressionResult
) => boolean;

/**
 * A function that generates the SpecificInsight object if the condition is met.
 * It receives the statistical result, raw data, and the current configuration.
 * @returns A SpecificInsight object or null if it cannot be generated.
 */
export type InsightGenerator = (
  statResult: RegressionResult
) => BaseInsight;

/**
 * Defines a custom rule for generating a specific type of insight.
 * Users can define and register these rules with @facta/forge.
 */
export interface InsightRule {
  /**
   * A unique identifier for this insight rule.
   */
  id: string;
  /**
   * The type of statistical method this rule primarily applies to (e.g., 'linear', 'correlation').
   * Optional, if the rule can apply generally.
   */
  appliesTo: ('linear')[];
  /**
   * A function that determines if this insight should be generated based on the statistical result.
   */
  condition: InsightCondition;
  /**
   * A function that constructs the SpecificInsight object (summary, data, annotations, etc.).
   */
  generator: InsightGenerator;
  /**
   * Optional priority for rules, if multiple rules could generate similar insights.
   * Higher priority rules might be processed first.
   */
  priority?: number;
}