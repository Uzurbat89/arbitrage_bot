import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import './App.css';

function ProfitChart({ arbitrages }) {
  const data = {
    labels: ['<3%', '3-5%', '5-7%', '>7%'],
    datasets: [{
      data: [
        arbitrages.filter(a => a.profit < 3).length,
        arbitrages.filter(a => a.profit >= 3 && a.profit < 5).length,
        arbitrages.filter(a => a.profit >= 5 && a.profit < 7).length,
        arbitrages.filter(a => a.profit >= 7).length
      ],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
    }]
  };

  return <Pie data={data} />;
}

function ArbitrageTable() {
  const [arbitrages, setArbitrages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sportFilter, setSportFilter] = useState('Все');
  const [isLive, setIsLive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLive) {
      const ws = new WebSocket('ws://localhost:8000/ws');
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setArbitrages(data);
        setLoading(false);
      };

      return () => ws.close();
    } else {
      fetch(`/api/arbitrages?is_live=${isLive}`)
        .then(res => {
          if (!res.ok) throw new Error('Ошибка сервера');
          return res.json();
        })
        .then(data => {
          setArbitrages(data.data || []);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [isLive]);

  const sports = ['Все', ...new Set(arbitrages.map(a => a.sport))];
  const filteredData = sportFilter === 'Все' 
    ? arbitrages 
    : arbitrages.filter(a => a.sport === sportFilter);

  // Стили
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const thStyle = {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd'
  };

  const tdStyle = {
    padding: '10px',
    borderBottom: '1px solid #ddd'
  };

  const trHoverStyle = {
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  };

  if (loading) return <div style={{ padding: '20px' }}>Загрузка данных...</div>;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>Ошибка: {error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#2c3e50', textAlign: 'center' }}>🔍 Арбитражные вилки</h1>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div>
          <label style={{ marginRight: '10px' }}>Тип: </label>
          <button
            onClick={() => setIsLive(false)}
            style={{ 
              background: !isLive ? '#2c3e50' : '#ccc',
              color: 'white',
              padding: '5px 10px',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Прематч
          </button>
          <button
            onClick={() => setIsLive(true)}
            style={{ 
              background: isLive ? '#e74c3c' : '#ccc',
              color: 'white',
              padding: '5px 10px',
              marginLeft: '5px',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Live
          </button>
        </div>

        <div>
          <label style={{ marginRight: '10px' }}>Спорт: </label>
          <select 
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            {sports.map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredData.length > 0 ? (
        <>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Событие</th>
                <th style={thStyle}>Прибыль (%)</th>
                <th style={thStyle}>Букмекеры</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((arb, idx) => (
                <tr 
                  key={idx} 
                  style={trHoverStyle}
                  onClick={() => navigate(`/arbitrage/${idx}`)}
                >
                  <td style={tdStyle}>{arb.event}</td>
                  <td style={{ 
                    ...tdStyle, 
                    color: arb.profit > 5 ? 'green' : 'orange',
                    fontWeight: 'bold'
                  }}>
                    {arb.profit}%
                  </td>
                  <td style={tdStyle}>
                    {arb.bookmakers.join(" vs ")}
                    <span style={{ 
                      float: 'right', 
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {arb.bookmakers.length} БК
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '40px', width: '300px' }}>
            <h3>Распределение вилок</h3>
            <ProfitChart arbitrages={filteredData} />
          </div>
        </>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px'
        }}>
          На данный момент активных вилок не обнаружено
        </div>
      )}
    </div>
  );
}

function ArbitrageDetails() {
  const { id } = useParams();
  const [arbitrage, setArbitrage] = useState(null);

  useEffect(() => {
    fetch(`/api/arbitrage/${id}`)
      .then(res => res.json())
      .then(data => setArbitrage(data));
  }, [id]);

  if (!arbitrage) return <div style={{ padding: '20px' }}>Загрузка...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#2c3e50' }}>{arbitrage.event}</h2>
      <div style={{ marginTop: '20px' }}>
        <p><strong>Прибыль:</strong> <span style={{ color: arbitrage.profit > 5 ? 'green' : 'orange' }}>{arbitrage.profit}%</span></p>
        <p><strong>Букмекеры:</strong> {arbitrage.bookmakers.join(", ")}</p>
        <p><strong>Спорт:</strong> {arbitrage.sport}</p>
        <button 
          onClick={() => window.history.back()}
          style={{
            marginTop: '20px',
            padding: '8px 15px',
            backgroundColor: '#2c3e50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Назад
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ArbitrageTable />} />
        <Route path="/arbitrage/:id" element={<ArbitrageDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;