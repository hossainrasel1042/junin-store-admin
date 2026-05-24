"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AddProductModal from "@/app/dashboard/components/AddProductModal.jsx";
import EditProductModal from "@/app/dashboard/components/EditProductModal.jsx";
import Image from "next/image";

const ITEMS_PER_PAGE = 20;

function EditIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-7"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 16H9v-3z"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-7"
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

function DeleteConfirmModal({ product, onConfirm, onCancel, isDeleting }) {
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
          Delete Product
        </h3>
        <p className="text-xs text-stone-400 font-light mt-1 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-medium text-stone-600">"{product?.title}"</span>
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
            className="px-5 py-2.5 text-xs font-medium text-white bg-red-400 hover:bg-red-500 rounded-xl"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-stone-50">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="py-3.5 px-6">
          <div
            className="h-3 bg-stone-100 rounded-full animate-pulse"
            style={{ width: `${[60, 40, 30, 25, 20][i]}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export default function ManageProductsPage() {
  const pageRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Auth state
  const [userRole, setUserRole] = useState(null);
  const [userPerms, setUserPerms] = useState({});

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Fetch permissions on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.data) {
        setUserRole(json.data.role);
        setUserPerms(json.data.permissions || {});
      }
    };
    fetchUser();
  }, []);

  const isAdmin = userRole === "admin";
  const canWrite = isAdmin || userPerms?.product?.includes("w");
  const canEdit = isAdmin || userPerms?.product?.includes("u");
  const canDelete = isAdmin || userPerms?.product?.includes("d");

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

  const fetchProducts = useCallback(async (page) => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/products?page=${page}&limit=${ITEMS_PER_PAGE}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch products");
      setProducts(data.data.products);
      setTotalCount(data.data.total);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, fetchProducts]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const token = localStorage.getItem("token");

      // --- UPDATED DELETE FETCH LOGIC ---
      const res = await fetch(`/api/products/delete`, {
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
      fetchProducts(currentPage);
    } catch (err) {
      setDeleteError(err.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set(
      [1, totalPages, currentPage, currentPage - 1, currentPage + 1].filter(
        (p) => p >= 1 && p <= totalPages,
      ),
    );
    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("...");
      result.push(sorted[i]);
    }
    return result;
  };

  const onModalSuccess = () => {
    setIsAddModalOpen(false);
    setEditTarget(null);
    fetchProducts(currentPage);
  };

  return (
    <div ref={pageRef} className="space-y-8">
      {/* Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={onModalSuccess}
      />
      <EditProductModal
        isOpen={!!editTarget}
        product={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={onModalSuccess}
      />

      {deleteTarget && (
        <DeleteConfirmModal
          product={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteTarget(null);
            setDeleteError("");
          }}
          isDeleting={isDeleting}
        />
      )}

      {/* Header */}
      <div className="gsap-fade-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-stone-800">
            Manage Products
          </h1>
          <p className="text-stone-400 text-xs font-light mt-1">
            {isLoading
              ? "Loading..."
              : `${totalCount} product${totalCount !== 1 ? "s" : ""} in inventory`}
          </p>
        </div>
        {canWrite && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-medium text-white bg-rose-400 hover:bg-rose-500 transition-all duration-300 shadow-[0_4px_12px_rgba(251,113,133,0.25)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Product
          </button>
        )}
      </div>

      {(error || deleteError) && (
        <div className="gsap-fade-up p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs font-medium">
          {error || deleteError}
        </div>
      )}

      {/* Table */}
      <div className="gsap-fade-up bg-white rounded-3xl border border-stone-100 shadow-[0_10px_40px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 text-[11px] uppercase tracking-wider text-stone-400">
                <th className="py-3 px-6 font-medium">Product</th>
                <th className="py-3 px-6 font-medium">Type</th>
                <th className="py-3 px-6 font-medium">Price</th>
                <th className="py-3 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 text-[13px] text-stone-600">
              {isLoading ? (
                [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-16 text-center text-stone-400 text-xs font-light"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-stone-50/40 transition-colors group"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            className="w-8 h-8 rounded-lg object-cover border border-stone-100 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-stone-100 shrink-0" />
                        )}
                        <span className="font-medium text-stone-700 truncate max-w-[180px]">
                          {product.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 capitalize">
                      {product.cloth_type}
                    </td>
                    <td className="py-3.5 px-6">
                      ${parseFloat(product.price).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && (
                          <button
                            onClick={() => setEditTarget(product)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-50 transition-all duration-200"
                          >
                            <EditIcon />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-400 hover:bg-red-50 transition-all duration-200"
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-stone-50 flex items-center justify-between gap-4">
            <span className="text-[11px] text-stone-400 font-light shrink-0">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
              {totalCount}
            </span>

            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:border-rose-300 hover:text-rose-400 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {getPageNumbers().map((item, i) =>
                item === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="w-7 h-7 flex items-center justify-center text-[11px] text-stone-300"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => handlePageChange(item)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-medium transition-all duration-200 ${
                      currentPage === item
                        ? "bg-rose-400 text-white shadow-[0_4px_10px_rgba(251,113,133,0.3)]"
                        : "border border-stone-200 text-stone-500 hover:border-rose-300 hover:text-rose-400"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-stone-200 text-stone-400 hover:border-rose-300 hover:text-rose-400 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
