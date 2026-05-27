'use client';

import { resetPassword } from './actions'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const success = searchParams.get('success')
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-[#eefaf5] to-[#e0f5ed] p-4">
      {/* Logo & Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-[#007a5a] mb-2">PineTrace</h1>
        <p className="text-gray-600 text-sm">Theo dõi lộ trình chạy bộ tại Đà Lạt</p>
      </div>

      {/* Reset Password Card */}
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm mb-4 inline-block">
          ← Quay lại đăng nhập
        </Link>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Đặt lại mật khẩu</h2>
          <p className="text-gray-500 text-sm mt-1">Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Reset Form */}
        <form action={resetPassword} className="space-y-4">
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

          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() => setIsSubmitting(true)}
            className="w-full bg-[#00a67d] text-white py-2 rounded-lg font-semibold hover:bg-[#008f6b] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi hướng dẫn'}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-xs text-center">
            Không nhận được email?{' '}
            <a href="#" className="text-[#00a67d] hover:underline font-semibold">
              Liên hệ hỗ trợ
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-gray-500 text-xs mt-8 text-center">
        Cần tạo tài khoản?{' '}
        <Link href="/signup" className="text-[#00a67d] hover:underline font-semibold">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  )
}
