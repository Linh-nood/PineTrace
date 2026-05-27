import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validate passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Mật khẩu không khớp' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Mật khẩu phải ít nhất 8 ký tự' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email không hợp lệ' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`,
      },
    })

    if (error) {
      console.error('Signup error:', error)

      // Handle specific error cases
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Email này đã được đăng ký' },
          { status: 400 }
        )
      }
      if (error.message.includes('Password')) {
        return NextResponse.json(
          { error: 'Mật khẩu không đủ mạnh' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Đăng ký thất bại: ' + error.message },
        { status: 400 }
      )
    }

    // Create profile in database
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: data.user.id,
            email: data.user.email,
          },
          { onConflict: 'id' }
        )

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra, vui lòng thử lại' },
      { status: 500 }
    )
  }
}
