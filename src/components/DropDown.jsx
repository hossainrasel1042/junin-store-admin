"use client";
import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
export default function AnimatedDropdown({
  label = "Options",
  options = [],
  buttonClassName = "",
  menuClassName = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const tl = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useGSAP(
    () => {
      gsap.set(".dd-menu", { autoAlpha: 0, yPercent: -20, scale: 0.85 });

      tl.current = gsap
        .timeline({ paused: true })
        .to(
          ".dd-arrow",
          {
            rotation: 180,
            duration: 0.8,
            ease: "elastic.out(1.2, 0.3)",
          },
          0,
        )
        .to(
          ".dd-menu",
          {
            autoAlpha: 1,
            yPercent: 0,
            scale: 1,
            duration: 0.8,
            ease: "elastic.out(1.2, 0.3)",
          },
          0,
        )
        .fromTo(
          ".dd-item",
          { opacity: 0, x: -15 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "back.out(2)",
            stagger: 0.05,
          },
          0.1,
        );
    },
    { scope: containerRef },
  );

  useEffect(() => {
    if (isOpen) {
      tl.current?.timeScale(1).play();
    } else {
      tl.current?.timeScale(2).reverse();
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-[13px] font-medium text-stone-600 hover:text-stone-800 hover:border-rose-200 hover:bg-rose-50/50 transition-colors focus:outline-none shadow-sm ${buttonClassName}`}
      >
        <span>{label}</span>
        <svg
          className="dd-arrow text-stone-400"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        className={`dd-menu absolute right-0 mt-2 w-48 bg-white border border-stone-100 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] py-2 z-50 overflow-hidden invisible ${menuClassName}`}
      >
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (option.onClick) option.onClick();
              setIsOpen(false);
            }}
            className="dd-item w-full flex items-center gap-3 text-left px-4 py-2.5 text-[13px] text-stone-500 hover:text-rose-500 hover:bg-rose-50/50 transition-colors focus:outline-none"
          >
            {option.icon && (
              <span className="text-stone-400 group-hover:text-rose-400 transition-colors">
                {option.icon}
              </span>
            )}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
