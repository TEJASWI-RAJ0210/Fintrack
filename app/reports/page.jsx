"use client";

import React, {
  useEffect,
  useState,
  useRef,
} from "react";

import Sidebar from "@/components/layout/Sidebar";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ReportsPage() {
  const [loading, setLoading] =
    useState(true);

  const [reportData, setReportData] =
    useState(null);

  const reportRef = useRef(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const res = await fetch(
        "/api/reports"
      );

      const data = await res.json();

      if (data.success) {
        setReportData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function downloadPDF() {
    if (!reportRef.current) return;

    const canvas =
      await html2canvas(
        reportRef.current,
        {
          scale: 2,
          backgroundColor:
            "#05070D",
        }
      );

    const imgData =
      canvas.toDataURL(
        "image/png"
      );

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4",
    });

    const pdfWidth =
      pdf.internal.pageSize.getWidth();

    const pdfHeight =
      (canvas.height * pdfWidth) /
      canvas.width;

    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      pdfWidth,
      pdfHeight
    );

    pdf.save(
      "fintrack-report.pdf"
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading Reports...
      </div>
    );
  }

  const categories =
    reportData?.categories || [];

  const breakdown =
    reportData?.breakdown || [];

  const total =
    reportData?.total || 0;

  const highestDay =
    reportData?.highestDay;

  const expensiveCategory =
    reportData?.expensiveCategory;

  const trend =
    reportData?.trend || [];

  const avgDailySpend =
    total / 30;

  return (
    <div className="min-h-screen bg-[#05070D] text-white flex overflow-hidden">
      <Sidebar />

      <main
        ref={reportRef}
        className="flex-1 px-6 py-5 overflow-y-auto"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[26px] font-bold text-white">
              Reports
            </h1>
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

        {/* TOP */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* GRAPH */}
          <div className="col-span-2 bg-[#0B1020] border border-[#151D31] rounded-2xl p-5 relative overflow-hidden min-h-[260px]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold mb-2">
                  Monthly Spending Trend
                </p>

                <h2 className="text-[30px] font-bold text-[#22C55E] leading-none">
                  ₹
                  {Number(
                    total
                  ).toLocaleString()}
                </h2>
              </div>

              <div className="bg-green-500/15 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/20 font-semibold">
                Active
              </div>
            </div>

            <div className="absolute bottom-8 left-6 right-6 h-[130px]">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent rounded-2xl blur-2xl" />

                <svg
                  viewBox="0 0 100 40"
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible"
                >
                  <defs>
                    <linearGradient
                      id="lineFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#22C55E"
                        stopOpacity="0.35"
                      />

                      <stop
                        offset="100%"
                        stopColor="#22C55E"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  {/* AREA */}
                  <path
                    d={`M0,35 ${trend
                      .map(
                        (
                          item,
                          index
                        ) => {
                          const x =
                            (index /
                              (trend.length -
                                1 ||
                                1)) *
                            100;

                          const y =
                            35 -
                            Math.min(
                              item.total /
                                400,
                              28
                            );

                          return `L${x},${y}`;
                        }
                      )
                      .join(
                        " "
                      )} L100,40 L0,40 Z`}
                    fill="url(#lineFill)"
                  />

                  {/* LINE */}
                  <path
                    d={`M0,35 ${trend
                      .map(
                        (
                          item,
                          index
                        ) => {
                          const x =
                            (index /
                              (trend.length -
                                1 ||
                                1)) *
                            100;

                          const y =
                            35 -
                            Math.min(
                              item.total /
                                400,
                              28
                            );

                          return `L${x},${y}`;
                        }
                      )
                      .join(" ")}`}
                    stroke="#22C55E"
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* POINTS */}
                  {trend.map(
                    (
                      item,
                      index
                    ) => {
                      const x =
                        (index /
                          (trend.length -
                            1 ||
                            1)) *
                        100;

                      const y =
                        35 -
                        Math.min(
                          item.total /
                            400,
                          28
                        );

                      return (
                        <circle
                          key={
                            index
                          }
                          cx={x}
                          cy={y}
                          r="1.8"
                          fill="#22C55E"
                        />
                      );
                    }
                  )}
                </svg>

                {/* WEEK LABELS */}
                <div className="absolute bottom-[-22px] left-0 right-0 flex justify-between text-[10px] text-gray-500">
                  {trend.map(
                    (
                      _,
                      index
                    ) => (
                      <span
                        key={
                          index
                        }
                      >
                        W
                        {index +
                          1}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* TOP CATEGORIES */}
          <div className="bg-[#0B1020] border border-[#151D31] rounded-2xl p-5">
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold mb-5">
              Top Categories
            </h3>

            <div className="space-y-4">
              {categories.map(
                (
                  cat,
                  index
                ) => (
                  <div
                    key={index}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-white">
                        {cat.name}
                      </span>

                      <span className="text-xs font-semibold text-gray-400">
                        ₹
                        {Number(
                          cat.total
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-[#1C2437] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${
                            (cat.total /
                              total) *
                            100
                          }%`,
                          background:
                            cat.color,
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* DONUT */}
          <div className="bg-[#0B1020] border border-[#151D31] rounded-2xl p-5 min-h-[290px]">
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold mb-6">
              Spending Distribution
            </h3>

            <div className="flex items-center justify-between mt-6">
              <div className="relative w-[170px] h-[170px] flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(
                      ${categories
                        .map(
                          (
                            cat,
                            index
                          ) => {
                            const prev =
                              categories
                                .slice(
                                  0,
                                  index
                                )
                                .reduce(
                                  (
                                    acc,
                                    item
                                  ) =>
                                    acc +
                                    (item.total /
                                      total) *
                                      100,
                                  0
                                );

                            const current =
                              (cat.total /
                                total) *
                              100;

                            return `
                              ${cat.color} ${prev}% ${
                              prev +
                              current
                            }%
                            `;
                          }
                        )
                        .join(",")}
                    )`,
                    borderRadius:
                      "9999px",

                    WebkitMask:
                      "radial-gradient(circle at center, transparent 52%, black 53%)",

                    mask:
                      "radial-gradient(circle at center, transparent 52%, black 53%)",
                  }}
                />

                <div className="text-center z-10">
                  <h2 className="text-2xl font-bold text-white">
                    ₹
                    {Number(
                      total
                    ).toLocaleString()}
                  </h2>

                  <p className="text-[10px] tracking-[0.15em] text-gray-500 mt-1 uppercase">
                    Total
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {categories
                  .slice(0, 3)
                  .map(
                    (
                      cat,
                      index
                    ) => (
                      <div
                        key={
                          index
                        }
                        className="bg-[#0E1423] border border-[#1B2437] px-4 py-3 rounded-xl w-[160px] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              background:
                                cat.color,
                            }}
                          />

                          <span className="text-xs">
                            {
                              cat.name
                            }
                          </span>
                        </div>

                        <span className="font-semibold text-xs">
                          {Math.round(
                            (cat.total /
                              total) *
                            100
                          )}
                          %
                        </span>
                      </div>
                    )
                  )}
              </div>
            </div>
          </div>

          {/* INSIGHTS */}
          <div className="bg-[#0B1020] border border-[#151D31] rounded-2xl p-5 min-h-[290px] flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-semibold mb-5">
                Monthly Insights
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0E1423] border border-[#1B2437] rounded-xl p-4">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-gray-500 mb-2">
                    Highest Spend Day
                  </p>

                  <h2 className="text-[20px] font-bold text-white leading-none mb-2">
                    {highestDay
                      ? new Date(
                          highestDay.expense_date
                        ).toLocaleDateString()
                      : "No data"}
                  </h2>

                  <p className="text-gray-500 text-xs">
                    {highestDay
                      ? `₹${Number(
                          highestDay.total
                        ).toLocaleString()} spent`
                      : "No data"}
                  </p>
                </div>

                <div className="bg-[#0E1423] border border-[#1B2437] rounded-xl p-4">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-gray-500 mb-2">
                    Avg. Daily Spend
                  </p>

                  <h2 className="text-[20px] font-bold text-[#22C55E] leading-none mb-2">
                    ₹
                    {avgDailySpend.toFixed(
                      2
                    )}
                  </h2>

                  <p className="text-green-400 text-xs">
                    Current average
                  </p>
                </div>

                <div className="bg-[#0E1423] border border-[#1B2437] rounded-xl p-4">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-gray-500 mb-2">
                    Expensive Category
                  </p>

                  <h2 className="text-[20px] font-bold text-white leading-none mb-2">
                    {expensiveCategory?.name ||
                      "No data"}
                  </h2>

                  <p className="text-gray-500 text-xs">
                    {expensiveCategory
                      ? `${Math.round(
                          (expensiveCategory.total /
                            total) *
                            100
                        )}% of total spend`
                      : "No data"}
                  </p>
                </div>

                <div className="bg-[#0E1423] border border-[#1B2437] rounded-xl p-4">
                  <p className="text-[9px] uppercase tracking-[0.14em] text-gray-500 mb-2">
                    Monthly Total
                  </p>

                  <h2 className="text-[20px] font-bold text-[#22C55E] leading-none mb-2">
                    ₹
                    {Number(
                      total
                    ).toLocaleString()}
                  </h2>

                  <p className="text-gray-500 text-xs">
                    Current month
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={downloadPDF}
              className="mt-5 w-full bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold py-3 rounded-xl text-sm transition-all"
            >
              DOWNLOAD FULL REPORT (.PDF)
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#0B1020] border border-[#151D31] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#151D31]">
            <h2 className="text-[22px] font-bold text-white">
              Detailed Breakdown
            </h2>
          </div>

          <div className="grid grid-cols-5 px-6 py-3 text-[10px] uppercase tracking-[0.15em] text-gray-500 border-b border-[#151D31]">
            <span>Category</span>
            <span>Budget</span>
            <span>Actual</span>
            <span>Status</span>
            <span>Remaining</span>
          </div>

          {breakdown.map(
            (item, index) => {
              const remaining =
                Number(
                  item.monthly_limit
                ) -
                Number(item.actual);

              const isOver =
                remaining < 0;

              return (
                <div
                  key={index}
                  className="grid grid-cols-5 px-6 py-4 border-b border-[#111827] items-center hover:bg-[#0F172A]"
                >
                  <span className="font-semibold text-sm text-white">
                    {item.name}
                  </span>

                  <span className="text-gray-300 text-sm">
                    ₹
                    {Number(
                      item.monthly_limit
                    ).toLocaleString()}
                  </span>

                  <span className="text-gray-300 text-sm">
                    ₹
                    {Number(
                      item.actual
                    ).toLocaleString()}
                  </span>

                  <span
                    className={`font-semibold text-sm ${
                      isOver
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {isOver
                      ? "Over"
                      : "Good"}
                  </span>

                  <span
                    className={`font-semibold text-sm ${
                      isOver
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    ₹
                    {Math.abs(
                      remaining
                    ).toLocaleString()}
                  </span>
                </div>
              );
            }
          )}
        </div>
      </main>
    </div>
  );
}