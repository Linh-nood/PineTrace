export const getStravaAuthUrl = () => {
  // 1. Lấy Client ID từ biến môi trường
  // Thử cả hai tiền tố để đảm bảo Next.js có thể đọc được ở cả Client và Server
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || process.env.STRAVA_CLIENT_SECRET;

  // 2. Kiểm tra an toàn: Nếu không có ID, báo lỗi ngay tại Console
  if (!clientId) {
    console.error("CRITICAL ERROR: STRAVA_CLIENT_ID is missing in .env.local");
    return "#"; 
  }

  const rootUrl = 'https://www.strava.com/oauth/authorize';
  
  // 3. Cấu hình các tham số gửi sang Strava
  const options = {
    client_id: clientId,
    redirect_uri: process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/strava',
    response_type: 'code',
    // 'auto' giúp người dùng không phải nhấn "Cho phép" nhiều lần nếu đã làm rồi
    approval_prompt: 'auto', 
    // Quyền truy cập: đọc hồ sơ và các hoạt động (để lấy Polyline vẽ bản đồ)
    scope: 'read,activity:read_all',
  };

  // 4. Chuyển đổi object thành chuỗi query string (ví dụ: ?client_id=123&scope=...)
  const qs = new URLSearchParams(options).toString();
  
  return `${rootUrl}?${qs}`;
};

/**
 * Refresh Strava access token khi hết hạn
 * @param refreshToken - Token refresh từ database
 * @returns Token object mới hoặc null nếu thất bại
 */
export const refreshStravaToken = async (refreshToken: string) => {
  try {
    const params = new URLSearchParams();
    params.append('client_id', process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!);
    params.append('client_secret', process.env.STRAVA_CLIENT_SECRET!);
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      body: params,
    });

    if (!response.ok) {
      console.error('Lỗi refresh token Strava:', response.statusText);
      return null;
    }

    const data = await response.json();
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Error refreshing Strava token:', error);
    return null;
  }
};