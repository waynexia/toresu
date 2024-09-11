import { describe, it, expect } from 'vitest';
import { parsePlanProperties, PlanProperties } from './nodeParser';

describe('parsePlanProperties', () => {
    it('should parse a single line correctly', () => {
        const line = 'GlobalLimitExec: skip=0, fetch=10 metrics=[output_rows: 10, elapsed_compute: 1708490, ]';
        const expected: PlanProperties = {
            name: 'GlobalLimitExec',
            prop: 'skip=0, fetch=10',
            metrics: {
                output_rows: 10,
                elapsed_compute: 1708490
            }
        };
        expect(parsePlanProperties(line)).toEqual(expected);
    });

    it('should parse another line correctly', () => {
        const line = 'SortPreservingMergeExec: [ts@0 DESC] metrics=[output_rows: 80, elapsed_compute: 70985, ]';
        const expected: PlanProperties = {
            name: 'SortPreservingMergeExec',
            prop:
                '[ts@0 DESC]',
            metrics: {
                output_rows: 80,
                elapsed_compute: 70985
            }
        };
        expect(parsePlanProperties(line)).toEqual(expected);
    });

    it('should handle complex prop and metrics correctly', () => {
        const line = 'MergeScanExec: peers=[4569845202944(1064, 0), 4569845202945(1064, 1), 4569845202946(1064, 2), 4569845202947(1064, 3), ] metrics=[output_rows: 560, greptime_exec_read_cost: 0, ready_time: 29420046, first_consume_time: 31923679746, finish_time: 170914196024, ]';
        const expected: PlanProperties = {
            name: 'MergeScanExec',
            prop: 'peers=[4569845202944(1064, 0), 4569845202945(1064, 1), 4569845202946(1064, 2), 4569845202947(1064, 3), ]',
            metrics: {
                output_rows: 560,
                greptime_exec_read_cost: 0,
                ready_time: 29420046,
                first_consume_time: 31923679746,
                finish_time: 170914196024
            }
        };
        expect(parsePlanProperties(line)).toEqual(expected);
    });
});