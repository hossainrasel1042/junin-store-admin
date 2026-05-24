'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Image from "next/image"
export default function SettingsPage() {
  const pageRef = useRef(null);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [adminForm, setAdminForm] = useState({
    id: '',
    email: '',
    password: '',
    phone: '',
    role: 'admin',
    profileImg: null, 
    existingImgUrl: '',
    permissions: {}
  });

  useGSAP(() => {
    if (isAuthorized && !isLoading) {
      gsap.from('.gsap-fade-up', { y: 15, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' });
    }
  }, [isAuthorized, isLoading]);

  useGSAP(() => {
    if (isSuccess) {
      gsap.fromTo('.success-toast', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
    }
  }, [isSuccess]);

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login'); // Redirect if no token
          return;
        }

        // Decode JWT payload to check role and get ID
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));

        if (decodedPayload.role !== 'admin') {
          setError('Access Denied: This page is restricted to administrators only.');
          setIsLoading(false);
          return;
        }

        setIsAuthorized(true);
        
        // Fetch current admin's data using the existing staff API
        const res = await fetch(`/api/staff/${decodedPayload.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || 'Failed to fetch profile data');

        const user = data.data;

        setAdminForm(prev => ({
          ...prev,
          id: user.id,
          email: user.email || '',
          phone: user.phone || '',
          existingImgUrl: user.profile_img || '',
          permissions: user.permissions || {}
        }));

      } catch (err) {
        setError(err.message || 'Failed to authenticate user session.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeProfile();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (error) setError('');
    setAdminForm(prev => ({ ...prev, profileImg: { file, preview: URL.createObjectURL(file) } }));
  };

  const removeImage = () => {
    setAdminForm(prev => ({ ...prev, profileImg: null, existingImgUrl: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('id', adminForm.id);
      formData.append('email', adminForm.email);
      if (adminForm.password) formData.append('password', adminForm.password);
      if (adminForm.phone) formData.append('phone', adminForm.phone);
      formData.append('role', 'admin'); 
      
      formData.append('permissions', JSON.stringify(adminForm.permissions));

      if (adminForm.profileImg?.file) {
        formData.append('profile_img', adminForm.profileImg.file);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/staff/update', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to update profile');

      setIsSuccess(true);
      setAdminForm(prev => ({ ...prev, password: '' })); // Clear password field after save
      
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);

    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <svg className="animate-spin h-6 w-6 text-rose-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-stone-800 tracking-tight">Access Denied</h1>
        <p className="text-sm text-stone-500 mt-2">{error}</p>
        <button onClick={() => router.push('/dashboard')} className="mt-8 px-5 py-2.5 text-xs font-medium text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition-all duration-300">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const displayPreview = adminForm.profileImg?.preview || adminForm.existingImgUrl;

  return (
    <div ref={pageRef} className="max-w-2xl mx-auto space-y-8 relative">
      
      {/* Success Toast */}
      {isSuccess && (
        <div className="success-toast fixed top-8 left-1/2 -translate-x-1/2 z-[60] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.3)] font-medium text-sm flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Admin profile updated successfully!
        </div>
      )}

      <div className="gsap-fade-up">
        <h1 className="text-xl font-medium tracking-tight text-stone-800">Account Settings</h1>
        <p className="text-stone-400 text-xs font-light mt-1">Manage your administrator profile and security credentials.</p>
      </div>

      {error && (
        <div className="gsap-fade-up p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs font-medium">
          {error}
        </div>
      )}

      <div className="gsap-fade-up bg-white rounded-3xl border border-stone-100 shadow-[0_10px_40px_rgb(0,0,0,0.02)] p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Profile Upload Area */}
          <div className="flex items-center gap-6 pb-6 border-b border-stone-50">
            <div className="relative shrink-0">
              {displayPreview ? (
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-stone-100 group relative shadow-sm">
                  <Image src={displayPreview} alt="Admin profile" className="w-full h-full object-cover" />
                  {!isSaving && (
                    <button type="button" onClick={removeImage} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              ) : (
                <label className={`w-20 h-20 flex flex-col items-center justify-center rounded-full border-2 border-dashed border-stone-200 text-stone-400 transition-colors duration-300 ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:border-rose-300 hover:text-rose-400 hover:bg-rose-50/50 cursor-pointer'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <span className="text-[10px] font-medium uppercase tracking-wide">Upload</span>
                  <input type="file" accept="image/*" disabled={isSaving} className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-stone-800">Profile Picture</h3>
              <p className="text-xs text-stone-400 mt-1">PNG, JPG or WEBP under 5MB</p>
            </div>
          </div>

          {/* Account Details Form */}
          <div className="space-y-5">
            <div>
              <label className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5" htmlFor="email">Administrator Email</label>
              <input id="email" name="email" type="email" required disabled={isSaving} value={adminForm.email} onChange={handleInputChange} className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm placeholder-stone-300 disabled:opacity-50" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5" htmlFor="password">Update Password</label>
                <input id="password" name="password" type="password" disabled={isSaving} value={adminForm.password} onChange={handleInputChange} className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm placeholder-stone-300 disabled:opacity-50" placeholder="Leave blank to keep current" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5" htmlFor="phone">Phone Number</label>
                <input id="phone" name="phone" type="tel" disabled={isSaving} value={adminForm.phone} onChange={handleInputChange} className="w-full px-1 py-1.5 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 text-sm placeholder-stone-300 disabled:opacity-50" placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            
            <div>
              <label className="block text-[12px] font-medium text-rose-400 mb-1 ml-0.5" htmlFor="role">Account Role</label>
              <input id="role" name="role" type="text" disabled value="System Admin" className="w-full px-1 py-1.5 bg-transparent border-b border-stone-100 text-stone-400 text-sm cursor-not-allowed opacity-70" />
              <p className="text-[10px] text-stone-400 ml-0.5 mt-1">Your role cannot be downgraded from this panel.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSaving} className="px-6 py-2.5 text-xs font-medium text-white bg-rose-400 hover:bg-rose-500 rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(251,113,133,0.2)] disabled:opacity-50 flex items-center gap-2">
              {isSaving ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Saving Changes...
                </>
              ) : 'Save Profile Settings'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}