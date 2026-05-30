'use client';

import { User } from '@supabase/supabase-js'
import { getStravaAuthUrl } from '../utils/strava'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Profile {
  id: string
  strava_access_token?: string
  strava_athlete_id?: string
}

export default function SettingsClient({ 
  user, 
  profile 
}: { 
  user: User
  profile: Profile | null
}) {
  const router = useRouter()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const isStravaConnected = profile?.strava_access_token ? true : false

  const handleDisconnectStrava = async () => {
    if (confirm('Bạn chắc chắn muốn ngắt kết nối Strava?')) {
      try {
        const response = await fetch('/api/settings/disconnect-strava', {
          method: 'POST',
        })

        const data = await response.json()

        if (response.ok) {
          alert('Đã ngắt kết nối Strava')
          router.refresh()
        } else {
          alert(`Lỗi khi ngắt kết nối: ${data.error || 'Lỗi không xác định'}`)
        }
      } catch (error) {
        console.error('Disconnect error:', error)
        alert('Lỗi khi ngắt kết nối: Không thể kết nối tới server')
      }
    }
  }

  const handleSyncActivities = async () => {
    setIsSyncing(true)
    setSyncMessage(null)
    try {
      const response = await fetch('/api/activities/sync', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setSyncMessage(`✓ Đã đồng bộ ${data.saved} hoạt động thành công!`)
        setTimeout(() => {
          router.refresh()
        }, 1500)
      } else {
        setSyncMessage(`✗ ${data.error || 'Lỗi không xác định'}`)
      }
    } catch (error) {
      console.error('Sync error:', error)
      setSyncMessage('✗ Có lỗi xảy ra khi đồng bộ')
    } finally {
      setIsSyncing(false)
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
          <h1 className="text-4xl font-bold">Cài đặt</h1>
          <p className="text-gray-100 mt-2">Quản lý tài khoản và kết nối Strava</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Profile Section */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin tài khoản</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
              <p className="text-gray-800 font-medium">{user.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">ID tài khoản</label>
              <p className="text-gray-500 text-sm font-mono">{user.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Ngày tạo</label>
              <p className="text-gray-800">
                {new Date(user.created_at!).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        {/* Strava Connection Section */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Kết nối Strava</h2>
              <p className="text-gray-600 text-sm mt-1">Tự động đồng bộ hoạt động chạy bộ của bạn</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isStravaConnected
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isStravaConnected ? '✓ Đã kết nối' : '✗ Chưa kết nối'}
            </div>
          </div>

          {isStravaConnected ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium mb-2">✓ Tài khoản Strava đã kết nối thành công</p>
                <p className="text-green-700 text-sm">
                  PineTrace sẽ tự động đồng bộ các hoạt động chạy bộ mới từ Strava.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleDisconnectStrava}
                  className="px-6 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-lg font-medium transition-colors"
                >
                  Ngắt kết nối Strava
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Để xem các hoạt động chạy bộ của bạn, vui lòng kết nối tài khoản Strava.
              </p>
              
              <a
                href={getStravaAuthUrl()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FC5200] hover:bg-[#E94B00] text-white rounded-lg font-semibold transition-all hover:shadow-md"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.387 19.5c1.97 0 3.48-1.4 4.38-4h-3.99c-.44 0-.66-.12-.78-.42l-1.74-4.56c-.19-.42.08-1.04.74-1.04h4.2c1.97 0 3.48-1.4 4.38-4h-3.99c-.44 0-.66-.12-.78-.42l-1.74-4.56c-.19-.42.08-1.04.74-1.04h4.2c1.97 0 3.48-1.4 4.38-4h-3.99c-.44 0-.66-.12-.78-.42l-1.74-4.56c-.19-.42.08-1.04.74-1.04h4.2C25.876 0 27.386 1.4 28.286 4" />
                </svg>
                Kết nối với Strava
              </a>
            </div>
          )}
        </div>

        {/* Sync Activities Section */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Đồng bộ hoạt động</h2>
          <p className="text-gray-600 text-sm mb-6">
            Nhấn nút dưới để đồng bộ thủ công các hoạt động từ Strava vào PineTrace.
          </p>
          
          {syncMessage && (
            <div className={`mb-4 p-4 rounded-lg ${
              syncMessage.startsWith('✓')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {syncMessage}
            </div>
          )}
          
          <button
            onClick={handleSyncActivities}
            disabled={!isStravaConnected || isSyncing}
            className="px-6 py-3 bg-[#00a67d] hover:bg-[#008f6b] disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all hover:shadow-md disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSyncing ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                Đang đồng bộ...
              </>
            ) : (
              <>
                🔄 Đồng bộ ngay
              </>
            )}
          </button>
          
          {!isStravaConnected && (
            <p className="text-gray-500 text-sm mt-3">
              ⓘ Kết nối Strava trước để sử dụng tính năng này
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
