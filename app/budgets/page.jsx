"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from '../dashboard/layout';

export default function BudgetsPage() {
  const [budgets,    setBudgets]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [formData,   setFormData]   = useState({ category_id: "", monthly_limit: "" });
  const [editingBudget, setEditingBudget] = useState(null);
  const [editLimit,     setEditLimit]     = useState("");

  useEffect(() => { fetchBudgets(); fetchCategories(); }, []);

  const fetchBudgets = async () => {
    try {
      const now  = new Date();
      const res  = await fetch(`/api/budgets?month=${now.getMonth()+1}&year=${now.getFullYear()}`);
      const data = await res.json();
      setBudgets(data.budgets || []);
    } catch (err) { console.error("fetchBudgets:", err); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res  = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) { console.error("fetchCategories:", err); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateBudget = async () => {
    if (!formData.category_id || !formData.monthly_limit) { alert("Please fill all fields"); return; }
    try {
      const now = new Date();
      const res = await fetch("/api/budgets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id:   Number(formData.category_id),
          monthly_limit: Number(formData.monthly_limit),
          month: now.getMonth() + 1, year: now.getFullYear(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      await fetchBudgets();
      setFormData({ category_id: "", monthly_limit: "" });
    } catch (err) { alert(err.message); }
  };

  const handleEditSave = async () => {
    if (!editLimit || Number(editLimit) <= 0) { alert("Enter a valid amount"); return; }
    try {
      const now = new Date();
      const res = await fetch("/api/budgets", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id:   editingBudget.category_id,
          monthly_limit: Number(editLimit),
          month: now.getMonth() + 1, year: now.getFullYear(),
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchBudgets();
      setEditingBudget(null); setEditLimit("");
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this budget?")) return;
    try {
      await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      await fetchBudgets();
    } catch (err) { alert("Failed to delete"); }
  };

  const getBarColor  = (b) => b.isOverBudget ? '#EF4444' : b.percentage > 75 ? '#F59E0B' : '#22C55E';
  const getTextColor = (b) => b.isOverBudget ? '#EF4444' : b.percentage > 75 ? '#F59E0B' : '#22C55E';

  const totalSaved = budgets.reduce((acc, b) => acc + (b.remaining > 0 ? b.remaining : 0), 0);

  const inputStyle = {
    background: '#020617', border: '1px solid #1e293b',
    borderRadius: 8, padding: '10px 12px',
    color: '#fff', fontSize: 13, outline: 'none', width: '100%',
  };

  return (
    <DashboardLayout>
      <style>{`
        .bud-form-grid { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; }
        .bud-cards     { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (max-width: 900px) {
          .bud-cards { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .bud-form-grid { grid-template-columns: 1fr; }
          .bud-form-grid button { width: 100%; padding: 12px; }
        }
      `}</style>

      <div style={{ padding: '24px 20px 40px', minHeight: '100vh', background: '#05070d', color: '#fff' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 600, marginBottom: 4 }}>Budgets</h2>
          <p style={{ color: '#6b7280', fontSize: 13 }}>
            {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Create form */}
        <div style={{
          background: '#0b1220', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 14, padding: 20, marginBottom: 28,
          boxShadow: '0 0 20px rgba(34,197,94,0.05)',
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Create New Budget Limit</h3>
          <div className="bud-form-grid">
            <select name="category_id" value={formData.category_id} onChange={handleChange}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#22C55E'}
              onBlur={e  => e.target.style.borderColor = '#1e293b'}
            >
              <option value="">Select category</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>

            <input type="number" name="monthly_limit" value={formData.monthly_limit}
              onChange={handleChange} placeholder="Monthly limit (₹)"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#22C55E'}
              onBlur={e  => e.target.style.borderColor = '#1e293b'}
            />

            <button onClick={handleCreateBudget} style={{
              background: '#22C55E', color: '#000', border: 'none',
              borderRadius: 8, padding: '10px 20px', fontWeight: 700,
              fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              Confirm Limit
            </button>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '60px 0' }}>Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '60px 0' }}>
            <p style={{ fontSize: 15, marginBottom: 8 }}>No budgets yet.</p>
            <p style={{ fontSize: 13 }}>Create one above to start tracking.</p>
          </div>
        ) : (
          <div className="bud-cards">
            {budgets.map(budget => {
              const isEditing = editingBudget?.id === budget.id;
              const barColor  = getBarColor(budget);
              const textColor = getTextColor(budget);
              const pct       = Math.min(budget.percentage || 0, 100);

              return (
                <div key={budget.id} style={{
                  background: '#0b1220', border: '1px solid #1e293b',
                  borderRadius: 14, padding: 20,
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 600, color: '#fff' }}>
                      {budget.category}
                    </h3>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => { setEditingBudget(budget); setEditLimit(budget.limit); }}
                        style={{ background: 'none', border: '1px solid #1e293b', borderRadius: 6,
                          padding: '4px 10px', color: '#64748b', fontSize: 11, cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#22C55E'; e.currentTarget.style.color = '#22C55E' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        style={{ background: 'none', border: '1px solid #1e293b', borderRadius: 6,
                          padding: '4px 10px', color: '#64748b', fontSize: 11, cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 14 }}>Monthly spending budget</p>

                  {/* Inline edit */}
                  {isEditing && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                      <input type="number" value={editLimit}
                        onChange={e => setEditLimit(e.target.value)}
                        placeholder="New limit (₹)" autoFocus
                        style={{ flex: 1, minWidth: 120, background: '#020617',
                          border: '1px solid #22C55E', borderRadius: 8,
                          padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' }}
                      />
                      <button onClick={handleEditSave} style={{
                        background: '#22C55E', color: '#000', border: 'none',
                        borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      }}>Save</button>
                      <button onClick={() => { setEditingBudget(null); setEditLimit(""); }} style={{
                        background: '#1e293b', color: '#94a3b8', border: 'none',
                        borderRadius: 8, padding: '8px 12px', fontSize: 12, cursor: 'pointer',
                      }}>Cancel</button>
                    </div>
                  )}

                  {/* Amounts */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                    <span style={{ color: budget.isOverBudget ? '#EF4444' : '#fff', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                      ₹{Number(budget.spent).toLocaleString()}
                    </span>
                    <span style={{ color: '#6b7280' }}>
                      of ₹{Number(budget.limit).toLocaleString()}
                    </span>
                  </div>

                  {/* Progress */}
                  <div style={{ background: '#1e293b', height: 6, borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{
                      height: '100%', borderRadius: 999,
                      width: `${pct}%`, background: barColor,
                      transition: 'width 600ms ease',
                    }} />
                  </div>

                  {/* Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: textColor, fontSize: 12 }}>
                      {budget.isOverBudget
                        ? `Over budget by ₹${Math.abs(budget.remaining).toLocaleString()}`
                        : budget.percentage > 75
                        ? `₹${Number(budget.remaining).toLocaleString()} remaining`
                        : 'Well under limit'}
                    </p>
                    <span style={{ color: textColor, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Insight */}
        <div style={{
          marginTop: 28,
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.15)',
          borderRadius: 14, padding: '18px 20px',
        }}>
          <h3 style={{ color: '#22C55E', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
            Spending Insight
          </h3>
          <p style={{ color: '#6b7280', fontSize: 13 }}>
            You saved ₹{totalSaved.toLocaleString()} this month by staying under budget.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}