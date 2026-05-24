"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AddStaffModal from "@/app/dashboard/components/AddStaffModal.jsx";
import EditStaffModal from "@/app/dashboard/components/EditStaffModal.jsx";
import Image from "next/image";
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

function DeleteConfirmModal({ user, onConfirm, onCancel, isDeleting }) {
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
          Delete User
        </h3>
        <p className="text-xs text-stone-400 font-light mt-1 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-medium text-stone-600">"{user?.email}"</span>?
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

function SkeletonRow() {
  return (
    <tr className="border-b border-stone-50">
      {[...Array(4)].map((_, i) => (
        <td key={i} className="py-3.5 px-6">
          <div
            className="h-3 bg-stone-100 rounded-full animate-pulse"
            style={{ width: `${[60, 40, 30, 20][i]}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export default function ManageStaffPage() {
  const pageRef = useRef(null);

  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Auth state
  const [userRole, setUserRole] = useState(null);
  const [userPerms, setUserPerms] = useState({});

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
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
  const canWrite = isAdmin || userPerms?.staff?.includes("w");
  const canEdit = isAdmin || userPerms?.staff?.includes("u");
  const canDelete = isAdmin || userPerms?.staff?.includes("d");

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

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch staff");
      setStaff(data.data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/staff/delete`, {
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
      fetchStaff();
    } catch (err) {
      setDeleteError(err.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const onModalSuccess = () => {
    setIsAddModalOpen(false);
    setEditTarget(null);
    fetchStaff();
  };

  return (
    <div ref={pageRef} className="space-y-8">
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={onModalSuccess}
      />
      <EditStaffModal
        isOpen={!!editTarget}
        user={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={onModalSuccess}
      />

      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteTarget(null);
            setDeleteError("");
          }}
          isDeleting={isDeleting}
        />
      )}

      <div className="gsap-fade-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-stone-800">
            Manage Staff
          </h1>
          <p className="text-stone-400 text-xs font-light mt-1">
            {isLoading
              ? "Loading..."
              : `${staff.length} active member${staff.length !== 1 ? "s" : ""}`}
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
            Add Staff
          </button>
        )}
      </div>

      {(error || deleteError) && (
        <div className="gsap-fade-up p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs font-medium">
          {error || deleteError}
        </div>
      )}

      <div className="gsap-fade-up bg-white rounded-3xl border border-stone-100 shadow-[0_10px_40px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 text-[11px] uppercase tracking-wider text-stone-400">
                <th className="py-3 px-6 font-medium">User Profile</th>
                <th className="py-3 px-6 font-medium">Role</th>
                <th className="py-3 px-6 font-medium">Phone</th>
                <th className="py-3 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 text-[13px] text-stone-600">
              {isLoading ? (
                [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
              ) : staff.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-16 text-center text-stone-400 text-xs font-light"
                  >
                    No staff members found.
                  </td>
                </tr>
              ) : (
                staff.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-stone-50/40 transition-colors group"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        {user.profile_img ? (
                          <Image
                            src={user.profile_img}
                            alt="Profile"
                            className="w-8 h-8 rounded-full object-cover border border-stone-100 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-stone-300"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        )}
                        <span className="font-medium text-stone-700 truncate max-w-[200px]">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold tracking-widest uppercase ${user.role === "admin" ? "bg-indigo-50 text-indigo-600" : "bg-stone-100 text-stone-600"}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">{user.phone || "—"}</td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && (
                          <button
                            onClick={() => setEditTarget(user)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-50 transition-all duration-200"
                          >
                            <EditIcon />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteTarget(user)}
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
      </div>
    </div>
  );
}
