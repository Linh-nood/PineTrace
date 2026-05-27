// app/components/Navbar.tsx
'use client';

import { createClient } from '../utils/supabase/client';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string>('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };
    
    getUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(''), 3000);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleSignout = useCallback(async () => {
    try {
      setNotification('Đang đăng xuất...');
      const response = await fetch('/api/auth/signout', { method: 'POST' });
      if (response.ok) {
        setNotification('Đã đăng xuất thành công');
        // Wait a moment then redirect
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      } else {
        setNotification('Lỗi khi đăng xuất');
      }
    } catch (error) {
      console.error('Signout error:', error);
      setNotification('Có lỗi xảy ra khi đăng xuất');
    }
  }, [router]);

  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-[#00a67d] to-[#007a5a] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PT</span>
            </div>
            <span className="font-bold text-lg text-[#007a5a]">PineTrace</span>
          </Link>
          
          {/* Right Menu */}
          <div>
            {isLoading ? (
              <div className="text-gray-400 text-sm">Đang tải...</div>
            ) : user ? (
              /* NẾU ĐÃ ĐĂNG NHẬP */
              <div className="flex gap-6 items-center">
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-[#00a67d] font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  className="text-gray-600 hover:text-[#00a67d] font-medium transition-colors"
                >
                  Hồ sơ
                </Link>
                <Link 
                  href="/settings" 
                  className="text-gray-600 hover:text-[#00a67d] font-medium transition-colors"
                >
                  Cài đặt
                </Link>
                <button 
                  onClick={handleSignout}
                  className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                  disabled={notification.includes('Đang đăng xuất')}
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              /* NẾU CHƯA ĐĂNG NHẬP */
              <Link 
                href="/login" 
                className="bg-[#00a67d] hover:bg-[#008f6b] text-white px-6 py-2 rounded-lg font-medium transition-all hover:shadow-md"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}