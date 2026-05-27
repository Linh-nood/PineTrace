export const getStravaAuthUrl = () => {
  // 1. Lấy Client ID từ biến môi trường
  // Thử cả hai tiền tố để đảm bảo Next.js có thể đọc được ở cả Client và Server
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || process.env.STRAVA_CLIENT_ID;

  // 2. Kiểm tra an toàn: Nếu không có ID, báo lỗi ngay tại Console
  if (!clientId) {
    console.error("CRITICAL ERROR: STRAVA_CLIENT_ID is missing in .env.local");
    return "#"; 
  }

  const rootUrl = 'https://www.strava.com/oauth/authorize';
  
  // 3. Cấu hình các tham số gửi sang Strava
  const options = {
    client_id: clientId,
    redirect_uri: 'http://localhost:3000/api/auth/callback/strava',
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