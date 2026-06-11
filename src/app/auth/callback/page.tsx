'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handle = async () => {
      // Exchange the code in the URL for a session
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        router.push('/?error=1')
        return
      }

      // Check approval status
      const { data: profile } = await supabase
        .from('optica_profiles')
        .select('status')
        .eq('id', session.user.id)
        .single()

      if (profile?.status === 'approved') {
        router.push('/dashboard')
      } else {
        await supabase.auth.signOut()
        router.push('/?pending=1')
      }
    }

    handle()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-bod-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-400">A verificar acesso...</p>
      </div>
    </div>
  )
}
