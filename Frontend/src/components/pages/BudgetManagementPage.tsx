import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { message } from "antd";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BudgetData {
  status: string;
  spent: number;
  budget: number;
}

const BudgetManagementPage: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [newBudget, setNewBudget] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const token = localStorage.getItem("access");

  const headers = {
    Authorization: `Token ${token}`,
  };

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/budget/alert/", {
          headers,
        });
        setBudgetData(res.data);
      } catch (error) {
        console.error("Error fetching budget alert:", error);
      }
    };

    fetchBudgetData();
  }, []);

  const handleUpdateBudget = async () => {
    if (!newBudget) {
      messageApi.open({
        type: "error",
        content: "Please give some value to update",
      });
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        "http://127.0.0.1:8000/api/budget/update/",
        { monthly_budget: parseFloat(newBudget) },
        { headers }
      );
      messageApi.open({
        type: "success",
        content: "Budget updated successfully",
      });
      setNewBudget("");
      const res = await axios.get("http://127.0.0.1:8000/api/budget/alert/", {
        headers,
      });
      setBudgetData(res.data);
    } catch (error) {
      alert("Failed to update budget.");
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";
    if (status.includes("Over")) return "bg-red-200 text-red-800";
    if (status.includes("Close")) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const chartData = {
    labels: ["Budget", "Spent"],
    datasets: [
      {
        label: "$",
        data: [budgetData?.budget || 0, budgetData?.spent || 0],
        backgroundColor: ["#3b82f6", "#ef4444"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Budget vs Actual Spend" },
    },
  };

  return (
    <div className="p-8 bg-[#f4f5f7] min-h-full">
      {contextHolder}
      <h1 className="text-3xl font-semibold mb-6 text-[#1a1a2e]">
        Budget Management
      </h1>

      {budgetData && (
        <div
          className={`p-4 rounded mb-4 font-semibold ${getAlertColor(
            budgetData.status
          )}`}
        >
          <p className="text-center">
            {budgetData.status} — You’ve spent
            <span className="text-red-700"> ${budgetData.spent} </span>of your{" "}
            <span className="text-red-700">${budgetData.budget} </span>
            monthly budget (
            <span className="text-red-700 underline">
              {((budgetData.spent / budgetData.budget) * 100).toFixed(2)}%
            </span>
            )
          </p>
        </div>
      )}

      <h2 className="text-xl font-semibold mt-6 mb-2">Budget Settings</h2>
      <div className="flex gap-4 mb-4">
        <input
          type="number"
          value={newBudget}
          onChange={(e) => setNewBudget(e.target.value)}
          placeholder="Update Budget ($)"
          className="border px-3 py-2 rounded w-full"
        />
        <button
          onClick={handleUpdateBudget}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:scale-105  cursor-pointer"
        >
          {loading ? "Saving..." : "Save Budget"}
        </button>
      </div>

      <div className="bg-white shadow p-4 rounded">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default BudgetManagementPage;
