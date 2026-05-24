"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const ITEMS_PER_PAGE = 20;

const STATUS_OPTIONS = [
  "pending",
  "processing",
  "packaged",
  "delivered_to_courier",
  "rejected",
];
const STATUS_STYLES = {
  pending: "bg-amber-50   text-amber-500   border-amber-100",
  processing: "bg-blue-50    text-blue-500    border-blue-100",
  packaged: "bg-violet-50  text-violet-500  border-violet-100",
  delivered_to_courier: "bg-emerald-50 text-emerald-500 border-emerald-100",
  rejected: "bg-red-50     text-red-400     border-red-100",
};

const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  packaged: "Packaged",
  delivered_to_courier: "Delivered to Courier",
  rejected: "Rejected",
};

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 011-1h4a1 1 0 011 1m-7 0H5m14 0h-2"
      />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

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

// ── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-stone-50">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="py-3.5 px-5">
          <div
            className="h-3 bg-stone-100 rounded-full animate-pulse"
            style={{ width: `${[55, 35, 30, 50, 25, 20, 15][i]}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ── Delete confirm modal ───────────────────────────────────────────────────
function DeleteConfirmModal({ order, onConfirm, onCancel, isDeleting }) {
  useGSAP(() => {
    gsap.fromTo(
      ".gsap-delete-modal",
      { scale: 0.95, opacity: 0, y: 10 },
      { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: "power3.out" },
    );
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-xs"
        onClick={!isDeleting ? onCancel : undefined}
      />
      <div className="gsap-delete-modal relative bg-white w-full max-w-sm rounded-3xl border p-7 z-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
        <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <TrashIcon />
        </div>
        <h3 className="text-sm font-medium text-stone-800 tracking-tight">
          Delete Order
        </h3>
        <p className="text-xs text-stone-400 font-light mt-1 mb-6">
          Are you sure you want to delete order{" "}
          <span className="font-medium text-stone-600">
            `{order?.order_id}` · {order?.user_name}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 text-xs font-medium text-white bg-red-400 hover:bg-red-500 rounded-xl transition-colors"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit status modal ──────────────────────────────────────────────────────
function EditStatusModal({ order, onConfirm, onCancel, isSaving }) {
  const [selectedStatus, setSelectedStatus] = useState(
    order?.status || "pending",
  );

  useGSAP(() => {
    gsap.fromTo(
      ".gsap-edit-modal",
      { scale: 0.95, opacity: 0, y: 10 },
      { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: "power3.out" },
    );
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-xs"
        onClick={!isSaving ? onCancel : undefined}
      />
      <div className="gsap-edit-modal relative bg-white w-full max-w-sm rounded-3xl border p-7 z-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
        <div className="w-10 h-10 bg-stone-50 rounded-2xl flex items-center justify-center mb-4">
          <EditIcon />
        </div>
        <h3 className="text-sm font-medium text-stone-800 tracking-tight">
          Update Order Status
        </h3>
        <p className="text-xs text-stone-400 font-light mt-1 mb-5">
          Order{" "}
          <span className="font-medium text-stone-600">{order?.order_id}</span>{" "}
          · {order?.user_name}
        </p>

        <div className="flex flex-col gap-2 mb-6">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all duration-150 ${
                selectedStatus === s
                  ? `${STATUS_STYLES[s]} ring-1 ring-offset-0`
                  : "border-stone-100 text-stone-500 hover:border-stone-200"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${selectedStatus === s ? "bg-current" : "bg-stone-300"}`}
              />
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-600"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedStatus)}
            disabled={isSaving || selectedStatus === order?.status}
            className="px-5 py-2.5 text-xs font-medium text-white bg-rose-400 hover:bg-rose-500 disabled:opacity-50 rounded-xl transition-colors"
          >
            {isSaving ? "Saving..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ManageOrdersPage() {
  const pageRef = useRef(null);

  // List state
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Search state
  const [phoneInput, setPhoneInput] = useState("");
  const [searchPhone, setSearchPhone] = useState(""); // committed search term
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null); // null = not in search mode

  // Modals
  const [editTarget, setEditTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

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

  // ── Fetch paginated list ─────────────────────────────────────────────
  const fetchOrders = useCallback(async (page) => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/order?page=${page}&limit=${ITEMS_PER_PAGE}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
      setOrders(data.data.orders);
      setTotalCount(data.data.total);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchResults === null) fetchOrders(currentPage);
  }, [currentPage, fetchOrders, searchResults]);

  // ── Phone search ─────────────────────────────────────────────────────
  const handleSearch = async () => {
    const phone = phoneInput.trim();
    if (!phone) return;
    setIsSearching(true);
    setSearchResults(null);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/order/search?phone=${encodeURIComponent(phone)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Search failed");
      setSearchResults(data.data.orders);
      setSearchPhone(phone);
    } catch (err) {
      setError(err.message || "Search failed");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setPhoneInput("");
    setSearchPhone("");
    setSearchResults(null);
    setError("");
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // ── Pagination ───────────────────────────────────────────────────────
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Edit status ──────────────────────────────────────────────────────
  const handleEditConfirm = async (newStatus) => {
    if (!editTarget) return;
    setIsSaving(true);
    setActionError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/order", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: editTarget.id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setEditTarget(null);
      // Refresh whichever view is active
      if (searchResults !== null) {
        setSearchResults((prev) =>
          prev.map((o) =>
            o.id === editTarget.id ? { ...o, status: newStatus } : o,
          ),
        );
      } else {
        fetchOrders(currentPage);
      }
    } catch (err) {
      setActionError(err.message || "Failed to update status");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setActionError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/order", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      setDeleteTarget(null);
      if (searchResults !== null) {
        setSearchResults((prev) =>
          prev.filter((o) => o.id !== deleteTarget.id),
        );
      } else {
        fetchOrders(currentPage);
      }
    } catch (err) {
      setActionError(err.message || "Failed to delete order");
    } finally {
      setIsDeleting(false);
    }
  };

  const displayedOrders = searchResults !== null ? searchResults : orders;
  const isSearchMode = searchResults !== null;

  return (
    <div ref={pageRef} className="space-y-8">
      {/* Modals */}
      {editTarget && (
        <EditStatusModal
          order={editTarget}
          onConfirm={handleEditConfirm}
          onCancel={() => {
            setEditTarget(null);
            setActionError("");
          }}
          isSaving={isSaving}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          order={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteTarget(null);
            setActionError("");
          }}
          isDeleting={isDeleting}
        />
      )}

      {/* Header */}
      <div className="gsap-fade-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-stone-800">
            Manage Orders
          </h1>
          <p className="text-stone-400 text-xs font-light mt-1">
            {isLoading
              ? "Loading..."
              : isSearchMode
                ? `${displayedOrders.length} result${displayedOrders.length !== 1 ? "s" : ""} for "${searchPhone}"`
                : `${totalCount} order${totalCount !== 1 ? "s" : ""} total`}
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
              onKeyDown={handleSearchKeyDown}
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
      {(error || actionError) && (
        <div className="gsap-fade-up p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs font-medium">
          {error || actionError}
        </div>
      )}

      {/* Table */}
      <div className="gsap-fade-up bg-white rounded-3xl border border-stone-100 shadow-[0_10px_40px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 text-[11px] uppercase tracking-wider text-stone-400">
                <th className="py-3 px-5 font-medium">Order ID</th>
                <th className="py-3 px-5 font-medium">Customer</th>
                <th className="py-3 px-5 font-medium">Phone</th>
                <th className="py-3 px-5 font-medium">Address</th>
                <th className="py-3 px-5 font-medium">Total</th>
                <th className="py-3 px-5 font-medium">Status</th>
                <th className="py-3 px-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 text-[13px] text-stone-600">
              {isLoading && !isSearchMode ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
              ) : displayedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-stone-400 text-xs font-light"
                  >
                    {isSearchMode
                      ? `No orders found for "${searchPhone}".`
                      : "No orders found."}
                  </td>
                </tr>
              ) : (
                displayedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-stone-50/40 transition-colors group"
                  >
                    {/* Order ID */}
                    <td className="py-3.5 px-5">
                      <span className="inline-block bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-widest uppercase">
                        {order.order_id}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-5 font-medium text-stone-700 whitespace-nowrap">
                      {order.user_name}
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-5 text-stone-500 whitespace-nowrap">
                      {order.user_phone}
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-5 text-stone-500 max-w-[180px]">
                      <span
                        className="block truncate"
                        title={`${order.user_address}, ${order.user_city}`}
                      >
                        {order.user_address}, {order.user_city}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-5 font-medium text-stone-700 whitespace-nowrap">
                      ৳
                      {Number(order.total_payment).toLocaleString("en-BD", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${STATUS_STYLES[order.status]}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setActionError("");
                            setEditTarget(order);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-50 transition-all duration-200"
                          title="Update status"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => {
                            setActionError("");
                            setDeleteTarget(order);
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-400 hover:bg-red-50 transition-all duration-200"
                          title="Delete order"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination — hidden in search mode */}
      {!isSearchMode && totalPages > 1 && (
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
