"use client";

import { useState } from "react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  actions?: (row: T) => React.ReactNode;
}

export default function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  searchPlaceholder = "Search records...",
  onSearch,
  actions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
    setCurrentPage(1);
  };

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    const str = JSON.stringify(item).toLowerCase();
    return str.includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="admin-card" style={{ padding: 0, display: "flex", flexDirection: "column" }}>
      {/* Table Header Tools */}
      <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "250px", maxWidth: "400px" }}>
          <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "#64748b" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            style={{ width: "100%", padding: "8px 16px 8px 36px", background: "rgba(6, 8, 16, 0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#e2e8f0", fontSize: "12px", outline: "none" }}
            onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />
        </div>

        <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
          Showing <span style={{ color: "#e2e8f0" }}>{paginatedData.length}</span> of <span style={{ color: "#e2e8f0" }}>{filteredData.length}</span> entries
        </div>
      </div>

      {/* Table Content */}
      <div className="admin-table-wrapper" style={{ borderRadius: 0, border: "none" }}>
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col.header}</th>
              ))}
              {actions && <th style={{ textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rIdx) => (
                <tr key={row.id || rIdx}>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx}>
                      {col.cell ? col.cell(row) : (row[col.accessorKey!] as any)}
                    </td>
                  ))}
                  {actions && <td style={{ textAlign: "right" }}>{actions(row)}</td>}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(6, 8, 16, 0.4)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="admin-filter-btn"
          style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
        >
          &larr; Previous
        </button>

        <span style={{ color: "#64748b" }}>
          Page <strong style={{ color: "#c084fc" }}>{currentPage}</strong> of <strong style={{ color: "#e2e8f0" }}>{totalPages}</strong>
        </span>

        <button
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className="admin-filter-btn"
          style={{ opacity: currentPage >= totalPages ? 0.5 : 1 }}
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
