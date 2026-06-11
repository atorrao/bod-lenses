'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { BRAND_IMAGES } from '@/lib/data'
import { Lock } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const login = async () => {
    if (!password) { setError('Indique a password.'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    setLoading(false)
    if (res.ok) { router.push('/admin/dashboard') }
    else { setError('Password incorreta.') }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bod-xlight px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src={BRAND_IMAGES.logo} alt="BOD Lenses" width={130} height={36}
            className="h-8 w-auto mx-auto mb-6" />
          <div className="w-12 h-12 bg-bod-dark rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={22} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-bod-dark mb-1">Painel Admin</h1>
          <p className="text-sm text-gray-400">Acesso exclusivo BOD Lenses</p>
        </div>
        <div className="card p-6 space-y-4">
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()} />
          </div>
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          <button className="btn-primary w-full py-3" onClick={login} disabled={loading}>
            {loading ? 'A verificar...' : 'Entrar no admin'}
          </button>
        </div>
      </div>
    </div>
  )
}
