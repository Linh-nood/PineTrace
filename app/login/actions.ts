'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Nếu lỗi, quay lại trang login kèm thông báo
    redirect('/login?error=Xác thực không thành công')
  }

  // Làm mới cache để Navbar cập nhật trạng thái mới nhất của User
  revalidatePath('/', 'layout')
  
  // Điều hướng thẳng vào Dashboard
  redirect('/dashboard')
}