"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import DashboardLayout from '../dashboard/layout'

export default function BudgetsPage() {
  const [budgets,    setBudgets]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [formData,   setFormData]   = useState({ category_id: "", monthly_limit: "" });

  // Edit state
  const [editingBudget, setEditingBudget] = useState(null);
  const [editLimit,     setEditLimit]     = useState("");

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    try {
      const now  = new Date();
      const res  = await fetch(`/api/budgets?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
      const data = await res.json();
      // API returns { success: true, budgets: [...] }
      setBudgets(data.budgets || []);
    } catch (err) {
      console.error("fetchBudgets:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res  = await fetch("/api/categories");
      const data = await res.json();
      // API returns { success: true, categories: [...] }
      setCategories(data.categories || []);
    } catch (err) {
      console.error("fetchCategories:", err);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateBudget = async () => {
    if (!formData.category_id || !formData.monthly_limit) {
      alert("Please fill all fields");
      return;
    }
    try {
      const now = new Date();
      const res = await fetch("/api/budgets", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id:   Number(formData.category_id),
          monthly_limit: Number(formData.monthly_limit),
          month:         now.getMonth() + 1,
          year:          now.getFullYear(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create budget");
      await fetchBudgets();
      setFormData({ category_id: "", monthly_limit: "" });
      alert("Budget created");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditSave = async () => {
    if (!editLimit || Number(editLimit) <= 0) {
      alert("Enter a valid amount");
      return;
    }
    try {
      const now = new Date();
      const res = await fetch("/api/budgets", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id:   editingBudget.category_id,
          monthly_limit: Number(editLimit),
          month:         now.getMonth() + 1,
          year:          now.getFullYear(),
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchBudgets();
      setEditingBudget(null);
      setEditLimit("");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this budget?")) return;
    try {
      await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      await fetchBudgets();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  // API already calculates these — just use them directly
  const getProgressColor = (b) => {
    if (b.isOverBudget)    return "bg-red-500";
    if (b.percentage > 75) return "bg-yellow-400";
    return "bg-green-400";
  };

  const getTextColor = (b) => {
    if (b.isOverBudget)    return "text-red-400";
    if (b.percentage > 75) return "text-yellow-400";
    return "text-green-400";
  };

  const totalSaved = budgets.reduce((acc, b) =>
    acc + (b.remaining > 0 ? b.remaining : 0), 0);

  return (
    <DashboardLayout>
    <div className="flex min-h-screen bg-[#05070d] text-white">
    
      <main className="flex-1 p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-semibold">Budgets</h2>
            <p className="text-gray-500 text-sm">
              {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Create form */}
        <div className="bg-[#0b1220] border border-green-500/20 p-6 rounded-xl mb-8 shadow-lg shadow-green-500/10">
          <h3 className="text-lg font-semibold mb-4">Create New Budget Limit</h3>
          <div className="grid grid-cols-3 gap-4">
            <select name="category_id" value={formData.category_id} onChange={handleChange}
              className="bg-[#020617] border border-[#1e293b] p-3 rounded-lg text-sm outline-none focus:border-[#22C55E]">
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input type="number" name="monthly_limit" value={formData.monthly_limit}
              onChange={handleChange} placeholder="Enter amount (₹)"
              className="bg-[#020617] border border-[#1e293b] p-3 rounded-lg text-sm outline-none focus:border-[#22C55E]" />
            <button onClick={handleCreateBudget}
              className="bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg">
              Confirm Limit
            </button>
          </div>
        </div>

        {/* Budget cards */}
        {loading ? (
          <div className="text-center text-gray-400 mt-20">Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">No budgets found. Create one above.</div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {budgets.map(budget => {
              const isEditing = editingBudget?.id === budget.id;
              return (
                <div key={budget.id}
                  className="bg-[#0b1220] border border-[#1e293b] p-6 rounded-xl shadow-lg">

                  {/* Title + actions */}
                  <div className="flex items-start justify-between mb-1">
                    {/* API returns 'category' field */}
                    <h3 className="text-xl font-semibold">{budget.category}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingBudget(budget); setEditLimit(budget.limit); }}
                        className="text-[#64748B] hover:text-[#22C55E] text-xs px-2 py-1 rounded hover:bg-green-500/10 transition-all">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="text-[#64748B] hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-500/10 transition-all">
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm mb-4">Monthly spending budget</p>

                  {/* Inline edit */}
                  {isEditing && (
                    <div className="flex gap-2 mb-4">
                      <input type="number" value={editLimit}
                        onChange={e => setEditLimit(e.target.value)}
                        className="flex-1 bg-[#020617] border border-[#22C55E] rounded-lg px-3 py-2 text-sm outline-none"
                        placeholder="New limit (₹)" autoFocus />
                      <button onClick={handleEditSave}
                        className="bg-[#22C55E] text-black text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#16A34A]">
                        Save
                      </button>
                      <button onClick={() => { setEditingBudget(null); setEditLimit(""); }}
                        className="bg-[#1e293b] text-gray-400 text-xs px-3 py-2 rounded-lg hover:bg-[#334155]">
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Amounts — API has 'limit' not 'monthly_limit' */}
                  <div className="flex justify-between text-sm mb-2">
                    <span className={budget.isOverBudget ? "text-red-400" : "text-white"}>
                      ₹{Number(budget.spent).toLocaleString()}
                    </span>
                    <span>₹{Number(budget.limit).toLocaleString()}</span>
                  </div>

                  {/* Progress — API gives 'percentage' directly */}
                  <div className="w-full bg-gray-800 h-2 rounded overflow-hidden">
                    <div
                      className={`h-2 rounded ${getProgressColor(budget)}`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>

                  {/* Status */}
                  <p className={`text-sm mt-2 ${getTextColor(budget)}`}>
                    {budget.isOverBudget
                      ? `Over budget by ₹${Math.abs(budget.remaining).toLocaleString()}`
                      : budget.percentage > 75
                      ? `₹${Number(budget.remaining).toLocaleString()} remaining`
                      : "Well under limit"}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Insight */}
        <div className="mt-8 bg-green-500/10 border border-green-500/20 p-6 rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-green-400 text-lg font-semibold">Spending Insight</h3>
            <p className="text-gray-400 text-sm">
              You saved ₹{totalSaved.toLocaleString()} this month by staying under budget.
            </p>
          </div>
        </div>
      </main>
    </div>
    </DashboardLayout>
  );
}