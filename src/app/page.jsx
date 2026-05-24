'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const containerRef = useRef(null);

  useEffect(() => {
    if (document.cookie.includes('token=')) {
      router.push('/dashboard');
    }
  }, [router]);

  useGSAP(() => {
    gsap.from('.gsap-fade-up', {
      y: 20, 
      opacity: 0,
      duration: 1, 
      stagger: 0.1,
      ease: 'power2.out',
    });
  }, { scope: containerRef });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const token = data.data.token;
        localStorage.setItem('token', token);
        document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
              router.push('/dashboard');
      } else {
        setErrorMessage(data.message || 'Login failed. Please check your credentials.');
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMessage('A network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-[#faf9f9] p-4 font-sans text-stone-600"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.03)] border border-stone-100 overflow-hidden px-8 py-10 gsap-fade-up">
        
        <div className="text-center mb-10">
          <div className="mx-auto w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-5 rotate-3 transition-transform hover:rotate-0 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-rose-400">Welcome back</h2>
          <p className="text-stone-400 mt-2 text-sm font-light">Please enter your details to sign in.</p>
        </div>

        {errorMessage && (
          <div className="gsap-fade-up mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          
          <div className="gsap-fade-up relative group">
            <label className="block text-[13px] font-medium text-rose-400 mb-1.5 ml-1" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-1 py-2 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 placeholder-stone-300"
                placeholder="hello@example.com"
              />
            </div>
          </div>

          <div className="gsap-fade-up relative group">
            <label className="block text-[13px] font-medium text-rose-400 mb-1.5 ml-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-1 py-2 bg-transparent border-b border-stone-200 focus:border-rose-300 focus:outline-none transition-colors duration-300 text-stone-700 placeholder-stone-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="gsap-fade-up pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 rounded-2xl text-sm font-medium text-white bg-rose-400 hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-200 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(251,113,133,0.39)] hover:shadow-[0_6px_20px_rgba(251,113,133,0.23)]"
            >
              <span className="relative flex items-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}