// dashboard/frontend/src/App.js
import React, { useState, useEffect } from "react";

function App() {
  const [arbitrages, setArbitrages] = useState([]);

  useEffect(() => {
    fetch("/api/arbitrages")
      .then((res) => res.json())
      .then((data) => setArbitrages(data.data));
  }, []);

  return (
    <div>
      <h1>🔍 Поиск вилок</h1>
      <table>
        <thead>
          <tr>
            <th>Событие</th>
            <th>Прибыль (%)</th>
            <th>Букмекеры</th>
          </tr>
        </thead>
        <tbody>
          {arbitrages.map((arb, idx) => (
            <tr key={idx}>
              <td>{arb.event}</td>
              <td>{arb.profit}</td>
              <td>{arb.bookmakers.join(" vs ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;