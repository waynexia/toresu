import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, Tooltip } from 'antd';
import { PlanProperties } from './utils/nodeParser';


const PlanNode: React.FC<PlanProperties> = ({ data }) => {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div>
                <Tooltip title={data.prop}>
                    <Card title={data.name} bodyStyle={{ padding: "0" }} >
                        {Object.entries(data.metrics).map(([key, value]) => (
                            <p key={key} style={{ margin: "5px" }}>
                                {key}: {value}
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
