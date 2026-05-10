"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    amount: "",
    expense_date: "",
    category_id: "",
    description: "",
  });

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const res = await fetch("/api/expenses");

      const data = await res.json();

      if (data.success) {
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
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
      console.error("Error fetching categories:", error);
    }
  };

  // Handle form change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Save expense
  const handleSubmit = async () => {
    try {
      // Validation
      if (
        !formData.amount ||
        !formData.category_id ||
        !formData.expense_date
      ) {
        alert("Please fill all required fields");
        return;
      }

      const res = await fetch("/api/expenses", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
          category_id: Number(formData.category_id),
        }),
      });

      const data = await res.json();

      console.log(data);

      if (!res.ok) {
        throw new Error(
          data.error || "Something went wrong"
        );
      }

      if (data.success) {
        // Refresh table
        await fetchExpenses();

        // Reset form
        setFormData({
          amount: "",
          expense_date: "",
          category_id: "",
          description: "",
        });

        alert("Expense added successfully");
      }
    } catch (error) {
      console.error("Error saving expense:", error);

      alert(error.message);
    }
  };

  // Total spent
  const totalSpent = expenses.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0
  );

  // Search filtering
  const filteredExpenses = expenses.filter((expense) => {
    const query = search.toLowerCase();

    return (
      expense.description
        ?.toLowerCase()
        .includes(query) ||
      expense.category
        ?.toLowerCase()
        .includes(query)
    );
  });

  // Dynamic category badge
  const getCategoryColor = (color) => {
    return {
      backgroundColor: `${color}20`,
      color: color,
      border: `1px solid ${color}40`,
    };
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-white flex font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="flex-1 px-6 py-5 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Expenses
            </h2>

            <p className="text-[#64748B] mt-1 text-sm">
              Manage and track all your spending activity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="bg-[#0F172A] border border-[#1E293B] rounded-lg px-3 py-2.5 w-[230px] text-sm outline-none focus:border-[#22C55E]"
            />

            {/* CSV Import */}
            <label className="bg-[#111827] border border-[#1E293B] hover:border-[#334155] px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer">
              Import CSV

              <input
                type="file"
                accept=".csv"
                hidden
                onChange={(e) => {
                  const file =
                    e.target.files[0];

                  console.log(file);
                }}
              />
            </label>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mb-7 items-center">
          {/* Total Count */}
          <div>
            <p className="text-[#64748B] text-[11px] tracking-[0.2em] mb-1">
              TOTAL COUNT
            </p>

            <h3 className="text-3xl font-bold">
              {expenses.length}
            </h3>
          </div>

          <div className="w-px h-12 bg-[#1E293B]" />

          {/* Total Spent */}
          <div>
            <p className="text-[#64748B] text-[11px] tracking-[0.2em] mb-1">
              TOTAL SPENT
            </p>

            <h3 className="text-3xl font-bold text-[#22C55E]">
              ₹{totalSpent.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-5">
          {/* LEFT FORM */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 h-fit">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold">
                New Entry
              </h3>
            </div>

            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="text-[11px] text-[#64748B] tracking-[0.15em] block mb-2">
                  AMOUNT (₹)
                </label>

                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full bg-[#020617] border border-[#1E293B] rounded-lg px-3 py-3 text-sm outline-none focus:border-[#22C55E]"
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-[11px] text-[#64748B] tracking-[0.15em] block mb-2">
                  DATE
                </label>

                <input
                  type="date"
                  name="expense_date"
                  value={formData.expense_date}
                  onChange={handleChange}
                  className="w-full bg-[#020617] border border-[#1E293B] rounded-lg px-3 py-3 text-sm outline-none focus:border-[#22C55E]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[11px] text-[#64748B] tracking-[0.15em] block mb-2">
                  CATEGORY
                </label>

                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full bg-[#020617] border border-[#1E293B] rounded-lg px-3 py-3 text-sm outline-none focus:border-[#22C55E]"
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
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] text-[#64748B] tracking-[0.15em] block mb-2">
                  DESCRIPTION
                </label>

                <textarea
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What was this for?"
                  className="w-full bg-[#020617] border border-[#1E293B] rounded-lg px-3 py-3 text-sm resize-none outline-none focus:border-[#22C55E]"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] py-3 rounded-lg font-bold text-black text-sm shadow-lg shadow-green-500/20"
              >
                Save Expense
              </button>
            </div>
          </div>

          {/* RIGHT TABLE */}
          <div className="col-span-2 bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 px-6 py-4 border-b border-[#1E293B] text-[11px] tracking-[0.15em] text-[#64748B] font-medium">
              <span>DATE</span>
              <span>DESCRIPTION</span>
              <span>CATEGORY</span>
              <span className="text-right">
                AMOUNT
              </span>
            </div>

            {/* Table Rows */}
            <div>
              {loading ? (
                <div className="p-6 text-center text-[#64748B]">
                  Loading expenses...
                </div>
              ) : filteredExpenses.length ===
                0 ? (
                <div className="p-6 text-center text-[#64748B]">
                  No expenses found.
                </div>
              ) : (
                filteredExpenses.map(
                  (expense) => (
                    <div
                      key={expense.id}
                      className="grid grid-cols-4 items-center px-6 py-4 border-b border-[#151B28] hover:bg-[#131C2B] transition-all"
                    >
                      {/* Date */}
                      <div>
                        <p className="text-sm">
                          {new Date(
                            expense.expense_date
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="font-medium text-sm text-white">
                          {expense.description ||
                            "No description"}
                        </p>
                      </div>

                      {/* Category */}
                      <div>
                        <span
                          style={getCategoryColor(
                            expense.color ||
                              "#22C55E"
                          )}
                          className="inline-flex px-3 py-1 rounded-full text-[11px] font-semibold"
                        >
                          {expense.category ||
                            "Other"}
                        </span>
                      </div>

                      {/* Amount */}
                      <div className="text-right font-semibold text-sm font-mono text-white">
                        ₹
                        {Number(
                          expense.amount
                        ).toLocaleString()}
                      </div>
                    </div>
                  )
                )
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#0B1220]">
              <p className="text-xs text-[#64748B]">
                Showing latest expenses from
                database.
              </p>

              <div className="flex items-center gap-3 text-[#94A3B8] text-sm">
                <button className="hover:text-white">
                  ←
                </button>

                <span>Page 1</span>

                <button className="hover:text-white">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}