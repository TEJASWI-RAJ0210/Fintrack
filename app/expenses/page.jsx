"use client";
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Papa from "papaparse";
import DashboardLayout from '../dashboard/layout';

export default function ExpensesPage() {
  const [expenses,   setExpenses]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [importing,  setImporting]  = useState(false);
  const [showForm,   setShowForm]   = useState(false);

  const [formData, setFormData] = useState({
    amount: "", expense_date: "", category_id: "", description: "",
  });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/expenses");
      const data = await res.json();
      if (data.success && Array.isArray(data.expenses)) setExpenses(data.expenses);
      else if (Array.isArray(data)) setExpenses(data);
      else setExpenses([]);
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
      if (data.success && Array.isArray(data.categories)) setCategories(data.categories);
      else if (Array.isArray(data)) setCategories(data);
      else setCategories([]);
    } catch (err) {
      console.error("fetchCategories error:", err);
    }
  }, []);

  useEffect(() => { fetchExpenses(); fetchCategories(); }, [fetchExpenses, fetchCategories]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!formData.amount || !formData.category_id || !formData.expense_date) {
      alert("Please fill all required fields"); return;
    }
    try {
      const res = await fetch("/api/expenses", {
        method: "POST", headers: { "Content-Type": "application/json" },
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
      setShowForm(false);
      alert("Expense added successfully");
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this expense?")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) { alert("Failed to delete: " + err.message); }
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
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
            alert("No valid rows.\nCSV columns: date, amount, description, category\nDate: YYYY-MM-DD");
            setImporting(false); return;
          }
          const res = await fetch("/api/expenses/import", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rows: mapped }),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || "Import failed");
          alert(`Imported ${result.inserted} expenses!`);
          await fetchExpenses();
        } catch (err) { alert("Import failed: " + err.message); }
        finally { setImporting(false); e.target.value = ""; }
      },
      error: () => { alert("Failed to read CSV"); setImporting(false); },
    });
  };

  const totalSpent = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const filteredExpenses = expenses.filter(e => {
    const q = search.toLowerCase();
    return e.description?.toLowerCase().includes(q) || e.category?.toLowerCase().includes(q);
  });
  const getCategoryStyle = (color) => ({
    backgroundColor: `${color}20`, color, border: `1px solid ${color}40`,
  });

  return (
    <DashboardLayout>
      <style>{`
        .exp-layout   { display: grid; grid-template-columns: 320px 1fr; gap: 20px; }
        .exp-table-col { overflow: hidden; }
        .exp-header   { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .exp-actions  { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .exp-table-row { display: grid; grid-template-columns: 90px 1fr 110px 90px 64px; }
        .exp-table-hdr { display: grid; grid-template-columns: 90px 1fr 110px 90px 64px; }
        .stat-row      { display: flex; gap: 32px; align-items: center; }

        @media (max-width: 1100px) {
          .exp-layout { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .exp-header   { flex-direction: column; align-items: flex-start; }
          .exp-actions  { width: 100%; }
          .exp-actions input { width: 100% !important; }
          .exp-table-row { grid-template-columns: 80px 1fr 80px; }
          .exp-table-hdr { grid-template-columns: 80px 1fr 80px; }
          .exp-hide-mobile { display: none !important; }
          .stat-row      { gap: 20px; }
        }
      `}</style>

      <div style={{ padding: '20px 20px 32px' }}>

        {/* Header */}
        <div className="exp-header" style={{ marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              Expenses
            </h2>
            <p style={{ color: '#64748B', fontSize: 13 }}>Manage and track all your spending.</p>
          </div>
          <div className="exp-actions">
            <input
              type="text" placeholder="Search..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: '#0F172A', border: '1px solid #1E293B',
                borderRadius: 8, padding: '9px 12px', width: 200,
                color: '#fff', fontSize: 13, outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#22C55E'}
              onBlur={e  => e.target.style.borderColor = '#1E293B'}
            />
            <button
              onClick={() => setShowForm(s => !s)}
              style={{
                background: '#22C55E', color: '#000', border: 'none',
                borderRadius: 8, padding: '9px 16px', fontSize: 13,
                fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              + Add Expense
            </button>
            <label style={{
              background: '#111827', border: '1px solid #1E293B',
              borderRadius: 8, padding: '9px 14px', fontSize: 13,
              fontWeight: 500, cursor: importing ? 'not-allowed' : 'pointer',
              opacity: importing ? 0.6 : 1, whiteSpace: 'nowrap', color: '#fff',
            }}>
              {importing ? "Importing…" : "Import CSV"}
              <input type="file" accept=".csv" hidden disabled={importing} onChange={handleCSVImport} />
            </label>
          </div>
        </div>

        {/* CSV hint */}
        <p style={{ color: '#475569', fontSize: 11, marginBottom: 16 }}>
          CSV: <code style={{ background: '#0F172A', padding: '2px 6px', borderRadius: 4, color: '#94A3B8' }}>
            date, amount, description, category
          </code> — date as YYYY-MM-DD
        </p>

        {/* Stats */}
        <div className="stat-row" style={{ marginBottom: 20 }}>
          <div>
            <p style={{ color: '#64748B', fontSize: 11, letterSpacing: '0.15em', marginBottom: 4 }}>TOTAL COUNT</p>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{expenses.length}</h3>
          </div>
          <div style={{ width: 1, height: 40, background: '#1E293B' }} />
          <div>
            <p style={{ color: '#64748B', fontSize: 11, letterSpacing: '0.15em', marginBottom: 4 }}>TOTAL SPENT</p>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: '#22C55E' }}>
              ₹{totalSpent.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Add form — slides in as a card above the table */}
        {showForm && (
          <div style={{
            background: '#0F172A', border: '1px solid #22C55E33',
            borderRadius: 16, padding: 20, marginBottom: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>New Expense</h3>
              <button onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 18 }}>
                ✕
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ color: '#64748B', fontSize: 11, letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>
                  AMOUNT (₹)
                </label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange}
                  placeholder="0.00" style={{
                    width: '100%', background: '#020617', border: '1px solid #1E293B',
                    borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = '#22C55E'}
                  onBlur={e  => e.target.style.borderColor = '#1E293B'}
                />
              </div>
              <div>
                <label style={{ color: '#64748B', fontSize: 11, letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>
                  DATE
                </label>
                <input type="date" name="expense_date" value={formData.expense_date} onChange={handleChange}
                  style={{
                    width: '100%', background: '#020617', border: '1px solid #1E293B',
                    borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = '#22C55E'}
                  onBlur={e  => e.target.style.borderColor = '#1E293B'}
                />
              </div>
              <div>
                <label style={{ color: '#64748B', fontSize: 11, letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>
                  CATEGORY
                </label>
                <select name="category_id" value={formData.category_id} onChange={handleChange}
                  style={{
                    width: '100%', background: '#020617', border: '1px solid #1E293B',
                    borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = '#22C55E'}
                  onBlur={e  => e.target.style.borderColor = '#1E293B'}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ color: '#64748B', fontSize: 11, letterSpacing: '0.12em', display: 'block', marginBottom: 6 }}>
                  DESCRIPTION
                </label>
                <input type="text" name="description" value={formData.description} onChange={handleChange}
                  placeholder="What was this for?" style={{
                    width: '100%', background: '#020617', border: '1px solid #1E293B',
                    borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, outline: 'none',
                  }}
                  onFocus={e => e.target.style.borderColor = '#22C55E'}
                  onBlur={e  => e.target.style.borderColor = '#1E293B'}
                />
              </div>
            </div>
            <button onClick={handleSubmit} style={{
              marginTop: 14, background: '#22C55E', color: '#000', border: 'none',
              borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
            }}>
              Save Expense
            </button>
          </div>
        )}

        {/* Table */}
        <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 16, overflow: 'hidden' }}>

          {/* Table header */}
          <div className="exp-table-hdr" style={{
            padding: '12px 20px', borderBottom: '1px solid #1E293B',
            color: '#64748B', fontSize: 11, letterSpacing: '0.15em', fontWeight: 500,
          }}>
            <span>DATE</span>
            <span>DESCRIPTION</span>
            <span className="exp-hide-mobile">CATEGORY</span>
            <span style={{ textAlign: 'right' }}>AMOUNT</span>
            <span style={{ textAlign: 'right' }}>ACT</span>
          </div>

          {/* Rows */}
          <div>
            {loading ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#64748B' }}>Loading expenses...</div>
            ) : filteredExpenses.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#64748B' }}>
                No expenses found.{" "}
                <button onClick={fetchExpenses} style={{ color: '#22C55E', background: 'none',
                  border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Refresh
                </button>
              </div>
            ) : (
              filteredExpenses.map(expense => (
                <div key={expense.id} className="exp-table-row"
                  style={{
                    padding: '12px 20px', borderBottom: '1px solid #151B28',
                    alignItems: 'center', transition: 'background 150ms',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#131C2B'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ color: '#94A3B8', fontSize: 12 }}>
                    {expense.expense_date
                      ? new Date(expense.expense_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                      : '—'}
                  </div>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 500,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                    {expense.description || 'No description'}
                  </div>
                  <div className="exp-hide-mobile">
                    <span style={{ ...getCategoryStyle(expense.color || '#22C55E'),
                      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
                      {expense.category || 'Other'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 600, fontSize: 13,
                    fontFamily: 'JetBrains Mono, monospace', color: '#fff' }}>
                    ₹{Number(expense.amount).toLocaleString()}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <button onClick={() => handleDelete(expense.id)}
                      style={{ background: 'none', border: 'none', color: '#475569',
                        cursor: 'pointer', fontSize: 12, padding: '4px 6px', borderRadius: 6 }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 20px', background: '#0B1220' }}>
            <p style={{ color: '#64748B', fontSize: 12 }}>
              {filteredExpenses.length} of {expenses.length} expenses
            </p>
            <button onClick={fetchExpenses}
              style={{ background: 'none', border: 'none', color: '#64748B',
                cursor: 'pointer', fontSize: 12 }}
              onMouseEnter={e => e.currentTarget.style.color = '#22C55E'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}