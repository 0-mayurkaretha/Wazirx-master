import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // Import CSS file

function App() {
  const [tickers, setTickers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:4000/getTickers")
      .then((response) => {
        console.log("Response Data:", response.data);
        setTickers(response.data || []);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data");
      });
  }, []);

  return (
    <div className="app-container">
      <h1>WazirX Tickers</h1>
      {error && <p className="error">{error}</p>}
      <table className="ticker-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Last</th>
            <th>Buy</th>
            <th>Sell</th>
            <th>Volume</th>
            <th>Base Unit</th>
          </tr>
        </thead>
        <tbody>
          {tickers.length > 0 ? (
            tickers.map((ticker, index) => (
              <tr key={index}>
                <td>{ticker.name}</td>
                <td>{ticker.last}</td>
                <td>{ticker.buy}</td>
                <td>{ticker.sell}</td>
                <td>{ticker.volume}</td>
                <td>{ticker.baseUnit}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
