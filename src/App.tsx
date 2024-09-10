import { useState } from 'react'
import './App.css'
import ExplainAnalyzeParser from './ExplainAnalyzeParser'
import { ExplainAnalyzeRow } from './utils/parser';
import PlanTree from './PlanTree';

function App() {
  const [parsedData, setParsedData] = useState([])

  const handleParsedData = (data: ExplainAnalyzeRow[]) => {
    setParsedData(data);
  };

  return (
    <div>
      <h1>EXPLAIN ANALYZE Parser</h1>
      <ExplainAnalyzeParser onParse={handleParsedData} />
      <PlanTree rows={parsedData} />
      {parsedData.length > 0 && (
        <div>
          <h2>Parsed Data:</h2>
          <pre>{JSON.stringify(parsedData, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default App
