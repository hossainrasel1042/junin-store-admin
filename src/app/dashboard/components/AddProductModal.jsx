"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AnimatedDropdown from "@/components/DropDown";

const CLOTH_CATEGORIES = {
  women: ["Tops", "Dresses", "Pants", "Outerwear", "Traditional"],
  men: ["Shirts", "Pants", "T-Shirts", "Outerwear", "Traditional"],
  kid: ["Tops", "Bottoms", "Sets", "Outerwear", "Ethnic"],
  teen: ["Tops", "Pants", "Dresses", "Activewear", "Ethnic"],
  adult: ["Tops", "Pants", "Dresses", "Outerwear", "Traditional"],
};

const REGULAR_SIZES = ["S", "M", "L", "XL", "2X", "3X", "4X"];
const WAIST_SIZES = ["28", "30", "32", "34", "36", "38", "40"];

export default function AddProductModal({ isOpen, onClose, onSuccess }) {
  const modalRef = useRef(null);
  const router = useRouter();

  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    cloth_type: "adult",
    category: "",
    size: [],
    color: "",
    images: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useGSAP(() => {
    if (isOpen && !isSuccess) {
      gsap.fromTo(
        ".gsap-product-modal",
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
    setProductForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  // When cloth_type changes, reset category + sizes
  const handleClothTypeChange = (value) => {
    setProductForm((prev) => ({
      ...prev,
      cloth_type: value,
      category: "",
      size: [],
    }));
  };

  const handleCategoryChange = (value) => {
    // When category changes, reset sizes (waist vs regular)
    setProductForm((prev) => ({ ...prev, category: value, size: [] }));
  };

  const toggleSize = (sizeOption) => {
    setProductForm((prev) => {
      const cur = Array.isArray(prev.size) ? prev.size : [];
      return {
        ...prev,
        size: cur.includes(sizeOption)
          ? cur.filter((s) => s !== sizeOption)
          : [...cur, sizeOption],
      };
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (error) setError("");
    setProductForm((prev) => {
      const cur = prev.images || [];
      const spaceLeft = 6 - cur.length;
      const newFiles = files
        .slice(0, spaceLeft)
        .map((file) => ({ file, preview: URL.createObjectURL(file) }));
      return { ...prev, images: [...cur, ...newFiles] };
    });
  };

  const removeImage = (idx) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (productForm.images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", productForm.title);
      formData.append("description", productForm.description);
      formData.append("price", productForm.price);
      formData.append("cloth_type", productForm.cloth_type);
      formData.append(
        "attributes",
        JSON.stringify({
          size: productForm.size,
          color: productForm.color,
          category: productForm.category,
        }),
      );
      productForm.images.forEach((img) => formData.append("images", img.file));

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/products/add", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || data.error || "Failed to add product");

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setProductForm({
          title: "",
          description: "",
          price: "",
          cloth_type: "adult",
          category: "",
          size: [],
          color: "",
          images: [],
        });
        onClose();
        setIsLoading(false);
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
          router.push("/dashboard/product/manage");
        }
      }, 700);
    } catch (err) {
      setError(err.message || "An error occurred");
      setIsLoading(false);
    }
  };

  const clothTypeOptions = [
    { label: "Women", onClick: () => handleClothTypeChange("women") },
    { label: "Men", onClick: () => handleClothTypeChange("men") },
    { label: "Kid", onClick: () => handleClothTypeChange("kid") },
    { label: "Teen", onClick: () => handleClothTypeChange("teen") },
    { label: "Adult", onClick: () => handleClothTypeChange("adult") },
  ];

  const currentCategories = CLOTH_CATEGORIES[productForm.cloth_type] || [];
  const categoryOptions = currentCategories.map((cat) => ({
    label: cat,
    onClick: () => handleCategoryChange(cat),
  }));

  const currentClothTypeLabel =
    clothTypeOptions.find(
      (o) => o.label.toLowerCase() === productForm.cloth_type,
    )?.label || "Select Type";

  const currentCategoryLabel = productForm.category || "Select Category";

  const isPants = productForm.category === "Pants";
  const sizeList = isPants ? WAIST_SIZES : REGULAR_SIZES;
  const sizeLabel = isPants ? "Waist Sizes" : "Available Sizes";

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
          Product added successfully!
        </div>
      )}

      <div
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-xs"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="gsap-product-modal scrollbar-hidden relative bg-white w-full max-w-lg rounded-3xl border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] px-8 py-8 z-10 max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-stone-800 tracking-tight">
            Add New Product
          </h2>
          <p className="text-xs text-stone-400 font-light mt-0.5">
            Create a new item for the storefront.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5">
              Product Title
            </label>
            <input
              name="title"
              type="text"
              required
              disabled={isLoading}
              value={productForm.title}
              onChange={handleInputChange}
              className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm placeholder-stone-300 disabled:opacity-50"
              placeholder="Classic Cotton T-Shirt"
            />
          </div>

          {/* Price + Cloth Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5">
                Price ($)
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                disabled={isLoading}
                value={productForm.price}
                onChange={handleInputChange}
                className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm placeholder-stone-300 disabled:opacity-50"
                placeholder="29.99"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5">
                Cloth Type
              </label>
              <AnimatedDropdown
                label={currentClothTypeLabel}
                options={clothTypeOptions}
                buttonClassName="w-full !px-1 !py-1.5 !bg-transparent !border-t-0 !border-l-0 !border-r-0 !border-b !border-stone-200 !rounded-none focus:!border-rose-300 hover:!bg-transparent hover:!border-rose-300 !shadow-none !text-stone-700 !text-sm !font-normal disabled:opacity-50"
                menuClassName="w-full"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5">
              Category
            </label>
            <AnimatedDropdown
              label={currentCategoryLabel}
              options={categoryOptions}
              buttonClassName="w-full !px-1 !py-1.5 !bg-transparent !border-t-0 !border-l-0 !border-r-0 !border-b !border-stone-200 !rounded-none focus:!border-rose-300 hover:!bg-transparent hover:!border-rose-300 !shadow-none !text-stone-700 !text-sm !font-normal disabled:opacity-50"
              menuClassName="w-full"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5">
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              disabled={isLoading}
              value={productForm.description}
              onChange={handleInputChange}
              className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm placeholder-stone-300 resize-none disabled:opacity-50"
              placeholder="Soft, breathable cotton perfect for everyday wear..."
            />
          </div>

          {/* Sizes + Color */}
          <div className="pt-2">
            <label className="block text-[12px] font-medium text-stone-700 mb-2.5 ml-0.5 uppercase tracking-wider">
              Product Variations
            </label>
            <div className="space-y-4 rounded-2xl border border-stone-100 bg-stone-50/40 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="mt-0">
                <label className="block text-[12px] font-medium text-rose-400 mb-2 ml-0.5">
                  {sizeLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizeList.map((s) => {
                    const isSelected =
                      Array.isArray(productForm.size) &&
                      productForm.size.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={isLoading}
                        onClick={() => toggleSize(s)}
                        className={`h-8 px-2 min-w-[2rem] flex items-center justify-center rounded-lg text-[11px] font-semibold transition-all duration-300 disabled:opacity-50 ${isSelected ? "bg-rose-400 border border-white text-white scale-110 shadow-sm" : "bg-white border border-rose-300 text-stone-500 hover:border-rose-400"}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-0">
                <label className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5">
                  Available Colors
                </label>
                <input
                  name="color"
                  type="text"
                  disabled={isLoading}
                  value={productForm.color}
                  onChange={handleInputChange}
                  className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm placeholder-stone-300 disabled:opacity-50"
                  placeholder="Red, Blue, Black"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2.5 ml-0.5">
              <label className="block text-[12px] font-medium text-stone-700 uppercase tracking-wider">
                Product Images
              </label>
              <span className="text-[11px] font-medium text-stone-400">
                {productForm.images.length} / 6
              </span>
            </div>
            <div className="relative w-full">
              <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
              <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hidden pb-2 px-1">
                {productForm.images.length < 6 && (
                  <label
                    className={`shrink-0 w-20 h-20 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 transition-colors z-0 ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-rose-300 hover:text-rose-400 hover:bg-rose-50/50 cursor-pointer"}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mb-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="text-[10px] font-medium">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isLoading}
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
                {productForm.images.map((imgObj, idx) => (
                  <div
                    key={idx}
                    className="shrink-0 relative w-20 h-20 rounded-2xl overflow-hidden border border-stone-100 group z-0"
                  >
                    <img
                      src={imgObj.preview}
                      alt={`preview-${idx}`}
                      className="w-full h-full object-cover"
                    />
                    {!isLoading && (
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-500 hover:text-rose-500 hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
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
                      </button>
                    )}
                  </div>
                ))}
              </div>
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Publishing...
                </>
              ) : (
                "Publish Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
