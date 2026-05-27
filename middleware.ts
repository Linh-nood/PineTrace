import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session để đảm bảo token còn hiệu lực
  const { data: { user } } = await supabase.auth.getUser()

  // NẾU CHƯA ĐĂNG NHẬP: Không cho vào Dashboard, Settings, Profile
  if (!user && (request.nextUrl.pathname.startsWith('/dashboard') || 
                  request.nextUrl.pathname.startsWith('/settings') ||
                  request.nextUrl.pathname.startsWith('/profile'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // NẾU ĐÃ ĐĂNG NHẬP: Không cho quay lại trang Login
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // NẾU ĐÃ ĐĂNG NHẬP: Không cho quay lại trang Signup
  if (user && request.nextUrl.pathname === '/signup') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/settings/:path*', '/profile/:path*'],
}