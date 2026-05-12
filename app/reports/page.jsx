"use client";
import React, { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/layout/Sidebar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import DashboardLayout from '../dashboard/layout'

export default function ReportsPage() {
  const [loading,    setLoading]    = useState(true);
  const [reportData, setReportData] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const [dashRes, expRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/expenses"),
      ]);

      const dashboard = await dashRes.json();
      const expData   = await expRes.json();

      console.log("Dashboard response:", dashboard);
      console.log("Expenses response:", expData);

      const expensesList = expData.expenses || expData || [];

      const byCategory     = dashboard.byCategory     || [];
      const monthlyTrend   = dashboard.monthlyTrend   || [];
      const budgetAlerts   = dashboard.budgetAlerts   || [];
      const totalThisMonth = parseFloat(dashboard.totalThisMonth || 0);

      const categories = byCategory.map(c => ({
        name:  c.name  || "Uncategorized",
        color: c.color || "#9CA3AF",
        total: parseFloat(c.total || 0),
      }));

      const byDay = expensesList.reduce((acc, e) => {
        const d = (e.expense_date || "").split("T")[0];
        if (d) acc[d] = (acc[d] || 0) + parseFloat(e.amount || 0);
        return acc;
      }, {});

      const highestDayEntry = Object.entries(byDay)
        .sort((a, b) => b[1] - a[1])[0];

      const highestDay = highestDayEntry
        ? { expense_date: highestDayEntry[0], total: highestDayEntry[1] }
        : null;

      const breakdown = budgetAlerts.map(a => ({
        name:          a.category_name || a.name || "Unknown",
        monthly_limit: parseFloat(a.monthly_limit || 0),
        actual:        parseFloat(a.spent || 0),
      }));

      const trend = monthlyTrend.map(t => ({
        label: t.month_label,
        total: parseFloat(t.total || 0),
      }));

      setReportData({
        categories,
        breakdown,
        total:             totalThisMonth,
        highestDay,
        expensiveCategory: categories[0] || null,
        trend,
      });
    } catch (err) {
      console.error("fetchReports error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function downloadPDF() {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale:           2,
        backgroundColor: "#05070D",
        useCORS:         true,
        logging:         false,
      });

      const imgData  = canvas.toDataURL("image/png");
      const pdf      = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      } else {
        let yOffset = 0;
        while (yOffset < pdfHeight) {
          pdf.addImage(imgData, "PNG", 0, -yOffset, pdfWidth, pdfHeight);
          yOffset += pageHeight;
          if (yOffset < pdfHeight) pdf.addPage();
        }
      }
      pdf.save("fintrack-report.pdf");
    } catch (err) {
      console.error("PDF error:", err);
      alert("PDF download failed: " + err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading Reports...
      </div>
    );
  }

  const categories       = reportData?.categories       || [];
  const breakdown        = reportData?.breakdown        || [];
  const total            = reportData?.total            || 0;
  const highestDay       = reportData?.highestDay;
  const expensiveCategory = reportData?.expensiveCategory;
  const trend            = reportData?.trend            || [];
  const avgDailySpend    = total / 30;

  return (
    <DashboardLayout>
    <style>{`
      .reports-grid-top {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .reports-grid-middle {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .reports-table-header {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        padding: 0.75rem 1.5rem;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        color: #6B7280;
        border-bottom: 1px solid #151D31;
      }
      .reports-table-row {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #111827;
        align-items: center;
      }
      .reports-table-row:hover {
        background: #0F172A;
      }
      .insights-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }

      @media (max-width: 768px) {
        .reports-grid-top {
          grid-template-columns: 1fr !important;
        }
        .reports-grid-middle {
          grid-template-columns: 1fr !important;
        }
        .insights-grid {
          grid-template-columns: 1fr 1fr !important;
        }

        /* Responsive table: hide Budget/Status cols, show key info */
        .reports-table-header {
          grid-template-columns: 2fr 1fr 1fr !important;
          padding: 0.75rem 1rem;
        }
        .reports-table-header span:nth-child(2),
        .reports-table-header span:nth-child(4) {
          display: none;
        }
        .reports-table-row {
          grid-template-columns: 2fr 1fr 1fr !important;
          padding: 0.75rem 1rem;
        }
        .reports-table-row span:nth-child(2),
        .reports-table-row span:nth-child(4) {
          display: none;
        }

        .reports-header {
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .donut-container {
          flex-direction: column !important;
          align-items: center !important;
          gap: 1.5rem !important;
        }
        .donut-legend {
          width: 100% !important;
        }
        .donut-legend > div {
          width: 100% !important;
        }
      }

      @media (max-width: 480px) {
        .insights-grid {
          grid-template-columns: 1fr !important;
        }
        .reports-table-header {
          grid-template-columns: 1fr 1fr !important;
          padding: 0.75rem 0.75rem;
        }
        .reports-table-header span:nth-child(3) {
          display: none;
        }
        .reports-table-row {
          grid-template-columns: 1fr 1fr !important;
          padding: 0.75rem 0.75rem;
        }
        .reports-table-row span:nth-child(3) {
          display: none;
        }
      }
    `}</style>
    <div className="min-h-screen bg-[#05070D] text-white flex overflow-hidden">
      

      <main ref={reportRef} className="flex-1 px-4 py-5 overflow-y-auto" style={{ minWidth: 0 }}>

        {/* HEADER */}
        <div className="reports-header flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-white">Reports</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-[#0E1423] border border-[#1C2437] px-4 py-2 rounded-full text-xs text-gray-300">
              Current Month
            </button>
            <button className="w-9 h-9 rounded-full bg-[#0E1423] border border-[#1C2437] flex items-center justify-center text-gray-400">
              🔔
            </button>
          </div>
        </div>

        {/* Show message if no data */}
        {total === 0 && categories.length === 0 && (
          <div className="bg-[#0B1020] border border-[#151D31] rounded-2xl p-8 text-center mb-4">
            <p className="text-gray-400 text-sm">No expense data for this month yet.</p>
            <p className="text-gray-600 text-xs mt-1">Add expenses to see your report.</p>
          </div>
        )}

        {/* TOP */}
        <div className="reports-grid-top">

          {/* GRAPH */}
          <div className="bg-[#0B1020] border border-[#151D31] rounded-2xl p-5 relative overflow-hidden min-h-[260px]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">
                  Monthly Spending Trend
                </p>
                <h2 className="text-[30px] font-bold text-[#22C55E] leading-none">
                  ₹{Number(total).toLocaleString()}
                </h2>
              </div>
              <div className="bg-green-500/15 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/20 font-semibold">
                Active
              </div>
            </div>

            {trend.length > 0 ? (
              <div className="absolute bottom-8 left-6 right-6 h-[130px]">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent rounded-2xl blur-2xl" />
                  <svg viewBox="0 0 100 40" preserveAspectRatio="none"
                    className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22C55E" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d={`M0,35 ${trend.map((item, index) => {
                        const x = (index / (trend.length - 1 || 1)) * 100;
                        const y = 35 - Math.min(item.total / 400, 28);
                        return `L${x},${y}`;
                      }).join(" ")} L100,40 L0,40 Z`}
                      fill="url(#lineFill)"
                    />
                    <path
                      d={`M0,35 ${trend.map((item, index) => {
                        const x = (index / (trend.length - 1 || 1)) * 100;
                        const y = 35 - Math.min(item.total / 400, 28);
                        return `L${x},${y}`;
                      }).join(" ")}`}
                      stroke="#22C55E" strokeWidth="1.8" fill="none" strokeLinecap="round"
                    />
                    {trend.map((item, index) => {
                      const x = (index / (trend.length - 1 || 1)) * 100;
                      const y = 35 - Math.min(item.total / 400, 28);
                      return <circle key={index} cx={x} cy={y} r="1.8" fill="#22C55E" />;
                    })}
                  </svg>
                  <div className="absolute bottom-[-22px] left-0 right-0 flex justify-between text-[10px] text-gray-500">
                    {trend.map((t, i) => <span key={i}>{t.label || `W${i+1}`}</span>)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute bottom-8 left-6 right-6 flex items-center justify-center h-[100px]">
                <p className="text-gray-600 text-sm">No trend data yet</p>
              </div>
            )}
          </div>

          {/* TOP CATEGORIES */}
          <div className="bg-[#0B1020] border border-[#151D31] rounded-2xl p-5">
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold mb-5">
              Top Categories
            </h3>
            {categories.length === 0 ? (
              <p className="text-gray-600 text-sm">No data yet</p>
            ) : (
              <div className="space-y-4">
                {categories.map((cat, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-white">{cat.name}</span>
                      <span className="text-xs font-semibold text-gray-400">
                        ₹{Number(cat.total).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#1C2437] rounded-full overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{
                          width: total > 0 ? `${(cat.total / total) * 100}%` : "0%",
                          background: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE */}
        <div className="reports-grid-middle">

          {/* DONUT */}
          <div className="bg-[#0B1020] border border-[#151D31] rounded-2xl p-5 min-h-[290px]">
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold mb-6">
              Spending Distribution
            </h3>
            {categories.length === 0 ? (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-gray-600 text-sm">No data yet</p>
              </div>
            ) : (
              <div className="donut-container flex items-center justify-between mt-6">
                <div className="relative w-[170px] h-[170px] flex items-center justify-center" style={{ flexShrink: 0 }}>
                  <div className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(${categories.map((cat, index) => {
                        const prev = categories.slice(0, index).reduce(
                          (acc, item) => acc + (total > 0 ? (item.total / total) * 100 : 0), 0
                        );
                        const current = total > 0 ? (cat.total / total) * 100 : 0;
                        return `${cat.color} ${prev}% ${prev + current}%`;
                      }).join(",")})`,
                      borderRadius: "9999px",
                      WebkitMask: "radial-gradient(circle at center, transparent 52%, black 53%)",
                      mask:        "radial-gradient(circle at center, transparent 52%, black 53%)",
                    }}
                  />
                  <div className="text-center z-10">
                    <h2 className="text-2xl font-bold text-white">
                      ₹{Number(total).toLocaleString()}
                    </h2>
                    <p className="text-[10px] tracking-[0.15em] text-gray-500 mt-1 uppercase">Total</p>
                  </div>
                </div>

                <div className="donut-legend space-y-3">
                  {categories.slice(0, 3).map((cat, index) => (
                    <div key={index}
                      className="bg-[#0E1423] border border-[#1B2437] px-4 py-3 rounded-xl w-[160px] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                        <span className="text-xs">{cat.name}</span>
                      </div>
                      <span className="font-semibold text-xs">
                        {total > 0 ? Math.round((cat.total / total) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* INSIGHTS */}
          <div className="bg-[#0B1020] border border-[#151D31] rounded-2xl p-5 min-h-[290px] flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold mb-5">
                Monthly Insights
              </h3>
              <div className="insights-grid">
                <div className="bg-[#0E1423] border border-[#1B2437] rounded-xl p-4">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-gray-500 mb-2">Highest Spend Day</p>
                  <h2 className="text-[20px] font-bold text-white leading-none mb-2">
                    {highestDay
                      ? new Date(highestDay.expense_date).toLocaleDateString("en-IN")
                      : "No data"}
                  </h2>
                  <p className="text-gray-500 text-xs">
                    {highestDay ? `₹${Number(highestDay.total).toLocaleString()} spent` : "—"}
                  </p>
                </div>

                <div className="bg-[#0E1423] border border-[#1B2437] rounded-xl p-4">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-gray-500 mb-2">Avg. Daily Spend</p>
                  <h2 className="text-[20px] font-bold text-[#22C55E] leading-none mb-2">
                    ₹{avgDailySpend.toFixed(0)}
                  </h2>
                  <p className="text-green-400 text-xs">Current average</p>
                </div>

                <div className="bg-[#0E1423] border border-[#1B2437] rounded-xl p-4">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-gray-500 mb-2">Expensive Category</p>
                  <h2 className="text-[20px] font-bold text-white leading-none mb-2">
                    {expensiveCategory?.name || "No data"}
                  </h2>
                  <p className="text-gray-500 text-xs">
                    {expensiveCategory && total > 0
                      ? `${Math.round((expensiveCategory.total / total) * 100)}% of total`
                      : "—"}
                  </p>
                </div>

                <div className="bg-[#0E1423] border border-[#1B2437] rounded-xl p-4">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-gray-500 mb-2">Monthly Total</p>
                  <h2 className="text-[20px] font-bold text-[#22C55E] leading-none mb-2">
                    ₹{Number(total).toLocaleString()}
                  </h2>
                  <p className="text-gray-500 text-xs">Current month</p>
                </div>
              </div>
            </div>

            <button onClick={downloadPDF}
              className="mt-5 w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold py-3 rounded-xl text-sm transition-all">
              DOWNLOAD FULL REPORT (.PDF)
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#0B1020] border border-[#151D31] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#151D31]">
            <h2 className="text-[22px] font-bold text-white">Detailed Breakdown</h2>
          </div>

          {breakdown.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500 text-sm">No budget data to show.</p>
              <p className="text-gray-700 text-xs mt-1">Set budgets on the Budgets page to see breakdown here.</p>
            </div>
          ) : (
            <>
              <div className="reports-table-header">
                <span>Category</span>
                <span>Budget</span>
                <span>Actual</span>
                <span>Status</span>
                <span>Remaining</span>
              </div>

              {breakdown.map((item, index) => {
                const remaining = Number(item.monthly_limit) - Number(item.actual);
                const isOver    = remaining < 0;
                return (
                  <div key={index} className="reports-table-row">
                    <span className="font-semibold text-sm text-white">{item.name}</span>
                    <span className="text-gray-300 text-sm">₹{Number(item.monthly_limit).toLocaleString()}</span>
                    <span className="text-gray-300 text-sm">₹{Number(item.actual).toLocaleString()}</span>
                    <span className={`font-semibold text-sm ${isOver ? "text-red-400" : "text-green-400"}`}>
                      {isOver ? "Over" : "Good"}
                    </span>
                    <span className={`font-semibold text-sm ${isOver ? "text-red-400" : "text-green-400"}`}>
                      ₹{Math.abs(remaining).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </main>
    </div>
    </DashboardLayout>
  );
}