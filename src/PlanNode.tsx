import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, Tooltip } from 'antd';
import { PlanProperties } from './utils/nodeParser';
import prettyMilliseconds from 'pretty-ms';
import prettyBytes from 'pretty-bytes';


const metricsHook = (key: string, v: number): string => {
    switch (key) {
        case 'elapsed_compute':
        case 'ready_time':
        case 'first_consume_time':
        case 'finish_time':
        case 'fetch_time':
        case 'repart_time':
        case 'elapsed_await':
        case 'elapsed_poll':
            return prettyMilliseconds(v * 1.0 / 1000000.0, { formatSubMilliseconds: true, compact: true })
        case 'spilled_bytes':
        case 'mem_used':
            return prettyBytes(v)
        default:
            return v.toString();
    }
};

const PlanNode: React.FC<PlanProperties> = ({ data }) => {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div>
                <Tooltip title={data.prop}>
                    <Card title={data.name} bodyStyle={{ padding: "0" }} >
                        {Object.entries(data.metrics).map(([key, value]) => (
                            <p key={key} style={{ margin: "5px" }}>
                                {key}: {metricsHook(key, value)}
                            </p>
                        ))}
                    </Card>
                </Tooltip>
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>
    );
};

export default PlanNode;
