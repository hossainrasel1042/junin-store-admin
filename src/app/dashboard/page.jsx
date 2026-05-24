'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function DashboardPage() {
  const pageRef = useRef(null);
  useGSAP(() => {
    gsap.from('.gsap-fade-up', {
      y: 15,
      opacity: 0,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power2.out',
    });
  }, { scope: pageRef });

  return (
    <div ref={pageRef} className="space-y-8">
      <div className="gsap-fade-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-stone-800">Analytics Overview</h1>
          <p className="text-stone-400 text-xs font-light mt-1">Metrics look healthy. Here is what is happening today.</p>
        </div>
        <div>
          <button className="inline-flex items-center justify-center py-2 px-4 rounded-xl text-xs font-medium text-white bg-rose-400 hover:bg-rose-500 transition-all duration-300 shadow-[0_4px_12px_rgba(251,113,133,0.25)]">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="gsap-fade-up bg-white rounded-2xl border border-stone-100 p-6 shadow-[0_10px_35px_rgb(0,0,0,0.015)]">
          <div className="flex justify-between items-start">
            <span className="text-[13px] text-stone-400 font-light">Gross Performance</span>
            <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center text-rose-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-semibold tracking-tight text-stone-800">$14,235</h3>
            <span className="text-[11px] text-rose-400 font-medium bg-rose-50/50 px-2 py-0.5 rounded-md mt-1 inline-block">
              +12.4% this week
            </span>
          </div>
        </div>

        <div className="gsap-fade-up bg-white rounded-2xl border border-stone-100 p-6 shadow-[0_10px_35px_rgb(0,0,0,0.015)]">
          <div className="flex justify-between items-start">
            <span className="text-[13px] text-stone-400 font-light">Active Coupons</span>
            <div className="w-7 h-7 bg-stone-50 rounded-lg flex items-center justify-center text-stone-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20a1 1 0 02-1-1v-1a5 5 0 0110 0v1a1 1 0 02-1 1H6zm7-13h6m-6 4h6m-6 4h6" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-semibold tracking-tight text-stone-800">28 Active</h3>
            <span className="text-[11px] text-stone-400 font-light mt-1 inline-block">
              4 expiring within 48h
            </span>
          </div>
        </div>

        <div className="gsap-fade-up bg-white rounded-2xl border border-stone-100 p-6 shadow-[0_10px_35px_rgb(0,0,0,0.015)] sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <span className="text-[13px] text-stone-400 font-light">Staff Operations</span>
            <div className="w-7 h-7 bg-stone-50 rounded-lg flex items-center justify-center text-stone-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11V7a4 4 0 00-8 0v4c0 2.476.643 4.79 1.769 6.805m11.968-2.901A13.935 13.935 0 0019 11V7a4 4 0 00-8 0v4c0 2.476.643 4.79 1.769 6.805" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-semibold tracking-tight text-stone-800">98.2%</h3>
            <span className="text-[11px] text-stone-400 font-light mt-1 inline-block">
              All handlers fully online
            </span>
          </div>
        </div>
      </div>

      <div className="gsap-fade-up bg-white rounded-3xl border border-stone-100 shadow-[0_10px_40px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-50 flex items-center justify-between">
          <h3 className="text-[15px] font-medium text-stone-700">Recent System Activities</h3>
          <span className="text-xs text-rose-400 font-medium hover:underline cursor-pointer">View inventory</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 text-[11px] uppercase tracking-wider text-stone-400">
                <th className="py-3 px-6 font-medium">Item Details</th>
                <th className="py-3 px-6 font-medium">Category</th>
                <th className="py-3 px-6 font-medium">Status</th>
                <th className="py-3 px-6 font-medium text-right">Metric</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 text-[13px] text-stone-600">
              <tr className="hover:bg-stone-50/40 transition-colors">
                <td className="py-3.5 px-6 font-medium text-stone-700">Minimalist Ceramic Vase</td>
                <td className="py-3.5 px-6 text-stone-400">Products</td>
                <td className="py-3.5 px-6">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600">In Stock</span>
                </td>
                <td className="py-3.5 px-6 text-right font-medium">$84.00</td>
              </tr>
              <tr className="hover:bg-stone-50/40 transition-colors">
                <td className="py-3.5 px-6 font-medium text-stone-700">SPRING25 Primary Drop</td>
                <td className="py-3.5 px-6 text-stone-400">Coupons</td>
                <td className="py-3.5 px-6">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-500">Active Campaign</span>
                </td>
                <td className="py-3.5 px-6 text-right font-medium">15% Off</td>
              </tr>
              <tr className="hover:bg-stone-50/40 transition-colors">
                <td className="py-3.5 px-6 font-medium text-stone-700">Elena Rostova</td>
                <td className="py-3.5 px-6 text-stone-400">Staff</td>
                <td className="py-3.5 px-6">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-600">Manager</span>
                </td>
                <td className="py-3.5 px-6 text-right text-stone-400">Updated 10m ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
