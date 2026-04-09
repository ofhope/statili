/**
 * @function generateOutlierWarningInsight
 * @description Generates an insight if outliers are detected in the residuals.
 * This is a simplified example; a full outlier detection would use more robust statistical methods from @facta/stats.
 * @param {LinearInsightGenerationOptions} options - Configuration options for insight generation.
 * @param {LinearRegressionSuccessResult} result - The successful result from @facta/stats linear regression.
 * @returns {GeneratedInsight | null} An insight about outliers, or null if none detected.
 */
// const generateOutlierWarningInsight = (options: LinearInsightGenerationOptions) => (result: RegressionSuccess): GeneratedInsight | null => {
//     const { residuals } = result;
//     const threshold = options.outlierZScoreThreshold ?? 3; // Z-score threshold

//     if (residuals.length === 0) return null;

//     // Simple Z-score calculation for residuals
//     const meanResidual = residuals.reduce((sum, r) => sum + r, 0) / residuals.length;
//     const stdDevResidual = Math.sqrt(
//         residuals.reduce((sum, r) => sum + (r - meanResidual) * (r - meanResidual), 0) / residuals.length
//     );

//     if (stdDevResidual === 0) return null; // No variance in residuals, no outliers by this method

//     const outliers: { index: number; value: number; zScore: number }[] = [];
//     result.residuals.forEach((r, index) => {
//         const zScore = Math.abs((r - meanResidual) / stdDevResidual);
//         if (zScore > threshold) {
//             outliers.push({ index, value: r, zScore });
//         }
//     });

//     if (outliers.length > 0) {
//         const summary = `Potential outliers detected: ${outliers.length} data point(s) significantly deviate from the regression line. Investigate these points for data errors or unusual events.`;
//         const chartAnnotations = outliers.map(o => `highlightPoint:index=${o.index},reason=outlier`);
//         return {
//             summary,
//             type: 'OutlierWarning',
//             data: { outliers },
//             chartAnnotations
//         };
//     }
//     return null;
// };
