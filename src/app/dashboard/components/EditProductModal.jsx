"use client";

import React, { useState, useEffect, useRef } from "react";
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

export default function EditProductModal({
  isOpen,
  onClose,
  onSuccess,
  product,
}) {
  const modalRef = useRef(null);

  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    cloth_type: "adult",
    category: "",
    size: [],
    color: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      setProductForm({
        title: product.title || "",
        description: product.description || "",
        price: product.price || "",
        cloth_type: product.cloth_type || "adult",
        category: product.attributes?.category || "",
        size: product.attributes?.size || [],
        color: product.attributes?.color || "",
      });
      setExistingImages(product.images || []);
      setNewImages([]);
      setError("");
    }
  }, [product, isOpen]);

  useGSAP(() => {
    if (isOpen && !isSuccess) {
      gsap.fromTo(
        ".gsap-edit-modal",
        { scale: 0.95, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
      );
    }
  }, [isOpen]);

  useGSAP(() => {
    if (isSuccess) {
      gsap.fromTo(
        ".success-toast-edit",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "back.out(1.7)" },
      );
    }
  }, [isSuccess]);

  if (!isOpen || !product) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClothTypeChange = (value) => {
    setProductForm((prev) => ({
      ...prev,
      cloth_type: value,
      category: "",
      size: [],
    }));
  };

  const handleCategoryChange = (value) => {
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
    setNewImages((prev) => {
      const spaceLeft = 6 - (existingImages.length + prev.length);
      const newFiles = files
        .slice(0, spaceLeft)
        .map((file) => ({ file, preview: URL.createObjectURL(file) }));
      return [...prev, ...newFiles];
    });
  };

  const removeExistingImage = (idx) =>
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  const removeNewImage = (idx) =>
    setNewImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (existingImages.length === 0 && newImages.length === 0) {
      setError("Please have at least one image.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", product.id);
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

      existingImages.forEach((imgUrl) =>
        formData.append("existing_images", imgUrl),
      );
      newImages.forEach((img) => formData.append("images", img.file));

      const token = localStorage.getItem("token");
      const response = await fetch("/api/products/update", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update product");

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsLoading(false);
        if (onSuccess) onSuccess();
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

  const totalImages = existingImages.length + newImages.length;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {isSuccess && (
        <div className="success-toast-edit fixed top-8 z-[60] bg-emerald-500 text-white px-6 py-3 rounded-2xl font-medium text-sm">
          Product updated successfully!
        </div>
      )}

      <div
        className="fixed inset-0 bg-stone-900/20 backdrop-blur-xs"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="gsap-edit-modal scrollbar-hidden relative bg-white w-full max-w-lg rounded-3xl border border-stone-100 shadow-xl px-8 py-8 z-10 max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-stone-800 tracking-tight">
            Edit Product
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-500 text-xs font-medium">
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
              required
              disabled={isLoading}
              value={productForm.title}
              onChange={handleInputChange}
              className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none text-stone-700 text-sm"
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
                required
                disabled={isLoading}
                value={productForm.price}
                onChange={handleInputChange}
                className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none text-stone-700 text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5">
                Cloth Type
              </label>
              <AnimatedDropdown
                label={currentClothTypeLabel}
                options={clothTypeOptions}
                buttonClassName="w-full !px-1 !py-1.5 !bg-transparent !border-t-0 !border-l-0 !border-r-0 !border-b !border-stone-200 !rounded-none focus:!border-rose-300 !shadow-none !text-stone-700 !text-sm !font-normal"
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
              buttonClassName="w-full !px-1 !py-1.5 !bg-transparent !border-t-0 !border-l-0 !border-r-0 !border-b !border-stone-200 !rounded-none focus:!border-rose-300 !shadow-none !text-stone-700 !text-sm !font-normal"
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
              className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none text-stone-700 text-sm resize-none"
            />
          </div>

          {/* Sizes + Color */}
          <div className="pt-2">
            <div className="space-y-4 rounded-2xl border border-stone-100 bg-stone-50/40 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="mt-0">
                <label className="block text-[12px] font-medium text-rose-400 mb-2 ml-0.5">
                  {sizeLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizeList.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={isLoading}
                      onClick={() => toggleSize(s)}
                      className={`h-8 px-2 min-w-[2rem] flex items-center justify-center rounded-lg text-[11px] font-semibold ${productForm.size.includes(s) ? "bg-rose-400 text-white" : "bg-white border border-rose-300 text-stone-500"}`}
                    >
                      {s}
                    </button>
                  ))}
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
                  className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none text-stone-700 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2.5 ml-0.5">
              <label className="block text-[12px] font-medium text-stone-700 uppercase">
                Product Images
              </label>
              <span className="text-[11px] text-stone-400">
                {totalImages} / 6
              </span>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 px-1">
              {totalImages < 6 && (
                <label className="shrink-0 w-20 h-20 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 cursor-pointer hover:border-rose-300">
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
              {existingImages.map((url, idx) => (
                <div
                  key={`old-${idx}`}
                  className="shrink-0 relative w-20 h-20 rounded-2xl overflow-hidden group"
                >
                  <img
                    src={url}
                    alt={`old-${idx}`}
                    className="w-full h-full object-cover"
                  />
                  {!isLoading && (
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 text-stone-500 hover:text-rose-500"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {newImages.map((imgObj, idx) => (
                <div
                  key={`new-${idx}`}
                  className="shrink-0 relative w-20 h-20 rounded-2xl overflow-hidden group border-2 border-green-300"
                >
                  <img
                    src={imgObj.preview}
                    alt={`new-${idx}`}
                    className="w-full h-full object-cover"
                  />
                  {!isLoading && (
                    <button
                      type="button"
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 text-stone-500 hover:text-rose-500"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-50">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-xs font-medium text-white bg-rose-400 hover:bg-rose-500 rounded-xl"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
