'use client';

import { useSearchParams, useRouter } from 'next/navigation'
import { getStravaAuthUrl } from '../utils/strava'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')
  const [loginMethod, setLoginMethod] = useState<'email' | 'strava'>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setSubmissionError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmissionError(data.error || 'Có lỗi xảy ra')
        setIsLoading(false)
        return
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setSubmissionError('Có lỗi xảy ra, vui lòng thử lại')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-[#eefaf5] to-[#e0f5ed] p-4">
      {/* Logo & Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-[#007a5a] mb-2">PineTrace</h1>
        <p className="text-gray-600 text-sm">Theo dõi lộ trình chạy bộ tại Đà Lạt</p>
      </div>
      
      {/* Login Card */}
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Đăng nhập</h2>
        <p className="text-gray-500 text-sm mb-6">Chọn phương thức đăng nhập của bạn</p>
        
        {/* Error Message */}
        {(error || submissionError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error || submissionError}</p>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setLoginMethod('email')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
              loginMethod === 'email'
                ? 'bg-[#00a67d] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Email
          </button>
          <button
            onClick={() => setLoginMethod('strava')}
            className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${
              loginMethod === 'strava'
                ? 'bg-[#FC5200] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Strava
          </button>
        </div>

        {/* Email Login Form */}
        {loginMethod === 'email' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="email@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a67d] focus:border-transparent outline-none transition"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                <Link href="/forgot-password" className="text-[#00a67d] hover:underline text-xs font-medium">
                  Quên mật khẩu?
                </Link>
              </div>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a67d] focus:border-transparent outline-none transition"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00a67d] text-white py-2 rounded-lg font-semibold hover:bg-[#008f6b] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        ) : (
          /* Strava Login */
          <div className="space-y-4">
            <p className="text-gray-600 text-sm text-center">
              Đăng nhập bằng tài khoản Strava của bạn để tự động đồng bộ hoạt động chạy bộ.
            </p>
            <button
              onClick={() => window.open(getStravaAuthUrl(), 'StravaLogin', 'width=600,height=700,menubar=no,toolbar=no,scrollbars=yes')}
              className="w-full bg-[#FC5200] hover:bg-[#E94B00] text-white py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 19.5c1.97 0 3.48-1.4 4.38-4h-3.99c-.44 0-.66-.12-.78-.42l-1.74-4.56c-.19-.42.08-1.04.74-1.04h4.2c1.97 0 3.48-1.4 4.38-4h-3.99c-.44 0-.66-.12-.78-.42l-1.74-4.56c-.19-.42.08-1.04.74-1.04h4.2c1.97 0 3.48-1.4 4.38-4h-3.99c-.44 0-.66-.12-.78-.42l-1.74-4.56c-.19-.42.08-1.04.74-1.04h4.2C25.876 0 27.386 1.4 28.286 4" />
              </svg>
              Kết nối với Strava
            </button>
            <p className="text-gray-500 text-xs text-center">
              Bạn sẽ được chuyển hướng để xác thực tài khoản Strava
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6 w-full max-w-md">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-gray-500 text-sm">hoặc</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* Signup Link */}
      <div className="bg-white p-6 rounded-2xl w-full max-w-md border border-gray-100 text-center">
        <p className="text-gray-600 text-sm">
          Chưa có tài khoản?{' '}
          <Link href="/signup" className="text-[#00a67d] font-semibold hover:underline">
            Tạo tài khoản ngay
          </Link>
        </p>
      </div>

      {/* Footer */}
      <p className="text-gray-500 text-xs mt-8 text-center">
        Bằng cách đăng nhập, bạn đồng ý với <a href="#" className="text-[#00a67d] hover:underline">Điều khoản dịch vụ</a>
      </p>
    </div>
  )
}
