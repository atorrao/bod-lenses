import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'bod2026admin'

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Password incorreta.' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('bod_admin', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })
  return response
}
