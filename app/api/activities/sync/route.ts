import { NextResponse } from 'next/server';
import { createClient } from '../../../utils/supabase/server';
import { getValidStravaToken } from '../../../utils/strava-api';

export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}

async function handleSync(request: Request) {
  const supabase = await createClient();
  
  // 1. Xác thực người dùng đang đăng nhập
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Lấy valid Strava token (tự động refresh nếu hết hạn)
    const stravaToken = await getValidStravaToken(user.id);
    
    if (!stravaToken) {
      return NextResponse.json({ 
        error: 'Chưa kết nối Strava. Vui lòng kết nối tài khoản Strava trước.' 
      }, { status: 400 });
    }

    // 3. Gọi Strava API lấy hoạt động
    const response = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=50', {
      headers: { 'Authorization': `Bearer ${stravaToken}` }
    });

    if (!response.ok) {
      console.error("Strava API Error:", response.status, response.statusText);
      return NextResponse.json({ 
        error: 'Không thể kết nối Strava API. Vui lòng kiểm tra token.' 
      }, { status: 400 });
    }

    const activities = await response.json();
    console.log(`Nhận được ${activities.length} hoạt động từ Strava`);

    let savedCount = 0;
    let errorCount = 0;

    // 4. Lưu dữ liệu vào Supabase
    if (Array.isArray(activities)) {
      for (const act of activities) {
        const { error } = await supabase.from('activities').upsert({
          user_id: user.id,
          strava_id: act.id.toString(),
          name: act.name || 'Hoạt động không tên',
          distance: act.distance,
          moving_time: act.moving_time,
          type: act.type,
          start_time: act.start_date,
          summary_polyline: act.map?.summary_polyline || '' 
        }, { onConflict: 'strava_id' });

        if (error) {
          console.error(`Lỗi lưu hoạt động ${act.id}:`, error.message);
          errorCount++;
        } else {
          savedCount++;
        }
      }
    }

    console.log(`Đồng bộ thành công: ${savedCount}, Lỗi: ${errorCount}`);

    // 5. Trả về kết quả (cho POST request) hoặc redirect (cho GET request)
    if (request.method === 'POST') {
      return NextResponse.json({
        success: true,
        message: `Đã đồng bộ ${savedCount} hoạt động`,
        saved: savedCount,
        errors: errorCount
      });
    } else {
      return NextResponse.redirect(new URL('/dashboard?sync=success', request.url));
    }

  } catch (error) {
    console.error("Lỗi hệ thống:", error);
    
    if (request.method === 'POST') {
      return NextResponse.json({
        error: 'Có lỗi xảy ra khi đồng bộ hoạt động. Vui lòng thử lại.'
      }, { status: 500 });
    } else {
      return NextResponse.redirect(new URL('/dashboard?sync=failed', request.url));
    }
  }
}