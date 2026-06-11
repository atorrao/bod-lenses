import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Exchange auth code for session (magic link flow)
  const { searchParams, pathname } = new URL(request.url)
  const code = searchParams.get('code')

  if (code && pathname === '/auth/callback') {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Get session to check approval
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('optica_profiles')
          .select('status')
          .eq('id', session.user.id)
          .single()

        if (profile?.status === 'approved') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        } else {
          await supabase.auth.signOut()
          return NextResponse.redirect(new URL('/?pending=1', request.url))
        }
      }
    }
    return NextResponse.redirect(new URL('/?error=1', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/auth/callback'],
}
