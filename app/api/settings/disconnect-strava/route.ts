import { createClient } from '../../../utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
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
      console.error('Lỗi cập nhật database:', error)
      return NextResponse.json({ error: 'Lỗi cập nhật database' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Lỗi:', error)
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
