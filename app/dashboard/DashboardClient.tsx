'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Activity {
  id: number;
  user_id: string;
  strava_id: string;
  name: string;
  distance: number;
  moving_time: number;
  type: string;
  start_time: string;
  summary_polyline: string;
}

interface Profile {
  id: string;
  strava_access_token?: string;
}

// Load bản đồ ở Client, tắt Server Side Rendering (SSR)
const ActivityMap = dynamic(() => import('../components/ActivityMap'), { 
  ssr: false,
  loading: () => <div className="h-96 w-full bg-gray-100 animate-pulse flex items-center justify-center rounded-xl border border-gray-200">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a67d]"></div>
      <p className="text-gray-500 text-sm mt-2">Đang dựng bản đồ...</p>
    </div>
  </div>
});

export default function DashboardClient({ 
  activities: initialActivities, 
  profile 
}: { 
  activities: Activity[]
  profile?: Profile | null
}) {
  const [expandedActivityId, setExpandedActivityId] = useState<number | null>(null);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  
  const isStravaConnected = profile?.strava_access_token ? true : false;
  const hasActivities = activities.length > 0;

  // Tự động đồng bộ khi vào Dashboard lần đầu nếu chưa có hoạt động
  useEffect(() => {
    if (isStravaConnected && !hasActivities && !isSyncing) {
      handleAutoSync();
    }
  }, []);

  const handleAutoSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Đang đồng bộ hoạt động từ Strava...');
    
    try {
      const response = await fetch('/api/activities/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setSyncStatus(`✓ Đã đồng bộ ${data.saved} hoạt động`);
        // Reload trang để hiển thị hoạt động mới
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setSyncStatus(`✗ ${data.error || 'Lỗi đồng bộ'}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('✗ Có lỗi xảy ra khi đồng bộ');
    } finally {
      setIsSyncing(false);
    }
  };

  // Tính toán thống kê
  const totalDistance = activities.reduce((sum, act) => sum + act.distance, 0);
  const totalTime = activities.reduce((sum, act) => sum + act.moving_time, 0);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const formatPace = (movingTime: number, distance: number) => {
    // Tính pace theo giây/km
    const paceSeconds = (movingTime / (distance / 1000));
    const minutes = Math.floor(paceSeconds / 60);
    const seconds = Math.round(paceSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-linear-to-r from-[#00a67d] to-[#008f6b] text-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Lộ trình của bạn</h1>
          <p className="text-gray-100">Xem chi tiết các hoạt động chạy bộ đã được đồng bộ</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Sync Status */}
        {syncStatus && (
          <div className={`p-4 rounded-lg border ${
            syncStatus.startsWith('✓')
              ? 'bg-green-50 text-green-800 border-green-200'
              : syncStatus.startsWith('✗')
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}>
            {syncStatus}
          </div>
        )}

        {/* Strava Connection Alert */}
        {!isStravaConnected && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-orange-800 mb-2">Kết nối Strava để xem hoạt động</h3>
                <p className="text-orange-700 text-sm">
                  Bạn chưa kết nối tài khoản Strava. Hãy truy cập cài đặt để kết nối và bắt đầu theo dõi các hoạt động chạy bộ của bạn.
                </p>
              </div>
              <Link 
                href="/settings"
                className="ml-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                Kết nối ngay
              </Link>
            </div>
          </div>
        )}

        {/* Strava Connected Alert + Manual Sync */}
        {isStravaConnected && hasActivities && (
          <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-green-800 mb-2">✓ Strava đã kết nối</h3>
                <p className="text-green-700 text-sm">
                  Hoạt động của bạn đã được đồng bộ từ Strava. Nhấn nút bên cạnh để cập nhật hoạt động mới.
                </p>
              </div>
              <button
                onClick={handleAutoSync}
                disabled={isSyncing}
                className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors whitespace-nowrap disabled:cursor-not-allowed"
              >
                {isSyncing ? '⏳ Đồng bộ...' : '🔄 Cập nhật'}
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {activities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <p className="text-gray-600 text-sm font-medium mb-1">Tổng khoảng cách</p>
              <p className="text-3xl font-bold text-[#00a67d]">{(totalDistance / 1000).toFixed(1)} km</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <p className="text-gray-600 text-sm font-medium mb-1">Tổng thời gian</p>
              <p className="text-3xl font-bold text-[#00a67d]">{formatTime(totalTime)}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <p className="text-gray-600 text-sm font-medium mb-1">Số hoạt động</p>
              <p className="text-3xl font-bold text-[#00a67d]">{activities.length}</p>
            </div>
          </div>
        )}

        {/* Activities List */}
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow-md text-center border border-gray-200">
              <div className="text-gray-400 mb-4 text-4xl">📍</div>
              <p className="text-gray-600 text-lg font-medium">Chưa có hoạt động nào</p>
              <p className="text-gray-400 text-sm mt-1">
                {isStravaConnected 
                  ? 'Hoạt động của bạn sẽ được đồng bộ từ Strava'
                  : 'Hãy kết nối Strava để xem các hoạt động chạy bộ của bạn'
                }
              </p>
            </div>
          ) : (
            activities.map((act) => (
              <div 
                key={act.id} 
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Activity Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-800">{act.name}</h2>
                      <p className="text-gray-500 text-sm mt-1">
                        📅 {new Date(act.start_time).toLocaleDateString('vi-VN', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <span className="bg-[#00a67d] bg-opacity-10 text-[#00a67d] px-3 py-1 rounded-full text-sm font-medium">
                        {act.type}
                      </span>
                      <button
                        onClick={() => setExpandedActivityId(expandedActivityId === act.id ? null : act.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                          expandedActivityId === act.id
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {expandedActivityId === act.id ? '✕ Đóng Map' : '📍 Xem Map'}
                      </button>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-gray-500 text-xs font-medium">KHOẢNG CÁCH</p>
                      <p className="text-lg font-bold text-gray-800">{(act.distance / 1000).toFixed(2)} km</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium">THỜI GIAN</p>
                      <p className="text-lg font-bold text-gray-800">{formatTime(act.moving_time)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium">PACE</p>
                      <p className="text-lg font-bold text-gray-800">{formatPace(act.moving_time, act.distance)}/km</p>
                    </div>
                  </div>
                </div>

                {/* Map - Show when expanded */}
                {expandedActivityId === act.id && (
                  <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <ActivityMap encodedPolyline={act.summary_polyline} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}