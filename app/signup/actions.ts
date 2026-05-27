'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate passwords match
  if (password !== confirmPassword) {
    redirect('/signup?error=Mật khẩu không khớp')
  }

  // Validate password length
  if (password.length < 8) {
    redirect('/signup?error=Mật khẩu phải ít nhất 8 ký tự')
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    redirect('/signup?error=Email không hợp lệ')
  }

  try {
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
        redirect('/signup?error=Email này đã được đăng ký')
      }
      if (error.message.includes('Password')) {
        redirect('/signup?error=Mật khẩu không đủ mạnh')
      }
      
      redirect('/signup?error=Đăng ký thất bại: ' + error.message)
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

    // Redirect to confirmation page
    redirect('/signup?success=Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản')
  } catch (error) {
    console.error('Unexpected error:', error)
    redirect('/signup?error=Có lỗi xảy ra, vui lòng thử lại')
  }
}
