'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../utils/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const fullName = formData.get('fullName') as string
  const bio = formData.get('bio') as string

  try {
    // Try using upsert instead of update
    const { error: upsertError, data: upsertData } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          full_name: fullName,
          bio: bio,
        },
        { onConflict: 'id' }
      )
      .select()

    if (upsertError) {
      console.error('Upsert error:', upsertError)
      return { success: false, error: `Lỗi cập nhật: ${upsertError.message}` }
    }

    if (!upsertData || upsertData.length === 0) {
      console.error('No rows upserted')
      return { success: false, error: 'Không thể cập nhật hồ sơ' }
    }

    console.log('Upsert success:', upsertData)
    revalidatePath('/')
    revalidatePath('/profile')
    return { success: true, message: 'Hồ sơ đã được cập nhật' }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Có lỗi xảy ra, vui lòng thử lại' }
  }
}

export async function deleteAccount(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const confirmation = formData.get('confirmation') as string

  if (confirmation !== 'DELETE') {
    return { success: false, error: 'Vui lòng gõ DELETE để xác nhận' }
  }

  try {
    // Delete profile data
    await supabase.from('profiles').delete().eq('id', user.id)

    // Delete auth user
    const { error } = await supabase.auth.admin.deleteUser(user.id)

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: 'Không thể xóa tài khoản' }
    }

    // Sign out
    await supabase.auth.signOut()
    revalidatePath('/')
    return { success: true, message: 'Tài khoản đã được xóa' }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: 'Có lỗi xảy ra, vui lòng thử lại' }
  }
}
