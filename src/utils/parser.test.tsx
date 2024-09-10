import { describe, it, expect } from 'vitest';
import { parseExplainAnalyzeOutput } from './parser';

describe('parseExplainAnalyzeOutput', () => {
    it('should parse valid explain analyze output correctly', () => {
        const input = `
| stage | node | plan |
|-------|------|------|
| 1     | 2    | Seq Scan on table1 |
| 2     | NULL | Hash Join |
| NULL  | 4    | Index Scan on table2 |
|-------|------|------|
    `.trim();

        const result = parseExplainAnalyzeOutput(input);

        expect(result).toEqual([
            { stage: 1, node: 2, plan: ['Seq Scan on table1'] },
            { stage: 2, node: null, plan: ['Hash Join'] },
            { stage: null, node: 4, plan: ['Index Scan on table2'] },
        ]);
    });

    it('should handle empty input', () => {
        const result = parseExplainAnalyzeOutput('');
        expect(result).toEqual([]);
    });

    it('should ignore invalid lines', () => {
        const input = `
| stage | node | plan |
|-------|------|------|
| 1     | 2    | Seq Scan on table1 |
| Invalid line
| 2     | NULL | Hash Join |
|-------|------|------|
    `.trim();

        const result = parseExplainAnalyzeOutput(input);

        expect(result).toEqual([
            { stage: 1, node: 2, plan: ['Seq Scan on table1'] },
            { stage: 2, node: null, plan: ['Hash Join'] },
        ]);
    });

    it('should parse complex explain analyze output correctly', () => {
        const input = `
+-------+------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| stage | node | plan                                                                                                                                                                                                                                                                                    |
+-------+------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
|     0 |    0 |  GlobalLimitExec: skip=0, fetch=10 metrics=[output_rows: 10, elapsed_compute: 31395, ]
  SortPreservingMergeExec: [ts@0 DESC] metrics=[output_rows: 80, elapsed_compute: 70985, ]
    SortExec: TopK(fetch=10), expr=[ts@0 DESC], preserve_partitioning=[true] metrics=[output_rows: 80, elapsed_compute: 1276910, row_replacements: 528, ]
      MergeScanExec: peers=[4569845202944(1064, 0), 4569845202945(1064, 1), 4569845202946(1064, 2), 4569845202947(1064, 3), ] metrics=[output_rows: 560, greptime_exec_read_cost: 0, ready_time: 29420046, first_consume_time: 31923679746, finish_time: 170914196024, ]
 |
|  NULL | NULL | Total rows: 10                           |
+-------+------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
        `;
        const result = parseExplainAnalyzeOutput(input);

        expect(result).toHaveLength(2);
        expect(result).toEqual([{
            stage: 0,
            node: 0,
            plan: ["GlobalLimitExec: skip=0, fetch=10 metrics=[output_rows: 10, elapsed_compute: 31395, ]",
                "SortPreservingMergeExec: [ts@0 DESC] metrics=[output_rows: 80, elapsed_compute: 70985, ]",
                "SortExec: TopK(fetch=10), expr=[ts@0 DESC], preserve_partitioning=[true] metrics=[output_rows: 80, elapsed_compute: 1276910, row_replacements: 528, ]",
                "MergeScanExec: peers=[4569845202944(1064, 0), 4569845202945(1064, 1), 4569845202946(1064, 2), 4569845202947(1064, 3), ] metrics=[output_rows: 560, greptime_exec_read_cost: 0, ready_time: 29420046, first_consume_time: 31923679746, finish_time: 170914196024, ]"
            ]
        },
        {
            stage: null,
            node: null,
            plan: ['Total rows: 10']
        }
        ]);
    });
});