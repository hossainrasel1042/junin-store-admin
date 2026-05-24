"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const ITEMS_PER_PAGE = 20;

const ACTION_LABELS = { r: "Read", w: "Create", u: "Update", d: "Delete" };
const ACTION_STYLES = {
  r: "bg-blue-50    text-blue-500    border-blue-100",
  w: "bg-emerald-50 text-emerald-500 border-emerald-100",
  u: "bg-amber-50   text-amber-500   border-amber-100",
  d: "bg-red-50     text-red-400     border-red-100",
};

const ROLE_STYLES = {
  admin: "bg-violet-50 text-violet-500 border-violet-100",
  staff: "bg-stone-100 text-stone-500  border-stone-200",
};

// ── Icons ──────────────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-4 text-stone-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-4 text-stone-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-stone-50">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="py-3.5 px-5">
          <div
            className="h-3 bg-stone-100 rounded-full animate-pulse"
            style={{ width: `${[40, 20, 20, 25, 30, 35][i]}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function AuditPage() {
  const pageRef = useRef(null);

  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Search
  const [phoneInput, setPhoneInput] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  useGSAP(
    () => {
      gsap.from(".gsap-fade-up", {
        y: 15,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power2.out",
      });
    },
    { scope: pageRef },
  );

  // ── Fetch list ───────────────────────────────────────────────────────
  const fetchLogs = useCallback(async (page, phone = "") => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page });
      if (phone) params.set("phone", phone);

      const res = await fetch(`/api/audit?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch audit logs");

      setLogs(data.data.logs);
      setTotalCount(data.data.total);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(currentPage, isSearchMode ? searchPhone : "");
  }, [currentPage, fetchLogs, isSearchMode, searchPhone]);

  // ── Search ───────────────────────────────────────────────────────────
  const handleSearch = async () => {
    const phone = phoneInput.trim();
    if (!phone) return;
    setIsSearching(true);
    setCurrentPage(1);
    setSearchPhone(phone);
    setIsSearchMode(true);
    setIsSearching(false);
  };

  const clearSearch = () => {
    setPhoneInput("");
    setSearchPhone("");
    setIsSearchMode(false);
    setCurrentPage(1);
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // ── Pagination ───────────────────────────────────────────────────────
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div ref={pageRef} className="space-y-8">
      {/* Header */}
      <div className="gsap-fade-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldIcon />
            <h1 className="text-xl font-medium tracking-tight text-stone-800">
              Audit Log
            </h1>
          </div>
          <p className="text-stone-400 text-xs font-light mt-1">
            {isLoading
              ? "Loading..."
              : isSearchMode
                ? `${totalCount} action${totalCount !== 1 ? "s" : ""} for "${searchPhone}"`
                : `${totalCount} total action${totalCount !== 1 ? "s" : ""} recorded`}
          </p>
        </div>

        {/* Phone search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by phone…"
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-white text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 w-48 transition-all"
            />
          </div>

          {isSearchMode ? (
            <button
              onClick={clearSearch}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-stone-500 border border-stone-200 hover:border-stone-300 transition-all"
            >
              <XIcon /> Clear
            </button>
          ) : (
            <button
              onClick={handleSearch}
              disabled={isSearching || !phoneInput.trim()}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-medium text-white bg-rose-400 hover:bg-rose-500 disabled:opacity-50 transition-all duration-200 shadow-[0_4px_12px_rgba(251,113,133,0.25)]"
            >
              {isSearching ? "Searching…" : "Search"}
            </button>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="gsap-fade-up p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Read-only notice */}
      <div className="gsap-fade-up flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-100 w-fit">
        <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
        <p className="text-[11px] text-stone-400 font-light">
          Audit logs are read-only and cannot be modified or deleted.
        </p>
      </div>

      {/* Table */}
      <div className="gsap-fade-up bg-white rounded-3xl border border-stone-100 shadow-[0_10px_40px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 text-[11px] uppercase tracking-wider text-stone-400">
                <th className="py-3 px-5 font-medium">Name / Email</th>
                <th className="py-3 px-5 font-medium">Phone</th>
                <th className="py-3 px-5 font-medium">Role</th>
                <th className="py-3 px-5 font-medium">Action</th>
                <th className="py-3 px-5 font-medium">Module</th>
                <th className="py-3 px-5 font-medium">IP Address</th>
                <th className="py-3 px-5 font-medium">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 text-[13px] text-stone-600">
              {isLoading ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-stone-400 text-xs font-light"
                  >
                    {isSearchMode
                      ? `No logs found for "${searchPhone}".`
                      : "No audit logs yet."}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-stone-50/40 transition-colors"
                  >
                    {/* Name */}
                    <td className="py-3.5 px-5 font-medium text-stone-700 whitespace-nowrap">
                      {log.user_name}
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-5 text-stone-500 whitespace-nowrap">
                      {log.user_phone || (
                        <span className="text-stone-300">—</span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-medium capitalize ${ROLE_STYLES[log.user_role] || ROLE_STYLES.staff}`}
                      >
                        {log.user_role}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${ACTION_STYLES[log.action] || "bg-stone-100 text-stone-500 border-stone-200"}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>

                    {/* Module */}
                    <td className="py-3.5 px-5">
                      <span className="inline-block bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md text-[11px] font-medium capitalize">
                        {log.module}
                      </span>
                    </td>

                    {/* IP */}
                    <td className="py-3.5 px-5 text-stone-400 font-mono text-[11px] whitespace-nowrap">
                      {log.ip_address || (
                        <span className="text-stone-300">—</span>
                      )}
                    </td>

                    {/* When */}
                    <td className="py-3.5 px-5 text-stone-400 text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="gsap-fade-up flex items-center justify-between text-xs text-stone-400">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-7 h-7 rounded-lg text-xs transition-colors ${
                    currentPage === page
                      ? "bg-rose-400 text-white font-medium"
                      : "border border-stone-200 hover:border-stone-300 text-stone-500"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
