'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../utils/supabase/server'

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email) {
    redirect('/forgot-password?error=Vui lòng nhập email')
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
    })

    if (error) {
      console.error('Reset password error:', error)
      redirect('/forgot-password?error=Không thể gửi email đặt lại mật khẩu')
    }

    redirect('/forgot-password?success=Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra inbox của bạn')
  } catch (error) {
    console.error('Unexpected error:', error)
    redirect('/forgot-password?error=Có lỗi xảy ra, vui lòng thử lại')
  }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    redirect('/reset-password?error=Mật khẩu không khớp')
  }

  if (password.length < 8) {
    redirect('/reset-password?error=Mật khẩu phải ít nhất 8 ký tự')
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      console.error('Update password error:', error)
      redirect('/reset-password?error=Không thể cập nhật mật khẩu')
    }

    redirect('/login?success=Mật khẩu đã được cập nhật. Vui lòng đăng nhập')
  } catch (error) {
    console.error('Unexpected error:', error)
    redirect('/reset-password?error=Có lỗi xảy ra, vui lòng thử lại')
  }
}
