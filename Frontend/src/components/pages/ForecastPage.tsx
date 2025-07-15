import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

interface ForecastItem {
  month: string;
  forecasted_expense: number;
}

const ForecastPage: React.FC = () => {
  const [forecastData, setForecastData] = useState<ForecastItem[]>([]);
  const [error, setError] = useState<string>("");

  const token = localStorage.getItem("access");

  const headers = {
    Authorization: `Token ${token}`,
  };

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/forecast/", {
          headers,
        });

        const forecast = res.data.forecast;
        console.log("Forecast API response:", forecast);

        if (forecast?.error) {
          setError(forecast.error);
          setForecastData([]);
        } else if (Array.isArray(forecast)) {
          setForecastData(forecast);
          setError("");
        } else {
          setError("Unexpected forecast format.");
          setForecastData([]);
        }
      } catch (err) {
        console.error("Forecast error", err);
        setError("Failed to load forecast. Please try again later.");
        setForecastData([]);
      }
    };

    fetchForecast();
  }, []);

  const chartData = {
    labels: forecastData.map((item) => item.month),
    datasets: [
      {
        label: "Forecasted Expense (in $)",
        data: forecastData.map((item) => item.forecasted_expense),
        fill: false,
        borderColor: "#1890ff",
        backgroundColor: "rgba(24, 144, 255, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Monthly Expense Forecast",
      },
    },
  };

  return (
    <div className="p-8 bg-[#f4f5f7] h-[100vh]">
      <h1 className="text-3xl font-semibold mb-6 text-[#1a1a2e]">Forecast</h1>

      {error && (
        <div className="bg-yellow-100 text-yellow-800 p-4 mb-4 rounded">
          <p className="text-center">{error}</p>
        </div>
      )}

      {!error && forecastData.length > 0 && (
        <div className="bg-white p-4 shadow rounded">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default ForecastPage;
