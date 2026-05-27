import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email và mật khẩu là bắt buộc' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error)
      return NextResponse.json(
        { error: 'Xác thực không thành công' },
        { status: 401 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Đăng nhập thành công'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra, vui lòng thử lại' },
      { status: 500 }
    )
  }
}
