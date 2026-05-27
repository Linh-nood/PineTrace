'use client';

import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { updateProfile, deleteAccount } from './actions'

interface Profile {
  id: string
  email: string
  full_name?: string
  bio?: string
  avatar_url?: string
}

export default function ProfileClient({ 
  user, 
  profile 
}: { 
  user: User
  profile: Profile | null
}) {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const success = searchParams.get('success')
  const router = useRouter()
  const [isEditMode, setIsEditMode] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(formData)

    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      setIsEditMode(false)
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } else {
      setMessage({ type: 'error', text: result.error })
    }
    setIsLoading(false)
  }

  const handleDeleteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await deleteAccount(formData)

    if (result.success) {
      // Redirect to login after account deletion
      setTimeout(() => {
        router.push('/login?success=' + encodeURIComponent(result.message))
      }, 1000)
    } else {
      setMessage({ type: 'error', text: result.error })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-linear-to-r from-[#00a67d] to-[#008f6b] text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="text-white hover:text-gray-100 text-sm mb-4 inline-block">
            ← Quay lại Dashboard
          </Link>
          <h1 className="text-4xl font-bold">Hồ sơ của bạn</h1>
          <p className="text-gray-100 mt-2">Quản lý thông tin cá nhân</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Messages */}
        {(error || message?.type === 'error') && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{message?.text || error}</p>
          </div>
        )}
        {(success || message?.type === 'success') && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm font-medium">{message?.text || success}</p>
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h2>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="px-4 py-2 bg-[#00a67d] hover:bg-[#008f6b] text-white rounded-lg font-medium transition-colors"
            >
              {isEditMode ? 'Hủy' : 'Chỉnh sửa'}
            </button>
          </div>

          {isEditMode ? (
            /* Edit Mode */
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
                <p className="text-gray-500 text-xs mt-1">Email không thể thay đổi</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                <input
                  name="fullName"
                  type="text"
                  placeholder="Nhập họ tên"
                  defaultValue={profile?.full_name || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a67d] focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiểu sử</label>
                <textarea
                  name="bio"
                  placeholder="Viết về bản thân (tùy chọn)"
                  defaultValue={profile?.bio || ''}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a67d] focus:border-transparent outline-none transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00a67d] hover:bg-[#008f6b] disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold transition-colors"
              >
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                <p className="text-gray-800 font-medium">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Họ tên</label>
                <p className="text-gray-800 font-medium">{profile?.full_name || 'Chưa cập nhật'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Tiểu sử</label>
                <p className="text-gray-800">{profile?.bio || 'Chưa cập nhật'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Ngày tạo tài khoản</label>
                <p className="text-gray-800">
                  {new Date(user.created_at!).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Cài đặt tài khoản</h2>

          <div className="space-y-4">
            <Link
              href="/settings"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-800">Kết nối Strava</h3>
              <p className="text-gray-600 text-sm mt-1">Quản lý kết nối với Strava</p>
            </Link>

            <Link
              href="/login"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-800">Thay đổi mật khẩu</h3>
              <p className="text-gray-600 text-sm mt-1">Cập nhật mật khẩu của bạn</p>
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-l-4 border-red-400 p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Vùng nguy hiểm</h2>
          <p className="text-red-700 text-sm mb-4">
            Các hành động này không thể hoàn tác. Vui lòng cẩn thận.
          </p>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            Xóa tài khoản
          </button>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-red-800 mb-4">Xóa tài khoản?</h3>
              <p className="text-gray-600 mb-4">
                Hành động này sẽ xóa tài khoản và tất cả dữ liệu của bạn vĩnh viễn. Điều này không thể được hoàn tác.
              </p>

              <form onSubmit={handleDeleteSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gõ <span className="font-bold text-red-600">DELETE</span> để xác nhận:
                  </label>
                  <input
                    name="confirmation"
                    type="text"
                    placeholder="DELETE"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false)
                      setDeleteConfirm('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={deleteConfirm !== 'DELETE' || isLoading}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Đang xóa...' : 'Xóa tài khoản'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
