'use server'

import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function signup(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient()

  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 1. Check if a super admin already exists
  const { data: existingSuperAdmin, error: queryError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('role', 'super_admin')
    .limit(1)
    .single()

  if (queryError && queryError.code !== 'PGRST116') {
    // An actual error occurred, not just "no rows found"
    return { error: { message: 'Database error checking for super admin.' } }
  }

  if (existingSuperAdmin) {
    return { error: { message: 'A super admin already exists. Sign-up is disabled.' } }
  }

  // 2. If no super admin, proceed with sign-up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: 'super_admin',
      },
    },
  })

  if (error) {
    return { error }
  }

  return { data }
}
