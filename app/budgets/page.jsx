"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    category_id: "",
    monthly_limit: "",
  });

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  // Fetch budgets
  const fetchBudgets = async () => {
    try {
      const res = await fetch("/api/budgets");

      const data = await res.json();

      if (data.success) {
        setBudgets(data.budgets);
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");

      const data = await res.json();

      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handle input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Create budget
  const handleCreateBudget = async () => {
    try {
      if (
        !formData.category_id ||
        !formData.monthly_limit
      ) {
        alert("Please fill all fields");
        return;
      }

      const res = await fetch("/api/budgets", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          category_id: Number(
            formData.category_id
          ),

          monthly_limit: Number(
            formData.monthly_limit
          ),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to create budget"
        );
      }

      if (data.success) {
        await fetchBudgets();

        setFormData({
          category_id: "",
          monthly_limit: "",
        });

        alert("Budget created");
      }
    } catch (error) {
      console.error(error);

      alert(error.message);
    }
  };

  // Total saved
 const totalSaved = budgets.reduce(
  (acc, budget) => {
    return acc + budget.remaining;
  },
  0
);

  // Progress color
  const getProgressColor = (budget) => {
    if (budget.isOverBudget) {
      return "bg-red-500";
    }

    if (budget.percentage > 75) {
      return "bg-yellow-400";
    }

    return "bg-green-400";
  };

  // Text color
  const getTextColor = (budget) => {
    if (budget.isOverBudget) {
      return "text-red-400";
    }

    if (budget.percentage > 75) {
      return "text-yellow-400";
    }

    return "text-green-400";
  };

  return (
    <div className="flex min-h-screen bg-[#05070d] text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-semibold">
              Budgets
            </h2>

            <p className="text-gray-500 text-sm">
              {new Date().toLocaleString(
                "default",
                {
                  month: "long",
                  year: "numeric",
                }
              )}
            </p>
          </div>

         
        </div>

        {/* Create Budget */}
        <div className="bg-[#0b1220] border border-green-500/20 p-6 rounded-xl mb-8 shadow-lg shadow-green-500/10">
          <h3 className="text-lg font-semibold mb-4">
            Create New Budget Limit
          </h3>

          <div className="grid grid-cols-3 gap-4">
            {/* Categories */}
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="bg-[#020617] border border-[#1e293b] p-3 rounded-lg"
            >
              <option value="">
                Select category
              </option>

              {categories.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.id}
                >
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Limit */}
            <input
              type="number"
              name="monthly_limit"
              value={formData.monthly_limit}
              onChange={handleChange}
              className="bg-[#020617] border border-[#1e293b] p-3 rounded-lg"
              placeholder="Enter amount"
            />

            {/* Button */}
            <button
              onClick={handleCreateBudget}
              className="bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg"
            >
              Confirm Limit
            </button>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="text-center text-gray-400 mt-20">
            Loading budgets...
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            No budgets found.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                className="bg-[#0b1220] border border-[#1e293b] p-6 rounded-xl shadow-lg"
              >
                {/* Title */}
                <h3 className="text-xl font-semibold">
                  {budget.category}
                </h3>

                <p className="text-gray-500 text-sm mb-4">
                  Monthly spending budget
                </p>

                {/* Amounts */}
                <div className="flex justify-between text-sm mb-2">
                  <span
                    className={
                      budget.isOverBudget
                        ? "text-red-400"
                        : "text-white"
                    }
                  >
                    ₹
                    {budget.spent.toLocaleString()}
                  </span>

                  <span>
                    ₹
                    {budget.limit.toLocaleString()}
                  </span>
                </div>

                {/* Progress */}
                <div className="w-full bg-gray-800 h-2 rounded overflow-hidden">
                  <div
                    className={`h-2 rounded ${getProgressColor(
                      budget
                    )}`}
                    style={{
                      width: `${budget.percentage}%`,
                    }}
                  />
                </div>

                {/* Status */}
                <p
                  className={`text-sm mt-2 ${getTextColor(
                    budget
                  )}`}
                >
                  {budget.isOverBudget
                    ? "Over budget"
                    : budget.percentage > 75
                    ? `₹${budget.remaining.toLocaleString()} remaining`
                    : "Well under limit"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Insight */}
        <div className="mt-8 bg-green-500/10 border border-green-500/20 p-6 rounded-xl flex justify-between items-center">
          <div>
            <h3 className="text-green-400 text-lg font-semibold">
              Spending Insight
            </h3>

            <p className="text-gray-400 text-sm">
              You saved ₹
              {totalSaved.toLocaleString()} this
              month by staying under budget.
            </p>
          </div>

          <div className="flex gap-3">
           
          </div>
        </div>
      </main>
    </div>
  );
}