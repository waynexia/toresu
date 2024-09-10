import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { parseExplainAnalyzeOutput } from './utils/parser';

const { TextArea } = Input;

const ExplainAnalyzeParser: React.FC = () => {
  const [input, setInput] = useState('');
  const [wrap, setWrap] = useState(false);
  const [parsedData, setParsedData] = useState(null);

  const handleSubmit = () => {
    const parsed = parseExplainAnalyzeOutput(input);
    setParsedData(parsed);
    console.log('Parsed data:', parsed);
  };

  const addLineNumbers = (text: string) => {
    return text.split('\n').map((line, index) => `${index + 1} ${line}`).join('\n');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <Button
          icon={<i className="fas fa-wrap"></i>}
          onClick={() => setWrap(!wrap)}
          style={{ backgroundColor: 'white', color: 'black' }}
        >
          {wrap ? 'Unwrap' : 'Wrap'}
        </Button>
      </div>
      <TextArea
        rows={10}
        value={addLineNumbers(input)}
        onChange={(e) => setInput(e.target.value.replace(/^\d+\s/gm, ''))}
        placeholder="Paste your EXPLAIN ANALYZE output here..."
        style={{
          fontFamily: 'monospace',
          whiteSpace: wrap ? 'pre-wrap' : 'pre',
          overflowX: wrap ? 'auto' : 'scroll',
        }}
      />
      <Button type="primary" onClick={handleSubmit} style={{ marginTop: '10px' }}>
        Submit
      </Button>
      {parsedData && (
        <pre style={{ marginTop: '20px' }}>
          {JSON.stringify(parsedData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ExplainAnalyzeParser;
