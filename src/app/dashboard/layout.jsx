"use client";
import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRouter, usePathname } from "next/navigation";
import AddProductModal from "./components/AddProductModal.jsx";
import AddCouponModal from "./components/AddCouponModal.jsx";
import AddStaffModal from "./components/AddStaffModal.jsx";
export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userData, setUserData] = useState({
    full_name: null,
    email: null,
    profile_img: null,
    role: null,
    permissions: {},
  });

  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddCouponModalOpen, setIsAddCouponModalOpen] = useState(false);

  const [activeNav, setActiveNav] = useState("Analytics");

  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!pathname) return;

    if (pathname.includes("/dashboard/product")) {
      setActiveNav("Products");
      setOpenDropdown("products");
    } else if (pathname.includes("/dashboard/coupon")) {
      setActiveNav("Coupons");
      setOpenDropdown("coupons");
    } else if (pathname.includes("/dashboard/staff")) {
      setActiveNav("Staff");
      setOpenDropdown("staff");
    } else if (pathname.includes("/dashboard/orders")) {
      setActiveNav("Orders");
      setOpenDropdown(null);
    } else if (pathname.includes("/dashboard/audit")) {
      setActiveNav("Audit");
      setOpenDropdown(null);
    } else if (pathname.includes("/dashboard/setting")) {
      setActiveNav("Settings");
      setOpenDropdown(null);
    } else if (pathname === "/dashboard") {
      setActiveNav("Analytics");
      setOpenDropdown(null);
    }
  }, [pathname]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();

        if (json.data) {
          setUserData({
            full_name: json.data.full_name,
            email: json.data.email,
            profile_img: json.data.profile_img,
            role: json.data.role,
            permissions: json.data.permissions,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  useGSAP(
    () => {
      gsap.from(".gsap-sidebar-item", {
        x: -20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: "power2.out",
      });
    },
    { scope: sidebarRef },
  );

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;";
    window.location.replace("/");
  };
  const navItems = [
    {
      label: "Analytics",
      onClick: () => {
        router.push("/dashboard");
        setIsMobileMenuOpen(false);
      },
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"
          />
        </svg>
      ),
    },
    {
      label: "Products",
      dropdownKey: "products",
      hasDropdown: true,
      subItems: [
        {
          name: "Add Product",
          onClick: () => {
            setIsAddProductModalOpen(true);
            setIsMobileMenuOpen(false);
          },
        },
        {
          name: "Manage Products",
          onClick: () => {
            router.push("/dashboard/product/manage");
            setIsMobileMenuOpen(false);
          },
        },
      ],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      label: "Coupons",
      dropdownKey: "coupons",
      hasDropdown: true,
      subItems: [
        {
          name: "Add Coupon",
          onClick: () => {
            setIsAddCouponModalOpen(true);
            setIsMobileMenuOpen(false);
          },
        },
        {
          name: "Manage Coupons",
          onClick: () => {
            router.push("/dashboard/coupon/manage");
            setIsMobileMenuOpen(false);
          },
        },
      ],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      ),
    },
    {
      label: "Staff",
      dropdownKey: "staff",
      hasDropdown: true,
      subItems: [
        {
          name: "Add Staff",
          onClick: () => {
            setIsAddStaffModalOpen(true);
            setIsMobileMenuOpen(false);
          },
        },
        {
          name: "Manage Staff",
          onClick: () => {
            router.push("/dashboard/staff/manage");
            setIsMobileMenuOpen(false);
          },
        },
      ],
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      label: "Orders",
      onClick: () => {
        router.push("/dashboard/orders");
        setIsMobileMenuOpen(false);
      },
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
          />
        </svg>
      ),
    },
    {
      label: "Audit",
      onClick: () => {
        router.push("/dashboard/audit");
        setIsMobileMenuOpen(false);
      },
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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
      ),
    },
    {
      label: "Settings",
      onClick: () => {
        router.push("/dashboard/setting");
        setIsMobileMenuOpen(false);
      },
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
  ];

  // Helper function to filter navigation based on user permissions & roles
  const getFilteredNavItems = () => {
    // If the user is admin, return everything without checking permissions
    const isAdmin = userData.role === "admin";

    return navItems
      .map((item) => {
        // If admin, return the item as-is
        if (isAdmin) return item;

        // Otherwise, filter sub-items (Add Product/Coupon/Staff)
        if (item.hasDropdown && item.subItems) {
          let moduleKey = item.dropdownKey;
          if (moduleKey === "products") moduleKey = "product";
          if (moduleKey === "coupons") moduleKey = "coupon";

          const canWrite = userData.permissions?.[moduleKey]?.includes("w");

          const filteredSubItems = item.subItems.filter((sub) => {
            // If it's an "Add" action, user must have 'w' permission
            if (sub.name.startsWith("Add ")) return canWrite;
            return true; // "Manage" is always shown if module is accessible
          });

          return { ...item, subItems: filteredSubItems };
        }
        return item;
      })
      .filter((item) => {
        // If admin, show all top-level items
        if (isAdmin) return true;

        // Otherwise, filter modules based on 'r' (read) permission
        if (item.label === "Products")
          return userData.permissions?.product?.includes("r");
        if (item.label === "Coupons")
          return userData.permissions?.coupon?.includes("r");
        if (item.label === "Staff")
          return userData.permissions?.staff?.includes("r");
        if (item.label === "Orders")
          return userData.permissions?.order?.includes("r");
        if (item.label === "Audit")
          return userData.permissions?.order?.includes("r");

        // Settings/Audit (if needed) - strictly admin only or specific permission
        if (item.label === "Settings") return false;

        return true;
      });
  };

  const NavItem = ({
    label,
    icon,
    hasDropdown,
    dropdownKey,
    subItems,
    active,
    onClick,
  }) => {
    const isOpen = openDropdown === dropdownKey;

    return (
      <div className="gsap-sidebar-item w-full">
        {hasDropdown ? (
          <button
            onClick={() => {
              toggleDropdown(dropdownKey);
              onClick();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[14px] font-medium transition-all duration-300 ${
              isOpen || active
                ? "text-rose-500 bg-rose-50/50"
                : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
            }`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <span>{label}</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-rose-400" : "text-stone-400"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        ) : (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onClick();
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-medium transition-all duration-300 ${
              active
                ? "text-rose-500 bg-rose-50/60 font-semibold"
                : "text-stone-500 hover:bg-stone-50 hover:text-stone-800"
            }`}
          >
            {icon}
            <span>{label}</span>
          </a>
        )}

        {hasDropdown && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out pl-9 ${
              isOpen
                ? "max-h-40 opacity-100 mt-1 space-y-1"
                : "max-h-0 opacity-0"
            }`}
          >
            {subItems.map((sub, idx) => {
              if (sub.onClick) {
                return (
                  <button
                    key={idx}
                    onClick={sub.onClick}
                    className="w-full text-left block py-2 px-3 text-[13px] text-stone-400 hover:text-rose-400 transition-colors rounded-xl focus:outline-none"
                  >
                    {sub.name}
                  </button>
                );
              }
              return (
                <a
                  key={idx}
                  href="#"
                  className="block py-2 px-3 text-[13px] text-stone-400 hover:text-rose-400 transition-colors rounded-xl"
                >
                  {sub.name}
                </a>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const NavigationLinks = () => {
    // Generate the filtered nav items before mapping them to components
    const filteredNavItems = getFilteredNavItems();

    return (
      <nav className="space-y-1.5 px-2">
        {filteredNavItems.map((item, index) => (
          <NavItem
            key={index}
            {...item}
            active={activeNav === item.label}
            onClick={() => {
              setActiveNav(item.label);
              if (!item.hasDropdown) {
                setOpenDropdown(null);
              }
              if (item.onClick) item.onClick();
            }}
          />
        ))}
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf9f9] font-sans text-stone-600 antialiased">
      <aside
        ref={sidebarRef}
        className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-stone-100 flex-col px-4 py-6 z-20"
      >
        {/* DESKTOP LOGO AND USER EMAIL SECTION */}
        <div className="flex items-center gap-3 px-4 mb-10">
          {userData.profile_img ? (
            <img
              src={userData.profile_img}
              alt="Profile"
              className="w-9 h-9 rounded-xl object-cover"
            />
          ) : (
            <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center rotate-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-rose-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-md font-medium tracking-tight text-stone-800">
              {userData.full_name || "Studio Panel"}
            </span>
            {userData.email && (
              <span className="text-[11px] text-stone-500 truncate max-w-[140px]">
                {userData.email}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavigationLinks />
        </div>
        <div className="px-4 py-6 border-t border-stone-100">
          <button
            onClick={handleLogout}
            className="w-full h-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-medium text-stone-500 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <header className="md:hidden flex items-center justify-between bg-white px-5 py-4 border-b border-stone-100 sticky top-0 z-30">
        {/* MOBILE LOGO AND USER EMAIL SECTION */}
        <div className="flex items-center gap-3">
          {userData.profile_img ? (
            <img
              src={userData.profile_img}
              alt="Profile"
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center rotate-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-rose-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium tracking-tight text-stone-800">
              {userData.full_name || "Studio Panel"}
            </span>
            {userData.email && (
              <span className="text-[10px] text-stone-500 truncate max-w-[120px]">
                {userData.email}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 text-stone-500 hover:text-stone-800 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-stone-900/10 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-xs bg-white h-full shadow-xl flex flex-col p-4 z-50">
            <div className="mt-12 flex-1 overflow-y-auto">
              <NavigationLinks />
            </div>
            <div className="border-t border-stone-100 pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-medium text-stone-500 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
      />
      <AddCouponModal
        isOpen={isAddCouponModalOpen}
        onClose={() => setIsAddCouponModalOpen(false)}
      />
      <AddStaffModal
        isOpen={isAddStaffModalOpen}
        onClose={() => setIsAddStaffModalOpen(false)}
      />

      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-(--size-xl) w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
