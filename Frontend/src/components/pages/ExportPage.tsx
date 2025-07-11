import React, { useState } from "react";
import axios from "axios";
import { message } from "antd";

const ExportPage: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const token = localStorage.getItem("access");

  const headers = {
    Authorization: `Token ${token}`,
  };

  const [filters, setFilters] = useState({
    start: "",
    end: "",
    category: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleExport = async (format: "pdf" | "csv") => {
    if (!filters.start || !filters.end) {
      messageApi.open({
        type: "error",
        content: "Please select both start and end date",
      });
      return;
    }

    const params = new URLSearchParams({
      start: filters.start,
      end: filters.end,
    });

    if (filters.category) {
      params.append("category", filters.category);
    }

    messageApi.open({
      type: "success",
      content: "Downloaded successfully",
    });
    const url = `http://127.0.0.1:8000/api/export/${format}/?${params.toString()}`;

    try {
      const response = await axios.get(url, {
        headers,
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: format === "pdf" ? "application/pdf" : "text/csv",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `transactions.${format}`;
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  return (
    <div className="p-8 bg-[#f4f5f7] min-h-full">
      {contextHolder}
      <h1 className="text-3xl font-semibold mb-6 text-[#1a1a2e]">
        Export Transaction
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-1">Start Date</label>
          <input
            type="date"
            name="start"
            value={filters.start}
            onChange={handleChange}
            className="w-full border p-2"
          />
        </div>
        <div>
          <label className="block mb-1">End Date</label>
          <input
            type="date"
            name="end"
            value={filters.end}
            onChange={handleChange}
            className="w-full border p-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block mb-1">Category (optional)</label>
          <input
            type="text"
            name="category"
            value={filters.category}
            onChange={handleChange}
            placeholder="e.g. food, bills"
            className="w-full border p-2"
          />
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => {
            handleExport("pdf");
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:scale-105  cursor-pointer"
        >
          Download PDF
        </button>
        <button
          onClick={() => handleExport("csv")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:scale-105  cursor-pointer"
        >
          Download CSV
        </button>
      </div>
    </div>
  );
};

export default ExportPage;
