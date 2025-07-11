import React, { useState } from "react";
import axios from "axios";
import { message } from "antd";

const SmartClassifier: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const [description, setDescription] = useState("");
  const [predictedCategory, setPredictedCategory] = useState("");
  const [limeExplanation, setLimeExplanation] = useState<string[][]>([]);
  const [htmlExplanation, setHtmlExplanation] = useState("");

  const token = localStorage.getItem("access");

  const headers = {
    Authorization: `Token ${token}`,
  };

  const classify = async () => {
    if (!description.trim()) {
      messageApi.open({
        type: "error",
        content: "please give input",
      });
      return;
    }

    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/classify-transaction/",
        {
          headers,
          params: { text: description },
        }
      );
      setPredictedCategory(res.data.category);
    } catch (err) {
      console.error("Classification error", err);
    }
  };

  const explainWithLime = async () => {
    if (!description.trim()) {
      messageApi.open({
        type: "error",
        content: "please give input",
      });
      return;
    }

    messageApi.open({
      type: "info",
      content: "please wait!",
    });
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/xai/", {
        headers,
        params: { text: description },
      });
      setLimeExplanation(res.data.explanation);
    } catch (err) {
      console.error("LIME explanation error", err);
    }
  };

  const fetchHtmlExplanation = async () => {
    if (!description.trim()) {
      messageApi.open({
        type: "error",
        content: "please give input",
      });
      return;
    }
    messageApi.open({
      type: "info",
      content: "please wait!",
    });
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/xai/html/", {
        headers,
        params: { text: description },
      });
      setHtmlExplanation(res.data);
    } catch (err) {
      console.error("HTML explanation error", err);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="p-8 bg-[#f4f5f7] min-h-full">
        <h1 className="text-3xl font-semibold mb-6 text-[#1a1a2e]">
          Smart Classification
        </h1>

        <input
          type="text"
          placeholder="Enter transaction description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full mb-4"
        />

        <div className="flex gap-2 justify-center mb-6">
          <button
            onClick={classify}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:scale-105  cursor-pointer"
          >
            Predict Category
          </button>
          <button
            onClick={explainWithLime}
            className="bg-green-600 text-white px-4 py-2 rounded hover:scale-105  cursor-pointer"
          >
            Explain with LIME
          </button>
          <button
            onClick={fetchHtmlExplanation}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:scale-105  cursor-pointer"
          >
            View HTML Explanation
          </button>
        </div>

        {predictedCategory && (
          <div className="mb-6">
            <p className="text-lg">
              🏷️ Predicted Category: <strong>{predictedCategory}</strong>
            </p>
          </div>
        )}

        {limeExplanation.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold">LIME Explanation:</h2>
            <ul className="list-disc pl-5">
              {limeExplanation.map(([feature, weight], index) => (
                <li key={index}>
                  <strong>{feature}</strong>: {parseFloat(weight).toFixed(4)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {htmlExplanation && (
          <div className="mb-6">
            <h2 className="font-bold mb-2">HTML Explanation (LIME):</h2>
            <iframe
              srcDoc={htmlExplanation}
              title="LIME Explanation"
              className="w-full h-[500px] border"
            />
          </div>
        )}
      </div>
    </>
  );
};

export default SmartClassifier;
