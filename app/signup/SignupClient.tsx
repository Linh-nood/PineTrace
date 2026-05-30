'use client';

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function SignupClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')
  const success = searchParams.get('success')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const checkPasswordStrength = (pwd: string) => {
    setPassword(pwd)
    let strength = 0
    
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++
    
    setPasswordStrength(strength)
  }

  const getPasswordStrengthLabel = () => {
    const labels = ['', 'Yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh']
    const colors = ['', 'text-red-600', 'text-orange-600', 'text-yellow-600', 'text-green-600', 'text-green-700']
    return { label: labels[passwordStrength], color: colors[passwordStrength] }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setSubmissionError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmissionError(data.error || 'Có lỗi xảy ra')
        setIsLoading(false)
        return
      }

      // Success - redirect with success message
      router.push('/signup?success=' + encodeURIComponent(data.message))
    } catch (err) {
      console.error('Signup error:', err)
      setSubmissionError('Có lỗi xảy ra, vui lòng thử lại')
      setIsLoading(false)
    }
  }

  const strength = getPasswordStrengthLabel()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-[#eefaf5] to-[#e0f5ed] p-4">
      {/* Logo & Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-[#007a5a] mb-2">PineTrace</h1>
        <p className="text-gray-600 text-sm">Theo dõi lộ trình chạy bộ tại Đà Lạt</p>
      </div>

      {/* Signup Card */}
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tạo tài khoản</h2>
          <p className="text-gray-500 text-sm mt-1">Đăng ký để bắt đầu theo dõi hoạt động chạy bộ</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm font-medium">{success}</p>
            <p className="text-green-600 text-xs mt-2">Quay lại trang <Link href="/login" className="underline font-semibold">đăng nhập</Link></p>
          </div>
        )}

        {/* Error Message */}
        {(error || submissionError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error || submissionError}</p>
          </div>
        )}

        {/* Signup Form */}
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
            <p className="text-gray-500 text-xs mt-1">Sử dụng email sinh viên của bạn</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => checkPasswordStrength(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a67d] focus:border-transparent outline-none transition"
            />
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < passwordStrength ? 'bg-[#00a67d]' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${strength.color}`}>
                  Độ mạnh: {strength.label}
                </p>
              </div>
            )}
            <p className="text-gray-500 text-xs mt-1">
              ✓ Ít nhất 8 ký tự • Hỗn hợp chữ hoa, thường • Số & ký tự đặc biệt
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a67d] focus:border-transparent outline-none transition"
            />
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start gap-2 py-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#00a67d]"
            />
            <label htmlFor="terms" className="text-xs text-gray-600">
              Tôi đồng ý với{' '}
              <a href="#" className="text-[#00a67d] hover:underline">
                Điều khoản dịch vụ
              </a>{' '}
              và{' '}
              <a href="#" className="text-[#00a67d] hover:underline">
                Chính sách bảo mật
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00a67d] text-white py-2 rounded-lg font-semibold hover:bg-[#008f6b] transition-all duration-200 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 text-sm">hoặc</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-[#00a67d] font-semibold hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-gray-500 text-xs mt-8 text-center">
        Bằng cách tạo tài khoản, bạn đồng ý với{' '}
        <a href="#" className="text-[#00a67d] hover:underline">
          Điều khoản dịch vụ
        </a>
      </p>
    </div>
  )
}
