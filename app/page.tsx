import { createClient } from './utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Nếu đã đăng nhập, chuyển hướng đến Dashboard
  if (user) {
    redirect('/dashboard')
  }

  // Nếu chưa đăng nhập, chuyển hướng đến Login
  redirect('/login')
}