import { createClient } from '../../../utils/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Signout error:', error)
      return NextResponse.json(
        { error: 'Lỗi khi đăng xuất' },
        { status: 400 }
      )
    }
    
    // Revalidate to update the Navbar
    revalidatePath('/', 'layout')
    
    // Return success response (don't redirect - let client handle it)
    return NextResponse.json(
      { success: true, message: 'Đã đăng xuất thành công' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected signout error:', error)
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi đăng xuất' },
      { status: 500 }
    )
  }
}
