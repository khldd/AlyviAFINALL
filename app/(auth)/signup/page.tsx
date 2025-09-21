import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SignupForm } from './signup-form'
import { Building2 } from 'lucide-react'

export default async function SignupPage() {
  const supabase = createServerClient()

  // Check if a super admin already exists
  const { data: superAdmin, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('role', 'super_admin')
    .limit(1)
    .single()

  // If a super admin exists, or if there's an error other than "no rows found",
  // redirect to the login page.
  if (superAdmin || (error && error.code !== 'PGRST116')) {
    redirect('/auth/login?message=Sign-up is disabled.')
  }

  // If no super admin exists, render the sign-up form.
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-balance">Create Super Admin Account</h1>
          <p className="text-muted-foreground">This page is for setting up the first administrative user for AlyviaHR.</p>
        </div>

        <SignupForm />
      </div>
    </div>
  )
}
