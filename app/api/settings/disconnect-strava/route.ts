import { createClient } from '../../../utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Xóa Strava tokens khỏi database
    const { error } = await supabase
      .from('profiles')
      .update({
        strava_access_token: null,
        strava_refresh_token: null,
        strava_athlete_id: null,
      })
      .eq('id', user.id)

    if (error) {
      console.error('Database update error:', error)
      return NextResponse.json({ error: error.message || 'Lỗi cập nhật database' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Đã ngắt kết nối Strava' })
  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Lỗi server' 
    }, { status: 500 })
  }
}
