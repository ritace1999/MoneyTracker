import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import DashboardPage from "./DashboardPage";
import TransactionPage from "./TransactionPage";
import SmartClassifier from "./SmartClassifier";
import ForecastPage from "./ForecastPage";
import ExportPage from "./ExportPage";
import BudgetManagementPage from "./BudgetManagementPage";
import { message } from "antd";
import {
  BarChartOutlined,
  FileTextOutlined,
  LogoutOutlined,
  PieChartOutlined,
  SettingOutlined,
  DollarOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

const MainPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const logout = () => {
    messageApi.success("Logged out successfully!");
    localStorage.removeItem("access");
    setTimeout(() => navigate("/login"), 1500);
  };

  useEffect(() => {
    if (!localStorage.getItem("access")) {
      messageApi.error("Please login to continue.");
      navigate("/login");
    }
  }, []);

  return (
    <>
      {contextHolder}
      <div className="flex h-screen overflow-hidden font-sans">
        {/* Sidebar */}
        <div className="w-[240px] bg-[#111827]  text-white flex flex-col p-6 shadow-lg">
          <h1 className="text-xl font-bold mb-8 tracking-wider text-green-400">
            MoneyTracker
          </h1>

          <nav className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center cursor-pointer gap-2 hover:text-green-400 transition"
            >
              <PieChartOutlined />
              Dashboard
            </button>
            <button
              onClick={() => navigate("/transaction")}
              className="flex items-center cursor-pointer gap-2 hover:text-green-400 transition"
            >
              <BarChartOutlined />
              Transactions
            </button>
            <button
              onClick={() => navigate("/classifier")}
              className="flex items-center gap-2 cursor-pointer hover:text-green-400 transition"
            >
              <ThunderboltOutlined />
              Classifier
            </button>
            <button
              onClick={() => navigate("/forecast")}
              className="flex items-center gap-2 cursor-pointer hover:text-green-400 transition"
            >
              <DollarOutlined />
              Forecast
            </button>
            <button
              onClick={() => navigate("/export")}
              className="flex items-center gap-2 cursor-pointer hover:text-green-400 transition"
            >
              <FileTextOutlined />
              Export
            </button>
            <button
              onClick={() => navigate("/budget")}
              className="flex items-center gap-2 cursor-pointer hover:text-green-400 transition"
            >
              <SettingOutlined />
              Budget
            </button>
          </nav>

          <div className="mt-auto pt-10 border-t border-gray-700">
            <button
              onClick={logout}
              className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-500 transition"
            >
              <LogoutOutlined />
              Log Out
            </button>
          </div>
        </div>

        {/* Right Main View */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="p-4">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/transaction" element={<TransactionPage />} />
              <Route path="/classifier" element={<SmartClassifier />} />
              <Route path="/forecast" element={<ForecastPage />} />
              <Route path="/export" element={<ExportPage />} />
              <Route path="/budget" element={<BudgetManagementPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
