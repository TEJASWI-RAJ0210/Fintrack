"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Papa from "papaparse";
import DashboardLayout from '../dashboard/layout'

export default function ExpensesPage() {
  const [expenses,   setExpenses]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [importing,  setImporting]  = useState(false);

  const [formData, setFormData] = useState({
    amount: "", expense_date: "", category_id: "", description: "",
  });

  // ── useCallback so fetchExpenses reference stays stable ──
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/expenses");
      const data = await res.json();
      console.log("Expenses API response:", data); // debug
      // API returns { success: true, expenses: [...] }
      if (data.success && Array.isArray(data.expenses)) {
        setExpenses(data.expenses);
      } else if (Array.isArray(data)) {
        setExpenses(data);
      } else {
        setExpenses([]);
        console.error("Unexpected expenses response:", data);
      }
    } catch (err) {
      console.error("fetchExpenses error:", err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res  = await fetch("/api/categories");
      const data = await res.json();
      console.log("Categories API response:", data); // debug
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("fetchCategories error:", err);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [fetchExpenses, fetchCategories]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!formData.amount || !formData.category_id || !formData.expense_date) {
      alert("Please fill all required fields");
      return;
    }
    try {
      const res = await fetch("/api/expenses", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount:      Number(formData.amount),
          category_id: Number(formData.category_id),
          description: formData.description,
          date:        formData.expense_date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      await fetchExpenses();
      setFormData({ amount: "", expense_date: "", category_id: "", description: "" });
      alert("Expense added successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      // Optimistic update — remove from state immediately
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);

    Papa.parse(file, {
      header:         true,
      skipEmptyLines: true,
      complete: async ({ data: rows }) => {
        try {
          const mapped = rows
            .map(row => ({
              date:        row.date        || row.Date,
              amount:      parseFloat(row.amount || row.Amount),
              description: row.description || row.Description || "",
              category_id: categories.find(c =>
                c.name.toLowerCase() === (row.category || row.Category || "").toLowerCase()
              )?.id || null,
            }))
            .filter(r => r.date && !isNaN(r.amount) && r.amount > 0);

          if (mapped.length === 0) {
            alert("No valid rows found.\nCSV columns: date, amount, description, category\nDate format: YYYY-MM-DD");
            setImporting(false);
            return;
          }

          const res = await fetch("/api/expenses/import", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ rows: mapped }),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || "Import failed");

          alert(`Imported ${result.inserted} expenses successfully!`);
          // Force fresh fetch after import
          await fetchExpenses();
        } catch (err) {
          alert("Import failed: " + err.message);
        } finally {
          setImporting(false);
          e.target.value = "";
        }
      },
      error: () => {
        alert("Failed to read CSV file");
        setImporting(false);
      },
    });
  };

  const totalSpent = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

  const filteredExpenses = expenses.filter(e => {
    const q = search.toLowerCase();
    return (
      e.description?.toLowerCase().includes(q) ||
      e.category?.toLowerCase().includes(q)
    );
  });

  const getCategoryStyle = (color) => ({
    backgroundColor: `${color}20`,
    color,
    border: `1px solid ${color}40`,
  });

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-[#070B14] text-white flex font-sans">
      <main className="flex-1 px-6 py-5 overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
            <p className="text-[#64748B] mt-1 text-sm">
              Manage and track all your spending activity.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-[#0F172A] border border-[#1E293B] rounded-lg px-3 py-2.5 w-[230px] text-sm outline-none focus:border-[#22C55E]"
            />
            <label className={`bg-[#111827] border border-[#1E293B] hover:border-[#334155] px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${importing ? "opacity-60 pointer-events-none" : ""}`}>
              {importing ? "Importing…" : "Import CSV"}
              <input
                type="file" accept=".csv" hidden
                disabled={importing}
                onChange={handleCSVImport}
              />
            </label>
          </div>
        </div>

        {/* CSV hint */}
        <p className="text-[#475569] text-xs mb-5">
          CSV format:{" "}
          <code className="bg-[#0F172A] px-1.5 py-0.5 rounded text-[#94A3B8]">
            date, amount, description, category
          </code>{" "}
          — date as YYYY-MM-DD
        </p>

        {/* Stats */}
        <div className="flex gap-8 mb-7 items-center">
          <div>
            <p className="text-[#64748B] text-[11px] tracking-[0.2em] mb-1">TOTAL COUNT</p>
            <h3 className="text-3xl font-bold">{expenses.length}</h3>
          </div>
          <div className="w-px h-12 bg-[#1E293B]" />
          <div>
            <p className="text-[#64748B] text-[11px] tracking-[0.2em] mb-1">TOTAL SPENT</p>
            <h3 className="text-3xl font-bold text-[#22C55E]">
              ₹{totalSpent.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-5">

          {/* Form */}
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 h-fit">
            <h3 className="text-xl font-semibold mb-5">New Entry</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-[#64748B] tracking-[0.15em] block mb-2">AMOUNT (₹)</label>
                <input type="number" name="amount" value={formData.amount}
                  onChange={handleChange} placeholder="0.00"
                  className="w-full bg-[#020617] border border-[#1E293B] rounded-lg px-3 py-3 text-sm outline-none focus:border-[#22C55E]" />
              </div>
              <div>
                <label className="text-[11px] text-[#64748B] tracking-[0.15em] block mb-2">DATE</label>
                <input type="date" name="expense_date" value={formData.expense_date}
                  onChange={handleChange}
                  className="w-full bg-[#020617] border border-[#1E293B] rounded-lg px-3 py-3 text-sm outline-none focus:border-[#22C55E]" />
              </div>
              <div>
                <label className="text-[11px] text-[#64748B] tracking-[0.15em] block mb-2">CATEGORY</label>
                <select name="category_id" value={formData.category_id}
                  onChange={handleChange}
                  className="w-full bg-[#020617] border border-[#1E293B] rounded-lg px-3 py-3 text-sm outline-none focus:border-[#22C55E]">
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-[#64748B] tracking-[0.15em] block mb-2">DESCRIPTION</label>
                <textarea rows={3} name="description" value={formData.description}
                  onChange={handleChange} placeholder="What was this for?"
                  className="w-full bg-[#020617] border border-[#1E293B] rounded-lg px-3 py-3 text-sm resize-none outline-none focus:border-[#22C55E]" />
              </div>
              <button onClick={handleSubmit}
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] py-3 rounded-lg font-bold text-black text-sm shadow-lg shadow-green-500/20">
                Save Expense
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="col-span-2 bg-[#0F172A] border border-[#1E293B] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-5 px-6 py-4 border-b border-[#1E293B] text-[11px] tracking-[0.15em] text-[#64748B] font-medium">
              <span>DATE</span>
              <span>DESCRIPTION</span>
              <span>CATEGORY</span>
              <span className="text-right">AMOUNT</span>
              <span className="text-right">ACTION</span>
            </div>

            <div>
              {loading ? (
                <div className="p-6 text-center text-[#64748B]">Loading expenses...</div>
              ) : filteredExpenses.length === 0 ? (
                <div className="p-6 text-center text-[#64748B]">
                  No expenses found.{" "}
                  <button onClick={fetchExpenses} className="text-[#22C55E] underline ml-1">
                    Refresh
                  </button>
                </div>
              ) : (
                filteredExpenses.map(expense => (
                  <div key={expense.id}
                    className="grid grid-cols-5 items-center px-6 py-4 border-b border-[#151B28] hover:bg-[#131C2B] transition-all">
                    <div className="text-sm">
                      {expense.expense_date
                        ? new Date(expense.expense_date).toLocaleDateString("en-IN")
                        : "—"}
                    </div>
                    <div className="font-medium text-sm text-white truncate pr-2">
                      {expense.description || "No description"}
                    </div>
                    <div>
                      <span
                        style={getCategoryStyle(expense.color || "#22C55E")}
                        className="inline-flex px-3 py-1 rounded-full text-[11px] font-semibold">
                        {expense.category || "Other"}
                      </span>
                    </div>
                    <div className="text-right font-semibold text-sm font-mono">
                      ₹{Number(expense.amount).toLocaleString()}
                    </div>
                    <div className="text-right">
                      <button onClick={() => handleDelete(expense.id)}
                        className="text-[#475569] hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-400/10 transition-all">
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-[#0B1220]">
              <p className="text-xs text-[#64748B]">
                Showing {filteredExpenses.length} of {expenses.length} expenses
              </p>
              <button onClick={fetchExpenses}
                className="text-xs text-[#64748B] hover:text-[#22C55E] transition-colors">
                ↻ Refresh
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
    </DashboardLayout>
  );
}