"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function EditStaffModal({ isOpen, user, onClose, onSuccess }) {
  const modalRef = useRef(null);

  const defaultPermissions = {
    product: { r: false, w: false, u: false, d: false },
    coupon: { r: false, w: false, u: false, d: false },
    order: { r: false, w: false, u: false, d: false },
    staff: { r: false, w: false, u: false, d: false },
  };

  const [staffForm, setStaffForm] = useState({
    id: "",
    full_name: "", // <-- Added full_name
    email: "",
    password: "", // Optional for updating
    phone: "",
    role: "staff",
    profileImg: null, // New upload
    existingImgUrl: "",
    permissions: defaultPermissions,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      // Parse API permissions array back to boolean map
      const parsedPerms = JSON.parse(JSON.stringify(defaultPermissions));
      if (user.permissions) {
        for (const [module, actions] of Object.entries(user.permissions)) {
          if (parsedPerms[module]) {
            actions.forEach((act) => {
              if (act in parsedPerms[module]) parsedPerms[module][act] = true;
            });
          }
        }
      }

      setStaffForm({
        id: user.id,
        full_name: user.full_name || "", // <-- Mapped full_name
        email: user.email || "",
        password: "",
        phone: user.phone || "",
        role: user.role || "staff",
        existingImgUrl: user.profile_img || "",
        profileImg: null,
        permissions: parsedPerms,
      });
    }
  }, [user, isOpen]);

  useGSAP(() => {
    if (isOpen && !isSuccess) {
      gsap.fromTo(
        ".gsap-edit-staff",
        { scale: 0.95, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
      );
    }
  }, [isOpen]);

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
    setStaffForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (error) setError("");
    setStaffForm((prev) => ({
      ...prev,
      profileImg: { file, preview: URL.createObjectURL(file) },
    }));
  };

  const removeImage = () => {
    setStaffForm((prev) => ({ ...prev, profileImg: null, existingImgUrl: "" })); // Optional: Handle image deletion on backend if needed
  };

  const handlePermissionToggle = (category, action) => {
    setStaffForm((prev) => {
      const currentCategory = prev.permissions[category];
      let newCategory = {
        ...currentCategory,
        [action]: !currentCategory[action],
      };

      if (action !== "r" && newCategory[action] === true) newCategory.r = true;
      if (action === "r" && newCategory.r === false) {
        if ("w" in newCategory) newCategory.w = false;
        if ("u" in newCategory) newCategory.u = false;
        if ("d" in newCategory) newCategory.d = false;
      }
      return {
        ...prev,
        permissions: { ...prev.permissions, [category]: newCategory },
      };
    });
  };

  const formatPermissionsForApi = (perms) => {
    const apiPerms = {};
    for (const [module, actions] of Object.entries(perms)) {
      const activeActions = Object.keys(actions).filter((key) => actions[key]);
      if (activeActions.length > 0) apiPerms[module] = activeActions;
    }
    return JSON.stringify(apiPerms);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("id", staffForm.id);
      formData.append("full_name", staffForm.full_name); // <-- Appended full_name
      formData.append("email", staffForm.email);
      if (staffForm.password) formData.append("password", staffForm.password); // Only send if updating password
      if (staffForm.phone) formData.append("phone", staffForm.phone);
      formData.append("role", staffForm.role);
      formData.append(
        "permissions",
        formatPermissionsForApi(staffForm.permissions),
      );

      if (staffForm.profileImg?.file) {
        formData.append("profile_img", staffForm.profileImg.file);
      }

      const token = localStorage.getItem("token");
      const response = await fetch("/api/staff/update", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || data.error || "Failed to update staff");

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsLoading(false);
        if (onSuccess) onSuccess();
        else onClose();
      }, 700);
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const categories = Object.keys(defaultPermissions);
  const displayPreview =
    staffForm.profileImg?.preview || staffForm.existingImgUrl;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
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
          Staff member updated successfully!
        </div>
      )}

      <div
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-xs"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="gsap-edit-staff scrollbar-hidden relative bg-white w-full max-w-lg rounded-3xl border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] px-8 py-8 z-10 max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-stone-800 tracking-tight">
            Edit Staff Member
          </h2>
          <p className="text-xs text-stone-400 font-light mt-0.5">
            Modify operator permissions and authentication profile.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-start gap-5">
            <div className="relative shrink-0 mt-2">
              {displayPreview ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-stone-100 group relative">
                  <img
                    src={displayPreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                  {!isLoading && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                <label
                  className={`w-16 h-16 flex flex-col items-center justify-center rounded-full border-2 border-dashed border-stone-200 text-stone-400 transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-rose-300 hover:text-rose-400 hover:bg-rose-50/50 cursor-pointer"}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mb-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <span className="text-[9px] font-medium uppercase">
                    Upload
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isLoading}
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <div className="flex-1 space-y-4">
              {/* Added Full Name Field */}
              <div>
                <label
                  className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5"
                  htmlFor="full_name"
                >
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  minLength="6"
                  disabled={isLoading}
                  value={staffForm.full_name}
                  onChange={handleInputChange}
                  className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm placeholder-stone-300 disabled:opacity-50"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label
                  className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={isLoading}
                  value={staffForm.email}
                  onChange={handleInputChange}
                  className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm placeholder-stone-300 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5"
                htmlFor="password"
              >
                Update Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                disabled={isLoading}
                value={staffForm.password}
                onChange={handleInputChange}
                className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm placeholder-stone-300 disabled:opacity-50"
                placeholder="Leave blank to keep current"
              />
            </div>
            <div>
              <label
                className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5"
                htmlFor="phone"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                disabled={isLoading}
                value={staffForm.phone}
                onChange={handleInputChange}
                className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm placeholder-stone-300 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label
              className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5"
              htmlFor="role"
            >
              Account Level
            </label>
            <select
              id="role"
              name="role"
              disabled={isLoading}
              value={staffForm.role}
              onChange={handleInputChange}
              className="w-full py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm cursor-pointer disabled:opacity-50"
            >
              <option value="staff">Staff Operator</option>
              <option value="admin">System Admin</option>
            </select>
          </div>

          <div className="pt-2">
            <label className="block text-[12px] font-medium text-stone-700 mb-2.5 ml-0.5 uppercase tracking-wider">
              System Permissions
            </label>
            <div className="space-y-4 rounded-2xl border border-stone-100 bg-stone-50/40 p-4">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 last:border-0 last:pb-0"
                >
                  <span className="text-[13px] font-medium text-stone-700 w-20 capitalize">
                    {category}
                  </span>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {Object.keys(defaultPermissions[category]).map((key) => (
                      <label
                        key={key}
                        className="flex items-center cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          disabled={isLoading}
                          checked={staffForm.permissions[category][key]}
                          onChange={() => handlePermissionToggle(category, key)}
                          className="form-checkbox h-3.5 w-3.5 text-rose-400 rounded-sm border-stone-300 focus:ring-rose-400 focus:ring-offset-0 cursor-pointer transition-colors disabled:opacity-50"
                        />
                        <span className="ml-1.5 text-[12px] text-stone-500 uppercase group-hover:text-stone-800 transition-colors disabled:opacity-50">
                          {key === "r"
                            ? "Read"
                            : key === "w"
                              ? "Write"
                              : key === "u"
                                ? "Update"
                                : "Delete"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
              {isLoading ? "Saving..." : "Update Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
