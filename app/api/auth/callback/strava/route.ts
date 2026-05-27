import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Không tìm thấy mã code' }, { status: 400 });
  }

  try {
    const params = new URLSearchParams();
    params.append('client_id', process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID!);
    params.append('client_secret', process.env.STRAVA_CLIENT_SECRET!);
    params.append('code', code);
    params.append('grant_type', 'authorization_code');

    // 1. Đổi code lấy Token từ Strava
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Lỗi từ Strava API:", data);
      return NextResponse.json({ error: 'Lỗi xác thực Strava', details: data });
    }

    // 2. Lấy thông tin người dùng đang đăng nhập từ Supabase
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 3. Cập nhật Token vào bảng profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          strava_access_token: data.access_token,
          strava_refresh_token: data.refresh_token,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error("Lỗi cập nhật Database:", updateError.message);
      } else {
        console.log("Cập nhật Token thành công cho sinh viên:", user.id);
      }
    }

    // 4. Quay lại trang chủ sau khi hoàn tất
    return NextResponse.redirect(new URL('/', request.url));

  } catch (err) {
    console.error("Lỗi hệ thống PineTrace:", err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
} // Dấu ngoặc này đóng hàm GET - Cực kỳ quan trọng!