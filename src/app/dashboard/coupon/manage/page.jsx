"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AddCouponModal from "@/app/dashboard/components/AddCouponModal.jsx";

const ITEMS_PER_PAGE = 20;

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-5"
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

function DeleteConfirmModal({ coupon, onConfirm, onCancel, isDeleting }) {
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
        <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center mb-4 text-red-500">
          <TrashIcon />
        </div>
        <h3 className="text-sm font-medium text-stone-800 tracking-tight">
          Delete Coupon
        </h3>
        <p className="text-xs text-stone-400 font-light mt-1 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-medium text-stone-600">"{coupon?.code}"</span>?
          This action cannot be undone.
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

export default function ManageCouponsPage() {
  const pageRef = useRef(null);

  const [coupons, setCoupons] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Auth state
  const [userRole, setUserRole] = useState(null);
  const [userPerms, setUserPerms] = useState({});

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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
  const canWrite = isAdmin || userPerms?.coupon?.includes("w");
  const canDelete = isAdmin || userPerms?.coupon?.includes("d");

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

  const fetchCoupons = useCallback(async (page) => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/coupon?page=${page}&limit=${ITEMS_PER_PAGE}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch coupons");
      setCoupons(data.data.coupons);
      setTotalCount(data.data.total);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons(currentPage);
  }, [currentPage, fetchCoupons]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/coupon/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: deleteTarget.id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setDeleteTarget(null);
      fetchCoupons(currentPage);
    } catch (err) {
      setDeleteError(err.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div ref={pageRef} className="space-y-8">
      <AddCouponModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchCoupons(currentPage);
        }}
      />

      {deleteTarget && (
        <DeleteConfirmModal
          coupon={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      <div className="gsap-fade-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-stone-800">
            Manage Coupons
          </h1>
          <p className="text-stone-400 text-xs font-light mt-1">
            {totalCount} active coupons
          </p>
        </div>
        {canWrite && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-medium text-white bg-rose-400 hover:bg-rose-500 transition-all duration-300 shadow-sm"
          >
            Add Coupon
          </button>
        )}
      </div>

      <div className="gsap-fade-up bg-white rounded-3xl border border-stone-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-100 text-[11px] uppercase tracking-wider text-stone-400">
              <th className="py-3 px-6">Coupon Title</th>
              <th className="py-3 px-6">Code</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr
                key={coupon.id}
                className="border-b border-stone-50 hover:bg-stone-50/40"
              >
                <td className="py-3.5 px-6 font-medium text-stone-700">
                  {coupon.title}
                </td>
                <td className="py-3.5 px-6 font-bold tracking-widest uppercase text-stone-500">
                  {coupon.code}
                </td>
                <td className="py-3.5 px-6">
                  {canDelete && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => setDeleteTarget(coupon)}
                        className="text-stone-400 hover:text-red-400 transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
