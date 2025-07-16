import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { message } from "antd";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string | null;
}

const TransactionPage: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchCategory, setSearchCategory] = useState("");
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null); // ← Form reference

  const token = localStorage.getItem("access");

  const headers = {
    Authorization: `Token ${token}`,
  };

  const showDeleteMessage = () => {
    messageApi.open({ type: "success", content: "Delete successful!" });
  };

  const fetchTransactions = async () => {
    let allTransactions: Transaction[] = [];
    let nextUrl = "http://127.0.0.1:8000/api/transactions/";
    try {
      while (nextUrl) {
        const response = await axios.get(nextUrl, { headers });
        allTransactions = [
          ...allTransactions,
          ...(response.data.results || []),
        ];
        nextUrl = response.data.next;
      }
      setTransactions(allTransactions);
    } catch (err) {
      console.error("Fetch failed", err);
      setTransactions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(
          `http://127.0.0.1:8000/api/transactions/${editingId}/`,
          form,
          { headers }
        );
        messageApi.success("Update successful!");
      } else {
        await axios.post("http://127.0.0.1:8000/api/transactions/", form, {
          headers,
        });
        messageApi.success("Add successful!");
      }

      setForm({
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        category: "",
      });
      setEditingId(null);
      fetchTransactions();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/transactions/${id}/`, {
        headers,
      });
      showDeleteMessage();
      fetchTransactions();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const startEdit = (txn: Transaction) => {
    setEditingId(txn.id);
    setForm({
      description: txn.description,
      amount: txn.amount.toString(),
      date: txn.date,
      category: txn.category || "",
    });

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((txn) =>
    txn.category?.toLowerCase().includes(searchCategory.toLowerCase())
  );

  return (
    <>
      {contextHolder}
      <div className="p-8 bg-[#f4f5f7] min-h-full">
        <h1 className="text-3xl font-semibold mb-6 text-[#1a1a2e]">
          Transaction
        </h1>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"
        >
          <input
            type="text"
            placeholder="Description"
            className="border p-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Amount $"
            className="border p-2"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <input
            type="date"
            className="border p-2"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <select
            className="border p-2"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="" disabled>
              Select category (Optional)
            </option>
            <option value="food">Food</option>
            <option value="transport">Transport</option>
            <option value="entertainment">Entertainment</option>
            <option value="health">Health</option>
            <option value="utilities">Utilities</option>
            <option value="technology">Technology</option>
            <option value="clothing">Clothing</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
          </select>

          <button className="bg-blue-600 cursor-pointer hover:text-amber-100 hover:scale-105 text-white px-4 py-2 rounded col-span-full">
            {editingId ? "Update Transaction" : "Add Transaction"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({
                  description: "",
                  amount: "",
                  date: new Date().toISOString().split("T")[0],
                  category: "",
                });
              }}
              className="text-md text-red-700 cursor-pointer hover:scale-105 underline col-span-full"
            >
              Cancel Edit
            </button>
          )}
        </form>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search transaction by category..."
            className="border p-2 w-full sm:w-[300px]"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
          />
        </div>

        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((txn) => (
                <tr key={txn.id} className="border-t">
                  <td className="p-2 border">{txn.description}</td>
                  <td className="p-2 border">${txn.amount.toFixed(2)}</td>
                  <td className="p-2 border">{txn.date}</td>
                  <td className="p-2 border">
                    {txn.category || "Uncategorized"}
                  </td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => startEdit(txn)}
                      className="bg-yellow-400 px-3 py-1 rounded mr-2 cursor-pointer hover:scale-105"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(txn.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:scale-105 cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TransactionPage;
