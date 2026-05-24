"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function AddCouponModal({ isOpen, onClose, onSuccess }) {
  const modalRef = useRef(null);
  const router = useRouter();

  const [couponForm, setCouponForm] = useState({
    title: "",
    description: "",
    code: "",
    discount_type: "percentage",
    discount_value: "",
    expires_at: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Modal Enter Animation
  useGSAP(() => {
    if (isOpen && !isSuccess) {
      gsap.fromTo(
        ".gsap-coupon-modal",
        { scale: 0.95, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
      );
    }
  }, [isOpen]);

  // Success Toast Animation
  useGSAP(() => {
    if (isSuccess) {
      gsap.fromTo(
        ".success-toast",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "back.out(1.7)" },
      );
    }
  }, [isSuccess]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCouponForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in. Please log in and try again.");
        setIsLoading(false);
        return;
      }

      // Format payload
      const payload = {
        ...couponForm,
        discount_value: parseFloat(couponForm.discount_value),
        expires_at: couponForm.expires_at
          ? new Date(couponForm.expires_at).toISOString()
          : null,
      };

      const response = await fetch("/api/coupon/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to add coupon");
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setCouponForm({
          title: "",
          description: "",
          code: "",
          discount_type: "percentage",
          discount_value: "",
          expires_at: "",
        });
        setIsLoading(false);

        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
          router.push("/dashboard/coupon/manage");
        }
      }, 700);
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Success Toast */}
      {isSuccess && (
        <div className="success-toast fixed top-8 z-[60] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.3)] font-medium text-sm flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Coupon added successfully!
        </div>
      )}

      <div
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-xs"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="gsap-coupon-modal scrollbar-hidden relative bg-white w-full max-w-lg rounded-3xl border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] px-8 py-8 z-10 max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-stone-800 tracking-tight">
            Add New Coupon
          </h2>
          <p className="text-xs text-stone-400 font-light mt-0.5">
            Create a discount code for customers.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5"
              htmlFor="title"
            >
              Coupon Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              disabled={isLoading}
              value={couponForm.title}
              onChange={handleInputChange}
              className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm placeholder-stone-300 disabled:opacity-50"
              placeholder="Summer Sale 2026"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5"
                htmlFor="code"
              >
                Coupon Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                disabled={isLoading}
                value={couponForm.code}
                onChange={handleInputChange}
                className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm placeholder-stone-300 disabled:opacity-50 uppercase"
                placeholder="SUMMER20"
              />
            </div>

            <div>
              <label
                className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5"
                htmlFor="expires_at"
              >
                Expiration Date
              </label>
              <input
                id="expires_at"
                name="expires_at"
                type="date"
                disabled={isLoading}
                value={couponForm.expires_at}
                onChange={handleInputChange}
                className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm placeholder-stone-300 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5"
                htmlFor="discount_type"
              >
                Discount Type
              </label>
              <select
                id="discount_type"
                name="discount_type"
                disabled={isLoading}
                value={couponForm.discount_type}
                onChange={handleInputChange}
                className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm disabled:opacity-50 cursor-pointer"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed_amount">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label
                className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5"
                htmlFor="discount_value"
              >
                Discount Value
              </label>
              <input
                id="discount_value"
                name="discount_value"
                type="number"
                step="0.01"
                min="0"
                required
                disabled={isLoading}
                value={couponForm.discount_value}
                onChange={handleInputChange}
                className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm placeholder-stone-300 disabled:opacity-50"
                placeholder="20"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5"
              htmlFor="description"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows="2"
              disabled={isLoading}
              value={couponForm.description}
              onChange={handleInputChange}
              className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm placeholder-stone-300 resize-none disabled:opacity-50"
              placeholder="Applies to all summer collections..."
            />
          </div>

          <div className="flex justify-end items-center gap-3 pt-4 border-t border-stone-50">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors duration-300 rounded-xl disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-xs font-medium text-white bg-rose-400 hover:bg-rose-500 rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(251,113,133,0.2)] disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-3 w-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Publishing...
                </>
              ) : (
                "Publish Coupon"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
