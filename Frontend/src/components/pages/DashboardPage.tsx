import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Progress, message } from "antd";
import axios from "axios";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [monthlyStats, setMonthlyStats] = useState<any>(null);
  const token = localStorage.getItem("access");

  useEffect(() => {
    fetchSummary();
    fetchMonthlyStats();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/summary/", {
        headers: { Authorization: `Token ${token}` },
      });
      setSummary(res.data);
    } catch (err) {
      message.error("Failed to load summary");
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/monthly-stats/", {
        headers: { Authorization: `Token ${token}` },
      });
      setMonthlyStats(res.data);
    } catch (err) {
      message.error(" Failed to load monthly trends");
    }
  };

  const getBudgetColor = (spent: number, budget: number) => {
    const percent = (spent / budget) * 100;
    if (percent < 70) return "green";
    if (percent < 90) return "orange";
    return "red";
  };

  return (
    <div className="p-8 bg-[#f4f5f7] min-h-full">
      <h1 className="text-3xl font-semibold mb-6 text-[#1a1a2e]">
        Dashboard Overview
      </h1>

      <Row gutter={24}>
        <Col span={8}>
          <Card bordered={false} className="shadow-md">
            <Statistic
              className="font-bold "
              title="Total Expenses This Month"
              value={summary?.total_expense || 0}
              precision={2}
              prefix="$"
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-md">
            <Statistic
              className="font-bold "
              title="Budget"
              value={summary?.budget || 0}
              precision={2}
              prefix="$"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false} className="shadow-md">
            <Statistic
              title="Remaining Budget"
              className="font-bold "
              value={(summary?.budget || 0) - (summary?.total_expense || 0)}
              precision={2}
              prefix="$"
              valueStyle={{ color: "#1890ff" }}
            />
            <Progress
              percent={parseFloat(
                Math.min(
                  ((summary?.total_expense || 0) / (summary?.budget || 1)) *
                    100,
                  100
                ).toFixed(2)
              )}
              status="active"
              strokeColor={getBudgetColor(
                summary?.total_expense || 0,
                summary?.budget || 1
              )}
              className="mt-2"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24} className="mt-8">
        <Col span={12}>
          <Card
            title="📂 Category-wise Expenses"
            bordered={false}
            className="shadow-sm"
          >
            {summary?.expenses_by_category?.length > 0 ? (
              <Pie
                data={{
                  labels: summary.expenses_by_category.map(
                    (item: any) => item.category
                  ),
                  datasets: [
                    {
                      data: summary.expenses_by_category.map(
                        (item: any) => item.total
                      ),
                      backgroundColor: [
                        "#36A2EB",
                        "#FF6384",
                        "#FFCE56",
                        "#4BC0C0",
                        "#9966FF",
                        "#FF9F40",
                      ],
                    },
                  ],
                }}
              />
            ) : (
              <p className="text-center text-gray-500">
                No category breakdown available.
              </p>
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title="📈 Monthly Trends"
            bordered={false}
            className="shadow-sm"
          >
            {monthlyStats?.length > 0 ? (
              <Line
                data={{
                  labels: monthlyStats.map((item: any) => item.month),
                  datasets: [
                    {
                      label: "Expenses",
                      data: monthlyStats.map((item: any) => item.total),
                      borderColor: "#1890ff",
                      backgroundColor: "rgba(24, 144, 255, 0.2)",
                      fill: true,
                      tension: 0.4,
                    },
                  ],
                }}
              />
            ) : (
              <p className="text-center text-gray-500">
                No monthly trend data available.
              </p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
